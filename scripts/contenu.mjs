// Génère CONTENU.md : tous les textes du site (français / anglais) et la carte, pour validation par la boutique.
//   npm run contenu
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const read = async (f) => JSON.parse(await readFile(path.join(ROOT, f), "utf8"));
const fr = await read("locales/fr.json");
const en = await read("locales/en.json");
const carte = await read("data/carte.json");
const site = await read("data/site.json");

const euro = (it) => (it.price === null ? (it.order ? "sur devis — à remplir" : "à remplir") : `${it.from ? "à partir de " : ""}${it.price.toFixed(2).replace(".", ",")} €${it.unit === "kg" ? " le kg" : ""}`);
const SKIP = new Set(["products", "alt", "meta"]);
const lines = [];
const walk = (a, b, keyPath) => {
  if (typeof a === "string") {
    lines.push(`| \`${keyPath}\` | ${a.replace(/\n/g, "<br>").replace(/\|/g, "\|")} | ${(b ?? "").replace(/\n/g, "<br>").replace(/\|/g, "\|")} |`);
    return;
  }
  if (Array.isArray(a)) return a.forEach((x, i) => walk(x, b?.[i], `${keyPath}[${i}]`));
  for (const k of Object.keys(a)) if (!(keyPath === "" && SKIP.has(k))) walk(a[k], b?.[k], keyPath ? `${keyPath}.${k}` : k);
};

const out = [];
out.push(`# L'Artisan des Gourmands : contenu du site, à valider\n`);
out.push(`Généré par \`npm run contenu\` depuis \`locales/*.json\` et \`data/*.json\`. Pour corriger un texte, modifiez le fichier JSON indiqué par la clé, puis redéployez.\n`);
out.push(`## Titre du hero : trois options\n`);
out.push(`1. **L'éclair, notre signature** (en ligne aujourd'hui : il s'appuie sur le prix du meilleur éclair au chocolat d'Île-de-France 2025)`);
out.push(`2. **Le goût de l'artisan, rue de la Convention**`);
out.push(`3. **Pour les gourmands du 15e**\n`);
out.push(`Pour changer : \`locales/fr.json\` → \`hero.title\` (et \`locales/en.json\`).\n`);
out.push(`## Faits utilisés (vérifiés)\n`);
out.push(`- Meilleur éclair au chocolat d'Île-de-France 2025 : ${site.award.chef}, Fédération des pâtissiers d'Île-de-France, résultats du 14 octobre 2025 (source : ${site.award.source}).`);
out.push(`- Note Google : ${String(site.rating.value).replace(".", ",")}/5, ${site.rating.count} avis (relevé du ${site.rating.checked}). Affichée « plus de 900 avis ».`);
out.push(`- Horaires (fiche Google) : lundi 7 h – 20 h, mardi 7 h – 19 h, mercredi fermé, jeudi à samedi 7 h – 20 h, dimanche 7 h – 19 h. **À confirmer.**`);
out.push(`- Téléphone ${site.phone} ; Facebook ${site.facebook} ; aucun Instagram trouvé.`);
out.push(`- Prix : relevés sur les étiquettes des vitrines dans les photos Google (les plus récentes). Les photos plus anciennes montraient éclair café / vanille / caramel à 3,00 €, Les Alpes à 4,50 €, tartes à 3,70 € : non repris, à confirmer.\n`);
out.push(`## La carte (data/carte.json)\n`);
for (const tab of carte.tabs) {
  out.push(`### ${fr.carte.tabs[tab.id]} / ${en.carte.tabs[tab.id]}\n`);
  out.push(`| Produit | Description | Prix | Commande | Photo |`);
  out.push(`|---|---|---|---|---|`);
  for (const id of tab.items) {
    const it = carte.items[id];
    out.push(`| ${fr.products[id].name}<br>*${en.products[id].name}* | ${fr.products[id].desc}<br>*${en.products[id].desc}* | ${euro(it)} | ${it.order ? "Ajouter" : "vitrine"} | ${it.image ? "oui" : "**à prendre**"} |`);
  }
  out.push("");
}
out.push(`## Tous les textes\n`);
out.push(`| Clé | Français | English |`);
out.push(`|---|---|---|`);
walk(fr, en, "");
out.push(...lines.splice(0));
out.push(`\n## Textes alternatifs des photos\n`);
for (const k of Object.keys(fr.alt)) out.push(`- \`${k}\` : ${fr.alt[k]} / *${en.alt[k]}*`);
out.push(`\n## Référencement (balises title et description)\n`);
out.push(`- Accueil : ${fr.meta.title}\n  - ${fr.meta.description}`);
for (const [id, p] of Object.entries(fr.pages)) out.push(`- ${id} : ${p.metaTitle}${p.metaDescription ? `\n  - ${p.metaDescription}` : ""}`);
await writeFile(path.join(ROOT, "CONTENU.md"), out.join("\n") + "\n");
console.log("CONTENU.md écrit");
