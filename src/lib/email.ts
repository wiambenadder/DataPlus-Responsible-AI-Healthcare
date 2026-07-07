import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL;

if (!ADMIN_EMAIL) {
  throw new Error("Missing env var: ADMIN_NOTIFICATION_EMAIL");
}

// Resend's shared testing domain (onboarding@resend.dev) can only deliver to
// the email address on your own Resend account until you verify a sending
// domain. Once you verify a domain, set FEEDBACK_FROM_EMAIL to something
// like "feedback@yourdomain.com".
const FROM_EMAIL = process.env.FEEDBACK_FROM_EMAIL || "onboarding@resend.dev";

type FeedbackRecord = {
  id: string;
  company_id: string;
  company_name: string | null;
  domain: string;
  subdomain: string;
  question: string | null;
  answer: string | null;
  feedback_type: "like" | "dislike";
  reason: string;
  status: string;
  admin_notes: string | null;
};

export async function sendNewFeedbackEmail(feedback: FeedbackRecord) {
  const emoji = feedback.feedback_type === "like" ? "\u{1F44D}" : "\u{1F44E}";
  const subject = `New ${emoji} feedback: ${feedback.domain} / ${feedback.subdomain}`;
  const reviewUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/admin/feedback`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL!,
    subject,
    html: `
      <div style="font-family: sans-serif; font-size: 14px; color: #1e293b; line-height: 1.5;">
        <p><strong>Type:</strong> ${feedback.feedback_type}</p>
        <p><strong>Company:</strong> ${feedback.company_name || feedback.company_id}</p>
        <p><strong>Domain:</strong> ${feedback.domain}</p>
        <p><strong>Subdomain:</strong> ${feedback.subdomain}</p>
        <p><strong>Question:</strong> ${feedback.question || "\u2014"}</p>
        <p><strong>Answer:</strong> ${feedback.answer || "\u2014"}</p>
        <p><strong>Reason given:</strong> ${feedback.reason}</p>
        <p style="margin-top: 16px;">
          <a href="${reviewUrl}" style="color: #2563eb;">Review in the admin dashboard</a>
        </p>
      </div>
    `,
  });
}

export async function sendFeedbackDecisionEmail(feedback: FeedbackRecord) {
  const subject = `Feedback marked ${feedback.status}: ${feedback.domain} / ${feedback.subdomain}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL!,
    subject,
    html: `
      <div style="font-family: sans-serif; font-size: 14px; color: #1e293b; line-height: 1.5;">
        <p>Feedback <strong>#${feedback.id}</strong> was marked as <strong>${feedback.status}</strong>.</p>
        <p><strong>Admin notes:</strong> ${feedback.admin_notes || "\u2014"}</p>
      </div>
    `,
  });
}
