import {build,num,money,gcd,type Topic,type Draft,type Rng,type BuiltTopic} from './bank-kit';
import {label,type Visual,type Mark,type Fill} from './visual';
import {layout} from './visual-layout';
// Shared helpers for the Maths bank (lib/bank-maths-*.ts). Server only: the audit records below are for tests/bank-maths.cjs.

/** What a question was built from, so tests/bank-maths.cjs can re-solve it with its own code. k names the kind of check. */
export type Audit={k:string;[key:string]:unknown};
export type MDraft=Draft&{audit?:Audit};
/** A question maker. k counts how many questions this template has already made for the topic (0, 1, 2 …), for alternating variants. */
export type Template=(r:Rng,k:number)=>MDraft|null;
/** Audit records keyed by question ID (v2-<topic>-<nn>). */
export const mathsAudit:Record<string,Audit>={};
/** Builds a topic, taking templates in turn (question i uses templates[i % n]) and keeping each accepted question's audit record. */
export function topicSet(topic:Topic,count:number,templates:Template[]):BuiltTopic{
 return build(topic,count,(r,i)=>{
  const d=templates[i%templates.length](r,Math.floor(i/templates.length)),id=`v2-${topic.id}-${String(i+1).padStart(2,'0')}`;
  // build() asks again with the same i until a draft is accepted, so the last record written for an ID is the accepted one.
  if(d?.audit)mathsAudit[id]=d.audit;else delete mathsAudit[id];
  return d;
 });
}

// Options.
export const norm=(s:string)=>s.normalize('NFKC').replace(/[‘’]/g,"'").replace(/−/g,'-').toLowerCase().replace(/\s+/g,' ').trim();
/** Removes floating-point dust: 3.4 × 1000 → 3400. */
export const tidy=(x:number)=>Math.round(x*1e9)/1e9;
export type Opts={answer:string;wrong:string[]};
/** The answer and the first n − 1 wrong options that differ from it and from each other, both as text and as value (key).
 *  Null when fewer than min are left, so the template tries again with new numbers. */
export function pick<T>(answer:T,wrong:readonly (T|false|null|undefined)[],fmt:(x:T)=>string,key:(x:T)=>string|number=fmt,n=4,min=n-1):Opts|null{
 const a=fmt(answer),keys=new Set<string|number>([key(answer)]),texts=new Set([norm(a)]),out:string[]=[];
 for(const w of wrong){if(w===false||w===null||w===undefined)continue;if(typeof w==='number'&&!Number.isFinite(w))continue;const t=fmt(w),k=key(w);if(keys.has(k)||texts.has(norm(t)))continue;keys.add(k);texts.add(norm(t));out.push(t);if(out.length>=n-1)break;}
 return out.length>=min?{answer:a,wrong:out}:null;
}
/** Numeric options: equal values count as the same option. */
export const choices=(answer:number,wrong:readonly (number|false|null|undefined)[],fmt:(x:number)=>string=num,n=4)=>pick(tidy(answer),wrong.map(w=>typeof w==='number'?tidy(w):w),fmt,x=>tidy(x),n);
/** Text options. */
export const words4=(answer:string,wrong:readonly (string|false|null|undefined)[],n=4)=>pick(answer,wrong,s=>s,s=>norm(s),n);
/** Money in pounds with pence always shown when needed: 3.5 → "£3.50", 12 → "£12", 0.45 → "£0.45". */
export const gbp=(pounds:number,always2dp=false)=>money(Math.round(pounds*100),always2dp||Math.round(pounds*100)%100!==0);
/** Money options: same values count as the same option. */
export const moneyChoices=(answer:number,wrong:readonly (number|false|null|undefined)[],always2dp=false,n=4)=>choices(answer,wrong.map(w=>typeof w==='number'&&w>0?w:false),x=>gbp(x,always2dp),n);

