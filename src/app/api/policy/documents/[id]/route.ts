import { NextResponse } from "next/server";
import { getPolicyDocument } from "@/lib/policy/repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const document = await getPolicyDocument(id);
  if (!document) {
    return NextResponse.json({ error: "Policy document not found." }, { status: 404 });
  }
  return NextResponse.json({ document });
}
