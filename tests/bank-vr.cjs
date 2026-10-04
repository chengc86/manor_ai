// Verbal reasoning bank (lib/bank-vr*.ts): re-checks every answer independently of the templates that made it.
// Word puzzles are re-solved from the question text against the word lists in lib/bank-vr-lexicon.ts; codes, series, sums
// and logic are re-solved by the small solvers below; vocabulary is checked against the reference lists kept in this file.
// node tests/bank-vr.cjs
const path=require('path');
const buildLib=require('./build-lib.cjs');
const dir=buildLib('bank-vr',[],{only:['Verbal reasoning']});
const {bankQuestions,bankTopics}=require(path.join(dir,'bank.cjs'));
const lex=require(path.join(dir,'bank-vr-lexicon.cjs')),wordsPart=require(path.join(dir,'bank-vr-words.cjs'));
const fails=[];const fail=(q,msg)=>fails.push(`${q.id??q}: ${msg}`);
const qs=bankQuestions.filter(q=>q.subject==='Verbal reasoning');
const byTopic=id=>qs.filter(q=>q.topic==='vr-'+id);
const stim=q=>(q.stimulus??'').split('\n');
const WORD=new Set([...lex.LEXICON].map(w=>w.toLowerCase())),isWord=w=>WORD.has(String(w).toLowerCase());
const W4=[...WORD].filter(w=>w.length===4);
const ABC='ABCDEFGHIJKLMNOPQRSTUVWXYZ',N=c=>ABC.indexOf(c),L=n=>ABC[n];
const same=(a,b)=>JSON.stringify([...a].sort())===JSON.stringify([...b].sort());
/** Words that must never appear in a question or hide across a word boundary. Kept here, not in the shipped lists. */
const UNSUITABLE=new Set('rape raped tits tit poo poop pee piss shit crap damn hell arse bum bums butt fart sexy sex kill dead die died drug drunk bomb guns gun idiot stupid ugly fat hate nude boob'.split(' '));
for(const q of bankQuestions.filter(x=>x.subject==='Verbal reasoning'))for(const w of [q.prompt,q.stimulus??'',...q.options].join(' ').toLowerCase().match(/[a-z]+/g)??[])if(UNSUITABLE.has(w))fails.push(`${q.id}: unsuitable word "${w}"`);
const permutations=n=>{if(n===1)return [[0]];const out=[];for(const p of permutations(n-1))for(let k=0;k<=p.length;k++)out.push([...p.slice(0,k),n-1,...p.slice(k)]);return out;};

// ── The bank as a whole ──
const TOPICS={'Vocabulary':['synonyms','antonyms','definitions','double-meanings','odd-ones-out','word-analogies'],'Words and letters':['hidden-words','missing-letters','compound-words','move-a-letter','shared-letter','anagrams','word-ladders'],'Codes and sequences':['letter-sequences','letter-codes','number-codes','letter-analogies'],'Numbers and logic':['number-sequences','number-relations','letter-sums','logic']};
const topics=bankTopics.filter(t=>t.subject==='Verbal reasoning');
for(const [strand,ids] of Object.entries(TOPICS))for(const id of ids){const t=topics.find(x=>x.id==='vr-'+id);if(!t){fail('vr-'+id,'topic missing');continue;}if(t.strand!==strand)fail(t.id,`strand ${t.strand}, expected ${strand}`);if(byTopic(id).length<20)fail(t.id,`only ${byTopic(id).length} questions`);}
if(topics.length!==21)fail('bank',`${topics.length} topics, expected 21`);
if(qs.length<400)fail('bank',`${qs.length} questions, expected at least 400`);
// The same code must build the same bank every time (IDs are pupil records).
{const again=require(path.join(buildLib('bank-vr-again',[],{only:['Verbal reasoning']}),'bank.cjs')).bankQuestions.filter(q=>q.subject==='Verbal reasoning');
 if(JSON.stringify(again)!==JSON.stringify(qs))fail('bank','two builds made different questions');}
const levels={};for(const q of qs)levels[q.rewardGroup]=(levels[q.rewardGroup]??0)+1;
if(!(levels.standard>levels.quick&&levels.standard>levels.challenge&&levels.quick>=30&&levels.challenge>=30))fail('bank',`difficulty mix ${JSON.stringify(levels)}: mostly standard, some quick and challenge`);
for(const q of qs){
 const ans=q.answers;for(const a of ans){const parts=q.topic==='vr-word-ladders'?a.split(', '):[a];for(const p of parts)if(!q.explanation.toLowerCase().includes(p.toLowerCase().replace(/\.$/,'')))fail(q,`explanation does not mention the answer "${p}"`);}
}
// Every worked calculation written in an explanation must be right, e.g. "9 × 6 − 10 = 44".
for(const q of qs)for(const m of q.explanation.replace(/\*\*/g,'').matchAll(/((?:\(?\d[\d,]*\)?\s*[+−×÷]\s*)+\(?\d[\d,]*\)?)\s*=\s*(\d[\d,]*)/g)){
 const left=m[1].replace(/,(?=\d{3})/g,'').replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-'),want=Number(m[2].replace(/,/g,''));
 if((left.match(/\(/g)||[]).length!==(left.match(/\)/g)||[]).length)continue;
 if(Function(`return (${left});`)()!==want)fail(q,`explanation says ${m[0]}`);
}
// Helpsheets teach with their own examples, never a bank question.
for(const t of topics){const text=JSON.stringify(t.helpsheet).toLowerCase();for(const q of qs.filter(x=>x.topic===t.id)){const first=stim(q)[0].toLowerCase();if(first.length>6&&text.includes(first))fail(t.id,`helpsheet contains the question ${q.id}`);}}

