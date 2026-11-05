import {chromium,webkit} from 'playwright';
import {createServer} from 'node:http';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,extname} from 'node:path';
import assert from 'node:assert/strict';
let unavailable=false,version=1;
const http=createServer(async(req,res)=>{
 if(unavailable){res.writeHead(503).end('Recette : origine indisponible');return;}
 const path=new URL(req.url,'http://localhost').pathname;
 try{let bytes=await readFile(join('dist',path==='/'?'index.html':path));
  if(path==='/sw.js'&&version===2)bytes=Buffer.from(bytes.toString().replace("'kobe-v11-'+self.KobeShellRevision","'kobe-v11-recipe'"));
  res.setHeader('cache-control','no-cache');res.setHeader('content-type',({'.js':'text/javascript','.css':'text/css'})[extname(path)]||'text/html');res.end(bytes);
 }catch{res.writeHead(404).end();}
});
await new Promise(r=>http.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+http.address().port+'/';
try{
 for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
  const dir=await mkdtemp(join(tmpdir(),'kobe-session-'));let ctx;
  const launch=()=>engine.launchPersistentContext(dir,{headless:true,viewport:{width:1180,height:820},hasTouch:true});
  try{
   version=1;unavailable=false;ctx=await launch();let page=ctx.pages()[0]||await ctx.newPage();await page.goto(url);
   await page.waitForFunction(()=>navigator.serviceWorker.controller!==null);
   await page.getByLabel('Valeur').fill('7');await page.getByRole('button',{name:'Dégâts',exact:true}).click();
   await page.locator('.stats').getByText('76/83').waitFor();
   version=2;
   await page.evaluate(async()=>{const reg=await navigator.serviceWorker.ready;await reg.update();});
   await page.waitForFunction(async()=>!!(await navigator.serviceWorker.ready).waiting);
   await page.getByLabel('Valeur').fill('1');await page.getByRole('button',{name:'Soin',exact:true}).click();
   await page.locator('.stats').getByText('77/83').waitFor();
   await ctx.close();ctx=null;ctx=await launch();page=ctx.pages()[0]||await ctx.newPage();
   await page.goto(url);await page.locator('.stats').getByText('77/83').waitFor();
   await page.waitForFunction(async()=>!(await navigator.serviceWorker.ready).waiting&&(await caches.keys()).includes('kobe-v11-recipe'));
   console.log(name+': browser process closed/reopened with same profile; HP 77/83 retained after waiting SW update PASS.');
   await page.waitForFunction(()=>navigator.serviceWorker.controller!==null);
   await page.waitForFunction(async()=>!!await (await caches.open('kobe-v11-recipe')).match('./index.html'));
   unavailable=true;
   try{
    const reopened=await ctx.newPage();await reopened.goto(url);await reopened.locator('.stats').getByText('77/83').waitFor({timeout:10000});await reopened.close();console.log(name+': nouvelle navigation origine 503, PV conservés PASS');
    await page.reload({timeout:12000});await page.getByRole('heading',{name:'Kobe Kozzo',exact:true}).waitFor({timeout:5000});
    await page.getByRole('button',{name:'Soin',exact:true}).click();await page.locator('.stats').getByText('78/83').waitFor();
    console.log(name+': origin HTTP 503, cached navigation and offline heal persisted PASS.');
    await ctx.close();ctx=null;ctx=await launch();page=ctx.pages()[0]||await ctx.newPage();
    await page.goto(url);await page.locator('.stats').getByText('78/83').waitFor({timeout:10000});
    console.log(name+': redémarrage complet avec origine déjà indisponible PASS.');
   }catch(e){console.log(name+': origin unavailable after process restart FAILED: '+e.message+' · document '+(await page.locator('body').innerText()).slice(0,160));throw e;}
  }finally{unavailable=false;await ctx?.close();await rm(dir,{recursive:true,force:true});}
 }
}finally{http.close();}
