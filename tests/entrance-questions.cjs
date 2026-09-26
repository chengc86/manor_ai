// Run game-audit.cjs first. Independent checks for the 200 entrance-exam questions:
// answers are recomputed from the question data, and every diagram's answer is re-derived from its drawn model.
const fs=require('fs'),assert=require('node:assert/strict');
const {questions,answerMatches,normalise}=require('../work/questions.cjs');
const added=questions.filter(q=>q.id.startsWith('entrance-200-'));
assert.equal(added.length,200);
for(const s of ['Maths','English','Verbal reasoning','Non-verbal reasoning'])assert.equal(added.filter(q=>q.subject===s&&q.difficulty==='Year 6').length,50,s);
const key=q=>JSON.stringify([q.subject,normalise(q.prompt),q.passage||'',q.options||[],q.diagram||{}]);
const seen=new Set(questions.filter(q=>!q.id.startsWith('entrance-200-')).map(key));
for(const q of added){assert(!seen.has(key(q)),`Repeat of an existing question: ${q.id}`);seen.add(key(q));}
const byId=Object.fromEntries(added.map(q=>[q.id,q]));
const round=x=>Math.round(x*1e9)/1e9,run=expr=>Function(`"use strict";return (${expr});`)();
const value=s=>{s=s.trim();if(s.endsWith('%'))return Number(s.slice(0,-1))/100;const f=s.match(/^(\d+)\/(\d+)$/);return f?f[1]/f[2]:Number(s);};
const unique=(q,ok)=>{const hits=q.options.filter(ok);assert.equal(hits.length,1,q.id);assert(answerMatches(q,hits[0]),q.id);};
const prime=n=>n>1&&[...Array(n).keys()].slice(2).every(d=>n%d);

