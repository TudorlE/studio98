import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { StudioGallery } from "@/components/gallery/StudioGallery";
import { BookStudioButton } from "@/components/booking/BookStudioButton";
import { formatMoney } from "@/lib/booking";
import { cn } from "@/lib/cn";
import type { Studio } from "@/lib/studios";

export function StudioSection({ studio }: { studio: Studio }) {
  const dark = studio.theme === "dark";

  return (
    <section
      id={studio.slug}
      className={cn(
        "scroll-mt-20 border-t py-24 sm:py-32 lg:py-40",
        dark ? "on-night border-night-line bg-night text-paper" : "border-line bg-paper",
      )}
    >
      <Container>
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <p className={cn("eyebrow", dark && "text-night-soft")}>
                Studio {studio.index}
              </p>
              <h2 className="headline mt-5 text-[14vw] leading-[0.95] sm:text-7xl lg:text-[5.5rem]">
                {studio.subtitle}
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-4 lg:col-start-9 lg:pt-4">
            <Reveal delay={0.05}>
              <p
                className={cn(
                  "text-base leading-relaxed",
                  dark ? "text-night-soft" : "text-ink-soft",
                )}
              >
                {studio.description}
              </p>
            </Reveal>
          </div>
        </div>

        <div className="mt-14 sm:mt-20">
          <Reveal>
            <StudioGallery images={studio.images} theme={studio.theme} />
          </Reveal>
        </div>

        <div className="mt-16 grid gap-12 border-t pt-12 sm:mt-20 lg:grid-cols-12 lg:gap-8"
             style={{ borderColor: dark ? "var(--color-night-line)" : "var(--color-line)" }}>
          <div className="lg:col-span-8">
            <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
              <SpecList
                dark={dark}
                title="Space"
                items={[`Surface — ${studio.area}`, `Capacity — ${studio.capacity}`]}
              />
              <SpecList dark={dark} title="Equipment" items={studio.equipment} />
              <SpecList dark={dark} title="Amenities" items={studio.amenities} />
            </div>
          </div>

          <div className="lg:col-span-3 lg:col-start-10">
            <Reveal delay={0.05}>
              <p className={cn("eyebrow", dark && "text-night-soft")}>From</p>
              <p className="mt-3 font-serif text-5xl tracking-tight sm:text-6xl">
                {formatMoney(studio.pricePerHour)}
                <span
                  className={cn(
                    "ml-2 font-sans text-sm uppercase tracking-[0.18em]",
                    dark ? "text-night-soft" : "text-ink-soft",
                  )}
                >
                  / hour
                </span>
              </p>
              <div className="mt-7">
                <BookStudioButton
                  slug={studio.slug}
                  label={`Book Studio ${studio.index}`}
                  tone={dark ? "paper" : "ink"}
                />
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}

function SpecList({
  title,
  items,
  dark,
}: {
  title: string;
  items: string[];
  dark: boolean;
}) {
  return (
    <Reveal>
      <h3 className={cn("eyebrow", dark && "text-night-soft")}>{title}</h3>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className={cn(
              "text-[0.95rem] leading-relaxed",
              dark ? "text-paper/85" : "text-ink",
            )}
          >
            {item}
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
