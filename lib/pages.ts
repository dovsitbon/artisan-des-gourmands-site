import type { Locale } from "@/lib/locales";

// Pages secondaires et leurs adresses dans chaque langue (doivent correspondre à locales/*.json → pages.<id>.slug).
export const PAGE_IDS = ["eclairs", "carte", "commander", "patisserie", "anniversaire", "legal"] as const;
export type PageId = (typeof PAGE_IDS)[number];

export const SLUGS: Record<PageId, Record<Locale, string>> = {
  eclairs: { fr: "eclairs", en: "eclairs" },
  carte: { fr: "carte", en: "menu" },
  commander: { fr: "commander", en: "order" },
  patisserie: { fr: "patisserie-paris-15", en: "pastry-shop-paris-15" },
  anniversaire: { fr: "gateau-anniversaire-paris-15", en: "birthday-cake-paris-15" },
  legal: { fr: "mentions-legales", en: "legal" },
};

export const pagePath = (id: PageId, lang: Locale) => `/${lang}/${SLUGS[id][lang]}`;

export const pageOfSlug = (slug: string, lang: Locale) => PAGE_IDS.find((id) => SLUGS[id][lang] === slug) ?? null;
