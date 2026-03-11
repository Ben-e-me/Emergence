/**
 * @file renderingConstants.js
 * @description Constants for rendering and sizing the Game of Life canvas to the viewport.
 * @architecture
 * - Expresses rendering-related numbers as named constants to avoid magic values.
 * - Used by viewport sizing hooks and canvas components.
 */

/** Minimum number of device pixels that should represent a single cell. */
export const MIN_DEVICE_PIXELS_PER_CELL = 1;

/**
 * Target number of cells along the shorter viewport axis for a balanced density.
 * This keeps the universe legible while still feeling rich.
 */
export const TARGET_CELLS_ON_SHORT_AXIS = 72;

/**
 * Maximum number of cells allowed along either axis to avoid blowing up the universe size
 * on very large or dense displays.
 */
export const MAX_CELLS_PER_AXIS = 220;

