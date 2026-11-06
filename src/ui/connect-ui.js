import {createConnect} from '../kobe/connect.js';
import {connectFrame} from '../companion/connect-frame.js';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function text(tag,value,cls){const n=document.createElement(tag);n.textContent=value;if(cls)n.className=cls;return n;}
export function mountConnect(store,quickActions,dispatch){
  const root=document.createElement('section');root.className='group-surface';root.id='rpg-connect';document.body.append(root);
  const shell=document.createElement('div');shell.className='rpg-connect';shell.innerHTML=connectFrame;document.body.append(shell);
  const panel=shell.querySelector('.rpg-connect-panel');
  for(const selector of ['.rpg-self-conditions','.rpg-targets-block','.rpg-target-active','.rpg-resolution-toast'])shell.querySelector(selector)?.remove();
  const invitation=panel.querySelector('[name=invite]');invitation.setAttribute('aria-label','Invitation Kobe');invitation.dataset.invite='';
  const requests=document.createElement('div');requests.className='rpg-request-list';panel.append(requests);
  const config=panel.querySelector('.rpg-connect-config');
  config.hidden=true;
  panel.querySelector('[data-toggle-config]').onclick=()=>{config.hidden=!config.hidden;shell.classList.toggle('rpg-show-config',!config.hidden);};
  panel.querySelector('[data-forget]').onclick=()=>{client.disconnect();invitation.value='';for(const input of config.querySelectorAll('input'))input.value='';};
  const close=()=>{panel.hidden=true;};
  shell.querySelector('.rpg-connect-launch').onclick=()=>{panel.hidden=!panel.hidden;};
  panel.querySelector('[data-close]').onclick=close;
  document.addEventListener('pointerdown',e=>{if(!shell.contains(e.target))close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
  let current,notice='';
  function render(v){
    current=v;
    shell.classList.toggle('rpg-connected',v.connected);
    const self=store.getState();
    const rows=[...v.group].sort((a,b)=>(b.initiative??-100)-(a.initiative??-100));
    root.innerHTML=`<section class="rpg-group-view" id="rpgGroupView"><aside class="card rpg-quick-column"><h2>Actions rapides</h2><div data-group-quick>${quickActions(self)}</div><button type="button" data-edit-self class="ability">Modifier mon état</button></aside><section class="card rpg-initiative"><header><h2>Groupe · initiative</h2><small data-group-status>${v.stale?'Tour partagé non confirmé':v.session?.round?'Round '+v.session.round:''}</small></header><div data-initiative-list></div></section></section>`;
    root.querySelector('[data-group-quick]>.eyebrow')?.remove();
    root.querySelector('[data-group-quick]>h2')?.remove();
    root.querySelector('[data-edit-self]').onclick=()=>openSelf();
    shell.querySelector('.rpg-connect-dot').classList.toggle('online',v.connected&&v.gmOnline);
    shell.querySelector('.rpg-connect-status').textContent=v.connected?(v.gmOnline?'Connecté · MJ en ligne':'Connecté · MJ absent'):'Hors ligne · compagnon autonome';
    shell.querySelector('.rpg-connect-message').textContent=notice;
    const banner=shell.querySelector('[data-session-banner]');
    const mine=v.session?.activeCharacterId==='kobe'&&!v.stale;
    banner.dataset.tone=!v.connected?'offline':mine?'myturn':v.session?.phase==='fight'?'turn':'connected';
    shell.querySelector('[data-session-title]').textContent=mine?'À toi de jouer':v.session?.activeName||'Connecté à la partie';
    shell.querySelector('[data-session-detail]').textContent=v.session?.round?'Round '+v.session.round:v.gmOnline?'MJ en ligne':'En attente du MJ';
    const end=shell.querySelector('[data-end-turn-request]');end.hidden=!mine;end.disabled=self.combat.phase==='ended';
    requests.innerHTML=(v.pending??[]).filter(x=>!['initiative:request','initiative:retry'].includes(x.event.type)).map(({event:e})=>`<article class="rpg-request"><strong>${escape(e.payload?.text||({'hp:set':'Correction des PV','tempHp:set':'Correction des PV temporaires','conditions:set':'États personnels'}[e.type]||'Demande du MJ'))}</strong>${['hp:set','tempHp:set'].includes(e.type)?'<p>Valeur proposée '+escape(e.payload.value)+'</p><button data-accept="'+escape(e.id)+'">Appliquer cette correction</button>':e.type==='conditions:set'?'<p>'+escape((e.payload.conditions||[]).map(c=>c.name??c).join(', '))+'</p><button data-accept="'+escape(e.id)+'">Appliquer ces états</button>':''}<button data-decline="${escape(e.id)}">Traité à la table</button></article>`).join('');
    if(requests.childElementCount)panel.hidden=false;
    renderInitiative(v);
    const list=root.querySelector('[data-initiative-list]');
  for(const a of rows){const row=document.createElement('article');row.className='rpg-initiative-row';row.dataset.groupActor=a.id;const active=!!a.activeTurn&&!v.stale;row.classList.toggle('is-current-turn',active);row.append(text('strong',Number.isFinite(a.initiative)?a.initiative:'—','rpg-initiative-value'));
   if(a.portrait){const img=document.createElement('img');img.src=a.portrait;img.alt='';row.append(img);}const body=document.createElement('div');body.append(text('strong',a.name));if(active)body.append(text('small','Tour actif','rpg-active-label'));
   if(a.health){body.append(text('span',a.health.current+' / '+a.health.max+' PV'+(a.health.temp?' · +'+a.health.temp+' PV temp.':'')));const bar=document.createElement('progress');bar.max=Math.max(1,a.health.max);bar.value=a.health.current;bar.setAttribute('aria-label','PV de '+a.name);body.append(bar);}
   const states=document.createElement('div');states.className='rpg-group-states';for(const c of a.conditions||[]){const name=typeof c==='string'?c:c.name;if(name)states.append(text('span',name,'rpg-group-state'));}body.append(states);row.append(body);
   const meta=document.createElement('div');meta.className='rpg-group-meta';if(Number.isFinite(a.ac))meta.append(text('span','CA '+a.ac));if(a.kind!=='enemy'){meta.append(text('span',a.reaction===true?'Réaction disponible':a.reaction===false?'Réaction utilisée':'Réaction —'));if(a.concentration)meta.append(text('span','Concentration','rpg-concentration-label'));}row.append(meta);list.append(row);
  }
  if(!rows.length)list.append(text('p','Aucun ordre partagé par Encounter. Le personnage reste utilisable en local.'));
  }
  const initiative=shell.querySelector('.rpg-initiative-request');
  function renderInitiative(v){
    const pending=v.pending?.find(x=>['initiative:request','initiative:retry'].includes(x.event.type));
    if(!pending){if(initiative.open)initiative.close();initiative.hidden=true;return;}
    initiative.dataset.request=pending.event.id;
    initiative.querySelector('[data-init-profile]').textContent='Kobe · initiative +4';
    if(!initiative.open){initiative.hidden=false;initiative.showModal();}
  }
  initiative.querySelector('[data-init-roll]').onclick=async()=>{
    const button=initiative.querySelector('[data-init-roll]');if(button.disabled)return;button.disabled=true;
    try{
      const value=initiative.querySelector('[data-init-manual]').value;
      const die=value===''?1+Math.floor(Math.random()*20):Number(value);
      const r=await client.initiative(initiative.dataset.request,die);
      notice=r.message||'Initiative envoyée';render(client.status());
      if(!r.ok)initiative.querySelector('[data-init-result]').textContent=notice;
    }finally{button.disabled=false;}
  };
  const client=createConnect({store,connectionStorage:localStorage,onChange:render,onActivity:(room,rows)=>document.dispatchEvent(new CustomEvent('kobe-activity',{detail:{room,rows}}))});
  shell.addEventListener('click',async e=>{
    const b=e.target.closest('button');if(!b)return;
    try{
      if(b.hasAttribute('data-connect')){
        const advanced=['endpoint','room','token'].map(n=>config.querySelector('[name='+n+']').value.trim());
        client.connect(invitation.value.trim()||'RPGCONNECT|'+advanced[0]+'|'+advanced[1]+'|kobe|'+advanced[2]);
        invitation.value='';
      }
      if(b.hasAttribute('data-disconnect'))client.disconnect();
      if(b.dataset.accept||b.dataset.decline){b.disabled=true;const r=await client.review(b.dataset.accept||b.dataset.decline,!!b.dataset.accept);notice=r.ok?'Décision enregistrée.':r.message;render(client.status());}
      if(b.hasAttribute('data-end-turn-request'))document.querySelector('[data-action=end-turn]')?.click();
    }catch(error){notice=error.message;render(client.status());}
  });
  const editor=document.createElement('dialog');editor.className='rpg-self-editor';
  const conditions={prone:'À terre',grappled:'Agrippé',deafened:'Assourdi',blinded:'Aveuglé',charmed:'Charmé',frightened:'Effrayé',poisoned:'Empoisonné',restrained:'Entravé',stunned:'Étourdi',incapacitated:'Incapable d’agir',unconscious:'Inconscient',invisible:'Invisible',paralyzed:'Paralysé',petrified:'Pétrifié',silenced:'Silence'};
  editor.innerHTML=`<h2>Mon personnage</h2><form><label>PV <input name="hp" type="number" min="0" required></label><label>PV temporaires <input name="temp" type="number" min="0" max="10000" required></label><label>CA <input name="ac" type="number" min="0" max="100" required></label><label><input name="reaction" type="checkbox"> Réaction disponible</label><label>Concentration <input name="concentration" maxlength="120"></label><p>États personnels</p><div data-self-conditions>${Object.entries(conditions).map(([id,name])=>'<label><input type="checkbox" data-self-condition="'+id+'">'+name+'</label>').join('')}</div><p role="alert"></p><button type="submit">Appliquer</button><button type="button" data-cancel>Fermer</button></form>`;
  document.body.append(editor);
  function openSelf(){
    const s=store.getState(),f=editor.querySelector('form');
    f.elements.hp.value=s.hp.current;f.elements.hp.max=s.hp.max;f.elements.temp.value=s.hp.temp;f.elements.ac.value=s.profile.ac;f.elements.reaction.checked=s.economy.reactionAvailable;f.elements.concentration.value=s.concentration?.name||'';
    for(const c of editor.querySelectorAll('[data-self-condition]'))c.checked=s.combat.conditions.includes(c.dataset.selfCondition);
    editor.showModal();
  }
  editor.querySelector('[data-cancel]').onclick=()=>editor.close();
  editor.querySelector('form').onsubmit=async e=>{
    e.preventDefault();const b=editor.querySelector('[type=submit]');if(b.disabled)return;b.disabled=true;
    try{
      const f=e.target.elements;
      const r=await dispatch('self-correct',{hp:Number(f.hp.value),temp:Number(f.temp.value),ac:Number(f.ac.value),reaction:f.reaction.checked,concentration:f.concentration.value.trim(),conditions:[...editor.querySelectorAll('[data-self-condition]:checked')].map(c=>c.dataset.selfCondition)});
      if(r?.ok)editor.close();else editor.querySelector('[role=alert]').textContent=r?.message||'Correction refusée';
    }finally{b.disabled=false;}
  };
  store.subscribe(()=>render(client.status()));render(client.status());client.resume();
  return client;
}
