import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import "./globals.css";
import { ThemeProvider, themeNoFlashScript } from "@/components/theme/ThemeProvider";
import { getSiteSettings } from "@/lib/data";
import { headlineCss } from "@/lib/fonts";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const FALLBACK_TITLE = "Maggie's Fan Fiction";

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

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  const title = site?.site_title || FALLBACK_TITLE;
  const description =
    site?.default_seo_description ||
    "A writing journal — poetry, short stories, fan fiction, and the quiet pages in between.";
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s — ${title}` },
    description,
    openGraph: { type: "website", siteName: title, title, description, url: SITE_URL },
    twitter: { card: "summary_large_image" },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const site = await getSiteSettings();
  // Apply the saved site-wide headline font (inline on <html> so it wins over
  // the stylesheet default and survives theme switches).
  const htmlStyle = {
    "--ff-display": headlineCss(site?.headline_font ?? "EB Garamond"),
  } as CSSProperties;

  return (
    <html lang="en" style={htmlStyle} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={GOOGLE_FONTS} />
        <script dangerouslySetInnerHTML={{ __html: themeNoFlashScript }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
