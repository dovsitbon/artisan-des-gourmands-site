import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import site from "@/data/site.json";
import { altOf, getDict, isLocale, locales, type Dict, type Locale } from "@/lib/i18n";
import { img } from "@/lib/media";
import { PAGE_IDS, pageOfSlug, pagePath, SLUGS, type PageId } from "@/lib/pages";
import { pageJsonLd } from "@/lib/jsonld";
import { items, tabs, type ProductId } from "@/lib/carte";
import { Reveal } from "@/components/Reveal";
import { OpenStatus } from "@/components/OpenStatus";
import { Rating } from "@/components/Rating";
import { ProductCard } from "@/components/ProductCard";
import { CarteTabs } from "@/components/CarteTabs";
import { OrderForm } from "@/components/OrderForm";
import { ProForm } from "@/components/ProForm";
import { HoursTable } from "@/components/HoursTable";
import { Faq, SectionHead } from "@/components/Section";
import { EpiMark } from "@/components/Logo";
import { PhoneIcon, PinIcon } from "@/components/icons";

export function generateStaticParams() {
  return locales.flatMap((lang) => PAGE_IDS.map((id) => ({ lang, slug: SLUGS[id][lang] })));
}
export const dynamicParams = false;

function resolve(lang: string, slug: string): { lang: Locale; id: PageId } | null {
  if (!isLocale(lang)) return null;
  const id = pageOfSlug(slug, lang);
  return id ? { lang, id } : null;
}

const titleOf = (d: Dict, id: PageId) => d.pages[id].metaTitle.split(" | ")[0];

export async function generateMetadata({ params }: PageProps<"/[lang]/[slug]">): Promise<Metadata> {
  const { lang: l, slug } = await params;
  const r = resolve(l, slug);
  if (!r) return {};
  const d = getDict(r.lang);
  const p = d.pages[r.id];
  const description = "metaDescription" in p ? p.metaDescription : d.meta.description;
  return {
    title: p.metaTitle,
    description,
    alternates: {
      canonical: pagePath(r.id, r.lang),
      languages: { ...Object.fromEntries(locales.map((x) => [x, pagePath(r.id, x)])), "x-default": pagePath(r.id, "fr") },
    },
    openGraph: { title: p.metaTitle, description, url: pagePath(r.id, r.lang), images: [{ url: "/og.jpg", width: 1200, height: 630, alt: d.meta.ogAlt }] },
    robots: r.id === "legal" ? { index: false, follow: true } : undefined,
  };
}

/** En-tête de page : texte à gauche, photo à droite (ou emplacement), sur mobile la photo passe dessous. */
function PageHero({ eyebrow, title, lead, src, d, children }: { eyebrow: string; title: string; lead: string; src: string; d: Dict; children?: React.ReactNode }) {
  const p = img(src);
  return (
    <header className="grid md:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 md:px-12 md:py-16 lg:px-20">
        <p className="eyebrow rise">{eyebrow}</p>
        <h1 className="display rise mt-4 text-[2.7rem] md:text-[3.8rem]" style={{ animationDelay: "0.08s" }}>
          {title}
        </h1>
        <p className="lead rise mt-5 max-w-lg" style={{ animationDelay: "0.16s" }}>
          {lead}
        </p>
        {children && (
          <div className="rise mt-8" style={{ animationDelay: "0.24s" }}>
            {children}
          </div>
        )}
      </div>
      <div className="h-[44svh] bg-cream-deep md:h-[70svh]">
        <Image src={p.src} alt={altOf(d, p.src)} width={p.width} height={p.height} sizes="(min-width: 768px) 50vw, 100vw" quality={80} priority fetchPriority="high" className="h-full w-full object-cover" />
      </div>
    </header>
  );
}

function Cards({ ids, lang, d }: { ids: ProductId[]; lang: Locale; d: Dict }) {
  return (
    <ul className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
      {ids.map((id) => (
        <li key={id}>
          <ProductCard id={id} tab={tabs.find((t) => t.items.includes(id))!.id} lang={lang} d={d} />
        </li>
      ))}
    </ul>
  );
}