// ── Synonyms and antonyms: exactly one pair across the groups is close (or opposite) in meaning ──
const SYN=`vanish disappear fade|appear emerge|remain stay|vivid bright colourful|varnish polish lacquer|weary tired sleepy exhausted|wary cautious careful watchful alert|eager keen enthusiastic|restless fidgety impatient|strict stern harsh
reply answer respond|repeat redo echo|remind prompt|gather collect assemble|fragile delicate flimsy frail breakable|sturdy strong robust solid|fertile fruitful|sticky gluey tacky|glassy glossy shiny|conceal hide cover mask
reveal show expose uncover|cancel scrap|seal close shut|rapid swift fast quick speedy brisk|gentle mild soft tender|sluggish slow lethargic|stiff rigid|timid shy nervous meek|tidy neat orderly|bold brave daring courageous fearless valiant
sly sneaky cunning crafty|wealthy affluent rich prosperous|healthy well fit|needy poor|fluent articulate|famous renowned celebrated|genuine authentic real true|generous giving|artistic creative|ancient old antique aged
tranquil peaceful calm serene|tricky difficult hard awkward|noisy loud rowdy|precise exact accurate correct|precious valuable|concise brief short|rough coarse approximate|curious inquisitive nosy|reckless rash careless|wicked evil
grateful thankful appreciative|graceful elegant|hateful spiteful nasty|awkward clumsy|hungry starving|gloomy dismal dreary miserable|glad happy cheerful merry|dizzy giddy|vacant empty unoccupied hollow|vague unclear hazy
silent soundless mute|abundant plentiful ample|absent missing away|rare scarce uncommon|costly expensive dear|powerful strong mighty|stubborn obstinate|stuffy airless|obvious clear plain|observant watchful
feeble weak frail|fearful afraid scared frightened|ponder consider contemplate think|wander roam stroll amble|powder dust|confuse puzzle bewilder|construct build make|commence begin start|commerce trade business|conclude finish end
assist help|purchase buy|locate find|remedy cure|imitate copy|slender slim|sorrow grief|halt stop|drowsy sleepy|foe enemy`.split(/[|\n]/).map(s=>s.trim().split(' '));
const close=(a,b)=>a!==b&&SYN.some(s=>s.includes(a)&&s.includes(b));
const ANT=`arrive come reach/depart leave go|entrance entry/exit|shiny glossy/dull matt|aloud/silently quietly|punctual/late|starry/cloudy|alive living/dead|argue quarrel/agree|shallow/deep|sharp pointed/blunt dull|clean/dirty|shadow dark/light|expand grow swell/shrink contract|explain/confuse|victory win triumph/defeat loss
vicious fierce savage/gentle tame kind|visitor guest/host|permanent lasting/temporary brief|pleasant nice/unpleasant nasty|perfect/faulty flawed|typical ordinary usual/unusual|humble modest/proud arrogant boastful|humid damp moist wet/dry arid parched|hungry/full
scarce rare few/plentiful abundant|scared afraid fearful/brave bold fearless|precious valuable/worthless|reveal show expose/conceal hide|remove/add insert|accept receive/refuse reject decline|accuse blame/defend|optimistic hopeful/pessimistic|organised tidy/messy
rigid stiff/flexible bendy|rapid fast quick/slow sluggish|rural/urban|famous/unknown|frequent often common/rare seldom|friendly/hostile unfriendly|frozen icy cold/melted hot warm|rich wealthy/poor|vertical upright/horizontal|vital important/unimportant trivial
vivid bright/dull faded|heavy/light|fresh new/stale old|steep/gentle gradual|guilty/innocent|greedy selfish/generous|thrifty/wasteful extravagant|thorough/careless sloppy|sturdy strong solid/flimsy weak fragile|steady stable/shaky wobbly
stormy rough/calm|frosty/warm|praise compliment/criticise blame|prove/disprove|collect gather/scatter|capture catch/release free|float/sink|flat level/bumpy hilly|transparent clear/opaque cloudy|triumphant victorious/defeated|tolerant patient/intolerant|open/closed shut|obvious/hidden obscure
awake/asleep|borrow/lend|bitter/sweet|public/private|major/minor|interior/exterior|tighten/loosen|include/exclude|advance/retreat|fertile/barren`.split(/[|\n]/).map(s=>s.trim().split('/').map(x=>x.split(' ')));
const opposite=(a,b)=>ANT.some(([x,y])=>x.includes(a)&&y.includes(b)||x.includes(b)&&y.includes(a));
function twoGroups(q,test,label){
 const [g1,g2]=q.stimulus.split(' | ').map(s=>s.split(', '));
 if(g1.length!==3||g2.length!==3||!same(q.options,[...g1,...g2]))return fail(q,'options must be the two groups of three');
 if(q.select!==2||!(g1.includes(q.answers[0])&&g2.includes(q.answers[1])))return fail(q,'answer must be one word from each group, in order');
 const hits=g1.flatMap(a=>g2.filter(b=>test(a,b)).map(b=>a+'/'+b));
 if(hits.length!==1||hits[0]!==q.answers.join('/'))fail(q,`${label} pairs across the groups: ${hits.join(', ')||'none'}`);
}
byTopic('synonyms').forEach(q=>twoGroups(q,close,'close-meaning'));
byTopic('antonyms').forEach(q=>twoGroups(q,opposite,'opposite'));

