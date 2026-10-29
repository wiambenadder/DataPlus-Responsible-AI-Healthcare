import { NextResponse, type NextRequest } from "next/server";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

/*
 * Access checks for the upload and AI processing routes.
 *
 * Before this, those routes accepted any request, so anyone who knew a
 * company's ID could re-run its assessment or read its evidence. Now each
 * route must be called by a logged-in user who belongs to that company.
 *
 * After the check, the route talks to the database as that user (not with
 * a master key). That means the database's own access rules still apply,
 * and the routes keep working once the stricter rules in
 * docs/SUPABASE_ACCESS_RULES.sql are switched on.
 */

type Allowed = { ok: true; user: User; db: SupabaseClient };
type Refused = { ok: false; response: NextResponse };

function refuse(status: number, error: string): Refused {
  return { ok: false, response: NextResponse.json({ error }, { status }) };
}

/** A Supabase client that acts as the user who sent the token. */
function clientFor(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
}

/** Step 1: the request must come from a logged-in user. */
export async function requireLogin(request: NextRequest): Promise<Allowed | Refused> {
  const token = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "")
    .trim();
  if (!token) return refuse(401, "Please log in first.");

  const db = clientFor(token);
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) return refuse(401, "Your session has expired. Please log in again.");

  return { ok: true, user: data.user, db };
}

/**
 * Step 2: the user must belong to the company. Membership is recorded in
 * two places (profiles.company_id and company_members), so either counts.
 */
export async function isMember(db: SupabaseClient, userId: string, companyId: string) {
  const { data: profile } = await db
    .from("profiles")
    .select("company_id")
    .eq("id", userId)
    .maybeSingle();
  if (profile?.company_id && String(profile.company_id) === String(companyId)) return true;

  const { data: membership } = await db
    .from("company_members")
    .select("company_id")
    .eq("user_id", userId)
    .eq("company_id", companyId)
    .maybeSingle();
  return Boolean(membership);
}

/** Login + membership for routes that are given a company_id. */
export async function requireMember(
  request: NextRequest,
  companyId: unknown
): Promise<Allowed | Refused> {
  const auth = await requireLogin(request);
  if (!auth.ok) return auth;

  if (typeof companyId !== "string" && typeof companyId !== "number") {
    return refuse(400, "Missing company_id");
  }
  if (!(await isMember(auth.db, auth.user.id, String(companyId)))) {
    return refuse(403, "You don't have access to this organization.");
  }
  return auth;
}

/**
 * Login + membership for routes that are given an upload ID: looks up which
 * company the upload belongs to, then checks the user is a member of it.
 */
export async function requireUploadAccess(
  request: NextRequest,
  uploadId: unknown
): Promise<(Allowed & { companyId: string }) | Refused> {
  const auth = await requireLogin(request);
  if (!auth.ok) return auth;

  if (typeof uploadId !== "string" && typeof uploadId !== "number") {
    return refuse(400, "Missing upload id");
  }
  const { data: upload } = await auth.db
    .from("uploads")
    .select("company_id")
    .eq("id", uploadId)
    .maybeSingle();
  // Same answer whether the upload doesn't exist or belongs to someone
  // else, so the route doesn't reveal which IDs exist.
  if (!upload?.company_id || !(await isMember(auth.db, auth.user.id, String(upload.company_id)))) {
    return refuse(404, "Upload not found");
  }
  return { ...auth, companyId: String(upload.company_id) };
}
