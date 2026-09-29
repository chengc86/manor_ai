# Fitted wardrobe and hero cards

Clothing now uses SVG garment shapes and each character's alpha silhouette, rather than stretching product photographs across the sprite. Attachment points in `lib/hero-fit.ts` control the neck, torso, waist and head; `HERO_ART` provides existing per-character neck adjustments. Capes render behind the base art, clothes follow its outline, and skirt hems extend beyond the legs. Original character images are unchanged. This remains a 2D rendering system, not a skeletal/3D outfit rig; unusual silhouettes can be tuned with fit overrides.

Twelve accessories use five independent slots: head, neck, back, badge and wrist. They use the existing authenticated clothing purchase flow, coin prices, persistent wardrobe and free re-equipping. SHUS displays the item on the player's own hero before buying.

Selecting a hero in the map's camp opens a read-only profile derived from the latest class world. It shows the decorated portrait, adventurer level, correct-answer and combat totals, owned clothing, items, defenders and weapon levels. Public profile data does not contain answer history, mistakes, sessions or credentials. Editing another player's inventory is not exposed.
