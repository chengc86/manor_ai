import type {Mark,Visual,Fill,Ink} from './visual';
import {circuitSymbol,transform,line,label,shape} from './visual';
// Pictures for the Science bank, drawn from plain marks (lib/visual.ts). Every picture is a figure in its own units.
// Circuits are series loops described by CLoop; tests/bank-science.cjs reads the drawn wires back and simulates them.

type TextOpts={bold?:boolean;anchor?:'start'|'middle'|'end';c?:Ink;italic?:boolean};
const r2=(n:number)=>Math.round(n*100)/100;
export const figure=(w:number,h:number,marks:Mark[],alt:string):Visual=>({kind:'figure',w,h,marks,alt});
export const text=(x:number,y:number,s:string,size=14,o:TextOpts={}):Mark=>label(x,y,s,size,o);
export const arrow=(x1:number,y1:number,x2:number,y2:number,w=2,c?:Ink,dash=false):Mark=>({t:'line',x1,y1,x2,y2,w,arrow:'end',c,dash});
export const rect=(x:number,y:number,w:number,h:number,fill:Fill='white',r=0,sw=1.6):Mark=>({t:'rect',x,y,w,h,fill,r,sw});
const ellipse=(x:number,y:number,rx:number,ry:number,fill:Fill,rotate=0,w=1.6):Mark=>rotate?transform([{t:'ellipse',x,y,rx,ry,fill,w}],{x,y,rotate}):{t:'ellipse',x,y,rx,ry,fill,w};
const circle=(x:number,y:number,r:number,fill:Fill,w=1.6):Mark=>({t:'circle',x,y,r,fill,w});
const tw=(s:string,size:number)=>s.length*size*.6;
/** A rounded box with bold centred text. */
export function boxed(cx:number,cy:number,s:string,o:{w?:number;h?:number;size?:number;fill?:Fill;c?:Ink}={}):Mark[]{
 const size=o.size??15,w=o.w??Math.max(90,tw(s,size)+26),h=o.h??40;
 return [rect(cx-w/2,cy-h/2,w,h,o.fill??'white',8),text(cx,cy+size*.36,s,size,{bold:true,c:o.c})];
}
/** The same mark with a different outline width. */
function stroke(m:Mark,w:number):Mark{
 switch(m.t){case 'g':return {...m,marks:m.marks.map(x=>stroke(x,w))};case 'rect':return {...m,sw:w};case 'text':case 'line':return m;default:return {...m,w};}
}
/** Draws overlapping shapes as one outlined silhouette: thick outlines first, then the same shapes filled without outlines. */
const silhouette=(shapes:Mark[]):Mark[]=>[...shapes.map(m=>stroke(m,4)),...shapes.map(m=>stroke(m,0))];

// ── Circuits ────────────────────────────────────────────────────────────────────────────────────────────────
export type CKind='cell'|'battery'|'bulb'|'buzzer'|'motor'|'switch'|'gap';
/** One part of a series loop. name labels it (A, B, S1 …); rev turns a cell the other way round. */
export type CPart={k:CKind;closed?:boolean;name?:string;rev?:boolean};
/** A series loop drawn as a rectangle. top and bottom parts are listed left to right, left and right parts top to bottom.
 *  Cells on every side face the same way round the loop unless rev is set. Buzzers and motors go on the top or bottom. */
