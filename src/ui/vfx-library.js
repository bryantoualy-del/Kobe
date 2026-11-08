// Declarative professional FX catalogue. An entry becomes available only when its local
// spritesheet is present and decodable. Never substitute a CSS animation silently.
import {preloadSheet,playSpriteSheet} from './sprite-vfx.js';
export const VFX_LIBRARY=Object.freeze({
 fireball:{name:'Boule de feu',phases:['gather','impact','dissipate'],license:'CC BY 4.0',author:'Viktor Hahn',source:'https://opengameart.org/content/spell-animation-spritesheets'},
 mantle:{name:'Manteau d’inspiration',phases:['circle','shield','dissipate'],license:'CC0',author:'Mikodrak',source:'https://lpc.opengameart.org/content/2d-spell-effects'},
 kharvek:{name:'Khar-Vek',phases:['pulse','heal','dissipate'],license:'CC0',author:'Mikodrak',source:'https://lpc.opengameart.org/content/2d-spell-effects'}
});
export function validateManifest(manifest){
 if(!manifest||typeof manifest!=='object')throw Error('Invalid VFX manifest');
 for(const [id,entry] of Object.entries(manifest)){
  if(!VFX_LIBRARY[id])throw Error('Unknown VFX '+id);
  if(!Array.isArray(entry.sequences)||entry.sequences.length<1)throw Error('Missing sequences');
  for(const sequence of entry.sequences){
   if(!sequence||typeof sequence.phase!=='string'||!VFX_LIBRARY[id].phases.includes(sequence.phase))throw Error('Invalid phase');
   if(!sequence.sheet)throw Error('Missing sheet');
  }
 }
 return manifest;
}
export async function playSequence(entry,{signal,intensity}={}){
 const active=[];
 for(const sequence of entry.sequences){
  if(signal?.aborted)break;
  try{
   await preloadSheet(sequence.sheet);
   const controller=new AbortController();
   const abort=()=>controller.abort();
   signal?.addEventListener('abort',abort,{once:true});
   const player=await playSpriteSheet(sequence.sheet,{signal:controller.signal,intensity});
   if(!player)break;
   active.push(player);
   await new Promise(resolve=>{
    const timeout=setTimeout(resolve,player.duration);
    controller.signal.addEventListener('abort',()=>{clearTimeout(timeout);resolve();},{once:true});
   });
   player.stop();
   signal?.removeEventListener('abort',abort);
  }catch(error){console.warn('Kobe VFX unavailable:',error);break;}
 }
 return active.length;
}
