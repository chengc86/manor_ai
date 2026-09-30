import {moreQuestions} from './more-questions';
import {questExpansion} from './quest-expansion';
import {textbookQuestions} from './textbook-questions';
import {freshQuestions} from './fresh-questions';
import {year2Questions} from './year2-questions';
import {rewardGroupFor,questionReward} from './question-rewards';
import {readingExpansion} from './reading-expansion';
import {progressionQuestions} from './progression-questions';
import {mixedQuestions} from './mixed-questions';
import {year6Questions} from './year6-expansion';
import {questionCorrections} from './question-corrections';
import {entranceQuestions} from './entrance-questions';
import {bankQuestions,topicById} from './bank';
import type {Visual} from './visual';
// Server-only question bank. Answers are never included in question responses.
export type Subject = 'Maths'|'English'|'Verbal reasoning'|'Non-verbal reasoning'|'Science';
export type Question = {rewardGroup?:import('./question-rewards').RewardGroup;reward?:number;id:string;subject:Subject;prompt:string;answers:string[];explanation:string;options?:string[];passage?:string;diagram?:{kind:string;items:number[]};difficulty:string;
 // Atom-style bank (bank-*.ts). topic links to its helpsheet and mastery. select > 1 asks for that many options; answers lists them all.
 topic?:string;select?:number;stimulus?:string;visual?:Visual;optionVisuals?:Visual[];reading?:{id:string;title:string;byline?:string;pages:string[]};page?:number;
 // The original Year 6 bank is retired: it is never asked again, but stays here so notebooks, friends' hints and pending questions still work.
 legacy?:boolean;
 // The author fixed the choice order (< = >, numbers in order, lettered cards), so it is never shuffled per pupil.
 fixedOrder?:boolean};
export const questions:Question[]=[];
function add(subject:Subject,prompt:string,answers:string[],explanation:string,extra:Partial<Question>={}){questions.push({id:`q${questions.length+1}`,subject,prompt,answers,explanation,difficulty:'Year 6',...extra})}
for(let n=2;n<=16;n++){
 add('Maths',`A school buys ${n+8} boxes of pencils. Each box contains 24 pencils. How many pencils are there altogether?`,[String((n+8)*24)],`Multiply ${n+8} by 24: (${n+8} × 20) + (${n+8} × 4) = ${(n+8)*24}.`);
 add('Maths',`What is 35% of ${n*20}?`,[String(n*7)],`10% is ${n*2}, so 30% is ${n*6} and 5% is ${n}. Add them to get ${n*7}.`);
 add('Maths',`A rectangle has an area of ${n*(n+7)} cm² and a width of ${n} cm. What is its perimeter in cm?`,[String(4*n+14)],`Its length is ${n+7} cm. The perimeter is 2 × (${n} + ${n+7}) = ${4*n+14} cm.`);
 {const d=5+10*(2*n%9),first=`${n}.${String(d).padStart(2,'0')}`;add('Maths',`Calculate ${first} − ${n-1}.9. Give your answer as a decimal.`,[`0.${d+10}`,`.${d+10}`],`Line up the decimal places: ${first} − ${n-1}.90 = 0.${d+10}.`);}
 add('Maths',`The ratio of red beads to blue beads is 3:5. There are ${n*40} beads altogether. How many are blue?`,[String(n*25)],`There are 8 equal parts. Each part is ${n*5}; 5 parts are ${n*25}.`);
 add('Maths',`A train leaves at 14:${String(n+10).padStart(2,'0')} and travels for 1 hour 45 minutes. What time does it arrive? Use 24-hour time, e.g. 17:30.`,[`16:${String(n-5<0?n+55:n-5).padStart(2,'0')}`].map(()=>{let t=14*60+n+10+105;return `${Math.floor(t/60)}:${String(t%60).padStart(2,'0')}`}),`Add 1 hour, then 45 minutes. The arrival time is ${Math.floor((14*60+n+115)/60)}:${String((n+115)%60).padStart(2,'0')}.`);
}
const maths:[string,string[],string][]=[
 ['Calculate 3/4 + 5/8. Give your answer as a fraction in its lowest terms.',['11/8','1 3/8'],'3/4 is 6/8. Add 5/8 to get 11/8, or 1 3/8.'],
 ['What is 2/3 of 81?',['54'],'81 ÷ 3 = 27, then 27 × 2 = 54.'],
 ['Round 47,650 to the nearest thousand.',['48000','48,000'],'The hundreds digit is 6, so round up to 48,000.'],
 ['Find the missing number: 7 × ___ − 9 = 54.',['9'],'Add 9 to get 63, then divide by 7.'],
 ['The temperature rises from −7°C to 6°C. How many degrees does it rise?',['13'],'7 degrees to zero, then 6 more: 13 degrees.'],
 ['What is the mean of 12, 17, 8, 15 and 18?',['14'],'The total is 70. Divide by the 5 numbers to get 14.'],
 ['A triangle has angles of 47° and 68°. What is its third angle in degrees?',['65'],'Angles in a triangle total 180°. 180 − 47 − 68 = 65.'],
 ['Calculate 2.4 × 0.3.',['0.72','.72'],'24 × 3 = 72. There are two decimal places in total, giving 0.72.'],
 ['A jumper costs £48. It is reduced by 25%. What is the new price in pounds?',['36','£36','36.00'],'25% of £48 is £12. £48 − £12 = £36.'],
 ['How many millilitres are in 2.75 litres?',['2750','2,750'],'Multiply litres by 1,000: 2.75 × 1,000 = 2,750.'],
 ['Simplify 18/24 to its lowest terms.',['3/4'],'Divide the numerator and denominator by 6.'],
 ['What is the lowest common multiple of 6 and 8?',['24'],'24 is the first number that appears in both times tables.']];
