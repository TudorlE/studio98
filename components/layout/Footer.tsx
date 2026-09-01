import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { site } from "@/lib/site";

const columns = [
  {
    title: "Studios",
    links: [
      { label: "Studio 01", href: "#studio-01" },
      { label: "Studio 02", href: "#studio-02" },
    ],
  },
  {
    title: "Navigation",
    links: [
      { label: "About", href: "#about" },
      { label: "Booking", href: "#booking" },
      { label: "Contact", href: "#contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms & Conditions", href: "/legal/terms" },
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Cancellation Policy", href: "/legal/cancellation" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper py-16 sm:py-20">
      <Container>
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="font-serif text-2xl tracking-tight">{site.name}</p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">
              {site.tagline}. Two studios, booked by the hour.
            </p>
          </div>

          {columns.map((col) => (
            <nav key={col.title} className="lg:col-span-2">
              <p className="eyebrow">{col.title}</p>
              <ul className="mt-4 space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-ink-soft transition-colors hover:text-ink">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="lg:col-span-2">
            <p className="eyebrow">Contact</p>
            <ul className="mt-4 space-y-2 text-sm text-ink-soft">
              <li>
                <a href={site.contact.phoneHref} className="hover:text-ink">
                  {site.contact.phone}
                </a>
              </li>
              <li>
                <a href={site.contact.emailHref} className="hover:text-ink">
                  {site.contact.email}
                </a>
              </li>
              <li>
                {site.contact.address.line1}, {site.contact.address.line2}
              </li>
            </ul>
            <p className="eyebrow mt-6">Social</p>
            <ul className="mt-4 flex gap-4 text-sm text-ink-soft">
              <li>
                <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
                  Instagram
                </a>
              </li>
              <li>
                <a href={site.social.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
                  TikTok
                </a>
              </li>
              <li>
                <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
                  Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-line pt-8 text-[0.7rem] uppercase tracking-[0.18em] text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 {site.name}</span>
          <span>Placeholder content — not for production use</span>
        </div>
      </Container>
    </footer>
  );
}
