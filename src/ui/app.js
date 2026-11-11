import {conditionButton, openConditions} from './condition-ui.js';
import {playKobeVfx,vfxForCommand} from './kobe-vfx.js';
import {playSpellFx} from './kobe-spell-fx-pilots-20261108.js';
import {canAct} from '../kobe/combat.js';
import {supportCockpit,comboAvailability,ardentStage} from './support-ui.js';
import {initJournal} from '../companion/journal.js';
import {initSession} from '../companion/session.js';
import {initInventory} from '../companion/inventory.js';
import {rollPanel,roll,selectRollControl} from './social.js';
import {mountConnect} from './connect-ui.js';
import {kharvekPanel,openKharvekForm} from "./kharvek-ui.js";
import {quickAttack,spellbookPanel,filterSpells,handleBookClick,handleBookControl,openSpellCast,openSpellDetail,openSpellResolve,openSpellControl} from './spell-ui.js';
import {combatFollowups, quickActions, socialPanel, openCombatForm} from './combat-ui.js';
import {createStore} from '../kobe/storage.js';
const sessionDesk=document.getElementById('sessionDesk');
const inventoryDesk=document.getElementById('inventoryDesk');
initInventory();
const mount=document.querySelector('#app');
const store=createStore({storage:localStorage,locks:navigator.locks});
let state=store.getState(), problem='', busy=false, loaded=false;
let cacheMessage='Cache hors ligne en préparation';
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let groupOpen=false, comboHeal=false, table;
const nav=[['combat','Combat'],['spells','Sorts & pouvoirs'],['social','Social'],['journal','Journal']];
const button=(id,label,style='')=>`<button type="button" data-action="${id}" class="${style}">${escapeHTML(label)}</button>`;
function body(){
if(groupOpen)return '<div id="group-slot"></div>';

if(['combat','kharvek'].includes(state.preferences.tab)){
 const bar=combatView==='kharvek'
   ? sectionButtons({offense:'← Retour au cockpit',kharvek:'Khar-Vek'},combatView,'combat-view')
   : '';
 return bar+(combatView==='kharvek'?kharvekPanel(state):supportCockpit(state,comboHeal));
}
if(state.preferences.tab==='spells')return spellbookPanel(state);
if(state.preferences.tab==='social')return sectionButtons({profile:'Profil',inventory:'Inventaire'},socialView,'social-view')+(socialView==='inventory'?'<div id="inventory-slot"></div>':`${rollPanel(state)}<section class="panel"><h2>Social · notes privées</h2><p class="muted">Carnet conservé localement. Les décisions et résultats restent annoncés à la table.</p>${socialPanel(state)}<label for="notes">Notes de Kobe</label><textarea id="notes" maxlength="20000">${escapeHTML(state.notes)}</textarea><small id="notes-status">Sauvegarde automatique</small></section>`);
return `<div id="session-slot"></div>${combatFollowups(state, 'effects')}<section class="panel"><h2>Sauvegarde de jeu</h2><div class="actions">${button('export','Exporter la sauvegarde','primary')}${button('import','Importer une sauvegarde')}</div></section>`;
}
let combatView=sessionStorage.getItem('combat-pane')==='kharvek'?'kharvek':'offense',socialView='profile';
function sectionButtons(items,selected,attribute){
 return `<nav class="combat-subtabs">${Object.entries(items).map(([id,label])=>`<button type="button" data-${attribute}="${id}" aria-pressed="${id===selected}" class="combat-subtab ${id===selected?'active':''}">${label}</button>`).join('')}</nav>`;
}
const secondaryView=()=>groupOpen||!['combat','kharvek'].includes(state.preferences.tab);
function header(){
 const compact=secondaryView()? `<header class="compact-header"><strong>Kobe Kozzo</strong><span>${state.hp.current}/${state.hp.max} PV · CA ${state.profile.ac}</span>${conditionButton(state)}</header>`:'';
 return `${compact}<header class="top turn-header">
   <div class="turn-identity"><img src="./src/ui/emblem.webp" alt="Emblème de Kobe"><div><h1>Kobe Kozzo</h1><p>Barde 10 · Collège du Glamour</p></div></div>
   <div class="turn-vitals">
     <div class="turn-hp">
       <label class="turn-value"><input id="hp" type="number" min="0" max="${state.hp.max}" aria-label="PV actuels de Kobe" value="${state.hp.current}"> / ${state.hp.max} PV</label>
       <div class="hp-actions">${button('damage','Dégâts','mini')}${button('heal','Soin','mini')}</div>
     </div>
     <label class="turn-value tempstat"><input id="tempHpInput" type="number" min="0" max="10000" aria-label="PV temporaires de Kobe" value="${state.hp.temp}"> PV temp.</label>
     <span class="turn-metric">CA <b>${state.profile.ac}</b></span><span class="turn-metric">DD <b>17</b></span>
   </div>
   ${conditionButton(state)}
 </header>`;
}

