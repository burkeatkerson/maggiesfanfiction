# Maggie's Fan Fiction — Backend

A Next.js 15 (App Router) + Supabase backend for a **single-author** writing journal.
This pass builds the data layer, auth, storage, and API only — the reader/admin UI
(the prototype `*.jsx`/`*.html` files in this folder) is ported in a later phase.

- **Single author** — only Maggie signs in; the public reads published content anonymously.
- **Postgres + RLS** — content tables with Row-Level Security so writes are locked to the owner.
- **Storage** — public-read buckets for featured images and the author photo.

---

## 1. Prerequisites

- Node.js 20.6+ (uses `--env-file`). Developed on Node 24.
- A free [Supabase](https://supabase.com) project.

## 2. Install & configure

```bash
npm install
cp .env.example .env.local   # then fill in the values below
```

`.env.local`:

| Variable | Where to find it | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL | public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same page → `anon` key | public; RLS protects data |
| `SUPABASE_SERVICE_ROLE_KEY` | same page → `service_role` key | **server only**, never commit |
| `AUTHOR_EMAIL` | Maggie's sign-in email | login rejects any other address |
| `NEXT_PUBLIC_SITE_URL` | e.g. `http://localhost:3000` | used later for OG/sitemap |

## 3. Create the database

Apply the SQL in order. Either the **Supabase SQL Editor** (paste each file) or the **CLI**:

```bash
# Supabase SQL Editor: run these top-to-bottom
supabase/migrations/0001_init.sql     # tables, indexes, triggers, RLS
supabase/migrations/0002_storage.sql  # buckets + storage policies
supabase/seed.sql                     # demo categories/series/settings/posts
```

With the Supabase CLI linked to your project:

```bash
supabase db push           # applies migrations in supabase/migrations
# then run seed.sql via the SQL editor, or:
psql "$DATABASE_URL" -f supabase/seed.sql
```

After this you should have `categories` (5), `series` (5), one `site_settings` row,
and 6 sample `posts` (4 published, 2 drafts).

## 4. Create Maggie's account

```bash
node --env-file=.env.local scripts/create-author.mjs you@example.com "a-strong-password" "Maggie"
```

This creates the auth user (email pre-confirmed) and a matching `profiles` row.
Set `AUTHOR_EMAIL` to the same address. (Optionally, to attribute the seeded demo
posts to her: `update public.posts set author_id = '<her-uuid>';`)

Verify buckets `post-images` and `avatars` exist and are **public** (Storage tab).

## 5. Run

```bash
npm run dev          # http://localhost:3000
npm run typecheck    # tsc --noEmit
npm run build        # production build
```

---

## API reference

All responses use one envelope: success → `{ "data": ... }`, error → `{ "error": { "message", "code" } }`.
Write endpoints require the author's session cookie (set by `POST /api/auth/login`).

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | – | Sign in (`{ email, password }`); rejects non-`AUTHOR_EMAIL`. |
| POST | `/api/auth/logout` | – | Sign out. |
| GET | `/api/auth/session` | – | Current user or `null`. |
| GET | `/api/posts` | – | List. `?status=draft\|published&category=<slug>&series=<slug>&limit&offset`. Anonymous sees published only. |
| POST | `/api/posts` | ✅ | Create. Auto slug + reading time; `published_at` set when published. |
| GET | `/api/posts/[id]` | – | Single by **slug or id**. Drafts hidden from anonymous. |
| PATCH | `/api/posts/[id]` | ✅ | Update (id only). |
| DELETE | `/api/posts/[id]` | ✅ | Delete (id only). |
| GET | `/api/categories` | – | List (ordered). |
| POST | `/api/categories` | ✅ | Create. |
| PATCH / DELETE | `/api/categories/[id]` | ✅ | Update / delete. |
| GET | `/api/series` | – | List, each with derived `parts` count. |
| POST | `/api/series` | ✅ | Create. |
| PATCH / DELETE | `/api/series/[id]` | ✅ | Update / delete. |
| GET | `/api/site-settings` | – | The single settings row. |
| PATCH | `/api/site-settings` | ✅ | Update. |
| GET | `/api/author` | – | The author profile. |
| PATCH | `/api/author` | ✅ | Update own profile. |
| POST | `/api/upload` | ✅ | Multipart `{ file, bucket }` → `{ url }`. Images ≤ 5 MB. |

> Note: single-post GET/PATCH/DELETE share one `/api/posts/[id]` route because Next.js
> cannot have sibling `[slug]` and `[id]` segments. GET accepts a slug or a uuid.

### Quick verification (with the dev server running)

```bash
# public list — published only
curl -s http://localhost:3000/api/posts | jq '.data | length'

# single post by slug
curl -s http://localhost:3000/api/posts/the-unexpected-kindness-in-enemy-territory | jq '.data.title'

# series with derived parts count
curl -s http://localhost:3000/api/series | jq '.data[] | {title, parts}'

# unauthenticated create is rejected (expect 401)
curl -s -X POST http://localhost:3000/api/posts -H 'content-type: application/json' \
  -d '{"title":"Nope"}' | jq

# sign in (saves the session cookie), then create a post
curl -s -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"you@example.com","password":"a-strong-password"}' | jq
curl -s -b cookies.txt -X POST http://localhost:3000/api/posts \
  -H 'content-type: application/json' \
  -d '{"title":"A Test Story","content":"<p>Hello world.</p>","status":"published"}' | jq '.data | {slug, reading_time, published_at}'
```

---

## Deploy to Vercel

1. Push this repo to GitHub and **Import** it in Vercel.
2. Add env vars in **Project Settings → Environment Variables**: all five from `.env.local`.
   Mark `SUPABASE_SERVICE_ROLE_KEY` as a sensitive/secret value. Set `NEXT_PUBLIC_SITE_URL`
   to the production URL.
3. In Supabase → **Authentication → URL Configuration**, add the Vercel domain to the
   allowed redirect URLs.
4. Run the migrations + seed against the production project (steps 3–4 above) if not already.
5. Deploy. The placeholder homepage confirms the app booted; the API is live under `/api/*`.

## Project layout (backend)

```
app/api/**          Route handlers (REST)
lib/supabase/*      Browser, server, admin, and middleware Supabase clients
lib/db/*            Typed query functions (reused by routes + future RSC)
lib/validation/*    zod schemas
lib/utils/*         api envelope, slug, reading-time, auth guard, id helpers
lib/fonts.ts        3 headline + 12 body fonts (shared with the future UI)
supabase/*          SQL migrations + seed
middleware.ts       session refresh + /admin guard
scripts/*           author-creation helper
```

The prototype design files (`homepage.jsx`, `blocks.jsx`, `admin-*.jsx`, `*.html`,
`styles.css`, `content.js`, `admin-data.js`) are untouched and excluded from the
TypeScript build; they are the reference for the frontend port.
