import type { Metadata } from "next";
import PolicyNav from "@/_components/policy/PolicyNav";

export const metadata: Metadata = {
  title: "Health AI Policy Dashboard | Innovator Insights",
  description: "Explore illustrative health AI policy assessments and policy documents by country.",
};

export default function PolicyCodebookLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#f7fafc]"><PolicyNav />{children}</div>;
}