// Fractions as [numerator, denominator].
export type Q=[number,number];
export function simp([n,d]:Q):Q{const g=gcd(n,d)||1,s=d<0?-1:1;return [s*n/g,s*d/g];}
export const fadd=(a:Q,b:Q):Q=>simp([a[0]*b[1]+b[0]*a[1],a[1]*b[1]]);
export const fsub=(a:Q,b:Q):Q=>simp([a[0]*b[1]-b[0]*a[1],a[1]*b[1]]);
export const fmul=(a:Q,b:Q):Q=>simp([a[0]*b[0],a[1]*b[1]]);
export const fdiv=(a:Q,b:Q):Q=>simp([a[0]*b[1],a[1]*b[0]]);
export const fkey=(q:Q)=>{const [n,d]=simp(q);return `${n}/${d}`;};
export const fval=(q:Q)=>q[0]/q[1];
/** Lowest terms as a proper fraction or mixed number: 11/8 → "1 3/8", 4/2 → "2", −3/4 → "−3/4". */
export function fmix(q:Q):string{const [n,d]=simp(q);if(d===1)return num(n);const a=Math.abs(n),w=Math.floor(a/d),r=a%d;return (n<0?'−':'')+(w?`${w} ${r}/${d}`:`${r}/${d}`);}
/** Lowest terms, improper: 11/8 → "11/8". */
export function fimp(q:Q):string{const [n,d]=simp(q);return d===1?num(n):`${n<0?'−':''}${Math.abs(n)}/${d}`;}
/** As written, not simplified: [6,8] → "6/8". */
export const fraw=(q:Q)=>`${q[0]}/${q[1]}`;
/** Fraction options in lowest terms (mixed numbers above 1); equal values count as the same option. */
export const fracChoices=(answer:Q,wrong:readonly (Q|false|null|undefined)[],fmt:(q:Q)=>string=fmix,n=4)=>pick(answer,wrong.map(w=>w&&Number.isFinite(w[0]/w[1])&&w[1]!==0?w:false),fmt,fkey,n);

// Small text helpers.
/** "1 ten", "3 hundreds" … for base-10 descriptions. */
export const count=(n:number,one:string,many=one+'s')=>`${num(n)} ${n===1?one:many}`;
export const sum=(xs:readonly number[])=>xs.reduce((a,b)=>a+b,0);
export const range=(a:number,b:number)=>Array.from({length:b-a+1},(_,i)=>a+i);
/** Distinct names for a story. */
export const names=(r:Rng,n:number,from:readonly string[])=>r.sample(from,n);
export const deg=(n:number)=>`${num(n)}°`;

// Pictures.
export const fig=(w:number,h:number,marks:Mark[],alt:string):Visual=>({kind:'figure',w:Math.round(w),h:Math.round(h),marks,alt});
export const text=(x:number,y:number,s:string,size=14,o:{bold?:boolean;anchor?:'start'|'middle'|'end';c?:'ink'|'muted'|'blue'|'green'|'red'|'orange'|'purple';italic?:boolean}={})=>label(Math.round(x*10)/10,Math.round(y*10)/10,s,size,o);
const r1=(n:number)=>Math.round(n*10)/10;
/** Ready-made pictures side by side in one figure, at full size (a set would shrink them into small boxes).
 *  When they would be wider than maxW they are stacked instead, so they stay readable on a phone. */
