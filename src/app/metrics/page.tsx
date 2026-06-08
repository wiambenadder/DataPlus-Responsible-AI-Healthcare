"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type MetricRow = {
  metric_name: string;
  metric_value: string;
};

export default function MetricsPage() {
  const [reportingPeriod, setReportingPeriod] = useState("");
  const [rows, setRows] = useState<MetricRow[]>([
    { metric_name: "", metric_value: "" },
  ]);

  function addMetric() {
    setRows([
      ...rows,
      { metric_name: "", metric_value: "" },
    ]);
  }

  function updateRow(
    index: number,
    field: keyof MetricRow,
    value: string
  ) {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  }

  async function saveAll() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please log in");
      return;
    }

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();

    if (profileError || !profile) {
      alert("No company found");
      return;
    }

    const metricsToInsert = rows
      .filter(
        (row) =>
          row.metric_name.trim() !== "" &&
          row.metric_value.trim() !== ""
      )
      .map((row) => ({
        company_id: profile.company_id,
        metric_name: row.metric_name,
        metric_value: Number(row.metric_value),
        reporting_period: reportingPeriod,
      }));

    const { error } = await supabase
      .from("metrics")
      .insert(metricsToInsert);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    alert("Metrics saved");

    setRows([
      { metric_name: "", metric_value: "" },
    ]);
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">
        Metrics Entry
      </h1>

      <input
        type="text"
        placeholder="Reporting Period (Q2 2026)"
        value={reportingPeriod}
        onChange={(e) =>
          setReportingPeriod(e.target.value)
        }
        className="border p-2 mb-4"
      />

      {rows.map((row, index) => (
        <div
          key={index}
          className="flex gap-2 mb-2"
        >
          <input
            type="text"
            placeholder="Metric Name"
            value={row.metric_name}
            onChange={(e) =>
              updateRow(
                index,
                "metric_name",
                e.target.value
              )
            }
            className="border p-2"
          />

          <input
            type="number"
            placeholder="Value"
            value={row.metric_value}
            onChange={(e) =>
              updateRow(
                index,
                "metric_value",
                e.target.value
              )
            }
            className="border p-2"
          />
        </div>
      ))}

      <div className="flex gap-2 mt-4">
        <button
          onClick={addMetric}
          className="border px-4 py-2"
        >
          Add Metric
        </button>

        <button
          onClick={saveAll}
          className="border px-4 py-2"
        >
          Save All
        </button>
      </div>
    </div>
  );
}