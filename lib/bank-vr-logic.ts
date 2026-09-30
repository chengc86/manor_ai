import {build,explain,num,list,cap,NAMES,type Draft,type Helpsheet,type Rng} from './bank-kit';
import type {RewardGroup} from './question-rewards';
import {vrTopic} from './bank-vr-vocab';
// Verbal reasoning: number sequences, number relationships, letters standing for numbers and logic problems,
// made by seeded templates. Each template checks its own question is fair (one rule, one answer) before using it.

const S='Numbers and logic';
const NL='\n';
const sched=<T,>(plan:T[],i:number)=>plan[i%plan.length];
/** Takes wrong options in order of preference, skipping repeats, the answer and empty values. */
function pickWrong(answer:string,cands:(string|null|undefined)[],need=4):string[]|null{
 const out:string[]=[];for(const c of cands){if(c&&c!==answer&&!out.includes(c))out.push(c);if(out.length===need)return out;}
 return null;
}
const posInt=(n:number)=>Number.isInteger(n)&&n>0;
const numbers=(ns:number[])=>ns.filter(posInt).map(n=>num(n));

// ── Number sequences ──
type NSKind='add'|'mult'|'grow'|'squares'|'alternate'|'fib'|'gap'|'twoOps';
const NS_PLAN:NSKind[]=['add','mult','grow','gap','squares','add','alternate','grow','mult','fib','add','twoOps','gap','grow','squares','alternate','mult','fib','twoOps','gap'];
const NS_LEVEL:Record<NSKind,RewardGroup>={add:'quick',mult:'standard',grow:'standard',gap:'standard',squares:'standard',alternate:'challenge',fib:'challenge',twoOps:'challenge'};
/** Next terms predicted by common rules that fit every given term; a fair series has only one prediction. */
export function seriesPredictions(xs:number[]):Set<number>{
 const out=new Set<number>(),n=xs.length,d=xs.slice(1).map((x,i)=>x-xs[i]),dd=d.slice(1).map((x,i)=>x-d[i]);
 if(d.every(v=>v===d[0]))out.add(xs[n-1]+d[0]);
 if(xs.every(x=>x!==0)){const q=xs[1]/xs[0];if(xs.slice(1).every((x,i)=>x===xs[i]*q))out.add(xs[n-1]*q);}
 if(dd.length>=2&&dd.every(v=>v===dd[0]))out.add(xs[n-1]+d[d.length-1]+dd[0]);
 if(n>=5){const odd=xs.filter((_,i)=>i%2===0),even=xs.filter((_,i)=>i%2===1),next=n%2===0?odd:even,dn=next[1]-next[0],other=n%2===0?even:odd,dO=other[1]-other[0];
  if(next.slice(1).every((x,i)=>x-next[i]===dn)&&other.slice(1).every((x,i)=>x-other[i]===dO)&&dn!==dO)out.add(next[next.length-1]+dn);}
 if(n>=4&&xs.slice(2).every((x,i)=>x===xs[i]+xs[i+1]))out.add(xs[n-1]+xs[n-2]);
 return out;
}
function numberSequence(r:Rng,i:number):Draft|null{
 const kind=sched(NS_PLAN,i),rewardGroup=NS_LEVEL[kind],show=(xs:(number|string)[])=>xs.map(x=>typeof x==='number'?num(x):x).join(', ');
 const next=(xs:number[],ans:number,cands:number[],why:string[]):Draft|null=>{
  const p=seriesPredictions(xs);if(p.size>1||p.size===1&&!p.has(ans))return null;
  const wrong=pickWrong(num(ans),numbers(cands));if(!wrong)return null;
  return {prompt:'Which number comes next in the series?',stimulus:show([...xs,'?']),answer:num(ans),wrong,rewardGroup,explanation:explain(...why)};
 };
 if(kind==='add'){
  const d=r.pick([3,4,5,6,7,8,9,11,12,15,-3,-4,-5,-6,-7,-8]),x0=d>0?r.int(1,40):r.int(-d*6+2,-d*6+45),xs=Array.from({length:5},(_,j)=>x0+j*d),ans=x0+5*d;
  return next(xs,ans,[ans+1,ans-1,ans+d,ans+2,ans-2,ans+10],[`The numbers go ${d>0?'up':'down'} by ${Math.abs(d)} each time.`,`${num(xs[4])} ${d>0?'+':'−'} ${Math.abs(d)} = **${num(ans)}**.`]);
 }
 if(kind==='mult'){
  const mode=r.pick(['x2','x3','half']);let xs:number[];
  if(mode==='x2'){const x0=r.int(1,5);xs=Array.from({length:5},(_,j)=>x0*2**j);}
  else if(mode==='x3'){const x0=r.int(1,3);xs=Array.from({length:4},(_,j)=>x0*3**j);}
  else{const m=r.int(1,6);xs=Array.from({length:5},(_,j)=>m*2**(5-j));}
  const q=mode==='x2'?2:mode==='x3'?3:.5,last=xs[xs.length-1],prev=xs[xs.length-2],ans=last*q;
  const how=mode==='half'?'Each number is half of the one before (divide by 2).':`Each number is ${mode==='x2'?'double':'three times'} the one before (multiply by ${q}).`;
  return next(xs,ans,[last+(last-prev),ans+1,ans-1,mode==='half'?last-1:last*(q+1),mode==='half'?ans*3:ans+2,ans+2],[how,`${num(last)} ${mode==='half'?'÷ 2':'× '+q} = **${num(ans)}**.`,`- Adding the last difference (${num(last-prev)}) again gives ${num(last+(last-prev))}, which does not follow the rule.`]);
 }
 if(kind==='grow'){
  const d0=r.int(1,4),c=r.pick([1,2]),x0=r.int(1,20),ds=Array.from({length:4},(_,j)=>d0+j*c),xs=[x0];for(const v of ds)xs.push(xs[xs.length-1]+v);
  const nd=d0+4*c,ans=xs[4]+nd;
  return next(xs,ans,[xs[4]+ds[3],xs[4]+nd+c,ans+1,ans-1,ans+2],[`The differences are ${ds.map(v=>'+'+v).join(', ')}: they grow by ${c} each time.`,`So the next difference is +${nd}: ${num(xs[4])} + ${nd} = **${num(ans)}**.`]);
 }
 if(kind==='squares'){
  const mode=r.pick(['sq','sq','sqPlus','cube']);let xs:number[],ans:number,why:string[];
  if(mode==='cube'){const n0=r.int(1,2);xs=Array.from({length:4},(_,j)=>(n0+j)**3);ans=(n0+4)**3;why=[`These are cube numbers: ${xs.map((x,j)=>`${n0+j} × ${n0+j} × ${n0+j} = ${num(x)}`).join(', ')}.`,`Next: ${n0+4} × ${n0+4} × ${n0+4} = **${num(ans)}**.`];}
  else{const n0=r.int(1,6),k=mode==='sq'?0:r.pick([1,2,-1,3]);xs=Array.from({length:5},(_,j)=>(n0+j)**2+k);ans=(n0+5)**2+k;
   why=[k?`Each number is a square number ${k>0?'plus':'minus'} ${Math.abs(k)}: ${xs.map((x,j)=>`${n0+j} × ${n0+j} ${k>0?'+':'−'} ${Math.abs(k)} = ${num(x)}`).join(', ')}.`:`These are square numbers: ${xs.map((x,j)=>`${n0+j} × ${n0+j} = ${num(x)}`).join(', ')}.`,`Next: ${n0+5} × ${n0+5}${k?` ${k>0?'+':'−'} ${Math.abs(k)}`:''} = **${num(ans)}**.`,'- The differences also grow by 2 each time, which gives the same answer.'];
}
  const last=xs[xs.length-1],prev=xs[xs.length-2];
  return next(xs,ans,[last+(last-prev),ans+1,ans-1,ans+2,ans-2],why);
 }
 if(kind==='alternate'){
  const a=r.int(2,6),b=r.int(2,6),s1=r.int(1,15),s2=r.int(40,70),up2=r.chance(.5);
  const xs=Array.from({length:6},(_,j)=>j%2===0?s1+(j/2)*a:s2+(up2?1:-1)*((j-1)/2)*b),ans=s1+3*a,other=xs[5]+(up2?1:-1)*b;
  if(xs.some(x=>x<=0)||a===b&&up2)return null;
  return next(xs,ans,[other,ans+1,ans-1,ans+a,xs[5]+a],['Two series take turns.',`- 1st, 3rd, 5th numbers: ${xs.filter((_,j)=>j%2===0).map(x=>num(x)).join(', ')} (add ${a} each time).`,`- 2nd, 4th, 6th numbers: ${xs.filter((_,j)=>j%2===1).map(x=>num(x)).join(', ')} (${up2?'add':'take away'} ${b} each time).`,`The 7th number belongs to the first series: ${num(xs[4])} + ${a} = **${num(ans)}**.`]);
 }
 if(kind==='fib'){
  const x0=r.int(1,6),x1=r.int(x0,x0+6),xs=[x0,x1];while(xs.length<6)xs.push(xs[xs.length-1]+xs[xs.length-2]);
  const ans=xs[5]+xs[4];
  return next(xs,ans,[xs[5]+(xs[5]-xs[4]),xs[5]*2,ans+1,ans-1,ans+2],['Each number is the sum of the two numbers before it.',`${num(xs[3])} + ${num(xs[4])} = ${num(xs[5])}, so the next number is ${num(xs[4])} + ${num(xs[5])} = **${num(ans)}**.`]);
 }
 if(kind==='twoOps'){
  const a=r.int(1,4),b=r.pick([2,3]),x0=r.int(1,5),xs=[x0];for(let j=0;j<5;j++)xs.push(j%2===0?xs[j]+a:xs[j]*b);
  const ans=xs[5]*b;if(ans>400)return null;
  return next(xs,ans,[xs[5]+a,ans+1,ans-1,xs[5]+(xs[5]-xs[4]),ans+b],[`The rule takes turns: add ${a}, then multiply by ${b}.`,`${xs.slice(1).map((x,j)=>`${num(xs[j])} ${j%2===0?'+ '+a:'× '+b} = ${num(x)}`).join(', ')}.`,`The next step is × ${b}: ${num(xs[5])} × ${b} = **${num(ans)}**.`]);
 }
 // A missing number in the middle of an adding or doubling series.
 const dbl=r.chance(.3),d=r.pick([3,4,6,7,8,9,12]),x0=dbl?r.int(2,6):r.int(2,30),xs=Array.from({length:6},(_,j)=>dbl?x0*2**j:x0+j*d),at=r.int(1,4),ans=xs[at];
 const wrong=pickWrong(num(ans),numbers(dbl?[(xs[at-1]+xs[at+1])/2,ans+1,ans-1,ans+2,ans-2]:[ans+1,ans-1,ans+2,ans-2,ans+d-1]));if(!wrong)return null;
 return {prompt:'Which number is missing from the series?',stimulus:show(xs.map((x,j)=>j===at?'?':x)),answer:num(ans),wrong,rewardGroup,
  explanation:explain(dbl?'Each number is double the one before.':`The numbers go up by ${d} each time.`,`${num(xs[at-1])} ${dbl?'× 2':'+ '+d} = **${num(ans)}**, and ${num(ans)} ${dbl?'× 2':'+ '+d} = ${num(xs[at+1])} checks it.`)};
}

