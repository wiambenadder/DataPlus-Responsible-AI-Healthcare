"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const QUESTIONS = [
  {
    question:
      "What were your organization's most important accomplishments during this reporting period?",
    domain: "Program Progress",
    subtopic: "Accomplishments",
  },

  {
    question:
      "What challenges or barriers did you encounter?",
    domain: "Operations",
    subtopic: "Challenges",
  },

  {
    question:
      "How is your organization currently using AI?",
    domain: "AI Readiness",
    subtopic: "AI Usage",
  },

  {
    question:
      "What progress has been made toward your program goals?",
    domain: "Program Progress",
    subtopic: "Goal Tracking",
  },

  {
    question:
      "What support would help you achieve your goals faster?",
    domain: "Operations",
    subtopic: "Support Needs",
  },

  {
    question:
      "Is there anything else you would like funders to know?",
    domain: "General",
    subtopic: "Additional Information",
  },
];

export default function ReportPage() {
  const router = useRouter();

  const [companyId, setCompanyId] =
    useState("");

  const [reportingPeriod, setReportingPeriod] =
    useState("");

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [currentAnswer, setCurrentAnswer] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [answers, setAnswers] =
    useState<
      {
        question: string;
        answer: string;
        domain: string;
        subtopic: string;
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

    const { data: profile } =
      await supabase
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

  async function nextQuestion() {
    if (!currentAnswer.trim()) {
      alert(
        "Please answer the question before continuing."
      );
      return;
    }

    const updatedAnswers = [
      ...answers,
      {
        question:
          QUESTIONS[currentQuestion]
            .question,
        answer: currentAnswer,
        domain:
          QUESTIONS[currentQuestion]
            .domain,
        subtopic:
          QUESTIONS[currentQuestion]
            .subtopic,
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
      return;
    }

    await submitInterview(
      updatedAnswers
    );
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
      alert(
        "Please enter a reporting period."
      );
      return;
    }

    setSaving(true);

    const rows = finalAnswers.map(
      (response) => ({
        company_id: companyId,
        reporting_period:
          reportingPeriod,
        question:
          response.question,
        answer: response.answer,
        domain:
          response.domain,
        Subtopic:
          response.subtopic,
      })
    );

    const { error } =
      await supabase
        .from(
          "qualitative_responses"
        )
        .insert(rows);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/history");
  }

  const progress =
    ((currentQuestion + 1) /
      QUESTIONS.length) *
    100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">

      <div className="max-w-3xl mx-auto p-8">

        <h1 className="text-4xl font-bold mb-2">
          Reporting Interview
        </h1>

        <p className="text-gray-500 mb-8">
          Help us understand your
          organization's progress and
          challenges.
        </p>

        <div className="mb-8">

          <label className="block text-sm font-medium mb-2">
            Reporting Period
          </label>

          <input
            className="
              w-full
              border
              p-3
              rounded-xl
            "
            placeholder="Q2 2026"
            value={reportingPeriod}
            onChange={(e) =>
              setReportingPeriod(
                e.target.value
              )
            }
          />

        </div>

        <div className="mb-8">

          <div className="flex justify-between text-sm text-gray-500 mb-2">

            <span>
              Question{" "}
              {currentQuestion + 1}
            </span>

            <span>
              {QUESTIONS.length}
            </span>

          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">

            <div
              className="
                bg-blue-600
                h-2
                rounded-full
                transition-all
              "
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

        </div>

        <div className="
          bg-white
          rounded-2xl
          border
          shadow-sm
          p-8
        ">

          <div className="text-xl font-medium mb-6">

            🤖{" "}
            {
              QUESTIONS[
                currentQuestion
              ].question
            }

          </div>

          <textarea
            value={currentAnswer}
            onChange={(e) =>
              setCurrentAnswer(
                e.target.value
              )
            }
            placeholder="Type your answer..."
            className="
              w-full
              h-40
              border
              rounded-xl
              p-4
              resize-none
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "
          />

          <button
            disabled={saving}
            onClick={nextQuestion}
            className="
              mt-6
              bg-blue-600
              text-white
              px-6
              py-3
              rounded-xl
              hover:bg-blue-700
            "
          >
            {saving
              ? "Saving..."
              : currentQuestion ===
                QUESTIONS.length -
                  1
              ? "Submit Report"
              : "Continue"}
          </button>

        </div>

      </div>

    </div>
  );
}