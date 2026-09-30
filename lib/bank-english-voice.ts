import {explain,type Topic} from './bank-kit';
import {writer} from './bank-english-kit';
// Active and passive voice. Notes give each option's verb phrase ('voice'), or the parts of the sentence being changed
// ('passiveOf' / 'activeOf'), so the test can rebuild the answer with its own verb tables.

const topic:Topic={id:'en-active-passive',subject:'English',strand:'Grammar',title:'Active and passive',helpsheet:{
 intro:"In an **active** sentence, the subject does the action: 'The chef cooked the pasta.' In a **passive** sentence, the subject has the action done to it: 'The pasta was cooked (by the chef).'",
 steps:[
  'Find the verb and ask: is the subject doing the action, or having it done to it?',
  'A passive verb uses a form of **be** (is, are, was, were, be, been, being) + a **past participle**: was cooked, are made, has been built.',
  "The doer can be added after **by**, or left out: 'The window was broken.'",
  'To change active into passive, make the object the new subject, then use a form of be and the past participle. Keep the same tense.',
 ],
 example:{title:'Active to passive',lines:['Active: The builders repaired the roof.','Passive: The roof **was repaired** by the builders.','Passive without the doer: The roof **was repaired**.']},
 tips:["was + -ing (was cooking) is not passive: it is the past progressive, and the subject is still doing the action.","Not every 'by' means passive: 'The cat slept by the radiator' is active.",'Writers use the passive when the doer is unknown or unimportant, or to sound formal, as in science reports.'],
}};

const w=writer(topic);
const voice=(target:'active'|'passive',phrases:Record<string,string>)=>({kind:'voice',target,phrases});

w.add({prompt:'Which sentence is written in the **passive** voice?',answer:'The window was broken by a football.',wrong:['A football broke the window.','The boys were playing football near the window.','The boys kicked the football at the goal.'],
 explanation:explain("In 'The window **was broken** by a football', the subject (the window) has the action done to it, and the verb is **was** + the past participle **broken**: that is the passive.","- In the other sentences, the subject does the action, so they are active. 'were playing' is active too: it is were + -ing.")},
 voice('passive',{'The window was broken by a football.':'was broken','A football broke the window.':'broke','The boys were playing football near the window.':'were playing','The boys kicked the football at the goal.':'kicked'}));

w.add({prompt:'Which sentence is written in the **active** voice?',answer:'A hedgehog visited our garden.',wrong:['The cake was eaten by the guests.','The prize was won by Sofia.','Our garden was visited by a hedgehog.'],rewardGroup:'quick',
 explanation:explain("In 'A hedgehog **visited** our garden', the subject (a hedgehog) does the action, so the sentence is **active**.",'- The other three use was + a past participle, and their subjects have the action done to them: they are passive.')},
 voice('active',{'A hedgehog visited our garden.':'visited','The cake was eaten by the guests.':'was eaten','The prize was won by Sofia.':'was won','Our garden was visited by a hedgehog.':'was visited'}));

w.add({prompt:'Which sentence is the **passive** version of the sentence below?',stimulus:'The dog chased the cat.',answer:'The cat was chased by the dog.',wrong:['The dog was chased by the cat.','The cat chased the dog.','The cat is chased by the dog.'],
 explanation:explain("To make the passive, the object (**the cat**) becomes the subject and the verb becomes **was chased**. The dog is still the one chasing, so it goes after **by**.","- 'The dog was chased by the cat' swaps who did the chasing.","- 'The cat chased the dog' is active and changes the meaning.","- 'is chased' changes the tense from past to present.")},
 {kind:'passiveOf',doer:'the dog',verb:'chase',tense:'simple past',object:'the cat'});

w.add({prompt:'Which sentence is the **active** version of the sentence below?',stimulus:'The letter was written by Grandma.',answer:'Grandma wrote the letter.',wrong:['The letter wrote Grandma.','Grandma was writing the letter.','Grandma has written the letter.'],
 explanation:explain("In the active version, the doer (**Grandma**) becomes the subject: Grandma **wrote** the letter. 'was written' is past, so we use the simple past 'wrote'.","- 'The letter wrote Grandma' makes the letter the writer.","- 'was writing' and 'has written' change the tense.")},
 {kind:'activeOf',doer:'Grandma',verb:'write',tense:'simple past',object:'the letter'});

