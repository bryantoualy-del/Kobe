import {canonical} from './model.js';

// Protocol 1 / Table Libre V5. Guided-mode commands never reach the local engine.
export const CAPABILITIES = ['table-free-v5','hybrid-resolution-v4','event-receipts','initiative-ack','attack-id-ledger','authoritative-save-v1','state-revisions','condition-revisions'];
export function parseInvite(text) {
  const [prefix,endpoint,room,characterId,token,...extra]=String(text).trim().split('|');
  if(prefix!=='RPGCONNECT'||characterId!=='kobe'||!room||!token||extra.length)throw Error('Collez une invitation RPGCONNECT destinée à Kobe.');
  const url=new URL(endpoint);
  if(url.username||url.password||url.hash||url.search||!(url.protocol==='wss:'||(url.protocol==='ws:'&&['localhost','127.0.0.1','[::1]'].includes(url.hostname))))throw Error('Serveur wss:// requis.');
  return {endpoint:url.href,room,token};
}
export function tacticalState(s,epoch) {
  return {characterId:'kobe',characterName:s.profile.name,portrait:'',stateEpoch:epoch,stateRevision:s.revision,
    hp:{current:s.hp.current,max:s.hp.max,temp:s.hp.temp},ac:s.profile.ac,statuses:[...s.combat.conditions],
    concentration:!!s.concentration,turn:{reaction:s.economy.reactionAvailable}};
}
export function publicGroup(rows) {
  return (Array.isArray(rows)?rows:[]).slice(0,100).map(r=>{
    const row={id:String(r.id??''),name:String(r.name??'').slice(0,100),kind:r.kind,activeTurn:r.activeTurn===true,
      conditions:(Array.isArray(r.conditions)?r.conditions:[]).map(c=>String(c?.name??c).slice(0,80))};
    if(Number.isFinite(r.initiative))row.initiative=r.initiative;
    if(['player','ally'].includes(r.kind)){
      if(Number.isFinite(r.ac))row.ac=r.ac;
      if(typeof r.concentration==='boolean')row.concentration=r.concentration;
      if(typeof r.reaction==='boolean')row.reaction=r.reaction;
    }
    // No enemy health is retained, even if a malformed upstream message includes it.
    if(['player','ally'].includes(r.kind)&&r.health)row.health={current:r.health.current,max:r.health.max,temp:r.health.temp};
    return row;
  });
}
export async function operationId(scope,event) {
  const bytes=new TextEncoder().encode(scope+'|'+event.id);
  const digest=await globalThis.crypto.subtle.digest('SHA-256',bytes);
  return 'net-'+Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
}
import {correction} from './table-correction.js';
export {correction};
export function createConnect({store,WebSocketImpl=globalThis.WebSocket,onChange=()=>{},onActivity=()=>{},uuid=()=>crypto.randomUUID(),schedule=setTimeout,cancel=clearTimeout,connectionStorage=null}) {
  let socket=null,invite=null,active=false,timer=null,attempt=0,generation=0,chain=Promise.resolve();
  let epoch=uuid(),lastRevision=-1,lastProjection='',groupEpoch=null,groupRevision=-1,sessionRevision=-1;
  const retired=new Set(),pending=new Map(),sent=new Map();
  let view={connected:false,status:'Local · RPG Connect déconnecté',group:[],stale:true,gmOnline:false,messages:[]};
  const publish=()=>onChange({...view,pending:[...pending.values()].map(x=>({event:x.event,revision:x.revision})),sent:[...sent.values()]});
  const note=text=>{view.status=String(text).slice(0,300);publish();};
  const send=message=>{if(socket?.readyState!==1)return false;try{socket.send(JSON.stringify({v:1,...message}));return true;}catch{return false;}};
  const ack=(id,result)=>send({type:'command-ack',id,result});
  const scope=()=>invite.endpoint+'|'+invite.room;
  function sync() {
    if(!view.connected)return;
    const state=store.getState();
    if(state.revision<lastRevision)epoch=uuid();
    lastRevision=state.revision;
    const value=tacticalState(state,epoch);
    // A private roll or a tab change advances the store without changing the public table.
    const {stateRevision,...publicFields}=value;
    const fingerprint=canonical(publicFields);
    if(fingerprint!==lastProjection&&send({type:'state',state:value}))lastProjection=fingerprint;
  }
  const unsubscribe=store.subscribe(sync);
  const connectionKey="kobe.rpg-connect.invitation.v1";
  function forget(){try{connectionStorage?.removeItem(connectionKey);}catch{}}
  function disconnect(clearSaved=true) {
    if(clearSaved)forget();
    active=false;generation++;cancel(timer);socket?.close();socket=null;
    pending.clear();view.connected=false;view.stale=true;view.gmOnline=false;
    note('Local · RPG Connect déconnecté');
  }
  async function receive(m,g) {
    if(g!==generation||m.v!==1)return;
    if(m.type==='welcome'){
      if(m.protocolVersion!==1||!m.capabilities?.includes('table-free-v5')||m.payload?.sessionMode!=='table-free'){
        disconnect();note('Serveur incompatible : une salle Table Libre V5 est requise. Le mode local reste disponible.');return;
      }
      view.connected=true;attempt=0;lastProjection='';sync();note('Connecté · groupe en attente de synchronisation');return;
    }
    if(m.type==='session-mode'&&m.payload?.mode!=='table-free'){disconnect();note('La salle a quitté Table Libre. Jeu local conservé.');return;}
    if(m.type==='error'){disconnect();note(m.message||'Connexion refusée');return;}
    if(!view.connected)return;
    if(['activity','activity-sync'].includes(m.type)){
      if(m.room&&m.room!==invite.room)return;
      const rows=m.type==='activity'?[m.payload]:(m.payload?.entries??[]);
      if(Array.isArray(rows))onActivity(scope(),rows.slice(-500).filter(row=>row&&typeof row==='object'));
      return;
    }
    if(m.type==='table-presence'){view.gmOnline=m.payload?.gmOnline===true;publish();return;}
    if(m.type==='ack'){const item=sent.get(m.id);if(item){item.status=m.result||'Reçu par le serveur (validation MJ distincte)';publish();}return;}
    if(m.type!=='command'||m.characterId!=='kobe'||m.room!==invite.room)return;
    const e=m.event;
    if(!e||typeof e.id!=='string'||e.id.length>120||e.characterId!=='kobe')return;
    const p=e.payload??{};
    if(['state:sync','targets:set','message:gm'].includes(e.type)){
      const nextEpoch=p.syncEpoch??p.session?.syncEpoch;
      if(nextEpoch!==undefined){
        if(retired.has(nextEpoch)){ack(e.id,'stale');return;}
        if(nextEpoch!==groupEpoch){
          if(groupEpoch!==null)retired.add(groupEpoch);
          groupEpoch=nextEpoch;groupRevision=-1;sessionRevision=-1;view.group=[];view.session=null;view.stale=true;
        }
        const gr=p.groupRevision??p.syncRevision,sr=p.session?.sessionRevision??p.syncRevision;
        if(Array.isArray(p.conditionActors)&&Number.isSafeInteger(gr)&&(gr>groupRevision||(gr===groupRevision&&view.stale))){
          groupRevision=gr;view.group=publicGroup(p.conditionActors);view.stale=false;
        }
        if(p.session&&Number.isSafeInteger(sr)&&sr>sessionRevision){
          sessionRevision=sr;view.session={activeName:p.session.activeName,activeCharacterId:p.session.activeCharacterId,round:p.session.round};
        }
      }
      if(p.text)view.status=String(p.text).slice(0,300);
      ack(e.id,'received-no-local-mutation');publish();return;
    }
    if(['hp:set','tempHp:set','conditions:set','initiative:request','initiative:retry','turn:grant','turn:close'].includes(e.type)){
      const id=await operationId(scope(),e);if(g!==generation)return;
      const old=store.getState().receipts[id];
      if(old){
        const prior=JSON.parse(old.fingerprint);
        ack(e.id,canonical(prior.payload.remoteEvent)===canonical(e)?'already-reviewed':'conflict: reused id');
        return;
      }
      const existing=pending.get(e.id);
      if(existing){if(canonical(existing.event)!==canonical(e))note('Conflit : identifiant MJ réutilisé avec un contenu différent.');return;}
      if(pending.size>=50){note('Trop de demandes MJ : traitez les demandes en attente.');return;}
      pending.set(e.id,{event:structuredClone(e),revision:store.getState().revision,id});
      publish();return; // No ACK until an explicit player decision has been persisted.
    }
    ack(e.id,'unsupported-local-only');
  }
  function open() {
    const g=++generation;
    view.connected=false;view.stale=true;pending.clear();lastProjection='';
    const ws=socket=new WebSocketImpl(invite.endpoint);
    ws.onopen=()=>{if(g===generation)send({type:'hello',protocolVersion:1,requiredCapabilities:['table-free-v5'],clientCapabilities:CAPABILITIES,role:'player',room:invite.room,characterId:'kobe',token:invite.token});};
    ws.onmessage=({data})=>{chain=chain.then(()=>receive(JSON.parse(data),g)).catch(()=>note('Message réseau invalide : état local conservé.'));};
    ws.onerror=()=>{if(g===generation)note('Connexion indisponible · jeu local disponible');};
    ws.onclose=event=>{
      if(g!==generation)return;
      generation++;view.connected=false;view.stale=true;view.gmOnline=false;pending.clear();
      // 4001 means another tab/device owns the connection. Do not fight it.
      if(event.code>=4000){forget();active=false;note('Connexion fermée · reconnectez explicitement après vérification de la salle.');return;}
      note('Connexion perdue · jeu local disponible, reconnexion en cours');
      if(active)timer=schedule(open,Math.min(30000,1000*2**Math.min(attempt++,5)));
    };
  }
  return {
    connect(text){const next=parseInvite(text);disconnect(false);invite=next;try{connectionStorage?.setItem(connectionKey,text);}catch{};onActivity(scope(),[]);epoch=uuid();groupEpoch=null;groupRevision=-1;sessionRevision=-1;retired.clear();view.group=[];view.session=null;sent.clear();active=true;open();note('Connexion…');},
    disconnect,sync,
    resume(){try{const text=connectionStorage?.getItem(connectionKey);if(text){this.connect(text);return true;}}catch{forget();}return false;},
    status:()=>structuredClone({...view,pending:[...pending.values()].map(x=>({event:x.event,revision:x.revision})),sent:[...sent.values()]}),
    async initiative(eventId,die){
      const item=pending.get(eventId),g=generation;
      if(!item||!['initiative:request','initiative:retry'].includes(item.event.type)||!view.connected||!view.gmOnline)return {ok:false,message:'Demande ou MJ indisponible.'};
      if(!Number.isInteger(die)||die<1||die>20)return {ok:false,message:'Un d20 de 1 à 20 est requis.'};
      const requestId=item.event.payload?.requestId;
      if(!requestId)return {ok:false,message:'Demande sans identifiant : annoncez le total oralement.'};
      const s=store.getState();
      const result=await store.dispatch({id:item.id,actorId:'kobe',origin:'player',expectedRevision:s.revision,type:'initiative-roll',payload:{die,remoteEvent:item.event}});
      if(!result.ok)return result;
      pending.delete(eventId);
      if(result.replay||g!==generation||!view.connected||!view.gmOnline)return {ok:true,message:'Total enregistré : '+(die+4)+'. Confirmez oralement avec le MJ ; aucun renvoi.'};
      const delivered=this.sendEvent('initiative:rolled',{requestId,dice:[die],chosen:die,bonus:4,total:die+4,mode:'manual'},'init-'+item.id);
      ack(eventId,delivered?'initiative-submitted':'manual-resolution');publish();
      return {ok:true,message:'Initiative '+(die+4)+(delivered?' envoyée · validation MJ attendue.':' enregistrée · annonce orale nécessaire.')};
    },
    async review(eventId,apply=false){
      const item=pending.get(eventId);if(!item||!view.connected)return {ok:false,message:'Demande absente ou connexion perdue.'};
      const g=generation,s=store.getState();
      if(s.revision!==item.revision){item.revision=s.revision;publish();return {ok:false,message:'État local modifié : relisez les valeurs puis confirmez à nouveau.'};}
      let payload={remoteEvent:item.event,decision:'declined'};
      try{if(apply)payload={...payload,...correction(item.event,s),decision:'accepted'};}catch(error){return {ok:false,message:error.message};}
      const result=await store.dispatch({id:item.id,actorId:'kobe',origin:'gm',type:'network-review',expectedRevision:s.revision,payload});
      if(result.ok){pending.delete(eventId);if(g===generation)ack(eventId,apply?'applied-by-player':'declined-manual-resolution');publish();}
      return result;
    },
    sendEvent(type,payload,operation){
      if(!['initiative:rolled','turn:end-request'].includes(type)||!view.connected||!view.gmOnline)return false;
      const allowed=type==='initiative:rolled'?['requestId','dice','chosen','bonus','total','mode']:['turn','actionId'];
      payload=Object.fromEntries(allowed.filter(k=>Object.hasOwn(payload,k)).map(k=>[k,payload[k]]));
      const signature=canonical({type,payload});
      if([...sent.values()].some(e=>e.signature===signature))return false;
      const id=operation||(type==='turn:end-request'&&payload.actionId?'end-'+payload.actionId:uuid());
      const event={id,characterId:'kobe',type,payload,timestamp:new Date().toISOString()};
      // No outbox, no replay after reconnect. Uncertain deliveries remain visible.
      if(!send({type:'event',event}))return false;
      sent.set(event.id,{id:event.id,type,signature,status:'Envoyé · réception non confirmée'});
      if(sent.size>30)sent.delete(sent.keys().next().value);
      publish();return true;
    },
    settled:()=>chain,
    dispose(){disconnect(false);unsubscribe();}
  };
}
