import {explain,bullets,type Topic,type Rng} from './bank-kit';
import {tile,type Mark,type Fill,type Visual} from './visual';
import {auditBuild,bold,attempt,setOf,listWords,type Made} from './bank-nvr-kit';
// Cube nets. A net is folded by rolling a cube under it (each square is stamped onto the face that touches it), which
// gives every face its symbol and which way up the symbol sits. A cube drawing shows three faces (top, front, right);
// a drawing is possible only if one of the cube's 24 positions shows exactly those symbols, the same way up.

type Cell=[number,number];type V3=[number,number,number];type M3=[V3,V3,V3];
const NV='Non-verbal reasoning';
// The 11 cube nets and some hexominoes that do not fold into a cube (rows top to bottom, # = square).
const NETS=['#../##./.##/..#','#../##./.##/.#.','#../##./.#./.##','#../###/.#./.#.','#./#./##/.#/.#','.#./##./.##/.#.','#.../####/.#..','#.../####/..#.','#.../####/...#','#.../####/#...','.#./###/.#./.#.'];
const NOT_NETS=['#../#../##./.##','#./##/.#/##','#../#../###/.#.','##./.##/##.','#../###/#.#','#./##/#./##','#../#.#/###','#../#../###/..#','##/#./#./##','#../#../#../###','#####/#....','#####/..#..','##/##/##','###/###'];
const parse=(s:string):Cell[]=>s.split('/').flatMap((row,y)=>row.split('').flatMap((c,x)=>c==='#'?[[x,y] as Cell]:[]));
const normCells=(c:Cell[]):Cell[]=>{const mx=Math.min(...c.map(p=>p[0])),my=Math.min(...c.map(p=>p[1]));return c.map(([x,y])=>[x-mx,y-my] as Cell).sort((a,b)=>a[1]-b[1]||a[0]-b[0]);};
/** The net turned k quarter turns and optionally flipped (still the same net, seen another way). */
const orient=(c:Cell[],k:number,flip:boolean):Cell[]=>{let out=c.map(([x,y])=>[flip?-x:x,y] as Cell);for(let i=0;i<k;i++)out=out.map(([x,y])=>[-y,x] as Cell);return normCells(out);};

// ---------------------------------------------------------------- folding
const mv=(m:M3,v:V3):V3=>[m[0][0]*v[0]+m[0][1]*v[1]+m[0][2]*v[2],m[1][0]*v[0]+m[1][1]*v[1]+m[1][2]*v[2],m[2][0]*v[0]+m[2][1]*v[1]+m[2][2]*v[2]];
const mm=(a:M3,b:M3):M3=>[0,1,2].map(i=>[0,1,2].map(j=>a[i][0]*b[0][j]+a[i][1]*b[1][j]+a[i][2]*b[2][j])) as M3;
const tp=(a:M3):M3=>[0,1,2].map(i=>[0,1,2].map(j=>a[j][i])) as M3;
const eq=(a:V3,b:V3)=>a[0]===b[0]&&a[1]===b[1]&&a[2]===b[2];
/** Rolling onto the neighbour in world direction d: the side facing d turns to face up, the top turns to face −d. */
function rollTowards(d:V3):M3{const f=(v:V3):V3=>{const vd=v[0]*d[0]+v[1]*d[1]+v[2]*d[2],vz=v[2];return [v[0]-vd*d[0]-vz*d[0],v[1]-vd*d[1]-vz*d[1],v[2]-vd*d[2]-vz+vd];};
 const c=[f([1,0,0]),f([0,1,0]),f([0,0,1])];return [[c[0][0],c[1][0],c[2][0]],[c[0][1],c[1][1],c[2][1]],[c[0][2],c[1][2],c[2][2]]];}