let computed=0;
for(const [id,type,...args] of JSON.parse(fs.readFileSync('tests/entrance-question-cases.json','utf8'))){const q=byId[id];assert(q,id);computed++;
 switch(type){
 case 'expr':assert(answerMatches(q,String(round(run(args[0])))),id);break;
 case 'expr-options':unique(q,o=>round(run(o.replace(/×/g,'*').replace(/−/g,'-')))===args[0]);break;
 case 'time':{const t=args[0]+run(args[1]);assert(answerMatches(q,`${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`),id);break;}
 case 'best-buy':{const unit=o=>{const [,n,p]=o.match(/^(\d+) for £([\d.]+)$/);return p/n;};const best=Math.min(...q.options.map(unit));unique(q,o=>unit(o)===best);break;}
 case 'value-options':unique(q,o=>round(value(o))===round(run(args[0])));break;
 case 'nth-options':unique(q,o=>{const [,a,b]=o.match(/^(\d*)n \+ (\d+)$/);return args[0].every((t,i)=>Number(a||1)*(i+1)+Number(b)===t);});break;
 case 'median':{const s=[...args[0]].sort((a,b)=>a-b),m=s.length/2;assert(answerMatches(q,String(s.length%2?s[Math.floor(m)]:(s[m-1]+s[m])/2)),id);break;}
 case 'mode':{const c={};for(const x of args[0])c[x]=(c[x]||0)+1;const top=Math.max(...Object.values(c)),modes=Object.keys(c).filter(k=>c[k]===top);assert.equal(modes.length,1,id);assert(answerMatches(q,modes[0]),id);break;}
 case 'prime-sum':{let t=0;for(let n=args[0]+1;n<args[1];n++)if(prime(n))t+=n;assert(answerMatches(q,String(t)),id);break;}
 case 'prime-product':unique(q,o=>{const f=o.split(' × ').map(Number);return f.every(prime)&&f.reduce((a,b)=>a*b,1)===args[0];});break;
 case 'square-cube':unique(q,o=>Number.isInteger(Math.sqrt(+o))&&Math.round(Math.cbrt(+o))**3===+o);break;
 case 'hcf':{let [a,b]=args;while(b)[a,b]=[b,a%b];assert(answerMatches(q,String(a)),id);break;}
 case 'mixed-sum':{const [[a,b],[c,d]]=args,gcd=(x,y)=>y?gcd(y,x%y):x,n=a*d+c*b,den=b*d,k=gcd(n,den);assert(answerMatches(q,`${Math.floor(n/den)} ${n/k%(den/k)}/${den/k}`),id);break;}
 case 'largest':{const best=Math.max(...q.options.map(value));unique(q,o=>value(o)===best);break;}
 case 'tickets':{const [adult,child,people,total]=args,fits=[...Array(people+1).keys()].filter(a=>adult*a+child*(people-a)===total);assert.equal(fits.length,1,id);assert(answerMatches(q,String(fits[0])),id);break;}
 case 'insert-letter':{const [pairs,letter,words]=args;assert.deepEqual(pairs.split(/\s{2,}/).map(p=>p.split(' ( ? ) ')).flatMap(([a,b])=>[a+letter,letter+b]),words,id);assert(answerMatches(q,letter),id);break;}
 case 'hidden-word':{const [sentence,word]=args,words=sentence.toLowerCase().replace(/[^a-z ]/g,'').split(' '),joined=words.join('');let at=0,found=false;for(const w of words.slice(0,-1)){at+=w.length;for(let i=Math.max(0,at-3);i<at;i++)if(joined.slice(i,i+4)===word)found=true;}assert(found,id);assert(answerMatches(q,word),id);break;}
 case 'move-letter':{const [first,second,letter,a,b]=args;assert([...first].some((c,i)=>c===letter&&first.slice(0,i)+first.slice(i+1)===a),id);assert([...Array(second.length+1).keys()].some(i=>second.slice(0,i)+letter+second.slice(i)===b),id);assert(answerMatches(q,letter),id);break;}
 case 'letter-series':{const pairs=args[0].split(/\s+/).filter(p=>/^[A-Z]{2}$/.test(p));const next=[0,1].map(k=>{const v=pairs.map(p=>p.charCodeAt(k)-65),d=v.slice(1).map((x,i)=>x-v[i]),dd=d.slice(1).map((x,i)=>x-d[i]);assert(dd.every(x=>x===dd[0]),id);return String.fromCharCode(65+v.at(-1)+d.at(-1)+dd[0]);}).join('');assert(answerMatches(q,next),id);break;}
 case 'brackets':{const [text,rule]=args,f=run(rule),groups=[...text.matchAll(/(\d+) \( ?(\d+|\?) ?\) (\d+)/g)];assert.equal(groups.length,3,id);for(const g of groups.slice(0,2))assert.equal(f(+g[1],+g[3]),+g[2],id);const [a,b]=[+groups[2][1],+groups[2][3]];assert(answerMatches(q,String(f(a,b))),id);
  // Any other common rule that fits both examples must give the same answer, or the puzzle is ambiguous.
  for(const alt of [(x,y)=>x+y,(x,y)=>x-y,(x,y)=>y-x,(x,y)=>x*y,(x,y)=>x/y,(x,y)=>2*x-1,(x,y)=>2*x+1,(x,y)=>2*y-1,(x,y)=>2*y+1,(x,y)=>x+1,(x,y)=>y+1,(x,y)=>x-1,(x,y)=>(x+y)*2,(x,y)=>x*y-x,(x,y)=>x*y-y,(x,y)=>x*y+1,(x,y)=>x*y-1,(x,y)=>x*x+y,(x,y)=>x*x-y,(x,y)=>x*x+2,(x,y)=>x*x-y*y,(x,y)=>x**y+y,(x,y)=>x*x,(x,y)=>(x+y)/2,(x,y)=>x*y/2])
   if(groups.slice(0,2).every(g=>alt(+g[1],+g[3])===+g[2]))assert.equal(alt(a,b),f(a,b),`${id}: another rule fits the examples`);
  break;}
 case 'alpha-sum':assert(answerMatches(q,String([...args[0]].reduce((t,c)=>t+c.charCodeAt(0)-64,0))),id);break;
 case 'letter-sum':{const [values,expr]=args,v=Function(...Object.keys(values),`return (${expr});`)(...Object.values(values)),letters=Object.keys(values).filter(k=>values[k]===v);assert.equal(letters.length,1,id);assert(answerMatches(q,letters[0]),id);break;}
 case 'missing-word':{const [sentence,full,answer]=args;assert.equal(sentence.match(/[A-Z]+_{3}[A-Z]*/)[0].replace('___',answer.toUpperCase()),full,id);assert(answerMatches(q,answer),id);break;}
 case 'shift-code':assert(answerMatches(q,[...args[0]].map(c=>String.fromCharCode(65+(c.charCodeAt(0)-65+args[1])%26)).join('')),id);break;
 case 'mirror-code':assert(answerMatches(q,[...args[0]].map(c=>String.fromCharCode(155-c.charCodeAt(0))).join('')),id);break;
 case 'number-code':assert(answerMatches(q,[...args[0]].map(c=>c.charCodeAt(0)-64).join('-')),id);break;
 case 'word-ladder':{const one=(a,b)=>a.length===b.length&&[...a].filter((c,i)=>c!==b[i]).length===1;unique(q,o=>one(args[0],o)&&one(o,args[1]));break;}
 case 'order':{const [rules,target]=args,names=[...new Set(rules.flatMap(r=>r.split(/[<>=]/)).filter(x=>!/^\d+$/.test(x)))],perms=a=>a.length<2?[a]:a.flatMap((x,i)=>perms([...a.slice(0,i),...a.slice(i+1)]).map(p=>[x,...p]));
  const picks=new Set(perms(names).filter(p=>rules.every(r=>{const [a,b]=r.split(/[<>=]/);return r.includes('=')?p.indexOf(a)===b-1:p.indexOf(a)<p.indexOf(b);})).map(p=>target==='last'?p.at(-1):p[target-1]));assert.equal(picks.size,1,id);unique(q,o=>picks.has(o));break;}
 case 'day':{const days=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];unique(q,o=>o===days[(days.indexOf(args[0])+args[1])%7]);break;}
 default:throw Error(`Unknown check ${type}`);
 }}

