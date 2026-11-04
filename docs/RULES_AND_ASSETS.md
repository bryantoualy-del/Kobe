# Référentiel, fiche et décisions

## Sources lues

- `Kobe Kozzo lv10(1).pdf` : **3 pages intégralement extraites et inspectées visuellement** (identité/mécanique, portrait/histoire/aptitudes, sorts). Fichier fourni `libfile_3ec875876c9c81918249451b0d3e1d04`.
- `Le battement des survivants .JPG` : **image entière lue**, y compris restrictions en bas de page ; `libfile_003ffeeed0d08191b06365a17585aa47`.
- Xanathar fourni : section Collège de la Séduction, page imprimée 14 (apparences inspirante/majestueuse, représentation envoûtante ; niveau 14 exclu).
- Tasha fourni : Barde, pages imprimées 27–28, aptitudes optionnelles. Liste supplémentaire comprenant Aide, Image miroir et Lenteur ; Inspiration magique optionnelle, non automatiquement accordée.
- Portrait incorporé en page 2 de la fiche : inspecté sans recoloration ; copie extraite déjà présente dans les deux prototypes.
- Emblème retrouvé dans l'ancien travail B : `Kobe_Kozzo_Embleme_Transparent_HD.jpeg` et copie `web/kobe/assets/emblem.jpeg`. Image inspectée : dragon rouge, tambour, fond blanc, **JPEG sans transparence**. Son nom et son visuel correspondent à Kobe ; son statut d'emblème collectif officiel de la Compagnie Créole n'est pas prouvé.

Les livres entiers ne sont ni reproduits ni prétendus lus intégralement : toutes les sections pertinentes pour Kobe
ci-dessus sont lues. Les références primaires fournies priment sur les commentaires des prototypes.
Aucun PDF de livre ni texte intégral d'extension n'est publié dans le dépôt ; résumés originaux et références seulement.

## Transcription exhaustive de la fiche utile au Companion

| Champ | Valeur fournie |
|---|---|
| Identité | Kobe Kozzo, kobold, barde 10, Glamour, Artiste ; sexe masculin ; alignement/foi/XP non renseignés |
| Caractéristiques | FOR 8, DEX 14, CON 16, INT 8, SAG 12, CHA 20 |
| Maîtrise / initiative / vitesse | +4 / +4 (DEX +2 et Touche-à-tout +2) / 9 m |
| PV / CA / dés de vie | 83/83, CA 15 (12 sans armure), 10d8 disponibles, aucun PV temporaire initial renseigné |
| Sauvegardes | FOR -1, DEX +6, CON +3, INT -1, SAG +1, CHA +9 |
| Compétences FOR/DEX | Athlétisme +1, Acrobaties +6, Discrétion +4, Escamotage +4 |
| Compétences INT | Arcanes, Histoire, Investigation, Nature, Religion : +1 chacune |
| Compétences SAG | Dressage +3, Intuition +9, Médecine +3, Perception +10, Survie +3 |
| Compétences CHA | Intimidation +7, Persuasion +13, Représentation +13, Tromperie +7 |
| Passifs | Perception 20, Intuition 19, Investigation 11 |
| Magie | CHA, attaque +9, DD 17 ; emplacements N1 4, N2 3, N3 3, N4 3, N5 2 |
| Maîtrises | Armures légères ; armes courantes, arbalète de poing, épée longue, rapière, épée courte ; taiko + 3 instruments à choisir ; trousse de déguisement |
| Langues | Commun + une langue à choisir |
| Équipement | Khar-Vek, taiko/baguettes, équipement Artiste/Barde à préciser ; cuir clouté enchanté +1 changeant d'apparence p.1, « armure à confirmer » p.2 ; pas d'attaque d'arme inventée |
| Apparence | Cuivre/orange, yeux ambre (blancs en transe), cornes, queue, sans cheveux/pilosité, âge/taille/poids à définir |
| Histoire | Qorrashi, clan Khar-Vek (Trois Soupapes), survivant des chasseurs de mages de Cryonis ; Roark lui a sauvé la vie puis a été enlevé avec Jorakai ; cherche la Compagnie Créole |
| Personnalité | Timide, poli, voix aiguë rocailleuse ; malicieux/bavard en confiance ; transe musicale sans substance ; protecteur, trop confiant, imprudent |
| Secret RP | Braise douce après les concerts ; réserves limitées, honte/dissimulation ; aucun bonus mécanique ; notes privées, conséquences au MJ |
| Progression | Base annoncée 8/14/14/8/12/15 « 27 points » ; racial +1 CON/+2 CHA ; N4 +1 CON/+1 CHA ; N8 +2 CHA |

