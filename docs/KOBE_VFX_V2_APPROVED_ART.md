# Kobe VFX V2 — artistic approval (2026-11-08)

## Approved
- **Boule de feu:** original organic fire ignition, expansion, explosive impact and dissipation. Approved by user.
- **Trait de feu:** **distinct** directional projectile travelling left-to-right with a trailing stream of fire and a compact impact. Approved by user after explicitly rejecting the earlier miniature-fireball concept.

## Local approved preview assets
- Fireball: `kobe_boule_de_feu_vfx_concept.gif` (9 frames, 414×414, 120 ms per frame).
- Fire Bolt: **the latest generated animation**, `animation_de_boule_de_feu_en_mouvement.png` (actually GIF89a content, 9 frames, 717×237, 110 ms per frame). Do **not** use the older `kobe_trait_de_feu_vfx_concept.gif`: it is the rejected miniature-fireball version.

These files were created as conversation-local artifacts; they have **not** been uploaded into the GitHub repository. Do not claim deployment until binary assets are present, registered in the offline shell, and tested.

## Next implementation gate
1. Export approved images to correctly named, optimized, locally served spritesheets or GIFs (preserve firebolt directional movement, do not resize fireball).
2. Add them to a feature branch and update the offline manifest/service worker.
3. Wire playback only after a successful `spell-cast` and never on `spell-resolve` or replay; ensure actual fire-bolt spell ID matches the game catalogue.
4. Remove rejected SVG fallback for these two effects. Keep mechanics and RPG Connect unchanged.
5. Test reduced motion, iPhone Safari, iPad landscape, offline reload, and combat actions; deploy preview only after passing tests. Do not merge PR #22 without approval.
