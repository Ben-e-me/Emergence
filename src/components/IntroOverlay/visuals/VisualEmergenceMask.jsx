/**
 * @file VisualEmergenceMask.jsx
 * @description Alternative CTA visual — a live Game of Life simulation revealed
 * exclusively through the silhouette of the word "EMERGENCE" as an SVG mask.
 * Dead cells show as a very dim grid to keep the letter forms readable at all times;
 * alive cells burst through in accent / multi-color.
 */
import React, { useEffect, useState } from 'react';
import styles from './Visuals.module.css';

const COLS = 27;
const ROWS = 8;
const CELL = 13;
const GAP = 2;
const STEP = CELL + GAP;
const VB_W = 400;
const VB_H = 120;

const COLORS = ['var(--emergence-color-accent, #14b8a6)', '#06b6d4', '#f59e0b', '#ec4899'];

function createInitial() {
  const g = new Array(COLS * ROWS).fill(0);
  for (let i = 0; i < g.length; i += 1) {
    g[i] = Math.random() < 0.55 ? 1 : 0;
  }
  return g;
}

function stepGrid(g) {
  const next = new Array(COLS * ROWS).fill(0);
  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      let n = 0;
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (dx === 0 && dy === 0) continue;
          const nx = (((x + dx) % COLS) + COLS) % COLS;
          const ny = (((y + dy) % ROWS) + ROWS) % ROWS;
          if (g[ny * COLS + nx]) n += 1;
        }
      }
      const alive = g[y * COLS + x];
      next[y * COLS + x] = alive ? (n === 2 || n === 3 ? 1 : 0) : n === 3 ? 1 : 0;
    }
  }
  return next;
}

export function VisualEmergenceMask() {
  const [grid, setGrid] = useState(createInitial);

  useEffect(() => {
    let gen = 0;
    const id = setInterval(() => {
      gen = (gen + 1) % 40;
      setGrid((g) => (gen === 0 ? createInitial() : stepGrid(g)));
    }, 120);
    return () => clearInterval(id);
  }, []);

  // Grid offset to center the cell grid within the viewBox
  const offsetX = (VB_W - (COLS * STEP - GAP)) / 2;
  const offsetY = (VB_H - (ROWS * STEP - GAP)) / 2;

  return (
    <svg className={styles.svgMask} viewBox={`0 0 ${VB_W} ${VB_H}`} aria-hidden="true">
      <defs>
        <mask id="emergence-text-mask">
          {/* Black background hides everything outside the text */}
          <rect width={VB_W} height={VB_H} fill="black" />
          {/* White text reveals the grid beneath */}
          <text
            x={VB_W / 2}
            y="94"
            textAnchor="middle"
            fontFamily="'SF Mono', 'Fira Mono', 'Courier New', monospace"
            fontSize="82"
            fontWeight="400"
            letterSpacing="4"
            fill="white"
            textLength={VB_W - 8}
            lengthAdjust="spacing"
          >
            EMERGENCE
          </text>
        </mask>
      </defs>

      {/* All cells rendered, masked to text shape */}
      <g mask="url(#emergence-text-mask)">
        {grid.map((alive, idx) => {
          const c = idx % COLS;
          const r = Math.floor(idx / COLS);
          const dist = Math.round(Math.sqrt((c - COLS / 2) ** 2 + (r - ROWS / 2) ** 2));
          return (
            <rect
              key={idx}
              x={offsetX + c * STEP}
              y={offsetY + r * STEP}
              width={CELL}
              height={CELL}
              rx="1.5"
              fill={alive ? COLORS[dist % COLORS.length] : 'rgba(255,255,255,0.08)'}
              opacity={alive ? 0.92 : 1}
            />
          );
        })}
      </g>
    </svg>
  );
}
