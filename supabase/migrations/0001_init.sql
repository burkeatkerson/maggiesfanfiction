-- ============================================================
-- Maggie's Fan Fiction — 0001 init
-- Schema, indexes, triggers, and Row-Level Security.
-- Single-author model: one writer (Maggie) owns all content;
-- the public reads published content anonymously.
-- ============================================================

-- gen_random_uuid() lives in pgcrypto (preinstalled on Supabase).
create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- Helper: maintain updated_at on row updates.
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- profiles — the author. 1:1 with auth.users.
-- ============================================================
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  name         text,
  avatar_url   text,
  email        text,
  social_links jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger trg_profiles_updated
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Helper: is the current request the site's single author?
-- security definer so it can read profiles regardless of RLS.
-- Defined after profiles so the SQL body validates.
-- ------------------------------------------------------------
create or replace function public.is_author()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid());
$$;

-- ============================================================
-- site_settings — single row (id is pinned to 1).
-- Mirrors DEFAULTS.site from the prototype admin-data.js.
-- ============================================================
create table if not exists public.site_settings (
  id                      int primary key default 1,
  intro                   text,
  statement               text,
  quote                   text,
  bio                     text,
  photo_url               text,
  headline_font           text not null default 'EB Garamond',
  site_title              text,
  default_seo_description text,
  og_image_url            text,
  updated_at              timestamptz not null default now(),
  constraint site_settings_singleton check (id = 1)
);

create trigger trg_site_settings_updated
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ============================================================
-- categories — the writing forms (Poetry, Fan Fiction, ...).
-- ============================================================
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text unique,
  note       text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- series — fandom collections. `parts` is DERIVED (count of
-- posts), never stored here.
-- ============================================================
create table if not exists public.series (
  id         uuid primary key default gen_random_uuid(),
  fandom     text,
  title      text not null,
  slug       text unique,
  status     text check (status in ('Ongoing','Complete')),
  note       text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_series_updated
  before update on public.series
  for each row execute function public.set_updated_at();

-- ============================================================
-- posts — the content.
-- category_id = single writing form; tags[] = freeform genre
-- tags shown on the article page (see content.js).
-- ============================================================
create table if not exists public.posts (
  id                      uuid primary key default gen_random_uuid(),
  title                   text not null,
  headline                text,                 -- optional display H1; UI falls back to title
  slug                    text not null unique,
  excerpt                 text,
  content                 text,                 -- sanitized HTML body
  body_font               text not null default 'Crimson Text',
  category_id             uuid references public.categories(id) on delete set null,
  series_id               uuid references public.series(id) on delete set null,
  series_part             int,
  tags                    text[] not null default '{}',
  status                  text not null default 'draft' check (status in ('draft','published')),
  featured_image_url      text,
  featured_image_caption  text,
  seo_description         text,
  reading_time            int not null default 1, -- minutes, computed on write
  author_id               uuid references public.profiles(id) on delete set null,
  published_at            timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index if not exists posts_status_idx       on public.posts(status);
create index if not exists posts_category_idx      on public.posts(category_id);
create index if not exists posts_series_idx        on public.posts(series_id);
create index if not exists posts_published_at_idx  on public.posts(published_at desc);

create trigger trg_posts_updated
  before update on public.posts
  for each row execute function public.set_updated_at();

-- Backstop: keep published_at consistent with status even if a
-- caller forgets to set it. The app layer also sets this.
create or replace function public.sync_published_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  elsif new.status = 'draft' then
    new.published_at = null;
  end if;
  return new;
end;
$$;

create trigger trg_posts_sync_published
  before insert or update on public.posts
  for each row execute function public.sync_published_at();

-- ============================================================
-- Row-Level Security
-- ============================================================
alter table public.profiles      enable row level security;
alter table public.site_settings enable row level security;
alter table public.categories    enable row level security;
alter table public.series        enable row level security;
alter table public.posts         enable row level security;

-- profiles: public can read the author bio; only the owner edits.
create policy "profiles_select_public" on public.profiles
  for select using (true);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- site_settings: public read; author-only writes.
create policy "site_settings_select_public" on public.site_settings
  for select using (true);
create policy "site_settings_write_author" on public.site_settings
  for all using (public.is_author()) with check (public.is_author());

-- categories: public read; author-only writes.
create policy "categories_select_public" on public.categories
  for select using (true);
create policy "categories_write_author" on public.categories
  for all using (public.is_author()) with check (public.is_author());

-- series: public read; author-only writes.
create policy "series_select_public" on public.series
  for select using (true);
create policy "series_write_author" on public.series
  for all using (public.is_author()) with check (public.is_author());

-- posts: public reads published; owner reads/writes everything of theirs.
create policy "posts_select_published_or_owner" on public.posts
  for select using (status = 'published' or auth.uid() = author_id);
create policy "posts_insert_owner" on public.posts
  for insert with check (auth.uid() = author_id);
create policy "posts_update_owner" on public.posts
  for update using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "posts_delete_owner" on public.posts
  for delete using (auth.uid() = author_id);