function renderTableControls(v=table?.status()){
 const shared=v?.shared===true, playing=v?.session?.phase==='fight';
 const ready=shared&&v.connected&&v.gmOnline&&!v.sessionStale;
 const mine=ready&&playing&&v.session.activeCharacterId==='kobe';
 const phase=state.combat.phase;
 let label='Tour '+(state.turn.startRevision+1),action=phase==='active'?'end-turn':'next-turn';
 let buttonText=phase==='active'?'Fin de tour':'Début de mon tour',disabled=false;
 if(shared){
   action='signal-turn-end';disabled=!v.canSignal;
   const name=v.session?.activeName;
   const text=!ready?'Attente du MJ':v.signalled&&mine?'Fin signalée au MJ':
     mine?'À toi de jouer':playing&&name?'Tour de '+name:'Attente du combat';
   label=(ready&&playing&&Number.isSafeInteger(v.session?.round)?'Round '+v.session.round+' · ':'')+text;
   buttonText=v.canSignal?'Signaler la fin du tour':text;
 }
 const badge=mount.querySelector('.turn-number');
 if(badge){
   if(badge.textContent!==label)badge.textContent=label;
   badge.dataset.shared=String(shared);
 }
 const turnButton=mount.querySelector('.turn-finish');
 if(turnButton){
   if(turnButton.textContent!==buttonText)turnButton.textContent=buttonText;
   turnButton.dataset.action=action;turnButton.disabled=disabled;
   turnButton.dataset.shared=String(shared);
 }
 const launcher=mount.querySelector('[data-action=rpg-connect]');
 if(launcher){
   launcher.querySelector('.rpg-connect-dot').classList.toggle('online',Boolean(v?.connected&&v.gmOnline));
   const pending=v?.pending?.filter(({event})=>!['initiative:request','initiative:retry'].includes(event.type)).length??0;
   const indicator=launcher.querySelector('[data-rpg-unread]');
   indicator.hidden=!pending;indicator.textContent=String(pending);
 }
}

function turnbar(){
 const active=state.combat.phase==='active';
 const able=canAct(state);
 return `<section id="cc-turnbar-standard" class="turnbar turn-strip" aria-label="Barre de tour">
   <strong class="turn-number">Tour ${state.turn.startRevision+1}</strong>
   <button data-action="initiative" aria-label="Lancer l’initiative">Initiative +4</button>
   <button data-action="spend-reaction" ${able&&state.economy.reactionAvailable?'':'disabled'}>Réaction <small>${state.economy.reactionAvailable?'disponible':'dépensée'}</small></button>
   <button data-combat="move" ${active&&able&&state.economy.movementRemaining?'':'disabled'}>${state.economy.movementRemaining} m <small>restants</small></button>
   <button data-combat="${state.concentration?'concentration-end':'concentration'}">Concentration <small>${escapeHTML(state.concentration?.name??'aucune')}</small></button>
   <div class="turn-rests" aria-label="Repos">
     <button type="button" class="restquick" data-combat="rest" data-rest-kind="short" aria-label="Repos court"><span aria-hidden="true">↻</span> Court</button>
     <button type="button" class="restquick long" data-combat="rest" data-rest-kind="long" aria-label="Repos long"><span aria-hidden="true">☾</span> Long</button>
   </div>
 </section>`;
}

