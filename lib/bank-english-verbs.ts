import {explain,type Topic} from './bank-kit';
import {writer,untag} from './bank-english-kit';
// Verbs: main, auxiliary and modal verbs, imperatives, irregular past forms and words that are verbs in one sentence but not another.

const topic:Topic={id:'en-verbs',subject:'English',strand:'Grammar',title:'Verbs',helpsheet:{
 intro:'A **verb** names an action (run, write), a state (be, seem, belong) or an event (happen). Every sentence needs at least one verb.',
 steps:[
  'Ask what somebody or something **does** or **is** in the sentence.',
  'Try changing the tense. If the word changes (jump → jumped, is → was), it is probably a verb.',
  'Look for helping verbs: **auxiliary** verbs (be, have, do) and **modal** verbs (can, could, will, would, shall, should, may, might, must) come before a main verb.',
  "Check the word's job in this sentence: 'a **swim** in the sea' is a noun, but 'we **swim**' is a verb.",
 ],
 example:{title:'Find the verbs',lines:['After tea, Nadia might paint a picture of the garden.','- **might**: modal verb (it shows the painting is possible)','- **paint**: main verb (the action)','- tea, picture and garden are nouns.']},
 tips:['Forms of **be** (am, is, are, was, were) are verbs even though they are not actions.',"A command often starts with its verb: '**Stir** the soup gently.'",'Modal verbs show how likely or necessary something is: will (certain), might (possible), must (necessary).'],
}};

const w=writer(topic);
const count=(tagged:string,cls:string)=>({kind:'count',tagged,cls});
const pick=(tagged:string,cls:string,all=false)=>({kind:'pick',tagged,cls,all});

{const t='After/prep the/det race/noun ,/ Kofi/noun.pr had/verb a/det long/adj drink/noun of/prep water/noun ./ Then/adv he/pron cheered/verb for/prep his/det friends/noun ./';
w.add({prompt:'Select the **two** verbs used in the sentences below.',stimulus:untag(t),answer:['had','cheered'],wrong:['race','drink','friends'],
 explanation:explain('The verbs are **had** (Kofi had a drink) and **cheered** (what he did next).',"- **drink** can be a verb (to drink), but here it follows 'a long', so it names a thing: it is a **noun**.","- **race** is a noun here too: 'After the race'.",'- **friends** is a noun.')},pick(t,'verb',true));}

{const t='The/det dance/noun at/prep the/det end/noun of/prep term/noun was/verb brilliant/adj ./ Everybody/pron clapped/verb ./';
w.add({prompt:'Select the **two** verbs used in the sentences below.',stimulus:untag(t),answer:['was','clapped'],wrong:['dance','end','brilliant'],rewardGroup:'challenge',
 explanation:explain("The verbs are **was** and **clapped**.","- **was** is a form of the verb 'to be'. It is not an action, but it is still a verb.","- **dance** can be a verb, but 'The dance' names an event, so here it is a **noun**.",'- **brilliant** is an adjective describing the dance.')},pick(t,'verb',true));}

{const t='Tilly/noun.pr wrote/verb a/det note/noun for/prep her/det brother/noun ./ He/pron found/verb it/pron on/prep the/det fridge/noun ./';
w.add({prompt:'Select the **two** verbs used in the sentences below.',stimulus:untag(t),answer:['wrote','found'],wrong:['note','brother','fridge'],
 explanation:explain('**wrote** and **found** are the verbs: they tell us what Tilly and her brother did.',"- **note** can be a verb (to note something down), but 'a note' names a thing, so here it is a **noun**.",'- **brother** and **fridge** are nouns.')},pick(t,'verb',true));}

