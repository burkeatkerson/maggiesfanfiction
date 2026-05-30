import { HeroNav } from "@/components/home/HeroNav";
import { FeaturedSeries } from "@/components/home/FeaturedSeries";
import { LatestFooter } from "@/components/home/LatestFooter";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getSiteSettings,
  getWritingForms,
  listSeriesWithParts,
  getLatest,
  getAuthor,
} from "@/lib/mock";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function Home() {
  const site = getSiteSettings();
  const author = getAuthor();
  const forms = getWritingForms();
  const series = listSeriesWithParts();
  const latest = getLatest(5);

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: site.site_title,
          url: SITE_URL,
          description: site.default_seo_description,
          author: { "@type": "Person", name: author.name },
        }}
      />
      <HeroNav forms={forms} intro={site.intro ?? ""} statement={site.statement ?? ""} />
      <Reveal>
        <FeaturedSeries series={series} />
      </Reveal>
      <Reveal>
        <LatestFooter latest={latest} authorName={author.name} />
      </Reveal>
    </main>
  );
}
