import {explain} from './bank-kit';
import {ask,type Writer,type Reading} from './bank-english-kit';
// Fiction extracts 3 and 4 (en-fiction): 'The Strawberry Thief' and 'The Tin Under the Oak'. Original stories written for Manor Quest.

const BY='An original story written for Manor Quest';

const thief:Reading={id:'en-read-strawberry',title:'The Strawberry Thief',byline:BY,pages:[
`Someone was stealing Grandma's strawberries.

On Sunday evening, Poppy had counted thirty ripe ones, glowing red under the leaves of plot 14. On Monday morning, there were only eighteen, and three of those had big bites taken out of them.

"Well, that's a mystery," said Grandma, lowering herself onto her upturned bucket.

Poppy did not think it was a mystery at all. On the next plot, Mr Hollis was already at work, bent over his own strawberry bed. Everyone at the allotments knew that he wanted to win the fruit prize at the village show. Everyone knew he was grumpy, too: he had once told Poppy off for leaving the gate open.

"It's him," Poppy whispered. "He wants to make sure our strawberries can't beat his."

Grandma raised her eyebrows. "That's a big idea, built on no evidence at all," she said. "Detectives need proof."`,
`So Poppy found proof. Her school's eco club had a wildlife camera that switched itself on whenever something moved, and Mrs Osei let her borrow it for the week.

On Tuesday evening, Poppy strapped the camera to a bamboo cane beside the strawberry bed and pointed it at the plants. She hardly slept that night. In her head, she could already see the photograph: Mr Hollis, creeping between the rows in the moonlight with a basket.

On Wednesday, she ran to the allotment before breakfast. Four more strawberries had vanished. With trembling fingers, she opened the pictures on Grandma's laptop.

The first photograph showed a pale stripe in the darkness. The second showed a long snout and a pair of small, glinting eyes. The third was perfectly clear: a badger, sitting in the middle of the strawberry bed, with a strawberry in its mouth.

Poppy stared at the screen. Her cheeks began to burn.`,
`That afternoon, Poppy took the laptop over to Mr Hollis. She had practised what to say, but it came out in a rush.

"I thought you were taking our strawberries," she said. "I'm sorry. It was a badger."

Mr Hollis looked at the photograph for a long time. Then, to Poppy's astonishment, he began to chuckle. "So that's who has been digging up my lettuces," he said. "I blamed the rabbits."

He fetched a roll of green netting and some bamboo canes from his shed. Together, the three of them built a low cage over Grandma's strawberries, and then another over his. Mr Hollis showed Poppy how to pin the edges down with bricks so that a clever snout could not push underneath.

When they had finished, he handed Poppy the ripest strawberry from his own bed. "For the detective," he said.

On the walk home, Grandma squeezed her hand. "Proof," she said, "is often more surprising than a guess."`]};

const tin:Reading={id:'en-read-tin',title:'The Tin Under the Oak',byline:BY,pages:[
`It had rained for three days of half-term, and Isaac and his cousin Freya had run out of things to do. So when Grandma said they could explore the attic, they were up the ladder before she had finished the sentence.

The attic was crammed with boxes, broken lamps and rolls of old carpet. The rain drummed its fingers on the roof above them as they rummaged. It was Freya, who was two years younger than Isaac and twice as nosy, who found the shoebox.

Inside, folded into a small square, was a map. It had been drawn in felt-tip pen, and across the top, in large wobbly capitals, were the words: PROPERTY OF MARGARET PRICE, AGED 10. KEEP OUT.

"Margaret Price," Isaac said slowly. "That's Grandma."

At the bottom of the map was a drawing of the garden, a large X beneath the old oak tree and a set of instructions.`,
`By the afternoon, the rain had stopped. The cousins stood by the back door with a trowel and read the instructions again: From the back door, walk 20 paces towards the oak. Then walk 5 paces left. DIG!

Isaac counted out twenty long strides and five more to the left. He ended up in the middle of the vegetable patch, nowhere near the oak tree.

"That can't be right," he said, frowning at the cabbages.

Freya studied the map. Then she looked at Isaac's long legs, and at her own.

"Grandma was only ten when she drew this," she said. "Her steps would have been much shorter than yours. Let me try."

She walked twenty small steps and five more to the left, and stopped right beside the roots of the oak. Isaac knelt down and began to dig. The soil was soft after the rain, and after a few minutes the trowel struck something with a dull clunk: a rusty biscuit tin.`,
`Inside the tin, wrapped in a plastic bag, were four treasures: a blue glass marble, a badge shaped like a strawberry, a photograph of a gap-toothed girl on a bicycle and a letter.

To whoever finds this, the letter began. I buried this tin in the summer I turned ten. I hope you are having an adventure. Please look after my marble. It is my luckiest one.

The cousins carried everything into the kitchen. Grandma put on her glasses, picked up the photograph and went very quiet. Then she laughed, although her eyes were shining with tears.

"I'd completely forgotten," she said softly. "That was fifty years ago. I was so proud of that map."

That evening, the three of them sat round the kitchen table and chose new treasures to add: one of Isaac's football stickers, a drawing by Freya and a letter from all three of them. Then they put the marble back, closed the lid and buried the tin under the oak again, ready for the next adventurers.`]};