{const t='Zain/noun.pr opened/verb the/det tin/noun ,/ sniffed/verb the/det biscuits/noun and/conj.co smiled/verb ./';
w.add({prompt:'How many verbs are in this sentence?',stimulus:untag(t),answer:'3',wrong:['2','4','5'],rewardGroup:'quick',
 explanation:explain('Zain did three things: **opened**, **sniffed** and **smiled**. So there are 3 verbs.',"- tin and biscuits are nouns, and 'and' is a conjunction.")},count(t,'verb'));}

{const t='Swallows/noun arrive/verb in/prep spring/noun ,/ build/verb their/det nests/noun ,/ raise/verb their/det chicks/noun and/conj.co leave/verb in/prep autumn/noun ./';
w.add({prompt:'How many verbs are in this sentence?',stimulus:untag(t),answer:'4',wrong:['3','5','6'],rewardGroup:'challenge',
 explanation:explain('The verbs are **arrive**, **build**, **raise** and **leave**: 4 verbs.',"- **spring** can be a verb (to spring up), but 'in spring' names a season, so here it is a noun.",'- **nests** and **chicks** are nouns.')},count(t,'verb'));}

{const t='The/det ancient/adj oak/noun tree/noun seems/verb very/adv tired/adj this/det autumn/noun ./';
w.add({prompt:'Which word in the sentence below is a verb?',stimulus:untag(t),answer:'seems',wrong:['ancient','oak','tired'],
 explanation:explain("**seems** is the verb: it tells us how the tree appears. Change the tense and it becomes 'seemed'.",'- **tired** ends in -ed, but here it describes the tree, so it is an **adjective**.','- **ancient** is an adjective and **oak** is a noun.')},pick(t,'verb'));}

{const t='If/conj.sub it/pron stops/verb raining/verb ,/ we/pron might/verb.mod walk/verb to/prep the/det park/noun after/prep tea/noun ./';
w.add({prompt:'Which word in the sentence below is a **modal verb**?',stimulus:untag(t),answer:'might',wrong:['stops','walk','after'],
 explanation:explain("**might** is a modal verb: it comes before the main verb 'walk' and shows that the walk is only **possible**.",'- **stops** and **walk** are verbs, but they are not modal verbs.','- **after** is a preposition here.')},pick(t,'verb.mod'));}

w.add({prompt:'Which modal verb makes the sentence show that the event is **certain**?',stimulus:"The fete ___ open at ten o'clock tomorrow; everything is ready.",answer:'will',wrong:['might','could','may'],
 explanation:explain('**will** shows that the speaker is sure it is going to happen.','- **might**, **could** and **may** all show that something is only possible, not certain.')});

w.add({prompt:'Which sentence uses a modal verb to show **possibility**?',answer:'We might see a rainbow later.',wrong:['You must wear a helmet on the zip wire.','Close the gate behind you.','The shop opens at nine.'],
 explanation:explain('**might** shows that seeing a rainbow is possible but not certain.','- **must** shows that something is necessary, not just possible.',"- 'Close the gate behind you' is a command with no modal verb.","- 'The shop opens at nine' is a plain statement of fact.")});

{const t='The/det heroes/noun were/verb.aux guarding/verb the/det gate/noun all/det night/noun ./';
w.add({prompt:'Which word in the sentence below is an **auxiliary** verb?',stimulus:untag(t),answer:'were',wrong:['guarding','gate','night'],
 explanation:explain('**were** is an auxiliary (helping) verb: it helps the main verb **guarding** to show an action that was in progress.','- **guarding** is the main verb.','- **gate** and **night** are nouns.')},pick(t,'verb.aux'));}

{const t='Carefully/adv pour/verb the/det warm/adj milk/noun into/prep the/det jug/noun ./';
w.add({prompt:'This sentence is a command. Which word is the **imperative** verb?',stimulus:untag(t),answer:'pour',wrong:['Carefully','warm','milk'],
 explanation:explain('In a command, the **imperative** verb tells someone what to do: **pour** the milk.','- **Carefully** is an adverb telling us how to pour.','- **warm** can be a verb, but here it describes the milk, so it is an adjective.','- **milk** is a noun.')},pick(t,'verb'));}

