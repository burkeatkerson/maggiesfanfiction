/**
 * Discover the correct Supabase Session Pooler host for a project by
 * trying the credentials against each region's pooler. The pooler routes
 * by username (postgres.<ref>), so only the project's real region accepts
 * the connection; the rest fail fast.
 *
 * Usage:
 *   PROJECT_REF=... PGPASSWORD='...' node scripts/find-pooler.mjs
 */
import pg from "pg";

const ref = process.env.PROJECT_REF;
const password = process.env.PGPASSWORD;
if (!ref || !password) {
  console.error("Set PROJECT_REF and PGPASSWORD.");
  process.exit(1);
}

const regions = [
  "us-east-1", "us-east-2", "us-west-1", "us-west-2",
  "ca-central-1", "sa-east-1",
  "eu-west-1", "eu-west-2", "eu-west-3",
  "eu-central-1", "eu-central-2", "eu-north-1",
  "ap-south-1", "ap-southeast-1", "ap-southeast-2",
  "ap-northeast-1", "ap-northeast-2",
];
const prefixes = ["aws-0", "aws-1"];

const candidates = [];
for (const prefix of prefixes) {
  for (const region of regions) {
    candidates.push(`${prefix}-${region}.pooler.supabase.com`);
  }
}

async function tryHost(host) {
  const client = new pg.Client({
    host,
    port: 5432,
    user: `postgres.${ref}`,
    password,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
    query_timeout: 8000,
  });
  try {
    await client.connect();
    await client.query("select 1");
    await client.end();
    return { host, ok: true };
  } catch (err) {
    try { await client.end(); } catch {}
    return { host, ok: false, message: err.message };
  }
}

const results = await Promise.all(candidates.map(tryHost));
const hit = results.find((r) => r.ok);

if (hit) {
  console.log(`FOUND: ${hit.host}`);
} else {
  console.log("No region matched. Distinct errors seen:");
  const seen = new Set();
  for (const r of results) {
    if (!seen.has(r.message)) {
      seen.add(r.message);
      console.log(` - ${r.message}`);
    }
  }
  process.exitCode = 1;
}
