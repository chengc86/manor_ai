// Question pictures described as data. Generators build them with the question on the server; app/question-visual.tsx
// draws them as SVG on a paper panel. Nothing here may import the question bank: the browser bundles this file.
// Shading for reasoning puzzles uses white, grey, black and patterns, so rules never depend on telling colours apart.
export type Fill='none'|'white'|'grey'|'black'|'stripes'|'dots'|'checks'|'blue'|'green'|'red'|'orange'|'purple'|'yellow'|'pale';
export type Ink='ink'|'muted'|'blue'|'green'|'red'|'orange'|'purple';
export type Mark=
 {t:'line';x1:number;y1:number;x2:number;y2:number;w?:number;dash?:boolean;arrow?:'end'|'both';c?:Ink}
|{t:'poly';pts:number[];fill?:Fill;w?:number;open?:boolean;dash?:boolean;c?:Ink}
|{t:'circle';x:number;y:number;r:number;fill?:Fill;w?:number;dash?:boolean;c?:Ink}
|{t:'ellipse';x:number;y:number;rx:number;ry:number;fill?:Fill;w?:number;dash?:boolean;c?:Ink}
|{t:'rect';x:number;y:number;w:number;h:number;fill?:Fill;r?:number;sw?:number;dash?:boolean;c?:Ink}
|{t:'path';d:string;fill?:Fill;w?:number;dash?:boolean;c?:Ink}
|{t:'text';x:number;y:number;s:string;size?:number;anchor?:'start'|'middle'|'end';bold?:boolean;italic?:boolean;c?:Ink}
|{t:'g';marks:Mark[];x?:number;y?:number;rotate?:number;scale?:number;flip?:'x'|'y'};
export type KeyNode={q:string;yes:KeyNode|string;no:KeyNode|string};
export type Visual=
 // Free drawing in a w × h box: geometry, NVR shapes, circuits, maps. alt describes it for screen readers without giving the answer.
 // scale 'options' draws the question's picture at exactly the scale of its picture options, for "the same size" questions.
 {kind:'figure';w:number;h:number;marks:Mark[];alt:string;scale?:'options'}
 // Evenly spaced ticks numbered from 0. labels and points (such as P) sit under and above tick positions.
|{kind:'numberLine';ticks:number;labels:Record<number,string>;points?:Record<number,string>;alt?:string}
|{kind:'base10';thousands?:number;hundreds?:number;tens?:number;ones?:number;alt?:string}
 // Place value counters, e.g. [{value:'1000',count:2},{value:'10',count:5}].
|{kind:'counters';groups:{value:string;count:number}[];alt?:string}
|{kind:'partWhole';whole:string;parts:string[];alt?:string}
|{kind:'placeValue';columns:string[];rows:string[][];alt?:string}
 // Bar model: each row is a bar split into parts sized in proportion; shade marks the part asked about.
|{kind:'barModel';rows:{label?:string;parts:{text:string;size:number;shade?:boolean}[]}[];total?:string;alt?:string}
|{kind:'cards';cards:{text:string;caption?:string}[];alt?:string}
 // Two pictures with a box between them, for <, = or >.
|{kind:'compare';left:Visual;right:Visual;alt?:string}
|{kind:'clock';h:number;m:number;alt?:string}
|{kind:'table';head?:string[];rows:string[][];caption?:string;alt?:string}
|{kind:'chart';type:'bar'|'line';title?:string;x?:string;y?:string;labels:string[];values:number[];max:number;step:number;alt?:string}
 // Each row shows count icons; halves and quarters are allowed. key says what one icon is worth.
|{kind:'pictogram';icon:'circle'|'star'|'square'|'heart';value:number;rows:{label:string;count:number}[];alt?:string}
|{kind:'pie';slices:{label:string;value:number}[];alt?:string}
 // Branching (dichotomous) key: follow yes and no from the top question to a name.
|{kind:'key';root:KeyNode;alt?:string}
 // Several pictures laid out together. null draws a '?' box. labels caption each item (A, B, 1, 2 …).
 // row: a line of pictures · sequence: a row with arrows · oval: a group inside an ellipse · pair: two pictures in a bracket
 // analogy: [a, b, c, null] drawn as a → b : c → ? · grid: rows of cols (a matrix)
