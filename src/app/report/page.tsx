// main report submission page, allows users to enter qualitative answers for a given reporting period, saves data to the database on submission
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const QUESTIONS = [
  "What were your organization's most important accomplishments during this reporting period?",

  "What challenges or barriers did you encounter?",

  "How is your organization currently using AI?",

  "What progress has been made toward your program goals?",

  "What support would help you achieve your goals faster?",

  "Is there anything else you would like funders to know?",
];

export default function ReportPage() {
  const router = useRouter();

  const [companyId, setCompanyId] = useState("");
  const [reportingPeriod, setReportingPeriod] =
    useState("");

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [currentAnswer, setCurrentAnswer] =
    useState("");

  const [answers, setAnswers] = useState<
    {
      question: string;
      answer: string;
    }[]
  >([]);

  useEffect(() => {
    loadCompany();
  }, []);

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
  }

  function nextQuestion() {
    if (!currentAnswer.trim()) {
      alert("Please answer the question.");
      return;
    }

    const updatedAnswers = [
      ...answers,
      {
        question:
          QUESTIONS[currentQuestion],
        answer: currentAnswer,
      },
    ];

    setAnswers(updatedAnswers);
    setCurrentAnswer("");

    if (
      currentQuestion <
      QUESTIONS.length - 1
    ) {
      setCurrentQuestion(
        currentQuestion + 1
      );
    } else {
      saveInterview(updatedAnswers);
    }
  }

  async function saveInterview(
    finalAnswers: {
      question: string;
      answer: string;
    }[]
  ) {
    if (!reportingPeriod.trim()) {
      alert(
        "Please enter a reporting period."
      );
      return;
    }

    const rows = finalAnswers.map(
      (response) => ({
        company_id: companyId,
        reporting_period:
          reportingPeriod,
        question:
          response.question,
        answer: response.answer,
      })
    );

    const { error } =
      await supabase
        .from(
          "qualitative_responses"
        )
        .insert(rows);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/history");
  }

  return (
    <div className="max-w-3xl mx-auto p-8">

      <h1 className="text-3xl font-bold mb-2">
        Reporting Interview
      </h1>

      <p className="text-gray-500 mb-8">
        Answer a few questions about
        your organization's progress.
      </p>

      <div className="mb-6">

        <label className="block font-medium mb-2">
          Reporting Period
        </label>

        <input
          className="border p-2 w-full"
          placeholder="Q2 2026"
          value={reportingPeriod}
          onChange={(e) =>
            setReportingPeriod(
              e.target.value
            )
          }
        />

      </div>

      <div className="border rounded-lg p-6">

        <div className="mb-2 text-sm text-gray-400">
          Question{" "}
          {currentQuestion + 1} of{" "}
          {QUESTIONS.length}
        </div>

        <div className="text-lg font-medium mb-4">
          🤖{" "}
          {
            QUESTIONS[
              currentQuestion
            ]
          }
        </div>

        <textarea
          value={currentAnswer}
          onChange={(e) =>
            setCurrentAnswer(
              e.target.value
            )
          }
          className="border p-3 w-full h-40"
          placeholder="Type your answer here..."
        />

        <button
          onClick={nextQuestion}
          className="border px-4 py-2 mt-4"
        >
          {currentQuestion ===
          QUESTIONS.length - 1
            ? "Submit"
            : "Next"}
        </button>

      </div>

      {answers.length > 0 && (
        <div className="mt-8">

          <h2 className="font-bold mb-2">
            Previous Answers
          </h2>

          {answers.map(
            (answer, index) => (
              <div
                key={index}
                className="border p-3 mb-2"
              >
                <div className="font-medium">
                  {
                    answer.question
                  }
                </div>

                <div className="text-gray-600">
                  {answer.answer}
                </div>
              </div>
            )
          )}

        </div>
      )}

    </div>
  );
}