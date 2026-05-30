import type { SiteSettings } from "@/lib/types";

/** Mock site settings — ported from admin-data.js DEFAULTS.site. */
export const MOCK_SITE: SiteSettings = {
  id: 1,
  intro: "A writing journal",
  statement:
    "Poetry, short stories, fan fiction, and the quiet pages in between — collected, and kept here for anyone who reads slowly.",
  quote: "Some stories are only told in the margins. This is where I keep mine.",
  bio: "Maggie writes fan fiction exploring complex character relationships and emotional depth. Her work lives in the space where enemies become allies and vulnerability becomes its own kind of strength. She has been writing for nine years and keeps a devoted community of readers who follow her interconnected universes from one story to the next.",
  photo_url: null,
  headline_font: "EB Garamond",
  site_title: "Maggie's Fan Fiction",
  default_seo_description:
    "A writing journal of fan fiction, poetry, short stories, and diary entries by Maggie.",
  og_image_url: null,
  updated_at: "2024-05-30T00:00:00Z",
};

/** Author view-model used by the reader's About panel and bylines. */
export interface AuthorView {
  name: string;
  bio: string;
  avatar_url: string | null;
}

export const MOCK_AUTHOR: AuthorView = {
  name: "Maggie",
  bio: MOCK_SITE.bio ?? "",
  avatar_url: null,
};
