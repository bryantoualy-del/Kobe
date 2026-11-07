import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,decode,envelope} from '../src/kobe/model.js';
import {transition} from '../src/kobe/engine.js';
import {ardentStage,comboAvailability} from '../src/ui/support-ui.js';
let serial=0;
const command=(s,type,payload)=>({id:'support-'+ ++serial,actorId:'kobe',origin:'player',expectedRevision:s.revision,type,payload});
const run=(s,type,payload)=>{const r=transition(s,command(s,type,payload));assert.equal(r.ok,true,r.message);return r;};
for(const survivors of [false,true])test('Sequential combo, resource accounting, manual movement and Undo: heal '+survivors,()=>{
 const s=initialState();s.resources.charges=6;
 assert.equal(comboAvailability(s,survivors).ok,true);
 assert.equal(ardentStage(s),'mantle');
 const mantle=run(s,'mantle',{table:true,survivors,healRolls:survivors?[4]:undefined});
 assert.equal(ardentStage(mantle.state),'fireball');
 const fire=run(mantle.state,'spell-cast',{table:true,spellId:'fireball',level:3,rolls:Array(8).fill(3)});
 assert.equal(ardentStage(fire.state),'complete');
 assert.equal(fire.state.resources.inspiration,4);
 assert.equal(fire.state.resources.charges,survivors?5:6);
 assert.equal(fire.state.slots[3],2);
 assert.equal(fire.state.economy.actionAvailable,false);
 assert.equal(fire.state.economy.bonusAvailable,false);
 assert.equal(fire.state.economy.reactionAvailable,true);
 assert.deepEqual(fire.state.combat.targets,[]);
 assert.equal(fire.state.journal.length,2);
 assert.deepEqual(decode(JSON.stringify(envelope(fire.state))).state,JSON.parse(JSON.stringify(fire.state)));
 const restored=run(fire.state,'undo',{commandId:fire.events[0].commandId??fire.state.undo.commandId}).state;
 assert.equal(restored.slots[3],3);
 assert.equal(ardentStage(restored),'fireball');
 const {turn}=restored;
 const next=run(restored,'turn-next',{turn:turn.startRevision+1,epoch:turn.epoch,combatId:turn.combatId});
 assert.equal(ardentStage(next.state),'mantle');
 assert.equal(restored.resources.inspiration,4,'Undo only undoes the last committed step');
});
for(const [label,change,heal] of [
 ['no inspiration',s=>s.resources.inspiration=0,false],
 ['no slots',s=>s.slots.fill(0),false],
 ['no action',s=>s.economy.actionAvailable=false,false],
 ['no bonus',s=>s.economy.bonusAvailable=false,false],
 ['no charge',s=>s.resources.charges=0,true],
 ['silence',s=>s.combat.conditions=['silenced'],true],
 ['incapacitated',s=>s.combat.conditions=['incapacitated'],false],
])test('Combo preflight blocks '+label+' without mutation',()=>{const s=initialState();s.resources.charges=6;change(s);const before=structuredClone(s);assert.equal(comboAvailability(s,heal).ok,false);assert.deepEqual(s,before);});
test('Upper slot accepted and bonus spell still forbids Fireball',()=>{
 const s=initialState();s.slots[3]=0;assert.equal(comboAvailability(s).ok,true);
 const after=run(s,'spell-cast',{spellId:'healing-word',table:true,level:1,rolls:[3]}).state;
 const result=transition(after,command(after,'spell-cast',{spellId:'fireball',table:true,level:4,rolls:Array(9).fill(3)}));
 assert.equal(result.ok,false);
 assert.equal(after.slots[4],3);
});
