import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

const steps = [
  { n: "01", title: "Choose" },
  { n: "02", title: "Book" },
  { n: "03", title: "Pay" },
  { n: "04", title: "Create" },
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
        <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-12 sm:mt-16 lg:grid-cols-4">
          {steps.map((step, i) => (
            <Reveal key={step.n} delay={i * 0.06}>
              <p className="font-serif text-5xl text-ink-faint sm:text-6xl">{step.n}</p>
              <h3 className="mt-4 font-serif text-2xl tracking-tight">{step.title}</h3>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
