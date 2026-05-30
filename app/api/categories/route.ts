import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/utils/auth";
import { fromDbError, fromZodError, ok, unauthorized } from "@/lib/utils/api";
import { categoryCreateSchema } from "@/lib/validation/schemas";
import { createCategory, listCategories } from "@/lib/db/categories";

/** GET /api/categories — public list, ordered by sort_order. */
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await listCategories(supabase);
  if (error) return fromDbError(error);
  return ok(data ?? []);
}

/** POST /api/categories — create (author only). */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const user = await getUser(supabase);
  if (!user) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = categoryCreateSchema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);

  const { data, error } = await createCategory(supabase, parsed.data);
  if (error) return fromDbError(error);
  return ok(data, 201);
}
