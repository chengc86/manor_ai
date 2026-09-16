"""Original Year 6 / Year 2 question set; no third-party text or artwork."""
import json,random,html
from pathlib import Path
rng=random.Random(20260917);bank=[];checks=[]
def add(year,subject,prompt,answer,explanation,group='standard',options=None,**extra):
    answers=answer if isinstance(answer,list) else [str(answer)]
    q=dict(id=f'more-240-{len(bank)+1:03}',subject=subject,difficulty=f'Year {year}',prompt=prompt,answers=answers,explanation=explanation,rewardGroup=group,**extra)
    if options:
        options=list(map(str,options));assert len(set(options))==len(options) and answers[0] in options; rng.shuffle(options);q['options']=options
    bank.append(q);return q
M='Maths';E='English';V='Verbal reasoning';N='Non-verbal reasoning'
# 40 Year 6 maths questions: ten skills with four independently checkable variants.
for i in range(4):
    r,b=3+i,7+i;total=(r+b)*(9+i)
    q=add(6,M,f'A mosaic uses red and blue tiles in the ratio {r}:{b}. There are {total} tiles. How many are red?',r*(9+i),f'There are {r+b} equal parts. Each is {total} ÷ {r+b} = {9+i}; red uses {r} parts, so {r*(9+i)} tiles.','challenge');checks.append([q['id'],'ratio',[r,b,total]])
    a,b,x=3+i,7+i,8+i
    q=add(6,M,f'Solve {a} × n + {b} = {a*x+b}. What is n?',x,f'Subtract {b}, then divide by {a}: {a*x} ÷ {a} = {x}.');checks.append([q['id'],'equation',[a,b,a*x+b]])
    a,b,c=7+i,4+i,3+i
    q=add(6,M,f'A solid cuboid is {a} cm long, {b} cm wide and {c} cm high. What is its volume in cubic centimetres?',a*b*c,f'Volume = length × width × height = {a} × {b} × {c} = {a*b*c} cm³.','challenge');checks.append([q['id'],'volume',[a,b,c]])
    a,b=43+3*i,68+4*i
    q=add(6,M,f'Two angles in a triangle are {a}° and {b}°. How many degrees are in the third angle?',180-a-b,f'Triangle angles total 180°. Subtract {a} + {b} = {a+b}, leaving {180-a-b}°.');checks.append([q['id'],'angles',[a,b]])
    n=7+i;answer=n*3/4
    q=add(6,M,f'Calculate {n} × 3/4. Give your answer as a decimal.',str(answer).rstrip('0').rstrip('.') if '.' in str(answer) else str(answer),f'{n} × 3 = {n*3}; {n*3} ÷ 4 = {answer}.');checks.append([q['id'],'fraction',[n,3,4]])
    start=9*60+37+i*8;duration=87+i*9;end=start+duration
    q=add(6,M,f'A coach leaves at {start//60:02}:{start%60:02} and takes {duration} minutes. At what time does it arrive? Use 24-hour time HH:MM.',f'{end//60:02}:{end%60:02}',f'Add {duration//60} hour and {duration%60} minutes. Arrival is {end//60:02}:{end%60:02}.','challenge');checks.append([q['id'],'time',[start,duration]])
    mean=18+i;vals=[11+i,17+i,21+i,24+i];missing=mean*5-sum(vals)
    q=add(6,M,f'Five numbers have a mean of {mean}. Four are {", ".join(map(str,vals))}. What is the missing number?',missing,f'Total = 5 × {mean} = {5*mean}. The known numbers total {sum(vals)}, so the missing number is {missing}.','challenge');checks.append([q['id'],'mean',[mean,*vals]])
    price=160+40*i;discount=25;paid=price*3//4
    q=add(6,M,f'A bicycle costs £{price}. A sale takes 25% off. You pay with £{price}. How much change do you receive, in pounds?',price-paid,f'The reduction is one quarter of £{price}, or £{price-paid}. The sale price is £{paid}; the change is £{price-paid}.','challenge');checks.append([q['id'],'change',[price,discount]])
    x,y=-5+i,7+i;dx,dy=9+i,-11+i
    q=add(6,M,f'A point starts at ({x}, {y}). It moves {dx} units right and {-dy} units down. What is its new y-coordinate?',y+dy,f'Only the vertical movement changes y: {y} − {-dy} = {y+dy}.');checks.append([q['id'],'coordinate',[y,dy]])
    p=12+i*6;mult=3+i
    q=add(6,M,f'A bell rings every {p} minutes and another every {p*mult} minutes. Both ring at noon. How many minutes later will they next ring together?',p*mult,f'{p*mult} is already a multiple of {p}. The first shared interval is {p*mult} minutes.');checks.append([q['id'],'lcm',[p,p*mult]])
