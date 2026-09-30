import {type Topic} from './bank-kit';
import {writer} from './bank-english-kit';
import {nonFictionA} from './bank-english-nonfiction-a';
import {nonFictionB} from './bank-english-nonfiction-b';
// Non-fiction comprehension: an information text, a persuasive leaflet and a diary, eight questions each.
// The passages live in bank-english-nonfiction-a.ts and -b.ts; append new texts at the end.

const topic:Topic={id:'en-non-fiction',subject:'English',strand:'Reading',title:'Non-fiction comprehension',helpsheet:{
 intro:'Non-fiction texts inform, persuade, instruct or recount real events. Working out the purpose helps you understand the choices the writer makes.',
 steps:[
  'Look at the title, headings and layout to work out what kind of text it is.',
  'Information texts use facts, headings and technical words. Persuasive texts use rhetorical questions, emotive words, facts and figures, and commands. Recounts and diaries use the first person and time order.',
  'A **fact** can be checked; an **opinion** is what someone thinks or feels.',
  'Find the sentence that answers the question, then read the sentences around it.',
 ],
 example:{title:'Fact or opinion?',lines:["'Swifts can stay in the air for months without landing.' This is a fact: it can be checked.","'Swifts are the most beautiful birds in the sky.' This is an opinion: it is a view that not everyone shares."]},
 tips:['Words that judge, such as best, lovely or wonderful, often signal an opinion.','Rhetorical questions do not expect an answer; they make the reader think.','Headings and bullet points help readers find information quickly.'],
}};

const w=writer(topic);
nonFictionA(w);
nonFictionB(w);
export const nonFiction=w.done();
