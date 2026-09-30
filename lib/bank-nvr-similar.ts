import {explain,bullets,type Topic,type Rng} from './bank-kit';
import {noEcho,S,D,L,type Pic,type ShapePart,type DotPart,type ShapeKey,type Shade,type Made,type Feat,info,inside,corners,areaCentre,centreAt,fits,
 rotPic,mirPic,isTurnOf,distinct,sizeRel,pairSizes,placeWords,picChoices,picTile,setOf,auditBuild,bold,count,numWord,shapeName,shadeWord,plural,attempt,cap,listWords,the,shapesOf,dotsOf,linesOf,
 minEdge,edgeAt,diceIn,fiveFills,fairAll,fairRight,sharedFair,cmp} from './bank-nvr-kit';
import {chiralFigure,symFigure,breakSym,hasMirror,uprightSym} from './bank-nvr-figures';
// Similarities: odd one out, match to a group, match to a pair. Each family builds pictures from the feature model and
// checks that red herrings never single out one picture, so only the rule decides the answer.

const NV='Non-verbal reasoning';

// ================================================================ odd one out
const oddTopic:Topic={id:'nv-odd-one-out',subject:NV,strand:'Similarities',title:'Odd one out',helpsheet:{
 intro:'Four pictures share a rule and one picture breaks it. Find what the four have in common, then pick the one that does not fit.',
 steps:['Compare the pictures one feature at a time: shape, number of sides, shading, size, position, number of dots or lines, and which way things point.','Look for a feature that is the same in four pictures and different in one.','Check the rule really works for all four of the others before you choose.','If every picture has the same parts, look for a mirror image: a flipped picture can never be turned to match the others.'],
 example:{title:'Which picture is most unlike the others?',visual:setOf('row',[
  picTile([S('circle',50,50,30,'grey'),L(22,38,78,38),L(22,62,78,62)],'A grey circle crossed by two lines'),
  picTile([S('square',50,50,26,'white'),L(50,18,50,82),L(18,50,82,50)],'A white square crossed by two lines'),
  picTile([S('hexagon',50,50,30,'dots'),L(20,30,80,30),L(20,50,80,50),L(20,70,80,70)],'A dotted hexagon crossed by three lines'),
  picTile([S('triangle',50,52,30,'stripes'),L(25,40,75,72),L(25,72,75,40)],'A striped triangle crossed by two lines')],'Four shapes crossed by lines',{labels:['P','Q','R','S']}),
  lines:['The circle, square and triangle are each crossed by two lines.','The hexagon is crossed by three lines, so R is the odd one out.','The shading is different in every picture, so it is a red herring.']},
 tips:['A red herring is a feature that changes with no pattern, such as shading that is different in every picture.','Count carefully: sides, corners, dots and lines.','If two rules seem to work, choose the one that picks out exactly one picture.']}};
const ODD_PROMPT=`Which picture is ${bold('most unlike')} the others?`;
const oddDraft=(family:string,pics:Pic[],explanation:string,o:{alt?:(p:Pic)=>string;challenge?:boolean;rule?:Record<string,unknown>}={}):Made=>{
 const c=picChoices(pics[0],pics.slice(1),o.alt);
 return {family,rule:o.rule??{},pics:c.pics,draft:{prompt:ODD_PROMPT,answer:c.answer,wrong:c.wrong,pictures:c.pictures,explanation,...(o.challenge?{rewardGroup:'challenge' as const}:{})}};
};
/** Shapes whose corners are all easy to count at tile size. Six-sided shapes only ever appear as the odd one out. */
const SIDE_POOL:Record<number,ShapeKey[]>={3:['triangle','rtri','isotri','obtri'],4:['square','rectangle','kite','trapezium','parallelogram','rtrap','quad'],5:['pentagon','house','pent3','flag'],6:['hexagon','lshape','chevron']};
const TURNS=[0,0,15,30,45,90,135,160,180,200,225,270,300,330];

function oddSides(r:Rng):Made|null{return attempt(300,()=>{
 const n=r.pick([3,4,5]),m=r.pick([n-1,n+1].filter(v=>v>=3&&v<=6)),keys=[r.pick(SIDE_POOL[m]),...r.sample(SIDE_POOL[n],4)],fills=fiveFills(r);
 const pics:Pic[]=keys.map((k,i)=>[S(k,50,50,r.int(26,30),fills[i],r.pick(TURNS))]);
 if(!pics.every(p=>fits(p,5)))return null;
 const parts=pics.map(p=>p[0] as ShapePart);
 if(!fairRight(keys)||!fairAll([fills,keys.map(k=>info(k).mirrors>0),keys.map(k=>info(k).regular),keys.map(k=>info(k).convex),parts.map(p=>(p.rot??0)%90===0)]))return null;
 const odd=parts[0],GENERIC:Record<number,string>={3:'triangle',4:'four-sided shape',5:'five-sided shape',6:'six-sided shape'};
 return oddDraft('odd-sides',pics,explain(
  'Similarities:',bullets('Each picture is one shape.'),
  'Rule:',bullets(`Count the straight sides. Four of the shapes have **${n} sides** each.`),
  'Why the answer fits:',bullets(`The ${shadeWord(odd.fill)} ${GENERIC[m]} has **${m} sides**, so it is the only shape that breaks the rule.`),
  'Red herrings:',bullets('The shading, the size and the way each shape is turned change from picture to picture, so they are not the rule.')),{rule:{sides:n,odd:m}});
});}

