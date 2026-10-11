"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { QUESTIONS } from "@/lib/assessment-q";

const STATUS_TEXT: Record<FileStatus["status"], string> = {
  uploading: "Uploading…",
  processing: "Reading the document…",
  mapping: "Finding evidence for each criterion…",
  done: "Done",
  error: "Couldn't be processed",
};

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

// Rows created from document extraction store a question that starts with
// this prefix (e.g. "Evidence extracted from uploaded report..."). Those
// rows should never appear in the interview edit flow — they're edited
// through a separate evidence-review flow instead.
const EXTRACTED_EVIDENCE_PREFIX = "evidence extracted";

function isExtractedFromDocument(question: string | null | undefined) {
  if (!question) return false;
  return question.trim().toLowerCase().startsWith(EXTRACTED_EVIDENCE_PREFIX);
}

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
  // Maps interviewQuestions[i] / answers[i] -> the existing row's id, so we
  // can target updates precisely instead of deleting/reinserting everything.
  const [editableResponseIds, setEditableResponseIds] = useState<string[]>([]);

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
  //
  // Rows created from document extraction (question starts with
  // "Evidence extracted...") are deliberately excluded here — those are
  // edited through a separate evidence-review flow (see "Edit Extracted
  // Evidence" below), since changing them requires re-running extraction
  // and mapping rather than a simple answer edit + re-assessment.
  function startEdit() {
    const editableResponses = existingResponses.filter(
      (r) => !isExtractedFromDocument(r.question)
    );

    const editQuestions = editableResponses.map((r) => ({
      question: r.question,
      domain: r.domain,
      subtopic: r.Subtopic,
    })) as typeof QUESTIONS;

    const startingAnswers = editableResponses.map((r) => r.answer);

    setEditableResponseIds(editableResponses.map((r) => r.id));
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
      if (editingExisting) {
        // Only touch rows whose answer actually changed. Extracted-evidence
        // rows and unmodified interview rows are never deleted or
        // reinserted, so nothing outside the edited answers is affected.
        const changedIndexes = answers
          .map((answer, i) => (answer !== originalAnswers[i] ? i : -1))
          .filter((i) => i !== -1);

        if (changedIndexes.length === 0) {
          router.push("/dashboard");
          return;
        }

        for (const i of changedIndexes) {
          const id = editableResponseIds[i];
          const { error: updateError } = await supabase
            .from("qualitative_responses")
            .update({ answer: answers[i] })
            .eq("id", id);

          if (updateError) {
            alert(updateError.message);
            return;
          }
        }

        // Scope re-assessment to only the entries that actually changed.
        // NOTE: this assumes /api/run-ai-assessment and /api/bullet-points
        // accept a `subtopics` filter and only reprocess matching rows —
        // update those handlers accordingly, otherwise they'll still
        // reprocess everything regardless of what's sent here.
        const changedTopics = changedIndexes.map((i) => ({
          domain: interviewQuestions[i].domain,
          subtopic: interviewQuestions[i].subtopic,
        }));

        await Promise.all([
          fetch("/api/run-ai-assessment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reporting_period: reportingPeriod,
              company_id: companyId,
              subtopics: changedTopics,
            }),
          }),
          fetch("/api/bullet-points", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reporting_period: reportingPeriod,
              company_id: companyId,
              subtopics: changedTopics,
            }),
          }),
        ]);

        router.push("/dashboard");
        return;
      }

      // Fresh submission: insert interview rows, if there are any. When
      // every topic was already covered by uploaded documents,
      // interviewQuestions is empty and there's nothing to insert here —
      // but transfer-map + assessment still need to run below for the
      // evidence that came from the upload.
      if (interviewQuestions.length > 0) {
        const rows = interviewQuestions.map((q, i) => ({
          company_id: companyId,
          reporting_period: reportingPeriod,
          question: q.question,
          answer: answers[i],
          domain: q.domain,
          Subtopic: q.subtopic,
        }));

        const { error } = await supabase
          .from("qualitative_responses")
          .insert(rows);

        if (error) {
          alert(error.message);
          return;
        }
      }

      // Copy mapped evidence into qualitative_responses.
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

      // Fresh submission always gets a full assessment run.
      await Promise.all([
        fetch("/api/run-ai-assessment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reporting_period: reportingPeriod,
            company_id: companyId,
          }),
        }),
        fetch("/api/bullet-points", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reporting_period: reportingPeriod,
            company_id: companyId,
          }),
        }),
      ]);

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

  const pageHeader = (title: string, lede: React.ReactNode) => (
    <div className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 pb-8 pt-6 sm:px-6">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2" aria-hidden>›</span>
          <span>Submit evidence</span>
        </nav>
        <p className="label-caps mt-6">Submit evidence</p>
        <h1 className="mt-2 text-4xl">{title}</h1>
        <div className="mt-3 text-[16px] text-slate-700">{lede}</div>
      </div>
    </div>
  );

  const periodField = (
    <div className="mb-8">
      <label htmlFor="reporting-period" className="block text-sm font-semibold text-slate-800">
        Reporting period
      </label>
      <p className="text-sm text-slate-600">The period these answers describe, for example &ldquo;Q2 2026&rdquo;.</p>
      <input
        id="reporting-period"
        className="mt-2 w-full border border-slate-300 px-3 py-2.5 text-[15px] focus:border-brand-dukeblue disabled:bg-slate-50"
        placeholder="Q2 2026"
        value={reportingPeriod}
        onChange={(e) => setReportingPeriod(e.target.value)}
        disabled={editingExisting}
      />
    </div>
  );

  // Gate: already submitted and not currently editing -> show summary screen
  if (alreadySubmitted && !editingExisting) {
    return (
      <div>
        {pageHeader("Your assessment has been submitted", 
            <p>
              Your organisation has already completed the assessment. You can
              change any of your answers, or look at what you&apos;ve sent so far.
              Changed answers are re-assessed automatically.
            </p>
          )}
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <div className="flex flex-wrap gap-3">
            <button onClick={startEdit} className="btn btn-primary">
              Edit your answers
            </button>
            <button onClick={() => router.push("/report/history")} className="btn btn-secondary">
              View your submissions
            </button>
            <Link href="/dashboard" className="btn btn-secondary">
              See your results
            </Link>
          </div>

          {/*
            HIDDEN FOR NOW: entry point for editing document-extracted
            evidence (routes to /report/evidence). Uncomment when that flow
            is ready to ship.
          */}
          {/*
          <button onClick={() => router.push("/report/evidence")} className="btn btn-secondary">
            Edit extracted evidence
          </button>
          */}
        </div>
      </div>
    );
  }

  return (
    <div>
      {pageHeader(editingExisting ? "Edit your answers" : "Upload documents and answer questions", 
          <p>
            {editingExisting
              ? "Change any answer below. Only the answers you change are re-assessed."
              : "Start with documents that describe your tool and organisation. You'll then only be asked about topics your documents didn't cover."}
          </p>
        )}

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {!uploadComplete && (
          <section aria-labelledby="upload-title">
            <h2 id="upload-title" className="text-2xl">Step 1 · Upload supporting documents</h2>
            <p className="mt-2 text-[15px] text-slate-700">
              Reports, evaluations, case studies, policies or decks — anything that
              shows how you build and run your AI tool. PDF only.
            </p>

            <div role="note" className="mt-5 flex gap-3 border-l-4 border-brand-bronze bg-slate-50 p-4 text-[15px] text-slate-800">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-brand-bronze" aria-hidden />
              <div>
                <p className="font-semibold text-slate-900">Don&apos;t upload personal or patient information</p>
                <p className="mt-1">
                  Remove names, ID numbers, contact details, medical records and images
                  of people before uploading. Documents are read by AI models as part
                  of the assessment —{" "}
                  <Link href="/data-use" className="font-semibold text-brand-dukeblue underline underline-offset-2">
                    how we use your data
                  </Link>
                  .
                </p>
              </div>
            </div>

            <label className="mt-6 block border-2 border-dashed border-slate-300 bg-white p-6 text-center hover:border-brand-dukeblue">
              <span className="block font-semibold text-brand-navy">Choose PDF files</span>
              <span className="mt-1 block text-sm text-slate-600">You can select several at once.</span>
              <input type="file" accept=".pdf" multiple onChange={handleUpload} className="mt-3 text-sm" />
            </label>

            {fileStatuses.length > 0 && (
              <ul className="mt-6 divide-y divide-slate-200 border-y border-slate-200 text-[15px]">
                {fileStatuses.map((f) => (
                  <li key={f.name} className="flex justify-between gap-4 py-2.5">
                    <span className="min-w-0 truncate">{f.name}</span>
                    <span
                      className={`shrink-0 text-sm ${
                        f.status === "error"
                          ? "font-semibold text-red-700"
                          : f.status === "done"
                          ? "font-semibold text-brand-darkteal"
                          : "text-slate-600"
                      }`}
                    >
                      {STATUS_TEXT[f.status]}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {fileStatuses.some((f) => f.status === "error") && (
              <p className="mt-2 text-sm text-red-700">
                A file couldn&apos;t be processed. Check it&apos;s a text-based PDF (not a scan) and try again.
              </p>
            )}

            <button
              disabled={stillWorking}
              onClick={() => setUploadComplete(true)}
              className="btn btn-secondary mt-6"
            >
              {fileStatuses.length > 0 ? "Continue to the questions" : "Continue without uploading"}
            </button>
          </section>
        )}

        {uploadComplete && interviewQuestions.length === 0 && (
          <>
            {periodField}
            <div className="border-l-4 border-brand-teal bg-slate-50 p-6">
              <p className="text-[15px] text-slate-800">
                Your documents covered every topic, so there are no questions left.
                Submit to finish and see your results.
              </p>
              <button disabled={saving} onClick={submitInterview} className="btn btn-primary mt-4">
                {saving ? "Submitting…" : "Submit"}
              </button>
            </div>
          </>
        )}

        {uploadComplete && interviewQuestions.length > 0 && (
          <>
            {!editingExisting && <h2 className="mb-4 text-2xl">Step 2 · Answer the remaining questions</h2>}
            {periodField}

            <div className="mb-6">
              <div className="mb-2 flex justify-between text-sm text-slate-600">
                <span>
                  Question {currentQuestion + 1} of {interviewQuestions.length}
                </span>
                <span>{interviewQuestions[currentQuestion].subtopic}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200">
                <div className="h-1.5 bg-brand-teal transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="border border-slate-200 border-t-4 border-t-brand-navy bg-white p-6 sm:p-8">
              <label htmlFor="answer" className="block font-serif text-xl leading-snug text-brand-navy">
                {interviewQuestions[currentQuestion].question}
              </label>
              <p className="mt-2 text-sm text-slate-600">
                If you don&apos;t do this yet, say so — &ldquo;We don&apos;t do this yet&rdquo; is a
                valid answer.
              </p>

              <textarea
                id="answer"
                value={answers[currentQuestion] ?? ""}
                onChange={(e) => updateAnswer(e.target.value)}
                placeholder="Type your answer…"
                className="mt-4 h-40 w-full resize-y border border-slate-300 p-3 text-[15px] focus:border-brand-dukeblue"
              />

              <div className="mt-6 flex justify-between">
                <button onClick={previousQuestion} disabled={currentQuestion === 0} className="btn btn-secondary">
                  Previous
                </button>
                <button disabled={saving} onClick={nextQuestion} className="btn btn-primary">
                  {saving
                    ? "Saving…"
                    : currentQuestion === interviewQuestions.length - 1
                    ? editingExisting
                      ? "Save changes"
                      : "Submit"
                    : "Next question"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}