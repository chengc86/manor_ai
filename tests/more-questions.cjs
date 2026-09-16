// Run game-audit.cjs first. Independent arithmetic and SVG-geometry checks.
const fs=require('fs'),assert=require('node:assert/strict');
const {questions,answerMatches}=require('../work/questions.cjs');
const added=questions.filter(q=>q.id.startsWith('more-240-'));
assert.equal(added.length,240);
for(const [year,n] of [[6,40],[2,20]])for(const subject of ['Maths','English','Verbal reasoning','Non-verbal reasoning'])assert.equal(added.filter(q=>q.difficulty===`Year ${year}`&&q.subject===subject).length,n);
const signatures=new Set(questions.filter(q=>!q.id.startsWith('more-240-')).map(q=>JSON.stringify([q.difficulty,q.subject,q.prompt,q.passage||'',q.options||[],q.diagram||{}])));
for(const q of added){const key=JSON.stringify([q.difficulty,q.subject,q.prompt,q.passage||'',q.options||[],q.diagram||{}]);assert(!signatures.has(key),`Duplicate ${q.id}`);signatures.add(key);}
const cases=JSON.parse(fs.readFileSync('tests/more-question-cases.json','utf8'));
const transform=(mask,fn)=>{let out=0;for(let row=0;row<3;row++)for(let col=0;col<3;col++)if(mask&(1<<(row*3+col))){const [r,c]=fn(row,col);out|=1<<(r*3+c)}return out};
const rotate=m=>transform(m,(r,c)=>[c,2-r]),reflect=m=>transform(m,(r,c)=>[r,2-c]);
let arithmetic=0,diagrams=0;
for(const [id,type,args,asset] of cases){const q=added.find(q=>q.id===id);assert(q,id);const [a,b,c]=args;let expected;
switch(type){
case 'ratio':expected=c*a/(a+b);break;
case 'equation':expected=(c-b)/a;break;
case 'volume':expected=a*b*c;break;
case 'angles':expected=180-a-b;break;
case 'fraction':expected=a*b/c;break;
case 'time':expected=`${Math.floor((a+b)/60).toString().padStart(2,'0')}:${((a+b)%60).toString().padStart(2,'0')}`;break;
case 'mean':expected=5*a-args.slice(1).reduce((x,y)=>x+y,0);break;
case 'change':expected=a*b/100;break;
case 'coordinate':case 'sum':expected=a+b;break;
case 'subtract':expected=a-b;break;
case 'product':expected=a*b;break;
case 'divide':expected=a/b;break;
case 'lcm':expected=a;while(expected%b)expected+=a;break;
case 'code':expected=[...a].map(ch=>'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(ch)+b)%26]).join('');break;
case 'union':expected=a|b;break;
case 'difference':expected=a&~b;break;
case 'turn-mirror':expected=reflect(rotate(a));break;
case 'xor':expected=a^b;break;
case 'mirror':expected=reflect(a);break;
case 'below':expected=a|(a<<3);break;
case 'ring':expected=1<<[0,1,2,5,8,7,6,3][(a+b*3)%8];break;
default:throw Error(type);
}
if(!asset){assert(answerMatches(q,String(expected)),id);arithmetic++;continue;}
const svg=fs.readFileSync(`public/question-diagrams/photo-${asset}.svg`,'utf8');
// Recover all grids from the visible rect coordinates/fills, not stored answer masks.
const grids=[...svg.matchAll(/<g transform="translate\(([^)]*)\)" data-mask="\d+">(.*?)<\/g>/g)].map(m=>{
let mask=0;for(const r of m[2].matchAll(/<rect x="(\d+)" y="(\d+)" width="20" height="20" fill="([^"]+)"/g))if(r[3]==='#174e42')mask|=1<<(Number(r[2])/22*3+Number(r[1])/22);
const label=m[2].match(/>([ABCD])<\/text>/)?.[1];return{mask,label};});
const options=grids.filter(g=>g.label);assert.equal(options.length,4,id);assert.equal(new Set(options.map(g=>g.mask)).size,4,id);assert.equal(options.filter(g=>g.mask===expected).length,1,id);assert(answerMatches(q,options.find(g=>g.mask===expected).label),id);
const sources=grids.filter(g=>!g.label);if(type==='ring'){assert.deepEqual(sources.map(g=>g.mask),[0,1,2].map(j=>1<<[0,1,2,5,8,7,6,3][(a+j*b)%8]),id);}else assert.deepEqual(sources.map(g=>g.mask),args,id);
diagrams++;
}
assert.equal(arithmetic,70);assert.equal(diagrams,60);
assert.equal(added.filter(q=>q.passage).length,42);assert.equal(new Set(added.filter(q=>q.passage).map(q=>q.passage)).size,9);
console.log('PASS: 240 unique additions, balanced year/subject counts, 70 independent numeric/code answers, 60 SVG answer keys, 9 passages and 42 comprehension questions.');
