// Word lists written for the Verbal reasoning bank (lib/bank-vr*.ts). They are plain everyday English words, British
// spelling, with no proper nouns. Templates draw words from them, and tests/bank-vr.cjs uses them to re-check word
// puzzles independently (a hidden word must be the only listed word across a boundary, ladder steps must be words …).
// Add words freely; never remove a word that a question uses.
const split=(s:string)=>s.trim().split(/\s+/).map(w=>w.toLowerCase());

/** Two-letter words, so that small words in compound puzzles (cab + in) are listed too. */
export const WORDS2=split(`am an as at be by do go he if in is it me my no of oh on or ox so to up us we`);

export const WORDS3=split(`
ace act add ado age ago aid aim air ale all and ant any ape apt arc are ark arm art ash ask ate awe axe
bad bag ban bar bat bay bed bee beg bet bib bid big bin bit boa bob bog boo bow box boy bud bug bun bus but buy bye
cab can cap car cat cod cog cot cow coy cry cub cue cup cut
dab dad dam day den dew did die dig dim din dip doe dog don dot dry dub due dug duo dye
ear eat ebb eel egg ego elf elk elm emu end era eve ewe eye
fad fan far fat fax fed fee few fib fig fin fir fit fix flu fly foe fog for fox fry fun fur
gag gap gas gel gem get gig gin gnu god got gum gun gut guy gym
had ham has hat hay hem hen her hid him hip his hit hob hoe hog hop hot how hub hue hug hum hut
ice icy ill imp ink inn ion its ivy
jab jam jar jaw jay jet jig job jog jot joy jug jut
keg key kid kin kit
lab lad lag lap law lay led leg let lid lie lip lit lob log lot low
mad man map mat may men met mid mix mob mop mow mud mug mum
nab nag nap net new nib nil nip nod nor not now nun nut
oak oar oat odd ode off oil old one opt orb ore our out owe owl own
pad pal pan par pat paw pay pea peg pen pet pie pig pin pip pit ply pod pop pot pry pub pun pup put
rag ram ran rap rat raw ray red rib rid rig rim rip rob rod roe rot row rub rug rum run rut rye
sad sag sap sat saw say sea see set sew she shy sin sip sir sit six ski sky sly sob sod son sow soy spa spy sty sub sum sun
tab tag tan tap tar tax tea tee ten the tie tin tip toe ton too top tot tow toy try tub tug two
urn use van vat vet vex via vie vow
wag war was wax way web wed wee wet who why wig win wit woe wok won woo wow
yak yam yap yes yet yew you zap zip zoo
`);

