# Kobe — reconstruction sur le socle Kentaro (2026-11-08)

## Décision
La V1.4 de Kobe n'est **pas** le modèle de référence pour la nouvelle interface. La refonte part des patterns fonctionnels de **Kentaro/main** (commit `68dee93a8ed5e5330ff8287be56ae62473f0edee`). Ne pas recopier ses règles de classe ni ses contenus de personnage.

## Références étudiées
- Kentaro : `index.html`, `companion-turnbar.js`, `social-dice.js`, `dice-engine.js`, `companion-responsive-polish.css`. Architecture web autonome, header identitaire avec PV/CA, barre d'économie de tour, navigation de sections, moteur social distinct, panneaux spécifiques aux capacités.
- Kobe : `index.html`, `src/ui/app.js`, `src/ui/styles.css`, `src/ui/support-ui.js`, `src/ui/spell-ui.js`, `src/ui/kharvek-ui.js`. Application modulaire avec stockage métier et connexion à RPG Connect. Conserver ces contrats de données jusqu'à migration prouvée.
- Sources de jeu : `Kobe Kozzo lv10.pdf`, et `Une promesse à tenir.pdf`.

## Objectif de produit
1. **Combat Kentaro** : header de personnage constamment visible, PV et PV temporaires directement modifiables, CA/DD, tour et économie action/bonus/réaction/déplacement, accès immédiat aux quatre actions de Kobe sans panneaux superflus. Lancer une attaque ou un sort ne demande pas de formulaire de cible.
2. **Sorts** : grimoire lisible et compact, emplacements N1–N5, favoris, concentration et journal cohérents avec Kentaro ; tous les sorts proviennent de la fiche Kobe.
3. **Social** : d20 plein écran seulement pour les jets sociaux ; compétences, expertise, notes.
4. **Khar-Vek** : instrument signature avec 6 charges corrigeables d'un toucher, ses trois pouvoirs et les coûts 1/3/1. Pas de choix obligatoire de cible ni de mécanique de percussion fictive.
5. **RPG Connect** : participant `kobe`, état réseau visible, signalement de fin de tour au MJ (pas de fin de tour imposée à la table), Groupe et conditions ; panneau flottant accessible à la demande sans masquer la cible.
6. **Identité** : obsidienne #151419, cuivre #B86637, rouge #872F35, or #E5B963, ivoire #F0E5CE ; emblème officiel.

## Fiche de référence Kobe niveau 10
PV 83, CA 15, DEX 14, CON 16, CHA 20, initiative +4, déplacement 9 m, attaque magique +9, DD 17 ; 5 Inspirations bardiques d10, 4 Cris draconiques, Manteau d'inspiration, Manteau de majesté, Représentation captivante, Trait de feu, Secrets magiques Boule de feu et Cercle de pouvoir. Khar-Vek éveillé : 6 charges, Pulsation réparatrice 3d8+5/1 charge, Rythme de ralliement 2d8+5 jusqu'à 3 cibles/3 charges, Manteau des survivants 1d10+5/1 charge avec Manteau d'inspiration.

## Séquencement de construction
- **Étape 0 (créée)** : branche isolée à partir de main, documentation des invariants et de la référence Kentaro, sans suppression de code ou migration de sauvegardes.
- **Étape 1** : reconstruire shell/header/nav/turnbar en reproduisant les interactions éprouvées de Kentaro ; tests navigation portrait/paysage iPhone et iPad.
- **Étape 2** : porter le moteur de combat de Kobe sur cette interface, avec actions directes et économie de tour ; tests de ressources et d'annulation.
- **Étape 3** : grimoire et social, sans popups de paramètres en combat.
- **Étape 4** : Khar-Vek, animations optionnelles et récupération des charges.
- **Étape 5** : RPG Connect, Groupe, état réseau, offline, migrations et recette régression.
- **Étape 6** : tests `npm test`, `npm run build`, `npm run test:e2e` puis PR pour validation.

## Garde-fous
Ne pas forcer ni réécrire `main` ; ne pas effacer les anciennes sauvegardes ; ne pas copier les mécaniques d'occultiste de Kentaro ; ne pas déclarer la refonte livrée ou déployée sans tests. La PR reste en brouillon jusqu'à la recette.
