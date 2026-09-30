import {explain,bullets,type Topic,type Rng} from './bank-kit';
import {tile,label,type Mark,type Visual} from './visual';
import {S,D,type Pic,type ShapePart,type ShapeKey,type Shade,type Made,info,centreAt,fits,reach,rotPic,mirPic,scalePic,lookAlike,distinct,isTurnOf,
 picChoices,picTile,drawPic,setOf,auditBuild,bold,count,shapeName,shadeWord,attempt,cap,shapesOf,dotsOf,diceIn,bounds} from './bank-nvr-kit';
import {anyChiral,chiralFig,moveDecoClear,decoAt,dirWord,type Fig} from './bank-nvr-figures';
// Changes: rotation, reflection, analogies and transformations applied in a given order. Every change is applied to
// the picture model; options that come out looking the same as the answer are rejected before a question is kept.

const NV='Non-verbal reasoning';
const TURN_WORDS:Record<number,string>={45:'an eighth of a turn clockwise',90:'a quarter turn clockwise',135:'three eighths of a turn clockwise',180:'half a turn',225:'three eighths of a turn anticlockwise',270:'a quarter turn anticlockwise',315:'an eighth of a turn anticlockwise'};
const figAlt=(f:Fig)=>{const b=f.pic[0];return b.k==='shape'&&b.size>=16?`A ${shapeName(b.s)} with small shapes around it`:'Small shapes arranged in a square';};
const turnPt=([x,y]:[number,number],deg:number):[number,number]=>{const a=deg*Math.PI/180;return [50+(x-50)*Math.cos(a)-(y-50)*Math.sin(a),50+(x-50)*Math.sin(a)+(y-50)*Math.cos(a)];};
const mirPt=([x,y]:[number,number],axis:'x'|'y'):[number,number]=>axis==='x'?[100-x,y]:[x,100-y];
/** "The black triangle moves from the left to the top." for the first decoration whose place changes. */
function moveWords(f:Fig,move:(p:[number,number])=>[number,number]):string{
 for(const d of f.decos){const a=decoAt(f,d.idx),b=move(a),da=dirWord(a),db=dirWord(b);if(da!==db&&Math.hypot(a[0]-50,a[1]-50)>6)return `The ${d.name} moves from the ${da} to the ${db}.`;}
 return 'Every part moves to its new place.';
}
const figChoices=(f:Fig,ans:Pic,wrong:Pic[])=>picChoices(ans,wrong,()=>figAlt(f));

// ================================================================ rotation
const rotTopic:Topic={id:'nv-rotation',subject:NV,strand:'Changes',title:'Rotation',helpsheet:{
 intro:'A rotated (turned) figure keeps all its parts in the same order round it. A reflected (flipped) figure has them in the opposite order, and that is never a rotation.',
 steps:['Choose one part that is easy to follow, such as a black triangle.','Work out where it goes: a quarter turn clockwise takes the top to the right, the right to the bottom, and so on.','Check a second part the same way.','Reject options where the parts are in the opposite order round the figure: they are mirror images.'],
 example:{title:'A quarter turn clockwise',visual:setOf('sequence',[
  picTile([S('square',50,50,20,'white'),S('triangle',50,20,8,'black'),S('circle',83,50,6,'grey')],'A square with a triangle above it and a circle on its right'),
  picTile([S('square',50,50,20,'white'),S('triangle',80,50,8,'black',90),S('circle',50,83,6,'grey')],'A square with a triangle on its right and a circle below it')],'A figure before and after turning'),
  lines:['The triangle was at the top; after a quarter turn clockwise it is on the right.','The circle was on the right; now it is at the bottom.','Going clockwise, the triangle still comes just before the circle, so nothing has been flipped.']},
 tips:['Turn the page (or your head) to check a rotation.','Clockwise is the way clock hands move.','Half a turn is the same whichever way you turn.']}};