// Shapes made of squares: rows run down the page, columns across.
const normal=cells=>{const r0=Math.min(...cells.map(c=>c[0])),c0=Math.min(...cells.map(c=>c[1]));return cells.map(([r,c])=>[r-r0,c-c0]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);};
const same=(a,b)=>JSON.stringify(normal(a))===JSON.stringify(normal(b));
const turn=cells=>normal(cells.map(([r,c])=>[c,-r])),flip=cells=>normal(cells.map(([r,c])=>[r,-c]));
const turns=cells=>{const out=[];let s=normal(cells);for(let i=0;i<4;i++){out.push(s);s=turn(s);}return out;};
function cubeNet(cells){const set=new Set(cells.map(c=>c.join()));if(cells.some(([r,c])=>[[r,c+1],[r+1,c],[r+1,c+1]].every(x=>set.has(x.join()))))return false;
 const roll={'0,1':([b,t,n,s,e,w])=>[e,w,n,s,t,b],'0,-1':([b,t,n,s,e,w])=>[w,e,n,s,b,t],'-1,0':([b,t,n,s,e,w])=>[n,s,t,b,e,w],'1,0':([b,t,n,s,e,w])=>[s,n,b,t,e,w]};
 const faces=new Map([[cells[0].join(),['bottom','top','north','south','east','west']]]),queue=[cells[0]];
 while(queue.length){const [r,c]=queue.pop();for(const [d,f] of Object.entries(roll)){const [dr,dc]=d.split(',').map(Number),k=`${r+dr},${c+dc}`;if(set.has(k)&&!faces.has(k)){faces.set(k,f(faces.get(`${r},${c}`)));queue.push([r+dr,c+dc]);}}}
 return new Set([...faces.values()].map(f=>f[0])).size===6;}
let fixed=new Set(['[[0,0]]']);for(let k=1;k<6;k++){const grown=new Set();for(const s of fixed){const p=JSON.parse(s);for(const [r,c] of p)for(const [dr,dc] of [[0,1],[1,0],[0,-1],[-1,0]])if(!p.some(x=>x[0]===r+dr&&x[1]===c+dc))grown.add(JSON.stringify(normal([...p,[r+dr,c+dc]])));}fixed=grown;}
const free=new Set([...fixed].map(s=>{const p=JSON.parse(s);return [...turns(p),...turns(flip(p))].map(x=>JSON.stringify(x)).sort()[0];}));
assert.equal(free.size,35);assert.equal([...free].filter(s=>cubeNet(JSON.parse(s))).length,11);

