import { Container } from "@/components/ui/Container";
import { site } from "@/lib/site";

export function Directions() {
  const { contact } = site;

  return (
    <section id="directions" className="border-t border-line bg-paper py-20 sm:py-28">
      <Container>
        <p className="eyebrow">Cum ne găsești</p>

        <div className="mt-8 flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
          <dl className="flex flex-wrap gap-x-12 gap-y-4 text-sm">
            <div>
              <dt className="eyebrow">Adresă</dt>
              <dd className="mt-1 text-ink-soft">
                {contact.address.line1}, {contact.address.line2}
              </dd>
            </div>
            <div>
              <dt className="eyebrow">Telefon</dt>
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
            className="inline-flex h-12 shrink-0 items-center border border-ink/25 px-8 text-[0.7rem] font-medium uppercase tracking-[0.18em] transition-colors hover:bg-ink hover:text-paper"
          >
            Indicații rutiere
          </a>
        </div>

        <div className="relative mx-auto mt-10 aspect-[58/21] w-full max-w-[58rem] overflow-hidden border border-line bg-paper-deep">
          <iframe
            title="Studio 98 location map"
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