function rotAny(r:Rng):Made|null{return attempt(60,()=>{
 const f=anyChiral(r);if(!f)return null;
 // Quarter and half turns only: an eighth of a turn is too easy to mistake for a flip.
 const theta=r.pick([90,180,270]),ans=rotPic(f.pic,theta),k=r.int(0,f.decos.length-1),moved=moveDecoClear(f,k,r.pick([90,180,270]));if(!moved)return null;
 const wrong=[...r.sample([0,90,180,270],3).map(t=>rotPic(mirPic(f.pic,'x'),t)),rotPic(moved,r.pick([0,90,180,270]))];
 if(![ans,...wrong].every(p=>fits(p,4))||!distinct([f.pic,ans,...wrong])||wrong.some(w=>isTurnOf(f.pic,w)))return null;
 const c=figChoices(f,ans,wrong);
 return {family:'rot-any',rule:{angle:'any'},stem:{fig:f.pic},pics:c.pics,draft:{prompt:`Which picture shows this figure ${bold('turned')}, without flipping it over?`,visual:picTile(f.pic,figAlt(f)),
  answer:c.answer,wrong:c.wrong,pictures:c.pictures,rewardGroup:'challenge',explanation:explain(
  'Similarities:',bullets('Every option is made of the same parts as the figure.'),
  'Rule:',bullets('A turned figure keeps its parts in the same order round it; a flipped figure has them in the opposite order.'),
  'Why the answer fits:',bullets(`This is the figure turned ${TURN_WORDS[theta]}.`,moveWords(f,p=>turnPt(p,theta))),
  'Red herrings:',bullets('Three options are mirror images (flipped over), so no turn can make them match.','One option has a part in a different place.'))}};
});}
function rotBy(r:Rng,theta:number):Made|null{return attempt(60,()=>{
 const f=anyChiral(r);if(!f)return null;
 const ans=rotPic(f.pic,theta),m=mirPic(f.pic,'x');
 const pool=theta===180?[mirPic(f.pic,'x'),mirPic(f.pic,'y'),rotPic(f.pic,90),rotPic(f.pic,270)]
  :theta===90||theta===270?[rotPic(f.pic,360-theta),rotPic(f.pic,180),m,rotPic(m,theta)]
  :[rotPic(f.pic,360-theta),rotPic(f.pic,theta===45?90:270),rotPic(m,theta),rotPic(f.pic,theta===45?135:225)];
 if(![ans,...pool].every(p=>fits(p,4))||!distinct([f.pic,ans,...pool]))return null;
 const c=figChoices(f,ans,pool),words=TURN_WORDS[theta],deg=theta>180?360-theta:theta;
 return {family:'rot-by',rule:{angle:theta},stem:{fig:f.pic},pics:c.pics,draft:{prompt:`The figure is turned ${bold(words)} (${deg}°). Which picture shows the result?`,visual:picTile(f.pic,figAlt(f)),
  answer:c.answer,wrong:c.wrong,pictures:c.pictures,...(theta%90?{rewardGroup:'challenge' as const}:{}),explanation:explain(
  'Similarities:',bullets('Every option is made of the same parts as the figure.'),
  'Rule:',bullets(`Turn the whole figure through ${words}: every part moves the same way round.`),
  'Why the answer fits:',bullets(moveWords(f,p=>turnPt(p,theta)),'The other parts have moved round by the same amount, and nothing has been flipped.'),
  'Red herrings:',bullets(theta===180?'Mirror images and quarter turns look similar, but only half a turn puts every part in the right place.':'Some options are turned the wrong way or too far, and some are mirror images.'))}};
});}
const ROT_PLAN:((r:Rng)=>Made|null)[]=[rotAny,r=>rotBy(r,90),r=>rotBy(r,180),r=>rotBy(r,270),rotAny,r=>rotBy(r,r.pick([90,270]))];
export const rotation=auditBuild(rotTopic,20,(r,i)=>ROT_PLAN[i%ROT_PLAN.length](r),{own:true});

