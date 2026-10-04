import {fixed,explain,rng,type Draft,type Topic,type Helpsheet} from './bank-kit';
import type {RewardGroup} from './question-rewards';
// Verbal reasoning: vocabulary questions, written by hand (see docs/design/question-bank-v2.md).
// Every word set was checked so that exactly one answer is defensible: in the two-group questions no other pair across
// the groups is close (or opposite) in meaning, and in the double meanings each wrong word fits one bracket at most.

type Level=RewardGroup|undefined;
export const vrTopic=(id:string,strand:string,title:string,helpsheet:Helpsheet,reward?:RewardGroup):Topic=>({id:`vr-${id}`,subject:'Verbal reasoning',strand,title,helpsheet,...(reward?{reward}:{})});
const lines=(why:string,notes:string[]=[])=>explain(why,...notes.map(n=>'- '+n));

// ── Synonyms and antonyms: one word from each group of three ──
export type PairSet={g1:string[];g2:string[];a:[string,string];why:string;notes?:string[];level?:Level};
/** Word sets are written with the answer first; each question shows its words in a fixed shuffled order (seeded by its words),
 * so the answer's place in a group gives nothing away. */
export const mixed=(words:string[])=>rng('vr-order:'+words.join(',')).shuffle(words);
const groupStimulus=(g1:string[],g2:string[])=>`${g1.join(', ')} | ${g2.join(', ')}`;
function pairDrafts(prompt:string,sets:PairSet[]):Draft[]{
 return sets.map(s=>{const g1=mixed(s.g1),g2=mixed(s.g2);return {prompt,stimulus:groupStimulus(g1,g2),answer:[s.a[0],s.a[1]],options:[...g1,...g2],explanation:lines(s.why,s.notes),rewardGroup:s.level};});
}

export const SYNONYM_SETS:PairSet[]=[
 {g1:['vanish','varnish','vivid'],g2:['appear','remain','disappear'],a:['vanish','disappear'],level:'quick',why:'**Vanish** and **disappear** both mean to go out of sight.',notes:['Appear and remain mean the opposite of vanish.','Varnish looks like vanish, but it is a shiny coating for wood.']},
 {g1:['weary','wary','eager'],g2:['tired','strict','noisy'],a:['weary','tired'],level:'quick',why:'**Weary** and **tired** both mean needing rest.',notes:['Wary looks like weary, but it means cautious.']},
 {g1:['reply','repeat','remind'],g2:['answer','forget','gather'],a:['reply','answer'],level:'quick',why:'**Reply** and **answer** both mean to respond to someone.',notes:['Forget is close to the opposite of remind.','Repeat means to say or do something again.']},
 {g1:['fragile','sturdy','fertile'],g2:['delicate','sticky','dusty'],a:['fragile','delicate'],why:'**Fragile** and **delicate** both describe something that is easily broken or damaged.',notes:['Sturdy is the opposite: strong and hard to break.','Fertile only looks like fragile: fertile soil is good for growing plants.']},
 {g1:['conceal','reveal','cancel'],g2:['hide','heal','gather'],a:['conceal','hide'],why:'**Conceal** and **hide** both mean to keep something out of sight.',notes:['Reveal is the opposite of conceal.','Heal means to get better; it does not mean hide.']},
 {g1:['rapid','rocky','rubbery'],g2:['swift','sluggish','stiff'],a:['rapid','swift'],why:'**Rapid** and **swift** both mean very fast.',notes:['Sluggish is the opposite: slow-moving.','Rocky and rubbery only begin like rapid.']},
 {g1:['timid','tidy','bold'],g2:['shy','sly','busy'],a:['timid','shy'],why:'**Timid** and **shy** both describe someone who is nervous and lacks confidence.',notes:['Bold is the opposite of timid.','Sly looks like shy, but it means sneaky.']},
 {g1:['wealthy','healthy','needy'],g2:['affluent','fluent','flimsy'],a:['wealthy','affluent'],level:'challenge',why:'**Wealthy** and **affluent** both mean having a lot of money.',notes:['Needy is the opposite of wealthy.','Fluent looks like affluent, but it means speaking or writing easily.']},
 {g1:['genuine','generous','gentle'],g2:['authentic','artistic','ancient'],a:['genuine','authentic'],why:'**Genuine** and **authentic** both mean real, not fake or copied.',notes:['Ancient means very old; an old object is not always genuine.','Generous and gentle describe kind people.']},
 {g1:['tranquil','tropical','tricky'],g2:['peaceful','noisy','woolly'],a:['tranquil','peaceful'],level:'quick',why:'**Tranquil** and **peaceful** both mean calm and quiet.',notes:['Noisy is the opposite of tranquil.']},
 {g1:['precise','precious','prepared'],g2:['exact','rough','fuzzy'],a:['precise','exact'],why:'**Precise** and **exact** both mean completely accurate.',notes:['Rough (as in a rough guess) and fuzzy are closer to the opposite of precise.','Precious means very valuable, and prepared means ready.']},
 {g1:['cautious','curious','reckless'],g2:['wary','weary','watery'],a:['cautious','wary'],why:'**Cautious** and **wary** both mean careful to avoid danger.',notes:['Reckless is the opposite of cautious.','Weary looks like wary, but it means tired.']},
 {g1:['grateful','graceful','hateful'],g2:['thankful','awkward','hungry'],a:['grateful','thankful'],why:'**Grateful** and **thankful** both mean pleased and wanting to say thank you.',notes:['Graceful looks similar but means moving smoothly and elegantly; awkward is its opposite.']},
 {g1:['gloomy','glossy','glad'],g2:['dismal','dizzy','dainty'],a:['gloomy','dismal'],why:'**Gloomy** and **dismal** both mean dark, dull and miserable.',notes:['Glad is the opposite of gloomy.','Glossy means shiny.']},
 {g1:['vacant','valiant','velvet'],g2:['empty','full','sudden'],a:['vacant','empty'],why:'**Vacant** and **empty** both mean with nobody or nothing inside.',notes:['Full is the opposite.','Valiant means brave, and velvet is a soft cloth.']},
 {g1:['abundant','absent','rare'],g2:['plentiful','careful','powerful'],a:['abundant','plentiful'],level:'challenge',why:'**Abundant** and **plentiful** both mean more than enough.',notes:['Rare is the opposite of abundant.','Absent means not there.']},
 {g1:['stubborn','sticky','stuffy'],g2:['obstinate','obvious','observant'],a:['stubborn','obstinate'],level:'challenge',why:'**Stubborn** and **obstinate** both mean refusing to change your mind.',notes:['Sticky and stuffy only begin like stubborn.','Obvious and observant only begin like obstinate.']},
 {g1:['feeble','fertile','cheerful'],g2:['weak','week','brave'],a:['feeble','weak'],level:'quick',why:'**Feeble** and **weak** both mean lacking strength.',notes:['Week sounds the same as weak, but it means seven days.']},
 {g1:['ponder','wander','powder'],g2:['consider','confuse','construct'],a:['ponder','consider'],level:'challenge',why:'**Ponder** and **consider** both mean to think carefully about something.',notes:['Wander means to walk about slowly.','Confuse and construct only begin like consider.']},
 {g1:['commence','commerce','conclude'],g2:['begin','blossom','bounce'],a:['commence','begin'],level:'challenge',why:'**Commence** and **begin** both mean to start.',notes:['Conclude is the opposite of commence.','Commerce looks similar, but it means buying and selling.']},
 {g1:['assist','assume','assault'],g2:['help','heal','heap'],a:['assist','help'],level:'quick',why:'**Assist** and **help** both mean to give someone a hand.',notes:['Assume means to suppose, and assault means to attack.','Heal means to get better.']},
 {g1:['purchase','purpose','purple'],g2:['buy','bow','bun'],a:['purchase','buy'],level:'quick',why:'**Purchase** and **buy** both mean to pay for something.',notes:['Purpose means a reason, and purple is a colour.']},
 {g1:['locate','local','lotion'],g2:['find','fine','fire'],a:['locate','find'],why:'**Locate** and **find** both mean to discover where something is.',notes:['Local means nearby, and lotion is a cream.','Fine and fire only begin like find.']},
 {g1:['remedy','remind','remote'],g2:['cure','curl','curb'],a:['remedy','cure'],why:'A **remedy** and a **cure** both put something right, especially an illness.',notes:['Remind means to help someone remember.','Curl and curb only begin like cure.']},
 {g1:['imitate','immediate','imagine'],g2:['copy','cope','cost'],a:['imitate','copy'],why:'**Imitate** and **copy** both mean to do the same as someone else.',notes:['Immediate means at once, and imagine means to picture something.','Cope means to manage.']},
 {g1:['slender','slider','slumber'],g2:['slim','slam','slip'],a:['slender','slim'],why:'**Slender** and **slim** both mean thin in an attractive way.',notes:['Slumber means sleep.','Slam and slip only begin like slim.']},
 {g1:['sorrow','sorry','borrow'],g2:['grief','green','greet'],a:['sorrow','grief'],level:'challenge',why:'**Sorrow** and **grief** both mean deep sadness.',notes:['Sorry means feeling regret, which is lighter than grief.','Borrow means to take something for a while.']},
 {g1:['halt','half','hall'],g2:['stop','step','star'],a:['halt','stop'],level:'quick',why:'**Halt** and **stop** both mean to come to a standstill.',notes:['Half and hall only look like halt.','Step and star only begin like stop.']},
 {g1:['drowsy','dressy','droopy'],g2:['sleepy','slippery','sloppy'],a:['drowsy','sleepy'],why:'**Drowsy** and **sleepy** both mean ready to fall asleep.',notes:['Dressy means smartly dressed, and droopy means hanging down.','Slippery and sloppy only begin like sleepy.']},
 {g1:['foe','fog','fold'],g2:['enemy','energy','engine'],a:['foe','enemy'],level:'challenge',why:'A **foe** and an **enemy** are both someone who is against you.',notes:['Fog is thick mist, and fold means to bend something over.','Energy and engine only begin like enemy.']},
];

