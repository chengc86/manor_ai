# Shared world and persistence

All authoritative player and class state is stored in SQL: accounts and password hashes, sessions, coins, answer history and active questions, hero choice, wardrobe ownership/equipment, weapon ownership and levels, item levels/slots, placements, class wave, battle snapshot/seed/start time/duration, and latest result. Badges and chapter progress are derived from persisted counters. Bundled question text, artwork and balance definitions remain versioned application assets. Tab, zoom, hover and unsent answer text are transient interface state.

Render uses Neon/Postgres (`manor_quest` schema). The existing Sites preview uses its own D1 database. These are separate environments; classmates must use the same deployment URL to share one world. No change in this update merges or overwrites either environment's records.

Unchosen profiles remain in the teacher register but are excluded from the public squad and camp. Old accounts with deployed heroes retain their selected identity. The account header and hero page show a neutral placeholder until a choice is confirmed.

The database revision guards every world mutation. Each battle start also checks a persisted battle version: two simultaneous starts can commit only once, and a delayed request cannot launch the next/retry wave after the first finishes. A saved deterministic battle snapshot lets late joiners and restarted servers reconstruct the same fight. An expired battle is settled once on the next read/mutation, even if nobody stayed online.

Clients poll once per second and immediately on focus/return to a visible tab; lower-revision responses cannot replace newer state. All users see the same map, fighters, wave and result, while coins, shops and answer forms remain personal. Start is disabled during a known battle; the server also rejects competing requests before the next poll. This is polling, so connected screens may take around one second plus network delay to reflect another player's start.

Validation: `node tests/persistence.cjs` exercises the real game handlers against an on-disk SQLite database without touching live users. It checks reopen persistence for answers, coins, wardrobe, items and placements; private pending-question restoration; unselected squad filtering; concurrent starts; late joining; active-battle reopen; stale starts after settlement; and separation of pupil statistics. Render and Sites builds are also checked. A full 40-device load test remains outstanding.
