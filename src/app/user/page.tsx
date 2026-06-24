"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function UserPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  const [email, setEmail] =
    useState("");

  const [fullName, setFullName] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setEmail(user.email || "");

    const { data: profile } =
      await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

    if (profile) {
      setFullName(
        profile.full_name || ""
      );
    }

    setLoading(false);
  }

  async function saveProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } =
      await supabase
  .from("profiles")
  .upsert({
    id: user.id,
    full_name: fullName,
    email: user.email,
  });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Profile updated");
  }

  async function changePassword() {
    if (!newPassword) {
      alert(
        "Enter a new password"
      );
      return;
    }

    const { error } =
      await supabase.auth.updateUser({
        password: newPassword,
      });

    if (error) {
      alert(error.message);
      return;
    }

    setNewPassword("");

    alert(
      "Password updated"
    );
  }

  if (loading) {
    return (
      <div className="p-8">
        Loading...
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
          User Settings
        </h1>

        <p className="
          text-gray-500
          mb-8
        ">
          Manage your account
          information.
        </p>

        <div className="
          bg-white
          border
          rounded-3xl
          p-8
          shadow-sm
          mb-8
        ">

          <h2 className="
            text-xl
            font-semibold
            mb-6
          ">
            Profile
          </h2>

          <div className="
            mb-4
          ">

            <label className="
              block
              mb-2
              font-medium
            ">
              Full Name
            </label>

            <input
              value={fullName}
              onChange={(e) =>
                setFullName(
                  e.target.value
                )
              }
              className="
                w-full
                border
                rounded-xl
                p-3
              "
            />

          </div>

          <div className="
            mb-6
          ">

            <label className="
              block
              mb-2
              font-medium
            ">
              Email
            </label>

            <input
              value={email}
              disabled
              className="
                w-full
                border
                rounded-xl
                p-3
                bg-gray-50
              "
            />

          </div>

          <button
            onClick={saveProfile}
            className="
              bg-blue-600
              text-white
              px-6
              py-3
              rounded-xl
            "
          >
            Save Profile
          </button>

        </div>

        <div className="
          bg-white
          border
          rounded-3xl
          p-8
          shadow-sm
        ">

          <h2 className="
            text-xl
            font-semibold
            mb-6
          ">
            Change Password
          </h2>

          <input
            type="password"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(
                e.target.value
              )
            }
            placeholder="New password"
            className="
              w-full
              border
              rounded-xl
              p-3
              mb-4
            "
          />

          <button
            onClick={changePassword}
            className="
              bg-blue-600
              text-white
              px-6
              py-3
              rounded-xl
            "
          >
            Update Password
          </button>

        </div>

      </div>

    </div>
  );
}