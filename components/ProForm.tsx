"use client";

import { useEffect, useState, type FormEvent } from "react";
import site from "@/data/site.json";
import { CheckIcon, PhoneIcon } from "@/components/icons";
import { useLocale } from "@/components/providers";
import { fill } from "@/lib/i18n";
import { isoDay } from "@/lib/format";
import { addDays } from "@/lib/hours";
import { isEmail, isPhone, proText, WANTS, type ProRequest, type Want } from "@/lib/order";

type Errors = Partial<Record<"date" | "people" | "wants" | "name" | "phone" | "email" | "send", string>>;

/** Demande de plateau pour les bureaux : date, nombre de personnes, envies, coordonnées. */
export function ProForm() {
  const { lang, d } = useLocale();
  const t = d.pro;
  const o = d.order;
  const [date, setDate] = useState("");
  const [people, setPeople] = useState("");
  const [wants, setWants] = useState<Want[]>([]);
  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<{ notified: boolean; confirmed: boolean; text: string; email: string } | null>(null);
  const [min, setMin] = useState("");

  // eslint-disable-next-line react-hooks/set-state-in-effect -- valeur propre au navigateur (date, stockage), lue après l'hydratation
  useEffect(() => setMin(addDays(isoDay(new Date()), 2)), []);

  function validate(): Errors {
    const e: Errors = {};
    if (!date) e.date = t.errors.date;
    if (!(Number(people) > 0)) e.people = t.errors.people;
    if (!wants.length) e.wants = t.errors.wants;
    if (!name.trim()) e.name = o.errors.name;
    if (!isPhone(phone)) e.phone = o.errors.phone;
    if (email.trim() && !isEmail(email)) e.email = o.errors.email;
    return e;
  }

  async function submit(ev: FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      document.querySelector<HTMLElement>(`[data-perr="${Object.keys(e)[0]}"]`)?.focus();
      return;
    }
    const request: ProRequest = { date, people: Number(people), wants, company: company.trim(), name: name.trim(), phone: phone.trim(), email: email.trim(), message: message.trim() };
    setSending(true);
    try {
      const res = await fetch("/api/order", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ type: "pro", lang, request }) });
      const json = (await res.json()) as { ok: boolean; notified?: boolean; confirmed?: boolean };
      if (!res.ok || !json.ok) throw new Error("send");
      setSent({ notified: !!json.notified, confirmed: !!json.confirmed, text: proText(request, lang, d), email: request.email });
      document.getElementById("entreprises")?.scrollIntoView({ block: "start" });
    } catch {
      setErrors({ send: o.errors.send });
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

  if (sent)
    return (
      <div className="fade-in border border-line bg-paper p-6 md:p-10" role="status">
        {sent.notified ? <CheckIcon className="h-8 w-8 text-open" /> : <PhoneIcon className="h-8 w-8 text-framboise-ink" />}
        <h3 className="display mt-4 text-[2rem]">{sent.notified ? t.done.title : o.done.pendingTitle}</h3>
        <p className="lead mt-3">{sent.notified ? t.done.text : o.done.pendingText}</p>
        {sent.confirmed && <p className="mt-3 text-muted">{fill(o.done.mail, { email: sent.email })}</p>}
        <pre className="mt-6 border-s-2 border-gold/60 ps-4 font-[family-name:var(--font-jost)] text-[0.9375rem] leading-relaxed whitespace-pre-wrap">{sent.text}</pre>
        <div className="mt-8">{call}</div>
      </div>
    );

  const err = (k: keyof Errors) =>
    errors[k] ? (
      <p id={`perr-${k}`} className="mt-2 text-sm text-framboise-ink">
        {errors[k]}
      </p>
    ) : null;
  const aria = (k: keyof Errors) => ({ "aria-invalid": errors[k] ? true : undefined, "aria-describedby": errors[k] ? `perr-${k}` : undefined, "data-perr": k });

  return (
    <form onSubmit={submit} noValidate className="space-y-8">
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        <label className="block">
          <span className="label">{t.date}</span>
          <input type="date" className="field" min={min || undefined} value={date} onChange={(e) => setDate(e.target.value)} required {...aria("date")} />
          {err("date")}
        </label>
        <label className="block">
          <span className="label">{t.people}</span>
          <input type="number" inputMode="numeric" min={1} max={2000} className="field" value={people} onChange={(e) => setPeople(e.target.value)} required {...aria("people")} />
          {err("people")}
        </label>
      </div>
      <fieldset aria-describedby={errors.wants ? "perr-wants" : undefined}>
        <legend className="label">{t.wants}</legend>
        <div className="flex flex-wrap gap-2">
          {WANTS.map((w, i) => (
            <label key={w} className="chip">
              <input type="checkbox" className="sr-only" checked={wants.includes(w)} onChange={(e) => setWants((ws) => (e.target.checked ? [...ws, w] : ws.filter((x) => x !== w)))} {...(i === 0 ? { "data-perr": "wants" } : {})} />
              {t.wantsItems[w]}
            </label>
          ))}
        </div>
        {err("wants")}
      </fieldset>
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="label">{t.company}</span>
          <input className="field" autoComplete="organization" value={company} onChange={(e) => setCompany(e.target.value)} />
        </label>
        <label className="block">
          <span className="label">{o.name}</span>
          <input className="field" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required {...aria("name")} />
          {err("name")}
        </label>
        <label className="block">
          <span className="label">{o.phone}</span>
          <input className="field" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required {...aria("phone")} />
          {err("phone")}
        </label>
        <label className="block sm:col-span-2">
          <span className="label">{o.email}</span>
          <input className="field" type="email" spellCheck={false} inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} {...aria("email")} />
          {err("email")}
        </label>
        <label className="block sm:col-span-2">
          <span className="label">{o.message}</span>
          <textarea className="field min-h-24 resize-y" maxLength={1500} value={message} onChange={(e) => setMessage(e.target.value)} />
        </label>
      </div>
      <div>
        <button type="submit" className="btn w-full sm:w-auto" disabled={sending}>
          {sending ? o.sending : t.submit}
        </button>
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
