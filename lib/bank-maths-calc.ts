import {num,explain,bullets,NAMES,list,cap,words,type Topic,type BuiltTopic} from './bank-kit';
import type {Visual,Mark} from './visual';
import {topicSet,choices,pick,words4,fig,text,tidy,sum,range,cubes,calc,type Template} from './bank-maths-util';
import {addNoCarry,subSmallFromLarge} from './bank-maths-number';
// Maths, Calculation strand: mental and written addition and subtraction, multiplication, division, order of operations,
// factors, multiples and primes, squares and cubes.

const dig=(n:number,p:number)=>Math.floor(n/p)%10;
const COLS=['Ones','Tens','Hundreds','Thousands','Ten thousands','Hundred thousands'];
const PLACE_NAMES=['one','ten','hundred','thousand','ten thousand','hundred thousand'];
const len=(n:number)=>String(n).length;
/** Column addition, one line per column. */
function addSteps(a:number,b:number){const out:string[]=[];let carry=0;const n=Math.max(len(a),len(b));for(let c=0;c<n;c++){const x=dig(a,10**c),y=dig(b,10**c),s=x+y+carry;out.push(`${COLS[c]}: ${x} + ${y}${carry?' + 1':''} = ${s}${s>=10?`, write ${s%10} and carry 1`:''}`);carry=s>=10?1:0;}if(carry)out.push(`Write the carried 1 in the ${COLS[n].toLowerCase()} column.`);return out;}
/** Column subtraction: the top number after exchanging, then one line per column. */
function subSteps(a:number,b:number){const n=len(a),top:number[]=[];let borrow=0;for(let c=0;c<n;c++){const x=dig(a,10**c)-borrow,y=dig(b,10**c);borrow=x<y?1:0;top.push(x+10*borrow);}
 const exch=top.some((t,c)=>t!==dig(a,10**c));
 const parts=top.map((t,c)=>`${t} ${PLACE_NAMES[c]}${t===1?'':'s'}`).reverse().filter((_,i)=>!(i===0&&top[n-1]===0));
 return [...(exch?[`Exchange so every column can be taken away: ${num(a)} becomes ${list(parts)}.`]:[]),...top.map((t,c)=>`${COLS[c]}: ${t} − ${dig(b,10**c)} = ${t-dig(b,10**c)}`).filter((_,c)=>c<Math.max(len(b),n)&&!(c>=len(b)&&top[c]===0))];}
/** Column subtraction where each exchange is made but the next column is never reduced. */
function subForgetReduce(a:number,b:number){let out=0;for(let c=0,p=1;p<=a;c++,p*=10){const x=dig(a,p),y=dig(b,p);out+=(x<y?x+10-y:x-y)*p;}return out;}
/** Short division, one line per digit: 4872 ÷ 8 → 4 ÷ 8 = 0 r 4, 48 ÷ 8 = 6 … */
function divSteps(n:number,d:number){const out:string[]=[];let r=0;for(const ch of String(n)){const v=r*10+Number(ch),k=Math.floor(v/d);r=v%d;out.push(`${num(v)} ÷ ${d} = ${k}${r?` remainder ${r}`:''}`);}return out;}
export const isPrime=(n:number)=>{if(n<2)return false;for(let k=2;k*k<=n;k++)if(n%k===0)return false;return true;};
export const factorsOf=(n:number)=>range(1,n).filter(k=>n%k===0);
const primeFactors=(n:number)=>{const out:number[]=[];for(let k=2;n>1;k++)while(n%k===0){out.push(k);n/=k;}return out;};
const gcd=(a:number,b:number):number=>b?gcd(b,a%b):a,lcm=(a:number,b:number)=>a*b/gcd(a,b);

// ───────────────────────── Mental addition and subtraction
const mental:Topic={id:'ma-mental-add-sub',subject:'Maths',strand:'Calculation',title:'Mental addition and subtraction',helpsheet:{
 intro:'Mental methods use facts you already know to make a calculation easier. A good trick is to round one number to a friendly number and then adjust.',
 steps:['Look for a number close to a multiple of 10, 100 or 1,000, such as 49, 299 or 4,998.','Round it and do the easier calculation.','Adjust. Adding: if you added too much, take the extra away. Subtracting: if you took away too much, add the extra back.','To find a difference, count on from the smaller number in easy jumps, such as to the next thousand.'],
 example:{title:'Work out 6,125 − 2,997',lines:['2,997 is 3 less than 3,000.','6,125 − 3,000 = 3,125','You took away 3 too many, so add 3 back: 3,128.']},
 tips:['When you take away a rounded-up number, add the difference back, not away.','Check with the inverse: 3,128 + 2,997 = 6,125.','Near doubles: 350 + 360 is double 350, plus 10.'],
}};
const mCompensate:Template=r=>{
 const add=r.chance(.5),scale=r.pick([10,100,1000]),d=r.pick([1,2,3]),above=r.chance(.3),B=r.int(2,9)*scale,b=above?B+d:B-d;
 const a=scale===10?r.int(41,98):scale===100?r.int(310,980)+r.pick([0,r.int(1,9)]):r.int(3100,9800)+r.int(0,99);if(!add&&a<=b+10)return null;
 const ans=add?a+b:a-b,near=add?a+B:a-B,fix=(add?1:-1)*(above?d:-d),wrongWay=near-fix;
 const c=choices(ans,[wrongWay,near,ans+(ans>near?1:-1),ans+(add?10:-10)]);if(!c)return null;
 const verb=add?(above?'You added':'You added'):'You took away';
 return {...c,prompt:'Use rounding to help you work this out in your head.',stimulus:`${num(a)} ${add?'+':'−'} ${num(b)}`,
  explanation:explain(bullets(`${num(b)} is ${d} ${above?'more':'less'} than ${num(B)}.`,`${num(a)} ${add?'+':'−'} ${num(B)} = ${num(near)}`,above?`${verb} ${d} too few, so ${add?'add':'take away'} ${d} more: ${num(ans)}.`:`${verb} ${d} too many, so ${add?'take':'add'} ${d} ${add?'away':'back'}: ${num(ans)}.`),`If you chose ${num(wrongWay)}, you adjusted the wrong way.`),
  audit:{k:'expr',e:`${a}${add?'+':'-'}${b}`}};
};
const mComplement:Template=r=>{
 const T=r.pick([1000,10000,100000,1]),scale=T===1?0.01:T/100,b=tidy(r.int(11,99)*scale);if(dig(Math.round(b/scale),1)===0)return null;
 const ans=tidy(T-b),pairs=Number(String(Math.round(b/scale)).split('').map(x=>10-Number(x)).join(''))*scale;
 const c=choices(ans,[tidy(pairs),tidy(ans+scale),tidy(T+b),tidy(ans-10*scale)]);if(!c)return null;
 const left=r.chance(.5),s=left?`☐ + ${num(b)} = ${num(T)}`:`${num(b)} + ☐ = ${num(T)}`;
 return {...c,prompt:'What number goes in the box?',stimulus:s,rewardGroup:'quick',
  explanation:explain(bullets(`☐ = ${num(T)} − ${num(b)}`,`Count on from ${num(b)}: ${num(tidy(10*scale-dig(Math.round(b/scale),1)*scale))} makes ${num(tidy(b+10*scale-dig(Math.round(b/scale),1)*scale))}, then ${num(tidy(T-b-(10*scale-dig(Math.round(b/scale),1)*scale)))} more makes ${num(T)}.`,`So ☐ = ${num(ans)}.`),`Check: ${num(b)} + ${num(ans)} = ${num(T)}.${tidy(pairs)!==ans?` Making each digit up to 10 gives ${num(tidy(pairs))}, which is too big.`:''}`),
  audit:{k:'box',s}};
};
const mCountOn:Template=r=>{
 const M=r.pick([1000,2000,3000,5000,10000]),c1=r.int(2,19)*5,c2=r.int(3,89)*10+r.pick([0,5]),b=M-c1,a=M+c2,ans=c1+c2,[p,q]=r.sample(NAMES,2);
 const stories=[
  `The manor had ${num(a)} visitors in August and ${num(b)} visitors in July. How many more visitors came in August?`,
  `${p}'s hero has ${num(a)} points and ${q}'s hero has ${num(b)} points. How many more points does ${p}'s hero have?`,
  `A monster wave has ${num(a)} health points. After the first attack it has ${num(b)} left. How much health did it lose?`,
  `The Quest Shop sold ${num(a)} potions this term and ${num(b)} last term. How many more did it sell this term?`];
 const c=choices(ans,[c2,c2-c1,subSmallFromLarge(a,b),ans+100]);if(!c)return null;
 return {...c,prompt:r.pick(stories),
  explanation:explain('Count on from the smaller number:',bullets(`${num(b)} + ${c1} = ${num(M)}`,`${num(M)} + ${num(c2)} = ${num(a)}`,`${c1} + ${num(c2)} = ${num(ans)}`),`If you chose ${num(c2)}, you forgot the jump up to ${num(M)}.`),
  audit:{k:'expr',e:`${a}-${b}`}};
};
const mDoubles:Template=(r,i)=>{
 if(i%2===0){const a=r.int(12,49)*r.pick([10,50]),d=r.pick([10,20,100]),b=a+d,ans=a+b;
  const c=choices(ans,[2*a,2*a+2*d,addNoCarry(a,b),ans-100]);if(!c)return null;
  return {...c,prompt:'Use near doubles to work this out in your head.',stimulus:`${num(a)} + ${num(b)}`,
   explanation:explain(bullets(`${num(b)} is ${d} more than ${num(a)}.`,`Double ${num(a)} is ${num(2*a)}.`,`${num(2*a)} + ${d} = ${num(ans)}`),`If you chose ${num(2*a)}, you forgot the extra ${d}.`),
   audit:{k:'expr',e:`${a}+${b}`}};}
 const n=r.int(551,4990)*2,half=n/2,digitHalf=Number(String(n).split('').map(x=>Math.floor(Number(x)/2)).join(''));
 if(String(n).split('').every(x=>Number(x)%2===0))return null;
 const c=choices(half,[digitHalf,half+100,half-100,n*2]);if(!c)return null;
 return {...c,prompt:'Halve this number in your head.',stimulus:num(n),rewardGroup:'quick',
  explanation:explain(bullets(`Split ${num(n)} into parts that are easy to halve: ${String(n).split('').map((x,k,s)=>Number(x)*10**(s.length-1-k)).filter(x=>x).map(x=>num(x)).join(' + ')}.`,`Halve each part and add: ${String(n).split('').map((x,k,s)=>Number(x)*10**(s.length-1-k)).filter(x=>x).map(x=>num(x/2)).join(' + ')} = ${num(half)}.`),`If you chose ${num(digitHalf)}, you halved each digit and lost the odd ones.`),
  audit:{k:'expr',e:`${n}/#2`}};
};
const mDecimals:Template=r=>{
 if(r.chance(.5)){const a=r.int(11,89)/10,b=r.int(11,89)/10;if(Math.round(a*10)%10+Math.round(b*10)%10<10)return null;const ans=tidy(a+b),w=Math.floor(a)+Math.floor(b),t=Math.round(a*10)%10+Math.round(b*10)%10;
  const c=choices(ans,[Number(`${w}.${t}`),tidy(ans-1),Number(`${w+1}.${t}`)],x=>num(x));if(!c)return null;
  return {...c,prompt:'Work this out in your head.',stimulus:`${num(a)} + ${num(b)}`,
   explanation:explain(bullets(`Ones: ${Math.floor(a)} + ${Math.floor(b)} = ${w}`,`Tenths: ${Math.round(a*10)%10} + ${Math.round(b*10)%10} = ${t} tenths = ${num(t/10)}`,`${w} + ${num(t/10)} = ${num(ans)}`),`${t} tenths ${t===10?'make one whole':'are more than one whole'}, so the answer is not ${w}.${t}.`),
   audit:{k:'expr',e:`${a}+${b}`}};}
 const a=r.int(31,99)/10,B=r.int(2,Math.floor(a)-1),d=r.pick([0.1,0.2]),b=tidy(B-d),ans=tidy(a-b);
 const c=choices(ans,[tidy(a-B-d),tidy(a-B),tidy(ans+1)],x=>num(x));if(!c)return null;
 return {...c,prompt:'Use rounding to help you work this out in your head.',stimulus:`${num(a)} − ${num(b)}`,
  explanation:explain(bullets(`${num(b)} is ${num(d)} less than ${B}.`,`${num(a)} − ${B} = ${num(tidy(a-B))}`,`You took away ${num(d)} too many, so add it back: ${num(ans)}.`),`If you chose ${num(tidy(a-B-d))}, you adjusted the wrong way.`),
  audit:{k:'expr',e:`${a}-${b}`}};
};

