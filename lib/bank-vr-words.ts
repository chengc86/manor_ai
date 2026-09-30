import {fixed,explain,cap,list,type Draft,type Helpsheet} from './bank-kit';
import type {RewardGroup} from './question-rewards';
import {vrTopic,mixed} from './bank-vr-vocab';
// Verbal reasoning: word and letter puzzles, written by hand. Each puzzle was checked against a full English word list
// while it was written (only the answer works), and tests/bank-vr.cjs re-checks them against lib/bank-vr-lexicon.ts.

type Level=RewardGroup|undefined;
const S='Words and letters';
const letters=(s:string)=>s.toLowerCase().replace(/[^a-z]/g,'');
/** Builds drafts without ever throwing: a puzzle whose data does not fit together is left out (the kit then reports it
 * as a missing question) instead of stopping the whole bank from loading. */
const drafts=<T,>(items:T[],make:(x:T)=>Draft|null):Draft[]=>items.map(x=>{try{return make(x);}catch{return null;}}) as Draft[];

// ── Hidden words: a four-letter word across the end of one word and the start of the next ──
type Hidden={sentence:string;answer:string;wrong:string[];level?:Level};
export const HIDDEN:Hidden[]=[
 {sentence:'The bus halted at the corner.',answer:'bush',wrong:['corn','push','busy','rush'],level:'quick'},
 {sentence:'The car took us home.',answer:'cart',wrong:['card','part','scar','shoe'],level:'quick'},
 {sentence:'The lion cub eagerly drank milk.',answer:'cube',wrong:['lion','tube','beak','cute']},
 {sentence:'How far must we walk?',answer:'farm',wrong:['form','warm','firm','army']},
 {sentence:'Thank you for keeping my seat.',answer:'fork',wrong:['keep','cork','work','folk']},
 {sentence:'Tom interrupted the story.',answer:'mint',wrong:['mind','hint','mine','test'],level:'quick'},
 {sentence:'Farah and Leo planted beans.',answer:'hand',wrong:['plan','band','land','hard']},
 {sentence:'The dog ate my sandwich.',answer:'gate',wrong:['sand','date','game','late'],level:'quick'},
 {sentence:'Please wait at entrance two.',answer:'tent',wrong:['ease','rent','went','tend']},
 {sentence:'The actor wore that wig on stage.',answer:'twig',wrong:['stag','twin','torn','wigs']},
 {sentence:'The pupil ambled home.',answer:'lamb',wrong:['lamp','limb','slam','clam']},
 {sentence:'The cat leapt up and over a wall.',answer:'dove',wrong:['leap','love','move','cove']},
 {sentence:'Who sent this lovely card?',answer:'hose',wrong:['love','rose','nose','host']},
 {sentence:'Grandpa thought the film was funny.',answer:'path',wrong:['gran','bath','oath','wash'],level:'challenge'},
 {sentence:'The dog rested by the fire.',answer:'ogre',wrong:['rest','door','grew','grey'],level:'challenge'},
 {sentence:'Rita peeled the orange slowly.',answer:'tape',wrong:['peel','cape','tame','type']},
 {sentence:'The game allowed four players.',answer:'meal',wrong:['play','meat','real','mean']},
 {sentence:'The liquid easily filled the jug.',answer:'idea',wrong:['fill','side','tide','wide'],level:'challenge'},
 {sentence:'The school disco attracted lots of pupils.',answer:'coat',wrong:['disc','boat','coal','cost']},
 {sentence:'We have walked so far.',answer:'sofa',wrong:['walk','soda','soft','fare'],level:'challenge'},
];
/** Where a word runs across two neighbouring words: [index of the first word, letters in it], or null. */
export function spanOf(sentence:string,word:string):[number,number]|null{
 const ws=sentence.split(/\s+/).map(letters).filter(Boolean);
 for(let i=0;i+1<ws.length;i++)for(let k=1;k<word.length;k++){const tail=word.slice(0,k),head=word.slice(k);if(ws[i].endsWith(tail)&&ws[i+1].startsWith(head))return [i,k];}
 return null;
}
function hiddenDraft(h:Hidden):Draft|null{
 const span=spanOf(h.sentence,h.answer);if(!span)return null;
 const ws=h.sentence.split(/\s+/).map(letters).filter(Boolean),raw=h.sentence.split(/\s+/).map(w=>w.replace(/[^A-Za-z]/g,'')).filter(Boolean),[i,k]=span,a=raw[i],b=raw[i+1];
 const shown=`${a.slice(0,a.length-k)}${a.slice(-k).toUpperCase()} ${b.slice(0,h.answer.length-k).toUpperCase()}${b.slice(h.answer.length-k)}`;
 const inside=h.wrong.filter(w=>ws.some(x=>x.includes(w))),absent=h.wrong.filter(w=>!inside.includes(w));
 return {prompt:'A four-letter word is hidden across the end of one word and the start of the next. Select the hidden word.',stimulus:h.sentence,answer:h.answer,wrong:h.wrong,rewardGroup:h.level,
  explanation:explain(`**${cap(h.answer)}** is hidden across "${a} ${b}": ${shown}.`,...inside.map(w=>`- ${cap(w)} is inside one word (${ws.find(x=>x.includes(w))}), so it does not count.`),absent.length?`- ${cap(list(absent))} ${absent.length>1?'are':'is'} not hidden anywhere in the sentence.`:'')};
}

