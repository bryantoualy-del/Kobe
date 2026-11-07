import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,decode,envelope} from '../src/kobe/model.js';
import {transition} from '../src/kobe/engine.js';
let n=0;
const command=(s,type,payload={})=>({id:'test-'+(++n),actorId:'kobe',origin:'player',expectedRevision:s.revision,type,payload});
function run(s,type,p={}){const r=transition(s,command(s,type,p));assert.equal(r.ok,true,r.message);return r.state;}
const next=s=>run(s,'turn-start',{turn:s.turn.startRevision+1,epoch:'local',combatId:'local'});
function setup(){let s=initialState();for(let i=1;i<=6;i++)s=run(s,'target-save',{id:'a'+i,name:'Allié '+i,side:'ally',temp:i===1?20:0,reaction:i!==5});return run(s,'target-save',{id:'enemy',name:'Ennemi',side:'enemy'});}
const one={targetIds:['a1'],eligible:true,noExistingDie:true};
const enemy={targetIds:['enemy'],eligible:true};
const maj={...enemy,word:'Halte',commandEligible:true};
test('Inspiration spends once on grant, d10 consumes only assigned die',()=>{let s=run(setup(),'inspiration',one);assert.equal(s.resources.inspiration,4);assert.equal(s.effects[0].die,10);const id=s.effects[0].id;s=run(s,'inspiration-use',{effectId:id,roll:8,check:'save'});assert.equal(s.resources.inspiration,4);assert.equal(s.effects.length,0);assert.equal(s.journal.at(-1).rolls[0],8);});
test('Inspiration duplicate holder and missing eligibility fail atomically; expires in 10 min',()=>{let s=run(setup(),'inspiration',one);s=next(s);assert.equal(transition(s,command(s,'inspiration',one)).ok,false);s=run(s,'time',{seconds:594,confirmed:true});assert.equal(s.effects.length,0);const r=transition(s,command(s,'inspiration',{...one,eligible:false}));assert.equal(r.ok,false);assert.deepEqual(r.state,s);});
test('Manteau five targets: 11 temp, no stacking, voluntary reactions',()=>{let s=setup();const ids=['a1','a2','a3','a4','a5'];const choices=Object.fromEntries(ids.map((id,i)=>[id,{temp:i===0?'keep':'replace',move:i===1,confirmed:i===1}]));s=run(s,'mantle',{targetIds:ids,eligible:true,choices});assert.equal(s.resources.inspiration,4);assert.equal(s.economy.bonusAvailable,false);assert.deepEqual(s.combat.targets.slice(0,5).map(t=>t.temp),[20,11,11,11,11]);assert.equal(s.combat.targets[1].reaction,false);assert.equal(s.combat.targets[2].reaction,true);assert.equal(s.journal.at(-1).targetIds.length,5);assert.equal(s.journal.at(-1).costs.inspiration,1);});
test('Manteau rejects 6 targets or unavailable reaction and leaves resources unchanged',()=>{const s=setup();for(const ids of [['a1','a2','a3','a4','a5','a6'],['a5']]){const r=transition(s,command(s,'mantle',{targetIds:ids,eligible:true,choices:Object.fromEntries(ids.map(id=>[id,{temp:'replace',move:true,confirmed:true}]))}));assert.equal(r.ok,false);assert.deepEqual(r.state,s);}});
test('Majesty activation costs no slot, next bonus command, expiry after ten rounds',()=>{let s=run(setup(),'majesty',maj);assert.equal(s.resources.majesty,0);assert.equal(s.slots[1],4);assert.equal(s.concentration.name,'Manteau de majesté');s=next(s);s=run(s,'majesty-command',maj);for(let i=1;i<10;i++)s=next(s);assert.equal(s.concentration,null);assert.equal(s.effects.filter(e=>e.kind==='majesty').length,0);assert.equal(transition(s,command(s,'majesty-command',maj)).ok,false);});
test('Concentration replacement requires explicit confirmation and ends linked effect',()=>{let s=run(setup(),'concentration',{name:'Cercle de pouvoir'});assert.equal(transition(s,command(s,'majesty',maj)).ok,false);s=run(s,'majesty',{...maj,replaceConcentration:true});assert.equal(s.concentration.name,'Manteau de majesté');s=run(s,'condition',{name:'stunned',enabled:true});assert.equal(s.concentration,null);assert.equal(s.effects.length,0);});
test('Damage with temp HP requires concentration CON check; no assumed resistance',()=>{let s=run(setup(),'majesty',maj);s=run(s,'set-temp-hp',{amount:50});s=run(s,'damage',{amount:30});assert.equal(s.hp.current,83);const r=s.pendingResolutions.find(x=>x.kind==='concentration');assert.equal(r.dc,15);s=run(s,'resolve',{id:r.id,success:false});assert.equal(s.concentration,null);});
test('Cri lasts through end of turn, expires at next start, uses one of four',()=>{let s=run(setup(),'cry',enemy);assert.equal(s.resources.cry,3);s=run(s,'turn-end');assert.equal(s.effects.length,1);s=next(s);assert.equal(s.effects.length,0);});
test('Fire bolt action 2d10 fire: no inferred hit, manual result, no slot',()=>{let s=run(setup(),'fire-bolt',{...enemy,handFree:true});const r=s.pendingResolutions[0];assert.equal(r.dice,2);assert.equal(s.economy.actionAvailable,false);assert.equal(s.slots[1],4);s=run(s,'resolve',{id:r.id,result:'hit',damage:12});assert.equal(s.pendingResolutions.length,0);assert.equal(s.journal.at(-1).rolls[0],12);assert.equal(s.hp.current,83);});
test('Fire bolt allowed with Majesty bonus spell; silenced casting denied',()=>{let s=run(setup(),'majesty',maj);s=run(s,'fire-bolt',{...enemy,handFree:true});s=next(s);s=run(s,'condition',{name:'silenced',enabled:true});assert.equal(transition(s,command(s,'fire-bolt',{...enemy,handFree:true})).ok,false);});
test('Short rest spends physical hit dice, song requires dice; long restores five dice, not charges',()=>{let s=setup();s.hp.current=40;s.resources.inspiration=0;s.resources.cry=0;s.resources.majesty=0;s.resources.charges=2;s.combat.hitDice=4;s.combat.performance=0;s=run(s,'rest',{kind:'short',confirmed:true,dice:[4,5],song:3,songEligible:true});assert.equal(s.hp.current,58);assert.equal(s.combat.hitDice,2);assert.equal(s.resources.inspiration,5);assert.equal(s.resources.cry,0);assert.equal(s.resources.majesty,0);assert.equal(s.combat.performance,1);s=run(s,'rest',{kind:'long',confirmed:true,longEligible:true});assert.equal(s.hp.current,83);assert.equal(s.combat.hitDice,7);assert.equal(s.resources.cry,4);assert.equal(s.resources.majesty,1);assert.equal(s.resources.charges,2);});
test('Double activation and undo retain durable tombstone, exact one event',()=>{const s=setup(),c=command(s,'majesty',maj);const a=transition(s,c);assert.equal(a.ok,true);const r=transition(a.state,c);assert.equal(r.replay,true);assert.equal(r.events.length,0);let u=run(a.state,'undo',{commandId:c.id});assert.equal(u.resources.majesty,1);assert.equal(u.concentration,null);u=decode(JSON.stringify(envelope(u))).state;assert.equal(transition(u,c).replay,true);assert.equal(u.journal.filter(e=>e.commandId===c.id).length,1);});
test('Mid combat reload retains targets, pending rolls, timers, concentration and action',()=>{let s=run(setup(),'majesty',maj);s=run(s,'damage',{amount:5});assert.deepEqual(decode(JSON.stringify(envelope(s))).state,s);});
test('Manual economy/resource correction is auditable and reversible',()=>{let s=run(setup(),'cry',enemy);s=run(s,'combat-correct',{field:'bonusAvailable',value:true,reason:'Refus MJ'});assert.equal(s.economy.bonusAvailable,true);assert.match(s.journal.at(-1).label,/Refus MJ/);s=run(s,'correct',{field:'cry',value:4,reason:'Refus MJ'});assert.equal(s.resources.cry,4);});
test('Performance awaits independent saves; charm tracked and can end on hostility',()=>{let s=run(setup(),'performance',{targetIds:['a1','a2'],eligible:true,minuteComplete:true,humanoids:true});assert.equal(s.combat.performance,0);assert.equal(s.effects.length,0);const [a,b]=s.pendingResolutions;s=run(s,'resolve',{id:a.id,result:'failure'});s=run(s,'resolve',{id:b.id,result:'success'});assert.equal(s.effects.length,1);assert.deepEqual(s.effects[0].targetIds,['a1']);s=run(s,'effect-end',{id:s.effects[0].id});assert.equal(s.effects.length,0);});
test('Death saves, natural 1/20, stabilization, healing and no resurrection',()=>{let s=initialState();s.hp.current=0;s=run(s,'death-save',{roll:1});assert.equal(s.combat.death.failure,2);s=run(s,'death-save',{roll:20});assert.equal(s.hp.current,1);assert.equal(s.combat.death.failure,0);s=run(s,'damage',{amount:1});s=run(s,'death-save',{roll:1});s=run(s,'death-save',{roll:2});assert.equal(s.combat.death.dead,true);assert.equal(transition(s,command(s,'heal',{amount:10})).ok,false);});
test('Schema1 migration retains old undo and receipts, supplies combat defaults',()=>{const old=initialState();old.schemaVersion=1;delete old.combat;old.undo={commandId:'old',before:structuredClone({...old,undo:undefined})};delete old.undo.before.undo;delete old.undo.before.receipts;delete old.undo.before.journal;delete old.undo.before.revision;const r=decode(JSON.stringify({format:'kobe-companion',schemaVersion:1,state:old}));assert.equal(r.migrated,true);assert.equal(r.state.schemaVersion,2);assert.equal(r.state.undo.before.combat.hitDice,10);});
test('Starting or ending concentration never removes unrelated Inspiration or Cri',()=>{let s=run(setup(),'inspiration',one);s=next(s);s=run(s,'majesty',maj);assert.equal(s.effects.filter(e=>e.kind==='inspiration').length,1);s=run(s,'concentration-end');assert.equal(s.effects.length,1);});
test('Temporary HP protect against massive damage instant death threshold',()=>{let s=initialState();s.hp.current=1;s.hp.temp=100;s=run(s,'damage',{amount:101});assert.equal(s.hp.current,0);assert.equal(s.combat.death.dead,false);});
test('Missed Fire bolt logs zero damage even if the form contains a number',()=>{let s=run(setup(),'fire-bolt',{...enemy,handFree:true});s=run(s,'resolve',{id:s.pendingResolutions[0].id,result:'miss',damage:20});assert.match(s.journal.at(-1).label,/0 dégâts/);assert.deepEqual(s.journal.at(-1).rolls,[]);});
test('Temporary condition duration expires on narrative time without resurrecting concentration',()=>{let s=run(setup(),'majesty',maj);s=run(s,'condition',{name:'stunned',enabled:true,duration:12});assert.equal(s.concentration,null);s=run(s,'time',{seconds:12,confirmed:true});assert.equal(s.combat.conditions.includes('stunned'),false);assert.equal(s.concentration,null);});

