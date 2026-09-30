import {num,explain,bullets,NAMES,list,cap,words,type Topic,type BuiltTopic,type Rng} from './bank-kit';
import type {Visual,Mark} from './visual';
import {topicSet,choices,pick,words4,fig,text,tidy,sum,range,roundTo,gbp,moneyChoices,polyFigure,cubes,type Template} from './bank-maths-util';
import {jug} from './bank-maths-number';
// Maths, Measurement strand: converting units, time, money, perimeter and area, volume.

const r1=(n:number)=>Math.round(n*10)/10;

// ───────────────────────── Converting units
const units:Topic={id:'ma-converting-units',subject:'Maths',strand:'Measurement',title:'Converting units',helpsheet:{
 intro:'Metric units go up in tens, hundreds and thousands, so converting means multiplying or dividing by 10, 100 or 1,000.',
 steps:['Length: 10 mm = 1 cm, 100 cm = 1 m, 1,000 m = 1 km.','Mass: 1,000 g = 1 kg. Capacity: 1,000 ml = 1 litre.','Changing to a smaller unit gives a bigger number (multiply). Changing to a larger unit gives a smaller number (divide).','Some imperial units are still used: 1 inch is about 2.5 cm, 5 miles is about 8 km, 1 kg is about 2.2 pounds and 1 pint is about 570 ml.'],
 example:{title:'Change 2.35 kg to grams',lines:['1 kg = 1,000 g','2.35 × 1,000 = 2,350','2.35 kg = 2,350 g']},
 tips:['Check the size: the same length is a bigger number in mm than in cm.','1.5 litres is 1,500 ml, not 1,005 ml or 150 ml.','Put amounts into the same unit before you compare or add them.'],
}};
const UNIT_NAME:Record<string,string>={mm:'Millimetres',cm:'Centimetres',m:'Metres',km:'Kilometres',g:'Grams',kg:'Kilograms',ml:'Millilitres',litres:'Litres'};
const CONV:[string,string,number][]=[['km','m',1000],['m','cm',100],['cm','mm',10],['kg','g',1000],['litres','ml',1000],['m','mm',1000]];
const cuConvert:Template=r=>{
 const [big,small,f]=r.pick(CONV),down=r.chance(.5);let x:number,ans:number;
 if(down){x=tidy(r.int(11,999)/r.pick([10,100]));ans=tidy(x*f);}else{x=r.int(15,9999);if(x%10===0)return null;ans=tidy(x/f);}
 const others=[10,100,1000].filter(k=>k!==f),c=choices(ans,down?[tidy(x*others[0]),tidy(x*others[1]),tidy(x/f)]:[tidy(x/others[0]),tidy(x/others[1]),tidy(x*f)],y=>num(y));if(!c)return null;
 const s=down?`${num(x)} ${big} = ☐ ${small}`:`${num(x)} ${small} = ☐ ${big}`;
 return {...c,prompt:'What number goes in the box?',stimulus:s,rewardGroup:'quick',
  explanation:explain(bullets(`1 ${big==='litres'?'litre':big} = ${num(f)} ${small}`,down?`${num(x)} × ${num(f)} = ${num(ans)}`:`${num(x)} ÷ ${num(f)} = ${num(ans)}`),down?`${UNIT_NAME[small]} are smaller, so there are more of them: multiply.`:`${UNIT_NAME[big]} are larger, so there are fewer of them: divide.`),
  audit:{k:'expr',e:down?`${x}*#${f}`:`${x}/#${f}`}};
};
const cuStory:Template=r=>{
 const kind=r.int(0,2),who=r.pick(NAMES);
 if(kind===0){const L=r.pick([1.5,2,2.5,3,4.5]),g=r.pick([150,200,250,300]),ans=Math.floor(L*1000/g);if(L*1000%g)return null;
  const c=choices(ans,[Math.floor(L*100/g*10),L*1000/10/g*10===ans?ans+1:Math.round(L*1000/10/g),Math.floor(1000/g),ans*10].filter(x=>x>0&&x!==ans));if(!c)return null;
  return {...c,prompt:`A jug holds ${num(L)} litres of juice. How many ${g} ml glasses can ${who} fill from it?`,explanation:explain(bullets(`${num(L)} litres = ${num(L*1000)} ml`,`${num(L*1000)} ÷ ${g} = ${ans}`),'Change litres to millilitres first.'),audit:{k:'expr',e:`${L}*#1000/${g}`}};}
 if(kind===1){const L=r.pick([2,3,4,5,6]),p=r.pick([20,25,40,50]),ans=L*100/p;
  const c=choices(ans,[L*10/p*10===ans?ans+2:L*10,L*1000/p,p/L,ans/10].filter(x=>Number.isInteger(x)&&x>0));if(!c)return null;
  return {...c,prompt:`${who} has ${L} m of ribbon. How many pieces ${p} cm long can be cut from it?`,explanation:explain(bullets(`${L} m = ${L*100} cm`,`${L*100} ÷ ${p} = ${ans}`),'Change metres to centimetres first.'),audit:{k:'expr',e:`${L}*#100/${p}`}};}
 const kg=r.pick([1.2,1.5,2,2.4,3]),bag=r.pick([150,200,300,400]),ans=kg*1000/bag;if(!Number.isInteger(ans))return null;
 const c=choices(ans,[kg*100/bag*10===ans?ans+1:Math.round(kg*100/bag),Math.round(ans/10),ans*10,ans+2].filter(x=>x>0));if(!c)return null;
 return {...c,prompt:`A baker has ${num(kg)} kg of flour. Each loaf needs ${bag} g. How many loaves can she make?`,explanation:explain(bullets(`${num(kg)} kg = ${num(kg*1000)} g`,`${num(kg*1000)} ÷ ${bag} = ${ans}`)),audit:{k:'expr',e:`${kg}*#1000/${bag}`}};
};
const cuCompare:Template=(r,i)=>{
 const big=i%2===0,kind=r.pick(['length','mass','capacity']),base=kind==='length'?r.int(1100,2900):kind==='mass'?r.int(1100,4900):r.int(1100,3900);
 const vals=r.shuffle([base,base+r.pick([-150,-90,-40,40,90,150]),base+r.pick([-300,-20,20,300]),base+r.pick([-500,-5,5,500])]);if(new Set(vals).size<4)return null;
 const show=(v:number,k:number)=>kind==='length'?[`${num(v/1000)} km`,`${num(v)} m`,`${Math.floor(v/1000)} km ${v%1000} m`,`${num(v*100)} cm`][k]:kind==='mass'?[`${num(v/1000)} kg`,`${num(v)} g`,`${Math.floor(v/1000)} kg ${v%1000} g`,`${num(v/1000)} kg`][k]:[`${num(v/1000)} litres`,`${num(v)} ml`,`${Math.floor(v/1000)} litre${Math.floor(v/1000)===1?'':'s'} ${v%1000} ml`,`${num(v)} ml`][k];
 const forms=vals.map((v,k)=>show(v,k)),best=big?Math.max(...vals):Math.min(...vals),ans=forms[vals.indexOf(best)];
 const o=words4(ans,forms.filter(f=>f!==ans));if(!o||new Set(forms).size<4)return null;
 const unit=kind==='length'?'m':kind==='mass'?'g':'ml';
 return {...o,prompt:`Which is the **${big?kind==='length'?'longest':kind==='mass'?'heaviest':'largest amount':kind==='length'?'shortest':kind==='mass'?'lightest':'smallest amount'}**?`,
  explanation:explain(`Change them all to ${unit==='ml'?'millilitres':unit==='g'?'grams':'metres'}:`,bullets(...forms.map((f,k)=>`${f} = ${num(vals[k])} ${unit}`)),`So the answer is ${ans}.`),
  audit:{k:'measureExtreme',dir:big?'max':'min'}};
};
const cuImperial:Template=r=>{
 const [a,ua,b,ub,verb]=r.pick([[5,'miles',8,'km','is about'],[1,'inch',2.5,'cm','is about'],[1,'kg',2.2,'pounds','is about'],[1,'pint',570,'ml','is about'],[1,'foot',30,'cm','is about']] as const);
 const n=a===5?r.pick([10,15,20,25,30,40,45]):r.int(3,12),ans=tidy(n/a*b),ua2=n===1?ua:ua==='inch'?'inches':ua==='foot'?'feet':ua==='pint'?'pints':ua;
 const c=choices(ans,[tidy(n+b),tidy(ans+b),tidy(ans/10),tidy(ans*10)].filter(x=>x!==ans&&x>0),x=>`${num(x)} ${ub}`);if(!c)return null;
 return {...c,prompt:`${a} ${ua} ${verb} ${num(b)} ${ub}. About how many ${ub==='pounds'?'pounds':ub} is ${n} ${ua2}?`,
  explanation:explain(bullets(a===1?`Each ${ua} is about ${num(b)} ${ub}.`:`${n} miles is ${n/a} lots of 5 miles.`,a===1?`${n} × ${num(b)} = ${num(ans)} ${ub}`:`${n/a} × 8 = ${num(ans)} km`),'These are approximate, so the answer is "about".'),
  audit:{k:'expr',e:a===1?`${n}*${b}`:`${n}/${a}*${b}`}};
};
const cuTotal:Template=r=>{
 const kind=r.int(0,1);
 if(kind===0){const a=tidy(r.int(11,29)/10+r.pick([0,0.05,0.25])),b=r.int(2,9)*50+r.pick([0,25]),ans=tidy(a+b/1000);
  const c=choices(ans,[tidy(a+b/100),tidy(a+b),tidy(a+b/10000),tidy(ans+0.1)],x=>`${num(x)} kg`);if(!c)return null;
  return {...c,prompt:`A bag of flour weighs ${num(a)} kg and a bag of sugar weighs ${b} g. What is their total mass in kilograms?`,
   explanation:explain(bullets(`${b} g = ${num(b/1000)} kg`,`${num(a)} + ${num(b/1000)} = ${num(ans)} kg`),`Change grams to kilograms by dividing by 1,000, not 100.`),audit:{k:'expr',e:`${a}+${b}/#1000`}};}
 const a=r.int(2,5),am=r.int(10,95)*10,b=r.int(1,4),bm=r.int(10,95)*10,tot=(a+b)*1000+am+bm,ans=tidy(tot/1000);
 const c=choices(ans,[tidy(a+b+(am+bm)/100),tidy(a+b+(am+bm)%1000/1000),tidy(ans+1),tidy(a+b+am/1000)],x=>`${num(x)} km`);if(!c)return null;
 return {...c,prompt:`On a sponsored walk, ${r.pick(NAMES)} walks ${a} km ${am} m in the morning and ${b} km ${bm} m in the afternoon. How far is that altogether, in kilometres?`,rewardGroup:'challenge',
  explanation:explain(bullets(`Metres: ${am} + ${bm} = ${num(am+bm)} m${am+bm>=1000?` = 1 km ${am+bm-1000} m`:''}`,`Kilometres: ${a} + ${b}${am+bm>=1000?' + 1':''} = ${a+b+(am+bm>=1000?1:0)} km`,`Total: ${num(ans)} km`)),audit:{k:'expr',e:`${a}+${am}/#1000+${b}+${bm}/#1000`}};
};
const cuJug:Template=r=>{
 const [max,major,minor]=r.pick([[1000,200,50],[1000,250,50],[2000,500,100],[1000,100,20]] as const),v=r.int(1,max/minor-1)*minor;if(v%major===0)return null;
 const ans=tidy(v/1000),c=choices(ans,[tidy(v/100),tidy(v/10000),v,tidy(ans+minor/1000)],x=>`${num(x)} litres`);if(!c)return null;
 return {...c,prompt:'How many litres of water are in the jug?',visual:jug(max,major,minor,v),
  explanation:explain(bullets(`Each small mark is ${minor} ml, so the jug holds ${num(v)} ml.`,`${num(v)} ml ÷ 1,000 = ${num(ans)} litres`)),
  audit:{k:'jugLitres'}};
};

