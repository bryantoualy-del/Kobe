import test from 'node:test';
import assert from 'node:assert/strict';
import {createStore} from '../src/kobe/storage.js';

test('one continuous five-turn session: mixed saves, concentration, Glamour, all vestige powers, rest and replay after reopening',async()=>{
 const map=new Map(),storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)},locks={request:async(k,o,fn)=>fn()};
 let store=createStore({storage,locks}),n=0;const commands=[];
 const state=()=>store.getState();
 async function play(type,payload={}){
  const c={id:'session-'+ ++n,actorId:'kobe',origin:'player',expectedRevision:state().revision,type,payload};
  const r=await store.dispatch(c);assert.equal(r.ok,true,type+': '+r.message);commands.push(c);
 }
 async function next(){await play('turn-end');await play('turn-start',{epoch:'local',combatId:'local',turn:state().turn.startRevision+1});}
 assert.equal(state().resources.charges,6,'Khar-Vek starts fully charged');
 await play('correct',{field:'charges',value:0,reason:'Tester le rechargement à l’aube'});
 assert.equal(state().resources.charges,0);
 await play('kharvek-dawn',{confirmed:true});
 await play('initiative-roll',{die:14});
 for(const [id,side] of [['brack','ally'],['a','enemy'],['b','enemy']]){
  await play('target-save',{id,name:id,side,temp:0,reaction:true});
  await play('target-hp',{targetId:id,current:side==='ally'?10:100,max:100,temp:0,confirmed:true});
 }
 await play('favorites',{ids:['fireball','healing-word','circle-of-power','slow']});
 await play('inspiration',{targetIds:['brack'],eligible:true,noExistingDie:true});
 await play('spell-cast',{spellId:'fireball',level:3,eligible:true,components:true,targetIds:['a','b'],rolls:Array(8).fill(4)});
 for(const result of ['failure','success'])await play('spell-resolve',{id:state().pendingResolutions[0].id,result,defense:'normal'});
 assert.deepEqual(state().combat.targets.slice(1).map(t=>t.hp.current),[68,84]);
 await play('damage',{amount:40});
 await next();await play('spell-cast',{spellId:'circle-of-power',level:5,eligible:true,components:true,targetIds:['kobe'],rolls:[]});
 await play('cry',{targetIds:['a'],eligible:true});
 await next();await play('spell-cast',{spellId:'slow',level:3,eligible:true,components:true,targetIds:['b'],rolls:[],replaceConcentration:true});
 assert.equal(state().concentration.name,'Lenteur');
 await play('mantle',{targetIds:['brack'],eligible:true,choices:{brack:{temp:'replace',move:false}},survivorTargetId:'brack',drumReady:true,healingEligible:true,healRolls:[8]});
 assert.equal(state().combat.targets[0].hp.current,23);assert.equal(state().combat.targets[0].hp.temp,11);
 await next();await play('kharvek-power',{power:'pulse',targetIds:['kobe'],drumReady:true,healingEligible:true,healRolls:[4,5,6]});
 assert.equal(state().hp.current,63);
 await next();await play('kharvek-power',{power:'rally',targetIds:['kobe','brack'],drumReady:true,healingEligible:true,healRolls:[4,5]});
 assert.equal(state().hp.current,77);assert.equal(state().combat.targets[0].hp.current,37);
 assert.equal(state().resources.charges,1);assert.equal(state().resources.inspiration,3);
 const before=state();store=createStore({storage,locks});await store.load();
 for(const c of commands){const r=await store.dispatch(c);assert.equal(r.replay,true,c.type);}
 assert.deepEqual(state(),before);
 await play('turn-end');await play('rest',{kind:'short',confirmed:true,dice:[3]});
 await play('rest',{kind:'long',confirmed:true,longEligible:true});
 assert.equal(state().hp.current,83);assert.equal(state().resources.charges,1);
 assert.equal(state().resources.inspiration,5);assert.deepEqual(state().slots,[0,4,3,3,3,2]);
 assert.equal(state().preferences.favorites.length,4);
});
