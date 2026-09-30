import {explain,type Topic} from './bank-kit';
import {writer,untag} from './bank-english-kit';
// Nouns: concrete and abstract, proper, collective and compound nouns, and nouns compared with pronouns and verbs.

const topic:Topic={id:'en-nouns',subject:'English',strand:'Grammar',title:'Nouns',helpsheet:{
 intro:'A **noun** names a person, place, thing or idea. Common nouns name general things (river, teacher); proper nouns name particular ones and start with a capital letter (Cardiff, Tuesday).',
 steps:[
  "Try putting 'the' or 'a' in front of the word: 'the lantern', 'a river'. If it makes sense, it is probably a noun.",
  'Ask: can I see, touch, hear, smell or taste it? If so, it is a **concrete** noun (drum, pebble). A feeling, quality or idea is an **abstract** noun (joy, honesty).',
  'A **collective** noun names a group (a swarm of bees). A **compound** noun joins two words (rainbow, toothpaste).',
  'Check the job the word does in this sentence: the same word can be a noun in one sentence and a verb in another.',
 ],
 example:{title:'Spot the nouns',lines:['The crew felt great relief when their boat reached Falmouth.','- **crew**: collective noun (a group of sailors)','- **relief**: abstract noun (a feeling)','- **boat**: concrete noun (you can see and touch it)','- **Falmouth**: proper noun (the name of a town)']},
 tips:["'a **drink** of water' is a noun, but 'we **drink** water' is a verb.",'Mine, yours, it, they and everyone stand in for nouns: they are **pronouns**, not nouns.','Days, months, names and places are proper nouns and need capital letters; seasons such as spring and winter do not.'],
}};

const w=writer(topic);
const count=(tagged:string,cls:string)=>({kind:'count',tagged,cls});
const pick=(tagged:string,cls:string,all=false)=>({kind:'pick',tagged,cls,all});

w.add({prompt:'Which of these words is a **concrete** noun?',answer:'lantern',wrong:['courage','patience','friendship','loyalty'],rewardGroup:'quick',
 explanation:explain('A **concrete** noun names something you can see, touch, hear, smell or taste.','- A **lantern** is an object you can see and hold, so it is concrete.','- courage, patience, friendship and loyalty are qualities or feelings. You cannot touch them, so they are **abstract** nouns.')});

w.add({prompt:'Which of these words is an **abstract** noun?',answer:'kindness',wrong:['pillow','bicycle','carrot','teacher'],rewardGroup:'quick',
 explanation:explain('An **abstract** noun names a feeling, quality or idea: something you cannot see or touch.','- **kindness** is a quality, so it is abstract.','- A pillow, a bicycle, a carrot and a teacher can all be seen and touched, so they are **concrete** nouns.')});

{const t='Mine/pron.pos is/verb the/det blue/adj scarf/noun on/prep the/det peg/noun beside/prep the/det door/noun ,/ but/conj.co yours/pron.pos is/verb in/prep the/det cupboard/noun ./';
w.add({prompt:'How many words in this sentence are nouns?',stimulus:untag(t),answer:'4',wrong:['3','5','6'],
 explanation:explain('The nouns are **scarf**, **peg**, **door** and **cupboard**: 4 nouns.','- **Mine** and **yours** stand in for nouns, so they are **pronouns**, not nouns.','- **blue** describes the scarf, so it is an adjective.')},count(t,'noun'));}

{const t='After/prep lunch/noun ,/ Ravi/noun.pr and/conj.co his/det sister/noun carried/verb the/det heavy/adj boxes/noun of/prep books/noun to/prep the/det library/noun ./';
w.add({prompt:'How many words in this sentence are nouns?',stimulus:untag(t),answer:'6',wrong:['4','5','7'],
 explanation:explain('The nouns are **lunch**, **Ravi**, **sister**, **boxes**, **books** and **library**: 6 nouns.','- **Ravi** is a proper noun, and it still counts.','- It is easy to miss **lunch** at the start of the sentence.','- **heavy** is an adjective and **carried** is a verb.')},count(t,'noun'));}

