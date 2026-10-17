/**
 * Pluggable transactional email.
 *
 * Uses Resend when RESEND_API_KEY is present, otherwise logs to the server
 * console so local development and the demo build never break.
 *
 * The HTML is table-based with inline styles only — the subset every mail
 * client (Gmail, Outlook, Apple Mail) renders the same. Colours mirror the
 * site's design tokens in app/globals.css.
 */
import { site } from "@/lib/site";
import { formatHours, formatMoney, miaHoldLabel } from "@/lib/booking";
import { fmt, formatLongDate, getDictionary, localeLabel, localePath, type Locale } from "@/lib/i18n";

export type BookingConfirmationEmail = {
  to: string;
  customerName: string;
  customerPhone: string;
  studioName: string;
  /** One or more YYYY-MM-DD dates (multi-day bookings share the same time). */
  dates: string[];
  startTime: string;
  endTime: string;
  durationHours: number;
  /** Language the client booked in — their email is written in it. */
  locale: Locale;
  /** Amounts in lei. */
  payment:
    /** Whole amount via MIA, now — held until the admin confirms it arrived. */
    | { kind: "mia_full"; total: number }
    /** Long pay-at-studio booking — held until the MIA advance arrives. */
    | { kind: "mia_advance"; total: number; advance: number; balance: number }
    /** Short pay-at-studio booking — confirmed, everything paid at the studio. */
    | { kind: "onsite"; total: number };
};

const c = {
  paper: "#fffff0",
  paperDim: "#f7f7e6",
  ink: "#111111",
  inkSoft: "#6f6f6a",
  inkFaint: "#9b9b95",
  line: "#dcdad2",
  accent: "#123c2b",
};
const font = `'Inter','Helvetica Neue',Helvetica,Arial,sans-serif`;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const eyebrow = (text: string, color = c.inkSoft) =>
  `<div style="font-family:${font};font-size:11px;font-weight:500;letter-spacing:2px;text-transform:uppercase;color:${color};">${esc(text)}</div>`;

const rows = (items: [string, string[]][]) =>
  items
    .map(
      ([label, value]) => `
              <tr>
                <td style="padding:14px 16px 14px 0;border-bottom:1px solid ${c.line};font-family:${font};font-size:11px;font-weight:500;letter-spacing:2px;text-transform:uppercase;color:${c.inkSoft};vertical-align:top;">${esc(label)}</td>
                <td align="right" style="padding:14px 0;border-bottom:1px solid ${c.line};font-family:${font};font-size:15px;line-height:22px;color:${c.ink};">${value.map(esc).join("<br>")}</td>
              </tr>`,
    )
    .join("");

const button = (href: string, label: string) => `
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td align="center" bgcolor="${c.ink}" style="border-radius:999px;">
                    <a href="${esc(href)}" target="_blank" style="display:inline-block;padding:16px 36px;font-family:${font};font-size:11px;font-weight:500;letter-spacing:2.5px;text-transform:uppercase;color:${c.paper};text-decoration:none;border-radius:999px;">${esc(label)}</a>
                  </td>
                </tr>
              </table>`;

const link = (href: string, label: string) =>
  `<a href="${esc(href)}" target="_blank" style="color:${c.accent};text-decoration:underline;">${esc(label)}</a>`;

