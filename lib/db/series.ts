import type { SupabaseClient } from "@supabase/supabase-js";
import type { Series, SeriesStatus, SeriesWithParts } from "@/lib/types";
import { slugify } from "@/lib/utils/slug";

const TABLE = "series";

type SeriesInput = {
  title: string;
  fandom?: string | null;
  slug?: string | null;
  status?: SeriesStatus | null;
  note?: string | null;
};

/**
 * List series with a DERIVED `parts` count via an embedded post count.
 * RLS applies to the embedded posts, so anonymous callers count only
 * published parts while the author counts all of theirs.
 */
export async function listSeries(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*, posts(count)")
    .order("created_at", { ascending: true });

  if (error || !data) return { data: null as SeriesWithParts[] | null, error };

  const mapped: SeriesWithParts[] = (data as Array<Series & { posts?: { count: number }[] }>).map(
    ({ posts, ...rest }) => ({ ...rest, parts: posts?.[0]?.count ?? 0 }),
  );
  return { data: mapped, error: null };
}

export async function getSeriesBySlug(supabase: SupabaseClient, slug: string) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return { data: data as Series | null, error };
}

export async function createSeries(supabase: SupabaseClient, input: SeriesInput) {
  const row = {
    title: input.title,
    fandom: input.fandom ?? null,
    slug: input.slug || slugify(input.title),
    status: input.status ?? null,
    note: input.note ?? null,
  };
  const { data, error } = await supabase.from(TABLE).insert(row).select("*").single();
  return { data: data as Series | null, error };
}

export async function updateSeries(
  supabase: SupabaseClient,
  id: string,
  input: Partial<SeriesInput>,
) {
  const row: Record<string, unknown> = {};
  for (const key of ["title", "fandom", "slug", "status", "note"] as const) {
    if (input[key] !== undefined) row[key] = input[key];
  }
  const { data, error } = await supabase
    .from(TABLE)
    .update(row)
    .eq("id", id)
    .select("*")
    .single();
  return { data: data as Series | null, error };
}

export async function deleteSeries(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  return { error };
}
