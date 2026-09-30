import {num,explain,bullets,NAMES,list,cap,type Topic,type BuiltTopic,type Rng} from './bank-kit';
import {shape,rightAngle,angleArc,polygonPoints,type Visual,type Mark,type ShapeName} from './visual';
import {topicSet,choices,pick,words4,fig,text,tidy,sum,range,coordGrid,type Template} from './bank-maths-util';
// Maths, Geometry strand: angles, 2D shapes, 3D shapes and nets, coordinates.
// Pictures never label things A–E, because the answer choices are lettered A–E; unknown angles are x or y, points P, Q, R, S.

const r1=(n:number)=>Math.round(n*10)/10;
/** 'a' or 'an' for the word that follows: an octagon, an 8-sided shape, a hexagon. */
const an=(w:string)=>/^(8|11|18|[aeiou])/i.test(w)?'an':'a';
const rad=(d:number)=>d*Math.PI/180;
/** A point at screen direction d (0 = right, 90 = down) and distance len from (cx, cy). */
const at=(cx:number,cy:number,d:number,len:number):[number,number]=>[r1(cx+len*Math.cos(rad(d))),r1(cy+len*Math.sin(rad(d)))];
/** The arc and its label for the angle swept clockwise from direction a to direction b at (cx, cy). */
function angleMark(cx:number,cy:number,a:number,b:number,s:string,radius=26):Mark[]{
 const span=((b-a)%360+360)%360,mid=a+span/2,lr=radius+(span<35?30:18)+s.length*2,[lx,ly]=at(cx,cy,mid,lr);
 return [span===90?rightAngle(cx,cy,a,14):angleArc(cx,cy,a,b,span<35?radius+10:radius),text(lx,ly+5,s,14,{bold:true,c:s.includes('°')?'ink':'purple'})];
}
const ray=(cx:number,cy:number,d:number,len:number):Mark=>{const [x,y]=at(cx,cy,d,len);return {t:'line',x1:cx,y1:cy,x2:x,y2:y,w:2.4};};