export const WORDS4=split(`
able ache acid acre acts aged ages aids aims airs airy ajar akin alas ally also alto amid ants anew apes apex arch arcs area arid arms army arts atom atop aunt auto avid away awed awes axed axes axis axle
babe baby back bade bags bail bait bake bald bale ball balm band bang bank bans bare bark barn bars base bash bask bath bats bawl bays bead beak beam bean bear beat beds beef been beep bees beet begs bell belt bend bent best bets bias bibs bide bids bike bill bind bins bird bite bits blew blip blob blot blow blue blur boar boat bobs body boil bold bolt bond bone bony book boom boot bore born boss both bout bowl bows boys brag bran bray brew brim brow buck buds buff bugs bulb bulk bull bump buns buoy burn burp bury bush bust busy butt buys buzz
cabs cafe cage cake calf call calm came camp cane cans cape caps card care cart case cash cast cats cave cell cent chap chat chef chew chin chip chop chum cite city clad clam clan clap claw clay clip clog clot club clue coal coat coax cobs code coil coin cola cold colt comb come cone cook cool coop cope cops copy cord core cork corn cost cosy cots cove cows crab crew crib crop crow cube cubs cuff cups curb curd cure curl cute cuts
dabs dads daft dale dame damp dams dare dark darn dart dash data date dawn days daze dead deaf deal dear debt deck deed deep deer dens dent deny desk dews dial dice died dies diet digs dill dime dine dips dire dirt disc dish dive dock does dogs doll dome done doom door dose dots dove down doze drab drag draw drew drip drop drum dual duck duct duel dues duet dull duly dumb dump dune dunk dusk dust duty dyed dyes
each earn ears ease east easy eats ebbs echo edge edgy edit eels eggs else emit ends envy epic even ever evil ewes exam exit eyed eyes
face fact fade fail fair fake fall fame fang fans fare farm fast fate fawn fear feat feed feel fees feet fell felt fern feud figs file fill film find fine fins fire firm fish fist fits five fizz flag flap flat flaw flea fled flee flew flex flip flit flop flow foal foam foes fogs foil fold folk fond font food fool foot ford fore fork form fort foul four fowl foxy fray free fret frog from fuel full fume fund fury fuse fuss
gain gale game gang gape gaps gash gasp gate gave gaze gear gems gene germ gets gift gill girl gist give glad glee glen glow glue glum gnat gnaw goal goat goes gold golf gone gong good gown grab gram gran grew grey grid grim grin grip grit grow grub gulf gull gulp gums gush gust guys
hail hair half hall halo halt hams hand hang hard hare harm harp hash hate hats haul have hawk haze hazy head heal heap hear heat heed heel heir held help hems hens herb herd here hero hers hide high hike hill hilt hind hint hips hire hiss hits hive hoax hobs hold hole holy home hood hoof hook hoop hoot hope hops horn hose host hour howl hubs huge hugs hull hump hums hung hunk hunt hurl hurt hush husk huts hymn
ices icon idea idle idly idol inch inks inky inns into ions iris iron isle itch item
jabs jack jade jail jams jars jaws jays jazz jeer jerk jest jets jobs jogs join joke jolt jots joys judo jugs jump junk jury just
keel keen keep kegs kelp kept kerb keys kick kids kind king kiss kite kits kiwi knee knew knit knob knot know
lace lack lacy lads lady laid lain lair lake lamb lame lamp land lane laps lard lark lash last late lava lawn laws lays lazy lead leaf leak lean leap left legs lend lens lent less lest lets liar lice lick lids lied lies life lift like lily limb lime limp line link lion lips list live load loaf loan lobe lock loft logo logs lone long look loom loop loot lord lose loss lost lots loud love lows luck lull lump lung lure lurk lush
made maid mail main make male mall mane many maps mare mark mash mask mass mast mate maze meal mean meat meek meet melt memo mend menu mere mesh mess mice mild mile milk mill mime mind mine mint mist mite mitt moan moat mobs mock mode mole monk mood moon moor mops more moss most moth move mown mows much muck mugs mule mums mush must mute
nags nail name nape naps navy near neat neck need neon nest nets news newt next nibs nice nine nips node nods none nook noon norm nose nosy note noun nuts
oafs oaks oars oath oats obey odds odes ogre oils oily okay omen omit once ones only onto ooze opal open opts oral orbs ores ours oust outs oval oven over owed owes owls owns
pace pack pact pads page paid pail pain pair pale palm pals pane pans pant park part pass past path pats pave pawn paws pays peak peal pear peas peat peck peel peep peer pegs pelt pens perk pest pets pick pier pies pigs pike pile pill pine pink pins pint pipe pips pits pity plan play plea plod plop plot ploy plug plum plus pods poem poet poke pole poll pond pony pool poor pops pore pork port pose posh post pots pour pout pram pray prey prod prop puff pull pulp pump punk puns pups pure purr push puts
quay quiz quit quip
race rack raft rage rags raid rail rain rake ramp rams rang rank rant rare rash rate rats rave rays read real reap rear reed reef reek reel rein rely rent rest ribs rice rich ride rift rigs rind ring rink riot ripe rips rise risk road roam roar robe robs rock rode rods role roll roof rook room root rope rose rosy rota rows rubs ruby rude rugs ruin rule rung runs rush rust ruts
sack safe saga sage said sail sake sale salt same sand sane sang sank saps save saws says scab scan scar seal seam seas seat seed seek seem seen seep sees self sell send sent sets sewn sews shed shin ship shoe shoo shop shot show shut sick side sigh sign silk sill sing sink sins sips site sits size skid skim skin skip skis slab slam slap slat sled slid slim slip slit slot slow slug slum smug snag snap snip snob snow snug soak soap soar sobs sock soda sofa soft soil sold sole solo some song sons soon soot sore sort soul soup sour sown sows soya span spat sped spin spit spot spun spur stab stag star stay stem step stew stir stop stow stub stud stun such suit sulk sums sung sunk suns sure surf swam swan swap sway swim swum
tabs tack tact tags tail take tale talk tall tame tank tans tape taps tart task taxi teak teal team tear teas teen tees tell tend tens tent term tern test text than that thaw them then they thin this thud thus tick tide tidy tied tier ties tile till tilt time tins tint tiny tips toad toes tofu told toll tomb tone tons took tool tops tore torn toss tour town toys tram trap tray tree trek trim trio trip trod trot true tuba tube tubs tuck tuft tugs tuna tune turf turn tusk twig twin type tyre
ugly undo unit upon urge urns used user uses
vain vane vary vase vast vats veal veer veil vein vent verb very vest veto vets vial vice view vine visa void vole volt vote vows
wade wage wags wail wait wake walk wall wand want ward warm warn warp wars wart wary wash wasp wave wavy waxy ways weak wear webs weed week weep weld well went wept were west wets what when whim whip wick wide wife wigs wild will wilt wily wind wine wing wink wins wipe wire wise wish wisp with wits woke wolf wood wool word wore work worm worn wove wrap wren
yard yarn yawn year yell yelp yeti yoga yolk your yowl zany zeal zero zest zinc zips zone zoom zoos
`);

