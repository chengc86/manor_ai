import {num,words,explain,bullets,NAMES,list,cap,type Topic,type BuiltTopic,type Rng} from './bank-kit';
import type {Visual,Mark} from './visual';
import {topicSet,choices,pick,words4,beside,count,fig,text,tidy,sum,range,roundTo,PLACE,fracChoices,fmix,type Template,type Q} from './bank-maths-util';
// Maths, Number strand: place value, ordering and comparing, rounding, negative numbers, Roman numerals, number lines.

const PV=['M','HTh','TTh','Th','H','T','O'];
const COLUMN=['millions','hundred thousands','ten thousands','thousands','hundreds','tens','ones'];
/** Column name for a power of ten: 1000 → "thousands". */
const colOf=(p:number)=>COLUMN[6-Math.round(Math.log10(p))];
const single=(s:string)=>s.replace(/s$/,'');
const degs=(x:number)=>`${num(x)} degree${Math.abs(x)===1?'':'s'}`;
const dig=(n:number,p:number)=>Math.floor(n/p)%10;
const blocksText=(th:number,h:number,t:number,o:number)=>list([th&&count(th,'thousand'),h&&count(h,'hundred'),t&&count(t,'ten'),o&&count(o,'one')].filter((s):s is string=>!!s));
/** Column addition with every carry forgotten: 478 + 256 → 624. */
export function addNoCarry(a:number,b:number){let out=0,p=1;while(a>0||b>0){out+=((a%10+b%10)%10)*p;a=Math.floor(a/10);b=Math.floor(b/10);p*=10;}return out;}
/** Column subtraction taking the smaller digit from the larger in every column: 7003 − 2458 → 5455. */
export function subSmallFromLarge(a:number,b:number){let out=0,p=1;while(a>0||b>0){out+=Math.abs(a%10-b%10)*p;a=Math.floor(a/10);b=Math.floor(b/10);p*=10;}return out;}

// ───────────────────────── Place value
const placeValue:Topic={id:'ma-place-value',subject:'Maths',strand:'Number',title:'Place value',helpsheet:{
 intro:'A digit\'s value depends on its column. Each column is worth ten times the column to its right.',
 steps:[
  'Write the number in a place value chart: millions (M), hundred thousands (HTh), ten thousands (TTh), thousands (Th), hundreds (H), tens (T) and ones (O).',
  'The value of a digit is the digit × its column. A 4 in the hundred thousands column is worth 400,000.',
  'To add 1,000, 10,000 or 100,000, change only that column\'s digit. If it goes past 9, exchange ten of them for one in the next column.',
  'Multiplying by 10, 100 or 1,000 moves every digit 1, 2 or 3 places to the left. Dividing moves them to the right.',
 ],
 example:{title:'The value of the 6 in 3,062,519',visual:{kind:'placeValue',columns:PV,rows:[['3','0','6','2','5','1','9']]},lines:['The 6 is in the ten thousands column.','Its value is 6 × 10,000 = 60,000.']},
 tips:['Zeros hold places: 3,062,519 has no hundred thousands.','Count columns from the ones column, not from the left.','A big digit can have a small value: in 1,000,009 the 9 is worth only 9.','Ten of any column exchange for one of the next column: 13 hundreds = 1 thousand and 3 hundreds.'],
}};
const pvPartWhole:Template=(r,i)=>{
 const three=i%2===0,th=r.int(1,2),h=r.int(0,4),t=r.int(1,4),o=r.int(0,6),A=th*1000+h*100+t*10+o;
 const B=three?r.int(1,2)*1000+r.int(0,9)*100+r.int(1,9)*10:0,M=r.int(1050,4950)+r.int(0,9),W=A+B+M;if(W>9999)return null;
 const swapped=th*1000+t*100+h*10+o,c=choices(M,[three?W-B:W+A,h!==t&&W-swapped-B,M+1000,M-100,M+10]);if(!c)return null;
 const pw:Visual={kind:'partWhole',whole:num(W),parts:three?['P',num(B),'?']:['P','?']};
 return {...c,
  prompt:`The part-whole model shows ${num(W)} split into ${three?'three':'two'} parts. Part **P** is made from base-10 blocks. What is the missing part?`,
  visual:beside([{v:{kind:'base10',thousands:th,hundreds:h,tens:t,ones:o},caption:'P'},{v:pw}],`Base-10 blocks labelled P, and a part-whole model with whole ${num(W)} and parts P${three?', '+num(B):''} and a question mark`),
  explanation:explain('Part P:',bullets(`The blocks show ${blocksText(th,h,t,o)}, so P = ${num(A)}.`),'Missing part:',bullets(`${num(W)} − ${num(A)}${three?' − '+num(B):''} = ${num(M)}`,`Check: ${num(A)}${three?' + '+num(B):''} + ${num(M)} = ${num(W)}`),three?`If you chose ${num(W-B)}, you forgot to take away part P.`:`If you chose ${num(W+A)}, you added part P instead of taking it away.`),
  audit:{k:'expr',e:three?`${W}-#${A}-${B}`:`${W}-#${A}`,base10:{thousands:th,hundreds:h,tens:t,ones:o},part:A}};
};
const pvAddPower:Template=(r,i)=>{
 const k=r.int(3,6),p=10**k,carry=k<6&&i%3===1,who=r.pick(NAMES);
 let start=r.int(1_020_000,8_890_000);start+=((carry?9:r.int(0,8))-dig(start,p))*p;
 if(carry&&dig(start,p*10)===9)return null;
 const ans=start+p,inWords=r.chance(.4),add=inWords?words(p):num(p),s=num(start),col=colOf(p);
 const stories=[
  `The Quest Shop's vault holds ${s} coins. After a busy week, the class adds another ${add} coins. How many coins are in the vault now?`,
  `${who}'s hero has ${s} experience points. Winning the next wave earns ${add} more. How many experience points does the hero have now?`,
  `A space probe has travelled ${s} km. Next month it travels another ${add} km. How far will it have travelled in total?`,
  `A castle museum has welcomed ${s} visitors since it opened. This year another ${add} people visit. How many visitors has it welcomed altogether?`,
 ];
 const c=choices(ans,[carry&&start-9*p,start+p/10,start+p*10,start+p/100]);if(!c)return null;
 return {...c,prompt:r.pick(stories),rewardGroup:carry?'standard':'quick',
  explanation:explain(`Adding ${num(p)} changes the **${col}** digit.`,bullets(carry?`${s} has 9 in the ${col} column. 9 + 1 = 10, so exchange ten ${col} for one ${single(colOf(p*10))}: the ${col} digit becomes 0 and the ${colOf(p*10)} digit goes up by 1.`:`${s} has ${dig(start,p)} in the ${col} column, and ${dig(start,p)} + 1 = ${dig(start,p)+1}.`,`${s} + ${num(p)} = ${num(ans)}`),carry?`If you chose ${num(start-9*p)}, you forgot to exchange.`:'The other options put the extra 1 in the wrong column.'),
  audit:{k:'expr',e:`${start}+${inWords?'#':''}${p}`}};
};
const pvDigit:Template=(r,i)=>{
 const ds=r.sample([1,2,3,4,5,6,7,8,9],7),n=Number(ds.join('')),val=(j:number)=>ds[j]*10**(6-j);
 if(i%2===0){
  const rank=r.pick([2,3]),nth=rank===2?'second':'third',ans=ds[rank-1],byDigit=[...ds].sort((a,b)=>b-a),big=byDigit[rank-1];
  const o=words4(String(ans),[String(big),String(byDigit[0]),String(ds[7-rank]),String(ds[0])]);if(!o)return null;
  return {...o,prompt:`Which digit represents the **${nth} largest value** in this number?`,stimulus:num(n),rewardGroup:'quick',
   explanation:explain('A digit is worth the digit × its column, so columns further left are worth more:',bullets(...[0,1,2,3].map(j=>`${ds[j]} is in the ${COLUMN[j]} column: worth ${num(val(j))}`)),`The ${nth} largest value is ${num(val(rank-1))}, so the digit is **${ans}**.`,ds.indexOf(big)>rank-1?`${big} is the ${nth} largest digit, but it is worth only ${num(val(ds.indexOf(big)))}.`:null),
   audit:{k:'digitRank',n,rank}};
 }
 const j=r.int(1,5),d=ds[j],v=val(j),c=choices(v,[d*10**(7-j),d*10**(5-j),d,d*10**(8-j)]);if(!c)return null;
 return {...c,prompt:`What is the value of the digit **${d}** in this number?`,stimulus:num(n),rewardGroup:'quick',
  explanation:explain(bullets(`The ${d} is in the **${COLUMN[j]}** column.`,`Its value is ${d} × ${num(10**(6-j))} = ${num(v)}.`),`Check by counting from the ones column: the ${d} is ${6-j} place${6-j===1?'':'s'} to the left of it.`),
  audit:{k:'digitValue',n,d}};
};
const pvMove:Template=(r,i)=>{
 const v=i%3;
 if(v===0){const k=r.int(2,4),c=choices(10**k,[k,10*k,10**(k+1),10**(k-1)]);if(!c)return null;
  return {...c,prompt:`In a place value chart, a digit moves **${k} places to the left**. What is its value multiplied by?`,rewardGroup:'quick',
   explanation:explain(bullets('Each place to the left multiplies the value of a digit by 10.',`${k} places: ${Array(k).fill('10').join(' × ')} = ${num(10**k)}`),`So its value is multiplied by ${num(10**k)}, not by ${k} or ${10*k}.`),
   audit:{k:'expr',e:`#10^${k}`}};}
 if(v===1){const k=r.int(2,3),p=10**k,o=words4(`It is divided by ${num(p)}`,[`It is multiplied by ${num(p)}`,`It is divided by ${k}`,`It is divided by ${num(10*k)}`,`It is divided by ${num(p/10)}`,`It is divided by ${num(p*10)}`]);if(!o)return null;
  return {...o,prompt:`A digit moves **${k} places to the right** in a place value chart. What happens to its value?`,rewardGroup:'quick',
   explanation:explain(bullets('Each place to the right divides the value of a digit by 10.',`${k} places: divide by ${Array(k).fill('10').join(' × ')} = ${num(p)}.`),`For example, the 7 in 700 moves ${k} places to the right and becomes ${num(700/p)}.`),
   audit:{k:'moveRight',places:k}};}
 const mul=r.chance(.5),k=r.int(1,3),p=10**k;
 const N=mul?r.int(2,9)*1000+r.int(0,9)*100+r.pick([0,r.int(1,9)])*10+r.int(1,9):r.int(1,9)*10000+r.int(0,9)*1000+r.int(0,9)*100+r.pick([0,r.int(1,9)])*10+r.int(1,9);
 const res=mul?N*p:N/p,ds=String(N).split(''),c=choices(res,mul?[N*p/10,N*p*10,N/p]:[N/p*10,N/p/10,N*p]);if(!c)return null;
 return {...c,prompt:`The number in the place value chart is **${mul?'multiplied':'divided'} by ${num(p)}**. What is the answer?`,
  visual:{kind:'placeValue',columns:PV.slice(7-ds.length),rows:[ds],alt:'A place value chart showing a number'},
  explanation:explain(bullets(`The chart shows ${num(N)}.`,`${mul?'Multiplying':'Dividing'} by ${num(p)} moves every digit ${k} place${k>1?'s':''} to the ${mul?'left':'right'}.`,`${num(N)} ${mul?'×':'÷'} ${num(p)} = ${num(res)}`),mul?'Empty columns on the right are filled with zeros.':'Digits that move past the ones column go after the decimal point.'),
  audit:{k:'expr',e:`#${N}${mul?'*':'/'}${p}`,pv:true}};
};
const pvWords:Template=(r,i)=>{
 const m=r.int(1,9),T=r.pick([r.int(1,99),r.int(1,9)*100+r.int(1,9),r.int(11,99)*10]),U=r.pick([r.int(1,99),r.int(1,9)*100,r.int(1,9)*100+r.int(1,9)]);
 if(T>=100&&U>=100)return null;
 const n=m*1e6+T*1000+U,wrong=[Number(`${m}${T}${U}`),T<100&&m*1e6+T*10000+U,U<100&&m*1e6+T*1000+U*10,m*1e7+T*1000+U];
 const zeros=String(n).split('').flatMap((d,j)=>d==='0'?[COLUMN[j]]:[]),parts=[m*1e6,T*1000,U].filter(x=>x>0);
 const how=explain('Write each part in digits:',bullets(...parts.map(x=>`${words(x)} → ${num(x)}`)),`${parts.map(x=>num(x)).join(' + ')} = ${num(n)}`,zeros.length?`Zeros hold the empty columns (${list(zeros)}).`:null,`Writing the parts side by side without the zeros gives ${num(Number(`${m}${T}${U}`))}, which is far too small.`);
 if(i%2===0){const c=choices(n,wrong);if(!c)return null;return {...c,prompt:'What is this number written in digits?',stimulus:words(n),explanation:how,audit:{k:'words'}};}
 const o=pick(n,wrong,words,x=>x);if(!o)return null;
 return {...o,prompt:'How is this number written in words?',stimulus:num(n),explanation:how,audit:{k:'words'}};
};
const pvCounters:Template=(r,i)=>{
 if(i%2===0){
  const col=r.pick([1,2]),a=r.int(1,4),b=col===1?r.int(10,12):r.int(1,6),c=col===2?r.int(10,12):r.int(0,6),d=r.int(0,6),n=a*1000+b*100+c*10+d;
  const groups=[{value:'1000',count:a},{value:'100',count:b},{value:'10',count:c},{value:'1',count:d}].filter(g=>g.count>0);
  const concat=Number(`${a}${b}${c}${d}`),big=col===1?b:c,unit=col===1?'hundred':'ten',next=col===1?'thousand':'hundred';
  const ch=choices(n,[concat,n-big*(col===1?100:10)+(big-10)*(col===1?100:10),col===1?n-900:n-90]);if(!ch)return null;
  return {...ch,prompt:'Which number do these place value counters show?',visual:{kind:'counters',groups,alt:'Rows of place value counters'},
   explanation:explain(bullets(...groups.map(g=>`${g.count} × ${num(Number(g.value))} = ${num(g.count*Number(g.value))}`)),`Total: ${groups.map(g=>num(g.count*Number(g.value))).join(' + ')} = ${num(n)}`,big===10?`Ten ${unit}s make one ${next}.`:`${cap(words(big))} ${unit}s make one ${next} and ${count(big-10,unit)}.`,`If you chose ${num(concat)}, you wrote the counts side by side.`),
   audit:{k:'counters'}};
 }
 const a=r.int(1,3),b=r.int(0,4),c=r.int(1,4),d=r.int(0,5),A=a*1000+b*100+c*10+d,B=r.int(1,5)*1000+r.int(1,9)*100+r.int(1,9)*10+r.int(1,9),W=A+B;if(W>9999)return null;
 const groups=[{value:'1000',count:a},{value:'100',count:b},{value:'10',count:c},{value:'1',count:d}].filter(g=>g.count>0);
 const ch=choices(W,[addNoCarry(A,B),b!==c&&a*1000+c*100+b*10+d+B,B-A,W+1000,W-100]);if(!ch)return null;
 return {...ch,prompt:'Part **P** is shown with place value counters. What is the whole?',
  visual:beside([{v:{kind:'counters',groups},caption:'P'},{v:{kind:'partWhole',whole:'?',parts:['P',num(B)]}}],`Place value counters labelled P, and a part-whole model with parts P and ${num(B)} and a question mark for the whole`),
  explanation:explain(bullets(`The counters show ${groups.map(g=>`${g.count} × ${num(Number(g.value))}`).join(', ')}, so P = ${num(A)}.`,`Whole = ${num(A)} + ${num(B)} = ${num(W)}`),addNoCarry(A,B)!==W?`If you chose ${num(addNoCarry(A,B))}, you forgot to carry.`:null),
  audit:{k:'expr',e:`#${A}+${B}`,counters:groups,part:A}};
};

