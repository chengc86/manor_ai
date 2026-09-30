import {combine} from './bank-kit';
import {vrVocabTopics} from './bank-vr-vocab';
import {vrWordTopics} from './bank-vr-words';
import {vrCodeTopics} from './bank-vr-codes';
import {vrLogicTopics} from './bank-vr-logic';
// Atom-style original questions for Verbal reasoning: see docs/design/question-bank-v2.md.
// The topics live in bank-vr-<part>.ts files; this file only puts them in their fixed order.
export const vrBank=combine(...vrVocabTopics,...vrWordTopics,...vrCodeTopics,...vrLogicTopics);
