import test from 'node:test';
import assert from 'node:assert/strict';
import {submitInitiativeWithDice} from '../src/ui/connect-ui.js';

test('Prépa Fight: the visible d20 is exactly the one submitted to Encounter',async()=>{
  const submissions=[],visuals=[];
  const client={initiative:async(id,die)=>{submissions.push({id,die});return {ok:true,message:'Envoyée'};}};
  const result=await submitInitiativeWithDice(client,'request-1','',{random:()=>0.6,presenter:{show:x=>visuals.push(x)}});
  assert.equal(result.ok,true);
  assert.deepEqual(submissions,[{id:'request-1',die:13}]);
  assert.deepEqual(visuals,[{label:'Initiative',dice:[13],bonus:4,total:17,mode:'normal'}]);
});

test('manual d20 uses the manual face with no second roll',async()=>{
  const values=[],visuals=[];
  const client={initiative:async(id,die)=>{values.push(die);return {ok:true};}};
  await submitInitiativeWithDice(client,'retry-2','20',{random:()=>{throw Error('No random reroll');},presenter:{show:x=>visuals.push(x)}});
  assert.deepEqual(values,[20]);
  assert.equal(visuals[0].total,24);
  assert.deepEqual(visuals[0].dice,[20]);
});

test('no animation or second submission on rejected or invalid initiative',async()=>{
  const submissions=[],visuals=[];
  const client={initiative:async(id,die)=>{submissions.push(die);return {ok:false,message:'Hors ligne'};}};
  const opts={presenter:{show:x=>visuals.push(x)}};
  const rejected=await submitInitiativeWithDice(client,'request-3','14',opts);
  const invalid=await submitInitiativeWithDice(client,'request-4','22',opts);
  assert.equal(rejected.ok,false);
  assert.equal(invalid.ok,false);
  assert.deepEqual(submissions,[14]);
  assert.deepEqual(visuals,[]);
});

test('a broken visual engine cannot undo a transmitted initiative',async()=>{
  const client={initiative:async()=>({ok:true,message:'Envoyée'})};
  const old=console.warn;
  console.warn=()=>{};
  try{
    const result=await submitInitiativeWithDice(client,'request-5','7',{presenter:{show:()=>{throw Error('WebGL unavailable');}}});
    assert.equal(result.ok,true);
  }finally{console.warn=old;}
});
