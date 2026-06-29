"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { QUESTIONS } from "@/lib/assessment-q";

export default function ReportPage() {
  const router = useRouter();

  const [companyId, setCompanyId] = useState("");
  const [reportingPeriod, setReportingPeriod] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processingDocument, setProcessingDocument] = useState(false);
  const [answers, setAnswers] = useState<
  {
    question: string;
    answer: string;
    domain: string;
    subtopic: string;
  }[]
>([]);
const [interviewQuestions, setInterviewQuestions] =
  useState<typeof QUESTIONS>([]);
  useEffect(() => {
    loadCompany();
  }, []);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    setUploading(true);
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

    for (const file of Array.from(files)) {
      const filePath = `${Date.now()}-${file.name}`;

      const { data, error: uploadError } = await supabase.storage
        .from("reports")
        .upload(filePath, file);

      if (uploadError) {
        console.error(uploadError);
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

      if (dbError) {
        console.error(dbError);
        continue;
      }

      if (!upload?.id) {
        console.error("Upload record missing id");
        continue;
      }
      

      setUploading(false);
      setProcessingDocument(true);

      const response = await fetch("/api/process-upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uploadId: upload.id,
        }),
      });


if (!response.ok) {
    setProcessingDocument(false);

    alert("Document processing failed.");

    return;
}

setProcessingDocument(false);

setUploadComplete(true);
    }
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

    await loadInterviewQuestions(
  profile.company_id
);
  }
  

  

  async function loadInterviewQuestions(
  companyId: string
) {
  const { data: mappedTopics } =
    await supabase
      .from("domain_mapping")
      .select("domain, subtopic")
      .eq("company_id", companyId);

  if (!mappedTopics) {
    setInterviewQuestions(QUESTIONS);
    return;
  }

  const missingQuestions =
    QUESTIONS.filter((question) => {

      return !mappedTopics.some(
        (mapping) =>
          mapping.domain ===
            question.domain &&
          mapping.subtopic ===
            question.subtopic
      );

    });

  setInterviewQuestions(
    missingQuestions
  );
}

  async function nextQuestion() {
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

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    await fetch("/api/run-ai-assessment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reporting_period: reportingPeriod,
        company_id: companyId,
      }),
    });

    router.push("/report/history");
  }

  const progress = ((currentQuestion + 1) / interviewQuestions.length) * 100;

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
              analyze the document before beginning the interview.
            </p>

            <input
              type="file"
              accept=".pdf"
              onChange={handleUpload}
            />

            {uploading && <div className="mt-6">Uploading...</div>}

            {processingDocument && (
              <div className="mt-6">Processing document...</div>
            )}

            <button
              onClick={() => setUploadComplete(true)}
              className="mt-6 border rounded-xl px-5 py-3"
            >
              Continue Without Upload
            </button>
          </div>
        )}

        {uploadComplete && (
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