// ───────────────────────── Angles
const angles:Topic={id:'ma-angles',subject:'Maths',strand:'Geometry',title:'Angles',helpsheet:{
 intro:'Angles are measured in degrees (°). Some facts let you work out missing angles without measuring.',
 steps:['Angles on a straight line add up to 180°.','Angles around a point add up to 360°.','The angles in a triangle add up to 180°; in a quadrilateral they add up to 360°.','Where two straight lines cross, the opposite angles are equal.'],
 example:{title:'Find y',visual:fig(300,150,[{t:'line',x1:20,y1:120,x2:280,y2:120,w:2.4},ray(150,120,-58,110),...angleMark(150,120,302,360,'58°'),...angleMark(150,120,180,302,'y')],'A straight line with a ray from a point on it, making two angles'),lines:['The two angles are on a straight line, so they add up to 180°.','y = 180° − 58° = 122°']},
 tips:['Check that your answer looks sensible: an obtuse angle is between 90° and 180°.','Diagrams marked "not drawn to scale" cannot be measured: use the angle facts.','An isosceles triangle has two equal angles, opposite its two equal sides.'],
}};
const angLine:Template=(r,i)=>{
 const cx=160,cy=140,m:Mark[]=[{t:'line',x1:14,y1:cy,x2:306,y2:cy,w:2.4}];
 if(i%2===0){const t=r.pick(range(22,158).filter(x=>Math.abs(x-90)>6)),knownRight=r.chance(.5),known=knownRight?t:180-t,ans=180-known;
  m.push(ray(cx,cy,360-t,120),...angleMark(cx,cy,360-t,360,knownRight?`${t}°`:'x'),...angleMark(cx,cy,180,360-t,knownRight?'x':`${180-t}°`));
  const c=choices(ans,[360-known,known,Math.abs(90-known),ans+10].filter(x=>x>0&&x!==ans),x=>`${x}°`);if(!c)return null;
  return {...c,prompt:'Work out the size of angle x. The diagram is not drawn to scale.',visual:fig(320,165,m,'A straight line with a ray from a point on it, making two angles'),rewardGroup:'quick',
   explanation:explain(bullets('Angles on a straight line add up to 180°.',`x = 180° − ${known}° = ${ans}°`),`If you chose ${360-known}°, you used 360°, which is for angles around a point.`),audit:{k:'expr',e:`#180-${known}`}};}
 const t1=r.int(25,80),t2=r.int(t1+25,155),parts=[t1,t2-t1,180-t2],k=r.int(0,2),ans=parts[k];if(parts.some(p=>p<22))return null;
 m.push(ray(cx,cy,360-t1,120),ray(cx,cy,360-t2,120),...angleMark(cx,cy,360-t1,360,k===0?'x':`${parts[0]}°`),...angleMark(cx,cy,360-t2,360-t1,k===1?'x':`${parts[1]}°`),...angleMark(cx,cy,180,360-t2,k===2?'x':`${parts[2]}°`));
 const known=parts.filter((_,j)=>j!==k),c=choices(ans,[360-known[0]-known[1],180-known[0],180-known[1],ans+10].filter(x=>x>0&&x!==ans),x=>`${x}°`);if(!c)return null;
 return {...c,prompt:'Work out the size of angle x. The diagram is not drawn to scale.',visual:fig(320,165,m,'A straight line with two rays from one point on it, making three angles'),
  explanation:explain(bullets('The three angles lie on a straight line, so they add up to 180°.',`x = 180° − ${known[0]}° − ${known[1]}° = ${ans}°`)),audit:{k:'expr',e:`#180-${known[0]}-${known[1]}`}};
};
const angPoint:Template=r=>{
 const n=r.pick([3,4]),parts:number[]=[];let left=360;for(let k=0;k<n-1;k++){const p=r.int(40,Math.min(170,left-40*(n-1-k)));parts.push(p);left-=p;}parts.push(left);if(parts.some(p=>p<40||p>200||p===180))return null;
 const k=r.int(0,n-1),ans=parts[k],start=r.int(0,359),cx=150,cy=130,m:Mark[]=[];let d=start;
 parts.forEach((p,j)=>{m.push(ray(cx,cy,d,100),...angleMark(cx,cy,d,d+p,j===k?'x':`${p}°`,24));d+=p;});
 const known=parts.filter((_,j)=>j!==k),c=choices(ans,[180-sum(known)>0?180-sum(known):sum(known)-180,sum(known),ans+10,ans-10].filter(x=>x>0&&x!==ans),x=>`${x}°`);if(!c)return null;
 return {...c,prompt:'Work out the size of angle x. The diagram is not drawn to scale.',visual:fig(300,260,m,`${n} lines from one point, making ${n} angles around it`),
  explanation:explain(bullets('Angles around a point add up to 360°.',`x = 360° − ${known.map(x=>`${x}°`).join(' − ')} = ${ans}°`)),audit:{k:'expr',e:`#360-${known.join('-')}`}};
};
/** A triangle drawn from its angles at the bottom-left (a) and bottom-right (b); labels sit inside each corner. */
function triangleAngles(a:number,b:number,labels:[string,string,string],o:{ticks?:boolean}={}):Visual{
 const L=240,ta=Math.tan(rad(a)),tb=Math.tan(rad(b)),px=L*tb/(ta+tb),py=px*ta,s=Math.min(1,150/py),W=L*s,x0=30,y0=20+py*s,A:[number,number]=[x0,y0],B:[number,number]=[x0+W,y0],C:[number,number]=[r1(x0+px*s),r1(y0-py*s)],m:Mark[]=[];
 m.push({t:'poly',pts:[...A,...B,...C],fill:'pale',w:2.2});
 // Labels move towards the middle of the triangle; sharper corners push them further in so they clear the sides.
 const lab=(p:[number,number],s0:string,toward:[number,number],ang:number)=>{const dx=toward[0]-p[0],dy=toward[1]-p[1],d=Math.hypot(dx,dy),k=Math.min(d*.8,32+Math.max(0,60-ang)*.6);m.push(text(p[0]+dx/d*k,p[1]+dy/d*k+5,s0,14,{bold:true,c:s0.includes('°')?'ink':'purple'}));};
 const G:[number,number]=[(A[0]+B[0]+C[0])/3,(A[1]+B[1]+C[1])/3];lab(A,labels[0],G,a);lab(B,labels[1],G,b);lab(C,labels[2],G,180-a-b);
 if(Math.abs(a+b-90)<0.01)m.push(rightAngle(C[0],C[1],Math.atan2(B[1]-C[1],B[0]-C[0])*180/Math.PI,12));
 if(o.ticks){for(const [p,q] of [[A,C],[B,C]] as [[number,number],[number,number]][]){const mx=(p[0]+q[0])/2,my=(p[1]+q[1])/2,dx=q[0]-p[0],dy=q[1]-p[1],d=Math.hypot(dx,dy);m.push({t:'line',x1:r1(mx-dy/d*7),y1:r1(my+dx/d*7),x2:r1(mx+dy/d*7),y2:r1(my-dx/d*7),w:2});}}
 return fig(x0*2+W,y0+20,m,o.ticks?'An isosceles triangle with two equal sides marked':'A triangle with its angles marked');
}
const angTriangle:Template=(r,i)=>{
 const kind=i%3;
 if(kind===0){const a=r.int(30,95),b=r.int(30,Math.min(110,150-a)),c=180-a-b;if(c<20||Math.abs(a+b-90)<1)return null;const k=r.int(0,2),ang=[a,b,c],ans=ang[k],known=ang.filter((_,j)=>j!==k);
  const ch=choices(ans,[360-sum(known),sum(known),90-known[0]>0?90-known[0]:ans+20,ans+10].filter(x=>x>0&&x!==ans),x=>`${x}°`);if(!ch)return null;
  return {...ch,prompt:'Work out the size of angle x in this triangle. The diagram is not drawn to scale.',visual:triangleAngles(a,b,ang.map((v,j)=>j===k?'x':`${v}°`) as [string,string,string]),
   explanation:explain(bullets('The angles in a triangle add up to 180°.',`x = 180° − ${known[0]}° − ${known[1]}° = ${ans}°`)),audit:{k:'expr',e:`#180-${known[0]}-${known[1]}`}};}
 if(kind===1){const apex=r.int(20,110),base=(180-apex)/2;if(!Number.isInteger(base))return null;const askApex=r.chance(.4),ans=askApex?apex:base;
  const ch=choices(ans,askApex?[180-base,180-2*base+10,base,90-base>0?90-base:ans+15]:[180-apex,apex,(180-apex)/3,90-apex/2+10].filter(x=>Number.isInteger(x)),x=>`${x}°`);if(!ch)return null;
  return {...ch,prompt:`This triangle is isosceles: the marked sides are equal. Work out the size of angle x. The diagram is not drawn to scale.`,visual:triangleAngles(base,base,askApex?[`${base}°`,'','x']:['x','',`${apex}°`],{ticks:true}),rewardGroup:'challenge',
   explanation:explain(bullets('In an isosceles triangle, the two angles at the ends of the equal sides are equal.',askApex?`The other base angle is also ${base}°, so x = 180° − ${base}° − ${base}° = ${apex}°`:`The two equal angles share 180° − ${apex}° = ${180-apex}°, so x = ${180-apex}° ÷ 2 = ${base}°.`)),
   audit:{k:'expr',e:askApex?`#180-${base}-${base}`:`(#180-${apex})/#2`}};}
 const a=r.int(20,70),b=90-a,k=r.int(0,1),ans=[a,b][k],known=[a,b][1-k];
 const ch=choices(ans,[180-known,known,90+known,ans+10].filter(x=>x>0&&x!==ans),x=>`${x}°`);if(!ch)return null;
 return {...ch,prompt:'This triangle has a right angle. Work out the size of angle x. The diagram is not drawn to scale.',visual:triangleAngles(a,b,[k===0?'x':`${a}°`,k===1?'x':`${b}°`,'']),
  explanation:explain(bullets('The angles in a triangle add up to 180°, and the right angle is 90°.',`x = 180° − 90° − ${known}° = ${ans}°`),`If you chose ${180-known}°, you forgot the right angle.`),audit:{k:'expr',e:`#180-#90-${known}`}};
};
const angCross:Template=r=>{
 const t=r.pick(range(28,152).filter(x=>Math.abs(x-90)>8)),d0=r.int(-20,20),cx=160,cy=110,m:Mark[]=[];
 m.push({t:'line',...(([x1,y1],[x2,y2])=>({x1,y1,x2,y2}))(at(cx,cy,d0,140),at(cx,cy,d0+180,140)),w:2.4},{t:'line',...(([x1,y1],[x2,y2])=>({x1,y1,x2,y2}))(at(cx,cy,d0+t,120),at(cx,cy,d0+t+180,120)),w:2.4});
 const opposite=r.chance(.5),ans=opposite?t:180-t;
 m.push(...angleMark(cx,cy,d0,d0+t,`${t}°`),...(opposite?angleMark(cx,cy,d0+180,d0+t+180,'x'):angleMark(cx,cy,d0+t,d0+180,'x')));
 const c=choices(ans,[opposite?180-t:t,360-t,Math.abs(90-t),ans+10].filter(x=>x>0&&x!==ans),x=>`${x}°`);if(!c)return null;
 return {...c,prompt:'Two straight lines cross. Work out the size of angle x. The diagram is not drawn to scale.',visual:fig(320,220,m,'Two straight lines crossing at a point'),rewardGroup:'quick',
  explanation:explain(opposite?bullets('Angle x is opposite the marked angle.','Vertically opposite angles are equal, so x = '+t+'°.'):bullets('Angle x and the marked angle lie on a straight line.',`x = 180° − ${t}° = ${ans}°`)),
  audit:{k:'expr',e:opposite?`${t}`:`#180-${t}`}};
};
/** A convex quadrilateral with the given interior angles (in order), built by turning at each corner. */
function quadFromAngles(r:Rng,ang:number[]):[number,number][]|null{
 for(let tries=0;tries<40;tries++){const dirs=[0];for(let k=0;k<3;k++)dirs.push(dirs[k]+180-ang[k+1]);const s1=r.int(90,170),s2=r.int(70,150);
  const v=(d:number):[number,number]=>[Math.cos(rad(d)),-Math.sin(rad(d))],[a1,b1]=v(dirs[0]),[a2,b2]=v(dirs[1]),[a3,b3]=v(dirs[2]),[a4,b4]=v(dirs[3]);
  const rx=-(s1*a1+s2*a2),ry=-(s1*b1+s2*b2),det=a3*b4-a4*b3;if(Math.abs(det)<1e-6)continue;const s3=(rx*b4-ry*a4)/det,s4=(a3*ry-b3*rx)/det;if(s3<50||s4<50)continue;
  const pts:[number,number][]=[[0,0]];[[s1,dirs[0]],[s2,dirs[1]],[s3,dirs[2]]].forEach(([s,d])=>{const [x,y]=pts.at(-1)!,[dx,dy]=v(d);pts.push([x+s*dx,y+s*dy]);});return pts;}
 return null;
}
const angPolygon:Template=(r,i)=>{
 if(i%2===0){const a=r.int(60,130),b=r.int(60,130),a3=r.int(60,130),d=360-a-b-a3;if(d<50||d>170)return null;const ang=[a,b,a3,d],k=r.int(0,3),ans=ang[k];
  const pts=quadFromAngles(r,[ang[0],ang[1],ang[2],ang[3]]);if(!pts)return null;const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),mx=Math.min(...xs),my=Math.min(...ys),P=pts.map(([x,y])=>[r1(x-mx+50),r1(y-my+40)] as [number,number]);
  const G:[number,number]=[sum(P.map(p=>p[0]))/4,sum(P.map(p=>p[1]))/4],m:Mark[]=[{t:'poly',pts:P.flat(),fill:'pale',w:2.2}];
  P.forEach((p,j)=>{const dx=G[0]-p[0],dy=G[1]-p[1],dd=Math.hypot(dx,dy);m.push(text(p[0]+dx/dd*34,p[1]+dy/dd*34+5,j===k?'x':`${ang[j]}°`,14,{bold:true,c:j===k?'purple':'ink'}));});
  const known=ang.filter((_,j)=>j!==k),c=choices(ans,[180-sum(known)>0?180-sum(known):ans+20,540-sum(known)<180?540-sum(known):ans-10,ans+10].filter(x=>x>0&&x!==ans),x=>`${x}°`);if(!c)return null;
  return {...c,prompt:'Work out the size of angle x in this quadrilateral. The diagram is not drawn to scale.',visual:fig(Math.max(...P.map(p=>p[0]))+50,Math.max(...P.map(p=>p[1]))+40,m,'A quadrilateral with three of its angles marked'),
   explanation:explain(bullets('The angles in a quadrilateral add up to 360°.',`x = 360° − ${known.map(x=>`${x}°`).join(' − ')} = ${ans}°`)),audit:{k:'expr',e:`#360-${known.join('-')}`}};}
 const [n,name]=r.pick([[5,'pentagon'],[6,'hexagon'],[8,'octagon'],[10,'decagon']] as const),total=(n-2)*180,ans=total/n;
 const c=choices(ans,[360/n,total,(n-3)*180/n,ans+12].filter(x=>Number.isInteger(x)&&x>0&&x!==ans),x=>`${num(x)}°`);if(!c)return null;
 return {...c,prompt:`What is the size of each interior angle of a regular ${name}?`,visual:fig(170,170,[{t:'poly',pts:polygonPoints(n,85,85,72,n%2?0:180/n),fill:'pale',w:2.2}],`A regular ${name}`),rewardGroup:'challenge',
  explanation:explain(bullets(`A ${name} can be split into ${n-2} triangles from one corner, so its angles add up to ${n-2} × 180° = ${num(total)}°.`,`It is regular, so all ${n} angles are equal: ${num(total)}° ÷ ${n} = ${num(ans)}°.`),`${num(360/n)}° is the exterior angle, not the interior angle.`),
  audit:{k:'regularAngle',n}};
};
const angClock:Template=(r,i)=>{
 if(i%2===0){const h=r.int(1,11),half=r.chance(.4),m=half?30:0,hourDeg=(h%12)*30+(half?15:0),minDeg=m*6,diff=Math.abs(hourDeg-minDeg),ans=Math.min(diff,360-diff);if(ans===180||ans===0)return null;
  const naive=half?Math.min(Math.abs((h%12)*30-180),360-Math.abs((h%12)*30-180)):null,c=choices(ans,[360-ans,naive,ans+15,ans-15].filter((x):x is number=>x!==null&&x>0&&x!==ans),x=>`${x}°`);if(!c)return null;
  return {...c,prompt:'What is the smaller angle between the hands of this clock?',visual:{kind:'clock',h,m,alt:'An analogue clock face'},
   explanation:explain(bullets('A full turn is 360° and there are 12 numbers, so each gap between numbers is 30°.',half?`At half past, the hour hand is halfway between ${h} and ${h%12+1}, and the minute hand points at 6.`:`The hands point at ${h} and 12.`,`The smaller angle between them is ${ans}°.`),half?'Remember the hour hand moves on as the minutes go by.':null),
   audit:{k:'clockAngle'}};}
 const deg=r.pick([r.int(10,85),90,r.int(95,175),180,r.int(185,355)]),type=deg<90?'acute':deg===90?'a right angle':deg<180?'obtuse':deg===180?'a straight angle':'reflex';
 const o=words4(type,['acute','a right angle','obtuse','reflex','a straight angle'].filter(t=>t!==type));if(!o)return null;
 return {...o,prompt:`What type of angle is **${deg}°**?`,rewardGroup:'quick',
  explanation:explain(bullets('Acute: less than 90°. Right angle: exactly 90°. Obtuse: between 90° and 180°.','Straight angle: exactly 180°. Reflex: between 180° and 360°.'),`${deg}° is ${type}.`),
  audit:{k:'angleType'}};
};