export type CLoop={top:CPart[];right?:CPart[];bottom?:CPart[];left?:CPart[];w?:number;h?:number};
const SLOT=66;
function part(p:CPart,x:number,y:number,rot:number):Mark[]{
 const turn=(ms:Mark[],deg:number)=>{const d=((deg%360)+360)%360;return d?[transform(ms,{x,y,rotate:d})]:ms;};
 const upright=rot===90||rot===270?rot:0;
 switch(p.k){
  case 'cell':case 'battery':return turn(circuitSymbol(p.k,x,y),rot+(p.rev?180:0));
  case 'switch':return turn(circuitSymbol(p.closed?'switchClosed':'switchOpen',x,y),rot);
  case 'bulb':return turn(circuitSymbol('bulb',x,y),upright);
  case 'buzzer':case 'motor':return circuitSymbol(p.k,x,y);
  case 'gap':return turn([line(x-20,y,x-9,y),line(x+9,y,x+20,y)],upright);
 }
}
export function loopMarks(loop:CLoop,ox=0,oy=0):{marks:Mark[];w:number;h:number}{
 const len=(ps?:CPart[])=>Math.max(1,ps?.length??0)*SLOT+20;
 const W=Math.max(loop.w??0,len(loop.top),len(loop.bottom),140),H=Math.max(loop.h??0,len(loop.left),len(loop.right),110);
 const named=[loop.top,loop.right,loop.bottom,loop.left].some(ps=>ps?.some(p=>p.name)),pad=named?44:24,top=named?38:24,bottom=named?46:24;
 const x0=ox+pad,y0=oy+top,x1=x0+W,y1=y0+H,wires:Mark[]=[],parts:Mark[]=[],names:Mark[]=[];
 const edge=(ps:CPart[]|undefined,ax:number,ay:number,bx:number,by:number,rot:number)=>{
  const list=ps??[],L=Math.hypot(bx-ax,by-ay),ux=(bx-ax)/L,uy=(by-ay)/L;let at=0;
  list.forEach((p,i)=>{
   const t=L*(i+1)/(list.length+1),cx=r2(ax+ux*t),cy=r2(ay+uy*t);
   wires.push(line(r2(ax+ux*at),r2(ay+uy*at),r2(ax+ux*(t-20)),r2(ay+uy*(t-20))));at=t+20;
   parts.push(...part(p,cx,cy,rot));
   if(p.name)names.push(rot===0?text(cx,cy-24,p.name,15,{bold:true}):rot===180?text(cx,cy+37,p.name,15,{bold:true}):rot===90?text(cx+24,cy+5,p.name,15,{bold:true,anchor:'start'}):text(cx-24,cy+5,p.name,15,{bold:true,anchor:'end'}));
  });
  wires.push(line(r2(ax+ux*at),r2(ay+uy*at),bx,by));
 };
 edge(loop.top,x0,y0,x1,y0,0);edge(loop.right,x1,y0,x1,y1,90);edge(loop.bottom,x0,y1,x1,y1,180);edge(loop.left,x0,y0,x0,y1,270);
 return {marks:[...wires,...parts,...names],w:W+2*pad,h:H+top+bottom};
}
export function circuit(loop:CLoop,alt:string):Visual{const c=loopMarks(loop);return figure(c.w,c.h,c.marks,alt);}
/** Several loops side by side, each captioned underneath. */
export function circuits(loops:CLoop[],captions:string[],alt:string):Visual{
 const m:Mark[]=[];let x=0,h=0;
 loops.forEach((l,i)=>{const c=loopMarks(l,x,0);m.push(...c.marks,text(x+c.w/2,c.h+12,captions[i],15,{bold:true,c:'purple'}));x+=c.w+20;h=Math.max(h,c.h+24);});
 return figure(x-20,h,m,alt);
}
/** One circuit symbol on its own. */
export const symbol=(kind:'cell'|'battery'|'bulb'|'buzzer'|'motor'|'switchOpen'|'switchClosed',alt:string):Visual=>figure(160,100,[transform(circuitSymbol(kind,80,54),{x:80,y:54,scale:2})],alt);