maths.forEach(q=>add('Maths',...q));
const texts=[
 {p:'Maya paused at the library door. Inside, the usual chatter had faded. A trail of muddy footprints led towards the history shelves. She tightened her grip on the book and stepped inside.',q:[['Which word tells you Maya stopped briefly?','paused','“Paused” means stopped for a short time.'],['What kind of shelves did the footprints lead towards?','history|history shelves|the history shelves','The passage says the footprints led towards the history shelves.'],['What was Maya holding?','a book|book|the book','She tightened her grip on the book.'],['Copy the adjective that describes the footprints.','muddy','“Muddy” describes what the footprints were like.']]},
 {p:'The old oak had survived a hundred winters. Its branches stretched over the playground like protective arms. Even when the new buildings rose around it, the tree remained, offering cool shade to each new generation.',q:[['What type of tree is described?','oak|an oak|oak tree|an oak tree|the oak|the oak tree|old oak|an old oak|the old oak','The first sentence names the old oak.'],['How many winters had it survived?','100|a hundred|one hundred|hundred|a hundred winters|one hundred winters|100 winters','The passage says “a hundred winters”.'],['What did the tree offer each new generation?','shade|cool shade','The final sentence says it offered cool shade.'],['Copy the word that introduces the comparison with protective arms.','like','“Like” introduces the simile.']]},
 {p:'Sam had practised the tune for weeks, but the sight of the audience made his hands tremble. He took a slow breath and began. By the final note, his shoulders had relaxed and a small smile had appeared.',q:[['Which word means shake slightly?','tremble','“Tremble” means shake slightly, often because of nerves.'],['How long had Sam practised: days, weeks or months? Type the word.','weeks','The first sentence says he had practised for weeks.'],['What did Sam take before he began?','a breath|a slow breath|slow breath|breath','He took a slow breath.'],['Copy the word describing the size of his smile.','small','The final sentence describes “a small smile”.']]},
 {p:'Although the river looked calm, its current was powerful. The guide insisted that everyone wear a life jacket before boarding the boat. Only after checking each strap did she give the signal to leave.',q:[['Which word shows a contrast at the start of the passage?','although','“Although” contrasts the calm appearance with the powerful current.'],['What was powerful?','current|the current|its current|the river current|river current|the river’s current|river’s current|the current of the river','The river’s current was powerful.'],['What did the guide check before leaving?','straps|each strap|strap|the straps','She checked each strap before giving the signal.'],['What did everyone need to wear?','a life jacket|life jacket|life jackets','The guide insisted on life jackets.']]},
 {p:'Beneath the cracked paving stone, a tiny shoot pushed towards the light. Every morning, Arun brought it a little water. By June, bright yellow flowers had appeared where nobody had expected anything to grow.',q:[['Which month is named?','june','The flowers had appeared by June.'],['What colour were the flowers?','yellow|bright yellow','The passage describes bright yellow flowers.'],['What did Arun bring every morning?','water|a little water','Arun brought the shoot a little water.'],['Copy the adjective describing the paving stone.','cracked','“Cracked” describes the paving stone.']]},
 ];
