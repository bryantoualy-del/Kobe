// Kobe FX pilot — presentation only. Never changes combat state or sends network events.
// Kenney CC0 local PNG textures + DOM animation: no remote assets, no runtime dependencies and no audio.
const STYLE = `
/* Genuine Kenney Particle Pack CC0 textures, vendored locally. */
.kobe-vfx__particle{background-image:url('./fx/kenney/spark_04.png');background-size:contain;background-position:center;background-repeat:no-repeat;background-color:transparent!important;border-radius:0!important;filter:drop-shadow(0 0 5px var(--c))}
.kobe-vfx__ring{border:0!important;box-shadow:none!important;background:url('./fx/kenney/circle_05.png') center/contain no-repeat;filter:drop-shadow(0 0 18px #e5b963)}
.kobe-vfx--fireball .kobe-vfx__core{background-image:url('./fx/kenney/flame_02.png')!important;background-size:contain!important;background-position:center!important;background-repeat:no-repeat!important;filter:drop-shadow(0 0 28px #b86637)}
.kobe-vfx--mantle .kobe-vfx__core,.kobe-vfx--kharvek .kobe-vfx__core{background-image:url('./fx/kenney/magic_03.png')!important;background-size:contain!important;background-position:center!important;background-repeat:no-repeat!important;filter:drop-shadow(0 0 20px #e5b963)}
.kobe-vfx--mantle .kobe-vfx__ring{filter:drop-shadow(0 0 20px #e5b963)}
.kobe-vfx--kharvek .kobe-vfx__ring{filter:drop-shadow(0 0 22px #b86637)}

.kobe-vfx{position:fixed;inset:0;z-index:180;pointer-events:none;overflow:hidden;contain:layout style paint}
.kobe-vfx__veil{position:absolute;inset:0;background:radial-gradient(circle at 50% 48%,#b8663730,transparent 52%);animation:kfx-veil .9s ease-out both}
.kobe-vfx__core{position:absolute;left:50%;top:48%;width:110px;height:110px;margin:-55px;border-radius:50%;filter:blur(2px);animation:kfx-core 1.1s cubic-bezier(.16,.8,.2,1) both}
.kobe-vfx--fireball .kobe-vfx__core{background:radial-gradient(circle,#fff3b0 0%,#e5b963 16%,#b86637 36%,#872f35 60%,transparent 72%);box-shadow:0 0 70px 25px #872f357d}
.kobe-vfx--mantle .kobe-vfx__core{background:radial-gradient(circle,#fff5cc,#e5b9634d 42%,transparent 70%);box-shadow:0 0 55px #e5b96375}
.kobe-vfx--kharvek .kobe-vfx__core{background:radial-gradient(circle,#f0e5ce,#b86637 28%,#872f3580 54%,transparent 72%);box-shadow:0 0 68px #b86637ad}
.kobe-vfx__ring{position:absolute;left:50%;top:48%;width:140px;height:140px;margin:-70px;border:2px solid #e5b963;border-radius:50%;box-shadow:0 0 18px #b86637,inset 0 0 18px #872f35;animation:kfx-ring 1.05s ease-out both}
.kobe-vfx--mantle .kobe-vfx__ring{border-style:dashed}
.kobe-vfx--kharvek .kobe-vfx__ring{border-width:5px;border-color:#b86637}
.kobe-vfx__particle{position:absolute;left:50%;top:48%;width:var(--s);height:var(--s);border-radius:50%;background:var(--c);box-shadow:0 0 12px var(--c);animation:kfx-spark 1.12s ease-out both;animation-delay:var(--delay)}
.kobe-vfx__caption{position:absolute;left:50%;top:calc(48% + 110px);transform:translateX(-50%);white-space:nowrap;max-width:90vw;overflow:hidden;text-overflow:ellipsis;color:#f0e5ce;text-shadow:0 2px 12px #000;font:700 clamp(15px,3vw,22px) Georgia,serif;letter-spacing:.04em;animation:kfx-caption 1.25s ease-out both}
@keyframes kfx-veil{0%{opacity:0}15%{opacity:1}100%{opacity:0}}
@keyframes kfx-core{0%{opacity:0;transform:scale(.2)}26%{opacity:1;transform:scale(1.1)}100%{opacity:0;transform:scale(2.5)}}
@keyframes kfx-ring{0%{opacity:0;transform:scale(.25) rotate(0)}25%{opacity:1}100%{opacity:0;transform:scale(4) rotate(24deg)}}
@keyframes kfx-spark{0%{opacity:0;transform:translate(0,0) scale(.3)}20%{opacity:1}100%{opacity:0;transform:translate(var(--x),var(--y)) scale(.1)}}
@keyframes kfx-caption{0%{opacity:0;transform:translate(-50%,12px)}25%{opacity:1;transform:translate(-50%,0)}80%{opacity:1}100%{opacity:0}}
@media(prefers-reduced-motion:reduce){.kobe-vfx{display:none}}
`;
const LABELS={fireball:'Boule de feu',mantle:'Manteau d’inspiration',kharvek:'Khar-Vek · pulsation'};
let active=null,cleanup=null;
function allowed(){
 return typeof document!=='undefined' && !document.documentElement.matches('[data-still="true"]') &&
   !(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
}
export function vfxForCommand(type,payload={}){
 if(type==='spell-cast'&&payload.spellId==='fireball')return 'fireball';
 if(type==='mantle')return payload.survivors?'kharvek':'mantle';
 if(type==='kharvek-power'&&['pulse','rally'].includes(payload.power))return 'kharvek';
 return null;
}
export function playKobeVfx(kind){
 if(!LABELS[kind]||!allowed())return false;
 if(!document.getElementById('kobe-vfx-styles')){
   const style=document.createElement('style');style.id='kobe-vfx-styles';style.textContent=STYLE;document.head.append(style);
 }
 if(cleanup)clearTimeout(cleanup);
 active?.remove();
 const layer=document.createElement('div');
 layer.className='kobe-vfx kobe-vfx--'+kind;
 layer.setAttribute('aria-hidden','true');
 const veil=document.createElement('div');veil.className='kobe-vfx__veil';layer.append(veil);
 const core=document.createElement('div');core.className='kobe-vfx__core';layer.append(core);
 const ring=document.createElement('div');ring.className='kobe-vfx__ring';layer.append(ring);
 const count=kind==='fireball'?28:kind==='mantle'?16:20;
 const palette=kind==='fireball'?['#872F35','#B86637','#E5B963','#F0E5CE']:kind==='mantle'?['#E5B963','#F0E5CE']:['#B86637','#E5B963','#872F35'];
 for(let i=0;i<count;i++){
   const p=document.createElement('i');p.className='kobe-vfx__particle';
   const angle=(2*Math.PI*i/count)+.13;
   const radius=(kind==='fireball'?165:125)+(i%4)*22;
   p.style.setProperty('--x',Math.round(Math.cos(angle)*radius)+'px');
   p.style.setProperty('--y',Math.round(Math.sin(angle)*radius)+'px');
   p.style.setProperty('--s',(3+i%5*2)+'px');
   p.style.setProperty('--c',palette[i%palette.length]);
   p.style.setProperty('--delay',((i%5)*.018)+'s');
   layer.append(p);
 }
 const caption=document.createElement('div');caption.className='kobe-vfx__caption';caption.textContent=LABELS[kind];layer.append(caption);
 document.body.append(layer);active=layer;
 cleanup=setTimeout(()=>{layer.remove();if(active===layer)active=null;cleanup=null;},1450);
 return true;
}
