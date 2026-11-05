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
 const confirm=async()=>{await page.locator('dialog [type=submit]').click();await page.locator('dialog[open]').waitFor({state:'detached'});};
 const checkHealing=async()=>{await page.locator('[name=healingEligible]').check();await page.locator('[name=drumReady]').check();};
 const next=async()=>{await page.getByRole('button',{name:'Fin de tour',exact:true}).click();page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Début de mon tour',exact:true}).click();await page.getByRole('button',{name:'Fin de tour',exact:true}).waitFor();};
 const correct=async value=>{await page.locator('[data-kharvek=correct]').click();await page.locator('[name=value]').fill(String(value));await page.locator('[name=reason]').fill('Recette visuelle');await confirm();};
 await page.goto('http://127.0.0.1:'+server.address().port);await page.getByText(/Sauvegarde locale · révision/).waitFor();
 await mkdir('screenshots',{recursive:true});
 for(const charges of [0,1,2,3,4,5,6]){await correct(charges);assert.equal(await page.locator('.charge-mark.lit').count(),charges);assert.equal(await page.locator('[data-charge-count]').textContent(),`${charges} / 6`);assert.equal(await page.locator('svg[data-dragon]').getAttribute('data-dragon'),charges<2?'dormant':charges<4?'awakening':charges<6?'coiling':'complete');if([0,3,6].includes(charges)){await page.locator('#kharvek').evaluate(el=>el.scrollIntoView({block:'center'}));await page.locator('#kharvek').screenshot({path:`screenshots/${name}-kharvek-${charges}.png`});}}
 assert.equal(await page.locator('.dragon-illustration').evaluate(e=>getComputedStyle(e).animationName),'none');
 // Explicit no-animation control also works independently of the OS preference.
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.locator('.kharvek-controls summary').click();await page.locator('[data-still]').check();assert.equal(await page.locator('.dragon-illustration').evaluate(e=>getComputedStyle(e).animationName),'none');
 // Damage Kobe to demonstrate actual healing through a direct button; cancel first.
 await page.locator('#amount').fill('40');await page.getByRole('button',{name:'Dégâts',exact:true}).click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('kobe-companion:v1')).state.hp.current===43);
 await page.locator('[data-kharvek=pulse]').click();await page.getByRole('button',{name:'Annuler',exact:true}).click();assert.equal((await state()).resources.charges,6);
 await page.locator('[data-kharvek=pulse]').click();await page.getByLabel('Kobe',{exact:true}).check();await checkHealing();await page.locator('[name=healRolls]').fill('4 5 6');await page.locator('dialog[open]').screenshot({path:`screenshots/${name}-pulse-confirmation.png`});
 await page.locator('dialog [type=submit]').evaluate(b=>{b.click();b.click();});await page.locator('dialog[open]').waitFor({state:'detached'});
 assert.equal((await state()).hp.current,63);assert.equal((await state()).resources.charges,5);assert.equal((await state()).journal.filter(e=>e.sourceId==='kharvek-power').length,1);assert.equal(await page.locator('[data-kharvek=pulse]').isDisabled(),true);
 // Declare two allies and their HP through existing forms.
 for(const target of ['Roark','Jorakai']){await page.getByText('Bénéficiaires et ennemis · suivi local',{exact:true}).click();await page.locator('[data-combat=target-save]').click();await page.getByLabel('Nom',{exact:true}).fill(target);await confirm();await page.getByRole('button',{name:'PV des cibles',exact:true}).click();await page.getByLabel('Cible',{exact:true}).selectOption({label:target});await page.getByLabel('PV actuels',{exact:true}).fill('10');await page.getByLabel('PV maximum',{exact:true}).fill('50');await page.getByLabel('Informations confirmées à la table').check();await confirm();}
 await next();await page.locator('[data-kharvek=rally]').click();for(const t of ['Kobe','Roark','Jorakai'])await page.getByLabel(t,{exact:true}).check();await checkHealing();await page.locator('[name=healRolls]').fill('4 5');await confirm();
 assert.equal((await state()).hp.current,77);assert.deepEqual((await state()).combat.targets.map(t=>t.hp.current),[24,24]);assert.equal((await state()).resources.charges,2);assert.deepEqual((await state()).journal.at(-1).rolls,[4,5]);
 // Bonus is still available: combine Manteau with the survivor upgrade in one confirmation.
 await page.locator('[data-kharvek=survivors]').click();await page.getByLabel('Roark',{exact:true}).check();await page.locator('[name=eligible]').check();const roark=(await state()).combat.targets[0].id;await page.locator('[name=survivorTargetId]').selectOption(roark);await checkHealing();await page.locator('[name=healRolls]').fill('8');await page.locator('dialog[open]').screenshot({path:`screenshots/${name}-survivors-confirmation.png`});await confirm();
 let s=await state();assert.equal(s.combat.targets[0].hp.current,37);assert.equal(s.combat.targets[0].hp.temp,11);assert.equal(s.resources.charges,1);assert.equal(s.resources.inspiration,4);assert.equal(s.economy.bonusAvailable,false);assert.equal(s.journal.at(-1).costs.charges,1);assert.equal(s.journal.at(-1).costs.inspiration,1);
 await page.reload();await page.getByText(/Sauvegarde locale · révision/).waitFor();assert.equal((await state()).resources.charges,1);assert.equal((await state()).combat.targets[0].hp.current,37);
 await next();
 // P1: one/three beats open only a draft. Two beats never launch anything.
 await page.locator('.kharvek-controls summary').click();await page.locator('[data-rhythm-enabled]').check();
 await page.locator('[data-drum]').click();await page.locator('dialog h2').filter({hasText:'Pulsation réparatrice'}).waitFor();assert.equal((await state()).resources.charges,1);await page.getByRole('button',{name:'Annuler',exact:true}).click();
 await page.locator('[data-drum]').click();await page.locator('[data-drum]').click();await page.getByText('2 frappes : séquence invalide · aucune dépense',{exact:true}).waitFor();assert.equal(await page.locator('dialog[open]').count(),0);
 await correct(6);
 await page.locator('[data-drum]').click();await page.locator('[data-drum]').click();await page.locator('[data-drum]').click();await page.locator('dialog h2').filter({hasText:'Rythme de ralliement'}).waitFor();assert.equal((await state()).resources.charges,6);await page.getByRole('button',{name:'Annuler',exact:true}).click();
 await page.locator('.kharvek-controls summary').click();await page.locator('[data-drum]').click();await page.locator('[data-rhythm-reset]').click();await page.waitForTimeout(900);assert.equal(await page.locator('dialog[open]').count(),0);
 await correct(0);assert.equal(await page.locator('[data-kharvek=rally]').isDisabled(),true);assert.equal(await page.locator('[data-kharvek=survivors]').isDisabled(),true);
 await page.locator('[data-kharvek=dawn]').click();await confirm();assert.equal((await state()).resources.charges,6);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'iPad horizontal overflow');
 for(const button of await page.locator('.power-list button').all()){const box=await button.boundingBox();assert(box.height>=44);}
 await page.locator('#kharvek').evaluate(el=>el.scrollIntoView({block:'center'}));await page.locator('#kharvek').screenshot({path:`screenshots/${name}-kharvek-complete.png`});
 if(name==='chromium'){await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await page.getByText(/Sauvegarde locale · révision/).waitFor();await context.setOffline(true);await page.reload();await page.getByText(/Sauvegarde locale · révision/).waitFor();assert.equal(await page.locator('.charge-mark.lit').count(),6);await page.locator('[data-kharvek=pulse]').click();await page.getByLabel('Kobe',{exact:true}).check();await checkHealing();await page.locator('[name=healRolls]').fill('1 1 1');await confirm();assert.equal((await state()).resources.charges,5);}
 await page.getByRole('tab',{name:'Journal',exact:true}).click();await page.getByRole('heading',{name:'Journal de session'}).waitFor();await page.screenshot({path:`screenshots/${name}-kharvek-journal.png`,fullPage:true});
 assert.deepEqual(errors,[]);console.log(`${name}: P0 direct powers/capped shared healing/Manteau/single spend/double submit/cancel/reload/dawn/0–6 visual/reduced motion/iPad1180x820 PASS; P1 1/2/3 beats/reset PASS${name==='chromium'?'; offline power PASS':''}`);
 await context.close();
 }finally{await browser.close();}
}}finally{await new Promise(r=>server.close(r));}
