/**
 * @file useGameOfLife.js
 * @description React hook orchestrating a typed-array-based Game of Life simulation with rule presets.
 * @architecture
 * - Holds the Uint8Array grid and Uint16Array ages, but exposes them as read-only to callers.
 * - Uses a requestAnimationFrame loop with frame-delta timing; supports batch stepping above display refresh.
 * - Maintains a circular history buffer for stepBack support.
 * - Delegates the pure step logic to src/simulation/universe.js.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_GENERATIONS_PER_SECOND,
  DEFAULT_GRID_HEIGHT,
  DEFAULT_GRID_WIDTH,
  MAX_STEPS_PER_FRAME,
  RULE_CONWAY_CLASSIC,
} from '../constants/simulationConstants.js';
import { stepUniverse } from '../simulation/universe.js';

/** Maximum snapshots retained for stepBack. */
const HISTORY_SIZE = 32;

function createUniverse(width, height) {
  const size = width * height;
  return { grid: new Uint8Array(size), ages: new Uint16Array(size) };
}

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

  /* eslint-disable react-hooks/refs */
  const [gridView, setGridView] = useState(() => frontUniverseRef.current.grid);
  const [agesView, setAgesView] = useState(() => frontUniverseRef.current.ages);
  /* eslint-enable react-hooks/refs */

  const historyRef = useRef(/** @type {Array<{grid: Uint8Array, ages: Uint16Array}>} */ ([]));
  const [historyLength, setHistoryLength] = useState(0);

  const targetDeltaMs = useMemo(
    () => (generationsPerSecond > 0 ? 1000 / generationsPerSecond : Number.POSITIVE_INFINITY),
    [generationsPerSecond],
  );

  const lastStepTimeRef = useRef(0);
  const rafIdRef = useRef(/** @type {number | null} */ (null));

  // Internal: advance one generation without setState.
  const advance = useCallback(() => {
    const front = frontUniverseRef.current;
    const back = backUniverseRef.current;
    stepUniverse(front.grid, front.ages, back.grid, back.ages, width, height, rule);
    frontUniverseRef.current = back;
    backUniverseRef.current = front;
  }, [height, rule, width]);

  // Internal: snapshot current state into history.
  const saveSnapshot = useCallback(() => {
    const front = frontUniverseRef.current;
    historyRef.current.push({
      grid: new Uint8Array(front.grid),
      ages: new Uint16Array(front.ages),
    });
    if (historyRef.current.length > HISTORY_SIZE) {
      historyRef.current.shift();
    }
    setHistoryLength(historyRef.current.length);
  }, []);

  // Public: advance one generation + trigger render (manual step forward).
  const step = useCallback(() => {
    saveSnapshot();
    advance();
    setGridView(frontUniverseRef.current.grid);
    setAgesView(frontUniverseRef.current.ages);
  }, [advance, saveSnapshot]);

  // Public: restore the previous snapshot (manual step back).
  const stepBack = useCallback(() => {
    if (historyRef.current.length === 0) return;
    const prev = historyRef.current.pop();
    frontUniverseRef.current.grid.set(prev.grid);
    frontUniverseRef.current.ages.set(prev.ages);
    setGridView(frontUniverseRef.current.grid);
    setAgesView(frontUniverseRef.current.ages);
    setHistoryLength(historyRef.current.length);
  }, []);

  const reset = useCallback((seedInitializer) => {
    historyRef.current = [];
    setHistoryLength(0);

    const front = frontUniverseRef.current;
    const back = backUniverseRef.current;
    front.grid.fill(0);
    front.ages.fill(0);
    back.grid.fill(0);
    back.ages.fill(0);

    if (seedInitializer) seedInitializer(front.grid);
    setGridView(front.grid);
    setAgesView(front.ages);
  }, []);

  const toggleRunning = useCallback(() => setIsRunning((prev) => !prev), []);

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
        saveSnapshot();
        const count = Math.min(MAX_STEPS_PER_FRAME, Math.max(1, Math.floor(elapsed / targetDeltaMs)));
        for (let i = 0; i < count; i += 1) advance();
        setGridView(frontUniverseRef.current.grid);
        setAgesView(frontUniverseRef.current.ages);
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
  }, [advance, isRunning, saveSnapshot, targetDeltaMs]);

  return { grid: gridView, ages: agesView, isRunning, historyLength, step, stepBack, toggleRunning, reset };
}
