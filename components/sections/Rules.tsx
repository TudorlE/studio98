import { Cigarette, PawPrint, Pill, Flame, type LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";

const rules: { icon: LucideIcon; label: string }[] = [
  { icon: Cigarette, label: "No smoking" },
  { icon: PawPrint, label: "No pets or animals" },
  { icon: Pill, label: "No drugs" },
  { icon: Flame, label: "No open flame" },
];

export function Rules() {
  return (
    <section id="rules" className="border-t border-line bg-paper-dim py-20 sm:py-28">
      <Container>
        <p className="eyebrow">House rules</p>
        <h2 className="headline mt-4 text-4xl leading-none tracking-tight sm:text-5xl">
          Not allowed on set.
        </h2>
        <p className="mt-4 max-w-md text-ink-soft">
          Simple rules that keep the studio safe and in good shape for the next
          person booking it.
        </p>

        <div className="mt-14 grid grid-cols-2 gap-y-10 sm:grid-cols-4 sm:gap-8">
          {rules.map((rule) => (
            <div key={rule.label} className="flex flex-col items-center text-center">
              <ProhibitionIcon icon={rule.icon} />
              <p className="mt-4 text-sm font-medium text-ink">{rule.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function ProhibitionIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="relative grid h-20 w-20 shrink-0 place-items-center rounded-full border-[2.5px] border-red-600/85 bg-paper sm:h-24 sm:w-24">
      <Icon size={32} strokeWidth={1.5} className="text-ink" />
      <span className="pointer-events-none absolute left-1/2 top-1/2 h-[2.5px] w-[141%] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-red-600/85" />
    </span>
  );
}
