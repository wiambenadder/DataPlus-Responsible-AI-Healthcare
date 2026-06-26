"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";



const QUESTIONS = [
  {
    question:
      "Who owns the data used to train your model, who can access it, and is that written down anywhere?",
    domain: "Model Source",
    subtopic: "Governance & Stewardship",
  },

  {
    question:
      "How do you check that the population your training data represents is balanced and complete?",
    domain: "Model Source",
    subtopic: "Training Data Quality & Coverage",
  },

  {
    question:
      "How do you make sure the training data stays current, and is there a process for retiring outdated data?",
    domain: "Model Source",
    subtopic: "Timeliness",
  },

  {
    question:
      "Could someone outside your organization find this data, access it, and reuse it for a different purpose if they needed to?",
    domain: "Model Source",
    subtopic: "Data Interoperability & Reuse",
  },

  {
    question:
      "What formal compliance record do you have for how this data is protected, and when was it last reviewed?",
    domain: "Model Source",
    subtopic: "Privacy & Security",
  },

  {
    question:
      "Do you follow a recognized data standard or metadata schema, like HL7 or FHIR, for organizing this data?",
    domain: "Model Source",
    subtopic: "Data Standards & Metadata",
  },

  {
    question:
      "What accuracy metrics do you track, and how do they compare to a baseline or comparator?",
    domain: "Model Development",
    subtopic: "Accuracy",
  },

  {
    question:
      "How do you validate that the model’s outputs are reliable, and is there a formal protocol for this?",
    domain: "Model Development",
    subtopic: "Model Validation & Reliability",
  },

  {
    question:
      "Walk me through what actually happens between a user’s input and the system’s output. Who made the design decisions, and where are they documented?",
    domain: "Model Development",
    subtopic: "AI System Design",
  },

  {
    question:
      "Have you formally tested whether performance varies across different populations or contexts?",
    domain: "Model Development",
    subtopic: "Cross-Population Performance",
  },

  {
    question:
      "Have you tested for bias against any specific groups, and is this recurring practice or a one-off?",
    domain: "Model Development",
    subtopic: "Bias & Fairness Assessment",
  },

  {
    question:
      "How do end users understand why the model is making a particular recommendation?",
    domain: "Model Development",
    subtopic: "Transparency & Explainability",
  },

  {
    question:
      "Have you run formal stress tests on the model under unusual or messy input conditions?",
    domain: "Model Development",
    subtopic: "Robustness",
  },

  {
    question:
      "What’s the chain of reasoning from what your tool does to an actual health outcome, and is there an indicator in place to test that chain?",
    domain: "Model Deployment",
    subtopic: "Mechanism of Change",
  },

  {
    question:
      "How do you monitor uptime, latency, and capacity as usage grows?",
    domain: "Model Deployment",
    subtopic: "System Reliability & Capacity",
  },

  {
    question:
      "What protocol exists for catching and escalating a problematic output before it reaches a patient or health worker?",
    domain: "Model Deployment",
    subtopic: "Protocol & Safety Monitoring",
  },

  {
    question:
      "What guardrails prevent the tool from being used outside its intended purpose, and how are they enforced?",
    domain: "Model Deployment",
    subtopic: "Responsible Use of AI",
  },

  {
    question:
      "How does your tool currently connect with national health information systems, like DHIS2 or EHR?",
    domain: "Model Deployment",
    subtopic: "Deployment Infrastructure & Integration",
  },

  {
    question:
      "What do you formally track about how the tool is being used day to day, and where does that data go?",
    domain: "Model Deployment",
    subtopic: "Implementation Outcomes",
  },

  {
    question:
      "What health outcome improvements have you formally attributed to the tool, and through what method?",
    domain: "Impact",
    subtopic: "Outcome Improvement",
  },

  {
    question:
      "How long does it typically take between an AI recommendation and the resulting action, and do you track this formally?",
    domain: "Impact",
    subtopic: "Time to Action",
  },

  {
    question:
      "Do you formally track whether the tool’s benefits are reaching disadvantaged or underserved groups specifically? Not just who you reach, but whether outcomes differ by equity dimension.",
    domain: "Impact",
    subtopic: "Equity Effect",
  },

  {
    question:
      "What does your financial model look like, and is there a formal analysis of your path to being self-sustaining?",
    domain: "Impact",
    subtopic: "Financial Sustainability",
  },

  {
    question:
      "How does the cost of delivering care with this tool compare to the alternative, and is that comparison formally documented?",
    domain: "Impact",
    subtopic: "Cost-Effectiveness",
  },

  {
    question:
      "What formal review process governs the tool once it’s deployed, and who runs it?",
    domain: "Impact",
    subtopic: "Continued Oversight",
  },

  {
    question:
      "Beyond current funding, what does long-term financial viability look like for this tool?",
    domain: "Sustainability",
    subtopic: "Financial Viability",
  },

  {
    question:
      "How would you describe your business model, and how clear is the path to revenue or sustained funding?",
    domain: "Sustainability",
    subtopic: "Business Model Clarity",
  },

  {
    question:
      "Is this tool embedded in routine government or health system processes, or does it run alongside them?",
    domain: "Sustainability",
    subtopic: "Health System Integration",
  },

  {
    question:
      "If your organization stepped back, is there local capacity to keep this tool running independently?",
    domain: "Sustainability",
    subtopic: "Local Ownership & Capacity",
  },

  {
    question:
      "Is this tool referenced in any national health financing, digital health, or AI policy document?",
    domain: "Sustainability",
    subtopic: "Policy & Financing Alignment",
  },

  {
    question:
      "Who is formally responsible for oversight of this tool five years from now, and is that written down?",
    domain: "Sustainability",
    subtopic: "Long-Term Oversight",
  }
  
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

    await fetch(
  "/api/run-ai-assessment",
  {
    method: "POST",
    headers: {
      "Content-Type":
        "application/json",
    },
    body: JSON.stringify({
      reporting_period:
        reportingPeriod,
      company_id: companyId,
    }),
  }
);

    router.push("/report/history");
  }

  const progress =
    ((currentQuestion + 1) /
      QUESTIONS.length) *
    100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">

      <div className="max-w-3xl mx-auto p-8">

        <h1 className="text-4xl font-bold mb-2">
          Assessment Questionare
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