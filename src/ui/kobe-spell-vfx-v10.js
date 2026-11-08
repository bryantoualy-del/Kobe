/** V10 spell FX laboratory. Preview-only; never imported by the live companion. */
export const SPELL_FX=[["vicious-mockery","Moquerie cruelle","mock","violet","#bd83f4","♜"],["minor-illusion","Illusion mineure","illusion","cyan","#82dce7","◇"],["prestidigitation","Prestidigitation","spark","gold","#e5b963","✦"],["mending","Réparation","mend","gold","#e5b963","✧"],["healing-word","Mot de guérison","music","green","#80d8a3","♫"],["dissonant-whispers","Murmures dissonants","whisper","violet","#c38cf2","◖"],["enhance-ability","Amélioration de caractéristique","ascend","gold","#e5b963","✦"],["suggestion","Suggestion","eye","violet","#d1a1ff","◉"],["mirror-image","Image miroir","mirror","cyan","#89d8ef","♙"],["aid","Aide","aid","gold","#e5b963","✚"],["slow","Lenteur","hourglass","violet","#b997ff","⌛"],["dispel-magic","Dissipation de la magie","shatter","cyan","#a7ecf2","✧"],["leomunds-tiny-hut","Refuge de Leomund","dome","ivory","#f0e5ce","⌂"],["hallucinatory-terrain","Terrain hallucinatoire","terrain","green","#8be0b5","⌁"],["charm-monster","Charme-monstre","charm","rose","#ed9fce","♥"],["circle-of-power","Cercle de pouvoir","ward","gold","#e5b963","✥"],["hold-monster","Immobilisation de monstre","bind","violet","#b68bea","⛓"]];
let active=null,timer=null;
const CSS=`
.ksp-overlay{position:fixed;inset:0;z-index:9999;pointer-events:none;overflow:hidden;isolation:isolate}
.ksp-layer{position:absolute;left:50%;top:45%;transform:translate(-50%,-50%);border-radius:50%;opacity:0;animation:ksp-bloom var(--duration) cubic-bezier(.15,.7,.22,1) both;animation-delay:var(--delay,0ms)}
.ksp-core{width:min(32vmin,240px);aspect-ratio:1;background:radial-gradient(circle at 40% 35%,#fff9e9 0%,var(--light) 17%,var(--fx) 42%,color-mix(in srgb,var(--fx) 40%,transparent) 64%,transparent 73%);box-shadow:0 0 35px var(--fx),0 0 85px color-mix(in srgb,var(--fx) 35%,transparent);filter:blur(1px)}
.ksp-mist{width:min(65vmin,520px);aspect-ratio:1;background:radial-gradient(ellipse at 34% 47%,color-mix(in srgb,var(--fx) 55%,transparent),transparent 52%),radial-gradient(ellipse at 66% 59%,color-mix(in srgb,var(--light) 40%,transparent),transparent 58%);filter:blur(19px);animation-name:ksp-drift}
.ksp-wave{width:min(35vmin,280px);aspect-ratio:1;border:clamp(2px,.6vmin,5px) solid var(--light);box-shadow:0 0 19px var(--fx),inset 0 0 20px var(--fx);animation-name:ksp-expand}
.ksp-streak{width:min(52vw,460px);height:clamp(5px,1.4vmin,13px);border-radius:80% 25% 25% 80%;background:linear-gradient(90deg,transparent,var(--fx) 42%,var(--light) 92%,#fff9e5);box-shadow:0 0 16px var(--fx);animation-name:ksp-flight}
.ksp-spark{position:absolute;left:50%;top:45%;width:var(--size);height:var(--size);border-radius:50%;background:var(--light);box-shadow:0 0 11px 3px var(--fx);animation:ksp-scatter var(--duration) ease-out both;animation-delay:var(--delay)}
.ksp-veil{position:absolute;left:50%;top:45%;width:min(52vmin,390px);height:min(65vmin,480px);border-radius:48% 48% 35% 35%;background:linear-gradient(100deg,transparent,color-mix(in srgb,var(--fx) 30%,transparent) 25%,color-mix(in srgb,var(--light) 45%,transparent) 50%,color-mix(in srgb,var(--fx) 30%,transparent) 75%,transparent);filter:blur(12px);animation:ksp-veil var(--duration) ease-in-out both}
.ksp-barrier{position:absolute;left:50%;top:45%;width:min(62vmin,480px);height:min(42vmin,330px);border-radius:52% 52% 12% 12%/92% 92% 8% 8%;border:3px solid color-mix(in srgb,var(--light) 70%,transparent);background:radial-gradient(ellipse at 50% 100%,color-mix(in srgb,var(--fx) 20%,transparent),transparent 75%);box-shadow:0 0 23px var(--fx),inset 0 0 35px color-mix(in srgb,var(--fx) 25%,transparent);animation:ksp-barrier var(--duration) ease-out both}
.ksp-tether{position:absolute;left:50%;top:45%;height:clamp(3px,.65vmin,7px);width:min(50vmin,390px);border-radius:100%;background:linear-gradient(90deg,transparent,var(--fx),var(--light),transparent);box-shadow:0 0 15px var(--fx);animation:ksp-tether var(--duration) ease-in-out both;animation-delay:var(--delay,0ms)}
@keyframes ksp-bloom{0%{opacity:0;transform:translate(-50%,-50%) scale(.1)}24%{opacity:1;transform:translate(-50%,-50%) scale(.75)}65%{opacity:.85;transform:translate(-50%,-50%) scale(1.15)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.9)}}
@keyframes ksp-drift{0%{opacity:0;transform:translate(-60%,-40%) rotate(-15deg) scale(.3)}35%{opacity:.8}70%{opacity:.65;transform:translate(-40%,-55%) rotate(12deg) scale(1.3)}100%{opacity:0;transform:translate(-35%,-65%) rotate(20deg) scale(1.7)}}
@keyframes ksp-expand{0%,15%{opacity:0;transform:translate(-50%,-50%) scale(.1)}36%{opacity:.95}100%{opacity:0;transform:translate(-50%,-50%) scale(3)}}
@keyframes ksp-flight{0%{opacity:0;transform:translate(-160%,-50%) scaleX(.3)}20%{opacity:1}67%{opacity:1;transform:translate(20%,-50%) scaleX(1)}100%{opacity:0;transform:translate(65%,-50%) scaleX(.4)}}
@keyframes ksp-scatter{0%,17%{opacity:0;transform:translate(-50%,-50%) scale(.2)}40%{opacity:1}100%{opacity:0;transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(.15)}}
@keyframes ksp-veil{0%,100%{opacity:0;transform:translate(-50%,-50%) scale(.4) skewX(-14deg)}40%{opacity:.85;transform:translate(-50%,-50%) scale(1) skewX(8deg)}70%{opacity:.65;transform:translate(-50%,-50%) scale(1.2) skewX(-8deg)}}
@keyframes ksp-barrier{0%,100%{opacity:0;transform:translate(-50%,-30%) scale(.3,.2)}45%{opacity:.95;transform:translate(-50%,-50%) scale(1)}75%{opacity:.85;transform:translate(-50%,-50%) scale(1.08)}}
@keyframes ksp-tether{0%,100%{opacity:0;transform:translate(-50%,-50%) rotate(var(--angle)) scaleX(.1)}40%{opacity:1;transform:translate(-50%,-50%) rotate(var(--angle)) scaleX(1)}75%{opacity:.75}}
@media(prefers-reduced-motion:reduce){.ksp-overlay{display:none!important}}
`;
const FAMILIES={
mock:['mist','streak','spark'],illusion:['veil','mist','spark'],spark:['spark','core'],mend:['tether','spark','core'],
music:['wave','spark','mist'],whisper:['mist','streak','wave'],ascend:['veil','streak','spark'],
eye:['core','wave','mist'],mirror:['veil','veil','veil','spark'],aid:['barrier','spark','wave'],
hourglass:['mist','spark','tether'],shatter:['core','spark','streak'],dome:['barrier','wave','spark'],
terrain:['mist','veil','wave'],charm:['mist','core','spark'],ward:['barrier','wave','spark'],
bind:['tether','tether','tether','mist']
};
const PALETTE={violet:'#e8c8ff',cyan:'#dcfcff',gold:'#fff1b5',green:'#d6ffe3',ivory:'#fff8e9',rose:'#ffe0f3'};
function part(root,kind,delay=0,extra={}){
 const el=document.createElement('div');el.className='ksp-'+(kind==='spark'?'spark':'layer ksp-'+kind);el.style.setProperty('--delay',delay+'ms');
 for(const [k,v] of Object.entries(extra))el.style.setProperty(k,String(v));
 root.append(el);
}
export function stopSpellFx(){if(timer)clearTimeout(timer);timer=null;active?.remove();active=null}

