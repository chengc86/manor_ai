import type {Visual,Mark,Fill,KeyNode} from './visual';
// Lays every kind of question picture out as plain marks in a w × h box, so the page, previews and tests all draw the same thing.
export type Figure={w:number;h:number;marks:Mark[];alt:string};
const FONT=.56;
/** Rough width of text in figure units, enough for layout. */
export const textWidth=(s:string,size=15,bold=false)=>s.length*size*(bold?FONT+.04:FONT);
/** Splits text into lines of at most max characters, breaking at spaces. */
export function wrap(s:string,max:number){const out:string[]=[];for(const para of s.split('\n')){let line='';for(const w of para.split(' ')){if(line&&(line+' '+w).length>max){out.push(line);line=w;}else line=line?line+' '+w:w;}out.push(line);}return out;}
const text=(x:number,y:number,s:string,size=15,o:Partial<Extract<Mark,{t:'text'}>>={}):Mark=>({t:'text',x,y,s,size,anchor:'middle',...o});
const lines=(x:number,y:number,rows:string[],size=15,o:Partial<Extract<Mark,{t:'text'}>>={}):Mark[]=>rows.map((s,i)=>text(x,y+i*size*1.25,s,size,o));
const box=(x:number,y:number,w:number,h:number,fill:Fill='white',r=6,sw=2):Mark=>({t:'rect',x,y,w,h,fill,r,sw});
const place=(f:Figure,x:number,y:number,scale=1):Mark=>({t:'g',x,y,scale:scale===1?undefined:scale,marks:f.marks});
/** A '?' box standing for the missing picture. */
const unknown=(size:number):Figure=>({w:size,h:size,alt:'unknown',marks:[box(4,4,size-8,size-8,'white',8,2),text(size/2,size/2+size*.14,'?',size*.42,{bold:true,c:'muted'})]});

export function layout(v:Visual):Figure{
 switch(v.kind){
  case 'figure':return {w:v.w,h:v.h,marks:v.marks,alt:v.alt};
  case 'numberLine':return numberLine(v);
  case 'base10':return base10(v);
  case 'counters':return counters(v);
  case 'partWhole':return partWhole(v);
  case 'placeValue':return table({head:v.columns,rows:v.rows,alt:v.alt??'Place value chart'},true);
  case 'barModel':return barModel(v);
  case 'cards':return cards(v);
  case 'compare':return compare(v);
  case 'clock':return clock(v);
  case 'table':return table(v);
  case 'chart':return chart(v);
  case 'pictogram':return pictogram(v);
  case 'pie':return pie(v);
  case 'key':return branchingKey(v);
  case 'set':return set(v);
 }
}

function numberLine(v:Extract<Visual,{kind:'numberLine'}>):Figure{
 const n=Math.max(2,v.ticks),gap=Math.max(30,Math.min(72,560/(n-1))),left=40,w=left*2+gap*(n-1),y=58,m:Mark[]=[{t:'line',x1:12,y1:y,x2:w-12,y2:y,w:2.5,arrow:'both'}];
 for(let i=0;i<n;i++){const x=left+gap*i;m.push({t:'poly',pts:[x-6,y-10,x+6,y-10,x,y],fill:'blue',w:1});}
 for(const [i,s] of Object.entries(v.labels)){const x=left+gap*Number(i);m.push(text(x,y+28,s,15));}
 for(const [i,s] of Object.entries(v.points??{})){const x=left+gap*Number(i);m.push(text(x,20,s,17,{bold:true,c:'purple'}),{t:'line',x1:x,y1:26,x2:x,y2:y-13,w:2,arrow:'end',c:'purple'});}
 return {w,h:y+42,marks:m,alt:v.alt??'Number line'};
}

