import json,math
from pathlib import Path
qs=[];out=Path('public/question-diagrams');out.mkdir(exist_ok=True)
def add(s,p,a,e,g='challenge',**kw):
 qs.append(dict(id=f'photo-20260916-{len(qs)+1:03}',subject=s,difficulty='Year 6',prompt=p,answers=[str(a)],explanation=e,rewardGroup=g,**kw))
for n in [9,16,28,53]:
 add('Maths',f'Write {n} thousandths as a decimal.',f'{n/1000:.3f}',f'Thousandths are parts out of 1,000: {n} ÷ 1,000 = {n/1000:.3f}.','standard')
 add('Maths',f'Write {n+100} tens as an ordinary number.',(n+100)*10,f'Multiply {n+100} by 10.','quick')
for n in [17,29,41,67]:
 comp=n*3
 add('Maths',f'Which of these numbers is NOT prime: {n}, {comp}, 97?',comp,f'{comp} = 3 × {n}, so it has factors other than 1 and itself.','standard',options=[str(n),str(comp),'97'])
for b,p in [(3,4),(5,3),(2,6),(4,3)]:add('Maths',f'Calculate {b}^{p}. The ^ symbol means “to the power of”.',b**p,f'Multiply {p} copies of {b}: '+ ' × '.join([str(b)]*p)+f' = {b**p}.','standard')
for whole,num,den in [(8,2,3),(6,3,4),(9,4,5),(5,5,6)]:add('Maths',f'How many 1/{den} pieces are in {whole} {num}/{den}?',whole*den+num,f'{whole} wholes contain {whole*den} pieces. Add {num} more pieces.','standard')
for total,pct in [(240,35),(360,45),(480,65),(320,15)]:add('Maths',f'{pct}% of {total} tickets were sold on Monday. How many tickets were sold on Monday?',total*pct//100,f'{total} × {pct}/100 = {total*pct//100}.')
for part,n,d in [(24,3,8),(35,5,9),(42,7,10),(18,2,7)]:add('Maths',f'{n}/{d} of the mass of a bag is {part} kg. What is the whole mass, in kilograms?',part//n*d,f'One part is {part} ÷ {n} = {part//n} kg. Multiply by {d} for the whole.')
for unit,ratio in [(4,(2,3,5)),(6,(3,4,2)),(5,(4,1,3)),(8,(2,5,3))]:
 total=unit*sum(ratio);a,b,c=ratio
 add('Maths',f'{total} counters are shared between Alex, Bea and Casey in the ratio {a}:{b}:{c}. How many does Bea receive?',unit*b,f'There are {sum(ratio)} parts. Each part is {unit}. Bea receives {b} × {unit} = {unit*b}.')
for whole,n,d,num,den in [(60,2,3,3,4),(80,3,5,7,8),(96,5,6,3,8),(120,3,4,2,5)]:
 part=whole*n//d
 add('Maths',f'{n}/{d} of an amount is {part}p. How many pence is {num}/{den} of the same amount?',whole*num//den,f'The whole is {part} ÷ {n} × {d} = {whole}p. Then {num}/{den} × {whole} = {whole*num//den}p.','extended')
for rows in [[('Maths',18,25),('English',17,20),('Art',21,30)],[('History',27,40),('Science',21,25),('Music',16,20)],[('French',33,50),('Maths',28,35),('Art',18,20)],[('English',42,60),('History',19,25),('Science',17,20)]]:
 scores='; '.join(f'{s}: {n}/{d}' for s,n,d in rows);best=max(rows,key=lambda r:r[1]/r[2])[0]
 add('Maths',f'A pupil scores {scores}. Which subject has the highest percentage score?',best,'Compare percentages: '+', '.join(f'{s} {100*n/d:g}%' for s,n,d in rows)+'.',options=[r[0] for r in rows])
def text(x,y,t,size=22):return f'<text x="{x}" y="{y}" text-anchor="middle" font-family="Arial,sans-serif" font-size="{size}" fill="#10243a">{t}</text>'
def square(x,y,label):return f'<rect x="{x}" y="{y}" width="60" height="60" fill="white" stroke="#10243a" stroke-width="2"/>'+text(x+30,y+38,label)
def pic(num,content,w=600,h=300):
 name=f'photo-{num}';(out/(name+'.svg')).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}"><rect width="100%" height="100%" fill="#f6f8fc"/>{content}</svg>');return {'kind':'textbook','items':[num]}
# 8 cube-net questions: standard cross net; opposite pairs are fixed by folding.
for i in range(8):
 labels=list('ABCDEF');labels=labels[i%6:]+labels[:i%6]
 positions=[(180,20),(120,80),(180,80),(240,80),(180,140),(180,200)]
 content=''.join(square(x,y,l) for (x,y),l in zip(positions,labels));pairs=[(0,4),(1,3),(2,5)];a,b=pairs[i%3]
 if i>=6:a,b=b,a
 num=i+1;diagram=pic(num,content,420,280)
 options=[labels[b],labels[(b+1)%6],labels[(b+2)%6],labels[(b+3)%6]]
 add('Non-verbal reasoning',f'Fold this net into a cube. Which face is opposite {labels[a]}?',labels[b],f'After folding, the opposite pairs are {labels[0]}–{labels[4]}, {labels[1]}–{labels[3]} and {labels[2]}–{labels[5]}.','challenge',diagram=diagram,options=options)
# 8 matrix puzzles: third column combines marks from columns 1 and 2.
for i in range(8):
 a=1+i%3;b=1+(i//3)%3;c=1+(i+1)%3;d=1+(i+2)%3
 cells=[a,b,a+b,c,d,c+d,a+c,b+d,None];content=''
 for k,n in enumerate(cells):
  x=30+k%3*110;y=15+k//3*85
  content+=f'<rect x="{x}" y="{y}" width="100" height="75" fill="white" stroke="#506080"/>'
  if n is None:content+=text(x+50,y+48,'?')
  else:
   for j in range(n):content+=f'<circle cx="{x+16+(j%5)*17}" cy="{y+23+(j//5)*24}" r="5" fill="#10243a"/>'
 ans=a+b+c+d
 add('Non-verbal reasoning','In each row, the last box combines the dots from the first two boxes. How many dots belong in the missing box?',ans,f'The bottom row has {a+c} dots and {b+d} dots. Together they make {ans}.','standard',diagram=pic(9+i,content,370,290),options=[str(ans-2),str(ans-1),str(ans),str(ans+1)])
# 8 shape-code puzzles with a visible example key, inferred two-part code.
def shape(x,y,kind,filled):
 fill='#10243a' if filled else 'white'
 if kind==0:return f'<circle cx="{x}" cy="{y}" r="23" fill="{fill}" stroke="#10243a" stroke-width="3"/>'
 if kind==1:return f'<rect x="{x-23}" y="{y-23}" width="46" height="46" fill="{fill}" stroke="#10243a" stroke-width="3"/>'
 return f'<polygon points="{x},{y-25} {x-25},{y+23} {x+25},{y+23}" fill="{fill}" stroke="#10243a" stroke-width="3"/>'
for i in range(8):
 letters=['ABC','DEF','GHI','JKL','MNO','PQR','STU','VWX'][i];kind=i%3;filled=i%2==0;first=letters[kind];last='Y' if filled else 'Z';ans=first+last
 examples=[(0,False),(1,False),(2,False),((kind+1)%3,True)] if filled else [(0,True),(1,True),(2,True),((kind+1)%3,False)]
 content=text(300,25,'Use the examples to work out the code.',18)
 for j,(k,f) in enumerate(examples):content+=shape(70+j*130,80,k,f)+text(70+j*130,130,letters[k]+('Y' if f else 'Z'))
 content+=shape(300,200,kind,filled)+text(300,260,'?')
 add('Non-verbal reasoning','Which code matches the final shape?',ans,f'The first letter identifies the shape: circle {letters[0]}, square {letters[1]}, triangle {letters[2]}. Y means filled and Z means outline.','challenge',diagram=pic(17+i,content),options=[ans,first+('Z' if filled else 'Y'),letters[(kind+1)%3]+last,letters[(kind+2)%3]+last])
# 8 rotations; asymmetric marked grid makes the direction unambiguous.
def rotate(mask):return {(c,2-r) for r,c in mask}
for i in range(8):
 masks=[{(0,0),(0,1),(1,0)},{(0,0),(1,1)},{(0,1),(1,0),(2,0)},{(0,0),(0,2),(2,1)}]
 mask=masks[i%4];turns=1 if i<4 else 3;answer=mask
 for _ in range(turns):answer=rotate(answer)
 content=''
 for r in range(3):
  for c in range(3):content+=f'<rect x="{95+c*60}" y="{30+r*60}" width="60" height="60" fill="'+('#244b79' if (r,c) in mask else 'white')+'" stroke="#10243a"/>'+f'<text x="{125+c*60}" y="{68+r*60}" text-anchor="middle" font-size="20" fill="'+('white' if (r,c) in mask else '#10243a')+f'">{r*3+c+1}</text>'
 correct=', '.join(str(r*3+c+1) for r,c in sorted(answer));opts=[correct]
 candidate=mask
 for _ in range(4):
  t=', '.join(str(r*3+c+1) for r,c in sorted(candidate))
  if t not in opts:opts.append(t)
  candidate=rotate(candidate)
 add('Non-verbal reasoning',f'Rotate the shaded pattern a quarter turn {"clockwise" if turns==1 else "anticlockwise"}. Using the fixed position numbers, which squares will be shaded?',correct,f'The shaded squares move to positions {correct}. Position numbers stay fixed; only the pattern turns.','challenge',diagram=pic(25+i,content,370,240),options=opts)
Path('lib/textbook-questions.ts').write_text("import type {Question} from './questions';\nexport const textbookQuestions:Question[]="+json.dumps(qs,ensure_ascii=False,indent=2)+';\n')
print(len(qs),'questions;',sum(q['subject']=='Maths' for q in qs),'maths')
