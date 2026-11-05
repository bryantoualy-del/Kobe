import assert from 'node:assert/strict';
import {mkdir,readFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {extname,join} from 'node:path';
import {chromium,webkit} from 'playwright';

const server=createServer(async(req,res)=>{
 const path=new URL(req.url,'http://localhost').pathname;
 try{
  const bytes=await readFile(join('dist',path==='/'?'index.html':path));
  res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.webp':'image/webp','.jpg':'image/jpeg'})[extname(path==='/'?'index.html':path)]||'application/octet-stream');
  res.end(bytes);
 }catch{res.writeHead(404).end();}
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
await mkdir('screenshots',{recursive:true});
const url='http://127.0.0.1:'+server.address().port+'/';
const roster={v:1,people:['Roark','Absent'].map(name=>({name,id:name,path:'02 - Personnages/PNJ/'+name+'.md',status:'Actif'}))};
try{
 for(const engine of [chromium,webkit]){
  const browser=await engine.launch();
  try{
   const context=await browser.newContext({viewport:{width:1180,height:820},hasTouch:true,reducedMotion:'reduce'});
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(url+'#roster='+Buffer.from(JSON.stringify(roster)).toString('base64url'));
   const tab=name=>page.getByRole('tab',{name,exact:true}).click();
   const capture=name=>page.screenshot({path:'screenshots/'+engine.name()+'-v11-'+name+'.png'});
   await page.getByText('Prêt hors ligne',{exact:true}).waitFor();
   await capture('combat');
   assert.equal(await page.locator('.dragon-art').count(),0);
   await page.locator('#signature-mode').selectOption('advantage');
   await page.locator('#signature-dice').fill('4 17');
   await page.locator('[data-signature]').click();
   assert.equal(await page.locator('[name=attackMode]').inputValue(),'advantage');
   assert.equal(await page.locator('[name=attackRolls]').inputValue(),'4 17');
   await page.locator('[data-cancel]').click();
   await tab('Social');await page.locator('[data-social-view=inventory]').click();
   await page.locator('#inventoryAdd').click();
   await page.locator('#inventoryEditName').fill('Flûte');
   await page.locator('#inventoryEditCategory').selectOption('social');
   await page.locator('#inventoryEditNotes').fill('Instrument en cuivre');
   await page.locator('#inventorySave').click();
   await page.locator('#inventoryObjectList').getByText('Flûte').click();
   const invDownload=page.waitForEvent('download');
   await page.locator('#inventoryExport').click();
   const invFile=await (await invDownload).path();
   await page.locator('[data-inventory-delete]').last().click();
   page.once('dialog',d=>d.accept());
   await page.locator('#inventoryImportFile').setInputFiles(invFile);
   await page.locator('#inventoryObjectList').getByText('Flûte').waitFor();
   await tab('Social');
   await page.locator('[data-social-view=profile]').click();await page.locator('[data-roll=Persuasion]').waitFor();
   assert.equal(await page.locator('[data-roll]').count(),31);
   await page.locator('#physical').check();
   for(const [name,mode,dice,total] of [['Persuasion','adv','4 17',30],['Représentation','normal','11',24],['Sauvegarde Dextérité','normal','12',18]]){
    if(name.startsWith('Sauvegarde'))await page.locator('[data-roll-pane=abilities]').click();
    await page.locator('[data-roll-mode='+mode+']').click();
    page.once('dialog',d=>d.accept(dice));
    await page.locator('[data-roll="'+name+'"]').click();
    await page.waitForFunction(total=>document.querySelector('output.ribbon')?.textContent.endsWith('= '+total),total);
   }
   await page.locator('[data-roll-pane=skills]').click();await page.evaluate(()=>scrollTo(0,0));await capture('social');
   await tab('Journal');
   await page.locator('#sessionTitle').fill('Le retour à Qorrashi');
   await page.locator('#sessionNotes').fill('Retrouver la piste de Jorakai.');
   await page.locator('#entryText').fill('Premier indice');
   await page.locator('#addEntry').click();
   await page.locator('[data-edit-entry]').click();
   await page.locator('#entryText').fill('Indice corrigé');
   await page.locator('#addEntry').click();
   page.once('dialog',d=>d.accept());
   await page.locator('[data-delete-entry]').click();
   await page.locator('[data-touch-person="Roark"]').click();
   await page.locator('#entryType').selectOption('PNJ');
   await page.locator('#entryPerson').selectOption('Roark');
   await page.locator('#entryPnjKind').selectOption('localisation');
   await page.locator('#entryText').fill('Vu aux Trois Soupapes.');
   await page.locator('#addEntry').click();
   await page.locator('#addPerson').click();
   await page.locator('#personEditor [name=name]').fill('Archiviste');
   await page.locator('#personEditor [name=portrait]').setInputFiles('src/ui/portrait.jpg');
   await page.locator('#personEditor [value=save]').click();
   await page.locator('#peopleList img').waitFor();
   await page.reload();
   await page.locator('#peopleList img').waitFor();
   assert.equal(await page.locator('#sessionNotes').inputValue(),'Retrouver la piste de Jorakai.');
   await capture('journal');
   page.once('dialog',d=>d.accept());
   await page.locator('#closeSession').click();
   await page.locator('.session-archives summary').click();
   const archive=page.waitForEvent('download');
   await page.locator('[data-export-archive]').click();
   await (await archive).saveAs('screenshots/'+engine.name()+'-kobe-session.zip');
   assert.deepEqual(errors,[]);
   console.log(engine.name()+': inventaire, 31 jets, expertise, avantage, sauvegarde physique, distribution, édition, suppression, portrait, reprise et ZIP archivé PASS');
  }finally{await browser.close();}
 }
}finally{server.close();}