function base10(v:Extract<Visual,{kind:'base10'}>):Figure{
 const u=4.2,side=u*10,groups:{w:number;h:number;marks:Mark[]}[]=[];
 const grid=(x:number,y:number,cols:number,rows:number):Mark[]=>{const m:Mark[]=[{t:'rect',x,y,w:cols*u,h:rows*u,fill:'blue',sw:1.4}];for(let i=1;i<cols;i++)m.push({t:'line',x1:x+i*u,y1:y,x2:x+i*u,y2:y+rows*u,w:.6,c:'blue'});for(let j=1;j<rows;j++)m.push({t:'line',x1:x,y1:y+j*u,x2:x+cols*u,y2:y+j*u,w:.6,c:'blue'});return m;};
 const cube=(x:number,y:number):Mark[]=>{const d=10;return [...grid(x,y+d,10,10),{t:'poly',pts:[x,y+d,x+d,y,x+d+side,y,x+side,y+d],fill:'blue',w:1.4},{t:'poly',pts:[x+side,y+d,x+side+d,y,x+side+d,y+side,x+side,y+side+d],fill:'blue',w:1.4}];};
 const add=(count:number|undefined,each:number,h:number,draw:(x:number,y:number)=>Mark[])=>{if(!count)return;const m:Mark[]=[];for(let i=0;i<count;i++)m.push(...draw(i*each,0));groups.push({w:count*each,h,marks:m});};
 add(v.thousands,side+18,side+10,cube);add(v.hundreds,side+6,side,(x,y)=>grid(x,y,10,10));add(v.tens,u+5,side,(x,y)=>grid(x,y,1,10));
 if(v.ones){const m:Mark[]=[];for(let i=0;i<v.ones;i++)m.push(...grid(Math.floor(i/5)*(u+4),(i%5)*(u+4)+side-5*(u+4),1,1));groups.push({w:Math.ceil(v.ones/5)*(u+4),h:side,marks:m});}
 return flow(groups,18,640,v.alt??'Base 10 blocks');
}
/** Lays groups left to right, wrapping to a new line when the row would get wider than max. Groups line up at the bottom. */
function flow(groups:{w:number;h:number;marks:Mark[]}[],gap:number,max:number,alt:string):Figure{
 const rows:typeof groups[]=[[]];let width=0;for(const g of groups){const row=rows.at(-1)!,used=row.reduce((s,x)=>s+x.w+gap,0);if(row.length&&used+g.w>max)rows.push([g]);else row.push(g);}
 const m:Mark[]=[];let y=6;for(const row of rows){const h=Math.max(0,...row.map(g=>g.h));let x=6;for(const g of row){m.push({t:'g',x,y:y+h-g.h,marks:g.marks});x+=g.w+gap;}width=Math.max(width,x-gap);y+=h+gap;}
 return {w:width+12,h:y-gap+12,marks:m,alt};
}

const COUNTER_FILL:Record<string,Fill>={'1':'red','10':'blue','100':'green','1000':'purple','10000':'orange','100000':'yellow','0.1':'yellow','0.01':'pale'};
function counters(v:Extract<Visual,{kind:'counters'}>):Figure{
 const r=17,m:Mark[]=[];let y=6,w=0;
 for(const g of v.groups){for(let i=0;i<g.count;i++){const x=6+r+i*(2*r+6);m.push({t:'circle',x,y:y+r,r,fill:COUNTER_FILL[g.value.replace(/,/g,'')]??'pale',w:1.6},text(x,y+r+(g.value.length>3?3.5:5),g.value,g.value.length>4?8:g.value.length>3?10:13,{bold:true}));w=Math.max(w,x+r+6);}y+=2*r+8;}
 return {w:Math.max(w,60),h:y+2,marks:m,alt:v.alt??'Place value counters'};
}

function partWhole(v:Extract<Visual,{kind:'partWhole'}>):Figure{
 const n=v.parts.length,sizeFor=(s:string)=>s.length>6?13:s.length>4?15:17,r=36,spread=Math.max(95,Math.min(120,420/n)),w=Math.max(220,spread*n+40),cx=w/2,top=46,bottom=150,m:Mark[]=[];
 const xs=v.parts.map((_,i)=>cx+(i-(n-1)/2)*spread);
 for(const x of xs)m.push({t:'line',x1:cx,y1:top,x2:x,y2:bottom,w:2});
 m.push({t:'circle',x:cx,y:top,r,fill:'purple',w:2},text(cx,top+6,v.whole,sizeFor(v.whole),{bold:true}));
 xs.forEach((x,i)=>m.push({t:'circle',x,y:bottom,r,fill:'purple',w:2},text(x,bottom+6,v.parts[i],sizeFor(v.parts[i]),{bold:true})));
 return {w,h:bottom+r+8,marks:m,alt:v.alt??'Part-whole model'};
}

