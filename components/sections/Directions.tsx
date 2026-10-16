import { Container } from "@/components/ui/Container";
import { site } from "@/lib/site";
import { getDictionary, type Locale } from "@/lib/i18n";

export function Directions({ locale }: { locale: Locale }) {
  const { contact } = site;
  const t = getDictionary(locale).directions;

  return (
    <section id="directions" className="border-t border-line bg-paper py-20 sm:py-28">
      <Container>
        <p className="eyebrow">{t.title}</p>

        <div className="mt-8 flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
          <dl className="flex flex-wrap gap-x-12 gap-y-4 text-sm">
            <div>
              <dt className="eyebrow">{t.address}</dt>
              <dd className="mt-1 text-ink-soft">
                {contact.address.line1}, {contact.address.line2}
              </dd>
            </div>
            <div>
              <dt className="eyebrow">{t.phone}</dt>
              <dd className="mt-1">
                <a href={contact.phoneHref} className="text-ink-soft hover:text-ink">
                  {contact.phone}
                </a>
              </dd>
            </div>
          </dl>

          <a
            href={contact.mapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 shrink-0 items-center rounded-full border border-ink/25 px-8 text-[0.7rem] font-medium uppercase tracking-[0.18em] transition-colors hover:bg-ink hover:text-paper"
          >
            {t.route}
          </a>
        </div>

        <div className="relative mx-auto mt-10 aspect-[4/3] w-full max-w-[58rem] overflow-hidden border border-line bg-paper-deep sm:aspect-[58/21]">
          <iframe
            title={t.mapTitle}
            src={contact.mapsEmbedSrc}
            className="absolute inset-0 h-full w-full grayscale-[0.25]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </Container>
    </section>
  );
}
