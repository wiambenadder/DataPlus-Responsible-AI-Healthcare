import Link from "next/link";

export default function UploadNotice() {
  return (
    <aside
      className="my-5 border-l-4 border-brand-teal bg-blue-50 p-5 text-sm text-slate-700"
      aria-label="Before you upload"
    >
      <p className="font-bold text-brand-navy">Before you upload</p>
      <p className="mt-2">
        Share only organization-level reports you have permission to use.
        Documents and answers are stored to support your assessment, and
        document text is sent to AI services to extract and evaluate evidence.
      </p>
      <p className="mt-2">
        The intended audience is your organization’s members and the platform
        team. Uploading is not permission to publish your material. Access
        controls, retention, and provider terms still require team verification;
        do not submit sensitive or confidential information while verification
        is pending.
      </p>
      <p className="mt-2">
        For access questions or a deletion request, contact the project team
        through{" "}
        <a href="mailto:dukeghic@duke.edu" className="underline font-semibold">
          Duke GHIC general inquiries
        </a>
        . Include your account email and organization name, not the documents
        themselves.
      </p>
      <Link href="/data-use" className="link-more mt-3 inline-block">
        Read the full data-use explanation →
      </Link>
    </aside>
  );
}
