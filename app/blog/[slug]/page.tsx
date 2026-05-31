import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SeriesContext } from "@/components/reader/SeriesContext";
import { Article } from "@/components/reader/Article";
import { AuthorSeries } from "@/components/reader/AuthorSeries";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getPostBySlug,
  getPostsInSeries,
  listPublishedPosts,
  getAuthor,
  getSiteSettings,
} from "@/lib/data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Not found" };
  const description = post.seo_description || post.excerpt || undefined;
  return {
    title: post.title,
    description,
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: `${SITE_URL}/blog/${post.slug}`,
      publishedTime: post.published_at ?? undefined,
      images: post.featured_image_url ? [post.featured_image_url] : undefined,
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || post.status !== "published") notFound();

  const [site, author, parts, published] = await Promise.all([
    getSiteSettings(),
    getAuthor(),
    post.series_id ? getPostsInSeries(post.series_id) : Promise.resolve([]),
    listPublishedPosts(),
  ]);

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.headline || post.title,
          description: post.seo_description || post.excerpt,
          datePublished: post.published_at,
          dateModified: post.updated_at,
          author: { "@type": "Person", name: author.name },
          timeRequired: `PT${post.reading_time}M`,
          url: `${SITE_URL}/blog/${post.slug}`,
          mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
        }}
      />

      <div className="block-pad bg-canvas !pb-0">
        <div className="block-inner">
          <Link href="/blog" className="meta no-underline hover:text-taupe">
            ← All writing
          </Link>
        </div>
      </div>

      {post.series && parts.length ? (
        <SeriesContext series={post.series} parts={parts} currentSlug={post.slug} />
      ) : null}

      <Article post={post} authorName={author.name} />

      <AuthorSeries
        series={post.series}
        parts={parts}
        currentSlug={post.slug}
        authorName={author.name}
        authorBio={site?.bio ?? ""}
        storyCount={published.length}
      />
    </main>
  );
}