const drawnCells=body=>[...body.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)"/g)].map(m=>[m[2]/m[3],m[1]/m[3]]);
const drawnHoles=body=>[...body.matchAll(/<circle class="hole" cx="([\d.]+)" cy="([\d.]+)"/g)].map(m=>[(m[2]-8.5)/17,(m[1]-8.5)/17]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
const sorted=h=>[...h].map(x=>[...x]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
let diagrams=0;const bases=[],pictures={},answerPictures=[];
const vflip=cells=>normal(cells.map(([r,c])=>[-r,c])),base=cells=>[...turns(cells),...turns(flip(cells))].map(x=>JSON.stringify(x)).sort()[0];
const steady=(values,mod)=>{const d=values.slice(1).map((v,i)=>mod?((v-values[i])%mod+mod)%mod:v-values[i]);assert(d.every(x=>x===d[0]),'uneven step');return d[0];};
for(const q of added.filter(q=>q.subject==='Non-verbal reasoning')){
 const svg=fs.readFileSync(`public/question-diagrams/photo-${q.diagram.items[0]}.svg`,'utf8');assert(svg.includes(`data-question="${q.id}"`),q.id);
 const type=svg.match(/data-type="([^"]+)"/)[1],meta=JSON.parse(svg.match(/<svg[^>]*data-model='([^']*)'/)[1]);
 const figs=[...svg.matchAll(/<g data-role="(\w+)" data-label="(\w*)" transform="translate\([-\d.]+ [-\d.]+\)" data-model='([^']*)'>(.*?)<\/g>/g)].map(m=>({role:m[1],label:m[2],model:JSON.parse(m[3]),body:m[4]}));
 const opts=figs.filter(f=>f.role==='option'),role=r=>figs.find(f=>f.role===r)?.model;
 if(type!=='codes')assert.deepEqual(opts.map(o=>o.label),q.options,q.id);
 const pick=ok=>{const hits=opts.filter(o=>ok(o.model));assert.equal(hits.length,1,`${q.id}: ${hits.length} options fit`);assert(answerMatches(q,hits[0].label),q.id);};
 for(const f of figs.filter(f=>f.model.cells))assert(same(drawnCells(f.body),f.model.cells),`${q.id}: drawing differs from model`);
 for(const f of figs.filter(f=>['source','a','c'].includes(f.role)&&f.model.cells))bases.push(base(f.model.cells));
 for(const f of figs.filter(f=>!['example','target'].includes(f.role)))(pictures[f.body]??=new Set()).add(q.id);
 if(type!=='codes')answerPictures.push([q.id,opts.find(o=>answerMatches(q,o.label)).body]);
 switch(type){
 case 'rotation':{const src=role('source').cells;pick(m=>turns(src).some(t=>same(t,m.cells)));break;}
 case 'reflection':{const src=role('source').cells;pick(m=>same(m.cells,meta.axis==='horizontal'?vflip(src):flip(src)));break;}
 case 'cube-net':pick(m=>cubeNet(m.cells));break;
 case 'codes':{const maps=meta.features.map((_,p)=>{const fits=meta.features.filter(f=>{const pairs=new Set(meta.examples.map(e=>`${e.figure[f]}|${e.code[p]}`));return new Set(meta.examples.map(e=>String(e.figure[f]))).size===pairs.size&&new Set(meta.examples.map(e=>e.code[p])).size===pairs.size;});assert.equal(fits.length,1,`${q.id}: letter ${p+1} is ambiguous`);return [fits[0],Object.fromEntries(meta.examples.map(e=>[e.figure[fits[0]],e.code[p]]))];});
  const code=maps.map(([f,m])=>{assert(meta.examples.filter(e=>e.figure[f]===meta.target[f]).length>=2,`${q.id}: a needed letter is shown only once`);return m[meta.target[f]];}).join('');unique(q,o=>o===code);break;}
 case 'odd-one-out':{
  if(meta.rule==='mirror'){pick(m=>opts.filter(o=>turns(o.model.cells).some(t=>same(t,m.cells))).length===1);bases.push(base(opts[0].model.cells));break;}
  const sides={triangle:3,square:4,pentagon:5,hexagon:6},fits={inner:m=>m.outer===m.inner,dots:m=>m.dots===sides[m.shape],half:m=>2*m.shaded===m.parts,arrow:m=>m.arrow===m.spot}[meta.rule];pick(m=>!fits(m));
  // No other figure may be 'the only one' with some feature, or a pupil could argue for it.
  for(const o of opts.filter(o=>fits(o.model)))for(const [k,v] of Object.entries(o.model))assert(k==='match'||opts.filter(x=>x.model[k]===v).length>=2,`${q.id}: ${o.label} is the only one with ${k}`);break;}
 case 'series':{const frames=figs.filter(f=>f.role==='frame').map(f=>f.model);assert.equal(frames.length,4,q.id);const col=k=>frames.map(f=>f[k]);let next;
  const alternating=k=>{assert(frames[0][k]===frames[2][k]&&frames[1][k]===frames[3][k]&&frames[0][k]!==frames[1][k],`${q.id}: ${k} should alternate`);return frames[0][k];};
  if(meta.kind==='movers')next={dot:(frames[3].dot+steady(col('dot'),8))%8,ring:(frames[3].ring+steady(col('ring'),8))%8};
  else if(meta.kind==='sides')next={sides:frames[3].sides+steady(col('sides')),fill:alternating('fill')};
  else if(meta.kind==='count')next={shape:alternating('shape'),dots:frames[3].dots+steady(col('dots'))};
  else if(meta.kind==='grow')next={size:frames[3].size+steady(col('size')),angle:(frames[3].angle+steady(col('angle'),360))%360};
  else next={angle:(frames[3].angle+steady(col('angle'),360))%360};
  assert(!frames.some(f=>JSON.stringify(f)===JSON.stringify(next)),`${q.id}: the answer repeats a frame`);
  pick(m=>Object.keys(next).every(k=>m[k]===next[k]));break;}
 case 'matrix':{const cell=(r,c)=>figs.find(f=>f.role==='cell'&&f.label===`${r}${c}`).model,one=vals=>{assert(vals.every(v=>v===vals[0]),q.id);return vals[0];};
  if(meta.kind==='count')pick(m=>m.shape===one([cell(2,0).shape,cell(2,1).shape])&&m.count===one([cell(0,2).count,cell(1,2).count]));
  else if(meta.kind==='latin'){const fills=['white','grey','black'],missing=fills.filter(f=>![cell(2,0).fill,cell(2,1).fill].includes(f));assert.equal(missing.length,1,q.id);assert(![cell(0,2).fill,cell(1,2).fill].includes(missing[0]),q.id);pick(m=>m.shape===one([cell(0,2).shape,cell(1,2).shape])&&m.fill===missing[0]);}
  else if(meta.kind==='arrow'){const turn=one([0,1].map(r=>steady([0,1,2].map(c=>cell(r,c).angle),360)));assert.equal(steady([0,1].map(c=>cell(2,c).angle),360),turn,q.id);pick(m=>m.angle===(cell(2,1).angle+turn)%360);}
  else if(meta.kind==='sum'){const rules={sum:(a,b)=>a+b,product:(a,b)=>a*b,difference:(a,b)=>Math.abs(a-b),larger:Math.max,sumPlusOne:(a,b)=>a+b+1,doubleFirst:a=>2*a,doubleSecond:(a,b)=>2*b};
   const fitting=Object.entries(rules).filter(([,f])=>[0,1].every(r=>f(cell(r,0).dots,cell(r,1).dots)===cell(r,2).dots)).map(([k])=>k);assert.deepEqual(fitting,['sum'],`${q.id}: another rule fits`);pick(m=>m.dots===cell(2,0).dots+cell(2,1).dots);}
  else{const set=l=>new Set(l),eq=(a,b)=>a.size===b.size&&[...a].every(x=>b.has(x)),rules={union:(a,b)=>set([...a,...b]),xor:(a,b)=>set([...a].filter(x=>!b.has(x)).concat([...b].filter(x=>!a.has(x)))),both:(a,b)=>set([...a].filter(x=>b.has(x))),first:a=>a,second:(a,b)=>b,minus:(a,b)=>set([...a].filter(x=>!b.has(x)))};
   const row=r=>[0,1,2].map(c=>set(cell(r,c).lines)),fitting=Object.entries(rules).filter(([,f])=>[0,1].every(r=>{const [a,b,c]=row(r);return eq(f(a,b),c);})).map(([k])=>k);assert.deepEqual(fitting,[meta.kind],`${q.id}: another line rule fits`);
   const [a,b]=[0,1].map(c=>set(cell(2,c).lines));pick(m=>eq(set(m.lines),rules[meta.kind](a,b)));}
  break;}
 case 'analogy':{const [a,b,c]=['a','b','c'].map(role);
  if(['quarter','half-turn','mirror'].includes(meta.kind)){const change={quarter:x=>turns(x)[1],'half-turn':x=>turns(x)[2],mirror:flip}[meta.kind];assert(same(b.cells,change(a.cells)),q.id);
   for(const other of [x=>turns(x)[1],x=>turns(x)[2],x=>turns(x)[3],flip,vflip])if(same(other(a.cells),b.cells))assert(same(other(c.cells),change(c.cells)),`${q.id}: another change fits the example`);pick(m=>same(m.cells,change(c.cells)));}
  else if(meta.kind==='swap'){assert(b.outerFill===a.innerFill&&b.innerFill===a.outerFill&&b.outer===a.outer&&b.inner===a.inner,q.id);pick(m=>m.outer===c.outer&&m.inner===c.inner&&m.outerFill===c.innerFill&&m.innerFill===c.outerFill);}
  else{assert(b.sides===a.sides-1&&a.fill==='white'&&b.fill==='striped'&&c.fill==='white',q.id);pick(m=>m.sides===c.sides-1&&m.fill==='striped');}
  break;}
 case 'folding':{const folded=role('folded');assert.deepEqual(drawnHoles(figs.find(f=>f.role==='folded').body),sorted(folded.holes),q.id);
  let holes=folded.holes.map(h=>[...h]);if(['left','right','left-up'].includes(folded.fold))holes=[...holes,...holes.map(([r,c])=>[r,3-c])];if(['up','left-up'].includes(folded.fold))holes=[...holes,...holes.map(([r,c])=>[3-r,c])];
  const want=JSON.stringify(sorted([...new Set(holes.map(h=>h.join()))].map(h=>h.split(',').map(Number))));
  for(const o of opts)assert.deepEqual(drawnHoles(o.body),sorted(o.model.holes),q.id);pick(m=>JSON.stringify(sorted(m.holes))===want);break;}
 default:throw Error(`Unknown diagram ${type}`);
 }
 diagrams++;
}
assert.equal(diagrams,50);
// A correct picture appears in one puzzle only, so no puzzle's frames or options give away another's answer.
for(const [id,body] of answerPictures)assert.deepEqual([...pictures[body]],[id],`${id}: its answer picture also appears in ${[...pictures[body]].join(', ')}`);
// Turning and mirroring puzzles each use a different base shape, so no puzzle shows another's answer.
assert.equal(new Set(bases).size,bases.length,'A base shape is reused');assert.equal(bases.length,18);
// No cube net, right or wrong, appears in two questions.
const nets=added.filter(q=>q.subject==='Non-verbal reasoning').flatMap(q=>{const svg=fs.readFileSync(`public/question-diagrams/photo-${q.diagram.items[0]}.svg`,'utf8');return svg.includes('data-type="cube-net"')?[...svg.matchAll(/data-role="option" data-label="\w" transform="[^"]*" data-model='([^']*)'/g)].map(m=>base(JSON.parse(m[1]).cells)):[];});
assert.equal(nets.length,24);assert.equal(new Set(nets).size,24,'A net is reused');
console.log(`PASS: 200 new entrance-exam questions (50 per subject), none repeating the bank; ${computed} answers recomputed independently; 50 diagram answers re-derived from their drawn models, with no shape or net reused; 11 of 35 hexominoes fold into cubes.`);
