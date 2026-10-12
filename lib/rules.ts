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
      "O oră rezervată înseamnă 55 de minute de lucru și 5 minute pentru eliberarea studioului. La rezervările de mai multe ore, cele 5 minute se aplică doar la final (de exemplu, 10:00–12:55).",
  },
  {
    title: "Punctualitate",
    body:
      "Începem și terminăm la ora stabilită. Timpul pierdut prin întârziere nu se recuperează, iar ședința nu poate fi prelungită.",
  },
  {
    title: "Plata",
    body:
      "Plătești prin MIA (Plăți Instant) sau la studio. Dacă alegi plata la studio pentru mai mult de 2 ore pe zi, rezervarea se confirmă după un avans de 50% prin MIA; restul se achită la studio.",
  },
  {
    title: "Anulare și reprogramare",
    body:
      "Pentru rezervările de peste 2 ore, anularea cu cel puțin 5 zile înainte se rambursează integral. Cu mai puțin de 5 zile rămase, poți reprograma gratuit, anunțând cu cel puțin 24 de ore înainte. Modificările și anulările din ziua rezervării nu se rambursează.",
  },
  {
    title: "Încălțăminte",
    body:
      "Intrarea este permisă doar cu încălțăminte curată de schimb sau cu botoși. Încălțămintea de afară este interzisă.",
  },
  {
    title: "Animale de companie",
    body:
      "Sunt binevenite, dacă anunți administratorul în prealabil.",
  },
  {
    title: "Fumat și alcool",
    body:
      "Fumatul, vapatul și alcoolul sunt interzise în ambele studiouri.",
  },
  {
    title: "Sclipici, confetti și particule fine",
    body:
      "Interzise în The Apartment (inclusiv nisipul). În Production Studio sunt permise.",
  },
  {
    title: "Utilizarea căzii",
    body:
      "Cada din The Apartment se folosește doar cu acordul administratorului, contra unei taxe suplimentare (apă, curățenie, întreținere).",
  },
  {
    title: "Mobilier, decor și echipament",
    body:
      "Nu muta mobilierul, decorul sau obiectele fără acordul administratorului. Orice daună se achită de client (reparație sau înlocuire).",
  },
  {
    title: "La plecare",
    body:
      "Lasă studioul așa cum l-ai găsit și anunță administratorul despre orice daună sau problemă.",
  },
];