export const ANTONYM_SETS:PairSet[]=[
 {g1:['arrive','argue','aloud'],g2:['depart','deliver','decide'],a:['arrive','depart'],level:'quick',why:'To **arrive** is to reach a place and to **depart** is to leave it, so they are opposites.',notes:['Deliver and decide are not opposites of any word in the first group.']},
 {g1:['shallow','shadow','shiny'],g2:['deep','windy','clean'],a:['shallow','deep'],level:'quick',why:'**Shallow** water is not very deep, so **shallow** and **deep** are opposites.',notes:['Shadow only looks like shallow.']},
 {g1:['expand','expect','explain'],g2:['shrink','shriek','shelter'],a:['expand','shrink'],why:'To **expand** is to get bigger and to **shrink** is to get smaller.',notes:['Shriek looks like shrink, but it means a high scream.']},
 {g1:['victory','vicious','visitor'],g2:['defeat','battle','trophy'],a:['victory','defeat'],why:'A **victory** is a win and a **defeat** is a loss.',notes:['A battle can end in victory, and a trophy is a reward for it, but neither is its opposite.']},
 {g1:['permanent','pleasant','perfect'],g2:['temporary','tempting','tidy'],a:['permanent','temporary'],why:'**Permanent** means lasting for ever and **temporary** means lasting only a short time.',notes:['Tempting looks like temporary, but it means attractive.']},
 {g1:['humble','humid','hungry'],g2:['proud','private','pointed'],a:['humble','proud'],why:'A **humble** person does not boast, while a **proud** person may think too highly of themselves.',notes:['Humid means warm and damp; its opposite would be dry.']},
 {g1:['scarce','scared','scary'],g2:['plentiful','portable','precious'],a:['scarce','plentiful'],level:'challenge',why:'**Scarce** means in short supply and **plentiful** means more than enough.',notes:['Scarce things can be precious, but precious is not the opposite of scarce.','Scared and scary only look like scarce.']},
 {g1:['reveal','revise','remove'],g2:['conceal','concern','control'],a:['reveal','conceal'],why:'To **reveal** is to show something and to **conceal** is to hide it.',notes:['Concern and control only begin like conceal.']},
 {g1:['entrance','entertain','envelope'],g2:['exit','excite','exact'],a:['entrance','exit'],level:'quick',why:'An **entrance** is the way in and an **exit** is the way out, so they are opposites.',notes:['Entertain, envelope, excite and exact only begin like entrance and exit.']},
 {g1:['optimistic','organised','ordinary'],g2:['pessimistic','patriotic','punctual'],a:['optimistic','pessimistic'],level:'challenge',why:'An **optimistic** person expects things to go well and a **pessimistic** person expects them to go badly.',notes:['The opposite of organised would be messy, and of ordinary would be unusual.']},
 {g1:['rigid','rapid','rural'],g2:['flexible','fearful','famous'],a:['rigid','flexible'],why:'**Rigid** means stiff and unable to bend, while **flexible** means bending easily.',notes:['The opposite of rapid would be slow, and of rural would be urban.']},
 {g1:['frequent','friendly','frozen'],g2:['rare','rich','round'],a:['frequent','rare'],why:'**Frequent** means happening often and **rare** means happening seldom.',notes:['The opposite of friendly would be unfriendly or hostile.']},
 {g1:['vertical','vital','vivid'],g2:['horizontal','heavy','hopeful'],a:['vertical','horizontal'],why:'A **vertical** line goes straight up and down and a **horizontal** line goes straight across.',notes:['The opposite of vivid would be dull.']},
 {g1:['fresh','fierce','famous'],g2:['stale','steep','spare'],a:['fresh','stale'],level:'quick',why:'**Fresh** bread is newly made and **stale** bread is old and dry.',notes:['The opposite of fierce would be gentle.']},
 {g1:['guilty','greedy','gentle'],g2:['innocent','important','instant'],a:['guilty','innocent'],why:'**Guilty** means having done something wrong and **innocent** means having done nothing wrong.',notes:['The opposite of greedy would be generous.']},
 {g1:['thrifty','thirsty','thorough'],g2:['wasteful','wooden','wobbly'],a:['thrifty','wasteful'],level:'challenge',why:'A **thrifty** person is careful with money and a **wasteful** person uses things carelessly.',notes:['Thirsty and thorough only look like thrifty.']},
 {g1:['sturdy','starry','stormy'],g2:['flimsy','fluffy','frosty'],a:['sturdy','flimsy'],why:'**Sturdy** means strong and solid, while **flimsy** means weak and easily broken.',notes:['The opposite of stormy would be calm.']},
 {g1:['praise','prance','prove'],g2:['criticise','collect','capture'],a:['praise','criticise'],why:'To **praise** is to say good things about someone and to **criticise** is to point out faults.',notes:['Prance only looks like praise: it means to move with high, springy steps.']},
 {g1:['float','flat','flute'],g2:['sink','sing','song'],a:['float','sink'],level:'quick',why:'Things that **float** stay on top of water; things that **sink** go down.',notes:['Sing and song only look like sink.']},
 {g1:['transparent','triumphant','tolerant'],g2:['opaque','open','obvious'],a:['transparent','opaque'],level:'challenge',why:'You can see through something **transparent**, but not through something **opaque**.',notes:['Obvious and open are closer in meaning to transparent than opposite to it.']},
 {g1:['awake','award','await'],g2:['asleep','aside','ashore'],a:['awake','asleep'],level:'quick',why:'**Awake** means not sleeping and **asleep** means sleeping, so they are opposites.',notes:['Award, await, aside and ashore only look a little like awake and asleep.']},
 {g1:['borrow','border','bottle'],g2:['lend','lean','leap'],a:['borrow','lend'],why:'To **borrow** is to take something for a while, and to **lend** is to give it for a while.',notes:['Border, bottle, lean and leap are not opposites of either word.']},
 {g1:['bitter','bitten','butter'],g2:['sweet','sweat','sweep'],a:['bitter','sweet'],level:'quick',why:'A **bitter** taste and a **sweet** taste are opposites.',notes:['Bitten and butter only look like bitter.','Sweat and sweep only look like sweet.']},
 {g1:['public','publish','puddle'],g2:['private','pretty','prickly'],a:['public','private'],why:'**Public** means open to everyone and **private** means kept for one person or a few people.',notes:['Publish, puddle, pretty and prickly only begin like public and private.']},
 {g1:['major','manor','magic'],g2:['minor','miner','mirror'],a:['major','minor'],why:'**Major** means greater or more important, and **minor** means smaller or less important.',notes:['Manor, magic, miner and mirror only look like major and minor.']},
 {g1:['interior','interest','interval'],g2:['exterior','extra','expert'],a:['interior','exterior'],level:'challenge',why:'The **interior** is the inside and the **exterior** is the outside.',notes:['Interest, interval, extra and expert only begin like interior and exterior.']},
 {g1:['tighten','ticket','timber'],g2:['loosen','lotion','locker'],a:['tighten','loosen'],why:'To **tighten** is to make something firmer, and to **loosen** is to make it slacker.',notes:['Ticket, timber, lotion and locker only begin like tighten and loosen.']},
 {g1:['include','increase','index'],g2:['exclude','excuse','excite'],a:['include','exclude'],why:'To **include** is to put something in, and to **exclude** is to leave it out.',notes:['Increase and index only begin like include.','Excuse and excite only begin like exclude.']},
 {g1:['advance','advantage','adventure'],g2:['retreat','repeat','remain'],a:['advance','retreat'],level:'challenge',why:'To **advance** is to move forward and to **retreat** is to move back.',notes:['Advantage and adventure only begin like advance.','Repeat and remain are not opposites of advance.']},
 {g1:['fertile','festival','fever'],g2:['barren','barrel','bargain'],a:['fertile','barren'],level:'challenge',why:'**Fertile** land grows plants easily, and **barren** land grows almost nothing.',notes:['Festival and fever only begin like fertile.','Barrel and bargain only begin like barren.']},
];

