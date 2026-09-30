import {explain,type Topic} from './bank-kit';
import {writer} from './bank-english-kit';
// Formal and informal language, standard English (agreement, verb forms, double negatives) and the subjunctive.

const topic:Topic={id:'en-formality',subject:'English',strand:'Grammar',title:'Formal language and the subjunctive',helpsheet:{
 intro:'**Formal** language is used for official writing and speech (letters to organisations, reports, speeches). **Informal** language is for friends and family. **Standard English** follows the grammar of written English at any level of formality.',
 steps:[
  "Formal writing avoids slang (loads, cool), contractions (can't) and chatty phrases (Hi guys).",
  'Choose precise, formal words: request instead of ask for, assist instead of help, purchase instead of buy.',
  "The **subjunctive** is a very formal verb form. It uses **were** after if for imaginary situations ('If she were taller…') and the plain verb after words such as insist, suggest and vital ('It is vital that he **be** on time').",
  "Standard English: make the verb agree with its subject (they were, not they was), write 'could have', not 'could of', and use only one negative.",
 ],
 example:{title:'Informal to formal',lines:["Informal: Can you let us know if you're coming?",'Formal: **Please inform us whether you will be attending.**','Subjunctive: The coach asked that every player **be** ready by nine.']},
 tips:["'They was', 'I seen it' and 'them apples' are not standard English.","Contractions (don't, it's) are fine in informal writing but are best avoided in formal writing.",'The subjunctive were is used with every subject: if I were, if he were, if they were.'],
}};

const w=writer(topic);

w.add({prompt:'Which sentence is the **most formal**?',answer:'We would be grateful if you could reply by Friday.',wrong:['Let us know by Friday, yeah?','Get back to us by Friday.','Can you tell us by Friday?'],
 explanation:explain("'**We would be grateful if you could reply**' uses polite, formal wording with no slang or contractions.","- 'yeah?' and 'Get back to us' are chatty and informal.","- 'Can you tell us…?' is polite, but it is everyday language rather than formal.")});

w.add({prompt:"Which word is the most formal way to say 'find out' in the sentence below?",stimulus:'The scientists hope to find out why the bees are leaving the hive.',answer:'discover',wrong:['spot','get','grab'],rewardGroup:'quick',
 explanation:explain("**discover** is the formal word for 'find out': 'hope to discover why…'.","- spot, get and grab are everyday words, and they do not mean 'find out' here.")});

w.add({prompt:"Which of these would make the sentence more formal if it replaced 'loads of'?",stimulus:'There were loads of visitors at the museum on Saturday.',answer:'numerous',wrong:['lots of','tons of','a load of'],
 explanation:explain("**numerous** means 'very many' and is formal: 'There were numerous visitors…'.",'- lots of, tons of and a load of are all informal ways of saying many.')});

w.add({prompt:'Which sentence uses the **subjunctive** form?',answer:'If I were a bird, I would fly over the manor.',wrong:['If I was a bird, I would fly over the manor.','When I am a bird, I fly over the manor.','If I am a bird, I will fly over the manor.'],rewardGroup:'challenge',
 explanation:explain("For an imaginary situation after **if**, the subjunctive uses **were** with every subject: 'If I **were** a bird'.","- 'If I was' is common in speech, but it is not the subjunctive.",'- The other sentences treat being a bird as something real, using am.')});

w.add({prompt:'Which verb completes the sentence in the **subjunctive** form?',stimulus:'The head teacher insists that every pupil ___ a sun hat on the trip.',answer:'wear',wrong:['wears','wore','wearing'],rewardGroup:'challenge',
 explanation:explain("After verbs such as **insist**, **suggest** and **recommend** + that, the subjunctive uses the plain verb with no -s: 'that every pupil **wear**'.","- 'wears' is the ordinary present tense: common in speech, but not the subjunctive.","- 'wore' and 'wearing' do not fit.")});

w.add({prompt:'Which verb completes the sentence in the **subjunctive** form?',stimulus:'It is essential that the gate ___ closed at all times.',answer:'be',wrong:['is','was','being'],rewardGroup:'challenge',
 explanation:explain("After 'It is essential that', the subjunctive uses **be** with every subject: 'that the gate **be** closed'.","- 'is' is the ordinary present tense, not the subjunctive.","- 'was' and 'being' do not fit.")});

w.add({prompt:'Which sentence uses the **subjunctive** form?',answer:'The vet recommended that the puppy rest for a week.',wrong:['The vet recommended that the puppy rests for a week.','The vet said that the puppy was resting.','The vet recommended a week of rest for the puppy.'],rewardGroup:'challenge',
 explanation:explain("After 'recommended that', the subjunctive uses the plain verb with no -s: 'that the puppy **rest**'.","- 'rests' is the ordinary present tense.","- 'was resting' just reports what was happening.","- In 'The vet recommended a week of rest for the puppy', rest is a noun, so there is no subjunctive verb.")});

