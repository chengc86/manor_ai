import type {ItemLoadout} from './builds';
// Monday 12 October 2026, 18:00–20:00 Europe/London (BST, UTC+1).
export const ADMIN_EVENT={id:'admin-abuse-2026-10-12',name:'Admin Abuse',start:Date.parse('2026-10-12T18:00:00+01:00'),end:Date.parse('2026-10-12T20:00:00+01:00'),item:'golden-medal',bonus:5} as const;
export const adminEventActive=(now=Date.now())=>now>=ADMIN_EVENT.start&&now<ADMIN_EVENT.end;
export const eventQuestionReward=(base:number,now=Date.now())=>base+(adminEventActive(now)?ADMIN_EVENT.bonus:0);
export type EventAttendee=ItemLoadout&{eventGifts?:Record<string,{at:number;extraSlot:boolean;heroIds?:string[]}>};
/** Called inside an optimistic world mutation: retries and repeated visits cannot award twice. */
export type EventHero={id:string;adminAbuseTrophy?:boolean};
export function grantEventGift(p:EventAttendee,now=Date.now(),heroes:EventHero[]=[]){
 if(!adminEventActive(now)||p.eventGifts?.[ADMIN_EVENT.id])return false;
 p.itemInventory??={};p.equippedItems??=[];p.itemSlots??=2;
 const extraSlot=p.equippedItems.length>=p.itemSlots;
 if(extraSlot)p.itemSlots=p.equippedItems.length+1;
 p.itemInventory[ADMIN_EVENT.item]=Math.max(1,p.itemInventory[ADMIN_EVENT.item]??0);
 // Leave the current equipment alone, especially during a live battle. The medal can be equipped between waves.
 // Snapshot the owned defender IDs once. Later purchases never inherit the trophy.
 const heroIds=heroes.map(hero=>hero.id);for(const hero of heroes)hero.adminAbuseTrophy=true;
 p.eventGifts={...p.eventGifts,[ADMIN_EVENT.id]:{at:now,extraSlot,heroIds}};
 return true;
}
