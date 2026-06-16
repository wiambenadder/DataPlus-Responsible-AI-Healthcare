// Dashboard page - shows the AI readiness assessment based on interview responses

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const DOMAINS = [
  "Model Source",
  "Model Development",
  "Model Deployment",
  "Impact",
  "Roadmap",
];

function getBadgeColor(status: string | null) {
  switch (status) {
    case "Measured":
      return "bg-green-100 text-green-700";

    case "Practiced, Not Measured":
      return "bg-yellow-100 text-yellow-700";

    case "Aware, Not Practiced":
      return "bg-orange-100 text-orange-700";

    case "Not Addressed":
      return "bg-red-100 text-red-700";

    default:
      return "bg-blue-100 text-blue-700";
  }
}

export default function DashboardPage() {
  const [responses, setResponses] = useState<any[]>([]);
  const [expandedDomains, setExpandedDomains] =
    useState<Record<string, boolean>>({});

  const [expandedTopics, setExpandedTopics] =
    useState<Record<string, boolean>>({});

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
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
      .eq("company_id", profile.company_id);

    setResponses(data || []);
  }

  function toggleDomain(domain: string) {
    setExpandedDomains((prev) => ({
      ...prev,
      [domain]: !prev[domain],
    }));
  }

  function toggleTopic(id: string) {
    setExpandedTopics((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">

      <div className="max-w-6xl mx-auto p-8">

        <h1 className="text-4xl font-bold mb-2">
          AI Readiness Dashboard
        </h1>

        <p className="text-gray-500 mb-8">
          Assessment generated from interview responses.
        </p>

        {DOMAINS.map((domain) => {
          const domainRows = responses.filter(
            (r) => r.domain === domain
          );

          return (
            <div
              key={domain}
              className="
                bg-white
                border
                rounded-2xl
                mb-6
                overflow-hidden
              "
            >

              <button
                onClick={() =>
                  toggleDomain(domain)
                }
                className="
                  w-full
                  p-6
                  flex
                  justify-between
                  items-center
                  text-left
                "
              >

                <div>

                  <div className="text-xl font-semibold">
                    {domain}
                  </div>

                  <div className="text-sm text-gray-500">
                    {
                      domainRows.length
                    } subtopics
                  </div>

                </div>

                <div className="text-xl">
                  {expandedDomains[
                    domain
                  ]
                    ? "−"
                    : "+"}
                </div>

              </button>

              {expandedDomains[
                domain
              ] && (
                <div className="border-t">

                  {domainRows.map(
                    (row) => (
                      <div
                        key={row.id}
                        className="
                          border-b
                          p-5
                        "
                      >

                        <button
                          onClick={() =>
                            toggleTopic(
                              row.id
                            )
                          }
                          className="
                            w-full
                            flex
                            justify-between
                            items-center
                            text-left
                          "
                        >

                          <div>

                            <div className="font-medium">
                              {
                                row.Subtopic
                              }
                            </div>

                          </div>

                          <div
                            className={`
                              px-3
                              py-1
                              rounded-full
                              text-sm
                              ${getBadgeColor(
                                row.ai_assessment
                              )}
                            `}
                          >
                            {row.ai_assessment ||
                              "Pending"}
                          </div>

                        </button>

                        {expandedTopics[
                          row.id
                        ] && (
                          <div className="
                            mt-4
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
                                text-gray-600
                              ">
                                {row.ai_reasoning ||
                                  "No AI reasoning yet."}
                              </div>

                            </div>

                            <div>

                              <div className="
                                font-medium
                                mb-1
                              ">
                                Source Question
                              </div>

                              <div className="
                                text-gray-600
                              ">
                                {row.question}
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
                                text-gray-600
                              ">
                                {row.answer}
                              </div>

                            </div>

                            <div>

                              <div className="
                                font-medium
                                mb-1
                              ">
                                Reporting Period
                              </div>

                              <div className="
                                text-gray-600
                              ">
                                {row.reporting_period}
                              </div>

                            </div>

                          </div>
                        )}

                      </div>
                    )
                  )}

                  {domainRows.length ===
                    0 && (
                    <div className="
                      p-5
                      text-gray-500
                    ">
                      No responses have
                      been mapped to this
                      domain yet.
                    </div>
                  )}

                </div>
              )}

            </div>
          );
        })}

      </div>

    </div>
  );
}