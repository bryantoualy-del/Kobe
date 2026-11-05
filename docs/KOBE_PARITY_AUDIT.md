# Audit du 5 novembre 2026
Brackmard 08e4b2b, Samoth b54146a, Kentaro eeb458d et Kobe 102e82f examinés avec leurs branches et historiques. La base fonctionnelle retenue est le Lot 5 ad57cd9 (PR #6) pour conserver Table Libre, le cache versionné et les illustrations validées.

La barre des Companions lit un état mutable global. Kobe reconstruit le DOM à chaque transaction. Le shell doit donc lire directement le store Kobe. Pour le carnet, conserver un panneau DOM stable et exposer une projection du journal au module Kentaro. L’importeur reste dans Kentaro avec son identifiant historique. Aucun changement de protocole V5.

## Branches et revues
À l’audit initial, seule la PR Kobe #6 était ouverte parmi les quatre dépôts. Les six branches de lots Kobe ont été conservées. Aucun changement dans Brackmard ni Samoth. Les PR proposées sont Kobe #7, basée sur #6, et Kentaro #13 pour le seul importeur.

## Décisions issues de la comparaison
- Brack garde l’identité, les valeurs de combat et la barre de tour dans le même ordre. Kobe suit cet ordre et garde le grimoire musical et les boutons bardiques.
- Le moteur de présentation de Samoth importe Three.js depuis un CDN. Kobe sert localement les parties utilisées de Three.js 0.186.1 et sa licence, y compris hors ligne. Le moteur transactionnel calcule le jet privé avant son animation.
- Le carnet, la base de portraits et la génération ZIP proviennent de kentaro-session.js. Les références de campagne, les clés locales et les identifiants de session sont propres à Kobe. Les PNJ importés du coffre gardent leur chemin permanent.
- Dans la version 1.4 de l’importeur, keep-newest pouvait remplacer des images, et un réimport pouvait créer une copie de session et de reçu. La 1.5 conserve les images existantes, reconnaît la session et écrit un reçu durable après application des choix. Les mises à jour PNJ utilisent Vault.process et les marqueurs historiques.
- Une capture de chaque application de référence et de la vue Kobe correspondante figure dans recette-v11/compagnons.webp. Les couleurs, l’ordre des commandes et la densité restent appréciables côte à côte.
