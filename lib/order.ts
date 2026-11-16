import site from "@/data/site.json";
import type { Dict } from "@/lib/i18n";
import type { Locale } from "@/lib/locales";
import { formatDay, formatTime, isoDay } from "@/lib/format";
import { addDays, isOpenDay, slotsOn } from "@/lib/hours";
import { isOrderable, items, type ProductId } from "@/lib/carte";

export const PARTS = [4, 6, 8, 10, 12, 15, 20, 25, 30] as const;
export const WANTS = ["minis", "viennoiseries", "eclairs", "patisseries", "sandwichs", "gateau"] as const;
export type Want = (typeof WANTS)[number];

export type LineProduct = ProductId | "other";
export type OrderLine = { product: LineProduct; parts: number; inscription: string; detail: string; qty: number };
export type CakeOrder = { lines: OrderLine[]; date: string; time: string; name: string; phone: string; email: string; message: string };
export type ProRequest = { date: string; people: number; wants: Want[]; company: string; name: string; phone: string; email: string; message: string };

/** Un gâteau se commande en parts, une boîte ou un plateau en quantité. */
export const kindOf = (p: LineProduct) => (p === "other" ? "cake" : (items[p].order ?? "cake"));

export const emptyLine = (product: LineProduct = "gateauAnniversaire", qty = 1): OrderLine => ({
  product,
  parts: kindOf(product) === "cake" ? 8 : 0,
  inscription: "",
  detail: "",
  qty: kindOf(product) === "box" && product === "plateauMinis" ? Math.max(qty, 20) : qty,
});

export const isPhone = (v: string) => /^[+\d][\d\s\-().]{7,19}$/.test(v.trim());
export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

/** Premier jour de retrait possible : délai de commande (data/site.json → order.leadHours), puis premier jour ouvert. */
export function earliestPickup(now: Date) {
  let day = isoDay(new Date(now.getTime() + site.order.leadHours * 3600_000));
  for (let i = 0; i < 21 && !isOpenDay(day); i++) day = addDays(day, 1);
  return day;
}

/** Heures de retrait proposées un jour donné : toutes les 30 min, d'une heure après l'ouverture à 30 min avant la fermeture. */
export function pickupTimes(day: string) {
  const out: string[] = [];
  for (const [a, b] of slotsOn(day)) {
    const toMin = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3));
    for (let m = toMin(a) + 60; m <= toMin(b) - 30; m += 30) out.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
  }
  return out;
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Nettoie une commande de gâteau reçue côté serveur : null si elle est incomplète. */
export function parseCakeOrder(v: unknown): CakeOrder | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const lines = (Array.isArray(o.lines) ? o.lines : []).slice(0, 12).flatMap((l): OrderLine[] => {
    if (!l || typeof l !== "object") return [];
    const x = l as Record<string, unknown>;
    const product: LineProduct | null = x.product === "other" ? "other" : typeof x.product === "string" && isOrderable(x.product) ? x.product : null;
    if (!product) return [];
    const qty = Math.min(Math.max(Math.round(Number(x.qty) || 1), 1), site.order.maxPerLine * (product === "plateauMinis" ? 10 : 1));
    const parts = (PARTS as readonly number[]).includes(Number(x.parts)) ? Number(x.parts) : 0;
    const line = { product, parts: kindOf(product) === "cake" ? parts || 8 : 0, inscription: str(x.inscription, 40), detail: str(x.detail, 400), qty };
    return product === "other" && !line.detail ? [] : [line];
  });
  const date = str(o.date, 10);
  const time = str(o.time, 5);
  const q: CakeOrder = { lines, date: ISO.test(date) ? date : "", time: /^\d{2}:\d{2}$/.test(time) ? time : "", name: str(o.name, 120), phone: str(o.phone, 30), email: str(o.email, 160), message: str(o.message, 1500) };
  if (!q.lines.length || !q.date || !isOpenDay(q.date) || !pickupTimes(q.date).includes(q.time) || !q.name || !isPhone(q.phone)) return null;
  if (q.email && !isEmail(q.email)) q.email = "";
  return q;
}

/** Nettoie une demande de plateau entreprise. */
export function parseProRequest(v: unknown): ProRequest | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const date = str(o.date, 10);
  const q: ProRequest = {
    date: ISO.test(date) ? date : "",
    people: Math.min(Math.max(Math.round(Number(o.people) || 0), 0), 2000),
    wants: (Array.isArray(o.wants) ? o.wants : []).filter((w): w is Want => (WANTS as readonly string[]).includes(String(w))),
    company: str(o.company, 160),
    name: str(o.name, 120),
    phone: str(o.phone, 30),
    email: str(o.email, 160),
    message: str(o.message, 1500),
  };
  if (!q.date || q.people < 1 || !q.wants.length || !q.name || !isPhone(q.phone)) return null;
  if (q.email && !isEmail(q.email)) q.email = "";
  return q;
}

/** Une ligne en clair : « 1 × Gâteau d'anniversaire (8 parts, inscription « Joyeux anniversaire Léa ») ». */
export function lineLabel(l: OrderLine, d: Dict) {
  const name = l.product === "other" ? d.order.other.replace(/\s*\(.*\)$/, "") : d.products[l.product].name;
  const extra = [l.parts ? d.order.partsValue.replace("{n}", String(l.parts)) : "", l.inscription ? `${d.order.mail.inscription} « ${l.inscription} »` : ""].filter(Boolean).join(", ");
  const base = `${l.qty} × ${name}${extra ? ` (${extra})` : ""}`;
  return l.detail ? `${base} : ${l.detail}` : base;
}

const colon = (lang: Locale) => (lang === "fr" ? " :" : ":");
const longDay = (iso: string, lang: Locale) => formatDay(iso, lang, { weekday: "long", day: "numeric", month: "long", year: "numeric" });

/** Récapitulatif texte d'une commande de gâteau (e-mails, WhatsApp, écran de confirmation). */
export function cakeText(q: CakeOrder, lang: Locale, d: Dict, withContact = true) {
  const m = d.order.mail;
  const c = colon(lang);
  return [
    [`${m.lines}${c}`, ...q.lines.map((l) => `– ${lineLabel(l, d)}`)].join("\n"),
    `${m.pickup}${c} ${longDay(q.date, lang)}, ${formatTime(q.time, lang)}`,
    withContact ? [`${m.name}${c} ${q.name}`, `${m.phone}${c} ${q.phone}`, q.email ? `${m.email}${c} ${q.email}` : ""].filter(Boolean).join("\n") : "",
    q.message ? `${m.message}${c}\n${q.message}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

/** Récapitulatif texte d'une demande de plateau entreprise. */
export function proText(q: ProRequest, lang: Locale, d: Dict, withContact = true) {
  const m = d.order.mail;
  const p = d.pro.mail;
  const c = colon(lang);
  return [
    [`${d.pro.date}${c} ${longDay(q.date, lang)}`, `${p.people}${c} ${q.people}`, `${p.wants}${c} ${q.wants.map((w) => d.pro.wantsItems[w]).join(", ")}`].join("\n"),
    withContact ? [q.company ? `${p.company}${c} ${q.company}` : "", `${m.name}${c} ${q.name}`, `${m.phone}${c} ${q.phone}`, q.email ? `${m.email}${c} ${q.email}` : ""].filter(Boolean).join("\n") : "",
    q.message ? `${m.message}${c}\n${q.message}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

/** Lien WhatsApp (vide tant que la boutique n'a pas donné de portable : data/site.json → whatsapp). */
export const waLink = (text: string) => (site.whatsapp ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}` : "");
