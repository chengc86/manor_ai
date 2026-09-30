// Independent checks for the non-verbal reasoning bank (lib/bank-nvr*.ts).
// The templates build each puzzle from a feature model; this test ignores that model's logic and works from the
// pictures as drawn: it flattens every mark, samples outlines, and re-derives sides, shading, dots, lines, containment,
// symmetry, turns and mirror images with its own geometry. For each question it re-evaluates the family's rule on the
// drawings and requires exactly one option to fit, and that option to be the marked answer. It also checks that no
// two options look the same, that pictures stay inside their tiles, and that red herrings do not single out an option.
// node tests/bank-nvr.cjs [topic-or-id-prefix]
const path=require('path');
const dir=require('./build-lib.cjs')('bank-nvr',[],{only:['Non-verbal reasoning']});
const {bankQuestions,bankProblems}=require(path.join(dir,'bank.cjs'));
const {nvrAudit}=require(path.join(dir,'bank-nvr.cjs'));
const want=process.argv[2]??'';
const fails=[];const fail=(id,msg)=>fails.push(`${id}: ${msg}`);

// ================================================================ geometry
const I=[1,0,0,1,0,0];
const mul=(m,n)=>[m[0]*n[0]+m[2]*n[1],m[1]*n[0]+m[3]*n[1],m[0]*n[2]+m[2]*n[3],m[1]*n[2]+m[3]*n[3],m[0]*n[4]+m[2]*n[5]+m[4],m[1]*n[4]+m[3]*n[5]+m[5]];
const ap=(m,[x,y])=>[m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]];
const lin=(m,[x,y])=>[m[0]*x+m[2]*y,m[1]*x+m[3]*y];
const T=(x,y)=>[1,0,0,1,x,y],Rot=d=>{const a=d*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return [c,s,-s,c,0,0];},Sc=(x,y=x)=>[x,0,0,y,0,0];
const about=(cx,cy,m)=>mul(T(cx,cy),mul(m,T(-cx,-cy)));
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
// SVG elliptical arc to points (endpoint to centre conversion, SVG 1.1 F.6.5).
function arcPts(p0,rx,ry,phi,large,sweep,p1,n=24){
 const f=phi*Math.PI/180,cf=Math.cos(f),sf=Math.sin(f),dx=(p0[0]-p1[0])/2,dy=(p0[1]-p1[1])/2,x1=cf*dx+sf*dy,y1=-sf*dx+cf*dy;
 rx=Math.abs(rx);ry=Math.abs(ry);const L=x1*x1/(rx*rx)+y1*y1/(ry*ry);if(L>1){rx*=Math.sqrt(L);ry*=Math.sqrt(L);}
 const num=rx*rx*ry*ry-rx*rx*y1*y1-ry*ry*x1*x1,den=rx*rx*y1*y1+ry*ry*x1*x1,k=(large===sweep?-1:1)*Math.sqrt(Math.max(0,num/den));
 const cx1=k*rx*y1/ry,cy1=-k*ry*x1/rx,cx=cf*cx1-sf*cy1+(p0[0]+p1[0])/2,cy=sf*cx1+cf*cy1+(p0[1]+p1[1])/2;
 const ang=(ux,uy,vx,vy)=>{const a=Math.atan2(ux*vy-uy*vx,ux*vx+uy*vy);return a;};
 const t1=ang(1,0,(x1-cx1)/rx,(y1-cy1)/ry);let dt=ang((x1-cx1)/rx,(y1-cy1)/ry,(-x1-cx1)/rx,(-y1-cy1)/ry);
 if(!sweep&&dt>0)dt-=2*Math.PI;else if(sweep&&dt<0)dt+=2*Math.PI;
 const out=[];for(let i=1;i<=n;i++){const t=t1+dt*i/n;out.push([cx+rx*Math.cos(t)*cf-ry*Math.sin(t)*sf,cy+rx*Math.cos(t)*sf+ry*Math.sin(t)*cf]);}return out;
}
/** Path data to points; straight counts the straight segments (L and a closing Z). */
function pathPts(d){const tok=d.match(/[MLCAZmlcaz]|-?\d*\.?\d+(?:e-?\d+)?/g);let i=0,cur=[0,0],start=[0,0],cmd='',straight=0;const pts=[];const num=()=>parseFloat(tok[i++]);
 while(i<tok.length){if(/[A-Za-z]/.test(tok[i]))cmd=tok[i++];
  if(cmd==='M'){cur=[num(),num()];start=cur;pts.push(cur);cmd='L';}
  else if(cmd==='L'){const p=[num(),num()];if(dist(p,cur)>.01)straight++;pts.push(p);cur=p;}
  else if(cmd==='C'){const c1=[num(),num()],c2=[num(),num()],p=[num(),num()];for(let k=1;k<=16;k++){const t=k/16,u=1-t;pts.push([u*u*u*cur[0]+3*u*u*t*c1[0]+3*u*t*t*c2[0]+t*t*t*p[0],u*u*u*cur[1]+3*u*u*t*c1[1]+3*u*t*t*c2[1]+t*t*t*p[1]]);}cur=p;}
  else if(cmd==='A'){const rx=num(),ry=num(),phi=num(),la=num(),sw=num(),p=[num(),num()];pts.push(...arcPts(cur,rx,ry,phi,la,sw,p));cur=p;}
  else if(cmd==='Z'||cmd==='z'){if(dist(cur,start)>.01)straight++;cur=start;}
  else throw new Error('path command '+cmd);}
 return {pts,straight};}
/** Every mark as a primitive in picture units: outline points, closedness, shading and the pattern's direction. */
function flatten(marks,M=I,out=[]){
 const scale=m=>Math.sqrt(Math.abs(m[0]*m[3]-m[1]*m[2]));
 for(const m of marks){
  const base={fill:m.fill??'white',w:(m.w??m.sw??2)*scale(M),dash:!!m.dash,c:m.c??'ink',pat:m.fill==='stripes'?lin(M,[-.7071,.7071]):m.fill==='checks'?lin(M,[1,0]):null};
  switch(m.t){
   case 'g':{const s=m.scale??1;flatten(m.marks,mul(M,mul(T(m.x??0,m.y??0),mul(Rot(m.rotate??0),Sc(s*(m.flip==='x'?-1:1),s*(m.flip==='y'?-1:1))))),out);break;}
   case 'line':out.push({...base,kind:'line',fill:'none',closed:false,pts:[ap(M,[m.x1,m.y1]),ap(M,[m.x2,m.y2])],sides:1});break;
   case 'poly':{const pts=[];for(let i=0;i<m.pts.length;i+=2)pts.push(ap(M,[m.pts[i],m.pts[i+1]]));out.push({...base,kind:'poly',closed:!m.open,pts,fill:m.open?'none':base.fill});break;}
   case 'circle':case 'ellipse':{const rx=m.r??m.rx,ry=m.r??m.ry,pts=[];for(let i=0;i<72;i++){const a=i*Math.PI/36;pts.push(ap(M,[m.x+rx*Math.cos(a),m.y+ry*Math.sin(a)]));}out.push({...base,kind:'circle',closed:true,pts,sides:0,r:rx*scale(M)});break;}
   case 'rect':out.push({...base,kind:'rect',closed:true,pts:[[m.x,m.y],[m.x+m.w,m.y],[m.x+m.w,m.y+m.h],[m.x,m.y+m.h]].map(p=>ap(M,p)),sides:4});break;
   case 'path':{const {pts,straight}=pathPts(m.d);out.push({...base,kind:'path',closed:/z\s*$/i.test(m.d.trim()),pts:pts.map(p=>ap(M,p)),sides:straight});break;}
   case 'text':out.push({kind:'text',s:m.s,x:ap(M,[m.x,m.y])[0],y:ap(M,[m.x,m.y])[1],pts:[]});break;
  }}
 return out;
}
/** Corners of a polygon outline after merging points that lie on a straight run. */
function cornersOf(p){if(p.kind!=='poly'&&p.kind!=='rect')return null;let v=p.pts.filter((q,i,a)=>dist(q,a[(i+1)%a.length])>.2);
 for(let changed=true;changed&&v.length>3;){changed=false;for(let i=0;i<v.length;i++){const a=v[(i+v.length-1)%v.length],b=v[i],c=v[(i+1)%v.length],t=Math.abs(Math.atan2(c[1]-b[1],c[0]-b[0])-Math.atan2(b[1]-a[1],b[0]-a[0]))%(2*Math.PI);if(Math.min(t,2*Math.PI-t)<3*Math.PI/180){v.splice(i,1);changed=true;break;}}}return v;}
const sidesOf=p=>p.kind==='poly'||p.kind==='rect'?cornersOf(p).length:p.sides;
/** Points every ~1.5 units along the outline (for comparing shapes). */
function samples(p){if(p._s)return p._s;const out=[],pts=p.pts,n=pts.length,segs=p.closed?n:n-1;if(p.kind==='circle'||p.kind==='path'&&n>30){p._s=pts;return pts;}
 for(let i=0;i<segs;i++){const a=pts[i],b=pts[(i+1)%n],k=Math.max(1,Math.ceil(dist(a,b)/1.5));for(let j=0;j<k;j++)out.push([a[0]+(b[0]-a[0])*j/k,a[1]+(b[1]-a[1])*j/k]);}if(!p.closed)out.push(pts[n-1]);p._s=out;return out;}
