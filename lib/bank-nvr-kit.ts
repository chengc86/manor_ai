import {shape,dot,line,tile,type Mark,type Fill,type ShapeName,type Visual} from './visual';
import {build,rng,type Topic,type Draft,type Rng,type BuiltTopic} from './bank-kit';
// Non-verbal reasoning toolkit. Every NVR picture is drawn from a feature model (a list of parts: shapes, dots and
// lines with position, size, turn, mirror and shading). Rules are applied to the model, never to the drawing, and
// the model is kept for each question in nvrAudit so tests/bank-nvr.cjs can re-check every puzzle independently.

export type Shade='white'|'grey'|'black'|'stripes'|'dots'|'checks';
export const SHADE_WORD:Record<Shade,string>={white:'white',grey:'grey',black:'black',stripes:'striped',dots:'dotted',checks:'chequered'};

// ---------------------------------------------------------------- shapes
// Extra outlines drawn as polygons, in units where the shape spans about −1…1 (like shape(): about 2 × size across).
const CUSTOM:Record<string,{name:string;pts:number[]}>={
 rtri:{name:'right-angled triangle',pts:[-.9,.65,.9,.65,-.9,-.65]},
 isotri:{name:'tall triangle',pts:[0,-1,.55,.9,-.55,.9]},
 obtri:{name:'wide triangle',pts:[-1,.3,1,.3,-.3,-.3]},
 rtrap:{name:'right-angled trapezium',pts:[-.8,-.65,.3,-.65,.9,.65,-.8,.65]},
 quad:{name:'four-sided shape',pts:[-.29,.91,.95,.91,.42,-.54,-.95,-.91]},
 house:{name:'house-shaped pentagon',pts:[0,-.95,.9,-.35,.9,.9,-.9,.9,-.9,-.35]},
 pent3:{name:'five-sided shape',pts:[-.95,.87,.37,.87,.95,.04,.31,-.87,-.52,-.73]},
 lshape:{name:'L-shape',pts:[-.8,-.95,-.15,-.95,-.15,.35,.85,.35,.85,.95,-.8,.95]},
 chevron:{name:'arrowhead',pts:[0,-.95,.95,.55,.55,.95,0,.2,-.55,.95,-.95,.55]},
 tshape:{name:'T-shape',pts:[-.95,-.85,.95,-.85,.95,-.3,.28,-.3,.28,.95,-.28,.95,-.28,-.3,-.95,-.3]},
 flag:{name:'flag',pts:[-.7,-.95,.85,-.55,-.4,-.1,-.4,.95,-.7,.95]},
};
export type ShapeKey=ShapeName|keyof typeof CUSTOM;
type M2=[number,number,number,number];// [a,b,c,d] = [[a,b],[c,d]] acting on column vectors (x,y)
export type ShapeInfo={key:ShapeKey;name:string;sides:number;curved:boolean;right:boolean;regular:boolean;convex:boolean;
 /** Has a corner close to, but not exactly, a right angle (a pupil might read it either way). */
 nearRight:boolean;
 /** Lines of symmetry and order of turning symmetry of the outline itself (about its own centre). */
 mirrors:number;turns:number;
 /** Outline corners (size 1, relative to the part's anchor) and the centre of the outline's box. */
 pts:number[];cx:number;cy:number;named:boolean};
const r2=(n:number)=>Math.round(n*100)/100;
const matRot=(deg:number):M2=>{const a=deg*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return [c,-s,s,c];};
const matMir=(axisDeg:number):M2=>{const a=2*axisDeg*Math.PI/180;return [Math.cos(a),Math.sin(a),Math.sin(a),-Math.cos(a)];};
const mul=(p:M2,q:M2):M2=>[p[0]*q[0]+p[1]*q[2],p[0]*q[1]+p[1]*q[3],p[2]*q[0]+p[3]*q[2],p[2]*q[1]+p[3]*q[3]];
const tr=(p:M2):M2=>[p[0],p[2],p[1],p[3]];
const near=(p:M2,q:M2,tol=.03)=>p.every((v,i)=>Math.abs(v-q[i])<tol);
const apply=(m:M2,x:number,y:number):[number,number]=>[m[0]*x+m[1]*y,m[2]*x+m[3]*y];
/** Does the transform m map the point set onto itself (to within tol, in size-1 units)? */
function keeps(pts:number[],m:M2,tol=.09){for(let i=0;i<pts.length;i+=2){const [x,y]=apply(m,pts[i],pts[i+1]);let ok=false;for(let j=0;j<pts.length;j+=2)if(Math.hypot(pts[j]-x,pts[j+1]-y)<tol){ok=true;break;}if(!ok)return false;}return true;}
function wind(pts:number[]){let s=0;const n=pts.length/2;for(let i=0;i<n;i++){const j=(i+1)%n;s+=pts[2*i]*pts[2*j+1]-pts[2*j]*pts[2*i+1];}return Math.sign(s);}
/** Interior angles of a polygon in degrees. */
function angles(pts:number[]){const n=pts.length/2,w=wind(pts),out:number[]=[];for(let i=0;i<n;i++){const p=(i+n-1)%n,q=(i+1)%n,[px,py,x,y,nx,ny]=[pts[2*p],pts[2*p+1],pts[2*i],pts[2*i+1],pts[2*q],pts[2*q+1]];
 let d=Math.abs(Math.atan2(py-y,px-x)-Math.atan2(ny-y,nx-x))*180/Math.PI;if(d>180)d=360-d;const cross=(x-px)*(ny-y)-(y-py)*(nx-x);out.push(cross*w<0?360-d:d);}return out;}