// ───────────────────────── 2D shapes
const shapes2d:Topic={id:'ma-2d-shapes',subject:'Maths',strand:'Geometry',title:'2D shapes and their properties',helpsheet:{
 intro:'2D shapes are described by their sides, angles, parallel lines and lines of symmetry.',
 steps:['Count the sides and corners, and look for equal sides (marked with small dashes).','Parallel sides never meet; perpendicular sides meet at a right angle.','A line of symmetry folds the shape onto itself exactly.','A regular polygon has all its sides equal and all its angles equal.'],
 example:{title:'A rhombus',visual:fig(240,130,[{t:'poly',pts:[40,110,140,110,200,30,100,30],fill:'pale',w:2.2}],'A rhombus leaning to the right'),lines:['4 equal sides.','2 pairs of parallel sides.','Opposite angles are equal, but there are no right angles.','2 lines of symmetry (along its diagonals) when it is not a square.']},
 tips:['A square is a special rectangle and a special rhombus.','A trapezium has exactly one pair of parallel sides.','Diameter = 2 × radius.'],
}};
// Some schools define shapes inclusively (a rectangle is also a parallelogram, and a trapezium is any quadrilateral with at
// least one pair of parallel sides). A wrong option must be wrong under either definition, so `alsoTrue` names are never
// offered. They are removed after the shuffle, which keeps the random sequence, and so every other question, unchanged.
const QUAD_CLUES:{clue:string;ans:string;avoid:string[];alsoTrue:string[]}[]=[
 {clue:'I have exactly one pair of parallel sides.',ans:'trapezium',avoid:[],alsoTrue:[]},
 {clue:'One pair of my sides is parallel, but the other pair is not.',ans:'trapezium',avoid:['rhombus','kite'],alsoTrue:[]},
 {clue:'I have four right angles, but my sides are not all the same length.',ans:'rectangle',avoid:['parallelogram'],alsoTrue:['trapezium']},
 {clue:'I have two pairs of equal sides next to each other, no parallel sides and one line of symmetry.',ans:'kite',avoid:[],alsoTrue:[]},
 {clue:'My opposite sides are parallel and equal, I have no right angles, and my sides are not all equal.',ans:'parallelogram',avoid:[],alsoTrue:['trapezium']},
];
const s2Quad:Template=r=>{
 const q=r.pick(QUAD_CLUES),all=['square','rectangle','rhombus','parallelogram','trapezium','kite'].filter(s=>s!==q.ans&&!q.avoid.includes(s)),o=words4(q.ans,r.shuffle(all).filter(s=>!q.alsoTrue.includes(s)).slice(0,3));if(!o)return null;
 return {...o,prompt:`Which quadrilateral am I? ${q.clue}`,rewardGroup:'standard',
  explanation:explain(`A ${q.ans} fits every part of the clue.`,bullets(...o.wrong.map(w=>`A ${w} ${({square:'has four equal sides and four right angles',rectangle:'has four right angles and two pairs of parallel sides',rhombus:'has four equal sides and two pairs of parallel sides',parallelogram:'has two pairs of parallel sides',trapezium:'has exactly one pair of parallel sides',kite:'has two pairs of equal sides next to each other and no parallel sides'} as Record<string,string>)[w]}.`))),
  audit:{k:'quadClue',clue:q.clue}};
};
const SYM:[ShapeName,number,string][]=[['triangle',3,'equilateral triangle'],['square',4,'square'],['rectangle',2,'rectangle'],['pentagon',5,'regular pentagon'],['hexagon',6,'regular hexagon'],['octagon',8,'regular octagon'],['kite',1,'kite'],['trapezium',1,'isosceles trapezium'],['parallelogram',0,'parallelogram'],['heptagon',7,'regular heptagon']];
const s2Symmetry:Template=r=>{
 const [s,n,name]=r.pick(SYM),c=choices(n,[n===0?2:n*2,n+1,n===4?2:4,n===0?1:0,n===2?4:2].filter(x=>x!==n));if(!c)return null;
 return {...c,prompt:`How many lines of symmetry does this ${name} have?`,visual:fig(180,160,[shape(s,{x:90,y:80,size:58,fill:'pale'})],`${cap(an(name))} ${name}`),rewardGroup:'quick',
  explanation:explain(n===0?`A parallelogram (that is not a rectangle or rhombus) has no lines of symmetry: folding it along any line does not make the halves match.`:`${cap(an(name))} ${name} has ${n} line${n>1?'s':''} of symmetry.`,s==='rectangle'?'The diagonals of a rectangle are not lines of symmetry.':s==='kite'?'Its only line of symmetry goes from the top corner to the bottom corner.':null),
  audit:{k:'symmetry',shape:s}};
};
const s2Circles:Template=r=>{
 const n=r.int(2,4),rr=r.int(2,9),kind=r.int(0,1),u=Math.min(26,300/(2*rr*n))*1,R=rr*u,m:Mark[]=[{t:'rect',x:20,y:20,w:2*R*n,h:2*R,fill:'white',sw:2.2}];
 for(let k=0;k<n;k++)m.push({t:'circle',x:r1(20+R+2*R*k),y:r1(20+R),r:r1(R),fill:'pale',w:2});
 m.push({t:'line',x1:r1(20+R),y1:r1(20+R),x2:r1(20+2*R),y2:r1(20+R),w:1.6,dash:true},text(20+1.5*R,20+R-6,`${rr} cm`,13,{bold:true}));
 const L=2*rr*n,W=2*rr,ans=kind===0?L:2*(L+W),c=choices(ans,kind===0?[rr*n,L/2+rr,2*L]:[2*(rr*n+rr),L+W,2*L+W].filter(x=>x!==ans),x=>`${num(x)} cm`);if(!c)return null;
 return {...c,prompt:`${cap(['two','three','four'][n-2])} identical circles fit exactly inside a rectangle. The radius of each circle is ${rr} cm. What is the ${kind===0?'length':'perimeter'} of the rectangle?`,visual:fig(40+2*R*n,40+2*R,m,`${n} identical circles in a row inside a rectangle`),rewardGroup:kind===0?'standard':'challenge',
  explanation:explain(bullets(`The diameter of each circle is 2 × ${rr} = ${2*rr} cm.`,`Length: ${n} × ${2*rr} = ${L} cm${kind===1?`; width: ${W} cm`:''}.`,...(kind===1?[`Perimeter: 2 × (${L} + ${W}) = ${ans} cm`]:[])),`${rr*n} cm uses the radius instead of the diameter.`),
  audit:{k:'circlesRect',ask:kind===0?'length':'perimeter'}};
};
const POLY_NAMES:Record<number,string>={3:'triangle',4:'quadrilateral',5:'pentagon',6:'hexagon',7:'heptagon',8:'octagon',9:'nonagon',10:'decagon',12:'dodecagon'};
const s2Names:Template=(r,i)=>{
 const n=r.pick([5,6,7,8,9,10]),ans=POLY_NAMES[n],o=words4(ans,[POLY_NAMES[n-1],POLY_NAMES[n+1]??POLY_NAMES[n-2],POLY_NAMES[n===8?6:8],POLY_NAMES[n===9?10:9]].filter(x=>x&&x!==ans));if(!o)return null;
 if(i%2===0)return {...o,prompt:`A polygon has ${n} straight sides. What is it called?`,rewardGroup:'quick',explanation:explain(bullets('pentagon 5, hexagon 6, heptagon 7, octagon 8, nonagon 9, decagon 10'),`So ${an(String(n))} ${n}-sided polygon is ${an(ans)} ${ans}.`),audit:{k:'polyName',n}};
 return {...o,prompt:'What is the name of this polygon?',visual:fig(180,180,[{t:'poly',pts:polygonPoints(n,90,90,72,r.int(0,30)),fill:'pale',w:2.2}],'A regular polygon'),rewardGroup:'quick',explanation:explain(`Count the sides: there are ${n}.`,`${cap(an(String(n)))} ${n}-sided polygon is ${an(ans)} ${ans}.`),audit:{k:'polyName',n,picture:true}};
};
const s2Triangles:Template=r=>{
 const kind=r.int(0,2);let ang:number[];
 if(kind===0)ang=[60,60,60];else if(kind===1){const t=r.int(20,110);if((180-t)%2||t===60||(180-t)/2===90)return null;ang=r.shuffle([t,(180-t)/2,(180-t)/2]);}
 else{const a=r.int(25,80),b=r.int(25,100),c=180-a-b;if(c<20||new Set([a,b,c]).size<3||[a,b,c].includes(90))return null;ang=[a,b,c];}
 // An equilateral triangle also counts as isosceles in many books (at least two equal sides), so "isosceles" is never a
 // wrong option for it: "obtuse-angled" takes its place.
 if(ang.includes(90))return null;const ans=['equilateral','isosceles','scalene'][kind],o=words4(ans,(kind===0?['scalene','right-angled','obtuse-angled']:['equilateral','isosceles','scalene','right-angled']).filter(x=>x!==ans));if(!o)return null;
 return {...o,prompt:`A triangle has angles of ${list(ang.map(a=>`${a}°`))}. What type of triangle is it?`,
  explanation:explain(bullets(kind===0?'All three angles are equal, so all three sides are equal.':kind===1?'Two of the angles are equal, so two of the sides are equal.':'All three angles are different, so all three sides are different.',`It is ${an(ans)} ${ans} triangle.`),kind===0?'It has no angle of 90° or more, so it is not right-angled or obtuse-angled.':'It has no 90° angle, so it is not right-angled.'),
  audit:{k:'triangleType'}};
};
const s2Regular:Template=r=>{
 const [n,name]=r.pick([[5,'pentagon'],[6,'hexagon'],[8,'octagon'],[3,'triangle'],[10,'decagon']] as const),side=r.int(3,15),P=n*side,ask=r.chance(.5);
 const c=ask?choices(side,[P/(n+1),P/(n-1),P-n,P/4].filter(x=>Number.isInteger(x)&&x!==side),x=>`${num(x)} cm`):choices(P,[side*(n+1),side*(n-1),side*4,side+n].filter(x=>x!==P),x=>`${num(x)} cm`);if(!c)return null;
 const nm=n===3?'equilateral triangle':`regular ${name}`;
 return {...c,prompt:ask?`${cap(an(nm))} ${nm} has a perimeter of ${P} cm. How long is each side?`:`Each side of ${an(nm)} ${nm} is ${side} cm long. What is its perimeter?`,rewardGroup:'quick',
  explanation:explain(bullets(`${cap(an(nm))} ${nm} has ${n} equal sides.`,ask?`${P} ÷ ${n} = ${side} cm`:`${n} × ${side} = ${P} cm`)),audit:{k:'regularPerim',n}};
};

