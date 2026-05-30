/**
 * Apply the SQL migrations + seed to a Postgres database, in order.
 *
 * Usage (Node 20.6+):
 *   DATABASE_URL="postgresql://...session-pooler-uri..." node scripts/db-migrate.mjs
 * or via env file:
 *   node --env-file=.env.migrate scripts/db-migrate.mjs
 *
 * Runs each file as a single multi-statement query (simple query protocol),
 * which correctly handles dollar-quoted function bodies. Idempotent: the SQL
 * uses IF NOT EXISTS / ON CONFLICT, so re-running is safe.
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const FILES = [
  "supabase/migrations/0001_init.sql",
  "supabase/migrations/0002_storage.sql",
  "supabase/seed.sql",
];

// Accept either a full DATABASE_URL, or discrete PG* env vars (which avoid
// URI-encoding issues when the password contains @, ?, +, etc.).
const connectionString = process.env.DATABASE_URL;
const hasDiscrete = process.env.PGHOST && process.env.PGPASSWORD;
if (!connectionString && !hasDiscrete) {
  console.error(
    "Provide DATABASE_URL, or PGHOST/PGUSER/PGPASSWORD/PGPORT/PGDATABASE env vars.",
  );
  process.exit(1);
}

const client = new pg.Client({
  ...(connectionString ? { connectionString } : {}),
  // Supabase requires TLS; we don't pin the cert here.
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

try {
  await client.connect();
  console.log("Connected.");
  for (const rel of FILES) {
    const sql = await readFile(join(root, rel), "utf8");
    process.stdout.write(`Applying ${rel} ... `);
    await client.query(sql);
    console.log("ok");
  }
  console.log("\n✓ All migrations + seed applied.");
} catch (err) {
  console.error("\n✗ Migration failed:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
