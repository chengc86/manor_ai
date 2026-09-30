import {type Topic} from './bank-kit';
import {writer} from './bank-english-kit';
import {storiesA} from './bank-english-stories-a';
import {storiesB} from './bank-english-stories-b';
// Fiction comprehension: four original stories, eight questions each (retrieval, inference, vocabulary, feelings, character,
// language, structure and summary). The passages live in bank-english-stories-a.ts and -b.ts; append new stories at the end.

const topic:Topic={id:'en-fiction',subject:'English',strand:'Reading',title:'Fiction comprehension',helpsheet:{
 intro:'Reading questions check that you can find information, work out what the writer hints at and explain how language is used. The answer is always in the text, or can be worked out from it.',
 steps:[
  'Read the question first, then find the part of the text it is about: the right page opens for you.',
  '**Retrieval**: look for the exact words. **Inference**: find the clues and ask what they suggest.',
  'For a word or phrase, reread the sentence and try each option in its place. Idioms do not mean what their separate words say.',
  'For feelings and character, look at what a character says, does and thinks, and how others react to them.',
  'Check every option against the text before you choose.',
 ],
 example:{title:'Finding evidence',lines:['Text: Ravi slammed the door and stomped up the stairs.','Question: How does Ravi feel?',"Clues: 'slammed' and 'stomped' are loud, heavy actions.",'Answer: angry. (Not tired: tired people drag their feet.)']},
 tips:['If two options seem right, choose the one the text actually supports.','A simile compares using like or as; a metaphor says one thing is another; personification gives human actions to something that is not human.','For a number question, write down the numbers from the text and check exactly what the question asks for.'],
}};

const w=writer(topic);
storiesA(w);
storiesB(w);
export const fiction=w.done();
