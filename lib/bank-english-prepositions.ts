import {explain,type Topic} from './bank-kit';
import {writer,untag} from './bank-english-kit';
import type {Visual} from './visual';
// Prepositions: place, time and direction; prepositional phrases; prepositions compared with conjunctions and adverbs.

const topic:Topic={id:'en-prepositions',subject:'English',strand:'Grammar',title:'Prepositions',helpsheet:{
 intro:'A **preposition** links a noun or pronoun to the rest of the sentence. It often shows where (under, beside), when (before, during, since) or direction (towards, into).',
 steps:[
  'Look for a small word followed by a noun phrase: **under** the bridge, **during** the film, **with** my friend.',
  'The preposition and its noun phrase together make a **prepositional phrase**: across the field.',
  'If the word is followed by a whole clause with a verb (before **we ate**), it is working as a conjunction instead.',
  "If nothing follows it ('please come **in**'), it is working as an adverb.",
 ],
 example:{title:'Prepositions',lines:['The owl flew from the barn towards the woods at midnight.','- **from** and **towards** show direction.','- **at** shows time.',"- 'from the barn' is a prepositional phrase."]},
 tips:['Use **between** for two people or things and **among** for more than two.','**into** shows movement from outside to inside; **in** shows where something already is.','After a preposition, use object pronouns: with **me**, for **us**, beside **them**.'],
}};

const w=writer(topic);
const count=(tagged:string,cls:string)=>({kind:'count',tagged,cls});
const pick=(tagged:string,cls:string,all=false)=>({kind:'pick',tagged,cls,all});

{const t='The/det cat/noun hid/verb beneath/prep the/det old/adj wooden/adj bench/noun ./';
w.add({prompt:'Which word in the sentence below is a **preposition**?',stimulus:untag(t),answer:'beneath',wrong:['hid','old','wooden'],rewardGroup:'quick',
 explanation:explain("**beneath** links 'the old wooden bench' to the rest of the sentence and tells us where the cat hid, so it is a preposition.",'- **hid** is a verb; **old** and **wooden** are adjectives.')},pick(t,'prep'));}

{const t='During/prep the/det storm/noun ,/ the/det ponies/noun sheltered/verb under/prep the/det trees/noun ./';
w.add({prompt:'Select the **two** prepositions in the sentence below.',stimulus:untag(t),answer:['During','under'],wrong:['storm','sheltered','trees'],
 explanation:explain("**During** (when) and **under** (where) are prepositions: each is followed by a noun phrase, 'the storm' and 'the trees'.",'- storm and trees are nouns; sheltered is a verb.')},pick(t,'prep',true));}

w.add({prompt:"In which sentence is 'before' used as a **preposition**?",answer:'Wash your hands before lunch.',wrong:['Wash your hands before you eat.','I have seen this film before.','Before we leave, check the windows.'],rewardGroup:'challenge',
 explanation:explain("In 'before **lunch**', before is followed by a noun, so it is a **preposition**.","- In 'before you eat' and 'Before we leave', a clause with a verb follows, so before is a **conjunction**.","- In 'seen this film before', nothing follows, so before is an **adverb**.")});

w.add({prompt:"In which sentence is 'after' used as a **conjunction**?",answer:'We played outside after the rain had stopped.',wrong:['We played outside after lunch.','Nadia arrived soon after.','After the match, we had a picnic.'],rewardGroup:'challenge',
 explanation:explain("In 'after **the rain had stopped**', after is followed by a clause with its own verb (had stopped), so it is a **conjunction**.","- In 'after lunch' and 'After the match', a noun phrase follows, so after is a **preposition**.","- In 'soon after', nothing follows, so after is an **adverb**.")});

{const t='The/det explorers/noun walked/verb through/prep the/det forest/noun ,/ across/prep a/det rickety/adj bridge/noun and/conj.co up/prep the/det steep/adj hill/noun to/prep the/det castle/noun ./';
w.add({prompt:'How many prepositions are in this sentence?',stimulus:untag(t),answer:'4',wrong:['3','5','6'],
 explanation:explain('The prepositions are **through**, **across**, **up** and **to**: 4. Each is followed by a noun phrase (the forest, a rickety bridge, the steep hill, the castle).','- and is a conjunction; rickety and steep are adjectives.')},count(t,'prep'));}

w.add({prompt:'Which preposition in the sentence below shows **time**?',stimulus:'Since Monday, the book has been on the shelf beside my bed, under a pile of comics.',answer:'Since',wrong:['on','beside','under'],
 explanation:explain('**Since** tells us when: the book has been there from Monday until now.','- **on**, **beside** and **under** are prepositions of **place**: they tell us where the book is.')});

w.add({prompt:'Which preposition correctly completes the sentence?',stimulus:'The last slice of cake was shared ___ Tom and Uma.',answer:'between',wrong:['among','amongst','amid'],
 explanation:explain('Use **between** when there are two people or things: Tom and Uma.','- **among** and **amongst** are used for more than two.','- **amid** means in the middle of something, such as noise or a crowd.')});

