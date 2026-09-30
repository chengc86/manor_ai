import {build,explain,type Draft,type Helpsheet,type Rng} from './bank-kit';
import type {RewardGroup} from './question-rewards';
import {vrTopic} from './bank-vr-vocab';
import {WORDS4,WORDS5,WORDS6} from './bank-vr-lexicon';
// Verbal reasoning: letter sequences, letter codes, number codes and letter-pair analogies, made by seeded templates.
// Letters never wrap round from Z to A, so every rule can be counted along one alphabet line.

const S='Codes and sequences';
export const ABC='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const ALPHABET=ABC.split('').join(' ');
const L=(n:number)=>ABC[n];
const N=(c:string)=>ABC.indexOf(c);
const ok=(n:number)=>n>=0&&n<26;
const places=(k:number)=>`${k>0?'forward':'back'} ${Math.abs(k)} ${Math.abs(k)===1?'place':'places'}`;
/** Words that templates may use: friendly, everyday words chosen for this bank. */
export const CODE_WORDS=`BOAT BIRD CAKE COIN DESK DRUM DUCK FARM FISH FROG GATE GOLD HILL KITE LAMP LEAF LION MILK MOON NEST PARK POND RAIN RING ROAD ROSE SAND SEED SHIP SNOW SOCK STAR TENT TREE WAVE WIND WOLF BELL BOOK CAMP DOOR FERN GIFT HARP HAWK JUMP KING LAKE MAZE MINT PEAR PLUM RAFT SAIL SOUP TOWN VASE WING YARN
APPLE BEACH BREAD BRICK CHAIR CLOUD CROWN DAISY DREAM EAGLE FEAST FROST GHOST GLOVE GRAPE HONEY HORSE JEWEL KNIFE LEMON MAGIC MAPLE MOUSE OCEAN PAINT PEARL PIANO PLANT QUEEN QUEST RIVER ROBIN SCARF SHELL SPOON STONE STORM SWORD TIGER TOAST TORCH TOWER TRAIN WATER WHALE
CASTLE DRAGON FOREST GARDEN MARBLE PENCIL PLANET RABBIT ROCKET SILVER SPIDER TEAPOT TURTLE WIZARD WINDOW`.split(/\s+/);
/** Words never used as options, even though they are in the word lists. */
export const BANNED=new Set('dead died dies death grave tomb grief evil hate hated hates hell gun guns war wars kill bomb drug drugs drunk sick ugly fat bum bums butt damn poo pee'.split(' '));
const WORDLIST=[...WORDS4,...WORDS5,...WORDS6].map(w=>w.toUpperCase()).filter(w=>!BANNED.has(w.toLowerCase()));
/** Real words of the same length that differ from w in exactly `by` places. */
function nearWords(w:string,by=1){return WORDLIST.filter(x=>x.length===w.length&&x!==w&&[...x].filter((c,i)=>c!==w[i]).length===by);}
/** Takes wrong options in order of preference, skipping repeats, the answer and empty values. */
function pickWrong(answer:string,cands:(string|null|undefined)[],need=4,fill?:()=>string|null):string[]|null{
 const out:string[]=[];for(const c of cands){if(c&&c!==answer&&!out.includes(c))out.push(c);if(out.length===need)return out;}
 for(let t=0;fill&&t<60&&out.length<need;t++){const c=fill();if(c&&c!==answer&&!out.includes(c))out.push(c);}
 return out.length===need?out:null;
}
const sched=<T,>(plan:T[],i:number)=>plan[i%plan.length];
/** Letters a few places either side of n, for padding out wrong options. */
const nearLetters=(n:number)=>[n+3,n-3,n+4,n-4].filter(ok).map(L);
const NL='\n';

