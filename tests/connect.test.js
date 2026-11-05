import test from 'node:test';
import assert from 'node:assert/strict';
import {createStore,KEY} from '../src/kobe/storage.js';
import {initialState} from '../src/kobe/model.js';
import {transition} from '../src/kobe/engine.js';
import {createConnect,parseInvite,tacticalState,publicGroup,operationId,correction} from '../src/kobe/connect.js';

function setup(storage=new Map()){
  const local={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
  const store=createStore({storage:local,locks:{request:async(k,o,fn)=>fn()}});
  const sockets=[],scheduled=[];let id=0;
  class WS{
    readyState=1;messages=[];
    constructor(){sockets.push(this);}
    send(raw){this.messages.push(JSON.parse(raw));}
    close(){this.readyState=3;}
  }
  const client=createConnect({store,WebSocketImpl:WS,uuid:()=> 'id-'+(++id),schedule:fn=>{scheduled.push(fn);return 1;},cancel:()=>{}});
  const receive=async(m)=>{sockets.at(-1).onmessage({data:JSON.stringify({v:1,...m})});await client.settled();};
  const join=async()=>{client.connect('RPGCONNECT|wss://example.org|ROOM01|kobe|test');sockets.at(-1).onopen();await receive({type:'welcome',protocolVersion:1,capabilities:['table-free-v5'],payload:{sessionMode:'table-free'}});};
  const command=(event)=>receive({type:'command',room:'ROOM01',characterId:'kobe',event:{characterId:'kobe',...event}});
  return {store,client,sockets,scheduled,receive,join,command,storage};
}
const hp=(id='hp-1',value=50)=>({id,characterId:'kobe',type:'hp:set',payload:{manualTable:true,expectedValue:83,value}});
test('invitation validation rejects other characters, credentials and insecure endpoints',()=>{
  assert.equal(parseInvite('RPGCONNECT|wss://example.org|ROOM01|kobe|t').room,'ROOM01');
  for(const invite of ['RPGCONNECT|wss://example.org|ROOM01|samoth|t','RPGCONNECT|http://example.org|ROOM01|kobe|t','RPGCONNECT|wss://u:p@example.org|ROOM01|kobe|t'])
    assert.throws(()=>parseInvite(invite));
});
test('public state excludes notes, slots, charges, journal and spell names',()=>{
  const s=initialState();s.notes='private';s.concentration={name:'secret'};
  assert.deepEqual(Object.keys(tacticalState(s,'x')).sort(),['characterId','characterName','portrait','stateEpoch','stateRevision','hp','ac','statuses','concentration','turn'].sort());
  assert.equal(JSON.stringify(tacticalState(s,'x')).includes('private'),false);
  assert.equal(tacticalState(s,'x').concentration,true);
  assert.equal(publicGroup([{id:'e',name:'enemy',kind:'enemy',health:{current:123}}])[0].health,undefined);
});
test('snapshot updates group only; stale revisions and retired epochs rejected',async()=>{
  const t=setup();await t.join();
  const sync=(id,epoch,rev,name)=>t.command({id,type:'state:sync',payload:{syncEpoch:epoch,groupRevision:rev,conditionActors:[{id:'a',name,kind:'ally',health:{current:1,max:10,temp:0}}],hp:{current:1}}});
  await sync('s1','a',2,'first');await sync('s2','a',1,'stale');
  assert.equal(t.client.status().group[0].name,'first');assert.equal(t.store.getState().hp.current,83);
  await sync('s3','b',1,'new');await sync('s4','a',3,'retired');
  assert.equal(t.client.status().group[0].name,'new');
});
test('correction requires explicit review; replay across reload and undo never reapplies',async()=>{
  const t=setup();await t.join();await t.command(hp());
  assert.equal(t.store.getState().hp.current,83);assert.equal(t.client.status().pending.length,1);
  await t.command(hp());assert.equal(t.client.status().pending.length,1);
  assert.equal((await t.client.review('hp-1',true)).ok,true);
  const applied=t.store.getState();assert.equal(applied.hp.current,50);
  const operation=await operationId('wss://example.org/|ROOM01',hp());
  assert.equal((await t.store.dispatch({id:'undo',actorId:'kobe',origin:'player',expectedRevision:applied.revision,type:'undo',payload:{commandId:operation}})).ok,true);
  assert.equal(t.store.getState().hp.current,83);
  const restored=setup(t.storage);await restored.store.load();await restored.join();await restored.command(hp());
  assert.equal(restored.client.status().pending.length,0);assert.equal(restored.store.getState().hp.current,83);
});
test('same id different payload rejected after durable decision',async()=>{
  const t=setup();await t.join();await t.command(hp());await t.client.review('hp-1',true);
  await t.command(hp('hp-1',20));
  assert.equal(t.store.getState().hp.current,50);
  assert.equal(t.sockets.at(-1).messages.at(-1).result,'conflict: reused id');
});
test('local state change during review requires reread and expected value conflict is explicit',async()=>{
  const t=setup();await t.join();await t.command(hp());
  await t.store.dispatch({id:'damage',actorId:'kobe',origin:'player',expectedRevision:0,type:'damage',payload:{amount:10}});
  assert.equal((await t.client.review('hp-1',true)).ok,false);
  assert.equal((await t.client.review('hp-1',true)).ok,false);
  assert.equal(t.store.getState().hp.current,73);
  assert.equal((await t.client.review('hp-1',false)).ok,true);
});
test('loss, local healing, reconnect: only latest tactical snapshot, no effect replay',async()=>{
  const t=setup();await t.join();
  t.sockets[0].onclose({code:1006});assert.equal(t.client.status().stale,true);
  await t.store.dispatch({id:'damage',actorId:'kobe',origin:'player',expectedRevision:0,type:'damage',payload:{amount:20}});
  await t.store.dispatch({id:'heal',actorId:'kobe',origin:'player',expectedRevision:1,type:'heal',payload:{amount:5}});
  t.scheduled[0]();t.sockets.at(-1).onopen();
  await t.receive({type:'welcome',protocolVersion:1,capabilities:['table-free-v5'],payload:{sessionMode:'table-free'}});
  assert.equal(t.sockets.at(-1).messages.filter(m=>m.type==='event').length,0);
  assert.equal(t.sockets.at(-1).messages.find(m=>m.type==='state').state.hp.current,68);
});
test('guided room and displaced socket stop reconnect; local stays playable',async()=>{
  const t=setup();await t.join();t.sockets[0].onclose({code:4001});
  assert.equal(t.scheduled.length,0);assert.equal(t.client.status().connected,false);
  await t.join();await t.receive({type:'session-mode',payload:{mode:'guided'}});
  assert.equal(t.client.status().connected,false);
  assert.equal((await t.store.dispatch({id:'d',actorId:'kobe',origin:'player',expectedRevision:0,type:'damage',payload:{amount:1}})).ok,true);
});
test('only initiative and turn end can be emitted, repeated intent not resent',async()=>{
  const t=setup();await t.join();await t.receive({type:'table-presence',payload:{gmOnline:true}});
  assert.equal(t.client.sendEvent('hp:heal',{amount:10}),false);
  assert.equal(t.client.sendEvent('initiative:rolled',{requestId:'r1',total:17}),true);
  assert.equal(t.client.sendEvent('initiative:rolled',{requestId:'r1',total:17}),false);
  assert.equal(t.client.sendEvent('turn:end-request',{turn:1}),true);
});
test('remote HP correction validated again inside engine; zero HP ends concentration',()=>{
  const s=initialState();s.concentration={id:'c',name:'test'};
  const e=hp('x',0),c={id:'net-x',actorId:'kobe',origin:'gm',expectedRevision:0,type:'network-review',payload:{remoteEvent:e,decision:'accepted',...correction(e,s)}};
  const r=transition(s,c);assert.equal(r.ok,true);assert.equal(r.state.concentration,null);
  c.payload.value=99;assert.equal(transition(s,c).ok,false);
});
test('temp HP correction is exact, not additive; rejected command leaves state unchanged',async()=>{
  const t=setup();await t.join();await t.command({id:'tmp',type:'tempHp:set',payload:{manualTable:true,expectedValue:0,value:11}});
  assert.equal((await t.client.review('tmp',true)).ok,true);assert.equal(t.store.getState().hp.temp,11);
  await t.command({id:'states',type:'conditions:set',payload:{manualTable:true,conditions:['stunned']}});
  assert.equal((await t.client.review('states',true)).ok,false);
  assert.equal((await t.client.review('states',false)).ok,true);assert.deepEqual(t.store.getState().combat.conditions,[]);
});
test('write failure emits no acknowledgement or new snapshot; retry remains possible',async()=>{
  const t=setup();await t.join();await t.command(hp());
  const set=t.storage.set.bind(t.storage);t.storage.set=()=>{throw Error('quota');};
  const count=t.sockets.at(-1).messages.length;
  assert.equal((await t.client.review('hp-1',true)).ok,false);
  assert.equal(t.sockets.at(-1).messages.length,count);assert.equal(t.store.getState().hp.current,83);
  t.storage.set=set;assert.equal((await t.client.review('hp-1',true)).ok,true);
});

test('known manual conditions replace explicitly; incapacitation ends concentration, replay has no side effect',async()=>{
 const t=setup();await t.join();
 await t.store.dispatch({id:'conc',actorId:'kobe',origin:'player',expectedRevision:0,type:'concentration',payload:{name:'Cercle'}});
 const event={id:'states',type:'conditions:set',payload:{manualTable:true,expectedStatuses:[],conditions:[{name:'Étourdi',durationType:'indefinite'}]}};
 await t.command(event);
 assert.deepEqual(t.store.getState().combat.conditions,[]);
 assert.equal((await t.client.review('states',true)).ok,true);
 assert.deepEqual(t.store.getState().combat.conditions,['stunned']);assert.equal(t.store.getState().concentration,null);
 const revision=t.store.getState().revision;await t.command(event);assert.equal(t.store.getState().revision,revision);
});
test('a private physical roll writes the local result without sending a frame',async()=>{
 const t=setup();await t.join();
 const sent=t.sockets[0].messages.length;
 const r=await t.store.dispatch({id:'private-persuasion',actorId:'kobe',origin:'player',expectedRevision:0,
  type:'private-roll',payload:{name:'Persuasion',mode:'adv',dice:[4,17]}});
 assert.equal(r.ok,true);
 assert.match(r.events[0].label,/30$/);
 assert.equal(t.sockets[0].messages.length,sent);
});
