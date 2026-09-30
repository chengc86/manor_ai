import {explain,type Topic} from './bank-kit';
import {writer} from './bank-english-kit';
// Homophones and near-homophones in context. Note 'gap' gives the finished sentence so the test can check the answer fills
// the gap and that the choices come from one homophone set in its own table.

const topic:Topic={id:'en-homophones',subject:'English',strand:'Spelling and vocabulary',title:'Homophones',helpsheet:{
 intro:'**Homophones** are words that sound the same but have different meanings and spellings (sea and see). **Near-homophones** sound almost the same (affect and effect).',
 steps:[
  'Work out what the word must mean in the sentence: a place? belonging to someone? a short form of two words?',
  "Look out for apostrophes: you're, they're, it's and who's are always short for two words (you are, they are, it is, who is).",
  'Learn the noun and verb pairs: advice and advise, practice and practise, licence and license. The noun has a c; the verb has an s.',
  'If you are unsure, swap in the meaning and see whether the sentence still works.',
 ],
 example:{title:'Choosing the right word',lines:["They're putting their coats over there.","- **They're** = they are",'- **their** = belonging to them','- **there** = in that place']},
 tips:['**too** means also, or more than enough; **to** goes before a verb or shows direction; **two** is the number 2.','**affect** is usually a verb (the rain affected the match); **effect** is usually a noun (the rain had an effect).',"Use **whose** to ask who something belongs to, and **who's** for 'who is' or 'who has'."],
}};

const w=writer(topic);
const gap=(full:string)=>({kind:'gap',full});

w.add({prompt:'Which word correctly completes the sentence?',stimulus:'The twins left ___ wellies by the back door.',answer:'their',wrong:['there',"they're",'thier'],rewardGroup:'quick',
 explanation:explain('The wellies belong to the twins, so we need **their** (belonging to them).',"- **there** means in that place, and **they're** means they are.","- 'thier' is a misspelling.")},gap('The twins left their wellies by the back door.'));

w.add({prompt:'Which word correctly completes the sentence?',stimulus:'Is it ___ late to join the choir this term?',answer:'too',wrong:['to','two'],rewardGroup:'quick',
 explanation:explain('Here the word means **more than enough** (too late), so we need **too**.','- **to** goes before a verb or shows direction, and **two** is the number 2.')},gap('Is it too late to join the choir this term?'));

w.add({prompt:'Which word correctly completes the sentence?',stimulus:'Tell me when ___ ready to leave for the station.',answer:"you're",wrong:['your','yore','youre'],
 explanation:explain("The sentence means 'when **you are** ready', so we need the contraction **you're**.",'- **your** means belonging to you (your coat).',"- **yore** means long ago, and 'youre' is missing its apostrophe.")},gap("Tell me when you're ready to leave for the station."));

w.add({prompt:'Which word correctly completes the sentence?',stimulus:'Callum needs to ___ his lines for the school play.',answer:'practise',wrong:['practice','practising','practised'],rewardGroup:'challenge',
 explanation:explain('In British English, **practise** (with an s) is the verb and **practice** (with a c) is the noun. Callum needs to do something, so we need the verb: **practise**.',"- 'practising' and 'practised' do not fit after 'needs to'.")},gap('Callum needs to practise his lines for the school play.'));

w.add({prompt:'Which word correctly completes the sentence?',stimulus:'Can you ___ me on which book to read next?',answer:'advise',wrong:['advice','advised','advising'],
 explanation:explain('**advise** (with an s) is the verb: to give someone advice. **advice** (with a c) is the noun.',"- 'Can you advised' and 'Can you advising' are not correct.")},gap('Can you advise me on which book to read next?'));

w.add({prompt:'Which word correctly completes the sentence?',stimulus:'The ___ cupboard is full of pens, rulers and paper.',answer:'stationery',wrong:['stationary','stationry','stationerry'],rewardGroup:'challenge',
 explanation:explain('**stationery** (with an e, as in envelopes) means pens, paper and other writing materials.','- **stationary** (with an a) means not moving: a stationary car.',"- 'stationry' and 'stationerry' are misspellings.")},gap('The stationery cupboard is full of pens, rulers and paper.'));

w.add({prompt:'Which word correctly completes the sentence?',stimulus:'Mr Patel read the poem ___ to the whole class.',answer:'aloud',wrong:['allowed','alowed','alloud'],
 explanation:explain('**aloud** means out loud, so that others can hear.','- **allowed** means permitted: we are allowed to play.',"- 'alowed' and 'alloud' are misspellings.")},gap('Mr Patel read the poem aloud to the whole class.'));

w.add({prompt:'Which word correctly completes the sentence?',stimulus:'The heroes marched ___ the old mill on their way to the river.',answer:'past',wrong:['passed','pased','parst'],rewardGroup:'challenge',
 explanation:explain('The word tells us where the heroes marched (beyond the mill), so we need **past**.',"- **passed** is the past tense of the verb pass. You could write 'The heroes passed the old mill', but 'marched passed' puts two verbs side by side.","- 'pased' and 'parst' are misspellings.")},gap('The heroes marched past the old mill on their way to the river.'));

