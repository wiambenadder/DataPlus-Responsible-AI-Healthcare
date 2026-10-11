"use client";

import Link from "next/link";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CompanyPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [country, setCountry] = useState("");
  const [yearEstablished, setYearEstablished] = useState("");
  const [fullTimeStaff, setFullTimeStaff] = useState("");
  const [partTimeStaff, setPartTimeStaff] = useState("");
  const [organizationType, setOrganizationType] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  const [invites, setInvites] = useState<
    { id: string; email: string; created_at?: string | null }[] | null
  >(null);
  const [inviteMsg, setInviteMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [inviting, setInviting] = useState(false);

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

    if (!profile || !profile.company_id) {
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
    setYearEstablished(company.year_established?.toString() || "");
    setFullTimeStaff(company.full_time_staff?.toString() || "");
    setPartTimeStaff(company.part_time_staff?.toString() || "");
    setOrganizationType(company.organization_type || "");

    const { data: memberData } = await supabase
      .from("company_members")
      .select("*")
      .eq("company_id", company.id);

    const memberIds = memberData?.map((m) => m.user_id) || [];

    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", memberIds);

    const mergedMembers =
      memberData?.map((member) => ({
        ...member,
        profile: profileData?.find((profile) => profile.id === member.user_id),
      })) || [];

    setMembers(mergedMembers);
    await loadInvites(company.id);
    setLoading(false);
  }

  // Pending invitations. If the database doesn't let this user read them,
  // the list is simply hidden.
  async function loadInvites(id: string) {
    const { data, error } = await supabase
      .from("company_invites")
      .select("*")
      .eq("company_id", id);
    setInvites(error ? null : ((data ?? []) as { id: string; email: string; created_at?: string | null }[]));
  }

  async function updateCompany() {
    const { error } = await supabase
      .from("companies")
      .update({
        company_name: companyName,
        country,
        year_established: Number(yearEstablished),
        full_time_staff: Number(fullTimeStaff),
        part_time_staff: Number(partTimeStaff),
        organization_type: organizationType,
      })
      .eq("id", companyId);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Company details saved.");
  }

  async function inviteMember() {
    const email = inviteEmail.trim().toLowerCase();
    setInviteMsg(null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setInviteMsg({ ok: false, text: "That doesn't look like a complete email address." });
      return;
    }
    if (members.some((m) => m.profile?.email?.toLowerCase() === email)) {
      setInviteMsg({ ok: false, text: `${email} is already on your team.` });
      return;
    }
    if (invites?.some((i) => i.email?.toLowerCase() === email)) {
      setInviteMsg({ ok: false, text: `${email} already has a pending invitation.` });
      return;
    }

    setInviting(true);
    const { error } = await supabase
      .from("company_invites")
      .insert({ company_id: companyId, email, role: "member" });
    setInviting(false);

    if (error) {
      setInviteMsg({ ok: false, text: `The invitation wasn't created: ${error.message}` });
      return;
    }

    setInviteEmail("");
    setInviteMsg({
      ok: true,
      text: `Invitation created for ${email}. Let them know: it appears when they log in or sign up with exactly this address.`,
    });
    await loadInvites(companyId);
  }

  async function cancelInvite(id: string, email: string) {
    if (!window.confirm(`Cancel the invitation for ${email}?`)) return;
    const { data, error } = await supabase
      .from("company_invites")
      .delete()
      .eq("id", id)
      .select("id");
    if (error || !data?.length) {
      setInviteMsg({
        ok: false,
        text: "The invitation couldn't be cancelled. Ask the platform team to remove it.",
      });
      return;
    }
    setInvites((prev) => prev?.filter((i) => i.id !== id) ?? null);
    setInviteMsg({ ok: true, text: `Invitation for ${email} cancelled.` });
  }

  async function removeMember(member: any) {
  const confirmed = window.confirm(
    `Remove ${member.profile?.full_name || member.profile?.email} from this company?`
  );

  if (!confirmed) return;

  const { error } = await supabase
    .from("company_members")
    .delete()
    .eq("id", member.id);

  if (error) {
    alert(error.message);
    return;
  }

  await supabase
    .from("profiles")
    .update({
      company_id: null,
    })
    .eq("id", member.user_id);

  setMembers((prev) =>
    prev.filter(
      (m) => m.id !== member.id
    )
  );
}

  if (loading) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-slate-600 sm:px-6">Loading company profile…</div>;
  }

  const field = "mt-1 w-full border border-slate-300 bg-white px-3 py-2.5 text-[15px] font-normal focus:border-brand-dukeblue";
  const label = "block text-sm font-semibold text-slate-800";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
        <Link href="/" className="hover:underline">Home</Link>
        <span className="mx-2" aria-hidden>›</span>
        <span>Company and Team</span>
      </nav>
      <h1 className="mt-3 text-4xl">Company and Team</h1>
      <p className="mt-2 text-[16px] text-slate-700">
        Your organization&apos;s details and who can see your assessment.
      </p>

      <h2 className="mt-10 text-2xl">Organization Details</h2>
      <div className="mt-4 space-y-5 border-t border-slate-200 pt-6">
        <label className={label}>
          Organization name
          <input className={field} value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        </label>
        <label className={label}>
          Country
          <input className={field} value={country} onChange={(e) => setCountry(e.target.value)} />
        </label>
        <label className={label}>
          Year established
          <input type="number" className={field} value={yearEstablished} onChange={(e) => setYearEstablished(e.target.value)} />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
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
          Organization type
          <select className={field} value={organizationType} onChange={(e) => setOrganizationType(e.target.value)}>
            <option value="">Choose one</option>
            <option value="For-Profit">For-profit</option>
            <option value="Nonprofit">Nonprofit</option>
          </select>
        </label>
        <button onClick={updateCompany} className="btn btn-primary">
          Save Changes
        </button>
      </div>

      <h2 className="mt-14 text-2xl">Team Members</h2>
      <ul className="mt-4 divide-y divide-slate-200 border-y border-slate-200">
        {members.length === 0 ? (
          <li className="py-3 text-slate-600">No team members yet.</li>
        ) : (
          members.map((member) => (
            <li key={member.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="font-semibold text-slate-900">{member.profile?.full_name || "Name not set"}</p>
                <p className="truncate text-sm text-slate-600">{member.profile?.email || "No email"}</p>
              </div>
              <div className="flex shrink-0 items-center gap-4 text-sm">
                <span className="text-slate-600">{member.role === "admin" ? "Owner" : "Member"}</span>
                {member.role !== "admin" && (
                  <button onClick={() => removeMember(member)} className="font-semibold text-red-700 hover:underline">
                    Remove
                  </button>
                )}
              </div>
            </li>
          ))
        )}
      </ul>

      <h3 className="mt-10 text-lg font-semibold text-brand-navy">Invite a Colleague</h3>
      <p className="mt-1 text-[15px] text-slate-700">
        No email is sent. The invitation appears when your colleague logs in or
        signs up with <strong>exactly</strong> the address you enter here, so
        double-check it.
      </p>
      <form
        className="mt-3 flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          inviteMember();
        }}
      >
        <label className="sr-only" htmlFor="invite-email">Colleague&apos;s email address</label>
        <input
          id="invite-email"
          type="email"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          placeholder="name@organization.org"
          className="flex-1 border border-slate-300 px-3 py-2.5 text-[15px] focus:border-brand-dukeblue"
        />
        <button type="submit" disabled={inviting} className="btn btn-primary">
          {inviting ? "Inviting…" : "Invite"}
        </button>
      </form>
      {inviteMsg && (
        <p role="status" className={`mt-2 text-sm ${inviteMsg.ok ? "text-brand-darkteal" : "text-red-700"}`}>
          {inviteMsg.text}
        </p>
      )}

      {invites && invites.length > 0 && (
        <>
          <h3 className="mt-8 text-sm font-semibold text-slate-800">Pending Invitations</h3>
          <ul className="mt-2 divide-y divide-slate-200 border-y border-slate-200">
            {invites.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between gap-4 py-2.5 text-[15px]">
                <span className="truncate">{inv.email}</span>
                <button
                  onClick={() => cancelInvite(inv.id, inv.email)}
                  className="shrink-0 text-sm font-semibold text-red-700 hover:underline"
                >
                  Cancel invitation
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-slate-600">
            Wrong address? Cancel the invitation and send a new one.
          </p>
        </>
      )}
    </div>
  );
}