export const WORDS5=split(`
about above ached aches acorn acres acted actor adapt added adopt adult after again agent agile agree ahead aimed aisle alarm album alert alien alike alive alley allow alone along aloud alter amaze amber amble among ample amuse angel anger angle angry ankle annoy anvil apart apple apply apron arena argue arise armed aroma arose arrow ashes aside asked atlas attic avoid awake award aware awful
bacon badge badly baked baker bakes balls bands banjo banks barge barks barns basic basin batch bathe baths beach beads beaks beams beans beard bears beast beats beech began begin begun being belly below bench berry bikes bills birch birds birth black blade blame bland blank blast blaze bleak bleat blend bless blind blink block blond bloom blown blows blues blunt blush board boast boats boils bolts bones bonus books boost booth boots bored bossy bound bowed bowls boxed boxer boxes brace braid brain brake brand brass brave bread break breed brick bride brief bring brink brisk broad broke brook broom broth brown brush build built bulge bulky bumps bumpy bunch burnt burst buses bushy
cabin cable cadet cakes calls camel camps canal candy canoe cards cared cares cargo carol carry carts carve cases catch cause caves cedar cells cents chain chair chalk champ chant charm chart chase cheap cheat check cheek cheer chess chest chick chief child chill chimp chips chirp choir choke chord chore chose chunk cider civic claim clamp clang clash clasp class claws clean clear clerk click cliff climb cling cloak clock close cloth cloud clown clubs clues clump clung coach coals coast coats cobra cocoa coins colts comet comic comma cones coral cords corks corns couch cough could count court cover crabs crack craft cramp crane crash crate crawl crazy creak cream creek creep crept crest crews cried cries crisp croak crops cross crowd crown crows crude cruel crumb crush crust cubes cuffs cured curls curly curry curve cycle
daily dairy daisy dance dared dares darts dated dates deals dealt death decay decks deeds delay dense dents depth desks diary diced diner dirty ditch diver dives dizzy dodge doing dolls donor doors dough dozen draft drain drake drama drank drape drawn draws dread dream dress dried dries drift drill drink drips drive drone droop drops drove drown drums dryer ducks duels duets dunes dusty duvet dwarf dwell
eager eagle early earns earth eased easel eaten eaves eerie eight elbow elder elves email ember empty ended enemy enjoy enter entry equal erase error essay event every exact exams exist exits extra
fable faced faces facts faded fades fails faint fairs fairy faith falls false fancy fangs farms fault feast feeds feels fence ferns ferry fetch fever fewer fibre field fiery fifth fifty fight filed files fills films final finch finds fined finer fines fired fires first fishy fists fixed fixes fizzy flags flake flaky flame flaps flare flash flask flats flaws fleas fleet flick flies fling flint flips float flock flood floor flour flown flows fluff fluid flung flush flute foals foams foggy folds folks foods fools force forge forks forms forth forty found fours foxes frame frank freed fresh fried fries frill frogs front frost froth frown froze fruit fudge fuels fully fumes funds funny furry fussy fuzzy
gains gales games gangs gasps gates gauge gazed gears geese genie ghost giant gifts giddy gills girls given gives glade glare glass glaze gleam glide glint globe gloom glory gloss glove glows glued glues gnome goals goats going goods goose gorge gowns grace grade grain grand grant grape graph grasp grass grate grave gravy graze great greed green greet grief grill grind grins grips groan groom group grove growl grown grows gruff grunt guard guess guest guide guilt gulls gusty
habit hairs hairy halls halts hands handy hangs happy hardy harsh hasty hatch hated hates haunt hawks hazel heads heals heaps heard hears heart heath heavy hedge heels hefty hello helps hence herbs herds heron hides hikes hills hilly hinge hints hippo hired hitch hives hoard hobby hoist holds holes holly homes honey hoods hooks hoops hoots hoped hopes horns horse hoses hosts hotel hound hours house hover howls human humid hunch hunts hurry hurts husky hutch
icing icons ideal ideas idles igloo image index inked inner input irons issue itchy items ivory
jeans jeers jelly jerks jewel joins joint joked joker jokes jolly judge juice juicy jumbo jumps jumpy
kayak keeps kicks kinds kings kiosk kites kitty knack knead kneel knees knelt knife knits knobs knock knots known knows koala
label laced laces lacks ladle lakes lambs lamps lands lanes lanky lapse large larks laser lasso lasts latch later laugh layer leads leafy leaks leaky leans leapt learn lease leash least leave ledge leeks legal lemon lends level lever liars lifts light liked likes lilac limbs limes limit lined linen liner lines links lions lists lived liver lives llama loads loans lobby local locks lodge lofty logic looks loops loose lords lorry loser loses loved lover loves lower loyal lucky lumps lumpy lunar lunch lungs lured lying
magic maids major maker makes males mango manor maple march marks marsh masks match mated mates maths maybe mayor meals means meant meats medal meets melon melts mends mercy merry messy metal metre might milky mills mince minds miner mines minor mints minus misty mixed mixer mixes moans model moist money monks month moods moody moons moose moral mossy moths motor motto mould mound mount mouse mouth moved moves movie mowed mower muddy mules mummy munch mural music
nails named names nanny nasty naval nears necks needs needy nerve nests never newer newly newts nicer niece night ninth noble noise noisy north noses notch noted notes novel nudge nurse nutty
oasis oaths obeys ocean odour offer often oiled older olive onion onset opens opera orbit order organ other otter ought ounce outer ovals ovens owner
paced paces packs pages pails pains paint pairs palms panel panes panic pansy pants paper parks parts party pasta paste patch paths patio pause paved peace peach peaks pearl pears pecks pedal peels peeps pence penny perch pesky pests petal phone photo piano picks piece piers piled piles pills pilot pinch pines pints piped pipes pitch pizza place plain plait plane plank plans plant plate plays plead pleat plots plugs plump plums poach poems poets point poked poker pokes polar poles ponds pools poppy porch posed poses posts pouch pound pours power prank prawn prays press price pride prime print prize probe proof props proud prove prowl prune puffs pulls pulse pumps punch pupil puppy purse
quack quail quake queen query quest queue quick quiet quill quilt quite quits quota quote
races racks radar radio rafts raged rails rains rainy raise raked rakes rally ranch range ranks rapid rated rates raven reach react reads ready realm reeds reefs reels relax relay reply rests rhino rhyme rider rides ridge rifle right rigid rinse ripen risen rises risky rival river roads roams roars roast robes robin robot rocks rocky rodeo roles rolls roofs rooks rooms roost roots roped ropes roses rough round route rowdy rowed royal rugby ruins ruled ruler rules rural rusty
sadly safer sails saint salad sales salon salty sands sandy sauce saved saves scale scalp scare scarf scars scary scene scent scone scoop scope score scout scrap screw scrub seals seats seeds seeks seems sells sends sense serve seven sewed shade shady shake shaky shall shame shape share shark sharp shave shawl sheds sheep sheet shelf shell shine shiny ships shirt shock shoes shone shook shoot shops shore short shots shout shove shown shows shred shrub shrug sides siege sieve sight signs silky silly since sings sinks siren sixth sixty sized sizes skate skier skies skill skins skips skirt skull slabs slams slant slaps slate sleek sleep sleet slept slice slide slime slimy sling slips slope slots sloth slows slugs slump smack small smart smash smell smile smock smoke smoky snack snail snake snaps snare sneak sniff snore snout snowy soaks soaps soapy soars sober socks sofas soggy soils solar soles solid solve sorry sorts sound soups south space spade spare spark speak spear speck speed spell spend spent spice spicy spied spies spike spiky spill spine spins spite split spoil spoke spoon sport spots spout spray squad squid stack staff stage stain stair stake stale stalk stall stamp stand stare stars start state stays steak steal steam steel steep steer stems steps stern stews stick stiff still sting stink stirs stock stole stone stony stood stool stoop stops store stork storm story stove straw stray strip stuck study stuff stump stung style sugar suits sunny super swamp swans swaps swarm sways sweat sweep sweet swell swept swift swims swing swirl sword swore swung syrup
table tails taken takes tales talks tamed tanks taped tapes tarts taste tasty teach teams tears tease teeth tells tempo tends tense tenth tents terms tests thank thaws their theme there these thick thief thigh thing think third thorn those three threw throw thumb tidal tides tiger tight tiled tiles tilts timed timer times timid tired title toads toast today token tones tongs tools tooth topic torch total touch tough tours towel tower towns trace track trade trail train tramp trams traps trays treat trees trend trial tribe trick tried tries trims trips troll troop trots trout truck truly trunk trust truth tubes tulip tummy tunes turns tusks tutor tweet twice twigs twins twirl twist types
uncle under undid unfit union unite units unity untie until upper upset urban urged urges usage using usual
vague valid value valve vases vault veins venom verbs verse video views villa vines viola visit vital vivid vocal voice voles vowel
wafer wages wagon waist waits wakes walks walls waltz wands wants warms warns wasps waste watch water waved waves waxed weary weave wedge weeds weeks weigh weird wells whale wheat wheel where which while whine whips whirl whisk white whole whose widen wider width winds windy wines wings winks wiped wipes wired wires wiser witch witty wives woken woman women woods woody words works world worms worry worse worst worth would wound woven wraps wreck wrens wrist write wrong wrote
yacht yards yarns yawns years yeast yells yelps yield young yours youth zebra zeros zones
`);

