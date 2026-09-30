import {explain,bullets,type Topic,type Rng} from './bank-kit';
import {S,D,type Pic,type ShapePart,type ShapeKey,type Shade,type Made,info,centreAt,fits,rotPic,mirPic,distinct,lookAlike,picChoices,picTile,setOf,auditBuild,bold,
 count,numWord,shapeName,shadeWord,attempt,cap,listWords,diceIn,sizeForArea,plural,aWord} from './bank-nvr-kit';
import {anyChiral,chiralFig,type Fig} from './bank-nvr-figures';
// Patterns: sequences, matrices (2 × 2 and 3 × 3) and shape codes. Each question states its rule as a change per step,
// per row or per column (or per letter) on the picture model, so the missing picture is fixed by the rule.

const NV='Non-verbal reasoning';
const TURN_WORDS:Record<number,string>={45:'an eighth of a turn clockwise',90:'a quarter turn clockwise',135:'three eighths of a turn clockwise',180:'half a turn',225:'three eighths of a turn anticlockwise',270:'a quarter turn anticlockwise',315:'an eighth of a turn anticlockwise'};
const norm=(a:number)=>((a%360)+360)%360;

// ================================================================ sequences
const seqTopic:Topic={id:'nv-sequences',subject:NV,strand:'Patterns',title:'Sequences',helpsheet:{
 intro:'The pictures change in a regular way from one box to the next. Find every change, then continue the pattern into the empty box.',
 steps:['Compare the first two pictures, then the next two: what changes each time?','Check each feature separately: turning, position, number of sides, number of dots, shading.','Say each rule in words, for example "the black square moves one place clockwise".','Apply every rule to find the missing picture, then check it against the pictures on both sides.'],
 example:{title:'Continue the pattern',visual:setOf('sequence',[
  picTile([S('square',50,50,26,'white'),D(50,50)],'A square with one dot'),picTile([S('square',50,50,26,'grey'),D(40,50),D(60,50)],'A grey square with two dots'),
  picTile([S('square',50,50,26,'white'),D(35,50),D(50,50),D(65,50)],'A square with three dots'),null],'A sequence with the last picture missing'),
  lines:['Each step adds one dot: 1, 2, 3, so the next picture has 4 dots.','The shading goes white, grey, white, so the next square is grey.','The answer is a grey square with four dots.']},
 tips:['Sometimes two things change at once, and each has its own rule.','A position that moves round the edge comes back to the start: count carefully.','If the gap is in the middle, the missing picture must fit with the pictures on both sides.']}};