// ── Definitions: the meaning of a word in one sentence ──
type Meaning={word:string;sentence:string;answer:string;wrong:string[];why:string;level?:Level};
export const DEFINITIONS:Meaning[]=[
 {word:'bright',sentence:'Only a very bright pupil could have solved that puzzle so quickly.',answer:'clever',wrong:['shiny','sunny','colourful','loud'],level:'quick',why:'Here **bright** means **clever**: solving a hard puzzle quickly takes a quick mind.\n- Shiny, sunny, colourful and loud (as in a loud, bright shirt) belong to the meaning of bright that is about light and colour, which does not fit a pupil solving a puzzle.'},
 {word:'moved',sentence:'The kind letter from her friend deeply moved Grandma.',answer:'touched',wrong:['shifted','carried','sold','relocated'],why:'Here **moved** means **touched**: the letter stirred Grandma\'s feelings.\n- Shifted, carried and relocated are about changing position, and sold (the shop moved all its stock) is another meaning of moved.'},
 {word:'stand',sentence:'Grandpa cannot stand the sound of squeaky chalk.',answer:'tolerate',wrong:['rise','place','remain','booth'],why:'Here **stand** means **tolerate**: Grandpa cannot bear the sound.\n- Rise (stand up), place (stand it on the table), remain (the record still stands) and booth (a market stand) are other meanings.'},
 {word:'sound',sentence:'Her plan was sound, so the class agreed to try it.',answer:'sensible',wrong:['noise','asleep','loud','musical'],level:'challenge',why:'Here **sound** means **sensible**: the class agreed because the plan was well thought out.\n- Noise, loud and musical link to the sound we hear, and asleep comes from "sound asleep".'},
 {word:'bank',sentence:'The ducks waddled up the muddy bank of the stream.',answer:'edge',wrong:['row','tilt','store','vault'],level:'quick',why:'Here **bank** means the **edge** of the stream.\n- Row (a bank of lights), tilt (a plane banks), store (a food bank) and vault (a bank for money) are other meanings.'},
 {word:'fair',sentence:'The forecast says the weather will be fair for sports day.',answer:'fine',wrong:['just','pale','festival','equal'],why:'Here **fair** weather is **fine** weather: dry and pleasant.\n- Just and equal are about treating people fairly, pale is about fair hair or skin, and a festival is a fair with rides.'},
 {word:'present',sentence:'Everyone who was present at the meeting voted.',answer:'attending',wrong:['gift','current','introducing','giving'],why:'Here **present** means **attending**: the people who were there voted.\n- A gift is a present, current means happening now, and introducing and giving come from the verb to present (to present a speaker or a prize).'},
 {word:'cross',sentence:'Dad was cross when the puppy chewed his slippers.',answer:'annoyed',wrong:['mixed','sign','across','travel'],why:'Here **cross** means **annoyed**.\n- Mixed (a cross between two breeds), sign (the × sign), across and travel (to cross the road) are other meanings.'},
 {word:'plain',sentence:'The cake was plain, with no icing or sprinkles.',answer:'simple',wrong:['grassland','obvious','honest','aircraft'],why:'Here **plain** means **simple**, without decoration.\n- Grassland (a wide plain), obvious (plain to see) and honest (plain speaking) are other meanings. An aircraft is a plane, a different word that sounds the same.'},
 {word:'content',sentence:'After a big lunch, the cat lay content by the fire.',answer:'satisfied',wrong:['topic','amount','material','inside'],level:'challenge',why:'Here **content** (said con-TENT) means **satisfied** and happy.\n- Topic, amount, material and inside come from the noun content (said CON-tent), meaning what something contains.'},
 {word:'object',sentence:'Nobody will object if you open the window.',answer:'protest',wrong:['thing','aim','item','goal'],level:'challenge',why:'Here **object** (said ob-JECT) means **protest**, or complain.\n- Thing and item come from the noun object (said OB-ject), and aim and goal from "the object of the game".'},
 {word:'tender',sentence:'The carrots were cooked until they were tender.',answer:'soft',wrong:['sore','loving','offer','young'],why:'Here **tender** means **soft**, so the carrots are easy to cut and chew.\n- Sore (a tender bruise), loving (a tender hug), offer (to tender) and young (a tender age) are other meanings.'},
 {word:'spring',sentence:'Fresh water bubbled up from a spring in the hillside.',answer:'source',wrong:['season','jump','coil','bounce'],why:'Here a **spring** is a **source**: a place where water comes up out of the ground.\n- Season, jump, coil and bounce are other meanings of spring.'},
 {word:'leaves',sentence:'The bus leaves the station at nine o\'clock.',answer:'departs',wrong:['foliage','pages','forgets','holidays'],level:'quick',why:'Here **leaves** means **departs**: the bus sets off at nine.\n- Foliage and pages come from the noun leaves (on trees and in books); forgets (I left my bag) and holidays (time off, called leave) are other meanings.'},
 {word:'fine',sentence:'Jaya had to pay a fine because her library book was late.',answer:'penalty',wrong:['thin','well','sunny','excellent'],level:'quick',why:'Here a **fine** is a **penalty**: money paid for breaking a rule.\n- Thin (fine hair), well (I feel fine), sunny (fine weather) and excellent (a fine meal) are other meanings.'},
 {word:'rare',sentence:'A rare bird was spotted in the park.',answer:'uncommon',wrong:['undercooked','thin','tiny','wild'],why:'Here **rare** means **uncommon**: not many of these birds are seen.\n- Undercooked (rare steak) and thin (the rare air on a mountain) are other meanings. Tiny and wild do not mean rare.'},
 {word:'charge',sentence:'The bull began to charge across the field.',answer:'rush',wrong:['cost','electricity','accuse','care'],why:'Here **charge** means **rush** forward.\n- Cost (the charge for a ticket), electricity (an electric charge), accuse (to charge someone with a crime) and care (in charge of) are other meanings.'},
 {word:'still',sentence:'The lake was completely still at dawn.',answer:'calm',wrong:['yet','however','photograph','stormy'],why:'Here **still** means **calm**, with no movement at all.\n- Yet (is it still raining?), however (still, we tried) and photograph (a still from a film) are other meanings, and stormy is the opposite of still.'},
 {word:'row',sentence:'There was a noisy row between the two neighbours about the hedge.',answer:'argument',wrong:['line','paddle','series','tier'],why:'Here a **row** (rhymes with cow) is an **argument**.\n- Line, series and tier come from row (rhymes with go), meaning things placed side by side; paddle comes from rowing a boat.'},
 {word:'train',sentence:'It takes about two years to train a guide dog.',answer:'teach',wrong:['carriage','engine','travel','aim'],why:'Here **train** means **teach** a skill.\n- Carriage and engine belong to a railway train, travel to going by train, and aim to training a camera on something.'},
 {word:'firm',sentence:'The jelly was not firm enough to turn out of the mould.',answer:'solid',wrong:['company','strict','certain','business'],level:'quick',why:'Here **firm** means **solid**: the jelly is too soft to hold its shape.\n- Company and business are a firm you can work for, and strict and certain describe a firm person or a firm decision.'},
 {word:'season',sentence:'Season the soup with a little pepper before you serve it.',answer:'flavour',wrong:['spring','summer','weather','episode'],why:'Here **season** means **flavour**: add pepper so the soup tastes better.\n- Spring, summer and weather belong to the seasons of the year, and episode belongs to a season of a programme.'},
 {word:'current',sentence:'The current pulled the canoe towards the weir.',answer:'flow',wrong:['present','modern','electric','news'],level:'quick',why:'Here the **current** is the **flow** of the river.\n- Present and modern mean happening now, electric belongs to an electrical current, and news belongs to a current-affairs programme.'},
 {word:'patient',sentence:'Please be patient while the paint dries.',answer:'calm',wrong:['hospital','customer','doctor','ill'],why:'Here **patient** means **calm** and willing to wait.\n- Hospital, customer, doctor and ill belong to a patient who is being treated.'},
 {word:'match',sentence:'These boots do not match the rest of the kit.',answer:'suit',wrong:['game','stick','contest','final'],level:'quick',why:'Here **match** means **suit**: the boots do not go with the kit.\n- Game, contest and final are a sports match, and a stick for lighting fires is another kind of match.'},
 {word:'mine',sentence:'The canary was carried down into the old mine.',answer:'pit',wrong:['belonging','own','coal','explosive'],why:'Here a **mine** is a **pit**: a hole dug to reach coal or stone.\n- Belonging and own come from "it is mine", coal is what a mine may produce, and explosive comes from a mine used as a weapon.'},
 {word:'seal',sentence:'Seal the envelope before you post the letter.',answer:'close',wrong:['animal','stamp','mammal','approve'],level:'challenge',why:'Here **seal** means **close** the envelope so it stays shut.\n- Animal and mammal are a seal in the sea, stamp is the sticker on an envelope, and approve comes from sealing a decision.'},
 {word:'yard',sentence:'The children played in the yard behind the cottage.',answer:'courtyard',wrong:['metre','measure','length','zero'],why:'Here a **yard** is a **courtyard**: the outdoor space behind the cottage.\n- Metre, measure and length belong to a yard as a distance, and zero comes from "back to yard zero".'},
 {word:'volume',sentence:'Please turn down the volume of the radio.',answer:'loudness',wrong:['book','amount','space','chapter'],level:'quick',why:'Here **volume** means **loudness**: how strong the sound is.\n- Book and chapter belong to one volume of a series, and amount and space belong to the volume of a liquid or a room.'},
 {word:'date',sentence:'Write the date at the top of your letter.',answer:'day',wrong:['fruit','meeting','partner','diary'],why:'Here the **date** is the **day** of the letter, such as 12 June.\n- Fruit is a date you can eat, and meeting, partner and diary belong to going on a date or keeping dates.'},
];
const definitionDrafts=():Draft[]=>DEFINITIONS.map(d=>({prompt:`Identify the meaning of the word '${d.word}' in this sentence.`,stimulus:d.sentence,answer:d.answer,wrong:d.wrong,explanation:d.why,rewardGroup:d.level}));

