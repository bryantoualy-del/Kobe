# Plan opérationnel Lots 1 à 5

Chaque lot : branche dédiée, modifications bornées, tests pertinents, revue du diff, PR,
SHA exact et mise à jour de KOBE_PROGRESS.md. Fusion seulement sur contrôles satisfaits.
Aucun lot n'exige la finalisation de Pilot20. La récupération de prototypes est sélective, jamais un merge global.

| Lot | Dépendances | Travail | Livraison / preuve | Risques et prévention |
|---|---|---|---|---|
| 1 — socle local | Lot0 | État, commandes pures, économie générique, storage, migrations/export/import, journal minimal, coque quatre onglets, démarrage autonome/offline | Rechargement après action, dernière ressource, double validation, persistance échouée, migration, deux onglets, correction/undo, cache complet ; écran minimal utilisable seul | Code B dépend du packaging Pilot20 : retirer dépendances ; limiter snapshots ; conserver receipts |
| 2 — personnage et règles | Lot1 | Profil complet, 19 sorts, métadonnées, grimoire musical/favoris, Inspiration/Glamour/Cri/Trait, concentration/effets/repos, Social | Comparaison fiche, tests coûts/annulation, restriction bonus dans les deux ordres, jets physiques, multi-cibles/sauvegardes, fins de concentration/durée ; quatre favoris conservés | Mélange 2014/2024 ou DD Samoth : catalogue Kobe ciblé ; MJ-01/03/04/05/07/09 explicites |
| 3 — Khar-Vek et finition locale | Lots1–2 | Trois pouvoirs, cibles, tambour interactif/dragon0–6, portrait/palette, dashboard Brack, feedback, accessibilité/mouvement réduit | Pulsation 1 charge ; Ralliement3/jet unique/3 cibles ; Survivants combiné/1 cible ; silence de l'une ou l'autre partie ; 0/3/6 charges ; RC/RL ≠ aube ; annulation/double frappe | Ressources doublées, mauvais ciblage inconscient, séquence ambiguë : transaction unique et bouton explicite ; emblème collectif non inventé |
| 4 — V5 isolée | Lot1 + état des Lots2–3 stabilisé | Adaptateur local, invitation, inscription Kobe coordonnée serveur/Encounter, groupe, tour et corrections, reconnexion | Serveur canonique et Encounter : invitation réelle, publication publique seulement, correction périmée, double événement/reload, perte réseau en combat, aucune attaque/soin rejoué | Registres main n'acceptent pas Kobe ; pas de dépendance réseau locale ; PR coordonnées, pas de nouveau serveur |
| 5 — recette et livraison | Lots1–4 | Combat complet, conformité P0, audit final visuel/performance, Safari iPad, build offline/reprise/installation, guide, P1 bornés selon capacité | Rapport par scénario/plateforme, captures examinées, erreurs JS nulles sur parcours, état avant/après export ; artefact/version publiée et rollback | WebKit Linux ≠ iPad ; validation physique marquée non faite si absente, pas de faux PASS ; aucun P1 ne masque un P0 manquant |

## Scénarios d'acceptation transversaux

1. Sort avec emplacement et action : une consommation, résultat annoncé puis appliqué une fois ; rejet si ressource indisponible.
2. Manteau sur cinq bénéficiaires, puis variante Survivants : PV temp non cumulés, un seul soin et une seule Inspiration ; déplacement sur consentement de chaque cible.
3. Boule de feu avec plusieurs sauvegardes : un jet de dégâts partagé, réponses distinctes, moitié/résistance appliquées sans doublon ; pas de CA ennemie inventée.
4. Concentration remplacée puis dégâts : confirmation, DD CON, fin/dépendances supprimées une fois ; tests au changement de tour et à 0 PV.
5. Cri bonus puis prochain début de tour : durée exacte, pas d'expiration au simple affichage d'une nouvelle manche.
6. Pulsation/Ralliement : soins plafonnés, créatures interdites, inconscient autorisé quand conditions satisfaites ; ressources insuffisantes et Silence.
7. Repos court/long/aube : récupérations séparées, dés de vie gérés selon 2014, vestige inchangé au repos seul.
8. Tambour : 1/2/3 frappes (mapping proposé), annulation, double confirmation, charges0/3/6, dragon cohérent après reload.
9. Mode avion après installation, fermeture, reprise après veille, export/import : données conservées et journal cohérent.
10. Connexion, invitation, déconnexion pendant action, correction MJ, reconnexion/rejeu : autonomie locale et confidentialité intactes.
11. Portrait/emblème autorisé non déformés, quatre favoris modifiables, aucun overflow à 1180×820, dialogue accessible, réduction animations.
12. Combat complet : plusieurs tours avec sorts, Glamour, vestige, dégâts, soins, repos et correction ; bilan des ressources et journal réconcilié.

Ces scénarios détaillent les exigences récupérées et celles de la mission présente ; ils ne prétendent pas reproduire
mot pour mot une liste originale non restituée intégralement. Le Lot 5 devra annoncer les limites restantes au lieu de les masquer.

## Reprise si prototypes locaux indisponibles

Le Lot 1 utilise ARCHITECTURE.md + INTERFACES.md sans ré-audit. Les références des six Companions sont publiques,
figées par SHA et ancrées dans la matrice. Un futur delta de source se compare au SHA audité, sans invalider tout le dossier.
Le portrait peut être réextrait de la page2 du PDF fourni ; l'emblème collectif reste optionnel tant qu'il n'est pas identifié.
