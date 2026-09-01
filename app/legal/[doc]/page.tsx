import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Footer } from "@/components/layout/Footer";
import { site } from "@/lib/site";

const DOCS = {
  terms: {
    title: "Terms & Conditions",
    body: [
      "PLACEHOLDER. Replace this document with the studio's real terms before launch.",
      "Bookings are confirmed once payment is received. The booked hours include set-up and clear-down time.",
      "The renter is responsible for any damage to the space or equipment during the booking.",
      "Studio 98 is not liable for the renter's equipment, media or personal belongings.",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    body: [
      "PLACEHOLDER. Replace with a real privacy policy reviewed by counsel.",
      "We collect the name, email and phone number you provide to manage your booking and send confirmations.",
      "Payment is processed by our payment provider. Card details never reach our servers and are not stored by us.",
      "You can request deletion of your booking data by emailing " + site.contact.email + ".",
    ],
  },
  cancellation: {
    title: "Cancellation Policy",
    body: [
      "PLACEHOLDER. Confirm the real policy with the studio owner.",
      "Free cancellation up to 48 hours before the booking start time — full refund.",
      "Cancellations within 48 hours are charged at 50% of the booking value.",
      "No-shows are charged in full.",
    ],
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
  return { title: entry?.title ?? "Legal", robots: { index: false } };
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
          <Link href="/" className="font-serif text-lg tracking-tight sm:text-xl">
            {site.name}
          </Link>
        </Container>
      </header>
      <main className="flex-1 py-24 sm:py-32">
        <Container className="max-w-2xl!">
          <p className="eyebrow">Legal</p>
          <h1 className="headline mt-6 text-5xl leading-none tracking-tight sm:text-6xl">
            {entry.title}
          </h1>
          <div className="mt-10 space-y-5 leading-relaxed text-ink-soft">
            {entry.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <Link
            href="/"
            className="mt-12 inline-flex h-12 items-center border border-ink/25 px-8 text-[0.7rem] font-medium uppercase tracking-[0.18em] transition-colors hover:bg-ink hover:text-paper"
          >
            Back to home
          </Link>
        </Container>
      </main>
      <Footer />
    </>
  );
}