// ───────────────────────── Written addition and subtraction
const written:Topic={id:'ma-written-add-sub',subject:'Maths',strand:'Calculation',title:'Written addition and subtraction',helpsheet:{
 intro:'For big numbers, use the column method. Line up the digits by place value, then work from the ones column to the left.',
 steps:['Write the numbers one under the other, with ones under ones, tens under tens, and so on.','Adding: if a column makes 10 or more, write the ones digit and carry 1 into the next column.','Subtracting: if the top digit is smaller, exchange 1 from the next column on the left (it becomes 10 in this column).','Check with the inverse: add your answer to the number you took away.'],
 example:{title:'5,006 − 1,738',lines:['Exchange: 5,006 becomes 4 thousands, 9 hundreds, 9 tens and 16 ones.','Ones: 16 − 8 = 8; tens: 9 − 3 = 6; hundreds: 9 − 7 = 2; thousands: 4 − 1 = 3.','Answer: 3,268. Check: 3,268 + 1,738 = 5,006.']},
 tips:['Never take the smaller digit from the larger just because it is easier: 3 − 8 needs an exchange.','When exchanging across zeros, every zero becomes 9 except the last, which becomes 10.','Missing digits: work column by column from the ones and remember any carry.'],
}};
/** A column calculation with digits in a grid; capital letters are drawn as boxed unknown digits. */
function columnFigure(top:string,bottom:string,result:string,op:string,alt:string):Visual{
 const cw=36,rh=46,cols=Math.max(top.length,bottom.length,result.length)+1,m:Mark[]=[],X=(col:number)=>14+col*cw+cw/2;
 const put=(s:string,row:number,y0:number)=>[...s].forEach((ch,i)=>{const x=X(cols-s.length+i),y=y0+row*rh;
  if(/[A-Z]/.test(ch))m.push({t:'rect',x:x-15,y:y-19,w:30,h:36,fill:'white',r:5,sw:2.2,c:'purple'},text(x,y+8,ch,22,{bold:true,c:'purple'}));else m.push(text(x,y+9,ch,25,{bold:true}));});
 put(top,0,34);put(bottom,1,34);m.push(text(X(0),34+rh+9,op,25,{bold:true}));
 const ly=34+rh+30,W=14+cols*cw;m.push({t:'line',x1:10,y1:ly,x2:W,y2:ly,w:2});put(result,0,ly+34);m.push({t:'line',x1:10,y1:ly+62,x2:W,y2:ly+62,w:2});
 return fig(W+14,ly+72,m,alt);
}
const wMissing:Template=(r,i)=>{
 const add=i%2===0,x=r.int(1200,6999),y=r.int(1200,add?6999:x-500);if(!add&&y>=x)return null;
 const res=add?x+y:x-y,flags:number[]=[];let carry=0;
 for(let c=0;c<4;c++){flags.push(carry);const s=add?dig(x,10**c)+dig(y,10**c)+carry:dig(x,10**c)-carry-dig(y,10**c);carry=add?(s>=10?1:0):(s<0?1:0);}
 const cols=range(1,3).filter(c=>flags[c]===1);if(cols.length<2)return null;
 const [cA,cB]=r.sample(cols,2),rowA=add?'top':'bottom';
 const hide=(n:number,c:number,L:string)=>{const s=String(n).split('');s[s.length-1-c]=L;return s.join('');};
 const A=dig(add?x:y,10**cA),B=dig(res,10**cB),top=add?hide(x,cA,'P'):String(x),bottom=add?String(y):hide(y,cA,'P'),result=hide(res,cB,'Q');
 const A2=(A+1)%10,B2=add?(B+9)%10:(B+1)%10,f=(a:number,b:number)=>`P = ${a}, Q = ${b}`;
 const o=words4(f(A,B),[f(A2,B),f(A,B2),f(A2,B2)]);if(!o)return null;
 return {...o,prompt:`Find the missing digits **P** and **Q** in this ${add?'addition':'subtraction'}.`,rewardGroup:'challenge',
  visual:columnFigure(top,bottom,result,add?'+':'−',`A column ${add?'addition':'subtraction'} with two missing digits, P and Q`),
  explanation:explain(bullets(`The full calculation is ${num(x)} ${add?'+':'−'} ${num(y)} = ${num(res)}.`,`${COLS[cA]} column: there is ${add?'a carried 1':'an exchange'} from the column to the right, so P = ${A}.`,`${COLS[cB]} column: there is ${add?'a carried 1':'an exchange'} from the column to the right, so Q = ${B}.`),`Forgetting the ${add?'carried 1':'exchange'} makes a digit 1 out.`),
  audit:{k:'colDigits',top,bottom,result,op:add?'+':'-'}};
};
const wAdd:Template=r=>{
 const a=r.int(21000,69999),b=r.pick([r.int(12000,39999),r.int(2000,9999)]),s=a+b;if(addNoCarry(a,b)===s)return null;
 const [who]=r.sample(NAMES,1),stories=[
  `The Quest Shop sold ${num(a)} potions in the spring and ${num(b)} in the summer. How many potions did it sell altogether?`,
  `In a sponsored read, the school read ${num(a)} pages in the autumn term and ${num(b)} pages in the spring term. How many pages is that altogether?`,
  `${who}'s class counted ${num(a)} steps in one week and ${num(b)} steps the next week. How many steps did they count in total?`,
  `The manor's swimming pool held ${num(a)} litres of water. A hose added ${num(b)} more litres. How many litres does it hold now?`];
 const firstCarry=range(0,4).find(c=>dig(a,10**c)+dig(b,10**c)>=10)??0;
 const c=choices(s,[addNoCarry(a,b),s-10**(firstCarry+1),b<10000?a+b*10:s+1000,s+100]);if(!c)return null;
 return {...c,prompt:r.pick(stories),explanation:explain(`${num(a)} + ${num(b)} in columns:`,bullets(...addSteps(a,b)),`Answer: ${num(s)}`),audit:{k:'expr',e:`${a}+${b}`}};
};
const wSub:Template=r=>{
 const a=r.int(2,9)*1000+r.pick([0,r.int(1,9)])*100+r.pick([0,0,r.int(1,4)])*10+r.int(0,4),b=r.int(1000,a-500);
 if(subSmallFromLarge(a,b)===a-b||dig(a,1)>=dig(b,1))return null;
 const ans=a-b,c=choices(ans,[subSmallFromLarge(a,b),subForgetReduce(a,b),ans+100,ans-10]);if(!c)return null;
 return {...c,prompt:'Work out the answer using the column method.',stimulus:`${num(a)} − ${num(b)}`,
  explanation:explain(bullets(...subSteps(a,b)),`Answer: ${num(ans)}. Check: ${num(ans)} + ${num(b)} = ${num(a)}.`,`If you chose ${num(subSmallFromLarge(a,b))}, you took the smaller digit from the larger one in each column.`),
  audit:{k:'expr',e:`${a}-${b}`}};
};
const wInverse:Template=(r,i)=>{
 const who=r.pick(NAMES);
 if(i%2===0){const a=r.int(3000,9999),b=r.int(1000,a-500),c=a-b;
  const o=words4(`${num(c)} + ${num(b)}`,[`${num(a)} + ${num(b)}`,`${num(c)} − ${num(b)}`,`${num(a)} + ${num(c)}`,`${num(b)} − ${num(c)}`]);if(!o)return null;
  return {...o,prompt:`${who} works out ${num(a)} − ${num(b)} = ${num(c)}. Which calculation could ${who} use to check the answer?`,rewardGroup:'quick',
   explanation:explain(bullets('Subtraction is undone by addition.',`If ${num(a)} − ${num(b)} = ${num(c)}, then ${num(c)} + ${num(b)} should give ${num(a)}.`),`${num(c)} + ${num(b)} = ${num(a)}, so the answer is right.`),audit:{k:'inverse'}};}
 const a=r.int(1000,6000),b=r.int(1000,6000),c=a+b;
 const o=words4(`${num(c)} − ${num(b)}`,[`${num(c)} + ${num(b)}`,`${num(a)} − ${num(b)}`,`${num(b)} − ${num(a)}`,`${num(a)} + ${num(c)}`]);if(!o)return null;
 return {...o,prompt:`${who} works out ${num(a)} + ${num(b)} = ${num(c)}. Which calculation could ${who} use to check the answer?`,rewardGroup:'quick',
  explanation:explain(bullets('Addition is undone by subtraction.',`If ${num(a)} + ${num(b)} = ${num(c)}, then ${num(c)} − ${num(b)} should give ${num(a)}.`)),audit:{k:'inverse'}};
};
const wTwoStep:Template=r=>{
 const T=r.int(9000,19999),d1=r.int(2000,Math.floor(T/2)),d2=r.int(1000,T-d1-100),ans=T-d1-d2,[day1,day2]=r.pick([['Friday','Saturday'],['Monday','Tuesday'],['the morning','the afternoon']]);
 const c=choices(ans,[T-d1,T-d2,d1+d2,ans+1000,ans-100]);if(!c)return null;
 return {...c,prompt:`A stadium has ${num(T)} seats for the manor's charity match. ${num(d1)} tickets are sold on ${day1} and ${num(d2)} on ${day2}. How many seats are still unsold?`,rewardGroup:'challenge',
  explanation:explain(bullets(`Tickets sold: ${num(d1)} + ${num(d2)} = ${num(d1+d2)}`,`Seats left: ${num(T)} − ${num(d1+d2)} = ${num(ans)}`),`If you chose ${num(T-d1)}, you only took away the ${day1.replace('the ','')} tickets.`),
  audit:{k:'expr',e:`${T}-${d1}-${d2}`}};
};
const wMissingNumber:Template=r=>{
 const a=r.int(2000,6999),b=r.int(1500,6999),form=r.int(0,1);let s:string,ans:number,w:number[];
 if(form===0){ans=a+b;s=`☐ − ${num(a)} = ${num(b)}`;w=[Math.abs(b-a),addNoCarry(a,b),ans-100];}
 else{const c=a+b;ans=b;s=`${num(a)} + ☐ = ${num(c)}`;w=[c+a,subSmallFromLarge(c,a),ans+10,ans-1000];}
 const c=choices(ans,w.filter(x=>x>0));if(!c)return null;
 return {...c,prompt:'What number goes in the box?',stimulus:s,
  explanation:explain(bullets('Use the inverse operation.',form===0?`☐ = ${num(b)} + ${num(a)} = ${num(ans)}`:`☐ = ${num(a+b)} − ${num(a)} = ${num(ans)}`),`Check by putting ${num(ans)} in the box.`),
  audit:{k:'box',s}};
};

