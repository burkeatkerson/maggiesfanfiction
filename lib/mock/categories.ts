import type { Category } from "@/lib/types";

/** Category + a display count for the homepage hero (illustrative). */
export interface MockCategory extends Category {
  count: number;
}

/** Writing forms — ported from admin-data.js DEFAULTS.categories + homepage counts. */
export const MOCK_CATEGORIES: MockCategory[] = [
  { id: "c1", name: "Poetry", slug: "poetry", note: "Verse, fragments, and forms", sort_order: 1, created_at: "2024-01-01T00:00:00Z", count: 42 },
  { id: "c2", name: "Short Stories", slug: "short-stories", note: "Self-contained worlds", sort_order: 2, created_at: "2024-01-01T00:00:00Z", count: 36 },
  { id: "c3", name: "Fan Fiction", slug: "fan-fiction", note: "Beloved characters, new fates", sort_order: 3, created_at: "2024-01-01T00:00:00Z", count: 128 },
  { id: "c4", name: "Diary Entries", slug: "diary-entries", note: "Unfiltered, in the moment", sort_order: 4, created_at: "2024-01-01T00:00:00Z", count: 64 },
  { id: "c5", name: "Book Concepts", slug: "book-concepts", note: "Premises still taking shape", sort_order: 5, created_at: "2024-01-01T00:00:00Z", count: 19 },
];
