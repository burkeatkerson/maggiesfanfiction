import { createClient } from "@/lib/supabase/server";
import { ok } from "@/lib/utils/api";
import { getUser } from "@/lib/utils/auth";

/** GET /api/auth/session — current user, or null when signed out. */
export async function GET() {
  const supabase = await createClient();
  const user = await getUser(supabase);
  return ok({
    user: user ? { id: user.id, email: user.email } : null,
  });
}