// ───────────────────────── Multiplication
const multiplication:Topic={id:'ma-multiplication',subject:'Maths',strand:'Calculation',title:'Multiplication',helpsheet:{
 intro:'To multiply by a two-digit number, split it into tens and ones, multiply by each part, then add the two answers.',
 steps:['Multiply by the ones digit.','Multiply by the tens digit. Because it is really tens, put a 0 in the ones column first (a place holder).','Add the two rows together.','Estimate first (round both numbers) so you can spot a silly answer.'],
 example:{title:'253 × 36',lines:['253 × 6 = 1,518','253 × 30 = 7,590 (the place holder 0 makes it 30, not 3)','1,518 + 7,590 = 9,108','Estimate: 250 × 40 = 10,000, so 9,108 is sensible.']},
 tips:['Forgetting the place holder 0 makes the tens row ten times too small.','In the grid method, multiply every part by every part: there are four boxes for 2-digit × 2-digit.','Multiplying by 30 is the same as multiplying by 3 and then by 10.'],
}};
const longMulSlips=(a:number,b:number)=>{const t=Math.floor(b/10),u=b%10;return [a*t+a*u,(a-a%10)*(b-b%10)+(a%10)*u,a*b+1000,a*b-100];};
const mulLong:Template=r=>{
 const a=r.int(124,689),b=r.int(23,78);if(b%10===0||a%10===0)return null;const ans=a*b,t=Math.floor(b/10),u=b%10;
 const c=choices(ans,longMulSlips(a,b));if(!c)return null;
 return {...c,prompt:'Work out the answer.',stimulus:`${num(a)} × ${b}`,
  explanation:explain(bullets(`${num(a)} × ${u} = ${num(a*u)}`,`${num(a)} × ${t*10} = ${num(a*t*10)}`,`${num(a*u)} + ${num(a*t*10)} = ${num(ans)}`),`If you chose ${num(a*t+a*u)}, you forgot the place holder 0 when multiplying by ${t*10}.`),
  audit:{k:'expr',e:`${a}*${b}`}};
};
const mulGrid:Template=(r,i)=>{
 const a=r.int(124,489),b=r.int(23,68);if(a%10<2||b%10<3||Math.floor(a/10)%10===0)return null;
 const ap=[a-a%100,a%100-a%10,a%10],bp=[b-b%10,b%10],cells=bp.map(y=>ap.map(x=>x*y));
 if(i%2===0){const row=r.int(0,1),col=r.int(0,2),v=cells[row][col],xa=ap[col],yb=bp[row];
  const rows=bp.map((y,j)=>[num(y),...cells[j].map((c,k)=>j===row&&k===col?'?':num(c))]);
  const c=choices(v,[v/10,v*10,xa+yb,Math.round(v/100)*100===v?v+100:v/100]);if(!c)return null;
  return {...c,prompt:`${r.pick(NAMES)} uses a grid to work out ${num(a)} × ${b}. What is the missing number?`,rewardGroup:'quick',
   visual:{kind:'table',head:['×',...ap.map(x=>num(x))],rows,alt:'A multiplication grid with one box missing'},
   explanation:explain(bullets(`The missing box is ${num(xa)} × ${num(yb)}.`,`${xa/10**(len(xa)-1)} × ${yb/10**(len(yb)-1)} = ${xa/10**(len(xa)-1)*yb/10**(len(yb)-1)}, then put back the zeros: ${num(v)}.`),`Count the zeros: ${num(xa)} has ${len(xa)-String(xa).replace(/0+$/,'').length} and ${num(yb)} has ${len(yb)-String(yb).replace(/0+$/,'').length}.`),
   audit:{k:'grid'}};}
 const rows=bp.map((y,j)=>[num(y),...cells[j].map(c=>num(c))]),total=a*b;
 const c=choices(total,[sum(cells[0]),sum(cells[1])+sum(cells[0])-cells[0][1],addNoCarry(sum(cells[0]),sum(cells[1])),total+1000]);if(!c)return null;
 return {...c,prompt:`The grid shows how ${r.pick(NAMES)} worked out ${num(a)} × ${b}. What is the answer?`,
  visual:{kind:'table',head:['×',...ap.map(x=>num(x))],rows,alt:'A completed multiplication grid'},
  explanation:explain(bullets(`First row: ${cells[0].map(x=>num(x)).join(' + ')} = ${num(sum(cells[0]))}`,`Second row: ${cells[1].map(x=>num(x)).join(' + ')} = ${num(sum(cells[1]))}`,`Total: ${num(sum(cells[0]))} + ${num(sum(cells[1]))} = ${num(total)}`),'Add every box in the grid, not just one row.'),
  audit:{k:'grid'}};
};
const mulStory:Template=r=>{
 const [rows,per,thing,unit]=r.pick([[r.int(24,48),r.int(18,36),'rows of seats in the manor\'s great hall','seats'],[r.int(15,40),r.int(24,48),'boxes of glow sticks for the night walk','glow sticks'],[r.int(12,35),r.int(125,250),'crates of apples for the school fair','apples'],[r.int(16,29),r.int(36,64),'packs of cards in the Quest Shop','cards']] as const);
 if(rows%10===0||per%10===0)return null;const ans=rows*per;
 const c=choices(ans,longMulSlips(per,rows));if(!c)return null;
 return {...c,prompt:`There are ${rows} ${thing}. Each holds ${per} ${unit}. How many ${unit} is that altogether?`,
  explanation:explain(bullets(`${num(per)} × ${rows % 10} = ${num(per*(rows%10))}`,`${num(per)} × ${rows-rows%10} = ${num(per*(rows-rows%10))}`,`${num(per*(rows%10))} + ${num(per*(rows-rows%10))} = ${num(ans)}`),`If you chose ${num(per*Math.floor(rows/10)+per*(rows%10))}, you forgot the place holder 0 when multiplying by ${rows-rows%10}.`),
  audit:{k:'expr',e:`${rows}*${per}`}};
};
const mulTens:Template=r=>{
 const a=r.int(2,9)*10**r.int(1,3),b=r.int(2,9)*10**r.int(1,2),ans=a*b;if(ans>10_000_000)return null;
 const c=choices(ans,[ans/10,ans*10,ans/100,a+b]);if(!c)return null;
 const za=len(a)-1,zb=len(b)-1,fa=a/10**za,fb=b/10**zb;
 return {...c,prompt:'Work out the answer in your head.',stimulus:`${num(a)} × ${num(b)}`,rewardGroup:'quick',
  explanation:explain(bullets(`${fa} × ${fb} = ${fa*fb}`,`${num(a)} has ${za} zero${za>1?'s':''} and ${num(b)} has ${zb} zero${zb>1?'s':''}, so the answer is ${fa*fb} × ${num(10**(za+zb))}.`,`${num(a)} × ${num(b)} = ${num(ans)}`),'Take care when the digit fact already ends in 0, like 5 × 4 = 20.'),
  audit:{k:'expr',e:`${a}*${b}`}};
};
const mulFact:Template=r=>{
 const a=r.int(13,49),b=r.int(23,89),p=a*b,form=r.int(0,3);let s:string,ans:number,e:string,w:number[],how:string;if(a%10===0||b%10===0)return null;
 if(form===0){s=`${num(a/10)} × ${b}`;ans=tidy(p/10);e=`${a}/#10*${b}`;w=[tidy(p/100),p,p*10];how=`${num(a/10)} is ${a} ÷ 10, so the answer is ${num(p)} ÷ 10.`;}
 else if(form===1){s=`${a} × ${num(b/100)}`;ans=tidy(p/100);e=`${a}*${b}/#100`;w=[tidy(p/10),tidy(p/1000),p];how=`${num(b/100)} is ${b} ÷ 100, so the answer is ${num(p)} ÷ 100.`;}
 else if(form===2){s=`${num(a*10)} × ${num(b/10)}`;ans=p;e=`${a}*#10*${b}/#10`;w=[p*10,tidy(p/10),p*100];how=`${num(a*10)} is ten times ${a} and ${num(b/10)} is ${b} ÷ 10, so the answer is unchanged.`;}
 else{s=`${a} × ${b+1}`;ans=p+a;e=`${a}*(${b}+#1)`;w=[p+b,p+1,p-a];how=`${a} × ${b+1} is one more lot of ${a}: ${num(p)} + ${a}.`;}
 const c=choices(ans,w,x=>num(x));if(!c)return null;
 return {...c,prompt:`Use the fact ${a} × ${b} = ${num(p)} to work out the answer.`,stimulus:s,
  explanation:explain(bullets(how,`${s} = ${num(ans)}`),'Estimate to check the size of the answer.'),
  audit:{k:'expr',e}};
};
const mulMissingDigit:Template=r=>{
 const h=r.int(1,6),t=r.int(0,9),o=r.int(1,9),m=r.int(3,9),a=h*100+t*10+o,P=a*m;
 const fits=range(0,9).filter(x=>(h*100+x*10+o)*m===P);if(fits.length!==1)return null;
 const s=`${h}☐${o} × ${m} = ${num(P)}`,o4=pick(t,[(t+1)%10,(t+9)%10,(t+5)%10,dig(P,10)],x=>String(x),x=>x);if(!o4)return null;
 return {...o4,prompt:'Which digit is missing from the box?',stimulus:s,
  explanation:explain(bullets(`${num(P)} ÷ ${m} = ${a}`,`So the missing digit is ${t}.`),`Check: ${a} × ${m} = ${num(P)}.`),
  audit:{k:'box',s,digit:true}};
};

