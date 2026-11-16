"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { LazyMotion, domAnimation, m } from "motion/react";

type Tab = { id: string; label: string; panel: ReactNode };

/**
 * Une seule page carte, des onglets (toute la carte reste dans le HTML pour Google, les panneaux inactifs sont masqués).
 * #viennoiseries, #pains… dans l'adresse ouvrent directement le bon onglet. Clavier : flèches gauche / droite.
 */
export function CarteTabs({ tabs, label }: { tabs: Tab[]; label: string }) {
  const [active, setActive] = useState(tabs[0].id);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const fromHash = () => {
      const h = decodeURIComponent(location.hash.slice(1));
      if (tabs.some((t) => t.id === h)) setActive(h);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [tabs]);

  const select = (id: string, focus = false) => {
    setActive(id);
    history.replaceState(null, "", `#${id}`);
    if (focus) refs.current[id]?.focus();
    refs.current[id]?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  };

  const onKey = (e: KeyboardEvent) => {
    const i = tabs.findIndex((t) => t.id === active);
    const dir = getComputedStyle(e.currentTarget).direction === "rtl" ? -1 : 1;
    if (e.key === "ArrowRight") select(tabs[(i + dir + tabs.length) % tabs.length].id, true);
    else if (e.key === "ArrowLeft") select(tabs[(i - dir + tabs.length) % tabs.length].id, true);
    else if (e.key === "Home") select(tabs[0].id, true);
    else if (e.key === "End") select(tabs[tabs.length - 1].id, true);
    else return;
    e.preventDefault();
  };

  return (
    <LazyMotion features={domAnimation}>
      <div className="sticky top-16 z-30 -mx-6 border-b border-line bg-cream/95 px-6 backdrop-blur-sm md:top-20 md:mx-0 md:px-0">
        <div role="tablist" aria-label={label} onKeyDown={onKey} className="tabs-scroll flex gap-1 overflow-x-auto">
          {tabs.map((t) => {
            const on = t.id === active;
            return (
              <button
                key={t.id}
                ref={(el) => {
                  refs.current[t.id] = el;
                }}
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={on}
                aria-controls={`panel-${t.id}`}
                tabIndex={on ? 0 : -1}
                onClick={() => select(t.id)}
                className={`relative min-h-12 shrink-0 px-3 text-[0.75rem] font-medium tracking-[0.14em] whitespace-nowrap uppercase transition-colors md:px-5 ${on ? "text-ink" : "text-muted hover:text-ink"}`}
              >
                {t.label}
                {on && <m.span layoutId="tab-underline" className="absolute inset-x-3 bottom-0 h-[2px] bg-framboise-ink md:inset-x-5" transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }} />}
              </button>
            );
          })}
        </div>
      </div>
      {tabs.map((t) => (
        <div key={t.id} role="tabpanel" id={`panel-${t.id}`} aria-labelledby={`tab-${t.id}`} hidden={t.id !== active} tabIndex={0} className="pt-10 focus-visible:outline-none">
          {t.panel}
        </div>
      ))}
    </LazyMotion>
  );
}
