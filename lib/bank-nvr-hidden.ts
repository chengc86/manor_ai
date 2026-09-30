import {explain,bullets,type Topic,type Rng} from './bank-kit';
import {tile,line,type Mark,type Visual} from './visual';
import {auditBuild,bold,attempt,setOf,listWords,type Made} from './bank-nvr-kit';
// Hidden shapes: a shape is hidden, at the same size and the same way round, in exactly one of five line pictures.
// The others hide a near-copy (mirrored, turned, stretched or with one corner moved). Every option is searched for the
// shape at every position where a corner could sit, so only the answer contains it.

type Pt=[number,number];type Seg=[number,number,number,number];
const NV='Non-verbal reasoning';
const r2=(n:number)=>Math.round(n*100)/100;
// Target outlines (corners in tile units, roughly 30–40 across). Each is lopsided enough that its flipped, turned and
// stretched copies differ from it by at least 8 units, so no copy can be mistaken for it.
const TARGETS:Record<string,{name:string;pts:number[]}>={
 L:{name:'an L-shape',pts:[0,0,13,0,13,26,34,26,34,40,0,40]},
 flag:{name:'a flag shape',pts:[0,0,30,9,9,19,9,40,0,40]},
 rtrap:{name:'a trapezium',pts:[0,0,19,0,36,30,0,30]},
 zshape:{name:'a Z-shape',pts:[0,0,24,0,24,14,38,14,38,28,12,28,12,14,0,14]},
 tri:{name:'a triangle',pts:[0,34,36,34,9,0]},
 pshape:{name:'a P-shape',pts:[0,0,26,0,26,20,12,20,12,40,0,40]},
 step:{name:'a staircase shape',pts:[0,0,12,0,12,13,25,13,25,26,38,26,38,38,0,38]},
 bolt:{name:'a zigzag shape',pts:[10,0,28,0,20,14,32,14,6,40,14,22,2,22]},
 hook:{name:'a hook shape',pts:[0,0,34,0,34,30,21,30,21,12,0,12]},
 wedge:{name:'a rectangle with one corner cut off',pts:[0,0,22,0,38,20,38,34,0,34]},
};
const pairs=(p:number[]):Pt[]=>{const out:Pt[]=[];for(let i=0;i<p.length;i+=2)out.push([p[i],p[i+1]]);return out;};
const flat=(p:Pt[])=>p.flatMap(([x,y])=>[r2(x),r2(y)]);
const boxOf=(p:Pt[])=>{const xs=p.map(q=>q[0]),ys=p.map(q=>q[1]);return [Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];};
const toOrigin=(p:Pt[]):Pt[]=>{const [a,b]=boxOf(p);return p.map(([x,y])=>[x-a,y-b]);};
/** Near-copies of a shape that a pupil might mistake for it. */
const VARIANTS:Record<string,(p:Pt[],r:Rng)=>Pt[]>={
 mirror:p=>{const [,,c]=boxOf(p);return p.map(([x,y])=>[c-x,y]);},
 flip:p=>{const [,,,d]=boxOf(p);return p.map(([x,y])=>[x,d-y]);},
 turn90:p=>{const [,,,d]=boxOf(p);return toOrigin(p.map(([x,y])=>[d-y,x]));},
 turn180:p=>{const [,,c,d]=boxOf(p);return p.map(([x,y])=>[c-x,d-y]);},
 stretch:(p,r)=>r.chance(.5)?p.map(([x,y])=>[x*1.45,y]):p.map(([x,y])=>[x,y*1.45]),
 corner:(p,r)=>{const i=r.int(0,p.length-1),[dx,dy]=r.pick([[12,0],[-12,0],[0,12],[0,-12]]);return toOrigin(p.map(([x,y],j)=>j===i?[x+dx,y+dy]:[x,y]));},
};
const sameOutline=(a:Pt[],b:Pt[])=>{const A=toOrigin(a),B=toOrigin(b);return A.length===B.length&&A.every(([x,y])=>B.some(([u,v])=>Math.hypot(x-u,y-v)<2));};
/** Outline points every two units along the sides, centred on the middle of the outline's box. */
function outlinePts(p:Pt[]):Pt[]{const [a,b,c,d]=boxOf(p),cx=(a+c)/2,cy=(b+d)/2,out:Pt[]=[];for(const [x1,y1,x2,y2] of edges(p)){const k=Math.max(1,Math.ceil(Math.hypot(x2-x1,y2-y1)/2));for(let j=0;j<k;j++)out.push([x1+(x2-x1)*j/k-cx,y1+(y2-y1)*j/k-cy]);}return out;}
/** Do two outlines (boxes centred on each other) differ somewhere by at least gap units? */
function farApart(a:Pt[],b:Pt[],gap:number){const A=outlinePts(a),B=outlinePts(b);for(const [P,Q] of [[A,B],[B,A]])for(const [x,y] of P){let near=false;for(const [u,v] of Q)if(Math.hypot(x-u,y-v)<gap){near=true;break;}if(!near)return true;}return false;}
function simple(p:Pt[]){const n=p.length;for(let i=0;i<n;i++)for(let j=i+2;j<n;j++){if(i===0&&j===n-1)continue;if(cross(p[i],p[(i+1)%n],p[j],p[(j+1)%n]))return false;}return true;}
function cross(a:Pt,b:Pt,c:Pt,d:Pt){const o=(p:Pt,q:Pt,r:Pt)=>Math.sign((q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]));return o(a,b,c)*o(a,b,d)<0&&o(c,d,a)*o(c,d,b)<0;}
const edges=(p:Pt[]):Seg[]=>p.map((q,i)=>{const n=p[(i+1)%p.length];return [q[0],q[1],n[0],n[1]];});

