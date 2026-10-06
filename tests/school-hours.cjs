// School-hours lock: weekday window in Europe/London, weekends, and Manor Prep holiday ranges.
const fs = require('fs'), ts = require('typescript'), assert = require('node:assert/strict'), {spawnSync} = require('node:child_process');
const dir = 'work/school-hours';
fs.mkdirSync(dir, {recursive: true});
const compile = (src, out) => fs.writeFileSync(`${dir}/${out}`, ts.transpileModule(fs.readFileSync(src, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}}).outputText.replace(/require\("(?:@\/lib\/|\.\/)(.*?)"\)/g, 'require("./$1.cjs")'));
compile('lib/school-hours.ts', 'school-hours.cjs');
compile('lib/school-lock-guard.ts', 'school-lock-guard.cjs');
const {isSchoolLocked, londonParts, schoolLockCopy, schoolLockPayload, SCHOOL_HOLIDAYS, SCHOOL_HOURS} = require(`../${dir}/school-hours.cjs`);

function atLondon(y, m, d, h, min) {
  const pad = n => String(n).padStart(2, '0');
  let t = Date.UTC(y, m - 1, d, h, min);
  for (let i = 0; i < 4; i++) {
    const p = londonParts(new Date(t));
    const got = Date.parse(`${p.date}T${pad(Math.floor(p.minutes / 60))}:${pad(p.minutes % 60)}:00Z`);
    const want = Date.parse(`${y}-${pad(m)}-${pad(d)}T${pad(h)}:${pad(min)}:00Z`);
    if (got === want) break;
    t += want - got;
  }
  const p = londonParts(new Date(t));
  assert.equal(p.date, `${y}-${pad(m)}-${pad(d)}`);
  assert.equal(p.minutes, h * 60 + min);
  return new Date(t);
}
const locked = (...a) => assert.equal(isSchoolLocked(atLondon(...a)), true, a.join(' '));
const open = (...a) => assert.equal(isSchoolLocked(atLondon(...a)), false, a.join(' '));

// Term-time Tuesday 6 October 2026 (BST): 8:40 inclusive, 4:00pm exclusive.
open(2026, 10, 6, 8, 39);
locked(2026, 10, 6, 8, 40);
locked(2026, 10, 6, 12, 0);
locked(2026, 10, 6, 15, 59);
open(2026, 10, 6, 16, 0);
open(2026, 10, 6, 20, 15);

// Weekends stay open through the school-hours window.
open(2026, 10, 10, 9, 0);
open(2026, 10, 11, 15, 0);

// October half-term is inclusive. The Friday before and the Monday after are school days.
locked(2026, 10, 16, 9, 0);
open(2026, 10, 19, 8, 40);
open(2026, 10, 30, 15, 59);
locked(2026, 11, 2, 8, 40);

// Christmas holiday, then the first morning of spring term (GMT).
locked(2026, 12, 11, 9, 0);
open(2026, 12, 14, 8, 40);
open(2027, 1, 5, 15, 0);
open(2027, 1, 6, 8, 39);
locked(2027, 1, 6, 8, 40);

open(2027, 2, 15, 9, 0);
open(2027, 2, 19, 15, 0);
locked(2027, 2, 22, 9, 0);
open(2027, 3, 26, 9, 0);
open(2027, 4, 20, 9, 0);
locked(2027, 4, 21, 9, 0);
open(2027, 5, 3, 8, 40);
locked(2027, 5, 4, 8, 40);
open(2027, 5, 31, 10, 0);
open(2027, 6, 4, 15, 0);
locked(2027, 6, 7, 9, 0);
locked(2027, 7, 9, 11, 30);
open(2027, 7, 12, 9, 0);
open(2027, 9, 3, 9, 0);
locked(2027, 9, 6, 8, 40);

open(2027, 10, 18, 9, 0);
open(2027, 10, 29, 15, 0);
locked(2027, 11, 1, 9, 0);
open(2027, 12, 20, 9, 0);
open(2028, 1, 10, 15, 0);
locked(2028, 1, 11, 8, 40);
open(2028, 2, 16, 9, 0);
open(2028, 4, 25, 9, 0);
locked(2028, 4, 26, 9, 0);
open(2028, 5, 1, 12, 0);
locked(2028, 5, 2, 9, 0);
open(2028, 6, 2, 15, 0);
locked(2028, 6, 5, 9, 0);

const copy = schoolLockCopy();
assert.equal(copy.locked, true);
assert.equal(copy.title, 'Your heroes have gone to school');
assert.match(copy.body, /outside school hours/i);
assert.equal(copy.hours, 'Monday to Friday, 8:40am–4:00pm');
assert.match(copy.note, /unlocks by itself/i);
assert.match(copy.note, /weekend/i);
assert.match(copy.note, /half-term/i);
assert.equal(schoolLockPayload().schoolLock.title, copy.title);
assert.equal(SCHOOL_HOURS.timeZone, 'Europe/London');
assert.equal(SCHOOL_HOURS.start.hour * 60 + SCHOOL_HOURS.start.minute, 8 * 60 + 40);
assert.equal(SCHOOL_HOURS.end.hour * 60 + SCHOOL_HOURS.end.minute, 16 * 60);
for (const holiday of SCHOOL_HOLIDAYS) assert(holiday.start <= holiday.end, holiday.name);

// Called from the test process, the HTTP guard stays out of the on-disk API suite.
const {schoolLockResponse} = require(`../${dir}/school-lock-guard.cjs`);
assert.equal(schoolLockResponse(atLondon(2026, 10, 6, 9, 0)), null);

// A normal server process still refuses play during the window and allows it at 4:00pm.
fs.writeFileSync(`${dir}/check-guard.cjs`, `const {schoolLockResponse}=require('./school-lock-guard.cjs');
(async()=>{
  const locked=await schoolLockResponse(new Date('2026-10-06T07:40:00Z'));
  if(!locked||locked.status!==403) throw new Error('expected 403 during school');
  const body=await locked.json();
  if(body.schoolLock?.title!=='Your heroes have gone to school'||body.schoolLock.hours!=='Monday to Friday, 8:40am–4:00pm') throw new Error('lock payload');
  if(schoolLockResponse(new Date('2026-10-06T15:00:00Z'))!==null) throw new Error('4:00pm should be open');
  if(schoolLockResponse(new Date('2026-10-19T08:00:00Z'))!==null) throw new Error('half-term should be open');
  if(schoolLockResponse(new Date('2026-10-10T08:00:00Z'))!==null) throw new Error('Saturday should be open');
  console.log('PASS: server guard');
})().catch(e=>{console.error(e);process.exit(1)});
`);
const guard = spawnSync(process.execPath, [`${dir}/check-guard.cjs`], {encoding: 'utf8'});
if (guard.status !== 0) { console.error(guard.stdout, guard.stderr); process.exit(guard.status || 1); }
process.stdout.write(guard.stdout);
console.log(`PASS: school hours, weekends and ${SCHOOL_HOLIDAYS.length} Manor Prep holiday ranges.`);