export type Folded={normal:V3;east:V3;north:V3}[];
/** Folds a net: for each square, which face of the cube it becomes and how that face's own east/north lie. Null if it is not a net. */
export function fold(cells:Cell[]):Folded|null{
 if(cells.some(([x,y])=>[[1,0],[0,1],[1,1]].every(([a,b])=>cells.some(c=>c[0]===x+a&&c[1]===y+b))))return null;
 const at=new Map(cells.map((c,i)=>[c.join(),i])),M:(M3|undefined)[]=[[[1,0,0],[0,1,0],[0,0,1]]],q=[0];
 while(q.length){const i=q.shift()!,[x,y]=cells[i];for(const [dx,dy,d] of [[1,0,[1,0,0]],[-1,0,[-1,0,0]],[0,-1,[0,1,0]],[0,1,[0,-1,0]]] as [number,number,V3][]){const j=at.get([x+dx,y+dy].join());if(j===undefined||M[j])continue;M[j]=mm(rollTowards(d),M[i]!);q.push(j);}}
 for(let i=0;i<cells.length;i++)if(!M[i])return null;
 const out=cells.map((_,i)=>{const t=tp(M[i]!);return {normal:mv(t,[0,0,1]),east:mv(t,[1,0,0]),north:mv(t,[0,1,0])};});
 return new Set(out.map(o=>o.normal.join())).size===6?out:null;
}

// ---------------------------------------------------------------- symbols
type Sym='dot'|'ring'|'plus'|'square'|'tri'|'arrow'|'half'|'corner';
const SYMS:Sym[]=['dot','ring','plus','square','tri','arrow','half','corner'];
const ORIENTED:Sym[]=['tri','arrow','half','corner'];
/** Turns that leave the symbol looking the same (90 = every quarter turn). */
const PERIOD:Record<Sym,number>={dot:90,ring:90,plus:90,square:90,tri:360,arrow:360,half:360,corner:360};
const SYM_WORD:Record<Sym,string>={dot:'black dot',ring:'circle',plus:'cross',square:'black square',tri:'triangle',arrow:'arrow',half:'half-shaded face',corner:'shaded corner'};
const circ=(r:number,n=20)=>Array.from({length:n},(_,i)=>[r*Math.cos(i*2*Math.PI/n),r*Math.sin(i*2*Math.PI/n)] as [number,number]);
/** Symbol outlines in face units: u to the right, v upwards, the face spanning −1 … 1. */
const SHAPES:Record<Sym,{pts:[number,number][];fill:Fill}[]>={
 dot:[{pts:circ(.34),fill:'black'}],ring:[{pts:circ(.52),fill:'white'}],
 plus:[{pts:[[-.18,.62],[.18,.62],[.18,.18],[.62,.18],[.62,-.18],[.18,-.18],[.18,-.62],[-.18,-.62],[-.18,-.18],[-.62,-.18],[-.62,.18],[-.18,.18]],fill:'black'}],
 square:[{pts:[[-.38,.38],[.38,.38],[.38,-.38],[-.38,-.38]],fill:'black'}],
 tri:[{pts:[[0,.62],[.58,-.48],[-.58,-.48]],fill:'black'}],
 arrow:[{pts:[[-.14,-.66],[.14,-.66],[.14,.08],[.42,.08],[0,.68],[-.42,.08],[-.14,.08]],fill:'black'}],
 half:[{pts:[[-1,1],[1,1],[1,0],[-1,0]],fill:'grey'}],
 corner:[{pts:[[-1,1],[-.05,1],[-1,.05]],fill:'black'}],
};
/** A symbol turned clockwise by rot, placed by a map from face units to picture units. */
function symMarks(s:Sym,rot:number,map:(u:number,v:number)=>[number,number]):Mark[]{const a=rot*Math.PI/180,c=Math.cos(a),sn=Math.sin(a),k=s==='half'||s==='corner'?1:.8;
 return SHAPES[s].map(p=>({t:'poly',pts:p.pts.flatMap(([u,v])=>map(k*(u*c+v*sn),k*(-u*sn+v*c)).map(z=>Math.round(z*100)/100)),fill:p.fill,w:1.4} as Mark));}
type Face={sym:Sym|'blank'|'shade';rot:number};
const faceMarks=(f:Face,map:(u:number,v:number)=>[number,number]):Mark[]=>f.sym==='blank'||f.sym==='shade'?[]:symMarks(f.sym,f.rot,map);
const poly=(pts:[number,number][],fill:Fill='white',w=2):Mark=>({t:'poly',pts:pts.flat().map(z=>Math.round(z*100)/100),fill,w});