w.add({prompt:'Which preposition correctly completes the sentence?',stimulus:'Leo is afraid ___ spiders, so he never goes into the shed.',answer:'of',wrong:['from','with','by'],rewardGroup:'quick',
 explanation:explain('In standard English we say **afraid of** something.',"- 'afraid from', 'afraid with' and 'afraid by' are not used.")});

w.add({prompt:'Which words form a **prepositional phrase** in the sentence below?',stimulus:'The heroes rested beside the crackling fire.',answer:'beside the crackling fire',wrong:['The heroes rested','the crackling fire','rested beside'],
 explanation:explain("A **prepositional phrase** starts with a preposition and ends with its noun phrase: **beside** + 'the crackling fire'.","- 'the crackling fire' is only the noun phrase, without the preposition.","- 'The heroes rested' is the main clause, and 'rested beside' is not a complete phrase.")});

w.add({prompt:'Which preposition best shows that the knight went from outside the tower to inside it?',stimulus:'The knight walked ___ the tower and closed the door behind her.',answer:'into',wrong:['in','onto','out of'],
 explanation:explain('**into** shows movement from outside to inside.',"- **in** tells us where something already is, not movement into it.","- **onto** means on to the top of something, and **out of** is the opposite direction.")});

w.add({prompt:"In which sentence is 'down' used as a **preposition**?",answer:'The children raced down the hill.',wrong:['Please sit down.','The price of apples went down.','Mei looked down and smiled.'],rewardGroup:'challenge',
 explanation:explain("In 'raced down **the hill**', down is followed by a noun phrase, so it is a **preposition**.",'- In the other sentences nothing follows down: it gives the direction on its own, so it is an **adverb**.')});

{const picture:Visual={kind:'figure',w:300,h:220,alt:'A ball and a table',marks:[
 {t:'line',x1:20,y1:200,x2:280,y2:200,w:2,c:'muted'},
 {t:'rect',x:60,y:112,w:180,h:14,fill:'orange',sw:2},
 {t:'line',x1:76,y1:126,x2:76,y2:200,w:5},{t:'line',x1:224,y1:126,x2:224,y2:200,w:5},
 {t:'circle',x:150,y:48,r:24,fill:'blue',w:2}]};
w.add({prompt:'Look at the picture. Which prepositional phrase describes where the ball is?',visual:picture,answer:'above the table',wrong:['on the table','under the table','beside the table'],rewardGroup:'quick',
 explanation:explain('The ball is higher than the table and is not touching it, so it is **above** the table.','- **on** would mean the ball is resting on the table top.','- **under** and **beside** describe other positions.')});}

w.add({prompt:'Which word is **not** a preposition?',answer:'quickly',wrong:['under','through','towards','despite'],rewardGroup:'quick',
 explanation:explain('**quickly** is an adverb: it tells us how something is done.','- under, through, towards and despite are prepositions: each can go before a noun phrase (under the bridge, despite the rain).')});

w.add({prompt:'Which pair of prepositions correctly completes the sentence?',stimulus:"I will meet you ___ Saturday ___ ten o'clock.",answer:'on … at',wrong:['in … at','at … on','on … in'],
 explanation:explain("We use **on** for days (on Saturday) and **at** for clock times (at ten o'clock).",'- **in** is used for months, years and parts of the day: in June, in the morning.')});

w.add({prompt:'Which preposition correctly completes the sentence?',stimulus:'We have lived in this village ___ 2019.',answer:'since',wrong:['for','during','until'],
 explanation:explain('**since** goes with the point in time when something started: since 2019.','- **for** goes with a length of time: for six years.',"- 'during 2019' and 'until 2019' do not fit 'have lived', which means from then up to now.")});

w.add({prompt:'Which word completes the sentence in **standard English**?',stimulus:'Mum shared the grapes between my sister and ___.',answer:'me',wrong:['I','myself','mine'],
 explanation:explain('After a preposition such as **between**, we use an object pronoun: between my sister and **me**.',"- **I** is a subject pronoun. We say 'for me', not 'for I', and the same goes for between.","- **myself** is used when the subject does something to themselves (I helped myself), and **mine** means 'belonging to me'.")});

w.add({prompt:'Which preposition in the sentence below shows **place**?',stimulus:'After breakfast, the puppy slept under the kitchen table until noon.',answer:'under',wrong:['After','until','noon'],
 explanation:explain("**under** tells us where the puppy slept: under the kitchen table. It shows place.","- **After** and **until** are prepositions of time: 'After breakfast' and 'until noon' tell us when.",'- **noon** is a noun.')});

{const t='Amara/noun.pr opened/verb the/det door/noun and/conj.co peered/verb inside/prep the/det dusty/adj cupboard/noun ./';
w.add({prompt:'Which word in the sentence below is a preposition?',stimulus:untag(t),answer:'inside',wrong:['opened','and','dusty'],rewardGroup:'quick',
 explanation:explain("**inside** is followed by the noun phrase 'the dusty cupboard' and tells us where Amara peered, so it is a preposition.",'- **and** is a conjunction, **opened** is a verb and **dusty** is an adjective.')},pick(t,'prep'));}

export const prepositions=w.done();
