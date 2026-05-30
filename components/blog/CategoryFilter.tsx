import Link from "next/link";
import type { Category } from "@/lib/types";

/** Server-rendered category filter — plain links (no client state). */
export function CategoryFilter({
  categories,
  active,
}: {
  categories: Category[];
  active?: string;
}) {
  const pill = (label: string, slug: string | null, isActive: boolean) => (
    <Link
      key={slug ?? "all"}
      href={slug ? `/blog?category=${slug}` : "/blog"}
      className={`rounded border px-3.5 py-2 font-meta text-[12.5px] font-semibold tracking-[0.02em] no-underline transition-colors ${
        isActive ? "border-ink bg-block text-ink" : "border-line text-ink-muted hover:border-ink hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="flex flex-wrap gap-2.5">
      {pill("All", null, !active)}
      {categories.map((c) => pill(c.name, c.slug, active === c.slug))}
    </div>
  );
}
