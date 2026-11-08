# Kobe FX — provenance et licences (pilote)

## Assets réellement intégrés

Source : **Kenney Particle Pack 1.1**, par Kenney Vleugels, licence **Creative Commons Zero (CC0 1.0 Universal)**.
- Catalogue officiel : https://kenney.nl/assets/particle-pack
- Copie du pack source / licence : https://github.com/Calinou/kenney-particle-pack
- Licence du dépôt source : https://github.com/Calinou/kenney-particle-pack/blob/master/LICENSE.txt

Quatre fichiers PNG sont copiés **sans modification** depuis `addons/kenney_particle_pack/` de cette copie CC0 :

| Fichier local | Source | Utilisation |
| --- | --- | --- |
| `src/ui/fx/kenney/flame_02.png` | `flame_02.png` | Cœur de Boule de feu |
| `src/ui/fx/kenney/magic_03.png` | `magic_03.png` | Cœur du Manteau et Khar-Vek |
| `src/ui/fx/kenney/circle_05.png` | `circle_05.png` | Cercles d'onde |
| `src/ui/fx/kenney/spark_04.png` | `spark_04.png` | Étincelles projetées |

La licence CC0 permet l'usage et la modification sans attribution obligatoire ; la provenance est conservée pour audit. Les effets CSS supplémentaires sont propres à Kobe. **Aucun asset Spell FX payant ni fichier Rive n'a été importé.**

## Architecture

`src/ui/kobe-vfx.js` produit les effets d'interface non interactifs. `src/ui/app.js` ne les déclenche qu'après succès d'une commande mécanique et hors rejeu. Aucun effet ne modifie les ressources, les points de vie, le journal ou RPG Connect.

`sw.js` précache les quatre fichiers pour le mode hors ligne. Le build régénère la capsule `offline-shell.js` ; le fichier généré doit aussi être committé pour un déploiement direct depuis la racine sur GitHub Pages. Contrôle final obligatoire : npm test, npm run build, npm run test:e2e puis recette Safari iPhone/iPad.

Pour une amélioration future : sélectionner un pack de spritesheets de sorts réellement licencié, intégrer un lecteur de séquences et remplacer les animations qui en bénéficient. Rive reste optionnel : ne pas acheter de licence ni en ajouter le runtime sans besoin validé.

## V2 — reprise PR #22 (8 novembre 2026)

### Recherche externe — PAS ENCORE IMPORTÉE
- Spell FX Free, heyheythere : https://heyheythere.itch.io/spell-fx-free — CC BY 4.0, attribution requise, spritesheets transparentes 128/256 px et JSON (6 effets). Archive non récupérée.
- PVFX Foundry, nerijs / Pixel VFX Studio : https://nerijs.itch.io/pvfx-foundry — CC0, 101 effets, atlas et métadonnées. Style pixel art à valider. Archive non récupérée.
- Fire and Spell Animations, ztn / Spiney : https://opengameart.org/content/fire-and-spell-animations — CC0, animations avec alpha et spritesheets. Archive non récupérée.
- Spell FX Premium : https://heyheythere.itch.io/spell-fx — payant, non acheté ni téléchargé.

**Aucun asset animé professionnel externe n'a encore été importé dans la branche.** Les quatre PNG Kenney restent des images fixes. Ne pas les présenter comme une livraison premium terminée.

### Code réellement ajouté
- `src/ui/sprite-vfx.js` : lecteur Canvas 2D de spritesheets en grille, timing en FPS ou durées par frame, bouclage, chargement local, validation et annulation, `prefers-reduced-motion`. Il n'est pas branché sur les commandes tant qu'aucune archive externe utilisable n'a été intégrée.
- `vfx-gallery.html` : démonstration autonome, sans commande de combat ni dépendance réseau ; les cartes sont marquées explicitement « pilote Kenney ».
- `tests/sprite-vfx.test.js` : vérification du timing, des boucles et des chemins locaux.
- Build et service worker : galerie ajoutée à la distribution et au catalogue offline.

### Points bloquants de livraison
1. Importer les véritables PNG spritesheets et manifestes depuis des archives acquises légalement, vérifier les dimensions et licences fichier par fichier.
2. Mapper les trois effets P0 à ces animations ; garder Kenney uniquement en fallback et maintenir les commandes transactionnelles existantes.
3. Ajouter un catalogue exhaustif + tests avec vrais assets et brancher la galerie premium.
4. Exécuter les commandes CI, synchroniser et versionner la capsule `offline-shell.js` pour GitHub Pages à la racine.
5. Valider la prévisualisation Render, WebKit, Chromium et appareils réels disponibles avant fusion.

**Pas de validation physique Safari, ni de fusion ni de confirmation de production à ce stade.**
