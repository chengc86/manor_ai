// Run game-audit first to compile the complete current bank.
const fs=require('fs'),assert=require('node:assert/strict'),ts=require('typescript');
const {questions,answerMatches,normalise,publicQuestion}=require('../work/questions.cjs');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
fs.writeFileSync('work/question-diagram.cjs',ts.transpileModule(fs.readFileSync('app/question-diagram.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020}}).outputText);
const Diagram=require('../work/question-diagram.cjs').default;let diagrams=0,calculations=0;
for(const q of questions){
 assert(q.prompt.trim()&&q.explanation.trim()&&q.answers.length,q.id);assert(!('answers' in publicQuestion(q)));for(const a of q.answers)assert(answerMatches(q,q.select>1?q.answers:a),q.id);
 if(q.options){assert.equal(new Set(q.options.map(normalise)).size,q.options.length,q.id);if(!(q.select>1))assert.equal(q.options.filter(o=>answerMatches(q,o)).length,1,q.id);}
 if(q.diagram){diagrams++;assert(['textbook','grid','dots','polygon','arrows'].includes(q.diagram.kind),q.id);const html=renderToStaticMarkup(React.createElement(Diagram,{diagram:q.diagram}));if(q.diagram.kind==='textbook'){const path=`/question-diagrams/photo-${q.diagram.items[0]}.svg`;assert(html.includes(path)&&html.includes('<img')&&!html.includes('<polygon'),q.id);assert(fs.existsSync('public'+path),q.id);}else assert(html.includes('<svg'),q.id);}
 const check=n=>{assert(answerMatches(q,String(n)),q.id+': '+n);calculations++;};
 if(q.id.startsWith('progression-v1-')){const n=Number(q.id.split('-').at(-1));if(q.id.includes('-multiply-'))check((n+8)*24);if(q.id.includes('-percent-'))check(n*20*35/100);if(q.id.includes('-fraction-'))check(n*(2+n%6));if(q.id.includes('-units-'))check(n*125/1000);}
 if(q.id.startsWith('progression-v1-grid-')){const [,a,b,mode]=q.id.match(/grid-(\d+)-(\d+)-(.*)$/);const f=n=>{const r=Math.floor(n/3),c=n%3;return 1+(mode==='mirror'?r*3+2-c:mode==='horizontal'?(2-r)*3+c:c*3+2-r)};assert(answerMatches(q,[f(+a),f(+b)].sort((a,b)=>a-b).join(' ')),q.id);calculations++;}
 if(q.id.startsWith('progression-v1-code-')){const [,word,shift]=q.id.match(/code-([A-Z]+)-(\d+)$/);assert(answerMatches(q,[...word].map(c=>String.fromCharCode(65+(c.charCodeAt(0)-65+Number(shift))%26)).join('')),q.id);calculations++;}
}
const punct=questions.find(q=>q.prompt==='Which mark ends a question?');assert(answerMatches(punct,'?'));assert(!answerMatches(punct,'!'));assert(!answerMatches(punct,'.'));
assert(answerMatches(questions.find(q=>q.id==='y6-2026-014'),'1.20'));assert(!answerMatches(questions.find(q=>q.id==='y6-2026-014'),'12'));
assert(!answerMatches(questions.find(q=>q.id==='q101'),'6/8'));assert(!answerMatches(questions.find(q=>q.id==='q101'),'0.75'));
// A unit after a number counts only when it is the unit the question asks for.
const byId=id=>questions.find(q=>q.id===id),units=(q,input,ok)=>assert.equal(answerMatches(q,input),ok,`${q.prompt} :: ${input}`);
for(const input of ['22 cm','22cm','22 centimetres'])units(byId('q3'),input,true);units(byId('q3'),'22 m',false);
units(byId('photo-20260916-033'),'45p',true);units(byId('y2-66'),'35p',true);units(byId('y2-66'),'35 pence',true);units(byId('y2-66'),'35 cm',false);units(byId('y2-71'),'15 cm',true);
units(byId('q100'),'2750 ml',true);units(byId('q100'),'2,750 millilitres',true);units(byId('q100'),'2750 litres',false);
const area={subject:'Maths',prompt:'A triangle has a base of 14 cm and a height of 9 cm. What is its area in cm²?',answers:['63']};units(area,'63 cm²',true);units(area,'63 cm',false);
const speed={subject:'Maths',prompt:'A train travels 210 km in 1 hour 45 minutes. What is its average speed in km/h?',answers:['120']};units(speed,'120 km/h',true);units(speed,'120 km',false);
const angle={subject:'Maths',prompt:'What is each interior angle of a regular hexagon, in degrees?',answers:['120']};units(angle,'120°',true);units(angle,'120 degrees',true);
units({subject:'English',prompt:'How many winters had it survived?',answers:['100']},'100 years',false);
const bad=renderToStaticMarkup(React.createElement(Diagram,{diagram:{kind:'unsupported',items:[24]}}));assert(bad.includes('could not load')&&!bad.includes('<polygon'));
console.log(`PASS: all ${questions.length} questions structurally checked; ${diagrams} diagrams render correctly; ${calculations} generated arithmetic/transform/code answers independently verified; numeric formats and punctuation checks passed.`);
