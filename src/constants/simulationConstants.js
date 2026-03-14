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

/**
 * Maximum generations per second — high enough to support 64× speed steps.
 * The rAF loop batches multiple advances per frame when GPS exceeds display refresh rate.
 */
export const MAX_GENERATIONS_PER_SECOND = 800;

/** Default target generations per second (1× speed step). */
export const DEFAULT_GENERATIONS_PER_SECOND = 12;

/** Maximum advances to run per animation frame when batching high-speed steps. */
export const MAX_STEPS_PER_FRAME = 64;

/**
 * Discrete speed steps available in the UI, expressed as generations per second.
 * Labels follow exponential notation; each step doubles the previous.
 */
export const SPEED_STEPS = [
  { label: '0.25×', gps: 3 },
  { label: '0.5×', gps: 6 },
  { label: '1×', gps: 12 },
  { label: '2×', gps: 24 },
  { label: '4×', gps: 48 },
  { label: '8×', gps: 96 },
  { label: '16×', gps: 192 },
  { label: '32×', gps: 384 },
  { label: '64×', gps: 768 },
];

/** Default speed step index into SPEED_STEPS (1× = 12 gps). */
export const DEFAULT_SPEED_INDEX = 2;

/**
 * Discrete zoom steps. Each step doubles the previous.
 * Fractional values zoom out; 1× fills the viewport normally; higher values magnify.
 */
export const ZOOM_STEPS = [0.25, 0.5, 1, 2, 4];

/** Default zoom step index (1× = simulation fills the viewport at natural size). */
export const DEFAULT_ZOOM_INDEX = 2;

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