// ── Letter sequences ──
type SeqKind='step'|'pair'|'grow'|'alternate'|'gap'|'pairgrow';
const SEQ_PLAN:SeqKind[]=['step','pair','grow','gap','pair','step','alternate','pair','grow','pairgrow','step','gap','pair','alternate','grow','pair','step','pairgrow','gap','alternate'];
const SEQ_LEVEL:Record<SeqKind,RewardGroup>={step:'quick',pair:'standard',grow:'standard',gap:'standard',alternate:'challenge',pairgrow:'challenge'};
function letterSequence(r:Rng,i:number):Draft|null{
 const kind=sched(SEQ_PLAN,i),rewardGroup=SEQ_LEVEL[kind];
 const show=(terms:string[])=>terms.join(', ')+NL+ALPHABET;
 if(kind==='step'||kind==='gap'){
  const k=r.pick([2,3,4,5,-2,-3,-4]),n=5,start=k>0?r.int(0,25-k*n):r.int(-k*n,25);
  const xs=Array.from({length:n+1},(_,j)=>start+j*k);if(!xs.every(ok))return null;
  const at=kind==='step'?n:r.int(1,n-1),ans=L(xs[at]),terms=xs.map((x,j)=>j===at?'?':L(x));
  // Keep the answer away from A and Z, so there are near-miss letters on both sides that are not already in the series.
  if(xs[at]<2||xs[at]>23)return null;
  const cands=kind==='step'?[xs[at]+1,xs[at]-1,xs[at]+k,xs[at]+2,xs[at]-2]:[xs[at]+1,xs[at]-1,xs[at]+2,xs[at]-2,xs[at]+k];
  const wrong=pickWrong(ans,[...cands.filter(ok).map(L),...nearLetters(xs[at])]);if(!wrong)return null;
  return {prompt:kind==='step'?'Which letter comes next in the series?':'Which letter is missing from the series?',stimulus:show(terms),answer:ans,wrong,rewardGroup,
   explanation:explain(`Each letter moves ${places(k)} in the alphabet: ${xs.map(L).join(' → ')}.`,`So the missing letter is **${ans}**.`)};
 }
 if(kind==='grow'){
  const d=r.pick([1,2]),up=r.chance(.7)?1:-1,n=5,steps=Array.from({length:n},(_,j)=>d+j),total=steps.reduce((a,b)=>a+b,0);
  const start=up>0?r.int(0,25-total):r.int(total,25),xs=[start];for(const s of steps)xs.push(xs[xs.length-1]+up*s);if(!xs.every(ok))return null;
  const ans=L(xs[n]),last=xs[n-1],sign=up>0?'+':'−';
  const wrong=pickWrong(ans,[...[last+up*steps[n-2],last+up*(steps[n-1]+1),xs[n]+up*2,xs[n]-up*2].filter(ok).map(L),...nearLetters(xs[n])]);if(!wrong)return null;
  return {prompt:'Which letter comes next in the series?',stimulus:show([...xs.slice(0,n).map(L),'?']),answer:ans,wrong,rewardGroup,
   explanation:explain(`The jumps grow by one each time: ${steps.map(s=>sign+s).join(', ')}.`,`${xs.slice(0,n).map(L).join(' → ')} → **${ans}** (${L(last)} ${sign} ${steps[n-1]}).`,`- Using the last jump again (${sign}${steps[n-2]}) is a common slip.`)};
 }
 if(kind==='alternate'){
  // Two series take turns: the 1st, 3rd, 5th … letters go forward a; the 2nd, 4th, 6th … go back b.
  const a=r.pick([1,2,3]),b=r.pick([1,2,3]),n=7,s1=r.int(0,6),s2=r.int(19,25);
  const xs=Array.from({length:n},(_,j)=>j%2===0?s1+(j/2)*a:s2-((j-1)/2)*b);if(!xs.every(ok))return null;
  const ans=L(xs[n-1]),other=xs[n-2]-b;
  const wrong=pickWrong(ans,[...[other,xs[n-1]+1,xs[n-1]-1,xs[n-1]+a,other+1,xs[n-1]+2,xs[n-1]-2].filter(ok).map(L),...nearLetters(xs[n-1])]);if(!wrong)return null;
  const odd=xs.filter((_,j)=>j%2===0).map(L),even=xs.filter((_,j)=>j%2===1).map(L);
  return {prompt:'Which letter comes next in the series?',stimulus:show([...xs.slice(0,n-1).map(L),'?']),answer:ans,wrong,rewardGroup,
   explanation:explain('Two series take turns.',`- The 1st, 3rd, 5th … letters move ${places(a)}: ${odd.slice(0,-1).join(' → ')} → **${ans}**.`,`- The 2nd, 4th, 6th … letters move ${places(-b)}: ${even.join(' → ')}.`,`The next letter belongs to the first series, so it is **${ans}**.`)};
 }
 // Pairs of letters: each letter of the pair has its own rule.
 const n=4,pair=(x:number,y:number)=>L(x)+L(y),grow=kind==='pairgrow';
 const a=r.pick([1,2,3,-1,-2]);let b=r.pick([1,2,3,-1,-2,-3]);if(!grow&&a===b)b=-b;
 const jumps=grow?[1,2,3,4]:[a,a,a,a],sumA=jumps.reduce((s,x)=>s+x,0);
 const x0=sumA>0?r.int(0,25-sumA):r.int(-sumA,25),y0=b>0?r.int(0,25-b*n):r.int(-b*n,25);
 const xs=[x0];for(const s of jumps)xs.push(xs[xs.length-1]+s);const ys=Array.from({length:n+1},(_,j)=>y0+j*b);
 if(!xs.every(ok)||!ys.every(ok))return null;
 const ans=pair(xs[n],ys[n]),P=(x:number,y:number)=>ok(x)&&ok(y)?pair(x,y):null;
 const wrong=pickWrong(ans,[P(xs[n],ys[n]+1),P(xs[n]-1,ys[n]),P(xs[n],ys[n-1]-b),P(ys[n],xs[n]),grow?P(xs[n-1]+jumps[n-2],ys[n]):null,P(xs[n]+1,ys[n]),P(xs[n],ys[n]-1)]);
 if(!wrong)return null;
 const firstRule=grow?`The first letters jump ${jumps.map(s=>'+'+s).join(', ')}`:`The first letters move ${places(a)} each time`;
 return {prompt:'Which pair of letters comes next in the series?',stimulus:show([...xs.slice(0,n).map((x,j)=>pair(x,ys[j])),'?']),answer:ans,wrong,rewardGroup,
  explanation:explain(`${firstRule}: ${xs.map(L).join(' → ')}.`,`The second letters move ${places(b)} each time: ${ys.map(L).join(' → ')}.`,`So the next pair is **${ans}**.`)};
}

