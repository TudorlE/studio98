import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/lib/site";

export function Location() {
  const { contact, social } = site;

  return (
    <section
      id="contact"
      className="scroll-mt-20 border-t border-line bg-paper py-24 sm:py-32 lg:py-40"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <Reveal>
              <p className="eyebrow">Contact</p>
              <h2 className="headline mt-6 text-5xl leading-none tracking-tight sm:text-6xl">
                Come by.
              </h2>

              <dl className="mt-10 space-y-6 text-sm">
                <div>
                  <dt className="eyebrow">Address</dt>
                  <dd className="mt-2 not-italic leading-relaxed text-ink-soft">
                    {contact.address.line1}
                    <br />
                    {contact.address.line2}
                    <br />
                    {contact.address.country}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow">Phone</dt>
                  <dd className="mt-2">
                    <a href={contact.phoneHref} className="text-ink-soft hover:text-ink">
                      {contact.phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow">Email</dt>
                  <dd className="mt-2">
                    <a href={contact.emailHref} className="text-ink-soft hover:text-ink">
                      {contact.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow">Instagram</dt>
                  <dd className="mt-2">
                    <a
                      href={social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ink-soft hover:text-ink"
                    >
                      @studio98
                    </a>
                  </dd>
                </div>
              </dl>

              <a
                href={contact.mapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-10 inline-flex h-12 items-center border border-ink/25 px-8 text-[0.7rem] font-medium uppercase tracking-[0.18em] transition-colors hover:bg-ink hover:text-paper"
              >
                Get directions
              </a>
            </Reveal>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <Reveal delay={0.05}>
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
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