// ── Number relationships: the number in brackets ──
type Rule={id:string;f:(a:number,b:number)=>number|null;say:(a:number,b:number,c:number)=>string;level:RewardGroup};
const whole=(n:number)=>Number.isInteger(n)&&n>0&&n<1000?n:null;
export const RELATION_RULES:Rule[]=[
 {id:'a×b',f:(a,b)=>whole(a*b),say:(a,b,c)=>`${a} × ${b} = ${c}`,level:'quick'},
 {id:'a+b',f:(a,b)=>whole(a+b),say:(a,b,c)=>`${a} + ${b} = ${c}`,level:'quick'},
 {id:'a−b',f:(a,b)=>whole(a-b),say:(a,b,c)=>`${a} − ${b} = ${c}`,level:'quick'},
 {id:'(a+b)×2',f:(a,b)=>whole((a+b)*2),say:(a,b,c)=>`(${a} + ${b}) × 2 = ${c}`,level:'standard'},
 {id:'a×b+1',f:(a,b)=>whole(a*b+1),say:(a,b,c)=>`${a} × ${b} + 1 = ${c}`,level:'standard'},
 {id:'a×b−1',f:(a,b)=>whole(a*b-1),say:(a,b,c)=>`${a} × ${b} − 1 = ${c}`,level:'standard'},
 {id:'2a+b',f:(a,b)=>whole(2*a+b),say:(a,b,c)=>`${a} × 2 + ${b} = ${c}`,level:'standard'},
 {id:'a+2b',f:(a,b)=>whole(a+2*b),say:(a,b,c)=>`${a} + ${b} × 2 = ${c}`,level:'standard'},
 {id:'(a+b)÷2',f:(a,b)=>whole((a+b)/2),say:(a,b,c)=>`(${a} + ${b}) ÷ 2 = ${c}`,level:'standard'},
 {id:'a×b÷2',f:(a,b)=>whole(a*b/2),say:(a,b,c)=>`${a} × ${b} ÷ 2 = ${c}`,level:'standard'},
 {id:'a÷b',f:(a,b)=>whole(a/b),say:(a,b,c)=>`${a} ÷ ${b} = ${c}`,level:'standard'},
 {id:'(a−b)×2',f:(a,b)=>whole((a-b)*2),say:(a,b,c)=>`(${a} − ${b}) × 2 = ${c}`,level:'standard'},
 {id:'(a−b)×3',f:(a,b)=>whole((a-b)*3),say:(a,b,c)=>`(${a} − ${b}) × 3 = ${c}`,level:'challenge'},
 {id:'a×a+b',f:(a,b)=>whole(a*a+b),say:(a,b,c)=>`${a} × ${a} + ${b} = ${c}`,level:'challenge'},
 {id:'a×b+a',f:(a,b)=>whole(a*b+a),say:(a,b,c)=>`${a} × ${b} + ${a} = ${c}`,level:'challenge'},
 {id:'(a+b)×3',f:(a,b)=>whole((a+b)*3),say:(a,b,c)=>`(${a} + ${b}) × 3 = ${c}`,level:'challenge'},
];
const REL_PLAN=['a×b','a+b','(a+b)×2','a−b','a×b+1','2a+b','a÷b','(a+b)÷2','a×b−1','(a−b)×2','a×a+b','a×b÷2','a+2b','(a−b)×3','a×b+a','a×b','(a+b)×3','a−b','2a+b','a×b−1'];
function numberRelation(r:Rng,i:number):Draft|null{
 const rule=RELATION_RULES.find(x=>x.id===sched(REL_PLAN,i))!;
 const pick=()=>{const a=r.int(2,12),b=r.int(2,12);return rule.id==='a÷b'?[a*b,b]:rule.id.includes('−')&&!rule.id.includes('×b−')?[Math.max(a,b)+r.int(1,6),Math.min(a,b)]:[a,b];};
 const groups=[pick(),pick(),pick()];if(new Set(groups.map(g=>g.join(','))).size<3||groups.some(([a,b])=>a===b))return null;
 const cs=groups.map(([a,b])=>rule.f(a,b));if(cs.some(c=>c===null))return null;
 const ans=cs[2]!;
 // Fair only if every rule that fits both examples gives the same answer.
 for(const other of RELATION_RULES){const fits=groups.slice(0,2).every(([a,b],k)=>other.f(a,b)===cs[k]);if(fits&&other.f(groups[2][0],groups[2][1])!==ans)return null;}
 const [a,b]=groups[2];
 const others=[...new Set(RELATION_RULES.filter(x=>x.id!==rule.id).map(x=>x.f(a,b)).filter((v):v is number=>v!==null&&v!==ans))].sort((p,q)=>Math.abs(p-ans)-Math.abs(q-ans)).slice(0,2);
 const wrong=pickWrong(num(ans),numbers([...others,ans+1,ans-1,ans+2,ans-2]));if(!wrong)return null;
 const lines=groups.map(([x,y],k)=>k<2?`${x} (${cs[k]}) ${y}`:`${x} ( ? ) ${y}`);
 return {prompt:'In each group, the number in brackets is made from the two outside numbers in the same way. Which number belongs in the empty brackets?',stimulus:lines.join(NL),answer:num(ans),wrong,rewardGroup:rule.level,
  explanation:explain(`${rule.say(groups[0][0],groups[0][1],cs[0]!)} and ${rule.say(groups[1][0],groups[1][1],cs[1]!)}.`,`So ${rule.say(a,b,ans).replace(/= \d+$/,`= **${num(ans)}**`)}.`)};
}

