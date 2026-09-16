import json,xml.etree.ElementTree as ET
from pathlib import Path
s=Path('lib/quest-expansion.ts').read_text();questions=json.loads(s[s.index('=[')+1:].rstrip(';\n'))
def read_grid(root,x,y):
 result=set()
 for r in root.findall('{http://www.w3.org/2000/svg}rect'):
  if r.get('width')!='24' or r.get('fill')!='#243f67':continue
  dx=float(r.get('x'))-x;dy=float(r.get('y'))-y
  if 0<=dx<72 and 0<=dy<72:result.add((int(dy/24),int(dx/24)))
 return result
def rot(m):return {(c,2-r) for r,c in m}
def mirror(m):return {(r,2-c) for r,c in m}
def connected(m):
 seen={next(iter(m))}
 while True:
  updated=seen|{b for b in m if any(abs(a[0]-b[0])+abs(a[1]-b[1])==1 for a in seen)}
  if updated==seen:return seen==m
  seen=updated
for q in questions:
 if not q.get('diagram'):continue
 n=q['diagram']['items'][0];root=ET.parse(f'public/question-diagrams/photo-{n}.svg').getroot();idx='ABCDE'.index(q['answers'][0])
 if n<=1040:
  original=read_grid(root,274,40);expected=rot(original) if n%2 else mirror(original)
 elif n<=1060:
  opts=[read_grid(root,20+i*122,65) for i in range(5)];assert [i for i,m in enumerate(opts) if not connected(m)]==[idx];continue
 elif n<=1080:
  first,second,third=[read_grid(root,x,40) for x in [55,190,380]];transform=rot if n%2 else mirror;assert transform(first)==second;expected=transform(third)
 else:
  first,second,third=[read_grid(root,x,40) for x in [45,195,345]];transform=rot if n%2 else lambda m:rot(rot(rot(m)));assert transform(first)==second and transform(second)==third;expected=transform(third)
 opts=[read_grid(root,50+i*145,170) for i in range(4)];assert len({tuple(sorted(m)) for m in opts})==4;assert [i for i,m in enumerate(opts) if m==expected]==[idx]
print('PASS: all 100 rendered SVG puzzles match their answer keys and have exactly one correct choice.')
