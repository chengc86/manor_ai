import {explain,type Topic} from './bank-kit';
import {writer,ask,type Reading} from './bank-english-kit';
// SATs practice: reading comprehension in the style of the KS2 English reading paper. Three original texts (a story,
// an information text and a poem), eight questions each, covering the content domains: vocabulary in context,
// retrieval, summary, inference with evidence, prediction, the writer's choices, structure and comparison.
// Everything here was written for Manor Quest. Append new texts at the end.

const topic:Topic={id:'en-sats-reading',subject:'English',strand:'SATs practice',title:'SATs reading comprehension',helpsheet:{
 intro:'In the reading paper you read three texts and answer questions about them. Every answer is in the text or can be worked out from it, so the skill is finding the right part quickly and checking it carefully.',
 steps:[
  'Read the question first and pick out its key words. Skim the text for those words, or words that mean the same, then read the sentences around them.',
  'Decide what kind of question it is: **find it** (retrieval), **work it out** (inference from clues), **what does this word mean here** (vocabulary), **why did the writer choose this** (language and structure) or **what is it mainly about** (summary).',
  'Check every option against the text before you choose. An option can be true in real life and still be wrong, because the text does not say it.',
  'For "Select the **two**" questions, test each option on its own: keep it only if the text supports it, and make sure you have exactly two.',
  'For a prediction, ask what the text has set up: the most likely ending follows the clues, not your own wishes.',
 ],
 example:{title:'Working it out',lines:['Text: Jonah pulled his hood up, stared at the puddles and sighed. "Not again," he muttered.','Question: How does Jonah feel about the weather?',"Clues: 'pulled his hood up' and 'puddles' show it is raining; 'sighed' and 'Not again' show he has had enough of it.",'Answer: fed up. (Not frightened: nothing scares him. Not pleased: people do not sigh at good news.)']},
 tips:['Do not choose an answer just because it sounds true: it must match this text.','A word can have several meanings; choose the one that fits the sentence it is in.','When a question quotes a line, find that exact line and reread the lines before and after it.','Watch out for options that use words from the text but say something different.'],
}};

// ---- Text 1: a story -------------------------------------------------------------------------------------------------
const lamp:Reading={id:'en-read-sats-story',title:'The Lamp Room',byline:'An original story written for Manor Quest',pages:[
`The radio crackled just as Priya was buttering her toast.

"Gale warning," said the flat voice. "Strong winds expected from the south-west by late afternoon."

Grandad switched it off and looked out of the kitchen window, where the sea was still grey and calm, as flat as a sheet of tin. He said nothing, but Priya saw him glance at the stairs that curled up through the middle of the house, past the bedrooms, past the store room, all the way to the lamp room at the top.

"It'll be fine," he said, mostly to himself.

Priya had come to stay with Grandad for the half-term holiday. His house was not like other houses. It was tall and round and painted white, and it stood on its own at the very end of the headland, with nothing beyond it but rocks and water. Every evening, when the sky turned purple, Grandad climbed the stairs and the great lamp began to turn.

"Do you want some help today?" asked Priya.

Grandad shook his head. "Not with the lamp. The lamp is my job."`,
`By three o'clock the sky had changed its mind. Clouds the colour of slate piled up over the water, and the wind began to whine around the tower like a dog that wanted to be let in. Grandad pulled on his coat and went out to drag the little rowing boat higher up the slipway.

He was gone a long time. When he came back, he was limping, and his face was pale.

"Slipped on the weed," he said, lowering himself into his chair with a grunt. "Nothing broken. But I shan't be climbing any stairs tonight."

Priya looked at the clock, then at the window, where the light was already draining out of the day. She thought of the fishing boats that would be hurrying home, looking for the beam that told them where the rocks were.

"I can do it," she said.

"It's a hundred and twelve steps," said Grandad.

"I know. I counted them on Monday."

He studied her for a long moment. Then he reached into his pocket and held out a small brass key.

"The switch is red," he said. "Turn the key first, then press it. And Priya? Hold the rail."`,
`The stairs seemed steeper in the dark. The wind was louder up here, booming against the walls, and the whole tower hummed faintly, like something alive. Priya counted under her breath and kept one hand on the cold rail, just as she had promised.

The lamp room was all glass. Rain streamed down the windows, and beyond them there was nothing but blackness. For a second she stood completely still, her heart thudding. Then she found the keyhole, turned the key and pressed the red switch.

Light leapt out across the water. The great lens began to turn, slowly and heavily, and the beam swept over the waves, picking out the white crests one after another before swinging away into the dark.

Priya let out a breath she had not known she was holding.

She stayed until the beam had gone round three times. Then she climbed carefully down, all one hundred and twelve steps, to where Grandad was waiting at the bottom with his foot on a cushion and a mug of cocoa in each hand.

"Well," he said. "I suppose it's our job now."`]};

