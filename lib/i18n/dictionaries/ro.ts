import type { PluralForms } from "@/lib/i18n/format";

/**
 * Romanian — the source dictionary. `ru.ts` and `en.ts` must match its shape
 * (checked with `satisfies Dictionary`). `{name}` placeholders are filled with
 * `fmt()`; plural forms with `plural()`.
 */
export const ro = {
  meta: {
    tagline: "Studiouri pentru fotografie și film",
    description:
      "Două studiouri în centrul orașului — pentru fotografie, film și evenimente. Rezervare la oră.",
    keywords: [
      "închiriere studio foto",
      "studio video",
      "spațiu creativ",
      "închiriere studio",
      "Chișinău",
      "Moldova",
    ],
    ogHeadline: "Spațiu pentru următoarea ta creație.",
  },

  currency: "lei",
  units: {
    hour: { one: "{n} oră", few: "{n} ore", other: "{n} de ore" } as PluralForms,
    minute: { one: "{n} minut", few: "{n} minute", other: "{n} de minute" } as PluralForms,
    day: { one: "{n} zi", few: "{n} zile", other: "{n} de zile" } as PluralForms,
  },

  nav: {
    menu: "Meniu",
    closeMenu: "Închide meniul",
    close: "Închide",
    home: "Studio 98 — pagina principală",
    bookStudio: "Rezervă un studio",
    language: "Limba",
  },
  legalLinks: {
    terms: "Termeni",
    privacy: "Confidențialitate",
    cancellation: "Anulare",
  },

  hero: {
    chooseStudio: "Alege un studio",
    houseRules: "Regulile casei",
  },
  studio: {
    label: "Studio {index}",
    photosAndDetails: "{name} — fotografii și detalii",
    priceLine: "{description} {price} / oră.",
    book: "Rezervă Studio {index}",
    descriptions: {
      "studio-01": "O cameră luminoasă, plină de lumină naturală.",
      "studio-02": "O cameră întunecată, creată pentru lumină dramatică.",
    },
  },
  directions: {
    title: "Cum ne găsești",
    address: "Adresă",
    phone: "Telefon",
    route: "Indicații rutiere",
    mapTitle: "Harta locației Studio 98",
  },

  booking: {
    title: "Rezervă un studio",
    back: "Înapoi",
    close: "Închide",
    steps: { 1: "Alege un studio", 2: "Zi și oră", 3: "Datele tale" },
    stepOf: "Pasul {step} din 3 — {title}",
    weekdaysShort: ["Du", "Lu", "Ma", "Mi", "Jo", "Vi", "Sâ"],
    months: [
      "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
      "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie",
    ],
    prevMonth: "Luna anterioară",
    nextMonth: "Luna următoare",
    pickDayHint: "Alege o zi, sau mai multe — aceeași oră se rezervă pe toate.",
    hourNote:
      "O oră de studio = 55 de minute de lucru. Ultimele 5 minute sunt pentru strângerea lucrurilor, ca următorii clienți să intre la timp.",
    loadError: "Nu am putut încărca orele disponibile. Încearcă din nou.",
    perHour: "/ oră",
    ctaPickDay: "Alege o zi",
    ctaPickTime: "Alege o oră",
    ctaContinue: "Continuă cu {time}",
    total: "Total",
    dueAtStudio: "+ {amount} la studio",
    footerNote: "Plata se face prin MIA (Plăți Instant) sau direct la studio.",
    submitting: "Se rezervă…",
    submitMia: "Rezervă — plătește {amount} prin MIA",
    submitAdvance: "Rezervă — avans {amount} prin MIA",
    submitOnsite: "Rezervă — plata la studio",
    errors: {
      conflict: "Unul dintre intervalele alese tocmai a fost rezervat.",
      generic: "A apărut o eroare. Încearcă din nou.",
      network: "Nicio conexiune. Încearcă din nou.",
    },
    hints: {
      mia: "Plătești acum prin MIA (Plăți Instant) — confirmăm rezervarea după ce primim plata.",
      onsiteAdvance:
        "Pentru mai mult de {hours} într-o zi, achiți acum un avans de {percent}% ({amount}) prin MIA, restul la studio.",
      onsite: "Plătești direct la studio, în ziua ședinței.",
    },
    form: {
      name: "Numele tău",
      namePlaceholder: "Ana Popescu",
      phone: "Telefon",
      email: "Email",
      emailPlaceholder: "tu@email.com",
      howToPay: "Cum plătești",
      mia: "MIA",
      onsite: "La studio",
      rules: "Regulile casei",
      scrollHint: "Derulează până la final ca să poți continua.",
      agree: "Am citit și sunt de acord cu regulile casei.",
      submit: "Rezervă",
    },
  },

  rules: [
    {
      title: "Durata unei ore de studio",
      body: "O oră rezervată înseamnă 55 de minute de lucru și 5 minute pentru eliberarea studioului. La rezervările de mai multe ore, cele 5 minute se aplică doar la final (de exemplu, 10:00–12:55).",
    },
    {
      title: "Punctualitate",
      body: "Începem și terminăm la ora stabilită. Timpul pierdut prin întârziere nu se recuperează, iar ședința nu poate fi prelungită.",
    },
    {
      title: "Plata",
      body: "Plătești prin MIA (Plăți Instant) sau la studio. Dacă alegi plata la studio pentru mai mult de 2 ore pe zi, rezervarea se confirmă după un avans de 50% prin MIA; restul se achită la studio.",
    },
    {
      title: "Anulare și reprogramare",
      body: "Pentru rezervările de peste 2 ore, anularea cu cel puțin 5 zile înainte se rambursează integral. Cu mai puțin de 5 zile rămase, poți reprograma gratuit, anunțând cu cel puțin 24 de ore înainte. Modificările și anulările din ziua rezervării nu se rambursează.",
    },
    {
      title: "Încălțăminte",
      body: "Intrarea este permisă doar cu încălțăminte curată de schimb sau cu botoși. Încălțămintea de afară este interzisă.",
    },
    {
      title: "Animale de companie",
      body: "Sunt binevenite, dacă anunți administratorul în prealabil.",
    },
    {
      title: "Fumat și alcool",
      body: "Fumatul, vapatul și alcoolul sunt interzise în ambele studiouri.",
    },
    {
      title: "Sclipici, confetti și particule fine",
      body: "Interzise în The Apartment (inclusiv nisipul). În Production Studio sunt permise.",
    },
    {
      title: "Utilizarea căzii",
      body: "Cada din The Apartment se folosește doar cu acordul administratorului, contra unei taxe suplimentare (apă, curățenie, întreținere).",
    },
    {
      title: "Mobilier, decor și echipament",
      body: "Nu muta mobilierul, decorul sau obiectele fără acordul administratorului. Orice daună se achită de client (reparație sau înlocuire).",
    },
    {
      title: "La plecare",
      body: "Lasă studioul așa cum l-ai găsit și anunță administratorul despre orice daună sau problemă.",
    },
  ],

  legal: {
    eyebrow: "Informații legale",
    fallbackTitle: "Informații legale",
    backHome: "Înapoi acasă",
    docs: {
      terms: {
        title: "Termeni și condiții",
        body: [
          "PLACEHOLDER. Înlocuiește acest document cu termenii reali ai studioului înainte de lansare.",
          "Rezervările sunt confirmate după primirea plății. Orele rezervate includ timpul de pregătire și de strângere a decorului.",
          "Chiriașul este responsabil pentru orice daună adusă spațiului sau echipamentului în timpul rezervării.",
          "Studio 98 nu răspunde pentru echipamentul, materialele sau obiectele personale ale chiriașului.",
        ],
      },
      privacy: {
        title: "Politica de confidențialitate",
        body: [
          "PLACEHOLDER. Înlocuiește cu o politică de confidențialitate reală, verificată juridic.",
          "Colectăm numele, emailul și numărul de telefon pe care le oferi pentru a gestiona rezervarea și a trimite confirmări.",
          "Plata se face prin MIA (Plăți Instant), din aplicația băncii tale, sau direct la studio. Nu colectăm și nu stocăm date de card.",
          "Poți cere ștergerea datelor tale de rezervare trimițând un email la {email}.",
        ],
      },
      cancellation: {
        title: "Politica de anulare",
        body: [
          "Pentru rezervările mai lungi de 2 ore, anularea sau schimbarea planurilor trebuie anunțată cu cel puțin 5 zile înainte — în acest caz, suma achitată se rambursează integral.",
          "Dacă au rămas mai puțin de 5 zile, poți reprograma ședința gratuit, anunțându-ne cu cel puțin 24 de ore înainte.",
          "Modificările și anulările făcute în ziua rezervării — inclusiv neprezentarea — nu se rambursează.",
        ],
      },
      rules: { title: "Regulile casei", body: [] as string[] },
    },
  },

  confirmation: {
    metaTitle: "Rezervare confirmată",
    registered: "Rezervare înregistrată.",
    confirmed: "Rezervare confirmată.",
    expiredTitle: "Rezervare expirată.",
    expiredBody:
      "Plata nu a fost confirmată în {hold}, așa că intervalul a fost eliberat. Dacă ai plătit deja, scrie-ne și rezolvăm imediat.",
    rebook: "Rezervă din nou",
    introAdvance:
      "Intervalul este păstrat pentru tine. Rezervarea se confirmă după ce primim avansul de {amount} prin MIA (Plăți Instant). Ți-am trimis și un email de confirmare cu toate detaliile.",
    introFull:
      "Intervalul este păstrat pentru tine. Rezervarea se confirmă după ce primim plata de {amount} prin MIA (Plăți Instant). Ți-am trimis și un email de confirmare cu toate detaliile.",
    introOnsite:
      "Te așteptăm! Plata se face la studio, în ziua ședinței. Un email de confirmare este pe drum.",
    introPending:
      "Am primit rezervarea ta. Plata este încă în așteptare — verifică emailul pentru pașii următori.",
    introDefault:
      "Un email de confirmare este pe drum. Te rugăm să ajungi cu câteva minute mai devreme.",
    payAdvance: "Plătește avansul prin MIA",
    payFull: "Plătește prin MIA",
    qrAlt: "Cod QR MIA pentru plată",
    qrInstructions:
      "Scanează codul cu aplicația băncii tale sau deschide MIA direct de pe telefon, apoi trimite suma de {amount} către {recipient}.",
    deadline: "Ai {hold} să achiți — altfel rezervarea se anulează automat.",
    openMia: "Deschide în MIA",
    studio: "Studio",
    date: "Data",
    dates: "Date",
    time: "Ora",
    total: "Total",
    advance: "Avans prin MIA",
    totalOnsite: "{total} — se achită la studio",
    paid: "Achitat",
    totalPaid: "Total achitat",
    dueAtStudio: "De achitat la studio",
    status: "Status",
    statusValue: "Confirmată — toate detaliile au fost trimise pe email.",
    backHome: "Înapoi acasă",
  },

  email: {
    subjectRegistered: "Rezervare înregistrată — {studio}, {date}",
    subjectConfirmed: "Rezervare confirmată — {studio}, {date}",
    statusRegistered: "Rezervare înregistrată",
    statusConfirmed: "Rezervare confirmată",
    headerEyebrow: "Confirmare rezervare",
    thanks: "Mulțumim, {name}.",
    introFull:
      "Îți mulțumim că ai ales {site}. Intervalul tău este păstrat — rezervarea se confirmă imediat ce primim plata de {amount} prin MIA (Plăți Instant).",
    introAdvance:
      "Îți mulțumim că ai ales {site}. Intervalul tău este păstrat — rezervarea se confirmă imediat ce primim avansul de {amount} prin MIA (Plăți Instant). Restul sumei se achită la studio.",
    introOnsite:
      "Îți mulțumim că ai ales {site}. Rezervarea ta este confirmată — te așteptăm la studio. Plata se face pe loc, în ziua ședinței.",
    miaDueAdvance: "Avans de achitat prin MIA",
    miaDue: "De achitat prin MIA",
    qrAlt: "Cod QR MIA",
    miaInstructions:
      "Scanează codul cu aplicația băncii tale sau apasă butonul de mai jos de pe telefon, apoi trimite suma de {amount} către {recipient}.",
    deadline: "Ai {hold} să achiți — altfel rezervarea se anulează automat.",
    openMia: "Deschide în MIA",
    detailsTitle: "Detaliile rezervării",
    paymentTitle: "Plată",
    locationTitle: "Locație",
    route: "Indicații rutiere →",
    goodToKnow: "Bine de știut",
    tipArrive:
      "Te rugăm să ajungi cu câteva minute mai devreme — ora rezervată include pregătirea și strângerea decorului.",
    tipCancel: "Pentru modificări sau anulare, scrie-ne cât mai devreme. Detalii în {link}.",
    cancelLinkText: "politica de anulare",
    tipRules: "Regulile casei le găsești pe {link}.",
    siteLinkText: "site",
    questions: "Ai întrebări? Suntem aici:",
    rows: {
      studio: "Studio",
      date: "Data",
      dates: "Date",
      time: "Ora",
      duration: "Durată",
      perDay: " / zi",
      total: "Total",
      method: "Metodă de plată",
      methodMia: "MIA (Plăți Instant)",
      methodOnsite: "La studio, în ziua ședinței",
      advance: "Avans {percent}% prin MIA",
      balance: "Rest de achitat la studio",
    },
    textMiaDue: "DE ACHITAT PRIN MIA: {amount}",
    textRecipient: "Destinatar",
    textOpenMia: "Deschide MIA",
    textArrive: "Te rugăm să ajungi cu câteva minute mai devreme.",
    textCancel: "Politica de anulare: {url}",
    textQuestions: "Întrebări? {phone} · {email}",
  },

  api: {
    invalidForm: "Te rugăm verifică formularul.",
    notConfigured:
      "Sistemul de rezervări nu este configurat încă. Adaugă datele Supabase pentru a activa rezervările reale.",
    createFailed: "Rezervarea nu a putut fi creată",
    slotTaken: "Acest interval orar nu mai este disponibil.",
    datePast: "Această dată a trecut.",
    minHours: "Această dată necesită o rezervare minimă de {hours}.",
  },
};

export type Dictionary = typeof ro;
