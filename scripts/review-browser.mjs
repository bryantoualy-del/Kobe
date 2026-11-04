// Produce a compact index of the actual viewport captures in the evidence artifact.
import {readFile,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const names=['favorites-viewport','spellbook-viewport','casting-modal','kharvek-0','kharvek-3','kharvek-6'];
const captures=await Promise.all(names.map(async n=>({name:n,image:'data:image/png;base64,'+(await readFile('screenshots/webkit-'+n+'.png')).toString('base64')})));
const browser=await chromium.launch();try{
 const page=await browser.newPage();
 const jpg=await page.evaluate(async captures=>{
  const canvas=document.createElement('canvas');canvas.width=1180;canvas.height=1080;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#151419';ctx.fillRect(0,0,1180,1080);
  for(const [i,item] of captures.entries()){
   const image=new Image();image.src=item.image;await image.decode();
   const w=Math.min(580/image.width,330/image.height),x=i%2*590,y=Math.floor(i/2)*360;
   ctx.fillStyle='#F0E5CE';ctx.font='16px sans-serif';ctx.fillText(item.name,x+8,y+19);
   ctx.drawImage(image,x+5,y+25,image.width*w,image.height*w);
  }
  return canvas.toDataURL('image/jpeg',.72).split(',')[1];
 },captures);
 await writeFile('screenshots/lot5-review.jpg',Buffer.from(jpg,'base64'));
 if(process.env.REVIEW_FRAME==='1')console.log('KOBE_FRAME:'+jpg+':END_FRAME');
}finally{await browser.close();}