/** Is the outline (at any position, same size and way round) traced by the segments? */
const EXACT={off:.6,gap:.8};
export function hidesShape(segs:Seg[],shape:Pt[]):boolean{
 const pts:Pt[]=[];for(const s of segs)pts.push([s[0],s[1]],[s[2],s[3]]);
 for(let i=0;i<segs.length;i++)for(let j=i+1;j<segs.length;j++){const p=meet(segs[i],segs[j]);if(p)pts.push(p);}
 const t0=shape[0],E=edges(shape);
 for(const p of pts){const dx=p[0]-t0[0],dy=p[1]-t0[1];if(E.every(e=>covered(segs,[e[0]+dx,e[1]+dy,e[2]+dx,e[3]+dy])))return true;}
 return false;
}
/**
 * Could the shape be traced roughly (sides up to 2.5 units off a drawn line, gaps up to 3 units)? A pupil could defend such
 * a near-miss, so wrong pictures must not contain one. Two sides that are not parallel fix the position: each must lie
 * on the line of a drawn segment running the same way.
 */
export function nearlyHides(segs:Seg[],shape:Pt[],tol={off:2.5,gap:3}):boolean{
 const E=edges(shape),dir=(s:Seg)=>Math.atan2(s[3]-s[1],s[2]-s[0]),len=(s:Seg)=>Math.hypot(s[2]-s[0],s[3]-s[1]);
 const angle=(a:number,b:number)=>{const d=Math.abs(a-b)%Math.PI;return Math.min(d,Math.PI-d);};
 const byLength=[...E].sort((a,b)=>len(b)-len(a)),e1=byLength[0],e2=byLength.find(e=>angle(dir(e),dir(e1))>.35);if(!e2)return false;
 const along=(e:Seg)=>segs.filter(s=>angle(dir(s),dir(e))<.1);
 const normal=(e:Seg):Pt=>{const a=dir(e);return [-Math.sin(a),Math.cos(a)];};
 const n1=normal(e1),n2=normal(e2),det=n1[0]*n2[1]-n1[1]*n2[0];
 for(const s1 of along(e1))for(const s2 of along(e2)){
  // Shift d so both sides land on those lines: n·(side start + d) = n·(segment start).
  const c1=n1[0]*(s1[0]-e1[0])+n1[1]*(s1[1]-e1[1]),c2=n2[0]*(s2[0]-e2[0])+n2[1]*(s2[1]-e2[1]);
  const dx=(c1*n2[1]-c2*n1[1])/det,dy=(n1[0]*c2-n2[0]*c1)/det;
  if(E.every(e=>covered(segs,[e[0]+dx,e[1]+dy,e[2]+dx,e[3]+dy],tol)))return true;}
 return false;
}
function meet(a:Seg,b:Seg):Pt|null{const [x1,y1,x2,y2]=a,[x3,y3,x4,y4]=b,d=(x1-x2)*(y3-y4)-(y1-y2)*(x3-x4);if(Math.abs(d)<1e-9)return null;
 const t=((x1-x3)*(y3-y4)-(y1-y3)*(x3-x4))/d,u=((x1-x3)*(y1-y2)-(y1-y3)*(x1-x2))/d;return t>=-1e-6&&t<=1+1e-6&&u>=-1e-6&&u<=1+1e-6?[x1+t*(x2-x1),y1+t*(y2-y1)]:null;}
