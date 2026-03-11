/**
 * @file simulationConstants.js
 * @description Shared constants for the Game of Life simulation configuration.
 * @architecture
 * - Centralizes grid dimensions, timing, and rule presets to avoid magic numbers.
 * - Used by both hooks and pure simulation utilities.
 */

/** Default number of columns in the simulation grid for the initial experience. */
export const DEFAULT_GRID_WIDTH = 96;

/** Default number of rows in the simulation grid for the initial experience. */
export const DEFAULT_GRID_HEIGHT = 54;

/** Minimum allowed generations per second for the simulation loop. */
export const MIN_GENERATIONS_PER_SECOND = 1;

/** Maximum allowed generations per second for the simulation loop. */
export const MAX_GENERATIONS_PER_SECOND = 60;

/** Default target generations per second, tuned for a calm but responsive feel. */
export const DEFAULT_GENERATIONS_PER_SECOND = 12;

/**
 * Conway's Game of Life classic rule in B/S notation.
 * - B3/S23: a dead cell with 3 neighbors is born; a live cell with 2–3 neighbors survives.
 */
export const RULE_CONWAY_CLASSIC = {
  born: [3],
  survive: [2, 3],
};

/**
 * HighLife rule in B/S notation.
 * - B36/S23: adds a birth condition at 6 neighbors, enabling additional glider-like structures.
 */
export const RULE_HIGH_LIFE = {
  born: [3, 6],
  survive: [2, 3],
};

/**
 * Dead Universe rule in B/S notation.
 * - B2/S0: tends to collapse quickly, useful for illustrating how fragile emergence can be.
 */
export const RULE_DEAD_UNIVERSE = {
  born: [2],
  survive: [],
};

