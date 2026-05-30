import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/utils/auth";
import { fromDbError, fromZodError, notFound, ok, unauthorized } from "@/lib/utils/api";
import { authorUpdateSchema } from "@/lib/validation/schemas";
import { getAuthor, updateAuthor } from "@/lib/db/author";

/** GET /api/author — public read of the single author profile. */
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await getAuthor(supabase);
  if (error) return fromDbError(error);
  return ok(data);
}

/** PATCH /api/author — update the signed-in author's own profile. */
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const user = await getUser(supabase);
  if (!user) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = authorUpdateSchema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);

  const { data, error } = await updateAuthor(supabase, user.id, parsed.data);
  if (error) return fromDbError(error);
  if (!data) return notFound("Profile not found");
  return ok(data);
}
