/**
 * Turn arbitrary text (a post title) into a URL-safe slug.
 * Uniqueness suffixing (-2, -3, ...) lives in lib/db/posts.ts where
 * the database is available.
 */
export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "") // strip combining diacritics
      .replace(/[‘’']/g, "") // drop apostrophes: "maggie's" -> "maggies"
      .replace(/[^a-z0-9]+/g, "-") // non-alphanumerics -> hyphen
      .replace(/^-+|-+$/g, "") // trim leading/trailing hyphens
      .slice(0, 80) || "post"
  );
}
