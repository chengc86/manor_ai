import {num,explain,bullets,NAMES,list,cap,words,gcd,type Topic,type BuiltTopic,type Rng} from './bank-kit';
import {shape,type Visual,type Mark} from './visual';
import {topicSet,choices,pick,words4,fig,text,tidy,sum,range,gbp,moneyChoices,boxRows,calc,type Template} from './bank-maths-util';
// Maths, Ratio and algebra strand: ratio and proportion, expressions, equations, sequences, function machines.

// ───────────────────────── Ratio and proportion
const ratio:Topic={id:'ma-ratio',subject:'Maths',strand:'Ratio and algebra',title:'Ratio and proportion',helpsheet:{
 intro:'A ratio compares the sizes of parts. 2 : 3 means that for every 2 of the first thing there are 3 of the second.',
 steps:['Add the numbers in the ratio to find the total number of equal parts: 2 : 3 has 5 parts.','Divide the total amount by the number of parts to find one part.','Multiply to find each share.','For recipes and prices, find the amount for one first, then multiply. This is called the unitary method.'],
 example:{title:'Share £40 in the ratio 3 : 5',visual:boxRows([{label:'Kai',boxes:3,texts:['£5','£5','£5']},{label:'Lina',boxes:5,texts:['£5','£5','£5','£5','£5']}],{right:'£40',alt:'A bar model with 3 equal boxes for Kai and 5 for Lina, £40 in total'}),lines:['3 + 5 = 8 equal parts.','£40 ÷ 8 = £5 in each part.','Kai gets 3 × £5 = £15 and Lina gets 5 × £5 = £25.']},
 tips:['Order matters: 2 : 3 is not the same as 3 : 2.','Simplify a ratio by dividing both numbers by a common factor: 6 : 9 = 2 : 3.','In the ratio 2 : 3, the first share is 2/5 of the total, not 2/3.'],
}};
const THINGS=[['stickers','sticker'],['marbles','marble'],['sweets','sweet'],['cards','card'],['beads','bead'],['stamps','stamp']] as const;
const raShare:Template=r=>{
 const a=r.int(1,5),b=r.int(2,7);if(a===b||gcd(a,b)!==1)return null;const one=r.int(3,12),T=(a+b)*one,[p,q]=r.sample(NAMES,2),[things]=r.pick(THINGS),askB=r.chance(.6);
 const ans=(askB?b:a)*one,c=choices(ans,[(askB?a:b)*one,one,T/2,T-one,T/(askB?b:a),ans+one].filter(x=>Number.isInteger(x)));if(!c)return null;
 return {...c,prompt:`${p} and ${q} share ${T} ${things} in the ratio ${a} : ${b}. How many ${things} does ${askB?q:p} get?`,
  visual:boxRows([{label:p,boxes:a},{label:q,boxes:b}],{right:String(T),alt:`A bar model with ${a} equal boxes for ${p} and ${b} for ${q}`}),
  explanation:explain(bullets(`${a} + ${b} = ${a+b} equal parts.`,`${T} ÷ ${a+b} = ${one} in each part.`,`${askB?q:p} has ${askB?b:a} parts: ${askB?b:a} × ${one} = ${ans}.`),`Check: ${a*one} + ${b*one} = ${T}.`),
  audit:{k:'expr',e:`${T}/(${a}+${b})*${askB?b:a}`}};
};
const raCounters:Template=r=>{
 const a=r.int(2,8),b=r.int(2,8),k=r.pick([1,2,2,3]);if(a===b||(a+b)*k>24)return null;const A=a*k,B=b*k,g=gcd(A,B),sa=A/g,sb=B/g;
 const cells=r.shuffle([...Array(A).fill('black'),...Array(B).fill('white')]),per=Math.min(12,A+B),m:Mark[]=cells.map((f,i)=>({t:'circle',x:26+(i%per)*38,y:26+Math.floor(i/per)*38,r:15,fill:f as 'black'|'white',w:2}));
 const visual=fig(16+per*38,16+Math.ceil((A+B)/per)*38,m,`${A+B} counters, some black and some white`);
 const R=(x:number,y:number)=>`${x} : ${y}`,o=pick<[number,number]>([sa,sb],[[sb,sa],[sa,sa+sb],[A,B],[sb,sa+sb]],x=>R(x[0],x[1]),x=>`${x[0]*1000/(x[0]+x[1])}`);
 if(!o)return null;
 return {...o,prompt:'What is the ratio of **black** counters to **white** counters, in its simplest form?',rewardGroup:'quick',visual,
  explanation:explain(bullets(`There are ${A} black and ${B} white counters: ${R(A,B)}.`,g>1?`Divide both by ${g}: ${R(sa,sb)}.`:`${A} and ${B} have no common factor, so ${R(A,B)} is already in its simplest form.`),`${R(sa,sa+sb)} compares black with all the counters, which is not what was asked.`),
  audit:{k:'ratioCounters'}};
};
const raRecipe:Template=r=>{
 const n1=r.pick([2,4,5,6]),n2=r.pick([3,8,10,12,15]);if(n1===n2)return null;
 const [ing,unit,per]=r.pick([['flour','g',r.int(2,8)*25],['milk','ml',r.int(2,6)*25],['sugar','g',r.int(1,5)*20],['oats','g',r.int(2,6)*20]] as const),amount=per*n1,one=per,ans=per*n2;
 const c=choices(ans,[amount+(n2-n1),amount*n2,one*(n2-n1),amount*2],x=>`${num(x)} ${unit}`);if(!c)return null;
 return {...c,prompt:`A recipe for ${n1} people uses ${num(amount)} ${unit} of ${ing}. How much ${ing} is needed for ${n2} people?`,
  explanation:explain(bullets(`For 1 person: ${num(amount)} ÷ ${n1} = ${num(one)} ${unit}`,`For ${n2} people: ${num(one)} × ${n2} = ${num(ans)} ${unit}`),`Adding ${n2-n1} to the amount (${num(amount+(n2-n1))} ${unit}) does not keep the recipe in proportion.`),
  audit:{k:'expr',e:`${amount}/${n1}*${n2}`}};
};
const raUnitary:Template=r=>{
 const n1=r.int(3,8),n2=r.int(2,12);if(n1===n2)return null;const unit=r.int(15,95),total=unit*n1,ans=unit*n2,[item]=r.pick([['pens'],['notebooks'],['glue sticks'],['rulers'],['badges']]);
 const c=moneyChoices(ans/100,[(total+(n2-n1)*100)/100,total*n2/100,Number.isInteger(total/n2)?total/n2*n1/100:(ans+unit)/100,(ans-unit)/100],true);if(!c)return null;
 return {...c,prompt:`${n1} ${item} cost ${gbp(total/100,true)}. How much do ${n2} ${item} cost?`,
  explanation:explain(bullets(`One costs ${gbp(total/100,true)} ÷ ${n1} = ${gbp(unit/100,true)}`,`${n2} cost ${n2} × ${gbp(unit/100,true)} = ${gbp(ans/100,true)}`),'Find the cost of one first, then multiply.'),
  audit:{k:'expr',e:`${total/100}/${n1}*${n2}`}};
};
const raDifference:Template=r=>{
 const a=r.int(2,6),b=r.int(a+2,9);if(gcd(a,b)!==1)return null;const one=r.int(2,9),diff=(b-a)*one,total=(a+b)*one,[x,y]=r.pick([['boys','girls'],['cats','dogs'],['red cars','blue cars'],['fiction books','non-fiction books']]);
 const c=choices(total,[diff*(a+b),diff+a+b,a*diff+b*diff-diff,b*one]);if(!c)return null;
 return {...c,prompt:`The ratio of ${x} to ${y} is ${a} : ${b}. There are ${diff} more ${y} than ${x}. How many ${x} and ${y} are there altogether?`,rewardGroup:'challenge',
  visual:boxRows([{label:cap(x),boxes:a},{label:cap(y),boxes:b,shade:0}],{alt:`A bar model with ${a} equal boxes for ${x} and ${b} for ${y}`}),
  explanation:explain(bullets(`${cap(y)} have ${b} − ${a} = ${b-a} more part${b-a>1?'s':''} than ${x}.`,`${b-a} part${b-a>1?'s':''} = ${diff}, so 1 part = ${diff} ÷ ${b-a} = ${one}.`,`Altogether: ${a+b} parts = ${a+b} × ${one} = ${total}.`),`If you chose ${diff*(a+b)}, you treated ${diff} as one part.`),
  audit:{k:'expr',e:`${diff}/(${b}-${a})*(${a}+${b})`}};
};
const raScale:Template=(r,i)=>{
 if(i%2===0){const k=r.pick([2,5,10,20,25]),cm=tidy(r.int(3,19)/2),ans=tidy(cm*k),c=choices(ans,[tidy(cm+k),tidy(ans*10),tidy(ans/10),tidy(ans+k)].filter(x=>x>0),x=>`${num(x)} km`);if(!c)return null;
  return {...c,prompt:`On a map, 1 cm stands for ${k} km. Two villages are ${num(cm)} cm apart on the map. How far apart are they in real life?`,
   explanation:explain(bullets(`Each centimetre is ${k} km.`,`${num(cm)} × ${k} = ${num(ans)} km`)),audit:{k:'expr',e:`${cm}*${k}`}};}
 const s=r.pick([10,20,25,50]),model=r.int(8,30),real=model*s,ansM=tidy(real/100),c=choices(ansM,[real,tidy(model/s),tidy(ansM*10),tidy(ansM/10)],x=>`${num(x)} m`);if(!c)return null;
 const [thing]=r.pick([['model boat'],['model train'],['model of the manor gate'],['model bus']]);
 return {...c,prompt:`A ${thing} is built to a scale of 1 : ${s}. The model is ${model} cm long. How long is the real one, in metres?`,rewardGroup:'challenge',
  explanation:explain(bullets(`The real one is ${s} times as long: ${model} × ${s} = ${num(real)} cm.`,`${num(real)} cm = ${num(ansM)} m (divide by 100).`),`${num(real)} m forgets to change centimetres into metres.`),
  audit:{k:'expr',e:`${model}*${s}/#100`}};
};

