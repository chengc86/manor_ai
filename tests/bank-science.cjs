// Science bank checks (lib/bank-science*.ts). Answers are re-derived here without trusting the question text:
// branching keys are walked with each organism's stated features, circuits are read back from the drawn wires and symbols
// and simulated, tables and graphs are recomputed from their numbers, pictures are measured (pointer, pivot, gears, poles,
// water levels, rays, shadows, Sun and Moon), and category questions are checked against this file's own facts.
// node tests/bank-science.cjs
const path=require('path');
const dir=require('./build-lib.cjs')('bank-science',[],{only:['Science']});
const {bankQuestions,bankTopics,bankProblems}=require(path.join(dir,'bank.cjs'));
const {scienceAudit}=require(path.join(dir,'bank-science.cjs'));
const fails=[],fail=(id,msg)=>fails.push(`${id}: ${msg}`),checked={};
const tick=type=>{checked[type]=(checked[type]??0)+1;};

// ── Facts, written independently of the bank ────────────────────────────────────────────────────────────────
const SETS={
 invertebrate:['garden snail','snail','earthworm','woodlouse','spider','ladybird','ant','butterfly','slug','crab','leech','jellyfish'],
 vertebrate:['slow-worm','frog','robin','hedgehog','bat','whale','penguin','newt','lizard','tortoise','salmon','seal','stickleback','heron','fox','rabbit'],
 amphibian:['frog','newt','toad'],reptile:['lizard','tortoise','slow-worm','snake','crocodile'],fish:['salmon','stickleback','goldfish'],
 fungus:['mushroom','yeast','mould'],plant:['moss','fern','grass','ivy','oak tree','pondweed'],'micro-organism':['yeast','bacteria'],visible:['mushroom','woodlouse','moss','ant'],
 metamorphosis:['frog','butterfly'],'no metamorphosis':['chicken','rabbit','snake','goldfish','tortoise'],
 inherited:['natural eye colour','eye colour','blood group','natural hair colour'],environmental:['scar on the knee','being able to ride a bike','short haircut','suntan','scar from a fall','being able to speak french'],
 'light source':['sun','lit candle'],reflector:['moon','mirror','shiny coin'],
 opaque:['cardboard'],translucent:['tracing paper','tissue paper'],transparent:['clear glass','clear plastic'],
 magnetic:['iron nail'],'non-magnetic':['aluminium can','plastic spoon','gold ring','wooden pencil'],
 conductor:['steel paper clip','copper','aluminium','iron'],insulator:['plastic ruler','rubber band','wooden lolly stick','glass marble','plastic','rubber'],
 reversible:['melting chocolate','dissolving salt in water','freezing water','melting butter','dissolving sugar in tea'],irreversible:['baking a cake','burning a match','frying an egg','burning wood'],
 soluble:['sugar','salt'],insoluble:['sand','chalk','pepper','flour'],gas:['oxygen'],solid:['sand','ice'],liquid:['milk','honey']};
const GROUP={bat:'mammal',whale:'mammal',seal:'mammal',robin:'bird',penguin:'bird',frog:'amphibian',newt:'amphibian',lizard:'reptile',salmon:'fish',ladybird:'insect'};
const FEATURES={robin:{wings:1,backbone:1},hedgehog:{wings:0,backbone:1},earthworm:{wings:0,backbone:0},butterfly:{wings:1,backbone:0},bat:{wings:1,backbone:1},penguin:{wings:1,backbone:1},spider:{wings:0,backbone:0},slug:{wings:0,backbone:0}};
const PROPS={spider:{legs:1,wings:0,shell:0,backbone:0},woodlouse:{legs:1,wings:0,backbone:0},crab:{legs:1,wings:0,shell:1,backbone:0},ant:{legs:1,wings:0,backbone:0},slug:{legs:0,wings:0,shell:0,backbone:0},earthworm:{legs:0,wings:0,shell:0,backbone:0},snail:{legs:0,wings:0,shell:1,backbone:0},leech:{legs:0,wings:0,shell:0,backbone:0}};
// Water's changes of state at sea level, for reading a heating graph.
const WATER={100:'boiling',0:'melting'};
const ORDER={butterfly:['egg','caterpillar','pupa','adult butterfly'],frog:['frogspawn','tadpole','froglet','adult frog'],plant:['germination','pollination','fertilisation','seed dispersal'],
 digestion:['mouth','oesophagus','stomach','small intestine','large intestine'],fossil:['dies','buried in sediment','hard parts slowly turn to stone','rock above wears away'],
 planets:['mercury','venus','earth','mars','jupiter','saturn','uranus','neptune'],periscope:['object','top mirror','bottom mirror','eye']};
const bare=s=>String(s).toLowerCase().replace(/[.!?]$/,'').replace(/^(a|an|the)\s+/,'').trim();
const numberIn=s=>{const m=String(s).replace(/,/g,'').replace(/−/g,'-').match(/-?\d+(\.\d+)?/);return m?Number(m[0]):NaN;};
const letterOf=s=>{const m=String(s).match(/\b([A-Z])$/);return m?m[1]:null;};

// ── Reading pictures back ───────────────────────────────────────────────────────────────────────────────────
const mul=(A,B)=>[A[0]*B[0]+A[2]*B[1],A[1]*B[0]+A[3]*B[1],A[0]*B[2]+A[2]*B[3],A[1]*B[2]+A[3]*B[3],A[0]*B[4]+A[2]*B[5]+A[4],A[1]*B[4]+A[3]*B[5]+A[5]];
const gMatrix=g=>{const r=(g.rotate||0)*Math.PI/180,s=g.scale??1;return mul(mul([1,0,0,1,g.x??0,g.y??0],[Math.cos(r),Math.sin(r),-Math.sin(r),Math.cos(r),0,0]),[s*(g.flip==='x'?-1:1),0,0,s*(g.flip==='y'?-1:1),0,0]);};
const at=(M,x,y)=>[M[0]*x+M[2]*y+M[4],M[1]*x+M[3]*y+M[5]];
/** Every mark with its position on the page: lines, circles, ellipses, rects, polys, paths and texts. */
function read(v){
 const out={lines:[],circles:[],ellipses:[],rects:[],polys:[],paths:[],texts:[]};
 const walk=(marks,M)=>{for(const m of marks){const s=Math.hypot(M[0],M[1]);switch(m.t){
  case 'g':walk(m.marks,mul(M,gMatrix(m)));break;
  case 'line':out.lines.push({a:at(M,m.x1,m.y1),b:at(M,m.x2,m.y2),w:m.w??2,arrow:!!m.arrow,c:m.c,dash:!!m.dash});break;
  case 'circle':out.circles.push({c:at(M,m.x,m.y),r:m.r*s,r0:m.r,fill:m.fill??'white'});break;
  case 'ellipse':out.ellipses.push({c:at(M,m.x,m.y),rx:m.rx*s,ry:m.ry*s,fill:m.fill??'white'});break;
  case 'rect':{const p=at(M,m.x,m.y),q=at(M,m.x+m.w,m.y+m.h);out.rects.push({x:Math.min(p[0],q[0]),y:Math.min(p[1],q[1]),w:Math.abs(q[0]-p[0]),h:Math.abs(q[1]-p[1]),fill:m.fill??'white',sw:m.sw});break;}
  case 'poly':{const pts=[];for(let i=0;i<m.pts.length;i+=2)pts.push(at(M,m.pts[i],m.pts[i+1]));out.polys.push({pts,fill:m.fill??'white',open:!!m.open,c:m.c});break;}
  case 'path':{const n=(m.d.match(/-?\d+(\.\d+)?/g)||[]).map(Number);out.paths.push({d:m.d,first:at(M,n[0],n[1]),last:at(M,n[n.length-2],n[n.length-1]),fill:m.fill??'white',c:m.c});break;}
  case 'text':out.texts.push({p:at(M,m.x,m.y),s:m.s});break;}}};
 walk(v.kind==='figure'?v.marks:[],[1,0,0,1,0,0]);return out;
}
const dist=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1]);
const nearestText=(r,p,test=()=>true)=>r.texts.filter(t=>test(t.s)).sort((a,b)=>dist(a.p,p)-dist(b.p,p))[0];
const single=s=>/^[A-Z]$/.test(s);

