// This page is for setting up the company information after the user signs up. It allows the user to enter their company name, country, organization type, AI use case, and benchmark goals. After submitting the form, it creates a new company record in the database and links the user to that company. Finally, it redirects the user to the report page.
//
// It also checks for a pending invite matching the user's email — if one exists, it shows a
// banner letting them join the existing company instead of creating a new one.

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CompanySetupPage() {
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [country, setCountry] = useState("");
  const [yearEstablished, setYearEstablished] = useState("");
  const [fullTimeStaff, setFullTimeStaff] = useState("");
  const [partTimeStaff, setPartTimeStaff] = useState("");
  const [organizationType, setOrganizationType] = useState("");

  // Invite-related state
  const [userId, setUserId] = useState<string | null>(null);
  const [checkingInvite, setCheckingInvite] = useState(true);
  const [invite, setInvite] = useState<any>(null);
  const [inviteCompanyName, setInviteCompanyName] = useState("");
  const [acceptingInvite, setAcceptingInvite] = useState(false);

  useEffect(() => {
    checkForInvite();
  }, []);

  async function checkForInvite() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setCheckingInvite(false);
      return;
    }

    setUserId(user.id);

    if (!user.email) {
      setCheckingInvite(false);
      return;
    }

    // NOTE: a given email can have more than one pending invite row (e.g. invited
    // twice, or by two different companies), so this intentionally does NOT use
    // .single()/.maybeSingle() — those throw if more than one row comes back.
    const { data: inviteRows, error: inviteError } = await supabase
      .from("company_invites")
      .select("*")
      .ilike("email", user.email);

    if (inviteError) {
      console.error("Failed to check for invites:", inviteError.message);
      setCheckingInvite(false);
      return;
    }

    if (inviteRows && inviteRows.length > 0) {
      // If there are duplicates, just show the most recent one (falls back to
      // the last row returned if this table has no created_at column).
      const sorted = [...inviteRows].sort((a, b) => {
        if (!a.created_at || !b.created_at) return 0;
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
      const mostRecentInvite = sorted[0];

      setInvite(mostRecentInvite);

      const { data: companyData } = await supabase
        .from("companies")
        .select("company_name")
        .eq("id", mostRecentInvite.company_id)
        .single();

      setInviteCompanyName(companyData?.company_name || "this organization");
    }

    setCheckingInvite(false);
  }

  async function acceptInvite() {
    if (!invite || !userId) return;

    setAcceptingInvite(true);

    const { error: memberError } = await supabase
      .from("company_members")
      .insert({
        company_id: invite.company_id,
        user_id: userId,
        role: invite.role || "member",
      });

    if (memberError) {
      alert(memberError.message);
      setAcceptingInvite(false);
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        company_id: invite.company_id,
      });

    if (profileError) {
      alert(profileError.message);
      setAcceptingInvite(false);
      return;
    }

    // Clean up every pending invite for this email (not just the accepted one) so
    // leftover duplicates don't cause the "multiple rows" error again later.
    await supabase.from("company_invites").delete().ilike("email", invite.email);

    router.push("/report/assessment");
  }

  function dismissInvite() {
    setInvite(null);
  }

  async function createCompany() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first");
      return;
    }

    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert({
        company_name: companyName,
        country,
        year_established: Number(yearEstablished),
        full_time_staff: Number(fullTimeStaff),
        part_time_staff: Number(partTimeStaff),
        organization_type: organizationType,
      })
      .select()
      .single();

    if (companyError) {
      alert(companyError.message);
      return;
    }

    await supabase.from("company_members").insert({
      company_id: company.id,
      user_id: user.id,
      role: "admin",
    });

    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      company_id: company.id,
    });

    if (profileError) {
      alert(profileError.message);
      return;
    }

    router.push("/report/assessment");
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Organization Setup</h1>

      {!checkingInvite && invite ? (
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-blue-900">
              You've been invited to join {inviteCompanyName}
            </p>
            <p className="mt-1 text-sm text-blue-700">
              Accept the invite to join this organization, or dismiss it to
              create a new one instead.
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <button
              onClick={dismissInvite}
              disabled={acceptingInvite}
              className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Dismiss
            </button>
            <button
              onClick={acceptInvite}
              disabled={acceptingInvite}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {acceptingInvite ? "Joining…" : "Accept Invite"}
            </button>
          </div>
        </div>
      ) : null}

      <div className="bg-white border rounded-2xl p-6">
        <div className="space-y-5">
          <input
            className="w-full border rounded-xl p-3"
            placeholder="Organization Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />

          <input
            className="w-full border rounded-xl p-3"
            placeholder="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />

          <input
            type="number"
            className="w-full border rounded-xl p-3"
            placeholder="Year Established"
            value={yearEstablished}
            onChange={(e) => setYearEstablished(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              className="border rounded-xl p-3"
              placeholder="Full-Time Staff"
              value={fullTimeStaff}
              onChange={(e) => setFullTimeStaff(e.target.value)}
            />

            <input
              type="number"
              className="border rounded-xl p-3"
              placeholder="Part-Time Staff"
              value={partTimeStaff}
              onChange={(e) => setPartTimeStaff(e.target.value)}
            />
          </div>

          <select
            className="w-full border rounded-xl p-3"
            value={organizationType}
            onChange={(e) => setOrganizationType(e.target.value)}
          >
            <option value="">Organization Type</option>
            <option value="For-Profit">For-Profit</option>
            <option value="Nonprofit">Nonprofit</option>
          </select>

          <button
            onClick={createCompany}
            className="
              bg-blue-600
              text-white
              px-6
              py-3
              rounded-xl
            "
          >
            Create Company
          </button>
        </div>
      </div>
    </div>
  );
}