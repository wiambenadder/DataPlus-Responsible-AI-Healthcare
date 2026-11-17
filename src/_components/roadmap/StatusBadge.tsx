import type { SubdomainStatus } from "@/lib/roadmap/types";

/** Uses the same rating labels as the assessment results. */
const META: Record<SubdomainStatus, { label: string; cls: string }> = {
  practiced: { label: "Meets criterion", cls: "bg-[#d9ece9] text-[#174f4f]" },
  not_practiced: { label: "Does not currently meet", cls: "bg-[#f8ddd0] text-[#8f3800]" },
  no_data: { label: "Not reported", cls: "bg-slate-100 text-slate-700" },
  under_review: { label: "Needs verification", cls: "bg-[#dbeaf6] text-[#04477a]" },
};

export default function StatusBadge({ status }: { status: SubdomainStatus }) {
  const m = META[status];
  return <span className={`tag ${m.cls}`}>{m.label}</span>;
}
