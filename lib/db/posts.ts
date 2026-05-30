import type { SupabaseClient } from "@supabase/supabase-js";
import type { Post, PostStatus } from "@/lib/types";
import { slugify } from "@/lib/utils/slug";
import { readingTime } from "@/lib/utils/reading-time";
import type { PostCreateInput, PostUpdateInput } from "@/lib/validation/schemas";

const TABLE = "posts";

export interface ListPostsParams {
  status?: PostStatus;
  categoryId?: string;
  seriesId?: string;
  limit?: number;
  offset?: number;
}

/**
 * Ensure a slug is unique across posts, appending -2, -3, ... as needed.
 * `excludeId` lets an update keep its own slug.
 */
export async function ensureUniqueSlug(
  supabase: SupabaseClient,
  base: string,
  excludeId?: string,
): Promise<string> {
  const root = slugify(base);
  let candidate = root;
  let n = 1;
  // Loop until no other row owns the candidate slug.
  // Bounded in practice; guard at 1000 to avoid any pathological loop.
  while (n < 1000) {
    let query = supabase.from(TABLE).select("id").eq("slug", candidate).limit(1);
    if (excludeId) query = query.neq("id", excludeId);
    const { data, error } = await query;
    if (error) throw error;
    if (!data || data.length === 0) return candidate;
    n += 1;
    candidate = `${root}-${n}`;
  }
  return `${root}-${Date.now()}`;
}

/** List posts with optional filters and pagination. */
export async function listPosts(
  supabase: SupabaseClient,
  params: ListPostsParams = {},
) {
  const { status, categoryId, seriesId, limit = 50, offset = 0 } = params;
  let query = supabase
    .from(TABLE)
    .select("*")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq("status", status);
  if (categoryId) query = query.eq("category_id", categoryId);
  if (seriesId) query = query.eq("series_id", seriesId);

  const { data, error } = await query;
  return { data: data as Post[] | null, error };
}

/** Fetch a single post by slug (RLS decides draft visibility). */
export async function getPostBySlug(supabase: SupabaseClient, slug: string) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return { data: data as Post | null, error };
}

export async function getPostById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return { data: data as Post | null, error };
}

/** Create a post: derive slug + reading time, set published_at + author. */
export async function createPost(
  supabase: SupabaseClient,
  input: PostCreateInput,
  authorId: string,
) {
  const status = input.status ?? "draft";
  const slug = await ensureUniqueSlug(supabase, input.slug || input.title);

  const row = {
    title: input.title,
    headline: input.headline ?? null,
    slug,
    excerpt: input.excerpt ?? null,
    content: input.content ?? null,
    body_font: input.body_font ?? "Crimson Text",
    category_id: input.category_id ?? null,
    series_id: input.series_id ?? null,
    series_part: input.series_part ?? null,
    tags: input.tags ?? [],
    status,
    featured_image_url: input.featured_image_url ?? null,
    featured_image_caption: input.featured_image_caption ?? null,
    seo_description: input.seo_description ?? null,
    reading_time: readingTime(input.content),
    author_id: authorId,
    published_at: status === "published" ? new Date().toISOString() : null,
  };

  const { data, error } = await supabase
    .from(TABLE)
    .insert(row)
    .select("*")
    .single();
  return { data: data as Post | null, error };
}

/** Update a post. Recomputes slug/reading-time/published_at when relevant. */
export async function updatePost(
  supabase: SupabaseClient,
  id: string,
  input: PostUpdateInput,
  current: Post,
) {
  const row: Record<string, unknown> = {};

  // Copy through simple fields when present.
  for (const key of [
    "title",
    "headline",
    "excerpt",
    "content",
    "body_font",
    "category_id",
    "series_id",
    "series_part",
    "tags",
    "featured_image_url",
    "featured_image_caption",
    "seo_description",
  ] as const) {
    if (input[key] !== undefined) row[key] = input[key];
  }

  // Slug: explicit override, or re-derive if the title changed.
  if (input.slug !== undefined && input.slug) {
    row.slug = await ensureUniqueSlug(supabase, input.slug, id);
  } else if (input.title !== undefined && input.title !== current.title) {
    row.slug = await ensureUniqueSlug(supabase, input.title, id);
  }

  // Reading time tracks content.
  if (input.content !== undefined) row.reading_time = readingTime(input.content);

  // published_at follows status transitions (trigger is a backstop).
  if (input.status !== undefined) {
    row.status = input.status;
    if (input.status === "published" && !current.published_at) {
      row.published_at = new Date().toISOString();
    } else if (input.status === "draft") {
      row.published_at = null;
    }
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update(row)
    .eq("id", id)
    .select("*")
    .single();
  return { data: data as Post | null, error };
}

export async function deletePost(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  return { error };
}
