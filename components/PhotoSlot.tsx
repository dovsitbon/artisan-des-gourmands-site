import { BaguetteIcon, CroissantIcon, CupIcon, TartIcon } from "@/components/icons";
import { EclairMark, EpiMark } from "@/components/Logo";

export type SlotMotif = "eclair" | "tart" | "croissant" | "baguette" | "cup" | "epi";

/**
 * Emplacement élégant pour une photo à prendre sur place : fond crème, filet doré, dessin au trait.
 * Aucune fausse photo. Remplacé automatiquement dès que l'image est ajoutée (data/carte.json, data/saisons.json…).
 */
export function PhotoSlot({ motif = "epi", label, className = "" }: { motif?: SlotMotif; label: string; className?: string }) {
  const art =
    motif === "eclair" ? <EclairMark className="h-7 w-auto opacity-80" /> : motif === "tart" ? <TartIcon /> : motif === "croissant" ? <CroissantIcon /> : motif === "baguette" ? <BaguetteIcon /> : motif === "cup" ? <CupIcon className="h-9 w-9" /> : <EpiMark className="h-14 w-auto" strokeWidth={1.4} />;
  return (
    <div className={`relative flex h-full w-full flex-col items-center justify-center gap-3 bg-cream-deep text-caramel ${className}`}>
      <span className="pointer-events-none absolute inset-2.5 border border-gold/35" aria-hidden="true" />
      {art}
      <span className="text-[0.625rem] font-medium tracking-[0.24em] text-caramel-ink/80 uppercase">{label}</span>
    </div>
  );
}
