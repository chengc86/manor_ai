import {num,explain,bullets,NAMES,list,cap,words,gcd,type Topic,type BuiltTopic,type Rng} from './bank-kit';
import type {Visual,Mark} from './visual';
import {topicSet,choices,pick,words4,fig,text,tidy,sum,range,roundTo,gbp,moneyChoices,shadedGrid,shadedCircle,simp,fadd,fsub,fmul,fdiv,fkey,fval,fmix,fimp,fraw,fracChoices,type Template,type Q} from './bank-maths-util';
// Maths, Fractions, decimals and percentages strand.

const lcm=(a:number,b:number)=>a*b/gcd(a,b);
const NAMES_OF:Record<number,[string,string]>={2:['half','halves'],3:['third','thirds'],4:['quarter','quarters'],5:['fifth','fifths'],6:['sixth','sixths'],7:['seventh','sevenths'],8:['eighth','eighths'],11:['eleventh','elevenths'],9:['ninth','ninths'],10:['tenth','tenths'],12:['twelfth','twelfths'],15:['fifteenth','fifteenths'],16:['sixteenth','sixteenths'],18:['eighteenth','eighteenths'],20:['twentieth','twentieths'],24:['twenty-fourth','twenty-fourths']};
/** Grid shapes for n equal cells. */
const GRID:Record<number,[number,number]>={6:[2,3],8:[2,4],9:[3,3],10:[2,5],12:[3,4],15:[3,5],16:[4,4],18:[3,6],20:[4,5],24:[4,6],25:[5,5],50:[5,10],100:[10,10]};
/** A shape split into n equal parts with k shaded: a grid (shaded cells scattered or in order) or a circle. */
function shadedShape(r:Rng,n:number,k:number,circle:boolean,alt:string):Visual{
 if(circle)return shadedCircle(n,range(0,k-1),alt);
 const [rows,cols]=GRID[n],cells=r.chance(.5)?range(0,k-1):r.sample(range(0,n-1),k);
 return shadedGrid(rows,cols,cells,alt,n>=50?Math.floor(300/cols):undefined);
}
/** Value of "3/8", "1 3/8", "0.375" or "37.5%". */
export function fdpVal(s:string){s=s.replace(/−/g,'-').trim();let m=s.match(/^(\d+) (\d+)\/(\d+)$/);if(m)return Number(m[1])+Number(m[2])/Number(m[3]);m=s.match(/^(\d+)\/(\d+)$/);if(m)return Number(m[1])/Number(m[2]);if(s.endsWith('%'))return Number(s.slice(0,-1))/100;return Number(s);}
/** Keeps wrong fraction options that look like sensible answers: positive, not a whole number, less than 2. */
const properish=(qs:Q[])=>qs.filter(q=>q[1]!==0&&q[0]/q[1]>0&&q[0]/q[1]<2&&simp(q)[1]!==1);
/** A mixed number as it is shown, for audit expressions: 11/4 → "(2+3/4)". */
const mixedExpr=(q:Q)=>{const [n,d]=simp(q),w=Math.floor(n/d),r=n%d;return w?(r?`(${w}+${r}/${d})`:`${w}`):`${r}/${d}`;};
const fracWord=(q:Q)=>{const [n,d]=simp(q);const w=NAMES_OF[d];return w?`${n} ${n===1?w[0]:w[1]}`:fraw([n,d]);};

// ───────────────────────── Equivalent fractions
const equivalent:Topic={id:'ma-equivalent-fractions',subject:'Maths',strand:'Fractions, decimals and percentages',title:'Equivalent fractions',helpsheet:{
 intro:'Equivalent fractions show the same amount with different numbers. Multiply or divide the numerator and the denominator by the same number.',
 steps:['To find an equivalent fraction, multiply the top and bottom by the same number: 2/3 = 8/12 (both × 4).','To simplify, divide the top and bottom by their highest common factor.','A fraction is in its simplest form when the top and bottom have no common factor except 1.','To change an improper fraction to a mixed number, divide: 17/5 = 3 remainder 2 = 3 2/5.'],
 example:{title:'Simplify 18/24',visual:{kind:'barModel',rows:[{label:'18/24',parts:range(1,24).map(i=>({text:'',size:1,shade:i<=18}))},{label:'3/4',parts:range(1,4).map(i=>({text:'',size:6,shade:i<=3}))}],alt:'Two bars of the same length: 18 of 24 parts shaded and 3 of 4 parts shaded'},lines:['The highest common factor of 18 and 24 is 6.','18 ÷ 6 = 3 and 24 ÷ 6 = 4, so 18/24 = 3/4.','The bars show the same amount shaded.']},
 tips:['Adding the same number to the top and bottom does not make an equivalent fraction: 2/3 is not equal to 4/5.','Whatever you do to the numerator, do the same to the denominator.','Check by cross-multiplying: 2/3 = 8/12 because 2 × 12 = 3 × 8.'],
}};
const eqPicture:Template=(r,i)=>{
 const circle=i%2===1,n=circle?r.pick([6,8,10,12]):r.pick([8,10,12,15,16,20]),k=r.int(1,n-1),g=gcd(k,n);if(g===1)return null;
 const [a,b]=simp([k,n]),ms=range(2,6).filter(m=>b*m!==n&&b*m<=40);if(!ms.length)return null;const m=r.pick(ms),ans:Q=[a*m,b*m];
 const c=fracChoices(ans,[[(b-a)*m,b*m],[k+1,n+1],[k,b*m],[n-k,n]],fraw);if(!c)return null;
 return {...c,prompt:'Which fraction is **equivalent** to the fraction of the shape that is shaded?',
  visual:shadedShape(r,n,k,circle,`A ${circle?'circle':'rectangle'} split into ${n} equal parts, some shaded`),
  explanation:explain(bullets(`${k} of the ${n} equal parts are shaded: ${k}/${n}.`,`${k}/${n} = ${a}/${b} (divide the top and bottom by ${g}).`,`${a}/${b} = ${a*m}/${b*m} (multiply the top and bottom by ${m}).`),c.wrong.includes(fraw([k+1,n+1]))?`${k+1}/${n+1} is not equivalent: adding 1 to the top and bottom changes the fraction.`:null),
  audit:{k:'shaded',as:'value'}};
};
const eqMissing:Template=r=>{
 const [a,b]=simp([r.int(1,8),r.pick([3,4,5,6,7,8,9,10,12])]);if(a>=b)return null;const m=r.int(2,9),A=a*m,B=b*m,form=r.int(0,2);
 let s:string,ans:number,w:number[];
 if(form===0){s=`${a}/${b} = ☐/${B}`;ans=A;w=[a+(B-b),m,a*B];}
 else if(form===1){s=`${a}/${b} = ${A}/☐`;ans=B;w=[b+(A-a),m,b*A];}
 else{s=`☐/${b} = ${A}/${B}`;ans=a;w=[A-(B-b),m,A*b];}
 const c=choices(ans,w.filter(x=>x>0));if(!c)return null;
 return {...c,prompt:'What number goes in the box to make the fractions equivalent?',stimulus:s,rewardGroup:'quick',
  explanation:explain(bullets(form===2?`${B} ÷ ${b} = ${m}, so the numerator was also multiplied by ${m}.`:form===0?`${b} × ${m} = ${B}, so multiply the numerator by ${m} too.`:`${a} × ${m} = ${A}, so multiply the denominator by ${m} too.`,form===2?`☐ = ${A} ÷ ${m} = ${a}`:form===0?`☐ = ${a} × ${m} = ${A}`:`☐ = ${b} × ${m} = ${B}`),`Adding ${form===1?A-a:B-b} to both top and bottom does not give an equivalent fraction.`),
  audit:{k:'box',s}};
};
const eqSimplify:Template=r=>{
 const [a,b]=simp([r.int(1,11),r.int(3,12)]);if(a>=b)return null;const m=r.int(2,9),A=a*m,B=b*m;if(B>120)return null;
 const fs=range(2,B-1).filter(f=>B%f===0&&f!==m&&A%f!==0);
 const w:Q[]=[A%2===0?[A/2,B-A/2]:[A-1,B-1],[b,a],fs.length?[a,B/fs[0]]:[a+1,b+1],[A,B-A]];
 const c=fracChoices([a,b],w.map(q=>simp(q)),fimp);if(!c)return null;
 return {...c,prompt:'Write this fraction in its **simplest form**.',stimulus:`${A}/${B}`,rewardGroup:'quick',
  explanation:explain(bullets(`The highest common factor of ${A} and ${B} is ${m}.`,`${A} ÷ ${m} = ${a} and ${B} ÷ ${m} = ${b}.`,`So ${A}/${B} = ${a}/${b}.`),`${a} and ${b} have no common factor except 1, so it cannot be simplified further.`),
  audit:{k:'simplify'}};
};
const eqNot:Template=r=>{
 const [a,b]=simp([r.int(1,7),r.pick([3,4,5,6,7,8,9])]);if(a>=b)return null;
 const ms=r.sample([2,3,4,5,6,7,8],3),k=r.int(1,4),bad:Q=r.pick([[a+k,b+k],[a*ms[0],b*ms[0]+1],[b,a],[a*ms[1],b*ms[2]]]);
 if(Math.abs(bad[0]/bad[1]-a/b)<1e-9)return null;
 const o=words4(fraw(bad),ms.map(m=>fraw([a*m,b*m])));if(!o)return null;
 return {...o,prompt:`Which fraction is **NOT** equivalent to ${a}/${b}?`,
  explanation:explain(bullets(...ms.map(m=>`${a*m}/${b*m} = ${a}/${b} (both × ${m})`)),`${fraw(bad)} is not equivalent: ${bad[0]/a===bad[1]/b?'':`the top and bottom have not been multiplied by the same number.`}`.trim()),
  audit:{k:'notEquiv',base:[a,b]}};
};
const eqMixed:Template=(r,i)=>{
 const d=r.pick([3,4,5,6,7,8,9]),w=r.int(1,6),n=r.int(1,d-1);if(gcd(n,d)!==1)return null;const top=w*d+n;
 if(i%2===0){const o=pick<string>(`${w} ${n}/${d}`,[`${w} ${n}/${top}`,`${w+1} ${d-n}/${d}`,d-n!==n&&`${w} ${d-n}/${d}`,`${w-1} ${n}/${d}`].filter((s):s is string=>!!s&&!s.startsWith('0 ')),s=>s,s=>fdpVal(s));if(!o)return null;
  return {...o,prompt:'Write this improper fraction as a mixed number.',stimulus:`${top}/${d}`,
   explanation:explain(bullets(`${top} ÷ ${d} = ${w} remainder ${n}`,`${w} whole${w===1?'':'s'} and ${n}/${d} left: ${w} ${n}/${d}`),`Check: ${w} × ${d} + ${n} = ${top}.`),
   audit:{k:'expr',e:`${top}/${d}`}};}
 const o=pick<string>(`${top}/${d}`,[`${w}${n}/${d}`,`${w*n}/${d}`,`${w+n}/${d}`,`${w*d}/${d}`],s=>s,s=>fdpVal(s));if(!o)return null;
 return {...o,prompt:'Write this mixed number as an improper fraction.',stimulus:`${w} ${n}/${d}`,
  explanation:explain(bullets(`Each whole is ${d}/${d}, so ${w} wholes are ${w} × ${d} = ${w*d} ${NAMES_OF[d][1]}.`,`${w*d} + ${n} = ${top}, so ${w} ${n}/${d} = ${top}/${d}.`),`${w}${n}/${d} just puts the digits side by side.`),
  audit:{k:'expr',e:`${w}+${n}/${d}`}};
};
const eqWall:Template=r=>{
 const [d1,d2]=r.pick([[2,8],[3,12],[4,12],[3,9],[4,16],[5,10],[2,10],[3,15],[6,12],[4,8]] as const),k=r.int(1,d1-1),ans=k*d2/d1;
 const visual:Visual={kind:'barModel',rows:[{parts:range(1,d1).map(j=>({text:`1/${d1}`,size:d2/d1,shade:j<=k}))},{parts:range(1,d2).map(()=>({text:`1/${d2}`,size:1}))}],alt:`Two bars of the same length: one split into ${NAMES_OF[d1][1]} with some shaded, one split into ${NAMES_OF[d2][1]}`};
 const c=choices(ans,[d2/d1,k+(d2-d1),d2-ans,k*d1]);if(!c)return null;
 return {...c,prompt:`The top bar shows ${k}/${d1} shaded. How many ${NAMES_OF[d2][1]} are equal to ${k}/${d1}?`,visual,
  explanation:explain(bullets(`One ${NAMES_OF[d1][0]} is the same length as ${d2/d1} ${NAMES_OF[d2][1]}.`,`${k} ${k===1?NAMES_OF[d1][0]:NAMES_OF[d1][1]} = ${k} × ${d2/d1} = ${ans} ${NAMES_OF[d2][1]}.`,`So ${k}/${d1} = ${ans}/${d2}.`),`Adding the same number to the top and bottom (${k+(d2-d1)}/${d2}) does not keep the fraction the same.`),
  audit:{k:'expr',e:`${k}/${d1}*${d2}`}};
};

