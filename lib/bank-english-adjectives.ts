import {explain,type Topic} from './bank-kit';
import {writer,untag} from './bank-english-kit';
// Adjectives: spotting them before and after nouns, comparatives and superlatives, order and expanded noun phrases.

const topic:Topic={id:'en-adjectives',subject:'English',strand:'Grammar',title:'Adjectives',helpsheet:{
 intro:'An **adjective** describes a noun: it tells you more about a person, place or thing (a **muddy** path; the path was **muddy**).',
 steps:[
  'Find the nouns first, then look for the words that describe them.',
  'Adjectives usually come just before a noun (a **cold** wind) or after verbs such as is, was, seems and looks (the wind was **cold**).',
  '**Comparative** adjectives compare two things (taller, more careful). **Superlative** adjectives compare three or more (tallest, most careful).',
  'An **expanded noun phrase** adds detail around a noun: the **old** gate **with a squeaky hinge**.',
 ],
 example:{title:'Adjectives at work',lines:['The sleepy puppy chose a softer cushion than the old one.','- **sleepy** describes the puppy (before the noun)','- **softer** compares two cushions (comparative)','- **old** describes the other cushion']},
 tips:['Most adverbs end in -ly, but a few -ly words are adjectives: a **lovely** day, an **ugly** mark.',"Never compare twice: say 'happier' or 'more careful', not 'more happier'.","Some words can be adjectives or adverbs: a **hard** question (adjective), but they worked **hard** (adverb)."],
}};

const w=writer(topic);
const count=(tagged:string,cls:string)=>({kind:'count',tagged,cls});
const pick=(tagged:string,cls:string,all=false)=>({kind:'pick',tagged,cls,all});

{const t='The/det small/adj ,/ scruffy/adj dog/noun chased/verb a/det red/adj ball/noun across/prep the/det wet/adj grass/noun ./';
w.add({prompt:'How many adjectives are in this sentence?',stimulus:untag(t),answer:'4',wrong:['3','5','6'],
 explanation:explain('The adjectives are **small**, **scruffy**, **red** and **wet**: 4.','- small and scruffy describe the dog, red describes the ball and wet describes the grass.','- chased is a verb; a and the are determiners.')},count(t,'adj'));}

{const t='The/det soup/noun was/verb hot/adj ,/ so/conj.co Leo/noun.pr waited/verb until/conj.sub it/pron was/verb cool/adj ./';
w.add({prompt:'How many adjectives are in this sentence?',stimulus:untag(t),answer:'2',wrong:['1','3','4'],
 explanation:explain('The adjectives are **hot** and **cool**: 2. Both describe the soup.',"- Adjectives do not always come before a noun: after 'was', they tell us what something was like.",'- waited is a verb; so and until are conjunctions.')},count(t,'adj'));}

{const t='Quinn/noun.pr sang/verb loudly/adv in/prep the/det enormous/adj hall/noun ./';
w.add({prompt:'Which word in the sentence below is an **adjective**?',stimulus:untag(t),answer:'enormous',wrong:['sang','loudly','hall'],rewardGroup:'quick',
 explanation:explain('**enormous** describes the hall, so it is an adjective.','- **loudly** tells us how Quinn sang, so it is an adverb.','- **sang** is a verb and **hall** is a noun.')},pick(t,'adj'));}

w.add({prompt:'Which word correctly completes the sentence?',stimulus:'Of all the runners in the race, Isaac was the ___.',answer:'fastest',wrong:['faster','most fast','fastly'],rewardGroup:'quick',
 explanation:explain("'Of all the runners' compares more than two people, so we need the **superlative**: the **fastest**.",'- **faster** compares only two.','- **most fast** is wrong: short adjectives such as fast add -est.','- **fastly** is not a word.')});

w.add({prompt:'Which words correctly complete the sentence?',stimulus:'This puzzle is ___ than the one we did yesterday.',answer:'more difficult',wrong:['difficulter','most difficult','more difficulter'],
 explanation:explain("Two puzzles are compared ('than'), so we need a **comparative**. Long adjectives such as difficult use **more**: more difficult.",'- **difficulter** is not a word.','- **most difficult** is the superlative, used for three or more.','- **more difficulter** compares twice over.')});

w.add({prompt:'Which sentence uses a comparative adjective correctly?',answer:'My bag is heavier than yours.',wrong:['My bag is more heavier than yours.','My bag is heaviest than yours.','My bag is heavyer than yours.'],
 explanation:explain('**heavier** is the comparative of heavy: change the y to i and add -er.',"- 'more heavier' compares twice over.","- 'heaviest' is a superlative, which does not go with 'than'.","- 'heavyer' should change the y to i.")});

w.add({prompt:'Which word correctly completes the sentence?',stimulus:'Her second painting was even ___ than her first.',answer:'better',wrong:['gooder','best','more good'],
 explanation:explain("**good** is irregular: good, **better**, best. 'than' tells us two paintings are compared, so we need better.",'- gooder and more good are not standard English.','- best is the superlative, used for three or more.')});

