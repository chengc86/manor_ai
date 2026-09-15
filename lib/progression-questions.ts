import type {Question} from './questions';
// Stable supplementary IDs: never renumber existing questions or clear pupil history.
export const progressionQuestions:Question[]=[];
const add=(id:string,subject:Question['subject'],prompt:string,answers:string[],explanation:string,diagram?:Question['diagram'])=>progressionQuestions.push({id:'progression-v1-'+id,subject,prompt,answers,explanation,difficulty:'Year 6',...(diagram?{diagram}:{})});
for(let n=17;n<=216;n++){
add(`multiply-${n}`,'Maths',`A school orders ${n+8} boxes, each containing 24 pencils. How many pencils does it order?`,[String((n+8)*24)],`${n+8} × 24 = ${n+8} × 20 + ${n+8} × 4 = ${(n+8)*24}.`);
add(`percent-${n}`,'Maths',`Find 35% of ${n*20}.`,[String(n*7)],`30% is ${n*6} and 5% is ${n}. Together they make ${n*7}.`);
const denominator=3+n%6,numerator=denominator-1,total=n*denominator;
add(`fraction-${n}`,'Maths',`Find ${numerator}/${denominator} of ${total}.`,[String(n*numerator)],`Divide ${total} by ${denominator} to get ${n}, then multiply by ${numerator}: ${n*numerator}.`);
const distance=n*125;
add(`units-${n}`,'Maths',`A route is ${distance} metres long. Write this distance in kilometres. Give a number only.`,[String(distance/1000)],`There are 1,000 metres in a kilometre. ${distance} ÷ 1,000 = ${distance/1000}.`);
}
const words=['BRAVE','CROWN','LIGHT','GREEN','RIVER','STONE','FIELD','WATER','NORTH','SOUTH','HOUSE','MUSIC','STORY','PLANT','CLOUD','TRAIN','NIGHT','CLASS','LEARN','SHAPE','SPACE','QUICK','WORLD','ZEBRA'];
for(const word of words)for(let shift=1;shift<=5;shift++){const encoded=[...word].map(c=>String.fromCharCode(65+(c.charCodeAt(0)-65+shift)%26)).join('');add(`code-${word}-${shift}`,'Verbal reasoning',`In a code, move each letter ${shift} place${shift===1?'':'s'} forwards in the alphabet, wrapping from Z to A. How is ${word} written?`,[encoded],[...word].map((c,i)=>`${c} → ${encoded[i]}`).join(', ')+`. The code is ${encoded}.`);}
for(let a=0;a<9;a++)for(let b=a+1;b<9;b++)for(const mode of ['mirror','turn','horizontal'] as const){const transform=(n:number)=>{const r=Math.floor(n/3),c=n%3;return mode==='mirror'?r*3+(2-c):mode==='horizontal'?(2-r)*3+c:c*3+(2-r);};const positions=[transform(a)+1,transform(b)+1].sort((a,b)=>a-b);const instruction=mode==='mirror'?'Reflect this grid in a vertical mirror line through its centre':mode==='horizontal'?'Reflect this grid in a horizontal mirror line through its centre':'Rotate this grid 90° clockwise';add(`grid-${a}-${b}-${mode}`,'Non-verbal reasoning',`${instruction}. Which two positions will be shaded? The position labels stay fixed. Type the two numbers in ascending order, separated by a space.`,[positions.join(' '),positions.join(', '),positions.join(','),positions.join(' and ')],`Position ${a+1} moves to ${transform(a)+1}, and position ${b+1} moves to ${transform(b)+1}. In ascending order: ${positions.join(', ')}.`,{kind:'grid',items:[(1<<a)|(1<<b)]});}
