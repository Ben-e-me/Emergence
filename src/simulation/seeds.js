/**
 * @file seeds.js
 * @description Seed initializers for the Game of Life universe.
 * @architecture
 * - Each export returns a function compatible with the reset() seedInitializer signature.
 * - Pure: no side effects, no React dependencies.
 */

/**
 * Returns a seed initializer that fills the grid with random live cells.
 *
 * @param {number} [density=0.35] - Fraction of cells to set alive (0–1).
 * @returns {(grid: Uint8Array) => void}
 */
export function randomSeed(density = 0.35) {
  return (grid) => {
    for (let i = 0; i < grid.length; i += 1) {
      grid[i] = Math.random() < density ? 1 : 0;
    }
  };
}
