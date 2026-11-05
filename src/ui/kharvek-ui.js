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
   <clipPath id="dragon-fill"><rect width="${charges*256}" height="512"/></clipPath>
 </defs>
 <g filter="url(#dragon-outline)"><g mask="url(#dragon-mask)">
   <rect width="1536" height="512" fill="#39373b"/>
   <image class="dragon-illustration" width="1536" height="512" href="./src/ui/dragon.webp" clip-path="url(#dragon-fill)"/>
 </g></g></svg>`;
}
export function kharvekPanel(s){
 const charges=s.resources.charges;
 return `<section class="panel span kharvek-panel" id="kharvek" aria-label="Khar-Vek"><div class="kharvek-art"><div class="eyebrow">Vestige éveillé · très rare</div><h2>Khar-Vek</h2><p class="subtitle">Le Battement des Survivants</p><button class="drum-pad" type="button" data-drum aria-label="Frapper le tambour, sélection rythmique">${drumSVG(charges)}</button><div class="charge-marks" aria-label="${charges} charges sur 6">${Array.from({length:6},(_,i)=>`<span class="charge-mark ${i<charges?'lit':''}" aria-label="Charge ${i+1} ${i<charges?'disponible':'vide'}">${i+1}</span>`).join('')}<strong data-charge-count>${charges} / 6</strong></div><p class="rhythm-feedback" role="status" data-rhythm-feedback>1 frappe : Pulsation · 3 : Ralliement · 2 : invalide</p></div><div class="kharvek-controls"><h3>Pour que les vivants restent avec nous.</h3><p>Harmonisé · Barde / percussions<br>Focaliseur bardique · Sans concentration<br>Recharge des six charges à l’aube.</p><div class="power-list">${Object.entries(POWERS).map(([id,p])=>{const av=kharvekAvailability(s,id);return `<button type="button" data-kharvek="${id}" ${av.ok?'':'disabled'}><strong>${p.name}</strong><span>${p.charges} charge${p.charges>1?'s':''} · ${id==='survivors'?'avec Manteau · 1d10 + 5':`action · ${p.count}d8 + 5`}</span><small>${av.label}</small></button>`;}).join('')}</div><div class="actions"><button type="button" data-kharvek="dawn">Nouvelle aube</button><button type="button" data-kharvek="correct">Corriger les charges</button></div><details><summary>Frappes et confort visuel</summary><label><input type="checkbox" data-rhythm-enabled> Activer la sélection par percussion</label><label>Fenêtre des frappes (ms)<input type="number" data-rhythm-window min="400" max="1600" step="100" value="800"></label><button type="button" data-rhythm-reset>Annuler / réinitialiser les frappes</button><label><input type="checkbox" data-still> Sans animation</label><p>Les frappes sélectionnent seulement un pouvoir. Cibles puis confirmation obligatoires. Aucun son ni vibration nécessaires.</p></details><p class="muted">Cibles visibles à 18 m, hors Silence, ni mortes-vivantes ni artificielles. Soins directs possibles sur inconscients. Tambour à portée et main libre. PV externes : suivi local déclaré, à annoncer aux joueurs.</p></div></section>`;
}
export function healingFields(){return `<label class="check"><input type="checkbox" name="healingEligible"> Cibles du soin visibles à 18 m, vivantes, ni mortes-vivantes ni artificielles, hors Silence</label><label class="check"><input type="checkbox" name="drumReady"> Harmonisation active, tambour porté ou à portée, une main libre pour frapper</label><label>Dés du soin physiques (facultatif ; sinon jet automatique)<input name="healRolls" placeholder="Ex. 4 5 6"></label>`;}
export function mantleUpgradeFields(s){return `<fieldset class="survivor-upgrade"><legend>Manteau des survivants · facultatif</legend><label>Soigner un bénéficiaire<select name="survivorTargetId" aria-label="Soigner un bénéficiaire"><option value="">Sans soin additionnel</option>${s.combat.targets.filter(t=>t.side==='ally').map(t=>`<option value="${esc(t.id)}" ${s.resources.charges<1?'disabled':''}>${esc(t.name)} · 1d10 + 5 PV</option>`).join('')}</select></label><p>Coût total : 1 action bonus + 1 Inspiration${s.resources.charges<1?' · charges insuffisantes pour le soin':' ; +1 charge si soin choisi'}. Le bénéficiaire doit être coché parmi les cibles du Manteau ; ses conditions restent requises.</p>${healingFields()}</fieldset>`;}
export function healingRolls(raw,power){const spec=POWERS[power];if(raw.trim())return raw.trim().split(/\s+/).map(Number);return Array.from({length:spec.count},()=>{const a=new Uint32Array(1),limit=Math.floor(4294967296/spec.faces)*spec.faces;do{crypto.getRandomValues(a);}while(a[0]>=limit);return a[0]%spec.faces+1;});}
export function openKharvekForm(power,s,dispatch){
 const d=document.createElement('dialog');d.className='combat-dialog';const spec=POWERS[power];
 let fields='';
 if(spec){const av=kharvekAvailability(s,power);fields=`<p>${esc(av.label)} · ${spec.charges} charge${spec.charges>1?'s':''} + 1 action · ${spec.count}d8 + 5 PV · ${spec.max} cible${spec.max>1?'s maximum':''}${power==='rally'?' · un seul jet partagé':''}</p><fieldset><legend>Cibles du soin</legend>${[{id:'kobe',name:'Kobe'},...s.combat.targets].map(t=>`<label class="check"><input type="checkbox" name="target" value="${esc(t.id)}">${esc(t.name)}</label>`).join('')}</fieldset>${healingFields()}`;}
 else if(power==='dawn')fields='<p>Confirmer une nouvelle aube dans la fiction : toutes les charges reviennent à 6. Le repos ne recharge pas le tambour.</p>';
 else fields=`<label>Charges corrigées<input type="number" name="value" min="0" max="6" value="${s.resources.charges}" required></label><label>Motif<input name="reason" required maxlength="500"></label>`;
 d.innerHTML=`<form><h2>${esc(spec?.name??(power==='dawn'?'Nouvelle aube':'Correction de Khar-Vek'))}</h2>${fields}<p class="form-error" role="alert"></p><div class="actions"><button class="primary" type="submit">Confirmer</button><button type="button" data-cancel>Annuler</button></div></form>`;
 document.body.append(d);d.showModal();d.onclose=()=>d.remove();d.querySelector('[data-cancel]').onclick=()=>d.close();
 d.querySelector('form').onsubmit=async e=>{e.preventDefault();const b=d.querySelector('[type=submit]');if(b.disabled)return;b.disabled=true;const f=new FormData(e.target);let type,p;
 if(spec){type='kharvek-power';p={power,targetIds:f.getAll('target'),healingEligible:f.has('healingEligible'),drumReady:f.has('drumReady'),healRolls:healingRolls(f.get('healRolls'),power)};}
 else if(power==='dawn'){type='kharvek-dawn';p={confirmed:true};}
 else{type='correct';p={field:'charges',value:Number(f.get('value')),reason:f.get('reason')};}
 const r=await dispatch(type,p);if(r?.ok)d.close();else{d.querySelector('.form-error').textContent=r?.message??'Commande non validée.';b.disabled=false;}
 };
}
