# Expanded hero roster

100 new original characters join the 14 existing heroes: 32 animals, 35 wonders (robots, nature sprites and friendly fantasy creatures), and 33 playthings. IDs 16–115 are append-only; original hero and legacy tower IDs are unchanged. Generated raster artwork is kept distinct per character, with transparent backgrounds. The shipped WebP files retain source dimensions and alpha; reviewed neck anchors keep clothing below taller faces; source PNGs remain in the generated-assets workspace. Prompt provenance is in `docs/art/hero-100-prompts.json`.

Each child chooses one hero identity. Additional deployments are copies of that identity, with separately purchased weapons and upgrades. A 1,000-coin identity switch transforms every owned defender while retaining weapons, weapon levels, placements, clothing, backpack items and learning records. It releases the old identity for another child.

New choices and switches are exclusive across the class, enforced inside the revision-checked database transaction. Concurrent requests for one character therefore have only one winner. The public class roster supplies availability to the picker; the server remains authoritative. Existing records are not silently reassigned or deleted. Any historically shared selection remains intact until those players switch; it cannot be newly claimed while occupied.

The chooser has name/creature/role search, family filters, an available-only filter and 24-card pages. It shows taken/current heroes and handles a hero being claimed while the confirmation dialog is open. Old clients must refresh before receiving expanded hero IDs.

Combat uses the established 14 balanced profiles, shared across the new visual identities. This avoids making access to a unique character a power advantage. Existing costs, weapon effects and progression remain unchanged.

Validation covers all roster IDs, names, assets, alpha channels, equipment rendering and bounded gallery output, alongside real route/database tests for simultaneous claims, failed claims without spending, paid bulk switching, released identities and persistence across database reopen.