function haus(A,B){let h=0;for(const [pa,pb] of [[A,B],[B,A]])for(const a of pa){let m=1e9;for(const b of pb){const d=(a[0]-b[0])**2+(a[1]-b[1])**2;if(d<m){m=d;if(m<h)break;}}if(m>h)h=m;}return Math.sqrt(h);}
const patAngle=(p,mod)=>{let a=Math.atan2(p.pat[1],p.pat[0])*180/Math.PI;return ((a%mod)+mod)%mod;};
function samePattern(a,b){if(a.fill!==b.fill)return false;if(!a.pat)return true;const mod=a.fill==='stripes'?180:90,d=Math.abs(patAngle(a,mod)-patAngle(b,mod));return Math.min(d,mod-d)<5;}
const outlineType=p=>p.kind==='circle'?'round':p.kind==='poly'||p.kind==='rect'?'poly'+(p._n??=cornersOf(p).length):p.kind;
function compatible(a,b){return a.kind==='text'?b.kind==='text'&&a.s===b.s:b.kind!=='text'&&a.closed===b.closed&&outlineType(a)===outlineType(b)&&a.dash===b.dash&&Math.abs(a.w-b.w)<.8&&samePattern(a,b);}
/** Do two pictures (lists of primitives) look the same, to within tol units? */
const meanOf=p=>{if(p._m)return p._m;const s=samples(p);let x=0,y=0;for(const q of s){x+=q[0];y+=q[1];}return p._m=s.length?[x/s.length,y/s.length]:[p.x,p.y];};
function same(A,B,tol=2){if(A.length!==B.length)return false;const used=new Set();
 for(const a of A){let hit=-1;const ma=meanOf(a);for(let j=0;j<B.length;j++){if(used.has(j)||!compatible(a,B[j]))continue;if(dist(ma,meanOf(B[j]))>tol*3)continue;
  if(a.kind==='text'?dist([a.x,a.y],[B[j].x,B[j].y])<=tol:haus(samples(a),samples(B[j]))<=tol){hit=j;break;}}if(hit<0)return false;used.add(hit);}return true;}
function box(A){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const p of A)for(const [x,y] of p.pts){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}return [x0,y0,x1,y1];}
function xform(A,M){return A.map(p=>({...p,_s:undefined,_m:undefined,pts:p.pts.map(q=>ap(M,q)),pat:p.pat?lin(M,p.pat):null,...(p.kind==='text'?{x:ap(M,[p.x,p.y])[0],y:ap(M,[p.x,p.y])[1]}:{})}));}
const centre=A=>{const [a,b,c,d]=box(A);return xform(A,T(50-(a+c)/2,50-(b+d)/2));};
const turn=(A,deg)=>xform(A,about(50,50,Rot(deg)));
const mirror=(A,axis='x')=>xform(A,about(50,50,axis==='x'?Sc(-1,1):Sc(1,-1)));
/** Same picture, ignoring where it sits. */
const sameLook=(A,B,tol=2)=>same(centre(A),centre(B),tol);
/** Turns (degrees, in steps) that make A look like B. */
const turnsTo=(A,B,step=5)=>{const out=[];for(let d=0;d<360;d+=step)if(sameLook(turn(A,d),B))out.push(d);return out;};
const isTurn=(A,B)=>turnsTo(A,B).length>0;
/** Has a line of symmetry in some direction (checked every 5°). */
const hasMirrorLine=A=>isTurn(mirror(A),A);
const uprightMirror=A=>sameLook(mirror(A),A);

/** Paints a picture onto a grid of half-unit cells (after centring it), in drawing order: fills, patterns and pen strokes. */
const RES=.5,GRID=Math.ceil(112/RES);
function raster(A){const P=centre(A).filter(p=>p.kind!=='text'),g=new Uint16Array(GRID*GRID),cell=v=>Math.floor((v+6)/RES);
 const code=p=>p.fill==='grey'?1:p.fill==='black'?2:p.fill==='stripes'?10+Math.round(patAngle(p,180)/15)%12:p.fill==='dots'?30:p.fill==='checks'?40+Math.round(patAngle(p,90)/15)%6:p.fill==='white'?3:0;
 for(const p of P){const [x0,y0,x1,y1]=box([p]);
  if(p.closed&&p.fill!=='none'){const c=code(p);for(let i=Math.max(0,cell(x0));i<=Math.min(GRID-1,cell(x1));i++)for(let j=Math.max(0,cell(y0));j<=Math.min(GRID-1,cell(y1));j++){const x=i*RES-6+RES/2,y=j*RES-6+RES/2;if(insidePt(p,[x,y]))g[j*GRID+i]=c;}}
  const half=Math.max(.6,p.w/2)+RES/2;for(const [x,y] of samples(p))for(let i=Math.max(0,cell(x-half));i<=Math.min(GRID-1,cell(x+half));i++)for(let j=Math.max(0,cell(y-half));j<=Math.min(GRID-1,cell(y+half));j++){const cx=i*RES-6+RES/2,cy=j*RES-6+RES/2;if(Math.hypot(cx-x,cy-y)<=half)g[j*GRID+i]=2;}}
 return g;}
/** Area (square units) where two pictures, centred on each other, are painted differently. */
function paintedDiff(ga,gb){let n=0;for(let i=0;i<ga.length;i++)if((ga[i]||3)!==(gb[i]||3))n++;return n*RES*RES;}

// ================================================================ reading pictures
const isFrame=p=>p.kind==='rect'&&p.fill==='none';
function prims(v){if(v.kind!=='figure')throw new Error('expected a figure, got '+v.kind);return flatten(v.marks).filter(p=>!isFrame(p));}
function area(p){const s=p.pts;let a=0;for(let i=0;i<s.length;i++){const j=(i+1)%s.length;a+=s[i][0]*s[j][1]-s[j][0]*s[i][1];}return Math.abs(a)/2;}
function centroid(p){const s=p.pts;let a=0,x=0,y=0;for(let i=0;i<s.length;i++){const j=(i+1)%s.length,k=s[i][0]*s[j][1]-s[j][0]*s[i][1];a+=k;x+=(s[i][0]+s[j][0])*k;y+=(s[i][1]+s[j][1])*k;}return [x/(3*a),y/(3*a)];}
function insidePt(p,[x,y]){const s=p.pts;let c=false;for(let i=0,j=s.length-1;i<s.length;j=i++){const [xi,yi]=s[i],[xj,yj]=s[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c;}return c;}
/** Splits a picture into shapes (outlined with a normal pen), dots (thin-edged small circles) and lines. */
function read(v){const P=Array.isArray(v)?v:prims(v),shapes=P.filter(p=>p.closed&&p.kind!=='line'&&!(p.kind==='circle'&&p.w<1.5)),dots=P.filter(p=>p.kind==='circle'&&p.w<1.5),lines=P.filter(p=>p.kind==='line');
 shapes.forEach(s=>{s.area=area(s);s.c=centroid(s);s.n=sidesOf(s);});dots.forEach(d=>{d.c=centroid(d);});return {P,shapes,dots,lines};}
/** Normalised outline for comparing kinds of shape: centred on its area centre and scaled to unit size. */
function norm(p){const c=centroid(p),k=1/Math.sqrt(area(p));return samples(p).map(([x,y])=>[(x-c[0])*k,(y-c[1])*k]);}
const sameKind=(a,b)=>outlineType(a)===outlineType(b)&&haus(norm(a),norm(b))<.09;
/** Interior angles of a polygon outline (degrees). */
function anglesOf(p){const v=cornersOf(p);if(!v)return [];const n=v.length;let s=0;for(let i=0;i<n;i++){const j=(i+1)%n;s+=v[i][0]*v[j][1]-v[j][0]*v[i][1];}
 return v.map((b,i)=>{const a=v[(i+n-1)%n],c=v[(i+1)%n];let d=Math.abs(Math.atan2(a[1]-b[1],a[0]-b[0])-Math.atan2(c[1]-b[1],c[0]-b[0]))*180/Math.PI;if(d>180)d=360-d;const cr=(b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]);return cr*s<0?360-d:d;});}
const shapeFeats=p=>{const ang=anglesOf(p),v=cornersOf(p),edges=v?v.map((q,i)=>dist(q,v[(i+1)%v.length])):[];
 return {sides:p.n,right:ang.some(a=>Math.abs(a-90)<3)?'yes':ang.some(a=>Math.abs(a-90)<=12)?'maybe':'no',sym:hasMirrorLine([p]),regular:!!v&&Math.max(...edges)/Math.min(...edges)<1.04&&Math.max(...ang)-Math.min(...ang)<3,convex:ang.every(a=>a<180),fill:p.fill};};

