# Admin Abuse · Monday 12 October 2026

One event, from 18:00 inclusive to 20:00 exclusive in Europe/London (BST, 17:00–19:00 UTC). Deploy this version before the event. No cron job or manual activation is needed: the server clock controls the event and the regular game poll updates the clients.

The sign announces the date, time, gift and bonus before the event and shows the remaining minutes while live. It disappears afterwards. Gold materials cover only scenery and the lawn, in both map views. Road geometry, road colours, placement squares, characters and monster movement stay as before. The normal chapter appearance returns automatically at 20:00.

Every pupil who signs in and loads the game during the event receives one permanent Golden Manor Medal in their backpack. A pupil with every item pocket occupied also gets one permanent extra pocket, even if they already have the usual four. Gifts are saved through the world’s existing optimistic concurrency check. Refreshing, reconnecting, opening two tabs or retrying requests cannot duplicate them. Offline pupils receive no gift. Attendance also permanently unlocks the Admin Abuse achievement. The first attendance saves the IDs of every defender the pupil already owns, including reserve heroes, and awards each an Admin Abuse trophy. The cosmetic cup and its label appear on those individual heroes in 3D, the flat map and their profiles. Heroes bought later never inherit a trophy, even during the event. An ongoing battle receives only the cosmetic trophy flag; its combat statistics stay unchanged. Items are still equipped between waves, so a gift never changes a running battle’s snapshot.

Correct practice and notebook answers earn their usual reward plus five coins when marked during the event. Completed mock tests get the same bonus per correct answer when marked during the event; incomplete tests still pay nothing. Wrong answers earn nothing. Rewards revert at 20:00, including questions opened earlier.

The original instrumental rock loop is in `public/audio/admin-abuse-rock.wav`; `python3 scripts/generate-event-rock.py` regenerates it without external samples. The event attempts playback at low volume, retries after the first user interaction if the browser blocks autoplay, and includes a Play/Mute control. Music stops when the event ends or the page closes.

Validation: `node tests/admin-event.cjs`, `node tests/ride-wave.cjs`, `tsc --noEmit`, and `RENDER_BUILD=1 next build --webpack`.
