"""200 original 11+ entrance-exam questions (Year 6 pupils sitting Year 7 entrance tests), 50 per subject.

Written for Manor Quest; no third-party text or artwork. The set targets question types that the
existing bank lacked: order of operations, speed, best buys, reverse percentages, sequences,
probability and averages; GL-style verbal reasoning families; and non-verbal odd-one-out,
matrices, analogies, codes, paper folding and cube nets.

Run from the repository root:  python scripts/generate-entrance-questions.py
Writes lib/entrance-questions.ts, public/question-diagrams/photo-3001.svg … photo-3050.svg and
tests/entrance-question-cases.json. Every diagram embeds its model so tests can re-derive answers.
"""
import itertools, json, math, random
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ART = ROOT / 'public' / 'question-diagrams'
rng = random.Random(20260926)
bank, cases = [], []
M, E, V, N = 'Maths', 'English', 'Verbal reasoning', 'Non-verbal reasoning'


def norm(s):
    s = s.replace('‘', "'").replace('’', "'").replace('−', '-').lower().strip()
    return ' '.join(s.rstrip('.,!?').split())


def next_id():
    return f'entrance-200-{len(bank) + 1:03}'


def add(subject, prompt, answers, explanation, group='standard', options=None, check=None, **extra):
    answers = [str(a) for a in (answers if isinstance(answers, list) else [answers])]
    q = dict(id=next_id(), subject=subject, difficulty='Year 6', prompt=prompt, answers=answers,
             explanation=explanation, rewardGroup=group, **extra)
    if options:
        options = [str(o) for o in options]
        assert answers[0] in options, q['id']
        assert len({norm(o) for o in options}) == len(options), q['id']
        if not all(len(o) == 1 and o.isupper() for o in options):
            rng.shuffle(options)
        q['options'] = options
    bank.append(q)
    if check:
        cases.append([q['id'], *check])
    return q


# ─────────────────────────────── Maths (50) ───────────────────────────────
def maths():
    add(M, 'Calculate 48 − 6 × (3 + 4) ÷ 2.', 27,
        'Brackets first: 3 + 4 = 7. Then multiply and divide from left to right: 6 × 7 = 42 and 42 ÷ 2 = 21. Finally 48 − 21 = 27.',
        check=['expr', '48-6*(3+4)/2'])
    add(M, 'Where should the brackets go to make this true? 6 + 4 × 5 − 2 = 30', '(6 + 4) × (5 − 2)',
        '(6 + 4) × (5 − 2) = 10 × 3 = 30. The other placements give 48, 18 and 24.', 'challenge',
        options=['(6 + 4) × (5 − 2)', '(6 + 4) × 5 − 2', '6 + 4 × (5 − 2)', '6 + (4 × 5) − 2'], check=['expr-options', 30])
    add(M, 'A cyclist rides at 18 km/h for 2 hours 20 minutes. How far does she travel, in kilometres?', 42,
        '20 minutes is one third of an hour, so she rides for 2⅓ hours. 18 × 2 = 36 and 18 ÷ 3 = 6, so she travels 36 + 6 = 42 km.',
        'challenge', check=['expr', '18*(2+20/60)'])
    add(M, 'A train travels 210 km in 1 hour 45 minutes. What is its average speed in km/h?', 120,
        '1 hour 45 minutes is 1.75 hours. 210 ÷ 1.75 = 120 km/h.', 'challenge', check=['expr', '210/(1+45/60)'])
    add(M, 'Jo walks 6 km at a steady 4 km/h. She sets off at 09:40. At what time does she arrive? Use 24-hour time, for example 14:05.',
        '11:10', '6 ÷ 4 = 1.5 hours, which is 1 hour 30 minutes. 09:40 + 1 hour 30 minutes = 11:10.', 'challenge',
        check=['time', 9 * 60 + 40, '6/4*60'])
    add(M, 'Which pack of pencils is the best value for money?', '6 for £1.68',
        'Find the cost of one pencil: £1.20 ÷ 4 = 30p, £1.68 ÷ 6 = 28p, £2.90 ÷ 10 = 29p and £4.35 ÷ 15 = 29p. The pack of 6 is cheapest per pencil.',
        'challenge', options=['4 for £1.20', '6 for £1.68', '10 for £2.90', '15 for £4.35'], check=['best-buy'])
    add(M, 'A 750 g box of cereal costs £2.25. A 1.2 kg box costs £3.36. How many pence cheaper per 100 g is the larger box?', ['2', '2p'],
        'Small box: 225p ÷ 7.5 = 30p per 100 g. Large box: 336p ÷ 12 = 28p per 100 g. The larger box is 2p cheaper per 100 g.',
        'challenge', check=['expr', '225/7.5-336/12'])
    add(M, 'In a sale, a coat is reduced by 20%. It now costs £64. What was its original price, in pounds?', 80,
        '£64 is 80% of the original price. 1% is £64 ÷ 80 = £0.80, so 100% is £80.', 'challenge', check=['expr', '64/0.8'])
    add(M, 'A sunflower was 40 cm tall. A week later it was 46 cm tall. By what percentage did its height increase?', 15,
        'It grew 6 cm. 6 out of 40 is 6 ÷ 40 = 0.15, which is 15%.', 'challenge', check=['expr', '(46-40)/40*100'])
    add(M, 'The price of a game rises by 10% to £33. What was the price before the rise, in pounds?', 30,
        '£33 is 110% of the old price. 1% is £33 ÷ 110 = £0.30, so the old price was £30.', 'challenge', check=['expr', '33/1.1'])
    add(M, 'The nth term of a sequence is 4n − 3. What is the 25th term?', 97,
        'Substitute n = 25: 4 × 25 − 3 = 100 − 3 = 97.', check=['expr', '4*25-3'])
    add(M, 'Which expression gives the nth term of the sequence 5, 8, 11, 14, …?', '3n + 2',
        'The terms go up by 3, so the rule starts 3n. When n = 1, 3n = 3, and 3 + 2 = 5 is the first term.', 'challenge',
        options=['3n + 2', '3n + 5', '5n + 3', 'n + 3'], check=['nth-options', [5, 8, 11, 14]])
    add(M, 'A sequence starts 2, 7, 12, 17, … Which term of the sequence is 97? (2 is the 1st term.)', ['20', '20th'],
        'The nth term is 5n − 3. Solve 5n − 3 = 97: 5n = 100, so n = 20. The 20th term is 97.', 'challenge', check=['expr', '(97+3)/5'])
    add(M, 'A number goes into a machine that multiplies it by 3 and then subtracts 7. The number that comes out is 29. What number went in?', 12,
        'Work backwards and undo each step: 29 + 7 = 36, then 36 ÷ 3 = 12.', check=['expr', '(29+7)/3'])
    add(M, 'A triangle has a base of 14 cm and a perpendicular height of 9 cm. What is its area in cm²?', 63,
        'Area of a triangle = ½ × base × height = ½ × 14 × 9 = 63 cm².', check=['expr', '14*9/2'])
    add(M, 'A rectangle measuring 12 m by 8 m has a 5 m by 3 m rectangle cut out of one corner, leaving an L-shape. What is the area of the L-shape in square metres?', 81,
        'The whole rectangle is 12 × 8 = 96 m². The cut-out is 5 × 3 = 15 m². 96 − 15 = 81 m².', 'challenge', check=['expr', '12*8-5*3'])
    add(M, 'A rectangle measuring 12 m by 8 m has a 5 m by 3 m rectangle cut out of one corner, leaving an L-shape. What is the perimeter of the L-shape in metres?', 40,
        'Cutting a rectangle from a corner moves two edges inwards, but their total length stays the same. The perimeter is still 2 × (12 + 8) = 40 m.',
        'challenge', check=['expr', '2*(12+8)'])
    add(M, 'A square has the same perimeter as a rectangle measuring 9 cm by 5 cm. What is the area of the square in cm²?', 49,
        'The rectangle’s perimeter is 2 × (9 + 5) = 28 cm. Each side of the square is 28 ÷ 4 = 7 cm, so its area is 7 × 7 = 49 cm².',
        'challenge', check=['expr', '(2*(9+5)/4)**2'])
    add(M, 'A bag holds 3 red, 5 blue and 4 green counters. One counter is taken out without looking. What is the probability that it is blue?', '5/12',
        'There are 3 + 5 + 4 = 12 counters and 5 of them are blue, so the probability is 5/12.',
        options=['5/12', '5/7', '1/3', '7/12'], check=['value-options', '5/(3+5+4)'])
    add(M, 'A fair six-sided dice is rolled. What is the probability of rolling a number greater than 4?', '1/3',
        'Only 5 and 6 are greater than 4. That is 2 of the 6 equally likely outcomes, and 2/6 = 1/3.',
        options=['1/3', '1/2', '2/3', '1/6'], check=['value-options', '2/6'])
    add(M, 'Two fair coins are tossed. What is the probability of getting exactly one head?', '1/2',
        'The four equally likely outcomes are HH, HT, TH and TT. Exactly one head happens in HT and TH: 2 out of 4, which is 1/2.',
        'challenge', options=['1/2', '1/4', '3/4', '1/3'], check=['value-options', '2/4'])
    add(M, 'What is the median of 7, 3, 9, 12, 4 and 10?', 8,
        'In order: 3, 4, 7, 9, 10, 12. The two middle numbers are 7 and 9, so the median is halfway between them: 8.',
        check=['median', [7, 3, 9, 12, 4, 10]])
    add(M, 'The temperatures at five weather stations were 4°C, −3°C, 7°C, −1°C and 2°C. What is the range of the temperatures, in degrees?', ['10', '10°C'],
        'Range = highest − lowest = 7 − (−3) = 10 degrees.', check=['expr', '7-(-3)'])
    add(M, 'The mean of four numbers is 15. Three of the numbers are 12, 19 and 8. What is the fourth number?', 21,
        'The four numbers total 4 × 15 = 60. 12 + 19 + 8 = 39, so the fourth number is 60 − 39 = 21.', 'challenge',
        check=['expr', '4*15-(12+19+8)'])
    add(M, 'What is the mode of 4, 7, 2, 7, 9, 4, 7, 1?', 7,
        'The mode is the most common value. 7 appears three times, more than any other number.', 'quick', check=['mode', [4, 7, 2, 7, 9, 4, 7, 1]])
    add(M, 'What is the sum of all the prime numbers between 20 and 40?', 120,
        'The prime numbers between 20 and 40 are 23, 29, 31 and 37. Their total is 120.', 'challenge', check=['prime-sum', 20, 40])
    add(M, 'Which of these shows 84 written as a product of prime factors?', '2 × 2 × 3 × 7',
        '84 = 2 × 42 = 2 × 2 × 21 = 2 × 2 × 3 × 7. Every factor must be prime; 14, 4, 21 and 6 are not prime.', 'challenge',
        options=['2 × 2 × 3 × 7', '2 × 3 × 14', '4 × 21', '2 × 6 × 7'], check=['prime-product', 84])
    add(M, 'Which number is both a square number and a cube number?', '64',
        '64 = 8 × 8 and 64 = 4 × 4 × 4. 16 and 81 are square numbers but not cube numbers; 27 is a cube number but not a square number.',
        options=['64', '16', '27', '81'], check=['square-cube'])
    add(M, 'What is the highest common factor of 48 and 72?', 24,
        'Factors of 48: 1, 2, 3, 4, 6, 8, 12, 16, 24, 48. The largest of these that also divides 72 is 24 (72 = 3 × 24).', check=['hcf', 48, 72])
    add(M, 'At 06:00 the temperature was −8°C. By noon it had risen by 13 degrees. What was the temperature at noon, in °C?', ['5', '5°C'],
        'Count up from −8: 8 degrees takes you to 0, and 5 more takes you to 5°C.', check=['expr', '-8+13'])
    add(M, 'Calculate −7 + 12 − 15.', '-10', '−7 + 12 = 5, and 5 − 15 = −10.', check=['expr', '-7+12-15'])
    add(M, 'A bus leaves Abbey Road at 08:47 and reaches the station at 09:26. How many minutes does the journey take?', 39,
        'From 08:47 to 09:00 is 13 minutes, and from 09:00 to 09:26 is 26 minutes. 13 + 26 = 39 minutes.', check=['expr', '(9*60+26)-(8*60+47)'])
    add(M, 'A film starts at 19:35 and lasts 2 hours 50 minutes. At what time does it finish? Use 24-hour time.', '22:25',
        '19:35 + 2 hours = 21:35. Then 25 minutes takes you to 22:00, and the last 25 minutes to 22:25.', 'challenge',
        check=['time', 19 * 60 + 35, '2*60+50'])
    add(M, 'On a map, 1 cm represents 5 km. Two towns are 7.4 cm apart on the map. How far apart are they in real life, in kilometres?', 37,
        '7.4 × 5 = 37 km.', check=['expr', '7.4*5'])
    add(M, 'A recipe for 4 people uses 300 g of flour. How many grams of flour are needed for 10 people?', 750,
        'For 1 person: 300 ÷ 4 = 75 g. For 10 people: 75 × 10 = 750 g.', check=['expr', '300/4*10'])
    add(M, 'Sam and Priya share £72 in the ratio 5 : 3. How much more does Sam get than Priya, in pounds?', 18,
        'There are 5 + 3 = 8 parts, so each part is £72 ÷ 8 = £9. Sam gets 5 parts (£45) and Priya gets 3 parts (£27). The difference is £18.',
        'challenge', check=['expr', '72/8*(5-3)'])
    add(M, 'Two angles on a straight line are x and 3x. What is x, in degrees?', 45,
        'Angles on a straight line add up to 180°. x + 3x = 4x = 180°, so x = 45°.', 'challenge', check=['expr', '180/4'])
    add(M, 'An isosceles triangle has one angle of 40°. Its other two angles are equal to each other. What size is each of those angles, in degrees?', 70,
        'The three angles add up to 180°. 180 − 40 = 140, and 140 ÷ 2 = 70°.', check=['expr', '(180-40)/2'])
    add(M, 'What is the size of each interior angle of a regular hexagon, in degrees?', 120,
        'A hexagon can be split into 4 triangles, so its angles total 4 × 180° = 720°. 720 ÷ 6 = 120°.', 'challenge', check=['expr', '(6-2)*180/6'])
    add(M, 'Three angles meet at a point. Two of them are 115° and 97°. What is the third angle, in degrees?', 148,
        'Angles around a point add up to 360°. 360 − 115 − 97 = 148°.', check=['expr', '360-115-97'])
    add(M, 'Calculate 2/3 + 3/4. Give your answer as a mixed number.', ['1 5/12', '1 and 5/12'],
        'Use twelfths: 2/3 = 8/12 and 3/4 = 9/12. 8/12 + 9/12 = 17/12 = 1 5/12.', check=['mixed-sum', [2, 3], [3, 4]])
    add(M, 'What is 3/8 of 96?', 36, '96 ÷ 8 = 12, and 12 × 3 = 36.', 'quick', check=['expr', '96/8*3'])
    add(M, 'Which of these is the largest?', '5/8',
        'Write them all as decimals: 5/8 = 0.625, 0.6, 62% = 0.62 and 0.59. The largest is 0.625, which is 5/8.',
        options=['5/8', '0.6', '62%', '0.59'], check=['largest'])
    add(M, 'If a = 4 and b = 7, what is the value of 3a + 2b − ab?', '-2',
        '3a = 12, 2b = 14 and ab = 4 × 7 = 28. 12 + 14 − 28 = −2.', 'challenge', check=['expr', '3*4+2*7-4*7'])
    add(M, 'Solve 5(x − 3) = 35. What is x?', 10,
        'Divide both sides by 5: x − 3 = 7. Then add 3: x = 10.', 'challenge', check=['expr', '35/5+3'])
    add(M, 'Pencils cost p pence each and rulers cost r pence each. Which expression gives the total cost, in pence, of 4 pencils and 2 rulers?', '4p + 2r',
        '4 pencils cost 4 × p = 4p pence and 2 rulers cost 2 × r = 2r pence. Together they cost 4p + 2r.',
        options=['4p + 2r', '6pr', '4r + 2p', '8pr'])
    add(M, 'How many 250 ml cups can be filled completely from a 3.5 litre jug of juice?', 14,
        '3.5 litres = 3500 ml. 3500 ÷ 250 = 14 cups.', check=['expr', '3500/250'])
    add(M, 'A fish tank is a cuboid 50 cm long, 30 cm wide and 20 cm tall. How many litres of water does it hold when full? (1 litre = 1000 cm³)', 30,
        'Volume = 50 × 30 × 20 = 30 000 cm³. 30 000 ÷ 1000 = 30 litres.', 'challenge', check=['expr', '50*30*20/1000'])
    add(M, 'Maya is 3 times as old as her brother. In 4 years’ time, the total of their ages will be 36. How old is Maya now?', 21,
        'In 4 years they will both be 4 years older, so their total now is 36 − 8 = 28. Maya has 3 parts and her brother 1 part: 28 ÷ 4 = 7, so her brother is 7 and Maya is 21.',
        'extended', check=['expr', '(36-8)/4*3'])
    add(M, 'Tickets cost £7 for adults and £4 for children. A group of 9 people paid £48 in total. How many adults were in the group?', 4,
        'If all 9 were children the cost would be 9 × £4 = £36. Each adult adds £3 more, and £48 − £36 = £12, so there are 12 ÷ 3 = 4 adults.',
        'extended', check=['tickets', 7, 4, 9, 48])