function Eclairs({ lang, d }: { lang: Locale; d: Dict }) {
  const p = d.pages.eclairs;
  const cut = img("/media/eclairs/eclair-chocolat-coupe.jpg");
  const board = img("/media/eclairs/ardoise-eclairs-de-folie.jpg");
  const box = img("/media/eclairs/six-eclairs-assortis.jpg");
  const order = `${pagePath("commander", lang)}?add=boiteEclairs`;
  return (
    <article>
      <PageHero eyebrow={p.eyebrow} title={p.title} lead={p.lead} src="/media/hero/boite-six-eclairs.jpg" d={d}>
        <Link href={order} className="btn">
          {p.boxCta}
        </Link>
      </PageHero>

      {/* Le prix : la source est citée */}
      <section className="bg-ink px-6 py-14 text-cream md:px-10 md:py-20">
        <Reveal className="mx-auto flex max-w-4xl flex-col items-start gap-6 md:flex-row md:items-center md:gap-10">
          <EpiMark className="h-20 w-auto shrink-0 text-gold" strokeWidth={1.4} />
          <div>
            <h2 className="display text-[2rem] md:text-[2.6rem]">{p.awardTitle}</h2>
            <p className="mt-4 text-[1.0625rem] leading-relaxed text-cream/85">{p.awardText}</p>
            <a href={site.award.source} target="_blank" rel="noopener noreferrer" className="link-line mt-5 inline-block text-[0.875rem] text-cream/80">
              {p.awardSource}
            </a>
          </div>
        </Reveal>
      </section>

      <section className="px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2 md:gap-16">
          <Reveal className="zoom aspect-[4/5] bg-cream-deep">
            <Image src={cut.src} alt={altOf(d, cut.src)} width={cut.width} height={cut.height} sizes="(min-width: 768px) 46vw, 100vw" quality={70} className="h-full w-full object-cover" />
          </Reveal>
          <div>
            <SectionHead eyebrow={p.eyebrow} title={p.howTitle} />
            <ol className="mt-8 space-y-6">
              {p.how.map((h, i) => (
                <Reveal as="li" key={h.title} delay={i * 0.06} className="grid grid-cols-[2.5rem_1fr] border-t border-line pt-5">
                  <span className="display text-[1.6rem] text-caramel">{i + 1}</span>
                  <div>
                    <h3 className="display text-[1.5rem]">{h.title}</h3>
                    <p className="mt-1 leading-relaxed text-muted">{h.text}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="bg-cream-deep px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[1.1fr_0.9fr] md:gap-16">
          <div>
            <SectionHead eyebrow={p.eyebrow} title={p.flavorsTitle} />
            <dl className="mt-8 grid gap-6 sm:grid-cols-2">
              <Reveal className="border-t-2 border-ink pt-4">
                <dt className="eyebrow">{p.flavorsAll}</dt>
                <dd className="display mt-2 text-[1.5rem] leading-snug">{p.flavorsAllList}</dd>
              </Reveal>
              <Reveal delay={0.06} className="border-t-2 border-gold pt-4">
                <dt className="eyebrow">{p.flavorsMoment}</dt>
                <dd className="display mt-2 text-[1.5rem] leading-snug">{p.flavorsMomentList}</dd>
              </Reveal>
            </dl>
            <Reveal className="mt-12 border-t border-line pt-8">
              <h2 className="display text-[2rem]">{p.folieTitle}</h2>
              <p className="lead mt-3">{p.folieText}</p>
            </Reveal>
          </div>
          <Reveal delay={0.08} className="zoom aspect-[3/4] bg-cream">
            <Image src={board.src} alt={altOf(d, board.src)} width={board.width} height={board.height} sizes="(min-width: 768px) 40vw, 100vw" quality={70} className="h-full w-full object-cover" />
          </Reveal>
        </div>
      </section>

      <section className="px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-10 border border-line bg-paper md:grid-cols-2">
            <div className="zoom aspect-[4/3] bg-cream-deep md:h-full">
              <Image src={box.src} alt={altOf(d, box.src)} width={box.width} height={box.height} sizes="(min-width: 768px) 46vw, 100vw" quality={70} className="h-full w-full object-cover" />
            </div>
            <div className="p-6 md:p-10">
              <h2 className="display text-[2.2rem]">{p.boxTitle}</h2>
              <p className="lead mt-4">{p.boxText}</p>
              <Link href={order} className="btn mt-8">
                {p.boxCta}
              </Link>
            </div>
          </div>
          <h2 className="display mt-16 text-[2rem]">{p.cardsTitle}</h2>
          <div className="mt-6">
            <Cards ids={tabs.find((t) => t.id === "eclairs")!.items} lang={lang} d={d} />
          </div>
        </div>
      </section>
    </article>
  );
}

function Carte({ lang, d }: { lang: Locale; d: Dict }) {
  return (
    <div className="px-6 pt-12 pb-20 md:px-10 md:pt-16 md:pb-28">
      <div className="mx-auto max-w-7xl">
        <SectionHead as="h1" eyebrow={d.carte.eyebrow} title={d.carte.title} intro={d.carte.intro} />
        <div className="mt-10">
          <CarteTabs
            label={d.carte.tabsLabel}
            tabs={tabs.map((t) => ({
              id: t.id,
              label: d.carte.tabs[t.id],
              panel: (
                <>
                  <h2 className="sr-only">{d.carte.tabs[t.id]}</h2>
                  <ul className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
                    {t.items.map((id) => (
                      <li key={id}>
                        <ProductCard id={id} tab={t.id} lang={lang} d={d} />
                      </li>
                    ))}
                  </ul>
                </>
              ),
            }))}
          />
        </div>
        <div className="mt-14 flex flex-col items-start gap-5 border-t border-line pt-8 md:flex-row md:items-center md:justify-between">
          <p className="max-w-xl text-[0.9375rem] leading-relaxed text-muted">{d.carte.orderNote}</p>
          <Link href={pagePath("commander", lang)} className="btn shrink-0">
            {d.carte.toOrder}
          </Link>
        </div>
      </div>
    </div>
  );
}

function Commander({ lang, d }: { lang: Locale; d: Dict }) {
  const t = d.order;
  return (
    <>
      <section id="gateau" className="scroll-mt-24 px-6 pt-12 pb-16 md:px-10 md:pt-16 md:pb-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          <aside>
            <SectionHead as="h1" eyebrow={t.eyebrow} title={t.title} intro={t.intro} />
            <Reveal delay={0.08} className="mt-8 border-t border-line pt-6">
              <p className="display text-[1.5rem]">{t.callTitle}</p>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{t.callText}</p>
              <a href={`tel:${site.phoneIntl}`} className="btn-line mt-5">
                <PhoneIcon />
                {d.nav.call} · {site.phone}
              </a>
              <div className="mt-5 space-y-2 text-[0.9375rem] text-muted">
                <OpenStatus />
                <Rating lang={lang} d={d} />
              </div>
            </Reveal>
            <Reveal delay={0.1} className="mt-8 hidden border-t border-line pt-6 lg:block">
              <p className="eyebrow mb-2">{d.infos.hours}</p>
              <HoursTable lang={lang} d={d} compact />
            </Reveal>
          </aside>
          <Reveal delay={0.04}>
            <OrderForm />
          </Reveal>
        </div>
      </section>
      <section id="entreprises" className="scroll-mt-24 bg-cream-deep px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          <div>
            <SectionHead eyebrow={d.pro.eyebrow} title={d.pro.title} intro={d.pro.intro} />
          </div>
          <Reveal delay={0.04}>
            <ProForm />
          </Reveal>
        </div>
      </section>
      <section className="px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <SectionHead eyebrow={d.faq.eyebrow} title={d.faq.title} />
          <Faq d={d} />
        </div>
      </section>
    </>
  );
}

function Patisserie({ lang, d }: { lang: Locale; d: Dict }) {
  const p = d.pages.patisserie;
  const ids = (["eclairChocolat", "tarteFraises", "tropezienne", "bourbon", "alpes", "tarteCitron", "saintHonore", "flan"] as ProductId[]).filter((id) => items[id]);
  return (
    <article>
      <PageHero eyebrow={p.eyebrow} title={p.title} lead={p.lead} src="/media/patisseries/vitrine-patisseries.jpg" d={d}>
        <Link href={pagePath("carte", lang)} className="btn">
          {p.cta}
        </Link>
      </PageHero>
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        {p.sections.map((s) => (
          <Reveal key={s.title} className="mb-12 last:mb-0">
            <h2 className="display text-[2rem] md:text-[2.4rem]">{s.title}</h2>
            <p className="lead mt-3">{s.text}</p>
          </Reveal>
        ))}
      </div>
      <section className="bg-cream-deep px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Cards ids={ids} lang={lang} d={d} />
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href={pagePath("commander", lang)} className="btn">
              {d.nav.orderCta}
            </Link>
            <a href={site.directionsUrl} target="_blank" rel="noopener noreferrer" className="btn-line">
              <PinIcon />
              {d.nav.route}
            </a>
          </div>
        </div>
      </section>
    </article>
  );
}

function Anniversaire({ lang, d }: { lang: Locale; d: Dict }) {
  const p = d.pages.anniversaire;
  const order = `${pagePath("commander", lang)}?add=gateauAnniversaire`;
  return (
    <article>
      <PageHero eyebrow={p.eyebrow} title={p.title} lead={p.lead} src="/media/patisseries/entremets-individuels.jpg" d={d}>
        <Link href={order} className="btn">
          {p.cta}
        </Link>
      </PageHero>
      <section className="px-6 py-16 md:px-10 md:py-24">
        <ol className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          {p.steps.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 0.06} className="border-t-2 border-ink pt-5">
              <span className="display text-[2.4rem] text-caramel">{i + 1}</span>
              <h2 className="display mt-1 text-[1.7rem]">{s.title}</h2>
              <p className="mt-2 leading-relaxed text-muted">{s.text}</p>
            </Reveal>
          ))}
        </ol>
        <p className="mx-auto mt-10 max-w-7xl text-[0.9375rem] text-muted">{p.note}</p>
      </section>
      <section className="bg-cream-deep px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Cards ids={tabs.find((t) => t.id === "entremets")!.items} lang={lang} d={d} />
          <Link href={order} className="btn mt-10">
            {p.cta}
          </Link>
        </div>
      </section>
    </article>
  );
}

