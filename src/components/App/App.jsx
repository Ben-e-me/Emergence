/**
 * @file App.jsx
 * @description Top-level composition for the Emergence experience, orchestrating layout and high-level narrative frames.
 * @architecture
 * - Owns simulation state via useGameOfLife and viewport sizing via useViewportGrid.
 * - Seeds the universe on mount so the canvas is immediately alive.
 * - Passes render data down to LifeCanvas; keeps controls co-located with narrative context.
 */
import React, { useEffect } from 'react';
import styles from './App.module.css';
import { LifeCanvas } from '../LifeCanvas/LifeCanvas.jsx';
import { useGameOfLife } from '../../hooks/useGameOfLife.js';
import { useViewportGrid } from '../../hooks/useViewportGrid.js';
import { randomSeed } from '../../simulation/seeds.js';

/**
 * @returns {JSX.Element} The root application shell hosting the canvas and narrative panels.
 */
export function App() {
  const { width, height, cellSizeCss } = useViewportGrid();
  const { grid, ages, isRunning, step, toggleRunning, reset } = useGameOfLife({
    width,
    height,
    autoStart: true,
  });

  useEffect(() => {
    reset(randomSeed());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReset = () => reset(randomSeed());

  return (
    <div className={styles.appRoot}>
      <main className={styles.main}>
        <section className={styles.heroPanel}>
          <h1 className={styles.title}>Emergence</h1>
          <p className={styles.subtitle}>Conway&apos;s Game of Life as a living meditation.</p>
          <div className={styles.controls}>
            <button className={styles.controlBtn} onClick={toggleRunning}>
              {isRunning ? 'Pause' : 'Play'}
            </button>
            <button className={styles.controlBtn} onClick={step} disabled={isRunning}>
              Step
            </button>
            <button className={styles.controlBtn} onClick={handleReset}>
              Reset
            </button>
          </div>
        </section>
        <section className={styles.canvasPanel}>
          <LifeCanvas
            grid={grid}
            ages={ages}
            width={width}
            height={height}
            cellSizeCss={cellSizeCss}
          />
        </section>
      </main>
    </div>
  );
}