// ---- Text 2: an information text -------------------------------------------------------------------------------------
const canals:Reading={id:'en-read-sats-info',title:'Canals: The Water Roads',byline:'An original information text written for Manor Quest',pages:[
`Before the railways

Imagine trying to move a cartload of coal or a stack of heavy pots across the country on a muddy track full of holes. More than two hundred years ago, that was the only choice for many traders, and it was slow, bumpy and expensive. Fragile goods often arrived broken.

Then engineers had an idea. Water carries weight easily. A single horse walking along a path can pull a boat loaded with far more than it could ever drag along a road, because the water holds the boat up and the boat slides smoothly along. If rivers did not reach the towns that needed them, why not dig new channels of water instead?

These rivers made by people were called canals. Over the following decades, a web of them spread across the country, linking coal mines, factories, farms and ports. For a while, the canal was the fastest and cheapest way to move almost anything that was too heavy to carry.`,
`Digging by hand

There were no diggers or bulldozers. Canals were cut by thousands of workers known as navvies, armed with little more than picks, shovels and wheelbarrows. The word navvy is short for navigator, because canals were sometimes called navigations.

A canal has to be almost perfectly flat, since water will not stay on a slope. Where the land rose or fell, the engineers built locks. A lock is a short stretch of canal with a watertight gate at each end. A boat sails in, the gate closes behind it, and water is let in or out until the boat has risen or sunk to the level of the next stretch. Then the far gate opens and the boat carries on. Climbing a hill by lock is slow, but it works, and some canals climb like staircases, one lock after another.

Where a hill was too steep for locks, navvies dug a tunnel straight through it. Where a valley was in the way, they carried the canal over it on a bridge full of water called an aqueduct.`,
`The slow lane

For the boat families who lived and worked on the canals, life was hard but colourful. Their narrowboats were only about two metres wide, so every inch of the tiny cabin was used, and many boats were painted with bright roses and castles. Children helped to lead the horse and open the heavy lock gates.

When railways arrived, trains could carry goods faster than any horse-drawn boat, and trade on the canals slowly dried up. Many canals were abandoned, and some were filled in or choked with weeds.

But the story does not end there. In recent years, volunteers have cleared and repaired many miles of old waterways. Today the towpaths that horses once walked are used by walkers, cyclists and anglers, and holidaymakers hire narrowboats to drift along at walking pace. Herons fish in the quiet water and kingfishers flash across it. The water roads that were built for speed have become places where people go to slow down.`]};

// ---- Text 3: a poem --------------------------------------------------------------------------------------------------
const fox:Reading={id:'en-read-sats-poem',title:'The Night Visitor',byline:'An original poem written for Manor Quest',pages:[
`When the street lamps hum and the last bus sighs,
and curtains close on sleepy eyes,
a shadow slides beneath the gate:
the fox is out. The fox is late.

She picks her way on velvet paws
past dustbin lids and dripping doors,
as silent as a falling leaf,
a russet rumour, a tiny thief.

Clink! A bottle rolls and spins.
Clatter-crash go the recycling bins.
She freezes, one paw in the air,
and the moon leans down to see her there.`,
`The garden is her kingdom, and
the shed a castle, grey and grand;
the lawn a silver sea of dew
where slugs set sail and snails creep through.

She digs. She sniffs. She snaps a snail.
She flicks the flame that is her tail,
then slips away the way she came,
and the night forgets her name.

By morning, all that's left to see
is one small paw print by the tree,
and I will never, ever know
where foxes, in the daytime, go.`]};