/** Two small shapes of similar size sitting on top of each other (one would hide the other). */
function crowded(P){const small=P.filter(p=>p.closed&&p.kind!=='line'&&p.kind!=='text').map(p=>({p,a:area(p),c:centroid(p)})).filter(x=>x.a<800);
 const within=(x,y)=>samples(x.p).every(q=>insidePt(y.p,q)||samples(y.p).some(r=>dist(q,r)<1));
 for(let i=0;i<small.length;i++)for(let j=i+1;j<small.length;j++){const a=small[i],b=small[j];if(Math.max(a.a,b.a)/Math.min(a.a,b.a)>3)continue;if(dist(a.c,b.c)<6&&!within(a,b)&&!within(b,a))return true;}return false;}

/** Dots too close to each other or to an outline to count easily (dots are the thin-edged small circles). */
function crampedDots(P){const dots=P.filter(p=>p.kind==='circle'&&p.w<1.5).map(p=>({c:centroid(p),r:Math.sqrt(area(p)/Math.PI)})),outlines=P.filter(p=>p.closed&&p.kind!=='text'&&!(p.kind==='circle'&&p.w<1.5)),lines=P.filter(p=>p.kind==='line');
 for(let i=0;i<dots.length;i++)for(let j=i+1;j<dots.length;j++)if(dist(dots[i].c,dots[j].c)<dots[i].r+dots[j].r+1.5)return 'two dots touch';
 for(const d of dots){for(const o of outlines){const s=samples(o);if(s.some(q=>dist(q,d.c)<d.r+1.5)&&!s.every(q=>dist(q,d.c)<d.r+1.5))return 'a dot touches an outline';}
  for(const l of lines)if(samples(l).some(q=>dist(q,d.c)<d.r+1))return 'a line runs into a dot';}
 return '';}

/** A little shape and another small part (dot or little shape) under 3 units apart look joined at tile size.
 *  (Two dots are checked by crampedDots; overlapping or nested parts by crowded.) */
function tightParts(P){const small=P.filter(p=>p.closed&&p.kind!=='text'&&p.kind!=='line'&&area(p)<400),isDot=p=>p.kind==='circle'&&p.w<1.5;
 for(let i=0;i<small.length;i++)for(let j=i+1;j<small.length;j++){const a=small[i],b=small[j];if(isDot(a)&&isDot(b))continue;
  const sa=samples(a),sb=samples(b);if(sa.some(q=>insidePt(b,q))||sb.some(q=>insidePt(a,q)))continue;
  let m=Infinity;for(const q of sa)for(const r of sb){const d=dist(q,r);if(d<m)m=d;}
  if(m<3)return `two small parts are only ${m.toFixed(1)} units apart`;}
 return '';}

/** Two black parts that touch or overlap read as one blob (a black triangle on a black shape, a black dot on black). */
function blackMerge(P){const B=P.filter(p=>p.closed&&p.kind!=='text'&&p.fill==='black');
 for(let i=0;i<B.length;i++)for(let j=i+1;j<B.length;j++){const a=B[i],b=B[j],sa=samples(a),sb=samples(b);
  if(sa.some(q=>insidePt(b,q))||sb.some(q=>insidePt(a,q)))return 'two black parts overlap and read as one shape';
  let m=Infinity;for(const q of sa)for(const r of sb){const d=dist(q,r);if(d<m)m=d;}if(m<1.5)return 'two black parts touch and read as one shape';}
 return '';}

// ================================================================ fairness helpers
const tally=vals=>{const m=new Map();for(const v of vals)m.set(String(v),(m.get(String(v))??0)+1);return m;};
/** Which option (index) a feature singles out as the only one different from all the rest, or -1. */
function singled(vals){const t=tally(vals);if(t.size!==2)return -1;for(const [v,c] of t)if(c===1)return vals.findIndex(x=>String(x)===v);return -1;}
/** Red herrings must not single out a wrong option; surface features (shading, size) must not single out the answer either. */
function fairOdd(id,feats,ans,surface=[]){for(const k of Object.keys(feats[0])){const vals=feats.map(f=>f[k]);if(k==='right'&&vals.includes('maybe')){for(const m of ['yes','no']){const s=singled(vals.map(v=>v==='maybe'?m:v));if(s>=0&&s!==ans)fail(id,`feature "${k}" (maybe read as ${m}) singles out a wrong option`);}continue;}
  const s=singled(vals);if(s>=0&&s!==ans)fail(id,`feature "${k}" singles out a wrong option (${vals.join(', ')})`);if(s===ans&&surface.includes(k))fail(id,`surface feature "${k}" alone singles out the answer`);
  const t=tally(vals);if(surface.includes(k)&&t.get(String(vals[ans]))===1&&[...t.values()].filter(c=>c===1).length===1&&vals.length>2)fail(id,`surface feature "${k}" makes the answer the only unique picture`);}}
/** Group and pair: the answer keeps every feature the examples share; each wrong option breaks at least one. */
function fairShared(id,ex,ans,wrong){const keys=Object.keys(ex[0]).filter(k=>ex.every(e=>String(e[k])===String(ex[0][k])));
 for(const k of keys)if(String(ans[k])!==String(ex[0][k]))fail(id,`the answer breaks the shared feature "${k}" (${ex[0][k]} in every example, ${ans[k]} in the answer)`);
 wrong.forEach((w,i)=>{if(keys.every(k=>String(w[k])===String(ex[0][k])))fail(id,`wrong option ${i+1} keeps every shared feature (${keys.join(', ')})`);});}
const cmp=(a,b)=>a<b?'less':a>b?'more':'same';
/** Positions compared with a tolerance: shapes side by side are not "above" each other. */
const cmpAt=(a,b,t=8)=>a<b-t?'less':a>b+t?'more':'same';
/** Sizes as a pupil sees them: one shape is bigger only if its area is clearly larger. */
const sizeRel=(a,b)=>a>b*1.35?'bigger':b>a*1.35?'smaller':'similar';