// ================================================================ reflection
const refTopic:Topic={id:'nv-reflection',subject:NV,strand:'Changes',title:'Reflection',helpsheet:{
 intro:'A reflection is what you would see in a mirror placed on the dashed line. Each part stays the same distance from the mirror line, on the other side.',
 steps:['Look at where the mirror line is: upright (reflect left to right) or flat (reflect top to bottom).','For an upright mirror, parts on the left go to the right and parts on the right go to the left; top and bottom stay the same.','For a flat mirror, top and bottom swap; left and right stay the same.','Check every small part, including which way it points.'],
 example:{title:'Reflect in an upright mirror line',visual:setOf('row',[
  picTile([S('rectangle',50,50,20,'white'),S('triangle',15,24,8,'black'),S('circle',85,76,6,'grey')],'A rectangle with a triangle at the top left and a circle at the bottom right'),
  picTile([S('rectangle',50,50,20,'white'),S('triangle',85,24,8,'black'),S('circle',15,76,6,'grey')],'A rectangle with a triangle at the top right and a circle at the bottom left')],'A figure and its reflection',{labels:['figure','reflection']}),
  lines:['The triangle was at the top left; in the reflection it is at the top right.','The circle was at the bottom right; now it is at the bottom left.','Nothing moves up or down, because the mirror line is upright.']},
 tips:['A reflection is not the same as a half turn: after half a turn, top and bottom swap as well.','Things pointing towards the mirror line still point towards it after reflecting.']}};
function mirrorStem(pic:Pic,axis:'x'|'y',alt:string):Visual{
 const marks=drawPic(pic);
 return axis==='x'?{kind:'figure',w:130,h:100,alt:alt+' and a dashed upright mirror line on its right',marks:[...marks,{t:'line',x1:116,y1:3,x2:116,y2:97,w:2.5,dash:true,c:'blue'}]}
  :{kind:'figure',w:100,h:130,alt:alt+' and a dashed flat mirror line below it',marks:[...marks,{t:'line',x1:3,y1:116,x2:97,y2:116,w:2.5,dash:true,c:'blue'}]};
}
function refQuestion(r:Rng,axis:'x'|'y'):Made|null{return attempt(60,()=>{
 const f=anyChiral(r);if(!f)return null;
 const ans=mirPic(f.pic,axis),k=r.int(0,f.decos.length-1),slip=moveDecoClear({pic:ans,decos:f.decos},k,r.pick([90,270]));if(!slip)return null;
 const wrong=[f.pic,rotPic(f.pic,180),mirPic(f.pic,axis==='x'?'y':'x'),slip];
 if(![ans,...wrong].every(p=>fits(p,4))||!distinct([ans,...wrong]))return null;
 const c=figChoices(f,ans,wrong),grid=f.pic[0].k!=='shape'||(f.pic[0] as ShapePart).size<16,hard=grid||axis==='y'&&f.decos.length>=3;
 return {family:'reflect',rule:{axis},stem:{fig:f.pic},pics:c.pics,draft:{prompt:`Which picture shows the figure ${bold('reflected')} in the dashed mirror line?`,visual:mirrorStem(f.pic,axis,figAlt(f)),
  answer:c.answer,wrong:c.wrong,pictures:c.pictures,...(hard?{rewardGroup:'challenge' as const}:{}),explanation:explain(
  'Similarities:',bullets('Every option is made of the same parts as the figure.'),
  'Rule:',bullets(axis==='x'?'The mirror line is upright, so left and right swap while top and bottom stay the same.':'The mirror line is flat, so top and bottom swap while left and right stay the same.'),
  'Why the answer fits:',bullets(moveWords(f,p=>mirPt(p,axis)),'Every other part is reflected in the same way.'),
  'Red herrings:',bullets('One option is the figure unchanged, one is turned half a turn, one is reflected the wrong way, and one has a part in the wrong place.'))}};
});}
const REF_PLAN:('x'|'y')[]=['x','y','x','x','y'];
export const reflection=auditBuild(refTopic,20,(r,i)=>refQuestion(r,REF_PLAN[i%REF_PLAN.length]),{own:true});

// ================================================================ analogies
const anaTopic:Topic={id:'nv-analogies',subject:NV,strand:'Changes',title:'Analogies',helpsheet:{
 intro:'The first picture changes into the second. Work out exactly what changed, then make the same change to the third picture.',
 steps:['Compare the first two pictures feature by feature: turning, flipping, shading, size, number of sides, number of dots, and which shape is inside which.','Write the changes down, for example "turns a quarter turn clockwise and the big shape goes black".','Apply every change to the third picture.','Choose the option that shows all the changes, not just some of them.'],
 example:{title:'Find the change',visual:setOf('analogy',[
  picTile([S('square',50,50,26,'white'),D(50,50)],'A white square with one dot'),
  picTile([S('square',50,50,26,'grey'),D(40,50),D(60,50)],'A grey square with two dots'),
  picTile([S('circle',50,50,30,'white'),D(40,50),D(60,50)],'A white circle with two dots'),null],'a is to b as c is to what?'),
  lines:['The square turns grey and gains one dot.','So the circle should turn grey and go from two dots to three.','The answer is a grey circle with three dots.']},
 tips:['There are often two changes: check you have found both.','Options that make only one of the changes are traps.','Watch the direction of a turn: clockwise and anticlockwise give different answers.']}};
