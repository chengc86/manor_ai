import * as THREE from 'three';
/**
 * School-supply weapons from lib/equipment.ts as small 3D props: one held in the hero's hand (grip at the origin,
 * pointing along +z) and one thrown at monsters (travelling along +z). Built from plain meshes so they can be baked.
 */
type V3=[number,number,number];
function add(parent:THREE.Object3D,geometry:THREE.BufferGeometry,colour:number,pos:V3,rot:V3=[0,0,0],scale:V3=[1,1,1],metal=false){
 const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:colour,roughness:metal?.32:.55}));
 mesh.position.set(...pos);mesh.rotation.set(...rot);mesh.scale.set(...scale);if(metal)mesh.userData.metal=true;parent.add(mesh);return mesh;
}
const X=Math.PI/2;
const sphere=(r:number)=>new THREE.SphereGeometry(r,14,10),rod=(r:number,l:number,s=8)=>new THREE.CylinderGeometry(r,r,l,s),box=(w:number,h:number,d:number)=>new THREE.BoxGeometry(w,h,d);
function heart(size:number){
 const s=new THREE.Shape();s.moveTo(0,-size);s.bezierCurveTo(size*1.2,-size*.2,size*.9,size*.9,0,size*.35);s.bezierCurveTo(-size*.9,size*.9,-size*1.2,-size*.2,0,-size);
 return new THREE.ExtrudeGeometry(s,{depth:size*.45,bevelEnabled:true,bevelSize:size*.12,bevelThickness:size*.12,bevelSegments:2,curveSegments:8}).translate(0,0,-size*.22);
}
function ball(g:THREE.Group,r:number,colour:number,seam:number|null,pos:V3=[0,0,0]){add(g,sphere(r),colour,pos);if(seam!==null){add(g,new THREE.TorusGeometry(r*1.01,r*.07,4,20),seam,pos,[X,0,0]);add(g,new THREE.TorusGeometry(r*1.01,r*.07,4,20),seam,pos,[0,X,0]);}}
function football(g:THREE.Group,r:number,pos:V3=[0,0,0]){add(g,sphere(r),0xf7f7f2,pos);for(const [x,y,z] of [[0,1,0],[0,-1,0],[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]])add(g,sphere(r*.36),0x26282b,[pos[0]+x*r*.86,pos[1]+y*r*.86,pos[2]+z*r*.86],[0,0,0],[1-Math.abs(x)*.6,1-Math.abs(y)*.6,1-Math.abs(z)*.6]);}
function pencil(g:THREE.Group,length:number){
 add(g,rod(.06,length,6),0xf4c430,[0,0,length/2],[X,0,0]);
 add(g,new THREE.ConeGeometry(.06,.15,6),0xe9c893,[0,0,length+.075],[X,0,0]);add(g,new THREE.ConeGeometry(.022,.055,6),0x34373a,[0,0,length+.13],[X,0,0]);
 add(g,rod(.063,.06,8),0xc9ced3,[0,0,-.02],[X,0,0],[1,1,1],true);add(g,rod(.06,.08,8),0xef8a9a,[0,0,-.09],[X,0,0]);
}
function racket(g:THREE.Group,head:number,colour:number,oval=1){
 add(g,rod(.025,.3,6),0x3d3f44,[0,0,.12],[X,0,0]);add(g,rod(.012,.22,5),0xc9ced3,[0,0,.36],[X,0,0],[1,1,1],true);
 add(g,new THREE.TorusGeometry(head,.022,5,20),colour,[0,0,.47+head*oval],[0,X,0],[1,oval,1]);
 add(g,box(.006,head*1.8*oval,head*1.8),0xf2f2f2,[0,0,.47+head*oval]);
}
const HELD:Record<string,(g:THREE.Group)=>void>={
 standard:g=>pencil(g,.62),
 swift:g=>{add(g,rod(.075,.22,10),0x3f7fc4,[0,0,.05],[X,0,0]);add(g,rod(.05,.3,10),0xfdfaf2,[0,0,.28],[X,0,0]);add(g,rod(.052,.05,10),0xf29ac2,[0,0,.4],[X,0,0]);},
 frost:g=>{add(g,rod(.09,.26,12),0xdff4ff,[0,.08,.08]);add(g,rod(.094,.05,12),0x5aa9e6,[0,.2,.08]);add(g,new THREE.ConeGeometry(.07,.14,12),0x5aa9e6,[0,.29,.08]);add(g,sphere(.05),0x9eeeff,[0,.02,.18]);},
 blast:g=>{add(g,rod(.1,.46,12),0x2f6b4f,[0,.02,.2],[X,0,0]);add(g,rod(.115,.06,12),0xd0a300,[0,.02,.43],[X,0,0],[1,1,1],true);football(g,.1,[0,.02,.52]);},
 ruler:g=>{add(g,box(.14,.028,.95),0xf2cf4a,[0,0,.42]);for(let i=0;i<9;i++)add(g,box(.05,.032,.012),0x5b4a1c,[.045,0,.02+i*.1]);},
 glue:g=>{add(g,rod(.075,.36,12),0x8f5bd6,[0,0,.16],[X,0,0]);add(g,rod(.07,.08,12),0xfdfaf2,[0,0,.38],[X,0,0]);add(g,rod(.08,.07,12),0xf28c38,[0,0,-.04],[X,0,0]);},
 tennis:g=>{racket(g,.17,0x4aa3d8);ball(g,.07,0xd7ee3c,0xffffff,[.12,-.06,.1]);},
 basketball:g=>ball(g,.17,0xe8782c,0x3a2416,[0,.02,.14]),
 cricket:g=>{add(g,rod(.03,.26,6),0x3d3f44,[0,0,.1],[X,0,0]);add(g,box(.16,.05,.56),0xe6c68e,[0,0,.5]);add(g,box(.12,.052,.08),0xd6b074,[0,0,.26]);},
 pingpong:g=>{add(g,rod(.028,.2,6),0xb8864d,[0,0,.08],[X,0,0]);add(g,rod(.16,.03,20),0xd8413f,[0,0,.33],[0,0,X]);},
 rugby:g=>{add(g,sphere(1),0x9a5b30,[0,.02,.16],[0,0,0],[.11,.11,.19]);add(g,new THREE.TorusGeometry(.105,.012,4,18),0xfdfaf2,[0,.02,.16],[0,0,0],[1,1,1]);},
 badminton:g=>racket(g,.12,0xe24a8b,1.35),
 fork:g=>{add(g,box(.06,.02,.4),0xc9ced3,[0,0,.18],[0,0,0],[1,1,1],true);add(g,box(.14,.02,.06),0xc9ced3,[0,0,.4],[0,0,0],[1,1,1],true);for(const x of [-.055,0,.055])add(g,box(.02,.02,.2),0xdfe3e7,[x,0,.52],[0,0,0],[1,1,1],true);},
 teddy:g=>{const b=0xb07846;add(g,sphere(.11),b,[0,.02,.12]);add(g,sphere(.085),b,[0,.16,.14]);for(const x of [-.06,.06])add(g,sphere(.035),b,[x,.24,.14]);add(g,sphere(.035),0xe7c7a0,[0,.14,.21]);add(g,heart(.035),0xe2527c,[0,.03,.23]);},
 paint:g=>{add(g,rod(.03,.46,8),0xd8413f,[0,0,.17],[X,0,0]);add(g,rod(.038,.08,8),0xc9ced3,[0,0,.43],[X,0,0],[1,1,1],true);add(g,new THREE.ConeGeometry(.05,.16,8),0xe06ad2,[0,0,.54],[-X,0,0]);},
 book:g=>{for(const s of [-1,1]){add(g,box(.22,.025,.3),0x6a4fb5,[s*.11,.04,.18],[0,0,s*.35]);add(g,box(.2,.02,.28),0xfdfaf2,[s*.1,.06,.18],[0,0,s*.35]);}},
 bell:g=>{add(g,rod(.035,.2,8),0x8a5a30,[0,.1,.06]);add(g,new THREE.CylinderGeometry(.06,.15,.2,14,1,true),0xe6bc4a,[0,-.1,.06],[0,0,0],[1,1,1],true);add(g,sphere(.04),0xb8902f,[0,-.21,.06]);},
 eraser:g=>{add(g,box(.22,.13,.3),0xf29ab4,[0,0,.18]);add(g,box(.225,.135,.12),0x3f7fc4,[0,0,.1]);},
};
export function createHeldWeapon(id:string){const g=new THREE.Group();(HELD[id]??HELD.standard)(g);return g;}
const THROWN:Record<string,(g:THREE.Group)=>void>={
 standard:g=>pencil(g,.42),
 swift:g=>{add(g,rod(.05,.22,8),0xfdfaf2,[0,0,0],[X,0,0]);add(g,rod(.052,.05,8),0xf29ac2,[0,0,-.1],[X,0,0]);},
 frost:g=>{add(g,new THREE.OctahedronGeometry(.1,0),0xbff2ff,[0,0,0]);add(g,sphere(.08),0x7fd8f5,[0,0,-.04]);},
 blast:g=>football(g,.15),
 ruler:g=>add(g,box(.12,.02,.6),0xf2cf4a,[0,0,0]),
 glue:g=>{add(g,sphere(.1),0xfdfaf2,[0,0,0]);add(g,sphere(.05),0xfdfaf2,[0,-.06,-.1]);},
 tennis:g=>ball(g,.08,0xd7ee3c,0xffffff),
 basketball:g=>ball(g,.14,0xe8782c,0x3a2416),
 cricket:g=>ball(g,.08,0xc8342f,0xfdfaf2),
 pingpong:g=>add(g,sphere(.065),0xfff7ea,[0,0,0]),
 rugby:g=>{add(g,sphere(1),0x9a5b30,[0,0,0],[0,0,0],[.1,.1,.17]);add(g,new THREE.TorusGeometry(.098,.012,4,18),0xfdfaf2,[0,0,0]);},
 badminton:g=>{add(g,sphere(.05),0xf3e2c4,[0,0,.05]);add(g,new THREE.CylinderGeometry(.13,.05,.2,10,1,true),0xfdfaf2,[0,0,-.07],[X,0,0],[1,1,1]);},
 fork:g=>{add(g,box(.05,.02,.34),0xc9ced3,[0,0,-.1],[0,0,0],[1,1,1],true);for(const x of [-.045,0,.045])add(g,box(.018,.02,.16),0xdfe3e7,[x,0,.14],[0,0,0],[1,1,1],true);},
 teddy:g=>add(g,heart(.12),0xf05a8c,[0,0,0],[0,0,0]),
 paint:g=>{add(g,sphere(.1),0xe06ad2,[0,0,0]);add(g,sphere(.05),0x7fd3ff,[.06,.04,-.1]);add(g,sphere(.045),0xf5d24a,[-.06,-.02,-.12]);},
 book:g=>{for(const s of [-1,1]){add(g,box(.18,.02,.24),0x6a4fb5,[s*.09,0,0],[0,0,s*.45]);add(g,box(.16,.016,.22),0xfdfaf2,[s*.08,.015,0],[0,0,s*.45]);}},
 bell:g=>{add(g,new THREE.CylinderGeometry(.05,.12,.16,12),0xe6bc4a,[0,0,0],[X,0,0],[1,1,1],true);add(g,sphere(.035),0xb8902f,[0,0,.1]);},
 eraser:g=>{add(g,box(.18,.1,.24),0xf29ab4,[0,0,0]);add(g,box(.185,.105,.1),0x3f7fc4,[0,0,-.06]);},
};
export function createProjectile(id:string){const g=new THREE.Group();(THROWN[id]??THROWN.standard)(g);return g;}
/** How each projectile flies: arc height as a share of distance, spin (turns per flight) and trail colour. */
export const PROJECTILE_FLIGHT:Record<string,{arc:number;spin:number;trail:number}>={
 standard:{arc:.08,spin:0,trail:0xf4c430},swift:{arc:0,spin:0,trail:0xfdfaf2},frost:{arc:.1,spin:1,trail:0x9eeeff},blast:{arc:.45,spin:2,trail:0xffffff},
 ruler:{arc:.1,spin:3,trail:0xf2cf4a},glue:{arc:.35,spin:0,trail:0xfdfaf2},tennis:{arc:.3,spin:2,trail:0xd7ee3c},basketball:{arc:.5,spin:1.5,trail:0xe8782c},
 cricket:{arc:.05,spin:3,trail:0xff8a70},pingpong:{arc:.15,spin:2,trail:0xfff7ea},rugby:{arc:.4,spin:1,trail:0xc88a50},badminton:{arc:.25,spin:0,trail:0xfdfaf2},
 fork:{arc:.05,spin:0,trail:0xdfe3e7},teddy:{arc:.15,spin:0,trail:0xff91c5},paint:{arc:.3,spin:1,trail:0xef82df},book:{arc:.2,spin:.5,trail:0xb89ae0},
 bell:{arc:.25,spin:0,trail:0xf2d36b},eraser:{arc:.2,spin:2,trail:0xf29ab4},
};
