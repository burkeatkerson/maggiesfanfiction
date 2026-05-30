import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminRail } from "@/components/admin/AdminRail";

export const metadata: Metadata = {
  title: "Writing Desk",
  robots: { index: false, follow: false },
};

export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[280px_1fr]">
      <AdminRail />
      <main className="min-w-0 bg-canvas px-6 py-9 md:p-14">
        <div className="mx-auto max-w-[760px]">{children}</div>
      </main>
    </div>
  );
}
