import { domainById } from "@/lib/roadmap/framework";
import type { RoadmapDomainGroup } from "@/lib/roadmap/types";
import SubdomainCard from "./SubdomainCard";

/**
 * One domain's subdomains inside a stage. Uses the domain's accent
 * color (kept consistent with the framework PPT: D1 blue, D2 green,
 * D3 amber, D4 rose, D5 violet) so the roadmap reads the same way as
 * the source diagram.
 */
export default function DomainGroup({ group }: { group: RoadmapDomainGroup }) {
  const accent = domainById(group.domainId).accent;

  return (
    <div className={`rounded-xl border ${accent.border} ${accent.bg} p-4`}>
      <div className="mb-3 flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${accent.dot}`} aria-hidden />
        <p className={`text-xs font-semibold uppercase tracking-wider ${accent.text}`}>
          {group.domainId} · {group.domainName}
        </p>
      </div>
      <div className="space-y-2">
        {group.subdomains.map((sub) => (
          <SubdomainCard key={`${group.domainId}-${sub.name}`} subdomain={sub} />
        ))}
      </div>
    </div>
  );
}