w.add({prompt:'Which sentence is **passive**?',answer:'The gates were locked at sunset.',wrong:['The keeper locked the gates at sunset.','The gates closed slowly at sunset.','The keeper was locking the gates at sunset.'],rewardGroup:'challenge',
 explanation:explain("'The gates **were locked**' uses were + the past participle locked, and the gates have the action done to them. It is passive, even though it does not say who locked them.","- 'was locking' is was + -ing, which is active (past progressive).",'- In the other two sentences, the subject does the action.')},
 voice('passive',{'The gates were locked at sunset.':'were locked','The keeper locked the gates at sunset.':'locked','The gates closed slowly at sunset.':'closed','The keeper was locking the gates at sunset.':'was locking'}));

w.add({prompt:'Why might a writer use the passive voice in the sentence below?',stimulus:'The treasure was stolen during the night.',answer:'The writer does not know, or does not want to say, who stole it.',wrong:['The treasure stole something.','It makes the thief the most important part of the sentence.','The theft is going to happen in the future.'],
 explanation:explain('The passive lets the writer leave out the doer. The thief is not named, so the sentence focuses on **the treasure** and what happened to it.','- The treasure did not steal anything: it was stolen.','- The thief is not mentioned at all, so the thief is not the focus.',"- 'was stolen' is past, not future.")});

w.add({prompt:'In this passive sentence, who performed the action?',stimulus:'The prize was presented by the head teacher.',answer:'the head teacher',wrong:['the prize','the sentence does not say','the audience'],rewardGroup:'quick',
 explanation:explain('In a passive sentence, the doer comes after **by**: the head teacher presented the prize.','- The prize is the subject, but it had the action done to it.','- The audience is not mentioned.')});

w.add({prompt:'Which sentence is **passive**?',answer:'The rules must be followed by every player.',wrong:['Every player must follow the rules.','Every player has followed the rules.','The players are following the rules.'],rewardGroup:'challenge',
 explanation:explain("'must **be followed**' uses be + the past participle followed, and the subject (the rules) has the action done to it: it is passive.","- In the other sentences, the players do the following, so they are active. 'has followed' has no form of be, and 'are following' is are + -ing.")},
 voice('passive',{'The rules must be followed by every player.':'be followed','Every player must follow the rules.':'follow','Every player has followed the rules.':'has followed','The players are following the rules.':'are following'}));

w.add({prompt:'Which words correctly complete the passive sentence?',stimulus:'The bridge ___ by a team of engineers in 1890.',answer:'was built',wrong:['built','was building','has built'],
 explanation:explain('The bridge had the building done to it, and 1890 is in the past, so we need the passive **was built** (was + past participle).',"- 'built' and 'has built' would make the bridge do the building.","- 'was building' is active: was + -ing.")},
 voice('passive',{'was built':'was built','built':'built','was building':'was building','has built':'has built'}));

w.add({prompt:'Which words correctly complete the sentence?',stimulus:'The classroom windows ___ every Friday afternoon.',answer:'are cleaned',wrong:['clean','are cleaning','cleaned'],
 explanation:explain("The windows do not clean anything: they have the cleaning done to them. 'every Friday' shows something that happens regularly, so we use the present passive **are cleaned**.","- 'clean', 'are cleaning' and 'cleaned' would all make the windows do the cleaning.")},
 voice('passive',{'are cleaned':'are cleaned','clean':'clean','are cleaning':'are cleaning','cleaned':'cleaned'}));

w.add({prompt:'Which sentence is the passive version of the sentence below?',stimulus:'Someone has eaten my sandwich.',answer:'My sandwich has been eaten.',wrong:['My sandwich has eaten.','My sandwich was eating.','My sandwich has been eating.'],rewardGroup:'challenge',
 explanation:explain("The object (my sandwich) becomes the subject, and 'has eaten' becomes **has been eaten** (has been + past participle). 'Someone' can be left out because we do not know who it was.","- 'has eaten', 'was eating' and 'has been eating' would all mean the sandwich did the eating.")},
 voice('passive',{'My sandwich has been eaten.':'has been eaten','My sandwich has eaten.':'has eaten','My sandwich was eating.':'was eating','My sandwich has been eating.':'has been eating'}));

