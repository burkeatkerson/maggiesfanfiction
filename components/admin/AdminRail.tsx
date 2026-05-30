"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SolidButton } from "@/components/ui/form";
import { ThemeToggleLink } from "@/components/theme/ThemeToggle";
import { api } from "./api";

function NavItem({ href, kicker, label, active }: { href: string; kicker: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className="relative flex flex-col gap-[3px] py-4 pl-4 no-underline"
    >
      {active ? <span className="absolute bottom-4 left-0 top-4 w-0.5 bg-taupe" /> : null}
      <span className={`font-meta text-[10px] uppercase tracking-[0.16em] ${active ? "text-taupe" : "text-ink-faint"}`}>
        {kicker}
      </span>
      <span className={`font-display text-[19px] transition-colors ${active ? "text-ink" : "text-ink-muted hover:text-ink"}`}>
        {label}
      </span>
    </Link>
  );
}

/** Admin left rail (ported from admin-shell.jsx). */
export function AdminRail() {
  const pathname = usePathname();
  const router = useRouter();
  const onPosts = pathname === "/admin" || pathname.startsWith("/admin/create") || pathname.startsWith("/admin/edit");
  const onSite = pathname.startsWith("/admin/site");

  async function signOut() {
    try {
      await api.auth.logout();
    } catch {
      /* ignore — clear client state regardless */
    }
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="texture flex flex-col self-start overflow-y-auto border-b border-line-soft bg-block px-9 py-12 md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r">
      <div>
        <p className="kicker text-taupe">Writing Desk</p>
        <p className="mt-2.5 font-display text-[26px] font-medium tracking-[-0.01em] text-ink">Maggie</p>
      </div>

      <div className="mt-8">
        <Link href="/admin/create">
          <SolidButton className="w-full">+ Write Something New</SolidButton>
        </Link>
      </div>

      <nav className="mt-9 flex flex-col">
        <NavItem href="/admin" kicker="Manage" label="Posts" active={onPosts} />
        <NavItem href="/admin/site" kicker="Manage" label="Site Details" active={onSite} />
      </nav>

      <div className="mt-8 flex flex-col gap-1 pt-8 md:mt-auto">
        <Link href="/" className="py-1.5 font-meta text-[12.5px] text-ink-muted no-underline transition-colors hover:text-taupe">
          View site →
        </Link>
        <ThemeToggleLink className="py-1.5 text-left font-meta text-[12.5px] text-ink-muted transition-colors hover:text-taupe" />
        <button
          type="button"
          onClick={signOut}
          className="py-1.5 text-left font-meta text-[12.5px] text-ink-muted transition-colors hover:text-taupe"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
