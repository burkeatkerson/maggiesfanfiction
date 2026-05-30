import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/utils/auth";
import { fromDbError, fromZodError, notFound, ok, unauthorized } from "@/lib/utils/api";
import { seriesUpdateSchema } from "@/lib/validation/schemas";
import { deleteSeries, updateSeries } from "@/lib/db/series";
import { isUuid } from "@/lib/utils/ids";

type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/series/[id] — update (author only). */
export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  if (!isUuid(id)) return notFound("Series not found");

  const supabase = await createClient();
  const user = await getUser(supabase);
  if (!user) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = seriesUpdateSchema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);

  const { data, error } = await updateSeries(supabase, id, parsed.data);
  if (error) return fromDbError(error);
  if (!data) return notFound("Series not found");
  return ok(data);
}

/** DELETE /api/series/[id] — delete (author only). */
export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  if (!isUuid(id)) return notFound("Series not found");

  const supabase = await createClient();
  const user = await getUser(supabase);
  if (!user) return unauthorized();

  const { error } = await deleteSeries(supabase, id);
  if (error) return fromDbError(error);
  return ok({ id, deleted: true });
}
