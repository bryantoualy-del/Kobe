import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {join,extname} from 'node:path';
import {chromium,webkit} from 'playwright';
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname;res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html'})[extname(p)]??'text/html');res.end(await readFile(join(process.cwd(),'dist',p==='/'?'index.html':p)));}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
try{for(const [name,type] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await type.launch({headless:true});try{
 const context=await browser.newContext({viewport:{width:1180,height:820},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('kobe-companion:v1')).state);
 const confirm=async()=>{await page.locator('dialog[open] [type=submit]').click();await page.locator('dialog[open]').waitFor({state:'detached'});};
 const next=async()=>{await page.getByRole('button',{name:'Fin de tour',exact:true}).click();await page.getByRole('button',{name:'Fin de tour',exact:true}).waitFor();};
 const correct=async value=>{await page.locator('[data-charge-value="'+value+'"]').click();await page.waitForFunction(n=>JSON.parse(localStorage.getItem('kobe-companion:v1')).state.resources.charges===n,value);assert.equal(await page.locator('dialog[open]').count(),0);};
 await page.goto('http://127.0.0.1:'+server.address().port);await page.getByText(/Sauvegarde locale · révision/).waitFor();
 await page.locator('[data-combat-view=kharvek]').click();assert.equal(await page.locator('[data-charge-count]').innerText(),'0 / 6');await mkdir('screenshots',{recursive:true});
 for(const charges of [0,1,2,3,4,5,6]){await correct(charges);assert.equal(await page.locator('.charge-mark.lit').count(),charges);assert.equal(Number(await page.locator('#dragon-fill rect').getAttribute('x')),(6-charges)*256);assert.equal(await page.locator('[data-charge-count]').textContent(),`${charges} / 6`);assert.equal(await page.locator('svg[data-dragon]').getAttribute('data-dragon'),charges<2?'dormant':charges<4?'awakening':charges<6?'coiling':'complete');if([0,3,6].includes(charges)){await page.locator('#kharvek').evaluate(el=>el.scrollIntoView({block:'center'}));await page.locator('#kharvek').screenshot({path:`screenshots/${name}-kharvek-${charges}.png`});}}
 assert.equal(await page.locator('.dragon-illustration').evaluate(e=>getComputedStyle(e).animationName),'none');

 const fire=async(power,charges)=>{
   await page.locator('[data-kharvek='+power+']').click();
   await page.waitForFunction(n=>JSON.parse(localStorage.getItem('kobe-companion:v1')).state.resources.charges===n,charges);
   assert.equal(await page.locator('dialog[open],.spell-inline,[name=target]').count(),0);
 };
 await fire('pulse',5);
 assert.equal((await state()).hp.current,83);
 assert.equal((await state()).economy.actionAvailable,false);
 await next();await fire('rally',2);
 await fire('survivors',1);
 assert.equal((await state()).resources.inspiration,4);
 assert.equal((await state()).economy.bonusAvailable,false);
 assert.deepEqual((await state()).combat.targets,[]);
 await page.reload();await page.locator('[data-charge-count]').waitFor();assert.equal((await state()).resources.charges,1);
 await next();
 assert.equal(await page.locator('[data-rhythm-enabled],[data-rhythm-window],[data-drum],[data-kharvek=correct]').count(),0);
 await page.locator('[data-kharvek=pulse]').click();
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('kobe-companion:v1')).state.resources.charges===0);
 assert.equal(await page.locator('dialog[open]').count(),0);
 await page.locator('[data-kharvek=dawn]').click();await confirm();assert.equal((await state()).resources.charges,6);
 if(name==='chromium'){await page.evaluate(()=>navigator.serviceWorker.ready);await context.setOffline(true);await page.reload();await page.locator('[data-kharvek=pulse]').waitFor();}
 await correct(3);await page.reload();await page.locator('[data-charge-count]').waitFor();assert.equal((await state()).resources.charges,3);
 await correct(6);await next();await fire('pulse',5);
 assert.equal(await page.locator('[data-kharvek=pulse]').isDisabled(),true);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'iPad horizontal overflow');
 assert.deepEqual(errors,[]);
 console.log(name+': direct Khar-Vek powers, shared roll, receipts, resources, no targets, 0/3/6 tail-first visual, persistence, offline PASS');
 }finally{await browser.close();}
}}finally{await new Promise(r=>server.close(r));}
