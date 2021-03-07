export const hints = {
  startingCount: `How many tiles of the starting scale should be
    placed before moving on to the next scale.`,
  startingSize: `The size of the first set of tiles placed, as a percentage
    of the longest side of the canvas.`,
  scaleRatio: 'Each successive set of tiles will be scaled by this amount.',
  scaleFrequency: `Increase the number of tiles in each subsequent set
    by this amount.`,
  strictFrequency: `Do not move on to the next set of tiles until all tiles
    of the current size have been placed. This may cause incomplete tilings if
    sufficient space for the remaining tiles does not exist.`,
  maxScaleLevels: `The maximum number of times to re-scale the tile from the
    original size. Once this level is reached, tiles will not be made any
    smaller.`,
  padding: 'The "breathing room" to leave around the tiles.',
  rotation: `Randomly rotate placed tiles in these increments. Use 1° for
    totally random placement, and something larger (e.g. 30°, 90°) for more
    regular patterns.`,
  wiggle: 'Randomly "wiggle" the rotation and size by +/- this amount.',
  spiral: 'The spiral path to follow when attempting to place new tiles.',
  twoPass: `Resize all placed tiles for the best fit after processing is
    complete.`,
  debug: 'Show calculated collision boundaries.'
}