const OUT_SPOTS:[number,number][]=[[13,13],[87,13],[13,87],[87,87],[50,9],[91,50],[50,91],[9,50]];
const INOUT_POOL:ShapeKey[]=['circle','square','pentagon','hexagon','octagon','triangle','rectangle'];
function oddInOut(r:Rng):Made|null{return attempt(300,()=>{
 const keys=r.sample(INOUT_POOL,5),fills=fiveFills(r,['white','grey']),ins=keys.map(()=>r.int(1,3));
 const outs=ins.map((k,i)=>i===0?r.pick([k-1,k+1].filter(v=>v>=1&&v<=4)):k);
 const pics:Pic[]=[];
 for(let i=0;i<5;i++){const s=S(keys[i],50,50,keys[i]==='triangle'?27:24,fills[i]),inner=diceIn(s,ins[i]);if(!inner)return null;
  const spots=r.shuffle(OUT_SPOTS).filter(([x,y])=>!inside(s,x,y)&&minEdge(s,x,y)>=9).slice(0,outs[i]);if(spots.length<outs[i])return null;
  pics.push([s,...inner,...spots.map(([x,y])=>D(x,y))]);}
 const spots=pics.map(p=>{const out=dotsOf(p).filter(d=>!inside(p[0] as ShapePart,d.x,d.y)),corner=out.filter(d=>Math.abs(d.x-50)>25&&Math.abs(d.y-50)>25).length;return corner===out.length?'corners':corner===0?'edges':'mixed';});
 if(!fairAll([fills,ins,outs,keys.map(k=>info(k).sides),spots]))return null;
 const odd=pics[0][0] as ShapePart;
 return oddDraft('odd-inout',pics,explain(
  'Similarities:',bullets('Each picture has a shape with dots inside it and dots outside it.'),
  'Rule:',bullets('In four pictures there are **as many dots outside** the shape **as inside** it.'),
  'Why the answer fits:',bullets(`${cap(the(odd))} has ${count(ins[0],'dot')} inside but ${numWord(outs[0])} outside.`),
  'Red herrings:',bullets('The shape, its shading and the number of dots change from picture to picture.')));
});}

const COPY_POOL:ShapeKey[]=['circle','triangle','square','pentagon','hexagon','heart','semicircle'];
/** Two shapes that are clearly different when small: at least two sides apart, or not both straight-sided. */
const clearlyDifferent=(a:ShapeKey,b:ShapeKey)=>{const x=info(a),y=info(b);return a!==b&&(x.curved||y.curved||Math.abs(x.sides-y.sides)>=2);};
function nested(outer:ShapeKey,inner:ShapeKey,of:Shade,inf:Shade,rot:number,big=32,small=12):Pic{return [centreAt(S(outer,50,50,big,of,rot),50,50),centreAt(S(inner,0,0,small,inf,rot),50,50)];}
function oddCopy(r:Rng):Made|null{return attempt(300,()=>{
 const keys=r.sample(COPY_POOL,5),oddInner=r.pick(COPY_POOL.filter(k=>clearlyDifferent(k,keys[0]))),outF=fiveFills(r,['white','grey','stripes']),rots=keys.map(()=>r.pick([0,0,90,180,270]));
 const inF=outF.map(f=>r.pick((['black','white','grey'] as Shade[]).filter(g=>g!==f)));
 const pics=keys.map((k,i)=>nested(k,i===0?oddInner:k,outF[i],inF[i],rots[i]));
 if(!pics.every(p=>fits(p,5))||!fairAll([outF,inF,rots.map(x=>x===0)]))return null;
 const [o,i]=pics[0] as ShapePart[];
 return oddDraft('odd-copy',pics,explain(
  'Similarities:',bullets('Each picture has a small shape inside a large shape.'),
  'Rule:',bullets('In four pictures the small shape is a **smaller copy of the large shape**.'),
  'Why the answer fits:',bullets(`${cap(the(o))} has a small ${shapeName(i.s)} inside it, which is a different shape.`),
  'Red herrings:',bullets('The shading of the shapes, and which way up they are, change from picture to picture.')));
});}