const w=writer(topic);

// The Lamp Room
ask(w,lamp,0,{prompt:'What did the warning on the radio say was expected?',answer:'strong winds by late afternoon',wrong:['heavy snow overnight','thick fog in the morning','high waves at midday'],rewardGroup:'quick',
 explanation:explain("The text says 'Strong winds expected from the south-west by late afternoon.' This is the gale warning that makes Grandad glance at the stairs.",'- Snow, fog and waves are not mentioned in the warning.')},
 'Strong winds expected from the south-west by late afternoon.');
ask(w,lamp,0,{prompt:"What kind of building is Grandad's house?",answer:'a lighthouse',wrong:['a windmill','a castle','a farmhouse','a block of flats'],rewardGroup:'challenge',
 explanation:explain("The text never uses the word, but the clues add up. The text says the house 'was tall and round and painted white' and stood 'at the very end of the headland', the stairs lead 'to the lamp room at the top', and every evening 'the great lamp began to turn'.",'A tall white tower on the edge of the sea with a turning lamp at the top is a **lighthouse**.','- A windmill has sails, not a lamp, and a castle, a farmhouse and a block of flats are not round towers with a lamp room.')},
 'was tall and round and painted white','at the very end of the headland','to the lamp room at the top','the great lamp began to turn');
ask(w,lamp,1,{prompt:"'He studied her for a long moment.' What does the word 'studied' mean here?",answer:'looked at her carefully',wrong:['taught her a lesson','did some school work with her','ignored her'],
 explanation:explain("The text says 'He studied her for a long moment.' Grandad is deciding whether to let Priya climb the stairs, so he looks at her closely and thinks hard: here 'studied' means **looked at her carefully**.",'- It is not about school work or teaching, and he is giving her his full attention, not ignoring her.')},
 'He studied her for a long moment.');
ask(w,lamp,1,{prompt:"What does the simile 'like a dog that wanted to be let in' suggest about the wind?",answer:'It made a long, high sound that would not stop.',wrong:['It was warm and friendly.','It had blown the door open.','It was too quiet to hear.'],
 explanation:explain("The text says 'the wind began to whine around the tower like a dog that wanted to be let in'. A dog shut outside whines on and on at the door, so the simile suggests the wind **made a long, high sound that would not stop**, as if it were trying to get into the tower.",'- The wind is rising before a storm, so it is neither warm nor quiet, and no door is blown open.')},
 'the wind began to whine around the tower like a dog that wanted to be let in');
ask(w,lamp,1,{prompt:'Why does Priya think about the fishing boats?',answer:'She realises the boats need the lamp to find their way past the rocks.',wrong:['She wants to go out fishing with Grandad.','She is worried that the boats will be stolen.','She hopes one of the boats will bring her a present.'],
 explanation:explain("The text says Priya thought of the fishing boats 'looking for the beam that told them where the rocks were'. Grandad cannot climb the stairs, so if nobody lights the lamp the boats will not be able to see the rocks. That is why she then says, 'I can do it'.",'- Nothing in the text is about fishing trips, stealing or presents.')},
 'looking for the beam that told them where the rocks were','I can do it');
ask(w,lamp,1,{prompt:'How many steps are there up to the lamp room?',answer:'112',wrong:['102','120','121'],rewardGroup:'quick',
 explanation:explain("The text says 'It's a hundred and twelve steps,' and Priya replies that she counted them on Monday. A hundred and twelve is **112**.",'- The other numbers muddle the digits of a hundred and twelve.')},
 "It's a hundred and twelve steps");
