import type { SupabaseClient } from "@supabase/supabase-js";
import type { Category } from "@/lib/types";
import { slugify } from "@/lib/utils/slug";

const TABLE = "categories";

export async function listCategories(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  return { data: data as Category[] | null, error };
}

export async function getCategoryBySlug(supabase: SupabaseClient, slug: string) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return { data: data as Category | null, error };
}

export async function createCategory(
  supabase: SupabaseClient,
  input: { name: string; slug?: string | null; note?: string | null; sort_order?: number },
) {
  const row = {
    name: input.name,
    slug: input.slug || slugify(input.name),
    note: input.note ?? null,
    sort_order: input.sort_order ?? 0,
  };
  const { data, error } = await supabase.from(TABLE).insert(row).select("*").single();
  return { data: data as Category | null, error };
}

export async function updateCategory(
  supabase: SupabaseClient,
  id: string,
  input: Partial<{ name: string; slug: string | null; note: string | null; sort_order: number }>,
) {
  const row: Record<string, unknown> = {};
  for (const key of ["name", "slug", "note", "sort_order"] as const) {
    if (input[key] !== undefined) row[key] = input[key];
  }
  const { data, error } = await supabase
    .from(TABLE)
    .update(row)
    .eq("id", id)
    .select("*")
    .single();
  return { data: data as Category | null, error };
}

export async function deleteCategory(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  return { error };
}