function barModel(v:Extract<Visual,{kind:'barModel'}>):Figure{
 const labelW=v.rows.some(r=>r.label)?Math.max(60,...v.rows.map(r=>textWidth(r.label??'',14,true)+16)):0,barW=460,rowH=46,top=v.total?40:8,m:Mark[]=[];
 const scale=barW/Math.max(...v.rows.map(r=>r.parts.reduce((s,p)=>s+p.size,0)));
 v.rows.forEach((row,i)=>{const y=top+i*(rowH+12);if(row.label)m.push(text(labelW-10,y+rowH/2+5,row.label,14,{bold:true,anchor:'end'}));let x=labelW;for(const p of row.parts){const pw=p.size*scale;m.push({t:'rect',x,y,w:pw,h:rowH,fill:p.shade?'yellow':'white',sw:2},text(x+pw/2,y+rowH/2+5,p.text,pw<40?11:15,{bold:true}));x+=pw;}});
 if(v.total){const total=v.rows[0].parts.reduce((s,p)=>s+p.size,0)*scale;m.push({t:'poly',open:true,fill:'none',w:1.6,pts:[labelW,top-6,labelW,top-14,labelW+total,top-14,labelW+total,top-6]},text(labelW+total/2,top-20,v.total,15,{bold:true}));}
 return {w:labelW+barW+10,h:top+v.rows.length*(rowH+12),marks:m,alt:v.alt??'Bar model'};
}

function cards(v:Extract<Visual,{kind:'cards'}>):Figure{
 // Short cards (numbers, words) sit side by side; sentence cards are wide enough to read in two or three lines.
 const sentences=v.cards.some(c=>c.text.length>40),chars=sentences?36:16,maxW=sentences?330:170;
 const groups=v.cards.map(c=>{const rows=wrap(c.text,chars),w=Math.max(110,Math.min(maxW,Math.max(...rows.map(r=>textWidth(r,15)))+24)),h=Math.max(64,rows.length*19+26);return {w,h:h+(c.caption?26:0),marks:[box(0,0,w,h,'pale',8,1.6),...lines(w/2,h/2-(rows.length-1)*9.5+5,rows,15),...(c.caption?[text(w/2,h+20,c.caption,14)]:[])]};});
 return flow(groups,14,660,v.alt??'Cards');
}

function compare(v:Extract<Visual,{kind:'compare'}>):Figure{
 const a=layout(v.left),b=layout(v.right),h=Math.max(a.h,b.h,60),gap=70,w=a.w+b.w+gap;
 return {w,h,alt:v.alt??'Two amounts to compare',marks:[place(a,0,(h-a.h)/2),box(a.w+15,h/2-20,40,40,'white',4),text(a.w+35,h/2+8,'?',22,{bold:true,c:'muted'}),place(b,a.w+gap,(h-b.h)/2)]};
}

function clock(v:Extract<Visual,{kind:'clock'}>):Figure{
 const c=90,r=74,m:Mark[]=[{t:'circle',x:c,y:c,r,fill:'white',w:3}];
 for(let i=0;i<60;i++){const a=i*6*Math.PI/180,big=i%5===0;m.push({t:'line',x1:c+Math.sin(a)*(r-(big?10:5)),y1:c-Math.cos(a)*(r-(big?10:5)),x2:c+Math.sin(a)*r,y2:c-Math.cos(a)*r,w:big?2:1});if(big){const k=i/5||12;m.push(text(c+Math.sin(a)*(r-22),c-Math.cos(a)*(r-22)+5,String(k),14,{bold:true}));}}
 const hour=((v.h%12)+v.m/60)*30*Math.PI/180,min=v.m*6*Math.PI/180;
 // Hands stop short of the numbers so a hand pointing at 12 never hides it.
 m.push({t:'line',x1:c,y1:c,x2:c+Math.sin(hour)*30,y2:c-Math.cos(hour)*30,w:5},{t:'line',x1:c,y1:c,x2:c+Math.sin(min)*43,y2:c-Math.cos(min)*43,w:3},{t:'circle',x:c,y:c,r:4,fill:'black',w:1});
 return {w:c*2,h:c*2,marks:m,alt:v.alt??'Clock face'};
}

