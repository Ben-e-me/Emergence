/**
 * @file VisualGrid.jsx
 * @description Beat 3 visual — a small GoL grid showing a blinker oscillating.
 * Communicates that the universe is a grid governed by local neighborhood rules.
 */
import React, { useEffect, useState } from 'react';
import styles from './Visuals.module.css';

const COLS = 9;
const ROWS = 9;
const CELL = 16;
const GAP = 3;
const STEP = CELL + GAP;
const OFFSET_X = (200 - COLS * STEP + GAP) / 2;
const OFFSET_Y = (200 - ROWS * STEP + GAP) / 2;

// Glider pattern centered on the grid (col, row)
const FRAME_A = [
  [4, 3],
  [4, 4],
  [4, 5],
]; // vertical blinker

const FRAME_B = [
  [3, 4],
  [4, 4],
  [5, 4],
]; // horizontal blinker

// Neighbourhood highlight for center cell (4,4)
const NEIGHBORS = [
  [3, 3],
  [4, 3],
  [5, 3],
  [3, 4],
  [5, 4],
  [3, 5],
  [4, 5],
  [5, 5],
];

function inSet(set, c, r) {
  return set.some(([sc, sr]) => sc === c && sr === r);
}

export function VisualGrid() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % 2), 700);
    return () => clearInterval(id);
  }, []);

  const alive = frame === 0 ? FRAME_A : FRAME_B;

  return (
    <svg className={styles.svg} viewBox="0 0 200 200" aria-hidden="true">
      {Array.from({ length: ROWS }, (_, r) =>
        Array.from({ length: COLS }, (_, c) => {
          const x = OFFSET_X + c * STEP;
          const y = OFFSET_Y + r * STEP;
          const isAlive = inSet(alive, c, r);
          const isNeighbor = inSet(NEIGHBORS, c, r);

          return (
            <rect
              key={`${c}-${r}`}
              x={x}
              y={y}
              width={CELL}
              height={CELL}
              rx="2"
              className={
                isAlive
                  ? styles.gridCellAlive
                  : isNeighbor
                    ? styles.gridCellNeighbor
                    : styles.gridCellDead
              }
            />
          );
        }),
      )}
    </svg>
  );
}
