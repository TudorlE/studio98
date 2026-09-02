import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

export function About() {
  return (
    <section id="about" className="scroll-mt-24 border-t border-line bg-paper py-24 sm:py-32 lg:py-40">
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <Reveal>
              <p className="eyebrow">About</p>
              <h2 className="headline mt-6 text-[13vw] leading-[1] sm:text-6xl lg:text-[4.5rem]">
                Built for
                <br />
                creativity.
              </h2>
              <p className="mt-8 max-w-sm leading-relaxed text-ink-soft">
                Two rooms, two temperaments, one address. Book the hours, take the
                keys, create.
              </p>
            </Reveal>
          </div>

          <Reveal className="lg:col-span-6" as="figure">
            <div className="relative aspect-4/3 w-full overflow-hidden bg-paper-deep">
              <Image
                src="/images/about/02.jpg"
                alt="Studio floor with seamless backdrop and lighting"
                fill
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
