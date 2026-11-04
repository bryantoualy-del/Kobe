# Kobe V1 — progression persistante

Dernière mise à jour : 4 novembre 2026. Source de vérité de reprise avec docs/README.md.

| Lot | État | Dépendances / prochain geste |
|---|---|---|
| 0 Audit / récupération / architecture | Terminé et fusionné (73a4351, PR #1) | [PR #1](https://github.com/bryantoualy-del/Kobe/pull/1), branche feat/kobe-lot0-audit |
| 1 Socle local | Reprise en cours : inventaire terminé | Branche feat/kobe-lot1-ui ; étapes ci-dessous |
| 2 Personnage / sorts / Glamour | Non commencé dans Kobe | Lot1, arbitrages référentiel |
| 3 Khar-Vek / identité / UX | Non commencé dans Kobe | Lots1–2 |
| 4 RPG Connect V5 | Non commencé dans Kobe | Lots1–3 et coordination registres serveur/Encounter |
| 5 Recette / livraison | Non commencé dans Kobe | Lots1–4, validation physique iPad |

## Commits et branches

- Base Kobe : `10accd549d9c3f1ff2498e16fab9c8c46fbe4176`.
- Branche de livraison : `feat/kobe-lot0-audit` (documentation uniquement).
- Prototype A : `9506ff3d991922715ee28fe49532ee34009d2980`, non fusionné dans Kobe.
- Prototype B : `09ff42f9b1fcdbe205cb179c1d4641145306a916`, non fusionné dans Kobe.
- Candidats registre : RPG-Connect `3b2dd11bd4ec7da4b65cbf8d9e337fa42f770e05` ; Encounter `56a65de3ae464ad757f1ee0c518cffec828ac1ba`.
- Commit documentaire local initial : `d6e03dd` ; publication via API GitHub (Git HTTPS sans identifiants dans cet environnement).
- Branche distante registre RPG-Connect : `a084aabe029110b69677637584c7962bf172c3d9`, distincte du SHA local ; à préserver.
- Le commit documentaire distant et la PR sont ajoutés ci-dessous après création. Le SHA d’un fichier ne peut pas s’auto-référencer : utiliser aussi le commit de fusion GitHub pour le dernier état.

## Vérifications

165 tests existants passent : A17 + B22 + autorités111 + V5 DOM/WebSocket7 + protocole8.
Détail, commandes, limites et logs : [validation/LOT0.md](validation/LOT0.md).
L’audit n’assimile pas présence d’un module, test fixture et fonctionnement UI complet.
Contrôle documentaire réussi : 21 liens relatifs, 26 ancres et empreintes de sources, JSON et palette. `git diff --check` réussi.

## Points bloquants et limites

1. **Récupération durable des prototypes complets** : les deux commits Pilot20 sont locaux, non retrouvés sur branche distante.
   Publication publique des prototypes refusée par revue automatique pour dépassement du Lot0 documentaire.
   Originaux intacts ; autorisation explicite nécessaire pour cette publication. Ne bloque pas le socle décrit au Lot1.
2. **Connexion Kobe** : le main serveur/Encounter ne l’inscrit pas ; Lot4 doit coordonner les deux registres.
3. **Décisions MJ** : Perception, variante Majesté, instruments/langue, armure/options Tasha ; politiques provisoires dans RULES_AND_ASSETS.
4. **Emblème CC** : fichier Kobe retrouvé, aucune preuve qu’il s’agit de l’emblème collectif officiel.
5. **Source MotM et texte initial intégral** : vérifier la nuance du Cri au Lot2 ; les priorités P0/P1 sont récupérées,
   mais le texte original intégral et le mapping rythmique exact ne sont pas attestés. Mapping des prototypes = proposition.
6. **Safari physique** : non testé, à réserver pour la recette Lot5. Aucun déploiement effectué.

## Journal de décisions

- 2026-11-04 : six main figés, aucun remaniement des sources.
- 2026-11-04 : deux prototypes reconnus distincts ; B candidat principal, A référence de séparation.
- 2026-11-04 : Table Libre conserve l’autorité locale ; soins alliés distants avancés classés P1.
- 2026-11-04 : architecture statique sans infrastructure supplémentaire, moteur pur et adaptateur isolé.
- 2026-11-04 : erreurs de chemin des anciens audits corrigées (pas de rpg-nans-client.js dans Nans main).

## Règle de mise à jour pour chaque lot

Ajouter date, base, tête, PR/merge, fichiers modifiés, commande et résultat des tests, limites restantes,
et décisions MJ. Ne jamais remplacer « non vérifié » par « opérationnel » sans nommer le scénario exécuté.

## Publication du Lot 0

- PR : https://github.com/bryantoualy-del/Kobe/pull/1
- Commit documentaire distant initial : `68bc4cfa2b2f751cefee2f554d13abfdc47f44f8`.
- Contrôles applicables : 165 tests PASS et contrôle documentaire PASS ; aucun workflow CI préexistant dans Kobe.
- La fusion n'est autorisée qu'après vérification du diff distant (documentation seulement, zéro suppression) et état GitHub sans échec. L'état de fusion et son SHA sont accessibles dans la PR ci-dessus ; ne pas confondre un rapport de tests local et un workflow CI.

## Reprise sécurisée Lot 1 — 4 novembre 2026

Inventaire distant et local : main et feat/kobe-lot1-ui pointent sur `73a4351b7f874352d04c986e2427a5978b9fb1b8`.
Branche Lot0 conservée (`63e0589`) ; seule PR existante #1 fusionnée. Aucun changement local initial.
- Terminé avant reprise : Lot0 documentaire, création de la branche Lot1.
- Partiel avant reprise : préparation du Lot1 uniquement (branche sans delta).
- Non commencé dans le dépôt : moteur, stockage, interface, cache hors ligne, tests et build.
- Aucun code applicatif interrompu retrouvé dans cette branche ou ce workspace. Les deux anciens prototypes
  restent des références d'audit, pas du code récupéré. Application du chemin de reprise de LOTS.md.

Étapes vérifiables, avec commit après chacune :
1. Inventaire et correction du suivi (présent commit).
2. Modèle/moteur pur, stockage sérialisé, migration/import/export, tests de transactions.
3. Coque quatre onglets, palette officielle, tableau de bord, corrections et notes persistantes.
4. Build statique/cache complet, tests navigateur de reprise et concurrence, rapport final et PR.

Périmètre : socle Lot1 de LOTS.md ; sorts/Glamour détaillés Lot2, pouvoirs du vestige Lot3, réseau Lot4.
Emblème officiel évoqué dans la conversation précédente absent des fichiers présents : ne pas en inventer.

### Étape 2 — transactions locales

Modèle et commandes pures dans src/kobe ; sauvegarde JSON sous Web Locks (sans verrou disponible : lecture seule).
PV, temporaires sans cumul, dépenses génériques atomiques, début de tour séquencé, corrections et annulation compensatoire.
Migration v0 documentée uniquement (pas de conversion arbitraire des prototypes), sauvegarde originale avant migration/import.
Import prévisualisé, reçus conservés, journal borné indépendamment des reçus.
Validation : `npm test` — 12 tests PASS (rejeu, dernier usage, deux stores concurrents, quota, migration, import, récupération).
Reste : interface, build/cache et tests avec deux vraies pages navigateur. Aucun test Safari physique à ce stade.
