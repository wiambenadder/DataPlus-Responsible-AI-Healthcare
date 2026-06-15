"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function login() {
    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/report");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Login
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
          onClick={login}
        >
          Login
        </button>

      </div>
    </div>
  );
}