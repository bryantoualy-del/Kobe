# Khar-Vek — Lot 4

Référence : fiche Kobe Kozzo lv10, page 2, et illustration officielle « Le Battement des
Survivants ». Vestige de campagne éveillé, très rare, harmonisation barde/percussions,
focaliseur bardique. Les résumés ci-dessous transcrivent les règles maison de Kobe.

## Commandes à la table

Dans Combat, le panneau Khar-Vek donne accès aux trois pouvoirs. Les boutons expliquent
les indisponibilités (charges, action/bonus, Inspiration, Silence, neutralisation, hors tour).
La sélection des cibles, les conditions et les dés restent vérifiables avant confirmation.
Les dés physiques sont facultatifs ; sinon les dés sont tirés avec Web Crypto, hors réseau.

| Pouvoir | Coût | Soin | Cibles |
|---|---|---|---|
| Pulsation réparatrice | 1 action, 1 charge | 3d8 + 5 | 1 créature visible à18m, Kobe compris |
| Rythme de ralliement | 1 action, 3 charges | 2d8 + 5, un seul jet partagé | 1 à3 créatures visibles à18m, Kobe compris |
| Manteau des survivants | +1 charge dans Manteau d'inspiration | 1d10 + 5 en plus des11PV temp proposés | 1 bénéficiaire du Manteau |

Manteau conserve ses conditions : au plus5 alliés à18m, Kobe les voit et ils voient Kobe ;
réactions de déplacement facultatives et confirmées individuellement. Le soin additionnel
est sélectionné dans le formulaire existant, avec le coût total affiché. Une seule confirmation
engage exactement1 action bonus,1 Inspiration et1 charge ; aucun second lancement du Manteau.
Sans charge, le Manteau normal reste utilisable. Le bouton du vestige ouvre ce même formulaire.

Activation : harmonisation active, tambour porté ou à portée et main libre pour le frapper.
Kobe ET les cibles soignées doivent être hors Silence magique ; pas de morts, morts-vivants
ni créatures artificielles. Les soins directs acceptent les inconscients, sans exigence d'audition.
Survivants conserve les exigences visuelles du Manteau. Ces faits externes sont confirmés à la
table ; le logiciel ne connaît pas la carte, le type ou la zone de Silence des autres créatures.
Aucune concentration ni emplacement de sort : ce sont des pouvoirs d'objet, pas des sorts.

## Atomicité et suivi des PV

Réutilisation de transition/store/receipts/undo des Lots1–2, spendAction du combat et fonctions
de dés/PV du Lot3 extraites vers health.js. Ni second journal, ni second pool de ressources,
ni horloge indépendante. Tout refus renvoie l'état original, y compris après préparation du
Manteau. Tout échec d'écriture laisse l'état initial intact. Les mêmes reçus empêchent les rejeux
après rechargement et annulation. Annuler avant confirmation ne dépense rien ; après effet,
« Annuler la dernière action » restaure le snapshot et ajoute une trace d'annulation.

PV déclarés : plafonnés au maximum, temporaires conservés lors du soin. Le Manteau propose
11PV temp sans cumul : garder les anciens ou recevoir les nouveaux, comme au Lot2.
PV externes inconnus : montant explicitement « à annoncer (PV inconnus) » ; aucun maximum
inventé. Les états externes sont un suivi local et ne modifient aucun autre Companion.
« Nouvelle aube » rétablit6 charges sur confirmation ; RC/RL ne le font pas.
« Corriger les charges » et l'annulation restent disponibles même sans charge ou hors tour.

## Démonstration reproductible

La recette scripts/kharvek-browser.mjs exécute les formulaires réels à1180×820 :

| Étape | Résultat attendu |
|---|---|
| Kobe43/83,6charges ; Pulsation dés4,5,6 | +20PV →63/83 ;5charges ; action consommée |
| Tour suivant ; Ralliement dés4,5 sur Kobe et2 alliés à10/50 | +14 chacun →77/83,24/50,24/50 ;2charges |
| Manteau sur Roark + Survivants dé8 | Roark37/50 et11PV temp ;1charge ;4Inspirations ; bonus consommé une fois |
| Fermer/recharger | PV, temporaires, charges, coûts et journal identiques |
| Corriger à0 puis confirmer une nouvelle aube | Boutons indisponibles à0, puis6 marques allumées |

Les captures de confirmation et du journal complètent les images du widget à0,3,6 charges.
Le test moteur ajoute le cas de plafonnement (Ralliement14 sur49/50 →50/50), les refus,
le replay, l'annulation et la cible inconsciente à0PV.

## Dragon et percussion P1

| Charges réelles | Apparence calculée |
|---|---|
| 0–1 | Tambour sobre, dragon extérieur absent |
| 2–3 | Dos et segments rouges partiels |
| 4–5 | Enroulement rouge/cuivre/or identifiable |
| 6 | Dragon entier, tête et moustaches visibles, pulsation légère |

SVG original natif, reprenant le bois rouge, les ferrures et la peau dorée de la référence.
Aucun élément de Bleach repris. Aucun portrait de Kobe modifié. Le dragon n'a aucun effet de
règle et aucun état persistant : dragonStage(resources.charges), recalculé au rendu.
Préférence OS de réduction des animations et case « Sans animation » ; aucun filtre animé,
canvas, vidéo ou asset distant. Cibles tactiles des commandes >=44px, layout paysage contrôlé.
La validation CI mesure le navigateur à ces dimensions, pas la performance matérielle d'un iPad.

P1 implémentée, désactivée par défaut. Activer « Frappes et confort visuel », fenêtre400–1600ms,
800ms par défaut, comptée depuis la première frappe. À la fin de la fenêtre :1 ouvre Pulsation,
3 ouvre Ralliement ;2 ou plus de3 donnent une séquence invalide. Aucun lancement à la deuxième
frappe. Cibles et confirmation restent obligatoires. Le contrôleur rythmique ne possède aucune
référence au store/dispatcher. Reset, annulation et commandes classiques restent accessibles.
Une navigation/transaction annule toute séquence en attente. Réglages de confort de session,
non persistés ; l'OS reste respecté après rechargement.

Son/haptique étudiés et laissés non livrés : des sons courts exigeraient activation audio explicite
et gestion du mute ; vibration physique non garantie sur Safari iPad. Ni son ni vibration requis.

## Validation et limites

Tests : npm test ; npm run build ; npm run test:e2e (statique) ; git diff --check.
Recette navigateur : scripts/browser-smoke.mjs, scripts/spellbook-browser.mjs et
scripts/kharvek-browser.mjs dans Chromium/WebKit Linux. Le verdict et les références de CI
finaux sont consignés dans KOBE_PROGRESS.md après exécution, pas présumés ici.
Hors ligne Chromium : rechargement et pouvoir exécuté après installation complète du cache.
Safari iPad physique et rechargement hors ligne WebKit restent à la recette Lot5.

Usage local : npm run build puis servir dist/ via HTTP (par exemple python3 -m http.server
8000 --directory dist). Ouvrir l'application sur ce serveur. Premier chargement complet et cache
nécessaires pour jouer ensuite hors ligne ; sauvegarde JSON/export disponibles dans Journal.
Aucun RPG Connect, compte, CDN ou API nécessaire au combat local.
