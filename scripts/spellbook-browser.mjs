import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { join, extname } from "node:path";
import { chromium, webkit } from "playwright";
const server = createServer(async (req, res) => {
  try {
    const path = new URL(req.url, "http://localhost").pathname;
    const file = join(
      process.cwd(),
      "dist",
      path === "/" ? "index.html" : path,
    );
    res.setHeader(
      "Content-Type",
      { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml"  }[
        extname(file)
      ] ?? "application/octet-stream",
    );
    res.end(await readFile(file));
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const url = "http://127.0.0.1:" + server.address().port;
try {
  for (const [name, type] of [
    ["chromium", chromium],
    ["webkit", webkit],
  ]) {
    const browser = await type.launch({ headless: true });
    try {
      const context = await browser.newContext({
          viewport: { width: 1180, height: 820 },
        }),
        page = await context.newPage(),
        errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      const state = () =>
        page.evaluate(
          () => JSON.parse(localStorage.getItem("kobe-companion:v1")).state,
        );
      await page.goto(url);
      await page.getByRole('tab',{name:'Sorts & pouvoirs',exact:true}).click();
      await page.locator('.spell-slots > summary').waitFor();
      assert.equal(await page.locator('[data-spell-card]').count(),19);
      const cards=await page.locator('.grimoire-row').evaluateAll(rows=>rows.map(row=>row.getBoundingClientRect().height));
      assert(cards.every(height=>height>=44&&height<92),'compact tactile rows');
      assert.equal(await page.locator('.grimoire-detail [data-cast]').count(),1);
      await page.waitForFunction(()=>[...document.querySelectorAll('.grimoire-row img')].every(img=>img.complete&&img.naturalWidth>0));
      const glyphs=await page.locator('.grimoire-row img').evaluateAll(imgs=>imgs.map(img=>img.getAttribute('src')));
      assert.equal(new Set(glyphs).size,19);
      assert(glyphs.every(src=>src.endsWith('.svg')));
      await page.locator('[data-book-level]').selectOption('5');
      assert.equal(await page.locator('[data-spell-card]:visible').count(),2);
      await page.locator('[data-book-level]').selectOption('all');
      await page.locator('[data-spell-filter="Soins"]').click();
      assert.equal(await page.locator('[data-spell-card]:visible').count(),2);
      await page.locator('[data-spell-filter="Tous"]').click();
      await page.locator('#spell-search').fill('guerison');
      assert.equal(await page.locator('[data-spell-card]:visible').count(),1);
      await page.locator('#spell-search').fill('');
      for(const id of ['fireball','healing-word','circle-of-power','slow']){
        await page.locator('[data-favorite="'+id+'"]').click();
        await page.waitForFunction(id=>JSON.parse(localStorage.getItem('kobe-companion:v1')).state.preferences.favorites.includes(id),id);
      }
      await page.locator('[data-book-favorites]').click();
      assert.equal(await page.locator('[data-spell-card]:visible').count(),4);
      await page.locator('[data-book-select=circle-of-power]').click();
      assert.match(await page.locator('.grimoire-reference a').getAttribute('href'),/vf=cercle-de-pouvoir$/);
      await page.locator('[data-book-select=fireball]').click();
      const sheet=page.locator('[data-spell-detail-id=fireball]');
      await sheet.locator('[data-cast-level]').selectOption('5');
      assert(await sheet.locator('[data-cast=fireball]').isEnabled());
      await sheet.locator('[data-cast-level]').selectOption('3');
      await page.locator('[data-book-favorites]').click();
      await mkdir('screenshots',{recursive:true});
      await page.screenshot({path:'screenshots/'+name+'-spellbook-viewport.png'});
      await sheet.locator('[data-cast-level]').selectOption('4');
      await sheet.locator('[data-cast=fireball]').click();
      await page.waitForFunction(()=>JSON.parse(localStorage.getItem('kobe-companion:v1')).state.slots[4]===2);
      assert.equal(await page.locator('dialog[open],.spell-inline,[name=target]').count(),0);
      assert.equal((await state()).pendingResolutions.length,0);
      await page.screenshot({path:'screenshots/'+name+'-casting-modal.png'});
      await page.getByRole('tab',{name:'Combat',exact:true}).click();
      for(const id of ['fireball','healing-word','circle-of-power','slow']){
        await page.locator('.turn-commands [data-cast="'+id+'"]').waitFor();
      }
      assert.equal(await page.locator('[data-turn-lane=bonusAvailable] [data-cast=healing-word]').count(),1);
      await page.screenshot({path:'screenshots/'+name+'-favorites-viewport.png'});
      const next=async()=>{
        const before=(await state()).turn.startRevision;
        await page.getByRole('button',{name:'Fin de tour',exact:true}).click();
        await page.waitForFunction(n=>JSON.parse(localStorage.getItem('kobe-companion:v1')).state.turn.startRevision===n+1,before);
      };
      await next();await page.locator('[data-cast=circle-of-power]').click();
      await page.waitForFunction(()=>JSON.parse(localStorage.getItem('kobe-companion:v1')).state.concentration?.name==='Cercle de pouvoir');
      await page.reload();await page.locator('[data-cast=slow]').waitFor();await next();
      await page.locator('[data-cast=slow]').click();
      await page.waitForFunction(()=>JSON.parse(localStorage.getItem('kobe-companion:v1')).state.concentration?.name==='Lenteur');
      await next();await page.locator('[data-cast=healing-word]').click();
      await page.waitForFunction(()=>JSON.parse(localStorage.getItem('kobe-companion:v1')).state.slots[1]===3);
      assert.equal((await state()).hp.current,83);
      assert.deepEqual((await state()).combat.targets,[]);
      assert.equal(await page.locator('dialog[open],.spell-inline').count(),0);
      if(name==='chromium'){await page.evaluate(()=>navigator.serviceWorker.ready);await context.setOffline(true);await page.reload();}
      await page.getByRole('tab',{name:'Sorts & pouvoirs',exact:true}).click();
      await page.locator('.spell-slots > summary').waitFor();
      assert.equal(await page.locator('[data-spell-card]').count(),19);
      assert.deepEqual(errors,[]);
      console.log(name+': direct spell casts, upcast N4, concentration replacement, favorites, filters, no target forms and offline PASS');
      await context.close();
    } finally {
      await browser.close();
    }
  }
} finally {
  await new Promise((r) => server.close(r));
}