// ── Missing three-letter words: three letters (a word) are missing from the word in capitals ──
type Missing={sentence:string;full:string;answer:string;wrong:string[];level?:Level};
export const MISSING:Missing[]=[
 {sentence:'The children raced across the PGROUND.',full:'PLAYGROUND',answer:'LAY',wrong:['RAY','DAY','LAP','LOW'],level:'quick'},
 {sentence:'Hang your school coat in the WARDE.',full:'WARDROBE',answer:'ROB',wrong:['RED','WAR','ROD','ROW']},
 {sentence:'The CHEN smelt of freshly baked bread.',full:'KITCHEN',answer:'KIT',wrong:['CAT','HEN','SIT','KID']},
 {sentence:'Please put the milk back in the FGE.',full:'FRIDGE',answer:'RID',wrong:['RED','RIG','ROD','FIG'],level:'quick'},
 {sentence:'Would you like a glass of OGE juice?',full:'ORANGE',answer:'RAN',wrong:['RUN','RAG','RAY','RED'],level:'quick'},
 {sentence:'Jaya picked a ripe STBERRY from the plant.',full:'STRAWBERRY',answer:'RAW',wrong:['RAY','ROW','RAT','TAR']},
 {sentence:'Leo packed a cheese SWICH for the school trip.',full:'SANDWICH',answer:'AND',wrong:['END','AID','ANT','WIT']},
 {sentence:'The DRN in the story guarded a pile of gold.',full:'DRAGON',answer:'AGO',wrong:['RAG','AGE','EGG','GOT'],level:'challenge'},
 {sentence:'The train stopped at the PLATM.',full:'PLATFORM',answer:'FOR',wrong:['FUR','FIR','FAR','FOE']},
 {sentence:'A white FHER floated down from the nest.',full:'FEATHER',answer:'EAT',wrong:['HER','OAT','TEA','SAT'],level:'challenge'},
 {sentence:'Daisy picked a FLR from the garden.',full:'FLOWER',answer:'OWE',wrong:['LOW','OUR','OWL','AWE'],level:'challenge'},
 {sentence:'Her PAING won first prize in the art show.',full:'PAINTING',answer:'TIN',wrong:['TAN','TEN','PIN','INK']},
 {sentence:'A TERFLY landed gently on the flower.',full:'BUTTERFLY',answer:'BUT',wrong:['BAT','BUG','PUT','CUT']},
 {sentence:'The SECROW kept the birds away from the corn.',full:'SCARECROW',answer:'CAR',wrong:['ARE','ROW','CAT','CAN'],level:'challenge'},
 {sentence:'We built a SMAN with a carrot for its nose.',full:'SNOWMAN',answer:'NOW',wrong:['OWN','SEW','MAN','NOT']},
 {sentence:'The plates are kept in the CUPBD.',full:'CUPBOARD',answer:'OAR',wrong:['BOA','OUR','EAR','OAK']},
 {sentence:'The boat sailed to a tiny ISL.',full:'ISLAND',answer:'AND',wrong:['ANT','END','ALL','ASK']},
 {sentence:'The VILL had one small shop and a pond.',full:'VILLAGE',answer:'AGE',wrong:['ILL','LAG','AGO','AXE']},
 {sentence:'Each PNT was invited to the school concert.',full:'PARENT',answer:'ARE',wrong:['ANT','AIR','EAR','OAR']},
 {sentence:'Grandma lives in a pretty TAGE by the river.',full:'COTTAGE',answer:'COT',wrong:['CAT','COW','COD','CUT']},
];
export const shownOf=(sentence:string)=>sentence.match(/\b[A-Z]{2,}\b/)![0];
function missingDraft(m:Missing):Draft|null{
 const shown=shownOf(m.sentence),at=[...Array(shown.length+1).keys()].find(j=>shown.slice(0,j)+m.answer+shown.slice(j)===m.full);if(at===undefined)return null;
 const pieces=[shown.slice(0,at),m.answer,shown.slice(at)].filter(Boolean),inWord=m.wrong.filter(w=>m.full.includes(w));
 return {prompt:'Three letters that make a word are missing from the word in capitals. Select the three-letter word that completes it so the sentence makes sense.',stimulus:m.sentence,answer:m.answer,wrong:m.wrong,rewardGroup:m.level,
  explanation:explain(`**${m.answer}** completes the word: ${pieces.join(' + ')} = **${m.full}**.`,...inWord.map(w=>`- ${w} is also in ${m.full}, but it does not fill the gap in ${shown}.`),`- The other options do not make a real word.`)};
}

