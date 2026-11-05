# Recette Kobe V1.1 — 5 novembre 2026

Branche fix/kobe-v11-companion-parity-obsidian-dragon, PR [Kobe #7](https://github.com/bryantoualy-del/Kobe/pull/7) sur le Lot 5 [#6](https://github.com/bryantoualy-del/Kobe/pull/6). Importeur commun dans [Kentaro #13](https://github.com/bryantoualy-del/Kentaro/pull/13). Les deux PR sont soumises à revue. Aucun passage en production.

| Scénario exécuté | Résultat et preuve |
|---|---|
| Moteur, sauvegardes héritées, Undo, corrections, sorts, repos, pouvoirs, confidentialité | 128/128 tests Node passent. Le test de Persuasion physique confirme zéro trame WebSocket pour le jet privé. Build et contrôle des ressources hors ligne réussis. |
| Combat à 1180 × 820 | Chromium et WebKit. Dépenser l’Inspiration, annuler un formulaire, confirmer Manteau, gérer les réactions et reprendre après rechargement. Actions principales visibles dans le premier écran. |
| Sorts & pouvoirs | Deux moteurs. 19 fiches, filtres, recherche, quatre favoris, emplacements, jet d’attaque, résolution par cible et remplacement de concentration. |
| Social et inventaire | Deux moteurs. Persuasion avec avantage (4 et 17, +13 = 30), Représentation avec expertise (11 + 13 = 24), sauvegarde physique DEX (12 + 6 = 18). Ajout d’un instrument, propriété, suppression et restauration par JSON. |
| Carnet et PNJ | Deux moteurs. Distribution de Roark et d’un PNJ absent, création et édition d’un indice, suppression, saisie d’un fait de localisation, nouvelle fiche avec portrait, rechargement, archivage et téléchargement du ZIP. Le ZIP exclut le PNJ absent. |
| Obsidian | Tests Node dans Kentaro, sur une simulation des méthodes du coffre. Deux vrais ZIP issus des Companions. Kentaro crée Roark, Kobe enrichit sa fiche en préservant les notes manuelles. Statut décoché, relation désélectionnée, portrait existant intact, session homonyme conservée, deux reçus distincts, réimport sans doublon. |
| Khar-Vek et dragon | Deux moteurs. Sept niveaux contrôlés, capture des niveaux 0, 3, 6. Aube, double soumission, annulation, trois pouvoirs, rythmes, réduction du mouvement, rechargement et dépense hors ligne dans Chromium. |
| Reprise hors ligne | Profil fermé puis rouvert avec mise à jour du worker, origine en HTTP 503, nouvelle page, soin de 77 à 78 PV et nouveau démarrage à froid toujours sans origine. Succès sous Chromium et WebKit 26.0 et 26.5. Les ressources de secours du worker installé sont versionnées et produites par npm run offline:sync. |
| V5 | Tests du serveur épinglé 10/10. Invitations, initiative, corrections, confidentialité, reconnexion et absence de rejeu sous Chromium et WebKit. Test isolé avec Encounter et les sept vrais clients : 83 → 75 PV répercutés une fois, Samoth visible chez Kobe. |
| Visuel | [Brack, Samoth et Kentaro face à Kobe](recette-v11/compagnons.webp). [Dragon à 0, 3 et 6 charges](recette-v11/dragon.webp). Vues réelles de navigateur. |

## Reproduction
Exécuter npm test, npm run build puis npm run test:e2e. Les scripts parity-browser, browser-smoke, spellbook-browser, kharvek-browser, table-browser et resume-browser dans scripts/ utilisent Playwright. La CI installe les navigateurs et prépare les dépendances V5. Pour le plugin, exécuter node --test tests/shared-importer.test.cjs depuis Kentaro.

## Validation physique à effectuer avant fusion
- Sur iPad Air 5 en paysage, vérifier la barre sticky et les commandes tactiles pendant une séquence de combat, puis après veille de Safari.
- Depuis Obsidian iPad, ouvrir Kobe avec la distribution, jouer une courte séance, télécharger le ZIP dans Fichiers, basculer vers DND, vérifier la prévisualisation et les changements sélectionnés. Réimporter pour vérifier le reçu dans ce coffre.
- Après le premier chargement complet, passer l’iPad en mode avion, fermer Safari puis rouvrir Kobe et vérifier PV, charges, notes et portrait. Les tests Linux/WebKit évaluent le moteur, tandis que ce passage couvre iPadOS, Fichiers et le cycle de vie matériel.
- Recueillir la revue ergonomique du joueur et du MJ. Les deux PR doivent être coordonnées avec la publication du Lot 5 et de la version 1.5 du plugin.

### Après le retour joueur
Le tableau a été réorganisé selon Brack. Le vestige est désormais un cinquième onglet. [Combat avec les quatre favoris](recette-v11/combat-brack.webp) et [dragon vide, à moitié rempli et plein](recette-v11/dragon.webp) sont les captures de la nouvelle interface sous Chromium. La recette du combat inclut la transmission du mode et des dés physiques de la préparation de frappe au dialogue de sort.
