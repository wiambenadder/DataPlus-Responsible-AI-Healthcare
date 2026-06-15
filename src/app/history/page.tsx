// shows history of submitted reports for the user's company, only accessible if user is signed in and has a company profile set up


"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function HistoryPage() {
  const [reports, setReports] =
    useState<any[]>([]);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
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

    const { data } = await supabase
      .from("metric_submissions")
      .select(`
        *,
        metric_definitions(metric_name)
      `)
      .eq(
        
        "company_id",
        profile.company_id
      )
      .order("created_at", {
        ascending: false,
      });

    setReports(data || []);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Report History
      </h1>

      {reports.map((report) => (
        <div
          key={report.id}
          className="border p-3 mb-3"
        >
          <div>
            <strong>Period:</strong>{" "}
            {report.reporting_period}
          </div>

          <div>
            <strong>Metric:</strong>{" "}
            {
              report.metric_definitions
                ?.metric_name
            }
          </div>

          <div>
            <strong>Value:</strong>{" "}
            {report.metric_value}
          </div>

          <div>
            <strong>Note:</strong>{" "}
            {report.note}
          </div>
        </div>
      ))}
    </div>
  );
}