w.add({prompt:"In which sentence is 'paint' used as a **verb**?",answer:'We will paint the fence on Saturday.',wrong:['The paint dried quickly in the sun.','There is blue paint on your sleeve.','The paint pots were lined up on the shelf.'],
 explanation:explain("In 'We will **paint** the fence', paint is the action we will do, so it is a **verb**.","- In the other sentences, paint names the stuff itself ('The paint', 'blue paint', 'paint pots'), so it is a noun.")});

w.add({prompt:'Which verb form correctly completes the sentence?',stimulus:'Yesterday, Hugo ___ the ball with one hand.',answer:'caught',wrong:['catched','catches','cought'],
 explanation:explain("'Yesterday' tells us the sentence is about the past. **catch** is an irregular verb: its past tense is **caught**.",'- **catched** uses the -ed ending, but catch does not follow that rule.','- **catches** is present tense.','- **cought** is a misspelling.')});

w.add({prompt:'Which of these words is a **verb**?',answer:'sharpen',wrong:['sharpness','sharply','sharper'],rewardGroup:'quick',
 explanation:explain("The suffix **-en** turns the adjective 'sharp' into the verb **sharpen**: you can sharpen a pencil.",'- **sharpness** is a noun, **sharply** is an adverb and **sharper** is an adjective used for comparing.')});

w.add({prompt:"Which noun is the **subject** of the verb 'barked'?",stimulus:'Outside the gate, the excited puppy barked at the postman on his bike.',answer:'puppy',wrong:['gate','postman','bike'],
 explanation:explain('The **subject** is who or what does the verb. Who barked? The **puppy** did.','- The postman is the one being barked at.','- **gate** and **bike** only tell us where things are.')});

w.add({prompt:'Which verb best shows that the cat moved **slowly and quietly**?',answer:'crept',wrong:['dashed','bounded','scampered'],
 explanation:explain('To **creep** means to move slowly and quietly, often so as not to be noticed, so **crept** fits.','- **dashed**, **bounded** and **scampered** all describe moving quickly.')});

w.add({prompt:'Which sentence uses a modal verb to show that something is **necessary**?',answer:'You must bring a packed lunch on Friday.',wrong:['You could bring a packed lunch on Friday.','You might want a coat on Friday.','Will you bring a packed lunch on Friday?'],
 explanation:explain('**must** shows that bringing a packed lunch is necessary: there is no choice.',"- **could** gives a choice, **might** shows possibility, and 'Will you…?' asks what someone is going to do.")});

w.add({prompt:"Which sentence uses 'have' as an **auxiliary** verb?",answer:'They have finished the jigsaw.',wrong:['We have three rabbits.','I have a question about the trip.',"You have lunch at twelve o'clock."],rewardGroup:'challenge',
 explanation:explain("In 'They **have** finished the jigsaw', have helps the main verb **finished**, so it is an auxiliary verb.",'- In the other sentences, have is the main verb: it means own or eat, and no other verb follows it.')});

{const t='I/pron often/adv gather/verb pebbles/noun along/prep the/det shore/noun ./ Luckily/adv ,/ the/det tide/noun leaves/verb plenty/noun ./';
w.add({prompt:'Select the **two** verbs used in the sentences below.',stimulus:untag(t),answer:['gather','leaves'],wrong:['pebbles','shore','tide'],
 explanation:explain('The verbs are **gather** (what I do) and **leaves** (what the tide does).','- **pebbles**, **shore** and **tide** name things, so they are nouns.','- **leaves** can be a noun (leaves on a tree), but here it is an action.')},pick(t,'verb',true));}

