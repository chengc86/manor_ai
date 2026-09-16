import {questExpansion} from './quest-expansion';
import {textbookQuestions} from './textbook-questions';
import {freshQuestions} from './fresh-questions';
import {year2Questions} from './year2-questions';
import {rewardGroupFor,questionReward} from './question-rewards';
import {readingExpansion} from './reading-expansion';
import {progressionQuestions} from './progression-questions';
import {mixedQuestions} from './mixed-questions';
import {year6Questions} from './year6-expansion';
// Server-only question bank. Answers are never included in question responses.
export type Subject = 'Maths'|'English'|'Verbal reasoning'|'Non-verbal reasoning';
export type Question = {rewardGroup?:import('./question-rewards').RewardGroup;reward?:number;id:string;subject:Subject;prompt:string;answers:string[];explanation:string;options?:string[];passage?:string;diagram?:{kind:string;items:number[]};difficulty:string};
export const questions:Question[]=[];
function add(subject:Subject,prompt:string,answers:string[],explanation:string,extra:Partial<Question>={}){questions.push({id:`q${questions.length+1}`,subject,prompt,answers,explanation,difficulty:'Year 6',...extra})}
for(let n=2;n<=16;n++){
 add('Maths',`A school buys ${n+8} boxes of pencils. Each box contains 24 pencils. How many pencils are there altogether?`,[String((n+8)*24)],`Multiply ${n+8} by 24: (${n+8} × 20) + (${n+8} × 4) = ${(n+8)*24}.`);
 add('Maths',`What is 35% of ${n*20}?`,[String(n*7)],`10% is ${n*2}, so 30% is ${n*6} and 5% is ${n}. Add them to get ${n*7}.`);
 add('Maths',`A rectangle has an area of ${n*(n+7)} cm² and a width of ${n} cm. What is its perimeter in cm?`,[String(4*n+14)],`Its length is ${n+7} cm. The perimeter is 2 × (${n} + ${n+7}) = ${4*n+14} cm.`);
 add('Maths',`Calculate ${n}.75 − ${n-1}.9. Give your answer as a decimal.`,['0.85','.85'],`Line up the decimal places: ${n}.75 − ${n-1}.90 = 0.85.`);
 add('Maths',`The ratio of red beads to blue beads is 3:5. There are ${n*40} beads altogether. How many are blue?`,[String(n*25)],`There are 8 equal parts. Each part is ${n*5}; 5 parts are ${n*25}.`);
 add('Maths',`A train leaves at 14:${String(n+10).padStart(2,'0')} and travels for 1 hour 45 minutes. What time does it arrive? Use 24-hour time, e.g. 17:30.`,[`16:${String(n-5<0?n+55:n-5).padStart(2,'0')}`].map(()=>{let t=14*60+n+10+105;return `${Math.floor(t/60)}:${String(t%60).padStart(2,'0')}`}),`Add 1 hour, then 45 minutes. The arrival time is ${Math.floor((14*60+n+115)/60)}:${String((n+115)%60).padStart(2,'0')}.`);
}
const maths:[string,string[],string][]=[
 ['Calculate 3/4 + 5/8. Give a fraction.',['11/8','1 3/8'],'3/4 is 6/8. Add 5/8 to get 11/8, or 1 3/8.'],
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
 {p:'Maya paused at the library door. Inside, the usual chatter had faded. A trail of muddy footprints led towards the history shelves. She tightened her grip on the book and stepped inside.',q:[['Which word tells you Maya stopped briefly?','paused','“Paused” means stopped for a short time.'],['What kind of shelves did the footprints lead towards?','history','The passage says the footprints led towards the history shelves.'],['What was Maya holding?','a book|book|the book','She tightened her grip on the book.'],['Copy the adjective that describes the footprints.','muddy','“Muddy” describes what the footprints were like.']]},
 {p:'The old oak had survived a hundred winters. Its branches stretched over the playground like protective arms. Even when the new buildings rose around it, the tree remained, offering cool shade to each new generation.',q:[['What type of tree is described?','oak|an oak|oak tree','The first sentence names the old oak.'],['How many winters had it survived?','100|a hundred|one hundred','The passage says “a hundred winters”.'],['What did the tree offer each new generation?','shade|cool shade','The final sentence says it offered cool shade.'],['Copy the word that introduces the comparison with protective arms.','like','“Like” introduces the simile.']]},
 {p:'Sam had practised the tune for weeks, but the sight of the audience made his hands tremble. He took a slow breath and began. By the final note, his shoulders had relaxed and a small smile had appeared.',q:[['Which word means shake slightly?','tremble','“Tremble” means shake slightly, often because of nerves.'],['How long had Sam practised: days, weeks or months? Type the word.','weeks','The first sentence says he had practised for weeks.'],['What did Sam take before he began?','a breath|a slow breath|slow breath|breath','He took a slow breath.'],['Copy the word describing the size of his smile.','small','The final sentence describes “a small smile”.']]},
 {p:'Although the river looked calm, its current was powerful. The guide insisted that everyone wear a life jacket before boarding the boat. Only after checking each strap did she give the signal to leave.',q:[['Which word shows a contrast at the start of the passage?','although','“Although” contrasts the calm appearance with the powerful current.'],['What was powerful?','current|the current|its current|the river current','The river’s current was powerful.'],['What did the guide check before leaving?','straps|each strap|strap|the straps','She checked each strap before giving the signal.'],['What did everyone need to wear?','a life jacket|life jacket|life jackets','The guide insisted on life jackets.']]},
 {p:'Beneath the cracked paving stone, a tiny shoot pushed towards the light. Every morning, Arun brought it a little water. By June, bright yellow flowers had appeared where nobody had expected anything to grow.',q:[['Which month is named?','june','The flowers had appeared by June.'],['What colour were the flowers?','yellow|bright yellow','The passage describes bright yellow flowers.'],['What did Arun bring every morning?','water|a little water','Arun brought the shoot a little water.'],['Copy the adjective describing the paving stone.','cracked','“Cracked” describes the paving stone.']]},
 ];
