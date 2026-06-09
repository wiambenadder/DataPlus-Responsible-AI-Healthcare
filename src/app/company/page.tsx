"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CompanyPage() {
  const [companyName, setCompanyName] = useState("");

  async function createCompany() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Not logged in");
      return;
    }

    // Create company
    const { data: company, error: companyError } =
      await supabase
        .from("companies")
        .insert({
          company_name: companyName,
        })
        .select()
        .single();

    if (companyError) {
      alert(companyError.message);
      return;
    }

    // Create profile link
    const { error: profileError } =
      await supabase
        .from("profiles")
        .insert({
          id: user.id,
          company_id: company.id,
        });

    if (profileError) {
      alert(profileError.message);
      return;
    }

    alert("Company created");
  }

  return (
    <div className="p-6">
      <h1>Create Company</h1>

      <input
        value={companyName}
        onChange={(e) =>
          setCompanyName(e.target.value)
        }
        placeholder="Company Name"
        className="border p-2"
      />

      <button
        onClick={createCompany}
        className="border p-2 ml-2"
      >
        Create
      </button>
    </div>
  );
}