function render(){
 const bookScroll=mount.querySelector('.grimoire-list')?.scrollTop??0;
 const networkPanel=document.getElementById('rpg-connect');
 if(networkPanel&&mount.contains(networkPanel))document.body.append(networkPanel);
 if(mount.contains(resultRibbon))document.body.append(resultRibbon);
 const secondary=secondaryView();
 mount.innerHTML=`<main class="shell app" data-view="${state.preferences.tab}" data-secondary="${secondary}">
   ${header()}${turnbar()}
   ${state.hp.current===0&&!state.combat.death.dead
     ? `<div class="turn-dying">${state.combat.death.stable?'':'<button type="button" data-combat="death-save">Jet de mort</button>'}<label><input id="critical" type="checkbox"> Dégâts critiques à 0 PV</label></div>` : ''}
   ${combatFollowups(state, 'pending')}
   ${problem?`<div role="alert" class="warning">${escapeHTML(problem)}</div>`:''}
   <div aria-live="polite" class="status">${loaded?'Sauvegardé':'Initialisation…'} · <span data-cache-status>${escapeHTML(cacheMessage)}</span></div>
   ${body()}
   <footer class="footer">Kobe Companion V1.4 · Compagnie Créole</footer>
   <nav class="tabs turn-dock" aria-label="Sections principales">
     ${nav.map(([id,title])=>`<button type="button" role="tab" class="tab ${!groupOpen&&state.preferences.tab===id?'active':''}" aria-selected="${!groupOpen&&state.preferences.tab===id}" data-tab="${id}">${title}</button>`).join('')}
     <button type="button" role="tab" class="tab ${groupOpen?'active':''}" aria-selected="${groupOpen}" aria-label="Groupe" data-network-link>Groupe</button>
     <button type="button" class="turn-rpg" data-action="rpg-connect" aria-label="RPG Connect" aria-controls="kobe-rpg-panel" aria-expanded="${document.getElementById('kobe-rpg-panel')?.hidden===false}"><span class="rpg-connect-dot" aria-hidden="true"></span> RPG<span class="turn-rpg-long"> Connect</span><small data-rpg-unread hidden></small></button>
     <button type="button" class="turn-finish"></button>
   </nav>
 </main>`;
 renderTableControls();
 filterSpells(state);
 const bookList=mount.querySelector('.grimoire-list');
 if(bookList)bookList.scrollTop=bookScroll;
 const resultSlot=mount.querySelector('#turn-result-slot');
 if(resultSlot){
   const last=state.journal.findLast(event=>!['notes','private-roll','favorites'].includes(event.sourceId));
   resultSlot.innerHTML=`<details class="last-action"><summary>Dernière action</summary><p>${escapeHTML(last?.label??'Aucune action jouée.')}</p>${state.undo?button('undo','Annuler'):''}</details>`;
   resultSlot.append(resultRibbon);
 }
 if(!groupOpen&&state.preferences.tab==='journal'){
   mount.querySelector('#session-slot').replaceWith(sessionDesk);
   sessionDesk.hidden=false;
 }else sessionDesk.remove();
 const network=document.getElementById('rpg-connect');
 if(network){
   const slot=mount.querySelector('#group-slot');
   if(slot){slot.replaceWith(network);network.hidden=false;}
   else{document.body.append(network);network.hidden=true;}
 }
 const inventorySlot=mount.querySelector('#inventory-slot');
 if(inventorySlot){inventorySlot.replaceWith(inventoryDesk);inventoryDesk.hidden=false;inventoryDesk.open=true;}
 else inventoryDesk.remove();
 const lastRoll=mount.querySelector('output.ribbon');
 if(lastRoll)lastRoll.textContent=state.journal.findLast(event=>event.sourceId==='private-roll')?.label??'';
}
const resultRibbon=document.getElementById('ribbon');
resultRibbon.querySelector('[data-ribbon-close]').onclick=()=>{resultRibbon.hidden=true;};
resultRibbon.querySelector('[data-ribbon-undo]').onclick=async()=>{if(state.undo?.commandId===resultRibbon.dataset.command)await dispatch('undo',{commandId:state.undo.commandId});};
function updateRibbon(result,type){
 if(!result.ok||result.replay)return;
  if(type==='preferences'){resultRibbon.hidden=true;return;}
  if(['notes','favorites','private-roll'].includes(type))return;
  // An attack roll is not a confirmed hit: never reveal its pre-rolled damage.
  if(type==='spell-cast'&&result.state?.pendingResolutions?.some(item=>item.spellId==='fire-bolt'&&item.sourceId===result.events?.[0]?.id)){
    resultRibbon.hidden=true;
    window.CompanionResultFocus?.hide?.();
    return;
  }
 resultRibbon.hidden=true;
 if(type==='condition')return; // The panel and header already show the result.
 const event=result.events?.at(-1);
 if(!event?.label)return;
 resultRibbon.querySelector('.rb').textContent=type==='undo'?'Dernière action annulée.':event.label;
 resultRibbon.dataset.tone=event.kind;
 resultRibbon.hidden=false;
 resultRibbon.querySelector('[data-ribbon-undo]').hidden=!state.undo;
 resultRibbon.dataset.command=state.undo?.commandId??'';
}
store.subscribe(s=>{if(s.turn.startRevision!==state.turn.startRevision||s.turn.epoch!==state.turn.epoch||s.turn.combatId!==state.turn.combatId)comboHeal=false;state=s;document.dispatchEvent(new Event('kobe-mechanical-update'));if(!busy)render();});
const make=(type,payload={})=>({id:'local-'+crypto.randomUUID(),actorId:'kobe',origin:'player',expectedRevision:state.revision,type,payload});
async function dispatch(type,payload){
  if(busy)return;
  // A cast only rolls the attack; the corresponding resolution confirms a hit.
  const resolution=['spell-resolve','resolve'].includes(type)
    ? state.pendingResolutions.find(item=>item.id===payload?.id)
    : null;
  busy=true;mount.inert=true;
  try{
    const r=await store.dispatch(make(type,payload));
    updateRibbon(r,type);
    // The hit/miss decision owns damage presentation, never the preceding attack roll.
    if(r.ok&&!r.replay&&type==='spell-resolve'&&resolution?.spellId==='fire-bolt'){
      window.CompanionResultFocus?.hide?.();
      const event=r.events?.at(-1);
      const outcome=payload?.result;
      if(event&&['hit','critical'].includes(outcome)){
        const effective=event.label?.match(/·\s*(\d+)\s+dégâts\s+\S+\s+effectifs/i);
        if(effective){
          const shown=window.CompanionResultFocus?.showStructured?.({
            eventId:event.id,title:'Trait de feu · '+(outcome==='critical'?'Critique':'Touché'),
            damages:[{amount:Number(effective[1]),type:spellById('fire-bolt')?.damageType||'fire'}]
          });
          if(shown)resultRibbon.hidden=true;
        }
      }
    }
    // Show only dice already accepted by the engine; no reroll or second journal write.
    if(r.ok&&!r.replay&&(type==='kharvek-power'||(type==='mantle'&&payload?.survivors===true))){
      const event=r.events?.at(-1),dice=event?.rolls;
      const power=type==='mantle'?'survivors':payload.power;
      const faces=power==='survivors'?10:8,count=power==='pulse'?3:power==='rally'?2:1;
      if(event&&Array.isArray(dice)&&dice.length===count&&dice.every(x=>Number.isSafeInteger(x)&&x>=1&&x<=faces)){
        const healing={kind:'healing',amount:dice.reduce((sum,x)=>sum+x,5),formula:count+'d'+faces,dice,bonus:5};
        const heals=power==='survivors'?[healing,{kind:'temporary',amount:11}]:[healing];
        const shown=window.CompanionResultFocus?.showStructured?.({eventId:event.id,title:event.label.split(' · ')[0],heals});
        if(shown)resultRibbon.hidden=true;
      }
    }
    if(!r.ok)problem=r.message||r.code;
    else{
      problem='';
      if(!r.replay){
        const effect=vfxForCommand(type,resolution?{...payload,spellId:resolution.spellId,kind:resolution.kind}:payload);
        if(type==='spell-cast' && ['dissonant-whispers','mirror-image','circle-of-power'].includes(String(payload.spellId||'').toLowerCase())) playSpellFx(String(payload.spellId).toLowerCase());
        else if(effect)playKobeVfx(effect);
      }
    }
    return r;
  }finally{busy=false;mount.inert=false;render();}
}
function quickRest(kind){
 const long=kind==='long';
 const detail=long?'8 heures · PV, emplacements et ressources restaurés. Jusqu’à 5 dés de vie récupérés.':'1 heure · Inspiration bardique et Représentation récupérées.';
 companionRestConfirm(kind,detail,()=>{
   const dice=String(form.querySelector('[name=dice]')?.value??'').trim().split(/\s+/).filter(Boolean).map(Number);
   const song=Number(form.querySelector('[name=song]')?.value);
   dispatch('rest',{kind,confirmed:true,longEligible:long,dice,...(song?{song,songEligible:true}:{})});
 });
 const form=document.getElementById('companionRestConfirm');form.querySelector('details')?.remove();
 if(!long){const options=document.createElement('details');options.innerHTML='<summary>Dépenser des dés de vie</summary><label>Résultats des d8<input name="dice" placeholder="Ex. 4 6"></label><label>Chant reposant (d8)<input name="song" type="number" min="1" max="8"></label>';form.querySelector('.companion-rest-actions').before(options);}
}
async function download(text,name){const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);}
async function importFile(){const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.onchange=async()=>{try{const raw=await input.files[0].text(),preview=store.preview(raw);if(!await RPGDialogs.confirm(`Remplacer l'état courant ? PV importés : ${preview.summary.hp.current}. Une sauvegarde originale sera conservée.`))return;const r=await store.import(preview);problem=r.ok?'Import confirmé et enregistré.':r.message;}catch(e){problem='Import refusé : '+e.message;}render();};input.click();}
let noteTimer;
async function saveNotes(){
 clearTimeout(noteTimer);const n=mount.querySelector('#notes');if(!n||n.value===state.notes)return;
 if(busy){noteTimer=setTimeout(saveNotes,150);return;}
 const focused=document.activeElement===n,start=n.selectionStart,end=n.selectionEnd,text=n.value;
 await dispatch('notes',{text});
 const next=mount.querySelector('#notes');if(focused&&next){next.focus({preventScroll:true});next.setSelectionRange(start,end);}
}
mount.addEventListener('input',e=>{if(e.target.id==='spell-search')handleBookControl(state,e.target);if(e.target.id==='notes'){clearTimeout(noteTimer);noteTimer=setTimeout(saveNotes,350);}});
mount.addEventListener('focusout',e=>{if(e.target.id==='notes')saveNotes();});

