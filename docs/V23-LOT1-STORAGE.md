# V2.3 — Lot 1 — Kobe

Le store de combat transactionnel existant est conservé : 199 tests Node réussis, notamment quota, concurrence entre deux stores, rejouabilité des événements, ressources, concentration et repos.

Les données de session et l’inventaire étaient en dehors de ce store. Un JSON d’inventaire illisible pouvait interrompre le démarrage du Combat ; une note pouvait être affichée comme sauvegardée malgré l’échec de son écriture. Le correctif préserve les originaux illisibles, laisse l’application accessible et montre les écritures refusées dans une alerte durable avec export technique des données de secours. L’import explicite de l’inventaire sauvegarde d’abord l’original.

Chromium local : notes modifiées, quota simulé, absence de faux statut « Sauvegardé », récupération et rechargement ; notes et inventaire corrompus préservés et Combat accessible. Commande : `node scripts/storage-browser.mjs`, `E2E_BROWSER=webkit` pour WebKit. Workflow dédié pour les deux moteurs ; consulter ses résultats.

Build et vérification du shell hors connexion à exécuter avec `npm run build && npm run test:e2e`. Aucune parité Kentaro revendiquée ici : lot 3. Le fichier de secours est un diagnostic contenant les chaînes original/current par clé ; il ne remplace pas les formats d’import natifs. Aucun test physique iPad/iPhone. Ni fusion ni déploiement.