// ================================================================ family rules
// Each returns, for every option, whether it fits the rule (read from the drawings), and may add fairness checks.
const onlyShape=(id,o)=>{if(o.shapes.length!==1)fail(id,`expected one shape, found ${o.shapes.length}`);return o.shapes[0];};
const bySize=o=>[...o.shapes].sort((a,b)=>b.area-a.area);
const FAMILY={
 'odd-sides'(id,q,O){const s=O.map(o=>onlyShape(id,o)),f=s.map(shapeFeats),ans=q.ans;fairOdd(id,f.map(({sides,...r})=>r),ans,['fill']);
  const k=singled(s.map(x=>x.n));return s.map((_,i)=>i===k);},
 'odd-inout'(id,q,O){const f=O.map(o=>{const s=onlyShape(id,o),inn=o.dots.filter(d=>insidePt(s,d.c)).length,outside=o.dots.filter(d=>!insidePt(s,d.c)),corner=outside.filter(d=>Math.abs(d.c[0]-50)>25&&Math.abs(d.c[1]-50)>25).length;
   return {inn,out:o.dots.length-inn,fill:s.fill,sides:s.n,spots:corner===outside.length?'corners':corner===0?'edges':'mixed'};});
  fairOdd(id,f.map(({inn,out,fill,sides,spots})=>({inn,out,fill,sides,spots})),q.ans,['fill']);const ok=f.map(x=>x.inn===x.out);return oddFrom(ok);},
 'odd-copy'(id,q,O){const ok=O.map(o=>{const [a,b]=bySize(o);if(o.shapes.length!==2||!insidePt(a,b.c))fail(id,'expected a small shape inside a large one');return sameKind(a,b);});
  fairOdd(id,O.map(o=>{const [a,b]=bySize(o);return {outer:a.fill,inner:b.fill};}),q.ans,['outer','inner']);return oddFrom(ok);},
 'odd-black-more'(id,q,O){const f=O.map(o=>{const b=o.shapes.find(s=>s.fill==='black'),w=o.shapes.find(s=>s.fill==='white');if(!b||!w||o.shapes.length!==2)fail(id,'expected one black and one white shape');return {b,w};});
  fairOdd(id,f.map(({b,w})=>({bs:b.n,ws:w.n,bigger:sizeRel(b.area,w.area),left:cmpAt(b.c[0],w.c[0]),top:cmpAt(b.c[1],w.c[1]),gap:Math.abs(b.n-w.n)})),q.ans,['bigger']);return oddFrom(f.map(({b,w})=>b.n>w.n));},
 'odd-mirror'(id,q,O){const P=O.map(o=>o.P);P.forEach((p,i)=>P.forEach((r,j)=>{if(i<j&&i!==q.ans&&j!==q.ans&&turnsTo(p,r).some(a=>a%90))fail(id,'two figures differ by a turn that is not a quarter or half turn');}));return P.map((p,i)=>P.every((r,j)=>j===i||!isTurn(p,r))&&P.every((r,j)=>j===i||isTurn(mirror(p),r))&&P.filter((_,j)=>j!==i).every((r,j,rest)=>rest.every(t=>isTurn(r,t))));},
 'group-odd-dots'(id,q,O,S){const feat=o=>{const s=onlyShape(id,o),n=o.dots.length;if(!o.dots.every(d=>insidePt(s,d.c)))fail(id,'a dot is outside its shape');return {kind:s.n+':'+s.kind,fill:s.fill,sides:s.n,sidesOdd:s.n%2,dotsOdd:n%2,vs:cmp(n,s.n)};};
  if(!S.every(s=>s.dots.length%2===1))fail(id,'a group picture has an even number of dots');fairShared(id,S.map(feat),feat(O[q.ans]),O.filter((_,i)=>i!==q.ans).map(feat));return O.map(o=>o.dots.length%2===1);},
 'group-dot-more'(id,q,O,S){const feat=o=>{const d=o.dots[0],[a,b]=o.shapes,t=insidePt(a,d.c)?a:insidePt(b,d.c)?b:null,u=t===a?b:a;if(o.dots.length!==1||o.shapes.length!==2)fail(id,'expected two shapes and one dot');
   return {inShape:!!t,more:!!t&&t.n>u.n,bigger:t?sizeRel(t.area,u.area):'-',left:t?cmpAt(t.c[0],u.c[0]):'-',top:t?cmpAt(t.c[1],u.c[1]):'-',fill:t?t.fill:'-',other:u.fill};};
  if(!S.every(s=>feat(s).more))fail(id,'a group picture breaks the rule');fairShared(id,S.map(feat),feat(O[q.ans]),O.filter((_,i)=>i!==q.ans).map(feat));return O.map(o=>feat(o).more);},
 'group-symmetry'(id,q,O,S){if(!S.every(s=>uprightMirror(s.P)))fail(id,'a group picture is not symmetrical');O.forEach((o,i)=>{if(i!==q.ans&&hasMirrorLine(o.P))fail(id,`wrong option ${i} has a line of symmetry`);
   if(i!==q.ans){const d=paintedDiff(raster(o.P),raster(mirror(o.P)));if(d<100)fail(id,`wrong option ${q.q.options[i]} is only slightly lopsided (${Math.round(d)} square units)`);}});
  return O.map(o=>uprightMirror(o.P));},
 'group-equal'(id,q,O,S){const oneKind=list=>list.every(s=>sameKind(s,list[0]));const feat=o=>{const bl=o.shapes.filter(s=>s.fill==='black'),wh=o.shapes.filter(s=>s.fill==='white'),b=bl.length,w=wh.length;if(b+w!==o.shapes.length)fail(id,'unexpected shading');return {eq:b===w,even:(b+w)%2,blackSame:oneKind(bl),whiteSame:oneKind(wh)};};
  if(!S.every(s=>feat(s).eq))fail(id,'a group picture breaks the rule');fairShared(id,S.map(feat),feat(O[q.ans]),O.filter((_,i)=>i!==q.ans).map(feat));return O.map(o=>feat(o).eq);},
 'pair-fewer'(id,q,O,S){const feat=o=>{const [a,b]=bySize(o);if(o.shapes.length!==2||!insidePt(a,b.c))fail(id,'expected a small shape inside a large one');return {diff:a.n-b.n,outerOdd:a.n%2,innerOdd:b.n%2,of:a.fill,inf:b.fill,same:sameKind(a,b)};};
  if(!S.every(s=>feat(s).diff===1))fail(id,'a pair picture breaks the rule');fairShared(id,S.map(feat),feat(O[q.ans]),O.filter((_,i)=>i!==q.ans).map(feat));return O.map(o=>feat(o).diff===1);},
 'pair-rays'(id,q,O,S){const feat=o=>{const s=onlyShape(id,o);if(!o.dots.every(d=>insidePt(s,d.c)))fail(id,'a dot is outside the shape');if(!o.lines.every(l=>!insidePt(s,l.pts[0])&&!insidePt(s,l.pts[1])))fail(id,'a line is inside the shape');
   // Two rays pointing (nearly) opposite ways look like one line drawn through the shape, so the count is unclear.
   const dirs=o.lines.map(l=>{const m=[(l.pts[0][0]+l.pts[1][0])/2,(l.pts[0][1]+l.pts[1][1])/2];return Math.atan2(m[1]-s.c[1],m[0]-s.c[0])*180/Math.PI;});
   dirs.forEach((a,i)=>dirs.forEach((b,j)=>{const d=Math.abs(((a-b)%360+540)%360-180);if(i<j&&d>150)fail(id,'two lines point opposite ways and read as one line through the shape');}));
   const n=o.lines.length,d=o.dots.length,c=o.dots.map(x=>x.c),line=c.length<2?'one':c.every(p=>Math.abs((c[1][0]-c[0][0])*(p[1]-c[0][1])-(c[1][1]-c[0][1])*(p[0]-c[0][0]))<1)?'line':'spread';
   return {eq:n===d,nOdd:n%2,dOdd:d%2,ns:cmp(n,s.n),ds:cmp(d,s.n),fill:s.fill,line};};
  if(!S.every(s=>feat(s).eq))fail(id,'a pair picture breaks the rule');fairShared(id,S.map(feat),feat(O[q.ans]),O.filter((_,i)=>i!==q.ans).map(feat));return O.map(o=>feat(o).eq);},
 'pair-nest'(id,q,O,S){const order=o=>{const s=bySize(o);if(s.length!==3||!sameKind(s[0],s[1])||!sameKind(s[1],s[2])||!insidePt(s[0],s[2].c))fail(id,'expected three nested copies of one shape');return s.map(x=>x.fill).join('>');};
  if(order(S[0])!==order(S[1]))fail(id,'the pair is shaded differently');return O.map(o=>order(o)===order(S[0]));},
 'rot-any'(id,q,O){const F=prims(q.q.visual);O.forEach((o,i)=>{if(sameLook(F,o.P))fail(id,`option ${i} is the figure unchanged`);});
  const t=turnsTo(F,O[q.ans].P);if(!t.length||t.some(a=>a%90))fail(id,`the answer is turned by ${t.join('/')}°, not a quarter or half turn`);return O.map(o=>isTurn(F,o.P)&&!sameLook(F,o.P));},
 'rot-by'(id,q,O){const F=prims(q.q.visual),t=q.audit.rule.angle,want=turn(F,t);if(![90,180,270].includes(t))fail(id,`a turn of ${t}° is not a quarter or half turn`);
  const words={45:'an eighth of a turn clockwise',90:'a quarter turn clockwise',180:'half a turn',270:'a quarter turn anticlockwise',315:'an eighth of a turn anticlockwise'}[t];if(!q.q.prompt.includes(words))fail(id,`the prompt does not say "${words}"`);
  return O.map(o=>sameLook(want,o.P));},
 reflect(id,q,O){const {rest,upright,at}=mirrorLine(prims(q.q.visual));if(upright!==(q.audit.rule.axis==='x'))fail(id,'mirror line direction differs from the rule');
  const img=xform(rest,upright?about(at,0,Sc(-1,1)):about(0,at,Sc(1,-1)));return O.map(o=>sameLook(img,o.P));},
 'ana-turn-shade'(id,q,O,S){return anaIso(id,q,O,S,A=>turn(A,q.audit.rule.theta));},
 'ana-mirror-shade'(id,q,O,S){return anaIso(id,q,O,S,A=>mirror(A,'x'));},
 'ana-swap'(id,q,O,S){const two=o=>{const [a,b]=bySize(o);if(o.shapes.length!==2||!insidePt(a,b.c))fail(id,'expected a small shape inside a large one');return {o:a,i:b};};
  const [A,B,C]=S.map(two);if(!(sameKind(A.o,B.i)&&sameKind(A.i,B.o))||A.o.fill!==B.o.fill||A.i.fill!==B.i.fill)fail(id,'the example pair is not a swap');
  return O.map(o=>{const x=two(o);return sameKind(x.o,C.i)&&sameKind(x.i,C.o)&&x.o.fill===C.o.fill&&x.i.fill===C.i.fill;});},
 'ana-count'(id,q,O,S){const f=o=>{const s=onlyShape(id,o);if(!o.dots.every(d=>insidePt(s,d.c)))fail(id,'a dot is outside its shape');return [s.n,o.dots.length];};
  const [[sa,da],[sb,db],[sc,dc]]=S.map(f),want=[sc+sb-sa,dc+db-da],fitsW=O.map(o=>{const [s,d]=f(o);return s===want[0]&&d===want[1];});
  // A pupil might instead read "the dots are always k fewer than the sides"; if that holds in the example pair it must not pick another option.
  if(da-sa===db-sb)O.forEach((o,i)=>{const [s,d]=f(o);if(i!==q.ans&&s===want[0]&&d===want[0]+db-sb)fail(id,'a second reading of the change picks a wrong option');});
  return fitsW;},
 order(id,q,O){const v=q.q.visual,{tiles,examples}=q.audit.stem,{ops,order}=q.audit.rule;
  examples.forEach((op,k)=>{const before=groupPrims(v,tiles[2*k]),after=groupPrims(v,tiles[2*k+1]);if(!sameLook(OPS[op](before),after))fail(id,`example ${k+1} does not show ${op}`);
   const also=Object.keys(OPS).filter(o=>sameLook(OPS[o](before),after));if(also.length!==1)fail(id,`example ${k+1} could show ${also.join(' or ')}`);});
  let P=groupPrims(v,tiles[6]);for(const k of order)P=OPS[ops[k-1]](P);if(!q.q.prompt.includes(order.join(' → ')))fail(id,'the prompt does not give the order');
  return O.map(o=>sameLook(P,o.P));},
 'seq-turn'(id,q,O){const T=seqItems(q),g=T.indexOf(null);let steps=null;
  for(let i=0;i+1<T.length;i++)if(T[i]&&T[i+1]){const s=turnsTo(T[i].P,T[i+1].P);steps=steps?steps.filter(x=>s.includes(x)):s;}
  if(g>0&&g<T.length-1){const s=turnsTo(T[g-1].P,T[g+1].P);steps=(steps??[]).filter(x=>s.includes((2*x)%360));}
  if(!steps?.length){fail(id,'no single turn explains the sequence');return O.map(()=>false);}
  if(steps.some(a=>a%90))fail(id,`the sequence turns by ${steps.join('/')}°, not a quarter or half turn`);
  const preds=steps.map(st=>g>0?turn(T[g-1].P,st):turn(T[1].P,-st));if(!preds.every(p=>sameLook(p,preds[0])))fail(id,'different turns explain the sequence');
  return O.map(o=>sameLook(preds[0],o.P));},
 'seq-count'(id,q,O){const T=seqItems(q),f=t=>{const s=onlyShape(id,t);if(!t.dots.every(d=>insidePt(s,d.c)))fail(id,'a dot is outside its shape');return {n:s.n,d:t.dots.length,fill:s.fill};};
  const F=T.map(t=>t?f(t):null),n=arith(F.map(x=>x?.n??null)),d=arith(F.map(x=>x?.d??null)),fill=cat(F.map(x=>x?.fill??null));
  if(n===null||d===null||fill===null){fail(id,'the sequence rule is unclear');return O.map(()=>false);}
  return O.map(o=>{const x=f(o);return x.n===n&&x.d===d&&x.fill===fill;});},
 'seq-move'(id,q,O){const T=seqItems(q),f=t=>{const frame=mainOf(t),c=frame.c,blk=t.shapes.find(s=>s.fill==='black'&&s!==frame),tri=t.shapes.find(s=>s.n===3&&s!==frame);
   if(!blk||!tri||t.shapes.length!==3)fail(id,'expected a square with a black circle and a triangle');return [around(c,blk.c,8,225),around(c,tri.c,8,225)];};
  const F=T.map(t=>t?f(t):null),a=arith(F.map(x=>x?.[0]??null),8),b=arith(F.map(x=>x?.[1]??null),8);
  if(a===null||b===null){fail(id,'the sequence rule is unclear');return O.map(()=>false);}return O.map(o=>{const [x,y]=f(o);return x===a&&y===b;});},
 'seq-shade'(id,q,O){const T=seqItems(q),f=t=>{if(t.shapes.length!==4)fail(id,'expected four squares');const c=[50,50],b=t.shapes.filter(s=>s.fill==='black'),g=t.shapes.filter(s=>s.fill==='grey');
   if(b.length!==1||g.length!==1)fail(id,'expected one black and one grey square');return [around(c,b[0].c,4,225),around(c,g[0].c,4,225)];};
  const F=T.map(t=>t?f(t):null),a=arith(F.map(x=>x?.[0]??null),4),b=arith(F.map(x=>x?.[1]??null),4);
  if(a===null||b===null){fail(id,'the sequence rule is unclear');return O.map(()=>false);}return O.map(o=>{const [x,y]=f(o);return x===a&&y===b;});},
 'mat-2x2'(id,q,O){const [a,b,c]=q.q.visual.items.slice(0,3).map(v=>prims(v)),fills=['white','grey','black','stripes'];
  const cands=[...ISOMETRIES.filter(([n])=>n!=='turn 0'),...fills.map(fl=>['shade '+fl,A=>shadeBase(A,fl)])];
  const row=cands.filter(([,t])=>sameLook(t(a),b)),col=cands.filter(([,t])=>sameLook(t(a),c));
  if(!row.length||!col.length){fail(id,'no single change explains the row or the column');return O.map(()=>false);}
  const preds=[];for(const [,tr] of row)for(const [,tc] of col){const p1=tr(c),p2=tc(b);if(!sameLook(p1,p2))fail(id,'the row and column rules disagree');preds.push(p1);}
  if(!preds.every(p=>sameLook(p,preds[0])))fail(id,'two readings of the grid give different answers');return O.map(o=>sameLook(preds[0],o.P));},
 'mat-latin'(id,q,O){const C=q.q.visual.items.map(v=>v?read(v):null),g=C.indexOf(null),known=C.filter(Boolean).map(mainOf),classes=[];
  const kindOf=s=>{let k=classes.findIndex(c=>sameKind(c,s));if(k<0){classes.push(s);k=classes.length-1;}return k;};
  const K=C.map(c=>c?kindOf(mainOf(c)):null),F=C.map(c=>c?mainOf(c).fill:null);known.forEach(kindOf);
  const missing=(vals,idx)=>{const seen=idx.map(i=>vals[i]).filter(v=>v!==null);if(new Set(seen).size!==seen.length)fail(id,'a row or column repeats a value');const all=[...new Set(vals.filter(v=>v!==null))];return all.filter(v=>!seen.includes(v));};
  const r=Math.floor(g/3),c=g%3,rowIdx=[0,1,2].map(j=>3*r+j),colIdx=[0,1,2].map(j=>3*j+c);
  for(const vals of [K,F])for(let i=0;i<3;i++){for(const idx of [[0,1,2].map(j=>3*i+j),[0,1,2].map(j=>3*j+i)])if(!idx.includes(g)&&new Set(idx.map(x=>vals[x])).size!==3)fail(id,'a full row or column does not use each value once');}
  const mk=missing(K,rowIdx),mk2=missing(K,colIdx),mf=missing(F,rowIdx),mf2=missing(F,colIdx);
  if(mk.length!==1||mk2.join()!==mk.join()||mf.length!==1||mf2.join()!==mf.join()){fail(id,'the gap is not fixed by its row and column');return O.map(()=>false);}
  return O.map(o=>{const s=mainOf(o);return o.shapes.length===1&&sameKind(s,classes[mk[0]])&&s.fill===mf[0];});},
 'mat-count'(id,q,O){const C=q.q.visual.items.map(v=>v?read(v):null),g=C.indexOf(null),classes=[],kindOf=s=>{let k=classes.findIndex(c=>sameKind(c,s));if(k<0){classes.push(s);k=classes.length-1;}return k;};
  const K=C.map(c=>c?kindOf(mainOf(c)):null),N=C.map(c=>c?c.dots.length:null);
  const rowConst=[0,1,2].every(i=>new Set([0,1,2].map(j=>K[3*i+j]).filter(v=>v!==null)).size===1),colConst=[0,1,2].every(i=>new Set([0,1,2].map(j=>K[3*j+i]).filter(v=>v!==null)).size===1);
  if(rowConst===colConst){fail(id,'the shape rule is unclear');return O.map(()=>false);}
  const r=Math.floor(g/3),c=g%3,k=rowConst?K.find((v,i)=>v!==null&&Math.floor(i/3)===r):K.find((v,i)=>v!==null&&i%3===c);
  const nr=arith([0,1,2].map(j=>N[3*r+j])),nc=arith([0,1,2].map(j=>N[3*j+c]));if(nr===null||nr!==nc){fail(id,'the counting rule is unclear');return O.map(()=>false);}
  return O.map(o=>o.shapes.length===1&&sameKind(mainOf(o),classes[k])&&o.dots.length===nr);},
 codes(id,q){const items=q.q.visual.items.map(v=>read(v)),labels=q.q.visual.labels,n=items.length,classes=[];
  if(labels[n-1]!=='?')fail(id,'the last picture should be labelled ?');
  const kindOf=s=>{let k=classes.findIndex(c=>sameKind(c,s));if(k<0){classes.push(s);k=classes.length-1;}return k;};
  const arrowDir=o=>{const a=o.shapes.find(s=>s.n===7);if(!a)return '-';const c=a.c,v=cornersOf(a);let best=v[0];for(const p of v)if(dist(p,c)>dist(best,c))best=p;return ['right','down','left','up'][around(c,best,4,-45)];};
  const areas=items.map(o=>mainOf(o).area),maxA=Math.max(...areas);
  const feats=items.map(o=>{const m=mainOf(o);return {kind:kindOf(m),sides:m.n,fill:m.fill,dots:o.dots.length,size:m.area>maxA/1.8?'big':'small',arrow:arrowDir(o)};});
  const ex=feats.slice(0,-1),tgt=feats[n-1],codes=labels.slice(0,-1),L=codes[0].length;let want='';
  for(let p=0;p<L;p++){const letters=new Set();let consistent=0;
   for(const k of Object.keys(tgt)){const m=new Map(),back=new Map();let ok=true;ex.forEach((e,i)=>{const v=String(e[k]),l=codes[i][p];if((m.get(v)??l)!==l||(back.get(l)??v)!==v)ok=false;m.set(v,l);back.set(l,v);});
    if(!ok||m.size<2)continue;consistent++;const l=m.get(String(tgt[k]));if(l)letters.add(l);}
   if(letters.size!==1){if(process.env.NVR_DEBUG)console.log(id,p,JSON.stringify(feats),codes);fail(id,`letter ${p+1} of the code is ${letters.size?'ambiguous':'not fixed'} by the examples`);return q.q.options.map(()=>false);}want+=[...letters][0];}
  return q.q.options.map(o=>o===want);},
 'cube-which'(id,q){const cells=netOf(id,q.q.visual),fr=foldNet(cells);if(!fr){fail(id,'the net does not fold into a cube');return q.q.options.map(()=>false);}
  const vs=cubeViews(cells,fr);return q.q.optionVisuals.map((v,i)=>{const seen=readCube(v);slantedClear(id,seen,`option ${q.q.options[i]}`);return vs.some(e=>viewMatches(seen,e));});},
 'net-which'(id,q){const seen=readCube(q.q.visual);slantedClear(id,seen,'the cube');return q.q.optionVisuals.map(v=>{const cells=netOf(id,v),fr=foldNet(cells);return !!fr&&cubeViews(cells,fr).some(e=>viewMatches(seen,e));});},
 'cube-opposite'(id,q){const cells=netOf(id,q.q.visual),fr=foldNet(cells);if(!fr){fail(id,'the net does not fold into a cube');return q.q.options.map(()=>false);}
  const g=cells.findIndex(c=>c.fill==='grey'),o=fr.findIndex(f=>veq(f.n,vneg(fr[g].n)));if(g<0||cells.filter(c=>c.fill==='grey').length!==1)fail(id,'expected one grey face');
  return q.q.optionVisuals.map(v=>{const P=prims(v),face=P.find(isFace),[a,b,c,d]=box([face]),cx=(a+c)/2,cy=(b+d)/2,h=(c-a)/2;
   const cont=content(face,P,([x,y])=>[(x-cx)/h,-(y-cy)/h]);return [0,90,180,270].some(r=>sameContent(cont,turnContent(cells[o].content,r)));});},
 'net-valid'(id,q){return q.q.optionVisuals.map(v=>!!foldNet(netOf(id,v)));},
 'net-not'(id,q){if(!/\bNOT\b/.test(q.q.prompt))fail(id,'a reversed question should say NOT');return q.q.optionVisuals.map(v=>!foldNet(netOf(id,v)));},
 'hidden'(id,q,O){const target=prims(q.q.visual);if(target.length!==1||target[0].kind!=='poly')fail(id,'the stem should be one outline');const v=cornersOf(target[0]);
  O.forEach((o,i)=>{if(i!==q.ans&&roughPlacement(segmentsOf(o.P),v))fail(id,`option ${q.q.options[i]} nearly contains the shape (a pupil could defend it)`);});
  return O.map(o=>placements(segmentsOf(o.P),v).length>0);},
 'pair-diagonal'(id,q,O,S){const feat=o=>{const s=onlyShape(id,o),l=o.lines[0],v=cornersOf(s),at=p=>v.findIndex(c=>dist(c,p)<1.2),i=at(l.pts[0]),j=at(l.pts[1]),n=v.length;
   const ang=((Math.atan2(l.pts[1][1]-l.pts[0][1],l.pts[1][0]-l.pts[0][0])*180/Math.PI)%180+180)%180;
   return {diag:i>=0&&j>=0&&(j-i+n)%n>1&&(i-j+n)%n>1,ends:(i>=0)+(j>=0),dir:ang<20||ang>160?'flat':ang>70&&ang<110?'upright':ang<90?'falling':'rising',fill:s.fill};};
  if(!S.every(s=>feat(s).diag))fail(id,'a pair picture breaks the rule');fairShared(id,S.map(feat),feat(O[q.ans]),O.filter((_,i)=>i!==q.ans).map(feat));return O.map(o=>feat(o).diag);},
};
// ---------------------------------------------------------------- hidden shapes: search every placement
/** Straight segments of a picture: lines and polygon sides. */
function segmentsOf(P){const out=[];for(const p of P){if(p.kind==='line')out.push([p.pts[0],p.pts[1]]);else if(p.kind==='poly'||p.kind==='rect'){const v=p.pts;for(let i=0;i<v.length;i++)if(p.closed||i<v.length-1)out.push([v[i],v[(i+1)%v.length]]);}else if(p.kind!=='text')throw new Error('curved outline in a line picture');}return out;}
function crossing([a,b],[c,d]){const r=[b[0]-a[0],b[1]-a[1]],s=[d[0]-c[0],d[1]-c[1]],den=r[0]*s[1]-r[1]*s[0];if(Math.abs(den)<1e-9)return null;const t=((c[0]-a[0])*s[1]-(c[1]-a[1])*s[0])/den,u=((c[0]-a[0])*r[1]-(c[1]-a[1])*r[0])/den;return t>-1e-6&&t<1+1e-6&&u>-1e-6&&u<1+1e-6?[a[0]+t*r[0],a[1]+t*r[1]]:null;}
/** Is the segment a→b drawn, possibly in several collinear pieces? */
function traced(segs,a,b){const L=dist(a,b),u=[(b[0]-a[0])/L,(b[1]-a[1])/L],off=p=>Math.abs((p[0]-a[0])*u[1]-(p[1]-a[1])*u[0]),along=p=>(p[0]-a[0])*u[0]+(p[1]-a[1])*u[1];
 const cover=segs.filter(([p,q])=>off(p)<.7&&off(q)<.7).map(([p,q])=>[Math.min(along(p),along(q)),Math.max(along(p),along(q))]).sort((x,y)=>x[0]-y[0]);
 let reach=0;for(const [s,e] of cover){if(s>reach+1)return false;reach=Math.max(reach,e);if(reach>=L-1)return true;}return reach>=L-1;}
