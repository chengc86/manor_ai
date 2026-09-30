import {fixed,type Topic,type Draft,type BuiltTopic} from './bank-kit';
import type {Visual} from './visual';
import type {Question} from './questions';
// Helpers shared by the English bank files (lib/bank-english-*.ts). Questions are written out by hand; alongside each one
// we keep an audit note (word classes, the fully corrected sentence, the evidence quoted from a passage …) that
// tests/bank-english.cjs re-checks with its own code, so a slip in either the question or the note is caught.

/** An audit note: kind says how tests/bank-english.cjs re-checks the question with this id. */
export type Note={kind:string;[key:string]:unknown};
export type Audit=Note&{id:string};
export type EnglishPart={built:BuiltTopic;audit:Audit[]};

/** Collects a topic's drafts in order with their audit notes; ids follow the order (v2-<topic>-01 …). */
export function writer(topic:Topic){
 const drafts:Draft[]=[],audit:Audit[]=[];
 return {
  add(d:Draft,...notes:Note[]){
   // Numbers as choices (counts, ages, distances) are shown in number order, as in print.
   const all=[...(Array.isArray(d.answer)?d.answer:[d.answer]),...(d.wrong??[])];if(!d.order&&!d.options&&all.every(o=>/^\d/.test(o)))d={...d,order:'sorted'};
   drafts.push(d);const id=`v2-${topic.id}-${String(drafts.length).padStart(2,'0')}`;for(const n of notes)audit.push({...n,id});return id;},
  done():EnglishPart{return {built:fixed(topic,drafts),audit};},
 };
}

// Tagged sentences: 'The/det fox/noun ran/verb ./' — every word carries its word class; punctuation tokens are bare.
// Classes: noun (noun.ab abstract, noun.pr proper, noun.col collective, noun.cmp compound), verb (verb.aux, verb.mod),
// adj (adj.cmp comparative, adj.sup superlative), adv, pron (pron.rel relative, pron.pos possessive), prep,
// conj.co (co-ordinating), conj.sub (subordinating), det, other (e.g. the 'to' before a verb, an interjection).
const PUNCT=/^[,.!?;:]$/;
export type Token={w:string;tag:string};
export function tokens(tagged:string):Token[]{return tagged.split(' ').filter(Boolean).map(t=>{const i=t.lastIndexOf('/');return i<0?{w:t,tag:''}:{w:t.slice(0,i),tag:t.slice(i+1)};});}
/** The sentence as pupils see it. */
export function untag(tagged:string){let out='';for(const {w} of tokens(tagged))out+=!out||PUNCT.test(w)?w:' '+w;return out;}

/** Sentences on cards captioned A, B, C …; the options are the letters in order. Used when versions differ only in
 * capital letters or the final mark, which typed options cannot tell apart. */
export function lettered(sentences:string[],answer:number,alt:string):Pick<Draft,'visual'|'answer'|'options'>{
 const letters=sentences.map((_,i)=>String.fromCharCode(65+i));
 const visual:Visual={kind:'cards',cards:sentences.map((s,i)=>({text:s,caption:letters[i]})),alt};
 return {visual,answer:letters[answer],options:letters};
}

export type Writer=ReturnType<typeof writer>;
export type Reading=NonNullable<Question['reading']>;
/** A comprehension question shown beside the passage, opened at page (0-based). quotes are the words the explanation
 * quotes as evidence: the test checks that each one is on that page and in the explanation. */
export function ask(w:Writer,reading:Reading,page:number,d:Draft,...quotes:string[]){return w.add({...d,reading,page},{kind:'evidence',page,quotes});}