/** Symmetry of an outline about the centre of its corners: [lines of symmetry, order of turning symmetry]. */
export function symmetry(pts:number[],tol=.045):[number,number]{const n=pts.length/2,mx=pts.filter((_,i)=>i%2===0).reduce((a,b)=>a+b,0)/n,my=pts.filter((_,i)=>i%2===1).reduce((a,b)=>a+b,0)/n,c=pts.map((v,i)=>v-(i%2?my:mx));
 let turns=1;for(let k=2;k<=12;k++)if(keeps(c,matRot(360/k),tol))turns=k;
 // A mirror line passes through the centre and a corner or the middle of a side.
 const axes:number[]=[];for(let i=0;i<n;i++){const j=(i+1)%n;for(const [x,y] of [[c[2*i],c[2*i+1]],[(c[2*i]+c[2*j])/2,(c[2*i+1]+c[2*j+1])/2]]){const a=((Math.atan2(y,x)*180/Math.PI)%180+180)%180;if(!axes.some(b=>Math.min(Math.abs(a-b),180-Math.abs(a-b))<1))axes.push(a);}}
 return [axes.filter(a=>keeps(c,matMir(a),tol)).length,turns];}
function makeInfo(key:ShapeKey,name:string,pts:number[],named:boolean):ShapeInfo{
 const xs=pts.filter((_,i)=>i%2===0),ys=pts.filter((_,i)=>i%2===1),ang=angles(pts),n=pts.length/2,[mirrors,turns]=symmetry(pts);
 const edges=Array.from({length:n},(_,i)=>Math.hypot(pts[(2*i+2)%(2*n)]-pts[2*i],pts[(2*i+3)%(2*n)]-pts[2*i+1]));
 return {key,name,sides:n,curved:false,right:ang.some(a=>Math.abs(a-90)<3),nearRight:ang.some(a=>Math.abs(a-90)>=3&&Math.abs(a-90)<=12),regular:Math.max(...edges)/Math.min(...edges)<1.04&&Math.max(...ang)-Math.min(...ang)<3,
  convex:ang.every(a=>a<180),mirrors,turns,pts,cx:(Math.min(...xs)+Math.max(...xs))/2,cy:(Math.min(...ys)+Math.max(...ys))/2,named};
}
function curved(key:ShapeKey,sides:number,pts:number[],mirrors:number,turns:number):ShapeInfo{const xs=pts.filter((_,i)=>i%2===0),ys=pts.filter((_,i)=>i%2===1);
 return {key,name:key,sides,curved:true,right:false,nearRight:false,regular:false,convex:key!=='heart',mirrors,turns,pts:pts.map(r2),cx:(Math.min(...xs)+Math.max(...xs))/2,cy:(Math.min(...ys)+Math.max(...ys))/2,named:true};}
const cubic=(p:number[],steps:number)=>Array.from({length:steps},(_,k)=>{const t=k/steps,u=1-t;return [u*u*u*p[0]+3*u*u*t*p[2]+3*u*t*t*p[4]+t*t*t*p[6],u*u*u*p[1]+3*u*u*t*p[3]+3*u*t*t*p[5]+t*t*t*p[7]];}).flat();
const NAMED:ShapeName[]=['triangle','square','rectangle','pentagon','hexagon','heptagon','octagon','star','cross','arrow','diamond','kite','trapezium','parallelogram'];
export const SHAPES:Record<string,ShapeInfo>={};
for(const n of NAMED){const g=shape(n,{x:0,y:0,size:1}) as Extract<Mark,{t:'g'}>,o=g.marks[0] as Extract<Mark,{t:'poly'}>;SHAPES[n]=makeInfo(n,n,o.pts,true);}
for(const [k,v] of Object.entries(CUSTOM))SHAPES[k]=makeInfo(k as ShapeKey,v.name,v.pts,false);
// Curved outlines, sampled as polygons for boxes, containment and comparison. Circles match any turn or mirror.
SHAPES.circle=curved('circle',0,Array.from({length:36},(_,i)=>[Math.cos(i*Math.PI/18),Math.sin(i*Math.PI/18)]).flat(),99,99);
SHAPES.semicircle=curved('semicircle',1,Array.from({length:19},(_,i)=>[-Math.cos(i*Math.PI/18),.45-Math.sin(i*Math.PI/18)]).flat(),1,1);
SHAPES.heart=curved('heart',0,[...cubic([0,.95,-1.5,0,-.7,-1.15,0,-.45],12),...cubic([0,-.45,.7,-1.15,1.5,0,0,.95],12)],1,1);
export const info=(k:string)=>{const i=SHAPES[k];if(!i)throw new Error('unknown shape '+k);return i;};

