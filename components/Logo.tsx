// Logo typographique (l'enseigne n'a pas de logo dessiné : capitales dorées sur marbre). À remplacer par le vrai fichier s'il existe :
// public/logo.svg reprend le même dessin. L'épi de blé au trait sert aussi au favicon (app/icon.svg) et à l'ouverture.

const grain = (y: number, side: 1 | -1) => `M20 ${y}C${20 - 8 * side} ${y - 2} ${20 - 11 * side} ${y - 10} ${20 - 9 * side} ${y - 16}C${20 - 3 * side} ${y - 13} 20 ${y - 7} 20 ${y}`;

/** Épi de blé, dessiné de bas en haut. viewBox 0 0 40 120. */
export const EPI = {
  stem: "M20 118V30",
  grains: [92, 78, 64, 50, 36].flatMap((y) => [grain(y, 1), grain(y, -1)]),
  top: "M20 30C16 24 17 16 20 10C23 16 24 24 20 30",
  awn: "M20 10V2",
};

/** Éclair vu de profil. viewBox 0 0 160 40. */
export const ECLAIR = {
  body: "M20 14H140A11 11 0 0 1 140 36H20A11 11 0 0 1 20 14Z",
  glaze: "M18 14H142C149 14 152 18 151 22C138 25 22 25 9 22C8 18 11 14 18 14Z",
  shine: "M34 17.5H74",
};

export function EpiMark({ className = "h-10 w-auto", strokeWidth = 1.6 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 40 120" className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={EPI.stem} />
      {EPI.grains.map((d) => (
        <path key={d} d={d} />
      ))}
      <path d={EPI.top} />
      <path d={EPI.awn} />
    </svg>
  );
}

export function EclairMark({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 40" className={className} fill="none" aria-hidden="true">
      <path d={ECLAIR.body} stroke="var(--color-caramel)" strokeWidth={1.6} />
      <path d={ECLAIR.glaze} fill="var(--color-ink)" />
      <path d={ECLAIR.shine} stroke="var(--color-cream)" strokeOpacity={0.5} strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ compact = false, light = false, className = "" }: { compact?: boolean; light?: boolean; className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 leading-none ${className}`} translate="no">
      <EpiMark className={`${compact ? "hidden h-9 sm:block md:h-10" : "h-14"} w-auto ${light ? "text-gold" : "text-caramel"}`} strokeWidth={compact ? 2 : 1.6} />
      <span className="flex flex-col items-center">
        <span className={`caps whitespace-nowrap ${compact ? "text-[0.92rem] tracking-[0.12em] md:text-[1.12rem] md:tracking-[0.16em]" : "text-[1.45rem]"}`}>L&apos;Artisan des Gourmands</span>
        <span className={`mt-1.5 whitespace-nowrap font-[family-name:var(--font-jost)] font-normal tracking-[0.22em] uppercase ${light ? "text-cream/75" : "text-caramel-ink"} ${compact ? "text-[0.5rem] md:text-[0.56rem]" : "text-[0.66rem]"}`}>Boulangerie · Pâtisserie · Paris 15</span>
      </span>
    </span>
  );
}
