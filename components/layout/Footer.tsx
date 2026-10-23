import Link from "next/link";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { MiaLogo } from "@/components/ui/MiaLogo";
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
        {/* Both logos at the same visual width, mirrored on one axis. */}
        <div className="flex items-center justify-between gap-6">
          <Link href={localePath(locale)}>
            <Logo className="h-14 sm:h-24" />
          </Link>

          <p>
            <span className="sr-only">{t.footer.payWith} </span>
            <MiaLogo className="h-8 sm:h-14" />
          </p>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-8 text-[0.7rem] uppercase tracking-[0.18em] text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 {site.name}</span>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
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
