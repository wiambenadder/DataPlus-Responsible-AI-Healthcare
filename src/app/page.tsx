"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function HomePage() {
  const [loading, setLoading] = useState(true);

  const [company, setCompany] =
    useState<any>(null);

  const [lastReport, setLastReport] =
    useState("No reports yet");

  const [reportCount, setReportCount] =
    useState(0);

  const [recentAssessments, setRecentAssessments] =
    useState<any[]>([]);

  useEffect(() => {
    loadHome();
  }, []);

  async function loadHome() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: profile } =
      await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();

    if (!profile) {
      setLoading(false);
      return;
    }

    const { data: companyData } =
      await supabase
        .from("companies")
        .select("*")
        .eq("id", profile.company_id)
        .single();

    setCompany(companyData);

    const { data: reports } =
      await supabase
        .from("qualitative_responses")
        .select("*")
        .eq(
          "company_id",
          profile.company_id
        );

    if (reports?.length) {
      const periods = [
        ...new Set(
          reports.map(
            (r: any) =>
              r.reporting_period
          )
        ),
      ];

      setReportCount(periods.length);

      setLastReport(
        periods[periods.length - 1]
      );

      setRecentAssessments(
        reports.slice(0, 3)
      );
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="p-8">
        Loading...
      </div>
    );
  }

  if (!company) {
    return (
      <div className="p-8">
        No company profile found.
      </div>
    );
  }

  return (
    <div className="
      min-h-screen
      bg-gradient-to-b
      from-white
      to-slate-50
    ">

      <div className="
        text-center
        max-w-3xl
        px-8
      ">

        <h1 className="
          text-5xl
          font-bold
          mb-6
        ">
          Welcome to the Data Intelligence Platform
        </h1>

        <p className="
          text-xl
          text-gray-600
          mb-8
        ">
          Assess organizational readiness,
          collect structured reporting,
          and generate AI-supported
          insights across the full
          innovation lifecycle.
        </p>

        <div className="
          flex
          justify-center
          gap-4
        ">

          <Link
            href="/login"
            className="
              bg-blue-600
              text-white
              px-6
              py-3
              rounded-xl
            "
          >
            Sign In
          </Link>

          <Link
            href="/signup"
            className="
              border
              px-6
              py-3
              rounded-xl
            "
          >
            Create Account
          </Link>

        </div>

      </div>

    </div>
  );
}

  return (
    <div className="
      min-h-screen
      bg-gradient-to-b
      from-white
      to-slate-50
    ">

      <div className="
        max-w-6xl
        mx-auto
        p-8
      ">

        {/* Hero */}

        <div className="
          bg-white
          rounded-3xl
          shadow-sm
          p-8
          mb-8
        ">

          <div className="
            flex
            justify-between
            items-start
            flex-wrap
            gap-6
          ">

            <div>

              <h1 className="
                text-4xl
                font-bold
              ">
                {company.company_name}
              </h1>

              <p className="
                text-gray-500
                mt-2
              ">
                {company.organization_type}
              </p>

              <p className="
                text-gray-500
              ">
                {company.country}
              </p>

            </div>

            <div className="
              text-right
            ">

              <div className="
                text-3xl
                font-bold
              ">
                {reportCount}
              </div>

              <div className="
                text-gray-500
              ">
                Reports Submitted
              </div>

            </div>

          </div>

        </div>

        {/* Continue Reporting */}

        <div className="
          bg-teal-600
          text-white
          rounded-3xl
          p-8
          mb-8
        ">

          <div className="
            flex
            justify-between
            items-center
            flex-wrap
            gap-4
          ">

            <div>

              <h2 className="
                text-2xl
                font-semibold
                mb-2
              ">
                Continue Reporting
              </h2>

              <p className="
                text-teal-100
              ">
                Last report:
                {" "}
                {lastReport}
              </p>

            </div>

            <Link
              href="/report"
              className="
                bg-white
                text-teal-600
                px-5
                py-3
                rounded-xl
                font-medium
              "
            >
              Continue →
            </Link>

          </div>

        </div>

        {/* Stats */}

        <div className="
          grid
          md:grid-cols-3
          gap-4
          mb-8
        ">

          <div className="
            bg-white
            rounded-2xl
            shadow-sm
            p-6
          ">

            <div className="
              text-sm
              text-gray-500
            ">
              Full-Time Staff
            </div>

            <div className="
              text-2xl
              font-bold
            ">
              {
                company.full_time_staff
              }
            </div>

          </div>

          <div className="
            bg-white
            rounded-2xl
            shadow-sm
            p-6
          ">

            <div className="
              text-sm
              text-gray-500
            ">
              Part-Time Staff
            </div>

            <div className="
              text-2xl
              font-bold
            ">
              {
                company.part_time_staff
              }
            </div>

          </div>

          <div className="
            bg-white
            rounded-2xl
            shadow-sm
            p-6
          ">

            <div className="
              text-sm
              text-gray-500
            ">
              Established
            </div>

            <div className="
              text-2xl
              font-bold
            ">
              {
                company.year_established
              }
            </div>

          </div>

        </div>

        {/* Recent Activity */}

        <div className="
          bg-white
          rounded-3xl
          shadow-sm
          p-8
          mb-8
        ">

          <h2 className="
            text-xl
            font-semibold
            mb-4
          ">
            Recent Assessment Activity
          </h2>

          {recentAssessments.length === 0 ? (
            <p className="
              text-gray-500
            ">
              No assessments yet.
            </p>
          ) : (
            <div className="
              space-y-4
            ">

              {recentAssessments.map(
                (assessment) => (
                  <div
                    key={assessment.id}
                    className="
                      border-l-4
                      border-blue-500
                      pl-4
                    "
                  >

                    <div className="
                      font-medium
                    ">
                      {
                        assessment.Subtopic
                      }
                    </div>

                    <div className="
                      text-sm
                      text-gray-500
                    ">
                      {
                        assessment.ai_assessment
                      }
                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </div>

        {/* Reminder */}

        <div className="
          bg-white
          rounded-3xl
          shadow-sm
          p-8
        ">

          <h2 className="
            text-xl
            font-semibold
            mb-3
          ">
            Reminder
          </h2>

          <p className="
            text-gray-600
          ">
            Continue submitting interview
            responses and review your AI
            readiness dashboard for updated
            assessments and recommendations.
          </p>

        </div>

      </div>

    </div>
  );
}