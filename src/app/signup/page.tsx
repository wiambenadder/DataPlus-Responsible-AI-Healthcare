"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function signUp() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/company-setup");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Sign Up
      </h1>

      <div className="flex flex-col gap-3 max-w-md">

        <input
          className="border p-2"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          className="border p-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button
          className="border p-2"
          onClick={signUp}
        >
          Sign Up
        </button>

      </div>
    </div>
  );
}