# Kobe — Audit UX, design, iPhone et RPG Connect
Date : 6 novembre 2026. Audit et propositions ; aucune modification fonctionnelle dans ce lot.

## Conclusion
Kobe possède désormais un socle fonctionnel conséquent, mais son assemblage mobile reste moins cohérent que les meilleurs écrans des Companions. Le problème principal est la hiérarchie de l'information et l'accès aux commandes, pas l'absence d'illustrations ou de capacités. La compatibilité réseau testée ne doit pas être confondue avec une livraison complète de l'écosystème.

## Périmètre et preuves
Lecture des sources et comparaison des interfaces réelles dans un navigateur, avec des cadres de largeur CSS mobile (notamment 375 et 390 px). Ce dispositif compare le responsive ; il ne simule ni Safari iOS, ni son clavier, ni les zones de sécurité, ni les interruptions système. Aucune validation physique iPhone/iPad réalisée. État de jeu local de test conservé ; aucun compte ni combat de production manipulé.

| Dépôt | Révision main examinée |
|---|---|
| Kobe | 0cdd548f10201cbdede87a654aac1209142dc862 |
| Brackmard | 08e4b2b1d2021b565db597a2c8eece713bee520a |
| Samoth | b54146a9717d32f55fc7a0ad96cacccd6e69d3de |
| Kentaro | e82db1c |
| Rufus | a9e4bd8351ccaf6b7f007ddd6c476e666e7eb6d5 |
| Nans | d82530dc59a2abd948be0aba06df85a875e2a9a3 |
| Zephyr | f773ff9c814a9470a93efec2eaebbe7fa974189e |
| RPG-Connect | bec8927 |
| Encounter | ff447ea |

CI Kobe PR11, exécution 42295498186 : 152 tests moteur, build et suites navigateur Chromium/WebKit, intégration sept clients réussis. Ces résultats préexistants ont été consultés ; ce lot d'audit n'est pas une nouvelle recette complète. Les tests WebKit ne constituent pas une validation sur iPhone physique.

## Comparaison
| Axe | Référence utile | Situation Kobe | Direction |
|---|---|---|---|
| Combat | Brack : économie de tour, raccourcis, annulation | Actions directes rétablies, mais commandes essentielles hors champ sur téléphone | Garder le moteur et reprendre une barre réellement responsive |
| Lisibilité mobile | Rufus et Zéphyr : commandes de tour visibles, navigation basse | En-tête trop haut ; navigation calculée statique dans la vue inspectée | En-tête compact contextuel et navigation basse persistante |
| Grimoire | Samoth : filtres, couleurs, sélection du niveau | Cartes déjà réduites, mais longue approche avant le premier sort | Liste compacte, filtres courts et détails à la demande |
| Social | Samoth/Brack : jets et maîtrise | Dés interactifs, désormais réservés au Social ; thème Kobe | Conserver ; vérifier lisibilité du résultat, retour et saisie physique sur iOS |
| Journal | Kentaro : session, archives, PNJ, Obsidian | Modules fonctionnels repris, capture rapide enfouie sous le combat | Mettre la saisie en tête du Journal |
| Identité | Kobe : rouge, cuivre, or, dragon | Forte identité, mais styles hérités parfois disparates | Harmoniser les surfaces tout en conservant les couleurs sémantiques |
| Réseau | Socle RPG Connect commun | Apparence proche, adaptation de transport différente ; dépendances de livraison ouvertes | Vérifier le système déployé de bout en bout |
| Vestige | Nans : ressource directement manipulable ; Kobe : identité propre | Charges 0–6 directes, mais présentation encore volumineuse et coût du Manteau ambigu | Console de soutien et raccourcis sans popup |

Les références ne sont pas exemptes de défauts. Nans déborde horizontalement sur mobile ; Brack et Nans exposent des navigations redondantes ; les grimoires de Samoth et Kobe restent longs. Il faut reprendre leurs conventions utiles, pas reproduire leurs défauts.

## Constats prioritaires

### P0 — Livraison RPG Connect à distinguer de la compatibilité testée
Le script `scripts/checkout-v5.mjs` épingle RPG-Connect sur `f1c441dbe9bc097e94677b6e98abc9cf66d8fb9d` et Encounter sur `908dfc9091c2620bfb6678e8fc656e913d5fe903`. Ces versions candidates contiennent l'ajout de Kobe.

Au moment de l'audit, les PR suivantes restent ouvertes :
- https://github.com/bryantoualy-del/RPG-Connect/pull/7
- https://github.com/bryantoualy-del/Encounter/pull/21

