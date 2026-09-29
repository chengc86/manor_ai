# Shared character rig prototype

The My Hero Outfit Studio previews three vector skins (fox, bear, rabbit) on a shared 2D joint hierarchy. Torso, head, shoulders and hips define local transforms. Sleeves and hands are children of their shoulder joint; trousers and shoes are children of hip joints. Headwear belongs to the head joint. Idle, walking and attack animations reuse the hierarchy. Reduced-motion preferences disable animations.

This is a style and fitting prototype, not a conversion of the 114 existing raster heroes. It deliberately does not spend coins, change selected heroes, or alter saved clothing. The existing production renderer remains active while this style is assessed. Next production step: approve visual direction, add garment-specific sleeve lengths and additional body families, map owned clothing IDs, then roll out by hero family with legacy fallback.

## Future reward collections

Keep permanent ownership separate from equipped/displayed state. Use stable catalogue IDs, categories (wardrobe, vehicle, home, toy), prices and renderer/attachment metadata. Server-authoritative purchases must check the catalogue price, balance, and transaction receipt, then persist ownership atomically. No duplicate charges for re-equipping or moving owned possessions.

Vehicles need parking/riding anchors and a garage display; homes need a personal plot and furnishing anchors; toys need hand, floor and shelf attachments. These are future features, not currently purchasable. Cosmetic possessions should not silently change combat stats. Continue using earned coins, with meaningful savings goals rather than charging to display an already-owned item.

## 3D direction — 29 September 2026
The user rejected the flat skirt and chose 3D as the direction for the roster.
`app/hero-3d.tsx` is a Three.js procedural art study of fox, bear and rabbit.
The dressing room now offers real geometry, shaped skirt, rotatable view,
attached sleeves/accessories and idle/walk/attack motion. `/hero-study` is an
account-free preview containing no player data or purchase operations.

This does not convert the live roster. These are rigid articulated mesh parts,
not finished, deforming skinned character assets. Production requires authored
GLB models, garment meshes fitted to body families, animation clips and testing
for intersections in each pose. Preserve hero IDs and owned item IDs during
migration. Use the same final assets for portraits and the battlefield; test
class-size performance before replacing battlefield sprites. Future bikes,
cars, houses and toys can use separate 3D assets and attachment points.

Three.js supports production skinned meshes and glTF loading:
https://threejs.org/docs/pages/SkinnedMesh.html
https://threejs.org/docs/pages/GLTFLoader.html

## Local selected-hero batch
Read the public class roster on 29 September and found 23 distinct selected hero
IDs excluding test accounts. No student names or records are stored in source.
First eight studies: 16 Tumble, 19 Pebble, 21 Acorn, 10 Scout, 14 Bamboo,
15 Leo, 37 Saffron and 43 Truffle. `lib/hero-3d-catalogue.ts` retains their stable
IDs for eventual integration. Preview only: no changes to purchases, database,
hero selection, battle renderer or damage calculations. User explicitly asked
that this work remain local, uncommitted and unpushed.

Remaining selected IDs at this snapshot: 1,2,3,4,6,11,12,13,29,30,31,35,36,69,82.
The initial eight still need art refinement and full animation/garment review.

## Completed chosen-roster preview batch
The user subsequently requested completion, refinement and commit/push after
verification. The roster was rechecked: the same 23 distinct non-test selected
hero IDs are covered. All now appear in the dressing-room catalogue. This is a
completed preview batch, not a switch of the live battlefield to 3D.

Refinements include visible iris/highlight geometry above face markings, closed
shirt waist, wider arm clearance around skirts, distinctive species features,
retained orbit camera during outfit changes, and shadow-resource cleanup.
Browser verification exercised all 23 selections, 46 walk/attack selections and
69 outfit changes without browser console errors. A contact sheet of every
character and a rear view of the rabbit skirt were visually reviewed. Production
build and TypeScript checks passed. No player data or economy changes.