# ─────────────────────────────── English (50) ───────────────────────────────
MARSH = '''The Marsh Path

Nell had been warned about the marsh path, but warnings were easy to ignore in daylight. Now the fog rolled in from the estuary like a tide of grey wool, swallowing the fence posts one by one. She slowed down. Somewhere to her left, a curlew called: a thin, sorrowful whistle that seemed to come from everywhere at once. Nell’s boots sank a little deeper with each step, and the reeds hissed around her.

She pulled the torch from her pocket, then hesitated. Its light had been flickering all week. Better to save it, she decided, for when she truly needed it. Instead, she counted her steps aloud, the way her grandfather had taught her: forty paces to the old gate, then turn towards the church bell. When the bell finally rang out, it was the most welcome sound she had ever heard.'''

SWIFTS = '''Swifts

Every spring, swifts return to Britain after spending the winter in Africa. They are remarkable fliers. Apart from when they are nesting, swifts spend almost their whole lives in the air, feeding, drinking and even sleeping on the wing. A young swift that leaves its nest may not land again for two or three years.

Sadly, the number of swifts in the United Kingdom has fallen sharply in recent decades. One reason is that when buildings are repaired or replaced, the small gaps under roof tiles and eaves where swifts nest are often blocked. People can help by fitting special swift bricks or nest boxes high on walls. Because swifts return to the same nest site year after year, a single box can be used for many summers.'''

TRAIN = '''Night Train

The night train sings along the rails,
a bright needle sewing dark;
it hurries past the sleeping towns
and leaves a single, trailing spark.

The stations blink their yellow eyes,
the signals nod and wave it through;
it hums a tune of iron and steam
that only dreaming children knew.

By dawn it rests beside the sea,
its engine sighing, spent and slow,
and gulls, like scraps of paper, wheel
above the empty rails below.'''


