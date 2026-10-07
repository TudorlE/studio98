/**
 * House rules — the single source of truth, shared by the /legal/rules page
 * and the agreement shown at the last step of the booking flow.
 *
 * Ordered so each rule leads into the next: time → money → arriving →
 * inside the studio → leaving.
 */
export type HouseRule = { title: string; body: string };

export const houseRules: HouseRule[] = [
  {
    title: "Durata unei ore de studio",
    body:
      "O oră rezervată include 55 de minute de lucru în studio. Ultimele 5 minute sunt dedicate eliberării spațiului, pentru ca următorii clienți să poată intra la timp. Te rugăm să-ți organizezi ședința astfel încât, la minutul 55, lucrurile să fie strânse și studioul eliberat. La rezervările de mai multe ore, lucrezi fără întrerupere, iar cele 5 minute se aplică doar la finalul ultimei ore (de exemplu, 10:00–12:55).",
  },
  {
    title: "Punctualitate",
    body:
      "Rezervarea începe și se încheie la ora stabilită. În caz de întârziere, timpul pierdut nu poate fi recuperat, iar ședința nu poate fi prelungită peste ora de final, deoarece intervalele următoare sunt rezervate altor clienți.",
  },
  {
    title: "Plata",
    body:
      "Poți achita rezervarea online, cu cardul, sau direct la studio. Dacă alegi plata la studio pentru mai mult de 2 ore într-o singură zi, rezervarea se confirmă după achitarea unui avans de 50% prin MIA (Plăți Instant); restul sumei se achită la studio.",
  },
  {
    title: "Anulare și reprogramare",
    body:
      "Pentru rezervările mai lungi de 2 ore, anularea sau schimbarea planurilor trebuie anunțată cu cel puțin 5 zile înainte — în acest caz, suma achitată se rambursează integral. Dacă au rămas mai puțin de 5 zile, poți reprograma ședința gratuit, anunțându-ne cu cel puțin 24 de ore înainte. Modificările și anulările făcute în ziua rezervării nu se rambursează.",
  },
  {
    title: "Încălțăminte",
    body:
      "Accesul în studio este permis doar cu încălțăminte curată de schimb sau cu botoși de protecție. Intrarea cu încălțămintea purtată afară este strict interzisă.",
  },
  {
    title: "Animale de companie",
    body:
      "Animalele de companie sunt binevenite, cu condiția ca administratorul să fie anunțat în prealabil.",
  },
  {
    title: "Fumat și alcool",
    body: "Fumatul, vapatul și consumul de alcool sunt interzise în interiorul ambelor studiouri.",
  },
  {
    title: "Sclipici, confetti și particule fine",
    body:
      "În studioul The Apartment nu este permisă folosirea sclipiciului, a confetti-ului, a nisipului sau a altor particule fine. În Production Studio acestea sunt permise.",
  },
  {
    title: "Utilizarea căzii",
    body:
      "Cada din studioul The Apartment poate fi folosită cu informarea prealabilă a administratorului. Utilizarea ei presupune o taxă suplimentară, care acoperă consumul de apă, curățenia și întreținerea.",
  },
  {
    title: "Mobilier, decor și echipament",
    body:
      "Te rugăm să nu muți mobilierul, decorul sau alte obiecte din studio fără acordul administratorului. Orice bun deteriorat va fi achitat de client, prin acoperirea costului reparației sau prin înlocuirea obiectului.",
  },
  {
    title: "La plecare",
    body:
      "Lasă studioul așa cum l-ai găsit și anunță administratorul despre orice daună sau problemă cu echipamentul înainte de a pleca.",
  },
];
