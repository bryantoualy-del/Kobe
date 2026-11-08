/** V10 spell FX laboratory. Preview-only; never imported by the live companion. */
export const SPELL_FX=[["vicious-mockery","Moquerie cruelle","mock","violet","#bd83f4","♜"],["minor-illusion","Illusion mineure","illusion","cyan","#82dce7","◇"],["prestidigitation","Prestidigitation","spark","gold","#e5b963","✦"],["mending","Réparation","mend","gold","#e5b963","✧"],["healing-word","Mot de guérison","music","green","#80d8a3","♫"],["dissonant-whispers","Murmures dissonants","whisper","violet","#c38cf2","◖"],["enhance-ability","Amélioration de caractéristique","ascend","gold","#e5b963","✦"],["suggestion","Suggestion","eye","violet","#d1a1ff","◉"],["mirror-image","Image miroir","mirror","cyan","#89d8ef","♙"],["aid","Aide","aid","gold","#e5b963","✚"],["slow","Lenteur","hourglass","violet","#b997ff","⌛"],["dispel-magic","Dissipation de la magie","shatter","cyan","#a7ecf2","✧"],["leomunds-tiny-hut","Refuge de Leomund","dome","ivory","#f0e5ce","⌂"],["hallucinatory-terrain","Terrain hallucinatoire","terrain","green","#8be0b5","⌁"],["charm-monster","Charme-monstre","charm","rose","#ed9fce","♥"],["circle-of-power","Cercle de pouvoir","ward","gold","#e5b963","✥"],["hold-monster","Immobilisation de monstre","bind","violet","#b68bea","⛓"]];
const NS='http://www.w3.org/2000/svg';
let active=null,timer=null;
const make=(tag,attrs={},parent)=>{const el=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,String(v));parent?.append(el);return el;};
const path=(svg,d,cls)=>make('path',{d,class:cls,fill:'none','stroke-linecap':'round','stroke-linejoin':'round'},svg);
function scene(svg,kind){
 const line=(d,cls='v10-line')=>path(svg,d,cls);
 const circle=(cx,cy,r,cls='v10-line')=>make('circle',{cx,cy,r,class:cls},svg);
 const text=(x,y,value,cls='v10-symbol')=>{const e=make('text',{x,y,class:cls,'text-anchor':'middle'},svg);e.textContent=value;return e;};
 const glyph=(value)=>text(200,224,value);
 switch(kind){
 case 'mock':glyph('☻');for(let i=0;i<5;i++)line('M '+(115+i*42)+' 260 l -18 36 l 24 -9','v10-shard');break;
 case 'illusion':line('M 120 300 Q 105 250 145 205 Q 155 150 200 142 Q 245 150 255 205 Q 295 250 280 300 Z','v10-ghost');glyph('◇');break;
 case 'spark':glyph('✦');for(let i=0;i<9;i++){let a=i*Math.PI*2/9;circle(200+Math.cos(a)*105,210+Math.sin(a)*105,3+i%3,'v10-particle')}break;
 case 'mend':line('M 125 130 L 195 200 L 130 276 L 270 276 L 205 200 L 275 130','v10-fracture');glyph('✧');break;
 case 'music':glyph('♫');for(let i=0;i<3;i++)line('M '+(112+i*28)+' 280 Q 200 '+(330-i*25)+' '+(288-i*28)+' 280','v10-wave');break;
 case 'whisper':glyph('◖');for(let i=0;i<4;i++)line('M 165 '+(150+i*32)+' Q '+(245+i*12)+' '+(115+i*32)+' 290 '+(155+i*32),'v10-wave');break;
 case 'ascend':glyph('✦');for(let i=0;i<3;i++)line('M '+(145+i*55)+' 310 V 140 m -18 28 l 18 -28 l 18 28','v10-rise');break;
 case 'eye':line('M 90 210 Q 200 85 310 210 Q 200 335 90 210 Z','v10-eye');circle(200,210,42,'v10-iris');circle(200,210,16,'v10-pupil');break;
 case 'mirror':for(let i=0;i<3;i++){let x=125+i*75;line('M '+(x-24)+' 285 Q '+(x-28)+' 245 '+x+' 225 Q '+(x-24)+' 205 '+x+' 170 Q '+(x+24)+' 205 '+x+' 225 Q '+(x+28)+' 245 '+(x+24)+' 285 Z','v10-mirror');}break;
 case 'aid':for(let i=0;i<3;i++){let x=130+i*70;circle(x,205,18,'v10-figure');line('M '+x+' 230 v 70','v10-figure')}line('M 90 170 Q 200 70 310 170','v10-ward');break;
 case 'hourglass':line('M 140 100 H 260 L 155 310 H 245 L 140 100 M 155 100 L 245 310 M 140 310 H 260','v10-hourglass');line('M 175 272 L 225 272 L 200 245 Z','v10-sand');break;
 case 'shatter':glyph('✧');for(let i=0;i<7;i++){let a=i*2*Math.PI/7;line('M '+(200+Math.cos(a)*70)+' '+(210+Math.sin(a)*70)+' l '+(Math.cos(a)*46)+' '+(Math.sin(a)*46),'v10-shard')}break;
 case 'dome':line('M 85 295 Q 90 90 200 90 Q 310 90 315 295 Z','v10-dome');line('M 85 295 H 315','v10-ward');glyph('⌂');break;
 case 'terrain':for(let i=0;i<5;i++)line('M 65 '+(150+i*35)+' Q 120 '+(105+i*35)+' 200 '+(150+i*35)+' T 335 '+(150+i*35),'v10-terrain');glyph('⌁');break;
 case 'charm':glyph('♥');circle(200,205,110,'v10-ward');for(let i=0;i<4;i++)circle(200+Math.cos(i*Math.PI/2)*140,205+Math.sin(i*Math.PI/2)*140,7,'v10-particle');break;
 case 'ward':circle(200,210,125,'v10-ward');circle(200,210,96,'v10-ward');glyph('✥');for(let i=0;i<8;i++){let a=i*Math.PI/4;text(200+Math.cos(a)*111,216+Math.sin(a)*111,'ᚷ','v10-rune')}break;
 case 'bind':glyph('♟');for(let i=0;i<4;i++){let y=140+i*45;line('M 75 '+y+' Q 200 '+(y+70)+' 325 '+y,'v10-chain')}break;
 }
}
const CSS=`
.v10-overlay{position:fixed;inset:0;z-index:9999;pointer-events:none;display:grid;place-items:center;overflow:hidden;isolation:isolate}
.v10-stage{width:min(74vmin,470px);height:min(74vmin,470px);overflow:visible;filter:drop-shadow(0 0 17px var(--fx));animation:v10-stage var(--duration) ease-out both}
.v10-line,.v10-ghost,.v10-fracture,.v10-wave,.v10-rise,.v10-eye,.v10-iris,.v10-pupil,.v10-mirror,.v10-figure,.v10-ward,.v10-hourglass,.v10-sand,.v10-shard,.v10-dome,.v10-terrain,.v10-chain{fill:none;stroke:var(--fx);stroke-width:6;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:800;stroke-dashoffset:800;animation:v10-draw var(--duration) ease-out both}
.v10-ward,.v10-dome,.v10-eye{stroke-width:4}.v10-chain{stroke-width:9;stroke-dasharray:15 13;stroke-dashoffset:200;animation:v10-chain var(--duration) ease-out both}
.v10-symbol{fill:var(--fx);font:700 125px Georgia,serif;paint-order:stroke;stroke:#151419;stroke-width:3;opacity:0;transform-box:fill-box;transform-origin:center;animation:v10-glyph var(--duration) ease-out both}
.v10-rune{fill:var(--fx);font:24px Georgia,serif;opacity:0;animation:v10-glyph var(--duration) ease-out both}
.v10-particle{fill:var(--fx);stroke:none;animation:v10-particle var(--duration) ease-out both}
.v10-wash{position:absolute;inset:0;background:radial-gradient(ellipse at center,color-mix(in srgb,var(--fx) 13%,transparent),transparent 55%);animation:v10-fade var(--duration) both}
@keyframes v10-stage{0%{opacity:0;transform:scale(.45) rotate(-6deg)}20%{opacity:1;transform:scale(.95)}65%{opacity:1;transform:scale(1.1)}100%{opacity:0;transform:scale(1.35)}}
@keyframes v10-draw{0%{stroke-dashoffset:800;opacity:0}30%{stroke-dashoffset:300;opacity:1}65%{stroke-dashoffset:0;opacity:1}100%{stroke-dashoffset:0;opacity:0}}
@keyframes v10-chain{0%{stroke-dashoffset:200;opacity:0}35%{opacity:1}75%{stroke-dashoffset:0}100%{opacity:0}}
@keyframes v10-glyph{0%,12%{opacity:0;transform:scale(.25) rotate(-15deg)}40%{opacity:1;transform:scale(1.13)}70%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.25)}}
@keyframes v10-particle{0%{opacity:0}40%{opacity:1}100%{opacity:0}}
@keyframes v10-fade{0%,100%{opacity:0}25%{opacity:1}70%{opacity:.45}}
@media(prefers-reduced-motion:reduce){.v10-overlay{display:none!important}}
`;
export function stopSpellFx(){if(timer)clearTimeout(timer);timer=null;active?.remove();active=null}
export function playSpellFx(id,{intensity='normal'}={}){
 const d=SPELL_FX.find(s=>s[0]===id);if(!d||typeof document==='undefined'||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return false;
 stopSpellFx();if(!document.querySelector('#v10-css')){const style=document.createElement('style');style.id='v10-css';style.textContent=CSS;document.head.append(style)}
 const duration=intensity==='subtle'?700:intensity==='spectacular'?1700:1150;
 const root=document.createElement('div');root.className='v10-overlay';root.style.setProperty('--fx',d[4]);root.style.setProperty('--duration',duration+'ms');
 const wash=document.createElement('div');wash.className='v10-wash';root.append(wash);
 const svg=make('svg',{viewBox:'0 0 400 400',class:'v10-stage','aria-hidden':'true'},root);scene(svg,d[2]);document.body.append(root);active=root;
 timer=setTimeout(()=>{if(active===root)stopSpellFx()},duration+150);return true;
}
