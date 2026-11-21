// The ten differences hidden in "The Reading Room".
//
// Each entry names one spot where the right-hand picture quietly departs
// from the left-hand one. x, y and r describe the clickable circle in scene
// coordinates (the scene is 560 x 420), shared by both panels: a click
// inside the circle on either picture finds the difference. `foundText` is
// the line the game shows when the difference is spotted.

export const DIFFERENCES = [
  { id: 'cat', x: 190, y: 282, r: 36, foundText: 'The cat slipped away!' },
  { id: 'clock', x: 250, y: 90, r: 37, foundText: 'The clock tells a different time.' },
  { id: 'curtain', x: 156, y: 128, r: 25, foundText: 'One curtain is tied back.' },
  { id: 'picture', x: 425, y: 100, r: 42, foundText: 'The picture changed its mind.' },
  { id: 'lamp', x: 347, y: 170, r: 27, foundText: 'The lamp went out.' },
  { id: 'book-color', x: 419, y: 196, r: 19, foundText: 'A book changed its coat.' },
  { id: 'missing-book', x: 458, y: 247, r: 22, foundText: 'A book is missing from the shelf.' },
  { id: 'mug', x: 63, y: 274, r: 19, foundText: 'The mug vanished.' },
  { id: 'flower', x: 308, y: 290, r: 23, foundText: 'The plant lost its flower.' },
  { id: 'rug', x: 152, y: 376, r: 26, foundText: 'The rug lost its border.' },
];

export const TOTAL_DIFFERENCES = DIFFERENCES.length;
