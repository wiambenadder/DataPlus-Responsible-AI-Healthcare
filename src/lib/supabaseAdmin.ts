import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only client. Uses the service role key, which bypasses Row Level
// Security. NEVER import this file from a "use client" component, and
// never expose SUPABASE_SERVICE_ROLE_KEY to the browser (no NEXT_PUBLIC_ prefix).
//
// Adjust these env var names if your project uses different ones — check
// your existing src/lib/supabase.ts for the names it reads.
//
// This is intentionally lazy. Public pages should be able to build without
// admin credentials; only an admin API request needs this client.
export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error("Missing env var: NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceRoleKey) throw new Error("Missing env var: SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
