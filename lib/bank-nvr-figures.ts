import type {Rng} from './bank-kit';
import {S,D,L,type Pic,type Part,type ShapeKey,type Shade,centreAt,edgeAt,reach,chiral,mirPic,rotPic,isTurnOf,sameShape,fits,attempt,partGap} from './bank-nvr-kit';
// Figures reused by several NVR topics: figures with no symmetry at all (for turning, mirror and odd-one-out puzzles)
// and figures with an upright line of symmetry.

/** A figure plus the parts that make up each small decoration (by index), with a name for explanations. */
export type Fig={pic:Pic;decos:{idx:number[];name:string}[]};

// ---------------------------------------------------------------- no symmetry: a base shape with decorations
const DECOR=['tri','ball','sq','dot','hand'] as const;export type Decor=typeof DECOR[number];
const INSIDE:Decor[]=['dot','hand'];
const DECOR_NAME:Record<Decor,string>={tri:'black triangle',ball:'white circle on a stalk',sq:'grey square',dot:'black dot',hand:'line from the middle'};
/** One decoration on a shape centred at (50, 50), pointing in direction deg; e is the distance to the outline there. */
export function decor(kind:Decor,deg:number,e:number):Part[]{
 const a=deg*Math.PI/180,at=(rad:number):[number,number]=>[50+rad*Math.cos(a),50+rad*Math.sin(a)];
 switch(kind){
  case 'tri':{const [x,y]=at(e+8);return [S('triangle',x,y,9,'black',deg+90)];}
  case 'ball':{const [x1,y1]=at(e),[x2,y2]=at(e+9),[x,y]=at(e+15);return [L(x1,y1,x2,y2),S('circle',x,y,6,'white')];}
  case 'sq':{const [x,y]=at(e+7.5);return [S('square',x,y,6.5,'grey',deg)];}
  case 'dot':{const [x,y]=at(e-9);return [D(x,y,'black',5)];}
  case 'hand':{const [x,y]=at(e-3);return [L(50,50,x,y,3)];}
 }
}
export const CHIRAL_BASES:ShapeKey[]=['square','circle','hexagon','pentagon','octagon'];
const BASE_SIZE:Record<string,number>={square:22,circle:21,hexagon:24,pentagon:24,octagon:22};
/**
 * A base shape with two or three different decorations at least 90° apart and not all in one line, so the figure has
 * no line of symmetry and no turning symmetry: its mirror image can never be turned to match it.
 */
export function chiralFig(r:Rng,o:{bases?:ShapeKey[];fills?:Shade[]}={}):Fig|null{return attempt(80,()=>{
 const base=r.pick(o.bases??CHIRAL_BASES),fill=r.pick(o.fills??(['white','white','grey'] as Shade[]));
 const b=centreAt(S(base,50,50,BASE_SIZE[base]??22,fill,base==='square'?r.pick([0,45]):0),50,50),n=r.pick([2,3,3]);
 const kinds=r.shuffle(DECOR).filter((k,i,all)=>!INSIDE.includes(k)||all.slice(0,i).every(j=>!INSIDE.includes(j))).slice(0,n);
 const angles:number[]=[];for(const _ of kinds){const opts=[0,45,90,135,180,225,270,315].filter(a=>angles.every(b=>{const d=Math.abs(a-b)%360;return Math.min(d,360-d)>=90;}));if(!opts.length)return null;angles.push(r.pick(opts));}
 if(angles.length===2&&Math.abs(angles[0]-angles[1])===180)return null;
 const pic:Pic=[b],decos:Fig['decos']=[];
 kinds.forEach((k,i)=>{const parts=decor(k,angles[i],edgeAt(b,angles[i]));decos.push({idx:parts.map((_,j)=>pic.length+j),name:DECOR_NAME[k]});pic.push(...parts);});
 if(reach(pic)>45||!chiral(pic))return null;return {pic,decos};
});}
export const chiralFigure=(r:Rng,o:{bases?:ShapeKey[];fills?:Shade[]}={}):Pic|null=>chiralFig(r,o)?.pic??null;

// ---------------------------------------------------------------- no symmetry: small parts on a 3 × 3 grid
const CELLS=[26,50,74];
type GridKind='tri'|'arrow'|'semi'|'sq'|'dot';
const GRID_NAME:Record<GridKind,string>={tri:'black triangle',arrow:'arrow',semi:'grey semicircle',sq:'white square',dot:'black dot'};
function gridPart(k:GridKind,x:number,y:number,rot:number):Part{
 switch(k){case 'tri':return centreAt(S('triangle',x,y,11,'black',rot),x,y);case 'arrow':return S('arrow',x,y,12,'white',rot);case 'semi':return centreAt(S('semicircle',x,y,12,'grey',rot),x,y);
  case 'sq':return S('square',x,y,8.5,'white');case 'dot':return D(x,y,'black',5.5);}
}
/** Three or four small parts, pointing different ways, in different cells of a 3 × 3 grid, with no symmetry. */
export function gridFig(r:Rng):Fig|null{return attempt(80,()=>{
 const n=r.pick([3,4,4]),kinds=r.sample(['tri','arrow','semi','sq','dot'] as GridKind[],n),cells=r.sample([0,1,2,3,5,6,7,8],n);
 const pic:Pic=kinds.map((k,i)=>gridPart(k,CELLS[cells[i]%3],CELLS[Math.floor(cells[i]/3)],r.pick([0,90,180,270])));
 if(!fits(pic,5)||reach(pic)>45||!chiral(pic))return null;
 // Parts in neighbouring cells must keep a clear gap, or two of them read as one joined shape.
 if(pic.some((p,i)=>pic.some((q,j)=>j>i&&partGap(p,q)<SPACE)))return null;
 return {pic,decos:kinds.map((k,i)=>({idx:[i],name:GRID_NAME[k]}))};
});}
/** A figure of either style. */
export const anyChiral=(r:Rng):Fig|null=>r.chance(.6)?chiralFig(r):gridFig(r);

