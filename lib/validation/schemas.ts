import { z } from "zod";
import { BODY_FONT_NAMES, HEADLINE_FONT_NAMES } from "@/lib/fonts";
import { UPLOAD_BUCKETS } from "@/lib/types";

/** Reusable field validators. */
const bodyFont = z
  .string()
  .refine((v) => BODY_FONT_NAMES.includes(v), {
    message: `body_font must be one of: ${BODY_FONT_NAMES.join(", ")}`,
  });

const headlineFont = z
  .string()
  .refine((v) => HEADLINE_FONT_NAMES.includes(v), {
    message: `headline_font must be one of: ${HEADLINE_FONT_NAMES.join(", ")}`,
  });

const uuid = z.string().uuid();
const optionalUuid = uuid.nullish();

// ---------------- auth ----------------
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

// ---------------- posts ----------------
export const postCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  headline: z.string().max(300).nullish(),
  excerpt: z.string().max(1000).nullish(),
  content: z.string().nullish(),
  body_font: bodyFont.optional(),
  category_id: optionalUuid,
  series_id: optionalUuid,
  series_part: z.number().int().positive().nullish(),
  tags: z.array(z.string().max(60)).max(20).optional(),
  status: z.enum(["draft", "published"]).optional(),
  featured_image_url: z.string().url().nullish(),
  featured_image_caption: z.string().max(300).nullish(),
  seo_description: z.string().max(320).nullish(),
  slug: z.string().max(80).nullish(), // optional override; otherwise derived from title
});
export type PostCreateInput = z.infer<typeof postCreateSchema>;

// Update: every field optional, but at least one must be present.
export const postUpdateSchema = postCreateSchema
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "Provide at least one field to update",
  });
export type PostUpdateInput = z.infer<typeof postUpdateSchema>;

// ---------------- categories ----------------
export const categoryCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  slug: z.string().max(120).nullish(),
  note: z.string().max(300).nullish(),
  sort_order: z.number().int().optional(),
});
export const categoryUpdateSchema = categoryCreateSchema
  .partial()
  .refine((o) => Object.keys(o).length > 0, { message: "Nothing to update" });

// ---------------- series ----------------
export const seriesCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  fandom: z.string().max(120).nullish(),
  slug: z.string().max(200).nullish(),
  status: z.enum(["Ongoing", "Complete"]).nullish(),
  note: z.string().max(500).nullish(),
});
export const seriesUpdateSchema = seriesCreateSchema
  .partial()
  .refine((o) => Object.keys(o).length > 0, { message: "Nothing to update" });

// ---------------- site settings ----------------
export const siteSettingsUpdateSchema = z
  .object({
    intro: z.string().max(200).nullish(),
    statement: z.string().max(1000).nullish(),
    quote: z.string().max(500).nullish(),
    bio: z.string().max(2000).nullish(),
    photo_url: z.string().url().nullish(),
    headline_font: headlineFont.optional(),
    site_title: z.string().max(200).nullish(),
    default_seo_description: z.string().max(320).nullish(),
    og_image_url: z.string().url().nullish(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: "Nothing to update" });

// ---------------- author profile ----------------
export const authorUpdateSchema = z
  .object({
    name: z.string().max(120).nullish(),
    avatar_url: z.string().url().nullish(),
    email: z.string().email().nullish(),
    social_links: z.record(z.string(), z.string()).optional(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: "Nothing to update" });

// ---------------- upload ----------------
export const uploadBucketSchema = z.enum(UPLOAD_BUCKETS);