// ── Circuits: wires to nodes, symbols to parts, then modified nodal analysis ───────────────────────────────
function onSegment(p,l,tol=.5){const [x1,y1]=l.a,[x2,y2]=l.b,dx=x2-x1,dy=y2-y1,len2=dx*dx+dy*dy;if(!len2)return dist(p,l.a)<tol;const t=((p[0]-x1)*dx+(p[1]-y1)*dy)/len2;if(t<-1e-6||t>1+1e-6)return false;return Math.hypot(x1+t*dx-p[0],y1+t*dy-p[1])<tol;}
/** Builds and solves the electrical network drawn in a circuit figure. Wires are 2 units wide, short cell plates 4.
 *  opts: close/open (switch labels), flip (turn every cell round), flipFirst (turn one cell round), heavier (double every load). */
function network(v,opts={}){
 const r=read(v),key=p=>`${Math.round(p[0]*10)},${Math.round(p[1]*10)}`,parent=new Map();
 const find=k=>{while(parent.get(k)!==k){parent.set(k,parent.get(parent.get(k)));k=parent.get(k);}return k;};
 const add=p=>{const k=key(p);if(!parent.has(k))parent.set(k,k);return k;},join=(p,q)=>{const a=find(add(p)),b=find(add(q));if(a!==b)parent.set(a,b);};
 // Switches: two small dots 20 apart, named by the nearest label.
 const dots=r.circles.filter(c=>Math.abs(c.r0-2.5)<.01),switches=[];
 dots.forEach((d,i)=>dots.slice(i+1).forEach(e=>{if(Math.abs(dist(d.c,e.c)-20)<.5){const mid=[(d.c[0]+e.c[0])/2,(d.c[1]+e.c[1])/2],t=nearestText(r,mid,s=>/^S\d?$/.test(s));switches.push({a:d.c,b:e.c,mid,name:t&&dist(t.p,mid)<45?t.s:null});}}));
 const opened=new Set(opts.open??[]),closed=new Set(opts.close??[]);
 const isLever=l=>switches.some(s=>opened.has(s.name)&&((dist(l.a,s.a)<.5&&dist(l.b,s.b)<.5)||(dist(l.a,s.b)<.5&&dist(l.b,s.a)<.5)));
 const conductors=r.lines.filter(l=>!l.arrow&&(Math.abs(l.w-2)<.01||Math.abs(l.w-4)<.01)&&!isLever(l));
 for(const l of conductors)join(l.a,l.b);
 for(const l of conductors)for(const p of [l.a,l.b])for(const m of conductors)if(m!==l&&onSegment(p,m))join(p,m.a);
 for(const s of switches)if(closed.has(s.name))join(s.a,s.b);
 const ends=conductors.flatMap(l=>[l.a,l.b]),touching=(p,tol=.6)=>ends.filter(e=>dist(e,p)<tol);
 const loads=[],sources=[],problems=[];
 for(const c of r.circles.filter(c=>Math.abs(c.r0-10)<.01)){
  const hits=[...new Map(ends.filter(e=>Math.abs(dist(e,c.c)-c.r)<.6).map(e=>[key(e),e])).values()];
  if(hits.length!==2){problems.push(`a round symbol touches ${hits.length} wires`);continue;}
  const motor=r.texts.some(t=>t.s==='M'&&dist(t.p,c.c)<9),t=nearestText(r,c.c,s=>/^[A-Z]$/.test(s)&&s!=='M');
  loads.push({kind:motor?'motor':'bulb',a:hits[0],b:hits[1],c:c.c,name:t&&dist(t.p,c.c)<45?t.s:null});}
 for(const p of r.paths.filter(p=>/A8 8/.test(p.d))){const a=touching(p.first),b=touching(p.last);if(!a.length||!b.length){problems.push('a buzzer is not joined to wires');continue;}const t=nearestText(r,p.first,single);loads.push({kind:'buzzer',a:a[0],b:b[0],c:p.first,name:t&&dist(t.p,p.first)<45?t.s:null});}
 // Cells: a short thick plate beside a long thin one. The long plate is positive.
 const len=l=>dist(l.a,l.b),mid=l=>[(l.a[0]+l.b[0])/2,(l.a[1]+l.b[1])/2],parallel=(l,m)=>{const u=[l.b[0]-l.a[0],l.b[1]-l.a[1]],w=[m.b[0]-m.a[0],m.b[1]-m.a[1]];return Math.abs(u[0]*w[1]-u[1]*w[0])<1e-6*len(l)*len(m)+1e-9;};
 const shorts=conductors.filter(l=>Math.abs(l.w-4)<.01),longs=conductors.filter(l=>Math.abs(l.w-2)<.01&&Math.abs(len(l)-28)<.5);
 const paired=new Map();for(const s of shorts){const best=longs.filter(l=>parallel(l,s)&&dist(mid(l),mid(s))<8.6).sort((a,b)=>dist(mid(a),mid(s))-dist(mid(b),mid(s)))[0];if(!best){problems.push('a cell plate has no partner');continue;}paired.set(s,best);sources.push({plus:best.a,minus:s.a,emf:(opts.flip?-1:1)*(opts.flipFirst&&!sources.length?-1:1)});}
 for(const s of shorts)for(const l of longs)if(paired.get(s)!==l&&parallel(l,s)&&dist(mid(l),mid(s))<8.6)join(s.a,l.a);
 // Solve: nodes are wire groups; loads are 1 Ω (2 Ω when heavier); cells are 1 V sources.
 const nodes=[...new Set([...loads.flatMap(l=>[l.a,l.b]),...sources.flatMap(s=>[s.plus,s.minus])].map(p=>find(add(p))))],idx=new Map(nodes.map((n,i)=>[n,i]));
 for(const s of sources)if(find(add(s.plus))===find(add(s.minus)))problems.push('a cell is short-circuited');
 const N=nodes.length,K=sources.length,size=N-1+K,A=Array.from({length:size},()=>new Array(size+1).fill(0)),row=n=>idx.get(find(add(n)))-1;
 const g=opts.heavier?.5:1;
 for(let i=1;i<N;i++)A[i-1][i-1]+=1e-9;
 for(const l of loads){const i=row(l.a),j=row(l.b);if(i>=0)A[i][i]+=g;if(j>=0)A[j][j]+=g;if(i>=0&&j>=0){A[i][j]-=g;A[j][i]-=g;}}
 sources.forEach((s,k)=>{const p=row(s.plus),m=row(s.minus),c=N-1+k;if(p>=0){A[p][c]+=1;A[c][p]+=1;}if(m>=0){A[m][c]-=1;A[c][m]-=1;}A[c][size]=s.emf;});
 for(let c=0;c<size;c++){let piv=c;for(let i=c+1;i<size;i++)if(Math.abs(A[i][c])>Math.abs(A[piv][c]))piv=i;if(Math.abs(A[piv][c])<1e-15){problems.push('the circuit equations cannot be solved');break;}[A[c],A[piv]]=[A[piv],A[c]];for(let i=0;i<size;i++)if(i!==c){const f=A[i][c]/A[c][c];if(f)for(let j=c;j<=size;j++)A[i][j]-=f*A[c][j];}}
 const V=n=>{const i=row(n);return i<0?0:A[i][size]/A[i][i];};
 for(const l of loads){const dv=V(l.a)-V(l.b);l.power=dv*dv*g;l.on=l.power>1e-6;}
 const state=s=>find(add(s.a))===find(add(s.b))?'closed':'open';
 return {loads,sources,switches:switches.map(s=>({...s,state:state(s)})),problems,cells:sources.length};
}
function claim(net,c){
 const [who,op,other]=c,load=n=>net.loads.find(l=>l.name===n);
 if(who==='*')return net.loads.length>0&&net.loads.every(l=>op==='on'?l.on:!l.on);
 if(who==='cells')return op==='='?net.cells===other:op==='opposed'?net.oppositeCells:false;
 if(who.startsWith('switch ')){const s=net.switches.find(x=>x.name===who.slice(7));return !!s&&s.state===op;}
 const a=load(who);if(!a)throw new Error(`no part labelled ${who}`);
 if(op==='on')return a.on;if(op==='off')return !a.on;
 const b=load(other);if(!b)throw new Error(`no part labelled ${other}`);const d=a.power-b.power,tol=1e-6*Math.max(a.power,b.power,1e-9);
 return op==='>'?d>tol:op==='<'?d<-tol:Math.abs(d)<=tol;
}
/** Simulates a drawn circuit. Cells face opposite ways when no current flows through a complete loop,
 *  but turning one cell round makes it flow. */