def english():
    p = dict(passage=MARSH)
    add(E, 'Where did the fog come from?', ['the estuary', 'estuary', 'from the estuary'],
        'The passage says the fog “rolled in from the estuary”.', **p)
    add(E, 'Which technique is used in “the fog rolled in from the estuary like a tide of grey wool”?', 'simile',
        'It compares the fog to “a tide of grey wool” using the word “like”, so it is a simile.',
        options=['simile', 'metaphor', 'alliteration', 'onomatopoeia'], **p)
    add(E, 'Which word from the passage is an example of onomatopoeia?', 'hissed',
        '“Hissed” imitates the sound the reeds make, so it is onomatopoeia.',
        options=['hissed', 'swallowing', 'sorrowful', 'flickering'], **p)
    add(E, 'Why does Nell decide not to switch on her torch?', 'She wants to save its weak battery until she really needs it.',
        'The battery “had been flickering all week”, so she decides to save it “for when she truly needed it”.',
        options=['She wants to save its weak battery until she really needs it.', 'She is afraid someone will see the light.',
                 'She has forgotten how to switch it on.', 'Her grandfather told her never to use it.'], **p)
    add(E, 'In the passage, the word “sorrowful” is closest in meaning to:', 'sad',
        '“Sorrowful” means full of sorrow, which is sadness.', 'quick', options=['sad', 'loud', 'sudden', 'cheerful'], **p)
    add(E, 'What does the last sentence suggest about how Nell feels?', 'Relieved, because the bell tells her she is nearly safe',
        'The bell was “the most welcome sound she had ever heard”: it guides her home, so she feels relieved.', 'challenge',
        options=['Relieved, because the bell tells her she is nearly safe', 'Annoyed, because the bell is too loud',
                 'Disappointed, because her walk is over', 'Frightened, because the church is haunted'], **p)
    add(E, 'How many paces did Nell have to count to reach the old gate?', ['forty', '40', 'forty paces', '40 paces'],
        'Her grandfather taught her “forty paces to the old gate”.', 'quick', **p)

    p = dict(passage=SWIFTS)
    add(E, 'Where do swifts spend the winter?', ['Africa', 'in Africa'], 'The first sentence says swifts spend “the winter in Africa”.', 'quick', **p)
    add(E, 'Which of these statements is an opinion rather than a fact?', 'Swifts are remarkable fliers.',
        '“Remarkable” is the writer’s own judgement. The other statements can be checked and proved, so they are facts.', 'challenge',
        options=['Swifts are remarkable fliers.', 'Swifts spend the winter in Africa.', 'Swifts nest in gaps under roof tiles.',
                 'Swift numbers in the UK have fallen.'], **p)
    add(E, 'According to the passage, why has the number of swifts fallen?', 'Their nesting gaps are often blocked when buildings are repaired',
        'The passage says the gaps under roof tiles and eaves “are often blocked” when buildings are repaired or replaced.',
        options=['Their nesting gaps are often blocked when buildings are repaired', 'They can no longer find food in Africa',
                 'They are frightened away by nest boxes', 'They stay in the air for too long'], **p)
    add(E, 'What does the phrase “on the wing” mean in this passage?', 'while flying',
        'Swifts feed, drink and sleep “on the wing”, which means while they are flying.',
        options=['while flying', 'on a bird’s feathers', 'in the nest', 'at the edge of a building'], **p)
    add(E, 'What is the main purpose of this passage?', 'To inform readers about swifts and how people can help them',
        'It gives facts about swifts, explains why they are declining and suggests how people can help.', 'challenge',
        options=['To inform readers about swifts and how people can help them', 'To persuade readers to visit Africa',
                 'To tell a story about one particular swift', 'To explain how to build a house'], **p)

    p = dict(passage=TRAIN)
    add(E, 'The poem describes the train as “a bright needle sewing dark”. Which technique is this?', 'metaphor',
        'The train is described as if it really were a needle, without using “like” or “as”, so it is a metaphor.',
        options=['metaphor', 'simile', 'onomatopoeia', 'alliteration'], **p)
    add(E, 'Which line from the poem contains a simile?', 'and gulls, like scraps of paper, wheel',
        'It compares the gulls to “scraps of paper” using the word “like”.',
        options=['and gulls, like scraps of paper, wheel', 'The stations blink their yellow eyes', 'it hums a tune of iron and steam',
                 'The night train sings along the rails'], **p)
    add(E, 'In the line “The stations blink their yellow eyes”, what are the “yellow eyes” most likely to be?', 'Lights at the stations',
        'Stations do not have eyes. The poet describes their yellow lights as eyes that seem to blink as the train passes.', 'challenge',
        options=['Lights at the stations', 'Cats waiting on the platform', 'The train’s front lamps', 'The rising sun'], **p)
    add(E, 'How does the mood change in the final verse?', 'It becomes calm and tired as the journey ends',
        'The train “rests”, its engine is “sighing, spent and slow”, and the rails are “empty”: the journey is over and the mood is calm and tired.',
        'challenge', options=['It becomes calm and tired as the journey ends', 'It becomes tense and frightening',
                              'It becomes loud and busy', 'It becomes angry'], **p)
    add(E, 'Which word rhymes with “dark” in the first verse?', 'spark', '“Dark” and “spark” end with the same sound.', 'quick', **p)

    add(E, 'In the sentence “Those apples are ripe.”, which word class is “Those”?', 'determiner',
        '“Those” comes before the noun “apples” and tells us which apples, so it is a determiner.',
        options=['determiner', 'pronoun', 'noun', 'adverb'])
    add(E, 'Which word is the preposition in this sentence? “The cat hid beneath the old shed.”', 'beneath',
        '“Beneath” shows where the cat hid in relation to the shed, so it is a preposition.', 'quick')
    add(E, 'Which word is the subordinating conjunction in this sentence? “We stayed inside because it was raining heavily.”', 'because',
        '“Because” introduces the subordinate clause “because it was raining heavily”.', 'quick')
    add(E, 'Which word is the adverb in this sentence? “The fox crept silently across the frosty field.”', 'silently',
        '“Silently” tells us how the fox crept, so it is an adverb.', 'quick')
    add(E, 'Which modal verb makes this sentence sound the most certain? “It ___ rain tomorrow.”', 'will',
        '“Will” shows certainty. “Might”, “could” and “may” only show possibility.', options=['will', 'might', 'could', 'may'])
    add(E, 'Which word is the pronoun in this sentence? “Although the players were tired, they kept running.”', 'they',
        '“They” stands in place of the noun phrase “the players”.', 'quick')
    add(E, 'Which sentence uses an apostrophe correctly?', 'The children’s coats were wet.',
        '“Children” is already plural, so its possessive form is “children’s”. “Coats” is a plain plural and needs no apostrophe.',
        options=['The children’s coats were wet.', 'The childrens’ coats were wet.', 'The childrens coat’s were wet.',
                 'The children’s coat’s were wet.'])
    add(E, 'Which sentence uses a semicolon correctly?', 'I love swimming; my brother prefers football.',
        'A semicolon can join two closely related main clauses. “I love swimming” and “my brother prefers football” could each stand alone.',
        options=['I love swimming; my brother prefers football.', 'I love; swimming and football.', 'Because I was late; I ran to school.',
                 'We bought; apples, pears and plums.'])
    add(E, 'Which sentence uses a colon correctly?', 'You will need three things: a pencil, a ruler and a rubber.',
        'A colon can introduce a list after a complete clause. “You will need three things” makes sense on its own, so the list follows the colon.',
        options=['You will need three things: a pencil, a ruler and a rubber.', 'You will: need three things, a pencil, a ruler and a rubber.',
                 'You will need three: things, a pencil, a ruler and a rubber.', 'You: will need three things, a pencil, a ruler and a rubber.'])
    add(E, 'Where should a hyphen go to show that the shark eats people? “The man eating shark was spotted near the beach.”', 'man-eating shark',
        '“Man-eating” is a compound adjective describing the shark. Without the hyphen, the sentence could mean that a man was eating a shark.',
        options=['man-eating shark', 'man eating-shark', 'the-man eating shark', 'shark-was spotted'])
    add(E, 'Which sentence punctuates the speech correctly?', '“Wait for me,” called Ava.',
        'The spoken words and the comma that ends them go inside the inverted commas, and the full stop comes after “called Ava”.', 'challenge',
        options=['“Wait for me,” called Ava.', '“Wait for me” called Ava.', '“Wait for me”, called Ava.', '“Wait for me, called Ava.”'])
    add(E, 'Which sentence uses brackets correctly?', 'My uncle (who lives in Wales) is visiting us.',
        'Brackets hold extra information that could be removed. “My uncle is visiting us” still makes sense without “who lives in Wales”.',
        options=['My uncle (who lives in Wales) is visiting us.', 'My uncle who (lives in Wales) is visiting us.',
                 'My (uncle who lives) in Wales is visiting us.', 'My uncle who lives in Wales (is visiting us).'])
    add(E, 'Which sentence has a comma in the correct place?', 'After lunch, we played rounders.',
        '“After lunch” is a fronted adverbial, so it is followed by a comma.',
        options=['After lunch, we played rounders.', 'After, lunch we played rounders.', 'After lunch we, played rounders.',
                 'After lunch we played, rounders.'])
    add(E, 'Which sentence is written in the passive voice?', 'The window was broken by the ball.',
        'In a passive sentence, the subject has the action done to it: the window “was broken by” the ball.', 'challenge',
        options=['The window was broken by the ball.', 'The ball broke the window.', 'The boy kicked the ball at the window.',
                 'The window broke into pieces.'])
    add(E, 'Which sentence is the active version of “The cake was eaten by the dog.”?', 'The dog ate the cake.',
        'In the active voice the subject does the action: the dog (subject) ate the cake (object).',
        options=['The dog ate the cake.', 'The cake ate the dog.', 'The dog was eaten by the cake.', 'The cake had been eaten.'])
    add(E, 'Which sentence uses the subjunctive form?', 'If I were taller, I could reach the shelf.',
        '“If I were…” is the subjunctive, used for something imagined or not true.', 'challenge',
        options=['If I were taller, I could reach the shelf.', 'If I was taller, I could reach the shelf.',
                 'When I am taller, I can reach the shelf.', 'I am tall enough to reach the shelf.'])
    add(E, 'Which sentence contains a relative clause?', 'The girl who won the race was delighted.',
        '“who won the race” is a relative clause: it starts with the relative pronoun “who” and tells us more about the girl.',
        options=['The girl who won the race was delighted.', 'The girl won the race.', 'Delighted, the girl ran home.',
                 'The girl won the race and smiled.'])
    add(E, 'What is the simple past tense of “freeze”?', 'froze',
        'Today I freeze; yesterday I froze. (The past participle, used after “have”, is “frozen”.)', 'quick')
    add(E, 'Which sentence is written in the present perfect tense?', 'She has finished her homework.',
        'The present perfect uses “has” or “have” with a past participle: “has finished”.',
        options=['She has finished her homework.', 'She finished her homework.', 'She is finishing her homework.',
                 'She will finish her homework.'])
    add(E, 'Which sentence is a command?', 'Close the door quietly.',
        'A command tells someone to do something. It usually starts with an imperative verb, here “Close”.', 'quick',
        options=['Close the door quietly.', 'Did you close the door?', 'What a loud door that is!', 'The door is closed.'])
    add(E, 'Which word correctly completes the sentence? “The dog wagged ___ tail.”', 'its',
        '“Its” (with no apostrophe) shows belonging. “It’s” means “it is” or “it has”.', options=['its', 'it’s', 'its’', 'it is'])
    add(E, 'Which word correctly completes the sentence? “The loud music did not ___ the sleeping baby.”', 'affect',
        '“Affect” is usually a verb meaning to have an influence on something. “Effect” is usually a noun meaning a result.',
        options=['affect', 'effect', 'affects', 'effects'])
    add(E, 'Which word is spelt correctly?', 'necessary', '“Necessary” has one c and a double s: ne-c-e-ss-ary.', 'quick',
        options=['necessary', 'neccessary', 'necessery', 'nesessary'])
    add(E, 'Which word correctly completes the sentence? “I need to ___ the piano every day.”', 'practise',
        'In British English, “practise” (with an s) is the verb and “practice” (with a c) is the noun.',
        options=['practise', 'practice', 'practises', 'practising'])
    add(E, 'Which word means paper, envelopes and other writing materials?', 'stationery',
        '“Stationery” (with “er”) means writing materials; “stationary” (with “ar”) means not moving.',
        options=['stationery', 'stationary', 'stationry', 'stationarey'])
    add(E, 'Add a prefix to “possible” to make its opposite. Type the whole new word.', 'impossible',
        'The prefix “im-” means “not”: impossible.', 'quick')
    add(E, 'What is the plural of “wolf”?', 'wolves', 'Many nouns ending in f change to “ves” in the plural: wolf → wolves.', 'quick')
    add(E, 'Which word is closest in meaning to “meticulous”?', 'careful',
        'Someone meticulous pays great attention to detail, so they are very careful.', options=['careful', 'careless', 'quick', 'noisy'])
    add(E, 'Which word is the opposite of “generous”?', 'selfish',
        'A generous person gives freely; a selfish person thinks mainly of themselves.', 'quick',
        options=['selfish', 'kind', 'giving', 'wealthy'])
    add(E, '“The wind howled angrily through the trees.” Which technique is used?', 'personification',
        'The wind is given human feelings and behaviour: it howls “angrily”. This is personification.',
        options=['personification', 'simile', 'alliteration', 'rhyme'])
    add(E, 'Which sentence contains alliteration?', 'Seven slippery snakes slid silently.',
        'Alliteration repeats the same first sound in words close together: seven, slippery, snakes, slid, silently.', 'quick',
        options=['Seven slippery snakes slid silently.', 'The snake was long and green.', 'A snake moved across the path.',
                 'We looked at a snake at the zoo.'])
    add(E, 'What does the idiom “to let the cat out of the bag” mean?', 'to reveal a secret',
        'To let the cat out of the bag means to give away a secret, often by accident.', 'quick',
        options=['to reveal a secret', 'to set an animal free', 'to go shopping', 'to lose something'])
    add(E, 'Which word best completes the sentence? “The ___ desert stretched for miles without a single tree or stream.”', 'barren',
        '“Barren” means bare and unable to support much life, which fits a desert with no trees or water.',
        options=['barren', 'fertile', 'crowded', 'damp'])


# ─────────────────────────────── Verbal reasoning (50) ───────────────────────────────
def boundary_grams(sentence):
    words = [w.strip('.,!?;:“”"’\'').lower() for w in sentence.split()]
    joined, cuts, pos = ''.join(words), [], 0
    for w in words[:-1]:
        pos += len(w)
        cuts.append(pos)
    return sorted({joined[i:i + 4] for cut in cuts for i in range(max(0, cut - 3), cut) if i + 4 <= len(joined)})