// ---------------------------------------------------------------- parts and pictures
export type ShapePart={k:'shape';s:ShapeKey;x:number;y:number;size:number;rot?:number;flip?:boolean;fill?:Shade;dash?:boolean};
export type DotPart={k:'dot';x:number;y:number;r?:number;fill?:Shade};
export type LinePart={k:'line';x1:number;y1:number;x2:number;y2:number;w?:number;dash?:boolean};
export type Part=ShapePart|DotPart|LinePart;
export type Pic=Part[];
export const S=(s:ShapeKey,x:number,y:number,size:number,fill:Shade='white',rot=0,flip=false):ShapePart=>({k:'shape',s,x:r2(x),y:r2(y),size:r2(size),fill,...(norm(rot)?{rot:norm(rot)}:{}),...(flip?{flip:true}:{})});
export const D=(x:number,y:number,fill:Shade='black',r=4.5):DotPart=>({k:'dot',x:r2(x),y:r2(y),r,fill});
export const L=(x1:number,y1:number,x2:number,y2:number,w=2.5):LinePart=>({k:'line',x1:r2(x1),y1:r2(y1),x2:r2(x2),y2:r2(y2),w});
export const norm=(a:number)=>r2(((a%360)+360)%360)%360;

export function drawPart(p:Part):Mark{
 if(p.k==='dot')return dot(p.x,p.y,p.r??4.5,p.fill??'black');
 if(p.k==='line')return line(p.x1,p.y1,p.x2,p.y2,p.w??2.5,!!p.dash);
 const i=info(p.s),fill:Fill=p.fill??'white';
 if(i.named)return shape(p.s as ShapeName,{x:p.x,y:p.y,size:p.size,rotate:p.rot,flip:p.flip?'x':undefined,fill,dash:p.dash});
 return {t:'g',x:p.x,y:p.y,rotate:p.rot||undefined,flip:p.flip?'x':undefined,marks:[{t:'poly',pts:i.pts.map(v=>r2(v*p.size)),fill,w:2,...(p.dash?{dash:true}:{})}]};
}
export const drawPic=(pic:Pic):Mark[]=>pic.map(drawPart);
/** A light frame round a tile, so pictures in an oval (which has no boxes) do not run into each other. */
export const FRAME:Mark={t:'rect',x:1.5,y:1.5,w:97,h:97,r:10,fill:'none',sw:1.2,c:'muted'};
/** A 100 × 100 tile drawn from a picture model. */
export const picTile=(pic:Pic,alt=describe(pic),framed=false):Visual=>tile(framed?[FRAME,...drawPic(pic)]:drawPic(pic),alt);

/** The matrix taking a part's outline (size 1) to its drawn direction: turn × mirror. */
const partMat=(p:ShapePart):M2=>p.flip?mul(matRot(p.rot??0),[-1,0,0,1]):matRot(p.rot??0);
/** Corners of a shape part as drawn (in tile units). */
const CORNERS=new WeakMap<ShapePart,number[]>();
export function corners(p:ShapePart):number[]{const hit=CORNERS.get(p);if(hit)return hit;const i=info(p.s),m=partMat(p),out:number[]=[];for(let k=0;k<i.pts.length;k+=2){const [x,y]=apply(m,i.pts[k]*p.size,i.pts[k+1]*p.size);out.push(r2(p.x+x),r2(p.y+y));}CORNERS.set(p,out);return out;}
/** The middle of a shape part's outline box, as drawn. */
export function centreOf(p:ShapePart):[number,number]{const i=info(p.s),[x,y]=apply(partMat(p),i.cx*p.size,i.cy*p.size);return [p.x+x,p.y+y];}
/** The centre of a shape part's area, as drawn (where a small shape or dots inside it look centred). */
export function areaCentre(p:ShapePart):[number,number]{if(p.s==='circle')return [p.x,p.y];const c=corners(p),n=c.length/2;let A=0,X=0,Y=0;
 for(let i=0;i<n;i++){const j=(i+1)%n,k=c[2*i]*c[2*j+1]-c[2*j]*c[2*i+1];A+=k;X+=(c[2*i]+c[2*j])*k;Y+=(c[2*i+1]+c[2*j+1])*k;}return [r2(X/(3*A)),r2(Y/(3*A))];}
/** Area of a shape part as drawn. */
export function areaOf(p:ShapePart){if(p.s==='circle')return Math.PI*p.size*p.size;const c=corners(p),n=c.length/2;let A=0;for(let i=0;i<n;i++){const j=(i+1)%n;A+=c[2*i]*c[2*j+1]-c[2*j]*c[2*i+1];}return Math.abs(A)/2;}
/** How a pupil would compare two shapes' sizes; null when the difference is too close to call. */
export function sizeRel(a:ShapePart,b:ShapePart):'bigger'|'smaller'|'similar'|null{const k=areaOf(a)/areaOf(b);return k>=1.6?'bigger':k<=1/1.6?'smaller':k<=1.15&&k>=1/1.15?'similar':null;}
const UNIT_AREA=new Map<string,number>();
export const unitArea=(k:ShapeKey)=>{let a=UNIT_AREA.get(k);if(a===undefined){a=areaOf({k:'shape',s:k,x:0,y:0,size:10})/100;UNIT_AREA.set(k,a);}return a;};
/** Size that gives a shape the stated area (so different shapes look equally big). */
export const sizeForArea=(k:ShapeKey,area:number)=>Math.round(Math.sqrt(area/unitArea(k))*100)/100;
/** Sizes for two shapes so the first looks clearly bigger (rel 1), about the same (0) or clearly smaller (−1). */
export function pairSizes(a:ShapeKey,b:ShapeKey,rel:number):[number,number]{const k=Math.sqrt(unitArea(a)/unitArea(b));
 // Big enough that the sides of even the smaller shape are easy to count at tile size.
 if(rel===0){const sa=18,sb=18*k,m=Math.max(sa,sb)/20;return m>1?[sa/m,sb/m]:[sa,sb];}
 const big=rel>0?a:b,small=rel>0?b:a,ratio=Math.sqrt(unitArea(big)/(2.2*unitArea(small))),sBig=21,sSmall=Math.max(14,sBig*ratio);
 return rel>0?[sBig,sSmall]:[sSmall,sBig];}
