import {explain,type Topic} from './bank-kit';
import {writer,untag} from './bank-english-kit';
// Adverbs and adverbials: how, when, where and how often; fronted adverbials; adverbs of possibility and degree.

const topic:Topic={id:'en-adverbs',subject:'English',strand:'Grammar',title:'Adverbs and adverbials',helpsheet:{
 intro:'An **adverb** tells you more about a verb, an adjective or another adverb: how, when, where, how often or how much (she sang **softly**; it was **very** cold). An **adverbial** is a word, phrase or clause that does the same job (**after lunch**, **in the garden**).',
 steps:[
  'Find the verb, then ask: how, when, where or how often did it happen?',
  'Many adverbs end in -ly (softly), but plenty do not (here, very, never, still).',
  "A **fronted adverbial** has been moved to the start of the sentence and is followed by a comma: 'Later that evening, we lit the fire.'",
  'Adverbs such as perhaps, maybe, surely and certainly show how likely something is.',
 ],
 example:{title:'Adverbs and adverbials',lines:['Every Sunday, Grandpa walks slowly to the bakery.','- **Every Sunday**: fronted adverbial (when)','- **slowly**: adverb (how he walks)','- **to the bakery**: adverbial (where)']},
 tips:["Not every -ly word is an adverb: 'a **silly** joke' uses an adjective.","Some words can be either: 'an **early** start' (adjective) but 'we left **early**' (adverb).","Adverbs can describe adjectives too: '**extremely** tall'."],
}};

const w=writer(topic);
const count=(tagged:string,cls:string)=>({kind:'count',tagged,cls});
const pick=(tagged:string,cls:string,all=false)=>({kind:'pick',tagged,cls,all});

{const t='Poppy/noun.pr tiptoed/verb silently/adv past/prep the/det sleeping/adj dragon/noun ./';
w.add({prompt:'Which word in the sentence below is an **adverb**?',stimulus:untag(t),answer:'silently',wrong:['tiptoed','past','sleeping'],rewardGroup:'quick',
 explanation:explain('**silently** tells us how Poppy tiptoed, so it is an adverb.',"- **past** is a preposition here: 'past the sleeping dragon'.",'- **sleeping** describes the dragon, so it is an adjective, and **tiptoed** is a verb.')},pick(t,'adv'));}

{const t='We/pron will/verb.mod visit/verb the/det museum/noun again/adv soon/adv ./';
w.add({prompt:'Select the **two** adverbs in the sentence below.',stimulus:untag(t),answer:['again','soon'],wrong:['will','visit','museum'],
 explanation:explain('**again** (one more time) and **soon** (when) tell us more about the verb visit, so they are adverbs, even though neither ends in -ly.','- **will** is a modal verb and **visit** is the main verb.','- **museum** is a noun.')},pick(t,'adv',true));}

w.add({prompt:"Which word ending in '-ly' is **not** an adverb?",answer:'lonely',wrong:['quickly','gently','happily','softly'],rewardGroup:'challenge',
 explanation:explain('**lonely** describes a noun or pronoun (a lonely shepherd; she felt lonely), so it is an **adjective**.','- quickly, gently, happily and softly describe how something is done, so they are adverbs.')});

w.add({prompt:'Which sentence begins with a **fronted adverbial**?',answer:'After the storm, the garden was covered in leaves.',wrong:['The garden was covered in leaves after the storm.','The storm covered the garden in leaves.','Leaves covered the whole garden.'],
 explanation:explain("'**After the storm**' tells us when. It has been moved to the front of the sentence and is followed by a comma, so it is a fronted adverbial.","- 'The garden was covered in leaves after the storm.' has the same adverbial, but at the end, so it is not fronted.","- The sentences beginning 'The storm' and 'Leaves' start with the subject, not an adverbial.")});

w.add({prompt:'Which words are the **fronted adverbial** in the sentence below?',stimulus:'Without a sound, the fox slipped under the fence.',answer:'Without a sound',wrong:['the fox','slipped under','under the fence'],
 explanation:explain("'**Without a sound**' tells us how the fox moved, and it comes at the front of the sentence, so it is the fronted adverbial.","- 'under the fence' is also an adverbial (it tells us where), but it is at the end, not the front.","- 'the fox' is the subject of the sentence.")});

w.add({prompt:"What does the adverbial 'in the orchard' tell us?",stimulus:'The children played hide-and-seek in the orchard.',answer:'where',wrong:['when','how','how often'],rewardGroup:'quick',
 explanation:explain("'in the orchard' tells us **where** the children played.")});

w.add({prompt:"What does the adverb 'twice' tell us?",stimulus:'The school bell rang twice.',answer:'how often',wrong:['where','how','when'],rewardGroup:'quick',
 explanation:explain("'twice' tells us **how often** the bell rang: two times.")});

