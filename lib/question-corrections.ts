import type {Question} from './questions';
// September 2026 audit fixes for the generated banks (quest-expansion.ts and more-questions.ts).
// Applied by stable ID when the bank loads, so re-running their generators cannot bring the old text back.
const orla='Every day at noon, Orla heard the station clock strike thirteen. Most passengers hurried past it. She began counting its chimes in a notebook, then took the notes to the caretaker. He smiled at the neat columns. A week later, the clock struck twelve at noon. Orla closed her notebook, pleased that noticing a small mistake had made a difference.';
const code=(places:number,word:string,answer:string)=>({prompt:`A code moves each letter ${places} places forwards in the alphabet, wrapping after Z to A. How is ${word} written?`,answers:[answer],explanation:`Move each letter ${places} places: ${[...word].map((c,i)=>`${c}→${answer[i]}`).join(' ')}.`});
export const questionCorrections:Record<string,Partial<Question>>={
 'quest-400-113':{prompt:'Complete with the past participle of “take”: Cora had ___ her seat before the bell rang.'},
 'quest-400-114':{prompt:'Complete with the past participle of “break”: Dylan had ___ his pencil before the bell rang.'},
 'quest-400-118':{prompt:'Complete with the past participle of “see”: Hugo had ___ the notice before the bell rang.'},
 'quest-400-151':{passage:orla},'quest-400-152':{passage:orla},'quest-400-153':{passage:orla},'quest-400-154':{passage:orla},'quest-400-155':{passage:orla},
 'more-240-015':{prompt:'Calculate 8 × 3/4.',explanation:'8 × 3 = 24; 24 ÷ 4 = 6.'},
 'more-240-061':{answers:['west','west entrance','the west entrance','the west','west gate','the west gate']},
 'more-240-148':{answers:['Dad','his dad','Eli’s dad']},
 'more-240-150':{answers:['Friday','on Friday']},
 'more-240-157':{prompt:'Which word is missing a capital letter: “We visited london.”?',explanation:'London is the name of a place, so it needs a capital letter. “We” already has one because it starts the sentence.'},
 'more-240-215':{explanation:'Turning the grid 90° clockwise moves the two shaded squares from the middle row into the middle column, at the top and bottom. Reflecting in a vertical mirror line swaps the left and right columns but leaves the middle column alone, so only the top-middle and bottom-middle squares are shaded.'},
 // These five duplicated progression code questions word for word; new words keep every code answer unique.
 'more-240-113':code(4,'CHALK','GLEPO'),'more-240-114':code(5,'TIGER','YNLJW'),'more-240-115':code(2,'MAPLE','OCRNG'),'more-240-116':code(3,'OCEAN','RFHDQ'),'more-240-119':code(2,'SHELF','UJGNH'),
};
