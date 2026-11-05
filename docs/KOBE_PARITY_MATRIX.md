# Matrice à l’entrée du chantier
| Fonction | Code de référence | Écart constaté et intervention |
|---|---|---|
| Dashboard/navigation | Brackmard companion-v3.js, index.html | Quatre onglets présents, statistiques répétées. Regrouper dans le bandeau. |
| Tour | Brackmard companion-turnbar.js | Commandes dispersées. Afficher disponibilité, repos et tour en continu. |
| Combat/dés | Samoth dice-engine.js | Calculs de sort existants. Porter la présentation locale des jets. |
| Social | Samoth social-dice.js, social-dice.css | Bonus textuels. Relier chaque valeur à un jet privé. |
| Grimoire | Samoth companion.js, Kobe spell-ui.js | Garder filtrage, résolution MJ, emplacements et quatre favoris. |
| Inventaire | Kentaro kentaro-inventory.js | Gestion absente. Adapter le carnet d’objets sans importer les armes de Kentaro. |
| Journal et notes | Kentaro kentaro-journal.js, kentaro-session.js | Journal mécanique seul. Porter capture, archives et export. |
| PNJ | Kentaro kentaro-session.js | Porter distribution, faits, mentions et portraits IndexedDB. |
| Obsidian | Kentaro main.js, styles.css, manifest.json et guides iPad | Lecteur mono-source, écrasement média et duplication possibles. Étendre le plugin en place. |
| RPG Connect | Kobe connect.js Lot 5, Brackmard rpg-connect-client.js | Adapter l’interface sans diffuser de jets privés. |
| Persistance/hors ligne | Kobe storage.js et sw.js | Ajouter les modules et images au cache atomique. |
| Khar-Vek | Kobe kharvek.js, kharvek-ui.js | Dragon SVG générique. Afficher l’illustration fournie aux sept valeurs de charge. |

## Résultat de la mise en œuvre
| Fonction | Vérification réalisée | Contrôle restant |
|---|---|---|
| Dashboard et navigation | Quatre onglets, en-tête compact avec valeurs et ressources, commandes principales dans le premier écran à 1180 × 820 | Appréciation ergonomique par le joueur |
| Tour | Barre sticky, RC/RL, dépense, tour suivant, compteur des dégâts de sorts effectifs, disponibilité et annulation | Manipulation physique en paysage |
| Combat et dés | Résolutions de sorts, corrections et maintien ou perte de concentration par le moteur existant | Annonce et arbitrage à la table |
| Social | 31 jets directs, 3 modes, jets physiques et numériques, 3 passifs. Perception +10 conservée avec son explication | Confirmation MJ de la valeur de fiche |
| Grimoire | 19 sorts, filtres, détails, emplacements, quatre favoris, sorts multicibles et concentration exécutés | Revue visuelle par le joueur |
| Inventaire | Registre de Kentaro adapté, catégories, notes, quantités, icônes et import/export JSON | Revue des objets de campagne à saisir par le joueur |
| Journal | Capture, recherche, édition, suppression, notes libres, journal mécanique filtrable, consultation et ZIP d’archive | Essai avec une séance longue sur iPad |
| PNJ et portraits | Distribution de 20 maximum, nouvelle fiche, rencontre, faits, portrait relu après rechargement. Absent exclu du ZIP | Sélecteur de fichiers iPadOS |
| Obsidian | Ancien ZIP et ZIP Kobe importés avec le même code. PNJ partagé, statut décoché, portrait conservé, réimport sans doublon | Import sur Obsidian iPad avec le coffre DND réel |
| RPG Connect | Salle isolée avec Encounter, sept vrais clients, synchronisation des PV et reconnexion. Serveur testé à la révision du Lot 5 | Déploiement coordonné des candidats Lot 5 |
| Sauvegarde et hors ligne | Tests de migration, reprise de profil, panne d’origine et soin. Détails dans KOBE_V11_VALIDATION.md | Veille et redémarrage sur matériel |
| Dragon | Illustration officielle présente, sept états, captures 0/3/6, dépense, aube et rechargement | Rendu et confort sur écran physique |
