/**
 * Hand-written DB row types mirroring supabase/migrations/0001_init.sql.
 * Can be swapped for `supabase gen types typescript` output later.
 */

export type PostStatus = "draft" | "published";
export type SeriesStatus = "Ongoing" | "Complete";

export interface Profile {
  id: string;
  name: string | null;
  avatar_url: string | null;
  email: string | null;
  social_links: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  id: number;
  intro: string | null;
  statement: string | null;
  quote: string | null;
  bio: string | null;
  photo_url: string | null;
  headline_font: string;
  site_title: string | null;
  default_seo_description: string | null;
  og_image_url: string | null;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string | null;
  note: string | null;
  sort_order: number;
  created_at: string;
}

export interface Series {
  id: string;
  fandom: string | null;
  title: string;
  slug: string | null;
  status: SeriesStatus | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

/** A series row with its derived part count (from posts). */
export interface SeriesWithParts extends Series {
  parts: number;
}

export interface Post {
  id: string;
  title: string;
  headline: string | null;
  slug: string;
  excerpt: string | null;
  content: string | null;
  body_font: string;
  category_id: string | null;
  series_id: string | null;
  series_part: number | null;
  tags: string[];
  status: PostStatus;
  featured_image_url: string | null;
  featured_image_caption: string | null;
  seo_description: string | null;
  reading_time: number;
  author_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/** A post with its category + series resolved (via embedded select). */
export interface PostView extends Post {
  category: { name: string; slug: string | null } | null;
  series: { title: string; slug: string | null } | null;
}

/** Storage buckets that uploads may target. */
export const UPLOAD_BUCKETS = ["post-images", "avatars"] as const;
export type UploadBucket = (typeof UPLOAD_BUCKETS)[number];
