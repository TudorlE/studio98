"use client";

import { studios } from "@/lib/studios";
import { StudioTile } from "./StudioTile";
import { StudioDetails } from "./StudioDetails";
import { useStudioDetails } from "./StudioDetailsContext";
import { useBookingDrawer } from "@/components/booking/BookingDrawerContext";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useI18n } from "@/components/i18n/I18nProvider";

export function Hero() {
  const { openDetails } = useStudioDetails();
  const { openBooking } = useBookingDrawer();
  const { t, path } = useI18n();

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] w-full flex-col items-center overflow-hidden px-5 pt-36 pb-10 sm:pt-44 sm:pb-14 lg:pt-48"
      style={{
        background:
          "radial-gradient(120% 85% at 50% 10%, var(--color-paper) 0%, var(--color-paper-dim) 65%, var(--color-paper-deep) 100%)",
      }}
    >
      <Button
        type="button"
        variant="solid"
        tone="accent"
        className="w-56 whitespace-nowrap"
        onClick={() => openBooking()}
      >
        {t.nav.bookStudio}
      </Button>

      <div className="relative flex flex-1 flex-col items-center justify-center">
        <p className="eyebrow relative">{t.hero.chooseStudio}</p>

        <div className="relative mt-6 flex flex-col items-center gap-6 sm:mt-6 sm:flex-row sm:gap-6 lg:gap-10">
          {studios.map((s) => (
            <StudioTile key={s.slug} studio={s} onOpen={() => openDetails(s.slug)} />
          ))}
        </div>
      </div>

      <ButtonLink href={path("/legal/rules")} variant="solid" tone="accent" className="w-56 whitespace-nowrap">
        {t.hero.houseRules}
      </ButtonLink>

      <StudioDetails />
    </section>
  );
}