// ───────────────────────── Division
const division:Topic={id:'ma-division',subject:'Maths',strand:'Calculation',title:'Division and remainders',helpsheet:{
 intro:'Short division works from the left: divide each digit in turn and carry any remainder into the next digit.',
 steps:['Divide the first digit (or the first two, if the first is too small) by the divisor.','Write the answer above and carry the remainder to the next digit, making a new number.','If a part is too small to divide, write 0 in the answer. Do not skip it.','In a word problem, decide what the remainder means: round up, round down, or give it as a fraction or decimal.'],
 example:{title:'150 cupcakes go in boxes of 8',lines:['150 ÷ 8 = 18 remainder 6','How many boxes are needed for all of them? 19 (round up: the 6 need a box too).','How many full boxes? 18 (round down).','How many cupcakes are left over? 6.']},
 tips:['Missing a 0 in the answer is a common slip: 816 ÷ 8 = 102, not 12.','A remainder can be written as a fraction: 7 ÷ 4 = 1 3/4.','Check by multiplying: answer × divisor + remainder = the number you started with.'],
}};
const divContext:Template=(r,i)=>{
 const kind=i%3;
 if(kind===0){const [n,c,who,what,story]=r.pick([[r.int(120,260),r.pick([15,16,24,28]),'pupils','minibuses','pupils are going on a school trip. Each minibus holds'],[r.int(100,250),r.pick([6,8,12]),'guests','tables','guests are coming to the manor\'s feast. Each table seats'],[r.int(150,400),r.pick([12,15,20,25]),'books','boxes','books are being moved to the new library. Each box holds']] as const),q=Math.floor(n/c),rem=n%c;if(!rem)return null;
  const c4=pick<string>(String(q+1),[String(q),`${q} r ${rem}`,String(rem),String(q+2)],x=>x);if(!c4)return null;
  return {...c4,prompt:`${n} ${story} ${c} ${who}. How many ${what} are needed?`,
   explanation:explain(bullets(`${n} ÷ ${c} = ${q} remainder ${rem}`,`${q} ${what} hold ${q*c}; the other ${rem} ${rem===1?who.slice(0,-1):who} still ${rem===1?'needs':'need'} one more.`),`So ${q+1} ${what} are needed: round up.`),
   audit:{k:'expr',e:`ceil(${n}/${c})`}};}
 if(kind===1){const c=r.pick([6,8,12,15]),n=r.int(10,30)*c+r.int(1,c-1),q=Math.floor(n/c),rem=n%c,[thing,box]=r.pick([['eggs','boxes'],['cupcakes','trays'],['stickers','sheets'],['coins','bags']]);
  const c4=pick<string>(String(q),[String(q+1),`${q} r ${rem}`,String(rem)],x=>x);if(!c4)return null;
  return {...c4,prompt:`There are ${n} ${thing}. They are packed into ${box} of ${c}. How many **full** ${box} can be made?`,
   explanation:explain(bullets(`${n} ÷ ${c} = ${q} remainder ${rem}`,`The ${rem} left over ${rem===1?'does':'do'} not fill another one.`),`So ${q} full ${box}: round down.`),
   audit:{k:'expr',e:`floor(${n}/${c})`}};}
 const c=r.pick([7,8,9,12]),n=r.int(12,40)*c+r.int(1,c-1),q=Math.floor(n/c),rem=n%c;
 const ch=choices(rem,[q,c-rem,rem+1,Math.round((n/c-q)*10)]);if(!ch)return null;
 return {...ch,prompt:`${n} pupils are put into teams of ${c} for sports day. How many pupils are left over?`,
  explanation:explain(bullets(`${n} ÷ ${c} = ${q} remainder ${rem}`,`${q} teams use ${q} × ${c} = ${q*c} pupils.`,`${n} − ${q*c} = ${rem} left over.`)),
  audit:{k:'expr',e:`mod(${n},${c})`}};
};
const divShort:Template=r=>{
 const d=r.int(3,9),q=r.pick([r.int(1,9)*100+r.int(1,9),r.int(1,9)*1000+r.int(1,9)*10+r.int(1,9),r.int(11,99)*100+r.int(1,9)*10]),n=d*q;if(n>99999||n<1000)return null;
 const qs=String(q),noZero=Number(qs.replace(/0/g,'')),moved=Number(qs.replace(/0/,'')+'0');
 const c=choices(q,[noZero,moved,q+10**(qs.length-1-qs.indexOf('0')),q-1]);if(!c)return null;
 return {...c,prompt:'Work out the answer using short division.',stimulus:`${num(n)} ÷ ${d}`,
  explanation:explain(bullets(...divSteps(n,d)),`Answer: ${num(q)}. If you chose ${num(noZero)}, you left out the 0.`),
  audit:{k:'expr',e:`${n}/${d}`}};
};
const divLong:Template=r=>{
 const d=r.int(12,25),q=r.int(1,4)*100+r.int(1,9),n=d*q;if(n>9999)return null;
 const qs=String(q),c=choices(q,[Number(qs.replace(/0/g,'')),q+10,q-1,Number(qs.replace(/0/,'')+'0')]);if(!c)return null;
 return {...c,prompt:'Work out the answer.',stimulus:`${num(n)} ÷ ${d}`,
  explanation:explain(bullets(...divSteps(n,d)),`Answer: ${num(q)}.`,`Check: ${num(q)} × ${d} = ${num(n)}.`),
  audit:{k:'expr',e:`${n}/${d}`}};
};
const divRemainder:Template=(r,i)=>{
 if(i%2===0){const n=r.pick([4,5]),T=r.int(13,99);if(T%n===0)return null;const ans=tidy(T/n),q=Math.floor(T/n),rem=T%n;
  const c=choices(ans,[tidy(q+rem/10),q,q+1,tidy(ans+0.5)],x=>`£${x.toFixed(2)}`);if(!c)return null;
  return {...c,prompt:`${cap(words(n))} friends share £${T} equally. How much does each friend get?`,
   explanation:explain(bullets(`£${T} ÷ ${n} = £${q} remainder £${rem}`,`£${rem} = ${rem*100}p, and ${rem*100}p ÷ ${n} = ${rem*100/n}p`,`Each friend gets £${ans.toFixed(2)}.`),`If you chose £${tidy(q+rem/10).toFixed(2)}, you wrote the remainder ${rem} after the decimal point.`),
   audit:{k:'expr',e:`${T}/${n}`}};}
 const d=r.pick([3,4,5,6,8]),n=r.int(d+1,4*d);if(n%d===0)return null;const q=Math.floor(n/d),rem=n%d;
 const [thing,who]=r.pick([['pizzas','children'],['cakes','friends'],['pies','tables'],['ribbons','teams']]);if(gcd(rem,d)!==1)return null;
 const one=({children:'child',friends:'friend',tables:'table',teams:'team'} as Record<string,string>)[who];
 const c=pick<string>(`${q} ${rem}/${d}`.replace(/^0 /,''),[`${q} ${rem}/${n}`.replace(/^0 /,''),`${q} r ${rem}`,`${q+1} ${rem}/${d}`,`${rem} ${q}/${d}`],x=>x);if(!c)return null;
 return {...c,prompt:`${n} ${thing} are shared equally between ${d} ${who}. How many ${thing} does each ${one} get? Give your answer as a mixed number.`,
  explanation:explain(bullets(`${n} ÷ ${d} = ${q} remainder ${rem}`,`The ${rem} left over ${rem===1?'is':'are'} shared between ${d}, which is ${rem}/${d} each.`,`Each ${one} gets ${q} ${rem}/${d} ${thing}.`)),
  audit:{k:'expr',e:`${n}/${d}`}};
};
const divMissing:Template=r=>{
 const d=r.int(4,9),q=r.int(21,89),rem=r.int(1,d-1),n=d*q+rem,s=`☐ ÷ ${d} = ${q} r ${rem}`;
 const c=choices(n,[d*q,d*q-rem,(q+rem)*d,q*rem+d]);if(!c)return null;
 return {...c,prompt:'What number goes in the box?',stimulus:s,
  explanation:explain(bullets(`${q} groups of ${d} make ${q} × ${d} = ${num(d*q)}.`,`Add the remainder: ${num(d*q)} + ${rem} = ${num(n)}.`),`Check: ${num(n)} ÷ ${d} = ${q} remainder ${rem}.`),
  audit:{k:'expr',e:`${d}*${q}+${rem}`}};
};
const divRule:Template=r=>{
 const [by,why,near]=r.pick([[6,'A number divides exactly by 6 when it is even and its digits add up to a multiple of 3.',[2,3]],[4,'A number divides exactly by 4 when its last two digits make a multiple of 4.',[2]],[9,'A number divides exactly by 9 when its digits add up to a multiple of 9.',[3]],[3,'A number divides exactly by 3 when its digits add up to a multiple of 3.',[1]]] as const);
 const good=r.int(300,2400)*by,bad=[...near.map(k=>{let x=r.int(300,2400)*k;while(x%by===0)x+=k;return x;}),good+(by===6?3:by===4?2:by===9?3:1),good+1].filter(x=>x%by!==0);
 const c=choices(good,bad);if(!c)return null;
 return {...c,prompt:`Which number can be divided **exactly** by ${by}?`,rewardGroup:'standard',
  explanation:explain(bullets(why,`${num(good)}: ${by===4?`the last two digits make ${good%100}, and ${good%100} ÷ 4 = ${(good%100)/4}`:`the digits add up to ${sum(String(good).split('').map(Number))}${by===6?' and it is even':''}`}.`,`${num(good)} ÷ ${by} = ${num(good/by)}`)),
  audit:{k:'divisible',by}};
};

