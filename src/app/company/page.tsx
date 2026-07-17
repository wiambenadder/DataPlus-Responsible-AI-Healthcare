// The company profile page for editing existing company information and managing members
// comapny information located in the "companies" table on sql, company invites managed on the "company_invites" table, and company members managed on the "company_members" table

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
  const [yearEstablished, setYearEstablished] = useState("");
  const [fullTimeStaff, setFullTimeStaff] = useState("");
  const [partTimeStaff, setPartTimeStaff] = useState("");
  const [organizationType, setOrganizationType] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [members, setMembers] = useState<any[]>([]);

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

      // if the users have not yet created or joined a company, then redirect to company setup page as there is no company information available
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
    setLoading(false);
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

    alert("Company profile updated");
    router.push("/dashboard");
  }

  async function inviteMember() {
    if (!inviteEmail.trim()) {
      return;
    }

    const { error } = await supabase
      .from("company_invites")
      .insert({
        company_id: companyId,
        email: inviteEmail,
        role: "member",
      });

    if (error) {
      alert(error.message);
      return;
    }

    setInviteEmail("");
    alert("Invitation created");
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
    return <div className="p-8">Loading company profile...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-2">Company Profile</h1>
        <p className="text-gray-500 mb-8">Update your organization's information.</p>

        <div className="bg-white border rounded-2xl p-8 shadow-sm">
          <div className="space-y-6">

            <div>
              <label className="block mb-2 font-medium">Organization Name</label>
              <input
                className="w-full border rounded-xl p-3"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Country</label>
              <input
                className="w-full border rounded-xl p-3"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Year Established</label>
              <input
                type="number"
                className="w-full border rounded-xl p-3"
                value={yearEstablished}
                onChange={(e) => setYearEstablished(e.target.value)}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium">Full-Time Staff</label>
                <input
                  type="number"
                  className="w-full border rounded-xl p-3"
                  value={fullTimeStaff}
                  onChange={(e) => setFullTimeStaff(e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">Part-Time Staff</label>
                <input
                  type="number"
                  className="w-full border rounded-xl p-3"
                  value={partTimeStaff}
                  onChange={(e) => setPartTimeStaff(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 font-medium">Organization Type</label>
              <select
                className="w-full border rounded-xl p-3"
                value={organizationType}
                onChange={(e) => setOrganizationType(e.target.value)}
              >
                <option value="">Select Type</option>
                <option value="For-Profit">For-Profit</option>
                <option value="Nonprofit">Nonprofit</option>
              </select>
            </div>

            <button
              onClick={updateCompany}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl"
            >
              Save Changes
            </button>

          </div>
        </div>

        <div className="mt-10 border-t pt-8">
          <h2 className="text-2xl font-semibold mb-4">Team Members</h2>

          {members.length === 0 ? (
            <div className="text-gray-500 mb-6">No team members yet.</div>
          ) : (
            <div className="space-y-2 mb-6">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex justify-between items-center border rounded-xl p-3"
                >
                  <div>
                    <div className="font-medium">
                      {member.profile?.full_name || "Unnamed User"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {member.profile?.email || "No email"}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">

  <div
    className={`text-sm px-3 py-1 rounded-full ${
      member.role === "admin"
        ? "bg-blue-100 text-blue-700"
        : "bg-slate-100 text-slate-700"
    }`}
  >
    {member.role === "admin"
      ? "Owner"
      : "Member"}
  </div>

  {member.role !== "admin" && (

    <button
      onClick={() =>
        removeMember(member)
      }
      className="
        text-red-600
        hover:text-red-700
        text-sm
      "
    >
      Remove
    </button>

  )}

</div>
                </div>
              ))}
            </div>
          )}

          <h3 className="text-lg font-medium mb-3">Invite User</h3>
          <div className="flex gap-3">
            <input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="email@example.com"
              className="flex-1 border rounded-xl p-3"
            />
            <button
              onClick={inviteMember}
              className="bg-blue-600 text-white px-5 rounded-xl"
            >
              Invite
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}