// default landing page - shows company info and links to reporting and history pages if signed in, otherwise shows sign in / sign up options

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Company = {
  company_name: string;
  country: string | null;
  organization_type: string | null;
  ai_use_case: string | null;
  benchmark_goal: string | null;
};

export default function HomePage() {
  const [loading, setLoading] = useState(true);

  const [signedIn, setSignedIn] =
    useState(false);

  const [company, setCompany] =
    useState<Company | null>(null);

  const [reportCount, setReportCount] =
    useState(0);

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

    setSignedIn(true);

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
        .from(
          "qualitative_responses"
        )
        .select(
          "reporting_period"
        )
        .eq(
          "company_id",
          profile.company_id
        );

    const uniqueReports =
      new Set(
        (reports || []).map(
          (r: any) =>
            r.reporting_period
        )
      );

    setReportCount(
      uniqueReports.size
    );

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="p-8">
        Loading...
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="
        min-h-screen
        bg-gradient-to-b
        from-white
        to-slate-50
        flex
        items-center
        justify-center
      ">

        <div className="
          max-w-xl
          text-center
        ">

          <h1 className="
            text-5xl
            font-bold
            mb-4
          ">
            Data Intelligence Platform
          </h1>

          <p className="
            text-gray-500
            mb-8
          ">
            Helping innovators
            report impact,
            benchmark progress,
            and communicate
            outcomes.
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

        <h1 className="
          text-4xl
          font-bold
          mb-2
        ">
          {company?.company_name}
        </h1>

        <p className="
          text-gray-500
          mb-8
        ">
          Welcome back.
        </p>

        <div className="
          grid
          md:grid-cols-3
          gap-6
          mb-8
        ">

          <div className="
            bg-white
            border
            rounded-2xl
            p-6
          ">
            <div className="
              text-gray-500
              text-sm
            ">
              Country
            </div>

            <div className="
              text-xl
              font-semibold
            ">
              {company?.country ||
                "Not Set"}
            </div>
          </div>

          <div className="
            bg-white
            border
            rounded-2xl
            p-6
          ">
            <div className="
              text-gray-500
              text-sm
            ">
              Reports Submitted
            </div>

            <div className="
              text-xl
              font-semibold
            ">
              {reportCount}
            </div>
          </div>

          <div className="
            bg-white
            border
            rounded-2xl
            p-6
          ">
            <div className="
              text-gray-500
              text-sm
            ">
              AI Usage
            </div>

            <div className="
              text-xl
              font-semibold
            ">
              {company?.ai_use_case
                ? "Configured"
                : "Not Set"}
            </div>
          </div>

        </div>

        <div className="
          bg-white
          border
          rounded-2xl
          p-6
          mb-8
        ">

          <h2 className="
            text-xl
            font-semibold
            mb-4
          ">
            Organization Overview
          </h2>

          <div className="space-y-3">

            <div>
              <strong>
                Organization Type:
              </strong>{" "}
              {
                company?.organization_type
              }
            </div>

            <div>
              <strong>
                AI Use:
              </strong>{" "}
              {
                company?.ai_use_case
              }
            </div>

            <div>
              <strong>
                Benchmark Goal:
              </strong>{" "}
              {
                company?.benchmark_goal
              }
            </div>

          </div>

        </div>

        <div className="
          flex
          gap-4
          flex-wrap
        ">

          <Link
            href="/report"
            className="
              bg-blue-600
              text-white
              px-6
              py-3
              rounded-xl
            "
          >
            Continue Reporting
          </Link>

          <Link
            href="/history"
            className="
              border
              px-6
              py-3
              rounded-xl
            "
          >
            View Report History
          </Link>

          <Link
            href="/company"
            className="
              border
              px-6
              py-3
              rounded-xl
            "
          >
            Edit Company Profile
          </Link>

        </div>

      </div>

    </div>
  );
}