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
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
      <AdminRail />
      <main className="min-w-0 bg-canvas px-5 py-7 sm:px-7 lg:p-14">
        <div className="mx-auto max-w-[760px]">{children}</div>
      </main>
    </div>
  );
}
