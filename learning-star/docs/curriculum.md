# Curriculum — כוכב הלמידה

Full curriculum definitions and skill dependency graph. Read this when building activities, the adaptive engine, or the world map.

---

## Math Curriculum (Israeli 2nd Grade)

```typescript
const mathCurriculum = {
  domain1_numberSense: {
    name: 'הַכָּרַת מִסְפָּרִים',
    levels: [
      { id: 'ns1', name: 'מִסְפָּרִים 1–10',   skills: ['counting', 'recognition', 'ordering'] },
      { id: 'ns2', name: 'מִסְפָּרִים 11–20',  skills: ['teen_numbers', 'place_value_intro'] },
      { id: 'ns3', name: 'מִסְפָּרִים עַד 100', skills: ['tens', 'ones', 'place_value'] },
    ]
  },
  domain2_addition: {
    name: 'חִיבּוּר',
    levels: [
      { id: 'add1', name: 'חִיבּוּר עַד 10',    skills: ['add_objects', 'add_numberline', 'add_abstract'] },
      { id: 'add2', name: 'חִיבּוּר עַד 20',    skills: ['add_with_crossing_10', 'make_10_strategy'] },
      { id: 'add3', name: 'חִיבּוּר עֲשָׂרוֹת', skills: ['add_tens', 'add_2digit_no_carry'] },
    ]
  },
  domain3_subtraction: {
    name: 'חִיסּוּר',
    levels: [
      { id: 'sub1', name: 'חִיסּוּר עַד 10', skills: ['sub_objects', 'sub_numberline', 'sub_abstract'] },
      { id: 'sub2', name: 'חִיסּוּר עַד 20', skills: ['sub_crossing_10'] },
    ]
  },
  domain4_geometry: {
    name: 'צוּרוֹת',
    levels: [
      { id: 'geo1', name: 'צוּרוֹת בְּסִיסִיּוֹת', skills: ['circle', 'square', 'triangle', 'rectangle'] },
      { id: 'geo2', name: 'תְּכוּנוֹת צוּרוֹת',    skills: ['sides', 'corners', 'size_compare'] },
    ]
  },
  domain5_measurement: {
    name: 'מְדִידָה',
    levels: [
      { id: 'meas1', name: 'הַשְׁוָאַת גְּדָלִים', skills: ['longer_shorter', 'heavier_lighter'] },
      { id: 'meas2', name: 'שָׁעוֹן',             skills: ['full_hour', 'half_hour'] },
    ]
  },
};
```

---

## Hebrew Literacy Curriculum (Israeli 2nd Grade)

```typescript
const hebrewLiteracyCurriculum = {
  domain1_phonology: {
    name: 'צְלָלִים וְאוֹתִיּוֹת',
    levels: [
      { id: 'ph1', name: 'אוֹתִיּוֹת א–י',   skills: ['letter_recognition', 'letter_sound', 'letter_writing'] },
      { id: 'ph2', name: 'אוֹתִיּוֹת כ–ת',   skills: ['letter_recognition', 'letter_sound', 'letter_writing'] },
      { id: 'ph3', name: 'אוֹתִיּוֹת סוֹפִיּוֹת', skills: ['final_letters'] },
      { id: 'ph4', name: 'נִיקּוּד',          skills: ['kamatz', 'patach', 'tseire', 'segol', 'hirik', 'holam', 'kubutz', 'shuruk'] },
    ]
  },
  domain2_decoding: {
    name: 'קְרִיאַת מִלִּים',
    levels: [
      { id: 'dec1', name: 'הַבָּרוֹת פְּתוּחוֹת',      skills: ['cv_syllables'] },
      { id: 'dec2', name: 'הַבָּרוֹת סְגוּרוֹת',      skills: ['cvc_syllables'] },
      { id: 'dec3', name: 'מִלִּים בְּנוֹת 2 הַבָּרוֹת', skills: ['two_syllable_words'] },
      { id: 'dec4', name: 'מִלִּים אֲרֻכּוֹת',         skills: ['multi_syllable', 'common_words'] },
    ]
  },
  domain3_reading: {
    name: 'קְרִיאָה',
    levels: [
      { id: 'read1', name: 'מִשְׁפָּטִים קְצָרִים', skills: ['3_word_sentences', 'with_pictures'] },
      { id: 'read2', name: 'קְטָעִים קְצָרִים',    skills: ['2_3_sentences', 'comprehension_pictures'] },
      { id: 'read3', name: 'סִיפּוּרִים קְצָרִים', skills: ['short_stories', 'comprehension_questions'] },
    ]
  },
  domain4_writing: {
    name: 'כְּתִיבָה',
    levels: [
      { id: 'wr1', name: 'הַעְתָּקַת אוֹתִיּוֹת', skills: ['tracing', 'copying_letters'] },
      { id: 'wr2', name: 'כְּתִיבַת מִלִּים',      skills: ['spelling_cv', 'spelling_cvc'] },
      { id: 'wr3', name: 'הַשְׁלָמַת מִשְׁפָּטִים', skills: ['fill_in_word', 'choose_word'] },
    ]
  },
};
```