function table(v:{head?:string[];rows:string[][];caption?:string;alt?:string},placeValue=false):Figure{
 const cols=Math.max(v.head?.length??0,...v.rows.map(r=>r.length)),size=placeValue?22:15,rowH=placeValue?46:34,top=v.caption?28:4,m:Mark[]=[];
 const widths=Array.from({length:cols},(_,i)=>Math.max(placeValue?86:60,...[v.head?.[i]??'',...v.rows.map(r=>r[i]??'')].map((s,j)=>textWidth(s,j===0&&v.head?15:size,j===0&&!!v.head)+22)));
 const xs=widths.map((_,i)=>4+widths.slice(0,i).reduce((a,b)=>a+b,0)),w=xs.at(-1)!+widths.at(-1)!;
 if(v.caption)m.push(text(w/2+2,18,v.caption,15,{bold:true}));
 const all=[...(v.head?[v.head]:[]),...v.rows];
 all.forEach((row,j)=>{const y=top+j*rowH,head=!!v.head&&j===0;widths.forEach((cw,i)=>{m.push({t:'rect',x:xs[i],y,w:cw,h:rowH,fill:head?(placeValue?'blue':'pale'):'white',sw:1.5});m.push(text(xs[i]+cw/2,y+rowH/2+(head?5:size*.35),row[i]??'',head?15:size,{bold:head}));});});
 return {w:w+8,h:top+all.length*rowH+8,marks:m,alt:v.alt??(placeValue?'Place value chart':'Table')};
}

function chart(v:Extract<Visual,{kind:'chart'}>):Figure{
 const left=58,top=v.title?40:16,plotW=Math.max(300,v.labels.length*58),plotH=220,bottom=top+plotH,m:Mark[]=[],yOf=(n:number)=>bottom-n/v.max*plotH;
 if(v.title)m.push(text(left+plotW/2,24,v.title,16,{bold:true}));
 for(let n=0;n<=v.max+1e-9;n+=v.step){const y=yOf(n);m.push({t:'line',x1:left,y1:y,x2:left+plotW,y2:y,w:.8,c:'muted',dash:n>0},text(left-8,y+5,String(Math.round(n*100)/100),13,{anchor:'end'}));}
 const slot=plotW/v.labels.length,xOf=(i:number)=>left+slot*(i+.5);
 if(v.type==='bar')v.values.forEach((n,i)=>m.push({t:'rect',x:xOf(i)-slot*.3,y:yOf(n),w:slot*.6,h:bottom-yOf(n),fill:'blue',sw:1.5}));
 else{m.push({t:'poly',open:true,fill:'none',w:2.5,c:'blue',pts:v.values.flatMap((n,i)=>[xOf(i),yOf(n)])});v.values.forEach((n,i)=>m.push({t:'circle',x:xOf(i),y:yOf(n),r:4,fill:'blue',w:1.5}));}
 v.labels.forEach((s,i)=>m.push(text(xOf(i),bottom+20,s,13)));
 m.push({t:'line',x1:left,y1:top-6,x2:left,y2:bottom,w:2},{t:'line',x1:left,y1:bottom,x2:left+plotW+6,y2:bottom,w:2});
 if(v.x)m.push(text(left+plotW/2,bottom+44,v.x,14,{bold:true}));
 if(v.y)m.push({t:'g',x:16,y:top+plotH/2,rotate:-90,marks:[text(0,0,v.y,14,{bold:true})]});
 return {w:left+plotW+16,h:bottom+(v.x?54:32),marks:m,alt:v.alt??v.title??'Chart'};
}

function icon(kind:'circle'|'star'|'square'|'heart',x:number,y:number,s:number):Mark{
 switch(kind){case 'circle':return {t:'circle',x,y,r:s*.45,fill:'orange',w:1.5};case 'square':return {t:'rect',x:x-s*.42,y:y-s*.42,w:s*.84,h:s*.84,fill:'green',sw:1.5};
  case 'star':{const pts:number[]=[];for(let i=0;i<10;i++){const r=i%2?s*.2:s*.48,a=(i*36-90)*Math.PI/180;pts.push(Math.round((x+r*Math.cos(a))*10)/10,Math.round((y+r*Math.sin(a))*10)/10);}return {t:'poly',pts,fill:'yellow',w:1.5};}
  case 'heart':return {t:'path',d:`M${x} ${y+s*.4} C${x-s*.75} ${y} ${x-s*.35} ${y-s*.55} ${x} ${y-s*.2} C${x+s*.35} ${y-s*.55} ${x+s*.75} ${y} ${x} ${y+s*.4} Z`,fill:'red',w:1.5};}
}
function pictogram(v:Extract<Visual,{kind:'pictogram'}>):Figure{
 const s=28,labelW=Math.max(80,...v.rows.map(r=>textWidth(r.label,14,true)+18)),m:Mark[]=[];let w=0;
 v.rows.forEach((row,j)=>{const y=10+j*(s+12)+s/2;m.push(text(labelW-12,y+5,row.label,14,{bold:true,anchor:'end'}),{t:'line',x1:labelW-4,y1:y-s/2-6,x2:labelW-4,y2:y+s/2+6,w:1,c:'muted'});
  const whole=Math.floor(row.count),part=row.count-whole;for(let i=0;i<whole;i++)m.push(icon(v.icon,labelW+10+s/2+i*(s+6),y,s));
  // A part icon is a whole icon with a paper-coloured cover over the missing share, like cutting a sticker.
  // A dashed outline of the whole icon shows what fraction of it is left, so a quarter never looks like a stray sliver.
  if(part>0){const x=labelW+10+s/2+whole*(s+6);m.push(icon(v.icon,x,y,s),{t:'rect',x:x-s/2+s*part,y:y-s/2-1,w:s*(1-part)+1,h:s+2,fill:'white',sw:0},{...icon(v.icon,x,y,s),fill:'none',dash:true,w:1} as Mark);}
  w=Math.max(w,labelW+10+Math.ceil(row.count)*(s+6));});
 const ky=10+v.rows.length*(s+12)+14;m.push(box(labelW,ky-4,200,s+12,'pale',6,1),icon(v.icon,labelW+22,ky+s/2+2,s),text(labelW+44,ky+s/2+7,`= ${v.value}`,15,{bold:true,anchor:'start'}));
 return {w:Math.max(w,labelW+210)+10,h:ky+s+18,marks:m,alt:v.alt??'Pictogram'};
}

