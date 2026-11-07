import {conditionId} from './conditions.js';

function status(c){
 if(c&&typeof c==='object'&&c.durationType&&!['indefinite','manual'].includes(c.durationType))throw Error('Durée distante à arbitrer à la table.');
 const label=c?.name??c;
 const name=conditionId(label);
 if(!name)throw Error('État non compatible : '+label+'. Utilisez la correction locale.');
 return name;
}
export function correction(event,s) {
 const p=event.payload??{};
 if(p.manualTable!==true)throw Error('Correction MJ explicite requise.');
 if(event.type==='conditions:set'){
  if(!Array.isArray(p.conditions)||!Array.isArray(p.expectedStatuses))throw Error('Liste des états attendus absente : vérifiez à la table.');
  const expected=[...p.expectedStatuses].sort(),actual=[...s.combat.conditions].sort();
  if(JSON.stringify(actual)!==JSON.stringify(expected))throw Error('Conflit : les états locaux ont changé.');
  return {field:'conditions',value:[...new Set(p.conditions.map(status))],reason:'États MJ validés par le joueur'};
 }
 const field=event.type==='hp:set'?'hp':event.type==='tempHp:set'?'temp':null;
 if(!field)throw Error('Cette demande est à traiter à la table.');
 const actual=field==='hp'?s.hp.current:s.hp.temp;
 if(!Number.isSafeInteger(p.value)||p.value<0||p.value>(field==='hp'?s.hp.max:10000))throw Error('Valeur de correction invalide.');
 if(p.expectedValue!==undefined&&p.expectedValue!==actual)throw Error('Conflit : les PV locaux ont changé. Demandez une nouvelle correction au MJ.');
 return {field,value:p.value,reason:'Correction MJ validée par le joueur'};
}
