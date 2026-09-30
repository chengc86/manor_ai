// Re-checks every Maths bank answer (lib/bank-maths-*.ts) with separate code: it reads the numbers back out of the
// prompt, stimulus and picture data where it can, re-solves the question with its own arithmetic (exact fractions),
// and checks that the marked answer is right and that no wrong option is also right.
// Each question carries an audit record (lib/bank-maths-util.ts mathsAudit) naming the kind of check and, where the
// picture cannot be read back as text (base-10 blocks, thermometers), the facts it shows; those facts are checked
// against the picture data too.
// node tests/bank-maths.cjs
const path=require('path');
const dir=require('./build-lib.cjs')('bank-maths',[],{only:['Maths']});
const {bankQuestions,bankTopics,bankProblems}=require(path.join(dir,'bank.cjs'));
const {mathsAudit}=require(path.join(dir,'bank-maths-util.cjs'));
const {visualText}=require(path.join(dir,'visual.cjs'));
const {layout}=require(path.join(dir,'visual-layout.cjs'));
const qs=bankQuestions.filter(q=>q.subject==='Maths'),fails=[],counts={};
const fail=(q,msg)=>fails.push(`${q.id}: ${msg}`);

// ── Exact fractions with BigInt.
const bgcd=(a,b)=>{a=a<0n?-a:a;b=b<0n?-b:b;while(b){[a,b]=[b,a%b];}return a;};
function R(n,d=1n){n=BigInt(n);d=BigInt(d);if(d===0n)throw new Error('divide by zero');if(d<0n){n=-n;d=-d;}const g=bgcd(n,d)||1n;return {n:n/g,d:d/g};}
const add=(a,b)=>R(a.n*b.d+b.n*a.d,a.d*b.d),sub=(a,b)=>R(a.n*b.d-b.n*a.d,a.d*b.d),mul=(a,b)=>R(a.n*b.n,a.d*b.d),div=(a,b)=>R(a.n*b.d,a.d*b.n);
const eq=(a,b)=>a&&b&&a.n===b.n&&a.d===b.d,cmp=(a,b)=>{const x=a.n*b.d-b.n*a.d;return x<0n?-1:x>0n?1:0;};
const isInt=a=>a.d===1n,toNum=a=>Number(a.n)/Number(a.d),show=a=>a?(a.d===1n?`${a.n}`:`${a.n}/${a.d}`):'null';
/** "12,345" "−3.75" "2 3/8" "7/12" → exact value. */
function dec(s){s=String(s).trim().replace(/−/g,'-').replace(/,(?=\d{3}\b)/g,'');let m=s.match(/^(-?)(\d+) (\d+)\/(\d+)$/);if(m){const v=add(R(m[2]),R(m[3],m[4]));return m[1]?R(-v.n,v.d):v;}
 m=s.match(/^(-?\d+)\/(\d+)$/);if(m)return R(m[1],m[2]);m=s.match(/^(-?)(\d*)\.(\d+)$/);if(m){const v=R(BigInt((m[2]||'0')+m[3]),10n**BigInt(m[3].length));return m[1]?R(-v.n,v.d):v;}
 m=s.match(/^-?\d+$/);if(m)return R(s);return null;}
/** An option's value: strips £ (pounds), p (pence → pounds), %, and a trailing unit word. */
function val(s){s=String(s).trim().replace(/−/g,'-');let pence=false;if(/^£/.test(s))s=s.slice(1);else if(/^-?[\d.]+p$/.test(s)){pence=true;s=s.slice(0,-1);}
 s=s.replace(/\s*(%|°C|°|cm²|m²|cm³|m³|mm|cm|km|kg|ml|m|g|l|litres?|degrees?|hours?|minutes?|seconds?|days?|weeks?|years?|square units|units?|squares?|cubes?|pupils|people|coins|cups?|glasses|pieces|boxes|minibuses)$/,'');const v=dec(s);return v&&pence?div(v,R(100)):v;}

// ── Expressions: + − * / ^ ( ), functions, and #literals (numbers that need not appear in the question text).
function evaluate(src,vars={}){
 const toks=[];let i=0;const s=src.replace(/\s+/g,'').replace(/−/g,'-').replace(/×/g,'*').replace(/÷/g,'/');
 while(i<s.length){const c=s[i];
  if(c==='#'){let j=i+1;if(s[j]==='-')j++;while(/[\d.]/.test(s[j]??''))j++;toks.push({t:'num',v:dec(s.slice(i+1,j)),hidden:true,raw:s.slice(i+1,j)});i=j;continue;}
  if(/\d/.test(c)){let j=i;while(/[\d.]/.test(s[j]??''))j++;toks.push({t:'num',v:dec(s.slice(i,j)),raw:s.slice(i,j)});i=j;continue;}
  if(/[a-z]/i.test(c)){let j=i;while(/[a-z]/i.test(s[j]??''))j++;toks.push({t:'id',v:s.slice(i,j)});i=j;continue;}
  toks.push({t:c});i++;}
 let p=0;const peek=()=>toks[p],take=t=>{if(toks[p]?.t!==t)throw new Error(`expected ${t} in ${src}`);return toks[p++];};
 const F={round:(x,m)=>mul(R(floorR(add(div(x,m),R(1,2)))),m),floor:x=>R(floorR(x)),ceil:x=>R(-floorR(R(-x.n,x.d))),sqrt:x=>{const r=BigInt(Math.round(Math.sqrt(toNum(x))));if(!eq(R(r*r),x))throw new Error('not a square');return R(r);},
  gcd:(a,b)=>R(bgcd(a.n,b.n)),lcm:(a,b)=>R(a.n*b.n/bgcd(a.n,b.n)),max:(...a)=>a.reduce((x,y)=>cmp(x,y)>=0?x:y),min:(...a)=>a.reduce((x,y)=>cmp(x,y)<=0?x:y),abs:x=>R(x.n<0n?-x.n:x.n,x.d),mod:(a,b)=>sub(a,mul(R(floorR(div(a,b))),b))};
 function floorR(x){const q=x.n/x.d;return x.n<0n&&q*x.d!==x.n?q-1n:q;}
 const expr=()=>{let v=term();while(peek()?.t==='+'||peek()?.t==='-'){const o=toks[p++].t,w=term();v=o==='+'?add(v,w):sub(v,w);}return v;};
 const term=()=>{let v=unary();while(peek()?.t==='*'||peek()?.t==='/'){const o=toks[p++].t,w=unary();v=o==='*'?mul(v,w):div(v,w);}return v;};
 const unary=()=>{if(peek()?.t==='-'){p++;const v=unary();return R(-v.n,v.d);}return power();};
 const power=()=>{const b=primary();if(peek()?.t==='^'){p++;const e=unary();let v=R(1);for(let k=0n;k<e.n;k++)v=mul(v,b);return v;}return b;};
 const primary=()=>{const t=toks[p++];if(!t)throw new Error('unexpected end in '+src);
  if(t.t==='num')return t.v;if(t.t==='('){const v=expr();take(')');return v;}
  if(t.t==='id'){if(peek()?.t==='('){p++;const args=[expr()];while(peek()?.t===','){p++;args.push(expr());}take(')');if(!F[t.v])throw new Error('unknown function '+t.v);return F[t.v](...args);}
   if(t.v in vars)return R(vars[t.v]);throw new Error('unknown name '+t.v+' in '+src);}
  throw new Error(`unexpected ${t.t} in ${src}`);};
 const v=expr();if(p!==toks.length)throw new Error('trailing input in '+src);return {v,literals:toks.filter(t=>t.t==='num'&&!t.hidden).map(t=>t.v)};
}

// ── Reading the question: all numbers shown in the prompt, stimulus and pictures.
const SMALL=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
const TENS={twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90};
/** British number words → value: "two million, five hundred and three thousand and eighty-three". */
function fromWords(s){let total=0,cur=0,any=false;for(const w of s.toLowerCase().replace(/minus /,'').split(/[\s,-]+/).filter(Boolean)){if(w==='and')continue;const k=SMALL.indexOf(w);
 if(k>=0){cur+=k;any=true;}else if(TENS[w]){cur+=TENS[w];any=true;}else if(w==='hundred')cur*=100;else if(w==='thousand'){total+=cur*1000;cur=0;}else if(w==='million'){total+=cur*1e6;cur=0;}else return null;}
 return any?(/^minus /.test(s)?-1:1)*(total+cur):null;}
function questionText(q){const parts=[q.prompt,q.stimulus??''];const walk=v=>{if(!v)return;parts.push(...visualText(v));if(v.kind==='numberLine')parts.push(...Object.values(v.labels));if(v.kind==='chart')parts.push(...v.values.map(String));if(v.kind==='pie')parts.push(...v.slices.map(s=>String(s.value)));if(v.kind==='counters')parts.push(...v.groups.map(g=>String(g.count)));if(v.kind==='base10')parts.push(...['thousands','hundreds','tens','ones'].map(k=>String(v[k]??0)));if(v.kind==='set')v.items.forEach(walk);if(v.kind==='compare'){walk(v.left);walk(v.right);}};walk(q.visual);return parts.join(' \n ');}
function numbersIn(text){const out=[];const t=text.replace(/−/g,'-').replace(/(\d),(?=\d{3}\b)/g,'$1').replace(/²/g,' 2').replace(/³/g,' 3');for(const m of t.matchAll(/\d+(?:\.\d+)?/g))out.push(dec(m[0]));for(const m of t.matchAll(/\d+\/\d+/g))out.push(dec(m[0]));
 for(const m of t.toLowerCase().matchAll(/\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\b/g))out.push(R(SMALL.includes(m[1])?SMALL.indexOf(m[1]):TENS[m[1]]));
 for(const m of t.matchAll(/(\d+) (\d+)\/(\d+)/g))out.push(dec(m[0]));return out.filter(Boolean);}
