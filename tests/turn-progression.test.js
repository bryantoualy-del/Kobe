import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState} from '../src/kobe/model.js';
import {transition} from '../src/kobe/engine.js';
import {spellAvailability} from '../src/kobe/spells.js';
import {spellById} from '../src/kobe/spell-catalog.js';
import {readFileSync} from 'node:fs';

let n=0;
function run(state,type,payload={},origin='player',id='turn-fix-'+(++n)){
  const result=transition(state,{id,actorId:'kobe',origin,expectedRevision:state.revision,type,payload});
  assert.equal(result.ok,true,result.message);
  return result.state;
}
const nextPayload=s=>({turn:s.turn.startRevision+1,epoch:s.turn.epoch,combatId:s.turn.combatId});

test('Aide is blocked after an action spell until the next local turn',()=>{
  let s=initialState();
  s=run(s,'spell-cast',{spellId:'fireball',level:3,table:true,rolls:Array(8).fill(3)});
  const aid=spellById('aid');
  assert.equal(s.economy.actionAvailable,false);
  assert.equal(spellAvailability(s,aid,2).ok,false);
  assert.equal(s.slots[3],2);
  s=run(s,'turn-next',nextPayload(s));
  assert.equal(s.economy.actionAvailable,true);
  assert.equal(s.economy.bonusAvailable,true);
  assert.equal(s.slots[3],2,'un nouveau tour ne restitue pas un emplacement');
  assert.equal(spellAvailability(s,aid,2).ok,true);
  s=run(s,'spell-cast',{spellId:'aid',level:2,table:true});
  assert.equal(s.slots[2],2);
  assert.equal(s.economy.actionAvailable,false);
});

test('Shared turn already closed can be followed by an explicitly local turn',()=>{
  const key='net-'+ 'a'.repeat(64);
  let s=initialState();
  s=run(s,'turn-start',{...nextPayload(s),tableKey:key},'gm',key);
  assert.equal(s.turn.tableKey,key);
  s=run(s,'spell-cast',{spellId:'fireball',level:3,table:true,rolls:Array(8).fill(3)});
  s=run(s,'turn-end',{tableKey:key});
  assert.equal(s.combat.phase,'ended');
  assert.equal(spellAvailability(s,spellById('aid'),2).ok,false);
  s=run(s,'turn-start',nextPayload(s));
  assert.equal(s.combat.phase,'active');
  assert.equal(s.economy.actionAvailable,true);
  assert.equal(s.economy.bonusAvailable,true);
  assert.equal(s.turn.tableKey,undefined,'le contrôle local ne réutilise pas l’autorité Encounter');
  assert.equal(spellAvailability(s,spellById('aid'),2).ok,true);
});

test('Manual advance while a shared turn is active detaches the old table key',()=>{
  const key='net-'+ 'b'.repeat(64);
  let s=initialState();
  s=run(s,'turn-start',{...nextPayload(s),tableKey:key},'gm',key);
  s=run(s,'spell-cast',{spellId:'fireball',level:3,table:true,rolls:Array(8).fill(3)});
  s=run(s,'turn-next',nextPayload(s));
  assert.equal(s.turn.tableKey,undefined);
  assert.equal(s.combat.phase,'active');
  assert.equal(spellAvailability(s,spellById('aid'),2).ok,true);
});

test('Mobile secondary views retain the turn control',()=>{
  const css=readFileSync(new URL('../src/ui/play-surface.css',import.meta.url),'utf8');
  assert.doesNotMatch(css,/\.app\[data-secondary=true\]\s+nav\.turn-dock\s+\.turn-finish\[data-shared=false\]\s*\{\s*display:none/);
  const app=readFileSync(new URL('../src/ui/app.js',import.meta.url),'utf8');
  assert.match(app,/local-next-turn/);
});
