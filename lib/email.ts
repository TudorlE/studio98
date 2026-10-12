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
import { pluralRo } from "@/lib/booking";

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
  payment:
    /** Whole amount via MIA, now — held until the admin confirms it arrived. */
    | { kind: "mia_full"; total: string }
    /** Long pay-at-studio booking — held until the MIA advance arrives. */
    | { kind: "mia_advance"; total: string; advance: string; balance: string }
    /** Short pay-at-studio booking — confirmed, everything paid at the studio. */
    | { kind: "onsite"; total: string };
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

/** "2026-10-16" → "vineri, 16 octombrie 2026" */
function formatDateRo(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
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
  const base = site.domain;
  const { mia } = site.booking;
  const { payment } = data;
  const awaitingMia = payment.kind !== "onsite";
  const firstName = data.customerName.trim().split(/\s+/)[0] || data.customerName;
  const dateLabels = data.dates.map(formatDateRo);
  const miaDue =
    payment.kind === "mia_full" ? payment.total : payment.kind === "mia_advance" ? payment.advance : null;

  const subject = awaitingMia
    ? `Rezervare înregistrată — ${data.studioName}, ${dateLabels[0]}`
    : `Rezervare confirmată — ${data.studioName}, ${dateLabels[0]}`;

  const status = awaitingMia ? "Rezervare înregistrată" : "Rezervare confirmată";
  const intro =
    payment.kind === "mia_full"
      ? `Îți mulțumim că ai ales ${site.name}. Intervalul tău este păstrat — rezervarea se confirmă imediat ce primim plata de ${miaDue} prin MIA (Plăți Instant).`
      : payment.kind === "mia_advance"
        ? `Îți mulțumim că ai ales ${site.name}. Intervalul tău este păstrat — rezervarea se confirmă imediat ce primim avansul de ${miaDue} prin MIA (Plăți Instant). Restul sumei se achită la studio.`
        : `Îți mulțumim că ai ales ${site.name}. Rezervarea ta este confirmată — te așteptăm la studio. Plata se face pe loc, în ziua ședinței.`;

  // Values are plain text; multiple dates are joined with a line break when rendered.
  const details: [string, string[]][] = [
    ["Studio", [data.studioName]],
    [data.dates.length > 1 ? "Date" : "Data", dateLabels],
    ["Ora", [`${data.startTime} – ${data.endTime}`]],
    ["Durată", [pluralRo(data.durationHours, "oră", "ore") + (data.dates.length > 1 ? " / zi" : "")]],
  ];
  const paymentRows: [string, string[]][] =
    payment.kind === "mia_full"
      ? [
          ["Total", [payment.total]],
          ["Metodă de plată", ["MIA (Plăți Instant)"]],
        ]
      : payment.kind === "mia_advance"
        ? [
            ["Total", [payment.total]],
            [`Avans ${site.booking.onsiteAdvancePercent}% prin MIA`, [payment.advance]],
            ["Rest de achitat la studio", [payment.balance]],
          ]
        : [
            ["Total", [payment.total]],
            ["Metodă de plată", ["La studio, în ziua ședinței"]],
          ];

  const miaBlock = miaDue
    ? `
          <tr>
            <td style="padding:8px 40px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${c.ink};">
                <tr>
                  <td align="center" style="padding:36px 24px;">
                    ${eyebrow(payment.kind === "mia_advance" ? "Avans de achitat prin MIA" : "De achitat prin MIA", c.ink)}
                    <div style="padding-top:10px;font-family:${font};font-size:40px;line-height:44px;font-weight:600;letter-spacing:-1px;color:${c.ink};">${esc(miaDue)}</div>
                    <img src="${base}${mia.qrSrc}" width="180" height="180" alt="Cod QR MIA" style="display:block;margin:24px auto 0;width:180px;height:180px;border:0;">
                    <div style="padding:20px 0 0;font-family:${font};font-size:14px;line-height:22px;color:${c.inkSoft};">
                      Scanează codul cu aplicația băncii tale sau apasă butonul de mai jos de pe telefon, apoi trimite suma de <strong style="color:${c.ink};">${esc(miaDue)}</strong> către <strong style="color:${c.ink};">${esc(mia.recipient)}</strong>.
                    </div>
                    <div style="padding:12px 0 0;font-family:${font};font-size:14px;line-height:22px;font-weight:600;color:${c.ink};">
                      Ai ${site.booking.miaHoldMinutes} de minute să achiți — altfel rezervarea se anulează automat.
                    </div>
                    <div style="padding-top:24px;">${button(mia.deepLink, "Deschide în MIA")}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
    : "";

  const html = `<!doctype html>
<html lang="ro">
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
                  <td><a href="${base}" target="_blank"><img src="${base}/logo.png" height="36" alt="${esc(site.name)}" style="display:block;height:36px;width:auto;border:0;"></a></td>
                  <td align="right">${eyebrow("Confirmare rezervare")}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="padding:48px 40px 32px;">
              ${eyebrow(status, awaitingMia ? c.inkSoft : c.accent)}
              <h1 style="margin:14px 0 0;font-family:${font};font-size:38px;line-height:42px;font-weight:600;letter-spacing:-1px;color:${c.ink};">Mulțumim, ${esc(firstName)}.</h1>
              <p style="margin:18px 0 0;font-family:${font};font-size:15px;line-height:24px;color:${c.inkSoft};">${esc(intro)}</p>
            </td>
          </tr>
${miaBlock}
          <!-- Booking details -->
          <tr>
            <td style="padding:40px 40px 0;">
              ${eyebrow("Detaliile rezervării", c.ink)}
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;border-top:1px solid ${c.line};">${rows(details)}
              </table>
            </td>
          </tr>

          <!-- Payment -->
          <tr>
            <td style="padding:36px 40px 0;">
              ${eyebrow("Plată", c.ink)}
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;border-top:1px solid ${c.line};">${rows(paymentRows)}
              </table>
            </td>
          </tr>

          <!-- Location -->
          <tr>
            <td style="padding:36px 40px 0;">
              ${eyebrow("Locație", c.ink)}
              <p style="margin:12px 0 0;font-family:${font};font-size:15px;line-height:24px;color:${c.ink};">
                ${esc(site.contact.address.line1)}<br>${esc(site.contact.address.line2)}
              </p>
              <p style="margin:8px 0 0;font-family:${font};font-size:14px;line-height:22px;">${link(site.contact.mapsDirectionsUrl, "Indicații rutiere →")}</p>
            </td>
          </tr>

          <!-- Good to know -->
          <tr>
            <td style="padding:36px 40px 0;">
              ${eyebrow("Bine de știut", c.ink)}
              <ul style="margin:12px 0 0;padding:0 0 0 18px;font-family:${font};font-size:14px;line-height:22px;color:${c.inkSoft};">
                <li style="margin-bottom:6px;">Te rugăm să ajungi cu câteva minute mai devreme — ora rezervată include pregătirea și strângerea decorului.</li>
                <li style="margin-bottom:6px;">Pentru modificări sau anulare, scrie-ne cât mai devreme. Detalii în ${link(`${base}/legal/cancellation`, "politica de anulare")}.</li>
                <li>Regulile casei le găsești pe ${link(base, "site")}.</li>
              </ul>
            </td>
          </tr>

          <!-- Contact -->
          <tr>
            <td style="padding:44px 40px 48px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${c.line};">
                <tr>
                  <td style="padding-top:24px;font-family:${font};font-size:14px;line-height:22px;color:${c.inkSoft};">
                    Ai întrebări? Suntem aici:<br>
                    <a href="${esc(site.contact.phoneHref)}" style="color:${c.ink};text-decoration:none;">${esc(site.contact.phone)}</a>
                    &nbsp;·&nbsp;
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
              ${esc(site.name)} · ${esc(site.tagline)}<br>
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
    `Mulțumim, ${firstName}.`,
    intro,
    ``,
    ...(miaDue
      ? [
          `DE ACHITAT PRIN MIA: ${miaDue}`,
          `  Destinatar:   ${mia.recipient}`,
          `  Deschide MIA: ${mia.deepLink}`,
          `  Ai ${site.booking.miaHoldMinutes} de minute să achiți — altfel rezervarea se anulează automat.`,
          ``,
        ]
      : []),
    `DETALIILE REZERVĂRII`,
    ...details.map(([l, v]) => `  ${l}: ${v.join("; ")}`),
    ``,
    `PLATĂ`,
    ...paymentRows.map(([l, v]) => `  ${l}: ${v.join("; ")}`),
    ``,
    `LOCAȚIE`,
    `  ${site.contact.address.line1}, ${site.contact.address.line2}`,
    `  Indicații rutiere: ${site.contact.mapsDirectionsUrl}`,
    ``,
    `Te rugăm să ajungi cu câteva minute mai devreme.`,
    `Politica de anulare: ${base}/legal/cancellation`,
    ``,
    `Întrebări? ${site.contact.phone} · ${site.contact.email}`,
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
  const dateLabels = data.dates.map(formatDateRo);
  const time = `${data.startTime} – ${data.endTime}`;

  const status =
    payment.kind === "mia_full"
      ? `Așteaptă plata MIA de ${payment.total}`
      : payment.kind === "mia_advance"
        ? `Așteaptă avansul MIA de ${payment.advance}`
        : "Confirmată — plata la studio";
  const action =
    payment.kind === "onsite"
      ? "Nu trebuie făcut nimic — rezervarea este deja confirmată."
      : `Când banii apar în contul MIA, confirmă plata în CRM în ${site.booking.miaHoldMinutes} de minute — altfel rezervarea se șterge automat.`;

  const subject = `Rezervare nouă — ${data.studioName}, ${dateLabels[0]}, ${data.startTime}`;

  const client: [string, string[]][] = [
    ["Nume", [data.customerName]],
    ["Telefon", [data.customerPhone]],
    ["Email", [data.to]],
  ];
  const booking: [string, string[]][] = [
    ["Studio", [data.studioName]],
    [data.dates.length > 1 ? "Date" : "Data", dateLabels],
    ["Ora", [time]],
    ["Durată", [pluralRo(data.durationHours, "oră", "ore") + (data.dates.length > 1 ? " / zi" : "")]],
    ["Total", [payment.total]],
    ...(payment.kind === "mia_advance"
      ? ([
          ["Avans MIA", [payment.advance]],
          ["Rest la studio", [payment.balance]],
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