const absR=a=>a.n<0n?R(-a.n,a.d):a;
function literalsShown(q,literals){const shown=numbersIn(questionText(q)).map(absR);return literals.filter(l=>!shown.some(x=>eq(x,absR(l))));}

// ── Checks shared by many kinds.
/** The marked answer must equal want (a value), and no wrong option may. */
function expectValue(q,want,parse=val,label=''){
 const got=parse(q.answers[0]);if(!eq(got,want))fail(q,`${label}answer ${q.answers[0]} is ${show(got)}, expected ${show(want)}`);
 for(const o of q.options)if(!q.answers.includes(o)){const v=parse(o);if(eq(v,want))fail(q,`wrong option ${o} is also correct`);}
}
function expectText(q,want){if(q.answers[0]!==want)fail(q,`answer ${q.answers[0]}, expected ${want}`);const n=q.options.filter(o=>o===want).length;if(n!==1)fail(q,`expected answer appears ${n} times`);}
/** Exactly one option passes the test, and it is the marked answer. */
function exactlyOne(q,test,what){const ok=q.options.filter(o=>{try{return test(o);}catch(e){fail(q,`${what}: ${e.message}`);return false;}});if(ok.length!==1||ok[0]!==q.answers[0])fail(q,`${what}: options passing ${JSON.stringify(ok)}, answer ${q.answers[0]}`);}
const allMarks=v=>{const out=[];const walk=ms=>ms.forEach(m=>{out.push(m);if(m.t==='g')walk(m.marks);});walk(layout(v).marks);return out;};
const sameMarks=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
/** True when the figure contains, somewhere in its groups, exactly the marks this picture lays out as. */
function figureContains(fig,visual){const want=layout(visual).marks;return allMarks(fig).some(m=>m.t==='g'&&sameMarks(m.marks,want));}
const digitsOf=n=>String(n).split('').map(Number);