// ── Letter codes: shift and mirror codes ──
type CodeKind='shiftEncode'|'shiftDecode'|'mirrorEncode'|'mirrorDecode'|'stepEncode';
const CODE_PLAN:CodeKind[]=['shiftEncode','shiftDecode','shiftEncode','mirrorEncode','shiftDecode','stepEncode','shiftEncode','mirrorDecode','shiftDecode','shiftEncode','mirrorEncode','stepEncode','shiftDecode','shiftEncode','mirrorDecode','shiftDecode','stepEncode','shiftEncode','mirrorEncode','mirrorDecode'];
const CODE_LEVEL:Record<CodeKind,RewardGroup>={shiftEncode:'standard',shiftDecode:'standard',mirrorEncode:'challenge',mirrorDecode:'challenge',stepEncode:'challenge'};
/** Moves every letter k places (or k(i) places for the i-th letter); '?' marks a letter that would leave the alphabet. */
export const shift=(w:string,k:number|((i:number)=>number))=>[...w].map((c,i)=>{const n=N(c)+(typeof k==='number'?k:k(i));return ok(n)?L(n):'?';}).join('');
export const mirror=(w:string)=>[...w].map(c=>L(25-N(c))).join('');
const pairs=(a:string,b:string)=>[...a].map((c,i)=>`${c} → ${b[i]}`).join(', ');
const sameLetters=(a:string,b:string)=>a.length===b.length&&[...a].sort().join('')===[...b].sort().join('');
function letterCode(r:Rng,i:number):Draft|null{
 const kind=sched(CODE_PLAN,i),rewardGroup=CODE_LEVEL[kind];
 const [w1,w2]=r.sample(CODE_WORDS,2);if(sameLetters(w1,w2))return null;
 let code:(w:string)=>string,rule:string;
 if(kind==='mirrorEncode'||kind==='mirrorDecode'){code=mirror;rule='Each letter swaps with the letter in the same place counting from the other end of the alphabet (A ↔ Z, B ↔ Y, C ↔ X …)';}
 else if(kind==='stepEncode'){const up=r.chance(.6)?1:-1;code=w=>shift(w,j=>up*(j+1));rule=`The first letter moves ${places(up)}, the second ${places(2*up)}, the third ${places(3*up)}, and so on`;}
 else{const k=r.pick([1,2,3,-1,-2]);code=w=>shift(w,k);rule=`Each letter moves ${places(k)} in the alphabet`;}
 const c1=code(w1),c2=code(w2);if(c1.includes('?')||c2.includes('?'))return null;
 const ex=`${w1} → ${c1}`;
 if(kind.endsWith('Encode')){
  const k=N(c2[0])-N(w2[0]),alt=(d:number)=>shift(w2,j=>N(c2[j])-N(w2[j])+d),j=r.int(0,w2.length-1),n=N(c2[j])+(r.chance(.5)?1:-1),slip=ok(n)?c2.slice(0,j)+L(n)+c2.slice(j+1):null,back=[...c2].reverse().join('');
  const cands=kind==='mirrorEncode'?[shift(w2,q=>24-2*N(w2[q])),shift(w2,N(c1[0])-N(w1[0])),back,slip,shift(w2,q=>26-2*N(w2[q]))]
   :kind==='stepEncode'?[shift(w2,k),shift(w2,q=>-(N(c2[q])-N(w2[q]))),alt(1),back,slip]
   :[shift(w2,k+(k>0?1:-1)),shift(w2,-k),alt(k>0?-1:1),back,slip];
  const wrong=pickWrong(c2,cands.filter(x=>x&&!x.includes('?')&&x!==w2));if(!wrong)return null;
  return {prompt:'Crack the code. How is the second word written in the same code?',stimulus:[ex,`${w2} → ?`,ALPHABET].join(NL),answer:c2,wrong,rewardGroup,
   explanation:explain(`${rule}: ${pairs(w1,c1)}.`,`So ${pairs(w2,c2)}, and ${w2} is written **${c2}**.`)};
 }
 const wrong=pickWrong(w2,r.shuffle(nearWords(w2,1)),4,()=>r.pick(nearWords(w2,2))??null);if(!wrong)return null;
 return {prompt:'Crack the code. Which word does the second code stand for?',stimulus:[ex,`? → ${c2}`,ALPHABET].join(NL),answer:w2,wrong,rewardGroup,
  explanation:explain(`${rule}: ${pairs(w1,c1)}.`,`Work backwards from the code: ${pairs(c2,w2)}. The word is **${w2}**.`,`- The other words each differ by a letter or two, so their codes would not be ${c2}.`)};
}