|{kind:'set';layout:'row'|'sequence'|'oval'|'pair'|'analogy'|'grid';items:(Visual|null)[];cols?:number;labels?:string[];alt?:string};
export type VisualKind=Visual['kind'];
export const VISUAL_KINDS:VisualKind[]=['figure','numberLine','base10','counters','partWhole','placeValue','barModel','cards','compare','clock','table','chart','pictogram','pie','key','set'];

// Drawing helpers for generators. Coordinates are in the figure's own units; y grows downwards.
const r2=(n:number)=>Math.round(n*100)/100;
/** Corners of a regular polygon centred on (x, y), first corner straight up, then rotated clockwise by rotate degrees. */
export function polygonPoints(sides:number,x:number,y:number,radius:number,rotate=0){const pts:number[]=[];for(let i=0;i<sides;i++){const a=(rotate+i*360/sides-90)*Math.PI/180;pts.push(r2(x+radius*Math.cos(a)),r2(y+radius*Math.sin(a)));}return pts;}
export function starPoints(points:number,x:number,y:number,outer:number,inner:number,rotate=0){const pts:number[]=[];for(let i=0;i<points*2;i++){const r=i%2?inner:outer,a=(rotate+i*180/points-90)*Math.PI/180;pts.push(r2(x+r*Math.cos(a)),r2(y+r*Math.sin(a)));}return pts;}
export type ShapeName='circle'|'triangle'|'square'|'rectangle'|'pentagon'|'hexagon'|'heptagon'|'octagon'|'star'|'cross'|'arrow'|'heart'|'diamond'|'semicircle'|'kite'|'trapezium'|'parallelogram'|'crescent'|'teardrop';
/** Straight sides each named shape has (a circle has none). */
export const SHAPE_SIDES:Record<ShapeName,number>={circle:0,triangle:3,square:4,rectangle:4,pentagon:5,hexagon:6,heptagon:7,octagon:8,star:10,cross:12,arrow:7,heart:0,diamond:4,semicircle:1,kite:4,trapezium:4,parallelogram:4,crescent:0,teardrop:0};
/** The outline of a named shape centred on (0, 0), about 2 × s across, before it is placed. */
function outline(name:ShapeName,s:number,fill:Fill,w:number,dash?:boolean):Mark{
 const poly=(pts:number[]):Mark=>({t:'poly',pts:pts.map(r2),fill,w,dash}),path=(d:string):Mark=>({t:'path',d,fill,w,dash});
 switch(name){
  case 'circle':return {t:'circle',x:0,y:0,r:s,fill,w,dash};
  case 'triangle':return poly(polygonPoints(3,0,s*.18,s*1.12));
  case 'square':return poly(polygonPoints(4,0,0,s*1.27,45));
  case 'pentagon':return poly(polygonPoints(5,0,s*.05,s*1.05));
  case 'hexagon':return poly(polygonPoints(6,0,0,s));
  case 'heptagon':return poly(polygonPoints(7,0,0,s));
  case 'octagon':return poly(polygonPoints(8,0,0,s,22.5));
  case 'star':return poly(starPoints(5,0,s*.08,s*1.1,s*.45));
  case 'diamond':return poly(polygonPoints(4,0,0,s*1.1));
  case 'rectangle':return poly([-s*1.2,-s*.7,s*1.2,-s*.7,s*1.2,s*.7,-s*1.2,s*.7]);
  case 'kite':return poly([0,-s*1.1,s*.7,-s*.3,0,s*1.1,-s*.7,-s*.3]);
  case 'trapezium':return poly([-s*.6,-s*.65,s*.6,-s*.65,s*1.1,s*.65,-s*1.1,s*.65]);
  case 'parallelogram':return poly([-s*.6,-s*.65,s*1.15,-s*.65,s*.6,s*.65,-s*1.15,s*.65]);
  case 'cross':{const a=s*.36,b=s;return poly([-a,-b,a,-b,a,-a,b,-a,b,a,a,a,a,b,-a,b,-a,a,-b,a,-b,-a,-a,-a]);}
  case 'arrow':return poly([-s,-s*.3,s*.15,-s*.3,s*.15,-s*.75,s,0,s*.15,s*.75,s*.15,s*.3,-s,s*.3]);
  case 'semicircle':return path(`M${r2(-s)} ${r2(s*.45)} A${r2(s)} ${r2(s)} 0 0 1 ${r2(s)} ${r2(s*.45)} Z`);
  case 'heart':return path(`M0 ${r2(s*.95)} C${r2(-s*1.5)} 0 ${r2(-s*.7)} ${r2(-s*1.15)} 0 ${r2(-s*.45)} C${r2(s*.7)} ${r2(-s*1.15)} ${r2(s*1.5)} 0 0 ${r2(s*.95)} Z`);
  case 'crescent':return path(`M${r2(s*.2)} ${r2(-s)} A${r2(s)} ${r2(s)} 0 1 0 ${r2(s*.2)} ${r2(s)} A${r2(s*.75)} ${r2(s*.95)} 0 1 1 ${r2(s*.2)} ${r2(-s)} Z`);
  case 'teardrop':return path(`M0 ${r2(-s*1.1)} C${r2(s*.2)} ${r2(-s*.6)} ${r2(s)} 0 ${r2(s*.75)} ${r2(s*.55)} A${r2(s*.8)} ${r2(s*.8)} 0 1 1 ${r2(-s*.75)} ${r2(s*.55)} C${r2(-s)} 0 ${r2(-s*.2)} ${r2(-s*.6)} 0 ${r2(-s*1.1)} Z`);
 }
}
/** One shape centred on (x, y), about 2 × size across, turned clockwise by rotate degrees and optionally mirrored. */
export function shape(name:ShapeName,o:{x:number;y:number;size:number;rotate?:number;flip?:'x'|'y';fill?:Fill;w?:number;dash?:boolean}):Mark{
 return {t:'g',x:o.x,y:o.y,rotate:o.rotate||undefined,flip:o.flip,marks:[outline(name,o.size,o.fill??'white',o.w??2,o.dash)]};
}
/** Marks turned, mirrored or scaled about the point (x, y): mirror 'x' swaps left and right, 'y' swaps top and bottom. */
export function transform(marks:Mark[],o:{x:number;y:number;rotate?:number;flip?:'x'|'y';scale?:number}):Mark{return {t:'g',x:o.x,y:o.y,rotate:o.rotate||undefined,flip:o.flip,scale:o.scale,marks:[{t:'g',x:-o.x,y:-o.y,marks}]};}
/** A small solid dot. */
export const dot=(x:number,y:number,r=4,fill:Fill='black'):Mark=>({t:'circle',x,y,r,fill,w:1});
export const line=(x1:number,y1:number,x2:number,y2:number,w=2,dash=false):Mark=>({t:'line',x1,y1,x2,y2,w,dash});
export const label=(x:number,y:number,s:string,size=14,o:{bold?:boolean;anchor?:'start'|'middle'|'end';c?:Ink;italic?:boolean}={}):Mark=>({t:'text',x,y,s,size,anchor:o.anchor??'middle',bold:o.bold,italic:o.italic,c:o.c});
/** A square NVR tile (default 100 × 100) holding the given marks, with an accessible description. */
export const tile=(marks:Mark[],alt:string,size=100):Visual=>({kind:'figure',w:size,h:size,marks,alt});
/** A small arc showing an angle at (x, y) between two directions in degrees (0 = right, 90 = down, clockwise). */
export function angleArc(x:number,y:number,from:number,to:number,radius=18):Mark{const a=from*Math.PI/180,b=to*Math.PI/180,large=((to-from+360)%360)>180?1:0;return {t:'path',d:`M${r2(x+radius*Math.cos(a))} ${r2(y+radius*Math.sin(a))} A${radius} ${radius} 0 ${large} 1 ${r2(x+radius*Math.cos(b))} ${r2(y+radius*Math.sin(b))}`,fill:'none',w:1.5};}
/** A right-angle square in the corner at (x, y) between two perpendicular directions in degrees. */
export function rightAngle(x:number,y:number,from:number,size=10):Mark{const a=from*Math.PI/180,b=(from+90)*Math.PI/180;return {t:'poly',open:true,w:1.5,fill:'none',pts:[r2(x+size*Math.cos(a)),r2(y+size*Math.sin(a)),r2(x+size*(Math.cos(a)+Math.cos(b))),r2(y+size*(Math.sin(a)+Math.sin(b))),r2(x+size*Math.cos(b)),r2(y+size*Math.sin(b))]};}
/** Circuit symbols drawn horizontally, centred on (x, y) and about 40 units wide. Rotate with transform() for vertical wires. */
export function circuitSymbol(kind:'cell'|'battery'|'bulb'|'switchOpen'|'switchClosed'|'buzzer'|'motor'|'wire',x:number,y:number):Mark[]{
 const w=(x1:number,x2:number):Mark=>line(x+x1,y,x+x2,y,2);
 switch(kind){
  case 'wire':return [w(-20,20)];
  case 'cell':return [w(-20,-4),line(x-4,y-14,x-4,y+14,2),line(x+4,y-8,x+4,y+8,4),w(4,20)];
  case 'battery':return [w(-20,-10),line(x-10,y-14,x-10,y+14,2),line(x-4,y-8,x-4,y+8,4),line(x+4,y-14,x+4,y+14,2),line(x+10,y-8,x+10,y+8,4),w(10,20)];
  case 'bulb':return [w(-20,-10),w(10,20),{t:'circle',x,y,r:10,fill:'white',w:2},line(x-7,y-7,x+7,y+7,1.5),line(x-7,y+7,x+7,y-7,1.5)];
  case 'switchOpen':return [w(-20,-10),dot(x-10,y,2.5),line(x-10,y,x+8,y-10,2),dot(x+10,y,2.5),w(10,20)];
  case 'switchClosed':return [w(-20,-10),dot(x-10,y,2.5),line(x-10,y,x+10,y,2),dot(x+10,y,2.5),w(10,20)];
  case 'buzzer':return [w(-20,-8),w(8,20),{t:'path',d:`M${x-8} ${y} L${x-8} ${y-10} A8 8 0 0 1 ${x+8} ${y-10} L${x+8} ${y}`,fill:'white',w:2}];
  case 'motor':return [w(-20,-10),w(10,20),{t:'circle',x,y,r:10,fill:'white',w:2},label(x,y+5,'M',13,{bold:true})];
 }
}
/** Every text string inside a visual, used by tests to check for broken values such as NaN or undefined. */
export function visualText(v:Visual|null|undefined):string[]{
 if(!v)return [];const out:string[]=[v.alt??''];
 const marks=(ms:Mark[]):void=>ms.forEach(m=>m.t==='text'?out.push(m.s):m.t==='g'?marks(m.marks):undefined);
 const keys=(n:KeyNode|string):void=>{if(typeof n==='string'){out.push(n);return;}out.push(n.q);keys(n.yes);keys(n.no);};
 switch(v.kind){
  case 'figure':marks(v.marks);break;
  case 'numberLine':out.push(...Object.values(v.labels),...Object.values(v.points??{}));break;
  case 'counters':out.push(...v.groups.map(g=>g.value));break;
  case 'partWhole':out.push(v.whole,...v.parts);break;
  case 'placeValue':out.push(...v.columns,...v.rows.flat());break;
  case 'barModel':out.push(...v.rows.flatMap(r=>[r.label??'',...r.parts.map(p=>p.text)]),v.total??'');break;
  case 'cards':out.push(...v.cards.flatMap(c=>[c.text,c.caption??'']));break;
  case 'compare':out.push(...visualText(v.left),...visualText(v.right));break;
  case 'table':out.push(...(v.head??[]),...v.rows.flat(),v.caption??'');break;
  case 'chart':out.push(v.title??'',v.x??'',v.y??'',...v.labels);break;
  case 'pictogram':out.push(...v.rows.map(r=>r.label));break;
  case 'pie':out.push(...v.slices.map(s=>s.label));break;
  case 'key':keys(v.root);break;
  case 'set':out.push(...(v.labels??[]),...v.items.flatMap(i=>visualText(i)));break;
 }
 return out;
}
