import test from 'node:test';
import assert from 'node:assert/strict';
import {vfxForCommand,playKobeVfx,stopKobeVfx} from '../src/ui/kobe-vfx.js';

test('FX routes only real successful gameplay command categories',()=>{
 const cases=[
  ['spell-cast',{spellId:'fireball'},'fireball'],
  ['spell-cast',{spellId:'fire-bolt'},'firebolt'],
  ['fire-bolt',{},'firebolt'],
  ['spell-cast',{spellId:'healing-word'},'heal'],
  ['spell-cast',{spellId:'suggestion'},'control'],
  ['inspiration',{},'inspiration'],
  ['mantle',{},'mantle'],
  ['mantle',{survivors:true},'heal'],
  ['majesty',{},'majesty'],
  ['majesty-command',{},'control'],
  ['cry',{},'cry'],
  ['kharvek-power',{power:'pulse'},'heal'],
  ['kharvek-power',{power:'rally'},'heal'],
  ['kharvek-power',{power:'survivors'},'heal'],
  ['spell-cast',{spellId:'unknown'},null],
  ['undo',{},null],
  ['correct',{field:'hp',value:30},null],
  ['rest',{kind:'long'},null]
 ];
 for(const [type,payload,want] of cases)assert.equal(vfxForCommand(type,payload),want,type+': '+JSON.stringify(payload));
});
test('FX is DOM-only and inert in non-browser rendering',()=>{
 assert.equal(playKobeVfx('fireball'),false);
 assert.equal(playKobeVfx('unknown'),false);
 assert.doesNotThrow(stopKobeVfx);
});
