import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Returns the browser Supabase client when the app has been configured.
 * Public pages, including the policy prototype, can run without Supabase.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  return createClient(url, anonKey);
}
