/**
 * Kobe FX v2 — short, pointer-transparent, presentation-only visual feedback.
 * Inspired by Kentaro's #fxOverlay and rpg-combat-fx pulse patterns.
 * No imported assets, gameplay state changes, sound, or network calls.
 */
const THEMES=Object.freeze({
 fireball:{color:'#ff7a29',light:'#ffe6a1',dark:'#872f35',glyph:'✹',duration:850,burst:14},
 firebolt:{color:'#ff7935',light:'#fff0c5',dark:'#9b3525',glyph:'✦',duration:620,burst:7},
 mantle:{color:'#e5b963',light:'#fff5cf',dark:'#b86637',glyph:'✧',duration:900,burst:10},
 majesty:{color:'#d5a9ff',light:'#f9e5ff',dark:'#872f35',glyph:'♛',duration:950,burst:8},
 cry:{color:'#d34d42',light:'#ffd49a',dark:'#872f35',glyph:'♜',duration:710,burst:12},
 kharvek:{color:'#e5b963',light:'#f0e5ce',dark:'#872f35',glyph:'♫',duration:920,burst:12},
 rally:{color:'#e5b963',light:'#fff2b5',dark:'#b86637',glyph:'♪',duration:1040,burst:15},
 survivors:{color:'#ecb961',light:'#fff0c5',dark:'#872f35',glyph:'✥',duration:1040,burst:12},
 heal:{color:'#80d8a3',light:'#ebffe5',dark:'#31755f',glyph:'✚',duration:720,burst:8},
 control:{color:'#bb90dc',light:'#f9e5ff',dark:'#643b86',glyph:'◇',duration:700,burst:7},
 inspiration:{color:'#e5b963',light:'#f0e5ce',dark:'#b86637',glyph:'✧',duration:650,burst:7}
});
const REDUCED='(prefers-reduced-motion: reduce)';
let active=null,cleanupTimer=null,styleReady=false;
const isBrowser=()=>typeof document!=='undefined'&&typeof window!=='undefined';
function enabled(){
 if(!isBrowser())return false;
 if(document.documentElement.dataset.still==='true')return false;
 if(window.matchMedia?.(REDUCED).matches)return false;
 try{if(localStorage.getItem('kobe-vfx-enabled')==='false')return false;}catch{}
 return true;
}
export function vfxForCommand(type,payload={}){
 if(type==='spell-cast'){
  const id=String(payload.spellId||'').toLowerCase();
  if(id==='fireball')return 'fireball';
  if(id==='fire-bolt'||id==='firebolt')return 'firebolt';
  if(['healing-word','cure-wounds','mass-cure-wounds','greater-restoration'].includes(id))return 'heal';
  if(['command','suggestion','hypnotic-pattern','hold-person','dominate-person','fear'].includes(id))return 'control';
  if(['power-word-heal'].includes(id))return 'heal';
  return null;
 }
 if(type==='fire-bolt')return 'firebolt';
 if(type==='mantle')return payload.survivors?'survivors':'mantle';
 if(type==='inspiration')return 'inspiration';
 if(type==='majesty')return 'majesty';
 if(type==='majesty-command')return 'control';
 if(type==='cry')return 'cry';
 if(type==='kharvek-power'){
  if(payload.power==='pulse')return 'kharvek';
  if(payload.power==='rally')return 'rally';
  if(payload.power==='survivors')return 'survivors';
 }
 return null;
}
function installStyle(){
 if(styleReady||document.getElementById('kobe-fx-kentaro-v2')){styleReady=true;return;}
 const css=`
 .kfx-v2{position:fixed;inset:0;z-index:180;pointer-events:none;overflow:hidden;contain:layout style;isolation:isolate}
 .kfx-v2 *{pointer-events:none}
 .kfx-v2__wash{position:absolute;inset:0;background:radial-gradient(circle at 50% 45%,color-mix(in srgb,var(--kfx-color) 24%,transparent),transparent 65%);animation:kfx-wash var(--kfx-duration) ease-out both}
 .kfx-v2__focus{position:absolute;left:50%;top:45%;width:min(38vmin,270px);aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,var(--kfx-light) 0%,var(--kfx-color) 21%,color-mix(in srgb,var(--kfx-dark) 65%,transparent) 44%,transparent 70%);filter:drop-shadow(0 0 24px var(--kfx-color));animation:kfx-impact var(--kfx-duration) cubic-bezier(.12,.67,.24,1) both}
 .kfx-v2__glyph{position:absolute;left:50%;top:45%;transform:translate(-50%,-50%);font:800 clamp(60px,16vmin,138px) Georgia,serif;color:var(--kfx-light);text-shadow:0 0 17px var(--kfx-color),0 0 37px var(--kfx-color);animation:kfx-glyph var(--kfx-duration) ease-out both}
 .kfx-v2__ring{position:absolute;left:50%;top:45%;width:min(28vmin,225px);aspect-ratio:1;border:3px solid var(--kfx-light);border-radius:50%;box-shadow:0 0 20px var(--kfx-color),inset 0 0 16px var(--kfx-color);animation:kfx-ring var(--kfx-duration) ease-out both}
 .kfx-v2__ring:nth-of-type(4){animation-delay:120ms}
 .kfx-v2__spark{position:absolute;left:50%;top:45%;width:4px;height:clamp(10px,2vmin,20px);border-radius:50%;background:var(--kfx-light);box-shadow:0 0 10px var(--kfx-color);transform:translate(-50%,-50%) rotate(var(--angle));animation:kfx-spark var(--kfx-duration) ease-out both;animation-delay:var(--delay)}
 .kfx-v2--mantle .kfx-v2__focus,.kfx-v2--majesty .kfx-v2__focus,.kfx-v2--rally .kfx-v2__focus,.kfx-v2--survivors .kfx-v2__focus,.kfx-v2--heal .kfx-v2__focus,.kfx-v2--inspiration .kfx-v2__focus{opacity:.48}
 .kfx-v2--firebolt .kfx-v2__ring,.kfx-v2--inspiration .kfx-v2__ring{border-width:2px}
 @keyframes kfx-wash{0%,100%{opacity:0}20%{opacity:1}60%{opacity:.5}}
 @keyframes kfx-impact{0%{opacity:0;scale:.13}24%{opacity:.95;scale:.63}46%{opacity:1;scale:1}100%{opacity:0;scale:2.8}}
 @keyframes kfx-glyph{0%{opacity:0;scale:.4;rotate:-12deg}24%{opacity:1;scale:1.12;rotate:0deg}55%{opacity:.85;scale:1}100%{opacity:0;scale:1.6}}
 @keyframes kfx-ring{0%{opacity:0;transform:translate(-50%,-50%) scale(.1)}25%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(3.1)}}
 @keyframes kfx-spark{0%{opacity:0;transform:translate(-50%,-50%) rotate(var(--angle)) translateY(0) scale(.4)}25%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) rotate(var(--angle)) translateY(calc(var(--distance) * -1)) scale(.15)}}
 @media(prefers-reduced-motion:reduce){.kfx-v2{display:none!important}}
 `;
 const st=document.createElement('style');st.id='kobe-fx-kentaro-v2';st.textContent=css;document.head.append(st);styleReady=true;
}
export function stopKobeVfx(){
 if(cleanupTimer!==null){clearTimeout(cleanupTimer);cleanupTimer=null;}
 active?.remove();active=null;
}
export function playKobeVfx(kind,{intensity='normal'}={}){
 const theme=THEMES[kind];if(!theme||!enabled())return false;
 installStyle();stopKobeVfx();
 const root=document.createElement('div');
 root.className='kfx-v2 kfx-v2--'+kind;
 root.setAttribute('aria-hidden','true');
 root.style.setProperty('--kfx-color',theme.color);
 root.style.setProperty('--kfx-light',theme.light);
 root.style.setProperty('--kfx-dark',theme.dark);
 root.style.setProperty('--kfx-duration',theme.duration+'ms');
 if(intensity==='subtle')root.style.opacity='.65';
 for(const part of ['wash','focus','glyph','ring','ring']){
  const node=document.createElement('div');node.className='kfx-v2__'+part;
  if(part==='glyph')node.textContent=theme.glyph;
  root.append(node);
 }
 const count=intensity==='subtle'?Math.ceil(theme.burst/2):theme.burst;
 for(let i=0;i<count;i++){
  const node=document.createElement('i');node.className='kfx-v2__spark';
  node.style.setProperty('--angle',Math.round(i*360/count)+'deg');
  node.style.setProperty('--distance',(55+(i%4)*14)+'vmin');
  node.style.setProperty('--delay',((i%4)*24)+'ms');
  root.append(node);
 }
 document.body.append(root);active=root;
 cleanupTimer=setTimeout(()=>{if(active===root)stopKobeVfx();else root.remove();},theme.duration+240);
 return true;
}
