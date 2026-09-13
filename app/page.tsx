import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Directions } from "@/components/sections/Directions";
import { Rules } from "@/components/sections/Rules";
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
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="flex-1">
        <Hero />
        <Directions />
        <Rules />
      </main>
      <Footer />
    </>
  );
}
