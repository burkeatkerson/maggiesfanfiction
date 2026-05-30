import type { Series } from "@/lib/types";

/** A series + extra homepage display fields. `parts` is derived elsewhere. */
export interface MockSeries extends Series {
  href: string | null; // null = no reader page yet
}

/** Featured series — ported from admin-data.js DEFAULTS.series + homepage notes. */
export const MOCK_SERIES: MockSeries[] = [
  { id: "s1", fandom: "Harry Potter", title: "The Unwanted Bonds of Fate", slug: "the-unwanted-bonds-of-fate", status: "Complete", note: "Enemies trade letters across a border, and a war waits on the decision of one tired soldier.", created_at: "2024-03-01T00:00:00Z", updated_at: "2024-07-30T00:00:00Z", href: "/blog/the-unexpected-kindness-in-enemy-territory" },
  { id: "s2", fandom: "Percy Jackson", title: "Tides That Remember", slug: "tides-that-remember", status: "Ongoing", note: "Long after the prophecies are spent, the sea keeps a few of its promises.", created_at: "2024-04-01T00:00:00Z", updated_at: "2024-05-30T00:00:00Z", href: null },
  { id: "s3", fandom: "The Hunger Games", title: "Embers in the Ash", slug: "embers-in-the-ash", status: "Complete", note: "What the districts rebuilt was never the thing the cameras came to film.", created_at: "2024-02-01T00:00:00Z", updated_at: "2024-04-01T00:00:00Z", href: null },
  { id: "s4", fandom: "A Court of Thorns and Roses", title: "The Year of Soft Treaties", slug: "the-year-of-soft-treaties", status: "Ongoing", note: "Two courts, one fragile peace, and the small domestic mercies no one negotiated for.", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-05-01T00:00:00Z", href: null },
  { id: "s5", fandom: "The Lord of the Rings", title: "What the Quiet Folk Kept", slug: "what-the-quiet-folk-kept", status: "Complete", note: "The history the songs left out, told from the edge of a garden in the Shire.", created_at: "2023-12-01T00:00:00Z", updated_at: "2024-02-01T00:00:00Z", href: null },
];
