import {cp,copyFile,mkdir,rm,readFile} from 'node:fs/promises';
import {join} from 'node:path';
const root=process.cwd(),out=join(root,'dist');
await rm(out,{recursive:true,force:true});
await mkdir(join(out,'src'),{recursive:true});
await cp(join(root,'src'),join(out,'src'),{recursive:true});
await copyFile(join(root,'index.html'),join(out,'index.html'));
await copyFile(join(root,'sw.js'),join(out,'sw.js'));
const html=await readFile(join(out,'index.html'),'utf8');
for(const file of ['./src/ui/styles.css','./src/ui/app.js']){
 if(!html.includes(file))throw new Error('Entrée absente: '+file);
}
console.log('Build autonome terminé : dist/ (aucune dépendance CDN).');