// ───────────────────────── 3D shapes and nets
const shapes3d:Topic={id:'ma-3d-shapes',subject:'Maths',strand:'Geometry',title:'3D shapes and nets',helpsheet:{
 intro:'A 3D shape has faces (flat surfaces), edges (where two faces meet) and vertices (corners). A net is the flat shape that folds up to make it.',
 steps:['Count faces, then edges, then vertices, and remember the hidden ones at the back.','A prism has the same shape at both ends, joined by rectangles.','A pyramid has a base and triangles that meet at one point at the top.','To test a net, imagine folding it: no two faces may land on the same side.'],
 example:{title:'A triangular prism',visual:prismFig(3),lines:['2 triangular faces and 3 rectangular faces: 5 faces.','3 edges on each triangle and 3 joining them: 9 edges.','3 vertices on each triangle: 6 vertices.']},
 tips:['A cube has 6 faces, 12 edges and 8 vertices.','For any of these shapes, faces + vertices − edges = 2: use it to check your counts.','A cube net has 6 squares. Four in a row, with one square above the row and one below it, always works.'],
}};
type V3=[number,number,number];
/** A solid drawn in an oblique view (depth goes up and to the right). A face is seen when its outward normal points towards
 *  the viewer; edges that only touch hidden faces are dashed. Faces list corner indices. */
