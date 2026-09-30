import {explain,type Topic} from './bank-kit';
import {writer} from './bank-english-kit';
// Tenses: simple, progressive and perfect forms in the present and past, irregular participles and keeping tenses consistent.
// Notes: 'tenseName' gives the verb phrase whose tense is the answer; 'tenseOptions' maps each option to its verb phrase so the
// test can check that only the answer has the target tense; 'participle' names the verb whose past participle is the answer.

const topic:Topic={id:'en-tenses',subject:'English',strand:'Grammar',title:'Verb tenses',helpsheet:{
 intro:'Verbs change their form to show **when** something happens. In Year 6 you need the simple, progressive and perfect forms, in the present and the past.',
 steps:[
  "Find the whole verb, including any helping verbs: 'had been waiting', 'was running'.",
  '**Simple**: one word (walks, walked). **Progressive**: am, is, are, was or were + -ing (was walking), for an action in progress.',
  '**Perfect**: has, have or had + a past participle (has walked, had walked). The present perfect links the past with now; the past perfect shows something happened before another past event.',
  'Keep the tense the same unless the time really changes.',
 ],
 example:{title:'One verb, six forms',lines:['- Simple present: Bea **plays** the drums.','- Present progressive: Bea **is playing** the drums.','- Simple past: Bea **played** the drums.','- Past progressive: Bea **was playing** the drums.','- Present perfect: Bea **has played** the drums.','- Past perfect: Bea **had played** the drums.']},
 tips:['Irregular verbs have special past forms and participles: sing, sang, (has) sung; ride, rode, (had) ridden.',"Do not use the present perfect with a finished time: say 'I found it yesterday', not 'I have found it yesterday'.","The perfect and progressive can combine: 'had been waiting' is the past perfect progressive."],
}};

const w=writer(topic);
const name=(phrase:string)=>({kind:'tenseName',phrase});
const options=(target:string,phrases:Record<string,string>)=>({kind:'tenseOptions',target,phrases});
const same=(...xs:string[])=>Object.fromEntries(xs.map(x=>[x,x]));

w.add({prompt:'Which tense is the verb in this sentence?',stimulus:'The owls were hooting in the woods.',answer:'past progressive',wrong:['present progressive','simple past','past perfect'],
 explanation:explain('**were hooting** is **were** + a verb ending in **-ing**. That is the **past progressive**: an action in progress in the past.',"- The present progressive would be 'are hooting'.","- The simple past would be 'hooted', and the past perfect 'had hooted'.")},name('were hooting'));

w.add({prompt:'Which tense is the verb in this sentence?',stimulus:'Nadia has visited the castle three times.',answer:'present perfect',wrong:['past perfect','simple past','present progressive'],
 explanation:explain('**has visited** is **has** + a past participle, which makes the **present perfect**. It links her past visits with now.',"- The past perfect would be 'had visited', the simple past 'visited' and the present progressive 'is visiting'.")},name('has visited'));

w.add({prompt:"Which tense is the verb 'had started' in the sentence below?",stimulus:'By the time we arrived, the film had started.',answer:'past perfect',wrong:['present perfect','simple past','past progressive'],
 explanation:explain('**had** + the past participle **started** makes the **past perfect**. It shows the film started before another past event: our arrival.',"- 'has started' would be present perfect, 'started' simple past and 'was starting' past progressive.")},name('had started'));

w.add({prompt:'Which verb form completes the sentence in the **present perfect**?',stimulus:'Ellie ___ her homework already, so she can play outside.',answer:'has finished',wrong:['had finished','finished','is finishing'],
 explanation:explain('The present perfect is **has** or **have** + a past participle: **has finished**. It fits because the finished homework matters now: she can play.',"- 'had finished' is past perfect, 'finished' is simple past and 'is finishing' is present progressive.")},
 options('present perfect',same('has finished','had finished','finished','is finishing')));

w.add({prompt:'Which verb form completes the sentence in the **past progressive**?',stimulus:'While we ___ our tent, it began to rain.',answer:'were pitching',wrong:['pitched','have pitched','are pitching'],
 explanation:explain('The past progressive is **was** or **were** + a verb ending in -ing: **were pitching**. It shows an action in progress when something else happened.',"- 'pitched' is simple past, 'have pitched' is present perfect and 'are pitching' is present progressive.")},
 options('past progressive',same('were pitching','pitched','have pitched','are pitching')));

w.add({prompt:'Which sentence says the same thing as the one below, but in the **present progressive**?',stimulus:'The children play in the park.',answer:'The children are playing in the park.',wrong:['The children were playing in the park.','The children have played in the park.','The children played in the park.'],
 explanation:explain('The present progressive is **am**, **is** or **are** + a verb ending in -ing: **are playing**.',"- 'were playing' is past progressive, 'have played' is present perfect and 'played' is simple past.")},
 options('present progressive',{'The children are playing in the park.':'are playing','The children were playing in the park.':'were playing','The children have played in the park.':'have played','The children played in the park.':'played'}));

w.add({prompt:"The verb 'see' is in the wrong tense. Which word should replace it?",stimulus:'Yesterday, we walked to the river and see a heron.',answer:'saw',wrong:['seen','sees','seeing'],
 explanation:explain('The sentence is about **yesterday**, and the first verb, **walked**, is in the simple past, so the second verb should be simple past too: **saw**.',"- 'seen' needs has, have or had in front of it.","- 'sees' and 'seeing' do not fit the past.")},
 options('simple past',same('saw','seen','sees','seeing')));