w.add({prompt:"What does the adverbial 'with great care' tell us?",stimulus:'Freya lifted the kitten with great care.',answer:'how',wrong:['where','when','how often'],rewardGroup:'quick',
 explanation:explain("'with great care' tells us **how** Freya lifted the kitten: carefully.")});

{const t='The/det lemonade/noun was/verb extremely/adv sour/adj ./';
w.add({prompt:'Which word in the sentence below is an **adverb**?',stimulus:untag(t),answer:'extremely',wrong:['lemonade','was','sour'],
 explanation:explain('**extremely** tells us how sour the lemonade was, so it is an adverb. Adverbs can describe adjectives as well as verbs.','- **sour** is an adjective, **was** is a verb and **lemonade** is a noun.')},pick(t,'adv'));}

w.add({prompt:'Which adverb shows that the speaker is **not sure**?',stimulus:'___, the rain will stop before the match.',answer:'Perhaps',wrong:['Certainly','Definitely','Obviously'],
 explanation:explain('**Perhaps** shows that the rain stopping is only possible.','- Certainly, Definitely and Obviously all show that the speaker is sure.')});

w.add({prompt:"Which is the adverb formed from the adjective 'gentle'?",answer:'gently',wrong:['gentlely','gentley','gentleness'],
 explanation:explain('For adjectives ending in **-le**, replace the -le with **-ly**: gentle → **gently**.','- gentlely and gentley are misspellings.','- gentleness is a noun.')});

w.add({prompt:"In which sentence is 'late' used as an **adverb**?",answer:'The bus arrived late because of the snow.',wrong:['We caught the late bus home.','Grandpa sent me a late birthday card.','Mum made a late breakfast on Sunday.'],rewardGroup:'challenge',
 explanation:explain("In 'arrived **late**', late tells us when the bus arrived, so it describes the verb: it is an **adverb**.","- In 'the late bus', 'a late birthday card' and 'a late breakfast', late describes a noun, so it is an adjective.")});

{const t='Soon/adv ,/ we/pron will/verb.mod walk/verb slowly/adv and/conj.co carefully/adv along/prep the/det cliff/noun path/noun ./';
w.add({prompt:'How many adverbs are in this sentence?',stimulus:untag(t),answer:'3',wrong:['2','4','5'],
 explanation:explain('The adverbs are **Soon** (when), **slowly** and **carefully** (how): 3.',"- 'along the cliff path' is an adverbial phrase, not a single adverb.",'- **will** is a modal verb.')},count(t,'adv'));}

w.add({prompt:'Which word correctly completes the sentence?',stimulus:'The nervous kitten ___ approached the bowl of milk.',answer:'cautiously',wrong:['cautious','caution','cautiousness'],rewardGroup:'quick',
 explanation:explain('The gap describes how the kitten **approached**, which is a verb, so it needs an adverb: **cautiously**.','- **cautious** is an adjective; **caution** and **cautiousness** are nouns.')});

w.add({prompt:'Which sentence contains an adverb that tells us **how often**?',answer:'We often walk to school.',wrong:['We walk quickly to school.','We walked to school early.','We walk to school with Grandma.'],
 explanation:explain('**often** tells us how often we walk to school.',"- **quickly** tells us how and **early** tells us when; 'with Grandma' tells us who we walk with.")});

w.add({prompt:"In the phrase below, what does the adverb 'remarkably' describe?",stimulus:'a remarkably tall giraffe',answer:"the adjective 'tall'",wrong:["the noun 'giraffe'","the determiner 'a'",'a verb'],rewardGroup:'challenge',
 explanation:explain("'remarkably' tells us **how tall** the giraffe is, so it describes the adjective **tall**.",'- Adverbs describe verbs, adjectives and other adverbs. Nouns are usually described by adjectives, not adverbs.','- There is no verb in this phrase.')});

{const t='The/det puppy/noun followed/verb us/pron everywhere/adv ./';
w.add({prompt:'Which word in the sentence below is an adverb that tells us **where**?',stimulus:untag(t),answer:'everywhere',wrong:['puppy','followed','us'],rewardGroup:'quick',
 explanation:explain('**everywhere** tells us where the puppy followed us, so it is an adverb of place.','- **us** is a pronoun, **followed** is a verb and **puppy** is a noun.')},pick(t,'adv'));}

w.add({prompt:'Which sentence has the same meaning as the one below, but with a **fronted adverbial**?',stimulus:'We ate our lunch in the shade of the oak tree.',answer:'In the shade of the oak tree, we ate our lunch.',wrong:['We, in the shade of the oak tree, ate our lunch.','The oak tree shaded us while we ate our lunch.','Our lunch was eaten in the shade of the oak tree.'],
 explanation:explain("Moving 'in the shade of the oak tree' to the start, followed by a comma, makes it a **fronted adverbial**.","- 'We, in the shade of the oak tree, ate our lunch.' moves it into the middle, not the front.","- The sentences beginning 'The oak tree' and 'Our lunch' change the wording and still end with an adverbial.")});

export const adverbs=w.done();
