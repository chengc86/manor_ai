/**
 * What each 3D hero looks like, matched to its 2D art: colours, body build, ears, tail, face and extra features.
 * Keyed by the skin in hero-3d-catalogue.ts. The builders live in hero-model.ts and hero-features.ts.
 */
export type Build='animal'|'bird'|'robot'|'sprite'|'toy';
export type Ears='pointy'|'round'|'long'|'floppy'|'tuft'|'huge'|'small'|'none';
export type Tail='bushy'|'thin'|'curl'|'stub'|'ringed'|'lizard'|'fluke'|'tuft'|'fan'|'none';
export type Muzzle='round'|'fox'|'cat'|'snout'|'pig'|'long'|'beak'|'bill'|'hook'|'none';
export type Mouth='open'|'smile'|'fangs'|'teeth'|'grin'|'beak';
export type HeroDesign={
 build:Build;
 /** Main colour, then an optional lighter front (chest, tummy) and muzzle. */
 fur:number;belly?:number;muzzle?:Muzzle;muzzleColour?:number;nose?:number;
 ears?:Ears;earColour?:number;earInner?:number;earTip?:number;earScale?:number;
 tail?:Tail;tailColour?:number;tailTip?:number;tailScale?:number;
 /** Hands and feet ("socks"), feet alone (birds), and arm/leg colour when it differs from the body (pandas). */
 paws?:number;feet?:number;limbs?:number;
 iris?:number;eyeScale?:number;eyeY?:number;mouth?:Mouth;blush?:number|false;
 /** Surface override: smooth skin (frogs, dolphins) or glossy plastic instead of the build's default. */
 finish?:'fur'|'skin'|'plastic';
 /** Named extra features from hero-extras.ts, as "name" or "name#rrggbb"; accents colour tails' rings and wing tips. */
 extras?:string[];accent?:number;accent2?:number;
 /** Head shape for robots, sprites and playthings (see hero-heads.ts); round otherwise. Sewn-on button eyes for plush toys. */
 head?:string;headColour?:number;eyes?:'round'|'button'|'glow';
 /** Body proportions: plumpness, leg length and overall head size. */
 plump?:number;legs?:number;headSize?:number;
 /** Animals wear plain shorts until clothes are bought; robots, sprites and toys do not. */
 shorts?:boolean;
};
const d=(build:Build,fur:number,rest:Omit<HeroDesign,'build'|'fur'>={}):HeroDesign=>({build,fur,...rest});
const CREAM=0xfbead3,WHITE=0xf7f3ee,PINK=0xf3a7a6;
export const HERO_DESIGNS:Record<string,HeroDesign>={
 // ---- Animals ----
 fox:d('animal',0xe8691a,{belly:CREAM,muzzle:'fox',muzzleColour:CREAM,ears:'pointy',earInner:0xfbe0c8,earTip:0x4a2a1c,tail:'bushy',tailTip:WHITE,tailScale:1.35,paws:0x4a2a1c,extras:['cheek-fluff']}),
 cat:d('animal',0x5b6f9c,{belly:0xeae6ef,muzzle:'cat',muzzleColour:0xf1eef4,nose:0xe79aa6,ears:'pointy',earInner:0xf2b5bf,tail:'thin',paws:0xeae6ef,iris:0x3d8fcf,extras:['whiskers','cheek-fluff#eae6ef']}),
 'tuxedo-cat':d('animal',0x2b2627,{belly:0xf1ebe6,muzzle:'cat',muzzleColour:0xf6f1ed,nose:0xe79aa6,ears:'pointy',earInner:0xf0b3bd,tail:'thin',tailTip:0xf1ebe6,paws:0xf1ebe6,iris:0x6fae4a,extras:['whiskers','blaze#f6f1ed']}),
 bear:d('animal',0x7a4527,{belly:0xe0a86f,muzzle:'round',muzzleColour:0xe7b882,ears:'round',earInner:0xd89a62,tail:'stub',plump:1.1}),
 owl:d('bird',0xeee8e2,{belly:0xfbf7f2,muzzle:'hook',muzzleColour:0x4a3b33,ears:'tuft',earInner:0xfbf7f2,earScale:.7,iris:0xf2b01e,eyeScale:1.18,limbs:0xe6ded7,accent:0x9a8d86,feet:0x8e7b6c,extras:['spots#8f8580']}),
 'brown-owl':d('bird',0x8f522c,{belly:0xe8c7a4,muzzle:'hook',muzzleColour:0xe8a534,ears:'tuft',earInner:0xe8c7a4,iris:0xe07b22,eyeScale:1.15,limbs:0x82482a,accent:0x5e321c,feet:0xe8a534,extras:['face-mask#f0d8bb']}),
 rabbit:d('animal',0xf4ebe3,{belly:0xfffaf4,muzzle:'cat',muzzleColour:0xfffaf4,nose:0xe99aa0,ears:'long',earInner:0xf3b8b8,tail:'stub',tailColour:0xffffff,mouth:'teeth'}),
 badger:d('animal',0x3d3637,{headColour:0xf1ebe4,belly:0xd9c3ae,muzzle:'round',muzzleColour:0xf6f1ea,ears:'small',earColour:0x3d3637,earInner:0xe8dccf,paws:0x252122,tail:'stub',extras:['badger']}),
 dragon:d('animal',0x4f8a3c,{finish:'skin',belly:0xe8d9a0,muzzle:'round',muzzleColour:0x6b9f4f,ears:'none',tail:'lizard',accent:0xe2cf8e,iris:0x8a5a2b,extras:['horns#efe0b5','wings#8fb85f','belly-scales','back-ridges#e2cf8e']}),
 'mint-dragon':d('animal',0x9fd6b6,{finish:'skin',belly:0xeef5dc,muzzle:'round',muzzleColour:0xb4e0c4,ears:'pointy',earInner:0xd8f0dd,earScale:.8,tail:'lizard',accent:0x72b894,iris:0x3e7fa6,extras:['small-horns#e9f3d6','wings#86c9a6','belly-scales','back-ridges#72b894']}),
 cinder:d('animal',0xf07a22,{finish:'skin',belly:0xf6c47a,muzzle:'round',muzzleColour:0xf28b3a,ears:'pointy',earColour:0xd9601a,earInner:0xf6c47a,earScale:.8,tail:'lizard',accent:0xc4501a,iris:0x7a3a12,extras:['horns#f6d9a0','wings#e2601c','belly-scales','back-ridges#c4501a']}),
 wolf:d('animal',0x857873,{belly:0xe9ddd1,muzzle:'fox',muzzleColour:0xece2d8,ears:'pointy',earInner:0xd9c7ba,tail:'bushy',tailTip:0xe0d3c7,paws:0xe0d3c7,iris:0x6a4a2e,extras:['cheek-fluff']}),
 raccoon:d('animal',0x7d6b64,{belly:0xd9c6b8,muzzle:'fox',muzzleColour:0xece0d6,ears:'pointy',earInner:0xece0d6,tail:'ringed',accent:0x2e2524,paws:0x2e2524,extras:['mask','brows']}),
 hedgehog:d('animal',0xe3bf97,{belly:0xf3dcc0,muzzle:'fox',muzzleColour:0xf0d2b0,ears:'small',earInner:0xd9a58a,paws:0x7a5a45,extras:['spikes#4f3120']}),
 squirrel:d('animal',0xc55f27,{belly:0xf5d7b5,muzzle:'cat',muzzleColour:0xf5d7b5,ears:'tuft',earInner:0xe8b08a,earTip:0xa8461b,tail:'bushy',tailScale:1.6,paws:0x8f3c15}),
 'red-squirrel':d('animal',0xc4401f,{belly:0xf2d0b0,muzzle:'cat',muzzleColour:0xf2d0b0,ears:'tuft',earInner:0xe8a585,earTip:0x8a2a12,tail:'bushy',tailScale:1.6,paws:0x7a2410}),
 otter:d('animal',0x6f4a39,{belly:0xe8c9a6,muzzle:'round',muzzleColour:0xe9d0b4,ears:'small',earInner:0xa77a60,tail:'thin',tailScale:1.35,paws:0x4a3025,extras:['whiskers']}),
 panda:d('animal',0xf6efe6,{muzzle:'round',muzzleColour:0xfdfaf5,ears:'round',earColour:0x2b2627,earInner:0x3d3637,limbs:0x2b2627,paws:0x2b2627,tail:'stub',extras:['eye-patches','shoulder-band']}),
 lion:d('animal',0xe0a13f,{belly:0xf3d7a0,muzzle:'round',muzzleColour:0xf6e0b6,ears:'round',earInner:0xd98f3a,earScale:.8,tail:'tuft',accent:0x9a4a1c,extras:['mane#b8621f']}),
 capybara:d('animal',0xb0754b,{belly:0xcf9a6c,muzzle:'snout',muzzleColour:0x9c6642,ears:'small',earInner:0x7a4b33,tail:'none',plump:1.12,paws:0x6b4431}),
 axolotl:d('animal',0xf2b9bf,{finish:'skin',belly:0xf8dcd5,muzzle:'none',ears:'none',tail:'lizard',iris:0x3a2a2e,mouth:'open',extras:['gills#d9627a']}),
 tortoise:d('animal',0xa99a5a,{finish:'skin',belly:0xefd29a,muzzle:'round',muzzleColour:0xc7b98a,ears:'none',tail:'stub',extras:['shell#8a6d3d']}),
 penguin:d('bird',0x34343e,{legs:.8,belly:0xf4efe8,muzzle:'beak',muzzleColour:0xf0892e,feet:0xf0892e,ears:'none',tail:'none',limbs:0x34343e,accent:0x2a2a33,extras:['face-mask#f4efe8']}),
 deer:d('animal',0xa44a28,{belly:0xf0d6bf,muzzle:'fox',muzzleColour:0xf3dfcc,ears:'pointy',earScale:1.15,earInner:0xf1c9b0,tail:'stub',tailColour:0xf3e3d4,paws:0x5a3322,extras:['antlers#8a5a36','fawn-spots']}),
 frog:d('animal',0x8fb33a,{finish:'skin',belly:0xe8dfae,muzzle:'none',mouth:'smile',ears:'none',tail:'none',eyeY:.3,extras:['frog-eyes','spots#6f8f2a']}),
 koala:d('animal',0xa39894,{belly:0xe4d7ce,muzzle:'none',ears:'round',earScale:1.45,earInner:0xf1e9e3,tail:'none',paws:0x6f6563,extras:['koala-nose']}),
 seahorse:d('animal',0xe07f45,{finish:'skin',belly:0xf6d8a6,muzzle:'none',mouth:'smile',ears:'none',tail:'curl',tailScale:2,extras:['seahorse-snout','crest#f0a764']}),
 seal:d('animal',0x9a908f,{finish:'skin',belly:0xe3d9d0,muzzle:'cat',muzzleColour:0xdcd3cb,ears:'none',tail:'fluke',extras:['whiskers','spots#6b6365']}),
 dolphin:d('animal',0x7b98c2,{finish:'skin',belly:0xe6e4e6,muzzle:'long',muzzleColour:0x8aa6cc,mouth:'open',ears:'none',tail:'fluke',extras:['dorsal-fin']}),
 duck:d('bird',0xf3d9a6,{belly:0xfaf0dd,muzzle:'bill',muzzleColour:0xed8a2f,feet:0xed8a2f,limbs:0xf0d29a,accent:0xe3c38a,extras:['tuft#f3d9a6']}),
 redpanda:d('animal',0xc75f33,{belly:0x3a2420,limbs:0x3a2420,paws:0x2e1d1a,muzzle:'fox',muzzleColour:0xf6ebe0,ears:'pointy',earInner:0xf6ebe0,earScale:.85,tail:'ringed',tailColour:0xd06a3a,accent:0x8f3c1f,extras:['cheek-patches','brows']}),
 meerkat:d('animal',0xc9a37a,{belly:0xecd8bf,muzzle:'fox',muzzleColour:0xecd8bf,ears:'small',earColour:0x5a3b28,earInner:0x5a3b28,tail:'thin',tailTip:0x4a2f1e,paws:0x8f6a4a,extras:['eye-patches#6b4a33']}),
 'fennec-fox':d('animal',0xe0b07a,{belly:0xf5e3cd,muzzle:'fox',muzzleColour:0xf5e3cd,ears:'huge',earInner:0xf4d3c0,tail:'bushy',tailTip:0xf5e8da,paws:0xd7a36f,extras:['cheek-fluff']}),
 alpaca:d('animal',0xf1ddc6,{belly:0xf8ecdf,muzzle:'round',muzzleColour:0xf8ecdf,ears:'pointy',earScale:.75,earInner:0xd9b79a,tail:'stub',paws:0x8a6450,extras:['wool#f7e8d7','fluff#f1ddc6']}),
 corgi:d('animal',0xd88a4a,{belly:0xf6ede3,muzzle:'fox',muzzleColour:0xf6ede3,ears:'pointy',earScale:1.25,earInner:0xf2cfb6,paws:0xf6ede3,legs:.75,tail:'stub',extras:['blaze']}),
 snowleopard:d('animal',0xd4cbc5,{belly:0xf1ebe6,muzzle:'cat',muzzleColour:0xf1ebe6,nose:0xc98a8a,ears:'round',earScale:.8,earInner:0xe8dcd6,iris:0x6aa0c8,tail:'thin',tailScale:1.5,extras:['spots#5a4f50','whiskers']}),
 tiger:d('animal',0xe7862f,{belly:0xf6ead9,muzzle:'cat',muzzleColour:0xf8efe3,nose:0xe39aa0,ears:'round',earInner:0xf6ead9,tail:'thin',tailTip:0x3a2418,paws:0xf6ead9,extras:['stripes','whiskers']}),
 sloth:d('animal',0x8a5f43,{belly:0xe8d0b6,muzzle:'round',muzzleColour:0xefdcc4,mouth:'smile',ears:'none',tail:'none',extras:['sloth-mask','claws']}),
 'kiwi-bird':d('bird',0x8a5a3b,{belly:0x9a6a48,muzzle:'none',mouth:'beak',feet:0xc8a27c,limbs:0x7a4e32,ears:'none',plump:1.15,extras:['long-beak']}),
 parrot:d('bird',0x5f9a32,{belly:0xb7c95a,muzzle:'hook',muzzleColour:0x3f3d3d,feet:0x5a5555,limbs:0x4f8a2a,accent:0x3f7fa8,extras:['crest#9ec23f']}),
 hippo:d('animal',0x9e8492,{finish:'skin',belly:0xe7b9b3,muzzle:'snout',muzzleColour:0xae93a0,ears:'small',earInner:0xe7b9b3,tail:'stub',plump:1.15}),
 pig:d('animal',0xf2b3a9,{finish:'skin',belly:0xf8cfc4,muzzle:'pig',muzzleColour:0xe58c88,ears:'floppy',earScale:1.2,earInner:0xe58c88,tail:'curl'}),
 mouse:d('animal',0xa99890,{belly:0xece0d4,muzzle:'cat',muzzleColour:0xf0e6dc,nose:0xe89a93,ears:'round',earScale:1.6,earInner:0xf0a79c,tail:'thin',tailColour:0xe9a69a,tailScale:1.2,paws:0xf0bdb2,extras:['whiskers']}),
 honeybee:d('animal',0xf2b84d,{finish:'skin',muzzle:'none',ears:'none',tail:'none',paws:0x3a2517,extras:['bee-stripes#3a2517','insect-wings','antennae#3a2517']}),
 ladybird:d('animal',0x2d2426,{finish:'plastic',headColour:0x2d2426,belly:0xf0d4b6,muzzle:'none',ears:'none',tail:'none',extras:['face-mask#f0d4b6','ladybird-shell','antennae#241c1c']}),
 butterfly:d('animal',0x6b3a6b,{finish:'skin',belly:0xefc5a9,muzzle:'none',ears:'none',tail:'none',iris:0x4a2a4a,extras:['butterfly-wings','antennae#3a1f3a']}),
 crocodile:d('animal',0x86a246,{finish:'skin',belly:0xf0da95,muzzle:'long',muzzleColour:0x7f9a40,mouth:'grin',ears:'none',tail:'lizard',accent:0x5f7a2e,iris:0xb07a2a,extras:['back-ridges#5f7a2e','belly-scales']}),
 toucan:d('bird',0x2a2528,{belly:0xefe2cf,muzzle:'none',mouth:'beak',feet:0x4f5c9a,limbs:0x2a2528,accent:0x1f1b1d,extras:['face-mask#efe2cf','toucan-beak']}),
 // ---- Robots ----
 'garden-robot':d('robot',0xe9e4cc,{head:'clover',headColour:0xb5d178,accent:0x5e8a34,accent2:0x6f9a44,limbs:0xdcd8c0,paws:0x6f9a44,feet:0x6f9a44,iris:0x3a5a1e,extras:['chest-light#9fe06a']}),
 'polka-dot-robot':d('robot',0xf3f0ee,{head:'visor',headColour:0xf6f4f2,accent:0x3d82c4,accent2:0xfbfaf8,limbs:0xefebe8,paws:0x3d82c4,feet:0x3d82c4,iris:0x2f6fb0,extras:['polka-dots']}),
 'round-robot':d('robot',0x1fa3a8,{head:'visor',accent:0x0f6b70,accent2:0xe9f1ef,limbs:0x1c9398,paws:0x0f6b70,feet:0x0f6b70,iris:0x3fa9e0,extras:['antenna#8fa3a6','chest-light#7fe3ff']}),
 'box-robot':d('robot',0xf5801a,{head:'box',accent:0x7a4a2a,accent2:0x4d3b31,paws:0x4d3b31,feet:0x4d3b31,extras:['antenna#7a6a5a','gear#f2b36a']}),
 'screen-robot':d('robot',0xe6dcef,{head:'screen',accent:0x7a45c2,accent2:0xc79bff,limbs:0xd9cde6,paws:0x7a45c2,feet:0x7a45c2,extras:['antenna#b9a6d6','chest-light#b58cff']}),
 'wind-up-robot':d('robot',0xa8d0ae,{head:'box',headColour:0xe8e4c8,accent:0xc9a453,accent2:0xc9a453,limbs:0x94c39c,paws:0xe8e4c8,feet:0x6f9976,extras:['wind-key#c9a453']}),
 'astronaut-robot':d('robot',0xeeeef0,{head:'helmet',accent:0x3b82d6,accent2:0x5fd0ff,limbs:0xe2e2e6,paws:0x3b82d6,feet:0xd9dce2,extras:['chest-light#5fd0ff']}),
 'clockwork-toy':d('robot',0xa8622e,{headColour:0xb86b33,accent2:0xd9a441,paws:0x7a4420,feet:0x7a4420,ears:'none',extras:['wind-key#d9a441','gear#d9a441']}),
 'wooden-robot':d('robot',0xc9853f,{headColour:0xd8914a,accent2:0x7e4f25,ears:'small',earColour:0x9a5e2a,earInner:0x7e4f25,paws:0x9a5e2a,feet:0x7e4f25,iris:0x3a5a1e,extras:['sprout#6f9a3c','leaf-body#6f9a3c']}),
 'unicorn-robot':d('robot',0xd9b9e6,{headColour:0xe6ccef,ears:'pointy',earScale:.8,earInner:0xf2d9f6,accent2:0xb98dd6,paws:0xb98dd6,feet:0xb98dd6,iris:0x7a4ab0,tail:'bushy',tailColour:0xa46fd6,tailScale:.8,extras:['horn#f0c75a','pony-mane#a46fd6']}),
 'snow-robot':d('robot',0xe7eef6,{head:'visor',headColour:0xeef4fa,accent:0x6aa5de,accent2:0xf8fbfd,limbs:0xdde8f2,paws:0x6aa5de,feet:0x9fc4e8,iris:0x3a6ab0,extras:['flake-emblem#6aa5de','chest-light#8fd8ff']}),
 'lighthouse-robot':d('robot',0xf1e6d6,{head:'lighthouse',headColour:0xf4ead8,accent:0xc9423a,accent2:0x8a8f96,limbs:0xe8dccb,paws:0xc9423a,feet:0xc9423a,extras:['body-stripes#c9423a']}),
 'glass-robot':d('robot',0xd7d9ee,{head:'gem',headColour:0xe4d8f0,accent2:0xe6c46a,limbs:0xcfd3ea,paws:0xb9a6e8,feet:0xb9a6e8,iris:0x6a4ab0,extras:['crystal-body#bfe3f2']}),
 'fountain-pen-robot':d('robot',0xe9e6e2,{head:'nib',headColour:0xcfd3d8,accent2:0x6a7078,limbs:0x9aa0a8,paws:0x6a7078,feet:0x6a7078}),
 'quilt-robot':d('robot',0xefd9c3,{head:'visor',headColour:0xf1ddc6,accent:0x537d9f,accent2:0xf6e6d6,paws:0xc78e5c,feet:0x537d9f,extras:['patches']}),
 'dice-robot':d('robot',0xf3efe9,{head:'dice',headColour:0xf8f5f0,accent:0x2c4a86,accent2:0x2c4a86,limbs:0xe9e5e0,paws:0x2c4a86,feet:0x2c4a86}),
 'stained-glass-robot':d('robot',0x2c5aa8,{head:'visor',headColour:0x3a6fc2,accent:0xe0b84a,accent2:0xf2e6c2,paws:0xe0b84a,feet:0x1f4f9c,extras:['mosaic','chest-light#46b3d9']}),
 'kitchen-robot':d('robot',0xe9e7df,{head:'kettle',headColour:0x4fd3d2,accent:0xe9ecea,accent2:0x2a3e3c,limbs:0x3fbcba,paws:0x3fbcba,feet:0x3fbcba}),
 'ceramic-robot':d('robot',0x1a64d6,{head:'visor',headColour:0x1f6fe0,accent:0x0c3f9a,accent2:0xeef2f7,paws:0x0c3f9a,feet:0x0c3f9a,extras:['chest-light#9fd4ff']}),
 // ---- Sprites and wonders ----
 'star-sprite':d('sprite',0xf4eaa8,{head:'star',headColour:0xf8d24a,iris:0x3a6fb0,extras:['comet-trail#fbe7a0']}),
 'moon-sprite':d('sprite',0xf5ead2,{head:'moon',headColour:0xf7ecd0,iris:0x4a5aa8,extras:['star-dots#e9c46a']}),
 'sun-sprite':d('sprite',0xf8bf3c,{head:'sun',headColour:0xf9c63f,accent:0xf08a1f}),
 'cloud-sprite':d('sprite',0xeef2fa,{finish:'fur',head:'cloud',headColour:0xf6f7fb,iris:0x3a5aa0,extras:['puffs#f3f6fb']}),
 'raindrop-sprite':d('sprite',0x4aa8f0,{finish:'plastic',head:'drop',headColour:0x5ab4f6,iris:0x1f3f7a,blush:false}),
 'snowflake-sprite':d('sprite',0xd8ecfa,{head:'snowflake',headColour:0xe6f3fc,accent:0xbfe3fb,iris:0x4a6fb0}),
 'opal-sprite':d('sprite',0xdcd6ee,{head:'crystal',headColour:0xe6e2f4,accent:0xc9b8f2,accent2:0xb6e5f2,iris:0x6a4ab0}),
 'crystal-golem':d('sprite',0xef93aa,{finish:'plastic',head:'crystal',headColour:0xf2a6b9,accent:0xf7c3d0,accent2:0xe9849b,iris:0x8a2a4a,extras:['crystal-body#f7b8c8']}),
 'pebble-golem':d('sprite',0x807771,{finish:'fur',head:'rock',headColour:0x8a817b,accent:0x6f8a3c,limbs:0x736a64,iris:0x3a2a1e,extras:['moss#6f8a3c']}),
 'forest-sprite':d('sprite',0x8aa54a,{headColour:0xa9c05c,iris:0x3a5a1e,extras:['leaves#6b9b3c','leaf-body#5c7f30']}),
 'flower-sprite':d('sprite',0x8faa45,{head:'flower',headColour:0xf8d9b8,accent:0xf27c95,iris:0x5a3a2a}),
 'mushroom-sprite':d('sprite',0xefd6c1,{head:'mushroom',headColour:0xf2dcc8,accent:0xd3352c,iris:0x5a3a2a}),
 griffin:d('bird',0x7f553b,{headColour:0xf1e4d6,muzzle:'hook',muzzleColour:0xf2b640,ears:'tuft',earColour:0xf1e4d6,earInner:0xe5d3c1,limbs:0x6b4530,accent:0x4f3222,feet:0xf2b640,tail:'tuft',iris:0x8a5a1e,extras:['wings#8a6040']}),
 'friendly-yeti':d('animal',0x9ec3ea,{belly:0xd2e2f2,muzzle:'none',mouth:'grin',ears:'small',earInner:0x6f9ac8,paws:0x7fa6d6,iris:0x2a4a8a,extras:['head-fluff#b7d3ef','fluff#a9caec','small-horns#e8eef6']}),
 'fluffy-monster':d('animal',0xa9c23f,{belly:0xd9e08a,muzzle:'none',mouth:'grin',ears:'none',iris:0x3a2a1e,extras:['head-fluff#b8d052','fluff#b2cb48','small-horns#f0ecd0']}),
 alien:d('sprite',0x9a62d9,{headColour:0xa66ee3,belly:0xd9bff2,ears:'pointy',earScale:.7,earInner:0xc9a3ef,iris:0x3a1a5a,eyeScale:1.15,extras:['antennae#7a45b8']}),
 'teal-alien':d('sprite',0x4fc4c0,{headColour:0x5ccfca,belly:0xc0ece0,ears:'pointy',earScale:1.1,earColour:0x3fb0ad,earInner:0x9fe6de,iris:0x0f3a4a,eyeScale:1.1,extras:['antenna#2f9a96']}),
 'seedling-sprite':d('sprite',0xb8c46a,{headColour:0xeed7a8,iris:0x4a5a1e,extras:['sprout#6f9a2c']}),
 guardian:d('sprite',0x857a5c,{finish:'fur',head:'rock',headColour:0x9b8f73,accent:0x6f8a3c,iris:0x3a4a1e,extras:['moss#6f8a3c','spiral#b8cf7a']}),
 // ---- Playthings ----
 'wooden-puppet':d('toy',0xc98a52,{head:'puppet',headColour:0xdca06a,accent:0x6b3f22,iris:0x4a2a1a}),
 'pencil-pal':d('toy',0xf7c233,{head:'pencil',headColour:0xf9c93c}),
 'crayon-pal':d('toy',0xa35ee0,{head:'crayon',headColour:0xae68ea,iris:0x3a1a4a}),
 'book-pal':d('toy',0xf1e3cf,{head:'book',headColour:0xa8462a}),
 'chalk-pal':d('toy',0xf2efea,{finish:'fur',head:'chalk',headColour:0xf6f3ef}),
 'patchwork-bear':d('animal',0xb77a4f,{belly:0xe8d2b6,muzzle:'round',muzzleColour:0xe8d2b6,ears:'round',earInner:0xd9b48c,tail:'stub',extras:['patches','stitches']}),
 'fabric-rabbit':d('animal',0xeee1d2,{belly:0xf8efe4,muzzle:'cat',muzzleColour:0xf8efe4,nose:0xd98a8a,ears:'long',earInner:0xe9a9a6,eyes:'button',tail:'stub',extras:['stitches']}),
 'yo-yo-pal':d('toy',0xc7753a,{head:'yoyo',headColour:0xd98a45}),
 'domino-pal':d('toy',0xf3ece2,{head:'domino',headColour:0xf8f2e8}),
 'jigsaw-pal':d('toy',0xf9bf1c,{head:'jigsaw',headColour:0xfbc624}),
 'toy-train-pal':d('toy',0xd21f17,{head:'train',headColour:0xd9261c,accent:0xf2c14e,feet:0x2d2a2c}),
 'toy-boat-pal':d('toy',0xf1e6d8,{head:'boat',headColour:0xf8f3ec,accent:0xc93a33,accent2:0x1f3f6b}),
 'toy-rocket-pal':d('toy',0xf1ebe3,{head:'rocket',headColour:0xf6f1ea,accent:0xd9262a,feet:0xd9262a}),
 'bell-pal':d('toy',0xd9a13c,{head:'bell',headColour:0xe0b14a}),
 'drum-pal':d('toy',0xc91c1c,{head:'drum',headColour:0xd02222}),
 'music-sprite':d('sprite',0x1f9cf6,{finish:'plastic',head:'note',headColour:0x2aa4f8}),
 'backpack-pal':d('toy',0x1d8cf0,{head:'backpack',headColour:0x2596f5}),
 'pumpkin-sprite':d('sprite',0xf27a12,{head:'pumpkin',headColour:0xf5821a}),
 'strawberry-sprite':d('sprite',0xe0322b,{finish:'plastic',head:'strawberry',headColour:0xe63a30,iris:0x3f7a2a}),
 'orange-sprite':d('sprite',0xf7880f,{finish:'plastic',head:'orange',headColour:0xfb8f16}),
 'coconut-sprite':d('sprite',0x6f3a1c,{finish:'fur',head:'coconut',headColour:0x9a5a33}),
 'pepper-sprite':d('sprite',0xe0241a,{finish:'plastic',head:'pepper',headColour:0xe82a1c}),
 'waffle-pal':d('toy',0xf2ab4a,{finish:'fur',head:'waffle',headColour:0xf4b857}),
 'rice-cake-sprite':d('sprite',0xefe6dd,{head:'mochi',headColour:0xf6efe8}),
 'pretzel-pal':d('toy',0xc9661e,{finish:'fur',head:'pretzel',headColour:0xd2722a}),
 'plush-bat':d('animal',0x6a3f8e,{belly:0xb487c4,muzzle:'none',mouth:'fangs',ears:'huge',earInner:0xb487c4,iris:0x3a1a4a,extras:['bat-wings#7f4fa6']}),
 'candy-sprite':d('sprite',0xf6d6df,{finish:'plastic',head:'candy',headColour:0xfbeef2,accent:0xf29bb6,accent2:0x9cc8ec,iris:0x5a3a8a}),
 'dandelion-sprite':d('sprite',0xa9b43c,{head:'dandelion',headColour:0xf0e6c6,accent:0xf6f2ea,iris:0x4a5a1e}),
};
/** Chubby animal defaults for any skin not listed, so every hero still gets a friendly face. */
export function heroDesign(skin:string,fallback:number):HeroDesign{return HERO_DESIGNS[skin]??d('animal',fallback,{belly:CREAM,muzzle:'round',ears:'round',earInner:PINK,tail:'stub'});}
