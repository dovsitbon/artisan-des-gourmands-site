import Image from "next/image";
import Link from "next/link";
import site from "@/data/site.json";
import { getDict, altOf, isLocale } from "@/lib/i18n";
import { isoDay } from "@/lib/format";
import { img } from "@/lib/media";
import { pagePath } from "@/lib/pages";
import { homeJsonLd } from "@/lib/jsonld";
import { tabs } from "@/lib/carte";
import { Reveal } from "@/components/Reveal";
import { OpenStatus } from "@/components/OpenStatus";
import { Rating } from "@/components/Rating";
import { ProductCard } from "@/components/ProductCard";
import { CarteTabs } from "@/components/CarteTabs";
import { Seasons } from "@/components/Seasons";
import { HoursTable } from "@/components/HoursTable";
import { EpiMark } from "@/components/Logo";
import { CakeIcon, CalendarIcon, CupIcon, PhoneIcon, PinIcon, WhiskIcon } from "@/components/icons";
import { Faq, SectionHead } from "@/components/Section";

// Les saisons et le bandeau se recalculent aussi côté navigateur ; la page est régénérée chaque jour.
export const revalidate = 86400;

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) return null;
  const d = getDict(lang);
  const order = pagePath("commander", lang);
  const carte = pagePath("carte", lang);
  const hero = img("/media/hero/boite-six-eclairs.jpg");

  const tiles = [
    { key: "eclairs", href: pagePath("eclairs", lang), src: "/media/eclairs/rangee-eclairs-chocolat.jpg" },
    { key: "patisseries", href: `${carte}#patisseries`, src: "/media/patisseries/tartelettes-fraises-tropezienne.jpg" },
    { key: "entremets", href: `${carte}#entremets`, src: "/media/patisseries/tartes-a-partager.jpg" },
    { key: "viennoiseries", href: `${carte}#viennoiseries`, src: "/media/viennoiseries/croissants-et-viennoises.jpg" },
    { key: "pains", href: `${carte}#pains`, src: "/media/pains/rayon-des-pains.jpg" },
    { key: "salon", href: `/${lang}#salon`, src: "/media/boutique/tarte-et-cappuccino.jpg" },
  ] as const;

  const services = [
    { key: "fresh", Icon: WhiskIcon },
    { key: "order", Icon: CakeIcon },
    { key: "salon", Icon: CupIcon },
    { key: "open", Icon: CalendarIcon },
  ] as const;

  const specials = ["anniversaire", "entremets", "pieceMontee", "galette", "bureaux"] as const;
  const facade = img("/media/facade/facade-rue-de-la-convention.jpg");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd(lang)) }} />

      {/* 1. Hero : la boîte d'éclairs en grand, deux boutons, la note Google et le statut juste dessous */}
      <section className="relative isolate flex min-h-[calc(100svh-4rem-3.5rem)] items-end overflow-hidden bg-ink md:min-h-[min(calc(100svh-5rem),56rem)]">
        <Image src={hero.src} alt={altOf(d, hero.src)} width={hero.width} height={hero.height} sizes="100vw" quality={80} priority fetchPriority="high" className="absolute inset-0 -z-10 h-full w-full object-cover object-[50%_40%]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(43,25,18,0.9)_0%,rgba(43,25,18,0.6)_42%,rgba(43,25,18,0.1)_75%)] md:bg-[linear-gradient(to_right,rgba(43,25,18,0.86)_0%,rgba(43,25,18,0.62)_40%,rgba(43,25,18,0.08)_72%)]" aria-hidden="true" />
        <div className="mx-auto w-full max-w-7xl px-6 pt-40 pb-10 text-cream md:px-10 md:pb-16">
          <p className="rise text-[0.6875rem] font-medium tracking-[0.26em] text-[#e9d3a6] uppercase">{d.hero.eyebrow}</p>
          <h1 className="display rise mt-4 max-w-3xl text-[3rem] leading-[0.98] md:text-[5rem] lg:text-[6rem]" style={{ animationDelay: "0.08s" }}>
            {d.hero.title}
          </h1>
          <p className="rise mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-cream/90" style={{ animationDelay: "0.16s" }}>
            {d.hero.sub}
          </p>
          <div className="rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: "0.24s" }}>
            <Link href={order} className="btn">
              {d.hero.ctaOrder}
            </Link>
            <Link href={carte} className="btn-line on-dark">
              {d.hero.ctaPatisseries}
            </Link>
          </div>
          <div className="rise mt-7 flex flex-col gap-2 text-[0.9375rem] text-cream/90 sm:flex-row sm:flex-wrap sm:gap-x-6" style={{ animationDelay: "0.32s" }}>
            <Rating lang={lang} d={d} />
            <OpenStatus />
          </div>
        </div>
      </section>

      {/* 2. Tuiles de catégories, en capitales sur photo */}
      <section aria-label={d.tiles.title} className="px-3 pt-3 md:px-6 md:pt-6">
        <h2 className="sr-only">{d.tiles.title}</h2>
        <ul className="mx-auto grid max-w-[90rem] grid-cols-2 gap-1.5 md:grid-cols-3 md:gap-3">
          {tiles.map((t, i) => {
            const p = img(t.src);
            return (
              <Reveal as="li" key={t.key} delay={(i % 3) * 0.06}>
                <Link href={t.href} className="group zoom relative block aspect-[4/5] bg-cream-deep sm:aspect-[4/3]">
                  <Image src={p.src} alt="" width={p.width} height={p.height} sizes="(min-width: 768px) 32vw, 50vw" quality={70} className="h-full w-full object-cover" />
                  <span className="absolute inset-0 bg-[linear-gradient(to_top,rgba(43,25,18,0.7),rgba(43,25,18,0)_55%)]" aria-hidden="true" />
                  <span className="caps absolute inset-x-0 bottom-0 px-3 pb-4 text-center text-[0.95rem] leading-tight text-cream md:pb-6 md:text-[1.35rem] md:tracking-[0.2em]">{d.tiles.items[t.key]}</span>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </section>

      {/* 3. Bande de services en 4 pictos */}
      <section aria-label={d.services.title} className="px-6 py-14 md:px-10 md:py-20">
        <h2 className="sr-only">{d.services.title}</h2>
        <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {services.map(({ key, Icon }) => (
            <li key={key} className="flex flex-col items-center text-center">
              <Icon className="h-9 w-9 text-caramel" />
              <h3 className="mt-4 text-[0.75rem] font-medium tracking-[0.14em] uppercase">{d.services.items[key].title}</h3>
              <p className="mt-2 max-w-[15rem] text-[0.9375rem] leading-relaxed text-muted">{d.services.items[key].text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 4. La carte, en onglets (aperçu : la page carte a tout) */}
      <section id="carte" className="border-t border-line px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <SectionHead eyebrow={d.carte.eyebrow} title={d.carte.title} />
            <Link href={carte} className="link-line shrink-0 self-start text-[0.75rem] font-medium tracking-[0.14em] uppercase md:self-auto">
              {d.nav.carte}
            </Link>
          </div>
          <div className="mt-10">
            <CarteTabs
              label={d.carte.tabsLabel}
              tabs={tabs.map((t) => ({
                id: t.id,
                label: d.carte.tabs[t.id],
                panel: (
                  <>
                    <ul className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
                      {t.items.slice(0, 4).map((id) => (
                        <li key={id}>
                          <ProductCard id={id} tab={t.id} lang={lang} d={d} />
                        </li>
                      ))}
                    </ul>
                    <Link href={`${carte}#${t.id}`} className="btn-line mt-8">
                      {d.carte.tabs[t.id]} · {d.nav.carte}
                    </Link>
                  </>
                ),
              }))}
            />
          </div>
        </div>
      </section>

      {/* 5. Trois blocs alternés : photo, texte court, un seul bouton */}
      <section className="bg-cream-deep">
        {[
          { id: "signature", src: "/media/eclairs/vitrine-eclairs-tartelettes.jpg", b: d.blocks.eclairs, href: pagePath("eclairs", lang), badge: d.blocks.eclairs.award, external: false },
          { id: "gateaux", src: "/media/patisseries/vitrine-patisseries.jpg", b: d.blocks.cakes, href: order, badge: "", external: false },
          { id: "salon", src: "/media/boutique/eclair-croissant-brioche-en-terrasse.jpg", b: d.blocks.salon, href: site.directionsUrl, badge: "", external: true },
        ].map((blk, i) => {
          const p = img(blk.src);
          return (
            <div key={blk.id} id={blk.id} className="mx-auto grid max-w-7xl items-center gap-8 px-6 py-14 md:grid-cols-2 md:gap-16 md:px-10 md:py-20">
              <Reveal className={`zoom relative aspect-[4/5] bg-cream md:aspect-[5/6] ${i % 2 ? "md:order-2" : ""}`}>
                <Image src={p.src} alt={altOf(d, p.src)} width={p.width} height={p.height} sizes="(min-width: 768px) 46vw, 100vw" quality={70} className="h-full w-full object-cover" />
                {blk.badge && (
                  <span className="absolute start-4 bottom-4 flex max-w-[16rem] items-center gap-3 bg-cream px-4 py-3 text-[0.8125rem] leading-snug font-medium">
                    <EpiMark className="h-9 w-auto shrink-0 text-gold" strokeWidth={2.2} />
                    {blk.badge}
                  </span>
                )}
              </Reveal>
              <Reveal delay={0.08} className={i % 2 ? "md:order-1" : ""}>
                <p className="eyebrow">{blk.b.eyebrow}</p>
                <h2 className="display mt-3 text-[2.2rem] md:text-[3rem]">{blk.b.title}</h2>
                <p className="lead mt-5 max-w-lg">{blk.b.text}</p>
                {blk.external ? (
                  <a href={blk.href} target="_blank" rel="noopener noreferrer" className="btn-line mt-8">
                    <PinIcon />
                    {blk.b.cta}
                  </a>
                ) : (
                  <Link href={blk.href} className={`${i === 1 ? "btn" : "btn-line"} mt-8`}>
                    {blk.b.cta}
                  </Link>
                )}
              </Reveal>
            </div>
          );
        })}
      </section>

      {/* 6. Commandes spéciales + saisons (data/saisons.json) */}
      <section id="commandes" className="px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHead eyebrow={d.special.eyebrow} title={d.special.title} intro={d.special.intro} />
          <ul className="mt-12 grid border-t border-line sm:grid-cols-2 lg:grid-cols-5">
            {specials.map((k, i) => (
              <Reveal as="li" key={k} delay={i * 0.05} className="border-b border-line py-6 sm:pe-6 lg:border-e lg:px-5 lg:first:ps-0 lg:last:border-e-0">
                <h3 className="display text-[1.5rem]">{d.special.items[k].title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{d.special.items[k].text}</p>
              </Reveal>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href={order} className="btn">
              {d.special.cta}
            </Link>
            <Link href={`${order}#entreprises`} className="btn-line">
              {d.special.ctaPro}
            </Link>
          </div>
          <div className="mt-14">
            <p className="eyebrow mb-5">{d.seasons.eyebrow}</p>
            <Seasons buildDay={isoDay(new Date())} />
          </div>
        </div>
      </section>

      {/* 7. Avis : aucune citation inventée */}
      <section id="avis" className="bg-ink px-6 py-16 text-cream md:px-10 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1fr_1fr] md:items-center">
          <Reveal>
            <p className="text-[0.6875rem] font-medium tracking-[0.26em] text-gold uppercase">{d.reviews.eyebrow}</p>
            <h2 className="display mt-3 text-[2.3rem] md:text-[3.2rem]">{d.reviews.title}</h2>
            <p className="mt-5 max-w-lg text-[1.0625rem] leading-relaxed text-cream/80">{d.reviews.intro}</p>
          </Reveal>
          <Reveal delay={0.08} className="md:justify-self-end">
            <p className="display text-[5rem] leading-none md:text-[6.5rem]">
              {new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-GB", { minimumFractionDigits: 1 }).format(site.rating.value)}
              <span className="text-[2rem] text-cream/60">/5</span>
            </p>
            <div className="mt-3">
              <Rating lang={lang} d={d} className="text-cream/85" />
            </div>
            <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-line on-dark mt-7">
              {d.reviews.link}
            </a>
          </Reveal>
          {/* À REMPLIR avec de vrais avis clients (avec leur accord) : 3 citations courtes, prénom + initiale, sans photo de visage */}
          {/* À REMPLIR avec de vrais avis clients */}
          {/* À REMPLIR avec de vrais avis clients */}
        </div>
      </section>

      {/* 8. Infos pratiques */}
      <section id="infos" className="px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHead eyebrow={d.infos.eyebrow} title={d.infos.title} />
          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1fr_1.15fr]">
            <Reveal className="zoom aspect-[4/3] bg-cream-deep lg:aspect-auto">
              <Image src={facade.src} alt={altOf(d, facade.src)} width={facade.width} height={facade.height} sizes="(min-width: 1024px) 30vw, 100vw" quality={75} className="h-full w-full object-cover" />
            </Reveal>
            <Reveal delay={0.05} className="space-y-7 text-[0.9375rem] leading-relaxed">
              <div>
                <p className="eyebrow mb-2">{d.infos.address}</p>
                <address className="text-lg not-italic">
                  {site.address.street}
                  <br />
                  {site.address.postalCode} {site.address.city}
                </address>
              </div>
              <div>
                <p className="eyebrow mb-2">{d.infos.access}</p>
                <p className="text-muted">{d.infos.accessText}</p>
              </div>
              <div>
                <p className="eyebrow mb-2">{d.infos.phone}</p>
                <a href={`tel:${site.phoneIntl}`} className="link-line text-lg tabular-nums">
                  {site.phone}
                </a>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href={site.directionsUrl} target="_blank" rel="noopener noreferrer" className="btn-line">
                  <PinIcon />
                  {d.infos.route}
                </a>
                <a href={`tel:${site.phoneIntl}`} className="btn-line">
                  <PhoneIcon />
                  {d.nav.call}
                </a>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="eyebrow mb-2">{d.infos.hours}</p>
              <HoursTable lang={lang} d={d} />
              <div className="mt-3 text-[0.9375rem] text-muted">
                <OpenStatus />
              </div>
            </Reveal>
          </div>
          <Reveal className="mt-10 h-80 bg-cream-deep md:h-96">
            <iframe title={d.infos.mapTitle} src={site.mapsEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-full w-full border-0 grayscale-[30%] sepia-[12%]" />
          </Reveal>
        </div>
      </section>

      {/* 9. FAQ */}
      <section id="faq" className="border-t border-line px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <SectionHead eyebrow={d.faq.eyebrow} title={d.faq.title} />
          <Reveal delay={0.05}>
            <Faq d={d} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
