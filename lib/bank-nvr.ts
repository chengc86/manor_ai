import {combine} from './bank-kit';
import {oddOneOut,matchGroup,matchPair} from './bank-nvr-similar';
import {hiddenShapes} from './bank-nvr-hidden';
import {analogies,rotation,reflection,transformOrder} from './bank-nvr-change';
import {sequences,matrices,codes} from './bank-nvr-pattern';
import {cubeNets} from './bank-nvr-cube';
// Atom-style original questions for this subject: see docs/design/question-bank-v2.md.
// Every puzzle is drawn from a feature model (lib/bank-nvr-kit.ts); nvrAudit keeps each question's model and rule
// so tests/bank-nvr.cjs can re-check that exactly one option fits.
export {nvrAudit} from './bank-nvr-kit';
export const nvrBank=combine(oddOneOut,matchGroup,matchPair,hiddenShapes,analogies,rotation,reflection,transformOrder,sequences,matrices,codes,cubeNets);
