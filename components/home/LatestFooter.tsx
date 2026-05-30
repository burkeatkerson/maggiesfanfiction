import Link from "next/link";
import type { Post } from "@/lib/types";
import { categoryName } from "@/lib/mock";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

function fmtDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

/** Block 3 — latest pieces, signature, sign-in, theme toggle, footer. */
export function LatestFooter({
  latest,
  authorName,
}: {
  latest: Post[];
  authorName: string;
}) {
  return (
    <section className="block texture border-t border-line-soft bg-block">
      <div className="block-wide">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-[1.4fr_1fr]">
          {/* latest list */}
          <div>
            <p className="kicker mb-[22px]">Lately</p>
            <ul className="m-0 list-none p-0">
              {latest.map((p) => (
                <li key={p.id} className="border-t border-line">
                  <Link
                    href={`/blog/${p.slug}`}
                    className="grid grid-cols-[1fr_auto] items-baseline gap-5 py-[18px] no-underline"
                  >
                    <span className="font-display text-[19px] font-medium leading-[1.3] text-ink">
                      {p.title}
                    </span>
                    <span className="meta whitespace-nowrap text-right text-[12px]">
                      <span className="tracking-[0.04em] text-taupe">{categoryName(p.category_id)}</span>
                      <span className="mx-[7px] text-line">·</span>
                      <span>{fmtDate(p.published_at)}</span>
                    </span>
                  </Link>
                </li>
              ))}
              <li className="border-t border-line" />
            </ul>
          </div>

          {/* signature */}
          <aside>
            <p className="kicker mb-5">The Writer</p>
            <p className="mb-[22px] font-display text-[22px] font-normal italic leading-[1.4] text-ink">
              &ldquo;I write the parts the canon left out.&rdquo;
            </p>
            <p className="mb-6 font-body text-[16px] leading-[1.7] text-ink-soft">
              {authorName} keeps this journal of fan fiction, poetry, and other small experiments — read by a
              quiet, devoted few.
            </p>
          </aside>
        </div>

        <div className="mt-16 flex flex-col items-center gap-9">
          <Link
            href="/admin/login"
            className="rounded border border-line px-[30px] py-3 font-meta text-[13px] font-semibold tracking-[0.04em] text-ink no-underline transition-colors hover:border-ink"
          >
            Author sign in
          </Link>
          <ThemeToggle />
        </div>

        <div className="mt-10 flex flex-wrap justify-between gap-3 border-t border-line pt-[26px]">
          <span className="meta text-[12px]" style={{ color: "var(--ink-faint)" }}>
            Written and kept by {authorName}.
          </span>
          <span className="meta text-[12px]" style={{ color: "var(--ink-faint)" }}>
            © 2024 — read slowly.
          </span>
        </div>
      </div>
    </section>
  );
}
