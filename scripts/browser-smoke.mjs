import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {join,extname,normalize,sep} from 'node:path';
import {chromium,webkit} from 'playwright';

const root=join(process.cwd(),'dist');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css', ".svg": "image/svg+xml",'.json':'application/json'};
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
   const context=await browser.newContext({serviceWorkers:'allow',viewport:{width:1180,height:820}});
   const page=await context.newPage(), errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(address);
   await page.getByRole('heading',{name:'Kobe Kozzo'}).waitFor();
   for(const tab of ['Combat','Sorts & pouvoirs','Social','Journal']) {
    await page.getByRole('tab',{name:tab}).click();
    await page.waitForFunction(label => [...document.querySelectorAll('[role="tab"]')].some(el => el.textContent === label && el.getAttribute('aria-selected') === 'true'), tab);
   }
   await page.getByRole('tab',{name:'Combat'}).click();
   await page.locator('[data-view=combat]').waitFor();
   await page.getByRole('button',{name:'Dégâts',exact:true}).click();await page.locator('[name=answer]').fill('10');await page.locator('[data-dialog-accept]').click();
   await page.locator('#hp[value="73"]').waitFor();
   await page.reload();
   await page.locator('#hp[value="73"]').waitFor();
   await page.getByRole('tab',{name:'Social'}).click();
   await page.getByLabel('Notes de Kobe').fill('Roark à retrouver.');
   await page.waitForFunction(() => JSON.parse(localStorage.getItem('kobe-companion:v1') || '{}').state?.notes === 'Roark à retrouver.');
   await page.reload();
   assert.equal(await page.getByLabel('Notes de Kobe').inputValue(),'Roark à retrouver.');
   await page.getByRole('tab',{name:'Journal'}).click();
   await page.getByRole('tab',{name:'Journal mécanique',exact:true}).click();
   await page.locator('.rpg-journal-action > p').filter({hasText:'10 dégâts reçus'}).first().waitFor();
   // Ensure app shell is cached and local state survives loss of network after initial installation.
   await page.waitForFunction(()=>navigator.serviceWorker.controller!==null,{timeout:15000});
   if(label==='chromium'){
    await context.setOffline(true);
    await page.reload();
    await page.getByRole('tab',{name:'Journal',exact:true}).waitFor();
    assert.equal(await page.getByRole('tab',{name:'Journal',exact:true}).getAttribute('aria-selected'),'true');
    await page.getByRole('tab',{name:'Combat',exact:true}).click();
    await page.getByRole('heading',{name:'Kobe Kozzo',exact:true}).waitFor();
    await page.locator('#hp[value="73"]').waitFor();
    await context.setOffline(false);
   } else {
    // Playwright WebKit on Linux fails internally on offline page.reload().
    // Keep online persistence coverage; real offline Safari remains an explicit manual acceptance.
    await page.reload();
    await page.getByRole('tab',{name:'Journal',exact:true}).waitFor();
    assert.equal(await page.getByRole('tab',{name:'Journal',exact:true}).getAttribute('aria-selected'),'true');
    await page.getByRole('tab',{name:'Combat',exact:true}).click();
    await page.getByRole('heading',{name:'Kobe Kozzo',exact:true}).waitFor();
    await page.locator('#hp[value="73"]').waitFor();
   }
   await page.locator('.turn-commands [data-combat=inspiration]').click();
   await page.waitForFunction(()=>JSON.parse(localStorage.getItem('kobe-companion:v1')).state.resources.inspiration===4);
   assert.equal(await page.locator('dialog[open]').count(),0);
   await page.reload();await page.getByRole('button',{name:'Fin de tour',exact:true}).click();
   await page.locator('.turn-commands [data-combat=mantle]').click();
   await page.waitForFunction(()=>JSON.parse(localStorage.getItem('kobe-companion:v1')).state.resources.inspiration===3);
   assert.equal(await page.locator('dialog[open],.spell-inline').count(),0);
   assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('kobe-companion:v1')).state.combat.targets),[]);
   if(label==='chromium')await context.setOffline(true);
   await page.reload();
   await page.locator('.support-cockpit').waitFor();
   const actionBox=await page.locator('[data-cast=fire-bolt]').boundingBox();
   assert.ok(actionBox.y+actionBox.height<=820,'primary action visible on iPad viewport');
   await mkdir('screenshots',{recursive:true});
   await page.screenshot({path:'screenshots/'+label+'-combat.png',fullPage:true});
   await page.getByRole('tab',{name:'Social',exact:true}).click();
   await page.getByRole('heading',{name:'Représentation captivante',exact:true}).waitFor();
   await page.screenshot({path:'screenshots/'+label+'-social.png',fullPage:true});
   await page.getByRole('tab',{name:'Journal',exact:true}).click();
   await page.locator('.rpg-journal-action > p').filter({hasText:'Manteau : 11 PV temporaires'}).first().waitFor();
   await page.screenshot({path:'screenshots/'+label+'-journal.png',fullPage:true});
   console.log(label+': Direct Inspiration, Manteau, no targeting, reload and screenshots PASS');
   assert.deepEqual(errors,[],label+' errors');
   await context.close();
   console.log(label+': five tabs, persistence, journal PASS'+(label==='chromium'?', offline reload PASS':', offline reload unverified (Playwright WebKit limitation)'));
  } finally {await browser.close();}
 }
}catch(e){failures++;console.error(e);process.exitCode=1;}
finally{await new Promise(resolve=>server.close(resolve));}
if(!failures)console.log('Real browser smoke PASS');