### Sorts (19, pas de sorts préparés)

| Niveau | Sorts connus |
|---|---|
| 0 | Moquerie cruelle, Illusion mineure, Prestidigitation, Réparation ; Trait de feu (racial) |
| 1 | Mot de guérison, Murmures dissonants |
| 2 | Amélioration de caractéristique, Suggestion, Image miroir, Aide |
| 3 | Lenteur, Dissipation de la magie, Boule de feu (Secret), Refuge de Leomund (rituel) |
| 4 | Terrain hallucinatoire, Charme-monstre |
| 5 | Cercle de pouvoir (Secret), Immobilisation de monstre |

Chaque entrée doit posséder les métadonnées de P0-05 au Lot 2. Le PDF est une liste de sorts, pas leur texte complet.
Le catalogue ciblé B `src/kobe/spells.js` est une base à recouper avec les sources 2014 avant import.
Refuge : rituel possible puisque connu, +10 minutes, pas d'emplacement ; incantations longues à suivre explicitement.
Dissipation : ne pas garantir la fin d'un effet sans niveau et résultat du test ; Illusion/Suggestion/Terrain/Charme : arbitrage MJ.
Image miroir ne requiert pas de concentration ; Aide modifie les PV max/actuels, pas des PV temporaires.
Cercle de pouvoir dépend d'effets magiques et de présence dans l'aura ; ne pas généraliser son bénéfice à tous les dégâts.

## Règles officielles 2014 et extensions

- Barde 10 : Inspiration d10, 5 usages récupérés RC/RL ; un bénéficiaire autre que soi à 18 m pouvant entendre, durée 10 min, un seul dé détenu ; activation bonus. Touche-à-tout +2 aux tests sans maîtrise, pas aux sauvegardes.
- Chant reposant d8 et Contre-charme appartiennent au barde 2014 mais sont omis du résumé de fiche : les intégrer comme capacités de classe, avec confirmation des dés de vie dépensés/conditions de perception. Pas de nouveau sort connu.
- Glamour (Xanathar, extension 2014) : noms de fiche Manteau d'inspiration / Représentation captivante / Manteau de majesté ; alias imprimés Apparence inspirante / Représentation envoûtante / Apparence majestueuse.
- Manteau : bonus + 1 Inspiration, ≤5 créatures à 18 m visibles et pouvant voir Kobe ; 11 PV temporaires, choix sans cumul avec les anciens ; déplacement immédiat jusqu'à la vitesse via réaction volontaire, sans opportunité. Ne pas dépenser automatiquement la réaction pour donner les PV temp.
- Représentation : 1 minute complète vue/entendue, ≤5 humanoïdes à 18 m, SAG DD17 ; charme 1 h, fins anticipées selon dégâts/hostilité, réussite discrète ; 1/RC ou RL.
- Majesté : activation bonus avec Injonction gratuite, puis Injonction en bonus aux tours suivants pendant ≤1 min, concentration comme un sort ; 1/RL. Cible déjà charmée par Kobe échoue automatiquement à la sauvegarde, mais les autres limites d'Injonction restent applicables. **Pas de recharge par emplacement dans cette règle 2014.**
- Cri draconique / Héritage : version kobold MotM indiquée par le contexte ; paramètres de la fiche : bonus, 4/RL, ennemis à 3 m pouvant entendre, fin début prochain tour ; Trait de feu racial 2d10 feu, 3d10 au niveau 11. Vérifier dans la source MotM au Lot 2 le bénéfice pour Kobe lui-même, omis du résumé « les alliés », et le choix de CHA (source MotM non fournie).
- Tasha : accès optionnel Aide/Image miroir/Lenteur cohérent avec la fiche ; retenir cette option. Inspiration magique et Polyvalence bardique ne sont pas automatiquement validées par la seule présence du livre.
- Économie : lancer un sort en bonus limite les autres sorts du même tour aux tours de magie d'incantation une action, dans les deux ordres ; Injonction via Majesté reste un sort. Manteau/Cri/pouvoirs du tambour ne sont pas eux-mêmes des sorts.
- Concentration : une seule, remplacement confirmé, perte à l'incapacité, test CON sur dégâts après réductions pertinentes, DD max(10, moitié des dégâts arrondie à l'inférieur) ; annuler les effets liés à son instance.
- Résistance et sauvegarde réduisent une seule fois chacune ; PV temporaires absorbent avant PV ; correction manuelle distinguée d'un jet ou d'un soin.