// ---------------------------------------------------------------- nets and cubes as pictures
/** A net drawn with squares of side s from (ox, oy). */
function netMarks(cells:Cell[],faces:Face[],s:number,ox:number,oy:number):Mark[]{const m:Mark[]=[];cells.forEach(([x,y],i)=>{const x0=ox+x*s,y0=oy+y*s,cx=x0+s/2,cy=y0+s/2;
 m.push(poly([[x0,y0],[x0+s,y0],[x0+s,y0+s],[x0,y0+s]],faces[i].sym==='shade'?'grey':'white'),...faceMarks(faces[i],(u,v)=>[cx+u*s/2,cy-v*s/2]));});return m;}
function netVisual(cells:Cell[],faces:Face[],maxCell:number,box?:number):Visual{const w=Math.max(...cells.map(c=>c[0]))+1,h=Math.max(...cells.map(c=>c[1]))+1;
 if(box){const s=Math.min(maxCell,(box-12)/Math.max(w,h));return tile(netMarks(cells,faces,s,(box-w*s)/2,(box-h*s)/2),'Six squares joined edge to edge'+(faces.some(f=>f.sym!=='blank')?', each with a symbol':''),box);}
 const s=maxCell;return {kind:'figure',w:w*s+12,h:h*s+12,marks:netMarks(cells,faces,s,6,6),alt:'A net of six squares with a symbol on each'};}
export type View={top:Face;front:Face;right:Face};
const A=50,DD=26,X0=12,Y0=38;
/** A cube drawn in a 100 × 100 tile: front face square, top and right faces slanting back. */
function cubeVisual(v:View):Visual{const a=A,d=DD,x0=X0,y0=Y0;
 const tc:[number,number]=[x0+a/2+d/2,y0-d/2],rc:[number,number]=[x0+a+d/2,y0+a/2-d/2];
 return tile([poly([[x0,y0],[x0+a,y0],[x0+a,y0+a],[x0,y0+a]]),...faceMarks(v.front,(u,w)=>[x0+a/2+u*a/2,y0+a/2-w*a/2]),
  poly([[x0,y0],[x0+a,y0],[x0+a+d,y0-d],[x0+d,y0-d]]),...faceMarks(v.top,(u,w)=>[tc[0]+u*a/2+w*d/2,tc[1]-w*d/2]),
  poly([[x0+a,y0],[x0+a+d,y0-d],[x0+a+d,y0+a-d],[x0+a,y0+a]]),...faceMarks(v.right,(u,w)=>[rc[0]+u*d/2,rc[1]-u*d/2-w*a/2])],'A cube with a symbol on each of three faces');}

// ---------------------------------------------------------------- views of a folded net
const ROTS:M3[]=(()=>{const out:M3[]=[],perms=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
 for(const p of perms)for(const sx of [1,-1])for(const sy of [1,-1])for(const sz of [1,-1]){const m:M3=[[0,0,0],[0,0,0],[0,0,0]];m[0][p[0]]=sx;m[1][p[1]]=sy;m[2][p[2]]=sz;
  const det=m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1])-m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0])+m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]);if(det===1)out.push(m);}
 return out;})();
const FRAMES:Record<'top'|'front'|'right',{n:V3;right:V3;up:V3}>={top:{n:[0,1,0],right:[1,0,0],up:[0,0,-1]},front:{n:[0,0,1],right:[1,0,0],up:[0,1,0]},right:{n:[1,0,0],right:[0,0,-1],up:[0,1,0]}};
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
/** Every view of the folded net: which symbol is on top, front and right, and how far each is turned. */
function views(fd:Folded,faces:Face[]):View[]{const out:View[]=[];
 for(const R of ROTS){const v:Partial<View>={};
  for(const [name,f] of Object.entries(FRAMES) as ['top'|'front'|'right',typeof FRAMES.top][]){const i=fd.findIndex(c=>eq(mv(R,c.normal),f.n)),face=faces[i];
   // The symbol's up direction on its net square, carried onto the cube and read in this face's own frame.
   const a=face.rot*Math.PI/180,up:V3=fd[i].east.map((e,k)=>Math.round(Math.sin(a)*e+Math.cos(a)*fd[i].north[k])) as V3,u=mv(R,up),x=dot3(u,f.right),y=dot3(u,f.up);
   v[name]={sym:face.sym,rot:y===1?0:x===1?90:y===-1?180:270};}
  out.push(v as View);}
 return out;}
