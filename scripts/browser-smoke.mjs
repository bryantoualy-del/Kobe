import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {join,extname,normalize,sep} from 'node:path';
import {chromium,webkit} from 'playwright';

const root=join(process.cwd(),'dist');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'};
const server=createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const safe=normalize(path).replace(/^[/\\]+/,'');
  if(safe.startsWith('..')||safe.split(sep).includes('..')){res.writeHead(403).end();return;}
  const file=join(root,safe||'index.html');
  const bytes=await readFile(file);
  res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');
  res.writeHead(200);res.end(bytes);
 }catch{res.writeHead(404).end('Not found');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const address='http://127.0.0.1:'+server.address().port+'/';
let failures=0;
try{
 for(const [label,browserType] of [['chromium',chromium],['webkit',webkit]]){
  const browser=await browserType.launch({headless:true});
  try {
   const context=await browser.newContext({serviceWorkers:'allow'});
   const page=await context.newPage(), errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(address);
   await page.getByRole('heading',{name:'Kobe Kozzo'}).waitFor();
   for(const tab of ['Combat','Sorts & pouvoirs','Social','Journal']) {
    await page.getByRole('tab',{name:tab}).click();
    await page.waitForFunction(label => [...document.querySelectorAll('[role="tab"]')].some(el => el.textContent === label && el.getAttribute('aria-selected') === 'true'), tab);
   }
   await page.getByRole('tab',{name:'Combat'}).click();
   await page.getByLabel('Valeur').fill('10');
   await page.getByRole('button',{name:'Dégâts'}).click();
   await page.getByText('73/83').waitFor();
   await page.reload();
   await page.getByText('73/83').waitFor();
   await page.getByRole('tab',{name:'Social'}).click();
   await page.getByLabel('Notes de Kobe').fill('Roark à retrouver.');
   await page.getByRole('button',{name:'Enregistrer les notes'}).click();
   await page.waitForFunction(() => JSON.parse(localStorage.getItem('kobe-companion:v1') || '{}').state?.notes === 'Roark à retrouver.');
   await page.reload();
   assert.equal(await page.getByLabel('Notes de Kobe').inputValue(),'Roark à retrouver.');
   await page.getByRole('tab',{name:'Journal'}).click();
   assert(await page.getByText('10 dégâts reçus').count()>0);
   // Ensure app shell is cached and local state survives loss of network after initial installation.
   await page.waitForFunction(()=>navigator.serviceWorker.controller!==null,{timeout:15000});
   await context.setOffline(true);
   await page.reload();
   await page.getByRole('heading',{name:'Kobe Kozzo'}).waitFor();
   await page.getByRole('tab',{name:'Combat'}).click();
   await page.getByText('73/83').waitFor();
   await context.setOffline(false);
   assert.deepEqual(errors,[],label+' errors');
   await context.close();
   console.log(label+': four tabs, persistence, journal, offline reload PASS');
  } finally {await browser.close();}
 }
}catch(e){failures++;console.error(e);process.exitCode=1;}
finally{await new Promise(resolve=>server.close(resolve));}
if(!failures)console.log('Real browser smoke PASS');
