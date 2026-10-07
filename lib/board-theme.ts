import {chapterFor} from './chapters';
/** How each chapter looks on the 3D battlefield. Pure data, shared by the renderer and tests. */
export type SceneryKit='campus'|'courtyard'|'gates'|'playground'|'sports'|'town'|'abbey'|'river'|'oxford'|'museum'|'botanic';
export type Weather='petals'|'sunbeams'|'motes'|'leaves'|'rain'|'lanterns';
export type TimeOfDay='day'|'golden'|'evening'|'night'|'overcast';
export type PathStyle='gravel'|'flagstone'|'cobble'|'tarmac';
export type Landmark='manor'|'tennis'|'gazebo'|'playground'|'minibus'|'hall'|'bunting'|'market'|'ruins'|'meadow'|'bridge'|'wharf'|'confluence'|'spires'|'library'|'dome'|'portico'|'dinosaur'|'totem'|'glasshouse'|'orrery';
type Row=[SceneryKit,TimeOfDay,Weather,PathStyle,Landmark];
const CHAPTER_LOOKS:Row[]=[
 ['campus','day','petals','gravel','manor'],
 ['campus','day','sunbeams','gravel','tennis'],
 ['campus','golden','motes','gravel','library'],
 ['courtyard','day','leaves','flagstone','gazebo'],
 ['gates','day','leaves','tarmac','manor'],
 ['playground','overcast','rain','tarmac','playground'],
 ['sports','day','motes','flagstone','hall'],
 ['sports','golden','sunbeams','tarmac','hall'],
 ['courtyard','day','sunbeams','tarmac','minibus'],
 ['gates','evening','lanterns','tarmac','manor'],
 ['town','day','motes','cobble','market'],
 ['town','golden','sunbeams','cobble','hall'],
 ['town','day','petals','cobble','bunting'],
 ['abbey','day','petals','gravel','ruins'],
 ['abbey','golden','sunbeams','gravel','meadow'],
 ['abbey','overcast','motes','flagstone','ruins'],
 ['river','overcast','rain','flagstone','bridge'],
 ['river','evening','lanterns','flagstone','wharf'],
 ['river','overcast','rain','gravel','confluence'],
 ['river','golden','motes','gravel','bridge'],
 ['oxford','day','sunbeams','flagstone','spires'],
 ['oxford','golden','motes','flagstone','library'],
 ['oxford','day','sunbeams','flagstone','dome'],
 ['oxford','overcast','rain','flagstone','library'],
 ['museum','day','motes','flagstone','portico'],
 ['museum','night','lanterns','flagstone','dinosaur'],
 ['museum','evening','motes','flagstone','totem'],
 ['botanic','day','petals','gravel','glasshouse'],
 ['museum','golden','lanterns','flagstone','orrery'],
 ['campus','evening','lanterns','gravel','manor'],
];
export type Lighting={sky:[number,number];fog:number;sun:number;sunIntensity:number;sunElevation:number;sunAzimuth:number;hemiSky:number;hemiGround:number;hemiIntensity:number;grass:[number,number];wild:number;glow:boolean};
const LIGHTING:Record<TimeOfDay,Lighting>={
 day:{sky:[0x6fb2e8,0xd9ecf2],fog:0xd6e8ea,sun:0xfff0d8,sunIntensity:2.6,sunElevation:.95,sunAzimuth:-.55,hemiSky:0xe3f3ff,hemiGround:0x5a7a4c,hemiIntensity:1.5,grass:[0x86b94f,0x7aae46],wild:0x6d9d45,glow:false},
 golden:{sky:[0x86a9d6,0xf8dcb0],fog:0xf0dcc0,sun:0xffd9a3,sunIntensity:2.5,sunElevation:.62,sunAzimuth:-.9,hemiSky:0xf5e6cf,hemiGround:0x6a6a3e,hemiIntensity:1.35,grass:[0x92b54c,0x86aa45],wild:0x789843,glow:false},
 evening:{sky:[0x4e4f86,0xf4a36e],fog:0xc99a86,sun:0xffa66a,sunIntensity:1.9,sunElevation:.4,sunAzimuth:-1.15,hemiSky:0xc4b0d0,hemiGround:0x55553f,hemiIntensity:1.4,grass:[0x76a24a,0x6d9745],wild:0x5c7f3c,glow:true},
 night:{sky:[0x121d3c,0x33466e],fog:0x2c3b5c,sun:0xb8c8ff,sunIntensity:1.35,sunElevation:.9,sunAzimuth:.6,hemiSky:0x8fa2d4,hemiGround:0x26344a,hemiIntensity:1.45,grass:[0x4d7d50,0x46754a],wild:0x365c3e,glow:true},
 overcast:{sky:[0x8797a6,0xc9d2d6],fog:0xbfc9cc,sun:0xe9eef2,sunIntensity:1.45,sunElevation:1.05,sunAzimuth:-.4,hemiSky:0xdfe8ee,hemiGround:0x55664c,hemiIntensity:1.75,grass:[0x77a24c,0x6d9745],wild:0x61883f,glow:false},
};
const PATH_COLOURS:Record<PathStyle,[number,number]>={gravel:[0xd8c28e,0xf1e4bd],flagstone:[0xcdbd9e,0xece1c6],cobble:[0xa89f94,0xd9d2c4],tarmac:[0x5b6068,0xb8bcbf]};
export type BoardTheme={chapter:number;index:number;name:string;kit:SceneryKit;time:TimeOfDay;weather:Weather;pathStyle:PathStyle;landmark:Landmark;lighting:Lighting;path:number;kerb:number;seed:number};
export function boardTheme(wave:number):BoardTheme{
 const chapter=chapterFor(Math.max(1,wave)),index=(chapter.number-1)%CHAPTER_LOOKS.length,[kit,time,weather,pathStyle,landmark]=CHAPTER_LOOKS[index];
 const [path,kerb]=PATH_COLOURS[pathStyle];
 return {chapter:chapter.number,index,name:chapter.name,kit,time,weather,pathStyle,landmark,lighting:LIGHTING[time],path,kerb,seed:chapter.number*7919};
}
export const BOARD_THEME_COUNT=CHAPTER_LOOKS.length;