// ── Number codes: words written as numbers ──
type NumKind='alphaEncode'|'alphaDecode'|'sameLetters'|'sameDecode'|'fourWords'|'fourWho';
const NUM_PLAN:NumKind[]=['alphaEncode','sameLetters','fourWords','alphaDecode','sameDecode','fourWho','alphaEncode','sameLetters','fourWords','alphaDecode','sameDecode','fourWho','alphaEncode','sameLetters','fourWords','alphaDecode','sameLetters','fourWho','alphaEncode','sameDecode'];
const NUM_LEVEL:Record<NumKind,RewardGroup>={alphaEncode:'quick',alphaDecode:'standard',sameLetters:'standard',sameDecode:'standard',fourWords:'challenge',fourWho:'challenge'};
/** Groups of words made from the same letters, for "same letters" codes. */
export const ANAGRAM_GROUPS=['STEAM MEATS TEAMS MATES','HEART EARTH','SPOT STOP POTS TOPS POST','LEMON MELON','NIGHT THING','BELOW ELBOW','HORSE SHORE','THORN NORTH','STREAM MASTER','DUSTY STUDY','SOUTH SHOUT','DIARY DAIRY','LEAF FLEA','WOLF FLOW FOWL','SMILE SLIME MILES LIMES','SWORD WORDS','WAND DAWN','LOAF FOAL','PALMS LAMPS','PEACH CHEAP','ANGEL ANGLE','RACE CARE ACRE','DEAR READ DARE','MEAT TEAM TAME MATE','LATE TALE TEAL','LAMP PALM','WARD DRAW','PANS SNAP SPAN NAPS','RING GRIN','SALT LAST SLAT','SHOE HOSE','STAR RATS ARTS','TIME ITEM EMIT','PEAR REAP PARE','SEAT EAST TEAS EATS','LEAST STEAL TALES SLATE'].map(g=>g.split(' '));
/** Digits 1 to 9 only, so a code is written as one number, e.g. 7584. */
const codeOf=(w:string,map:Map<string,number>)=>[...w].map(c=>map.get(c)).join('');
function randomMap(r:Rng,letters:string[]){const digits=r.shuffle([1,2,3,4,5,6,7,8,9]);return new Map(letters.map((c,j)=>[c,digits[j]] as [string,number]));}
/** Every way of giving the codes to different words so that each letter always has the same number (and each number one letter). */
export function fourWordMatchings(words:string[],codes:string[]):Map<string,string>[]{
 const out:Map<string,string>[]=[];
 const tryMatch=(chosen:number[])=>{const map=new Map<string,string>(),back=new Map<string,string>();
  for(let k=0;k<codes.length;k++){const w=words[chosen[k]],c=codes[k].split('');if(c.length!==w.length)return;
   for(let j=0;j<w.length;j++){const a=map.get(w[j]),b=back.get(c[j]);if(a!==undefined&&a!==c[j]||b!==undefined&&b!==w[j])return;map.set(w[j],c[j]);back.set(c[j],w[j]);}}
  out.push(map);};
 const rec=(chosen:number[])=>{if(chosen.length===codes.length){tryMatch(chosen);return;}for(let j=0;j<words.length;j++)if(!chosen.includes(j))rec([...chosen,j]);};
 rec([]);return out;
}
const FOUR_SOURCE=WORDS6.map(w=>w.toUpperCase()).filter(w=>new Set(w).size===6&&!BANNED.has(w.toLowerCase()));
const FOUR_WORDS=WORDS4.map(w=>w.toUpperCase()).filter(w=>new Set(w).size===4&&!BANNED.has(w.toLowerCase())&&!w.endsWith('S'));
function numberCode(r:Rng,i:number):Draft|null{
 const kind=sched(NUM_PLAN,i),rewardGroup=NUM_LEVEL[kind];
 if(kind==='alphaEncode'||kind==='alphaDecode'){
  const w=r.pick(CODE_WORDS.filter(x=>x.length<=5)),code=[...w].map(c=>N(c)+1).join(' ');
  const intro='Each letter is written as its place in the alphabet: A = 1, B = 2, C = 3 and so on.';
  if(kind==='alphaEncode'){
   const j=r.int(0,w.length-1),bump=(d:number)=>[...w].map((c,k)=>k===j?N(c)+1+d:N(c)+1).join(' ');
   const cands=[bump(1),bump(-1),[...w].map(c=>26-N(c)).join(' '),[...w].reverse().map(c=>N(c)+1).join(' '),[...w].map(c=>N(c)).join(' ')];
   const wrong=pickWrong(code,cands.filter(x=>!/(^| )(0|27)( |$)/.test(x)));if(!wrong)return null;
   return {prompt:`${intro} Which code stands for the word below?`,stimulus:w+NL+ALPHABET,answer:code,wrong,rewardGroup,
    explanation:explain([...w].map(c=>`${c} = ${N(c)+1}`).join(', ')+'.',`So ${w} is written **${code}**.`,'- Count carefully: A is 1, not 0.')};
  }
  const wrong=pickWrong(w,r.shuffle(nearWords(w,1)),4,()=>r.pick(nearWords(w,2))??null);if(!wrong)return null;
  return {prompt:`${intro} Which word does the code stand for?`,stimulus:code+NL+ALPHABET,answer:w,wrong,rewardGroup,
   explanation:explain(code.split(' ').map(n=>`${n} = ${L(Number(n)-1)}`).join(', ')+'.',`So the word is **${w}**.`)};
 }
 if(kind==='sameLetters'||kind==='sameDecode'){
  const group=r.pick(ANAGRAM_GROUPS),[a,b]=r.sample(group,2),map=randomMap(r,[...new Set(a)]),ca=codeOf(a,map),cb=codeOf(b,map);
  const values=[...new Set(a)].map(c=>`${c} = ${map.get(c)}`).join(', ');
  if(kind==='sameLetters'){
   const digits=cb.split(''),swap=(x:number,y:number)=>{const d=[...digits];[d[x],d[y]]=[d[y],d[x]];return d.join('');};
   const wrong=pickWrong(cb,[ca,[...digits].reverse().join(''),swap(0,1),swap(1,2),swap(digits.length-2,digits.length-1),swap(0,digits.length-1)]);if(!wrong)return null;
   return {prompt:'The first word is written in a number code. Using the same code, how is the second word written?',stimulus:`${a} = ${ca}${NL}${b} = ?`,answer:cb,wrong,rewardGroup,
    explanation:explain(`From the first word: ${values}.`,`${b} uses the same letters in a different order: ${[...b].map(c=>`${c} = ${map.get(c)}`).join(', ')}.`,`So ${b} is written **${cb}**.`)};
  }
  const wrong=pickWrong(b,[...group.filter(w=>w!==b),...r.shuffle(nearWords(b,1))]);if(!wrong)return null;
  return {prompt:'The first word is written in a number code. Using the same code, which word does the second code stand for?',stimulus:`${a} = ${ca}${NL}? = ${cb}`,answer:b,wrong,rewardGroup,
   explanation:explain(`From the first word: ${values}.`,`Decode ${cb} one digit at a time: ${cb.split('').map((d,j)=>`${d} = ${b[j]}`).join(', ')}.`,`So the word is **${b}**.`)};
 }
 // Four words and three codes, in a different order.
 const src=r.pick(FOUR_SOURCE),set=new Set(src),cands=FOUR_WORDS.filter(w=>[...w].every(c=>set.has(c)));if(cands.length<4)return null;
 const words=r.sample(cands,4),map=randomMap(r,[...new Set(words.join(''))]),codes=words.map(w=>codeOf(w,map));
 const hidden=r.int(0,3),shownCodes=r.shuffle(codes.filter((_,j)=>j!==hidden));
 // The puzzle is fair only if there is exactly one way to match the codes to the words.
 if(fourWordMatchings(words,shownCodes).length!==1)return null;
 const stim=[...words].sort().join(', ')+NL+shownCodes.join(', ');
 const solved=words.filter((_,j)=>j!==hidden).map(w=>`${w} = ${codeOf(w,map)}`),values=[...new Set(words.join(''))].sort().map(c=>`${c} = ${map.get(c)}`).join(', ');
 if(kind==='fourWords'){
  // Every letter of the uncoded word must appear in a coded word, or its number could not be worked out.
  if(![...words[hidden]].every(c=>words.some((w,j)=>j!==hidden&&w.includes(c))))return null;
  const target=words[hidden],ans=codes[hidden],digits=ans.split(''),swap=(x:number,y:number)=>{const d=[...digits];[d[x],d[y]]=[d[y],d[x]];return d.join('');};
  const wrong=pickWrong(ans,[...shownCodes,swap(0,1),swap(2,3),[...digits].reverse().join('')]);if(!wrong)return null;
  return {prompt:`Three of these four words are written in a number code, but the codes are in a different order. What is the code for ${target}?`,stimulus:stim,answer:ans,wrong,rewardGroup,
   explanation:explain('Match each code to a word: a code must fit its word letter by letter, and the same letter always has the same number. Start with letters that repeat or sit in the same place in two words.',`Only one matching works: ${solved.join(', ')}.`,`So ${values}.`,`${target} has no code shown, but its letters give **${ans}**.`)};
 }
 const askCode=shownCodes[r.int(0,2)],askWord=words.find(w=>codeOf(w,map)===askCode)!;
 return {prompt:'Three of these four words are written in a number code, but the codes are in a different order. Which word has the code shown on the last line?',stimulus:`${stim}${NL}${askCode} = ?`,answer:askWord,wrong:words.filter(w=>w!==askWord),rewardGroup,
  explanation:explain('Match each code to a word: a code must fit its word letter by letter, and the same letter always has the same number. Start with letters that repeat or sit in the same place in two words.',`Only one matching works: ${solved.join(', ')}.`,`So ${askCode} is **${askWord}**.`)};
}

