import type { SubdomainStatus } from "@/lib/roadmap/types";
import Badge from "@/_components/assessment/StatusBadge";
import type { Status } from "@/lib/assessment";

/** Same wording and look as the results page. */
const MAP: Record<SubdomainStatus, Status> = {
  practiced: "meets",
  not_practiced: "not_met",
  no_data: "not_reported",
};

export default function StatusBadge({ status }: { status: SubdomainStatus }) {
  return <Badge status={MAP[status]} />;
}
