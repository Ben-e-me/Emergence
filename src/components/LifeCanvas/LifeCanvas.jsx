/**
 * @file LifeCanvas.jsx
 * @description Canvas-based visualization of the Game of Life universe sized to the viewport.
 * @architecture
 * - Uses a high-DPI canvas so each logical cell maps to at least one device pixel.
 * - Delegates simulation state to the useGameOfLife hook and focuses solely on rendering.
 */
import React, { useEffect, useRef } from 'react';
import { useGameOfLife } from '../../hooks/useGameOfLife.js';
import { useViewportGrid } from '../../hooks/useViewportGrid.js';
import styles from './LifeCanvas.module.css';

/**
 * @returns {JSX.Element} Canvas element that fills its container and renders the current universe state.
 */
export function LifeCanvas() {
  const { width, height, cellSizeCss } = useViewportGrid();
  const canvasRef = useRef(/** @type {HTMLCanvasElement | null} */ (null));

  const { grid, ages } = useGameOfLife({
    width,
    height,
    autoStart: true,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext('2d');
    if (!context) return undefined;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const aliveColor = getComputedStyle(document.documentElement).getPropertyValue(
      '--emergence-color-accent',
    );
    const backgroundColor = 'rgba(10, 10, 18, 0.9)';

    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = aliveColor || '#7b61ff';

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = y * width + x;
        if (grid[index] === 1) {
          context.globalAlpha = Math.min(1, 0.3 + ages[index] * 0.02);
          context.fillRect(x * cellSizeCss, y * cellSizeCss, cellSizeCss, cellSizeCss);
        }
      }
    }
  }, [grid, ages, width, height, cellSizeCss]);

  return <canvas ref={canvasRef} className={styles.canvas} aria-label="Game of Life universe" />;
}
