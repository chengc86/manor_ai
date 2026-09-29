# 3D battlefield

The class map is now drawn in 3D with three.js: the lawn, the monster path, the chapter scenery, The Manor, the hero camp, every placed hero and every monster. Nothing about the game changes. The server, the battle snapshot and `simulate` in `lib/battle.ts` are untouched, and the 3D board replays the same deterministic battle as the flat map, so every pupil still sees the same fight.

## What pupils see

- **Heroes** are the same procedural models as the dressing room (`lib/hero-model.ts`), wearing their clothes and holding their weapon. They stand on a ring in their team colour, face the path, and turn and swing when they attack. The camp keeps every pupil's hero in the back two rows.
- **Monsters**: each of the 12 enemy kinds has a 3D model based on its artwork in `public/enemies` (`lib/monster-model.ts`). They walk out of a swirling portal at the entry, follow the path with the flat map's rounded corners (`lib/route-visual.ts`), and carry a health bar. Their walk is timed to the distance they cover, so a frozen monster stands still. Bosses are 1.6× larger with a crown and a gold bar.
- **Attacks**: each of the 18 weapons throws its own projectile (pencils, footballs, shuttlecocks, hearts…) with a sparkling trail. Ruler and fork attacks are slashes. Hits burst into rings and sparks, and splash weapons show their radius. Freeze puts the monster in an ice block, slow leaves a glue puddle, a mark shows a pink target, and paint glows. Damage numbers, BOSS/FROZEN/MARKED/SLOWED tags and "Defeated!" float above the action.
- **The Manor** is a Georgian house at the goal. It flashes red and shows "−20 HP" when a monster gets through.
- **Chapters**: each of the 30 chapters has a look (`lib/board-theme.ts`) made of a scenery kit, a time of day, weather and a path surface. The 11 kits are the campus, a courtyard, the gates, a playground, the sports hall, Abingdon town, the abbey, the river, Oxford, museums and the botanic garden. Times of day are day, golden, evening, night and overcast. Weather is petals, sunbeams, motes, leaves, rain or lanterns. Path surfaces are gravel, flagstone, cobble or tarmac. Landmarks include the County Hall, the bridge, the Radcliffe Camera dome, a dinosaur skeleton and glasshouses. Manor Legends chapters reuse the 30 looks.
- **Placing**: every free square shows a framed "+". Pointing at a square lights it and shows a see-through preview of the pupil's hero with its range ring. Pointing at a placed hero shows its name and range.

## Controls

Drag to move around, scroll or pinch to zoom, and right-drag or use two fingers to turn. The toolbar has zoom in and out, turn left and right, and Fit map, which returns to the whole-board view. The view is framed on the whole board until someone moves it. A tap (a press without dragging) opens a hero or a square, just like a click on the flat map.

**3D | Flat** in the toolbar switches views. Each device remembers the choice. The flat map is the previous board, unchanged. It is also used automatically when the device has no WebGL or the graphics context is lost.

## Accessibility

A visually hidden button for every placement square and every camp hero keeps the whole board reachable with the keyboard and screen readers, using the same labels as the flat map. Focusing a square highlights it in 3D. "Scenery motion: off" and the reduced-motion setting stop the weather, idle bobbing and camera tweens. Monsters and projectiles still move, because they show the fight.

## Performance

A full class (40 camp heroes, 80 armed heroes) and a busy wave render in about 190 draw calls and 550k triangles.

- Each hero is baked once per look and weapon into a single low-poly, rigidly skinned mesh (`lib/rig-bake.ts`). The camp hero and the deployed heroes of one pupil share that bake. The original animation code still drives it.
- All the scenery merges into a few vertex-coloured meshes (`lib/board-props.ts`, `lib/board-scenery.ts`). Trees, flowers, shadows, rings, placement tiles and health bars are instanced.
- Shadows from buildings and trees are rendered once per chapter, not every frame.
- The pixel ratio drops on slow devices and rises again when there is headroom. The board stops drawing while it is off screen or the tab is hidden.

On a desktop GPU (Quadro RTX 4000) a frame costs 2–3 ms at 1882×975 and about 1.4 ms of scene updates. School laptops should be slower but usable. If a device struggles, the flat map is one tap away.

## Code

- `app/game-board.tsx`: chooses 3D or flat, owns the toolbar and HUD, and lazy-loads the 3D board.
- `app/board-3d.tsx`: renderer, camera controls, picking, labels and the keyboard layer.
- `lib/board-scene.ts`: the scene. It keeps heroes, the camp and monsters in sync and replays the battle each frame, without the DOM, so it also runs in tests.
- `lib/board-scenery.ts` and `lib/board-props.ts`: lawn, path, portal, The Manor, chapter kits, trees and water.
- `lib/board-effects.ts`: projectiles, impacts, status effects, health bars and weather.
- `lib/board-heroes.ts`, `lib/monster-model.ts` and `lib/weapon-model.ts`: characters and weapons.
- `lib/board-textures.ts`: generated textures, so no new image files were needed.

`tests/board-3d.cjs` checks all 40 chapter looks, that monsters stay on every route, that every monster and all 342 hero/outfit bakes stay within budget, that no scenery rises inside the squares heroes use in any chapter, and a full headless wave that must leave the simulation unchanged.

## Limits

These are procedural art studies, like the dressing room: rigid parts, not authored, deforming GLB characters. The chapter backdrops evoke each real place rather than reproducing it. The painted chapter art is still used by the flat map.
