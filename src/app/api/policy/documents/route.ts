import { NextRequest, NextResponse } from "next/server";
import { listPolicyDocuments } from "@/lib/policy/repository";
import type {
  PolicyCategory,
  PolicyDocument,
} from "@/lib/policy/types";

const categories: PolicyCategory[] = [
  "governance",
  "software",
  "privacy",
  "validation",
  "cybersecurity",
];
const formats: PolicyDocument["format"][] = [
  "Guideline",
  "Regulation",
  "Strategy",
  "Law",
];

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const requestedCategories = params
    .getAll("category")
    .filter((value): value is PolicyCategory =>
      categories.includes(value as PolicyCategory),
    );
  const requestedFormats = params
    .getAll("format")
    .filter((value): value is PolicyDocument["format"] =>
      formats.includes(value as PolicyDocument["format"]),
    );

  const documents = await listPolicyDocuments({
    query: params.get("q") ?? undefined,
    countries: params.getAll("country"),
    categories: requestedCategories,
    formats: requestedFormats,
  });

  return NextResponse.json({ documents, count: documents.length });
}