{const t='The/det team/noun.col felt/verb great/adj pride/noun.ab when/conj.sub their/det captain/noun lifted/verb the/det trophy/noun ./';
w.add({prompt:'How many words in this sentence are nouns?',stimulus:untag(t),answer:'4',wrong:['2','3','5'],rewardGroup:'challenge',
 explanation:explain('The nouns are **team**, **pride**, **captain** and **trophy**: 4 nouns.','- **team** is a collective noun: a group of players.','- **pride** is an abstract noun: a feeling. Abstract nouns are still nouns.','- Counting only the things you can touch gives 2 or 3, which is a common slip.')},count(t,'noun'));}

{const t='With/prep great/adj courage/noun.ab and/conj.co some/det luck/noun.ab ,/ the/det explorers/noun crossed/verb the/det frozen/adj river/noun ./';
w.add({prompt:'How many **abstract** nouns are in this sentence?',stimulus:untag(t),answer:'2',wrong:['1','3','4'],
 explanation:explain('Abstract nouns name feelings, qualities or ideas. The abstract nouns are **courage** and **luck**: 2.','- **explorers** and **river** are concrete nouns: you can see them.','- **frozen** is an adjective describing the river.')},count(t,'noun.ab'));}

{const t="Maya's/noun.pr honesty/noun.ab earned/verb her/pron the/det trust/noun.ab and/conj.co respect/noun.ab of/prep everyone/pron in/prep the/det choir/noun.col ./";
w.add({prompt:'How many **abstract** nouns are in this sentence?',stimulus:untag(t),answer:'3',wrong:['2','4','5'],rewardGroup:'challenge',
 explanation:explain('The abstract nouns are **honesty**, **trust** and **respect**: 3. They are qualities and feelings.',"- **Maya's** is a proper noun and **choir** is a collective noun. You can see a person and a choir, so they are concrete.",'- **everyone** and **her** are pronouns.')},count(t,'noun.ab'));}

{const t='Everybody/pron gathered/verb upstairs/adv to/other watch/verb the/det fireworks/noun.cmp through/prep the/det enormous/adj window/noun ./';
w.add({prompt:'Identify the **compound noun** used in the sentence below.',stimulus:untag(t),answer:'fireworks',wrong:['Everybody','upstairs','enormous window'],rewardGroup:'challenge',
 explanation:explain('A **compound noun** is a noun made by joining two words: fire + works = **fireworks**.','- **Everybody** (every + body) is a compound word, but it is a **pronoun**.','- **upstairs** (up + stairs) is a compound word, but here it tells us where they gathered, so it is an **adverb**.','- **enormous window** is an adjective followed by a noun, not one compound word.')},pick(t,'noun.cmp'));}

{const t='The/det goalkeeper/noun.cmp leapt/verb sideways/adv and/conj.co caught/verb the/det ball/noun before/conj.sub it/pron crossed/verb the/det line/noun ./';
w.add({prompt:'Identify the **compound noun** used in the sentence below.',stimulus:untag(t),answer:'goalkeeper',wrong:['sideways','caught the ball','crossed the line'],
 explanation:explain('**goalkeeper** is made from goal + keeper, and it names a person, so it is a compound noun.','- **sideways** (side + ways) is a compound word, but it tells us how the goalkeeper leapt, so it is an adverb.',"- 'caught the ball' and 'crossed the line' are groups of words built around verbs.")},pick(t,'noun.cmp'));}

{const t='In/prep July/noun.pr ,/ my/det cousin/noun and/conj.co I/pron visited/verb a/det castle/noun in/prep Wales/noun.pr ./';
w.add({prompt:'Select the **two** proper nouns in the sentence below.',stimulus:untag(t),answer:['July','Wales'],wrong:['cousin','I','castle'],
 explanation:explain('A **proper noun** is the name of a particular person, place, day or month, and it starts with a capital letter.','- **July** names a month and **Wales** names a country, so they are proper nouns.','- **I** always has a capital letter, but it is a **pronoun**.','- **cousin** and **castle** are common nouns.')},pick(t,'noun.pr',true));}

