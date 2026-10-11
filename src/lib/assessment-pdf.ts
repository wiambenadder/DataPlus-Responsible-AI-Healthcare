import jsPDF from "jspdf";
import {
  CONFIDENCE_META,
  STATUS_META,
  whyThisResult,
  type Confidence,
  type Status,
  type SubdomainResult,
} from "@/lib/assessment";
import { formatDate } from "@/lib/feedback-format";

/**
 * Full report with every subdomain written out — status, confidence,
 * summary, why, evidence and sources — so it can be shared with someone
 * who doesn't use the dashboard.
 */
export function generateAssessmentPdf(args: {
  companyName: string | null;
  domains: { name: string; items: SubdomainResult[] }[];
  statusOf: (r: SubdomainResult) => Status;
  confidenceOf: (r: SubdomainResult) => Confidence | null;
  disputedOf: (r: SubdomainResult) => boolean;
}) {
  const { companyName, domains, statusOf, confidenceOf, disputedOf } = args;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  const maxWidth = pageWidth - margin * 2;
  const NAVY = "#012169";
  const INK = "#1c1b19";
  const GREY = "#66625b";
  let y = margin;

  const ensure = (h: number) => {
    if (y + h > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const text = (
    value: string,
    size: number,
    style: "normal" | "bold" | "italic" = "normal",
    color = INK,
    indent = 0
  ) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(value, maxWidth - indent) as string[];
    for (const line of lines) {
      ensure(size * 1.45);
      doc.text(line, margin + indent, y);
      y += size * 1.45;
    }
  };

  const rule = () => {
    ensure(12);
    doc.setDrawColor("#e2dfda");
    doc.line(margin, y, pageWidth - margin, y);
    y += 14;
  };

  const all = domains.flatMap((d) => d.items);
  const counts = new Map<Status, number>();
  all.forEach((r) => counts.set(statusOf(r), (counts.get(statusOf(r)) ?? 0) + 1));

  // Title block
  doc.setFont("times", "bold");
  doc.setFontSize(22);
  doc.setTextColor(NAVY);
  doc.text("AI readiness assessment", margin, y);
  y += 26;
  text(
    `${companyName ? `${companyName} · ` : ""}Generated ${formatDate(Date.now())}`,
    10,
    "normal",
    GREY
  );
  y += 6;
  text(
    `${counts.get("meets") ?? 0} of ${all.length} practices met`,
    12,
    "bold"
  );
  text(
    (Object.keys(STATUS_META) as Status[])
      .map((s) => `${STATUS_META[s].label}: ${counts.get(s) ?? 0}`)
      .join("   ·   "),
    9,
    "normal",
    GREY
  );
  y += 14;

  for (const domain of domains) {
    const met = domain.items.filter((r) => statusOf(r) === "meets").length;
    ensure(40);
    doc.setFont("times", "bold");
    doc.setFontSize(15);
    doc.setTextColor(NAVY);
    doc.text(domain.name, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(GREY);
    doc.text(`${met} of ${domain.items.length} met`, pageWidth - margin, y, {
      align: "right",
    });
    y += 8;
    doc.setDrawColor(NAVY);
    doc.line(margin, y, pageWidth - margin, y);
    y += 16;

    for (const r of domain.items) {
      const status = statusOf(r);
      const conf = confidenceOf(r);

      ensure(30);
      text(r.subdomain, 12, "bold");
      text(
        `Status: ${STATUS_META[status].label}${
          conf ? `    Confidence: ${CONFIDENCE_META[conf].label}` : ""
        }${r.reportingPeriod ? `    Period: ${r.reportingPeriod}` : ""}`,
        9.5,
        "normal",
        GREY
      );
      y += 3;
      if (r.criterion) text(`What it looks for: ${r.criterion}`, 9.5, "italic", GREY);
      y += 3;
      text("Summary", 10, "bold");
      text(r.summary ?? "No result yet.", 10);
      y += 3;
      text("Why this result", 10, "bold");
      text(
        whyThisResult(status, {
          disputed: disputedOf(r),
          hasEvidence: r.evidence.length > 0,
        }),
        10
      );

      if (r.evidence.length) {
        y += 3;
        text("Evidence used", 10, "bold");
        for (const e of r.evidence) {
          if (e.question) text(`Question: ${e.question}`, 9.5, "normal", GREY, 10);
          text(e.verbatim ? `“${e.text}”` : e.text, 9.5, e.verbatim ? "italic" : "normal", INK, 10);
          text(
            `Source: ${e.sourceTitle}${e.sourceDate ? ` · ${e.sourceDate}` : ""}${
              e.verbatim ? "" : " · summarized by the platform, not a direct quote"
            }`,
            8.5,
            "normal",
            GREY,
            10
          );
          y += 4;
        }
      }
      y += 6;
      rule();
    }
    y += 8;
  }

  doc.save(`AI-readiness-assessment-${new Date().toISOString().slice(0, 10)}.pdf`);
}