# Original passages: 5 questions per passage, including evidence-led inference.
stories=[
('The Lantern',"Mara reached the boathouse after sunset. The river had swallowed the last stripe of orange sky. Inside, a lantern glowed beside a pair of muddy boots. Her grandfather's coat still hung on its hook, but his bicycle was gone. Mara stopped calling his name. She remembered the note about fixing Mrs Bell's gate and turned towards the village, carrying the lantern so that its light would guide her home later.",[
('When does Mara reach the boathouse?','After sunset','The first sentence gives the time.',['At noon','Before dawn','After sunset','During breakfast']),
('What most strongly suggests that her grandfather has gone out?','His bicycle is missing','The missing bicycle suggests he has travelled elsewhere.',['His coat is hanging up','The boots are muddy','The lantern is glowing','His bicycle is missing']),
('What does “the river had swallowed” suggest about the orange reflection?','It has disappeared','The image describes the fading reflection as darkness arrives.',['It has become brighter','It has disappeared','It has turned into a fish','It has moved into the boathouse']),
('Why does Mara head towards the village?','She remembers where her grandfather planned to work','The note about Mrs Bell’s gate gives Mara a likely destination.',['She wants to buy new boots','She remembers where her grandfather planned to work','She is following his bicycle tracks','She has been told to fetch water']),
('Which description best fits Mara’s actions?','She uses clues to decide what to do','She connects the missing bicycle with the remembered note.',['She ignores all the clues','She uses clues to decide what to do','She is trying to hide the lantern','She waits without making a decision'])]),
('The Seed Swap',"The seed swap opened at ten, but Imani arrived early with six carefully labelled envelopes. Last spring she had mixed up beans and sweet peas, so this time she checked each label twice. A visitor offered her a packet with no name on it. Imani smiled, then asked what the flowers would look like and whether the seeds were safe to grow near vegetables. She chose the packet only after the visitor found its original label in his bag.",[
('How many envelopes does Imani bring?',['6','six'],'The passage says she brings six envelopes.',None),
('Why does Imani check her labels twice?','She wants to avoid repeating an earlier mistake','She mixed up two types of seed the previous spring.',['She cannot read the labels','She wants to avoid repeating an earlier mistake','She has been told to count the envelopes','She is waiting for the clock to strike ten']),
('What does “carefully” reveal about her preparation?','She has taken care to get it right','The labels and repeated checks show attention to accuracy.',['She has hurried without checking','She has taken care to get it right','She has asked someone else to do everything','She has forgotten all her seeds']),
('When does she accept the unnamed packet?','After its original label is found','She chooses it only after the visitor finds the label.',['Before asking any questions','As soon as she sees it','After its original label is found','After the seed swap closes']),
('Which quality does Imani show?','Thoughtful caution','She asks relevant questions before deciding.',['Thoughtful caution','Careless haste','Unkindness','Dishonesty'])]),
('Bridge Notes',"Our group tested two paper bridges between piles of books. The flat sheet sagged under three counters. We folded the second sheet into a zigzag, keeping the same gap and using identical counters. It held fourteen before collapsing. Leo wanted to announce that folded bridges were always stronger. Anya wrote, 'Promising result: repeat the test with more sheets.' She put the torn paper aside and took out a fresh page for the next trial.",[
('How many counters did the folded bridge hold before collapsing?',['14','fourteen'],'The passage gives fourteen counters.',None),
('Why did the group keep the gap the same?','To make the comparison fairer','Keeping the gap constant helps isolate the effect of folding.',['To avoid counting the counters','To make the comparison fairer','To make both bridges collapse immediately','To stop the books being used']),
('Why is Anya’s note more cautious than Leo’s claim?','One trial does not prove what always happens','Anya wants repeated evidence before making a general claim.',['She did not see either bridge','She thinks counters cannot be counted','One trial does not prove what always happens','She knows the books are different colours']),
('What does “sagged” mean here?','Bent downwards','The flat paper bends under the weight.',['Became shiny','Bent downwards','Flew upwards','Changed colour']),
('What is Anya most likely to do next?','Repeat the experiment','She sets aside torn paper and prepares a fresh page for another trial.',['Throw away all the counters','Repeat the experiment','Write a story about a river','Paint the books'])]),
('The Silent Hall',"On rehearsal day, the hall buzzed with chatter. As soon as Priya raised her baton, the room became still. Tomas stared at the first line of music; his hands felt damp. Beside him, Elsie silently counted four beats on her fingers. He took a slow breath and lifted his recorder. The first note wavered, but the second came out clear. Priya nodded without stopping the music, and Tomas kept playing.",[
('What action signals the start of the music?','Priya raises her baton','The room becomes still when the baton is raised.',['Elsie leaves the hall','Tomas closes his book','Priya raises her baton','Someone opens a window']),
('Which detail suggests that Tomas feels nervous?','His hands feel damp','Damp hands and a wavering first note suggest nervousness.',['The hall contains chairs','His hands feel damp','Priya owns a baton','Elsie has fingers']),
('How does Elsie help Tomas?','She silently shows the beat','Counting four beats gives him a timing cue.',['She plays his instrument for him','She changes the music','She silently shows the beat','She tells everyone to stop']),
('What does “wavered” suggest about the first note?','It was unsteady','A wavering note is not steady.',['It was unsteady','It was completely silent','It lasted all day','It was written in red']),
('How does Tomas respond to his shaky start?','He continues and improves','The second note is clear and he keeps playing.',['He refuses to play again','He continues and improves','He leaves immediately','He tears up his music'])]),
('A Notice on the Gate',"Community Garden Notice: The east gate will be closed on Saturday morning while the path is repaired. Please use the west entrance until noon. Wheelbarrows must stay in the tool shed during the repairs. Volunteers are welcome from one o'clock to help spread mulch around the young trees. Bring gloves; all other tools will be provided. If heavy rain delays the work, the new date will be posted here on Friday evening.",[
('Which entrance should visitors use on Saturday morning?',['west','west entrance','the west entrance'],'The notice directs visitors to the west entrance.',None),
('Why must wheelbarrows stay in the shed during repairs?','To keep them out of the repair work area','The restriction helps keep movement away from the path work.',['They have all been sold','To keep them out of the repair work area','No one knows how to use them','They are being used as plant pots']),
('What must volunteers bring?',['gloves','their gloves'],'The notice explicitly asks them to bring gloves.',None),
('What is the main purpose of this text?','To explain temporary access changes and ask for help','It gives practical instructions and invites volunteers.',['To tell a fictional adventure','To explain temporary access changes and ask for help','To describe the history of wheelbarrows','To advertise gloves for sale']),
('When will a changed date be announced if rain delays the work?','Friday evening','That is the time stated in the final sentence.',['Saturday at noon','Friday evening','Sunday morning','Monday afternoon'])]),
('The Exhibition',"Nico spent weeks building a model lighthouse for the exhibition. On the bus, a sudden turn sent the model sliding. The roof broke cleanly away. At the hall, he arranged the pieces beside a sketch of the finished tower and added a sign: 'How it fits together.' Visitors leaned closer to see the tiny staircase that the roof usually hid. By lunchtime, Nico had stopped apologising and was explaining each part with a grin.",[
('What causes the roof to break off?','The model slides during a sudden bus turn','The passage links the accident to the turn on the bus.',['Nico deliberately cuts it off','The model slides during a sudden bus turn','A visitor drops the tower','Rain soaks the roof']),
('Why can visitors now see the staircase?','The roof is no longer covering it','The staircase was usually hidden by the roof.',['The staircase has grown larger','A light has been installed','The roof is no longer covering it','The visitors have climbed inside']),
('How does Nico’s attitude change?','He becomes more confident about the display','He moves from apologising to explaining with a grin.',['He becomes more confident about the display','He becomes angrier with every visitor','He loses interest and goes home','He refuses to speak']),
('Which theme best fits the story?','A setback can lead to a useful new idea','Nico turns damage into an explanatory display.',['All accidents must be hidden','A setback can lead to a useful new idea','Models are never worth building','Visitors dislike learning how things work']),
('Why does the writer mention Nico’s grin at the end?','To show that he now feels pleased','The grin signals his changed feelings about the exhibition.',['To show that he has toothache','To show that he now feels pleased','To explain how the bus turns','To describe the colour of the model'])])]
for title,passage,qs in stories:
    for prompt,answer,explanation,options in qs:add(6,E,prompt,answer,explanation,'extended',options,passage=title+'\n\n'+passage)