## Khar-Vek : règle maison de campagne (source illustrée complète)

Très rare, état éveillé ; harmonisation barde maîtrisant les percussions ; focaliseur des sorts de barde.
Six charges, **toutes** restaurées à l'aube. Ni dé de recharge ni recharge au repos long.

| Pouvoir | Coût | Cibles et résolution |
|---|---|---|
| Pulsation réparatrice | Action, 1 charge | 1 créature visible à 18 m, Kobe compris ; 3d8 + CHA (minimum 1 PV) = 3d8+5 |
| Rythme de ralliement | Action, 3 charges | Jusqu'à 3 créatures visibles à 18 m, Kobe compris ; un unique jet 2d8+5 pour toutes, plafonnement individuel |
| Manteau des survivants | 1 charge jointe au Manteau d'inspiration | Un seul bénéficiaire du Manteau ; 1d10+5 PV en plus des 11 PV temp ; aucune action ni Inspiration supplémentaire |

Tambour porté ou à portée de main, une main libre pour frapper ; percussion fait partie de l'activation.
Pouvoirs non considérés comme sorts, sans concentration. Échec si **Kobe ou cible** dans Silence magique.
Soins sans nécessité d'entendre ou d'être conscient ; sans effet sur morts-vivants/artificiels ; pas de résurrection.
Survivants conserve les conditions de ciblage du Manteau : une cible inconsciente ne peut normalement pas voir Kobe.
Le moteur doit donc distinguer l'éligibilité de Pulsation/Ralliement de celle de Survivants.

## Décisions MJ et incohérences : ne pas corriger la fiche silencieusement

| ID | Point | Politique provisoire sûre | Lot concerné |
|---|---|---|---|
| MJ-01 | Perception +10/passif20, SAG12+expertise donne +9/19 | Conserver 10/20 comme valeur de fiche avec override visible, origine à préciser | 2 |
| MJ-02 | Base annoncée à 27 points : coût standard = 0+7+7+0+4+9 = **27** | Aucun écart de point-buy ; conserver progression | 2 |
| MJ-03 | Majesté « ou via emplacement selon règle utilisée » | 1/RL officiel par défaut ; variante désactivée tant que coût/niveau validés | 2 |
| MJ-04 | Expertise « à confirmer », choix de langue et trois instruments | Garder les quatre expertises de la fiche, choix non fixés affichés comme tels | 2 |
| MJ-05 | CA15 p.1 / armure à confirmer p.2 | Conserver CA15 ; ne pas inventer un objet détaillé | 2 |
| MJ-06 | PV83 | Conserver : un choix de dés peut expliquer l'écart avec la moyenne ; pas de recalcul arbitraire | 1 |
| MJ-07 | Options Tasha autres que liste étendue | Désactivées/à confirmer ; pas de retrait des sorts explicitement choisis | 2 |
| MJ-08 | Emblème collectif officiel non identifié | Ne pas rebaptiser l'emblème Kobe en emblème CC ; prévoir emplacement optionnel | 3 |
| MJ-09 | Paramètres MotM non fournis intégralement | Vérifier source et auto-bénéfice du Cri avant gel du Lot 2 | 2 |

Aucune de ces décisions n'empêche le Lot 1 technique. Les décisions prises ultérieurement doivent être datées,
conserver ancienne/nouvelle valeur et mettre à jour cette table et KOBE_PROGRESS.md.
