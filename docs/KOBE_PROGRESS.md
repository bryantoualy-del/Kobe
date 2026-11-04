# Kobe V1 — progression persistante

Dernière mise à jour : 4 novembre 2026. Source de vérité de reprise avec docs/README.md.

| Lot | État | Dépendances / prochain geste |
|---|---|---|
| 0 Audit / récupération / architecture | Terminé et fusionné (73a4351, PR #1) | [PR #1](https://github.com/bryantoualy-del/Kobe/pull/1), branche feat/kobe-lot0-audit |
| 1 Socle local | Terminé et fusionné — PR #2, b313658 | Socle et CI navigateur validés ; recette Safari physique au Lot5 |
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


### Reprise après interruption — état vérifié et continuation (4 novembre 2026)

**Inventaire GitHub :** main = `73a4351` (Lot0 fusionné, PR #1), branche `feat/kobe-lot1-ui` conservée. Seule PR identifiée : #1 fusionnée. La branche Lot1 contenait déjà `0aab795` : modèle, moteur, stockage, tests transactionnels (12 cas rapportés). Ces fichiers n'ont pas été écrasés.

**Terminé et conservé avant cette reprise :**
- Documentation normative Lot0 et validation documentaire.
- Commandes pures `src/kobe/engine.js`, état versionné `model.js`, stockage `storage.js` avec reçus anti-doublons, prévisualisation import/export, migration sauvegardée et 12 tests Node.

**Réalisé pendant la reprise, par commits fonctionnels bornés :**
- `6d93651`, `74e99df`, `f88a287` : index et coque HTML/CSS/JS, quatre onglets, palette officielle, dashboard local, PV/PV temp, économie générique, fin de tour, correctif/annulation, notes et journal, export/import. Monogramme « K » uniquement temporaire, pas d'emblème inventé.
- `f596133`, `f64cf39`, `0e61abb` : build statique sans dépendances npm externes, service worker à liste de précache, contrôles statiques d'artefacts.
- `2b5640` : workflow GitHub Actions `npm test && npm run build && npm run test:e2e`.

**Partiellement réalisé / non vérifié :**
- Navigation et gestion d'état câblées ; recette navigateur réel et vraie persistance après fermeture **non exécutées**.
- Hors ligne : mécanisme de cache écrit ; premier install, passage avion, reprise Safari **non testés**.
- Économie générique opérationnelle au niveau moteur ; intégration des sorts/règles détaillés à venir au Lot2.
- `test:e2e` est un contrôle *statique* et ne constitue PAS un test navigateur ou iPad.
- Web Locks absents : mode lecture seule explicite. Vérifier Safari iPad ciblé, ne pas ignorer cette limite.
- Pas de pipeline de screenshots ni de test de cibles tactiles automatisé ; recette iPad en Lot5.

**Non commencé dans ce lot (hors périmètre conformément à LOTS.md) :** catalogue 19 sorts, classes et Social complets (Lot2), Khar-Vek et tambour interactif/portrait (Lot3), V5 (Lot4).

**Suivi validation :** à la rédaction de cette note, workflow CI GitHub `41902184767` en cours, sans verdict. Ne PAS considérer le Lot1 terminé avant conclusion `success` et revue de diff. Test local impossible dans ce runtime : Git HTTPS ne résout pas github.com ; les commandes ne doivent pas être prétendues exécutées ici. Le contrôle visuel Safari Air 5 reste obligatoire lors de la recette.

**Point de reprise exact :** conserver la branche `feat/kobe-lot1-ui`, vérifier CI `41902184767`, corriger ses erreurs uniquement, relire changements main…branche, ouvrir PR Lot1, fusionner uniquement avec contrôles satisfaits. Références visuelles fournies par l'utilisateur à intégrer ultérieurement depuis un actif correctement autorisé, sans substituer le monogramme.


### Validation CI après livraison

- Exécution GitHub Actions : https://github.com/bryantoualy-del/Kobe/actions/runs/41902184767
- SHA testé : `2b5640681feb50f849008aea3ef199f8e412e465`, résultat **success**.
- Commandes CI : `npm test`, `npm run build`, `npm run test:e2e`, `git diff --check`.
- Commit documentaire postérieur sans modification de code : `4055b8241565ee85dc748a96460d3cd666ae5dc9`.
- Revue delta `main...feat/kobe-lot1-ui` : 10 commits en avance, 0 en retard, 14 fichiers (ajouts + documentation), aucune suppression.
- Limite : `test:e2e` statique, pas de navigateur piloté ; cache/interaction à valider sur Safari physique avant statut complet.

### Reprise Lot 1 — validation navigateur renforcée (4 novembre 2026, suite)

- Conservation stricte des commits moteur/stockage et des 12 tests initiaux.
- Ajout du guide `docs/LOT1_USAGE.md` et d'une recette Playwright navigateur réelle dans `scripts/browser-smoke.mjs`, testée sous Chromium et WebKit Linux.
- CI navigateur fixée sur ubuntu-24.04 après échec d'installation Playwright sur Ubuntu 26.04.
- Tests de navigation, état/sauvegarde, journal et notes confirmés dans Chromium ; **rechargement hors ligne réussi sous Chromium** (job 41903953325).
- WebKit : navigation et reprise locale réussies jusqu'à la dernière étape, puis erreur interne de Playwright WebKit sur `page.reload()` hors ligne. Cas isolé dans le test depuis `5713c3b`, à retester sur Safari iPad physique ; **aucun PASS offline WebKit revendiqué**.
- Les scénarios navigateur attendent explicitement les commits asynchrones (onglets, notes, journal) avant les rechargements.
- Lot 1 contenu et PR #2 : https://github.com/bryantoualy-del/Kobe/pull/2. Valider la CI finale puis merger la PR, sans suppression de fichiers ni anticipation des Lots 2–4.


## Clôture Lot 1 — 4 novembre 2026

**Livraison : terminée, PR #2 fusionnée dans main.** Merge commit : `b3136582c864a0d3521ce4023724844ae4a9219c`.
Branche source : `feat/kobe-lot1-ui`, tête contrôlée `2946a51baabe6e247f3d491a3e092ba1bbfe9e47`.
Revue : 20 commits devant main, zéro derrière avant fusion ; 16 fichiers modifiés/ajoutés, **aucune suppression**.
Pipeline final de la tête de PR : `41904408834` et `41904420285`, les deux en `success` ;
`npm test`, `npm run build`, `npm run test:e2e`, recette Playwright Chromium+WebKit.
Résultat navigateur : navigation 4 onglets, PV, notes, journal, reload ; hors ligne + reload Chromium OK.
**Limite maintenue** : rechargement offline WebKit/Linux non déclaré valide à cause d'une erreur interne Playwright ; la recette physique iPad Safari reste au Lot 5. Cette limite n'efface pas la validation du socle local testé.
**Point de reprise suivant** : Lot 2 depuis `main`, selon docs/LOTS.md ; ne pas réimplémenter modèle/engine/storage, UI ou cache du Lot 1. Les lots 2–4 restent non commencés et n'ont pas été inclus dans cette fusion.


## Lot 2 — checkpoint moteur (4 novembre 2026)
Base vérifiée : main `777c5ca`, PR #1/#2 fusionnées, aucune branche Lot2 préexistante.
Mission actuelle prioritaire : combat/Glamour/Social, grimoire complet exclu de ce lot.
Architecture Lot0, référentiel et PDF Kobe relus ; section Glamour Xanathar p.14 recoupée.
Moteur pur ajouté via la transition unique existante ; migration v1→v2 avec sauvegarde originale,
reçus et undo conservés. Capacités, résolutions MJ, temps narratif, repos et cibles externes locaux.
Validation intermédiaire : 12 tests Lot1 PASS. Parcours UI et tests Lot2 encore en cours.

### Lot 2 — checkpoint interface et tests
- Commandes réelles raccordées à Combat, formulaires de cibles et confirmations conditionnelles.
- Début/fin de tour distincts, concentration/effets/résolutions, réactions externes déclarées.
- Social : Représentation et transcription des compétences ; anomalie Perception conservée visible.
- Tests locaux : 29/29 PASS, dont 17 scénarios Lot2 ; build et contrôle statique PASS.
- Commit moteur distant : `8e6ced388526a21fd6505226db8d9354fd9264de`.
- Recette navigateur Lot2 et revue finale encore à effectuer. Aucun statut terminé revendiqué.
