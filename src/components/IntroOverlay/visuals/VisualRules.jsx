/**
 * @file VisualRules.jsx
 * @description Rules beat visual — a live Game of Life simulation on a 15×15 toroidal grid.
 * Starts from an R-pentomino (5 cells) that grows into a complex, dynamic pattern,
 * demonstrating emergence in real time. Loops every 60 generations.
 * Only alive cells are rendered — no background grid pattern.
 */
import React, { useEffect, useState } from 'react';
import styles from './Visuals.module.css';

const SIZE = 15;
const CELL = 10;
const GAP = 2;
const STEP = CELL + GAP;
// Centre the grid in the 200×200 viewBox
const OFFSET = (200 - (SIZE * STEP - GAP)) / 2;

function createInitial() {
  const g = new Array(SIZE * SIZE).fill(0);
  const set = (r, c) => {
    g[r * SIZE + c] = 1;
  };
  // R-pentomino centred around (7, 7)
  set(6, 7);
  set(6, 8);
  set(7, 6);
  set(7, 7);
  set(8, 7);
  // Second glider in the lower-left quadrant adds variety
  set(11, 2);
  set(12, 3);
  set(10, 4);
  set(11, 4);
  set(12, 4);
  return g;
}

function stepGrid(g) {
  const next = new Array(SIZE * SIZE).fill(0);
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      let n = 0;
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (dx === 0 && dy === 0) continue;
          const nx = ((x + dx) % SIZE + SIZE) % SIZE;
          const ny = ((y + dy) % SIZE + SIZE) % SIZE;
          if (g[ny * SIZE + nx]) n += 1;
        }
      }
      const alive = g[y * SIZE + x];
      next[y * SIZE + x] = alive ? (n === 2 || n === 3 ? 1 : 0) : n === 3 ? 1 : 0;
    }
  }
  return next;
}

export function VisualRules() {
  const [grid, setGrid] = useState(createInitial);

  useEffect(() => {
    let gen = 0;
    const id = setInterval(() => {
      gen = (gen + 1) % 60;
      setGrid((current) => (gen === 0 ? createInitial() : stepGrid(current)));
    }, 120);
    return () => clearInterval(id);
  }, []);

  return (
    <svg className={styles.svg} viewBox="0 0 200 200" aria-hidden="true">
      {grid.map((alive, idx) => {
        if (!alive) return null;
        const c = idx % SIZE;
        const r = Math.floor(idx / SIZE);
        return (
          <rect
            key={idx}
            x={OFFSET + c * STEP}
            y={OFFSET + r * STEP}
            width={CELL}
            height={CELL}
            rx="1.5"
            className={styles.gridCellAlive}
          />
        );
      })}
    </svg>
  );
}
