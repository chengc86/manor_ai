# New routes each chapter, free re-placement and refunds

## Placing heroes again is free

Winning a chapter's boss wave sends every hero to reserve, because the next chapter has a different path. Heroes keep their weapons and upgrades. Placing a reserve hero again is free, and the server now enforces this: a Deploy request from a pupil with a hero in reserve places that hero (the earliest-bought first) at the chosen square instead of buying a new one. Coins are only spent on a new hero once all of a pupil's heroes are back on the map.

The page matches the rule. While a pupil has heroes in reserve, the main button in "Your hero, your defence" reads "Place Bramble #1 again · Free", and clicking an empty square offers only free placement with a note that new heroes can be bought once every hero is placed. The paid Deploy button returns when nothing is left in reserve.

## One-off refunds

Before this change, a pupil with heroes in reserve could press the paid Deploy button and buy a new hero instead of placing their own. The first time the updated server reads the class world it refunds those purchases once (`refundReserveDeploys` in `lib/world.ts`), then records that the check has run.

There is no timestamped purchase log, so the check uses each pupil's last 64 transaction receipts together with where their heroes stand now:

- A hero still on the square where it was bought (never moved since) was bought after the latest chapter reset.
- If, at that point, one of the same pupil's older heroes was waiting in reserve (it still is, or it was only placed back on the map after the purchase), the price of the new hero is refunded. The pupil keeps the new hero.
- "Placed back after the purchase" is only trusted when some hero in the class is still in reserve, which shows a chapter reset has really happened since reserves were introduced.
- Test accounts with unlimited coins are skipped.

Limits: a purchase is missed if the pupil moved the new hero after buying it, if more than 64 transactions have happened since, or if two chapter resets happened before the update. A pupil who placed their old heroes first, bought a new hero legitimately and then moved an old hero may be refunded when they did not need to be. Refunded pupils see a one-time message; the teacher's class register shows "N refunded" under each refunded pupil's coins.

## A new route every chapter

The chapter the class is in when this update arrives keeps its route, so nobody's heroes move. From the next chapter onwards, each chapter takes the next of nine hand-designed routes in `lib/map-layout.ts` (`ROUTES`), cycling after nine chapters, so consecutive chapters never share a path. The first chapter that uses them is stored as `routeFrom` in the class world. A brand-new class starts on the original route and changes from chapter 2.

Every route enters on the left edge and ends at The Manor. They were tuned in the battle simulator: with the same squad placed to cover as much of the path as it can, each route defeats a similar share of monsters to the original across waves 15–50 (within 8 percentage points, checked in `tests/chapters-enemies.cjs`). A new layout changes where heroes should stand, not how hard the chapter is.

Each battle snapshot stores its route, so a wave in progress never changes shape, and every client animates the same path as the server. Old pages are asked to refresh (client version 4) so nobody sees an outdated path at the next chapter.
