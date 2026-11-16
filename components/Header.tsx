"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import site from "@/data/site.json";
import { Logo } from "@/components/Logo";
import { LangSwitch } from "@/components/LangSwitch";
import { CloseIcon, FacebookIcon, MenuIcon, PhoneIcon, PinIcon } from "@/components/icons";
import { useLocale } from "@/components/providers";
import { pagePath } from "@/lib/pages";

export function Header() {
  const { lang, d } = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    if (menu) lenis?.stop();
    else lenis?.start();
    document.body.style.overflow = menu ? "hidden" : "";
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  const home = `/${lang}`;
  const carte = pagePath("carte", lang);
  const order = pagePath("commander", lang);
  const links = [
    { href: `${carte}#patisseries`, label: d.nav.patisseries },
    { href: pagePath("eclairs", lang), label: d.nav.eclairs },
    { href: `${carte}#viennoiseries`, label: d.nav.pains },
    { href: order, label: d.nav.order },
    { href: `${home}#infos`, label: d.nav.infos },
  ];
  // Raccourcis du menu mobile : la carte, la commande, l'itinéraire
  const shortcuts = [
    { href: carte, label: d.nav.carte, external: false },
    { href: order, label: d.nav.order, external: false },
    { href: site.directionsUrl, label: d.nav.route, external: true },
  ];

  return (
    <>
      <header className={`sticky top-0 z-50 border-b bg-cream/95 backdrop-blur-sm transition-colors duration-500 ${scrolled ? "border-line" : "border-transparent"}`}>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-10 focus:bg-cream focus:px-4 focus:py-2">
          {d.nav.skip}
        </a>
        <div className="grid h-16 grid-cols-[2.75rem_1fr_2.75rem] items-center gap-2 px-3 md:h-20 md:grid-cols-[1fr_auto_1fr] md:px-8 xl:px-10">
          <div className="flex items-center">
            <button type="button" className="flex h-11 w-11 items-center justify-center xl:hidden" onClick={() => setMenu(true)} aria-label={d.nav.menu} aria-expanded={menu}>
              <MenuIcon />
            </button>
            <nav className="hidden items-center gap-5 xl:flex 2xl:gap-7" aria-label={d.nav.menu}>
              {links.map((l) => (
                <Link key={l.href} href={l.href} className="nav-link whitespace-nowrap transition-opacity duration-300 hover:opacity-60">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          <Link href={home} aria-label={d.nav.home} className="justify-self-center">
            <Logo compact />
          </Link>

          <div className="flex items-center justify-end gap-3 lg:gap-5">
            <LangSwitch lang={lang} label={d.nav.lang} className="hidden lg:flex" />
            <a href={`tel:${site.phoneIntl}`} className="hidden min-h-11 items-center gap-2 text-[0.8125rem] tracking-[0.04em] whitespace-nowrap tabular-nums hover:opacity-70 lg:flex" aria-label={`${d.nav.call} ${site.phone}`}>
              <PhoneIcon />
              <span className="hidden 2xl:inline">{site.phone}</span>
            </a>
            <a href={`tel:${site.phoneIntl}`} className="flex h-11 w-11 items-center justify-center lg:hidden" aria-label={`${d.nav.call} ${site.phone}`}>
              <PhoneIcon />
            </a>
            <Link href={order} className="btn hidden !min-h-11 !px-5 whitespace-nowrap md:inline-flex">
              {d.nav.orderCta}
            </Link>
          </div>
        </div>
      </header>

      {menu && (
        <div className="fade-in fixed inset-0 z-[60] flex flex-col overscroll-contain bg-cream text-ink" role="dialog" aria-modal="true" aria-label={d.nav.menu}>
          <div className="grid h-16 grid-cols-[2.75rem_1fr_2.75rem] items-center px-3 md:h-20 md:px-8">
            <button type="button" className="flex h-11 w-11 items-center justify-center" onClick={() => setMenu(false)} aria-label={d.nav.close}>
              <CloseIcon />
            </button>
            <span className="justify-self-center">
              <Logo compact />
            </span>
            <span />
          </div>
          <nav className="grid grid-cols-3 border-y border-line" aria-label={d.nav.shortcuts}>
            {shortcuts.map((s, i) => (
              <a
                key={s.href}
                href={s.href}
                {...(s.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                onClick={() => setMenu(false)}
                className={`flex min-h-16 items-center justify-center gap-2 text-[0.75rem] font-medium tracking-[0.14em] uppercase ${i ? "border-s border-line" : ""} ${i === 1 ? "bg-framboise-ink text-cream" : ""}`}
              >
                {s.external && <PinIcon className="h-4 w-4" />}
                {s.label}
              </a>
            ))}
          </nav>
          <nav className="flex flex-1 flex-col justify-center px-8" aria-label={d.nav.menu}>
            {links.map((l, i) => (
              <div key={l.href} className="rise border-b border-line/70 last:border-0" style={{ animationDelay: `${0.04 * i}s`, animationDuration: "0.5s" }}>
                <Link href={l.href} onClick={() => setMenu(false)} className="display block py-3 text-[2rem]">
                  {l.label}
                </Link>
              </div>
            ))}
          </nav>
          <div className="flex items-center justify-between border-t border-line px-5 py-3">
            <LangSwitch lang={lang} label={d.nav.lang} />
            <div className="flex items-center gap-2">
              <a href={`tel:${site.phoneIntl}`} className="link-line text-sm tabular-nums">
                {site.phone}
              </a>
              <a href={site.facebook} target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center hover:opacity-60" aria-label={d.nav.facebook}>
                <FacebookIcon />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** Barre fixée en bas de l'écran sur mobile : « Commander un gâteau » et « Itinéraire » toujours à portée de pouce. */
export function MobileOrderBar() {
  const { lang, d } = useLocale();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex gap-px border-t border-line bg-line pb-[env(safe-area-inset-bottom)] md:hidden">
      <Link href={pagePath("commander", lang)} className="btn flex-1 !min-h-14 !rounded-none">
        {d.nav.orderCta}
      </Link>
      <a href={site.directionsUrl} target="_blank" rel="noopener noreferrer" className="flex min-h-14 items-center justify-center gap-2 bg-cream px-5 text-[0.75rem] font-medium tracking-[0.14em] uppercase">
        <PinIcon className="h-4 w-4" />
        {d.nav.route}
      </a>
    </div>
  );
}
