import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Consistent JSON response envelope for all API routes:
 *   success -> { data }
 *   error   -> { error: { message, code } }
 */

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function fail(message: string, code: string, status: number) {
  return NextResponse.json({ error: { message, code } }, { status });
}

export const badRequest = (message = "Invalid request") =>
  fail(message, "bad_request", 400);

export const unauthorized = (message = "Authentication required") =>
  fail(message, "unauthorized", 401);

export const forbidden = (message = "Not allowed") =>
  fail(message, "forbidden", 403);

export const notFound = (message = "Not found") =>
  fail(message, "not_found", 404);

export const conflict = (message = "Conflict") =>
  fail(message, "conflict", 409);

export const serverError = (message = "Something went wrong") =>
  fail(message, "server_error", 500);

/** Turn a ZodError into a flat, readable 400. */
export function fromZodError(error: ZodError) {
  const message = error.issues
    .map((i) => `${i.path.join(".") || "body"}: ${i.message}`)
    .join("; ");
  return badRequest(message);
}

/**
 * Map a Supabase/Postgres error to an HTTP response. Handles the common
 * cases (unique-violation -> 409, RLS denial -> 403); everything else 500.
 */
export function fromDbError(error: { code?: string; message?: string } | null) {
  if (!error) return serverError();
  if (error.code === "23505") return conflict("That value already exists");
  if (error.code === "23503") return badRequest("Referenced record does not exist");
  // RLS denials surface as 42501 (insufficient_privilege) or empty results.
  if (error.code === "42501") return forbidden("You do not have access to this resource");
  return serverError(error.message || "Database error");
}