// ── Letter-pair analogies ──
// Only rules that move each letter a fixed number of places are used. A swap or mirror rule would be ambiguous: moving the
// first letter one amount and the second letter another amount always fits a single example too.
type PairKind='same'|'diff'|'inward'|'mirrorPairs'|'bigJump';
const PAIR_PLAN:PairKind[]=['same','diff','inward','mirrorPairs','diff','same','bigJump','inward','diff','mirrorPairs','same','diff','bigJump','inward','mirrorPairs','same','diff','bigJump','inward','diff'];
const PAIR_LEVEL:Record<PairKind,RewardGroup>={same:'quick',diff:'standard',inward:'standard',mirrorPairs:'challenge',bigJump:'challenge'};
function letterAnalogy(r:Rng,i:number):Draft|null{
 const kind=sched(PAIR_PLAN,i),rewardGroup=PAIR_LEVEL[kind];
 let a:number,b:number;
 if(kind==='same'){a=b=r.pick([1,2,3,4,-1,-2,-3]);}
 else if(kind==='diff'){a=r.pick([1,2,3,-1,-2]);b=r.pick([1,2,3,4,-1,-2,-3].filter(v=>v!==a));}
 else if(kind==='inward'||kind==='mirrorPairs'){a=r.pick([1,2,3,4]);b=-a;if(r.chance(.4)){a=-a;b=-b;}}
 else{a=r.pick([5,6,7,8])*(r.chance(.5)?1:-1);b=r.pick([5,6,7,8].filter(v=>v!==Math.abs(a)))*(r.chance(.5)?1:-1);}
 const x1=r.int(0,25),x2=r.int(0,25),y1=kind==='mirrorPairs'?25-x1:r.int(0,25),y2=kind==='mirrorPairs'?25-x2:r.int(0,25);
 if(x1===y1||x2===y2||x1===x2&&y1===y2)return null;
 const a1=x1+a,b1=y1+b,a2=x2+a,b2=y2+b;if(![a1,b1,a2,b2].every(ok))return null;
 // An example that also looks like a swap (SW → WS) or a mirror (CX → XC) could be read two ways, so it is not used.
 if(a1===y1&&b1===x1||a1===25-x1&&b1===25-y1)return null;
 const P=(x:number,y:number)=>ok(x)&&ok(y)?L(x)+L(y):null,ans=P(a2,b2)!;
 const crossed=P(x2+b,y2+a),reversed=P(b2,a2),bothFirst=P(x2+a,y2+a),up1=P(a2+1,b2),down2=P(a2,b2-1),down1=P(a2-1,b2),up2=P(a2,b2+1),back=P(x2-a,y2-b);
 const order:Record<PairKind,(string|null)[]>={same:[up1,down2,reversed,back,down1,up2],diff:[crossed,bothFirst,up1,down2,reversed,down1,up2],inward:[crossed,bothFirst,up1,down2,reversed,down1,up2],mirrorPairs:[crossed,bothFirst,up1,down2,reversed,up2],bigJump:[crossed,up1,down2,down1,up2,reversed]};
 const wrong=pickWrong(ans,order[kind]);if(!wrong)return null;
 const first=L(x1)+L(y1),second=L(a1)+L(b1),third=L(x2)+L(y2);
 const why=a===b?`both letters move ${places(a)}`:`the first letter moves ${places(a)} and the second letter moves ${places(b)}`;
 return {prompt:'Which letter pair completes the analogy?',stimulus:`${first} is to ${second} as ${third} is to ?${NL}${ALPHABET}`,answer:ans,wrong,rewardGroup,
  explanation:explain(`In ${first} → ${second}, ${why}.`,kind==='mirrorPairs'?`- Each pair is a mirror pair (the two letters are the same distance from each end of the alphabet), and moving the letters in opposite directions keeps it that way.`:'',`Do the same to ${third}: ${L(x2)} → ${L(a2)} and ${L(y2)} → ${L(b2)}.`,`So the answer is **${ans}**.`)};
}

