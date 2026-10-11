"use client";

import { useState } from "react";
import { Check, PencilLine, TriangleAlert, type LucideIcon } from "lucide-react";
import {
  KIND_LABEL,
  REVISION_REASONS,
  timeAgo,
  type FeedbackEntry,
  type FeedbackKind,
} from "@/lib/feedback";
import type { FeedbackApi } from "./useFeedback";

const KINDS: FeedbackKind[] = ["accurate", "needs_revision", "wrong_source"];

const KIND_TONE: Record<FeedbackKind, string> = {
  accurate: "border-transparent bg-[#d9ece9] text-[#174f4f]",
  needs_revision: "border-transparent bg-[#fbefc9] text-[#6e5200]",
  wrong_source: "border-transparent bg-[#f8ddd0] text-[#8f3800]",
};

/** Icon and colour for each choice on the "Is this right?" buttons. */
const KIND_ICON: Record<FeedbackKind, { icon: LucideIcon; color: string }> = {
  accurate: { icon: Check, color: "#1D6363" },
  needs_revision: { icon: PencilLine, color: "#a86a0c" },
  wrong_source: { icon: TriangleAlert, color: "#C84E00" },
};

const REVIEW_LABEL: Record<string, string> = {
  open: "",
  reviewed: "Reviewed by the team",
  resolved: "Resolved by the team",
};

/**
 * Feedback for one subdomain: everything already submitted (from the
 * database), then the form to add more.
 */
