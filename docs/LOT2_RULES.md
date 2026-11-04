# Lot 2 — règles et limites vérifiables

## Périmètre et sources

La mission Lot2 du 4 novembre 2026 remplace le découpage antérieur « personnage/sorts » :
combat local, capacités bardiques et Social. Le grimoire complet et le vestige restent hors périmètre.
Fiche `Kobe Kozzo lv10(1).pdf` : 83 PV, CHA20, cinq Inspirations d10, Cri4, Trait de feu2d10.
Xanathar fourni, page imprimée14 : Manteaux et Représentation, recoupés dans le texte du livre.
Sources publiques primaires consultées :
- https://www.dndbeyond.com/spells/2103-fire-bolt (Basic Rules 2014)
- https://www.dndbeyond.com/spells/2032-command (Basic Rules 2014)
- https://www.dndbeyond.com/posts/1248-exploring-the-new-goblin-hobgoblin-and-kobold (présentation officielle MotM).

## Décisions explicites

- Inspiration : coût à l'attribution, dé disponible 10 minutes, dé consommé après d20 et avant annonce
  du résultat, sans second prélèvement. Une cible ne peut posséder plusieurs dés ; absence de dé externe
  confirmée par le joueur. Pas d'Inspiration magique Tasha implicite.
- Manteau : jusqu'à cinq alliés visibles à18m pouvant voir Kobe. Choix conserver/remplacer les PV temp,
  jamais addition. Si les 11PV temp sont reçus, réaction volontaire immédiate jusqu'à la vitesse sans
  opportunité, uniquement après disponibilité déclarée et accord du joueur. Pas de modification distante.
- Majesté2014 : 1/repos long, aucune recharge par emplacement. Activation et Injonctions suivantes en
  bonus, concentration60s. Injonction : cible visible à18m, comprend la langue, non morte-vivante,
  ordre d'un mot non directement dangereux. Échec automatique seulement si charme de Kobe confirmé.
- Cri : bonus, 4/repos long, ennemis à3m pouvant entendre. Le bénéfice inclut Kobe et ses alliés,
  conformément à la présentation MotM officielle. La fiche omet Kobe dans son résumé.
- Trait de feu : tour de magie racial, action, V/S,36m, attaque+9 retenue du référentiel de fiche,
  2d10 feu, 4d10 sur critique confirmé. Progression annoncée3d10 au niveau11 ; le profil reste fixé
  niveau10 dans ce lot. Pas de recharge. Jet de touche/résistances/immunités décidés par le MJ.
- Perception+10/passif20 conservés comme dérogation visible ; expertises de fiche conservées à confirmer.
- Un round local représente un cycle jusqu'au prochain début de tour de Kobe (6s). Fin du tour
  n'accorde pas une nouvelle réaction ; début du suivant la restaure. Temps narratif explicitement saisi,
  aucun avancement automatique à la veille/reprise. Éviter de compter deux fois le même temps.
- Les effets externes sont des annonces/suivis locaux. Réactions/PV temp inconnus restent inconnus.
  Actualiser les réactions au tour du bénéficiaire. Charme terminé manuellement en cas d'hostilité/dégât.
- Dégâts entrants = montant effectif déjà arbitré par le MJ. Pas de résistance au feu supposée chez Kobe.
  Chaque dommage sous concentration génère une résolution CON séparée, même absorbé par des PV temp.
- Les sorts disponibles ici (Trait de feu et Injonction en bonus) sont compatibles avec la restriction
  bonus2014. Le drapeau bonusSpell est conservé pour le futur grimoire ; aucune autre incantation
  de sort à niveau n'est proposée. Le suivi manuel d'une concentration n'en paie pas les coûts.
- Repos court : dés physiques d8+3, Chant reposant d8 optionnel après confirmation des conditions.
  Repos long : conditions et limite24h confirmées, +5 dés de vie au maximum, pas de recharge Khar-Vek.
- Annulation avant confirmation : aucun coût. Après activation : annulation compensatoire de la dernière
  opération, ou correction motivée. Un refus MJ sur une résolution est journalisé ; il ne rembourse
  pas silencieusement le lancement. Pour annuler entièrement, utiliser l'annulation/correction explicite.

## Réutilisation

Le moteur/stockage/contrats de Lot1 sont conservés. Les références de Lot0 restent dans audit/COMPANIONS.md.
Relecture complémentaire de Nans `applyDamage/assignTemp` : absorption avant PV et choix de remplacement ;
Zéphyr `rpg-health.js choose/perform` : ciblage borné et intention distincte de l'état distant ;
Rufus `rpg-rufus-defenses.js` : réaction du bénéficiaire distincte du résultat arbitré.
Adaptation pure locale de ces principes ; aucun import des globales DOM ou de leur garde réseau.

## Persistance et correction

Schéma2 migré depuis0/1 sous le verrou existant, original sauvegardé avant écriture.
Instantanés d'annulation migrés, reçus anti-rejeu conservés, ressources et effets dans le même commit.
Les formulaires ne modifient pas l'état avant confirmation ; double soumission verrouillée.
Une seule transition et un seul store ; aucun appel réseau nécessaire au combat.

## Validation

32 tests Node dont20 cas Lot2 : inspiration,5 cibles,PVtemp,réactions,Majesté,concentration,Cri,
Trait de feu,repos,double activation,correction,reprise JSON,journal,mort,migration et régressions.
Build statique et contrôle de précache des modules réussis localement.
La recette navigateur CI ajoute saisie réelle d'une cible, attribution/utilisation du d10, double clic,
Manteau et réaction, fin/début du tour, rechargement, Social et journal ; captures1180×820.
Safari sur iPad physique reste à valider au Lot5. WebKit/Linux offline non revendiqué (limite Lot1).