const BM_POOL:ShapeKey[]=['triangle','square','rectangle','pentagon','hexagon','house','rtri','trapezium'];
const SLOTS:[number,number][][]=[[[28,50],[72,50]],[[50,28],[50,72]],[[30,30],[70,70]],[[70,30],[30,70]]];
function oddBlackMore(r:Rng):Made|null{return attempt(400,()=>{
 const rows:{b:ShapeKey;w:ShapeKey;slot:number;first:boolean;rel:number}[]=[];
 for(let i=0;i<5;i++){const [a,b]=r.sample(BM_POOL,2);const sa=info(a).sides,sb=info(b).sides;if(sa===sb)return null;const more=sa>sb?a:b,less=sa>sb?b:a;
  rows.push({b:i===0?less:more,w:i===0?more:less,slot:r.int(0,3),first:r.chance(.5),rel:r.pick([-1,0,1])});}
 const pics:Pic[]=rows.map(x=>{const [p,q]=SLOTS[x.slot],[bp,wp]=x.first?[p,q]:[q,p],[bs,ws]=pairSizes(x.b,x.w,x.rel);
  return [S(x.b,bp[0],bp[1],bs,'black'),S(x.w,wp[0],wp[1],ws,'white')];});
 if(!pics.every(p=>fits(p,5)))return null;
 const sizes=pics.map(p=>sizeRel(p[0] as ShapePart,p[1] as ShapePart));if(sizes.some(z=>!z))return null;
 const places=pics.map(p=>placeWords(p[0] as ShapePart,p[1] as ShapePart));
 const sides=(k:ShapeKey)=>info(k).sides,more=rows.map(x=>sides(x.b)>sides(x.w)?x.b:x.w);
 if(!fairAll([rows.map(x=>sides(x.b)),rows.map(x=>sides(x.w)),places.map(p=>p[0]),places.map(p=>p[1]),places.map(p=>p.join()),sizes as string[],
  rows.map((x,i)=>sizes[i]==='similar'?0:(more[i]===x.b)===(sizes[i]==='bigger')?1:-1),rows.map(x=>Math.abs(sides(x.b)-sides(x.w))),rows.map(x=>x.b),rows.map(x=>x.w)]))return null;
 const [b,w]=pics[0] as ShapePart[];
 return oddDraft('odd-black-more',pics,explain(
  'Similarities:',bullets('Each picture has one black shape and one white shape.'),
  'Rule:',bullets('In four pictures the **black shape has more sides** than the white shape.'),
  'Why the answer fits:',bullets(`Here the black ${shapeName(b.s)} has ${sides(b.s)} sides, fewer than the white ${shapeName(w.s)}, which has ${sides(w.s)}.`),
  'Red herrings:',bullets('Which shape is bigger, and where the shapes are placed, change from picture to picture.')));
});}

function oddMirror(r:Rng):Made|null{return attempt(40,()=>{
 const f=chiralFigure(r);if(!f)return null;
 // Quarter turns only: an eighth of a turn is too easy to mistake for a flip.
 const turns=r.shuffle([0,90,180,270]),pics=[rotPic(mirPic(f,'x'),r.pick([0,90,180,270])),...turns.map(t=>rotPic(f,t))];
 if(!distinct(pics)||pics.slice(1).some(p=>isTurnOf(p,pics[0])))return null;
 return oddDraft('odd-mirror',pics,explain(
  'Similarities:',bullets('All five pictures are made from the same parts.'),
  'Rule:',bullets('Four pictures are the **same figure turned** to different angles.'),
  'Why the answer fits:',bullets('This figure cannot be turned to match the others: it is a **mirror image** of them (it has been flipped over).'),
  'Red herrings:',bullets('How far each figure has been turned does not matter.')),{challenge:true,alt:()=>`A figure made of a ${shapeName((f[0] as ShapePart).s)} and small parts`});
});}

const ODD_FAMILIES=[oddSides,oddInOut,oddCopy,oddBlackMore,oddMirror];
export const oddOneOut=auditBuild(oddTopic,20,(r,i)=>ODD_FAMILIES[i%ODD_FAMILIES.length](r),{own:true});

// ================================================================ match to a group
const groupTopic:Topic={id:'nv-match-group',subject:NV,strand:'Similarities',title:'Match to a group',helpsheet:{
 intro:'Every picture in the oval follows the same rule. Work out the rule, then find the one option that follows it too.',
 steps:['List what the pictures in the oval have in common: shapes, sides, shading, dots, lines, position, symmetry.','Cross out anything that changes between them: it cannot be the rule.','Test each option against everything the group shares.','Choose the option that fits every shared feature; the others each break at least one.'],
 example:{title:'Which option belongs with the group?',visual:setOf('row',[
  picTile([S('square',50,50,26,'grey'),L(26,26,74,74)],'A grey square with one line'),
  picTile([S('circle',50,50,30,'white'),L(22,50,78,50)],'A white circle with one line'),
  picTile([S('triangle',50,52,30,'dots'),L(50,20,50,78)],'A dotted triangle with one line'),
  picTile([S('hexagon',50,50,30,'grey'),L(22,40,78,40),L(22,60,78,60)],'A grey hexagon with two lines'),
  picTile([S('pentagon',50,52,30,'white'),L(24,52,76,52)],'A white pentagon with one line')],'Three pictures in a group and two more pictures',{labels:['group','group','group','P','Q']}),
  lines:['Each picture in the group has exactly one straight line across it; the shapes and shading all change.','P has two lines, so it does not belong.','Q has one line, so Q belongs with the group.']},
 tips:['A feature shared by only some of the group is not the rule.','Shading, size and turning are often red herrings, but check: if every picture in the group is grey, the answer must be grey too.','Counting rules are common: sides, dots, lines, or how many shapes are black.']}};
const GROUP_PROMPT=`Which picture ${bold('belongs')} with the group in the oval?`;
function groupDraft(m:{family:string;group:Pic[];answer:Pic;wrong:Pic[];explanation:string;challenge?:boolean;rule?:Record<string,unknown>}):Made{
 const c=picChoices(m.answer,m.wrong);
 return {family:m.family,rule:m.rule??{},stem:{items:m.group},pics:c.pics,draft:{prompt:GROUP_PROMPT,visual:setOf('oval',m.group.map(p=>picTile(p,undefined,true)),`A group of ${numWord(m.group.length)} pictures`),
  answer:c.answer,wrong:c.wrong,pictures:c.pictures,explanation:m.explanation,...(m.challenge?{rewardGroup:'challenge' as const}:{})}};
}