/** The figure with one decoration moved round the middle by deg (a near-copy for distractors). */
export function moveDeco(f:Fig,k:number,deg:number):Pic{const idx=new Set(f.decos[k].idx),moved=rotPic(f.pic.filter((_,i)=>idx.has(i)),deg);let j=0;return f.pic.map((p,i)=>idx.has(i)?moved[j++]:p);}
/** Smallest gap (in tile units) between separate small parts, so they never look joined at tile size. */
export const SPACE=4;
/** The figure with one decoration moved round the middle, or null if it would land on (or close to) another decoration. */
export function moveDecoClear(f:Fig,k:number,deg:number):Pic|null{const moved=moveDeco(f,k,deg),mine=f.decos[k].idx;
 return f.decos.every((d,j)=>j===k||mine.every(a=>d.idx.every(b=>partGap(moved[a],moved[b])>=SPACE)))?moved:null;}
/** Where a decoration sits: the average position of its parts. */
export function decoAt(f:{pic:Pic},idx:number[]):[number,number]{let x=0,y=0;for(const i of idx){const p=f.pic[i];const [px,py]=p.k==='line'?[(p.x1+p.x2)/2,(p.y1+p.y2)/2]:[p.x,p.y];x+=px;y+=py;}return [x/idx.length,y/idx.length];}
const DIRS=['right','bottom right','bottom','bottom left','left','top left','top','top right'];
/** "top left", "right" … for a point in a tile. */
export function dirWord([x,y]:[number,number]){const a=(Math.atan2(y-50,x-50)*180/Math.PI+360)%360;return DIRS[Math.round(a/45)%8];}

// ---------------------------------------------------------------- upright line of symmetry
const SYM_BASES:ShapeKey[]=['triangle','square','pentagon','hexagon','circle','house','heart','kite','trapezium','isotri','chevron','tshape','semicircle','octagon'];
/**
 * A shape with pairs of small parts placed as mirror images either side of an upright line through the middle. Every
 * small part keeps a clear gap from the shape, so a black part never merges with a black shape.
 */
export function symFigure(r:Rng):Pic|null{return attempt(40,()=>{
 const k=r.pick(SYM_BASES),b=centreAt(S(k,50,50,k==='tshape'||k==='house'?24:k==='circle'?22:25,r.pick(['white','white','grey','black'] as Shade[]),r.chance(.3)&&k!=='heart'?180:0),50,50),pic:Pic=[b];
 const pairs=r.int(1,2);
 for(const y of r.shuffle([20,50,80]).slice(0,pairs)){const d=r.pick([33,36]),kind=r.pick(['dot','tri','circ']);
  if(kind==='dot')pic.push(D(50-d,y,'black',6),D(50+d,y,'black',6));
  else if(kind==='tri'){const t=r.pick([0,90,180]);pic.push(centreAt(S('triangle',0,0,9,'black',t),50-d,y),centreAt(S('triangle',0,0,9,'black',-t),50+d,y));}
  else{const f=r.pick(['white','grey','black'] as Shade[]);pic.push(S('circle',50-d,y,7.5,f),S('circle',50+d,y,7.5,f));}}
 if(r.chance(.5)){const y=r.pick([11,89]);pic.push(r.chance(.5)?D(50,y,'black',6):S('square',50,y,6,'black'));}
 return pic.slice(1).every(q=>partGap(b,q)>=SPACE)?pic:null;
});}
/**
 * Breaks the symmetry of a picture in a way that is easy to see: one part of a mirrored pair moves to the other end of
 * its side, changes from black to white (or the other way), or disappears.
 */
export function breakSym(r:Rng,pic:Pic):Pic{const pairs=pic.map((p,i)=>({p,i})).filter(({p,i})=>i>0&&p.k!=='line'&&Math.abs(p.x-50)>5);if(!pairs.length)return pic;
 const {p,i}=r.pick(pairs),how=r.int(0,2);
 // A moved part must land well clear of the shape and of every other small part, or the picture looks cramped
 // rather than lopsided.
 const clear=(m:Part)=>pic.every((q,j)=>j===i||q.k==='line'||partGap(q,m)>=(j===0?SPACE:6));
 if(how===0&&p.k!=='line'){const y=p.y<35?p.y+45:p.y>65?p.y-45:p.y+(r.chance(.5)?30:-30),m={...p,y} as Part;if(clear(m))return pic.map((q,j)=>j===i?m:q) as Pic;}
 if(how===1&&p.k!=='line')return pic.map((q,j)=>j===i&&q.k!=='line'?{...q,fill:((q.fill??'black')==='black'?'white':'black') as Shade}:q) as Pic;
 return pic.filter((_,j)=>j!==i);
}
/** Has a line of symmetry in any direction. */
export const hasMirror=(p:Pic)=>isTurnOf(mirPic(p,'x'),p);
/** Has an upright line of symmetry. */
export const uprightSym=(p:Pic)=>sameShape(mirPic(p,'x'),p);
