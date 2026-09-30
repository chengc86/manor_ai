import {explain,type Topic} from './bank-kit';
import {writer,ask,type Reading} from './bank-english-kit';
// Poetry comprehension: two original poems, eight questions each. Lines are separated by \n and stanzas by a blank line.

const topic:Topic={id:'en-poetry',subject:'English',strand:'Reading',title:'Poetry comprehension',helpsheet:{
 intro:'Poems use sound, rhythm and pictures made of words (imagery) to create feelings in only a few lines.',
 steps:[
  'Read the poem twice: once for the meaning and once for the sound.',
  'Name the devices: **simile** (like or as), **metaphor** (one thing is another), **personification** (human actions for non-human things), **alliteration** (repeated first sounds), **onomatopoeia** (sound words) and **rhetorical questions**.',
  'Explain the effect: what picture or feeling does the device create?',
  'Look at the structure: stanzas, rhyme, repetition and how the mood changes from the beginning to the end.',
 ],
 example:{title:'Spotting devices',lines:['The moon is a silver coin. → metaphor','The thunder grumbled crossly. → personification','Buzz! went the bee. → onomatopoeia','Six slippery snails → alliteration']},
 tips:['One line can use two devices at once, such as a metaphor that also uses alliteration.','Say what a device suggests, not just its name.','Rhymes usually come at the ends of lines: check which lines rhyme to find the pattern.'],
}};

const BY='An original poem written for Manor Quest';
const kite:Reading={id:'en-read-kite',title:'The Kite',byline:BY,pages:[
`Up on the hill where the long grasses sway,
I let out my kite on a blustery day.
It swoops and it soars like a swift in the sky,
then tugs at my hands as it climbs up so high.

The wind is a giant who's found a new toy;
he tosses it round with a bellow of joy.
He carries it higher than rooftop or tree,
till it's only a speck that I strain hard to see.

The string hums and thrums as it pulls at my hand,
as if my red kite has a journey it's planned.
I hold on more tightly and dig in my heels;
I'm tied to the sky, and I know how it feels.`,
`But slowly the giant grows sleepy and still.
The sun slips away at the top of the hill.
My kite drifts down gently, as light as a feather,
and lands in my arms, where we walk home together.

Tomorrow the giant may wake up and roar,
and rattle the windows and bang on the door;
then up to the hill with my kite I will run,
to play in the sky till the daylight is done.`]};

const snow:Reading={id:'en-read-snow',title:'Snow Day',byline:BY,pages:[
`When I woke, the world had been rubbed out.
No path, no fence, no car across the road:
just white, as smooth and silent as a page
that nobody has written on yet.

The garden held its breath.
Even the blackbird on the washing line
forgot to sing, and stared,
as if it had never seen the ground before.

Crunch, crunch, crunch –
my wellies were the first to speak,
printing a message in the snow
for anyone who came after me.`,
`By ten, the park was full of shrieks and scarves.
We built a snowman with a carrot nose
and gave him Grandad's old striped hat,
which made him look important.

Who needs a summer holiday
when winter hands you a day like this?

Then the sun came out, and by teatime
the snowman had begun to lean and weep,
dripping slowly into the lawn,
still smiling, as if he knew
that nothing this perfect stays for long.`]};

const w=writer(topic);

// The Kite
ask(w,kite,0,{prompt:"Which literary device is used in the line 'The wind is a giant who's found a new toy'?",answer:'metaphor',wrong:['simile','onomatopoeia','rhetorical question'],
 explanation:explain("The line 'The wind is a giant who's found a new toy' says the wind **is** a giant, not that it is like one. Describing one thing as if it really is something else is a **metaphor**.","- A simile would use like or as: 'The wind is like a giant.'",'- There is no sound word (onomatopoeia) and no question.')},
 "The wind is a giant who's found a new toy");
ask(w,kite,0,{prompt:"Which **two** literary devices are used in the line 'It swoops and it soars like a swift in the sky'?",answer:['alliteration','simile'],wrong:['metaphor','onomatopoeia','rhetorical question'],rewardGroup:'challenge',
 explanation:explain("In 'It swoops and it soars like a swift in the sky', the words swoops, soars, swift and sky all begin with an s sound: that is **alliteration**.",'The kite is compared to a swift (a fast bird) using **like**: that is a **simile**.','- The line does not say the kite is a bird (metaphor), and there is no sound word (onomatopoeia) and no question.')},
 'It swoops and it soars like a swift in the sky');