// ── Letters standing for numbers ──
type Slip=[number,string];
type SumShape={id:string;n:number;text:(v:string[])=>string;f:(v:number[])=>number|null;slips:(v:number[])=>Slip[];level:RewardGroup};
const w=(n:number)=>Number.isInteger(n)&&n>0?n:null;
export const SUM_SHAPES:SumShape[]=[
 {id:'p+q',n:2,text:v=>`${v[0]} + ${v[1]}`,f:v=>w(v[0]+v[1]),slips:v=>[[v[0]*v[1],'multiplying instead of adding'],[v[0]-v[1],'taking away instead of adding']],level:'quick'},
 {id:'p−q',n:2,text:v=>`${v[0]} − ${v[1]}`,f:v=>w(v[0]-v[1]),slips:v=>[[v[0]+v[1],'adding instead of taking away'],[v[0]-v[1]+1,'counting on one too many']],level:'quick'},
 {id:'p×q',n:2,text:v=>`${v[0]} × ${v[1]}`,f:v=>w(v[0]*v[1]),slips:v=>[[v[0]+v[1],'adding instead of multiplying'],[v[0]*(v[1]-1),'counting one group too few']],level:'standard'},
 {id:'p÷q',n:2,text:v=>`${v[0]} ÷ ${v[1]}`,f:v=>w(v[0]/v[1]),slips:v=>[[v[0]-v[1],'taking away instead of dividing'],[v[0]*v[1],'multiplying instead of dividing']],level:'standard'},
 {id:'p×q−r',n:3,text:v=>`${v[0]} × ${v[1]} − ${v[2]}`,f:v=>w(v[0]*v[1]-v[2]),slips:v=>[[v[0]*(v[1]-v[2]),'taking away before multiplying'],[v[0]*v[1]+v[2],'adding instead of taking away']],level:'standard'},
 {id:'p×q+r',n:3,text:v=>`${v[0]} × ${v[1]} + ${v[2]}`,f:v=>w(v[0]*v[1]+v[2]),slips:v=>[[v[0]*(v[1]+v[2]),'adding before multiplying'],[v[0]*v[1]-v[2],'taking away instead of adding']],level:'standard'},
 {id:'p÷q+r',n:3,text:v=>`${v[0]} ÷ ${v[1]} + ${v[2]}`,f:v=>v[0]%v[1]?null:w(v[0]/v[1]+v[2]),slips:v=>[[v[0]/(v[1]+v[2]),'adding before dividing'],[v[0]/v[1]-v[2],'taking away instead of adding']],level:'standard'},
 {id:'p+q−r',n:3,text:v=>`${v[0]} + ${v[1]} − ${v[2]}`,f:v=>w(v[0]+v[1]-v[2]),slips:v=>[[v[0]+v[1]+v[2],'adding all three numbers'],[v[0]-v[1]+v[2],'mixing up the signs']],level:'standard'},
 {id:'(p+q)÷r',n:3,text:v=>`(${v[0]} + ${v[1]}) ÷ ${v[2]}`,f:v=>w((v[0]+v[1])/v[2]),slips:v=>[[v[0]+v[1]/v[2],'ignoring the brackets'],[v[0]+v[1]-v[2],'taking away instead of dividing']],level:'standard'},
 {id:'p×q÷r',n:3,text:v=>`${v[0]} × ${v[1]} ÷ ${v[2]}`,f:v=>w(v[0]*v[1]/v[2]),slips:v=>[[v[0]*v[1]-v[2],'taking away instead of dividing'],[v[0]+v[1]/v[2],'adding instead of multiplying']],level:'challenge'},
 {id:'(p−q)×r',n:3,text:v=>`(${v[0]} − ${v[1]}) × ${v[2]}`,f:v=>w((v[0]-v[1])*v[2]),slips:v=>[[v[0]-v[1]*v[2],'ignoring the brackets'],[v[0]-v[1]+v[2],'adding instead of multiplying']],level:'challenge'},
 {id:'(p+q)×r−s',n:4,text:v=>`(${v[0]} + ${v[1]}) × ${v[2]} − ${v[3]}`,f:v=>w((v[0]+v[1])*v[2]-v[3]),slips:v=>[[v[0]+v[1]*v[2]-v[3],'ignoring the brackets'],[(v[0]+v[1])*v[2]+v[3],'adding instead of taking away']],level:'challenge'},
 {id:'p×q−r−s',n:4,text:v=>`${v[0]} × ${v[1]} − ${v[2]} − ${v[3]}`,f:v=>w(v[0]*v[1]-v[2]-v[3]),slips:v=>[[v[0]*v[1]-v[2]+v[3],'adding the last number instead of taking it away'],[v[0]*(v[1]-v[2])-v[3],'taking away before multiplying']],level:'challenge'},
];
const SUM_PLAN=['p+q','p×q','p×q−r','p−q','(p+q)÷r','p÷q+r','p×q+r','p+q−r','(p+q)×r−s','p×q÷r','p÷q','p×q−r','(p−q)×r','p+q','p×q−r−s','p×q+r','(p+q)÷r','p÷q+r','p×q÷r','(p+q)×r−s'];
const LETTERS=['A','B','C','D','E'];
function letterSum(r:Rng,i:number):Draft|null{
 const shape=SUM_SHAPES.find(x=>x.id===sched(SUM_PLAN,i))!,max=shape.level==='quick'?20:12,used=r.sample(LETTERS,shape.n);
 const vals=new Map<string,number>(used.map(l=>[l,r.int(2,max)] as [string,number])),ops=used.map(l=>vals.get(l)!);
 const result=shape.f(ops);if(result===null||result>60)return null;
 const taken=()=>[...vals.values()],free=r.shuffle(LETTERS.filter(l=>!used.includes(l)));
 let ans=used.find(l=>vals.get(l)===result);if(!ans){ans=free.shift()!;vals.set(ans,result);}
 // Letters left over take the answers that common slips give, so a slip lands on a wrong letter.
 const slipped:[string,Slip][]=[];
 for(const sl of shape.slips(ops)){if(!free.length)break;if(!posInt(sl[0])||sl[0]>99||taken().includes(sl[0]))continue;const l=free.shift()!;vals.set(l,sl[0]);slipped.push([l,sl]);}
 for(let t=0;free.length&&t<50;t++){const v=r.int(2,Math.max(max,20));if(!taken().includes(v))vals.set(free.shift()!,v);}
 const values=LETTERS.map(l=>vals.get(l));if(values.some(v=>v===undefined)||new Set(values).size!==5)return null;
 const expr=shape.text(used),withNums=shape.text(ops.map(String)),order=shape.n>2&&!shape.id.startsWith('(')&&/[×÷]/.test(shape.id)&&/[+−]/.test(shape.id);
 return {prompt:'The letters stand for numbers. Work out the calculation and give the answer as a letter.',stimulus:`${LETTERS.map(l=>`${l} = ${vals.get(l)}`).join(', ')}${NL}${expr} = ?`,answer:ans,wrong:LETTERS.filter(l=>l!==ans),order:'sorted',rewardGroup:shape.level,
  explanation:explain(`Swap each letter for its number: ${withNums}.`,`${withNums} = ${result}${order?' (multiply or divide first, then add or subtract)':shape.id.startsWith('(')?' (work out the brackets first)':''}.`,`${result} is the value of **${ans}**.`,...slipped.slice(0,1).map(([l,[v,why]])=>`- ${cap(why)} gives ${v}, which is ${l}: a common slip.`))};
}

