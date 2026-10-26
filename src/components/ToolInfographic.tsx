import { ClipboardCheck, Wallet, Globe } from "lucide-react";
import type { Workstream } from "@/lib/workstreams";

const ICONS = {
  "ai-readiness": ClipboardCheck,
  financing: Wallet,
  policy: Globe,
};

/** A small decorative cue; the adjacent heading names the tool. */
export default function ToolInfographic({ stream }: { stream: Workstream }) {
  const Icon = ICONS[stream.id];
  return <Icon size={28} strokeWidth={1.5} style={{ color: stream.accent }} aria-hidden />;
}
