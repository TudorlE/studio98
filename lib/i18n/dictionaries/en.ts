import type { Dictionary } from "./ro";

export const en = {
  meta: {
    tagline: "Studios for photography and film",
    description:
      "Two studios in the city centre — for photography, film and events. Book by the hour.",
    keywords: [
      "photo studio rental",
      "video studio",
      "creative space",
      "studio hire",
      "Chișinău",
      "Moldova",
    ],
    ogHeadline: "A space for your next creation.",
  },

  currency: "MDL",
  units: {
    hour: { one: "{n} hour", other: "{n} hours" },
    minute: { one: "{n} minute", other: "{n} minutes" },
    day: { one: "{n} day", other: "{n} days" },
  },

  nav: {
    menu: "Menu",
    closeMenu: "Close menu",
    close: "Close",
    home: "Studio 98 — home",
    bookStudio: "Book a studio",
    language: "Language",
  },
  legalLinks: {
    terms: "Terms",
    privacy: "Privacy",
    cancellation: "Cancellation",
  },

  hero: {
    chooseStudio: "Choose a studio",
    houseRules: "House rules",
  },
  studio: {
    label: "Studio {index}",
    photosAndDetails: "{name} — photos and details",
    priceLine: "{description} {price} / hour.",
    book: "Book Studio {index}",
    descriptions: {
      "studio-01": "A bright room, full of natural light.",
      "studio-02": "A dark room, made for dramatic light.",
    },
  },
  directions: {
    title: "How to find us",
    address: "Address",
    phone: "Phone",
    route: "Get directions",
    mapTitle: "Studio 98 location map",
  },

  booking: {
    title: "Book a studio",
    back: "Back",
    close: "Close",
    steps: { 1: "Choose a studio", 2: "Day and time", 3: "Your details" },
    stepOf: "Step {step} of 3 — {title}",
    weekdaysShort: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    months: [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ],
    prevMonth: "Previous month",
    nextMonth: "Next month",
    pickDayHint: "Pick the day you want to come in.",
    hourNote:
      "One studio hour = 55 minutes of work. The last 5 minutes are for packing up, so the next guests can start on time.",
    loadError: "We couldn't load the available times. Please try again.",
    perHour: "/ hour",
    ctaPickDay: "Pick a day",
    ctaPickTime: "Pick a time",
    ctaContinue: "Continue with {time}",
    total: "Total",
    dueAtStudio: "+ {amount} at the studio",
    footerNote: "Pay via MIA (Plăți Instant) or at the studio.",
    submitting: "Booking…",
    submitMia: "Book — pay {amount} via MIA",
    submitAdvance: "Book — {amount} deposit via MIA",
    submitOnsite: "Book — pay at the studio",
    errors: {
      conflict: "One of the times you picked has just been booked.",
      generic: "Something went wrong. Please try again.",
      network: "No connection. Please try again.",
    },
    hints: {
      mia: "Pay now via MIA (Plăți Instant) — we confirm the booking once the payment arrives.",
      onsiteAdvance:
        "For more than {hours} a day, you pay a {percent}% deposit ({amount}) via MIA now and the rest at the studio.",
      onsite: "Pay at the studio on the day of your session.",
    },
    form: {
      name: "Your name",
      namePlaceholder: "Ana Popescu",
      phone: "Phone",
      email: "Email",
      emailPlaceholder: "you@email.com",
      howToPay: "How you'll pay",
      mia: "MIA",
      onsite: "At the studio",
      rules: "House rules",
      scrollHint: "Scroll to the end to continue.",
      agree: "I have read and agree to the house rules.",
      submit: "Book",
    },
  },

  rules: [
    {
      title: "Length of a studio hour",
      body: "A booked hour means 55 minutes of work and 5 minutes to clear the studio. For multi-hour bookings, the 5 minutes apply only at the end (for example, 10:00–12:55).",
    },
    {
      title: "Punctuality",
      body: "We start and finish at the booked time. Time lost to a late arrival can't be made up, and the session can't be extended.",
    },
    {
      title: "Payment",
      body: "Pay via MIA (Plăți Instant) or at the studio. If you choose to pay at the studio for more than 2 hours a day, the booking is confirmed after a 50% deposit via MIA; the rest is paid at the studio.",
    },
    {
      title: "Cancellation and rescheduling",
      body: "For bookings longer than 2 hours, cancelling at least 5 days ahead is fully refunded. With less than 5 days to go, you can reschedule for free with at least 24 hours' notice. Changes and cancellations on the day of the booking are not refunded.",
    },
    {
      title: "Footwear",
      body: "Entry only with clean indoor shoes or shoe covers. Outdoor shoes are not allowed.",
    },
    {
      title: "Pets",
      body: "Welcome, as long as you let the administrator know in advance.",
    },
    {
      title: "Smoking and alcohol",
      body: "Smoking, vaping and alcohol are not allowed in either studio.",
    },
    {
      title: "Glitter, confetti and fine particles",
      body: "Not allowed in The Apartment (sand included). Allowed in Production Studio.",
    },
    {
      title: "Using the bathtub",
      body: "The bathtub in The Apartment may be used only with the administrator's consent, for an extra fee (water, cleaning, upkeep).",
    },
    {
      title: "Furniture, decor and equipment",
      body: "Please don't move furniture, decor or objects without the administrator's consent. Any damage is paid for by the client (repair or replacement).",
    },
    {
      title: "When you leave",
      body: "Leave the studio as you found it and tell the administrator about any damage or problem.",
    },
  ],

  legal: {
    eyebrow: "Legal information",
    fallbackTitle: "Legal information",
    backHome: "Back to home",
    docs: {
      terms: {
        title: "Terms and conditions",
        body: [
          "PLACEHOLDER. Replace this document with the studio's real terms before launch.",
          "Bookings are confirmed once payment is received. Booked hours include set-up and pack-down time.",
          "The renter is responsible for any damage to the space or equipment during the booking.",
          "Studio 98 is not liable for the renter's equipment, materials or personal belongings.",
        ],
      },
      privacy: {
        title: "Privacy policy",
        body: [
          "PLACEHOLDER. Replace with a real, legally reviewed privacy policy.",
          "We collect the name, email and phone number you provide to manage your booking and send confirmations.",
          "Payment is made via MIA (Plăți Instant) from your bank's app, or at the studio. We don't collect or store card details.",
          "You can ask for your booking data to be deleted by emailing {email}.",
        ],
      },
      cancellation: {
        title: "Cancellation policy",
        body: [
          "For bookings longer than 2 hours, cancellations or changes of plan must be notified at least 5 days in advance — in that case, the amount paid is refunded in full.",
          "With less than 5 days to go, you can reschedule your session for free by letting us know at least 24 hours in advance.",
          "Changes and cancellations made on the day of the booking — including no-shows — are not refunded.",
        ],
      },
      rules: { title: "House rules", body: [] },
    },
  },

  confirmation: {
    metaTitle: "Booking confirmed",
    registered: "Booking received.",
    confirmed: "Booking confirmed.",
    expiredTitle: "Booking expired.",
    expiredBody:
      "The payment wasn't confirmed within {hold}, so the time slot has been released. If you've already paid, write to us and we'll sort it out right away.",
    rebook: "Book again",
    introAdvance:
      "Your time slot is held for you. The booking is confirmed once we receive the {amount} deposit via MIA (Plăți Instant). We've also emailed you a confirmation with all the details.",
    introFull:
      "Your time slot is held for you. The booking is confirmed once we receive the {amount} payment via MIA (Plăți Instant). We've also emailed you a confirmation with all the details.",
    introOnsite:
      "See you soon! You pay at the studio on the day of your session. A confirmation email is on its way.",
    introPending:
      "We've received your booking. The payment is still pending — check your email for the next steps.",
    introDefault:
      "A confirmation email is on its way. Please arrive a few minutes early.",
    payAdvance: "Pay the deposit via MIA",
    payFull: "Pay via MIA",
    qrAlt: "MIA QR code for payment",
    qrInstructions:
      "Scan the code with your bank's app or open MIA directly on your phone, then send {amount} to {recipient}.",
    deadline: "You have {hold} to pay — otherwise the booking is cancelled automatically.",
    openMia: "Open in MIA",
    studio: "Studio",
    date: "Date",
    dates: "Dates",
    time: "Time",
    total: "Total",
    advance: "Deposit via MIA",
    totalOnsite: "{total} — paid at the studio",
    paid: "Paid",
    totalPaid: "Total paid",
    dueAtStudio: "Due at the studio",
    status: "Status",
    statusValue: "Confirmed — all the details have been emailed to you.",
    backHome: "Back to home",
  },

  email: {
    subjectRegistered: "Booking received — {studio}, {date}",
    subjectConfirmed: "Booking confirmed — {studio}, {date}",
    statusRegistered: "Booking received",
    statusConfirmed: "Booking confirmed",
    headerEyebrow: "Booking confirmation",
    thanks: "Thank you, {name}.",
    introFull:
      "Thank you for choosing {site}. Your time slot is held — the booking is confirmed as soon as we receive the {amount} payment via MIA (Plăți Instant).",
    introAdvance:
      "Thank you for choosing {site}. Your time slot is held — the booking is confirmed as soon as we receive the {amount} deposit via MIA (Plăți Instant). The rest is paid at the studio.",
    introOnsite:
      "Thank you for choosing {site}. Your booking is confirmed — see you at the studio. You pay on the spot, on the day of your session.",
    miaDueAdvance: "Deposit to pay via MIA",
    miaDue: "To pay via MIA",
    qrAlt: "MIA QR code",
    miaInstructions:
      "Scan the code with your bank's app or tap the button below on your phone, then send {amount} to {recipient}.",
    deadline: "You have {hold} to pay — otherwise the booking is cancelled automatically.",
    openMia: "Open in MIA",
    detailsTitle: "Booking details",
    paymentTitle: "Payment",
    locationTitle: "Location",
    route: "Get directions →",
    goodToKnow: "Good to know",
    tipArrive:
      "Please arrive a few minutes early — the booked time includes set-up and pack-down.",
    tipCancel: "To change or cancel, write to us as early as possible. Details in our {link}.",
    cancelLinkText: "cancellation policy",
    tipRules: "You'll find the house rules on our {link}.",
    siteLinkText: "website",
    questions: "Questions? We're here:",
    rows: {
      studio: "Studio",
      date: "Date",
      dates: "Dates",
      time: "Time",
      duration: "Duration",
      perDay: " / day",
      total: "Total",
      method: "Payment method",
      methodMia: "MIA (Plăți Instant)",
      methodOnsite: "At the studio, on the day",
      advance: "{percent}% deposit via MIA",
      balance: "Balance due at the studio",
    },
    textMiaDue: "TO PAY VIA MIA: {amount}",
    textRecipient: "Recipient",
    textOpenMia: "Open MIA",
    textArrive: "Please arrive a few minutes early.",
    textCancel: "Cancellation policy: {url}",
    textQuestions: "Questions? {phone} · {email}",
  },

  api: {
    invalidForm: "Please check the form.",
    notConfigured: "The booking system isn't set up yet.",
    createFailed: "The booking couldn't be created",
    slotTaken: "This time slot is no longer available.",
    datePast: "This date has already passed.",
    minHours: "This date requires a minimum booking of {hours}.",
  },
} satisfies Dictionary;
