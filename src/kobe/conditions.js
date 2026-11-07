export const CONDITION_NAMES = Object.freeze({
  blinded:'Aveuglé', charmed:'Charmé', deafened:'Assourdi', frightened:'Effrayé',
  grappled:'Agrippé', incapacitated:'Neutralisé', invisible:'Invisible',
  paralyzed:'Paralysé', petrified:'Pétrifié', poisoned:'Empoisonné', prone:'À terre',
  restrained:'Entravé', stunned:'Étourdi', unconscious:'Inconscient', silenced:'Silence',
});

const incapacitating = new Set(['incapacitated','unconscious','stunned','paralyzed','petrified']);
export const preventsAction = conditions => conditions.some(condition => incapacitating.has(condition));
export const conditionName = id => Object.hasOwn(CONDITION_NAMES,id) ? CONDITION_NAMES[id] : id;

const normalize = name => String(name??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase().replace(/_/g,' ');
const aliases = new Map(Object.entries(CONDITION_NAMES).flatMap(([id,name])=>[[id,id],[normalize(name),id]]));
aliases.set('empoigne','grappled');
aliases.set('incapacite','incapacitated');
aliases.set('incapable d’agir','incapacitated');
aliases.set("incapable d'agir",'incapacitated');
export const conditionId = name => aliases.get(normalize(name));
