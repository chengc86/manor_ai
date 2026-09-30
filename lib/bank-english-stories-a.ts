import {explain} from './bank-kit';
import {ask,type Writer,type Reading} from './bank-english-kit';
// Fiction extracts 1 and 2 (en-fiction): 'The Clock That Stopped' and 'The Baton'. Original stories written for Manor Quest.

const BY='An original story written for Manor Quest';

const clock:Reading={id:'en-read-clock',title:'The Clock That Stopped',byline:BY,pages:[
`Every Saturday for forty years, Grandpa Lin had climbed the tower at Ashcombe Manor to wind the great clock. He had started the job when he was twenty-three, and he liked to say that he and the clock had grown old together.

On the morning of the Harvest Fair, Mei found him standing in the courtyard, staring up at the clock face. Both hands pointed stubbornly at twenty past four.

"It's stopped," Grandpa said. "And the fair can't open until the clock strikes twelve. It never has."

Mei looked at the bandage on his wrist. He had sprained it on Thursday when his bicycle skidded on wet leaves, and he could not even turn a door handle.

"I could wind it," she said, before she could change her mind.

Grandpa's face lit up. Mei's stomach did not. The tower stairs were narrow and dark, and she had never liked them.`,
`There were ninety-six steps. Mei counted every one, keeping one hand on the cold stone wall. At the top, a wooden door creaked open onto a dusty room full of brass wheels, all sitting perfectly still, like sleeping giants.

"Look for anything that shouldn't be there," called Grandpa, who had climbed slowly behind her.

Mei crouched beside the largest wheel. Wedged between two of its teeth was a twig, and caught on the twig was a tuft of straw.

"Jackdaws," said Grandpa, shaking his head. "They're always trying to build nests up here. Gently does it."

Mei eased the twig free. Then, following Grandpa's instructions, she fitted the iron key into its hole and turned it. It was stiffer than she expected. She counted forty turns, one for each year Grandpa had looked after the clock, until her arm ached.

Grandpa gave the pendulum a careful push. It swished and swayed, and the room filled with a steady tick, tock, tick.`,
`Together they moved the hands to eleven fifty-eight. Then they waited by the little window, watching the crowd gather in the courtyard below: stallholders, families and Mrs Ahmed from the bakery with a tray of plum tarts.

At exactly twelve o'clock, the bell above them boomed. The floor trembled, and Mei felt the sound in her chest. Down below, a cheer rose up, and the gates swung open.

Grandpa put his good hand on her shoulder. "The clock chose a new keeper today," he said.

On the way down, Mei realised she was not counting the steps any more. She was too busy thinking about the jackdaws, and whether a little wire fence around the wheels might keep them out.

"Grandpa," she said at the bottom, "can I come up with you next Saturday?"

He smiled. "Only if you bring your strong arm."`]};

const baton:Reading={id:'en-read-baton',title:'The Baton',byline:BY,pages:[
`The relay was the last race of sports day, and Dev had been thinking about it for a whole year.

Last summer, running for Oak House, he had dropped the baton at the final changeover. It had bounced across the track, and by the time he had scooped it up, every other team had finished. Nobody had said anything unkind, but Dev had heard the silence.

Since Easter, he had practised in the park every evening with his dad. Reach, don't throw. Hold it steady. Let the next runner take it. By June, he could do it with his eyes closed, although his dad said he would rather he didn't.

Now the four Oak runners stood at their marks for the 4 × 100 metres: Zara first, then Olu, then Dev, with Amara running the final leg. Dev wiped his palms on his shorts. His heart was in his mouth.`,
`The starting whistle shrieked. Zara shot away like an arrow and handed over cleanly to Olu, who pounded down the back straight with his elbows pumping.

Then Olu was right behind Dev, shouting, "Go!" Dev ran, stretched his hand back and felt the baton slap into his palm. He did not look down. He simply ran.

Ahead of him, Amara was bouncing on her toes in the changeover box. She was so eager that she set off too soon, and for one horrible moment Dev thought she would run out of the box before he reached her. He pushed himself faster than he had ever run. Reach, don't throw.

His arm stretched out. Amara's fingers closed around the baton just before the end of the box, and she was away.

Oak crossed the line in second place, half a second behind Birch House. Dev bent over, gasping, with his hands on his knees.`,
`He was still getting his breath back when Amara crashed into him with a hug.

"You saved it!" she cried. "I went far too early. If you hadn't caught me up, we'd have been disqualified."

Dev had expected to feel disappointed about coming second. Instead, a warm, fizzy feeling was spreading through him, like lemonade in a glass.

Mr Kaur, the PE teacher, jogged over with his clipboard. "Second place," he said, grinning. "That's Oak's best relay result in five years. And those points have put Oak top of the table for the whole day."

From the Year 2 area, Dev could hear his little sister shouting his name over and over, as if he had won a gold medal.

When the equipment was packed away, Mr Kaur held out the box for the batons. Dev looked at the one in his hand for a moment, then dropped it in. He would not be needing it again until next year.`]};