---

## Skill Dependency Graph

A skill is locked until all prerequisites reach mastery score ≥ 0.7.

```typescript
const skillDependencies: Record<string, string[]> = {
  // Math — Number Sense
  'teen_numbers':         ['counting', 'recognition'],
  'place_value_intro':    ['teen_numbers'],
  'tens':                 ['place_value_intro'],
  'ones':                 ['place_value_intro'],
  'place_value':          ['tens', 'ones'],

  // Math — Addition
  'add_numberline':       ['counting', 'recognition'],
  'add_abstract':         ['add_objects', 'add_numberline'],
  'add_with_crossing_10': ['add_abstract', 'place_value_intro'],
  'make_10_strategy':     ['add_with_crossing_10'],
  'add_tens':             ['place_value', 'add_abstract'],
  'add_2digit_no_carry':  ['add_tens'],

  // Math — Subtraction
  'sub_objects':          ['counting', 'add_objects'],
  'sub_numberline':       ['sub_objects', 'add_numberline'],
  'sub_abstract':         ['sub_objects', 'sub_numberline'],
  'sub_crossing_10':      ['sub_abstract', 'add_with_crossing_10'],

  // Hebrew — Decoding
  'cvc_syllables':        ['cv_syllables'],
  'two_syllable_words':   ['cv_syllables', 'cvc_syllables'],
  'multi_syllable':       ['two_syllable_words'],
  'common_words':         ['two_syllable_words'],

  // Hebrew — Reading
  '3_word_sentences':     ['two_syllable_words', 'common_words'],
  '2_3_sentences':        ['3_word_sentences'],
  'short_stories':        ['2_3_sentences'],

  // Hebrew — Writing
  'spelling_cv':          ['cv_syllables', 'letter_recognition'],
  'spelling_cvc':         ['spelling_cv', 'cvc_syllables'],
  'fill_in_word':         ['spelling_cv'],
  'choose_word':          ['two_syllable_words'],
};
```

---

## Activity Types

```typescript
const activityTypes = {
  // Math
  countingGarden:  { type: 'counting',             interaction: 'tap_to_count' },
  numberLineFrog:  { type: 'number_line',           interaction: 'tap_target' },
  mathBubbles:     { type: 'choose_answer',         interaction: 'tap_choice' },
  balanceScale:    { type: 'comparison',            interaction: 'drag_and_drop_easy' },
  shopGame:        { type: 'money_math',            interaction: 'drag_coins' },

  // Reading
  letterExplorer:  { type: 'letter_learning',       interaction: 'see_hear_trace' },
  syllableBuilder: { type: 'syllable_blending',     interaction: 'drag_combine' },
  wordMatch:       { type: 'word_recognition',      interaction: 'tap_match' },
  sentenceBuilder: { type: 'sentence_construction', interaction: 'drag_order' },
  storyTime:       { type: 'guided_reading',        interaction: 'tap_to_read' },

  // Shared
  memoryGame:      { type: 'memory_matching',       interaction: 'tap_pair' },
  puzzleWorld:     { type: 'sequencing',            interaction: 'drag_order' },
};
```

---

## Screens

1. **Welcome Screen** — personalized greeting, companion character, stars/streak
2. **World Map** — adventure map with islands: Math, Reading, Games, Stars Tower
3. **Visual Schedule** — sidebar always visible, shows today's plan
4. **Math Activities** — CRA-based mini-games
5. **Reading Activities** — MSL-based mini-games
6. **Break Screen** — auto-appears every 10–15 min, shows progress summary
7. **Parent Dashboard** — PIN-protected, detailed progress + error analysis
8. **Sticker Album** — collection by theme, visual celebration
9. **Safe Space** — quiet room, calming animations, zero tasks
10. **Settings** — parent-controlled: sound, animation level, time limits
