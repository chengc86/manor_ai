// Mock test sizes and timing. No imports: the browser uses this to describe the tests, the server to run them.
export const MOCK_GRACE=15000,MOCK_COOLDOWN=20*3600000;
export const MOCK_SIZES:Record<string,{questions:number;minutes:number}>={Maths:{questions:20,minutes:20},English:{questions:20,minutes:20},'Verbal reasoning':{questions:15,minutes:10},'Non-verbal reasoning':{questions:15,minutes:10},Science:{questions:15,minutes:15}};
export const YEAR2_MOCK={questions:10,minutes:10};
/** The mock for a subject and year group, or null (Year 2 has no Science). */
export const mockSize=(year:number,subject:string)=>year===2?(subject==='Science'?null:YEAR2_MOCK):MOCK_SIZES[subject]??null;
