import test from 'node:test';
import assert from 'node:assert/strict';
import {vfxForCommand} from '../src/ui/kobe-vfx.js';

test('Boule de feu retains its immediate cast FX',()=>{
 assert.equal(vfxForCommand('spell-cast',{spellId:'fireball'}),'fireball');
 assert.equal(vfxForCommand('spell-resolve',{spellId:'fireball',result:'hit'}),null);
});
test('Manteau and Khar-Vek preserve their healing FX',()=>{
 assert.equal(vfxForCommand('mantle',{table:true}),'mantle');
 assert.equal(vfxForCommand('mantle',{table:true,survivors:true}),'heal');
 assert.equal(vfxForCommand('kharvek-power',{power:'pulse'}),'heal');
 assert.equal(vfxForCommand('kharvek-power',{power:'rally'}),'heal');
 assert.equal(vfxForCommand('kharvek-dawn',{confirmed:true}),null);
 assert.equal(vfxForCommand('correct',{field:'charges'}),null);
});
test('Trait de feu only animates after a confirmed hit or critical',()=>{
 assert.equal(vfxForCommand('spell-cast',{spellId:'fire-bolt'}),null);
 assert.equal(vfxForCommand('spell-cast',{spellId:'firebolt'}),null);
 assert.equal(vfxForCommand('fire-bolt'),null);
 for(const result of ['miss','refused',undefined]){
  assert.equal(vfxForCommand('spell-resolve',{spellId:'fire-bolt',result}),null);
  assert.equal(vfxForCommand('resolve',{kind:'fire',result}),null);
 }
 for(const result of ['hit','critical']){
  assert.equal(vfxForCommand('spell-resolve',{spellId:'fire-bolt',result}),'firebolt');
  assert.equal(vfxForCommand('spell-resolve',{spellId:'firebolt',result}),'firebolt');
  assert.equal(vfxForCommand('resolve',{kind:'fire',result}),'firebolt');
 }
 assert.equal(vfxForCommand('spell-resolve',{spellId:'fireball',result:'hit'}),null);
 assert.equal(vfxForCommand('spell-resolve',{result:'hit'}),null);
});