const DOT_POOL:ShapeKey[]=['circle','square','pentagon','hexagon','octagon','rectangle'];
function dotPic(k:ShapeKey,n:number,fill:Shade):Pic|null{const s=S(k,50,50,k==='rectangle'?29:30,fill),d=diceIn(s,n);return d&&fits([s,...d],5)?[s,...d]:null;}
const dotFeat=(p:Pic):Feat=>{const s=shapesOf(p)[0],n=dotsOf(p).length,sides=info(s.s).sides;return {kind:s.s,fill:s.fill??'white',sides,sidesOdd:sides%2===1,dots:n,dotsOdd:n%2===1,dotsVsSides:cmp(n,sides)};};
function grpOddDots(r:Rng):Made|null{return attempt(300,()=>{
 const counts=r.shuffle([1,3,5,r.pick([1,3,5])]),kinds=r.sample(DOT_POOL,4),fills=r.shuffle(['white','grey',r.pick(['white','grey']),r.pick(['white','grey'])] as Shade[]);
 const oKinds=r.sample(DOT_POOL,5),oFills=fiveFills(r,['white','grey']),oCounts=[r.pick([1,3,5]),...r.shuffle([2,4,6,r.pick([2,4,6])])];
 const group=kinds.map((k,i)=>dotPic(k,counts[i],fills[i])),opts=oKinds.map((k,i)=>dotPic(k,oCounts[i],oFills[i]));
 if(group.some(g=>!g)||opts.some(o=>!o))return null;
 const g=group as Pic[],o=opts as Pic[];
 if(!sharedFair(g.map(dotFeat),dotFeat(o[0]),o.slice(1).map(dotFeat))||!fairAll([oFills,oKinds.map(k=>info(k).sides)])||!noEcho(g,o))return null;
 return groupDraft({family:'group-odd-dots',group:g,answer:o[0],wrong:o.slice(1),explanation:explain(
  'Similarities:',bullets('Every picture in the group is a shape with dots inside it.'),
  'Rule:',bullets(`The group has ${listWords(counts.map(String))} dots: always an **odd number** of dots.`),
  'Why the answer fits:',bullets(`${cap(the(shapesOf(o[0])[0]))} has ${count(oCounts[0],'dot')}, an odd number.`,'The other options have 2, 4 or 6 dots, which are even numbers.'),
  'Red herrings:',bullets('The shape and its shading change, so they are not the rule.'))});
});}

const MORE_POOL:ShapeKey[]=['triangle','square','rectangle','pentagon','hexagon','house','trapezium'];
type DotPlace='more'|'less'|'none';
function twoShapes(r:Rng,place:DotPlace):{pic:Pic;more:ShapePart;less:ShapePart}|null{return attempt(30,()=>{
 const [a,b]=r.sample(MORE_POOL,2);if(info(a).sides===info(b).sides)return null;
 const slot=SLOTS[r.int(0,3)],first=r.chance(.5),rel=r.pick([-1,0,1]),[pa,pb]=first?[slot[0],slot[1]]:[slot[1],slot[0]],[za,zb]=pairSizes(a,b,rel);
 const sa=S(a,pa[0],pa[1],za,r.pick(['white','grey'])),sb=S(b,pb[0],pb[1],zb,r.pick(['white','grey']));if(!sizeRel(sa,sb))return null;
 const [more,less]=info(a).sides>info(b).sides?[sa,sb]:[sb,sa];let dot:DotPart;
 if(place==='none'){dot=D((pa[0]+pb[0])/2,(pa[1]+pb[1])/2);if(inside(sa,dot.x,dot.y)||inside(sb,dot.x,dot.y)||minEdge(sa,dot.x,dot.y)<8||minEdge(sb,dot.x,dot.y)<8)return null;}
 else{const t=place==='more'?more:less,[x,y]=areaCentre(t);dot=D(x,y);if(!inside(t,x,y,6))return null;}
 const pic=[sa,sb,dot];return fits(pic,5)?{pic,more,less}:null;
});}
const moreFeat=(p:Pic):Feat=>{const [a,b]=shapesOf(p),d=dotsOf(p)[0],inA=inside(a,d.x,d.y),inB=inside(b,d.x,d.y),t=inA?a:inB?b:null,o=t===a?b:a,pl=t?placeWords(t,o):['-','-'];
 return {dotIn:!!t,dotMore:!!t&&info(t.s).sides>info(o.s).sides,dotBigger:t?sizeRel(t,o)??'unclear':'-',dotLeft:pl[0],dotTop:pl[1],dotFill:t?.fill??'none',otherFill:o.fill??'white',
  dotSides:t?info(t.s).sides:-1,otherSides:info(o.s).sides,layout:`${Math.round(a.x)},${Math.round(a.y)}|${Math.round(b.x)},${Math.round(b.y)}`};};
