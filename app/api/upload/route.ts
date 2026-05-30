import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/utils/auth";
import { badRequest, fromDbError, ok, unauthorized } from "@/lib/utils/api";
import { uploadBucketSchema } from "@/lib/validation/schemas";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};

/**
 * POST /api/upload (multipart form-data)
 * Fields: file (image), bucket ("post-images" | "avatars")
 * Returns: { url, path, bucket }. Author only.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const user = await getUser(supabase);
  if (!user) return unauthorized();

  const form = await request.formData().catch(() => null);
  if (!form) return badRequest("Expected multipart/form-data");

  const file = form.get("file");
  if (!(file instanceof File)) return badRequest("A 'file' field is required");

  const parsedBucket = uploadBucketSchema.safeParse(form.get("bucket"));
  if (!parsedBucket.success) {
    return badRequest("'bucket' must be 'post-images' or 'avatars'");
  }
  const bucket = parsedBucket.data;

  if (!file.type.startsWith("image/")) {
    return badRequest("Only image uploads are allowed");
  }
  if (file.size > MAX_BYTES) {
    return badRequest("Image must be 5 MB or smaller");
  }

  const ext = EXT_BY_TYPE[file.type] ?? "bin";
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error } = await supabase.storage.from(bucket).upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });
  if (error) return fromDbError(error as { code?: string; message?: string });

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return ok({ url: data.publicUrl, path, bucket }, 201);
}