// ───────────────────────── Comparing and ordering fractions
const comparing:Topic={id:'ma-compare-fractions',subject:'Maths',strand:'Fractions, decimals and percentages',title:'Comparing and ordering fractions',helpsheet:{
 intro:'To compare fractions, give them the same denominator, then compare the numerators.',
 steps:['Find a common denominator: a common multiple of the denominators.','Change each fraction to an equivalent fraction with that denominator.','Compare the numerators: the larger numerator gives the larger fraction.','If the numerators are equal, the smaller denominator gives the larger fraction: 1/5 is more than 1/8.'],
 example:{title:'Which is larger, 3/5 or 5/8?',lines:['A common denominator is 40.','3/5 = 24/40 and 5/8 = 25/40.','25/40 is more than 24/40, so 5/8 is larger.']},
 tips:['A bigger denominator means smaller pieces, not a bigger fraction.','Compare with 1/2: 4/9 is less than a half and 5/9 is more.','You can change fractions to decimals to compare them: 3/4 = 0.75.'],
}};
const FAMILIES=[[2,3,4,6,12],[2,4,8,16],[3,6,9,18],[2,5,10,20],[3,4,6,8,24]];
function fracSet(r:Rng,n:number){const fam=r.pick(FAMILIES),L=fam.at(-1)!,seen=new Set<string>(),out:Q[]=[];
 for(let t=0;t<60&&out.length<n;t++){const d=r.pick(fam.slice(0,-1).concat(fam.at(-1)!)),a=r.int(1,d-1);const k=fkey([a,d]);if(gcd(a,d)!==1||seen.has(k))continue;seen.add(k);out.push([a,d]);}
 return {fracs:out,L};}
const toL=(q:Q,L:number)=>`${q[0]}/${q[1]} = ${q[0]*L/q[1]}/${L}`;
const cmpExtreme:Template=(r,i)=>{
 const {fracs,L}=fracSet(r,4);if(fracs.length<4)return null;const big=i%2===0,vals=fracs.map(fval),best=big?Math.max(...vals):Math.min(...vals),ans=fracs[vals.indexOf(best)];
 const topN=fracs.reduce((x,y)=>y[0]>x[0]?y:x),topD=fracs.reduce((x,y)=>y[1]>x[1]?y:x);if(big&&topN===ans&&topD===ans)return null;
 const o=words4(fraw(ans),fracs.filter(f=>f!==ans).map(fraw));if(!o)return null;
 return {...o,prompt:`Which fraction is the **${big?'largest':'smallest'}**?`,
  explanation:explain(`Change them all to ${NAMES_OF[L]?.[1]??`/${L}`}:`,bullets(...fracs.map(f=>toL(f,L))),`The ${big?'largest':'smallest'} numerator is ${ans[0]*L/ans[1]}, so ${fraw(ans)} is the ${big?'largest':'smallest'}.`),
  audit:{k:'fracExtreme',dir:big?'max':'min'}};
};
const cmpSign:Template=(r,i)=>{
 let a:Q,b:Q;
 if(i%3===2){const [x,y]=simp([r.int(1,5),r.int(3,8)]);if(x>=y)return null;const m1=r.int(2,4),m2=r.int(2,5);if(m1===m2)return null;a=[x*m1,y*m1];b=[x*m2,y*m2];}
 else{const d1=r.pick([3,4,5,6,7,8,9]),d2=r.pick([4,5,6,7,8,9,10,12]);if(d1===d2)return null;a=[r.int(1,d1-1),d1];b=[r.int(1,d2-1),d2];if(Math.abs(fval(a)-fval(b))<1e-9||Math.abs(fval(a)-fval(b))>0.2)return null;}
 const L=lcm(a[1],b[1]),ans=fval(a)<fval(b)-1e-9?'<':fval(a)>fval(b)+1e-9?'>':'=';
 return {prompt:'Which sign goes in the box?',stimulus:`${fraw(a)} ☐ ${fraw(b)}`,answer:ans,wrong:['<','=','>'].filter(s=>s!==ans),order:'sorted',
  explanation:explain(bullets(`A common denominator is ${L}.`,toL(a,L),toL(b,L)),`${a[0]*L/a[1]}/${L} ${ans} ${b[0]*L/b[1]}/${L}, so ${fraw(a)} ${ans} ${fraw(b)}.`),
  audit:{k:'cmpFrac'}};
};
const cmpBetween:Template=r=>{
 const [lo,hi]=r.pick<[Q,Q]>([[[1,3],[1,2]],[[1,4],[1,3]],[[1,2],[2,3]],[[2,3],[3,4]],[[3,5],[2,3]],[[1,5],[1,4]],[[3,4],[4,5]],[[2,5],[1,2]]]);
 const cands:Q[]=[];for(let d=3;d<=15;d++)for(let a=1;a<d;a++)if(gcd(a,d)===1)cands.push([a,d]);
 const inside=cands.filter(q=>fval(q)>fval(lo)&&fval(q)<fval(hi)),outside=cands.filter(q=>(fval(q)<fval(lo)&&fval(q)>fval(lo)-0.15)||(fval(q)>fval(hi)&&fval(q)<fval(hi)+0.15));
 const easy=inside.filter(q=>lcm(lcm(lo[1],hi[1]),q[1])<=60);if(!easy.length)return null;const ans=r.pick(easy),L=lcm(lcm(lo[1],hi[1]),ans[1]);
 const c=fracChoices(ans,r.sample(outside,6),fraw);if(!c)return null;
 return {...c,prompt:`Which fraction is **between** ${fraw(lo)} and ${fraw(hi)}?`,
  explanation:explain(`Use a common denominator of ${L}:`,bullets(toL(lo,L),toL(hi,L),toL(ans,L)),`${ans[0]*L/ans[1]}/${L} is between ${lo[0]*L/lo[1]}/${L} and ${hi[0]*L/hi[1]}/${L}.`),
  audit:{k:'betweenFrac'}};
};
const cmpOrder:Template=r=>{
 const {fracs,L}=fracSet(r,4);if(fracs.length<4)return null;const asc=[...fracs].sort((x,y)=>fval(x)-fval(y)),f=(xs:Q[])=>xs.map(fraw).join(', ');
 const byDen=[...fracs].sort((x,y)=>y[1]-x[1]||x[0]-y[0]),byNum=[...fracs].sort((x,y)=>x[0]-y[0]||x[1]-y[1]);
 const o=words4(f(asc),[f([...asc].reverse()),f(byDen),f(byNum),f([asc[1],asc[0],asc[2],asc[3]])]);if(!o)return null;
 return {...o,prompt:'Which list is in order from **smallest to largest**?',
  explanation:explain(`Change them all to ${NAMES_OF[L]?.[1]??`/${L}`}:`,bullets(...asc.map(q=>toL(q,L))),`Smallest to largest: ${f(asc)}`),
  audit:{k:'sortedFracList'}};
};
const cmpWho:Template=r=>{
 const [p,q]=r.sample(NAMES,2),[thing,verb]=r.pick([['are each reading a copy of the same book','has read'],['are each doing a copy of the same jigsaw','has finished'],['each have an identical fence to paint','has painted'],['are each walking the same trail','has walked']]);
 const d1=r.pick([3,4,5,6,8]),d2=r.pick([4,5,6,7,8,10,12]);if(d1===d2)return null;const a:Q=[r.int(1,d1-1),d1],b:Q=[r.int(1,d2-1),d2];
 if(gcd(a[0],a[1])!==1||gcd(b[0],b[1])!==1||Math.abs(fval(a)-fval(b))<1e-9)return null;
 const diff=fsub(fval(a)>fval(b)?a:b,fval(a)>fval(b)?b:a),win=fval(a)>fval(b)?p:q,lose=win===p?q:p,naive:Q=[Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1])];
 const o=words4(`${win}, by ${fmix(diff)}`,[`${lose}, by ${fmix(diff)}`,naive[0]>0&&naive[1]>0&&fval(naive)<1&&fkey(naive)!==fkey(diff)?`${win}, by ${fmix(naive)}`:null,`${win}, by ${fmix(fadd(diff,[1,lcm(a[1],b[1])]))}`,`They are the same`]);if(!o)return null;
 const L=lcm(a[1],b[1]);
 return {...o,prompt:`${p} and ${q} ${thing}. ${p} ${verb} ${fraw(a)} of it and ${q} ${verb} ${fraw(b)} of it. Who ${verb} more, and by how much?`,rewardGroup:'challenge',
  explanation:explain(bullets(`A common denominator is ${L}.`,`${p}: ${toL(a,L)}`,`${q}: ${toL(b,L)}`,`${win} ${verb} more: ${Math.max(a[0]*L/a[1],b[0]*L/b[1])}/${L} − ${Math.min(a[0]*L/a[1],b[0]*L/b[1])}/${L} = ${fmix(diff)}.`)),
  audit:{k:'whoMore',a,b,names:[p,q]}};
};
const cmpPictures:Template=(r,i)=>{
 const same=i%3===0,d1=r.pick([4,6,8,10,12]),d2=r.pick([6,8,9,10,12,15,16,20].filter(x=>x!==d1));
 let k1=r.int(1,d1-1),k2=r.int(1,d2-1);if(same){const [a,b]=simp([k1,d1]);if(d2%b!==0)return null;k2=a*d2/b;}
 const v1=k1/d1,v2=k2/d2;if(!same&&(Math.abs(v1-v2)<1e-9||Math.abs(v1-v2)>0.2))return null;
 const ans=v1<v2-1e-9?'<':v1>v2+1e-9?'>':'=',left=shadedShape(r,d1,k1,true,'A circle split into equal parts'),right=shadedShape(r,d2,k2,false,'A rectangle split into equal parts');
 return {prompt:'Compare the shaded parts. Which sign goes in the box?',answer:ans,wrong:['<','=','>'].filter(s=>s!==ans),order:'sorted',
  visual:{kind:'compare',left,right,alt:'A shaded circle and a shaded rectangle with a box between them'},
  explanation:explain(bullets(`Circle: ${k1}/${d1} shaded.`,`Rectangle: ${k2}/${d2} shaded.`,`With a common denominator of ${lcm(d1,d2)}: ${k1*lcm(d1,d2)/d1}/${lcm(d1,d2)} and ${k2*lcm(d1,d2)/d2}/${lcm(d1,d2)}.`),`So ${k1}/${d1} ${ans} ${k2}/${d2}.`),
  audit:{k:'cmpShaded'}};
};

