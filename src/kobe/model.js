import {spellById} from './spell-catalog.js';
import {freshCombat, validateCombat} from './combat.js';
export const SCHEMA = 2;
export const LIMITS = Object.freeze({inspiration: 5, cry: 4, majesty: 1, charges: 6});
export const SLOT_MAX = [0, 4, 3, 3, 3, 2];
export const TABS = ['combat', 'spells', 'social', 'journal'];
export const freshEconomy = () => ({actionAvailable: true, bonusAvailable: true, reactionAvailable: true, movementRemaining: 9});
export function initialState() {
  return {combat: freshCombat(), schemaVersion: SCHEMA, characterId: 'kobe', revision: 0,
    profile: {name: 'Kobe Kozzo', ac: 15}, hp: {current: 83, max: 83, temp: 0, source: null},
    resources: {...LIMITS}, slots: [...SLOT_MAX], economy: freshEconomy(),
    turn: {epoch: 'local', combatId: 'local', startRevision: 0, actorId: 'kobe'},
    concentration: null, effects: [], pendingResolutions: [], receipts: {}, journal: [],
    preferences: {tab: 'combat', favorites: []}, notes: '', undo: null};
}
export function integer(value, min = 0, max = Number.MAX_SAFE_INTEGER) {
  if (!Number.isSafeInteger(value) || value < min || value > max) throw new Error('Valeur entière hors limites.');
}
export function validateState(s) {
  if (!s || s.schemaVersion !== SCHEMA) throw new Error('UNSUPPORTED_SCHEMA');
  if (s.characterId !== 'kobe') throw new Error('Personnage incompatible.');
  integer(s.revision); integer(s.hp.max, 1, 10000); integer(s.hp.current, 0, s.hp.max); integer(s.hp.temp, 0, 10000);
  integer(s.profile.ac, 0, 100); if (s.profile.name !== 'Kobe Kozzo') throw new Error('Profil incompatible.');
  for (const [k, max] of Object.entries(LIMITS)) integer(s.resources[k], 0, max);
  if (Object.keys(s.resources).length !== 4 || !Array.isArray(s.slots) || s.slots.length !== 6) throw new Error('Ressources invalides.');
  SLOT_MAX.forEach((max, i) => integer(s.slots[i], 0, max));
  for (const k of ['actionAvailable', 'bonusAvailable', 'reactionAvailable']) if (typeof s.economy[k] !== 'boolean') throw new Error('Économie invalide.');
  integer(s.economy.movementRemaining, 0, 1000); integer(s.turn.startRevision);
  if (s.turn.actorId !== 'kobe' || typeof s.turn.epoch !== 'string' || typeof s.turn.combatId !== 'string') throw new Error('Tour invalide.');
  validateCombat(s);
  if (!TABS.includes(s.preferences.tab) || !Array.isArray(s.preferences.favorites) || s.preferences.favorites.length > 4 || new Set(s.preferences.favorites).size!==s.preferences.favorites.length || s.preferences.favorites.some(x => !spellById(x))) throw new Error('Préférences invalides.');
  if (typeof s.notes !== 'string' || s.notes.length > 20000) throw new Error('Notes invalides.');
  if (!s.receipts || Array.isArray(s.receipts) || typeof s.receipts !== 'object') throw new Error('Reçus invalides.');
  for (const [id, r] of Object.entries(s.receipts)) {
    if (!id || id === '__proto__' || !r || typeof r.fingerprint !== 'string') throw new Error('Reçu invalide.');
    integer(r.revision, 1, s.revision);
  }
  if (!Array.isArray(s.journal) || s.journal.length > 300) throw new Error('Journal invalide.');
  for (const e of s.journal) if (!e || typeof e.id !== 'string' || typeof e.label !== 'string' || typeof e.kind !== 'string') throw new Error('Événement invalide.');
  if (s.undo !== null) {
    if (!s.undo || typeof s.undo.commandId !== 'string' || !s.undo.before || Object.hasOwn(s.undo.before, 'undo')) throw new Error('Annulation invalide.');
    validateState({...s, ...s.undo.before, undo: null, receipts: s.receipts, journal: s.journal, revision: s.revision});
  }
  return s;
}
export function snapshot(s) {
  const {receipts, journal, revision, undo, ...rest} = s;
  return structuredClone(rest);
}
export const canonical = value => JSON.stringify(value, function (key, v) {
  return v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map(k => [k, v[k]])) : v;
});
export const envelope = state => ({format: 'kobe-companion', schemaVersion: SCHEMA, state});
export function decode(raw) {
  const value = JSON.parse(raw);
  if (value.format !== 'kobe-companion') throw new Error('Format de sauvegarde inconnu.');
  if ([0,1].includes(value.schemaVersion) && value.state?.schemaVersion === value.schemaVersion) {
    const upgrade = old => ({...old, schemaVersion: SCHEMA, combat: old.combat ?? freshCombat(), notes: old.notes ?? ''});
    const state=upgrade(value.state);
    state.undo=state.undo ? {...state.undo,before:upgrade(state.undo.before)} : null;
    return {state:validateState(state),migrated:true};
  }
  if (value.schemaVersion !== SCHEMA) throw new Error('UNSUPPORTED_SCHEMA');
  return {state: validateState(value.state), migrated: false};
}

