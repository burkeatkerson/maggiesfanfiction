import type { SupabaseClient } from "@supabase/supabase-js";
import type { SiteSettings } from "@/lib/types";

const TABLE = "site_settings";
const ROW_ID = 1;

/** Read the single site_settings row (id = 1). */
export async function getSiteSettings(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", ROW_ID)
    .maybeSingle();
  return { data: data as SiteSettings | null, error };
}

/**
 * Update site settings. Upserts so the singleton row is created if the
 * seed never ran. Only provided keys are changed.
 */
export async function updateSiteSettings(
  supabase: SupabaseClient,
  input: Partial<Omit<SiteSettings, "id" | "updated_at">>,
) {
  const { data, error } = await supabase
    .from(TABLE)
    .upsert({ id: ROW_ID, ...input }, { onConflict: "id" })
    .select("*")
    .single();
  return { data: data as SiteSettings | null, error };
}
