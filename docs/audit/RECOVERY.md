# Inventaire des travaux interrompus

Inspection du 4 novembre 2026, avant toute modification. Sources GitHub et état local comparés.

## Destination Kobe

- `main` = `10accd549d9c3f1ff2498e16fab9c8c46fbe4176`, « Initial commit », 29 octobre 2026.
- Un seul fichier suivi : `README.md` (6 octets). Aucun moteur, package, workflow ou asset.
- Branches GitHub : seulement `main` (pagination épuisée). PR ouvertes : aucune.
- Aucun code Kobe achevé présent dans cette branche ; ne pas confondre dépôt vide et perte de tous les travaux.
- Branche du lot : `feat/kobe-lot0-audit`, issue de ce main. README initial conservé.

## Deux prototypes retrouvés (non équivalents)

| Candidat | Base / tête | Contenu réellement présent | Résultat réexécuté | Décision |
|---|---|---|---|---|
| A | Pilot20 `9f650529f4a8f219072ad263e15f5b0ccff92256` → `9506ff3d991922715ee28fe49532ee34009d2980` | `src/kobe/{engine,spells,connect}.js`, `web/kobe/{app.js,index.html,style.css,manifest.webmanifest,portrait.png,vendor/scoped-patches.js}`, `tests/kobe.test.js`, `e2e/kobe.mjs`, workflow Kobe ; 12 fichiers | 17/17 tests unitaires | Référence de séparation réseau/métier ; ne pas substituer silencieusement à B |
| B | même base → `09ff42f9b1fcdbe205cb179c1d4641145306a916` | `src/kobe/{engine,spells}.js`, `web/kobe/{app.js,kobe.css,index.html,assets/,vendor/}`, tests `.mjs`, e2e réseau, rapports/captures `docs/kobe/`, modifications packaging/CI ; 32 fichiers | 22/22 tests unitaires | Candidat de récupération prioritaire pour règles/catalogue/assets/tests, sous adaptation ; pas une version livrée |

Les deux checkouts utilisent localement le nom `feat/kobe-companion-v1` mais des commits différents.
Ils sont propres (`git status --porcelain` vide). Aucun commit n'est ancêtre de l'autre : deux variantes
basées sur le même main. Aucun branchement Kobe correspondant retrouvé dans Pilot20 distant ; aucune PR
Kobe retrouvée dans Pilot20. Ne pas supposer que ces commits seront disponibles dans une nouvelle session.

Chemins locaux observés (indices de récupération, jamais dépendances du futur produit) :
- A : `/workspace/scratch/7cb799b769ed/Pilot20`.
- B : `/workspace/scratch/21cf8351db42/Pilot20`.

### Autres développements à conserver

- RPG-Connect local B : `3b2dd11bd4ec7da4b65cbf8d9e337fa42f770e05`, branche `feat/kobe-companion-registration`, base `bec8927fa837630f292513cfe626f09a4064fbf5`. La branche existe aussi à distance à `a084aabe029110b69677637584c7962bf172c3d9` : autre SHA, même base et diff de deux fichiers inspecté (registre + test invitation). Ne pas écraser cette tête distante avec le SHA local.
- Encounter local B : `56a65de3ae464ad757f1ee0c518cffec828ac1ba`, même nom de branche, base `ff447ea05c3d1886457890ddb1f160e588c132dd`. Branche distante Kobe non retrouvée.
- Les six références locales correspondent exactement aux main GitHub (SHA dans sources.json), arbres propres.
- Pilot20 main contient Forge #95 et Fizban #94 ; ni prototype A ni B n'y est fusionné. Les PR Work4 ouvertes n'appartiennent pas au périmètre Kobe : ne pas les modifier.

### Ce qui est achevé / exploitable / non attesté

Achevé dans les prototypes : fichiers de règles, catalogue, interface et tests écrits, commits locaux présents.
Exploitable : algorithmes, fixtures, découpage, provenance des assets ; tests unitaires reproduits dans ce lot.
Non attesté : déploiement, Safari physique, exactitude exhaustive, conformité à l'architecture cible,
fonctionnement de tous les parcours connectés de Kobe sur les main actuels.
Les anciens rapports B annoncent des validations plus larges : ils sont historiques, non des preuves de ce lot.

B contient encore une façade réseau dans `web/kobe/app.js`, des booléens d'économie signifiant « utilisé »,
un historique borné à 20 snapshots, un journal à 300 entrées et des receipts non bornés.
`initialState()` initialise les alliés à leurs PV max : ce n'est pas leur état réel de session.
`execute`, `undo`, `validateState`, `load`, `persist` sont des points de récupération, pas un contrat à adopter sans examen.
Migration, multi-onglets, quota de stockage, coupure au commit et déduplication durable demandent les recettes du Lot 1.

## Préservation et limite de récupération

Aucune suppression, réécriture de branche, cherry-pick global ou remplacement d'application effectué.
La publication des prototypes complets sur des branches publiques du dépôt Kobe a été refusée par la revue
automatique comme dépassant la livraison documentaire autorisée. Elle n'a pas été contournée.
Les originaux restent intacts localement. Une publication durable de ces prototypes nécessite une autorisation
explicite supplémentaire ; le Lot 1 peut commencer avec les spécifications sans attendre ce transfert.
Les contrats et règles de ce dossier restent suffisants même si ces espaces temporaires disparaissent.
