# Kobe V1 : point d'entrée de reprise

Lire dans cet ordre :
1. [Spécification](KOBE_V1_SPEC.md) : exigences et priorités.
2. [Progression](KOBE_PROGRESS.md) : lots, validations, blocages.
3. [Inventaire](audit/RECOVERY.md) : deux prototypes distincts, aucun à écraser.
4. [Audit et matrice](audit/COMPANIONS.md) : preuves, sources et limites.
5. [Référentiel](RULES_AND_ASSETS.md) : fiche complète, règles, décisions MJ.
6. [Architecture](ARCHITECTURE.md), [contrats](contracts/INTERFACES.md), [plan](LOTS.md).
7. [Contrôles](validation/LOT0.md) et [sources figées](audit/sources.json).

## Démarrage du Lot 1 dans une nouvelle conversation

« Dans bryantoualy-del/Kobe, lire docs/README.md et tous ses documents liés sur main.
Suivre docs/LOTS.md, Lot 1 uniquement. Vérifier le SHA de départ et les PR ouvertes.
Ne pas recommencer l'audit : utiliser les SHA et chemins de docs/audit/sources.json.
Les prototypes de RECOVERY.md ne sont pas main : récupérer seulement les éléments utiles
si leurs commits sont accessibles ; sinon appliquer les contrats documentés.
Ne pas importer Pilot20, sa Forge ou son créateur comme dépendance d'exécution.
Ne pas fusionner les deux prototypes. Préserver les ambiguïtés MJ et les données utilisateur.
Livrer une PR avec tests, SHA et mise à jour de KOBE_PROGRESS.md. »

Le Lot 0 ne livre aucun écran, moteur applicatif, déploiement ou changement aux six Companions.