// ── Roman numerals.
const RV={I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
const romanOk=s=>/^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/.test(s)&&s.length>0;
const romanValue=s=>{let t=0;for(let i=0;i<s.length;i++){const a=RV[s[i]],b=RV[s[i+1]]??0;t+=a<b?-a:a;}return t;};
function toRoman(n){const units=['','I','II','III','IV','V','VI','VII','VIII','IX'],tens=['','X','XX','XXX','XL','L','LX','LXX','LXXX','XC'],hund=['','C','CC','CCC','CD','D','DC','DCC','DCCC','CM'];return 'M'.repeat(Math.floor(n/1000))+hund[Math.floor(n/100)%10]+tens[Math.floor(n/10)%10]+units[n%10];}

// ── Picture readers.
function base10Value(v){return (v.thousands??0)*1000+(v.hundreds??0)*100+(v.tens??0)*10+(v.ones??0);}
function countersValue(v){return v.groups.reduce((s,g)=>s+g.count*Number(g.value.replace(/,/g,'')),0);}
function pictureValue(v){return v.kind==='base10'?base10Value(v):v.kind==='counters'?countersValue(v):null;}
/** Number line: value at each tick from the two labels (exact). */
function lineValue(v,tick){const ks=Object.keys(v.labels).map(Number).sort((a,b)=>a-b),[i,j]=[ks[0],ks.at(-1)],a=dec(v.labels[i]),b=dec(v.labels[j]);const step=div(sub(b,a),R(j-i));return add(a,mul(step,R(tick-i)));}
/** A scale figure (jug or thermometer): numeric labels give value against height; the liquid rect gives the reading. */
function scaleReading(v,fill){const ms=allMarks(v),labels=ms.filter(m=>m.t==='text'&&/^-?[\d,−]+$/.test(m.s)).map(m=>({y:m.y-5,v:Number(m.s.replace(/−/g,'-').replace(/,/g,''))}));
 const liquid=ms.find(m=>m.t==='rect'&&m.fill===fill&&m.sw===0);if(!liquid||labels.length<2)return null;
 labels.sort((a,b)=>a.v-b.v);const lo=labels[0],hi=labels.at(-1),x=lo.v+(liquid.y-lo.y)*(hi.v-lo.v)/(hi.y-lo.y);return Math.round(x*1000)/1000;}

/** Algebra as written ("3a + 2b", "2(x + 1)", "ab", "a²") → exact value with the letters replaced. */
function algebra(expr,vals){let s=String(expr).replace(/\s+/g,'').replace(/−/g,'-').replace(/²/g,'^2');s=s.replace(/(\d|\))(?=[a-z(])/g,'$1*').replace(/([a-z])(?=[a-z(\d])/g,'$1*');return evaluate(s,vals).v;}
/** True when two expressions in the given letters agree at several values. */
function sameExpr(e1,e2,letters){const pts=[2,3,5,7,11,13];return pts.every((v,i)=>{const vals=Object.fromEntries(letters.map((l,j)=>[l,pts[(i+j*2)%pts.length]+j]));return eq(algebra(e1,vals),algebra(e2,vals));});}
/** Text marks of a figure in reading order (top to bottom, then left to right). */
const textsOf=v=>allMarks(v).filter(m=>m.t==='text').sort((a,b)=>Math.round(a.y/20)-Math.round(b.y/20)||a.x-b.x).map(m=>m.s);
const applyOp=(v,op,k)=>op==='×'?mul(v,k):op==='÷'?div(v,k):op==='+'?add(v,k):sub(v,k);
/** A drawn function machine: IN value, operations, OUT value (left to right). */
function readMachine(v){const ts=allMarks(v).filter(m=>m.t==='text'&&!['IN','OUT'].includes(m.s)).sort((a,b)=>a.x-b.x).map(m=>m.s);return {input:ts[0],ops:ts.slice(1,-1).map(s=>{const [op,k]=s.split(' ');return [op,dec(k)];}),output:ts.at(-1)};}
/** Lines of symmetry of a drawn polygon: try axes through the centre and each corner or edge midpoint. */
function symmetryLines(pts){const n=pts.length,c=[pts.reduce((s,p)=>s+p[0],0)/n,pts.reduce((s,p)=>s+p[1],0)/n],cands=[...pts,...pts.map((p,k)=>[(p[0]+pts[(k+1)%n][0])/2,(p[1]+pts[(k+1)%n][1])/2])],axes=new Set();
 for(const q of cands){const a=Math.atan2(q[1]-c[1],q[0]-c[0]),cos2=Math.cos(2*a),sin2=Math.sin(2*a);
  const ok=pts.every(([x,y])=>{const dx=x-c[0],dy=y-c[1],rx=c[0]+dx*cos2+dy*sin2,ry=c[1]+dx*sin2-dy*cos2;return pts.some(([u,v])=>Math.hypot(u-rx,v-ry)<0.8);});
  if(ok)axes.add(Math.round(((a*180/Math.PI)%180+180)%180));}
 return new Set([...axes].map(d=>d%180)).size;}
/** Folds a net of unit squares by rolling a cube; returns the cube face each square lands on. */
function fold(cells){const at=new Map(cells.map((c,i)=>[c.join(','),i])),face=Array(cells.length).fill(null),todo=[[0,{d:'D',u:'U',n:'N',s:'S',e:'E',w:'W'}]];face[0]='D';
 while(todo.length){const [i,o]=todo.shift(),[x,y]=cells[i];for(const [dx,dy,no] of [[1,0,{...o,d:o.e,e:o.u,u:o.w,w:o.d}],[-1,0,{...o,d:o.w,w:o.u,u:o.e,e:o.d}],[0,-1,{...o,d:o.n,n:o.u,u:o.s,s:o.d}],[0,1,{...o,d:o.s,s:o.u,u:o.n,n:o.d}]]){const j=at.get(`${x+dx},${y+dy}`);if(j===undefined||face[j])continue;face[j]=no.d;todo.push([j,no]);}}
 return face;}
const OPPOSITE={U:'D',D:'U',N:'S',S:'N',E:'W',W:'E'};
/** The squares of a drawn net (equal rects) as grid cells, with any labels drawn in them. */
function readNet(v){const rs=allMarks(v).filter(m=>m.t==='rect'),u=rs[0].w,x0=Math.min(...rs.map(m=>m.x)),y0=Math.min(...rs.map(m=>m.y)),ts=allMarks(v).filter(m=>m.t==='text');
 return rs.map(m=>({cell:[Math.round((m.x-x0)/u),Math.round((m.y-y0)/u)],label:(ts.find(t=>t.x>m.x&&t.x<m.x+m.w&&t.y>m.y&&t.y<m.y+m.h)||{}).s}));}
/** Coordinates of labelled points on a drawn grid, using the axis numbers to convert from the drawing. */
function readGridPoints(v){const ms=allMarks(v),nums=ms.filter(m=>m.t==='text'&&/^−?\d+$/.test(m.s)).map(m=>({...m,val:Number(m.s.replace('−','-'))}));
 const xa=nums.filter(m=>m.anchor==='middle'),ya=nums.filter(m=>m.anchor==='end');const fit=(arr,key)=>{const a=arr[0],b=arr.find(m=>m.val!==a.val);return z=>a.val+(z-a[key])*(b.val-a.val)/(b[key]-a[key]);};
 const X=fit(xa,'x'),Y=fit(ya.map(m=>({...m,y:m.y-4})),'y'),dots=ms.filter(m=>m.t==='circle'&&m.fill==='black'),out={};
 // Each letter belongs to the dot nearest the middle of the letter; a letter about as close to two dots is a picture fault.
 for(const t of ms.filter(m=>m.t==='text'&&/^[A-Z]$/.test(m.s))){const cx=t.x+(t.anchor==='end'?-5.5:t.anchor==='start'?5.5:0),cy=t.y-5.5;
  const near=dots.map(c=>({c,d:Math.hypot(c.x-cx,c.y-cy)})).sort((a,b)=>a.d-b.d);if(near.length>1&&near[1].d<1.4*near[0].d)out.ambiguous=t.s;
  out[t.s]=[Math.round(X(near[0].c.x)),Math.round(Y(near[0].c.y))];}
 return out;}
const readPt=s=>{const m=String(s).replace(/−/g,'-').match(/\((-?\d+), (-?\d+)\)/);return m?[Number(m[1]),Number(m[2])]:null;};
const ptText=([x,y])=>`(${String(x).replace('-','−')}, ${String(y).replace('-','−')})`;
/** Shaded share of a figure made of equal parts: blue parts over all blue and white parts. */
function shadedFraction(v){const parts=allMarks(v).filter(m=>(m.t==='rect'||m.t==='path')&&(m.fill==='blue'||m.fill==='white'));if(!parts.length)return null;return R(parts.filter(m=>m.fill==='blue').length,parts.length);}
/** "3/8", "1 3/8", "0.375" or "37.5%" → exact value. */
function fdpValue(s){s=String(s).trim();if(s.endsWith('%')){const v=dec(s.slice(0,-1));return v&&div(v,R(100));}return dec(s);}
/** A fraction written in lowest terms (a mixed number's fraction part too). */
function lowest(s){const m=String(s).match(/(\d+)\/(\d+)$/);if(!m)return /^\d+$/.test(s);const g=bgcd(BigInt(m[1]),BigInt(m[2]));return g===1n;}
function pickExtreme(q,dir,parse){const vs=q.options.map(parse);if(vs.some(v=>!v)){fail(q,'cannot read an option');return;}const best=vs.reduce((m,x)=>(dir==='max'?cmp(x,m)>0:cmp(x,m)<0)?x:m);if(vs.filter(x=>eq(x,best)).length!==1)fail(q,'tie');expectText(q,q.options[vs.findIndex(x=>eq(x,best))]);}

// ── Solvers, one per audit kind.
const CHECK={
 expr(q,a){
  const {v,literals}=evaluate(a.e);
  const missing=literalsShown(q,literals);if(missing.length)fail(q,`numbers ${missing.map(show)} are not shown in the question`);
  if(a.base10){if(!figureContains(q.visual,{kind:'base10',...a.base10}))fail(q,'figure does not show the audited base-10 blocks');if(base10Value(a.base10)!==a.part)fail(q,'audited part does not match the blocks');}
  if(a.counters){if(!figureContains(q.visual,{kind:'counters',groups:a.counters}))fail(q,'figure does not show the audited counters');if(countersValue({groups:a.counters})!==a.part)fail(q,'audited part does not match the counters');}
  if(a.pv){const row=q.visual.rows[0].join('');if(!a.e.includes('#'+row))fail(q,`place value chart shows ${row}, not the audited number`);}
  if(a.thermo!==undefined){const t=scaleReading(q.visual,'red');if(t!==a.thermo)fail(q,`thermometer reads ${t}, audit says ${a.thermo}`);}
  if(a.point!==undefined){const k=Number(Object.keys(q.visual.points)[0]);if(!eq(lineValue(q.visual,k),R(a.point)))fail(q,'point P is not at the audited value');}
  expectValue(q,v,a.as==='min'?durMinutes:val);
 },
 digitRank(q,a){const n=Number(q.stimulus.replace(/,/g,''));if(n!==a.n)fail(q,'stimulus differs from audit');const ds=digitsOf(n),vals=ds.map((d,i)=>d*10**(ds.length-1-i)),sorted=[...vals].sort((x,y)=>y-x),rank=/second/.test(q.prompt)?2:/third/.test(q.prompt)?3:0;
  expectText(q,String(ds[vals.indexOf(sorted[rank-1])]));},
 digitValue(q,a){const n=Number(q.stimulus.replace(/,/g,'')),d=Number(q.prompt.match(/digit \*\*(\d)\*\*/)[1]),ds=digitsOf(n);if(ds.filter(x=>x===d).length!==1)fail(q,'digit is not unique');expectValue(q,R(d*10**(ds.length-1-ds.indexOf(d))));},
 moveRight(q){const k=Number(q.prompt.match(/moves \*\*(\d) places to the right/)[1]);expectText(q,`It is divided by ${(10**k).toLocaleString('en-GB')}`);},
 words(q){if(/in digits/.test(q.prompt))expectValue(q,R(fromWords(q.stimulus)));else exactlyOne(q,o=>fromWords(o)===Number(q.stimulus.replace(/,/g,'')),'words');},
 counters(q){expectValue(q,R(countersValue(q.visual)));},
 cards(q,a){
  // Read the cards back from the picture (or the options) and re-solve the clues by trying every way of dealing them.
  const nums=q.visual?q.visual.cards.map(c=>/\d/.test(c.text)?Number(c.text.replace(/,/g,'')):fromWords(c.text)):a.nums;
  if(JSON.stringify(nums)!==JSON.stringify(a.nums))fail(q,'cards differ from audit');
  const kids=q.prompt.match(/(\w+), (\w+) and (\w+) each/).slice(1);
  const digit=(v,p)=>Math.floor(v/p)%10,COLS=['ones','tens','hundreds','thousands','ten thousands'];
  const tests=q.prompt.split(/(?<=\.) /).map(sen=>{let m;
   if(m=sen.match(/^(\w+)'s card has a (\d) in the ([a-z ]+) column\./)){const [,w,d,c]=m;return as=>digit(nums[as[kids.indexOf(w)]],10**COLS.indexOf(c))===Number(d);}
   if(m=sen.match(/^(\w+)'s card is the (greatest|smallest) of the four numbers\./)){const [,w,g]=m;return as=>nums[as[kids.indexOf(w)]]===(g==='greatest'?Math.max:Math.min)(...nums);}
   if(m=sen.match(/^(\w+)'s card is (greater|less) than ([\d,]+)\./)){const [,w,g,t]=m,T=Number(t.replace(/,/g,''));return as=>g==='greater'?nums[as[kids.indexOf(w)]]>T:nums[as[kids.indexOf(w)]]<T;}
   if(m=sen.match(/^(\w+)'s card is less than (\w+)'s card but greater than (\w+)'s card\./)){const [,w,x,y]=m;return as=>nums[as[kids.indexOf(w)]]<nums[as[kids.indexOf(x)]]&&nums[as[kids.indexOf(w)]]>nums[as[kids.indexOf(y)]];}
   if(m=sen.match(/^(\w+)'s card is greater than (\w+)'s card\./)){const [,w,x]=m;return as=>nums[as[kids.indexOf(w)]]>nums[as[kids.indexOf(x)]];}
   if(m=sen.match(/^(\w+)'s card is an (odd|even) number\./)){const [,w,e]=m;return as=>nums[as[kids.indexOf(w)]]%2===(e==='odd'?1:0);}
   return null;}).filter(Boolean);
  if(tests.length!==3)fail(q,`read ${tests.length} clues`);
  const sols=[];for(let x=0;x<4;x++)for(let y=0;y<4;y++)for(let z=0;z<4;z++)if(new Set([x,y,z]).size===3&&tests.every(t=>t([x,y,z])))sols.push([x,y,z]);
  if(sols.length!==1){fail(q,`${sols.length} ways fit the clues`);return;}
  const left=[0,1,2,3].find(k=>!sols[0].includes(k));
  if(q.visual)expectText(q,`Card ${left+1}`);else expectValue(q,R(nums[left]));
 },
 compare(q){const l=pictureValue(q.visual.left),r=pictureValue(q.visual.right);expectText(q,l<r?'<':l>r?'>':'=');},
 orderPos(q){const nums=q.stimulus.split(';').map(s=>Number(s.trim().replace(/,/g,''))),desc=/greatest to smallest/.test(q.prompt),pos=/second/.test(q.prompt)?2:4,sorted=[...nums].sort((a,b)=>desc?b-a:a-b);expectValue(q,R(sorted[pos-1]));},
 sortedList(q){exactlyOne(q,o=>{const xs=o.split(';').map(s=>Number(s.trim().replace(/,/g,'')));return xs.every((x,i)=>i===0||xs[i-1]<x);},'sorted list');},
 between(q){const [lo,hi]=q.stimulus.split('<').map(s=>s.trim()).filter(s=>s!=='☐').map(s=>Number(s.replace(/,/g,'')));exactlyOne(q,o=>{const v=Number(o.replace(/,/g,''));return v>lo&&v<hi;},'between');},
 digitCards(q,a){const ds=q.visual.cards.map(c=>Number(c.text));if(JSON.stringify(ds)!==JSON.stringify(a.digits))fail(q,'digit cards differ');
  const perms=xs=>xs.length<2?[xs]:xs.flatMap((x,i)=>perms([...xs.slice(0,i),...xs.slice(i+1)]).map(p=>[x,...p]));
  const want=q.prompt.match(/\*\*(greatest|smallest) (even|odd)\*\*/),all=perms(ds).filter(p=>p[0]!==0).map(p=>Number(p.join(''))).filter(n=>n%2===(want[2]==='even'?0:1));
  expectValue(q,R(want[1]==='greatest'?Math.max(...all):Math.min(...all)));},
 roundsTo(q){const m=q.prompt.match(/nearest (hundred|thousand|ten thousand) is ([\d,]+)/),p={hundred:100,thousand:1000,'ten thousand':10000}[m[1]],T=Number(m[2].replace(/,/g,''));exactlyOne(q,o=>Math.floor(Number(o.replace(/,/g,''))/p+0.5)*p===T,'rounds to');},
 box(q,a){const [l,rhs]=q.stimulus.replace(/,(?=\d{3})/g,'').split('=');const put=(side,o)=>side.replace('☐',a.digit?o:`(${o.replace(/−/g,'-').replace(/,/g,'').replace(/^(\d+) (\d+\/\d+)$/,'$1+$2')})`);
  exactlyOne(q,o=>eq(evaluate(put(l,o)).v,evaluate(put(rhs,o)).v),'box');},
 tableRange(q){const t=q.visual.rows[0].slice(1).map(s=>Number(s.replace(/−/g,'-')));expectValue(q,R(Math.max(...t)-Math.min(...t)));},
 tableColdest(q){const t=q.visual.rows[0].slice(1).map(s=>Number(s.replace(/−/g,'-'))),day=q.visual.head[1+t.indexOf(Math.min(...t))];if(t.filter(x=>x===Math.min(...t)).length!==1)fail(q,'coldest is not unique');if(!q.answers[0].startsWith(day))fail(q,`answer ${q.answers[0]}, coldest ${day}`);},
 romanRead(q){const s=q.prompt.match(/\b([MDCLXVI]{2,})\b/)[1];if(!romanOk(s))fail(q,`${s} is not a valid numeral`);expectValue(q,R(romanValue(s)));},
 romanWrite(q){const n=Number(q.prompt.match(/\*\*([\d,]+)\*\*/)[1].replace(/,/g,''));expectText(q,toRoman(n));for(const o of q.options)if(o!==q.answers[0]&&romanOk(o)&&romanValue(o)===n)fail(q,`${o} is also ${n}`);},
 romanSum(q){const [,a,op,b]=q.stimulus.match(/^([MDCLXVI]+) ([+−]) ([MDCLXVI]+)$/);if(!romanOk(a)||!romanOk(b))fail(q,'invalid numeral in the sum');const n=op==='+'?romanValue(a)+romanValue(b):romanValue(a)-romanValue(b);expectText(q,toRoman(n));},
 romanInvalid(q){exactlyOne(q,o=>!romanOk(o),'invalid numeral');},
 romanGap(q){const [a,b]=[...q.prompt.matchAll(/\b([MDCLXVI]{3,})\b/g)].map(m=>m[1]);if(!romanOk(a)||!romanOk(b))fail(q,'invalid numeral');expectValue(q,R(Math.abs(romanValue(b)-romanValue(a))));},
 romanMax(q){if(!q.options.every(romanOk))fail(q,'invalid numeral among options');const vs=q.options.map(romanValue),m=Math.max(...vs);if(vs.filter(x=>x===m).length!==1)fail(q,'tie');expectText(q,q.options[vs.indexOf(m)]);},
 numberLine(q){const k=Number(Object.keys(q.visual.points)[0]);expectValue(q,lineValue(q.visual,k));},
 numberLineWhich(q){const target=val(q.prompt.match(/\*\*([\d,.−]+)\*\*/)[1]),hits=Object.entries(q.visual.points).filter(([k])=>eq(lineValue(q.visual,Number(k)),target)).map(([,l])=>l);if(hits.length!==1||hits[0]!==q.answers[0])fail(q,`points at the value: ${hits}, answer ${q.answers[0]}`);},
 colDigits(q,a){
  // The figure must spell out the audited rows; then try every pair of digits for A and B.
  const glyphs=allMarks(q.visual).filter(m=>m.t==='text'&&/^[0-9A-Z]$/.test(m.s)).sort((x,y)=>x.y-y.y),rowsY=[];
  for(const m of glyphs)if(!rowsY.some(y=>Math.abs(y-m.y)<6))rowsY.push(m.y);
  const byRow=rowsY.map(y=>glyphs.filter(m=>Math.abs(m.y-y)<6).sort((p,r)=>p.x-r.x).map(m=>m.s).join(''));
  if(JSON.stringify(byRow)!==JSON.stringify([a.top,a.bottom,a.result]))fail(q,`figure rows ${byRow} differ from audit`);
  const [L1,L2]=[...new Set((a.top+a.bottom+a.result).match(/[A-Z]/g))].sort(),sols=[];for(let A=0;A<10;A++)for(let B=0;B<10;B++){const f=s=>Number(s.replace(L1,A).replace(L2,B));if((a.op==='+'?f(a.top)+f(a.bottom):f(a.top)-f(a.bottom))===f(a.result))sols.push(`${L1} = ${A}, ${L2} = ${B}`);}
  if(sols.length!==1)fail(q,`${sols.length} digit pairs fit`);else expectText(q,sols[0]);},
 inverse(q){const m=q.prompt.match(/works out ([\d,]+) ([+−]) ([\d,]+) = ([\d,]+)/),[X,Y,Z]=[m[1],m[3],m[4]].map(s=>Number(s.replace(/,/g,''))),sub=m[2]==='−';
  if((sub?X-Y:X+Y)!==Z)fail(q,'the calculation in the prompt is wrong');
  exactlyOne(q,o=>{const [p,op,r]=o.split(' '),P=Number(p.replace(/,/g,'')),Q=Number(r.replace(/,/g,''));return sub?(op==='+'&&[P,Q].sort().join()===[Z,Y].sort().join())||(op==='−'&&P===X&&Q===Z):op==='−'&&P===Z&&(Q===Y||Q===X);},'inverse');},
 grid(q){const cols=q.visual.head.slice(1).map(s=>Number(s.replace(/,/g,''))),rows=q.visual.rows;let missing=null;
  rows.forEach(row=>{const y=Number(row[0].replace(/,/g,''));row.slice(1).forEach((c,k)=>{if(c==='?')missing=y*cols[k];else if(Number(c.replace(/,/g,''))!==y*cols[k])fail(q,`grid box ${c} should be ${y*cols[k]}`);});});
  const A=cols.reduce((s,x)=>s+x,0),B=rows.reduce((s,r)=>s+Number(r[0].replace(/,/g,'')),0),m=q.prompt.replace(/,(?=\d{3})/g,'').match(/(\d+) × (\d+)/);
  if(!m||Number(m[1])!==A||Number(m[2])!==B)fail(q,`grid headers make ${A} × ${B}, prompt says ${m&&m[0]}`);
  expectValue(q,R(missing??A*B));},
 divisible(q){const by=Number(q.prompt.match(/exactly\*\* by (\d+)/)[1]);exactlyOne(q,o=>Number(o.replace(/,/g,''))%by===0,'divisible');},
 bracket(q){const [lhs,t]=q.stimulus.split(' = '),T=dec(t);exactlyOne(q,o=>{if(o.replace(/[()]/g,'')!==lhs)throw new Error(`${o} is not ${lhs} with brackets`);return eq(evaluate(o).v,T);},'brackets');},
 story(q,a){const {v,literals}=evaluate(a.e),missing=literalsShown(q,literals);if(missing.length)fail(q,`story numbers ${missing.map(show)} not in prompt`);exactlyOne(q,o=>eq(evaluate(o).v,v),'story');},
 largest(q){const vs=q.options.map(o=>evaluate(o).v),best=vs.reduce((m,x)=>cmp(x,m)>0?x:m);if(vs.filter(x=>eq(x,best)).length!==1)fail(q,'tie for greatest');expectText(q,q.options[vs.findIndex(x=>eq(x,best))]);},
 which(q,a){const n=o=>Number(o.replace(/,/g,'')),prime=x=>{if(x<2)return false;for(let k=2;k*k<=x;k++)if(x%k===0)return false;return true;};
  const ab=(q.prompt.match(/\d+/g)||[]).map(Number);
  const test={prime:o=>prime(n(o)),notPrime:o=>!prime(n(o)),cube:o=>{const k=Math.round(Math.cbrt(n(o)));return k**3===n(o);},square:o=>{const k=Math.round(Math.sqrt(n(o)));return k*k===n(o);},
   squareAndCube:o=>{const x=n(o),s=Math.round(Math.sqrt(x)),c=Math.round(Math.cbrt(x));return s*s===x&&c**3===x;},
   commonMultiple:o=>n(o)%ab[0]===0&&n(o)%ab[1]===0,factorNot:o=>ab[0]%n(o)===0&&ab[1]%n(o)!==0}[a.prop];
  if(!test)throw new Error('unknown property '+a.prop);exactlyOne(q,test,a.prop);},
 nFactors(q){const n=Number(q.prompt.match(/\*\*(\d+)\*\*/)[1]);let k=0;for(let d=1;d<=n;d++)if(n%d===0)k++;expectValue(q,R(k));},
 primeFactors(q){const n=Number(q.prompt.match(/\*\*(\d+)\*\*/)[1]),prime=x=>{if(x<2)return false;for(let k=2;k*k<=x;k++)if(x%k===0)return false;return true;};exactlyOne(q,o=>{const fs=o.split(' × ').map(Number);return fs.every(prime)&&fs.reduce((a,b)=>a*b,1)===n;},'prime factors');},
 primeCount(q){const [lo,hi]=q.prompt.match(/between (\d+) and (\d+)/).slice(1).map(Number);let k=0;for(let x=lo+1;x<hi;x++){let p=x>1;for(let d=2;d*d<=x;d++)if(x%d===0)p=false;if(p)k++;}expectValue(q,R(k));},
 primeSum(q){const [lo,hi]=q.prompt.match(/between (\d+) and (\d+)/).slice(1).map(Number);let s=0;for(let x=lo+1;x<hi;x++){let p=x>1;for(let d=2;d*d<=x;d++)if(x%d===0)p=false;if(p)s+=x;}expectValue(q,R(s));},
 cubeCount(q){const fronts=allMarks(q.visual).filter(m=>m.t==='rect').length;expectValue(q,R(fronts));},
 nextSquare(q){const n=Number(q.prompt.match(/greater than (\d+)/)[1]);let k=1;while(k*k<=n)k++;expectValue(q,R(k*k));},
 shaded(q,a){const s=shadedFraction(q.visual);if(!s){fail(q,'no shaded parts found');return;}
  if(a.as==='pct')expectValue(q,mul(s,R(100)));else if(a.as==='simplest'){expectValue(q,s,dec);if(!lowest(q.answers[0]))fail(q,'answer is not in its simplest form');}else expectValue(q,s,dec);},
 simplify(q){const v=dec(q.stimulus);expectValue(q,v,dec);if(!lowest(q.answers[0]))fail(q,'answer is not in its simplest form');},
 notEquiv(q){const base=dec(q.prompt.match(/equivalent to (\d+\/\d+)/)[1]);exactlyOne(q,o=>!eq(dec(o),base),'not equivalent');},
 fracExtreme(q,a){pickExtreme(q,a.dir,dec);},
 extreme(q,a){pickExtreme(q,a.dir,fdpValue);},
 cmpFrac(q){const [x,y]=q.stimulus.split(' ☐ ').map(dec);expectText(q,cmp(x,y)<0?'<':cmp(x,y)>0?'>':'=');},
 cmpShaded(q){const l=shadedFraction(q.visual.left),r=shadedFraction(q.visual.right);expectText(q,cmp(l,r)<0?'<':cmp(l,r)>0?'>':'=');},
 betweenFrac(q){const [lo,hi]=q.prompt.match(/between\**\s(\d+\/\d+) and (\d+\/\d+)/).slice(1).map(dec);exactlyOne(q,o=>cmp(dec(o),lo)>0&&cmp(dec(o),hi)<0,'between');},
 sortedFracList(q){exactlyOne(q,o=>{const xs=o.split(', ').map(dec);return xs.every((x,i)=>i===0||cmp(xs[i-1],x)<0);},'sorted list');},
 whoMore(q,a){const [p,s]=a.names,fa=R(a.a[0],a.a[1]),fb=R(a.b[0],a.b[1]);if(!q.prompt.includes(`${p} `)||!q.prompt.includes(`${a.a[0]}/${a.a[1]}`)||!q.prompt.includes(`${a.b[0]}/${a.b[1]}`))fail(q,'prompt does not show the audited fractions');
  const win=cmp(fa,fb)>0?p:s,d=cmp(fa,fb)>0?sub(fa,fb):sub(fb,fa);expectText(q,`${win}, by ${d.n}/${d.d}`);},
 decDigit(q){const d=q.prompt.match(/digit \*\*(\d)\*\*/)[1],[,frac]=q.stimulus.split('.'),k=frac.indexOf(d);if(k<0||frac.lastIndexOf(d)!==k||q.stimulus.split('.')[0].includes(d))fail(q,'digit not unique');expectValue(q,R(BigInt(d),10n**BigInt(k+1)));},
 largestOf(q){const v=o=>{let m=o.match(/^(\d+)% of ([\d,]+)$/);if(m)return mul(R(m[1],100),R(m[2].replace(/,/g,'')));m=o.match(/^(\d+)\/(\d+) of ([\d,]+)$/);if(m)return mul(R(m[1],m[2]),R(m[3].replace(/,/g,'')));throw new Error('cannot read '+o);};
  const vs=q.options.map(v),best=vs.reduce((m,x)=>cmp(x,m)>0?x:m);if(vs.filter(x=>eq(x,best)).length!==1)fail(q,'tie');expectText(q,q.options[vs.findIndex(x=>eq(x,best))]);},
 fdpEqual(q,a){const t=fdpValue(a.target);if(!q.prompt.includes(`**${a.target}**`))fail(q,'target not in prompt');exactlyOne(q,o=>eq(fdpValue(o),t),'equal to '+a.target);},
 oddValue(q){const vs=q.options.map(fdpValue);exactlyOne(q,o=>{const v=fdpValue(o);return vs.filter(x=>eq(x,v)).length===1&&vs.filter(x=>!eq(x,v)).every((x,i,arr)=>eq(x,arr[0]));},'odd value');},
 subst(q){const vals={};for(const m of q.prompt.matchAll(/\*\*([a-z]) = (\d+)\*\*/g))vals[m[1]]=Number(m[2]);expectValue(q,algebra(q.stimulus,vals));},
 exprMatch(q,a){const {literals}=evaluate(a.e.replace(/(\d)([a-z])/g,'$1').replace(/[a-z]/g,'1'));const missing=literalsShown(q,literals);if(missing.length)fail(q,`story numbers ${missing.map(show)} not in prompt`);exactlyOne(q,o=>sameExpr(o,a.e,[a.v]),'matches the story');},
 exprEquiv(q,a){exactlyOne(q,o=>sameExpr(o,q.stimulus,a.vars),'equivalent');},
 perimeterExpr(q,a){const ts=textsOf(q.visual);if(!a.sides.every(s=>ts.includes(s)))fail(q,'figure does not show the audited sides');const v=a.sides[0].match(/[a-z]/)[0];exactlyOne(q,o=>sameExpr(o,`2(${a.sides[0]})+2(${a.sides[1]})`,[v]),'perimeter');},
 solve(q,a){const [l,rhs]=q.stimulus.split(' = ');exactlyOne(q,o=>eq(algebra(l,{[a.v]:Number(o)}),algebra(rhs,{})),'solves the equation');},
 system(q){const eqs=q.stimulus.split('\n').map(e=>e.split(' = '));exactlyOne(q,o=>{const [,x,y]=o.match(/a = (\d+), b = (\d+)/).map(Number);return eqs.every(([l,rhs])=>eq(algebra(l,{a:x,b:y}),dec(rhs)));},'solves both');},
 think(q){const out=dec(q.prompt.match(/The answer is (\d+)/)[1]),steps=[...q.prompt.matchAll(/(multiplies it by|multiplies the answer by|adds|subtracts|divides it by) (\d+)/g)].map(m=>[m[1].startsWith('multiplies')?'×':m[1]==='adds'?'+':m[1]==='subtracts'?'−':'÷',dec(m[2])]);
  if(steps.length<2)fail(q,'could not read the steps');exactlyOne(q,o=>eq(steps.reduce((v,[op,k])=>applyOp(v,op,k),dec(o)),out),'think of a number');},
 shapeSums(q,a){const rows=q.visual.marks.filter(m=>m.t==='g').map(g=>{const ms=[];const walk=x=>x.forEach(m=>{ms.push(m);if(m.t==='g')walk(m.marks);});walk(g.marks);return {tri:ms.filter(m=>m.t==='poly'&&m.pts.length===6).length,circ:ms.filter(m=>m.t==='circle').length,total:Number(ms.find(m=>m.t==='text'&&/^= \d+$/.test(m.s)).s.slice(2))};});
  if(JSON.stringify(rows)!==JSON.stringify(a.rows))fail(q,'figure rows differ from audit');const sols=[];for(let t=0;t<=60;t++)for(let c=0;c<=60;c++)if(rows.every(r=>r.tri*t+r.circ*c===r.total))sols.push([t,c]);
  if(sols.length!==1){fail(q,`${sols.length} solutions`);return;}const want=/\*\*circle\*\*/.test(q.prompt)?sols[0][1]:sols[0][0];expectValue(q,R(want));},
 pairs(q){const [l,rhs]=q.stimulus.split(' = ');exactlyOne(q,o=>{const [,p,s]=o.match(/p = (\d+), q = (\d+)/).map(Number);return eq(algebra(l,{p,q:s}),dec(rhs));},'fits the equation');},
 seqMissing(q){const ts=q.stimulus.split(', ').map(s=>s==='___'?null:dec(s)),k=ts.indexOf(null),known=ts.map((t,i)=>[i,t]).filter(([,t])=>t),[i0,t0]=known[0],[i1,t1]=known[1],d=div(sub(t1,t0),R(i1-i0));
  if(!known.every(([i,t])=>eq(t,add(t0,mul(d,R(i-i0))))))fail(q,'not a linear sequence');expectValue(q,add(t0,mul(d,R(k-i0))));},
 seqTerm(q){const ts=q.stimulus.replace(', …','').split(', ').map(dec),n=Number(q.prompt.match(/\*\*(\d+)th\*\*/)[1]),d=sub(ts[1],ts[0]);if(!ts.every((t,i)=>eq(t,add(ts[0],mul(d,R(i))))))fail(q,'not linear');expectValue(q,add(ts[0],mul(d,R(n-1))));},
 seqRule(q){const ts=q.stimulus.replace(', …','').split(', ').map(dec);exactlyOne(q,o=>ts.every((t,i)=>eq(algebra(o,{n:i+1}),t)),'nth term');},
 seqPattern(q){const groups=q.visual.marks.filter(m=>m.t==='g'),counts=groups.map(g=>g.marks.filter(m=>m.t==='line').length),n=Number(q.prompt.match(/pattern (\d+)/)[1]),d=counts[1]-counts[0];
  if(counts[2]-counts[1]!==d)fail(q,`pattern counts ${counts} are not linear`);expectValue(q,R(counts[0]+d*(n-1)));},
 seqMember(q){const ts=q.stimulus.replace(', …','').split(', ').map(Number),d=ts[1]-ts[0];exactlyOne(q,o=>{const x=Number(o.replace(/,/g,''));return x>=ts[0]&&(x-ts[0])%d===0;},'in the sequence');},
 seqSpecial(q,a){const ts=q.stimulus.replace(', …','').split(', ').map(s=>Number(s.replace(/,/g,'')));let next;
  if(a.kind==='square'){const r0=Math.round(Math.sqrt(ts[0]));if(!ts.every((t,i)=>t===(r0+i)**2))fail(q,'not squares');next=(r0+ts.length)**2;}
  else if(a.kind==='geometric'){const k=ts[1]/ts[0];if(!ts.every((t,i)=>i===0||t===ts[i-1]*k))fail(q,'not geometric');next=ts.at(-1)*k;}
  else if(a.kind==='fibonacci'){if(!ts.every((t,i)=>i<2||t===ts[i-1]+ts[i-2]))fail(q,'not Fibonacci-like');next=ts.at(-1)+ts.at(-2);}
  else{const tri=k=>k*(k+1)/2;let k0=1;while(tri(k0)<ts[0])k0++;if(!ts.every((t,i)=>t===tri(k0+i)))fail(q,'not triangle numbers');next=tri(k0+ts.length);}
  expectValue(q,R(next));},
 machine(q){const m=readMachine(q.visual),run=x=>m.ops.reduce((v,[op,k])=>applyOp(v,op,k),x);
  if(m.input==='?')exactlyOne(q,o=>eq(run(dec(o)),dec(m.output)),'machine input');else expectValue(q,run(dec(m.input)));},
 machineRule(q){const rows=q.visual.rows.map(r=>r.map(Number));exactlyOne(q,o=>{const p=o.match(/^(?:× (\d+) then )?([+−]) (\d+)$/);if(!p)throw new Error('cannot read rule '+o);const a=Number(p[1]??1),b=(p[2]==='+'?1:-1)*Number(p[3]);return rows.every(([i,out])=>a*i+b===out);},'rule');},
 machineTable(q){const ins=q.visual.head.slice(1),outs=q.visual.rows[0].slice(1),pts=ins.map((x,i)=>[Number(x),outs[i]]).filter(p=>p[1]!=='?').map(([x,y])=>[x,Number(y)]),[x0,y0]=pts[0],[x1,y1]=pts[1],m=(y1-y0)/(x1-x0),k=y0-m*x0;
  if(!pts.every(([x,y])=>m*x+k===y))fail(q,'table is not linear');const x=Number(ins[outs.indexOf('?')]);expectValue(q,R(m*x+k));},
 machineAlgebra(q){const m=readMachine(q.visual);exactlyOne(q,o=>[1,2,3,4,5].every(n=>eq(algebra(o,{n}),m.ops.reduce((v,[op,k])=>applyOp(v,op,k),R(n)))),'machine expression');},
 ratioCounters(q){const cs=allMarks(q.visual).filter(m=>m.t==='circle'),b=cs.filter(m=>m.fill==='black').length,w=cs.filter(m=>m.fill==='white').length,g=Number(bgcd(BigInt(b),BigInt(w)));expectText(q,`${b/g} : ${w/g}`);},
 measureExtreme(q,a){const base=o=>{let t=R(0);for(const m of o.replace(/,/g,'').matchAll(/([\d.]+) (km|m|cm|mm|kg|g|litres?|ml)\b/g)){const f={km:1000,m:1,cm:R(1,100),mm:R(1,1000),kg:1000,g:1,litre:1000,litres:1000,ml:1}[m[2]];t=add(t,mul(dec(m[1]),typeof f==='object'?f:R(f)));}return t;};pickExtreme(q,a.dir,base);},
 jugLitres(q){expectValue(q,div(R(scaleReading(q.visual,'blue')),R(1000)));},
 clock24(q,a){const h=q.visual.h+(a.pm?12:0),m=q.visual.m;if(!/afternoon/.test(q.prompt)!==!a.pm)fail(q,'am/pm does not match the prompt');expectText(q,`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);},
 duration(q){const [s,e]=[...q.prompt.matchAll(/(\d\d):(\d\d)/g)].map(m=>Number(m[1])*60+Number(m[2]));expectValue(q,R(e-s),durMinutes);},
 timetable(q,a){const rows=Object.fromEntries(q.visual.rows.map(r=>[r[0],r.slice(1).map(t=>Number(t.slice(0,2))*60+Number(t.slice(3)))])),t=s=>Number(s.slice(0,2))*60+Number(s.slice(3)),fmt=x=>`${String(Math.floor(x/60)).padStart(2,'0')}:${String(x%60).padStart(2,'0')}`;
  if(a.q==='journey'){const dep=t(q.prompt.match(/the (\d\d:\d\d) bus/)[1]),k=rows['Manor Gate'].indexOf(dep);expectValue(q,R(rows['Castle Park'][k]-dep),durMinutes);}
  else if(a.q==='next'){const at=t(q.prompt.match(/at (\d\d:\d\d) and catches/)[1]),k=rows['High Street'].findIndex(x=>x>=at);expectText(q,fmt(rows['Castle Park'][k]));}
  else{const by=t(q.prompt.match(/by (\d\d:\d\d)/)[1]),ks=rows['Castle Park'].map((x,i)=>[x,i]).filter(([x])=>x<=by);expectText(q,fmt(rows['Manor Gate'][ks.at(-1)[1]]));}},
 minSec(q){const s=Number(q.prompt.match(/lasts (\d+) seconds/)[1]),v=o=>{const m=o.match(/(\d+) minutes? (\d+) seconds?/);return m?R(Number(m[1])*60+Number(m[2])):null;};expectValue(q,R(s),v);},
 calendar(q){const M=['January','February','March','April','May','June','July','August','September','October','November','December'],D=[31,28,31,30,31,30,31,31,30,31,30,31],m=q.prompt.match(/is (\d+) days after (\d+) (\w+)/);let d=Number(m[2])+Number(m[1]),mo=M.indexOf(m[3]);while(d>D[mo]){d-=D[mo];mo=(mo+1)%12;}expectText(q,`${d} ${M[mo]}`);},
 to24(q){const m=q.prompt.match(/\*\*(\d+):(\d\d) (am|pm)\*\*/),h=Number(m[1])%12+(m[3]==='pm'?12:0);expectText(q,`${String(h).padStart(2,'0')}:${m[2]}`);},
 to12(q){const m=q.prompt.match(/\*\*(\d\d):(\d\d)\*\*/),h=Number(m[1]);expectText(q,`${h%12||12}:${m[2]} ${h<12?'am':'pm'}`);},
 priceList(q,a){const price=Object.fromEntries(q.visual.rows.map(([n,p])=>[n,val(p)]));let t=R(0);for(const [item,k] of a.buy){if(!price[item])fail(q,`${item} not in the price list`);if(!q.prompt.includes(`${k} `))fail(q,`quantity ${k} not in prompt`);t=add(t,mul(price[item],R(k)));}expectValue(q,t);},
 bestBuy(q){const each=q.visual.rows.map(([n,p])=>[n,div(val(p),R(Number(n.match(/\d+/)[0])))]),best=each.reduce((m,x)=>cmp(x[1],m[1])<0?x:m);if(each.filter(x=>eq(x[1],best[1])).length>1)fail(q,'tie for best value');expectText(q,best[0]);},
 coins(q){const t=q.visual.groups.reduce((s,g)=>add(s,mul(R(g.count),g.value.startsWith('£')?dec(g.value.slice(1)):div(dec(g.value.slice(0,-1)),R(100)))),R(0));expectValue(q,t);},
 rectilinear(q,a){const pts=a.pts,n=pts.length,lens=pts.map((p,k)=>{const r=pts[(k+1)%n];return Math.abs(p[0]-r[0])+Math.abs(p[1]-r[1]);});
  if(!pts.every((p,k)=>{const r=pts[(k+1)%n];return p[0]===r[0]||p[1]===r[1];}))fail(q,'not all sides are horizontal or vertical');
  const shown=textsOf(q.visual);a.labels.forEach((l,k)=>{if(l&&l!==`${lens[k]} cm`)fail(q,`label ${l} on a side of ${lens[k]} cm`);if(l&&!shown.includes(l))fail(q,`label ${l} not drawn`);});
  const area=Math.abs(pts.reduce((s,p,k)=>{const r=pts[(k+1)%n];return s+p[0]*r[1]-r[0]*p[1];},0))/2;expectValue(q,R(a.ask==='area'?area:lens.reduce((s,x)=>s+x,0)));},
 gridArea(q){const ms=allMarks(q.visual),xs=[...new Set(ms.filter(m=>m.t==='line'&&m.x1===m.x2).map(m=>m.x1))].sort((a,b)=>a-b),u=xs[1]-xs[0],poly=ms.find(m=>m.t==='poly'&&m.fill==='blue');
  const P=[];for(let k=0;k<poly.pts.length;k+=2)P.push([poly.pts[k]/u,poly.pts[k+1]/u]);const A=Math.abs(P.reduce((s,p,k)=>{const r=P[(k+1)%P.length];return s+p[0]*r[1]-r[0]*p[1];},0))/2;expectValue(q,dec(String(Math.round(A*1000)/1000)));},
 cubeCells(q,a){const n=allMarks(q.visual).filter(m=>m.t==='rect').length;if(n!==a.n)fail(q,`picture has ${n} cubes, audit says ${a.n}`);expectValue(q,R(n));},
 regularAngle(q){const n={pentagon:5,hexagon:6,octagon:8,decagon:10}[q.prompt.match(/regular (\w+)/)[1]],poly=allMarks(q.visual).find(m=>m.t==='poly');if(poly.pts.length/2!==n)fail(q,'picture has the wrong number of sides');expectValue(q,R((n-2)*180,n));},
 clockAngle(q){const {h,m}=q.visual,d=Math.abs(((h%12)*30+m/2)-m*6);expectValue(q,R(Math.min(d,360-d)));},
 angleType(q){const d=Number(q.prompt.match(/\*\*(\d+)°\*\*/)[1]);expectText(q,d<90?'acute':d===90?'a right angle':d<180?'obtuse':d===180?'a straight angle':'reflex');},
 quadClue(q){const P={square:{par:2,eq:true,right:4,sym:4,adj:true,opp:true},rectangle:{par:2,eq:false,right:4,sym:2,adj:false,opp:true},rhombus:{par:2,eq:true,right:0,sym:2,adj:true,opp:true},parallelogram:{par:2,eq:false,right:0,sym:0,adj:false,opp:true},trapezium:{par:1,eq:false,right:0,sym:1,adj:false,opp:false},kite:{par:0,eq:false,right:0,sym:1,adj:true,opp:false}};
  const c=q.prompt,test=/exactly one pair of parallel|One pair of my sides is parallel, but the other pair is not/.test(c)?s=>s.par===1:/four equal sides but no right/.test(c)?s=>s.eq&&s.right===0:/four right angles, but my sides are not all/.test(c)?s=>s.right===4&&!s.eq:/equal sides next to each other, no parallel sides and one line/.test(c)?s=>s.adj&&s.par===0&&s.sym===1:/opposite sides are parallel and equal, I have no right angles, and my sides are not all equal/.test(c)?s=>s.par===2&&s.opp&&s.right===0&&!s.eq:null;
  if(!test)throw new Error('unknown clue');exactlyOne(q,o=>test(P[o]),'quadrilateral');
  // Inclusive definitions: a square is also a rectangle, rhombus, parallelogram, kite and trapezium, and so on.
  const ALSO={square:['rectangle','rhombus','parallelogram','kite','trapezium'],rectangle:['parallelogram','trapezium'],rhombus:['parallelogram','kite','trapezium'],parallelogram:['trapezium'],trapezium:[],kite:[]};
  for(const o of q.options)if(ALSO[q.answers[0]].includes(o))fail(q,`a ${q.answers[0]} is also a ${o} under the inclusive definition`);},
 symmetry(q){const poly=allMarks(q.visual).find(m=>m.t==='poly'),pts=[];for(let k=0;k<poly.pts.length;k+=2)pts.push([poly.pts[k],poly.pts[k+1]]);expectValue(q,R(symmetryLines(pts)));},
 circlesRect(q,a){const n=allMarks(q.visual).filter(m=>m.t==='circle').length,rr=Number(q.prompt.match(/radius of each circle is (\d+) cm/)[1]),L=2*rr*n,W=2*rr;expectValue(q,R(a.ask==='length'?L:2*(L+W)));},
 polyName(q,a){const N={3:'triangle',4:'quadrilateral',5:'pentagon',6:'hexagon',7:'heptagon',8:'octagon',9:'nonagon',10:'decagon'};const n=a.picture?allMarks(q.visual).find(m=>m.t==='poly').pts.length/2:Number(q.prompt.match(/has (\d+) straight sides/)[1]);expectText(q,N[n]);},
 triangleType(q){const ang=[...q.prompt.matchAll(/(\d+)°/g)].map(m=>Number(m[1]));if(ang.reduce((s,x)=>s+x,0)!==180)fail(q,'angles do not add to 180');const k=new Set(ang).size;expectText(q,ang.includes(90)?'right-angled':k===1?'equilateral':k===2?'isosceles':'scalene');
  // Every option is checked too, with "isosceles" meaning at least two equal sides (so an equilateral triangle is isosceles).
  const TRUE={equilateral:k===1,isosceles:k<=2,scalene:k===3,'right-angled':ang.includes(90),'obtuse-angled':Math.max(...ang)>90,'acute-angled':Math.max(...ang)<90};
  for(const o of q.options){if(!(o in TRUE))fail(q,`unknown triangle type ${o}`);else if(TRUE[o]&&!q.answers.includes(o))fail(q,`"${o}" is also true`);}},
 regularPerim(q){const n={pentagon:5,hexagon:6,octagon:8,triangle:3,decagon:10}[q.prompt.match(/(?:regular|equilateral) (\w+)/)[1]];let m=q.prompt.match(/perimeter of (\d+) cm/);if(m)expectValue(q,R(Number(m[1]),n));else{m=q.prompt.match(/is (\d+) cm long/);expectValue(q,R(Number(m[1])*n));}},
 fev(q,a){const T={'cube':[6,12,8],'cuboid':[6,12,8],'triangular prism':[5,9,6],'pentagonal prism':[7,15,10],'hexagonal prism':[8,18,12],'square-based pyramid':[5,8,5],'triangular-based pyramid':[4,6,4],'pentagonal pyramid':[6,10,6]}[a.shape];if(!q.prompt.includes(a.shape))fail(q,'shape not named');const [F,E,V]=T;if(F+V-E!==2)fail(q,'Euler check');expectValue(q,R({faces:F,edges:E,vertices:V}[q.prompt.match(/\*\*(faces|edges|vertices)\*\*/)[1]]));},
 cubeNetPick(q,a){const ok=v=>{const net=readNet(v);return new Set(fold(net.map(c=>c.cell))).size===6;};const good=q.optionVisuals.map(ok),want=/NOT/.test(q.prompt)?false:true;if(want!==a.want)fail(q,'prompt and audit disagree');
  const hits=q.options.filter((_,i)=>good[i]===want);if(hits.length!==1||hits[0]!==q.answers[0])fail(q,`nets matching: ${hits}, answer ${q.answers[0]}`);},
 netShape(q){const polys=allMarks(q.visual).filter(m=>m.t==='poly'),tri=polys.filter(p=>p.pts.length===6).length,quad=polys.filter(p=>p.pts.length===8).length;
  expectText(q,tri===2&&quad===3?'triangular prism':tri===4&&quad===1?'square-based pyramid':tri===4&&quad===0?'triangular-based pyramid':tri===0&&quad===6?'cuboid':'?');},
 describe3d(q){const c=q.prompt,n=w=>Number((c.match(new RegExp(`(\\d+) ${w}`))||[])[1]||0);let want;
  if(/(\d+) faces, and they are all triangles/.test(c))want=n('faces')===4?'triangular-based pyramid':'?';else if(/6 square faces/.test(c))want='cube';
  else if(n('rectangles')){const ends={triangles:'triangular',pentagons:'pentagonal',hexagons:'hexagonal'},k=Object.keys(ends).find(e=>n(e)===2);want=k&&n('rectangles')===({triangles:3,pentagons:5,hexagons:6})[k]?`${ends[k]} prism`:'?';}
  else if(n('triangles')){want=n('square')===1&&n('triangles')===4?'square-based pyramid':n('pentagon')===1&&n('triangles')===5?'pentagonal pyramid':'?';}
  expectText(q,want);},
 netOpposite(q){const net=readNet(q.visual),faces=fold(net.map(c=>c.cell)),lab=q.prompt.match(/opposite\*\* the (\d)/)[1],k=net.findIndex(c=>c.label===lab),j=faces.indexOf(OPPOSITE[faces[k]]);if(new Set(faces).size!==6)fail(q,'not a cube net');expectText(q,net[j].label);},
 coordRead(q){const pts=readGridPoints(q.visual),lab=q.prompt.match(/point \*\*([A-Z])\*\*/)[1];if(pts.ambiguous)fail(q,`label ${pts.ambiguous} is about as close to two points`);expectText(q,ptText(pts[lab]));},
 coordRect(q){const drawn=readGridPoints(q.visual);if(drawn.ambiguous)fail(q,`label ${drawn.ambiguous} is about as close to two points`);
  for(const m of q.prompt.matchAll(/([A-Z]) (\(−?\d+, −?\d+\))/g))if(!drawn[m[1]]||ptText(drawn[m[1]])!==m[2])fail(q,`point ${m[1]} is drawn at ${drawn[m[1]]&&ptText(drawn[m[1]])}, not ${m[2]}`);
  const ps=[...q.prompt.matchAll(/[A-Z] (\(−?\d+, −?\d+\))/g)].map(m=>readPt(m[1])),once=k=>{const v=ps.map(p=>p[k]);return v.find(x=>v.filter(y=>y===x).length===1);};expectText(q,ptText([once(0),once(1)]));
  const span=k=>Math.max(...ps.map(p=>p[k]))-Math.min(...ps.map(p=>p[k]));if(span(0)===span(1))fail(q,'this "rectangle" is a square');},
 translate(q){const p=readPt(q.prompt),m=q.prompt.match(/translated (\d+) squares? (left|right) and (\d+) squares? (up|down)/),dx=Number(m[1])*(m[2]==='right'?1:-1),dy=Number(m[3])*(m[4]==='up'?1:-1);expectText(q,ptText([p[0]+dx,p[1]+dy]));},
 reflect(q){const p=readPt(q.prompt),inY=/\*\*y-axis\*\*/.test(q.prompt);expectText(q,ptText(inY?[-p[0],p[1]]:[p[0],-p[1]]));},
 onLine(q){const m=q.prompt.match(/\*\*([xy]) = (−?\d+)\*\*/),k=m[1]==='x'?0:1,c=Number(m[2].replace('−','-'));exactlyOne(q,o=>readPt(o)[k]===c,'on the line');},
 coordRectMeasure(q,a){const ps=[...q.prompt.matchAll(/\(−?\d+, −?\d+\)/g)].map(m=>readPt(m[0])),xs=ps.map(p=>p[0]),ys=ps.map(p=>p[1]),w=Math.max(...xs)-Math.min(...xs),h=Math.max(...ys)-Math.min(...ys);if(w===h)fail(q,'this "rectangle" is a square');expectValue(q,R(a.ask==='area'?w*h:2*(w+h)));},
 chart(q,a){const v=q.visual,val=l=>{const k=v.labels.indexOf(l);if(k<0)throw new Error('no bar '+l);return v.values[k];};
  if(v.values.some(x=>x>v.max))fail(q,'a value is off the scale');
  if(a.op==='diff'){if(!q.prompt.includes(a.a)||!q.prompt.includes(a.b))fail(q,'labels not in prompt');expectValue(q,R(val(a.a)-val(a.b)));}
  else if(a.op==='total')expectValue(q,R(v.values.reduce((s,x)=>s+x,0)));
  else if(a.op==='change'){if(!q.prompt.includes(`from ${a.a} to ${a.b}`))fail(q,'times not in prompt');expectValue(q,R(val(a.b)-val(a.a)));}
  else if(a.op==='maxLabel'){const m=Math.max(...v.values);if(v.values.filter(x=>x===m).length!==1)fail(q,'tie');expectText(q,v.labels[v.values.indexOf(m)]);}},
 pictogram(q,a){const v=q.visual,val=l=>{const row=v.rows.find(r=>r.label===l);return mul(dec(String(row.count)),R(v.value));};
  if(a.op==='value')expectValue(q,val(a.label));else expectValue(q,sub(val(a.a),val(a.b)));},
 twoWay(q){const t=q.visual,rows=t.rows,cols=t.head.slice(1,-1);let want=null;
  rows.forEach((row,j)=>row.slice(1,-1).forEach((c,k)=>{if(c==='?'){const colTot=Number(rows.at(-1)[k+1]),others=rows.slice(0,-1).filter((_,jj)=>jj!==j).reduce((s,r)=>s+Number(r[k+1]),0);want=colTot-others;
   const rowTot=Number(row.at(-1)),rowOthers=row.slice(1,-1).reduce((s,x,kk)=>kk===k?s:s+Number(x),0);if(rowTot-rowOthers!==want)fail(q,'row and column totals disagree');}}));
  const rowName=q.prompt.match(/How many (girls|boys)/)[1],colName=q.prompt.match(/chose (\w+)\?/)[1];if(!rows.find(r=>r[0].toLowerCase()===rowName)?.includes('?'))fail(q,'asked row is not the missing one');if(cols.findIndex(c=>c.toLowerCase()===colName)<0)fail(q,'column not found');
  expectValue(q,R(want));},
 frequency(q,a){const goals=q.visual.head.slice(1).map(Number),freq=q.visual.rows[0].slice(1).map(Number);expectValue(q,R(a.ask==='total'?goals.reduce((s,g,k)=>s+g*freq[k],0):freq.reduce((s,f)=>s+f,0)));},
 pie(q,a){const ts=textsOf(q.visual);for(const s of a.slices){if(!ts.includes(s.label))fail(q,`slice label ${s.label} not drawn`);if(!ts.includes(s.name))fail(q,`key ${s.name} not drawn`);}
  const total360=a.slices.reduce((s,x)=>s+x.deg,0);if(Math.abs(total360-360)>1e-6)fail(q,'slices do not make a full circle');
  const deg=n=>a.slices.find(s=>s.name===n).deg;
  if(a.q==='count'){if(!q.prompt.includes(String(a.total)))fail(q,'total not in prompt');expectValue(q,mul(R(a.total),R(deg(a.name),360)));}
  else if(a.q==='fraction')expectValue(q,R(deg(a.name),360),dec);
  else if(a.q==='missing'){const shown=a.slices.filter(s=>s.label!=='x').map(s=>Number(s.label.replace('°','')));expectValue(q,R(360-shown.reduce((s,x)=>s+x,0)));}
  else if(a.q==='percent'){const p=Number(a.slices.find(s=>s.name===a.name).label.replace('%',''));if(!q.prompt.includes(String(a.total)))fail(q,'total not in prompt');expectValue(q,mul(R(a.total),R(p,100)));}},
 meanOf(q){const xs=q.stimulus.split(', ').map(dec);expectValue(q,div(xs.reduce(add,R(0)),R(xs.length)));},
 meanMissing(q){const m=q.prompt.match(/mean of (\d+) numbers is (\d+)\. (?:\w+) of them (?:are|is) ([\d, and]+)\./),n=Number(m[1]),mean=Number(m[2]),known=m[3].split(/, | and /).map(Number);expectValue(q,R(n*mean-known.reduce((s,x)=>s+x,0)));},
 meanChart(q){const v=q.visual.values;expectValue(q,R(v.reduce((s,x)=>s+x,0),v.length));},
 jug(q){expectValue(q,R(scaleReading(q.visual,'blue')));},
 jugMore(q){const target=Number(q.prompt.match(/the ([\d,]+) ml mark/)[1].replace(/,/g,''));expectValue(q,R(target-scaleReading(q.visual,'blue')));},
};
/** "1 hour 35 minutes", "95 minutes", "2 hours" → minutes. */
function durMinutes(s){let t=0,any=false;for(const m of String(s).matchAll(/(\d+)\s*(hours?|h\b|minutes?|min\b)/g)){t+=Number(m[1])*(/^h/.test(m[2])?60:1);any=true;}return any?R(t):null;}

// ── Run.
for(const q of qs){
 const a=mathsAudit[q.id];counts[a?.k??'none']=(counts[a?.k??'none']??0)+1;
 if(!a){fail(q,'no audit record');continue;}
 // A prompt that points at a picture must come with one.
 if(!q.visual&&/\b(picture|the chart|this chart|the bar chart|this bar chart|the pie chart|this pie chart|the line graph|the pictogram|grid|shaded|counters|bar model|number line|machine|in the jug|thermometer|the clock|clock face|diagram|this shape|this rectangle|this triangle|the table|patterns|blocks)\b/i.test(q.prompt))fail(q,'prompt refers to a picture but there is none');
 const check=CHECK[a.k];if(!check){fail(q,`no independent check for kind ${a.k}`);continue;}
 try{check(q,a);}catch(e){fail(q,`check ${a.k} threw: ${e.message}`);}
}
if(bankProblems.some(p=>p.startsWith('ma-')||p.startsWith('v2-ma-')))fails.push(...bankProblems.filter(p=>p.startsWith('ma-')||p.startsWith('v2-ma-')));
// A helpsheet teaches with a different example: no question in the topic may use all the numbers in the example's title.
const signedNumbers=s=>String(s).replace(/(\d),(?=\d{3})/g,'$1').match(/−?\d+(?:\.\d+)?(?:\/\d+)?/g)||[];
for(const t of bankTopics.filter(t=>t.subject==='Maths')){const ex=t.helpsheet.example;if(!ex?.title)continue;const want=signedNumbers(ex.title);if(want.length<2)continue;
 for(const q of qs.filter(q=>q.topic===t.id)){const have=signedNumbers([q.prompt,q.stimulus??''].join(' '));if(want.every(w=>have.includes(w)))fail(q,`uses the numbers of the helpsheet example "${ex.title}"`);}}
// The bank must come out the same every time it is built (pupil records are keyed by question ID).
{const before=JSON.stringify(qs);for(const k of Object.keys(require.cache))if(k.startsWith(dir))delete require.cache[k];const again=require(path.join(dir,'bank.cjs')).bankQuestions.filter(q=>q.subject==='Maths');if(JSON.stringify(again)!==before)fails.push('the Maths bank changes between builds');}
console.log(`Checked ${qs.length} Maths questions in ${bankTopics.filter(t=>t.subject==='Maths').length} topics by kind:`,counts);
if(fails.length){console.log(`FAIL: ${fails.length} problem(s)`);fails.slice(0,60).forEach(f=>console.log(' -',f));process.exit(1);}
console.log(`PASS: every Maths answer was re-solved independently and matches; no wrong option is also correct.`);