// ── Living things ───────────────────────────────────────────────────────────────────────────────────────────
export type PrintKind='fox'|'cat'|'badger'|'deer'|'duck';
const PRINT_ALT:Record<PrintKind,string>={fox:'A footprint with four toe marks, each with a small claw mark',cat:'A footprint with four round toe marks and no claw marks',badger:'A wide footprint with five toe marks and long claw marks',deer:'A print made of two pointed hoof halves side by side',duck:'A print with three long toes joined by webbing'};
/** Animal footprints for the tracks key. */
export function footprint(kind:PrintKind):Visual{
 const m:Mark[]=[],claw=(x:number,y:number):Mark=>({t:'poly',pts:[x-2.5,y+3,x,y-4,x+2.5,y+3],fill:'black',w:1});
 switch(kind){
  case 'fox':m.push(ellipse(50,70,14,12,'black'),ellipse(43,42,5.5,8,'black'),ellipse(57,42,5.5,8,'black'),ellipse(30,56,5,7.5,'black',-20),ellipse(70,56,5,7.5,'black',20),claw(43,28),claw(57,28),claw(27,44),claw(73,44));break;
  case 'cat':m.push(ellipse(50,68,17,13,'black'),circle(32,46,6.5,'black'),circle(44,35,6.5,'black'),circle(56,35,6.5,'black'),circle(68,46,6.5,'black'));break;
  case 'badger':{m.push(ellipse(50,72,27,12,'black'));[[24,52],[37,47],[50,45],[63,47],[76,52]].forEach(([x,y])=>m.push(circle(x,y,5.5,'black'),line(x,y-8,x,y-24,2.5)));break;}
  case 'deer':m.push(shape('teardrop',{x:36,y:48,size:15,fill:'black'}),shape('teardrop',{x:64,y:48,size:15,fill:'black'}));break;
  case 'duck':m.push({t:'poly',pts:[50,86,18,32,34,40,50,16,66,40,82,32],fill:'grey',w:2},line(50,84,20,33,3),line(50,84,50,18,3),line(50,84,80,33,3));break;
 }
 return figure(100,100,m,PRINT_ALT[kind]);
}
export type LeafKind='oak'|'sycamore'|'holly'|'beech'|'pine';
const LEAF_ALT:Record<LeafKind,string>={oak:'A long leaf whose edge has rounded lobes',sycamore:'A leaf shaped like an open hand with five pointed lobes',holly:'An oval leaf with sharp spikes around its edge',beech:'An oval leaf with a smooth edge and a pointed tip',pine:'Two long, thin needles joined at the base'};
/** Tree leaves for the leaf key. */
export function leaf(kind:LeafKind):Visual{
 const m:Mark[]=[],stalk=(y:number)=>line(50,y,50,98,2.5),rib=(y1:number,y2:number):Mark=>({t:'line',x1:50,y1,x2:50,y2,w:1.5,c:'green'});
 switch(kind){
  case 'oak':m.push(stalk(84),...silhouette([ellipse(50,47,13,36,'green'),circle(36,24,9,'green'),circle(64,24,9,'green'),circle(33,42,10,'green'),circle(67,42,10,'green'),circle(35,61,9.5,'green'),circle(65,61,9.5,'green'),circle(50,13,8,'green'),circle(42,77,6,'green'),circle(58,77,6,'green')]),rib(12,82));break;
  case 'sycamore':{const pts:number[]=[],at=(deg:number,r:number)=>pts.push(r2(50+r*Math.cos(deg*Math.PI/180)),r2(52+r*Math.sin(deg*Math.PI/180)));
   [[10,42],[90,9],[170,42],[195,15],[222,42],[247,15],[270,42],[293,15],[318,42],[345,15]].forEach(([d,r])=>at(d,r));
   m.push(stalk(60),{t:'poly',pts,fill:'green',w:2});for(const d of [10,170,222,270,318])m.push({t:'line',x1:50,y1:56,x2:r2(50+36*Math.cos(d*Math.PI/180)),y2:r2(52+36*Math.sin(d*Math.PI/180)),w:1,c:'green'});break;}
  case 'holly':{const pts:number[]=[];for(let i=0;i<18;i++){const a=(i*20-90)*Math.PI/180,k=i%2?.8:1;pts.push(r2(50+26*k*Math.cos(a)),r2(50+40*k*Math.sin(a)));}m.push(stalk(88),{t:'poly',pts,fill:'green',w:2},rib(12,88));break;}
  case 'beech':m.push(stalk(88),{t:'path',d:'M50 8 C74 26 76 64 50 88 C24 64 26 26 50 8 Z',fill:'green',w:2},rib(10,86));for(const y of [30,44,58,72])m.push({t:'line',x1:50,y1:y,x2:33,y2:y-9,w:1,c:'green'},{t:'line',x1:50,y1:y,x2:67,y2:y-9,w:1,c:'green'});break;
  case 'pine':m.push(line(50,92,42,8,3),line(50,92,58,8,3),rect(46,84,8,12,'orange',2,1.2));break;
 }
 return figure(100,100,m,LEAF_ALT[kind]);
}
/** Stages round a cycle with arrows; '?' marks a missing stage. */
export function cycle(stages:string[],alt:string):Visual{
 const W=520,H=300,cx=260,cy=150,rx=175,ry=105,n=stages.length,m:Mark[]=[];
 const pos=stages.map((_,i)=>{const a=(-90+i*360/n)*Math.PI/180;return {x:r2(cx+rx*Math.cos(a)),y:r2(cy+ry*Math.sin(a))};});
 pos.forEach((p,i)=>{const q=pos[(i+1)%n],dx=q.x-p.x,dy=q.y-p.y;m.push(arrow(r2(p.x+dx*.33),r2(p.y+dy*.33),r2(p.x+dx*.67),r2(p.y+dy*.67),2.5,'green'));});
 stages.forEach((s,i)=>m.push(...boxed(pos[i].x,pos[i].y,s,{w:Math.max(110,tw(s,15)+26),fill:s==='?'?'white':'pale',c:s==='?'?'purple':undefined})));
 return figure(W,H,m,alt);
}
/** A food chain: boxes joined by arrows that point to the eater. */
export function foodChain(items:string[],alt:string):Visual{
 const ws=items.map(s=>Math.max(96,tw(s,15)+26)),gap=50,h=60,m:Mark[]=[];let x=6;
 items.forEach((s,i)=>{m.push(...boxed(x+ws[i]/2,h/2,s,{w:ws[i],fill:'pale'}));if(i<items.length-1)m.push(arrow(x+ws[i]+6,h/2,x+ws[i]+gap-6,h/2,2.5,'green'));x+=ws[i]+gap;});
 return figure(x-gap+6,h,m,alt);
}
/** A flower cut in half: P petal, Q anther, R stigma, S ovary, T sepal. (Labels start at P so they never clash with option letters A–E.) */
export function flower(alt:string):Visual{
 const m:Mark[]=[rect(205,226,10,70,'green',2)];
 m.push(ellipse(178,236,26,8,'green',28),ellipse(242,236,26,8,'green',-28));
 m.push({t:'path',d:'M196 214 C150 204 92 156 94 104 C132 106 184 146 206 206 Z',fill:'purple',w:1.6},{t:'path',d:'M224 214 C270 204 328 156 326 104 C288 106 236 146 214 206 Z',fill:'purple',w:1.6});
 m.push(ellipse(210,222,28,10,'green'),line(194,214,168,130,2.5),line(226,214,252,130,2.5),ellipse(166,120,8,12,'orange',-20),ellipse(254,120,8,12,'orange',20));
 m.push(rect(206,112,8,72,'green',2),ellipse(210,198,20,18,'green'),circle(203,202,3,'white',1),circle(217,202,3,'white',1),circle(210,192,3,'white',1),ellipse(210,106,15,7,'yellow'));
 const tag=(s:string,tx:number,ty:number,px:number,py:number)=>m.push({t:'line',x1:tx+(tx<210?12:-12),y1:ty-5,x2:px,y2:py,w:1.2,c:'muted'},text(tx,ty,s,17,{bold:true}));
 tag('P',40,200,140,162);tag('Q',40,112,158,118);tag('R',382,98,226,104);tag('S',382,194,230,198);tag('T',382,262,254,238);
 return figure(420,300,m,alt);
}
/** Heart, lungs and body with four labelled arrows for the blood's journey. */
export function circulation(alt:string):Visual{
 const m:Mark[]=[...boxed(180,40,'Lungs',{w:200,h:44,fill:'pale'}),...boxed(180,165,'Heart',{w:130,h:44,fill:'red'}),...boxed(180,290,'Body',{w:200,h:44,fill:'pale'})];
 m.push(arrow(130,141,110,66,2.5),arrow(250,66,230,141,2.5),arrow(230,189,250,264,2.5),arrow(110,264,130,189,2.5));
 m.push(text(104,110,'P',18,{bold:true,anchor:'end'}),text(256,110,'Q',18,{bold:true,anchor:'start'}),text(256,234,'R',18,{bold:true,anchor:'start'}),text(104,234,'S',18,{bold:true,anchor:'end'}));
 return figure(360,320,m,alt);
}
/** Four layers of sedimentary rock with fossils, labelled P (top) to S (bottom). */
export function rockLayers(alt:string):Visual{
 const m:Mark[]=[],fills:Fill[]=['yellow','orange','pale','grey'];
 fills.forEach((f,i)=>m.push(rect(20,20+i*50,290,50,f,0,1.6),text(334,52+i*50,'PQRS'[i],18,{bold:true})));
 m.push({t:'path',d:'M68 106 A22 22 0 0 1 112 106 Z',fill:'white',w:1.6});for(const a of [200,235,270,305,340])m.push({t:'line',x1:90,y1:106,x2:r2(90+22*Math.cos(a*Math.PI/180)),y2:r2(106+22*Math.sin(a*Math.PI/180)),w:1});
 m.push(line(176,146,232,146,2),{t:'poly',pts:[176,146,164,137,164,155],fill:'none',w:1.6},circle(238,146,6,'none'));for(let x=184;x<=224;x+=8)m.push(line(x,138,x,154,1.2));
 const spiral:number[]=[];for(let i=0;i<=48;i++){const a=i*Math.PI/8,r=2+i*.27;spiral.push(r2(130+r*Math.cos(a)),r2(196+r*Math.sin(a)));}m.push({t:'poly',pts:spiral,open:true,fill:'none',w:1.8});
 m.push({t:'path',d:'M236 44 C250 30 272 32 280 44 C272 56 250 58 236 44 Z',fill:'green',w:1.4},line(232,44,282,44,1));
 return figure(360,240,m,alt);
}