mount.addEventListener('change',async event=>{
 const input=event.target;
 if(input.matches('[data-combo-heal]')){comboHeal=input.checked;render();return;}
 if(!['hp','tempHpInput'].includes(input.id))return;
 if(!input.value||!input.checkValidity()){render();return;}
 await dispatch('correct',{field:input.id==='hp'?'hp':'temp',value:Number(input.value),reason:'Ajustement de la fiche'});
});
mount.addEventListener('change',e=>{if(e.target.id!=='spell-search')handleBookControl(state,e.target);});

mount.addEventListener('click',async e=>{
 if(handleBookClick(state,e.target))return;
 const intention=e.target.closest('[data-intent]');
 if(intention){
   filterSpells(state,{role:intention.dataset.intent});
   groupOpen=false;
   await dispatch('preferences',{tab:'spells'});
   window.scrollTo(0,0);
   return;
 }
 const combo=e.target.closest('[data-combo]');
 if(combo){
   const stage=ardentStage(state);
   if(combo.dataset.combo!==stage)return;
   if(stage==='fireball'){
     await openSpellCast('fireball',state,dispatch,mount.querySelector('[data-combo-level]')?.value);
   }else if(comboAvailability(state,comboHeal).ok){
     const result=comboHeal?await openKharvekForm('survivors',state,dispatch):await dispatch('mantle',{table:true});
     if(result?.ok)comboHeal=false;
   }
   return;
 }
 if(e.target.closest('[data-network-link]')){e.preventDefault();groupOpen=true;render();window.scrollTo(0,0);return;}const view=e.target.closest('[data-combat-view],[data-social-view]');if(view){if(view.dataset.combatView){combatView=view.dataset.combatView;sessionStorage.setItem('combat-pane',combatView);}else socialView=view.dataset.socialView;render();return;}if(selectRollControl(e.target))return;if(e.target.closest('[data-inventory-link]'))inventoryDesk.open=true;const check=e.target.closest('[data-roll]');if(check){await roll(check.dataset.roll,dispatch);return;}const charge=e.target.closest('[data-charge-value]');if(charge){await dispatch('correct',{field:'charges',value:Number(charge.dataset.chargeValue),reason:'Ajustement des charges'});return;}const kv=e.target.closest('[data-kharvek]');if(kv){openKharvekForm(kv.dataset.kharvek,state,dispatch);return;}const cast=e.target.closest('[data-cast]');if(cast){openSpellCast(cast.dataset.cast,state,dispatch);return;}const detail=e.target.closest('[data-spell-detail]');if(detail){openSpellDetail(detail.dataset.spellDetail);return;}const fav=e.target.closest('[data-favorite]');if(fav){const id=fav.dataset.favorite,ids=state.preferences.favorites.includes(id)?state.preferences.favorites.filter(x=>x!==id):[...state.preferences.favorites,id];await dispatch('favorites',{ids});return;}const sr=e.target.closest('[data-spell-resolve]');if(sr){openSpellResolve(sr.dataset.spellResolve,state,dispatch);return;}const sc=e.target.closest('[data-spell-control]');if(sc){openSpellControl(sc.dataset.spellControl,state,dispatch);return;}const slot=e.target.closest('[data-slot]');if(slot){await dispatch('slot-correct',{level:Number(slot.dataset.slot),value:Number(slot.dataset.slotValue),reason:'Ajustement du grimoire'});return;}const combat=e.target.closest('[data-combat]');if(combat&&combat.dataset.combat==='fire-bolt'){await quickAttack(dispatch,mount.querySelector('#signature-target')?.value??'Cible annoncée',mount.querySelector('[name=signature-mode]:checked')?.value??'normal',mount.querySelector('#signature-dice')?.value??'');return;}if(combat){if(combat.dataset.restKind){quickRest(combat.dataset.restKind);return;}openCombatForm(combat.dataset.combat,state,dispatch);return;}const tab=e.target.closest('[data-tab]');if(tab){groupOpen=false;resultRibbon.hidden=true;window.CompanionResultFocus?.hide?.();await dispatch('preferences',{tab:tab.dataset.tab});window.scrollTo(0,0);return;}const target=e.target.closest('[data-action]');if(!target)return;const a=target.dataset.action;if(a==='conditions'){openConditions(()=>state,dispatch);return;}if(a==='initiative'){const die=1+Math.floor(Math.random()*20);await dispatch('initiative-roll',{die});return;}if(['damage','heal','temp'].includes(a)){const raw=await RPGDialogs.prompt(a==='damage'?'Dégâts reçus':a==='heal'?'PV récupérés':'PV temporaires reçus','1');if(raw===null)return;const amount=Number(raw);if(!Number.isSafeInteger(amount)||amount<=0||amount>10000){await RPGDialogs.alert('Saisir un nombre entier entre 1 et 10 000.');return;}await dispatch(a==='temp'?'set-temp-hp':a,{amount,...(a==='damage'?{critical:document.querySelector('#critical')?.checked===true}:{})});return;}if(a.startsWith('spend-')){const key={ 'spend-action':'actionAvailable','spend-bonus':'bonusAvailable','spend-reaction':'reactionAvailable'}[a];await dispatch('spend',{economy:key});return;}if(a==='rpg-connect'){table.togglePanel();return;}if(a==='signal-turn-end'){await table.signalTurnEnd();return;}if(a==='end-turn'){await dispatch('turn-next',{turn:state.turn.startRevision+1,epoch:state.turn.epoch,combatId:state.turn.combatId});return;}if(a==='next-turn'){await dispatch('turn-start',{turn:state.turn.startRevision+1,epoch:state.turn.epoch,combatId:state.turn.combatId});return;}if(a==='save-notes'){await dispatch('notes',{text:document.querySelector('#notes').value});return;}if(a==='undo'){if(state.undo)await dispatch('undo',{commandId:state.undo.commandId});return;}if(a==='correct'){const value=await RPGDialogs.prompt('Nouveaux PV (0 à '+state.hp.max+')',state.hp.current);if(value===null)return;const v=Number(value);if(!Number.isSafeInteger(v)||v<0||v>state.hp.max){problem='Valeur de PV invalide.';render();return;}const reason='Correction de table';await dispatch('correct',{field:'hp',value:v,reason:reason.trim()});return;}if(a==='export'){await download(store.export(),'kobe-sauvegarde-v1.json');return;}if(a==='import'){await importFile();}});
