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
      { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" }[
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
      const confirm = async () => {
        const submit=page.getByRole("button", { name: "Confirmer", exact: true });
        const form=await submit.evaluateHandle(button=>button.closest("form"));
        await submit.click();
        await page.waitForFunction(node=>!node.isConnected,form);
        await form.dispose();
      };
      const next = async () => {
        await page
          .getByRole("button", { name: "Fin de tour", exact: true })
          .click();

        
        await page
          .getByRole("button", { name: "Fin de tour", exact: true })
          .waitFor();
      };
      await page.goto(url);
      await page.getByText(/Sauvegarde locale · révision/).waitFor();
      await page
        .getByRole("tab", { name: "Sorts & pouvoirs", exact: true })
        .click();
      await page
        .getByRole("heading", { name: "Emplacements" })
        .waitFor();
      assert.equal(await page.locator("[data-spell-card]").count(), 19);
      await page.locator('[data-spell-filter="Soins"]').click();
      assert.equal(await page.locator("[data-spell-card]:visible").count(), 2);
      await page.locator('[data-spell-filter="Tous"]').click();
      await page.locator("#spell-search").fill("guerison");
      assert.equal(await page.locator("[data-spell-card]:visible").count(), 1);
      await page.locator("#spell-search").fill("");
      for (const [index, id] of [
        "fireball",
        "healing-word",
        "circle-of-power",
        "slow",
      ].entries()) {
        await page.locator(`[data-favorite="${id}"]`).click();
        await page.waitForFunction(
          (n) =>
            JSON.parse(localStorage.getItem("kobe-companion:v1")).state
              .preferences.favorites.length === n,
          index + 1,
        );
      }
      assert.equal(
        await page.locator('[data-favorite="fire-bolt"]').isDisabled(),
        true,
      );
      for (const target of ["Ennemi A", "Ennemi B"]) {
        await page
          .getByRole("button", { name: "Ajouter une cible", exact: true })
          .click();
        await page.getByLabel("Nom", { exact: true }).fill(target);
        await page.getByLabel("Type", { exact: true }).selectOption("enemy");
        await confirm();
      }
      const description=page.locator('[data-spell-card="circle-of-power"] details');
      await description.locator('summary').click();
      assert.match(await description.locator('a').getAttribute('href'),/vf=cercle-de-pouvoir$/);
      assert.equal(await page.locator('dialog[open]').count(),0);
      await mkdir("screenshots", { recursive: true });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({
        path: `screenshots/${name}-spellbook-viewport.png`,
      });
      await page.screenshot({
        path: `screenshots/${name}-spellbook.png`,
        fullPage: true,
      });
      await page.getByRole("tab", { name: "Combat", exact: true }).click();
      await page.locator(".favorites-panel").waitFor();
      assert.equal(
        await page.locator(".favorites-panel [data-spell-card]").count(),
        4,
      );
      const favoriteBox = await page.locator(".favorites-panel").boundingBox();
      const overview=await page.locator(".vitals").boundingBox();
      assert(overview.y>=0 && overview.y+overview.height<820,"all combat resources and economy visible with favorites");
      assert(
        favoriteBox.y >= 0 && favoriteBox.y + favoriteBox.height < 820,
        "4 favorites visible without scroll",
      );
      await page.screenshot({
        path: `screenshots/${name}-favorites-viewport.png`,
      });
      await page.screenshot({
        path: `screenshots/${name}-favorites.png`,
        fullPage: true,
      });
      await page.locator('[data-combat-view=resources]').click();
      // Set locally declared HP through real forms.
      for (const target of ["Ennemi A", "Ennemi B"]) {
        await page
          .getByRole("button", { name: "PV des cibles", exact: true })
          .click();
        await page
          .getByLabel("Cible", { exact: true })
          .selectOption({ label: target });
        await page.getByLabel("PV actuels", { exact: true }).fill("100");
        await page.getByLabel("PV maximum", { exact: true }).fill("100");
        await page.getByLabel("Informations confirmées à la table").check();
        await confirm();
      }
      await page.locator('[data-combat-view=offense]').click();
      await page.locator('[data-cast="fireball"]').click();
      await confirm();
      await page.getByLabel("Ennemi A", { exact: true }).check();
      await page.getByLabel("Ennemi B", { exact: true }).check();
      await page
        .getByLabel("Dés physiques (facultatif ; sinon jet automatique)")
        .fill("4 4 4 4 4 4 4 4");
      await page.screenshot({ path: `screenshots/${name}-casting-modal.png` });
      await confirm();
      assert.equal((await state()).slots[3], 2);
      await page.locator('[data-combat-view=resources]').click();
      for (const result of ["failure", "success"]) {
        await page.locator("[data-spell-resolve]").first().click();
        await page
          .getByLabel("Résultat annoncé par le MJ")
          .selectOption(result);
        await confirm();
      }
      assert.deepEqual(
        (await state()).combat.targets.map((t) => t.hp.current),
        [68, 84],
      );
      await next();
      await page.locator('[data-combat-view=offense]').click();
      await page.locator('[data-cast="circle-of-power"]').click();
      await confirm();
      await confirm();
      assert.equal((await state()).concentration.name, "Cercle de pouvoir");
      await page.reload();
      await page.getByText(/Sauvegarde locale · révision/).waitFor();
      assert.equal((await state()).concentration.name, "Cercle de pouvoir");
      assert.equal((await state()).preferences.favorites.length, 4);
      await next();
      await page.locator('[data-cast="slow"]').click();
      await confirm();
      await page.getByLabel("Ennemi A", { exact: true }).check();
      await page
        .getByLabel("Remplacer la concentration : Cercle de pouvoir")
        .check();
      await confirm();
      assert.equal((await state()).concentration.name, "Lenteur");
      assert(
        !(await state()).effects.some((e) => e.spellId === "circle-of-power"),
      );
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        "no horizontal overflow",
      );
      // The complete repertoire must remain reachable after a first controlled offline load.
      if (name === "chromium") {
        await page.evaluate(() => navigator.serviceWorker.ready);
        await page.reload();
        await page.getByText(/Sauvegarde locale · révision/).waitFor();
        await context.setOffline(true);
        await page.reload();
        await page.getByText(/Sauvegarde locale · révision/).waitFor();
        await page
          .getByRole("tab", { name: "Sorts & pouvoirs", exact: true })
          .click();
        await page
          .getByRole("heading", { name: "Emplacements" })
          .waitFor();
        assert.equal(await page.locator("[data-spell-card]").count(), 19);
      }
      assert.deepEqual(errors, []);
      console.log(
        name +
          ": Lot3 filters/details/4favorites/multi-target saves/HP/slots/concentration/reload/replacement/modal 1180x820 PASS" +
          (name === "chromium" ? " + offline PASS" : ""),
      );
      await context.close();
    } finally {
      await browser.close();
    }
  }
} finally {
  await new Promise((r) => server.close(r));
}
