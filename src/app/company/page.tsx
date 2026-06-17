"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CompanyPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [companyId, setCompanyId] =
    useState("");

  const [companyName, setCompanyName] =
    useState("");

  const [country, setCountry] =
    useState("");

  const [yearEstablished, setYearEstablished] =
    useState("");

  const [fullTimeStaff, setFullTimeStaff] =
    useState("");

  const [partTimeStaff, setPartTimeStaff] =
    useState("");

  const [organizationType, setOrganizationType] =
    useState("");

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

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      router.push("/company-setup");
      return;
    }

    const {
      data: company,
      error: companyError,
    } = await supabase
      .from("companies")
      .select("*")
      .eq("id", profile.company_id)
      .single();

    if (companyError || !company) {
      alert("Company profile not found");
      return;
    }

    setCompanyId(company.id);

    setCompanyName(
      company.company_name || ""
    );

    setCountry(
      company.country || ""
    );

    setYearEstablished(
      company.year_established
        ?.toString() || ""
    );

    setFullTimeStaff(
      company.full_time_staff
        ?.toString() || ""
    );

    setPartTimeStaff(
      company.part_time_staff
        ?.toString() || ""
    );

    setOrganizationType(
      company.organization_type ||
        ""
    );

    setLoading(false);
  }

  async function updateCompany() {
    const { error } =
      await supabase
        .from("companies")
        .update({
          company_name:
            companyName,

          country,

          year_established:
            Number(
              yearEstablished
            ),

          full_time_staff:
            Number(
              fullTimeStaff
            ),

          part_time_staff:
            Number(
              partTimeStaff
            ),

          organization_type:
            organizationType,
        })
        .eq("id", companyId);

    if (error) {
      alert(error.message);
      return;
    }

    alert(
      "Company profile updated"
    );

    router.push("/dashboard");
  }

  if (loading) {
    return (
      <div className="p-8">
        Loading company profile...
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
        max-w-3xl
        mx-auto
        p-8
      ">

        <h1 className="
          text-4xl
          font-bold
          mb-2
        ">
          Company Profile
        </h1>

        <p className="
          text-gray-500
          mb-8
        ">
          Update your organization's
          information.
        </p>

        <div className="
          bg-white
          border
          rounded-2xl
          p-8
          shadow-sm
        ">

          <div className="
            space-y-6
          ">

            <div>

              <label className="
                block
                mb-2
                font-medium
              ">
                Organization Name
              </label>

              <input
                className="
                  w-full
                  border
                  rounded-xl
                  p-3
                "
                value={companyName}
                onChange={(e) =>
                  setCompanyName(
                    e.target.value
                  )
                }
              />

            </div>

            <div>

              <label className="
                block
                mb-2
                font-medium
              ">
                Country
              </label>

              <input
                className="
                  w-full
                  border
                  rounded-xl
                  p-3
                "
                value={country}
                onChange={(e) =>
                  setCountry(
                    e.target.value
                  )
                }
              />

            </div>

            <div>

              <label className="
                block
                mb-2
                font-medium
              ">
                Year Established
              </label>

              <input
                type="number"
                className="
                  w-full
                  border
                  rounded-xl
                  p-3
                "
                value={yearEstablished}
                onChange={(e) =>
                  setYearEstablished(
                    e.target.value
                  )
                }
              />

            </div>

            <div className="
              grid
              md:grid-cols-2
              gap-4
            ">

              <div>

                <label className="
                  block
                  mb-2
                  font-medium
                ">
                  Full-Time Staff
                </label>

                <input
                  type="number"
                  className="
                    w-full
                    border
                    rounded-xl
                    p-3
                  "
                  value={fullTimeStaff}
                  onChange={(e) =>
                    setFullTimeStaff(
                      e.target.value
                    )
                  }
                />

              </div>

              <div>

                <label className="
                  block
                  mb-2
                  font-medium
                ">
                  Part-Time Staff
                </label>

                <input
                  type="number"
                  className="
                    w-full
                    border
                    rounded-xl
                    p-3
                  "
                  value={partTimeStaff}
                  onChange={(e) =>
                    setPartTimeStaff(
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

            <div>

              <label className="
                block
                mb-2
                font-medium
              ">
                Organization Type
              </label>

              <select
                className="
                  w-full
                  border
                  rounded-xl
                  p-3
                "
                value={
                  organizationType
                }
                onChange={(e) =>
                  setOrganizationType(
                    e.target.value
                  )
                }
              >

                <option value="">
                  Select Type
                </option>

                <option value="For-Profit">
                  For-Profit
                </option>

                <option value="Nonprofit">
                  Nonprofit
                </option>

              </select>

            </div>

            <button
              onClick={
                updateCompany
              }
              className="
                bg-blue-600
                text-white
                px-6
                py-3
                rounded-xl
              "
            >
              Save Changes
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}