export function storiesA(w:Writer){
 // The Clock That Stopped
 ask(w,clock,0,{prompt:'At what time had the clock stopped?',answer:'twenty past four',wrong:["twelve o'clock",'eleven fifty-eight',"four o'clock"],rewardGroup:'quick',
  explanation:explain("The text says 'Both hands pointed stubbornly at twenty past four.' So the clock had stopped at **twenty past four**.","- Twelve o'clock is when the fair should open, and eleven fifty-eight is the time Mei and Grandpa set later.")},
  'Both hands pointed stubbornly at twenty past four.');
 ask(w,clock,2,{prompt:'Mei and Grandpa set the clock, then waited for the bell. How many minutes passed on the clock before the bell boomed?',answer:'2 minutes',wrong:['8 minutes','12 minutes','58 minutes'],
  explanation:explain("The text says 'Together they moved the hands to eleven fifty-eight.' Then 'At exactly twelve o'clock, the bell above them boomed.'",'From 11:58 to 12:00 is **2 minutes**.','- 58 is the minutes part of 11:58, not the time they waited.',"- 12 comes from 'twelve o'clock', and 8 comes from the last digit of 58.")},
  'Together they moved the hands to eleven fifty-eight.',"At exactly twelve o'clock, the bell above them boomed.");
 ask(w,clock,0,{prompt:"When Mei offers to help, the text says 'Grandpa's face lit up.' What does this mean?",answer:'He suddenly looked very happy.',wrong:['The sun was shining on his face.','He had switched on a lamp.','His face went red with anger.'],
  explanation:explain("The text says 'Grandpa's face lit up.' straight after Mei offers to wind the clock.",'This is not about real light: it means his face suddenly showed great **happiness**, because now the fair could open.','- Nothing is shining on him, and he has no reason to be angry.')},
  "Grandpa's face lit up.");
 ask(w,clock,0,{prompt:'Which word best describes how Mei feels about climbing the tower?',answer:'apprehensive',wrong:['resentful','exasperated','overjoyed'],rewardGroup:'challenge',
  explanation:explain("When Grandpa's face lights up, the text says 'Mei's stomach did not.' The stairs were narrow and dark, and 'she had never liked them'. She offers to help 'before she could change her mind'.",'She is worried about what lies ahead: she is **apprehensive**.','- She is not resentful (bitter about being treated unfairly) or exasperated (fed up), and she is certainly not overjoyed about the stairs.')},
  "Mei's stomach did not.",'she had never liked them','before she could change her mind');
 ask(w,clock,1,{prompt:"Which **two** literary devices are used in the phrase 'It swished and swayed'?",answer:['alliteration','onomatopoeia'],wrong:['simile','metaphor','rhetorical question'],rewardGroup:'challenge',
  explanation:explain("'It swished and swayed' repeats the s sound at the start of two words: that is **alliteration**.","'swished' also sounds like the noise the pendulum makes as it moves: that is **onomatopoeia**.",'- There is no comparison using like or as (simile), no comparison saying one thing is another (metaphor) and no question.')},
  'It swished and swayed');
 ask(w,clock,1,{prompt:"The brass wheels are described as 'like sleeping giants'. What does this simile suggest?",answer:'They were huge and completely still.',wrong:['They were snoring loudly.','They were soft and comfortable.','They were broken for good.'],
  explanation:explain("The text says the wheels were 'all sitting perfectly still, like sleeping giants'.",'Giants are huge, and sleeping things do not move, so the simile suggests the wheels were **huge and completely still**, but could wake up and move again.','- The wheels make no sound and are not soft, and the clock has only stopped: it is not broken for good.')},
  'all sitting perfectly still, like sleeping giants');
 ask(w,clock,1,{prompt:'What had stopped the clock?',answer:'a twig caught between the teeth of a wheel',wrong:["Grandpa's sprained wrist",'a jackdaw sitting on the pendulum','a lost key'],
  explanation:explain("The text says 'Wedged between two of its teeth was a twig'. The twig jammed the wheel, so the clock could not move.",'- Jackdaws had brought the twig, but no bird was sitting on the pendulum.',"- Grandpa's wrist stopped him winding the clock; it did not stop the clock itself.",'- The key was not lost: Mei used it.')},
  'Wedged between two of its teeth was a twig');
 ask(w,clock,2,{prompt:"Select the **two** details that show Mei's feelings about the tower have changed by the end.",answer:['she was not counting the steps any more','can I come up with you next Saturday?'],wrong:['the bell above them boomed','a cheer rose up','Grandpa put his good hand on her shoulder'],rewardGroup:'challenge',
  explanation:explain('At the start, Mei had never liked the stairs, and on the way up she counted every one.',"By the end, the text says 'she was not counting the steps any more', and she asks, 'can I come up with you next Saturday?' Both show that her nerves have gone and she wants to come back.","- The bell, the cheer and Grandpa's hand describe what happens around her, not how her feelings about the tower have changed.")},
  'she was not counting the steps any more','can I come up with you next Saturday?');

 // The Baton
 ask(w,baton,0,{prompt:'Who ran the final leg of the relay for Oak House?',answer:'Amara',wrong:['Zara','Olu','Dev'],rewardGroup:'quick',
  explanation:explain("The text says the runners went 'Zara first, then Olu, then Dev, with Amara running the final leg'. So **Amara** ran the final leg.")},
  'Zara first, then Olu, then Dev, with Amara running the final leg');
 ask(w,baton,0,{prompt:'In the 4 × 100 metres relay, each of the four runners runs one leg of 100 metres. How far do Zara and Olu run altogether?',answer:'200 metres',wrong:['100 metres','300 metres','400 metres'],
  explanation:explain("The text says the Oak runners lined up for the '4 × 100 metres': 'Zara first, then Olu, then Dev'.",'Zara and Olu run one leg each: 2 × 100 = **200 metres**.','- 100 metres is only one leg.','- 400 metres is the whole race for all four runners, and 300 metres would be three legs.')},
  '4 × 100 metres','Zara first, then Olu, then Dev');
 ask(w,baton,0,{prompt:"The text says 'His heart was in his mouth.' What does this tell us about Dev?",answer:'He was extremely nervous.',wrong:['He had a stomach ache.','He was about to shout.','He had just eaten his lunch.'],
  explanation:explain("'His heart was in his mouth.' is an idiom: his heart has not really moved. It means he was **extremely nervous**.","Another clue comes just before it: 'Dev wiped his palms on his shorts.' Nervous hands often get sweaty.")},
  'His heart was in his mouth.','Dev wiped his palms on his shorts.');
 ask(w,baton,0,{prompt:"Why does the writer describe last year's relay at the start of the story?",answer:'to explain why Dev is so worried about the changeover',wrong:['to show that Oak House always wins','to describe the weather on sports day','to introduce Mr Kaur'],rewardGroup:'challenge',
  explanation:explain("The text says that last summer Dev 'had dropped the baton at the final changeover'.",'Knowing this helps the reader understand why Dev has practised so hard and why he is so nervous now.','- Oak House finished last in that race, so they do not always win.','- The weather and Mr Kaur are not mentioned at the start.')},
  'had dropped the baton at the final changeover');
 ask(w,baton,1,{prompt:"'Zara shot away like an arrow.' What does this simile suggest about Zara?",answer:'She set off very fast.',wrong:['She was carrying a bow.','She was thin and pointed.','She ran in the wrong direction.'],
  explanation:explain("An arrow shoots away at great speed, so the simile 'Zara shot away like an arrow' suggests that she **set off very fast**.",'- The simile compares how she moved, not what she carried or what she looked like, and nothing suggests she went the wrong way.')},
  'Zara shot away like an arrow');
 ask(w,baton,1,{prompt:'Which word best describes how Dev felt when he saw Amara set off too soon?',answer:'alarmed',wrong:['resentful','relieved','indifferent'],
  explanation:explain("The text says 'for one horrible moment Dev thought she would run out of the box before he reached her'.",'He was suddenly frightened that the changeover would go wrong: he was **alarmed**.','- He was not resentful (bitter) or indifferent (not caring): he cared a great deal.','- He only felt relieved later, once the baton was safely passed.')},
  'for one horrible moment Dev thought she would run out of the box before he reached her');
 ask(w,baton,2,{prompt:'Which phrase best describes Amara on this page?',answer:'honest and generous',wrong:['calm and careful','boastful and unkind','shy and silent'],
  explanation:explain("Amara hugs Dev and cries 'You saved it!', giving him the praise, which is **generous**.","She also admits 'I went far too early', owning up to her own mistake, which is **honest**.",'- She is not boastful or unkind, and crashing into Dev with a hug is neither calm nor shy.')},
  'You saved it!','I went far too early');
 ask(w,baton,2,{prompt:'Which sentence best sums up the main message of the story?',answer:'Practising hard can help you put right a past mistake.',wrong:['Coming first is the only thing that matters.','You should never rely on your teammates.','Sports day is too tiring to enjoy.'],rewardGroup:'extended',
  explanation:explain('Dev dropped the baton last year and practised all year. This time, his practice saved the changeover.',"Oak came second. The text says 'Dev had expected to feel disappointed about coming second', but 'Instead, a warm, fizzy feeling was spreading through him'.",'So the message is that **practising hard can help you put right a past mistake**.','- Dev is happy with second place, so coming first is not the only thing that matters, and the team help each other all the way.')},
  'Dev had expected to feel disappointed about coming second','Instead, a warm, fizzy feeling was spreading through him');
}
