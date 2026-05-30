import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Category, PostView, SeriesWithParts, SiteSettings } from "@/lib/types";

/**
 * Server-only read layer for the public site. Wraps the request-bound
 * Supabase client so RLS applies (anonymous visitors see published only).
 * `cache()` de-dupes the base fetches within a single render.
 */

const POST_SELECT = "*, category:categories(name,slug), series:series(title,slug)";

export interface AuthorView {
  name: string;
  bio: string;
  avatar_url: string | null;
}
export interface CategoryCount extends Category {
  count: number;
}
export interface SeriesView extends SeriesWithParts {
  fandom: string | null;
  href: string | null;
}

export const getSiteSettings = cache(async (): Promise<SiteSettings | null> => {
  const sb = await createClient();
  const { data } = await sb.from("site_settings").select("*").eq("id", 1).maybeSingle();
  return data as SiteSettings | null;
});

export const getAuthor = cache(async (): Promise<AuthorView> => {
  const sb = await createClient();
  const [{ data: prof }, site] = await Promise.all([
    sb.from("profiles").select("name, avatar_url").order("created_at").limit(1).maybeSingle(),
    getSiteSettings(),
  ]);
  return {
    name: prof?.name ?? "Maggie",
    bio: site?.bio ?? "",
    avatar_url: site?.photo_url ?? prof?.avatar_url ?? null,
  };
});

export const listPublishedPosts = cache(async (): Promise<PostView[]> => {
  const sb = await createClient();
  const { data } = await sb
    .from("posts")
    .select(POST_SELECT)
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  return (data ?? []) as PostView[];
});

export async function getLatest(n = 5): Promise<PostView[]> {
  return (await listPublishedPosts()).slice(0, n);
}

export async function getPostBySlug(slug: string): Promise<PostView | null> {
  const sb = await createClient();
  const { data } = await sb.from("posts").select(POST_SELECT).eq("slug", slug).maybeSingle();
  return (data as PostView | null) ?? null;
}

export async function getPostsInSeries(seriesId: string): Promise<PostView[]> {
  const sb = await createClient();
  const { data } = await sb
    .from("posts")
    .select(POST_SELECT)
    .eq("series_id", seriesId)
    .eq("status", "published")
    .order("series_part", { ascending: true });
  return (data ?? []) as PostView[];
}

export async function getCategoriesWithCounts(): Promise<CategoryCount[]> {
  const sb = await createClient();
  const [{ data: cats }, published] = await Promise.all([
    sb.from("categories").select("*").order("sort_order", { ascending: true }),
    listPublishedPosts(),
  ]);
  const counts = new Map<string, number>();
  for (const p of published) {
    if (p.category_id) counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1);
  }
  return (cats ?? []).map((c) => ({ ...(c as Category), count: counts.get((c as Category).id) ?? 0 }));
}

export async function getSeriesWithParts(): Promise<SeriesView[]> {
  const sb = await createClient();
  const [{ data: series }, published] = await Promise.all([
    sb.from("series").select("*").order("created_at", { ascending: true }),
    listPublishedPosts(),
  ]);
  return (series ?? []).map((s) => {
    const parts = published
      .filter((p) => p.series_id === (s as { id: string }).id)
      .sort((a, b) => (a.series_part ?? 0) - (b.series_part ?? 0));
    return {
      ...(s as SeriesWithParts),
      parts: parts.length,
      fandom: (s as { fandom: string | null }).fandom,
      href: parts[0] ? `/blog/${parts[0].slug}` : null,
    };
  });
}
