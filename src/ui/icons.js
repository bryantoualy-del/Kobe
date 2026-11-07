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