export function renderBookingConfirmation(data: BookingConfirmationEmail) {
  const { locale, payment } = data;
  const dict = getDictionary(locale);
  const t = dict.email;
  const r = t.rows;
  const base = site.domain;
  const home = `${base}${localePath(locale)}`;
  const { mia } = site.booking;
  const money = (n: number) => formatMoney(n, locale);
  const hold = miaHoldLabel(locale);
  const awaitingMia = payment.kind !== "onsite";
  const firstName = data.customerName.trim().split(/\s+/)[0] || data.customerName;
  const dateLabels = data.dates.map((d) => formatLongDate(locale, d));
  const miaDue =
    payment.kind === "mia_full"
      ? money(payment.total)
      : payment.kind === "mia_advance"
        ? money(payment.advance)
        : null;

  const subject = fmt(awaitingMia ? t.subjectRegistered : t.subjectConfirmed, {
    studio: data.studioName,
    date: dateLabels[0],
  });
  const status = awaitingMia ? t.statusRegistered : t.statusConfirmed;
  const intro = fmt(
    payment.kind === "mia_full" ? t.introFull : payment.kind === "mia_advance" ? t.introAdvance : t.introOnsite,
    { site: site.name, amount: miaDue ?? "" },
  );
  const thanks = fmt(t.thanks, { name: firstName });
  const deadline = fmt(t.deadline, { hold });
  const cancelUrl = `${base}${localePath(locale, "/legal/cancellation")}`;

  // Values are plain text; multiple dates are joined with a line break when rendered.
  const details: [string, string[]][] = [
    [r.studio, [data.studioName]],
    [data.dates.length > 1 ? r.dates : r.date, dateLabels],
    [r.time, [`${data.startTime} – ${data.endTime}`]],
    [r.duration, [formatHours(data.durationHours, locale) + (data.dates.length > 1 ? r.perDay : "")]],
  ];
  const paymentRows: [string, string[]][] =
    payment.kind === "mia_full"
      ? [
          [r.total, [money(payment.total)]],
          [r.method, [r.methodMia]],
        ]
      : payment.kind === "mia_advance"
        ? [
            [r.total, [money(payment.total)]],
            [fmt(r.advance, { percent: site.booking.onsiteAdvancePercent }), [money(payment.advance)]],
            [r.balance, [money(payment.balance)]],
          ]
        : [
            [r.total, [money(payment.total)]],
            [r.method, [r.methodOnsite]],
          ];
  const strong = (v: string) => `<strong style="color:${c.ink};">${esc(v)}</strong>`;

  const miaBlock = miaDue
    ? `
          <tr>
            <td style="padding:8px 40px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${c.ink};">
                <tr>
                  <td align="center" style="padding:36px 24px;">
                    ${eyebrow(payment.kind === "mia_advance" ? t.miaDueAdvance : t.miaDue, c.ink)}
                    <div style="padding-top:10px;font-family:${font};font-size:40px;line-height:44px;font-weight:600;letter-spacing:-1px;color:${c.ink};">${esc(miaDue)}</div>
                    <img src="${base}${mia.qrSrc}" width="180" height="180" alt="${esc(t.qrAlt)}" style="display:block;margin:24px auto 0;width:180px;height:180px;border:0;">
                    <div style="padding:20px 0 0;font-family:${font};font-size:14px;line-height:22px;color:${c.inkSoft};">
                      ${fmt(esc(t.miaInstructions), { amount: strong(miaDue), recipient: strong(mia.recipient) })}
                    </div>
                    <div style="padding:12px 0 0;font-family:${font};font-size:14px;line-height:22px;font-weight:600;color:${c.ink};">
                      ${esc(deadline)}
                    </div>
                    <div style="padding-top:24px;">${button(mia.deepLink, t.openMia)}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
    : "";

  const html = `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light">
<title>${esc(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${c.paperDim};-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(intro)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${c.paperDim}" style="background:${c.paperDim};">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="${c.paper}" style="width:100%;max-width:600px;background:${c.paper};border:1px solid ${c.line};">

          <!-- Header -->
          <tr>
            <td style="padding:28px 40px;border-bottom:1px solid ${c.line};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td><a href="${home}" target="_blank"><img src="${base}/logo.png" height="36" alt="${esc(site.name)}" style="display:block;height:36px;width:auto;border:0;"></a></td>
                  <td align="right">${eyebrow(t.headerEyebrow)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="padding:48px 40px 32px;">
              ${eyebrow(status, awaitingMia ? c.inkSoft : c.accent)}
              <h1 style="margin:14px 0 0;font-family:${font};font-size:38px;line-height:42px;font-weight:600;letter-spacing:-1px;color:${c.ink};">${esc(thanks)}</h1>
              <p style="margin:18px 0 0;font-family:${font};font-size:15px;line-height:24px;color:${c.inkSoft};">${esc(intro)}</p>
            </td>
          </tr>
${miaBlock}
          <!-- Booking details -->
          <tr>
            <td style="padding:40px 40px 0;">
              ${eyebrow(t.detailsTitle, c.ink)}
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;border-top:1px solid ${c.line};">${rows(details)}
              </table>
            </td>
          </tr>

          <!-- Payment -->
          <tr>
            <td style="padding:36px 40px 0;">
              ${eyebrow(t.paymentTitle, c.ink)}
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;border-top:1px solid ${c.line};">${rows(paymentRows)}
              </table>
            </td>
          </tr>

          <!-- Location -->
          <tr>
            <td style="padding:36px 40px 0;">
              ${eyebrow(t.locationTitle, c.ink)}
              <p style="margin:12px 0 0;font-family:${font};font-size:15px;line-height:24px;color:${c.ink};">
                ${esc(site.contact.address.line1)}<br>${esc(site.contact.address.line2)}
              </p>
              <p style="margin:8px 0 0;font-family:${font};font-size:14px;line-height:22px;">${link(site.contact.mapsDirectionsUrl, t.route)}</p>
            </td>
          </tr>

          <!-- Good to know -->
          <tr>
            <td style="padding:36px 40px 0;">
              ${eyebrow(t.goodToKnow, c.ink)}
              <ul style="margin:12px 0 0;padding:0 0 0 18px;font-family:${font};font-size:14px;line-height:22px;color:${c.inkSoft};">
                <li style="margin-bottom:6px;">${esc(t.tipArrive)}</li>
                <li style="margin-bottom:6px;">${fmt(esc(t.tipCancel), { link: link(cancelUrl, t.cancelLinkText) })}</li>
                <li>${fmt(esc(t.tipRules), { link: link(home, t.siteLinkText) })}</li>
              </ul>
            </td>
          </tr>

          <!-- Contact -->
          <tr>
            <td style="padding:44px 40px 48px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${c.line};">
                <tr>
                  <td style="padding-top:24px;font-family:${font};font-size:14px;line-height:22px;color:${c.inkSoft};">
                    ${esc(t.questions)}<br>
                    <a href="${esc(site.contact.emailHref)}" style="color:${c.ink};text-decoration:none;">${esc(site.contact.email)}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
          <tr>
            <td align="center" style="padding:24px 40px 0;font-family:${font};font-size:12px;line-height:18px;color:${c.inkFaint};">
              ${esc(site.name)} · ${esc(dict.meta.tagline)}<br>
              ${esc(site.contact.address.line1)}, ${esc(site.contact.address.line2)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    `${status.toUpperCase()} — ${site.name}`,
    ``,
    thanks,
    intro,
    ``,
    ...(miaDue
      ? [
          fmt(t.textMiaDue, { amount: miaDue }),
          `  ${t.textRecipient}: ${mia.recipient}`,
          `  ${t.textOpenMia}: ${mia.deepLink}`,
          `  ${deadline}`,
          ``,
        ]
      : []),
    t.detailsTitle.toUpperCase(),
    ...details.map(([l, v]) => `  ${l}: ${v.join("; ")}`),
    ``,
    t.paymentTitle.toUpperCase(),
    ...paymentRows.map(([l, v]) => `  ${l}: ${v.join("; ")}`),
    ``,
    t.locationTitle.toUpperCase(),
    `  ${site.contact.address.line1}, ${site.contact.address.line2}`,
    `  ${t.route.replace(/\s*→$/, "")}: ${site.contact.mapsDirectionsUrl}`,
    ``,
    t.textArrive,
    fmt(t.textCancel, { url: cancelUrl }),
    ``,
    fmt(t.textQuestions, { email: site.contact.email }),
  ].join("\n");

  return { subject, html, text };
}

/**
 * Internal "new booking" alert for the studio — sent to BOOKING_NOTIFY_EMAIL
 * (if set) next to every client confirmation. Replying goes to the client.
 */
export function renderBookingNotification(data: BookingConfirmationEmail) {
  const base = site.domain;
  const { payment } = data;
  // The studio's own alert stays in Romanian, whatever language the client used.
  const money = (v: number) => formatMoney(v, "ro");
  const dateLabels = data.dates.map((d) => formatLongDate("ro", d));
  const time = `${data.startTime} – ${data.endTime}`;

  const status =
    payment.kind === "mia_full"
      ? `Așteaptă plata MIA de ${money(payment.total)}`
      : payment.kind === "mia_advance"
        ? `Așteaptă avansul MIA de ${money(payment.advance)}`
        : "Confirmată — plata la studio";
  const action =
    payment.kind === "onsite"
      ? "Nu trebuie făcut nimic — rezervarea este deja confirmată."
      : `Când banii apar în contul MIA, confirmă plata în CRM în ${miaHoldLabel("ro")} — altfel rezervarea se șterge automat.`;

  const subject = `Rezervare nouă — ${data.studioName}, ${dateLabels[0]}, ${data.startTime}`;

  const client: [string, string[]][] = [
    ["Nume", [data.customerName]],
    ["Telefon", [data.customerPhone]],
    ["Email", [data.to]],
    ["Limba clientului", [localeLabel[data.locale]]],
  ];
  const booking: [string, string[]][] = [
    ["Studio", [data.studioName]],
    [data.dates.length > 1 ? "Date" : "Data", dateLabels],
    ["Ora", [time]],
    ["Durată", [formatHours(data.durationHours, "ro") + (data.dates.length > 1 ? " / zi" : "")]],
    ["Total", [money(payment.total)]],
    ...(payment.kind === "mia_advance"
      ? ([
          ["Avans MIA", [money(payment.advance)]],
          ["Rest la studio", [money(payment.balance)]],
        ] as [string, string[]][])
      : []),
    ["Plată", [payment.kind === "onsite" ? "La studio" : payment.kind === "mia_full" ? "MIA integral" : "Avans MIA + rest la studio"]],
  ];

  const html = `<!doctype html>
<html lang="ro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<title>${esc(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${c.paperDim};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${c.paperDim}" style="background:${c.paperDim};">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="${c.paper}" style="width:100%;max-width:600px;background:${c.paper};border:1px solid ${c.line};">
          <tr>
            <td style="padding:40px 40px 8px;">
              ${eyebrow("Rezervare nouă", c.accent)}
              <h1 style="margin:12px 0 0;font-family:${font};font-size:30px;line-height:34px;font-weight:600;letter-spacing:-0.5px;color:${c.ink};">${esc(data.studioName)}<br>${esc(dateLabels.join(", "))} · ${esc(time)}</h1>
              <p style="margin:16px 0 0;font-family:${font};font-size:15px;line-height:22px;color:${c.ink};"><strong>${esc(status)}</strong></p>
              <p style="margin:6px 0 0;font-family:${font};font-size:14px;line-height:22px;color:${c.inkSoft};">${esc(action)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 40px 0;">
              ${eyebrow("Client", c.ink)}
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;border-top:1px solid ${c.line};">${rows(client)}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 40px 0;">
              ${eyebrow("Rezervare", c.ink)}
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;border-top:1px solid ${c.line};">${rows(booking)}
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:36px 40px 44px;">${button(`${base}/admin`, "Deschide CRM")}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    `REZERVARE NOUĂ — ${data.studioName}`,
    `${dateLabels.join(", ")} · ${time}`,
    status,
    action,
    ``,
    `CLIENT`,
    ...client.map(([l, v]) => `  ${l}: ${v.join("; ")}`),
    ``,
    `REZERVARE`,
    ...booking.map(([l, v]) => `  ${l}: ${v.join("; ")}`),
    ``,
    `CRM: ${base}/admin`,
  ].join("\n");

  return { subject, html, text };
}

type OutgoingEmail = { to: string; subject: string; html: string; text: string; replyTo?: string };

async function deliver(email: OutgoingEmail): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "bookings@studio98.example";

  if (!apiKey) {
    console.info(`[email] RESEND_API_KEY not set — not sent to ${email.to}:\n`, {
      subject: email.subject,
      text: email.text,
    });
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: email.to,
      subject: email.subject,
      html: email.html,
      text: email.text,
      ...(email.replyTo ? { reply_to: email.replyTo } : {}),
    }),
  });

  if (!res.ok) {
    console.error("[email] Resend failed", email.to, res.status, await res.text());
  }
}

/** Client confirmation + (if BOOKING_NOTIFY_EMAIL is set) the studio's alert. */
export async function sendBookingConfirmation(data: BookingConfirmationEmail): Promise<void> {
  const notifyTo = process.env.BOOKING_NOTIFY_EMAIL;
  await Promise.all([
    deliver({ to: data.to, ...renderBookingConfirmation(data) }),
    notifyTo
      ? deliver({ to: notifyTo, replyTo: data.to, ...renderBookingNotification(data) })
      : Promise.resolve(),
  ]);
}