/** Where shape a sits compared with shape b, as a pupil would say it (left/right, above/below). */
export function placeWords(a:ShapePart,b:ShapePart){const [ax,ay]=areaCentre(a),[bx,by]=areaCentre(b);return [ax<bx-8?'left':ax>bx+8?'right':'level',ay<by-8?'above':ay>by+8?'below':'level'];}
/** The part moved so that its area centre is at (x, y). */
export function centreAt(p:ShapePart,x:number,y:number):ShapePart{const [cx,cy]=areaCentre(p);return {...p,x:r2(p.x+x-cx),y:r2(p.y+y-cy)};}
/** Right-angle feature for fairness checks: 'maybe' when a corner is nearly, but not exactly, square. */
export const rightWord=(k:ShapeKey)=>info(k).right?'yes':info(k).nearRight?'maybe':'no';
/** Is (x, y) inside the shape part, at least margin away from its outline? */
export function inside(p:ShapePart,x:number,y:number,margin=0){
 if(p.s==='circle')return Math.hypot(x-p.x,y-p.y)<=p.size-margin;
 const c=corners(p),n=c.length/2;let inn=false;
 for(let i=0,j=n-1;i<n;j=i++){const [xi,yi,xj,yj]=[c[2*i],c[2*i+1],c[2*j],c[2*j+1]];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inn=!inn;}
 if(!inn)return false;for(let i=0,j=n-1;i<n;j=i++)if(segDist(x,y,c[2*j],c[2*j+1],c[2*i],c[2*i+1])<margin)return false;return true;
}
export function segDist(px:number,py:number,ax:number,ay:number,bx:number,by:number){const dx=bx-ax,dy=by-ay,l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/l)):0;return Math.hypot(px-ax-t*dx,py-ay-t*dy);}
const orient=(ax:number,ay:number,bx:number,by:number,cx:number,cy:number)=>Math.sign((bx-ax)*(cy-ay)-(by-ay)*(cx-ax));
const crosses=(s:number[],t:number[])=>orient(s[0],s[1],s[2],s[3],t[0],t[1])*orient(s[0],s[1],s[2],s[3],t[2],t[3])<0&&orient(t[0],t[1],t[2],t[3],s[0],s[1])*orient(t[0],t[1],t[2],t[3],s[2],s[3])<0;
const segSeg=(s:number[],t:number[])=>crosses(s,t)?0:Math.min(segDist(s[0],s[1],t[0],t[1],t[2],t[3]),segDist(s[2],s[3],t[0],t[1],t[2],t[3]),segDist(t[0],t[1],s[0],s[1],s[2],s[3]),segDist(t[2],t[3],s[0],s[1],s[2],s[3]));
/** A part as edges plus a thickness: a dot or circle is its centre padded by its radius, a line is padded by half its width. */
function partGeo(p:Part):{segs:number[][];pad:number;poly?:ShapePart}{
 if(p.k==='dot')return {segs:[[p.x,p.y,p.x,p.y]],pad:p.r??4.5};
 if(p.k==='line')return {segs:[[p.x1,p.y1,p.x2,p.y2]],pad:(p.w??2.5)/2};
 if(p.s==='circle')return {segs:[[p.x,p.y,p.x,p.y]],pad:p.size};
 const c=corners(p),n=c.length/2,segs:number[][]=[];for(let i=0,j=n-1;i<n;j=i++)segs.push([c[2*j],c[2*j+1],c[2*i],c[2*i+1]]);return {segs,pad:0,poly:p};
}
/** Gap between the drawn edges of two parts; 0 when they touch, overlap or one sits inside the other. */
export function partGap(a:Part,b:Part):number{const A=partGeo(a),B=partGeo(b);
 if(A.poly&&B.segs.some(s=>inside(A.poly!,s[0],s[1]))||B.poly&&A.segs.some(s=>inside(B.poly!,s[0],s[1])))return 0;
 let m=Infinity;for(const s of A.segs)for(const t of B.segs)m=Math.min(m,segSeg(s,t));return Math.max(0,m-A.pad-B.pad);}
/** Largest distance of any drawn point from (cx, cy), used to keep pictures inside the tile when they turn. */
export function reach(pic:Pic,cx=50,cy=50){let m=0;for(const p of pic){if(p.k==='dot')m=Math.max(m,Math.hypot(p.x-cx,p.y-cy)+(p.r??4.5));else if(p.k==='line')m=Math.max(m,Math.hypot(p.x1-cx,p.y1-cy),Math.hypot(p.x2-cx,p.y2-cy));else if(p.s==='circle')m=Math.max(m,Math.hypot(p.x-cx,p.y-cy)+p.size);else{const c=corners(p);for(let i=0;i<c.length;i+=2)m=Math.max(m,Math.hypot(c[i]-cx,c[i+1]-cy));}}return m+1;}
/** Box around everything drawn: [minX, minY, maxX, maxY]. */
export function bounds(pic:Pic):[number,number,number,number]{const xs:number[]=[],ys:number[]=[];for(const p of pic){if(p.k==='dot'){const r=p.r??4.5;xs.push(p.x-r,p.x+r);ys.push(p.y-r,p.y+r);}else if(p.k==='line'){xs.push(p.x1,p.x2);ys.push(p.y1,p.y2);}else if(p.s==='circle'){xs.push(p.x-p.size,p.x+p.size);ys.push(p.y-p.size,p.y+p.size);}else{const c=corners(p);for(let i=0;i<c.length;i+=2){xs.push(c[i]);ys.push(c[i+1]);}}}return [Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];}
export const fits=(pic:Pic,margin=4)=>{const [a,b,c,d]=bounds(pic);return a>=margin&&b>=margin&&c<=100-margin&&d<=100-margin;};