def verbal():
    ask = 'Find the letter that completes both pairs of words. The same letter ends the first word and starts the second word in each pair.'
    for pairs, letter, words in [
        ('fea ( ? ) able     mea ( ? ) ale', 't', ['feat', 'table', 'meat', 'tale']),
        ('clam ( ? ) ear     shee ( ? ) ink', 'p', ['clamp', 'pear', 'sheep', 'pink']),
        ('tim ( ? ) ach     hom ( ? ) ast', 'e', ['time', 'each', 'home', 'east']),
        ('bat ( ? ) ope     wis ( ? ) ail', 'h', ['bath', 'hope', 'wish', 'hail']),
    ]:
        add(V, f'{ask}  {pairs}', letter, f'The letter {letter} makes {words[0]} and {words[1]}, and {words[2]} and {words[3]}.', check=['insert-letter', pairs, letter, words])
    for sentence, word in [('Clear nights feel cold.', 'earn'), ('A magic old lamp glowed.', 'cold'),
                           ('The cat entered quietly.', 'tent'), ('A few alligators swam past.', 'wall')]:
        print('hidden-word check', sentence, boundary_grams(sentence))
        add(V, f'A four-letter word is hidden across two neighbouring words: it starts at the end of one word and finishes at the start of the next. Find it. “{sentence}”',
            word, f'The letters “{word}” run across two words: {sentence}', check=['hidden-word', sentence, word])
    move = 'Move one letter from the first word into the second word to make two new words. Do not change the order of the other letters. Which letter moves?'
    for first, second, letter, a, b in [('stack', 'hop', 's', 'tack', 'shop'), ('plane', 'rid', 'e', 'plan', 'ride'), ('clamp', 'rust', 'c', 'lamp', 'crust')]:
        add(V, f'{move}  {first.upper()}   {second.upper()}', letter,
            f'Taking {letter} from {first} leaves {a}; adding it to {second} makes {b}.', check=['move-letter', first, second, letter, a, b])
    for series, answer, why, group in [
        ('AB  DE  GH  JK  ?', 'MN', 'Each pair starts three letters after the last: A, D, G, J, M. The second letter is always the next letter: N.', 'quick'),
        ('BZ  DX  FV  HT  ?', 'JR', 'The first letters go forward two places (B, D, F, H, J) and the second letters go back two places (Z, X, V, T, R).', 'standard'),
        ('AC  DG  HL  MR  ?', 'SY', 'The first letters jump 3, 4, 5, then 6 places (A, D, H, M, S). The second letters jump 4, 5, 6, then 7 places (C, G, L, R, Y).', 'challenge'),
        ('ZX  WU  TR  QO  ?', 'NL', 'Both letters go back three places each time: Z, W, T, Q, N and X, U, R, O, L.', 'standard'),
    ]:
        add(V, f'Find the next pair of letters in the series:  {series}', answer, why, group, check=['letter-series', series])
    for series, nxt, why, expr in [
        ('3, 5, 9, 17, 33, ?', 65, 'Each number is double the one before, minus 1: 33 × 2 − 1 = 65.', '33*2-1'),
        ('2, 3, 5, 8, 13, ?', 21, 'Each number is the sum of the two before it: 8 + 13 = 21.', '8+13'),
        ('64, 32, 48, 24, 40, ?', 20, 'The rule alternates: halve, then add 16. 40 ÷ 2 = 20.', '40/2'),
    ]:
        add(V, f'Find the next number in the series:  {series}', nxt, why, check=['expr', expr])
    rel = 'The number in brackets is made from the two numbers outside it in the same way each time. Find the missing number.'
    for text, answer, why, rule in [
        ('6 (11) 5     7 (16) 9     9 ( ? ) 4', 13, 'The middle number is the sum of the outside numbers: 9 + 4 = 13.', '(a,b)=>a+b'),
        ('12 (4) 3     24 (6) 4     18 ( ? ) 6', 3, 'The first number is divided by the second: 18 ÷ 6 = 3.', '(a,b)=>a/b'),
        ('5 (27) 2     4 (19) 3     6 ( ? ) 3', 39, 'Square the first number and add the second: 6 × 6 + 3 = 39.', '(a,b)=>a*a+b'),
    ]:
        add(V, f'{rel}  {text}', answer, why, 'challenge', check=['brackets', text, rule])
    add(V, 'If A = 1, B = 2, C = 3 and so on, what is the total value of the letters in the word BEAD?', 12,
        'B = 2, E = 5, A = 1 and D = 4. 2 + 5 + 1 + 4 = 12.', check=['alpha-sum', 'BEAD'])
    add(V, 'A = 1, B = 3, C = 4, D = 7 and E = 12. Work out (D + E) − (B × C). Give your answer as a letter.', 'D',
        'D + E = 7 + 12 = 19 and B × C = 3 × 4 = 12. 19 − 12 = 7, and D = 7.', 'challenge',
        check=['letter-sum', {'A': 1, 'B': 3, 'C': 4, 'D': 7, 'E': 12}, '(D+E)-(B*C)'])
    add(V, 'A = 2, B = 5, C = 6, D = 10 and E = 12. Work out (A × B) + A. Give your answer as a letter.', 'E',
        'A × B = 2 × 5 = 10, and 10 + 2 = 12. E = 12.', check=['letter-sum', {'A': 2, 'B': 5, 'C': 6, 'D': 10, 'E': 12}, '(A*B)+A'])
    for prompt, answer, options, why, group in [
        ('Bird is to nest as bee is to ___.', 'hive', ['hive', 'honey', 'flower', 'sting'], 'A bird lives in a nest; a bee lives in a hive.', 'quick'),
        ('Author is to novel as sculptor is to ___.', 'statue', ['statue', 'chisel', 'gallery', 'painting'], 'An author creates a novel; a sculptor creates a statue.', 'standard'),
        ('Glove is to hand as sock is to ___.', 'foot', ['foot', 'shoe', 'knee', 'wool'], 'A glove is worn on a hand; a sock is worn on a foot.', 'quick'),
    ]:
        add(V, prompt, answer, why, group, options=options)
    close = 'Choose one word from each group. Which two words are closest in meaning?'
    for groups, answer, options, why in [
        ('(swift, heavy, bright)   (slow, rapid, dull)', 'swift – rapid', ['swift – rapid', 'bright – dull', 'heavy – slow', 'swift – slow'], 'Swift and rapid both mean fast.'),
        ('(ancient, tiny, calm)   (loud, modern, old)', 'ancient – old', ['ancient – old', 'tiny – loud', 'calm – modern', 'ancient – modern'], 'Ancient means very old.'),
        ('(brave, weary, clever)   (tired, timid, rich)', 'weary – tired', ['weary – tired', 'brave – timid', 'clever – rich', 'brave – tired'], 'Weary means tired.'),
    ]:
        add(V, f'{close}  {groups}', answer, why, options=options)
    opposite = 'Choose one word from each group. Which two words are most opposite in meaning?'
    for groups, answer, options, why in [
        ('(expand, arrive, gather)   (shrink, reach, collect)', 'expand – shrink', ['expand – shrink', 'gather – collect', 'arrive – reach', 'arrive – shrink'], 'To expand is to get bigger; to shrink is to get smaller.'),
        ('(scarce, fragile, humble)   (plentiful, rare, delicate)', 'scarce – plentiful', ['scarce – plentiful', 'scarce – rare', 'fragile – delicate', 'humble – rare'], 'Scarce means in short supply; plentiful means there is a lot.'),
        ('(permanent, visible, ancient)   (temporary, clear, old)', 'permanent – temporary', ['permanent – temporary', 'visible – clear', 'ancient – old', 'visible – temporary'], 'Permanent means lasting for ever; temporary means lasting only a short time.'),
    ]:
        add(V, f'{opposite}  {groups}', answer, why, options=options)
    for options, answer, why in [
        (['arm + chair', 'toe + room', 'leg + nail', 'hand + chair'], 'arm + chair', 'Arm + chair makes “armchair”.'),
        (['sun + flower', 'rain + cake', 'snow + shell', 'star + ball'], 'sun + flower', 'Sun + flower makes “sunflower”.'),
        (['pass + port', 'door + word', 'key + wall', 'lamp + stair'], 'pass + port', 'Pass + port makes “passport”.'),
    ]:
        add(V, 'Which two words join together to make one real word?', answer, why, 'quick', options=options)
    for words, answer, options, why in [
        ('oak, ash, rose, elm, tulip', 'rose and tulip', ['rose and tulip', 'oak and elm', 'ash and rose', 'elm and tulip'], 'Oak, ash and elm are trees; the rose and the tulip are flowers.'),
        ('violin, trumpet, cello, flute, harp', 'trumpet and flute', ['trumpet and flute', 'violin and cello', 'harp and flute', 'cello and trumpet'], 'The violin, cello and harp have strings; the trumpet and flute are played by blowing.'),
        ('Mars, Venus, Moon, Jupiter, Sun', 'Moon and Sun', ['Moon and Sun', 'Mars and Venus', 'Jupiter and Sun', 'Venus and Moon'], 'Mars, Venus and Jupiter are planets. The Moon is a moon and the Sun is a star.'),
    ]:
        add(V, f'Which two words do not belong with the other three?  {words}', answer, why, options=options)
    missing = 'Three letters that spell a three-letter word are missing from the word in capitals. What is the three-letter word?'
    for sentence, full, answer in [('Mars is a red PLA___.', 'PLANET', 'net'), ('Please light the C___LE on the cake.', 'CANDLE', 'and'),
                                   ('The W___HER was sunny all week.', 'WEATHER', 'eat')]:
        add(V, f'{missing}  “{sentence}”', answer, f'{full} = {full.split(answer.upper())[0]} + {answer.upper()} + {full.split(answer.upper(), 1)[1]}.',
            check=['missing-word', sentence, full, answer])
    add(V, 'If the code for PLANT is RNCPV, what is the code for STORM?', 'UVQTO',
        'Each letter moves forward two places: S→U, T→V, O→Q, R→T, M→O.', check=['shift-code', 'STORM', 2])
    add(V, 'In a code, each letter is swapped with its partner from the other end of the alphabet: A↔Z, B↔Y, C↔X and so on. What is the code for CAT?', 'XZG',
        'C is the 3rd letter, so it swaps with the 3rd from the end, X. A swaps with Z, and T (20th) swaps with G (7th).', 'challenge',
        check=['mirror-code', 'CAT'])
    add(V, 'If DOG is written as 4-15-7, how is BIRD written?', ['2-9-18-4', '2 9 18 4', '2, 9, 18, 4', '2,9,18,4'],
        'Each letter is replaced by its position in the alphabet: B = 2, I = 9, R = 18, D = 4.', check=['number-code', 'BIRD'])
    add(V, 'Change one letter at a time to turn COLD into WARM: COLD → CORD → ? → WARD → WARM. Which word is missing?', 'WORD',
        'CORD → WORD changes C to W, and WORD → WARD changes O to A.', options=['WORD', 'CORN', 'WORM', 'COLT'],
        check=['word-ladder', 'CORD', 'WARD'])
    add(V, 'Change one letter at a time: LOST → LOSE → ? → HOLE → HOLD. Which word is missing?', 'HOSE',
        'LOSE → HOSE changes L to H, and HOSE → HOLE changes S to L.', options=['HOSE', 'LONE', 'POSE', 'LOBE'],
        check=['word-ladder', 'LOSE', 'HOLE'])
    add(V, 'Amy is taller than Ben. Carl is shorter than Ben. Dev is taller than Amy. Who is the shortest?', 'Carl',
        'From tallest to shortest: Dev, Amy, Ben, Carl.', options=['Carl', 'Ben', 'Amy', 'Dev'],
        check=['order', ['Amy>Ben', 'Ben>Carl', 'Dev>Amy'], 'last'])
    add(V, 'Five children ran a race. Tia finished before Omar but after Leo. Priya finished last. Sam finished before Leo. Who finished third?', 'Tia',
        'Sam finished before Leo, Leo before Tia and Tia before Omar, with Priya last: Sam, Leo, Tia, Omar, Priya.', 'challenge',
        options=['Tia', 'Leo', 'Omar', 'Sam'], check=['order', ['Tia<Omar', 'Leo<Tia', 'Sam<Leo', 'Priya=5'], 3])
    add(V, 'Today is Thursday. What day of the week will it be in 17 days’ time?', 'Sunday',
        '14 days is exactly two weeks, so in 14 days it is Thursday again. Three more days is Sunday.',
        options=['Sunday', 'Saturday', 'Monday', 'Friday'], check=['day', 'Thursday', 17])