// ── Double meanings: one word that matches both brackets ──
type Double={b1:[string,string];b2:[string,string];answer:string;fit1:string[];fit2:string[];other:string[];why:string;level?:Level};
export const DOUBLES:Double[]=[
 {b1:['ignite','kindle'],b2:['weightless','airy'],answer:'light',fit1:['burn'],fit2:['fluffy'],other:['flame','bright'],why:'**Light** can mean to set fire to (ignite, kindle) and not heavy (weightless, airy).'},
 {b1:['stingy','miserly'],b2:['signify','indicate'],answer:'mean',fit1:['tight'],fit2:['show'],other:['greedy','prove'],level:'challenge',why:'**Mean** can describe someone who hates spending money (stingy, miserly), and to mean is to signify or indicate.'},
 {b1:['ripple','breaker'],b2:['gesture','signal'],answer:'wave',fit1:['roller'],fit2:['salute','nod'],other:['tide'],why:'A **wave** moves across water (ripple, breaker), and you wave your hand as a gesture or signal.'},
 {b1:['carry','support'],b2:['endure','tolerate'],answer:'bear',fit1:['lift','transport'],fit2:['suffer','allow'],other:[],level:'challenge',why:'To **bear** a weight is to carry or support it, and to bear a problem is to endure or tolerate it.'},
 {b1:['mail','send'],b2:['pole','stake'],answer:'post',fit1:['deliver'],fit2:['column'],other:['parcel','fence'],why:'To **post** a letter is to mail or send it, and a **post** is a pole or stake in the ground.'},
 {b1:['circle','band'],b2:['call','phone'],answer:'ring',fit1:['loop','hoop'],fit2:['text'],other:['bell'],level:'quick',why:'A **ring** is a circle or band, and to ring someone is to call or phone them.'},
 {b1:['chest','case'],b2:['snout','nose'],answer:'trunk',fit1:['suitcase'],fit2:['beak'],other:['tusk','branch'],why:'A **trunk** is a large chest or case for packing, and an elephant\'s long snout or nose is also its trunk.'},
 {b1:['bat','stick'],b2:['society','group'],answer:'club',fit1:['racket','rod'],fit2:['team','band'],other:[],level:'quick',why:'A **club** can be a bat or stick (such as a golf club) and a society or group of people.'},
 {b1:['stone','boulder'],b2:['sway','swing'],answer:'rock',fit1:['pebble'],fit2:['wobble','roll'],other:['brick'],level:'quick',why:'A **rock** is a stone or boulder, and to rock is to sway or swing gently.'},
 {b1:['basin','bowl'],b2:['drop','descend'],answer:'sink',fit1:['bath'],fit2:['fall'],other:['drain','float'],level:'quick',why:'A **sink** is a basin or bowl with taps, and to sink is to drop or descend, especially through water.'},
 {b1:['push','squeeze'],b2:['newspapers','reporters'],answer:'press',fit1:['shove','crush'],fit2:['media','news'],other:[],level:'challenge',why:'To **press** is to push or squeeze, and **the press** means newspapers and the reporters who write them.'},
 {b1:['message','memo'],b2:['tone','sound'],answer:'note',fit1:['letter'],fit2:['tune'],other:['card','chord'],why:'A **note** is a short written message or memo, and a musical note is a single tone or sound.'},
 {b1:['quick','speedy'],b2:['secure','fixed'],answer:'fast',fit1:['swift','hasty'],fit2:['tight','stuck'],other:[],why:'**Fast** means quick or speedy, and it also means firmly secure or fixed, as in "stuck fast".'},
 {b1:['pointed','spiky'],b2:['clever','smart'],answer:'sharp',fit1:['prickly','thorny'],fit2:['wise','brainy'],other:[],why:'**Sharp** can describe something pointed or spiky, and a sharp mind is clever or smart.'},
 {b1:['conceal','cover'],b2:['skin','pelt'],answer:'hide',fit1:['mask','bury'],fit2:['fur','leather'],other:[],why:'To **hide** something is to conceal or cover it, and an animal\'s **hide** is its skin or pelt.'},
 {b1:['circuit','round'],b2:['lick','drink'],answer:'lap',fit1:['loop'],fit2:['sip','slurp'],other:['race'],why:'A **lap** is one circuit or round of a track, and a cat laps milk when it licks or drinks it.'},
 {b1:['steady','secure'],b2:['barn','stall'],answer:'stable',fit1:['firm','sturdy'],fit2:['shed','pen'],other:[],level:'challenge',why:'**Stable** means steady or secure, and a **stable** is a building like a barn or stall where horses are kept.'},
 {b1:['thin','slim'],b2:['tilt','slope'],answer:'lean',fit1:['slender','skinny'],fit2:['tip'],other:['bend'],why:'**Lean** means thin or slim, and to lean is to tilt or slope to one side.'},
 {b1:['spread','preserve'],b2:['squeeze','cram'],answer:'jam',fit1:['butter','honey'],fit2:['stuff','force'],other:[],why:'**Jam** is a sweet spread (a fruit preserve), and to jam things is to squeeze or cram them into a space.'},
 {b1:['coins','cash'],b2:['alter','vary'],answer:'change',fit1:['money'],fit2:['adjust','modify'],other:['purse'],why:'**Change** is coins or cash given back after paying, and to change something is to alter or vary it.'},
 {b1:['fruit','crop'],b2:['meeting','appointment'],answer:'date',fit1:['plum'],fit2:['diary'],other:['calendar'],level:'quick',why:'A **date** can be a sweet fruit or crop, and a date can be a meeting or appointment.'},
 {b1:['company','business'],b2:['solid','hard'],answer:'firm',fit1:['shop'],fit2:['stiff'],other:['office'],why:'A **firm** can be a company or business, and firm can mean solid or hard.'},
 {b1:['game','contest'],b2:['suit','pair'],answer:'match',fit1:['final'],fit2:['twin'],other:['sport'],level:'quick',why:'A **match** can be a game or contest, and to match is to suit or to form a pair.'},
 {b1:['pit','shaft'],b2:['belonging','possession'],answer:'mine',fit1:['coal'],fit2:['yours'],other:['cave'],level:'challenge',why:'A **mine** is a pit or shaft dug underground, and mine means belonging to me, a possession.'},
 {b1:['close','fasten'],b2:['animal','mammal'],answer:'seal',fit1:['shut'],fit2:['whale'],other:['glue'],why:'To **seal** an envelope is to close or fasten it, and a seal is a sea animal, a mammal.'},
 {b1:['flow','stream'],b2:['present','modern'],answer:'current',fit1:['river'],fit2:['today'],other:['tide'],level:'quick',why:'A **current** is a flow or stream of water, and current also means present or modern.'},
 {b1:['courtyard','enclosure'],b2:['length','measure'],answer:'yard',fit1:['lawn'],fit2:['metre'],other:['patio'],level:'challenge',why:'A **yard** can be a courtyard or enclosure behind a house, and a yard is also a length or measure.'},
 {b1:['loudness','sound'],b2:['book','tome'],answer:'volume',fit1:['noise'],fit2:['novel'],other:['chapter'],why:'**Volume** can mean loudness or the strength of a sound, and a volume can be a book or tome.'},
 {b1:['flavour','spice'],b2:['spring','autumn'],answer:'season',fit1:['pepper'],fit2:['winter'],other:['salt'],why:'To **season** food is to flavour or spice it, and a season is a part of the year, such as spring or autumn.'},
 {b1:['creature','mammal'],b2:['stick','club'],answer:'bat',fit1:['mouse'],fit2:['racket'],other:['owl'],level:'quick',why:'A **bat** is a flying creature and a mammal, and a bat is also a stick or club used in some games.'},
];
const doubleDrafts=():Draft[]=>DOUBLES.map(d=>{
 const wrong=[...d.fit1,...d.fit2,...d.other],w1=wrong.filter(w=>d.fit1.includes(w)),w2=wrong.filter(w=>d.fit2.includes(w));
 const notes=[w1.length&&`${w1.join(' and ').replace(/^./,c=>c.toUpperCase())} ${w1.length>1?'fit':'fits'} only the first pair (${d.b1.join(', ')}).`,w2.length&&`${w2.join(' and ').replace(/^./,c=>c.toUpperCase())} ${w2.length>1?'fit':'fits'} only the second pair (${d.b2.join(', ')}).`].filter(Boolean) as string[];
 return {prompt:'Select the word that is similar in meaning to the words in both sets of brackets.',stimulus:`(${d.b1.join(', ')}) (${d.b2.join(', ')})`,answer:d.answer,wrong,explanation:lines(d.why,notes),rewardGroup:d.level};
});