export const WORDS6=split(`
absent accept across acting action active actual advice afraid almost always amount animal answer anyone appear arcade arctic around arrive arrows artist asleep attach attack attend autumn avenue awards
badger baking banana banner barely barrel basket battle beaker beauty became become before begins behave behind belong beside better beware beyond bigger bitter blazer blinds blocks blouse boards bodies boiled bonnet border boring borrow bottle bottom bought bounce branch breath breeze bricks bridge bright broken bronze bubble bucket budget bundle burrow butter button buying
cabins cactus camera camels candle cannon canvas carpet carrot castle cattle caught cellar centre cereal chains chairs chance change charge cheese cheeky cheers cherry chilli chilly choice choose chorus chosen church cinema circle circus clever cliffs climbs closed closer clouds cloudy clover clumsy coarse coffee collar colour column comedy coming common copper corner cotton county couple course cousin covers cradle crayon create crisps crispy crowds crumbs crunch cuddle custom cycled cycles
damage dancer dances danger daring darker dazzle debate decide defend degree demand depend desert design detail device dinner direct divide doctor dollar donkey double dragon drawer dreamt driver during duster
eagles easier easily eating editor effect effort eighth eighty either eleven emerge empire enable ending energy engine enjoys enough entire errand errors escape events excuse expect expert extend
fabric facing fading failed fairly fallen family famous farmer fasten father favour feared fellow female fences fiddle fields fierce figure filled filter finest finger finish firmly fishes flakes flames flight floats flocks floods floors flower flying folder follow forest forget forgot formal former fossil fought fourth frames freely freeze fridge friend fright fringe frosty frozen fruity fumble fungus funnel future
gadget galaxy gallon garage garden garlic gather gazing gentle gently gerbil giants giggle ginger glance glassy global gloomy glossy gloves golden gossip grades grains grapes grassy gravel greasy greedy ground groups growth grumpy guards guests guided guitar gutter
habits halves hamlet hammer hamper handle hanger happen harder hardly having hazard health hearty heater heaven hedges height helmet helper hermit heroes hidden hiking hinder hoping horses hotels hounds hourly humble humour hunger hungry hunter hurdle hurray hushed
icicle ignore images impact import indeed indoor infant inform injury insect inside insist intend invent invite island itself
jacket jaguar jersey jester jigsaw jingle jockey joined joyful judged juggle jumble jumped jumper jungle junior
kennel kettle kicked kindly kitten knight knives
ladder ladies lagoon laptop larder lately latest launch leader league leaned learnt leaves legend lemons length lesson letter levels likely liking limits liquid listen litter little lively living lizard loaded locate locked locker locket lonely longer looked loosen lovely loving lowest
magnet mainly making mammal manage manner marble margin marked market marrow marvel mascot master matter meadow medals medium mellow melody melted member memory method middle mighty minute mirror misses mitten mobile modern modest moment monkey months mostly mother motion mouldy muddle muffin mumble murmur muscle museum mutter myself
napkin narrow nation native nature nearby nearly neatly needle nephew nerves nettle newest nicely nimble nobody noodle normal notice number nutmeg
object oceans office oldest onions online opener option orange orbits orchid orders others outfit outing oyster
packed packet paddle palace pantry papers parade parcel pardon parent parrot partly pastry patrol paying peanut pebble pedals peeled pencil people pepper period permit person petals petrol phrase pickle picnic pieces pigeon piglet pillar pillow pirate placed plains planet plants player please plenty pliers pocket poetry polish polite pollen ponder poodle poster potato potion pounce poured powder praise prefer pretty prince proper public puddle puffin punish puppet purple puzzle
rabbit racing racket radish raffle rained raisin ramble random ranger rarely rascal rather rattle reader really reason recent recipe record reduce refuse region reject relief remain remind remote remove repair repeat report rescue result return reveal reward rhymes ribbon riddle ripple rising rivers robins rocket rotten rubber rudder rugged rumble runner rustle
saddle safely safety sailor salads salmon sample sandal saucer saving saying scarce scared scenes school scream screen scroll search season second secret secure select settle shadow shaggy shaken shared shield shiver should shovel showed shower shrimp shrink shrubs signal silent silver simple simply singer single sister skater sketch skills sledge sleepy sleeve slight slowly smiled smooth smudge snacks snails snakes sneeze snooze socket soften softly solved sooner sorted source sparks speech speedy sphere spider spirit splash spoken sponge sports spotty spread spring sprint sprout square squash squeak stable stamps staple stared starry statue steady sticky stitch stolen stones strand stream street strict stripe stroke strong struck studio sturdy sudden summer summit supper supply switch symbol
tablet tackle tailor talent talked taller tangle target teapot temper tender tennis thanks theory thirst thirty thorny though thread thrill throat throne ticket tickle timber tinsel tissue toffee tomato tongue topple toucan towels towers trains tricky trophy trowel tumble tunnel turkey turnip turtle twelve twenty
umpire unable unfair unfold unique unkind unless unlock unpack untidy unwell update uphill upside useful
vacant valley vanish velvet violet violin vision visits volume voyage
waited waiter walked walker wallet walnut walrus wander wanted warden warmer warmly washed wasted waters waving weasel weekly weight wicked widely wiggle willow window winner winter wisdom wizard wobble wobbly wonder wooden woolly worker wreath writer
yellow yelled zigzag zipper
`);

