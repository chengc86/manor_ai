import type {Wardrobe} from './clothing';
export type RigOutfit={top:'shirt'|'jumper'|'none';bottom:'trousers'|'dress'|'none';hat:boolean;scarf:boolean};
export function outfitForWardrobe(w:Wardrobe):RigOutfit{return {top:w.outer?'jumper':w.top?'shirt':'none',bottom:w.top==='dress'||['skirt','skort'].includes(w.bottom??'')?'dress':w.bottom==='trousers'?'trousers':'none',hat:!!w.head,scarf:!!w.neck};}
