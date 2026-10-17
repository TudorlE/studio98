import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Directions } from "@/components/sections/Directions";
import { site } from "@/lib/site";
import { getDictionary, type Locale } from "@/lib/i18n";

const jsonLd = (locale: Locale) => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: site.name,
  description: getDictionary(locale).meta.description,
  url: site.domain,
  email: site.contact.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.contact.address.line1,
    addressLocality: site.contact.address.line2,
    addressCountry: site.contact.address.country,
  },
});

export default async function Home({ params }: PageProps<"/[lang]">) {
  const locale = (await params).lang as Locale;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(locale)) }}
      />
      <Header />
      <main className="flex-1">
        <Hero />
        <Directions locale={locale} />
      </main>
      <Footer locale={locale} />
    </>
  );
}
