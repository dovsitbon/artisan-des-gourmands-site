import { Resend } from "resend";
import { cakeText, parseCakeOrder, parseProRequest, proText } from "@/lib/order";
import { fill, getDict, isLocale, type Locale } from "@/lib/i18n";

// Commandes de gâteaux et demandes de plateaux entreprises. La boutique n'a qu'une ligne fixe : tout part par e-mail (Resend).
//  1. notification à la boutique (en français, avec la langue du client) ;
//  2. confirmation au client, dans sa langue, s'il a donné son e-mail.
// Variables Vercel : RESEND_API_KEY, ORDER_NOTIFY_EMAIL (adresse de la boutique), RESEND_FROM (domaine vérifié dans Resend,
// ex. « L'Artisan des Gourmands <commandes@mondomaine.fr> » ; sans domaine vérifié, Resend n'envoie qu'à l'adresse du compte).
// Sans ces variables, la route répond { notified: false } et le site invite le client à appeler la boutique.

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function html(title: string, text: string) {
  const body = escapeHtml(text)
    .split("\n\n")
    .map((p) => `<p style="margin:0 0 18px">${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
  return `<div style="background:#FBF6EC;padding:32px 16px"><div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #EADFCB;border-top:3px solid #C9506A;padding:32px 28px;font-family:Georgia,serif;color:#3B2219;font-size:15px;line-height:1.7">
<p style="margin:0 0 4px;font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:#8A5A2B">L'Artisan des Gourmands</p>
<h1 style="margin:0 0 24px;font-weight:normal;font-size:24px">${escapeHtml(title)}</h1>${body}
<p style="margin:24px 0 0;padding-top:16px;border-top:1px solid #EADFCB;font-size:13px;color:#6B4E3D">60 rue de la Convention, 75015 Paris · 01 45 78 14 10</p></div></div>`;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
  const lang: Locale = typeof body.lang === "string" && isLocale(body.lang) ? body.lang : "fr";
  const fr = getDict("fr");
  const d = getDict(lang);

  let shopText: string, clientText: string, subject: string, title: string, confirm: { subject: string; intro: string; outro: string };
  let name: string, email: string;
  if (body.type === "pro") {
    const q = parseProRequest(body.request);
    if (!q) return Response.json({ ok: false }, { status: 400 });
    shopText = proText(q, "fr", fr);
    clientText = proText(q, lang, d, false);
    subject = `${fr.pro.mail.subject} · ${q.company || q.name} · ${q.date}`;
    title = fr.pro.mail.title;
    confirm = { subject: d.pro.mail.confirmSubject, intro: d.pro.mail.confirmIntro, outro: d.pro.mail.confirmOutro };
    ({ name, email } = q);
  } else {
    const q = parseCakeOrder(body.order);
    if (!q) return Response.json({ ok: false }, { status: 400 });
    shopText = cakeText(q, "fr", fr);
    clientText = cakeText(q, lang, d, false);
    subject = `${fr.order.mail.subject} · ${q.name} · ${q.date} ${q.time}`;
    title = fr.order.mail.title;
    confirm = { subject: d.order.mail.confirmSubject, intro: d.order.mail.confirmIntro, outro: d.order.mail.confirmOutro };
    ({ name, email } = q);
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.ORDER_NOTIFY_EMAIL;
  if (!key || !to) return Response.json({ ok: true, notified: false, confirmed: false });

  const resend = new Resend(key);
  const from = process.env.RESEND_FROM ?? "L'Artisan des Gourmands <onboarding@resend.dev>";
  const text = lang === "fr" ? shopText : `${shopText}\n\n${fr.order.mail.lang} : ${lang.toUpperCase()}`;

  let notified = false;
  let confirmed = false;
  try {
    const r = await resend.emails.send({ from, to, replyTo: email || undefined, subject, html: html(title, text), text });
    notified = !r.error;
  } catch {}

  if (email && notified) {
    const msg = `${fill(confirm.intro, { name })}\n\n${clientText}\n\n${confirm.outro}`;
    try {
      const r = await resend.emails.send({ from, to: email, replyTo: to, subject: confirm.subject, html: html(confirm.subject, msg), text: msg });
      confirmed = !r.error;
    } catch {}
  }
  return Response.json({ ok: true, notified, confirmed });
}