// ── Definitions: the answer is a meaning of the word, and the word is in the sentence ──
const SENSES={bright:'clever shiny sunny colourful',moved:'touched shifted carried pushed travelled',stand:'tolerate bear rise place remain booth',sound:'sensible reasonable noise asleep deep',bank:'edge side row tilt store vault',fair:'fine just pale festival equal',present:'attending here gift current showing giving',cross:'annoyed angry mixed sign across travel',plain:'simple grassland obvious honest',content:'satisfied happy topic amount material',object:'protest thing aim item goal',tender:'soft sore loving offer young',spring:'source season jump coil bounce',leaves:'departs foliage pages forgets holidays',fine:'penalty thin well sunny excellent',rare:'uncommon undercooked thin',charge:'rush cost power accuse care',still:'calm yet even however photograph',row:'argument line paddle series tier',train:'teach carriage engine travel aim',firm:'solid company strict certain business',season:'flavour spring summer weather episode',current:'flow present modern electric news',patient:'calm hospital customer doctor ill',match:'suit game stick contest final',mine:'pit belonging own coal explosive',seal:'close animal stamp mammal approve',yard:'courtyard metre measure length zero',volume:'loudness book amount space chapter',date:'day fruit meeting partner diary'};
for(const q of byTopic('definitions')){
 const word=(q.prompt.match(/'([a-z]+)'/)||[])[1];
 if(!word||!SENSES[word]){fail(q,'unknown word');continue;}
 if(!new RegExp(`\\b${word}\\b`,'i').test(q.stimulus))fail(q,`"${word}" is not in the sentence`);
 if(!SENSES[word].split(' ').includes(q.answers[0]))fail(q,`"${q.answers[0]}" is not a meaning of ${word}`);
 if(q.options.length!==5)fail(q,'five options');
}

// ── Double meanings: the answer fits both brackets; each wrong word fits one bracket at most ──
const MEANS=Object.fromEntries(`light:ignite kindle weightless airy pale bright lamp|burn:ignite kindle scorch|fluffy:airy soft fuzzy|flame:fire blaze|bright:shining clever light
mean:stingy miserly signify indicate unkind average|tight:stingy miserly firm narrow secure fixed|show:signify indicate display reveal|greedy:selfish|prove:confirm
wave:ripple breaker gesture signal|roller:breaker|salute:gesture signal|nod:gesture signal|tide:current
bear:carry support endure tolerate|lift:carry raise|hold:carry support grip|transport:carry move|suffer:endure|allow:tolerate permit
post:mail send pole stake|deliver:send bring|pillar:pole column|column:pole pillar|parcel:package|fence:barrier
ring:circle band call phone|loop:circle band circuit round|hoop:circle band|dial:call phone|text:message phone|bell:chime
trunk:chest case snout nose|suitcase:case|beak:snout nose|tusk:tooth|branch:bough
club:bat stick society group|racket:bat noise|rod:stick pole|team:group side|band:group ring strip
rock:stone boulder sway swing|pebble:stone|brick:block|wobble:sway shake|roll:sway
sink:basin bowl drop descend|bath:tub basin|fall:drop descend|drain:pipe|float:drift
press:push squeeze newspapers reporters|shove:push|crush:squeeze squash|media:newspapers reporters|news:newspapers
note:message memo tone sound|letter:message|tune:tone|card:greeting|chord:harmony
fast:quick speedy secure fixed|swift:quick speedy|hasty:quick|stuck:fixed
sharp:pointed spiky clever smart|prickly:spiky pointed|thorny:spiky|wise:clever smart|brainy:clever smart
hide:conceal cover skin pelt|mask:conceal cover|bury:conceal cover|fur:pelt|leather:skin
lap:circuit round lick drink|sip:drink|slurp:drink|race:contest
stable:steady secure barn stall|firm:steady secure|sturdy:steady secure|shed:barn stall|pen:stall
lean:thin slim tilt slope|slender:thin slim|skinny:thin slim|tip:tilt|bend:curve
jam:spread preserve squeeze cram|butter:spread|honey:spread|stuff:cram squeeze|force:cram squeeze push
change:coins cash alter vary|money:coins cash|purse:bag|adjust:alter vary|modify:alter vary
date:fruit crop meeting appointment|plum:fruit crop|diary:meeting appointment|calendar:meeting
firm:company business solid hard|shop:company business|stiff:solid hard|office:company
match:game contest suit pair|final:game contest|twin:suit pair|sport:game
mine:pit shaft belonging possession|coal:pit shaft|yours:belonging possession|cave:pit
seal:close fasten animal mammal|shut:close fasten|whale:animal mammal|glue:close fasten
current:flow stream present modern|river:flow stream|today:present modern|tide:flow stream
yard:courtyard enclosure length measure|lawn:courtyard enclosure|metre:length measure|patio:courtyard
volume:loudness sound book tome|noise:loudness sound|novel:book tome|chapter:book
season:flavour spice spring autumn|pepper:flavour spice|winter:spring autumn|salt:flavour spice
bat:creature mammal stick club|mouse:creature mammal|racket:stick club|owl:creature mammal`.split(/[|\n]/).map(s=>{const [w,m]=s.trim().split(':');return [w,m.split(' ')];}));
for(const q of byTopic('double-meanings')){
 const br=[...q.stimulus.matchAll(/\(([^)]*)\)/g)].map(m=>m[1].split(', '));
 if(br.length!==2){fail(q,'two brackets');continue;}
 const fits=(w,b)=>(MEANS[w]??[]).some(m=>b.includes(m));
 if(!MEANS[q.answers[0]])fail(q,`no meanings listed for ${q.answers[0]}`);
 else if(!(fits(q.answers[0],br[0])&&fits(q.answers[0],br[1])))fail(q,`${q.answers[0]} does not fit both brackets`);
 for(const o of q.options.filter(o=>!q.answers.includes(o))){if(!MEANS[o])fail(q,`no meanings listed for ${o}`);else if(fits(o,br[0])&&fits(o,br[1]))fail(q,`${o} fits both brackets`);}
}