// ── Logic ──
type Clue={kind:'before'|'after'|'justBefore'|'first'|'last'|'notEnds'|'between';x:number;y?:number};
/** How a clue reads for a race (place 0 is first). */
export function raceClue(c:Clue,names:string[]):string{
 const X=names[c.x],Y=c.y===undefined?'':names[c.y];
 switch(c.kind){
  case 'before':return `${X} finished before ${Y}.`;
  case 'after':return `${X} finished after ${Y}.`;
  case 'justBefore':return `${X} finished straight after ${Y}.`;
  case 'first':return `${X} came first.`;
  case 'last':return `${X} came last.`;
  case 'notEnds':return `${X} did not come first or last.`;
  case 'between':return `Exactly one runner finished between ${X} and ${Y}.`;
 }
}
/** Whether a clue holds when runner k finished in place pos[k] (0 = first). */
export function clueHolds(c:Clue,pos:number[]):boolean{
 const px=pos[c.x],py=c.y===undefined?-1:pos[c.y],n=pos.length;
 switch(c.kind){
  case 'before':return px<py;
  case 'after':return px>py;
  case 'justBefore':return px===py+1;
  case 'first':return px===0;
  case 'last':return px===n-1;
  case 'notEnds':return px>0&&px<n-1;
  case 'between':return Math.abs(px-py)===2;
 }
}
export function permutations(n:number):number[][]{if(n===1)return [[0]];const out:number[][]=[];for(const p of permutations(n-1))for(let k=0;k<=p.length;k++)out.push([...p.slice(0,k),n-1,...p.slice(k)]);return out;}
function randomClue(r:Rng,pos:number[]):Clue{
 const n=pos.length,x=r.int(0,n-1);let y=r.int(0,n-2);if(y>=x)y++;
 const kinds:Clue['kind'][]=['before','before','after','justBefore','between','first','last','notEnds'];
 for(let t=0;t<30;t++){const kind=r.pick(kinds),c:Clue={kind,x,y:['first','last','notEnds'].includes(kind)?undefined:y};if(kind==='justBefore'){const who=pos.indexOf(pos[x]-1);if(who<0)continue;c.y=who;}if(clueHolds(c,pos))return c;}
 return {kind:pos[x]<pos[y]?'before':'after',x,y};
}
type LogicKind='order'|'must'|'heights'|'pets';
const LOGIC_PLAN:LogicKind[]=['order','pets','must','heights','order','must','pets','heights','order','must','pets','order','must','heights','pets','order','must','heights','order','must'];
const LOGIC_LEVEL:Record<LogicKind,RewardGroup>={order:'standard',heights:'standard',pets:'standard',must:'challenge'};
export const PLACE_WORDS=['first','second','third','fourth','fifth'];
const roll=(names:string[])=>list([...names].sort());
const PETS=['cat','dog','rabbit','hamster','goldfish','tortoise'];
function logic(r:Rng,i:number):Draft|null{
 const kind=sched(LOGIC_PLAN,i),rewardGroup=LOGIC_LEVEL[kind];
 if(kind==='pets'){
  // Four friends each have a different pet; the clues say which pets some friends do not have.
  const names=r.sample(NAMES,4),pets=r.sample(PETS,4),truth=r.shuffle([0,1,2,3]),perms=permutations(4);
  const pool=r.shuffle(Array.from({length:16},(_,k)=>[k>>2,k&3] as [number,number]).filter(([f,p])=>truth[f]!==p)),clues:[number,number][]=[];
  const fits=(perm:number[])=>clues.every(([f,p])=>perm[f]!==p);
  for(const c of pool){if(perms.filter(fits).length===1)break;clues.push(c);}
  if(perms.filter(fits).length!==1)return null;
  for(let k=clues.length-1;k>=0;k--){const c=clues.splice(k,1)[0];if(perms.filter(fits).length!==1)clues.splice(k,0,c);}
  const askPet=r.int(0,3),owner=truth.indexOf(askPet),the=(p:number)=>`the ${pets[p]}`;
  const lines=names.map((nm,f)=>{const not=clues.filter(c=>c[0]===f).map(c=>c[1]);return not.length?`${nm} does not have ${list(not.map(the),'or')}.`:'';}).filter(Boolean);
  if(lines.length<3)return null;
  return {prompt:`${roll(names)} each have a different pet: ${list(pets.map(p=>`a ${p}`))}. Who has the ${pets[askPet]}?`,stimulus:lines.join(NL),answer:names[owner],wrong:names.filter((_,k)=>k!==owner),rewardGroup,
   explanation:explain('Draw a grid of friends and pets, and cross out each pet that a clue rules out.','When a friend has only one pet left, it must be theirs, so cross that pet out for everyone else.',`Only one way works: ${names.map((nm,k)=>`${nm} has the ${pets[truth[k]]}`).join(', ')}.`,`So the ${pets[askPet]} belongs to **${names[owner]}**.`)};
 }
 if(kind==='heights'){
  const n=5,names=r.sample(NAMES,n),order=r.shuffle([0,1,2,3,4]),rank=Array(n);order.forEach((k,j)=>rank[k]=j);// rank 0 = tallest
  const perms=permutations(n),clues:[number,number][]=[];// [taller, shorter]
  const fits=(rk:number[])=>clues.every(([a,b])=>rk[a]<rk[b]);
  for(let t=0;t<40&&perms.filter(fits).length>1;t++){const a=r.int(0,n-1),b=r.int(0,n-1);if(a===b||clues.some(([x,y])=>x===a&&y===b||x===b&&y===a))continue;const c:[number,number]=rank[a]<rank[b]?[a,b]:[b,a];const before=perms.filter(fits).length;clues.push(c);if(perms.filter(fits).length===before)clues.pop();}
  if(perms.filter(fits).length!==1||clues.length>6)return null;
  const askRank=r.int(0,n-1),who=order[askRank],askText=askRank===0?'the tallest':askRank===n-1?'the shortest':`the ${PLACE_WORDS[askRank]} tallest`;
  const text=clues.map(([a,b])=>r.chance(.5)?`${names[a]} is taller than ${names[b]}.`:`${names[b]} is shorter than ${names[a]}.`);
  return {prompt:`${roll(names)} compare their heights. No two of them are the same height. Who is ${askText}?`,stimulus:text.join(NL),answer:names[who],wrong:names.filter((_,k)=>k!==who),rewardGroup,
   explanation:explain('Put the friends in order, tallest first, using each clue in turn.',`Only one order fits every clue: ${order.map(k=>names[k]).join(', ')} (tallest to shortest).`,`So ${askText} is **${names[who]}**.`)};
 }
 // Races: five runners.
 const n=5,names=r.sample(NAMES,n),order=r.shuffle([0,1,2,3,4]),pos=Array(n);order.forEach((k,j)=>pos[k]=j);
 const perms=permutations(n).map(p=>{const q=Array(n);p.forEach((k,j)=>q[k]=j);return q;});// q[runner] = place
 const clues:Clue[]=[],alive=()=>perms.filter(q=>clues.every(c=>clueHolds(c,q)));
 const want=kind==='order'?1:r.int(2,4);
 for(let t=0;t<60&&alive().length>want;t++){const c=randomClue(r,pos),before=alive().length;clues.push(c);const now=alive().length;if(now===before||now<want)clues.pop();}
 const left=alive();if(left.length!==want||clues.length>6)return null;
 if(kind==='order'){
  for(let k=clues.length-1;k>=0;k--){const c=clues.splice(k,1)[0];if(alive().length!==1)clues.splice(k,0,c);}
  const askPlace=r.int(0,n-1),who=order[askPlace];
  return {prompt:`${roll(names)} ran a race. Nobody finished at the same time as anyone else. Who finished ${PLACE_WORDS[askPlace]}?`,stimulus:clues.map(c=>raceClue(c,names)).join(NL),answer:names[who],wrong:names.filter((_,k)=>k!==who),rewardGroup,
   explanation:explain('Use each clue to place the runners, starting with the clues that fix a runner\'s place.',`Only one finishing order fits every clue: ${order.map(k=>names[k]).join(', ')} (first to last).`,`So **${names[who]}** finished ${PLACE_WORDS[askPlace]}.`)};
 }
 // Which statement must be true?
 type St={text:string;holds:(q:number[])=>boolean};
 const statements:St[]=[];
 for(let a=0;a<n;a++){
  statements.push({text:`${names[a]} came first.`,holds:q=>q[a]===0},{text:`${names[a]} came last.`,holds:q=>q[a]===n-1});
  for(let p=1;p<n-1;p++)statements.push({text:`${names[a]} came ${PLACE_WORDS[p]}.`,holds:q=>q[a]===p});
  for(let b=0;b<n;b++)if(a!==b)statements.push({text:`${names[a]} finished before ${names[b]}.`,holds:q=>q[a]<q[b]});
 }
 // Statements that only repeat one clue are left out: they would need no reasoning.
 const said=new Set(clues.flatMap(c=>[raceClue(c,names),...(c.kind==='after'||c.kind==='justBefore'?[`${names[c.y!]} finished before ${names[c.x]}.`]:[]),...(c.kind==='first'?names.map(o=>`${names[c.x]} finished before ${o}.`):[]),...(c.kind==='last'?names.map(o=>`${o} finished before ${names[c.x]}.`):[])])),fresh=statements.filter(s=>!said.has(s.text));
 const must=fresh.filter(s=>left.every(s.holds)),could=fresh.filter(s=>left.some(s.holds)&&!left.every(s.holds)),never=fresh.filter(s=>!left.some(s.holds));
 if(!must.length||could.length<2)return null;
 const ansSt=r.pick(must),wrongSt=[...r.sample(could,Math.min(3,could.length)),...r.sample(never,4)].slice(0,4);if(wrongSt.length<4)return null;
 return {prompt:`${roll(names)} ran a race. Nobody finished at the same time as anyone else. Which statement must be true?`,stimulus:clues.map(c=>raceClue(c,names)).join(NL),answer:ansSt.text,wrong:wrongSt.map(s=>s.text),rewardGroup,
  explanation:explain(`The clues allow ${left.length} possible finishing orders:`,...left.map(q=>'- '+[...names].sort((x,y)=>q[names.indexOf(x)]-q[names.indexOf(y)]).join(', ')),`"${ansSt.text.replace(/\.$/,'')}" is true in every one of them, so it must be true.`,'The other statements are true in only some of the orders, or in none.')};
}

