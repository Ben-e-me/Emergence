/**
 * @file useViewportGrid.js
 * @description Hook that derives a responsive Game of Life grid from the viewport and device pixel ratio.
 * @architecture
 * - Computes logical cell counts (width, height) so each cell maps to at least one device pixel.
 * - Prefers a stable density by targeting a fixed number of cells along the shorter axis.
 */
import { useEffect, useState } from 'react';
import {
  MAX_CELLS_PER_AXIS,
  MIN_DEVICE_PIXELS_PER_CELL,
  TARGET_CELLS_ON_SHORT_AXIS,
} from '../constants/renderingConstants.js';

/**
 * @typedef {Object} ViewportGrid
 * @property {number} width - Number of columns in the logical grid.
 * @property {number} height - Number of rows in the logical grid.
 * @property {number} cellSizeCss - Cell size in CSS pixels used for layout.
 */

/**
 * Computes a responsive grid based on current viewport size.
 *
 * @returns {ViewportGrid}
 */
export function useViewportGrid() {
  const [grid, setGrid] = useState(
    /** @type {ViewportGrid} */ ({
      width: TARGET_CELLS_ON_SHORT_AXIS,
      height: TARGET_CELLS_ON_SHORT_AXIS,
      cellSizeCss: MIN_DEVICE_PIXELS_PER_CELL,
    }),
  );

  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;

      const shortAxisDevice = Math.min(vw, vh) * dpr;
      const idealCellDeviceSize = shortAxisDevice / TARGET_CELLS_ON_SHORT_AXIS;
      const cellDeviceSize = Math.max(MIN_DEVICE_PIXELS_PER_CELL, Math.floor(idealCellDeviceSize) || 1);

      const widthCells = Math.min(
        MAX_CELLS_PER_AXIS,
        Math.max(1, Math.floor((vw * dpr) / cellDeviceSize)),
      );
      const heightCells = Math.min(
        MAX_CELLS_PER_AXIS,
        Math.max(1, Math.floor((vh * dpr) / cellDeviceSize)),
      );

      const cellSizeCss = cellDeviceSize / dpr;

      setGrid({
        width: widthCells,
        height: heightCells,
        cellSizeCss,
      });
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return grid;
}