// ── Two odd ones out: exactly one set of three shares a group; the other two are the answer ──
const TAGS=Object.fromEntries(`glad cheerful merry:happy|angry:cross|tired:sleepy|oak ash elm:tree|rose daisy:flower|stroll amble wander:walk-slowly|sprint dash:run-fast|whisper murmur mutter:speak-quietly|bellow roar:loud
sparrow robin wren:bird|bee moth:insect|violin cello harp:strings|trumpet flute:wind|hammer saw drill:tool|spoon fork:cutlery|furious livid irate:very-angry|calm content:peaceful|soggy damp moist:wet|parched arid:dry
brave bold daring:fearless|timid meek:shy|gallop trot canter:horse-gait|slither:snake-moves|hop:rabbit-moves|metre centimetre kilometre:length|kilogram:mass|litre:capacity|cautious careful wary:careful|reckless rash:careless
copper iron silver:metal|wood glass:material|ask question enquire:ask|answer reply:respond|huge vast immense:big|tiny minute:small|lion tiger leopard:big-cat|wolf bear:wild-animal|noun verb adjective:word-class|comma colon:punctuation
kettle toaster microwave:kitchen-appliance|pillow duvet:bedding|pentagon hexagon octagon:flat-shape|cube sphere:solid-shape|sapphire ruby emerald:gem|marble granite:rock|carp trout goldfish:fish|whale dolphin:sea-mammal
apple pear plum:fruit|bus tram:transport|red blue green:colour|seven nine:number|sock glove scarf:clothing|pencil ruler:stationery|rain snow hail:weather|bread cake:baked-food|circle square triangle:shape|Monday Friday:weekday|kick throw catch:ball-action|tulip daisy:flower|January March June:month|carrot onion:vegetable|piano drum guitar:instrument|shark eel:sea-animal|puppy kitten calf:young-animal|sycamore beech:tree-kind|river lake stream:water|chair stool:seat`.split(/[|\n]/).flatMap(s=>{const [ws,t]=s.trim().split(':');return ws.split(' ').map(w=>[w,t]);}));
for(const q of byTopic('odd-ones-out')){
 const ws=q.stimulus.split(', ');if(ws.length!==5||!same(ws,q.options)){fail(q,'five words as options');continue;}
 const triples=[];for(let a=0;a<5;a++)for(let b=a+1;b<5;b++)for(let c=b+1;c<5;c++){const t=[ws[a],ws[b],ws[c]];if(t.every(w=>TAGS[w])&&t.every(w=>TAGS[w]===TAGS[t[0]]))triples.push(t);}
 if(triples.length!==1){fail(q,`${triples.length} linked groups of three`);continue;}
 if(!same(ws.filter(w=>!triples[0].includes(w)),q.answers))fail(q,'answer is not the two words outside the group');
 if(q.answers.some(w=>TAGS[w]===TAGS[triples[0][0]]))fail(q,'an odd word shares the link');
}

// ── Word analogies: the answer has the same link to the third word; no wrong option does ──
const FACTS=`lives-in:bee hive,bird nest,dog kennel,horse stable,rabbit burrow,fish pond,fish river,spider web|builds:bee hive,bird nest,spider web|makes:bee honey,bee hive,bird nest,potter vase,carpenter table|eats:bird worm|has-part:bird feather,bird wing,bird beak,clock hands,hand palm,hand finger,hand thumb,foot sole,foot toe,foot heel,book page,wall brick
creates:poet poem,sculptor statue,author book,composer music|uses-tool:sculptor chisel,potter wheel,potter kiln|material:sculptor marble,carpenter wood,potter clay|opposite:hot cold,early late,brave cowardly,generous mean,up down,above below,first last
similar:generous kind,generous giving,early soon|grows-into:puppy dog,foal horse,calf cow,lamb sheep,kitten cat|worn-on:glove hand,sock foot,shoe foot,boot foot,hat head|made-of:sock wool,glove wool,aquarium glass,library brick
used-to:pen write,knife cut,scissors cut,needle sew|collection:library books,aquarium fish,museum exhibits|group:sheep flock,fish shoal,fish school,cow herd,bird flock|needs:hungry food,tired sleep,thirsty drink|feels:tired yawn
measures:thermometer temperature,clock time,ruler length|plural:mouse mice,goose geese|past:run ran,swim swam|past-participle:run run,swim swum|part-of:page book,brick wall,petal flower|sound:lion roar,snake hiss,dog bark|moves:snake slither
cares-for:dentist teeth,optician eyes,vet animals|provides:optician glasses,optician lenses|comparative:tall taller,good better|superlative:tall tallest,good best|underside:hand palm,foot sole|means-number:dozen twelve,score twenty|in-games:score goal,score points`
 .split(/[|\n]/).flatMap(s=>{const [r,ps]=s.trim().split(':');return ps.split(',').map(p=>[r,...p.split(' ')]);});
const rels=(x,y)=>FACTS.filter(f=>f[1]===x&&f[2]===y).map(f=>f[0]);
for(const q of byTopic('word-analogies')){
 const m=q.stimulus.match(/^(\w+) is to (\w+) as (\w+) is to \?$/);if(!m){fail(q,'analogy not in the form "a is to b as c is to ?"');continue;}
 const [,a,b,c]=m,link=rels(a,b);
 if(!link.length){fail(q,`no known link between ${a} and ${b}`);continue;}
 if(!link.some(r=>rels(c,q.answers[0]).includes(r)))fail(q,`${c} → ${q.answers[0]} does not share the link (${link.join(', ')})`);
 for(const o of q.options.filter(o=>!q.answers.includes(o)))if(link.some(r=>rels(c,o).includes(r)))fail(q,`wrong option ${o} also shares the link`);
}

