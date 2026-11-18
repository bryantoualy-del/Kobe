import {groups,resolveRoll} from '../kobe/social.js';

const modes={normal:'Normal',adv:'Avantage',dis:'Désavantage'};
const panes={skills:'Compétences',abilities:'Carac. & JdS',info:'Infos utiles'};
let pane='skills',mode='normal',physical=false;
const buttons=(choices,selected,attribute)=>Object.entries(choices).map(([id,label])=>
 `<button type="button" ${attribute}="${id}" aria-pressed="${id===selected}">${label}</button>`).join('');

export function rollPanel(state){
 const last=state.journal.slice().reverse().find(e=>e.sourceId==='private-roll');
 const tables=Object.entries(groups).map(([title,rows])=>{
  const group=title==='Compétences'?'skills':'abilities';
  const rolls=rows.map(([name,bonus,rank])=>
   `<button data-roll="${name}"><span>${name}</span> <b>${bonus>=0?'+':''}${bonus}</b><small>${rank}</small></button>`).join('');
  return `<section class="v3-card" data-roll-group="${group}" ${group===pane?'':'hidden'}><h3>${title}</h3><div class="roll-grid v3-roll-grid">${rolls}</div></section>`;
 }).join('');
 return `<section id="v3-root" class="social-desk"><h2>Social · Kobe</h2>
 <div class="social-switch v3-sheet-tabs" role="group" aria-label="Type de jet">${buttons(panes,pane,'data-roll-pane')}</div>
 <div class="social-modebar v3-switch v3-social-mode" role="group" aria-label="Mode du jet">${buttons(modes,mode,'data-roll-mode')}
 <label><input type="checkbox" id="physical" ${physical?'checked':''}> Dé physique</label></div>
 ${last?'<output class="ribbon"></output>':''}${tables}
 <p class="v3-card" data-roll-group="info" ${pane==='info'?'':'hidden'}><img src="./src/ui/portrait.jpg" alt="Portrait de Kobe" width="62"> Passifs · Perception 20 · Intuition 19 · Investigation 11</p></section>`;
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
 const raw=physical?await RPGDialogs.prompt(`Résultat de ${count} d20 (séparés par un espace)`):'';
 if(raw===null)return;
 const dice=physical?raw.trim().split(/\s+/).map(Number):Array.from({length:count},()=>1+Math.floor(Math.random()*20));
 try{
  const result=resolveRoll({name,mode,dice});
  if((await dispatch('private-roll',{name,mode,dice}))?.ok)window.CompanionSocialDice.show(result);
 }catch(error){await RPGDialogs.alert(error.message)}
}

const combatEffectsKey = 'kobe:manual-save-effects';
function manualCombatEffects() {
 try { return JSON.parse(localStorage.getItem(combatEffectsKey) || '{}') || {}; }
 catch { return {}; }
}
function combatSaveLabel() {
 const effects = manualCombatEffects();
 return ['JDS', effects.bless && 'Bénédiction', effects.aura && 'Aura'].filter(Boolean).join(' · ');
}
export function setManualCombatEffect(field) {
 try {
  const effects = manualCombatEffects();
  effects[field.name] = field.checked;
  localStorage.setItem(combatEffectsKey, JSON.stringify(effects));
 } catch {}
 field.closest('details').querySelector('summary').textContent = combatSaveLabel();
}

export function combatSavePanel() {
 const effects = manualCombatEffects();
 const abilities = ['FOR','DEX','CON','INT','SAG','CHA'];
 const options = groups.Sauvegardes.map(([name,bonus], index) =>
  `<option value="${name}">${abilities[index]} ${bonus >= 0 ? '+' : ''}${bonus}</option>`
 ).join('');
 return `<details><summary>${combatSaveLabel()}</summary><form data-combat-save-form>
  <label>Sauvegarde <select name="ability" data-combat-save-ability>${options}</select></label>
  <label>Mode <select name="mode"><option value="normal">Normal</option><option value="adv">Avantage</option><option value="dis">Désavantage</option></select></label>
  <label>Dé physique <input name="physical" placeholder="d20 ou deux d20 séparés par un espace"></label>
  <label><input type="checkbox" name="aura" data-manual-effect ${effects.aura ? 'checked' : ''}> Aura de Zéphyr (+4 à 3 m)</label>
  <label><input type="checkbox" name="bless" data-manual-effect ${effects.bless ? 'checked' : ''}> Bénédiction (+1d4)</label>
  <button type="submit">Lancer</button><output role="status"></output>
 </form></details>`;
}

export async function rollCombatSave(form) {
 const fields = new FormData(form);
 const mode = fields.get('mode');
 const physical = fields.get('physical').trim();
 const dice = physical
  ? physical.split(/\s+/).map(Number)
  : Array.from({length: mode === 'normal' ? 1 : 2}, () => 1 + Math.floor(Math.random() * 20));
 const output = form.querySelector('output');
 try {
  const result = resolveRoll({name: fields.get('ability'),mode,dice});
  const bless = fields.has('bless') ? 1 + Math.floor(Math.random() * 4) : 0;
  const aura = fields.has('aura') ? 4 : 0;
  result.bonus += bless + aura;
  result.total += bless + aura;
  output.textContent = 'Total ' + result.total + (form.dataset.concentrationDc ? ' · DD ' + form.dataset.concentrationDc : '')
   + (bless ? ' · Bénédiction +' + bless : '')
   + (aura ? ' · Aura +4' : '');
  await window.CompanionSocialDice.show(result);
 } catch (error) {
  output.textContent = error.message;
 }
}
