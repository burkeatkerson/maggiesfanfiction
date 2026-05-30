import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider, themeNoFlashScript } from "@/components/theme/ThemeProvider";
import { getSiteSettings } from "@/lib/mock";

const site = getSiteSettings();
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// All headline + body-picker families in one stylesheet — the per-post body
// font selector needs every family available at runtime.
const GOOGLE_FONTS =
  "https://fonts.googleapis.com/css2?" +
  "family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400" +
  "&family=Playfair+Display:wght@400;500;600" +
  "&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400" +
  "&family=Crimson+Text:ital,wght@0,400;0,600;1,400" +
  "&family=Lora:ital,wght@0,400;0,600;1,400" +
  "&family=Merriweather:wght@400;700" +
  "&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400" +
  "&family=Spectral:ital,wght@0,400;0,600;1,400" +
  "&family=Source+Serif+4:ital,wght@0,400;0,600;1,400" +
  "&family=Inter:wght@400;500;600" +
  "&family=Work+Sans:wght@400;600" +
  "&family=Special+Elite" +
  "&display=swap";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: site.site_title || "Maggie's Fan Fiction",
    template: `%s — ${site.site_title || "Maggie's Fan Fiction"}`,
  },
  description:
    site.default_seo_description ||
    "A writing journal — poetry, short stories, fan fiction, and the quiet pages in between.",
  openGraph: {
    type: "website",
    siteName: site.site_title || "Maggie's Fan Fiction",
    title: site.site_title || "Maggie's Fan Fiction",
    description: site.default_seo_description || undefined,
    url: SITE_URL,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={GOOGLE_FONTS} />
        {/* Apply the saved theme before paint to avoid a flash. */}
        <script dangerouslySetInnerHTML={{ __html: themeNoFlashScript }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
