import Link from "next/link";
import type { PostView } from "@/lib/types";

function fmtDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

/** A single story row in the /blog index. */
export function PostCard({ post }: { post: PostView }) {
  const series = post.series;
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid grid-cols-[1fr_auto] items-start gap-8 border-t border-line py-8 no-underline transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:pl-4"
    >
      <span className="flex min-w-0 flex-col">
        <span className="w-fit font-display text-[clamp(22px,2.6vw,28px)] font-medium leading-[1.2] tracking-[-0.01em] text-ink transition-colors group-hover:text-taupe">
          {post.title}
        </span>
        <span className="mt-3 max-w-[560px] font-body text-[16.5px] leading-[1.6] text-ink-soft">
          {post.excerpt}
        </span>
        <span className="meta mt-3.5 flex flex-wrap items-center gap-2.5 text-[12.5px]">
          <span className="tracking-[0.04em] text-taupe">{post.category?.name}</span>
          {series ? (
            <>
              <span className="text-line">·</span>
              <span className="italic text-ink-muted">{series.title}</span>
            </>
          ) : null}
          <span className="text-line">·</span>
          <span>{post.reading_time} min read</span>
        </span>
      </span>
      <span className="meta whitespace-nowrap pt-2 text-right text-[12px]">{fmtDate(post.published_at)}</span>
    </Link>
  );
}