function solidFig(vs:V3[],faces:number[][],alt:string,w=230,h=180):Visual{
 const proj=(p:V3):[number,number]=>[p[0]+p[2]*.45,-p[1]-p[2]*.32],view:V3=[.45,.32,-1],C:V3=[0,1,2].map(k=>sum(vs.map(v=>v[k]))/vs.length) as V3;
 const sub=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],dot=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],crossV=(a:V3,b:V3):V3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 const seen=faces.map(fc=>{const c:V3=[0,1,2].map(k=>sum(fc.map(i=>vs[i][k]))/fc.length) as V3;let n=crossV(sub(vs[fc[1]],vs[fc[0]]),sub(vs[fc[2]],vs[fc[0]]));if(dot(n,sub(c,C))<0)n=[-n[0],-n[1],-n[2]];return dot(n,view)>1e-9;});
 const edges=new Map<string,{a:number;b:number;seen:boolean}>();faces.forEach((fc,j)=>fc.forEach((i,k)=>{const i2=fc[(k+1)%fc.length],key=[i,i2].sort((x,y)=>x-y).join('-'),e=edges.get(key)??{a:i,b:i2,seen:false};e.seen=e.seen||seen[j];edges.set(key,e);}));
 const P=vs.map(proj),xs=P.map(p=>p[0]),ys=P.map(p=>p[1]),sc=Math.min((w-40)/(Math.max(...xs)-Math.min(...xs)),(h-40)/(Math.max(...ys)-Math.min(...ys))),S=P.map(([x,y])=>[r1(20+(x-Math.min(...xs))*sc),r1(20+(y-Math.min(...ys))*sc)] as [number,number]);
 const m:Mark[]=[];faces.forEach((fc,j)=>{if(seen[j])m.push({t:'poly',pts:fc.flatMap(i=>S[i]),fill:'pale',w:0});});
 for(const e of edges.values())if(!e.seen)m.push({t:'line',x1:S[e.a][0],y1:S[e.a][1],x2:S[e.b][0],y2:S[e.b][1],w:1.6,dash:true});
 for(const e of edges.values())if(e.seen)m.push({t:'line',x1:S[e.a][0],y1:S[e.a][1],x2:S[e.b][0],y2:S[e.b][1],w:2.2});
 return fig(w,h,m,alt);
}
/** A prism whose ends are regular polygons with n sides (n = 4 draws a cuboid). */
function prismFig(n:number):Visual{
 const R=50,D=n===4?80:70,ring=range(0,n-1).map(k=>{const t=rad(90+k*360/n+(n===4?45:0));return [R*Math.cos(t),R*Math.sin(t)];}),vs:V3[]=[...ring.map(([x,y])=>[x,y,0] as V3),...ring.map(([x,y])=>[x,y,D] as V3)];
 const faces=[range(0,n-1),range(n,2*n-1),...range(0,n-1).map(k=>[k,(k+1)%n,n+(k+1)%n,n+k])];
 return solidFig(vs,faces,`A prism with ${POLY_NAMES[n]} ends`);
}
/** A pyramid on a regular polygon base with n sides. */
function pyramidFig(n:number):Visual{
 const R=60,H=85,vs:V3[]=[...range(0,n-1).map(k=>{const t=rad(-90+k*360/n+(n===4?45:0));return [R*Math.cos(t),0,R*Math.sin(t)] as V3;}),[0,H,0]];
 const faces=[range(0,n-1),...range(0,n-1).map(k=>[k,(k+1)%n,n])];
 return solidFig(vs,faces,`A pyramid with a ${POLY_NAMES[n]} base`);
}
const FEV:Record<string,[number,number,number]>={'cube':[6,12,8],'cuboid':[6,12,8],'triangular prism':[5,9,6],'pentagonal prism':[7,15,10],'hexagonal prism':[8,18,12],'square-based pyramid':[5,8,5],'triangular-based pyramid':[4,6,4],'pentagonal pyramid':[6,10,6]};
const s3Count:Template=r=>{
 const [name,pic]=r.pick([['triangular prism',()=>prismFig(3)],['pentagonal prism',()=>prismFig(5)],['hexagonal prism',()=>prismFig(6)],['square-based pyramid',()=>pyramidFig(4)],['triangular-based pyramid',()=>pyramidFig(3)],['pentagonal pyramid',()=>pyramidFig(5)],['cuboid',()=>prismFig(4)]] as const),[F,E,V]=FEV[name],what=r.pick(['faces','edges','vertices'] as const),ans={faces:F,edges:E,vertices:V}[what];
 const c=choices(ans,[F,E,V,ans+2,ans-2,E+F].filter(x=>x!==ans&&x>0));if(!c)return null;
 return {...c,prompt:`This is a ${name}. How many **${what}** does it have?`,visual:pic(),
  explanation:explain(bullets(`A ${name} has ${F} faces, ${E} edges and ${V} vertices.`),`Check: faces + vertices − edges = ${F} + ${V} − ${E} = 2.`,what==='edges'?'Dashed lines show the edges you cannot see from the front.':null),
  audit:{k:'fev',shape:name,what}};
};
/** Rolls a cube over a net of squares; returns the face each square lands on (a valid net uses all six). */
export function foldNet(cells:[number,number][]){
 const key=(c:[number,number])=>`${c[0]},${c[1]}`,idx=new Map(cells.map((c,k)=>[key(c),k])),face=new Array(cells.length).fill(''),start={bottom:'1',top:'6',north:'2',south:'5',east:'3',west:'4'};
 const stack:[number,typeof start][]=[[0,start]];face[0]=start.bottom;
 while(stack.length){const [k,o]=stack.pop()!;const [x,y]=cells[k];
  const moves:[number,number,typeof start][]=[[1,0,{...o,bottom:o.east,east:o.top,top:o.west,west:o.bottom}],[-1,0,{...o,bottom:o.west,west:o.top,top:o.east,east:o.bottom}],[0,-1,{...o,bottom:o.north,north:o.top,top:o.south,south:o.bottom}],[0,1,{...o,bottom:o.south,south:o.top,top:o.north,north:o.bottom}]];
  for(const [dx,dy,no] of moves){const j=idx.get(key([x+dx,y+dy]));if(j===undefined||face[j])continue;face[j]=no.bottom;stack.push([j,no]);}}
 return face;
}
const isCubeNet=(cells:[number,number][])=>new Set(foldNet(cells)).size===6;
/** A random connected shape of six squares, moved so its corner is at (0, 0). */
function hexomino(r:Rng):[number,number][]{const cells:[number,number][]=[[0,0]];while(cells.length<6){const [x,y]=r.pick(cells),[dx,dy]=r.pick([[1,0],[-1,0],[0,1],[0,-1]] as [number,number][]),n:[number,number]=[x+dx,y+dy];if(!cells.some(c=>c[0]===n[0]&&c[1]===n[1]))cells.push(n);}
 const mx=Math.min(...cells.map(c=>c[0])),my=Math.min(...cells.map(c=>c[1]));return cells.map(([x,y])=>[x-mx,y-my] as [number,number]).sort((a,b)=>a[1]-b[1]||a[0]-b[0]);}
