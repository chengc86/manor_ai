import type {Question} from './questions';
// 100 original questions: 25 per subject. Stable IDs preserve pupil history.
export const year6Questions:Question[]=[
  {
    "id": "y6-2026-001",
    "subject": "Maths",
    "prompt": "What is the value of the digit 7 in 6,742,105?",
    "answers": [
      "700000",
      "700,000"
    ],
    "explanation": "The 7 is in the hundred-thousands column.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-002",
    "subject": "Maths",
    "prompt": "Round 8,462,718 to the nearest 100,000.",
    "answers": [
      "8500000",
      "8,500,000"
    ],
    "explanation": "The ten-thousands digit is 6, so 8,400,000 rounds up to 8,500,000.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-003",
    "subject": "Maths",
    "prompt": "Calculate 4,608 × 23.",
    "answers": [
      "105984",
      "105,984"
    ],
    "explanation": "4,608 × 20 = 92,160 and × 3 = 13,824. Add to get 105,984.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-004",
    "subject": "Maths",
    "prompt": "Calculate 7,560 ÷ 24.",
    "answers": [
      "315"
    ],
    "explanation": "24 × 300 = 7,200 and 24 × 15 = 360, so the quotient is 315.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-005",
    "subject": "Maths",
    "prompt": "There are 437 children going on a trip. Each coach seats 52 children. What is the fewest number of coaches needed?",
    "answers": [
      "9"
    ],
    "explanation": "Eight coaches seat 416, leaving 21 children. A ninth coach is needed.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-006",
    "subject": "Maths",
    "prompt": "Calculate 6 + 3 × (8 − 2).",
    "answers": [
      "24"
    ],
    "explanation": "Brackets first: 6. Then 3 × 6 = 18. Finally add 6.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-007",
    "subject": "Maths",
    "prompt": "What is the greatest common factor of 36 and 60?",
    "answers": [
      "12"
    ],
    "explanation": "12 divides both numbers and no larger common factor does.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-008",
    "subject": "Maths",
    "prompt": "A submarine is at −85 metres. It rises 37 metres. What is its new position in metres?",
    "answers": [
      "-48",
      "−48"
    ],
    "explanation": "−85 + 37 = −48, still below sea level.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-009",
    "subject": "Maths",
    "prompt": "Calculate 5/6 − 1/4. Give your answer as a fraction in its lowest terms.",
    "answers": [
      "7/12"
    ],
    "explanation": "Use twelfths: 10/12 − 3/12 = 7/12.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-010",
    "subject": "Maths",
    "prompt": "Calculate 3/5 × 2/7. Give a fraction in its lowest terms.",
    "answers": [
      "6/35"
    ],
    "explanation": "Multiply numerators and denominators: 3 × 2 = 6 and 5 × 7 = 35.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-011",
    "subject": "Maths",
    "prompt": "Calculate 7/8 ÷ 4. Give a fraction in its lowest terms.",
    "answers": [
      "7/32"
    ],
    "explanation": "Dividing by 4 is multiplying by 1/4: 7/8 × 1/4 = 7/32.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-012",
    "subject": "Maths",
    "prompt": "Write 0.375 as a fraction in its lowest terms.",
    "answers": [
      "3/8"
    ],
    "explanation": "0.375 = 375/1000. Divide both numbers by 125.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-013",
    "subject": "Maths",
    "prompt": "Calculate 4.056 × 100.",
    "answers": [
      "405.6",
      "405.60"
    ],
    "explanation": "Each digit moves two place-value columns left.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-014",
    "subject": "Maths",
    "prompt": "Calculate 8.4 ÷ 7.",
    "answers": [
      "1.2"
    ],
    "explanation": "84 tenths divided by 7 is 12 tenths.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-015",
    "subject": "Maths",
    "prompt": "A book costs £15. Its price increases by 20%. What is its new price in pounds?",
    "answers": [
      "18",
      "£18",
      "18.00"
    ],
    "explanation": "20% of £15 is £3. Add this to £15.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-016",
    "subject": "Maths",
    "prompt": "A class has 32 pupils. 12 cycle to school. What percentage cycle?",
    "answers": [
      "37.5",
      "37.5%"
    ],
    "explanation": "12/32 = 3/8 = 0.375 = 37.5%.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-017",
    "subject": "Maths",
    "prompt": "A recipe uses flour and butter in the ratio 5:2. It uses 350 g of flour. How many grams of butter are needed?",
    "answers": [
      "140"
    ],
    "explanation": "One part is 350 ÷ 5 = 70 g. Two parts are 140 g.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-018",
    "subject": "Maths",
    "prompt": "A recipe for 6 people uses 450 g of rice. How many grams are needed for 10 people?",
    "answers": [
      "750"
    ],
    "explanation": "One person needs 75 g, so 10 people need 750 g.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-019",
    "subject": "Maths",
    "prompt": "If y = 4n + 7, what is y when n = 6?",
    "answers": [
      "31"
    ],
    "explanation": "4 × 6 + 7 = 24 + 7 = 31.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-020",
    "subject": "Maths",
    "prompt": "Find the missing number: 5x + 8 = 43. What is x?",
    "answers": [
      "7"
    ],
    "explanation": "Subtract 8 to get 5x = 35. Divide by 5.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-021",
    "subject": "Maths",
    "prompt": "A rectangle is 7.5 cm long and 4 cm wide. What is its area in square centimetres?",
    "answers": [
      "30"
    ],
    "explanation": "Area = length × width = 7.5 × 4.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-022",
    "subject": "Maths",
    "prompt": "A triangle has base 12 cm and perpendicular height 7 cm. What is its area in square centimetres?",
    "answers": [
      "42"
    ],
    "explanation": "Triangle area = half × base × height = 84 ÷ 2.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-023",
    "subject": "Maths",
    "prompt": "A cuboid measures 8 cm by 5 cm by 3 cm. What is its volume in cubic centimetres?",
    "answers": [
      "120"
    ],
    "explanation": "Multiply the three dimensions: 8 × 5 × 3.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-024",
    "subject": "Maths",
    "prompt": "Three angles around a point are 115°, 90° and 80°. What is the remaining angle in degrees?",
    "answers": [
      "75"
    ],
    "explanation": "Angles around a point total 360°. Subtract 285°.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-025",
    "subject": "Maths",
    "prompt": "The mean of four numbers is 18. Three numbers are 12, 19 and 21. What is the fourth number?",
    "answers": [
      "20"
    ],
    "explanation": "The total must be 4 × 18 = 72. The known numbers total 52, leaving 20.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-026",
    "subject": "English",
    "prompt": "Copy the word that means shone with reflected light.",
    "answers": [
      "glistened"
    ],
    "explanation": "The wet planks glistened: they shone in the light.",
    "difficulty": "Year 6",
    "passage": "Leila reached the old footbridge just as the rain began. The planks glistened, and the river tugged at the reeds below. She tucked the map inside her coat. Although the far bank was only a few steps away, she tested each plank before moving her weight. Behind her, Ben stopped whistling."
  },
  {
    "id": "y6-2026-027",
    "subject": "English",
    "prompt": "What did Leila protect from the rain?",
    "answers": [
      "map",
      "the map",
      "her map"
    ],
    "explanation": "She tucked the map inside her coat.",
    "difficulty": "Year 6",
    "passage": "Leila reached the old footbridge just as the rain began. The planks glistened, and the river tugged at the reeds below. She tucked the map inside her coat. Although the far bank was only a few steps away, she tested each plank before moving her weight. Behind her, Ben stopped whistling."
  },
  {
    "id": "y6-2026-028",
    "subject": "English",
    "prompt": "Which adverb best describes how Leila crosses: cautiously or carelessly? Type one word.",
    "answers": [
      "cautiously"
    ],
    "explanation": "She tests each plank before putting her weight on it.",
    "difficulty": "Year 6",
    "passage": "Leila reached the old footbridge just as the rain began. The planks glistened, and the river tugged at the reeds below. She tucked the map inside her coat. Although the far bank was only a few steps away, she tested each plank before moving her weight. Behind her, Ben stopped whistling."
  },
  {
    "id": "y6-2026-029",
    "subject": "English",
    "prompt": "Copy the verb that makes the river sound as though it is pulling.",
    "answers": [
      "tugged"
    ],
    "explanation": "Tugged suggests a pulling action and personifies the river.",
    "difficulty": "Year 6",
    "passage": "Leila reached the old footbridge just as the rain began. The planks glistened, and the river tugged at the reeds below. She tucked the map inside her coat. Although the far bank was only a few steps away, she tested each plank before moving her weight. Behind her, Ben stopped whistling."
  },
  {
    "id": "y6-2026-030",
    "subject": "English",
    "prompt": "Does Ben become noisier or quieter at the end? Type one word.",
    "answers": [
      "quieter"
    ],
    "explanation": "He stops whistling, so he becomes quieter.",
    "difficulty": "Year 6",
    "passage": "Leila reached the old footbridge just as the rain began. The planks glistened, and the river tugged at the reeds below. She tucked the map inside her coat. Although the far bank was only a few steps away, she tested each plank before moving her weight. Behind her, Ben stopped whistling."
  },
  {
    "id": "y6-2026-031",
    "subject": "English",
    "prompt": "Which part of the tree had lifted the pavement?",
    "answers": [
      "roots",
      "the roots",
      "its roots"
    ],
    "explanation": "The first sentence identifies the roots as the cause.",
    "difficulty": "Year 6",
    "passage": "At first, the town council planned to cut down the ash tree because its roots had lifted the pavement. Residents proposed a different solution: curve the path around the trunk. An engineer confirmed that the new route would be safe. The council agreed, and volunteers planted flowers beside the repaired path. By spring, the tree was still standing."
  },
  {
    "id": "y6-2026-032",
    "subject": "English",
    "prompt": "Who suggested curving the path: residents or the engineer?",
    "answers": [
      "residents",
      "the residents"
    ],
    "explanation": "Residents proposed the alternative; the engineer later checked safety.",
    "difficulty": "Year 6",
    "passage": "At first, the town council planned to cut down the ash tree because its roots had lifted the pavement. Residents proposed a different solution: curve the path around the trunk. An engineer confirmed that the new route would be safe. The council agreed, and volunteers planted flowers beside the repaired path. By spring, the tree was still standing."
  },
  {
    "id": "y6-2026-033",
    "subject": "English",
    "prompt": "Copy the word meaning said that something was definitely true.",
    "answers": [
      "confirmed"
    ],
    "explanation": "The engineer confirmed the new route would be safe.",
    "difficulty": "Year 6",
    "passage": "At first, the town council planned to cut down the ash tree because its roots had lifted the pavement. Residents proposed a different solution: curve the path around the trunk. An engineer confirmed that the new route would be safe. The council agreed, and volunteers planted flowers beside the repaired path. By spring, the tree was still standing."
  },
  {
    "id": "y6-2026-034",
    "subject": "English",
    "prompt": "What season is mentioned at the end?",
    "answers": [
      "spring"
    ],
    "explanation": "The final sentence begins By spring.",
    "difficulty": "Year 6",
    "passage": "At first, the town council planned to cut down the ash tree because its roots had lifted the pavement. Residents proposed a different solution: curve the path around the trunk. An engineer confirmed that the new route would be safe. The council agreed, and volunteers planted flowers beside the repaired path. By spring, the tree was still standing."
  },
  {
    "id": "y6-2026-035",
    "subject": "English",
    "prompt": "Did the council change its original plan? Type yes or no.",
    "answers": [
      "yes"
    ],
    "explanation": "It originally planned to cut down the tree, but later agreed to change the path.",
    "difficulty": "Year 6",
    "passage": "At first, the town council planned to cut down the ash tree because its roots had lifted the pavement. Residents proposed a different solution: curve the path around the trunk. An engineer confirmed that the new route would be safe. The council agreed, and volunteers planted flowers beside the repaired path. By spring, the tree was still standing."
  },
  {
    "id": "y6-2026-036",
    "subject": "English",
    "prompt": "What do invertebrates lack?",
    "answers": [
      "backbones",
      "a backbone",
      "backbone"
    ],
    "explanation": "The first sentence defines invertebrates as animals without backbones.",
    "difficulty": "Year 6",
    "passage": "Octopuses are invertebrates: animals without backbones. Their soft bodies can squeeze through narrow gaps, but a hard beak limits how small a gap they can enter. Many octopuses change colour to blend into their surroundings. This camouflage can help them avoid predators. Despite living in water, they must obtain oxygen; their gills absorb it from the water."
  },
  {
    "id": "y6-2026-037",
    "subject": "English",
    "prompt": "Which hard body part limits the gaps an octopus can enter?",
    "answers": [
      "beak",
      "a beak",
      "the beak"
    ],
    "explanation": "The passage says the hard beak limits the size of the gap.",
    "difficulty": "Year 6",
    "passage": "Octopuses are invertebrates: animals without backbones. Their soft bodies can squeeze through narrow gaps, but a hard beak limits how small a gap they can enter. Many octopuses change colour to blend into their surroundings. This camouflage can help them avoid predators. Despite living in water, they must obtain oxygen; their gills absorb it from the water."
  },
  {
    "id": "y6-2026-038",
    "subject": "English",
    "prompt": "Copy the word for blending into the surroundings to avoid being seen.",
    "answers": [
      "camouflage"
    ],
    "explanation": "The passage names this protection camouflage.",
    "difficulty": "Year 6",
    "passage": "Octopuses are invertebrates: animals without backbones. Their soft bodies can squeeze through narrow gaps, but a hard beak limits how small a gap they can enter. Many octopuses change colour to blend into their surroundings. This camouflage can help them avoid predators. Despite living in water, they must obtain oxygen; their gills absorb it from the water."
  },
  {
    "id": "y6-2026-039",
    "subject": "English",
    "prompt": "What gas do the gills absorb?",
    "answers": [
      "oxygen"
    ],
    "explanation": "The final sentence says the gills absorb oxygen from the water.",
    "difficulty": "Year 6",
    "passage": "Octopuses are invertebrates: animals without backbones. Their soft bodies can squeeze through narrow gaps, but a hard beak limits how small a gap they can enter. Many octopuses change colour to blend into their surroundings. This camouflage can help them avoid predators. Despite living in water, they must obtain oxygen; their gills absorb it from the water."
  },
  {
    "id": "y6-2026-040",
    "subject": "English",
    "prompt": "Is this passage mainly intended to inform or persuade?",
    "answers": [
      "inform",
      "to inform"
    ],
    "explanation": "It explains facts rather than trying to change the reader’s opinion.",
    "difficulty": "Year 6",
    "passage": "Octopuses are invertebrates: animals without backbones. Their soft bodies can squeeze through narrow gaps, but a hard beak limits how small a gap they can enter. Many octopuses change colour to blend into their surroundings. This camouflage can help them avoid predators. Despite living in water, they must obtain oxygen; their gills absorb it from the water."
  },
  {
    "id": "y6-2026-041",
    "subject": "English",
    "prompt": "What time does the clock strike?",
    "answers": [
      "6",
      "six",
      "six oclock",
      "6 oclock",
      "six o’clock",
      "six o'clock"
    ],
    "explanation": "The opening sentence states that the clock struck six.",
    "difficulty": "Year 6",
    "passage": "The station clock struck six. Ellis unfolded the letter for the third time, although he knew every line. Beside him, an empty suitcase waited. When the train appeared, he stood quickly, then sat again. Finally, a familiar red scarf emerged from the crowd. Ellis left the suitcase behind and ran towards his sister."
  },
  {
    "id": "y6-2026-042",
    "subject": "English",
    "prompt": "How many times has Ellis unfolded the letter?",
    "answers": [
      "3",
      "three"
    ],
    "explanation": "He unfolds it for the third time.",
    "difficulty": "Year 6",
    "passage": "The station clock struck six. Ellis unfolded the letter for the third time, although he knew every line. Beside him, an empty suitcase waited. When the train appeared, he stood quickly, then sat again. Finally, a familiar red scarf emerged from the crowd. Ellis left the suitcase behind and ran towards his sister."
  },
  {
    "id": "y6-2026-043",
    "subject": "English",
    "prompt": "Is Ellis waiting for his sister to arrive or leave? Type arrive or leave.",
    "answers": [
      "arrive"
    ],
    "explanation": "His sister emerges from the crowd after the train appears.",
    "difficulty": "Year 6",
    "passage": "The station clock struck six. Ellis unfolded the letter for the third time, although he knew every line. Beside him, an empty suitcase waited. When the train appeared, he stood quickly, then sat again. Finally, a familiar red scarf emerged from the crowd. Ellis left the suitcase behind and ran towards his sister."
  },
  {
    "id": "y6-2026-044",
    "subject": "English",
    "prompt": "Which item helps Ellis recognise his sister?",
    "answers": [
      "scarf",
      "red scarf",
      "a red scarf",
      "the red scarf"
    ],
    "explanation": "A familiar red scarf appears before he runs to his sister.",
    "difficulty": "Year 6",
    "passage": "The station clock struck six. Ellis unfolded the letter for the third time, although he knew every line. Beside him, an empty suitcase waited. When the train appeared, he stood quickly, then sat again. Finally, a familiar red scarf emerged from the crowd. Ellis left the suitcase behind and ran towards his sister."
  },
  {
    "id": "y6-2026-045",
    "subject": "English",
    "prompt": "Which emotion is better supported by his repeated movements: anticipation or boredom?",
    "answers": [
      "anticipation"
    ],
    "explanation": "Repeatedly reading the letter and standing quickly suggest eager, nervous waiting.",
    "difficulty": "Year 6",
    "passage": "The station clock struck six. Ellis unfolded the letter for the third time, although he knew every line. Beside him, an empty suitcase waited. When the train appeared, he stood quickly, then sat again. Finally, a familiar red scarf emerged from the crowd. Ellis left the suitcase behind and ran towards his sister."
  },
  {
    "id": "y6-2026-046",
    "subject": "English",
    "prompt": "What is the wind compared to in the first line?",
    "answers": [
      "visitor",
      "a visitor",
      "a restless visitor",
      "restless visitor"
    ],
    "explanation": "The metaphor describes the wind as a restless visitor.",
    "difficulty": "Year 6",
    "passage": "The wind was a restless visitor,\nRattling the latch at the door.\nIt scattered the leaves like letters\nAcross the cold kitchen floor.\nBut under the table, the puppy\nSlept through the rising roar."
  },
  {
    "id": "y6-2026-047",
    "subject": "English",
    "prompt": "Copy the word that introduces the simile in the third line.",
    "answers": [
      "like"
    ],
    "explanation": "Like introduces the comparison between leaves and letters.",
    "difficulty": "Year 6",
    "passage": "The wind was a restless visitor,\nRattling the latch at the door.\nIt scattered the leaves like letters\nAcross the cold kitchen floor.\nBut under the table, the puppy\nSlept through the rising roar."
  },
  {
    "id": "y6-2026-048",
    "subject": "English",
    "prompt": "Which word rhymes with door? Copy the word from the fourth line.",
    "answers": [
      "floor"
    ],
    "explanation": "Floor and door have the same ending sound.",
    "difficulty": "Year 6",
    "passage": "The wind was a restless visitor,\nRattling the latch at the door.\nIt scattered the leaves like letters\nAcross the cold kitchen floor.\nBut under the table, the puppy\nSlept through the rising roar."
  },
  {
    "id": "y6-2026-049",
    "subject": "English",
    "prompt": "Where is the puppy sleeping?",
    "answers": [
      "under the table",
      "under table",
      "beneath the table"
    ],
    "explanation": "The fifth line places the puppy under the table.",
    "difficulty": "Year 6",
    "passage": "The wind was a restless visitor,\nRattling the latch at the door.\nIt scattered the leaves like letters\nAcross the cold kitchen floor.\nBut under the table, the puppy\nSlept through the rising roar."
  },
  {
    "id": "y6-2026-050",
    "subject": "English",
    "prompt": "Does the puppy’s behaviour contrast with the noisy wind? Type yes or no.",
    "answers": [
      "yes"
    ],
    "explanation": "The wind rattles and roars, but the puppy remains asleep.",
    "difficulty": "Year 6",
    "passage": "The wind was a restless visitor,\nRattling the latch at the door.\nIt scattered the leaves like letters\nAcross the cold kitchen floor.\nBut under the table, the puppy\nSlept through the rising roar."
  },
  {
    "id": "y6-2026-051",
    "subject": "Verbal reasoning",
    "prompt": "Complete the analogy: page is to book as brick is to ___.",
    "answers": [
      "wall",
      "a wall"
    ],
    "explanation": "A page is part of a book; a brick is part of a wall.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-052",
    "subject": "Verbal reasoning",
    "prompt": "Complete the analogy: surgeon is to hospital as teacher is to ___.",
    "answers": [
      "school",
      "a school"
    ],
    "explanation": "Both pairs link a person to a usual place of work.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-053",
    "subject": "Verbal reasoning",
    "prompt": "Complete the analogy: fragile is to sturdy as shallow is to ___.",
    "answers": [
      "deep"
    ],
    "explanation": "Both pairs are opposites.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-054",
    "subject": "Verbal reasoning",
    "prompt": "Which word is closest in meaning to meticulous: careless, thorough, sudden, plain?",
    "answers": [
      "thorough"
    ],
    "explanation": "Meticulous means extremely careful and thorough.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-055",
    "subject": "Verbal reasoning",
    "prompt": "Which word is the opposite of temporary: brief, permanent, fragile, recent?",
    "answers": [
      "permanent"
    ],
    "explanation": "Temporary lasts a limited time; permanent is intended to last.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-056",
    "subject": "Verbal reasoning",
    "prompt": "Which word does not belong: whisper, murmur, mutter, sprint?",
    "answers": [
      "sprint"
    ],
    "explanation": "The first three describe quiet speech; sprint describes running.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-057",
    "subject": "Verbal reasoning",
    "prompt": "Rearrange TRIANGLE to make a word meaning changing something.",
    "answers": [
      "altering"
    ],
    "explanation": "ALTERING uses exactly the letters of TRIANGLE.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-058",
    "subject": "Verbal reasoning",
    "prompt": "Rearrange DUSTY to make a word meaning to learn about a subject.",
    "answers": [
      "study"
    ],
    "explanation": "STUDY uses D, U, S, T and Y.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-059",
    "subject": "Verbal reasoning",
    "prompt": "Rearrange BELOW to name a joint in the arm.",
    "answers": [
      "elbow"
    ],
    "explanation": "ELBOW uses the same five letters.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-060",
    "subject": "Verbal reasoning",
    "prompt": "Add one letter to the start of light to make a word meaning a journey through the air.",
    "answers": [
      "f"
    ],
    "explanation": "F + light makes flight.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-061",
    "subject": "Verbal reasoning",
    "prompt": "Remove one letter from plane to make a word meaning an organised idea for doing something.",
    "answers": [
      "plan"
    ],
    "explanation": "Removing the final E gives PLAN.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-062",
    "subject": "Verbal reasoning",
    "prompt": "What three-letter word can follow both sun and moon to make two compound words?",
    "answers": [
      "set"
    ],
    "explanation": "Sunset and moonset both describe a celestial body dropping below the horizon.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-063",
    "subject": "Verbal reasoning",
    "prompt": "What four-letter word can follow both rain and snow to make two compound words?",
    "answers": [
      "fall"
    ],
    "explanation": "Rainfall and snowfall both measure or describe precipitation.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-064",
    "subject": "Verbal reasoning",
    "prompt": "If each letter moves forward two places, CAT becomes ECV. How is DOG coded?",
    "answers": [
      "fqi"
    ],
    "explanation": "D becomes F, O becomes Q and G becomes I.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-065",
    "subject": "Verbal reasoning",
    "prompt": "If A=1, B=2 and so on, what is the total value of BEE?",
    "answers": [
      "12"
    ],
    "explanation": "B=2 and E=5, so 2+5+5=12.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-066",
    "subject": "Verbal reasoning",
    "prompt": "Continue the letter sequence: A, D, G, J, ___.",
    "answers": [
      "m"
    ],
    "explanation": "Each letter is three places further on.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-067",
    "subject": "Verbal reasoning",
    "prompt": "Continue the letter sequence: Z, W, T, Q, ___.",
    "answers": [
      "n"
    ],
    "explanation": "Move backwards three letters each time.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-068",
    "subject": "Verbal reasoning",
    "prompt": "Continue the pairs: AB, CD, EF, GH, ___.",
    "answers": [
      "ij"
    ],
    "explanation": "The pairs follow the alphabet in order.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-069",
    "subject": "Verbal reasoning",
    "prompt": "Mina is older than Jo. Jo is older than Ravi. Who is youngest?",
    "answers": [
      "ravi"
    ],
    "explanation": "Ravi is younger than Jo, who is younger than Mina.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-070",
    "subject": "Verbal reasoning",
    "prompt": "All glips are blue. Some blue things are round. Must every glip be round? Type yes or no.",
    "answers": [
      "no"
    ],
    "explanation": "The round blue things may not be glips.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-071",
    "subject": "Verbal reasoning",
    "prompt": "A race finishes in this order: Ada before Ben, Cara after Ben, Dan before Ada. Who is second?",
    "answers": [
      "ada"
    ],
    "explanation": "The order is Dan, Ada, Ben, Cara.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-072",
    "subject": "Verbal reasoning",
    "prompt": "Find the three-letter animal hidden across the two words: music atoll.",
    "answers": [
      "cat"
    ],
    "explanation": "The final C of music followed by AT at the start of atoll spells CAT.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-073",
    "subject": "Verbal reasoning",
    "prompt": "Choose the word that fits both meanings: the outer covering of a tree; a dog’s sound.",
    "answers": [
      "bark"
    ],
    "explanation": "Bark has both meanings.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-074",
    "subject": "Verbal reasoning",
    "prompt": "Choose the word that fits both meanings: not heavy; brightness.",
    "answers": [
      "light"
    ],
    "explanation": "Light means not heavy and also illumination.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-075",
    "subject": "Verbal reasoning",
    "prompt": "Add a prefix to legal to mean not legal. Type only the prefix.",
    "answers": [
      "il"
    ],
    "explanation": "IL + legal makes illegal.",
    "difficulty": "Year 6"
  },
  {
    "id": "y6-2026-076",
    "subject": "Non-verbal reasoning",
    "prompt": "Rotate the shaded square 90° clockwise about the centre. Which numbered square will be shaded? Type 1–9.",
    "answers": [
      "3"
    ],
    "explanation": "A clockwise quarter-turn maps the top row to the right column. The shaded square moves to position 3.",
    "difficulty": "Year 6",
    "diagram": {
      "kind": "grid",
      "items": [
        1
      ]
    }
  },
  {
    "id": "y6-2026-077",
    "subject": "Non-verbal reasoning",
    "prompt": "Rotate the shaded square 90° clockwise about the centre. Which numbered square will be shaded? Type 1–9.",
    "answers": [
      "6"
    ],
    "explanation": "A clockwise quarter-turn maps the top row to the right column. The shaded square moves to position 6.",
    "difficulty": "Year 6",
    "diagram": {
      "kind": "grid",
      "items": [
        2
      ]
    }
  },
  {
    "id": "y6-2026-078",
    "subject": "Non-verbal reasoning",
    "prompt": "Rotate the shaded square 90° clockwise about the centre. Which numbered square will be shaded? Type 1–9.",
    "answers": [
      "9"
    ],
    "explanation": "A clockwise quarter-turn maps the top row to the right column. The shaded square moves to position 9.",
    "difficulty": "Year 6",
    "diagram": {
      "kind": "grid",
      "items": [
        4
      ]
    }
  },
  {
    "id": "y6-2026-079",
    "subject": "Non-verbal reasoning",
    "prompt": "Rotate the shaded square 90° clockwise about the centre. Which numbered square will be shaded? Type 1–9.",
    "answers": [
      "2"
    ],
    "explanation": "A clockwise quarter-turn maps the top row to the right column. The shaded square moves to position 2.",
    "difficulty": "Year 6",
    "diagram": {
      "kind": "grid",
      "items": [
        8
      ]
    }
  },
  {
    "id": "y6-2026-080",
    "subject": "Non-verbal reasoning",
    "prompt": "Rotate the shaded square 90° clockwise about the centre. Which numbered square will be shaded? Type 1–9.",
    "answers": [
      "1"
    ],
    "explanation": "A clockwise quarter-turn maps the top row to the right column. The shaded square moves to position 1.",
    "difficulty": "Year 6",
    "diagram": {
      "kind": "grid",
      "items": [
        64
      ]
    }
  },
  {
    "id": "y6-2026-081",
    "subject": "Non-verbal reasoning",
    "prompt": "Reflect the shaded square in a vertical mirror line through the centre. Which numbered square will be shaded? Type 1–9.",
    "answers": [
      "3"
    ],
    "explanation": "A vertical reflection swaps left and right but keeps the same row. The result is position 3.",
    "difficulty": "Year 6",
    "diagram": {
      "kind": "grid",
      "items": [
        1
      ]
    }
  },
  {
    "id": "y6-2026-082",
    "subject": "Non-verbal reasoning",
    "prompt": "Reflect the shaded square in a vertical mirror line through the centre. Which numbered square will be shaded? Type 1–9.",
    "answers": [
      "6"
    ],
    "explanation": "A vertical reflection swaps left and right but keeps the same row. The result is position 6.",
    "difficulty": "Year 6",
    "diagram": {
      "kind": "grid",
      "items": [
        8
      ]
    }
  },
  {
    "id": "y6-2026-083",
    "subject": "Non-verbal reasoning",
    "prompt": "Reflect the shaded square in a vertical mirror line through the centre. Which numbered square will be shaded? Type 1–9.",
    "answers": [
      "9"
    ],
    "explanation": "A vertical reflection swaps left and right but keeps the same row. The result is position 9.",
    "difficulty": "Year 6",
    "diagram": {
      "kind": "grid",
      "items": [
        64
      ]
    }
  },
  {
    "id": "y6-2026-084",
    "subject": "Non-verbal reasoning",
    "prompt": "Reflect the shaded square in a vertical mirror line through the centre. Which numbered square will be shaded? Type 1–9.",
    "answers": [
      "1"
    ],
    "explanation": "A vertical reflection swaps left and right but keeps the same row. The result is position 1.",
    "difficulty": "Year 6",
    "diagram": {
      "kind": "grid",
      "items": [
        4
      ]
    }
  },
  {
    "id": "y6-2026-085",
    "subject": "Non-verbal reasoning",
    "prompt": "Reflect the shaded square in a vertical mirror line through the centre. Which numbered square will be shaded? Type 1–9.",
    "answers": [
      "7"
    ],
    "explanation": "A vertical reflection swaps left and right but keeps the same row. The result is position 7.",
    "difficulty": "Year 6",
    "diagram": {
      "kind": "grid",
      "items": [
        256
      ]
    }
  },
  {
    "id": "y6-2026-086",
    "subject": "Non-verbal reasoning",
    "prompt": "Study the shape sequence. How many sides should the next shape have?",
    "answers": [
      "6"
    ],
    "explanation": "Add one side each time.",
    "difficulty": "Year 6",
    "diagram": {
      "kind": "polygon",
      "items": [
        3,
        4,
        5
      ]
    }
  },
  {
    "id": "y6-2026-087",
    "subject": "Non-verbal reasoning",
    "prompt": "Study the shape sequence. How many sides should the next shape have?",
    "answers": [
      "5"
    ],
    "explanation": "Remove one side each time.",
    "difficulty": "Year 6",
    "diagram": {
      "kind": "polygon",
      "items": [
        8,
        7,
        6
      ]
    }
  },
  {
    "id": "y6-2026-088",
    "subject": "Non-verbal reasoning",
    "prompt": "Study the shape sequence. How many sides should the next shape have?",
    "answers": [
      "9"
    ],
    "explanation": "Add two sides each time.",
    "difficulty": "Year 6",
    "diagram": {
      "kind": "polygon",
      "items": [
        3,
        5,
        7
      ]
    }
  },
  {
    "id": "y6-2026-089",
    "subject": "Non-verbal reasoning",
    "prompt": "Study the shape sequence. How many sides should the next shape have?",
    "answers": [
      "4"
    ],
    "explanation": "The four-sided and six-sided shapes alternate.",
    "difficulty": "Year 6",
    "diagram": {
      "kind": "polygon",
      "items": [
        4,
        6,
        4,
        6
      ]
    }
  },
  {
    "id": "y6-2026-090",
    "subject": "Non-verbal reasoning",
    "prompt": "Study the shape sequence. How many sides should the next shape have?",
    "answers": [
      "5"
    ],
    "explanation": "Each shape repeats twice before the side count increases.",
    "difficulty": "Year 6",
    "diagram": {
      "kind": "polygon",
      "items": [
        3,
        3,
        4,
        4,
        5
      ]
    }
  },
  {
    "id": "y6-2026-091",
    "subject": "Non-verbal reasoning",
    "prompt": "Study the dot groups. How many dots should be in the next group?",
    "answers": [
      "10"
    ],
    "explanation": "The increases are 2, then 3, then 4.",
    "difficulty": "Year 6",
    "diagram": {
      "kind": "dots",
      "items": [
        1,
        3,
        6
      ]
    }
  },
  {
    "id": "y6-2026-092",
    "subject": "Non-verbal reasoning",
    "prompt": "Study the dot groups. How many dots should be in the next group?",
    "answers": [
      "16"
    ],
    "explanation": "Double the number of dots each time.",
    "difficulty": "Year 6",
    "diagram": {
      "kind": "dots",
      "items": [
        2,
        4,
        8
      ]
    }
  },
  {
    "id": "y6-2026-093",
    "subject": "Non-verbal reasoning",
    "prompt": "Study the dot groups. How many dots should be in the next group?",
    "answers": [
      "3"
    ],
    "explanation": "Remove three dots each time.",
    "difficulty": "Year 6",
    "diagram": {
      "kind": "dots",
      "items": [
        12,
        9,
        6
      ]
    }
  },
  {
    "id": "y6-2026-094",
    "subject": "Non-verbal reasoning",
    "prompt": "Study the dot groups. How many dots should be in the next group?",
    "answers": [
      "10"
    ],
    "explanation": "Add three dots each time.",
    "difficulty": "Year 6",
    "diagram": {
      "kind": "dots",
      "items": [
        1,
        4,
        7
      ]
    }
  },
  {
    "id": "y6-2026-095",
    "subject": "Non-verbal reasoning",
    "prompt": "Study the dot groups. How many dots should be in the next group?",
    "answers": [
      "12"
    ],
    "explanation": "The increases are 1, 2, 3, then 4.",
    "difficulty": "Year 6",
    "diagram": {
      "kind": "dots",
      "items": [
        2,
        3,
        5,
        8
      ]
    }
  },
  {
    "id": "y6-2026-096",
    "subject": "Non-verbal reasoning",
    "prompt": "Follow the moving shaded square. Which numbered position comes next? Type 1–9.",
    "answers": [
      "9"
    ],
    "explanation": "The shaded square moves clockwise around the outside edge: 1, 2, 3, 6, 9.",
    "difficulty": "Year 6",
    "diagram": {
      "kind": "grid",
      "items": [
        1,
        2,
        4,
        32
      ]
    }
  },
  {
    "id": "y6-2026-097",
    "subject": "Non-verbal reasoning",
    "prompt": "Follow the moving shaded square. Which numbered position comes next? Type 1–9.",
    "answers": [
      "3"
    ],
    "explanation": "The shaded square moves clockwise around the outside edge: 7, 4, 1, 2, 3.",
    "difficulty": "Year 6",
    "diagram": {
      "kind": "grid",
      "items": [
        64,
        8,
        1,
        2
      ]
    }
  },
  {
    "id": "y6-2026-098",
    "subject": "Non-verbal reasoning",
    "prompt": "Follow the moving shaded square. Which numbered position comes next? Type 1–9.",
    "answers": [
      "1"
    ],
    "explanation": "The shaded square travels down the main diagonal and back again.",
    "difficulty": "Year 6",
    "diagram": {
      "kind": "grid",
      "items": [
        1,
        16,
        256,
        16
      ]
    }
  },
  {
    "id": "y6-2026-099",
    "subject": "Non-verbal reasoning",
    "prompt": "Follow the moving shaded square. Which numbered position comes next? Type 1–9.",
    "answers": [
      "3"
    ],
    "explanation": "The shaded square travels down the other diagonal and back again.",
    "difficulty": "Year 6",
    "diagram": {
      "kind": "grid",
      "items": [
        4,
        16,
        64,
        16
      ]
    }
  },
  {
    "id": "y6-2026-100",
    "subject": "Non-verbal reasoning",
    "prompt": "Follow the moving shaded square. Which numbered position comes next? Type 1–9.",
    "answers": [
      "2"
    ],
    "explanation": "The shaded square travels down the middle column and back again.",
    "difficulty": "Year 6",
    "diagram": {
      "kind": "grid",
      "items": [
        2,
        16,
        128,
        16
      ]
    }
  }
];
