# Manor Quest

A cooperative Year 6 school-defence game for The Manor Preparatory School, Abingdon.

Pupils sign in with teacher-created nicknames and passwords. Typed questions award 20 coins for each correct answer. Coins buy up to three heroes per pupil, upgrades and cosmetic outfits. A shared 24 × 18 grid provides placement, collision checks and range-based combat. All clients use the same server-issued battle snapshot. Wins advance the class; losses preserve heroes and the current wave. At least four pupils must contribute a correct answer in each wave.

## Runtime

Vinext, React, Cloudflare Workers, D1 and R2. Set `TEACHER_PASSWORD` in local `.env` and in the hosted runtime. No pupil self-registration. Passwords use salted PBKDF2 hashes; sessions use HTTP-only cookies and hashed tokens. Game mutations use optimistic concurrency on the shared world record.

`npm run dev` starts the local preview. `npm run build` builds the Worker. `npm run db:generate` generates migrations. D1 migrations are in `drizzle/`; the Sites manifest declares DB and BUCKET bindings.

## Questions

257 original typed-answer questions cover Maths, English comprehension, verbal reasoning and non-verbal reasoning. Correct questions are retired per pupil. Incorrect and skipped questions wait at least 24 hours. There is no pupil upload library. The teacher supplies textbook photos in the Codex conversation; reviewed, original questions can then be added to the bank. The latest expansion adds 25 questions per subject, with stable IDs so existing pupil histories remain valid.

## Art references

The house asset is a stylised interpretation, not an exact campus plan, based on the official school photograph:
https://www.manorprep.org/wp-content/uploads/2025/10/Video-Banner-1560x875.jpg

Classroom reference:
https://www.lawfull-associates.com/our-projects/learn/manor-preparatory-school-abingdon

The palette follows Manor's official website: deep green #00483a, cream #fffaee, gold #d0a300 and plum #7a3971.

## Curriculum and progression

Maths and English follow England’s upper Key Stage 2 programmes, relevant to Manor Prep in Abingdon. Verbal and non-verbal reasoning are supplementary entrance-exam preparation, not separate National Curriculum subjects.

- https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study/national-curriculum-in-england-mathematics-programmes-of-study
- https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study/national-curriculum-in-england-english-programmes-of-study

Seven heroes have three named tiers each. Upgrades increase damage, range and attack speed; Tempest gains a third lightning target at tier 3 and Ember increases its splash radius. Hero stats, costs and names are shared by the server and UI in lib/heroes.ts. New purchases join the next wave; upgrades and movement take place between waves.