const netKey=(cells:[number,number][])=>cells.map(c=>c.join(',')).join(';');
function netFig(cells:[number,number][],labels?:string[],u=26):Visual{
 const w=Math.max(...cells.map(c=>c[0]))+1,h=Math.max(...cells.map(c=>c[1]))+1,m:Mark[]=[];
 cells.forEach(([x,y],k)=>{m.push({t:'rect',x:6+x*u,y:6+y*u,w:u,h:u,fill:'pale',sw:1.8});if(labels)m.push(text(6+x*u+u/2,6+y*u+u/2+6,labels[k],16,{bold:true}));});
 return fig(12+w*u,12+h*u,m,'A net made of six squares');
}
const s3CubeNet:Template=(r,i)=>{
 const want=i%2===0,good:[number,number][][]=[],bad:[number,number][][]=[],seen=new Set<string>();
 for(let t=0;t<400&&(good.length<3||bad.length<3);t++){const c=hexomino(r),k=netKey(c);if(seen.has(k)||Math.max(...c.map(p=>p[0]))>4||Math.max(...c.map(p=>p[1]))>3)continue;seen.add(k);(isCubeNet(c)?good:bad).push(c);}
 if(good.length<(want?1:3)||bad.length<(want?3:1))return null;
 const answer=want?good[0]:bad[0],others=want?bad.slice(0,3):good.slice(0,3),pics=r.shuffle([{key:'yes',visual:netFig(answer)},...others.map((c,k)=>({key:`no${k}`,visual:netFig(c)}))]);
 return {prompt:want?'Which of these nets will fold to make a cube?':'Which of these is **NOT** the net of a cube?',answer:'yes',pictures:pics,rewardGroup:'challenge',
  explanation:explain(want?'Imagine folding each net around one square that stays on the table.':'Imagine folding each net around one square that stays on the table.',bullets(want?'In the correct net, every square lands on a different face of the cube.':'In the wrong net, two squares land on the same face, so one face of the cube is left open.','Useful check: a cube net never has a 2 by 2 block of squares, and never has five squares in one row.')),
  audit:{k:'cubeNetPick',want}};
};
const s3NetShape:Template=r=>{
 const kind=r.int(0,3),m:Mark[]=[],u=34;let name:string;
 const rect=(x:number,y:number,w:number,h:number)=>m.push({t:'poly',pts:[x,y,x+w,y,x+w,y+h,x,y+h],fill:'pale',w:1.8}),tri=(pts:number[])=>m.push({t:'poly',pts:pts.map(r1),fill:'pale',w:1.8});
 if(kind===0){name='triangular prism';for(let k=0;k<3;k++)rect(20+k*u*1.5,50,u*1.5,u*2);tri([20+u*1.5,50,20+u*3,50,20+u*2.25,50-u*1.3]);tri([20+u*1.5,50+u*2,20+u*3,50+u*2,20+u*2.25,50+u*2+u*1.3]);}
 else if(kind===1){name='square-based pyramid';const x=90,y=70,s=u*1.6;rect(x,y,s,s);tri([x,y,x+s,y,x+s/2,y-s*.9]);tri([x,y+s,x+s,y+s,x+s/2,y+s+s*.9]);tri([x,y,x,y+s,x-s*.9,y+s/2]);tri([x+s,y,x+s,y+s,x+s+s*.9,y+s/2]);}
 else if(kind===2){name='triangular-based pyramid';const x=60,y=160,s=u*2.4,h=s*.87;tri([x,y,x+s,y,x+s/2,y-h]);tri([x+s,y,x+2*s,y,x+1.5*s,y-h]);tri([x+s/2,y-h,x+1.5*s,y-h,x+s,y]);tri([x+s/2,y-h,x+1.5*s,y-h,x+s,y-2*h]);}
 else{name='cuboid';const W=u*1.5,D=u*.8,H=u;[[0,D],[D,0],[D,D],[D,D+H],[D+W,D],[D+W+D,D]].forEach(([x,y],k)=>rect(20+x,20+y,k===0||k===4?D:W,k===1||k===3?D:H));}
 const all=['triangular prism','square-based pyramid','triangular-based pyramid','cuboid','cube','pentagonal prism'],o=words4(name,r.sample(all.filter(x=>x!==name&&!(name==='cuboid'&&x==='cube')),3));if(!o)return null;
 const ys=m.flatMap(k=>k.t==='poly'?k.pts.filter((_,j)=>j%2===1):[]),xs=m.flatMap(k=>k.t==='poly'?k.pts.filter((_,j)=>j%2===0):[]);
 return {...o,prompt:'Which 3D shape does this net fold up to make?',visual:fig(Math.max(...xs)+20,Math.max(...ys)+20,m.map(k=>k.t==='poly'?{...k,pts:k.pts.map((v,j)=>j%2===1?r1(v-Math.min(...ys)+10):v)}:k),'A net made of flat faces'),
  explanation:explain(bullets({'triangular prism':'Two triangles and three rectangles: a prism with triangular ends.','square-based pyramid':'One square and four triangles that meet at a point: a square-based pyramid.','triangular-based pyramid':'Four triangles: a triangular-based pyramid (a tetrahedron).','cuboid':'Six rectangles in opposite pairs: a cuboid.'}[name]!)),
  audit:{k:'netShape'}};
};
const s3Describe:Template=r=>{
 const facts:[string,string][]=[['I have 5 faces: 1 square and 4 triangles.','square-based pyramid'],['I have 5 faces: 2 triangles and 3 rectangles.','triangular prism'],['I have 4 faces, and they are all triangles.','triangular-based pyramid'],['I have 6 square faces.','cube'],['I have 8 faces: 2 hexagons and 6 rectangles.','hexagonal prism'],['I have 7 faces: 2 pentagons and 5 rectangles.','pentagonal prism'],['I have 6 faces: 1 pentagon and 5 triangles.','pentagonal pyramid']];
 const [clue,ans]=r.pick(facts),o=words4(ans,r.sample(facts.map(f=>f[1]).filter(x=>x!==ans),3));if(!o)return null;
 return {...o,prompt:`Which 3D shape am I? ${clue}`,rewardGroup:'quick',
  explanation:explain(ans.includes('prism')?'A prism has two matching ends joined by rectangles.':ans.includes('pyramid')?'A pyramid has one base, with triangles meeting at a point.':'A cube has six identical square faces.',`So the shape is a ${ans}.`),
  audit:{k:'describe3d',clue}};
};
const s3Opposite:Template=r=>{
 let net:[number,number][]|null=null;for(let t=0;t<200&&!net;t++){const c=hexomino(r);if(isCubeNet(c)&&Math.max(...c.map(p=>p[0]))<=4&&Math.max(...c.map(p=>p[1]))<=3)net=c;}if(!net)return null;
 const faces=foldNet(net),nums=r.shuffle(['1','2','3','4','5','6']),OPP:Record<string,string>={'1':'6','6':'1','2':'5','5':'2','3':'4','4':'3'};
 const k=r.int(0,5),oppK=faces.indexOf(OPP[faces[k]]),neighbours=[0,1,2,3,4,5].filter(j=>j!==k&&j!==oppK).map(j=>nums[j]);
 const o=words4(nums[oppK],r.sample(neighbours,3));if(!o)return null;
 return {...o,prompt:`This net is folded to make a cube. Which number will be on the face **opposite** the ${nums[k]}?`,visual:netFig(net,nums,40),rewardGroup:'challenge',
  explanation:explain(bullets('Faces that touch on the net (side by side) end up next to each other on the cube, not opposite.','In a row of three squares, the first and third are opposite each other.',`Folding this net puts ${nums[oppK]} opposite ${nums[k]}.`)),
  audit:{k:'netOpposite'}};
};

