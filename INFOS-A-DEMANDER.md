# Infos à demander à L'Artisan des Gourmands

À récupérer en boutique (01 45 78 14 10), puis à reporter dans les fichiers indiqués.

1. **Le prénom du boulanger ou du pâtissier, et l'histoire de la maison.** On sait : Filipe Fernandes, meilleur éclair au chocolat d'Île-de-France 2025 (et 13e au concours du croissant au beurre IDF 2022, d'après un annuaire). Un annuaire parle d'une installation rue de la Convention fin d'été 2013 : à confirmer. Qui est le gérant ? Depuis quand ? → `locales/*.json` (footer, page éclairs).
2. **La liste des pâtisseries, des pains et les prix.** Prix relevés sur les photos Google (vitrines) : à confirmer, et compléter ceux marqués « à remplir » (éclairs café / vanille / caramel, pain au chocolat, baguette tradition, pains, boissons du salon de thé). Le nom « Diablotine » vient d'un avis client : le confirmer. → `data/carte.json` et `locales/*.json → products`.
3. **Les gâteaux sur commande et le délai.** Lesquels exactement (fraisier, entremets, saint-honoré, pièce montée…), tailles possibles (nombre de parts), prix, délai réel (48 h ? une semaine pour une pièce montée ?). → `data/carte.json`, `data/site.json → order.leadHours`.
4. **Un portable pour WhatsApp.** S'il en donne un : `data/site.json → whatsapp` (format 33612345678), le bouton apparaît tout seul après une commande.
5. **L'Instagram, s'il en a un.** Aucun trouvé. → `data/site.json → instagram` et `instagramHandle`.
6. **L'email de la boutique** pour recevoir les commandes. Puis, dans Vercel : `RESEND_API_KEY`, `ORDER_NOTIFY_EMAIL`, `RESEND_FROM` (domaine vérifié). Tant que ce n'est pas fait, le site affiche « appelez-nous pour confirmer ».
7. **Des photos de la vitrine et des produits** (voir `assets/a-photographier/LISEZ-MOI.md`) : galette, entremets entiers, pièce montée, baguettes, salle du salon de thé, façade de jour sans passants.
8. **Le logo**, s'il existe un fichier (les étiquettes de la vitrine portent un petit emblème doré). Sinon le logo typographique livré (`public/logo.svg`) reste.
9. **SIRET**, raison sociale et responsable de la publication → `data/site.json → legal`.
10. **À vérifier aussi** : horaires exacts et fermetures (congés, jours fériés → `data/horaires.json → exceptions`), moyens de paiement acceptés, existence d'un fait-maison certifié ou d'un label (l'enseigne « Boulanger de France » est visible dans la boutique), accord pour reprendre 3 vrais avis Google (emplacements prévus dans la section Avis).
