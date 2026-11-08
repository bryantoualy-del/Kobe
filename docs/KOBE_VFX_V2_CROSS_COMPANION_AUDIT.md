# Kobe VFX V2 — comparative source audit (2026-11-08)

Status: **audit completed; no new VFX wired to combat; artistic approval pending.** Branch: `feat/kobe-vfx-pilot`. PR #22 remains unmerged.

## Evidence-based comparison

| Companion | Verified files | Existing animation technology | Reusable principles | Explicit limitations |
|---|---|---|---|---|
| Brackmard | `index.html`, `dice-engine.js`, `companion-v3.css` | CSS keyframes for `.fx-core`, `.fx-ring`, `.fx-shock`, `.fx-cone`; Three.js WebGL Canvas for dice | Combat-driven presentation and reduced-motion guard; visually distinguished ability feedback | CSS rings and radial gradients do not satisfy Kobe premium VFX brief; Three.js is loaded from CDN |
| Samoth | `companion.css`, `dice-engine.js` | `.samoth-fx` frost ray/vortex/cone/storm CSS geometry, gradients and shards; same Three.js dice engine | Spell-specific rhythm and geometry; pointer-free layered effects | Geometric rings and full-screen frost are not directly suitable for bardic visual identity |
| Kentaro | `index.html`, `dice-engine.js` | `#fxOverlay` occult/eldritch/eclipse CSS gradient animations and shell reactions; Three.js dice | Short cinematic beats and dark palette | Full-screen flashes and gradients are not adequate final artwork for Kobe |
| Rufus | `companion-v3.js`, `companion-v3.css`, `dice-engine.js` | `playFx`, teleport rings, readiness states, CSS stage animations, Three.js dice | Separation of event-driven FX and combat controls | Ring-heavy effects not appropriate for Kobe; no verified animation spritesheets |
| Nans | `index.html`, `brack-theme.css`, `.github/scripts/patch_volto_fx.py`, `dice-engine.js` | Volto lightning/impact shake and CSS gradients; same dice engine | Impact timing, device motion fallbacks | CSS shockwaves/screenshake should not be generalized; no verified animation spritesheets |
| Zéphyr | `index.html`, `companion-responsive-polish.css`, `dice-engine.js` | `.fx-layer`, `.fx-burst` sacred FX CSS; same dice engine | Nonblocking effect layers and tablet layout considerations | Generic burst/ring primitives inappropriate for final Kobe artwork |
| Kobe / PR #22 | `src/ui/kobe-vfx.js`, `src/ui/sprite-vfx.js`, `src/ui/vfx-library.js`, `src/ui/app.js`, `vfx-gallery.html`, `sw.js` | Current combat path builds SVG circles/paths through Web Animations API; unused generic Canvas 2D sprite-sheet player also exists | Keep validated timing, frame control, abort/visibility/reduced-motion and post-dispatch-only trigger | Current SVG art and Kenney static textures are artistically rejected. Sprite player is **not** yet wired to combat. |

Sources:
- https://github.com/bryantoualy-del/Brackmard/blob/main/index.html
- https://github.com/bryantoualy-del/Samoth/blob/main/companion.css
- https://github.com/bryantoualy-del/Kentaro/blob/main/index.html
- https://github.com/bryantoualy-del/Rufus/blob/main/companion-v3.js
- https://github.com/bryantoualy-del/Nans/blob/main/index.html
- https://github.com/bryantoualy-del/Zephyr/blob/main/index.html
- https://github.com/bryantoualy-del/Kobe/blob/feat/kobe-vfx-pilot/src/ui/kobe-vfx.js

## Git history snapshot

At audit time: `main...feat/kobe-vfx-pilot` reports 23 commits ahead, 0 behind, 16 files added or modified. This is a snapshot, not a branch lock. PR #22 describes imported Kenney CC0 textures, but source inspection of `src/ui/kobe-vfx.js` shows a current *vector-generated* implementation. The documentation and gallery still refer to Kenney: reconcile before shipping.

## Integration constraints observed

- `src/ui/app.js`: `store.dispatch(make(type,payload))` precedes `vfxForCommand(type,payload)`; only trigger when `r.ok && !r.replay`. Keep this invariant.
- `vfxForCommand`: fireball only for `spell-cast`/fireball; mantle alone vs survivor-enhanced variant; Khar-Vek `pulse` or `rally`.
- `src/ui/sprite-vfx.js`: local URL validation, FPS/frame timings, image decode, Canvas 2D draw, cancellation, visibility pause, reduced motion, pointer-events:none. Retain this reader if sprite artwork passes quality validation.
- The currently inspected dice engines import Three.js from CDN; **full offline availability of dice is not established** by the VFX audit.
- The VFX gallery is mechanically isolated from encounters, but currently calls the rejected vector pilot.
- Official Khar-Vek dragon should remain unchanged. Do not redraw its outline or derive final artwork from generic external imagery.

## Art direction recommendation (subjective)

1. **Fireball:** organic textured ignition, one decisive impact, short decay; real hand-rendered transparent sprite frames rather than gradient/ring constructs.
2. **Mantle of Inspiration:** distinct golden protective fabric, woven light and subtle reveal; not an offensive explosion or a glowing circle.
3. **Khar-Vek:** compositing strictly around the approved official drum/dragon asset, two rhythmic strikes and restrained healing confirmation, preserve tail-to-head charge progression.

These are design judgements, **not source-code facts**.

## Acceptance gate

**Before updating combat UI:** show actual animated (not static reference) previews for all three abilities, inspect iPhone and landscape iPad scale, validate asset transparency and origin/licence, obtain user's artistic approval. Then wire assets through current renderer without changing mechanics, test `npm test`, `npm run build`, `npm run test:e2e`, offline reload, reduced-motion and RPG Connect integration. Do not claim these tests passed before execution; do not merge PR #22 automatically.