w.add({prompt:'Which of these is an **expanded noun phrase**?',answer:'the rusty key under the mat',wrong:['the key','under the mat','rusted slowly'],
 explanation:explain("An **expanded noun phrase** is a noun with extra detail. 'the **rusty** key **under the mat**' adds an adjective before the noun key and a phrase after it.","- 'the key' is a noun phrase, but nothing has been added to it.","- 'under the mat' is a prepositional phrase: it tells us where something is.","- 'rusted slowly' is a verb and an adverb.")});

{const t='the/det shiny/adj new/adj helmet/noun with/prep a/det round/adj visor/noun';
w.add({prompt:'How many adjectives are in this expanded noun phrase?',stimulus:untag(t),answer:'3',wrong:['2','4','5'],
 explanation:explain('The adjectives are **shiny** and **new** (describing the helmet) and **round** (describing the visor): 3.','- helmet and visor are nouns; the and a are determiners; with is a preposition.')},count(t,'adj'));}

w.add({prompt:'Which of these words is an **adjective**?',answer:'beautiful',wrong:['beauty','beautifully','beautify'],rewardGroup:'quick',
 explanation:explain('**beautiful** describes a noun: a beautiful garden.','- **beauty** is a noun, **beautifully** is an adverb and **beautify** is a verb.')});

w.add({prompt:"In which sentence is 'fast' used as an **adjective**?",answer:'Kofi is a fast runner.',wrong:['Kofi ran fast to catch the bus.','The river flowed fast after the storm.','Hold fast to the rope!'],rewardGroup:'challenge',
 explanation:explain("In 'a **fast** runner', fast describes the noun runner, so it is an **adjective**.",'- In the other sentences, fast tells us how someone ran, how the river flowed or how to hold on, so it is an **adverb**.')});

w.add({prompt:'Which phrase has the adjectives in the most natural order?',answer:'a lovely little old wooden cottage',wrong:['a wooden old little lovely cottage','an old lovely wooden little cottage','a little wooden lovely old cottage'],rewardGroup:'challenge',
 explanation:explain('English adjectives usually go in this order: opinion (**lovely**), size (**little**), age (**old**), then material (**wooden**).','- The other phrases mix up that order, so they sound odd to an English speaker.')});

{const t='The/det castle/noun looked/verb gloomy/adj in/prep the/det grey/adj fog/noun ./';
w.add({prompt:'Select the **two** adjectives in the sentence below.',stimulus:untag(t),answer:['gloomy','grey'],wrong:['castle','looked','fog'],
 explanation:explain("**gloomy** describes the castle (it comes after the verb 'looked') and **grey** describes the fog.",'- castle and fog are nouns; looked is a verb.')},pick(t,'adj',true));}

w.add({prompt:'Which sentence uses a **superlative** adjective?',answer:'This is the most exciting book I have read.',wrong:['This book is more exciting than that one.','This book is very exciting.','This book excited everyone in the class.'],
 explanation:explain('**most exciting** is a superlative: it compares this book with every other book I have read.',"- 'more exciting than' is a comparative: it compares two books.","- 'very exciting' describes one book without comparing it.","- In 'This book excited everyone in the class', excited is a verb.")});

w.add({prompt:"Which single adjective could replace 'full of hope' in the sentence below?",stimulus:'Priya felt full of hope as she opened the envelope.',answer:'hopeful',wrong:['hopeless','hoping','hopefully'],
 explanation:explain("**hopeful** means full of hope: the suffix -ful means 'full of'.",'- **hopeless** means without hope, the opposite.','- **hoping** is a verb and **hopefully** is an adverb.')});

w.add({prompt:"In which sentence is 'broken' used as an **adjective**?",answer:'The broken vase lay in pieces on the floor.',wrong:['Someone has broken the vase.','The wind had broken a branch off the tree.','Who has broken my pencil?'],rewardGroup:'challenge',
 explanation:explain("In 'The **broken** vase', broken comes before the noun vase and describes it, so it is an **adjective**.",'- In the other sentences, broken comes after has or had and is part of the verb.')});

{const t='The/det younger/adj.cmp twin/noun carried/verb the/det lighter/adj.cmp bag/noun up/prep the/det steep/adj hill/noun ./';
w.add({prompt:'Select the **two** comparative adjectives in the sentence below.',stimulus:untag(t),answer:['younger','lighter'],wrong:['twin','steep','hill'],
 explanation:explain('**younger** and **lighter** end in -er and compare two things: one twin with the other, and one bag with the other.','- **steep** is an adjective, but it does not compare.','- twin and hill are nouns.')},pick(t,'adj.cmp',true));}

w.add({prompt:'Which adjective best completes the sentence?',stimulus:"The icy wind made the walkers' fingers ___.",answer:'numb',wrong:['humid','fragrant','drowsy'],
 explanation:explain('**numb** means unable to feel anything, which is how fingers feel in an icy wind.','- humid means warm and damp, fragrant means sweet-smelling and drowsy means sleepy, so none of them fit.')});

export const adjectives=w.done();
