import {num,explain,bullets,NAMES,cap,gcd,type Topic,type BuiltTopic,type Rng} from './bank-kit';
import type {Visual} from './visual';
import {topicSet,choices,words4,fracChoices,fmix,fraw,fadd,fsub,fmul,fdiv,fval,gbp,moneyChoices,tidy,sum,range,polyFigure,type Template,type Q} from './bank-maths-util';
import {addNoCarry,subSmallFromLarge} from './bank-maths-number';
// Maths, SATs practice strand: original questions in the style of the KS2 SATs papers from 2022 onwards (Paper 1
// arithmetic, Papers 2 and 3 reasoning). Nothing is copied from a real paper: the templates reproduce the question
// *forms* (answer box first, missing numbers, digit cards, think-of-a-number, multi-step problems, "which statement is
// true") with their own numbers and contexts. tests/bank-maths.cjs re-solves every question independently.

const lcm=(a:number,b:number)=>a*b/gcd(a,b);
const dig=(n:number,p:number)=>Math.floor(n/p)%10;
const COLS=['Ones','Tens','Hundreds','Thousands','Ten thousands','Hundred thousands'];
const len=(n:number)=>String(n).length;
/** Column addition, one line per column. */
function addLines(a:number,b:number){const out:string[]=[];let carry=0;const n=Math.max(len(a),len(b));for(let c=0;c<n;c++){const x=dig(a,10**c),y=dig(b,10**c),s=x+y+carry;out.push(`${COLS[c]}: ${x} + ${y}${carry?' + 1':''} = ${s}${s>=10?`, write ${s%10} and carry 1`:''}`);carry=s>=10?1:0;}if(carry)out.push(`Write the carried 1 in the ${COLS[n].toLowerCase()} column.`);return out;}
/** Short division, one line per digit. */
function divLines(n:number,d:number){const out:string[]=[];let r=0;for(const ch of String(n)){const v=r*10+Number(ch),k=Math.floor(v/d);r=v%d;if(v<d&&!out.length)continue;out.push(`${num(v)} ÷ ${d} = ${k}${r?` remainder ${r}`:''}`);}return out;}
/** How the fraction sum was done with a common denominator. */
function common(a:Q,b:Q,op:'+'|'−'){const L=lcm(a[1],b[1]),A=a[0]*L/a[1],B=b[0]*L/b[1],res=op==='+'?fadd(a,b):fsub(a,b),raw=`${op==='+'?A+B:A-B}/${L}`;
 return bullets(...(a[1]===b[1]?[]:[`A common denominator is ${L}: ${fraw(a)} = ${A}/${L} and ${fraw(b)} = ${B}/${L}.`]),`${A}/${L} ${op} ${B}/${L} = ${raw}`,...(fmix(res)!==raw?[`${raw} = ${fmix(res)}`]:[]));}
const boxed=(r:Rng,left:string,right:string)=>r.chance(.5)?`☐ = ${left} ${right}`:`${left} ${right} = ☐`;

// ───────────────────────── SATs arithmetic: whole numbers
const arithmetic:Topic={id:'ma-sats-arithmetic',subject:'Maths',strand:'SATs practice',title:'SATs arithmetic: whole numbers',helpsheet:{
 intro:'The SATs arithmetic paper has 36 questions in 30 minutes, so you need quick, reliable methods. Most questions use the four operations with whole numbers, and some put the answer box first, such as ☐ = 36 × 7.',
 steps:['Read the sign carefully: + − × ÷. Decide whether you can do it in your head or need a written method.','Line up the digits by place value for column addition and subtraction. Remember carries and exchanges.','To multiply or divide by 10, 100 or 1,000, move every digit the right number of places. Do not just add or cross off a zero.','Long multiplication: multiply by the ones, then by the tens with a place-holder 0, then add. Long division: how many times does the divisor go into each part?','Do the operations in the right order: brackets, then indices (squares and cubes), then ÷ and ×, then + and −.'],
 example:{title:'1,000 − 437',lines:['Exchange across the zeros: 1,000 becomes 9 hundreds, 9 tens and 10 ones.','Ones: 10 − 7 = 3. Tens: 9 − 3 = 6. Hundreds: 9 − 4 = 5.','Answer: 563. Check: 563 + 437 = 1,000.']},
 tips:['☐ = 48 ÷ 6 means the same as 48 ÷ 6 = ☐.','Estimate first: 1,243 × 23 is about 1,200 × 20 = 24,000, so an answer of 2,860 must be wrong.','In 90 − 56 ÷ 8, do the division first: 56 ÷ 8 = 7, then 90 − 7 = 83.'],
}};
const saAddSub:Template=(r,i)=>{
 const add=i%2===0,a=r.int(1050,9899),b=r.pick([r.int(26,99),r.int(126,999)]);
 if(add&&addNoCarry(a,b)===a+b)return null;if(!add&&subSmallFromLarge(a,b)===a-b)return null;
 const ans=add?a+b:a-b,wrong=add?[addNoCarry(a,b),ans+10,ans-100,ans+1]:[subSmallFromLarge(a,b),ans-10,ans+100,ans-1];
 const c=choices(ans,wrong.filter(x=>x>0));if(!c)return null;const s=boxed(r,num(a),`${add?'+':'−'} ${num(b)}`);
 return {...c,prompt:'What number goes in the box?',stimulus:s,rewardGroup:'quick',
  explanation:explain(add?'Set it out in columns and work from the ones:':'Set it out in columns. Where the top digit is smaller, exchange 1 from the column to the left.',bullets(...(add?addLines(a,b):[`${num(a)} − ${num(b)} = ${num(ans)}`])),add?`Answer: ${num(ans)}`:`Check: ${num(ans)} + ${num(b)} = ${num(a)}.`,add?`If you chose ${num(addNoCarry(a,b))}, you forgot a carry.`:`If you chose ${num(subSmallFromLarge(a,b))}, you took the smaller digit from the larger one instead of exchanging.`),
  audit:{k:'box',s}};
};
const saMulDiv:Template=(r,i)=>{
 if(i%2===0){const a=r.pick([r.int(23,98),r.int(123,987)]),b=r.int(3,9);if(a%10===0||dig(a,1)*b<10)return null;const ans=a*b;
  const c=choices(ans,[(a-a%10)*b+a%10,ans+10*b,ans-b,a*(b+1)].filter(x=>x>0));if(!c)return null;const s=boxed(r,num(a),`× ${b}`);
  const parts=range(0,len(a)-1).map(k=>dig(a,10**k)*10**k).filter(x=>x).reverse();
  return {...c,prompt:'What number goes in the box?',stimulus:s,rewardGroup:'quick',
   explanation:explain('Split the number by place value and multiply each part:',bullets(...parts.map(p=>`${num(p)} × ${b} = ${num(p*b)}`),`${parts.map(p=>num(p*b)).join(' + ')} = ${num(ans)}`),`If you chose ${num((a-a%10)*b+a%10)}, you forgot to multiply the ones.`),
   audit:{k:'box',s}};}
 const d=r.int(3,9),q=r.int(120,1400),n=q*d;if(dig(n,1)===0||String(n).includes('0')&&r.chance(.5))return null;
 const c=choices(q,[q+d,q-1,q*10,q+10,q+1]);if(!c)return null;const s=boxed(r,num(n),`÷ ${d}`);
 return {...c,prompt:'What number goes in the box?',stimulus:s,
  explanation:explain('Use short division, working from the left:',bullets(...divLines(n,d)),`Answer: ${num(q)}. Check: ${num(q)} × ${d} = ${num(n)}.`),
  audit:{k:'box',s}};
};
const saPlaceValue:Template=(r,i)=>{
 const f=r.pick([10,100,1000]),mult=i%2===0,places=Math.log10(f);
 if(mult){const a=r.int(12,999);if(a%10===0)return null;const ans=a*f;
  const c=choices(ans,[ans/10,ans*10,a+f,Number(String(a)+'0'.repeat(places+1))]);if(!c)return null;const s=boxed(r,num(a),`× ${num(f)}`);
  return {...c,prompt:'What number goes in the box?',stimulus:s,rewardGroup:'quick',
   explanation:explain(bullets(`Multiplying by ${num(f)} moves every digit ${places} place${places>1?'s':''} to the left.`,`${num(a)} × ${num(f)} = ${num(ans)}`),`The digits ${String(a).split('').join(', ')} stay in the same order, and ${places===1?'a zero fills':`${places} zeros fill`} the empty place${places>1?'s':''} on the right.`),
   audit:{k:'box',s}};}
 const q=r.int(12,999);if(q%10===0)return null;const a=q*f;
 const c=choices(q,[q*10,q/10,a-f,q*100,q/100].filter(x=>Number.isInteger(x)&&x>0));if(!c)return null;const s=boxed(r,num(a),`÷ ${num(f)}`);
 return {...c,prompt:'What number goes in the box?',stimulus:s,rewardGroup:'quick',
  explanation:explain(bullets(`Dividing by ${num(f)} moves every digit ${places} place${places>1?'s':''} to the right.`,`${num(a)} ÷ ${num(f)} = ${num(q)}`),`Check: ${num(q)} × ${num(f)} = ${num(a)}.`),
  audit:{k:'box',s}};
};
const saLong:Template=(r,i)=>{
 if(i%2===0){const a=r.pick([r.int(1123,4987),r.int(234,987)]),b=r.int(23,78);if(b%10===0||a%10===0)return null;const t=Math.floor(b/10),u=b%10,ans=a*b;
  const c=choices(ans,[a*t+a*u,ans+a*10,ans-a,a*u*10+a*t]);if(!c)return null;const s=boxed(r,num(a),`× ${b}`);
  return {...c,prompt:'What number goes in the box? Use long multiplication.',stimulus:s,rewardGroup:'challenge',
   explanation:explain(bullets(`${num(a)} × ${u} = ${num(a*u)}`,`${num(a)} × ${t*10} = ${num(a*t*10)} (the place-holder 0 makes it ${t*10}, not ${t})`,`${num(a*u)} + ${num(a*t*10)} = ${num(ans)}`),`Estimate: ${num(Math.round(a/100)*100)} × ${Math.round(b/10)*10} ≈ ${num(Math.round(a/100)*100*Math.round(b/10)*10)}, so ${num(ans)} is sensible. If you chose ${num(a*t+a*u)}, you forgot the place-holder 0.`),
   audit:{k:'box',s}};}
 const d=r.int(12,38),q=r.int(23,98)+(r.chance(.5)?r.int(100,400):0),n=q*d;if(d%10===0)return null;
 const c=choices(q,[q+1,q-1,q+10,q+d,q-10].filter(x=>x>0));if(!c)return null;const s=boxed(r,num(n),`÷ ${d}`);
 const chunks=[q-q%100,q%100-q%10,q%10].filter(x=>x);let left=n;const lines=chunks.map(ch=>{const line=`${d} × ${num(ch)} = ${num(d*ch)}, leaving ${num(left)} − ${num(d*ch)} = ${num(left-d*ch)}`;left-=d*ch;return line;});
 return {...c,prompt:'What number goes in the box? Use long division.',stimulus:s,rewardGroup:'challenge',
  explanation:explain(`Take away multiples of ${d} in chunks:`,bullets(...lines,`${chunks.map(x=>num(x)).join(' + ')} = ${num(q)}`),`Check: ${num(q)} × ${d} = ${num(n)}.`),
  audit:{k:'box',s}};
};
const saOrder:Template=(r,i)=>{
 const v=i%4;let s:string,ans:number,wrong:number[],why:string;
 if(v===0){const a=r.int(2,9),b=r.int(2,5);ans=a+b**3;s=`${a} + ${b}³`;wrong=[a+b*3,(a+b)**3,a+b*b,a*b**3];why=`${b}³ means ${b} × ${b} × ${b} = ${b**3}, not ${b} × 3. Work out the cube first, then add.`;}
 else if(v===1){const c=r.int(3,9),k=r.int(3,12),B=c*k,A=B+c*r.int(1,Math.floor((99-B)/c));if(A>99||A===B)return null;ans=A-k;s=`${A} − ${B} ÷ ${c}`;wrong=[(A-B)/c,A-B,A+k,A-B-c];why=`Division comes before subtraction: ${B} ÷ ${c} = ${k} first, then ${A} − ${k} = ${ans}. Working left to right (${A} − ${B}, then ÷ ${c}) gives ${num((A-B)/c)}, which is wrong.`;}
 else if(v===2){const a=r.int(4,19),b=r.int(3,18),c=r.int(3,9);ans=(a+b)*c;s=`(${a} + ${b}) × ${c}`;wrong=[a+b*c,a*c+b,a+b+c,(a+b)*(c+1)];why=`Brackets first: ${a} + ${b} = ${a+b}, then × ${c} = ${ans}. Without the brackets, ${a} + ${b} × ${c} would be ${a+b*c}.`;}
 else{const a=r.int(3,9),c=r.int(2,6),d=r.int(5,30);if(a*a*c<=d)return null;ans=a*a*c-d;s=`${a}² × ${c} − ${d}`;wrong=[a*2*c-d,a*a*(c-d),a*a*c+d,a*a*c*d];why=`Indices first: ${a}² = ${a*a}. Then multiply: ${a*a} × ${c} = ${a*a*c}. Then subtract: ${a*a*c} − ${d} = ${ans}. ${a}² is ${a} × ${a}, not ${a} × 2.`;}
 const c=choices(ans,wrong.filter(x=>x>0&&Number.isInteger(x)));if(!c)return null;
 return {...c,prompt:'Work out the answer.',stimulus:s,rewardGroup:v===1||v===3?'challenge':'standard',
  explanation:explain(bullets('Order of operations: brackets, indices, division and multiplication, addition and subtraction.',why)),
  audit:{k:'expr',e:s.replace('³','^3').replace('²','^2')}};
};

