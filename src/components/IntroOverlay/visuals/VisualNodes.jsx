/**
 * @file VisualNodes.jsx
 * @description Beat 2 visual — three independent nodes, each following its own rule.
 * Represents a bird, a neuron, a trader — isolated actors with local behavior.
 */
import React from 'react';
import styles from './Visuals.module.css';

// Node positions forming a loose triangle
const NODES = [
  { cx: 60, cy: 80, delay: '0s', label: 'bird' },
  { cx: 140, cy: 65, delay: '0.4s', label: 'neuron' },
  { cx: 100, cy: 145, delay: '0.8s', label: 'trader' },
];

// Faint connecting lines between nodes
const EDGES = [
  [0, 1],
  [1, 2],
  [0, 2],
];

export function VisualNodes() {
  return (
    <svg className={styles.svg} viewBox="0 0 200 200" aria-hidden="true">
      {/* Edges */}
      {EDGES.map(([a, b], i) => (
        <line
          key={i}
          x1={NODES[a].cx}
          y1={NODES[a].cy}
          x2={NODES[b].cx}
          y2={NODES[b].cy}
          className={styles.nodeEdge}
        />
      ))}
      {/* Nodes */}
      {NODES.map((n) => (
        <g key={n.label}>
          <circle
            cx={n.cx}
            cy={n.cy}
            r={18}
            className={styles.nodeRing}
            style={{ animationDelay: n.delay }}
          />
          <rect
            x={n.cx - 9}
            y={n.cy - 9}
            width={18}
            height={18}
            rx="2"
            className={styles.nodeCore}
            style={{ animationDelay: n.delay }}
          />
        </g>
      ))}
    </svg>
  );
}