/** Every position where the outline (corners v) can be traced in the picture, same size and same way round. */
function placements(segs,v){const cand=[];for(const [p,q] of segs)cand.push(p,q);for(let i=0;i<segs.length;i++)for(let j=i+1;j<segs.length;j++){const x=crossing(segs[i],segs[j]);if(x)cand.push(x);}
 const found=[];for(const c of cand){const d=[c[0]-v[0][0],c[1]-v[0][1]];if(found.some(f=>dist(f,d)<1))continue;if(v.every((p,i)=>{const q=v[(i+1)%v.length];return traced(segs,[p[0]+d[0],p[1]+d[1]],[q[0]+d[0],q[1]+d[1]]);}))found.push(d);}return found;}

// ---------------------------------------------------------------- changes applied to drawings
const isDot=p=>p.kind==='circle'&&p.w<1.5;
/** Scale about the tile centre; dots keep their size (only their centres move). */
function scaleAbout(A,k){return A.map(p=>{if(isDot(p)){const c=centroid(p),n=[50+(c[0]-50)*k,50+(c[1]-50)*k];return {...p,_s:undefined,_m:undefined,pts:p.pts.map(q=>[q[0]+n[0]-c[0],q[1]+n[1]-c[1]])};}
 return {...p,_s:undefined,_m:undefined,pts:p.pts.map(q=>[50+(q[0]-50)*k,50+(q[1]-50)*k])};});}