const PIE_FILLS:Fill[]=['blue','orange','green','purple','yellow','red','pale','grey'];
function pie(v:Extract<Visual,{kind:'pie'}>):Figure{
 const c=110,r=92,total=v.slices.reduce((s,x)=>s+x.value,0),m:Mark[]=[];let a=-90;
 v.slices.forEach((sl,i)=>{const sweep=sl.value/total*360,b=a+sweep,rad=(d:number)=>d*Math.PI/180;
  if(sweep>=359.9)m.push({t:'circle',x:c,y:c,r,fill:PIE_FILLS[i%8],w:2});
  else m.push({t:'path',d:`M${c} ${c} L${(c+r*Math.cos(rad(a))).toFixed(2)} ${(c+r*Math.sin(rad(a))).toFixed(2)} A${r} ${r} 0 ${sweep>180?1:0} 1 ${(c+r*Math.cos(rad(b))).toFixed(2)} ${(c+r*Math.sin(rad(b))).toFixed(2)} Z`,fill:PIE_FILLS[i%8],w:2});
  m.push({t:'rect',x:2*c+24,y:24+i*30,w:20,h:20,fill:PIE_FILLS[i%8],sw:1.5},text(2*c+54,39+i*30,sl.label,15,{anchor:'start'}));a=b;});
 return {w:2*c+64+Math.max(...v.slices.map(s=>textWidth(s.label,15))),h:Math.max(2*c,40+v.slices.length*30),marks:m,alt:v.alt??'Pie chart'};
}

function branchingKey(v:Extract<Visual,{kind:'key'}>):Figure{
 const leaves=(n:KeyNode|string):number=>typeof n==='string'?1:leaves(n.yes)+leaves(n.no),depth=(n:KeyNode|string):number=>typeof n==='string'?0:1+Math.max(depth(n.yes),depth(n.no));
 const names:string[]=[],heights:number[]=[],collect=(n:KeyNode|string,level:number):void=>{if(typeof n==='string'){names.push(n);return;}heights[level]=Math.max(heights[level]??0,wrap(n.q,19).length*16+14);collect(n.yes,level+1);collect(n.no,level+1);};collect(v.root,0);
 // Columns fit the longest name (long names wrap onto two lines); each row is as tall as its tallest question, with room for Yes and No.
 const colW=Math.max(128,...names.flatMap(s=>wrap(s,14).map(l=>textWidth(l,14,true)+28))),gap=58,maxDepth=depth(v.root),top:number[]=[10];
 for(let i=0;i<maxDepth;i++)top[i+1]=top[i]+heights[i]+gap;
 const leafH=Math.max(34,...names.map(s=>wrap(s,14).length*17+14)),total=leaves(v.root),w=total*colW,m:Mark[]=[];
 const draw=(n:KeyNode|string,from:number,level:number):{x:number;y:number}=>{
  const count=leaves(n),x=from*colW+count*colW/2;
  if(typeof n==='string'){const y=top[maxDepth],rows=wrap(n,14);m.push(box(x-colW/2+8,y,colW-16,leafH,'pale',8,1.6),...lines(x,y+leafH/2+5-(rows.length-1)*8.5,rows,14,{bold:true}));return {x,y};}
  const y=top[level],rows=wrap(n.q,19),h=rows.length*16+14,bw=Math.min(colW*count-10,Math.max(104,...rows.map(r=>textWidth(r,13)+20)));
  const yes=draw(n.yes,from,level+1),no=draw(n.no,from+leaves(n.yes),level+1);
  m.push({t:'poly',open:true,fill:'none',w:2,c:'green',pts:[x,y+h,x,y+h+12,yes.x,y+h+12,yes.x,yes.y]},{t:'poly',open:true,fill:'none',w:2,c:'red',pts:[x,y+h,x,y+h+12,no.x,y+h+12,no.x,no.y]});
  m.push(text((x+yes.x)/2,y+h+28,'Yes',13,{bold:true,c:'green'}),text((x+no.x)/2,y+h+28,'No',13,{bold:true,c:'red'}));
  m.push(box(x-bw/2,y,bw,h,'white',8,1.6),...lines(x,y+18,rows,13));return {x,y};};
 draw(v.root,0,0);
 return {w,h:top[maxDepth]+leafH+10,marks:m,alt:v.alt??'Branching key'};
}

