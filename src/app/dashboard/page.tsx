"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { FRAMEWORK } from "@/lib/framework";

function normalizeStatus(status: string | null) {
  return status === "Practiced" ? "Practiced" : "Not Practiced";
}

function getPercentage(practiced: number, total: number) {
  if (total === 0) return 0;
  return Math.round((practiced / total) * 100);
}

function getBadgeColor(status: string | null) {
  switch (status) {
    case "Measured":
      return "bg-green-100 text-green-700";
    case "Practiced, Not Measured":
      return "bg-blue-100 text-blue-700";
    case "Aware, Not Practiced":
      return "bg-yellow-100 text-yellow-700";
    case "Not Addressed":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}
function getPercentageColor(
  percentage: number
) {
  if (percentage >= 75) {
    return "text-green-600";
  }

  if (percentage >= 40) {
    return "text-yellow-600";
  }

  return "text-red-600";
}



export default function DashboardPage() {
  const [responses, setResponses] = useState<any[]>([]);
  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>({});
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  // ✅ FIXED: moved inside the component
  const [activeDomain, setActiveDomain] = useState<string | null>(null);

  
  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const { data: { user } } = await supabase.auth.getUser();
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
      .eq("company_id", profile.company_id);

    setResponses(data || []);
  }

  function toggleDomain(domain: string) {
    setExpandedDomains((prev) => ({ ...prev, [domain]: !prev[domain] }));
  }

  function toggleTopic(id: string) {
    setExpandedTopics((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const allSubtopics = Object.values(FRAMEWORK).flat();

  const practicedCount = responses.filter(
    (r) => r.ai_assessment === "Practiced"
  ).length;

  const overallPercentage = getPercentage(practicedCount, allSubtopics.length);

  return (
    // ✅ FIXED: everything is now inside the return
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-6xl mx-auto p-8">

        <h1 className="text-4xl font-bold mb-2">AI Readiness Dashboard</h1>
        <p className="text-gray-500 mb-8">Assessment generated from interview responses.</p>

        {/* Summary Card */}
        <div className="bg-white border rounded-3xl p-8 shadow-sm mb-8">
          <div className="text-sm text-gray-500">Overall Topics Practiced</div>
          <div className={`text-6xl font-bold ${getPercentageColor(
    overallPercentage
  )}`}
>
  {overallPercentage}%</div>
        </div>

        {/* Domain Cards */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          {Object.entries(FRAMEWORK).map(([domain, subtopics]) => {
            const practiced = subtopics.filter((subtopic) =>
              responses.some(
                (r) => r.Subtopic === subtopic && r.ai_assessment === "Practiced"
              )
            ).length;

            const percent = getPercentage(practiced, subtopics.length);

            return (
              <button
                key={domain}
                onClick={() => setActiveDomain(domain)}
                className="bg-white border rounded-2xl p-5 text-left shadow-sm"
              >
                <div className="text-sm text-gray-500">{domain}</div>
                <div
  className={`text-3xl font-bold ${getPercentageColor(
    percent
  )}`}
>
  {percent}%
</div>
              </button>
            );
          })}
        </div>

      
        {activeDomain && (
          <div className="bg-white border rounded-3xl p-6 shadow-sm mb-8">
            <h2 className="text-2xl font-semibold mb-6">{activeDomain}</h2>

            {/* ✅ FIXED: subtopic map is now inside JSX, not floating */}
            {FRAMEWORK[activeDomain as keyof typeof FRAMEWORK].map((subtopic) => {
              const row = responses.find((r) => r.Subtopic === subtopic);
              const status = row ? normalizeStatus(row.ai_assessment) : "Not Yet Assessed";

              // ✅ FIXED: filter recommendations per subtopic, not globally
              const recommendations = responses.filter(
                (r) => r.Subtopic === subtopic && r.ai_assessment === "Not Practiced"
              );

              return (
                <div
  key={subtopic}
  className="
    border
    rounded-xl
    mb-3
    overflow-hidden
  "
>

  <button
    onClick={() =>
      toggleTopic(
        subtopic
      )
    }
    className="
      w-full
      flex
      justify-between
      items-center
      p-4
      text-left
    "
  >

    <div>

      <div className="font-medium">
        {subtopic}
      </div>

    </div>

    <div className="flex items-center gap-3">

      <span
        className={`
          text-xs
          px-2
          py-1
          rounded-full
          ${getBadgeColor(
            row?.ai_assessment ??
              null
          )}
        `}
      >
        {status}
      </span>

      <span>
        {expandedTopics[
          subtopic
        ]
          ? "−"
          : "+"}
      </span>

    </div>

  </button>

  {expandedTopics[
    subtopic
  ] && (
    <div className="
      border-t
      p-4
      space-y-4
    ">

      <div>

        <div className="
          font-medium
          mb-1
        ">
          AI Justification
        </div>

        <div className="
          bg-slate-50
          border
          rounded-xl
          p-3
        ">
          {row?.ai_reasoning ||
            "No assessment available yet."}
        </div>

      </div>

      <div>

        <div className="
          font-medium
          mb-1
        ">
          Source Question
        </div>

        <div>
          {row?.question ||
            "No source question available."}
        </div>

      </div>

      <div>

        <div className="
          font-medium
          mb-1
        ">
          Original Response
        </div>

        <div className="
          border-l-4
          border-blue-500
          pl-3
        ">
          {row?.answer ||
            "No response available."}
        </div>

      </div>

      <div>

        <div className="
          font-medium
          mb-1
        ">
          Reporting Period
        </div>

        <div>
          {row?.reporting_period ||
            "N/A"}
        </div>

      </div>

    </div>
  )}

</div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}