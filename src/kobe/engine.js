import {combatCommand, afterDamage, advance} from './combat.js';
import {canonical, freshEconomy, integer, LIMITS, snapshot, TABS, validateState} from './model.js';
const fail = (code, message) => { throw Object.assign(new Error(message), {code}); };
export function transition(state, command, context = {}) {
  try {
    validateState(state);
    if (!command || typeof command.id !== 'string' || !/^[\w:-]{1,120}$/.test(command.id) || command.id === '__proto__' || command.actorId !== 'kobe' || !['player', 'gm'].includes(command.origin)) fail('INVALID_COMMAND', 'Commande invalide.');
    const fingerprint = canonical(command);
    if (Object.hasOwn(state.receipts, command.id)) {
      if (state.receipts[command.id].fingerprint !== fingerprint) fail('DUPLICATE_CONFLICT', 'Cet identifiant correspond à une autre commande.');
      return {ok: true, state, events: [], replay: true};
    }
    if (command.expectedRevision !== state.revision) fail('STALE_REVISION', 'État modifié dans un autre onglet. Vérifiez puis recommencez.');
    const s = structuredClone(state), p = command.payload ?? {}, before = snapshot(state);
    let kind = 'info', label, detail;
    switch (command.type) {
      case 'damage': {
        integer(p.amount, 1, 10000); const oldHP=s.hp.current; const absorbed = Math.min(s.hp.temp, p.amount);
        s.hp.temp -= absorbed; s.hp.current = Math.max(0, s.hp.current - p.amount + absorbed);
        afterDamage(s,p.amount,command.id,oldHP,p.critical===true); kind = 'damage'; label = `${p.amount} dégâts reçus (${absorbed} absorbés)`; break;
      }
      case 'heal': if(s.combat.death.dead) fail('DEAD','Un soin ne ressuscite pas.'); integer(p.amount, 1, 10000); s.hp.current = Math.min(s.hp.max, s.hp.current + p.amount); if(s.hp.current>0)s.combat.death={success:0,failure:0,stable:false,dead:false}; kind = 'heal'; label = `${s.hp.current - state.hp.current} PV récupérés`; break;
      case 'set-temp-hp': integer(p.amount, 0, 10000); s.hp.temp = Math.max(s.hp.temp, p.amount); kind = 'temp'; label = `${s.hp.temp} PV temporaires (sans cumul)`; break;
      case 'spend': {
        if (!['actionAvailable','bonusAvailable','reactionAvailable'].includes(p.economy)) fail('INVALID_COMMAND','Action inconnue.');
        if (!s.economy[p.economy]) fail('ACTION_USED','Cette action est déjà utilisée.');
        if (p.resource !== undefined) {
          if (!Object.hasOwn(LIMITS, p.resource)) fail('INVALID_COMMAND','Ressource inconnue.');
          integer(p.amount, 1, LIMITS[p.resource]);
          if (s.resources[p.resource] < p.amount) fail('RESOURCE_EMPTY','Ressource insuffisante.');
          s.resources[p.resource] -= p.amount;
        }
        s.economy[p.economy] = false; label = 'Dépense manuelle confirmée'; break;
      }
      case 'turn-start': {
        if (p.turn !== state.turn.startRevision + 1 || p.epoch !== state.turn.epoch || p.combatId !== state.turn.combatId) fail('STALE_REVISION','Tour déjà traité ou hors séquence.');
        advance(s,6); s.effects=s.effects.filter(e=>!e.untilTurn||e.untilTurn>p.turn); s.combat.round++;s.combat.phase='active';s.combat.bonusSpell=false; s.turn.startRevision = p.turn; s.economy = freshEconomy(); label = `Début du tour ${p.turn}`; break;
      }
      case 'correct': {
        if (typeof p.reason !== 'string' || p.reason.length > 500) fail('INVALID_COMMAND','Motif invalide.');
        if (p.field === 'hp') { integer(p.value, 0, s.hp.max); s.hp.current = p.value; }
        else if (p.field === 'temp') { integer(p.value, 0, 10000); s.hp.temp = p.value; }
        else if (Object.hasOwn(LIMITS,p.field)) {integer(p.value,0,LIMITS[p.field]); s.resources[p.field] = p.value;}
        else fail('INVALID_COMMAND','Correction non prise en charge.');
        label = `Correction ${p.field} → ${p.value}${p.reason ? ` · ${p.reason}` : ''}`; break;
      }
      case 'preferences': if (!TABS.includes(p.tab)) fail('INVALID_COMMAND','Onglet inconnu.'); s.preferences.tab = p.tab; break;
      case 'notes': if (typeof p.text !== 'string' || p.text.length > 20000) fail('INVALID_COMMAND','Notes trop longues.'); s.notes = p.text; label = 'Notes privées enregistrées'; break;
      case 'undo': {
        if (!s.undo || s.undo.commandId !== p.commandId) fail('INVALID_COMMAND','Aucune dernière action à annuler.');
        Object.assign(s,s.undo.before); s.undo = null; label = `Annulation explicite de ${p.commandId}`; break;
      }
      default: detail=combatCommand(s,command); if(!detail)fail('INVALID_COMMAND','Commande inconnue.'); ({kind,label}=detail);
    }
    s.revision++;
    s.receipts[command.id] = {fingerprint, revision: s.revision};
    const events = label ? [{id: command.id, commandId: command.id, revision: s.revision, kind, label,
      actorId: 'kobe', targetIds: detail?.targetIds ?? ['kobe'], sourceId: command.type, costs: detail?.costs ?? (command.type === 'spend' ? p : {}), rolls: detail?.rolls ?? [],
      before, after: snapshot(s), time: context.time ?? null, authority: command.origin, applicationStatus: 'applied-local'}] : [];
    s.journal = [...s.journal, ...events].slice(-300);
    if (!['undo','preferences'].includes(command.type)) s.undo = {commandId: command.id, before};
    validateState(s);
    return {ok: true, state: s, events, replay: false};
  } catch (e) { return {ok: false, state, code: e.code ?? 'INVALID_COMMAND', message: e.message}; }
}