// ── Light ───────────────────────────────────────────────────────────────────────────────────────────────────
const lamp=(x:number,y:number):Mark[]=>{const m:Mark[]=[circle(x,y,12,'yellow',2)];for(let i=0;i<8;i++){const a=i*Math.PI/4;m.push({t:'line',x1:r2(x+16*Math.cos(a)),y1:r2(y+16*Math.sin(a)),x2:r2(x+22*Math.cos(a)),y2:r2(y+22*Math.sin(a)),w:1.5,c:'orange'});}return m;};
const eye=(x:number,y:number):Mark[]=>[{t:'path',d:`M${x-18} ${y} Q${x} ${y-15} ${x+18} ${y} Q${x} ${y+15} ${x-18} ${y} Z`,fill:'white',w:2},circle(x,y,6,'blue',1.5),circle(x,y,2.5,'black',1)];
const book=(x:number,y:number):Mark[]=>[rect(x-17,y-13,34,26,'red',2,1.8),line(x-12,y-13,x-12,y+13,1.5)];
/** Where each object sits in a ray diagram, for the independent test. */
export const RAY_AT={lamp:[34,34],book:[162,40],eye:[100,108]} as const;
const RAY_LINES:Record<string,[number,number,number,number]>={'lamp>book':[52,36,140,39],'book>eye':[154,56,114,97],'eye>book':[114,97,154,56],'lamp>eye':[46,50,90,97],'book>lamp':[140,39,52,36]};
/** A lamp, a book and an eye, with arrows for the given journeys of light ('lamp>book' …). */
export function rays(paths:string[],alt:string):Visual{
 const m:Mark[]=[...lamp(34,34),...book(162,40),...eye(100,108)];
 for(const p of paths){const [x1,y1,x2,y2]=RAY_LINES[p];m.push(arrow(x1,y1,x2,y2,2.5,'orange'));}
 return figure(200,130,m,alt);
}
/** The helpsheet's ray diagram: a lamp lights an apple, which reflects light into an eye. */
export function seeingApple(alt:string):Visual{
 const m:Mark[]=[...lamp(40,40),circle(210,52,15,'red',2),{t:'path',d:'M210 37 Q214 28 220 26',fill:'none',w:2},...eye(120,120),arrow(62,42,190,50,2.5,'orange'),arrow(200,68,136,110,2.5,'orange'),text(40,80,'lamp',13),text(238,56,'apple',13,{anchor:'start'}),text(120,150,'eye',13)];
 return figure(290,160,m,alt);
}
/** A torch, a puppet and a screen, with an arrow showing the puppet moving towards the torch. */
export function shadowSetup(alt:string):Visual{
 const m:Mark[]=[rect(14,72,46,22,'grey',3),{t:'poly',pts:[60,68,74,60,74,106,60,98],fill:'yellow',w:1.6}];
 m.push({t:'line',x1:76,y1:62,x2:400,y2:18,w:1.2,c:'orange',dash:true},{t:'line',x1:76,y1:104,x2:400,y2:164,w:1.2,c:'orange',dash:true});
 m.push(circle(230,70,10,'black'),{t:'poly',pts:[218,82,242,82,246,118,214,118],fill:'black',w:1.6},line(230,118,230,150,3));
 m.push(rect(400,12,12,156,'white',0,1.6),rect(401,36,10,121,'black',0,0));
 m.push({t:'line',x1:258,y1:176,x2:204,y2:176,w:2.5,arrow:'end',c:'purple'});
 m.push(text(37,120,'torch',13),text(230,196,'puppet',13),text(406,188,'screen',13));
 return figure(440,204,m,alt);
}
/** Where the torch, ball and wall are in the shadow pictures. */
export const SHADOW_AT={torch:[36,60],ball:[100,60,12],wall:176} as const;
/** A torch shining at a ball in front of a wall, with a shadow drawn at (sx, sy). */
export function shadowPicture(sx:number,sy:number,alt:string):Visual{
 const m:Mark[]=[rect(6,52,24,16,'grey',3),{t:'poly',pts:[30,48,36,44,36,76,30,72],fill:'yellow',w:1.5},line(179,4,179,116,3),circle(100,60,12,'blue',2),ellipse(sx,sy,sx>150?3.5:4,sx>150?26:12,'black',0,1)];
 return figure(190,120,m,alt);
}
/** A periscope with its two mirrors labelled, an object to the left of the top opening and an eye at the bottom. */
export function periscope(alt:string):Visual{
 const m:Mark[]=[line(80,40,130,40,2.5),line(130,40,130,170,2.5),line(80,90,80,220,2.5),line(80,220,130,220,2.5)];
 m.push({t:'line',x1:80,y1:40,x2:130,y2:90,w:5,c:'blue'},{t:'line',x1:80,y1:170,x2:130,y2:220,w:5,c:'blue'});
 m.push({t:'poly',pts:[20,62,32,44,44,62],fill:'orange',w:1.6},rect(28,62,8,24,'orange',0,1.4),...eye(172,195));
 m.push(text(140,70,'top mirror',13,{anchor:'start'}),text(70,196,'bottom',13,{anchor:'end'}),text(70,212,'mirror',13,{anchor:'end'}),text(32,104,'object',13));
 return figure(260,240,m,alt);
}