Le main serveur examiné ne contient que les six identifiants historiques ; le main Encounter ne contient pas encore l'invitation et la création du participant Kobe ajoutées par sa candidate. La suite à sept clients démontre la compatibilité des versions épinglées, pas celle de tout déploiement existant. Le commit effectivement déployé sur Render n'a pas été vérifié : l'accès disponible ne sélectionnait aucun workspace. On ne peut donc pas affirmer que la production échoue, ni la déclarer prête.

Contrat réel de `src/kobe/connect.js` :
- Mode Table Libre V5 accepté ; mode guidé refusé volontairement.
- PV, maximum, PV temporaires, CA, états, concentration et réaction projetés ; portrait vide.
- Événements sortants limités à l'initiative et la demande de fin de tour. Les attaques, sorts et soins ne constituent pas un flux automatique exhaustif.
- Jets privés non diffusés automatiquement.
- Corrections reçues contrôlées et reçus persistants pour éviter les doublons.
- Reconnexion après coupure dans la page ; invitation conservée seulement en mémoire. Après rechargement, il faut la recoller. Brack conserve une configuration de connexion et une reprise automatique.

Recommandation : coordonner revue, fusion et déploiement des dépendances, puis tester une invitation neuve, la présence Groupe, une correction de PV unique et une reprise après fermeture. Garder une distinction explicite entre annonce à la table, partage réseau et correction de fiche.

### P1 — Commandes mobiles et navigation
1. **Soin partiellement recouvert** par la tuile PV temporaires à 375/390 px : la tuile PV reste dans une grille de trois colonnes et ses boutons débordent. Donner toute la largeur nécessaire aux PV/commandes.
2. **Fin de tour hors champ** : à 375 px, son bord gauche était à environ 492 px dans la barre horizontale. La concentration et les repos le sont aussi. Aucun geste horizontal ne doit être requis pour finir son tour.
3. **Navigation statique** dans la vue Kobe inspectée. Rufus, Samoth, Kentaro et Zéphyr proposent un accès mobile bas. Prévoir quatre destinations stables et Groupe via RPG Connect ; respecter la safe-area.
4. **En-tête identique trop volumineux hors Combat** : premier sort à environ 1 021 px du haut à 390 px ; saisie narrative à environ 858 px. L'utilisateur parcourt du combat avant d'atteindre la fonction choisie.
5. **Petites cibles tactiles** : boutons PV de 34 px, certains raccourcis de 35 px ; informations secondaires de 10 px. Cible proposée : commandes principales d'au moins 44 px, texte secondaire lisible sans zoom.
6. **Annuler enfoui** dans Suivi & ajustements. Avec actions immédiates et charges cliquables, proposer un résultat persistant avec Annuler immédiatement accessible.

Sources : `src/ui/app.js`, `src/ui/brack.css`, `src/ui/combat-ui.js`, styles des Companions de référence. Les nombreuses surcharges CSS doivent être consolidées plutôt qu'empilées.

### P1 — Clarté de Khar-Vek
La commande actuelle « Manteau des survivants » déclenche en réalité l'activation combinée du Manteau d'inspiration avec le soin : elle dépense une action bonus, une inspiration et une charge. La mention « 1 charge · avec Manteau » ne rend pas assez visible ce coût complet. Après avoir activé le Manteau ordinaire, le joueur ne peut pas simplement utiliser le bouton comme un ajout : son action bonus est déjà consommée.

Le moteur applique une transaction combinée ; le problème identifié est d'abord la compréhension du bouton. Renommer **Manteau + soin**, afficher le coût complet et le proposer comme alternative directe au Manteau ordinaire. Ne pas ajouter une seconde dépense d'action ou d'inspiration pour le soin.

### P2 — Densité et cohérence
- Les cartes de sorts fermées mesurent déjà environ 179 px dans la vue mobile examinée. Réduire encore tous les textes ne suffit pas : retirer l'en-tête combat du parcours et offrir une liste compacte aura davantage d'effet.
- Trait de feu est très visible et répété, alors que les soins du vestige sont dans une sous-vue. Faire apparaître le rôle de soutien de Kobe dans les raccourcis.
- Notes privées du Social avec sauvegarde explicite versus notes narratives autosauvegardées : uniformiser le comportement et clarifier où écrire.
- Réserver les mentions techniques (révision, détails internes) au diagnostic ; utiliser des résultats en français clair.
- Harmoniser fonds, bordures et espacements. Garder les couleurs de familles de sorts, sans juxtaposer plusieurs thèmes d'interface.
- Les modules Journal, PNJ, portraits IndexedDB, archives et export ZIP existent réellement. Ne pas les réécrire ; améliorer leur accès et vérifier le parcours Files/Obsidian sur appareil.

