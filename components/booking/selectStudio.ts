import type { StudioSlug } from "@/lib/studios";

export const STUDIO_SELECT_EVENT = "studio98:select-studio";

/** Fired by "Book Studio XX" buttons; consumed by <BookingSystem />. */
export function requestStudioSelection(slug: StudioSlug) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem("studio98:studio", slug);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent<StudioSlug>(STUDIO_SELECT_EVENT, { detail: slug }));
}
