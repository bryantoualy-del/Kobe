// Isolated real V5 server at an immutable registration revision; no live room, key or save used.
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {join,extname} from 'node:path';
import {chromium,webkit} from 'playwright';
import {CAPABILITIES} from '../src/kobe/connect.js';
process.env.RPG_CONNECT_GM_KEY=randomBytes(32).toString('hex');
process.env.PORT='0';
const {server,wss,rooms}=await import('../.v5-test/rpg-connect-server.js');
if(!server.listening)await new Promise(r=>server.once('listening',r));
const endpoint='ws://127.0.0.1:'+server.address().port;
const http=createServer(async(req,res)=>{
  const path=new URL(req.url,'http://localhost').pathname;
  try{const data=await readFile(join('dist',path==='/'?'index.html':path));
    res.setHeader('content-type',({'.js':'text/javascript','.css':'text/css','.html':'text/html'})[extname(path)]||'text/html');res.end(data);
  }catch{res.writeHead(404).end();}
});
await new Promise(r=>http.listen(0,'127.0.0.1',r));
const address='http://127.0.0.1:'+http.address().port+'/';
const until=async(fn,label)=>{const start=Date.now();while(Date.now()-start<12000){const v=fn();if(v)return v;await new Promise(r=>setTimeout(r,30));}throw Error('Timeout: '+label);};
await mkdir('screenshots',{recursive:true});
try{
 for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
  const gm=new WebSocket(endpoint),rx=[];
  gm.onmessage=e=>rx.push(JSON.parse(e.data));
  await new Promise((resolve,reject)=>{gm.onopen=resolve;gm.onerror=reject;});
  const send=m=>gm.send(JSON.stringify({v:1,...m}));
  send({type:'hello',role:'gm',protocolVersion:1,clientCapabilities:CAPABILITIES,sessionMode:'table-free',key:process.env.RPG_CONNECT_GM_KEY});
  const room=(await until(()=>rx.find(m=>m.type==='welcome'),'GM welcome')).room;
  send({type:'invite',characterId:'kobe'});const token=(await until(()=>rx.find(m=>m.type==='invite'),'invite')).payload.token;
  const browser=await engine.launch();
  try{
   const context=await browser.newContext({viewport:{width:1180,height:820},hasTouch:true,reducedMotion:'reduce'});
   let page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(address);await page.getByRole('tab',{name:'Groupe',exact:true}).click();await page.getByRole('button',{name:'RPG Connect',exact:true}).click();
   const joinRoom=async()=>{
     await page.getByLabel('Invitation Kobe').fill('RPGCONNECT|'+endpoint+'|'+room+'|kobe|'+token);
     await page.getByRole('button',{name:'Rejoindre la partie'}).click();
     await page.getByText(/Connecté · MJ en ligne/).waitFor();
   };
   await joinRoom();
   const priorSocket=rooms.get(room).players.get('kobe');
   await page.reload();
   await until(()=>rooms.get(room).players.get('kobe')&&rooms.get(room).players.get('kobe')!==priorSocket,'automatic invitation resume after reload');
   await page.getByRole('tab',{name:'Groupe',exact:true}).click();
   await page.getByText(/Connecté · MJ en ligne/).waitFor();
   await page.getByRole('tab',{name:'Social',exact:true}).click();
   await page.locator('#physical').check();
   await page.locator('[data-roll=Persuasion]').click();
   await page.locator('[name=answer]').fill('12');await page.locator('[data-dialog-accept]').click();
   await page.waitForFunction(()=>document.querySelector('output.ribbon')?.textContent.includes('Persuasion'));
   assert.ok(!rx.some(m=>m.type==='event'),'private Social roll never broadcast');
   await page.getByRole('tab',{name:'Groupe',exact:true}).click();
   const touchCounts={};await page.evaluate(()=>{window.__taps=0;document.addEventListener('click',()=>window.__taps++,true);});
   const count=()=>page.evaluate(()=>window.__taps);let start=await count();
   const first=await until(()=>rx.find(m=>m.type==='state'),'HP state');
   assert.equal(first.state.hp.current,83);assert.equal(first.state.characterId,'kobe');assert.ok(!('resources' in first.state));
   const command=(id,type,payload)=>send({type:'command',room,characterId:'kobe',event:{id,type,payload,characterId:'kobe'}});
   command('group','state:sync',{syncEpoch:'A',groupRevision:1,conditionActors:[{id:'s',name:'Samoth',kind:'player',health:{current:45,max:60,temp:3}},{id:'e',kind:'enemy',name:'Garde',health:{current:90,max:90}}]});
   await page.getByText(/45 \/ 60 PV/).waitFor();
   const correct=()=>command('correction-1','hp:set',{manualTable:true,expectedValue:83,value:60});
   correct();await page.getByRole('button',{name:'Appliquer cette correction'}).click();
   await until(()=>rx.some(m=>m.type==='command-ack'&&m.id==='correction-1'),'accepted correction');
   touchCounts.reviewHp=(await count())-start;start=await count();
   const hp=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('kobe-companion:v1')).state.hp.current);
   assert.equal(await hp(),60);
   correct();await until(()=>rx.some(m=>m.id==='correction-1'&&m.result==='already-reviewed'),'duplicate acknowledgment');
   command('initiative-1','initiative:request',{requestId:'fight-1'});
   await page.locator('[data-init-manual]').fill('12');await page.locator('[data-init-roll]').click();
   const ev=await until(()=>rx.find(m=>m.type==='event'&&m.event.type==='initiative:rolled'),'initiative');
   assert.equal(ev.event.payload.total,16);send({type:'event-ack',id:ev.event.id});
   touchCounts.initiative=(await count())-start;
   const old=rooms.get(room).players.get('kobe');
   old.terminate();await until(()=>rooms.get(room).players.get('kobe')!==old&&rooms.get(room).players.get('kobe'),'reconnected');
   assert.equal(await hp(),60);
   await page.locator('[data-toggle-config]').click();await page.getByRole('button',{name:'Déconnecter',exact:true}).click();
   await page.getByRole('tab',{name:'Combat',exact:true}).click();
   start=await count();await page.getByRole('button',{name:'Soin',exact:true}).click();await page.locator('[name=answer]').fill('5');await page.locator('[data-dialog-accept]').click();
   await page.locator('#hp[value="65"]').waitFor();
   touchCounts.heal=(await count())-start;console.log(name+' FRICTION measured DOM clicks (text entry and native prompt excluded): '+JSON.stringify(touchCounts));
   await page.close();page=await context.newPage();await page.goto(address);
   await page.locator('#hp[value="65"]').waitFor();
   await page.getByRole('tab',{name:'Groupe',exact:true}).click();await page.getByRole('button',{name:'RPG Connect',exact:true}).click();await joinRoom();
   await until(()=>rx.some(m=>m.type==='state'&&m.state.hp.current===65),'current snapshot only');
   correct();await until(()=>rx.filter(m=>m.id==='correction-1'&&m.result==='already-reviewed').length>=2,'persisted duplicate receipt');
   assert.equal(await hp(),65);assert.ok(!rx.some(m=>m.type==='event'&&/heal|damage/.test(m.event.type)));
   command('group2','state:sync',{syncEpoch:'A',groupRevision:2,conditionActors:[{id:'s',name:'Samoth',kind:'player',health:{current:45,max:60,temp:3}}]});
   await page.getByText(/45 \/ 60 PV/).waitFor();await page.locator('#rpg-connect').scrollIntoViewIfNeeded();
   await page.screenshot({path:'screenshots/'+name+'-lot5-table.png'});assert.deepEqual(errors,[]);
   console.log(name+': real V5 invite, private projection, group, correction/replay, initiative 12+4, reconnect, closed tab, latest HP snapshot and persistent receipt PASS');
  }finally{await browser.close();gm.close();}
 }
}finally{for(const ws of wss.clients)ws.terminate();wss.close();server.close();http.close();}
