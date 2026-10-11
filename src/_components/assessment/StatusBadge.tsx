import { STATUS_META, type Status } from "@/lib/assessment";

/** Flat status tag, shared by the results and roadmap pages. */
export default function StatusBadge({
  status,
  size = "md",
}: {
  status: Status;
  size?: "sm" | "md";
}) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-block shrink-0 whitespace-nowrap rounded-sm font-bold ${
        size === "sm" ? "px-1.5 py-0.5 text-[11px]" : "px-2.5 py-0.5 text-[13px]"
      } ${meta.badge}`}
    >
      {meta.label}
    </span>
  );
}
