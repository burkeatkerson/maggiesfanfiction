import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/utils/auth";
import { fromDbError, fromZodError, ok, unauthorized } from "@/lib/utils/api";
import { seriesCreateSchema } from "@/lib/validation/schemas";
import { createSeries, listSeries } from "@/lib/db/series";

/** GET /api/series — public list, each with a derived `parts` count. */
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await listSeries(supabase);
  if (error) return fromDbError(error);
  return ok(data ?? []);
}

/** POST /api/series — create (author only). */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const user = await getUser(supabase);
  if (!user) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = seriesCreateSchema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);

  const { data, error } = await createSeries(supabase, parsed.data);
  if (error) return fromDbError(error);
  return ok(data, 201);
}
