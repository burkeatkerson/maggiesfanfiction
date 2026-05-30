import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Resolve the authenticated user for a request-bound server client.
 * Returns null when there is no valid session. Route handlers call this
 * and return `unauthorized()` on null before any write.
 */
export async function getUser(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
