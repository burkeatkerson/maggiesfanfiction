import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/utils/auth";
import { fromDbError, fromZodError, ok, unauthorized } from "@/lib/utils/api";
import { siteSettingsUpdateSchema } from "@/lib/validation/schemas";
import { getSiteSettings, updateSiteSettings } from "@/lib/db/settings";

/** GET /api/site-settings — public read of the single settings row. */
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await getSiteSettings(supabase);
  if (error) return fromDbError(error);
  return ok(data);
}

/** PATCH /api/site-settings — update (author only). */
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const user = await getUser(supabase);
  if (!user) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = siteSettingsUpdateSchema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);

  const { data, error } = await updateSiteSettings(supabase, parsed.data);
  if (error) return fromDbError(error);
  return ok(data);
}