// ───────────────────────── Adding and subtracting fractions
const addSub:Topic={id:'ma-add-sub-fractions',subject:'Maths',strand:'Fractions, decimals and percentages',title:'Adding and subtracting fractions',helpsheet:{
 intro:'You can only add or subtract fractions when they have the same denominator.',
 steps:['Find a common denominator: a common multiple of both denominators.','Change each fraction to an equivalent fraction with that denominator.','Add or subtract the numerators. Keep the denominator the same.','Simplify, and change an improper fraction to a mixed number.'],
 example:{title:'3/4 + 1/6',lines:['A common denominator is 12.','3/4 = 9/12 and 1/6 = 2/12.','9/12 + 2/12 = 11/12']},
 tips:['Never add the denominators: 1/2 + 1/3 is not 2/5.','With mixed numbers, add the wholes and the fractions separately, then tidy up.','When subtracting mixed numbers you may need to exchange 1 whole: 3 1/4 = 2 5/4.'],
}};
const how=(a:Q,b:Q,op:'+'|'−')=>{const L=lcm(a[1],b[1]),A=a[0]*L/a[1],B=b[0]*L/b[1],res=op==='+'?fadd(a,b):fsub(a,b);
 return bullets(...(a[1]===b[1]?[]:[`A common denominator is ${L}: ${fraw(a)} = ${A}/${L} and ${fraw(b)} = ${B}/${L}.`]),`${A}/${L} ${op} ${B}/${L} = ${op==='+'?A+B:A-B}/${L}`,...(fmix(res)!==`${op==='+'?A+B:A-B}/${L}`?[`${op==='+'?A+B:A-B}/${L} = ${fmix(res)}`]:[]));};
const asSame:Template=r=>{
 const d=r.pick([5,6,7,8,9,10,11,12]),a=r.int(2,d-1),b=r.int(2,d-1);if(a+b<=d||a+b===2*d)return null;const ans:Q=[a+b,d];
 const c=fracChoices(ans,[[a+b,2*d],[a*b,d],[Math.abs(a-b),d],[a+b-d,d]]);if(!c)return null;
 return {...c,prompt:'Work out the answer. Give it as a mixed number in its simplest form.',stimulus:`${a}/${d} + ${b}/${d}`,rewardGroup:'quick',
  explanation:explain(how([a,d],[b,d],'+'),`The denominator stays as ${d}: you are adding ${NAMES_OF[d]?.[1]??`parts of ${d}`}. Adding the denominators too gives ${a+b}/${2*d}${fmix([a+b,2*d])!==`${a+b}/${2*d}`?` = ${fmix([a+b,2*d])}`:''}, which is wrong.`),
  audit:{k:'expr',e:`${a}/${d}+${b}/${d}`}};
};
const asDiff:Template=(r,i)=>{
 const add=i%2===0,d1=r.pick([2,3,4,5,6]),d2=r.pick([3,4,6,8,9,10,12]);if(d1===d2||lcm(d1,d2)>24)return null;
 const a:Q=[r.int(1,d1-1),d1],b:Q=[r.int(1,d2-1),d2];if(gcd(a[0],d1)!==1||gcd(b[0],d2)!==1)return null;if(!add&&fval(a)<=fval(b))return null;
 const ans=add?fadd(a,b):fsub(a,b),L=lcm(d1,d2);
 const c=fracChoices(ans,properish([add?[a[0]+b[0],d1+d2]:[Math.abs(a[0]-b[0]),Math.abs(d1-d2)||1],[add?a[0]+b[0]:Math.abs(a[0]-b[0]),L],add?fsub(a,b):fadd(a,b),[a[0]*b[0],d1*d2]]));if(!c)return null;
 return {...c,prompt:'Work out the answer. Give it in its simplest form.',stimulus:`${fraw(a)} ${add?'+':'−'} ${fraw(b)}`,
  explanation:explain(how(a,b,add?'+':'−'),add?`Adding the denominators gives ${a[0]+b[0]}/${d1+d2}${fmix([a[0]+b[0],d1+d2])!==`${a[0]+b[0]}/${d1+d2}`?` = ${fmix([a[0]+b[0],d1+d2])}`:''}, which is wrong: never add the denominators.`:'Change both fractions to the same denominator before subtracting.'),
  audit:{k:'expr',e:`${a[0]}/${d1}${add?'+':'-'}${b[0]}/${d2}`}};
};
const asMixed:Template=(r,i)=>{
 const add=i%2===0,d1=r.pick([2,3,4,5,6]),d2=r.pick([3,4,6,8,10,12]);if(d1===d2||lcm(d1,d2)>24)return null;
 const a:Q=[r.int(1,d1-1),d1],b:Q=[r.int(1,d2-1),d2],w1=r.int(2,6),w2=r.int(1,w1-1);if(gcd(a[0],d1)!==1||gcd(b[0],d2)!==1)return null;
 if(add&&fval(a)+fval(b)<=1)return null;if(!add&&fval(a)>=fval(b))return null;
 const A:Q=[w1*d1+a[0],d1],B:Q=[w2*d2+b[0],d2],ans=add?fadd(A,B):fsub(A,B),fr=add?fadd(a,b):fsub(b,a);
 const w=add?[fsub(ans,[1,1]),fadd([w1+w2,1],[a[0]+b[0],d1+d2]),fadd(ans,[1,lcm(d1,d2)])]:[fadd([w1-w2,1],fr),fadd(ans,[1,1]),fadd([w1+w2,1],fadd(a,b))];
 const c=fracChoices(ans,w);if(!c)return null;const s=`${w1} ${fraw(a)} ${add?'+':'−'} ${w2} ${fraw(b)}`,L=lcm(d1,d2);
 return {...c,prompt:'Work out the answer.',stimulus:s,rewardGroup:'challenge',
  explanation:explain(bullets(`Use a common denominator of ${L}: ${w1} ${a[0]*L/d1}/${L} ${add?'+':'−'} ${w2} ${b[0]*L/d2}/${L}.`,add?`Wholes: ${w1} + ${w2} = ${w1+w2}. Fractions: ${a[0]*L/d1}/${L} + ${b[0]*L/d2}/${L} = ${(a[0]*L/d1)+(b[0]*L/d2)}/${L} = ${fmix(fadd(a,b))}.`:`${a[0]*L/d1}/${L} is less than ${b[0]*L/d2}/${L}, so exchange 1 whole: ${w1} ${a[0]*L/d1}/${L} = ${w1-1} ${a[0]*L/d1+L}/${L}.`,add?`${w1+w2} + ${fmix(fadd(a,b))} = ${fmix(ans)}`:`${w1-1} ${a[0]*L/d1+L}/${L} − ${w2} ${b[0]*L/d2}/${L} = ${w1-1-w2?`${w1-1-w2} `:''}${a[0]*L/d1+L-b[0]*L/d2}/${L}${fmix(ans)!==`${w1-1-w2?`${w1-1-w2} `:''}${a[0]*L/d1+L-b[0]*L/d2}/${L}`?` = ${fmix(ans)}`:''}`)),
  audit:{k:'expr',e:`${w1}+${a[0]}/${d1}${add?'+':'-'}(${w2}+${b[0]}/${d2})`}};
};
const asStory:Template=(r,i)=>{
 const [p,q]=r.sample(NAMES,2);
 if(i%2===0){const a:Q=r.pick([[1,3],[1,4],[1,5],[2,5],[1,6],[3,8],[1,8]]),b:Q=r.pick([[1,2],[1,3],[1,4],[2,5],[1,6],[3,10],[1,8]]);if(a[1]===b[1]||fval(a)+fval(b)>=1)return null;
  const drunk=fadd(a,b),ans=fsub([1,1],drunk),c=fracChoices(ans,[drunk,fsub([1,1],[a[0]+b[0],a[1]+b[1]]),fsub([1,1],a),[a[0]+b[0],a[1]+b[1]]]);if(!c)return null;
  return {...c,prompt:`${p} drinks ${fraw(a)} of a jug of juice. ${q} drinks ${fraw(b)} of the same jug. What fraction of the jug is left?`,
   explanation:explain(how(a,b,'+'),`Left: 1 − ${fmix(drunk)} = ${fmix(ans)}`,fkey(drunk)!==fkey(ans)?`If you chose ${fmix(drunk)}, that is the fraction they drank, not what is left.`:'They drank exactly half, so half is left.'),
   audit:{k:'expr',e:`#1-${a[0]}/${a[1]}-${b[0]}/${b[1]}`}};}
 const L0:Q=[r.int(4,7)*2+1,2],cut1:Q=simp([r.int(1,2)*4+r.pick([1,3]),4]),cut2:Q=simp([r.int(1,2)*3+r.pick([1,2]),3]);
 const ans=fsub(fsub(L0,cut1),cut2);if(fval(ans)<=0.2)return null;
 const c=fracChoices(ans,[fadd(cut1,cut2),fsub(L0,cut1),fadd(ans,[1,1]),fsub(ans,[1,12])]);if(!c)return null;
 return {...c,prompt:`A ribbon is ${fmix(L0)} m long. ${p} cuts off ${fmix(cut1)} m and then ${fmix(cut2)} m. How many metres of ribbon are left?`,rewardGroup:'challenge',
  explanation:explain(bullets(`Cut off: ${fmix(cut1)} + ${fmix(cut2)} = ${fmix(fadd(cut1,cut2))} m (common denominator 12).`,`Left: ${fmix(L0)} − ${fmix(fadd(cut1,cut2))} = ${fmix(ans)} m`)),
  audit:{k:'expr',e:`${mixedExpr(L0)}-${mixedExpr(cut1)}-${mixedExpr(cut2)}`}};
};
const asBar:Template=r=>{
 const [d1,d2]=r.pick([[3,4],[4,6],[2,5],[3,6],[4,8],[5,10],[3,8],[2,6],[6,8]] as const),a:Q=[1,d1],b:Q=r.pick([[1,d2],[d2>4?2:1,d2]] as Q[]);const L=lcm(d1,d2),ans=fsub(fsub([1,1],a),b);if(fval(ans)<=0||gcd(b[0],b[1])!==1)return null;
 const parts=[{text:fraw(a),size:L/d1},{text:fraw(b),size:b[0]*L/d2},{text:'?',size:ans[0]*L/ans[1],shade:true}];
 const c=fracChoices(ans,[fadd(a,b),fsub([1,1],[a[0]+b[0],d1+d2]),[1,L],[1,d1+d2]]);if(!c)return null;
 return {...c,prompt:'The bar model shows one whole split into three parts. What fraction is the missing part?',
  visual:{kind:'barModel',rows:[{parts}],total:'1 whole',alt:'A bar for one whole split into three parts, one marked with a question mark'},
  explanation:explain(bullets(`The whole is 1 = ${L}/${L}.`,`${fraw(a)} = ${L/d1}/${L} and ${fraw(b)} = ${b[0]*L/d2}/${L}.`,`Missing part: ${L}/${L} − ${L/d1}/${L} − ${b[0]*L/d2}/${L} = ${ans[0]*L/ans[1]}/${L}${fmix(ans)!==`${ans[0]*L/ans[1]}/${L}`?` = ${fmix(ans)}`:''}`)),
  audit:{k:'expr',e:`#1-${a[0]}/${a[1]}-${b[0]}/${b[1]}`}};
};
const asMissing:Template=r=>{
 const d1=r.pick([2,3,4,5,6]),d2=r.pick([3,4,6,8,10,12]);if(d1===d2||lcm(d1,d2)>24)return null;
 const a:Q=[r.int(1,d1-1),d1],b:Q=[r.int(1,d2-1),d2];if(gcd(a[0],d1)!==1||gcd(b[0],d2)!==1||fval(a)<=fval(b))return null;
 const form=r.int(0,1),ans=fsub(a,b);let s:string,w:Q[];
 if(form===0){s=`${fraw(a)} − ☐ = ${fraw(b)}`;w=[fadd(a,b),[Math.abs(a[0]-b[0]),Math.abs(d1-d2)||1],[1,lcm(d1,d2)]];}
 else{s=`☐ + ${fraw(b)} = ${fraw(a)}`;w=[fadd(a,b),[Math.abs(a[0]-b[0]),Math.abs(d1-d2)||1],fsub(ans,[1,lcm(d1,d2)])];}
 const c=fracChoices(ans,properish(w));if(!c)return null;
 return {...c,prompt:'What fraction goes in the box?',stimulus:s,
  explanation:explain(bullets(`☐ = ${fraw(a)} − ${fraw(b)}`),how(a,b,'−'),`Check: ${form===0?`${fraw(a)} − ${fmix(ans)} = ${fraw(b)}`:`${fmix(ans)} + ${fraw(b)} = ${fraw(a)}`}.`),
  audit:{k:'box',s}};
};

