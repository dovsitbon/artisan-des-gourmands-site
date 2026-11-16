import Link from "next/link";
import site from "@/data/site.json";
import { Logo } from "@/components/Logo";
import { HoursTable } from "@/components/HoursTable";
import { FacebookIcon, InstagramIcon } from "@/components/icons";
import type { Dict, Locale } from "@/lib/i18n";
import { pagePath } from "@/lib/pages";

const HEAD = "mb-4 text-[0.6875rem] font-medium tracking-[0.26em] text-gold uppercase";

export function Footer({ lang, d }: { lang: Locale; d: Dict }) {
  const links = [
    { href: pagePath("eclairs", lang), label: d.nav.eclairs },
    { href: pagePath("carte", lang), label: d.nav.carte },
    { href: pagePath("commander", lang), label: d.nav.orderCta },
    { href: pagePath("patisserie", lang), label: d.footer.seo },
    { href: pagePath("anniversaire", lang), label: d.footer.seo2 },
  ];
  return (
    <footer className="bg-ink pb-24 text-cream md:pb-0">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-2 md:px-10 md:py-20 lg:grid-cols-[1.3fr_1fr_1fr_1.1fr]">
        <div>
          <Logo light />
          <p className="mt-6 max-w-xs text-[0.9375rem] leading-relaxed text-cream/75">{d.footer.tagline}</p>
          <div className="mt-5 flex items-center gap-1">
            <a href={site.facebook} target="_blank" rel="noopener noreferrer" className="-ms-3 flex h-11 w-11 items-center justify-center transition-opacity hover:opacity-60" aria-label={d.nav.facebook}>
              <FacebookIcon />
            </a>
            {site.instagram && (
              <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center transition-opacity hover:opacity-60" aria-label={d.nav.instagram}>
                <InstagramIcon />
              </a>
            )}
          </div>
        </div>
        <div className="text-[0.9375rem] leading-relaxed">
          <p className={HEAD}>{d.footer.contact}</p>
          <address className="not-italic">
            {site.address.street}
            <br />
            {site.address.postalCode} {site.address.city}
          </address>
          <a href={`tel:${site.phoneIntl}`} className="link-line mt-4 inline-block tabular-nums">
            {site.phone}
          </a>
          <br />
          <a href={site.directionsUrl} target="_blank" rel="noopener noreferrer" className="link-line mt-3 inline-block">
            {d.nav.route}
          </a>
        </div>
        <nav aria-label={d.footer.nav} className="text-[0.9375rem]">
          <p className={HEAD}>{d.footer.nav}</p>
          <ul className="space-y-2.5 text-cream/80">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-cream">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className={HEAD}>{d.footer.hours}</p>
          <HoursTable lang={lang} d={d} compact dark />
        </div>
      </div>
      <div className="flex flex-col items-center justify-between gap-2 border-t border-cream/15 px-6 py-6 text-[0.8125rem] text-cream/70 sm:flex-row md:px-10">
        <p>
          © {new Date().getFullYear()} {site.name}. {d.footer.rights}
        </p>
        <Link href={pagePath("legal", lang)} className="hover:text-cream">
          {d.footer.legal}
        </Link>
      </div>
    </footer>
  );
}
