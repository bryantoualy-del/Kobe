const spellGlyphs = {
  fireball:'grimoire-fireball', 'fire-bolt':'grimoire-flame',
  'healing-word':'grimoire-heal', slow:'grimoire-slow', 'circle-of-power':'grimoire-circle',
};

const powerGlyphs = {
  inspiration:'party-music', mantle:'party-mantle', majesty:'party-majesty',
  'majesty-command':'party-command', cry:'party-cry', 'fire-bolt':'party-flame',
  pulse:'heal', rally:'kharvek-rally', survivors:'mantle-heal', performance:'performance',
};

export function glyph(name, className = 'turn-icon') {
  return `<img class="${className}" src="./src/ui/icons/${name}.svg" alt="" width="36" height="36">`;
}

export const spellGlyph = id => glyph(spellGlyphs[id]??id, 'catalog-icon');
export const powerGlyph = id => glyph(powerGlyphs[id], 'catalog-icon');

const utilityPaths = {
  search:'<circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/>',
  star:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z"/>',
  action:'<circle cx="16.5" cy="4.5" r="1.5"/><path d="m12 20 2-5-3-3 2.5-4.5 3 3.5 3.5.5M4 19l4-1.5 2.5-3M7 10l3-3 3.5.5"/>',
  pin:'<path d="M18 10c0 4-6 9-6 9s-6-5-6-9a6 6 0 1 1 12 0Z"/><circle cx="12" cy="10" r="2"/>',
  bolt:'<path d="m14 2-9 12h6l-1 8 9-12h-6Z" fill="currentColor" stroke="none"/>',
};

export function utilityGlyph(name) {
  return `<svg class="utility-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${utilityPaths[name]}</svg>`;
}

// Art from the shared RPG Connect condition registry, bundled for offline use.
const conditionArt = {
  blinded:'aveugle', charmed:'charme', deafened:'assourdi', frightened:'effraye',
  grappled:'agrippe', incapacitated:'incapacite', invisible:'invisible', paralyzed:'paralyse',
  petrified:'petrifie', poisoned:'empoisonne', prone:'a_terre', restrained:'entrave',
  stunned:'etourdi', unconscious:'inconscient', exhaustion:'epuisement',
};

export function conditionGlyph(id) {
  if(Object.hasOwn(conditionArt,id))return `<img class="rpg-condition-icon" src="./src/ui/icons/conditions/${conditionArt[id]}.webp" alt="" width="17" height="17">`;
  const paths=id==='silenced'
    ? '<path d="M3 3l18 18M4 10h4l4-4v5m0 5v2l-4-4H4Zm12-8a5 5 0 0 1 2 6"/>'
    : '<circle cx="12" cy="12" r="8"/><path d="M12 8v5m0 3h.01"/>';
  return `<svg class="rpg-condition-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}
