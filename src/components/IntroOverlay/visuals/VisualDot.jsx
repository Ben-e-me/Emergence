/**
 * @file VisualDot.jsx
 * @description Beat 1 visual — a single glowing cell, alone in the dark.
 */
import React from 'react';
import styles from './Visuals.module.css';

export function VisualDot() {
  return (
    <svg className={styles.svg} viewBox="0 0 200 200" aria-hidden="true">
      {/* Outer glow ring */}
      <circle cx="100" cy="100" r="42" className={styles.dotRing} />
      {/* Mid glow */}
      <circle cx="100" cy="100" r="26" className={styles.dotMid} />
      {/* Core cell */}
      <rect x="88" y="88" width="24" height="24" rx="3" className={styles.dotCore} />
    </svg>
  );
}
