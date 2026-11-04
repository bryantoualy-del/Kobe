import {assertCanAct, spendAction} from './combat.js';
import {applyHP, roll} from './health.js';
const need=(v,m)=>{if(!v)throw Error(m);};
export const POWERS=Object.freeze({
 pulse:{name:'Pulsation réparatrice',charges:1,count:3,faces:8,max:1},
 rally:{name:'Rythme de ralliement',charges:3,count:2,faces:8,max:3},
 survivors:{name:'Manteau des survivants',charges:1,count:1,faces:10,max:1}
});
export function kharvekAvailability(s,power){
 try{
  const spec=POWERS[power];need(spec,'Pouvoir inconnu.');assertCanAct(s);
  need(!s.combat.conditions.includes('silenced'),'Impossible sous Silence.');
  need(s.resources.charges>=spec.charges,'Charges insuffisantes.');
  need(s.combat.phase==='active','Commencez le tour de Kobe.');
  need(s.economy[power==='survivors'?'bonusAvailable':'actionAvailable'],'Action déjà consommée.');
  if(power==='survivors')need(s.resources.inspiration>0,'Inspiration épuisée.');
  return {ok:true,label:'Disponible'};
 }catch(e){return {ok:false,label:e.message};}
}
function healPower(s,c,power,ids,costs){
 const p=c.payload??{},spec=POWERS[power],av=kharvekAvailabilityForHealing(s,power);
 need(av.ok,av.label);
 need(p.drumReady===true,'Tambour porté ou à portée, une main libre pour le frapper requis.');
 need(p.healingEligible===true,'Cibles visibles à 18 m, vivantes, ni mortes-vivantes ni artificielles, hors Silence requis.');
 need(Array.isArray(ids)&&ids.length>=1&&ids.length<=spec.max&&new Set(ids).size===ids.length,'Sélection de cibles invalide.');
 for(const id of ids){need(id==='kobe'||s.combat.targets.some(t=>t.id===id),'Cible inconnue.');if(id==='kobe')need(!s.combat.death.dead,'Un soin ne ressuscite pas.');}
 const amount=Math.max(1,roll(p.healRolls,spec.count,spec.faces)+5);
 s.resources.charges-=spec.charges;costs.charges=spec.charges;
 const results=ids.map(id=>`${id==='kobe'?'Kobe':s.combat.targets.find(t=>t.id===id).name} : ${applyHP(s,id,amount,true,c)}`);
 return {label:`${spec.name} · ${amount} PV${power==='rally'?' (jet partagé)':''} · ${results.join(' ; ')}`,rolls:[...p.healRolls]};
}
// Manteau has already spent the one bonus action/Inspiration inside the same draft.
function kharvekAvailabilityForHealing(s,power){
 if(power!=='survivors')return kharvekAvailability(s,power);
 try{assertCanAct(s);need(!s.combat.conditions.includes('silenced'),'Impossible sous Silence.');need(s.resources.charges>=1,'Charges insuffisantes.');return {ok:true};}catch(e){return {ok:false,label:e.message};}
}
export function survivorMantle(s,c,mantleIds,costs){
 need(mantleIds.includes(c.payload.survivorTargetId),'Le soin doit viser un bénéficiaire du Manteau.');
 return healPower(s,c,'survivors',[c.payload.survivorTargetId],costs);
}
export function kharvekCommand(s,c){
 const p=c.payload??{};
 if(c.type==='kharvek-dawn'){
  need(p.confirmed===true,'Confirmez une nouvelle aube dans la fiction.');s.resources.charges=6;
  return {kind:'info',label:'Khar-Vek : nouvelle aube confirmée, 6 charges',targetIds:['kobe'],costs:{},rolls:[]};
 }
 if(c.type!=='kharvek-power')return null;
 need(['pulse','rally'].includes(p.power),'Manteau des survivants requiert Manteau d’inspiration.');
 const costs={},av=kharvekAvailability(s,p.power);need(av.ok,av.label);
 const result=healPower(s,c,p.power,p.targetIds,costs);
 spendAction(s,'actionAvailable',undefined,costs);
 return {...result,kind:'heal',targetIds:[...p.targetIds],costs,options:structuredClone(p)};
}
// A single derived presentation model, never saved alongside the mechanical charges.
export function dragonStage(charges){
 need(Number.isInteger(charges)&&charges>=0&&charges<=6,'Charges invalides.');
 return charges<2?'dormant':charges<4?'awakening':charges<6?'coiling':'complete';
}