// ── Compound words: one word from each group joined together ──
type Compound={g1:string[];g2:string[];a:[string,string];level?:Level};
export const COMPOUND_SETS:Compound[]=[
 {g1:['rain','hail','wind'],g2:['bow','cap','bell'],a:['rain','bow'],level:'quick'},
 {g1:['star','planet','comet'],g2:['fish','frog','crab'],a:['star','fish'],level:'quick'},
 {g1:['hedge','fence','wall'],g2:['hog','pig','cow'],a:['hedge','hog'],level:'quick'},
 {g1:['cup','mug','jug'],g2:['board','plank','table'],a:['cup','board'],level:'quick'},
 {g1:['key','lock','door'],g2:['hole','gap','crack'],a:['key','hole'],level:'quick'},
 {g1:['car','bus','van'],g2:['pet','rest','shed'],a:['car','pet']},
 {g1:['not','but','yet'],g2:['ice','snow','rain'],a:['not','ice']},
 {g1:['pig','cow','hen'],g2:['let','hop','sit'],a:['pig','let']},
 {g1:['pump','beet','leek'],g2:['kin','friend','pal'],a:['pump','kin']},
 {g1:['sea','lake','pond'],g2:['son','daughter','child'],a:['sea','son']},
 {g1:['cab','taxi','coach'],g2:['in','on','at'],a:['cab','in']},
 {g1:['but','and','or'],g2:['ton','kilo','gram'],a:['but','ton']},
 {g1:['mush','pulp','mash'],g2:['room','hall','house'],a:['mush','room']},
 {g1:['for','from','with'],g2:['tune','song','note'],a:['for','tune']},
 {g1:['hid','ran','sat'],g2:['den','cave','nest'],a:['hid','den']},
 {g1:['man','boy','girl'],g2:['age','year','week'],a:['man','age'],level:'challenge'},
 {g1:['bud','leaf','root'],g2:['get','give','take'],a:['bud','get'],level:'challenge'},
 {g1:['leg','arm','hip'],g2:['end','start','stop'],a:['leg','end'],level:'challenge'},
 {g1:['rat','mouse','mole'],g2:['her','him','them'],a:['rat','her'],level:'challenge'},
 {g1:['bar','shop','store'],g2:['gain','loss','win'],a:['bar','gain'],level:'challenge'},
];
function compoundDraft(c:Compound):Draft{
 const others=c.g1.flatMap(x=>c.g2.map(y=>x+y)).filter(w=>w!==c.a[0]+c.a[1]);
 const g1=mixed(c.g1),g2=mixed(c.g2);
 return {prompt:'Select the **two** words, one from each group, that make a new word when they are joined. The word from the first group comes first.',stimulus:`${g1.join(', ')} | ${g2.join(', ')}`,answer:[c.a[0],c.a[1]],options:[...g1,...g2],rewardGroup:c.level,
  explanation:explain(`**${cap(c.a[0])}** + **${c.a[1]}** = **${c.a[0]+c.a[1]}**.`,`- No other pair makes a real word: for example, ${others[1]} and ${others[others.length-2]} are not words.`)};
}

