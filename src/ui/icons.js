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
