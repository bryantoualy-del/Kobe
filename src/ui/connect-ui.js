import {createConnect} from '../kobe/connect.js';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function text(tag,value,cls){const n=document.createElement(tag);n.textContent=value;if(cls)n.className=cls;return n;}
export function mountConnect(store,quickActions){
  const root=document.createElement('section');root.className='group-surface';root.id='rpg-connect';document.body.append(root);
  let current,notice='';
  function render(v){
    current=v;
    const opened=root.querySelector('details')?.open??!v.connected;
    const oldInput=root.querySelector('input')?.value??'';
    const self=store.getState();
    const rows=[...v.group].sort((a,b)=>(b.initiative??-100)-(a.initiative??-100));
    root.innerHTML=`<section class="rpg-group-view"><aside class="card rpg-quick-column"><h2>Actions rapides</h2>${quickActions(self)}<button data-combat="combat-correct">Modifier mon état</button></aside><section class="card rpg-initiative"><header><h2>Groupe · initiative</h2><small>${v.stale?'Tour partagé non confirmé':v.session?.round?'Round '+v.session.round:''}</small></header><div data-initiative-list></div></section></section><details class="panel" ${opened?'open':''}><summary>RPG Connect · ${v.connected?'Connecté':'Local'}${v.pending?.length?' · demandes MJ':''}</summary>
    <p role="status">${escape(v.status)}</p><p>${escape(notice)}</p>
    <p class="muted">Table Libre V5. PV personnels publiés après sauvegarde. Les soins et soutiens alliés restent annoncés oralement ; aucune application distante. Les tours restent confirmés dans Combat.</p>
    <label>Invitation Kobe <input type="password" autocomplete="off" data-invite placeholder="RPGCONNECT|…" /></label>
    <div class="actions"><button data-connect>Rejoindre la partie</button><button data-disconnect>Déconnecter</button></div>
    <p>MJ : ${v.gmOnline?'en ligne':'absent / non confirmé'} · Groupe ${v.stale?'périmé ou inconnu':'synchronisé'}</p>
    ${v.session?'<p>Tour partagé : '+escape(v.session.activeName||'—')+' · round '+escape(v.session.round||'—')+'</p>':''}
    ${(v.pending??[]).map(({event:e})=>'<article class="entry"><strong>'+escape(e.type)+'</strong><p>'+escape(e.payload?.text||'Décision du MJ à confirmer à la table')+'</p>'+
      (['hp:set','tempHp:set'].includes(e.type)?'<p>Valeur proposée : '+escape(e.payload?.value)+' · valeur attendue : '+escape(e.payload?.expectedValue??'non fournie')+'</p><button data-accept="'+escape(e.id)+'">Appliquer cette correction</button>':e.type==='conditions:set'?'<p>États proposés : '+escape((e.payload?.conditions||[]).map(c=>c?.name??c).join(', ')||'aucun')+'</p><button data-accept="'+escape(e.id)+'">Appliquer ces états</button>':'')+
      (['initiative:request','initiative:retry'].includes(e.type)?'<button data-initiative="'+escape(e.id)+'">Transmettre mon initiative</button>':'')+
      '<button data-decline="'+escape(e.id)+'">Traité à la table · sans application</button></article>').join('')}
    <button data-end-request>Demander au MJ la fin du tour</button>
    <p class="muted">Aucun événement n’est renvoyé automatiquement après reconnexion. Une réception serveur ne vaut pas validation du MJ. Invitation conservée uniquement en mémoire ; recollez-la après fermeture.</p>
    ${(v.sent??[]).map(e=>'<p>'+escape(e.type)+' : '+escape(e.status)+'</p>').join('')}</details>`;
    const list=root.querySelector('[data-initiative-list]');
  for(const a of rows){const row=document.createElement('article');row.className='rpg-initiative-row';row.dataset.groupActor=a.id;const active=!!a.activeTurn&&!v.stale;row.classList.toggle('is-current-turn',active);row.append(text('strong',Number.isFinite(a.initiative)?a.initiative:'—','rpg-initiative-value'));
   if(a.portrait){const img=document.createElement('img');img.src=a.portrait;img.alt='';row.append(img);}const body=document.createElement('div');body.append(text('strong',a.name));if(active)body.append(text('small','Tour actif','rpg-active-label'));
   if(a.health){body.append(text('span',a.health.current+'/'+a.health.max+' PV'+(a.health.temp?' · +'+a.health.temp+' PV temp.':'')));const bar=document.createElement('progress');bar.max=Math.max(1,a.health.max);bar.value=a.health.current;bar.setAttribute('aria-label','PV de '+a.name);body.append(bar);}
   const states=document.createElement('div');states.className='rpg-group-states';for(const c of a.conditions||[]){const name=typeof c==='string'?c:c.name;if(name)states.append(text('span',name,'rpg-group-state'));}body.append(states);row.append(body);
   const meta=document.createElement('div');meta.className='rpg-group-meta';if(Number.isFinite(a.ac))meta.append(text('span','CA '+a.ac));if(a.kind!=='enemy'){meta.append(text('span',a.reaction===true?'Réaction disponible':a.reaction===false?'Réaction utilisée':'Réaction —'));if(a.concentration)meta.append(text('span','Concentration','rpg-concentration-label'));}row.append(meta);list.append(row);
  }
  if(!rows.length)list.append(text('p','Aucun ordre partagé par Encounter. Le personnage reste utilisable en local.'));
    root.querySelector('[data-invite]').value=oldInput;
  }
  const client=createConnect({store,onChange:render,onActivity:(room,rows)=>document.dispatchEvent(new CustomEvent('kobe-activity',{detail:{room,rows}}))});render(client.status());
  root.addEventListener('click',async e=>{
    const b=e.target.closest('button');if(!b)return;
    try{
      if(b.hasAttribute('data-connect')){client.connect(root.querySelector('[data-invite]').value);root.querySelector('[data-invite]').value='';}
      if(b.hasAttribute('data-disconnect'))client.disconnect();
      if(b.dataset.accept||b.dataset.decline){
        b.disabled=true;const r=await client.review(b.dataset.accept||b.dataset.decline,!!b.dataset.accept);
        notice=r.ok?'Décision enregistrée.':r.message||r.code;render(client.status());
      }
      if(b.dataset.initiative){
        const event=current.pending.find(x=>x.event.id===b.dataset.initiative)?.event;
        const value=await RPGDialogs.prompt('Résultat du d20 d’initiative (bonus +4 ajouté)',String(1+Math.floor(Math.random()*20)));
        if(value===null)return;const die=Number(value);
        const result=await client.initiative(event.id,die);
        notice=result.message||'Initiative consignée. Validation finale par le MJ.';render(client.status());
      }
      if(b.hasAttribute('data-end-request')){
        const s=store.getState();
        if(s.combat.phase!=='ended')throw Error('Terminez d’abord votre tour avec le bouton Combat.');
        const actionId=s.journal.findLast(x=>x.sourceId==='turn-end')?.id;
        if(!actionId||!client.sendEvent('turn:end-request',{turn:s.turn.startRevision,actionId}))throw Error('MJ ou connexion indisponible : annoncez la fin du tour oralement.');
      }
    }catch(error){notice=error.message;render(client.status());}
  });
  store.subscribe(()=>render(client.status()));
  return client;
}
