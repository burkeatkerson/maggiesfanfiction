import type { PostView } from "@/lib/types";
import { Avatar, ImagePlaceholder, Tag } from "@/components/ui/primitives";
import { bodyCss } from "@/lib/fonts";
import { Reveal } from "@/components/ui/motion";

function fmtDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

/** Block 2 — the article (ported from blocks.jsx ArticleBlock). */
export function Article({
  post,
  authorName,
  dropcap = true,
}: {
  post: PostView;
  authorName: string;
  dropcap?: boolean;
}) {
  return (
    <section className="block bg-canvas">
      <Reveal as="article" className="block-inner">
        <header>
          <h1 className="m-0 mb-[26px] font-display text-[clamp(34px,5.2vw,44px)] font-medium leading-[1.16] tracking-[-0.015em] text-ink text-balance">
            {post.headline || post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3">
            <Avatar size={34} label={authorName} />
            <span className="meta font-medium text-ink-soft">By {authorName}</span>
            <span className="text-line">·</span>
            <span className="meta">{fmtDate(post.published_at)}</span>
            <span className="text-line">·</span>
            <span className="meta">{post.reading_time} min read</span>
          </div>

          {post.tags.length ? (
            <div className="mt-[22px] flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          ) : null}
        </header>

        <div className="my-[44px] mb-14">
          <ImagePlaceholder height={360} caption={post.featured_image_caption} src={post.featured_image_url} />
        </div>

        <div
          className={`prose-article max-w-none text-[19px] leading-[1.82] text-ink-soft ${dropcap ? "has-dropcap" : ""}`}
          style={{ fontFamily: bodyCss(post.body_font) }}
          dangerouslySetInnerHTML={{ __html: post.content ?? "" }}
        />

        <div className="mt-12 border-t border-line pt-[22px]">
          <span className="meta text-[12px]" style={{ color: "var(--ink-faint)" }}>
            {fmtDate(post.published_at)} · {post.reading_time} min read
          </span>
        </div>
      </Reveal>
    </section>
  );
}