w.add({prompt:"Which tense is the verb 'had been practising' in the sentence below?",stimulus:'Priya had been practising for weeks before the concert.',answer:'past perfect progressive',wrong:['present perfect progressive','past progressive','past perfect'],rewardGroup:'challenge',
 explanation:explain('**had been** + a verb ending in **-ing** makes the **past perfect progressive**. It shows an action that went on for some time before another past event: the concert.',"- 'has been practising' would be present perfect progressive.","- 'was practising' is past progressive and 'had practised' is past perfect.")},name('had been practising'));

w.add({prompt:'Which tense is the verb in this sentence?',stimulus:'Every Saturday, Grandad bakes bread for the whole family.',answer:'simple present',wrong:['present progressive','simple past','present perfect'],rewardGroup:'quick',
 explanation:explain('**bakes** is one present-tense word: the **simple present**. It is used for things that happen regularly, such as every Saturday.',"- 'is baking' would be present progressive, 'baked' simple past and 'has baked' present perfect.")},name('bakes'));

w.add({prompt:'Which sentence describes an action that was **in progress** in the past?',answer:'Tom was painting when the doorbell rang.',wrong:['Tom painted a picture of the castle.','Tom has painted the fence twice.','Tom paints every Sunday afternoon.'],
 explanation:explain('**was painting** (was + -ing) is the **past progressive**: it shows an action that was going on when something else happened (the doorbell rang).',"- 'painted' is simple past (a finished action), 'has painted' is present perfect and 'paints' is simple present.")},
 options('past progressive',{'Tom was painting when the doorbell rang.':'was painting','Tom painted a picture of the castle.':'painted','Tom has painted the fence twice.':'has painted','Tom paints every Sunday afternoon.':'paints'}));

w.add({prompt:'Which verb form correctly completes the sentence?',stimulus:'By noon, the heroes had ___ the monsters back to the forest.',answer:'driven',wrong:['drove','drived','drive'],
 explanation:explain('After **had**, we need the past participle. Drive is irregular: drive, drove, (had) **driven**.',"- 'drove' is the simple past, which does not follow had.","- 'drived' is not a word, and 'drive' is the present form.")},{kind:'participle',verb:'drive'});

w.add({prompt:'Which verb form is in the **past perfect**?',answer:'had eaten',wrong:['has eaten','was eating','ate'],rewardGroup:'quick',
 explanation:explain('The past perfect is **had** + a past participle: **had eaten**.',"- 'has eaten' is present perfect, 'was eating' is past progressive and 'ate' is simple past.")},
 options('past perfect',same('had eaten','has eaten','was eating','ate')));

w.add({prompt:'Which verb form correctly completes the sentence?',stimulus:'The bell has ___, so it is time for lunch.',answer:'rung',wrong:['rang','ringed','ringing'],
 explanation:explain('After **has**, we need the past participle. Ring is irregular: ring, rang, (has) **rung**.',"- 'rang' is the simple past, which does not follow has.","- 'ringed' is not used for a bell ringing, and 'has ringing' is not correct.")},{kind:'participle',verb:'ring'});

w.add({prompt:'In which sentence are the tenses used **correctly**?',answer:'When I arrived, the others had already left.',wrong:['When I arrived, the others have already left.','When I arrive, the others had already left.','When I arrived, the others leave already.'],rewardGroup:'challenge',
 explanation:explain('The arrival is in the past (**arrived**) and the others left before that, so we use the past perfect: **had already left**.',"- 'have already left' is present perfect, which does not fit a past arrival.","- 'When I arrive' is present tense, which does not match 'had left'.","- 'leave already' is present tense in a sentence about the past.")});

w.add({prompt:'Which verb form completes the sentence in **standard English**?',stimulus:'We ___ the new film at the cinema last weekend.',answer:'saw',wrong:['have seen','has seen','had saw'],rewardGroup:'challenge',
 explanation:explain("'last weekend' is a finished time in the past, so we use the **simple past**: **saw**.","- In standard English, the present perfect ('have seen') is not used with a finished time such as last weekend.","- 'has seen' does not go with we, and 'had saw' mixes up saw and seen.")},
 options('simple past',same('saw','have seen','has seen','had saw')));

w.add({prompt:'Which sentence is written in the **simple past**?',answer:'The river flooded the fields.',wrong:['The river is flooding the fields.','The river has flooded the fields.','The river floods the fields every spring.'],rewardGroup:'quick',
 explanation:explain('**flooded** is a single past-tense verb, so the sentence is in the **simple past**.',"- 'is flooding' is present progressive, 'has flooded' is present perfect and 'floods' is simple present.")},
 options('simple past',{'The river flooded the fields.':'flooded','The river is flooding the fields.':'is flooding','The river has flooded the fields.':'has flooded','The river floods the fields every spring.':'floods'}));

w.add({prompt:'Which sentence is written in the **present perfect**?',answer:'I have lost my other glove.',wrong:['I lost my glove at the park.','I had lost my glove before lunch.','I am losing my gloves all the time.'],
 explanation:explain('**have lost** is have + a past participle: the **present perfect**. The glove is still lost now.',"- 'lost' on its own is simple past, 'had lost' is past perfect and 'am losing' is present progressive.")},
 options('present perfect',{'I have lost my other glove.':'have lost','I lost my glove at the park.':'lost','I had lost my glove before lunch.':'had lost','I am losing my gloves all the time.':'am losing'}));

w.add({prompt:'Which verb form completes the sentence in the **past perfect**?',stimulus:'Callum ___ the washing-up before his parents got home.',answer:'had done',wrong:['has done','did','was doing'],
 explanation:explain('The past perfect is **had** + a past participle: **had done**. It shows the washing-up was finished before another past event.',"- 'has done' is present perfect, 'did' is simple past and 'was doing' is past progressive.")},
 options('past perfect',same('had done','has done','did','was doing')));

export const tenses=w.done();
