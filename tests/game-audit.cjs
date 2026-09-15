const fs=require('fs'),ts=require('typescript'),assert=require('assert/strict');
fs.mkdirSync('work',{recursive:true});
for(const n of ['builds','equipment','heroes','chapters','battle','clothing','questions','year6-expansion','mixed-questions','progression-questions','reading-expansion','question-rewards','year2-questions'])fs.writeFileSync(`work/${n}.cjs`,ts.transpileModule(fs.readFileSync(`lib/${n}.ts`,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText.replace(/require\("\.\/(.*?)"\)/g,'require("./$1.cjs")'));
const {buildStats,ITEMS,HERO_TRAITS,itemUpgradeCost,referenceDps}=require('../work/builds.cjs'),{EQUIPMENT}=require('../work/equipment.cjs'),{simulate,rules,isBuildable}=require('../work/battle.cjs'),{SELECTABLE_HERO_IDS}=require('../work/heroes.cjs'),{questions,publicQuestion}=require('../work/questions.cjs');
assert.equal(ITEMS.length,24);assert.equal(new Set(SELECTABLE_HERO_IDS.map(i=>JSON.stringify(HERO_TRAITS[i].mods))).size,14);
for(const type of SELECTABLE_HERO_IDS)for(const w of EQUIPMENT)for(const level of [1,3,6,10]){const s=buildStats(type,level,w.id);assert(s.damage>=1&&s.cooldown>=.2&&s.range<=8&&s.critChance<=.5);}
const a=buildStats(0,1,'standard'),b=buildStats(0,1,'standard',{itemInventory:{stopwatch:1},equippedItems:['stopwatch']});assert(b.cooldown<a.cooldown);assert.deepEqual(buildStats(0,1,'standard',{itemInventory:{stopwatch:3}}),a);assert.deepEqual(buildStats(0,1,'standard',{itemInventory:{stopwatch:1},equippedItems:['stopwatch','stopwatch']}),b);assert.equal(itemUpgradeCost('stopwatch',3),null);
const preferred=[104,112,124,133,176,184,202,212,274,260,298,310,345,355,370,380].filter(isBuildable);const cells=[...new Set([...preferred,...Array.from({length:432},(_,i)=>i).filter(isBuildable)])];
const make=(n,level,wave=1)=>({rulesVersion:3,seed:12345,start:0,wave,duration:rules(wave).duration,power:0,target:0,contributors:0,fighters:Array.from({length:n},(_,i)=>({id:String(i),owner:'p'+i,name:'QA',type:[0,5,3,6][i%4],level,weapon:['standard','frost','tennis','blast'][i%4],cell:cells[i%cells.length]}))});
for(const n of [2,6,10,20,40])for(const level of [1,3,6,10]){const s=simulate(make(n,level));console.log(`${n} heroes L${level}: ${s.killed}/${s.count} in ${s.endedAt.toFixed(1)}s`);}
const solo=simulate(make(2,1));assert(solo.killed<solo.count);const team=simulate(make(10,1));assert.equal(team.killed,team.count);console.log('Team baseline',team.killed);assert.deepEqual(simulate(make(6,3)),simulate(make(6,3)));
for(const w of EQUIPMENT){const battle=make(1,10,40);battle.fighters[0].weapon=w.id;const s=simulate(battle);assert(s.events.length,w.id);assert(s.tracks.every(t=>t.every(Number.isFinite)));assert(s.events.every(e=>e.damage>=0));}
assert.equal(simulate({...make(1,1),rulesVersion:1}).count,8);
assert.equal(new Set(questions.map(q=>q.id)).size,questions.length);assert(questions.every(q=>q.answers.length&&q.prompt&&q.explanation));assert(questions.every(q=>!q.options||q.answers.some(a=>q.options.includes(a))));assert(!('answers' in publicQuestion(questions[0])));
const {ensureWardrobe}=require('../work/clothing.cjs');const legacy={uniform:'winter',uniforms:['winter'],gender:'girl'};ensureWardrobe(legacy);assert(legacy.clothingOwned.includes('blouse'));assert.equal(legacy.clothing.top,'blouse');
console.log('Questions:',questions.length,Object.fromEntries([...new Set(questions.map(q=>q.subject))].map(s=>[s,questions.filter(q=>q.subject===s).length])));
console.log('PASS: attributes, item caps, equipped-only bonuses, legacy battle, determinism, question structure, legacy clothes.');

const battleLib=require('../work/battle.cjs');
const undefended=simulate({...make(0,1),rulesVersion:4});assert.equal(undefended.schoolHealth,0);assert.equal(undefended.breaches.length,5);assert.equal(undefended.won,false);assert(undefended.endedAt<rules(1).duration/1000);
assert.equal(battleLib.schoolHealthAt([{at:1,monster:0,damage:20},{at:2,monster:1,damage:20},{at:3,monster:2,damage:20},{at:4,monster:3,damage:20}],4),20);
assert.equal(battleLib.breachDamage(5,0),30);assert.equal(battleLib.breachDamage(10,rules(10).count-1),60);
const protectedBattle=simulate({...make(10,1),rulesVersion:4});assert(protectedBattle.won);assert.equal(Object.values(protectedBattle.contributions).reduce((sum,c)=>sum+c.kills,0),protectedBattle.killed);
assert.equal(undefended.breaches.length,new Set(undefended.breaches.map(b=>b.monster)).size);
console.log('PASS: school HP, five ordinary breaches lose, elite/boss damage, early defeat, and unique kill attribution.');

const {spawnCost}=require('../work/heroes.cjs');assert.deepEqual([0,1,2,3,4].map(spawnCost),[120,600,1200,2000,3000]);for(let n=1;n<432;n++)assert(spawnCost(n)>spawnCost(n-1));console.log('PASS: deployment prices rise across the entire map capacity.');

assert(questions.every(q=>[10,20,30,40].includes(q.reward)&&q.rewardGroup));console.log('Reward groups:',Object.fromEntries(['quick','standard','challenge','extended'].map(g=>[g,questions.filter(q=>q.rewardGroup===g).length])));

const y2=questions.filter(q=>q.difficulty==='Year 2');assert(y2.length>=150);for(const subject of ['Maths','English','Verbal reasoning','Non-verbal reasoning'])assert(y2.filter(q=>q.subject===subject).length>=25);console.log('Year 2 questions:',y2.length);