/* Three dedicated cinematic prototypes. Visual language follows the accepted Kobe signature FX. */
const PILOT_CSS=`
.ksp-proto{position:fixed;inset:0;z-index:9999;pointer-events:none;overflow:hidden;isolation:isolate}
.ksp-proto *{pointer-events:none}
.ksp-proto .p-stage{position:absolute;left:50%;top:45%;width:min(72vmin,560px);aspect-ratio:1;transform:translate(-50%,-50%)}
.ksp-proto .p-smoke{position:absolute;inset:8%;border-radius:47% 53% 43% 57%;background:radial-gradient(ellipse at 36% 45%,rgba(183,109,213,.7),transparent 38%),radial-gradient(ellipse at 68% 58%,rgba(69,31,98,.96),transparent 61%),radial-gradient(circle at 50% 55%,#29152f 5%,rgba(72,29,91,.8) 48%,transparent 74%);filter:blur(15px) drop-shadow(0 0 20px #a75dbd);animation:p-smoke 1450ms cubic-bezier(.14,.7,.25,1) both}
.ksp-proto .p-smoke:nth-child(2){animation-delay:130ms;transform:rotate(65deg)}
.ksp-proto .p-distortion{position:absolute;inset:27%;border:8px solid rgba(227,168,255,.75);border-radius:50%;box-shadow:0 0 27px #9e65bf,inset 0 0 19px #a36bce;filter:blur(3px);animation:p-distort 1450ms ease-out both}
.ksp-proto .p-distortion:nth-child(4){animation-delay:130ms}
.ksp-proto .p-figure{position:absolute;left:50%;top:50%;width:24%;height:55%;transform:translate(-50%,-50%);filter:drop-shadow(0 0 16px #9ceaf3);animation:p-figure 1550ms ease-out both;opacity:0}
.ksp-proto .p-figure:before{content:'';position:absolute;top:0;left:30%;width:40%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 35% 30%,#f5ffff,#9ee2f2 55%,#408ba5);box-shadow:0 0 18px #89d8ef}
.ksp-proto .p-figure:after{content:'';position:absolute;top:24%;left:5%;width:90%;height:75%;border-radius:45% 45% 17% 17%;clip-path:polygon(35% 0,65% 0,100% 90%,73% 100%,50% 89%,27% 100%,0 90%);background:linear-gradient(95deg,rgba(43,109,143,.55),#c3f7ff 45%,rgba(53,133,161,.8));box-shadow:inset 0 0 25px #d9fcff}
.ksp-proto .p-figure--left{--shift:-85%;animation-delay:120ms}
.ksp-proto .p-figure--right{--shift:85%;animation-delay:170ms}
.ksp-proto .p-figure--center{--shift:0%;animation-delay:0ms}
.ksp-proto .p-shimmer{position:absolute;inset:10%;border-radius:50%;background:radial-gradient(circle,rgba(193,244,255,.2),transparent 67%);filter:blur(20px);animation:p-shimmer 1550ms ease-out both}
.ksp-proto .p-shield{position:absolute;inset:13%;border-radius:50%;background:radial-gradient(circle at 45% 38%,rgba(255,244,183,.13),rgba(229,185,99,.08) 40%,transparent 72%);border:clamp(3px,.65vmin,7px) solid rgba(250,223,150,.88);box-shadow:0 0 30px #e5b963,inset 0 0 42px rgba(229,185,99,.5),0 0 100px rgba(229,185,99,.26);animation:p-shield 1650ms cubic-bezier(.16,.72,.2,1) both}
.ksp-proto .p-shield:before{content:'';position:absolute;inset:6%;border-radius:50%;border:2px solid rgba(255,243,197,.55);box-shadow:inset 0 0 26px rgba(229,185,99,.22)}
.ksp-proto .p-shield:nth-child(2){animation-delay:110ms}
.ksp-proto .p-glow{position:absolute;inset:0;background:radial-gradient(circle at center,rgba(255,223,145,.27),transparent 55%);animation:p-shimmer 1650ms both}
@keyframes p-smoke{0%{opacity:0;transform:scale(.12) rotate(-25deg)}28%{opacity:1;transform:scale(.85) rotate(0deg)}47%{opacity:1;transform:scale(.53) rotate(18deg)}65%{opacity:.85;transform:scale(1.1) rotate(35deg)}100%{opacity:0;transform:scale(2.3) rotate(70deg)}}
@keyframes p-distort{0%,37%{opacity:0;transform:scale(.12)}49%{opacity:1}100%{opacity:0;transform:scale(3.3)}}
@keyframes p-figure{0%{opacity:0;transform:translate(-50%,-50%) scale(.45)}24%{opacity:1;transform:translate(-50%,-50%) scale(1)}45%{opacity:1;transform:translate(calc(-50% + var(--shift) * .35),-50%) scale(1)}70%{opacity:.82;transform:translate(calc(-50% + var(--shift)),-50%) scale(1)}100%{opacity:0;transform:translate(calc(-50% + var(--shift) * 1.3),-50%) scale(1.06)}}
@keyframes p-shimmer{0%,100%{opacity:0}35%{opacity:1}75%{opacity:.55}}
@keyframes p-shield{0%{opacity:0;transform:scale(.08);filter:brightness(1.8)}24%{opacity:1;transform:scale(.65)}48%{opacity:1;transform:scale(1.04)}78%{opacity:.95;transform:scale(1.2)}100%{opacity:0;transform:scale(1.55)}}
@media(prefers-reduced-motion:reduce){.ksp-proto{display:none!important}}
`;
function playPilot(id){
 if(!document.querySelector('#ksp-pilot-css')){const st=document.createElement('style');st.id='ksp-pilot-css';st.textContent=PILOT_CSS;document.head.append(st)}
 const root=document.createElement('div');root.className='ksp-proto';root.setAttribute('aria-hidden','true');
 const stage=document.createElement('div');stage.className='p-stage';root.append(stage);
 const add=(cls)=>{const n=document.createElement('div');n.className=cls;stage.append(n)};
 if(id==='dissonant-whispers'){add('p-smoke');add('p-smoke');add('p-distortion');add('p-distortion')}
 if(id==='mirror-image'){add('p-shimmer');add('p-figure p-figure--center');add('p-figure p-figure--left');add('p-figure p-figure--right')}
 if(id==='circle-of-power'){add('p-glow');add('p-shield');add('p-shield')}
 document.body.append(root);active=root;timer=setTimeout(()=>{if(active===root)stopSpellFx()},1850);return true;
}
export function playSpellFx(id,{intensity='normal'}={}){
 const d=SPELL_FX.find(x=>x[0]===id);
 if(!d||typeof document==='undefined'||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return false;
 stopSpellFx();
 if(!document.querySelector('#ksp-v11-style')){const st=document.createElement('style');st.id='ksp-v11-style';st.textContent=CSS;document.head.append(st)}
 const duration=intensity==='subtle'?750:intensity==='spectacular'?1650:1150;
 const root=document.createElement('div');root.className='ksp-overlay';root.setAttribute('aria-hidden','true');
 root.style.setProperty('--fx',d[4]);root.style.setProperty('--light',PALETTE[d[3]]||'#fff1b5');root.style.setProperty('--duration',duration+'ms');
 const family=FAMILIES[d[2]]||['core','spark'];
 family.forEach((kind,i)=>part(root,kind,i*85,kind==='tether'?{'--angle':(i*60-60)+'deg'}:{}));
 const count=intensity==='subtle'?9:intensity==='spectacular'?32:19;
 for(let i=0;i<count;i++){const angle=i*2.3999632297,dist=75+(i%6)*24;part(root,'spark',Math.round(i%9*50),{'--dx':Math.round(Math.cos(angle)*dist)+'px','--dy':Math.round(Math.sin(angle)*dist)+'px','--size':(2+i%4)+'px'})}
 document.body.append(root);active=root;timer=setTimeout(()=>{if(active===root)stopSpellFx()},duration+180);return true;
}
