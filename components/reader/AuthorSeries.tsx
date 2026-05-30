import Link from "next/link";
import type { PostView } from "@/lib/types";

function SeriesNavSidebar({ parts, currentSlug }: { parts: PostView[]; currentSlug: string }) {
  return (
    <nav aria-label="Series navigation">
      <p className="kicker mb-[18px]">The Series</p>
      <ol className="m-0 flex list-none flex-col p-0">
        {parts.map((p) => {
          const active = p.slug === currentSlug;
          return (
            <li key={p.slug} className="border-t border-line">
              <Link
                href={`/blog/${p.slug}`}
                aria-current={active ? "true" : undefined}
                className="relative flex flex-col gap-0.5 py-3.5 pl-3.5 no-underline"
              >
                {active ? <span className="absolute bottom-3.5 left-0 top-3.5 w-0.5 bg-taupe" /> : null}
                <span
                  className={`text-[10.5px] uppercase tracking-[0.16em] ${active ? "text-taupe" : "text-ink-faint"}`}
                >
                  Part {p.series_part}
                  {active ? " · current" : ""}
                </span>
                <span
                  className={`font-display text-[16px] ${active ? "font-semibold text-ink" : "font-normal text-ink-muted"}`}
                >
                  {p.title}
                </span>
              </Link>
            </li>
          );
        })}
        <li className="border-t border-line" />
      </ol>
    </nav>
  );
}

function AboutAuthor({ name, bio, storyCount }: { name: string; bio: string; storyCount: number }) {
  return (
    <div>
      <h3 className="m-0 mb-[22px] font-display text-[22px] font-medium tracking-[-0.01em] text-ink">
        About the Author
      </h3>
      <div className="flex flex-wrap items-start gap-7">
        <div
          className="texture grid h-40 w-[200px] shrink-0 place-items-center border border-line"
          style={{ background: "linear-gradient(135deg, #e4d8cb 0%, var(--beige) 60%, #c7b6a6 100%)" }}
        >
          <span className="font-meta text-[10.5px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#8a7763" }}>
            {name}
          </span>
        </div>
        <div className="min-w-[260px] flex-1 basis-[280px]">
          <p className="mb-[22px] font-body text-[16px] leading-[1.72]" style={{ color: "var(--ink-muted)" }}>
            {bio}
          </p>
          <span className="meta text-[13px]">
            <strong className="font-semibold text-ink-soft">{storyCount}</strong> published stories
          </span>
        </div>
      </div>
    </div>
  );
}

/** Block 3 — series nav + about author (ported from blocks.jsx). */
export function AuthorSeries({
  series,
  parts,
  currentSlug,
  authorName,
  authorBio,
  storyCount,
}: {
  series: { title: string } | null;
  parts: PostView[];
  currentSlug: string;
  authorName: string;
  authorBio: string;
  storyCount: number;
}) {
  return (
    <section className="block texture border-t border-line-soft bg-block">
      <div className="block-wide grid grid-cols-1 gap-12 md:grid-cols-[260px_1fr]">
        {series && parts.length ? (
          <SeriesNavSidebar parts={parts} currentSlug={currentSlug} />
        ) : (
          <div />
        )}
        <AboutAuthor name={authorName} bio={authorBio} storyCount={storyCount} />
      </div>
    </section>
  );
}
