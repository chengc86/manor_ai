"""Original topic-based questions. No third-party question text or assets are imported."""
import json,random,math
from pathlib import Path
rng=random.Random(91626);bank=[]
def add(subject,prompt,answer,explanation,group='standard',options=None,**extra):
 if options is not None:
  options=list(map(str,options));assert str(answer) in options and len(options)==len(set(options));rng.shuffle(options)
 q=dict(id=f'quest-400-{len(bank)+1:03}',subject=subject,difficulty='Year 6',prompt=prompt,answers=[str(answer)],explanation=explanation,rewardGroup=group,**extra)
 if options:q['options']=options
 bank.append(q)
# Mathematics: ten skills, ten questions per skill.
def roman(n):
 s=''
 for v,c in [(1000,'M'),(900,'CM'),(500,'D'),(400,'CD'),(100,'C'),(90,'XC'),(50,'L'),(40,'XL'),(10,'X'),(9,'IX'),(5,'V'),(4,'IV'),(1,'I')]:
  while n>=v:s+=c;n-=v
 return s
for i in range(10):
 nums=[620013+i*731,620103+i*731,621003+i*731,612003+i*731]
 add('Maths',f'Which is the second smallest number: {", ".join(map(str,nums))}?',sorted(nums)[1],'Compare digits from left to right. In ascending order: '+', '.join(map(str,sorted(nums)))+'.',options=nums)
 n=237451+i*7913;place=1000 if i%2 else 100;rounded=((n+place//2)//place)*place
 add('Maths',f'Round {n} to the nearest {place}. Write digits without commas.',rounded,f'The nearest multiple of {place} is {rounded}.')
 start=-18+i;rise=23-i//2
 add('Maths',f'A freezer is at {start}°C. Its temperature rises by {rise}°C. What is the new temperature? Write a number.',start+rise,f'{start} + {rise} = {start+rise}.')
 n=144+i*37
 add('Maths',f'Write the Roman numeral {roman(n)} as an ordinary number.',n,f'{roman(n)} represents {n}. Remember that a smaller numeral before a larger one is subtracted.')
 a=739+i*27;b=198+i*10
 add('Maths',f'Calculate {a} + {b} mentally.',a+b,f'Add {b+2}, then subtract 2: {a+b+2} − 2 = {a+b}.')
 a=38476+i*917;b=27859+i*613
 add('Maths',f'Calculate {a} + {b}.',a+b,f'Align the place-value columns and carry where needed. The sum is {a+b}.')
 a=183+i*19;b=12+i
 add('Maths',f'A hall has {b} rows of {a} seats. How many seats are there?',a*b,f'{a} × {b} = {a*b}.','challenge')
 denom=[4,5,8,10,20][i%5];num=[3,2,5,7,13][i%5];total=denom*(11+i)
 add('Maths',f'Find {num}/{denom} of {total}.',num*(11+i),f'First divide {total} by {denom} to get {11+i}. Then multiply by {num}.','challenge')
 width=7+i;length=width+6;perim=2*(width+length)
 add('Maths',f'A rectangle has perimeter {perim} cm and length {length} cm. What is its width in centimetres?',width,f'Half the perimeter is {width+length}. Subtract the length {length} to get {width}.','challenge')
 price=125+i*25;pct=[12,16,20,24,28][i%5];discount=price*pct//100
 add('Maths',f'A bicycle costs £{price}. A sale reduces its price by {pct}%. What is the sale price in pounds?',price-discount,f'The discount is {pct}/100 × {price} = £{discount}. Subtract it to get £{price-discount}.','extended')
# English: 50 grammar questions and 50 questions on ten original passages.
nouns=[('courage','The climber showed courage.'),('patience','Mina waited with patience.'),('honesty','We value honesty.'),('curiosity','His curiosity grew.'),('loyalty','The story celebrates loyalty.'),('wisdom','She spoke with wisdom.'),('freedom','They dreamed of freedom.'),('confidence','Practice built her confidence.'),('kindness','The visitor remembered their kindness.'),('justice','The campaign called for justice.')]
for word,sentence in nouns:add('English',f'In “{sentence}”, which noun names an idea or quality rather than a physical object?',word,f'{word.capitalize()} is an abstract noun: it names an idea or quality.',options=[word,'ladder','kettle','pavement'])
for person,verb,past in [('Asha','choose','chosen'),('Ben','write','written'),('Cora','take','taken'),('Dylan','break','broken'),('Esme','speak','spoken'),('Felix','drive','driven'),('Grace','eat','eaten'),('Hugo','see','seen'),('Iris','draw','drawn'),('Jude','forget','forgotten')]:
 add('English',f'Complete with the past participle of “{verb}”: {person} had ___ before the bell rang.',past,f'After “had”, use the past participle: {past}.')
for prefix,word,meaning in [('mis','judge','judge incorrectly'),('dis','approve','not approve'),('re','consider','consider again'),('un','certain','not certain'),('pre','heat','heat beforehand'),('over','cook','cook too much'),('under','estimate','estimate too little'),('im','possible','not possible'),('ir','regular','not regular'),('in','complete','not complete')]:
 add('English',f'Add a prefix to “{word}” to mean “{meaning}”. Write the whole word.',prefix+word,f'The prefix {prefix}- changes {word} to {prefix+word}.')
clauses=[('Although the path was steep','we reached the summit'),('When the bell rang','the children packed their bags'),('Because the road was flooded','the driver chose another route'),('While the bread was baking','the kitchen grew warm'),('Unless the rain stops','the match will be delayed'),('After the guests had left','Ravi washed the cups'),('Before the train arrived','Leah bought a ticket'),('If the wind drops','the sailors can return'),('Since the shop was closed','Nora went home'),('As the curtain rose','the audience fell silent')]
for sub,main in clauses:add('English',f'Which is the main clause in “{sub}, {main}”?',main,f'“{main}” can stand alone as a sentence; the opening clause depends on it.',options=[main,sub,sub.split()[0],main.split()[-1]])
for i,(who,object_) in enumerate([('pupils','coats'),('artists','brushes'),('athletes','trainers'),('teachers','books'),('players','bags'),('gardeners','tools'),('doctors','notes'),('singers','scores'),('builders','helmets'),('dancers','shoes')]):
 add('English',f'The {object_} belong to several {who}. Which phrase uses the apostrophe correctly?',f"the {who}’ {object_}",f'{who.capitalize()} is already plural and ends in s, so the possessive apostrophe follows the s.','challenge',options=[f"the {who}’ {object_}",f"the {who[:-1]}’s {object_}",f"the {who} {object_}’",f"the {who} {object_}"])
stories=[
('The repaired clock','Every afternoon, Orla heard the station clock strike thirteen. Most passengers hurried past it. She began counting its chimes in a notebook, then took the notes to the caretaker. He smiled at the neat columns. A week later, the clock struck twelve at noon. Orla closed her notebook, pleased that noticing a small mistake had made a difference.',[
('What did Orla record?','the clock’s chimes',['train fares','passengers’ names','platform numbers'],'She counted the chimes in a notebook.'),('Why are the neat columns mentioned?','They show Orla worked carefully.',['They show she drew portraits.','They prove the clock was new.','They show she disliked numbers.'],'The orderly record suggests care.'),('Who received Orla’s notes?','the caretaker',['a passenger','the driver','her neighbour'],'She took her notes to the caretaker.'),('What changes by the end?','The clock gives the correct number of chimes at noon.',['The station closes.','Orla loses her notes.','The clock stops permanently.'],'Twelve chimes at noon contrast with the faulty thirteen.'),('Which theme fits best?','Careful observation can lead to useful change.',['Hurrying always saves time.','Old objects cannot be repaired.','Keeping notes is pointless.'],'Orla’s observations help resolve the problem.')]),
('The roof garden','The school roof once held only gravel. Now shallow beds contain herbs and hardy flowers. The beds cannot be too deep because wet soil is heavy. A rainwater tank supplies most of the watering. During hot weather, pupils compare the roof’s temperature with the bare playground below to investigate whether the plants help keep it cool.',[
('Why are the beds shallow?','Deep wet soil would add too much weight.',['The flowers dislike sunlight.','The pupils cannot reach them.','The tank is empty.'],'The passage links shallow beds to the weight of wet soil.'),('What supplies most of the water?','a rainwater tank',['a river','a swimming pool','bottled water'],'The tank supplies most watering.'),('What does hardy suggest about the flowers?','They can cope with difficult conditions.',['They must be kept indoors.','They never need water.','They are made of stone.'],'Hardy plants tolerate challenging conditions.'),('What are pupils investigating?','whether the plants help cool the roof',['which pupil runs fastest','whether gravel is magnetic','how deep the playground is'],'They compare temperatures to investigate cooling.'),('Which description fits this text?','an explanation of a practical project',['a fairy tale','a recipe','a personal apology'],'It explains the design and investigation of a roof garden.')]),
('A seat at the table','Jonah arrived at the chess club carrying a battered board. The other players had polished wooden sets, and he almost turned away. Then the captain cleared a space. “Your move,” she said. By the end of the first game, nobody was looking at the chipped corners of his board. They were studying the position of his pieces.',[
('Why does Jonah almost leave?','He feels embarrassed by his worn board.',['He cannot find the room.','He has no pieces.','The captain orders him out.'],'His hesitation follows the comparison with polished sets.'),('What does battered mean here?','worn and damaged',['brand-new','enormous','borrowed'],'The chipped corners explain the board’s condition.'),('How does the captain welcome him?','She makes room for him to play.',['She buys him a board.','She cancels the club.','She asks him to watch outside.'],'She clears a space and invites his move.'),('What holds the players’ attention at the end?','the position of Jonah’s pieces',['the cost of his board','the room’s windows','his bag'],'They study the game position.'),('Which message is suggested?','Skill matters more than expensive equipment.',['New boards always win games.','Clubs should exclude beginners.','Appearances reveal every ability.'],'Attention shifts from the worn board to Jonah’s play.')]),
('The river survey','To compare water clarity, volunteers lowered the same marked disc at three points along a river. They recorded the depth at which it disappeared from view. They repeated the test after heavy rain. The disc vanished sooner then, suggesting that more material was suspended in the water. The team noted that clarity alone could not prove whether the water was safe to drink.',[
('Why use the same disc?','to make the comparisons fairer',['to increase the river’s speed','to remove all dirt','to avoid recording depths'],'Keeping equipment constant supports a fair comparison.'),('What did the volunteers record?','the depth where the disc disappeared',['the river’s total length','the number of boats','the air pressure'],'The measured depth indicates visibility.'),('What happened after heavy rain?','The disc disappeared at a shallower depth.',['The disc became larger.','The river dried up.','The test was cancelled.'],'Vanishing sooner means less depth was needed.'),('What does suspended mean here?','held within the water rather than settled',['hanging from a ceiling','officially banned','frozen solid'],'The material is carried in the water.'),('Which conclusion is NOT supported?','Clear water is definitely safe to drink.',['Rain affected visibility.','Tests were repeated.','A marked disc was used.'],'The final sentence explicitly limits the safety conclusion.')]),
('The unclaimed parcel','A parcel arrived with the right street but the wrong house number. Sienna noticed that the name belonged to the neighbour who had recently moved. She could have left it beside the gate. Instead, she carried it to the post office and explained the mistake. Two days later, a postcard arrived: “My father’s photographs are safe. Thank you.”',[
('What was wrong with the address?','the house number',['the country','the street name','the postcode was mentioned as missing'],'The passage specifies the wrong house number.'),('How did Sienna recognise the name?','It belonged to a former neighbour.',['It was her own name.','She read it in a newspaper.','The post office told her first.'],'The named neighbour had recently moved.'),('What did Sienna do with the parcel?','took it to the post office',['opened it','left it at the gate','threw it away'],'She carried it to the post office.'),('What did the parcel contain?','photographs',['a chessboard','seeds','a clock'],'The postcard thanks her for the safe photographs.'),('Which quality does Sienna show?','consideration',['carelessness','impatience','boastfulness'],'She takes trouble to help the intended recipient.')]),
('Night on the hill','The last strip of orange faded behind the ridge. Below, windows pricked the valley with light. Mara tightened her scarf and listened. Without the daytime traffic, she could hear the stream far below. The hill had not become empty, she thought; it had simply changed its voice.',[
('What time of day is suggested?','dusk',['midday','early morning','late morning'],'Fading orange light and lit windows suggest dusk.'),('What creates the points of light?','windows in the valley',['stars described overhead','torches on the ridge','boats on the sea'],'The passage names the windows.'),('Why can Mara hear the stream more clearly?','The daytime traffic noise has stopped.',['The stream has moved closer.','Her scarf makes sound louder.','The hill has flattened.'],'The quieter surroundings reveal the stream’s sound.'),('What technique is used in “changed its voice”?','personification',['a literal instruction','a statistic','a rhyme'],'The hill is given the human quality of a voice.'),('What is the effect of the final thought?','It presents night as different rather than lifeless.',['It proves the hill is a person.','It warns of a traffic jam.','It explains how scarves are made.'],'Mara still hears life in the altered soundscape.')]),
('The repair café','On Saturday, volunteers set up a repair café in the hall. Visitors brought torn bags, loose chair legs and lamps that no longer worked. Repairs were free, but visitors were encouraged to watch and learn. Some objects could not be fixed safely. Those were set aside for proper recycling rather than returned as if they were sound.',[
('What was the cost of repairs?','They were free.',['£5 each','a monthly fee','the text gives an hourly price'],'The passage states repairs were free.'),('Why were visitors encouraged to watch?','so they could learn repair skills',['so they could judge a competition','so they could count the chairs','so they could sell lamps'],'Watching and learning are linked directly.'),('What happened to unsafe objects?','They were set aside for recycling.',['They were returned as repaired.','They were hidden in bags.','They were sold as new.'],'Unsafe items were directed to proper recycling.'),('What does sound mean in the final sentence?','in good working condition',['making a loud noise','musical','invisible'],'The contrast is between unsafe and reliably repaired objects.'),('Which aim is supported by the text?','reducing waste while sharing skills',['replacing every old object','selling only new lamps','teaching visitors to ignore safety'],'Repair and learning both feature, with recycling where needed.')]),
('The delayed race','The runners were ready, but a fallen branch blocked the woodland course. Some groaned when the organiser announced a delay. Priya jogged over to help the marshals move smaller twigs while an adult dealt with the heavy branch. When the race finally began, she was not first across the line. Yet the loudest cheer greeted her finish.',[
('What caused the delay?','a fallen branch',['missing shoes','a broken stopwatch','heavy fog'],'The branch blocked the course.'),('What did Priya help move?','smaller twigs',['the heavy branch alone','the finish line','a parked car'],'An adult handled the heavy branch.'),('What does groaned suggest?','Some runners were disappointed or annoyed.',['They were all delighted.','They were asleep.','They had won already.'],'Groaning signals frustration at the delay.'),('Did Priya win the race?','No, she was not first.',['Yes, by a long distance.','The race never started.','The text says everyone tied.'],'The passage says she was not first.'),('Why might she receive the loudest cheer?','People appreciate her help.',['People dislike helping.','She moved the finish line.','She cancelled the event.'],'Her contribution gives a reason for the warm response.')]),
('The museum label','The display called the stone tool a “certainly ceremonial object”. During a school visit, Amal asked how anyone could be certain. The guide explained that the object’s purpose was still debated. A month later, Amal returned and found a new label: “Possibly ceremonial; other uses have been suggested.” The tool had not changed, but the claim about it had.',[
('What did Amal question?','the certainty of the label',['the museum’s opening time','the tool’s colour','the price of admission'],'Amal asks how anyone could be certain.'),('What did the guide explain?','The object’s purpose was debated.',['The tool was definitely a toy.','The label could never change.','The object had vanished.'],'There was disagreement about its purpose.'),('Which word makes the new claim less definite?','Possibly',['ceremonial','object','uses'],'Possibly signals uncertainty.'),('What remained unchanged?','the tool itself',['the wording of the label','the level of certainty','the visitor’s question'],'The passage contrasts the unchanged tool with the revised claim.'),('What broader lesson is suggested?','Claims should reflect the strength of the evidence.',['Questions should never be asked.','All museum objects are fake.','Every debate has an immediate answer.'],'The revised label acknowledges uncertainty.')]),
('The shared orchard','Neighbours planted an orchard on unused ground. They agreed that anyone could pick ripe fruit, provided some remained for others. In the first autumn, the trees bore little. A few people complained, but the gardeners pointed to the new branches. An orchard, they said, was a promise measured in years rather than weeks.',[
('Who could pick the fruit?','anyone, while leaving some for others',['only the gardeners','only paying visitors','nobody'],'The agreement includes sharing.'),('What happened in the first autumn?','The trees produced little fruit.',['Every branch broke.','The ground was sold.','The orchard disappeared.'],'The text says the trees bore little.'),('What does bore mean here?','produced',['made someone bored','drilled into','carried a passenger'],'The trees produced fruit.'),('Why mention new branches?','They are signs of growth and future potential.',['They prove the trees are plastic.','They show fruit will never grow.','They explain the price of apples.'],'The gardeners point to growth despite the small harvest.'),('Which idea best expresses the ending?','Long-term projects need patience.',['Only quick results matter.','Sharing always prevents growth.','Trees mature in a few weeks.'],'The final sentence contrasts years with weeks.')])]
for title,passage,questions in stories:
 for p,a,distractors,e in questions:add('English',p,a,e,'challenge',options=[a,*distractors],passage=passage)
# Verbal reasoning: 25 synonyms, 25 antonyms, 25 definitions and 25 letter-code problems.
vocab=[('brief','short','lengthy','lasting only a short time'),('cautious','careful','reckless','taking care to avoid danger'),('scarce','rare','plentiful','not available in large amounts'),('reluctant','unwilling','eager','not willing or keen to act'),('vivid','bright','dull','producing a strong clear impression'),('fragile','delicate','sturdy','easily broken or damaged'),('expand','enlarge','shrink','become larger'),('conceal','hide','reveal','keep something out of sight'),('tranquil','peaceful','noisy','calm and free from disturbance'),('generous','giving','mean','willing to share more than expected'),('ancient','old','modern','belonging to a very distant past'),('precise','exact','approximate','carefully exact'),('genuine','authentic','fake','real rather than an imitation'),('drowsy','sleepy','alert','feeling ready to fall asleep'),('rapid','swift','slow','moving or happening quickly'),('vacant','empty','occupied','not currently filled or used'),('timid','shy','bold','lacking confidence around others'),('hostile','unfriendly','friendly','showing opposition or unfriendliness'),('rigid','stiff','flexible','not easily bent'),('frequent','common','rare','happening often'),('obtain','acquire','lose','get something'),('diminish','decrease','increase','become smaller or less'),('permit','allow','forbid','give permission'),('victory','success','defeat','success in a contest'),('permanent','lasting','temporary','intended to remain indefinitely')]
for idx,(word,syn,ant,definition) in enumerate(vocab):
 other=vocab[(idx+7)%25];third=vocab[(idx+13)%25]
 add('Verbal reasoning',f'Which word is closest in meaning to “{word}”?',syn,f'{word.capitalize()} means {definition}; {syn} is closest here.',options=[syn,ant,other[1],third[1]])
 add('Verbal reasoning',f'Which word is the opposite of “{word}”?',ant,f'{word.capitalize()} means {definition}. Its opposite here is {ant}.',options=[ant,syn,other[2],third[2]])
 add('Verbal reasoning',f'Which word means “{definition}”?',word,f'This definition describes {word}.',options=[word,other[0],third[0],vocab[(idx+19)%25][0]])
codewords=['LANTERN','MEADOW','COMPASS','HARBOUR','CAPTAIN','JOURNEY','LIBRARY','FEATHER','THUNDER','CRYSTAL','BLOSSOM','CURTAIN','PICTURE','KITCHEN','CUSHION','DOLPHIN','PENGUIN','VOLCANO','BICYCLE','TRUMPET','MYSTERY','HORIZON','BLANKET','SHELTER','ORCHARD']
for i,w in enumerate(codewords):
 shift=2+i%4;coded=''.join(chr((ord(c)-65+shift)%26+65) for c in w)
 add('Verbal reasoning',f'Each letter moves forward {shift} places in the alphabet, wrapping after Z. Decode {coded}.',w,f'Move every letter back {shift} places to obtain {w}.','challenge')
# Non-verbal reasoning: 100 original diagrams, five families of 20.
out=Path('public/question-diagrams');out.mkdir(exist_ok=True)
def label(x,y,t,size=18):return f'<text x="{x}" y="{y}" text-anchor="middle" font-family="Arial,sans-serif" font-size="{size}" fill="#162a43">{t}</text>'
def grid(x,y,mask,scale=24):
 return ''.join(f'<rect x="{x+c*scale}" y="{y+r*scale}" width="{scale}" height="{scale}" fill="'+('#243f67' if (r,c) in mask else 'white')+'" stroke="#62758c"/>' for r in range(3) for c in range(3))
def rot(m):return {(c,2-r) for r,c in m}
def mirror(m):return {(r,2-c) for r,c in m}
def asset(n,body,h=290):
 (out/f'photo-{n}.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 {h}"><rect width="620" height="{h}" fill="#f5f8fc"/>{body}</svg>');return {'kind':'textbook','items':[n]}
def candidates(correct,others):
 unique=[correct]
 for m in others:
  if m not in unique:unique.append(m)
 while len(unique)<4:
  m=set(rng.sample([(r,c) for r in range(3) for c in range(3)],3))
  if m not in unique:unique.append(m)
 unique=unique[:4];rng.shuffle(unique);return unique,'ABCD'[unique.index(correct)]
masks=[]
while len(masks)<20:
 m=set(rng.sample([(r,c) for r in range(3) for c in range(3)],3+(len(masks)%2)))
 if len({tuple(sorted(m)),tuple(sorted(rot(m))),tuple(sorted(rot(rot(m)))),tuple(sorted(rot(rot(rot(m))))),tuple(sorted(mirror(m)))})==5 and m not in masks:masks.append(m)
for i,m in enumerate(masks):
 for family in range(2):
  correct=rot(m) if family==0 else mirror(m);opts,answer=candidates(correct,[m,rot(rot(m)),rot(rot(rot(m))),mirror(m)])
  body=label(310,25,'Original')+grid(274,40,m)
  for j,opt in enumerate(opts):body+=grid(50+j*145,170,opt)+label(86+j*145,268,'ABCD'[j])
  n=1001+i*2+family
  add('Non-verbal reasoning','Which option shows the original pattern after '+('a quarter turn clockwise?' if family==0 else 'reflection in a vertical mirror?'),answer,('Turn each square 90 degrees clockwise around the centre.' if family==0 else 'Swap the left and right columns; the middle column stays fixed.')+f' This gives option {answer}.','challenge',options=list('ABCD'),diagram=asset(n,body))
# Odd one out: connected shading versus separated shading, with four rotated connected examples.
connected=[{(0,0),(0,1),(1,1)},{(0,0),(1,0),(2,0)},{(0,1),(1,0),(1,1),(1,2)},{(0,0),(0,1),(1,0),(1,1)}]
for i in range(20):
 base=connected[i%4];others=[];m=base
 for _ in range(4):others.append(m);m=rot(m)
 # The exceptional arrangement contains a separated square under edge-only adjacency.
 odd={(0,0),(0,1),(2,2)} if len(base)==3 else {(0,0),(0,1),(1,0),(2,2)}
 pos=i%5;others.insert(pos,odd);body=label(310,25,'Squares connect only along full edges.',17)
 for j,m in enumerate(others):body+=grid(20+j*122,65,m)+label(56+j*122,165,'ABCDE'[j])
 add('Non-verbal reasoning','Four patterns have all their shaded squares joined edge-to-edge. Which one does not?', 'ABCDE'[pos],f'Option {"ABCDE"[pos]} contains a shaded square separated from the others. Touching only at a corner does not count.','standard',options=list('ABCDE'),diagram=asset(1041+i,body,195))
# Visual analogies: infer a transformation from A to B and apply it to C.
for i,m in enumerate(masks):
 other=masks[(i+7)%20];op=rot if i%2==0 else mirror;opts,answer=candidates(op(other),[other,rot(rot(other)),rot(rot(rot(other))),mirror(other)])
 body=grid(55,40,m)+label(150,83,'→',28)+grid(190,40,op(m))+label(320,83,'so',20)+grid(380,40,other)+label(500,83,'→ ?',28)
 for j,opt in enumerate(opts):body+=grid(50+j*145,170,opt)+label(86+j*145,268,'ABCD'[j])
 add('Non-verbal reasoning','Apply the change shown by the first pair to the third pattern. Which option completes the second pair?',answer,('The first pattern turns a quarter turn clockwise.' if i%2==0 else 'The first pattern is reflected left-to-right.')+f' Applying the same change gives {answer}.','challenge',options=list('ABCD'),diagram=asset(1061+i,body))
# Sequence: rotate a marked grid repeatedly; answer options stay graphical.
for i,m in enumerate(masks):
 direction=1 if i%2==0 else 3
 def step(v):
  for _ in range(direction):v=rot(v)
  return v
 second=step(m);third=step(second);correct=step(third);opts,answer=candidates(correct,[m,second,third])
 body=grid(45,40,m)+grid(195,40,second)+grid(345,40,third)+label(520,88,'?',32)
 for j,opt in enumerate(opts):body+=grid(50+j*145,170,opt)+label(86+j*145,268,'ABCD'[j])
 add('Non-verbal reasoning','Continue the pattern sequence. Which option belongs in the empty position?',answer,('Each pattern turns a quarter turn clockwise.' if direction==1 else 'Each pattern turns a quarter turn anticlockwise.')+f' The next is {answer}.','challenge',options=list('ABCD'),diagram=asset(1081+i,body))
from collections import Counter
assert Counter(q['subject'] for q in bank)=={'Maths':100,'English':100,'Verbal reasoning':100,'Non-verbal reasoning':100}
Path('lib/quest-expansion.ts').write_text("import type {Question} from './questions';\nexport const questExpansion:Question[]="+json.dumps(bank,ensure_ascii=False,indent=2)+';\n')
print(Counter(q['subject'] for q in bank))