function grpDotMore(r:Rng):Made|null{return attempt(400,()=>{
 const group=[0,1,2,3].map(()=>twoShapes(r,'more'));if(group.some(g=>!g))return null;
 const ans=twoShapes(r,'more'),wrong=(['less','less','none',r.pick(['less','none'])] as DotPlace[]).map(p=>twoShapes(r,p));if(!ans||wrong.some(w=>!w))return null;
 const g=group.map(x=>x!.pic),o=[ans.pic,...wrong.map(w=>w!.pic)];
 if(!sharedFair(g.map(moreFeat),moreFeat(o[0]),o.slice(1).map(moreFeat))||!fairAll([o.map(p=>moreFeat(p).dotBigger),o.map(p=>moreFeat(p).layout)])||!noEcho(g,o))return null;
 return groupDraft({family:'group-dot-more',group:g,answer:o[0],wrong:o.slice(1),explanation:explain(
  'Similarities:',bullets('Every picture in the group has two shapes and one dot.'),
  'Rule:',bullets('The dot is always inside the shape with **more sides**.'),
  'Why the answer fits:',bullets(`The dot is inside the ${shapeName(ans.more.s)} (${count(info(ans.more.s).sides,'side')}), not the ${shapeName(ans.less.s)} (${count(info(ans.less.s).sides,'side')}).`,'In the other options the dot is in the shape with fewer sides, or in neither shape.'),
  'Red herrings:',bullets('Which shape is bigger, where the shapes are and how they are shaded all change.'))});
});}

function grpSymmetry(r:Rng):Made|null{return attempt(300,()=>{
 const figs=[0,1,2,3,4,5,6,7,8].map(()=>symFigure(r));if(figs.some(f=>!f))return null;
 const [g0,g1,g2,g3,ans,...rest]=figs as Pic[],group=[g0,g1,g2,g3],wrong=rest.map(f=>breakSym(r,f));
 if(!group.every(uprightSym)||!uprightSym(ans)||wrong.some(hasMirror))return null;
 if(!group.every(g=>fits(g,4))||!fits(ans,4)||!wrong.every(w=>fits(w,4)))return null;
 const base=(p:Pic)=>shapesOf(p)[0],feat=(p:Pic):Feat=>({kind:base(p).s,fill:base(p).fill??'white',dots:dotsOf(p).length,parts:p.length,sym:uprightSym(p)});
 if(!sharedFair(group.map(feat),feat(ans),wrong.map(feat))||!distinct([...group,ans,...wrong]))return null;
 if(new Set(group.map(g=>base(g).s)).size<4||!fairAll([[ans,...wrong].map(p=>base(p).fill??'white'),[ans,...wrong].map(p=>p.length)])||!noEcho(group,[ans,...wrong]))return null;
 return groupDraft({family:'group-symmetry',group,answer:ans,wrong,challenge:true,explanation:explain(
  'Similarities:',bullets('Every picture in the group is a shape with small parts around it.'),
  'Rule:',bullets('Each picture has an **upright line of symmetry**: the left half is a mirror image of the right half.'),
  'Why the answer fits:',bullets(`The picture with the ${shapeName(base(ans).s)} is symmetrical about an upright line through its middle.`,'Each of the other options has one part moved, shaded differently or missing, so it has no line of symmetry.'),
  'Red herrings:',bullets('The shapes, the shading and the number of small parts change.'))});
});}

const EQ_SPOTS:[number,number][]=[[22,22],[50,22],[78,22],[22,50],[50,50],[78,50],[22,78],[50,78],[78,78]];
function eqPic(r:Rng,black:number,white:number):Pic{const spots=r.sample(EQ_SPOTS,black+white),fills=r.shuffle([...Array(black).fill('black'),...Array(white).fill('white')] as Shade[]);
 return spots.map(([x,y],i)=>{const k=r.pick(['circle','square','triangle'] as ShapeKey[]);return S(k,x,k==='triangle'?y+2:y,k==='square'?8.5:k==='triangle'?11:10,fills[i]);});}
const eqFeat=(p:Pic):Feat=>{const s=shapesOf(p),bl=s.filter(x=>x.fill==='black'),wh=s.filter(x=>x.fill!=='black'),b=bl.length,w=wh.length;
 return {equal:b===w,total:s.length,even:s.length%2===0,black:b,white:w,more:cmp(b,w),blackSame:new Set(bl.map(x=>x.s)).size===1,whiteSame:new Set(wh.map(x=>x.s)).size===1};};
function grpEqual(r:Rng):Made|null{return attempt(300,()=>{
 const ns=r.shuffle([1,2,3,r.pick([1,2,3])]),group=ns.map(n=>eqPic(r,n,n)),n=r.pick([2,3]);
 const wrongCounts=r.shuffle([[n,n+1],[n+1,n],[n+1,n-1],[n-1,n+1],[n,n-1]]).slice(0,4) as [number,number][];
 const ans=eqPic(r,n,n),wrong=wrongCounts.map(([b,w])=>eqPic(r,b,w));
 if(!sharedFair(group.map(eqFeat),eqFeat(ans),wrong.map(eqFeat))||!fairAll([[ans,...wrong].map(p=>p.length)])||!noEcho(group,[ans,...wrong]))return null;
 return groupDraft({family:'group-equal',group,answer:ans,wrong,explanation:explain(
  'Similarities:',bullets('Every picture in the group is made of small black and white shapes.'),
  'Rule:',bullets('Each picture has **the same number of black shapes as white shapes**.'),
  'Why the answer fits:',bullets(`This option has ${numWord(n)} black and ${numWord(n)} white shapes.`,'Every other option has more of one shading than the other.'),
  'Red herrings:',bullets('The kinds of shape, where they are and how many there are altogether all change.'))});
});}

const GROUP_FAMILIES=[grpOddDots,grpDotMore,grpSymmetry,grpEqual];
export const matchGroup=auditBuild(groupTopic,20,(r,i)=>GROUP_FAMILIES[i%GROUP_FAMILIES.length](r),{own:true});

