# Manor Quest

A cooperative Year 6 school-defence game for The Manor Preparatory School, Abingdon.

Pupils sign in with teacher-created nicknames and passwords. Typed questions award 20 coins for each correct answer. Coins buy up to three heroes per pupil, upgrades and cosmetic outfits. A shared 24 × 18 grid provides placement, collision checks and range-based combat. All clients use the same server-issued battle snapshot. Wins advance the class; losses preserve heroes and the current wave. At least four pupils must contribute a correct answer in each wave.

## Runtime

Vinext, React, Cloudflare Workers, D1 and R2. Set `TEACHER_PASSWORD` in local `.env` and in the hosted runtime. No pupil self-registration. Passwords use salted PBKDF2 hashes; sessions use HTTP-only cookies and hashed tokens. Game mutations use optimistic concurrency on the shared world record.

`npm run dev` starts the local preview. `npm run build` builds the Worker. `npm run db:generate` generates migrations. D1 migrations are in `drizzle/`; the Sites manifest declares DB and BUCKET bindings.

## Questions and photos

157 original typed-answer questions cover Maths, English comprehension, verbal reasoning and non-verbal reasoning. Correct questions are retired per pupil. Incorrect and skipped questions wait at least 24 hours. Photo uploads are stored privately; the teacher can view pupils' source images. Automatic question generation from photos is not yet connected.

## Art references

The house asset is a stylised interpretation, not an exact campus plan, based on the official school photograph:
https://www.manorprep.org/wp-content/uploads/2025/10/Video-Banner-1560x875.jpg

Classroom reference:
https://www.lawfull-associates.com/our-projects/learn/manor-preparatory-school-abingdon

The palette follows Manor's official website: deep green #00483a, cream #fffaee, gold #d0a300 and plum #7a3971.
