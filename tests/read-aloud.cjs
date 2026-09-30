// "Read to me": question text becomes words a speech voice says properly (maths signs, fractions, units, blanks,
// arrows and shapes), in short sentences, for every question in the bank. The voice itself is the browser's.
const fs=require('fs'),assert=require('node:assert/strict'),buildLib=require('./build-lib.cjs');
const dir=buildLib('read-aloud'),lib=name=>require(`${dir}/${name}.cjs`);
const {speakable,spokenFraction,sentences,questionSpeech,explanationSpeech}=lib('speech-text'),{questions,publicQuestion}=lib('questions');
const says={
 'Find the missing number: 7 × ___ − 9 = 54.':'Find the missing number: 7 times blank minus 9 equals 54.',
 'Calculate 3/4 + 5/8. Give your answer as a fraction.':'Calculate three quarters plus five eighths. Give your answer as a fraction.',
 'Simplify 18/24 to its lowest terms.':'Simplify 18 over 24 to its lowest terms.',
 '2 3/4 + 1/2':'2 and three quarters plus one half',
 'A rectangle has an area of 18 cm² and a width of 2 cm.':'A rectangle has an area of 18 square centimetres and a width of 2 centimetres.',
 '1 litre = 1000 cm³':'1 litre equals 1000 cubic centimetres',
 '6³ and 2³ + 5²':'6 cubed and 2 cubed plus 5 squared',
 'The temperature rises from −7°C to 6°C.':'The temperature rises from minus 7 degrees Celsius to 6 degrees Celsius.',
 'A triangle has angles of 47° and 68°.':'A triangle has angles of 47 degrees and 68 degrees.',
 'The ratio of red beads to blue beads is 3:5.':'The ratio of red beads to blue beads is 3 to 5.',
 'A train leaves at 14:12.':'A train leaves at 14:12.',
 'Mix sand, cement and gravel in the ratio 1:2:3.':'Mix sand, cement and gravel in the ratio 1 to 2 to 3.',
 'What comes next? ↑ → ↓ ___':'What comes next? up arrow, right arrow, down arrow, blank',
 'What comes next? ● ■ ★ ___':'What comes next? black circle, black square, star, blank',
 '8,652,416 < ☐ < 8,743,000':'8,652,416 is less than blank is less than 8,743,000',
 'Calculate 3^4. The ^ symbol means “to the power of”.':'Calculate 3 to the power of 4. The power symbol means “to the power of”.',
 'vanish, varnish, vivid | appear, remain, disappear':'vanish, varnish, vivid. appear, remain, disappear',
 '___behave · ___spell · ___lead':'blank behave, blank spell, blank lead',
 'Type 1–9.':'Type 1 to 9.',
 '14, 16, 18, 20, …':'14, 16, 18, 20, and so on',
 'Part **P** is made from base-10 blocks.':'Part P is made from base-10 blocks.',
 'He/she travels at 30 km/h.':'He or she travels at 30 kilometres per hour.',
 'If 5m + 3 = 18, what is m?':'If 5m plus 3 equals 18, what is m?',
 'The bag weighs 3 kg and the box 250 g.':'The bag weighs 3 kilograms and the box 250 grams.',
};
for(const [text,spoken] of Object.entries(says))assert.equal(speakable(text),spoken,text);
assert.equal(spokenFraction(1,2),'one half');assert.equal(spokenFraction(2,3),'two thirds');assert.equal(spokenFraction(7,100),'seven hundredths');assert.equal(spokenFraction(13,4),'13 quarters');assert.equal(spokenFraction(5,24),'5 over 24');
assert.deepEqual(sentences('Calculate 2.45 − 1.9. Give your answer as a decimal. Well done!'),['Calculate 2.45 − 1.9.','Give your answer as a decimal.','Well done!']);
assert.deepEqual(questionSpeech({prompt:'What is 35% of 40?',options:['12','14','16','18']}),['What is 35% of 40?','Choose one answer.','A: 12.','B: 14.','C: 16.','D: 18.']);
assert.deepEqual(questionSpeech({prompt:'Which shape comes next?',options:['A','B','C'],optionVisuals:[{},{},{}]}),['Which shape comes next?','Choose one of the pictures, A, B or C.']);
assert.deepEqual(questionSpeech({prompt:'Pick the two opposites.',options:['vast','tiny','slow'],select:2}),['Pick the two opposites.','Choose 2 answers.','A: vast.','B: tiny.','C: slow.']);
assert.deepEqual(questionSpeech({prompt:'Type the answer: 6 × 7'}),['Type the answer: 6 times 7.']);
assert.deepEqual(explanationSpeech('Step 1:\n- Find 10% first: 40 ÷ 10 = 4.'),['Step 1:','Find 10% first: 40 divided by 10 equals 4.']);
console.log(`PASS: ${Object.keys(says).length} tricky pieces of question text are read as children would say them.`);

// Every question and explanation in the bank: something to say, short sentences, nothing a voice would misread.
const leftovers=/[×÷−²³°☐↑↓←→↔●○■★▲◆·…^|]|_{2,}|\*\*|undefined|NaN/;
let count=0,said=0,longest=0;
for(const q of questions){
 const shown=publicQuestion(q),speech=[...questionSpeech(shown),...explanationSpeech(q.explanation)];
 assert(questionSpeech(shown).length>0,q.id);
 for(const s of speech){assert(!leftovers.test(s),`${q.id}: ${s}`);assert(s.trim()===s&&s.length>0,q.id);longest=Math.max(longest,s.length);}
 count++;said+=speech.length;
}
assert(longest<=181,`longest sentence ${longest} characters`);
console.log(`PASS: all ${count} questions and explanations turn into ${said} short spoken sentences (longest ${longest} characters) with no symbols left for the voice to stumble on.`);

// Older iPads cannot even load a script that uses regex lookbehind, so the read-aloud code must not.
for(const file of ['lib/speech-text.ts','app/read-aloud.tsx'])assert(!/\(\?<[=!]/.test(fs.readFileSync(file,'utf8')),file);
console.log('PASS: the read-aloud code avoids regex lookbehind, so it loads on older iPads.');