ask(w,kite,0,{prompt:'Which word from the poem is an example of **onomatopoeia**?',answer:'thrums',wrong:['blustery','planned','speck'],
 explanation:explain("In 'The string hums and thrums', the word **thrums** imitates the low, buzzing sound of a tight string shaking in the wind, so it is onomatopoeia. (hums is another example.)",'- blustery, planned and speck do not imitate sounds.')},
 'The string hums and thrums');
ask(w,kite,0,{prompt:"What does the word 'blustery' mean in the poem?",answer:'with strong, gusty winds',wrong:['sunny and still','cold and snowy','noisy and crowded'],rewardGroup:'quick',
 explanation:explain("The kite is let out 'on a blustery day', and the next stanza says 'The wind is a giant'. A blustery day has **strong, gusty winds**, which is perfect for flying a kite.",'- A still day would be no good for a kite, and nothing mentions snow or crowds.')},
 'on a blustery day','The wind is a giant');
ask(w,kite,0,{prompt:"What does the line 'I'm tied to the sky, and I know how it feels' suggest?",answer:"The speaker feels as if they are flying too, sharing the kite's freedom.",wrong:['The speaker is frightened of heights.','The speaker has been tied up with string.','The speaker wants to let go of the kite.'],rewardGroup:'challenge',
 explanation:explain("The speaker holds the string of a kite high in the sky, so they feel joined to it: 'I'm tied to the sky, and I know how it feels'.","It suggests they **feel as if they are flying too**, sharing the kite's freedom and excitement.","- They say 'I hold on more tightly', so they do not want to let go.",'- Nothing suggests they are scared, and they are only holding the string, not tied up.')},
 "I'm tied to the sky, and I know how it feels",'I hold on more tightly');
ask(w,kite,1,{prompt:'How does the mood change at the start of the fourth stanza?',answer:'It becomes calm and peaceful as the wind drops.',wrong:['It becomes angry and frightening.','It becomes more exciting as the wind grows stronger.','It stays exactly the same.'],rewardGroup:'challenge',
 explanation:explain("The fourth stanza begins 'But slowly the giant grows sleepy and still.' The wind (the giant) is dying down, the sun is setting and the kite drifts gently down.",'So the mood becomes **calm and peaceful** after the lively, windy stanzas before it.',"- The word 'But' signals the change.")},
 'But slowly the giant grows sleepy and still.');
ask(w,kite,1,{prompt:'Which pair of words from the poem rhyme?',answer:'roar and door',wrong:['run and hill','kite and home','sky and arms'],rewardGroup:'quick',
 explanation:explain("'roar' and 'door' end with the same sound, and they finish two lines next to each other: the giant 'may wake up and roar' and 'bang on the door'.",'- The other pairs do not end with the same sound.')},
 'may wake up and roar','bang on the door');
ask(w,kite,1,{prompt:'What is the poem mainly about?',answer:"a child's joy at flying a kite on a windy day",wrong:['a giant who lives on a hill','a storm that damages a house','a bird learning to fly'],rewardGroup:'extended',
 explanation:explain("The speaker flies a kite on a windy hill. At the end, it 'lands in my arms, where we walk home together', and the speaker cannot wait to go again: 'then up to the hill with my kite I will run'.","So the poem is mainly about **a child's joy at flying a kite on a windy day**.",'- The giant is a metaphor for the wind, not a real giant, and the bird is only part of a simile.','- Nothing is damaged by a storm.')},
 'where we walk home together','then up to the hill with my kite I will run');

// Snow Day
ask(w,snow,0,{prompt:"The poem begins 'When I woke, the world had been rubbed out.' What does this metaphor suggest?",answer:'The snow had covered everything, as if a rubber had erased it.',wrong:['A storm had destroyed the town.','Someone had cleaned all the windows.','The poet could not remember anything.'],rewardGroup:'challenge',
 explanation:explain("The poet wakes to find 'the world had been rubbed out' and sees 'No path, no fence, no car across the road'. Everything is hidden under white snow, like a drawing wiped away with a **rubber**.",'- Nothing has been destroyed: it is only covered.','- The line describes the view, not cleaning or forgetting.')},
 'the world had been rubbed out','No path, no fence, no car across the road');
