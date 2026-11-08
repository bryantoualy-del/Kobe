importScripts('./offline-shell.js');
const CACHE='kobe-v11-fx5-'+self.KobeShellRevision;
const FX_FILES=['flame_02.png','magic_03.png','circle_05.png','spark_04.png'].map(name=>'./src/ui/fx/kenney/'+name);
const FILES=['./',...Object.keys(self.KobeShellAssets).map(path=>'./'+path),...FX_FILES,'./src/ui/fx/approved/fireball_clean_alpha.webp'];
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
   if(hit)return hit;
   // Installed worker scripts survive the WebKit 26.0 worker cache partition issue.
   const relative=new URL(file).pathname.slice(root.pathname.length);
   const packed=self.KobeShellAssets[relative];
   if(!packed)return fetch(req);
   const [type,compressed,encoded]=packed;
   const bytes=Uint8Array.from(atob(encoded),character=>character.charCodeAt(0));
   const body=compressed?new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')):bytes;
   return new Response(body,{headers:{'Content-Type':type}});
 })());
});