// ───────────────────────── Coordinates
const coords:Topic={id:'ma-coordinates',subject:'Maths',strand:'Geometry',title:'Coordinates and transformations',helpsheet:{
 intro:'Coordinates give the position of a point as (x, y): first go across along the x-axis, then up or down the y-axis.',
 steps:['Start at the origin (0, 0). Read the x-coordinate first, then the y-coordinate: "along the corridor, then up the stairs".','Left of the origin, x is negative; below the origin, y is negative.','A translation slides a shape: add to x to move right, subtract to move left; add to y to move up, subtract to move down.','Reflecting in the y-axis changes the sign of x; reflecting in the x-axis changes the sign of y.'],
 example:{title:'Point T',visual:coordGrid({min:-4,max:4,unit:24,points:[{x:-3,y:2,label:'T'}],alt:'A coordinate grid with point T marked'}),lines:['T is 3 squares left of the origin: x = −3.','T is 2 squares up: y = 2.','T is at (−3, 2).']},
 tips:['(2, 5) and (5, 2) are different points: across first, then up.','Check the signs: a point below the x-axis has a negative y-coordinate.','For a rectangle, the missing corner shares its x with one corner and its y with another.'],
}};
const LETTERS=['P','Q','R','S'];
const pt=(x:number,y:number)=>`(${num(x)}, ${num(y)})`;
const coRead:Template=r=>{
 const pts:{x:number;y:number;label:string}[]=[];for(const l of LETTERS.slice(0,3)){let p:{x:number;y:number;label:string};do{p={x:r.int(-5,5),y:r.int(-5,5),label:l};}while(pts.some(q=>q.x===p.x&&q.y===p.y)||p.x===0||p.y===0||Math.abs(p.x)===Math.abs(p.y));pts.push(p);}
 const t=r.pick(pts),o=pick<[number,number]>([t.x,t.y],[[t.y,t.x],[-t.x,t.y],[t.x,-t.y],[-t.y,-t.x]],p=>pt(p[0],p[1]),p=>p.join());if(!o)return null;
 return {...o,prompt:`What are the coordinates of point **${t.label}**?`,visual:coordGrid({min:-6,max:6,points:pts,alt:'A coordinate grid with three points marked'}),rewardGroup:'quick',
  explanation:explain(bullets(`${t.label} is ${Math.abs(t.x)} square${Math.abs(t.x)>1?'s':''} ${t.x>0?'right':'left'} of the origin, so x = ${num(t.x)}.`,`It is ${Math.abs(t.y)} square${Math.abs(t.y)>1?'s':''} ${t.y>0?'up':'down'}, so y = ${num(t.y)}.`,`${t.label} = ${pt(t.x,t.y)}`),`${pt(t.y,t.x)} has the numbers the wrong way round: across first, then up or down.`),
  audit:{k:'coordRead'}};
};
/** Moves the top edge of a rectangle up or down a little if the rectangle would otherwise be a square.
 *  It uses no random draws, so the questions after this one stay exactly the same. */