// ── Hidden words: the answer is the only listed four-letter word across a boundary ──
for(const q of byTopic('hidden-words')){
 const ws=q.stimulus.split(/\s+/).map(w=>w.toLowerCase().replace(/[^a-z]/g,'')).filter(Boolean),s=ws.join(''),ends=[];let p=0;for(const w of ws){p+=w.length;ends.push(p);}
 const across=[];for(let i=0;i+4<=s.length;i++){const k=ends.filter(e=>e>i&&e<i+4);if(k.length&&isWord(s.slice(i,i+4)))across.push([s.slice(i,i+4),k.length]);}
 if(across.length!==1||across[0][0]!==q.answers[0])fail(q,`words across boundaries: ${across.map(a=>a[0]).join(', ')||'none'}`);
 else if(across[0][1]!==1)fail(q,'the hidden word must span exactly two words');
 for(const o of q.options){if(!isWord(o))fail(q,`${o} is not in the word list`);if(o!==q.answers[0]&&across.some(a=>a[0]===o))fail(q,`${o} is also hidden`);}
 // No unsuitable word may hide across a boundary either (checked here, not in the shipped word lists).
 for(let i=0;i<s.length;i++)for(const n of [3,4,5]){const w=s.slice(i,i+n);if(w.length===n&&ends.some(e=>e>i&&e<i+n)&&UNSUITABLE.has(w))fail(q,`"${w}" is hidden across a boundary`);}
}

// ── Missing three-letter words ──
for(const q of byTopic('missing-letters')){
 const shown=(q.stimulus.match(/\b[A-Z]{2,}\b/)||[])[0];if(!shown){fail(q,'no word in capitals');continue;}
 const fills=o=>[...Array(shown.length+1).keys()].map(j=>shown.slice(0,j)+o+shown.slice(j)).filter(isWord);
 if(fills(q.answers[0]).length!==1)fail(q,`${q.answers[0]} makes ${fills(q.answers[0]).join(', ')||'no word'}`);
 for(const o of q.options){if(o.length!==3||!isWord(o))fail(q,`${o} is not a three-letter word`);if(o!==q.answers[0]&&fills(o).length)fail(q,`${o} also makes ${fills(o).join(', ')}`);}
}

// ── Compound words: exactly one pair joins into a listed word ──
for(const q of byTopic('compound-words')){
 const [g1,g2]=q.stimulus.split(' | ').map(s=>s.split(', '));
 const made=g1.flatMap(a=>g2.filter(b=>isWord(a+b)).map(b=>[a,b]));
 if(made.length!==1||made[0].join('/')!==q.answers.join('/'))fail(q,`pairs that make words: ${made.map(m=>m.join('+')).join(', ')||'none'}`);
 if(![...g1,...g2].every(isWord))fail(q,'every group word must be a real word');
}

// ── Move a letter: exactly one letter leaves a word and makes a word ──
for(const q of byTopic('move-a-letter')){
 const [w1,w2]=q.stimulus.split(/\s*·\s*/),works=new Set();
 for(let i=0;i<w1.length;i++){const left=w1.slice(0,i)+w1.slice(i+1);if(!isWord(left))continue;for(let j=0;j<=w2.length;j++)if(isWord(w2.slice(0,j)+w1[i]+w2.slice(j)))works.add(w1[i]);}
 if(works.size!==1||!works.has(q.answers[0]))fail(q,`letters that work: ${[...works].join(', ')||'none'}`);
 if(!q.options.every(o=>w1.includes(o)||w2.includes(o)))fail(q,'options must be letters of the two words');
 for(const o of q.options.filter(o=>!w1.includes(o))){const i=w2.indexOf(o),left=w2.slice(0,i)+w2.slice(i+1);if(isWord(left)&&[...Array(w1.length+1).keys()].some(j=>isWord(w1.slice(0,j)+o+w1.slice(j))))fail(q,`${o} would work moved the other way`);}
}

// ── Shared letter: exactly one letter makes all four words ──
for(const q of byTopic('shared-letter')){
 const m=q.stimulus.match(/^(\w+) \( \? \) (\w+)\s+(\w+) \( \? \) (\w+)$/);if(!m){fail(q,'stimulus form');continue;}
 const [,a,b,c,d]=m,works=[...ABC].filter(x=>isWord(a+x)&&isWord(x+b)&&isWord(c+x)&&isWord(x+d));
 if(works.length!==1||works[0]!==q.answers[0])fail(q,`letters that work: ${works.join(', ')||'none'}`);
}

// ── Anagrams: the answer uses exactly the letters in capitals; only flagged wrong options do too ──
for(const q of byTopic('anagrams')){
 const caps=(q.stimulus.match(/\b[A-Z]{3,}\b/)||[])[0],entry=wordsPart.ANAGRAMS.find(a=>a.caps===caps);
 if(!caps||!entry){fail(q,'no capitals');continue;}
 const ana=w=>w!==caps&&same(w,caps);
 if(!ana(q.answers[0])||!isWord(q.answers[0]))fail(q,`${q.answers[0]} is not an anagram of ${caps} in the word list`);
 for(const o of q.options.filter(o=>!q.answers.includes(o))){if(ana(o)!==entry.sameLetters.includes(o))fail(q,`${o}: anagram flag is wrong`);if(!isWord(o))fail(q,`${o} is not in the word list`);}
 if(isWord(caps)===!entry.clue)fail(q,entry.clue?'a clue question starts from a real word':'the jumbled letters must not already be a word');
}