// ── Forces ──────────────────────────────────────────────────────────────────────────────────────────────────
/** A spring force meter from 0 to max newtons with its pointer at reading. */
export function forceMeter(reading:number,alt:string,max=10):Visual{
 const top=44,step=18,bottom=top+max*step,m:Mark[]=[rect(40,14,96,bottom-14+26,'pale',10,1.8),rect(60,top-8,20,max*step+16,'white',3,1.4)];
 for(let v=0;v<=max;v++){const y=top+v*step;m.push(line(80,y,v%2?88:95,y,1.5));if(v%2===0)m.push(text(101,y+5,String(v),14,{anchor:'start'}));}
 m.push(text(118,top-18,'N',14,{bold:true}));
 const yR=top+reading*step,zig:number[]=[70,top-6];for(let y=top-2,k=0;y<yR-4;y+=5,k++)zig.push(k%2?63:77,y);zig.push(70,yR-4);
 m.push({t:'poly',pts:zig,open:true,fill:'none',w:1.2,c:'muted'},{t:'poly',pts:[58,yR-7,80,yR,58,yR+7],fill:'red',w:1.5,c:'red'});
 const hook=bottom+12;m.push(line(70,hook,70,hook+16,2.5),{t:'path',d:`M70 ${hook+16} A7 7 0 1 1 63 ${hook+23}`,fill:'none',w:2.5},{t:'path',d:`M52 ${hook+34} L88 ${hook+34} L96 ${hook+84} L44 ${hook+84} Z`,fill:'orange',w:1.8},line(70,hook+23,70,hook+34,1.5));
 return figure(170,hook+92,m,alt);
}
/** A ball with four arrows pointing up (P), down (Q), left (R) and right (S). */
export function ballArrows(alt:string):Visual{
 const m:Mark[]=[circle(120,112,28,'orange',2),arrow(120,80,120,22,3),arrow(120,144,120,202,3),arrow(88,112,30,112,3),arrow(152,112,210,112,3)];
 m.push(text(136,34,'P',18,{bold:true,anchor:'start'}),text(136,200,'Q',18,{bold:true,anchor:'start'}),text(36,100,'R',18,{bold:true}),text(204,100,'S',18,{bold:true}));
 return figure(240,220,m,alt);
}
/** Where the pivot and the three pushing points are on the lever picture. */
export const LEVER_AT={pivot:120,P:165,Q:280,R:410} as const;
/** A plank on a pivot with a rock on one end and three places to push down. */
export function lever(alt:string):Visual{
 const m:Mark[]=[line(8,170,452,170,2),{t:'poly',pts:[120,122,100,170,140,170],fill:'grey',w:1.8},rect(20,110,420,12,'orange',2,1.8),{t:'poly',pts:[26,110,30,82,50,66,74,70,92,86,95,110],fill:'grey',w:1.8}];
 for(const k of ['P','Q','R'] as const){const x=LEVER_AT[k];m.push({t:'line',x1:x,y1:58,x2:x,y2:104,w:2.5,arrow:'end',c:'purple'},text(x,48,k,18,{bold:true}));}
 m.push(text(120,190,'pivot',13),text(60,58,'rock',13));
 return figure(460,200,m,alt);
}
/** The outline of a gear with the given number of teeth. */
function gear(cx:number,cy:number,r:number,teeth:number,offset:number,fill:Fill):Mark{
 const pts:number[]=[],pitch=360/teeth;
 for(let i=0;i<teeth;i++)for(const [f,rr] of [[-.45,r-6],[-.2,r+6],[.2,r+6],[.45,r-6]] as const){const a=(offset+i*pitch+f*pitch)*Math.PI/180;pts.push(r2(cx+rr*Math.cos(a)),r2(cy+rr*Math.sin(a)));}
 return {t:'poly',pts,fill,w:1.6};
}
/** A large gear (bigTeeth) meshing with a small gear (smallTeeth); the large gear has a clockwise arrow. */
export function gears(bigTeeth:number,smallTeeth:number,alt:string):Visual{
 const R=bigTeeth*10/3,r=smallTeeth*10/3,bx=20+R+6,cy=24+R+6,sx=bx+R+r,m:Mark[]=[gear(bx,cy,R,bigTeeth,0,'yellow'),gear(sx,cy,r,smallTeeth,180+180/smallTeeth,'blue'),circle(bx,cy,6,'black'),circle(sx,cy,5,'black')];
 const ar=R*.68,a1=-150*Math.PI/180,a2=-30*Math.PI/180,ex=r2(bx+ar*Math.cos(a2)),ey=r2(cy+ar*Math.sin(a2)),tx=-Math.sin(a2),ty=Math.cos(a2),nx=Math.cos(a2),ny=Math.sin(a2);
 m.push({t:'path',d:`M${r2(bx+ar*Math.cos(a1))} ${r2(cy+ar*Math.sin(a1))} A${r2(ar)} ${r2(ar)} 0 0 1 ${ex} ${ey}`,fill:'none',w:3,c:'red'},{t:'poly',pts:[r2(ex+tx*9),r2(ey+ty*9),r2(ex-tx*3+nx*7),r2(ey-ty*3+ny*7),r2(ex-tx*3-nx*7),r2(ey-ty*3-ny*7)],fill:'red',w:1,c:'red'});
 m.push(text(bx,cy+R+34,`${bigTeeth} teeth`,15,{bold:true}),text(sx,cy+r+34,`${smallTeeth} teeth`,15,{bold:true}));
 return figure(sx+r+26,cy+R+44,m,alt);
}
/** Two bar magnets end to end; poles lists each magnet's left and right pole. */
export function magnets(poles:[string,string][],alt:string):Visual{
 const m:Mark[]=[];poles.forEach((p,i)=>{const x=16+i*186;p.forEach((s,j)=>m.push(rect(x+j*80,30,80,44,s==='N'?'red':'blue',0,2),text(x+j*80+40,59,s,22,{bold:true})));});
 return figure(390,100,m,alt);
}