/** Longer words that puzzles use (missing letters, compound words, anagrams). */
export const LONG_WORDS=split(`
playground wardrobe kitchen fridge orange strawberry sandwich platform feather painting butterfly scarecrow snowman cupboard village cottage harbour harvest
pancake rainbow notice piglet budget legend season rather bargain cabin fortune hidden tenant cotton passage pumpkin starfish hedgehog keyhole mushroom manage
leek kilo taco lemur miles dusky buddy strain freezer daughter
garden gander ranged danger ocean canoe listen silent tinsel enlist melon lemon shore horse thorn north brush shrub stream master remote meteor
friend finder elbow below bowel study dusty south shout diary dairy leaf flea night thing heart earth teach cheat
`);

/** Everyday closed compound words (two whole words joined), used to check compound-word questions. */
export const COMPOUNDS=split(`
rainbow raincoat raindrop rainfall snowman snowball snowflake snowfall sunflower sunshine sunlight sunset sunrise sunbeam moonlight moonbeam starlight starfish
football handball baseball netball eyeball footprint handprint fingerprint footstep headache toothache earache toothbrush toothpaste hairbrush eyebrow earring
butterfly dragonfly buttercup ladybird hedgehog seahorse jellyfish goldfish catfish bulldog greenhouse lighthouse farmhouse doghouse
cupboard keyhole doorbell doorstep doormat bedroom classroom bathroom playground playtime homework housework firework fireplace fireman
pancake cupcake teapot teacup egghead milkshake breadcrumb breadbin notebook bookcase bookshop bookmark postman postbox letterbox mailbox
carpet notice manage piglet budget legend season rather bargain cabin fortune hidden tenant cotton passage pumpkin mushroom cargo ambush button
earthquake windmill windpipe weekend birthday daylight nightfall grandfather grandmother something someone everyone anything nothing
`);