// ───────────────────────── Time
const time:Topic={id:'ma-time',subject:'Maths',strand:'Measurement',title:'Time and timetables',helpsheet:{
 intro:'There are 60 seconds in a minute, 60 minutes in an hour and 24 hours in a day. Time is not counted in hundreds.',
 steps:['24-hour clock: from 1 pm onwards add 12 to the hour, so 3:40 pm is 15:40.','To find how long something takes, count on: to the next o\'clock, then whole hours, then the minutes left.','Hours to minutes: multiply by 60. Minutes to hours: divide by 60.','Timetables: read across a row for a place and down a column for one journey.'],
 example:{title:'How long is it from 10:45 to 13:20?',lines:['10:45 to 11:00 is 15 minutes.','11:00 to 13:00 is 2 hours.','13:00 to 13:20 is 20 minutes.','Total: 2 hours 35 minutes.']},
 tips:['Do not subtract times like decimals: 13:20 − 10:45 is not 2 hours 75 minutes.','Midday is 12:00 and midnight is 00:00.','April, June, September and November have 30 days; February has 28 (29 in a leap year); the rest have 31.'],
}};
const hhmm=(t:number)=>`${String(Math.floor(t/60)%24).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`;
const ampm=(t:number)=>{const h=Math.floor(t/60)%24,m=t%60;return `${h%12||12}:${String(m).padStart(2,'0')} ${h<12?'am':'pm'}`;};
const dur=(mins:number)=>{const h=Math.floor(mins/60),m=mins%60;return [h?`${h} hour${h>1?'s':''}`:'',m?`${m} minute${m>1?'s':''}`:''].filter(Boolean).join(' ');};
const tmClock:Template=(r,i)=>{
 const pm=i%2===0,h=r.int(1,11),m=r.int(1,11)*5,t=(pm?h+12:h)*60+m,ans=hhmm(t);
 const wrong=[hhmm(pm?h*60+m:(h+12)*60+m),hhmm(t+(m>=30?60:-60)),`${String(pm?h+12:h).padStart(2,'0')}:${String(m/5).padStart(2,'0')}`,hhmm(((m/5)%12+(pm?12:0))*60+(h*5)%60)];
 const o=words4(ans,wrong);if(!o)return null;
 return {...o,prompt:`The clock shows a time in the ${pm?'afternoon':'morning'}. What is this time on a 24-hour clock?`,visual:{kind:'clock',h,m,alt:'An analogue clock face'},rewardGroup:'quick',
  explanation:explain(bullets(`The minute hand points to ${m/5}, which means ${m} minutes past.`,m<30?`The hour hand is just past ${h}.`:`The hour hand is between ${h} and ${h%12+1}. It is closer to ${h%12+1} because it is after half past, but the hour is still ${h}.`,`${h}:${String(m).padStart(2,'0')} in the ${pm?'afternoon':'morning'} is ${ans}.`),pm?'In the afternoon, add 12 to the hour.':'Morning times up to 09:59 start with a 0.'),
  audit:{k:'clock24',pm}};
};
const tmDuration:Template=r=>{
 const start=r.int(8*12,19*12)*5,len=r.int(55,190),end=start+len;if(Math.floor(end/60)===Math.floor(start/60)||end%60>=start%60||end>23*60)return null;
 const naive=Math.floor(end/60)*100+end%60-(Math.floor(start/60)*100+start%60),nh=Math.floor(naive/100),nm=naive%100;
 const [what,verb]=r.pick([['A film','starts','ends'],['A coach trip','leaves','arrives'],['The school play','starts','finishes'],['A train journey','leaves','arrives']].map(x=>[x[0],x.slice(1)] as [string,string[]]));
 const wrongDur:[string,number][]=[[`${nh} hour${nh!==1?'s':''} ${nm} minutes`,nh*60+nm],[dur(len+60),len+60],[dur(len+20),len+20],[dur(Math.abs(len-60)),Math.abs(len-60)]];
 const c=pick<[string,number]>([dur(len),len],wrongDur.filter(x=>x[1]>0&&x[1]!==len),x=>x[0],x=>x[1]);if(!c)return null;
 const toHour=60-start%60,wholeH=Math.floor((end-start-toHour)/60),rest=end%60;
 const ask=({'A film':'How long is the film?','A coach trip':'How long does the trip take?','The school play':'How long is the play?','A train journey':'How long does the journey take?'} as Record<string,string>)[what];
 return {...c,prompt:`${what} ${verb[0]} at ${hhmm(start)} and ${verb[1]} at ${hhmm(end)}. ${ask}`,
  explanation:explain(bullets(`${hhmm(start)} to ${hhmm(start+toHour)} is ${toHour} minutes.`,...(wholeH?[`${hhmm(start+toHour)} to ${hhmm(start+toHour+wholeH*60)} is ${wholeH} hour${wholeH>1?'s':''}.`]:[]),`${hhmm(start+toHour+wholeH*60)} to ${hhmm(end)} is ${rest} minutes.`,`Total: ${dur(len)}.`),`Taking away the times like decimals gives ${nh} hour${nh!==1?'s':''} ${nm} minutes, which is impossible: there are only 60 minutes in an hour.`),
  audit:{k:'duration',as:'min'}};
};
/** A bus timetable: stops down the side, one column per bus. */
function timetable(r:Rng){const stops=['Manor Gate','High Street','Station Road','Castle Park'],first=r.int(7*12,9*12)*5,buses=4,gaps=[r.int(3,5)*5,r.int(2,4)*5,r.int(1,3)*5];
 const starts=range(0,buses-1).map(k=>first+k*r.int(7,11)*5),cols=starts.map((s,k)=>{let t=s;const out=[t];gaps.forEach(g=>{t+=g+(k===2?5:0);out.push(t);});return out;});
 return {stops,cols,visual:{kind:'table' as const,head:['Bus stop',...range(1,buses).map(k=>`Bus ${k}`)],rows:stops.map((s,j)=>[s,...cols.map(c=>hhmm(c[j]))]),alt:'A bus timetable with four stops and four buses'}};}