function simulate(v){
 const net=network(v);
 net.oppositeCells=net.cells>=2&&net.loads.every(l=>!l.on)&&network(v,{flipFirst:true}).loads.some(l=>l.on);
 return net;
}

// ── Symbols ─────────────────────────────────────────────────────────────────────────────────────────────────
function symbolsIn(v){
 const r=read(v),n={cell:0,bulb:0,motor:0,buzzer:0,switch:0};
 n.cell=r.lines.filter(l=>Math.abs(l.w-4)<.01).length;
 for(const c of r.circles.filter(c=>Math.abs(c.r0-10)<.01)){if(r.texts.some(t=>t.s==='M'&&dist(t.p,c.c)<c.r))n.motor++;else if(r.lines.filter(l=>l.w<1.9&&dist(l.a,c.c)<c.r&&dist(l.b,c.c)<c.r).length===2)n.bulb++;}
 n.buzzer=r.paths.filter(p=>/A8 8/.test(p.d)).length;
 const dots=r.circles.filter(c=>Math.abs(c.r0-2.5)<.01);n.switch=Math.floor(dots.length/2);
 return n;
}
const kindsIn=v=>Object.entries(symbolsIn(v)).filter(([,k])=>k).map(([s])=>s);
/** Every piece of text shown in a picture: figure labels, table cells, chart labels, key questions and names. */
function wordsIn(v){
 switch(v.kind){
  case 'figure':return read(v).texts.map(t=>t.s);
  case 'table':return [...(v.head??[]),...v.rows.flat(),v.caption??''];
  case 'chart':return [...v.labels,v.title??'',v.x??'',v.y??''];
  case 'key':return [...leaves(v.root),...nodesOf(v.root).map(n=>n.q)];
  default:return [];
 }
}

// ── The checks ──────────────────────────────────────────────────────────────────────────────────────────────
const byId=new Map(bankQuestions.map(q=>[q.id,q])),audits=new Map(scienceAudit.map(a=>[a.id,a]));
const science=bankQuestions.filter(q=>q.subject==='Science'),wrongs=q=>q.options.filter(o=>!q.answers.includes(o));
const leaves=n=>typeof n==='string'?[n]:[...leaves(n.yes),...leaves(n.no)],nodesOf=n=>typeof n==='string'?[]:[n,...nodesOf(n.yes),...nodesOf(n.no)];
/** Follows a branching key from the top, answering each question from the stated features, and returns the name reached. */
function walkKey(root,facts,id){let n=root;while(typeof n!=='string'){if(!(n.q in facts)){fail(id,`the stated features do not answer "${n.q}"`);return null;}n=facts[n.q]?n.yes:n.no;}return n;}
function pathTo(root,leaf){const go=(n,acc)=>typeof n==='string'?(n===leaf?acc:null):go(n.yes,[...acc,[n.q,true]])??go(n.no,[...acc,[n.q,false]]);return go(root,[]);}
const pictureFor=(q,list)=>q.optionVisuals.map(v=>list.find(p=>JSON.stringify(p.visual)===JSON.stringify(v)));
function expectLetters(q,good,what){const want=q.options.filter((_,i)=>good[i]);if(want.length!==q.answers.length||want.some(o=>!q.answers.includes(o)))fail(q.id,`${what}: expected ${want.join(', ')||'none'}, bank says ${q.answers.join(', ')}`);}
function tableNumbers(v,col){return v.rows.map(r=>numberIn(r[col]));}

