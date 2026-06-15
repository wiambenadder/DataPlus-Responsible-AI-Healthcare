// page that displays the history of interview responses for the logged-in user's company, fetching data from the database and showing it in a list format with details about each response.
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function HistoryPage() {
  const [responses, setResponses] = useState<any[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (!profile) return;

    const { data } = await supabase
      .from("qualitative_responses")
      .select("*")
      .eq("company_id", profile.company_id)
      .order("created_at", {
        ascending: false,
      });

    setResponses(data || []);
  }

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">
        Interview History
      </h1>

      {responses.length === 0 && (
        <p>No responses found.</p>
      )}

      {responses.map((response) => (
        <div
          key={response.id}
          className="border p-4 mb-4 rounded"
        >
          <div className="text-sm text-gray-500 mb-2">
            {response.reporting_period}
          </div>

          <div className="font-medium mb-2">
            {response.question}
          </div>

          <div>
            {response.answer}
          </div>
        </div>
      ))}
    </div>
  );
}