const SEQ_PROMPT=`Which picture ${bold('completes')} the sequence?`;
function seqDraft(family:string,terms:Pic[],gap:number,wrong:Pic[],explanation:string,o:{rule?:Record<string,unknown>;challenge?:boolean;alt?:(p:Pic)=>string}={}):Made|null{
 const ans=terms[gap];if(!distinct([ans,...wrong])||![...terms,...wrong].every(p=>fits(p,4)))return null;
 // The missing picture must not simply repeat one that is shown (cycles would make it guessable).
 if(terms.some((t,i)=>i!==gap&&lookAlike(t,ans)))return null;
 const c=picChoices(ans,wrong,o.alt);
 return {family,rule:o.rule??{},stem:{gap},pics:c.pics,draft:{prompt:SEQ_PROMPT,visual:setOf('sequence',terms.map((t,i)=>i===gap?null:picTile(t,o.alt?.(t))),'A sequence of five pictures with one missing'),
  answer:c.answer,wrong:c.wrong,pictures:c.pictures,explanation,...(o.challenge?{rewardGroup:'challenge' as const}:{})}};
}
const place=(gap:number)=>gap===4?'last':gap===0?'first':'missing';
function seqTurn(r:Rng):Made|null{return attempt(40,()=>{
 // Quarter turns only; four of them come back to the start, so the gap is never the last picture.
 const f=anyChiral(r);if(!f)return null;const step=r.pick([90,-90]),gap=r.pick([1,2,3]),terms=[0,1,2,3,4].map(i=>rotPic(f.pic,step*i)),t=step*gap;
 const wrong=[rotPic(f.pic,t+step),rotPic(f.pic,t-step),mirPic(terms[gap],'x'),rotPic(f.pic,-t),rotPic(mirPic(f.pic,'x'),t+step)].filter(p=>!lookAlike(p,terms[gap]));
 const w:Pic[]=[];for(const p of wrong)if(w.length<4&&w.every(q=>!lookAlike(p,q)))w.push(p);if(w.length<4)return null;
 const turn=TURN_WORDS[norm(step)];
 return seqDraft('seq-turn',terms,gap,w,explain(
  'Similarities:',bullets('Every picture is made of the same parts.'),
  'Rule:',bullets(`Each picture is the one before it turned ${turn}.`),
  'Why the answer fits:',bullets(`Turning the picture before the gap ${turn} gives this picture${gap<4?', and turning it again gives the picture after the gap':''}.`),
  'Red herrings:',bullets('Other options are turned too far, not far enough or the wrong way, or are mirror images.')),{rule:{step},challenge:Math.abs(step)===45,alt:()=>'A figure made of small shapes'});
});}
const COUNT_KEYS:Record<number,ShapeKey>={3:'triangle',4:'square',5:'pentagon',6:'hexagon',7:'heptagon',8:'octagon'};
/** A shape with dots in a dice pattern, spaced so every dot is easy to count (a triangle holds at most three). */
function countPic(sides:number,dots:number,fill:Shade):Pic|null{const k=COUNT_KEYS[sides];if(!k||dots<1||dots>6||k==='triangle'&&dots>3)return null;const s=centreAt(S(k,50,50,k==='triangle'?34:30,fill),50,k==='triangle'?55:50),d=diceIn(s,dots);return d&&fits([s,...d],4)?[s,...d]:null;}
/** Sides and dots each go up or down; the combination cycles with the question number so every kind appears. */
const COUNT_DIRS:[number,number][]=[[1,-1],[-1,1],[1,1],[-1,-1],[1,-1]];
function seqCount(r:Rng,i:number):Made|null{return attempt(60,()=>{
 const [ds,dd]=COUNT_DIRS[Math.floor(i/4)%COUNT_DIRS.length],n0=r.pick(ds>0?[3,4]:[7,8]),d0=dd>0?r.int(1,2):r.int(5,6),alt=r.chance(.5),fills=r.shuffle(['white','grey'] as Shade[]),gap=r.pick([4,4,2,3]);
 const at=(i:number,sdel=0,ddel=0,fdel=0)=>countPic(n0+ds*i+sdel,d0+dd*i+ddel,alt?fills[(i+fdel)%2]:fills[0]);
 const terms=[0,1,2,3,4].map(i=>at(i));if(terms.some(t=>!t))return null;
 const cands=[at(gap,ds,0),at(gap,0,dd),at(gap,-ds,0),at(gap,0,-dd),...(alt?[at(gap,0,0,1)]:[at(gap,ds,dd)])].filter((p):p is Pic=>!!p);
 const w:Pic[]=[];for(const p of r.shuffle(cands))if(w.length<4&&!lookAlike(p,terms[gap]!)&&w.every(q=>!lookAlike(p,q)))w.push(p);if(w.length<4)return null;
 const k=COUNT_KEYS[n0+ds*gap],dots=d0+dd*gap;
 return seqDraft('seq-count',terms as Pic[],gap,w,explain(
  'Similarities:',bullets('Every picture is a shape with dots inside it.'),
  'Rule:',bullets(`The shape ${ds>0?'gains':'loses'} one side each time, and the number of dots goes ${dd>0?'up':'down'} by one each time.`,...(alt?[`The shading takes turns: ${fills[0]}, ${fills[1]}, ${fills[0]} …`]:[])),
  'Why the answer fits:',bullets(`The ${place(gap)} picture must be a ${alt?shadeWord(fills[gap%2])+' ':''}${shapeName(k)} with ${count(dots,'dot')}.`),
  'Red herrings:',bullets('Options with the right shape but the wrong number of dots (or the other way round) follow only one of the rules.')),{rule:{ds,dd,alt}});
});}
// Two small shapes walking round the eight places at the edge of a square, at different speeds.
const RING:[number,number][]=[[28,28],[50,28],[72,28],[72,50],[72,72],[50,72],[28,72],[28,50]];
const RING_WORDS=['top left','top','top right','right','bottom right','bottom','bottom left','left'];
function ringPic(a:number,b:number):Pic{const [ax,ay]=RING[((a%8)+8)%8],[bx,by]=RING[((b%8)+8)%8];return [S('square',50,50,36,'white'),S('circle',ax,ay,7,'black'),centreAt(S('triangle',0,0,8.5,'white'),bx,by)];}
const moveWord=(s:number)=>`${numWord(Math.abs(s))} place${Math.abs(s)===1?'':'s'} ${s>0?'clockwise':'anticlockwise'}`;
function seqMove(r:Rng):Made|null{return attempt(80,()=>{
 const sa=r.pick([1,-1,2]),sb=r.pick([1,-1,3,-3,2,-2].filter(v=>v!==sa)),a0=r.int(0,7),b0=r.int(0,7),gap=r.pick([4,4,3,2,1]);
 if([0,1,2,3,4].some(i=>((a0+sa*i-b0-sb*i)%8+8)%8===0))return null;
 const terms=[0,1,2,3,4].map(i=>ringPic(a0+sa*i,b0+sb*i)),A=a0+sa*gap,B=b0+sb*gap;
 const cands=[[A,B+1],[A,B-1],[A+1,B],[A-1,B],[B,A],[A-sa,B-sb],[A,B+sb]].filter(([x,y])=>((x-y)%8+8)%8!==0).map(([x,y])=>ringPic(x,y));
 const w:Pic[]=[];for(const p of r.shuffle(cands))if(w.length<4&&!lookAlike(p,terms[gap])&&w.every(q=>!lookAlike(p,q)))w.push(p);if(w.length<4)return null;
 return seqDraft('seq-move',terms,gap,w,explain(
  'Similarities:',bullets('Every picture is a square with a black circle and a white triangle inside it, near the edge.'),
  'Rule:',bullets(`The black circle moves ${moveWord(sa)} each time.`,`The white triangle moves ${moveWord(sb)} each time.`),
  'Why the answer fits:',bullets(`In the ${place(gap)} picture the circle is at the ${RING_WORDS[((A%8)+8)%8]} and the triangle is at the ${RING_WORDS[((B%8)+8)%8]}.`),
  'Red herrings:',bullets('Some options move only one of the shapes correctly, or swap them round.')),{rule:{sa,sb},alt:()=>'A square with a small circle and a small triangle inside it'});
});}
// A 2 × 2 grid of squares: the black square moves clockwise, the grey one anticlockwise.
const QUAD:[number,number][]=[[33,33],[67,33],[67,67],[33,67]],QUAD_WORDS=['top left','top right','bottom right','bottom left'];
function quadPic(b:number,g:number):Pic{const bb=((b%4)+4)%4,gg=((g%4)+4)%4;return QUAD.map(([x,y],i)=>S('square',x,y,14,i===bb?'black':i===gg?'grey':'white'));}
function seqShade(r:Rng):Made|null{return attempt(40,()=>{
 const b0=r.int(0,3),g0=(b0+r.pick([1,3]))%4,sb=r.pick([1,-1]),sg=-sb,gap=r.pick([4,4,2,3]);
 const terms=[0,1,2,3,4].map(i=>quadPic(b0+sb*i,g0+sg*i)),B=b0+sb*gap,G=g0+sg*gap;
 const cands=[[B,G+sg],[B+sb,G],[G,B],[B-sb,G-sg],[B,G-sg],[B-sb,G]].filter(([x,y])=>((x-y)%4+4)%4!==0).map(([x,y])=>quadPic(x,y));
 const w:Pic[]=[];for(const p of r.shuffle(cands))if(w.length<4&&!lookAlike(p,terms[gap])&&w.every(q=>!lookAlike(p,q)))w.push(p);if(w.length<4)return null;
 const dir=(s:number)=>s>0?'clockwise':'anticlockwise';
 return seqDraft('seq-shade',terms,gap,w,explain(
  'Similarities:',bullets('Every picture is four squares with one black and one grey.'),
  'Rule:',bullets(`The black square moves one place ${dir(sb)} each time.`,`The grey square moves one place ${dir(sg)} each time.`),
  'Why the answer fits:',bullets(`In the ${place(gap)} picture the black square is at the ${QUAD_WORDS[((B%4)+4)%4]} and the grey square is at the ${QUAD_WORDS[((G%4)+4)%4]}.`),
  'Red herrings:',bullets('Some options move only one of the squares correctly, or swap the two shadings.')),{rule:{sb,sg},alt:()=>'Four squares in a grid, with some shaded'});
});}
const SEQ_PLAN:((r:Rng,i:number)=>Made|null)[]=[seqTurn,seqCount,seqMove,seqShade];
export const sequences=auditBuild(seqTopic,20,(r,i)=>SEQ_PLAN[i%SEQ_PLAN.length](r,i),{own:true});

