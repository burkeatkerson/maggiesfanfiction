/**
 * Centralized environment access with clear errors when a required
 * variable is missing. NEXT_PUBLIC_* values are inlined at build time.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}. Copy .env.example to .env.local and fill it in.`,
    );
  }
  return value;
}

export const SUPABASE_URL = () =>
  required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);

// Supabase is migrating from legacy JWT keys (anon / service_role) to named
// keys (publishable / secret). Accept either; prefer the newer name.
export const SUPABASE_ANON_KEY = () =>
  required(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

export const SUPABASE_SERVICE_ROLE_KEY = () =>
  required(
    "SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY)",
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

/** The single email allowed to sign in. Optional but recommended. */
export const AUTHOR_EMAIL = () => process.env.AUTHOR_EMAIL?.trim().toLowerCase() || null;

export const SITE_URL = () =>
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
