/**
 * @file VisualNeurons.jsx
 * @description Beat 2 visual — a neuron firing cascade.
 * A central cell sends a pulse rippling outward through a ring of connected nodes,
 * evoking the "fire when enough neighbors do" rule.
 */
import React from 'react';
import styles from './Visuals.module.css';

// Central node + 6 surrounding nodes in a hexagonal arrangement
const CX = 100;
const CY = 100;
const R = 52;

const OUTER = Array.from({ length: 6 }, (_, i) => {
  const angle = (i * Math.PI * 2) / 6 - Math.PI / 2;
  return {
    cx: CX + Math.round(R * Math.cos(angle)),
    cy: CY + Math.round(R * Math.sin(angle)),
    delay: `${i * 0.12}s`,
  };
});

export function VisualNeurons() {
  return (
    <svg className={styles.svg} viewBox="0 0 200 200" aria-hidden="true">
      {/* Axon lines from center to outer nodes */}
      {OUTER.map((n, i) => (
        <line
          key={`axon-${i}`}
          x1={CX}
          y1={CY}
          x2={n.cx}
          y2={n.cy}
          className={styles.axon}
          style={{ animationDelay: n.delay }}
        />
      ))}

      {/* Outer nodes */}
      {OUTER.map((n, i) => (
        <g key={`node-${i}`}>
          <circle
            cx={n.cx}
            cy={n.cy}
            r={12}
            className={styles.neuronRing}
            style={{ animationDelay: n.delay }}
          />
          <rect
            x={n.cx - 6}
            y={n.cy - 6}
            width={12}
            height={12}
            rx="2"
            className={styles.neuronCell}
            style={{ animationDelay: n.delay }}
          />
        </g>
      ))}

      {/* Central firing cell */}
      <circle cx={CX} cy={CY} r={22} className={styles.neuronCoreRing} />
      <rect
        x={CX - 10}
        y={CY - 10}
        width={20}
        height={20}
        rx="3"
        className={styles.neuronCore}
      />
    </svg>
  );
}