// ── Move a letter from the first word to the second ──
/** extra: a wrong option taken from the second word, when the first word has too few different letters. */
type Move={w1:string;w2:string;letter:string;left:string;made:string;note?:string;extra?:string;level?:Level};
export const MOVES:Move[]=[
 {w1:'FAIR',w2:'PLAN',letter:'I',left:'FAR',made:'PLAIN',note:'Taking out F leaves AIR and taking out A leaves FIR, but neither F nor A can go into PLAN to make a word.'},
 {w1:'CHASE',w2:'TICK',letter:'H',left:'CASE',made:'THICK',level:'quick'},
 {w1:'BLEAK',w2:'RISK',letter:'B',left:'LEAK',made:'BRISK',note:'Taking out L leaves BEAK, but L cannot go into RISK to make a word.'},
 {w1:'STAND',w2:'HOSE',letter:'T',left:'SAND',made:'THOSE'},
 {w1:'CROWN',w2:'MOTH',letter:'N',left:'CROW',made:'MONTH'},
 {w1:'PINE',w2:'FAST',letter:'E',left:'PIN',made:'FEAST',note:'Taking out N leaves PIE, but N cannot go into FAST to make a word.'},
 {w1:'YEAST',w2:'BUSH',letter:'Y',left:'EAST',made:'BUSHY'},
 {w1:'CLIP',w2:'RAFT',letter:'C',left:'LIP',made:'CRAFT',level:'quick'},
 {w1:'GRUB',w2:'CLAN',letter:'G',left:'RUB',made:'CLANG'},
 {w1:'FREE',w2:'EACH',letter:'R',left:'FEE',made:'REACH',extra:'H',level:'quick'},
 {w1:'HOME',w2:'ARCH',letter:'M',left:'HOE',made:'MARCH'},
 {w1:'COLD',w2:'PAN',letter:'L',left:'COD',made:'PLAN',note:'Taking out C leaves OLD, but C cannot go into PAN to make a word.',level:'challenge'},
 {w1:'WALL',w2:'SEAT',letter:'W',left:'ALL',made:'SWEAT',extra:'T',level:'quick'},
 {w1:'DATED',w2:'RAIN',letter:'D',left:'DATE',made:'DRAIN'},
 {w1:'CHAIN',w2:'HERD',letter:'A',left:'CHIN',made:'HEARD',level:'challenge'},
 {w1:'SHOWN',w2:'BROW',letter:'N',left:'SHOW',made:'BROWN',note:'Taking out H leaves SOWN, but H cannot go into BROW to make a word.',level:'challenge'},
 {w1:'FLOW',w2:'LOCK',letter:'F',left:'LOW',made:'FLOCK'},
 {w1:'OPEN',w2:'CANE',letter:'O',left:'PEN',made:'CANOE',level:'challenge'},
 {w1:'PLAY',w2:'HOLY',letter:'L',left:'PAY',made:'HOLLY',note:'Taking out P leaves LAY and taking out A leaves PLY, but neither P nor A can go into HOLY to make a word.',level:'challenge'},
 {w1:'DOZE',w2:'ANY',letter:'Z',left:'DOE',made:'ZANY'},
];
function moveDraft(m:Move):Draft{
 const wrong=[...new Set(m.w1.split(''))].filter(c=>c!==m.letter).concat(m.extra?[m.extra]:[]);
 return {prompt:'Move one letter from the first word into the second word to make two new words. The other letters stay in the same order. Which letter moves?',stimulus:`${m.w1}  ·  ${m.w2}`,answer:m.letter,wrong,rewardGroup:m.level,
  explanation:explain(`Take **${m.letter}** out of ${m.w1} to leave **${m.left}**, and put it into ${m.w2} to make **${m.made}**.`,m.note?'- '+m.note:`- No other letter can leave a word behind and also make a word in ${m.w2}.`,m.extra?`- ${m.extra} is in ${m.w2}, not ${m.w1}, so it cannot be the letter that moves.`:'')};
}

