import {combine} from './bank-kit';
import {numberTopics} from './bank-maths-number';
import {calcTopics} from './bank-maths-calc';
import {fdpTopics} from './bank-maths-fdp';
import {algebraTopics} from './bank-maths-algebra';
import {measureTopics} from './bank-maths-measure';
import {geometryTopics} from './bank-maths-geometry';
import {statsTopics} from './bank-maths-stats';
import {satsTopics} from './bank-maths-sats';
// Atom-style original questions for this subject: see docs/design/question-bank-v2.md.
// Topics live in lib/bank-maths-<strand>.ts; lib/bank-maths-util.ts holds shared helpers and the audit records that
// tests/bank-maths.cjs uses to re-check every answer independently.
export const mathsBank=combine(...numberTopics,...calcTopics,...fdpTopics,...algebraTopics,...measureTopics,...geometryTopics,...statsTopics,...satsTopics);