const sameFace=(a:Face,b:Face)=>a.sym===b.sym&&(a.sym==='blank'||a.sym==='shade'||((a.rot-b.rot)%PERIOD[a.sym as Sym]+360)%PERIOD[a.sym as Sym]===0);
const sameView=(a:View,b:View)=>sameFace(a.top,b.top)&&sameFace(a.front,b.front)&&sameFace(a.right,b.right);
const possible=(vs:View[],v:View)=>vs.some(w=>sameView(w,v));
/** Slanted faces shear their symbols, so only symbols that look the same whichever way they face may appear there. */
const clearView=(v:View)=>![v.top.sym,v.right.sym].some(s=>ORIENTED.includes(s as Sym));

// ---------------------------------------------------------------- questions
const cubeTopic:Topic={id:'nv-cube-nets',subject:NV,strand:'Spatial',title:'Cube nets',helpsheet:{
 intro:'A net is a flat shape that folds up into a cube. Picture the folding: which squares end up opposite each other, and which meet at an edge?',
 steps:['Squares with one square between them in a straight row end up on opposite faces, so they can never be seen together.','Squares that touch at an edge in the net meet at an edge of the cube.','Choose one face as the front and fold the others up round it, one at a time.','Check which way each symbol points: a symbol keeps pointing at the same neighbour after folding.'],
 example:{title:'Opposite faces',visual:tile(netMarks(parse('#.../####/#...'),Array.from({length:6},()=>({sym:'blank',rot:0} as Face)),22,6,17),'A net of six squares: a row of four with one above and one below the first'),
  lines:['In the row of four, the first and third squares are opposite each other, and so are the second and fourth.','The square above the row and the square below it are opposite each other.','So each of these pairs can never both be seen on one cube.']},
 tips:['At most three faces of a cube can be seen at once, and never two opposite faces.','Rotate the cube in your head rather than the net: the pattern of neighbours never changes.','Symbols such as arrows and triangles also show which way the face has been turned.']}};

type Net={cells:Cell[];faces:Face[];fd:Folded};
function makeNet(r:Rng,syms:Sym[]):Net|null{const cells=orient(parse(r.pick(NETS)),r.int(0,3),r.chance(.5)),fd=fold(cells);if(!fd)return null;
 return {cells,fd,faces:r.shuffle(syms).map(s=>({sym:s,rot:ORIENTED.includes(s)?r.pick([0,90,180,270]):0}))};}
const opposite=(fd:Folded,i:number)=>fd.findIndex(c=>eq(c.normal,fd[i].normal.map(x=>-x) as V3));
const pickSyms=(r:Rng,oriented:number)=>[...r.sample(ORIENTED,oriented),...r.sample(SYMS.filter(s=>!ORIENTED.includes(s)),6-oriented)];