const CHECK={
 mc(){},
 key(q,a){const leaf=walkKey(q.visual.root,a.facts,q.id);if(leaf&&leaf!==q.answers[0])fail(q.id,`key leads to ${leaf}, not ${q.answers[0]}`);const ls=leaves(q.visual.root);for(const o of q.options)if(!ls.includes(o))fail(q.id,`option ${o} is not in the key`);},
 'key-split'(q,a){const p=pathTo(q.visual.root,a.a),r=pathTo(q.visual.root,a.b);if(!p||!r)return fail(q.id,'split leaves missing');let i=0;while(p[i][0]===r[i][0]&&p[i][1]===r[i][1])i++;if(p[i][0]!==q.answers[0])fail(q.id,`the separating question is "${p[i][0]}"`);if(!q.options.every(o=>nodesOf(q.visual.root).some(n=>n.q===o)))fail(q.id,'options should be questions from the key');},
 'key-claims'(q,a){const p=new Map(pathTo(q.visual.root,a.leaf));for(const o of q.options){const c=a.claims[o];if(!c){fail(q.id,`no claims for ${o}`);continue;}const ok=Object.entries(c).every(([k,v])=>p.has(k)&&p.get(k)===v),contradicts=Object.entries(c).some(([k,v])=>p.has(k)&&p.get(k)!==v);if(q.answers.includes(o)!==ok)fail(q.id,`"${o}" is ${ok?'true':'not proved true'} for ${a.leaf}`);if(!q.answers.includes(o)&&!contradicts)fail(q.id,`"${o}" is not contradicted by the key`);}},
 'key-pictures'(q,a){const pics=pictureFor(q,a.pictures);if(pics.some(p=>!p))return fail(q.id,'option pictures not found in audit');const found=pics.map(p=>walkKey(q.visual.root,p.facts,q.id));if(new Set(found).size!==found.length)fail(q.id,'two pictures reach the same name');expectLetters(q,found.map(f=>f===a.target),`pictures that key to ${a.target}`);},
 category(q,a){const yes=SETS[a.yes],no=a.no.flatMap(s=>SETS[s]);if(!yes||no.some(x=>x===undefined))return fail(q.id,'unknown fact set');if(yes.some(x=>no.includes(x)))fail(q.id,'fact sets overlap');for(const o of q.answers)if(!yes.includes(bare(o)))fail(q.id,`${o} is not known to be ${a.yes}`);for(const o of wrongs(q))if(!no.includes(bare(o)))fail(q.id,`${o} is not known to be ${a.no.join(' or ')}`);},
 group(q,a){if(GROUP[a.animal]!==a.options[q.answers[0]])fail(q.id,`a ${a.animal} is a ${GROUP[a.animal]}`);for(const o of wrongs(q))if(a.options[o]===GROUP[a.animal])fail(q.id,`${o} is also right`);},
 carroll(q){const v=q.visual,hasWings=s=>/^has wings/i.test(s),hasBone=s=>/^has a backbone/i.test(s);v.rows.forEach(r=>r.slice(1).forEach((cell,j)=>{const want={wings:hasWings(r[0])?1:0,backbone:hasBone(v.head[j+1])?1:0};if(cell==='?'){const fits=q.options.map(o=>{const f=FEATURES[bare(o)];if(!f)fail(q.id,`no features for ${o}`);return !!f&&f.wings===want.wings&&f.backbone===want.backbone;});expectLetters2(q,fits);}else{const f=FEATURES[bare(cell)];if(!f||f.wings!==want.wings||f.backbone!==want.backbone)fail(q.id,`${cell} is in the wrong box`);}}));},
 'sort-question'(q,a){for(const o of q.options){const prop=a.questions[o],vals=a.groups.map(g=>g.map(x=>PROPS[x]?.[prop]));const sep=vals.every(g=>g.every(x=>x!==undefined))&&new Set(vals[0]).size===1&&new Set(vals[1]).size===1&&vals[0][0]!==vals[1][0];
  const notSep=vals.some(g=>{const d=g.filter(x=>x!==undefined);return new Set(d).size>1;})||vals[0].some(x=>x!==undefined&&vals[1].includes(x));if(q.answers.includes(o)?!sep:!notSep)fail(q.id,`"${o}" ${sep?'does':'does not clearly'} separate the groups`);}},
 order(q,a){const seq=ORDER[a.kb],parse=o=>o.split(/\s*→\s*|,\s*/).map(s=>s.toLowerCase().replace(/\.$/,''));for(const o of q.options){const p=parse(o),ok=p.every((s,i)=>s===seq[i]);if(q.answers.includes(o)!==ok)fail(q.id,`"${o}" is ${ok?'':'not '}in the right order`);}},
 cycle(q,a){const r=read(q.visual),stages=r.texts.map(t=>t.s),seq=ORDER[a.kb],i=stages.indexOf('?');if(stages.length!==seq.length||i<0)return fail(q.id,'cycle picture does not match');stages.forEach((s,k)=>{if(k!==i&&s.toLowerCase()!==seq[k])fail(q.id,`stage ${s} out of order`);});if(bare(q.answers[0])!==seq[i])fail(q.id,`missing stage is ${seq[i]}`);for(const o of wrongs(q))if(seq.includes(bare(o)))fail(q.id,`${o} is a frog stage`);},
 labels(q,a){const r=read(q.visual),letters=new Set(r.texts.map(t=>t.s).filter(single));for(const k of Object.keys(a.labels))if(!letters.has(k))fail(q.id,`label ${k} is not drawn`);const want=single(a.ask)?a.labels[a.ask]:Object.keys(a.labels).find(k=>a.labels[k]===a.ask);const got=single(a.ask)?bare(q.answers[0]):letterOf(q.answers[0]);if(got!==want)fail(q.id,`expected ${want}, bank says ${q.answers[0]}`);},
 chain(q,a){const r=read(q.visual),items=r.texts.slice().sort((x,y)=>x.p[0]-y.p[0]).map(t=>t.s),arrowsRight=r.lines.filter(l=>l.arrow).every(l=>l.b[0]>l.a[0]);if(!arrowsRight)fail(q.id,'food chain arrows must point to the eater');
  const want=a.ask==='producer'?[items[0]]:items.filter((_,i)=>i>=2&&i<=items.length-2);if(a.ask==='producer'&&!SETS.plant.includes(items[0].toLowerCase()))fail(q.id,`${items[0]} is not a plant`);if(want.length!==1||want[0]!==q.answers[0])fail(q.id,`expected ${want.join(', ')}`);},
 circulation(q,a){const r=read(q.visual),boxes=['Lungs','Heart','Body'].map(s=>({s:s.toLowerCase(),p:r.texts.find(t=>t.s===s).p})),near=p=>boxes.slice().sort((x,y)=>dist(x.p,p)-dist(y.p,p))[0].s;
  const rich=q.options.map(o=>{const L=letterOf(o),t=r.texts.find(x=>x.s===L),arrow=r.lines.filter(l=>l.arrow).sort((x,y)=>dist([(x.a[0]+x.b[0])/2,(x.a[1]+x.b[1])/2],t.p)-dist([(y.a[0]+y.b[0])/2,(y.a[1]+y.b[1])/2],t.p))[0],from=near(arrow.a),to=near(arrow.b);if(JSON.stringify([from,to])!==JSON.stringify(a.arrows[L]))fail(q.id,`arrow ${L} runs ${from}→${to}`);return from==='lungs'||(from==='heart'&&to==='body');});expectLetters2(q,rich);},
 layers(q){const r=read(q.visual),bottom=r.texts.filter(t=>single(t.s)).sort((x,y)=>y.p[1]-x.p[1])[0].s;if(letterOf(q.answers[0])!==bottom)fail(q.id,`the lowest layer is ${bottom}`);},
 states(q,a){const r=read(q.visual),boxes=['Solid','Liquid','Gas'].map(s=>({s:s.toLowerCase(),p:r.texts.find(t=>t.s===s).p})),near=p=>boxes.slice().sort((x,y)=>dist(x.p,p)-dist(y.p,p))[0].s;
  const good=q.options.map(o=>{const t=r.texts.find(x=>x.s===letterOf(o)),arrow=r.lines.filter(l=>l.arrow).sort((x,y)=>dist([(x.a[0]+x.b[0])/2,(x.a[1]+x.b[1])/2],t.p)-dist([(y.a[0]+y.b[0])/2,(y.a[1]+y.b[1])/2],t.p))[0];return near(arrow.a)===a.from&&near(arrow.b)===a.to&&dist(arrow.a,boxes.find(b=>b.s===a.from).p)<dist(arrow.a,boxes.find(b=>b.s===a.to).p);});expectLetters2(q,good);},
 circuit(q,a){const net=simulate(q.visual);if(net.problems.length)return fail(q.id,net.problems.join('; '));for(const o of q.options){if((a.reasons??[]).includes(o)){if(q.answers.includes(o))fail(q.id,'an unchecked reason cannot be the answer');continue;}const cs=a.claims[o];if(!cs){fail(q.id,`no claims for "${o}"`);continue;}let ok;try{ok=cs.every(c=>claim(net,c));}catch(e){fail(q.id,e.message);continue;}if(q.answers.includes(o)!==ok)fail(q.id,`"${o}" is ${ok?'true':'false'} for the drawn circuit`);}},
 'circuit-pictures'(q,a){const pics=pictureFor(q,a.pictures);if(pics.some(p=>!p))return fail(q.id,'option pictures not found in audit');const nets=pics.map(p=>network(p.visual));nets.forEach(n=>n.problems.length&&fail(q.id,n.problems.join('; ')));
  if(a.ask==='brightest'){const each=nets.map(n=>Math.min(...n.loads.filter(l=>l.kind==='bulb').map(l=>l.power))),best=Math.max(...each);expectLetters(q,each.map(e=>Math.abs(e-best)<1e-9),'brightest bulbs');}
  else expectLetters(q,nets.map(n=>n.loads.some(l=>l.kind==='buzzer'&&l.on)),'buzzer sounds');},
 'circuit-actions'(q,a){const now=network(q.visual);if(now.problems.length)return fail(q.id,now.problems.join('; '));const lit=o=>{const act=a.actions[o]??{};const n=network(q.visual,{close:act.close?[act.close]:[],open:act.open?[act.open]:[],flip:!!act.flipCell,heavier:!!act.addBulb});return n.loads.some(l=>l.on);};
  if(now.loads.some(l=>l.on))fail(q.id,'the bulb is already lit');for(const o of q.options)if(q.answers.includes(o)!==lit(o))fail(q.id,`"${o}" ${lit(o)?'lights':'does not light'} the bulb`);},
 'series-change'(q,a){const p=s=>(s.cells/s.loads)**2,louder=p(a.after)>p(a.before);if((q.answers[0]==='It sounds louder.')!==louder)fail(q.id,'buzzer volume');},
 components(q){const n=symbolsIn(q.visual),parse=o=>{const c={cell:0,bulb:0,motor:0,buzzer:0,switch:0,battery:0};for(const w of o.toLowerCase().match(/cell|bulb|motor|buzzer|switch|battery/g)??[])c[w]++;return c;};for(const o of q.options){const c=parse(o),ok=!c.battery&&['cell','bulb','motor','buzzer','switch'].every(k=>c[k]===n[k]);if(q.answers.includes(o)!==ok)fail(q.id,`"${o}" ${ok?'matches':'does not match'} the drawing`);}},
 symbol(q,a){const k=kindsIn(q.visual);if(k.length!==1||k[0]!==a.kind||bare(q.answers[0])!==a.kind)fail(q.id,`the drawn symbol is ${k.join(', ')}`);},
 'symbol-pictures'(q,a){expectLetters(q,q.optionVisuals.map(v=>{const k=kindsIn(v);return k.length===1&&k[0]===a.target;}),`${a.target} symbol`);},
 trend(q,a){const v=q.visual;let ys;if(v.kind==='chart')ys=v.values;else{const cols=v.head.map((_,i)=>i).filter(i=>v.rows.every(r=>!isNaN(numberIn(r[i]))));const xs=tableNumbers(v,cols[0]);if(xs.some((x,i)=>i&&x<=xs[i-1]))return fail(q.id,'table rows are not in order');ys=tableNumbers(v,cols[cols.length-1]);}
  const up=ys.every((y,i)=>!i||y>ys[i-1]),down=ys.every((y,i)=>!i||y<ys[i-1]);if(a.dir==='up'?!up:!down)fail(q.id,`results do not go ${a.dir}`);},
 'table-min'(q,a){extreme(q,a,-1);},'table-max'(q,a){extreme(q,a,1);},
 'table-maxdiff'(q,a){const d=q.visual.rows.map(r=>numberIn(r[a.cols[1]])-numberIn(r[a.cols[0]])),best=Math.max(...d),rows=q.visual.rows.filter((_,i)=>d[i]===best);if(rows.length!==1||rows[0][0]!==q.answers[0])fail(q.id,'largest increase');},
 'chart-min'(q,a){const v=q.visual,min=Math.min(...v.values),labels=v.labels.filter((_,i)=>v.values[i]===min);if(labels.length!==1||a.names[q.answers[0]]!==labels[0])fail(q.id,`the smallest bar is ${labels}`);for(const o of wrongs(q))if(!v.labels.includes(a.names[o]))fail(q.id,`${o} is not on the chart`);},
 'chart-diff'(q,a){const v=q.visual,val=s=>v.values[v.labels.indexOf(s)];if(numberIn(q.answers[0])!==val(a.a)-val(a.b))fail(q.id,'difference');},
 // A flat part of a heating graph is a change of state; for water, 100 °C is boiling.
 plateau(q,a){const vs=q.visual.values;let p=null;for(let i=2;i<vs.length;i++)if(vs[i]===vs[i-1]&&vs[i]===vs[i-2])p=vs[i];if(p===null)return fail(q.id,'the graph has no flat part');
  if(a.state){const want=WATER[p];if(want!==a.state||!q.answers[0].toLowerCase().includes(want))fail(q.id,`water at ${p} °C is ${want}`);for(const o of wrongs(q))if(o.toLowerCase().includes(want))fail(q.id,`${o} also fits`);}
  else if(numberIn(q.answers[0])!==p)fail(q.id,`the flat part is at ${p}`);},
 // A table with a steady pattern: every step in the first column changes the second by the same amount.
 'extrapolate-linear'(q,a){const xs=tableNumbers(q.visual,0),ys=tableNumbers(q.visual,1),dx=xs[1]-xs[0],dy=ys[1]-ys[0];if(xs.some((x,i)=>i&&x-xs[i-1]!==dx)||ys.some((y,i)=>i&&y-ys[i-1]!==dy))return fail(q.id,'the table does not change steadily');
  const want=ys[0]+(a.at-xs[0])/dx*dy;if(numberIn(q.answers[0])!==want)fail(q.id,`the pattern gives ${want}`);for(const o of wrongs(q))if(numberIn(o)===want)fail(q.id,`${o} also fits`);},
 // The planet furthest from the Sun takes longest to orbit it.
 'planet-furthest'(q){const at=o=>ORDER.planets.indexOf(o.toLowerCase());if(q.options.some(o=>at(o)<0))return fail(q.id,'every option must be a planet');const far=q.options.slice().sort((x,y)=>at(y)-at(x))[0];if(q.answers[0]!==far)fail(q.id,`the furthest planet is ${far}`);},
 'anomaly-table'(q){const v=q.visual,cells=[];v.rows.forEach(r=>{const vals=r.slice(1).map(numberIn),m=vals.slice().sort((x,y)=>x-y)[1];vals.forEach((x,j)=>cells.push({dev:Math.abs(x-m),text:`Test ${j+1} at ${r[0]} cm (${x} cm)`}));});cells.sort((x,y)=>y.dev-x.dev);if(cells[0].dev<5*cells[1].dev)fail(q.id,'no clear anomaly');if(q.answers[0]!==cells[0].text)fail(q.id,`the anomaly is ${cells[0].text}`);for(const o of wrongs(q))if(!cells.some(c=>c.text===o))fail(q.id,`${o} is not in the table`);},
 // Take each point out in turn and fit a smooth curve to the rest: the anomaly is the point that sits far off a curve
 // which fits every other point closely.
 'anomaly-chart'(q){const vs=q.visual.values,score=vs.map((y,i)=>{const pts=vs.map((v,j)=>[j,v]).filter((_,j)=>j!==i),own=Math.abs(y-quad(pts,i)),rest=Math.max(...pts.map(([x,v])=>Math.abs(v-quad(pts,x))));return own/(rest+1);}),best=score.indexOf(Math.max(...score));
  if(score[best]<3||score.filter(s=>s>=score[best]/2).length>1)fail(q.id,'no clear anomaly');if(!q.answers[0].includes(q.visual.labels[best]))fail(q.id,`the anomaly is at ${q.visual.labels[best]}`);for(const o of wrongs(q))if(!q.visual.labels.some(l=>o.includes(l)))fail(q.id,`${o} is not on the graph`);},
 mean(q){const vals=q.visual.rows[0].map(numberIn),m=vals.reduce((s,x)=>s+x,0)/vals.length;if(Math.abs(numberIn(q.answers[0])-m)>.001)fail(q.id,`mean is ${m}`);},
 correlation(q,a){const xs=tableNumbers(q.visual,1),ys=tableNumbers(q.visual,2),mx=xs.reduce((s,x)=>s+x,0)/xs.length,my=ys.reduce((s,x)=>s+x,0)/ys.length;let sxy=0,sxx=0,syy=0;xs.forEach((x,i)=>{sxy+=(x-mx)*(ys[i]-my);sxx+=(x-mx)**2;syy+=(ys[i]-my)**2;});const r=sxy/Math.sqrt(sxx*syy);if(Math.sign(r)!==a.sign||Math.abs(r)<.8)fail(q.id,`correlation ${r.toFixed(2)}`);if(xs.every((x,i)=>x===ys[i]))fail(q.id,'arm span equals height');},
 header(q,a){const h=q.visual.head[a.col].replace(/\s*\(.*\)$/,'').toLowerCase();if(bare(q.answers[0])!==h)fail(q.id,`the measured column is "${h}"`);},
 hardness(q){const n=q.visual.rows.map(r=>r.slice(1).filter(x=>x==='no').length),best=Math.max(...n),rows=q.visual.rows.filter((_,i)=>n[i]===best);if(rows.length!==1||letterOf(q.answers[0])!==rows[0][0])fail(q.id,'hardest rock');},
 bands(q){const s=q.visual.rows.map(r=>(r[1]==='thin')+(r[2]==='tight')),best=Math.max(...s),rows=q.visual.rows.filter((_,i)=>s[i]===best);if(rows.length!==1||letterOf(q.answers[0])!==rows[0][0])fail(q.id,'highest band');},
 'mass-sum'(q,a){if(numberIn(q.answers[0])!==a.parts.reduce((s,x)=>s+x,0))fail(q.id,'mass');},
 weight(q,a){if(Math.abs(numberIn(q.answers[0])-a.kg*9.8)>1||!/N$/.test(q.answers[0]))fail(q.id,'weight');},
 meter(q){const r=read(q.visual),ptr=r.polys.find(p=>p.fill==='red'),tip=ptr.pts.slice().sort((a,b)=>b[0]-a[0])[0],nums=r.texts.filter(t=>/^\d+$/.test(t.s)).map(t=>({v:Number(t.s),y:t.p[1]-5}));const [a,b]=nums,value=a.v+(tip[1]-a.y)*(b.v-a.v)/(b.y-a.y);if(Math.abs(value-numberIn(q.answers[0]))>.05||!/ N$/.test(q.answers[0]))fail(q.id,`the pointer reads ${value.toFixed(2)} N`);},
 lever(q){const r=read(q.visual),pivot=r.polys.find(p=>p.fill==='grey'&&p.pts.length===3),apex=pivot.pts.slice().sort((a,b)=>a[1]-b[1])[0][0],pts=r.texts.filter(t=>/^[PQR]$/.test(t.s)).map(t=>({s:t.s,d:Math.abs(t.p[0]-apex)})).sort((a,b)=>b.d-a.d);if(letterOf(q.answers[0])!==pts[0].s)fail(q.id,`furthest from the pivot is ${pts[0].s}`);},
 gears(q,a){const r=read(q.visual),gs=r.polys.filter(p=>p.pts.length>=24).map(p=>{const cx=p.pts.reduce((s,x)=>s+x[0],0)/p.pts.length,cy=p.pts.reduce((s,x)=>s+x[1],0)/p.pts.length;return {teeth:p.pts.length/4,c:[cx,cy],r:Math.max(...p.pts.map(x=>dist(x,[cx,cy])))};});
  for(const g of gs){const t=nearestText(r,[g.c[0],g.c[1]+g.r],s=>/teeth$/.test(s));if(numberIn(t.s)!==g.teeth)fail(q.id,`a gear drawn with ${g.teeth} teeth is labelled ${t.s}`);}
  const arc=r.paths.find(p=>p.c==='red'),driver=gs.find(g=>dist(arc.first,g.c)<g.r),other=gs.find(g=>g!==driver),sweep=/ 0 0 1 /.test(arc.d)?'clockwise':'anticlockwise';if(sweep!==a.dir)fail(q.id,'arrow direction');
  const turns=a.turns*driver.teeth/other.teeth,dir=a.dir==='clockwise'?'anticlockwise':'clockwise',say={1:'once',2:'twice',0.5:'half a turn'}[turns];if(q.answers[0]!==`It turns ${say}, ${dir}.`)fail(q.id,`the small gear turns ${turns} times ${dir}`);},
 magnets(q){const r=read(q.visual),poles=r.texts.filter(t=>/^[NS]$/.test(t.s)).sort((a,b)=>a.p[0]-b.p[0]).map(t=>t.s),repel=poles[1]===poles[2];if(!q.answers[0].startsWith(repel?'They will repel':'They will attract'))fail(q.id,repel?'like poles repel':'unlike poles attract');for(const o of wrongs(q))if(o.startsWith(repel?'They will repel':'They will attract'))fail(q.id,`${o} also fits`);},
 arrows(q,a){const r=read(q.visual),want=a.moving==='down'?[0,-1]:[0,1];const good=q.options.map(o=>{const L=letterOf(o),arrow=r.lines.filter(l=>l.arrow).sort((x,y)=>dist(x.b,nearestText(r,x.b,s=>s===L).p)-dist(y.b,nearestText(r,y.b,s=>s===L).p))[0],d=[arrow.b[0]-arrow.a[0],arrow.b[1]-arrow.a[1]],n=Math.hypot(...d);return d[0]/n*want[0]+d[1]/n*want[1]>.99;});expectLetters2(q,good);},
 bottles(q){const r=read(q.visual),water=r.rects.filter(x=>x.fill==='blue'),labelled=water.map(w=>({h:w.h,s:nearestText(r,[w.x+w.w/2,w.y+w.h],single).s})),best=Math.max(...labelled.map(w=>w.h)),top=labelled.filter(w=>w.h===best);if(top.length!==1||letterOf(q.answers[0])!==top[0].s)fail(q.id,'the fullest bottle (shortest air column) gives the highest note');},
 bars(q){const r=read(q.visual),bars=r.rects.filter(x=>x.fill==='orange').map(b=>({h:b.h,s:nearestText(r,[b.x+b.w/2,190],single).s})),best=Math.max(...bars.map(b=>b.h)),top=bars.filter(b=>b.h===best);if(top.length!==1||letterOf(q.answers[0])!==top[0].s)fail(q.id,'the longest bar gives the lowest note');},
 daynight(q){const r=read(q.visual),earth=r.circles.find(c=>c.fill==='blue'&&c.r>50),sun=r.circles.find(c=>c.fill==='yellow'),u=[sun.c[0]-earth.c[0],sun.c[1]-earth.c[1]],n=Math.hypot(...u);const score=q.options.map(o=>{const t=r.texts.find(x=>x.s===letterOf(o)),d=[t.p[0]-earth.c[0],t.p[1]-earth.c[1]];return (d[0]*u[0]+d[1]*u[1])/(Math.hypot(...d)*n);}),best=Math.max(...score);expectLetters2(q,score.map(s=>s===best&&s>.97));},
 moon(q){const r=read(q.visual),earth=r.circles.find(c=>c.fill==='blue'),light=r.lines.find(l=>l.arrow&&l.c==='orange'),d=[light.b[0]-light.a[0],light.b[1]-light.a[1]],n=Math.hypot(...d);const score=q.options.map(o=>{const t=r.texts.find(x=>x.s===letterOf(o)),v=[t.p[0]-earth.c[0],t.p[1]-earth.c[1]];return (v[0]*d[0]+v[1]*d[1])/(Math.hypot(...v)*n);}),best=Math.max(...score);expectLetters2(q,score.map(s=>s===best&&s>.97));},
 'shadow-size'(q){const r=read(q.visual),torch=Math.max(...r.polys.find(p=>p.fill==='yellow').pts.map(p=>p[0])),head=r.circles.find(c=>c.fill==='black'),body=r.polys.find(p=>p.fill==='black'),screen=r.rects.find(x=>x.fill==='white'&&x.h>100).x,h=Math.max(...body.pts.map(p=>p[1]))-(head.c[1]-head.r),size=x=>h*(screen-torch)/(x-torch);if((size(head.c[0]-20)>size(head.c[0]))!==(q.answers[0]==='It gets bigger.'))fail(q.id,'shadow size');},
 'shadow-pictures'(q){const good=q.optionVisuals.map(v=>{const r=read(v),lens=r.polys.find(p=>p.fill==='yellow').pts,tx=Math.max(...lens.map(p=>p[0])),ty=lens.reduce((s,p)=>s+p[1],0)/lens.length,ball=r.circles.find(c=>c.fill==='blue').c,wall=r.lines.find(l=>l.w===3).a[0],sh=r.ellipses.find(e=>e.fill==='black').c,yPred=ty+(ball[1]-ty)*(sh[0]-tx)/(ball[0]-tx);return sh[0]>ball[0]&&Math.abs(wall-sh[0])<6&&Math.abs(sh[1]-yPred)<2;});expectLetters(q,good,'shadow in line with the torch and ball');},
 rays(q){const good=q.optionVisuals.map(v=>{const r=read(v),objs={lamp:r.circles.find(c=>c.fill==='yellow').c,book:(b=>[b.x+b.w/2,b.y+b.h/2])(r.rects.find(x=>x.fill==='red')),eye:r.circles.find(c=>c.fill==='blue').c},near=p=>Object.entries(objs).sort((a,b)=>dist(a[1],p)-dist(b[1],p))[0][0];
  const arrows=new Set(r.lines.filter(l=>l.arrow).map(l=>`${near(l.a)}>${near(l.b)}`));return arrows.size===2&&arrows.has('lamp>book')&&arrows.has('book>eye');});expectLetters(q,good,'light from the lamp to the book to the eye');},
};
function expectLetters2(q,good){expectLetters(q,good,'recomputed answer');}
function extreme(q,a,sign){const rows=q.visual.rows.filter(r=>!(a.skip??[]).includes(r[0])),vals=rows.map(r=>numberIn(r[a.col])),best=sign>0?Math.max(...vals):Math.min(...vals),top=rows.filter((_,i)=>vals[i]===best);if(top.length!==1||top[0][0]!==q.answers[0])fail(q.id,`expected ${top.map(r=>r[0])}`);for(const o of wrongs(q))if(!rows.some(r=>r[0]===o))fail(q.id,`${o} is not in the table`);}
/** Least-squares quadratic through pts, evaluated at x. */
function quad(pts,x){const S=k=>pts.reduce((s,p)=>s+p[0]**k,0),T=k=>pts.reduce((s,p)=>s+p[1]*p[0]**k,0),M=[[S(4),S(3),S(2),T(2)],[S(3),S(2),S(1),T(1)],[S(2),S(1),S(0),T(0)]];
 for(let c=0;c<3;c++){let p=c;for(let i=c+1;i<3;i++)if(Math.abs(M[i][c])>Math.abs(M[p][c]))p=i;[M[c],M[p]]=[M[p],M[c]];for(let i=0;i<3;i++)if(i!==c){const f=M[i][c]/M[c][c];for(let j=c;j<4;j++)M[i][j]-=f*M[c][j];}}
 const [a,b,c]=M.map((r,i)=>r[3]/r[i]);return a*x*x+b*x+c;}