texts.forEach(t=>t.q.forEach(([q,a,e])=>add('English',q,a.split('|'),e,{passage:t.p})));
const vr:[string,string,string][]=[
 ['Complete the analogy: seed is to plant as egg is to ___.','bird|a bird|chick','A plant grows from a seed; a bird hatches from an egg.'],
 ['Rearrange LISTEN to make a word meaning “making no sound”.','silent','SILENT uses all six letters of LISTEN.'],
 ['Which word is the odd one out: cautious, careful, reckless, wary? Type the word.','reckless','The other words mean taking care; reckless means not taking care.'],
 ['Complete the sequence: 3, 7, 15, 31, ___.','63','Each term is double the previous term plus 1.'],
 ['If A = 1, B = 2 and so on, what is the total value of CAT?','24','C = 3, A = 1, T = 20. Their total is 24.'],
 ['Complete the analogy: author is to book as composer is to ___.','music|a piece of music|song|a song','An author creates a book; a composer creates music.'],
 ['Add the same letter to the start of “ate” and the end of “tea” to make two new words. What is the letter?','m','M + ate makes mate. Tea + M makes team.'],
 ['Rearrange SECURE to make a word meaning “save from danger”.','rescue','RESCUE is an anagram of SECURE.'],
 ['Which word means the opposite of “scarce”: rare, plentiful, hidden, empty?','plentiful','Scarce means not enough; plentiful means a large amount.'],
 ['Complete the letter sequence: B, E, H, K, ___.','n','Move forward three letters each time.'],
 ['Complete the analogy: thermometer is to temperature as ruler is to ___.','length|distance','A thermometer measures temperature; a ruler measures length.'],
 ['Find the four-letter word hidden across “the music allowed dancing”. It means to ring someone.','call','musiC + ALLowed contains CALL across the word boundary.'],
 ['What prefix can be added to “possible” to mean “not possible”?','im','IM + possible makes impossible.'],
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
questions.push(...year6Questions,...mixedQuestions,...progressionQuestions,...readingExpansion,...year2Questions,...freshQuestions,...textbookQuestions,...questExpansion);
for(const q of questions){q.rewardGroup=rewardGroupFor(q);q.reward=questionReward(q);}
export function normalise(s:string){return s.toLowerCase().trim().replace(/[.,!?]$/,'').replace(/\s+/g,' ').replace(/\s*\/\s*/g,'/');}
export function publicQuestion(q:Question,reward=q.reward){const {answers,explanation,...safe}=q;return {...safe,reward};}
