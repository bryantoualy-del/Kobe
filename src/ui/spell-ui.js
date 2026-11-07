import {glyph,spellGlyph,utilityGlyph} from './icons.js';
import {kharvekActions} from './kharvek-ui.js';
import {quickActions} from './combat-ui.js';
import {
  SPELLS,
  spellById,
  durationLabel,
  diceFor,
} from "../kobe/spell-catalog.js";
import { spellAvailability, availableLevels } from "../kobe/spells.js";
const esc = (x) =>
  String(x ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const check = (name, label) =>
  `<label class="check"><input name="${name}" type="checkbox">${esc(label)}</label>`;
const input = (name, label, value = "", type = "text") =>
  `<label>${esc(label)}<input name="${name}" type="${type}" value="${esc(value)}" required></label>`;
const select = (name, label, values) =>
  `<label>${esc(label)}<select name="${name}" aria-label="${esc(label)}">${values.map(([v, t]) => `<option value="${esc(v)}">${esc(t)}</option>`).join("")}</select></label>`;
const btn = (name, id, label, attrs = "") =>
  `<button type="button" ${name}="${esc(id)}" ${attrs}>${esc(label)}</button>`;
function availability(s, spell) {
  const levels = availableLevels(s, spell);
  const options = levels.map((level) => spellAvailability(s, spell, level));
  if (spell.ritual)
    options.push(spellAvailability(s, spell, spell.level, true));
  return (
    options.find((x) => x.ok) ??
    options[0] ?? { ok: false, label: "Emplacements épuisés" }
  );
}
const roles = {Contrôle:'controle', Protection:'defense', Soins:'soin', Dégâts:'flamme', Utilitaire:'arcane'};
const book = {role:'Tous', offensive:'Tous', level:'all', favorites:false, query:'', selected:'fireball'};
const featured = ['fireball','fire-bolt','healing-word','slow','circle-of-power'];
const bookOrder = [...featured.map(spellById), ...SPELLS.filter(spell=>!featured.includes(spell.id))];
const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const matchesIntent=(sp,filter)=>filter==='Tous'||(filter==='Offensif'?sp.categories.includes('Dégâts'):filter==='Contrôle & Défense'?sp.categories.some(c=>['Contrôle','Protection'].includes(c)):sp.categories.includes(filter));
function source(spell){
  const slug=spell.id==='tiny-hut'?'petite-hutte-de-leomund':spell.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-');
  return 'https://www.aidedd.org/dnd/sorts.php?vf='+slug;
}
function levelPicker(s,spell){
 if(!spell.level)return '';
 const choices=availableLevels(s,spell);
 return `<label class="cast-level">Niveau <select data-cast-level aria-label="Niveau · ${esc(spell.name)}">${choices.map(n=>`<option value="${n}">N${n} · ${s.slots[n]} restant(s)</option>`).join('')}${spell.ritual?'<option value="ritual">Rituel</option>':''}</select></label>`;
}
function attackOptions(spell){
 if(spell.id!=='fire-bolt')return '';
 return `<details class="attack-options"><summary>Avantage & dés physiques</summary><fieldset class="signature-modes"><legend>Jet d’attaque</legend>${[['normal','Normal'],['advantage','Avantage'],['disadvantage','Désavantage']].map(([v,label])=>`<label><input type="radio" name="signature-mode" value="${v}" ${v==='normal'?'checked':''}><span>${label}</span></label>`).join('')}</fieldset><label>D20 physiques<input id="signature-dice" placeholder="Facultatif" autocomplete="off"></label></details>`;
}
function spellRow(state, spell) {
  const favorite = state.preferences.favorites.includes(spell.id);
  return `<article class="grimoire-row role-${roles[spell.categories[0]]}" data-spell-card="${spell.id}">
    <button type="button" class="grimoire-select" data-book-select="${spell.id}" aria-pressed="${book.selected===spell.id}">
      <span class="grimoire-glyph">${spellGlyph(spell.id)}</span>
      <span class="grimoire-name"><strong>${esc(spell.name)}</strong><small>${spell.level?'Niveau '+spell.level:'Tour de magie'}</small></span>
      <span class="grimoire-cost">${spell.concentration?glyph('grimoire-slow','utility-icon'):utilityGlyph('action')}<span>${esc(spell.castTime)}${spell.concentration?'<small>Concentration</small>':''}</span></span>
      <span class="grimoire-range">${esc(spell.range.split(' · ')[0])}</span>
    </button>
    <button type="button" data-favorite="${spell.id}" aria-label="Favori · ${esc(spell.name)}"
      aria-pressed="${favorite}" ${!favorite&&state.preferences.favorites.length===4?'disabled':''}>${utilityGlyph('star')}</button>
  </article>`;
}

function spellSheet(state, spell) {
  if (!spell) return '<p class="grimoire-empty-detail">Sélectionne un sort pour voir sa fiche.</p>';
  const av=availability(state,spell);
  return `<article class="grimoire-sheet role-${roles[spell.categories[0]]}" data-spell-detail-id="${spell.id}">
    <header><span class="grimoire-glyph">${spellGlyph(spell.id)}</span>
      <div><h3>${esc(spell.name)}</h3><p>${spell.level?'Niveau '+spell.level:'Tour de magie'} · ${esc(spell.school)}</p></div>
    </header>
    <div class="grimoire-tags"><span>${utilityGlyph('action')}${esc(spell.castTime)}</span><span>${utilityGlyph('pin')}${esc(spell.range)}</span>
      ${spell.concentration?'<span>Concentration</span>':''}${spell.ritual?'<span>Rituel</span>':''}
    </div>
    <p class="grimoire-summary">${esc(spell.summary)}</p>
    <div class="grimoire-reference">${btn('data-spell-detail',spell.id,'Règles détaillées')}
      <a href="${source(spell)}" target="_blank" rel="noopener noreferrer">Fiche AideDD ↗</a>
    </div>
    ${attackOptions(spell)}
    <p class="grimoire-ready" data-book-availability data-ready="${av.ok}">${esc(av.label)}</p>
    <div class="grimoire-cast">${levelPicker(state,spell)}
      <button type="button" data-cast="${spell.id}" class="primary" ${av.ok?'':'disabled'}>${utilityGlyph('bolt')} Lancer</button>
    </div>
  </article>`;
}

export function spellbookPanel(state) {
  const slots=state.slots.slice(1).map((n,i)=>{
    const max=[4,3,3,3,2][i];
    return `<div class="slot-group"><b>N${i+1}</b><div class="dots">${Array.from({length:max},(_,j)=>`<button class="dot ${j<n?'on':''}" data-slot="${i+1}" data-slot-value="${j<n?j:j+1}" aria-label="Niveau ${i+1}, emplacement ${j+1} ${j<n?'disponible':'utilisé'}"></button>`).join('')}</div><small>${n}/${max}</small></div>`;
  }).join('');
  const filters=['Tous','Soins','Offensif','Contrôle & Défense'].map(role=>
    `<button type="button" data-spell-filter="${role}" aria-pressed="${book.role===role}">${role}</button>`).join('');
  return `<section class="grimoire" aria-label="Sorts et pouvoirs">
    <h2>Grimoire</h2>
    <div class="grimoire-tools">
      <label class="grimoire-search">${utilityGlyph('search')}<input id="spell-search" aria-label="Rechercher un sort ou pouvoir" type="search" placeholder="Rechercher un sort ou pouvoir" value="${esc(book.query)}"></label>
      <button type="button" data-book-favorites aria-pressed="${book.favorites}">${utilityGlyph('star')} Favoris</button>
      <details class="spell-slots">
        <summary><span class="sr-only">Emplacements</span>${state.slots.slice(1).map((n,i)=>`<span>N${i+1} · ${n}</span>`).join('')}</summary>
        <div class="slot-groups">${slots}</div>
      </details>
    </div>
    <div class="grimoire-filters"><div class="spell-legend" role="group" aria-label="Catégories de sorts">${filters}</div>
      <select data-book-level aria-label="Niveau de sort"><option value="all">Tous les niveaux</option>
        ${[0,1,2,3,4,5].map(n=>`<option value="${n}" ${book.level===String(n)?'selected':''}>${n?'Niveau '+n:'Tours de magie'}</option>`).join('')}
      </select>
    </div>
    <div class="spell-subfilters" role="group" aria-label="Types offensifs" hidden>
      ${['Tous','Sorts','Tours de magie','Zone'].map(f=>`<button type="button" data-offensive-filter="${f}" aria-pressed="${book.offensive===f}">${f}</button>`).join('')}
    </div>
    <div class="grimoire-grid">
      <div class="grimoire-list" aria-label="Catalogue des sorts et pouvoirs">
        <div class="grimoire-spells">${bookOrder.map(spell=>spellRow(state,spell)).join('')}</div>
        <section class="catalog-kharvek"><h3>Khar-Vek · ${state.resources.charges}/6</h3>
          <p>Sans emplacement · à 18 m. Manteau + soin combine une action bonus et une charge.</p>${kharvekActions(state)}
        </section>
        <section class="catalog-bardic">${quickActions(state,['inspiration','mantle','majesty','majesty-command','cry'])}</section>
        <p id="spell-empty" hidden>Aucun résultat pour ces filtres.</p>
      </div>
      <div id="grimoire-detail" class="grimoire-detail" aria-label="Fiche du sort">${spellSheet(state,spellById(book.selected))}</div>
    </div>
  </section>`;
}

export function filterSpells(state, change={}) {
  if(change.role!==undefined) Object.assign(book,{query:'',offensive:'Tous',level:'all',favorites:false});
  Object.assign(book,change);
  const root=document.querySelector('.grimoire');
  if(!root)return;
  const query=normalize(book.query.trim());
  const powerFilter=book.level==='all'&&!book.favorites;
  root.querySelector('#spell-search').value=book.query;
  root.querySelector('[data-book-level]').value=book.level;
  root.querySelector('[data-book-favorites]').setAttribute('aria-pressed',String(book.favorites));
  for(const b of root.querySelectorAll('[data-spell-filter],[data-offensive-filter]')){
    const active=b.hasAttribute('data-spell-filter')?b.dataset.spellFilter===book.role:b.dataset.offensiveFilter===book.offensive;
    b.classList.toggle('active',active);
    b.setAttribute('aria-pressed',String(active));
  }
  root.querySelector('.spell-subfilters').hidden=book.role!=='Offensif';
  const rows=[...root.querySelectorAll('[data-spell-card]')];
  for(const row of rows){
    const spell=spellById(row.dataset.spellCard);
    const subtype=book.role!=='Offensif'||book.offensive==='Tous'||(book.offensive==='Sorts'&&spell.level>0)||
      (book.offensive==='Tours de magie'&&spell.level===0)||(book.offensive==='Zone'&&spell.maxTargets>1);
    row.hidden=!(normalize(spell.name+' '+spell.summary).includes(query)&&matchesIntent(spell,book.role)&&subtype&&
      (book.level==='all'||Number(book.level)===spell.level)&&(!book.favorites||state.preferences.favorites.includes(spell.id)));
  }
  const kharvek=root.querySelector('.catalog-kharvek');
  for(const b of kharvek.querySelectorAll('[data-kharvek]')){
    b.hidden=!normalize(b.textContent+(b.dataset.kharvek==='survivors'?' Manteau des survivants':'')).includes(query);
  }
  kharvek.hidden=!powerFilter||!['Tous','Soins'].includes(book.role)||!kharvek.querySelector('[data-kharvek]:not([hidden])');
  const bard=root.querySelector('.catalog-bardic');
  for(const row of bard.querySelectorAll('.combat-ability')){
    const id=row.dataset.powerTone;
    const match=book.role==='Tous'||(book.role==='Contrôle & Défense'&&['majesty','majesty-command'].includes(id))||
      (book.role==='Offensif'&&book.offensive==='Tous'&&id==='cry');
    row.hidden=!match||!normalize(row.textContent).includes(query);
  }
  for(const lane of bard.querySelectorAll('.quick-lane'))lane.hidden=!lane.querySelector('.combat-ability:not([hidden])');
  bard.hidden=!powerFilter||!bard.querySelector('.combat-ability:not([hidden])');

  const visible=rows.filter(row=>!row.hidden);
  const selected=visible.find(row=>row.dataset.spellCard===book.selected)??visible[0];
  const detail=root.querySelector('#grimoire-detail');
  if(selected){
    book.selected=selected.dataset.spellCard;
    if(detail.querySelector('[data-spell-detail-id]')?.dataset.spellDetailId!==book.selected){
      detail.innerHTML=spellSheet(state,spellById(book.selected));
    }
  }else if(detail.querySelector('[data-spell-detail-id]'))detail.innerHTML=spellSheet(state);
  for(const row of rows){
    row.classList.toggle('selected',row===selected);
    row.querySelector('[data-book-select]').setAttribute('aria-pressed',String(row===selected));
  }
  root.querySelector('#spell-empty').hidden=!!(visible.length||!kharvek.hidden||!bard.hidden);
  if(Object.keys(change).some(key=>key!=='selected'))root.querySelector('.grimoire-list').scrollTop=0;
}

export function handleBookControl(state, target) {
  if(target.id==='spell-search')filterSpells(state,{query:target.value});
  if(target.matches('[data-book-level]'))filterSpells(state,{level:target.value});
  if(target.matches('[data-cast-level]')){
    const sheet=target.closest('[data-spell-detail-id]');
    if(!sheet)return;
    const spell=spellById(sheet.dataset.spellDetailId);
    const ritual=target.value==='ritual';
    const av=spellAvailability(state,spell,ritual?spell.level:Number(target.value),ritual);
    const status=sheet.querySelector('[data-book-availability]');
    status.textContent=av.label;
    status.dataset.ready=av.ok;
    sheet.querySelector('[data-cast]').disabled=!av.ok;
  }
}

export function handleBookClick(state, target) {
  const control=target.closest('[data-spell-filter],[data-offensive-filter],[data-book-favorites],[data-book-select]');
  if(!control)return false;
  if(control.hasAttribute('data-spell-filter'))filterSpells(state,{role:control.dataset.spellFilter});
  else if(control.hasAttribute('data-offensive-filter'))filterSpells(state,{offensive:control.dataset.offensiveFilter});
  else if(control.hasAttribute('data-book-favorites'))filterSpells(state,{favorites:!book.favorites});
  else{
    filterSpells(state,{selected:control.dataset.bookSelect});
    if(matchMedia('(max-width:720px)').matches)document.querySelector('#grimoire-detail').scrollIntoView({block:'start'});
  }
  return true;
}

function show(title, body, onSubmit, anchor) {
  const d = document.createElement(anchor ? "section" : "dialog");
  d.className = "combat-dialog spell-dialog";
  d.innerHTML = `<form><h2>${esc(title)}</h2>${body}<p role="alert" class="form-error"></p><div class="actions">${onSubmit ? '<button type="submit" class="primary">Confirmer</button>' : ""}<button type="button" data-cancel>${onSubmit ? "Annuler" : "Fermer"}</button></div></form>`;
  if(anchor){
    document.querySelector('.spell-inline')?.remove();
    d.classList.add('spell-inline');anchor.after(d);d.close=()=>d.remove();d.scrollIntoView({block:'nearest'});
  }else{document.body.append(d);d.showModal();}
  d.querySelector("[data-cancel]").onclick = () => d.close();
  d.onclose = () => d.remove();
  d.querySelector("form").onsubmit = async (e) => {
    e.preventDefault();
    const submit = d.querySelector("[type=submit]");
    if (submit.disabled) return;
    submit.disabled = true;
    try {
      const f = new FormData(e.target),
        p = Object.fromEntries(f);
      for (const el of d.querySelectorAll("[type=checkbox]"))
        if (el.name !== "target") p[el.name] = el.checked;
      p.targetIds = f.getAll("target");
      const r = await onSubmit(p);
      if (r?.ok) d.close();
      else
        d.querySelector(".form-error").textContent =
          r?.message ?? "Commande refusée.";
    } catch (e) {
      d.querySelector(".form-error").textContent = e.message;
    } finally {
      submit.disabled = false;
    }
  };
  return d;
}
export function openSpellDetail(id) {
  const s = spellById(id);
  show(
    s.name,
    `<p class="spell-meta">${s.level ? "Niveau " + s.level : "Tour de magie"} · ${esc(s.school)} · ${esc(s.castTime)}<br>${esc(s.range)} · ${esc(durationLabel(s))}</p><p>${esc(s.summary)}</p><dl><dt>Composantes</dt><dd>${esc(s.components)}</dd><dt>Rituel</dt><dd>${s.ritual ? "Oui : +10 minutes, sans emplacement ; concentration pendant l’incantation" : "Non"}</dd><dt>Attaque / sauvegarde</dt><dd>${s.attack ? "Attaque +9 (CHA), critique : doubles dés" : s.save ? `${s.save} DD17 (CHA)` : "Aucune, sauf test indiqué dans l’effet"}</dd><dt>Surincantation</dt><dd>${esc(s.scaling)}</dd><dt>Cibles, conditions et interactions</dt><dd>${esc(s.conditions)}</dd><dt>Concentration et durée</dt><dd>${s.concentration ? "Remplace la concentration actuelle après confirmation. Fin si neutralisé, à 0PV, échec de CON, expiration ou décision." : "Pas de concentration après lancement."} ${s.seconds ? "Concentration pendant l’incantation longue ; interruption = échec sans dépenser l’emplacement." : ""}</dd><dt>Source / accès</dt><dd>${esc(s.source)} · ${esc(s.access)}</dd></dl><p class="muted">Résumé rédigé pour Kobe ; arbitrage du MJ pour narration, immunités et conditions non observées. Les cibles sans PV déclarés reçoivent une annonce chiffrée.</p>`,
  );
}
const dice = (n, faces) =>
  Array.from({ length: n }, () => {
    const a = new Uint32Array(1),
      limit = Math.floor(4294967296 / faces) * faces;
    do {
      crypto.getRandomValues(a);
    } while (a[0] >= limit);
    return (a[0] % faces) + 1;
  });
function readRolls(text, n, faces) {
  if (!text?.trim()) return dice(n, faces);
  const values = text
    .trim()
    .split(/[,\s]+/)
    .map(Number);
  if (
    values.length !== n ||
    values.some((v) => !Number.isInteger(v) || v < 1 || v > faces)
  )
    throw Error(
      `Saisir ${n} résultats de d${faces} séparés par espaces, ou laisser vide pour lancer.`,
    );
  return values;
}
export async function quickAttack(dispatch,target,mode,physical){
 let attackRolls;
 try{attackRolls=readRolls(physical,mode==='normal'?1:2,20);}
 catch(e){await RPGDialogs.alert(e.message);return;}
 const result=await dispatch('spell-cast',{spellId:'fire-bolt',level:0,targetIds:[target],eligible:true,components:true,attackMode:mode,attackRolls,rolls:dice(2,10)});
 if(!result?.ok)return;
 const pending=result.state.pendingResolutions.find(r=>r.sourceId===result.events[0].id&&r.kind==='spell');
 if(pending){
   hitDialog(pending,result.state,dispatch);
 }
}
function hitDialog(r,state,dispatch){
 const dialog=document.createElement('dialog');
 dialog.className='combat-dialog hit-box';
 dialog.innerHTML=`<div class="eyebrow">Jet d’attaque · Trait de feu</div><div class="hit-roll">${r.attackTotal}</div><p>D20 ${r.natural} + 9</p><h2>Est-ce que l’attaque touche ?</h2><div class="hit-actions"><button class="hit-no" ${r.natural===20?'disabled':''}>Raté</button><button class="hit-yes" ${r.natural===1?'disabled':''}>${r.natural===20?'Critique':'Touché'}</button></div><button class="hit-options">Défenses et autres résultats</button>`;
 document.body.append(dialog);dialog.showModal();dialog.onclose=()=>dialog.remove();
 const apply=async outcome=>{const result=await dispatch('spell-resolve',{id:r.id,result:outcome,defense:'normal',rolls:outcome==='critical'?dice(4,10):[]});if(result?.ok)dialog.close();};
 dialog.querySelector('.hit-no').onclick=()=>apply('miss');
 dialog.querySelector('.hit-yes').onclick=()=>apply(r.natural===20?'critical':'hit');
 dialog.querySelector('.hit-options').onclick=()=>{dialog.close();openSpellResolve(r.id,state,dispatch);};
}
export async function openSpellCast(id,s,dispatch,selectedLevel){
 const spell=spellById(id);
 const chosen=selectedLevel??document.querySelector(`[data-spell-detail-id="${id}"] [data-cast-level]`)?.value;
 const ritual=chosen==='ritual';
 const level=spell.level ? Number(ritual?spell.level:chosen??availableLevels(s,spell)[0]??spell.level):0;
 if(spell.attack)return quickAttack(dispatch,'Cible annoncée',document.querySelector('[name=signature-mode]:checked')?.value??'normal',document.querySelector('#signature-dice')?.value??'');
 const payload={spellId:id,table:true,level,ritual,ability:'table',detail:'Effet annoncé à la table',effectSeconds:3600};
 const damageDice=diceFor(spell,level);
 if(damageDice)payload.rolls=dice(...damageDice);
 if(id==='dispel-magic')payload.checkRolls=dice(1,20);
 return dispatch('spell-cast',payload);
}

export function openSpellResolve(id, s, dispatch) {
  const r = s.pendingResolutions.find((r) => r.id === id),
    spell = spellById(r.spellId);
  let fields =
    `<p>${esc(s.combat.targets.find((t) => t.id === r.targetIds[0])?.name ?? r.targetIds[0])} · ${spell.attack ? "Attaque " + r.attackTotal + " (d20 " + r.natural + ")" : spell.save + " DD17"} · ${r.amount ?? 0} dégâts bruts</p>` +
    select(
      "result",
      "Résultat annoncé par le MJ",
      spell.attack
        ? [
            ["miss", "Raté"],
            ["hit", "Touché"],
            ["critical", "Critique (20 naturel ou effet confirmé)"],
            ["refused", "Refus MJ"],
          ]
        : [
            ["failure", "Sauvegarde échouée"],
            ["success", "Sauvegarde réussie"],
            ["refused", "Refus MJ"],
          ],
    );
  if (spell.dice)
    fields +=
      select("defense", "Défenses confirmées", [
        ["normal", "Normales"],
        ["resistant", "Résistance : moitié"],
        ["immune", "Immunité : zéro"],
        ["vulnerable", "Vulnérabilité : double"],
        ["manual", "Montant effectif fixé par le MJ"],
      ]) +
      input("effective", "Montant effectif (mode MJ seulement)", 0, "number") +
      input("reason", "Motif si montant MJ", "Décision de table");
  if (spell.id === "dissonant-whispers")
    fields +=
      check(
        "moveReaction",
        "Réaction de fuite confirmée par le MJ et le propriétaire",
      ) +
      check("safeMovement", "Trajet sûr et déplacement effectivement exécuté");
  if (spell.attack)
    fields +=
      check(
        "criticalEligible",
        "Effet imposant le critique confirmé par le MJ (ex. paralysie et attaquant à 1,50 m)",
      ) +
      '<label>Dés critiques physiques (facultatif)<input name="rolls"></label>';
  show("Résoudre · " + spell.name, fields, (p) => {
    p.id = id;
    p.effective = Number(p.effective);
    if (spell.attack && p.result === "critical")
      p.rolls = readRolls(p.rolls, ...diceFor(spell, r.level, true));
    return dispatch("spell-resolve", p);
  });
}
export function openSpellControl(mode, s, dispatch) {
  if (mode.startsWith("slot:")) {
    const level = Number(mode.slice(5));
    show(
      "Corriger les emplacements",
      input("value", "Emplacements restants", s.slots[level], "number") +
        input("reason", "Motif", "Correction MJ"),
      (p) => dispatch("slot-correct", { ...p, level, value: Number(p.value) }),
    );
    return;
  }
  if (mode === "target-hp") {
    show(
      "PV des cibles · suivi local",
      select(
        "targetId",
        "Cible",
        s.combat.targets.map((t) => [t.id, t.name]),
      ) +
        input("current", "PV actuels", 20, "number") +
        input("max", "PV maximum", 20, "number") +
        input("temp", "PV temporaires", 0, "number") +
        check("confirmed", "Informations confirmées à la table"),
      (p) =>
        dispatch("target-hp", {
          ...p,
          current: Number(p.current),
          max: Number(p.max),
          temp: Number(p.temp),
        }),
    );
    return;
  }
  if (mode === "target-turn") {
    show(
      "Tour d’une cible",
      select("targetId", "Cible", [
        ["kobe", "Kobe"],
        ...s.combat.targets.map((t) => [t.id, t.name]),
      ]) +
        select("phase", "Frontière de tour", [
          ["end", "Fin de tour : sauvegardes répétées"],
          ["start", "Début de tour"],
        ]) +
        input(
          "sequence",
          "Numéro de tour de cette cible (croissant)",
          s.combat.round,
          "number",
        ),
      (p) =>
        dispatch("spell-target-turn", { ...p, sequence: Number(p.sequence) }),
    );
    return;
  }
  const e = s.effects.find((e) => e.id === mode);
  if (!e) return;
  let fields = "";
  if (e.spellId === "mirror-image")
    fields =
      check(
        "applicable",
        "Attaque contre Kobe ; attaquant voit et ne perce pas les doubles",
      ) +
      input("roll", "D20 de redirection", dice(1, 20)[0], "number") +
      input(
        "attackTotal",
        "Total d’attaque contre le double (CA12)",
        12,
        "number",
      );
  else if (e.condition === "slow")
    fields =
      select("operation", "Interaction", [
        ["casting", "Vérifier le retard d’un sort en action"],
        ["end", "Terminer cet effet"],
      ]) +
      input("roll", "D20 du retard", dice(1, 20)[0], "number") +
      check("confirmed", "Fin de l’effet confirmée si choisie");
  else if (e.spellId === "circle-of-power")
    fields =
      check("inAura", "Créature dans les 9 m de Kobe") +
      check("friendly", "Kobe ou créature amicale") +
      check("magical", "Sort ou autre effet magique") +
      check(
        "halfOnSave",
        "L’effet prévoit moitié des dégâts en cas de sauvegarde réussie",
      ) +
      check("success", "Sauvegarde réussie (avec avantage)") +
      input(
        "amount",
        "Dégâts bruts avant sauvegarde et défenses",
        0,
        "number",
      ) +
      select("targetId", "Cible", [
        ["kobe", "Kobe"],
        ...s.combat.targets.map((t) => [t.id, t.name]),
      ]) +
      check("apply", "Appliquer aux PV suivis localement") +
      check(
        "useEffective",
        "Remplacer le calcul par un montant fixé après autres défenses",
      ) +
      input("effective", "Montant effectif fixé par le MJ", 0, "number") +
      check(
        "defensesConfirmed",
        "Autres défenses confirmées par le MJ si le montant effectif diffère",
      );
  else
    fields = check(
      "confirmed",
      "Condition de fin confirmée : blessure, attaque, départ du refuge, illusion abandonnée ou autre décision MJ",
    );
  show("Interaction · " + e.name, fields, (p) =>
    dispatch("spell-trigger", {
      ...p,
      effectId: e.id,
      roll: Number(p.roll),
      attackTotal: Number(p.attackTotal),
      amount: Number(p.amount),
      effective: Number(p.effective),
    }),
  );
}
