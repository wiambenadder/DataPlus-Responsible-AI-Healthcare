
// main report submission page, allows users to enter qualitative answers and quantitative metrics for a given reporting period, saves data to the database on submission
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ReportPage() {
  const [reportingPeriod, setReportingPeriod] =
    useState("");

  const [metrics, setMetrics] = useState<any[]>([]);

  const [answers, setAnswers] = useState({
    aiUse: "",
    trackedMetrics: "",
    challenges: "",
    success: "",
  });

  useEffect(() => {
    loadMetrics();
  }, []);

  async function loadMetrics() {
    const { data } = await supabase
      .from("metric_definitions")
      .select("*")
      .order("metric_name");

    setMetrics(
      (data || []).map((m) => ({
        ...m,
        value: "",
        note: "",
      }))
    );
  }

  function updateMetric(
    index: number,
    field: string,
    value: string
  ) {
    const updated = [...metrics];
    updated[index][field] = value;
    setMetrics(updated);
  }

  async function addCustomMetric() {
    const metricName = prompt(
      "Enter custom metric name"
    );

    if (!metricName) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user?.id)
      .single();

    if (!profile) {
      return null;
    }

    const { data } = await supabase
      .from("metric_definitions")
      .insert({
        company_id: profile.company_id,
        metric_name: metricName,
        is_required: false,
      })
      .select()
      .single();

    setMetrics([
      ...metrics,
      {
        ...data,
        value: "",
        note: "",
      },
    ]);
  }

  async function saveReport() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return null;
    }

    const companyId = profile.company_id;

    const qualitative = [
      {
        question:
          "How does your organization use AI?",
        answer: answers.aiUse,
      },
      {
        question:
          "What metrics do you currently track?",
        answer: answers.trackedMetrics,
      },
      {
        question:
          "What are your biggest scaling challenges?",
        answer: answers.challenges,
      },
      {
        question:
          "What outcomes define success?",
        answer: answers.success,
      },
    ];

    await supabase
      .from("qualitative_responses")
      .insert(
        qualitative.map((q) => ({
          company_id: companyId,
          reporting_period: reportingPeriod,
          ...q,
        }))
      );

    await supabase
      .from("metric_submissions")
      .insert(
        metrics.map((m) => ({
          company_id: companyId,
          metric_definition_id: m.id,
          metric_value:
            Number(m.value) || null,
          note: m.note,
          reporting_period:
            reportingPeriod,
        }))
      );

    alert("Report saved");
  }

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">
        Report Submission
      </h1>

      <input
        className="border p-2 mb-6"
        placeholder="Q2 2026"
        value={reportingPeriod}
        onChange={(e) =>
          setReportingPeriod(
            e.target.value
          )
        }
      />

      <h2 className="font-bold">
        Baseline Questions
      </h2>

      <textarea
        className="border w-full p-2 mb-2"
        placeholder="How does your organization use AI?"
        onChange={(e) =>
          setAnswers({
            ...answers,
            aiUse: e.target.value,
          })
        }
      />

      <textarea
        className="border w-full p-2 mb-2"
        placeholder="What metrics do you track?"
        onChange={(e) =>
          setAnswers({
            ...answers,
            trackedMetrics:
              e.target.value,
          })
        }
      />

      <textarea
        className="border w-full p-2 mb-2"
        placeholder="Biggest scaling challenges?"
        onChange={(e) =>
          setAnswers({
            ...answers,
            challenges:
              e.target.value,
          })
        }
      />

      <textarea
        className="border w-full p-2 mb-6"
        placeholder="What outcomes define success?"
        onChange={(e) =>
          setAnswers({
            ...answers,
            success: e.target.value,
          })
        }
      />

      <h2 className="font-bold mb-2">
        Metrics
      </h2>

      {metrics.map(
        (metric, index) => (
          <div
            key={metric.id}
            className="mb-4 border p-3"
          >
            <div>
              {metric.metric_name}
            </div>

            <input
              type="number"
              placeholder="Value"
              className="border p-2 mr-2"
              onChange={(e) =>
                updateMetric(
                  index,
                  "value",
                  e.target.value
                )
              }
            />

            <input
              placeholder="Note"
              className="border p-2"
              onChange={(e) =>
                updateMetric(
                  index,
                  "note",
                  e.target.value
                )
              }
            />
          </div>
        )
      )}

      <button
        onClick={addCustomMetric}
        className="border px-4 py-2 mr-2"
      >
        Add Custom Metric
      </button>

      <button
        onClick={saveReport}
        className="border px-4 py-2"
      >
        Save Report
      </button>
    </div>
  );
}