-- ============================================================
-- Maggie's Fan Fiction — 0002 storage
-- Public-read buckets for featured images and the author photo,
-- with author-only write policies on storage.objects.
-- ============================================================

-- Create buckets (idempotent). public = true so files are readable
-- by anyone via the public object URL (and by next/image).
insert into storage.buckets (id, name, public)
values
  ('post-images', 'post-images', true),
  ('avatars',     'avatars',     true)
on conflict (id) do update set public = excluded.public;

-- ------------------------------------------------------------
-- storage.objects policies (RLS is already enabled by Supabase).
-- Public can read; only the authenticated author can write.
-- ------------------------------------------------------------

-- Public read for both buckets.
drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read" on storage.objects
  for select
  using (bucket_id in ('post-images', 'avatars'));

-- Author-only insert.
drop policy if exists "media_author_insert" on storage.objects;
create policy "media_author_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('post-images', 'avatars') and public.is_author());

-- Author-only update.
drop policy if exists "media_author_update" on storage.objects;
create policy "media_author_update" on storage.objects
  for update to authenticated
  using (bucket_id in ('post-images', 'avatars') and public.is_author())
  with check (bucket_id in ('post-images', 'avatars') and public.is_author());

-- Author-only delete.
drop policy if exists "media_author_delete" on storage.objects;
create policy "media_author_delete" on storage.objects
  for delete to authenticated
  using (bucket_id in ('post-images', 'avatars') and public.is_author());
