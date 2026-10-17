import Link from "next/link";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { site } from "@/lib/site";

export function Footer({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const legal = (["terms", "privacy", "cancellation"] as const).map((doc) => ({
    label: t.legalLinks[doc],
    href: localePath(locale, `/legal/${doc}`),
  }));

  return (
    <footer className="border-t border-line bg-paper py-16 sm:py-20">
      <Container>
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <Link href={localePath(locale)}>
            <Logo className="h-11 sm:h-12" />
          </Link>

          <div className="text-sm text-ink-soft">
            <a href={site.contact.emailHref} className="block hover:text-ink">
              {site.contact.email}
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-8 text-[0.7rem] uppercase tracking-[0.18em] text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 {site.name}</span>
          <div className="flex gap-6">
            {legal.map((l) => (
              <Link key={l.label} href={l.href} className="hover:text-ink">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
