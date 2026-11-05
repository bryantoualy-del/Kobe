const CACHE='kobe-lot5-v1';
const FILES=['./src/ui/portrait.jpg','./src/ui/emblem.jpg','./src/kobe/table-correction.js','./src/kobe/connect.js','./src/ui/connect-ui.js','./','./index.html','./src/ui/styles.css','./src/ui/app.js','./src/ui/kharvek-ui.js','./src/ui/rhythm.js','./src/kobe/kharvek.js','./src/kobe/health.js','./src/ui/combat-ui.js','./src/kobe/combat.js','./src/kobe/spell-catalog.js','./src/kobe/spells.js','./src/kobe/spell-lifecycle.js','./src/ui/spell-ui.js','./src/kobe/model.js','./src/kobe/engine.js','./src/kobe/storage.js'];
const root=new URL('./',self.registration.scope);
const known=new Set(FILES.map(path=>new URL(path,root).pathname));
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 // Fetch fresh bytes for every entry on install; activate only after the entire shell is ready.
 await cache.addAll(FILES.map(file=>new Request(new URL(file,root),{cache:'reload'})));
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 await Promise.all((await caches.keys()).filter(k=>k.startsWith('kobe-')&&k!==CACHE).map(k=>caches.delete(k)));
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==root.origin||!known.has(url.pathname))return;
 event.respondWith((async()=>{
   const cache=await caches.open(CACHE);
   const file=req.mode==='navigate'&&(url.pathname===root.pathname||url.pathname===root.pathname+'index.html')
     ? new URL('./index.html',root).href : new URL(url.pathname,root).href;
   const hit=await cache.match(file,{ignoreVary:true});
   return hit||fetch(req);
 })());
});