texts.forEach(t=>t.q.forEach(([q,a,e])=>add('English',q,a.split('|'),e,{passage:t.p})));
const vr:[string,string,string][]=[
 ['Complete the analogy: seed is to plant as egg is to ___.','chick','A plant grows from a seed; a chick hatches from an egg.'],
 ['Rearrange LISTEN to make a word meaning “making no sound”.','silent','SILENT uses all six letters of LISTEN.'],
 ['Which word is the odd one out: cautious, careful, reckless, wary? Type the word.','reckless','The other words mean taking care; reckless means not taking care.'],
 ['Complete the sequence: 3, 7, 15, 31, ___.','63','Each term is double the previous term plus 1.'],
 ['If A = 1, B = 2 and so on, what is the total value of CAT?','24','C = 3, A = 1, T = 20. Their total is 24.'],
 ['Complete the analogy: author is to book as composer is to ___.','music|a piece of music|song|a song','An author creates a book; a composer creates music.'],
 ['Add the same letter to “ate” and “tea” to make a word meaning companion and a word meaning a group playing together. Put it before “ate” and after “tea”. What is the letter?','m','M + ate makes mate. Tea + M makes team.'],
 ['Rearrange SECURE to make a word meaning “save from danger”.','rescue','RESCUE is an anagram of SECURE.'],
 ['Which word means the opposite of “scarce”: rare, plentiful, hidden, empty?','plentiful','Scarce means not enough; plentiful means a large amount.'],
 ['Complete the letter sequence: B, E, H, K, ___.','n','Move forward three letters each time.'],
 ['Complete the analogy: thermometer is to temperature as ruler is to ___.','length|distance','A thermometer measures temperature; a ruler measures length.'],
 ['Find the four-letter word hidden across “the music allowed dancing”. It means to ring someone.','call','musiC + ALLowed contains CALL across the word boundary.'],
 ['What prefix can be added to “possible” to mean “not possible”?','im|im-','IM + possible makes impossible.'],
 ['If DOG is coded EPH, how is CAT coded?','dbu','Each letter moves one place forward in the alphabet.'],
 ['Complete the sequence: 81, 27, 9, ___.','3','Divide each number by 3.'],
 ['Which word is closest in meaning to “reluctant”: eager, unwilling, noisy, speedy?','unwilling','Reluctant means unwilling or hesitant.'],
 ['Rearrange “EARTH” to make the name of an organ in your body.','heart','HEART uses all five letters.'],
 ['Complete the analogy: minute is to hour as month is to ___.','year|a year','Minutes are parts of an hour; months are parts of a year.'],
 ['Which word does not belong: triangle, square, cube, pentagon?','cube','A cube is three-dimensional. The other shapes are two-dimensional.'],
 ['Complete the sequence: 2, 6, 12, 20, 30, ___.','42','The differences are 4, 6, 8, 10, then 12.'],
 ];