// ───────────────────────── SATs arithmetic: fractions, decimals and percentages
const fdp:Topic={id:'ma-sats-arithmetic-fdp',subject:'Maths',strand:'SATs practice',title:'SATs arithmetic: fractions, decimals and percentages',helpsheet:{
 intro:'About a third of the arithmetic paper is fractions, decimals and percentages: adding and subtracting fractions with different denominators, multiplying fractions, finding fractions and percentages of amounts, and calculating with decimals.',
 steps:['Adding or subtracting fractions: change them to the same denominator first, then add or subtract the numerators only.','Mixed numbers: deal with the wholes and the fraction parts separately, exchanging a whole if the fraction part would go below zero.','Multiplying fractions: multiply the numerators and multiply the denominators, then simplify. Dividing a fraction by a whole number makes the pieces smaller: multiply the denominator.','A percentage is out of 100: 10% is ÷ 10, 1% is ÷ 100, and other percentages are built from those (35% = 25% + 10%, or 3 × 10% + 5 × 1%).','Decimals: line up the decimal points in columns. Multiplying by 10, 100 or 1,000 moves the digits left; dividing moves them right.'],
 example:{title:'2 1/6 − 2/3',lines:['Common denominator 6: 2 1/6 − 4/6.','1/6 is smaller than 4/6, so exchange a whole: 2 1/6 = 1 7/6.','1 7/6 − 4/6 = 1 3/6 = 1 1/2']},
 tips:['Never add the denominators: 1/2 + 1/3 is 5/6, not 2/5.','99% of 600 is quick: 600 − 1% of 600 = 600 − 6 = 594.','0.9 + 0.57 is 1.47, not 0.66: line up the tenths with the tenths.'],
}};
const fdAddSub:Template=(r,i)=>{
 const d1=r.pick([2,3,4,5,6]),d2=r.pick([3,4,6,8,9,10,12]);if(d1===d2||lcm(d1,d2)>24)return null;const L=lcm(d1,d2);
 const a:Q=[r.int(1,d1-1),d1],b:Q=[r.int(1,d2-1),d2];if(gcd(a[0],d1)!==1||gcd(b[0],d2)!==1)return null;
 if(i%2===0){const add=r.chance(.5);if(!add&&fval(a)<=fval(b))return null;const ans=add?fadd(a,b):fsub(a,b);
  const c=fracChoices(ans,[add?[a[0]+b[0],d1+d2]:[Math.abs(a[0]-b[0]),Math.abs(d1-d2)||1],add?fsub(a,b):fadd(a,b),[a[0]*b[0],d1*d2],fadd(ans,[1,L])]);if(!c)return null;
  return {...c,prompt:'Work out the answer. Give it in its simplest form.',stimulus:`${fraw(a)} ${add?'+':'−'} ${fraw(b)}`,
   explanation:explain(common(a,b,add?'+':'−'),add?`Adding the denominators gives ${a[0]+b[0]}/${d1+d2}, which is wrong: the denominators must be made the same first.`:'Make the denominators the same before subtracting the numerators.'),
   audit:{k:'expr',e:`${a[0]}/${d1}${add?'+':'-'}${b[0]}/${d2}`}};}
 if(fval(a)>=fval(b))return null;const w=r.int(2,6),A:Q=[w*d1+a[0],d1],ans=fsub(A,b);
 const c=fracChoices(ans,[fadd(A,b),fadd(ans,[1,1]),fsub(ans,[1,L]),fadd([w,1],fsub(b,a))]);if(!c)return null;
 const A6=a[0]*L/d1,B6=b[0]*L/d2;
 return {...c,prompt:'Work out the answer. Give it in its simplest form.',stimulus:`${w} ${fraw(a)} − ${fraw(b)}`,rewardGroup:'challenge',
  explanation:explain(bullets(`Common denominator ${L}: ${w} ${A6}/${L} − ${B6}/${L}.`,`${A6}/${L} is less than ${B6}/${L}, so exchange a whole: ${w} ${A6}/${L} = ${w-1} ${A6+L}/${L}.`,`${w-1} ${A6+L}/${L} − ${B6}/${L} = ${w-1} ${A6+L-B6}/${L}${fmix(ans)!==`${w-1} ${A6+L-B6}/${L}`?` = ${fmix(ans)}`:''}`),`If you chose ${fmix(fadd(ans,[1,1]))}, you exchanged a whole but forgot to reduce the ${w}.`),
  audit:{k:'expr',e:`${w}+${a[0]}/${d1}-${b[0]}/${d2}`}};
};
const fdMulDiv:Template=(r,i)=>{
 const v=i%3;
 if(v===0){const a:Q=[r.int(1,5),r.pick([2,3,4,5,6,7,8])],b:Q=[r.int(1,5),r.pick([3,4,5,6,8,9])];if(fval(a)>=1||fval(b)>=1||gcd(a[0],a[1])!==1||gcd(b[0],b[1])!==1)return null;const ans=fmul(a,b);
  const c=fracChoices(ans,[[a[0]*b[0],a[1]+b[1]],[a[0]*b[1],a[1]*b[0]],[a[0]+b[0],a[1]*b[1]],fadd(a,b)]);if(!c)return null;
  return {...c,prompt:'Work out the answer. Give it in its simplest form.',stimulus:`${fraw(a)} × ${fraw(b)}`,
   explanation:explain(bullets(`Multiply the numerators: ${a[0]} × ${b[0]} = ${a[0]*b[0]}`,`Multiply the denominators: ${a[1]} × ${b[1]} = ${a[1]*b[1]}`,`${a[0]*b[0]}/${a[1]*b[1]}${fmix(ans)!==`${a[0]*b[0]}/${a[1]*b[1]}`?` = ${fmix(ans)} in its simplest form`:''}`),`If you chose ${fmix([a[0]*b[0],a[1]+b[1]])}, you added the denominators instead of multiplying them.`),
   audit:{k:'expr',e:`${a[0]}/${a[1]}*${b[0]}/${b[1]}`}};}
 if(v===1){const a:Q=[r.int(1,7),r.pick([3,4,5,6,8,9,10])],n=r.int(2,6);if(fval(a)>=1||gcd(a[0],a[1])!==1)return null;const ans=fdiv(a,[n,1]);
  const c=fracChoices(ans,[fmul(a,[n,1]),[a[0],a[1]+n],[n*a[1],a[0]],fsub(a,[1,n])]);if(!c)return null;
  return {...c,prompt:'Work out the answer. Give it in its simplest form.',stimulus:`${fraw(a)} ÷ ${n}`,
   explanation:explain(bullets(`Dividing by ${n} makes the pieces ${n} times smaller, so multiply the denominator by ${n}.`,`${fraw(a)} ÷ ${n} = ${a[0]}/${a[1]*n}${fmix(ans)!==`${a[0]}/${a[1]*n}`?` = ${fmix(ans)}`:''}`),`If you chose ${fmix(fmul(a,[n,1]))}, you multiplied instead of dividing.`),
   audit:{k:'expr',e:`${a[0]}/${a[1]}/${n}`}};}
 const d=r.pick([2,3,4,5,6,8]),a=r.int(1,d-1),w=r.int(1,4),n=r.pick([d,2*d,3*d,12,20].filter(x=>x%d===0&&x>=4&&x<=40));if(gcd(a,d)!==1)return null;const A:Q=[w*d+a,d],ans=fmul(A,[n,1]);
 const c=fracChoices(ans,[fadd([w*n,1],[a,d]),[w*n,1],fadd(ans,[n,1]),fmul([w,1],[n,1])]);if(!c)return null;
 return {...c,prompt:'Work out the answer.',stimulus:`${w} ${a}/${d} × ${n}`,rewardGroup:'challenge',
  explanation:explain(bullets(`Multiply the whole part: ${w} × ${n} = ${w*n}`,`Multiply the fraction part: ${a}/${d} × ${n} = ${a*n}/${d} = ${fmix([a*n,d])}`,`${w*n} + ${fmix([a*n,d])} = ${fmix(ans)}`),`If you chose ${fmix(fadd([w*n,1],[a,d]))}, you multiplied only the whole number and left the fraction unchanged.`),
  audit:{k:'expr',e:`(${w}+${a}/${d})*${n}`}};
};
const PCT=[1,2,3,5,7,9,10,11,13,15,17,19,20,21,23,25,30,35,40,43,45,47,50,55,60,65,70,75,80,85,90,95,99];
const fdPercent:Template=r=>{
 const p=r.pick(PCT),N=p%5===0?r.int(2,45)*20:r.pick([200,300,400,500,600,700,800,900,1200,1500,2000]),ans=p*N/100;if(!Number.isInteger(ans))return null;
 const c=choices(ans,[N-ans,ans*10,ans/10,(100-p)*N/100,p*N/10].filter(x=>Number.isInteger(x)&&x>0));if(!c)return null;
 const how=p===99?`1% of ${num(N)} is ${num(N/100)}, so 99% is ${num(N)} − ${num(N/100)} = ${num(ans)}.`:p%10===0?`10% of ${num(N)} is ${num(N/10)}, so ${p}% is ${p/10} × ${num(N/10)} = ${num(ans)}.`:p===25?`25% is a quarter: ${num(N)} ÷ 4 = ${num(ans)}.`:p===50?`50% is a half: ${num(N)} ÷ 2 = ${num(ans)}.`:p===75?`75% is three quarters: ${num(N)} ÷ 4 = ${num(N/4)}, then × 3 = ${num(ans)}.`:p%5===0?`10% of ${num(N)} is ${num(N/10)} and 5% is ${num(N/20)}, so ${p}% is ${Math.floor(p/10)} × ${num(N/10)} + ${num(N/20)} = ${num(ans)}.`:`1% of ${num(N)} is ${num(N/100)}, so ${p}% is ${p} × ${num(N/100)} = ${num(ans)}.`;
 return {...c,prompt:'Work out the answer.',stimulus:`${p}% of ${num(N)}`,rewardGroup:p%5===0?'quick':'standard',
  explanation:explain(bullets(`${p}% means ${p} out of every 100.`,how),`If you chose ${num(N-ans)}, you found the other ${100-p}% instead.`),
  audit:{k:'expr',e:`${p}/#100*${N}`}};
};
const fdDecimals:Template=(r,i)=>{
 const v=i%5;let s:string,ans:number,wrong:number[],lines:string[],slip:string,e:string;
 if(v===0){const a=r.int(11,99)/100,b=r.int(11,99)/10;if(Math.round(a*100)%10===0||Math.round(a*100)%100+Math.round(b*10)%10*10<100)return null;ans=tidy(a+b);s=`${num(a)} + ${num(b)}`;e=`${a}+${b}`;wrong=[tidy(a+b/10),tidy(ans-1),tidy(a*10+b),tidy(ans+0.1)];lines=[`Line up the decimal points: ${num(a,2)} + ${num(b,2)}.`,`Hundredths: ${Math.round(a*100)%10}. Tenths: ${Math.floor(a*10)%10} + ${Math.round(b*10)%10} = ${Math.floor(a*10)%10+Math.round(b*10)%10} tenths, so carry 1 into the ones.`,`${num(a)} + ${num(b)} = ${num(ans)}`];slip=`If you chose ${num(tidy(a+b/10))}, you lined up the last digits instead of the decimal points.`;}
 else if(v===1){const A=r.pick([5,7,8,10,12,15,20]),b=r.int(101,A*100-50)/100;if(Math.round(b*100)%10===0)return null;ans=tidy(A-b);s=`${A} − ${num(b)}`;e=`${A}-${b}`;const noEx=Number(`${A-Math.ceil(b)}.${String(100-Math.round(b*100)%100).padStart(2,'0')}`);wrong=[tidy(ans+0.1),tidy(ans-1),noEx,tidy(A-Math.floor(b))];lines=[`Write ${A} as ${num(A,2)} so the columns line up.`,`Count on from ${num(b)}: ${num(tidy(Math.ceil(b)-b))} makes ${Math.ceil(b)}, then ${A-Math.ceil(b)} more makes ${A}.`,`${num(tidy(Math.ceil(b)-b))} + ${A-Math.ceil(b)} = ${num(ans)}`];slip=`Check: ${num(ans)} + ${num(b)} = ${A}.`;}
 else if(v===2){const a=r.int(11,89)/10,b=r.int(12,49);if(Math.round(a*10)%10===0||b%10===0)return null;ans=tidy(a*b);s=`${num(a)} × ${b}`;e=`${a}*${b}`;wrong=[tidy(ans*10),tidy(ans/10),tidy(a*(b%10)+a*Math.floor(b/10)),tidy(ans+1)];lines=[`Work out ${Math.round(a*10)} × ${b} = ${num(Math.round(a*10)*b)}.`,`${num(a)} is ${Math.round(a*10)} ÷ 10, so divide the answer by 10: ${num(ans)}.`];slip=`Estimate: ${Math.round(a)} × ${Math.round(b/10)*10} ≈ ${Math.round(a)*Math.round(b/10)*10}, so ${num(ans)} is sensible.`;}
 else if(v===3){const a=r.int(101,999)/10;if(Math.round(a*10)%10===0)return null;ans=tidy(a/100);s=`${num(a)} ÷ 100`;e=`${a}/100`;wrong=[tidy(a/10),tidy(a/1000),tidy(a*100),tidy(ans+1)];lines=['Dividing by 100 moves every digit two places to the right.',`${num(a)} ÷ 100 = ${num(ans)}`];slip=`If you chose ${num(tidy(a/10))}, you only moved the digits one place.`;}
 else{const a=r.int(101,999)/100;if(Math.round(a*100)%10===0)return null;ans=tidy(a*1000);s=`${num(a)} × 1,000`;e=`${a}*1000`;wrong=[tidy(a*100),tidy(a*10000),tidy(a*10),ans+1];lines=['Multiplying by 1,000 moves every digit three places to the left.',`${num(a)} × 1,000 = ${num(ans)}`];slip=`If you chose ${num(tidy(a*100))}, you only moved the digits two places.`;}
 const c=choices(ans,wrong.filter(x=>x>0),x=>num(x));if(!c)return null;
 return {...c,prompt:'Work out the answer.',stimulus:s,rewardGroup:v===3||v===4?'quick':'standard',explanation:explain(bullets(...lines),slip),audit:{k:'expr',e}};
};
const fdOfAmount:Template=(r,i)=>{
 const d=r.pick([3,4,5,6,8,9,10,12]),a=r.int(2,d-1),N=d*r.int(6,60);if(gcd(a,d)!==1||N>720)return null;const ans=a*N/d;
 const c=choices(ans,[N/d,N-ans,ans+N/d,tidy(N*d/a)].filter(x=>Number.isInteger(x)&&x>0));if(!c)return null;
 const useOf=i%2===0,s=useOf?`${a}/${d} of ${num(N)}`:`☐ = ${a}/${d} × ${num(N)}`;
 return {...c,prompt:useOf?'Work out the answer.':'What number goes in the box?',stimulus:s,rewardGroup:'quick',
  explanation:explain(bullets(`Find 1/${d} of ${num(N)}: ${num(N)} ÷ ${d} = ${num(N/d)}`,`Then ${a}/${d} is ${a} × ${num(N/d)} = ${num(ans)}`),`If you chose ${num(N/d)}, you found only 1/${d}.`),
  audit:useOf?{k:'expr',e:`${a}/${d}*${N}`}:{k:'box',s}};
};