/** Is the edge e covered end to end by drawn segments lying along it? */
function covered(segs:Seg[],e:Seg,tol=EXACT){const [ax,ay,bx,by]=e,len=Math.hypot(bx-ax,by-ay),ux=(bx-ax)/len,uy=(by-ay)/len,iv:[number,number][]=[];
 for(const [x1,y1,x2,y2] of segs){const d1=Math.abs((x1-ax)*uy-(y1-ay)*ux),d2=Math.abs((x2-ax)*uy-(y2-ay)*ux);if(d1>tol.off||d2>tol.off)continue;
  const t1=(x1-ax)*ux+(y1-ay)*uy,t2=(x2-ax)*ux+(y2-ay)*uy;iv.push([Math.min(t1,t2),Math.max(t1,t2)]);}
 iv.sort((p,q)=>p[0]-q[0]);let reach=0;for(const [a,b] of iv){if(a>reach+tol.gap)break;reach=Math.max(reach,b);}return reach>=len-tol.gap;}

/** A line picture: the shape placed somewhere, one side carried on to the edge, two long crossing lines and one extra outline. */
function linePicture(r:Rng,shape:Pt[]):{segs:Seg[];at:Pt}|null{
 const [,,w,h]=boxOf(shape);const ox=r.int(14,86-Math.ceil(w)),oy=r.int(14,86-Math.ceil(h)),placed=shape.map(([x,y]):Pt=>[x+ox,y+oy]);
 const segs:Seg[]=edges(placed).map(s=>s.map(r2) as Seg);
 // Carry one side on to the edge of the picture, so the outline does not stand out on its own.
 {const i=r.int(0,segs.length-1),[x1,y1,x2,y2]=segs[i],end=r.chance(.5);const s=end?longLine(x2,y2,x2-x1,y2-y1,true):longLine(x1,y1,x1-x2,y1-y2,true);if(s)segs.push(s);}
 // Two long lines through the shape's area, at clearly different angles.
 // Slanted crossing lines and a slanted triangle: upright and flat clutter too easily makes rough copies of the shape.
 const [bx0,by0,bx1,by1]=boxOf(placed),angles=r.sample([25,40,55,70,110,125,140,155],2);
 for(const a of angles){const px=r.int(Math.round(bx0)+5,Math.round(bx1)-5),py=r.int(Math.round(by0)+5,Math.round(by1)-5),s=longLine(px,py,Math.cos(a*Math.PI/180),Math.sin(a*Math.PI/180),false);if(!s)return null;segs.push(s);}
 // One extra outline overlapping the shape: a rectangle or a triangle with tidy corners.
 const cx=r.int(25,75),cy=r.int(25,75),sw=r.int(14,24),sh=r.int(14,24);
 const extra:Pt[]=[[cx-sw,cy+sh-r.int(4,12)],[cx+sw,cy+sh],[cx+r.int(-sw,sw),cy-sh]];
 if(extra.some(([x,y])=>x<7||x>93||y<7||y>93))return null;segs.push(...edges(extra).map(s=>s.map(r2) as Seg));
 return {segs,at:[ox,oy]};
}
/** The line through (x, y) in direction (dx, dy), clipped to the picture; forward only if oneWay. */
function longLine(x:number,y:number,dx:number,dy:number,oneWay:boolean):Seg|null{const L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L,s=clipSeg([oneWay?x:x-200*ux,oneWay?y:y-200*uy,x+200*ux,y+200*uy]);return s&&Math.hypot(s[2]-s[0],s[3]-s[1])>=6?s:null;}
function clipSeg([x1,y1,x2,y2]:Seg):Seg|null{let t0=0,t1=1;const dx=x2-x1,dy=y2-y1;for(const [p,q] of [[-dx,x1-7],[dx,93-x1],[-dy,y1-7],[dy,93-y1]]){if(p===0){if(q<0)return null;continue;}const t=q/p;if(p<0)t0=Math.max(t0,t);else t1=Math.min(t1,t);}
 if(t0>t1)return null;return [x1+t0*dx,y1+t0*dy,x1+t1*dx,y1+t1*dy].map(r2) as Seg;}
/** Short segments and near-parallel crossings make pictures hard to read; reject them. */
function readable(segs:Seg[]){for(const [x1,y1,x2,y2] of segs)if(Math.hypot(x2-x1,y2-y1)<6)return false;return true;}
const segTile=(segs:Seg[],alt:string):Visual=>tile(segs.map(([x1,y1,x2,y2])=>line(x1,y1,x2,y2,2)),alt);

