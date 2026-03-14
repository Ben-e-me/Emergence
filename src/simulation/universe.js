/**
 * @file universe.js
 * @description Pure functions for advancing a Game of Life universe.
 * @architecture
 * - Operates on typed arrays (Uint8Array grid, Uint16Array ages) for performance and predictability.
 * - Double-buffering is the caller's responsibility; these functions write into a provided next buffer.
 * - No React or browser dependencies — safe to test in isolation.
 */

/**
 * @typedef {{ born: number[]; survive: number[] }} RulePreset
 */

/**
 * Produces the next generation into the provided next-buffer arrays.
 * Does not allocate; all writes go into nextGrid and nextAges.
 *
 * @param {Uint8Array} currentGrid
 * @param {Uint16Array} currentAges
 * @param {Uint8Array} nextGrid
 * @param {Uint16Array} nextAges
 * @param {number} width
 * @param {number} height
 * @param {RulePreset} rule
 */
export function stepUniverse(currentGrid, currentAges, nextGrid, nextAges, width, height, rule) {
  const { born, survive } = rule;

  const bornMask = new Set(born);
  const surviveMask = new Set(survive);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      const isAlive = currentGrid[index] === 1;

      let neighbors = 0;
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (dx === 0 && dy === 0) continue;
          const nx = (((x + dx) % width) + width) % width;
          const ny = (((y + dy) % height) + height) % height;
          const nIndex = ny * width + nx;
          if (currentGrid[nIndex] === 1) {
            neighbors += 1;
          }
        }
      }

      if (isAlive) {
        if (surviveMask.has(neighbors)) {
          nextGrid[index] = 1;
          nextAges[index] = /** @type {number} */ (currentAges[index] + 1);
        } else {
          nextGrid[index] = 0;
          nextAges[index] = 0;
        }
      } else {
        if (bornMask.has(neighbors)) {
          nextGrid[index] = 1;
          nextAges[index] = 1;
        } else {
          nextGrid[index] = 0;
          nextAges[index] = 0;
        }
      }
    }
  }
}
