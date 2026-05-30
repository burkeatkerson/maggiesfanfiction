import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/utils/auth";
import { fromDbError, fromZodError, ok, serverError, unauthorized } from "@/lib/utils/api";
import { postCreateSchema } from "@/lib/validation/schemas";
import { createPost, listPosts, type ListPostsParams } from "@/lib/db/posts";
import { getCategoryBySlug } from "@/lib/db/categories";
import { getSeriesBySlug } from "@/lib/db/series";
import type { PostStatus } from "@/lib/types";

/**
 * GET /api/posts
 * Query: ?status=draft|published  ?category=<slug>  ?series=<slug>
 *        ?limit=<n>  ?offset=<n>
 * Anonymous callers always get published only (also enforced by RLS).
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const user = await getUser(supabase);
  const { searchParams } = request.nextUrl;

  const params: ListPostsParams = {
    limit: clampInt(searchParams.get("limit"), 50, 1, 500),
    offset: clampInt(searchParams.get("offset"), 0, 0, 100000),
  };

  // Status: anonymous is forced to published; the author may filter.
  const requested = searchParams.get("status");
  if (!user) {
    params.status = "published";
  } else if (requested === "draft" || requested === "published") {
    params.status = requested as PostStatus;
  }

  // Resolve optional category/series slugs to ids.
  const categorySlug = searchParams.get("category");
  if (categorySlug) {
    const { data } = await getCategoryBySlug(supabase, categorySlug);
    // Unknown slug -> no matches rather than ignoring the filter.
    params.categoryId = data?.id ?? "00000000-0000-0000-0000-000000000000";
  }
  const seriesSlug = searchParams.get("series");
  if (seriesSlug) {
    const { data } = await getSeriesBySlug(supabase, seriesSlug);
    params.seriesId = data?.id ?? "00000000-0000-0000-0000-000000000000";
  }

  const { data, error } = await listPosts(supabase, params);
  if (error) return fromDbError(error);
  return ok(data ?? []);
}

/** POST /api/posts — create a post (author only). */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const user = await getUser(supabase);
  if (!user) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = postCreateSchema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);

  try {
    const { data, error } = await createPost(supabase, parsed.data, user.id);
    if (error) return fromDbError(error);
    return ok(data, 201);
  } catch (e) {
    return serverError(e instanceof Error ? e.message : undefined);
  }
}

function clampInt(raw: string | null, fallback: number, min: number, max: number) {
  const n = raw ? Number.parseInt(raw, 10) : NaN;
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}
