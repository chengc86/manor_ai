import {num,explain,bullets,NAMES,list,cap,type Topic,type BuiltTopic,type Rng} from './bank-kit';
import type {Visual,Mark,Fill} from './visual';
import {topicSet,choices,pick,words4,fig,text,tidy,sum,range,gbp,moneyChoices,fracChoices,fmix,simp,type Template,type Q} from './bank-maths-util';
// Maths, Statistics strand: tables and charts, pie charts, the mean.

const r1=(n:number)=>Math.round(n*10)/10;
/** Bar chart contexts: title, axis label, bars, and how to ask "how many more" about two bars. */
const CATS:[string,string,string[],(a:string,b:string)=>string][]=[
 ['Favourite sport','Number of pupils',['Football','Netball','Tennis','Swimming','Hockey'],(a,b)=>`How many more pupils chose **${a}** than **${b}**?`],
 ['Favourite fruit','Number of pupils',['Apple','Banana','Grapes','Orange','Pear'],(a,b)=>`How many more pupils chose **${a}** than **${b}**?`],
 ['Books read','Number of books',['Monday','Tuesday','Wednesday','Thursday','Friday'],(a,b)=>`How many more books were read on **${a}** than on **${b}**?`],
 ['Heroes trained','Number of heroes',['Week 1','Week 2','Week 3','Week 4','Week 5'],(a,b)=>`How many more heroes were trained in **${a}** than in **${b}**?`],
 ['Monsters defeated','Number of monsters',['Wave 1','Wave 2','Wave 3','Wave 4','Wave 5'],(a,b)=>`How many more monsters were defeated in **${a}** than in **${b}**?`]];

// ───────────────────────── Tables and charts
const charts:Topic={id:'ma-charts',subject:'Maths',strand:'Statistics',title:'Tables, charts and graphs',helpsheet:{
 intro:'Tables, bar charts, line graphs and pictograms all show data. Read the scale carefully before you read any values.',
 steps:['Read the title and the axis labels to find out what the chart shows.','Work out what each gridline (or each symbol in a pictogram) is worth.','Read each value against the scale: a bar that stops halfway between two lines is halfway between their values.','Then answer the question: "how many more" means subtract; "altogether" means add.'],
 example:{title:'Cakes sold',visual:{kind:'chart',type:'bar',title:'Cakes sold',y:'Cakes',labels:['Fri','Sat','Sun'],values:[7,13,4],max:16,step:2},lines:['Each gridline is worth 2 cakes.','Saturday\'s bar stops halfway between 12 and 14, so it is 13.','Saturday − Sunday = 13 − 4 = 9 more cakes.']},
 tips:['Scales can go up in 2s, 5s or 10s, not just 1s.','In a pictogram, half a symbol is worth half of the key.','On a line graph, the steepest part shows the biggest change.'],
}};
function barData(r:Rng,n=5){const [title,yl,labs,ask]=r.pick(CATS),step=r.pick([2,4,10]),half=step/2,vals=range(1,n).map(()=>r.int(2,step===10?9:12)*half);
 const max=Math.ceil((Math.max(...vals)+half)/step)*step;return {title,yl,labels:labs.slice(0,n),vals,step,max,ask};}
