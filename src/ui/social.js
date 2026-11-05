import {groups,resolveRoll} from '../kobe/social.js';

const modes={normal:'Normal',adv:'Avantage',dis:'Désavantage'};
const panes={skills:'Compétences',abilities:'Caractéristiques et sauvegardes'};
let pane='skills',mode='normal',physical=false;
const buttons=(choices,selected,attribute)=>Object.entries(choices).map(([id,label])=>
 `<button type="button" ${attribute}="${id}" aria-pressed="${id===selected}">${label}</button>`).join('');

export function rollPanel(state){
 const last=state.journal.slice().reverse().find(e=>e.sourceId==='private-roll');
 const tables=Object.entries(groups).map(([title,rows])=>{
  const group=title==='Compétences'?'skills':'abilities';
  const rolls=rows.map(([name,bonus,rank])=>
   `<button data-roll="${name}"><span>${name}</span> <b>${bonus>=0?'+':''}${bonus}</b><small>${rank}</small></button>`).join('');
  return `<section data-roll-group="${group}" ${group===pane?'':'hidden'}><h3>${title}</h3><div class="roll-grid">${rolls}</div></section>`;
 }).join('');
 return `<section class="panel social-desk"><h2>Social · Kobe</h2>
 <div class="social-switch" role="group" aria-label="Type de jet">${buttons(panes,pane,'data-roll-pane')}</div>
 <div class="social-modebar" role="group" aria-label="Mode du jet">${buttons(modes,mode,'data-roll-mode')}
 <label><input type="checkbox" id="physical" ${physical?'checked':''}> Dé physique</label></div>
 ${last?'<output class="ribbon"></output>':''}${tables}
 <p>Passifs · Perception 20 · Intuition 19 · Investigation 11</p></section>`;
}

export function selectRollControl(target){
 const control=target.closest('[data-roll-pane],[data-roll-mode]');
 if(!control)return false;
 const container=control.closest('[role=group]');
 if(control.dataset.rollPane){
  pane=control.dataset.rollPane;
  for(const group of document.querySelectorAll('[data-roll-group]'))group.hidden=group.dataset.rollGroup!==pane;
 }else mode=control.dataset.rollMode;
 for(const button of container.querySelectorAll('button'))button.setAttribute('aria-pressed',String(button===control));
 return true;
}

export async function roll(name,dispatch){
 physical=document.querySelector('#physical').checked;
 const count=mode==='normal'?1:2;
 const raw=physical?prompt(`Résultat de ${count} d20 (séparés par un espace)`):'';
 if(raw===null)return;
 const dice=physical?raw.trim().split(/\s+/).map(Number):Array.from({length:count},()=>1+Math.floor(Math.random()*20));
 try{
  const result=resolveRoll({name,mode,dice});
  if((await dispatch('private-roll',{name,mode,dice}))?.ok)window.CompanionSocialDice.show(result);
 }catch(error){alert(error.message)}
}
