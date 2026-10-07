import * as THREE from 'three';
/** Cosmetic cup, baked beside its specific hero; never part of combat statistics. */
export function createAdminTrophy(){
 const root=new THREE.Group(),materials:THREE.Material[]=[],geometries:THREE.BufferGeometry[]=[];
 root.name='Admin Abuse trophy';root.position.set(.85,0,.3);
 const gold=new THREE.MeshStandardMaterial({color:0xffd45b,metalness:.85,roughness:.22}),base=new THREE.MeshStandardMaterial({color:0x403016,roughness:.5});materials.push(gold,base);
 const add=(geometry:THREE.BufferGeometry,y:number,material=gold)=>{geometries.push(geometry);const mesh=new THREE.Mesh(geometry,material);mesh.position.y=y;mesh.castShadow=true;mesh.userData.metal=material===gold;root.add(mesh);return mesh;};
 add(new THREE.BoxGeometry(.5,.14,.38),.07,base);
 add(new THREE.BoxGeometry(.38,.12,.28),.2);
 add(new THREE.CylinderGeometry(.055,.08,.3,10),.39);
 add(new THREE.CylinderGeometry(.25,.09,.32,16),.67);
 add(new THREE.TorusGeometry(.25,.025,6,16),.84).rotation.x=Math.PI/2;
 for(const x of [-.25,.25]){const handle=add(new THREE.TorusGeometry(.14,.03,6,14),.65);handle.position.x=x;}
 return {root,dispose(){geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}};
}