const chBar:Template=(r,i)=>{
 const d=barData(r),[x,y]=r.sample(range(0,4),2);if(d.vals[x]===d.vals[y])return null;const [hi,lo]=d.vals[x]>d.vals[y]?[x,y]:[y,x],ans=d.vals[hi]-d.vals[lo];
 const visual:Visual={kind:'chart',type:'bar',title:d.title,y:d.yl,labels:d.labels,values:d.vals,max:d.max,step:d.step,alt:`A bar chart of ${d.title.toLowerCase()}`};
 if(i%2===0){const c=choices(ans,[d.vals[hi]+d.vals[lo],d.vals[hi],ans+d.step/2,ans-d.step/2].filter(v=>v>0&&v!==ans));if(!c)return null;
  return {...c,prompt:d.ask(d.labels[hi],d.labels[lo]),visual,
   explanation:explain(bullets(`Each gridline is worth ${d.step}.`,`${d.labels[hi]}: ${d.vals[hi]}. ${d.labels[lo]}: ${d.vals[lo]}.`,`${d.vals[hi]} − ${d.vals[lo]} = ${ans}`),`If you chose ${d.vals[hi]+d.vals[lo]}, you added instead of finding the difference.`),
   audit:{k:'chart',op:'diff',a:d.labels[hi],b:d.labels[lo]}};}
 const tot=sum(d.vals),c=choices(tot,[tot-d.vals[0],tot+d.step,Math.max(...d.vals)*d.vals.length,tot-d.step/2]);if(!c)return null;
 return {...c,prompt:'What is the total of all the bars in this chart?',visual,
  explanation:explain(bullets(`Read each bar: ${d.vals.join(', ')}.`,`Total: ${d.vals.join(' + ')} = ${tot}`),'Check the scale first: each gridline is worth '+d.step+'.'),
  audit:{k:'chart',op:'total'}};
};
const chLine:Template=(r,i)=>{
 const times=['08:00','10:00','12:00','14:00','16:00','18:00'],base=r.int(4,12),vals=[base];for(let k=1;k<6;k++)vals.push(Math.max(0,vals[k-1]+r.pick([-3,-2,-1,1,2,3,4,5])*(k<4?1:-1)));
 const visual:Visual={kind:'chart',type:'line',title:'Temperature in the manor garden',x:'Time',y:'Temperature (°C)',labels:times,values:vals,max:Math.ceil((Math.max(...vals)+1)/2)*2,step:2,alt:'A line graph of temperature during one day'};
 if(Math.max(...vals)>=visual.max)return null;
 if(i%2===0){const [a,b]=r.sample(range(0,5),2).sort((x,y)=>x-y),ans=vals[b]-vals[a];if(ans===0)return null;
  const c=choices(ans,[-ans,vals[b],vals[a]+vals[b],ans+1],v=>`${num(v)}°C`);if(!c)return null;
  return {...c,prompt:`By how much did the temperature change from ${times[a]} to ${times[b]}? Give a rise as a positive number and a fall as a negative number.`,visual,rewardGroup:'challenge',
   explanation:explain(bullets(`At ${times[a]} it was ${vals[a]}°C; at ${times[b]} it was ${vals[b]}°C.`,`${vals[b]} − ${vals[a]} = ${num(ans)}`),ans>0?'The temperature rose.':'The temperature fell, so the change is negative.'),
   audit:{k:'chart',op:'change',a:times[a],b:times[b]}};}
 const mx=Math.max(...vals);if(vals.filter(v=>v===mx).length>1)return null;const at=times[vals.indexOf(mx)];
 const o=words4(at,times.filter(t=>t!==at).sort((p,q)=>vals[times.indexOf(q)]-vals[times.indexOf(p)]).slice(0,3));if(!o)return null;
 return {...o,prompt:'At which time was the temperature highest?',visual,rewardGroup:'quick',
  explanation:explain(bullets(`The highest point on the line is ${mx}°C.`,`It is above ${at}.`)),audit:{k:'chart',op:'maxLabel'}};
};
const chPictogram:Template=(r,i)=>{
 const key=r.pick([2,4,10]),classes=['6A','6B','6C','6D'],parts=key===4?[0,0.25,0.5,0.75]:[0,0.5],counts=classes.map(()=>r.int(1,6)+r.pick(parts)),vals=counts.map(c=>c*key);if(new Set(vals).size<4)return null;
 // Quarter and three-quarter symbols are drawn as a slice of the symbol's width, which is only a true quarter of a square,
 // so a key of 4 always uses square symbols (a half is fine for any symbol, as they are all symmetrical).
 const picked=r.pick([['books','read','square'],['stars','earn','star'],['team points','score','circle'],['acts of kindness','do','heart']] as const),[thing,verb,icon]=key===4?(['books','read','square'] as const):picked,visual:Visual={kind:'pictogram',icon,value:key,rows:classes.map((c,k)=>({label:`Class ${c}`,count:counts[k]})),alt:`A pictogram showing ${thing} for each class`};
 if(i%2===0){const k=r.int(0,3),ans=vals[k],c=choices(ans,[Math.ceil(counts[k]),counts[k]*key+key/2,Math.floor(counts[k])*key,counts[k]*10].filter(v=>v!==ans&&v>0));if(!c)return null;
  return {...c,prompt:`How many ${thing} did **Class ${classes[k]}** ${verb}?`,visual,rewardGroup:'quick',
   explanation:explain(bullets(`Each whole symbol stands for ${key}.`,`Class ${classes[k]} has ${counts[k]} symbols${counts[k]%1?` (a part symbol is worth ${num(counts[k]%1*key)})`:''}.`,`${num(counts[k])} × ${key} = ${ans}`),`If you chose ${Math.ceil(counts[k])}, you counted symbols instead of using the key.`),
   audit:{k:'pictogram',op:'value',label:`Class ${classes[k]}`}};}
 const [a,b]=r.sample(range(0,3),2);if(vals[a]===vals[b])return null;const [hi,lo]=vals[a]>vals[b]?[a,b]:[b,a],ans=vals[hi]-vals[lo];
 const c=choices(ans,[counts[hi]-counts[lo],vals[hi]+vals[lo],ans+key,ans-key/2].filter(v=>v>0&&v!==ans&&Number.isInteger(v)));if(!c)return null;
 return {...c,prompt:`How many more ${thing} did **Class ${classes[hi]}** ${verb} than **Class ${classes[lo]}**?`,visual,
  explanation:explain(bullets(`Each symbol stands for ${key}.`,`Class ${classes[hi]}: ${num(counts[hi])} × ${key} = ${vals[hi]}. Class ${classes[lo]}: ${num(counts[lo])} × ${key} = ${vals[lo]}.`,`${vals[hi]} − ${vals[lo]} = ${ans}`),c.wrong.includes(num(counts[hi]-counts[lo]))?`${num(counts[hi]-counts[lo])} is the difference in symbols, not in ${thing}.`:null),
  audit:{k:'pictogram',op:'diff',a:`Class ${classes[hi]}`,b:`Class ${classes[lo]}`}};
};
const chTwoWay:Template=r=>{
 const cols=r.pick([['Football','Netball','Swimming'],['Art','Music','Drama'],['Rain','Sun','Snow']]),g=[0,1,2].map(()=>r.int(3,15)),b=[0,1,2].map(()=>r.int(3,15)),tg=sum(g),tb=sum(b);
 const hideRow=r.int(0,1),hideCol=r.int(0,2),row=(name:string,xs:number[],t:number,hide:boolean)=>[name,...xs.map((v,k)=>hide&&k===hideCol?'?':String(v)),String(t)];
 const tot=[0,1,2].map(k=>g[k]+b[k]),table:Visual={kind:'table',head:['',...cols,'Total'],rows:[row('Girls',g,tg,hideRow===0),row('Boys',b,tb,hideRow===1),['Total',...tot.map(String),String(tg+tb)]],alt:'A two-way table with one number missing'};
 const ans=(hideRow===0?g:b)[hideCol],rowTot=hideRow===0?tg:tb,other=(hideRow===0?b:g)[hideCol],c=choices(ans,[tot[hideCol],other,rowTot-ans,tot[hideCol]+other].filter(v=>v>0&&v!==ans));if(!c)return null;
 const who=hideRow===0?'girls':'boys';
 return {...c,prompt:`The table shows the choices of some pupils. How many ${who} chose ${cols[hideCol].toLowerCase()}?`,visual:table,rewardGroup:'challenge',
  explanation:explain(bullets(`Use the ${cols[hideCol]} column: the total is ${tot[hideCol]} and the ${hideRow===0?'boys':'girls'} are ${(hideRow===0?b:g)[hideCol]}.`,`${tot[hideCol]} − ${(hideRow===0?b:g)[hideCol]} = ${ans}`),`Check with the ${who} row: the numbers add up to ${rowTot}.`),
  audit:{k:'twoWay'}};
};
const chFrequency:Template=(r,i)=>{
 const goals=[0,1,2,3,4],freq=goals.map(()=>r.int(1,7)),matches=sum(freq),total=sum(goals.map((g,k)=>g*freq[k])),askTotal=i%2===0;
 const visual:Visual={kind:'table',head:['Goals scored',...goals.map(String)],rows:[['Number of matches',...freq.map(String)]],caption:'The manor football team\'s season',alt:'A frequency table of goals scored in each match'};
 const ans=askTotal?total:matches,c=choices(ans,askTotal?[matches,sum(goals),total-freq[1],sum(freq.slice(1))]:[total,sum(goals),matches-freq[0],matches+1].filter(v=>v!==ans));if(!c)return null;
 return {...c,prompt:askTotal?'How many goals did the team score altogether this season?':'How many matches did the team play this season?',visual,rewardGroup:askTotal?'challenge':'standard',
  explanation:explain(askTotal?bullets(...goals.map((g,k)=>`${g} goal${g===1?'':'s'} in ${freq[k]} match${freq[k]===1?'':'es'}: ${g} × ${freq[k]} = ${g*freq[k]}`),`Total: ${goals.map((g,k)=>g*freq[k]).join(' + ')} = ${total}`):bullets(`Add the numbers of matches: ${freq.join(' + ')} = ${matches}`),askTotal?`If you chose ${matches}, you counted the matches, not the goals.`:null),
  audit:{k:'frequency',ask:askTotal?'total':'count'}};
};

