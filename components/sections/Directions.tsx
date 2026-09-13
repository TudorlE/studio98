import { Container } from "@/components/ui/Container";
import { site } from "@/lib/site";

export function Directions() {
  const { contact } = site;

  return (
    <section id="directions" className="border-t border-line bg-paper py-20 sm:py-28">
      <Container>
        <p className="eyebrow">How to find us</p>
        <h2 className="headline mt-4 text-4xl leading-none tracking-tight sm:text-5xl">
          Getting to {site.name}.
        </h2>

        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <ol className="space-y-6">
              <Step n="1" text={`Head to ${contact.address.line1}, ${contact.address.line2}.`} />
              <Step n="2" text="Ring the buzzer at the main entrance — we'll let you in." />
              <Step n="3" text="Take the stairs or lift and follow the signs to Studio 98." />
            </ol>

            <dl className="mt-10 space-y-4 text-sm">
              <div>
                <dt className="eyebrow">Address</dt>
                <dd className="mt-1 text-ink-soft">
                  {contact.address.line1}, {contact.address.line2}
                </dd>
              </div>
              <div>
                <dt className="eyebrow">Phone</dt>
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
              className="mt-8 inline-flex h-12 items-center border border-ink/25 px-8 text-[0.7rem] font-medium uppercase tracking-[0.18em] transition-colors hover:bg-ink hover:text-paper"
            >
              Get directions
            </a>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <div className="relative aspect-4/3 w-full overflow-hidden border border-line bg-paper-deep lg:aspect-16/10">
              <iframe
                title="Studio 98 location map"
                src={contact.mapsEmbedSrc}
                className="absolute inset-0 h-full w-full grayscale-[0.25]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Step({ n, text }: { n: string; text: string }) {
  return (
    <li className="flex gap-4">
      <span className="font-serif text-2xl leading-none text-ink-faint">{n}</span>
      <p className="pt-0.5 text-ink-soft">{text}</p>
    </li>
  );
}
