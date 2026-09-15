import {buildStats,type ItemLoadout} from './builds';
import type {Wardrobe} from './clothing';
import {chapterFor} from './chapters';
import {HEROES,legacyHeroStats} from './heroes';
// Pure, deterministic battle rules shared by the server and the animated board.
export const COLS=24,ROWS=18,CELL=60;
export const WAYPOINTS=[[0,3],[20,3],[20,6],[3,6],[3,10],[18,10],[18,14],[7,14],[7,16],[20,16]];
export const PATH:{x:number;y:number}[]=[];
for(let i=0;i<WAYPOINTS.length-1;i++){let[x,y]=WAYPOINTS[i];const[tx,ty]=WAYPOINTS[i+1];while(x!==tx||y!==ty){PATH.push({x:x+.5,y:y+.5});x+=Math.sign(tx-x);y+=Math.sign(ty-y)}}PATH.push({x:20.5,y:16.5});
export const PATH_CELLS=new Set(PATH.map(p=>Math.floor(p.y)*COLS+Math.floor(p.x)));
export const RANGES=HEROES.map(h=>h.range),DAMAGE=HEROES.map(h=>h.power),COOLDOWN=HEROES.map(h=>h.cooldown);
export function isBuildable(cell:number){return Number.isInteger(cell)&&cell>=COLS*2&&cell<COLS*(ROWS-1)&&cell%COLS>0&&cell%COLS<COLS-1&&!(cell%COLS>=20&&Math.floor(cell/COLS)>=14)&&!PATH_CELLS.has(cell)}
export function cellPoint(cell:number){return{x:cell%COLS+.5,y:Math.floor(cell/COLS)+.5}}
export function percent(cell:number){const p=cellPoint(cell);return{x:p.x/COLS*100,y:p.y/ROWS*100}}
export function pathPosition(progress:number){const t=Math.max(0,Math.min(PATH.length-1,progress*(PATH.length-1))),i=Math.min(PATH.length-2,Math.floor(t)),f=t-i;return{x:PATH[i].x+(PATH[i+1].x-PATH[i].x)*f,y:PATH[i].y+(PATH[i+1].y-PATH[i].y)*f}}
export type Fighter=ItemLoadout & {stats?:ReturnType<typeof buildStats>;id:string;type:number;level:number;weapon?:string;cell:number;name:string;gender?:'boy'|'girl';uniform?:string;clothing?:Wardrobe;outfit?:string;colour?:string;owner?:string};
export type Battle={start:number;duration:number;wave:number;rulesVersion?:number;seed?:number;power:number;target:number;contributors:number;fighters:Fighter[]};
export function rules(wave:number,version=3){const chapter=chapterFor(wave);const count=version===1?Math.min(30,8+Math.floor((wave-1)/2)):Math.min(48,18+Math.floor((wave-1)/2));const travel=Math.max(23,32-(chapter.number-1)*.45);const spawn=Math.max(.8,1.25-(chapter.number-1)*.015);return{count,hp:Math.round((version===1?50+10*(wave-1):version===2?180+28*(wave-1)+Math.pow(wave-1,1.35)*3:180*(1+.035*(wave-1)))*(chapter.elite?1.25:1)),spawn,travel,duration:(travel*3.5+3+(count-1)*spawn)*1000,boss:chapter.boss,elite:chapter.elite};}
export function monsterHealth(wave:number,index:number,version=3){const rule=rules(wave,version);return rule.hp*(rule.boss&&index===rule.count-1?4:1)}
export const SCHOOL_MAX_HP=100;
export type Breach={at:number;monster:number;damage:number};
export function breachDamage(wave:number,monster:number){const r=rules(wave);return r.boss&&monster===r.count-1?60:r.elite?30:20;}
export function schoolHealthAt(breaches:Breach[],seconds:number){return Math.max(0,SCHOOL_MAX_HP-breaches.filter(b=>b.at<=seconds).reduce((sum,b)=>sum+b.damage,0));}
export type Hit={at:number;fighter:number;monster:number;damage:number;freeze?:number;slow?:number;slowDuration?:number;mark?:number;markDuration?:number;dot?:boolean;critical?:boolean;knockback?:number;point:{x:number;y:number}};
function legacySimulate(battle:Battle){
 const rule=rules(battle.wave??1,battle.rulesVersion??1),hp=Array.from({length:rule.count},(_,i)=>monsterHealth(battle.wave,i,battle.rulesVersion??1)),deathAt:(number|null)[]=Array(rule.count).fill(null);
 const cooldown=battle.fighters.map(()=>0),shots=battle.fighters.map(()=>0),progress=Array.from({length:rule.count},(_,i)=>-i*rule.spawn/rule.travel);
 const frozenUntil=Array(rule.count).fill(0),immuneUntil=Array(rule.count).fill(0),slowUntil=Array(rule.count).fill(0),slows=Array(rule.count).fill(0),marks=Array(rule.count).fill(0),markedUntil=Array(rule.count).fill(0),pushed=Array(rule.count).fill(0);
 const paints=Array.from({length:rule.count},()=>({until:0,damage:0,fighter:0})),events:Hit[]=[],tracks:number[][]=Array.from({length:rule.count},()=>[]);
 const hitDamage=(m:number,damage:number,t:number)=>{hp[m]=Math.max(0,hp[m]-damage);if(hp[m]===0&&deathAt[m]===null)deathAt[m]=t;};
 for(let tick=0;tick<=Math.ceil(rule.duration/200);tick++){
  const t=tick*.2;
  for(let m=0;m<rule.count;m++){
   if(tick>0&&hp[m]>0&&t>=frozenUntil[m])progress[m]+=.2/rule.travel*(t<slowUntil[m]?1-slows[m]:1);
   if(tick%5===0&&hp[m]>0&&progress[m]>=0&&progress[m]<1&&t<paints[m].until){const p=paints[m];hitDamage(m,p.damage,t);events.push({at:t,fighter:p.fighter,monster:m,damage:p.damage,dot:true,point:pathPosition(progress[m])});}
   tracks[m].push(progress[m]);
  }
  battle.fighters.forEach((f,i)=>{
   if(f.level===0||f.weapon==='none'||t<cooldown[i])return;
   const centre=cellPoint(f.cell),stats=legacyHeroStats(f.type,f.level,f.weapon);
   const living=progress.map((p,m)=>({m,progress:p,p:pathPosition(p)})).filter(o=>hp[o.m]>0&&o.progress>=0&&o.progress<1);
   const candidates=living.filter(o=>Math.hypot(o.p.x-centre.x,o.p.y-centre.y)<=stats.range).sort((a,b)=>b.progress-a.progress);if(!candidates.length)return;
   const hits=candidates.slice(0,stats.targets),impact=hits[0].p;
   if(stats.splash)for(const o of living)if(!hits.some(h=>h.m===o.m)&&Math.hypot(o.p.x-impact.x,o.p.y-impact.y)<=stats.splash)hits.push(o);
   if(stats.chain){let last=hits[0];for(let hop=1;hop<stats.chain;hop++){const next=living.filter(o=>!hits.some(h=>h.m===o.m)&&Math.hypot(o.p.x-last.p.x,o.p.y-last.p.y)<=3).sort((a,b)=>Math.hypot(a.p.x-last.p.x,a.p.y-last.p.y)-Math.hypot(b.p.x-last.p.x,b.p.y-last.p.y))[0];if(!next)break;hits.push(next);last=next;}}
   if(stats.pierce){const dx=impact.x-centre.x,dy=impact.y-centre.y,len=Math.hypot(dx,dy);for(const o of candidates){const along=((o.p.x-centre.x)*dx+(o.p.y-centre.y)*dy)/len,across=Math.abs((o.p.x-centre.x)*dy-(o.p.y-centre.y)*dx)/len;if(hits.length<stats.pierce&&along>0&&across<.65&&!hits.some(h=>h.m===o.m))hits.push(o);}}
   shots[i]++;const critical=stats.criticalEvery>0&&shots[i]%stats.criticalEvery===0;
   for(const hit of hits){
    const m=hit.m,damage=Math.round(stats.damage*(critical?2:1)*(t<markedUntil[m]?1+marks[m]:1));hitDamage(m,damage,t);
    const freeze=stats.freeze&&t>=immuneUntil[m]?stats.freeze:0;if(freeze){frozenUntil[m]=t+freeze;immuneUntil[m]=t+freeze+1.5;}
    if(stats.slow){slows[m]=t<slowUntil[m]?Math.max(slows[m],stats.slow):stats.slow;slowUntil[m]=t+stats.slowDuration;}
    if(stats.mark){marks[m]=t<markedUntil[m]?Math.max(marks[m],stats.mark):stats.mark;markedUntil[m]=t+3;}
    if(stats.dot){const dot=Math.round(stats.damage*stats.dot);if(dot>=paints[m].damage||t>=paints[m].until)paints[m]={damage:dot,until:t+stats.dotDuration,fighter:i};}
    const knockback=Math.min(stats.knockback,Math.max(0,6-pushed[m]));if(knockback){progress[m]=Math.max(0,progress[m]-knockback/(PATH.length-1));pushed[m]+=knockback;}
    events.push({at:t,fighter:i,monster:m,damage,freeze,slow:stats.slow,mark:stats.mark,critical,knockback,point:hit.p});
   }cooldown[i]=t+stats.cooldown;
  });
 }
 return{won:deathAt.every(t=>t!==null),schoolHealth:null as number|null,breaches:[] as Breach[],events,tracks,deathAt,killed:deathAt.filter(t=>t!==null).length,count:rule.count,rule,endedAt:rule.duration/1000,contributions:{} as Record<string,Contribution>};
}
export function monsterProgress(track:number[],elapsed:number){const t=Math.max(0,elapsed/.2),i=Math.min(track.length-1,Math.floor(t)),j=Math.min(track.length-1,i+1);return track[i]+(track[j]-track[i])*(t-Math.floor(t));}
export type Contribution={kills:number;damage:number;controlSeconds:number;assistedDamage:number};
function roll(seed:number,id:string,shot:number){let h=(seed^shot)>>>0;for(let i=0;i<id.length;i++)h=Math.imul(h^id.charCodeAt(i),16777619)>>>0;h=Math.imul(h^(h>>>16),2246822507)>>>0;return ((h^(h>>>13))>>>0)/4294967296;}
function modernSimulate(battle:Battle){
 const rule=rules(battle.wave,3),count=rule.count,hp=Array.from({length:count},(_,i)=>monsterHealth(battle.wave,i,3)),deathAt:(number|null)[]=Array(count).fill(null),progress=Array(count).fill(0),tracks:number[][]=Array.from({length:count},()=>[]),events:Hit[]=[];
 const stats=battle.fighters.map(f=>f.stats??buildStats(f.type,f.level,f.weapon,f)),nextShot=Array(stats.length).fill(0),shots=Array(stats.length).fill(0),centres=battle.fighters.map(f=>cellPoint(f.cell));
 const frozen=Array(count).fill(0),immune=Array(count).fill(0),slowEnd=Array(count).fill(0),slow=Array(count).fill(0),markEnd=Array(count).fill(0),mark=Array(count).fill(0),markOwner=Array(count).fill(''),pushed=Array(count).fill(0),slowOwner=Array(count).fill(''),frozenOwner=Array(count).fill('');
 const paints:Map<string,{damage:number;until:number;fighter:number;next:number}>[]=Array.from({length:count},()=>new Map());
 const contributions:Record<string,Contribution>={};const owner=(i:number)=>battle.fighters[i].owner??battle.fighters[i].id;const credit=(id:string)=>contributions[id]??=( {kills:0,damage:0,controlSeconds:0,assistedDamage:0});
 const usesSchoolHealth=(battle.rulesVersion??1)>=4,breaches:Breach[]=[],escaped=new Set<number>();let schoolHealth=SCHOOL_MAX_HP;
 battle.fighters.forEach((_,i)=>credit(owner(i)));let endedAt=rule.duration/1000;
 const deal=(m:number,amount:number,t:number,i:number)=>{const actual=Math.min(hp[m],Math.max(0,amount));hp[m]-=actual;credit(owner(i)).damage+=actual;if(hp[m]===0&&deathAt[m]===null){deathAt[m]=t;credit(owner(i)).kills++;}return actual;};
 for(let tick=0;tick<=Math.ceil(rule.duration/100);tick++){
 const t=tick*.1;
 for(let m=0;m<count;m++){
 const spawnAt=m*rule.spawn;if(t<spawnAt){progress[m]=(t-spawnAt)/rule.travel;}else if(hp[m]>0&&progress[m]<1){progress[m]=Math.max(0,progress[m]);if(tick&&t<frozen[m]&&frozenOwner[m])credit(frozenOwner[m]).controlSeconds+=.1;if(tick&&t>=frozen[m]){const reduction=t<slowEnd[m]?slow[m]:0;progress[m]+=.1/rule.travel*(1-reduction);if(reduction&&slowOwner[m])credit(slowOwner[m]).controlSeconds+=.1*reduction;}}
 if(hp[m]>0&&progress[m]>=1&&!escaped.has(m)){escaped.add(m);const damage=breachDamage(battle.wave,m);breaches.push({at:t,monster:m,damage});schoolHealth=Math.max(0,schoolHealth-damage);}
 if(hp[m]>0&&progress[m]>=0&&progress[m]<1){for(const [key,p] of paints[m])if(p.until<t)paints[m].delete(key);const active=[...paints[m]].sort((a,b)=>b[1].damage-a[1].damage||a[0].localeCompare(b[0])).slice(0,3);for(const [,p] of active)if(t+1e-8>=p.next&&hp[m]>0){const damage=deal(m,p.damage,t,p.fighter);events.push({at:t,fighter:p.fighter,monster:m,damage,dot:true,point:pathPosition(progress[m])});p.next=t+1;}}
 }
 if(usesSchoolHealth&&schoolHealth===0){if(tick%2===0)for(let m=0;m<count;m++)tracks[m].push(progress[m]);endedAt=t;break;}
 const living=progress.map((p,m)=>({m,progress:p,p:pathPosition(p)})).filter(o=>hp[o.m]>0&&o.progress>=0&&o.progress<1);
 battle.fighters.forEach((f,i)=>{
 const s=stats[i];if(!s.damage||t+1e-8<nextShot[i])return;const centre=centres[i],candidates=living.filter(o=>hp[o.m]>0&&Math.hypot(o.p.x-centre.x,o.p.y-centre.y)<=s.range).sort((a,b)=>b.progress-a.progress||a.m-b.m);
 if(!candidates.length){nextShot[i]=t;return;}const hits=candidates.slice(0,s.targets),impact=hits[0].p;
 if(s.splash){for(const o of living.filter(o=>hp[o.m]>0).sort((a,b)=>Math.hypot(a.p.x-impact.x,a.p.y-impact.y)-Math.hypot(b.p.x-impact.x,b.p.y-impact.y)||a.m-b.m))if(hits.length<6&&!hits.some(h=>h.m===o.m)&&Math.hypot(o.p.x-impact.x,o.p.y-impact.y)<=s.splash)hits.push(o);}
 else if(s.chain){let last=hits[0];while(hits.length<Math.min(5,s.chain)){const o=living.filter(o=>hp[o.m]>0&&!hits.some(h=>h.m===o.m)&&Math.hypot(o.p.x-last.p.x,o.p.y-last.p.y)<=3).sort((a,b)=>Math.hypot(a.p.x-last.p.x,a.p.y-last.p.y)-Math.hypot(b.p.x-last.p.x,b.p.y-last.p.y)||a.m-b.m)[0];if(!o)break;hits.push(o);last=o;}}
 else if(s.pierce){const dx=impact.x-centre.x,dy=impact.y-centre.y,len=Math.max(.001,Math.hypot(dx,dy));for(const o of candidates){const along=((o.p.x-centre.x)*dx+(o.p.y-centre.y)*dy)/len,across=Math.abs((o.p.x-centre.x)*dy-(o.p.y-centre.y)*dx)/len;if(hp[o.m]>0&&hits.length<Math.min(4,s.pierce)&&along>0&&across<.65&&!hits.some(h=>h.m===o.m))hits.push(o);}}
 const critical=roll(battle.seed??battle.start,f.id,++shots[i])<s.critChance;
 hits.forEach((hit,j)=>{const m=hit.m;if(hp[m]<=0)return;const boss=rule.boss&&m===count-1,falloff=j===0?1:s.splash?s.splashFalloff:s.chain?Math.pow(.75,j):s.pierce?Math.pow(.7,j):1;
 const base=Math.max(1,Math.round(s.damage*falloff*(1+(boss?s.bossDamage:s.normalDamage))*(critical?s.critMultiplier:1))),marked=t<markEnd[m]?mark[m]:0,before=hp[m],damage=deal(m,Math.round(base*(1+marked)),t,i);
 if(marked&&markOwner[m]&&markOwner[m]!==owner(i))credit(markOwner[m]).assistedDamage+=Math.max(0,damage-Math.min(before,base));
 const freeze=hp[m]>0&&s.freeze&&t>=immune[m]?s.freeze*(boss?.5:1):0;if(freeze){frozen[m]=t+freeze;immune[m]=frozen[m]+(boss?4:2);frozenOwner[m]=owner(i);}
 if(s.slow){const strength=Math.min(boss?.3:.6,s.slow);if(t>=slowEnd[m]||strength>=slow[m]){slow[m]=strength;slowEnd[m]=t+s.slowDuration;slowOwner[m]=owner(i);}}
 if(s.mark&&(t>=markEnd[m]||s.mark>=mark[m])){mark[m]=Math.min(.3,s.mark);markEnd[m]=t+s.markDuration;markOwner[m]=owner(i);}
 if(s.dot){const key=owner(i),dot=Math.max(1,Math.round(s.damage*falloff*(1+(boss?s.bossDamage:s.normalDamage))*s.dot)),old=paints[m].get(key);if(!old||old.until<t||dot>=old.damage)paints[m].set(key,{damage:dot,until:t+s.dotDuration,fighter:i,next:old&&old.until>=t?old.next:t+1});}
 const knockback=Math.min(s.knockback*(boss?.5:1),Math.max(0,6-pushed[m]));if(knockback){progress[m]=Math.max(0,progress[m]-knockback/(PATH.length-1));pushed[m]+=knockback;}
 events.push({at:t,fighter:i,monster:m,damage,freeze,slow:s.slow,slowDuration:s.slowDuration,mark:s.mark,markDuration:s.markDuration,critical,knockback,point:hit.p});
 });nextShot[i]+=s.cooldown;
 });
 if(tick%2===0)for(let m=0;m<count;m++)tracks[m].push(progress[m]);
 if(hp.every((v,m)=>v===0||progress[m]>=1)){endedAt=t;break;}
 }
 for(const c of Object.values(contributions)){c.damage=Math.round(c.damage);c.assistedDamage=Math.round(c.assistedDamage);c.controlSeconds=Math.round(c.controlSeconds*10)/10;}
 return{won:usesSchoolHealth?schoolHealth>0&&hp.every((v,m)=>v===0||progress[m]>=1):deathAt.every(t=>t!==null),schoolHealth:usesSchoolHealth?schoolHealth:null,breaches,events,tracks,deathAt,killed:deathAt.filter(t=>t!==null).length,count,rule,contributions,endedAt};
}
export function simulate(battle:Battle){return (battle.rulesVersion??1)>=3?modernSimulate(battle):legacySimulate(battle);}