// ================================================================ matrices
const matTopic:Topic={id:'nv-matrices',subject:NV,strand:'Patterns',title:'Matrices',helpsheet:{
 intro:'The pictures in a grid follow rules across the rows and down the columns. Find both rules to fill the empty square.',
 steps:['Look along the top row: what changes from left to right?','Look down the first column: what changes from top to bottom?','In a 3 × 3 grid, check whether each row uses the same set of shapes or shadings, each once.','Apply the row rule and the column rule together to fill the gap, then check it against its row and its column.'],
 example:{title:'Fill the gap',visual:setOf('grid',[
  picTile([S('circle',50,50,28,'white')],'A white circle'),picTile([S('circle',50,50,28,'black')],'A black circle'),
  picTile([S('square',50,50,24,'white')],'A white square'),null],'A 2 by 2 grid with one square missing',{cols:2}),
  lines:['Along the top row the shape stays the same and turns from white to black.','Down the first column the circle becomes a square.','So the missing picture is a black square.']},
 tips:['Each rule works on its own: one might be about shape, another about shading.','In 3 × 3 grids, a common rule is that every row and every column contains each shape (or shading) once.','Check your answer against the row and the column it sits in.']}};
const MAT_PROMPT=`Which picture ${bold('completes')} the grid?`;
function matDraft(family:string,cells:Pic[],gap:number,cols:number,wrong:Pic[],explanation:string,o:{rule?:Record<string,unknown>;challenge?:boolean;alt?:(p:Pic)=>string}={}):Made|null{
 const ans=cells[gap];if(!distinct([ans,...wrong])||![...cells,...wrong].every(p=>fits(p,4)))return null;const c=picChoices(ans,wrong,o.alt);
 return {family,rule:o.rule??{},stem:{gap,cols},pics:c.pics,draft:{prompt:MAT_PROMPT,visual:setOf('grid',cells.map((t,i)=>i===gap?null:picTile(t,o.alt?.(t))),`A ${cols} by ${cols} grid of pictures with one missing`,{cols}),
  answer:c.answer,wrong:c.wrong,pictures:c.pictures,explanation,...(o.challenge?{rewardGroup:'challenge' as const}:{})}};
}
type Iso='mirror'|'flip'|'turn90'|'turn180'|'turn270';
const ISO_WORD:Record<Iso,string>={mirror:'is reflected left to right',flip:'is reflected top to bottom',turn90:'turns a quarter turn clockwise',turn180:'turns half a turn',turn270:'turns a quarter turn anticlockwise'};
const iso=(p:Pic,i:Iso)=>i==='mirror'?mirPic(p,'x'):i==='flip'?mirPic(p,'y'):rotPic(p,i==='turn90'?90:i==='turn180'?180:270);
function mat2(r:Rng):Made|null{return attempt(60,()=>{
 const f=chiralFig(r,{fills:['white']});if(!f)return null;
 // A black shape would hide a black dot or line inside it, and would merge with a black triangle stuck to its edge.
 const noBlack=f.decos.some(d=>d.name==='black dot'||d.name==='line from the middle'||d.name==='black triangle'),to:Shade=noBlack?'grey':r.pick(['grey','black']),other:Shade=to==='grey'?(noBlack?'stripes':'black'):'grey';
 const shade=(p:Pic,s:Shade):Pic=>p.map((q,i)=>i===0&&q.k==='shape'?{...q,fill:s}:q);
 const R=r.pick(['mirror','flip','turn90','turn180','turn270'] as Iso[]),R2=r.pick((['mirror','flip','turn90','turn180','turn270'] as Iso[]).filter(x=>x!==R));
 const across=r.chance(.5),[rowOp,colOp]=across?[(p:Pic)=>iso(p,R),(p:Pic)=>shade(p,to)]:[(p:Pic)=>shade(p,to),(p:Pic)=>iso(p,R)];
 const a=f.pic,b=rowOp(a),c=colOp(a),ans=shade(iso(a,R),to);
 const wrong=[iso(a,R),shade(a,to),shade(iso(a,R2),to),shade(iso(a,R),other)];
 const base=shapeName((a[0] as ShapePart).s),geo=`the figure ${ISO_WORD[R]}`,sh=`the ${base} changes from white to ${to}`;
 return matDraft('mat-2x2',[a,b,c,ans],3,2,wrong,explain(
  'Similarities:',bullets(`Every picture is ${aWord(base)} with small parts around it.`),
  'Rule:',bullets(`Along each row, ${across?geo:sh}.`,`Down each column, ${across?sh:geo}.`),
  'Why the answer fits:',bullets(`The missing picture needs both changes: ${geo}, and ${sh}.`),
  'Red herrings:',bullets('Options that make only one of the changes, or turn or reflect the figure the wrong way, do not fit both the row and the column.')),
  {rule:{iso:R,shade:to,across},challenge:true,alt:()=>`A ${base} with small shapes around it`});
});}
const LATIN_KINDS:ShapeKey[]=['circle','square','triangle','pentagon','hexagon','heart','star','cross'];
const latinCell=(k:ShapeKey,f:Shade):Pic=>[centreAt(S(k,50,50,k==='star'?31:k==='triangle'?30:27,f),50,k==='triangle'?53:50)];
function mat3Latin(r:Rng):Made|null{return attempt(40,()=>{
 const kinds=r.sample(LATIN_KINDS,3),fills=r.sample(['white','grey','black','stripes'] as Shade[],3),s1=r.int(0,2),s2=r.int(0,2),m=r.pick([1,2]);
 const cellK=(i:number)=>{const rr=Math.floor(i/3),cc=i%3;return kinds[(rr+cc+s1)%3];},cellF=(i:number)=>{const rr=Math.floor(i/3),cc=i%3;return fills[(2*m*rr+m*cc+s2)%3];};
 // Shape follows one Latin square and shading an orthogonal one, so every shape–shading pair appears exactly once.
 const cells=[0,1,2,3,4,5,6,7,8].map(i=>latinCell(cellK(i),cellF(i))),gap=r.pick([8,8,8,6,2,4,0,5,7]),K=cellK(gap),F=cellF(gap);
 const pairs=new Set([0,1,2,3,4,5,6,7,8].map(i=>cellK(i)+'|'+cellF(i)));if(pairs.size!==9)return null;
 const oK=kinds.filter(k=>k!==K),oF=fills.filter(f=>f!==F);
 const wrong=[latinCell(K,oF[0]),latinCell(K,oF[1]),latinCell(oK[0],F),latinCell(r.pick(oK),r.pick(oF))];
 const row=Math.floor(gap/3),col=gap%3;
 return matDraft('mat-latin',cells,gap,3,wrong,explain(
  'Similarities:',bullets(`The grid uses three shapes (${listWords(kinds.map(k=>plural(shapeName(k))))}) and three shadings (${listWords(fills.map(f=>shadeWord(f)))}).`),
  'Rule:',bullets('Every row and every column has each shape once and each shading once.'),
  'Why the answer fits:',bullets(`Row ${row+1} and column ${col+1} are missing a ${shapeName(K)}, and they are missing the ${shadeWord(F)} shading, so the gap is a ${shadeWord(F)} ${shapeName(K)}.`),
  'Red herrings:',bullets('Options with the right shape but the wrong shading (or the other way round) repeat something already in the row or column.')),{rule:{}});
});}
const COUNT_ROW:ShapeKey[]=['circle','square','hexagon','pentagon','octagon'];
function countCell(k:ShapeKey,n:number,f:Shade):Pic|null{if(n<1||n>6)return null;const s=S(k,50,50,30,f),d=diceIn(s,n);return d?[s,...d]:null;}
function mat3Count(r:Rng):Made|null{return attempt(60,()=>{
 const kinds=r.sample(COUNT_ROW,3),n0=r.int(1,2),byRow=r.chance(.5),fill=r.pick(['white','grey'] as Shade[]),gap=r.pick([8,8,7,5,2,6]);
 const kOf=(i:number)=>kinds[byRow?Math.floor(i/3):i%3],nOf=(i:number)=>n0+Math.floor(i/3)+i%3;
 const cells=[0,1,2,3,4,5,6,7,8].map(i=>countCell(kOf(i),nOf(i),fill));if(cells.some(c=>!c))return null;
 const K=kOf(gap),N=nOf(gap),oK=kinds.filter(k=>k!==K);
 const wrong=[countCell(K,N+1,fill),countCell(K,N-1,fill),countCell(oK[0],N,fill),countCell(oK[1],N+1,fill)];if(wrong.some(w=>!w))return null;
 return matDraft('mat-count',cells as Pic[],gap,3,wrong as Pic[],explain(
  'Similarities:',bullets('Every picture is a shape with dots inside it.'),
  'Rule:',bullets(`The shape stays the same along each ${byRow?'row':'column'}.`,'The number of dots goes up by one from left to right, and by one from top to bottom.'),
  'Why the answer fits:',bullets(`The gap is in the ${byRow?'row':'column'} of ${shapeName(K)}s, and it needs ${count(N,'dot')}.`),
  'Red herrings:',bullets('Options with one dot too many or too few, or the wrong shape, break one of the rules.')),{rule:{byRow}});
});}
const MAT_PLAN=[mat2,mat3Latin,mat3Count,mat2,mat3Latin];
export const matrices=auditBuild(matTopic,20,(r,i)=>MAT_PLAN[i%MAT_PLAN.length](r),{own:true});