// ───────────────────────── Pie charts
const pies:Topic={id:'ma-pie-charts',subject:'Maths',strand:'Statistics',title:'Pie charts',helpsheet:{
 intro:'A pie chart shows how a whole is shared out. The whole circle is 360° (or 100%) and stands for everything in the data.',
 steps:['Find what the whole circle stands for, such as 60 pupils.','A slice\'s fraction of the circle is its angle over 360: 90° is 90/360 = 1/4.','Find that fraction of the total: 1/4 of 60 = 15.','To draw a slice: each item is worth 360° ÷ total, so multiply by how many chose it.'],
 example:{title:'72 pupils: how many chose red (120°)?',lines:['120/360 = 1/3','1/3 of 72 = 24 pupils']},
 tips:['The angles always add up to 360°.','A bigger slice does not mean more people if two pie charts show different totals.','A right angle at the centre (90°) is a quarter; a straight line (180°) is a half.'],
}};
const PIE_FILLS:Fill[]=['blue','orange','green','purple','yellow','pale'];
/** A pie chart drawn as a figure: slices from the top, clockwise, each labelled inside (angle or percentage) with a key. */
function pieFig(slices:{name:string;deg:number;label:string}[],alt:string):Visual{
 const c=110,rr=95,m:Mark[]=[];let a=-90;
 slices.forEach((s,k)=>{const b=a+s.deg,ra=(d:number)=>d*Math.PI/180,large=s.deg>180?1:0;
  m.push({t:'path',d:`M${c} ${c} L${r1(c+rr*Math.cos(ra(a)))} ${r1(c+rr*Math.sin(ra(a)))} A${rr} ${rr} 0 ${large} 1 ${r1(c+rr*Math.cos(ra(b)))} ${r1(c+rr*Math.sin(ra(b)))} Z`,fill:PIE_FILLS[k%6],w:2});
  const mid=ra(a+s.deg/2),lr=s.deg<40?rr*.72:rr*.58;m.push(text(c+lr*Math.cos(mid),c+lr*Math.sin(mid)+5,s.label,s.deg<40?11:14,{bold:true}));
  m.push({t:'rect',x:2*c+20,y:22+k*30,w:20,h:20,fill:PIE_FILLS[k%6],sw:1.5},text(2*c+50,37+k*30,s.name,15,{anchor:'start'}));a=b;});
 return fig(2*c+60+Math.max(...slices.map(s=>s.name.length))*8.5,Math.max(2*c,40+slices.length*30),m,alt);
}
/** Pie chart contexts: the opening sentence, how to ask about one slice, and the slice names. */
const PIE_TOPICS:{intro:(t:number,who:string)=>string;did:(name:string)=>string;names:string[]}[]=[
 {intro:(t,who)=>`how ${t} ${who} travel to school`,did:n=>n==='Walk'?'walk':`come by ${n.toLowerCase()}`,names:['Walk','Car','Bus','Bike','Scooter']},
 {intro:(t,who)=>`the favourite heroes of ${t} ${who}`,did:n=>`chose the ${n.toLowerCase()}`,names:['Knight','Wizard','Archer','Healer','Ranger']},
 {intro:(t,who)=>`the favourite seasons of ${t} ${who}`,did:n=>`chose ${n.toLowerCase()}`,names:['Spring','Summer','Autumn','Winter']},
 {intro:(t,who)=>`the favourite fruits of ${t} ${who}`,did:n=>`chose ${n==='Grapes'?'grapes':`${n.toLowerCase()}s`}`,names:['Apple','Banana','Grapes','Orange','Pear']}];