const tmTimetable:Template=(r,i)=>{
 const T=timetable(r),kind=i%3,who=r.pick(NAMES);
 if(kind===0){const b=r.int(0,3),from=0,to=3,len=T.cols[b][to]-T.cols[b][from];
  const c=pick<[string,number]>([dur(len),len],[[dur(T.cols[b][2]-T.cols[b][0]),T.cols[b][2]-T.cols[b][0]],[dur(len+5),len+5],[dur(T.cols[b][3]-T.cols[b][1]),T.cols[b][3]-T.cols[b][1]],[dur(len+10),len+10]],x=>x[0],x=>x[1]);if(!c)return null;
  return {...c,prompt:`How long does the ${hhmm(T.cols[b][0])} bus from Manor Gate take to reach Castle Park?`,visual:T.visual,
   explanation:explain(bullets(`That bus leaves Manor Gate at ${hhmm(T.cols[b][0])} and reaches Castle Park at ${hhmm(T.cols[b][3])}.`,`From ${hhmm(T.cols[b][0])} to ${hhmm(T.cols[b][3])} is ${dur(len)}.`)),audit:{k:'timetable',q:'journey',bus:b}};}
 if(kind===1){const b=r.int(1,3),arrive=T.cols[b][1]-r.int(1,Math.max(1,(T.cols[b][1]-T.cols[b-1][1])/5-1))*5;if(arrive<=T.cols[b-1][1])return null;
  const ans=hhmm(T.cols[b][3]),o=words4(ans,[hhmm(T.cols[b-1][3]),hhmm(T.cols[b][1]),hhmm(T.cols[Math.min(3,b+1)][3])!==ans?hhmm(T.cols[Math.min(3,b+1)][3]):hhmm(T.cols[b][2]),hhmm(T.cols[b][2])]);if(!o)return null;
  return {...o,prompt:`${who} gets to the High Street stop at ${hhmm(arrive)} and catches the next bus. What time does ${who} arrive at Castle Park?`,visual:T.visual,rewardGroup:'challenge',
   explanation:explain(bullets(`The buses leave High Street at ${list(T.cols.map(c=>hhmm(c[1])))}.`,`The first one after ${hhmm(arrive)} is at ${hhmm(T.cols[b][1])} (Bus ${b+1}).`,`Bus ${b+1} reaches Castle Park at ${ans}.`)),audit:{k:'timetable',q:'next',arrive}};}
 const b=r.int(1,3),deadline=T.cols[b][3]+(r.int(0,2)+1)*5;if(b<3&&deadline>=T.cols[b+1][3])return null;
 const ans=hhmm(T.cols[b][0]),o=words4(ans,[b<3?hhmm(T.cols[b+1][0]):hhmm(T.cols[b][1]),hhmm(T.cols[b-1][0]),hhmm(T.cols[b][3]),hhmm(T.cols[b-1][3])]);if(!o)return null;
 return {...o,prompt:`${who} needs to be at Castle Park by ${hhmm(deadline)}. What is the latest time ${who} can catch a bus from Manor Gate?`,visual:T.visual,rewardGroup:'challenge',
  explanation:explain(bullets(`Look along the Castle Park row: the buses arrive at ${list(T.cols.map(c=>hhmm(c[3])))}.`,`The last bus to reach Castle Park by ${hhmm(deadline)} is Bus ${b+1}, which arrives at ${hhmm(T.cols[b][3])}.`,`Bus ${b+1} leaves Manor Gate at ${ans}.`)),audit:{k:'timetable',q:'latest',deadline}};
};
const tmConvert:Template=r=>{
 const kind=r.int(0,2);
 if(kind===0){const h=r.int(1,5),q=r.pick([0.25,0.5,0.75]),ans=(h+q)*60,c=choices(ans,[h*100+q*100,h*60+q*100,(h+q)*100,h*60],x=>`${num(x)} minutes`);if(!c)return null;
  return {...c,prompt:`How many minutes are there in ${h} ${q===0.5?'and a half':q===0.25?'and a quarter':'and three quarters'} hours?`,explanation:explain(bullets(`${h} hours = ${h} × 60 = ${h*60} minutes`,`${q===0.5?'Half':q===0.25?'A quarter of':'Three quarters of'} an hour = ${q*60} minutes`,`${h*60} + ${q*60} = ${ans} minutes`),'An hour has 60 minutes, not 100.'),audit:{k:'expr',e:`(${h}+#${q})*#60`,as:'min'}};}
 if(kind===1){const s=r.int(130,590);if(s%60===0)return null;const m=Math.floor(s/60),sec=s%60,f=(a:number,b:number)=>`${a} minute${a!==1?'s':''} ${b} second${b!==1?'s':''}`;
  const o=pick<[string,number]>([f(m,sec),s],[[f(Math.floor(s/100),s%100),Math.floor(s/100)*60+s%100],[f(m+1,60-sec),(m+1)*60+60-sec],[f(m,sec+10),m*60+sec+10]].filter(x=>x[1]!==s) as [string,number][],x=>x[0],x=>x[1]);if(!o)return null;
  return {...o,prompt:`A monster wave lasts ${s} seconds. How long is that in minutes and seconds?`,explanation:explain(bullets(`${s} ÷ 60 = ${m} remainder ${sec}`,`So ${s} seconds = ${f(m,sec)}.`),'A minute has 60 seconds, not 100.'),audit:{k:'minSec',s}};}
 const d=r.pick([2,3,4,5,7]),ans=d*24,c=choices(ans,[d*12,d*60,d*100,d*24+24]);if(!c)return null;
 return {...c,prompt:`A school trip lasts ${d} days. How many hours is that?`,rewardGroup:'quick',explanation:explain(bullets('A day has 24 hours.',`${d} × 24 = ${ans} hours`)),audit:{k:'expr',e:`${d}*#24`}};
};
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'],MDAYS=[31,28,31,30,31,30,31,31,30,31,30,31];
const tmCalendar:Template=r=>{
 const mo=r.pick([0,2,3,4,5,6,7,8,9,10]),d=r.int(12,MDAYS[mo]-2),add=r.int(8,25);if(add<=MDAYS[mo]-d)return null;let dd=d+add,mm=mo;while(dd>MDAYS[mm]){dd-=MDAYS[mm];mm=(mm+1)%12;}
 const f=(x:number,y:number)=>`${x} ${MONTHS[y]}`,ans=f(dd,mm),[event]=r.pick([['The hero tournament'],['The castle open day'],['The manor fair'],['The book swap']]);
 const next=(x:number,y:number):[number,number]=>x>MDAYS[y]?[x-MDAYS[y],(y+1)%12]:[x,y],wr=[next(dd+1,mm),[dd-1>0?dd-1:dd+2,mm] as [number,number],[dd,(mm+1)%12] as [number,number],[d+add,mo] as [number,number]].filter(([x,y])=>x<=MDAYS[y]).map(([x,y])=>f(x,y));
 const o=words4(ans,wr);if(!o)return null;
 return {...o,prompt:`${event} is ${add} days after ${f(d,mo)}. On what date is it?`,
  explanation:explain(bullets(`${MONTHS[mo]} has ${MDAYS[mo]} days.`,`From ${f(d,mo)} to the end of ${MONTHS[mo]} is ${MDAYS[mo]-d} days.`,`${add} − ${MDAYS[mo]-d} = ${add-(MDAYS[mo]-d)} more days into ${MONTHS[(mo+1)%12]}.`,`So the date is ${ans}.`)),
  audit:{k:'calendar',d,mo,add}};
};
const tm12:Template=(r,i)=>{
 const to24=i%2===0,h=r.int(1,11),m=r.int(0,11)*5,pm=r.chance(.7),t=(pm?h+12:h)*60+m;
 if(to24){const o=words4(hhmm(t),[hhmm(pm?h*60+m:(h+12)*60+m),hhmm((h+10)*60+m),`${String(pm?h+12:h).padStart(2,'0')}:${String(60-m===60?30:60-m).padStart(2,'0')}`,hhmm(t+60)]);if(!o)return null;
  return {...o,prompt:`Which 24-hour time is the same as **${ampm(t)}**?`,rewardGroup:'quick',explanation:explain(pm?`For pm times, add 12 to the hour: ${h} + 12 = ${h+12}, so ${ampm(t)} is ${hhmm(t)}.`:`Morning times keep the same hour, with a 0 in front if needed: ${hhmm(t)}.`),audit:{k:'to24',t}};}
 const o=words4(ampm(t),[ampm(t+12*60),ampm(t-60),ampm(t+60),ampm(t-120)]);if(!o)return null;
 return {...o,prompt:`Which 12-hour time is the same as **${hhmm(t)}**?`,rewardGroup:'quick',explanation:explain(pm?`${hhmm(t)} is after midday: take away 12 from the hour: ${h+12} − 12 = ${h}, so it is ${ampm(t)}.`:`${hhmm(t)} is before midday, so it is ${ampm(t)}.`),audit:{k:'to12',t}};
};

