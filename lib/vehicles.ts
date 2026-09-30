/**
 * Rides pupils can buy and show off with their hero: in the dressing room, on their picture and in the hero camp.
 * Purely for fun: rides never change battle stats. Stable ids: append only, never rename.
 */
/** How the hero rides: standing on a board, holding a scooter's handlebar, pedalling, or sitting behind a wheel. */
export type RidePose='board'|'scoot'|'pedal'|'seat';
export const VEHICLES=[
 {id:'skateboard',name:'Skateboard',price:150,pose:'board',paint:'blue',blurb:'Four wheels and a cool deck.'},
 {id:'scooter',name:'Kick scooter',price:200,pose:'scoot',paint:'red',blurb:'Push off and zoom along.'},
 {id:'tricycle',name:'Tricycle',price:260,pose:'pedal',paint:'yellow',blurb:'Three wheels, never wobbly.'},
 {id:'bicycle',name:'Bicycle',price:350,pose:'pedal',paint:'green',blurb:'A bell, a basket and pedals.'},
 {id:'hoverboard',name:'Hoverboard',price:450,pose:'board',paint:'purple',blurb:'Floats on a soft glow.'},
 {id:'go-kart',name:'Go-kart',price:550,pose:'seat',paint:'orange',blurb:'Low, fast and fun.'},
 {id:'moped',name:'Moped',price:650,pose:'seat',paint:'teal',blurb:'A shiny town scooter.'},
 {id:'tractor',name:'Tractor',price:800,pose:'seat',paint:'green',blurb:'Big back wheels for muddy fields.'},
 {id:'car',name:'Convertible car',price:950,pose:'seat',paint:'red',blurb:'Roof down, wind in your fur.'},
 {id:'ice-cream-van',name:'Ice cream van',price:1200,pose:'seat',paint:'pink',blurb:'Comes with a giant cone on top.'},
 {id:'fire-engine',name:'Fire engine',price:1500,pose:'seat',paint:'red',blurb:'Ladder, lights and a siren.'},
] as const satisfies readonly {id:string;name:string;price:number;pose:RidePose;paint:string;blurb:string}[];
export type VehicleId=typeof VEHICLES[number]['id'];
/** Free paint colours for any ride a pupil owns. */
export const PAINTS=[
 {id:'red',name:'Red',hex:0xe0453f},{id:'orange',name:'Orange',hex:0xf08a2c},{id:'yellow',name:'Yellow',hex:0xf2c53d},{id:'green',name:'Green',hex:0x45b562},
 {id:'teal',name:'Teal',hex:0x27aeb0},{id:'blue',name:'Blue',hex:0x3d7fd8},{id:'purple',name:'Purple',hex:0x9a62d9},{id:'pink',name:'Pink',hex:0xf07fb0},
] as const;
export type PaintId=typeof PAINTS[number]['id'];
export const vehicle=(id?:string|null)=>VEHICLES.find(v=>v.id===id);
export const paint=(id?:string|null)=>PAINTS.find(p=>p.id===id);
/** What a pupil is riding, with its paint, as sent to classmates' screens; nothing when they walk. */
export type Ride={id:VehicleId;paint:PaintId};
export function rideOf(p:{vehicle?:string;vehiclePaint?:Record<string,string>}):Ride|undefined{
 const v=vehicle(p.vehicle);if(!v)return undefined;
 return {id:v.id,paint:(paint(p.vehiclePaint?.[v.id])?.id??v.paint) as PaintId};
}
