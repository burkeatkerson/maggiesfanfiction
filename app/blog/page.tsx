import type { Metadata } from "next";
import Link from "next/link";
import { PostCard } from "@/components/blog/PostCard";
import { CategoryFilter } from "@/components/blog/CategoryFilter";
import { Reveal } from "@/components/ui/Reveal";
import { getCategoriesWithCounts, listPublishedPosts, getSiteSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "All Writing",
  description: "Every published piece — poetry, short stories, fan fiction, and diary entries.",
};

export default async function BlogIndex({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [site, categories, all] = await Promise.all([
    getSiteSettings(),
    getCategoriesWithCounts(),
    listPublishedPosts(),
  ]);
  const activeCat = categories.find((c) => c.slug === category);
  const posts = all.filter((p) => (activeCat ? p.category_id === activeCat.id : true));

  return (
    <main>
      <section className="block texture border-b border-line-soft bg-block">
        <div className="block-wide">
          <Link href="/" className="meta no-underline hover:text-taupe">
            ← {site?.site_title ?? "Maggie's Fan Fiction"}
          </Link>
          <p className="kicker mt-8">All Writing</p>
          <h1 className="mt-3.5 max-w-[640px] font-display text-[clamp(30px,4.4vw,46px)] font-medium leading-[1.12] tracking-[-0.015em] text-ink text-balance">
            {activeCat ? activeCat.name : "Everything, collected"}
          </h1>
          <div className="mt-9">
            <CategoryFilter categories={categories} active={category} />
          </div>
        </div>
      </section>

      <section className="block bg-canvas">
        <div className="block-wide">
          <Reveal>
            <div>
              {posts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
              <div className="border-t border-line" />
              {posts.length === 0 ? (
                <p className="meta py-10 text-center">No pieces in this form yet.</p>
              ) : null}
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