// ── One letter ends the first word and starts the second, in both pairs ──
type Shared={letter:string;p1:[string,string];p2:[string,string];wrong:string[];note:string;level?:Level};
export const SHARED:Shared[]=[
 {letter:'B',p1:['KNO','EEN'],p2:['COM','EET'],wrong:['T','M','W','D'],note:'T works in the first pair (KNOT, TEEN) but not in the second.',level:'quick'},
 {letter:'D',p1:['SEE','UET'],p2:['WOR','OWN'],wrong:['M','S','T','K'],note:'M works in the second pair (WORM, MOWN) but not in the first.'},
 {letter:'E',p1:['ROP','ARN'],p2:['SLAT','IGHT'],wrong:['S','Y','W','H'],note:'S works in the second pair (SLATS, SIGHT) but not in the first.'},
 {letter:'F',p1:['CAL','EELS'],p2:['DEA','ULLY'],wrong:['D','L','M','T'],note:'D works in the second pair (DEAD, DULLY) but not in the first.'},
 {letter:'G',p1:['SON','IFTS'],p2:['FLIN','EAR'],wrong:['S','T','K','N'],note:'S works in the first pair (SONS, SIFTS) and T works in the second (FLINT, TEAR), but neither works in both.',level:'quick'},
 {letter:'H',p1:['SIG','EAP'],p2:['FIS','OPS'],wrong:['N','T','C','P'],note:'T works in the second pair (FIST, TOPS) but not in the first.'},
 {letter:'K',p1:['WEA','EEPS'],p2:['THIN','ITES'],wrong:['S','G','N','R'],note:'S works in the second pair (THINS, SITES) but not in the first.'},
 {letter:'L',p1:['GUL','ONG'],p2:['IDEA','OWS'],wrong:['P','S','F','T'],note:'P works in the first pair (GULP, PONG) and S works in the second (IDEAS, SOWS), but neither works in both.'},
 {letter:'M',p1:['CHAR','OST'],p2:['SKI','ALL'],wrong:['T','P','D','S'],note:'T works in the second pair (SKIT, TALL) but not in the first.'},
 {letter:'N',p1:['GIVE','OON'],p2:['BAR','OOK'],wrong:['S','B','K','T'],note:'S works in the first pair (GIVES, SOON) and B works in the second (BARB, BOOK), but neither works in both.',level:'challenge'},
 {letter:'P',p1:['WEE','IER'],p2:['RAM','ETS'],wrong:['S','K','T','D'],note:'S works in the second pair (RAMS, SETS) but not in the first.'},
 {letter:'R',p1:['NEA','ESTS'],p2:['SOLA','UBS'],wrong:['T','P','N','S'],note:'T works in the first pair (NEAT, TESTS) but not in the second.'},
 {letter:'T',p1:['LAS','INT'],p2:['MIS','ABS'],wrong:['H','C','S','K'],note:'H works in the first pair (LASH, HINT) but not in the second.',level:'quick'},
 {letter:'W',p1:['DRE','ENT'],p2:['FLA','ART'],wrong:['P','T','G','K'],note:'P and T work in the second pair (FLAP, PART and FLAT, TART) but not in the first.',level:'challenge'},
 {letter:'Y',p1:['HARD','OURS'],p2:['SCAR','IELD'],wrong:['F','S','E','T'],note:'F works in the second pair (SCARF, FIELD) but not in the first.'},
 {letter:'K',p1:['SAN','ITTY'],p2:['PLAN','ICKS'],wrong:['D','T','S','G'],note:'D works in the first pair (SAND, DITTY) and T works in the second (PLANT, TICKS), but neither works in both.',level:'challenge'},
 {letter:'T',p1:['DUE','EEN'],p2:['TUF','ENS'],wrong:['S','F','L','D'],note:'S works in the first pair (DUES, SEEN) but not in the second.'},
 {letter:'D',p1:['BLIN','RONE'],p2:['JOKE','OES'],wrong:['R','K','S','T'],note:'K makes BLINK and R makes JOKER, but neither letter makes words in both pairs.'},
 {letter:'W',p1:['THRO','INGS'],p2:['KNO','EEK'],wrong:['B','P','N','T'],note:'B makes THROB, but it does not make a word in the second pair.'},
 {letter:'Y',p1:['BUS','ARNS'],p2:['ALL','EARS'],wrong:['T','S','H','E'],note:'T makes BUST, but it does not work in the second pair.',level:'challenge'},
];
function sharedDraft(s:Shared):Draft{
 const L=s.letter,[a,b]=s.p1,[c,d]=s.p2;
 return {prompt:'Find the one letter that will end the first word and start the second word in both pairs.',stimulus:`${a} ( ? ) ${b}\n${c} ( ? ) ${d}`,answer:L,wrong:s.wrong,rewardGroup:s.level,
  explanation:explain(`**${L}** makes ${a+L} and ${L+b}, and ${c+L} and ${L+d}.`,'- '+s.note)};
}