ask(w,lamp,2,{prompt:'Select the **two** details that show Priya is nervous when she first reaches the lamp room.',answer:['she stood completely still','her heart thudding'],wrong:['Rain streamed down the windows','The great lens began to turn','a mug of cocoa in each hand'],rewardGroup:'challenge',
 explanation:explain("The text says 'For a second she stood completely still, her heart thudding.' Standing frozen and a thudding heart are both signs of nerves: she is in the dark at the top of the tower with the storm outside.",'- The rain, the lens turning and the mugs of cocoa describe what is around her, not how she feels.')},
 'she stood completely still','her heart thudding');
ask(w,lamp,2,{prompt:'What is most likely to happen the next time the lamp needs to be lit?',answer:'Priya and Grandad will share the job.',wrong:['Grandad will do it on his own, as before.','Priya will refuse to climb the stairs again.','The fishing boats will light it instead.'],rewardGroup:'challenge',
 explanation:explain("At the start of the story, Grandad said the lamp was his job alone. By the end, the text says, 'I suppose it's our job now.' The word **our** shows that he now trusts Priya to share the work, so the two of them are most likely to do it together.",'- Priya has just climbed the stairs bravely and stayed to watch the beam, so she is unlikely to refuse, and the boats rely on the lamp: they cannot light it.')},
 "I suppose it's our job now.");

// Canals: The Water Roads
ask(w,canals,0,{prompt:'Before canals were built, how did many traders move heavy goods?',answer:'in carts along rough, muddy tracks',wrong:['by train','in ships along the coast','on the backs of horses'],rewardGroup:'quick',
 explanation:explain("The text says goods had to go 'on a muddy track full of holes', and that this 'was the only choice for many traders'. So heavy goods went by cart along rough tracks.",'- Railways came later, and ships and the backs of horses are not mentioned.')},
 'on a muddy track full of holes','was the only choice for many traders');
ask(w,canals,0,{prompt:'Why did fragile goods often arrive broken?',answer:'The carts shook them about on the bumpy tracks.',wrong:['The traders packed them carelessly.','The horses were too tired to pull them.','The canals were too narrow for the boats.'],
 explanation:explain("The text says the journey was along 'a muddy track full of holes' and was 'slow, bumpy and expensive'. A cart jolting in and out of holes would shake and knock the goods inside it, so fragile things broke.",'- The text says nothing about careless packing or tired horses, and canals had not yet been built.')},
 'a muddy track full of holes','slow, bumpy and expensive');
ask(w,canals,0,{prompt:"Why does the writer begin the text with 'Imagine trying to move a cartload of coal'?",answer:'to help the reader picture how hard moving goods was before canals',wrong:['to give instructions for loading a cart','to show that coal is no longer used','to describe how canals were dug'],
 explanation:explain("The text says 'Imagine trying to move a cartload of coal or a stack of heavy pots across the country on a muddy track full of holes.' Asking the reader to imagine the journey makes them feel how slow and difficult it was, which explains why canals were such a good idea.",'- The sentence does not give instructions, say anything about coal today or describe digging.')},
 'Imagine trying to move a cartload of coal or a stack of heavy pots across the country on a muddy track full of holes.');
ask(w,canals,1,{prompt:"The navvies were 'armed with little more than picks, shovels and wheelbarrows'. What does 'armed with' mean here?",answer:'carrying as tools',wrong:['fighting with','having strong arms from','protected against'],
 explanation:explain("The text says the navvies were 'armed with little more than picks, shovels and wheelbarrows'. The navvies were not fighting anyone: these are the tools they carried to dig the canal, so 'armed with' means **carrying as tools**. The words 'little more than' stress how simple those tools were.",'- Nobody is fighting or being protected, and the phrase is about tools, not muscles.')},
 'armed with little more than picks, shovels and wheelbarrows');