const ANA_PROMPT='Which picture completes the second pair in the same way as the first?';
function anaDraft(family:string,items:[Pic,Pic,Pic],ans:Pic,wrong:Pic[],explanation:string,o:{rule?:Record<string,unknown>;challenge?:boolean;alt?:(p:Pic)=>string}={}):Made{
 const c=picChoices(ans,wrong,o.alt);
 return {family,rule:o.rule??{},stem:{items},pics:c.pics,draft:{prompt:ANA_PROMPT,visual:setOf('analogy',[...items.map(p=>picTile(p,o.alt?.(p))),null],'Three pictures and a question mark'),
  answer:c.answer,wrong:c.wrong,pictures:c.pictures,explanation,...(o.challenge?{rewardGroup:'challenge' as const}:{})}};
}
/** A black shape would hide a black dot or line inside it, and would merge with a black triangle stuck to its edge. */
const noBlack=(f:Fig)=>f.decos.some(d=>d.name==='black dot'||d.name==='line from the middle'||d.name==='black triangle');
function anaTurnShade(r:Rng,mirror:boolean):Made|null{return attempt(60,()=>{
 const fa=chiralFig(r,{fills:['white']}),fc=chiralFig(r,{fills:['white']});if(!fa||!fc)return null;
 const ka=(fa.pic[0] as ShapePart).s,kc=(fc.pic[0] as ShapePart).s;if(ka===kc)return null;
 const to:Shade=noBlack(fa)||noBlack(fc)?'grey':r.pick(['black','grey']);
 const shade=(p:Pic):Pic=>p.map((q,i)=>i===0&&q.k==='shape'?{...q,fill:to}:q);
 const theta=r.pick([90,180,270]),move=(p:Pic)=>mirror?mirPic(p,'x'):rotPic(p,theta);
 const a=fa.pic,b=shade(move(a)),c=fc.pic,ans=shade(move(c));
 const wrong=mirror?[shade(mirPic(c,'y')),shade(rotPic(c,180)),mirPic(c,'x'),shade(c)]:[move(c),shade(c),shade(rotPic(mirPic(c,'x'),theta)),shade(rotPic(c,theta===180?90:360-theta))];
 if(![b,ans,...wrong].every(p=>fits(p,4))||!distinct([ans,...wrong])||!distinct([a,b]))return null;
 const change=mirror?'is reflected in an upright mirror line (left and right swap)':`turns ${TURN_WORDS[theta]}`;
 return anaDraft(mirror?'ana-mirror-shade':'ana-turn-shade',[a,b,c],ans,wrong,explain(
  'Similarities:',bullets('Each picture is a large shape with small parts around it.'),
  'Rule:',bullets(`The figure ${change}, and the large ${shapeName(ka)} changes from white to ${to}.`),
  'Why the answer fits:',bullets(`The ${shapeName(kc)} figure ${change} in the same way and the ${shapeName(kc)} becomes ${to}.`,moveWords(fc,p=>mirror?mirPt(p,'x'):turnPt(p,theta))),
  'Red herrings:',bullets(mirror?'Options that are flipped upside down or turned half a turn look similar but put the parts in the wrong places.':'Options that are turned the wrong way, or flipped over, look similar but put the parts in the wrong places.','Options that make only one of the two changes are traps.')),
  {rule:{op:mirror?'mirror':'turn',theta:mirror?0:theta,shade:to},challenge:true,alt:()=>'A large shape with small shapes around it'});
});}
const SWAP_POOL:ShapeKey[]=['circle','triangle','square','pentagon','hexagon','heart','star','cross'];
const nestTwo=(o:ShapeKey,i:ShapeKey,fo:Shade,fi:Shade):Pic=>[centreAt(S(o,50,50,o==='star'?33:31,fo),50,50),centreAt(S(i,0,0,o==='star'||o==='cross'?8.5:12,fi),50,50)];
function anaSwap(r:Rng):Made|null{return attempt(60,()=>{
 const [x,y,p,q]=r.sample(SWAP_POOL,4),[fo,fi]=r.pick([['white','black'],['white','grey'],['grey','black'],['stripes','white']] as [Shade,Shade][]);
 const items:[Pic,Pic,Pic]=[nestTwo(x,y,fo,fi),nestTwo(y,x,fo,fi),nestTwo(p,q,fo,fi)],ans=nestTwo(q,p,fo,fi);
 const wrong=[nestTwo(q,q,fo,fi),nestTwo(p,p,fo,fi),nestTwo(p,q,fo,fi),nestTwo(q,p,fi,fo)];
 if(!distinct([ans,...wrong])||![...items,ans,...wrong].every(t=>fits(t,4)))return null;
 return anaDraft('ana-swap',items,ans,wrong,explain(
  'Similarities:',bullets('Each picture is a small shape inside a large shape.'),
  'Rule:',bullets(`The large shape and the small shape **swap places**: the ${shapeName(x)} with a ${shapeName(y)} inside becomes a ${shapeName(y)} with a ${shapeName(x)} inside. The shading stays in the same places.`),
  'Why the answer fits:',bullets(`The ${shapeName(p)} with a ${shapeName(q)} inside becomes a ${shapeName(q)} with a ${shapeName(p)} inside.`),
  'Red herrings:',bullets('Options with two shapes the same, or with the shading swapped as well, do not follow the change.')),{rule:{}});
});}
const COUNT_KEYS:Record<number,ShapeKey>={3:'triangle',4:'square',5:'pentagon',6:'hexagon',7:'heptagon'};
/** A shape with dots in a dice pattern, spaced so every dot is easy to count (a triangle holds at most three). */
function countPic(sides:number,dots:number,fill:Shade):Pic|null{const k=COUNT_KEYS[sides];if(!k||dots<1||dots>6||k==='triangle'&&dots>3)return null;const s=centreAt(S(k,50,50,k==='triangle'?34:30,fill),50,k==='triangle'?55:50),d=diceIn(s,dots);return d&&fits([s,...d],4)?[s,...d]:null;}
function anaCount(r:Rng):Made|null{return attempt(100,()=>{
 const ds=r.pick([1,-1]),dd=r.pick([1,-1,2,-2].filter(v=>v!==ds)),fill=r.pick(['white','grey'] as Shade[]);
 const sa=r.int(3,7),da=r.int(1,6),sc=r.int(3,7),dc=r.int(1,6);if(sa===sc||sc===sa+ds||sc+ds===sa)return null;
 const a=countPic(sa,da,fill),b=countPic(sa+ds,da+dd,fill),c=countPic(sc,dc,fill),ans=countPic(sc+ds,dc+dd,fill);
 const plans:[number,number][]=r.shuffle([[sc+ds,dc],[sc,dc+dd],[sc+ds,dc-dd],[sc-ds,dc+dd],[sc+2*ds,dc+dd]] as [number,number][]);
 const wrong=plans.map(([s,d])=>countPic(s,d,fill)).filter((p):p is Pic=>!!p).slice(0,4);
 if(!a||!b||!c||!ans||wrong.length<4||!distinct([ans,...wrong]))return null;
 const n=(k:number)=>shapeName(COUNT_KEYS[k]);
 return anaDraft('ana-count',[a,b,c],ans,wrong,explain(
  'Similarities:',bullets('Each picture is a shape with dots inside it.'),
  'Rule:',bullets(`The ${n(sa)} becomes a ${n(sa+ds)}: the shape ${ds>0?'gains':'loses'} one side.`,`The dots go from ${da} to ${da+dd}: ${dd>0?'add':'take away'} ${Math.abs(dd)}.`),
  'Why the answer fits:',bullets(`The ${n(sc)} becomes a ${n(sc+ds)}, and ${dc} ${dc===1?'dot becomes':'dots become'} ${dc+dd}.`),
  'Red herrings:',bullets('Options that change only the shape, or only the dots, or change the dots the wrong way, are traps.')),{rule:{ds,dd}});
});}
const ANA_PLAN:((r:Rng)=>Made|null)[]=[r=>anaTurnShade(r,false),anaSwap,anaCount,r=>anaTurnShade(r,true)];
export const analogies=auditBuild(anaTopic,20,(r,i)=>ANA_PLAN[i%ANA_PLAN.length](r),{own:true});

