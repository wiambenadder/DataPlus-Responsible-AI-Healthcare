// This page is for setting up the company information after the user signs up. It allows the user to enter their company name, country, organization type, AI use case, and benchmark goals. After submitting the form, it creates a new company record in the database and links the user to that company. Finally, it redirects the user to the report page.

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";


export default function CompanySetupPage() {
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [country, setCountry] = useState("");
  const [yearEstablished, setYearEstablished] =
    useState("");

  const [fullTimeStaff, setFullTimeStaff] =
    useState("");

  const [partTimeStaff, setPartTimeStaff] =
    useState("");

  const [organizationType, setOrganizationType] =
    useState("");

    const [invite, setInvite] =
  useState<any>(null);
  useEffect(() => {
  loadInvite();
}, []);
  
async function loadInvite() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email)
    return;

  const { data } =
    await supabase
      .from("company_invites")
      .select("*")
      .eq(
        "email",
        user.email
      )
      .eq(
        "accepted",
        false
      )
      .maybeSingle();

  setInvite(data);
}

async function acceptInvite() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !invite) {
    return;
  }

  const { error: profileError } =
    await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        company_id:
          invite.company_id,
        email:
          user.email,
        role:
          invite.role || "member",
      });

  if (profileError) {
    alert(profileError.message);
    return;
  }

  const { error: inviteError } =
    await supabase
      .from("company_invites")
      .update({
        accepted: true,
      })
      .eq("id", invite.id);

  if (inviteError) {
    alert(inviteError.message);
    return;
  }

  router.push("/dashboard");
}


  
async function createCompany() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    alert("Please login first");
    return;
  }

  const {
    data: company,
    error: companyError,
  } = await supabase
    .from("companies")
    .insert({
      company_name: companyName,

      country,

      year_established:
        Number(yearEstablished),

      full_time_staff:
        Number(fullTimeStaff),

      part_time_staff:
        Number(partTimeStaff),

      organization_type:
        organizationType,
    })
    .select()
    .single();

  if (companyError) {
    alert(companyError.message);
    return;
  }

  const { error: profileError } =
  await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      company_id: company.id,
      email: user.email,
      role: "admin",
    });

  if (profileError) {
    alert(profileError.message);
    return;
  }



  router.push("/report/background");
}



  return (
    <div className="max-w-3xl mx-auto p-8">
      {invite && (

  <div className="
    bg-blue-50
    border
    border-blue-200
    rounded-2xl
    p-6
    mb-8
  ">

    <h2 className="
      text-xl
      font-semibold
      mb-2
    ">
      Company Invitation
    </h2>

    <p className="
      text-gray-700
      mb-4
    ">
      You have been invited
      to join an existing
      company.
    </p>

    <button
      onClick={
        acceptInvite
      }
      className="
        bg-blue-600
        text-white
        px-5
        py-3
        rounded-xl
      "
    >
      Join Company
    </button>

  </div>

)}
      <h1 className="text-3xl font-bold mb-6">
        Organization Setup
      </h1>

      <div className="bg-white border rounded-2xl p-6">
        <div className="space-y-5">

          <input
            className="w-full border rounded-xl p-3"
            placeholder="Organization Name"
            value={companyName}
            onChange={(e) =>
              setCompanyName(e.target.value)
            }
          />

          <input
            className="w-full border rounded-xl p-3"
            placeholder="Country"
            value={country}
            onChange={(e) =>
              setCountry(e.target.value)
            }
          />

          <input
            type="number"
            className="w-full border rounded-xl p-3"
            placeholder="Year Established"
            value={yearEstablished}
            onChange={(e) =>
              setYearEstablished(
                e.target.value
              )
            }
          />

          <div className="grid grid-cols-2 gap-4">

            <input
              type="number"
              className="border rounded-xl p-3"
              placeholder="Full-Time Staff"
              value={fullTimeStaff}
              onChange={(e) =>
                setFullTimeStaff(
                  e.target.value
                )
              }
            />

            <input
              type="number"
              className="border rounded-xl p-3"
              placeholder="Part-Time Staff"
              value={partTimeStaff}
              onChange={(e) =>
                setPartTimeStaff(
                  e.target.value
                )
              }
            />

          </div>

          <select
            className="w-full border rounded-xl p-3"
            value={organizationType}
            onChange={(e) =>
              setOrganizationType(
                e.target.value
              )
            }
          >
            <option value="">
              Organization Type
            </option>

            <option value="For-Profit">
              For-Profit
            </option>

            <option value="Nonprofit">
              Nonprofit
            </option>
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