// ── Two odd ones out: three words share a meaning or group ──
type OddSet={words:string[];odd:[string,string];why:string;level?:Level};
export const ODD_SETS:OddSet[]=[
 {words:['glad','angry','cheerful','tired','merry'],odd:['angry','tired'],level:'quick',why:'**Glad**, **cheerful** and **merry** all mean happy. Angry and tired do not.'},
 {words:['oak','rose','ash','daisy','elm'],odd:['rose','daisy'],level:'quick',why:'**Oak**, **ash** and **elm** are all trees. A rose and a daisy are flowers.'},
 {words:['stroll','sprint','amble','dash','wander'],odd:['sprint','dash'],why:'**Stroll**, **amble** and **wander** all mean to walk slowly. Sprint and dash mean to move very fast.'},
 {words:['whisper','bellow','murmur','roar','mutter'],odd:['bellow','roar'],why:'**Whisper**, **murmur** and **mutter** all mean to speak quietly. Bellow and roar are very loud.'},
 {words:['sparrow','bee','robin','moth','wren'],odd:['bee','moth'],level:'quick',why:'**Sparrows**, **robins** and **wrens** are birds. Bees and moths fly too, but they are insects.'},
 {words:['violin','trumpet','cello','flute','harp'],odd:['trumpet','flute'],why:'The **violin**, **cello** and **harp** are string instruments. The trumpet and flute are played by blowing.'},
 {words:['hammer','spoon','saw','fork','drill'],odd:['spoon','fork'],level:'quick',why:'A **hammer**, **saw** and **drill** are tools for building. A spoon and fork are cutlery for eating.'},
 {words:['furious','calm','livid','irate','content'],odd:['calm','content'],why:'**Furious**, **livid** and **irate** all mean very angry. Calm and content describe someone who is peaceful.'},
 {words:['soggy','parched','damp','arid','moist'],odd:['parched','arid'],level:'challenge',why:'**Soggy**, **damp** and **moist** all mean wet. Parched and arid mean very dry.'},
 {words:['brave','timid','bold','meek','daring'],odd:['timid','meek'],why:'**Brave**, **bold** and **daring** all mean fearless. Timid and meek mean shy and easily frightened.'},
 {words:['gallop','slither','trot','hop','canter'],odd:['slither','hop'],level:'challenge',why:'**Gallop**, **trot** and **canter** are the ways a horse moves. Snakes slither and rabbits hop.'},
 {words:['metre','kilogram','centimetre','litre','kilometre'],odd:['kilogram','litre'],why:'A **metre**, **centimetre** and **kilometre** all measure length. A kilogram measures mass and a litre measures capacity.'},
 {words:['cautious','reckless','careful','rash','wary'],odd:['reckless','rash'],why:'**Cautious**, **careful** and **wary** all mean taking care to avoid danger. Reckless and rash mean the opposite.'},
 {words:['copper','wood','iron','glass','silver'],odd:['wood','glass'],why:'**Copper**, **iron** and **silver** are all metals. Wood and glass are materials, but not metals.'},
 {words:['kettle','pillow','toaster','duvet','microwave'],odd:['pillow','duvet'],why:'A **kettle**, **toaster** and **microwave** are kitchen appliances. A pillow and a duvet are bedding.'},
 {words:['huge','tiny','vast','minute','immense'],odd:['tiny','minute'],why:'**Huge**, **vast** and **immense** all mean very big. Tiny and minute (said my-NEWT) mean very small.'},
 {words:['pentagon','cube','hexagon','sphere','octagon'],odd:['cube','sphere'],why:'A **pentagon**, **hexagon** and **octagon** are flat (2D) shapes. A cube and a sphere are solid (3D) shapes.'},
 {words:['noun','comma','verb','colon','adjective'],odd:['comma','colon'],why:'A **noun**, **verb** and **adjective** are all word classes. A comma and a colon are punctuation marks.'},
 {words:['sapphire','marble','ruby','granite','emerald'],odd:['marble','granite'],level:'challenge',why:'A **sapphire**, **ruby** and **emerald** are all precious gems. Marble and granite are types of rock used for building.'},
 {words:['carp','whale','trout','dolphin','goldfish'],odd:['whale','dolphin'],level:'challenge',why:'**Carp**, **trout** and **goldfish** are fish. A whale and a dolphin live in water, but they are mammals that breathe air.'},
 {words:['apple','pear','plum','bus','tram'],odd:['bus','tram'],level:'quick',why:'An **apple**, a **pear** and a **plum** are all fruit. A bus and a tram are ways of travelling.'},
 {words:['red','blue','green','seven','nine'],odd:['seven','nine'],level:'quick',why:'**Red**, **blue** and **green** are colours. Seven and nine are numbers.'},
 {words:['sock','glove','scarf','pencil','ruler'],odd:['pencil','ruler'],why:'A **sock**, a **glove** and a **scarf** are clothes. A pencil and a ruler are things you use at a desk.'},
 {words:['rain','snow','hail','bread','cake'],odd:['bread','cake'],level:'quick',why:'**Rain**, **snow** and **hail** fall from clouds. Bread and cake are foods you bake.'},
 {words:['circle','square','triangle','Monday','Friday'],odd:['Monday','Friday'],why:'A **circle**, a **square** and a **triangle** are shapes. Monday and Friday are days of the week.'},
 {words:['kick','throw','catch','tulip','daisy'],odd:['tulip','daisy'],why:'**Kick**, **throw** and **catch** are actions in a ball game. A tulip and a daisy are flowers.'},
 {words:['January','March','June','carrot','onion'],odd:['carrot','onion'],level:'challenge',why:'**January**, **March** and **June** are months. A carrot and an onion are vegetables.'},
 {words:['piano','drum','guitar','shark','eel'],odd:['shark','eel'],why:'A **piano**, a **drum** and a **guitar** are musical instruments. A shark and an eel are animals that live in water.'},
 {words:['puppy','kitten','calf','sycamore','beech'],odd:['sycamore','beech'],level:'challenge',why:'A **puppy**, a **kitten** and a **calf** are young animals. A sycamore and a beech are trees.'},
 {words:['river','lake','stream','chair','stool'],odd:['chair','stool'],level:'quick',why:'A **river**, a **lake** and a **stream** are bodies of water. A chair and a stool are seats.'},
];
const oddDrafts=():Draft[]=>ODD_SETS.map(s=>{const words=mixed(s.words);return {prompt:'From this group of words, select the **two** words that do not fit with the rest.',stimulus:words.join(', '),answer:[s.odd[0],s.odd[1]],options:words,explanation:s.why,rewardGroup:s.level};});