// ───────────────────────── Multiplying and dividing fractions
const mulDiv:Topic={id:'ma-multiply-divide-fractions',subject:'Maths',strand:'Fractions, decimals and percentages',title:'Multiplying and dividing fractions',helpsheet:{
 intro:'To multiply fractions, multiply the numerators and multiply the denominators. To divide a fraction by a whole number, multiply its denominator by that number.',
 steps:['Fraction × whole number: multiply the numerator only: 2/7 × 3 = 6/7.','Fraction × fraction: top × top and bottom × bottom: 2/3 × 4/5 = 8/15.','Fraction ÷ whole number: multiply the denominator: 4/5 ÷ 2 = 4/10 = 2/5.','Simplify, and change improper fractions to mixed numbers.'],
 example:{title:'2/3 × 3/4',lines:['Numerators: 2 × 3 = 6','Denominators: 3 × 4 = 12','6/12 = 1/2']},
 tips:['"Of" means multiply: 1/2 of 3/5 = 1/2 × 3/5 = 3/10.','Multiplying by a proper fraction makes the answer smaller.','When multiplying by a whole number, do not multiply the denominator too: 3/8 × 2 = 6/8, not 6/16.'],
}};
const mdWhole:Template=(r,i)=>{
 const d=r.pick([3,4,5,6,8,9,10]),a=r.int(1,d-1),n=r.int(2,9);if(gcd(a,d)!==1||(a*n)%d===0)return null;const ans:Q=[a*n,d];
 const c=fracChoices(ans,[[a,d*n],[a*n,1],(a+n)%d!==0&&[a+n,d],[a*n,d*n]]);if(!c)return null;
 if(i%2===1){const who=r.pick(NAMES);return {...c,prompt:`${who}'s hero drinks ${fraw([a,d])} of a litre of water after every wave. How many litres does the hero drink after ${n} waves?`,
  explanation:explain(bullets(`${fraw([a,d])} × ${n} = ${a*n}/${d}`,`${a*n}/${d} = ${fmix(ans)}`),'Multiply the numerator only; the size of each part (the denominator) stays the same.'),audit:{k:'expr',e:`${a}/${d}*${n}`}};}
 return {...c,prompt:'Work out the answer. Give it as a mixed number in its simplest form.',stimulus:`${fraw([a,d])} × ${n}`,
  explanation:explain(bullets(`${fraw([a,d])} × ${n} = ${a} × ${n} ${NAMES_OF[d][1]} = ${a*n}/${d}`,`${a*n}/${d} = ${fmix(ans)}`),`Multiplying the denominator as well gives ${a*n}/${d*n}, which is the same as ${fraw([a,d])}: nothing has changed.`),
  audit:{k:'expr',e:`${a}/${d}*${n}`}};
};
const mdFrac:Template=(r,i)=>{
 const b=r.pick([2,3,4,5,6]),d=r.pick([3,4,5,6,8,10]),a=r.int(1,b-1),c0=r.int(1,d-1);if(gcd(a,b)!==1||gcd(c0,d)!==1)return null;
 const x:Q=[a,b],y:Q=[c0,d],ans=fmul(x,y);
 const c=fracChoices(ans,[[a+c0,b+d],fdiv(x,y),[a+c0,b*d],fadd(x,y)]);if(!c)return null;
 const of=i%2===1;
 return {...c,prompt:of?`What is ${fraw(x)} of ${fraw(y)}? Give your answer in its simplest form.`:'Work out the answer. Give it in its simplest form.',stimulus:of?undefined:`${fraw(x)} × ${fraw(y)}`,
  explanation:explain(bullets(...(of?['"Of" means multiply.']:[]),`Numerators: ${a} × ${c0} = ${a*c0}`,`Denominators: ${b} × ${d} = ${b*d}`,`${a*c0}/${b*d}${fmix(ans)!==`${a*c0}/${b*d}`?` = ${fmix(ans)}`:''}`),`Adding the tops and bottoms gives ${a+c0}/${b+d}${fmix([a+c0,b+d])!==`${a+c0}/${b+d}`?` = ${fmix([a+c0,b+d])}`:''}, which is wrong: fractions are not multiplied by adding.`),
  audit:{k:'expr',e:`${a}/${b}*${c0}/${d}`}};
};
const mdDiv:Template=(r,i)=>{
 const d=r.pick([2,3,4,5,6,8]),a=r.int(1,d-1),n=r.int(2,6);if(gcd(a,d)!==1)return null;const ans:Q=[a,d*n];
 const c=fracChoices(ans,[[a*n,d],[a,d+n],[a,d],[n,a*d]]);if(!c)return null;
 if(i%2===1){const [thing,who]=r.pick([['cake','friends'],['pizza','children'],['pie','heroes'],['tart','classmates']]);
  return {...c,prompt:`${fraw([a,d])} of a ${thing} is shared equally between ${n} ${who}. What fraction of the whole ${thing} does each get?`,
   explanation:explain(bullets(`${fraw([a,d])} ÷ ${n} = ${a}/${d*n}`,'Dividing by a whole number makes each part smaller, so multiply the denominator.'),`${fmix(ans)} of the ${thing} each.`),audit:{k:'expr',e:`${a}/${d}/${n}`}};}
 return {...c,prompt:'Work out the answer. Give it in its simplest form.',stimulus:`${fraw([a,d])} ÷ ${n}`,
  explanation:explain(bullets(`To divide by ${n}, multiply the denominator by ${n}: ${a}/${d} ÷ ${n} = ${a}/${d*n}`,...(fmix(ans)!==`${a}/${d*n}`?[`${a}/${d*n} = ${fmix(ans)}`]:[])),`If you chose ${fmix([a*n,d])}, you multiplied instead of dividing.`),
  audit:{k:'expr',e:`${a}/${d}/${n}`}};
};
const mdHowMany:Template=r=>{
 const k=r.pick([2,3,4,5,8,10]),W=r.int(2,9),ans=W*k,f=`1/${k}`;
 const prompt=r.pick([`How many ${f}-litre cups can be filled from ${W} litres of juice?`,`How many ${f} kg bags can be filled from ${W} kg of flour?`,`How many pieces of ribbon ${f} m long can be cut from ${W} m of ribbon?`,`How many ${f}-litre bottles can be filled from ${W} litres of water?`]);
 const c=pick<string>(String(ans),[String(W+k),`${W}/${k}`,String(k),String(ans+k)],x=>x,x=>fdpVal(x));if(!c)return null;
 return {...c,prompt,
  explanation:explain(bullets(`There are ${k} lots of 1/${k} in each whole one.`,`${W} × ${k} = ${ans}`),`${W} ÷ 1/${k} = ${ans}.`),
  audit:{k:'expr',e:`${W}/(#1/${k})`}};
};
const mdStory:Template=r=>{
 const who=r.pick(NAMES),kind=r.int(0,1);
 if(kind===0){const d=r.pick([4,5,8]),a=r.int(1,d-1),n=r.pick([2,3,4,6]);if(gcd(a,d)!==1)return null;const ans:Q=simp([a,d*n]);
  const c=fracChoices(ans,[[a*n,d],[a,d+n],[a,n],[1,d*n]]);if(!c)return null;
  return {...c,prompt:`${who} cuts ${fraw([a,d])} of a metre of ribbon into ${n} equal pieces. How long is each piece, as a fraction of a metre?`,
   explanation:explain(bullets(`${fraw([a,d])} ÷ ${n} = ${a}/${d*n}`,...(fmix(ans)!==`${a}/${d*n}`?[`${a}/${d*n} = ${fmix(ans)}`]:[])),'Each piece is shorter than the whole length, so the answer must be less than '+fraw([a,d])+'.'),
   audit:{k:'expr',e:`${a}/${d}/${n}`}};}
 const [x,y]=r.pick([[2,3],[3,4],[1,2],[3,5],[5,6],[2,5]] as const),m=r.pick([[1,2],[1,3],[1,4]] as Q[]),ans=fmul([x,y],m);
 const c=fracChoices(ans,[fadd([x,y],m),fsub([x,y],m),fdiv([x,y],m),[x,y*2+1]]);if(!c)return null;
 return {...c,prompt:`A recipe needs ${fraw([x,y])} of a cup of sugar. ${who} makes ${fraw(m)} of the recipe. How much sugar does ${who} need, as a fraction of a cup?`,
  explanation:explain(bullets(`${fraw(m)} of ${fraw([x,y])} means ${fraw(m)} × ${fraw([x,y])}.`,`${m[0]} × ${x} = ${m[0]*x} and ${m[1]} × ${y} = ${m[1]*y}, so the answer is ${m[0]*x}/${m[1]*y}${fmix(ans)!==`${m[0]*x}/${m[1]*y}`?` = ${fmix(ans)}`:''} of a cup.`)),
  audit:{k:'expr',e:`${m[0]}/${m[1]}*${x}/${y}`}};
};
const mdArea:Template=r=>{
 const a:Q=[r.int(1,3),r.pick([2,3,4,5])],b:Q=[r.int(1,4),r.pick([3,4,5,6,8])];if(a[0]>=a[1]||b[0]>=b[1]||gcd(a[0],a[1])!==1||gcd(b[0],b[1])!==1||fkey(a)===fkey(b))return null;
 const ans=fmul(a,b),w=Math.round(120+180*fval(a)),h=Math.round(60+120*fval(b));
 const visual:Visual=fig(w+120,h+70,[{t:'rect',x:40,y:34,w,h,fill:'pale',sw:2.2},text(40+w/2,24,`${fraw(a)} m`,15,{bold:true}),text(40+w+10,34+h/2+5,`${fraw(b)} m`,15,{bold:true,anchor:'start'})],'A rectangle with its length and width marked in fractions of a metre');
 const c=fracChoices(ans,[fadd(a,b),fmul([2,1],fadd(a,b)),[a[0]+b[0],a[1]+b[1]],[a[0]*b[0],a[1]+b[1]]]);if(!c)return null;
 return {...c,prompt:'What is the area of this rectangle, in square metres?',visual,rewardGroup:'challenge',
  explanation:explain(bullets('Area = length × width',`${fraw(a)} × ${fraw(b)} = ${a[0]*b[0]}/${a[1]*b[1]}${fmix(ans)!==`${a[0]*b[0]}/${a[1]*b[1]}`?` = ${fmix(ans)}`:''} m²`),`${fmix(fmul([2,1],fadd(a,b)))} is the perimeter, not the area.`),
  audit:{k:'expr',e:`${a[0]}/${a[1]}*${b[0]}/${b[1]}`}};
};

