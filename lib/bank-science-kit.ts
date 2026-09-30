import {fixed,bullets,type Topic,type Draft,type BuiltTopic} from './bank-kit';
// Helpers shared by the Science bank (bank-science-*.ts). Every Science question is written out in full with fixed(),
// together with an optional audit: the facts tests/bank-science.cjs needs to re-check the answer independently
// (the features to walk a branching key with, a circuit to simulate, which table column to recompute, and so on).

/** Facts for the independent Science test. type says how to re-check the question; the other fields depend on the type. */
export type Audit={id?:string;type:string}&Record<string,unknown>;
export type Item={draft:Draft;audit?:Audit};
export type ScienceTopic={built:BuiltTopic;audits:Audit[]};

/** A multiple-choice draft: why holds one to three bullet steps for the explanation. */
export function mc(prompt:string,answer:string|string[],wrong:string[],why:string[],o:Partial<Draft>={}):Draft{
 return {prompt,answer,wrong,explanation:bullets(...why),...o};
}
/** Wraps a draft with its audit (plain multiple choice when none is given). */
export const item=(draft:Draft,audit?:Audit):Item=>({draft,audit});
/** Options that must stay in label order, such as A, B, C, D. */
export const sorted:Partial<Draft>={order:'sorted'};
export const quick:Partial<Draft>={rewardGroup:'quick'};
export const challenge:Partial<Draft>={rewardGroup:'challenge'};

/** Builds a topic from written items and pairs each question ID with its audit. */
export function science(topic:Topic,items:Item[]):ScienceTopic{
 const built=fixed(topic,items.map(i=>i.draft)),audits:Audit[]=[];
 if(built.questions.length===items.length)items.forEach((it,i)=>audits.push({...(it.audit??{type:'mc'}),id:built.questions[i].id}));
 else built.problems.push(`${topic.id}: ${built.questions.length} of ${items.length} questions were built, so audits could not be paired`);
 return {built,audits};
}
