import Link from "next/link";
import type { PostView } from "@/lib/types";
import { Reveal } from "@/components/ui/motion";

/** Block 1 — series context strip (ported from blocks.jsx). */
export function SeriesContext({
  series,
  parts,
  currentSlug,
}: {
  series: { title: string };
  parts: PostView[];
  currentSlug: string;
}) {
  return (
    <section className="block-pad texture border-b border-line-soft bg-block">
      <Reveal className="block-inner">
        <p className="kicker">Part of a Series</p>
        <h2 className="my-4 mb-[22px] font-display text-[clamp(28px,4vw,34px)] font-medium leading-[1.15] tracking-[-0.01em] text-ink">
          {series.title}
        </h2>
        <p className="meta m-0 leading-[1.9]">
          <span className="text-ink-muted">Featuring {parts.length} interconnected stories:&nbsp;&nbsp;</span>
          {parts.map((p, i) => {
            const active = p.slug === currentSlug;
            return (
              <span key={p.slug}>
                <Link
                  href={`/blog/${p.slug}`}
                  className={`border-b font-meta text-[13px] no-underline ${
                    active ? "border-ink font-semibold text-ink" : "border-transparent font-medium text-taupe"
                  }`}
                >
                  Part {p.series_part}
                  {active ? " — current" : ""}
                </Link>
                {i < parts.length - 1 ? <span className="mx-1 text-beige"> · </span> : null}
              </span>
            );
          })}
        </p>
      </Reveal>
    </section>
  );
}
