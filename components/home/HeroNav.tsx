import Link from "next/link";
import type { CategoryCount } from "@/lib/data";

/** Block 1 — the hero *is* the navigation (ported from homepage.jsx). */
export function HeroNav({
  forms,
  intro,
  statement,
}: {
  forms: CategoryCount[];
  intro: string;
  statement: string;
}) {
  return (
    <section className="block texture border-b border-line-soft bg-block">
      <div className="block-wide">
        <p className="kicker">{intro}</p>
        <p
          className="mt-[18px] max-w-[760px] font-display text-[clamp(24px,3.4vw,33px)] font-normal leading-[1.32] tracking-[-0.01em] text-ink text-balance"
        >
          {statement}
        </p>

        <div className="mt-14 flex items-baseline gap-3.5">
          <span className="kicker">Explore by form</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <nav aria-label="Writing forms" className="mt-2">
          {forms.map((f, i) => (
            <Link
              key={f.id}
              href={`/blog?category=${f.slug}`}
              className="group grid grid-cols-[1fr_auto] items-center gap-6 border-t border-line py-[26px] no-underline transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:pl-[18px]"
            >
              <span className="flex min-w-0 items-baseline gap-[18px]">
                <span className="w-[26px] shrink-0 font-meta text-[12px] text-taupe">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-[clamp(30px,5vw,52px)] font-medium leading-[1.05] tracking-[-0.02em] text-ink transition-colors group-hover:text-taupe">
                  {f.name}
                </span>
                <span className="meta hidden whitespace-nowrap text-[13px] opacity-0 transition-opacity group-hover:opacity-100 md:inline">
                  {f.note}
                </span>
              </span>
              <span className="meta whitespace-nowrap text-[13px]">{f.count} pieces</span>
            </Link>
          ))}
          <div className="border-t border-line" />
        </nav>
      </div>
    </section>
  );
}
