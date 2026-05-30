import { createClient } from "@/lib/supabase/server";
import { ok, serverError } from "@/lib/utils/api";

/** POST /api/auth/logout — clear the session. */
export async function POST() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) return serverError(error.message);
  return ok({ signedOut: true });
}
