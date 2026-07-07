import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";
import { sendFeedbackDecisionEmail } from "@/lib/email";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const body = await req.json();
  const { status, admin_notes } = body as {
    status?: "open" | "reviewed" | "resolved";
    admin_notes?: string;
  };

  if (!status && admin_notes === undefined) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (status) {
    updates.status = status;
    updates.reviewed_at = new Date().toISOString();
  }
  if (admin_notes !== undefined) {
    updates.admin_notes = admin_notes;
  }

  const { data, error } = await supabaseAdmin
    .from("feedback")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message || "Update failed" }, { status: 500 });
  }

  if (status) {
    sendFeedbackDecisionEmail(data).catch((err) =>
      console.error("Failed to send decision email:", err)
    );
  }

  return NextResponse.json({ data });
}
