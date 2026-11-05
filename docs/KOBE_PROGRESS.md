# Kobe V1 — progression persistante

Dernière mise à jour : 4 novembre 2026. Source de vérité de reprise avec docs/README.md.

| Lot | État | Dépendances / prochain geste |
|---|---|---|
| 0 Audit / récupération / architecture | Terminé et fusionné (73a4351, PR #1) | [PR #1](https://github.com/bryantoualy-del/Kobe/pull/1), branche feat/kobe-lot0-audit |
| 1 Socle local | Terminé et fusionné — PR #2, b313658 | Socle et CI navigateur validés ; recette Safari physique au Lot5 |
| 2 Combat local / économie / Glamour / Social | Terminé et fusionné — PR #3 | Merge 0f8ea5e ; grimoire complet exclu de cette mission |
| 3 Grimoire musical | Terminé et fusionné — PR #4 | Merge7d4f95d ; 78 tests et recettes Chromium/WebKit PASS |
| 4 Khar-Vek | Terminé et fusionné — PR #5,34183ee |113 tests et recettes Chromium/WebKit PASS, P1 percussion livrée |
| 5 Recette / livraison | En recette sur PR #6 | Lots1–4, validation physique iPad |

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
2. **Connexion Kobe** : le main serveur/Encounter ne l’inscrit pas ; intégration réseau hors de la mission Lot4 Khar-Vek. Le combat local ne dépend pas de cette connexion.
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

### Lot 2 — revue et validation intermédiaire
- PR #3 : https://github.com/bryantoualy-del/Kobe/pull/3
- CI initiale `41913313152` réussie sur `dcb0c895` (tests/build/recette navigateur).
- Revue supplémentaire : concentration indépendante des Inspirations, seuil mort instantanée après
  absorption PV temp, journal de raté sans dégâts et formulaires d'actualisation des cibles corrigés.
- 32 tests locaux PASS ; nouvelle CI de la tête corrigée exigée avant fusion.
- Règles et limites détaillées dans `docs/LOT2_RULES.md`.

### Lot 2 — revue des captures
Captures Chromium Combat et WebKit Social inspectées à1180×820 : palette et navigation Lot1 préservées.
Amélioration issue de la recette : actions bardiques remontées dans le rail droit pour accès sans
faire défiler, fin/début de tour toujours accessible en bouton or ; libellés d'effets traduits.
La recette navigateur vérifie aussi que Trait de feu est visible dans les820px du viewport.

### Lot 2 — dernière consolidation
33 tests PASS localement, build/précache et diff sans erreur. Ajout du suivi d'états temporaires
avec durée et expiration, saisie des critiques à0PV, correction vitale explicite.
Aucun sort du grimoire ni animation du vestige ajouté.

### Lot 2 — validation fonctionnelle finale
- Tête fonctionnelle `5bae1dba32e82f4f0b7a14746bb9c585800946aa` validée par CI `41914074751`.
- 33/33 tests, build, contrôle statique et Chromium/WebKit PASS ; hors ligne Chromium PASS.
- Captures Combat/Social/Journal dans l'artefact `kobe-lot2-browser-evidence` du workflow.
- Dernière retouche issue des captures : bouton de tour intégré à la barre de navigation persistante
  pour ne masquer aucune ressource ; emplacements de sorts repliables dans Combat.
- Limites : Safari physique et WebKit offline restant au Lot5 ; réactions/effets externes déclaratifs ;
  variante Majesté par emplacement désactivée ; grimoire complet/vestige/réseau hors de ce lot.


## Clôture Lot 2 — 4 novembre 2026

PR #3 fusionnée : https://github.com/bryantoualy-del/Kobe/pull/3
Commit de fusion : `0f8ea5ed42fe7ba906fda11c57b88bf9f5e63808`.
Tête testée : `c5682366ec552708cd4549f24fd6d00d51a29675`.
Six commits distants fonctionnels, 13 fichiers ajoutés/modifiés, aucune suppression, base main conservée.
CI finale push `41914513297` et PR `41914522422` : toutes deux **success**.
33 tests Node PASS ; build et contrôles statiques PASS ; formulaires réels Chromium/WebKit PASS.
Navigation, double clic, Inspiration, Manteau/réaction externe, fin/début de tour, reload, Social et journal
exécutés ; reprise hors ligne Chromium PASS. Capture finale Combat inspectée, sans superposition du bouton
de tour sur les ressources ; captures Social et Journal également disponibles.
Captures : https://github.com/bryantoualy-del/Kobe/actions/runs/41914513297/artifacts/13363942843

Moteur : transition pure unique et store Lot1 conservés, migration2 sauvegardée, coûts/effets/journal
atomiques, refus et corrections motivées, aucune dépendance réseau. Capacités de la mission raccordées.
Les12 scénarios exigés sont couverts au niveau moteur/stockage ; la recette UI couvre les chemins
nommés ci-dessus et ne prétend pas avoir cliqué toutes les combinaisons de chaque pouvoir.

Limites restantes : Safari physique (Lot5), rechargement offline WebKit/Linux non validé ; suivi externe
strictement déclaratif ; Majesté par emplacement non autorisée ; Perception de fiche à arbitrer.
Grimoire complet, vestige et réseau non développés conformément à la mission. Prochaine reprise depuis
main, consulter LOT2_RULES.md et les tests avant toute extension, ne pas refaire ce moteur.

## Lot 3 — grimoire, checkpoint moteur et interface (4 novembre 2026)
Base e92ea32 ; branche feat/kobe-lot3-spellbook, aucun travail antérieur écrasé.
La mission utilisateur actuelle prime sur l'ancien intitulé Khar-Vek du Lot3 : grimoire musical.
Trois pages PDF lues/rendues, 19 sorts transcrits, sources Tasha p27 et Xanathar recoupées.
Catalogue, commandes de sorts via transition centrale, coûts via spendAction partagé Lot2,
concentration/horloge/repos/receipts/undo/store conservés. Favoris et grimoire sur le même lancement.
71 tests Node PASS (33 préexistants +38 Lot3), build et contrôle statique PASS.
Interface et recette navigateur en cours : aucun PASS navigateur Lot3 encore revendiqué.

### Lot3 — première CI et consolidation
PR #4 ouverte, tête8809012. CI41917756820 : 71 tests/build PASS et ancienne recette Lot2
Chromium+WebKit PASS. La nouvelle recette a révélé qu'elle cliquait les favoris avant la fin
de leurs sauvegardes asynchrones. Attente explicite des commits ajoutée ; interface rendue
inerte pendant une transaction pour éviter les commandes UI qui se chevauchent.
Ajout de deux tests de compatibilité (Manteau/PV temp externe et résolution legacy interdite)
ainsi que synchronisation du pool de PV temp des cibles. 73 tests locaux PASS.
Rapport de cas et résultats attendus ajouté à LOT3_SPELLBOOK.md. Nouvelle CI requise.

### Lot3 — accessibilité et reprise des données
Deuxième CI : tests/build et recette Lot2 PASS ; la recette Lot3 a identifié les libellés des
sélecteurs imbriqués (nom accessible incluant les options). Noms accessibles explicites ajoutés.
74 tests locaux PASS, dont rejet des sauvegardes de sorts corrompues. Modules nouveaux formatés
pour revue ; retour en haut d'onglet et captures de viewport ajoutés. CI finale encore requise.

### Lot3 — validation des frontières de tour
77 tests locaux PASS. Vérifications supplémentaires : Cercle applique les dégâts calculés aux PV
locaux via le pipeline Lot2 (y compris CON), Lenteur calcule le retard11+, effets jusqu'à fin du
prochain tour conservés au début du tour. Les sorts à sauvegarde sans concentration ne créent plus
de conteneur vide ; seul l'effet effectivement subi est suivi. Cartes limitées à trois lignes de résumé,
détails complets dans la fiche. Première capture Grimoire inspectée à1180×820 ; palette/portées lisibles.
Troisième CI : tests/build/Lot2 PASS ; attente du rendu Combat ajoutée à la recette avant de compter
les favoris (navigation sauvegardée asynchrone). Pas de statut final avant nouvelle CI.

### Lot3 — dernier contrôle des attaques
78 tests locaux PASS, build/précache et diff PASS. Critique de Trait de feu possible hors20 naturel
uniquement après confirmation d'un effet applicable (paralysie à1,50m par exemple) ; le1 reste raté.
Aucun changement des sorts connus ou des ressources du Lot2. Tête distante finale et résultat CI
seront inscrits à la clôture ; ne pas assimiler ces tests locaux à la recette physique Safari.

### Lot3 — CI complète et revue des captures
Tête571db88 : workflow41919559180 **success**, 78 tests, build et contrôles statiques PASS,
recettes Lot2 et Lot3 Chromium/WebKit PASS, hors ligne Chromium PASS.
Captures Grimoire/Favoris/modale inspectées : aucun chevauchement ; toutefois les favoris repoussaient
l'économie d'action sous le premier écran. Ajout d'un bandeau synthétique PV/CA/économie/concentration/
ressources et en-tête Combat compact, sans retirer les commandes existantes. Recette du viewport
renforcée pour vérifier ce bandeau avec les quatre favoris. Nouvelle capture requise avant fusion.
Recette bandeau : l'ancien sélecteur de PV est devenu ambigu (deux affichages synchronisés).
Il cible désormais explicitement le panneau PV d'origine ; aucune assertion de valeur retirée.


## Clôture Lot 3 — 4 novembre 2026

PR #4 fusionnée : https://github.com/bryantoualy-del/Kobe/pull/4
Commit de fusion : `7d4f95d4c0e4ada6ef93576d7bac8902ffc1765a`.
Branche : `feat/kobe-lot3-spellbook` ; tête testée : `d873c0541832313b6ea6bc3a175a415b40f762a0`.
Base : `e92ea32` ; revue distante :7 commits devant,0 derrière,17 fichiers, aucun fichier supprimé.
Le commit de clôture suivant est documentaire : aucune modification du code testé.

Validation finale : https://github.com/bryantoualy-del/Kobe/actions/runs/41920259091 — **success**.
- `npm test` :78/78 PASS (33 existants et45 nouveaux).
- `npm run build`, `npm run test:e2e` (statique), `git diff --check` :PASS.
- `node scripts/browser-smoke.mjs` : scénarios Lot2 Chromium/WebKit PASS ; offline Chromium PASS.
- `node scripts/spellbook-browser.mjs` : filtres/recherche/détails,4favoris persistants,
  disponibilité, Boule multi-cibles avec sauvegardes distinctes et PV68/84, slots, Cercle/reload,
  remplacement par Lenteur, modales et bandeau économie/ressources à1180×820 PASS dans les deux moteurs.
- Hors ligne après premier chargement : grimoire19sorts et reprise Chromium PASS.
- Captures finales Grimoire, Combat/favoris et modale WebKit inspectées, sans débordement horizontal.

Captures complètes : https://github.com/bryantoualy-del/Kobe/actions/runs/41920259091/artifacts/13366377537
Catalogue et cas de tests : [LOT3_SPELLBOOK.md](LOT3_SPELLBOOK.md), `src/kobe/spell-catalog.js`.

Aucun sort de la fiche omis. Les effets narratifs restent soumis au MJ (illusions, tâche de Suggestion,
réparation et refuge/terrain) ; déplacements et fins de tour externes sont déclarés, pas inventés.
Incantations longues/rituelles : confirmation rétrospective d'une durée achevée sans interruption,
avec consommation atomique à la fin, sans simulateur intermédiaire. PV externes inconnus : montants
à annoncer ; PV déclarés : application locale. Sources autorisées et résumés originaux uniquement.
Safari iPad physique et reload offline WebKit non validés, à conserver dans la recette Lot5.
Khar-Vek complet et intégration réseau restent hors de cette mission. Reprise depuis main sans refaire
l'économie, les ressources, la concentration, le store ou le grimoire.

## Lot 4 — Khar-Vek, checkpoint moteur (4 novembre 2026)
Base `8447c0b`, branche `feat/kobe-lot4-kharvek` ; Lots1–3 conservés et78 tests initiaux PASS.
La mission actuelle remplace l'ancien intitulé réseau du Lot4 : vestige, dragon et soins locaux.
Fiche et illustration officielles relues : tambour à portée/main libre, Silence sur Kobe OU cible,
ni morts-vivants ni artificiels ; inconscients admissibles aux soins directs, Manteau conserve ses
conditions. Fonctions de dés/PV extraites du Lot3 sans modification pour partage, transition et
store uniques. Trois pouvoirs, synergie Manteau atomique, aube distincte du repos, reçus et undo.
Interface, captures et recette navigateur encore en cours ; aucun PASS visuel revendiqué.

### Lot 4 — checkpoint interface / P1
111 tests Node PASS (78 préexistants +33 nouveaux) ; build et contrôle statique PASS.
Widget SVG original rouge/or inspiré du tambour officiel, six marques dérivées des charges,
quatre stades du dragon, contrôles directs et Manteau contextuel raccordés. Animation légère,
option sans animation et préférence OS respectées. Percussion P1 écrite : fenêtre configurable
400–1600ms (800 par défaut), 1/3 sélectionnent un brouillon, 2 invalide, reset/annulation.
Aucune percussion ne reçoit le dispatcher ; aucun coût/soin avant formulaire confirmé.
Moteurs locaux Playwright absents et téléchargement navigateur indisponible dans ce runtime :
validation réelle prévue dans GitHub Actions Chromium/WebKit, sans revendiquer encore son succès.

### Lot 4 — première CI et consolidation
PR #5 : https://github.com/bryantoualy-del/Kobe/pull/5 ; moteur distant `d0277a5`.
Première tête UI `00f1859` : tests/build PASS ; recettes Lots2–3 Chromium/WebKit PASS.
La recette Lot4 a exécuté les trois soins, coûts uniques, annulation, reprise et frappes1/2/3
sous Chromium puis buté sur son bouton Reset dans un panneau replié après une correction.
Le test ouvre désormais ce panneau avant de cliquer Reset ; aucune assertion fonctionnelle retirée.
113 tests locaux PASS après ajout échec de sauvegarde/retry/reprise et undo complet du Manteau.
Guide LOT4_KHARVEK.md ajouté ; nouvelle CI exigée avant fusion, Safari physique toujours non vérifié.

### Lot 4 — revue visuelle
Premières captures Chromium0/6 et formulaire Survivants inspectés : tambour/dragon et coûts
lisibles, mais la navigation persistante masquait le haut des captures du panneau. Les captures
centrent désormais le widget avant prise de vue. Ancre Khar-Vek depuis le bandeau de ressources
pour accès rapide, contraste des raisons d'indisponibilité renforcé (texte conservé opaque).
Aucun effet mécanique changé. Nouvelle tête finale à vérifier dans Chromium ET WebKit.


## Clôture Lot 4 — 4 novembre 2026

**Terminé et fusionné dans main**, PR #5 : https://github.com/bryantoualy-del/Kobe/pull/5
Branche conservée : `feat/kobe-lot4-kharvek` ; base `8447c0b`.
Fusion : `34183eec35d664de85ddd74401200d3438c68b7b`.
Tête fonctionnelle testée : `2c45e803627f6a7802a7c68debaf7137d932317b`.
Quatre commits distants fonctionnels,17 fichiers ajoutés/modifiés, aucun fichier supprimé,
0commit derrière main avant fusion. Le présent commit de clôture est documentaire uniquement.

CI finale : https://github.com/bryantoualy-del/Kobe/actions/runs/41923371307 — **success**.
- `npm test` : **113/113 PASS** (78 préexistants +35 nouveaux).
- Build autonome, précache, contrôle statique `test:e2e` et `git diff --check` : PASS.
- Recettes réelles Lots2,3,4 : **Chromium ET WebKit Linux PASS**,1180×820.
- Lot4 : contrôles directs, Pulsation/Ralliement/Manteau+Survivants, jet partagé, coûts uniques,
  double soumission, annulation sans dépense, reprise locale, aube et affichages0–6 PASS.
- Dragon0–1/2–3/4–5/6 dérivé des charges, commandes tactiles>=44px, absence de débordement,
  réduction OS et commande sans animation : PASS. Captures0/3/6 et WebKit6 inspectées.
- P1 **effectivement implémentée et testée** dans les deux moteurs :1frappe/3frappes ouvrent un
  brouillon,2invalide, reset/annulation ; aucune dépense/soin avant confirmation. Fenêtre800ms
  par défaut,400–1600configurables (contrôle unitaire). Son et haptique non livrés.
- Hors ligne **Chromium PASS** : rechargement puis véritable pouvoir confirmé et sauvegardé.
- Tests moteur complémentaires : refus atomiques (action/bonus/ressources/Silence/conditions),
  plafonnement, PV temp conservés, inconscients, replay après reload/undo, restauration intégrale
  du Manteau, échec d'écriture sans dépense puis retry exact et reprise du store.

Démonstration exécutée : Pulsation4/5/6 →20PV (Kobe43→63) ; Ralliement4/5 →14PV par cible
(Kobe63→77, alliés10→24 chacun) ; Survivants8 →13PV (Roark24→37) +11PV temp,
exactement1bonus,1Inspiration et1charge. Les cas de plafonnement sont également testés.

Captures finales et formulaires :
https://github.com/bryantoualy-del/Kobe/actions/runs/41923371307/artifacts/13368440877
Règles, usage et scénario reproductible : [LOT4_KHARVEK.md](LOT4_KHARVEK.md).

**Limites maintenues** : Safari iPad physique et reload offline WebKit non validés ; tests à
1180×820 ne constituent pas une mesure de performance sur matériel iPad. Cibles/portées/Silence
externes confirmés à la table ; PV déclarés suivis localement, aucune mutation distante. Réglages
rythme/confort de session non persistés (les règles et ressources le sont). RPG Connect non intégré.
Kobe est jouable localement avec ses pouvoirs après premier chargement et cache complet, sans
serveur RPG Connect. Prochaine reprise : Lot5 recette/livraison depuis main, sans refaire Lots1–4.

## Reprise du Lot 5
PR Kobe #6, Encounter #21 et RPG-Connect #7. 127 tests Kobe, 10 tests serveur, 7 scénarios historiques et 111 contrôles d’autorité réussis sur les candidats. La recette réunit les sept clients et Encounter. L’initiative, les PV et la reprise sont exercés en salle isolée. Les soins alliés restent annoncés oralement. La production vérifiée sert le Lot 4. Le rechargement forcé après HTTP 503 avec WebKit Linux bloque la fusion. Voir scripts/resume-browser.mjs. Safari physique reste à tester. Portrait extrait de la page 2 et emblème officiel de Kobe intégrés à la coque et au cache.

## V1.1 — A
Audit des quatre dépôts effectué. Base PR #6 retenue. Voir KOBE_PARITY_MATRIX.md.
