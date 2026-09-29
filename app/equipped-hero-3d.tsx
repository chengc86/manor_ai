'use client';
import Hero3D from './hero-3d';
import {hero3D} from '@/lib/hero-3d-catalogue';
import {outfitForWardrobe} from '@/lib/hero-model';
import {uniformPieces,wear,type Wardrobe} from '@/lib/clothing';
export default function EquippedHero3D({type,clothing,uniform='none',gender='boy'}:{type:number;clothing?:Wardrobe;uniform?:string;gender?:string}){
 const model=hero3D(type),wardrobe=clothing??uniformPieces(uniform,gender).reduce((w,id)=>wear(w,id),{} as Wardrobe);
 return model?<Hero3D skin={model.skin} outfit={outfitForWardrobe(wardrobe)} wardrobe={wardrobe} motion="idle"/>:null;
}