// ── Word analogies ──
type Analogy={a:string;b:string;c:string;answer:string;wrong:string[];why:string;level?:Level};
export const ANALOGIES:Analogy[]=[
 {a:'bee',b:'hive',c:'bird',answer:'nest',wrong:['feather','wing','beak','worm'],level:'quick',why:'A bee lives in a **hive**, and a bird lives in a **nest**.\n- Feathers, wings and beaks are parts of a bird, and a worm is something a bird eats.'},
 {a:'poet',b:'poem',c:'sculptor',answer:'statue',wrong:['chisel','marble','museum','artist'],why:'A poet creates a **poem**, and a sculptor creates a **statue**.\n- A chisel is the tool, marble is the material and a museum is where statues are shown.'},
 {a:'hot',b:'cold',c:'early',answer:'late',wrong:['soon','first','dawn','quick'],level:'quick',why:'Hot is the opposite of **cold**, and early is the opposite of **late**.'},
 {a:'puppy',b:'dog',c:'foal',answer:'horse',wrong:['calf','stable','lamb','saddle'],level:'quick',why:'A puppy grows into a **dog**, and a foal grows into a **horse**.\n- A calf and a lamb are young animals too, but they grow into a cow and a sheep.'},
 {a:'glove',b:'hand',c:'sock',answer:'foot',wrong:['shoe','boot','wool','drawer'],level:'quick',why:'A glove is worn on the **hand**, and a sock is worn on the **foot**.\n- Shoes and boots are worn with socks, but they are not parts of the body.'},
 {a:'pen',b:'write',c:'knife',answer:'cut',wrong:['fork','sharp','blade','kitchen'],why:'You use a pen to **write**, and you use a knife to **cut**.\n- Sharp describes a knife and blade is part of one, but neither is what you do with it.'},
 {a:'library',b:'books',c:'aquarium',answer:'fish',wrong:['glass','tank','zoo','river'],why:'A library is a place full of **books** for people to use, and an aquarium is a place full of **fish** for people to see.'},
 {a:'sheep',b:'flock',c:'fish',answer:'shoal',wrong:['pond','net','herd','fin'],why:'A group of sheep is a **flock**, and a group of fish is a **shoal**.\n- Herd is a group word too, but it is used for cows and deer.'},
 {a:'brave',b:'cowardly',c:'generous',answer:'mean',wrong:['kind','rich','gift','giving'],level:'challenge',why:'Brave is the opposite of **cowardly**, and generous is the opposite of **mean**.\n- Kind and giving are close in meaning to generous, not opposite to it.'},
 {a:'hungry',b:'food',c:'tired',answer:'sleep',wrong:['yawn','lazy','night','awake'],level:'challenge',why:'When you are hungry you need **food**, and when you are tired you need **sleep**.\n- A yawn shows that you are tired, but it does not fix it.'},
 {a:'thermometer',b:'temperature',c:'clock',answer:'time',wrong:['hands','alarm','watch','wall'],why:'A thermometer measures **temperature**, and a clock measures **time**.'},
 {a:'mouse',b:'mice',c:'goose',answer:'geese',wrong:['gooses','gosling','gander','flock'],level:'quick',why:'Mice is the plural of **mouse**, and geese is the plural of **goose**.\n- A gosling is a young goose and a gander is a male goose.'},
 {a:'run',b:'ran',c:'swim',answer:'swam',wrong:['swum','swimmed','swims','swimming'],why:'Ran is the past tense of run ("I ran"), and **swam** is the past tense of swim ("I swam").\n- Swum needs a helper word: "I have swum".'},
 {a:'page',b:'book',c:'brick',answer:'wall',wrong:['cement','builder','clay','heavy'],why:'A page is one part of a **book**, and a brick is one part of a **wall**.'},
 {a:'carpenter',b:'wood',c:'potter',answer:'clay',wrong:['wheel','vase','kiln','garden'],why:'A carpenter makes things from **wood**, and a potter makes things from **clay**.\n- A vase is something a potter makes, not what it is made from.'},
 {a:'lion',b:'roar',c:'snake',answer:'hiss',wrong:['slither','scale','bite','coil'],level:'quick',why:'A lion makes a **roar**, and a snake makes a **hiss**.\n- Slither is how a snake moves, not the sound it makes.'},
 {a:'dentist',b:'teeth',c:'optician',answer:'eyes',wrong:['ears','nose','hair','hands'],why:'A dentist looks after your **teeth**, and an optician looks after your **eyes**.'},
 {a:'tall',b:'taller',c:'good',answer:'better',wrong:['gooder','best','goodest','well'],why:'Taller compares two things using tall, and **better** compares two things using good.\n- Best compares three or more things.'},
 {a:'hand',b:'palm',c:'foot',answer:'sole',wrong:['knee','shoe','sock','leg'],level:'challenge',why:'The palm is the underside of the hand, and the **sole** is the underside of the foot.\n- A shoe and a sock are worn on the foot, and the knee and leg are above it.'},
 {a:'dozen',b:'twelve',c:'score',answer:'twenty',wrong:['goal','ten','points','fifty'],level:'challenge',why:'A dozen means **twelve**, and a score means **twenty**.\n- Goal and points belong to the other meaning of score, in games.'},
];
const analogyDrafts=():Draft[]=>ANALOGIES.map(a=>({prompt:'Select the word that completes the second pair in the same way as the first pair.',stimulus:`${a.a} is to ${a.b} as ${a.c} is to ?`,answer:a.answer,wrong:a.wrong,explanation:a.why,rewardGroup:a.level}));