// ───────────────────────── SATs reasoning: missing numbers and digit puzzles
const missing:Topic={id:'ma-sats-missing-numbers',subject:'Maths',strand:'SATs practice',title:'SATs reasoning: missing numbers and digit puzzles',helpsheet:{
 intro:'The reasoning papers hide numbers in calculations, ask you to work backwards from an answer, and give you digit cards to arrange. The trick is always the same: use the inverse operation.',
 steps:['A missing number: work out what you would do to get from the numbers you know to the one you want. ☐ − 156 = 267 means ☐ = 267 + 156.','For ÷ and ×, remember that 324 ÷ ☐ = 18 means ☐ = 324 ÷ 18, and ☐ ÷ 6 = 25 means ☐ = 25 × 6.','Think-of-a-number puzzles: start from the final answer and undo each step in reverse order.','Digit cards: the greatest number puts the biggest digit first; for an even number, the ones digit must be even, so keep the biggest even digit for the end.','Missing digits in a column calculation: work column by column from the ones, remembering carries and exchanges.'],
 example:{title:'Think of a number',lines:['I think of a number, multiply it by 3 and add 5. The answer is 26.','Undo the + 5: 26 − 5 = 21.','Undo the × 3: 21 ÷ 3 = 7. The number was 7.','Check: 7 × 3 + 5 = 26.']},
 tips:['Always check by putting your number back into the original calculation.','Two numbers that add to 50 and differ by 8: take the difference away, halve what is left, then add the difference back to one of them.','Read "closest to" carefully: 4,987 is closer to 5,000 than 5,123 is.'],
}};
const mnBox:Template=(r,i)=>{
 const v=i%4;let s:string,ans:number,wrong:number[],how:string;
 if(v===0){const d=r.int(12,29),q=r.int(13,48),n=d*q;ans=d;s=`${num(n)} ÷ ☐ = ${q}`;wrong=[q,n-q,d+1,d*10];how=`☐ = ${num(n)} ÷ ${q} = ${d}. Check: ${num(n)} ÷ ${d} = ${q}.`;}
 else if(v===1){const d=r.int(3,12),q=r.int(21,99),n=d*q;ans=q;s=r.chance(.5)?`☐ × ${d} = ${num(n)}`:`${d} × ☐ = ${num(n)}`;wrong=[n*d,q+d,q+1,n-d];how=`☐ = ${num(n)} ÷ ${d} = ${q}. Check: ${q} × ${d} = ${num(n)}.`;}
 else if(v===2){const b=r.int(105,899),c=r.int(123,999);ans=b+c;s=`☐ − ${b} = ${c}`;wrong=[Math.abs(c-b),ans-100,ans+10,addNoCarry(b,c)];how=`The number had ${b} taken away to leave ${c}, so ☐ = ${c} + ${b} = ${num(ans)}.`;}
 else{const T=r.pick([1000,2000,5000,10000]),c=r.int(123,T-150);ans=T-c;s=`${num(T)} − ☐ = ${c}`;wrong=[T+c,subSmallFromLarge(T,c),ans+100,ans-10];how=`☐ = ${num(T)} − ${c} = ${num(ans)}. Check: ${num(T)} − ${num(ans)} = ${c}.`;}
 const ch=choices(ans,wrong.filter(x=>x>0));if(!ch)return null;
 return {...ch,prompt:'What number goes in the box?',stimulus:s,rewardGroup:v===0?'challenge':'standard',
  explanation:explain(bullets('Use the inverse operation.',how)),audit:{k:'box',s}};
};
const mnThink:Template=(r,i)=>{
 const v=i%4,who=r.pick(NAMES);let ans:number,A:number,story:string,undo:string[],wrong:number[],e:string,check:string;
 if(v===0){const m=r.int(3,9),k=r.int(4,19);ans=r.int(4,15);A=ans*m+k;story=`multiplies it by ${m} and then adds ${k}`;e=`(${A}-${k})/${m}`;undo=[`Undo the + ${k}: ${A} − ${k} = ${A-k}`,`Undo the × ${m}: ${A-k} ÷ ${m} = ${ans}`];wrong=[tidy((A+k)/m),A*m-k,ans+m,A-k];check=`${ans} × ${m} = ${ans*m}, and ${ans*m} + ${k} = ${A}`;}
 else if(v===1){const k=r.int(4,19);ans=r.int(6,40)*2;A=ans/2+k;story=`halves it and then adds ${k}`;e=`(${A}-${k})*#2`;undo=[`Undo the + ${k}: ${A} − ${k} = ${A-k}`,`Undo the halving by doubling: ${A-k} × 2 = ${ans}`];wrong=[tidy((A+k)*2),A-k,tidy((A-k)/2),A*2-k];check=`half of ${ans} is ${ans/2}, and ${ans/2} + ${k} = ${A}`;}
 else if(v===2){const m=r.int(3,6),k=r.int(2,12);ans=r.int(5,20)*m;A=ans/m-k;if(A<=0)return null;story=`divides it by ${m} and then subtracts ${k}`;e=`(${A}+${k})*${m}`;undo=[`Undo the − ${k}: ${A} + ${k} = ${A+k}`,`Undo the ÷ ${m}: ${A+k} × ${m} = ${ans}`];wrong=[(A-k)*m,A*m+k,tidy((A+k)/m),ans-m];check=`${ans} ÷ ${m} = ${ans/m}, and ${ans/m} − ${k} = ${A}`;}
 else{const k=r.int(5,25);ans=r.int(8,45);A=ans*2-k;if(A<=0)return null;story=`doubles it and then subtracts ${k}`;e=`(${A}+${k})/#2`;undo=[`Undo the − ${k}: ${A} + ${k} = ${A+k}`,`Undo the doubling by halving: ${A+k} ÷ 2 = ${ans}`];wrong=[tidy((A-k)/2),A*2+k,A*2-k,A+k];check=`double ${ans} is ${ans*2}, and ${ans*2} − ${k} = ${A}`;}
 const c=choices(ans,wrong.filter(x=>x>0&&Number.isInteger(x)));if(!c)return null;
 return {...c,prompt:`${who} thinks of a number, ${story}. The answer is **${A}**. What number did ${who} think of?`,
  explanation:explain('Work backwards from the answer, undoing each step in reverse order:',bullets(...undo),`Check: ${check}.`),
  audit:{k:'expr',e}};
};
const mnCards:Template=(r,i)=>{
 const digits=r.sample([1,2,3,4,5,6,7,8,9],4);if(digits.filter(x=>x%2===0).length<1||digits.filter(x=>x%2).length<1)return null;
 const perms=(xs:number[]):number[][]=>xs.length<2?[xs]:xs.flatMap((x,k)=>perms([...xs.slice(0,k),...xs.slice(k+1)]).map(p=>[x,...p]));
 const all=perms(digits).map(p=>Number(p.join(''))),visual:Visual={kind:'cards',cards:digits.map(d=>({text:String(d)})),alt:'Four digit cards'};
 if(i%2===0){const even=r.chance(.5),greatest=r.chance(.5),ok=all.filter(n=>n%2===(even?0:1)),ans=greatest?Math.max(...ok):Math.min(...ok);
  const other=all.filter(n=>n%2!==(even?0:1)),wrong=[greatest?Math.max(...all):Math.min(...all),greatest?Math.max(...other):Math.min(...other),greatest?Math.min(...ok):Math.max(...ok),Number(String(ans).slice(0,2)+String(ans)[3]+String(ans)[2])];
  const c=choices(ans,wrong);if(!c)return null;const last=ans%10;
  return {...c,prompt:`Use all four cards once each to make the **${greatest?'greatest':'smallest'} ${even?'even':'odd'}** four-digit number.`,visual,
   explanation:explain(bullets(`An ${even?'even':'odd'} number must end in an ${even?'even':'odd'} digit, so the ones digit is ${last}: the ${greatest?'largest':'smallest'} ${even?'even':'odd'} card.`,`Put the other cards in ${greatest?'descending':'ascending'} order in front of it: ${num(ans)}.`),`${num(greatest?Math.max(...all):Math.min(...all))} is the ${greatest?'greatest':'smallest'} number you can make, but it is ${even?'odd':'even'}.`),
   audit:{k:'digitCards',digits}};}
 const target=r.pick([3000,4000,5000,6000,7000]),dist=(n:number)=>Math.abs(n-target),sorted=[...all].sort((x,y)=>dist(x)-dist(y));if(dist(sorted[0])===dist(sorted[1]))return null;const ans=sorted[0];
 // The nearest number on each side of the target must be a real contender, so the pupil has to compare both.
 const below=all.filter(n=>n<target).sort((x,y)=>y-x)[0],above=all.filter(n=>n>target).sort((x,y)=>x-y)[0];if(below===undefined||above===undefined||dist(below)>1500||dist(above)>1500)return null;
 const other=ans===below?above:below,c=choices(ans,[other,sorted[2],sorted[3]]);if(!c)return null;
 return {...c,prompt:`Use all four cards once each to make the four-digit number closest to **${num(target)}**.`,visual,rewardGroup:'challenge',
  explanation:explain(bullets(`The closest number below ${num(target)} is ${num(below)}, which is ${num(dist(below))} away.`,`The closest number above ${num(target)} is ${num(above)}, which is ${num(dist(above))} away.`,`${num(ans)} is closer, by ${num(dist(other)-dist(ans))}.`),'Check the nearest number on each side of the target before choosing.'),
  audit:{k:'cardsNearest',digits,target}};
};
const mnPair:Template=(r,i)=>{
 const v=i%3,[p,q]=r.sample(NAMES,2);
 if(v===0){const D=r.int(4,30)*2,small=r.int(10,80),S=2*small+D,ans=small+D;const c=choices(ans,[small,tidy(S/2),S-D,ans+D]);if(!c)return null;
  return {...c,prompt:`Two numbers add up to **${S}**. One number is **${D}** more than the other. What is the larger number?`,
   explanation:explain(bullets(`Take away the difference: ${S} − ${D} = ${S-D}. That is two equal parts.`,`Halve it: ${S-D} ÷ 2 = ${small}, the smaller number.`,`Add the difference back: ${small} + ${D} = ${ans}.`),`Check: ${ans} + ${small} = ${S}.`),audit:{k:'expr',e:`(${S}+${D})/#2`}};}
 if(v===1){const m=r.int(2,5),small=r.int(6,40),T=small*(m+1);const c=choices(small,[T/m,small*m,T-small*m+1,T/2,small+m].filter(x=>Number.isInteger(x)));if(!c)return null;
  return {...c,prompt:`${p} and ${q} have **${T}** coins altogether. ${p} has **${m} times** as many coins as ${q}. How many coins does ${q} have?`,
   explanation:explain(bullets(`If ${q} has 1 part, ${p} has ${m} parts: ${m + 1} parts altogether.`,`${T} ÷ ${m+1} = ${small}`),`${q} has ${small} coins and ${p} has ${small*m}. Check: ${small} + ${small*m} = ${T}.`),audit:{k:'expr',e:`${T}/(${m}+#1)`}};}
 const n=r.int(10,90),S=3*n+3;const c=choices(n,[tidy(S/3),n+1,n+2,n-1]);if(!c)return null;
 return {...c,prompt:`The sum of three consecutive whole numbers is **${S}**. What is the smallest of the three numbers?`,rewardGroup:'challenge',
  explanation:explain(bullets(`Consecutive numbers go up by 1, so the three numbers are n, n + 1 and n + 2, and they add to 3n + 3.`,`3n + 3 = ${S}, so 3n = ${S-3} and n = ${n}.`),`Check: ${n} + ${n+1} + ${n+2} = ${S}. The middle number, ${n+1}, is ${S} ÷ 3.`),audit:{k:'expr',e:`(${S}-#3)/#3`}};
};
const mnDigit:Template=(r,i)=>{
 const v=i%3;let s:string,ans:number,how:string;
 if(v===0){const a=r.int(123,876),b=r.int(123,876);if(dig(a,1)+dig(b,1)<10&&dig(a,10)+dig(b,10)<10)return null;const pos=r.int(0,2),p=10**pos;ans=dig(a,p);s=`${String(a).slice(0,2-pos)}☐${String(a).slice(3-pos)} + ${b} = ${num(a+b)}`;how=`The full calculation is ${a} + ${b} = ${num(a+b)}. In the ${COLS[pos].toLowerCase()} column, ${ans} + ${dig(b,p)}${pos&&dig(a,p/10)+dig(b,p/10)>=10?' + the carried 1':''} gives the ${dig(a+b,p)} in the total${pos<2&&ans+dig(b,p)+(pos&&dig(a,p/10)+dig(b,p/10)>=10?1:0)>=10?' (and carries 1)':''}.`;}
 else if(v===1){const b=r.int(123,699),c=r.int(123,876),a=b+c;if(a>999||subSmallFromLarge(a,b)===c)return null;const pos=r.int(0,2),p=10**pos;ans=dig(a,p);s=`${String(a).slice(0,2-pos)}☐${String(a).slice(3-pos)} − ${b} = ${c}`;how=`Use the inverse: ${c} + ${b} = ${a}, so the missing digit is the ${COLS[pos].toLowerCase()} digit of ${a}: ${ans}.`;}
 else{const a=r.int(12,49),m=r.int(3,9);if(a%10===0)return null;ans=dig(a,10);s=`☐${a%10} × ${m} = ${a*m}`;how=`${a*m} ÷ ${m} = ${a}, so the missing tens digit is ${ans}. Check: ${a} × ${m} = ${a*m}.`;}
 const others=r.sample(range(0,9).filter(d=>d!==ans),3),c=words4(String(ans),others.map(String));if(!c)return null;
 return {...c,order:'sorted',prompt:'What digit goes in the box?',stimulus:s,rewardGroup:v===0?'standard':'challenge',
  explanation:explain(bullets(how)),audit:{k:'box',s,digit:true}};
};

