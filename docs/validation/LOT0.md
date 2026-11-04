# Contrôles exécutés — Lot 0

Date : 4 novembre 2026. Aucun résultat ancien n’est réétiqueté comme résultat de cette mission.
Node : v24.22.1. Environnement Linux, pas Safari iPad.

| Contrôle | Résultat | Preuve |
|---|---|---|
| Prototype A, SHA9506ff3, `node --test tests/kobe.test.js` dans Pilot20 A | 17/17 | [log](recovery-a.txt) |
| Prototype B, SHA09ff42f, `node --test tests/kobe.test.mjs` dans Pilot20 B | 22/22 | [log](recovery-b.txt) |
| Autorités des six personnages + dégâts effectifs, Encounter main ff447ea | 111/111 | [log](authority.txt) |
| Six HTML réels + Encounter/serveur canonique, `node --test audit/v5-local.test.cjs` | 7/7 | [log](v5.txt) |
| RPG-Connect main bec8927, `node --test rpg-connect-protocol.test.js rpg-table-policy.test.js` | 8/8 | [log](protocol.txt) |
| Documentation : références locales, JSON, ancres source et empreintes | PASS : 21 liens, 26 ancres/empreintes, JSON et palette | `python3 docs/validation/check_lot0.py --references ../references` |
| Diff : absence de changement applicatif et whitespace | PASS : docs uniquement, whitespace correct | `git diff --check` et revue des chemins |

Total tests existants réexécutés : **165 réussis**. Ce total ne signifie pas 165 fonctionnalités Kobe livrées.
Les assertions de fixtures valident les règles côté Encounter, les assertions DOM testent certaines interactions réelles.
Les logs CSS `csstree-match BREAK after 15000 iterations` sont des avertissements du parseur de jsdom ;
aucune certification visuelle n’en est déduite.

La première tentative V5 dans l’ancien checkout a échoué à charger `ws` côté serveur (dépendance absente).
Recette réexécutée dans des clones isolés des mêmes SHA avec les dépendances déjà installées : 7/7.
Aucun fichier source des références n’a été changé pour obtenir le résultat final.

## Reproduction

Cloner les huit dépôts référencés dans un dossier commun `references/{Brackmard,Samoth,Zephyr,Kentaro,Rufus,Nans,Encounter,RPG-Connect}`.
Checkout des SHA de `../audit/sources.json`. Installer les dépendances lockées des packages Encounter et RPG-Connect
(`npm ci`) ; installer celles de Pilot20 seulement si les prototypes sont récupérés.
Le test V5 suppose cette disposition de dossiers frères ; ne pas tester contre un serveur de production.

Dans Encounter :

```sh
node --test rpg-brack-authority.test.js rpg-samoth-automatismes.test.js rpg-zephyr-authority.test.js rpg-kentaro-authority.test.js rpg-rufus-authority.test.js rpg-nans-authority.test.js rpg-effective-damage.test.js
node --test audit/v5-local.test.cjs
```

Dans RPG-Connect :

```sh
node --test rpg-connect-protocol.test.js rpg-table-policy.test.js
```

## Ce qui n’est pas validé dans ce lot

- Rendu graphique et vitesse des six applications sur appareil physique.
- Safari iPad Air 5, audio, veille prolongée, installation/reprise matérielle.
- Toutes les fonctions de tous les Companions ; voir statuts par fonctionnalité dans la matrice.
- Intégration réseau de Kobe sur les main (inscription absente), déploiement et hébergement.
- Tout le pipeline UI du prototype B ; ses anciens rapports Chromium sont seulement inventoriés.
- Tests d’acceptation des contrats futurs : à implémenter dans les lots concernés.

Ces limites sont compatibles avec une PR documentaire Lot0 : elles interdisent de déclarer l’application prête à jouer.