const dotAt=(x,y,r=4.5)=>({kind:'circle',closed:true,fill:'black',w:1,dash:false,c:'ink',pat:null,sides:0,pts:Array.from({length:72},(_,i)=>[x+r*Math.cos(i*Math.PI/36),y+r*Math.sin(i*Math.PI/36)])});
/** Re-shade the largest shape. */
function shadeBase(A,to){let big=-1,best=-1;A.forEach((p,i)=>{if(p.closed&&!isDot(p)&&p.kind!=='line'){const a=area(p);if(a>best){best=a;big=i;}}});return A.map((p,i)=>i===big?{...p,fill:to,pat:null}:p);}
const OPS={turnR:A=>turn(A,90),turnL:A=>turn(A,270),half:A=>turn(A,180),mirror:A=>mirror(A,'x'),flip:A=>mirror(A,'y'),shrink:A=>scaleAbout(A,.6),shade:A=>shadeBase(A,'black'),
 dotTop:A=>{const [x0,y0,x1]=box(A);return [...A,dotAt((x0+x1)/2,y0-9)];}};
const ISOMETRIES=[0,90,180,270].flatMap(d=>[['turn '+d,A=>turn(A,d)],['flip then turn '+d,A=>turn(mirror(A),d)]]);
/** The picture inside a placed group of a larger figure, in the group's own units. */
const groupPrims=(v,i)=>{const g=v.marks[i];if(!g||g.t!=='g')throw new Error('expected a placed picture');return flatten(g.marks).filter(p=>!isFrame(p));};
/** The dashed mirror line in a figure, and the figure without it. */
function mirrorLine(P){const m=P.filter(p=>p.kind==='line'&&p.dash);if(m.length!==1)throw new Error('expected one dashed mirror line');const [[x1,y1],[x2,y2]]=m[0].pts;return {rest:P.filter(p=>p!==m[0]),upright:Math.abs(x1-x2)<.5,at:Math.abs(x1-x2)<.5?x1:y1};}

