export function initJournal(panel,api){
'use strict';
const log=panel.querySelector('#log');
const card=log.closest('.card'),head=card.querySelector('.journal-head');
const tools=document.createElement('div');tools.className='journal-workbench';tools.innerHTML=`<div class="journal-filters"><button class="on" data-filter="all">Tout</button><button data-filter="attack">Attaques</button><button data-filter="spell">Sorts</button><button data-filter="resource">Ressources</button><button data-filter="social">Social</button></div><div class="journal-search"><input id="journalSearch" type="search" placeholder="Rechercher dans la session…"><button id="exportJournal">Exporter</button></div>`;head.after(tools);
const classify=t=>/solinar|sélhane|décharge|attaque|dégâts|châtiment|spectre/i.test(t)?'attack':/lancé|sort|concentration|voile|porte|synapti/i.test(t)?'spell':/repos|slot|anneau|pv|ressource|malédiction/i.test(t)?'resource':/social|relation|mémoire|charme/i.test(t)?'social':'other';
let filter='all',search='';
const entries=()=>api.events().map(e=>e.label);
function paint(){
 const rows=entries().map((t,i)=>({t:String(t),i,type:classify(String(t))})).filter(x=>(filter==='all'||x.type===filter)&&x.t.toLowerCase().includes(search.toLowerCase())).reverse();
 log.innerHTML=rows.length?rows.map(x=>`<article class="journal-entry" data-kind="${x.type}"><span>${x.type==='attack'?'Combat':x.type==='spell'?'Sort':x.type==='resource'?'Ressource':x.type==='social'?'Social':'Session'}</span><pre>${x.t.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}</pre></article>`).join(''):'<div class="journal-empty">Aucune entrée pour ce filtre.</div>';
}
const observer=new MutationObserver(()=>{if(!log.querySelector('.journal-entry,.journal-empty'))paint()});observer.observe(log,{childList:true});
tools.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;tools.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('on',x===b));paint()});
tools.querySelector('#journalSearch').oninput=e=>{search=e.target.value;paint()};
tools.querySelector('#exportJournal').onclick=()=>{const text=entries().join('\n\n---\n\n'),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));a.download=`kobe-journal-${new Date().toISOString().slice(0,10)}.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
document.addEventListener('kobe-mechanical-update',paint);
paint();
const style=document.createElement('style');style.textContent=`.journal-workbench{display:grid;grid-template-columns:1fr minmax(260px,.7fr);gap:8px;margin:10px 0}.journal-filters,.journal-search{display:flex;gap:6px;overflow:auto}.journal-filters button,.journal-search button{min-height:40px;white-space:nowrap}.journal-filters button.on{color:#fff2d7;border-color:#9a7447;background:#3b2c20}.journal-search input{width:100%;min-height:40px;border:1px solid #41444e;border-radius:9px;background:#0b0c10;color:#f3ebdf;padding:8px}.journal-panel .log{font-family:system-ui,-apple-system,sans-serif!important;display:grid!important;gap:7px;align-content:start}.journal-entry{padding:10px 11px;border:1px solid #30343d;border-left:3px solid #5f6674;border-radius:9px;background:#0d0e12}.journal-entry[data-kind="attack"]{border-left-color:#b8583f}.journal-entry[data-kind="spell"]{border-left-color:#7b68a4}.journal-entry[data-kind="resource"]{border-left-color:#b18b51}.journal-entry[data-kind="social"]{border-left-color:#607c91}.journal-entry span{font-size:.62rem;text-transform:uppercase;letter-spacing:.12em;color:#a99b8b}.journal-entry pre{margin:5px 0 0;white-space:pre-wrap;font:500 .78rem/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;color:#e5ded4}.journal-empty{padding:30px;color:#8f8982;text-align:center}@media(max-width:767px){.journal-workbench{grid-template-columns:1fr}.journal-search{order:-1}}`;document.head.appendChild(style);
}
