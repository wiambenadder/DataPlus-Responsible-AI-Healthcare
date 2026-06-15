// company page for the app, allows users to view and edit their company profile information, redirects to login page if not authenticated, redirects to company setup page if company profile is not found
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CompanyPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [country, setCountry] = useState("");
  const [organizationType, setOrganizationType] = useState("");
  const [aiUseCase, setAiUseCase] = useState("");
  const [benchmarkGoal, setBenchmarkGoal] = useState("");

  useEffect(() => {
    loadCompany();
  }, []);

  async function loadCompany() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      router.push("/company-setup");
      return;
    }

    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("*")
      .eq("id", profile.company_id)
      .single();

    if (companyError || !company) {
      alert("Company profile not found");
      return;
    }

    setCompanyId(company.id);
    setCompanyName(company.company_name || "");
    setCountry(company.country || "");
    setOrganizationType(company.organization_type || "");
    setAiUseCase(company.ai_use_case || "");
    setBenchmarkGoal(company.benchmark_goal || "");

    setLoading(false);
  }

  async function updateCompany() {
    const { error } = await supabase
      .from("companies")
      .update({
        company_name: companyName,
        country,
        organization_type: organizationType,
        ai_use_case: aiUseCase,
        benchmark_goal: benchmarkGoal,
      })
      .eq("id", companyId);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Company profile updated");
    router.push("/");
  }

  if (loading) {
    return <div className="p-6">Loading company profile...</div>;
  }

  return (
    <div className="max-w-2xl p-6">
      <h1 className="text-2xl font-bold mb-6">
        Edit Company Profile
      </h1>

      <div className="flex flex-col gap-4">
        <input
          className="border p-2"
          placeholder="Company Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />

        <input
          className="border p-2"
          placeholder="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />

        <input
          className="border p-2"
          placeholder="Organization Type"
          value={organizationType}
          onChange={(e) => setOrganizationType(e.target.value)}
        />

        <textarea
          className="border p-2"
          placeholder="How do you use AI?"
          value={aiUseCase}
          onChange={(e) => setAiUseCase(e.target.value)}
        />

        <textarea
          className="border p-2"
          placeholder="Benchmark goals"
          value={benchmarkGoal}
          onChange={(e) => setBenchmarkGoal(e.target.value)}
        />

        <button
          onClick={updateCompany}
          className="border p-3"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}