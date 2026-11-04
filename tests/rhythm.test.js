import test from 'node:test';
import assert from 'node:assert/strict';
import {createRhythm} from '../src/ui/rhythm.js';
import {drumSVG,kharvekPanel} from '../src/ui/kharvek-ui.js';
import {initialState} from '../src/kobe/model.js';
function fixture(){let callback,delay;const selected=[],messages=[];const r=createRhythm({select:x=>selected.push(x),feedback:x=>messages.push(x),schedule:(fn,ms)=>{callback=fn;delay=ms;return 1;},cancel:()=>callback=null});return {r,selected,messages,finish:()=>callback(),delay:()=>delay,hasTimer:()=>!!callback};}
for(const [count,expected] of [[1,'pulse'],[2,null],[3,'rally'],[4,null]])test(`Rhythm ${count} beats only selects ${expected??'nothing'} after the window`,()=>{const f=fixture();for(let i=0;i<count;i++)f.r.hit();assert.deepEqual(f.selected,[]);assert.equal(f.delay(),800);f.finish();assert.deepEqual(f.selected,expected?[expected]:[]);if(!expected)assert.match(f.messages.at(-1),/invalide/);});
test('Rhythm reset/cancel and configurable window never dispatch any rules',()=>{const f=fixture();f.r.hit(1000);assert.equal(f.delay(),1000);f.r.reset();assert.equal(f.hasTimer(),false);assert.deepEqual(f.selected,[]);f.r.hit(100);assert.equal(f.hasTimer(),false);assert.match(f.messages.at(-1),/400 à 1600/);f.r.hit();f.finish();assert.deepEqual(f.selected,['pulse']);});
test('Rendered charge marks 0–6 exactly match mechanical pool; dragon state derived',()=>{for(let charges=0;charges<=6;charges++){const s=initialState();s.resources.charges=charges;const html=kharvekPanel(s);assert.equal((html.match(/charge-mark lit/g)??[]).length,charges);assert.match(html,new RegExp(`${charges} / 6`));assert.match(drumSVG(charges),/data-dragon=/);assert.equal(s.resources.charges,charges);}});