grammar=[
('Which word is the modal verb in “The team might finish before lunch”?','might',['team','might','finish','lunch'],'Might expresses possibility.'),
('Which sentence uses the passive voice?','The parcel was delivered by Jo.',['Jo delivered the parcel.','The parcel was delivered by Jo.','Jo is carrying a parcel.','Jo will deliver the parcel.'],'The parcel receives the action; “was delivered” is passive.'),
('Choose the relative pronoun: “The painting, ___ was hanging by the door, had faded.”','which',['which','unless','because','although'],'Which introduces information about the painting.'),
('Which sentence uses a semicolon correctly?','The rain stopped; we went outside.',['The rain; stopped suddenly.','The rain stopped; we went outside.','Although; the rain stopped.','We went; outside after lunch.'],'Both sides are complete, closely linked main clauses.'),
('Choose the correctly punctuated sentence.','Before dinner, we washed our hands.',['Before dinner we, washed our hands.','Before dinner, we washed our hands.','Before, dinner we washed our hands.','Before dinner we washed, our hands.'],'The comma separates the introductory phrase from the main clause.'),
('Which word is the subject in “Beyond the fence, rabbits were hiding”?','rabbits',['Beyond','fence','rabbits','hiding'],'Rabbits are doing the hiding.'),
('Choose the correct possessive form: “The coats belonging to the children are the ___ coats.”',"children’s",["childrens","children’s","childrens’","child’s"],'Children is already plural, so add apostrophe-s.'),
('Which sentence is most suitable for a formal request?','I would be grateful if you could send the details.',['Send it now!','Give us the stuff.','I would be grateful if you could send the details.','Oi, where are the details?'],'The complete, polite wording suits a formal request.'),
('Choose the subordinating conjunction: “___ the path was slippery, we walked slowly.”','Because',['Because','And','But','Or'],'Because introduces a clause explaining the reason.'),
('Which word is an adverb in “The fox moved silently through the reeds”?','silently',['fox','moved','silently','reeds'],'Silently describes how the fox moved.')]
for p,a,o,e in grammar:add(6,E,p,a,e,options=o)
# 40 Year 6 verbal reasoning: vocabulary in context, precise analogies and codes.
vocab=[
('The fragile ornament needed careful packing.','fragile','easily broken',['very heavy','easily broken','extremely loud','newly painted']),
('The evidence was sufficient to explain the result.','sufficient','enough',['hidden','late','enough','confusing']),
('A reluctant volunteer finally agreed to help.','reluctant','unwilling',['cheerful','unwilling','experienced','wealthy']),
('The path was concealed by tall grass.','concealed','hidden',['repaired','widened','hidden','measured']),
('His account of the event was precise.','precise','exact',['exact','amusing','brief','imaginary']),
('The generous donor supplied the whole group.','generous','giving freely',['giving freely','speaking softly','working slowly','arriving early']),
('The instructions were deliberately obscure.','obscure','hard to understand',['hard to understand','easy to follow','beautifully printed','very short']),
('Water was scarce during the drought.','scarce','in short supply',['in short supply','always frozen','very deep','salty']),
('The judge remained impartial.','impartial','fair to both sides',['fair to both sides','eager to finish','unable to listen','friendly to one side only']),
('The noise began to diminish.','diminish','become less',['become less','move sideways','change colour','start again'])]
for sentence,word,a,o in vocab:add(6,V,f'In “{sentence}”, which phrase is closest in meaning to “{word}”?',a,f'In this context, {word} means {a}.',options=o)
opposites=[('temporary','permanent',['permanent','brief','recent','occasional']),('expand','contract',['contract','extend','enlarge','stretch']),('optimistic','pessimistic',['pessimistic','hopeful','confident','cheerful']),('abundant','scarce',['scarce','plentiful','numerous','ample']),('rigid','flexible',['flexible','stiff','solid','firm']),('innocent','guilty',['guilty','honest','young','gentle']),('reveal','conceal',['conceal','explain','show','display']),('advance','retreat',['retreat','approach','proceed','arrive']),('deliberate','accidental',['accidental','planned','intentional','careful']),('minor','major',['major','small','slight','limited'])]
for w,a,o in opposites:add(6,V,f'Which word is the opposite of “{w}”?',a,f'{w.capitalize()} and {a} have opposite meanings in this pairing.',options=o)
analogies=[('thermometer','temperature','ruler','length',['length','weight','speed','sound']),('caterpillar','butterfly','tadpole','frog',['frog','fish','lizard','snail']),('page','book','brick','wall',['wall','window','roof','paint']),('glove','hand','sock','foot',['foot','knee','head','arm']),('composer','music','poet','poetry',['poetry','clay','cloth','maps']),('minute','time','metre','length',['length','heat','mass','volume']),('puppy','dog','foal','horse',['horse','sheep','goat','cow']),('root','tree','foundation','building',['building','garden','cloud','path']),('oar','rowing','pedal','cycling',['cycling','sailing','running','skating']),('chapter','novel','scene','play',['play','dictionary','recipe','atlas'])]
for a,b,c,d,o in analogies:add(6,V,f'Choose the best match: {a} is to {b} as {c} is to ___ .',d,f'The relationship between {a} and {b} matches that between {c} and {d}.',options=o)
for word,shift in [('FROST',2),('BEACH',3),('PLANT',4),('RIVER',5),('CLOUD',2),('STONE',3),('BREAD',4),('CHAIR',5),('LIGHT',2),('SHORE',3)]:
    coded=''.join(chr((ord(c)-65+shift)%26+65) for c in word)
    q=add(6,V,f'A code moves each letter {shift} places forwards in the alphabet, wrapping after Z to A. How is {word} written?',coded,f'Move each letter {shift} places: '+' '.join(f'{a}→{b}' for a,b in zip(word,coded))+'.','challenge');checks.append([q['id'],'code',[word,shift]])