// ───────────────────────── Order of operations
const orderOps:Topic={id:'ma-order-of-operations',subject:'Maths',strand:'Calculation',title:'Order of operations',helpsheet:{
 intro:'When a calculation has more than one operation, the order matters. Remember BIDMAS: Brackets, Indices (powers), Division and Multiplication, Addition and Subtraction.',
 steps:['Work out anything in brackets first.','Then powers, such as squares (²) and cubes (³).','Then multiplication and division, working from left to right.','Last, addition and subtraction, working from left to right.'],
 example:{title:'20 − 3 × (2 + 4)',lines:['Brackets: 2 + 4 = 6','Multiply: 3 × 6 = 18','Subtract: 20 − 18 = 2']},
 tips:['Do not just work from left to right: 2 + 3 × 4 is 14, not 20.','Division and multiplication have the same priority, so take them in order from the left.','A number next to a bracket means multiply: 3(4 + 1) = 3 × 5.'],
}};
const OPS:Record<string,(a:number,b:number)=>number>={'+':(a,b)=>a+b,'−':(a,b)=>a-b,'×':(a,b)=>a*b,'÷':(a,b)=>a/b};
const js=(s:string)=>s.replace(/−/g,'-').replace(/×/g,'*').replace(/÷/g,'/').replace(/²/g,'^2').replace(/³/g,'^3');
const leftToRight=(nums:number[],ops:string[])=>nums.slice(1).reduce((acc,n,k)=>OPS[ops[k]](acc,n),nums[0]);
const opsPlain:Template=r=>{
 const form=r.int(0,4);let nums:number[],ops:string[];
 switch(form){
  case 0:{const b=r.int(2,9),c=r.int(2,9);nums=[b*c+r.int(1,20),b,c,r.int(1,9)];ops=['−','×','+'];break;}
  case 1:nums=[r.int(2,20),r.int(2,9),r.int(2,9)];ops=['+','×'];break;
  case 2:nums=[r.int(3,9),r.int(3,9),r.int(2,6),r.int(2,6)];ops=['×','−','×'];if(nums[0]*nums[1]<=nums[2]*nums[3])return null;break;
  case 3:{const b=r.int(2,9);nums=[b*r.int(2,9),b,r.int(2,9),r.int(2,9)];ops=['÷','+','×'];break;}
  default:{const c=r.int(2,9);nums=[r.int(20,60),c*r.int(2,6),c];ops=['−','÷'];}
 }
 const s=nums.map((n,k)=>k?`${ops[k-1]} ${n}`:String(n)).join(' '),ans=calc(s),ltr=leftToRight(nums,ops);
 const alt=nums.length===4?calc(`(${nums[0]} ${ops[0]} ${nums[1]}) ${ops[1]} (${nums[2]} ${ops[2]} ${nums[3]})`):calc(`(${nums[0]} ${ops[0]} ${nums[1]}) ${ops[1]} ${nums[2]}`);
 const c=choices(ans,[ltr,alt,ans+nums.at(-1)!,ans-1].filter(x=>Number.isInteger(x)));if(!c)return null;
 return {...c,prompt:'Work out the answer. Think about the order of operations.',stimulus:s,
  explanation:explain(bullets('Multiplication and division come before addition and subtraction.',...opSteps(s)),ltr!==ans?`Working from left to right gives ${num(ltr)}, which is wrong.`:null),
  audit:{k:'expr',e:js(s)}};
};
/** Explanation steps for a calculation without brackets: do × and ÷ first, then + and −, left to right. */
function opSteps(s:string){const toks=s.split(' '),lines:string[]=[];let t=[...toks];
 for(const group of [['×','÷'],['+','−']]){let k=1;while(k<t.length){if(group.includes(t[k])){const a=Number(t[k-1]),b=Number(t[k+1]),v=tidy(OPS[t[k]](a,b));lines.push(`${a} ${t[k]} ${b} = ${num(v)}`);t.splice(k-1,3,String(v));}else k+=2;}}
 return lines;}
