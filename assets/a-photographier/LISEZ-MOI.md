# Photos à prendre sur place

Lumière du jour, sans flash, produits vus de près, aucun visage de client. Format conseillé : 2000 px de large minimum.
Déposez chaque fichier ici sous le nom indiqué, ajoutez la ligne dans `scripts/media.mjs` (PICKS), lancez `npm run media`,
puis renseignez le chemin dans le fichier de données indiqué : l'emplacement vide du site est remplacé tout seul.

| Fichier | Où il apparaît | Données |
|---|---|---|
| `galette-des-rois.jpg` | Saison « galette », carte (entremets) | `data/saisons.json`, `data/carte.json → galette` |
| `entremets-anniversaire.jpg` | Carte, page gâteau d'anniversaire | `data/carte.json → gateauAnniversaire` |
| `saint-honore-a-partager.jpg` | Carte | `data/carte.json → saintHonoreAPartager` |
| `piece-montee.jpg` | Carte | `data/carte.json → pieceMontee` |
| `flan-entier.jpg` | Carte | `data/carte.json → flanEntier` |
| `eclair-cafe.jpg`, `eclair-vanille.jpg`, `eclair-caramel.jpg` | Carte, page éclairs | `data/carte.json` |
| `baguette-tradition.jpg`, `pain-levain.jpg` | Carte, tuile Pains | `data/carte.json` |
| `salle-salon-de-the.jpg` | Bloc salon de thé | `app/[lang]/page.tsx` (bloc « salon ») |
| `facade-jour.jpg` | Infos pratiques | `app/[lang]/page.tsx` (section infos) |
| `vitrine-fetes.jpg` | Saison « fêtes » | `data/saisons.json` |
