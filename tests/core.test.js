import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState, envelope, decode} from '../src/kobe/model.js';
import {transition} from '../src/kobe/engine.js';
import {createStore, KEY, BACKUP} from '../src/kobe/storage.js';
let seq=0;
const cmd=(s,type,payload={},id=`cmd-${++seq}`)=>({id,actorId:'kobe',origin:'player',expectedRevision:s.revision,type,payload});
function fixture() {
 const data=new Map(); let queue=Promise.resolve();
 const storage={getItem:k=>data.get(k)??null,setItem(k,v){data.set(k,v);}};
 const locks={request(k,o,fn){const result=queue.then(fn);queue=result.catch(()=>{});return result;}};
 const store=()=>createStore({storage,locks,time:()=> '2026-11-04'});
 return {storage,locks,store,data};
}
test('damage absorbs temporary HP; healing clamps and temp never stacks',()=>{
 let s=initialState(); s.hp.temp=7;
 s=transition(s,cmd(s,'damage',{amount:10})).state;
 assert.equal(s.hp.current,80);assert.equal(s.hp.temp,0);
 s=transition(s,cmd(s,'heal',{amount:100})).state;assert.equal(s.hp.current,83);
 s=transition(s,cmd(s,'set-temp-hp',{amount:11})).state;
 s=transition(s,cmd(s,'set-temp-hp',{amount:5})).state;assert.equal(s.hp.temp,11);
});
test('last resource atomic; duplicate replay and divergent payload',()=>{
 let s=initialState(); s.resources.charges=1;
 const c=cmd(s,'spend',{economy:'actionAvailable',resource:'charges',amount:1});
 const r=transition(s,c);assert.equal(r.state.resources.charges,0);
 assert.equal(transition(r.state,c).replay,true);
 assert.equal(transition(r.state,{...c,payload:{...c.payload,amount:2}}).code,'DUPLICATE_CONFLICT');
 const next=transition(r.state,cmd(r.state,'turn-start',{turn:1,epoch:'local',combatId:'local'})).state;
 const denied=transition(next,cmd(next,'spend',c.payload));assert.equal(denied.code,'RESOURCE_EMPTY');assert.equal(denied.state.economy.actionAvailable,true);
});
test('stale and invalid commands do not mutate state',()=>{
 const s=initialState(),raw=JSON.stringify(s);
 for(const amount of [-1,NaN,Infinity,1.5,'5']) assert.equal(transition(s,cmd(s,'damage',{amount})).ok,false);
 assert.equal(transition(s,{...cmd(s,'damage',{amount:1}),expectedRevision:9}).code,'STALE_REVISION');
 assert.equal(JSON.stringify(s),raw);
});
test('turn replay cannot restore reaction; alternate ID same turn rejected',()=>{
 let s=initialState();const c=cmd(s,'turn-start',{turn:1,epoch:'local',combatId:'local'});
 s=transition(s,c).state;s=transition(s,cmd(s,'spend',{economy:'reactionAvailable'})).state;
 assert.equal(transition(s,c).state.economy.reactionAvailable,false);
 assert.equal(transition(s,cmd(s,'turn-start',c.payload)).ok,false);
});
test('undo compensates but keeps receipts across reload',()=>{
 let s=initialState(); const c=cmd(s,'damage',{amount:20}); s=transition(s,c).state;
 s=transition(s,cmd(s,'undo',{commandId:c.id})).state;assert.equal(s.hp.current,83);
 s=decode(JSON.stringify(envelope(s))).state;assert.equal(transition(s,c).replay,true);assert.equal(s.undo,null);
});
test('save reload and quota failure keep committed state; no notification on failure',async()=>{
 const f=fixture(),a=f.store();await a.load();let notices=0;a.subscribe(()=>notices++);
 assert.equal((await a.dispatch(cmd(a.getState(),'damage',{amount:10}))).ok,true);
 const b=f.store();await b.load();assert.equal(b.getState().hp.current,73);
 f.storage.setItem=()=>{throw new Error('Quota');};const before=notices;
 assert.equal((await a.dispatch(cmd(a.getState(),'damage',{amount:10}))).code,'STORAGE_FAILED');
 assert.equal(a.getState().hp.current,73);assert.equal(notices,before);
});
test('two stores competing for last resource have only one success',async()=>{
 const f=fixture(),s=initialState();s.resources.charges=1;f.storage.setItem(KEY,JSON.stringify(envelope(s)));
 const a=f.store(),b=f.store();await Promise.all([a.load(),b.load()]);
 const p={economy:'actionAvailable',resource:'charges',amount:1};
 const results=await Promise.all([a.dispatch(cmd(a.getState(),'spend',p)),b.dispatch(cmd(b.getState(),'spend',p))]);
 assert.equal(results.filter(x=>x.ok).length,1);assert.equal(results.find(x=>!x.ok).code,'STALE_REVISION');
});
test('no Web Locks is explicitly read only',async()=>{
 const f=fixture(),a=createStore({storage:f.storage});await a.load();
 assert.equal((await a.dispatch(cmd(a.getState(),'damage',{amount:1}))).code,'READ_ONLY');assert.equal(f.data.size,0);
});
test('migration saves original before conversion; unknown schema stays intact',async()=>{
 const f=fixture(),s=initialState();s.schemaVersion=0;delete s.notes;delete s.undo;
 const raw=JSON.stringify({format:'kobe-companion',schemaVersion:0,state:s});f.storage.setItem(KEY,raw);
 const a=f.store();assert.equal((await a.load()).ok,true);assert.equal(f.storage.getItem(BACKUP),raw);assert.equal(a.getState().schemaVersion,1);
 const unknown='{"format":"kobe-companion","schemaVersion":99}';f.storage.setItem(KEY,unknown);
 assert.equal((await a.load()).ok,false);assert.equal(f.storage.getItem(KEY),unknown);
});
test('backup failure stops migration',async()=>{
 const f=fixture(),s=initialState();s.schemaVersion=0;const raw=JSON.stringify({format:'kobe-companion',schemaVersion:0,state:s});f.storage.setItem(KEY,raw);
 const put=f.storage.setItem;f.storage.setItem=(k,v)=>{if(k===BACKUP)throw new Error('quota');put(k,v);};
 assert.equal((await f.store().load()).ok,false);assert.equal(f.storage.getItem(KEY),raw);
});
test('import validates, previews, preserves receipts and rejects stale preview',async()=>{
 const f=fixture(),a=f.store();await a.load();const old=a.export();const c=cmd(a.getState(),'damage',{amount:10});await a.dispatch(c);
 const preview=a.preview(old);assert.equal(a.getState().hp.current,73);assert.equal((await a.import(preview)).ok,true);
 assert.equal(a.getState().hp.current,83);assert.equal((await a.dispatch(c)).replay,true);
 assert.throws(()=>a.preview('{"format":"bad"}'));
 const stale=a.preview(old);await a.dispatch(cmd(a.getState(),'damage',{amount:1}));assert.equal((await a.import(stale)).code,'STALE_REVISION');
});
test('corrupt original is retained and can be backed up during explicit recovery',async()=>{
 const f=fixture();f.storage.setItem(KEY,'broken');const a=f.store();assert.equal((await a.load()).ok,false);
 assert.equal((await a.dispatch(cmd(a.getState(),'damage',{amount:1}))).ok,false);
 assert.equal((await a.import(a.preview(JSON.stringify(envelope(initialState()))))).ok,true);assert.equal(f.storage.getItem(BACKUP),'broken');
});
