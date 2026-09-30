import {explain,type Topic} from './bank-kit';
import {writer} from './bank-english-kit';
// Vocabulary in context: words with several meanings, idioms whose literal meaning is a trap, synonyms and antonyms.

const topic:Topic={id:'en-vocabulary',subject:'English',strand:'Spelling and vocabulary',title:'Vocabulary in context',helpsheet:{
 intro:'Many words have more than one meaning, and some phrases (**idioms**) mean something different from their separate words. Use the rest of the sentence, the **context**, to work out the meaning.',
 steps:[
  'Read the whole sentence, and the sentence before and after if there is one.',
  'Look for clues: what happens next, how people react, or a contrast word such as but.',
  'Try each choice in place of the word. The right one keeps the sentence making sense.',
  "For an idiom, ask what the whole phrase means, not each word: 'It's raining cats and dogs' means it is raining heavily.",
 ],
 example:{title:'Using context',lines:['The spring in the old armchair poked through the cushion.','- spring could mean a season, a jump or a coil of metal.','- A spring that pokes through a cushion must be a **coil of metal**.']},
 tips:['Watch out for words that look alike but mean different things: scarce/scared, illegal/illegible.','Say the word aloud: some words change meaning when the stress moves (a RE-cord, to re-CORD).','A synonym means the same; an antonym means the opposite.'],
}};

const w=writer(topic);

w.add({prompt:"What does the word 'treacherous' mean in this sentence?",stimulus:'After the storm, the cliff path was so treacherous that the rangers closed it.',answer:'dangerous',wrong:['disloyal','beautiful','crowded'],rewardGroup:'challenge',
 explanation:explain('The rangers closed the path after the storm, so it must have been unsafe: here **treacherous** means **dangerous**.','- treacherous can also describe a person who betrays others (disloyal), but a path cannot betray anyone.','- Nothing in the sentence suggests the path was beautiful or crowded.')});

w.add({prompt:"What does the word 'reluctant' mean in this sentence?",stimulus:'Ethan was reluctant to leave the party because he was having such fun.',answer:'unwilling',wrong:['eager','late','unable'],
 explanation:explain('Ethan was having fun, so he did not want to leave: **reluctant** means **unwilling**.','- eager is the opposite, and nothing says he was late or unable to leave.')});

w.add({prompt:"What does the word 'bright' mean in this sentence?",stimulus:'Aisha is a bright pupil who always asks clever questions.',answer:'intelligent',wrong:['shiny','loud','colourful'],
 explanation:explain("The clue is 'always asks clever questions': here **bright** means **intelligent**.",'- bright can also mean shiny or colourful, but the clue in this sentence is about being clever.','- loud is not a meaning of bright.')});

w.add({prompt:"What does 'under the weather' mean in this sentence?",stimulus:'Grandad is feeling under the weather, so he is staying in bed today.',answer:'slightly unwell',wrong:['outside in the rain','sheltering from a storm','very cold'],rewardGroup:'quick',
 explanation:explain("Grandad is staying in bed, so '**under the weather**' means **slightly unwell**. It is an idiom: the phrase means something different from its separate words.",'- It has nothing to do with rain, storms or cold weather.')});

w.add({prompt:"What does 'long-winded' mean in this sentence?",stimulus:'The speech was so long-winded that half the audience started to yawn.',answer:'went on for too long',wrong:['out of breath','blown about by the wind','spoken very loudly'],
 explanation:explain('The audience started to yawn, so the speech was dull because it **went on for too long**: that is what **long-winded** means.',"- Here it does not mean out of breath or blown about by the wind, even though 'wind' is part of the word.")});

w.add({prompt:"In which sentence does 'bark' mean the outer layer of a tree?",answer:'The bark was rough and covered in green moss.',wrong:["The puppy's bark woke the whole house.",'Dogs bark when strangers come to the door.','The captain gave a short bark of laughter.'],
 explanation:explain("Only the outside of a tree could be **rough and covered in moss**, so 'The bark was rough and covered in green moss.' uses bark to mean a tree's outer layer.",'- In the other sentences, bark is the sound a dog makes, or a short, loud sound like it.')});

w.add({prompt:"Which word is closest in meaning to 'fragile'?",answer:'delicate',wrong:['heavy','flexible','ancient'],rewardGroup:'quick',
 explanation:explain('Something **fragile** breaks easily, like a glass ornament, so it is **delicate**.','- heavy, flexible and ancient describe other qualities.')});

