import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Root middleware: refreshes the Supabase session on every matched
 * request and guards /admin/* (redirecting unauthenticated users to
 * the login page). Write API routes additionally re-check auth.
 */
export async function middleware(request: NextRequest) {
  const { supabaseResponse } = await updateSession(request);

  // NOTE: the /admin/* auth guard is intentionally disabled during the
  // frontend-port phase — the admin UI runs on mock data and the login is
  // not yet wired to Supabase Auth. Re-enable this block when the admin is
  // connected to the live backend:
  //
  //   const { pathname } = request.nextUrl;
  //   if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !user) {
  //     const url = request.nextUrl.clone();
  //     url.pathname = "/admin/login";
  //     return NextResponse.redirect(url);
  //   }

  return supabaseResponse;
}

export const config = {
  // Run on everything except static assets and image optimization.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