// ── Helpsheets ──
const seqSheet:Helpsheet={intro:'In a number series, each number follows from the ones before it by a rule. Find the rule, then use it.',
 steps:['Work out the difference between each pair of neighbouring numbers.','If the differences are the same, keep adding (or taking away) that amount.','If they change, look at how they change, or try multiplying or dividing.','Check for two series taking turns, or each number being the sum of the two before it.','Test your rule on every number before choosing an answer.'],
 example:{title:'Example: 2, 5, 11, 20, 32, ?',lines:['The differences are +3, +6, +9, +12.','They go up by 3 each time, so the next difference is +15.','32 + 15 = 47.']},
 tips:['Write the differences above the gaps between the numbers.','Big jumps often mean multiplying rather than adding.']};
const relationSheet:Helpsheet={intro:'In each group, the number in brackets is made from the two outside numbers by the same rule. Find the rule from the complete groups.',
 steps:['Take the first group and try simple rules: add, take away, multiply, divide.','If none works, try a rule with two steps, such as multiply and then add 1.','Check the rule works for the second group as well.','Use the rule on the last group.'],
 example:{title:'Example: 9 (4) 1    13 (6) 1    15 ( ? ) 3',lines:['9 + 1 = 10 and half of 10 is 5, not 4. 9 − 1 = 8 and half of 8 is 4. ✓','13 − 1 = 12 and half of 12 is 6. ✓','So (15 − 3) ÷ 2 = 6.']},
 tips:['Always test your rule on both complete groups; a rule that only fits one group is wrong.','Watch the order: left number first.']};