const opsBrackets:Template=r=>{
 const form=r.int(0,3);let s:string,w:number[],steps:string[],slip:string;
 if(form===0){const c=r.pick([2,3,4,5]),x=r.int(2,8)*c,a=x+r.int(4,30),b=a-x,d=r.int(1,9);s=`(${a} − ${b}) ÷ ${c} + ${d}`;w=[(a-b)/(c+d),a-b+d,(a-b)*c+d];
  steps=[`Brackets: ${a} − ${b} = ${x}`,`Divide: ${x} ÷ ${c} = ${x/c}`,`Add: ${x/c} + ${d} = ${x/c+d}`];slip=`${num((a-b)*c+d)} comes from multiplying instead of dividing.`;}
 else if(form===1){const a=r.int(2,9),b=r.int(2,6),c=r.int(2,5);s=`${a} + ${b}² × ${c}`;w=[(a+b*b)*c,a+b*2*c,(a+b)**2*c];
  steps=[`Power: ${b}² = ${b*b}`,`Multiply: ${b*b} × ${c} = ${b*b*c}`,`Add: ${a} + ${b*b*c} = ${a+b*b*c}`];slip=`${b}² means ${b} × ${b}, not ${b} × 2.`;}
 else if(form===2){const a=r.int(2,6),b=r.int(1,9),c=r.int(2,4);s=`${a} × (${b} + ${c}²)`;w=[a*b+c*c,a*(b+c)**2,a*(b+c*2)];
  steps=[`Power inside the brackets: ${c}² = ${c*c}`,`Brackets: ${b} + ${c*c} = ${b+c*c}`,`Multiply: ${a} × ${b+c*c} = ${a*(b+c*c)}`];slip=`Only the ${c} is squared, not the whole bracket.`;}
 else{const a=r.int(2,6),b=r.int(1,5),c=r.int(3,20);s=`(${a} + ${b})² − ${c}`;w=[a+b*b-c,a*a+b*b-c,(a+b)*2-c];
  steps=[`Brackets: ${a} + ${b} = ${a+b}`,`Power: ${a+b}² = ${(a+b)**2}`,`Subtract: ${(a+b)**2} − ${c} = ${(a+b)**2-c}`];slip=`The whole bracket is squared, so work out ${a} + ${b} first.`;}
 const ans=calc(s),c=choices(ans,w.filter(x=>Number.isInteger(x)));if(!c)return null;
 return {...c,prompt:'Work out the answer.',stimulus:s,
  explanation:explain('Brackets first, then powers, then × and ÷, then + and −.',bullets(...steps),slip),
  audit:{k:'expr',e:js(s)}};
};
const opsWhereBrackets:Template=r=>{
 const nums=[r.int(2,9),r.int(2,9),r.int(2,9),r.int(1,6)],ops=r.pick([['+','×','−'],['×','+','−'],['+','×','+'],['−','×','+']]);
 const place=[[0,1],[1,2],[2,3],[0,2],[1,3]],show=(p:number[])=>nums.map((n,k)=>`${k===p[0]?'(':''}${n}${k===p[1]?')':''}`).map((x,k)=>k?`${ops[k-1]} ${x}`:x).join(' ');
 const exprs=place.map(show),vals=exprs.map(calc),k=r.int(0,4),target=vals[k];if(!Number.isInteger(target)||target<0)return null;
 const others=exprs.filter((_,j)=>j!==k&&vals[j]!==target);if(others.length<3)return null;
 if(calc(nums.map((n,j)=>j?`${ops[j-1]} ${n}`:String(n)).join(' '))===target)return null;
 const o=words4(exprs[k],r.sample(others,3));if(!o)return null;
 return {...o,prompt:`Where should the brackets go to make this calculation equal **${target}**?`,stimulus:`${nums.map((n,j)=>j?`${ops[j-1]} ${n}`:String(n)).join(' ')} = ${target}`,rewardGroup:'challenge',
  explanation:explain(bullets(`${exprs[k]} = ${target}`,...o.wrong.map(x=>`${x} = ${num(calc(x))}`)),'Work out each option, doing the brackets first.'),
  audit:{k:'bracket'}};
};
const opsStory:Template=r=>{
 const who=r.pick(NAMES),kind=r.int(0,3);let prompt:string,right:string,wrong:string[],why:string;
 if(kind===0){const n=r.int(3,8),k=r.int(4,12),g=r.int(2,k-1);prompt=`${who} buys ${n} packs of ${k} stickers, then gives ${g} stickers away. Which calculation shows how many stickers ${who} has now?`;right=`${n} × ${k} − ${g}`;wrong=[`${n} × (${k} − ${g})`,`${n} + ${k} − ${g}`,`(${n} − ${g}) × ${k}`];why=`${n} packs of ${k} is ${n} × ${k}. Then take away the ${g} given away. Multiplication comes first anyway, so no brackets are needed.`;}
 else if(kind===1){const b=r.int(3,6),a=b*r.int(3,9),c=r.int(2,9);prompt=`£${a} is shared equally between ${b} friends. Then each friend is given £${c} more. Which calculation shows how much each friend has?`;right=`${a} ÷ ${b} + ${c}`;wrong=[`${a} ÷ (${b} + ${c})`,`(${a} + ${c}) ÷ ${b}`,`${a} + ${c} ÷ ${b}`];why=`Each friend first gets £${a} ÷ ${b}. Then add the £${c}. Division comes first anyway, so no brackets are needed.`;}
 else if(kind===2){const rows=r.int(4,9),s=r.int(6,12),t=r.int(2,4);prompt=`A hall has ${rows} rows of ${s} chairs. ${cap(words(t))} more chairs are added to every row. Which calculation shows the number of chairs now?`;right=`${rows} × (${s} + ${t})`;wrong=[`${rows} × ${s} + ${t}`,`${rows} + ${s} × ${t}`,`(${rows} + ${s}) × ${t}`];why=`Each row now has ${s} + ${t} chairs, and there are ${rows} rows. The brackets make the adding happen before the multiplying.`;}
 else{const x=r.int(3,8),p=r.int(4,9),q=r.int(2,5);prompt=`${who} buys ${x} tickets at £${p} each and one programme for £${q}. Which calculation shows the total cost in pounds?`;right=`${x} × ${p} + ${q}`;wrong=[`${x} × (${p} + ${q})`,`(${x} + ${p}) × ${q}`,`${x} + ${p} × ${q}`];why=`${x} tickets cost ${x} × ${p} pounds. Then add the £${q} programme once. Multiplication comes first anyway, so no brackets are needed.`;}
 const v=calc(right);if(wrong.some(w=>calc(w)===v))return null;const o=words4(right,wrong);if(!o)return null;
 return {...o,prompt,explanation:explain(bullets(why,`${right} = ${num(v)}`),`${wrong[0]} gives ${num(calc(wrong[0]))}, which does not match the story.`),
  audit:{k:'story',e:js(right)}};
};
const opsLargest:Template=r=>{
 const a=r.int(2,9),b=r.int(2,9),c=r.int(2,9),exprs=[`${a} + ${b} × ${c}`,`(${a} + ${b}) × ${c}`,`${a} × ${b} + ${c}`,`${a} × (${b} + ${c})`,`${a} + ${b} + ${c}`];
 const vals=exprs.map(calc),mx=Math.max(...vals);if(vals.filter(v=>v===mx).length!==1)return null;
 const ans=exprs[vals.indexOf(mx)],o=words4(ans,r.shuffle(exprs.filter(x=>x!==ans)).slice(0,3));if(!o)return null;
 return {...o,prompt:'Which calculation has the **greatest** answer?',
  explanation:explain(bullets(...[ans,...o.wrong].map(x=>`${x} = ${calc(x)}`)),`The greatest is ${ans}.`),
  audit:{k:'largest'}};
};
const opsMissing:Template=r=>{
 const form=r.int(0,1);let s:string,ans:number,w:number[],steps:string[];
 if(form===0){const a=r.int(3,20),b=r.int(2,9),x=r.int(2,12),t=a+x*b;s=`${a} + ☐ × ${b} = ${t}`;ans=x;w=[t-a,t/b,t/b-a,(t-a)*b];
  steps=[`The multiplication happens first, so ${a} + (☐ × ${b}) = ${t}.`,`☐ × ${b} = ${t} − ${a} = ${t-a}`,`☐ = ${t-a} ÷ ${b} = ${x}`];}
 else{const b=r.int(2,9),c=r.int(2,9),x=b*c+r.int(1,30),t=x-b*c;s=`☐ − ${b} × ${c} = ${t}`;ans=x;w=[(t+b)*c,t+b,t+c,t*b+c];
  steps=[`The multiplication happens first: ${b} × ${c} = ${b*c}, so ☐ − ${b*c} = ${t}.`,`☐ = ${t} + ${b*c} = ${x}`];}
 const c=choices(ans,w.filter(x=>Number.isInteger(x)&&x>0));if(!c)return null;
 return {...c,prompt:'What number goes in the box?',stimulus:s,rewardGroup:'challenge',
  explanation:explain(bullets(...steps),`Check: put ${num(ans)} in the box and work it out.`),
  audit:{k:'box',s}};
};