// ================================================================ codes
const codeTopic:Topic={id:'nv-codes',subject:NV,strand:'Patterns',title:'Shape codes',helpsheet:{
 intro:'Each letter in a code stands for one feature of the picture, such as its shape or its shading. Crack the code from the examples, then write the code for the new picture.',
 steps:['Take the first letter. Find two pictures that share it and ask what else they share.','Check that every picture with that letter has the feature, and that pictures with a different letter do not.','Do the same for the second (and third) letter.','Build the code for the new picture one letter at a time.'],
 example:{title:'Crack the code',visual:setOf('row',[
  picTile([S('circle',50,50,28,'black')],'A black circle'),picTile([S('square',50,50,24,'black')],'A black square'),picTile([S('circle',50,50,28,'white')],'A white circle'),picTile([S('square',50,50,24,'white')],'A white square')],
  'Four pictures with codes',{labels:['FM','GM','FN','?']}),
  lines:['The two circles both start with F, so F means circle and G means square.','The two black shapes both end in M, so M means black and N means white.','The white square is GN.']},
 tips:['A letter can stand for a feature that is not the first thing you notice, such as the number of dots.','Letters in the first place never tell you about the feature coded by the second place.','Every letter in your answer must appear somewhere in the examples.']}};
const CODE_PROMPT=`Which code goes with the ${bold('last picture')}?`;
type CodeFeat={name:string;values:string[];word:(v:string)=>string};
/** "a small striped square with two dots" for a code picture's values [shape, shading, third feature]. */
function itemWords(it:string[],third:string|null){const [k,f,x]=it,size=third==='size'?x+' ':'',tail=third==='dots'?` with ${count(+x,'dot')}`:third==='turn'?` and an arrow pointing ${x}`:'';
 const w=`${size}${shadeWord(f as Shade)} ${shapeName(k as ShapeKey)}${tail}`;return (/^[aeiou]/.test(w)?'an ':'a ')+w;}
