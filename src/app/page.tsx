"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="border p-8 rounded-lg w-full max-w-md">

        <h1 className="text-3xl font-bold mb-2">
          Data Intelligence Platform
        </h1>

        <p className="mb-6">
          AI-enabled reporting and impact tracking platform
        </p>

        <div className="flex flex-col gap-3">

          <button
            onClick={() => router.push("/login")}
            className="border p-3"
          >
            Login
          </button>

          <button
            onClick={() => router.push("/signup")}
            className="border p-3"
          >
            Sign Up
          </button>

        </div>

      </div>
    </div>
  );
}