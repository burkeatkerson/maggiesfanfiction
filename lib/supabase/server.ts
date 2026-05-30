import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieToSet = { name: string; value: string; options?: CookieOptions };
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";

/**
 * Server-side Supabase client for Server Components and Route Handlers.
 * Bound to the request's cookies so the user's session (and therefore
 * RLS) is honored. In Next 15 `cookies()` is async.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL(), SUPABASE_ANON_KEY(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        // In a pure Server Component render, setting cookies throws;
        // that's fine because middleware refreshes the session.
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          /* called from a Server Component — ignore */
        }
      },
    },
  });
}
