'use client';
import {useEffect,useRef,useState} from 'react';
import type {Hero3DSkin} from '../lib/hero-3d-catalogue';
import {createHeroModel,type RigOutfit} from '../lib/hero-model';
import type {Wardrobe} from '../lib/clothing';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

/** Procedural art study. Production roster models will use separately authored GLB assets. */
export default function Hero3D({skin,outfit,motion,wardrobe}:{skin:Hero3DSkin;outfit:RigOutfit;motion:'idle'|'walk'|'attack';wardrobe?:Wardrobe}) {
  const host=useRef<HTMLDivElement>(null);
  const viewpoint=useRef<[number,number,number]>([1.8,2.5,5.8]);
  const [failed,setFailed]=useState(false);
  useEffect(()=>{
    const container=host.current;if(!container)return;
    let renderer:THREE.WebGLRenderer;
    try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch{setFailed(true);return;}
    setFailed(false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.domElement.setAttribute('aria-label',`${skin} 3D outfit preview. Drag to rotate; scroll to zoom.`);
    renderer.domElement.setAttribute('role','img');container.appendChild(renderer.domElement);
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(35,1,.1,30);camera.position.set(...viewpoint.current);
    const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,1.35,0);controls.enablePan=false;controls.minDistance=3.8;controls.maxDistance=8;controls.maxPolarAngle=Math.PI*.56;controls.update();
    scene.add(new THREE.HemisphereLight(0xe5f5ff,0x55775b,2.5));
    const key=new THREE.DirectionalLight(0xffefdc,3.2);key.position.set(3,6,4);key.castShadow=true;key.shadow.mapSize.set(1024,1024);scene.add(key);
    const rim=new THREE.DirectionalLight(0xc2ddff,2);rim.position.set(-3,3,-2);scene.add(rim);
    const model=createHeroModel(skin,outfit,wardrobe);scene.add(model.root);
    const floor=new THREE.Mesh(new THREE.CylinderGeometry(1,1.04,.12,64),new THREE.MeshStandardMaterial({color:0x47695d}));floor.position.y=.1;floor.receiveShadow=true;scene.add(floor);
    const resize=new ResizeObserver(()=>{const w=container.clientWidth,h=container.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();});resize.observe(container);
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');const start=performance.now();
    renderer.setAnimationLoop(()=>{const t=(performance.now()-start)/1000;const animate=!reduced.matches&&!document.hidden;
      model.animate(t,motion,animate);
      renderer.render(scene,camera);
    });
    return()=>{viewpoint.current=camera.position.toArray() as [number,number,number];renderer.setAnimationLoop(null);resize.disconnect();controls.dispose();key.shadow.dispose();model.dispose();floor.geometry.dispose();floor.material.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();};
  },[skin,outfit.top,outfit.bottom,outfit.hat,outfit.scarf,motion,JSON.stringify(wardrobe)]);
  return <div><div ref={host} style={{height:420,width:'100%',minWidth:220,background:'radial-gradient(ellipse at center, #42695c, #132f28)',borderRadius:20,touchAction:'none'}}/>{failed?<p>3D preview is unavailable on this device. Your hero and items are unchanged.</p>:<p>Drag to turn · scroll or pinch to zoom</p>}</div>;
}
