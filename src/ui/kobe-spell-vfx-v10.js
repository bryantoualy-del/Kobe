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
