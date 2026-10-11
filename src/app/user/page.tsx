"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Note = { tone: "ok" | "error"; text: string } | null;

/** Your Profile: name, email and password. */
export default function UserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileNote, setProfileNote] = useState<Note>(null);
  const [passwordNote, setPasswordNote] = useState<Note>(null);
  const [saving, setSaving] = useState<"profile" | "password" | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setEmail(user.email || "");
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (profile) setFullName(profile.full_name || "");
      setLoading(false);
    });
  }, [router]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setSaving("profile");
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, full_name: fullName, email: user.email });
    setSaving(null);
    setProfileNote(error ? { tone: "error", text: error.message } : { tone: "ok", text: "Profile saved." });
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordNote({ tone: "error", text: "Use at least six characters." });
      return;
    }
    setSaving("password");
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(null);
    if (error) {
      setPasswordNote({ tone: "error", text: error.message });
      return;
    }
    setNewPassword("");
    setPasswordNote({ tone: "ok", text: "Password updated." });
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500" role="status">
        Loading…
      </div>
    );
  }

  const field =
    "mt-1.5 w-full border border-slate-300 bg-white px-3 py-2.5 text-[15px] focus:border-brand-dukeblue disabled:bg-slate-100 disabled:text-slate-600";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2" aria-hidden>
          ›
        </span>
        <span>Your Profile</span>
      </nav>
      <p className="label-caps mt-6">Account</p>
      <h1 className="mt-2 text-4xl">Your Profile</h1>
      <p className="mt-2 text-[16px] text-slate-700">
        Your name is shown to your team next to the comments you leave on results.{" "}
        <Link href="/company" className="link-more">
          Company and Team
        </Link>
      </p>

      <form onSubmit={saveProfile} className="mt-10 border-t-4 border-brand-navy pt-6">
        <h2 className="text-2xl">Profile</h2>
        <label htmlFor="full-name" className="mt-5 block text-sm font-semibold text-ink">
          Full name
        </label>
        <input id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} className={field} />
        <label htmlFor="email" className="mt-4 block text-sm font-semibold text-ink">
          Email
        </label>
        <input id="email" value={email} disabled className={field} />
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <button type="submit" disabled={saving === "profile"} className="btn btn-primary">
            {saving === "profile" ? "Saving…" : "Save Profile"}
          </button>
          {profileNote && (
            <p role="status" className={profileNote.tone === "ok" ? "text-sm text-brand-teal" : "text-sm text-rose-800"}>
              {profileNote.text}
            </p>
          )}
        </div>
      </form>

      <form onSubmit={changePassword} className="mt-12 border-t-4 border-brand-navy pt-6">
        <h2 className="text-2xl">Change Password</h2>
        <label htmlFor="new-password" className="mt-5 block text-sm font-semibold text-ink">
          New password
        </label>
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className={field}
        />
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <button type="submit" disabled={saving === "password"} className="btn btn-primary">
            {saving === "password" ? "Updating…" : "Update Password"}
          </button>
          {passwordNote && (
            <p role="status" className={passwordNote.tone === "ok" ? "text-sm text-brand-teal" : "text-sm text-rose-800"}>
              {passwordNote.text}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
