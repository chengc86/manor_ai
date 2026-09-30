'use client';
import {useEffect,useRef,useState} from 'react';
import type {Hero3DSkin} from '../lib/hero-3d-catalogue';
import {type RigOutfit} from '../lib/hero-model';
import {createRidingHero} from '../lib/hero-ride';
import {prepareRenderer,studio,frame} from '../lib/hero-stage';
import type {Wardrobe} from '../lib/clothing';
import type {Ride} from '../lib/vehicles';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

/** The rotatable 3D hero, in their clothes and on their ride: same geometry as the pictures and the battlefield. */
export default function Hero3D({skin,outfit,motion,wardrobe,ride}:{skin:Hero3DSkin;outfit:RigOutfit;motion:'idle'|'walk'|'attack';wardrobe?:Wardrobe;ride?:Ride}) {
  const host=useRef<HTMLDivElement>(null);
  // The viewpoint survives outfit changes; it is reframed only when the hero gets on or off a ride.
  const view=useRef<{key:string;position:THREE.Vector3;target:THREE.Vector3}|null>(null);
  const [failed,setFailed]=useState(false);
  useEffect(()=>{
    const container=host.current;if(!container)return;
    let renderer:THREE.WebGLRenderer;
    try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch{setFailed(true);return;}
    setFailed(false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));prepareRenderer(renderer);
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute('aria-label',`${skin} 3D preview${ride?` riding a ${ride.id.replace(/-/g,' ')}`:''}. Drag to rotate; scroll to zoom.`);
    renderer.domElement.setAttribute('role','img');container.appendChild(renderer.domElement);
    const scene=new THREE.Scene(),lights=studio(renderer,scene,{shadows:true});
    const model=createRidingHero(skin,outfit,wardrobe,ride);scene.add(model.root);model.animate(0,'idle',false);
    const camera=new THREE.PerspectiveCamera(32,1,.1,60),framed=frame(camera,model.root,{yaw:ride?.6:.35,margin:1.12});
    const key=ride?.id??'walk';
    if(view.current?.key===key){camera.position.copy(view.current.position);}
    const controls=new OrbitControls(camera,renderer.domElement);controls.target.copy(view.current?.key===key?view.current.target:framed.centre);controls.enablePan=false;
    controls.minDistance=framed.distance*.6;controls.maxDistance=framed.distance*1.6;controls.maxPolarAngle=Math.PI*.56;controls.update();
    const radius=Math.max(framed.size.x,framed.size.z)/2+.35;
    const floor=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius*1.04,.12,64),new THREE.MeshStandardMaterial({color:0x47695d,roughness:.9}));floor.position.y=-.06;floor.receiveShadow=true;scene.add(floor);
    lights.key.shadow.camera.left=lights.key.shadow.camera.bottom=-radius-1;lights.key.shadow.camera.right=lights.key.shadow.camera.top=radius+1;lights.key.shadow.camera.updateProjectionMatrix();
    const resize=new ResizeObserver(()=>{const w=container.clientWidth,h=container.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();});resize.observe(container);
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');const start=performance.now();
    renderer.setAnimationLoop(()=>{const t=(performance.now()-start)/1000;const animate=!reduced.matches&&!document.hidden;
      model.animate(t,motion,animate);
      renderer.render(scene,camera);
    });
    return()=>{view.current={key,position:camera.position.clone(),target:controls.target.clone()};renderer.setAnimationLoop(null);resize.disconnect();controls.dispose();lights.dispose();model.dispose();floor.geometry.dispose();floor.material.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();};
  },[skin,outfit.top,outfit.bottom,outfit.hat,outfit.scarf,motion,JSON.stringify(wardrobe),ride?.id,ride?.paint]);
  return <div><div ref={host} style={{height:420,width:'100%',minWidth:220,background:'radial-gradient(ellipse at center, #42695c, #132f28)',borderRadius:20,touchAction:'none'}}/>{failed?<p>3D preview is unavailable on this device. Your hero and items are unchanged.</p>:<p>Drag to turn · scroll or pinch to zoom</p>}</div>;
}