function notSquare(y1:number,y2:number,width:number,max:number,ok:(y:number)=>boolean=()=>true):number|null{
 if(y2-y1!==width)return y2;
 for(const y of [y2+1,y2-1,y2+2,y2-2])if(y>=y1+2&&y<=max&&y-y1!==width&&ok(y))return y;
 return null;
}
const coVertex:Template=r=>{
 const x1=r.int(-5,1),x2=r.int(x1+2,5),y1=r.int(-5,1),y2d=r.int(y1+2,5);if([x1,x2,y1,y2d].includes(0))return null;
 const y2=notSquare(y1,y2d,x2-x1,5,y=>y!==0);if(y2===null)return null;const corners:[number,number][]=[[x1,y1],[x1,y2],[x2,y2],[x2,y1]],miss=r.int(0,3),shown=corners.filter((_,j)=>j!==miss),ans=corners[miss];
 const pts=shown.map((p,j)=>({x:p[0],y:p[1],label:LETTERS[j]}));
 const o=pick<[number,number]>(ans,[[ans[1],ans[0]],[ans[0],-ans[1]],[-ans[0],ans[1]],[shown[1][0]+shown[2][0]-shown[0][0],shown[1][1]+shown[2][1]-shown[0][1]]],p=>pt(p[0],p[1]),p=>p.join());if(!o)return null;
 return {...o,prompt:`${LETTERS[0]}, ${LETTERS[1]} and ${LETTERS[2]} are three corners of a rectangle: ${pts.map(p=>`${p.label} ${pt(p.x,p.y)}`).join(', ')}. What are the coordinates of the fourth corner?`,visual:coordGrid({min:-6,max:6,points:pts,alt:'A coordinate grid with three corners of a rectangle marked'}),rewardGroup:'challenge',
  explanation:explain(bullets('The sides of this rectangle run along the grid lines, so each corner shares its x-coordinate with one corner and its y-coordinate with another.',`The missing corner has x = ${num(ans[0])} and y = ${num(ans[1])}: ${pt(ans[0],ans[1])}.`),'Sketching the rectangle on the grid helps you check.'),
  audit:{k:'coordRect'}};
};
const coTranslate:Template=r=>{
 const x=r.int(-5,5),y=r.int(-5,5),dx=r.pick([-6,-5,-4,-3,-2,2,3,4,5,6]),dy=r.pick([-5,-4,-3,-2,2,3,4,5]),ans:[number,number]=[x+dx,y+dy],h=`${Math.abs(dx)} square${Math.abs(dx)>1?'s':''} ${dx>0?'right':'left'}`,v=`${Math.abs(dy)} square${Math.abs(dy)>1?'s':''} ${dy>0?'up':'down'}`;
 const o=pick<[number,number]>(ans,[[x-dx,y+dy],[x+dx,y-dy],[x+dy,y+dx],[x-dx,y-dy]],p=>pt(p[0],p[1]),p=>p.join());if(!o)return null;
 return {...o,prompt:`Point P is at ${pt(x,y)}. It is translated ${h} and ${v}. What are its new coordinates?`,
  explanation:explain(bullets(`${dx>0?'Right':'Left'} ${Math.abs(dx)}: x = ${num(x)} ${dx>0?'+':'−'} ${Math.abs(dx)} = ${num(x+dx)}`,`${dy>0?'Up':'Down'} ${Math.abs(dy)}: y = ${num(y)} ${dy>0?'+':'−'} ${Math.abs(dy)} = ${num(y+dy)}`,`New position: ${pt(ans[0],ans[1])}`)),
  audit:{k:'translate'}};
};
const coReflect:Template=r=>{
 const x=r.pick([-5,-4,-3,-2,-1,1,2,3,4,5]),y=r.pick([-5,-4,-3,-2,-1,1,2,3,4,5]);if(Math.abs(x)===Math.abs(y))return null;const inY=r.chance(.5),ans:[number,number]=inY?[-x,y]:[x,-y];
 const o=pick<[number,number]>(ans,[inY?[x,-y]:[-x,y],[-x,-y],[y,x],[-y,-x]],p=>pt(p[0],p[1]),p=>p.join());if(!o)return null;
 return {...o,prompt:`Point Q is at ${pt(x,y)}. It is reflected in the **${inY?'y':'x'}-axis**. What are the coordinates of its reflection?`,
  explanation:explain(bullets(inY?'Reflecting in the y-axis flips the point from one side to the other: x changes sign, y stays the same.':'Reflecting in the x-axis flips the point above or below: y changes sign, x stays the same.',`${pt(x,y)} → ${pt(ans[0],ans[1])}`)),
  audit:{k:'reflect'}};
};
const coOnLine:Template=r=>{
 const vert=r.chance(.5),c=r.pick([-4,-3,-2,2,3,4]),other=r.int(-5,5),ans:[number,number]=vert?[c,other]:[other,c];if(other===c||other===-c)return null;
 const o=pick<[number,number]>(ans,vert?[[other,c],[-c,other],[c+1,other]]:[[c,other],[other,-c],[other,c+1]],p=>pt(p[0],p[1]),p=>p.join());if(!o)return null;
 return {...o,prompt:`Which point lies on the line **${vert?'x':'y'} = ${num(c)}**?`,
  explanation:explain(bullets(vert?`Every point on the line x = ${num(c)} has x-coordinate ${num(c)}; the y-coordinate can be anything.`:`Every point on the line y = ${num(c)} has y-coordinate ${num(c)}; the x-coordinate can be anything.`,`${pt(ans[0],ans[1])} is the only option with ${vert?'x':'y'} = ${num(c)}.`),`The line ${vert?'x':'y'} = ${num(c)} is ${vert?'vertical':'horizontal'}.`),
  audit:{k:'onLine'}};
};
const coRectPerim:Template=r=>{
 const x1=r.int(-5,0),x2=r.int(x1+2,6),y1=r.int(-5,0),y2d=r.int(y1+2,5),area=r.chance(.5),y2=notSquare(y1,y2d,x2-x1,5);if(y2===null)return null;
 const w=x2-x1,h=y2-y1,ans=area?w*h:2*(w+h);
 const c=choices(ans,area?[2*(w+h),w+h,(w+1)*(h+1)]:[w*h,w+h,2*(w+h)+4].filter(x=>x!==ans),x=>`${num(x)} ${area?'square units':'units'}`);if(!c)return null;
 const crossX=x1<0&&x2>0,crossY=y1<0&&y2>0,[a,b,l]=crossX?[x1,x2,'x'] as const:[y1,y2,'y'] as const;
 const tip=crossX||crossY?`Count across zero carefully: from ${l} = ${num(a)} to ${l} = ${num(b)} is ${-a} + ${b} = ${b-a} units.`:'Find each length by taking the smaller coordinate away from the larger one.';
 return {...c,prompt:`A rectangle has corners at ${[[x1,y1],[x2,y1],[x2,y2],[x1,y2]].map(p=>pt(p[0],p[1])).join(', ')}. What is its ${area?'area':'perimeter'}?`,rewardGroup:'challenge',
  explanation:explain(bullets(`Width: from x = ${num(x1)} to x = ${num(x2)} is ${w} units.`,`Height: from y = ${num(y1)} to y = ${num(y2)} is ${h} units.`,area?`Area: ${w} × ${h} = ${ans} square units`:`Perimeter: 2 × (${w} + ${h}) = ${ans} units`),tip),
  audit:{k:'coordRectMeasure',ask:area?'area':'perimeter'}};
};

export const geometryTopics:BuiltTopic[]=[
 topicSet(angles,20,[angLine,angPoint,angTriangle,angCross,angPolygon,angClock]),
 topicSet(shapes2d,20,[s2Quad,s2Symmetry,s2Circles,s2Names,s2Triangles,s2Regular]),
 topicSet(shapes3d,20,[s3Count,s3CubeNet,s3NetShape,s3Describe,s3Opposite]),
 topicSet(coords,20,[coRead,coVertex,coTranslate,coReflect,coOnLine,coRectPerim]),
];
