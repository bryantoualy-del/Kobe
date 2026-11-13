import {runInNewContext} from 'node:vm';
import {readFile,stat} from 'node:fs/promises';
import {join} from 'node:path';
import {gunzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
const dir=join(process.cwd(),'dist');
const files=['index.html','sw.js','src/ui/app.js','src/ui/styles.css','src/kobe/model.js','src/kobe/engine.js','src/kobe/storage.js'];
for(const file of files)assert((await stat(join(dir,file))).size>0,file+' manquant');
const [html,app,css,sw]=await Promise.all(['index.html','src/ui/app.js','src/ui/styles.css','sw.js'].map(p=>readFile(join(dir,p),'utf8')));
for(const tab of ['Combat','Sorts & pouvoirs','Social','Journal'])assert(app.includes(tab),'onglet absent : '+tab);
for(const hex of ['#151419','#B86637','#872F35','#E5B963','#F0E5CE'])assert(css.includes(hex),'palette absente '+hex);
assert(html.includes('type="module"'));assert(!html.includes('https://'),'dépendance CDN');
const self={};
runInNewContext(await readFile(join(dir,'offline-shell.js'),'utf8'),{self});
for(const path of files.filter(p=>p!=='sw.js'))assert(Object.hasOwn(self.KobeShellAssets,path),'non précaché '+path);
assert(sw.includes('Object.keys(self.KobeShellAssets)'));
const manifestPath='site.webmanifest';
const manifest=JSON.parse(await readFile(join(dir,manifestPath),'utf8'));
assert.equal(manifest.display,'standalone');
assert.equal(manifest.start_url,'./');
assert.equal(manifest.scope,'./');
assert.equal(manifest.short_name,'Kobe Kozzo');
assert.match(html,/<meta name="apple-mobile-web-app-title" content="Kobe Kozzo">/);
assert.match(html,/<meta name="apple-mobile-web-app-capable" content="yes">/);
const linkedPath=(rel)=>html.match(new RegExp('<link rel="'+rel+'"[^>]+href="\\./([^"?]+)(?:\\?[^"]+)?"'))?.[1];
assert.equal(linkedPath('manifest'),manifestPath);
const icons=[
 {src:linkedPath('apple-touch-icon'),sizes:'180x180'},
 {src:linkedPath('icon'),sizes:'32x32'},
 ...manifest.icons
];
assert.deepEqual(manifest.icons.map(icon=>[icon.sizes,icon.purpose??'any']),[
 ['192x192','any'],['512x512','any'],['512x512','maskable']
]);
for(const {src,sizes} of icons){
 assert.ok(src,'lien d’icône absent');
 const path=src.replace(/^\.\//,'');
 const bytes=await readFile(join(dir,path));
 assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a',path+' doit être un PNG');
 assert.equal(bytes.readUInt32BE(16)+'x'+bytes.readUInt32BE(20),sizes,path+' dimensions');
 const [mime,compressed,encoded]=self.KobeShellAssets[path];
 assert.equal(mime,'image/png');
 assert.equal(compressed,false);
 assert.deepEqual(Buffer.from(encoded,'base64'),bytes,path+' cache hors ligne');
}
const [manifestType,manifestCompressed,manifestData]=self.KobeShellAssets[manifestPath];
assert.equal(manifestType,'application/manifest+json');
assert.equal(manifestCompressed,true);
assert.deepEqual(gunzipSync(Buffer.from(manifestData,'base64')),await readFile(join(dir,manifestPath)));


console.log('Contrôles build/cache/onglets/palette : PASS (vérification statique ; pas de navigateur réel).');