export default function FeedbackSection({
  api,
  domain,
  subdomain,
  question,
  answer,
  currentUser,
  formId,
}: {
  api: FeedbackApi;
  domain: string;
  subdomain: string;
  question: string | null;
  answer: string | null;
  currentUser: { id: string | null; email: string | null };
  /** DOM id of the form, so "Report wrong source" links can jump to it. */
  formId: string;
}) {
  const entries = api.forSubdomain(subdomain);
  const visible = entries.filter((e) => e.sync !== "deleting" || e.id !== null);
  const draft = api.getDraft(subdomain);
  const pending = draft.pendingKey
    ? entries.find((e) => e.key === draft.pendingKey)
    : undefined;
  const saving = pending?.sync === "saving";
  const lastFailed = pending?.sync === "save_failed";

  const isMine = (e: FeedbackEntry) =>
    e.id === null ||
    (!!currentUser.id && e.reporterId === currentUser.id) ||
    (!!currentUser.email &&
      !!e.reporterEmail &&
      e.reporterEmail.toLowerCase() === currentUser.email.toLowerCase());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.kind || saving) return;
    await api.submit({
      domain,
      subdomain,
      kind: draft.kind,
      reasons: draft.reasons,
      comment: draft.comment,
      question,
      answer,
    });
  }

  return (
    <div>
      <h4 className="text-[0.75rem] font-bold uppercase tracking-[0.1em] text-brand-navy">
        Comments from your team{" "}
        <span className="font-normal normal-case tracking-normal text-slate-500">({visible.length})</span>
      </h4>

      {/* Submitted feedback */}
      <div className="mt-2">
        {api.loadState === "loading" && visible.length === 0 ? (
          <p className="text-sm text-slate-500">Loading feedback…</p>
        ) : api.loadState === "error" && visible.length === 0 ? (
          <p className="text-sm text-slate-600">
            Couldn&apos;t load earlier comments.{" "}
            <button
              type="button"
              onClick={api.reload}
              className="font-semibold text-brand-dukeblue underline underline-offset-2"
            >
              Retry
            </button>
          </p>
        ) : visible.length === 0 ? (
          <p className="text-sm text-slate-500">No comments yet.</p>
        ) : (
          <ul className="divide-y divide-slate-200 border-y border-slate-200">
            {visible.map((entry) => (
              <FeedbackItem
                key={entry.key}
                entry={entry}
                api={api}
                mine={isMine(entry)}
              />
            ))}
          </ul>
        )}
      </div>

      {/* New feedback */}
      <form
        id={formId}
        onSubmit={handleSubmit}
        className="mt-5 scroll-mt-28 border-t border-slate-200 pt-4"
      >
        <fieldset disabled={saving}>
          <legend className="text-[15px] font-bold text-brand-navy">Is this right?</legend>
          <p className="mt-0.5 text-sm text-slate-600">
            Choosing an option is enough. A comment is optional.
          </p>
          <KindPicker
            name={`${formId}-kind`}
            value={draft.kind}
            onChange={(kind) => api.setDraft(subdomain, { kind })}
          />

          {draft.kind === "needs_revision" && (
            <ReasonPicker
              value={draft.reasons}
              onChange={(reasons) => api.setDraft(subdomain, { reasons })}
            />
          )}

          <label
            htmlFor={`${formId}-comment`}
            className="mt-3 block text-sm text-slate-700"
          >
            Add an optional comment
          </label>
          <textarea
            id={`${formId}-comment`}
            value={draft.comment}
            onChange={(e) => api.setDraft(subdomain, { comment: e.target.value })}
            rows={3}
            placeholder={
              draft.kind === "wrong_source"
                ? "Which source or company is wrong, and what should it be?"
                : draft.kind === "needs_revision"
                ? "What should change?"
                : "Anything the team should know?"
            }
            className="mt-1 w-full resize-y border border-slate-300 bg-white p-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-dukeblue disabled:bg-slate-50"
          />

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={!draft.kind || saving}
              className="btn btn-primary"
            >
              {saving ? "Saving…" : lastFailed ? "Try again" : "Submit feedback"}
            </button>
            {!draft.kind && (
              <span className="text-xs text-slate-500">
                Choose one of the options above first.
              </span>
            )}
            {lastFailed && (
              <span className="text-xs text-rose-800">
                Not saved yet — your comment is still here.
              </span>
            )}
          </div>
        </fieldset>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function FeedbackItem({
  entry,
  api,
  mine,
}: {
  entry: FeedbackEntry;
  api: FeedbackApi;
  mine: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [kind, setKind] = useState<FeedbackKind>(entry.kind);
  const [reasons, setReasons] = useState<string[]>(entry.reasons);
  const [comment, setComment] = useState(entry.comment);
  const [editState, setEditState] = useState<"idle" | "saving" | "failed">(
    "idle"
  );
  const [editError, setEditError] = useState<string | null>(null);

  function startEdit() {
    setKind(entry.kind);
    setReasons(entry.reasons);
    setComment(entry.comment);
    setEditState("idle");
    setEditError(null);
    setEditing(true);
  }

  async function saveEdit() {
    setEditState("saving");
    setEditError(null);
    try {
      await api.edit(entry.key, kind, reasons, comment);
      setEditState("idle");
      setEditing(false);
    } catch (err) {
      setEditState("failed");
      setEditError(err instanceof Error ? err.message : String(err));
    }
  }

  const author = mine ? "You" : entry.reporterEmail ?? "A colleague";
  const review = REVIEW_LABEL[entry.reviewStatus] ?? "";

  if (editing) {
    return (
      <li className="py-3">
        <fieldset disabled={editState === "saving"}>
          <legend className="sr-only">Edit feedback</legend>
          <KindPicker name={`edit-${entry.key}`} value={kind} onChange={setKind} />
          {kind === "needs_revision" && (
            <ReasonPicker value={reasons} onChange={setReasons} />
          )}
          <label className="mt-3 block text-sm text-slate-700">
            Add an optional comment
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="mt-1 w-full resize-y border border-slate-300 bg-white p-2.5 text-sm text-slate-800 focus:border-blue-500"
            />
          </label>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <button
              type="button"
              onClick={saveEdit}
              className="rounded-sm bg-brand-navy px-3 py-1.5 font-semibold text-white hover:bg-brand-dukeblue"
            >
              {editState === "saving" ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-slate-600 underline underline-offset-2"
            >
              Cancel
            </button>
            {editState === "failed" && (
              <span className="text-rose-800" role="alert">
                Could not save —{" "}
                <button
                  type="button"
                  onClick={saveEdit}
                  className="font-semibold underline underline-offset-2"
                >
                  Retry
                </button>
                {editError ? (
                  <span className="block text-xs text-slate-500">{editError}</span>
                ) : null}
              </span>
            )}
          </div>
        </fieldset>
      </li>
    );
  }

  return (
    <li className="py-3">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span
          className={`inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-semibold ${KIND_TONE[entry.kind]}`}
        >
          {KIND_LABEL[entry.kind]}
        </span>
        {entry.reasons.length > 0 && (
          <span className="text-xs text-slate-600">
            {entry.reasons.join(" · ")}
          </span>
        )}
      </div>

      {entry.comment ? (
        <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-800">
          {entry.comment}
        </p>
      ) : (
        <p className="mt-1.5 text-sm italic text-slate-500">No comment added.</p>
      )}

      <div
        className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500"
        aria-live="polite"
      >
        <span>{author}</span>
        <SyncStatus entry={entry} api={api} />
        {review && <span className="text-slate-700">{review}</span>}

        {mine && entry.id !== null && entry.sync === "saved" && !confirmDelete && (
          <span className="ml-auto flex gap-3">
            <button
              type="button"
              onClick={startEdit}
              className="font-semibold text-brand-dukeblue hover:underline"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="font-semibold text-slate-600 hover:text-rose-800 hover:underline"
            >
              Delete
            </button>
          </span>
        )}

        {confirmDelete && entry.sync === "saved" && (
          <span className="ml-auto flex items-center gap-3">
            <span className="text-slate-700">Delete this feedback?</span>
            <button
              type="button"
              onClick={() => {
                setConfirmDelete(false);
                api.remove(entry.key);
              }}
              className="font-semibold text-rose-800 hover:underline"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="text-slate-600 hover:underline"
            >
              Cancel
            </button>
          </span>
        )}

        {mine && entry.id === null && entry.sync === "save_failed" && (
          <button
            type="button"
            onClick={() => api.remove(entry.key)}
            className="ml-auto text-slate-600 hover:underline"
          >
            Discard
          </button>
        )}
      </div>
    </li>
  );
}

function SyncStatus({ entry, api }: { entry: FeedbackEntry; api: FeedbackApi }) {
  switch (entry.sync) {
    case "saving":
      return <span className="text-slate-700">Saving…</span>;
    case "deleting":
      return <span className="text-slate-700">Deleting…</span>;
    case "save_failed":
    case "delete_failed":
      return (
        <span className="text-rose-800" role="alert" title={entry.error}>
          {entry.sync === "save_failed" ? "Could not save" : "Could not delete"} —{" "}
          <button
            type="button"
            onClick={() => api.retry(entry.key)}
            className="font-semibold underline underline-offset-2"
          >
            Retry
          </button>
        </span>
      );
    default:
      return entry.savedAt ? (
        <span>Saved {timeAgo(entry.savedAt, api.now)}</span>
      ) : (
        <span>Saved</span>
      );
  }
}

/* ------------------------------------------------------------------ */

function KindPicker({
  name,
  value,
  onChange,
}: {
  name: string;
  value: FeedbackKind | null;
  onChange: (kind: FeedbackKind) => void;
}) {
  return (
    <div className="mt-2.5 flex flex-wrap gap-2.5" role="radiogroup">
      {KINDS.map((k) => {
        const selected = value === k;
        const { icon: Icon, color } = KIND_ICON[k];
        return (
          <label
            key={k}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-full border-[1.5px] bg-white px-4 py-1.5 text-[14.5px] font-semibold transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand-dukeblue ${
              selected
                ? "border-brand-navy bg-blue-50 text-brand-navy"
                : "border-slate-300 text-ink hover:border-slate-500"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={k}
              checked={selected}
              onChange={() => onChange(k)}
              className="sr-only"
            />
            <Icon className="h-4 w-4" style={{ color }} aria-hidden strokeWidth={2.2} />
            {KIND_LABEL[k]}
          </label>
        );
      })}
    </div>
  );
}

function ReasonPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (reasons: string[]) => void;
}) {
  const toggle = (r: string) =>
    onChange(value.includes(r) ? value.filter((x) => x !== r) : [...value, r]);

  return (
    <fieldset className="mt-3">
      <legend className="text-sm text-slate-700">
        What needs revising?{" "}
        <span className="text-slate-500">Optional — choose any that apply.</span>
      </legend>
      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1.5">
        {REVISION_REASONS.map((r) => (
          <label
            key={r}
            className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-slate-800"
          >
            <input
              type="checkbox"
              checked={value.includes(r)}
              onChange={() => toggle(r)}
              className="h-4 w-4 accent-brand-navy"
            />
            {r}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
