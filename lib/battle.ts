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
export type Fighter={id:string;type:number;level:number;cell:number;name:string;owner?:string};
export type Battle={start:number;duration:number;wave:number;power:number;target:number;contributors:number;fighters:Fighter[]};
export function rules(wave:number){const count=Math.min(24,8+Math.floor((wave-1)/2));return{count,hp:50+10*(wave-1),spawn:1.25,travel:32,duration:(35+(count-1)*1.25)*1000}}
export type Hit={at:number;fighter:number;monster:number;damage:number;point:{x:number;y:number}};
export function simulate(battle:Battle){const rule=rules(battle.wave??1);const hp=Array(rule.count).fill(rule.hp),deathAt:(number|null)[]=Array(rule.count).fill(null);const cooldown=battle.fighters.map(()=>0);const events:Hit[]=[];
for(let t=0;t<=rule.duration/1000;t+=.2){battle.fighters.forEach((f,i)=>{
 if(t<cooldown[i])return;const centre=cellPoint(f.cell),stats=heroStats(f.type,f.level);
 const candidates=Array.from({length:rule.count},(_,m)=>{const progress=(t-m*rule.spawn)/rule.travel;return{m,progress,p:pathPosition(progress)}}).filter(o=>hp[o.m]>0&&o.progress>=0&&o.progress<1&&Math.hypot(o.p.x-centre.x,o.p.y-centre.y)<=stats.range).sort((a,b)=>b.progress-a.progress);
 if(!candidates.length)return;
 const hits=candidates.slice(0,stats.targets);
 if(stats.splash){const impact=hits[0].p;for(let m=0;m<rule.count;m++){const progress=(t-m*rule.spawn)/rule.travel,p=pathPosition(progress);if(m!==hits[0].m&&hp[m]>0&&progress>=0&&progress<1&&Math.hypot(p.x-impact.x,p.y-impact.y)<=stats.splash)hits.push({m,progress,p})}}
 for(const hit of hits){const damage=stats.damage;hp[hit.m]=Math.max(0,hp[hit.m]-damage);if(hp[hit.m]===0)deathAt[hit.m]=t;events.push({at:t,fighter:i,monster:hit.m,damage,point:hit.p})}cooldown[i]=t+stats.cooldown;
})}
return{events,deathAt,killed:deathAt.filter(t=>t!==null).length,count:rule.count,rule};}