function cubeWhich(r:Rng,hard:boolean):Made|null{return attempt(100,()=>{
 const n=makeNet(r,pickSyms(r,hard?3:2));if(!n)return null;const vs=views(n.fd,n.faces),shown=vs.filter(clearView);if(!shown.length)return null;const ans=r.pick(shown);
 const at=(v:View,k:'top'|'front'|'right',f:Face):View=>({...v,[k]:f});
 const sides:('top'|'front'|'right')[]=['top','front','right'],cands:{v:View;why:string}[]=[];
 // Opposite faces shown together.
 for(const k of sides)for(const o of sides)if(k!==o){const i=n.faces.findIndex(f=>sameFace(f,{...ans[o],rot:f.rot})&&f.sym===ans[o].sym),j=opposite(n.fd,i);cands.push({v:at(ans,k,{sym:n.faces[j].sym,rot:ORIENTED.includes(n.faces[j].sym as Sym)?r.pick([0,90,180,270]):0}),why:'opposite'});}
 // Two faces swapped round (the mirror-image arrangement).
 for(const [k,o] of [['top','front'],['front','right'],['top','right']] as ['top'|'front'|'right','top'|'front'|'right'][])cands.push({v:{...ans,[k]:ans[o],[o]:ans[k]},why:'swap'});
 // A symbol turned the wrong way.
 for(const k of sides)if(ORIENTED.includes(ans[k].sym as Sym))for(const t of [90,180,270])cands.push({v:at(ans,k,{sym:ans[k].sym,rot:(ans[k].rot+t)%360}),why:'turn'});
 const wrong:{v:View;why:string}[]=[];for(const c of r.shuffle(cands))if(wrong.length<4&&clearView(c.v)&&!possible(vs,c.v)&&wrong.every(w=>!sameView(w.v,c.v)))wrong.push(c);
 if(wrong.length<4)return null;
 if(hard?!wrong.some(w=>w.why!=='opposite'):wrong.filter(w=>w.why==='opposite').length<2)return null;
 const pictures=[ans,...wrong.map(w=>w.v)].map((v,i)=>({key:String.fromCharCode(97+i),visual:cubeVisual(v)}));
 const whys=[...new Set(wrong.map(w=>w.why))].map(w=>w==='opposite'?'show two faces that are opposite each other in the net':w==='swap'?'have two faces swapped round, which cannot happen':'have a symbol pointing the wrong way');
 return {family:'cube-which',rule:{},stem:{cells:n.cells,faces:n.faces},pics:{},draft:{prompt:`Which cube ${bold('could be made')} from this net?`,visual:netVisual(n.cells,n.faces,30),
  answer:'a',wrong:['b','c','d','e'],pictures,rewardGroup:hard?'challenge':'standard',explanation:explain(
  'Similarities:',bullets('Every option shows three faces of a cube with symbols from the net.'),
  'Rule:',bullets('Faces that are opposite in the net can never be seen together, and faces that meet in the net meet at an edge of the cube, keeping the same neighbours.'),
  'Why the answer fits:',bullets(`The ${SYM_WORD[ans.top.sym as Sym]}, ${SYM_WORD[ans.front.sym as Sym]} and ${SYM_WORD[ans.right.sym as Sym]} all meet at one corner of the folded cube, arranged and turned exactly like this.`),
  'Red herrings:',bullets(`The other cubes ${whys.join(', or ')}.`))}};
});}

function netWhich(r:Rng):Made|null{return attempt(100,()=>{
 const n=makeNet(r,pickSyms(r,2));if(!n)return null;const shown=views(n.fd,n.faces).filter(clearView);if(!shown.length)return null;const v=r.pick(shown);
 // Wrong nets: the same net with two symbols swapped, or one symbol turned, so that this cube can no longer be made.
 const cands:Net[]=[];
 // Swapping two symbols is a clear change even in a small drawing (a turned symbol in a small square is not).
 for(const [i,j] of r.shuffle([0,1,2,3,4,5].flatMap(i=>[0,1,2,3,4,5].filter(j=>j>i).map(j=>[i,j] as [number,number])))){const faces=n.faces.map(f=>({...f}));[faces[i],faces[j]]=[faces[j],faces[i]];cands.push({...n,faces});}
 const wrong:Net[]=[];for(const c of cands)if(wrong.length<4&&!possible(views(c.fd,c.faces),v)&&wrong.every(w=>w.faces.some((f,i)=>!sameFace(f,c.faces[i])))&&c.faces.some((f,i)=>!sameFace(f,n.faces[i])))wrong.push(c);
 if(wrong.length<4)return null;
 const pictures=[n,...wrong].map((x,i)=>({key:String.fromCharCode(97+i),visual:netVisual(x.cells,x.faces,22,100)}));
 return {family:'net-which',rule:{},stem:{view:v},pics:{},draft:{prompt:`Which net ${bold('folds')} to make this cube?`,visual:cubeVisual(v),
  answer:'a',wrong:['b','c','d','e'],pictures,rewardGroup:'challenge',explanation:explain(
  'Similarities:',bullets('All the nets are the same shape with the same six symbols.'),
  'Rule:',bullets(`On the cube the ${SYM_WORD[v.top.sym as Sym]}, ${SYM_WORD[v.front.sym as Sym]} and ${SYM_WORD[v.right.sym as Sym]} meet at one corner, so in the net they must be neighbours arranged the same way round, each pointing the same way.`),
  'Why the answer fits:',bullets('Folding this net puts those three faces round one corner exactly as they appear on the cube.'),
  'Red herrings:',bullets('In each of the other nets two symbols have swapped places, so the folded cube would look different.'))}};
});}