vr.forEach(([q,a,e])=>add('Verbal reasoning',q,a.split('|'),e));
for(let n=1;n<=8;n++){
 add('Non-verbal reasoning','Look at the groups of dots. How many dots belong in the next group?',[String(n+6)],`Each group gains 2 dots: ${n}, ${n+2}, ${n+4}, then ${n+6}.`,{diagram:{kind:'dots',items:[n,n+2,n+4]}});
 if(n<=4)add('Non-verbal reasoning','The arrow turns 90° clockwise each time. Which direction comes next? Type up, right, down or left.',[['left','up','right','down'][n%4]],'Follow the clockwise cycle: up → right → down → left → up.',{diagram:{kind:'arrows',items:[n%4,(n+1)%4,(n+2)%4]}});
}
add('Non-verbal reasoning','How many lines of symmetry does this regular hexagon have?',['6','six'],'A regular hexagon has 6 lines of symmetry: 3 through opposite corners and 3 through opposite side midpoints.',{diagram:{kind:'polygon',items:[6]}});
add('Non-verbal reasoning','How many sides will the next shape have?',['6','six'],'The shapes gain one side each time: triangle (3), square (4), pentagon (5), hexagon (6).',{diagram:{kind:'polygon',items:[3,4,5]}});
add('Non-verbal reasoning','How many sides will the next shape have?',['8','eight'],'The shapes gain one side each time: pentagon (5), hexagon (6), heptagon (7), octagon (8).',{diagram:{kind:'polygon',items:[5,6,7]}});
questions.push(...year6Questions,...mixedQuestions,...progressionQuestions,...readingExpansion,...year2Questions,...freshQuestions,...textbookQuestions,...questExpansion,...moreQuestions,...entranceQuestions);
for(const q of questions)Object.assign(q,questionCorrections[q.id]);
for(const q of questions)if(q.difficulty!=='Year 2')q.legacy=true;
// Explicit choices keep open analogies from rejecting other plausible answers.
for(const q of questions){if(q.prompt==='Complete the analogy: seed is to plant as egg is to ___.')q.options=['chick','calf','sapling','kitten'];if(q.prompt==='Complete the analogy: author is to book as composer is to ___.')q.options=['music','brush','stage','audience'];if(q.id==='y6-2026-051')q.options=['wall','river','story','tree'];if(q.id==='y6-2026-052')q.options=['school','hotel','factory','farm'];}
for(const q of questions){q.rewardGroup=rewardGroupFor(q);q.reward=questionReward(q);}
// Picture choices are labelled inside the diagram, so list them in label order.
for(const q of questions)if(q.options?.every(o=>/^[A-Z]$/.test(o)))q.options.sort();
questions.push(...bankQuestions);
export const questionById=new Map(questions.map(q=>[q.id,q]));
export function normalise(s:string){if(/^[.,!?;:]$/.test(s.trim()))return s.trim();return s.normalize('NFKC').replace(/[‘’]/g,"'").replace(/−/g,'-').toLowerCase().trim().replace(/[.,!?]$/,'').replace(/\s+/g,' ').replace(/\s*\/\s*/g,'/');}
// Each pupil sees a question's choices in their own fixed order, so "it's C" in a hint or in chat means nothing to anyone else.
// Picture choices keep their letters A, B, C … while the pictures move, so a pupil's letter is mapped back before marking.
// Only the new bank is shuffled: its explanations never name a letter. Year 2 and retired questions keep their written order.
const seed=(s:string)=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;};
/** Display position → original option index for this pupil, or null when the order stays as written. */
export function choiceOrder(q:Question,viewer?:string|null):number[]|null{
 if(!viewer||!q.topic||!q.options||q.fixedOrder||(!q.optionVisuals&&q.options.every(o=>/^[A-Z]$/.test(o))))return null;
 let s=seed(`${viewer}|${q.id}`);const rand=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};
 const order=q.options.map((_,i)=>i);for(let i=order.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[order[i],order[j]]=[order[j],order[i]];}return order;
}
/** What the pupil clicked, as the original options (only picture letters change). */
export function toCanonical(q:Question,viewer:string|null|undefined,answer:string|string[]):string|string[]{const order=choiceOrder(q,viewer);if(!order||!q.optionVisuals)return answer;const map=(a:string)=>{const i=q.options!.indexOf(a);return i<0?a:q.options![order[i]];};return Array.isArray(answer)?answer.map(map):map(answer);}
/** The original answers as this pupil sees them. */
export function toViewer(q:Question,viewer:string|null|undefined,answers:string[]):string[]{const order=choiceOrder(q,viewer);if(!order||!q.optionVisuals)return answers;return answers.map(a=>{const i=q.options!.indexOf(a),j=order.indexOf(i);return j<0?a:q.options![j];});}
export function publicQuestion(q:Question,reward=q.reward,viewer?:string|null){const {answers,explanation,legacy,fixedOrder,...safe}=q,topic=q.topic?topicById.get(q.topic):undefined,order=choiceOrder(q,viewer);
 const choices=order?(q.optionVisuals?{optionVisuals:order.map(i=>q.optionVisuals![i])}:{options:order.map(i=>q.options![i])}):{};
 return {...safe,...choices,reward,...(topic?{topicTitle:topic.title,strand:topic.strand}:{})};}
/** A submitted answer in the form the question needs: one string, or for select > 1 that many different options. Throws a pupil-facing message otherwise. */
export function readAnswer(q:Question,raw:unknown):string|string[]{
 const need=q.select??1;
 if(need>1){const picked=Array.isArray(raw)?[...new Set(raw.map(v=>String(v??'').trim()).filter(Boolean))]:[];if(picked.length!==need||picked.some(a=>a.length>300))throw new Error(`Choose ${need} answers.`);return picked;}
 const answer=String(Array.isArray(raw)?raw[0]??'':raw??'').trim();if(!answer||answer.length>300)throw new Error('Type your answer first (up to 300 characters).');return answer;
}
/** How a submitted answer is written in notebooks: several choices are joined with a middle dot. */
export const answerText=(a:string|string[])=>Array.isArray(a)?a.join(' · '):a;