// ── Helpsheets ──
const seqSheet:Helpsheet={intro:'In a letter series, each letter (or pair of letters) follows a rule, such as moving forward three places along the alphabet.',
 steps:['Use the alphabet line shown.','Count the jump from each letter to the next, forwards or backwards.','For pairs, find a rule for the first letters and a separate rule for the second letters.','If the jumps change, look for a pattern in the jumps (+1, +2, +3 …) or two series taking turns.','Apply the rule to find the missing letters.'],
 example:{title:'Example: BZ, DY, FX, HW, ?',lines:['First letters: B → D → F → H, forward 2 each time, so next is J.','Second letters: Z → Y → X → W, back 1 each time, so next is V.','The next pair is JV.']},
 tips:['Count along the alphabet line with your finger rather than in your head.','A jump of 2 means skipping one letter: B, (C), D.']};
const codeSheet:Helpsheet={intro:'In a letter code each letter of a word is swapped for another letter by the same rule. Work out the rule from the example, then use it.',
 steps:['Line up each letter of the example word with its code letter.','Count how far each letter moves along the alphabet.','If every letter moves the same amount, it is a shift code. If A and Z swap, B and Y swap and so on, it is a mirror code.','Use the same rule on the new word, or work backwards to decode.'],
 example:{title:'Example: CUP → DVQ.  How is BOWL written?',lines:['C → D, U → V, P → Q: each letter moves forward 1.','B → C, O → P, W → X, L → M.','So BOWL is written CPXM.']},
 tips:['In a mirror code, each pair of swapped letters adds up to 27 if A = 1 and Z = 26.','When decoding, move the letters the opposite way.']};
