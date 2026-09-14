import {chapterFor} from './chapters';
import {HEROES,heroStats} from './heroes';
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
export type Fighter={id:string;type:number;level:number;weapon?:string;cell:number;name:string;gender?:'boy'|'girl';uniform?:string;outfit?:string;colour?:string;owner?:string};
export type Battle={start:number;duration:number;wave:number;power:number;target:number;contributors:number;fighters:Fighter[]};
export function rules(wave:number){const chapter=chapterFor(wave);const count=Math.min(30,8+Math.floor((wave-1)/2));const travel=Math.max(23,32-(chapter.number-1)*.45);const spawn=Math.max(.8,1.25-(chapter.number-1)*.015);return{count,hp:Math.round((50+10*(wave-1))*(chapter.elite?1.25:1)),spawn,travel,duration:(travel*3.5+3+(count-1)*spawn)*1000,boss:chapter.boss,elite:chapter.elite};}
export function monsterHealth(wave:number,index:number){const rule=rules(wave);return rule.hp*(rule.boss&&index===rule.count-1?4:1)}
export type Hit={at:number;fighter:number;monster:number;damage:number;freeze?:number;slow?:number;mark?:number;dot?:boolean;critical?:boolean;knockback?:number;point:{x:number;y:number}};
export function simulate(battle:Battle){
 const rule=rules(battle.wave??1),hp=Array.from({length:rule.count},(_,i)=>monsterHealth(battle.wave,i)),deathAt:(number|null)[]=Array(rule.count).fill(null);
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
   const centre=cellPoint(f.cell),stats=heroStats(f.type,f.level,f.weapon);
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
 return{events,tracks,deathAt,killed:deathAt.filter(t=>t!==null).length,count:rule.count,rule};
}
export function monsterProgress(track:number[],elapsed:number){const t=Math.max(0,elapsed/.2),i=Math.min(track.length-1,Math.floor(t)),j=Math.min(track.length-1,i+1);return track[i]+(track[j]-track[i])*(t-Math.floor(t));}
