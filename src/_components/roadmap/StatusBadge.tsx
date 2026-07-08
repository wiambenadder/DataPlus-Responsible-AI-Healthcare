import { CheckCircle2, CircleDashed, XCircle } from "lucide-react";
import type { SubdomainStatus } from "@/lib/roadmap/types";

const STYLES: Record<
  SubdomainStatus,
  { label: string; className: string; Icon: typeof CheckCircle2 }
> = {
  practiced: {
    label: "Practiced",
    className: "bg-green-100 text-green-800 ring-green-200",
    Icon: CheckCircle2,
  },
  not_practiced: {
    label: "Not Practiced",
    className: "bg-red-100 text-red-800 ring-red-200",
    Icon: XCircle,
  },
  no_data: {
    label: "No Data Yet",
    className: "bg-slate-100 text-slate-600 ring-slate-200",
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