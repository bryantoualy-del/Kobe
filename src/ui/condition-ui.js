import {CONDITION_NAMES, conditionName} from '../kobe/conditions.js';
import {conditionGlyph} from './icons.js';

const escape = value => String(value).replace(/[&<>"']/g, char =>
  ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'})[char]);

export function conditionButton(state){
  const [first,...others]=state.combat.conditions;
  const summary=first?(others.length?`${state.combat.conditions.length} actifs`:conditionName(first)):'Aucun';
  return `<button type="button" class="turn-conditions" data-action="conditions" aria-haspopup="dialog"
    data-active="${Boolean(first)}"><span>${conditionGlyph(first)}États</span><small>${escape(summary)}</small></button>`;
}

function durationLabel(state,id){
  const effect=state.effects.find(e=>e.kind==='condition'&&e.conditionName===id);
  if(!effect)return 'Retrait manuel';
  const turns=effect.untilTurn==null
    ? Math.ceil((effect.expires-state.combat.elapsed)/6)
    : effect.untilTurn-state.turn.startRevision;
  const label=`${Math.max(1,turns)} tour${turns>1?'s':''}`;
  return effect.untilTurn==null?`Durée héritée · ≈ ${label}`:label;
}

export function openConditions(getState,dispatch){
  const dialog=document.createElement('dialog');
  dialog.className='combat-dialog condition-dialog';
  dialog.setAttribute('aria-labelledby','condition-title');
  dialog.innerHTML=`
    <header><h2 id="condition-title">États de Kobe</h2><button type="button" data-close aria-label="Fermer les états">×</button></header>
    <section aria-label="États actifs" data-active-conditions></section>
    <form>
      <label>Ajouter un état<select name="name" required><option value="">Choisir un état</option>
        ${Object.entries(CONDITION_NAMES).map(([id,name])=>`<option value="${id}">${escape(name)}</option>`).join('')}</select></label>
      <label>Durée<select name="duration"><option value="manual">Retrait manuel</option><option value="turns">En tours de Kobe</option></select></label>
      <label data-turn-count hidden>Nombre de tours<input name="turns" type="number" min="1" max="999" value="1" required disabled></label>
      <p data-condition-error role="alert" hidden></p>
      <button type="submit" class="primary">Ajouter</button>
    </form>`;
  const form=dialog.querySelector('form');
  const {name,duration,turns}=form.elements;
  const active=dialog.querySelector('[data-active-conditions]');
  const error=dialog.querySelector('[data-condition-error]');
  const refresh=()=>{
    const state=getState(), selected=name.value;
    active.innerHTML=state.combat.conditions.length
      ? `<ul>${[...new Set(state.combat.conditions)].map(id=>`<li>${conditionGlyph(id)}
        <span><strong>${escape(conditionName(id))}</strong><small>${durationLabel(state,id)}</small></span>
        <button type="button" data-remove-condition="${escape(id)}" aria-label="Retirer ${escape(conditionName(id))}">Retirer</button>
        </li>`).join('')}</ul>` : '<p>Aucun état actif.</p>';
    for(const option of name.options)option.disabled=state.combat.conditions.includes(option.value);
    name.value=state.combat.conditions.includes(selected)?'':selected;
  };
  let busy=false;
  async function apply(payload,focus){
    if(busy)return;
    busy=true;
    const result=await dispatch('condition',payload);
    busy=false;
    error.hidden=Boolean(result?.ok);
    error.textContent=result?.ok?'':result?.message??'État non modifié.';
    if(result?.ok)(focus()??name).focus();
  }
  active.onclick=event=>{
    const remove=event.target.closest('[data-remove-condition]');
    if(remove)void apply({name:remove.dataset.removeCondition,enabled:false},()=>active.querySelector('button'));
  };
  duration.onchange=()=>{
    const manual=duration.value==='manual';
    dialog.querySelector('[data-turn-count]').hidden=manual;
    turns.disabled=manual;
  };
  form.onsubmit=event=>{
    event.preventDefault();
    void apply({name:name.value,enabled:true,turns:duration.value==='turns'?Number(turns.value):0},()=>name);
  };
  const selector=document.activeElement.closest('.compact-header')?'.compact-header':'.turn-header';
  dialog.querySelector('[data-close]').onclick=()=>dialog.close();
  dialog.onclose=()=>{
    document.removeEventListener('kobe-mechanical-update',refresh);
    dialog.remove();
    document.querySelector(`${selector} [data-action=conditions]`)?.focus({preventScroll:true});
  };
  document.addEventListener('kobe-mechanical-update',refresh);
  refresh();
  document.body.append(dialog);
  dialog.showModal();
}
