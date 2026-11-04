import {createConnect} from '../kobe/connect.js';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function mountConnect(store){
  const root=document.createElement('section');root.className='shell';root.id='rpg-connect';document.body.append(root);
  let current,notice='';
  function render(v){
    current=v;
    const opened=root.querySelector('details')?.open??false;
    const oldInput=root.querySelector('input')?.value??'';
    root.innerHTML=`<details class="panel" ${opened?'open':''}><summary>RPG Connect · ${v.connected?'Connecté':'Local'}${v.pending?.length?' · demandes MJ':''}</summary>
    <p role="status">${escape(v.status)}</p><p>${escape(notice)}</p>
    <p class="muted">Table Libre V5. PV personnels publiés après sauvegarde. Les soins et soutiens alliés restent annoncés oralement ; aucune application distante. Les tours restent confirmés dans Combat.</p>
    <label>Invitation Kobe <input type="password" autocomplete="off" data-invite placeholder="RPGCONNECT|…" /></label>
    <div class="actions"><button data-connect>Rejoindre la partie</button><button data-disconnect>Déconnecter</button></div>
    <p>MJ : ${v.gmOnline?'en ligne':'absent / non confirmé'} · Groupe ${v.stale?'périmé ou inconnu':'synchronisé'}</p>
    ${v.session?'<p>Tour partagé : '+escape(v.session.activeName||'—')+' · round '+escape(v.session.round||'—')+'</p>':''}
    <div>${v.group.map(r=>'<p><strong>'+escape(r.name)+'</strong> '+(r.health?escape(r.health.current)+'/'+escape(r.health.max)+' PV · '+escape(r.health.temp||0)+' temp':'PV non partagés')+' '+r.conditions.map(escape).join(', ')+'</p>').join('')}</div>
    ${(v.pending??[]).map(({event:e})=>'<article class="entry"><strong>'+escape(e.type)+'</strong><p>'+escape(e.payload?.text||'Décision du MJ à confirmer à la table')+'</p>'+
      (['hp:set','tempHp:set'].includes(e.type)?'<p>Valeur proposée : '+escape(e.payload?.value)+' · valeur attendue : '+escape(e.payload?.expectedValue??'non fournie')+'</p><button data-accept="'+escape(e.id)+'">Appliquer cette correction</button>':'')+
      (['initiative:request','initiative:retry'].includes(e.type)?'<button data-initiative="'+escape(e.id)+'">Transmettre mon initiative</button>':'')+
      '<button data-decline="'+escape(e.id)+'">Traité à la table · sans application</button></article>').join('')}
    <button data-end-request>Demander au MJ la fin du tour</button>
    <p class="muted">Aucun événement n’est renvoyé automatiquement après reconnexion. Une réception serveur ne vaut pas validation du MJ. Invitation conservée uniquement en mémoire ; recollez-la après fermeture.</p>
    ${(v.sent??[]).map(e=>'<p>'+escape(e.type)+' : '+escape(e.status)+'</p>').join('')}</details>`;
    root.querySelector('input').value=oldInput;
  }
  const client=createConnect({store,onChange:render});render(client.status());
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
        const value=prompt('Résultat du d20 d’initiative (bonus +4 ajouté)',String(1+Math.floor(Math.random()*20)));
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
  document.addEventListener('click',e=>{if(e.target.closest('[data-network-link]'))root.querySelector('details').open=true;});
  return client;
}