// ── Anagrams with a meaning clue or a sentence ──
type Anagram={caps:string;answer:string;clue?:string;sentence?:string;sameLetters:string[];other:string[];level?:Level};
export const ANAGRAMS:Anagram[]=[
 {caps:'DANGER',clue:'a place where flowers and vegetables are grown',answer:'GARDEN',sameLetters:['GANDER','RANGED'],other:['BORDER','MEADOW']},
 {caps:'BRUSH',clue:'a small bush',answer:'SHRUB',sameLetters:[],other:['SHRUG','BLUSH','HEDGE','TWIGS'],level:'quick'},
 {caps:'THORN',clue:'one of the four main points of a compass',answer:'NORTH',sameLetters:[],other:['SOUTH','TORCH','HORNS','WORTH'],level:'quick'},
 {caps:'LEMON',clue:'a large, juicy fruit that grows on the ground',answer:'MELON',sameLetters:[],other:['MANGO','GRAPE','MONEY','LEMUR']},
 {caps:'SMILE',clue:'a thick, wet and slippery substance',answer:'SLIME',sameLetters:['MILES','LIMES'],other:['SLICE','SMELL']},
 {caps:'WOLF',clue:'to move along steadily, like a river',answer:'FLOW',sameLetters:['FOWL'],other:['GLOW','SLOW','FLEW']},
 {caps:'STUDY',clue:'covered in fine, dry dirt',answer:'DUSTY',sameLetters:[],other:['DIRTY','MUDDY','DUSKY','STUCK']},
 {caps:'NIGHT',clue:'an object',answer:'THING',sameLetters:[],other:['THINK','TIGHT','ITEMS','EIGHT']},
 {caps:'FINDER',clue:'someone you like and enjoy spending time with',answer:'FRIEND',sameLetters:[],other:['FRINGE','FRIDGE','BUDDY','FINGER'],level:'challenge'},
 {caps:'MASTER',clue:'a small river',answer:'STREAM',sameLetters:[],other:['BROOK','SCREAM','STRAIN','CREEK'],level:'challenge'},
 {caps:'DGIFER',sentence:'Please put the milk back in the DGIFER.',answer:'FRIDGE',sameLetters:[],other:['FREEZER','FRINGE','BRIDGE','CUPBOARD'],level:'quick'},
 {caps:'NOCEA',sentence:'The ship sailed across the wide NOCEA.',answer:'OCEAN',sameLetters:['CANOE'],other:['CANAL','WATER','BEACH']},
 {caps:'SEROH',sentence:'The farmer led the SEROH into the stable.',answer:'HORSE',sameLetters:['SHORE'],other:['PONY','HERON','HOUSE']},
 {caps:'TLEKTE',sentence:'Please fill the TLEKTE with water.',answer:'KETTLE',sameLetters:[],other:['BOTTLE','TEAPOT','KITTEN','LETTER']},
 {caps:'TOCA',sentence:'Leo put on his boots and his TOCA before going out in the rain.',answer:'COAT',sameLetters:['TACO'],other:['CAPE','COST','SCARF']},
 {caps:'RADBO',sentence:'Our teacher wrote the date on the RADBO.',answer:'BOARD',sameLetters:['BROAD'],other:['ROAD','PAPER','BOOK']},
 {caps:'FALO',sentence:'The baker took a warm FALO of bread out of the oven.',answer:'LOAF',sameLetters:['FOAL'],other:['ROLL','SLICE','FLOUR']},
 {caps:'SLAPM',sentence:'Tall SLAPM swayed in the warm breeze by the beach.',answer:'PALMS',sameLetters:['LAMPS'],other:['PINES','PLUMS','MAPLE'],level:'challenge'},
 {caps:'DANW',sentence:'The wizard waved her DANW and the door creaked open.',answer:'WAND',sameLetters:['DAWN'],other:['HAND','STAFF','CLOAK']},
 {caps:'DROWS',sentence:'The hero raised her DROWS to defend the manor.',answer:'SWORD',sameLetters:['WORDS'],other:['SHIELD','STAFF','SWORE']},
];
function anagramDraft(a:Anagram):Draft{
 const wrong=[...a.sameLetters,...a.other],fits=a.clue?`, which means ${a.clue}`:', which completes the sentence';
 return {prompt:a.clue?'Rearrange the letters in capitals to make a new word that matches the clue.':'Rearrange the letters in capitals to make a word that completes the sentence sensibly.',
  stimulus:a.clue?`${a.caps} (${a.clue})`:a.sentence!,answer:a.answer,wrong,rewardGroup:a.level,
  explanation:explain(`The letters of ${a.caps} can be rearranged to spell **${a.answer}**${fits}.`,a.sameLetters.length?`- ${list(a.sameLetters)} ${a.sameLetters.length>1?'use':'uses'} the same letters, but ${a.sameLetters.length>1?'they do':'it does'} not ${a.clue?'match the clue':'make sense in the sentence'}.`:'',`- ${list(a.other.filter(w=>w.length))} ${a.other.length>1?'do':'does'} not use exactly the letters of ${a.caps}.`)};
}

