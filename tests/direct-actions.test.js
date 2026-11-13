import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,decode,envelope} from '../src/kobe/model.js';
import {transition} from '../src/kobe/engine.js';
import {SPELLS,diceFor} from '../src/kobe/spell-catalog.js';
let serial=0;
function command(s,type,payload={}){
 return {id:'direct-'+(++serial),actorId:'kobe',origin:'player',expectedRevision:s.revision,type,payload};
}
function run(s,type,p){
 const result=transition(s,command(s,type,p));
 assert.equal(result.ok,true,result.message);
 return result;
}
for(const spell of SPELLS)test('Direct cast without targets: '+spell.name,()=>{
 const s=initialState(),dice=diceFor(spell,spell.level);
 const payload={table:true,spellId:spell.id,level:spell.level,ability:'table',detail:'Effet annoncé à la table',effectSeconds:3600,attackRolls:[12],checkRolls:[10],attackMode:'normal'};
 if(dice)payload.rolls=Array(dice[0]).fill(2);
 const result=run(s,'spell-cast',payload),after=result.state;
 assert.equal(after.economy[spell.economy],false);
 if(spell.level)assert.equal(after.slots[spell.level],s.slots[spell.level]-1);
 assert.deepEqual(after.hp,s.hp,'no arbitrary recipient is silently healed');
 assert.deepEqual(after.combat.targets,[]);
 assert.equal(after.pendingResolutions.length,spell.attack?1:0);
 if(spell.concentration)assert.equal(after.concentration.name,spell.name);
 assert.deepEqual(decode(JSON.stringify(envelope(after))).state,after);
});
test('Direct bardic abilities use the same economy, receipts and Undo',()=>{
 for(const type of ['inspiration','mantle','cry','majesty','performance']){
  const before=initialState(),cmd=command(before,type,{table:true}),result=transition(before,cmd);
  assert.equal(result.ok,true,result.message);
  assert.equal(transition(result.state,cmd).replay,true);
  const restored=run(result.state,'undo',{commandId:cmd.id}).state;
  assert.deepEqual(restored.resources,before.resources);
  assert.deepEqual(restored.economy,before.economy);
  assert.deepEqual(result.state.combat.targets,[]);
 }
});
test('Direct Khar-Vek rolls once and spends atomically, without changing ally HP',()=>{
 for(const [power,count,cost] of [['pulse',3,1],['rally',2,3],['survivors',1,1]]){
  const s=initialState();s.resources.charges=6;s.hp.current=20;
  const cmd=command(s,power==='survivors'?'mantle':'kharvek-power',{table:true,power,survivors:power==='survivors',healRolls:Array(count).fill(4)});
  const r=transition(s,cmd);assert.equal(r.ok,true,r.message);
  assert.equal(r.state.resources.charges,6-cost);assert.equal(r.state.hp.current,20);
  assert.deepEqual(r.events[0].rolls,Array(count).fill(4));
  if(power==='survivors'){assert.equal(r.state.resources.inspiration,4);assert.equal(r.state.economy.bonusAvailable,false);}
  else assert.equal(r.state.economy.actionAvailable,false);
  assert.equal(transition(r.state,cmd).replay,true);
  assert.deepEqual(run(r.state,'undo',{commandId:cmd.id}).state.resources,s.resources);
 }
});
test('Table actions retain resource, silence, incapacitation and dice guards',()=>{
 const s=initialState();s.resources.charges=0; // Explicitly model a depleted saved vestige.
 assert.equal(transition(s,command(s,'kharvek-power',{table:true,power:'rally',healRolls:[4,4]})).ok,false);
 s.combat.conditions=['silenced'];
 assert.equal(transition(s,command(s,'cry',{table:true})).ok,false);
 s.combat.conditions=['incapacitated'];
 assert.equal(transition(s,command(s,'mantle',{table:true})).ok,false);
 s.combat.conditions=[];s.resources.charges=6;
 assert.equal(transition(s,command(s,'mantle',{table:true,survivors:true,healRolls:[11]})).ok,false);
 assert.equal(s.resources.inspiration,5);
});
test('Personal group editor is atomic and ends concentration on incapacitation',()=>{
 const s=initialState();
 const result=run(s,'self-correct',{hp:40,temp:5,ac:17,reaction:false,concentration:'Cercle de pouvoir',conditions:['incapacitated']});
 assert.equal(result.state.concentration,null);assert.equal(result.state.profile.ac,17);
 const invalid=transition(result.state,command(result.state,'self-correct',{hp:100,temp:5,ac:17,reaction:false,concentration:'',conditions:[]}));
 assert.equal(invalid.ok,false);assert.equal(result.state.hp.current,40);
});