// ── Word ladders: every step changes one letter and makes a word; the answer is the only way ──
const diff=(a,b)=>a.length===b.length?[...a].filter((c,i)=>c!==b[i]).length:99;
for(const q of byTopic('word-ladders')){
 const chain=q.stimulus.split(' → '),gaps=chain.filter(w=>w==='?').length,start=chain[0].toLowerCase(),end=chain[chain.length-1].toLowerCase();
 const fill=a=>{const f=a.split(', ');let k=0;return chain.map(w=>w==='?'?f[k++]:w);};
 const okChain=c=>c.every(isWord)&&c.slice(1).every((w,i)=>diff(w,c[i])===1);
 if(!okChain(fill(q.answers[0])))fail(q,'the answer does not make a ladder');
 for(const o of q.options.filter(o=>!q.answers.includes(o)))if(okChain(fill(o)))fail(q,`${o} also makes a ladder`);
 // Every ladder through listed words: only the answer.
 const ladders=[];const walk=(path)=>{if(path.length===chain.length){if(path[path.length-1]===end)ladders.push(path.slice(1,-1).join(', '));return;}const last=path[path.length-1];const next=path.length===chain.length-1?[end]:W4.filter(w=>diff(w,last)===1&&!path.includes(w));for(const n of next)if(diff(n,last)===1)walk([...path,n]);};
 if(start.length===4&&gaps<=2)walk([start]);
 if(ladders.length!==1||ladders[0]!==q.answers[0].toLowerCase())fail(q,`ladders through listed words: ${ladders.join(' | ')||'none'}`);
}

// ── Series of letters or numbers: exactly one option continues a simple rule ──
function fitsRule(xs){
 const d=xs.slice(1).map((x,i)=>x-xs[i]),d2=d.slice(1).map((x,i)=>x-d[i]),d3=d2.slice(1).map((x,i)=>x-d2[i]),flat=a=>a.every(v=>v===a[0]);
 if(flat(d)||xs.length>=5&&flat(d2)||xs.length>=5&&flat(d3))return true;
 if(xs.every(x=>x!==0)&&xs.slice(1).every((x,i)=>x/xs[i]===xs[1]/xs[0]))return true;
 const odd=xs.filter((_,i)=>i%2===0),even=xs.filter((_,i)=>i%2===1);
 if(odd.length>=3&&even.length>=3&&flat(odd.slice(1).map((x,i)=>x-odd[i]))&&flat(even.slice(1).map((x,i)=>x-even[i])))return true;
 if(xs.length>=5&&xs.slice(2).every((x,i)=>x===xs[i]+xs[i+1]))return true;
 // Two steps taking turns, such as + 3 then × 2.
 if(xs.length>=6){const stepA=xs.slice(1).map((x,i)=>[x,xs[i]]).filter((_,i)=>i%2===0),stepB=xs.slice(1).map((x,i)=>[x,xs[i]]).filter((_,i)=>i%2===1);
  const addSame=s=>flat(s.map(([x,p])=>x-p)),mulSame=s=>s.every(([x,p])=>p!==0)&&flat(s.map(([x,p])=>x/p));
  if((addSame(stepA)||mulSame(stepA))&&(addSame(stepB)||mulSame(stepB)))return true;}
 return false;
}
function seriesCheck(q,terms,toNums){
 const at=terms.indexOf('?'),ok=q.options.filter(o=>{const t=[...terms];t[at]=o;return toNums(t);});
 if(ok.length!==1||ok[0]!==q.answers[0])fail(q,`options that follow a rule: ${ok.join(', ')||'none'}`);
}
for(const q of byTopic('letter-sequences')){
 const terms=stim(q)[0].split(', ');if(stim(q)[1]!==[...ABC].join(' '))fail(q,'alphabet line missing');
 seriesCheck(q,terms,t=>{const w=t[0].length;if(!t.every(x=>x.length===w))return false;for(let k=0;k<w;k++)if(!fitsRule(t.map(x=>N(x[k]))))return false;return true;});
}
for(const q of byTopic('number-sequences')){
 const terms=q.stimulus.split(', ').map(s=>s.replace(/,/g,''));
 seriesCheck(q,terms,t=>fitsRule(t.map(Number)));
}

// ── Letter codes: work out the rule from the example, then use it ──
const CODES={shift:k=>w=>[...w].map(c=>L(N(c)+k)??'?').join(''),mirror:()=>w=>[...w].map(c=>L(25-N(c))).join(''),step:s=>w=>[...w].map((c,j)=>L(N(c)+s*(j+1))??'?').join('')};
for(const q of byTopic('letter-codes')){
 const [ex,ask,abc]=stim(q),[w1,c1]=ex.split(' → '),[p2,c2]=ask.split(' → ');
 if(abc!==[...ABC].join(' '))fail(q,'alphabet line missing');
 const rules=[...Array.from({length:51},(_,k)=>['shift '+(k-25),CODES.shift(k-25)]).filter(([n])=>n!=='shift 0'),['mirror',CODES.mirror()],['step 1',CODES.step(1)],['step -1',CODES.step(-1)]].filter(([,f])=>f(w1)===c1);
 if(rules.length!==1){fail(q,`rules that fit the example: ${rules.map(r=>r[0]).join(', ')||'none'}`);continue;}
 const f=rules[0][1];
 if(c2==='?'){if(f(p2)!==q.answers[0])fail(q,`${p2} should be ${f(p2)}`);}
 else{const back=q.options.filter(o=>o.length===c2.length&&f(o)===c2);if(back.length!==1||back[0]!==q.answers[0])fail(q,`options that encode to ${c2}: ${back.join(', ')||'none'}`);if(!isWord(q.answers[0]))fail(q,`${q.answers[0]} is not in the word list`);}
}