test('Removing the last blocking condition unlocks unused actions without refunding spent actions',()=>{
 let s=run(initialState(),'spend',{economy:'actionAvailable'});
 s=run(s,'condition',{name:'stunned',enabled:true});
 s=run(s,'condition',{name:'paralyzed',enabled:true});
 const remove=name=>{s=run(s,'condition',{name,enabled:false});};
 remove('stunned');
 assert.equal(transition(s,command(s,'inspiration',{table:true})).ok,false);
 remove('paralyzed');
 assert.deepEqual(s.combat.conditions,[]);
 assert.equal(s.economy.actionAvailable,false);
 assert.equal(s.economy.reactionAvailable,true);
 s=run(s,'condition',{name:'prone',enabled:true});
 s=run(s,'inspiration',{table:true});
 assert.equal(s.economy.bonusAvailable,false);
});

test('A timed condition survives reload and expires only on the requested start of turn',()=>{
 let s=run(initialState(),'condition',{name:'stunned',enabled:true,turns:2});
 s=run(s,'time',{seconds:120,confirmed:true});
 s=next(s);
 s=decode(JSON.stringify(envelope(s))).state;
 assert.deepEqual(s.combat.conditions,['stunned']);
 assert.equal(transition(s,command(s,'inspiration',{table:true})).ok,false);
 s=next(s);
 assert.deepEqual(s.combat.conditions,[]);
 assert.equal(s.effects.length,0);
 assert.match(s.journal.at(-1).label,/Fin : Étourdi/);
 s=run(s,'inspiration',{table:true});
 assert.equal(s.resources.inspiration,4);
});
