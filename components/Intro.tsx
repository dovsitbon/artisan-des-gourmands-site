"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { ECLAIR, EPI } from "@/components/Logo";

const KEY = "adg-intro";
const at = (d: number, t?: number) => ({ "--d": `${d}s`, ...(t ? { "--t": `${t}s` } : {}) }) as CSSProperties;

/**
 * Ouverture (1,2 s, une fois par session), tout en CSS (globals.css) :
 * fond crème, un épi de blé se dessine au trait doré, un éclair glisse en dessous et se nappe de chocolat,
 * « L'ARTISAN DES GOURMANDS » puis « BOULANGERIE · PÂTISSERIE », fondu sur le hero.
 * Bouton « Passer » ; rien ne s'affiche si l'utilisateur préfère réduire les animations.
 */
export function Intro({ skipLabel }: { skipLabel: string }) {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {}
      document.documentElement.classList.add("intro-seen");
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  if (gone) return null;

  const p = { pathLength: 1, className: "intro-draw" };
  return (
    <div className="intro-curtain flex flex-col items-center justify-center text-ink">
      <svg viewBox="0 0 40 120" className="h-24 w-auto md:h-28" fill="none" stroke="#B8975A" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path {...p} d={EPI.stem} style={at(0, 0.3)} />
        {EPI.grains.map((d, i) => (
          <path key={d} {...p} d={d} style={at(0.06 + Math.floor(i / 2) * 0.04, 0.22)} />
        ))}
        <path {...p} d={EPI.top} style={at(0.26, 0.16)} />
        <path {...p} d={EPI.awn} style={at(0.34, 0.1)} />
      </svg>
      <svg viewBox="0 0 160 40" className="intro-slide mt-3 h-7 w-auto md:h-8" fill="none" aria-hidden="true">
        <path d={ECLAIR.body} stroke="#C98B4A" strokeWidth={1.5} />
        <path d={ECLAIR.glaze} fill="#4A2C21" className="intro-glaze" />
      </svg>
      <p className="intro-name caps mt-7 ps-[0.22em] text-center text-[clamp(1.25rem,5vw,2rem)]" translate="no" aria-hidden="true">
        L&apos;Artisan des Gourmands
      </p>
      <p className="intro-fade mt-3 text-[0.6875rem] font-medium tracking-[0.3em] text-caramel-ink uppercase" style={at(0.72)} translate="no" aria-hidden="true">
        Boulangerie · Pâtisserie
      </p>
      <button
        type="button"
        onClick={() => {
          try {
            sessionStorage.setItem(KEY, "1");
          } catch {}
          document.documentElement.classList.add("intro-seen");
          setGone(true);
        }}
        className="nav-link absolute end-4 bottom-4 min-h-11 px-4 text-muted transition-colors hover:text-ink"
      >
        {skipLabel}
      </button>
    </div>
  );
}