// ---------------------------------------------------------------- whole-picture changes
const rp=(x:number,y:number,deg:number,cx:number,cy:number):[number,number]=>{const [dx,dy]=apply(matRot(deg),x-cx,y-cy);return [r2(cx+dx),r2(cy+dy)];};
/** Turns the whole picture clockwise by deg about (cx, cy). */
export function rotPic(pic:Pic,deg:number,cx=50,cy=50):Pic{return pic.map(p=>{
 if(p.k==='dot'){const [x,y]=rp(p.x,p.y,deg,cx,cy);return {...p,x,y};}
 if(p.k==='line'){const [x1,y1]=rp(p.x1,p.y1,deg,cx,cy),[x2,y2]=rp(p.x2,p.y2,deg,cx,cy);return {...p,x1,y1,x2,y2};}
 const [x,y]=rp(p.x,p.y,deg,cx,cy),out:ShapePart={...p,x,y},rot=norm((p.rot??0)+deg);if(rot)out.rot=rot;else delete out.rot;return out;});}
/** Mirrors the whole picture: 'x' swaps left and right (upright mirror line), 'y' swaps top and bottom. */
export function mirPic(pic:Pic,axis:'x'|'y',c=50):Pic{return pic.map(p=>{
 const fx=(x:number)=>axis==='x'?r2(2*c-x):x,fy=(y:number)=>axis==='y'?r2(2*c-y):y;
 if(p.k==='dot')return {...p,x:fx(p.x),y:fy(p.y)};
 if(p.k==='line')return {...p,x1:fx(p.x1),y1:fy(p.y1),x2:fx(p.x2),y2:fy(p.y2)};
 const out:ShapePart={...p,x:fx(p.x),y:fy(p.y)},rot=norm(axis==='x'?-(p.rot??0):180-(p.rot??0));if(rot)out.rot=rot;else delete out.rot;if(p.flip)delete out.flip;else out.flip=true;return out;});}
/** Scales the picture about (cx, cy); dots keep their size. */
export function scalePic(pic:Pic,k:number,cx=50,cy=50):Pic{const f=(v:number,c:number)=>r2(c+(v-c)*k);return pic.map(p=>p.k==='dot'?{...p,x:f(p.x,cx),y:f(p.y,cy)}:p.k==='line'?{...p,x1:f(p.x1,cx),y1:f(p.y1,cy),x2:f(p.x2,cx),y2:f(p.y2,cy)}:{...p,x:f(p.x,cx),y:f(p.y,cy),size:r2(p.size*k)});}
export const movePic=(pic:Pic,dx:number,dy:number):Pic=>pic.map(p=>p.k==='line'?{...p,x1:r2(p.x1+dx),y1:r2(p.y1+dy),x2:r2(p.x2+dx),y2:r2(p.y2+dy)}:{...p,x:r2(p.x+dx),y:r2(p.y+dy)});
export const recolour=(pic:Pic,map:Partial<Record<Shade,Shade>>):Pic=>pic.map(p=>p.k==='line'?p:{...p,fill:map[p.fill??(p.k==='dot'?'black':'white')]??p.fill});