// ── Word ladders: change one letter at a time ──
type Ladder={chain:string[];answer:string;wrong:string[];note?:string;level?:Level};
export const LADDERS:Ladder[]=[
 {chain:['REST','?','RUSH'],answer:'RUST',wrong:['BEST','RASH','RENT','BUSH'],level:'quick'},
 {chain:['FALL','?','FILM'],answer:'FILL',wrong:['BALL','FIRM','FELL','FILE'],level:'quick'},
 {chain:['BOOM','?','ROOF'],answer:'ROOM',wrong:['BOOK','HOOF','BOOT','ROOK'],level:'quick'},
 {chain:['SAND','?','WANT'],answer:'WAND',wrong:['HAND','WENT','WART','SANE']},
 {chain:['DASH','?','WASP'],answer:'WASH',wrong:['CASH','DISH','WISP','GASP']},
 {chain:['FINE','?','HIRE'],answer:'FIRE',wrong:['MINE','HIDE','FIVE','WIRE']},
 {chain:['FREE','?','TREK'],answer:'TREE',wrong:['FLEE','TRUE','FRET','TRAM']},
 {chain:['HAIR','?','MAIL'],answer:'HAIL',wrong:['PAIR','MAID','RAIL','HALL']},
 {chain:['STEM','?','STOP'],answer:'STEP',wrong:['STEW','SHOP','SEEM','SPOT']},
 {chain:['COIL','?','GOAL'],answer:'COAL',wrong:['BOIL','COOL','GOAT','FOAL']},
 {chain:['GULF','?','WOLF'],answer:'GOLF',wrong:['GULP','WOOF','GOLD','GULL']},
 {chain:['CREW','?','GREY'],answer:'GREW',wrong:['CROW','DREW','PREY','CHEW']},
 {chain:['CHIN','?','TWIN'],answer:'THIN',wrong:['CHIP','SHIN','TWIG','THEN']},
 {chain:['FOND','?','GOOD'],answer:'FOOD',wrong:['BOND','FOLD','GOLD','HOOD']},
 {chain:['BEAR','?','?','MOAN'],answer:'BEAN, MEAN',wrong:['BEAT, MEAT','BEAN, BEAM','DEAR, DEAN','BEAD, MEAD'],note:'MEAT, DEAN and MEAD are each two letters away from MOAN, and BEAM is three letters away.',level:'challenge'},
 {chain:['WIFE','?','?','MINT'],answer:'WINE, MINE',wrong:['WINE, WINK','LIFE, LINE','WIPE, MINE','WIRE, MIRE'],note:'WINK, LINE and MIRE are each two letters away from MINT, and WIPE to MINE changes two letters at once.',level:'challenge'},
 {chain:['SLIP','?','?','THIN'],answer:'SHIP, SHIN',wrong:['SKIP, SKIN','SHIP, CHIP','SLIM, SWIM','SHOP, SHOT'],note:'SKIN and CHIP are each two letters away from THIN, SWIM is three letters away, and SLIP to SHOP changes two letters at once.',level:'challenge'},
 {chain:['GOAL','?','?','FORM'],answer:'FOAL, FOAM',wrong:['FOAL, FOOL','GOAT, MOAT','COAL, FOAL','GOLD, FOLD'],note:'FOOL, MOAT, FOAL and FOLD are each two or more letters away from FORM.',level:'challenge'},
 {chain:['WOKE','?','?','HORN'],answer:'WORE, WORN',wrong:['POKE, PORK','WORE, WORD','MORE, MORN','HOLE, HONE'],note:'PORK and WORD are each two letters away from HORN, and MORE and HOLE are each two letters away from WOKE.',level:'challenge'},
 {chain:['CALM','?','?','TILL'],answer:'CALL, TALL',wrong:['CALF, HALF','CALL, CELL','PALM, PALL','CALL, HALL'],note:'HALF, CELL, PALL and HALL are each two or more letters away from TILL.',level:'challenge'},
];
function ladderDraft(l:Ladder):Draft{
 const full=l.chain.slice();const fill=l.answer.split(', ');let k=0;for(let i=0;i<full.length;i++)if(full[i]==='?')full[i]=fill[k++];
 const steps=full.slice(1).map((w,i)=>{const prev=full[i],at=[...w].findIndex((ch,j)=>ch!==prev[j]);return `${prev} → ${w} (${prev[at]} becomes ${w[at]})`;});
 const two=fill.length>1;
 return {prompt:two?'Change one letter at a time to turn the first word into the last word. Each step must be a real word. Which two words go in the gaps, in order?':'Change one letter at a time to turn the first word into the last word. Each step must be a real word. Which word goes in the gap?',
  stimulus:l.chain.join(' → '),answer:l.answer,wrong:l.wrong,rewardGroup:l.level,
  explanation:explain(steps.map(s=>'- '+s).join('\n'),two?'- '+l.note:`- Changing the letters in the other order would not make a real word, and the other options are not one letter away from both ${full[0]} and ${full[2]}.`)};
}

// ── Helpsheets ──
const hiddenSheet:Helpsheet={intro:'A four-letter word is hidden in the sentence. It starts near the end of one word and finishes at the start of the next word.',
 steps:['Look at each gap between two neighbouring words.','Join the last one, two or three letters of the first word to the first letters of the next word, so you have four letters.','Say the four letters and check whether they make a word.','Check the options: a word that sits inside just one word does not count.'],
 example:{title:'Example: "The robin kept singing."',lines:['The gap in "the robin" gives THER, HERO and EROB.','HERO is a real word: tHE ROBin.','The other gaps (robin kept, kept singing) give no other words, so the hidden word is HERO.']},
 tips:['Keep the letters in order; do not skip or swap any.','A whole word from the sentence is not a hidden word.']};
