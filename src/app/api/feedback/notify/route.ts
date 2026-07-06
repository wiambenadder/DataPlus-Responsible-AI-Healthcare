import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendNewFeedbackEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { feedbackId } = await req.json();

    if (!feedbackId) {
      return NextResponse.json({ error: "feedbackId is required" }, { status: 400 });
    }

    const { data: feedback, error } = await supabaseAdmin
      .from("feedback")
      .select("*")
      .eq("id", feedbackId)
      .single();

    if (error || !feedback) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    await sendNewFeedbackEmail(feedback);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to send feedback notification email:", err);
    // Don't fail the request hard — the feedback row is already saved
    // regardless of whether the email goes out.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