// ---------------------------------------------------------------- does it look the same?
// Two parts look the same when they are the same kind, shading, place and size, and one's turn/mirror differs from
// the other's by a symmetry of the outline that the shading pattern shares (stripes and checks turn with the shape).
const STRIPE_SYM:M2[]=[[1,0,0,1],[-1,0,0,-1],[0,-1,-1,0],[0,1,1,0]];
const CHECK_SYM:M2[]=[0,90,180,270].flatMap(a=>[matRot(a),matMir(a/2)]);
const shadeKeeps=(f:Shade|undefined,m:M2)=>f==='stripes'?STRIPE_SYM.some(s=>near(s,m)):f==='checks'?CHECK_SYM.some(s=>near(s,m)):true;
export function samePart(a:Part,b:Part,tol=1.6,sizeTol=.6):boolean{
 if(a.k!==b.k)return false;
 if(a.k==='dot'){const q=b as DotPart;return Math.hypot(a.x-q.x,a.y-q.y)<tol&&(a.fill??'black')===(q.fill??'black')&&Math.abs((a.r??4.5)-(q.r??4.5))<.8;}
 if(a.k==='line'){const q=b as LinePart,d=(x1:number,y1:number,x2:number,y2:number)=>Math.hypot(x1-x2,y1-y2)<tol;return !!a.dash===!!q.dash&&Math.abs((a.w??2.5)-(q.w??2.5))<.6&&(d(a.x1,a.y1,q.x1,q.y1)&&d(a.x2,a.y2,q.x2,q.y2)||d(a.x1,a.y1,q.x2,q.y2)&&d(a.x2,a.y2,q.x1,q.y1));}
 const q=b as ShapePart;if(a.s!==q.s||(a.fill??'white')!==(q.fill??'white')||!!a.dash!==!!q.dash||Math.abs(a.size-q.size)>sizeTol)return false;
 // Stripes and checks turn with their shape, so the difference between the two turns must leave the pattern alone.
 if(!shadeKeeps(a.fill,mul(tr(partMat(q)),partMat(a))))return false;
 if(a.s==='circle')return Math.hypot(a.x-q.x,a.y-q.y)<tol;
 // Otherwise the drawn outlines must coincide (this covers every symmetry of the outline, wherever its anchor is).
 const ca=corners(a),cb=corners(q),covered=(u:number[],v:number[])=>{for(let k=0;k<u.length;k+=2){let ok=false;for(let j=0;j<v.length;j+=2)if(Math.hypot(u[k]-v[j],u[k+1]-v[j+1])<tol*1.5){ok=true;break;}if(!ok)return false;}return true;};
 return covered(ca,cb)&&covered(cb,ca);
}
/** Same parts in any order (each part matched once). */
export function samePic(a:Pic,b:Pic,tol=1.6,sizeTol=.6):boolean{if(a.length!==b.length)return false;const used=new Set<number>();for(const p of a){const j=b.findIndex((q,k)=>!used.has(k)&&samePart(p,q,tol,sizeTol));if(j<0)return false;used.add(j);}return true;}
/** Moves a picture so its box is centred on the tile (for comparing pictures regardless of position). */
export function centred(pic:Pic):Pic{const [a,b,c,d]=bounds(pic);return movePic(pic,r2(50-(a+c)/2),r2(50-(b+d)/2));}
/** Where a part looks centred: the middle of a shape's area, a dot's centre, a line's midpoint. */
const partCentre=(p:Part):[number,number]=>p.k==='shape'?areaCentre(p):p.k==='dot'?[p.x,p.y]:[(p.x1+p.x2)/2,(p.y1+p.y2)/2];
const picCentre=(pic:Pic):[number,number]=>{let x=0,y=0;for(const p of pic){const [a,b]=partCentre(p);x+=a;y+=b;}return [x/pic.length,y/pic.length];};
const partSig=(p:Part)=>p.k==='shape'?`s${p.s}|${p.fill??'white'}|${Math.round(p.size)}|${!!p.dash}`:p.k==='dot'?`d${p.fill??'black'}|${p.r??4.5}`:`l${!!p.dash}|${p.w??2.5}|${Math.round(Math.hypot(p.x2-p.x1,p.y2-p.y1)/4)}`;
/** Same picture, wherever it sits. */
export function sameShape(a:Pic,b:Pic,tol=1.6,sizeTol=.6){if(a.length!==b.length)return false;const [ax,ay]=picCentre(a),[bx,by]=picCentre(b);return samePic(movePic(a,bx-ax,by-ay),b,tol,sizeTol);}
/** Too alike for a pupil to tell apart: the same parts, wherever the picture sits, to within 4.5 units. */
export const lookAlike=(a:Pic,b:Pic)=>sameShape(a,b,4.5,4.5);
/** Turns (in steps of 5°) that make picture a look like picture b, ignoring position. */
export function turnsBetween(a:Pic,b:Pic):number[]{
 if(a.length!==b.length||a.map(partSig).sort().join()!==b.map(partSig).sort().join())return [];
 const [ax,ay]=picCentre(a),[bx,by]=picCentre(b),test=(d:number)=>samePic(movePic(rotPic(a,d,ax,ay),bx-ax,by-ay),b),out:number[]=[];
 // A turn must carry some off-centre part of a onto a matching part of b: that fixes the candidate angles.
 const far=a.map((p,i)=>{const [x,y]=partCentre(p);return {i,d:Math.hypot(x-ax,y-ay),sig:partSig(p),x,y};}).filter(q=>q.d>3);
 if(!far.length){for(let d=0;d<360;d+=5)if(test(d))out.push(d);return out;}
 const tally=new Map<string,number>();for(const q of far)tally.set(q.sig,(tally.get(q.sig)??0)+1);
 const key=far.reduce((best,q)=>tally.get(q.sig)!<tally.get(best.sig)!||tally.get(q.sig)===tally.get(best.sig)&&q.d>best.d?q:best);
 for(const p of b){if(partSig(p)!==key.sig)continue;const [x,y]=partCentre(p);if(Math.abs(Math.hypot(x-bx,y-by)-key.d)>2)continue;
  const d=norm(Math.round((Math.atan2(y-by,x-bx)-Math.atan2(key.y-ay,key.x-ax))*180/Math.PI*2)/2);if(!out.some(o=>Math.abs(o-d)<1||Math.abs(o-d)>359)&&test(d))out.push(d);}
 return out.sort((p,q)=>p-q);
}
export const isTurnOf=(a:Pic,b:Pic)=>turnsBetween(a,b).length>0;
/** A picture with no line of symmetry and no turning symmetry: its mirror image is never a turn of it. */
export const chiral=(pic:Pic)=>!isTurnOf(pic,mirPic(pic,'x'))&&turnsBetween(pic,pic).length===1;
/** No two pictures look alike (see lookAlike). */
export function distinct(pics:Pic[]){for(let i=0;i<pics.length;i++)for(let j=i+1;j<pics.length;j++)if(lookAlike(pics[i],pics[j]))return false;return true;}

