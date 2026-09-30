import {combine} from './bank-kit';
import {livingParts} from './bank-science-living';
import {physicsParts} from './bank-science-physics';
import {electricityParts} from './bank-science-electricity';
import {matterParts} from './bank-science-matter';
import {enquiryParts} from './bank-science-enquiry';
// Atom-style original questions for this subject: see docs/design/question-bank-v2.md.
// Science is written out question by question (bank-science-*.ts); pictures come from bank-science-draw.ts.
// Topic order: living things, physics (light, forces, sound, Earth and space, electricity), chemistry, working scientifically.
const parts=[...livingParts,...physicsParts,...electricityParts,...matterParts,...enquiryParts];
export const scienceBank=combine(...parts.map(p=>p.built));
/** What tests/bank-science.cjs needs to re-check each answer independently (keys, circuits, tables …), keyed by question ID. */
export const scienceAudit=parts.flatMap(p=>p.audits);
