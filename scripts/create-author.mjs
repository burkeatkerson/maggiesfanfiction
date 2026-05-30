/**
 * Create the single author account (auth user + profile row).
 *
 * Usage (Node 20.6+, loads .env.local automatically):
 *   node --env-file=.env.local scripts/create-author.mjs you@example.com "a-strong-password" "Maggie"
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY (bypasses RLS). Idempotent-ish:
 * re-running with an existing email reports the conflict instead of failing hard.
 */
import { createClient } from "@supabase/supabase-js";

const [, , email, password, name = "Maggie"] = process.argv;

if (!email || !password) {
  console.error('Usage: node --env-file=.env.local scripts/create-author.mjs <email> <password> ["Name"]');
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceRole) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in env.");
  process.exit(1);
}

const admin = createClient(url, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let userId;

const { data, error } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (error) {
  // Idempotent path: user already exists — find them and reset the password
  // so the provided credentials are guaranteed to work.
  if (/already been registered|already exists/i.test(error.message)) {
    const { data: list, error: listErr } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (listErr) {
      console.error("Could not list users:", listErr.message);
      process.exit(1);
    }
    const existing = list.users.find(
      (u) => (u.email || "").toLowerCase() === email.toLowerCase(),
    );
    if (!existing) {
      console.error(`User reported as existing but not found in listing: ${email}`);
      process.exit(1);
    }
    userId = existing.id;
    const { error: updErr } = await admin.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
    });
    if (updErr) {
      console.error("Found user but could not update password:", updErr.message);
      process.exit(1);
    }
    console.log(`↻ Existing account found; password reset for ${email}`);
  } else {
    console.error("Could not create auth user:", error.message);
    process.exit(1);
  }
} else {
  userId = data.user.id;
}

const { error: profileError } = await admin.from("profiles").upsert(
  { id: userId, name, email },
  { onConflict: "id" },
);

if (profileError) {
  console.error("Auth user created but profile upsert failed:", profileError.message);
  process.exit(1);
}

console.log(`✓ Author created: ${email} (id ${userId})`);
console.log(`  Set AUTHOR_EMAIL=${email} in your env, then sign in via POST /api/auth/login.`);