/** Groups of letters with no letter in common, so each place in a code uses its own letters. */
const LETTER_SETS=['ABC','DEF','GHJ','KLM','NPQ','RST','UVW','XYZ'];
function codeQuestion(r:Rng,three:boolean):Made|null{return attempt(200,()=>{
 const kinds=r.sample(['circle','square','triangle','pentagon','hexagon','star','heart'] as ShapeKey[],3),fills=r.sample(['white','grey','black','stripes'] as Shade[],3);
 const feats:CodeFeat[]=[{name:'shape',values:kinds,word:v=>`a ${shapeName(v as ShapeKey)}`},{name:'shading',values:fills,word:v=>shadeWord(v as Shade)}];
 const third=three?r.pick(['dots','size','turn']):null;
 if(third==='dots')feats.push({name:'number of dots',values:['1','2','3'],word:v=>count(+v,'dot')});
 if(third==='size')feats.push({name:'size',values:['big','small'],word:v=>v});
 if(third==='turn')feats.push({name:'arrow direction',values:['up','right','down'],word:v=>`an arrow pointing ${v}`});
 const order=r.shuffle(feats.map((_,i)=>i)),sets=r.sample(LETTER_SETS,feats.length).map(s=>r.shuffle(s.split('')));
 const letters=feats.map((f,i)=>Object.fromEntries(f.values.map((v,j)=>[v,sets[i][j]])));
 const nEx=three?5:4,items:string[][]=[];for(let t=0;t<40&&items.length<nEx+1;t++){const it=feats.map(f=>r.pick(f.values));if(!items.some(x=>x.join()===it.join()))items.push(it);}
 if(items.length<nEx+1)return null;
 const ex=items.slice(0,nEx),target=items[nEx];
 // The target's values must each be seen in an example, and each code place must be explained by exactly one feature.
 if(!feats.every((_,i)=>ex.some(e=>e[i]===target[i])))return null;
 const codeOf=(it:string[])=>order.map(i=>letters[i][it[i]]).join('');
 for(let p=0;p<order.length;p++){const fits=feats.map((_,i)=>{const m=new Map<string,string>(),back=new Map<string,string>();for(const e of ex){const v=e[i],l=codeOf(e)[p];if((m.get(v)??l)!==l||(back.get(l)??v)!==v)return false;m.set(v,l);back.set(l,v);}return true;});
  if(fits.filter(Boolean).length!==1||!fits[order[p]])return null;}
 if(!feats.every((_,i)=>new Set(ex.map(e=>e[i])).size>=2))return null;
 // Every shape is drawn with the same area (a quarter of it when small), so size only differs when it is part of the code.
 const pic=(it:string[]):Pic=>{const k=it[0] as ShapeKey,f=it[1] as Shade,small=three&&third==='size'&&it[2]==='small',sz=sizeForArea(k,small?330:third?1150:1350);
  const out:Pic=[centreAt(S(k,50,50,sz,f),50,third==='turn'?42:50)];
  if(third==='dots')for(let j=0;j<+it[2];j++)out.push(D(35+j*15,90));
  if(third==='turn')out.push(S('arrow',50,88,8,'black',it[2]==='up'?270:it[2]==='down'?90:0));
  return out;};
 const answer=codeOf(target),wrongSet=new Set<string>();
 for(let p=0;p<order.length;p++){const i=order[p];for(const v of feats[i].values)if(v!==target[i]){const alt=[...target];alt[i]=v;wrongSet.add(codeOf(alt));}}
 wrongSet.add(answer.split('').reverse().join(''));wrongSet.delete(answer);
 const wrong=r.shuffle([...wrongSet]).slice(0,4);if(wrong.length<4)return null;
 const tiles=[...ex,target].map(it=>picTile(pic(it)));
 const labels=[...ex.map(codeOf),'?'];
 const meaning=order.map((i,p)=>`The ${['first','second','third'][p]} letter shows the ${feats[i].name}: ${feats[i].values.filter(v=>ex.some(e=>e[i]===v)).sort((a,b)=>letters[i][a].localeCompare(letters[i][b])).map(v=>`${letters[i][v]} = ${feats[i].word(v)}`).join(', ')}.`);
 return {family:'codes',rule:{order:order.map(i=>feats[i].name)},stem:{codes:labels},draft:{prompt:CODE_PROMPT,visual:setOf('row',tiles,`${numWord(nEx)} pictures with letter codes and one picture without a code`,{labels}),
  answer,wrong,explanation:explain(
  'Similarities:',bullets(`Each code has ${three?'three letters':'two letters'}, one for each feature.`),
  'Rule:',bullets(...meaning),
  'Why the answer fits:',bullets(`The last picture is ${itemWords(target,third)}, so its code is ${answer}.`),
  'Red herrings:',bullets('Wrong options use a letter for the wrong feature, or put the letters in the wrong order.')),...(three?{rewardGroup:'challenge' as const}:{})}};
});}
export const codes=auditBuild(codeTopic,20,(r,i)=>codeQuestion(r,i%5>=3));
