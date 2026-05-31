import { HeroNav } from "@/components/home/HeroNav";
import { FeaturedSeries } from "@/components/home/FeaturedSeries";
import { LatestFooter } from "@/components/home/LatestFooter";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getSiteSettings,
  getAuthor,
  getCategoriesWithCounts,
  getSeriesWithParts,
  getLatest,
} from "@/lib/data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function Home() {
  const [site, author, forms, series, latest] = await Promise.all([
    getSiteSettings(),
    getAuthor(),
    getCategoriesWithCounts(),
    getSeriesWithParts(),
    getLatest(5),
  ]);

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: site?.site_title ?? "Maggie's Fan Fiction",
          url: SITE_URL,
          description: site?.default_seo_description,
          author: { "@type": "Person", name: author.name },
        }}
      />
      <HeroNav forms={forms} intro={site?.intro ?? ""} statement={site?.statement ?? ""} />
      <FeaturedSeries series={series} />
      <LatestFooter latest={latest} authorName={author.name} />

    </main>
  );
}
