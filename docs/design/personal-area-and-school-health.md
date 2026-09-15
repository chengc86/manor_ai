# Personal area and school health

## School defence (new battles use rules version 4)

Each attempt starts with 100 school HP. An escaped ordinary monster deals 20 damage; monsters in an elite wave deal 30; the final boss deals 60. Thus four ordinary escapes are survivable, but the fifth defeats the school. Winning requires resolving all monsters with positive school HP. Zero HP stops simulation immediately, followed by a three-second result animation. A failed attempt stays on its wave and retains purchases/placements; the next attempt resets school HP to 100. In-progress older battles retain their prior rules.

The server persists the deterministic battle snapshot and final school HP/escape count. Clients derive the same live HP from timestamped breach events. A breach is counted once, and no damage is dealt after the simulation has ended.

## Personal progress and inventory

New cumulative statistics record final-hit kills, actual damage, control time, assisted damage, battles and victories. DOT kills count for the owning hero. Counters settle in the same optimistic database transaction as the battle result and cannot be applied twice. Previous complete battle history does not exist, so historical lifetime totals cannot be reconstructed; the UI states that combat totals begin with this update.

Backpack has Items, Weapons and Clothes tabs. Items default to owned inventory, with an explicit shop toggle; existing equip/upgrade logic is retained. Weapons remain associated with the deployed hero they were purchased for. Clothes can be worn or removed from the owned wardrobe; SHUS remains the purchase shop.

## Private mistake notebook

Wrong attempts persist independently of the latest question outcome, including attempt count, last submitted answer, last wrong time and correction time. Pages show unresolved/corrected/all entries, full question context and explanation. Retrying checks ownership, unresolved state and the 24-hour cooldown on the server. It resumes through the normal question/answer flow, awarding the usual 20 coins once when corrected. The corrected record remains visible but cannot be retried for another reward. An existing unanswered question must be finished first. Other pupils cannot read or retry these records. New subject switches are explicitly marked as unattempted and do not create mistake entries; old failed history is imported where available.

Validation: game-audit checks school damage, five-breach failure, elite/boss damage, early stop and kill totals. Persistence tests cover settlement once, review privacy, cooldown, corrected-history retention and single coin reward. No production wave or pupil purchase was triggered during testing.

## Unlimited test account

A teacher-created test profile can carry a persisted `unlimitedCoins` flag. Spending checks and deductions are bypassed only for that profile; ordinary pupils cannot set the flag through game actions. Its wallet displays infinity. Weapon levels, equipment slots, progressively more expensive deployments and between-wave restrictions remain normal. Regular player balances are untouched.

Deployment update: removed the personal two-hero cap. The first hero costs 120; hero n (n >= 2) costs 100 × n × (n + 1): 600, 1,200, 2,000, 3,000… Shared empty grass squares are the physical limit. Existing heroes remain, and moving/retrying does not charge again.