// ───────────────────────── Ordering and comparing
const orderCompare:Topic={id:'ma-order-compare',subject:'Maths',strand:'Number',title:'Ordering and comparing numbers',helpsheet:{
 intro:'To compare whole numbers, first count the digits: more digits means a greater number. With the same number of digits, compare column by column from the left.',
 steps:['Write the numbers in digits and line them up by their ones column.','Compare the digits in the highest column. The larger digit wins.','If those digits are equal, move one column to the right and compare again.','Use < (less than), > (greater than) or = (equal to). The open side of the sign faces the greater number.'],
 example:{title:'Order 305,142; 350,142 and 305,241 from smallest',lines:['All three have 6 digits, and all start with 3 hundred thousands.','Ten thousands: 0, 5 and 0, so 350,142 is the greatest.','305,142 and 305,241 differ in the hundreds: 1 is less than 2.','Smallest to greatest: 305,142; 305,241; 350,142']},
 tips:['Change numbers written in words into digits first.','Watch the zeros: 40,506 is less than 45,006.','With counters or blocks, exchange ten of one kind for one of the next kind before you compare.','The same digits in a different order make a different number.'],
}};
type Clue={who:number;kind:'digit'|'max'|'min'|'gt'|'lt'|'between'|'above'|'odd'|'even';col?:number;d?:number;t?:number;a?:number;b?:number};
const COL5=['ones','tens','hundreds','thousands','ten thousands','hundred thousands'];
function clueHolds(c:Clue,nums:number[],as:number[]){const v=nums[as[c.who]];switch(c.kind){
 case 'digit':return dig(v,10**c.col!)===c.d;case 'max':return v===Math.max(...nums);case 'min':return v===Math.min(...nums);
 case 'gt':return v>c.t!;case 'lt':return v<c.t!;case 'between':return v<nums[as[c.a!]]&&v>nums[as[c.b!]];case 'above':return v>nums[as[c.a!]];
 case 'odd':return v%2===1;case 'even':return v%2===0;}}
function clueText(c:Clue,kids:string[]){const w=kids[c.who];switch(c.kind){
 case 'digit':return `${w}'s card has a ${c.d} in the ${COL5[c.col!]} column.`;case 'max':return `${w}'s card is the greatest of the four numbers.`;case 'min':return `${w}'s card is the smallest of the four numbers.`;
 case 'gt':return `${w}'s card is greater than ${num(c.t!)}.`;case 'lt':return `${w}'s card is less than ${num(c.t!)}.`;
 case 'between':return `${w}'s card is less than ${kids[c.a!]}'s card but greater than ${kids[c.b!]}'s card.`;case 'above':return `${w}'s card is greater than ${kids[c.a!]}'s card.`;
 case 'odd':return `${w}'s card is an odd number.`;case 'even':return `${w}'s card is an even number.`;}}