// ================================================================ match to a pair
const pairTopic:Topic={id:'nv-match-pair',subject:NV,strand:'Similarities',title:'Match to a pair',helpsheet:{
 intro:'The two pictures in the pair share a rule. Find it, then choose the option that follows the same rule.',
 steps:['Look at what changes between the two pictures: that part is not the rule.','Look at what stays the same, or how two features are linked (for example, a count that matches another count).','Test every option. The answer keeps everything the pair has in common.'],
 example:{title:'Which option goes best with the pair?',visual:setOf('row',[
  picTile([S('square',50,56,24,'grey'),S('circle',50,18,8,'black')],'A grey square with a small black circle above it'),
  picTile([S('hexagon',50,56,26,'grey'),S('circle',50,18,8,'black')],'A grey hexagon with a small black circle above it'),
  picTile([S('pentagon',50,56,26,'grey'),S('circle',50,90,6,'black')],'A grey pentagon with a small black circle below it'),
  picTile([S('pentagon',50,58,26,'grey'),S('circle',50,18,8,'black')],'A grey pentagon with a small black circle above it')],'A pair of pictures and two more pictures',{labels:['pair','pair','P','Q']}),
  lines:['In both pictures of the pair a small black circle sits above a grey shape.','The big shape changes, so it is not the rule.','In P the circle is below the shape; in Q it is above, so Q goes best with the pair.']},
 tips:['With only two examples, check every feature: shading, counts, position and turning.','If the two pictures share a feature (both grey, say), the answer should share it too.','Relationships are common: the small shape has one side fewer, or the number of lines equals the number of dots.']}};
const PAIR_PROMPT=`Which picture ${bold('goes best')} with the pair?`;
function pairDraft(m:{family:string;pair:Pic[];answer:Pic;wrong:Pic[];explanation:string;challenge?:boolean}):Made{
 const c=picChoices(m.answer,m.wrong);
 return {family:m.family,stem:{items:m.pair},pics:c.pics,draft:{prompt:PAIR_PROMPT,visual:setOf('pair',m.pair.map(p=>picTile(p)),'A pair of pictures'),
  answer:c.answer,wrong:c.wrong,pictures:c.pictures,explanation:m.explanation,...(m.challenge?{rewardGroup:'challenge' as const}:{})}};
}

const P1_OUT:Record<number,ShapeKey[]>={4:['square','rectangle','trapezium'],5:['pentagon','house'],6:['hexagon'],7:['heptagon']};
const P1_IN:Record<number,ShapeKey>={0:'circle',3:'triangle',4:'square',5:'pentagon',6:'hexagon'};
const nestPic=(outer:ShapeKey,inner:ShapeKey,of:Shade,inf:Shade)=>[centreAt(S(outer,50,50,outer==='rectangle'?29:33,of),50,50),centreAt(S(inner,0,0,15,inf),50,50)] as Pic;
/** The small shape sits wholly inside the large one, with a clear gap. */
const nestedClear=(p:Pic)=>{const [o,i]=p as ShapePart[],c=corners(i);for(let k=0;k<c.length;k+=2)if(!inside(o,c[k],c[k+1],3))return false;return true;};
const nestFeat=(p:Pic):Feat=>{const [o,i]=shapesOf(p),so=info(o.s).sides,si=info(i.s).sides;return {diff:so-si,outerOdd:so%2===1,innerOdd:si%2===1,outer:so,inner:si,of:o.fill??'white',inf:i.fill??'white',same:o.s===i.s};};
function pairFewer(r:Rng):Made|null{return attempt(300,()=>{
 const [n1,n2]=r.sample([4,5,6,7],2);if(n1%2===n2%2)return null;
 const na=r.pick([4,5,6,7]),of=r.pick(['white','grey'] as Shade[]),inf=r.pick((['black','white'] as Shade[]).filter(f=>f!==of));
 const pair=[n1,n2].map(n=>nestPic(r.pick(P1_OUT[n]),P1_IN[n-1],of,inf)),ansOuter=r.pick(P1_OUT[na]);
 if(pair.some(p=>shapesOf(p)[0].s===ansOuter))return null;
 const ans=nestPic(ansOuter,P1_IN[na-1],of,inf);
 const wrongPlans:[number,number][]=r.shuffle([[na,na],[na,na-2],[na,na+1],[na-1,na],[na+1,na+1],[na,0]].filter(([o,i])=>P1_OUT[o]&&P1_IN[i]!==undefined&&o!==i+1)).slice(0,4) as [number,number][];
 if(wrongPlans.length<4)return null;
 const wrong=wrongPlans.map(([o,i])=>nestPic(r.pick(P1_OUT[o]),P1_IN[i],of,inf));
 if(![...pair,ans,...wrong].every(nestedClear))return null;
 if(!sharedFair(pair.map(nestFeat),nestFeat(ans),wrong.map(nestFeat))||!distinct([ans,...wrong])||!noEcho(pair,[ans,...wrong]))return null;
 const [ao,ai]=shapesOf(ans);
 return pairDraft({family:'pair-fewer',pair,answer:ans,wrong,explanation:explain(
  'Similarities:',bullets('Each picture in the pair has a small shape inside a large shape, shaded the same way.'),
  'Rule:',bullets('The small shape has **one side fewer** than the large shape.'),
  'Why the answer fits:',bullets(`The ${shapeName(ao.s)} has ${info(ao.s).sides} sides and the ${shapeName(ai.s)} inside it has ${info(ai.s).sides}.`,`In the other options the small shape ${listWords([...new Set(wrongPlans.map(([o,i])=>i===0?'is a circle (no straight sides)':i===o?'has the same number of sides':i>o?`has ${i-o===1?'one side':`${numWord(i-o)} sides`} more`:`has ${numWord(o-i)} sides fewer`))],'or')}.`),
  'Red herrings:',bullets('The kind of large shape changes; only the link between the two shapes matters.'))});
});}

