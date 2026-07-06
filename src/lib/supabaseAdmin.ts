import { createClient } from "@supabase/supabase-js";

// Server-only client. Uses the service role key, which bypasses Row Level
// Security. NEVER import this file from a "use client" component, and
// never expose SUPABASE_SERVICE_ROLE_KEY to the browser (no NEXT_PUBLIC_ prefix).
//
// Adjust these env var names if your project uses different ones — check
// your existing src/lib/supabase.ts for the names it reads.
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing env var: NEXT_PUBLIC_SUPABASE_URL");
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing env var: SUPABASE_SERVICE_ROLE_KEY");
}

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