// ───────────────────────── Fractions of amounts
const ofAmounts:Topic={id:'ma-fractions-of-amounts',subject:'Maths',strand:'Fractions, decimals and percentages',title:'Fractions of amounts',helpsheet:{
 intro:'To find a fraction of an amount, divide by the denominator to find one part, then multiply by the numerator.',
 steps:['Divide the amount by the denominator: 1/5 of 40 = 40 ÷ 5 = 8.','Multiply by the numerator: 3/5 of 40 = 3 × 8 = 24.','To find the whole from a part, divide by the numerator, then multiply by the denominator.','A bar model helps you see the equal parts.'],
 example:{title:'3/5 of 40',visual:{kind:'barModel',rows:[{parts:range(1,5).map(i=>({text:'8',size:1,shade:i<=3}))}],total:'40',alt:'A bar of 40 split into 5 equal parts of 8, with 3 parts shaded'},lines:['40 ÷ 5 = 8 (one fifth)','3 × 8 = 24 (three fifths)']},
 tips:['Divide by the bottom, times by the top.','If 2/7 of a number is 18, one seventh is 9, so the number is 63.','A fraction less than 1 of an amount is always smaller than the amount.'],
}};
/** A bar of n equal boxes with the first k shaded, a brace under the shaded boxes (part) and one over the whole bar (whole). */
function partBar(n:number,k:number,part:string,whole:string,alt:string):Visual{
 const bw=Math.min(56,420/n),x0=20,y0=40,h=42,m:Mark[]=[];
 for(let i=0;i<n;i++)m.push({t:'rect',x:x0+i*bw,y:y0,w:bw,h,fill:i<k?'yellow':'white',sw:2});
 m.push({t:'poly',open:true,fill:'none',w:1.6,pts:[x0,y0-6,x0,y0-14,x0+n*bw,y0-14,x0+n*bw,y0-6]},text(x0+n*bw/2,y0-20,whole,15,{bold:true}));
 m.push({t:'poly',open:true,fill:'none',w:1.6,pts:[x0,y0+h+6,x0,y0+h+14,x0+k*bw,y0+h+14,x0+k*bw,y0+h+6]},text(x0+k*bw/2,y0+h+32,part,15,{bold:true}));
 return fig(x0*2+n*bw,y0+h+42,m,alt);
}
const foaBasic:Template=r=>{
 const d=r.pick([3,4,5,6,7,8,9,12]),a=r.int(2,d-1);if(gcd(a,d)!==1)return null;const N=d*r.int(4,15),one=N/d,ans=a*one;
 const c=choices(ans,[one,Number.isInteger(N/a)?N/a:N-one,N-ans,Number.isInteger(N*d/a)?N*d/a:ans+one]);if(!c)return null;
 return {...c,prompt:`What is ${fraw([a,d])} of ${num(N)}?`,rewardGroup:'quick',
  explanation:explain(bullets(`One ${NAMES_OF[d][0]}: ${num(N)} ÷ ${d} = ${num(one)}`,`${cap(words(a))} ${NAMES_OF[d][1]}: ${a} × ${num(one)} = ${num(ans)}`),`Divide by the bottom, then multiply by the top.`),
  audit:{k:'expr',e:`${a}/${d}*${N}`}};
};
const foaReverse:Template=r=>{
 const d=r.pick([4,5,6,7,8,9]),a=r.int(2,d-1);if(gcd(a,d)!==1)return null;const one=r.int(3,15),part=a*one,whole=d*one,who=r.pick(NAMES);
 const c=choices(whole,[one,part+one,part*a,Math.round(part*a/d)]);if(!c)return null;
 return {...c,prompt:`${who} spends ${fraw([a,d])} of the coins in a treasure chest at the Quest Shop. That is ${part} coins. How many coins were in the chest to start with?`,
  visual:partBar(d,a,`${part} coins`,'?',`A bar split into ${d} equal parts with ${a} shaded`),
  explanation:explain(bullets(`${a} parts = ${part} coins, so 1 part = ${part} ÷ ${a} = ${one}.`,`The whole bar is ${d} parts: ${d} × ${one} = ${whole}.`),`Check: ${fraw([a,d])} of ${whole} = ${part}.`),
  audit:{k:'expr',e:`${part}/${a}*${d}`}};
};
const foaMoney:Template=r=>{
 const d=r.pick([3,4,5,8]),a=r.int(2,d-1);if(gcd(a,d)!==1)return null;const P=d*r.int(3,30)*(d===8?25:d===3?100:50),ans=a*P/d;if(ans%1!==0)return null;
 const X=P/100,c=moneyChoices(ans/100,[P/d/100,Number.isInteger(P/a)?P/a/100:false,(P-ans)/100,ans/100+1]);if(!c)return null;
 return {...c,prompt:`What is ${fraw([a,d])} of ${gbp(X)}?`,
  explanation:explain(bullets(`One ${NAMES_OF[d][0]}: ${gbp(X)} ÷ ${d} = ${gbp(P/d/100)}`,`${cap(words(a))} ${a===1?NAMES_OF[d][0]:NAMES_OF[d][1]}: ${a} × ${gbp(P/d/100)} = ${gbp(ans/100)}`),'You can change pounds to pence first if it helps: then divide and multiply as usual.'),
  audit:{k:'expr',e:`${a}/${d}*${X}`}};
};
const foaClass:Template=r=>{
 const [d1,d2]=r.pick([[8,4],[5,10],[3,6],[4,8],[6,3],[5,4]] as const),a1=r.int(1,d1-1),a2=r.int(1,d2-1),L=lcm(d1,d2),N=L*r.int(1,4);if(N<18||N>40||gcd(a1,d1)!==1||gcd(a2,d2)!==1)return null;
 const w=a1*N/d1,b=a2*N/d2,car=N-w-b;if(car<3)return null;
 const c=choices(car,[w+b,w,b,N-w]);if(!c)return null;
 return {...c,prompt:`There are ${N} pupils in a class. ${fraw([a1,d1])} of them walk to school and ${fraw([a2,d2])} of them come by bus. The rest come by car. How many pupils come by car?`,rewardGroup:'challenge',
  explanation:explain(bullets(`Walk: ${fraw([a1,d1])} of ${N} = ${w}`,`Bus: ${fraw([a2,d2])} of ${N} = ${b}`,`Car: ${N} − ${w} − ${b} = ${car}`)),
  audit:{k:'expr',e:`${N}-${a1}/${d1}*${N}-${a2}/${d2}*${N}`}};
};
const foaMeasure:Template=r=>{
 const kind=r.int(0,2);
 if(kind===0){const d=r.pick([3,4,5,6,10,12]),a=r.int(1,d-1),H=r.int(2,5);if(gcd(a,d)!==1||(60*H*a)%d)return null;const ans=a*60*H/d;
  const c=choices(ans,[a*100*H/d,60*H/d,ans/60,60*H-ans].filter(x=>Number.isInteger(x)&&x>0));if(!c)return null;
  return {...c,prompt:`What is ${fraw([a,d])} of ${H} hours, in minutes?`,explanation:explain(bullets(`${H} hours = ${H} × 60 = ${60*H} minutes`,`${fraw([a,d])} of ${60*H} = ${60*H} ÷ ${d} × ${a} = ${ans} minutes`),'Change to minutes first: an hour is 60 minutes, not 100.'),audit:{k:'expr',e:`${a}/${d}*${H}*#60`}};}
 if(kind===1){const d=r.pick([4,5,8,10]),a=r.int(1,d-1),K=r.int(2,6);if(gcd(a,d)!==1)return null;const ans=a*1000*K/d;
  const c=choices(ans,[a*100*K/d,1000*K/d,K*1000-ans,a*K/d*10].filter(x=>x>0),x=>`${num(x)} m`);if(!c)return null;
  return {...c,prompt:`A path is ${K} km long. How many metres is ${fraw([a,d])} of the path?`,explanation:explain(bullets(`${K} km = ${num(K*1000)} m`,`${fraw([a,d])} of ${num(K*1000)} = ${num(K*1000)} ÷ ${d} × ${a} = ${num(ans)} m`)),audit:{k:'expr',e:`${a}/${d}*${K}*#1000`}};}
 const d=r.pick([3,4,5,8]),a=r.int(1,d-1),L=r.pick([2,3,6]);if(gcd(a,d)!==1||(1000*L*a)%d)return null;const ans=a*1000*L/d;
 const c=choices(ans,[1000*L/d,1000*L-ans,a*100*L/d].filter(x=>Number.isInteger(x)&&x>0),x=>`${num(x)} ml`);if(!c)return null;
 return {...c,prompt:`A bottle holds ${L} litres of water. ${r.pick(NAMES)} pours out ${fraw([a,d])} of it. How many millilitres is that?`,explanation:explain(bullets(`${L} litres = ${num(L*1000)} ml`,`${fraw([a,d])} of ${num(L*1000)} = ${num(ans)} ml`)),audit:{k:'expr',e:`${a}/${d}*${L}*#1000`}};
};
const foaLargest:Template=r=>{
 const items=Array.from({length:4},()=>{const d=r.pick([3,4,5,6,8]),a=r.int(1,d-1),N=d*r.int(5,20);return {a,d,N,v:a*N/d};}).filter(x=>gcd(x.a,x.d)===1);
 if(items.length<4)return null;const vs=items.map(x=>x.v),mx=Math.max(...vs);if(vs.filter(v=>v===mx).length!==1||new Set(items.map(x=>`${x.a}/${x.d} of ${x.N}`)).size<4)return null;
 const s=(x:typeof items[0])=>`${fraw([x.a,x.d])} of ${num(x.N)}`,best=items[vs.indexOf(mx)];
 const o=words4(s(best),items.filter(x=>x!==best).map(s));if(!o)return null;
 return {...o,prompt:'Which of these is the **largest** amount?',
  explanation:explain(bullets(...items.map(x=>x.a===1?`${s(x)} = ${num(x.N)} ÷ ${x.d} = ${num(x.v)}`:`${s(x)} = ${num(x.N)} ÷ ${x.d} × ${x.a} = ${num(x.v)}`)),`The largest is ${s(best)}.`),
  audit:{k:'largestOf'}};
};

