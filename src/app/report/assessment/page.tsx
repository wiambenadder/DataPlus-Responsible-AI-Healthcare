"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { QUESTIONS } from "@/lib/assessment-q";

type FileStatus = {
  name: string;
  status: "uploading" | "processing" | "mapping" | "done" | "error";
};

type ExistingResponse = {
  id: string;
  question: string;
  answer: string;
  domain: string;
  Subtopic: string;
  reporting_period: string;
};

export default function ReportPage() {
  const router = useRouter();

  const [companyId, setCompanyId] = useState("");
  const [reportingPeriod, setReportingPeriod] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [fileStatuses, setFileStatuses] = useState<FileStatus[]>([]);

  // answers[i] corresponds to interviewQuestions[i]
  const [answers, setAnswers] = useState<string[]>([]);
  const [interviewQuestions, setInterviewQuestions] =
    useState<typeof QUESTIONS>([]);

  // One-time-entry + edit support
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [editingExisting, setEditingExisting] = useState(false);
  const [existingResponses, setExistingResponses] = useState<ExistingResponse[]>([]);
  // Snapshot of answers as they were when edit mode was entered, so we can
  // tell later whether the user actually changed anything.
  const [originalAnswers, setOriginalAnswers] = useState<string[]>([]);

  useEffect(() => {
    loadCompany();
  }, []);

  // Polls the uploads table until the PDF parser has finished extracting
  // text (extraction_status === "complete"), or until we give up.
  async function waitForExtraction(
    uploadId: string,
    maxAttempts = 20,
    intervalMs = 3000
  ): Promise<boolean> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const { data, error } = await supabase
        .from("uploads")
        .select("extraction_status")
        .eq("id", uploadId)
        .single();

      if (error) {
        console.error("Error polling extraction status:", error);
        return false;
      }

      if (data?.extraction_status === "complete") {
        return true;
      }

      if (data?.extraction_status === "error") {
        console.error("Extraction failed for upload", uploadId);
        return false;
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    console.error("Timed out waiting for extraction on upload", uploadId);
    return false;
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please log in");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      alert("No company linked to account");
      return;
    }

    const fileArray = Array.from(files);

    setFileStatuses(
      fileArray.map((f) => ({ name: f.name, status: "uploading" }))
    );

    for (let index = 0; index < fileArray.length; index++) {
      const file = fileArray[index];
      const filePath = `${Date.now()}-${file.name}`;

      const { data, error: uploadError } = await supabase.storage
        .from("reports")
        .upload(filePath, file);

      if (uploadError) {
        console.error(uploadError);
        setFileStatuses((prev) =>
          prev.map((f, i) => (i === index ? { ...f, status: "error" } : f))
        );
        continue;
      }

      const { data: upload, error: dbError } = await supabase
        .from("uploads")
        .insert({
          company_id: profile.company_id,
          file_name: file.name,
          file_type: file.type,
          file_url: data?.path,
        })
        .select("id")
        .single();

      if (dbError || !upload?.id) {
        console.error(dbError ?? "Upload record missing id");
        setFileStatuses((prev) =>
          prev.map((f, i) => (i === index ? { ...f, status: "error" } : f))
        );
        continue;
      }

      setFileStatuses((prev) =>
        prev.map((f, i) => (i === index ? { ...f, status: "processing" } : f))
      );

      const response = await fetch("/api/process-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId: upload.id }),
      });

      if (!response.ok) {
        setFileStatuses((prev) =>
          prev.map((f, i) => (i === index ? { ...f, status: "error" } : f))
        );
        continue;
      }

      setFileStatuses((prev) =>
        prev.map((f, i) => (i === index ? { ...f, status: "mapping" } : f))
      );

      const mappingResponse = await fetch("/api/map-domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId: upload.id }),
      });

      setFileStatuses((prev) =>
        prev.map((f, i) =>
          i === index
            ? { ...f, status: mappingResponse.ok ? "done" : "error" }
            : f
        )
      );
    }

    // Domain mapping may have just inserted new rows into domain_mapping,
    // so refresh the list of remaining/missing interview questions before
    // moving on to the interview itself.
    await loadInterviewQuestions(profile.company_id);

    setUploadComplete(true);
  }

  async function loadCompany() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      router.push("/company-setup");
      return;
    }

    setCompanyId(profile.company_id);

    // Check whether this company has already completed the interview.
    const { data: existing, error: existingError } = await supabase
      .from("qualitative_responses")
      .select("id, question, answer, domain, Subtopic, reporting_period")
      .eq("company_id", profile.company_id);

    if (existingError) {
      console.error("Error checking existing responses:", existingError);
    }

    if (existing && existing.length > 0) {
      setAlreadySubmitted(true);
      setExistingResponses(existing as ExistingResponse[]);
      setReportingPeriod(existing[0].reporting_period);
      return;
    }

    await loadInterviewQuestions(profile.company_id);
  }

  async function loadInterviewQuestions(companyId: string) {
    const { data: mappedTopics, error } = await supabase
      .from("domain_mapping")
      .select("domain, subtopic")
      .eq("company_id", companyId);

    if (error) {
      console.error("Error fetching domain_mapping:", error);
      setInterviewQuestions(QUESTIONS);
      setAnswers(Array(QUESTIONS.length).fill(""));
      return;
    }

    if (!mappedTopics || mappedTopics.length === 0) {
      setInterviewQuestions(QUESTIONS);
      setAnswers(Array(QUESTIONS.length).fill(""));
      return;
    }

    const missingQuestions = QUESTIONS.filter((question) => {
      return !mappedTopics.some(
        (mapping) =>
          mapping.domain.trim().toLowerCase() ===
            question.domain.trim().toLowerCase() &&
          mapping.subtopic.trim().toLowerCase() ===
            question.subtopic.trim().toLowerCase()
      );
    });

    setInterviewQuestions(missingQuestions);
    setAnswers(Array(missingQuestions.length).fill(""));
    setCurrentQuestion(0);
  }

  // Enter edit mode: reload the previously submitted Q&A into the interview
  // flow so the user can step through and change any answer.
  function startEdit() {
    const editQuestions = existingResponses.map((r) => ({
      question: r.question,
      domain: r.domain,
      subtopic: r.Subtopic,
    })) as typeof QUESTIONS;

    const startingAnswers = existingResponses.map((r) => r.answer);

    setInterviewQuestions(editQuestions);
    setAnswers(startingAnswers);
    setOriginalAnswers(startingAnswers);
    setCurrentQuestion(0);
    setUploadComplete(true); // skip the upload step when editing
    setEditingExisting(true);
  }

  function updateAnswer(value: string) {
    const updated = [...answers];
    updated[currentQuestion] = value;
    setAnswers(updated);
  }

  function previousQuestion() {
    if (currentQuestion === 0) return;
    setCurrentQuestion(currentQuestion - 1);
  }

  async function nextQuestion() {
    if (saving) return;

    if (!answers[currentQuestion]?.trim()) {
      alert("Please answer the question before continuing.");
      return;
    }

    if (currentQuestion < interviewQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      return;
    }

    await submitInterview();
  }

  async function submitInterview() {
    if (!reportingPeriod.trim()) {
      alert("Please enter a reporting period.");
      return;
    }

    setSaving(true);

    try {
      const rows = interviewQuestions.map((q, i) => ({
        company_id: companyId,
        reporting_period: reportingPeriod,
        question: q.question,
        answer: answers[i],
        domain: q.domain,
        Subtopic: q.subtopic,
      }));

      // If we're editing an existing submission, replace the old rows
      // instead of appending duplicates.
      if (editingExisting) {
        const { error: deleteError } = await supabase
          .from("qualitative_responses")
          .delete()
          .eq("company_id", companyId);

        if (deleteError) {
          alert(deleteError.message);
          return;
        }
      }

      const { error } = await supabase
        .from("qualitative_responses")
        .insert(rows);

      if (error) {
        alert(error.message);
        return;
      }

      if (!editingExisting) {
        // Fresh submission only: copy mapped evidence into
        // qualitative_responses. On edits, that transfer already
        // happened during the original submission, so skip it.
        const transferResponse = await fetch("/api/transfer-map", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company_id: companyId,
            reporting_period: reportingPeriod,
          }),
        });

        const transferResult = await transferResponse.json();

        if (!transferResponse.ok) {
          alert(transferResult.error || "Transfer failed.");
          return;
        }
      }

      // Run the AI assessment on a fresh submission always, or on an
      // edit only if the answers actually changed.
      const answersChanged =
        editingExisting &&
        (answers.length !== originalAnswers.length ||
          answers.some((a, i) => a !== originalAnswers[i]));

      if (!editingExisting || answersChanged) {
        await fetch("/api/run-ai-assessment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reporting_period: reportingPeriod,
            company_id: companyId,
          }),
        });
      }

      router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  }

  const progress =
    interviewQuestions.length === 0
      ? 0
      : ((currentQuestion + 1) / interviewQuestions.length) * 100;

  const stillWorking = fileStatuses.some(
    (f) =>
      f.status === "uploading" ||
      f.status === "processing" ||
      f.status === "mapping"
  );

  // Gate: already submitted and not currently editing -> show summary screen
  if (alreadySubmitted && !editingExisting) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-3xl mx-auto p-8">
          <div className="bg-white border rounded-3xl p-10 shadow-sm text-center">
            <h1 className="text-3xl font-bold mb-4">
              Assessment Already Submitted
            </h1>

            <p className="text-gray-600 mb-8">
              Your organization has already completed the assessment
              interview. You can review or edit your responses below.
            </p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={startEdit}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
              >
                Edit My Responses
              </button>

              <button
                onClick={() => router.push("/report/history")}
                className="border px-6 py-3 rounded-xl"
              >
                View Submission
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-2">Assessment Questionnaire</h1>

        <p className="text-gray-500 mb-8">
          Help us understand your organization's progress and challenges.
        </p>

        {!uploadComplete && (
          <div className="bg-white border rounded-2xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              Upload Supporting Documentation
            </h2>

            <p className="text-gray-600 mb-6">
              Upload brochures, reports, evaluations, or case studies. We'll
              analyze the documents before beginning the interview.
            </p>

            <input
              type="file"
              accept=".pdf"
              multiple
              onChange={handleUpload}
            />

            {fileStatuses.length > 0 && (
              <ul className="mt-6 space-y-1 text-sm">
                {fileStatuses.map((f) => (
                  <li key={f.name} className="flex justify-between">
                    <span>{f.name}</span>
                    <span
                      className={
                        f.status === "error"
                          ? "text-red-600"
                          : f.status === "done"
                          ? "text-green-600"
                          : "text-gray-500"
                      }
                    >
                      {f.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <button
              disabled={stillWorking}
              onClick={() => setUploadComplete(true)}
              className="mt-6 border rounded-xl px-5 py-3 disabled:opacity-50"
            >
              Continue Without Upload
            </button>
          </div>
        )}

        {uploadComplete && interviewQuestions.length === 0 && (
          <div className="bg-white border rounded-2xl shadow-sm p-8 text-center text-gray-500">
            All topics have already been covered. No questions remaining.
          </div>
        )}

        {uploadComplete && interviewQuestions.length > 0 && (
          <>
            <div className="mb-8">
              <label className="block text-sm font-medium mb-2">
                Reporting Period
              </label>

              <input
                className="w-full border p-3 rounded-xl"
                placeholder="Q2 2026"
                value={reportingPeriod}
                onChange={(e) => setReportingPeriod(e.target.value)}
                disabled={editingExisting}
              />
            </div>

            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Question {currentQuestion + 1}</span>
                <span>{interviewQuestions.length}</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm p-8">
              <div className="text-xl font-medium mb-6">
                🤖 {interviewQuestions[currentQuestion].question}
              </div>

              <textarea
                value={answers[currentQuestion] ?? ""}
                onChange={(e) => updateAnswer(e.target.value)}
                placeholder="Type your answer..."
                className="w-full h-40 border rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex justify-between mt-6">
                <button
                  onClick={previousQuestion}
                  disabled={currentQuestion === 0}
                  className="border px-6 py-3 rounded-xl disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  disabled={saving}
                  onClick={nextQuestion}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
                >
                  {saving
                    ? "Saving..."
                    : currentQuestion === interviewQuestions.length - 1
                    ? editingExisting
                      ? "Save Changes"
                      : "Submit Report"
                    : "Continue"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}