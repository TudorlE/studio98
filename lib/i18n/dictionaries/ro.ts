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
    email: "Email",
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
    pickDayHint: "Alege ziua în care vrei să vii.",
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
      consent: {
        before: "Sunt de acord cu ",
        terms: "Termenii și condițiile",
        middle: " și cu prelucrarea datelor mele personale conform ",
        privacy: "Politicii de confidențialitate",
        after: ".",
      },
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
      body: "Anularea cu cel puțin 5 zile înainte se rambursează integral. Cu mai puțin de 5 zile rămase, poți reprograma gratuit, anunțând cu cel puțin 24 de ore înainte. Modificările și anulările din ziua rezervării nu se rambursează.",
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
          "## 1. Cine suntem",
          "Acest site și studiourile STUDIO 98 sunt administrate de {company}, {address} („Studio 98”, „noi”). Ne poți scrie oricând la {email}.",
          "Când faci o rezervare pe site, confirmi că ai citit și accepți acești Termeni și condiții, Regulile casei, Politica de anulare și Politica de confidențialitate.",
          "## 2. Ce oferim",
          "Închiriem cu ora două spații pentru ședințe foto și video, producții, evenimente mici și alte proiecte creative: Production Studio și The Apartment. Prețul pe oră al fiecărui studio este afișat pe site și în formularul de rezervare, în lei moldovenești (MDL).",
          "Studiourile pot fi rezervate zilnic între {open} și {close}, cu cel puțin {lead} ore înainte și cu cel mult {advanceDays} de zile în avans.",
          "O oră rezervată înseamnă 55 de minute de lucru și 5 minute pentru eliberarea studioului. La mai multe ore consecutive, cele 5 minute se aplică doar la final.",
          "## 3. Cum se face o rezervare",
          "Alegi studioul, ziua și intervalul orar, apoi completezi numele, telefonul și emailul. O rezervare acoperă o singură zi; pentru mai multe zile faci rezervări separate.",
          "După trimitere primești pe email confirmarea cu toate detaliile. Ești responsabil(ă) ca datele introduse să fie corecte. Dacă rezervi în numele unei firme sau al altei persoane, confirmi că ai dreptul să o faci.",
          "## 4. Plata",
          "Prin MIA (Plăți Instant): achiți integral din aplicația băncii, scanând codul QR sau deschizând linkul MIA. Intervalul îți este păstrat {hold} de ore. Dacă plata nu ajunge în acest timp, rezervarea se anulează automat și intervalul se eliberează.",
          "La studio: achiți în ziua ședinței. Pentru mai mult de {advanceHours} ore într-o zi, rezervarea se confirmă după un avans de {advancePercent}% prin MIA, iar restul se achită la studio. Avansul trebuie să ajungă în {hold} de ore, altfel rezervarea se anulează automat.",
          "Nu colectăm și nu stocăm date de card. Serviciile suplimentare (de exemplu folosirea căzii din The Apartment) se stabilesc cu administratorul și se achită separat.",
          "## 5. Anulare și reprogramare",
          "Anularea, reprogramarea și rambursările se fac conform Politicii de anulare.",
          "## 6. Folosirea spațiului",
          "În studio se respectă Regulile casei, pe care le accepți la fiecare rezervare. Răspunzi pentru persoanele pe care le aduci (echipă, modele, invitați) și pentru orice daună adusă spațiului, mobilierului sau echipamentului; reparația sau înlocuirea se achită de tine.",
          "Putem cere încheierea ședinței dacă regulile casei sunt încălcate grav sau dacă este pusă în pericol siguranța oamenilor ori a spațiului.",
          "## 7. Fotografii și conținut",
          "Fotografiile și materialele realizate în timpul rezervării îți aparțin. Ești responsabil(ă) să obții acordul persoanelor pe care le fotografiezi sau le filmezi.",
          "## 8. Răspundere",
          "Nu răspundem pentru echipamentul, materialele sau obiectele personale aduse în studio. Dacă studioul nu poate fi pus la dispoziție din motive care țin de noi (de exemplu o avarie), te anunțăm cât mai repede și îți oferim reprogramarea sau rambursarea integrală a sumei achitate.",
          "## 9. Datele tale personale",
          "Ca să putem gestiona rezervarea, prelucrăm numele, telefonul și emailul tău conform Politicii de confidențialitate. La fiecare rezervare îți cerem acordul explicit pentru această prelucrare; fără el rezervarea nu poate fi trimisă.",
          "## 10. Modificări și legea aplicabilă",
          "Putem actualiza acești termeni. Rezervările deja făcute rămân supuse versiunii valabile la data rezervării. Acești termeni sunt guvernați de legislația Republicii Moldova.",
          "Ultima actualizare: 17 octombrie 2026.",
        ],
      },
      privacy: {
        title: "Politica de confidențialitate",
        body: [
          "## 1. Cine prelucrează datele",
          "Operatorul datelor este {company}, {address}. Pentru orice întrebare despre datele tale ne scrii la {email}.",
          "Prelucrăm datele cu caracter personal conform Legii nr. 133/2011 privind protecția datelor cu caracter personal a Republicii Moldova.",
          "## 2. Ce date colectăm",
          "Datele de contact pe care le introduci la rezervare: numele, numărul de telefon și adresa de email.",
          "Detaliile rezervării: studioul, ziua, ora, durata, suma, metoda și starea plății și limba în care ai rezervat.",
          "Un cookie tehnic care ține minte limba aleasă pe site. Nu folosim cookie-uri de publicitate sau de urmărire.",
          "Nu colectăm date de card. Plata prin MIA se face în aplicația băncii tale; noi vedem doar dacă plata a fost primită.",
          "## 3. De ce le folosim",
          "Ca să înregistrăm și să confirmăm rezervarea, să îți trimitem emailul de confirmare și informațiile de plată, să te contactăm dacă intervine o schimbare și pentru evidența contabilă.",
          "Nu îți trimitem reclame sau newslettere și nu vindem datele tale nimănui.",
          "## 4. Temeiul prelucrării",
          "Consimțământul pe care ni-l dai bifând căsuța din formularul de rezervare și executarea rezervării pe care ai cerut-o. Fără aceste date nu putem procesa rezervarea.",
          "## 5. Cine are acces la date",
          "Doar administratorii Studio 98 și furnizorii tehnici care ne ajută să funcționăm: găzduirea site-ului, baza de date (Supabase) și trimiterea emailurilor (Resend). Aceștia prelucrează datele doar în numele nostru și pot stoca datele pe servere din afara Republicii Moldova.",
          "## 6. Cât timp le păstrăm",
          "Păstrăm datele rezervării cât timp sunt necesare pentru rezervare și apoi pe durata cerută de obligațiile legale contabile. Rezervările pentru care plata sau avansul prin MIA nu a ajuns se șterg automat după {hold} de ore.",
          "## 7. Drepturile tale",
          "Poți cere oricând să afli ce date avem despre tine, să le corectezi sau să le ștergi, te poți opune prelucrării și îți poți retrage consimțământul, scriindu-ne la {email}.",
          "Dacă vrei să faci o plângere, te poți adresa Centrului Național pentru Protecția Datelor cu Caracter Personal al Republicii Moldova (datepersonale.md).",
          "## 8. Securitate",
          "Datele circulă criptat (HTTPS), iar panoul de administrare este protejat cu parolă și este accesibil doar echipei Studio 98.",
          "Ultima actualizare: 17 octombrie 2026.",
        ],
      },
      cancellation: {
        title: "Politica de anulare",
        body: [
          "## Anulare cu rambursare",
          "Anularea sau schimbarea planurilor trebuie anunțată cu cel puțin 5 zile înainte — în acest caz, suma achitată se rambursează integral.",
          "## Reprogramare",
          "Dacă au rămas mai puțin de 5 zile, poți reprograma ședința gratuit, anunțându-ne cu cel puțin 24 de ore înainte.",
          "## În ziua rezervării",
          "Modificările și anulările făcute în ziua rezervării — inclusiv neprezentarea — nu se rambursează.",
          "## Rezervări neachitate",
          "Dacă plata sau avansul prin MIA nu ajunge în {hold} de ore, rezervarea se anulează automat, fără niciun cost pentru tine.",
          "## Cum anulezi sau reprogramezi",
          "Scrie-ne la {email}, cu numele și data rezervării. Rambursările se fac în contul din care a fost făcută plata.",
          "## Dacă anulăm noi",
          "Dacă nu putem pune studioul la dispoziție din motive care țin de noi, îți oferim reprogramarea sau rambursarea integrală a sumei achitate.",
          "Ultima actualizare: 17 octombrie 2026.",
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
    textQuestions: "Întrebări? {email}",
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
