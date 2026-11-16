import { Reveal } from "@/components/Reveal";
import { PlusIcon } from "@/components/icons";
import type { Dict } from "@/lib/i18n";

export function SectionHead({ eyebrow, title, intro, center = false, as: H = "h2" }: { eyebrow: string; title: string; intro?: string; center?: boolean; as?: "h1" | "h2" }) {
  return (
    <Reveal className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="eyebrow">{eyebrow}</p>
      <H className="display mt-3 text-[2.3rem] md:text-[3.2rem]">{title}</H>
      {intro && <p className="lead mt-4">{intro}</p>}
    </Reveal>
  );
}

/** FAQ en accordéon natif (details/summary) : lisible sans JavaScript, reprise dans le schema FAQPage. */
export function Faq({ d }: { d: Dict }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {d.faq.items.map((f) => (
        <details key={f.q} className="group">
          <summary className="flex min-h-16 items-center justify-between gap-6 py-4 text-[1.0625rem] font-normal">
            {f.q}
            <PlusIcon className="faq-plus h-4 w-4 shrink-0 text-framboise-ink" />
          </summary>
          <p className="pb-6 leading-relaxed text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
