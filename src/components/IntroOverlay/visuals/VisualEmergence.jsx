/**
 * @file VisualEmergence.jsx
 * @description CTA visual — an animated GoL-inspired grid where cells appear in
 * expanding waves from the center, evoking emergence of order from simple rules.
 */
import React, { useEffect, useState } from 'react';
import styles from './Visuals.module.css';

const COLS = 11;
const ROWS = 11;
const CELL = 13;
const GAP = 2;
const STEP = CELL + GAP;
const OFFSET_X = (200 - COLS * STEP + GAP) / 2;
const OFFSET_Y = (200 - ROWS * STEP + GAP) / 2;

// Precomputed alive-cell sets for 4 animation frames (a glider-gun-like expanding ring)
// Frame 0: center cluster
const FRAME_A = [
  [5, 5],
  [5, 6],
  [6, 5],
  [6, 6],
  [4, 5],
  [7, 5],
  [5, 4],
  [5, 7],
];
// Frame 1: ring expands + center evolves
const FRAME_B = [
  [5, 5],
  [6, 6],
  [4, 4],
  [7, 7],
  [4, 6],
  [6, 4],
  [3, 5],
  [8, 5],
  [5, 3],
  [5, 8],
];
// Frame 2: wider spread
const FRAME_C = [
  [5, 5],
  [5, 6],
  [6, 5],
  [3, 4],
  [8, 6],
  [4, 3],
  [7, 8],
  [2, 5],
  [9, 5],
  [5, 2],
  [5, 9],
  [3, 7],
  [8, 4],
];
// Frame 3: even wider
const FRAME_D = [
  [5, 5],
  [6, 6],
  [4, 4],
  [7, 7],
  [2, 4],
  [9, 6],
  [4, 2],
  [7, 9],
  [1, 5],
  [10, 5],
  [5, 1],
  [5, 10],
  [3, 3],
  [8, 8],
  [2, 7],
  [9, 4],
];

const FRAMES = [FRAME_A, FRAME_B, FRAME_C, FRAME_D];

// Four accent colors cycling through cells
const COLORS = [
  'var(--emergence-color-accent, #7c3aed)',
  '#06b6d4',
  '#f59e0b',
  '#ec4899',
];

function getColor(c, r, frameIdx) {
  const dist = Math.round(Math.sqrt((c - 5) ** 2 + (r - 5) ** 2));
  return COLORS[(dist + frameIdx) % COLORS.length];
}

function inFrame(frame, c, r) {
  return frame.some(([fc, fr]) => fc === c && fr === r);
}

export function VisualEmergence() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % FRAMES.length), 600);
    return () => clearInterval(id);
  }, []);

  const alive = FRAMES[frame];

  return (
    <svg className={styles.svg} viewBox="0 0 200 200" aria-hidden="true">
      {Array.from({ length: ROWS }, (_, r) =>
        Array.from({ length: COLS }, (_, c) => {
          const x = OFFSET_X + c * STEP;
          const y = OFFSET_Y + r * STEP;
          const isAlive = inFrame(alive, c, r);

          if (!isAlive) return null;
          return (
            <rect
              key={`${c}-${r}`}
              x={x}
              y={y}
              width={CELL}
              height={CELL}
              rx="2"
              className={styles.emergenceAlive}
              style={{ '--cell-color': getColor(c, r, frame) }}
            />
          );
        }),
      )}
    </svg>
  );
}
