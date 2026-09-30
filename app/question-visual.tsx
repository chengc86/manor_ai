import {useId} from 'react';
import type {JSX} from 'react';
import type {Visual,Mark,Fill,Ink} from '@/lib/visual';
import {layout} from '@/lib/visual-layout';
// Draws a question picture (lib/visual.ts) as SVG. Pictures sit on a white paper panel so shading rules read the same as in print.
export const INK:Record<Ink,string>={ink:'#1f2a24',muted:'#66756c',blue:'#2563b8',green:'#1f7a4a',red:'#c0392b',orange:'#b85f10',purple:'#7a3971'};
const FILL:Record<string,string>={white:'#ffffff',grey:'#a7aca9',black:'#1f2a24',blue:'#bcd4f6',green:'#cfeedd',red:'#f9d3d0',orange:'#fde1c6',purple:'#ecd6ea',yellow:'#f8e39b',pale:'#eef3ef',none:'none'};
const paint=(f:Fill|undefined,id:string)=>f==='stripes'||f==='dots'||f==='checks'?`url(#${id}-${f})`:FILL[f??'white']??FILL.white;
const ink=(c:Ink|undefined)=>INK[c??'ink'];
/** Arrowheads drawn as small triangles, so they look the same in every browser and in previews. */
function head(x:number,y:number,fromX:number,fromY:number,w:number,colour:string){const a=Math.atan2(y-fromY,x-fromX),s=5+w*2;return <polygon points={`${x},${y} ${x-s*Math.cos(a-.45)},${y-s*Math.sin(a-.45)} ${x-s*Math.cos(a+.45)},${y-s*Math.sin(a+.45)}`} fill={colour}/>;}
function MarkEl({m,id}:{m:Mark;id:string}):JSX.Element{
 const dash=(on?:boolean)=>on?'6 5':undefined;
 switch(m.t){
  case 'line':{const c=ink(m.c),w=m.w??2;return <g><line x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2} stroke={c} strokeWidth={w} strokeDasharray={dash(m.dash)} strokeLinecap="round"/>{m.arrow&&head(m.x2,m.y2,m.x1,m.y1,w,c)}{m.arrow==='both'&&head(m.x1,m.y1,m.x2,m.y2,w,c)}</g>;}
  case 'poly':{const pts=m.pts.reduce<string[]>((s,v,i)=>i%2?s:[...s,`${v},${m.pts[i+1]}`],[]).join(' '),props={points:pts,fill:m.open?'none':paint(m.fill,id),stroke:ink(m.c),strokeWidth:m.w??2,strokeDasharray:dash(m.dash),strokeLinejoin:'round' as const};return m.open?<polyline {...props}/>:<polygon {...props}/>;}
  case 'circle':return <circle cx={m.x} cy={m.y} r={m.r} fill={paint(m.fill,id)} stroke={ink(m.c)} strokeWidth={m.w??2} strokeDasharray={dash(m.dash)}/>;
  case 'ellipse':return <ellipse cx={m.x} cy={m.y} rx={m.rx} ry={m.ry} fill={paint(m.fill,id)} stroke={ink(m.c)} strokeWidth={m.w??2} strokeDasharray={dash(m.dash)}/>;
  case 'rect':return <rect x={m.x} y={m.y} width={m.w} height={m.h} rx={m.r} fill={paint(m.fill,id)} stroke={m.sw===0?'none':ink(m.c)} strokeWidth={m.sw??2} strokeDasharray={dash(m.dash)}/>;
  case 'path':return <path d={m.d} fill={paint(m.fill,id)} stroke={ink(m.c)} strokeWidth={m.w??2} strokeDasharray={dash(m.dash)} strokeLinejoin="round"/>;
  case 'text':return <text x={m.x} y={m.y} fontSize={m.size??15} textAnchor={m.anchor??'middle'} fontWeight={m.bold?700:400} fontStyle={m.italic?'italic':undefined} fill={ink(m.c)}>{m.s}</text>;
  case 'g':{const t=[`translate(${m.x??0} ${m.y??0})`,m.rotate?`rotate(${m.rotate})`:'',m.scale||m.flip?`scale(${(m.scale??1)*(m.flip==='x'?-1:1)} ${(m.scale??1)*(m.flip==='y'?-1:1)})`:''].join(' ');return <g transform={t}>{m.marks.map((x,i)=><MarkEl key={i} m={x} id={id}/>)}</g>;}
 }
}
/** minWidth: small pictures (a lone net or tile) are drawn larger, up to 2.4 times and 360 units tall, so details stay readable.
 *  unit: pixels per drawing unit, when the picture must match another picture's scale exactly (minWidth is then ignored). */
export default function QuestionVisual({visual,label,className='question-visual',minWidth=260,unit}:{visual:Visual;label?:string;className?:string;minWidth?:number;unit?:number}){
 const id='v'+useId().replace(/[^a-zA-Z0-9]/g,''),f=layout(visual),k=unit??(f.w<minWidth?Math.max(1,Math.min(minWidth/f.w,360/f.h,2.4)):1);
 return <svg className={className} viewBox={`0 0 ${f.w} ${f.h}`} width={Math.round(f.w*k)} height={Math.round(f.h*k)} role="img" aria-label={label??f.alt} fontFamily="Nunito, Arial, sans-serif" style={{maxWidth:'100%',height:'auto'}}>
  <title>{label??f.alt}</title>
  <defs>
   <pattern id={`${id}-stripes`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="#fff"/><line x1="0" y1="0" x2="0" y2="7" stroke={INK.ink} strokeWidth="2.6"/></pattern>
   <pattern id={`${id}-dots`} width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#fff"/><circle cx="4" cy="4" r="1.7" fill={INK.ink}/></pattern>
   <pattern id={`${id}-checks`} width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#fff"/><rect width="5" height="5" fill={INK.ink}/><rect x="5" y="5" width="5" height="5" fill={INK.ink}/></pattern>
  </defs>
  {f.marks.map((m,i)=><MarkEl key={i} m={m} id={id}/>)}
 </svg>;
}