// ───────────────────────── Money
const money:Topic={id:'ma-money',subject:'Maths',strand:'Measurement',title:'Money',helpsheet:{
 intro:'£1 = 100p. When you add or take away money, line up the decimal points.',
 steps:['Write every amount in the same unit: all pounds or all pence.','To find change, count up from the cost to the money handed over.','For several of the same item, multiply the price by how many there are.','To find the best buy, work out the price of one item for each deal and compare.'],
 example:{title:'Change from £20 after spending £13.65',lines:['£13.65 + 35p = £14','£14 + £6 = £20','Change: 35p + £6 = £6.35']},
 tips:['£3.5 means £3.50, not £3.05.','Always write pence with two digits after the point: £4.07.','Change must be less than the money you handed over.'],
}};
/** Quest Shop items: name, price in pence, one of them, several of them. */
const SHOP:[string,number,string,string][]=[['Healing potion',135,'a healing potion','healing potions'],['Shield polish',85,'a tin of shield polish','tins of shield polish'],['Treasure map',240,'a treasure map','treasure maps'],['Torch',315,'a torch','torches'],['Rope',190,'a rope','ropes'],['Magic bean',45,'a magic bean','magic beans'],['Compass',275,'a compass','compasses'],['Lantern',360,'a lantern','lanterns']];
const moChange:Template=r=>{
 const [a,b]=r.sample(SHOP,2),note=a[1]+b[1]<500?500:a[1]+b[1]<1000?1000:2000,cost=a[1]+b[1],ans=note-cost,who=r.pick(NAMES);
 const c=moneyChoices(ans/100,[cost/100,(ans+100)/100,(ans-10)/100,(note-a[1])/100],true);if(!c)return null;
 return {...c,prompt:`${who} buys ${a[2]} for ${gbp(a[1]/100,true)} and ${b[2]} for ${gbp(b[1]/100,true)}. ${who} pays with a £${note/100} note. How much change should ${who} get?`,
  explanation:explain(bullets(`Total cost: ${gbp(a[1]/100,true)} + ${gbp(b[1]/100,true)} = ${gbp(cost/100,true)}`,`Change: £${note/100} − ${gbp(cost/100,true)} = ${gbp(ans/100,true)}`),`Check by counting up: ${gbp(cost/100,true)} + ${gbp(ans/100,true)} = £${note/100}.`),
  audit:{k:'expr',e:`${note/100}-${a[1]/100}-${b[1]/100}`}};
};
const moList:Template=r=>{
 const items=r.sample(SHOP,4),[x,y]=r.sample(items,2),p=r.int(2,4),q=r.int(2,3),ans=p*x[1]+q*y[1],who=r.pick(NAMES);
 const c=moneyChoices(ans/100,[(x[1]+y[1])/100,(p*x[1]+y[1])/100,(x[1]+q*y[1])/100,(p*y[1]+q*x[1])/100],true);if(!c)return null;
 return {...c,prompt:`${who} buys ${p} ${x[3]} and ${q} ${y[3]} from the Quest Shop. How much does ${who} spend?`,
  visual:{kind:'table',head:['Item','Price'],rows:items.map(([n,v])=>[n,gbp(v/100,true)]),caption:'Quest Shop prices',alt:'A price list with four items'},
  explanation:explain(bullets(`${p} × ${gbp(x[1]/100,true)} = ${gbp(p*x[1]/100,true)}`,`${q} × ${gbp(y[1]/100,true)} = ${gbp(q*y[1]/100,true)}`,`Total: ${gbp(p*x[1]/100,true)} + ${gbp(q*y[1]/100,true)} = ${gbp(ans/100,true)}`)),
  audit:{k:'priceList',buy:[[x[0],p],[y[0],q]]}};
};
const moBestBuy:Template=r=>{
 const [thing,unit]=r.pick([['pencils','pencil'],['glow sticks','glow stick'],['batteries','battery'],['stickers','sticker']]),sizes=r.sample([2,3,4,5,6,8,10,12],4).sort((a,b)=>a-b),each=sizes.map(()=>r.int(18,45)),best=Math.min(...each);
 if(each.filter(e=>e===best).length>1)return null;const prices=sizes.map((s,k)=>s*each[k]),names=sizes.map(s=>`Pack of ${s}`),ans=names[each.indexOf(best)];
 const cheapest=names[prices.indexOf(Math.min(...prices))];
 const o=words4(ans,names.filter(n=>n!==ans));if(!o)return null;
 return {...o,prompt:`Which pack of ${thing} is the **best value for money**?`,visual:{kind:'table',head:['Pack','Price'],rows:names.map((n,k)=>[n,gbp(prices[k]/100,true)]),alt:'A table of four pack sizes and their prices'},rewardGroup:'challenge',
  explanation:explain('Work out the price of one '+unit+' in each pack:',bullets(...names.map((n,k)=>`${n}: ${gbp(prices[k]/100,true)} ÷ ${sizes[k]} = ${each[k]}p each`)),`The lowest price for one ${unit} is ${best}p, in the ${ans.toLowerCase()}.`,cheapest!==ans?`The ${cheapest.toLowerCase()} costs the least, but you get fewer ${thing}.`:null),
  audit:{k:'bestBuy'}};
};
const moMultiply:Template=r=>{
 const n=r.int(3,9),p=r.int(1,9)*100+r.int(1,19)*5,ans=n*p,[what]=r.pick([['tickets for the manor tour'],['bags of bird seed'],['sports day T-shirts'],['tubs of paint']]);if(p%100===0)return null;
 const pounds=Math.floor(p/100),pence=p%100,c=moneyChoices(ans/100,[(n*pounds*100+pence)/100,(ans-100)/100,(n*pounds*100+(n*pence)%100)/100,(ans+100)/100],true);if(!c)return null;
 return {...c,prompt:`${r.pick(NAMES)}'s class buys ${n} ${what} at ${gbp(p/100,true)} each. What is the total cost?`,
  explanation:explain(bullets(`${n} × £${pounds} = £${n*pounds}`,`${n} × ${pence}p = ${n*pence}p = ${gbp(n*pence/100,true)}`,`£${n*pounds} + ${gbp(n*pence/100,true)} = ${gbp(ans/100,true)}`)),
  audit:{k:'expr',e:`${n}*${p/100}`}};
};
const moCoins:Template=r=>{
 const vals=r.sample(['£2','£1','50p','20p','10p','5p','2p'],3),groups=vals.map(v=>({value:v,count:r.int(1,5)})),pence=(v:string)=>v.startsWith('£')?Number(v.slice(1))*100:Number(v.slice(0,-1)),tot=sum(groups.map(g=>g.count*pence(g.value)));
 const coins=sum(groups.map(g=>g.count)),c=moneyChoices(tot/100,[tot,sum(groups.map(g=>pence(g.value)))/100,(tot+pence(groups[0].value))/100,coins].map((x,k)=>k===0?x/1:x),true);if(!c)return null;
 return {...c,prompt:'How much money is shown?',visual:{kind:'counters',groups,alt:'Rows of coins'},rewardGroup:'quick',
  explanation:explain(bullets(...groups.map(g=>`${g.count} × ${g.value} = ${gbp(g.count*pence(g.value)/100,true)}`),`Total: ${gbp(tot/100,true)}`)),
  audit:{k:'coins'}};
};
const moShare:Template=r=>{
 const n=r.pick([2,3,4,5,6]),each=r.int(4,25)*100+r.int(0,19)*5,bill=n*each,c=moneyChoices(each/100,[bill/100/(n+1),(each+100)/100,(each-5)/100,Math.round(bill/n/10)/10],true);if(!c||each%100===0)return null;
 return {...c,prompt:`${cap(words(n))} friends share a bill of ${gbp(bill/100,true)} equally. How much does each friend pay?`,
  explanation:explain(bullets(`${gbp(bill/100,true)} ÷ ${n} = ${gbp(each/100,true)}`,`Check: ${gbp(each/100,true)} × ${n} = ${gbp(bill/100,true)}.`)),
  audit:{k:'expr',e:`${bill/100}/${n}`}};
};

