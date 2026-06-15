
// default homepage for the app, shows different content based on whether the user is signed in and has a company profile set up or not

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [company, setCompany] = useState<any>(null);

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

    setUserEmail(user.email || "");

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (profile) {
      const { data: companyData } = await supabase
        .from("companies")
        .select("*")
        .eq("id", profile.company_id)
        .single();

      setCompany(companyData);
    }

    setLoading(false);
  }

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!userEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="border p-8 rounded-lg max-w-md w-full">
          <h1 className="text-3xl font-bold mb-2">
            Data Intelligence Platform
          </h1>

          <p className="mb-6">
            Please login or sign up to continue.
          </p>

          <div className="flex flex-col gap-3">
            <Link href="/login" className="border p-3 text-center">
              Login
            </Link>

            <Link href="/signup" className="border p-3 text-center">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">
          Signed in as {userEmail}
        </h1>

        <p className="mb-4">
          No company profile is linked to this account yet.
        </p>

        <Link href="/company-setup" className="border p-3">
          Create Company Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl">
      <p className="mb-2">
        Signed in as: <strong>{userEmail}</strong>
      </p>

      <h1 className="text-3xl font-bold mb-4">
        {company.company_name}
      </h1>

      <div className="border p-4 mb-6">
        <p><strong>Country:</strong> {company.country}</p>
        <p><strong>Organization Type:</strong> {company.organization_type}</p>
        <p><strong>AI Use Case:</strong> {company.ai_use_case}</p>
        <p><strong>Benchmark Goal:</strong> {company.benchmark_goal}</p>
      </div>

      <div className="flex gap-3">
        <Link href="/report" className="border p-3">
          Start Report
        </Link>

        <Link href="/history" className="border p-3">
          View History
        </Link>

        <Link href="/company" className="border p-3">
          Edit Company Info
        </Link>
      </div>
    </div>
  );
}