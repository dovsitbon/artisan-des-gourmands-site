"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import site from "@/data/site.json";
import { CheckIcon, CloseIcon, PhoneIcon, PlusIcon, WhatsAppIcon } from "@/components/icons";
import { useLocale } from "@/components/providers";
import { fill } from "@/lib/i18n";
import { formatDay, formatTime } from "@/lib/format";
import { addDays, isOpenDay } from "@/lib/hours";
import { isOrderable, ORDERABLE } from "@/lib/carte";
import { CART_EVENT, clearCart, readCart, writeCart } from "@/lib/cart";
import { cakeText, earliestPickup, emptyLine, isEmail, isPhone, kindOf, PARTS, pickupTimes, waLink, type CakeOrder, type LineProduct, type OrderLine } from "@/lib/order";

type Errors = Partial<Record<"lines" | "date" | "time" | "name" | "phone" | "email" | "send", string>>;
type Sent = { notified: boolean; confirmed: boolean; text: string; email: string };

/** Lignes de commande à partir de la sélection faite sur la carte (« Ajouter »). */
const fromCart = () => readCart().map((l) => emptyLine(l.id, l.qty));

/**
 * Commande de gâteau à retirer : gâteau(x) + parts + inscription, date et heure de retrait (jours d'ouverture, après 48 h),
 * coordonnées, remarques (allergies). Envoi par e-mail (Resend) ; si l'envoi automatique n'est pas configuré, le client est invité à appeler.
 */
