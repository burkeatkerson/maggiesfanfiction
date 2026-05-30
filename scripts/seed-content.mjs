/**
 * Seed real + fake content into Supabase (service-role, idempotent).
 *
 *   node --env-file=.env.local scripts/seed-content.mjs
 *
 * Upserts site_settings, categories, series, and posts (upsert on slug),
 * all attributed to the single author profile. Safe to re-run.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !secret) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY.");
  process.exit(1);
}
const db = createClient(url, secret, { auth: { autoRefreshToken: false, persistSession: false } });

// ---------- helpers ----------
const slugify = (s) =>
  s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/['‘’]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "post";
const p = (...ps) => ps.map((t) => `<p>${t}</p>`).join("");
const readingTime = (html) => {
  const words = html.replace(/<[^>]*>/g, " ").replace(/&[a-z]+;/gi, " ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};
// deterministic date generator (no Math.random for stable re-seeds)
const dateFor = (i) => {
  const start = new Date("2023-09-01T00:00:00Z").getTime();
  const d = new Date(start + i * 5 * 24 * 3600 * 1000);
  return d.toISOString();
};

async function main() {
  // author
  const { data: prof } = await db.from("profiles").select("id").order("created_at").limit(1).maybeSingle();
  const authorId = prof?.id ?? "efa03d0b-ea64-4117-acb8-a394a3c4ebf6";
  console.log("author_id:", authorId);

  // ---------- site settings ----------
  await db.from("site_settings").upsert({
    id: 1,
    intro: "A writing journal",
    statement:
      "Poetry, short stories, fan fiction, and the quiet pages in between — collected, and kept here for anyone who reads slowly.",
    quote: "Some stories are only told in the margins. This is where I keep mine.",
    bio: "Maggie writes fan fiction exploring complex character relationships and emotional depth. Her work lives in the space where enemies become allies and vulnerability becomes its own kind of strength. She has been writing for nine years and keeps a devoted community of readers who follow her interconnected universes from one story to the next.",
    headline_font: "EB Garamond",
    site_title: "Maggie's Fan Fiction",
    default_seo_description:
      "A writing journal of fan fiction, poetry, short stories, and diary entries by Maggie.",
  }, { onConflict: "id" });
  console.log("✓ site_settings");

  // ---------- categories ----------
  const categories = [
    { name: "Poetry", slug: "poetry", note: "Verse, fragments, and forms", sort_order: 1 },
    { name: "Short Stories", slug: "short-stories", note: "Self-contained worlds", sort_order: 2 },
    { name: "Fan Fiction", slug: "fan-fiction", note: "Beloved characters, new fates", sort_order: 3 },
    { name: "Diary Entries", slug: "diary-entries", note: "Unfiltered, in the moment", sort_order: 4 },
    { name: "Book Concepts", slug: "book-concepts", note: "Premises still taking shape", sort_order: 5 },
  ];
  await db.from("categories").upsert(categories, { onConflict: "slug" });
  const { data: catRows } = await db.from("categories").select("id, slug");
  const catId = Object.fromEntries(catRows.map((c) => [c.slug, c.id]));
  console.log("✓ categories:", Object.keys(catId).length);

  // ---------- series ----------
  const series = [
    { fandom: "Harry Potter", title: "The Unwanted Bonds of Fate", slug: "the-unwanted-bonds-of-fate", status: "Complete", note: "Enemies trade letters across a border, and a war waits on the decision of one tired soldier." },
    { fandom: "Percy Jackson", title: "Tides That Remember", slug: "tides-that-remember", status: "Ongoing", note: "Long after the prophecies are spent, the sea keeps a few of its promises." },
    { fandom: "The Hunger Games", title: "Embers in the Ash", slug: "embers-in-the-ash", status: "Complete", note: "What the districts rebuilt was never the thing the cameras came to film." },
    { fandom: "A Court of Thorns and Roses", title: "The Year of Soft Treaties", slug: "the-year-of-soft-treaties", status: "Ongoing", note: "Two courts, one fragile peace, and the small domestic mercies no one negotiated for." },
    { fandom: "The Lord of the Rings", title: "What the Quiet Folk Kept", slug: "what-the-quiet-folk-kept", status: "Complete", note: "The history the songs left out, told from the edge of a garden in the Shire." },
  ];
  await db.from("series").upsert(series, { onConflict: "slug" });
  const { data: serRows } = await db.from("series").select("id, slug");
  const serId = Object.fromEntries(serRows.map((s) => [s.slug, s.id]));
  console.log("✓ series:", Object.keys(serId).length);

  // ---------- posts ----------
  const posts = [];
  const add = (post) => {
    const content = post.content ?? p(post.excerpt ?? "");
    posts.push({
      title: post.title,
      headline: post.headline ?? null,
      slug: post.slug ?? slugify(post.title),
      excerpt: post.excerpt ?? null,
      content,
      body_font: post.body_font ?? "Crimson Text",
      category_id: catId[post.category],
      series_id: post.series ? serId[post.series] : null,
      series_part: post.series_part ?? null,
      tags: post.tags ?? [],
      status: post.status ?? "published",
      featured_image_caption: post.caption ?? null,
      seo_description: post.seo ?? null,
      reading_time: readingTime(content),
      author_id: authorId,
      published_at: (post.status ?? "published") === "published" ? post.date ?? dateFor(posts.length) : null,
    });
  };

  // --- REAL: The Unwanted Bonds of Fate (5 parts) ---
  add({ title: "First Contact at the Border", headline: "A Truce Written in the Margins", slug: "first-contact-at-the-border", category: "fan-fiction", series: "the-unwanted-bonds-of-fate", series_part: 1, tags: ["Canon Divergence", "First Meetings", "Series", "Enemies to Allies"], date: "2024-03-04T00:00:00Z", caption: "Featured Image — the border outpost at dusk", excerpt: "A truce arrives folded into a ration crate, in a hand she does not recognize.", content: p(
    "The border had been quiet for three days, which everyone agreed was worse than the fighting. Quiet meant something was being decided in rooms she would never be allowed to enter, by people who had never once asked her opinion of the war they expected her to die for.",
    "She found the letter folded into the seam of a ration crate — no seal, no signature, only a single line in a hand she did not recognize. “There is another way through the pass. Come alone, or do not come at all.”",
    "It was almost certainly a trap. She had been a soldier long enough to know the shape of one. And yet there was something in the careful, deliberate strokes of the writing, a patience that did not belong to anyone who simply wanted her dead.",
    "By the time the moon rose over the ridge, she had made her decision. She always had. That was the thing no one understood about her — she had never once chosen the safe road, and she was not about to start now.") });
  add({ title: "What the Quiet Built", headline: "Letters We Were Never Meant to Send", slug: "what-the-quiet-built", category: "fan-fiction", series: "the-unwanted-bonds-of-fate", series_part: 2, tags: ["Slow Burn", "Correspondence", "Series", "Pining"], date: "2024-04-11T00:00:00Z", caption: "Featured Image — a desk of unsent letters", excerpt: "After the pass, they do not speak of what happened there. But the letters continue.", content: p(
    "After the pass, they did not speak of what had happened there. It was easier that way, or at least it was the kind of difficult they both already knew how to carry. But the letters continued.",
    "They came irregularly, smuggled through channels neither of them named, and each one was a small act of treason. He wrote the way he fought — economical, precise, never a word more than necessary — and she read the spaces between his sentences for everything he refused to say outright.",
    "“You are reckless,” he wrote once. She wrote back: “And yet you keep writing to me.” He did not answer for two weeks, and when he did, he did not mention it at all, which was its own kind of answer.",
    "This was the foundation, though neither of them would have called it that. Not trust, not yet. Something quieter and more dangerous — the slow accumulation of a person who had begun, against every order, to matter.") });
  add({ title: "The Unexpected Kindness in Enemy Territory", headline: "The Unexpected Kindness in Enemy Territory", slug: "the-unexpected-kindness-in-enemy-territory", category: "fan-fiction", series: "the-unwanted-bonds-of-fate", series_part: 3, tags: ["Canon Divergence", "Romance", "Series", "Slow Burn"], date: "2024-05-28T00:00:00Z", caption: "Featured Image — the meeting point, after midnight", seo: "Part 3 of The Unwanted Bonds of Fate — a midnight rendezvous between two people the war made enemies.", excerpt: "When she arrived at the meeting point, the last person she expected to see was standing in the shadows.", content: p(
    "When she arrived at the meeting point, the last person she expected to see was standing in the shadows. He was supposed to be thousands of miles away, leading his own faction, his own war. But here he was, watching her with those calculating eyes that had haunted her dreams for months.",
    "“You came,” he said, stepping into the light. The rigid military bearing was still there, that imposing frame, but something softer had taken root beneath the surface, something that had not been there the last time they stood this close.",
    "“I almost didn’t,” she admitted. The truth of it surprised her even as she said it. “I told myself a dozen times it was a mistake. I am still telling myself that now.”",
    "He did not move closer, and she understood that the distance was a courtesy — that he was leaving the next step entirely to her. The man who commanded armies, waiting on the decision of one tired soldier in the dark.",
    "“Then why are you here?” he asked. Not a challenge. A genuine question, asked gently, as though her answer were something he intended to keep.",
    "She looked at him for a long moment — at the enemy she had been taught to hate, who had spent the last six months quietly becoming the only person she trusted — and she found she no longer had a single lie left worth telling him.") });
  add({ title: "Two Wars, One Choice", headline: "When the Map No Longer Had a Side for Us", slug: "two-wars-one-choice", category: "fan-fiction", series: "the-unwanted-bonds-of-fate", series_part: 4, tags: ["Hurt/Comfort", "High Stakes", "Series", "Devotion"], date: "2024-06-19T00:00:00Z", caption: "Featured Image — the war map, redrawn", excerpt: "Choosing each other left no room for anyone else to be chosen. There would be a reckoning.", content: p(
    "The thing about choosing each other was that it left no room for anyone else to be chosen. They both understood this before either of them said it aloud. There would be a reckoning. There always was.",
    "When the orders came down — hers from the north, his from the south, both pointing toward the same valley on the same grey morning — it was almost a relief to finally have the shape of the impossible thing in front of them.",
    "“We could run,” she said, and the word tasted strange in her mouth, like a language she had never been taught.",
    "“I have spent my whole life following orders I did not write,” he said at last. “I think I would like, just once, to follow something I chose.” And he held out his hand, and the war went on without them, the way wars always do.") });
  add({ title: "The Bonds We Chose", headline: "All the Quiet Years After", slug: "the-bonds-we-chose", category: "fan-fiction", series: "the-unwanted-bonds-of-fate", series_part: 5, tags: ["Found Family", "Soft Endings", "Series", "Happily Ever After"], date: "2024-07-30T00:00:00Z", caption: "Featured Image — the small house past the ridge", excerpt: "Peace, when it finally came, was not the grand thing the songs had promised.", content: p(
    "Peace, when it finally came, was not the grand thing the songs had promised. It arrived quietly, in the form of an ordinary morning, with the kettle on and the light coming sideways through a window in a house that belonged to no faction at all.",
    "She still woke sometimes reaching for a weapon that was no longer there. He never said anything about it, only rested his hand on her shoulder until the room came back into focus.",
    "The community they built was small and stubborn and made entirely of people the war had tried to throw away. They stayed because for the first time in their lives no one was asking them to be a weapon.",
    "“Do you ever regret it?” she asked him once, late, when the fire had burned down to its patient embers. “Not once,” he said. “Not for a single day.” And she believed him, because by then she had finally learned how.") });

  // --- REAL: standalone ---
  add({ title: "On the Morning You Almost Stayed", slug: "on-the-morning-you-almost-stayed", category: "poetry", body_font: "EB Garamond", tags: ["Poetry"], date: "2024-05-29T00:00:00Z", excerpt: "A short verse about the hour before a leaving that never quite happens.", content: p("A short verse about the hour before a leaving that never quite happens — the coat half-on, the kettle still warm, the door that stays, against all sense, closed.") });
  add({ title: "Notebook, Tuesday, Nothing Happened", slug: "notebook-tuesday-nothing-happened", category: "diary-entries", tags: ["Diary"], date: "2024-05-24T00:00:00Z", excerpt: "An ordinary day, recorded anyway, because some of them turn out to matter later.", content: p("An ordinary day, recorded anyway, because some of them turn out to matter later. I am keeping it here in case this is one of those.") });
  add({ title: "A House That Forgives Its Tenants", slug: "a-house-that-forgives-its-tenants", category: "book-concepts", body_font: "Lora", tags: ["Concept"], status: "draft", excerpt: "Premise: a house keeps a ledger of everyone who has ever lived in it, and one day it forgives a debt.", content: p("Premise: a house keeps a ledger of everyone who has ever lived in it, and one day it forgives a debt.") });
  add({ title: "Six Small Hours", slug: "six-small-hours", category: "short-stories", tags: ["Short Story"], date: "2024-05-18T00:00:00Z", excerpt: "Two strangers share a delayed train and the particular intimacy of borrowed time.", content: p("Two strangers share a delayed train and the particular intimacy of borrowed time — the kind of honesty that only exists between people who have agreed, without saying so, never to meet again.") });
  add({ title: "Tides That Remember — Part 8", slug: "tides-that-remember-part-8", category: "fan-fiction", series: "tides-that-remember", series_part: 8, tags: ["Fan Fiction", "Series"], status: "draft", excerpt: "The next chapter, still finding its shape. The sea keeps a few of its promises.", content: p("The next chapter, still finding its shape. The sea keeps a few of its promises.") });

  // --- FAKE COPY: generated to populate the site ---
  const bodyPool = [
    "She had not meant to write it down, but the morning insisted, the way some mornings do.",
    "There is a particular silence that follows a decision, and she was learning to live inside it.",
    "He kept the letter in his coat for a week before he answered, as though warmth could change the words.",
    "The garden did not care who won the war; it kept its own slow, green counsel through every season.",
    "What the cameras never filmed was the smaller mercy: a shared cup, a held door, a name said gently.",
    "By the time the rain came, neither of them remembered who had first suggested staying.",
    "Some promises are kept quietly, in the spaces between what is said, and those are the ones that last.",
    "The sea returned what it had taken, but changed, the way everything comes back from a long absence.",
  ];
  const fakeBody = (i, n = 3) => p(...Array.from({ length: n }, (_, k) => bodyPool[(i + k) % bodyPool.length]));

  function gen(category, titles, opts = {}) {
    titles.forEach((title, i) => {
      const status = opts.draftEvery && (i + 1) % opts.draftEvery === 0 ? "draft" : "published";
      const len = 2 + ((i + title.length) % 4); // 2..5 paragraphs
      add({
        title,
        slug: slugify(title) + (opts.suffix ? `-${opts.suffix}` : ""),
        category,
        body_font: opts.font ?? "Crimson Text",
        tags: opts.tags ?? [],
        status,
        series: opts.series,
        series_part: opts.series ? (opts.partStart ?? 1) + i : null,
        excerpt: opts.excerpts?.[i] ?? title + ".",
        content: fakeBody(i, len),
      });
    });
  }

  gen("poetry", [
    "Aubade for the Unmade Bed", "Field Notes on Leaving", "A Small Liturgy for Tuesdays",
    "The Weather Inside the House", "Inventory of a Quiet Year", "What the Hallway Knew",
    "Letter to the Version of You That Stayed", "Three Ways to Say Almost", "Nocturne, with Kettle",
    "The Arithmetic of Distance", "Hymn for the Ordinary Hour", "Still Life with Unsent Reply",
  ], { font: "EB Garamond", tags: ["Poetry"], draftEvery: 6 });

  gen("short-stories", [
    "The Lighthouse Keeper's Daughter", "Borrowed Time, Returned Late", "An Inventory of Small Kindnesses",
    "The Last Good Argument", "What the River Carried", "A Map of Wrong Turns",
    "The Woman Who Collected Endings", "Six Small Hours, Reprised", "The Quiet Car",
  ], { tags: ["Short Story"], draftEvery: 5 });

  gen("diary-entries", [
    "Wednesday, the Light Came Back", "A Note Before the Trip", "On Finishing Things",
    "The Year of Saying Less", "Rain, and a Decision", "What I Meant to Tell You",
    "Sunday Inventory", "The Ordinary Miracle of Coffee", "Late Entry, No Excuse",
    "A Quiet Win Worth Recording",
  ], { tags: ["Diary"], draftEvery: 7 });

  gen("book-concepts", [
    "The Cartographer of Forgotten Rooms", "A Library That Reads Its Readers",
    "The Town That Trades in Apologies", "Premise: The Clock That Owes a Debt",
    "The Museum of Almost",
  ], { font: "Lora", tags: ["Concept"], draftEvery: 3 });

  // Fan fiction across the other four series (a few parts each) + standalone
  gen("fan-fiction", ["Tides That Remember — Part 1", "Tides That Remember — Part 2", "Tides That Remember — Part 3"],
    { series: "tides-that-remember", partStart: 1, tags: ["Fan Fiction", "Series"], suffix: "ff" });
  gen("fan-fiction", ["Embers in the Ash — Part 1", "Embers in the Ash — Part 2", "Embers in the Ash — Part 3", "Embers in the Ash — Part 4"],
    { series: "embers-in-the-ash", partStart: 1, tags: ["Fan Fiction", "Series", "Hurt/Comfort"], suffix: "ff" });
  gen("fan-fiction", ["The Year of Soft Treaties — Part 1", "The Year of Soft Treaties — Part 2", "The Year of Soft Treaties — Part 3"],
    { series: "the-year-of-soft-treaties", partStart: 1, tags: ["Fan Fiction", "Series", "Slow Burn"], suffix: "ff", draftEvery: 3 });
  gen("fan-fiction", ["What the Quiet Folk Kept — Part 1", "What the Quiet Folk Kept — Part 2", "What the Quiet Folk Kept — Part 3"],
    { series: "what-the-quiet-folk-kept", partStart: 1, tags: ["Fan Fiction", "Series", "Found Family"], suffix: "ff" });
  gen("fan-fiction", [
    "An Unscheduled Truce", "The Long Way Through the Pass", "Correspondence, Continued",
    "A Kindness Out of Season", "The Reckoning We Postponed",
  ], { tags: ["Fan Fiction", "Canon Divergence"], suffix: "solo", draftEvery: 5 });

  // de-dupe by slug (later wins) then upsert
  const bySlug = new Map(posts.map((x) => [x.slug, x]));
  const rows = [...bySlug.values()];
  const { error } = await db.from("posts").upsert(rows, { onConflict: "slug" });
  if (error) {
    console.error("✗ posts upsert failed:", error.message);
    process.exit(1);
  }
  console.log(`✓ posts: ${rows.length} (${rows.filter((r) => r.status === "published").length} published, ${rows.filter((r) => r.status === "draft").length} drafts)`);
  console.log("✨ Seed complete.");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
