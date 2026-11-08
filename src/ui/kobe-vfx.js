/**
 * Kobe FX v2 — short, pointer-transparent, presentation-only visual feedback.
 * Inspired by Kentaro's #fxOverlay and rpg-combat-fx pulse patterns.
 * No imported assets, gameplay state changes, sound, or network calls.
 */
const THEMES=Object.freeze({
 fireball:{color:'#ff7a29',light:'#ffe6a1',dark:'#872f35',glyph:'✹',duration:1650,burst:38},
 firebolt:{color:'#ff7935',light:'#fff0c5',dark:'#9b3525',glyph:'✦',duration:750,burst:11},
 mantle:{color:'#e5b963',light:'#fff5cf',dark:'#b86637',glyph:'✧',duration:900,burst:10},
 majesty:{color:'#d5a9ff',light:'#f9e5ff',dark:'#872f35',glyph:'♛',duration:950,burst:8},
 cry:{color:'#d34d42',light:'#ffd49a',dark:'#872f35',glyph:'♜',duration:1050,burst:12},
 kharvek:{color:'#e5b963',light:'#f0e5ce',dark:'#872f35',glyph:'♫',duration:1130,burst:12},
 rally:{color:'#e5b963',light:'#fff2b5',dark:'#b86637',glyph:'♪',duration:1380,burst:15},
 survivors:{color:'#ecb961',light:'#fff0c5',dark:'#872f35',glyph:'✥',duration:1240,burst:12},
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

 /* Signature moves — cinematic fireball, directional bolt and physically percussive Khar-Vek. */
 .kfx-v2__charge{position:absolute;left:50%;top:45%;width:min(22vmin,180px);aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,#fffce6 0 8%,#ffef96 20%,#ff9a2e 45%,rgba(164,29,16,.85) 64%,transparent 73%);filter:drop-shadow(0 0 25px #ff7a29);animation:kfx-charge var(--kfx-duration) ease-out both}
 .kfx-v2__inferno{position:absolute;left:50%;top:45%;width:min(78vmin,680px);aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,#fff0aa 0 9%,#ff9c38 18%,#fa511c 35%,#a42019 51%,rgba(93,18,20,.38) 63%,transparent 72%);filter:drop-shadow(0 0 33px #c43c18);mix-blend-mode:screen;animation:kfx-inferno var(--kfx-duration) cubic-bezier(.14,.8,.2,1) both}
 .kfx-v2__shock{position:absolute;left:50%;top:45%;width:min(36vmin,310px);aspect-ratio:1;border:clamp(3px,1vmin,9px) solid #ffe5ad;border-radius:50%;box-shadow:0 0 22px #f84a13,inset 0 0 25px #e44716;animation:kfx-shock var(--kfx-duration) ease-out both}
 .kfx-v2__shock--late{animation-delay:115ms;border-color:#ff9b4b}
 .kfx-v2__ember{position:absolute;left:50%;top:45%;width:var(--ember-size);height:var(--ember-size);border-radius:40% 60% 50% 50%;background:var(--ember-color);box-shadow:0 0 11px #ff8b37;animation:kfx-ember var(--kfx-duration) ease-out both;animation-delay:var(--ember-delay)}
 .kfx-v2__heat{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%,rgba(255,186,69,.38),rgba(227,52,11,.20) 38%,transparent 72%);animation:kfx-heat var(--kfx-duration) ease-out both}
 .kfx-v2__bolt{position:absolute;inset:0;overflow:hidden}
 .kfx-v2__bolt-streak{position:absolute;top:45%;left:0;width:min(55vw,530px);height:clamp(8px,2vmin,19px);transform:translate(-120%, -50%) skewX(-25deg);border-radius:100% 20% 20% 100%;background:linear-gradient(90deg,transparent 0%,rgba(228,55,14,.5) 16%,#ff6322 55%,#ffe18b 83%,#fff9da 100%);box-shadow:0 0 15px #ff842f,0 0 35px rgba(240,77,29,.7);filter:drop-shadow(0 0 11px #ff6422);animation:kfx-bolt-flight var(--kfx-duration) cubic-bezier(.13,.68,.18,1) both}
 .kfx-v2__bolt-streak:after{content:'';position:absolute;right:-11px;top:50%;width:clamp(17px,4vmin,38px);aspect-ratio:1;transform:translateY(-50%);border-radius:50%;background:#fff1b5;box-shadow:0 0 23px 13px #ff8a27}
 .kfx-v2__bolt-trail{position:absolute;left:0;top:45%;height:2px;width:65vw;background:linear-gradient(90deg,transparent,#f56b2a,#fff0bb);box-shadow:0 0 12px #ff7324;animation:kfx-bolt-trail var(--kfx-duration) ease-out both}
 .kfx-v2__bolt-hit{position:absolute;left:80%;top:45%;width:clamp(36px,8vmin,92px);aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,#fff7d1 0%,#ff9b36 28%,rgba(193,49,23,.68) 52%,transparent 70%);transform:translate(-50%,-50%);animation:kfx-bolt-hit var(--kfx-duration) ease-out both}
 .kfx-v2__bolt-flare{position:absolute;left:80%;top:45%;width:min(28vmin,220px);aspect-ratio:1;border:3px solid #ffb751;border-radius:50%;box-shadow:0 0 16px #ff6a27;animation:kfx-bolt-flare var(--kfx-duration) ease-out both}
 .kfx-v2__drum-wrap{position:absolute;left:50%;top:45%;width:min(43vmin,300px);aspect-ratio:1;transform:translate(-50%,-50%);animation:kfx-drum-shake var(--kfx-duration) ease-out both;filter:drop-shadow(0 0 18px rgba(229,185,99,.65))}
 .kfx-v2__drum{position:absolute;inset:7%;border-radius:50%;border:clamp(9px,2vmin,17px) solid #b86637;background:radial-gradient(ellipse at 37% 32%,#f0e5ce 0%,#cfaa78 46%,#8d4737 80%,#542e29 100%);box-shadow:inset 0 0 0 4px #e5b963,inset 0 -16px 24px rgba(75,23,17,.5),0 0 0 6px rgba(125,51,38,.6);animation:kfx-drum-head var(--kfx-duration) ease-out both}
 .kfx-v2__drum:before,.kfx-v2__drum:after{content:'';position:absolute;inset:18%;border:2px dashed rgba(135,47,53,.58);border-radius:50%}
 .kfx-v2__drum:after{inset:39%;border:2px solid rgba(135,47,53,.55)}
 .kfx-v2__beat{position:absolute;left:50%;top:45%;width:min(39vmin,280px);aspect-ratio:1;border:clamp(3px,.6vmin,6px) solid #e5b963;border-radius:50%;box-shadow:0 0 17px #b86637;animation:kfx-beat var(--kfx-duration) ease-out both;animation-delay:var(--beat-delay)}
 .kfx-v2__strike{position:absolute;left:50%;top:45%;width:min(20vmin,150px);height:min(20vmin,150px);border-radius:50%;background:radial-gradient(circle,rgba(255,248,221,.9),rgba(229,185,99,.4) 35%,transparent 70%);animation:kfx-strike var(--kfx-duration) ease-out both;animation-delay:var(--beat-delay)}
 .kfx-v2__protect{position:absolute;left:50%;top:45%;width:min(45vmin,320px);aspect-ratio:1;border:3px solid #f0e5ce;border-radius:50%;box-shadow:0 0 24px #e5b963;animation:kfx-protect var(--kfx-duration) ease-out both}
 @keyframes kfx-charge{0%{opacity:0;transform:translate(-50%,-50%) scale(.15)}16%{opacity:1;transform:translate(-50%,-50%) scale(.45)}34%{opacity:1;transform:translate(-50%,-50%) scale(1.05)}40%{opacity:0;transform:translate(-50%,-50%) scale(1.4)}100%{opacity:0}}
 @keyframes kfx-inferno{0%,28%{opacity:0;transform:translate(-50%,-50%) scale(.04)}42%{opacity:1;transform:translate(-50%,-50%) scale(.6)}62%{opacity:1;transform:translate(-50%,-50%) scale(1.2)}100%{opacity:0;transform:translate(-50%,-50%) scale(2)}}
 @keyframes kfx-shock{0%,33%{opacity:0;transform:translate(-50%,-50%) scale(.1)}43%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(4)}}
 @keyframes kfx-ember{0%,33%{opacity:0;transform:translate(-50%,-50%) scale(.2)}46%{opacity:1}100%{opacity:0;transform:translate(calc(-50% + var(--ember-x)),calc(-50% + var(--ember-y))) scale(.25)}}
 @keyframes kfx-heat{0%,33%,100%{opacity:0}45%{opacity:1}65%{opacity:.55}}
 @keyframes kfx-bolt-flight{0%{opacity:0;transform:translate(-110%,-50%) skewX(-25deg)}12%{opacity:1}62%{opacity:1;transform:translate(calc(80vw - 100%),-50%) skewX(-25deg)}66%,100%{opacity:0;transform:translate(calc(80vw - 100%),-50%) skewX(-25deg)}}
 @keyframes kfx-bolt-trail{0%,8%{opacity:0;transform:translateX(-100%) scaleX(.2)}30%{opacity:1}63%{opacity:1;transform:translateX(25vw) scaleX(1)}100%{opacity:0;transform:translateX(30vw) scaleX(.1)}}
 @keyframes kfx-bolt-hit{0%,58%{opacity:0;transform:translate(-50%,-50%) scale(.1)}65%{opacity:1;transform:translate(-50%,-50%) scale(1.15)}100%{opacity:0;transform:translate(-50%,-50%) scale(2.1)}}
 @keyframes kfx-bolt-flare{0%,57%{opacity:0;transform:translate(-50%,-50%) scale(.1)}65%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(1.9)}}
 @keyframes kfx-drum-shake{0%,8%,100%{transform:translate(-50%,-50%)}12%{transform:translate(calc(-50% - 5px),calc(-50% + 3px)) rotate(-2deg)}16%{transform:translate(calc(-50% + 5px),calc(-50% - 3px)) rotate(2deg)}20%{transform:translate(-50%,-50%)}45%{transform:translate(calc(-50% - 3px),calc(-50% + 2px)) rotate(-1deg)}50%{transform:translate(calc(-50% + 3px),calc(-50% - 2px)) rotate(1deg)}55%{transform:translate(-50%,-50%)}76%{transform:translate(calc(-50% - 4px),calc(-50% + 2px))}80%{transform:translate(-50%,-50%)}}
 @keyframes kfx-drum-head{0%,100%{filter:brightness(.9)}12%,45%,76%{filter:brightness(1.5)}}
 @keyframes kfx-beat{0%{opacity:0;transform:translate(-50%,-50%) scale(.55)}11%{opacity:0}16%{opacity:1}65%{opacity:.3}100%{opacity:0;transform:translate(-50%,-50%) scale(3.1)}}
 @keyframes kfx-strike{0%,9%,100%{opacity:0;transform:translate(-50%,-50%) scale(.3)}14%{opacity:1;transform:translate(-50%,-50%) scale(1.1)}27%{opacity:0}}
 @keyframes kfx-protect{0%,36%{opacity:0;transform:translate(-50%,-50%) scale(.4)}55%{opacity:.85}100%{opacity:0;transform:translate(-50%,-50%) scale(2.5)}}


 /* Actual flame tongues, not a radial orb: each jet separates, twists and dissipates. */
 .kfx-v2__flame{position:absolute;left:50%;top:45%;width:var(--flame-width);height:var(--flame-height);transform-origin:50% 80%;background:linear-gradient(0deg,#9e2018 0%,#f3541e 17%,#ff9f34 47%,#fff1a2 72%,rgba(255,247,199,.94) 91%,transparent 100%);clip-path:polygon(50% 0%,62% 19%,57% 35%,77% 20%,85% 42%,100% 61%,91% 79%,72% 95%,48% 100%,21% 91%,6% 71%,12% 52%,28% 37%,23% 18%,42% 35%);filter:drop-shadow(0 0 12px #fa6926);animation:kfx-flame-jet var(--kfx-duration) cubic-bezier(.17,.65,.25,1) both;animation-delay:var(--flame-delay)}
 .kfx-v2__flame--core{background:linear-gradient(0deg,#ba2b16,#ff8f20 27%,#ffdf6f 56%,#fffdea 91%,transparent);filter:drop-shadow(0 0 17px #ffd46e)}
 @keyframes kfx-flame-jet{0%,24%{opacity:0;transform:translate(-50%,-45%) rotate(var(--flame-rotate)) translateY(0) scale(.1,.2)}40%{opacity:1;transform:translate(-50%,-45%) rotate(var(--flame-rotate)) translateY(calc(var(--flame-distance) * -.28)) scale(.85,1.2)}68%{opacity:.97;transform:translate(-50%,-45%) rotate(calc(var(--flame-rotate) + var(--flame-sway))) translateY(calc(var(--flame-distance) * -.8)) scale(1,1.7)}100%{opacity:0;transform:translate(-50%,-45%) rotate(calc(var(--flame-rotate) - var(--flame-sway))) translateY(calc(var(--flame-distance) * -1.5)) scale(.45,2)}}
 /* A dragon's cry travels across the view as rippling, expanding sonic fronts. */
 .kfx-v2__cry-flash{position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(212,67,47,.27),transparent);animation:kfx-cry-flash var(--kfx-duration) ease-out both}
 .kfx-v2__cry-head{position:absolute;left:23%;top:45%;transform:translate(-50%,-50%);font-size:clamp(60px,13vmin,116px);line-height:1;filter:drop-shadow(0 0 15px #e34e37);animation:kfx-cry-head var(--kfx-duration) ease-out both}
 .kfx-v2__cry-wave{position:absolute;left:26%;top:45%;width:min(25vw,230px);height:min(44vh,330px);border:clamp(4px,.85vmin,8px) solid transparent;border-right-color:#ffce83;border-radius:50%;box-shadow:10px 0 19px -12px #e55b39;animation:kfx-cry-wave var(--kfx-duration) cubic-bezier(.16,.6,.26,1) both;animation-delay:var(--cry-delay)}
 .kfx-v2__cry-wave--inner{border-right-color:#fff2bf;border-width:3px}
 .kfx-v2__cry-strike{position:absolute;left:30%;top:45%;width:var(--cry-length);height:3px;border-radius:99px;background:linear-gradient(90deg,#e64739,#fff4cf,transparent);box-shadow:0 0 13px #d74130;animation:kfx-cry-strike var(--kfx-duration) ease-out both;animation-delay:var(--cry-delay);transform-origin:left center}
 @keyframes kfx-cry-flash{0%,20%,100%{opacity:0}40%{opacity:1}}
 @keyframes kfx-cry-head{0%{opacity:0;transform:translate(-50%,-50%) scale(.7)}22%{opacity:1;transform:translate(-50%,-50%) scale(1.14)}52%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) scale(.8)}}
 @keyframes kfx-cry-wave{0%,18%{opacity:0;transform:translate(-50%,-50%) scale(.12)}32%{opacity:1}78%{opacity:.9;transform:translate(calc(-50% + 52vw),-50%) scale(2.5,1.7)}100%{opacity:0;transform:translate(calc(-50% + 70vw),-50%) scale(3,1.9)}}
 @keyframes kfx-cry-strike{0%,21%{opacity:0;transform:translate(0,-50%) scaleX(.1)}38%{opacity:1}90%{opacity:.6;transform:translate(52vw,-50%) scaleX(1.5)}100%{opacity:0;transform:translate(67vw,-50%) scaleX(1.8)}}
 /* Wearable cloak silhouette: spreading shoulders, long hem and animated golden fabric folds. */
 .kfx-v2__cloak{position:absolute;left:50%;top:46%;width:min(72vmin,440px);height:min(76vmin,490px);transform:translate(-50%,-50%);overflow:visible;filter:drop-shadow(0 0 19px var(--kfx-color));animation:kfx-cloak-open var(--kfx-duration) cubic-bezier(.17,.8,.23,1) both}
 .kfx-v2__cloak-cloth{fill:url(#kfx-cloak-grad);stroke:#e5b963;stroke-width:4;stroke-linejoin:round}
 .kfx-v2__cloak-lining{fill:none;stroke:#fff0c7;stroke-width:3;stroke-linecap:round;opacity:.82}
 .kfx-v2__cloak-collar{fill:#fff0c7;stroke:#b86637;stroke-width:3}
 .kfx-v2__cloak-crown{position:absolute;left:50%;top:12%;transform:translateX(-50%);font-size:clamp(36px,8vmin,77px);color:#f0d28c;text-shadow:0 0 17px #d5a9ff;animation:kfx-cloak-crown var(--kfx-duration) ease-out both}
 .kfx-v2__cloak-pulse{position:absolute;left:50%;top:46%;width:min(42vmin,260px);aspect-ratio:1;border:3px solid var(--kfx-light);border-radius:50%;box-shadow:0 0 20px var(--kfx-color);animation:kfx-cloak-pulse var(--kfx-duration) ease-out both}
 @keyframes kfx-cloak-open{0%{opacity:0;transform:translate(-50%,-50%) scale(.3,.7) rotate(-7deg)}22%{opacity:.8;transform:translate(-50%,-50%) scale(.72,1) rotate(4deg)}42%{opacity:1;transform:translate(-50%,-50%) scale(1.13,1.02) rotate(-2deg)}65%{opacity:1;transform:translate(-50%,-50%) scale(1,1) rotate(1deg)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.15,1.1) rotate(-1deg)}}
 @keyframes kfx-cloak-pulse{0%,25%{opacity:0;transform:translate(-50%,-50%) scale(.2)}45%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(3)}}
 @keyframes kfx-cloak-crown{0%,20%,100%{opacity:0;transform:translate(-50%,-20%) scale(.5)}45%{opacity:1;transform:translate(-50%,-50%) scale(1.1)}75%{opacity:.8}}


 /* Solar fireball: a single expanding, crackling sphere (no outward flame jets). */
 .kfx-v2__sun{position:absolute;left:50%;top:45%;width:min(59vmin,450px);aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 43% 37%,#ffffeb 0 8%,#fff6b4 18%,#ffcf58 38%,#ff8a24 61%,#f34218 80%,#9d271a 98%);box-shadow:0 0 32px 7px rgba(255,173,53,.86),0 0 90px 26px rgba(255,79,20,.45),inset -17px -16px 38px rgba(158,26,18,.5);animation:kfx-sun-grow var(--kfx-duration) cubic-bezier(.14,.62,.24,1) both;overflow:hidden}
 .kfx-v2__sun:before{content:'';position:absolute;inset:-12%;border-radius:50%;background:repeating-radial-gradient(ellipse at 38% 40%,transparent 0 9px,rgba(255,255,222,.36) 12px,rgba(255,116,31,.13) 18px,transparent 25px);mix-blend-mode:screen;animation:kfx-sun-boil 430ms ease-in-out infinite alternate}
 .kfx-v2__sun:after{content:'';position:absolute;inset:7%;border-radius:50%;background:conic-gradient(from 12deg,transparent,rgba(255,247,183,.34),transparent 18%,rgba(230,66,18,.33) 28%,transparent 37%,rgba(255,245,191,.28) 51%,transparent 67%,rgba(255,121,23,.27) 82%,transparent);filter:blur(9px);animation:kfx-sun-swirl 870ms linear infinite}
 .kfx-v2__solar-ring{position:absolute;left:50%;top:45%;width:min(60vmin,460px);aspect-ratio:1;border:clamp(2px,.55vmin,5px) solid rgba(255,220,122,.8);border-radius:48% 52% 51% 49%;box-shadow:0 0 19px rgba(255,139,31,.95),inset 0 0 17px rgba(255,173,45,.6);animation:kfx-solar-ring var(--kfx-duration) cubic-bezier(.16,.68,.2,1) both;animation-delay:var(--ring-delay)}
 .kfx-v2__solar-spark{position:absolute;left:50%;top:45%;height:var(--spark-size);width:var(--spark-size);border-radius:50%;background:#fff6bd;box-shadow:0 0 9px 3px #ff8b20;animation:kfx-solar-crackle var(--kfx-duration) ease-out both;animation-delay:var(--spark-delay)}
 @keyframes kfx-sun-grow{0%{opacity:0;transform:translate(-50%,-50%) scale(.08);filter:brightness(1.7)}15%{opacity:1;transform:translate(-50%,-50%) scale(.22)}43%{opacity:1;transform:translate(-50%,-50%) scale(.61);filter:brightness(1.14)}72%{opacity:1;transform:translate(-50%,-50%) scale(1.06);filter:brightness(1.3)}84%{opacity:1;transform:translate(-50%,-50%) scale(1.23);filter:brightness(1.65)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.42);filter:brightness(1.9)}}
 @keyframes kfx-sun-boil{from{transform:rotate(-8deg) scale(1);opacity:.65}to{transform:rotate(9deg) scale(1.13);opacity:1}}
 @keyframes kfx-sun-swirl{to{transform:rotate(360deg)}}
 @keyframes kfx-solar-ring{0%,23%{opacity:0;transform:translate(-50%,-50%) scale(.1) rotate(0deg)}43%{opacity:.9;transform:translate(-50%,-50%) scale(.48) rotate(7deg)}73%{opacity:.72;transform:translate(-50%,-50%) scale(1.13) rotate(-9deg)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.65) rotate(12deg)}}
 @keyframes kfx-solar-crackle{0%,30%{opacity:0;transform:translate(-50%,-50%) scale(.3)}58%{opacity:1;transform:translate(calc(-50% + var(--spark-x) * .6),calc(-50% + var(--spark-y) * .6)) scale(1.3)}100%{opacity:0;transform:translate(calc(-50% + var(--spark-x)),calc(-50% + var(--spark-y))) scale(.2)}}

 @media(prefers-reduced-motion:reduce){.kfx-v2{display:none!important}}
 `;
 const st=document.createElement('style');st.id='kobe-fx-kentaro-v2';st.textContent=css;document.head.append(st);styleReady=true;
}

function addPart(parent,className,style={}){
 const el=document.createElement('div');el.className=className;
 for(const [key,value] of Object.entries(style))el.style.setProperty(key,String(value));
 parent.append(el);return el;
}

// A real fabric silhouette shared by Glamour mantles and Khar-Vek's survivor mantle.
function buildCloak(root,kind){
 const svgNS='http://www.w3.org/2000/svg';
 const svg=document.createElementNS(svgNS,'svg');
 svg.setAttribute('viewBox','0 0 400 430');
 svg.setAttribute('aria-hidden','true');
 svg.setAttribute('class','kfx-v2__cloak');
 const defs=document.createElementNS(svgNS,'defs');
 const grad=document.createElementNS(svgNS,'linearGradient');
 grad.id='kfx-cloak-grad';grad.setAttribute('x1','0%');grad.setAttribute('x2','100%');
 const palette=kind==='majesty'?['#3c214f','#9b67b3','#f1cc86','#4b2445']:['#6d372d','#bd7a43','#f3da8f','#8d4141'];
 palette.forEach((color,i)=>{const stop=document.createElementNS(svgNS,'stop');stop.setAttribute('offset',i*100/3+'%');stop.setAttribute('stop-color',color);grad.append(stop)});
 defs.append(grad);svg.append(defs);
 function path(d,cls){
  const p=document.createElementNS(svgNS,'path');
  p.setAttribute('d',d);p.setAttribute('class',cls);svg.append(p);
 }
 path('M 158 91 Q 198 66 242 91 Q 258 116 308 132 Q 338 203 359 366 Q 292 411 237 382 Q 201 407 166 382 Q 108 409 42 366 Q 58 205 94 132 Q 137 112 158 91 Z','kfx-v2__cloak-cloth');
 path('M 154 106 Q 124 207 96 364 M 201 114 Q 194 228 195 389 M 248 107 Q 281 215 311 364 M 93 137 Q 102 165 125 172 M 308 137 Q 301 165 278 172','kfx-v2__cloak-lining');
 path('M 157 89 Q 196 67 243 89 L 230 139 Q 198 122 172 139 Z','kfx-v2__cloak-collar');
 root.append(svg);
 addPart(root,'kfx-v2__cloak-pulse');
 if(kind==='majesty'){const crown=addPart(root,'kfx-v2__cloak-crown');crown.textContent='♛';}
}
function buildCry(root,intensity){
 addPart(root,'kfx-v2__cry-flash');
 // Pure sonic shockwaves: no dragon icon or emoji.
 const count=intensity==='subtle'?2:intensity==='spectacular'?5:3;
 for(let i=0;i<count;i++){
  addPart(root,'kfx-v2__cry-wave'+(i%2?' kfx-v2__cry-wave--inner':''),{'--cry-delay':i*115+'ms'});
 }
 for(let i=0;i<7;i++){
  addPart(root,'kfx-v2__cry-strike',{
   '--cry-length':(15+i%4*7)+'vw',
   '--cry-delay':(70+i%3*65)+'ms',
   'top':(39+i*2.1)+'%'
  });
 }
}

function buildSignature(root,kind,intensity){
 const isFire=kind==='fireball',isBolt=kind==='firebolt';
 const isDrum=['kharvek','rally','survivors'].includes(kind);
 if(['mantle','majesty'].includes(kind)){buildCloak(root,kind);return true;}
 if(kind==='cry'){buildCry(root,intensity);return true;}
 if(!isFire&&!isBolt&&!isDrum)return false;
 if(isFire){
  addPart(root,'kfx-v2__heat');
  addPart(root,'kfx-v2__sun');
  for(let i=0;i<4;i++)addPart(root,'kfx-v2__solar-ring',{'--ring-delay':(i*165)+'ms'});
  const count=intensity==='subtle'?14:intensity==='spectacular'?48:28;
  for(let i=0;i<count;i++){
   const angle=i*2.3999632297;
   const distance=70+(i%7)*22;
   addPart(root,'kfx-v2__solar-spark',{
    '--spark-x':Math.round(Math.cos(angle)*distance)+'px',
    '--spark-y':Math.round(Math.sin(angle)*distance)+'px',
    '--spark-size':(2+i%4)+'px',
    '--spark-delay':(i%8*65)+'ms'
   });
  }
  return true;
 }
 if(isBolt){
  const track=addPart(root,'kfx-v2__bolt');
  addPart(track,'kfx-v2__bolt-trail');
  addPart(track,'kfx-v2__bolt-streak');
  addPart(track,'kfx-v2__bolt-hit');
  addPart(track,'kfx-v2__bolt-flare');
  return true;
 }
 const drum=addPart(root,'kfx-v2__drum-wrap');
 addPart(drum,'kfx-v2__drum');
 const delays=kind==='rally'?[0,290,580]:kind==='survivors'?[0,350]:[0];
 for(const delay of delays){
  addPart(root,'kfx-v2__beat',{'--beat-delay':delay+'ms'});
  addPart(root,'kfx-v2__strike',{'--beat-delay':delay+'ms'});
 }
 if(kind==='survivors'){addPart(root,'kfx-v2__protect');buildCloak(root,'survivors');}
 return true;
}

export function stopKobeVfx(){
 if(cleanupTimer!==null){clearTimeout(cleanupTimer);cleanupTimer=null;}
 active?.remove();active=null;
}
export function playKobeVfx(kind,{intensity='normal'}={}){
 const theme=THEMES[kind];if(!theme||!enabled())return false;
 try{if(intensity==='normal')intensity=localStorage.getItem('kobe-vfx-intensity')||'normal';}catch{}
 if(!['subtle','normal','spectacular'].includes(intensity))intensity='normal';
 installStyle();stopKobeVfx();
 const root=document.createElement('div');
 root.className='kfx-v2 kfx-v2--'+kind;
 root.setAttribute('aria-hidden','true');
 root.style.setProperty('--kfx-color',theme.color);
 root.style.setProperty('--kfx-light',theme.light);
 root.style.setProperty('--kfx-dark',theme.dark);
 root.style.setProperty('--kfx-duration',theme.duration+'ms');
 if(intensity==='subtle')root.style.opacity='.65';
 if(!buildSignature(root,kind,intensity)){
 for(const part of ['wash','focus','glyph','ring','ring']){
  const node=document.createElement('div');node.className='kfx-v2__'+part;
  if(part==='glyph')node.textContent=theme.glyph;
  root.append(node);
 }
 const count=intensity==='subtle'?Math.ceil(theme.burst/2):intensity==='spectacular'?theme.burst+5:theme.burst;
 for(let i=0;i<count;i++){
  const node=document.createElement('i');node.className='kfx-v2__spark';
  node.style.setProperty('--angle',Math.round(i*360/count)+'deg');
  node.style.setProperty('--distance',(55+(i%4)*14)+'vmin');
  node.style.setProperty('--delay',((i%4)*24)+'ms');
  root.append(node);
 }
 }
 document.body.append(root);active=root;
 cleanupTimer=setTimeout(()=>{if(active===root)stopKobeVfx();else root.remove();},theme.duration+240);
 return true;
}