# ─────────────────────────────── Non-verbal reasoning (50) ───────────────────────────────
INK, GREY, BG, TEXT = '#174e42', '#9fbcb0', '#f8faf7', '#142e27'
FILL = {'white': '#fff', 'black': INK, 'grey': GREY, 'striped': 'url(#stripes)'}
SIDES = {'triangle': 3, 'square': 4, 'pentagon': 5, 'hexagon': 6, 'heptagon': 7, 'octagon': 8}
KIND_OF = {v: k for k, v in SIDES.items()}
LABELS = 'ABCDE'
asset_counter = [3000]
deck = []


def place(opts, correct):
    """Put the right answer where a shuffled A–D deck says: every letter is used equally often, with no pattern to spot."""
    if not deck:
        deck.extend(rng.sample(range(len(opts)), len(opts)))
    i, j = opts.index(correct), deck.pop()
    opts[i], opts[j] = opts[j], opts[i]
    return LABELS[j]


def model(data):
    return json.dumps(data, separators=(',', ':'))


def figure(role, label, x, y, data, inner):
    return f'<g data-role="{role}" data-label="{label}" transform="translate({x} {y})" data-model=\'{model(data)}\'>{inner}</g>'


def text(x, y, s, size=18, anchor='middle', weight='normal'):
    return f'<text x="{x}" y="{y}" font-size="{size}" text-anchor="{anchor}" font-weight="{weight}">{s}</text>'


def write_svg(kind, qmodel, width, height, body):
    asset_counter[0] += 1
    asset = asset_counter[0]
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" data-question="{next_id()}" '
           f'data-type="{kind}" data-model=\'{model(qmodel)}\'><defs><pattern id="stripes" width="7" height="7" patternUnits="userSpaceOnUse" '
           f'patternTransform="rotate(45)"><rect width="7" height="7" fill="#fff"/><line x1="0" y1="0" x2="0" y2="7" stroke="{INK}" stroke-width="3"/>'
           f'</pattern></defs><rect width="{width}" height="{height}" rx="12" fill="{BG}"/><g font-family="Arial,sans-serif" font-size="18" fill="{TEXT}">'
           f'{body}</g></svg>')
    (ART / f'photo-{asset}.svg').write_text(svg, encoding='utf-8')
    return {'kind': 'textbook', 'items': [asset]}


def points(n, cx, cy, r):
    rot = -90 if n % 2 else -90 + 180 / n
    return ' '.join(f'{cx + r * math.cos(math.radians(rot + 360 * k / n)):.1f},{cy + r * math.sin(math.radians(rot + 360 * k / n)):.1f}' for k in range(n))


def shape(kind, cx, cy, r, fill='white', width=2.5):
    if kind == 'circle':
        return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{FILL[fill]}" stroke="{INK}" stroke-width="{width}"/>'
    return f'<polygon points="{points(SIDES[kind], cx, cy, r)}" fill="{FILL[fill]}" stroke="{INK}" stroke-width="{width}" stroke-linejoin="round"/>'


# Polyomino helpers: cells are (row, column); rows run downwards.
def normal(cells):
    r0, c0 = min(r for r, _ in cells), min(c for _, c in cells)
    return tuple(sorted((r - r0, c - c0) for r, c in cells))


def turn(cells):  # 90° clockwise on screen
    return normal([(c, -r) for r, c in cells])


def flip(cells):  # mirror in a vertical line
    return normal([(r, -c) for r, c in cells])


def turns(cells):
    out, s = [], normal(cells)
    for _ in range(4):
        out.append(s)
        s = turn(s)
    return out


def cells_svg(cells, size=18):
    return ''.join(f'<rect x="{c * size}" y="{r * size}" width="{size}" height="{size}" fill="{INK}" stroke="#fff" stroke-width="1.5"/>' for r, c in cells)


def extent(cells, size=18):
    return (max(c for _, c in cells) + 1) * size, (max(r for r, _ in cells) + 1) * size


