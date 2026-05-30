import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminRail } from "@/components/admin/AdminRail";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/utils/auth";

export const metadata: Metadata = {
  title: "Writing Desk",
  robots: { index: false, follow: false },
};

export default async function PanelLayout({ children }: { children: ReactNode }) {
  // Route protection: only an authenticated author reaches the panel.
  const supabase = await createClient();
  const user = await getUser(supabase);
  if (!user) redirect("/admin/login");

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[280px_1fr]">
      <AdminRail />
      <main className="min-w-0 bg-canvas px-6 py-9 md:p-14">
        <div className="mx-auto max-w-[760px]">{children}</div>
      </main>
    </div>
  );
}