w.add({prompt:"Which word is most nearly **opposite** in meaning to 'generous'?",answer:'selfish',wrong:['kind','wealthy','grateful'],
 explanation:explain('A **generous** person gladly gives and shares. A **selfish** person keeps things for themselves, so selfish is the opposite.','- kind is close in meaning to generous, and wealthy and grateful mean different things.')});

w.add({prompt:"What does the word 'scarce' mean in this sentence?",stimulus:'Fresh water was scarce on the island, so the sailors saved every drop.',answer:'in short supply',wrong:['frightened','plentiful','salty'],
 explanation:explain('The sailors saved every drop, so there was not much water: **scarce** means **in short supply**.','- It is easy to confuse scarce with scared (frightened).','- plentiful is the opposite.')});

w.add({prompt:'Which word best completes the sentence?',stimulus:'After walking for twelve hours, the explorers were so ___ that they fell asleep at once.',answer:'exhausted',wrong:['energetic','astonished','anxious'],
 explanation:explain('Walking for twelve hours and falling asleep at once both show that the explorers were extremely tired: **exhausted**.','- energetic is the opposite, and being astonished or anxious would not make them fall asleep at once.')});

w.add({prompt:"What does the word 'fair' mean in this sentence?",stimulus:"It isn't fair that only one group gets to use the new computers.",answer:'just and reasonable',wrong:['light in colour','a travelling funfair','quite good'],
 explanation:explain('The speaker is complaining that only one group gets a turn, so **fair** means **just and reasonable** here.','- fair can also mean light in colour (fair hair), a funfair, or quite good (a fair try), but those meanings do not fit.')});

w.add({prompt:"Which word could replace 'swiftly' without changing the meaning?",stimulus:'The fox moved swiftly across the frosty field.',answer:'quickly',wrong:['quietly','slowly','carefully'],rewardGroup:'quick',
 explanation:explain('**swiftly** means **quickly**.','- quietly and carefully describe other ways of moving, and slowly is the opposite.')});

w.add({prompt:"What does 'a mountain of homework' suggest?",stimulus:'Rory had a mountain of homework to finish before Monday.',answer:'a very large amount of homework',wrong:['homework about mountains','homework to do outdoors','a small amount of homework'],rewardGroup:'quick',
 explanation:explain('The homework is not really a mountain: the pile is so big that it seems like one. The phrase means **a very large amount**.')});

w.add({prompt:"Which word could replace 'examine' without changing the meaning?",stimulus:'The detective began to examine the footprints by the gate.',answer:'inspect',wrong:['ignore','create','follow'],
 explanation:explain('To **examine** something is to look at it closely and carefully, which is what **inspect** means.','- ignore is the opposite, and create and follow mean different things.')});

w.add({prompt:"What does the word 'dwindled' mean in this sentence?",stimulus:'As the evening went on, the pile of sandwiches dwindled until only one was left.',answer:'gradually got smaller',wrong:['grew bigger','went stale','fell over'],
 explanation:explain("By the end 'only one was left', so the pile **gradually got smaller**: that is what **dwindled** means.",'- grew bigger is the opposite, and nothing suggests the sandwiches went stale or fell over.')});

w.add({prompt:"What does 'gave his brother the cold shoulder' mean in this sentence?",stimulus:'After the argument, Oscar gave his brother the cold shoulder.',answer:'ignored him on purpose',wrong:['lent him a warm coat','patted him on the shoulder','gave him an ice pack'],
 explanation:explain('After an argument, Oscar was being unfriendly: giving someone **the cold shoulder** is an idiom that means **ignoring them on purpose**.','- The phrase has nothing to do with real shoulders, coats or ice.')});

w.add({prompt:"What does the word 'illegible' mean in this sentence?",stimulus:"Tom's handwriting was so illegible that nobody could read his note.",answer:'impossible to read',wrong:['against the law','beautifully neat','written in pencil'],
 explanation:explain('Nobody could read the note, so **illegible** means **impossible to read**. The prefix il- means not, and legible means readable.',"- 'against the law' is the meaning of illegal, which looks similar.",'- beautifully neat is the opposite.')});

w.add({prompt:"What does the word 'content' mean in this sentence?",stimulus:'The cat lay content by the fire, purring softly.',answer:'happy and satisfied',wrong:['what something contains','cross and restless','very hungry'],rewardGroup:'challenge',
 explanation:explain('The cat is lying by the fire, **purring softly**, so it is **happy and satisfied**. Said this way (con-TENT), content is an adjective.','- Said CON-tent, the word is a noun meaning what something contains, such as the contents of a box.','- A purring cat is not cross or restless, and nothing in the sentence suggests that it is hungry.')});

export const vocabulary=w.done();
