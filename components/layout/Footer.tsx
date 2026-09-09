import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { AnchorLink } from "@/components/ui/AnchorLink";
import { Logo } from "@/components/ui/Logo";
import { site } from "@/lib/site";

const nav = [
  { label: "Studio 01", href: "#studio-01" },
  { label: "Studio 02", href: "#studio-02" },
];

const legal = [
  { label: "Terms", href: "/legal/terms" },
  { label: "Privacy", href: "/legal/privacy" },
  { label: "Cancellation", href: "/legal/cancellation" },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper py-16 sm:py-20">
      <Container>
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <Logo className="h-11 sm:h-12" />

          <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-ink-soft">
            {nav.map((l) => (
              <AnchorLink key={l.label} href={l.href} className="transition-colors hover:text-ink">
                {l.label}
              </AnchorLink>
            ))}
          </nav>

          <div className="text-sm text-ink-soft">
            <a href={site.contact.emailHref} className="block hover:text-ink">
              {site.contact.email}
            </a>
            <a href={site.contact.phoneHref} className="block hover:text-ink">
              {site.contact.phone}
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