const missingSheet:Helpsheet={intro:'Three letters in a row are missing from the word in capitals. The missing letters spell a three-letter word.',
 steps:['Read the sentence and work out what the word in capitals should be.','Write out the full word.','Find the three letters that are missing, in order.','Check that they make a word and that the sentence makes sense.'],
 example:{title:'Example: "Put the apples in the BET."',lines:['Apples go in a BASKET.','BASKET = B + ASK + ET, so the missing word is ASK.','ALL would make BALLET, but that does not make sense in the sentence.']},
 tips:['The missing letters are always next to each other.','A three-letter word can appear in the long word and still be wrong for the gap.']};
const compoundSheet:Helpsheet={intro:'Join one word from the first group to one word from the second group to make a new word. The word from the first group always comes first.',
 steps:['Take the first word in group one.','Add each word from group two to the end of it and say the result.','Repeat with the other words in group one.','Choose the only pair that makes a real word.'],
 example:{title:'Example: pop, fizz, cola | corn, wheat, rice',lines:['popcorn ✓, popwheat ✗, poprice ✗','fizzcorn, fizzwheat, fizzrice, colacorn … are not words.','So the answer is pop + corn = popcorn.']},
 tips:['The new word does not have to mean anything to do with the two small words (car + pet = carpet).','Say the joined word out loud: it may sound different from the two small words.']};
const moveSheet:Helpsheet={intro:'Take one letter out of the first word and put it anywhere in the second word. Both new words must be real words, and the other letters stay in the same order.',
 steps:['Try removing each letter of the first word in turn. Which ones still leave a word?','For each of those letters, try adding it at every place in the second word.','The answer is the letter that makes two real words.'],
 example:{title:'Example: BREAD · FIST',lines:['Take out B: READ is a word, but B cannot go into FIST to make a word.','Take out R: BEAD is a word, and R goes into FIST to make FIRST.','So R is the letter that moves.']},
 tips:['Check both words every time: a letter may leave a word behind but not fit the second word.','The letter can go at the start, in the middle or at the end of the second word.']};
const sharedSheet:Helpsheet={intro:'One letter finishes the first word and starts the second word, and the same letter must work in both pairs.',
 steps:['Take the first pair and list the letters that finish the first word.','Keep only the letters that also start a word with the second part.','Test those letters on the second pair.','The answer works for all four words.'],
 example:{title:'Example: DRA ( ? ) EAR and STE ( ? ) IND',lines:['First pair: several letters work, such as B (DRAB, BEAR), G (DRAG, GEAR) and W (DRAW, WEAR).','Second pair: M (STEM, MIND) and W (STEW, WIND) work.','Only W works in both pairs.']},
 tips:['Check every word, not just the first pair.','Say each word out loud to hear whether it is real.']};
const anagramSheet:Helpsheet={intro:'An anagram uses exactly the same letters as another word, in a different order. The clue or sentence tells you which new word is wanted.',
 steps:['Count the letters in capitals.','Think about what the clue or sentence needs.','Try options that have exactly the same letters, no more and no fewer.','Choose the one that also matches the meaning.'],
 example:{title:'Example: RATS (twinkles in the night sky)',lines:['RATS has the letters A, R, S and T.','ARTS, TSAR and STAR use those letters.','Only STAR twinkles in the night sky.']},
 tips:['Cross off each letter as you use it.','A word that fits the meaning but has different letters is a trap.']};
const ladderSheet:Helpsheet={intro:'Change the first word into the last word one letter at a time. Every step must be a real word.',
 steps:['Compare the first and last words and find which letters are different.','Change one of those letters and check that you have made a real word.','If not, change a different letter first.','Keep going until you reach the last word.'],
 example:{title:'Example: PORT → ? → POLE',lines:['PORT and POLE differ in the third and fourth letters.','Change the R to L first: POLT is not a word.','Change the T to E first: PORE is a word, and PORE → POLE changes R to L. So the gap is PORE.']},
 tips:['Only one letter changes in each step, and the letters never move.','Every word in the ladder has the same number of letters.']};

export const vrWordTopics=[
 fixed(vrTopic('hidden-words',S,'Hidden words',hiddenSheet),drafts(HIDDEN,hiddenDraft)),
 fixed(vrTopic('missing-letters',S,'Missing three-letter words',missingSheet),drafts(MISSING,missingDraft)),
 fixed(vrTopic('compound-words',S,'Compound words',compoundSheet),drafts(COMPOUND_SETS,compoundDraft)),
 fixed(vrTopic('move-a-letter',S,'Move a letter',moveSheet),drafts(MOVES,moveDraft)),
 fixed(vrTopic('shared-letter',S,'Shared letter',sharedSheet),drafts(SHARED,sharedDraft)),
 fixed(vrTopic('anagrams',S,'Anagrams',anagramSheet),drafts(ANAGRAMS,anagramDraft)),
 fixed(vrTopic('word-ladders',S,'Word ladders',ladderSheet),drafts(LADDERS,ladderDraft)),
];
