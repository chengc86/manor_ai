import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
/**
 * The soft "photo studio" every hero picture shares: a gentle room reflection for plush and glossy surfaces,
 * a warm key light, a cool fill and a bright rim that separates the hero from the background.
 */
export function prepareRenderer(renderer:THREE.WebGLRenderer){
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=1.05;
}
export function studio(renderer:THREE.WebGLRenderer,scene:THREE.Scene,{shadows=false}={}){
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.04).texture;pmrem.dispose();room.dispose();
 scene.environment=env;scene.environmentIntensity=.4;
 const hemi=new THREE.HemisphereLight(0xfff6ea,0x5d7a66,.55);
 const key=new THREE.DirectionalLight(0xfff0dc,2.5);key.position.set(2.5,5,4.5);
 const fill=new THREE.DirectionalLight(0xd9ecff,.9);fill.position.set(-4,2,3);
 const rim=new THREE.DirectionalLight(0xffffff,2.2);rim.position.set(-1.5,3.5,-4.5);
 if(shadows){key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=key.shadow.camera.bottom=-2.5;key.shadow.camera.right=key.shadow.camera.top=2.5;key.shadow.bias=-.0004;key.shadow.normalBias=.02;}
 scene.add(hemi,key,fill,rim);
 return {key,dispose(){env.dispose();key.shadow.dispose();scene.remove(hemi,key,fill,rim);}};
}
/** Points the camera at an object from a friendly three-quarter angle so it fills the frame. */
export function frame(camera:THREE.PerspectiveCamera,object:THREE.Object3D,{yaw=.18,pitch=.12,margin=1.08}={}){
 object.updateMatrixWorld(true);
 const box=new THREE.Box3().setFromObject(object),size=box.getSize(new THREE.Vector3()),centre=box.getCenter(new THREE.Vector3());
 const fov=THREE.MathUtils.degToRad(camera.fov),fitH=size.y/2/Math.tan(fov/2),fitW=Math.max(size.x,size.z)/2/Math.tan(fov/2)/camera.aspect;
 const distance=Math.max(fitH,fitW)*margin+Math.max(size.x,size.z)/2;
 camera.position.set(centre.x+Math.sin(yaw)*distance*Math.cos(pitch),centre.y+Math.sin(pitch)*distance,centre.z+Math.cos(yaw)*distance*Math.cos(pitch));
 camera.lookAt(centre);camera.near=distance/20;camera.far=distance*4;camera.updateProjectionMatrix();
 return {centre,size,distance};
}
