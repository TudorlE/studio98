import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Footer } from "@/components/layout/Footer";
import { Logo } from "@/components/ui/Logo";
import { site } from "@/lib/site";
import { fmt, getDictionary, localePath, locales, type Locale } from "@/lib/i18n";

const DOC_KEYS = ["terms", "privacy", "cancellation", "rules"] as const;
type DocKey = (typeof DOC_KEYS)[number];
const isDoc = (doc: string): doc is DocKey => DOC_KEYS.includes(doc as DocKey);

export function generateStaticParams() {
  return locales.flatMap((lang) => DOC_KEYS.map((doc) => ({ lang, doc })));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/legal/[doc]">): Promise<Metadata> {
  const { lang, doc } = await params;
  const t = getDictionary(lang as Locale).legal;
  return {
    title: isDoc(doc) ? t.docs[doc].title : t.fallbackTitle,
    robots: { index: false },
    alternates: {
      languages: Object.fromEntries(locales.map((l) => [l, localePath(l, `/legal/${doc}`)])),
    },
  };
}

export default async function LegalPage({ params }: PageProps<"/[lang]/legal/[doc]">) {
  const { lang, doc } = await params;
  if (!isDoc(doc)) notFound();
  const locale = lang as Locale;
  const t = getDictionary(locale);
  const entry = t.legal.docs[doc];

  return (
    <>
      <header className="border-b border-line">
        <Container className="flex h-16 items-center sm:h-20">
          <Link href={localePath(locale)} aria-label={site.name}>
            <Logo />
          </Link>
        </Container>
      </header>
      <main className="flex-1 py-24 sm:py-32">
        <Container className="max-w-2xl!">
          <p className="eyebrow">{t.legal.eyebrow}</p>
          <h1 className="headline mt-6 text-5xl leading-none tracking-tight sm:text-6xl">
            {entry.title}
          </h1>
          {doc === "rules" ? (
            <ol className="mt-10 space-y-7 leading-relaxed text-ink-soft">
              {t.rules.map((rule, i) => (
                <li key={rule.title} className="flex gap-4">
                  <span className="w-6 shrink-0 font-serif text-ink">{i + 1}.</span>
                  <div>
                    <p className="font-medium text-ink">{rule.title}</p>
                    <p className="mt-1">{rule.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="mt-10 space-y-5 leading-relaxed text-ink-soft">
              {entry.body.map((p) => (
                <p key={p}>{fmt(p, { email: site.contact.email })}</p>
              ))}
            </div>
          )}
          <Link
            href={localePath(locale)}
            className="mt-12 inline-flex h-12 items-center rounded-full border border-ink/25 px-8 text-[0.7rem] font-medium uppercase tracking-[0.18em] transition-colors hover:bg-ink hover:text-paper"
          >
            {t.legal.backHome}
          </Link>
        </Container>
      </main>
      <Footer locale={locale} />
    </>
  );
}
