"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const QUESTIONS = [
  {
    section: "Organization Overview",
    question:
      "Please briefly describe your organization’s mission and programmatic goals.",
  },
  {
    section: "Problem Overview",
    question:
      "What is the health challenge you want to solve? Describe the health barriers and disparities facing the target community that the program intends to serve.",
  },
  {
    section: "Theory of Change",
    question:
      "What is your theory of change? Describe how you plan to utilize artificial intelligence (AI) to address the health challenge stated above.",
  },
  {
    section: "AI Solution",
    question:
      "Describe the AI solution, its functionality, and its current stage of development.",
  },
  {
    section: "Amplifying Impact",
    question:
      "Describe how the proposed AI solution stands to either improve health outcomes or scale to a new population or geography.",
  },
  {
    section: "Community Partnerships",
    question:
      "Describe how the organization will partner and engage with the community the program aims to serve.",
  },
  {
    section: "Challenges",
    question:
      "What have been some of the most significant challenges in operating and scaling your AI? For example: technical, operational, financial, regulatory, cultural adaptation, or scalability challenges.",
  },
  {
    section: "Challenges",
    question:
      "What strategies or approaches have you used to address or overcome these challenges?",
  },
  {
    section: "Business Model",
    question:
      "What is the current business model, and what would you like your business model to be?",
  },
  {
    section: "Revenue",
    question:
      "Could you share your organization’s main revenue streams or sources of operating support? For example: subscriptions, project fees, capitation, membership, licensing, grants, or other sources.",
  },
  {
    section: "Policy and Regulation",
    question:
      "Can you walk us through the key policies and regulations that govern your work, and how they have influenced what your organization does?",
  },
  {
    section: "Policy and Regulation",
    question:
      "Are there any past or current policies or regulations that have constrained the organization’s ability to operate or scale?",
  },
  {
    section: "Policy and Regulation",
    question:
      "If so, how were these policy or regulatory obstacles resolved?",
  },
];

export default function BackgroundReportPage() {
  const [alreadySubmitted, setAlreadySubmitted] =
  useState(false);
  const router = useRouter();

  const [companyId, setCompanyId] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(
    Array(QUESTIONS.length).fill("")
  );
  const [saving, setSaving] = useState(false);

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
    const { data: existing } =
  await supabase
    .from(
      "company_background_reports"
    )
    .select("id")
    .eq(
      "company_id",
      profile.company_id
    )
    .limit(1);

if (
  existing &&
  existing.length > 0
) {
  setAlreadySubmitted(
    true
  );
}
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
    if (!answers[currentQuestion].trim()) {
      alert("Please answer the question before continuing.");
      return;
    }

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      return;
    }

    await submitBackgroundReport();
  }

  async function submitBackgroundReport() {
    setSaving(true);

    const rows = QUESTIONS.map((item, index) => ({
      company_id: companyId,
      section: item.section,
      question: item.question,
      answer: answers[index],
    }));

    const { error } = await supabase
      .from("company_background_reports")
      .insert(rows);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/report/assessment");
  }

  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

  if (alreadySubmitted) {
  return (
    <div className="
      min-h-screen
      bg-gradient-to-b
      from-white
      to-slate-50
    ">

      <div className="
        max-w-3xl
        mx-auto
        p-8
      ">

        <div className="
          bg-white
          border
          rounded-3xl
          p-10
          shadow-sm
          text-center
        ">

          <h1 className="
            text-3xl
            font-bold
            mb-4
          ">
            Company Background
            Already Submitted
          </h1>

          <p className="
            text-gray-600
            mb-8
          ">
            Your organization has
            already completed the
            background reporting
            section.
          </p>

          <button
            onClick={() =>
              router.push(
                "/report/history"
              )
            }
            className="
              bg-blue-600
              text-white
              px-6
              py-3
              rounded-xl
            "
          >
            View Submission
          </button>

        </div>

      </div>

    </div>
  );
}
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-2">
          Company Background
        </h1>

        <p className="text-gray-500 mb-8">
          Help us understand your organization, AI solution, operating context,
          and business model before beginning the assessment interview.
        </p>

        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>
              Question {currentQuestion + 1} of {QUESTIONS.length}
            </span>
            <span>{QUESTIONS[currentQuestion].section}</span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-8">
          <div className="text-sm font-medium text-blue-600 mb-3">
            {QUESTIONS[currentQuestion].section}
          </div>

          <div className="text-xl font-medium mb-6">
            {QUESTIONS[currentQuestion].question}
          </div>

          <textarea
            value={answers[currentQuestion]}
            onChange={(e) => updateAnswer(e.target.value)}
            placeholder="Type your response..."
            className="w-full h-48 border rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                : currentQuestion === QUESTIONS.length - 1
                ? "Submit Background"
                : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}