// ───────────────────────── Decimals
const decimals:Topic={id:'ma-decimals',subject:'Maths',strand:'Fractions, decimals and percentages',title:'Decimals',helpsheet:{
 intro:'Decimals carry on the place value system to the right of the ones: tenths, hundredths and thousandths.',
 steps:['0.1 is one tenth, 0.01 is one hundredth and 0.001 is one thousandth.','To compare decimals, line up the decimal points and compare column by column from the left.','To add or subtract, line up the decimal points and fill empty places with zeros.','Multiplying by 10, 100 or 1,000 moves the digits 1, 2 or 3 places to the left; dividing moves them to the right.'],
 example:{title:'Order 0.6, 0.58 and 0.605',visual:{kind:'placeValue',columns:['O','•','t','h','th'],rows:[['0','•','6','0','0'],['0','•','5','8','0'],['0','•','6','0','5']]},lines:['Fill the gaps with zeros: 0.600, 0.580, 0.605.','Tenths first: 5 is less than 6, so 0.58 is the smallest.','Then 0.600 is less than 0.605.','Smallest to largest: 0.58, 0.6, 0.605']},
 tips:['More digits does not mean bigger: 0.8 is greater than 0.75.','0.3 × 0.2 = 0.06: count the decimal places in the question.','Rounding 4.97 to one decimal place gives 5.0.'],
}};
const decDigit:Template=r=>{
 const ds=r.sample([1,2,3,4,5,6,7,8,9],4),n=ds[0]+ds[1]/10+ds[2]/100+ds[3]/1000,j=r.int(1,3),d=ds[j],v=tidy(d/10**j);
 const c=choices(v,[tidy(d/10**(j===1?2:j-1)),tidy(d/10**(j===3?2:j+1)),d,d*10],x=>num(x));if(!c)return null;
 return {...c,prompt:`What is the value of the digit **${d}** in this number?`,stimulus:num(tidy(n),3),rewardGroup:'quick',
  explanation:explain(bullets(`The ${d} is in the ${['','tenths','hundredths','thousandths'][j]} column.`,`Its value is ${d} ${['','tenth','hundredth','thousandth'][j]}${d===1?'':'s'} = ${num(v)}.`)),
  audit:{k:'decDigit'}};
};
const decExtreme:Template=(r,i)=>{
 const big=i%2===0,a=r.int(3,8),b=r.int(1,9),set=[a/10,tidy(a/10-0.1+b/100),tidy(a/10+b/1000),tidy(a/100+b/1000),tidy(a/10-0.1+b/1000+0.09)].filter(x=>x>0);
 const uniq=[...new Set(set.map(x=>tidy(x)))];if(uniq.length<5)return null;const best=big?Math.max(...uniq):Math.min(...uniq);
 const c=choices(best,uniq.filter(x=>x!==best),x=>num(x),5);if(!c)return null;
 const longest=[...uniq].sort((x,y)=>num(y).length-num(x).length)[0];
 return {...c,prompt:`Which decimal is the **${big?'largest':'smallest'}**?`,rewardGroup:'quick',
  explanation:explain(bullets('Line them up with the same number of decimal places:',...uniq.map(x=>`${num(x)} → ${num(x,3)}`)),`The ${big?'largest':'smallest'} is ${num(best)}.`,big&&longest!==best?`${num(longest)} has more digits, but that does not make it larger.`:null),
  audit:{k:'extreme',dir:big?'max':'min'}};
};
const dpOf=(x:number)=>(num(x).split('.')[1]??'').length;
const decAddSub:Template=(r,i)=>{
 const add=i%2===0,a=tidy(r.int(21,199)/10),b=tidy(r.int(101,999)/100);if(!add&&a<=b)return null;const ans=tidy(add?a+b:a-b);
 const mis=tidy(add?a/10+b:Math.abs(a/10-b)),wrong=add?[mis,tidy(ans-0.1),tidy(ans+1)]:[mis,tidy(ans+0.1),tidy(ans-1)];
 const c=choices(ans,wrong.filter(x=>x>0),x=>num(x));if(!c)return null;
 // Only talk about writing a zero on the end when the two numbers have different numbers of decimal places.
 const dp=Math.max(dpOf(a),dpOf(b)),places=['no decimal places','one decimal place','two decimal places'][dp],short=dpOf(a)<dpOf(b)?a:b;
 return {...c,prompt:`Work out the answer. Line up the decimal points.`,stimulus:`${num(a)} ${add?'+':'−'} ${num(b)}`,
  explanation:explain(bullets(dpOf(a)===dpOf(b)?`Both numbers have ${places}, so the decimal points line up.`:`Write ${num(short)} as ${num(short,dp)} so both numbers have ${places}.`,`${num(a,dp)} ${add?'+':'−'} ${num(b,dp)} = ${num(ans)}`),`If you chose ${num(mis)}, the decimal points were not lined up.`),
  audit:{k:'expr',e:`${a}${add?'+':'-'}${b}`}};
};
const decTimes:Template=r=>{
 const mul=r.chance(.5),p=r.pick([10,100,1000]),x=tidy(r.int(101,9999)/r.pick([100,1000])),ans=tidy(mul?x*p:x/p);
 const c=choices(ans,mul?[tidy(x*p/10),tidy(x*p*10),tidy(x/p)]:[tidy(x/p*10),tidy(x/p/10),tidy(x*p)],x=>num(x));if(!c)return null;
 const k=Math.round(Math.log10(p));
 return {...c,prompt:'Work out the answer.',stimulus:`${num(x)} ${mul?'×':'÷'} ${num(p)}`,rewardGroup:'quick',
  explanation:explain(bullets(`${mul?'Multiplying':'Dividing'} by ${num(p)} moves every digit ${k} place${k>1?'s':''} to the ${mul?'left':'right'}.`,`${num(x)} ${mul?'×':'÷'} ${num(p)} = ${num(ans)}`),'The decimal point stays still; the digits move.'),
  audit:{k:'expr',e:`${x}${mul?'*':'/'}${p}`}};
};
const decRound:Template=r=>{
 const dp=r.pick([0,1,2]),x=tidy(r.int(1001,99999)/1000),ans=roundTo(x,10**-dp),other=tidy(ans===roundTo(Math.floor(x*10**dp)/10**dp,10**-dp)?ans+10**-dp:ans-10**-dp);
 const place=['whole number','one decimal place','two decimal places'][dp],wrong=[other,roundTo(x,10**-(dp+1)),dp>0?roundTo(x,10**-(dp-1)):roundTo(x,0.1)];
 const f=(v:number,d:number)=>num(v,d);
 const o=pick<[string,number]>([f(ans,dp),ans],[[f(tidy(other),dp),tidy(other)],[f(wrong[1],dp+1),wrong[1]],[f(wrong[2],dp>0?dp-1:1),wrong[2]]],v=>v[0],v=>v[1]);if(!o)return null;
 return {...o,prompt:`Round this number to **${dp===0?'the nearest whole number':place}**.`,stimulus:num(x,3),rewardGroup:'quick',
  explanation:explain(bullets(`Look at the ${['tenths','hundredths','thousandths'][dp]} digit: it is ${Math.floor(tidy(x*10**(dp+1)))%10}.`,`${Math.floor(tidy(x*10**(dp+1)))%10>=5?'5 or more, so round up':'Less than 5, so round down'}: ${num(x,3)} → ${f(ans,dp)}`)),
  audit:{k:'expr',e:`round(${x},#${10**-dp})`}};
};
const decMultiply:Template=r=>{
 const form=r.int(0,2);let a:number,b:number;
 if(form===0){a=r.int(2,9)/10;b=r.int(2,9)/10;}else if(form===1){a=tidy(r.int(11,49)/10);b=r.int(3,9);}else{a=tidy(r.int(11,35)/10);b=tidy(r.int(11,25)/10);}
 if(Number.isInteger(a)||(form!==1&&Number.isInteger(b)))return null;
 const ans=tidy(a*b),c=choices(ans,[tidy(ans*10),tidy(ans/10),tidy(a+b),tidy(ans*100)],x=>num(x));if(!c)return null;
 const dps=(v:number)=>(String(v).split('.')[1]??'').length,A=Math.round(a*10**dps(a)),B=Math.round(b*10**dps(b));
 return {...c,prompt:'Work out the answer.',stimulus:`${num(a)} × ${num(b)}`,
  explanation:explain(bullets(`Ignore the decimal points: ${A} × ${B} = ${A*B}.`,`There ${dps(a)+dps(b)===1?'is 1 decimal place':`are ${dps(a)+dps(b)} decimal places`} in the question, so there ${dps(a)+dps(b)===1?'is 1':`are ${dps(a)+dps(b)}`} in the answer: ${num(ans)}.`),`If you chose ${num(tidy(ans*10))}, the decimal point is in the wrong place.`),
  audit:{k:'expr',e:`${a}*${b}`}};
};