export function OrderForm() {
  const { lang, d } = useLocale();
  const t = d.order;
  const [lines, setLines] = useState<OrderLine[]>([emptyLine()]);
  const synced = useRef(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<Sent | null>(null);
  const [now, setNow] = useState<Date | null>(null);

  // Jours de retrait possibles : seulement les jours d'ouverture, après le délai de commande
  const days = useMemo(() => {
    if (!now) return [];
    const first = earliestPickup(now);
    return Array.from({ length: 70 }, (_, i) => addDays(first, i)).filter(isOpenDay);
  }, [now]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- valeur propre au navigateur (date, stockage), lue après l'hydratation
    setNow(new Date());
    // ?add=galette : un produit demandé depuis une autre page (saisons, pages SEO)
    const add = new URLSearchParams(location.search).get("add");
    if (add && isOrderable(add) && !readCart().some((l) => l.id === add)) writeCart([...readCart(), { id: add, qty: 1 }]);
    const cart = fromCart();
    if (cart.length) setLines(cart);
    synced.current = true;
    const onCart = () => {
      const c = fromCart();
      setLines((ls) => (c.length ? [...c, ...ls.filter((l) => l.product === "other")] : ls));
    };
    window.addEventListener(CART_EVENT, onCart);
    return () => window.removeEventListener(CART_EVENT, onCart);
  }, []);

  // La sélection reste synchronisée avec la carte (quantités), pour la retrouver en revenant
  const persist = (ls: OrderLine[]) => {
    setLines(ls);
    if (synced.current) {
      const map = new Map<string, number>();
      ls.forEach((l) => l.product !== "other" && map.set(l.product, (map.get(l.product) ?? 0) + l.qty));
      try {
        localStorage.setItem("adg-cart", JSON.stringify([...map].map(([id, qty]) => ({ id, qty }))));
      } catch {}
    }
  };
  const update = (i: number, patch: Partial<OrderLine>) => persist(lines.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  const changeProduct = (i: number, product: LineProduct) => update(i, emptyLine(product, lines[i].qty));

  const times = date ? pickupTimes(date) : [];

  function validate(): Errors {
    const e: Errors = {};
    if (!lines.length || lines.some((l) => l.product === "other" && !l.detail.trim())) e.lines = t.errors.lines;
    if (!date) e.date = t.errors.date;
    if (!time) e.time = t.errors.time;
    if (!name.trim()) e.name = t.errors.name;
    if (!isPhone(phone)) e.phone = t.errors.phone;
    if (email.trim() && !isEmail(email)) e.email = t.errors.email;
    return e;
  }

  async function submit(ev: FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      document.querySelector<HTMLElement>(`[data-err="${Object.keys(e)[0]}"]`)?.focus();
      return;
    }
    const order: CakeOrder = { lines, date, time, name: name.trim(), phone: phone.trim(), email: email.trim(), message: message.trim() };
    setSending(true);
    try {
      const res = await fetch("/api/order", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ type: "cake", lang, order }) });
      const json = (await res.json()) as { ok: boolean; notified?: boolean; confirmed?: boolean };
      if (!res.ok || !json.ok) throw new Error("send");
      setSent({ notified: !!json.notified, confirmed: !!json.confirmed, text: cakeText(order, lang, d), email: order.email });
      if (json.notified) clearCart();
      document.getElementById("gateau")?.scrollIntoView({ block: "start" });
    } catch {
      setErrors({ send: t.errors.send });
    } finally {
      setSending(false);
    }
  }

  const call = (
    <a href={`tel:${site.phoneIntl}`} className="btn-line">
      <PhoneIcon />
      {d.nav.call} · {site.phone}
    </a>
  );

  if (sent) {
    const wa = waLink(sent.text);
    return (
      <div className="fade-in border border-line bg-paper p-6 md:p-10" role="status">
        {sent.notified ? <CheckIcon className="h-8 w-8 text-open" /> : <PhoneIcon className="h-8 w-8 text-framboise-ink" />}
        <h3 className="display mt-4 text-[2rem]">{sent.notified ? t.done.title : t.done.pendingTitle}</h3>
        <p className="lead mt-3">{sent.notified ? t.done.text : t.done.pendingText}</p>
        {sent.confirmed && <p className="mt-3 text-muted">{fill(t.done.mail, { email: sent.email })}</p>}
        <pre className="mt-6 border-s-2 border-gold/60 ps-4 font-[family-name:var(--font-jost)] text-[0.9375rem] leading-relaxed whitespace-pre-wrap text-ink">{sent.text}</pre>
        <div className="mt-8 flex flex-wrap gap-3">
          {call}
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-line">
              <WhatsAppIcon className="h-5 w-5" />
              {t.whatsapp}
            </a>
          )}
          <button
            type="button"
            className="link-line ms-2 self-center text-sm text-muted"
            onClick={() => {
              setSent(null);
              setLines([emptyLine()]);
              setDate("");
              setTime("");
              setMessage("");
            }}
          >
            {t.done.again}
          </button>
        </div>
      </div>
    );
  }

  const err = (k: keyof Errors) =>
    errors[k] ? (
      <p id={`err-${k}`} className="mt-2 text-sm text-framboise-ink">
        {errors[k]}
      </p>
    ) : null;
  const aria = (k: keyof Errors) => ({ "aria-invalid": errors[k] ? true : undefined, "aria-describedby": errors[k] ? `err-${k}` : undefined, "data-err": k });

  return (
    <form onSubmit={submit} noValidate className="space-y-12">
      {/* 1. Gâteaux */}
      <fieldset>
        <legend className="display mb-5 text-[1.7rem]">
          <span className="me-3 text-caramel">1</span>
          {t.productsTitle}
        </legend>
        <ul className="space-y-3">
          {lines.map((l, i) => {
            const kind = kindOf(l.product);
            return (
              <li key={i} className="relative border border-line bg-paper p-4 pe-12 md:p-5 md:pe-14">
                <div className={`grid gap-x-5 gap-y-4 ${kind === "cake" ? "sm:grid-cols-[1.5fr_1fr_6rem]" : "sm:grid-cols-[1.5fr_8rem]"}`}>
                  <label className="block">
                    <span className="label">{t.product}</span>
                    <select className="field" name={`product-${i}`} value={l.product} onChange={(e) => changeProduct(i, e.target.value as LineProduct)} {...(i === 0 ? aria("lines") : {})}>
                      {ORDERABLE.map((p) => (
                        <option key={p} value={p}>
                          {d.products[p].name}
                        </option>
                      ))}
                      <option value="other">{t.other}</option>
                    </select>
                  </label>
                  {kind === "cake" && (
                    <label className="block">
                      <span className="label">{t.parts}</span>
                      <select className="field" value={l.parts} onChange={(e) => update(i, { parts: Number(e.target.value) })}>
                        {PARTS.map((n) => (
                          <option key={n} value={n}>
                            {fill(t.partsValue, { n })}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  <label className="block">
                    <span className="label">{t.pieces}</span>
                    <input type="number" name={`qty-${i}`} inputMode="numeric" min={1} max={l.product === "plateauMinis" ? 300 : site.order.maxPerLine} className="field" value={l.qty} onChange={(e) => update(i, { qty: Math.min(l.product === "plateauMinis" ? 300 : site.order.maxPerLine, Math.max(1, Number(e.target.value) || 1)) })} />
                  </label>
                </div>
                {kind === "cake" && l.product !== "pieceMontee" && (
                  <label className="mt-4 block">
                    <span className="label">{t.inscription}</span>
                    <input className="field" name={`inscription-${i}`} autoComplete="off" value={l.inscription} maxLength={40} placeholder={t.inscriptionPh} onChange={(e) => update(i, { inscription: e.target.value })} />
                    <span className="mt-1.5 block text-[0.8125rem] text-muted">{t.inscriptionHint}</span>
                  </label>
                )}
                {(l.product === "other" || kind === "box" || l.detail) && (
                  <label className="mt-4 block">
                    <span className="label">{t.detail}</span>
                    <input className="field" name={`detail-${i}`} autoComplete="off" value={l.detail} maxLength={400} placeholder={l.product === "other" ? t.otherPh : l.product === "boiteEclairs" ? t.boxPh : ""} onChange={(e) => update(i, { detail: e.target.value })} />
                  </label>
                )}
                {lines.length > 1 && (
                  <button type="button" onClick={() => persist(lines.filter((_, j) => j !== i))} className="absolute end-1 top-1 flex h-10 w-10 items-center justify-center text-muted hover:text-ink" aria-label={t.removeLine}>
                    <CloseIcon className="h-4 w-4" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
        {lines.length < 8 && (
          <button type="button" onClick={() => persist([...lines, emptyLine("gateauAnniversaire")])} className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-framboise-ink">
            <PlusIcon />
            <span className="link-line">{t.addLine}</span>
          </button>
        )}
        {err("lines")}
      </fieldset>

      {/* 2. Retrait : la date, puis l'heure */}
      <fieldset>
        <legend className="display mb-2 text-[1.7rem]">
          <span className="me-3 text-caramel">2</span>
          {t.pickupTitle}
        </legend>
        <p className="mb-5 text-sm text-muted">{fill(t.lead, { hours: site.order.leadHours })}</p>
        <label className="block max-w-sm">
          <span className="label">
            {t.date} <span className="sr-only">({t.required})</span>
          </span>
          <select
            className="field"
            name="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              if (time && !pickupTimes(e.target.value).includes(time)) setTime("");
            }}
            required
            {...aria("date")}
          >
            <option value="">—</option>
            {days.map((day) => (
              <option key={day} value={day}>
                {formatDay(day, lang)}
              </option>
            ))}
          </select>
          {err("date")}
        </label>
        <div role="radiogroup" aria-label={t.time} aria-describedby={errors.time ? "err-time" : undefined} className="mt-6">
          <span className="label">{t.time}</span>
          {date ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6">
              {times.map((h, i) => (
                <label key={h} className="chip !px-2 tabular-nums">
                  <input type="radio" name="time" value={h} checked={time === h} onChange={() => setTime(h)} className="sr-only" {...(i === 0 ? { "data-err": "time" } : {})} />
                  {formatTime(h, lang)}
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted" data-err="time" tabIndex={-1}>
              {t.timeHint}
            </p>
          )}
          {err("time")}
        </div>
      </fieldset>

      {/* 3. Coordonnées */}
      <fieldset>
        <legend className="display mb-5 text-[1.7rem]">
          <span className="me-3 text-caramel">3</span>
          {t.contactTitle}
        </legend>
        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <label className="block">
            <span className="label">{t.name}</span>
            <input className="field" name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required {...aria("name")} />
            {err("name")}
          </label>
          <label className="block">
            <span className="label">{t.phone}</span>
            <input className="field" name="tel" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required {...aria("phone")} />
            {err("phone")}
          </label>
          <label className="block sm:col-span-2">
            <span className="label">{t.email}</span>
            <input className="field" name="email" type="email" spellCheck={false} inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} {...aria("email")} />
            <span className="mt-1.5 block text-[0.8125rem] text-muted">{t.emailHint}</span>
            {err("email")}
          </label>
          <label className="block sm:col-span-2">
            <span className="label">{t.message}</span>
            <textarea name="message" className="field min-h-24 resize-y" maxLength={1500} placeholder={t.messagePh} value={message} onChange={(e) => setMessage(e.target.value)} />
          </label>
        </div>
      </fieldset>

      <div>
        <button type="submit" className="btn w-full sm:w-auto" disabled={sending}>
          {sending ? t.sending : t.submit}
        </button>
        <p className="mt-4 text-[0.8125rem] text-muted">{t.payNote}</p>
        {errors.send && (
          <div className="mt-5 space-y-4" role="alert">
            <p className="text-framboise-ink">{errors.send}</p>
            {call}
          </div>
        )}
      </div>
    </form>
  );
}
