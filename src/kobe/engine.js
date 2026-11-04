import {kharvekCommand} from "./kharvek.js";
import {spellCommand} from './spells.js';
import {combatCommand, afterDamage, advance, endConcentration} from './combat.js';
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
      case 'initiative-roll': {
        integer(p.die,1,20);detail={rolls:[p.die]};
        label=`Initiative : ${p.die} + 4 = ${p.die+4} · validation MJ`;break;
      }
      case 'network-review': {
        if(command.origin!=='gm'||!p.remoteEvent||typeof p.remoteEvent.id!=='string'||!['accepted','declined'].includes(p.decision))fail('INVALID_COMMAND','Décision réseau invalide.');
        if(p.decision==='accepted'){
          const remote=p.remoteEvent, q=remote.payload??{};
          const field=remote.type==='hp:set'?'hp':remote.type==='tempHp:set'?'temp':null;
          if(!field||field!==p.field||q.manualTable!==true||q.value!==p.value)fail('INVALID_COMMAND','Correction réseau invalide.');
          const actual=field==='hp'?s.hp.current:s.hp.temp;
          if(q.expectedValue!==undefined&&q.expectedValue!==actual)fail('STALE_REVISION','La valeur locale a changé.');
          integer(p.value,0,field==='hp'?s.hp.max:10000);
          if(field==='hp'){s.hp.current=p.value;if(!p.value)endConcentration(s);else s.combat.death={success:0,failure:0,stable:false,dead:false};}
          else {s.hp.temp=p.value;s.hp.source=p.value?'Correction MJ':null;}
          label=`Correction MJ validée : ${field} → ${p.value}`;
        }else label=`Demande MJ ${p.remoteEvent.type} traitée à la table, sans application automatique`;
        break;
      }
      case 'damage': {
        integer(p.amount, 1, 10000); const oldHP=s.hp.current; const absorbed = Math.min(s.hp.temp, p.amount);
        s.hp.temp -= absorbed;if(!s.hp.temp)s.hp.source=null; s.hp.current = Math.max(0, s.hp.current - p.amount + absorbed);
        afterDamage(s,p.amount,command.id,oldHP,p.critical===true,absorbed); kind = 'damage'; label = `${p.amount} dégâts reçus (${absorbed} absorbés)`; break;
      }
      case 'heal': if(s.combat.death.dead) fail('DEAD','Un soin ne ressuscite pas.'); integer(p.amount, 1, 10000); s.hp.current = Math.min(s.hp.max, s.hp.current + p.amount); if(s.hp.current>0)s.combat.death={success:0,failure:0,stable:false,dead:false}; kind = 'heal'; label = `${s.hp.current - state.hp.current} PV récupérés`; break;
      case 'set-temp-hp': integer(p.amount, 0, 10000); if(p.amount>s.hp.temp)s.hp.source='Attribution manuelle';s.hp.temp = Math.max(s.hp.temp, p.amount); kind = 'temp'; label = `${s.hp.temp} PV temporaires (sans cumul)`; break;
      case 'spend': {
        if(s.hp.current===0||s.combat.death.dead||s.combat.conditions.some(x=>['incapacitated','unconscious','stunned','paralyzed','petrified'].includes(x)))fail('INCAPACITATED','Kobe ne peut pas agir.');
        if(p.economy!=='reactionAvailable'&&s.combat.phase!=='active')fail('OUT_OF_TURN','Hors tour de Kobe.');
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
        advance(s,6); s.effects=s.effects.filter(e=>!e.untilTurn||e.untilTurn>p.turn); s.combat.round++;s.combat.phase='active';s.combat.bonusSpell=false;s.combat.leveledAction=false; s.turn.startRevision = p.turn; s.economy = freshEconomy(); label = `Début du tour ${p.turn+1}`; break;
      }
      case 'correct': {
        if (typeof p.reason !== 'string' || p.reason.length > 500) fail('INVALID_COMMAND','Motif invalide.');
        if (p.field === 'hp') { integer(p.value, 0, s.hp.max); s.hp.current = p.value; if(p.value===0)endConcentration(s);else s.combat.death={success:0,failure:0,stable:false,dead:false}; }
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
      default: detail=kharvekCommand(s,command)??spellCommand(s,command)??combatCommand(s,command); if(!detail)fail('INVALID_COMMAND','Commande inconnue.'); ({kind,label}=detail);
    }
    s.revision++;
    s.receipts[command.id] = {fingerprint, revision: s.revision};
    const events = label ? [{id: command.id, commandId: command.id, revision: s.revision, kind, label,
      actorId: 'kobe', targetIds: detail?.targetIds ?? ['kobe'], sourceId: command.type, costs: detail?.costs ?? (command.type === 'spend' ? p : {}), rolls: detail?.rolls ?? [],
      before, after: snapshot(s), time: context.time ?? null, options:detail?.options??p, authority: command.origin, applicationStatus: 'applied-local'}] : [];
    s.journal = [...s.journal, ...events].slice(-300);
    if (!['undo','preferences'].includes(command.type) && !(command.type==='network-review' && p.decision==='declined')) s.undo = {commandId: command.id, before};
    validateState(s);
    return {ok: true, state: s, events, replay: false};
  } catch (e) { return {ok: false, state, code: e.code ?? 'INVALID_COMMAND', message: e.message}; }
}

