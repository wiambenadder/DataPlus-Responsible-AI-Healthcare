import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "mimi.liu9903@gmail.com")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

/**
 * Confirms the request carries a valid Supabase session AND that the
 * session's email is in the ADMIN_EMAILS allowlist.
 *
 * This is a lightweight stand-in for a real "role" column. If your
 * profiles table later gets an `is_admin` boolean (or similar), swap the
 * allowlist check below for a DB lookup instead.
 */
export async function requireAdmin(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return { ok: false as const, status: 401, message: "Missing auth token" };
  }

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user || !user.email) {
    return { ok: false as const, status: 401, message: "Invalid session" };
  }

  if (!ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    return { ok: false as const, status: 403, message: "Not an admin" };
  }

  return { ok: true as const, user };
}
