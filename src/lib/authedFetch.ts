import { supabase } from "@/lib/supabase";

/**
 * fetch() for our own API routes that need to know who is calling.
 * Adds the logged-in user's access token as "Authorization: Bearer …",
 * which the processing routes check before doing anything
 * (see src/lib/requireMember.ts). Use it from the browser only.
 */
export async function authedFetch(url: string, init: RequestInit = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(init.headers);
  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }
  return fetch(url, { ...init, headers });
}