{const t='The/det baker/noun kneaded/verb the/det dough/noun ./ Then/adv she/pron shaped/verb each/det roll/noun ./';
w.add({prompt:'Select the **two** verbs used in the sentences below.',stimulus:untag(t),answer:['kneaded','shaped'],wrong:['baker','dough','roll'],
 explanation:explain('The verbs are **kneaded** and **shaped**: they tell us what the baker did.','- **baker**, **dough** and **roll** name a person or things, so they are nouns.','- **roll** can be a verb (the ball rolled), but here it follows "each", so it is a noun.')},pick(t,'verb',true));}

{const t='Kofi/noun.pr mends/verb bikes/noun on/prep Saturdays/noun ./ His/det sister/noun polishes/verb the/det bells/noun ./';
w.add({prompt:'Select the **two** verbs used in the sentences below.',stimulus:untag(t),answer:['mends','polishes'],wrong:['bikes','sister','bells'],rewardGroup:'quick',
 explanation:explain('The verbs are **mends** and **polishes**: they are the actions.','- **bikes**, **sister** and **bells** name things or a person, so they are nouns.')},pick(t,'verb',true));}

{const t='Please/other stir/verb the/det paint/noun and/conj.co then/adv rinse/verb the/det brush/noun ./';
w.add({prompt:'Select the **two** verbs used in the sentence below.',stimulus:untag(t),answer:['stir','rinse'],wrong:['Please','paint','brush'],rewardGroup:'quick',
 explanation:explain('The verbs are **stir** and **rinse**. A command can start with its verb.','- **paint** and **brush** can be verbs, but here they follow "the", so they are nouns.','- **Please** is not a verb.')},pick(t,'verb',true));}

{const t='The/det choir/noun.col will/verb.mod perform/verb tonight/adv ./';
w.add({prompt:'How many words in this sentence are verbs?',stimulus:untag(t),answer:'2',wrong:['1','3','4'],
 explanation:explain('**will** is a modal verb and **perform** is the main verb: 2 verbs.','- **choir** is a noun and **tonight** is an adverb.','- Counting only the action word gives 1, which misses the helping verb.')},count(t,'verb'));}

w.add({prompt:"In which sentence is the word 'cook' used as a **verb**?",answer:'We cook porridge on cold mornings.',wrong:['The cook rang the lunch bell.','A new cook starts on Monday.','Ask the cook for more bread.'],
 explanation:explain("In 'We **cook** porridge', cook is an action, so it is a **verb**.","- In the other sentences, cook names a person, so it is a **noun**.")});

w.add({prompt:'Which word is the **modal** verb in the sentence below?',stimulus:'The team might win if the rain stops.',answer:'might',wrong:['win','stops','team','rain'],
 explanation:explain('**might** is a modal verb: it shows that winning is possible, not certain.','- **win** and **stops** are main verbs.','- **team** and **rain** are nouns.')});

w.add({prompt:'Which sentence uses an **imperative** verb?',answer:'Check the gate before you leave.',wrong:['The gate was checked at dusk.','Who checked the gate?','The gate check takes two minutes.'],rewardGroup:'quick',
 explanation:explain("'**Check** the gate' tells someone what to do, so **check** is an imperative verb.",'- The other sentences talk about a check, or ask a question. They do not give an instruction.')});

{const t='Yesterday/adv the/det foal/noun trotted/verb across/prep the/det yard/noun and/conj.co neighed/verb ./';
w.add({prompt:'How many words in this sentence are verbs?',stimulus:untag(t),answer:'2',wrong:['1','3','4'],
 explanation:explain('The verbs are **trotted** and **neighed**: 2 verbs.','- **foal** and **yard** are nouns.','- **Yesterday** and **across** are not verbs.')},count(t,'verb'));}

w.add({prompt:'Which verb best shows that the boat moved **with the wind behind it**?',answer:'sailed',wrong:['sank','anchored','leaked'],
 explanation:explain('To **sail** is to travel on water, using the wind, so **sailed** fits.','- **sank** means went under, **anchored** means stayed in one place and **leaked** means let water in.')});

export const verbs=w.done();
