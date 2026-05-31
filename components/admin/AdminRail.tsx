"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GhostButton, SolidButton } from "@/components/ui/form";
import { ThemeToggleLink } from "@/components/theme/ThemeToggle";
import { api } from "./api";

function NavItem({ href, kicker, label, active }: { href: string; kicker: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className="relative flex flex-col gap-[3px] px-1 py-2 no-underline lg:py-4 lg:pl-4"
    >
      {active ? (
        // Accent: an underline beneath the tab on small screens, a left bar in the sidebar.
        <span className="absolute bottom-0 left-1 right-1 h-0.5 bg-taupe lg:bottom-4 lg:left-0 lg:right-auto lg:top-4 lg:h-auto lg:w-0.5" />
      ) : null}
      <span className={`hidden font-meta text-[10px] uppercase tracking-[0.16em] lg:block ${active ? "text-taupe" : "text-ink-faint"}`}>
        {kicker}
      </span>
      <span className={`font-display text-[17px] leading-none transition-colors lg:text-[19px] ${active ? "text-ink" : "text-ink-muted hover:text-ink"}`}>
        {label}
      </span>
    </Link>
  );
}

/** View site / theme / sign out — inline on small screens, stacked in the sidebar footer. */
function UtilityLinks({ onSignOut, stacked }: { onSignOut: () => void; stacked?: boolean }) {
  const base = "font-meta text-ink-muted no-underline transition-colors hover:text-taupe";
  const size = stacked ? "py-1.5 text-[12.5px]" : "text-[11.5px]";
  return (
    <>
      <Link href="/" className={`${base} ${size}`}>
        View site →
      </Link>
      <ThemeToggleLink className={`${base} text-left ${size}`} />
      <button type="button" onClick={onSignOut} className={`${base} text-left ${size}`}>
        Sign out
      </button>
    </>
  );
}

/** Admin rail — a compact top bar on phone/tablet-portrait, a left sidebar on desktop. */
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
    <aside className="texture flex flex-col border-b border-line-soft bg-block px-5 py-4 lg:sticky lg:top-0 lg:h-screen lg:self-start lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-9 lg:py-12">
      {/* Brand — paired with the utility cluster on small screens */}
      <div className="flex items-start justify-between gap-4 lg:block">
        <div>
          <p className="kicker text-taupe">Writing Desk</p>
          <p className="mt-1 font-display text-[22px] font-medium tracking-[-0.01em] text-ink lg:mt-2.5 lg:text-[26px]">Maggie</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 lg:hidden">
          <UtilityLinks onSignOut={signOut} />
        </div>
      </div>

      {/* Primary action — full-width button in the sidebar only */}
      <div className="hidden lg:mt-8 lg:block">
        <Link href="/admin/create">
          <SolidButton className="w-full">+ Write Something New</SolidButton>
        </Link>
      </div>

      {/* Nav — horizontal tabs (with a compact "write" action) on small screens, vertical list on desktop */}
      <nav className="mt-3 flex items-center gap-5 border-t border-line-soft pt-1 lg:mt-9 lg:flex-col lg:items-stretch lg:gap-0 lg:border-t-0 lg:pt-0">
        <NavItem href="/admin" kicker="Manage" label="Posts" active={onPosts} />
        <NavItem href="/admin/site" kicker="Manage" label="Site Details" active={onSite} />
        <Link href="/admin/create" className="ml-auto lg:hidden">
          <GhostButton small>+ Write new</GhostButton>
        </Link>
      </nav>

      {/* Utility links — sidebar footer (small-screen copy lives next to the brand above) */}
      <div className="hidden pt-8 lg:mt-auto lg:flex lg:flex-col lg:gap-1">
        <UtilityLinks onSignOut={signOut} stacked />
      </div>
    </aside>
  );
}
