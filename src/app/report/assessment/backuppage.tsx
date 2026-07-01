"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { QUESTIONS } from "@/lib/assessment-q";

type FileStatus = {
  name: string;
  status: "uploading" | "processing" | "mapping" | "done" | "error";
};

export default function ReportPage() {
  const router = useRouter();

  const [companyId, setCompanyId] = useState("");
  const [reportingPeriod, setReportingPeriod] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [fileStatuses, setFileStatuses] = useState<FileStatus[]>([]);
  const [answers, setAnswers] = useState<{
    question: string;
    answer: string;
    domain: string;
    subtopic: string;
  }[]>([]);
  const [interviewQuestions, setInterviewQuestions] =
    useState<typeof QUESTIONS>([]);

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
      return;
    }

    if (!mappedTopics || mappedTopics.length === 0) {
      setInterviewQuestions(QUESTIONS);
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
    setCurrentQuestion(0);
  }

  async function nextQuestion() {
    if (saving) return;

    if (!currentAnswer.trim()) {
      alert("Please answer the question before continuing.");
      return;
    }

    const updatedAnswers = [
      ...answers,
      {
        question: interviewQuestions[currentQuestion].question,
        answer: currentAnswer,
        domain: interviewQuestions[currentQuestion].domain,
        subtopic: interviewQuestions[currentQuestion].subtopic,
      },
    ];

    setAnswers(updatedAnswers);
    setCurrentAnswer("");

    if (currentQuestion < interviewQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      return;
    }

    await submitInterview(updatedAnswers);
  }

  async function submitInterview(
    finalAnswers: {
      question: string;
      answer: string;
      domain: string;
      subtopic: string;
    }[]
  ) {
    if (!reportingPeriod.trim()) {
      alert("Please enter a reporting period.");
      return;
    }

    setSaving(true);

    try {
      const rows = finalAnswers.map((response) => ({
        company_id: companyId,
        reporting_period: reportingPeriod,
        question: response.question,
        answer: response.answer,
        domain: response.domain,
        Subtopic: response.subtopic,
      }));

      const { error } = await supabase
        .from("qualitative_responses")
        .insert(rows);

      if (error) {
        alert(error.message);
        return;
      }

      // 1. Copy mapped evidence into qualitative_responses
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

      // 2. Run AI assessment
      await fetch("/api/run-ai-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reporting_period: reportingPeriod,
          company_id: companyId,
        }),
      });

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
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer..."
                className="w-full h-40 border rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                disabled={saving}
                onClick={nextQuestion}
                className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
              >
                {saving
                  ? "Saving..."
                  : currentQuestion === interviewQuestions.length - 1
                  ? "Submit Report"
                  : "Continue"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
