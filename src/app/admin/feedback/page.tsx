"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type FeedbackRow = {
  id: string;
  company_id: string;
  company_name: string | null;
  question: string | null;
  domain: string;
  subdomain: string;
  answer: string | null;
  feedback_type: "like" | "dislike";
  reason: string;
  status: "open" | "reviewed" | "resolved";
  admin_notes: string | null;
  reporter_email: string | null;
  created_at: string;
  reviewed_at: string | null;
};

const STATUS_FILTERS = ["open", "reviewed", "resolved", "all"] as const;

function getStatusBadge(status: string) {
  switch (status) {
    case "resolved":
      return "bg-green-100 text-green-700 ring-1 ring-green-200";
    case "reviewed":
      return "bg-blue-100 text-blue-700 ring-1 ring-blue-200";
    default:
      return "bg-amber-100 text-amber-700 ring-1 ring-amber-200";
  }
}

function getTypeBadge(type: string) {
  return type === "like"
    ? "bg-green-100 text-green-700 ring-1 ring-green-200"
    : "bg-red-100 text-red-700 ring-1 ring-red-200";
}

export default function AdminFeedbackPage() {
  const [rows, setRows] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] =
    useState<(typeof STATUS_FILTERS)[number]>("open");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function getToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token;
  }

  async function load() {
    setLoading(true);
    const token = await getToken();

    if (!token) {
      setLoading(false);
      setUnauthorized(true);
      return;
    }

    const res = await fetch(`/api/admin/feedback?status=${statusFilter}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401 || res.status === 403) {
      setUnauthorized(true);
      setLoading(false);
      return;
    }

    const json = await res.json();
    setRows(json.data || []);
    setLoading(false);
  }

  async function updateFeedback(
    id: string,
    updates: { status?: string; admin_notes?: string }
  ) {
    setSavingId(id);
    const token = await getToken();

    await fetch(`/api/admin/feedback/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    setSavingId(null);
    load();
  }

  if (unauthorized) {
    return (
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900">Admins only</p>
          <p className="mt-2 text-sm text-slate-500">
            You don&apos;t have access to this page.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Feedback review
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Review like/dislike feedback submitted on assessments and mark
            items as reviewed or resolved.
          </p>

          <div className="mt-5 flex gap-2">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition ${
                  statusFilter === status
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white p-10 text-slate-500 shadow-sm">
            Loading feedback...
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
            No feedback in this view yet.
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => {
              const isOpen = expandedId === row.id;
              return (
                <article
                  key={row.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(isOpen ? null : row.id)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        {row.domain} / {row.subdomain}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {row.company_name || row.company_id} ·{" "}
                        {new Date(row.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getTypeBadge(
                          row.feedback_type
                        )}`}
                      >
                        {row.feedback_type}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadge(
                          row.status
                        )}`}
                      >
                        {row.status}
                      </span>
                    </div>
                  </button>

                  {isOpen ? (
                    <div className="border-t border-slate-200 bg-slate-50/60 p-5">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="mb-1 text-xs font-semibold text-slate-500">
                            Question
                          </p>
                          <p className="text-sm text-slate-700">
                            {row.question || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-semibold text-slate-500">
                            Answer
                          </p>
                          <p className="text-sm text-slate-700">
                            {row.answer || "—"}
                          </p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="mb-1 text-xs font-semibold text-slate-500">
                            User&apos;s reason
                          </p>
                          <p className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                            {row.reason}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="mb-1 block text-xs font-semibold text-slate-500">
                          Admin notes
                        </label>
                        <textarea
                          rows={2}
                          value={notesDraft[row.id] ?? row.admin_notes ?? ""}
                          onChange={(e) =>
                            setNotesDraft((prev) => ({
                              ...prev,
                              [row.id]: e.target.value,
                            }))
                          }
                          className="w-full resize-none rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-700 focus:border-blue-400 focus:outline-none"
                        />
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={savingId === row.id}
                          onClick={() =>
                            updateFeedback(row.id, {
                              status: "reviewed",
                              admin_notes: notesDraft[row.id] ?? row.admin_notes ?? "",
                            })
                          }
                          className="rounded-full bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                        >
                          Mark reviewed
                        </button>
                        <button
                          type="button"
                          disabled={savingId === row.id}
                          onClick={() =>
                            updateFeedback(row.id, {
                              status: "resolved",
                              admin_notes: notesDraft[row.id] ?? row.admin_notes ?? "",
                            })
                          }
                          className="rounded-full bg-green-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
                        >
                          Mark resolved
                        </button>
                        <button
                          type="button"
                          disabled={savingId === row.id}
                          onClick={() =>
                            updateFeedback(row.id, {
                              admin_notes: notesDraft[row.id] ?? row.admin_notes ?? "",
                            })
                          }
                          className="rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white"
                        >
                          Save notes only
                        </button>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
