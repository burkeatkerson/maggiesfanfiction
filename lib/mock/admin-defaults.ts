/**
 * Admin store shape + defaults — a faithful port of the prototype
 * admin-data.js DEFAULTS. The admin UI is self-contained mock state
 * (localStorage), independent of the public mock data, until the DB
 * is wired. Uses the prototype's display shape (Published/Draft,
 * category/series by name).
 */

export type AdminStatus = "Published" | "Draft";

export interface AdminPost {
  id: string;
  title: string;
  category: string; // category name
  series: string; // series title, or ""
  date: string; // YYYY-MM-DD
  status: AdminStatus;
  excerpt: string;
  body: string; // HTML
  bodyFont: string;
  image?: string | null; // featured image data URL (local preview)
}

export interface AdminCategory {
  id: string;
  name: string;
  note: string;
}

export interface AdminSeries {
  id: string;
  fandom: string;
  title: string;
}

export interface AdminSite {
  intro: string;
  statement: string;
  quote: string;
  bio: string;
  photo: string | null; // data URL once uploaded
  headlineFont: string;
}

export interface AdminData {
  site: AdminSite;
  categories: AdminCategory[];
  series: AdminSeries[];
  posts: AdminPost[];
}

export const ADMIN_STORAGE_KEY = "maggie-admin";

export const ADMIN_DEFAULTS: AdminData = {
  site: {
    intro: "A writing journal",
    statement:
      "Poetry, short stories, fan fiction, and the quiet pages in between — collected, and kept here for anyone who reads slowly.",
    quote: "Some stories are only told in the margins. This is where I keep mine.",
    bio: "Maggie writes fan fiction exploring complex character relationships and emotional depth. Her work lives in the space where enemies become allies and vulnerability becomes its own kind of strength. She has been writing for nine years and keeps a devoted community of readers who follow her interconnected universes from one story to the next.",
    photo: null,
    headlineFont: "EB Garamond",
  },
  categories: [
    { id: "c1", name: "Poetry", note: "Verse, fragments, and forms" },
    { id: "c2", name: "Short Stories", note: "Self-contained worlds" },
    { id: "c3", name: "Fan Fiction", note: "Beloved characters, new fates" },
    { id: "c4", name: "Diary Entries", note: "Unfiltered, in the moment" },
    { id: "c5", name: "Book Concepts", note: "Premises still taking shape" },
  ],
  series: [
    { id: "s1", fandom: "Harry Potter", title: "The Unwanted Bonds of Fate" },
    { id: "s2", fandom: "Percy Jackson", title: "Tides That Remember" },
    { id: "s3", fandom: "The Hunger Games", title: "Embers in the Ash" },
    { id: "s4", fandom: "A Court of Thorns and Roses", title: "The Year of Soft Treaties" },
    { id: "s5", fandom: "The Lord of the Rings", title: "What the Quiet Folk Kept" },
  ],
  posts: [
    { id: "p1", title: "The Unexpected Kindness in Enemy Territory", category: "Fan Fiction", series: "The Unwanted Bonds of Fate", date: "2024-05-28", status: "Published", excerpt: "When she arrived at the meeting point, the last person she expected to see was standing in the shadows.", body: "", bodyFont: "Crimson Text" },
    { id: "p2", title: "On the Morning You Almost Stayed", category: "Poetry", series: "", date: "2024-05-29", status: "Published", excerpt: "A short verse about the hour before a leaving that never quite happens.", body: "", bodyFont: "EB Garamond" },
    { id: "p3", title: "Notebook, Tuesday, Nothing Happened", category: "Diary Entries", series: "", date: "2024-05-24", status: "Published", excerpt: "An ordinary day, recorded anyway, because some of them turn out to matter later.", body: "", bodyFont: "Crimson Text" },
    { id: "p4", title: "A House That Forgives Its Tenants", category: "Book Concepts", series: "", date: "2024-05-21", status: "Draft", excerpt: "Premise: a house keeps a ledger of everyone who has ever lived in it, and one day it forgives a debt.", body: "", bodyFont: "Lora" },
    { id: "p5", title: "Six Small Hours", category: "Short Stories", series: "", date: "2024-05-18", status: "Published", excerpt: "Two strangers share a delayed train and the particular intimacy of borrowed time.", body: "", bodyFont: "Crimson Text" },
    { id: "p6", title: "Tides That Remember — Part 8", category: "Fan Fiction", series: "Tides That Remember", date: "2024-05-30", status: "Draft", excerpt: "The next chapter, still finding its shape. The sea keeps a few of its promises.", body: "", bodyFont: "Crimson Text" },
  ],
};

export const uid = () => Math.random().toString(36).slice(2, 9);

export function prettyDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
