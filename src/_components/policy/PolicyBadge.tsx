import type { DepthRating, PolicyDocument } from "@/lib/policy/types";

export function PolicyBadge({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "green" | "purple" | "yellow" | "gray" }) {
  const colors = {
    blue: "bg-blue-50 text-brand-dukeblue",
    green: "bg-[#dff5ee] text-[#12664f]",
    purple: "bg-[#f0e8fa] text-[#6332a8]",
    yellow: "bg-[#fff1cf] text-[#805d00]",
    gray: "bg-slate-100 text-slate-600",
  };
  return <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold ${colors[tone]}`}>{children}</span>;
}

export function DocumentBadges({ document }: { document: PolicyDocument }) {
  return (
    <div className="flex flex-wrap gap-2">
      <PolicyBadge>{document.policyStage}</PolicyBadge>
      <PolicyBadge tone="green">Implementation stage</PolicyBadge>
      <PolicyBadge tone="purple">{document.policyType} policy</PolicyBadge>
    </div>
  );
}

export function DepthBadge({ rating, label }: { rating: DepthRating; label: string }) {
  const tones = ["gray", "yellow", "blue", "green"] as const;
  return <PolicyBadge tone={tones[rating]}>Level {rating}: {label}</PolicyBadge>;
}
