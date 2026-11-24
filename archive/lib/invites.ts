import { supabase } from "@/lib/supabase";

export async function checkPendingInvite(
  email: string
) {
  const { data } =
    await supabase
      .from("company_invites")
      .select("*")
      .eq("email", email)
      .eq("accepted", false)
      .maybeSingle();

  return data;
}
export async function acceptInvite(
  invite: any,
  userId: string
) {
  await supabase
    .from("company_members")
    .insert({
      company_id:
        invite.company_id,
      user_id: userId,
      role: invite.role,
    });

  await supabase
    .from("profiles")
    .update({
      company_id:
        invite.company_id,
    })
    .eq("id", userId);

  await supabase
    .from("company_invites")
    .update({
      accepted: true,
    })
    .eq("id", invite.id);
}