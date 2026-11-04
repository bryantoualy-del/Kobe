import {canonical, decode, envelope, initialState, validateState} from './model.js';
import {transition} from './engine.js';
export const KEY = 'kobe-companion:v1';
export const BACKUP = `${KEY}:backup`;
export function createStore({storage, locks, time = () => new Date().toISOString()}) {
  let state = initialState(), recoveryStatus = null;
  const listeners = new Set();
  const publish = () => listeners.forEach(fn => fn(structuredClone(state)));
  const read = () => {
    const raw = storage.getItem(KEY);
    if (raw === null) return {state: initialState(), migrated: false};
    return {...decode(raw), raw};
  };
  const exclusive = fn => locks?.request ? locks.request(KEY, {mode:'exclusive'}, fn) : Promise.resolve({ok:false, code:'READ_ONLY',message:'Ce navigateur ne permet pas la coordination des onglets. Mode lecture seule : exportez puis ouvrez dans un navigateur récent.'});
  const guard = async fn => {
    try { return await exclusive(fn); }
    catch (e) {return {ok:false, code:'STORAGE_FAILED', message:`Sauvegarde impossible : ${e.message}. Aucune modification appliquée.`};}
  };
  const load = async () => {
    try {
      const result = await guard(() => {
        const value = read();
        if (value.migrated) {
          storage.setItem(BACKUP, value.raw); // Must succeed BEFORE migration.
          storage.setItem(KEY, JSON.stringify(envelope(value.state)));
        }
        state = value.state; recoveryStatus = value.migrated ? 'Sauvegarde migrée ; original conservé.' : null;
        publish(); return {ok:true};
      });
      if (result.code === 'READ_ONLY') {state=read().state; recoveryStatus=result.message; publish();}
      else if (!result.ok) recoveryStatus=result.message;
      return {state:structuredClone(state), recoveryStatus, ok:result.ok};
    } catch(e) { recoveryStatus=`Sauvegarde illisible : ${e.message}. Original conservé ; importez une sauvegarde valide.`; return {state:structuredClone(state), recoveryStatus, ok:false}; }
  };
  return {
    load, getState: () => structuredClone(state), subscribe(fn) {listeners.add(fn); return () => listeners.delete(fn);},
    export: () => JSON.stringify(envelope(state), null, 2),
    raw: () => storage.getItem(KEY), backup: () => storage.getItem(BACKUP),
    async dispatch(command) { return guard(() => {
      const current=read(); if(current.migrated) throw new Error('Rechargez pour migrer cette sauvegarde.');
      const result=transition(current.state, command,{time:time()});
      if (!result.ok) {state=current.state; publish(); return result;}
      if (!result.replay) storage.setItem(KEY,JSON.stringify(envelope(result.state)));
      state=result.state; publish(); return result;
    });},
    preview(raw) {const {state: incoming}=decode(raw); return {raw, revision:state.revision, summary:{hp:incoming.hp, journal:incoming.journal.length, notes:incoming.notes.length}};},
    async import(preview) {return guard(() => {
      const incoming=decode(preview.raw).state;
      const raw=storage.getItem(KEY);
      // Corrupt saves can be recovered, but are backed up byte-for-byte first.
      let current; try {current=read().state;} catch {current=state;}
      if(preview.revision !== current.revision) return {ok:false, code:'STALE_REVISION',message:'La sauvegarde a changé depuis la prévisualisation.'};
      for(const [id,receipt] of Object.entries(current.receipts)) {
        if(Object.hasOwn(incoming.receipts,id) && incoming.receipts[id].fingerprint!==receipt.fingerprint) throw new Error('Conflit de reçus dans cet import.');
      }
      incoming.revision=Math.max(current.revision,incoming.revision)+1;
      incoming.receipts={...incoming.receipts,...current.receipts}; incoming.undo=null;
      incoming.journal=[...incoming.journal,{id:`import:${incoming.revision}`,kind:'info',label:'Sauvegarde importée explicitement',revision:incoming.revision,authority:'player',time:time()}].slice(-300);
      validateState(incoming);
      if(raw!==null) storage.setItem(BACKUP,raw);
      storage.setItem(KEY,JSON.stringify(envelope(incoming))); state=incoming; recoveryStatus=null; publish(); return {ok:true};
    });}
  };
}
