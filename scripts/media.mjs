// Trie les photos de la fiche Google (assets/raw/) dans assets/<catégorie>/ avec des noms lisibles,
// puis les prépare pour le web dans public/media/<catégorie>/ (next/image sert ensuite AVIF/WebP à la bonne taille).
//   npm run media
//
// Écartées volontairement : 05 et 08 (doublons exacts de 01 et 02), 07 (vitrine prise de biais, reflets, peu lisible).
// Aucune photo ne montre de visage de client ; la 14 laisse voir un manteau flou en arrière-plan, recadrée pour l'écarter.
//
// Emplacements pour les photos prises sur place : déposer un .jpg dans assets/a-photographier/ sous le nom indiqué
// dans assets/a-photographier/LISEZ-MOI.md, l'ajouter à PICKS (catégorie voulue) et relancer `npm run media` :
// le site remplace tout seul l'emplacement vide par la photo.
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const raw = (n) => `raw/artisan-gourmands_${n}.jpg`;

// [fichier source (dans assets/), catégorie, nom, recadrage éventuel { left, top, width, height } en pixels d'origine]
const PICKS = [
  [raw("12"), "hero", "boite-six-eclairs"],

  [raw("12"), "eclairs", "six-eclairs-assortis"],
  [raw("09"), "eclairs", "vitrine-eclairs-tartelettes"],
  [raw("09"), "eclairs", "rangee-eclairs-chocolat", { left: 700, top: 960, width: 900, height: 560 }],
  [raw("03"), "eclairs", "eclair-chocolat-coupe"],
  [raw("02"), "eclairs", "ardoise-eclairs-de-folie"],

  [raw("09"), "patisseries", "tartelettes-fraises-tropezienne", { left: 0, top: 940, width: 1100, height: 640 }],
  [raw("11"), "patisseries", "vitrine-patisseries"],
  [raw("11"), "patisseries", "entremets-individuels", { left: 560, top: 860, width: 1040, height: 340 }],
  [raw("11"), "patisseries", "tartes-a-partager", { left: 0, top: 540, width: 1600, height: 420 }],

  [raw("10"), "viennoiseries", "vitrine-viennoiseries"],
  [raw("10"), "viennoiseries", "croissants-et-viennoises", { left: 420, top: 720, width: 1180, height: 480 }],
  [raw("04"), "viennoiseries", "pain-choco-praline"],

  [raw("13"), "pains", "rayon-des-pains"],

  [raw("06"), "boutique", "tarte-et-cappuccino"],
  [raw("14"), "boutique", "eclair-croissant-brioche-en-terrasse", { left: 0, top: 560, width: 1600, height: 1573 }],

  [raw("01"), "facade", "facade-rue-de-la-convention"],
];

const sizes = {};
for (const [src, cat, name, crop] of PICKS) {
  const file = path.join(ROOT, "assets", src);
  await mkdir(path.join(ROOT, "assets", cat), { recursive: true });
  await mkdir(path.join(ROOT, "public/media", cat), { recursive: true });
  let pipe = sharp(file).rotate();
  if (crop) pipe = pipe.extract(crop);
  if (crop) await pipe.clone().jpeg({ quality: 92 }).toFile(path.join(ROOT, "assets", cat, `${name}.jpg`));
  else await copyFile(file, path.join(ROOT, "assets", cat, `${name}.jpg`));
  const max = cat === "hero" ? 2000 : 1600;
  const info = await pipe
    .resize({ width: max, height: max, fit: "inside", withoutEnlargement: true })
    .modulate({ saturation: 0.96 })
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(path.join(ROOT, "public/media", cat, `${name}.jpg`));
  sizes[`/media/${cat}/${name}.jpg`] = [info.width, info.height];
}
await mkdir(path.join(ROOT, "assets/a-photographier"), { recursive: true });

// Image de partage (Open Graph) 1200 × 630 : la boîte d'éclairs, sur fond crème
const hero = path.join(ROOT, "assets", raw("12"));
const photo = await sharp(hero).rotate().resize({ width: 640, height: 630, fit: "cover" }).toBuffer();
const text = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="560" height="630">
  <text x="60" y="232" font-family="Georgia, serif" font-size="34" letter-spacing="6" fill="#4A2C21">L'ARTISAN</text>
  <text x="60" y="280" font-family="Georgia, serif" font-size="34" letter-spacing="6" fill="#4A2C21">DES GOURMANDS</text>
  <rect x="60" y="310" width="70" height="1.5" fill="#B8975A"/>
  <text x="60" y="360" font-family="Georgia, serif" font-style="italic" font-size="25" fill="#7A4E2D">Meilleur éclair au chocolat</text>
  <text x="60" y="392" font-family="Georgia, serif" font-style="italic" font-size="25" fill="#7A4E2D">d'Île-de-France 2025</text>
  <text x="60" y="460" font-family="Arial, sans-serif" font-size="16" letter-spacing="3" fill="#4A2C21">BOULANGERIE · PÂTISSERIE</text>
  <text x="60" y="488" font-family="Arial, sans-serif" font-size="16" letter-spacing="3" fill="#4A2C21">60 RUE DE LA CONVENTION · PARIS 15</text>
</svg>`);
await sharp({ create: { width: 1200, height: 630, channels: 3, background: "#FBF6EC" } })
  .composite([
    { input: photo, left: 560, top: 0 },
    { input: text, left: 0, top: 0 },
  ])
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile(path.join(ROOT, "public/og.jpg"));

await writeFile(path.join(ROOT, "data/media-sizes.json"), JSON.stringify(sizes, null, 1) + "\n");
console.log(`${PICKS.length} images prêtes`);