w.add({prompt:'Which word correctly completes the sentence?',stimulus:'We will decide ___ to go once we have checked the forecast.',answer:'whether',wrong:['weather','wheather'],
 explanation:explain('**whether** introduces a choice between possibilities: whether to go or not.','- **weather** means rain, sunshine, wind and so on.',"- 'wheather' is a misspelling.")},gap('We will decide whether to go once we have checked the forecast.'));

w.add({prompt:'Which word correctly completes the sentence?',stimulus:'Would you like a ___ of apple pie?',answer:'piece',wrong:['peace','peice','peece'],rewardGroup:'quick',
 explanation:explain('**piece** means a part of something: a piece of pie.','- **peace** means calm, or a time with no fighting.',"- 'peice' and 'peece' are misspellings. Remember: a **pie**ce of **pie**.")},gap('Would you like a piece of apple pie?'));

w.add({prompt:'Which word correctly completes the sentence?',stimulus:'The cold weather did not ___ the tomato plants.',answer:'affect',wrong:['effect','affects','effects'],rewardGroup:'challenge',
 explanation:explain("After 'did not', we need a verb. **affect** is the verb: to change or have an influence on something.","- **effect** and **effects** are usually nouns: 'The cold had no effect on the plants.'","- 'did not affects' is not correct.")},gap('The cold weather did not affect the tomato plants.'));

w.add({prompt:'Which word correctly completes the sentence?',stimulus:'A ___ of cows blocked the lane.',answer:'herd',wrong:['heard','hurd','heared'],rewardGroup:'quick',
 explanation:explain('A **herd** is a group of animals such as cows.','- **heard** is the past tense of hear.',"- 'hurd' and 'heared' are misspellings.")},gap('A herd of cows blocked the lane.'));

w.add({prompt:'Which word correctly completes the sentence?',stimulus:'Yesterday, the guide ___ us through the caves.',answer:'led',wrong:['lead','leaded','leed'],rewardGroup:'challenge',
 explanation:explain('The past tense of the verb **lead** is **led**: Yesterday, the guide led us.',"- **lead** can also be a soft grey metal, which sounds like led, so the two are often mixed up.","- 'leaded' is not the past tense of lead, and 'leed' is a misspelling.")},gap('Yesterday, the guide led us through the caves.'));

w.add({prompt:'Which sentence uses the correct homophone?',answer:'I heard a cuckoo in the wood.',wrong:['We walked passed the bakery.',"The dog wagged it's tail.",'Their going to the fair.'],
 explanation:explain("'I **heard** a cuckoo' is correct: heard is the past tense of hear.","- 'walked passed' should be 'walked **past**'.","- 'it's tail' should be '**its** tail' (belonging to it).","- 'Their going' should be '**They're** going' (they are).")},
 {kind:'fixes',want:'correct',fixes:{'I heard a cuckoo in the wood.':'I heard a cuckoo in the wood.','We walked passed the bakery.':'We walked past the bakery.',"The dog wagged it's tail.":'The dog wagged its tail.','Their going to the fair.':"They're going to the fair."}});

w.add({prompt:'Select the **two** words in the sentence below that are the wrong homophones.',stimulus:'Its much to cold for a picnic today.',answer:['Its','to'],wrong:['much','cold','picnic'],rewardGroup:'challenge',
 explanation:explain("**Its** should be **It's** (it is), and **to** should be **too** (more than enough): 'It's much too cold for a picnic today.'",'- much, cold and picnic are correct.')},
 {kind:'wordFixes',corrected:"It's much too cold for a picnic today."});

w.add({prompt:'Which word correctly completes the sentence?',stimulus:'Squeeze the ___ gently as you ride down the hill.',answer:'brake',wrong:['break','braek','braik'],
 explanation:explain('A **brake** is the part of a bike that slows it down.','- **break** means to smash something, or a short rest (break time).',"- 'braek' and 'braik' are misspellings.")},gap('Squeeze the brake gently as you ride down the hill.'));

w.add({prompt:'Which word correctly completes the sentence?',stimulus:'Have you ___ my new trainers anywhere?',answer:'seen',wrong:['scene','seene','sene'],rewardGroup:'quick',
 explanation:explain('**seen** is part of the verb see: Have you seen…?','- **scene** is a place where something happens, or part of a play.',"- 'seene' and 'sene' are misspellings.")},gap('Have you seen my new trainers anywhere?'));

w.add({prompt:'Which word correctly completes the sentence?',stimulus:'___ turn is it to feed the fish?',answer:'Whose',wrong:["Who's",'Whos','Whoose'],
 explanation:explain('The question asks who the turn **belongs to**, so we need **Whose**.',"- **Who's** means 'who is' or 'who has': 'Who is turn is it?' does not make sense.","- 'Whos' and 'Whoose' are misspellings.")},gap('Whose turn is it to feed the fish?'));

export const homophones=w.done();
