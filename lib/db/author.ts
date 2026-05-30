import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";

const TABLE = "profiles";

/** The single author profile (public read). */
export async function getAuthor(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return { data: data as Profile | null, error };
}

/** Update the authenticated user's own profile row. */
export async function updateAuthor(
  supabase: SupabaseClient,
  userId: string,
  input: Partial<Pick<Profile, "name" | "avatar_url" | "email" | "social_links">>,
) {
  const row: Record<string, unknown> = {};
  for (const key of ["name", "avatar_url", "email", "social_links"] as const) {
    if (input[key] !== undefined) row[key] = input[key];
  }
  const { data, error } = await supabase
    .from(TABLE)
    .update(row)
    .eq("id", userId)
    .select("*")
    .single();
  return { data: data as Profile | null, error };
}
