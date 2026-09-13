import { Bell, ArrowUpRight, MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";
import { site } from "@/lib/site";

export function Directions() {
  const { contact } = site;

  const steps = [
    {
      icon: MapPin,
      label: "Arrive",
      text: `${contact.address.line1}, ${contact.address.line2}`,
    },
    {
      icon: Bell,
      label: "Ring the buzzer",
      text: "We'll let you in.",
    },
    {
      icon: ArrowUpRight,
      label: "Follow the signs",
      text: "Straight to Studio 98.",
    },
  ];

  return (
    <section id="directions" className="border-t border-line bg-paper py-20 sm:py-28">
      <Container>
        <p className="eyebrow">How to find us</p>
        <h2 className="headline mt-4 text-4xl leading-none tracking-tight sm:text-5xl">
          Getting to {site.name}.
        </h2>

        <ol className="mt-16 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {steps.map((s, i) => (
            <li
              key={s.label}
              className={cn("flex flex-col gap-4", i > 0 && "sm:border-l sm:border-line sm:pl-8")}
            >
              <span className="grid h-12 w-12 place-items-center border border-ink">
                <s.icon size={18} strokeWidth={1.5} />
              </span>
              <div>
                <p className="eyebrow">Step {i + 1}</p>
                <p className="mt-1 font-serif text-xl tracking-tight">{s.label}</p>
                <p className="mt-1 text-sm text-ink-soft">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <dl className="space-y-4 text-sm">
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
