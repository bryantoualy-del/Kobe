// Only translate statuses with a known local meaning. Timed or unknown effects need table adjudication.
const names={
 'aveugle':'blinded','charme':'charmed','assourdi':'deafened','effraye':'frightened','empoigne':'grappled',
 'neutralise':'incapacitated','invisible':'invisible','paralyse':'paralyzed','petrifie':'petrified',
 'empoisonne':'poisoned','a terre':'prone','entrave':'restrained','etourdi':'stunned','inconscient':'unconscious','silence':'silenced'
};
const statuses=new Set(Object.values(names));
const normalize=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
function status(c){
 if(c&&typeof c==='object'&&c.durationType&&!['indefinite','manual'].includes(c.durationType))throw Error('Durée distante à arbitrer à la table.');
 const key=normalize(c?.name??c),name=names[key]??key;
 if(!statuses.has(name))throw Error('État non compatible : '+key+'. Utilisez la correction locale.');
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
