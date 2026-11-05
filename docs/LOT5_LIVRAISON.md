# Kobe à la table
Ouvrir https://bryantoualy-del.github.io/Kobe/ dans Safari paysage avec une connexion pour le premier chargement. La dernière vérification publique a chargé le Lot 4. Choisir ses quatre favoris dans Sorts & pouvoirs. Dans Combat, déclarer les cibles avec le MJ, lancer depuis un favori, puis confirmer les sauvegardes cible par cible. Le lien Khar-Vek ouvre les pouvoirs du tambour. Journal permet d’exporter la sauvegarde.
 
Sur le candidat Lot 5, attendre « Prêt hors ligne ». Groupe / connexion accepte l’invitation Kobe de la salle Table Libre. Après fermeture complète, recoller l’invitation. Si le réseau tombe, poursuivre avec les PV locaux. Confirmer avec le MJ toute demande dont la livraison est incertaine. Les corrections reçues montrent la valeur proposée. Une correction périmée requiert une nouvelle décision.

| Critère | État du candidat | Preuve ou limite |
|---|---|---|
| P0-01 identité | Intégrée, recette finale à confirmer | Portrait page 2, emblème Kobe et palette |
| P0-02 quatre onglets | Terminé et testé | Chromium et WebKit |
| P0-03 Combat et favoris | Terminé et testé en navigateur | Capture à 1180 × 820 |
| P0-04 grimoire | Terminé et testé | 19 sorts et quatre favoris |
| P0-05 fiches de sorts | Terminé et testé en navigateur | Métadonnées et modales |
| P0-06 économie et résolutions | Terminé et testé | Cinq tours continus, rejeu des commandes |
| P0-07 Glamour | Terminé et testé | Inspiration, mouvements consentis, Manteau |
| P0-08 Cri et Trait de feu | Terminé et testé | Durée, action bonus et attaque |
| P0-09 Khar-Vek | Terminé et testé | Trois pouvoirs, non-cumul, aube |
| P0-10 tambour et dragon | Terminé et testé en navigateur | Captures 0/3/6, percussion et réduction des animations |
| P0-11 PV, états, repos | Terminé et testé | PV réels et temp, concentration, RC/RL |
| P0-12 persistance et hors ligne | Partiellement fonctionnel | Données conservées après fermeture des deux moteurs. Rechargement WebKit sous HTTP 503 en échec |
| P0-13 RPG Connect | Partiellement fonctionnel | Validé en salle isolée à sept clients. Publication coordonnée requise |
| P0-14 Social | Intégré, arbitrage de fiche ouvert | Perception à confirmer avec le MJ |
| P0-15 journal | Terminé et testé en local | Coûts, sources, corrections et export |
| P0-16 iPad | Testé en navigateur, matériel à valider | Veille iPadOS, Safari physique et fluidité tactile réelle restent à mesurer |
| P1-01 soins distants | Non implémenté | Chaque bénéficiaire confirme ses propres PV |
| P1-02 interactions entre personnages | Partiellement fonctionnel | Suivi déclaratif des réactions et soutiens |
| P1-03 filtres et relecture du journal | À développer | Journal minimal disponible |
| P1-04 enrichissements du tambour | Partiellement fonctionnel | Percussion testée. Son et haptique en backlog |

Le MJ tranche les sauvegardes, les portées, Silence, les effets narratifs et les réactions des bénéficiaires. Perception et variante de Majesté restent documentées dans RULES_AND_ASSETS.md. Le mode guidé ne fait pas partie de cette intégration.

## Reprise technique
Conserver les branches des PR Kobe #6, RPG-Connect #7 et Encounter #21. La CI construit le site et joue les scénarios dans deux moteurs. Le job ecosystem démarre le vrai serveur épinglé avec les sept clients et la console MJ. Les jetons de test sont éphémères. Le job browser-smoke conserve les captures dans kobe-lot5-browser-evidence. Vérifier scripts/resume-browser.mjs sur le dernier commit, puis sur Safari iPad physique, notamment fermeture, réouverture, veille et actualisation en mode avion. Après levée du blocage, fusionner et contrôler les trois versions réellement servies. Le contrôle public doit lire Lot 5 dans le pied de page.
