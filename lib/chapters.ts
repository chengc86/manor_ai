const manor='https://www.manorprep.org/';
const town='https://www.abingdon.gov.uk/places-to-visit';
const oxford='https://www.ox.ac.uk/about/visit-us/what-to-see';
export const CHAPTER_DETAILS=[
 ['The Manor Gates','Manor','Hold the entrance and welcome the hero squad.','The Manor is on Faringdon Road in Shippon, near Abingdon.',manor],
 ['The Three Dormers','Manor','Protect the familiar cream-coloured Manor House.','The main house has three dormer windows in its tiled roof.',manor],
 ['The Library Watch','Manor','Keep the story scrolls safe from the slimes.','The Manor has a school library.','https://www.manorprep.org/school-life/the-library/'],
 ['Forest School Guardians','Manor','Patrol the woodland edge together.','Forest School is part of life at The Manor.','https://www.manorprep.org/extra-curricular/forest-school/'],
 ['Eagles Take Flight','Manor','The blue banners lead the first house challenge.','Eagles is one of the four Manor houses; its colour is blue.',manor+'school-life/uniform/'],
 ['Hawks on Watch','Manor','Rally beneath the red banners.','Hawks is a Manor house represented by red.',manor+'school-life/uniform/'],
 ['Falcons of the Green','Manor','Stand together beneath the green banners.','Falcons is a Manor house represented by green.',manor+'school-life/uniform/'],
 ['Kestrels Shine','Manor','Protect the golden rally point.','Kestrels is a Manor house represented by yellow.',manor+'school-life/uniform/'],
 ['The Sports Kit Squad','Manor','Defend the playing-field boundary.','Manor sports kit combines bottle green and emerald.',manor+'school-life/uniform/'],
 ['All Houses Together','Manor','Unite the four houses for the campus boss.','The school stands in a nine-acre setting near Abingdon.',manor],
 ['Abingdon Market Watch','Abingdon','Guard the town-centre gathering place.','County Hall overlooks Abingdon Market Place.',town],
 ['County Hall Keepers','Abingdon','Protect the museum from a wave of curious slimes.','County Hall now houses the town museum.','https://www.abingdon.gov.uk/abingdon-county-hall-museum'],
 ['The Bun Throwing Beacon','Abingdon','Keep the celebration supplies safe.','Bun throwing from County Hall marks royal occasions.','https://www.abingdon.gov.uk/abingdon-county-hall-museum/about-the-museum'],
 ['Abbey Gardens Adventure','Abingdon','Hold the garden paths through the next wave.','Abbey Gardens is one of Abingdon’s places to explore.',town],
 ['Abbey Meadow Rally','Abingdon','Build a defence beside the meadow.','Abbey Meadow is part of the town’s riverside green space.',town],
 ['The Abbey Buildings','Abingdon','Guard the old stone doorways.','Surviving Abbey Buildings tell part of Abingdon’s history.',town],
 ['Abingdon Bridge Patrol','Abingdon','Stop the slimes at the crossing.','Abingdon Bridge was first built in 1416.','https://www.abingdon.gov.uk/abingdon_buildings/abingdon-bridge'],
 ['St Helen’s Wharf','Abingdon','Protect the riverside landing place.','St Helen’s Wharf sits beside the Thames.','https://www.abingdon.gov.uk/the-river-great-outdoors'],
 ['Where the Ock Meets the Thames','Abingdon','Hold the meeting point of the rivers.','The River Ock joins the Thames in Abingdon.','https://www.abingdon.gov.uk/feature-articles/abingdons-boundaries'],
 ['The Thames Guardians','Abingdon','Face the riverside boss together.','The Thames Path passes through Abingdon.','https://www.abingdon.gov.uk/the-river-great-outdoors'],
 ['Oxford’s Dreaming Spires','Oxford','Carry the Manor banner into the city.','Oxford is home to university libraries, museums and gardens.',oxford],
 ['The Bodleian Bookkeepers','Oxford','Keep the enchanted books in their reading rooms.','The Bodleian includes the Old Library, Weston Library and Radcliffe Camera.','https://visit.bodleian.ox.ac.uk/plan-your-visit/how-to-get-here'],
 ['Radcliffe Camera Watch','Oxford','Defend the famous domed landmark.','The Radcliffe Camera is a working library, not a camera shop.','https://bodreader.web.ox.ac.uk/libraries/radcliffe-camera'],
 ['The Weston Story Vault','Oxford','Protect the next chapter of the adventure.','The Weston Library stands on Broad Street.','https://visit.bodleian.ox.ac.uk/plan-your-visit/how-to-get-here'],
 ['Ashmolean Artefact Rescue','Oxford','Guard the gallery doors through an elite wave.','The Ashmolean is Oxford’s museum of art and archaeology.',oxford],
 ['Natural History Night Watch','Oxford','Keep the slimes away from the specimens.','Oxford’s Museum of Natural History houses natural-history collections.',oxford],
 ['Pitt Rivers Storykeepers','Oxford','Protect objects and the stories they carry.','The Pitt Rivers Museum holds collections from around the world.',oxford],
 ['The Botanic Garden Defence','Oxford','Protect the plants with a carefully placed squad.','Oxford Botanic Garden is the oldest botanic garden in Britain.',oxford],
 ['The Science Instrument Quest','Oxford','Guard the instruments before the final journey.','Oxford has a History of Science Museum.',oxford],
 ['Home to The Manor','Manor','Bring everything you have learned home for the final defence.','This adventure links real places with an imaginary monster story.',manor],
].map(([name,region,mission,fact,source])=>({name,region,mission,fact,source}));
export const CHAPTERS=CHAPTER_DETAILS.map(c=>c.name);
export function chapterFor(wave:number){const number=Math.floor((wave-1)/10)+1;return{...CHAPTER_DETAILS[Math.min(number-1,29)],number,name:CHAPTERS[number-1]??`Manor Legends ${number-30}`,stage:(wave-1)%10+1,boss:wave%10===0,elite:wave%10===5};}
