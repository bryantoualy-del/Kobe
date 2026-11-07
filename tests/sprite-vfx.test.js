import test from 'node:test';
import assert from 'node:assert/strict';
import {validateSheet,frameAtElapsed,sheetDuration} from '../src/ui/sprite-vfx.js';
const sheet={url:'./fx/example.png',frameWidth:128,frameHeight:128,frames:4,columns:2,fps:10};
test('sprite frame pacing preserves original frame order',()=>{
 assert.equal(frameAtElapsed(sheet,0),0);
 assert.equal(frameAtElapsed(sheet,99),0);
 assert.equal(frameAtElapsed(sheet,100),1);
 assert.equal(frameAtElapsed(sheet,250),2);
 assert.equal(frameAtElapsed(sheet,400),3);
 assert.equal(sheetDuration(sheet),400);
});
test('seamless loops and individual frame durations',()=>{
 const s={...sheet,loop:true,frameDurations:[100,200,300,400]};
 assert.equal(sheetDuration(s),1000);
 assert.equal(frameAtElapsed(s,110),1);
 assert.equal(frameAtElapsed(s,300),2);
 assert.equal(frameAtElapsed(s,1000),0);
});
test('invalid or remote spritesheets are rejected',()=>{
 assert.throws(()=>validateSheet({...sheet,url:'https://remote.example/fx.png'}));
 assert.throws(()=>validateSheet({...sheet,frames:0}));
 assert.throws(()=>validateSheet({...sheet,frameDurations:[1,2]}));
});
