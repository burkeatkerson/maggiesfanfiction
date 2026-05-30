-- ============================================================
-- Maggie's Fan Fiction — seed data
-- Ports DEFAULTS from the prototype admin-data.js into real rows.
-- Idempotent (safe to re-run): conflicts on slug/name are ignored.
-- Run AFTER 0001_init.sql and 0002_storage.sql.
--
-- Sample posts are seeded with author_id = NULL (illustrative).
-- After creating Maggie's auth account + profile, optionally:
--   update public.posts set author_id = '<maggie-uuid>';
-- ============================================================

-- ---------- site settings (single row) ----------
insert into public.site_settings (id, intro, statement, quote, bio, headline_font, site_title, default_seo_description)
values (
  1,
  'A writing journal',
  'Poetry, short stories, fan fiction, and the quiet pages in between — collected, and kept here for anyone who reads slowly.',
  'Some stories are only told in the margins. This is where I keep mine.',
  'Maggie writes fan fiction exploring complex character relationships and emotional depth. Her work lives in the space where enemies become allies and vulnerability becomes its own kind of strength. She has been writing for nine years and keeps a devoted community of readers who follow her interconnected universes from one story to the next.',
  'EB Garamond',
  'Maggie''s Fan Fiction',
  'A writing journal of fan fiction, poetry, short stories, and diary entries by Maggie.'
)
on conflict (id) do nothing;

-- ---------- categories (writing forms) ----------
insert into public.categories (name, slug, note, sort_order) values
  ('Poetry',        'poetry',        'Verse, fragments, and forms',     1),
  ('Short Stories', 'short-stories', 'Self-contained worlds',           2),
  ('Fan Fiction',   'fan-fiction',   'Beloved characters, new fates',   3),
  ('Diary Entries', 'diary-entries', 'Unfiltered, in the moment',       4),
  ('Book Concepts', 'book-concepts', 'Premises still taking shape',     5)
on conflict (slug) do nothing;

-- ---------- series (fandom collections) ----------
insert into public.series (fandom, title, slug, status, note) values
  ('Harry Potter',                'The Unwanted Bonds of Fate', 'the-unwanted-bonds-of-fate', 'Complete', 'Enemies trade letters across a border, and a war waits on the decision of one tired soldier.'),
  ('Percy Jackson',               'Tides That Remember',        'tides-that-remember',        'Ongoing',  'Long after the prophecies are spent, the sea keeps a few of its promises.'),
  ('The Hunger Games',            'Embers in the Ash',          'embers-in-the-ash',          'Complete', 'What the districts rebuilt was never the thing the cameras came to film.'),
  ('A Court of Thorns and Roses', 'The Year of Soft Treaties',  'the-year-of-soft-treaties',  'Ongoing',  'Two courts, one fragile peace, and the small domestic mercies no one negotiated for.'),
  ('The Lord of the Rings',       'What the Quiet Folk Kept',   'what-the-quiet-folk-kept',   'Complete', 'The history the songs left out, told from the edge of a garden in the Shire.')
on conflict (slug) do nothing;

-- ---------- posts ----------
insert into public.posts (title, slug, excerpt, content, body_font, category_id, series_id, series_part, tags, status, reading_time, published_at)
values
  (
    'The Unexpected Kindness in Enemy Territory',
    'the-unexpected-kindness-in-enemy-territory',
    'When she arrived at the meeting point, the last person she expected to see was standing in the shadows.',
    '<p>When she arrived at the meeting point, the last person she expected to see was standing in the shadows. He was supposed to be thousands of miles away, leading his own faction, his own war. But here he was, watching her with those calculating eyes that had haunted her dreams for months.</p><p>&ldquo;You came,&rdquo; he said, stepping into the light.</p>',
    'Crimson Text',
    (select id from public.categories where slug = 'fan-fiction'),
    (select id from public.series where slug = 'the-unwanted-bonds-of-fate'),
    3,
    array['Canon Divergence','Romance','Series','Slow Burn'],
    'published',
    12,
    '2024-05-28T00:00:00Z'
  ),
  (
    'On the Morning You Almost Stayed',
    'on-the-morning-you-almost-stayed',
    'A short verse about the hour before a leaving that never quite happens.',
    '<p>A short verse about the hour before a leaving that never quite happens.</p>',
    'EB Garamond',
    (select id from public.categories where slug = 'poetry'),
    null, null,
    array['Poetry'],
    'published',
    2,
    '2024-05-29T00:00:00Z'
  ),
  (
    'Notebook, Tuesday, Nothing Happened',
    'notebook-tuesday-nothing-happened',
    'An ordinary day, recorded anyway, because some of them turn out to matter later.',
    '<p>An ordinary day, recorded anyway, because some of them turn out to matter later.</p>',
    'Crimson Text',
    (select id from public.categories where slug = 'diary-entries'),
    null, null,
    array['Diary'],
    'published',
    3,
    '2024-05-24T00:00:00Z'
  ),
  (
    'A House That Forgives Its Tenants',
    'a-house-that-forgives-its-tenants',
    'Premise: a house keeps a ledger of everyone who has ever lived in it, and one day it forgives a debt.',
    '<p>Premise: a house keeps a ledger of everyone who has ever lived in it, and one day it forgives a debt.</p>',
    'Lora',
    (select id from public.categories where slug = 'book-concepts'),
    null, null,
    array['Concept'],
    'draft',
    2,
    null
  ),
  (
    'Six Small Hours',
    'six-small-hours',
    'Two strangers share a delayed train and the particular intimacy of borrowed time.',
    '<p>Two strangers share a delayed train and the particular intimacy of borrowed time.</p>',
    'Crimson Text',
    (select id from public.categories where slug = 'short-stories'),
    null, null,
    array['Short Story'],
    'published',
    8,
    '2024-05-18T00:00:00Z'
  ),
  (
    'Tides That Remember — Part 8',
    'tides-that-remember-part-8',
    'The next chapter, still finding its shape. The sea keeps a few of its promises.',
    '<p>The next chapter, still finding its shape. The sea keeps a few of its promises.</p>',
    'Crimson Text',
    (select id from public.categories where slug = 'fan-fiction'),
    (select id from public.series where slug = 'tides-that-remember'),
    8,
    array['Fan Fiction','Series'],
    'draft',
    6,
    null
  )
on conflict (slug) do nothing;
