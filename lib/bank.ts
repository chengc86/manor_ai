import {mathsBank} from './bank-maths';
import {englishBank} from './bank-english';
import {vrBank} from './bank-vr';
import {nvrBank} from './bank-nvr';
import {scienceBank} from './bank-science';
import type {Topic} from './bank-kit';
// The Atom-style Year 6 bank that replaced the original Year 6 questions (docs/design/question-bank-v2.md).
const parts=[mathsBank,englishBank,vrBank,nvrBank,scienceBank];
export const bankTopics:Topic[]=parts.flatMap(p=>p.topics);
export const bankQuestions=parts.flatMap(p=>p.questions);
/** Template problems found while building. Tests require none; broken questions are left out rather than asked. */
export const bankProblems=parts.flatMap(p=>p.problems);
export const topicById=new Map(bankTopics.map(t=>[t.id,t]));
