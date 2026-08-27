window.GUIDE_OVERRIDES = {
  spriteFallbacks: {},
  formSpriteFallbacks: {},
  hiddenPokemonKeys: [],
  pokemonAliases: {},
  battleSpeciesAliases: {},
  displayNames: {},
  formLabels: {},
  sharedLearnsets: [],
  // User-confirmed v2.0.2 gift move. The Route 34 script gives Magby through
  // `giveoddegg 7`; Dizzy Punch is carried by that special Odd Egg Magby and
  // is not part of Magby's ordinary breedable egg-move table.
  specialMoveAcquisitions: {
    Magby: [{moveId: 146, method: 'Odd Egg · Route 34 Day Care'}]
  },
  encounterMethodOrder: ['Wild', 'Rock Smash / Headbutt', 'Tree', 'Rock', 'Surf', 'Fish', 'Dive'],
  fishingRodOrder: ['Old Rod', 'Good Rod', 'Super Rod'],
  requireFishingRod: true,
  starterChoices: [],
  profileDefaults: {
    name: 'Trainer',
    gender: 'male',
    costume: 'gold',
    starter: '',
    rivalName: 'Silver'
  },
  // Official v2.0.2 front sprites from graphics/trainers/front_pics.
  trainerCostumes: [
    {id: 'gold', name: 'Gold', gender: 'male', sprite: 'assets/trainers/gold_hns.png'},
    {id: 'kris', name: 'Kris', gender: 'female', sprite: 'assets/trainers/kris_hns.png'}
  ],
  rivalSprite: 'assets/trainers/silver_hns.png',
  rivalStarterCounters: {},
  acquisitionNotes: {},
  mapPositions: {}
};
