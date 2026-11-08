import test from 'node:test';
import assert from 'node:assert/strict';
import {vfxForCommand} from '../src/ui/kobe-vfx.js';
test('Boule de feu triggers only for a successful spell-cast command',()=>{
 assert.equal(vfxForCommand('spell-cast',{spellId:'fireball'}),'fireball');
 assert.equal(vfxForCommand('spell-cast',{spellId:'fire-bolt'}),null);
 assert.equal(vfxForCommand('spell-resolve',{spellId:'fireball'}),null);
});
test('Mantle and survivor healing use distinct presentation presets',()=>{
 assert.equal(vfxForCommand('mantle',{table:true}),'mantle');
 assert.equal(vfxForCommand('mantle',{table:true,survivors:true}),'kharvek');
});
test('Khar-Vek effects apply only to actual healing powers',()=>{
 assert.equal(vfxForCommand('kharvek-power',{power:'pulse'}),'kharvek');
 assert.equal(vfxForCommand('kharvek-power',{power:'rally'}),'kharvek');
 assert.equal(vfxForCommand('kharvek-dawn',{confirmed:true}),null);
 assert.equal(vfxForCommand('correct',{field:'charges'}),null);
});

test('Trait de feu is recognized without a second mechanical command',()=>{
 assert.equal(vfxForCommand('spell-cast',{spellId:'fire-bolt'}),'firebolt');
 assert.equal(vfxForCommand('spell-cast',{spellId:'firebolt'}),'firebolt');
 assert.equal(vfxForCommand('spell-resolve',{spellId:'fire-bolt'}),null);
});
