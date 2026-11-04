const CACHE='kobe-lot5-v1';
const FILES=['./src/kobe/table-correction.js','./src/kobe/connect.js','./src/ui/connect-ui.js','./','./index.html','./src/ui/styles.css','./src/ui/app.js','./src/ui/kharvek-ui.js','./src/ui/rhythm.js','./src/kobe/kharvek.js','./src/kobe/health.js','./src/ui/combat-ui.js','./src/kobe/combat.js','./src/kobe/spell-catalog.js','./src/kobe/spells.js','./src/kobe/spell-lifecycle.js','./src/ui/spell-ui.js','./src/kobe/model.js','./src/kobe/engine.js','./src/kobe/storage.js'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES))));
self.addEventListener('activate',event=>event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('kobe-')&&k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()])));
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;
 event.respondWith(caches.match(request).then(hit=>hit||fetch(request)));
});

