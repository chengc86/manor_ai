/**
 * Question text as it should be spoken aloud: maths signs, fractions, units, blanks, arrows and shapes become words,
 * formatting marks disappear, and everything is cut into short sentences (some browsers stop reading long speech).
 * Pure functions, shared by the read-aloud button and its tests.
 */
const UNIT:Record<string,string>={mm:'millimetres',cm:'centimetres',m:'metres',km:'kilometres',kg:'kilograms',g:'grams',ml:'millilitres'};
const NUMBER_WORDS=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve'];
const PARTS:Record<number,[string,string]>={2:['half','halves'],3:['third','thirds'],4:['quarter','quarters'],5:['fifth','fifths'],6:['sixth','sixths'],7:['seventh','sevenths'],8:['eighth','eighths'],9:['ninth','ninths'],10:['tenth','tenths'],11:['eleventh','elevenths'],12:['twelfth','twelfths'],20:['twentieth','twentieths'],100:['hundredth','hundredths'],1000:['thousandth','thousandths']};
/** "3/4" as British children say it: three quarters. Uncommon denominators are read as "5 over 24". */
export function spokenFraction(n:number,d:number){
 const name=PARTS[d];if(!name)return `${n} over ${d}`;
 return `${n<=12?NUMBER_WORDS[n]:n} ${n===1?name[0]:name[1]}`;
}
const SYMBOLS:[RegExp,string][]=[
 [/↑/g,' up arrow, '],[/↓/g,' down arrow, '],[/←/g,' left arrow, '],[/→/g,' right arrow, '],[/↔/g,' left and right arrow, '],
 [/●/g,' black circle, '],[/○/g,' white circle, '],[/■/g,' black square, '],[/□/g,' white square, '],[/★/g,' star, '],[/▲/g,' triangle, '],[/◆/g,' diamond, '],
 [/_{2,}|☐/g,' blank '],[/…/g,' and so on '],
];
/** One piece of question text, made ready for a speech engine. */
export function speakable(raw:string){
 let t=raw.replace(/\*\*/g,'').replace(/\r?\n+/g,'. ');
 for(const [pattern,word] of SYMBOLS)t=t.replace(pattern,word);
 // Units first, so "cm²" is not read as "cm squared" and "km/h" not as a fraction.
 t=t.replace(/\b(mm|cm|m|km)²/g,(_,u)=>`square ${UNIT[u]}`).replace(/\b(mm|cm|m)³/g,(_,u)=>`cubic ${UNIT[u]}`)
  .replace(/\b(km|m|cm)\/(h|s)\b/g,(_,u,per)=>`${UNIT[u]} per ${per==='h'?'hour':'second'}`)
  .replace(/°C\b/g,' degrees Celsius').replace(/°F\b/g,' degrees Fahrenheit').replace(/°/g,' degrees')
  .replace(/(\d) (mm|cm|km|kg|ml|m|g)\b/g,(_,n,u)=>`${n} ${UNIT[u]}`)
  .replace(/²/g,' squared').replace(/³/g,' cubed').replace(/¼/g,' one quarter').replace(/½/g,' one half').replace(/¾/g,' three quarters');
 // Fractions and mixed numbers: 2 3/4 is "2 and three quarters".
 t=t.replace(/\b(\d+) (\d+)\/(\d+)\b/g,(_,w,n,d)=>`${w} and ${spokenFraction(+n,+d)}`).replace(/\b(\d+)\/(\d+)\b/g,(_,n,d)=>spokenFraction(+n,+d));
 // Ratios say "to"; clock times (two-digit minutes) are left for the voice to read as times.
 const ratio=/ratio/i.test(t);t=t.replace(/\b(\d+)((?::\d+)+)\b/g,(all,a,rest:string)=>ratio||!/^:\d\d$/.test(rest)?[a,...rest.slice(1).split(':')].join(' to '):all);
 t=t.replace(/(\d)\s*–\s*(\d)/g,'$1 to $2').replace(/\s*[–—]\s*/g,', ')
  .replace(/(\w)\^(\w)/g,'$1 to the power of $2').replace(/\^/g,' power ')
  .replace(/×/g,' times ').replace(/÷/g,' divided by ').replace(/−/g,' minus ').replace(/\+/g,' plus ').replace(/=/g,' equals ')
  .replace(/</g,' is less than ').replace(/>/g,' is greater than ').replace(/&/g,' and ')
  .replace(/\s*\|\s*/g,'. ').replace(/\s*·\s*/g,', ').replace(/(\w)\/(\w)/g,'$1 or $2');
 // Tidy the pauses the replacements left behind.
 return t.replace(/\s+/g,' ').replace(/\s*,(\s*,)+/g,',').replace(/,\s*([.?!:;])/g,'$1').replace(/\s+([.,?!:;])/g,'$1').replace(/^[\s,.]+/,'').replace(/[\s,]+$/,'').trim();
}
/**
 * Speech in short sentences: split after full stops (not decimal points), and at commas when a sentence is still long.
 * No regex lookbehind, which older iPads cannot parse.
 */
export function sentences(text:string,max=180){
 const out:string[]=[],parts=text.split(/([.?!])\s+/),whole:string[]=[];
 for(let i=0;i<parts.length;i+=2)whole.push(parts[i]+(parts[i+1]??''));
 for(const s of whole.map(w=>w.trim()).filter(Boolean)){
  if(s.length<=max){out.push(s);continue;}
  let line='';
  for(const piece of s.split(/,\s+/)){const joined=line?`${line}, ${piece}`:piece;if(line&&joined.length>max){out.push(line+',');line=piece;}else line=joined;}
  if(line)out.push(line);
 }
 return out;
}
const end=(s:string)=>/[.?!:]$/.test(s)?s:s+'.';
type Spoken={prompt:string;passage?:string;stimulus?:string;options?:string[];optionVisuals?:unknown[];select?:number};
/** What the read-aloud button says for a question: its text in screen order, then the choices with their letters. */
export function questionSpeech(q:Spoken,{choices=true}:{choices?:boolean}={}){
 const lines=[q.passage,q.prompt,q.stimulus].filter((t):t is string=>!!t?.trim()).map(t=>end(speakable(t)));
 const options=choices?q.options??[]:[],need=q.select??1;
 if(options.length){
  const letters=(list:string[])=>list.length>1?`${list.slice(0,-1).join(', ')} or ${list[list.length-1]}`:list[0];
  if(q.optionVisuals)lines.push(need>1?`Choose ${need} of the pictures, ${letters(options)}.`:`Choose one of the pictures, ${letters(options)}.`);
  else if(options.every(o=>/^[A-Z]$/.test(o)))lines.push(need>1?`Choose ${need} letters: ${letters(options)}.`:`Choose ${letters(options)}.`);
  else{lines.push(need>1?`Choose ${need} answers.`:'Choose one answer.');options.forEach((o,i)=>lines.push(`${String.fromCharCode(65+i)}: ${end(speakable(o))}`));}
 }
 return lines.flatMap(l=>sentences(l));
}
/** A worked explanation read aloud: bullets and headings become plain sentences. */
export function explanationSpeech(text:string){
 return text.split('\n').map(l=>l.trim().replace(/^- /,'')).filter(Boolean).flatMap(l=>sentences(end(speakable(l))));
}
