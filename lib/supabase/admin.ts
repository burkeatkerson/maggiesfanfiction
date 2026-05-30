import { createClient } from "@supabase/supabase-js";
import { SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL } from "@/lib/env";

/**
 * Service-role Supabase client. SERVER ONLY — bypasses RLS.
 * Use exclusively for trusted admin/seed tasks (e.g. creating the
 * author account). Never import this from client code: it reads the
 * service-role key, which must never reach the browser bundle.
 */
export function createAdminClient() {
  return createClient(SUPABASE_URL(), SUPABASE_SERVICE_ROLE_KEY(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
