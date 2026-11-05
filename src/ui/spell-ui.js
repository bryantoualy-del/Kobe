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
let spellFilter='Tous';
function source(spell){
  const slug=spell.id==='tiny-hut'?'petite-hutte-de-leomund':spell.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-');
  return 'https://www.aidedd.org/dnd/sorts.php?vf='+slug;
}
function card(s, spell, compact = false) {
  const av = availability(s, spell),
    favorite = s.preferences.favorites.includes(spell.id);
  const role=spell.categories[0];
  if(!compact)return `<article class="spell role-${roles[role]}" data-spell-card="${spell.id}"><div class="eyebrow">${esc(spell.castTime)} · ${role}</div><h3>${esc(spell.name)}</h3><div class="meta">${esc(spell.range)}${spell.concentration?' · concentration':''}</div><details class="spell-doc"><summary>Description du sort</summary><div class="spell-doc-body">${esc(spell.components)} · ${esc(durationLabel(spell))}<p>${esc(spell.summary)}</p><a class="spell-doc-source" target="_blank" rel="noopener noreferrer" href="${source(spell)}">Fiche AideDD ↗</a></div></details><div class="actions">${btn("data-cast",spell.id,"Lancer",`class="primary" ${av.ok?'':'disabled'} title="${esc(av.label)}"`)}${btn("data-favorite",spell.id,favorite?'★':'☆',`aria-label="Favori · ${esc(spell.name)}" aria-pressed="${favorite}" ${!favorite&&s.preferences.favorites.length===4?'disabled':''}`)}</div></article>`;
  return `<article class="spell-card ${compact ? "compact" : ""}" data-spell-card="${spell.id}"><div class="spell-title"><h3>${esc(spell.name)}</h3><span class="spell-level">${spell.level ? "N" + spell.level : "Tour de magie"}${spell.secret ? " · Secret" : ""}</span></div><p class="spell-meta">${esc(spell.castTime)}${compact?"":" · "+esc(spell.range)}<br>${esc(durationLabel(spell))} · ${spell.level ? "Emplacement N" + spell.level + "–5" : "Sans emplacement"}</p>${compact ? "" : `<p class="spell-summary">${esc(spell.summary)}</p>`}<div class="spell-status ${av.ok ? "ready" : ""}">${esc(av.label)}</div><div class="actions">${btn("data-cast", spell.id, "Lancer", `class="primary" ${av.ok ? "" : "disabled"}`)}${compact ? "" : btn("data-favorite", spell.id, favorite ? "★ Favori" : "☆ Favori", `aria-pressed="${favorite}" ${!favorite && s.preferences.favorites.length === 4 ? "disabled" : ""}`)}${btn("data-spell-detail", spell.id, "Détails")}</div></article>`;
}
export function favoritesPanel(s) {
  return `<section class="panel span favorites-panel"><div class="score-heading"><h2>♫ Les quatre mesures</h2><button type="button" data-tab="spells">Modifier les favoris</button></div><div class="favorite-grid">${s.preferences.favorites.map((id) => card(s, spellById(id), true)).join("")}${Array.from({ length: 4 - s.preferences.favorites.length }, () => '<div class="favorite-empty">Une mesure libre<br><small>Choisir un favori dans le grimoire</small></div>').join("")}</div></section>`;
}
export function spellbookPanel(s) {
  const slots=s.slots.slice(1).map((n,i)=>{
    const max=[4,3,3,3,2][i];
    return `<div class="slot-group"><b>N${i+1}</b><div class="dots">${Array.from({length:max},(_,j)=>`<button class="dot ${j<n?'on':''}" data-slot="${i+1}" data-slot-value="${j<n?j:j+1}" aria-label="Niveau ${i+1}, emplacement ${j+1} ${j<n?'disponible':'utilisé'}"></button>`).join('')}</div><small>${n}/${max}</small></div>`;
  }).join('');
  const filters=['Tous',...Object.keys(roles)].map(role=>`<button class="role-${roles[role]||'all'} ${spellFilter===role?'active':''}" data-spell-filter="${role}" aria-pressed="${spellFilter===role}">${role} <small>${SPELLS.filter(sp=>role==='Tous'||sp.categories[0]===role).length}</small></button>`).join('');
  const sections=[0,1,2,3,4,5].map(level=>`<section class="panel spell-section"><h2>${level?'Niveau '+level:'Tours de magie'}</h2><div class="spell-grid">${SPELLS.filter(sp=>sp.level===level).map(sp=>card(s,sp)).join('')}</div></section>`).join('');
  return `<div class="score"><section class="panel spell-slots"><h2>Emplacements</h2><div class="slot-groups">${slots}</div></section><div class="spell-legend" role="group" aria-label="Filtrer les sorts par type">${filters}</div><div class="actions"><input id="spell-search" aria-label="Rechercher un sort" type="search" placeholder="Rechercher un sort"><button data-combat="target-save">Ajouter une cible</button></div>${sections}<p id="spell-empty" hidden>Aucun sort pour ces filtres.</p></div>`;
}
export function filterSpells(role){
  if(typeof role==='string')spellFilter=role;
  const normalize=v=>v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const q=normalize(document.querySelector('#spell-search')?.value||'');
  for(const b of document.querySelectorAll('[data-spell-filter]')){
    const active=b.dataset.spellFilter===spellFilter;
    b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));
  }
  for(const card of document.querySelectorAll('.score [data-spell-card]')){
    const sp=spellById(card.dataset.spellCard);
    card.hidden=!(normalize(sp.name+' '+sp.summary).includes(q)&&(spellFilter==='Tous'||sp.categories[0]===spellFilter));
  }
  for(const section of document.querySelectorAll('.spell-section'))section.hidden=!section.querySelector('[data-spell-card]:not([hidden])');
  const empty=document.querySelector('#spell-empty');if(empty)empty.hidden=!!document.querySelector('.spell-section:not([hidden])');
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
   await window.CompanionDiceEngine?.roll({label:'Trait de feu',rolls:attackRolls,mode:mode==='advantage'?'adv':mode==='disadvantage'?'dis':'normal',chosen:pending.natural,total:pending.attackTotal,detail:'d20 '+attackRolls.join(' / ')+' + 9',verdict:'Jet d’attaque'});
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
export function openSpellCast(id, s, dispatch, chosenLevel) {
  const spell = spellById(id),
    levels = availableLevels(s, spell);
  let fields = `<p>${esc(spell.summary)}</p><p class="spell-meta">${esc(spell.components)} · ${esc(spell.range)} · ${esc(durationLabel(spell))}</p>`;
  const anchor=document.querySelector(`[data-spell-card="${id}"]`)||document.querySelector('.abilities-card');
  if(spell.level && chosenLevel===undefined && anchor){
    return show(spell.name,select("level","Niveau d’emplacement",levels.map(n=>[n,"Niveau "+n+" · "+s.slots[n]+" restant(s)"]).concat(spell.ritual?[["ritual","Rituel · sans emplacement"]]:[])),p=>{
      openSpellCast(id,s,dispatch,p.level);return {ok:true};
    });
  }
  if (spell.level && !anchor)
    fields += select(
      "level",
      "Niveau d’emplacement",
      levels.length
        ? levels.map((n) => [
            n,
            "Niveau " + n + " · " + s.slots[n] + " restant(s)",
          ])
        : [[spell.level, "Aucun emplacement (rituel seulement)"]],
    );
  if (spell.ritual && !anchor)
    fields += check(
      "ritual",
      "Lancer en rituel : +10 minutes, sans emplacement",
    );
  if (spell.maxTargets !== 0)
    fields += `<fieldset><legend>Cibles (limite selon niveau ; zone et admissibilité à confirmer)</legend>${[{ id: "kobe", name: "Kobe" }, ...s.combat.targets].map((t) => check("target", t.name).replace('name="target"', 'name="target" value="' + esc(t.id) + '"')).join("")}</fieldset><p class="muted">Ajouter les autres créatures via « Ajouter une cible » dans le grimoire.</p>`;
  fields += '<p class="muted">Confirmer le lancer valide la portée, les cibles et les composantes.</p>';
  if ((spell.concentration || spell.seconds || spell.ritual) && s.concentration)
    fields += check(
      "replaceConcentration",
      "Remplacer la concentration : " + s.concentration.name,
    );
  if (spell.seconds || spell.ritual)
    fields += check(
      "uninterrupted",
      "Incantation achevée sans interruption : toutes les actions et la concentration consacrées pendant la durée requise",
    );
  if (spell.dice || spell.id === "enhance-ability")
    fields +=
      '<label>Dés physiques (facultatif ; sinon jet automatique)<input name="rolls" placeholder="Résultats séparés par espaces"></label>';
  if (spell.attack)
    fields +=
      select("attackMode", "Jet d’attaque", [
        ["normal", "Normal"],
        ["advantage", "Avantage"],
        ["disadvantage", "Désavantage"],
      ]) +
      '<label>D20 physiques (facultatif)<input name="attackRolls" placeholder="Un d20, ou deux avec avantage/désavantage"></label>';
  if(spell.healing)fields+='<p>Confirmer le soin valide une cible vivante, ni artificielle ni morte-vivante.</p>';
  if (spell.id === "enhance-ability")
    fields += select(
      "ability",
      "Caractéristique favorisée",
      ["FOR", "DEX", "CON", "INT", "SAG", "CHA"].map((a) => [a, a]),
    );
  if (spell.id === "aid")
    fields += check(
      "replaceEffect",
      "Remplacer les Aides antérieures chevauchantes pour tous leurs bénéficiaires (uniquement si plus puissante)",
    );
  if (spell.id === "dispel-magic")
    fields +=
      input(
        "spellLevels",
        "Niveau de chaque sort à dissiper (1–9, séparés par espaces)",
        "3",
      ) +
      '<label>D20 des tests CHA+7 nécessaires (facultatif)<input name="checkRolls"></label>';
  if (
    [
      "prestidigitation",
      "minor-illusion",
      "suggestion",
      "hallucinatory-terrain",
      "mending",
      "tiny-hut",
    ].includes(spell.id)
  )
    fields += '<details><summary>Note facultative</summary><input name="detail" aria-label="Effet annoncé à la table"></details>';
  if (spell.id === "prestidigitation")
    fields += select("effectSeconds", "Durée de l’effet choisi", [
      [3600, "1 heure (selon effet)"],
      [6, "Fin du prochain tour (objet ou illusion)"],
      [0, "Instantané"],
    ]);
  return show("Lancer · " + spell.name, fields, (p) => {
    p.spellId = id;
    p.eligible=true; p.components=true;
    if(spell.healing)p.healingEligible=true;
    if(id==='prestidigitation'&&!p.detail?.trim())p.detail='Effet annoncé à la table';
    if(chosenLevel==="ritual")p.ritual=true;
    p.level = spell.level ? Number(p.ritual ? spell.level : chosenLevel ?? p.level) : 0;
    p.effectSeconds = Number(p.effectSeconds);
    if (spell.dice) p.rolls = readRolls(p.rolls, ...diceFor(spell, p.level));
    if (spell.id === "enhance-ability")
      p.rolls = p.ability === "CON" ? readRolls(p.rolls, 2, 6) : [];
    if (spell.attack)
      p.attackRolls = readRolls(
        p.attackRolls,
        p.attackMode === "normal" ? 1 : 2,
        20,
      );
    if (spell.id === "dispel-magic") {
      p.spellLevels = p.spellLevels.trim().split(/\s+/).map(Number);
      const n = p.spellLevels.filter((n) => n > p.level).length;
      p.checkRolls = readRolls(p.checkRolls, n, 20);
    }
    return dispatch("spell-cast", p);
  },anchor);
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
