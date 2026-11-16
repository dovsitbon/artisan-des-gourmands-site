import site from "@/data/site.json";
import { getDict, locales, type Locale } from "@/lib/i18n";
import { weekHours } from "@/lib/hours";
import { pagePath, type PageId } from "@/lib/pages";
import { items, tabs } from "@/lib/carte";

const BUSINESS = `${site.url}/#bakery`;
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function business(lang: Locale) {
  const d = getDict(lang);
  return {
    "@type": "Bakery",
    "@id": BUSINESS,
    name: site.name,
    alternateName: ["L'Artisan Des Gourmands Paris 15", "Boulangerie L'Artisan des Gourmands"],
    description: d.meta.description,
    url: `${site.url}/${lang}`,
    image: [`${site.url}/og.jpg`, `${site.url}/media/hero/boite-six-eclairs.jpg`, `${site.url}/media/facade/facade-rue-de-la-convention.jpg`],
    logo: `${site.url}/logo.svg`,
    telephone: site.phoneIntl,
    priceRange: "1 € – 10 €",
    currenciesAccepted: "EUR",
    servesCuisine: ["Boulangerie", "Pâtisserie française", "Viennoiseries"],
    address: { "@type": "PostalAddress", streetAddress: site.address.street, postalCode: site.address.postalCode, addressLocality: site.address.city, addressRegion: site.address.region, addressCountry: site.address.country },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    hasMap: site.mapsUrl,
    openingHoursSpecification: weekHours().flatMap((slots, i) => slots.map(([opens, closes]) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: `https://schema.org/${DAYS[i]}`, opens, closes }))),
    // Note Google relevée à la main le jour indiqué (data/site.json → rating.checked) : à mettre à jour de temps en temps
    aggregateRating: { "@type": "AggregateRating", ratingValue: site.rating.value, reviewCount: site.rating.count, bestRating: 5, worstRating: 1, description: `Google, ${site.rating.checked}` },
    award: `${d.pages.eclairs.awardTitle} (Fédération des pâtissiers d'Île-de-France)`,
    employee: { "@type": "Person", name: site.award.chef, jobTitle: lang === "fr" ? "Pâtissier" : "Pastry chef" },
    sameAs: [site.facebook, site.instagram].filter(Boolean),
    knowsLanguage: ["fr", "en"],
    hasMenu: `${site.url}${pagePath("carte", lang)}`,
    potentialAction: { "@type": "OrderAction", target: `${site.url}${pagePath("commander", lang)}` },
  };
}

/** Données structurées de l'accueil : Bakery (horaires, note Google datée, prix), site web, FAQ. */
export function homeJsonLd(lang: Locale) {
  const d = getDict(lang);
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", "@id": `${site.url}/#website`, url: site.url, name: site.name, inLanguage: [...locales], publisher: { "@id": BUSINESS } },
      business(lang),
      { "@type": "FAQPage", mainEntity: d.faq.items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  };
}

function menu(lang: Locale, url: string) {
  const d = getDict(lang);
  return {
    "@type": "Menu",
    "@id": `${url}#menu`,
    name: d.pages.carte.metaTitle.split(" | ")[0],
    inLanguage: lang,
    hasMenuSection: tabs.map((t) => ({
      "@type": "MenuSection",
      name: d.carte.tabs[t.id],
      hasMenuItem: t.items.map((id) => {
        const p = items[id];
        return { "@type": "MenuItem", name: d.products[id].name, description: d.products[id].desc, ...(p.price !== null ? { offers: { "@type": "Offer", price: p.price.toFixed(2), priceCurrency: "EUR" } } : {}) };
      }),
    })),
  };
}

/** Données structurées d'une page secondaire, avec le fil d'Ariane. */
export function pageJsonLd(lang: Locale, id: PageId, title: string) {
  const d = getDict(lang);
  const url = `${site.url}${pagePath(id, lang)}`;
  const main =
    id === "carte"
      ? menu(lang, url)
      : id === "eclairs"
        ? {
            "@type": "Article",
            "@id": `${url}#article`,
            headline: d.pages.eclairs.title,
            description: d.pages.eclairs.metaDescription,
            inLanguage: lang,
            image: `${site.url}/media/hero/boite-six-eclairs.jpg`,
            author: { "@id": BUSINESS },
            publisher: { "@id": BUSINESS },
            mainEntityOfPage: url,
            citation: site.award.source,
          }
        : id === "legal"
          ? null
          : { "@type": "WebPage", "@id": `${url}#page`, name: title, inLanguage: lang, about: { "@id": BUSINESS } };
  return {
    "@context": "https://schema.org",
    "@graph": [
      business(lang),
      ...(main ? [main] : []),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: site.name, item: `${site.url}/${lang}` },
          { "@type": "ListItem", position: 2, name: title, item: url },
        ],
      },
    ],
  };
}