// ── Number codes ──
function matchings(words,codes){const out=[];const rec=(used,map,back,k)=>{if(k===codes.length){out.push(new Map(map));return;}for(let j=0;j<words.length;j++){if(used.includes(j))continue;const w=words[j],c=codes[k];if(w.length!==c.length)continue;const m=new Map(map),b=new Map(back);let good=true;for(let i=0;i<w.length&&good;i++){if(m.has(w[i])&&m.get(w[i])!==c[i]||b.has(c[i])&&b.get(c[i])!==w[i])good=false;m.set(w[i],c[i]);b.set(c[i],w[i]);}if(good)rec([...used,j],m,b,k+1);}};rec([],new Map(),new Map(),0);return out;}
for(const q of byTopic('number-codes')){
 const s=stim(q);
 if(/place in the alphabet/.test(q.prompt)){
  if(/Which code/.test(q.prompt)){const want=[...s[0]].map(c=>N(c)+1).join(' ');if(want!==q.answers[0])fail(q,`${s[0]} should be ${want}`);}
  else{const w=s[0].split(' ').map(n=>L(Number(n)-1)).join('');if(w!==q.answers[0])fail(q,`the code spells ${w}`);if(!isWord(w))fail(q,`${w} is not in the word list`);}
 }else if(/^The first word/.test(q.prompt)){
  const [a,ca]=s[0].split(' = '),[b,cb]=s[1].split(' = '),map=new Map();
  for(let i=0;i<a.length;i++){if(map.has(a[i])&&map.get(a[i])!==ca[i])fail(q,'the example code is not consistent');map.set(a[i],ca[i]);}
  if(cb==='?'){const want=[...b].map(c=>map.get(c)??'?').join('');if(want!==q.answers[0])fail(q,`${b} should be ${want}`);}
  else{const back=new Map([...map].map(([k,v])=>[v,k])),w=[...cb].map(d=>back.get(d)??'?').join('');if(w!==q.answers[0])fail(q,`${cb} decodes to ${w}`);}
 }else{
  const words=s[0].split(', '),codes=s[1].split(', '),ms=matchings(words,codes);
  if(ms.length!==1){fail(q,`${ms.length} ways to match the codes`);continue;}
  const target=(q.prompt.match(/code for (\w+)\?/)||[])[1];
  if(target){const want=[...target].map(c=>ms[0].get(c)??'?').join('');if(want!==q.answers[0])fail(q,`${target} should be ${want}`);}
  else{const code=s[2].split(' = ')[0],back=new Map([...ms[0]].map(([k,v])=>[v,k])),w=[...code].map(d=>back.get(d)??'?').join('');if(w!==q.answers[0])fail(q,`${code} is ${w}`);}
 }
}

// ── Letter-pair analogies: each letter moves a fixed amount, without running off the alphabet ──
for(const q of byTopic('letter-analogies')){
 const m=stim(q)[0].match(/^([A-Z]{2}) is to ([A-Z]{2}) as ([A-Z]{2}) is to \?$/);if(!m){fail(q,'stimulus form');continue;}
 const [,p,r,t]=m,d=[N(r[0])-N(p[0]),N(r[1])-N(p[1])],want=[N(t[0])+d[0],N(t[1])+d[1]];
 if(want.some(x=>x<0||x>25)){fail(q,'the rule runs off the alphabet');continue;}
 if(r===p[1]+p[0]||r===L(25-N(p[0]))+L(25-N(p[1])))fail(q,`${p} → ${r} can also be read as a swap or mirror`);
 if(L(want[0])+L(want[1])!==q.answers[0])fail(q,`should be ${L(want[0])+L(want[1])}`);
}

// ── Number relationships: every simple rule that fits both groups gives the answer ──
const RULES=[];{const add=(n,f)=>RULES.push([n,f]);
 add('a+b',(a,b)=>a+b);add('a-b',(a,b)=>a-b);add('b-a',(a,b)=>b-a);add('a*b',(a,b)=>a*b);add('a/b',(a,b)=>a/b);add('b/a',(a,b)=>b/a);
 for(let k=1;k<=5;k++){add(`ab+${k}`,(a,b)=>a*b+k);add(`ab-${k}`,(a,b)=>a*b-k);add(`a+b+${k}`,(a,b)=>a+b+k);add(`a+b-${k}`,(a,b)=>a+b-k);}
 for(let k=2;k<=5;k++){add(`(a+b)*${k}`,(a,b)=>(a+b)*k);add(`(a-b)*${k}`,(a,b)=>(a-b)*k);add(`${k}a+b`,(a,b)=>k*a+b);add(`a+${k}b`,(a,b)=>a+k*b);add(`${k}a-b`,(a,b)=>k*a-b);add(`(a+b)/${k}`,(a,b)=>(a+b)/k);add(`ab/${k}`,(a,b)=>a*b/k);}
 add('a²+b',(a,b)=>a*a+b);add('a²-b',(a,b)=>a*a-b);add('a+b²',(a,b)=>a+b*b);add('ab+a',(a,b)=>a*b+a);add('ab+b',(a,b)=>a*b+b);add('ab-a',(a,b)=>a*b-a);add('ab-b',(a,b)=>a*b-b);add('a²-b²',(a,b)=>a*a-b*b);}
for(const q of byTopic('number-relations')){
 const g=stim(q).map(l=>l.match(/^(\d+) \( ?(\d+|\?) ?\) (\d+)$/));if(g.length!==3||g.some(x=>!x)){fail(q,'stimulus form');continue;}
 const nums=g.map(([,a,c,b])=>[Number(a),c==='?'?null:Number(c),Number(b)]);
 const fit=RULES.filter(([,f])=>nums.slice(0,2).every(([a,c,b])=>f(a,b)===c)),preds=[...new Set(fit.map(([,f])=>f(nums[2][0],nums[2][2])))];
 if(!fit.length)fail(q,'no simple rule fits');
 else if(preds.length!==1||String(preds[0])!==q.answers[0].replace(/,/g,''))fail(q,`rules predict ${preds.join(', ')} (${fit.map(r=>r[0]).join(', ')})`);
}

