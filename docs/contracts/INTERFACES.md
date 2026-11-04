# Contrats d'interface proposés — version 1

Ce document spécifie les lots futurs. Aucun transport nouveau, API serveur nouvelle ou code exécutable n'est livré.

## Moteur local

```ts
type Command = {
  id: string; actorId: 'kobe'; expectedRevision: number;
  type: 'cast' | 'resolve' | 'ability' | 'item' | 'damage' | 'heal'
      | 'set-temp-hp' | 'turn-start' | 'rest' | 'dawn'
      | 'correct' | 'end-effect' | 'undo';
  origin: 'player' | 'gm'; payload: object;
};
type Result =
  | { ok: true; state: State; events: DomainEvent[]; replay: boolean }
  | { ok: false; code: string; message: string; state: State };
// transition est pure. Le stockage et le transport restent extérieurs.
transition(state: State, command: Command, context: { dice: DiceSource; time: GameTime }): Result;
dispatch(command: Command): Promise<Result>; // sérialise et persiste avant de notifier
```

État : `schemaVersion`, `characterId`, `revision`, `profile`, `hp {current,max,temp,source}`,
`resources`, `slots`, `economy {actionAvailable,bonusAvailable,reactionAvailable,movementRemaining}`,
`turn {epoch,combatId,startRevision,actorId}`, `concentration {instanceId,sourceId}|null`,
`effects`, `pendingResolutions`, `receipts`, `journal`, `preferences`.
Noms explicites « Available » : éviter l'inversion des booléens utilisés par les anciennes applications.
Bornes : PV 0..max, temp≥0, charges 0..6, Inspiration0..5, Cri0..4, Majesté0..1, emplacements≤maximum.
Valeurs entières finies ; identifiants inconnus, cible dupliquée et payload incohérent rejetés sans mutation.
Erreurs normalisées : `STALE_REVISION`, `DUPLICATE_CONFLICT`, `RESOURCE_EMPTY`, `ACTION_USED`,
`INVALID_TARGET`, `RULE_CONFIRMATION_REQUIRED`, `STORAGE_FAILED`, `UNSUPPORTED_SCHEMA`.

## Intention, lancement, résolution

1. Brouillon UI (action/cible/emplacement) : aucun coût.
2. `cast`/`ability`/`item` validé : coût et pending ou effet instantané atomiques.
3. `resolve` porte `actionId`, `targetId`, résultat annoncé, dés/total et validations nécessaires.
4. Application au même couple effet/cible déjà résolu : retourne receipt, aucun nouveau jet.

Sort à jet de sauvegarde : lancement consomme emplacement/action, résolution peut rester en attente du MJ.
Sort à incantation longue : engagement distinct de l'achèvement ; concentration/couts d'actions décrits, emplacement
consommé à l'achèvement selon la règle ; interruption ne crée pas de lancement instantané.
Ralliement : `targetIds` uniques (1..3), un jet partagé, résultat plafonné pour chaque cible.
Survivants : option du même `ability(mantle)` ; 1 Inspiration + 1 charge dans une transaction,
une seule cible de soin appartenant aux bénéficiaires éligibles ; aucun second coût d'action.

## Effets et journal

Effet : `id`, `actionId`, `sourceId`, `targetId`, `kind`, `value`, `stacking`, `concentrationInstanceId`,
`expiresOn {type,actorId,turnRevision,elapsedSeconds}`, `status`.
Échéances explicites : début prochain tour, fin tour, durée narrative ou manuel ; pas un simple compteur global.
`stacking` distingue remplacement/maximum/non-cumul/additif autorisé. Aide et PV temporaires ont des familles distinctes.

Événement : `id`, `commandId`, `revision`, `kind`, `actorId`, `targetIds`, `sourceId`, `costs`,
`rolls`, `before`, `after`, `time`, `authority`, `applicationStatus`.
`applicationStatus`: `calculated` / `applied-local` / `confirmed-by-owner` ; un soin annoncé n'est pas « appliqué distant ».
Le journal d'affichage peut être borné ; les preuves d'application/idempotence ont une durée de vie indépendante.

## Stockage

`load() -> {state, recoveryStatus}` ; `commit(expectedRevision, state, receipts)` atomique sous écrivain unique ;
`export() -> versionedEnvelope` ; `validateImport(raw) -> preview|errors` ; `import(preview, confirmation)`.
Persistance échouée : ni incrément de révision visible ni émission réseau. Migration : copie avant conversion,
pas de remise à zéro silencieuse. Export/import conservent receipts et effets ; les tokens de session réseau restent hors export métier.

## Façade V5 existante (adaptateur seulement)

Référence figée Brackmard `companion-api.js` (API `version:1`, qui n'est pas le numéro marketing V5) :
`getCharacter`, `getState`, `rollInitiative`, `damage`, `heal`, `setHP`, `setTemporaryHP`,
`setConcentration`, `nextTurn`, `applyEvent`, `subscribe`, `sync`.
Ne rendre disponibles que les commandes effectivement adaptées ; pas de méthodes factices qui annoncent un succès.

Projection **exacte** `RPG-Connect/rpg-table-policy.js::tacticalState` :
`characterId`, `characterName`, `portrait`, `stateEpoch`, `stateRevision`,
`hp {current,max,temp}`, `ac`, `statuses`, `concentration` booléenne, `updatedAt`, `turn {reaction}`.
Pas d'emplacements, charges, notes, inventaire ou détails du sort concentré.

Événements Table Libre autorisés : `initiative:rolled`, `turn:end-request`.
Commandes : `state:sync`, `targets:set`, `target:clear`, `message:gm`, `initiative:request`,
`initiative:retry`, `turn:grant`, `turn:close`, `defense:turn-ended`, `hp:set`, `tempHp:set`, `conditions:set`.
Ces trois dernières sont des corrections explicites MJ, pas une copie aveugle de snapshot.
`hp:heal`, `attack:damage` et `effect:request` ne sont **pas** des commandes Table Libre autorisées : ne pas les ajouter
uniquement dans le client. Toute évolution ultérieure requiert serveur + Encounter + tests de confidentialité/idempotence.

Le contexte public comporte `syncEpoch`, `groupRevision`, `session` et `conditionActors` selon `tacticalPayload`.
Anciennes révisions ignorées ; ancien epoch non mélangé à la nouvelle salle. Ennemi : PV/CA cachés sauf publication explicite.
Le groupe à distance est lecture seule ; la réaction d'un bénéficiaire n'est jamais dépensée par Kobe à son insu.

## Cas de contrat à exécuter

- Rejeu identique avant/après reload → même receipt ; même ID autre payload → rejet.
- Annulation puis rejeu ancien ID → aucun effet réappliqué.
- Deux onglets tentant la dernière charge → au plus une réussite.
- `turn-start` dupliqué après dépense de réaction → réaction reste dépensée.
- Échec de persistance après calcul → aucune dépense durable/notification.
- Déconnexion puis soin local puis reconnexion → état personnel publié, zéro soin rejoué.
- Snapshot avec ressources privées → projection les retire ; ennemi sans permission ne transmet ni PV ni CA.
- Correction MJ périmée → rejet/conflict visible, ne restaure pas un état retiré entre-temps.
