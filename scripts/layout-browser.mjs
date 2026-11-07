// Same saved favourites and viewport for the audited baseline and candidate.
import {chromium,webkit} from 'playwright';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
const server=createServer(async(req,res)=>{try{
 const p=new URL(req.url,'http://localhost').pathname;
 const before=p.startsWith('/before/'),root=resolve(before?'.before':'dist');
 const file=resolve(root,p.replace(/^\/(before|after)\//,'')||'index.html');
 if(!file.startsWith(root+'/'))throw Error('path');
 res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.webp':'image/webp','.jpg':'image/jpeg'})[extname(file)]||'application/octet-stream');res.end(await readFile(file));
}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));await mkdir('screenshots/layout',{recursive:true});
try{for(const engine of [chromium,webkit]){
 const browser=await engine.launch();try{for(const width of [375,390,430,1180]){for(const phase of ['before','after']){
 const context=await browser.newContext({viewport:{width,height:width===1180?820:844},hasTouch:true,reducedMotion:'reduce',serviceWorkers:'block'});
 const page=await context.newPage();await page.goto(`http://127.0.0.1:${server.address().port}/${phase}/index.html`);
 const tab=async name=>{await page.getByRole('tab',{name,exact:true}).click();await page.waitForFunction(name=>[...document.querySelectorAll('[role=tab]')].some(e=>(e.getAttribute('aria-label')||e.textContent)===name&&e.getAttribute('aria-selected')==='true'),name);await page.evaluate(()=>scrollTo(0,0));};
 await tab('Sorts & pouvoirs');
 for(const id of ['fireball','healing-word','circle-of-power','slow']){await page.locator(`[data-favorite="${id}"]`).click();await page.waitForFunction(id=>JSON.parse(localStorage.getItem('kobe-companion:v1')).state.preferences.favorites.includes(id),id);}
 await tab('Combat');
 const shot=async name=>page.screenshot({path:`screenshots/layout/${engine.name()}-${width}-${phase}-${name}.png`});
 await shot('combat');
 if(phase==='after'){
  const next=await page.locator('[data-action=end-turn]').boundingBox();
  assert(next.x>=0&&next.x+next.width<=width&&next.y+next.height<844,'end turn in viewport');
  for(const selector of ['[data-action=heal]','[data-action=damage]','[data-cast=fireball]']){
    const box=await page.locator(selector).boundingBox();
    assert(box.height>=44&&box.y+box.height<next.y,selector+' touch height and visibility');
  }
  if(width===1180){
    assert((await page.locator('.turn-identity img').boundingBox()).width>=64,'official emblem retained');
    const cockpit=await page.locator('.support-cockpit').boundingBox();
    assert(cockpit.y+cockpit.height<=660,'cockpit fits the useful iPad landscape viewport with Safari chrome');
  }
 }
 for(const name of ['Sorts & pouvoirs','Social','Journal','Groupe']){
  await tab(name);
  if(phase==='after'){
   assert.equal(await page.locator('header.top').isVisible(),width>720,name+' full header follows viewport');
   assert.equal(await page.locator('#cc-turnbar-standard').isVisible(),width>720,name+' turn bar follows viewport');
   if(width>720){assert.equal(await page.locator('.turn-identity img').isVisible(),true,name+' official emblem');assert.equal(await page.locator('#hp').inputValue(),'83');}
  }
  await shot(name==='Sorts & pouvoirs'?'spells':name.toLowerCase());
  if(phase==='after')assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),name+' horizontal overflow '+width+' '+JSON.stringify(await page.evaluate(()=>[...document.querySelectorAll('main *')].filter(e=>e.getBoundingClientRect().right>innerWidth).map(e=>({tag:e.tagName,cls:e.className,width:e.getBoundingClientRect().width})).slice(0,12))));
 }
 await tab('Combat');await page.locator('[data-combat-view=kharvek]').click();
 await page.locator('[data-charge-value="3"]').click();await page.evaluate(()=>scrollTo(0,0));await shot('kharvek');
 if(phase==='after'){
  await page.locator('[data-kharvek=pulse]').click();await page.locator('#ribbon:not([hidden])').waitFor();
  await tab('Sorts & pouvoirs');await page.locator('[data-ribbon-undo]').click();
  await tab('Combat');await page.locator('[data-charge-count]').waitFor();assert.equal(await page.locator('[data-charge-count]').innerText(),'3 / 6','undo available after navigation');
 }
 await context.close();
 }}console.log(engine.name()+': layout before/after 375/390/430/1180, navigation, touch targets, four favourites and persistent Undo PASS');}finally{await browser.close();}
}}finally{server.close();}