// ── Sound ───────────────────────────────────────────────────────────────────────────────────────────────────
/** Identical bottles holding different depths of water, labelled from first (P, Q, R …). */
export function bottles(water:number[],first:string,alt:string):Visual{
 const m:Mark[]=[];water.forEach((h,i)=>{const cx=60+i*90;m.push(rect(cx-26,190-h,52,h,'blue',0,0),{t:'path',d:`M${cx-28} 190 L${cx-28} 86 Q${cx-28} 70 ${cx-12} 66 L${cx-10} 36 L${cx+10} 36 L${cx+12} 66 Q${cx+28} 70 ${cx+28} 86 L${cx+28} 190 Z`,fill:'none',w:2.2},text(cx,214,String.fromCharCode(first.charCodeAt(0)+i),16,{bold:true}));});
 return figure(30+water.length*90,224,m,alt);
}
/** Xylophone bars of the given lengths, labelled from first. */
export function xylophone(lengths:number[],first:string,alt:string):Visual{
 const m:Mark[]=[];lengths.forEach((h,i)=>{const x=30+i*76;m.push(rect(x,95-h/2,40,h,'orange',4,1.8),circle(x+20,95-h/2+10,3,'black',1),circle(x+20,95+h/2-10,3,'black',1),text(x+20,188,String.fromCharCode(first.charCodeAt(0)+i),16,{bold:true}));});
 return figure(40+lengths.length*76,200,m,alt);
}

