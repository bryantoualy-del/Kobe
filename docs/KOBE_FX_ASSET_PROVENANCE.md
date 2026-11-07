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
