// Stable IDs: append only. IDs 7 and 8 remain legacy towers.
export type HeroFamily='Animals'|'Wonders'|'Playthings';
export const EXTRA_HEROES:{id:number;name:string;kind:string;family:HeroFamily;traitBase:number}[]=[];
const groups:[HeroFamily,string][]=[
 ['Animals',`Tumble|Capybara
Puddle|Axolotl
Moss|Tortoise
Pebble|Penguin
Clover|Garden robot
Acorn|Red deer
Dapple|Polka-dot robot
Sprig|Frog
Maple|Red squirrel
Juniper|Koala
Coral|Seahorse
Ripple|Seal
Skipper|Dolphin
Waddle|Duck
Poppy|Red panda
Sunny|Meerkat
Dune|Fennec fox
Toffee|Alpaca
Nori|Cat
Biscuit|Corgi
Marble|Snow leopard
Saffron|Tiger cub
Olive|Sloth
Fable|Owl
Kiki|Kiwi bird
Kiwi|Parrot
Bubbles|Hippo
Truffle|Piglet
Pecan|Mouse
Honey|Honeybee
Speck|Ladybird
Willow|Butterfly
Lagoon|Crocodile
Tango|Toucan`],
 ['Wonders',`Bolt|Round robot
Widget|Box robot
Pixel|Screen robot
Gizmo|Wind-up robot
Orbit|Astronaut robot
Comet|Star sprite
Nova|Moon sprite
Sol|Sun sprite
Nimbus|Cloud sprite
Drizzle|Raindrop sprite
Frost|Snowflake sprite
Aurora|Opal sprite
Quartz|Crystal golem
Slate|Pebble golem
Copper|Clockwork toy
Fern|Forest sprite
Petal|Flower sprite
Oakley|Wooden robot
Brio|Mushroom sprite
Cinder|Dragon
Glimmer|Dragon
Twinkle|Unicorn robot
Rook|Griffin
Zephyr|Friendly yeti
Fizz|Fluffy monster
Wisp|Snow robot
Echo|Alien
Cosmo|Alien
Tinker|Wooden puppet
Beacon|Lighthouse robot
Prism|Glass robot
Sprout|Seedling sprite
Glade|Moss guardian`],
 ['Playthings',`Scribble|Pencil pal
Doodle|Crayon pal
Inky|Fountain pen robot
Bookmark|Book pal
Chalky|Chalk pal
Stitch|Patchwork bear
Button|Fabric rabbit
Patches|Quilt robot
YoYo|Yo-yo pal
Domino|Domino pal
Puzzle|Jigsaw pal
Dicey|Dice robot
Rollo|Toy train pal
Sailor|Toy boat pal
Rocket|Toy rocket pal
Chime|Bell pal
Tempo|Drum pal
Melody|Music sprite
Mosaic|Stained-glass robot
Zip|Backpack pal
Kettle|Kitchen robot
Pipkin|Pumpkin sprite
Berry|Strawberry sprite
Zest|Orange sprite
Coco|Coconut sprite
Peppy|Pepper sprite
Waffle|Waffle pal
Mochi|Rice-cake sprite
Pretzel|Pretzel pal
Cobalt|Ceramic robot
Velvet|Plush bat
Taffy|Candy sprite
Dandy|Dandelion sprite`],
];
const profiles=[0,1,2,3,4,5,6,9,10,11,12,13,14,15];
for(const [family,rows] of groups)for(const row of rows.split('\n')){const [name,kind]=row.split('|');const index=EXTRA_HEROES.length;EXTRA_HEROES.push({id:16+index,name,kind,family,traitBase:profiles[index%profiles.length]});}
for(const hero of EXTRA_HEROES)if(hero.id===20||hero.id===22)hero.family='Wonders';
export const heroFamily=(id:number):HeroFamily=>EXTRA_HEROES.find(h=>h.id===id)?.family??'Animals';
export const heroKind=(id:number)=>EXTRA_HEROES.find(h=>h.id===id)?.kind??'Original hero';
