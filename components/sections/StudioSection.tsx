import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { StudioGallery } from "@/components/gallery/StudioGallery";
import { BookStudioButton } from "@/components/booking/BookStudioButton";
import { formatMoney } from "@/lib/booking";
import { cn } from "@/lib/cn";
import type { Studio } from "@/lib/studios";

export function StudioSection({ studio }: { studio: Studio }) {
  const dark = studio.theme === "dark";
  const muted = dark ? "text-night-soft" : "text-ink-soft";

  return (
    <section
      id={studio.slug}
      className={cn(
        "scroll-mt-20 border-t py-24 sm:py-32 lg:py-40",
        dark ? "on-night border-night-line bg-night text-paper" : "border-line bg-paper",
      )}
    >
      <Container>
        <Reveal>
          <div className="flex items-baseline justify-between gap-6">
            <p className={cn("eyebrow", dark && "text-night-soft")}>Studio {studio.index}</p>
            <p className={cn("text-sm", muted)}>
              {formatMoney(studio.pricePerHour)} <span className="uppercase tracking-[0.12em]">/ hour</span>
            </p>
          </div>
          <h2 className="headline mt-4 text-[14vw] leading-[0.95] sm:text-7xl lg:text-[5.5rem]">
            {studio.subtitle}
          </h2>
        </Reveal>

        <div className="mt-14 sm:mt-20">
          <Reveal>
            <StudioGallery images={studio.images} theme={studio.theme} />
          </Reveal>
        </div>

        <Reveal delay={0.05}>
          <div
            className="mt-12 flex flex-col gap-6 border-t pt-8 sm:flex-row sm:items-center sm:justify-between"
            style={{ borderColor: dark ? "var(--color-night-line)" : "var(--color-line)" }}
          >
            <p className={cn("text-sm", muted)}>
              {studio.area} · {studio.capacity}
            </p>
            <BookStudioButton
              slug={studio.slug}
              label={`Book Studio ${studio.index}`}
              tone={dark ? "paper" : "ink"}
            />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
