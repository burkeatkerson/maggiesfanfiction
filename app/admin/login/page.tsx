import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { getSiteSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Author sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const site = await getSiteSettings();
  return <LoginForm quote={site?.quote ?? ""} />;
}
