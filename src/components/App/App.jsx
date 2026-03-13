/**
 * @file App.jsx
 * @description Top-level composition for the Emergence experience, orchestrating layout and high-level narrative frames.
 * @architecture
 * - Owns simulation state via useGameOfLife and viewport sizing via useViewportGrid.
 * - Seeds the universe on mount so the canvas is immediately alive.
 * - Passes render data down to LifeCanvas; keeps controls co-located with narrative context.
 */
import React, { useEffect, useState } from 'react';
import styles from './App.module.css';
import { LifeCanvas } from '../LifeCanvas/LifeCanvas.jsx';
import { useGameOfLife } from '../../hooks/useGameOfLife.js';
import { useViewportGrid } from '../../hooks/useViewportGrid.js';
import { randomSeed } from '../../simulation/seeds.js';
import {
  DEFAULT_GENERATIONS_PER_SECOND,
  MIN_GENERATIONS_PER_SECOND,
  MAX_GENERATIONS_PER_SECOND,
  RULE_CONWAY_CLASSIC,
  RULE_HIGH_LIFE,
  RULE_DEAD_UNIVERSE,
} from '../../constants/simulationConstants.js';

const RULE_PRESETS = [
  { key: 'classic', label: 'Classic', rule: RULE_CONWAY_CLASSIC },
  { key: 'highlife', label: 'HighLife', rule: RULE_HIGH_LIFE },
  { key: 'dead', label: 'Dead', rule: RULE_DEAD_UNIVERSE },
];

/**
 * @returns {JSX.Element} The root application shell hosting the canvas and narrative panels.
 */
export function App() {
  const { width, height, cellSizeCss } = useViewportGrid();

  const [generationsPerSecond, setGenerationsPerSecond] = useState(DEFAULT_GENERATIONS_PER_SECOND);
  const [activeRuleKey, setActiveRuleKey] = useState('classic');
  const activeRule = RULE_PRESETS.find((p) => p.key === activeRuleKey).rule;

  const { grid, ages, isRunning, step, toggleRunning, reset } = useGameOfLife({
    width,
    height,
    rule: activeRule,
    generationsPerSecond,
    autoStart: true,
  });

  useEffect(() => {
    reset(randomSeed());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReset = () => reset(randomSeed());

  const handleRuleChange = (key) => {
    setActiveRuleKey(key);
    reset(randomSeed());
  };

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

          <div className={styles.controlGroup}>
            <div className={styles.controlLabel}>
              <span>Speed</span>
              <span className={styles.controlValue}>{generationsPerSecond} fps</span>
            </div>
            <input
              className={styles.slider}
              type="range"
              min={MIN_GENERATIONS_PER_SECOND}
              max={MAX_GENERATIONS_PER_SECOND}
              value={generationsPerSecond}
              onChange={(e) => setGenerationsPerSecond(Number(e.target.value))}
            />
          </div>

          <div className={styles.controlGroup}>
            <div className={styles.controlLabel}>
              <span>Rule</span>
            </div>
            <div className={styles.segmented}>
              {RULE_PRESETS.map(({ key, label }) => (
                <button
                  key={key}
                  className={`${styles.segmentBtn} ${activeRuleKey === key ? styles.segmentBtnActive : ''}`}
                  onClick={() => handleRuleChange(key)}
                >
                  {label}
                </button>
              ))}
            </div>
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
