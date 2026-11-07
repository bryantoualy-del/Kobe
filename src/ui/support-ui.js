import {assertCanAct, bardicAvailability} from '../kobe/combat.js';
import {kharvekAvailability} from '../kobe/kharvek.js';
import {availableLevels, spellAvailability} from '../kobe/spells.js';
import {spellById} from '../kobe/spell-catalog.js';

const escape = value => String(value).replace(/[&<>"']/g, char =>
  ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'})[char]);

const icon = name => `<img class="turn-icon" src="./src/ui/icons/${name}.svg" alt="" width="36" height="36">`;

function usableSpell(state, spell) {
  const levels = availableLevels(state, spell);
  return levels.length ? spellAvailability(state, spell, levels[0]) :
    {ok:false, label:'Aucun emplacement disponible'};
}

export function comboAvailability(state, heal = false) {
  const mantle = heal ? kharvekAvailability(state, 'survivors') : bardicAvailability(state, 'mantle');
  return mantle.ok ? usableSpell(state, spellById('fireball')) : mantle;
}

export function ardentStage(state) {
  const turn = state.turn;
  // Undo leaves an audit entry in the journal, so skip the command it reversed.
  const undone = new Set();
  let fireball = false;
  for (const event of state.journal.slice().reverse()) {
    if (event.sourceId === 'undo') undone.add(event.options?.commandId);
    if (undone.has(event.commandId)) continue;
    const eventTurn = event.after?.turn;
    if (eventTurn?.epoch !== turn.epoch || eventTurn?.combatId !== turn.combatId ||
        eventTurn?.startRevision !== turn.startRevision) break;
    if (event.sourceId === 'spell-cast' && event.options?.spellId === 'fireball') fireball = true;
    if (event.sourceId === 'mantle') return fireball ? 'complete' : 'fireball';
  }
  return 'mantle';
}

function command(attribute, label, description, availability, glyph, tone) {
  const graphic = glyph ? icon(glyph) : '<span class="turn-glyph" aria-hidden="true">✦</span>';
  return `<button type="button" class="turn-command tone-${tone}" ${attribute} ${availability.ok?'':'disabled'} title="${escape(availability.label)}">
    ${graphic}<span><strong>${escape(label)}</strong><small>${escape(description)}</small>
    ${availability.ok?'':`<small class="command-unavailable">${escape(availability.label)}</small>`}</span><span aria-hidden="true">›</span>
  </button>`;
}

function spellCommand(state, spell) {
  const art = {'fire-bolt':'flame', fireball:'fireball'}[spell.id];
  const tone = spell.categories.includes('Soins') ? 'heal' : spell.categories.includes('Dégâts') ? 'fire' : 'neutral';
  const description = spell.id === 'fire-bolt' ? '+9 · sans emplacement' :
    spell.level ? `N${spell.level}–5 · 1 emplacement` : 'Sans emplacement';
  return command(`data-cast="${spell.id}"`, spell.name, description, usableSpell(state, spell), art, tone);
}

function lane(state, title, key, favorites, defaults) {
  let status = 'Hors tour';
  if (state.combat.phase === 'active') {
    try {
      assertCanAct(state);
      status = state.economy[key] ? 'Disponible' : 'Dépensée';
    } catch { status = 'Indisponible'; }
  }
  const cards = [...favorites.map(spell => spellCommand(state, spell)), ...defaults]
    .slice(0, Math.max(3, favorites.length));
  return `<section class="turn-lane" data-turn-lane="${key}">
    <header><h2>${title}</h2><span class="turn-state" data-ready="${status==='Disponible'}">${status}</span></header>
    <div class="turn-commands">${cards.join('')}</div>
  </section>`;
}

function combo(state, addHeal) {
  const stage = ardentStage(state);
  const fireball = spellById('fireball');
  const availability = stage === 'mantle' ? comboAvailability(state, addHeal) : usableSpell(state, fireball);
  const healAvailability = kharvekAvailability(state, 'survivors');
  const toggle = `<label class="combo-option"><span>Ajouter le soin <small>1 charge Khar-Vek</small></span>
    <input type="checkbox" data-combo-heal ${addHeal?'checked':''} ${!healAvailability.ok&&!addHeal?'disabled':''}>
  </label>`;
  const levelPicker = `<label class="combo-option">Emplacement
    <select data-combo-level aria-label="Niveau de Boule de feu">${availableLevels(state, fireball)
      .map(level=>`<option value="${level}">N${level} · ${state.slots[level]} restant(s)</option>`).join('')}</select>
  </label>`;
  const button = stage === 'complete' ? '<p class="combo-complete">Combo terminé pour ce tour</p>' :
    `<button type="button" class="combo-next" data-combo="${stage}" ${availability.ok?'':'disabled'}>${stage==='mantle'?'Jouer le Manteau':'Lancer Boule de feu'}</button>
    ${availability.ok?'':`<p class="combo-blocked">${escape(availability.label)}</p>`}`;
  const steps = ['Manteau', 'Boule de feu'].map((label, index) => {
    const completed = stage === 'complete' || (index === 0 && stage === 'fireball');
    const current = stage === (index === 0 ? 'mantle' : 'fireball');
    return `<li data-step="${index+1}" data-done="${completed}" ${current?'aria-current="step"':''}>
      <span aria-hidden="true">${completed?'✓':index+1}</span>${label}${completed?'<span class="sr-only"> joué</span>':''}
    </li>`;
  }).join('');
  return `<section class="ardent-combo" aria-labelledby="ardent-title">
    <h2 id="ardent-title">${icon('music')}Le Battement Ardent</h2>
    <ol class="combo-steps">${steps}</ol>
    ${stage==='mantle'?toggle:stage==='fireball'?levelPicker:''}${button}
    <details class="combo-rules"><summary>Effets à appliquer à la table</summary><p>Jusqu’à 5 alliés visibles à 18 m reçoivent 11 PV temporaires. Ils peuvent dépenser leur réaction pour se déplacer sans attaque d’opportunité. Avec le soin, un bénéficiaire récupère 1d10 + 5 PV.</p></details>
  </section>`;
}

export function supportCockpit(state, addHeal = false) {
  const favorites = state.preferences.favorites.map(spellById).filter(Boolean);
  const actionFavorites = favorites.filter(spell => spell.economy === 'actionAvailable');
  const bonusFavorites = favorites.filter(spell => spell.economy === 'bonusAvailable');
  const actionDefaults = ['fire-bolt','fireball'].filter(id => !actionFavorites.some(spell => spell.id === id))
    .map(id => spellCommand(state, spellById(id)));
  actionDefaults.push(command('data-kharvek="pulse"', 'Pulsation réparatrice', 'Khar-Vek · 1 charge',
    kharvekAvailability(state, 'pulse'), 'heal', 'heal'));
  const bonusDefaults = [
    command('data-combat="inspiration"', 'Inspiration', '1 inspiration · d10', bardicAvailability(state, 'inspiration'), 'music', 'music'),
    command('data-combat="mantle"', 'Manteau', '1 inspiration · 11 PV temp.', bardicAvailability(state, 'mantle'), 'mantle', 'music'),
    command('data-kharvek="survivors"', 'Manteau + soin', '1 inspiration · 1 charge', kharvekAvailability(state, 'survivors'), 'mantle-heal', 'music'),
  ];
  return `<section class="support-cockpit" aria-label="Cockpit du tour">
    <div class="turn-board">
      <div class="turn-lanes">
        ${lane(state, 'Action', 'actionAvailable', actionFavorites, actionDefaults)}
        ${lane(state, 'Action bonus', 'bonusAvailable', bonusFavorites, bonusDefaults)}
      </div>
      <div class="turn-shortcuts">
        <button type="button" data-intent="Soins">♥ Soigner</button>
        <button type="button" data-intent="Offensif">Attaquer</button>
        <button type="button" data-intent="Contrôle & Défense">✦ Contrôler</button>
        <button type="button" data-combat-view="kharvek">Khar-Vek ${state.resources.charges}/6</button>
        <button type="button" data-tab="spells" aria-label="Gérer les favoris dans Sorts & pouvoirs">★ Favoris</button>
        <span class="inspiration-count">${icon('music')}${state.resources.inspiration}/5</span>
      </div>
    </div>
    <aside class="turn-sidebar">
      ${combo(state, addHeal)}
      <div class="turn-last-result"><div id="turn-result-slot"></div></div>
    </aside>
  </section>`;
}