w.add({prompt:'Which word in the sentence below should begin with a **capital letter**?',stimulus:'On our trip to the coast, we climbed up to a lighthouse near whitby.',answer:'whitby',wrong:['coast','lighthouse','trip'],rewardGroup:'quick',
 explanation:explain('**Whitby** is the name of a particular town, so it is a proper noun and needs a capital letter: Whitby.','- coast, lighthouse and trip are common nouns, so they do not need capital letters.')},
 {kind:'capitals',corrected:'On our trip to the coast, we climbed up to a lighthouse near Whitby.'});

{const t='A/det flock/noun.col of/prep noisy/adj seagulls/noun circled/verb above/prep the/det harbour/noun ./';
w.add({prompt:'Which word in the sentence below is a **collective** noun?',stimulus:untag(t),answer:'flock',wrong:['seagulls','harbour','noisy'],rewardGroup:'quick',
 explanation:explain('A **collective noun** names a group: a **flock** is a group of birds.','- **seagulls** and **harbour** are nouns, but they are not names for groups.','- **noisy** is an adjective.')},pick(t,'noun.col'));}

w.add({prompt:'Which collective noun best completes the sentence?',stimulus:'A ___ of ships sailed slowly into the bay.',answer:'fleet',wrong:['herd','swarm','pride'],
 explanation:explain('A group of ships is a **fleet**.','- A **herd** is a group of animals such as cows or elephants.','- A **swarm** is a group of insects such as bees.','- A **pride** is a group of lions.')});

w.add({prompt:"In which sentence is the word 'light' used as a **noun**?",answer:'The light from the lantern flickered in the wind.',wrong:['Please light the candles on the cake.','This rucksack is very light.','Hana packed a light jacket for the walk.'],
 explanation:explain("In 'The **light** from the lantern flickered', light is a thing: it follows 'the' and it is what flickered, so it is a **noun**.","- 'Please light the candles': light is an action, so it is a **verb**.","- 'very light' and 'a light jacket': light describes the rucksack and the jacket, so it is an **adjective**.")});

w.add({prompt:"In which sentence is the word 'watch' used as a **noun**?",answer:'Grandad gave me his old watch.',wrong:['We watch the birds from the window.','Watch out for the step!','They took turns to watch the campfire.'],
 explanation:explain("In 'his old **watch**', watch names an object that Grandad gave, so it is a **noun**.","- In the other sentences, watch is something people do (watch the birds, watch out, to watch the campfire), so it is a **verb**.")});

w.add({prompt:'Which word is the main noun that the rest of this expanded noun phrase tells us about?',stimulus:'the tall tower with the golden clock',answer:'tower',wrong:['tall','golden','clock'],rewardGroup:'challenge',
 explanation:explain("The phrase is about the **tower**: 'tall' describes it and 'with the golden clock' tells us more about it.","- **clock** is a noun too, but it is part of the extra information 'with the golden clock'.",'- **tall** and **golden** are adjectives.')});

w.add({prompt:"Which word is the **abstract noun** formed from the adjective 'brave'?",answer:'bravery',wrong:['bravely','braver','bravest'],
 explanation:explain("**bravery** names the quality of being brave: you can say 'their bravery', so it is an abstract noun.",'- **bravely** is an adverb: she spoke bravely.','- **braver** and **bravest** are adjectives used for comparing.')});

{const t='Quietly/adv ,/ the/det tired/adj hikers/noun rested/verb beside/prep the/det stream/noun ./';
w.add({prompt:'Select the **two** nouns in the sentence below.',stimulus:untag(t),answer:['hikers','stream'],wrong:['Quietly','tired','rested'],
 explanation:explain("**hikers** (people) and **stream** (a place) are the nouns: you can put 'the' in front of each.",'- **Quietly** is an adverb, **tired** is an adjective and **rested** is a verb.')},pick(t,'noun',true));}

export const nouns=w.done();
