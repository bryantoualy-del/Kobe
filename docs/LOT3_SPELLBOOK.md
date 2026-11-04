# Lot 3 — grimoire : reprise et contrat

Base : e92ea32, 4 novembre 2026. PR #1–3 fusionnées, aucune branche Lot3 antérieure.
33 tests initiaux et build exécutés avec succès. Trois pages du PDF Kobe lues et rendues.
La mission actuelle remplace l'ancien intitulé « Khar-Vek / identité » du Lot3.
Samoth : companion.js, spellDice/usableSpell/applyCast/renderSpellList inspectés ; seuls les
principes de sélection et de résolution sont repris, sans métamagie ni dépendance réseau.

Inventaire exact : cinq tours de magie (quatre barde + Trait de feu racial), quatorze sorts de
niveaux 1–5, dont Boule de feu et Cercle de pouvoir par Secrets magiques.
Image miroir, Aide et Lenteur : liste étendue optionnelle Tasha, retenue puisque sur la fiche.
Cercle de pouvoir est accessible au barde10 par Secrets magiques, même si le paladin y accède plus tard.
Charme-monstre : Xanathar. Aucun sort supplémentaire ajouté. Injonction reste un pouvoir de Majesté.
Emplacements 4/3/3/3/2 ; DD17, attaque+9, caractéristique CHA+5.

Descriptions : résumés originaux de règles, aucune reproduction des livres fournis.
Référence principale publique : https://www.dndbeyond.com/sources/dnd/basic-rules-2014/spells
Références privées vérifiées : PDF Kobe p.1–3, Tasha options de barde, Xanathar Charme-monstre.

## Cas de recette et résultats attendus

| Cas | Entrée | Résultat attendu | Vérification |
|---|---|---|---|
| Catalogue | Trois pages Kobe | 5 tours de magie +14 sorts ; Secrets Boule/Cercle | tests/spells.test.js, comparaison exacte noms/niveaux |
| Tous les sorts | Lancer chacun depuis état neuf | Action appropriée, un slot au bon niveau sauf cantrip/rituel, effet ou résolution | 19 cas Node |
| Surincantation | Boule N5, dix d6 à3 |30 dégâts bruts ; slot5 de2→1 | Node |
| Boule multi-cibles | Huit d6 à4 ; deux ennemis à100PV | échec32→68PV ; réussite16→84PV (8 si résistance) | Node + navigateur |
| Défenses | Réussite, résistance, immunité, vulnérabilité | Divisions arrondies vers le bas, zéro, double selon choix confirmé | Node |
| Soins | Mot N3 : 4+4+4+5 |17 PV, plafond maximum, pas de résurrection | Node |
| Concentration | Cercle actif → Lenteur | refus sans confirmation ; sinon Cercle retiré, Lenteur suivie | Node + navigateur |
| Cercle |31 dégâts magiques, effet moitié sur sauvegarde | réussite0, échec15 ; refus si non magique ou hors aura | Node |
| Durée | Cercle600s ; dix tours pour Immobilisation60s | effet et concentration expirent au temps fictionnel | Node |
| Sauvegardes répétées | Fin de tour cible paralysée | une décision SAG17, réussite retire cette condition, échec conserve sans doublon | Node |
| Image miroir | d20 6,8,11 et attaques12 | trois doubles détruits, effet retiré | Node |
| Aide | N2 puis N3 confirmé, expiration8h |+5 puis+10 PV réels/max sans cumul, retrait unique à échéance | Node |
| Rituel | Refuge, incantation complète et ininterrompue |11min avancées, zéro emplacement, concentration d’incantation terminée | Node |
| Dissipation | N4 contre N3/N4/N6/N9, d20 9/12 |2 automatiques, 16/DD16 et19/DD19 réussis | Node |
| Favoris |4 connus puis un cinquième |4 persistés ; cinquième refusé ; même spell-cast | Node + navigateur |
| Rechargement | Cercle, favoris, slots et cibles en cours | JSON identique ; concentration et coûts conservés | Node + navigateur |
| iPad paysage |1180×820, cartes et modales |4 favoris visibles, aucune largeur excédentaire, modales à défilement interne | Chromium/WebKit CI |
| Lot2 | Manteau11PV temp puis Boule16 | absorption11, perte5PV, un seul pool | Node + recette Lot2 conservée |