/** Every way of giving three children different cards (of four) that fits all the clues. */
function cardSolutions(nums:number[],clues:Clue[]){const out:number[][]=[];for(let a=0;a<4;a++)for(let b=0;b<4;b++)for(let c=0;c<4;c++){if(a===b||b===c||a===c)continue;const as=[a,b,c];if(clues.every(cl=>clueHolds(cl,nums,as)))out.push(as);}return out;}
/** A round number strictly between lo and hi, if there is one. */
function roundBetween(lo:number,hi:number){for(const p of [10000,1000,100,10,1]){const t=(Math.floor(lo/p)+1)*p;if(t<hi)return t;}return null;}
const ocCards:Template=(r,i)=>{
 const ds=r.sample(range(0,9),5);if(ds[0]===0)return null;
 const set=new Set([Number(ds.join(''))]);for(let g=0;g<60&&set.size<4;g++){const p=[...ds],x=r.int(0,4),y=r.int(0,4);if(x===y)continue;[p[x],p[y]]=[p[y],p[x]];if(p[0]!==0)set.add(Number(p.join('')));}
 if(set.size<4)return null;
 const nums=r.shuffle([...set]),kids=r.sample(NAMES,3),as=r.sample([0,1,2,3],3),val=(k:number)=>nums[as[k]],sorted=[...nums].sort((a,b)=>a-b);
 const col=r.int(0,4),clues:Clue[]=[{who:0,kind:'digit',col,d:dig(val(0),10**col)}];
 const v1=val(1),pos=sorted.indexOf(v1);
 if(pos===3&&r.chance(.7))clues.push({who:1,kind:'max'});else if(pos===0&&r.chance(.7))clues.push({who:1,kind:'min'});
 else{const up=r.chance(.5)&&pos>0;if(up){const t=roundBetween(sorted[pos-1],v1);if(t===null)return null;clues.push({who:1,kind:'gt',t});}else if(pos<3){const t=roundBetween(v1,sorted[pos+1]);if(t===null)return null;clues.push({who:1,kind:'lt',t:t===v1?t+1:t});}else return null;}
 const v2=val(2),hiK=val(0)>val(1)?0:1,loK=1-hiK;
 if(v2<val(hiK)&&v2>val(loK))clues.push({who:2,kind:'between',a:hiK,b:loK});
 else if(v2>val(0)&&r.chance(.5))clues.push({who:2,kind:'above',a:0});else if(v2>val(1))clues.push({who:2,kind:'above',a:1});
 else clues.push({who:2,kind:v2%2?'odd':'even'});
 const sol=cardSolutions(nums,clues);if(sol.length!==1)return null;
 const left=[0,1,2,3].find(k=>!as.includes(k))!,inWords=new Set(r.sample([0,1,2,3],2)),asCards=i%4!==3;
 const name=(k:number)=>asCards?`Card ${k+1} (${num(nums[k])})`:num(nums[k]);
 const fits=(c:Clue)=>[0,1,2,3].filter(k=>clueHolds({...c,who:0},nums,[k,...as.slice(1)]));
 const lines=clues.map(c=>['digit','max','min','gt','lt','odd','even'].includes(c.kind)?`${kids[c.who]}: ${list(fits(c).map(name))} ${fits(c).length===1?'fits':'fit'} this clue.`:`${kids[c.who]}: ${clueText(c,kids).replace(kids[c.who]+"'s card",'the card')}`);
 const how=explain('Work through the clues:',bullets(...lines),`Only one way fits every clue: ${list(as.map((k,j)=>`${kids[j]} has ${name(k)}`))}.`,`In order: ${sorted.map(x=>num(x)).join(' < ')}`,`So ${name(left)} is left over.`);
 const story=`${list(kids)} each take one card. ${clues.map(c=>clueText(c,kids)).join(' ')}`;
 if(asCards)return {prompt:`${story} Which card is left over?`,answer:`Card ${left+1}`,wrong:[0,1,2,3].filter(k=>k!==left).map(k=>`Card ${k+1}`),order:'sorted',rewardGroup:'challenge',
  visual:{kind:'cards',cards:nums.map((n,k)=>({text:inWords.has(k)?words(n):num(n),caption:`Card ${k+1}`})),alt:'Four number cards, some written in words, labelled Card 1 to Card 4'},
  explanation:how,audit:{k:'cards',nums,clues,left}};
 return {prompt:`Four number cards show the numbers below. ${story.replace(' each take one card.',' each take one of them.')} Which number is left over?`,answer:num(nums[left]),wrong:[0,1,2,3].filter(k=>k!==left).map(k=>num(nums[k])),rewardGroup:'challenge',explanation:how,audit:{k:'cards',nums,clues,left}};
};
const ocPictures:Template=(r,i)=>{
 const kind=i%3,th=r.int(1,2),h=r.int(0,3),t=r.int(0,3),o=r.int(1,5),L=th*1000+h*100+t*10+o;
 let g:{value:string;count:number}[];
 if(kind===0){const p=r.shuffle([th,h,t,o]);if(p[0]===0||p.join()===[th,h,t,o].join())return null;g=[{value:'1000',count:p[0]},{value:'100',count:p[1]},{value:'10',count:p[2]},{value:'1',count:p[3]}];}
 else if(kind===1)g=[{value:'1000',count:th-1},{value:'100',count:h+10},{value:'10',count:t},{value:'1',count:o}];
 else{const dd=r.pick([-1,1]);g=[{value:'1000',count:th-1},{value:'100',count:h+10},{value:'10',count:t},{value:'1',count:o+dd}];}
 g=g.filter(x=>x.count>0);const R=sum(g.map(x=>x.count*Number(x.value)));
 const blocks:Visual={kind:'base10',thousands:th,hundreds:h,tens:t,ones:o},counters:Visual={kind:'counters',groups:g},blocksLeft=r.chance(.5);
 const v:Visual={kind:'compare',left:blocksLeft?blocks:counters,right:blocksLeft?counters:blocks,alt:'Base-10 blocks and place value counters with a box between them'};
 const lv=blocksLeft?L:R,rv=blocksLeft?R:L,ans=lv<rv?'<':lv>rv?'>':'=',bText=`Blocks: ${blocksText(th,h,t,o)} = ${num(L)}.`,cText=`Counters: ${g.map(x=>count(x.count,single(colOf(Number(x.value))))).join(', ')} = ${num(R)}.`;
 return {prompt:'Which sign goes in the box?',answer:ans,wrong:['<','=','>'].filter(s=>s!==ans),order:'sorted',rewardGroup:kind===0?'quick':'standard',visual:v,
  explanation:explain(bullets(...(blocksLeft?[bText,cText]:[cText,bText])),kind>0?`${cap(words(h+10))} hundreds make one thousand${h?` and ${count(h,'hundred')}`:''}, so exchange before comparing.`:null,`${num(lv)} ${ans} ${num(rv)}`),
  audit:{k:'compare'}};
};
const ocOrder:Template=(r,i)=>{
 const ds=r.sample(range(0,9),6);if(ds[0]===0)return null;
 const set=new Set([Number(ds.join(''))]);for(let g=0;g<60&&set.size<5;g++){const p=[...ds],x=r.int(0,5),y=r.int(0,5);if(x===y)continue;[p[x],p[y]]=[p[y],p[x]];if(p[0]!==0)set.add(Number(p.join('')));}
 if(set.size<5)return null;
 const nums=r.shuffle([...set]);
 if(i%2===0){
  const desc=r.chance(.5),pos=r.pick([2,4]),sorted=[...nums].sort((a,b)=>desc?b-a:a-b),ans=sorted[pos-1];
  const c=choices(ans,[sorted[5-pos],sorted[pos],sorted[pos-2]]);if(!c)return null;
  return {...c,prompt:`Put these numbers in order from **${desc?'greatest to smallest':'smallest to greatest'}**. Which number is **${pos===2?'second':'fourth'}**?`,stimulus:nums.map(x=>num(x)).join(';  '),
   explanation:explain(bullets('All the numbers have 6 digits, so compare from the hundred thousands column.',`In order: ${sorted.map(x=>num(x)).join('; ')}`),`The ${pos===2?'second':'fourth'} number is ${num(ans)}. ${num(sorted[5-pos])} is ${pos===2?'second':'fourth'} if you order them the other way.`),
   audit:{k:'orderPos',nums,desc,pos}};
 }
 const four=nums.slice(0,4),asc=[...four].sort((a,b)=>a-b),fmt=(xs:number[])=>xs.map(x=>num(x)).join('; ');
 const swap=(xs:number[],k:number)=>{const y=[...xs];[y[k],y[k+1]]=[y[k+1],y[k]];return y;};
 const byLast=[...four].sort((a,b)=>a%1000-b%1000||a-b);
 const o=words4(fmt(asc),[fmt([...asc].reverse()),fmt(swap(asc,r.int(0,2))),fmt(byLast),fmt(swap(asc,0))]);if(!o)return null;
 return {...o,prompt:'Which list is in order from **smallest to greatest**?',
  explanation:explain(bullets('Compare the hundred thousands digits first, then the ten thousands, and so on.',`Smallest to greatest: ${fmt(asc)}`),'Check each neighbouring pair: every number must be less than the one after it.'),
  audit:{k:'sortedList',dir:'asc'}};
};
const ocBetween:Template=r=>{
 const lo=r.int(1_020_000,8_800_000),gap=r.pick([4000,15000,40000,90000]),hi=Math.ceil((lo+gap)/1000)*1000,ans=r.int(lo+1,hi-1);
 const s=String(ans),sw=(a:number,b:number)=>{const x=s.split('');[x[a],x[b]]=[x[b],x[a]];return Number(x.join(''));};
 const out=(x:number)=>x<=lo||x>=hi;
 const cands=[lo-r.int(1,9)*(r.chance(.5)?10:100),hi+r.int(1,9)*(r.chance(.5)?10:100),sw(1,2),sw(2,3),Number(s.slice(0,2)+s.slice(3)),hi+r.int(1,9)*1000].filter(x=>out(x)&&x>0);
 const c=choices(ans,cands);if(!c)return null;
 return {...c,prompt:'Which number could go in the box?',stimulus:`${num(lo)} < ☐ < ${num(hi)}`,
  explanation:explain(bullets(`The number must be greater than ${num(lo)} and less than ${num(hi)}.`,`${num(ans)} is greater than ${num(lo)} and less than ${num(hi)}.`),'Compare column by column from the left to rule out the others. A number with fewer digits is smaller.'),
  audit:{k:'between',lo,hi}};
};
function perms(xs:number[]):number[][]{if(xs.length<=1)return [xs];return xs.flatMap((x,i)=>perms([...xs.slice(0,i),...xs.slice(i+1)]).map(p=>[x,...p]));}
const ocDigitCards:Template=(r,i)=>{
 const ds=r.sample(range(0,9),5),kinds=['greatest even','smallest odd','greatest odd','smallest even'] as const,want=kinds[i%4],big=want.startsWith('greatest'),even=want.endsWith('even');
 const all=perms(ds).filter(p=>p[0]!==0).map(p=>Number(p.join(''))),ok=all.filter(n=>n%2===(even?0:1)).sort((a,b)=>big?b-a:a-b);if(ok.length<2)return null;
 const ans=ok[0],any=[...all].sort((a,b)=>big?b-a:a-b)[0],lead0=ds.includes(0)&&!big?Number([...ds].sort((a,b)=>a-b).join('')):null;
 const c=choices(ans,[any,ok[1],lead0,ok[2]]);if(!c)return null;
 const ends=[...new Set(ds.filter(d=>d%2===(even?0:1)))].sort((a,b)=>a-b),bestEnding=(d:number)=>ok.find(n=>n%10===d)!;
 return {...c,prompt:`Use each digit card once to make a five-digit number. What is the **${want}** number you can make?`,rewardGroup:'standard',
  visual:{kind:'cards',cards:ds.map(d=>({text:String(d)})),alt:'Five digit cards'},
  explanation:explain(bullets(`An ${even?'even':'odd'} number ends in ${even?'an even':'an odd'} digit: here ${list(ends.map(String),'or')}.`,`For the ${big?'greatest':'smallest'} number, put the ${big?'largest':'smallest'} digits in the highest columns${big?'':' (but a number cannot start with 0)'}.`,...ends.map(d=>`Ending in ${d}: the ${big?'greatest':'smallest'} is ${num(bestEnding(d))}.`)),`So the ${want} number is ${num(ans)}.`),
  audit:{k:'digitCards',digits:ds,want}};
};

