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
    initSetup();
  }, []);

  async function initSetup() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // No active session — send them to log in instead of leaving them on
      // a form that can never successfully submit.
      router.push("/login");
      return;
    }

    setUserId(user.id);

    // NEW: if this user already has a company linked, there's nothing to set
    // up — send them straight to the app instead of showing this form again.
    // Without this check, a user who already has a company_id could still
    // land here and create a second, duplicate company.
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .maybeSingle();

    if (existingProfile?.company_id) {
      router.push("/dashboard");
      return;
    }

    await checkForInvite(user);
  }

  async function checkForInvite(user: { id: string; email?: string | null }) {
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
      alert("Your session has expired. Please log in again.");
      router.push("/login");
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

    // Uses a plain insert rather than upsert: this company_id was just
    // created above, so there is no way a company_members row for this
    // (company_id, user_id) pair could already exist yet. A plain insert
    // with real error handling is sufficient here — no unique constraint
    // on (company_id, user_id) required.
    const { error: memberError } = await supabase.from("company_members").insert({
      company_id: company.id,
      user_id: user.id,
      role: "admin",
    });

    if (memberError) {
      alert(memberError.message);
      return;
    }

    // FIXED: was .insert(), which fails with a primary-key conflict if a
    // profiles row for this user already exists (e.g. created by a DB
    // trigger on auth.users, or by the signup page upserting a default
    // full_name). That silent failure meant company_id was NEVER actually
    // written to the profile — so the user got bounced back here forever,
    // and every retry created a brand-new orphaned company. Upsert fixes
    // this the same way acceptInvite() already does it above.
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.id,
      company_id: company.id,
    });

    if (profileError) {
      alert(profileError.message);
      return;
    }

    router.push("/report/assessment");
  }

  const field = "mt-1 w-full border border-slate-300 bg-white px-3 py-2.5 text-[15px] focus:border-brand-dukeblue";
  const label = "block text-sm font-semibold text-slate-800";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="label-caps">Getting started</p>
      <h1 className="mt-2 text-4xl">Set up your organisation</h1>
      <p className="mt-3 max-w-2xl text-[16px] text-slate-700">
        Your assessment belongs to your organisation, so everyone on your team
        sees the same results.
      </p>

      {!checkingInvite && invite ? (
        <div className="mt-8 border-l-4 border-brand-teal bg-slate-50 p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <p className="text-lg font-semibold text-brand-navy">
              You&apos;ve been invited to join {inviteCompanyName}
            </p>
            <p className="mt-1 text-[15px] text-slate-700">
              Join to see and work on their assessment, or dismiss the invitation
              to create a new organisation.
            </p>
          </div>
          <div className="mt-4 flex shrink-0 gap-3 sm:mt-0">
            <button onClick={dismissInvite} disabled={acceptingInvite} className="btn btn-secondary">
              Dismiss
            </button>
            <button onClick={acceptInvite} disabled={acceptingInvite} className="btn btn-primary">
              {acceptingInvite ? "Joining…" : "Join"}
            </button>
          </div>
        </div>
      ) : !checkingInvite ? (
        <div className="mt-8 border-l-4 border-slate-300 bg-slate-50 p-5 text-[15px] text-slate-700">
          <p className="font-semibold text-slate-900">Is your organisation already on the platform?</p>
          <p className="mt-1">
            Don&apos;t create it again. Ask a colleague who has an account to invite
            you from <strong>Account → Company and team</strong>, using exactly the
            email address you signed up with. The invitation will then appear on
            this page.
          </p>
        </div>
      ) : null}

      <h2 className="mt-10 text-2xl">Create a new organisation</h2>
      <div className="mt-4 space-y-5 border-t border-slate-200 pt-6">
        <label className={label}>
          Organisation name
          <input className={field} value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        </label>

        <label className={label}>
          Country where you mainly work
          <input className={field} value={country} onChange={(e) => setCountry(e.target.value)} />
        </label>

        <label className={label}>
          Year established
          <input type="number" className={field} value={yearEstablished} onChange={(e) => setYearEstablished(e.target.value)} />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className={label}>
            Full-time staff
            <input type="number" className={field} value={fullTimeStaff} onChange={(e) => setFullTimeStaff(e.target.value)} />
          </label>
          <label className={label}>
            Part-time staff
            <input type="number" className={field} value={partTimeStaff} onChange={(e) => setPartTimeStaff(e.target.value)} />
          </label>
        </div>

        <label className={label}>
          Organisation type
          <select className={field} value={organizationType} onChange={(e) => setOrganizationType(e.target.value)}>
            <option value="">Choose one</option>
            <option value="For-Profit">For-profit</option>
            <option value="Nonprofit">Nonprofit</option>
          </select>
        </label>

        <button onClick={createCompany} className="btn btn-primary">
          Create organisation
        </button>
      </div>
    </div>
  );
}