# Kobe Companion — démarrage autonome (Lot 1)

## Démarrer

Pré-requis : Node.js 20+ pour la validation/servir les fichiers ; aucun serveur de jeu, compte, CDN, RPG Connect ou Pilot20 requis.

1. `npm test` : moteur et stockage transactionnels.
2. `npm run build` : copie la coque et ses modules ES dans `dist/`.
3. `npm run test:e2e` : contrôles statiques de complétude du build (ne lance pas de navigateur).
4. `python3 -m http.server 8080 -d dist` ou n'importe quel serveur statique HTTPS.
5. Ouvrir `http://localhost:8080` sur le même appareil ; en déploiement HTTPS, ouvrir l'URL servie.

Le Companion reste autonome même sans serveur après chargement et installation correcte du service worker (première visite en ligne puis activation). Le service worker est limité à la même origine. Ne pas ouvrir directement index.html via file:// : les modules et le cache requièrent une origine HTTP(S).

## Fonctions du Lot 1

- Combat : PV, PV temporaires, CA, économie action/bonus/réaction, fin de tour, annulation et correction motivée.
- Sorts & pouvoirs : structure de navigation et emplacements visibles ; les 19 sorts et les confirmations de lancement appartiennent au Lot 2.
- Social : notes privées conservées localement.
- Journal : événements à chaque commande pertinente, export JSON et import validé avec confirmation et backup préalable.
- Toutes les dépenses génériques affichées demandent confirmation. Aucune action ne choisit le résultat narratif ou la réussite d'un jet à la place du MJ.

## Sauvegardes et précautions

La sauvegarde se trouve en localStorage de l'origine, au format versionné `kobe-companion:v1`, avec copie de sécurité `kobe-companion:v1:backup` lors de migration/import.
Exporter régulièrement depuis **Journal → Exporter la sauvegarde**, surtout avant de vider les données Safari. La sauvegarde locale ne synchronise pas les appareils. Le mode privé de certains navigateurs supprime les données à la fermeture.
Le moteur utilise Web Locks pour sérialiser les commandes entre onglets. En l'absence de Web Locks, les mutations sont refusées (lecture seule), pour éviter une corruption silencieuse.
Si la sauvegarde est endommagée, aucune réinitialisation destructrice automatique n'est faite ; utiliser l'import explicite depuis un JSON valide.

## Validation

La CI `.github/workflows/validate.yml` exécute les tests moteur, le build et le contrôle de cache, puis une recette navigateur Playwright Chromium/WebKit qui tente navigation, sauvegarde/reload, notes, journal et passage hors ligne.
Le navigateur Playwright WebKit sous Linux ne remplace pas une recette physique sur l'iPad Air 5 / Safari paysage.
Document source de vérité : `docs/KOBE_PROGRESS.md`.

## Hors Lot 1

Grimoire complet, Glamour et Social intégral (Lot 2) ; portrait officiel, Khar-Vek, tambour animé, dragon et mise en scène premium finale (Lot 3) ; RPG Connect V5 (Lot 4) ; recette physique et livraison finale (Lot 5).