// ───────────────────────── Factors, multiples and primes
const factors:Topic={id:'ma-factors-primes',subject:'Maths',strand:'Calculation',title:'Factors, multiples and primes',helpsheet:{
 intro:'A factor divides a number exactly. A multiple is in a number\'s times table. A prime number has exactly two factors: 1 and itself.',
 steps:['To list factors, find them in pairs: 1 × 30, 2 × 15, 3 × 10, 5 × 6. Stop when the pairs meet.','To test for a prime, try dividing by 2, 3, 5, 7 … up to the square root. If none divide exactly, it is prime.','Common multiple: a number in both times tables. The lowest one is the lowest common multiple (LCM).','Common factor: a number that divides both. The biggest is the highest common factor (HCF).'],
 example:{title:'Is 91 prime?',lines:['91 is odd, so 2 is not a factor.','9 + 1 = 10, so 3 is not a factor. It does not end in 0 or 5.','91 ÷ 7 = 13, so 91 = 7 × 13. It is not prime.']},
 tips:['1 is not a prime number: it has only one factor.','2 is the only even prime.','Odd numbers like 51, 57 and 87 look prime but are multiples of 3.'],
}};
const TRICKY=[51,57,87,91,111,119,133,143,161,169,187,203,209,217,221,247,253];
const fPrime:Template=(r,i)=>{
 if(i%2===0){const p=r.pick(range(41,199).filter(isPrime)),bad=r.sample(TRICKY,3);
  const c=choices(p,bad);if(!c)return null;
  return {...c,prompt:'Which of these is a **prime** number?',rewardGroup:'quick',
   explanation:explain(bullets(...bad.map(x=>{const f=range(2,x).find(k=>x%k===0)!;return `${x} = ${f} × ${x/f}, so it is not prime.`}),`${p} cannot be divided exactly by 2, 3, 5, 7, 11 or 13, so it is prime.`)),
   audit:{k:'which',prop:'prime'}};}
 const ps=r.sample(range(23,97).filter(isPrime),3),bad=r.pick(TRICKY.filter(x=>x<150));
 const c=choices(bad,ps);if(!c)return null;const f=range(2,bad).find(k=>bad%k===0)!;
 return {...c,prompt:'Which of these is **NOT** a prime number?',rewardGroup:'quick',
  explanation:explain(bullets(`${bad} = ${f} × ${bad/f}, so it has more than two factors.`,`${list(ps.map(String))} each have exactly two factors.`)),
  audit:{k:'which',prop:'notPrime'}};
};
const fCount:Template=r=>{
 const n=r.pick([24,30,36,40,42,45,48,50,54,56,60,63,64,72,80,84,90,96,100]),fs=factorsOf(n),k=fs.length,sq=Number.isInteger(Math.sqrt(n));
 const c=choices(k,[sq?k+1:k/2,k-2,k-1,k+2]);if(!c)return null;
 const pairs=fs.filter(x=>x*x<=n).map(x=>`${x} × ${n/x}`);
 return {...c,prompt:`How many factors does **${n}** have?`,
  explanation:explain('List the factor pairs:',bullets(...pairs),`Factors: ${fs.join(', ')}. That is ${k} factors.`,sq?`${Math.sqrt(n)} × ${Math.sqrt(n)} gives only one factor, ${Math.sqrt(n)}, so do not count it twice.`:null),
  audit:{k:'nFactors',n}};
};
const fHcfLcm:Template=(r,i)=>{
 const kind=i%3;
 if(kind===0){const [a,b]=r.pick([[12,18],[15,20],[16,24],[18,24],[20,30],[24,36],[9,12],[14,21]]),l=lcm(a,b);
  const c=choices(l,[a*b,gcd(a,b),a+b,2*l]);if(!c)return null;
  return {...c,prompt:`Two lighthouses flash together at midnight. One flashes every ${a} seconds and the other every ${b} seconds. After how many seconds do they next flash together?`,rewardGroup:'challenge',
   explanation:explain(bullets(`Multiples of ${a}: ${range(1,l/a).map(k=>k*a).join(', ')}`,`Multiples of ${b}: ${range(1,l/b).map(k=>k*b).join(', ')}`,`The lowest common multiple is ${l}.`),`${a} × ${b} = ${a*b} is a common multiple, but not the lowest.`),
   audit:{k:'expr',e:`lcm(${a},${b})`}};}
 if(kind===1){const [a,b]=r.pick([[6,8],[8,10],[6,10],[4,6],[10,12],[6,9]]),l=lcm(a,b);
  const c=choices(l,[a*b,a+b,gcd(a,b),l+a]);if(!c)return null;
  return {...c,prompt:`Bread rolls come in packs of ${a} and burgers come in packs of ${b}. What is the smallest number of rolls ${r.pick(NAMES)} can buy to have exactly one roll for every burger, with none left over?`,rewardGroup:'challenge',
   explanation:explain(bullets(`The number must be a multiple of ${a} and of ${b}.`,`Multiples of ${a}: ${range(1,l/a).map(k=>k*a).join(', ')}`,`Multiples of ${b}: ${range(1,l/b).map(k=>k*b).join(', ')}`,`The lowest common multiple is ${l}.`)),
   audit:{k:'expr',e:`lcm(${a},${b})`}};}
 const [a,b]=r.pick([[24,36],[18,30],[16,40],[20,32],[27,45],[28,42],[30,45]]),h=gcd(a,b);
 const c=choices(h,[h/2,h/3,lcm(a,b),b-a,h*2].filter(x=>Number.isInteger(x)&&x>1));if(!c)return null;
 return {...c,prompt:`A baker has ${a} cheese scones and ${b} fruit scones. She packs all of them into identical boxes, each with the same mix and none left over. What is the greatest number of boxes she can fill?`,rewardGroup:'challenge',
  explanation:explain(bullets(`Factors of ${a}: ${factorsOf(a).join(', ')}`,`Factors of ${b}: ${factorsOf(b).join(', ')}`,`The highest common factor is ${h}.`),`Each box then has ${a/h} cheese and ${b/h} fruit scones.`),
  audit:{k:'expr',e:`gcd(${a},${b})`}};
};
const fCommon:Template=(r,i)=>{
 if(i%2===0){const [a,b]=r.pick([[4,6],[6,9],[4,10],[6,8],[9,12],[8,12]]),l=lcm(a,b),ans=l*r.int(1,3),bad=[...range(2,12).map(k=>k*a),...range(2,12).map(k=>k*b)].filter(x=>x%l!==0&&x<l*4);
  const c=choices(ans,r.sample(bad,6));if(!c)return null;
  return {...c,prompt:`Which number is a **common multiple** of ${a} and ${b}?`,rewardGroup:'quick',
   explanation:explain(bullets(`${ans} ÷ ${a} = ${ans/a} and ${ans} ÷ ${b} = ${ans/b}, so ${ans} is in both times tables.`,...c.wrong.map(w=>`${w} is ${Number(w)%a===0?`a multiple of ${a} but not of ${b}`:`a multiple of ${b} but not of ${a}`}.`))),
   audit:{k:'which',prop:'commonMultiple',a,b}};}
 const [a,b]=r.pick([[84,70],[60,42],[72,54],[90,48],[36,60],[96,72]]),fa=factorsOf(a),fb=factorsOf(b),ans=r.pick(fa.filter(x=>!fb.includes(x)&&x>2&&x<a));
 if(ans===undefined)return null;const both=fa.filter(x=>fb.includes(x)&&x>1),onlyB=fb.filter(x=>!fa.includes(x)&&x>1&&x<b);
 const c=choices(ans,[...r.sample(both,2),...r.sample(onlyB,2)]);if(!c)return null;
 return {...c,prompt:`Which number is a factor of **${a}** but **not** a factor of **${b}**?`,
  explanation:explain(bullets(`Factors of ${a}: ${fa.join(', ')}`,`Factors of ${b}: ${fb.join(', ')}`,`${ans} divides ${a} exactly (${a} ÷ ${ans} = ${a/ans}) but not ${b}.`)),
  audit:{k:'which',prop:'factorNot',a,b}};
};
const fPrimeFactors:Template=r=>{
 const n=r.pick([24,30,36,40,42,48,60,66,70,72,84,90,126]),pf=primeFactors(n),ans=pf.join(' × ');
 const small=pf[0],w=[`${pf.slice(0,-2).concat(pf.at(-2)!*pf.at(-1)!).join(' × ')}`,`${pf.slice(1).join(' × ')}`,`${small} × ${n/small}`,`${pf.slice(0,-1).join(' × ')} × ${pf.at(-1)!+2}`];
 const o=words4(ans,w.filter(x=>x!==ans));if(!o)return null;
 return {...o,prompt:`Which shows **${n}** written as a product of prime factors?`,
  explanation:explain(bullets(...(()=>{let m=n;const out:string[]=[];for(const p of pf){out.push(`${m} ÷ ${p} = ${m/p}`);m/=p;}return out;})()),`So ${n} = ${ans}. Every factor must be prime, and they must multiply to ${n}.`),
  audit:{k:'primeFactors',n}};
};
const fPrimeRange:Template=r=>{
 const lo=r.pick([10,20,30,40,50,60,70,80]),hi=lo+r.pick([10,20]),ps=range(lo+1,hi-1).filter(isPrime),odd=range(lo+1,hi-1).filter(x=>x%2&&x%5&&!isPrime(x));
 if(r.chance(.5)){const c=choices(ps.length,[ps.length+odd.length,ps.length-1,ps.length+1]);if(!c)return null;
  return {...c,prompt:`How many prime numbers are there between ${lo} and ${hi}?`,
   explanation:explain(bullets(`The primes between ${lo} and ${hi} are ${list(ps.map(String))}.`,...(odd.length?[`${list(odd.map(String))} ${odd.length>1?'look':'looks'} prime but ${odd.length>1?'are':'is'} not: ${odd.map(x=>{const f=range(2,x).find(k=>x%k===0)!;return `${x} = ${f} × ${x/f}`;}).join(', ')}.`]:[]))),
   audit:{k:'primeCount',lo,hi}};}
 const s=sum(ps),c=choices(s,[s+(odd[0]??lo+1),s-ps[0],s-ps.at(-1)!+hi,s+hi]);if(!c||ps.length<2)return null;
 return {...c,prompt:`What is the **sum** of the prime numbers between ${lo} and ${hi}?`,rewardGroup:'challenge',
  explanation:explain(bullets(`The primes between ${lo} and ${hi} are ${list(ps.map(String))}.`,`${ps.join(' + ')} = ${s}`),odd.length?`${list(odd.map(String))} ${odd.length>1?'are':'is'} not prime.`:null),
  audit:{k:'primeSum',lo,hi}};
};

