# Manor Quest

A cooperative Year 6 school-defence game for The Manor Preparatory School, Abingdon.

Pupils sign in with teacher-created nicknames and passwords. Typed questions award 20 coins for each correct answer. Each pupil permanently chooses one hero type and boy/girl identity, receives two starter costumes, and can deploy up to two copies of their hero (120 then 600 coins). New copies start unarmed. Weapons cost 40–80 coins and can be upgraded for 40 then 80; paid costumes are cosmetic. So are rides (a skateboard, scooters, bikes, a go-kart, cars, a tractor, an ice cream van, a fire engine and a sailing boat): bought once in the Quest Shop's Rides aisle, repainted for free, and shown in the dressing room, on the pupil's picture and in the hero camp ([details](docs/design/shared-character-rig.md#cuter-heroes-and-rides--30-september-2026)). A shared 24 × 18 grid provides placement, collision checks and range-based combat. All clients use the same server-issued battle snapshot. The battlefield is drawn in 3D from that snapshot: heroes, monsters, the path and each chapter's scenery. The flat map is kept for devices without WebGL ([details](docs/design/3d-battlefield.md)). Wins advance the class; losses preserve heroes and the current wave. Every chapter has its own monster path, so a new chapter sends heroes back to reserve; placing them again is free, and coins are only spent on a new hero once all of a pupil's heroes are back on the map ([details](docs/design/chapter-routes-and-reserves.md)). There is no minimum number of contributing pupils. Victory depends on defeating the monsters.

## Runtime

Vinext, React, Cloudflare Workers, D1 and R2. Set `TEACHER_PASSWORD` in local `.env` and in the hosted runtime. No pupil self-registration. Passwords use salted PBKDF2 hashes; sessions use HTTP-only cookies and hashed tokens. Game mutations use optimistic concurrency on the shared world record.

`npm run dev` starts the local preview. `npm run build` builds the Worker. `npm run db:generate` generates migrations. D1 migrations are in `drizzle/`; the Sites manifest declares DB and BUCKET bindings.

## Questions

Year 6 pupils answer an original, Atom Learning–style bank of 2,276 questions in 116 topics, including a SATs practice strand modelled on the 2022–2025 KS2 papers ([details](docs/design/question-bank-v2.md)):

| Subject | Questions |
|---|---|
| Maths | 760 |
| English, including 9 original stories, texts and poems | 432 |
| Verbal reasoning | 420 |
| Non-verbal reasoning | 240 |
| Science (new) | 208 |

- **Choices:** most questions have four or five, and the wrong ones come from real mistakes. Each pupil sees the choices in their own order (picture choices keep their letters while the pictures move), so a friend's "it's C" gives nothing away. Choices with a natural order, such as numbers or < = >, stay in that order.
- **Formats:** pictures (base-10 blocks, number lines, bar models, charts, branching keys, circuits and NVR tiles), "choose two" questions and multi-page passages.
- **Read to me:** every question has a **Read to me** button in the hero's speech bubble (and beside it in the mistake notebook and on the help board); worked explanations have **Read it to me**. The device's own voice reads the question and its choices in British English where available, with maths signs, fractions, units and blanks said as words (`lib/speech-text.ts`). Reading passages are not read aloud, so comprehension still tests reading.
- **Helpsheets:** every topic has a one-page helpsheet that teaches the method without giving the answer. Pupils open it with **Need a hint?** in the mistake notebook (or from My topics), never while answering a practice question.
- **Earn coins:** Practise, timed Mock tests, and My topics (a mastery map with "practise my weakest topics"). Pupils can report a question that looks wrong, and the teacher sees class topic mastery and those reports.
- **Mock test coins:** each correct answer earns its usual coins, but only when every question has an answer, whether the pupil finishes or the time runs out. A test with any question left blank still shows its marks and adds wrong answers to the notebook, but pays nothing.
- **Old questions:** the original Year 6 questions are retired but kept, so open notebook entries and friends' hints still work.

The 327-question Year 2 bank is unchanged. Correct questions are retired per pupil. Incorrect and skipped questions wait at least 24 hours. Wrong answers never reveal the answer or explanation until the pupil gets the question right; instead they can post it to the Help a friend board, where classmates who first answer it correctly can send a hint. A helper earns 20 coins when their friend then gets the question right, and loses 10 if the teacher finds a hint that gives the answer away ([details](docs/design/help-a-friend.md)). Typed Maths answers (Year 2) may include the unit the question asks for, such as "22 cm" or "45p"; clicked choices must match exactly. There is no pupil upload library. The retired Year 6 bank included 200 11+ entrance-exam questions ([details](docs/design/entrance-questions.md)) and was re-checked in the [September 2026 audit](docs/design/question-audit-2026-09-26.md). Stable IDs keep existing pupil histories valid: new bank questions are `v2-<topic>-<nn>` and are only ever appended.

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

## Render + Supabase

See [deployment instructions](docs/render-supabase.md). Docker uses the separate `build:render` Next.js standalone target and the PostgreSQL database adapter. The existing Sites target continues using D1 until a deliberate migration is performed. Supabase requires a private DATABASE_URL. Never store production records in the container filesystem.
