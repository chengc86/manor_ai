# Shared character rig prototype

The My Hero Outfit Studio previews three vector skins (fox, bear, rabbit) on a shared 2D joint hierarchy. Torso, head, shoulders and hips define local transforms. Sleeves and hands are children of their shoulder joint; trousers and shoes are children of hip joints. Headwear belongs to the head joint. Idle, walking and attack animations reuse the hierarchy. Reduced-motion preferences disable animations.

This is a style and fitting prototype, not a conversion of the 114 existing raster heroes. It deliberately does not spend coins, change selected heroes, or alter saved clothing. The existing production renderer remains active while this style is assessed. Next production step: approve visual direction, add garment-specific sleeve lengths and additional body families, map owned clothing IDs, then roll out by hero family with legacy fallback.

## Future reward collections

Keep permanent ownership separate from equipped/displayed state. Use stable catalogue IDs, categories (wardrobe, vehicle, home, toy), prices and renderer/attachment metadata. Server-authoritative purchases must check the catalogue price, balance, and transaction receipt, then persist ownership atomically. No duplicate charges for re-equipping or moving owned possessions.

Vehicles need parking/riding anchors and a garage display; homes need a personal plot and furnishing anchors; toys need hand, floor and shelf attachments. These are future features, not currently purchasable. Cosmetic possessions should not silently change combat stats. Continue using earned coins, with meaningful savings goals rather than charging to display an already-owned item.