// ── Earth and space ─────────────────────────────────────────────────────────────────────────────────────────
/** The Earth lit from the left, with people at the given angles (degrees clockwise from the right-hand side). */
export function dayNight(people:[string,number][],alt:string):Visual{
 const cx=270,cy=130,r=80,m:Mark[]=[circle(42,130,34,'yellow',2),text(42,136,'Sun',15,{bold:true})];
 for(const y of [70,130,190])m.push(arrow(86,y,150,y,2,'orange'));
 m.push(circle(cx,cy,r,'blue',2),{t:'path',d:`M${cx} ${cy-r} A${r} ${r} 0 0 1 ${cx} ${cy+r} Z`,fill:'grey',w:2});
 for(const [s,deg] of people){const a=deg*Math.PI/180;m.push(circle(r2(cx+r*Math.cos(a)),r2(cy+r*Math.sin(a)),6,'white',2),text(r2(cx+(r+20)*Math.cos(a)),r2(cy+(r+20)*Math.sin(a)+6),s,17,{bold:true}));}
 return figure(390,260,m,alt);
}
/** The Moon at four places in its orbit, lit from the left; labels give each position's angle. */
export function moonOrbit(places:[string,number][],alt:string):Visual{
 const cx=230,cy=150,R=95,m:Mark[]=[text(40,24,'Sunlight',14,{bold:true,c:'orange'})];
 for(const y of [70,150,230])m.push(arrow(10,y,70,y,2,'orange'));
 m.push({t:'circle',x:cx,y:cy,r:R,fill:'none',w:1.4,dash:true},circle(cx,cy,24,'blue',2),text(cx,cy+5,'Earth',12,{bold:true}));
 for(const [s,deg] of places){const a=deg*Math.PI/180,x=r2(cx+R*Math.cos(a)),y=r2(cy+R*Math.sin(a));m.push(circle(x,y,13,'grey',1.6),{t:'path',d:`M${x} ${y-13} A13 13 0 0 0 ${x} ${y+13} Z`,fill:'white',w:1.6},text(r2(cx+(R+30)*Math.cos(a)),r2(cy+(R+30)*Math.sin(a)+6),s,17,{bold:true}));}
 return figure(390,300,m,alt);
}
/** The Sun, the Earth spinning on its orbit and the Moon going round the Earth. */
export function solarSketch(alt:string):Visual{
 // The Earth's orbit is a circle of radius 180 round the Sun, drawn either side of the Moon's orbit.
 const orbit=(a:number,b:number):Mark=>{const p=(d:number)=>`${r2(70+180*Math.cos(d*Math.PI/180))} ${r2(110+180*Math.sin(d*Math.PI/180))}`;return {t:'path',d:`M${p(a)} A180 180 0 0 1 ${p(b)}`,fill:'none',w:1.4,dash:true};};
 const m:Mark[]=[circle(70,110,36,'yellow',2),text(70,116,'Sun',14,{bold:true}),orbit(-35,-16.5),orbit(16.5,35)];
 m.push({t:'circle',x:250,y:110,r:46,fill:'none',w:1.2,dash:true},circle(250,110,20,'blue',2),text(250,114,'Earth',11,{bold:true}),circle(250,64,7,'white',1.6),text(262,60,'Moon',13,{anchor:'start'}),text(208,208,'Earth’s orbit',12,{anchor:'end',c:'muted'}));
 return figure(340,220,m,alt);
}