// ───────────────────────── SATs reasoning: multi-step problems
const problems:Topic={id:'ma-sats-word-problems',subject:'Maths',strand:'SATs practice',title:'SATs reasoning: multi-step problems',helpsheet:{
 intro:'Many reasoning questions are worth two or three marks because they need two or three steps: find a total, then a difference; find one share, then several shares. Write each step down.',
 steps:['Read the question twice. Underline the numbers and the question word: how many, how much more, how much left.','Decide the steps before you calculate. "Change from £10" means: find the total cost first, then subtract from £10.','Use the units: pence or pounds, grams or kilograms. Change them to the same unit before adding.','When something is shared into groups and there is a remainder, decide whether to round up (coaches needed) or down (full boxes).','Check that the answer is sensible: a bus fare is not £350, and you cannot have 6.5 coaches.'],
 example:{title:'Change from £20',lines:['Four tickets at £3.75 and a programme at £2.50.','Tickets: 4 × £3.75 = £15. Total: £15 + £2.50 = £17.50.','Change: £20 − £17.50 = £2.50.']},
 tips:['Make a quick estimate first so a slip stands out.','"How many more" and "how many altogether" need different calculations.','For "how many coaches", round up: 7 coaches and a bit means 8 coaches.'],
}};
const ITEMS=[['notebooks',185],['pens',120],['rulers',65],['badges',95],['stickers',45],['pencils',35],['cakes',150],['drinks',110],['sandwiches',260],['apples',40]] as const;
const wpShopping:Template=(r,i)=>{
 if(i%2===0){const [[x,px],[y,py]]=r.sample(ITEMS,2),n=r.int(2,5),m=r.int(1,3),note=r.pick([10,20]),cost=n*px+m*py;if(cost>=note*100-50)return null;const ans=(note*100-cost)/100,who=r.pick(NAMES);
  const c=moneyChoices(ans,[cost/100,(note*100-n*px-py)/100,(note*100-px-py)/100,ans+1],true);if(!c)return null;
  const one=y.replace(/s$/,'').replace('sandwiche','sandwich');
  return {...c,prompt:`${who} buys ${n} ${x} at ${gbp(px/100)} each and ${m===1?`a ${one} at ${gbp(py/100)}`:`${m} ${y} at ${gbp(py/100)} each`}. ${who} pays with a £${note} note. How much change should ${who} get?`,rewardGroup:'challenge',
   explanation:explain(bullets(`${cap(x)}: ${n} × ${gbp(px/100)} = ${gbp(n*px/100,true)}`,m===1?`${cap(one)}: ${gbp(py/100,true)}`:`${cap(y)}: ${m} × ${gbp(py/100)} = ${gbp(m*py/100,true)}`,`Total: ${gbp(n*px/100,true)} + ${gbp(m*py/100,true)} = ${gbp(cost/100,true)}`,`Change: £${note} − ${gbp(cost/100,true)} = ${gbp(ans,true)}`),`If you chose ${gbp(cost/100,true)}, that is the total cost, not the change.`),
   audit:{k:'expr',e:`${note}-(${n}*${px/100}+${m===1?'':`${m}*`}${py/100})`}};}
 const n=r.pick([4,6,8,10,12]),each=r.int(45,99),pack=r.int(Math.floor(n*each*0.6),n*each-60);if(pack%5)return null;const ans=(n*each-pack)/100;
 const c=moneyChoices(ans,[n*each/100,pack/100,(n*each-pack)/1000,ans+n/100],true);if(!c)return null;
 return {...c,prompt:`A pack of ${n} bread rolls costs ${gbp(pack/100)}. Bought one at a time, the rolls cost ${each}p each. How much is saved by buying the pack instead of ${n} single rolls?`,rewardGroup:'challenge',
  explanation:explain(bullets(`${n} single rolls: ${n} × ${each}p = ${gbp(n*each/100,true)}`,`Saving: ${gbp(n*each/100,true)} − ${gbp(pack/100,true)} = ${gbp(ans,true)}`),'Change the pence to pounds before subtracting.'),
  audit:{k:'expr',e:`${n}*${each}/#100-${pack/100}`}};
};
const wpGroups:Template=(r,i)=>{
 const v=i%3;
 if(v===0){const per=r.pick([49,52,53,55,57]),n=r.int(5,12)*per+r.int(1,per-1),ans=Math.ceil(n/per);const c=choices(ans,[ans-1,Math.round(n/per)===ans?ans+1:Math.round(n/per),ans+2,n-per*(ans-1)]);if(!c)return null;
  return {...c,prompt:`${num(n)} pupils and teachers are going on a trip. Each coach holds ${per} people. How many coaches are needed?`,
   explanation:explain(bullets(`${num(n)} ÷ ${per} = ${ans-1} remainder ${n-per*(ans-1)}`,`${ans-1} full coaches leave ${n-per*(ans-1)} people, who still need a coach: ${ans} coaches.`),'When people are left over, round up: everyone needs a seat.'),audit:{k:'expr',e:`ceil(${n}/${per})`}};}
 if(v===1){const per=r.pick([6,8,12,15,24]),n=r.int(20,80)*per+r.int(1,per-1),full=Math.floor(n/per),left=n%per;const c=choices(left,[full,per-left,left+per,full+1].filter(x=>x>0));if(!c)return null;
  return {...c,prompt:`A farm packs ${num(n)} eggs into boxes of ${per}. How many eggs are left over after all the full boxes are packed?`,
   explanation:explain(bullets(`${num(n)} ÷ ${per} = ${full} remainder ${left}`,`${full} full boxes use ${num(full*per)} eggs, leaving ${left}.`),`If you chose ${full}, that is the number of full boxes, not the eggs left over.`),audit:{k:'expr',e:`mod(${n},${per})`}};}
 const per=r.pick([4,5,6,8]),n=r.int(30,99)*per+r.int(1,per-1),full=Math.floor(n/per),who=r.pick(NAMES);const c=choices(full,[full+1,n%per,full-1,Math.round(n/10)]);if(!c)return null;
 return {...c,prompt:`${who} has ${num(n)} stickers and puts ${per} on each page of an album. How many pages can ${who} fill completely?`,rewardGroup:'quick',
  explanation:explain(bullets(`${num(n)} ÷ ${per} = ${full} remainder ${n%per}`,`The remainder is not enough to fill another page, so ${full} pages are filled.`),'Round down when the question asks for complete groups.'),audit:{k:'expr',e:`floor(${n}/${per})`}};
};
const wpScale:Template=(r,i)=>{
 const v=i%3;
 if(v===0){const forN=r.pick([4,5,6,8]),g=forN*r.int(30,90),to=r.pick([6,10,12,15,20].filter(x=>x!==forN)),ans=g/forN*to;if(!Number.isInteger(ans))return null;const c=choices(ans,[g+to*forN,g*to,ans+g/forN,g+g].filter(x=>x>0),x=>`${num(x)} g`);if(!c)return null;
  return {...c,prompt:`A recipe for ${forN} people uses ${num(g)} g of flour. How much flour is needed for ${to} people?`,
   explanation:explain(bullets(`For 1 person: ${num(g)} ÷ ${forN} = ${num(g/forN)} g`,`For ${to} people: ${num(g/forN)} × ${to} = ${num(ans)} g`),'Find the amount for one first, then scale up.'),audit:{k:'expr',e:`${g}/${forN}*${to}`}};}
 if(v===1){const n=r.pick([4,5,6,8,10]),each=r.int(21,99),cost=n*each,m=r.pick([3,7,9,12,15].filter(x=>x!==n)),ans=m*each/100;const c=moneyChoices(ans,[cost/100,(cost+each)/100,m*cost/100,ans+1],true);if(!c)return null;
  return {...c,prompt:`${n} identical pencils cost ${gbp(cost/100)}. How much do ${m} of the same pencils cost?`,
   explanation:explain(bullets(`One pencil: ${gbp(cost/100,true)} ÷ ${n} = ${gbp(each/100,true)}`,`${m} pencils: ${m} × ${gbp(each/100,true)} = ${gbp(ans,true)}`)),audit:{k:'expr',e:`${cost/100}/${n}*${m}`}};}
 const h=r.int(2,5),speed=r.int(12,90)*(r.chance(.5)?1:5),d=h*speed,to=r.pick([1,3,4,5,6,7].filter(x=>x!==h)),ans=speed*to;const c=choices(ans,[d+speed*(to-h)+speed,d*to,speed*(to+h),d+to].filter(x=>x>0&&x!==ans),x=>`${num(x)} km`);if(!c)return null;
 return {...c,prompt:`A train travels ${num(d)} km in ${h} hours at a steady speed. How far does it travel in ${to} hour${to>1?'s':''} at the same speed?`,
  explanation:explain(bullets(`In 1 hour: ${num(d)} ÷ ${h} = ${num(speed)} km`,`In ${to} hour${to>1?'s':''}: ${num(speed)} × ${to} = ${num(ans)} km`)),audit:{k:'expr',e:`${d}/${h}*${to}`}};
};
const wpTwoStep:Template=(r,i)=>{
 const v=i%3;
 if(v===0){const rows=r.int(12,28),seats=r.int(18,32),total=rows*seats,sold=r.int(Math.floor(total*0.5),total-15),ans=total-sold;const c=choices(ans,[total,sold-rows*seats+total,ans+seats,total-sold+rows].filter(x=>x>0&&x!==ans));if(!c)return null;
  return {...c,prompt:`A theatre has ${rows} rows with ${seats} seats in each row. ${num(sold)} tickets have been sold for tonight. How many seats are still empty?`,
   explanation:explain(bullets(`Seats: ${rows} × ${seats} = ${num(total)}`,`Empty: ${num(total)} − ${num(sold)} = ${num(ans)}`),`If you chose ${num(total)}, you found the number of seats, not the empty ones.`),audit:{k:'expr',e:`${rows}*${seats}-${sold}`}};}
 if(v===1){const trays=r.int(8,20),per=r.pick([12,15,16,18,20,24]),made=trays*per,sold=r.int(Math.floor(made*0.6),made-9),ans=made-sold;const c=choices(ans,[made,sold,ans+per,made-sold+trays].filter(x=>x!==ans));if(!c)return null;
  return {...c,prompt:`A baker makes ${trays} trays of rolls with ${per} rolls on each tray. By lunchtime ${num(sold)} rolls have been sold. How many rolls are left?`,
   explanation:explain(bullets(`Rolls made: ${trays} × ${per} = ${num(made)}`,`Left: ${num(made)} − ${num(sold)} = ${num(ans)}`)),audit:{k:'expr',e:`${trays}*${per}-${sold}`}};}
 const weekly=r.int(5,19)*25,weeks=r.int(6,16),saved=weekly*weeks,spent=r.int(10,Math.floor(saved/100)-5)*100,ans=(saved-spent)/100,who=r.pick(NAMES);const c=moneyChoices(ans,[saved/100,(saved+spent)/100,(weekly*weeks-spent)/1000,ans+weekly/100],false);if(!c)return null;
 return {...c,prompt:`${who} saves ${gbp(weekly/100)} every week for ${weeks} weeks, then spends ${gbp(spent/100)} on a present. How much money does ${who} have left?`,
  explanation:explain(bullets(`Saved: ${weeks} × ${gbp(weekly/100,true)} = ${gbp(saved/100)}`,`Left: ${gbp(saved/100)} − ${gbp(spent/100)} = ${gbp(ans)}`)),audit:{k:'expr',e:`${weekly/100}*${weeks}-${spent/100}`}};
};
const wpFraction:Template=(r,i)=>{
 const v=i%3;
 if(v===0){const d=r.pick([4,5,6,8,10]),a=r.int(1,d-2),N=d*r.int(12,40),pct=r.pick([10,20,25,30]),walk=a*N/d,cycle=pct*N/100,ans=N-walk-cycle;if(gcd(a,d)!==1||!Number.isInteger(cycle)||ans<=0||walk+cycle===ans)return null;
  const c=choices(ans,[walk+cycle,N-walk,N-cycle,walk]);if(!c)return null;
  return {...c,prompt:`There are ${N} pupils in a school. ${a}/${d} of them walk to school and ${pct}% cycle. The rest come by bus. How many pupils come by bus?`,rewardGroup:'challenge',
   explanation:explain(bullets(`Walk: ${a}/${d} of ${N} = ${walk}`,`Cycle: ${pct}% of ${N} = ${cycle}`,`Bus: ${N} − ${walk} − ${cycle} = ${ans}`),`If you chose ${walk+cycle}, that is how many walk or cycle.`),audit:{k:'expr',e:`${N}-${a}/${d}*${N}-${pct}/#100*${N}`}};}
 if(v===1){const d=r.pick([3,4,5,6,8]),a=r.int(1,d-1),T=d*r.int(8,30),used=a*T/d,added=r.int(5,30),ans=T-used+added;if(gcd(a,d)!==1)return null;const c=choices(ans,[T-used,used+added,T+added-used/2,T-used-added].filter(x=>x>0&&Number.isInteger(x)),x=>`${num(x)} litres`);if(!c)return null;
  return {...c,prompt:`A water butt holds ${T} litres when full. ${a}/${d} of the water is used on the garden, then ${added} litres of rain are collected. How many litres are in the water butt now?`,rewardGroup:'challenge',
   explanation:explain(bullets(`Used: ${a}/${d} of ${T} = ${used} litres`,`Left: ${T} − ${used} = ${T-used} litres`,`After the rain: ${T-used} + ${added} = ${ans} litres`)),audit:{k:'expr',e:`${T}-${a}/${d}*${T}+${added}`}};}
 const price=r.int(12,96),pct=r.pick([10,20,25,30,40]),off=price*pct/100;if(!Number.isInteger(off*100)||off%0.5)return null;const ans=price-off;const c=moneyChoices(ans,[off,price+off,price-pct,ans-1],false);if(!c)return null;
 return {...c,prompt:`A jacket costs £${price}. In the sale it is reduced by ${pct}%. What is the sale price?`,
  explanation:explain(bullets(`${pct}% of £${price} = ${gbp(off)}`,`Sale price: £${price} − ${gbp(off)} = ${gbp(ans)}`),`If you chose ${gbp(off)}, that is the reduction, not the price.`),audit:{k:'expr',e:`${price}-${pct}/#100*${price}`}};
};

