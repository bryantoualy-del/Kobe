# Kobe V1.2 — cockpit de soutien

## Base et périmètre

Reprise le 7 novembre 2026 depuis main `a8269e2`, qui contient PR12 et PR13 (header iPad persistant). Aucune PR ouverte à la reprise. Branches historiques conservées. PR V1.2 : https://github.com/bryantoualy-del/Kobe/pull/14.

Le moteur, les données du personnage, le stockage et le protocole RPG Connect ne sont pas modifiés. Les 19 sorts et les trois soins du vestige correspondent à la fiche Kobe niveau 10. Mot de guérison et Aide sont les deux entrées de sorts Soins ; Aide conserve sa mécanique de PV maximum/courants.

## Parcours livrés

| Entrée | Résultat |
|---|---|
| Inspirer | Inspiration, Manteau et Manteau + soin directs, compteurs synchronisés |
| Soigner | Catalogue Soins : deux sorts, Pulsation, Ralliement et Manteau des survivants conditionnel |
| Attaquer | Catalogue Offensif, Boule de feu en tête ; Tous / Sorts / Tours de magie / Zone |
| Contrôler | Catalogue Contrôle & Défense : sorts connus, Majesté et Injonction |
| Battement Ardent | Étape 1 Manteau ou Manteau + soin ; étape 2 ouvre Boule de feu, niveau inline puis Lancer |
| Khar-Vek | Dragon, charges 0–6 et mêmes commandes, sans duplication de logique |
| Groupe | Accès rapide conservé ; grille responsive, libellés multilignes et compteurs séparés |

## Sémantique du combo

C'est un raccourci **séquentiel**, pas une transaction globale ni une réservation. Avant l'étape 1, les disponibilités du Manteau et d'au moins un emplacement N3–5 pour Boule de feu sont vérifiées via les fonctions existantes. Chaque action est à nouveau validée et enregistrée par le moteur. Si le joueur change d'avis ou dépense son action entre les étapes, Boule de feu peut être refusée : le Manteau déjà exécuté reste acquis.

Annuler utilise le mécanisme existant et annule la **dernière action**, pas tout le combo. Les corrections manuelles restent dans Suivi & ajustements. La navigation conserve le résultat et son bouton Annuler. Aucun déplacement ni PV d'allié n'est appliqué automatiquement. Le soin Survivants est choisi au lancement du Manteau : bonus + inspiration + charge dans la même commande, jamais un soin autonome après coup.

Les règles des sorts en action bonus sont conservées : Manteau (capacité) + Boule de feu est permis ; Mot de guérison + Boule de feu ne l'est pas. Aucun Engine plein écran pour les attaques ; Trait de feu conserve Touché/Raté et ses options avantage/dés physiques repliables dans le catalogue.

## Validation

- Local : 164 tests Node réussis (154 existants + 10 nouveaux), build, cache autonome et contrôle statique réussis.
- Nouveaux tests moteur : combo avec/sans soin, consommations, absence de mouvement automatique, journal, sérialisation, Undo, manque d'inspiration/emplacement/action/bonus/charge, Silence, neutralisation et restriction des sorts bonus.
- Recette `scripts/support-browser.mjs` : Chromium et WebKit, 375/390/430 × 844 et 1180 × 820, intentions, filtres, soins, combo, journal, charges, rechargement, géométrie Groupe, header et absence de formulaires. Hors ligne dans Chromium ; redémarrage à froid couvert par `resume-browser.mjs`.
- Recettes préexistantes adaptées aux nouveaux points d'entrée, sans retrait des vérifications métier : Social, Journal, favoris, sorts, Khar-Vek, Table Libre, reprise, sept clients et Encounter.
- Résultats CI et captures : en cours, à compléter avant livraison.

## Limites de recette

Safari iPhone/iPad physique, veille iOS, rotation et clavier matériel non disponibles. Les navigateurs locaux sont bloqués (socket refusée) ; la recette navigateur s'exécute en CI. Les tests V5 sont isolés, sans salle de production ni modification de serveur. Aucun changement de contrat de communication.