def centred(role, label, cx, top, cells, data=None):
    w, h = extent(cells)
    return figure(role, label, cx - w // 2, top + (72 - h) // 2, data if data is not None else {'cells': cells}, cells_svg(cells))


def polyominoes(size):
    """Free polyominoes of the given size (rotations and mirror images counted once), in a fixed order."""
    fixed = {((0, 0),)}
    for _ in range(size - 1):
        fixed = {normal(set(p) | {(r + dr, c + dc)}) for p in fixed for r, c in p for dr, dc in ((0, 1), (1, 0), (0, -1), (-1, 0)) if (r + dr, c + dc) not in p}
    return sorted({min(min(turns(v)) for v in (p, flip(p))) for p in fixed})


# Shapes for turning and mirroring puzzles: every quarter turn looks different, the mirror image is never a turn,
# and they fit in 4 × 4. Each puzzle takes a different shape, so no puzzle shows another's answer.
POOL = [p for size in (5, 6) for p in polyominoes(size) if len(set(turns(p))) == 4 and flip(p) not in turns(p) and max(extent(p)) <= 72]


def rotation_questions(count):
    quarters = rng.sample([1, 2, 3] * (count // 3), count)  # quarter, half and three-quarter turns equally often
    for k in quarters:
        original = rng.choice(turns(POOL.pop()))
        correct = turns(original)[k]
        mirrors = rng.sample(turns(flip(original)), 3)
        opts = [correct, *mirrors]
        rng.shuffle(opts)
        assert len(set(opts)) == 4
        answer = place(opts, correct)
        body = text(24, 34, 'Shape', anchor='start') + centred('source', '', 110, 50, original) + text(24, 170, 'Which option is the same shape turned round?', anchor='start')
        body += ''.join(centred('option', LABELS[i], 85 + i * 140, 190, o) + text(85 + i * 140, 290, LABELS[i]) for i, o in enumerate(opts))
        diagram = write_svg('rotation', {}, 600, 310, body)
        how = {1: '90° clockwise', 2: 'through 180°', 3: '90° anticlockwise'}[k]
        add(N, 'Which option shows the shape rotated? It must be turned round, not flipped over.', answer,
            f'Turning the shape {how} gives option {answer}. The other options are mirror images, which you can only make by flipping the shape over.',
            'challenge', options=list('ABCD'), diagram=diagram)


def reflection_questions(count):
    """Mirror lines alternate between vertical and horizontal."""
    for n in range(count):
        original = rng.choice(turns(POOL.pop()))
        axis = 'vertical' if n % 2 == 0 else 'horizontal'
        across, down = flip(original), normal([(-r, c) for r, c in original])
        correct, other = (across, down) if axis == 'vertical' else (down, across)
        # The wrong-axis flip is always offered; the other two wrong options are different turns each time.
        opts = [correct, other, *rng.sample(turns(original), 2)]
        assert len(set(opts)) == 4
        rng.shuffle(opts)
        answer = place(opts, correct)
        w, h = extent(original)
        top = 50 + (72 - h) // 2
        body = text(24, 34, 'Reflect the shape in the dashed mirror line.', anchor='start') + centred('source', '', 110, 50, original)
        if axis == 'vertical':
            body += f'<line x1="{110 + w // 2 + 22}" y1="44" x2="{110 + w // 2 + 22}" y2="136" stroke="{INK}" stroke-width="3" stroke-dasharray="8 6"/>'
        else:
            body += f'<line x1="{110 - w // 2 - 24}" y1="{top + h + 14}" x2="{110 + w // 2 + 24}" y2="{top + h + 14}" stroke="{INK}" stroke-width="3" stroke-dasharray="8 6"/>'
        body += ''.join(centred('option', LABELS[i], 85 + i * 140, 170, o) + text(85 + i * 140, 270, LABELS[i]) for i, o in enumerate(opts))
        diagram = write_svg('reflection', {'axis': axis}, 600, 290, body)
        how = ('In a vertical mirror line the shape flips from left to right: every square keeps its height but swaps sides.' if axis == 'vertical' else
               'In a horizontal mirror line the shape flips upside down: every square stays in its column but swaps between top and bottom.')
        add(N, 'Which option shows the shape reflected in the dashed mirror line?', answer, f'{how} Option {answer} shows this.',
            'challenge', options=list('ABCD'), diagram=diagram)


def glyph(f, cx, cy, r=24):
    s = shape(f['shape'], cx, cy, r, f['fill'])
    if f.get('dot'):
        s += f'<circle cx="{cx}" cy="{cy + (4 if f["shape"] == "triangle" else 0)}" r="5" fill="{INK}"/>'
    return s


def identifiable(examples, features, positions):
    """Each code position must match exactly one feature consistently across the examples."""
    for p in range(positions):
        fits = []
        for f in features:
            pairs = {(e['figure'][f], e['code'][p]) for e in examples}
            if len({v for v, _ in pairs}) == len(pairs) == len({l for _, l in pairs}):
                fits.append(f)
        if len(fits) != 1:
            return False
    return True


def code_questions(specs):
    used = set()  # every code puzzle has a different answer
    for features, n_examples in specs:
        # A dark centre dot would vanish on a black shape, so dot codes use lighter fills only.
        fills = ['white', 'striped', 'grey'] if 'dot' in features else ['white', 'black', 'striped', 'grey']
        pools = {'shape': ['circle', 'square', 'triangle', 'pentagon'], 'fill': fills, 'dot': [True, False]}
        letters = [['F', 'G', 'H', 'K'], ['R', 'S', 'T', 'U'], ['X', 'Y']]
        while True:
            values = {f: rng.sample(pools[f], 3 if f != 'dot' else 2) for f in features}
            maps = {f: dict(zip(values[f], rng.sample(letters[i], len(values[f])))) for i, f in enumerate(features)}
            combos = [dict(zip(features, c)) for c in itertools.product(*[values[f] for f in features])]
            rng.shuffle(combos)
            examples_f, target = combos[:n_examples], combos[n_examples]
            examples = [{'figure': f, 'code': ''.join(maps[x][f[x]] for x in features)} for f in examples_f]
            # Every letter the answer needs appears on at least two example shapes, so it can be cross-checked.
            seen_twice = all(sum(e['figure'][f] == target[f] for e in examples) >= 2 for f in features)
            code = ''.join(maps[f][target[f]] for f in features)
            if seen_twice and identifiable(examples, features, len(features)) and code not in used:
                break
        used.add(code)
        opts = {code}
        while len(opts) < 4:
            wrong = list(code)
            for i in rng.sample(range(len(features)), rng.choice([1, 1, 2]) if len(features) > 1 else 1):
                wrong[i] = rng.choice([l for l in maps[features[i]].values() if l != code[i]])
            opts.add(''.join(wrong))
        opts = sorted(opts)
        rng.shuffle(opts)
        gap = 560 // (n_examples + 1)
        body = text(24, 32, 'Each shape has a code. Work out what each letter stands for.', anchor='start')
        for i, e in enumerate(examples):
            x = 40 + gap // 2 + i * gap
            body += figure('example', e['code'], x - 30, 50, e['figure'], glyph(e['figure'], 30, 34)) + text(x, 140, e['code'], 20, weight='bold')
        x = 40 + gap // 2 + n_examples * gap
        body += figure('target', '', x - 30, 50, target, glyph(target, 30, 34)) + text(x, 140, '?', 22, weight='bold')
        diagram = write_svg('codes', {'features': features, 'examples': examples, 'target': target}, 600, 165, body)
        words = {'shape': 'shape', 'fill': 'shading', 'dot': 'centre dot'}
        explain = '; '.join(f'letter {i + 1} gives the {words[f]} ({code[i]} = {"a centre dot" if f == "dot" and target[f] else "no centre dot" if f == "dot" else target[f]})' for i, f in enumerate(features))
        add(N, 'Each shape has a code. Which code belongs to the shape with the question mark?', code,
            f'Compare shapes that share a letter: {explain}. So the code is {code}.', 'challenge', options=opts, diagram=diagram)


def sector_svg(n, k, cx, cy, r, style='dark'):
    out = ''
    for i in range(n):
        a0, a1 = math.radians(-90 + 360 * i / n), math.radians(-90 + 360 * (i + 1) / n)
        x0, y0, x1, y1 = cx + r * math.cos(a0), cy + r * math.sin(a0), cx + r * math.cos(a1), cy + r * math.sin(a1)
        # White edges between dark parts keep every part countable; the outline is drawn on top.
        shaded = i < k
        fill, edge = ((INK, '#fff') if style == 'dark' else (GREY, INK)) if shaded else ('#fff', INK)
        out += f'<path d="M{cx},{cy} L{x0:.1f},{y0:.1f} A{r},{r} 0 0 1 {x1:.1f},{y1:.1f} Z" fill="{fill}" stroke="{edge}" stroke-width="2"/>'
    return out + f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{INK}" stroke-width="2.5"/>'


def dots_svg(count, cx, cy):
    cols = 3 if count > 4 else 2
    rows = math.ceil(count / cols)
    return ''.join(f'<circle cx="{cx + (i % cols - (cols - 1) / 2) * 9:.1f}" cy="{cy + (i // cols - (rows - 1) / 2) * 9:.1f}" r="3.2" fill="{INK}"/>' for i in range(count))


def singled_out(figs, feature):
    values = [f[feature] for f in figs]
    return [i for i in range(len(figs)) if len({v for j, v in enumerate(values) if j != i}) == 1 and values[i] not in {v for j, v in enumerate(values) if j != i}]


SPOTS = [(40, 11), (69, 40), (40, 69), (11, 40)]  # a dot at the top, right, bottom or left of a figure


def pointer(d, cx=40, cy=40):
    """A small arrow in the middle of a figure pointing up, right, down or left (d = 0, 1, 2, 3)."""
    return f'<g transform="rotate({90 * d} {cx} {cy})"><path d="M{cx} {cy - 16} L{cx + 9} {cy - 5} H{cx + 3} V{cy + 14} H{cx - 3} V{cy - 5} H{cx - 9} Z" fill="{INK}"/></g>'


def odd_questions(rules):
    """Each rule is used once. Four figures follow it and one breaks it; every other feature pairs figures up,
    so no other figure is ever 'the only one' with some feature."""
    kinds4 = ['square', 'triangle', 'pentagon', 'hexagon']
    for rule in rules:
        if rule == 'mirror':
            base = POOL.pop()
            figs = [{'cells': t} for t in turns(base)] + [{'cells': rng.choice(turns(flip(base)))}]
            rng.shuffle(figs)
            odd = next(i for i, f in enumerate(figs) if f['cells'] not in turns(base))
        else:
            while True:
                if rule == 'inner':
                    (k1, k2), (f1, f2) = rng.sample(kinds4, 2), rng.sample(['black', 'grey', 'striped'], 2)
                    figs = [{'outer': k, 'inner': k, 'fill': f} for k in (k1, k2) for f in (f1, f2)]
                    kind = rng.choice(kinds4)
                    figs.append({'outer': kind, 'inner': rng.choice([k for k in kinds4 if k != kind]), 'fill': rng.choice(['black', 'grey', 'striped'])})
                    for f in figs:
                        f['match'] = f['outer'] == f['inner']
                        f['outerOdd'], f['innerOdd'] = SIDES[f['outer']] % 2, SIDES[f['inner']] % 2
                elif rule == 'dots':
                    k1, k2 = rng.sample(kinds4, 2)
                    figs = [{'shape': k, 'dots': SIDES[k], 'fill': f} for k in (k1, k2) for f in ('white', 'grey')]
                    kind = rng.choice(kinds4)
                    figs.append({'shape': kind, 'dots': SIDES[kind] + rng.choice([-1, 1]), 'fill': rng.choice(['white', 'grey'])})
                    for f in figs:
                        f['match'] = f['dots'] == SIDES[f['shape']]
                        f['dotsOdd'], f['sidesOdd'] = f['dots'] % 2, SIDES[f['shape']] % 2
                elif rule == 'half':
                    p1, p2 = rng.sample([2, 4, 6, 8], 2)
                    figs = [{'parts': p, 'shaded': p // 2, 'style': s} for p in (p1, p2) for s in ('dark', 'grey')]
                    n = rng.choice([4, 6, 8])
                    figs.append({'parts': n, 'shaded': rng.choice([k for k in range(1, n) if 2 * k != n]), 'style': rng.choice(['dark', 'grey'])})
                    for f in figs:
                        f['match'] = 2 * f['shaded'] == f['parts']
                        f['shadedOdd'] = f['shaded'] % 2
                else:
                    p1, p2 = rng.sample(range(4), 2)
                    figs = [{'spot': p, 'arrow': p, 'fill': f} for p in (p1, p2) for f in ('black', 'white')]
                    p = rng.randrange(4)
                    figs.append({'spot': p, 'arrow': (p + 2) % 4, 'fill': rng.choice(['black', 'white'])})
                    for f in figs:
                        f['match'] = f['arrow'] == f['spot']
                rng.shuffle(figs)
                odd = [f['match'] for f in figs].index(False)
                paired = all(sum(g[k] == fig[k] for g in figs) >= 2 for i, fig in enumerate(figs) if i != odd for k in fig if k != 'match')
                if singled_out(figs, 'match') == [odd] and paired and len({model(f) for f in figs}) == 5:
                    break
        body = text(24, 32, 'Which figure is the odd one out?', anchor='start')
        for i, f in enumerate(figs):
            cx = 70 + i * 115
            if rule == 'mirror':
                body += centred('option', LABELS[i], cx, 59, f['cells']) + text(cx, 160, LABELS[i])
                continue
            if rule == 'inner':
                inner = shape(f['outer'], 40, 40, 36) + shape(f['inner'], 40, 42 if f['inner'] == 'triangle' else 40, 15, f['fill'], 2)
            elif rule == 'dots':
                inner = shape(f['shape'], 40, 40, 36, f['fill']) + dots_svg(f['dots'], 40, 44 if f['shape'] == 'triangle' else 40)
            elif rule == 'half':
                inner = sector_svg(f['parts'], f['shaded'], 40, 40, 34, f['style'])
            else:
                sx, sy = SPOTS[f['spot']]
                inner = (f'<circle cx="40" cy="40" r="37" fill="#fff" stroke="{INK}" stroke-width="2.5"/>'
                         f'<circle cx="{sx}" cy="{sy}" r="6" fill="{FILL[f["fill"]]}" stroke="{INK}" stroke-width="2"/>' + pointer(f['arrow']))
            body += figure('option', LABELS[i], cx - 40, 55, f, inner) + text(cx, 160, LABELS[i])
        diagram = write_svg('odd-one-out', {'rule': rule}, 600, 180, body)
        answer = LABELS[odd]
        f = figs[odd]
        if rule == 'inner':
            why = f'In every other figure the small shape inside matches the outer shape. In {answer} the {f["inner"]} does not match the {f["outer"]}.'
        elif rule == 'dots':
            why = f'In every other figure the number of dots equals the number of sides. {answer} is a {f["shape"]} with {SIDES[f["shape"]]} sides but {f["dots"]} dots.'
        elif rule == 'half':
            why = f'Every other circle is exactly half shaded. {answer} has {f["shaded"]} of its {f["parts"]} parts shaded.'
        elif rule == 'mirror':
            why = f'Four of the figures are the same shape turned round. {answer} is a mirror image: it would have to be flipped over to match the others.'
        else:
            why = f'In every other figure the arrow points towards the dot. In {answer} it points away from the dot.'
        add(N, 'Which figure is the odd one out?', answer, why, options=list(LABELS), diagram=diagram)


RING = [(14, 14), (40, 14), (66, 14), (66, 40), (66, 66), (40, 66), (14, 66), (14, 40)]  # clockwise round an 80 × 80 frame


def movers_svg(dot, ring):
    (dx, dy), (rx, ry) = RING[dot], RING[ring]
    return f'<rect x="0" y="0" width="80" height="80" fill="#fff" stroke="{INK}" stroke-width="2.5"/><circle cx="{dx}" cy="{dy}" r="8" fill="{INK}"/><circle cx="{rx}" cy="{ry}" r="8" fill="#fff" stroke="{INK}" stroke-width="2.5"/>'


def arrow_svg(angle):
    return f'<g transform="rotate({angle} 40 40)"><path d="M40 8 L58 30 H47 V72 H33 V30 H22 Z" fill="{INK}"/></g>'


def series_questions(kinds):
    """Five different mechanisms; none repeats, and no answer is simply a frame already shown."""
    for kind in kinds:
        if kind == 'movers':
            dot = rng.randrange(8)
            ring = (dot + rng.choice([1, 3, 5, 7])) % 8
            frames = [{'dot': (dot + t) % 8, 'ring': (ring - 3 * t) % 8} for t in range(5)]
            correct = frames[4]
            pool = [{'dot': d, 'ring': r} for d in range(8) for r in range(8) if d != r and {'dot': d, 'ring': r} != correct]
            near = [p for p in pool if (p['dot'] == correct['dot']) != (p['ring'] == correct['ring'])]
            opts = [correct, *rng.sample(near, 2), rng.choice([p for p in pool if p['dot'] != correct['dot'] and p['ring'] != correct['ring']])]
            draw = lambda f: movers_svg(f['dot'], f['ring'])
            why = 'The black dot moves one place clockwise each time, and the white circle moves three places anticlockwise.'
        elif kind == 'sides':
            fills = rng.sample(['white', 'black'], 2)
            frames = [{'sides': 3 + t, 'fill': fills[t % 2]} for t in range(5)]
            correct = frames[4]
            opts = [correct, {'sides': 7, 'fill': fills[1]}, {'sides': 6, 'fill': fills[0]}, {'sides': 8, 'fill': fills[0]}]
            draw = lambda f: shape(KIND_OF[f['sides']], 40, 42, 34, f['fill'])
            why = f'Each shape has one more side than the one before, and the shading alternates. The next shape is a heptagon (7 sides), shaded {fills[0]}.'
        elif kind == 'arrow':
            start = rng.choice(range(0, 360, 45))
            frames = [{'angle': (start + 45 * t) % 360} for t in range(5)]
            correct = frames[4]
            opts = [correct, *({'angle': (start + 45 * k) % 360} for k in (3, 5, 6))]
            draw = lambda f: arrow_svg(f['angle'])
            why = 'The arrow turns 45° clockwise each time, so after the fourth arrow it has turned 180° from the first.'
        elif kind == 'count':
            k1, k2 = rng.sample(['circle', 'pentagon', 'hexagon'], 2)  # no squares: grid cells are squares with dots
            frames = [{'shape': (k1, k2)[t % 2], 'dots': 1 + t} for t in range(5)]
            correct = frames[4]
            opts = [correct, {'shape': k2, 'dots': 5}, {'shape': k1, 'dots': 4}, {'shape': k1, 'dots': 6}]
            draw = lambda f: shape(f['shape'], 40, 40, 34) + dots_svg(f['dots'], 40, 40)
            why = f'The shapes take turns, {k1} then {k2}, and each has one more dot than the one before. Next is a {k1} with 5 dots.'
        else:
            start = rng.choice([0, 90, 180, 270])
            frames = [{'size': 12 + 6 * t, 'angle': (start + 90 * t) % 360} for t in range(5)]
            correct = frames[4]
            opts = [correct, {'size': 30, 'angle': correct['angle']}, {'size': 36, 'angle': (start + 90) % 360}, {'size': 36, 'angle': (start + 180) % 360}]
            draw = lambda f: f'<g transform="rotate({f["angle"]} 40 40)">' + shape('triangle', 40, 42, f['size'], 'black') + '</g>'
            why = 'Each triangle is bigger than the one before and makes a quarter turn clockwise. The next one is the biggest so far and points the same way as the first.'
        assert len({model(o) for o in opts}) == 4
        rng.shuffle(opts)
        answer = place(opts, correct)
        body = text(24, 30, 'Which option comes next in the series?', anchor='start')
        body += ''.join(figure('frame', '', 30 + i * 110, 45, f, draw(f)) for i, f in enumerate(frames[:4]))
        body += text(500, 95, '?', 40, weight='bold')
        body += ''.join(figure('option', LABELS[i], 45 + i * 140, 160, o, draw(o)) + text(85 + i * 140, 265, LABELS[i]) for i, o in enumerate(opts))
        diagram = write_svg('series', {'kind': kind}, 600, 285, body)
        add(N, 'Which option comes next in the series?', answer, why + f' That is option {answer}.', options=list('ABCD'), diagram=diagram)


LINES = {'v': (31, 8, 31, 54), 'h': (8, 31, 54, 31), 'd': (11, 11, 51, 51), 'u': (11, 51, 51, 11)}  # vertical, horizontal and the two diagonals


def cell_svg(c):
    if 'count' in c:
        return ''.join(shape(c['shape'], 31 + (i - (c['count'] - 1) / 2) * 19, 31, 7 if c['shape'] == 'circle' else 8.5, 'black', 1.5) for i in range(c['count']))
    if 'fill' in c:
        return shape(c['shape'], 31, 33, 22, c['fill'])
    if 'angle' in c:
        return f'<g transform="rotate({c["angle"]} 31 31)"><path d="M31 7 L45 25 H36 V55 H26 V25 H17 Z" fill="{INK}"/></g>'
    if 'dots' in c:
        return dots_svg(c['dots'], 31, 31)
    return ''.join(f'<line x1="{LINES[l][0]}" y1="{LINES[l][1]}" x2="{LINES[l][2]}" y2="{LINES[l][3]}" stroke="{INK}" stroke-width="3.5" stroke-linecap="round"/>' for l in c['lines'])


LINE_RULES = {'union': lambda a, b: a | b, 'xor': lambda a, b: a ^ b, 'both': lambda a, b: a & b, 'first': lambda a, b: a, 'second': lambda a, b: b,
              'minus': lambda a, b: a - b}
SUM_RULES = {'sum': lambda a, b: a + b, 'product': lambda a, b: a * b, 'difference': lambda a, b: abs(a - b), 'larger': max, 'sum+1': lambda a, b: a + b + 1,
             'double first': lambda a, b: 2 * a, 'double second': lambda a, b: 2 * b}


def only_rule(rules, name, rows):
    """True when the named rule is the only one that fits the complete rows."""
    return [k for k, f in rules.items() if all(f(a, b) == c for a, b, c in rows)] == [name]


def matrix_questions(kinds):
    """Six grids, each with a different rule. The two line grids share no row, and neither shows the other's answer."""
    line_pictures, line_answers, line_rows = set(), set(), set()
    for kind in kinds:
        while True:
            if kind == 'count':
                shapes, counts = rng.sample(['circle', 'square', 'triangle', 'pentagon'], 3), rng.sample([1, 2, 3], 3)
                grid = [[{'shape': shapes[r], 'count': counts[c]} for c in range(3)] for r in range(3)]
                opts = [grid[2][2], {'shape': shapes[2], 'count': counts[1]}, {'shape': shapes[1], 'count': counts[2]}, {'shape': shapes[0], 'count': counts[0]}]
                why = f'Each row uses one shape and each column has the same number of shapes. The missing square needs {counts[2]} {shapes[2]}{"s" if counts[2] > 1 else ""}.'
            elif kind == 'latin':
                shapes, fills, shift = rng.sample(['circle', 'square', 'triangle', 'pentagon'], 3), rng.sample(['white', 'grey', 'black'], 3), rng.choice([1, 2])
                grid = [[{'shape': shapes[c], 'fill': fills[(r * shift + c) % 3]} for c in range(3)] for r in range(3)]
                right = grid[2][2]
                others = [f for f in fills if f != right['fill']]
                opts = [right, {'shape': shapes[2], 'fill': others[0]}, {'shape': shapes[2], 'fill': others[1]}, {'shape': shapes[1], 'fill': right['fill']}]
                why = f'Each column keeps the same shape, and each row and column has one white, one grey and one black shape. The missing square is a {right["fill"]} {shapes[2]}.'
            elif kind == 'arrow':
                starts = rng.sample(range(0, 360, 45), 3)
                if (starts[1] - starts[0]) % 360 == (starts[2] - starts[1]) % 360:
                    continue
                grid = [[{'angle': (starts[r] + 90 * c) % 360} for c in range(3)] for r in range(3)]
                opts = [grid[2][2], {'angle': (starts[2] + 90) % 360}, {'angle': (starts[2] + 270) % 360}, {'angle': (starts[1] + 180) % 360}]
                why = 'Along each row the arrow makes a quarter turn clockwise each time, so the missing arrow points the opposite way to the first arrow in the bottom row.'
            elif kind == 'sum':
                pairs = [rng.sample(range(1, 5), 2) for _ in range(3)]
                if not only_rule(SUM_RULES, 'sum', [(a, b, a + b) for a, b in pairs[:2]]):
                    continue
                grid = [[{'dots': a}, {'dots': b}, {'dots': a + b}] for a, b in pairs]
                a, b = pairs[2]
                opts = [grid[2][2], {'dots': a + b - 1}, {'dots': a + b + 1}, {'dots': a * b if a * b not in (a + b - 1, a + b, a + b + 1) else abs(a - b)}]
                why = f'In each row the third box has as many dots as the first two boxes together. {a} + {b} = {a + b}.'
            else:
                pairs = [(frozenset(rng.sample('vhdu', rng.choice([1, 2]))), frozenset(rng.sample('vhdu', rng.choice([1, 2])))) for _ in range(3)]
                rule = LINE_RULES[kind]
                rows = [(a, b, rule(a, b)) for a, b in pairs]
                if not all(c for _, _, c in rows) or not only_rule(LINE_RULES, kind, rows[:2]):
                    continue
                grid = [[{'lines': sorted(a)}, {'lines': sorted(b)}, {'lines': sorted(c)}] for a, b, c in rows]
                a, b, c = rows[2]
                other = LINE_RULES['xor' if kind == 'union' else 'union'](a, b)
                extra = sorted(set('vhdu') - c)
                opts = [grid[2][2], {'lines': sorted(other)}, {'lines': sorted(a)}, {'lines': sorted(c | {extra[0]})} if extra else {'lines': sorted(b)}]
                if not all(o['lines'] for o in opts):
                    continue
                pictures = {tuple(sorted(x)) for row in rows for x in row} | {tuple(o['lines']) for o in opts}
                row_pairs = {(tuple(sorted(a)), tuple(sorted(b))) for a, b, _ in rows}
                if tuple(sorted(c)) in line_pictures or pictures & line_answers or row_pairs & line_rows:
                    continue
                why = ('In each row the third box shows every line from the first two boxes together.' if kind == 'union' else
                       'In each row the third box shows the lines that appear in only one of the first two boxes. A line in both boxes disappears.')
            if len({model(o) for o in opts}) == 4:
                break
        if kind in ('union', 'xor'):
            line_pictures |= pictures
            line_answers.add(tuple(sorted(c)))
            line_rows |= row_pairs
        correct = grid[2][2]
        rng.shuffle(opts)
        answer = place(opts, correct)
        body = text(24, 30, 'Which option completes the grid?', anchor='start')
        for r in range(3):
            for c in range(3):
                x, y = 40 + c * 70, 45 + r * 70
                body += f'<rect x="{x}" y="{y}" width="64" height="64" fill="#fff" stroke="{INK}" stroke-width="1.5"/>'
                if (r, c) == (2, 2):
                    body += text(x + 32, y + 44, '?', 32, weight='bold')
                else:
                    body += figure('cell', f'{r}{c}', x + 1, y + 1, grid[r][c], cell_svg(grid[r][c]))
        for i, o in enumerate(opts):
            x, y = 300 + (i % 2) * 140, 55 + (i // 2) * 105
            body += f'<rect x="{x}" y="{y}" width="64" height="64" fill="#fff" stroke="{INK}" stroke-width="1.5"/>' + figure('option', LABELS[i], x + 1, y + 1, o, cell_svg(o)) + text(x + 90, y + 40, LABELS[i])
        diagram = write_svg('matrix', {'kind': kind}, 600, 265, body)
        add(N, 'Which option completes the grid?', answer, why + f' That is option {answer}.', 'challenge', options=list('ABCD'), diagram=diagram)


def nested_svg(f):
    # A white outline keeps the inner shape's full size visible on a black outer shape.
    edge = '#fff' if f['outerFill'] == 'black' else INK
    return shape(f['outer'], 40, 40, 34, f['outerFill']) + shape(f['inner'], 40, 42 if f['inner'] == 'triangle' else 40, 14, f['innerFill'], 2).replace(f'stroke="{INK}"', f'stroke="{edge}"')


def analogy_questions(kinds):
    """Five different changes: quarter turn, shading swap, one side fewer, half turn and mirror image."""
    for kind in kinds:
        meta = {'kind': kind}
        if kind in ('quarter', 'half-turn', 'mirror'):
            a, c = rng.choice(turns(POOL.pop())), rng.choice(turns(POOL.pop()))
            if kind == 'quarter':
                b, correct, opts = turns(a)[1], turns(c)[1], [turns(c)[1], turns(c)[3], flip(c), normal(c)]
                why = 'The first shape turns 90° clockwise to make the second, so turn the third shape 90° clockwise.'
            elif kind == 'half-turn':
                b, correct, opts = turns(a)[2], turns(c)[2], [turns(c)[2], turns(c)[1], turns(c)[3], flip(c)]
                why = 'The first shape turns halfway round (180°) to make the second, so turn the third shape halfway round.'
            else:
                b, correct, opts = flip(a), flip(c), [flip(c), normal(c), turns(c)[2], normal([(-r, q) for r, q in c])]
                why = 'The second shape is the first one reflected from left to right, so reflect the third shape in the same way.'
            pair = [a, b, c]
            draw = lambda o, role, label, x, y: centred(role, label, x + 40, y, o)
        elif kind == 'swap':
            kinds_ = rng.sample(['circle', 'square', 'hexagon', 'pentagon'], 4)
            fx, fy = rng.sample(['white', 'black', 'striped', 'grey'], 2)
            a = {'outer': kinds_[0], 'outerFill': fx, 'inner': kinds_[1], 'innerFill': fy}
            b = dict(a, outerFill=fy, innerFill=fx)
            gx, gy = rng.sample(['white', 'black', 'striped', 'grey'], 2)
            c = {'outer': kinds_[2], 'outerFill': gx, 'inner': kinds_[3], 'innerFill': gy}
            correct = dict(c, outerFill=gy, innerFill=gx)
            pair = [a, b, c]
            opts = [correct, c, dict(c, outerFill=gy, innerFill=gy), dict(c, outerFill=gx, innerFill=gx)]
            draw = lambda o, role, label, x, y: figure(role, label, x, y, o, nested_svg(o))
            why = 'The outer and inner shapes swap their shading, so do the same to the third figure.'
        else:
            # Loses a side and gains stripes, so it never repeats the sides series (which adds a side and alternates black and white).
            n = rng.choice([5, 6, 7, 8])
            m = rng.choice([k for k in [5, 6, 7] if k != n])
            pair = [{'sides': n, 'fill': 'white'}, {'sides': n - 1, 'fill': 'striped'}, {'sides': m, 'fill': 'white'}]
            correct = {'sides': m - 1, 'fill': 'striped'}
            opts = [correct, {'sides': m - 1, 'fill': 'white'}, {'sides': m, 'fill': 'striped'}, {'sides': m - 2, 'fill': 'striped'}]
            draw = lambda o, role, label, x, y: figure(role, label, x, y, o, shape(KIND_OF[o['sides']], 40, 42, 34, o['fill']))
            why = 'The shape loses one side and becomes striped, so the third shape needs one side fewer and stripes.'
        assert len({model(o) for o in opts}) == 4
        rng.shuffle(opts)
        answer = place(opts, correct)
        a_, b_, c_ = pair
        body = text(24, 30, 'Make the same change to the third shape.', anchor='start')
        body += draw(a_, 'a', '', 20, 45) + text(125, 90, '→', 30) + draw(b_, 'b', '', 150, 45)
        body += draw(c_, 'c', '', 300, 45) + text(405, 90, '→', 30) + text(470, 98, '?', 40, weight='bold')
        body += ''.join(draw(o, 'option', LABELS[i], 45 + i * 140, 160) + text(85 + i * 140, 265, LABELS[i]) for i, o in enumerate(opts))
        diagram = write_svg('analogy', meta, 600, 285, body)
        add(N, 'The first shape changes into the second. Which option shows the third shape after the same change?', answer,
            why + f' That is option {answer}.', 'challenge', options=list('ABCD'), diagram=diagram)


FOLD_ACROSS, FOLD_DOWN = ('left', 'right', 'left-up'), ('up', 'left-up')


def unfold(fold, holes):
    out = set(map(tuple, holes))
    if fold in FOLD_ACROSS:
        out |= {(r, 3 - c) for r, c in out}
    if fold in FOLD_DOWN:
        out |= {(3 - r, c) for r, c in out}
    return tuple(sorted(out))


def paper_svg(holes, cols=4, rows=4, fold_edges=(), col0=0):
    s = 17
    out = f'<rect class="paper" x="{col0 * s}" y="0" width="{cols * s}" height="{rows * s}" fill="#fff" stroke="{INK}" stroke-width="2"/>'
    for edge in fold_edges:
        x1, y1, x2, y2 = {'right': ((col0 + cols) * s, 0, (col0 + cols) * s, rows * s), 'left': (col0 * s, 0, col0 * s, rows * s),
                          'bottom': (col0 * s, rows * s, (col0 + cols) * s, rows * s)}[edge]
        out += f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{INK}" stroke-width="3" stroke-dasharray="6 4"/>'
    return out + ''.join(f'<circle class="hole" cx="{c * s + s / 2}" cy="{r * s + s / 2}" r="5" fill="{INK}"/>' for r, c in holes)


def folding_questions(folds):
    seen = set()  # every option picture appears in only one folding question
    for fold in folds:
        cols = 2 if fold in FOLD_ACROSS else 4
        rows = 2 if fold in FOLD_DOWN else 4
        col0 = 2 if fold == 'right' else 0
        while True:
            holes = tuple(sorted(rng.sample([(r, c) for r in range(rows) for c in range(col0, col0 + cols)], rng.choice([1, 2]))))
            correct = unfold(fold, holes)
            wrong_axis = unfold({'left': 'up', 'right': 'up', 'up': 'left', 'left-up': 'left'}[fold], holes)
            moves = {'left': [(0, 0), (0, 2)], 'right': [(0, 0), (0, -2)], 'up': [(0, 0), (2, 0)], 'left-up': [(0, 0), (0, 2), (2, 0), (2, 2)]}[fold]
            shifted = tuple(sorted({(r + dr, c + dc) for r, c in holes for dr, dc in moves}))
            opts = [correct, tuple(holes), wrong_axis, shifted]
            if len(set(opts)) == 4 and not set(opts) & seen:
                break
        seen |= set(opts)
        rng.shuffle(opts)
        answer = place(opts, correct)
        steps = {'left': 'Fold the right half over onto the left half, then punch.', 'right': 'Fold the left half over onto the right half, then punch.',
                 'up': 'Fold the bottom half up onto the top half, then punch.', 'left-up': 'Fold right onto left, then bottom onto top, then punch.'}[fold]
        body = text(24, 30, steps, anchor='start')
        body += f'<g transform="translate(40 50)"><rect x="0" y="0" width="68" height="68" fill="#fff" stroke="{INK}" stroke-width="2"/>'
        if fold in FOLD_ACROSS:
            body += f'<line x1="34" y1="-6" x2="34" y2="74" stroke="{INK}" stroke-width="2.5" stroke-dasharray="6 4"/>'
            body += (f'<path d="M10 20 Q22 4 32 16" fill="none" stroke="{INK}" stroke-width="2"/><path d="M32 16 l-1 -8 l-6 5 Z" fill="{INK}"/>' if fold == 'right' else
                     f'<path d="M58 20 Q46 4 36 16" fill="none" stroke="{INK}" stroke-width="2"/><path d="M36 16 l1 -8 l6 5 Z" fill="{INK}"/>')
        if fold in FOLD_DOWN:
            body += f'<line x1="-6" y1="34" x2="74" y2="34" stroke="{INK}" stroke-width="2.5" stroke-dasharray="6 4"/><path d="M20 60 Q4 48 16 38" fill="none" stroke="{INK}" stroke-width="2"/><path d="M16 38 l-7 1 l5 6 Z" fill="{INK}"/>'
        body += '</g>' + text(150, 90, '→', 30)
        edges = ({'left': ['right'], 'right': ['left'], 'up': ['bottom'], 'left-up': ['right', 'bottom']})[fold]
        body += figure('folded', '', 200, 50, {'fold': fold, 'holes': holes}, paper_svg(holes, cols, rows, edges, col0)) + text(330, 90, '→  unfolded?', 20, 'start')
        body += ''.join(figure('option', LABELS[i], 51 + i * 140, 160, {'holes': o}, paper_svg(o)) + text(85 + i * 140, 250, LABELS[i]) for i, o in enumerate(opts))
        diagram = write_svg('folding', {'fold': fold}, 600, 270, body)
        twice = fold == 'left-up'
        add(N, 'The square of paper is folded as shown and holes are punched through every layer. Which option shows the paper when it is unfolded?', answer,
            ('Each fold doubles the holes: unfolding reflects them in both fold lines, so every hole appears four times.' if twice else
             'Unfolding reflects each hole in the fold line, so every hole appears twice: once where it was punched and once in the mirror position.') + f' That is option {answer}.',
            'challenge', options=list('ABCD'), diagram=diagram)


def cube_net(cells):
    cells = set(cells)
    if any({(r, c + 1), (r + 1, c), (r + 1, c + 1)} <= cells for r, c in cells):
        return False
    start = min(cells)
    state = {start: ('bottom', 'top', 'north', 'south', 'east', 'west')}
    queue = [start]
    while queue:
        r, c = queue.pop()
        b, t, n, s, e, w = state[(r, c)]
        for (dr, dc), nxt in (((0, 1), (e, w, n, s, t, b)), ((0, -1), (w, e, n, s, b, t)), ((-1, 0), (n, s, t, b, e, w)), ((1, 0), (s, n, b, t, e, w))):
            cell = (r + dr, c + dc)
            if cell in cells and cell not in state:
                state[cell] = nxt
                queue.append(cell)
    return len({v[0] for v in state.values()}) == 6


def net_questions(count):
    """No net appears in more than one question, right or wrong."""
    free = polyominoes(6)
    assert len(free) == 35
    nets = [p for p in free if cube_net(p)]
    others = [p for p in free if not cube_net(p)]
    assert len(nets) == 11
    wrong = rng.sample(others, 3 * count)
    for q, net in enumerate(rng.sample(nets, count)):
        opts = [rng.choice(turns(net))] + [rng.choice(turns(p)) for p in wrong[3 * q:3 * q + 3]]
        correct = opts[0]
        rng.shuffle(opts)
        answer = place(opts, correct)
        body = text(24, 30, 'Which net folds to make a cube?', anchor='start')
        for i, o in enumerate(opts):
            w, h = extent(o, 16)
            cells = ''.join(f'<rect x="{c * 16}" y="{r * 16}" width="16" height="16" fill="#d9e8df" stroke="{INK}" stroke-width="2"/>' for r, c in o)
            body += figure('option', LABELS[i], 85 + i * 140 - w // 2, 60 + (96 - h) // 2, {'cells': o}, cells) + text(85 + i * 140, 190, LABELS[i])
        diagram = write_svg('cube-net', {}, 600, 210, body)
        add(N, 'Which of these nets can be folded to make a cube?', answer,
            f'Only net {answer} folds into a cube: each of its six squares becomes a different face. In each of the other nets, two squares would end up covering the same face.',
            'challenge', options=list('ABCD'), diagram=diagram)


def nonverbal():
    POOL[:] = rng.sample(POOL, len(POOL))
    assert len(POOL) >= 18, len(POOL)
    rotation_questions(6)
    reflection_questions(5)
    code_questions([(['shape', 'fill'], 4), (['shape', 'fill'], 4), (['fill', 'shape'], 4), (['shape', 'fill'], 5), (['shape', 'fill', 'dot'], 5), (['fill', 'shape', 'dot'], 5)])
    odd_questions(['inner', 'dots', 'half', 'mirror', 'arrow'])
    series_questions(['movers', 'sides', 'arrow', 'count', 'grow'])
    matrix_questions(['count', 'latin', 'arrow', 'sum', 'union', 'xor'])
    analogy_questions(['quarter', 'swap', 'poly', 'half-turn', 'mirror'])
    folding_questions(['left', 'up', 'right', 'left-up', 'left', 'left-up'])
    net_questions(6)

maths()
english()
verbal()
nonverbal()
counts = {s: sum(q['subject'] == s for q in bank) for s in (M, E, V, N)}
assert counts == {M: 50, E: 50, V: 50, N: 50}, counts
(ROOT / 'lib' / 'entrance-questions.ts').write_text(
    "import type {Question} from './questions';\n"
    "// 200 original 11+ entrance-exam questions (Year 6 → Year 7). Generated by scripts/generate-entrance-questions.py.\n"
    "export const entranceQuestions:Question[]=" + json.dumps(bank, ensure_ascii=False, indent=2) + ";\n", encoding='utf-8')
(ROOT / 'tests' / 'entrance-question-cases.json').write_text(json.dumps(cases, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('wrote', len(bank), 'questions,', len(cases), 'checks,', asset_counter[0] - 3000, 'diagrams')
