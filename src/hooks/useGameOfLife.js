/**
 * @file useGameOfLife.js
 * @description React hook orchestrating a typed-array-based Game of Life simulation with rule presets.
 * @architecture
 * - Holds the Uint8Array grid and Uint16Array ages, but exposes them as read-only to callers.
 * - Uses a requestAnimationFrame loop with frame-delta timing to maintain consistent speed.
 * - Delegates the pure step logic to src/simulation/universe.js.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_GENERATIONS_PER_SECOND,
  DEFAULT_GRID_HEIGHT,
  DEFAULT_GRID_WIDTH,
  RULE_CONWAY_CLASSIC,
} from '../constants/simulationConstants.js';
import { stepUniverse } from '../simulation/universe.js';

/**
 * @typedef {{ born: number[]; survive: number[] }} RulePreset
 */

/**
 * @typedef {Object} UseGameOfLifeOptions
 * @property {number} [width] - Number of columns in the grid.
 * @property {number} [height] - Number of rows in the grid.
 * @property {RulePreset} [rule] - Rule in B/S notation.
 * @property {number} [generationsPerSecond] - Target speed (generations per second).
 * @property {boolean} [autoStart] - Whether to start the simulation immediately.
 */

/**
 * @typedef {Object} UseGameOfLifeResult
 * @property {Uint8Array} grid - Current universe grid (0 = dead, 1 = alive).
 * @property {Uint16Array} ages - Number of generations each cell has survived.
 * @property {boolean} isRunning - Whether the simulation loop is currently advancing.
 * @property {() => void} step - Advance the simulation by exactly one generation.
 * @property {() => void} toggleRunning - Toggle between running and paused states.
 * @property {(seedInitializer?: (grid: Uint8Array) => void) => void} reset - Reset the universe, optionally seeding cells.
 */

/**
 * Creates a zeroed universe with typed arrays sized for the grid.
 * The arrays are allocated up front to avoid GC pressure during animation.
 *
 * @param {number} width - Grid width in cells.
 * @param {number} height - Grid height in cells.
 * @returns {{ grid: Uint8Array; ages: Uint16Array }}
 */
function createUniverse(width, height) {
  const size = width * height;
  return {
    grid: new Uint8Array(size),
    ages: new Uint16Array(size),
  };
}

/**
 * React hook that manages a Game of Life simulation using typed arrays and requestAnimationFrame.
 *
 * @param {UseGameOfLifeOptions} [options]
 * @returns {UseGameOfLifeResult}
 */
export function useGameOfLife(options = {}) {
  const {
    width = DEFAULT_GRID_WIDTH,
    height = DEFAULT_GRID_HEIGHT,
    rule = RULE_CONWAY_CLASSIC,
    generationsPerSecond = DEFAULT_GENERATIONS_PER_SECOND,
    autoStart = false,
  } = options;

  const [isRunning, setIsRunning] = useState(autoStart);

  const frontUniverseRef = useRef(createUniverse(width, height));
  const backUniverseRef = useRef(createUniverse(width, height));

  /* eslint react-hooks/refs: "off" */
  const [gridView, setGridView] = useState(() => frontUniverseRef.current.grid);
  const [agesView, setAgesView] = useState(() => frontUniverseRef.current.ages);

  const targetDeltaMs = useMemo(
    () => (generationsPerSecond > 0 ? 1000 / generationsPerSecond : Number.POSITIVE_INFINITY),
    [generationsPerSecond],
  );

  const lastStepTimeRef = useRef(0);
  const rafIdRef = useRef(/** @type {number | null} */ (null));

  const step = useCallback(() => {
    const front = frontUniverseRef.current;
    const back = backUniverseRef.current;

    stepUniverse(front.grid, front.ages, back.grid, back.ages, width, height, rule);

    // Swap buffers to reuse existing allocations on the next frame and align view state.
    frontUniverseRef.current = back;
    backUniverseRef.current = front;
    setGridView(frontUniverseRef.current.grid);
    setAgesView(frontUniverseRef.current.ages);
  }, [height, rule, width]);

  const reset = useCallback((seedInitializer) => {
    const front = frontUniverseRef.current;
    const back = backUniverseRef.current;

    front.grid.fill(0);
    front.ages.fill(0);
    back.grid.fill(0);
    back.ages.fill(0);

    if (seedInitializer) {
      seedInitializer(front.grid);
    }
    setGridView(front.grid);
    setAgesView(front.ages);
  }, []);

  const toggleRunning = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!isRunning) {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      return undefined;
    }

    lastStepTimeRef.current = performance.now();

    const loop = (now) => {
      const elapsed = now - lastStepTimeRef.current;

      if (elapsed >= targetDeltaMs) {
        step();
        lastStepTimeRef.current = now;
      }

      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [isRunning, step, targetDeltaMs]);

  return {
    grid: gridView,
    ages: agesView,
    isRunning,
    step,
    toggleRunning,
    reset,
  };
}