// ───────────────────────── Expressions and substitution
const expressions:Topic={id:'ma-expressions',subject:'Maths',strand:'Ratio and algebra',title:'Algebra: expressions and substitution',helpsheet:{
 intro:'In algebra a letter stands for a number. 3n means 3 × n, and ab means a × b.',
 steps:['To substitute, replace each letter with its number, then calculate using BIDMAS.','3a means 3 × a: if a = 4, then 3a = 12, not 34.','Collect like terms: 5x + 2x = 7x, but 5x + 2y cannot be joined together.','To write an expression from a story, use a letter for the unknown number: 4 boxes of n pens and 3 more pens is 4n + 3.'],
 example:{title:'Find 2p + 5q when p = 3 and q = 4',lines:['2p = 2 × 3 = 6','5q = 5 × 4 = 20','2p + 5q = 6 + 20 = 26']},
 tips:['a² means a × a, not a × 2.','Only add terms with the same letter.','Multiply out brackets: 3(x + 2) = 3x + 6, not 3x + 2.'],
}};
/** Algebra written the usual way ("3a + 2b", "2(x + 1)", "a²", "ab") → its value once the letters are replaced. */
export function substitute(expr:string,vals:Record<string,number>){let s=expr.replace(/\s+/g,'').replace(/²/g,'^2').replace(/−/g,'-');
 s=s.replace(/(\d)([a-z(])/g,'$1*$2').replace(/([a-z)])(?=[a-z(])/g,'$1*');for(const [k,v] of Object.entries(vals))s=s.replace(new RegExp(k,'g'),`(${v})`);return calc(s);}
const exSubst:Template=r=>{
 const a=r.int(2,9),b=r.int(2,9),p=r.int(2,6),q=r.int(2,6);if(a===b||p===q)return null;const form=r.int(0,5);let f:string,w:number[],shown:string,slip:string|null;
 if(form===0){f=`${p}a + ${q}b`;w=[Number(`${p}${a}`)+Number(`${q}${b}`),p+a+q+b,p*b+q*a];shown=`${p} × ${a} + ${q} × ${b} = ${p*a} + ${q*b}`;slip=`${p}a means ${p} × a, not the number ${p}${a}.`;}
 else if(form===1){f=`${p+3}a − b`;w=[Number(`${p+3}${a}`)-b,(p+3)*(a-b),(p+3)+a-b];shown=`${p+3} × ${a} − ${b} = ${(p+3)*a} − ${b}`;slip=`${p+3}a means ${p+3} × a, not the number ${p+3}${a}.`;}
 else if(form===2){f=`ab + ${q}`;w=[a+b+q,Number(`${a}${b}`)+q,a*(b+q)];shown=`${a} × ${b} + ${q} = ${a*b} + ${q}`;slip='ab means a × b.';}
 else if(form===3){f='a² + b';w=[2*a+b,(a+b)**2,a*a*b];shown=`${a} × ${a} + ${b} = ${a*a} + ${b}`;slip=`a² means ${a} × ${a}, not ${a} × 2.`;}
 else if(form===4){f=`${p}(a + b)`;w=[p*a+b,p+a+b,Number(`${p}${a}`)+b];shown=`${p} × (${a} + ${b}) = ${p} × ${a+b}`;slip='Work out the bracket first, then multiply.';}
 else{f=`${p}b − a`;w=[Number(`${p}${b}`)-a,p*a-b,p*(b-a)];shown=`${p} × ${b} − ${a} = ${p*b} − ${a}`;slip=`${p}b means ${p} × b, not the number ${p}${b}.`;}
 const ans=substitute(f,{a,b});if(ans<=0)return null;
 const c=choices(ans,w.filter(x=>x>0));if(!c)return null;
 return {...c,prompt:`What is the value of this expression when **a = ${a}** and **b = ${b}**?`,stimulus:f,rewardGroup:'quick',
  explanation:explain(bullets(`Put in the numbers: ${shown} = ${num(ans)}`),slip),
  audit:{k:'subst',vars:{a,b}}};
};
const exWrite:Template=r=>{
 const who=r.pick(NAMES),k=r.int(2,9),c0=r.int(2,9);if(k===c0)return null;const kind=r.int(0,3);let prompt:string,right:string,wrong:string[];
 if(kind===0){prompt=`A box holds n pencils. ${who} has ${k} boxes and ${c0} loose pencils. Which expression shows how many pencils ${who} has?`;right=`${k}n + ${c0}`;wrong=[`${c0}n + ${k}`,`${k}(n + ${c0})`,`n + ${k+c0}`];}
 else if(kind===1){prompt=`A bag holds b marbles. ${who} has ${k} bags but gives away ${c0} marbles. Which expression shows how many marbles ${who} has left?`;right=`${k}b − ${c0}`;wrong=[`${c0} − ${k}b`,`${k}(b − ${c0})`,`b − ${k+c0}`];}
 else if(kind===2){prompt=`A hero's shield costs s coins and a sword costs ${k} coins more than the shield. Which expression shows the total cost of one shield and one sword?`;right=`2s + ${k}`;wrong=[`s + ${k}`,`2(s + ${k})`,`${k}s + s`];}
 else{prompt=`There are r rows of chairs with ${k} chairs in each row. ${cap(words(c0))} chairs are taken away. Which expression shows how many chairs are left?`;right=`${k}r − ${c0}`;wrong=[`${c0}r − ${k}`,`r − ${k*c0}`,`${k}(r − ${c0})`];}
 const o=words4(right,wrong);if(!o)return null;
 const v=['n','b','s','r'][kind],story=kind===2?`s + s + ${k}`:right;
 return {...o,prompt,explanation:explain(bullets(kind===0?`${k} boxes of n pencils is ${k}n; add the ${c0} loose ones: ${right}.`:kind===1?`${k} bags of b marbles is ${k}b; take away ${c0}: ${right}.`:kind===2?`The sword costs s + ${k}. Shield and sword together: s + s + ${k} = ${right}.`:`${k} chairs in each of r rows is ${k}r; take away ${c0}: ${right}.`),`Try a number to check: if ${v} = 10, ${right} gives ${substitute(right,{[v]:10})}.`),
  audit:{k:'exprMatch',e:story,v}};
};
const exSimplify:Template=r=>{
 const a=r.int(2,7),b=r.int(1,a-1),c=r.int(1,6),d=r.int(1,6),x=r.pick(['x','p','m']),y=r.pick(['y','q','n']);
 const s=`${a}${x} + ${c}${y} − ${b===1?'':b}${x} + ${d}${y}`,A=a-b,C=c+d,term=(k:number,v:string)=>k===1?v:`${k}${v}`;
 const right=`${term(A,x)} + ${term(C,y)}`,wrong=[`${term(a+b,x)} + ${term(C,y)}`,`${term(A,x)} + ${term(Math.abs(c-d)||C+1,y)}`,`${A+C}${x}${y}`,`${term(a+b,x)} + ${term(Math.abs(c-d)||C+2,y)}`];
 const o=words4(right,wrong);if(!o)return null;
 return {...o,prompt:'Simplify this expression by collecting like terms.',stimulus:s,
  explanation:explain(bullets(`${x} terms: ${a}${x} − ${b===1?'':b}${x} = ${term(A,x)}`,`${y} terms: ${c}${y} + ${d}${y} = ${term(C,y)}`,`Answer: ${right}`),`Only terms with the same letter can be put together, so ${A+C}${x}${y} is wrong.`),
  audit:{k:'exprEquiv',vars:[x,y]}};
};
const exFormula:Template=r=>{
 const [what,letter,fixed,rate,unit]=r.pick([['hire a bike','h',r.int(3,8),r.int(2,6),'hours'],['hire a rowing boat','h',r.int(4,10),r.int(3,8),'hours'],['park at the manor','h',r.int(1,3),r.int(1,3),'hours'],['book a bouncy castle','d',r.int(10,30),r.int(15,40),'days']] as const),n=r.int(2,6),ans=fixed+rate*n;
 const c=moneyChoices(ans,[(fixed+rate)*n,rate*n,fixed*n+rate,fixed+rate+n]);if(!c)return null;
 return {...c,prompt:`The cost in pounds to ${what} is C = ${fixed} + ${rate}${letter}, where ${letter} is the number of ${unit}. How much does it cost for ${n} ${unit}?`,
  explanation:explain(bullets(`Put ${letter} = ${n} into the formula.`,`C = ${fixed} + ${rate} × ${n} = ${fixed} + ${rate*n} = ${ans}`),`So it costs £${ans}. Multiply before you add.`),
  audit:{k:'expr',e:`${fixed}+${rate}*${n}`}};
};
const exPerimeter:Template=r=>{
 const p=r.int(2,5),q=r.int(1,6),kind=r.int(0,1);let sides:[string,string],right:string,wrong:string[];
 if(kind===0){sides=[`${p}x`,`x + ${q}`];right=`${2*p+2}x + ${2*q}`;wrong=[`${p+1}x + ${q}`,`${2*p+2}x + ${q}`,`${2*p}x + ${2*q}`];}
 else{sides=[`${p}y + ${q}`,`2y`];right=`${2*p+4}y + ${2*q}`;wrong=[`${p+2}y + ${q}`,`${2*p+4}y + ${q}`,`${2*p+2}y + ${2*q}`];}
 const W=240,H=130,m:Mark[]=[{t:'rect',x:40,y:30,w:W,h:H,fill:'pale',sw:2.2},text(40+W/2,22,sides[0],16,{bold:true}),text(40+W+10,30+H/2+5,sides[1],16,{bold:true,anchor:'start'})];
 const o=words4(right,wrong);if(!o)return null;
 return {...o,prompt:'Which expression shows the **perimeter** of this rectangle?',visual:fig(W+140,H+60,m,'A rectangle with its length and width written as expressions'),
  explanation:explain(bullets('The perimeter is the distance all the way round: two lengths and two widths.',`2 × (${sides[0]}) + 2 × (${sides[1]}) = ${right}`),`${wrong[0]} is only half of the way round.`),
  audit:{k:'perimeterExpr',sides}};
};
const exExpand:Template=r=>{
 const k=r.int(2,6),a=r.int(2,5),b=r.int(1,9),v=r.pick(['n','x','t']),s=`${k}(${a}${v} + ${b})`,right=`${k*a}${v} + ${k*b}`;
 const o=words4(right,[`${k*a}${v} + ${b}`,`${k+a}${v} + ${k+b}`,`${a}${v} + ${k*b}`,`${k*a}${v} + ${k*b+1}`]);if(!o)return null;
 return {...o,prompt:'Which expression is equivalent to this one?',stimulus:s,
  explanation:explain(bullets(`Multiply everything inside the bracket by ${k}.`,`${k} × ${a}${v} = ${k*a}${v} and ${k} × ${b} = ${k*b}`,`${s} = ${right}`),`${k*a}${v} + ${b} forgets to multiply the ${b} by ${k}.`),
  audit:{k:'exprEquiv',vars:[v]}};
};

// ───────────────────────── Equations
const equations:Topic={id:'ma-equations',subject:'Maths',strand:'Ratio and algebra',title:'Algebra: solving equations',helpsheet:{
 intro:'An equation says that two amounts are equal. Solve it by doing the same thing to both sides until the letter is on its own.',
 steps:['Undo the operations in reverse order.','For 5y − 4 = 26: add 4 to both sides (5y = 30), then divide both sides by 5 (y = 6).','Check by putting your answer back in: 5 × 6 − 4 = 26.','With two unknowns, use one fact to help with the other, or try values in a table.'],
 example:{title:'Solve 5y − 4 = 26',lines:['Add 4 to both sides: 5y = 30','Divide both sides by 5: y = 6','Check: 5 × 6 − 4 = 30 − 4 = 26']},
 tips:['Whatever you do to one side, do to the other.','Undo the last operation first.','For 4(t − 3) = 28, divide both sides by 4 first: t − 3 = 7, so t = 10.'],
}};
const LETTERS=['x','n','m','p','k'];
const eqLinear:Template=r=>{
 const a=r.int(2,9),x=r.int(3,15),b=r.int(1,25),minus=r.chance(.4)&&a*x>b,c=minus?a*x-b:a*x+b,v=r.pick(LETTERS);
 const s=`${a}${v} ${minus?'−':'+'} ${b} = ${c}`,w=[minus?c+b:c-b,minus?(c-b)/a:(c+b)/a,c/a,x+1].filter(y=>Number.isInteger(y)&&y>0);
 const o=choices(x,w);if(!o)return null;
 return {...o,prompt:`Solve the equation. What is ${v}?`,stimulus:s,
  explanation:explain(bullets(minus?`Add ${b} to both sides: ${a}${v} = ${c+b}`:`Take ${b} from both sides: ${a}${v} = ${c-b}`,`Divide both sides by ${a}: ${v} = ${x}`),`Check: ${a} × ${x} ${minus?'−':'+'} ${b} = ${c}.`),
  audit:{k:'solve',v}};
};
const eqTwo:Template=r=>{
 const a=r.int(3,15),b=r.int(1,a-1),kind=r.int(0,1);let eqs:string[],w:[number,number][];
 if(kind===0){eqs=[`a + b = ${a+b}`,`a − b = ${a-b}`];w=[[b,a],[a+1,b-1],[a-1,b+1],[a+2,b-2]];}
 else{eqs=[`2a + b = ${2*a+b}`,`a + b = ${a+b}`];w=[[b,a],[a+1,b-1],[a-1,b+1],[a+2,b-2]];}
 const f=(p:[number,number])=>`a = ${p[0]}, b = ${p[1]}`,o=pick<[number,number]>([a,b],w.filter(p=>p[0]>0&&p[1]>0),f,f);if(!o)return null;
 return {...o,prompt:'Find the values of a and b.',stimulus:eqs.join('\n'),rewardGroup:'challenge',
  explanation:explain(bullets(...(kind===0?[`Add the two equations: 2a = ${2*a}, so a = ${a}.`,`Then b = ${a+b} − ${a} = ${b}.`]:[`Take the second equation from the first: a = ${2*a+b} − ${a+b} = ${a}.`,`Then b = ${a+b} − ${a} = ${b}.`])),`Check both: ${eqs.map(e=>e.replace(/2a/,`2 × ${a}`).replace(/\ba\b/g,String(a)).replace(/\bb\b/g,String(b))).join(' and ')}.`),
  audit:{k:'system'}};
};
const eqThink:Template=r=>{
 const who=r.pick(NAMES),x=r.int(3,20),m=r.int(2,6),k=r.int(2,15),kind=r.int(0,2);let text0:string,out:number,w:number[];
 if(kind===0){out=x*m-k;if(out<=0)return null;text0=`multiplies it by ${m}, then subtracts ${k}`;w=[(out-k)/m,out*m+k,out+k,(out+k)/m+1];}
 else if(kind===1){out=x*m+k;text0=`multiplies it by ${m}, then adds ${k}`;w=[(out+k)/m,out*m-k,out-k,(out-k)/m+1];}
 else{out=(x+k)*m;text0=`adds ${k}, then multiplies the answer by ${m}`;w=[out/m+k,out-k,out/m,x+k];}
 const c=choices(x,w.filter(y=>Number.isInteger(y)&&y>0));if(!c)return null;
 return {...c,prompt:`${who} thinks of a number. ${who} ${text0}. The answer is ${out}. What number did ${who} think of?`,
  explanation:explain(bullets('Work backwards, undoing each step in reverse order.',...(kind===0?[`Add ${k}: ${out} + ${k} = ${out+k}`,`Divide by ${m}: ${out+k} ÷ ${m} = ${x}`]:kind===1?[`Subtract ${k}: ${out} − ${k} = ${out-k}`,`Divide by ${m}: ${out-k} ÷ ${m} = ${x}`]:[`Divide by ${m}: ${out} ÷ ${m} = ${out/m}`,`Subtract ${k}: ${out/m} − ${k} = ${x}`])),`Check: start with ${x} and follow the steps to get ${out}.`),
  audit:{k:'think'}};
};
/** Rows of shapes adding up to a total: each row is a group of shape marks followed by "= total". */
function shapeSums(rows:{tri:number;circ:number;total:number}[]):Visual{
 const m:Mark[]=[];rows.forEach((row,j)=>{const y=34+j*56,g:Mark[]=[];let x=30;const items=[...Array(row.tri).fill('triangle'),...Array(row.circ).fill('circle')];
  items.forEach((s,k)=>{g.push(shape(s as 'triangle'|'circle',{x,y,size:17,fill:s==='triangle'?'yellow':'blue'}));if(k<items.length-1)g.push(text(x+32,y+7,'+',22,{bold:true}));x+=64;});
  g.push(text(x-20,y+7,`= ${row.total}`,20,{bold:true,anchor:'start'}));m.push({t:'g',marks:g});});
 return fig(30+64*Math.max(...rows.map(r=>r.tri+r.circ))+70,20+rows.length*56,m,'Rows of triangles and circles, each row with its total');
}
const eqShapes:Template=r=>{
 const t=r.int(3,12),c=r.int(2,12);if(t===c)return null;const kind=r.int(0,1),rows=kind===0?[{tri:2,circ:1,total:2*t+c},{tri:1,circ:1,total:t+c}]:[{tri:1,circ:2,total:t+2*c},{tri:3,circ:0,total:3*t}];
 const askCircle=r.chance(.5),ans=askCircle?c:t,w=askCircle?[t,rows[0].total-rows[1].total,Math.round(rows[0].total/3)]:[c,rows[1].total-c,Math.round(rows[0].total/3)];
 const ch=choices(ans,w.filter(x=>x>0));if(!ch)return null;
 return {...ch,prompt:`Each shape stands for a number. Shapes that are the same stand for the same number. What number does the **${askCircle?'circle':'triangle'}** stand for?`,visual:shapeSums(rows),rewardGroup:'challenge',
  explanation:explain(bullets(...(kind===0?[`Compare the rows: the first has one more triangle than the second.`,`So the triangle is ${rows[0].total} − ${rows[1].total} = ${t}.`,`Circle: ${rows[1].total} − ${t} = ${c}.`]:[`Three triangles make ${3*t}, so one triangle is ${3*t} ÷ 3 = ${t}.`,`Two circles: ${rows[0].total} − ${t} = ${2*c}, so one circle is ${c}.`])),`Check: put the numbers back into every row.`),
  audit:{k:'shapeSums',rows,ask:askCircle?'circle':'triangle'}};
};
const eqPairs:Template=r=>{
 const a=r.int(2,5),b=r.int(2,5),x=r.int(1,6),y=r.int(1,6),T=a*x+b*y,sol=(p:number,q:number)=>a*p+b*q===T;
 const f=(p:[number,number])=>`p = ${p[0]}, q = ${p[1]}`,cands:[number,number][]=[[y,x],[x+1,y],[x,y+1],[x+1,y-1],[x-1,y+1],[T-a*x,y],[x,T-b*y]].filter(([p,q])=>p>0&&q>0&&!sol(p,q)) as [number,number][];
 const o=pick<[number,number]>([x,y],cands,f,f);if(!o)return null;
 return {...o,prompt:`p and q are whole numbers. Which pair of values fits this equation?`,stimulus:`${a}p + ${b}q = ${T}`,
  explanation:explain(bullets(`Try each pair: p = ${x}, q = ${y} gives ${a} × ${x} + ${b} × ${y} = ${a*x} + ${b*y} = ${T}.`),'The other pairs give a different total.'),
  audit:{k:'pairs'}};
};
const eqBrackets:Template=r=>{
 const k=r.int(2,6),t=r.int(4,15),c=r.int(1,t-1),v=r.pick(['t','y','n']),s=`${k}(${v} − ${c}) = ${k*(t-c)}`,rhs=k*(t-c);
 const o=choices(t,[rhs/k,rhs-c,rhs/k-c,(rhs+c)/k].filter(x=>Number.isInteger(x)&&x>0));if(!o)return null;
 return {...o,prompt:`Solve the equation. What is ${v}?`,stimulus:s,
  explanation:explain(bullets(`Divide both sides by ${k}: ${v} − ${c} = ${rhs/k}`,`Add ${c} to both sides: ${v} = ${t}`),`Check: ${k} × (${t} − ${c}) = ${k} × ${t-c} = ${rhs}.`),
  audit:{k:'solve',v}};
};

// ───────────────────────── Sequences
const sequences:Topic={id:'ma-sequences',subject:'Maths',strand:'Ratio and algebra',title:'Sequences',helpsheet:{
 intro:'A sequence is a list of numbers that follows a rule. In a linear sequence the difference between neighbouring terms is always the same.',
 steps:['Find the difference between neighbouring terms.','To continue the sequence, keep adding (or taking away) that difference.','The nth term of a linear sequence is (difference) × n + (an adjustment). Check it with the first term.','To find a term far along, such as the 100th, put n = 100 into the rule.'],
 example:{title:'Continue 0.5, 1.25, 2, 2.75, …',lines:['The difference is 0.75 each time.','Next terms: 2.75 + 0.75 = 3.5, then 4.25.','The nth term is 0.75n − 0.25: for n = 1, 0.75 − 0.25 = 0.5.']},
 tips:['The 20th term is not double the 10th term unless the rule is just × n.','Sequences can go down, into negative numbers.','Not every sequence is linear: square numbers, doubling and adding the two previous terms are common too.'],
}};
const seqNext:Template=r=>{
 const kind=r.int(0,2);let terms:number[],d:number;
 if(kind===0){d=r.pick([-9,-7,-6,-4,-3,3,4,6,7,8,9,11,12]);const a=d<0?r.int(-5,20):r.int(-20,15);terms=range(0,4).map(k=>a+k*d);}
 else if(kind===1){d=r.pick([-0.7,-0.4,-0.3,0.2,0.3,0.4,0.6,0.7]);const a=tidy(r.int(5,60)/10);terms=range(0,4).map(k=>tidy(a+k*d));}
 else{d=r.pick([15,25,50,125,250]);const a=r.int(1,20)*d;terms=range(0,4).map(k=>a+k*d);}
 const hide=r.int(1,4),ans=terms[hide],shown=terms.map((t,k)=>k===hide?'___':num(t)).join(', ');
 const c=choices(ans,[tidy(ans+d),tidy(ans-d),tidy(ans+(d>0?1:-1)*(Math.abs(d)>1?1:0.1)),tidy(ans+2*d),tidy(-ans)].filter(x=>x!==ans),x=>num(x));if(!c)return null;
 return {...c,prompt:'What number is missing from this sequence?',stimulus:shown,rewardGroup:'quick',
  explanation:explain(bullets(`The difference between neighbouring terms is ${d>0?'+':'−'}${num(Math.abs(d))}.`,hide<4?`${num(terms[hide-1])} ${d>0?'+':'−'} ${num(Math.abs(d))} = ${num(ans)}`:`${num(terms[3])} ${d>0?'+':'−'} ${num(Math.abs(d))} = ${num(ans)}`),hide<4?`Check: ${num(ans)} ${d>0?'+':'−'} ${num(Math.abs(d))} = ${num(terms[hide+1])}.`:`Check: the jump from ${num(terms[3])} to ${num(ans)} is ${d>0?'+':'−'}${num(Math.abs(d))}, the same as the others.`),
  audit:{k:'seqMissing'}};
};
const seqNth:Template=r=>{
 const d=r.int(2,9),a=r.int(-3,12)+d,n=r.pick([10,20,25,50,100]);if(a<=0||(d===4&&a===3))return null;const terms=range(1,4).map(k=>a+(k-1)*d),ans=a+(n-1)*d;
 const c=choices(ans,[d*n,a+n*d,2*(a+(n/2-1)*d),a*n].filter(x=>x!==ans));if(!c)return null;
 return {...c,prompt:`What is the **${n}th** term of this sequence?`,stimulus:`${terms.map(x=>num(x)).join(', ')}, …`,
  explanation:explain(bullets(`The difference is ${d}, so the rule is ${d}n ${a-d>=0?'+':'−'} ${Math.abs(a-d)}${a-d===0?' (no adjustment)':''}.`,`Check with the first term: ${d} × 1 ${a-d>=0?'+':'−'} ${Math.abs(a-d)} = ${a}.`,`${n}th term: ${d} × ${n} ${a-d>=0?'+':'−'} ${Math.abs(a-d)} = ${num(ans)}`),n%2===0?`Doubling the ${n/2}th term does not work: the adjustment would be counted twice.`:a!==d?`${d} × ${n} = ${num(d*n)} forgets to ${a-d>0?'add':'take away'} ${Math.abs(a-d)}.`:null),
  audit:{k:'seqTerm',n}};
};
const seqRule:Template=r=>{
 const d=r.int(2,9),cc=r.int(-4,8);if(cc===0||d+cc<=0||(d===4&&cc===-1))return null;const terms=range(1,4).map(k=>d*k+cc),e=(p:number,q:number)=>q===0?`${p}n`:`${p}n ${q>0?'+':'−'} ${Math.abs(q)}`;
 const right=e(d,cc),o=words4(right,[`n + ${d}`,e(d,terms[0]),e(terms[0],d),e(d,-cc)!==right?e(d,-cc):e(d+1,cc)]);if(!o)return null;
 return {...o,prompt:'Which expression gives the **nth term** of this sequence?',stimulus:`${terms.join(', ')}, …`,rewardGroup:'challenge',
  explanation:explain(bullets(`The terms go up by ${d}, so the rule starts ${d}n.`,`${d} × 1 = ${d}, but the first term is ${terms[0]}, so ${cc>0?'add':'take away'} ${Math.abs(cc)}.`,`nth term = ${right}`),`Check the second term: ${d} × 2 ${cc>0?'+':'−'} ${Math.abs(cc)} = ${terms[1]}.`),
  audit:{k:'seqRule'}};
};
/** Matchstick patterns 1, 2 and 3: a row of squares or triangles. Each pattern is a group of line marks. */
function sticks(kind:'square'|'triangle',upto:number):Visual{
 const s=44,m:Mark[]=[];let x0=20;const line=(x1:number,y1:number,x2:number,y2:number):Mark=>({t:'line',x1,y1,x2,y2,w:3.5,c:'orange'});
 for(let p=1;p<=upto;p++){const g:Mark[]=[],y=s+14;
  if(kind==='square'){for(let k=0;k<p;k++){g.push(line(x0+k*s,y-s,x0+(k+1)*s,y-s),line(x0+k*s,y,x0+(k+1)*s,y));}for(let k=0;k<=p;k++)g.push(line(x0+k*s,y-s,x0+k*s,y));}
  else{// A strip of p triangles pointing up and down in turn: a zigzag of p + 1 sticks, plus the top and bottom edges.
   const h=s*.87,pt=(j:number):[number,number]=>j%2===0?[x0+(j/2)*s,y]:[x0+((j-1)/2)*s+s/2,y-h];
   for(let j=0;j<=p;j++){const [ax,ay]=pt(j),[bx,by]=pt(j+1);g.push(line(ax,ay,bx,by));}
   for(let k=0;k<Math.ceil(p/2);k++)g.push(line(x0+k*s,y,x0+(k+1)*s,y));for(let k=0;k<Math.floor(p/2);k++)g.push(line(x0+k*s+s/2,y-h,x0+(k+1)*s+s/2,y-h));}
  const wP=kind==='square'?p*s:(p+1)/2*s;
  m.push({t:'g',marks:g},text(x0+wP/2,y+26,`Pattern ${p}`,13,{bold:true}));x0+=wP+50;}
 return fig(x0-20,s+50,m,`Three matchstick patterns made of ${kind}s`);
}
const seqPattern:Template=r=>{
 const kind=r.pick(['square','triangle'] as const),n=r.pick([6,8,10,12,15,20]),d=kind==='square'?3:2,f=(k:number)=>kind==='square'?3*k+1:2*k+1,ans=f(n);
 const c=choices(ans,[(kind==='square'?4:3)*n,d*n,f(3)+n,f(n/2)*2].filter(x=>x!==ans));if(!c)return null;
 return {...c,prompt:`The patterns are made from matchsticks. How many matchsticks will there be in **pattern ${n}**?`,visual:sticks(kind,3),
  explanation:explain(bullets(`Count the matchsticks: ${f(1)}, ${f(2)}, ${f(3)}.`,`Each new ${kind} adds ${d} matchsticks, so the rule is ${d}n + 1.`,`Pattern ${n}: ${d} × ${n} + 1 = ${ans}`),`${kind==='square'?4:3} × ${n} = ${(kind==='square'?4:3)*n} counts the shared matchsticks twice.`),
  audit:{k:'seqPattern',n}};
};
const seqMember:Template=r=>{
 const d=r.int(3,9),a=r.int(1,d+6),n=r.int(12,30),ans=a+(n-1)*d,terms=range(0,3).map(k=>a+k*d),w=[ans+1,ans-1,ans+d-2,ans+Math.floor(d/2)].filter(x=>(x-a)%d!==0&&x>0);
 const c=choices(ans,w);if(!c)return null;
 return {...c,prompt:'Which of these numbers is **in** this sequence?',stimulus:`${terms.join(', ')}, …`,
  explanation:explain(bullets(`The sequence goes up by ${d} from ${a}, so every term is ${a} more than a multiple of ${d}.`,`${num(ans)} − ${a} = ${num(ans-a)}, and ${num(ans-a)} ÷ ${d} = ${(ans-a)/d}, so ${num(ans)} is a term.`),'For the others, taking away the first term does not leave a multiple of '+d+'.'),
  audit:{k:'seqMember'}};
};
const seqSpecial:Template=r=>{
 const kind=r.int(0,3);let terms:number[],next:number,rule:string,w:number[];
 if(kind===0){const s=r.int(1,5);terms=range(s,s+4).map(k=>k*k);next=(s+5)**2;rule='These are square numbers.';w=[terms[4]+(terms[4]-terms[3]),next+1,terms[4]+2*(s+4)];}
 else if(kind===1){const s=r.int(1,6),m=r.pick([2,3]);terms=range(0,4).map(k=>s*m**k);next=s*m**5;rule=`Each term is ${m===2?'double':'three times'} the one before.`;w=[terms[4]+(terms[4]-terms[3]),terms[4]+m,next/m*(m+1)];}
 else if(kind===2){const a=r.int(1,4),b=r.int(a,a+4);terms=[a,b];for(let k=2;k<5;k++)terms.push(terms[k-1]+terms[k-2]);next=terms[3]+terms[4];rule='Each term is the sum of the two terms before it.';w=[terms[4]+(terms[4]-terms[3]),next+1,terms[4]*2];}
 else{const s=r.int(0,3);terms=range(1+s,5+s).map(k=>k*(k+1)/2);next=(6+s)*(7+s)/2;rule='The differences go up by 1 each time (these are triangle numbers).';w=[terms[4]+(terms[4]-terms[3]),next+1,terms[4]+5+s];}
 const c=choices(next,w.filter(x=>x!==next&&x>0));if(!c)return null;
 return {...c,prompt:'What is the next term in this sequence?',stimulus:`${terms.map(x=>num(x)).join(', ')}, …`,
  explanation:explain(rule,bullets(`The next term is ${num(next)}.`),`${num(terms[4]+(terms[4]-terms[3]))} assumes the difference stays the same, but it does not in this sequence.`),
  audit:{k:'seqSpecial',kind:['square','geometric','fibonacci','triangle'][kind]}};
};

// ───────────────────────── Function machines
const machines:Topic={id:'ma-function-machines',subject:'Maths',strand:'Ratio and algebra',title:'Function machines',helpsheet:{
 intro:'A function machine does the same operations to every number that goes in, in the same order.',
 steps:['Follow the arrows: do each operation in turn to the input.','To find the input from the output, go backwards and use the inverse operations: + becomes −, × becomes ÷.','To find a rule from a table, look at how much the output changes when the input goes up by 1.','A machine can be written as an expression: × 4 then − 1 is 4n − 1.'],
 example:{title:'Input 6',visual:machineFigure('6',['× 2','+ 7'],'?'),lines:['6 × 2 = 12','12 + 7 = 19','The output is 19.']},
 tips:['Going backwards, undo the last operation first.','× 3 then + 4 is not the same as + 4 then × 3.','Check your answer by putting it back through the machine.'],
}};
/** IN → op boxes → OUT, drawn left to right. Texts: input, each operation, output (in that order). */
function machineFigure(input:string,ops:string[],output:string):Visual{
 const m:Mark[]=[],y=40,h=46;let x=10;const arrow=()=>{m.push({t:'line',x1:x+4,y1:y+h/2,x2:x+30,y2:y+h/2,w:2.5,arrow:'end'});x+=36;};
 const box=(s:string,w:number,fill:'white'|'yellow'|'pale',label?:string)=>{m.push({t:'rect',x,y,w,h,r:10,fill,sw:2});m.push(text(x+w/2,y+h/2+7,s,20,{bold:true}));if(label)m.push(text(x+w/2,y-10,label,13,{bold:true,c:'muted'}));x+=w;};
 box(input,70,'pale','IN');for(const o of ops){arrow();box(o,86,'yellow');}arrow();box(output,70,'pale','OUT');
 return fig(x+12,y+h+14,m,`A function machine with ${ops.length} steps`);
}
const OPS=[['×',2,9],['+',2,20],['−',1,15],['÷',2,5]] as const;
const applyOp=(v:number,op:string,k:number)=>op==='×'?v*k:op==='+'?v+k:op==='−'?v-k:v/k;
function machineOps(r:Rng):[string,number][]{const a=r.pick(OPS.filter(o=>o[0]!=='÷')),b=r.pick(OPS.filter(o=>o[0]!==a[0]));return [[a[0],r.int(a[1],a[2])],[b[0],r.int(b[1],b[2])]];}
const opText=(o:[string,number])=>`${o[0]} ${o[1]}`;
const fmForward:Template=r=>{
 const ops=machineOps(r),inp=r.int(2,15);if(ops.some(o=>o[0]==='÷'))return null;let v=inp;for(const [o,k] of ops)v=applyOp(v,o,k);if(v<0||!Number.isInteger(v)||(inp===6&&opText(ops[0])==='× 2'&&opText(ops[1])==='+ 7'))return null;
 const swapped=applyOp(applyOp(inp,ops[1][0],ops[1][1]),ops[0][0],ops[0][1]),c=choices(v,[swapped,applyOp(inp,ops[0][0],ops[0][1]),applyOp(inp,ops[1][0],ops[1][1]),v+1].filter(x=>Number.isInteger(x)&&x>=0));if(!c)return null;
 return {...c,prompt:'What number comes out of this function machine?',visual:machineFigure(String(inp),ops.map(opText),'?'),rewardGroup:'quick',
  explanation:explain(bullets(`${inp} ${opText(ops[0])} = ${applyOp(inp,ops[0][0],ops[0][1])}`,`${applyOp(inp,ops[0][0],ops[0][1])} ${opText(ops[1])} = ${v}`),`Doing the steps in the wrong order gives ${swapped}.`),
  audit:{k:'machine'}};
};
const INV:Record<string,string>={'×':'÷','÷':'×','+':'−','−':'+'};
const fmBackward:Template=r=>{
 const ops=machineOps(r),inp=r.int(2,15);let v=inp;for(const [o,k] of ops)v=applyOp(v,o,k);if(v<=0||!Number.isInteger(v))return null;
 const fwd=applyOp(applyOp(v,ops[0][0],ops[0][1]),ops[1][0],ops[1][1]),wrongOrder=applyOp(applyOp(v,INV[ops[0][0]],ops[0][1]),INV[ops[1][0]],ops[1][1]);
 const c=choices(inp,[fwd,wrongOrder,applyOp(v,INV[ops[1][0]],ops[1][1])].filter(x=>Number.isInteger(x)&&x>0));if(!c)return null;const mid=applyOp(v,INV[ops[1][0]],ops[1][1]);
 return {...c,prompt:`The output is ${v}. What was the input?`,visual:machineFigure('?',ops.map(opText),String(v)),
  explanation:explain(bullets('Work backwards with the inverse operations, starting from the output.',`${v} ${INV[ops[1][0]]} ${ops[1][1]} = ${mid}`,`${mid} ${INV[ops[0][0]]} ${ops[0][1]} = ${inp}`),`Check: put ${inp} through the machine: ${inp} ${opText(ops[0])} = ${mid}, then ${mid} ${opText(ops[1])} = ${v}.`),
  audit:{k:'machine'}};
};
const fmRule:Template=r=>{
 const m=r.int(2,6),k=r.int(1,9),i1=r.int(2,6),i2=i1+r.int(2,5),o1=m*i1+k,o2=m*i2+k,right=`× ${m} then + ${k}`;
 const cands=[[1,o1-i1],[m+1,o1-(m+1)*i1],[m-1,o1-(m-1)*i1]].filter(([a,b])=>a>0&&b!==0).map(([a,b])=>b>0?`× ${a} then + ${b}`:`× ${a} then − ${-b}`).map(s=>s.replace('× 1 then ',''));
 const fits=(s:string)=>{const parts=s.match(/(?:× (\d+) then )?([+−]) (\d+)/);if(!parts)return false;const a=Number(parts[1]??1),b=(parts[2]==='+'?1:-1)*Number(parts[3]);return a*i2+b===o2;};
 const o=words4(right,[...cands.filter(s=>!fits(s)),`+ ${o1-i1}`,`× ${m} then + ${k+1}`]);if(!o)return null;
 return {...o,prompt:`A two-step machine turns ${i1} into ${o1} and ${i2} into ${o2}. Which rule could it be?`,
  visual:{kind:'table',head:['Input','Output'],rows:[[String(i1),String(o1)],[String(i2),String(o2)]],alt:'A table of two inputs and their outputs'},rewardGroup:'challenge',
  explanation:explain(bullets(`Test each rule on both inputs.`,`${right}: ${i1} × ${m} + ${k} = ${o1} and ${i2} × ${m} + ${k} = ${o2}.`),'Some rules fit the first input but not the second.'),
  audit:{k:'machineRule'}};
};
const fmTable:Template=r=>{
 const m=r.int(2,7),k=r.int(-3,9),ins=[1,2,3,5],x=r.pick([10,12,20]),f=(n:number)=>m*n+k;if(f(1)<=0)return null;const ans=f(x);
 const c=choices(ans,[f(5)*x/5,m*x,f(ins[2])+x-3,f(x)+m].filter(y=>Number.isInteger(y)&&y!==ans));if(!c)return null;
 return {...c,prompt:`The table shows inputs and outputs of a machine. What is the output when the input is ${x}?`,
  visual:{kind:'table',head:['Input',...ins.map(String),String(x)],rows:[['Output',...ins.map(n=>String(f(n))),'?']],alt:'A table of inputs and outputs with one output missing'},
  explanation:explain(bullets(`When the input goes up by 1, the output goes up by ${m}, so the rule is × ${m} then ${k>=0?'+':'−'} ${Math.abs(k)}.`,`Check: ${m} × 1 ${k>=0?'+':'−'} ${Math.abs(k)} = ${f(1)}.`,`Input ${x}: ${m} × ${x} ${k>=0?'+':'−'} ${Math.abs(k)} = ${ans}`),c.wrong.includes(num(f(5)*x/5))?`${num(f(5)*x/5)} assumes the output is always the same multiple of the input, but the rule also ${k>0?'adds':'takes away'} ${Math.abs(k)}.`:null),
  audit:{k:'machineTable'}};
};
const fmAlgebra:Template=r=>{
 const m=r.int(2,9),k=r.int(1,9),add=r.chance(.6),e=`${m}n ${add?'+':'−'} ${k}`,o=words4(e,[`${m}(n ${add?'+':'−'} ${k})`,`n ${add?'+':'−'} ${m+k}`,`${k}n ${add?'+':'−'} ${m}`,`${m}n ${add?'−':'+'} ${k}`]);if(!o)return null;
 return {...o,prompt:'The input to this machine is n. Which expression gives the output?',visual:machineFigure('n',[`× ${m}`,`${add?'+':'−'} ${k}`],'?'),
  explanation:explain(bullets(`n × ${m} = ${m}n`,`${m}n ${add?'+':'−'} ${k}`),`${m}(n ${add?'+':'−'} ${k}) would mean ${add?'adding':'taking away'} first, then multiplying.`),
  audit:{k:'machineAlgebra'}};
};

export const algebraTopics:BuiltTopic[]=[
 topicSet(ratio,20,[raShare,raCounters,raRecipe,raUnitary,raDifference,raScale]),
 topicSet(expressions,20,[exSubst,exWrite,exSimplify,exFormula,exPerimeter,exExpand]),
 topicSet(equations,20,[eqLinear,eqTwo,eqThink,eqShapes,eqPairs,eqBrackets]),
 topicSet(sequences,20,[seqNext,seqNth,seqRule,seqPattern,seqMember,seqSpecial]),
 topicSet(machines,20,[fmForward,fmBackward,fmRule,fmTable,fmAlgebra]),
];