// ───────────────────────── Perimeter and area
const perimArea:Topic={id:'ma-perimeter-area',subject:'Maths',strand:'Measurement',title:'Perimeter and area',helpsheet:{
 intro:'Perimeter is the distance around the edge of a shape. Area is the amount of space inside it, measured in square units such as cm².',
 steps:['Rectangle: perimeter = 2 × (length + width); area = length × width.','For an L-shape, find any missing sides first. Add every side for the perimeter, or split it into two rectangles for the area.','Triangle: area = base × perpendicular height ÷ 2.','Parallelogram: area = base × perpendicular height (not the sloping side).'],
 example:{title:'An L-shape',visual:polyFigure([[0,0],[7,0],[7,3],[3,3],[3,6],[0,6]],['7 cm','3 cm',null,null,'3 cm','6 cm'],'An L-shaped shape with four sides labelled',{unit:24}),lines:['Missing sides: 7 − 3 = 4 cm along the step (the bottom is 7 cm and the top is 3 cm), and 6 − 3 = 3 cm up the step.','Perimeter: 7 + 3 + 4 + 3 + 3 + 6 = 26 cm.','Area: 7 × 3 = 21 and 3 × 3 = 9, so 21 + 9 = 30 cm².']},
 tips:['Perimeter is in cm or m; area is in cm² or m².','Use the height that meets the base at a right angle, not a sloping side.','In a shape made of rectangles, the opposite sides add up to the same total.'],
}};
/** Rectilinear shapes (units, anticlockwise from bottom-left) with the two sides that are left unlabelled. */
function lShape(r:Rng):{pts:[number,number][];hide:number[]}|null{
 const W=r.int(6,14),H=r.int(5,12),kind=r.int(0,2);
 if(kind===0){const a=r.int(2,W-2),b=r.int(2,H-2);return {pts:[[0,0],[W,0],[W,b],[a,b],[a,H],[0,H]],hide:[2,3]};}
 if(kind===1){const a=r.int(2,W-2),b=r.int(2,H-2);return {pts:[[0,0],[W,0],[W,H],[W-a,H],[W-a,b],[0,b]],hide:[3,4]};}
 const a=r.int(2,Math.floor(W/2)-1),b=r.int(2,H-2),c=r.int(a+1,W-2);if(c>=W-1)return null;return {pts:[[0,0],[W,0],[W,b],[c,b],[c,H],[a,H],[a,b],[0,b]],hide:[3,6]};
}
const edgeLen=(pts:[number,number][],k:number)=>{const p=pts[k],q=pts[(k+1)%pts.length];return Math.abs(p[0]-q[0])+Math.abs(p[1]-q[1]);};
const shoelace=(pts:[number,number][])=>Math.abs(sum(pts.map((p,k)=>{const q=pts[(k+1)%pts.length];return p[0]*q[1]-q[0]*p[1];})))/2;
const paPerimeter:Template=r=>{
 const s=lShape(r);if(!s)return null;const n=s.pts.length,lens=range(0,n-1).map(k=>edgeLen(s.pts,k)),P=sum(lens),A=shoelace(s.pts),shown=range(0,n-1).filter(k=>!s.hide.includes(k));
 const labels=range(0,n-1).map(k=>s.hide.includes(k)?null:`${lens[k]} cm`);
 const c=choices(P,[sum(shown.map(k=>lens[k])),A,P-lens[s.hide[0]],2*(Math.max(...s.pts.map(p=>p[0]))+Math.max(...s.pts.map(p=>p[1])))+2].filter(x=>x!==P),x=>`${num(x)} cm`);if(!c)return null;
 return {...c,prompt:'What is the perimeter of this shape? All the corners are right angles.',visual:polyFigure(s.pts,labels,'A shape made of rectangles with some side lengths marked'),
  explanation:explain(bullets(`Use the opposite sides to find the unlabelled sides: they are ${lens[s.hide[0]]} cm and ${lens[s.hide[1]]} cm.`,`Perimeter: ${lens.join(' + ')} = ${P} cm`),`If you chose ${sum(shown.map(k=>lens[k]))} cm, you left out the unlabelled sides.`),
  audit:{k:'rectilinear',pts:s.pts,ask:'perimeter',labels}};
};
const paArea:Template=r=>{
 const s=lShape(r);if(!s)return null;const n=s.pts.length,lens=range(0,n-1).map(k=>edgeLen(s.pts,k)),A=shoelace(s.pts),P=sum(lens),W=Math.max(...s.pts.map(p=>p[0])),H=Math.max(...s.pts.map(p=>p[1]));
 const labels=range(0,n-1).map(k=>s.hide.includes(k)?null:`${lens[k]} cm`);
 const c=choices(A,[P,W*H,A+(W*H-A)/2,Math.round(A*1.5)].filter(x=>Number.isInteger(x)&&x!==A),x=>`${num(x)} cm²`);if(!c)return null;
 return {...c,prompt:'What is the area of this shape? All the corners are right angles.',visual:polyFigure(s.pts,labels,'A shape made of rectangles with some side lengths marked'),
  explanation:explain(bullets('Split the shape into rectangles and add their areas.',`The whole bounding ${W===H?'square':'rectangle'} would be ${W} × ${H} = ${W*H} cm²; the missing ${n>6?'parts take':'corner takes'} away ${W*H-A} cm².`,`Area: ${W*H} − ${W*H-A} = ${A} cm²`),`If you chose ${W*H} cm², you counted the missing part too.`),
  audit:{k:'rectilinear',pts:s.pts,ask:'area',labels}};
};
const TRIPLES:[number,number,number][]=[[3,4,5],[6,8,10],[5,12,13],[8,6,10],[4,3,5],[9,12,15],[12,5,13]];
/** A triangle with base b, perpendicular height h (dashed) and one sloping side labelled. */
/** A label beside the side from p to q, pushed outwards (away from the shape's centre c) so it never sits on the line. */
function slantLabel(p:[number,number],q:[number,number],c:[number,number],s:string):Mark{
 const mx=(p[0]+q[0])/2,my=(p[1]+q[1])/2,dx=q[0]-p[0],dy=q[1]-p[1],d=Math.hypot(dx,dy);let nx=-dy/d,ny=dx/d;if(nx*(mx-c[0])+ny*(my-c[1])<0){nx=-nx;ny=-ny;}
 return text(mx+nx*16,my+ny*16+5,s,14,{bold:true,anchor:nx>.3?'start':nx<-.3?'end':'middle'});
}
function triangleFig(b:number,h:number,t:number,slant:number):Visual{
 const u=Math.min(22,300/b,180/h),X=(x:number)=>r1(40+x*u),Y=(y:number)=>r1(30+(h-y)*u),ax=b-t,m:Mark[]=[];
 m.push({t:'poly',pts:[X(0),Y(0),X(b),Y(0),X(ax),Y(h)],fill:'pale',w:2.2},{t:'line',x1:X(ax),y1:Y(h),x2:X(ax),y2:Y(0),w:1.6,dash:true},{t:'poly',open:true,fill:'none',w:1.4,pts:[X(ax)-10,Y(0),X(ax)-10,Y(0)-10,X(ax),Y(0)-10]});
 m.push(text(X(b/2),Y(0)+22,`${b} cm`,14,{bold:true}),text(X(ax)+8,Y(h/2)+12,`${h} cm`,14,{bold:true,anchor:'start'}),slantLabel([X(b),Y(0)],[X(ax),Y(h)],[(X(0)+X(b)+X(ax))/3,(Y(0)*2+Y(h))/3],`${slant} cm`));
 return fig(X(b)+70,Y(0)+36,m,'A triangle with its base, a dashed perpendicular height and one sloping side labelled');
}
const paTriangle:Template=r=>{
 const [t,h,s]=r.pick(TRIPLES),b=t+r.int(2,8);if((b*h)%2)return null;const ans=b*h/2;
 const c=choices(ans,[b*h,b*s/2,b+h+s,b*s].filter(x=>x!==ans),x=>`${num(x)} cm²`);if(!c)return null;
 return {...c,prompt:'What is the area of this triangle? It is not drawn to scale.',visual:triangleFig(b,h,t,s),
  explanation:explain(bullets('Area of a triangle = base × perpendicular height ÷ 2',`${b} × ${h} ÷ 2 = ${ans} cm²`),`The ${s} cm side slopes, so it is not the height. If you chose ${b*h} cm², you forgot to halve.`),
  audit:{k:'expr',e:`${b}*${h}/#2`}};
};
/** A parallelogram with base b, perpendicular height h (dashed) and the sloping side labelled. */
function parallelogramFig(b:number,h:number,off:number,slant:number):Visual{
 const u=Math.min(20,300/(b+off),170/h),X=(x:number)=>r1(60+x*u),Y=(y:number)=>r1(30+(h-y)*u),m:Mark[]=[];
 m.push({t:'poly',pts:[X(0),Y(0),X(b),Y(0),X(b+off),Y(h),X(off),Y(h)],fill:'pale',w:2.2},{t:'line',x1:X(off),y1:Y(h),x2:X(off),y2:Y(0),w:1.6,dash:true},{t:'poly',open:true,fill:'none',w:1.4,pts:[X(off)+10,Y(0),X(off)+10,Y(0)-10,X(off),Y(0)-10]});
 m.push(text(X(b/2),Y(0)+22,`${b} cm`,14,{bold:true}),text(X(off)+14,Y(h/2)+5,`${h} cm`,14,{bold:true,anchor:'start'}),slantLabel([X(0),Y(0)],[X(off),Y(h)],[(X(0)+X(b+off))/2,(Y(0)+Y(h))/2],`${slant} cm`));
 return fig(X(b+off)+30,Y(0)+36,m,'A parallelogram with its base, a dashed perpendicular height and a sloping side labelled');
}
const paParallelogram:Template=r=>{
 const [off,h,s]=r.pick(TRIPLES),b=r.int(off+2,off+12),ans=b*h;
 const c=choices(ans,[b*s,ans/2,2*(b+s),b+h],x=>`${num(x)} cm²`);if(!c)return null;
 return {...c,prompt:'What is the area of this parallelogram? It is not drawn to scale.',visual:parallelogramFig(b,h,off,s),
  explanation:explain(bullets('Area of a parallelogram = base × perpendicular height',`${b} × ${h} = ${ans} cm²`),`${b} × ${s} uses the sloping side, which is not the height.`),
  audit:{k:'expr',e:`${b}*${h}`}};
};
const paStory:Template=(r,i)=>{
 const kind=i%3;
 if(kind===0){const w=r.int(3,12),l=r.int(w+1,20),A=w*l,ans=2*(l+w),c=choices(ans,[l,l+w,A+w,4*w].filter(x=>x!==ans),x=>`${num(x)} cm`);if(!c)return null;
  return {...c,prompt:`A rectangle has an area of ${A} cm². Its width is ${w} cm. What is its perimeter?`,rewardGroup:'challenge',
   explanation:explain(bullets(`Length: ${A} ÷ ${w} = ${l} cm`,`Perimeter: 2 × (${l} + ${w}) = ${ans} cm`),`${l+w} cm is only half of the way round.`),audit:{k:'expr',e:`#2*(${A}/${w}+${w})`}};}
 if(kind===1){const side=r.int(4,15),P=4*side,ans=side*side,c=choices(ans,[P,side,P*P/16===ans?P*2:P*P,side*2],x=>`${num(x)} m²`);if(!c)return null;
  return {...c,prompt:`A square vegetable patch has a perimeter of ${P} m. What is its area?`,explanation:explain(bullets(`Each side: ${P} ÷ 4 = ${side} m`,`Area: ${side} × ${side} = ${ans} m²`)),audit:{k:'expr',e:`(${P}/#4)^#2`}};}
 const l=r.int(5,15),w=r.int(3,10),tile=r.pick([1,2]),per=tile*tile,ans=l*w/per;if(!Number.isInteger(ans)||(tile===2&&(l%2||w%2)))return null;
 const c=choices(ans,[2*(l+w),l*w,(l*w)/2,l+w].filter(x=>x!==ans&&Number.isInteger(x)));if(!c)return null;
 return {...c,prompt:tile===1?`A floor is ${l} m long and ${w} m wide. How many 1 m by 1 m tiles are needed to cover it?`:`A patio is ${l} m long and ${w} m wide. How many 2 m by 2 m slabs are needed to cover it?`,
  explanation:explain(bullets(`Floor area: ${l} × ${w} = ${l*w} m²`,tile===1?`Each tile covers 1 m², so ${l*w} tiles.`:`Each slab covers 2 × 2 = 4 m², so ${l*w} ÷ 4 = ${ans} slabs.`),tile===2?`${l*w/2} would treat each slab as 2 m², but it covers 4 m².`:null),
  audit:{k:'expr',e:tile===1?`${l}*${w}`:`${l}*${w}/(#2*#2)`}};
};
/** A shape drawn on a centimetre grid (squares 1 cm by 1 cm). */
function gridShape(pts:[number,number][],cols:number,rows:number):Visual{
 const u=28,X=(x:number)=>10+x*u,Y=(y:number)=>10+(rows-y)*u,m:Mark[]=[];
 for(let x=0;x<=cols;x++)m.push({t:'line',x1:X(x),y1:Y(0),x2:X(x),y2:Y(rows),w:.8,c:'muted'});
 for(let y=0;y<=rows;y++)m.push({t:'line',x1:X(0),y1:Y(y),x2:X(cols),y2:Y(y),w:.8,c:'muted'});
 m.push({t:'poly',pts:pts.flatMap(([x,y])=>[X(x),Y(y)]),fill:'blue',w:2.4,c:'blue'});
 return fig(X(cols)+10,Y(0)+10,m,'A shape drawn on a grid of centimetre squares');
}
const paGrid:Template=r=>{
 const kind=r.int(0,3),a=r.int(2,6),b=r.int(2,5),c0=r.int(1,4);let pts:[number,number][];
 if(kind===0)pts=[[1,1],[1+a,1],[1,1+b]];
 else if(kind===1)pts=[[1,1],[1+a+c0,1],[1+a,1+b],[1,1+b]];
 else if(kind===2)pts=[[1,1],[1+a,1],[1+a+c0,1+b],[1+c0,1+b]];
 else pts=[[1,1],[1+a,1],[1+a,1+b],[1+Math.floor(a/2),1+b+c0],[1,1+b]];
 const A=shoelace(pts),cols=Math.max(...pts.map(p=>p[0]))+1,rows=Math.max(...pts.map(p=>p[1]))+1;if(!Number.isInteger(A*2))return null;
 const whole=kind===0?Math.floor(A)-Math.floor(a/2):kind===1?a*b:kind===2?a*b-c0:a*b,c=choices(A,[whole,Math.ceil(A+A/4),A*2,A-1].filter(x=>x>0&&x!==A),x=>`${num(x)} cm²`);if(!c)return null;
 return {...c,prompt:'Each square on the grid is 1 cm². What is the area of the shaded shape?',visual:gridShape(pts,cols,rows),
  explanation:explain(bullets(kind===0?`The triangle is half of a ${a} by ${b} ${a===b?'square':'rectangle'}: ${a} × ${b} ÷ 2 = ${num(A)} cm².`:kind===1?`It is a ${a} by ${b} ${a===b?'square':'rectangle'} (${a*b} cm²) plus a triangle that is half of ${c0} by ${b}: ${num(c0*b/2)} cm².`:kind===2?`Cut the triangle off one end and move it to the other: it makes a ${a} by ${b} ${a===b?'square':'rectangle'}.`:`It is a ${a} by ${b} ${a===b?'square':'rectangle'} (${a*b} cm²) with a roof: a triangle ${a} wide and ${c0} tall, ${num(a*c0/2)} cm².`,`Area: ${num(A)} cm²`),kind===0?`A right-angled triangle is half of the ${a===b?'square':'rectangle'} drawn around it.`:kind===2?'Moving a piece of a shape to another place does not change its area.':'Split the shape into parts you know, then add their areas.'),
  audit:{k:'gridArea'}};
};