# 20 Year 2 maths questions, kept within familiar KS1 number/measurement contexts.
for i in range(4):
    a,b=24+5*i,13+i
    q=add(2,M,f'A shelf has {a} books. {b} more books are added. How many books are on the shelf now?',a+b,f'Add {a} and {b}: {a+b}.','quick');checks.append([q['id'],'sum',[a,b]])
    a,b=52+4*i,17+i
    q=add(2,M,f'There are {a} stickers. You give away {b}. How many stickers are left?',a-b,f'Subtract {b} from {a}: {a-b}.','standard');checks.append([q['id'],'subtract',[a,b]])
    n=3+i
    q=add(2,M,f'There are {n} bags with 5 apples in each. How many apples are there altogether?',n*5,f'Count in fives {n} times to reach {n*5}.','standard');checks.append([q['id'],'product',[n,5]])
    n=12+4*i
    q=add(2,M,f'{n} counters are shared equally between 4 children. How many counters does each child get?',n//4,f'{n} ÷ 4 = {n//4}. Each child gets {n//4} counters.','standard');checks.append([q['id'],'divide',[n,4]])
    price=35+5*i
    q=add(2,M,f'A pencil costs {price}p. You pay with £1. How much change do you get? Write the number of pence.',100-price,f'£1 is 100p. 100 − {price} = {100-price}p.','standard');checks.append([q['id'],'subtract',[100,price]])
y2stories=[('The Missing Hat','Asha left her yellow hat on a bench. A gust of wind blew it onto the grass. Ben picked it up and called her name. Asha ran back and thanked him.',[
('What colour is Asha’s hat?','yellow','The first sentence says the hat is yellow.',None),('What blows the hat off the bench?','wind','A gust of wind blows it onto the grass.',['wind','rain','a dog','Ben']),('Who picks up the hat?','Ben','Ben picks it up.',None),('Why does Asha thank Ben?','He returns her hat','He helps her get the lost hat back.',['He gives her a cake','He returns her hat','He paints the bench','He plants a tree'])]),
('Soup for Lunch','Dad chopped carrots while Eli washed two bowls. They put peas and carrots into a pan. Soon the kitchen smelled of soup. Eli waited for his bowl to cool before taking a spoonful.',[
('How many bowls does Eli wash?',['2','two'],'Eli washes two bowls.',None),('Which vegetables go into the soup?','Peas and carrots','The passage names peas and carrots.',['Peas and carrots','Beans and onions','Potatoes and cabbage','Corn and peppers']),('Why does Eli wait before eating?','The soup is hot','He waits for the soup to cool.',['The soup is hot','He has no bowl','He is outside','The spoon is missing']),('Who chops the carrots?','Dad','Dad chops the carrots in the first sentence.',None)]),
('The Class Plant','On Monday, the class planted a bean in a pot by the window. Each day, Rosa checked the soil. On Friday, she saw a tiny green shoot. She drew it in her notebook and smiled.',[
('Where is the pot?','By the window','The first sentence tells us its position.',['By the window','Under a bed','In a cupboard','Outside the gate']),('On which day does Rosa see the shoot?','Friday','The shoot appears on Friday.',None),('What colour is the shoot?','green','It is described as a tiny green shoot.',None),('Why does Rosa smile?','The bean has started to grow','Seeing the new shoot is a happy result.',['The pot has broken','The bean has started to grow','She has lost her notebook','The soil has disappeared'])])]
for title,p,qs in y2stories:
    for prompt,a,e,o in qs:add(2,E,prompt,a,e,'standard',o,passage=title+'\n\n'+p)
for p,a,o,e in [
('Choose the correct word: “Yesterday, we ___ to the park.”','walked',['walk','walked','walking','walks'],'Walked tells us the action happened in the past.'),
('Which word is an adjective in “The soft pillow fell”?','soft',['The','soft','pillow','fell'],'Soft describes the pillow.'),
('Choose the correct plural: one box, two ___.','boxes',['boxs','boxes','box','boxies'],'Add -es to box to make boxes.'),
('Which sentence is a question?','Where is my coat?',['I found my coat.','Put on your coat.','Where is my coat?','What a warm coat!'],'It asks for an answer.'),
('Which word needs a capital letter: “We visited london.”?','london',['We','visited','london'],'London is the name of a place.'),
('Choose the joining word: “I wore boots ___ it was muddy.”','because',['because','or','but','if'],'Because explains the reason.'),
('Which word is a verb in “Birds sing at dawn”?','sing',['Birds','sing','at','dawn'],'Sing is the action.'),
('Choose the correct contraction for “do not”.',"don’t",["don’t","doesn’t","didn’t","isn’t"],'The apostrophe replaces the missing o in not.')]:add(2,E,p,a,e,'quick',o)
for word,a,wrong in [('small','little',['huge','wet','late']),('quick','fast',['slow','dark','empty']),('glad','happy',['sad','tired','angry']),('begin','start',['stop','hide','drop']),('quiet','silent',['noisy','bright','busy']),('large','big',['tiny','thin','low']),('neat','tidy',['messy','muddy','rough']),('ill','sick',['well','tall','strong']),('shut','close',['open','lift','shake']),('gift','present',['letter','ticket','basket'])]:add(2,V,f'Which word means nearly the same as “{word}”?',a,f'{word.capitalize()} and {a} have similar meanings.','quick',[a,*wrong])
for words,a,e in [(['apple','pear','plum','chair'],'chair','A chair is furniture; the others are fruit.'),(['red','blue','green','spoon'],'spoon','A spoon is not a colour.'),(['cat','dog','rabbit','bus'],'bus','A bus is a vehicle; the others are animals.'),(['Monday','Friday','Sunday','summer'],'summer','Summer is a season; the others are days.'),(['shirt','coat','sock','plate'],'plate','A plate is not clothing.'),(['circle','square','triangle','banana'],'banana','A banana is fruit; the others are shapes.'),(['run','jump','skip','pencil'],'pencil','A pencil is an object; the others are actions.'),(['spring','summer','winter','Tuesday'],'Tuesday','Tuesday is a day; the others are seasons.'),(['car','train','bicycle','carrot'],'carrot','A carrot is food; the others are transport.'),(['fork','spoon','knife','pillow'],'pillow','A pillow is bedding; the others are cutlery.')]:add(2,V,'Which word does not belong with the other three?',a,e,'quick',words)
# 60 actual diagrams, with high-contrast panels and options; no placeholder artwork.
art=Path('public/question-diagrams');art.mkdir(exist_ok=True)
def grid(mask,x,y,label='',size=22):
    s=f'<g transform="translate({x} {y})" data-mask="{mask}">'
    for k in range(9):s+=f'<rect x="{k%3*size}" y="{k//3*size}" width="{size-2}" height="{size-2}" fill="{"#174e42" if mask>>k&1 else "#fff"}" stroke="#174e42"/>'
    if label:s+=f'<text x="{1.5*size}" y="{3*size+22}" text-anchor="middle">{label}</text>'
    return s+'</g>'
def turn(mask):return sum(1<<(k%3*3+2-k//3) for k in range(9) if mask>>k&1)
def mirror(mask):return sum(1<<(k//3*3+2-k%3) for k in range(9) if mask>>k&1)
def svgfile(asset,body):
    (art/f'photo-{asset}.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 350" role="img"><rect width="600" height="350" rx="12" fill="#f8faf7"/><g font-family="Arial,sans-serif" font-size="18" fill="#142e27">'+body+'</g></svg>')
def visual(year,prompt,answer_mask,body,explanation,family,operands,group='challenge'):
    asset=2001+sum(q['subject']==N for q in bank);masks=[answer_mask]
    while len(masks)<4:
        if family in ['ring','mirror','below','turn-mirror'] and 0<bin(answer_mask).count('1')<9:
            candidate=sum(1<<k for k in rng.sample(range(9),bin(answer_mask).count('1')))
        else:
            candidate=answer_mask ^ (1<<rng.randrange(9))
        if candidate not in masks:masks.append(candidate)
    rng.shuffle(masks);labels=list('ABCD');answer=labels[masks.index(answer_mask)]
    body+='<text x="24" y="218">Choose the matching option:</text>'
    for i,(mask,label) in enumerate(zip(masks,labels)):body+=grid(mask,40+i*143,238,label)
    svgfile(asset,body)
    q=add(year,N,prompt,answer,explanation,group,labels,diagram={'kind':'textbook','items':[asset]})
    checks.append([q['id'],family,operands,asset,masks])
for i in range(10):
    a,b=rng.sample(range(1,511),2);result=a|b
    body='<text x="24" y="28">Combine the shaded squares (keep overlaps shaded).</text>'+grid(a,55,65,'First')+grid(b,260,65,'Second')+'<text x="170" y="105" font-size="28">+</text><text x="390" y="105" font-size="28">= ?</text>'
    visual(6,'Overlay the two grids. A square is shaded if it is shaded in either grid. Which option is the result?',result,body,'Keep every square shaded in at least one of the two starting grids.','union',[a,b])
    a=rng.randrange(32,511);subset=a & rng.randrange(1,511)
    if subset==a:subset=1<<(a.bit_length()-1)
    result=a&~subset
    body='<text x="24" y="28">Remove from First all squares shaded in Second.</text>'+grid(a,55,65,'First')+grid(subset,260,65,'Second')+'<text x="170" y="105" font-size="28">−</text><text x="390" y="105" font-size="28">= ?</text>'
    visual(6,'Start with the First grid. Unshade every square shown shaded in the Second grid. Which option remains?',result,body,'Only shaded squares from First that are absent from Second remain.','difference',[a,subset])
    a=rng.randrange(1,511);result=mirror(turn(a))
    body='<text x="24" y="28">1. Turn clockwise 90°.  2. Reflect left to right.</text>'+grid(a,80,72,'Start')+'<text x="220" y="110">Follow both steps → ?</text>'
    visual(6,'Turn the grid 90° clockwise, then reflect it in a vertical mirror line. Which option shows the final grid?',result,body,'Rotate first; then swap the left and right columns. The order matters.','turn-mirror',[a])
    a,b=rng.sample(range(1,511),2);result=a^b
    body='<text x="24" y="28">Shade squares found in ONE grid, but not both.</text>'+grid(a,55,65,'First')+grid(b,260,65,'Second')+'<text x="390" y="105" font-size="28">→ ?</text>'
    visual(6,'Combine the grids, but leave any square shaded in both grids unshaded. Which option is correct?',result,body,'A square stays shaded only when exactly one starting grid shades it.','xor',[a,b])
for i in range(10):
    # One highlighted square travels a stated direction around the edge.
    ring=[0,1,2,5,8,7,6,3];start=i%8;step=1 if i<8 else 2;seq=[1<<ring[(start+j*step)%8] for j in range(3)];ans=1<<ring[(start+3*step)%8]
    body=f'<text x="24" y="28">Move {step} square{"s" if step>1 else ""} clockwise around the outside each time.</text>'
    for j,m in enumerate(seq):body+=grid(m,35+j*145,65,str(j+1))
    body+='<text x="500" y="105" font-size="28">?</text>'
    visual(2,'The shaded square moves around the outside of the grid as shown. Which grid comes next?',ans,body,f'Continue moving {step} square'+('s' if step>1 else '')+' clockwise around the outside.','ring',[start,step],group='standard')
for a in [3,65,9,264,129]:
    body='<text x="24" y="28">Flip left and right, as in a mirror.</text>'+grid(a,85,70,'Start')+'<path d="M300 50V155" stroke="#8b5bba" stroke-width="3" stroke-dasharray="6 5"/><text x="400" y="108" font-size="28">?</text>'
    visual(2,'Which option shows the starting grid flipped left to right?',mirror(a),body,'The left column becomes the right column. The middle column stays in place.','mirror',[a],group='standard')
for i in range(5):
    a=1<<i;ans=a|(1<<(i+3))
    body='<text x="24" y="28">Add a shaded square directly below the shaded square.</text>'+grid(a,85,70,'Start')+'<text x="280" y="108" font-size="28">→ ?</text>'
    visual(2,'Keep the shaded square and shade the square directly below it as well. Which option is correct?',ans,body,'Keep the original shaded square and add the one immediately underneath.','below',[a],group='quick')
assert len(bank)==240,len(bank)
for year,count in [(6,40),(2,20)]:
    for s in [M,E,V,N]:assert sum(q['subject']==s and q['difficulty']==f'Year {year}' for q in bank)==count,(year,s)
Path('lib/more-questions.ts').write_text("import type {Question} from './questions';\nexport const moreQuestions:Question[]="+json.dumps(bank,ensure_ascii=False,indent=2)+';\n')
Path('tests/more-question-cases.json').write_text(json.dumps(checks,indent=2)+'\n')
print('Generated 240 original questions: 160 Year 6, 80 Year 2; 60 diagrams.')