// ── Run ─────────────────────────────────────────────────────────────────────────────────────────────────────
if(bankProblems.length)bankProblems.forEach(p=>fail('build',p));
const TOPICS=['sc-classification','sc-living-things','sc-human-body','sc-evolution','sc-light','sc-electricity','sc-forces','sc-sound','sc-earth-space','sc-materials','sc-states-of-matter','sc-working-scientifically'];
const topicIds=bankTopics.filter(t=>t.subject==='Science').map(t=>t.id);
if(JSON.stringify([...topicIds].sort())!==JSON.stringify([...TOPICS].sort()))fail('topics',`found ${topicIds.join(', ')}`);
if(science.length<190)fail('bank',`${science.length} questions (at least 190)`);
for(const t of topicIds){
 const qs=science.filter(q=>q.topic===t),groups=g=>qs.filter(q=>q.rewardGroup===g).length;
 if(qs.length<16||qs.length>18)fail(t,`${qs.length} questions (16–18 per topic)`);
 if(!groups('quick')||!groups('challenge')||groups('standard')<qs.length/2)fail(t,'needs some quick and challenge questions and mostly standard ones');
 const text=qs.filter(q=>!q.optionVisuals&&q.answers.length===1),longest=text.filter(q=>q.options.every(o=>o===q.answers[0]||o.length<q.answers[0].length));
 if(longest.length>text.length*.5)fail(t,`the answer is the longest option in ${longest.length} of ${text.length} questions`);
 const topic=bankTopics.find(x=>x.id===t),sheet=JSON.stringify(topic.helpsheet).toLowerCase();
 for(const q of qs){if(sheet.includes(q.prompt.toLowerCase().replace(/\*\*/g,'').slice(0,60)))fail(q.id,'the helpsheet repeats this question');
  if(!q.optionVisuals)for(const ans of q.answers){const a=ans.toLowerCase().replace(/[.!?]$/,'');if(a.split(/\s+/).length>=4&&sheet.replace(/\*\*/g,'').includes(a))fail(q.id,`the helpsheet gives away the answer "${ans}"`);}if(q.visual&&topic.helpsheet.example?.visual&&JSON.stringify(q.visual)===JSON.stringify(topic.helpsheet.example.visual))fail(q.id,'the helpsheet shows this picture');}
}
for(const q of science){
 const a=audits.get(q.id);if(!a){fail(q.id,'no audit');continue;}
 if(q.select>1&&(!/\*\*two\*\*/.test(q.prompt)||q.select!==2))fail(q.id,'multi-select prompts say **two**');
 if(/^which\b[^?]*\bnot\b/i.test(q.prompt.replace(/\*\*/g,''))&&!/\bNOT\b/.test(q.prompt))fail(q.id,'reversed questions use NOT in capitals');
 if(/all of the above|none of the above/i.test(q.options.join('|')))fail(q.id,'no "all/none of the above"');
 const lines=q.explanation.split('\n');if(lines.length<1||lines.length>4||lines.some(l=>!l.startsWith('- ')))fail(q.id,'explanations are one to four bullets');
 if(q.optionVisuals&&/\((?:[A-E])\)|\b(?:option|picture|diagram) [A-E]\b/.test(q.explanation))fail(q.id,'picture options are shuffled, so the explanation cannot name their letters');
 for(const v of [q.visual,...(q.optionVisuals??[])].filter(Boolean)){const alt=(v.alt??'').toLowerCase();for(const ans of q.answers)if(ans.length>3&&!/^(arrow|part|label|point|layer|bottle|bar|person|position|band|rock) [a-z]$/i.test(ans)&&alt.includes(ans.toLowerCase()))fail(q.id,`the picture description gives away "${ans}"`);}
 // Option letters are A–E, so a picture must never label its parts with those letters (use P onwards or numbers).
 for(const v of [q.visual,...(q.optionVisuals??[])].filter(Boolean)){const clash=[...new Set(wordsIn(v).filter(s=>/^[A-E]$/.test(s.trim())))];if(clash.length)fail(q.id,`picture labels ${clash.join(', ')} clash with the option letters A–E`);}
 if(q.visual?.kind==='key'){const ls=leaves(q.visual.root);if(new Set(ls).size!==ls.length)fail(q.id,'key has a repeated name');if(ls.some(s=>s.length>12))fail(q.id,'key names must fit their boxes (12 letters)');if(nodesOf(q.visual.root).some(n=>n.q.length>38))fail(q.id,'key questions must fit two lines (38 letters)');}
 const check=CHECK[a.type];if(!check){fail(q.id,`unknown audit type ${a.type}`);continue;}
 try{check(q,a);tick(a.type);}catch(e){fail(q.id,`${a.type} check crashed: ${e.message}`);}
}
for(const a of scienceAudit)if(!byId.has(a.id))fail(a.id,'audit for a question that does not exist');
console.log('Science:',science.length,'questions in',topicIds.length,'topics; re-derived:',Object.entries(checked).filter(([k])=>k!=='mc').map(([k,n])=>`${k} ${n}`).join(', '));
if(fails.length){console.log(`FAIL: ${fails.length} problem(s)`);fails.slice(0,80).forEach(f=>console.log(' -',f));process.exit(1);}
console.log(`PASS: ${science.length} Science answers checked (${science.length-(checked.mc??0)} re-derived independently).`);
