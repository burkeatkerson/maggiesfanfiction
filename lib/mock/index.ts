/**
 * Mock data selectors. Signatures intentionally mirror the future
 * lib/db/* layer so swapping to the live Supabase API later is a
 * near-mechanical import change. No network — pure in-memory data.
 */
import type { Category, Post, SeriesWithParts } from "@/lib/types";
import { MOCK_SITE, MOCK_AUTHOR, type AuthorView } from "./site";
import { MOCK_CATEGORIES, type MockCategory } from "./categories";
import { MOCK_SERIES, type MockSeries } from "./series";
import { MOCK_POSTS } from "./posts";

export { MOCK_SITE, MOCK_AUTHOR, MOCK_CATEGORIES, MOCK_SERIES, MOCK_POSTS };
export type { AuthorView, MockCategory, MockSeries };

const byPublishedDesc = (a: Post, b: Post) =>
  (b.published_at ?? b.created_at).localeCompare(a.published_at ?? a.created_at);

export function getSiteSettings() {
  return MOCK_SITE;
}

export function getAuthor(): AuthorView {
  return MOCK_AUTHOR;
}

export function getCategories(): Category[] {
  return MOCK_CATEGORIES;
}

/** Hero "explore by form" entries (with display counts). */
export function getWritingForms(): MockCategory[] {
  return [...MOCK_CATEGORIES].sort((a, b) => a.sort_order - b.sort_order);
}

export function categoryName(id: string | null): string | null {
  if (!id) return null;
  return MOCK_CATEGORIES.find((c) => c.id === id)?.name ?? null;
}

/** Published parts count per series (mirrors anonymous RLS behavior). */
function partsCount(seriesId: string): number {
  return MOCK_POSTS.filter((p) => p.series_id === seriesId && p.status === "published").length;
}

export function listSeriesWithParts(): (SeriesWithParts & { fandom: string | null; href: string | null })[] {
  return MOCK_SERIES.map((s) => ({ ...s, parts: partsCount(s.id) }));
}

export function getSeriesById(id: string | null): MockSeries | null {
  if (!id) return null;
  return MOCK_SERIES.find((s) => s.id === id) ?? null;
}

export function listPublishedPosts(): Post[] {
  return MOCK_POSTS.filter((p) => p.status === "published").sort(byPublishedDesc);
}

/** All posts (admin view). */
export function listAllPosts(): Post[] {
  return [...MOCK_POSTS].sort(byPublishedDesc);
}

export function getPostBySlug(slug: string): Post | null {
  return MOCK_POSTS.find((p) => p.slug === slug) ?? null;
}

/** Posts of a series ordered by part (published only, for the reader). */
export function getPostsInSeries(seriesId: string): Post[] {
  return MOCK_POSTS.filter((p) => p.series_id === seriesId && p.status === "published").sort(
    (a, b) => (a.series_part ?? 0) - (b.series_part ?? 0),
  );
}

export function getLatest(n = 5): Post[] {
  return listPublishedPosts().slice(0, n);
}

/** Slugs for generateStaticParams / sitemap. */
export function getPublishedSlugs(): string[] {
  return listPublishedPosts().map((p) => p.slug);
}
