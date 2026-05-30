/**
 * Estimate reading time in whole minutes from an HTML body.
 * Strips tags + entities, counts words, assumes ~200 wpm, min 1.
 */
export function readingTime(html: string | null | undefined): number {
  if (!html) return 1;
  const text = html
    .replace(/<[^>]*>/g, " ") // strip tags
    .replace(/&[a-z]+;/gi, " ") // strip entities (&ldquo; etc.)
    .replace(/\s+/g, " ")
    .trim();
  const words = text ? text.split(" ").filter(Boolean).length : 0;
  return Math.max(1, Math.round(words / 200));
}