// A number may carry a unit only when it is the unit the question asks for: "how many <unit>", otherwise the last unit named.
const UNITS:[RegExp,RegExp][]=[[/^(p|pence)$/,/\d+p\b|\bpence\b/g],[/^(cm|centimetres?)$/,/\bcm\b(?!²)|\bcentimetres?\b/g],[/^(m|metres?)$/,/\d ?m\b(?!²)|\bmetres?\b/g],[/^(km|kilometres?)$/,/\bkm\b(?!\/)|\bkilometres?\b(?! per)/g],[/^(mm|millimetres?)$/,/\bmm\b|\bmillimetres?\b/g],[/^(g|grams?)$/,/\d ?g\b|\bgrams?\b/g],[/^(kg|kilograms?)$/,/\bkg\b|\bkilograms?\b/g],[/^(ml|millilitres?)$/,/\bml\b|\bmillilitres?\b/g],[/^(l|litres?)$/,/\d ?l\b|\blitres?\b/g],[/^(°c?|degrees?( celsius)?)$/,/°|\bdegrees?\b/g],[/^(minutes?|mins?)$/,/\bminutes?\b/g],[/^(hours?|hrs?)$/,/\bhours?\b/g],[/^(seconds?|secs?)$/,/\bseconds?\b/g],[/^days?$/,/\bdays?\b/g],[/^years?( old)?$/,/\byears?\b/g],[/^(cm²|cm2|square centimetres?)$/,/cm²|\bsquare centimetres?\b/g],[/^(m²|m2|square metres?)$/,/\bm²|\bsquare metres?\b/g],[/^(km\/h|kph|kilometres per hour)$/,/km\/h|\bkilometres per hour\b/g]];
function askedUnit(prompt:string){const p=prompt.toLowerCase(),how=p.match(/how many ([a-z²]+)/);if(how){const i=UNITS.findIndex(([unit])=>unit.test(how[1]));if(i>=0)return i;}let best=-1,at=-1;UNITS.forEach(([,cue],i)=>{for(const m of p.matchAll(cue))if(m.index!>=at){at=m.index!;best=i;}});return best;}
/** An option exactly as shown: capitals and punctuation can be the whole point of a question ("Stop!" is not "Stop."). */
export const exactOption=(s:string)=>s.normalize('NFKC').replace(/\s+/g,' ').trim();
export function answerMatches(q:Question,input:string|string[]){
 // New-bank choices are clicked, not typed, so they must match exactly; typed answers and older questions stay forgiving.
 if(q.topic&&q.options){const want=q.answers.map(exactOption);if((q.select??1)>1){const got=new Set((Array.isArray(input)?input:input.split(' · ')).map(exactOption));return got.size===want.length&&want.every(a=>got.has(a));}return want.includes(exactOption(Array.isArray(input)?input[0]??'':input));}
 if((q.select??1)>1){const got=new Set((Array.isArray(input)?input:input.split(' · ')).map(normalise)),want=new Set(q.answers.map(normalise));return got.size===want.size&&[...want].every(a=>got.has(a));}if(Array.isArray(input))input=input[0]??'';const value=normalise(input);if(q.answers.some(a=>normalise(a)===value))return true;if(q.subject!=='Maths')return false;const numeric=(s:string)=>{s=normalise(s);if(/pounds|£/.test(q.prompt))s=s.replace(/^£/,'');if(/what percentage|which percentage/i.test(q.prompt))s=s.replace(/%$/,'');const unit=s.match(/^([+-]?[\d.,]*\d)\s*(\D.*)$/);if(unit){const i=askedUnit(q.prompt);if(i>=0&&UNITS[i][0].test(unit[2]))s=unit[1];}if(!/^[+-]?(?:\d{1,3}(?:,\d{3})+|\d+|)(?:\.\d+)?$/.test(s)||!/[0-9]/.test(s))return null;const n=Number(s.replace(/,/g,''));return Number.isFinite(n)?n:null;};const n=numeric(input);return n!==null&&q.answers.some(a=>{const expected=numeric(a);return expected!==null&&n===expected;});}
// Friends' hints must not hand over the answer: reject the answer itself, or any distinctive accepted answer (3+ characters or a number) that the prompt does not already show.
export function revealsAnswer(q:Question,hint:string){if(answerMatches(q,hint))return true;const text=normalise(hint),prompt=normalise(q.prompt);return q.answers.some(a=>{const value=normalise(a);if(value.length<3&&!/[0-9]/.test(value))return false;const word=new RegExp('(?<![a-z0-9]|[0-9][.,/:])'+value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?![a-z0-9]|[.,/:][0-9])');return word.test(text)&&!word.test(prompt);});}
