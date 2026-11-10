import { NextResponse } from "next/server";
import { listPolicyCountries } from "@/lib/policy/repository";

export async function GET() {
  return NextResponse.json({ countries: await listPolicyCountries() });
}