function Legal({ d }: { d: Dict }) {
  const p = d.pages.legal;
  const blank = (v: string) => v || `[${p.toFill}]`;
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <h1 className="display text-[2.6rem]">{p.title}</h1>
      <h2 className="eyebrow mt-10">{p.editor}</h2>
      <p className="mt-3 leading-relaxed text-muted">
        {site.legal.company || site.name}
        <br />
        {site.address.street}, {site.address.postalCode} {site.address.city}
        <br />
        {site.phone}
        <br />
        {p.siret} : {blank(site.legal.siret)}
        <br />
        {p.director} : {blank(site.legal.director)}
      </p>
      <h2 className="eyebrow mt-8">{p.host}</h2>
      <p className="mt-3 leading-relaxed text-muted">{site.legal.host}</p>
      <h2 className="eyebrow mt-8">{p.data}</h2>
      <p className="mt-3 leading-relaxed text-muted">{p.dataText}</p>
      <h2 className="eyebrow mt-8">{p.credits}</h2>
      <p className="mt-3 leading-relaxed text-muted">{p.creditsText}</p>
    </div>
  );
}

export default async function Page({ params }: PageProps<"/[lang]/[slug]">) {
  const { lang: l, slug } = await params;
  const r = resolve(l, slug);
  if (!r) notFound();
  const { lang, id } = r;
  const d = getDict(lang);
  const body =
    id === "eclairs" ? <Eclairs lang={lang} d={d} /> : id === "carte" ? <Carte lang={lang} d={d} /> : id === "commander" ? <Commander lang={lang} d={d} /> : id === "patisserie" ? <Patisserie lang={lang} d={d} /> : id === "anniversaire" ? <Anniversaire lang={lang} d={d} /> : <Legal d={d} />;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd(lang, id, titleOf(d, id))) }} />
      {body}
    </>
  );
}