const RAY_BASES:ShapeKey[]=['circle','square','hexagon','pentagon','octagon'];
function rayPic(r:Rng,k:ShapeKey,rays:number,dots:number,fill:Shade):Pic|null{
 // Sizes chosen so every base holds up to five dots in a dice pattern (a smaller pentagon cannot hold three).
 const b=centreAt(S(k,50,50,k==='square'?22:k==='pentagon'?28:26,fill),50,50),d=diceIn(b,dots);if(!d||!rays)return null;
 // Rays use some of five evenly spaced slots: no two point in opposite directions, so two rays never line up and
 // read as a single line drawn through the shape.
 if(rays>5)return null;
 const start=r.int(0,11)*30,slots=r.sample([0,1,2,3,4],rays).sort((x,y)=>x-y),lines=slots.map(i=>{const deg=start+i*72,e=edgeAt(b,deg),a=deg*Math.PI/180;return L(50+(e+2)*Math.cos(a),50+(e+2)*Math.sin(a),50+(e+13)*Math.cos(a),50+(e+13)*Math.sin(a));});
 const pic=[b,...d,...lines];return fits(pic,4)?pic:null;
}
const inLine=(ds:DotPart[])=>ds.length<2?'one':ds.every(d=>Math.abs((ds[1].x-ds[0].x)*(d.y-ds[0].y)-(ds[1].y-ds[0].y)*(d.x-ds[0].x))<1)?'line':'spread';
const rayFeat=(p:Pic):Feat=>{const s=shapesOf(p)[0],n=linesOf(p).length,d=dotsOf(p).length,sides=info(s.s).sides;return {equal:n===d,rays:n,dots:d,raysOdd:n%2===1,dotsOdd:d%2===1,raysVsSides:cmp(n,sides),dotsVsSides:cmp(d,sides),kind:s.s,fill:s.fill??'white',dotsLine:inLine(dotsOf(p))};};
/** The answer's count changes from one rays question to the next (3, 2, 4, 3, 2), so no single count keeps winning. */
const RAY_ANSWER=[3,2,4,3,2];
function pairRays(r:Rng,i=0):Made|null{return attempt(300,()=>{
 const c=RAY_ANSWER[Math.floor(i/4)%RAY_ANSWER.length];
 // The pair's counts differ from the answer's, so the answer cannot be found by copying a count.
 const [a,b]=r.sample([1,2,3,4,5].filter(n=>n!==c),2);if(a%2===b%2)return null;
 const kinds=r.sample(RAY_BASES,2),fills=r.shuffle(['white','grey'] as Shade[]);
 const pair=[rayPic(r,kinds[0],a,a,fills[0]),rayPic(r,kinds[1],b,b,fills[1])];
 const plans:[number,number][]=r.shuffle(([[c,c+1],[c+1,c],[c,c-1],[c-1,c],[c+2,c]] as [number,number][]).filter(([x])=>x<=5)).slice(0,4);
 const oKinds=r.sample(RAY_BASES,5),oFills=fiveFills(r,['white','grey']);
 const opts=[rayPic(r,oKinds[0],c,c,oFills[0]),...plans.map(([x,y],i)=>rayPic(r,oKinds[i+1],x,y,oFills[i+1]))];
 if(pair.some(p=>!p)||opts.some(o=>!o))return null;
 const p=pair as Pic[],o=opts as Pic[];
 if(!sharedFair(p.map(rayFeat),rayFeat(o[0]),o.slice(1).map(rayFeat))||!fairAll([oFills,o.map(x=>linesOf(x).length),o.map(x=>dotsOf(x).length)])||!noEcho(p,o))return null;
 return pairDraft({family:'pair-rays',pair:p,answer:o[0],wrong:o.slice(1),explanation:explain(
  'Similarities:',bullets('Each picture in the pair is a shape with short lines sticking out of it and dots inside it.'),
  'Rule:',bullets(`The number of lines **equals** the number of dots: ${a} and ${a}, then ${b} and ${b}.`),
  'Why the answer fits:',bullets(`This option has ${count(c,'line')} and ${count(c,'dot')}.`,'Every other option has one or two more lines than dots, or the other way round.'),
  'Red herrings:',bullets('The shape in the middle and its shading change from picture to picture.'))});
});}

