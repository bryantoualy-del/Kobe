// Kobe's Theatre of Arcana: vector-painted, self-contained combat cinematics.
// Pure presentation: no state mutation, audio, network, or RPG Connect events.
const PALETTE={fireball:['#fff3c2','#ffb45b','#dc622c','#872f35'],mantle:['#fff8da','#e5b963','#b86637','#f0e5ce'],kharvek:['#f0e5ce','#e5b963','#b86637','#872f35']};
const LABELS={fireball:'Boule de feu',firebolt:'Trait de feu',mantle:'Manteau d’inspiration',kharvek:'Khar-Vek · Le Battement'};
const DURATIONS={fireball:1450,mantle:1200,kharvek:1650};
const NS='http://www.w3.org/2000/svg';
let active=null,timer=null;
function node(tag,attrs={},parent){const el=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,String(v));parent?.append(el);return el;}
function animate(el,frames,options){el.style.transformBox='view-box';el.style.transformOrigin='200px 200px';el.animate(frames,{fill:'both',easing:'cubic-bezier(.16,.8,.2,1)',...options});}
function defs(svg,kind){
 const d=node('defs',{},svg),colors=PALETTE[kind];
 const grad=node('radialGradient',{id:'kfx-core-gradient'},d);
 [[0,colors[0],1],[.22,colors[1],.98],[.55,colors[2],.9],[1,colors[3],0]].forEach(([at,color,opacity])=>node('stop',{offset:at*100+'%','stop-color':color,'stop-opacity':opacity},grad));
 const glow=node('filter',{id:'kfx-glow',x:'-100%',y:'-100%',width:'300%',height:'300%'},d);
 node('feGaussianBlur',{stdDeviation:kind==='fireball'?10:5},glow);
 const stroke=node('linearGradient',{id:'kfx-stroke',x1:'0',x2:'1',y1:'0',y2:'1'},d);
 colors.forEach((color,i)=>node('stop',{offset:i*100/(colors.length-1)+'%','stop-color':color},stroke));
}
function fire(svg,scale){
 const halo=node('circle',{cx:200,cy:200,r:88,fill:'url(#kfx-core-gradient)',filter:'url(#kfx-glow)'},svg);
 animate(halo,[{opacity:0,transform:'scale(.12)'},{opacity:.95,transform:'scale(.65)',offset:.24},{opacity:1,transform:'scale(2.5)',offset:.53},{opacity:0,transform:'scale(3.2)'}],{duration:1450});
 const core=node('circle',{cx:200,cy:200,r:48,fill:'url(#kfx-core-gradient)'},svg);
 animate(core,[{opacity:0,transform:'scale(.1)'},{opacity:1,transform:'scale(.85)',offset:.25},{opacity:1,transform:'scale(1.3)',offset:.46},{opacity:0,transform:'scale(3)'}],{duration:1250});
 for(let i=0;i<14;i++){
  const angle=i*Math.PI*2/14,rr=70+i%3*11;
  const x=200+Math.cos(angle)*rr,y=200+Math.sin(angle)*rr;
  const path=node('path',{d:`M 200 200 Q ${200+Math.cos(angle-.28)*rr*.6} ${200+Math.sin(angle-.28)*rr*.6} ${x} ${y} Q ${x+Math.cos(angle+.3)*24} ${y+Math.sin(angle+.3)*24} ${x+Math.cos(angle)*54} ${y+Math.sin(angle)*54}`,fill:'none',stroke:i%3===0?'#fff3c2':i%3===1?'#ffae59':'#b84227','stroke-width':i%3===0?2:5,'stroke-linecap':'round',filter:i%3===0?'url(#kfx-glow)':''},svg);
  animate(path,[{opacity:0,strokeDashoffset:240,transform:'scale(.2)'},{opacity:1,strokeDashoffset:0,transform:'scale(.8)',offset:.43},{opacity:0,transform:'scale(2.2)'}],{duration:1000,delay:180+i%4*30});
 }
 for(let i=0;i<28;i++){
  const a=i*2.399963,dist=80+(i%6)*21;
  const ember=node('ellipse',{cx:200,cy:200,rx:1.5+i%3,ry:3+i%4,fill:i%4===0?'#fff3c2':'#e5b963'},svg);
  animate(ember,[{opacity:0,transform:'translate(0px,0px) scale(.2)'},{opacity:1,offset:.3},{opacity:0,transform:`translate(${Math.cos(a)*dist}px,${Math.sin(a)*dist}px) scale(.2)`}],{duration:900+i%4*120,delay:370+i%5*32});
 }
}
function mantle(svg){
 const group=node('g',{},svg);
 for(let i=0;i<3;i++){
  const radius=60+i*23;
  const path=node('path',{d:`M ${200-radius} 200 C ${200-radius} ${200-radius*1.1} ${200+radius} ${200-radius*1.1} ${200+radius} 200 S ${200-radius} ${200+radius*1.1} ${200-radius} 200`,fill:'none',stroke:i===0?'#fff8da':i===1?'#e5b963':'#b86637','stroke-width':i===0?2.5:1.5,'stroke-linecap':'round','stroke-dasharray':i===0?'6 12':'none'},group);
  animate(path,[{opacity:0,transform:'scale(.5) rotate(-24deg)'},{opacity:.95,transform:'scale(1) rotate(0deg)',offset:.4},{opacity:0,transform:'scale(1.45) rotate(18deg)'}],{duration:1150,delay:i*65});
 }
 for(let i=0;i<8;i++){
  const a=i*Math.PI/4,rr=100;
  const p=node('path',{d:`M ${200+Math.cos(a)*rr} ${200+Math.sin(a)*rr} q 8 -16 15 -2 q 7 14 15 -2`,fill:'none',stroke:i%2?'#e5b963':'#fff8da','stroke-width':2,'stroke-linecap':'round'},group);
  animate(p,[{opacity:0,transform:'scale(.65)'},{opacity:1,offset:.45},{opacity:0,transform:'scale(1.2)'}],{duration:950,delay:i*35});
 }
 const jewel=node('path',{d:'M200 147 L214 187 L253 200 L214 213 L200 253 L186 213 L147 200 L186 187 Z',fill:'url(#kfx-core-gradient)',stroke:'#e5b963','stroke-width':1},group);
 animate(jewel,[{opacity:0,transform:'scale(.2)'},{opacity:1,transform:'scale(.95)',offset:.45},{opacity:0,transform:'scale(1.4)'}],{duration:1200});
}
function kharvek(svg){
 const drum=node('g',{},svg);
 const rim=node('ellipse',{cx:200,cy:200,rx:112,ry:69,fill:'#25151b',stroke:'#b86637','stroke-width':9},drum);
 node('ellipse',{cx:200,cy:200,rx:100,ry:58,fill:'#321c20',stroke:'#e5b963','stroke-width':1.5},drum);
 for(let i=0;i<9;i++){const a=i*2*Math.PI/9;node('path',{d:`M ${200+Math.cos(a)*70} ${200+Math.sin(a)*39} Q 200 200 ${200+Math.cos(a+.45)*94} ${200+Math.sin(a+.45)*52}`,fill:'none',stroke:i%2?'#b86637':'#872f35','stroke-width':2},drum);}
 const dragon=node('path',{d:'M121 215 C140 259 180 253 191 224 C206 187 170 163 186 146 C198 133 230 143 245 161 L264 153 L253 174 L278 182 L252 191 C259 220 238 241 217 231 C235 220 233 206 219 200 C202 192 204 216 195 225 C177 248 149 238 121 215 Z',fill:'none',stroke:'#e5b963','stroke-width':4,'stroke-linecap':'round','stroke-linejoin':'round','stroke-dasharray':560,'stroke-dashoffset':560},drum);
 animate(dragon,[{strokeDashoffset:560,opacity:.2},{strokeDashoffset:0,opacity:1,offset:.57},{strokeDashoffset:0,opacity:.2}],{duration:1550});
 const pulse=node('ellipse',{cx:200,cy:200,rx:110,ry:69,fill:'none',stroke:'#e5b963','stroke-width':7,filter:'url(#kfx-glow)'},svg);
 animate(pulse,[{opacity:0,transform:'scale(.6)'},{opacity:1,transform:'scale(1)',offset:.48},{opacity:0,transform:'scale(2.4)'}],{duration:1450,delay:180});
 animate(rim,[{stroke:'#872f35'},{stroke:'#e5b963',offset:.5},{stroke:'#872f35'}],{duration:1600});
}
function allowed(){return typeof document!=='undefined'&&!document.documentElement.matches('[data-still="true"]')&&!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;}
export function vfxForCommand(type,payload={}){
 if(type==='spell-cast'&&payload.spellId==='fireball')return 'fireball';
 if(type==='spell-cast'&&['fire-bolt','firebolt'].includes(payload.spellId))return 'firebolt';
 if(type==='mantle')return payload.survivors?'kharvek':'mantle';
 if(type==='kharvek-power'&&['pulse','rally'].includes(payload.power))return 'kharvek';
 return null;
}
export function playKobeVfx(kind,{intensity}={}){
 if(kind==='firebolt')return false; // Await approved local sprite asset; never substitute rejected vector FX.
 if(!LABELS[kind]||!allowed())return false;
 const level=['subtle','normal','spectacular'].includes(intensity)?intensity:(typeof localStorage!=='undefined'&&localStorage.getItem('kobe-vfx-intensity'))||'normal';
 if(timer)clearTimeout(timer);
 active?.remove();
 const layer=document.createElement('div');
 layer.className='kobe-arcana-vfx kobe-arcana-vfx--'+kind;
 layer.setAttribute('aria-hidden','true');
 Object.assign(layer.style,{position:'fixed',inset:0,zIndex:180,pointerEvents:'none',display:'grid',placeItems:'center',overflow:'hidden',opacity:level==='subtle'?.7:1});
 const stage=document.createElement('div');
 Object.assign(stage.style,{position:'relative',width:'min(76vw, 54vh, 440px)',aspectRatio:'1',transform:level==='spectacular'?'scale(1.16)':'none'});
 const svg=node('svg',{viewBox:'0 0 400 400',width:'100%',height:'100%','aria-hidden':'true'},stage);
 svg.style.overflow='visible';defs(svg,kind);
 if(kind==='fireball')fire(svg);else if(kind==='mantle')mantle(svg);else kharvek(svg);
 layer.append(stage);document.body.append(layer);active=layer;
 timer=setTimeout(()=>{layer.remove();if(active===layer)active=null;timer=null;},DURATIONS[kind]+100);
 return true;
}