const sumSheet:Helpsheet={intro:'Each letter stands for a number. Swap the letters for their numbers, work out the calculation, then turn the answer back into a letter.',
 steps:['Write the number under each letter in the calculation.','Work out any brackets first, then multiply or divide, then add or subtract.','Find the letter whose number matches your answer.'],
 example:{title:'Example: P = 3, Q = 4, R = 7, S = 12, T = 5.   Q × P − T = ?',lines:['Q × P − T = 4 × 3 − 5.','4 × 3 = 12, then 12 − 5 = 7.','7 is R, so the answer is R.']},
 tips:['Multiply or divide before you add or subtract, unless there are brackets.','Check your answer really is one of the letters\' numbers.']};
const logicSheet:Helpsheet={intro:'Logic problems give you clues. Use every clue to find the one answer that must be right.',
 steps:['Start with the clues that tell you something exact, such as who came first.','Draw a line of places or a grid, and fill it in as you go.','Use each "before", "after" or "does not" clue to rule things out.','For "must be true" questions, check that the statement is true in every possible arrangement, not just one.'],
 example:{title:'Example: Kit finished before Sam. Jo finished after Sam. Who came first of the three?',lines:['Kit is before Sam, and Sam is before Jo.','So the order is Kit, Sam, Jo.','Kit came first.']},
 tips:['"Could be true" is not the same as "must be true".','Cross things out on a grid rather than keeping them in your head.']};

export const vrLogicTopics=[
 build(vrTopic('number-sequences',S,'Number sequences',seqSheet),20,numberSequence),
 build(vrTopic('number-relations',S,'Number relationships',relationSheet),20,numberRelation),
 build(vrTopic('letter-sums',S,'Letters for numbers',sumSheet),20,letterSum),
 build(vrTopic('logic',S,'Logic problems',logicSheet),20,logic),
];
