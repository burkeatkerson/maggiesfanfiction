import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/utils/auth";
import { fromDbError, fromZodError, notFound, ok, unauthorized } from "@/lib/utils/api";
import { categoryUpdateSchema } from "@/lib/validation/schemas";
import { deleteCategory, updateCategory } from "@/lib/db/categories";
import { isUuid } from "@/lib/utils/ids";

type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/categories/[id] — update (author only). */
export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  if (!isUuid(id)) return notFound("Category not found");

  const supabase = await createClient();
  const user = await getUser(supabase);
  if (!user) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = categoryUpdateSchema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);

  const { data, error } = await updateCategory(supabase, id, parsed.data);
  if (error) return fromDbError(error);
  if (!data) return notFound("Category not found");
  return ok(data);
}

/** DELETE /api/categories/[id] — delete (author only). */
export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  if (!isUuid(id)) return notFound("Category not found");

  const supabase = await createClient();
  const user = await getUser(supabase);
  if (!user) return unauthorized();

  const { error } = await deleteCategory(supabase, id);
  if (error) return fromDbError(error);
  return ok({ id, deleted: true });
}