ask(w,snow,0,{prompt:"Which **two** literary devices are used in the phrase 'as smooth and silent as a page'?",answer:['simile','alliteration'],wrong:['metaphor','onomatopoeia','rhetorical question'],rewardGroup:'challenge',
 explanation:explain("In 'as smooth and silent as a page', the snow is compared to a page using **as … as**, which makes it a **simile**.","'smooth and silent' repeats the s sound at the start of words, which is **alliteration**.",'- It does not say the snow is a page (metaphor), and there is no sound word (onomatopoeia) and no question.')},
 'as smooth and silent as a page');
ask(w,snow,0,{prompt:'Which line from the poem uses **personification**?',answer:'The garden held its breath.',wrong:['No path, no fence, no car across the road:','Even the blackbird on the washing line','for anyone who came after me.'],
 explanation:explain("A garden cannot really breathe. 'The garden held its breath.' gives it a human action, which is **personification**. It suggests the garden is perfectly still and silent, as if it is waiting.",'- The other lines describe things without giving them human actions.')},
 'The garden held its breath.');
ask(w,snow,0,{prompt:"Why does the poet write 'Crunch, crunch, crunch' at the start of the third stanza?",answer:'to imitate the sound of footsteps in the snow',wrong:['to show that the poet is eating breakfast','to show that the snow is melting','to make the stanza longer'],
 explanation:explain("'Crunch, crunch, crunch' is **onomatopoeia**: crunch sounds like the noise boots make in fresh snow. Saying it three times copies the rhythm of footsteps, and the next line explains that 'my wellies were the first to speak'.",'- The snow does not melt until teatime, and nobody is eating.')},
 'Crunch, crunch, crunch','my wellies were the first to speak');
ask(w,snow,0,{prompt:"What does 'my wellies were the first to speak' suggest?",answer:"The poet's footprints were the first marks in the fresh snow.",wrong:["The poet's boots could really talk.",'The poet shouted when they went outside.',"The poet's wellies were too small."],rewardGroup:'challenge',
 explanation:explain("The line 'my wellies were the first to speak' does not mean the wellies really talk. They 'speak' by 'printing a message in the snow': their footprints are the first marks in the untouched snow.","This links back to the snow looking like a page 'that nobody has written on yet'.")},
 'my wellies were the first to speak','printing a message in the snow','that nobody has written on yet');
ask(w,snow,1,{prompt:"What kind of question is 'Who needs a summer holiday when winter hands you a day like this?'",answer:'a rhetorical question, which does not expect an answer',wrong:['a question the reader must answer in writing','a question asked by the snowman','a question from a weather forecast'],
 explanation:explain("The poet asks, 'Who needs a summer holiday / when winter hands you a day like this?' but does not expect anyone to answer. It is a way of saying that a snow day is **even better than a summer holiday**.",'A question used like this is a **rhetorical question**.')},
 'Who needs a summer holiday','when winter hands you a day like this?');
ask(w,snow,1,{prompt:"What is happening when the snowman begins to 'lean and weep'?",answer:'He is melting in the sunshine.',wrong:['He is crying because he is sad.','He is being blown over by the wind.','He is being knocked down by children.'],
 explanation:explain("'Then the sun came out', and the snowman is 'dripping slowly into the lawn'. His 'tears' are drips of melting snow: he is **melting in the sunshine**.","- 'weep' is personification: a snowman cannot really cry, and he is 'still smiling'.")},
 'Then the sun came out','dripping slowly into the lawn','still smiling');
ask(w,snow,1,{prompt:'What is the main idea of the last stanza?',answer:'Wonderful moments do not last for ever.',wrong:['Snowmen should always wear hats.','Summer is better than winter.','The sun is unkind to children.'],rewardGroup:'extended',
 explanation:explain("The snowman melts 'still smiling, as if he knew / that nothing this perfect stays for long'. The poet is saying that **wonderful moments do not last for ever**, so we should enjoy them while they last.",'- The poem says a snow day beats a summer holiday, so it does not say summer is better.','- The hat and the sun are details, not the main idea.')},
 'still smiling, as if he knew','that nothing this perfect stays for long');

export const poetry=w.done();
