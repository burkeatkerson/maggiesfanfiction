import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AUTHOR_EMAIL } from "@/lib/env";
import { fromZodError, ok, unauthorized } from "@/lib/utils/api";
import { loginSchema } from "@/lib/validation/schemas";

/**
 * POST /api/auth/login — sign in with email + password.
 * Single-author guard: reject any email other than AUTHOR_EMAIL (if set)
 * before touching Supabase. RLS remains the real enforcement boundary.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);

  const email = parsed.data.email.trim().toLowerCase();
  const allowed = AUTHOR_EMAIL();
  if (allowed && email !== allowed) {
    return unauthorized("These credentials are not permitted to sign in.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return unauthorized("Invalid email or password.");
  }

  return ok({ user: { id: data.user.id, email: data.user.email } });
}