// ───────────────────────── SATs reasoning: measures and geometry
const measures:Topic={id:'ma-sats-measures',subject:'Maths',strand:'SATs practice',title:'SATs reasoning: measures and geometry',helpsheet:{
 intro:'Measure questions in the reasoning papers mix units, shapes and time: perimeter and area of shapes made from rectangles, missing angles, converting between units, and working out times.',
 steps:['Perimeter is the distance all the way round. Find any unlabelled sides first, using the opposite sides.','Area of a rectangle is length × width. Split a shape made from rectangles into rectangles and add their areas.','Angles on a straight line add to 180°, angles around a point to 360°, angles in a triangle to 180° and angles in a quadrilateral to 360°.','Change everything to the same unit before adding or subtracting: 1 km = 1,000 m, 1 m = 100 cm, 1 kg = 1,000 g, 1 litre = 1,000 ml.','For times, count on in steps: to the next hour, then whole hours, then the remaining minutes.'],
 example:{title:'A film that starts at 18:45 and lasts 1 hour 35 minutes',lines:['18:45 + 15 minutes = 19:00','19:00 + 1 hour = 20:00','20:00 + 20 minutes = 20:20']},
 tips:['An angle marked on a diagram is "not drawn to scale": calculate it, do not measure it.','Area is in square units (cm²); perimeter is in plain units (cm).','Half of 1.5 kg is 750 g, not 0.75 g.'],
}};
const msShape:Template=(r,i)=>{
 const W=r.int(6,12),H=r.int(5,10),w1=r.int(2,W-2),h1=r.int(2,H-2);if(W-w1===h1||w1===h1&&W-w1===H-h1)return null;
 const pts:[number,number][]=[[0,0],[W,0],[W,h1],[w1,h1],[w1,H],[0,H]],lens=[W,h1,W-w1,H-h1,w1,H],labels=lens.map((l,k)=>k===2||k===3?null:`${l} cm`),P=sum(lens),A=W*H-(W-w1)*(H-h1);
 const visual=polyFigure(pts,labels,'An L-shaped shape with four of its sides labelled');
 if(i%2===0){const c=choices(P,[P-lens[2]-lens[3],2*(W+H),A,P+2].filter(x=>x!==P),x=>`${num(x)} cm`);if(!c)return null;
  return {...c,prompt:'What is the perimeter of this shape? All the corners are right angles.',visual,
   explanation:explain(bullets(`The unlabelled sides are ${W} − ${w1} = ${W-w1} cm and ${H} − ${h1} = ${H-h1} cm.`,`Perimeter: ${lens.join(' + ')} = ${P} cm`),`If you chose ${P-lens[2]-lens[3]} cm, you left out the two unlabelled sides. (The perimeter is the same as the ${W} × ${H} rectangle around it.)`),
   audit:{k:'rectilinear',pts,ask:'perimeter',labels}};}
 const c=choices(A,[W*H,P,W*h1+w1*H,A+(W-w1)*(H-h1)/2].filter(x=>Number.isInteger(x)&&x!==A),x=>`${num(x)} cm²`);if(!c)return null;
 return {...c,prompt:'What is the area of this shape? All the corners are right angles.',visual,rewardGroup:'challenge',
  explanation:explain(bullets(`The whole ${W} × ${H} rectangle would be ${W*H} cm².`,`The missing corner is ${W-w1} × ${H-h1} = ${(W-w1)*(H-h1)} cm².`,`Area: ${W*H} − ${(W-w1)*(H-h1)} = ${A} cm²`),`Or split it: ${W} × ${h1} = ${W*h1} and ${w1} × ${H-h1} = ${w1*(H-h1)}, which add to ${A} cm². If you chose ${W*H} cm², you counted the missing corner.`),
  audit:{k:'rectilinear',pts,ask:'area',labels}};
};
const msAngles:Template=(r,i)=>{
 const v=i%5;let prompt:string,ans:number,wrong:number[],how:string[],e:string;
 if(v===0){const a=r.int(25,80),b=r.int(25,80);ans=180-a-b;if(ans<15)return null;prompt=`Three angles meet on a straight line. Two of them are ${a}° and ${b}°. What is the third angle?`;e=`#180-${a}-${b}`;wrong=[360-a-b,180-a,a+b,ans+10];how=['Angles on a straight line add up to 180°.',`${a} + ${b} = ${a+b}, so the third angle is 180 − ${a+b} = ${ans}°.`];}
 else if(v===1){const a=r.int(60,150),b=r.int(60,150),c=r.int(40,100);ans=360-a-b-c;if(ans<20)return null;prompt=`Four angles meet at a point. Three of them are ${a}°, ${b}° and ${c}°. What is the fourth angle?`;e=`#360-${a}-${b}-${c}`;wrong=[180-Math.min(a,b,c),a+b+c,ans+10,ans-10];how=['Angles around a point add up to 360°.',`${a} + ${b} + ${c} = ${a+b+c}, so the fourth angle is 360 − ${a+b+c} = ${ans}°.`];}
 else if(v===2){const a=r.int(25,95),b=r.int(25,95);ans=180-a-b;if(ans<15||a===b||ans===a||ans===b)return null;prompt=`Two angles of a triangle are ${a}° and ${b}°. What is the third angle?`;e=`#180-${a}-${b}`;wrong=[360-a-b,a+b,180-a,ans+5];how=['The angles in a triangle add up to 180°.',`${a} + ${b} = ${a+b}, so the third angle is 180 − ${a+b} = ${ans}°.`];}
 else if(v===3){const a=r.int(60,130),b=r.int(60,130),c=r.int(40,110);ans=360-a-b-c;if(ans<20||ans>160)return null;prompt=`Three angles of a quadrilateral are ${a}°, ${b}° and ${c}°. What is the fourth angle?`;e=`#360-${a}-${b}-${c}`;wrong=[180-a-b+c,a+b+c,ans+10,180-c];how=['The angles in a quadrilateral add up to 360°.',`${a} + ${b} + ${c} = ${a+b+c}, so the fourth angle is 360 − ${a+b+c} = ${ans}°.`];}
 else{const top=r.int(20,110);if(top%2)return null;ans=(180-top)/2;prompt=`An isosceles triangle has an angle of ${top}° between its two equal sides. What is the size of each of the other two angles?`;e=`(#180-${top})/#2`;wrong=[180-top,top,90-top/2,ans+10];how=['The two angles opposite the equal sides are equal, and all three add up to 180°.',`180 − ${top} = ${180-top}, shared between two equal angles: ${180-top} ÷ 2 = ${ans}°.`];}
 const c=choices(ans,wrong.filter(x=>x>0&&x!==ans),x=>`${num(x)}°`);if(!c)return null;
 return {...c,prompt,rewardGroup:v===4?'challenge':'standard',explanation:explain(bullets(...how)),audit:{k:'expr',e}};
};
const hhmm=(m:number)=>`${String(Math.floor(m/60)%24).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
const dur=(m:number)=>m>=60?`${Math.floor(m/60)} hour${m>=120?'s':''}${m%60?` ${m%60} minutes`:''}`:`${m} minutes`;
const msTime:Template=(r,i)=>{
 if(i%2===0){const start=r.int(8,19)*60+r.pick([5,10,15,20,25,35,40,45,50,55]),mins=r.pick([45,50,55,70,75,80,85,95,100,105,110,115,125]),end=start+mins;if(Math.floor(end/60)===Math.floor(start/60))return null;
  const what=r.pick(['A film','A swimming lesson','A coach journey','A football match','A concert']);
  const c=words4(hhmm(end),[hhmm(end-60),hhmm(end+60),hhmm(start+Math.floor(mins/60)*60+(mins%60)+(mins%60?10:-10)),hhmm(end-10)]);if(!c)return null;
  const toHour=60-start%60;
  return {...c,prompt:`${what} starts at ${hhmm(start)} and lasts ${dur(mins)}. At what time does it finish?`,
   explanation:explain('Count on in steps:',bullets(`${hhmm(start)} + ${toHour} minutes = ${hhmm(start+toHour)}`,...(mins-toHour>=60?[`${hhmm(start+toHour)} + ${dur(Math.floor((mins-toHour)/60)*60)} = ${hhmm(start+toHour+Math.floor((mins-toHour)/60)*60)}`]:[]),...((mins-toHour)%60?[`${hhmm(end-(mins-toHour)%60)} + ${(mins-toHour)%60} minutes = ${hhmm(end)}`]:[])),`Check: from ${hhmm(start)} to ${hhmm(end)} is ${dur(mins)}.`),
   audit:{k:'timeEnd',start:hhmm(start),mins}};}
 const a=r.int(7,15)*60+r.pick([5,10,15,20,25,35,40,45,50,55]),mins=r.pick([35,40,50,65,70,85,95,100,110,125,145]),b=a+mins;
 const c=choices(mins,[mins+60,mins-60,mins+10,Math.floor(mins/60)*100+mins%60].filter(x=>x>0&&x!==mins),x=>dur(x));if(!c)return null;
 const toHour=60-a%60;
 return {...c,prompt:`${r.pick(NAMES)} leaves home at ${hhmm(a)} and arrives at the manor at ${hhmm(b)}. How long does the journey take?`,
  explanation:explain('Count on from the start time:',bullets(`${hhmm(a)} to ${hhmm(a+toHour)}: ${toHour} minutes`,...(b-(a+toHour)>=60?[`${hhmm(a+toHour)} to ${hhmm(a+toHour+Math.floor((b-a-toHour)/60)*60)}: ${dur(Math.floor((b-a-toHour)/60)*60)}`]:[]),...((b-a-toHour)%60?[`${hhmm(b-(b-a-toHour)%60)} to ${hhmm(b)}: ${(b-a-toHour)%60} minutes`]:[]),`Total: ${dur(mins)}`),mins>=60?`There are 60 minutes in an hour, so ${dur(mins)} is ${mins} minutes, not ${Math.floor(mins/60)*100+mins%60}.`:'Count the minutes to the next hour first.'),
  audit:{k:'expr',e:`(${Math.floor(b/60)}*#60+${b%60})-(${Math.floor(a/60)}*#60+${a%60})`,as:'min'}};
};
const msConvert:Template=(r,i)=>{
 const v=i%3;
 if(v===0){const L=r.pick([1.5,2,2.5,3]),out=r.int(3,19)*50+r.pick([0,25]),ans=L*1000-out;if(out>=L*1000)return null;const c=choices(ans,[L*100-out,ans/10,L*1000+out,ans+100].filter(x=>x>0),x=>`${num(x)} ml`);if(!c)return null;
  return {...c,prompt:`A jug holds ${num(L)} litres of juice. ${r.pick(NAMES)} pours out ${num(out)} ml. How many millilitres of juice are left?`,
   explanation:explain(bullets(`${num(L)} litres = ${num(L*1000)} ml`,`${num(L*1000)} − ${num(out)} = ${num(ans)} ml`),'Change the litres to millilitres before subtracting.'),audit:{k:'expr',e:`${L}*#1000-${out}`}};}
 if(v===1){const m=r.pick([2.4,3,3.6,4.2,4.5,5]),n=r.int(2,5),piece=r.int(45,95),ans=m*100-n*piece;if(ans<=0||ans>=100)return null;const c=choices(ans,[m*100-piece,ans/10,n*piece,ans+10].filter(x=>x>0),x=>`${num(x)} cm`);if(!c)return null;
  return {...c,prompt:`A plank is ${num(m)} m long. ${n} pieces, each ${piece} cm long, are cut from it. How many centimetres of the plank are left?`,rewardGroup:'challenge',
   explanation:explain(bullets(`${num(m)} m = ${num(m*100)} cm`,`Cut off: ${n} × ${piece} = ${n*piece} cm`,`Left: ${num(m*100)} − ${n*piece} = ${num(ans)} cm`)),audit:{k:'expr',e:`${m}*#100-${n}*${piece}`}};}
 const kg=r.pick([1.2,1.5,2.4,2.5,3.2]),g=r.int(3,19)*50,ans=tidy(kg+g/1000);const c=choices(ans,[tidy(kg+g),tidy(kg+g/100),tidy(kg*1000+g),tidy(ans+0.1)],x=>`${num(x)} kg`);if(!c)return null;
 return {...c,prompt:`A parcel weighs ${num(kg)} kg and a second parcel weighs ${num(g)} g. What is the total mass of the two parcels in kilograms?`,
  explanation:explain(bullets(`${num(g)} g = ${num(g/1000)} kg`,`${num(kg)} + ${num(g/1000)} = ${num(ans)} kg`),`If you chose ${num(tidy(kg+g))} kg, you added grams to kilograms without converting.`),audit:{k:'expr',e:`${kg}+${g}/#1000`}};
};
const msArea:Template=(r,i)=>{
 const v=i%3;
 if(v===0){const b=r.int(6,20),h=r.int(3,15);if((b*h)%2||b===h)return null;const ans=b*h/2;const c=choices(ans,[b*h,b+h,2*(b+h),ans+b].filter(x=>x!==ans),x=>`${num(x)} cm²`);if(!c)return null;
  return {...c,prompt:`A triangle has a base of ${b} cm and a perpendicular height of ${h} cm. What is its area?`,
   explanation:explain(bullets('Area of a triangle = base × height ÷ 2',`${b} × ${h} = ${b*h}, and ${b*h} ÷ 2 = ${ans} cm²`),`If you chose ${b*h} cm², you forgot to halve: that is the area of a ${b} by ${h} rectangle.`),audit:{k:'expr',e:`${b}*${h}/#2`}};}
 if(v===1){const scale=r.pick([2,4,5,10,25]),cm=r.int(3,12)+r.pick([0,0.5]),ans=tidy(cm*scale);const c=choices(ans,[tidy(cm+scale),tidy(cm/scale),tidy(ans*10),tidy(ans+scale)].filter(x=>x>0),x=>`${num(x)} km`);if(!c)return null;
  return {...c,prompt:`On a map, 1 cm represents ${scale} km. Two villages are ${num(cm)} cm apart on the map. How far apart are they in real life?`,rewardGroup:'quick',
   explanation:explain(bullets(`Each centimetre is ${scale} km.`,`${num(cm)} × ${scale} = ${num(ans)} km`)),audit:{k:'expr',e:`${cm}*${scale}`}};}
 const l=r.int(8,24),w=r.int(3,l-1),P=2*(l+w);if(l===w)return null;const c=choices(w,[P-l,(P-l)/2,P/2,w+1].filter(x=>x>0&&x!==w),x=>`${num(x)} cm`);if(!c)return null;
 return {...c,prompt:`A rectangle has a perimeter of ${P} cm. Its length is ${l} cm. What is its width?`,rewardGroup:'challenge',
  explanation:explain(bullets(`The two lengths make ${l} + ${l} = ${2*l} cm.`,`The two widths make ${P} − ${2*l} = ${P-2*l} cm.`,`One width: ${P-2*l} ÷ 2 = ${w} cm`),`Check: 2 × (${l} + ${w}) = ${P}.`),audit:{k:'expr',e:`(${P}-${l}-${l})/#2`}};
};