const numberSheet:Helpsheet={intro:'In a number code each letter always stands for the same number. Find the numbers from the words you know, then use them.',
 steps:['Match each letter of the known word to its number.','For "A = 1, B = 2 …" codes, count along the alphabet from A = 1.','When there are more words than codes, compare repeated letters and letters in the same places to decide which code belongs to which word.','Use the letter values to write or read the new code.'],
 example:{title:'Example: If NEST is 3814, what is TENS?',lines:['N = 3, E = 8, S = 1, T = 4.','TENS is T, E, N, S.','So TENS is 4831.']},
 tips:['A = 1, not 0, and Z = 26.','Check your answer by decoding it back into letters.']};
const pairSheet:Helpsheet={intro:'A letter-pair analogy changes the first pair into the second pair by a rule. Do exactly the same to the third pair.',
 steps:['Look at how the first letter of the first pair changes, and count the jump.','Do the same for the second letter; it may follow a different rule.','Apply the same jumps to the letters of the third pair, one letter at a time.'],
 example:{title:'Example: GK is to HI as PT is to ?',lines:['G → H is forward 1; K → I is back 2.','P forward 1 is Q; T back 2 is R.','So the answer is QR.']},
 tips:['Keep the first letters and second letters separate.','Count along the alphabet line, not in your head.']};

export const vrCodeTopics=[
 build(vrTopic('letter-sequences',S,'Letter sequences',seqSheet),20,letterSequence),
 build(vrTopic('letter-codes',S,'Letter codes',codeSheet),20,letterCode),
 build(vrTopic('number-codes',S,'Number codes',numberSheet),20,numberCode),
 build(vrTopic('letter-analogies',S,'Letter-pair analogies',pairSheet),20,letterAnalogy),
];