/** Analogies made of a turn or flip plus re-shading the large shape: re-derive, and check no other turn or flip explains a → b differently. */
function anaIso(id,q,O,S,move){const to=q.audit.rule.shade,T=A=>shadeBase(move(A),to),[a,b,c]=S.map(s=>s.P);if(!sameLook(T(a),b))fail(id,'the first pair does not show the stated change');
 for(const [name,g] of ISOMETRIES){if(!sameLook(shadeBase(g(a),to),b))continue;const img=shadeBase(g(c),to);O.forEach((o,i)=>{if(i!==q.ans&&sameLook(img,o.P))fail(id,`reading the change as "${name}" picks a wrong option`);});}
 return O.map(o=>sameLook(T(c),o.P));}

// ---------------------------------------------------------------- patterns: rules re-derived from the pictures shown
/** Continue a numeric pattern with one gap: constant difference (mod m if given). Returns the missing value or null if unclear. */
function arith(vals,mod=0){const g=vals.indexOf(null),M=x=>mod?((x%mod)+mod)%mod:x;let d=null;
 for(let i=0;i+1<vals.length;i++)if(vals[i]!==null&&vals[i+1]!==null){const x=M(vals[i+1]-vals[i]);if(d!==null&&d!==x)return null;d=x;}
 if(d===null&&!mod&&g>0&&g<vals.length-1&&vals.length===3&&(vals[2]-vals[0])%2===0)d=(vals[2]-vals[0])/2;
 if(d===null)return null;if(g>0&&g<vals.length-1&&M(vals[g+1]-vals[g-1])!==M(2*d))return null;return g>0?M(vals[g-1]+d):M(vals[1]-d);}
/** Categorical pattern with one gap: constant, or alternating in twos. */
function cat(vals){const g=vals.indexOf(null),known=vals.filter(v=>v!==null),out=new Set();
 if(known.every(v=>v===known[0]))out.add(known[0]);
 const alt=vals.every((v,i)=>v===null||i+2>=vals.length||vals[i+2]===null||vals[i+2]===v)&&vals.every((v,i)=>v===null||i+1>=vals.length||vals[i+1]===null||vals[i+1]!==v);
 if(alt){const p=g>=2?vals[g-2]:vals[g+2];if(p!==null&&p!==undefined)out.add(p);}
 return out.size===1?[...out][0]:null;}
/** Index of a point round a centre, counting clockwise in steps of 360/n from the direction start (degrees). */
const around=(c,[x,y],n,start)=>Math.round((((Math.atan2(y-c[1],x-c[0])*180/Math.PI-start)%360+360)%360)/(360/n))%n;
const seqItems=q=>q.q.visual.items.map(v=>v?read(v):null);
function seqPredict(id,terms,feat){const vals=terms.map(t=>t?feat(t):null);return vals;}
/** A picture's features for matrices and codes: the main (largest) shape, its kind, shading and area, and counts. */
function mainOf(o){return bySize(o)[0];}

// ---------------------------------------------------------------- cube nets: read faces, fold, and try every position
const isFace=p=>(p.kind==='poly'||p.kind==='rect')&&p.closed&&p.w>=1.9&&cornersOf(p).length===4;
const meanPt=pts=>[pts.reduce((s,q)=>s+q[0],0)/pts.length,pts.reduce((s,q)=>s+q[1],0)/pts.length];
/** A face's content in its own units (u right, v up, −1 … 1): the symbol outlines, densely sampled, with their shading. */
function content(face,P,toLocal){return P.filter(p=>p!==face&&!isFace(p)&&insidePt(face,meanPt(p.pts))).map(p=>({fill:p.fill,pts:samples(p).map(toLocal)}));}
function sameContent(a,b){if(a.length!==b.length)return false;const used=new Set();return a.every(x=>{const j=b.findIndex((y,k)=>!used.has(k)&&y.fill===x.fill&&haus(x.pts,y.pts)<.12);if(j<0)return false;used.add(j);return true;});}
const turnContent=(c,deg)=>{const a=deg*Math.PI/180,co=Math.cos(a),si=Math.sin(a);return c.map(p=>({fill:p.fill,pts:p.pts.map(([u,v])=>[u*co+v*si,-u*si+v*co])}));};
/** A drawn net: its squares on a grid, each with its content and shading. */
function readNet(v){const P=prims(v),F=P.filter(isFace),side=Math.max(...F.map(f=>dist(cornersOf(f)[0],cornersOf(f)[1])));
 const sq=F.filter(f=>Math.abs(dist(cornersOf(f)[0],cornersOf(f)[1])-side)<.5),x0=Math.min(...sq.flatMap(f=>f.pts.map(p=>p[0]))),y0=Math.min(...sq.flatMap(f=>f.pts.map(p=>p[1])));
 return sq.map(f=>{const [a,b,c,d]=box([f]),cx=(a+c)/2,cy=(b+d)/2;return {col:Math.round((a-x0)/side),row:Math.round((b-y0)/side),fill:f.fill,content:content(f,P,([x,y])=>[(x-cx)/(side/2),-(y-cy)/(side/2)])};});}
const vadd=(a,b)=>a.map((x,i)=>x+b[i]),vneg=a=>a.map(x=>-x),vdot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],veq=(a,b)=>a.every((x,i)=>x===b[i]);
const vcross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
/** Folds a net with hinge rules: each square records the cube direction of its own outward normal, east and north. Null if not a net. */
function foldNet(cells){const at=new Map(cells.map((c,i)=>[c.col+','+c.row,i])),fr=new Map([[0,{n:[0,0,1],e:[1,0,0],no:[0,1,0]}]]),q=[0];
 const hinge={E:a=>({n:a.e,e:vneg(a.n),no:a.no}),W:a=>({n:vneg(a.e),e:a.n,no:a.no}),N:a=>({n:a.no,e:a.e,no:vneg(a.n)}),S:a=>({n:vneg(a.no),e:a.e,no:a.n})};
 while(q.length){const i=q.shift(),c=cells[i];for(const [dir,dx,dy] of [['E',1,0],['W',-1,0],['N',0,-1],['S',0,1]]){const j=at.get((c.col+dx)+','+(c.row+dy));if(j===undefined||fr.has(j))continue;fr.set(j,hinge[dir](fr.get(i)));q.push(j);}}
 if(fr.size!==cells.length||cells.length!==6)return null;const frames=cells.map((_,i)=>fr.get(i));
 if(new Set(frames.map(f=>f.n.join())).size!==6)return null;
 if(cells.some(c=>[[1,0],[0,1],[1,1]].every(([a,b])=>at.has((c.col+a)+','+(c.row+b)))))return null;
 return frames;}
const AXES=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
/** The three faces seen in each of the 24 positions: expected content of top, front and right. */
function cubeViews(cells,frames){const out=[];
 for(const U of AXES)for(const Fw of AXES){if(vdot(U,Fw)!==0)continue;const Rt=vcross(U,Fw),faces={top:[U,Rt,vneg(Fw)],front:[Fw,Rt,U],right:[Rt,vneg(Fw),U]},view={};
  for(const [name,[n,right,up]] of Object.entries(faces)){const i=frames.findIndex(f=>veq(f.n,n)),f=frames[i],x=vdot(f.no,right),y=vdot(f.no,up),r=y===1?0:x===1?90:y===-1?180:270;
   // Sanity: east must sit a quarter turn clockwise from north (no mirror image anywhere).
   const ex=vdot(f.e,right),ey=vdot(f.e,up);if(!(ex===Math.round(Math.cos(r*Math.PI/180))&&ey===-Math.round(Math.sin(r*Math.PI/180))))throw new Error('folded face is mirrored');
   view[name]={content:turnContent(cells[i].content,r),fill:cells[i].fill};}
  out.push(view);}
 return out;}
/** A drawn cube: its three faces (front square, top and right slanting back) and their contents in face units. */
function readCube(v){const P=prims(v),F=P.filter(isFace);if(F.length!==3)throw new Error('expected three faces on a cube');
 const flat=f=>{const c=cornersOf(f);return c.every((p,i)=>{const q=c[(i+1)%4];return Math.abs(p[0]-q[0])<.5||Math.abs(p[1]-q[1])<.5;});};
 const front=F.find(f=>flat(f)),others=F.filter(f=>f!==front),top=others.sort((a,b)=>meanPt(a.pts)[1]-meanPt(b.pts)[1])[0],right=others.find(f=>f!==top);
 const frame=(f,o,U,V)=>{const det=U[0]*V[1]-U[1]*V[0];return ([x,y])=>{const dx=x-o[0],dy=y-o[1];return [(dx*V[1]-dy*V[0])/det,(U[0]*dy-U[1]*dx)/det];};};
 const mk=(f,orig,uEnd,vEnd)=>{const o=meanPt(cornersOf(f));return {fill:f.fill,content:content(f,P,frame(f,o,[(uEnd[0]-orig[0])/2,(uEnd[1]-orig[1])/2],[(vEnd[0]-orig[0])/2,(vEnd[1]-orig[1])/2]))};};
 const fc=cornersOf(front),tl=fc.reduce((a,b)=>a[0]+a[1]<=b[0]+b[1]?a:b),tr=fc.find(p=>Math.abs(p[1]-tl[1])<.5&&p!==tl),bl=fc.find(p=>Math.abs(p[0]-tl[0])<.5&&p!==tl);
 const tc=cornersOf(top).sort((a,b)=>b[1]-a[1]),[fl,fr2]=tc.slice(0,2).sort((a,b)=>a[0]-b[0]),bk=tc.slice(2).sort((a,b)=>a[0]-b[0])[0];
 const rc=cornersOf(right).sort((a,b)=>a[0]-b[0]),[ft,fb]=rc.slice(0,2).sort((a,b)=>a[1]-b[1]),bb=rc.slice(2).sort((a,b)=>b[1]-a[1])[0];
 return {front:mk(front,bl,[tr[0]+bl[0]-tl[0],tr[1]+bl[1]-tl[1]],tl),top:mk(top,fl,fr2,bk),right:mk(right,fb,bb,ft)};}