ask(w,canals,1,{prompt:"The text says some canals 'climb like staircases'. What does this comparison suggest?",answer:'One lock after another lifts boats a step at a time up a hill.',wrong:['Boats have to be carried up real stairs.','The canals are built inside tall buildings.','The water flows quickly downhill.'],
 explanation:explain("The text says 'some canals climb like staircases, one lock after another'. Each lock raises a boat to the next level, just as each stair takes you one step higher, so a row of locks works like a staircase for boats.",'- There are no real stairs or buildings, and the text says a canal has to be almost flat, so its water does not rush downhill.')},
 'some canals climb like staircases, one lock after another');
ask(w,canals,2,{prompt:'Select the **two** jobs the text says children on the boats helped with.',answer:['leading the horse','opening the lock gates'],wrong:['painting the roses and castles','cooking the meals','catching fish'],rewardGroup:'quick',
 explanation:explain("The text says 'Children helped to lead the horse and open the heavy lock gates.' So the two jobs are leading the horse and opening the lock gates.",'- The boats were painted with roses and castles, but the text does not say the children painted them, and cooking and fishing are not mentioned.')},
 'Children helped to lead the horse and open the heavy lock gates.');
ask(w,canals,2,{prompt:"What does the writer mean by saying the water roads 'have become places where people go to slow down'?",answer:'Canals were once the quickest way to move goods, but now people use them to relax.',wrong:['Narrowboats have become slower than they used to be.','The canals are too crowded for boats to move.','People visit the canals to learn to walk slowly.'],rewardGroup:'challenge',
 explanation:explain("The text says 'The water roads that were built for speed have become places where people go to slow down.' Canals were dug to carry goods faster than carts could, but today 'holidaymakers hire narrowboats to drift along at walking pace' and walkers and cyclists use the towpaths.",'So the writer means that canals, once all about speed, are now about relaxing.','- The sentence contrasts the past with the present; it is not about crowds, slower boats or learning to walk.')},
 'The water roads that were built for speed have become places where people go to slow down.','holidaymakers hire narrowboats to drift along at walking pace');
ask(w,canals,2,{prompt:'Which sentence best summarises the final page?',answer:'Canals lost their trade to the railways, but they have been restored and are now enjoyed for leisure.',wrong:['Canals are still the main way to move coal around the country.','Railways were built along the old towpaths.','Boat families painted their boats so that customers could find them.'],rewardGroup:'challenge',
 explanation:explain("The page explains that when railways arrived, trains were faster and 'trade on the canals slowly dried up'. But then 'volunteers have cleared and repaired many miles of old waterways', and people now use them for walking, cycling, fishing and holidays.",'- Trains took over the goods trade, so canals are no longer the main way to move coal. The text does not say railways were built on towpaths, or why the boats were painted.')},
 'trade on the canals slowly dried up','volunteers have cleared and repaired many miles of old waterways');

// The Night Visitor
ask(w,fox,0,{prompt:'When does the fox come out?',answer:'at night, after the last bus has gone',wrong:['early in the morning','at midday','when the dustbins are collected'],rewardGroup:'quick',
 explanation:explain("The poem begins 'When the street lamps hum and the last bus sighs, / and curtains close on sleepy eyes'. The street lamps are on, the last bus has gone and people are going to bed, so the fox comes out **at night**.",'- The morning only appears in the last stanza, after the fox has gone, and nobody collects the dustbins in the poem.')},
 'When the street lamps hum and the last bus sighs,','and curtains close on sleepy eyes');
ask(w,fox,0,{prompt:"Which literary device is used in the line 'and the moon leans down to see her there'?",answer:'personification',wrong:['simile','onomatopoeia','alliteration','rhetorical question'],
 explanation:explain("The moon cannot really lean or look. The line 'and the moon leans down to see her there' gives the moon human actions, which is **personification**. It suggests the moonlight is shining on the fox as if the moon is curious about her.",'- There is no comparison using like or as (simile), no sound word (onomatopoeia), no repeated first sound (alliteration) and no question.')},
 'and the moon leans down to see her there');