// ───────────────────────── Volume
const volume:Topic={id:'ma-volume',subject:'Maths',strand:'Measurement',title:'Volume and capacity',helpsheet:{
 intro:'Volume is the amount of space a 3D shape takes up. It is measured in cubic units, such as cm³.',
 steps:['Counting cubes: count the cubes in one layer, then multiply by the number of layers. Remember the hidden ones.','Cuboid: volume = length × width × height.','To find a missing length, divide the volume by the other two lengths multiplied together.','Capacity: 1 cm³ holds 1 ml, so 1,000 cm³ = 1 litre.'],
 example:{title:'A box 5 cm long, 3 cm wide and 2 cm high',visual:cubes(range(0,4).flatMap(i=>range(0,2).flatMap(j=>range(0,1).map(k=>[i,j,k] as [number,number,number]))),'A cuboid built from centimetre cubes, 5 long, 3 deep and 2 high',22),lines:['One layer: 5 × 3 = 15 cubes.','Two layers: 15 × 2 = 30 cubes.','Volume: 30 cm³.']},
 tips:['Volume uses three lengths; area uses two.','Units: cm × cm × cm gives cm³.','A cube 10 cm × 10 cm × 10 cm holds exactly 1 litre.'],
}};
/** A cuboid in an oblique view: length along the front, height up, width going back; hidden edges dashed. */
function cuboidFig(l:number,w:number,h:number,labels:[string,string,string]):Visual{
 const u=Math.min(26,230/(l+w*.5),150/(h+w*.35)),L=l*u,H=h*u,dx=w*u*.5,dy=-w*u*.35,x0=72,y0=24-dy+0,m:Mark[]=[];
 const F=[[x0,y0+H],[x0+L,y0+H],[x0+L,y0],[x0,y0]].map(([x,y])=>[r1(x),r1(y)]),B=F.map(([x,y])=>[r1(x+dx),r1(y+dy)]);
 m.push({t:'poly',pts:[...F[3],...F[2],...B[2],...B[3]],fill:'white',w:2},{t:'poly',pts:[...F[1],...F[2],...B[2],...B[1]],fill:'pale',w:2},{t:'poly',pts:F.flat(),fill:'blue',w:2});
 m.push({t:'line',x1:F[0][0],y1:F[0][1],x2:B[0][0],y2:B[0][1],w:1.3,dash:true},{t:'line',x1:B[0][0],y1:B[0][1],x2:B[1][0],y2:B[1][1],w:1.3,dash:true},{t:'line',x1:B[0][0],y1:B[0][1],x2:B[3][0],y2:B[3][1],w:1.3,dash:true});
 m.push(text(x0+L/2,y0+H+22,labels[0],14,{bold:true}),text(x0-8,y0+H/2+5,labels[2],14,{bold:true,anchor:'end'}),text(r1(F[1][0]+dx/2+8),r1(F[1][1]+dy/2+14),labels[1],14,{bold:true,anchor:'start'}));
 return fig(x0+L+dx+80,y0+H+36,m,'A cuboid with its length, width and height labelled');
}
const voCuboid:Template=r=>{
 const l=r.int(3,12),w=r.int(2,8),h=r.int(2,9),V=l*w*h,SA=2*(l*w+l*h+w*h);if(l===w&&w===h)return null;
 const c=choices(V,[l+w+h,SA,l*w,l*h*2].filter(x=>x!==V),x=>`${num(x)} cm³`);if(!c)return null;
 return {...c,prompt:'What is the volume of this cuboid?',visual:cuboidFig(l,w,h,[`${l} cm`,`${w} cm`,`${h} cm`]),rewardGroup:'quick',
  explanation:explain(bullets('Volume = length × width × height',`${l} × ${w} × ${h} = ${V} cm³`),`${l+w+h} cm³ adds the lengths instead of multiplying them.`),
  audit:{k:'expr',e:`${l}*${w}*${h}`}};
};
const voCount:Template=(r,i)=>{
 const stairs=i%2===1,a=r.int(2,4),b=r.int(2,3),c=r.int(2,3);let cells:[number,number,number][];
 if(!stairs){cells=[];for(let x=0;x<a;x++)for(let y=0;y<b;y++)for(let z=0;z<c;z++)cells.push([x,y,z]);}
 else{cells=[];const steps=r.int(3,4);for(let x=0;x<steps;x++)for(let y=0;y<b;y++)for(let z=0;z<=steps-1-x;z++)cells.push([x,y,z]);}
 const n=cells.length,visible=cells.filter(([x,y,z])=>y===0||z===Math.max(...cells.filter(q=>q[0]===x&&q[1]===y).map(q=>q[2]))||x===Math.max(...cells.filter(q=>q[1]===y&&q[2]===z).map(q=>q[0]))).length;
 const ch=choices(n,[visible,n-b,stairs?n+b:a*b+c,n+1].filter(x=>x!==n&&x>0),x=>`${num(x)}`);if(!ch)return null;
 return {...ch,prompt:`The shape is made from centimetre cubes, with no gaps. What is its volume in cm³?`,visual:cubes(cells,stairs?'A staircase shape built from centimetre cubes':'A cuboid built from centimetre cubes',30),
  explanation:explain(bullets(stairs?`The front face is made of ${cells.filter(q=>q[1]===0).length} cubes.`:`One layer: ${a} × ${b} = ${a*b} cubes.`,stairs?`The shape is ${b} cubes deep, so ${cells.filter(q=>q[1]===0).length} × ${b} = ${n} cubes.`:`${c} layers: ${a*b} × ${c} = ${n} cubes.`,`Volume: ${n} cm³`),`If you chose ${visible}, you only counted the cubes you can see.`),
  audit:{k:'cubeCells',n}};
};
const voMissing:Template=r=>{
 const l=r.int(4,15),w=r.int(3,10),h=r.int(2,12),V=l*w*h;if(l===w&&w===h)return null;const c=choices(h,[V/l,V/w,V-l-w,l*w].filter(x=>Number.isInteger(x)&&x!==h),x=>`${num(x)} cm`);if(!c)return null;
 return {...c,prompt:`A cuboid has a volume of ${num(V)} cm³. It is ${l} cm long and ${w} cm wide. How tall is it?`,rewardGroup:'challenge',
  explanation:explain(bullets(`Length × width = ${l} × ${w} = ${l*w} cm²`,`Height = ${num(V)} ÷ ${l*w} = ${h} cm`),`Check: ${l} × ${w} × ${h} = ${num(V)}.`),
  audit:{k:'expr',e:`${V}/(${l}*${w})`}};
};
const voCapacity:Template=r=>{
 const l=r.pick([20,25,30,40,50,60]),w=r.pick([10,20,25,30]),h=r.pick([10,20,30,40]),cm3=l*w*h,ans=cm3/1000;if(!Number.isInteger(ans*10))return null;
 const c=choices(ans,[cm3,cm3/100,cm3/10000,ans*10],x=>`${num(x)} litres`);if(!c)return null;
 return {...c,prompt:`A fish tank is ${l} cm long, ${w} cm wide and ${h} cm tall. How many litres of water does it hold when it is full?`,visual:cuboidFig(l/5,w/5,h/5,[`${l} cm`,`${w} cm`,`${h} cm`]),
  explanation:explain(bullets(`Volume: ${l} × ${w} × ${h} = ${num(cm3)} cm³`,`1,000 cm³ = 1 litre, so ${num(cm3)} ÷ 1,000 = ${num(ans)} litres`),`${num(cm3)} is in cm³ (millilitres), not litres.`),
  audit:{k:'expr',e:`${l}*${w}*${h}/#1000`}};
};
const voPack:Template=r=>{
 const s=r.pick([2,3,5]),a=s*r.int(2,6),b=s*r.int(2,4),c0=s*r.int(1,3),ans=(a/s)*(b/s)*(c0/s);
 const c=choices(ans,[a*b*c0,a*b*c0/s,(a+b+c0)/s,a*b*c0/(s*s)].filter(x=>Number.isInteger(x)&&x!==ans));if(!c)return null;
 return {...c,prompt:`How many ${s} cm cubes will fit exactly inside a box that is ${a} cm by ${b} cm by ${c0} cm?`,rewardGroup:'challenge',
  explanation:explain(bullets(`Along the length: ${a} ÷ ${s} = ${a/s}`,`Along the width: ${b} ÷ ${s} = ${b/s}`,`Up the height: ${c0} ÷ ${s} = ${c0/s}`,`${a/s} × ${b/s} × ${c0/s} = ${ans} cubes`),`Dividing the volume ${a*b*c0} cm³ by ${s} is wrong: each cube is ${s} × ${s} × ${s} = ${s**3} cm³.`),
  audit:{k:'expr',e:`(${a}/${s})*(${b}/${s})*(${c0}/${s})`}};
};

export const measureTopics:BuiltTopic[]=[
 topicSet(units,20,[cuConvert,cuStory,cuCompare,cuImperial,cuTotal,cuJug]),
 topicSet(time,20,[tmClock,tmDuration,tmTimetable,tmConvert,tmCalendar,tm12]),
 topicSet(money,20,[moChange,moList,moBestBuy,moMultiply,moCoins,moShare]),
 topicSet(perimArea,20,[paPerimeter,paArea,paTriangle,paParallelogram,paStory,paGrid]),
 topicSet(volume,20,[voCuboid,voCount,voMissing,voCapacity,voPack]),
];