// ---------------------------------------------------------------- words
/** Bold key words in prompts. */
export const bold=(s:string)=>`**${s}**`;
const NUM=['no','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve'];
export const count=(n:number,one:string,many=one+'s')=>`${NUM[n]??n} ${n===1?one:many}`;
export const numWord=(n:number)=>NUM[n]??String(n);
/** "crosses", "hexagons". */
export const plural=(w:string)=>/(s|x|ch|sh)$/.test(w)?w+'es':w+'s';
/** "an octagon", "a hexagon". */
export const aWord=(w:string)=>(/^[aeiou]/i.test(w)?'an ':'a ')+w;
export const shapeName=(k:ShapeKey)=>info(k).name;
export const sidesWord=(k:ShapeKey)=>{const i=info(k);return i.curved&&i.sides===0?'no straight sides':count(i.sides,'side');};
export const shadeWord=(f:Shade|undefined)=>SHADE_WORD[f??'white'];
/** "grey hexagon", "small black triangle". */
export const partWord=(p:ShapePart,small=false)=>`${small?'small ':''}${shadeWord(p.fill)} ${shapeName(p.s)}`;
/** A neutral description of a picture for screen readers: what is drawn, never what it means. */
export function describe(pic:Pic):string{
 const shapes=pic.filter((p):p is ShapePart=>p.k==='shape'),dots=pic.filter((p):p is DotPart=>p.k==='dot'),lines=pic.filter(p=>p.k==='line');
 const big=Math.max(0,...shapes.map(s=>s.size)),words:string[]=[];
 const groups=new Map<string,number>();for(const s of shapes){const w=partWord(s,s.size<big*.6);groups.set(w,(groups.get(w)??0)+1);}
 for(const [w,n] of groups)words.push(n===1?(/^[aeiou]/.test(w)?'an ':'a ')+w:`${numWord(n)} ${w.endsWith('s')?w:w+'s'}`);
 const black=dots.filter(d=>(d.fill??'black')==='black').length,white=dots.length-black;
 if(black)words.push(count(black,black===dots.length?'dot':'black dot'));if(white)words.push(count(white,'white dot'));
 if(lines.length)words.push(count(lines.length,'line'));
 const s=words.length>1?`${words.slice(0,-1).join(', ')} and ${words.at(-1)}`:words[0]??'an empty square';
 return s.charAt(0).toUpperCase()+s.slice(1);
}

// ---------------------------------------------------------------- choosing
export const attempt=<T,>(n:number,f:()=>T|null):T|null=>{for(let i=0;i<n;i++){const v=f();if(v)return v;}return null;};
export const cap=(s:string)=>s.charAt(0).toUpperCase()+s.slice(1);
export const listWords=(xs:string[],last='and')=>xs.length<2?xs.join(''):`${xs.slice(0,-1).join(', ')} ${last} ${xs.at(-1)}`;
export const shapesOf=(pic:Pic)=>pic.filter((p):p is ShapePart=>p.k==='shape');
export const dotsOf=(pic:Pic)=>pic.filter((p):p is DotPart=>p.k==='dot');
export const linesOf=(pic:Pic)=>pic.filter((p):p is LinePart=>p.k==='line');
export const the=(p:ShapePart,small=false)=>'the '+partWord(p,small);
/** Distance from (x, y) to the nearest point of a shape's outline. */
export function minEdge(p:ShapePart,x:number,y:number){if(p.s==='circle')return Math.abs(Math.hypot(x-p.x,y-p.y)-p.size);const c=corners(p),n=c.length/2;let m=1e9;for(let i=0,j=n-1;i<n;j=i++)m=Math.min(m,segDist(x,y,c[2*j],c[2*j+1],c[2*i],c[2*i+1]));return m;}
/** Distance from (cx, cy) to a shape's outline along the direction deg (0 = right, clockwise). */
export function edgeAt(p:ShapePart,deg:number,cx=50,cy=50){if(p.s==='circle')return p.size;const a=deg*Math.PI/180,dx=Math.cos(a),dy=Math.sin(a),c=corners(p),n=c.length/2;let best=1e9;
 for(let i=0,j=n-1;i<n;j=i++){const [x1,y1,x2,y2]=[c[2*j]-cx,c[2*j+1]-cy,c[2*i]-cx,c[2*i+1]-cy],ex=x2-x1,ey=y2-y1,den=dx*ey-dy*ex;if(Math.abs(den)<1e-9)continue;
  const t=(x1*ey-y1*ex)/den,u=(x1*dy-y1*dx)/den;if(t>0&&u>=-1e-9&&u<=1+1e-9)best=Math.min(best,t);}return best;}