const load=await store.load();state=load.state;if(state.preferences.tab==='kharvek'){combatView='kharvek';}loaded=true;
const journalApi={events:()=>state.journal,log:message=>{const toast=sessionDesk.querySelector('#sessionToast');if(toast)toast.textContent=message;}};
document.body.append(sessionDesk);
initJournal(sessionDesk,journalApi);initSession(sessionDesk,journalApi);
if(!load.ok)problem=load.recoveryStatus||'Sauvegarde non disponible : lecture seule.';render();
function cacheStatus(message){cacheMessage=message;const node=mount.querySelector('[data-cache-status]');if(node)node.textContent=message;}
if('serviceWorker' in navigator && location.protocol.startsWith('http')){
 const readiness=()=>{if(navigator.serviceWorker.controller)cacheStatus('Prêt hors ligne');};
 navigator.serviceWorker.addEventListener('controllerchange',readiness);
 navigator.serviceWorker.register('./sw.js').then(async reg=>{
   await navigator.serviceWorker.ready;readiness();
   const pending=()=>{if(reg.waiting)cacheStatus('Mise à jour prête · fermez tous les onglets Kobe après la session');};
   pending();reg.addEventListener('updatefound',()=>reg.installing?.addEventListener('statechange',pending));
 }).catch(()=>cacheStatus('Cache non confirmé · restez en ligne'));
}else cacheStatus('Cache hors ligne indisponible');


table=mountConnect(store,quickActions,dispatch,renderTableControls);render();
