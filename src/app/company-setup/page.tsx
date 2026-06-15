"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CompanySetupPage() {
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [country, setCountry] = useState("");
  const [organizationType, setOrganizationType] = useState("");
  const [aiUseCase, setAiUseCase] = useState("");
  const [benchmarkGoal, setBenchmarkGoal] = useState("");

  async function createCompany() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first");
      return;
    }

    // Create company
    const { data: company, error: companyError } =
      await supabase
        .from("companies")
        .insert({
          company_name: companyName,
          country,
          organization_type: organizationType,
          ai_use_case: aiUseCase,
          benchmark_goal: benchmarkGoal,
        })
        .select()
        .single();

    if (companyError) {
      console.error(companyError);
      alert(companyError.message);
      return;
    }

    // Link user to company
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        company_id: company.id,
      });

    if (profileError) {
      console.error(profileError);
      alert(profileError.message);
      return;
    }

    alert("Company created successfully");

    router.push("/report");
  }

  return (
    <div className="max-w-2xl p-6">
      <h1 className="text-2xl font-bold mb-6">
        Company Setup
      </h1>

      <div className="flex flex-col gap-4">

        <input
          className="border p-2"
          placeholder="Company Name"
          value={companyName}
          onChange={(e) =>
            setCompanyName(e.target.value)
          }
        />

        <input
          className="border p-2"
          placeholder="Country"
          value={country}
          onChange={(e) =>
            setCountry(e.target.value)
          }
        />

        <input
          className="border p-2"
          placeholder="Organization Type"
          value={organizationType}
          onChange={(e) =>
            setOrganizationType(e.target.value)
          }
        />

        <textarea
          className="border p-2"
          placeholder="How do you use AI?"
          value={aiUseCase}
          onChange={(e) =>
            setAiUseCase(e.target.value)
          }
        />

        <textarea
          className="border p-2"
          placeholder="What are your benchmark goals?"
          value={benchmarkGoal}
          onChange={(e) =>
            setBenchmarkGoal(e.target.value)
          }
        />

        <button
          onClick={createCompany}
          className="border p-3"
        >
          Create Company
        </button>

      </div>
    </div>
  );
}