// ───────────────────────── Percentages
const percentages:Topic={id:'ma-percentages',subject:'Maths',strand:'Fractions, decimals and percentages',title:'Percentages',helpsheet:{
 intro:'Per cent means "out of 100". 35% means 35 out of every 100.',
 steps:['Find 10% by dividing by 10, and 1% by dividing by 100.','Build other percentages from these: 35% = 10% + 10% + 10% + 5%.','50% is a half, 25% is a quarter and 75% is three quarters.','To write a score as a percentage, make it out of 100: 18 out of 25 = 72 out of 100 = 72%.'],
 example:{title:'35% of 80',lines:['10% of 80 = 8','30% = 3 × 8 = 24','5% = half of 10% = 4','35% = 24 + 4 = 28']},
 tips:['A discount means take the percentage away from the price.','10% of 60 is 6. Dividing by 100 gives 1%, not 10%.','All the parts of a whole add up to 100%.'],
}};
const pctOf:Template=r=>{
 const p=r.pick([15,20,25,30,35,40,45,60,65,70,75,85,90]),N=r.int(4,40)*20,ans=p*N/100;
 const c=choices(ans,[N/10,N-ans,ans/10,(p-5)*N/100,p]);if(!c)return null;
 const tens=p-p%10,parts=[tens>10?`${tens}% = ${tens/10} × ${num(N/10)} = ${num(tens*N/100)}`:null,p%10===5?`5% = half of 10% = ${num(N/20)}`:null].filter((x):x is string=>!!x);
 return {...c,prompt:`What is ${p}% of ${num(N)}?`,rewardGroup:'quick',
  explanation:explain(bullets(`10% of ${num(N)} = ${num(N/10)}`,...parts,...(p%10===5?[`${p}% = ${num(tens*N/100)} + ${num(N/20)} = ${num(ans)}`]:[])),`So ${p}% of ${num(N)} is ${num(ans)}.`),
  audit:{k:'expr',e:`${p}/#100*${N}`}};
};
const pctDiscount:Template=(r,i)=>{
 const up=i%3===2,p=r.pick([10,15,20,25,30,40]),[item,lo,hi]=r.pick([['board game',12,40],['pair of trainers',30,90],['jacket',30,120],['bike',80,300],['tent',60,250],['telescope',60,200]] as const),step=p===15?20:p===25?4:10;
 const P=r.int(Math.ceil(lo/step),Math.floor(hi/step))*step,change=p*P/100,ans=up?P+change:P-change;
 const c=moneyChoices(ans,[change,up?P-change:P+change,up?P+p:P-p,ans+change]);if(!c)return null;
 return {...c,prompt:up?`A ${item} costs £${P}. The price goes up by ${p}%. What is the new price?`:`A ${item} costs £${P}. In a sale it is reduced by ${p}%. What is the sale price?`,
  explanation:explain(bullets(`${p}% of £${P} = £${num(change)}`,up?`New price: £${P} + £${num(change)} = ${gbp(ans)}`:`Sale price: £${P} − £${num(change)} = ${gbp(ans)}`),`If you chose ${gbp(change)}, that is the ${up?'increase':'discount'}, not the ${up?'new':'sale'} price.`),
  audit:{k:'expr',e:up?`${P}+${p}/#100*${P}`:`${P}-${p}/#100*${P}`}};
};
const pctWhat:Template=r=>{
 const t=r.pick([20,25,50,10,4]),s=r.int(1,t-1),ans=s*100/t;if(!Number.isInteger(ans))return null;const who=r.pick(NAMES);
 const c=choices(ans,[s,t-s,100-ans,s*2],x=>`${num(x)}%`);if(!c)return null;
 return {...c,prompt:`${who} scores ${s} out of ${t} in a spelling test. What percentage is that?`,rewardGroup:'quick',
  explanation:explain(bullets(`${s} out of ${t} = ${s}/${t}`,`Multiply the top and bottom by ${100/t}: ${s}/${t} = ${ans}/100`,`${ans}/100 = ${ans}%`)),
  audit:{k:'expr',e:`${s}/${t}*#100`,as:'pct'}};
};
const pctGrid:Template=r=>{
 const n=r.pick([100,50,20,25]),k=r.int(1,n-1),ans=k*100/n;if(!Number.isInteger(ans))return null;
 const c=choices(ans,[k,100-ans,n-k===ans?k*2:n-k,ans+10].filter(x=>x>0&&x<100),x=>`${num(x)}%`);if(!c)return null;
 return {...c,prompt:'What percentage of the grid is shaded?',rewardGroup:n===100?'quick':'standard',
  visual:shadedShape(r,n,k,false,`A grid of ${n} equal squares, some shaded`),
  explanation:explain(bullets(`${k} of the ${n} squares are shaded: ${k}/${n}.`,n===100?`Out of 100, that is ${k}%.`:`Multiply the top and bottom by ${100/n}: ${k}/${n} = ${ans}/100 = ${ans}%.`),n!==100?`The grid has ${n} squares, not 100, so ${k}% would be wrong.`:null),
  audit:{k:'shaded',as:'pct'}};
};
const pctCompare:Template=r=>{
 const items=Array.from({length:4},()=>{const p=r.pick([5,10,15,20,25,30,40,50,60,75]),N=r.int(2,20)*20;return {p,N,v:p*N/100};});
 const vs=items.map(x=>x.v),mx=Math.max(...vs);if(vs.filter(v=>v===mx).length!==1||new Set(items.map(x=>`${x.p}-${x.N}`)).size<4)return null;
 const s=(x:typeof items[0])=>`${x.p}% of ${num(x.N)}`,best=items[vs.indexOf(mx)],o=words4(s(best),items.filter(x=>x!==best).map(s));if(!o)return null;
 return {...o,prompt:'Which is the **largest** amount?',explanation:explain(bullets(...items.map(x=>`${s(x)} = ${num(x.v)}`)),`The largest is ${s(best)}.`),audit:{k:'largestOf'}};
};
const pctTwoStep:Template=r=>{
 const N=r.int(4,20)*20,p1=r.pick([10,20,25,30,40,50]),p2=r.pick([10,20,25,50]),after1=N*(100-p1)/100,ans=after1*(100-p2)/100;if(!Number.isInteger(ans))return null;
 const c=choices(ans,[N*(100-p1-p2)/100,N*p1/100,after1,after1*p2/100]);if(!c)return null;
 return {...c,prompt:`The Quest Shop has ${N} potions. On Monday it sells ${p1}% of them. On Tuesday it sells ${p2}% of the potions that are left. How many potions are left after Tuesday?`,rewardGroup:'extended',
  explanation:explain(bullets(`Monday: ${p1}% of ${N} = ${N*p1/100}, so ${after1} are left.`,`Tuesday: ${p2}% of ${after1} = ${after1*p2/100}, so ${ans} are left.`),`Taking ${p1+p2}% of ${N} in one go gives ${N*(100-p1-p2)/100}, but Tuesday's ${p2}% is of what is left, not of ${N}.`),
  audit:{k:'expr',e:`${N}*(#100-${p1})/#100*(#100-${p2})/#100`}};
};