const NEST_KINDS:ShapeKey[]=['circle','square','hexagon','pentagon','triangle','octagon','heart'];
const nest3=(k:ShapeKey,f:Shade[])=>[36,24,12].map((s,i)=>centreAt(S(k,50,50,k==='triangle'?s*.95:s,f[i]),50,k==='triangle'?53:50)) as Pic;
const PERMS=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
function pairNest(r:Rng):Made|null{return attempt(100,()=>{
 const fills=r.sample(['white','grey','black','stripes'] as Shade[],3),[k1,k2,...rest]=r.sample(NEST_KINDS,7),perm=r.pick(PERMS),order=perm.map(i=>fills[i]);
 const others=r.shuffle(PERMS.filter(p=>p!==perm)).slice(0,4);
 const pair=[nest3(k1,order),nest3(k2,order)],ans=nest3(rest[0],order),wrong=others.map((p,i)=>nest3(rest[i+1]??rest[0],p.map(j=>fills[j])));
 if(![...pair,ans,...wrong].every(p=>fits(p,4))||!noEcho(pair,[ans,...wrong]))return null;
 const words=order.map(f=>f==='stripes'?'striped':f);
 return pairDraft({family:'pair-nest',pair,answer:ans,wrong,explanation:explain(
  'Similarities:',bullets('Each picture in the pair is three copies of one shape, one inside another.'),
  'Rule:',bullets(`The shading goes **${words[0]} outside, ${words[1]} in the middle, ${words[2]} inside**.`),
  'Why the answer fits:',bullets(`The ${plural(shapeName(rest[0]))} are shaded in the same order: ${words.join(', ')}.`,'The other options use the same shadings in a different order.'),
  'Red herrings:',bullets('The kind of shape changes, so it is not the rule.'))});
});}

const DIAG_POOL:ShapeKey[]=['square','rectangle','pentagon','hexagon','house','trapezium','rtrap','quad','pent3','parallelogram'];
type LineKind='diag'|'mid'|'midmid'|'centre';
function diagPic(r:Rng,k:ShapeKey,kind:LineKind,fill:Shade):Pic|null{
 const s=centreAt(S(k,50,50,k==='rectangle'?27:30,fill,r.pick([0,0,90,180])),50,50),c=corners(s),n=c.length/2,i=r.int(0,n-1),pt=(j:number):[number,number]=>[c[2*((j+n)%n)],c[2*((j+n)%n)+1]];
 const mid=(j:number):[number,number]=>{const [a,b]=pt(j),[x,y]=pt(j+1);return [(a+x)/2,(b+y)/2];};
 let a:[number,number],b:[number,number];
 if(kind==='diag'){a=pt(i);b=pt(i+r.int(2,n-2));}
 else if(kind==='mid'){a=pt(i);b=mid(i+r.int(1,n-2));}
 else if(kind==='midmid'){a=mid(i);b=mid(i+r.int(2,n-2));}
 else{a=pt(i);b=areaCentre(s);}
 if(Math.hypot(a[0]-b[0],a[1]-b[1])<22)return null;
 const pic=[s,L(a[0],a[1],b[0],b[1])];return fits(pic,4)?pic:null;
}
const diagFeat=(p:Pic):Feat=>{const s=shapesOf(p)[0],l=linesOf(p)[0],c=corners(s),n=c.length/2,at=(x:number,y:number)=>{for(let j=0;j<n;j++)if(Math.hypot(c[2*j]-x,c[2*j+1]-y)<1)return j;return -1;};
 const i=at(l.x1,l.y1),j=at(l.x2,l.y2),ang=((Math.atan2(l.y2-l.y1,l.x2-l.x1)*180/Math.PI)%180+180)%180;
 return {cornerEnds:(i>=0?1:0)+(j>=0?1:0),joinsCorners:i>=0&&j>=0&&Math.abs(i-j)%n!==1&&Math.abs(i-j)%n!==n-1,dir:ang<20||ang>160?'flat':ang>70&&ang<110?'upright':ang<90?'falling':'rising',kind:s.s,fill:s.fill??'white',sides:n};};
function pairDiag(r:Rng):Made|null{return attempt(300,()=>{
 const kinds=r.sample(DIAG_POOL,7),fill=r.pick(['white','grey'] as Shade[]),plans=r.shuffle(['mid','mid','midmid','centre'] as LineKind[]);
 const pair=[diagPic(r,kinds[0],'diag',fill),diagPic(r,kinds[1],'diag',fill)],ans=diagPic(r,kinds[2],'diag',fill),wrong=plans.map((k,i)=>diagPic(r,kinds[i+3],k,fill));
 if(pair.some(p=>!p)||!ans||wrong.some(w=>!w))return null;
 const p=pair as Pic[],w=wrong as Pic[];
 if(!sharedFair(p.map(diagFeat),diagFeat(ans),w.map(diagFeat))||!fairAll([[ans,...w].map(x=>diagFeat(x).dir),[ans,...w].map(x=>diagFeat(x).sides)])||!noEcho(p,[ans,...w]))return null;
 return pairDraft({family:'pair-diagonal',pair:p,answer:ans,wrong:w,explanation:explain(
  'Similarities:',bullets('Each picture in the pair is a shape with one straight line inside it.'),
  'Rule:',bullets('The line **joins two corners** of the shape that are not next to each other (a diagonal).'),
  'Why the answer fits:',bullets(`The line in the ${shapeName(shapesOf(ans)[0].s)} runs from one corner to another corner.`,'In the other options the line ends in the middle of a side or in the middle of the shape.'),
  'Red herrings:',bullets('The kind of shape and the direction of the line change, so they are not the rule.'))});
});}

const PAIR_FAMILIES:((r:Rng,i:number)=>Made|null)[]=[pairFewer,pairRays,pairNest,pairDiag];
export const matchPair=auditBuild(pairTopic,20,(r,i)=>PAIR_FAMILIES[i%PAIR_FAMILIES.length](r,i),{own:true});
