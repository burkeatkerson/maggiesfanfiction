import Link from "next/link";
import type { SeriesView } from "@/lib/data";
import { Reveal, RevealText, Stagger, StaggerItem } from "@/components/ui/motion";

type Row = SeriesView;

function SeriesRow({ s }: { s: Row }) {
  const clickable = !!s.href;
  const inner = (
    <>
      <span className="pt-2 font-meta text-[11px] font-semibold uppercase tracking-[0.18em] text-taupe">
        {s.fandom}
      </span>
      <span className="flex min-w-0 flex-col">
        <span
          className={`w-fit border-b pb-0.5 font-display text-[clamp(23px,2.8vw,30px)] font-medium leading-[1.18] tracking-[-0.01em] text-ink ${
            clickable ? "border-transparent group-hover:border-taupe" : "border-transparent"
          }`}
        >
          {s.title}
        </span>
        <span className="mt-3 max-w-[540px] font-body text-[16.5px] leading-[1.6] text-ink-soft">
          {s.note}
        </span>
      </span>
      <span className="meta whitespace-nowrap pt-2 text-right text-[12.5px]">
        {s.parts} parts
        <span className="mt-1.5 block text-[11.5px] uppercase tracking-[0.06em]" style={{ color: "var(--ink-faint)" }}>
          {s.status}
        </span>
      </span>
    </>
  );

  const cls =
    "group grid grid-cols-[180px_1fr_auto] items-start gap-10 border-t border-line py-[34px] no-underline transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]";

  return clickable ? (
    <Link href={s.href!} className={`${cls} cursor-pointer hover:pl-4`}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

/** Block 2 — featured series (ported from homepage.jsx). */
export function FeaturedSeries({ series }: { series: Row[] }) {
  return (
    <section className="block bg-canvas">
      <div className="block-wide">
        <div className="flex flex-wrap items-baseline justify-between gap-6">
          <div>
            <Reveal>
              <p className="kicker">Featured Series</p>
            </Reveal>
            <RevealText
              as="h2"
              text="Stories set in worlds you already love"
              delay={0.08}
              className="mt-3.5 max-w-[560px] font-display text-[clamp(28px,3.6vw,38px)] font-medium leading-[1.16] tracking-[-0.015em] text-ink"
            />
          </div>
          <Reveal>
            <span className="meta text-[13px]">{series.length} universes</span>
          </Reveal>
        </div>

        <Stagger className="mt-11">
          {series.map((s, i) => (
            <StaggerItem key={s.id} index={i}>
              <SeriesRow s={s} />
            </StaggerItem>
          ))}
          <div className="border-t border-line" />
        </Stagger>
      </div>
    </section>
  );
}