ask(w,fox,0,{prompt:'Select the **two** words from the poem that are examples of **onomatopoeia**.',answer:['Clink','Clatter-crash'],wrong:['velvet','freezes','rumour'],
 explanation:explain("Onomatopoeia is a word that sounds like the noise it describes. In 'Clink! A bottle rolls and spins.' the word Clink copies the sound of glass, and in 'Clatter-crash go the recycling bins.' the word Clatter-crash copies the noise of the bins falling.",'- velvet, freezes and rumour describe how the fox looks, moves and seems; they do not imitate sounds.')},
 'Clink! A bottle rolls and spins.','Clatter-crash go the recycling bins.');
ask(w,fox,0,{prompt:"What does the word 'russet' mean in 'a russet rumour, a tiny thief'?",answer:'reddish-brown',wrong:['fast and fierce','soft and furry','dark grey'],
 explanation:explain("The fox is called 'a russet rumour, a tiny thief'. Russet is a colour: the warm **reddish-brown** of a fox's coat.",'- The word describes her colour, not her speed, her fur or anything grey.')},
 'a russet rumour, a tiny thief');
ask(w,fox,0,{prompt:"Why does the fox freeze with 'one paw in the air'?",answer:'The noise has startled her and she is checking that it is safe to go on.',wrong:['Her paw is stuck in a bottle.','She is dancing in the moonlight.','She has hurt her paw on the gate.'],rewardGroup:'challenge',
 explanation:explain("Just before, the text says 'Clink! A bottle rolls and spins.' and 'Clatter-crash go the recycling bins.' Then 'She freezes, one paw in the air'. The sudden crash has startled her, so she stops mid-step and keeps still until she is sure nobody has heard.",'- Nothing says her paw is stuck or hurt, and freezing is the opposite of dancing.')},
 'Clink! A bottle rolls and spins.','Clatter-crash go the recycling bins.','She freezes, one paw in the air');
ask(w,fox,1,{prompt:'How does the poem change in the final stanza?',answer:'It moves from the night to the next morning, when the fox has gone.',wrong:['It goes back to the start of the night.','It describes the fox hunting a different animal.','It moves from the garden to the street.'],rewardGroup:'challenge',
 explanation:explain("The earlier stanzas describe the fox in the garden at night. The final stanza begins 'By morning, all that's left to see / is one small paw print by the tree'. Time has moved on to daylight and the fox has gone, leaving only a paw print.",'- The stanza does not return to the start of the night, show the fox hunting or move to the street.')},
 "By morning, all that's left to see",'is one small paw print by the tree');
ask(w,fox,1,{prompt:"'She flicks the flame that is her tail.' What does this metaphor suggest about the fox's tail?",answer:'It is bright orange-red and moves like a flame.',wrong:['It is burning.','It keeps her warm at night.','It is wet with dew.'],
 explanation:explain("The line 'She flicks the flame that is her tail' does not say the tail is like a flame: it says the tail **is** a flame, which is a metaphor. It suggests the tail is bright orange-red and flickers as she moves, just as a flame does.",'- The tail is not really on fire, and the metaphor is about its colour and movement, not warmth or dew.')},
 'She flicks the flame that is her tail');
ask(w,fox,1,{prompt:'How does the speaker feel about the fox at the end of the poem?',answer:'curious and full of wonder',wrong:['angry about the mess','frightened of her','bored by her'],rewardGroup:'challenge',
 explanation:explain("The speaker finds 'one small paw print by the tree' and says 'I will never, ever know / where foxes, in the daytime, go'. Wondering where the fox has gone, and wishing to know, shows **curiosity and wonder**.",'- The speaker never complains about the bins, shows no fear and is clearly interested, not bored.')},
 'one small paw print by the tree','I will never, ever know','where foxes, in the daytime, go');

export const satsReading=w.done();