// ───────────────────────── Fractions, decimals and percentages
const fdp:Topic={id:'ma-fdp',subject:'Maths',strand:'Fractions, decimals and percentages',title:'Fractions, decimals and percentages',helpsheet:{
 intro:'Fractions, decimals and percentages can all show the same amount: 1/4 = 0.25 = 25%.',
 steps:['Fraction to decimal: make the denominator 10, 100 or 1,000, or divide the numerator by the denominator.','Decimal to percentage: multiply by 100 (0.35 = 35%).','Percentage to fraction: write it over 100 and simplify (35% = 35/100 = 7/20).','To order a mixture, change them all into the same form first.'],
 example:{title:'3/20 as a decimal and a percentage',lines:['Multiply the top and bottom by 5: 3/20 = 15/100.','15/100 = 0.15 = 15%']},
 tips:['Learn the key facts: 1/2 = 0.5 = 50%, 1/5 = 0.2 = 20%, 1/8 = 0.125 = 12.5%.','0.4 is 40%, not 4%.','Make the denominator 100 when you can: 7/25 = 28/100 = 28%.'],
}};
const FDP:[Q,number][]=[[[1,2],.5],[[1,4],.25],[[3,4],.75],[[1,5],.2],[[2,5],.4],[[3,5],.6],[[4,5],.8],[[1,8],.125],[[3,8],.375],[[5,8],.625],[[7,8],.875],[[1,10],.1],[[3,10],.3],[[7,10],.7],[[9,10],.9],[[1,20],.05],[[3,20],.15],[[7,20],.35],[[9,20],.45],[[11,20],.55],[[1,25],.04],[[3,25],.12],[[7,25],.28],[[1,50],.02],[[9,50],.18],[[3,50],.06]];
const fdpToDec:Template=r=>{
 const [q,v]=r.pick(FDP),rev=Number(`0.${String(q[1])}${q[0]}`),w=[Number(`${q[0]}.${q[1]}`),Number(`0.${q[0]}${q[1]}`),tidy(q[0]/10),rev,tidy(v*10)];
 const c=choices(v,w,x=>num(x));if(!c)return null;
 return {...c,prompt:`Which decimal is equal to **${fraw(q)}**?`,rewardGroup:'quick',
  explanation:explain(bullets(100%q[1]===0?`Multiply the top and bottom by ${100/q[1]}: ${fraw(q)} = ${q[0]*100/q[1]}/100.`:`${q[0]} ÷ ${q[1]} = ${num(v)}`,`${fraw(q)} = ${num(v)}`),c.wrong.includes(num(Number(`${q[0]}.${q[1]}`)))?`${num(Number(`${q[0]}.${q[1]}`))} just puts the digits either side of a decimal point, which is not the same thing.`:null),
  audit:{k:'fdpEqual',target:fraw(q)}};
};
const fdpPercent:Template=(r,i)=>{
 const [q,v]=r.pick(FDP.filter(([,v])=>Number.isInteger(tidy(v*100)))),p=tidy(v*100);
 if(i%2===0){const c=choices(p,[q[0],tidy(q[0]*q[1]),p/10,tidy(100-p),Number(`${q[0]}${q[1]}`)].filter(x=>x<100),x=>`${num(x)}%`);if(!c)return null;
  return {...c,prompt:`Which percentage is equal to **${fraw(q)}**?`,
   explanation:explain(bullets(`Make the denominator 100: ${fraw(q)} = ${p}/100.`,`${p}/100 = ${p}%`)),audit:{k:'fdpEqual',target:fraw(q)}};}
 const c=fracChoices(q,[[p,10],[1,p],simp([100-p,100]),simp([p,1000])],fmix);if(!c)return null;
 return {...c,prompt:`Which fraction is equal to **${p}%**?`,
  explanation:explain(bullets(`${p}% = ${p}/100`,`Simplify: ${p}/100 = ${fmix(q)}`)),audit:{k:'fdpEqual',target:`${p}%`}};
};
const fdpOdd:Template=r=>{
 const [q,v]=r.pick(FDP.filter(([,v])=>v>=0.1&&Number.isInteger(tidy(v*100)))),p=tidy(v*100),eq=[fraw(q),num(v),`${p}%`,fraw([q[0]*2,q[1]*2])],bad=r.pick([num(tidy(v/10)),`${tidy(p/10)}%`,fraw([q[1],q[0]]),num(tidy(q[0]/10+q[1]/100))]);
 if(Math.abs(fdpVal(bad)-v)<1e-9)return null;
 const o=words4(bad,eq);if(!o)return null;
 return {...o,prompt:'Which of these is **NOT** equal to the others?',rewardGroup:'standard',
  explanation:explain(bullets(...eq.filter(x=>o.wrong.includes(x)&&x!==num(v)).map(x=>`${x} = ${num(v)}`),`${bad} = ${num(tidy(fdpVal(bad)))}`),`So ${bad} is the odd one out.`),
  audit:{k:'oddValue'}};
};
const fdpOrder:Template=(r,i)=>{
 const big=i%2===0,picks=r.sample(FDP.filter(([,v])=>v>0.1&&v<0.9),4);const forms=r.shuffle([0,1,2,2]).map((f,k)=>{const [q,v]=picks[k];return f===0?fraw(q):f===1?num(v):`${num(tidy(v*100))}%`;});
 const vals=forms.map(fdpVal),best=big?Math.max(...vals):Math.min(...vals);if(vals.filter(v=>Math.abs(v-best)<1e-9).length!==1||new Set(vals.map(v=>tidy(v))).size<4)return null;
 const ans=forms[vals.indexOf(best)],o=words4(ans,forms.filter(x=>x!==ans));if(!o)return null;
 return {...o,prompt:`Which of these is the **${big?'largest':'smallest'}**?`,
  explanation:explain('Change them all to decimals:',bullets(...forms.map(f=>`${f} = ${num(tidy(fdpVal(f)))}`)),`The ${big?'largest':'smallest'} is ${ans}.`),
  audit:{k:'extreme',dir:big?'max':'min'}};
};
const fdpStory:Template=r=>{
 const [q,v]=r.pick(FDP.filter(([,v])=>v>=0.2&&v<=0.6)),d=r.pick([0.1,0.15,0.2,0.25,0.3]),rest=tidy(1-v-d);if(rest<=0.04||!Number.isInteger(tidy(rest*100)))return null;
 const [a,b,c0]=r.pick([['apples','pears','bananas'],['football','netball','swimming'],['red','blue','green'],['dogs','cats','rabbits']]);
 const ans=tidy(rest*100),c=choices(ans,[tidy((v+d)*100),tidy(100-v*100),tidy(100-d*100),tidy(ans+10)],x=>`${num(x)}%`);if(!c)return null;
 return {...c,prompt:`In a class survey, ${fraw(q)} of the pupils chose ${a} and ${num(d)} of them chose ${b}. Everyone else chose ${c0}. What percentage chose ${c0}?`,rewardGroup:'challenge',
  explanation:explain(bullets(`${fraw(q)} = ${num(tidy(v*100))}% and ${num(d)} = ${num(tidy(d*100))}%.`,`${num(tidy(v*100))}% + ${num(tidy(d*100))}% = ${num(tidy((v+d)*100))}%`,`100% − ${num(tidy((v+d)*100))}% = ${num(ans)}%`),'The whole class is 100%.'),
  audit:{k:'expr',e:`(#1-${q[0]}/${q[1]}-${d})*#100`,as:'pct'}};
};
const fdpGrid:Template=r=>{
 const k=r.int(2,98);if(gcd(k,100)===1)return null;const q=simp([k,100]);
 const c=fracChoices(q,[[k,10],[100-k,100],[q[0],q[1]*10],[q[0]+1,q[1]]],fmix);if(!c)return null;
 return {...c,prompt:'What fraction of the grid is shaded? Give it in its simplest form.',
  visual:shadedShape(r,100,k,false,'A grid of 100 equal squares, some shaded'),
  explanation:explain(bullets(`${k} of the 100 squares are shaded: ${k}/100 = ${num(k/100)} = ${k}%.`,`Simplify ${k}/100 by dividing by ${gcd(k,100)}: ${fmix(q)}.`)),
  audit:{k:'shaded',as:'simplest'}};
};

export const fdpTopics:BuiltTopic[]=[
 topicSet(equivalent,20,[eqPicture,eqMissing,eqSimplify,eqNot,eqMixed,eqWall]),
 topicSet(comparing,20,[cmpExtreme,cmpSign,cmpBetween,cmpOrder,cmpWho,cmpPictures]),
 topicSet(addSub,20,[asSame,asDiff,asMixed,asStory,asBar,asMissing]),
 topicSet(mulDiv,20,[mdWhole,mdFrac,mdDiv,mdHowMany,mdStory,mdArea]),
 topicSet(ofAmounts,20,[foaBasic,foaReverse,foaMoney,foaClass,foaMeasure,foaLargest]),
 topicSet(decimals,20,[decDigit,decExtreme,decAddSub,decTimes,decRound,decMultiply]),
 topicSet(percentages,20,[pctOf,pctDiscount,pctWhat,pctGrid,pctCompare,pctTwoStep]),
 topicSet(fdp,20,[fdpToDec,fdpPercent,fdpOdd,fdpOrder,fdpStory,fdpGrid]),
];
