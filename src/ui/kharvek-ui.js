import {POWERS,kharvekAvailability,dragonStage} from '../kobe/kharvek.js';
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function drumSVG(charges){
 const stage=dragonStage(charges);
 // The blue channel separates the warm artwork from its white background.
 // Use the same silhouette for the uncharged outline and the coloured layer.
 return `<svg class="dragon-art" viewBox="0 0 1536 512" role="img" aria-label="Dragon de Khar-Vek, ${charges} charges" data-dragon="${stage}">
 <defs>
   <filter id="dragon-shape" color-interpolation-filters="sRGB">
     <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 -5 4.95 0"/>
   </filter>
   <mask id="dragon-mask" style="mask-type:alpha"><image width="1536" height="512" href="./src/ui/dragon.webp" filter="url(#dragon-shape)"/></mask>
   <filter id="dragon-outline" x="-2%" y="-3%" width="104%" height="106%">
     <feMorphology in="SourceAlpha" operator="dilate" radius="2.5" result="outer"/>
     <feFlood flood-color="#b5adb0"/><feComposite in2="outer" operator="in"/>
     <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
   </filter>
   <clipPath id="dragon-fill"><rect x="${(6-charges)*256}" width="${charges*256}" height="512"/></clipPath>
 </defs>
 <g filter="url(#dragon-outline)"><g mask="url(#dragon-mask)">
   <rect width="1536" height="512" fill="#39373b"/>
   <image class="dragon-illustration" width="1536" height="512" href="./src/ui/dragon.webp" clip-path="url(#dragon-fill)"/>
 </g></g></svg>`;
}
export function kharvekPanel(s){
 const charges=s.resources.charges;
 return `<section class="panel span kharvek-panel" id="kharvek" aria-label="Khar-Vek"><div class="kharvek-art"><h2>Khar-Vek</h2><p class="subtitle">Le Battement des Survivants</p><div class="drum-pad">${drumSVG(charges)}</div><div class="charge-marks" aria-label="${charges} charges sur 6">${Array.from({length:7},(_,i)=>`<button type="button" data-charge-value="${i}" class="charge-mark ${i>0&&i<=charges?'lit':''}" aria-label="Régler Khar-Vek à ${i} charge${i>1?'s':''}" aria-pressed="${i===charges}">${i}</button>`).join('')}<strong data-charge-count>${charges} / 6</strong></div></div><div class="kharvek-controls"><div class="power-list">${Object.entries(POWERS).map(([id,p])=>{const av=kharvekAvailability(s,id);return `<button type="button" data-kharvek="${id}" ${av.ok?'':'disabled'}><strong>${p.name}</strong><span>${p.charges} charge${p.charges>1?'s':''} · ${id==='survivors'?'avec Manteau · 1d10 + 5':`action · ${p.count}d8 + 5`}</span><small>${av.label}</small></button>`;}).join('')}</div><div class="actions"><button type="button" data-kharvek="dawn">Nouvelle aube</button></div></div></section>`;
}
export function healingRolls(raw,power){const spec=POWERS[power];if(raw.trim())return raw.trim().split(/\s+/).map(Number);return Array.from({length:spec.count},()=>{const a=new Uint32Array(1),limit=Math.floor(4294967296/spec.faces)*spec.faces;do{crypto.getRandomValues(a);}while(a[0]>=limit);return a[0]%spec.faces+1;});}
export function openKharvekForm(power,s,dispatch){
 if(power==='survivors')return dispatch('mantle',{table:true,survivors:true,healRolls:healingRolls('',power)});
 if(POWERS[power])return dispatch('kharvek-power',{table:true,power,healRolls:healingRolls('',power)});

 const d=document.createElement('dialog');d.className='combat-dialog';const spec=POWERS[power];
 let fields='';
 if(power==='dawn')fields='<p>Confirmer une nouvelle aube dans la fiction : toutes les charges reviennent à 6. Le repos ne recharge pas le tambour.</p>';
 else fields=`<label>Charges corrigées<input type="number" name="value" min="0" max="6" value="${s.resources.charges}" required></label>`;
 d.innerHTML=`<form><h2>${esc(spec?.name??(power==='dawn'?'Nouvelle aube':'Correction de Khar-Vek'))}</h2>${fields}<p class="form-error" role="alert"></p><div class="actions"><button class="primary" type="submit">Confirmer</button><button type="button" data-cancel>Annuler</button></div></form>`;
 document.body.append(d);d.showModal();d.onclose=()=>d.remove();d.querySelector('[data-cancel]').onclick=()=>d.close();
 d.querySelector('form').onsubmit=async e=>{e.preventDefault();const b=d.querySelector('[type=submit]');if(b.disabled)return;b.disabled=true;const f=new FormData(e.target);let type,p;
 if(power==='dawn'){type='kharvek-dawn';p={confirmed:true};}
 else{type='correct';p={field:'charges',value:Number(f.get('value')),reason:'Correction de table'};}
 const r=await dispatch(type,p);if(r?.ok)d.close();else{d.querySelector('.form-error').textContent=r?.message??'Commande non validée.';b.disabled=false;}
 };
}
