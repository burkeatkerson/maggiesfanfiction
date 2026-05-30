import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/utils/auth";
import { fromDbError, fromZodError, notFound, ok, serverError, unauthorized } from "@/lib/utils/api";
import { postUpdateSchema } from "@/lib/validation/schemas";
import { deletePost, getPostById, getPostBySlug, updatePost } from "@/lib/db/posts";
import { isUuid } from "@/lib/utils/ids";

type Ctx = { params: Promise<{ id: string }> };

/**
 * GET /api/posts/[id]
 * Accepts either a post id (uuid) or a slug. RLS hides unpublished
 * posts from anonymous callers.
 */
export async function GET(_request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = isUuid(id)
    ? await getPostById(supabase, id)
    : await getPostBySlug(supabase, id);

  if (error) return fromDbError(error);
  if (!data) return notFound("Post not found");
  return ok(data);
}

/** PATCH /api/posts/[id] — update (author only). */
export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  if (!isUuid(id)) return notFound("Post not found");

  const supabase = await createClient();
  const user = await getUser(supabase);
  if (!user) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = postUpdateSchema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);

  const { data: current, error: readErr } = await getPostById(supabase, id);
  if (readErr) return fromDbError(readErr);
  if (!current) return notFound("Post not found");

  try {
    const { data, error } = await updatePost(supabase, id, parsed.data, current);
    if (error) return fromDbError(error);
    return ok(data);
  } catch (e) {
    return serverError(e instanceof Error ? e.message : undefined);
  }
}

/** DELETE /api/posts/[id] — delete (author only). */
export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  if (!isUuid(id)) return notFound("Post not found");

  const supabase = await createClient();
  const user = await getUser(supabase);
  if (!user) return unauthorized();

  const { error } = await deletePost(supabase, id);
  if (error) return fromDbError(error);
  return ok({ id, deleted: true });
}