// ── Materials and states of matter ──────────────────────────────────────────────────────────────────────────
/** The water cycle with four labelled parts: P rising from the sea, Q at the cloud, R falling rain, S a river. */
export function waterCycle(alt:string):Visual{
 const m:Mark[]=[rect(0,192,210,68,'blue',0,0),{t:'path',d:'M0 192 Q17 184 35 192 T70 192 T105 192 T140 192 T175 192 T210 192',fill:'none',w:2,c:'blue'}];
 m.push({t:'poly',pts:[200,260,200,194,300,92,372,150,440,118,440,260],fill:'green',w:1.8},circle(46,44,22,'yellow',2));
 m.push(...silhouette([circle(226,56,18,'white'),circle(252,46,24,'white'),circle(280,56,18,'white'),ellipse(252,62,44,14,'white')]));
 m.push(arrow(84,184,134,104,2,'blue',true),arrow(124,184,174,100,2,'blue',true),text(92,132,'P',18,{bold:true}));
 m.push({t:'line',x1:324,y1:34,x2:292,y2:44,w:1.2,c:'muted'},text(334,38,'Q',18,{bold:true}));
 for(const x of [234,256,278])m.push({t:'line',x1:x,y1:84,x2:x-8,y2:112,w:2,c:'blue'});m.push(text(214,110,'R',18,{bold:true}));
 m.push({t:'poly',pts:[330,128,300,160,260,176,226,200],open:true,fill:'none',w:3,c:'blue'},arrow(232,196,214,206,3,'blue'),text(262,208,'S',18,{bold:true}));
 return figure(440,260,m,alt);
}
/** Solid, liquid and gas with labelled arrows: P and Q point right above the boxes, R and S point left below. */
export function statesDiagram(alt:string):Visual{
 const m:Mark[]=[...boxed(70,100,'Solid',{w:100,h:44,fill:'pale'}),...boxed(250,100,'Liquid',{w:100,h:44,fill:'pale'}),...boxed(430,100,'Gas',{w:100,h:44,fill:'pale'})];
 m.push(arrow(126,88,194,88,2.5),arrow(306,88,374,88,2.5),arrow(374,112,306,112,2.5),arrow(194,112,126,112,2.5));
 m.push(text(160,76,'P',17,{bold:true}),text(340,76,'Q',17,{bold:true}),text(340,136,'R',17,{bold:true}),text(160,136,'S',17,{bold:true}));
 return figure(500,170,m,alt);
}
/** A funnel lined with filter paper above a beaker. */
export function filterKit(alt:string):Visual{
 const m:Mark[]=[{t:'poly',pts:[70,40,190,40,140,110,140,150,120,150,120,110],fill:'white',w:2},{t:'poly',pts:[80,46,180,46,130,104],fill:'pale',w:1.4,dash:true}];
 m.push({t:'poly',pts:[85,160,85,246,175,246,175,160],open:true,fill:'none',w:2.5},rect(87,216,86,28,'blue',0,0));
 m.push({t:'line',x1:196,y1:58,x2:160,y2:62,w:1.2,c:'muted'},text(200,62,'filter paper',13,{anchor:'start'}),{t:'line',x1:196,y1:128,x2:144,y2:128,w:1.2,c:'muted'},text(200,132,'funnel',13,{anchor:'start'}),{t:'line',x1:196,y1:212,x2:178,y2:212,w:1.2,c:'muted'},text(200,216,'beaker',13,{anchor:'start'}));
 return figure(300,256,m,alt);
}