## Automatisation et décisions de table

Les commandes `spell-cast`, `spell-resolve`, `spell-target-turn`, `spell-trigger`, `slot-correct`,
`target-hp` et `favorites` passent par `transition` et le store existant. La façade future RPG Connect
pourra les invoquer avec les mêmes identifiants/révisions et résultats ; aucun DOM requis.
Les dés sont fournis comme résultats détaillés, validés par le moteur pur. L'UI fournit un générateur
crypto ou une saisie de dés physiques. Un jet de zone est partagé, les sauvegardes/résistances sont séparées.
Le journal distingue dégâts effectifs, slots et dés ; les PV inconnus donnent une annonce sans inventer un état.

Les sorts narratifs sont jouables avec leurs contraintes visibles et une description convenue avec le MJ :
Illusion mineure, Prestidigitation, Réparation, Suggestion, Refuge et Terrain hallucinatoire.
Le moteur ne décide pas si un mensonge est cru, si une tâche est raisonnable ou si le refuge est quitté.
« Interaction » permet de terminer un effet selon sa condition ; la durée reste automatisée.
Lenteur/Immobilisation : fins de tour des cibles déclarées, car l'application autonome ne connaît pas leurs tours.
Cercle : couverture et nature magique réévaluées à chaque interaction, calcul annoncé avant défenses supplémentaires, ou appliqué aux PV locaux après confirmation.
Image miroir : redirection et disparition des doubles calculées ; pas de dégâts automatiquement reçus par Kobe
quand l'attaque n'est pas redirigée (résultat final annoncé au propriétaire).
Incantations longues/rituelles : confirmation rétrospective de la durée achevée sans interruption ;
consommation atomique à la fin, sans simulateur de chacun des tours intermédiaires.
Majesté reste une capacité Lot2, Injonction n'est pas ajouté aux sorts connus.
Les ressources d'aube de Khar-Vek restent hors du grimoire et du repos long.

## Limites de validation

Pas de recette Safari sur un iPad physique. Chromium/WebKit Linux vérifient les parcours nommés,
le viewport et la persistance ; ils ne certifient pas le matériel. Hors ligne WebKit non revendiqué.
Aucun effet narratif ou déplacement externe n'est résolu sans confirmation de table.

Moquerie et petits objets de Prestidigitation suivent la fin du prochain tour, sans expirer au début.
Lenteur propose un d20 de retard de sort (11+), et rappelle l’action requise au prochain tour.
Cercle peut appliquer ses dégâts calculés aux PV locaux et utilise les sauvegardes CON du Lot2.
Les critiques d'attaque de sort proviennent soit du20 naturel, soit d'un effet confirmé par le MJ
(par exemple cible paralysée et attaquant à1,50m). Le contexte n'est pas déduit d'une distance inconnue.


## Catalogue livré

| Niveau | Sorts connus intégrés |
|---|---|
|0|Moquerie cruelle ; Illusion mineure ; Prestidigitation ; Réparation ; Trait de feu (racial)|
|1|Mot de guérison ; Murmures dissonants|
|2|Amélioration de caractéristique ; Suggestion ; Image miroir ; Aide|
|3|Lenteur ; Dissipation de la magie ; Boule de feu (Secret magique) ; Refuge de Leomund (rituel)|
|4|Terrain hallucinatoire ; Charme-monstre|
|5|Cercle de pouvoir (Secret magique) ; Immobilisation de monstre|

Livraison fusionnée PR #4, merge7d4f95d ; CI41920259091 **success**,78 tests, Chromium et WebKit,
rechargement offline Chromium. Captures finales dans l'artefact13366377537 du même workflow.
Les limites ci-dessus constituent les décisions de table et les validations matérielles restantes ;
aucun sort connu n'est absent du catalogue ou privé de commande de lancement.
