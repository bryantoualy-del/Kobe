import {powerGlyph} from './icons.js';
import {bardicAvailability} from '../kobe/combat.js';
import {spellAvailability} from '../kobe/spells.js';
import {spellById} from '../kobe/spell-catalog.js';
const names={inspiration:'Inspiration bardique',majesty:'Manteau de majesté',cry:'Cri draconique',charmed:'Charme',command:'Injonction',fire:'Trait de feu',performance:'Représentation captivante',concentration:'Concentration',condition:'État temporaire',silenced:'Silence',incapacitated:'Neutralisé',unconscious:'Inconscient',stunned:'Étourdi',paralyzed:'Paralysé',petrified:'Pétrifié',prone:'À terre',frightened:'Effrayé'};
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const btn=(action,label)=>`<button type="button" data-combat="${action}">${esc(label)}</button>`;
const check=(name,label,checked=false)=>`<label class="check"><input type="checkbox" name="${name}" ${checked?'checked':''}>${label}</label>`;
const input=(name,label,type='text',value='')=>`<label>${label}<input name="${name}" type="${type}" value="${esc(value)}" required></label>`;
const select=(name,label,options)=>`<label>${label}<select name="${name}" aria-label="${esc(label)}">${options.map(([v,t])=>`<option value="${v}">${esc(t)}</option>`).join('')}</select></label>`;
export function quickActions(s,ids=null){
 const items=[
  ['inspiration','Inspiration','Bonus',s.resources.inspiration+'/5','d10 · un allié'],
  ['mantle','Manteau d’inspiration','Bonus',s.resources.inspiration+'/5','11 PV temporaires · déplacement'],
  ['majesty','Manteau de majesté','Bonus',s.resources.majesty+'/1','Injonction · concentration'],
  ['majesty-command','Injonction','Bonus','', 'Majesté active'],
  ['cry','Cri draconique','Bonus',s.resources.cry+'/4','Ennemis à 3 m'],
  ['fire-bolt','Trait de feu','Action','2d10','Attaque à distance · feu']
 ];
 const selected=items.filter(([id])=>!ids||ids.includes(id));
 const row=([id,label,cost,charge,note])=>{
   const availability=id==='fire-bolt'?spellAvailability(s,spellById(id)):bardicAvailability(s,id);
   return `<div class="combat-ability quick-row" data-power-tone="${id}">
     <button type="button" class="combat-ability-button" data-combat="${id}" ${availability.ok?'':'disabled'}>
       ${powerGlyph(id)}<span class="ability-name">${label}<small>${availability.ok?note:esc(availability.label)}</small></span>
       ${charge?`<span class="ability-charge">${charge}</span>`:''}
     </button></div>`;
 };
 return `<div class="quick-lanes">${[['Action','Action'],['Bonus','Action bonus']].map(([cost,title])=>{
   const group=selected.filter(item=>item[2]===cost);
   return group.length?`<section class="quick-lane"><h3>${title}</h3><div class="quick-rows">${group.map(row).join('')}</div></section>`:'';
 }).join('')}</div>`;
}
export function combatFollowups(state, section){
 const targets=state.combat.targets;
 const targetName=id=>targets.find(target=>target.id===id)?.name??id;
 const effects=section==='effects'?state.effects.filter(effect=>effect.kind!=='condition').map(effect=>{
   const label=effect.name??names[effect.kind]??effect.kind;
   const interaction=effect.kind==='inspiration'
     ? btn('use:'+effect.id,'Utiliser le d10')
     : effect.kind==='spell'
       ? `<button type="button" data-spell-control="${esc(effect.id)}">Interaction</button>` : '';
   return `<div class="turn-followup"><strong>${esc(label)}</strong>
     <small>${esc(effect.targetIds.map(targetName).join(', '))} · ${effect.expires-state.combat.elapsed} s</small>
     ${interaction}${btn('end:'+effect.id,'Terminer cet effet')}</div>`;
 }).join(''):'';
 const pending=section==='pending'?state.pendingResolutions.map(result=>{
   const spell=result.kind==='spell';
   const label=spell ? (spellById(result.spellId)?.name??result.spellId)+' · '+targetName(result.targetIds[0])
     : names[result.kind]??result.kind;
   const roll=spell&&result.attackTotal!=null ? 'Attaque '+result.attackTotal
     : result.dc ? 'DD '+result.dc : 'Attaque +9, 2d10 feu';
   const resolve=spell
     ? `<button type="button" data-spell-resolve="${esc(result.id)}">Saisir le résultat MJ</button>`
     : btn('resolve:'+result.id,'Saisir le résultat MJ');
   return `<div class="turn-followup"><strong>${esc(label)}</strong><small>${esc(roll)}</small>${resolve}</div>`;
 }).join(''):'';
 return (pending?`<details class="turn-effects turn-pending"><summary>Résolutions en attente · ${state.pendingResolutions.length}</summary>${pending}</details>`:'')+
   (effects?`<details class="turn-effects"><summary>Effets actifs · ${state.effects.filter(effect=>effect.kind!=='condition').length}</summary>${effects}</details>`:'');
}
export function socialPanel(s){return `<h3 class="power-heading">${powerGlyph('performance')}Représentation captivante</h3><p>1 minute vue et entendue · jusqu’à 5 humanoïdes à 18 m · SAG DD17 · charme 1 h. Fin si la cible est blessée, attaquée par Kobe ou voit Kobe attaquer/blesser un allié. Réussite discrète ; décisions au MJ.</p>${btn('performance','Représentation captivante · '+s.combat.performance+'/1')}`;}
export function openCombatForm(action,s,dispatch){
 if(action==='move')return dispatch('move',{meters:s.economy.movementRemaining});
 if(['inspiration','mantle','majesty','majesty-command','cry','performance'].includes(action))return dispatch(action,{table:true});

 const dialog=document.createElement('dialog');dialog.className='combat-dialog';let mode=action,extra={},fields='',description='';const b=s.combat;
 if(action.startsWith('target:')){mode='target-save';extra.target=b.targets.find(t=>t.id===action.slice(7));}
 if(action.startsWith('end:'))return dispatch('effect-end',{id:action.slice(4)});
 if(action==='concentration-end')return dispatch(action,{});
 if(action.startsWith('use:')){mode='inspiration-use';extra.effectId=action.slice(4);fields=input('roll','Résultat du d10','number',1)+select('check','Jet bonifié',[['check','Caractéristique'],['attack','Attaque'],['save','Sauvegarde']]);description='Après le d20, avant annonce du succès ou de l’échec. Le dé attribué est consommé, sans deuxième dépense de Kobe.';}
 if(action.startsWith('resolve:')){mode='resolve';extra.id=action.slice(8);const r=s.pendingResolutions.find(r=>r.id===extra.id);extra.kind=r.kind;description=r.automaticFailure?'Cible déjà charmée par Kobe : échec automatique. Le MJ peut refuser si les conditions ne sont pas réunies.':'Saisissez uniquement le résultat annoncé à la table.';fields=r.kind==='concentration'?select('result','Sauvegarde CON DD '+r.dc,[['success','Réussie'],['failure','Échouée']]):select('result','Résultat',r.kind==='fire'?[['miss','Raté'],['hit','Touché'],['critical','Critique'],['refused','Refus MJ']]:[['failure','Échec de la sauvegarde'],['success','Sauvegarde réussie'],['refused','Refus MJ']]);if(r.kind==='fire')fields+=input('damage','Dégâts bruts des dés (si touché)','number',2);}
 if(mode==='target-save'){const t=extra.target;fields=input('name','Nom','text',t?.name??'')+select('side','Type',[['ally','Allié'],['enemy','Ennemi']])+input('temp','PV temporaires connus (−1 = inconnu)','number',t?.temp??-1)+select('reaction','Réaction déclarée',[['unknown','Inconnue'],['yes','Disponible'],['no','Consommée']]);}
 if(mode==='move')fields=input('meters','Distance parcourue (m)','number',3);
 if(mode==='time'){fields=input('seconds','Secondes écoulées dans la fiction','number',60)+check('confirmed','Temps confirmé à la table');description='Ne dépend pas de l’horloge réelle. Un round = 6 secondes ; le prochain début de tour fait avancer un round.';}
 if(mode==='death-save')fields=input('roll','Résultat naturel du d20','number',10);
 if(mode==='concentration')fields=input('name','Nom de l’effet','text','')+check('replace','Remplacer la concentration actuelle');
 if(mode==='rest'){fields=select('kind','Repos',[['short','Court (au moins 1 h)'],['long','Long (au moins 8 h)']])+input('dice','Dés de vie d8 physiques séparés par espaces, 0 pour aucun','text','0')+input('song','Chant reposant d8 (0 pour aucun)','number',0)+check('songEligible','Chant entendu pendant le repos, au moins un dé de vie dépensé')+check('confirmed','Repos achevé, conditions validées par le MJ')+check('longEligible','Repos long : au moins 1 PV au début et aucun bénéfice dans les dernières 24 h');description='Court : Inspiration et Représentation récupérées. Long : PV, emplacements, Cri, Majesté ; 5 dés de vie récupérés maximum. Khar-Vek se recharge à l’aube, pas au repos.';}
 if(mode==='combat-correct')fields=select('field','Champ',[['actionAvailable','Action'],['bonusAvailable','Action bonus'],['reactionAvailable','Réaction'],['hitDice','Dés de vie'],['maxHP','PV maximum'],['inspiration','Inspirations'],['cry','Cri'],['majesty','Majesté'],['temp','PV temporaires']])+input('value','Nouvelle valeur (action : 1 disponible, 0 consommée)','number',1)+input('reason','Motif','text','Correction MJ');
 dialog.innerHTML=`<form><h2>${esc({mantle:'Manteau d’inspiration',inspiration:'Inspiration bardique',majesty:'Manteau de majesté','fire-bolt':'Trait de feu',cry:'Cri draconique',rest:'Repos'}[mode]??'Commande de combat')}</h2><p>${description}</p>${fields}<p class="form-error" role="alert"></p><div class="actions"><button type="submit" class="primary">Confirmer</button><button type="button" data-cancel>Annuler</button></div></form>`;
 document.body.append(dialog);if(extra.target){dialog.querySelector('[name=side]').value=extra.target.side;dialog.querySelector('[name=reaction]').value=extra.target.reaction===null?'unknown':extra.target.reaction?'yes':'no';}dialog.showModal();dialog.querySelector('[data-cancel]').onclick=()=>dialog.close();dialog.onclose=()=>dialog.remove();
 dialog.querySelector('form').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target),p=Object.fromEntries(f);for(const el of dialog.querySelectorAll('input[type=checkbox]'))if(el.name!=='target')p[el.name]=el.checked;

 for(const k of ['roll','meters','seconds','damage','song','value','duration'])if(k in p)p[k]=Number(p[k]);
 if(mode==='target-save'){p.id=extra.target?.id??'target-'+crypto.randomUUID();p.temp=Number(p.temp)===-1?null:Number(p.temp);p.reaction=p.reaction==='unknown'?null:p.reaction==='yes';}
 if(mode==='inspiration-use')p.effectId=extra.effectId;
 if(mode==='resolve'){p.id=extra.id;if(extra.kind==='concentration')p.success=p.result==='success';}
 if(mode==='rest'){p.dice=p.dice.trim()==='0'?[]:p.dice.trim().split(/\s+/).map(Number);if(!p.song)delete p.song;}
 let type=mode;if(mode==='combat-correct'){if(['actionAvailable','bonusAvailable','reactionAvailable'].includes(p.field))p.value=p.value===1;else if(['inspiration','cry','majesty','temp'].includes(p.field))type='correct';}
 const submit=dialog.querySelector('[type=submit]');if(submit.disabled)return;submit.disabled=true;const r=await dispatch(type,p);if(r?.ok)dialog.close();else{dialog.querySelector('.form-error').textContent=r?.message??'Commande non validée.';submit.disabled=false;}
 };
}
