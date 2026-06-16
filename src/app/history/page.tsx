"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ResponseRow = {
  id: string;
  company_id: string;
  reporting_period: string | null;
  question: string;
  answer: string;
  domain: string | null;
  Subtopic: string | null;
  ai_assessment: string | null;
  ai_reasoning: string | null;
};

export default function HistoryPage() {
  const [loading, setLoading] =
    useState(true);

  const [reports, setReports] =
    useState<
      Record<string, ResponseRow[]>
    >({});

  const [expanded, setExpanded] =
    useState<
      Record<string, boolean>
    >({});

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const {
        data: profile,
      } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();

      if (!profile) {
        setLoading(false);
        return;
      }

      const {
        data,
        error,
      } = await supabase
        .from("qualitative_responses")
        .select("*")
        .eq(
          "company_id",
          profile.company_id
        );

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      const grouped: Record<
        string,
        ResponseRow[]
      > = {};

      (data || []).forEach(
        (row: any) => {
          const period =
            row.reporting_period ||
            "Unknown Period";

          if (!grouped[period]) {
            grouped[period] = [];
          }

          grouped[period].push(row);
        }
      );

      setReports(grouped);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }

  function togglePeriod(
    period: string
  ) {
    setExpanded((prev) => ({
      ...prev,
      [period]:
        !prev[period],
    }));
  }

  async function saveResponse(
    id: string,
    answer: string
  ) {
    const { error } =
      await supabase
        .from(
          "qualitative_responses"
        )
        .update({
          answer,
        })
        .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Saved");
  }

  if (loading) {
    return (
      <div className="p-8">
        Loading history...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">

      <div className="max-w-5xl mx-auto p-8">

        <h1 className="text-4xl font-bold mb-8">
          Report History
        </h1>

        {Object.keys(reports)
          .sort()
          .reverse()
          .map((period) => (
            <div
              key={period}
              className="
                bg-white
                border
                rounded-2xl
                shadow-sm
                mb-4
                overflow-hidden
              "
            >

              <button
                onClick={() =>
                  togglePeriod(
                    period
                  )
                }
                className="
                  w-full
                  text-left
                  p-5
                  flex
                  justify-between
                  items-center
                "
              >

                <div>

                  <div className="font-semibold text-lg">
                    {period}
                  </div>

                  <div className="text-sm text-gray-500">
                    {
                      reports[
                        period
                      ].length
                    }{" "}
                    responses
                  </div>

                </div>

                <div className="text-xl">
                  {expanded[
                    period
                  ]
                    ? "−"
                    : "+"}
                </div>

              </button>

              {expanded[
                period
              ] && (
                <div className="border-t p-5">

                  {reports[
                    period
                  ].map(
                    (
                      response
                    ) => (
                      <EditableResponse
                        key={
                          response.id
                        }
                        response={
                          response
                        }
                        onSave={
                          saveResponse
                        }
                      />
                    )
                  )}

                </div>
              )}

            </div>
          ))}

        {Object.keys(reports)
          .length === 0 && (
          <div className="
            bg-white
            border
            rounded-2xl
            p-6
          ">
            No reports found.
          </div>
        )}

      </div>

    </div>
  );
}

function EditableResponse({
  response,
  onSave,
}: {
  response: ResponseRow;
  onSave: (
    id: string,
    answer: string
  ) => void;
}) {
  const [answer, setAnswer] =
    useState(
      response.answer
    );

  return (
    <div className="
      border-b
      pb-6
      mb-6
      last:border-b-0
    ">

      {(response.domain ||
        response.Subtopic) && (
        <div className="
          text-sm
          text-gray-500
          mb-2
        ">

          {response.domain}

          {response.domain &&
            response.Subtopic &&
            " • "}

          {response.Subtopic}

        </div>
      )}

      <div className="
        font-medium
        mb-3
      ">
        {response.question}
      </div>

      <textarea
        value={answer}
        onChange={(e) =>
          setAnswer(
            e.target.value
          )
        }
        className="
          w-full
          h-32
          border
          rounded-xl
          p-3
          resize-none
        "
      />

      <button
        onClick={() =>
          onSave(
            response.id,
            answer
          )
        }
        className="
          mt-3
          bg-blue-600
          text-white
          px-4
          py-2
          rounded-xl
        "
      >
        Save Changes
      </button>

      {(response.ai_assessment ||
        response.ai_reasoning) && (
        <div className="
          mt-4
          bg-slate-50
          border
          rounded-xl
          p-4
        ">

          <div className="
            font-medium
            mb-1
          ">
            AI Assessment
          </div>

          <div className="mb-3">
            {
              response.ai_assessment
            }
          </div>

          <div className="
            font-medium
            mb-1
          ">
            AI Reasoning
          </div>

          <div>
            {
              response.ai_reasoning
            }
          </div>

        </div>
      )}

    </div>
  );
}