export function beside(items:{v:Visual;caption?:string}[],alt:string,gap=34,maxW=620):Visual{
 const figs=items.map(i=>layout(i.v)),capH=items.some(i=>i.caption)?28:0,marks:Mark[]=[];
 if(figs.reduce((s,f)=>s+f.w,0)+gap*(figs.length-1)>maxW){
  const w=Math.max(...figs.map(f=>f.w));let y=0;
  figs.forEach((f,i)=>{const c=items[i].caption;if(c)marks.push(text(w/2,y+19,c,16,{bold:true,c:'purple'}));marks.push({t:'g',x:r1((w-f.w)/2),y:r1(y+(c?capH:0)),marks:f.marks});y+=(c?capH:0)+f.h+gap/2;});
  return fig(w,y-gap/2,marks,alt);
 }
 const h=Math.max(...figs.map(f=>f.h))+capH;let x=0;
 figs.forEach((f,i)=>{if(items[i].caption)marks.push(text(x+f.w/2,19,items[i].caption!,16,{bold:true,c:'purple'}));marks.push({t:'g',x:r1(x),y:r1(capH+(h-capH-f.h)/2),marks:f.marks});x+=f.w+gap;});
 return fig(x-gap,h,marks,alt);
}
/** Rounds half up to the nearest multiple of m: roundTo(3456, 100) → 3500, roundTo(10 / 3, 0.01) → 3.33. */
export const roundTo=(x:number,m:number)=>tidy(Math.floor(tidy(x/m)+0.5)*m);
/** Evaluates a small calculation such as "(3 + 4²) × 2 − 10 ÷ 5" for templates (the tests use their own evaluator). */
export function calc(src:string):number{
 const s=src.replace(/\s+/g,'').replace(/−/g,'-').replace(/×/g,'*').replace(/÷/g,'/').replace(/²/g,'^2').replace(/³/g,'^3');let i=0;
 const bad=()=>new Error('cannot work out '+src);
 const lit=():number=>{const m=s.slice(i).match(/^\d+(\.\d+)?/);if(!m)throw bad();i+=m[0].length;return Number(m[0]);};
 const prim=():number=>{if(s[i]==='('){i++;const v=expr();if(s[i++]!==')')throw bad();return v;}if(s[i]==='-'){i++;return -prim();}return lit();};
 const pow=():number=>{const b=prim();if(s[i]==='^'){i++;return b**pow();}return b;};
 const term=():number=>{let v=pow();while(s[i]==='*'||s[i]==='/'){const o=s[i++],w=pow();v=o==='*'?v*w:v/w;}return v;};
 const expr=():number=>{let v=term();while(s[i]==='+'||s[i]==='-'){const o=s[i++],w=term();v=o==='+'?v+w:v-w;}return v;};
 const v=expr();if(i!==s.length)throw bad();return tidy(v);
}
/** Place names for rounding: 100 → "hundred". */
export const PLACE:Record<number,string>={0.001:'thousandth',0.01:'hundredth',0.1:'tenth',1:'whole number',10:'ten',100:'hundred',1000:'thousand',10000:'ten thousand',100000:'hundred thousand',1000000:'million'};
/** A rectangle split into rows × cols equal cells; shaded cells (indices in reading order) are filled. Each cell is one rect mark. */
export function shadedGrid(rows:number,cols:number,shaded:readonly number[],alt:string,cell=Math.min(34,Math.floor(420/cols))):Visual{
 const on=new Set(shaded),m:Mark[]=[];
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++)m.push({t:'rect',x:6+i*cell,y:6+j*cell,w:cell,h:cell,fill:on.has(j*cols+i)?'blue':'white',sw:1.5});
 return fig(12+cols*cell,12+rows*cell,m,alt);
}
/** A circle split into n equal sectors, starting at the top; shaded sectors are filled. Each sector is one path mark. */
export function shadedCircle(n:number,shaded:readonly number[],alt:string,r=80):Visual{
 const on=new Set(shaded),c=r+8,m:Mark[]=[];
 for(let i=0;i<n;i++){const a=(-90+i*360/n)*Math.PI/180,b=(-90+(i+1)*360/n)*Math.PI/180;
  m.push({t:'path',d:`M${c} ${c} L${r1(c+r*Math.cos(a))} ${r1(c+r*Math.sin(a))} A${r} ${r} 0 0 1 ${r1(c+r*Math.cos(b))} ${r1(c+r*Math.sin(b))} Z`,fill:on.has(i)?'blue':'white',w:1.8});}
 return fig(2*c,2*c,m,alt);
}
/** A polygon drawn to scale (points in units, y upwards) with side labels outside each edge; null leaves a side unlabelled. */
export function polyFigure(pts:[number,number][],labels:(string|null)[],alt:string,o:{unit?:number;fill?:Fill;extra?:(p:(x:number,y:number)=>[number,number])=>Mark[]}={}):Visual{
 const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
 const unit=o.unit??Math.min(34,300/Math.max(maxX-minX,1),220/Math.max(maxY-minY,1)),pad=46,padX=60;
 const P=(x:number,y:number):[number,number]=>[r1(padX+(x-minX)*unit),r1(pad+(maxY-y)*unit)];
 const sp=pts.map(p=>P(p[0],p[1]));let area=0;sp.forEach((p,i)=>{const q=sp[(i+1)%sp.length];area+=p[0]*q[1]-q[0]*p[1];});
 const m:Mark[]=[{t:'poly',pts:sp.flat(),fill:o.fill??'pale',w:2.2}];
 sp.forEach((p,i)=>{const s=labels[i];if(!s)return;const q=sp[(i+1)%sp.length],dx=q[0]-p[0],dy=q[1]-p[1],len=Math.hypot(dx,dy)||1;
  // Outward normal: screen y grows downwards, so a clockwise-on-screen outline (positive area) has its outside on the left of travel.
  const sgn=area>0?1:-1,nx=sgn*dy/len,ny=-sgn*dx/len,mx=(p[0]+q[0])/2,my=(p[1]+q[1])/2,off=Math.abs(nx)>.7?10+s.length*3.6:14;
  m.push(text(mx+nx*off,my+ny*off+5,s,14,{bold:true}));});
 if(o.extra)m.push(...o.extra(P));
 return fig(2*padX+(maxX-minX)*unit,2*pad+(maxY-minY)*unit,m,alt);
}
/** Coordinate grid from min to max on both axes, with labelled points and optional shapes. */
export function coordGrid(o:{min:number;max:number;ymin?:number;ymax?:number;unit?:number;points?:{x:number;y:number;label:string}[];shapes?:{pts:[number,number][];fill?:Fill;dash?:boolean}[];alt:string}):Visual{
 const xmin=o.min,xmax=o.max,ymin=o.ymin??o.min,ymax=o.ymax??o.max,u=o.unit??Math.min(30,Math.floor(380/Math.max(xmax-xmin,ymax-ymin))),pad=28;
 const X=(x:number)=>r1(pad+(x-xmin)*u),Y=(y:number)=>r1(pad+(ymax-y)*u),m:Mark[]=[];
 for(let x=xmin;x<=xmax;x++)m.push({t:'line',x1:X(x),y1:Y(ymin),x2:X(x),y2:Y(ymax),w:.7,c:'muted'});
 for(let y=ymin;y<=ymax;y++)m.push({t:'line',x1:X(xmin),y1:Y(y),x2:X(xmax),y2:Y(y),w:.7,c:'muted'});
 const ax=Math.min(Math.max(0,xmin),xmax),ay=Math.min(Math.max(0,ymin),ymax);
 m.push({t:'line',x1:X(xmin)-8,y1:Y(ay),x2:X(xmax)+14,y2:Y(ay),w:2,arrow:'end'},{t:'line',x1:X(ax),y1:Y(ymin)+8,x2:X(ax),y2:Y(ymax)-14,w:2,arrow:'end'});
 m.push(text(X(xmax)+18,Y(ay)+5,'x',15,{italic:true,bold:true,anchor:'start'}),text(X(ax)+8,Y(ymax)-14,'y',15,{italic:true,bold:true,anchor:'start'}));
 for(let x=xmin;x<=xmax;x++)if(x!==0||ax!==0)m.push(text(X(x),Y(ay)+17,num(x),12,{c:'muted'}));
 for(let y=ymin;y<=ymax;y++)if(y!==0||ay!==0)m.push(text(X(ax)-6,Y(y)+4,num(y),12,{c:'muted',anchor:'end'}));
 if(ax===0&&ay===0)m.push(text(X(0)-6,Y(0)+17,'0',12,{c:'muted',anchor:'end'}));
 for(const s of o.shapes??[])m.push({t:'poly',pts:s.pts.flatMap(([x,y])=>[X(x),Y(y)]),fill:s.fill??'none',w:2.2,c:'blue',dash:s.dash});
 // Each point's letter goes in the first nearby spot that is clear of the axis numbers, the axes, the other points and
 // the other letters, and is clearly closer to its own point than to any other (so no label could belong to two points).
 type Box={x1:number;y1:number;x2:number;y2:number};const hit=(a:Box,b:Box)=>a.x1<b.x2&&b.x1<a.x2&&a.y1<b.y2&&b.y1<a.y2;
 const pts=o.points??[],blocked:Box[]=[{x1:X(xmin)-12,y1:Y(ay)+4,x2:X(xmax)+12,y2:Y(ay)+19},{x1:X(ax)-24,y1:Y(ymax)-10,x2:X(ax)-2,y2:Y(ymin)+8},
  {x1:X(xmin)-8,y1:Y(ay)-2,x2:X(xmax)+14,y2:Y(ay)+2},{x1:X(ax)-2,y1:Y(ymax)-14,x2:X(ax)+2,y2:Y(ymin)+8},...pts.map(p=>({x1:X(p.x)-6,y1:Y(p.y)-6,x2:X(p.x)+6,y2:Y(p.y)+6}))];
 for(const p of pts){
  const px=X(p.x),py=Y(p.y);m.push({t:'circle',x:px,y:py,r:4.5,fill:'black',w:1});
  const spots:[number,number,'start'|'end'][]=[[px+7,py-6,'start'],[px+7,py+17,'start'],[px-7,py-6,'end'],[px-7,py+17,'end'],[px+9,py+5,'start'],[px-9,py+5,'end']];
  const fits=spots.map(([x,y,a])=>{const b={x1:a==='start'?x:x-11,y1:y-11,x2:a==='start'?x+11:x,y2:y},cx=(b.x1+b.x2)/2,cy=(b.y1+b.y2)/2,own=Math.hypot(cx-px,cy-py);
   const clear=!blocked.some(k=>hit(k,b))&&pts.every(q=>q===p||Math.hypot(cx-X(q.x),cy-Y(q.y))>=1.6*own);return {x,y,a,b,clear};});
  const s=fits.find(f=>f.clear)??fits[0];blocked.push(s.b);m.push(text(s.x,s.y,p.label,15,{bold:true,c:'purple',anchor:s.a}));
 }
 return fig(2*pad+(xmax-xmin)*u+14,2*pad+(ymax-ymin)*u+6,m,o.alt);
}
/** Unit cubes drawn in an oblique view: [i, j, k] = along, back, up. Hidden cubes are drawn first and covered, like real blocks. */
export function cubes(cells:[number,number,number][],alt:string,s=26):Visual{
 const dx=s*.5,dy=-s*.42,maxI=Math.max(...cells.map(c=>c[0])),maxJ=Math.max(...cells.map(c=>c[1])),maxK=Math.max(...cells.map(c=>c[2]));
 const x0=10,y0=14+(maxK+1)*s+(maxJ+1)*-dy,m:Mark[]=[];
 const order=[...cells].sort((a,b)=>b[1]-a[1]||a[2]-b[2]||a[0]-b[0]);
 for(const [i,j,k] of order){const X=r1(x0+i*s+j*dx),Y=r1(y0-k*s+j*dy);
  m.push({t:'poly',pts:[X,Y-s,X+s,Y-s,r1(X+s+dx),r1(Y-s+dy),r1(X+dx),r1(Y-s+dy)],fill:'white',w:1.3},{t:'poly',pts:[X+s,Y,X+s,Y-s,r1(X+s+dx),r1(Y-s+dy),r1(X+s+dx),r1(Y+dy)],fill:'pale',w:1.3},{t:'rect',x:X,y:Y-s,w:s,h:s,fill:'blue',sw:1.3});}
 return fig(x0*2+(maxI+1)*s+(maxJ+1)*dx+4,y0+10,m,alt);
}
/** Equal boxes in rows (a bar model drawn as a figure) with an optional brace and label on the right spanning every row. */
export function boxRows(rows:{label:string;boxes:number;texts?:string[];shade?:number}[],o:{box?:number;right?:string;top?:string;alt:string}):Visual{
 const bw=o.box??44,bh=40,lw=Math.max(58,...rows.map(r=>r.label.length*8.4+16)),top=o.top?34:8,m:Mark[]=[],maxBoxes=Math.max(...rows.map(r=>r.boxes));
 rows.forEach((row,j)=>{const y=top+j*(bh+12);m.push(text(lw-10,y+bh/2+5,row.label,14,{bold:true,anchor:'end'}));
  for(let i=0;i<row.boxes;i++){m.push({t:'rect',x:lw+i*bw,y,w:bw,h:bh,fill:i<(row.shade??0)?'yellow':'white',sw:2});const s=row.texts?.[i];if(s)m.push(text(lw+i*bw+bw/2,y+bh/2+5,s,s.length>4?12:14,{bold:true}));}});
 const H=top+rows.length*(bh+12)-12,right=lw+maxBoxes*bw;
 if(o.top){const w=rows[0].boxes*bw;m.push({t:'poly',open:true,fill:'none',w:1.6,pts:[lw,top-6,lw,top-14,lw+w,top-14,lw+w,top-6]},text(lw+w/2,top-20,o.top,15,{bold:true}));}
 if(o.right){m.push({t:'poly',open:true,fill:'none',w:1.6,pts:[right+8,top,right+16,top,right+16,H,right+8,H]},text(right+24,(top+H)/2+5,o.right,15,{bold:true,anchor:'start'}));}
 return fig(right+(o.right?30+o.right.length*9:10),H+8,m,o.alt);
}
