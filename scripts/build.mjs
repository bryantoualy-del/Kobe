import './offline-shell.mjs';
import {cp,copyFile,mkdir,rm,readFile} from 'node:fs/promises';
import {join} from 'node:path';
const root=process.cwd(),out=join(root,'dist');
await rm(out,{recursive:true,force:true});
await mkdir(join(out,'src'),{recursive:true});
await cp(join(root,'src'),join(out,'src'),{recursive:true});
await copyFile(join(root,'index.html'),join(out,'index.html'));
for(const asset of ['companion-result-card.js','companion-result-card.css'])await copyFile(join(root,asset),join(out,asset));
await copyFile(join(root,'vfx-gallery.html'),join(out,'vfx-gallery.html'));
await copyFile(join(root,'vfx-gallery-v10.html'),join(out,'vfx-gallery-v10.html'));
await copyFile(join(root,'kobe-fx-direct-20261108.html'),join(out,'kobe-fx-direct-20261108.html'));
await copyFile(join(root,'test-runes-kobe-v5.html'),join(out,'test-runes-kobe-v5.html'));
await copyFile(join(root,'test-runes-anneau-v6.html'),join(out,'test-runes-anneau-v6.html'));
await copyFile(join(root,'offline-shell.js'),join(out,'offline-shell.js'));
await copyFile(join(root,'sw.js'),join(out,'sw.js'));
const html=await readFile(join(out,'index.html'),'utf8');
for(const file of ['./src/ui/styles.css','./src/ui/app.js']){
 if(!html.includes(file))throw new Error('Entrée absente: '+file);
}
console.log('Build autonome terminé : dist/ (aucune dépendance CDN).');
