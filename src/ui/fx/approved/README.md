# Approved Kobe fire assets

Upload **exactly** `fireball.gif` and `firebolt.gif` here. The latter must be the **directional** 9-frame original, not the rejected mini-fireball.

Both files are generated original artwork approved by the user. No external runtime requests.

Once uploaded, the combat presentation uses them in `src/ui/kobe-vfx.js`. The service worker must then precache both paths and offline tests must be run before merging.

## Current production asset
- `fireball_transparent.webp`: approved 9-frame animation with transparent background; replaces `fireball.gif` for Fireball playback.
- `fireball.gif`: retained as archive, not loaded by combat or offline precache.
- `firebolt.gif`: still pending upload; Fire Bolt has no approved visual fallback.