/** A symbol on a slanted (sheared) face must look the same after any quarter turn, so shearing cannot change its meaning. */
function slantedClear(id,seen,where){for(const k of ['top','right']){const c=seen[k].content;if(c.length&&![90,180,270].every(r=>sameContent(c,turnContent(c,r))))fail(id,`${where}: the ${k} face shows a symbol whose direction matters`);}}
const viewMatches=(seen,exp)=>['top','front','right'].every(k=>seen[k].fill===exp[k].fill&&sameContent(seen[k].content,exp[k].content));
const netOf=(id,v)=>{const cells=readNet(v);if(cells.length!==6)fail(id,`a net has ${cells.length} squares`);return cells;};

/** Is the outline roughly traceable: every side within 2.5 units of a drawn line running the same way, gaps under 3 units?
 *  Tried for every shift that puts a corner of the outline on a line end or crossing, give or take 2 units in each direction. */
function roughPlacement(segs,v){const heading=([p,q])=>Math.atan2(q[1]-p[1],q[0]-p[0]),turnDiff=(a,b)=>{const d=Math.abs(a-b)%Math.PI;return Math.min(d,Math.PI-d);};
 const near=(a,b)=>{const L=dist(a,b),u=[(b[0]-a[0])/L,(b[1]-a[1])/L],off=p=>Math.abs((p[0]-a[0])*u[1]-(p[1]-a[1])*u[0]),along=p=>(p[0]-a[0])*u[0]+(p[1]-a[1])*u[1];
  const cover=segs.filter(s=>turnDiff(heading(s),heading([a,b]))<.12&&off(s[0])<2.5&&off(s[1])<2.5).map(([p,q])=>[Math.min(along(p),along(q)),Math.max(along(p),along(q))]).sort((x,y)=>x[0]-y[0]);
  let reach=0;for(const [s,e] of cover){if(s>reach+3)return false;reach=Math.max(reach,e);if(reach>=L-3)return true;}return reach>=L-3;};
 const pts=[];for(const [p,q] of segs)pts.push(p,q);for(let i=0;i<segs.length;i++)for(let j=i+1;j<segs.length;j++){const x=crossing(segs[i],segs[j]);if(x)pts.push(x);}
 for(const c of v)for(const p of pts)for(const dx of [-2,0,2])for(const dy of [-2,0,2]){const d=[p[0]-c[0]+dx,p[1]-c[1]+dy];
  if(v.every((a,i)=>{const b=v[(i+1)%v.length];return near([a[0]+d[0],a[1]+d[1]],[b[0]+d[0],b[1]+d[1]]);}))return true;}
 return false;}

/** For odd-one-out rules given as "follows the rule": the odd one is the only option that does not. */
function oddFrom(ok){return ok.map((x,i)=>!x&&ok.every((y,j)=>j===i||y));}

// ================================================================ run
const TILE_SLACK=1.5;
let checked=0;const families=new Map();
for(const q of bankQuestions.filter(q=>q.subject==='Non-verbal reasoning'&&(q.id.startsWith(want)||q.topic.startsWith(want)))){
 const a=nvrAudit[q.id];if(!a){fail(q.id,'no audit record');continue;}
 families.set(a.family,(families.get(a.family)??0)+1);
 const ctx={};
 if(q.optionVisuals){
  const keys=q.optionVisuals.map(v=>a.options.find(o=>o.vis===v)?.key);if(keys.some(k=>!k)){fail(q.id,'option pictures do not match the audit record');continue;}
  ctx.ans=keys.indexOf(a.answer);if(q.answers.length!==1||q.options.indexOf(q.answers[0])!==ctx.ans){fail(q.id,'marked answer differs from the audit record');continue;}
  // Pictures stay in the tile and no two options look alike.
  const P=q.optionVisuals.map(prims);
  P.forEach((p,i)=>{const [x0,y0,x1,y1]=box(p);if(x0<-TILE_SLACK||y0<-TILE_SLACK||x1>100+TILE_SLACK||y1>100+TILE_SLACK)fail(q.id,`option ${q.options[i]} is drawn outside its tile`);if(crowded(p))fail(q.id,`option ${q.options[i]} has two small shapes on top of each other`);const c=crampedDots(p)||tightParts(p)||blackMerge(p);if(c)fail(q.id,`option ${q.options[i]}: ${c}`);});
  // Two options are too alike when their outlines are within 4.5 units of each other and they differ in only a small painted area.
  const G=[];for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++)if(sameLook(P[i],P[j],4.5)){G[i]??=raster(P[i]);G[j]??=raster(P[j]);const d=paintedDiff(G[i],G[j]);
   if(d<20)fail(q.id,`options ${q.options[i]} and ${q.options[j]} look the same`);else if(d<60)fail(q.id,`options ${q.options[i]} and ${q.options[j]} differ by only ${Math.round(d)} square units`);}
  ctx.O=P.map(read);
 }
 const S=q.visual?.kind==='set'?q.visual.items.filter(Boolean).map(v=>read(v)):[];
 if(q.visual?.kind==='set')q.visual.items.forEach((v,i)=>{if(v&&v.kind==='figure'){const [x0,y0,x1,y1]=box(prims(v));if(x0<-TILE_SLACK||y0<-TILE_SLACK||x1>v.w+TILE_SLACK||y1>v.h+TILE_SLACK)fail(q.id,`stem picture ${i+1} is drawn outside its tile`);if(crowded(prims(v)))fail(q.id,`stem picture ${i+1} has two small shapes on top of each other`);const c=crampedDots(prims(v))||tightParts(prims(v))||blackMerge(prims(v));if(c)fail(q.id,`stem picture ${i+1}: ${c}`);}});
 if(q.visual?.kind==='figure'&&crowded(prims(q.visual)))fail(q.id,'the stem picture has two small shapes on top of each other');
 // Looking like one of the stem pictures (same kinds of shape, same numbers of dots and lines) must not single out the
 // answer, or a pupil could match looks instead of finding the rule.
 if(ctx.O&&S.length&&/^(group|pair)-/.test(a.family)){const kinds=(x,y)=>{const left=[...y];return x.every(s=>{const k=left.findIndex(t=>sameKind(s,t));if(k<0)return false;left.splice(k,1);return true;});};
  const looks=(x,y)=>x.dots.length===y.dots.length&&x.lines.length===y.lines.length&&x.shapes.length===y.shapes.length&&kinds(x.shapes,y.shapes);
  const echo=ctx.O.map(o=>S.some(s=>looks(o,s)));if(echo[ctx.ans]&&echo.filter(Boolean).length===1)fail(q.id,'the answer is the only option that looks like a picture in the question');}
 const rule=FAMILY[a.family];if(!rule){fail(q.id,`no independent check for family ${a.family}`);continue;}
 if(!q.optionVisuals){const k=q.options.indexOf(q.answers[0]);if(a.answer!==q.answers[0])fail(q.id,'marked answer differs from the audit record');ctx.ans=k;}
 let fits;try{fits=rule(q.id,{...ctx,audit:a,q},ctx.O,S);}catch(e){fail(q.id,`check crashed: ${e.stack.split('\n').slice(0,3).join(' | ')}`);continue;}
 const n=fits.filter(Boolean).length;
 if(n!==1)fail(q.id,`${n} options fit the rule (${fits.map((f,i)=>f?q.options[i]:null).filter(Boolean).join(', ')||'none'})`);
 else if(!fits[ctx.ans])fail(q.id,`the rule picks ${q.options[fits.indexOf(true)]} but the answer is ${q.answers[0]}`);
 checked++;
}
bankProblems.filter(p=>p.startsWith('nv-')||p.startsWith('v2-nv-')).forEach(p=>fails.push('template: '+p));
console.log('Families:',Object.fromEntries(families));
if(fails.length){console.log(`FAIL: ${fails.length} problem(s)`);fails.slice(0,60).forEach(f=>console.log(' -',f));process.exit(1);}
console.log(`PASS: ${checked} non-verbal reasoning questions re-checked from their pictures: exactly one option fits each rule and it is the marked answer.`);