function oppositeFace(r:Rng):Made|null{return attempt(40,()=>{
 const syms=r.sample(SYMS.filter(s=>s!=='half'),5),cells=orient(parse(r.pick(NETS)),r.int(0,3),r.chance(.5)),fd=fold(cells);if(!fd)return null;
 const g=r.int(0,5),faces:Face[]=[];let k=0;for(let i=0;i<6;i++)faces.push(i===g?{sym:'shade',rot:0}:{sym:syms[k++],rot:0});
 const o=opposite(fd,g),ans=faces[o].sym as Sym,others=faces.filter((f,i)=>i!==g&&i!==o).map(f=>f.sym as Sym);
 const faceTile=(s:Sym)=>tile([poly([[25,25],[75,25],[75,75],[25,75]]),...symMarks(s,0,(u,v)=>[50+u*25,50-v*25])],`A square with a ${SYM_WORD[s]}`);
 const pictures=[ans,...others].map((s,i)=>({key:String.fromCharCode(97+i),visual:faceTile(s)}));
 return {family:'cube-opposite',rule:{},stem:{cells,faces},pics:{},draft:{prompt:`The net is folded into a cube. Which symbol is on the face ${bold('opposite')} the grey face?`,visual:netVisual(cells,faces,30),
  answer:'a',wrong:['b','c','d','e'],pictures,explanation:explain(
  'Similarities:',bullets('Each option is one of the faces of the net.'),
  'Rule:',bullets('When a net folds up, each face ends up opposite exactly one other face; faces that touch in the net are never opposite.'),
  'Why the answer fits:',bullets(`Folding the net brings the ${SYM_WORD[ans]} to the face opposite the grey one.`),
  'Red herrings:',bullets(`The ${listWords(others.map(s=>SYM_WORD[s]))} all end up next to the grey face.`))}};
});}

function validNet(r:Rng,not:boolean):Made|null{return attempt(40,()=>{
 const shape=(s:string)=>orient(parse(s),r.int(0,3),r.chance(.5)),good=(not?r.sample(NETS,4):[r.pick(NETS)]).map(shape),bad=(not?[r.pick(NOT_NETS)]:r.sample(NOT_NETS,4)).map(shape);
 const all=[...(not?bad:good),...(not?good:bad)],keys=all.map(c=>c.map(p=>p.join()).join(' '));if(new Set(keys).size<5)return null;
 if(!good.every(c=>fold(c))||bad.some(c=>fold(c)))return null;
 const blank=Array.from({length:6},()=>({sym:'blank',rot:0} as Face));
 const pictures=all.map((c,i)=>({key:String.fromCharCode(97+i),visual:netVisual(c,blank,22,100)}));
 return {family:not?'net-not':'net-valid',rule:{},pics:{},draft:{prompt:not?`Which of these shapes could ${bold('NOT')} be folded to make a cube?`:`Which of these shapes ${bold('folds')} to make a cube?`,
  answer:'a',wrong:['b','c','d','e'],pictures,explanation:explain(
  'Similarities:',bullets('Every shape is made of six squares.'),
  'Rule:',bullets('A net of a cube folds so that every face is covered once: no two squares may land on the same face.'),
  'Why the answer fits:',bullets(not?'When this shape is folded, two squares land on the same face, leaving one face of the cube open.':'Folding this shape covers all six faces of the cube exactly once.'),
  'Red herrings:',bullets(not?'The other four shapes are all nets of a cube, even though they look different.':'In each of the other shapes, two squares end up on the same face when folded (four squares in a block, or five in a row, can never fold into a cube).'))}};
});}
const CUBE_PLAN:((r:Rng)=>Made|null)[]=[r=>cubeWhich(r,false),oppositeFace,r=>cubeWhich(r,true),r=>validNet(r,false),netWhich,r=>cubeWhich(r,false),r=>validNet(r,true),r=>cubeWhich(r,true),oppositeFace,netWhich];
export const cubeNets=auditBuild(cubeTopic,20,(r,i)=>CUBE_PLAN[i%CUBE_PLAN.length](r),{own:true});