// ── Letters standing for numbers: work out the calculation ──
for(const q of byTopic('letter-sums')){
 const [vals,calc]=stim(q),v=Object.fromEntries(vals.split(', ').map(s=>s.split(' = ')).map(([k,n])=>[k,Number(n)]));
 if(Object.keys(v).join('')!=='ABCDE'||new Set(Object.values(v)).size!==5){fail(q,'five letters with different values');continue;}
 const expr=calc.replace(' = ?','').replace(/[A-E]/g,k=>String(v[k])).replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-');
 if(!/^[\d\s+\-*/()]+$/.test(expr)){fail(q,`cannot read ${calc}`);continue;}
 const result=Function(`return (${expr});`)(),hit=Object.keys(v).filter(k=>v[k]===result);
 if(hit.length!==1||hit[0]!==q.answers[0])fail(q,`${calc} = ${result}, which is ${hit.join(', ')||'no letter'}`);
 if(!same(q.options,['A','B','C','D','E']))fail(q,'options are the five letters');
}

// ── Logic: parse the clues and try every arrangement ──
const PLACE=['first','second','third','fourth','fifth'];
const namesOf=p=>{const m=p.match(/^(.*?) (ran a race|compare their heights|each have a different pet)/);return m?m[1].replace(' and ',', ').split(', '):[];};
for(const q of byTopic('logic')){
 const names=namesOf(q.prompt),clues=stim(q),idx=n=>names.indexOf(n);
 if(!names.length||!q.options.every(o=>/^[A-Z]/.test(o))){fail(q,'names not listed');continue;}
 if(/each have a different pet/.test(q.prompt)){
  const pets=q.prompt.match(/pet: (.*?)\. Who/)[1].replace(' and ',', ').split(', ').map(p=>p.replace(/^an? /,'')),ask=q.prompt.match(/Who has the (\w+)\?/)[1];
  const not=clues.map(c=>{const m=c.match(/^(\w+) does not have (.*)\.$/);return m?[idx(m[1]),m[2].replace(' or ',', ').split(', ').map(x=>pets.indexOf(x.replace(/^the /,'')))]:null;});
  if(not.some(x=>!x||x[0]<0||x[1].some(p=>p<0))){fail(q,'cannot read a clue');continue;}
  const ok=permutations(names.length).filter(pp=>not.every(([f,ps])=>!ps.includes(pp[f])));
  if(ok.length!==1){fail(q,`${ok.length} ways fit the clues`);continue;}
  if(names[ok[0].indexOf(pets.indexOf(ask))]!==q.answers[0])fail(q,`the ${ask} belongs to ${names[ok[0].indexOf(pets.indexOf(ask))]}`);
  continue;
 }
 const tall=/heights/.test(q.prompt);
 const tests=clues.map(c=>{let m;
  if(tall){if(m=c.match(/^(\w+) is taller than (\w+)\.$/))return p=>p[idx(m[1])]<p[idx(m[2])];if(m=c.match(/^(\w+) is shorter than (\w+)\.$/))return p=>p[idx(m[1])]>p[idx(m[2])];return null;}
  if(m=c.match(/^(\w+) finished before (\w+)\.$/))return p=>p[idx(m[1])]<p[idx(m[2])];
  if(m=c.match(/^(\w+) finished straight after (\w+)\.$/))return p=>p[idx(m[1])]===p[idx(m[2])]+1;
  if(m=c.match(/^(\w+) finished after (\w+)\.$/))return p=>p[idx(m[1])]>p[idx(m[2])];
  if(m=c.match(/^(\w+) came first\.$/))return p=>p[idx(m[1])]===0;
  if(m=c.match(/^(\w+) came last\.$/))return p=>p[idx(m[1])]===names.length-1;
  if(m=c.match(/^(\w+) did not come first or last\.$/))return p=>p[idx(m[1])]>0&&p[idx(m[1])]<names.length-1;
  if(m=c.match(/^Exactly one runner finished between (\w+) and (\w+)\.$/))return p=>Math.abs(p[idx(m[1])]-p[idx(m[2])])===2;
  return null;});
 if(tests.some(t=>!t)||clues.some(c=>/\b[A-Z][a-z]+\b/g.test(c)&&[...c.matchAll(/\b([A-Z][a-z]+)\b/g)].some(m=>m[1]!=='Exactly'&&idx(m[1])<0))){fail(q,'cannot read a clue');continue;}
 const places=permutations(names.length).map(o=>{const p=[];o.forEach((k,j)=>p[k]=j);return p;}).filter(p=>tests.every(t=>t(p)));
 if(/must be true/.test(q.prompt)){
  const holds=s=>{let m;if(m=s.match(/^(\w+) finished before (\w+)\.$/))return p=>p[idx(m[1])]<p[idx(m[2])];if(m=s.match(/^(\w+) came (first|second|third|fourth|fifth|last)\.$/))return p=>p[idx(m[1])]===(m[2]==='last'?names.length-1:PLACE.indexOf(m[2]));return null;};
  const must=q.options.filter(o=>{const h=holds(o);return h&&places.every(h);});
  if(places.length<2)fail(q,'a "must be true" puzzle should allow more than one order');
  if(must.length!==1||must[0]!==q.answers[0])fail(q,`statements that must be true: ${must.join(' | ')||'none'}`);
  if(q.options.some(o=>!holds(o)))fail(q,'cannot read a statement');
  continue;
 }
 if(places.length!==1){fail(q,`${places.length} orders fit the clues`);continue;}
 const p=places[0],m=q.prompt.match(/Who (?:finished (\w+)|is the (?:(\w+) tallest|tallest|shortest))\?/),word=m&&(m[1]||m[2]||(/tallest\?/.test(q.prompt)?'first':'fifth'));
 const who=names.find(n=>p[idx(n)]===PLACE.indexOf(word));
 if(who!==q.answers[0])fail(q,`the answer should be ${who}`);
}

console.log(`Verbal reasoning: ${qs.length} questions in ${topics.length} topics; difficulty ${JSON.stringify(levels)}`);
if(fails.length){console.log(`FAIL: ${fails.length} problem(s)`);fails.slice(0,80).forEach(f=>console.log(' -',f));process.exit(1);}
console.log(`PASS: every Verbal reasoning answer re-checked independently (${qs.length} questions).`);
