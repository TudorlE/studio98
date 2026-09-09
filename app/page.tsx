import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollSnapEffect } from "@/components/layout/ScrollSnapEffect";
import { Hero } from "@/components/sections/Hero";
import { StudioSection } from "@/components/sections/StudioSection";
import { studios } from "@/lib/studios";
import { site } from "@/lib/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: site.name,
  description: site.description,
  url: site.domain,
  telephone: site.contact.phone,
  email: site.contact.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.contact.address.line1,
    addressLocality: site.contact.address.line2,
    addressCountry: site.contact.address.country,
  },
};

export default function Home() {
  const [studio01, studio02] = studios;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ScrollSnapEffect />
      <Header />
      <main className="flex-1">
        <Hero />
        <StudioSection studio={studio01} />
        <StudioSection studio={studio02} />
      </main>
      <div id="footer-sentinel" />
      <Footer />
    </>
  );
}
