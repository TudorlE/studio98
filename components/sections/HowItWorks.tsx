import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

const steps = [
  { n: "01", title: "Choose your studio", body: "The Light Space or The Dark Space." },
  { n: "02", title: "Select date & time", body: "Live availability, by the hour." },
  { n: "03", title: "Pay online", body: "Card, Apple Pay or Google Pay." },
  { n: "04", title: "Create", body: "Doors open, the room is yours." },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 border-t border-line bg-paper py-24 sm:py-32 lg:py-40"
    >
      <Container>
        <Reveal>
          <p className="eyebrow">How it works</p>
        </Reveal>
        <div className="mt-12 grid gap-x-8 gap-y-14 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <Reveal key={step.n} delay={i * 0.06}>
              <p className="font-serif text-6xl text-ink-faint sm:text-7xl">{step.n}</p>
              <h3 className="mt-5 font-serif text-2xl leading-snug tracking-tight sm:text-[1.6rem]">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{step.body}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