function set(v:Extract<Visual,{kind:'set'}>):Figure{
 const cell=v.layout==='oval'?96:108,items=v.items.map(i=>i?layout(i):unknown(cell)),fit=(f:Figure,x:number,y:number,size=cell):Mark[]=>{const s=Math.min(1,(size-12)/Math.max(f.w,f.h));return [place(f,x+(size-f.w*s)/2,y+(size-f.h*s)/2,s)];};
 const caption=(x:number,y:number,i:number):Mark[]=>v.labels?.[i]?[text(x,y,v.labels[i],15,{bold:true})]:[];
 const labelH=v.labels?.length?26:0,m:Mark[]=[];
 switch(v.layout){
  case 'row':case 'sequence':{const gap=v.layout==='row'?16:0;items.forEach((f,i)=>{const x=6+i*(cell+gap);m.push(box(x,6,cell,cell,'white',v.layout==='row'?8:0,1.6),...fit(f,x,6),...caption(x+cell/2,cell+28,i));});return {w:12+items.length*(cell+gap)-gap,h:cell+12+labelH,marks:m,alt:v.alt??'Pictures in a row'};}
  case 'grid':{const cols=v.cols??3,rows=Math.ceil(items.length/cols);items.forEach((f,i)=>{const x=6+(i%cols)*cell,y=6+Math.floor(i/cols)*(cell+labelH);m.push(box(x,y,cell,cell,'white',0,1.6),...fit(f,x,y),...caption(x+cell/2,y+cell+20,i));});return {w:12+cols*cell,h:12+rows*(cell+labelH),marks:m,alt:v.alt??'Grid of pictures'};}
  case 'oval':{const n=items.length,top=Math.ceil(n/2),w=Math.max(3,top)*cell+80,h=2*cell+60;m.push({t:'ellipse',x:w/2,y:h/2,rx:w/2-4,ry:h/2-4,fill:'none',w:2});items.forEach((f,i)=>{const row=i<top?0:1,inRow=row?n-top:top,k=row?i-top:i,x=w/2+(k-(inRow-1)/2)*cell-cell/2,y=30+row*cell;m.push(...fit(f,x,y));});return {w,h,marks:m,alt:v.alt??'A group of pictures'};}
  case 'pair':{const w=2*cell+56;m.push({t:'rect',x:4,y:4,w:w-8,h:cell+24,fill:'pale',r:14,sw:1.6});items.slice(0,2).forEach((f,i)=>m.push(box(18+i*(cell+20),16,cell,cell,'white',8,1.2),...fit(f,18+i*(cell+20),16)));return {w,h:cell+32,marks:m,alt:v.alt??'A pair of pictures'};}
  case 'analogy':{const arrow=(x:number):Mark=>({t:'line',x1:x+8,y1:cell/2+6,x2:x+34,y2:cell/2+6,w:2.5,arrow:'end'});const xs=[6,cell+54,2*cell+104,3*cell+152];items.slice(0,4).forEach((f,i)=>m.push(box(xs[i],6,cell,cell,'white',8,1.6),...fit(f,xs[i],6)));m.push(arrow(cell+8),text(2*cell+80,cell/2+14,':',30,{bold:true}),arrow(3*cell+106));return {w:4*cell+160,h:cell+12,marks:m,alt:v.alt??'a is to b as c is to what?'};}
 }
}