// ───────────────────────── SATs reasoning: number properties and statements
const facts:Topic={id:'ma-sats-number-facts',subject:'Maths',strand:'SATs practice',title:'SATs reasoning: number properties and statements',helpsheet:{
 intro:'Reasoning papers test the words of maths: prime, square, cube, factor, multiple. They also ask you to compare fractions, decimals and percentages, to round, and to estimate.',
 steps:['A prime number has exactly two factors, 1 and itself: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37 … (1 is not prime, 2 is the only even prime).','Square numbers: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144. Cube numbers: 1, 8, 27, 64, 125, 1,000.','A factor divides into a number exactly; a multiple is in its times table. 6 is a factor of 24; 24 is a multiple of 6.','To compare fractions, decimals and percentages, change them all to decimals or all to percentages: 3/4 = 0.75 = 75%.','To estimate, round each number to one significant figure and calculate: 48.7 × 21 is about 50 × 20 = 1,000.'],
 example:{title:'Which statement about 36 is true?',lines:['36 = 6 × 6, so it is a square number.','36 is not a cube number: 3 × 3 × 3 = 27 and 4 × 4 × 4 = 64.','36 has more than two factors (1, 2, 3, 4, 6, 9, 12, 18, 36), so it is not prime.']},
 tips:['51, 57, 87 and 91 look prime but are not: 51 = 3 × 17, 57 = 3 × 19, 87 = 3 × 29, 91 = 7 × 13.','0.7 is greater than 0.68: compare tenths first.','A number that rounds to 4,000 to the nearest thousand lies from 3,500 up to (but not including) 4,500.'],
}};
const isPrime=(n:number)=>{if(n<2)return false;for(let k=2;k*k<=n;k++)if(n%k===0)return false;return true;};
const TRAPS=[21,27,33,39,49,51,57,63,69,77,81,87,91,93,99,111,117,119,121,123,129,133];
const nfWhich:Template=(r,i)=>{
 const v=i%4;
 if(v===0){const ps=[23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107],ans=r.pick(ps),wrong=r.sample(TRAPS.filter(x=>Math.abs(x-ans)<40),3);const c=words4(num(ans),wrong.map(x=>num(x)));if(!c)return null;
  return {...c,order:'sorted',prompt:'Which of these numbers is a **prime** number?',
   explanation:explain(bullets(`${ans} has exactly two factors, 1 and ${ans}, so it is prime.`,...wrong.map(w=>{const f=range(2,Math.floor(Math.sqrt(w))).find(k=>w%k===0)!;return `${w} = ${f} × ${w/f}, so it is not prime.`})),'Odd numbers are not always prime: test 3, 7 and 11 as well as 5.'),audit:{k:'which',prop:'prime'}};}
 if(v===1){const sq=r.chance(.5),k=sq?r.int(5,15):r.int(2,6),ans=sq?k*k:k**3,near=[ans+1,ans-1,ans+2,ans-2,ans+10,ans-10,sq?k*2:k*3,sq?(k+1)*(k+1)-1:k*k].filter(x=>x>1&&(sq?Math.round(Math.sqrt(x))**2!==x:Math.round(Math.cbrt(x))**3!==x));const wrong=r.sample(near,3);const c=words4(num(ans),wrong.map(x=>num(x)));if(!c)return null;
  return {...c,order:'sorted',prompt:`Which of these numbers is a **${sq?'square':'cube'}** number?`,rewardGroup:'quick',
   explanation:explain(bullets(`${ans} = ${k} × ${k}${sq?'':` × ${k}`}, so it is a ${sq?'square':'cube'} number.`,`The ${sq?'square':'cube'} numbers near it are ${num(sq?(k-1)**2:(k-1)**3)} and ${num(sq?(k+1)**2:(k+1)**3)}, so none of the other numbers is a ${sq?'square':'cube'}.`)),audit:{k:'which',prop:sq?'square':'cube'}};}
 if(v===2){const [a,b]=r.pick([[4,6],[6,8],[6,9],[8,12],[4,10],[9,12],[6,10],[8,10]]),L=lcm(a,b),ans=L*r.int(1,3),wrong=r.sample([a*r.int(2,9),b*r.int(2,9),ans+a,ans-b,ans+1,a+b].filter(x=>x>0&&!(x%a===0&&x%b===0)),3);const c=words4(num(ans),wrong.map(x=>num(x)));if(!c)return null;
  return {...c,order:'sorted',prompt:`Which of these numbers is a common multiple of **${a}** and **${b}**?`,
   explanation:explain(bullets(`${ans} ÷ ${a} = ${ans/a} and ${ans} ÷ ${b} = ${ans/b}, so ${ans} is in both times tables.`,`The other numbers are in at most one of the tables.`),`The lowest common multiple of ${a} and ${b} is ${L}.`),audit:{k:'which',prop:'commonMultiple'}};}
 const [a,b]=r.pick([[36,48],[24,40],[30,45],[28,42],[32,40],[18,27],[20,50],[27,36]]),fa=range(2,a).filter(k=>a%k===0),ans=r.pick(fa.filter(k=>b%k!==0)),wrong=r.sample([...fa.filter(k=>b%k===0),...range(2,12).filter(k=>a%k!==0)],3);if(!ans)return null;const c=words4(num(ans),wrong.map(x=>num(x)));if(!c)return null;
 return {...c,order:'sorted',prompt:`Which of these numbers is a factor of **${a}** but NOT a factor of **${b}**?`,rewardGroup:'challenge',
  explanation:explain(bullets(`${a} ÷ ${ans} = ${a/ans} exactly, but ${b} ÷ ${ans} leaves a remainder.`,...wrong.map(w=>a%w===0?`${w} is a factor of both ${a} and ${b}.`:`${w} is not a factor of ${a}.`)),'A factor divides into a number with no remainder.'),audit:{k:'which',prop:'factorNot'}};
};
const FDP_SETS:string[][]=[['0.7','3/4','65%','0.68'],['1/2','0.45','55%','0.5'],['2/5','0.39','45%','0.4'],['0.6','7/10','62%','3/5'],['1/4','0.3','20%','0.28'],['0.85','4/5','82%','7/8'],['3/8','0.4','35%','0.35'],['0.9','9/10','89%','17/20'],['1/3','0.3','30%','0.33'],['0.15','1/5','12%','3/20'],['2/3','0.6','65%','0.66'],['0.75','7/10','78%','3/4']];
const fdpv=(s:string)=>s.endsWith('%')?Number(s.slice(0,-1))/100:s.includes('/')?Number(s.split('/')[0])/Number(s.split('/')[1]):Number(s);
const nfExtreme:Template=(r,i)=>{
 const set=r.pick(FDP_SETS),max=i%2===0,vals=set.map(fdpv),best=max?Math.max(...vals):Math.min(...vals);if(vals.filter(v=>Math.abs(v-best)<1e-9).length!==1)return null;const ans=set[vals.indexOf(best)];
 const c=words4(ans,set.filter(s=>s!==ans));if(!c)return null;
 return {...c,prompt:`Which of these four amounts is the **${max?'largest':'smallest'}**?`,rewardGroup:'challenge',
  explanation:explain('Change them all to decimals:',bullets(...set.map(s=>`${s} = ${num(Math.round(fdpv(s)*1000)/1000)}`)),`The ${max?'largest':'smallest'} is ${ans}.`),audit:{k:'extreme',dir:max?'max':'min'}};
};
const nfRound:Template=r=>{
 const [p,name]=r.pick([[100,'hundred'],[1000,'thousand'],[10000,'ten thousand']] as const),T=p*r.int(3,9),who=r.pick(NAMES);
 const ans=r.pick([T-p/2,T+p/2-1,T-r.int(1,p/2-1),T+r.int(1,p/2-1)]),wrong=r.sample([T-p/2-1,T+p/2,T+p,T-p,T+p/2+r.int(1,p/4),T-p/2-r.int(1,p/4)],3);
 const c=words4(num(ans),wrong.map(x=>num(x)));if(!c)return null;
 return {...c,order:'sorted',prompt:`A number rounded to the nearest ${name} is ${num(T)}. Which of these could the number be?`,
  explanation:explain(bullets(`Numbers from ${num(T-p/2)} up to ${num(T+p/2-1)} round to ${num(T)}.`,`${num(ans)} is in that range, so it rounds to ${num(T)}.`,...wrong.map(w=>`${num(w)} rounds to ${num(Math.floor(w/p+0.5)*p)}.`)),`Halfway numbers such as ${num(T+p/2)} round up, so ${num(T+p/2)} rounds to ${num(T+p)}.`),audit:{k:'roundsTo'}};
};
const nfEstimate:Template=r=>{
 const v=r.int(0,2);let s:string,exact:number,e:string,how:string;
 if(v===0){const a=r.int(21,98)+r.int(1,9)/10,b=r.int(11,49);exact=a*b;s=`${num(a)} × ${b}`;e=`${a}*${b}`;how=`${num(a)} is about ${Math.round(a/10)*10} and ${b} is about ${Math.round(b/10)*10}: ${Math.round(a/10)*10} × ${Math.round(b/10)*10} = ${num(Math.round(a/10)*10*Math.round(b/10)*10)}.`;}
 else if(v===1){const a=r.int(2100,9800),b=r.int(11,49);if(b%10===0)return null;exact=a/b;s=`${num(a)} ÷ ${b}`;e=`${a}/${b}`;how=`${num(a)} is about ${num(Math.round(a/1000)*1000)} and ${b} is about ${Math.round(b/10)*10}: ${num(Math.round(a/1000)*1000)} ÷ ${Math.round(b/10)*10} = ${num(Math.round(a/1000)*1000/(Math.round(b/10)*10))}.`;}
 else{const a=r.int(1100,4900),b=r.int(1100,4900),c=r.int(1100,4900);exact=a+b+c;s=`${num(a)} + ${num(b)} + ${num(c)}`;e=`${a}+${b}+${c}`;how=`Round each to the nearest thousand: ${num(Math.round(a/1000)*1000)} + ${num(Math.round(b/1000)*1000)} + ${num(Math.round(c/1000)*1000)} = ${num(Math.round(a/1000)*1000+Math.round(b/1000)*1000+Math.round(c/1000)*1000)}.`;}
 const mag=10**Math.floor(Math.log10(exact)),ans=Math.round(exact/mag)*mag;const opts=[ans,ans*10,ans/10,ans+(ans>=1000?mag*5:mag/2*(ans/mag>=5?-1:1))].map(x=>tidy(x)),dist=opts.map(x=>Math.abs(x-exact));if(dist.filter(d=>d===Math.min(...dist)).length!==1||opts[dist.indexOf(Math.min(...dist))]!==ans)return null;
 const c=choices(ans,opts.slice(1));if(!c)return null;
 return {...c,prompt:'Which is the best **estimate** for this calculation?',stimulus:s,rewardGroup:'quick',
  explanation:explain(bullets(how,`So the best estimate is ${num(ans)}.`),'Estimate by rounding first: you are not asked for the exact answer.'),audit:{k:'closest',e}};
};
type Prop=['square'|'cube'|'prime'|'even'|'odd',number?]|['multiple'|'factor'|'greater'|'less',number];
const nfStatements:Template=r=>{
 const n=r.pick([24,25,27,32,36,40,45,48,49,54,60,63,64,72,75,81,84,90,96,100,121,125,144]);
 const all:[string,string,boolean][]=[];
 const put=(text:string,key:string,ok:boolean)=>all.push([text,key,ok]);
 put('It is a square number','square',Math.round(Math.sqrt(n))**2===n);put('It is a cube number','cube',Math.round(Math.cbrt(n))**3===n);put('It is a prime number','prime',isPrime(n));
 for(const k of r.sample([5,6,7,8,9,12,15],3))put(`It is a multiple of ${k}`,`multiple:${k}`,n%k===0);
 for(const k of r.sample([100,150,180,200,240,300,360],2))put(`It is a factor of ${k}`,`factor:${k}`,k%n===0);
 put('It has an odd number of factors','oddFactors',range(1,n).filter(k=>n%k===0).length%2===1);
 const trues=all.filter(x=>x[2]),falses=all.filter(x=>!x[2]);if(!trues.length||falses.length<3)return null;
 const t=r.pick(trues),f=r.sample(falses,3),props:Record<string,string>={};for(const [text,key] of [t,...f])props[text]=key;
 const c=words4(t[0],f.map(x=>x[0]));if(!c)return null;
 const why=(x:[string,string,boolean])=>{const [text,key,ok]=x;const [kind,arg]=key.split(':').map((s,j)=>j?Number(s):s) as [string,number];
  if(kind==='square')return ok?`${n} = ${Math.sqrt(n)} × ${Math.sqrt(n)}, so it is a square number.`:`${n} is not a square number: ${Math.floor(Math.sqrt(n))}² = ${Math.floor(Math.sqrt(n))**2} and ${Math.floor(Math.sqrt(n))+1}² = ${(Math.floor(Math.sqrt(n))+1)**2}.`;
  if(kind==='cube')return ok?`${n} = ${Math.cbrt(n)} × ${Math.cbrt(n)} × ${Math.cbrt(n)}, so it is a cube number.`:`${n} is not a cube number: ${Math.floor(Math.cbrt(n))}³ = ${Math.floor(Math.cbrt(n))**3} and ${Math.floor(Math.cbrt(n))+1}³ = ${(Math.floor(Math.cbrt(n))+1)**3}.`;
  if(kind==='prime'){const d=range(2,n-1).find(k=>n%k===0);return ok?`${n} is prime.`:`${n} is not prime: it divides by ${d}.`;}
  if(kind==='multiple')return ok?`${n} ÷ ${arg} = ${n/arg} exactly, so ${n} is a multiple of ${arg}.`:`${n} ÷ ${arg} is not a whole number, so ${n} is not a multiple of ${arg}.`;
  if(kind==='factor')return ok?`${arg} ÷ ${n} = ${arg/n} exactly, so ${n} is a factor of ${arg}.`:`${arg} ÷ ${n} is not a whole number, so ${n} is not a factor of ${arg}.`;
  const fs=range(1,n).filter(k=>n%k===0);return `${n} has ${fs.length} factors (${fs.join(', ')}), which is an ${fs.length%2?'odd':'even'} number of factors${text.includes('odd')&&!ok?', so this is false':''}.`;};
 return {...c,prompt:`Which statement about **${n}** is true?`,rewardGroup:'challenge',
  explanation:explain(bullets(why(t),...f.map(why))),audit:{k:'props',n,props}};
};

export const satsTopics:BuiltTopic[]=[
 topicSet(arithmetic,20,[saAddSub,saMulDiv,saPlaceValue,saLong,saOrder]),
 topicSet(fdp,20,[fdAddSub,fdMulDiv,fdPercent,fdDecimals,fdOfAmount]),
 topicSet(missing,20,[mnBox,mnThink,mnCards,mnPair,mnDigit]),
 topicSet(problems,20,[wpShopping,wpGroups,wpScale,wpTwoStep,wpFraction]),
 topicSet(measures,20,[msShape,msAngles,msTime,msConvert,msArea]),
 topicSet(facts,20,[nfWhich,nfExtreme,nfRound,nfEstimate,nfStatements]),
];
