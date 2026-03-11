/**
 * @file App.jsx
 * @description Top-level composition for the Emergence experience, orchestrating layout and high-level narrative frames.
 * @architecture
 * - Delegates simulation state to the useGameOfLife hook and visualization to dedicated canvas and UI components.
 * - Keeps this component focused on experience scaffolding rather than simulation details.
 */
import React from 'react';
import styles from './App.module.css';
import { LifeCanvas } from '../LifeCanvas/LifeCanvas.jsx';

/**
 * @returns {JSX.Element} The root application shell hosting the canvas and narrative panels.
 */
export function App() {
  // The initial shell is intentionally minimal; narrative and controls will be layered in sessions.
  return (
    <div className={styles.appRoot}>
      <main className={styles.main}>
        <section className={styles.heroPanel}>
          <h1 className={styles.title}>Emergence</h1>
          <p className={styles.subtitle}>Conway&apos;s Game of Life as a living meditation.</p>
        </section>
        <section className={styles.canvasPanel}>
          <LifeCanvas />
        </section>
      </main>
    </div>
  );
}

