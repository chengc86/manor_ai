'use client';
import {useRef,useState,useMemo,useSyncExternalStore,lazy,Suspense} from 'react';
import {Shield,Swords,ZoomIn,ZoomOut,Maximize2,X,Flag,Users,HelpCircle,RotateCcw,RotateCw,Box,Grid2x2} from 'lucide-react';
import {Slider} from '@/components/ui/slider';
import {SCHOOL_MAX_HP,schoolHealthAt,COLS,ROWS,CELL,WAYPOINTS,isBuildable,percent,RANGES,simulate,monsterProgress,battleLayout} from '@/lib/battle';
import {HEROES,heroStats} from '@/lib/heroes';
import Sprite from './hero-sprite';
import BattleScene from './battle-scene';
import {OnlineClass} from './class-ranking';
import EnemyGuide from './enemy-guide';
import {chapterScene} from '@/lib/chapter-scenes';
import {mapLayout} from '@/lib/map-layout';
import {chapterFor} from '@/lib/chapters';
import type {BoardCamera} from './board-3d';
import './board-3d.css';
// The 3D battlefield loads after the page, so its scene code never delays the first paint.
const Board3D=lazy(()=>import('./board-3d'));
const MAP_VIEW_KEY='manor-quest-map-view';
let webgl:boolean|undefined;
// Probe once and release the test context straight away; browsers cap how many can be alive.
const webglAvailable=()=>webgl??=(()=>{try{const c=document.createElement('canvas'),gl=c.getContext('webgl2')??c.getContext('webgl');gl?.getExtension('WEBGL_lose_context')?.loseContext();return !!gl;}catch{return false;}})();
const savedView=()=>{try{return localStorage.getItem(MAP_VIEW_KEY)==='flat'?'flat' as const:'3d' as const;}catch{return '3d' as const;}};
const onStorage=(changed:()=>void)=>{window.addEventListener('storage',changed);return()=>window.removeEventListener('storage',changed);};
const noSubscription=()=>()=>{};
export default function GameBoard({world,battle,now,placement,onPlace,onHero,onCancel,onHelp}:any){
 const [zoom,setZoom]=useState(.8),[hover,setHover]=useState<number|null>(null),scroll=useRef<HTMLDivElement>(null);
 const scene=chapterScene(battle?.wave??world.wave),chapter=chapterFor(battle?.wave??world.wave);
 const [effects,setEffects]=useState(true);
 // 3D is the default view; the flat map remains for devices without WebGL and for anyone who prefers it.
 // The server has no screen, so the first render shows a placeholder until the browser reports its saved choice.
 const stored=useSyncExternalStore(onStorage,savedView,()=>'loading' as const),hasWebgl=useSyncExternalStore(noSubscription,webglAvailable,()=>true);
 const [chosen,setChosen]=useState<'3d'|'flat'|null>(null),[lost,setLost]=useState(false),camera=useRef<BoardCamera|null>(null);
 const view=stored==='loading'?'loading':chosen??stored,failed=lost||!hasWebgl;
 const chooseView=(next:'3d'|'flat')=>{setChosen(next);try{localStorage.setItem(MAP_VIEW_KEY,next);}catch{}};
 const in3d=view==='3d'&&!failed;
 const occupied=new Map<number,any>(world.defenders.filter((d:any)=>d.cell>=0).map((d:any)=>[d.cell,d]));
 const layout=battle?battleLayout(battle,battle.rulesVersion??5):mapLayout(world.wave,5,world.routeFrom),points=layout.waypoints.map(([x,y])=>`${x+.5},${y+.5}`).join(' ');
 const hoveredHero=hover!==null?occupied.get(hover):null;
 const rangeType=placement?.type??hoveredHero?.type;
 const rangePoint=hover!==null&&rangeType!==undefined?percent(hover):null;
 const riding=!!battle&&!!placement?.move&&!!world.me?.ride;
 const range=rangePoint&&(!battle||riding)?heroStats(rangeType,placement?placement.level??1:hoveredHero?.level??1,placement?.weapon??hoveredHero?.weapon??'standard',placement?world.me:hoveredHero).range:null;
 const rideKey=battle?.rideMoves?.map((m:any)=>m.id+'@'+m.at).join('|')??'';
 const sim=useMemo(()=>battle?simulate(battle):null,[battle?.start,rideKey]);
 const elapsed=battle?Math.max(0,(now-battle.start)/1000):0;
 const schoolHp=sim&&(battle.rulesVersion??1)>=4?schoolHealthAt(sim.breaches,elapsed):null;
 const defeated=sim?sim.deathAt.filter(t=>t!==null&&t+.25<=elapsed).length:0;
 const escaped=sim?sim.deathAt.filter((t,i)=>t===null&&monsterProgress(sim.tracks[i],elapsed)>=1).length:0;
 const approaching=sim?sim.count-defeated-escaped:0;
 const milliseconds=battle?Math.max(0,battle.duration-(now-battle.start)):0;
 const viewToggle=<div className="map-view-toggle" role="group" aria-label="Map view"><button aria-pressed={in3d} disabled={failed} onClick={()=>chooseView('3d')} title={failed?'3D needs WebGL, which this device does not offer':'3D battlefield'}><Box size={15}/> 3D</button><button aria-pressed={!in3d&&view!=='loading'} onClick={()=>chooseView('flat')}><Grid2x2 size={15}/> Flat</button></div>;
 return <><div className={`school-health-panel ${schoolHp===0?'fallen':''}`} role="status"><Shield size={26}/><div><b>The Manor · {schoolHp??SCHOOL_MAX_HP} / {SCHOOL_MAX_HP} HP</b><div className="school-health-track"><i style={{width:`${schoolHp??SCHOOL_MAX_HP}%`}}/></div><span>{schoolHp===0?'School defeated — prepare and retry this wave.':'Escapes cost HP: ordinary 20 · elite 30 · boss 60. Keep the school above 0 to win.'}</span></div></div><div className="board-controls"><div><span className="board-mode"><Swords size={15}/>{battle?`Your class is fighting · ${Math.ceil(milliseconds/1000)}s`:'Choose your heroes. Hold the path.'}</span><span className="board-size">24 × 18 squares · Room for the whole year</span></div>
 {in3d?<div className="zoom-controls">{viewToggle}<button aria-label="Zoom out" onClick={()=>camera.current?.zoom(1.25)}><ZoomOut size={17}/></button><button aria-label="Zoom in" onClick={()=>camera.current?.zoom(.8)}><ZoomIn size={17}/></button><button aria-label="Turn the map left" onClick={()=>camera.current?.rotate(-.35)}><RotateCcw size={17}/></button><button aria-label="Turn the map right" onClick={()=>camera.current?.rotate(.35)}><RotateCw size={17}/></button><button className="fit-map" onClick={()=>camera.current?.reset()}><Maximize2 size={15}/> Fit map</button><button aria-label="How to place heroes" onClick={onHelp}><HelpCircle size={17}/></button></div>
 :<div className="zoom-controls">{viewToggle}<button aria-label="Zoom out" onClick={()=>setZoom(Math.max(.35,zoom-.1))}><ZoomOut size={17}/></button><Slider min={.35} max={1.3} step={.05} value={[zoom]} onValueChange={v=>setZoom(v[0])} aria-label="Map zoom" className="zoom-slider"/><button aria-label="Zoom in" onClick={()=>setZoom(Math.min(1.3,zoom+.1))}><ZoomIn size={17}/></button><button className="fit-map" onClick={()=>setZoom(Math.min(1,(scroll.current?.clientWidth??900)/(COLS*CELL),620/(ROWS*CELL)))}><Maximize2 size={15}/> Fit map</button><button aria-label="How to place heroes" onClick={onHelp}><HelpCircle size={17}/></button></div>}</div>
 {battle&&sim&&<div className="combat-hud" aria-label="Live battle progress"><div className="combat-wave"><span className="live-dot"/><div><small>LIVE CLASS BATTLE</small><b>Wave {battle.wave}</b></div></div><div className="combat-progress"><div><b>{defeated} defeated</b><span>{sim.count} monsters</span></div><div className="combat-progress-track"><i style={{width:`${defeated/sim.count*100}%`}}/></div></div><div className="combat-stat"><b>{approaching}</b><span>Remaining</span></div><div className={`combat-stat ${escaped?'danger':''}`}><b>{escaped}</b><span>Got through</span></div><div className="combat-stat"><b>{battle.fighters.length}</b><span>Heroes</span></div></div>}
 <OnlineClass players={world.onlinePlayers??world.players}/>{placement&&<div className="placement-banner"><span><b>{placement.move&&battle?'Ride':placement.move&&!placement.reserve?'Move':'Place'} {HEROES[placement.type].name}</b> {placement.move&&battle?'Choose an empty square. Your ride crosses the map during this wave, the same way monsters follow the path.':`Choose an empty placement square. ${placement.reserve?'Placing your hero again is free.':placement.move?'Moving is free.':'Coins are spent only when your hero is placed.'}`}</span><button onClick={onCancel} aria-label="Cancel placement"><X size={18}/></button></div>}
 {view==='loading'||in3d?<div className="board-scroll board-3d-frame" id="class-map" aria-label={`Class battlefield in 3D: ${chapter.name}. The monster path runs from the entry on the left to The Manor at the bottom right.`}>
  {in3d&&<Suspense fallback={<div className="board-3d-loading">Building the battlefield…</div>}><Board3D world={world} battle={battle} sim={sim} now={now} placement={placement} range={range} hover={hover} setHover={setHover} onPlace={onPlace} onHero={onHero} onFail={()=>setLost(true)} motion={effects} layout={layout} schoolHp={schoolHp} ref={camera}/></Suspense>}
  {view==='loading'&&<div className="board-3d-loading">Building the battlefield…</div>}
 </div>
 :<div className="board-scroll" ref={scroll} id="class-map" aria-label="Class battlefield. Scroll to explore, or use Fit map."><div className="board-sizing" style={{width:COLS*CELL*zoom,height:ROWS*CELL*zoom}}><div className={`expanded-board ${placement?'placing':''} ${battle?'in-battle':''}`} style={{width:COLS*CELL,height:ROWS*CELL,transform:`scale(${zoom})`}}>
 <img key={scene.art} src={scene.art} className="board-art chapter-board-art" alt={`${chapter.name}: illustrated ${chapter.region} battlefield`}/>{effects&&<div className={`chapter-atmosphere atmosphere-${scene.effect}`} aria-hidden="true">{Array.from({length:16},(_,i)=><i key={i} style={{left:`${(i*37+11)%100}%`,top:`${(i*23+7)%100}%`,animationDelay:`-${i*1.7}s`,animationDuration:`${12+i%5*3}s`}}/>)}</div>}
 <svg className="route-layer" viewBox={`0 0 ${COLS} ${ROWS}`} aria-label="The monster route winds back and forth across the entire board" preserveAspectRatio="none"><polyline points={points} fill="none" stroke="#687139" strokeWidth="1.08" strokeLinejoin="round"/><polyline points={points} fill="none" stroke={scene.path} strokeWidth=".91" strokeLinejoin="round"/><polyline points={points} fill="none" stroke="#f0dda9" strokeWidth=".65" strokeLinejoin="round"/><polyline points={points} fill="none" stroke="#b6a371" strokeWidth=".025" strokeDasharray=".14 .45"/>{rangePoint&&!battle&&<circle cx={rangePoint.x*COLS/100} cy={rangePoint.y*ROWS/100} r={range!} fill="#ffef8030" stroke="#fff0b0" strokeWidth=".035" strokeDasharray=".12 .1"/>}</svg>
 <div className="placement-grid" aria-label="Hero placement squares">{Array.from({length:COLS*ROWS},(_,cell)=>{if(!isBuildable(cell,world.wave,world.routeFrom))return <span key={cell} className="blocked-square"/>;const d=occupied.get(cell);return <button key={cell} aria-label={`Row ${Math.floor(cell/COLS)+1}, column ${cell%COLS+1}${d?`: ${d.name}'s ${HEROES[d.type].name}`:': empty placement square'}`} className={`grid-square ${d?'occupied':''}`} onMouseEnter={()=>setHover(cell)} onMouseLeave={()=>setHover(null)} onFocus={()=>setHover(cell)} onBlur={()=>setHover(null)} onClick={()=>d?onHero(d):onPlace(cell)}>{!d&&<span>+</span>}</button>})}</div>
 <div className="camp-label"><Users size={18}/> THE MANOR HERO CAMP <span>{world.players.length}/40</span></div>
 {world.players.map((p:any,i:number)=>{const col=2+i%20,row=Math.floor(i/20);return <button className="camp-hero" key={p.id} style={{left:(col+.5)*CELL,top:(row+.52)*CELL,outline:`3px solid ${p.colour}`,borderRadius:'50%'}} title={`${p.name} · ${p.online?'Online now':'Offline'}`} aria-label={`${p.name}'s character, ${p.online?'online':'offline'}`} onClick={()=>onHero({camp:true,...p})}><Sprite type={p.hero} gender={p.gender} uniform={p.uniform} clothing={p.clothing} outfit={p.outfit}/><b><i className={p.online?'online-dot':'offline-dot'}/>{p.name}</b></button>})}
 <div className="route-entry" style={{left:4,top:layout.waypoints[0][1]*CELL+8}}><Swords size={17}/> ENTRY</div><div className="school-goal" style={{left:19.8*CELL,top:14.1*CELL}}><span><Shield size={17}/> THE MANOR · {schoolHp??SCHOOL_MAX_HP} HP</span>{sim&&schoolHp!==null&&sim.breaches.filter(b=>elapsed>=b.at&&elapsed<b.at+1.4).map(b=><b className="school-hit" key={b.monster}>−{b.damage} HP</b>)}</div>
 {!battle&&world.defenders.filter((d:any)=>d.cell>=0).map((d:any)=>{const p=percent(d.cell);return <button className={`placed-hero tier-${d.level}`} key={d.id} style={{left:`${p.x}%`,top:`${p.y}%`,outline:`3px solid ${d.colour}`,borderRadius:'50%'}} onMouseEnter={()=>setHover(d.cell)} onMouseLeave={()=>setHover(null)} onFocus={()=>setHover(d.cell)} onBlur={()=>setHover(null)} onClick={()=>onHero(d)} aria-label={`${d.name}'s ${HEROES[d.type].name}, level ${d.level}`}><span className={`resting-pedestal pedestal-${d.type}`}/><Sprite type={d.type} gender={d.gender} uniform={d.uniform} clothing={d.clothing} outfit={d.outfit} weapon={d.weapon??(d.level?'standard':'none')}/><b>{d.level}</b><small>{d.name}</small></button>})}
 {battle&&<BattleScene battle={battle} now={now} onHero={onHero}/>}
 </div></div></div>}<div className="board-legend"><button className="scenery-toggle" aria-pressed={effects} onClick={()=>setEffects(!effects)}>Scenery motion: {effects?'on':'off'}</button><span><i className="grass-key"/> Open squares: place heroes</span><span><i className="path-key"/> Path: monsters only</span><span><Users size={14}/>{hoveredHero&&!battle?`${HEROES[hoveredHero.type].name} · Range ${heroStats(hoveredHero.type,hoveredHero.level,hoveredHero.weapon,hoveredHero).range} squares`:in3d?'Point at a hero to see their range · drag to move, scroll to zoom':'Hover over a hero to see their range'}</span></div><EnemyGuide wave={battle?.wave??world.wave}/></>
}