/** Dice-style dot patterns (offsets in units of the spacing). */
export const DICE:Record<number,[number,number][]>={1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],4:[[-1,-1],[1,-1],[-1,1],[1,1]],5:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],6:[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]]};
/** k dots in a dice pattern at the shape's centre, or null if they would not sit clearly inside it. */
export function diceIn(p:ShapePart,k:number,gap=11):DotPart[]|null{const [cx,cy]=areaCentre(p),out=DICE[k].map(([u,v])=>D(cx+u*gap,cy+v*gap));return out.every(d=>inside(p,d.x,d.y,7.5))?out:null;}
/** Fills for five pictures: all different, or three of one and two of another (never four and one). */
export function fiveFills(r:Rng,pool:Shade[]=['white','grey','black','stripes','checks']):Shade[]{if(pool.length>=5&&r.chance(.5))return r.shuffle(pool).slice(0,5);const [a,b]=r.sample(pool,2);return r.shuffle([a,a,a,b,b]);}
export type Feat=Record<string,string|number|boolean>;
/** Feature names whose value is the same in every example. */
export const sharedKeys=(ex:Feat[])=>Object.keys(ex[0]).filter(k=>ex.every(e=>e[k]===ex[0][k]));
/** The answer keeps every property the examples share, and each wrong option breaks at least one of them. */
export function sharedFair(ex:Feat[],answer:Feat,wrong:Feat[]){const keys=sharedKeys(ex);return keys.every(k=>answer[k]===ex[0][k])&&wrong.every(w=>keys.some(k=>w[k]!==ex[0][k]));}
export const cmp=(a:number,b:number)=>a<b?'less':a>b?'more':'same';
/** n different items from xs. */
export const pickN=<T,>(r:Rng,xs:readonly T[],n:number)=>r.sample(xs,n);
/** Each value's count; used to keep red herrings from singling out one picture. */
export function tally(values:(string|number|boolean)[]){const m=new Map<string,number>();for(const v of values)m.set(String(v),(m.get(String(v))??0)+1);return m;}
/**
 * A red-herring feature must not point at a single picture: no value may be shared by all but one picture, and the
 * answer must not be the only picture with its own value while the rest pair up.
 */
export function fairSplit(values:(string|number|boolean)[],answer:number){
 const t=tally(values),n=values.length;if([...t.values()].some(c=>c===n-1))return false;
 const mine=t.get(String(values[answer]))!;if(mine===1&&[...t.values()].filter(c=>c===1).length===1&&n>2)return false;return true;
}
export const fairAll=(rows:(string|number|boolean)[][],answer=0)=>rows.every(v=>fairSplit(v,answer));
/** Right-angle feature must be fair whichever way a nearly-square corner is read. */
export const fairRight=(keys:ShapeKey[],answer=0)=>['yes','no'].every(m=>fairSplit(keys.map(k=>{const w=rightWord(k);return w==='maybe'?m:w;}),answer));
/** What a picture shows at a glance: which shapes, how many dots and how many lines (place, size and shading aside). */
export const glance=(p:Pic)=>[shapesOf(p).map(s=>s.s).sort().join('+'),dotsOf(p).length,linesOf(p).length].join('/');
/**
 * The answer (options[0]) must not be the only option that looks like one of the stem pictures, or a pupil could
 * pick it by matching looks instead of finding the rule.
 */
export function noEcho(stem:Pic[],options:Pic[]){const seen=new Set(stem.map(glance)),echo=options.map(o=>seen.has(glance(o)));return !echo[0]||echo.slice(1).some(Boolean);}

// ---------------------------------------------------------------- audit
export type AuditOption={key:string;vis?:Visual;pic?:Pic;code?:string};
export type NvrAudit={family:string;rule:Record<string,unknown>;stem:Record<string,unknown>;options:AuditOption[];answer:string};
/** Feature models behind every NVR question, keyed by question id, for tests/bank-nvr.cjs. */
export const nvrAudit:Record<string,NvrAudit>={};
export type Made={draft:Draft;family:string;rule?:Record<string,unknown>;stem?:Record<string,unknown>;pics?:Record<string,Pic>};
/**
 * build() with the feature model recorded for each question that is kept. With own, every question draws from its own
 * random stream (topic, number, attempt) and shuffles its own options, so changing one question never changes another.
 */
export function auditBuild(topic:Topic,count:number,make:(r:Rng,i:number)=>Made|null,o:{own?:boolean}={}):BuiltTopic{
 const pending:NvrAudit[]=[],tries=new Map<number,number>();
 const out=build(topic,count,(shared,i)=>{let r=shared;if(o.own){const t=(tries.get(i)??0)+1;tries.set(i,t);r=rng(`${topic.id}#${i+1}#${t}`);}
  const m=make(r,i);if(!m)return null;
  // Our order is random, not meaningful, so mixed lets the game show each pupil the choices in their own order too.
  if(o.own)m.draft=m.draft.pictures?{...m.draft,pictures:r.shuffle(m.draft.pictures),order:'given',mixed:true}:{...m.draft,options:r.shuffle([m.draft.answer as string,...(m.draft.wrong??[])]),mixed:true};
  pending[i]={family:m.family,rule:m.rule??{},stem:m.stem??{},answer:String(m.draft.answer),
   options:m.draft.pictures?m.draft.pictures.map(p=>({key:p.key,vis:p.visual,pic:m.pics?.[p.key]})):(m.draft.options??[m.draft.answer as string,...(m.draft.wrong??[])]).map(code=>({key:code,code}))};
  return m.draft;});
 out.questions.forEach((q,i)=>{nvrAudit[q.id]=pending[i];});
 return out;
}
/** Picture options from models: the answer is key 'a', the rest 'b', 'c' … */
export function picChoices(answer:Pic,wrong:Pic[],alt:(p:Pic)=>string=describe){
 const all=[answer,...wrong],keys=all.map((_,i)=>String.fromCharCode(97+i));
 return {pictures:all.map((p,i)=>({key:keys[i],visual:picTile(p,alt(p))})),answer:'a',wrong:keys.slice(1),pics:Object.fromEntries(all.map((p,i)=>[keys[i],p]))};
}
export const setOf=(layout:'row'|'sequence'|'oval'|'pair'|'analogy'|'grid',items:(Visual|null)[],alt:string,extra:{cols?:number;labels?:string[]}={}):Visual=>({kind:'set',layout,items,alt,...extra});