w.add({prompt:'Which sentence is written in **standard English**?',answer:'We were late because the bus broke down.',wrong:['We was late because the bus broke down.','We was late cos the bus broke down.','Us was late because the bus broke down.'],rewardGroup:'quick',
 explanation:explain("In standard English, the verb agrees with its subject: **we were**, not 'we was'.","- 'cos' is an informal shortening of because.","- 'Us' cannot be the subject: it should be 'We'.")});

w.add({prompt:'Which word completes the sentence in **standard English**?',stimulus:'I ___ my homework straight after school yesterday.',answer:'did',wrong:['done','have did','doed'],
 explanation:explain("The simple past of do is **did**: 'I did my homework'.","- 'done' needs has, have or had before it ('I have done'), so 'I done' is not standard English.","- 'have did' and 'doed' are not correct forms.")});

w.add({prompt:'Which sentence is written correctly in standard English?',answer:'You should have seen the fireworks!',wrong:['You should of seen the fireworks!','You should have saw the fireworks!','You should of saw the fireworks!'],
 explanation:explain("The correct form is **should have** + a past participle: 'should have **seen**'.","- 'should of' is a mistake that comes from the sound of should've.","- 'saw' is the simple past, which does not follow have.")});

w.add({prompt:'Which word completes the sentence in **standard English**?',stimulus:'Can you pass me ___ books from the top shelf, please?',answer:'those',wrong:['them','they','that'],rewardGroup:'quick',
 explanation:explain('**those** is the standard English determiner for things further away: those books.',"- 'them books' is common in speech, but it is not standard English.","- 'they' is a pronoun, and 'that' goes with one thing (that book).")});

w.add({prompt:'Which sentence avoids a **double negative**?',answer:"I didn't see anything in the dark.",wrong:["I didn't see nothing in the dark.",'I never saw nothing in the dark.',"I didn't see nothing nowhere in the dark."],
 explanation:explain("In standard English, one negative is enough: **didn't** … **anything**.","- 'didn't … nothing' and 'never … nothing' use two negatives, which is not standard English.")});

w.add({prompt:'Which verb completes the sentence in **standard English**?',stimulus:'The box of old photographs ___ in the attic.',answer:'was',wrong:['were','are','been'],rewardGroup:'challenge',
 explanation:explain('The subject is **the box**: one box, so the verb must be singular: **was**.',"- 'photographs' is plural, but it is only part of the phrase 'of old photographs', which describes the box.","- 'were' and 'are' are plural, and 'been' needs has or had before it.")});

w.add({prompt:"A formal letter begins 'Dear Sir or Madam'. Which ending is correct?",answer:'Yours faithfully',wrong:['Yours sincerely','See you soon','Love from'],rewardGroup:'challenge',
 explanation:explain("When you do not know the person's name ('Dear Sir or Madam'), a formal letter ends **Yours faithfully**.","- **Yours sincerely** is used when the letter begins with the person's name, such as 'Dear Mr Evans'.","- 'See you soon' and 'Love from' are informal.")});

w.add({prompt:'Which sentence is **informal**?',answer:'The results were well surprising.',wrong:['The results were rather surprising.','The results were extremely surprising.','The results surprised the scientists.'],
 explanation:explain("Using **well** to mean 'very' is informal, chatty language.","- rather and extremely are fine in formal writing, and 'The results surprised the scientists.' is plain and formal.")});

w.add({prompt:'Which version of the sentence below is the most formal?',stimulus:"We can't come to the meeting.",answer:'We are unable to attend the meeting.',wrong:["We can't make the meeting.","We won't be at the meeting, sorry!","Can't come to the meeting."],
 explanation:explain("'We are **unable to attend** the meeting' has no contractions and uses formal words (attend instead of come to).","- 'can't make', 'won't … sorry!' and the sentence with no subject are all informal.")});

w.add({prompt:"Which word is the most formal replacement for 'get' in the sentence below?",stimulus:'You will get a letter about the trip next week.',answer:'receive',wrong:['grab','fetch','catch'],rewardGroup:'quick',
 explanation:explain("**receive** is the formal word for 'get' when something is sent to you: 'You will receive a letter'.",'- grab, fetch and catch do not fit the meaning, and they are less formal.')});

w.add({prompt:'Which sentence would be best in a formal letter to the local council?',answer:'I am writing to request a new bench for the park.',wrong:['Hiya, can we get a new bench?','The park needs a bench, obviously!','Sort out a new bench for us, please.'],
 explanation:explain("'I am writing to **request**…' is polite, clear and formal, with no slang or contractions.","- 'Hiya' is a chatty greeting, 'obviously!' sounds rude, and 'Sort out…' is an informal command.")});

export const formality=w.done();
