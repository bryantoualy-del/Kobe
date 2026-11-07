import {bardicAvailability} from '../kobe/combat.js';
import {kharvekAvailability} from '../kobe/kharvek.js';
import {availableLevels,spellAvailability} from '../kobe/spells.js';
import {spellById} from '../kobe/spell-catalog.js';
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const action=(attribute,label,av)=>`<button ${attribute} ${av.ok?'':'disabled'} title="${esc(av.label)}">${label}</button>`;
export function comboAvailability(s,heal=false){
 const mantle=heal?kharvekAvailability(s,'survivors'):bardicAvailability(s,'mantle');
 const spell=spellById('fireball');
 const fire=availableLevels(s,spell).map(n=>spellAvailability(s,spell,n)).find(a=>a.ok);
 return !mantle.ok?mantle:fire??{ok:false,label:'Boule de feu indisponible : action ou emplacement N3–5 requis.'};
}
export function supportCockpit(s){
 const inspiration=bardicAvailability(s,'inspiration'),mantle=bardicAvailability(s,'mantle');
 return `<section class="support-cockpit" aria-label="Cockpit de soutien"><div class="intent-grid">
 <article class="intent-card intent-inspire"><h2>♫ Inspirer <small>${s.resources.inspiration}/5 · d10</small></h2><div class="inspire-actions">${action('data-combat="inspiration"','Inspiration · d10',inspiration)}${action('data-combat="mantle"','Manteau · 11 PV temp.',mantle)}${action('data-kharvek="survivors"','Manteau + soin',kharvekAvailability(s,'survivors'))}</div><small>Bonus · 1 inspiration · soin : +1 charge (${s.resources.charges}/6)</small></article>
 ${[['Soins','heal','♥','Soigner','Sorts connus & Khar-Vek'],['Offensif','attack','♨','Attaquer','Boule de feu, Trait de feu…'],['Contrôle & Défense','control','✦','Contrôler','Entraver, protéger, charmer']].map(([filter,tone,icon,label,note])=>`<button class="intent-card intent-${tone}" data-intent="${filter}"><strong>${icon} ${label}</strong><span>${note}</span><small>Ouvrir les capacités →</small></button>`).join('')}
 </div><section class="ardent-combo" aria-label="Le Battement Ardent"><div><h2>♫ Le Battement Ardent</h2><p>Manteau d’inspiration → Boule de feu</p><small>1 inspiration · 1 emplacement N3–5 · bonus + action</small></div><div class="combo-actions">${action('data-combo="mantle"','1 · Manteau',comboAvailability(s))}${action('data-combo="survivors"','1 · Manteau + soin (+1 charge)',comboAvailability(s,true))}<button data-intent="Offensif" data-combo-fire>2 · Boule de feu →</button></div><small>Deux étapes séparées, annulables. Les bénéficiaires peuvent dépenser leur réaction pour se déplacer sans attaque d’opportunité ; déplacement à effectuer à la table.</small></section></section>`;
}
