import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,decode,envelope} from '../src/kobe/model.js';
import {transition} from '../src/kobe/engine.js';
import {dragonStage,kharvekAvailability} from '../src/kobe/kharvek.js';
let n=0;const command=(s,type,payload={})=>({id:'kv-'+(++n),actorId:'kobe',origin:'player',expectedRevision:s.revision,type,payload});
function run(s,type,payload){const r=transition(s,command(s,type,payload));assert.equal(r.ok,true,r.message);return r.state;}
const payload=(power='pulse',targetIds=['kobe'])=>({power,targetIds,drumReady:true,healingEligible:true,healRolls:power==='pulse'?[4,5,6]:[4,5]});
function setup(){let s=initialState();s.resources.charges=6;s.hp.current=40;s.hp.temp=20;for(const id of ['a','b','c']){s=run(s,'target-save',{id,name:id,side:'ally',temp:0,reaction:true});s=run(s,'target-hp',{targetId:id,max:50,current:id==='b'?49:0,temp:0,confirmed:true});}return s;}
const mantle={targetIds:['a','b'],eligible:true,choices:{a:{temp:'replace',move:false},b:{temp:'keep',move:false}},survivorTargetId:'a',healRolls:[8],healingEligible:true,drumReady:true};
test('0–6 charge stages are exactly derived, no extra persistent visual state',()=>{assert.deepEqual(Array.from({length:7},(_,i)=>dragonStage(i)),['dormant','dormant','awakening','awakening','coiling','coiling','complete']);assert.throws(()=>dragonStage(7));});
test('Pulse consumes one action/charge, heals capped HP, temp and concentration unchanged',()=>{let s=setup();s.hp.current=80;s.concentration={id:'circle',name:'Cercle'};s=run(s,'kharvek-power',payload());assert.equal(s.hp.current,83);assert.equal(s.hp.temp,20);assert.equal(s.resources.charges,5);assert.equal(s.economy.actionAvailable,false);assert.equal(s.economy.bonusAvailable,true);assert.equal(s.concentration.name,'Cercle');assert.deepEqual(s.journal.at(-1).rolls,[4,5,6]);assert.equal(s.journal.at(-1).costs.charges,1);});
test('Rally shares exactly one roll across three targets and logs actual capped changes',()=>{let s=run(setup(),'kharvek-power',payload('rally',['a','b','c']));assert.equal(s.resources.charges,3);assert.deepEqual(s.combat.targets.map(t=>t.hp.current),[14,50,14]);assert.deepEqual(s.journal.at(-1).rolls,[4,5]);assert.match(s.journal.at(-1).label,/jet partagé/);assert.match(s.journal.at(-1).label,/b : \+1 PV/);});
test('Survivors shares a single Manteau transaction and costs exactly one bonus, Inspiration, charge',()=>{let s=run(setup(),'mantle',mantle);assert.equal(s.resources.inspiration,4);assert.equal(s.resources.charges,5);assert.equal(s.economy.bonusAvailable,false);assert.equal(s.economy.actionAvailable,true);assert.equal(s.combat.targets[0].hp.current,13);assert.equal(s.combat.targets[0].hp.temp,11);assert.equal(s.combat.targets[1].hp.current,49);assert.equal(s.combat.targets[1].temp,0);assert.equal(s.journal.at(-1).costs.charges,1);assert.equal(s.journal.at(-1).costs.inspiration,1);assert.equal(s.journal.at(-1).costs.bonusAvailable,1);});
test('Normal Manteau without upgrade remains possible with zero charges or Silence',()=>{let s=setup();s.resources.charges=0;s.combat.conditions=['silenced'];const p={...mantle};delete p.survivorTargetId;s=run(s,'mantle',p);assert.equal(s.resources.inspiration,4);assert.equal(s.resources.charges,0);});
for(const [name,mutate,p] of [
 ['insufficient charges',s=>s.resources.charges=0,payload()],
 ['insufficient rally charges',s=>s.resources.charges=2,payload('rally',['a'])],
 ['action used',s=>s.economy.actionAvailable=false,payload()],
 ['Silence',s=>s.combat.conditions=['silenced'],payload()],
 ['incapacitated',s=>s.hp.current=0,payload()],
 ['ended turn',s=>s.combat.phase='ended',payload()],
 ['unconfirmed target eligibility',()=>{},{...payload(),healingEligible:false}],
 ['no free hand/drum',()=>{},{...payload(),drumReady:false}],
 ['duplicate targets',()=>{},payload('rally',['a','a'])],
 ['too many rally targets',()=>{},payload('rally',['a','b','c','kobe'])],
 ['wrong dice',()=>{},{...payload(),healRolls:[9,1,1]}],
 ['survivors standalone',()=>{},{...payload(),power:'survivors'}],
])test(`Refusal atomic: ${name}`,()=>{const s=setup();mutate(s);const r=transition(s,command(s,'kharvek-power',p));assert.equal(r.ok,false);assert.deepEqual(r.state,s);assert.deepEqual(r.events,undefined);});
for(const [name,mutate,p] of [
 ['no charge',s=>s.resources.charges=0,mantle],
 ['no Inspiration',s=>s.resources.inspiration=0,mantle],
 ['bonus used',s=>s.economy.bonusAvailable=false,mantle],
 ['not a beneficiary',()=>{},{...mantle,survivorTargetId:'c'}],
 ['Silence',s=>s.combat.conditions=['silenced'],mantle],
 ['eligibility',()=>{},{...mantle,healingEligible:false}],
])test(`Manteau upgrade rollback including temp/movement/costs: ${name}`,()=>{const s=setup();mutate(s);const r=transition(s,command(s,'mantle',p));assert.equal(r.ok,false);assert.deepEqual(r.state,s);});
test('Dawn distinct from short/long rest, confirmed, reversible and replay safe',()=>{let s=setup();s.resources.charges=0;s=run(s,'rest',{kind:'long',confirmed:true,longEligible:true});assert.equal(s.resources.charges,0);assert.equal(transition(s,command(s,'kharvek-dawn',{})).ok,false);const c=command(s,'kharvek-dawn',{confirmed:true});s=transition(s,c).state;assert.equal(s.resources.charges,6);assert.equal(transition(s,c).replay,true);s=run(s,'undo',{commandId:c.id});assert.equal(s.resources.charges,0);});
test('Replay/reload/undo never repeats healing or spending; stale and new-double commands rejected',()=>{const start=setup(),c=command(start,'kharvek-power',payload()),r=transition(start,c);assert.equal(r.ok,true);let s=decode(JSON.stringify(envelope(r.state))).state;assert.deepEqual(transition(s,c).state,s);assert.equal(transition(s,c).replay,true);assert.equal(transition(s,{...c,id:'other'}).ok,false);assert.equal(transition(s,command(s,'kharvek-power',payload())).ok,false);s=run(s,'undo',{commandId:c.id});assert.equal(s.hp.current,40);assert.equal(s.resources.charges,6);assert.equal(s.economy.actionAvailable,true);assert.equal(transition(s,c).replay,true);});
test('Unconscious external targets can heal; unknown HP explicitly announce instead of inventing HP',()=>{let s=setup();s.combat.targets[0].hp.current=0;delete s.combat.targets[2].hp;s=run(s,'kharvek-power',payload('rally',['a','c']));assert.equal(s.combat.targets[0].hp.current,14);assert.equal(s.combat.targets[2].hp,undefined);assert.match(s.journal.at(-1).label,/PV inconnus/);});
test('Availability explains depletion, action, silence, and no Inspiration for contextual upgrade',()=>{let s=setup();assert.equal(kharvekAvailability(s,'pulse').ok,true);s.resources.charges=2;assert.equal(kharvekAvailability(s,'rally').ok,false);s.resources.inspiration=0;assert.equal(kharvekAvailability(s,'survivors').ok,false);});
test('Survivors undo restores the whole Manteau including temp/reaction/HP/resources, receipts stay',()=>{const start=setup(),p=structuredClone(mantle);p.choices.a={temp:'replace',move:true,confirmed:true};const c=command(start,'mantle',p);let s=transition(start,c).state;assert.equal(s.combat.targets[0].reaction,false);s=run(s,'undo',{commandId:c.id});assert.deepEqual(s.hp,start.hp);assert.deepEqual(s.combat.targets,start.combat.targets);assert.deepEqual(s.resources,start.resources);assert.deepEqual(s.economy,start.economy);assert.equal(transition(s,c).replay,true);});
test('A failed Khar-Vek save commits neither healing nor spending; retry and session restart are exact',async()=>{const {createStore,KEY}=await import('../src/kobe/storage.js');const start=setup(),data=new Map([[KEY,JSON.stringify(envelope(start))]]);let broken=true;const storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>{if(broken)throw Error('quota');data.set(k,v);}},locks={request:async(_k,_o,fn)=>fn()};const store=createStore({storage,locks});await store.load();const c=command(start,'kharvek-power',payload());assert.equal((await store.dispatch(c)).ok,false);assert.deepEqual(store.getState(),start);assert.deepEqual(JSON.parse(data.get(KEY)).state,start);broken=false;assert.equal((await store.dispatch(c)).ok,true);assert.equal(store.getState().hp.current,60);assert.equal(store.getState().resources.charges,5);const restored=createStore({storage,locks});await restored.load();assert.deepEqual(restored.getState(),store.getState());assert.equal((await restored.dispatch(c)).replay,true);assert.equal(restored.getState().hp.current,60);});
