import {groups,resolveRoll} from '../kobe/social.js';
export function rollPanel(state){
 const last=state.journal.slice().reverse().find(e=>e.sourceId==='private-roll');
 return `<section class="panel"><h2>Jets privés</h2><div class="social-modebar"><label>Mode <select id="roll-mode"><option value="normal">Normal</option><option value="adv">Avantage</option><option value="dis">Désavantage</option></select></label> <label><input type="checkbox" id="physical"> Dés physiques</label></div>${last?`<output class="ribbon"></output>`:''}${Object.entries(groups).map(([title,rows])=>`<h3>${title}</h3><div class="roll-grid">${rows.map(([name,bonus,rank])=>`<button data-roll="${name}">${name} <b>${bonus>=0?'+':''}${bonus}</b><small>${rank}</small></button>`).join('')}</div>`).join('')}<p>Passifs · Perception 20 · Intuition 19 · Investigation 11</p></section>`;
}
export async function roll(name,dispatch){
 const mode=document.querySelector('#roll-mode').value, physical=document.querySelector('#physical').checked;
 const count=mode==='normal'?1:2;
 const raw=physical?prompt(`Résultat de ${count} d20 (séparés par un espace)`):'';
 if(raw===null)return;
 const dice=physical?raw.trim().split(/\s+/).map(Number):Array.from({length:count},()=>1+Math.floor(Math.random()*20));
 try{
  const result=resolveRoll({name,mode,dice});
  if((await dispatch('private-roll',{name,mode,dice}))?.ok){
   document.querySelector('#roll-mode').value=mode;
   document.querySelector('#physical').checked=physical;
   window.CompanionSocialDice.show(result);
  }
 }catch(error){alert(error.message)}
}