// ================================================================ transformations in a given order
type Op='turnR'|'turnL'|'half'|'mirror'|'flip'|'shrink'|'shade'|'dotTop';
const OP_WORD:Record<Op,string>={turnR:'a quarter turn clockwise',turnL:'a quarter turn anticlockwise',half:'half a turn',mirror:'a reflection in an upright mirror line',flip:'a reflection in a flat mirror line',shrink:'shrinking',shade:'shading it black',dotTop:'adding a black dot above it'};
export function applyOp(p:Pic,op:Op):Pic{switch(op){case 'turnR':return rotPic(p,90);case 'turnL':return rotPic(p,270);case 'half':return rotPic(p,180);case 'mirror':return mirPic(p,'x');case 'flip':return mirPic(p,'y');
 case 'shrink':return scalePic(p,.6);case 'shade':return p.map((q,i)=>i===0&&q.k==='shape'?{...q,fill:'black' as Shade}:q);case 'dotTop':{const [x0,y0,x1]=bounds(p);return [...p,D((x0+x1)/2,y0-9)];}}}
const orderTopic:Topic={id:'nv-transform-order',subject:NV,strand:'Changes',title:'Transformations in order',helpsheet:{
 intro:'Each numbered example shows one change. Make the changes to the start shape one at a time, in the order you are given.',
 steps:['Name each change from its example: a turn (which way and how far), a reflection, shrinking, shading or adding a part.','Start with the change named first in the order and draw (or imagine) the result.','Make the next change to that result, not to the start shape.','Finish with the last change, then find the matching option.'],
 example:{title:'Order 2 → 1',visual:setOf('sequence',[
  picTile([centreAt(S('flag',50,50,26,'white'),50,50)],'A flag shape'),
  picTile(applyOp([centreAt(S('flag',50,50,26,'white'),50,50)],'dotTop'),'A flag shape with a dot above it'),
  picTile(applyOp(applyOp([centreAt(S('flag',50,50,26,'white'),50,50)],'dotTop'),'turnR'),'A flag shape on its side with a dot beside it')],'A shape changed in two steps',{labels:['start','after 2','after 1']}),
  lines:['Change 1 is a quarter turn clockwise; change 2 is adding a dot above the shape.','Doing 2 first puts the dot above the shape; then the quarter turn carries the dot round to the right-hand side.','Doing 1 first would leave the dot above the turned shape instead, so the order matters.']},
 tips:['Turns and reflections usually give different results in different orders, so follow the order exactly.','Shading and shrinking do not change which way a shape faces.','A dot added before a turn moves with the turn.']}};
