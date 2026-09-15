# Manor Quest implementation and audit

## Delivered

14 distinct Hero trait sets; 18 weapons with category-specific damage scaling, critical hits, attack rate, range and level milestones; 24 stat Items, permanent inventory, two initial slots expandable to four, Item levels 1–3; explicit preview before buying or replacing equipment; shared deterministic battle snapshots; contribution display for damage, control and support. Clothing remains cosmetic. Heroes keep equipment when changed for 1,000 coins.

The design document describes the intended system. This report records the implemented release and evidence; numbers are starting balance, not a promise that every team arrangement wins.

## Findings and fixes

- Old power gauge ignored weapon mechanics and Item bonuses. Removed the misleading victory-threshold presentation; actual armed count and build stats are shown.
- Seven additional Hero appearances shared old archetype stats. All 14 now have distinct visible trade-offs.
- Weapon damage previously multiplied directly by level, while late enemy health grew without regard to that formula. New damage and attack-speed formulas, capped multi-target effects, and a versioned enemy curve are used.
- Old cooldown scheduling rounded away small attack-speed gains. New scheduling carries the next attack time forward rather than restarting it at the current tick. A rapid weapon produced 105 versus 118 shots with a speed Item in the same high-health encounter.
- A mid-wave recruit could spend money without joining that wave's immutable fighters. Recruiting is now between waves, as are build changes.
- Concurrent purchases/upgrades could be confused by repeated requests. Paid transactions require request IDs, retain 64 receipts per player, reject reused IDs with changed payloads, and use existing world revision checks. UI blocks immediate repeat clicks and preserves the ID after a failed request for retry.
- Map range previews used a default weapon and could display the wrong coverage. They now use the actual weapon and owner loadout.
- UI navigation to the new Items tab initially lacked its heading and threw at runtime. Found through browser audit, repaired and rechecked.
- DOT damage appeared to launch another projectile. It now remains paint damage instead of a fresh weapon animation. Status labels use effect durations.
- Original bank contained 289 questions, yielding at most 5,780 coins. One weapon's level 1→10 upgrades alone cost 6,180. Added 1,028 stable-ID questions, bringing the bank to 1,317: Maths 935, English 53, verbal reasoning 173, non-verbal reasoning 156. Old IDs and histories are unchanged. Additions use arithmetic, percentage, fraction, unit-conversion, letter-code and spatial-transformation families. They are variations, not 1,028 bespoke reading passages.
- Unresolved waves previously waited out a long worst-case timer even after enemies escaped. New battles end when every monster is defeated or has passed the exit, plus a short result animation.

## Evidence

`node tests/game-audit.cjs` checks all Hero/weapon/level combinations, caps, unique trait sets, equipped-only Item bonuses, duplicate Item resistance, deterministic simulation, valid question IDs/options, public question responses without answers, and legacy clothing conversion. All passed.

Local API workflow passed: insufficient funds; simultaneous identical purchase requests charging once; changed-payload replay rejection; ownership; full slots/replacement; max Item levels; max slots; Hero change preserving weapon/Item levels; incorrect-answer replay rejection; no immediate repeated question; shared battle snapshots; live-wave restrictions. Disposable QA accounts were removed after testing.

Browser audit: signed into a disposable local account, opened Items, inspected owned equipment/slots, opened a purchase preview, verified before/after damage, attack rate, range, critical chance and DPS; inspected the rendered modal. This caught the navigation bug above. It was not a comprehensive device/accessibility certification.

Neon adapter exercised a temporary dedicated-schema row through parameterised insert, upsert, select and cleanup. The row was removed. Existing application records were not modified. Render TypeScript production build and Sites production build are release checks. No Docker image was built on this machine.

## Balance samples

Same fixed seed, valid distinct grid cells, mixed weapons and no Items, wave 1 (18 enemies):

| Team | Defeated | Outcome |
|---|---:|---|
| 2 level-1 Heroes | 0/18 | fail |
| 6 level-1 Heroes | 11/18 | fail |
| 10 level-1 Heroes | 18/18 | win |
| 6 level-3 Heroes | 18/18 | win |
| 2 level-10 Heroes | 12/18 | fail in this arrangement |

Additional late-game samples used valid distinct high-coverage cells and four level-3 Items per player. At wave 300, ten level-10 Heroes defeated 6/48, while forty defeated 48/48. These are sampled builds, not exhaustive optimal-play guarantees. No forced participant-count gate is used.

## Practical limits and follow-up

- The game loop now makes sense for cooperative progression: answer → save → buy/upgrade a build → see its effect in a shared battle → retry without losing purchases. Low DPS control/support builds can show their contribution.
- The bank supports substantially more progression but is still finite and heavily weighted toward generated maths variations. Continue adding teacher-provided textbook material, especially English comprehension; the implementation does not claim comprehensive curriculum coverage or unlimited fresh content.
- The current site remains Sites-hosted with its original durable database. Neon is prepared and adapter-tested for the Render deployment; it is not silently substituted for the live site database.
- Multiplayer is shared state with polling and deterministic playback, not a newly implemented WebSocket/Phaser engine. A 40-device real classroom load test has not been performed. Current whole-world JSON storage may warrant normalised question histories and a server cache before sustained large deployments.
- Assets remain 2D sprites with overlays, not fully rigged clothing animation. Item cards use functional icons and text; they do not reintroduce unwanted visible decorations.
- Active old-rule battles retain their previous formulas. Subsequent waves use the new version; existing weapon levels are preserved but their computed performance changes under the new balance.
