import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

const stats = [
  { value: "Two", label: "Studios" },
  { value: "24/7", label: "Booked online" },
  { value: "Pro", label: "Grade equipment" },
  { value: "Central", label: "In the city" },
];

export function About() {
  return (
    <section id="about" className="scroll-mt-24 border-t border-line bg-paper py-24 sm:py-32 lg:py-40">
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="eyebrow">About</p>
              <h2 className="headline mt-6 text-[13vw] leading-[1] sm:text-6xl lg:text-[4.5rem]">
                Built for
                <br />
                creativity.
              </h2>
            </Reveal>
          </div>

          <div className="lg:col-span-6 lg:col-start-7 lg:pt-3">
            <Reveal delay={0.05}>
              <p className="max-w-prose text-lg leading-relaxed text-ink-soft sm:text-xl">
                Made for the people who make things — photographers, directors,
                stylists, brands, and the occasional private dinner. Two rooms,
                two temperaments, one address.
              </p>
              <p className="mt-6 max-w-prose leading-relaxed text-ink-soft">
                Book the hours. Take the keys. The rest of the day is yours.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:mt-24 sm:grid-cols-12 sm:gap-6">
          <Reveal className="sm:col-span-7" as="figure">
            <div className="relative aspect-4/5 w-full overflow-hidden bg-paper-deep sm:aspect-16/11">
              <Image
                src="/images/about/02.jpg"
                alt="Studio floor with seamless backdrop and lighting"
                fill
                sizes="(max-width: 640px) 100vw, 58vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal className="sm:col-span-5" as="figure" delay={0.08}>
            <div className="relative aspect-4/5 w-full overflow-hidden bg-night sm:h-full">
              <Image
                src="/images/about/03.jpg"
                alt="Cinematic studio with overhead lighting rig"
                fill
                sizes="(max-width: 640px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>

        <dl className="mt-16 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-line pt-12 sm:mt-24 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.05}>
              <dt className="font-serif text-4xl tracking-tight sm:text-5xl">{s.value}</dt>
              <dd className="mt-2 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-ink-soft">
                {s.label}
              </dd>
            </Reveal>
          ))}
        </dl>
      </Container>
    </section>
  );
}