// ───────────────────────── Squares and cubes
const squares:Topic={id:'ma-squares-cubes',subject:'Maths',strand:'Calculation',title:'Square and cube numbers',helpsheet:{
 intro:'A square number is a number times itself: 6² = 6 × 6 = 36. A cube number is a number times itself three times: 4³ = 4 × 4 × 4 = 64.',
 steps:['Read the small number: ² means multiply two copies, ³ means multiply three copies.','Work it out in steps: 5³ = 5 × 5 × 5 = 25 × 5 = 125.','To find a square root, ask which number times itself makes it: √81 = 9 because 9 × 9 = 81.','In calculations, powers come before × and ÷ (BIDMAS).'],
 example:{title:'Why 16 is a square number',visual:{kind:'figure',w:130,h:130,alt:'Sixteen dots in a 4 by 4 square',marks:range(0,15).map(k=>({t:'circle' as const,x:20+(k%4)*30,y:20+Math.floor(k/4)*30,r:9,fill:'blue' as const,w:1.5}))},lines:['16 dots make a 4 by 4 square.','16 = 4 × 4 = 4²']},
 tips:['6² is 6 × 6 = 36, not 6 × 2 = 12.','Learn the squares to 15² = 225 and the cubes to 5³ = 125, plus 10³ = 1,000.','Some numbers are both square and cube: 1, 64 and 729.'],
}};
const sqPower:Template=r=>{
 const cube=r.chance(.5),n=cube?r.int(3,9):r.int(11,19),p=cube?3:2,ans=n**p;
 const c=choices(ans,[n*p,cube?n*n:n*n+n,n**(p+1)>99999?n*n*p:n**(p+1),n+p]);if(!c)return null;
 return {...c,prompt:'Work out the answer.',stimulus:`${n}${cube?'³':'²'}`,rewardGroup:'quick',
  explanation:explain(bullets(cube?`${n}³ = ${n} × ${n} × ${n}`:`${n}² = ${n} × ${n}`,cube?`${n} × ${n} = ${n*n}, then ${n*n} × ${n} = ${num(ans)}`:`${n} × ${n} = ${num(ans)}`),`If you chose ${n*p}, you multiplied by ${p} instead.`),
  audit:{k:'expr',e:`${n}^${p}`}};
};
const sqWhich:Template=(r,i)=>{
 const kind=i%3;
 if(kind===0){const ans=r.pick([4,5,6,7,8,9,10])**3,w=[ans+r.pick([1,-1])*r.int(3,9),r.pick([16,25,36,49,81,100,144]),r.int(4,12)*3,r.int(10,30)*9].filter(x=>!Number.isInteger(Math.round(Math.cbrt(x)))||Math.round(Math.cbrt(x))**3!==x);
  const c=choices(ans,w);if(!c)return null;const k=Math.round(Math.cbrt(ans));
  return {...c,prompt:'Which of these is a **cube** number?',rewardGroup:'quick',explanation:explain(bullets(`${num(ans)} = ${k} × ${k} × ${k} = ${k}³`),'A cube number is a whole number multiplied by itself three times. A number that is only a multiple of 3 is not a cube number.'),audit:{k:'which',prop:'cube'}};}
 if(kind===1){const ans=r.int(11,19)**2,w=[ans+r.pick([1,-1])*r.int(2,9),ans+10,r.int(11,19)*20,r.int(20,40)*2+1].filter(x=>!Number.isInteger(Math.sqrt(x)));
  const c=choices(ans,w);if(!c)return null;const k=Math.sqrt(ans);
  return {...c,prompt:'Which of these is a **square** number?',rewardGroup:'quick',explanation:explain(bullets(`${ans} = ${k} × ${k} = ${k}²`),'The others are not any whole number times itself.'),audit:{k:'which',prop:'square'}};}
 const c=choices(64,r.shuffle([16,27,36,100,125,81]));if(!c)return null;
 return {...c,prompt:'Which number is **both** a square number and a cube number?',rewardGroup:'standard',
  explanation:explain(bullets('64 = 8 × 8 = 8²','64 = 4 × 4 × 4 = 4³'),'The others are only one of the two:',bullets(...c.wrong.map(w=>{const x=Number(w),s=Math.round(Math.sqrt(x)),k=Math.round(Math.cbrt(x));return s*s===x?`${w} = ${s}² but is not a cube number.`:`${w} = ${k}³ but is not a square number.`;}))),audit:{k:'which',prop:'squareAndCube'}};
};
const sqExpr:Template=r=>{
 const form=r.int(0,2);let s:string,w:number[];
 if(form===0){const a=r.int(7,15),b=r.int(2,a-2);s=`${a}² − ${b}²`;w=[(a-b)**2,2*a-2*b,a*a-2*b];}
 else if(form===1){const a=r.int(2,5),b=r.int(2,9);s=`${a}³ + ${b}²`;w=[3*a+2*b,a*a+b*b,a**3+2*b];}
 else{const a=r.int(2,6),b=r.int(2,5);s=`${a}² × ${b}`;w=[(a*b)**2,2*a*b,a*b*2+a];}
 const ans=calc(s),c=choices(ans,w);if(!c)return null;
 const slip=[`If you chose ${num(w[0])}, you subtracted before squaring.`,`If you chose ${num(w[0])}, you multiplied by 3 and 2 instead of using powers.`,`If you chose ${num(w[0])}, you multiplied before squaring.`][form];
 return {...c,prompt:'Work out the answer.',stimulus:s,
  explanation:explain(bullets('Work out the powers first.',...s.split(/ [−+×] /).filter(x=>/[²³]/.test(x)).map(x=>`${x} = ${calc(x)}`),`${s} = ${num(ans)}`),c.wrong.includes(num(w[0]))?slip:null),
  audit:{k:'expr',e:js(s)}};
};
const sqCubePicture:Template=r=>{
 const n=r.int(2,4),cells:[number,number,number][]=[];for(let i=0;i<n;i++)for(let j=0;j<n;j++)for(let k=0;k<n;k++)cells.push([i,j,k]);
 const ans=n**3,visible=n**3-(n-1)**3,c=choices(ans,[n*n,6*n*n,visible,n*3]);if(!c)return null;
 return {...c,prompt:'This large cube is made of small cubes, with no gaps inside. How many small cubes are there altogether?',
  visual:cubes(cells,'A large cube built from small cubes',34),
  explanation:explain(bullets(`Each edge is ${n} small cubes long.`,`Each layer has ${n} × ${n} = ${n*n} cubes, and there are ${n} layers.`,`${n} × ${n} × ${n} = ${n}³ = ${ans}`),`If you chose ${visible}, you only counted the cubes you can see.`),
  audit:{k:'cubeCount',n}};
};
const sqRoot:Template=(r,i)=>{
 const s=r.int(6,15),A=s*s;
 if(i%2===0){const c=choices(s,[A/4,A/2,s+1,2*s].filter(x=>Number.isInteger(x)),x=>`${num(x)} m`);if(!c)return null;
  return {...c,prompt:`A square garden has an area of ${A} m². How long is each side?`,
   explanation:explain(bullets(`The area of a square is side × side.`,`Which number times itself makes ${A}? ${s} × ${s} = ${A}.`,`Each side is ${s} m.`),Number.isInteger(A/4)?`If you chose ${A/4} m, you divided by 4, which works for perimeter, not area.`:null),
   audit:{k:'expr',e:`sqrt(${A})`}};}
 const c=choices(s,[A/2,s*s*2,s-1,s+2]);if(!c)return null;
 return {...c,prompt:`What is the square root of **${A}**?`,rewardGroup:'quick',
  explanation:explain(bullets(`${s} × ${s} = ${A}, so √${A} = ${s}.`),`If you chose ${A/2}, you halved ${A}, but a square root is not half.`),
  audit:{k:'expr',e:`sqrt(${A})`}};
};
const sqNext:Template=r=>{
 const n=r.int(40,400);if(Number.isInteger(Math.sqrt(n)))return null;const k=Math.ceil(Math.sqrt(n)),ans=k*k;
 const c=choices(ans,[(k-1)**2,(k+1)**2,n+1,Math.ceil(n/10)*10]);if(!c)return null;
 return {...c,prompt:`What is the smallest square number that is **greater than ${n}**?`,
  explanation:explain(bullets(`${k-1}² = ${(k-1)**2}, which is less than ${n}.`,`${k}² = ${ans}, which is greater than ${n}.`),`So the answer is ${ans}.`),
  audit:{k:'nextSquare',n}};
};

export const calcTopics:BuiltTopic[]=[
 topicSet(mental,20,[mCompensate,mComplement,mCountOn,mDoubles,mDecimals]),
 topicSet(written,20,[wMissing,wAdd,wSub,wInverse,wTwoStep,wMissingNumber]),
 topicSet(multiplication,20,[mulLong,mulGrid,mulStory,mulTens,mulFact,mulMissingDigit]),
 topicSet(division,20,[divContext,divShort,divLong,divRemainder,divMissing,divRule]),
 topicSet(orderOps,20,[opsPlain,opsBrackets,opsWhereBrackets,opsStory,opsLargest,opsMissing]),
 topicSet(factors,20,[fPrime,fCount,fHcfLcm,fCommon,fPrimeFactors,fPrimeRange]),
 topicSet(squares,20,[sqPower,sqWhich,sqExpr,sqCubePicture,sqRoot,sqNext]),
];