/** Angles in multiples of 15° that add to 360°. */
function pieAngles(r:Rng,n:number,unit=15){const parts=Array(n).fill(1);let left=360/unit-n;while(left>0){parts[r.int(0,n-1)]++;left--;}const out=parts.map(p=>p*unit);return out.some(d=>d>200)?null:out;}
const pcHowMany:Template=r=>{
 const P=r.pick(PIE_TOPICS),names=P.names,n=r.int(3,Math.min(5,names.length)),deg=pieAngles(r,n,r.pick([15,30,45]));if(!deg)return null;
 const total=r.pick([24,36,48,60,72,120,144,180,240]),vals=deg.map(d=>d*total/360);if(!vals.every(Number.isInteger))return null;const k=r.int(0,n-1),ans=vals[k];
 const slices=deg.map((d,j)=>({name:names[j],deg:d,label:`${d}°`}));
 const c=choices(ans,[deg[k],Math.round(deg[k]/100*total),total-ans,ans*2].filter(v=>v>0&&v!==ans&&Number.isInteger(v)));if(!c)return null;
 return {...c,prompt:`The pie chart shows ${P.intro(total,'pupils')}. How many pupils ${P.did(names[k])}?`,visual:pieFig(slices,'A pie chart with each slice\'s angle marked'),
  explanation:explain(bullets(`${names[k]} has ${deg[k]}° of the 360°.`,`${deg[k]}/360 of ${total} = ${total} ÷ 360 × ${deg[k]} = ${ans}`),`${deg[k]} is the angle, not the number of pupils.`),
  audit:{k:'pie',q:'count',total,name:names[k],slices}};
};
const pcFraction:Template=r=>{
 const P=r.pick(PIE_TOPICS),names=P.names,n=r.int(3,4),deg=pieAngles(r,n,r.pick([30,45,60,90]));if(!deg)return null;const k=r.int(0,n-1),ans:Q=simp([deg[k],360]);if(ans[0]===1&&ans[1]===2&&r.chance(.5))return null;
 const slices=deg.map((d,j)=>({name:names[j],deg:d,label:`${d}°`}));
 const c=fracChoices(ans,[simp([deg[k],100]),[1,n],simp([deg[k],180]),simp([360-deg[k],360])].filter(q=>q[0]<q[1]) as Q[]);if(!c)return null;
 return {...c,prompt:`The pie chart shows ${P.intro(72,'pupils').replace('72 ','some ')}. What fraction of the pupils ${P.did(names[k])}? Give it in its simplest form.`,visual:pieFig(slices,'A pie chart with each slice\'s angle marked'),
  explanation:explain(bullets(`The whole circle is 360°.`,`${names[k]}: ${deg[k]}/360`,`${deg[k]}/360 = ${fmix(ans)}`),`The angles are out of 360, not 100, so ${deg[k]}° is not ${deg[k]}/100.`),
  audit:{k:'pie',q:'fraction',name:names[k],slices}};
};
const pcAngle:Template=r=>{
 const total=r.pick([18,24,30,36,40,45,60,72,90]),per=360/total,count=r.int(2,Math.floor(total/2)),ans=count*per,[colour]=r.pick([['red'],['blue'],['green'],['yellow']]);if(!Number.isInteger(ans))return null;
 const c=choices(ans,[count,Math.round(count/total*100),count*10,ans/2].filter(v=>v>0&&v!==ans),v=>`${num(v)}°`);if(!c)return null;
 return {...c,prompt:`In a survey of ${total} pupils, ${count} chose ${colour} as their favourite colour. What angle should the ${colour} slice have in a pie chart?`,rewardGroup:'challenge',
  explanation:explain(bullets(`Each pupil is worth 360° ÷ ${total} = ${num(per)}°.`,`${count} pupils: ${count} × ${num(per)}° = ${ans}°`),`${Math.round(count/total*100)}° would treat the circle as 100 instead of 360.`),
  audit:{k:'expr',e:`${count}*#360/${total}`}};
};
const pcMissing:Template=r=>{
 const P=r.pick(PIE_TOPICS),names=P.names,n=r.int(3,Math.min(5,names.length)),deg=pieAngles(r,n,r.pick([5,10,15]));if(!deg)return null;const k=r.int(0,n-1),ans=deg[k],known=deg.filter((_,j)=>j!==k);
 const slices=deg.map((d,j)=>({name:names[j],deg:d,label:j===k?'x':`${d}°`}));
 const c=choices(ans,[180-sum(known)>0?180-sum(known):ans+20,100-sum(known)>0?100-sum(known):ans-10,ans+10].filter(v=>v>0&&v!==ans),v=>`${v}°`);if(!c)return null;
 return {...c,prompt:'What is the size of the angle marked x in this pie chart?',visual:pieFig(slices,'A pie chart with angles marked and one angle unknown'),
  explanation:explain(bullets('The angles in a pie chart add up to 360°.',`x = 360° − ${known.map(d=>`${d}°`).join(' − ')} = ${ans}°`)),
  audit:{k:'pie',q:'missing',slices}};
};
const pcPercent:Template=r=>{
 const P=r.pick(PIE_TOPICS),names=P.names,n=r.int(3,4),pct=pieAngles(r,n,18)?.map(d=>d/3.6);if(!pct||pct.some(p=>!Number.isInteger(p)))return null;
 const total=r.pick([40,60,80,120,200,300]),k=r.int(0,n-1),ans=pct[k]*total/100;if(!Number.isInteger(ans))return null;
 const slices=pct.map((p,j)=>({name:names[j],deg:p*3.6,label:`${p}%`}));
 const c=choices(ans,[pct[k],Math.round(pct[k]*3.6),total-ans,ans+total/10].filter(v=>v>0&&v!==ans));if(!c)return null;
 return {...c,prompt:`The pie chart shows ${P.intro(total,'people')}. How many people ${P.did(names[k])}?`,visual:pieFig(slices,'A pie chart with each slice\'s percentage marked'),
  explanation:explain(bullets(`${names[k]} is ${pct[k]}% of ${total}.`,`10% of ${total} = ${total/10}, so ${pct[k]}% = ${num(ans)}`)),
  audit:{k:'pie',q:'percent',total,name:names[k],slices}};
};

