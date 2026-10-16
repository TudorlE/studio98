import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, defaultLocale, isLocale, localePath } from "@/lib/i18n/config";

/**
 * Language routing. Pages live under app/[lang]; Romanian keeps the
 * unprefixed URLs ("/", "/legal/rules") through an internal rewrite to /ro,
 * while /ru and /en are real prefixes. A visitor who picked RU/EN in the
 * switcher (cookie) is sent back to that language on unprefixed URLs.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const first = pathname.split("/")[1];

  // "/ro/…" is never a public URL — Romanian is the unprefixed default.
  if (first === defaultLocale) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(defaultLocale.length + 1) || "/";
    return NextResponse.redirect(url, 308);
  }

  if (isLocale(first)) return NextResponse.next();

  const remembered = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(remembered) && remembered !== defaultLocale) {
    return NextResponse.redirect(new URL(localePath(remembered, pathname) + search, request.url));
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Pages only: skip the API, the CRM, dev tools, Next internals and any file with an extension.
  matcher: ["/((?!api|admin|dev|_next|.*\\..*).*)"],
};
