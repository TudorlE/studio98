import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Footer } from "@/components/layout/Footer";
import { Logo } from "@/components/ui/Logo";
import { site } from "@/lib/site";
import { houseRules } from "@/lib/rules";

const DOCS = {
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
      "Plata este procesată de furnizorul nostru de plăți. Datele cardului nu ajung niciodată pe serverele noastre și nu sunt stocate de noi.",
      "Poți cere ștergerea datelor tale de rezervare trimițând un email la " + site.contact.email + ".",
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
  rules: {
    title: "Regulile casei",
    body: [],
  },
} as const;

type DocKey = keyof typeof DOCS;

export function generateStaticParams() {
  return Object.keys(DOCS).map((doc) => ({ doc }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ doc: string }>;
}): Promise<Metadata> {
  const { doc } = await params;
  const entry = DOCS[doc as DocKey];
  return { title: entry?.title ?? "Informații legale", robots: { index: false } };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ doc: string }>;
}) {
  const { doc } = await params;
  const entry = DOCS[doc as DocKey];
  if (!entry) notFound();

  return (
    <>
      <header className="border-b border-line">
        <Container className="flex h-16 items-center sm:h-20">
          <Link href="/" aria-label={site.name}>
            <Logo />
          </Link>
        </Container>
      </header>
      <main className="flex-1 py-24 sm:py-32">
        <Container className="max-w-2xl!">
          <p className="eyebrow">Informații legale</p>
          <h1 className="headline mt-6 text-5xl leading-none tracking-tight sm:text-6xl">
            {entry.title}
          </h1>
          {doc === "rules" ? (
            <ol className="mt-10 space-y-7 leading-relaxed text-ink-soft">
              {houseRules.map((rule, i) => (
                <li key={rule.title} className="flex gap-4">
                  <span className="w-6 shrink-0 font-serif text-ink">{i + 1}.</span>
                  <div>
                    <p className="font-medium text-ink">{rule.title}</p>
                    <p className="mt-1">{rule.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="mt-10 space-y-5 leading-relaxed text-ink-soft">
              {entry.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          )}
          <Link
            href="/"
            className="mt-12 inline-flex h-12 items-center border border-ink/25 px-8 text-[0.7rem] font-medium uppercase tracking-[0.18em] transition-colors hover:bg-ink hover:text-paper"
          >
            Înapoi acasă
          </Link>
        </Container>
      </main>
      <Footer />
    </>
  );
}
