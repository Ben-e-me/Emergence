/**
 * @file LifeCanvas.jsx
 * @description Canvas-based visualization of the Game of Life universe sized to the viewport.
 * @architecture
 * - When zoom <= 1: builds a 3× triple-size tile (3×3 grid copies) and draws it in an explicit
 *   loop across the visible range, producing a seamless infinite universe at all zoom levels.
 * - When zoom > 1: draws cells directly with age-based alpha.
 * - Pan is always active; window-level mouse listeners work across overlapping UI elements.
 * - Pan state encodes the zoom it was captured at; resets automatically when zoom changes.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './LifeCanvas.module.css';

export function LifeCanvas({ grid, ages, width, height, cellSizeCss, accentColor, zoom }) {
  const canvasRef = useRef(/** @type {HTMLCanvasElement | null} */ (null));

  const [panState, setPanState] = useState({ x: 0, y: 0, forZoom: zoom });
  const effectivePan = useMemo(
    () => (panState.forZoom === zoom ? panState : { x: 0, y: 0 }),
    [panState, zoom],
  );

  const [isPanning, setIsPanning] = useState(false);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const zoomRef = useRef(zoom);
  const tileRef = useRef(/** @type {HTMLCanvasElement | null} */ (null));

  useEffect(() => {
    zoomRef.current = zoom;
  });

  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setPanState({
        x: dragStart.current.panX + dx,
        y: dragStart.current.panY + dy,
        forZoom: zoomRef.current,
      });
    };
    const onUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      setIsPanning(false);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.width / dpr;
    const cssH = canvas.height / dpr;
    const cx = cssW / 2;
    const cy = cssH / 2;

    ctx.fillStyle = '#0a0a12';
    ctx.fillRect(0, 0, cssW, cssH);

    ctx.save();
    ctx.translate(cx + effectivePan.x, cy + effectivePan.y);
    ctx.scale(zoom, zoom);
    ctx.translate(-cx, -cy);

    if (zoom <= 1) {
      // ── Infinite tiling: build a 3× triple tile, then draw it across the visible area ──
      const baseW = Math.ceil(width * cellSizeCss);
      const baseH = Math.ceil(height * cellSizeCss);
      const tileW = baseW * 3;
      const tileH = baseH * 3;

      if (!tileRef.current) tileRef.current = document.createElement('canvas');
      const tile = tileRef.current;
      if (tile.width !== tileW || tile.height !== tileH) {
        tile.width = tileW;
        tile.height = tileH;
      }

      const tileCtx = tile.getContext('2d');
      tileCtx.fillStyle = '#0a0a12';
      tileCtx.fillRect(0, 0, tileW, tileH);
      tileCtx.fillStyle = accentColor || '#ffffff';
      tileCtx.shadowBlur = 4;
      tileCtx.shadowColor = accentColor || '#ffffff';
      // Draw 3×3 copies of the simulation into the tile
      for (let gy = 0; gy < 3; gy += 1) {
        for (let gx = 0; gx < 3; gx += 1) {
          for (let y = 0; y < height; y += 1) {
            for (let x = 0; x < width; x += 1) {
              const index = y * width + x;
              if (grid[index] === 1) {
                tileCtx.globalAlpha = Math.min(1, 0.75 + ages[index] * 0.015);
                tileCtx.fillRect(
                  gx * baseW + x * cellSizeCss,
                  gy * baseH + y * cellSizeCss,
                  cellSizeCss,
                  cellSizeCss,
                );
              }
            }
          }
        }
      }
      tileCtx.shadowBlur = 0;
      tileCtx.globalAlpha = 1;

      // Compute which tiles are visible and draw only those
      const panX = effectivePan.x;
      const panY = effectivePan.y;
      const visLeft = (-cx - panX) / zoom + cx;
      const visTop = (-cy - panY) / zoom + cy;
      const visRight = (cssW - cx - panX) / zoom + cx;
      const visBottom = (cssH - cy - panY) / zoom + cy;

      const startTX = Math.floor(visLeft / tileW) - 1;
      const startTY = Math.floor(visTop / tileH) - 1;
      const endTX = Math.ceil(visRight / tileW) + 1;
      const endTY = Math.ceil(visBottom / tileH) + 1;

      for (let ty = startTY; ty <= endTY; ty += 1) {
        for (let tx = startTX; tx <= endTX; tx += 1) {
          ctx.drawImage(tile, tx * tileW, ty * tileH, tileW, tileH);
        }
      }
    } else {
      // ── Normal drawing with age-based alpha ──────────────────────────────────
      ctx.fillStyle = accentColor || '#ffffff';
      ctx.shadowBlur = 4;
      ctx.shadowColor = accentColor || '#ffffff';
      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const index = y * width + x;
          if (grid[index] === 1) {
            ctx.globalAlpha = Math.min(1, 0.75 + ages[index] * 0.015);
            ctx.fillRect(x * cellSizeCss, y * cellSizeCss, cellSizeCss, cellSizeCss);
          }
        }
      }
      ctx.shadowBlur = 0;
    }

    ctx.restore();
    ctx.globalAlpha = 1;
  }, [grid, ages, width, height, cellSizeCss, accentColor, zoom, effectivePan]);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    setIsPanning(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panX: effectivePan.x, panY: effectivePan.y };
  };

  const cursor = isPanning ? 'grabbing' : 'grab';

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      style={{ cursor }}
      aria-label="Game of Life universe"
      onMouseDown={handleMouseDown}
    />
  );
}