/** Less common four-letter words. Templates never use them; they only make the checks stricter (for example, that no
 * other word is hidden across a boundary in a hidden-word sentence). */
export const CHECK_WORDS4=split(`
abet ably acne adze aeon afar agog ahem ahoy ails aloe ammo anon ante aqua aria arty avow awry ayes barb bard bass bate beau beck beer berg bevy bier bile blab bled bloc boas bode bogs bole bong boon
boor bosh brad brat brie bunk burr busk byre cads cant carp cask cede char chic chit chug clef clod cloy coda coif coir coke coma conk coot corm crag cram crux cued cull cult cusp cyst dace dais dank
daub deem deft defy deli dell demo dewy dhow dike dint dirk dole dolt dons dory dote dour dram drat dray drub dude duff duke dung dupe earl ecru egad elan elks emir emus ergo ewer expo fain faun faze
fete fiat fief fife fink firs flab flak flan flax flay floe flog flue fobs fops frat funk furl fuzz gabs gaff gaga gaol garb gawk geek ghee gibe gild gilt gird girt glib glop glut goad goer gore gosh
gout grog guff gunk guru gybe hack haft hale hark hasp haws heft hemp hewn hock hoed hogs hone huff hula hulk ibex icky iffy imps iota irks jamb jape jell jibe jigs jilt jinx jive jock josh jowl jute
kale kiln kilo kilt kink kith kohl kook lade lags lank lase lass lath lave laze leek leer lees levy lieu lilt limo lint lira lisp lite loam loch loin loll loon lope lore lout lube luge lute lynx lyre
mace mach maim malt mart maul mead meld mewl mews mica mink mire moke molt moot mope mote moue muff mull murk muse musk muss mutt nabs nark nave neap nerd nick nigh nobs noel nope nosh nous nova nubs
null numb oast oboe ogle oink okra onus opus orca ouch ouzo oxen pall pang papa pare pate pawl peek perm pert pews pica ping pith pock polo pomp pong pooh posy prim prom prow puce puck pule puma punt
puny pupa putt quad quid raga rapt rasp raze ream rend rhea rick rife riff rile rill rime rite roan roil romp rood rote rout roux rove ruck rued rues ruff rump rune runt ruse rusk sago sari sash sate
scam scow scud sear sect seer semi sera serf shag sham shod shun sift silo silt sine sire skew skit slag slay slew slob sloe slog slop slur smog snub spam spar spay spec spew spry spud suck suds suet
sumo sump swab swag swat swig swot sync taco talc tamp tang tare tarn taro tarp taut teat teed teem temp thee thew thou thug tiff tine tire toed toff toga toil tome tong toot tort tosh tote tout tsar
tutu twee unto vale vamp vend vibe vile wadi waft waif wale wane ware watt wean weds weft weir welt wham whet whey whit whiz whoa whom wile wimp wino wiry woad woes wold womb wont woof woos writ yank
yaps yawl yeah yens yews yogi yoke yore yule yurt zaps zebu zing
`);

/** Every listed word, for quick lookups. */
export const LEXICON=new Set([...WORDS2,...WORDS3,...CHECK_WORDS4,...WORDS4,...WORDS5,...WORDS6,...LONG_WORDS,...COMPOUNDS]);
export const isWord=(w:string)=>LEXICON.has(w.toLowerCase());
