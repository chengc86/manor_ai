import {explain} from './bank-kit';
import {ask,type Writer,type Reading} from './bank-english-kit';
// Non-fiction text 3 (en-non-fiction): a diary of a school residential trip. Pinewood Lodge is made up.

const diary:Reading={id:'en-read-diary',title:'My Residential Trip Diary',byline:'An original diary written for Manor Quest',pages:[
`Monday 9th June

Dear Diary,
The coach left school at quarter to nine this morning, and we arrived at Pinewood Lodge at quarter past eleven. My legs had gone to sleep, but I didn't care, because the first thing I saw was a lake that sparkled like a sheet of tinfoil.

Our dormitory has three bunk beds, and I am sharing it with Keira, Bea, Nadia, Hana and Iris. I got a top bunk! Keira snores, but she says she doesn't.

This afternoon we did team games in the woods. We had to get everyone across a pretend swamp (really a patch of grass) using only three planks. My team fell in twice, which meant we were eaten by imaginary crocodiles, but on the third go we made it.

At bedtime, I felt a bit wobbly when I thought about Mum and my cat, Pickle. Then Bea passed me a biscuit through the gap between the bunks, and I felt better.`,
`Tuesday 10th June

Dear Diary,
Today was the day of the climbing wall. It is twelve metres high, taller than our whole school, and I was sure I would never get to the top.

Our instructor, Sam, said the secret was to use your legs, not your arms. Halfway up, my knees started shaking, and I looked down, which was a mistake. Then I heard Nadia shouting, "Come on, Jaya! You've got this!" from the bottom. I took a deep breath, reached for the next hold, and kept going. When I slapped the bell at the top, everyone cheered.

In the afternoon we went canoeing. Iris and I shared a canoe, and we spent most of the time going round in circles. Just before the end, we both leaned the same way at the same time and tipped straight into the lake. The water was freezing! We laughed so much that Sam had to help us back in.`,
`Wednesday 11th June

Dear Diary,
I can't believe it is the last day already. This morning we did orienteering, which means finding your way round the woods with a map and a compass. Our group found all ten checkpoints, although we walked past number seven three times before Hana spotted it behind a fallen tree.

After lunch we packed our bags. Keira couldn't find her other trainer anywhere, and we hunted for ages until Nadia found it inside Keira's own pillowcase. Nobody knows how it got there.

On the coach home, I sat next to the window and watched the lake get smaller and smaller until it disappeared behind the hills. On Monday night I had wanted to go home. Now I wanted to stay for another week.

When we pulled into the school car park, Mum was waving, and Pickle was sitting in his basket on the back seat of our car. I have so much to tell them both.`]};

export function nonFictionB(w:Writer){
 ask(w,diary,0,{prompt:'How many children sleep in the dormitory, including the writer?',answer:'6',wrong:['5','3','7'],
  explanation:explain("The writer says 'Our dormitory has three bunk beds, and I am sharing it with Keira, Bea, Nadia, Hana and Iris.'",'That is five other children plus the writer: 5 + 1 = **6**. It matches the three bunk beds, because each bunk bed sleeps two: 3 × 2 = 6.','- 5 forgets to count the writer herself.')},
  'Our dormitory has three bunk beds, and I am sharing it with Keira, Bea, Nadia, Hana and Iris.');
 ask(w,diary,0,{prompt:"Which literary device is used in 'a lake that sparkled like a sheet of tinfoil'?",answer:'simile',wrong:['metaphor','personification','onomatopoeia'],rewardGroup:'quick',
  explanation:explain("In 'a lake that sparkled like a sheet of tinfoil', the lake is compared to tinfoil using the word **like**, so this is a **simile**. It suggests the water was bright and shiny.",'- A metaphor would say the lake **was** a sheet of tinfoil.','- The lake is not given human actions (personification), and there is no sound word (onomatopoeia).')},
  'a lake that sparkled like a sheet of tinfoil');
 ask(w,diary,0,{prompt:'Which word best describes how the writer felt at bedtime on Monday?',answer:'homesick',wrong:['jealous','furious','bored'],
  explanation:explain("The writer says 'I felt a bit wobbly when I thought about Mum and my cat, Pickle.' She was missing home: she felt **homesick**.","- Nothing suggests she was jealous, furious or bored, and Bea's biscuit soon made her feel better.")},
  'I felt a bit wobbly when I thought about Mum and my cat, Pickle.');
 ask(w,diary,1,{prompt:'The climbing wall is twelve metres high. About how high up was the writer when her knees started shaking?',answer:'6 metres',wrong:['12 metres','3 metres','24 metres'],
  explanation:explain("The text says 'It is twelve metres high' and 'Halfway up, my knees started shaking'.",'Half of 12 metres is 12 ÷ 2 = **6 metres**.','- 12 metres is the top of the wall, and 24 metres doubles the height instead of halving it.','- 3 metres would be only a quarter of the way up.')},
  'It is twelve metres high','Halfway up, my knees started shaking');
 ask(w,diary,1,{prompt:'What helped the writer to keep climbing?',answer:'hearing Nadia shout encouragement from the bottom',wrong:['looking down at the ground','using her arms instead of her legs','hearing the bell ring'],
  explanation:explain("When her knees were shaking, the writer heard Nadia shouting, 'Come on, Jaya! You've got this!' Straight after that, she says 'I took a deep breath, reached for the next hold, and kept going.'","So Nadia's **encouragement** helped her carry on.","- She says she looked down, 'which was a mistake', and Sam said to use your legs, not your arms.",'- The bell only rang when she reached the top.')},
  "Come on, Jaya! You've got this!",'I took a deep breath, reached for the next hold, and kept going.','which was a mistake');
 ask(w,diary,1,{prompt:"'The water was freezing!' What does 'freezing' mean here?",answer:'very cold',wrong:['turning into ice','completely still','very deep'],rewardGroup:'quick',
  explanation:explain("The writer and Iris 'tipped straight into the lake', so the water was still liquid, not ice. 'The water was freezing!' is an exaggeration that means **very cold**.")},
  'tipped straight into the lake','The water was freezing!');
 ask(w,diary,2,{prompt:"How have the writer's feelings about being away from home changed by Wednesday?",answer:'On Monday she wanted to go home, but now she wants to stay longer.',wrong:['On Monday she wanted to stay, but now she wants to go home.','She has felt homesick all week.','She has not thought about home at all.'],rewardGroup:'challenge',
  explanation:explain("The writer says 'On Monday night I had wanted to go home.' and then 'Now I wanted to stay for another week.'",'Her feelings have turned around: she **wanted to go home at first, but now wants to stay longer**.','- She was not homesick all week, and she does think about home: she has so much to tell Mum and Pickle.')},
  'On Monday night I had wanted to go home.','Now I wanted to stay for another week.');
 ask(w,diary,2,{prompt:'Select the **two** features that show this text is a diary.',answer:['It is written in the first person, using I and we.','Each entry begins with a date.'],wrong:['It gives a list of instructions to follow.','Its lines rhyme in pairs.','It has subheadings written as questions.'],rewardGroup:'challenge',
  explanation:explain("Each entry starts with a date, such as 'Wednesday 11th June', and the writer tells her own story using I and we: 'I can't believe it is the last day already.'",'These are two key features of a **diary**.','- There are no instructions, rhymes or question subheadings in this text.')},
  'Wednesday 11th June',"I can't believe it is the last day already.");
}