## Khar-Vek : proposition ouverte

### Règles à conserver
Référence : illustration officielle « Le Battement des Survivants » fournie au projet, plus moteur existant. Six charges ; recharge à l'aube, pas automatiquement à chaque repos. Pas de nouvelle mécanique.

| Commande | Coût total | Résultat affiché |
|---|---|---|
| Pulsation réparatrice | Action + 1 charge | 3d8+5 PV ; un bénéficiaire |
| Rythme de ralliement | Action + 3 charges | 2d8+5 PV chacun ; jusqu'à trois bénéficiaires ; un jet commun |
| Manteau + soin | Bonus + 1 Inspiration + 1 charge | Manteau : 11 PV temporaires ; soin supplémentaire 1d10+5 pour un de ses bénéficiaires |

Les limites de portée, de visibilité et de silence restent consultables dans des détails repliés. Les bénéficiaires sont annoncés oralement ; aucun questionnaire de cible, nombre ou contexte.

### Trois directions possibles
| Option | Intérêt | Limite |
|---|---|---|
| Console de soutien | Dragon lisible, trois commandes explicites, coûts et résultat réunis | Une sous-vue reste nécessaire pour la présentation complète |
| Vestige directement dans les raccourcis Combat | Utilisation la plus rapide, rôle de soutien évident | Moins de place pour l'illustration |
| Vue immersive plein écran | Mise en scène du dragon | Masque l'économie de tour et ajoute des déplacements ; mauvaise vue principale |

**Recommandation : combiner les deux premières.** Trois raccourcis dans Combat ; sous-vue Khar-Vek pour le dragon, les charges et les mêmes commandes, sans logique dupliquée.

Sur iPhone :
- Petit en-tête PV/CA et navigation basse ; titre Khar-Vek avec compteur.
- Dragon horizontal d'environ 100–120 px de haut.
- Sept boutons 0 à 6 sur une seule ligne : 7 × 44 px + 6 × 4 px = 332 px. Le compteur ne partage pas cette ligne.
- Trois commandes pleine largeur, compactes, avec nom, effet et coût ; pas de cartes de 156 px en deux colonnes.
- Résultat immédiatement sous les commandes, avec Annuler. Exemple : « Ralliement : 17 PV chacun · jusqu'à 3 bénéficiaires · charges 6 → 3 ».
- Choix d'une charge = valeur finale directement enregistrée et annulable, sans bouton Corriger.

Sur iPad : dragon à gauche et commandes alignées à droite, dans le même ordre que sur téléphone. Éviter une disposition radiale qui oblige à chercher les capacités autour du dragon.

Le dragon officiel reste la source visuelle. L'actuel remplissage va bien globalement de droite à gauche, donc de la queue vers la tête, mais utilise une coupe verticale : il ne suit pas le corps serpentin. Préférer six zones successives le long du corps, reliées aux six orbes. À zéro : intérieur grisé et contour discret ; à six : rouge/or pleinement visible. Animation légère après validation de la transaction, désactivable avec réduction des mouvements. Aucun geste de percussion, aucune fenêtre temporelle, aucun nouveau dessin de tambour.

## Ordre de correction proposé
1. Dépendances RPG Connect et vérification du déploiement réel.
2. En-tête mobile, PV, Fin de tour visible, navigation basse, résultat/Annuler.
3. Console Khar-Vek, coût combiné clair et raccourcis de soutien.
4. Grimoire compact, capture narrative prioritaire, notes cohérentes.
5. Harmonisation graphique et progression serpentine du dragon.

## Critères de recette
- À 375, 390 et 430 px : aucun chevauchement PV ; Fin de tour visible ; accès aux quatre vues sans remonter ; aucune commande essentielle uniquement accessible par défilement horizontal.
- À 1180 × 820 : barre sticky sans chevauchement et commandes confortables.
- Sorts : recherche/filtres et premier résultat rapidement visibles ; niveau seul demandé lorsque nécessaire.
- Khar-Vek : charges 0/3/6, dépense, correction directe, Undo, recharge à l'aube et restauration après rechargement ; transaction du Manteau combiné vérifiée.
- Réseau : versions déployées identifiées, invitation Kobe neuve, Groupe, correction idempotente, jets privés, coupure/reconnexion et fermeture/reprise.
- iOS physique : clavier du Journal, safe-area, rotation, Files/ZIP, Obsidian, fermeture/reprise et hors ligne.
- Ne pas déclarer la parité atteinte sur la seule base de tests automatisés.