export function storiesB(w:Writer){
 // The Strawberry Thief
 ask(w,thief,0,{prompt:'The text gives the number of ripe strawberries on Sunday evening and on Monday morning. What is the difference between these two numbers?',answer:'12',wrong:['18','30','48'],
  explanation:explain("The text says 'Poppy had counted thirty ripe ones' on Sunday, and on Monday 'there were only eighteen'.",'The difference is 30 − 18 = **12**.','- 18 and 30 are the two numbers themselves, and 48 comes from adding them instead of subtracting.')},
  'Poppy had counted thirty ripe ones','there were only eighteen');
 ask(w,thief,0,{prompt:'Which **two** of these statements about Mr Hollis are given on this page?',answer:['He wanted to win the fruit prize at the village show.','He had once told Poppy off for leaving the gate open.'],wrong:['He had been seen on the wildlife camera.','He had strawberry juice on his hands.','He had asked Grandma for some strawberries.'],
  explanation:explain("The text says 'Everyone at the allotments knew that he wanted to win the fruit prize at the village show.' It also says 'he had once told Poppy off for leaving the gate open'.",'- The camera is not used until the next page, and it shows a badger, not Mr Hollis.','- Nothing is said about strawberry juice or Mr Hollis asking for strawberries.')},
  'he wanted to win the fruit prize at the village show','he had once told Poppy off for leaving the gate open');
 ask(w,thief,0,{prompt:'Which word best describes Grandma on the first page?',answer:'sensible',wrong:['furious','careless','gloomy'],
  explanation:explain("Grandma does not rush to blame anyone. She says Poppy's idea is 'built on no evidence at all' and that 'Detectives need proof.'",'She wants facts before deciding: she is **sensible**.','- She stays calm, so she is not furious, and she thinks carefully, so she is not careless.','- Nothing she says is gloomy.')},
  'built on no evidence at all','Detectives need proof.');
 ask(w,thief,1,{prompt:'Where did Poppy get the wildlife camera?',answer:"She borrowed it from her school's eco club.",wrong:['Grandma bought it for her.','Mr Hollis lent it to her.','She found it in the shed.'],rewardGroup:'quick',
  explanation:explain("The text says 'Her school's eco club had a wildlife camera' and 'Mrs Osei let her borrow it for the week'. So she **borrowed it from her school's eco club**.")},
  "Her school's eco club had a wildlife camera",'Mrs Osei let her borrow it for the week');
 ask(w,thief,1,{prompt:'The writer describes the three photographs one at a time. What effect does this have?',answer:'It builds suspense before the badger is revealed.',wrong:['It shows that the camera was broken.','It proves that Mr Hollis was the thief.','It explains how wildlife cameras work.'],rewardGroup:'challenge',
  explanation:explain("The first photograph shows only 'a pale stripe in the darkness', the second a snout and eyes, and then 'The third was perfectly clear'.",'Giving one clue at a time keeps the reader guessing, which **builds suspense** before the badger is revealed.','- The camera works well, and the photographs show a badger, not Mr Hollis.')},
  'a pale stripe in the darkness','The third was perfectly clear');
 ask(w,thief,1,{prompt:"'Her cheeks began to burn.' What does this show about Poppy?",answer:'She felt embarrassed.',wrong:['She had been out in the sun too long.','She was standing too close to a fire.','She was feeling very cold.'],
  explanation:explain('Poppy has just discovered that the thief was a badger, not Mr Hollis, whom she had blamed.',"'Her cheeks began to burn.' means her face went hot and red because she felt **embarrassed**. It is not real burning.")},
  'Her cheeks began to burn.');
 ask(w,thief,2,{prompt:'How does Mr Hollis react when he sees the photograph?',answer:'He is amused.',wrong:['He is furious with Poppy.','He is frightened of the badger.','He is upset about the village show.'],
  explanation:explain("The text says 'to Poppy's astonishment, he began to chuckle'. A chuckle is a quiet laugh, so he is **amused**, not angry.","- He even jokes that the badger has been 'digging up my lettuces'.")},
  "to Poppy's astonishment, he began to chuckle",'digging up my lettuces');
 ask(w,thief,2,{prompt:'What lesson does Poppy learn in this story?',answer:'You should find proof before you blame someone.',wrong:['Badgers make good pets.','Grumpy people are always unkind.','It is best not to grow strawberries.'],rewardGroup:'extended',
  explanation:explain("Poppy blamed Mr Hollis because of a guess, but the proof showed a badger. She tells him, 'I'm sorry. It was a badger.' Grandma adds that proof 'is often more surprising than a guess'.",'So the lesson is that you should **find proof before you blame someone**.','- Mr Hollis turns out to be kind and helpful, so people who seem grumpy are not always unkind.','- Nothing suggests that badgers make good pets or that growing strawberries is a bad idea.')},
  "I'm sorry. It was a badger.",'is often more surprising than a guess');

 // The Tin Under the Oak
 ask(w,tin,0,{prompt:'Who found the shoebox?',answer:'Freya',wrong:['Isaac','Grandma','Isaac and Freya together'],rewardGroup:'quick',
  explanation:explain("The text says 'It was Freya, who was two years younger than Isaac and twice as nosy, who found the shoebox.' So **Freya** found it.")},
  'It was Freya, who was two years younger than Isaac and twice as nosy, who found the shoebox.');
 ask(w,tin,0,{prompt:"Which literary device is used in 'The rain drummed its fingers on the roof'?",answer:'personification',wrong:['simile','exaggeration','rhetorical question'],
  explanation:explain("The text says 'The rain drummed its fingers on the roof'. Rain does not really have fingers: giving it a human action, drumming its fingers, is **personification**. It makes the rain sound restless, like the bored cousins.",'- There is no like or as (simile), nothing is made bigger than it really is (exaggeration) and there is no question.')},
  'The rain drummed its fingers on the roof');
 ask(w,tin,0,{prompt:"What does 'crammed' mean in the sentence 'The attic was crammed with boxes, broken lamps and rolls of old carpet'?",answer:'packed very full',wrong:['completely empty','neatly tidied','locked up'],rewardGroup:'quick',
  explanation:explain("The text says 'The attic was crammed with boxes, broken lamps and rolls of old carpet.'",'**crammed** means **packed very full**: there were so many boxes, lamps and rolls of carpet that there was hardly any space.','- completely empty is the opposite, and nothing says the attic was tidy or locked.')},
  'The attic was crammed with boxes, broken lamps and rolls of old carpet.');
 ask(w,tin,0,{prompt:'How did Isaac know that the map had belonged to Grandma?',answer:"He recognised the name Margaret Price as Grandma's name.",wrong:['Grandma had told them about the map.','The map had a photograph of Grandma on it.',"Freya recognised Grandma's handwriting."],
  explanation:explain("The map says 'PROPERTY OF MARGARET PRICE, AGED 10', and Isaac says slowly, 'Margaret Price… That's Grandma.' He **recognised her name**.",'- Grandma had not mentioned the map, and there is no photograph on it.','- Isaac is the one who works it out, not Freya.')},
  'PROPERTY OF MARGARET PRICE, AGED 10',"That's Grandma.");
 ask(w,tin,1,{prompt:"Why did Freya's steps lead to the right place when Isaac's did not?",answer:'Her steps were short, like those of the ten-year-old who drew the map.',wrong:['She walked in a different direction.','She had watched Grandma bury the tin.','Isaac counted the wrong number of steps.'],rewardGroup:'challenge',
  explanation:explain("Freya says 'Grandma was only ten when she drew this' and 'Her steps would have been much shorter than yours.'","Isaac's long strides took him too far. Freya's small steps were closer in size to a ten-year-old's, so they matched the map.",'- Both cousins walked twenty steps and then five to the left, so the number of steps and the direction were the same.')},
  'Grandma was only ten when she drew this','Her steps would have been much shorter than yours.');
 ask(w,tin,1,{prompt:'Which word best describes Freya in this part of the story?',answer:'observant',wrong:['careless','timid','boastful'],
  explanation:explain("The text says 'Freya studied the map. Then she looked at Isaac's long legs, and at her own.' She notices small details and uses them to solve the problem: she is **observant**.",'- She is careful rather than careless and confident rather than timid, and she does not boast.')},
  "Freya studied the map. Then she looked at Isaac's long legs, and at her own.");
 ask(w,tin,2,{prompt:'Which treasure does the letter ask the finder to look after?',answer:'the blue glass marble',wrong:['the strawberry badge','the photograph','the map'],
  explanation:explain("The letter says 'Please look after my marble. It is my luckiest one.' The marble in the tin is 'a blue glass marble'.",'So the letter asks the finder to look after **the blue glass marble**.','- The badge and the photograph were in the tin too, but the letter does not ask anyone to look after them.','- The map was in the shoebox in the attic, not in the tin.')},
  'Please look after my marble. It is my luckiest one.','a blue glass marble');
 ask(w,tin,2,{prompt:'Which word best describes how Grandma feels when she sees what is in the tin?',answer:'nostalgic',wrong:['resentful','indifferent','furious'],rewardGroup:'challenge',
  explanation:explain("Grandma 'went very quiet'. Then she laughed, 'although her eyes were shining with tears', and said 'I'd completely forgotten'.",'She feels happy and a little sad as she remembers her childhood. That feeling is **nostalgic**.','- She is not resentful (bitter) or furious (very angry), and she clearly cares, so she is not indifferent.')},
  'went very quiet','although her eyes were shining with tears',"I'd completely forgotten");
}
