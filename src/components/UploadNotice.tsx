import Link from "next/link";

/*
 * Shown above every upload. Keep the "still confirming" sentence until the
 * Supabase access rules in docs/SUPABASE_ACCESS_RULES.sql have been run and
 * tested; only then is it accurate to say data is limited to the
 * organization's members.
 */
export default function UploadNotice() {
  return (
    <aside
      className="my-5 border-l-4 border-brand-teal bg-blue-50 p-5 text-sm text-slate-700"
      aria-label="Before you upload"
    >
      <p className="font-bold text-brand-navy">Before you upload</p>
      <p className="mt-2">
        Share only organization-level reports you have permission to use, with
        no patient records or personal information. Your documents and answers
        are stored for your assessment, and their text is sent to AI services
        to find and rate evidence.
      </p>
      <p className="mt-2">
        We are still confirming access controls and how long data is kept, so
        please don&apos;t upload anything confidential yet. For access or
        deletion questions, email{" "}
        <a href="mailto:dukeghic@duke.edu" className="font-semibold underline">
          Duke Global Health Innovation Center general inquiries
        </a>{" "}
        with your account email and organization name.
      </p>
      <Link href="/data-use" className="link-more mt-3 inline-block">
        How we handle your data →
      </Link>
    </aside>
  );
}
