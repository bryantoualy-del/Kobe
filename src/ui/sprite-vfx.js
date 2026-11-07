// Frame-accurate sprite-sheet playback; presentation only, no mechanics or network.
export function validateSheet(s){
 if(!s||typeof s.url!=='string'||!s.url.startsWith('./')||s.url.includes('..'))throw Error('Local asset required');
 for(const key of ['frameWidth','frameHeight','frames','columns','fps'])if(!Number.isSafeInteger(s[key])||s[key]<1)throw Error('Invalid '+key);
 if(s.fps>120||s.frames>1024||s.frameWidth>2048||s.frameHeight>2048)throw Error('Asset limits exceeded');
 if(s.frameDurations&&(!Array.isArray(s.frameDurations)||s.frameDurations.length!==s.frames||s.frameDurations.some(n=>!Number.isFinite(n)||n<=0)))throw Error('Invalid durations');
 return s;
}
export function frameAtElapsed(s,ms){
 validateSheet(s);
 const durations=s.frameDurations||Array(s.frames).fill(1000/s.fps);
 const total=durations.reduce((a,b)=>a+b,0);
 const t=s.loop?Math.max(0,ms)%total:Math.min(Math.max(0,ms),total-0.001);
 let acc=0;for(let i=0;i<durations.length;i++){acc+=durations[i];if(t<acc)return i;}
 return s.frames-1;
}
export function sheetDuration(s){validateSheet(s);return s.frameDurations?s.frameDurations.reduce((a,b)=>a+b,0):s.frames*1000/s.fps;}
export async function preloadSheet(s){
 validateSheet(s);
 const image=new Image();image.decoding='async';
 image.src=new URL(s.url,import.meta.url).href;
 await image.decode();
 const rows=Math.ceil(s.frames/s.columns);
 if(image.naturalWidth<s.columns*s.frameWidth||image.naturalHeight<rows*s.frameHeight)throw Error('Sprite sheet dimensions invalid');
 return image;
}
export async function playSpriteSheet(s,{container=document.body,intensity='normal',signal}={}){
 validateSheet(s);
 if(signal?.aborted)return false;
 if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return false;
 const image=await preloadSheet(s);
 if(signal?.aborted)return false;
 const layer=document.createElement('div');
 layer.className='kobe-sprite-layer';
 layer.setAttribute('aria-hidden','true');
 Object.assign(layer.style,{position:'fixed',inset:'0',pointerEvents:'none',zIndex:'180',overflow:'hidden',display:'grid',placeItems:'center'});
 const canvas=document.createElement('canvas');
 const ratio=Math.min(window.devicePixelRatio||1,2);
 const scale=intensity==='spectacular'?1.35:intensity==='subtle'?.7:1;
 const base=Math.min(window.innerWidth*.78,window.innerHeight*.72,520)*scale;
 const width=base,height=base*s.frameHeight/s.frameWidth;
 canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
 Object.assign(canvas.style,{width:Math.round(width)+'px',height:Math.round(height)+'px',maxWidth:'95vw',maxHeight:'85vh'});
 layer.append(canvas);container.append(layer);
 const ctx=canvas.getContext('2d',{alpha:true});
 if(!ctx){layer.remove();return false;}
 ctx.setTransform(ratio,0,0,ratio,0,0);ctx.imageSmoothingEnabled=s.smoothing!==false;
 let raf,done=false,start;
 const duration=sheetDuration(s);
 const abort=()=>stop();
 const stop=()=>{if(done)return;done=true;cancelAnimationFrame(raf);layer.remove();signal?.removeEventListener('abort',abort);};
 signal?.addEventListener('abort',abort,{once:true});
 const draw=time=>{
  if(done)return;
  if(start===undefined)start=time;
  const elapsed=time-start;
  if(!s.loop&&elapsed>=duration){stop();return;}
  const frame=frameAtElapsed(s,elapsed);
  ctx.clearRect(0,0,width,height);
  const col=frame%s.columns,row=Math.floor(frame/s.columns);
  ctx.drawImage(image,col*s.frameWidth,row*s.frameHeight,s.frameWidth,s.frameHeight,0,0,width,height);
  raf=requestAnimationFrame(draw);
 };
 raf=requestAnimationFrame(draw);
 return {stop,duration};
}
