/**
 * @file VisualCascade.jsx
 * @description Beat 4 visual — rings of cells spreading from a center point,
 * evoking the emergent wave of complexity from simple initial conditions.
 */
import React from 'react';
import styles from './Visuals.module.css';

// Concentric rings: each ring is a list of (cx, cy, delay) tuples
const RINGS = [
  // Ring 0: center
  [{ cx: 100, cy: 100, delay: 0 }],
  // Ring 1: 4 cardinal
  [
    { cx: 100, cy: 79, delay: 0.18 },
    { cx: 121, cy: 100, delay: 0.18 },
    { cx: 100, cy: 121, delay: 0.18 },
    { cx: 79, cy: 100, delay: 0.18 },
  ],
  // Ring 2: 8 surrounding
  [
    { cx: 100, cy: 58, delay: 0.36 },
    { cx: 121, cy: 79, delay: 0.36 },
    { cx: 142, cy: 100, delay: 0.36 },
    { cx: 121, cy: 121, delay: 0.36 },
    { cx: 100, cy: 142, delay: 0.36 },
    { cx: 79, cy: 121, delay: 0.36 },
    { cx: 58, cy: 100, delay: 0.36 },
    { cx: 79, cy: 79, delay: 0.36 },
  ],
  // Ring 3: outer sparse
  [
    { cx: 100, cy: 37, delay: 0.54 },
    { cx: 142, cy: 58, delay: 0.54 },
    { cx: 163, cy: 100, delay: 0.54 },
    { cx: 142, cy: 142, delay: 0.54 },
    { cx: 100, cy: 163, delay: 0.54 },
    { cx: 58, cy: 142, delay: 0.54 },
    { cx: 37, cy: 100, delay: 0.54 },
    { cx: 58, cy: 58, delay: 0.54 },
  ],
];

// Color per ring (accent palette)
const RING_COLORS = [
  'var(--emergence-color-accent, #7c3aed)',
  '#06b6d4',
  '#f59e0b',
  '#ec4899',
];

export function VisualCascade() {
  return (
    <svg className={styles.svg} viewBox="0 0 200 200" aria-hidden="true">
      {RINGS.map((ring, ri) =>
        ring.map((dot, di) => (
          <rect
            key={`${ri}-${di}`}
            x={dot.cx - 5}
            y={dot.cy - 5}
            width={10}
            height={10}
            rx="2"
            className={styles.cascadeCell}
            style={{
              '--ring-color': RING_COLORS[ri],
              animationDelay: `${dot.delay}s`,
            }}
          />
        )),
      )}
    </svg>
  );
}
