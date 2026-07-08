import { CheckCircle2, CircleDashed, XCircle } from "lucide-react";
import type { SubdomainStatus } from "@/lib/roadmap/types";

const STYLES: Record<
  SubdomainStatus,
  { label: string; className: string; Icon: typeof CheckCircle2 }
> = {
  practiced: {
    label: "Practiced",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Icon: CheckCircle2,
  },
  not_practiced: {
    label: "Not Practiced",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
    Icon: XCircle,
  },
  no_data: {
    label: "No Data Yet",
    className: "bg-slate-50 text-slate-500 ring-slate-200",
    Icon: CircleDashed,
  },
};

export default function StatusBadge({ status }: { status: SubdomainStatus }) {
  const { label, className, Icon } = STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${className}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
    </span>
  );
}
