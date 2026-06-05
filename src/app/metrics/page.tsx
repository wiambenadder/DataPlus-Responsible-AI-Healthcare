"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MetricsPage() {
  const [metric, setMetric] = useState("");
  const [value, setValue] = useState("");

  async function saveMetric() {
    if (!metric || !value) {
      alert("Please fill in both fields.");
      return;
    }

    const { error } = await supabase
      .from("metrics")
      .insert({
        metric_name: metric,
        metric_value: value,
      });

    if (error) {
      console.error(error);
      alert("Failed to save metric.");
      return;
    }

    alert("Metric saved successfully.");

    setMetric("");
    setValue("");
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">
        Manual Metric Entry
      </h1>

      <div className="flex flex-col gap-3 max-w-md">
        <input
          type="text"
          placeholder="Metric Name"
          value={metric}
          onChange={(e) => setMetric(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Metric Value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="border p-2 rounded"
        />

        <button
          onClick={saveMetric}
          className="border p-2 rounded"
        >
          Save Metric
        </button>
      </div>
    </div>
  );
}