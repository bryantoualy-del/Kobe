# Kobe Companion V1 — spécification persistante

Version documentaire 1, 4 novembre 2026. Destination : bryantoualy-del/Kobe.
Personnage fixé : Kobe Kozzo, kobold, barde 10, Collège du Glamour / Séduction, Compagnie Créole.
Référentiel D&D 5e 2014, extensions explicites et règles maison identifiées ; aucune mécanique 2024 implicite.
Les valeurs et arbitrages détaillés sont dans [RULES_AND_ASSETS.md](RULES_AND_ASSETS.md).

## But et frontières

Companion jouable seul, fluide à la table, indépendant de Pilot20/Forge/créateur et du serveur.
Le MJ annonce résultats, distances et narration ; le joueur confirme les faits non connus du logiciel.
Automatiser calculs, coûts, ressources, échéances et journal, sans inventer les décisions de la table.
Lot 0 : documentation et contrats seulement. Aucun développement anticipé des Lots 1–5.

## Exigences P0

| ID | Exigence | Critère de livraison |
|---|---|---|
| P0-01 | Identité premium, française, obsidienne `#151419`, cuivre `#B86637`, rouge `#872F35`, or `#E5B963`, ivoire `#F0E5CE` | Palette centralisée ; portrait préservé, proportions intactes ; aucun faux emblème officiel |
| P0-02 | Quatre onglets : Combat, Sorts & pouvoirs, Social, Journal | Navigation stable, un seul niveau principal ; aucun cinquième onglet imposé par le réseau |
| P0-03 | Tableau de bord inspiré de Brack | PV/PV temp/CA, concentration, action/bonus/réaction, ressources et quatre favoris visibles à 1180×820 ; fin de tour claire ; pas de chevauchement |
| P0-04 | Grimoire musical inspiré de Samoth | 19 sorts exacts, niveaux et catégories fonctionnelles (dégâts, soin, soutien, contrôle, utilitaire), recherche, détails repliables ; jusqu'à quatre favoris persistants, commandes identiques à Combat |
| P0-05 | Fiches de sorts détaillées | Incantation, portée, cibles, composantes, durée, concentration, jet/DD, dés, surincantation, source, limites automatiques ; fonctionne hors ligne ; les bardes connaissent leurs sorts, pas de préparation inventée |
| P0-06 | Moteur de règles et économie 2014 | Action/bonus/réaction distinctes, validation avant dépense, restriction des sorts en action bonus, résolution séparée du lancement, jets numériques ou physiques, résistances appliquées une seule fois |
| P0-07 | Inspiration et Glamour | d10, 5 utilisations RC/RL ; Manteau 11 PV temp sur ≤5 cibles ; réaction de déplacement volontaire ; représentation et Majesté avec durées/conditions/coûts exacts |
| P0-08 | Cri draconique et Trait de feu | Cri bonus 4/RL, expiration début du prochain tour ; Trait 2d10/+9 au niveau 10, origine raciale distincte |
| P0-09 | Khar-Vek | Six charges persistantes, trois pouvoirs, recharge à l'aube distincte du repos long, restrictions, jet unique de Ralliement et synergie atomique Survivants/Manteau |
| P0-10 | Tambour interactif, dragon rouge évolutif | Charges visibles de 0 à 6 ; apparence dérivée des charges ; feedback court ; sélection et confirmation distinctes de la dépense ; commandes accessibles équivalentes |
| P0-11 | PV, effets et ressources | PV plafonnés, PV temporaires non cumulés, concentration unique, expiration par événements de tour, états et corrections manuelles traçables ; RC/RL/aube séparés |
| P0-12 | Persistance et hors ligne | Fermeture/rechargement/reprise sans perte après commit ; export/import versionné, sauvegarde avant migration ; aucune dépendance CDN, authentification ou serveur pour jouer après installation complète |
| P0-13 | RPG Connect V5 compatible | Adaptateur isolé ; autorité personnelle et confidentialité Table Libre ; invitation, groupe, tour, corrections MJ explicites et reconnexion sans rejouer les effets ; absence réseau ne bloque jamais le local |
| P0-14 | Social | Toutes caractéristiques, compétences, sauvegardes et passifs de la fiche ; avantage/désavantage/jet physique ; historique, notes privées et personnalité ; anomalie Perception visible |
| P0-15 | Journal minimal | Action, coût, cibles, dés, effets appliqués, correction, source et identifiant ; rouge dégâts, vert soins, bleu PV temp, neutre informations ; export |
| P0-16 | Support principal | iPad Air 5 / Safari paysage ; cibles tactiles proposées ≥44 px, texte lisible, pas de dépendance au survol, réduction des animations ; autres formats restent utilisables |

## P1 (ne bloque pas le socle P0)

- P1-01 : soins et effets alliés avancés, dont application distante seulement après accord du protocole et du bénéficiaire.
- P1-02 : interactions conditionnelles avancées entre plusieurs personnages ; aucun état distant supposé connu.
- P1-03 : journal enrichi, filtres et relecture plus poussée de session.
- P1-04 : enrichissements visuels/sonores du tambour et du dragon, sans retarder les actions ni rendre les animations obligatoires.

Provenance des priorités : mission présente et récupération du message utilisateur du 30 octobre 2026 16:42.
La récupération confirme les catégories P0/P1 ci-dessus mais ne restitue pas le texte initial intégral.
Les identifiants et critères mesurables sont une décomposition technique de ce Lot 0, pas une citation littérale.
Le dragon et les quatre favoris sont explicitement requis par la mission présente, donc ne sont pas reportés en P1.

## Interaction du tambour : proposition à tester au Lot 3

La mission impose l'interactivité mais n'impose pas ici de cadence chiffrée.
Les prototypes utilisent 1 frappe → Pulsation, 3 frappes → Ralliement, 2 frappes → aucune activation,
fenêtre 800 ms ; conserver comme candidat UX, pas comme règle de jeu officielle.
Survivants est proposé dans la confirmation du Manteau, jamais une action indépendante.
Toute séquence ouvre un brouillon ; validation unique après choix des cibles, annulation sans coût.
Un bouton explicite doit offrir chaque pouvoir sans geste rythmique. Son désactivé par défaut ; haptique facultative
si supportée, aucune promesse de vibration iPad. Dragon à 0/3/6 charges testé, sans bonus mécanique nouveau.

## Critères transversaux obligatoires

- Double clic/frappe, même message réseau ou même tour confirmé : une seule application et une seule dépense.
- Une sauvegarde, une concentration ou une résistance non renseignée attend une décision, jamais un succès inventé.
- Annulation avant validation : aucune dépense. Annulation après effet : correction explicite, pas de remboursement silencieux.
- Un soin aux autres en mode autonome est un calcul/une intention annoncée : distinguer suivi local et état du bénéficiaire.
- Mode Table Libre : pas de diffusion des notes, inventaire, ressources ou jets privés.
- Toute règle maison est nommée et configurable sans altérer le socle officiel.
- Les cas d'acceptation de [LOTS.md](LOTS.md) et les contrats sont normatifs ; pas de déclaration « tout automatisé » sur la seule présence de boutons.