// ───────────────────────── The mean
const mean:Topic={id:'ma-mean',subject:'Maths',strand:'Statistics',title:'Averages: the mean',helpsheet:{
 intro:'The mean is a way of finding a typical value: it shares the total out equally.',
 steps:['Add up all the values to find the total.','Count how many values there are.','Mean = total ÷ how many values.','To find a missing value, first find the total from the mean (mean × how many), then take away the values you know.'],
 example:{title:'The mean of 7, 12, 9 and 8',lines:['Total: 7 + 12 + 9 + 8 = 36','There are 4 values.','Mean: 36 ÷ 4 = 9']},
 tips:['Divide by how many values there are, including any zeros.','The mean does not have to be one of the values, and it can be a decimal.','If one value goes up, the total goes up, so the mean goes up too.'],
}};
const meList:Template=r=>{
 const n=r.int(4,6),m=r.int(5,20),vals=range(1,n).map(()=>m+r.int(-6,6));const diff=m*n-sum(vals);vals[r.int(0,n-1)]+=diff;if(vals.some(v=>v<=0)||new Set(vals).size<3)return null;
 const sorted=[...vals].sort((a,b)=>a-b),median=n%2?sorted[(n-1)/2]:(sorted[n/2-1]+sorted[n/2])/2,tot=sum(vals);
 const c=choices(m,[tot,median,tidy(tot/(n-1)),tidy(tot/(n+1)),Math.max(...vals)-Math.min(...vals)].filter(v=>v!==m&&Number.isInteger(tidy(v*100))),x=>num(x));if(!c)return null;
 return {...c,prompt:'What is the mean of these numbers?',stimulus:vals.join(', '),rewardGroup:'quick',
  explanation:explain(bullets(`Total: ${vals.join(' + ')} = ${tot}`,`There are ${n} numbers.`,`Mean: ${tot} ÷ ${n} = ${m}`),`If you chose ${tot}, you forgot to divide.`),
  audit:{k:'meanOf'}};
};
const meMissing:Template=r=>{
 const n=r.int(3,5),m=r.int(6,20),known=range(1,n-1).map(()=>m+r.int(-5,5)),x=m*n-sum(known);if(x<=0||known.some(v=>v<=0))return null;
 const c=choices(x,[m,m*n,sum(known),tidy(sum(known)/(n-1))].filter(v=>v!==x&&v>0),v=>num(v));if(!c)return null;
 return {...c,prompt:`The mean of ${n} numbers is ${m}. ${n-1===1?'One of them is':`${cap(['','','Two','Three','Four'][n-1])} of them are`} ${list(known.map(String))}. What is the missing number?`,rewardGroup:'challenge',
  explanation:explain(bullets(`The total of all ${n} numbers is ${n} × ${m} = ${m*n}.`,`The known numbers add up to ${sum(known)}.`,`Missing number: ${m*n} − ${sum(known)} = ${x}`),`Check: (${[...known,x].join(' + ')}) ÷ ${n} = ${m}.`),
  audit:{k:'meanMissing'}};
};
const meChart:Template=r=>{
 const n=5,[title,yl,labs]=r.pick([['Goals in each match','Goals',['Match 1','Match 2','Match 3','Match 4','Match 5']],['Hours of sunshine','Hours',['Mon','Tue','Wed','Thu','Fri']],['Heroes on patrol','Heroes',['Week 1','Week 2','Week 3','Week 4','Week 5']]] as const),m=r.int(3,9),vals=range(1,n).map(()=>Math.max(0,m+r.int(-3,3)));
 const diff=m*n-sum(vals);let k=0;while(vals[k]+diff<0&&k<n-1)k++;vals[k]+=diff;if(vals.some(v=>v<0||v>14))return null;
 const visual:Visual={kind:'chart',type:'bar',title,y:yl,labels:[...labs],values:vals,max:Math.ceil((Math.max(...vals)+1)/2)*2,step:2,alt:`A bar chart of ${title.toLowerCase()}`};
 const tot=sum(vals),c=choices(m,[tot,tidy(tot/4),Math.max(...vals),m+1].filter(v=>v!==m));if(!c)return null;
 return {...c,prompt:'What is the mean of the values shown in the bar chart?',visual,
  explanation:explain(bullets(`Read the bars: ${vals.join(', ')}.`,`Total: ${vals.join(' + ')} = ${tot}`,`Mean: ${tot} ÷ ${n} = ${m}`),vals.includes(0)?'A bar of 0 still counts as one of the values.':null),
  audit:{k:'meanChart'}};
};
const meChange:Template=r=>{
 const n=r.int(4,7),m=r.int(6,15),add=r.int(m+2,m+3*n),newTot=m*n+add,newM=newTot/(n+1);if(!Number.isInteger(newM))return null;const who=r.pick(NAMES);
 const c=choices(newM,[(m+add)/2,tidy(newTot/n),m,newM+1].filter(v=>Number.isInteger(v*10)&&v!==newM),v=>num(v));if(!c)return null;
 return {...c,prompt:`${who}'s mean score in ${n} spelling tests is ${m}. In the next test ${who} scores ${add}. What is ${who}'s new mean score?`,rewardGroup:'challenge',
  explanation:explain(bullets(`Total of the first ${n} tests: ${n} × ${m} = ${m*n}`,`New total: ${m*n} + ${add} = ${newTot}`,`New mean: ${newTot} ÷ ${n+1} = ${newM}`),`${num((m+add)/2)} just averages the old mean with the new score, which ignores how many tests there were.`),
  audit:{k:'expr',e:`(${n}*${m}+${add})/(${n}+#1)`}};
};
const meDecimal:Template=r=>{
 const kind=r.int(0,1);
 if(kind===0){const n=4,m=r.int(130,150),vals=range(1,n).map(()=>m+r.int(-8,8));const d=m*n-sum(vals);vals[3]+=d;const cm=vals.map(v=>tidy(v/100)),mean=tidy(m/100);
  const c=choices(mean,[tidy(sum(cm)),tidy(sum(cm)/3),tidy(mean+0.1),tidy(mean/10)],v=>`${num(v,2)} m`);if(!c)return null;
  return {...c,prompt:`Four friends measure their heights: ${list(cm.map(v=>`${num(v,2)} m`))}. What is their mean height?`,
   explanation:explain(bullets(`Total: ${cm.map(v=>num(v,2)).join(' + ')} = ${num(sum(cm),2)} m`,`Mean: ${num(sum(cm),2)} ÷ 4 = ${num(mean,2)} m`)),audit:{k:'expr',e:`(${cm.join('+')})/#4`}};}
 const n=r.int(3,5),each=r.int(150,900),vals=range(1,n).map(()=>each+r.int(-2,2)*r.pick([5,10,25]));const d=each*n-sum(vals);vals[0]+=d;if(vals.some(v=>v<=0))return null;
 const c=moneyChoices(each/100,[sum(vals)/100,sum(vals)/100/(n-1),(each+10)/100,each/1000],true);if(!c)return null;
 return {...c,prompt:`${cap(['','','','Three','Four','Five'][n])} friends spend ${list(vals.map(v=>gbp(v/100,true)))} at the Quest Shop. What is the mean amount they spend?`,
  explanation:explain(bullets(`Total: ${vals.map(v=>gbp(v/100,true)).join(' + ')} = ${gbp(sum(vals)/100,true)}`,`Mean: ${gbp(sum(vals)/100,true)} ÷ ${n} = ${gbp(each/100,true)}`)),audit:{k:'expr',e:`(${vals.map(v=>v/100).join('+')})/${n}`}};
};

export const statsTopics:BuiltTopic[]=[
 topicSet(charts,20,[chBar,chLine,chPictogram,chTwoWay,chFrequency]),
 topicSet(pies,20,[pcHowMany,pcFraction,pcAngle,pcMissing,pcPercent]),
 topicSet(mean,20,[meList,meMissing,meChart,meChange,meDecimal]),
];