// ── Helpsheets ──
const V='Vocabulary';
const synonymsSheet:Helpsheet={intro:'Synonyms are words with the same or nearly the same meaning. Pick one word from each group so that the pair means the same.',
 steps:['Read every word in both groups and think what each one means.','Take the first word in group one and test it against each word in group two.','Keep going until you find the pair that means the same thing.','Check the other words: a word that looks or sounds similar is often a trap.'],
 example:{title:'Example: quiet, quick, queen | fast, loud, king',lines:['Quick and fast both mean moving at speed, so they are the pair.','Quiet and loud are opposites, not synonyms.','Queen and king are linked, but they do not mean the same.']},
 tips:['Watch for look-alike words, such as wary and weary.','An opposite is not a synonym, even though the two words are linked.','Try each word in a sentence: "The room was ___."']};
const antonymsSheet:Helpsheet={intro:'Antonyms are words with opposite meanings. Pick one word from each group so that the pair is as opposite as possible.',
 steps:['Say what each word in the first group means.','Think of its opposite, then look for that meaning in the second group.','Check that the pair are true opposites, not just linked words.'],
 example:{title:'Example: loud, lucky, lonely | quiet, quick, queen',lines:['Loud means making a lot of noise.','Quiet means making little or no noise.','So loud and quiet are the most opposite pair.']},
 tips:['Words that look alike (float, flute) are traps.','Opposites are the same kind of word: describing words pair with describing words.']};