const EXAMPLE_SHAPE:ShapeKey='flag';
/** Start shapes that look clearly different after any turn or flip (no near-symmetry at this size). */
const START_SHAPES:ShapeKey[]=['lshape','rtri','rtrap','flag'];
const y0=4;
/** A small copy of a tile placed in a larger figure. */
const place=(pic:Pic,x:number,y:number,k:number):Mark=>({t:'g',x,y,scale:k,marks:drawPic(pic)});
// Two columns (examples 1 and 2, then example 3 beside the start shape, then the order), so on a phone the examples are drawn
// half as large again as in one row of three. The tiles are placed in the same order as before, so the audit reads them alike.
function orderStem(examples:[Pic,Pic][],start:Pic,order:number[]):{visual:Visual;tiles:number[]}{
 const marks:Mark[]=[],tiles:number[]=[],cell=(k:number)=>({x:6+(k%2)*212,y:y0+Math.floor(k/2)*108});
 examples.forEach(([before,after],k)=>{const {x,y}=cell(k);tiles.push(marks.length);marks.push(place(before,x+24,y+12,.75));tiles.push(marks.length);marks.push(place(after,x+126,y+12,.75));});
 const s=cell(3);tiles.push(marks.length);marks.push(place(start,s.x+107,s.y+5,.9));
 examples.forEach((_,k)=>{const {x,y}=cell(k);marks.push({t:'rect',x,y,w:204,h:100,r:10,fill:'none',sw:1.4,c:'muted'},label(x+13,y+21,String(k+1),15,{bold:true}),{t:'line',x1:x+103,y1:y+50,x2:x+121,y2:y+50,w:2,arrow:'end'});});
 marks.push({t:'rect',x:s.x+104,y:s.y+2,w:96,h:96,r:8,fill:'none',sw:2},label(s.x+94,s.y+55,'Start',15,{bold:true,anchor:'end'}),label(214,y0+238,`Order: ${order.join(' → ')}`,15,{bold:true}));
 return {visual:{kind:'figure',w:428,h:250,marks,alt:`Three numbered examples of changes, and a start shape in a box`},tiles};
}
function orderQuestion(r:Rng):Made|null{return attempt(200,()=>{
 const turn=r.pick(['turnR','turnL','half',null] as (Op|null)[]),refl=r.pick(['mirror','flip',null] as (Op|null)[]),other=r.sample(['shrink','shade','dotTop'] as Op[],3);
 const ops=r.shuffle([turn,refl,...other].filter((o):o is Op=>!!o)).slice(0,3);if(ops.length<3||(!turn&&!refl)||ops.includes('shrink')&&ops.includes('dotTop'))return null;
 const order=r.pick([[2,1,3],[3,1,2],[2,3,1],[3,2,1],[1,3,2]]),startKey=r.pick(START_SHAPES);
 const start:Pic=[centreAt(S(startKey,50,50,26,'white',r.pick([0,90,180,270]),r.chance(.5)),50,50)];
 const run=(ord:number[],skip=-1,swapTurn=false)=>ord.reduce((p,k)=>k-1===skip?p:applyOp(p,swapTurn&&ops[k-1]==='turnR'?'turnL':swapTurn&&ops[k-1]==='turnL'?'turnR':ops[k-1]),start);
 const ans=run(order);if(lookAlike(ans,run([1,2,3])))return null;
 const cands=[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]].filter(o=>o.join()!==order.join()).map(o=>run(o));
 cands.push(...[0,1,2].map(s=>run(order,s)));if(turn==='turnR'||turn==='turnL')cands.push(run(order,-1,true));
 const wrong:Pic[]=[];for(const c of r.shuffle(cands))if(wrong.length<4&&!lookAlike(c,ans)&&wrong.every(w=>!lookAlike(w,c)))wrong.push(c);
 if(wrong.length<4||![ans,...wrong].every(p=>fits(p,4)))return null;
 const ex:Pic=[centreAt(S(EXAMPLE_SHAPE,50,50,26,'white'),50,50)],examples=ops.map(op=>[ex,applyOp(ex,op)] as [Pic,Pic]);
 if(!examples.every(([,a])=>fits(a,3)))return null;
 const stem=orderStem(examples,start,order),c=picChoices(ans,wrong);
 const steps=order.map((k,i)=>`${i===0?'First':i===1?'Then':'Finally'} change ${k}: ${OP_WORD[ops[k-1]]}.`);
 return {family:'order',rule:{ops,order},stem:{tiles:stem.tiles,examples:ops},pics:c.pics,draft:{prompt:`Make the changes to the start shape in the order ${order.join(' → ')}. Which picture shows the result?`,visual:stem.visual,
  answer:c.answer,wrong:c.wrong,pictures:c.pictures,rewardGroup:'challenge',explanation:explain(
  'Similarities:',bullets(`The examples show ${ops.map((o,i)=>`change ${i+1}: ${OP_WORD[o]}`).join('; ')}.`),
  'Rule:',bullets(...steps),
  'Why the answer fits:',bullets('This option shows the start shape after all three changes, made in that order.'),
  'Red herrings:',bullets(`Other options come from doing the changes in a different order${ops.some(o=>o==='turnR'||o==='turnL')?', leaving one out, or turning the wrong way':' or leaving one out'}.`))}};
});}
export const transformOrder=auditBuild(orderTopic,20,r=>orderQuestion(r));