const hiddenTopic:Topic={id:'nv-hidden-shapes',subject:NV,strand:'Similarities',title:'Hidden shapes',helpsheet:{
 intro:'A shape is hidden inside one of the pictures. It is exactly the same size and the same way round, but other lines cross it.',
 steps:['Pick out something easy to spot on the shape: a sharp corner, a long side, or a notch.','Look for that part in each picture, the same way round.','Trace the whole outline from there. Every side must be there, at the same length and angle.','Reject any picture where the shape is flipped, turned, stretched or has a corner in the wrong place.'],
 example:{title:'Where is the shape hidden?',visual:setOf('row',[
  tile([{t:'poly',pts:[30,30,70,30,70,62,30,62],fill:'grey',w:2.5}],'A grey rectangle'),
  tile([line(18,30,82,30),line(30,18,30,82),line(70,18,70,70),line(18,62,82,62),line(20,85,85,20)],'Lines crossing each other'),
  tile([line(18,30,82,30),line(30,18,30,82),line(62,18,62,70),line(18,62,82,62),line(20,85,85,20)],'Lines crossing each other')],'A shape and two pictures made of lines',{labels:['shape','P','Q']}),
  lines:['The rectangle is 40 units wide and 32 tall.','In P, the lines at the top, bottom, left and right trace a rectangle exactly that size.','In Q the right-hand line is too far in, so the rectangle there is too narrow.']},
 tips:['The shape is never turned or flipped in the answer: check which way its slopes and notches face.','Extra lines may carry on past the shape\'s corners; that is allowed.','Compare lengths carefully: a stretched copy is a common trap.']}};
// The stem uses scale 'options', so the game draws it at exactly the scale of the option tiles on every screen and
// "the same size" is true. 232 units leaves room either side of the shape.
const STEM_W=232;
const HIDDEN_PROMPT=`Which picture has this shape hidden in it? It is ${bold('the same size')} and the same way round.`;
const VARIANT_WORDS:Record<string,string>={mirror:'a mirror image of the shape (flipped left to right)',flip:'the shape flipped over from top to bottom',turn90:'the shape turned a quarter turn',turn180:'the shape turned half a turn',stretch:'a stretched copy of the shape',corner:'a shape with one corner moved'};

function hiddenQuestion(r:Rng,key:string):Made|null{return attempt(300,()=>{
 const t=TARGETS[key],shape=pairs(t.pts);
 const kinds=r.shuffle(Object.keys(VARIANTS)).filter(k=>!(k==='turn180'&&r.chance(.3))),variants:{kind:string;pts:Pt[]}[]=[];
 for(const k of kinds){if(variants.length===4)break;const v=VARIANTS[k](shape,r);if(!simple(v)||sameOutline(v,shape)||!farApart(v,shape,8)||variants.some(u=>sameOutline(u.pts,v))||boxOf(v)[2]>60||boxOf(v)[3]>60)continue;variants.push({kind:k,pts:v});}
 if(variants.length<4)return null;
 const ans=linePicture(r,shape);if(!ans||!readable(ans.segs)||!hidesShape(ans.segs,shape))return null;
 // Wrong pictures must not hide the shape even roughly (a near-miss could be defended as the answer).
 const wrong:{segs:Seg[]}[]=[];for(const v of variants){const w=linePicture(r,v.pts);if(!w||!readable(w.segs)||nearlyHides(w.segs,shape))return null;wrong.push(w);}
 const alt='A picture made of straight lines',pictures=[ans,...wrong].map((p,i)=>({key:String.fromCharCode(97+i),visual:segTile(p.segs,alt)}));
 const [,,w,h]=boxOf(shape),stem:Mark[]=[{t:'poly',pts:flat(shape.map(([x,y]):Pt=>[x+STEM_W/2-w/2,y+50-h/2])),fill:'grey',w:2}];
 return {family:'hidden',rule:{},stem:{shape:t.pts,segs:[ans,...wrong].map(p=>p.segs)},draft:{prompt:HIDDEN_PROMPT,visual:{kind:'figure',w:STEM_W,h:100,marks:stem,alt:`A grey shape with ${shape.length} straight sides`,scale:'options'},
  answer:'a',wrong:['b','c','d','e'],pictures,explanation:explain(
  'Similarities:',bullets('Every picture is made of straight lines crossing each other.'),
  'Rule:',bullets(`Look for ${t.name} with exactly the same side lengths and angles, the same way round.`),
  'Why the answer fits:',bullets('In this picture every side of the shape can be traced, at the right length and angle.'),
  'Red herrings:',bullets(`Instead, the other pictures hide ${listWords([...new Set(variants.map(v=>VARIANT_WORDS[v.kind]))],'or')}.`,'Extra lines crossing the shape do not matter.'))}};
});}
const HIDDEN_ORDER=['L','flag','rtrap','zshape','tri','pshape','step','bolt','hook','wedge'];
export const hiddenShapes=auditBuild(hiddenTopic,20,(r,i)=>hiddenQuestion(r,HIDDEN_ORDER[i%HIDDEN_ORDER.length]),{own:true});