const definitionsSheet:Helpsheet={intro:'Many words have more than one meaning. The sentence around the word tells you which meaning is being used.',
 steps:['Read the whole sentence and picture what is happening.','List the meanings you know for the word.','Swap each option into the sentence in place of the word.','Choose the option that keeps the meaning of the sentence exactly the same.'],
 example:{title:'Example: "Please match the socks into pairs."',lines:['Match can mean a game, a stick for lighting fires or to pair things up.','Only "pair up" fits sorting socks.','So here match means to pair.']},
 tips:['An option can be a real meaning of the word and still be wrong for this sentence.','Say the word out loud: some words change their sound when their meaning changes (a row of seats, a noisy row).']};
const doublesSheet:Helpsheet={intro:'You need one word that can mean the same as both pairs of words in brackets. Usually the word has two different meanings.',
 steps:['Read the first pair and think of words that mean the same.','Read the second pair and do the same.','Look for a word that appears in both of your lists.','Check the answer against all four bracket words.'],
 example:{title:'Example: (shout, yell) (cry, weep)',lines:['Shout and yell: holler, bawl, call …','Cry and weep: sob, wail, bawl …','Bawl fits both pairs.']},
 tips:['Check both brackets: many wrong options fit only one of them.','Think about nouns and verbs: a word can be a thing in one bracket and an action in the other.']};
const oddSheet:Helpsheet={intro:'Three of the five words are linked by meaning or by belonging to the same group. Find the link, then choose the two words that do not share it.',
 steps:['Read all five words.','Look for three words that mean the same or belong together (such as three fruits or three ways of speaking).','Check the two words left over do not fit that link.'],
 example:{title:'Example: tulip, carrot, daffodil, onion, bluebell',lines:['Tulip, daffodil and bluebell are all flowers.','Carrot and onion are vegetables.','So the two odd ones out are carrot and onion.']},
 tips:['The two odd words are often linked to each other, as with opposites of the three.','Make the link as exact as you can: "types of tree", not just "plants".']};
const analogySheet:Helpsheet={intro:'An analogy compares two pairs of words. Work out how the first pair is linked, then use the same link to complete the second pair.',
 steps:['Say the link between the first two words as a sentence, such as "a cow gives milk".','Use the same sentence with the third word: "a hen gives ___".','Choose the option that fits the sentence exactly.'],
 example:{title:'Example: cow is to milk as hen is to ?',lines:['A cow gives us milk.','A hen gives us eggs.','So the answer is egg.']},
 tips:['Common links: opposite, a young animal, a group, a place, a tool and what it does, a part and the whole.','Wrong options are often linked to the third word in a different way, so test your sentence.']};

export const vrVocabTopics=[
 fixed(vrTopic('synonyms',V,'Synonyms',synonymsSheet),pairDrafts('Select the **two** words, one from each group, that are closest in meaning.',SYNONYM_SETS)),
 fixed(vrTopic('antonyms',V,'Antonyms',antonymsSheet),pairDrafts('Select the **two** words, one from each group, that are most opposite in meaning.',ANTONYM_SETS)),
 fixed(vrTopic('definitions',V,'Definitions in context',definitionsSheet),definitionDrafts()),
 fixed(vrTopic('double-meanings',V,'Double meanings',doublesSheet),doubleDrafts()),
 fixed(vrTopic('odd-ones-out',V,'Two odd ones out',oddSheet),oddDrafts()),
 fixed(vrTopic('word-analogies',V,'Word analogies',analogySheet),analogyDrafts()),
];