// ───────────────────────── Rounding
const rounding:Topic={id:'ma-rounding',subject:'Maths',strand:'Number',title:'Rounding and estimating',helpsheet:{
 intro:'Rounding gives a simpler number that is close to the real one. Look at the digit just to the right of the place you are rounding to.',
 steps:['Find the column you are rounding to and underline its digit.','Look at the next digit to the right. If it is 5 or more, round up; if it is 4 or less, round down.','Every digit after the rounding column becomes 0 (or is dropped after a decimal point).','In a word problem, work out the exact answer first, then round it.'],
 example:{title:'Round 3,648 + 1,275 to the nearest hundred',lines:['Add first: 3,648 + 1,275 = 4,923.','The tens digit is 2, which is less than 5, so round down.','4,923 → 4,900']},
 tips:['Rounding each number before adding can give a different answer, so add first unless you are asked to estimate.','Money is usually given to 2 decimal places (the nearest penny): £4.8333… → £4.83.','Numbers exactly halfway, like 4,950 to the nearest hundred, round up to 5,000.'],
}};
const roundAdd:Template=r=>{
 const p=r.pick([10,100,100,1000]),lo=p*10,a=r.int(lo,lo*10-1),b=r.int(lo,lo*10-1),s=a+b,ans=roundTo(s,p),[who]=r.sample(NAMES,1);
 const name=PLACE[p],nd=dig(s,p/10),stories=[
  `${who} walks ${num(a)} steps before lunch and ${num(b)} steps after lunch. How many steps is that altogether, rounded to the **nearest ${name}**?`,
  `The heroes defeat ${num(a)} monsters in the first wave and ${num(b)} in the second wave. What is the total, rounded to the **nearest ${name}**?`,
  `The manor library lends ${num(a)} books in the autumn term and ${num(b)} books in the spring term. What is the total, rounded to the **nearest ${name}**?`,
  `Two schools collect ${num(a)} and ${num(b)} bottle tops for recycling. How many do they collect altogether, to the **nearest ${name}**?`];
 const each=roundTo(a,p)+roundTo(b,p),c=choices(ans,[each,Math.floor(s/p)*p,Math.floor(s/p)*p+p,roundTo(s,p*10),roundTo(s,p/10),s]);if(!c)return null;
 return {...c,prompt:r.pick(stories),
  explanation:explain(bullets(`Add first: ${num(a)} + ${num(b)} = ${num(s)}.`,`The ${{1:'ones',10:'tens',100:'hundreds'}[p/10]} digit is ${nd}, so round ${nd>=5?'up':'down'}.`,`${num(s)} → ${num(ans)}`),each!==ans?`Rounding each number first gives ${num(each)}, which is not the same.`:null),
  audit:{k:'expr',e:`round(${a}+${b},#${p})`}};
};
const roundLengths:Template=r=>{
 const n=r.pick([2,3]),parts=Array.from({length:n},()=>[r.int(4,38),r.int(1,9)] as [number,number]),mm=sum(parts.map(([c,m])=>c*10+m));if(mm%10===5||mm%10===0)return null;
 const ans=roundTo(mm/10,1),each=sum(parts.map(([c,m])=>roundTo(c+m/10,1))),drop=sum(parts.map(([c])=>c)),who=r.pick(NAMES);
 const c=choices(ans,[each,drop,mm/10,mm,ans+1,ans-1],x=>`${num(x)} cm`);if(!c)return null;
 const L=parts.map(([c,m])=>`${c} cm ${m} mm`),things=r.pick(['ribbons','sticks','paper strips','pieces of string']);
 const mmSum=sum(parts.map(p=>p[1])),cmSum=drop;
 return {...c,prompt:`${who} lays ${words(n)} ${things} end to end. They measure ${list(L)}. What is the total length, **to the nearest centimetre**?`,
  explanation:explain(bullets(`Add the millimetres: ${parts.map(p=>p[1]+' mm').join(' + ')} = ${mmSum} mm${mmSum>=10?` = ${Math.floor(mmSum/10)} cm ${mmSum%10} mm`:''}.`,`Add the centimetres: ${parts.map(p=>p[0]).join(' + ')} = ${cmSum} cm.`,`Total: ${Math.floor(mm/10)} cm ${mm%10} mm.`,`${mm%10} mm is ${mm%10>=5?'5 mm or more, so round up':'less than 5 mm, so round down'}: ${num(ans)} cm.`),'10 mm = 1 cm, so check the millimetres before you round.'),
  audit:{k:'expr',e:`round((${parts.map(([c,m])=>`${c}*#10+${m}`).join('+')})/#10,#1)`}};
};
const roundProduct:Template=r=>{
 const m=r.int(12,49),per=r.int(12,48),s=m*per,ans=roundTo(s,100);if(s<200)return null;
 const [what,unit]=r.pick([['boxes of pencils','pencils'],['packs of stickers','stickers'],['rows of chairs','chairs'],['trays of buns','buns'],['bags of marbles','marbles']] as const);
 const c=choices(ans,[roundTo(m,10)*roundTo(per,10),roundTo(s,1000),roundTo(s,10),s,Math.floor(s/100)*100===ans?ans+100:ans-100].filter(x=>x>0));if(!c)return null;
 return {...c,prompt:`A school buys ${m} ${what}. There are ${per} ${unit} in each. How many ${unit} is that, rounded to the **nearest hundred**?`,
  explanation:explain(bullets(`${m} × ${per} = ${num(s)}`,`The tens digit is ${dig(s,10)}, so round ${dig(s,10)>=5?'up':'down'}: ${num(s)} → ${num(ans)}.`),roundTo(m,10)*roundTo(per,10)!==ans?`Rounding ${m} and ${per} first gives ${num(roundTo(m,10))} × ${num(roundTo(per,10))} = ${num(roundTo(m,10)*roundTo(per,10))}, which is only an estimate.`:null),
  audit:{k:'expr',e:`round(${m}*${per},#100)`}};
};
const roundMoney:Template=r=>{
 const who=r.pick(NAMES),s=r.pick([
  ()=>{const n=r.pick([3,6,7,9]),T=r.pick([10,20,25,50]);return {T,n,group:'friends',one:'friend'};},
  ()=>{const n=r.pick([6,12]),T=r.pick([2.99,3.49,4.75,5.99]);return {T,n,group:'',one:''};},
  ()=>{const n=r.pick([7,9,11]),T=r.pick([15,30,40]);return {T,n,group:`${who} and some classmates, ${n} people in total,`,one:'person'};},
  ()=>{const n=r.pick([3,7]),T=r.pick([8.5,12.5,14.2]);return {T,n,group:'heroes',one:'hero'};},
 ])(),exact=s.T/s.n;
 if(Number.isInteger(tidy(exact*100)))return null;
 const ans=roundTo(exact,0.01),t3=exact.toFixed(3),t1=roundTo(exact,0.1),down=ans<exact,money=`£${Number.isInteger(s.T)?s.T:s.T.toFixed(2)}`;
 // The story must agree with the rounding, so nobody can argue for the other penny: rounding down fits sharing out money
 // (each gets a little less, and a penny or two is left over); rounding up fits paying a cost (together they cover all of it).
 const who2=s.group.includes(' people in total,')?s.group:`${cap(words(s.n))} ${s.group}`;
 const text=!s.one?`A pack of ${s.n} buns costs £${s.T.toFixed(2)}. How much does one bun cost, to an appropriate degree of accuracy?`
  :down?`${who2} share ${money} of prize money equally. How much does each ${s.one} get, to an appropriate degree of accuracy?`
  :`${who2} split the ${money} cost of a present equally. How much does each ${s.one} pay, to an appropriate degree of accuracy?`;
 const o=pick<[string,number]>([`£${ans.toFixed(2)}`,ans],[[`£${t1}`,t1],[`£${t3}`,Number(t3)],[`£${(Math.floor(tidy(exact*100))/100).toFixed(2)}`,Math.floor(tidy(exact*100))/100],[`£${(ans+0.01).toFixed(2)}`,tidy(ans+0.01)],roundTo(exact,1)>0&&[`£${roundTo(exact,1)}`,roundTo(exact,1)]],x=>x[0],x=>x[1]);if(!o)return null;
 return {...o,prompt:text,
  explanation:explain(bullets(`${money} ÷ ${s.n} = £${exact.toFixed(4)}…`,'Money is written to 2 decimal places, the nearest penny.',`The third decimal digit is ${dig(Math.floor(tidy(exact*1000)),1)}, so round ${dig(Math.floor(tidy(exact*1000)),1)>=5?'up':'down'}: £${ans.toFixed(2)}.`),!s.one?'An answer with 1 or 3 decimal places is not a sensible amount of money.':down?`Each gets £${ans.toFixed(2)}, and a penny or two is left over.`:`Paying £${ans.toFixed(2)} each covers the whole cost.`),
  audit:{k:'expr',e:`round(${s.T}/${s.n},#0.01)`}};
};
const roundPlace:Template=r=>{
 const n=r.int(1_000_000,9_999_999),p=r.pick([1000,10000,100000,1000000]),ans=roundTo(n,p);if(dig(n,p/10)===5&&n%(p/10)===0)return null;
 const c=choices(ans,[ans===Math.floor(n/p)*p?ans+p:ans-p,ans+n%p,roundTo(n,p*10),roundTo(n,p/10)]);if(!c)return null;
 return {...c,prompt:`Round this number to the **nearest ${PLACE[p]}**.`,stimulus:num(n),rewardGroup:'quick',
  explanation:explain(bullets(`The ${PLACE[p]}s digit is ${dig(n,p)}.`,`The next digit to the right is ${dig(n,p/10)}, so round ${dig(n,p/10)>=5?'up':'down'}.`,`${num(n)} → ${num(ans)}`),'Every digit after the rounding column becomes 0.'),
  audit:{k:'expr',e:`round(${n},#${p})`}};
};
const roundReverse:Template=(r,i)=>{
 const p=i%2===0?r.pick([100,1000,10000]):r.pick([100,1000]),T=r.int(12,98)*p,lo=T-p/2,hi=T+p/2;
 if(i%2===0){
  const ans=r.int(lo,hi-1),c=choices(ans,[lo-r.int(1,Math.min(90,p/2-1)),hi+r.int(0,Math.min(90,p/2-1)),hi,T+p-r.int(1,p/10),T-p+r.int(0,p/10)].filter(x=>x<lo||x>=hi));if(!c)return null;
  return {...c,prompt:`A number rounded to the nearest ${PLACE[p]} is ${num(T)}. Which of these could be the number?`,
   explanation:explain(bullets(`Numbers from ${num(lo)} up to ${num(hi-1)} round to ${num(T)}.`,`${num(ans)} is in that range.`),`${num(hi)} is exactly halfway, so it rounds up to ${num(T+p)}.`),
   audit:{k:'roundsTo',t:T,p}};
 }
 const small=r.chance(.5),ans=small?lo:hi-1,c=choices(ans,small?[lo-1,T-p,lo+1,hi-1]:[hi,T+p,hi-2,lo]);if(!c)return null;
 return {...c,prompt:`The number of people at a match is ${num(T)}, rounded to the nearest ${PLACE[p]}. What is the **${small?'smallest':'largest'}** number of people there could be?`,rewardGroup:'challenge',
  explanation:explain(bullets(`Halfway between ${num(T-p)} and ${num(T)} is ${num(lo)}, which rounds up to ${num(T)}.`,`Halfway between ${num(T)} and ${num(T+p)} is ${num(hi)}, which rounds up to ${num(T+p)}.`,`So the number is from ${num(lo)} to ${num(hi-1)}.`),`The ${small?'smallest':'largest'} is ${num(ans)}.`),
  audit:{k:'expr',e:small?`${T}-#${p/2}`:`${T}+#${p/2}-#1`}};
};

// ───────────────────────── Negative numbers
const negatives:Topic={id:'ma-negative-numbers',subject:'Maths',strand:'Number',title:'Negative numbers',helpsheet:{
 intro:'Negative numbers are less than zero. On a number line they are to the left of 0, and on a thermometer they are below 0.',
 steps:['Draw or imagine a number line through zero.','Adding a positive number moves right (up); subtracting it moves left (down).','To find the difference between a negative and a positive number, count to zero, then count on from zero, and add the two parts.','Subtracting a negative number is the same as adding: 5 − (−3) = 5 + 3.'],
 example:{title:'The difference between −6°C and 4°C',visual:{kind:'numberLine',ticks:11,labels:{0:'−6',2:'−4',4:'−2',6:'0',8:'2',10:'4'}},lines:['From −6 to 0 is 6 degrees.','From 0 to 4 is 4 degrees.','Difference: 6 + 4 = 10 degrees.']},
 tips:['−8 is less than −3, even though 8 is more than 3.','A fall in temperature means subtract; a rise means add.','Check the sign of your answer: is it below zero or above?'],
}};
/** A thermometer from lo to hi °C (labels every 5), filled to v. The liquid is a red rect; labels are numeric text marks. */
function thermometer(lo:number,hi:number,v:number,alt:string):Visual{
 const u=10,top=26,H=(hi-lo)*u,x=58,y=(t:number)=>top+(hi-t)*u,m:Mark[]=[];
 m.push({t:'rect',x:x-8,y:top-14,w:16,h:H+28,r:8,fill:'white',sw:2},{t:'circle',x,y:top+H+28,r:15,fill:'red',w:2},{t:'rect',x:x-4.5,y:y(v),w:9,h:top+H+16-y(v),fill:'red',sw:0});
 for(let t=lo;t<=hi;t++){const big=t%5===0;m.push({t:'line',x1:x+10,y1:y(t),x2:x+(big?24:17),y2:y(t),w:big?1.8:1});if(big)m.push(text(x+30,y(t)+5,num(t),13,{anchor:'start'}));}
 m.push(text(x+30,top-10,'°C',13,{anchor:'start',bold:true}));
 return fig(x+74,top+H+50,m,alt);
}
const negCalc:Template=r=>{
 const a=r.int(2,15),b=r.int(2,15),form=r.int(0,4);let e:string,ans:number,w:number[];
 switch(form){
  case 0:e=`${num(-a)} − ${b}`;ans=-a-b;w=[-a+b,a+b,a-b];break;
  case 1:e=`${num(-a)} + ${b}`;ans=-a+b;w=[-a-b,a+b,a-b];break;
  case 2:{const x=r.int(2,9),y=x+r.int(2,12);e=`${x} − ${y}`;ans=x-y;w=[y-x,-(x+y),x+y];break;}
  case 3:e=`${a} − (${num(-b)})`;ans=a+b;w=[a-b,-(a+b),b-a];break;
  default:e=`${num(-a)} − (${num(-b)})`;ans=b-a;w=[-a-b,a-b,a+b];if(a===b)return null;
 }
 const c=choices(ans,w);if(!c)return null;
 const how=[
  [`Start at ${num(-a)} and count ${b} to the left.`,`${num(-a)} − ${b} = ${num(ans)}`],
  [`Start at ${num(-a)} and count ${b} to the right${b>a?', past zero':''}.`,`${num(-a)} + ${b} = ${num(ans)}`],
  [`Count down from ${e.split(' ')[0]} to 0, then keep going.`,`${e} = ${num(ans)}`],
  [`Subtracting a negative is the same as adding: ${a} − (${num(-b)}) = ${a} + ${b}.`,`${a} + ${b} = ${num(ans)}`],
  [`Subtracting a negative is the same as adding: ${num(-a)} − (${num(-b)}) = ${num(-a)} + ${b}.`,`${num(-a)} + ${b} = ${num(ans)}`]][form];
 return {...c,prompt:'Work out the answer.',stimulus:e,rewardGroup:form>=3?'standard':'quick',explanation:explain(bullets(...how),'Check the sign: is the answer below zero or above it?'),
  audit:{k:'expr',e:e.replace(/−/g,'-').replace(/ /g,'')}};
};
const negTemp:Template=(r,i)=>{
 const v=i%3;
 if(v===0){const t0=r.int(-9,-1),rise=r.int(Math.abs(t0)+1,Math.abs(t0)+9),ans=t0+rise;
  const c=choices(ans,[t0-rise,-(ans),Math.abs(t0)+rise,ans-1],x=>`${num(x)}°C`);if(!c)return null;
  return {...c,prompt:`The thermometer shows the temperature at midnight. By midday, the temperature has risen by ${rise} degrees. What is the temperature at midday?`,
   visual:thermometer(-10,10,t0,'A thermometer marked from −10°C to 10°C'),
   explanation:explain(bullets(`The thermometer shows ${num(t0)}°C.`,`Rising ${Math.abs(t0)} degrees takes it to 0°C; ${rise-Math.abs(t0)} more degrees takes it to ${num(ans)}°C.`,`${num(t0)} + ${rise} = ${num(ans)}`),'Each small mark is 1 degree.'),
   audit:{k:'expr',e:`#${t0}+${rise}`,thermo:t0}};}
 if(v===1){const [place,t0]=r.pick([['a freezer',-r.int(15,22)],['a cold store',-r.int(5,12)],['an ice rink',-r.int(2,8)]] as const),room=r.int(12,24),ans=room-t0;
  const c=choices(ans,[room+t0>0&&room+t0,room,ans-1,ans+1],degs);if(!c)return null;
  return {...c,prompt:`The temperature inside ${place} is ${num(t0)}°C. The kitchen is ${room}°C. What is the difference between the two temperatures?`,
   explanation:explain(bullets(`From ${num(t0)}°C up to 0°C is ${-t0} degrees.`,`From 0°C up to ${room}°C is ${room} degrees.`,`Difference: ${-t0} + ${room} = ${ans} degrees.`),room+t0>0?`If you chose ${degs(room+t0)}, you took ${-t0} away instead of counting across zero.`:null),
   audit:{k:'expr',e:`${room}-(${t0})`}};}
 const start=r.int(1,8),drop=r.int(2,4),hours=r.int(3,6),end=start-drop*hours;
 const c=choices(hours,[hours+1,hours-1,Math.round((start+Math.abs(end))/drop)+1,Math.abs(end)],x=>`${num(x)} hours`);if(!c)return null;
 return {...c,prompt:`At 6 pm the temperature is ${start}°C. It falls by ${drop} degrees every hour. After how many hours is the temperature ${num(end)}°C?`,rewardGroup:'challenge',
  explanation:explain(bullets(`From ${start}°C down to ${num(end)}°C is a fall of ${start} + ${-end} = ${start-end} degrees.`,`${start-end} ÷ ${drop} = ${hours} hours`),`Check: ${range(0,hours).map(h=>num(start-drop*h)).join(', ')}.`),
  audit:{k:'expr',e:`(${start}-(${end}))/${drop}`}};
};
const negContext:Template=(r,i)=>{
 const v=i%3;
 if(v===0){const f0=-r.int(1,3),up=r.int(4,9),down=r.int(2,7),ans=f0+up-down;
  const c=choices(ans,[f0-up+down,-f0+up-down,f0+up+down,ans+1],x=>num(x));if(!c)return null;
  return {...c,prompt:`The manor's lift goes from the cellars (floors −1, −2 and −3), past the ground floor (floor 0), to the top of the tower. It starts on floor ${num(f0)}, goes up ${up} floors and then down ${down} floors. Which floor is it on now?`,
   explanation:explain(bullets(`${num(f0)} + ${up} = ${num(f0+up)}`,`${num(f0+up)} − ${down} = ${num(ans)}`),'Going up means add; going down means subtract.'),
   audit:{k:'expr',e:`${f0}+${up}-${down}`}};}
 if(v===1){const d0=-r.int(8,20),up=r.int(3,7),ans=d0+up,down2=r.int(4,9),final=ans-down2;if(up===down2)return null;
  const c=choices(final,[d0-up-down2,d0+up+down2,-(final),final+2],x=>`${num(x)} m`);if(!c)return null;
  return {...c,prompt:`A diver's position is measured from the surface of the sea, so 5 m below the surface is −5 m. She starts at ${num(d0)} m, swims up ${up} m, then dives down ${down2} m. Where is she now?`,
   explanation:explain(bullets(`${num(d0)} + ${up} = ${num(ans)}`,`${num(ans)} − ${down2} = ${num(final)}`),'Below the surface is negative, so going deeper makes the number more negative.'),
   audit:{k:'expr',e:`${d0}+${up}-${down2}`}};}
 const pos=r.int(-4,3),back=Math.min(r.int(5,9),pos+10),ans=pos-back,who=r.pick(NAMES);
 const c=choices(ans,[pos+back,-(pos+back),ans+1,ans-1]);if(!c)return null;
 return {...c,prompt:`In a board game, ${who}'s counter is on the square marked P. ${who} moves back ${back} squares, towards −10. Which number does the counter land on?`,
  visual:{kind:'numberLine',ticks:21,labels:Object.fromEntries(range(0,20).filter(k=>k%2===0).map(k=>[k,num(k-10)])),points:{[pos+10]:'P'},alt:'A number track from −10 to 10 with a counter at P'},
  explanation:explain(bullets(`P is on ${num(pos)}.`,`Moving back ${back} means subtracting: ${num(pos)} − ${back} = ${num(ans)}.`),pos>0?'Count the jumps one at a time if it helps, especially across zero.':'Count the jumps one at a time if it helps.'),
  audit:{k:'expr',e:`#${pos}-${back}`,point:pos}};
};
const negTable:Template=(r,i)=>{
 const days=['Monday','Tuesday','Wednesday','Thursday','Friday'],temps=days.map(()=>r.int(-8,6));
 const mx=Math.max(...temps),mn=Math.min(...temps);if(temps.filter(t=>t===mn).length>1||temps.filter(t=>t===mx).length>1||mn>=0||mx<=0)return null;
 const table:Visual={kind:'table',head:['',...days.map(d=>d.slice(0,3))],rows:[['Lowest (°C)',...temps.map(x=>num(x))]],caption:'Lowest temperature each night',alt:'A table of five night-time temperatures'};
 if(i%2===0){const ans=mx-mn,c=choices(ans,[Math.abs(Math.abs(mn)-mx)||false,ans-1,ans+1,Math.abs(mn)],degs);if(!c)return null;
  return {...c,prompt:'What is the difference between the highest and the lowest temperature in the table?',visual:table,
   explanation:explain(bullets(`Highest: ${num(mx)}°C. Lowest: ${num(mn)}°C.`,`From ${num(mn)} to 0 is ${-mn}; from 0 to ${num(mx)} is ${mx}.`,`Difference: ${-mn} + ${mx} = ${ans} degrees.`),Math.abs(mn)!==mx?`If you chose ${degs(Math.abs(Math.abs(mn)-mx))}, you ignored the minus sign.`:null),
   audit:{k:'tableRange'}};}
 const coldest=days[temps.indexOf(mn)],negs=temps.filter(t=>t<0),closest=days[temps.indexOf(Math.max(...negs))],warm=days[temps.indexOf(mx)];
 const o=words4(coldest,[closest,warm,days[temps.indexOf(temps.filter(t=>t!==mn&&t!==mx)[0])]]);if(!o)return null;
 return {...o,prompt:'Which night had the **lowest** temperature?',visual:table,rewardGroup:'quick',
  explanation:explain(bullets(`The lowest temperature is ${num(mn)}°C, on ${coldest}.`,`${num(mn)} is further below zero than ${list(negs.filter(t=>t!==mn).map(x=>num(x)))}.`)),
  audit:{k:'tableColdest'}};
};
const negMissing:Template=r=>{
 const form=r.int(0,2),a=r.int(3,12),b=r.int(2,12);let s:string,ans:number,w:number[],how:string;
 if(form===0){if(b>=a)return null;ans=b-a;s=`☐ + ${a} = ${b}`;w=[a-b,a+b,-(a+b)];how=`☐ = ${b} − ${a} = ${num(ans)}`;}
 else if(form===1){ans=b+a;s=`${num(-a)} + ☐ = ${b}`;w=[b-a,-(b+a),b];how=`☐ = ${b} − (${num(-a)}) = ${b} + ${a} = ${num(ans)}`;}
 else{ans=a-b;if(ans===0)return null;s=`☐ − ${a} = ${num(-b)}`;w=[-(a+b),a+b,b-a];how=`☐ = ${num(-b)} + ${a} = ${num(ans)}`;}
 const c=choices(ans,w);if(!c)return null;
 return {...c,prompt:'What number goes in the box?',stimulus:s,
  explanation:explain(bullets('Use the inverse operation to undo the calculation.',how),`Check: put ${num(ans)} in the box and work out the left side.`),
  audit:{k:'box',s}};
};

// ───────────────────────── Roman numerals
const RN:[number,string][]=[[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
export function roman(n:number){let s='';for(const [v,t] of RN)while(n>=v){s+=t;n-=v;}return s;}
const PLACES:[string,string,string][]=[['I','V','X'],['X','L','C'],['C','D','M']];
/** One place of a numeral (ones, tens or hundreds) for digit d, standard or with the subtractive forms written the long way. */
function part(d:number,p:number,long=false){const [i,v,x]=PLACES[p];if(d===9)return long?v+i.repeat(4):i+x;if(d===4)return long?i.repeat(4):i+v;return (d>=5?v:'')+i.repeat(d%5);}
function romanParts(n:number,long=-1){const th='M'.repeat(Math.floor(n/1000));return th+[2,1,0].map(p=>part(dig(n,10**p),p,p===long)).join('');}
/** Wrong ways of writing n, each breaking exactly one rule, with the rule broken. */
function romanBreaks(n:number):[string,string][]{
 const out:[string,string][]=[];
 [0,1,2].forEach(p=>{const d=dig(n,10**p);if((d===4||d===9)&&!(p===0&&d===4)){const s=romanParts(n,p);out.push([s,`${s} writes the same letter four times in a row, but no letter is repeated more than three times.`]);}});
 const t=dig(n,10),o=dig(n,1),h=dig(n,100),top=roman(n-n%100);
 if((t===9||t===4)&&o===9)out.push([top+(t===9?'IC':'IL'),`${top+(t===9?'IC':'IL')} takes I from ${t===9?'C':'L'}, but I can only be taken from V or X.`]);
 if((t===9||t===4)&&o===5)out.push([top+(t===9?'VC':'VL'),`${top+(t===9?'VC':'VL')} takes V away, but V is never taken away.`]);
 const topH=roman(n-n%1000);
 if((h===9||h===4)&&t===9&&o===0)out.push([topH+(h===9?'XM':'XD'),`${topH+(h===9?'XM':'XD')} takes X from ${h===9?'M':'D'}, but X can only be taken from L or C.`]);
 if(t===1){const s=roman(n-n%100)+'VV'+roman(o);out.push([s,`${s} writes VV, but V is never repeated (VV would be X).`]);}
 if(h===1){const s=roman(n-n%1000)+'LL'+roman(n%100);out.push([s,`${s} writes LL, but L is never repeated (LL would be C).`]);}
 return out;
}
const romanVal=(s:string)=>{const v:Record<string,number>={I:1,V:5,X:10,L:50,C:100,D:500,M:1000};let t=0;for(let i=0;i<s.length;i++){const a=v[s[i]],b=v[s[i+1]]??0;t+=a<b?-a:a;}return t;};
const romans:Topic={id:'ma-roman-numerals',subject:'Maths',strand:'Number',title:'Roman numerals',helpsheet:{
 intro:'Roman numerals use seven letters: I = 1, V = 5, X = 10, L = 50, C = 100, D = 500 and M = 1,000.',
 steps:['Read from left to right, adding the values: MDCLX = 1,000 + 500 + 100 + 50 + 10 = 1,660.','When a smaller letter comes before a larger one, subtract it: IV = 4, IX = 9, XL = 40, XC = 90, CD = 400, CM = 900.','To write a number, split it into thousands, hundreds, tens and ones, and write each part.'],
 example:{title:'Write 1,784 in Roman numerals',lines:['1,000 → M','700 → DCC','80 → LXXX','4 → IV','1,784 = MDCCLXXXIV']},
 tips:['Never write the same letter more than three times in a row: 40 is XL, not XXXX.','Only I, X and C are taken away, and only from the next two letters up: I from V and X, X from L and C, C from D and M.','V, L and D are never repeated and never taken away.'],
}};
const romanRead:Template=r=>{
 const [kind,lo,hi]=r.pick([['building',1066,1899],['book',1500,1990],['clock',1700,1950],['film',2000,2026],['chapter',14,89]] as const),n=r.int(lo,hi),s=roman(n);
 if(!/IV|IX|XL|XC|CD|CM/.test(s))return null;
 const pairs:[string,number][]=[['CM',200],['CD',200],['XC',20],['XL',20],['IX',2],['IV',2]],mis=pairs.filter(([p])=>s.includes(p)).map(([,d])=>n+d);
 const reps=(['C','X','I','M'] as const).filter(l=>s.includes(l+l)).map(l=>({C:100,X:10,I:1,M:1000}[l]));
 const c=choices(n,[...mis,...reps.map(x=>n-x),...reps.map(x=>n+x),n+10,kind==='chapter'?n-10:n-100].filter(x=>x>0),x=>String(x));if(!c)return null;
 const who=r.pick(NAMES),prompt={building:`The stone above the manor's front door says ${s}, the year it was built. In which year was the manor built?`,book:`The last page of an old book in the manor library says it was printed in ${s}. In which year was it printed?`,clock:`The village clock tower has the year ${s} carved above its door. Which year is that?`,film:`The credits at the end of a film say it was made in ${s}. In which year was it made?`,chapter:`${who} is reading chapter ${s} of a long adventure book. Which chapter is that?`}[kind];
 const firstPair=pairs.find(([p])=>s.includes(p))?.[0]??'';
 const year=(x:number)=>kind==='chapter'?num(x):String(x);
 const groups:string[]=[];{let rest=n;for(const [v,t] of RN){let k=0;while(rest>=v){k++;rest-=v;}if(k)groups.push(`${t.repeat(k)} = ${num(k*v)}`);}}
 return {...c,prompt,rewardGroup:kind==='chapter'?'quick':'standard',
  explanation:explain('Split the numeral into parts:',bullets(...groups),`Total: ${year(n)}`,mis.length?`Reading a subtracting pair as adding (for example ${firstPair} as ${num(romanVal(firstPair.split('').reverse().join('')))}) gives ${year(mis[0])}.`:null),
  audit:{k:'romanRead',s,n}};
};
const romanWrite:Template=r=>{
 const n=r.pick([r.int(40,99),r.int(140,499),r.int(1400,1999),r.int(1900,1999)]),s=roman(n),b=r.shuffle(romanBreaks(n));
 const sw=s.includes('XL')?s.replace('XL','LX'):s.includes('XC')?s.replace('XC','CX'):s.includes('IX')?s.replace('IX','XI'):null,swapped=sw&&roman(romanVal(sw))===sw?sw:null;
 const wrong=[...b.map(x=>x[0]),swapped];const o=words4(s,wrong);if(!o||b.length<2)return null;
 const why=b.filter(x=>o.wrong.includes(x[0])).map(x=>x[1]);
 return {...o,prompt:`Which is the correct way to write **${num(n)}** in Roman numerals?`,
  explanation:explain('Write each part:',bullets(...[1000,100,10,1].map(p=>dig(n,p)*p).filter(x=>x>0).map(x=>`${num(x)} → ${roman(x)}`),`${num(n)} = ${s}`),'The others break a rule:',bullets(...why,...(swapped&&o.wrong.includes(swapped)?[`${swapped} is ${num(romanVal(swapped))}, not ${num(n)}.`]:[]))),
  audit:{k:'romanWrite',n}};
};
const romanSum:Template=r=>{
 const add=r.chance(.6),a=r.int(24,89),b=add?r.int(14,99-a+30):r.int(12,a-5),ans=add?a+b:a-b;if(ans<=0||ans>199)return null;
 const A=roman(a),B=roman(b);if(!/IV|IX|XL|XC/.test(A+B))return null;
 const misA=/IV|IX|XL|XC/.test(A)?romanVal(A.replace(/IV|IX|XL|XC/,m=>m[1]+m[0])):null,misB=/IV|IX|XL|XC/.test(B)?romanVal(B.replace(/IV|IX|XL|XC/,m=>m[1]+m[0])):null;
 const f=(x:number,y:number)=>add?x+y:x-y,cands=[misA&&f(misA,b),misB&&f(a,misB),ans+10,ans-10,ans+2].filter((x):x is number=>!!x&&x>0&&x<400);
 const o=pick(ans,cands,roman,x=>x);if(!o)return null;
 return {...o,prompt:`Work out the answer. Give it in Roman numerals.`,stimulus:`${A} ${add?'+':'−'} ${B}`,
  explanation:explain(bullets(`${A} = ${a} and ${B} = ${b}`,`${a} ${add?'+':'−'} ${b} = ${ans}`,`${ans} = ${roman(ans)}`),'Change to ordinary numbers, work it out, then change back.'),
  audit:{k:'romanSum',a:A,b:B,op:add?'+':'-'}};
};
const romanWrong:Template=r=>{
 const n=r.pick([r.int(40,99),r.int(400,999),r.int(1400,1999)]),b=romanBreaks(n);if(!b.length)return null;
 const [bad,why]=r.pick(b),others=r.sample(range(12,1999).filter(x=>x!==n),60).map(roman).filter(s=>s.length>=3&&s.length<=9);
 const o=words4(bad,others.slice(0,3));if(!o)return null;
 return {...o,prompt:'Which Roman numeral is written **INCORRECTLY**?',rewardGroup:'challenge',
  explanation:explain(why,'The others follow the rules:',bullets(...o.wrong.map(s=>`${s} = ${num(romanVal(s))}`))),
  audit:{k:'romanInvalid'}};
};
const romanGap:Template=r=>{
 const a=r.int(1700,1960),b=a+r.int(8,70),A=roman(a),B=roman(b);if(!/IV|IX|XL|XC|CD|CM/.test(A+B))return null;
 const d=b-a,misA=romanVal(A.replace(/CM|CD|XC|XL|IX|IV/,m=>m[1]+m[0]));
 const c=choices(d,[b-misA,d+10,d-10,d+100].filter(x=>x>0));if(!c)return null;
 return {...c,prompt:`The manor's east wing was built in ${A}. The west wing was built in ${B}. How many years apart were they built?`,
  explanation:explain(bullets(`${A} = ${a}`,`${B} = ${b}`,`${b} − ${a} = ${d} years`)),
  audit:{k:'romanGap',a:A,b:B}};
};
const romanBiggest:Template=r=>{
 const base=r.int(30,160),nums=[...new Set([base,base+r.int(1,9),base-r.int(1,9),base+r.int(10,25)])];if(nums.length<4)return null;
 const ans=Math.max(...nums),s=nums.map(roman),longest=[...s].sort((x,y)=>y.length-x.length)[0];if(longest===roman(ans))return null;
 const o=words4(roman(ans),s.filter(x=>x!==roman(ans)));if(!o)return null;
 return {...o,prompt:'Which Roman numeral has the **greatest** value?',rewardGroup:'quick',
  explanation:explain(bullets(...s.map(x=>`${x} = ${num(romanVal(x))}`)),`The longest numeral, ${longest}, is not the greatest.`),
  audit:{k:'romanMax'}};
};

// ───────────────────────── Number lines and scales
const numberLines:Topic={id:'ma-number-lines',subject:'Maths',strand:'Number',title:'Number lines and scales',helpsheet:{
 intro:'On a number line or scale, the marks are evenly spaced. Work out what each gap is worth before you read a value.',
 steps:['Find two labelled marks and the difference between their numbers.','Count the gaps (not the marks) between them.','Divide the difference by the number of gaps to find what one gap is worth.','Count gaps from a labelled mark to the arrow and add (or subtract) that many steps.'],
 example:{title:'Find P',visual:{kind:'numberLine',ticks:7,labels:{0:'200',6:'500'},points:{4:'P'}},lines:['From 200 to 500 is 300.','There are 6 gaps, so each gap is 300 ÷ 6 = 50.','P is 4 gaps after 200: 200 + 4 × 50 = 400.']},
 tips:['Count the gaps, not the marks: 6 gaps have 7 marks.','Not every scale goes up in 1s or 10s. Check each time.','Negative numbers on a line get smaller as you go left.'],
}};
const NICE=[2,4,5,20,25,50,200,250,500,2500,5000,25000];
/** A number line question: two labelled ticks, a point P, and the value at P. */
function lineParts(r:Rng,step:number,start:number,fmt:(x:number)=>string){
 const gaps=r.int(5,10),i=r.int(0,2),j=r.int(Math.max(i+2,gaps-2),gaps),k=r.pick(range(0,gaps).filter(x=>x!==i&&x!==j)),vi=start,vj=tidy(start+(j-i)*step),vk=tidy(start+(k-i)*step);
 return {gaps,i,j,k,vi,vj,vk,visual:{kind:'numberLine' as const,ticks:gaps+1,labels:{[i]:fmt(vi),[j]:fmt(vj)},points:{[k]:'P'},alt:'A number line with two labelled marks and an arrow at P'}};
}
const lineHow=(L:{i:number;j:number;k:number;vi:number;vj:number;vk:number},fmt:(x:number)=>string)=>{const g=L.j-L.i,s=tidy((L.vj-L.vi)/g),d=L.k-L.i;
 return bullets(`From ${fmt(L.vi)} to ${fmt(L.vj)} is ${fmt(tidy(L.vj-L.vi))}, split into ${g} equal gaps.`,`Each gap is ${fmt(tidy(L.vj-L.vi))} ÷ ${g} = ${fmt(s)}.`,`P is ${Math.abs(d)} gap${Math.abs(d)===1?'':'s'} ${d>0?'after':'before'} ${fmt(L.vi)}: ${fmt(L.vi)} ${d>0?'+':'−'} ${Math.abs(d)} × ${fmt(s)} = ${fmt(L.vk)}.`);};
const nlWhole:Template=r=>{
 const step=r.pick(NICE),start=r.int(1,40)*step*r.pick([1,5,10]),L=lineParts(r,step,start,num),d=L.k-L.i;
 const byTicks=(L.vj-L.vi)/(L.j-L.i+1),c=choices(L.vk,[L.vi+d*(step===10?1:10),Number.isInteger(byTicks)&&L.vi+d*byTicks,L.vk+step,L.vk-step,L.vi+d]);if(!c)return null;
 return {...c,prompt:'What number is at P?',visual:L.visual,explanation:explain(lineHow(L,num),'Count the gaps between the marks, not the marks themselves.'),audit:{k:'numberLine'}};
};
const nlDecimal:Template=r=>{
 const step=r.pick([0.1,0.1,0.2,0.25,0.5,0.05]),start=tidy(r.int(0,30)*step*r.pick([1,2])),L=lineParts(r,step,start,x=>num(x)),d=L.k-L.i;
 const c=choices(L.vk,[tidy(L.vi+d*step/10),tidy(L.vk+step),tidy(L.vk-step),step!==0.1&&tidy(L.vi+d*0.1),tidy(L.vi+d)]);if(!c)return null;
 return {...c,prompt:'What number is at P?',visual:L.visual,explanation:explain(lineHow(L,x=>num(x)),'Decimal steps work the same way as whole-number steps.'),audit:{k:'numberLine'}};
};
const nlNegative:Template=r=>{
 const step=r.pick([2,3,4,5,10,25]),L=lineParts(r,step,-r.int(3,8)*step,num),d=L.k-L.i;if(L.vk===0||L.vj<=0)return null;
 const c=choices(L.vk,[-L.vk,L.vk+step,L.vk-step,L.vi+d*(step===1?2:1)]);if(!c)return null;
 return {...c,prompt:'What number is at P?',visual:L.visual,explanation:explain(lineHow(L,num),'Left of zero the numbers are negative and get smaller as you go left.'),audit:{k:'numberLine'}};
};
const nlFraction:Template=r=>{
 const d=r.pick([4,5,6,8,10]),whole=r.int(0,3),k=r.int(1,d-1),ans:Q=[whole*d+k,d];
 const visual:Visual={kind:'numberLine',ticks:d+1,labels:{0:String(whole),[d]:String(whole+1)},points:{[k]:'P'},alt:'A number line between two whole numbers with an arrow at P'};
 const c=fracChoices(ans,[[whole*(d+1)+k,d+1],[whole*d+k+1,d],k>1&&[whole*d+k-1,d],[whole*(d-1)+k,d-1],[whole*10+k,10]]);if(!c)return null;
 return {...c,prompt:'What number is at P? Give it as a fraction or mixed number.',visual,
  explanation:explain(bullets(`From ${whole} to ${whole+1} is split into ${d} equal gaps, so each gap is 1/${d}.`,`P is ${k} gap${k>1?'s':''} after ${whole}, so it is at ${whole?`${whole} ${k}/${d}`:`${k}/${d}`}.`,...(fmix(ans)!==(whole?`${whole} ${k}/${d}`:`${k}/${d}`)?[`In its simplest form that is ${fmix(ans)}.`]:[])),`There are ${d+1} marks but only ${d} gaps. Counting marks instead of gaps gives the wrong fraction.`),
  audit:{k:'numberLine'}};
};
const nlWhich:Template=r=>{
 const step=r.pick([2,5,20,25,50,250]),gaps=10,start=r.int(1,60)*step,letters=['P','Q','R','S'],ticks=r.sample(range(1,9),4).sort((a,b)=>a-b),pick1=r.int(0,3),val=start+ticks[pick1]*step;
 return {prompt:`Which letter shows **${num(val)}**?`,answer:letters[pick1],wrong:letters.filter((_,j)=>j!==pick1),order:'sorted',
  visual:{kind:'numberLine',ticks:gaps+1,labels:{0:num(start),10:num(start+10*step)},points:Object.fromEntries(ticks.map((t,j)=>[t,letters[j]])),alt:'A number line with two labelled marks and four letters above it'},
  explanation:explain(bullets(`From ${num(start)} to ${num(start+10*step)} is ${num(10*step)}, split into 10 gaps of ${num(step)}.`,`${num(val)} is ${ticks[pick1]} gaps after ${num(start)} (${num(val)} − ${num(start)} = ${num(val-start)}, and ${num(val-start)} ÷ ${num(step)} = ${ticks[pick1]}).`,`That mark is labelled ${letters[pick1]}.`)),
  audit:{k:'numberLineWhich',value:val}};
};
/** A measuring jug with a scale in ml; the water is a blue rect and the labels are numeric text marks. */
export function jug(max:number,major:number,minor:number,v:number):Visual{
 const H=230,top=34,left=70,w=110,y=(x:number)=>tidy(top+H-(x/max)*H),m:Mark[]=[];
 m.push({t:'rect',x:left,y:y(v),w,h:tidy(top+H-y(v)),fill:'blue',sw:0});
 m.push({t:'poly',open:true,fill:'none',w:2.5,pts:[left,top-16,left,top+H,left+w,top+H,left+w,top-16]},{t:'path',d:`M${left+w} ${top+26} C${left+w+44} ${top+26} ${left+w+44} ${top+126} ${left+w} ${top+126}`,fill:'none',w:3});
 for(let x=minor;x<=max;x+=minor){const big=x%major===0;m.push({t:'line',x1:left,y1:y(x),x2:left+(big?24:13),y2:y(x),w:big?2:1.2});if(big)m.push(text(left-8,y(x)+5,num(x),13,{anchor:'end'}));}
 m.push(text(left-8,top+H+5,'0',13,{anchor:'end'}),text(left+w/2,top-22,'ml',14,{bold:true}));
 return fig(left+w+60,top+H+16,m,'A measuring jug marked in millilitres with some water in it');
}
const nlJug:Template=(r,i)=>{
 const [max,major,minor]=r.pick([[1000,200,50],[1000,250,50],[500,100,25],[1000,100,20],[2000,500,100]] as const),v=r.int(1,max/minor-1)*minor;if(v%major===0)return null;
 const below=Math.floor(v/major)*major,n=(v-below)/minor;
 if(i%2===0){const c=choices(v,[below+n*10,v+minor,v-minor,below+n*(major/10)].filter(x=>x>0&&x<=max),x=>`${num(x)} ml`);if(!c)return null;
  return {...c,prompt:'How much water is in the jug?',visual:jug(max,major,minor,v),
   explanation:explain(bullets(`Between ${num(below)} ml and ${num(below+major)} ml there are ${major/minor} gaps, so each small mark is ${num(major)} ÷ ${major/minor} = ${minor} ml.`,`The water is ${n} small mark${n>1?'s':''} above ${num(below)} ml: ${num(below)} + ${n} × ${minor} = ${num(v)} ml.`)),
   audit:{k:'jug'}};}
 const target=max,c=choices(target-v,[v,target-below,target-v+minor,target-(below+n*10)].filter(x=>x>0),x=>`${num(x)} ml`);if(!c)return null;
 return {...c,prompt:`How much more water is needed to fill the jug to the ${num(target)} ml mark?`,visual:jug(max,major,minor,v),
  explanation:explain(bullets(`Each small mark is ${minor} ml, so the jug holds ${num(v)} ml.`,`${num(target)} − ${num(v)} = ${num(target-v)} ml`)),
  audit:{k:'jugMore',target}};
};

export const numberTopics:BuiltTopic[]=[
 topicSet(placeValue,20,[pvPartWhole,pvAddPower,pvDigit,pvMove,pvWords,pvCounters]),
 topicSet(orderCompare,20,[ocCards,ocPictures,ocOrder,ocBetween,ocDigitCards]),
 topicSet(rounding,20,[roundAdd,roundLengths,roundProduct,roundMoney,roundPlace,roundReverse]),
 topicSet(negatives,20,[negCalc,negTemp,negContext,negTable,negMissing]),
 topicSet(romans,20,[romanRead,romanWrite,romanSum,romanWrong,romanGap,romanBiggest]),
 topicSet(numberLines,20,[nlWhole,nlDecimal,nlNegative,nlFraction,nlWhich,nlJug]),
];