w.add({prompt:'What is the **subject** of this passive sentence?',stimulus:'The old barn was destroyed by the storm.',answer:'The old barn',wrong:['the storm','destroyed','was'],rewardGroup:'challenge',
 explanation:explain('The subject comes before the verb: **The old barn**. In a passive sentence, the subject has the action done to it.','- **the storm** did the destroying, but it comes after by, so it is not the subject.',"- 'was destroyed' is the verb.")});

w.add({prompt:'How many of the sentences on the cards are **passive**?',visual:{kind:'cards',alt:'Four sentences about a bell, on cards',cards:[{text:'The bell was rung at noon.'},{text:'Mia rang the bell.'},{text:'The bells were ringing all morning.'},{text:'The bell will be rung again later.'}]},answer:'2',wrong:['1','3','4'],rewardGroup:'challenge',
 explanation:explain('Two sentences are passive:',"- 'The bell **was rung** at noon.' (was + rung)","- 'The bell **will be rung** again later.' (be + rung)","The other two are active: Mia did the ringing, and 'were ringing' is were + -ing.")},
 {kind:'voiceCount',phrases:['was rung','rang','were ringing','be rung']});

w.add({prompt:'Which sentence is **passive**?',answer:'The picnic was ruined by ants.',wrong:['The children walked by the river.','Dad waited by the door.','We sat by the fire.'],rewardGroup:'challenge',
 explanation:explain("'The picnic **was ruined** by ants' uses was + a past participle, and the picnic has the action done to it: it is passive.",'- The other sentences contain by, but there it means beside. Their verbs (walked, waited, sat) are active.')},
 voice('passive',{'The picnic was ruined by ants.':'was ruined','The children walked by the river.':'walked','Dad waited by the door.':'waited','We sat by the fire.':'sat'}));

w.add({prompt:'Which sentence is written in the passive, as it might be in a science report?',answer:'The water was heated for five minutes.',wrong:['We heated the water for five minutes.','Heat the water for five minutes.','I heated the water for five minutes.'],
 explanation:explain("'The water **was heated**' uses was + a past participle and does not say who did it. Science reports often use the passive because the method matters more than the person.","- The other sentences are active: we or I did the heating, and 'Heat the water' is a command.")},
 voice('passive',{'The water was heated for five minutes.':'was heated','We heated the water for five minutes.':'heated','Heat the water for five minutes.':'heat','I heated the water for five minutes.':'heated'}));

w.add({prompt:'Which sentence is passive **and** in the past tense?',answer:'The fence was painted by Dad.',wrong:['The fence is painted every year.','Dad painted the fence.','The fence will be painted soon.'],rewardGroup:'challenge',
 explanation:explain("'The fence **was painted** by Dad' is passive (was + past participle), and **was** shows the past.","- 'is painted' is passive, but present.","- 'Dad painted the fence' is past, but active.","- 'will be painted' is passive, but about the future.")},
 {kind:'voiceTime',target:'passive past',phrases:{'The fence was painted by Dad.':'was painted','The fence is painted every year.':'is painted','Dad painted the fence.':'painted','The fence will be painted soon.':'will be painted'}});

w.add({prompt:'Which sentence is the **active** version of the sentence below?',stimulus:'The song is being sung by the choir.',answer:'The choir is singing the song.',wrong:['The choir sang the song.','The choir has sung the song.','The song is singing the choir.'],rewardGroup:'challenge',
 explanation:explain("'is being sung' is the present progressive in the passive, so the active version keeps the present progressive: the choir **is singing** the song.","- 'sang' and 'has sung' change the tense.","- 'The song is singing the choir' makes the song do the singing.")},
 {kind:'activeOf',doer:'The choir',verb:'sing',tense:'present progressive',object:'the song'});

w.add({prompt:'Which word correctly completes the passive sentence?',stimulus:'The ball was ___ over the fence by Callum.',answer:'thrown',wrong:['threw','throwing','throws'],
 explanation:explain('A passive verb is a form of **be** + a past participle. Throw is irregular: throw, threw, (was) **thrown**.',"- 'threw' is the simple past, which does not follow was.","- 'was throwing' would make the ball do the throwing, and 'was throws' is not correct.")},{kind:'participle',verb:'throw'});

export const activePassive=w.done();
