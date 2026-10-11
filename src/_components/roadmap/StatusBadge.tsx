import type { SubdomainStatus } from "@/lib/roadmap/types";

/**
 * Roadmap status tag. Same colours as the results page, with roadmap
 * wording ("Met", "Not met yet").
 */
const META: Record<SubdomainStatus, { label: string; cls: string }> = {
  practiced: { label: "Met", cls: "bg-[#d9ece9] text-[#174f4f]" },
  not_practiced: { label: "Not met yet", cls: "bg-[#f8ddd0] text-[#8f3800]" },
  no_data: { label: "No evidence yet", cls: "bg-slate-100 text-slate-700" },
  under_review: { label: "Under review", cls: "bg-[#dbeaf6] text-[#04477a]" },
};

export default function StatusBadge({ status }: { status: SubdomainStatus }) {
  const m = META[status];
  return <span className={`tag ${m.cls}`}>{m.label}</span>;
}
