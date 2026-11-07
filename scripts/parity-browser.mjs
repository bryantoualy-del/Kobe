import assert from 'node:assert/strict';
import {mkdir,readFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {extname,join} from 'node:path';
import {chromium,webkit} from 'playwright';

const server=createServer(async(req,res)=>{
 const path=new URL(req.url,'http://localhost').pathname;
 try{
  const bytes=await readFile(join('dist',path==='/'?'index.html':path));
  res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css', ".svg": "image/svg+xml",'.html':'text/html','.webp':'image/webp','.jpg':'image/jpeg'})[extname(path==='/'?'index.html':path)]||'application/octet-stream');
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
   const tab=async name=>{await page.getByRole('tab',{name,exact:true}).click();await page.waitForFunction(label=>[...document.querySelectorAll('[role=tab]')].some(el=>el.textContent===label&&el.getAttribute('aria-selected')==='true'),name);};
   const capture=name=>page.screenshot({path:'screenshots/'+engine.name()+'-v11-'+name+'.png'});
   await page.getByText('Prêt hors ligne',{exact:true}).waitFor();
   await capture('combat');
   assert.equal(await page.locator('.dragon-art').count(),0);
   assert.equal(await page.locator('[data-combat-view]').count(),1);
   assert.equal(await page.locator('[data-combat-view=resources],[data-combat-view=powers]').count(),0);
   assert.equal(await page.locator('.turn-more').count(),0);
   await page.getByRole('button',{name:'Lancer l’initiative'}).click();
   await page.waitForFunction(()=>JSON.parse(localStorage.getItem('kobe-companion:v1')).state.journal.at(-1)?.sourceId==='initiative-roll');
   await page.getByRole('button',{name:'Repos court',exact:true}).click();
   await page.getByRole('button',{name:'Annuler',exact:true}).click();
   const openStates=()=>page.locator('.turn-header [data-action=conditions]').click();
   const states=page.getByRole('dialog',{name:'États de Kobe'});
   const addState=async (id,duration='manual')=>{
    await states.locator('select[name=name]').selectOption(id);
    await states.locator('select[name=duration]').selectOption(duration);
    await states.getByRole('button',{name:'Ajouter',exact:true}).click();
    await states.locator('[data-remove-condition='+id+']').waitFor();
   };
   const closeStates=()=>states.getByRole('button',{name:'Fermer les états'}).click();
   const attack=page.locator('.turn-lane [data-cast=fire-bolt]');
   await openStates();
   await addState('stunned');
   await states.getByRole('button',{name:'Retirer Étourdi'}).waitFor();
   await page.waitForFunction(()=>document.querySelector('.condition-dialog li img')?.naturalWidth>0);
   await capture('conditions');
   await closeStates();
   assert.equal(await attack.isDisabled(),true);
   await openStates();
   await states.getByRole('button',{name:'Retirer Étourdi'}).click();
   await states.getByText('Aucun état actif.').waitFor();
   await closeStates();
   assert.equal(await attack.isEnabled(),true);
   await openStates();
   await addState('prone');
   await closeStates();
   assert.equal(await attack.isEnabled(),true);
   await openStates();
   await states.getByRole('button',{name:'Retirer À terre'}).click();
   await states.getByText('Aucun état actif.').waitFor();
   await addState('paralyzed','turns');
   await closeStates();
   assert.equal(await attack.isDisabled(),true);
   await page.getByRole('button',{name:'Fin de tour',exact:true}).click();
   await page.locator('.turn-header [data-action=conditions]').getByText('Aucun').waitFor();
   assert.equal(await attack.isEnabled(),true);
   await page.locator('[data-intent=Offensif]').click();
   await page.locator('[data-book-select=fire-bolt]').click();
   await page.locator('[data-spell-detail-id=fire-bolt] .attack-options summary').click();
   await page.locator('[name=signature-mode][value=advantage]').check();
   await page.locator('#signature-dice').fill('4 17');
   await page.emulateMedia({reducedMotion:'no-preference'});
   await page.locator('[data-cast=fire-bolt]').click();
   assert.equal(await page.locator('#ccDiceOverlay.open').count(),0);
   await page.emulateMedia({reducedMotion:'reduce'});
   assert.equal(await page.locator('.hit-roll').innerText(),'26');
   await capture('confirmation-jet');
   await page.keyboard.press('Escape');
   await page.locator('.turn-pending > summary').click();
   await page.getByRole('button',{name:'Saisir le résultat MJ'}).click();
   await page.locator('dialog[open] select[name=result]').selectOption('hit');
   await page.locator('dialog[open] button[type=submit]').click();
   await page.locator('dialog[open]').waitFor({state:'detached'});
   await page.getByRole('button',{name:'Repos long',exact:true}).first().click();
   await page.getByRole('button',{name:'Annuler',exact:true}).click();
   await page.getByRole('button',{name:'Repos long',exact:true}).first().click();
   await capture('confirmation-repos');
   await page.getByRole('button',{name:'Confirmer le repos long'}).click();
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

   await page.locator('#inventoryImportFile').setInputFiles(invFile);await page.locator('[data-dialog-accept]').click();
   await page.locator('#inventoryObjectList').getByText('Flûte').waitFor();
   await tab('Social');
   await page.locator('[data-social-view=profile]').click();await page.locator('[data-roll=Persuasion]').waitFor();
   assert.equal(await page.locator('[data-roll]').count(),31);
   await page.emulateMedia({reducedMotion:'no-preference'});
   await page.locator('[data-roll=Persuasion]').click();
   const overlay=page.locator('#ccDiceOverlay.open[data-dismissable="1"]');await overlay.waitFor();
   assert.deepEqual(await overlay.boundingBox(),{x:0,y:0,width:1180,height:820});
   assert.equal(await page.evaluate(()=>CompanionDiceTheme.primary),'#872F35');
   await capture('social-dice');await overlay.click();await page.emulateMedia({reducedMotion:'reduce'});
   await page.locator('#physical').check();
   for(const [name,mode,dice,total] of [['Persuasion','adv','4 17',30],['Représentation','normal','11',24],['Sauvegarde Dextérité','normal','12',18]]){
    if(name.startsWith('Sauvegarde'))await page.locator('[data-roll-pane=abilities]').click();
    await page.locator('[data-roll-mode='+mode+']').click();

    await page.locator('[data-roll="'+name+'"]').click();await page.locator('[name=answer]').fill(dice);await page.locator('[data-dialog-accept]').click();
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

   await page.locator('[data-delete-entry]').click();await page.locator('[data-dialog-accept]').click();
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

   await page.locator('#closeSession').click();await page.locator('[data-dialog-accept]').click();
   await page.locator('.session-archives summary').click();
   const archive=page.waitForEvent('download');
   await page.locator('[data-export-archive]').click();
   await (await archive).saveAs('screenshots/'+engine.name()+'-kobe-session.zip');
   for(const width of [375,390,430]){
    await page.setViewportSize({width,height:844});await tab('Combat');
    const next=await page.locator('[data-action=end-turn]').boundingBox();assert(next.x>=0&&next.x+next.width<=width,'end turn visible');
    const heal=await page.locator('[data-action=heal]').boundingBox(),temp=await page.locator('.tempstat').boundingBox();assert(heal.x+heal.width<=temp.x||heal.y>=temp.y+temp.height,'heal must not overlap temporary HP');
    await page.locator('[data-combat-view=kharvek]').click();
    const marks=await page.locator('.charge-mark').evaluateAll(ns=>ns.map(n=>n.getBoundingClientRect().y));assert.equal(new Set(marks).size,1,'seven charges on one row');
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile horizontal overflow');
    await capture('mobile-'+width);
    await tab('Journal');assert((await page.locator('#entryText').boundingBox()).y<600,'capture reachable without long header');
   }
   assert.deepEqual(errors,[]);
   console.log(engine.name()+': inventaire, 31 jets, expertise, avantage, sauvegarde physique, distribution, édition, suppression, portrait, reprise et ZIP archivé PASS');
  }finally{await browser.close();}
 }
}finally{server.close();}
