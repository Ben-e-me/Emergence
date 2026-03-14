/**
 * @file universe.test.js
 * @description Unit tests for the stepUniverse pure function.
 * @architecture
 * - Tests use canonical Game of Life patterns (still lifes, oscillators) whose outcomes are known.
 * - Each test allocates its own buffers and calls stepUniverse directly — no React, no timers.
 * - The simulation uses toroidal (wrapping) boundary conditions; tests use grids large enough
 *   that patterns don't interact with themselves through the wrap-around.
 */
import { describe, expect, it } from 'vitest';
import { stepUniverse } from '../../src/simulation/universe.js';
import { RULE_CONWAY_CLASSIC, RULE_HIGH_LIFE } from '../../src/constants/simulationConstants.js';

/**
 * Allocate a pair of zeroed buffers for a grid of given dimensions.
 */
function makeBuffers(width, height) {
  const size = width * height;
  return {
    grid: new Uint8Array(size),
    ages: new Uint16Array(size),
    next: new Uint8Array(size),
    nextAges: new Uint16Array(size),
  };
}

/**
 * Run one step and return the resulting grid as a plain array for easy comparison.
 */
function step(grid, ages, width, height, rule = RULE_CONWAY_CLASSIC) {
  const next = new Uint8Array(grid.length);
  const nextAges = new Uint16Array(ages.length);
  stepUniverse(grid, ages, next, nextAges, width, height, rule);
  return { grid: next, ages: nextAges };
}

describe('stepUniverse', () => {
  describe('still lifes', () => {
    it('block (2x2) survives unchanged', () => {
      // 6x6 grid, block centered at (2,2)–(3,3)
      const { grid, ages } = makeBuffers(6, 6);
      grid[2 * 6 + 2] = 1;
      grid[2 * 6 + 3] = 1;
      grid[3 * 6 + 2] = 1;
      grid[3 * 6 + 3] = 1;
      ages[2 * 6 + 2] = 3;
      ages[2 * 6 + 3] = 3;
      ages[3 * 6 + 2] = 3;
      ages[3 * 6 + 3] = 3;

      const { grid: next, ages: nextAges } = step(grid, ages, 6, 6);

      expect(next[2 * 6 + 2]).toBe(1);
      expect(next[2 * 6 + 3]).toBe(1);
      expect(next[3 * 6 + 2]).toBe(1);
      expect(next[3 * 6 + 3]).toBe(1);
      const aliveCount = Array.from(next).filter((v) => v === 1).length;
      expect(aliveCount).toBe(4);
    });

    it('block ages increment for surviving cells', () => {
      const { grid, ages } = makeBuffers(6, 6);
      grid[2 * 6 + 2] = 1;
      grid[2 * 6 + 3] = 1;
      grid[3 * 6 + 2] = 1;
      grid[3 * 6 + 3] = 1;
      ages[2 * 6 + 2] = 5;
      ages[2 * 6 + 3] = 5;
      ages[3 * 6 + 2] = 5;
      ages[3 * 6 + 3] = 5;

      const { ages: nextAges } = step(grid, ages, 6, 6);

      expect(nextAges[2 * 6 + 2]).toBe(6);
      expect(nextAges[2 * 6 + 3]).toBe(6);
      expect(nextAges[3 * 6 + 2]).toBe(6);
      expect(nextAges[3 * 6 + 3]).toBe(6);
    });
  });

  describe('oscillators', () => {
    it('blinker (horizontal) rotates to vertical after one step', () => {
      // 7x7 grid, horizontal blinker at row 3, cols 2-4 (centered, far from edges)
      // This ensures toroidal wrap-around doesn't interact with the blinker.
      const { grid, ages } = makeBuffers(7, 7);
      grid[3 * 7 + 2] = 1;
      grid[3 * 7 + 3] = 1;
      grid[3 * 7 + 4] = 1;

      const { grid: next } = step(grid, ages, 7, 7);

      // Vertical blinker: col 3, rows 2-4
      expect(next[2 * 7 + 3]).toBe(1);
      expect(next[3 * 7 + 3]).toBe(1);
      expect(next[4 * 7 + 3]).toBe(1);
      // Horizontal ends die
      expect(next[3 * 7 + 2]).toBe(0);
      expect(next[3 * 7 + 4]).toBe(0);
    });

    it('blinker returns to original orientation after two steps', () => {
      const { grid, ages } = makeBuffers(7, 7);
      grid[3 * 7 + 2] = 1;
      grid[3 * 7 + 3] = 1;
      grid[3 * 7 + 4] = 1;

      const { grid: step1, ages: ages1 } = step(grid, ages, 7, 7);
      const { grid: step2 } = step(step1, ages1, 7, 7);

      expect(step2[3 * 7 + 2]).toBe(1);
      expect(step2[3 * 7 + 3]).toBe(1);
      expect(step2[3 * 7 + 4]).toBe(1);
      expect(step2[2 * 7 + 3]).toBe(0);
      expect(step2[4 * 7 + 3]).toBe(0);
    });
  });

  describe('birth and death rules', () => {
    it('dead cell with exactly 3 neighbors is born', () => {
      // 5x5 grid: three live cells along top of center row
      const { grid, ages } = makeBuffers(5, 5);
      grid[2 * 5 + 1] = 1; // (row 2, col 1)
      grid[2 * 5 + 2] = 1; // (row 2, col 2)
      grid[2 * 5 + 3] = 1; // (row 2, col 3)

      const { grid: next } = step(grid, ages, 5, 5);

      // Centre cell above (1,2) has 3 live neighbors → born
      expect(next[1 * 5 + 2]).toBe(1);
      // Centre cell below (3,2) has 3 live neighbors → born
      expect(next[3 * 5 + 2]).toBe(1);
    });

    it('live cell with fewer than 2 neighbors dies (underpopulation)', () => {
      // Single isolated cell in center of 9x9 (far from any wrap-around neighbor)
      const { grid, ages } = makeBuffers(9, 9);
      grid[4 * 9 + 4] = 1;

      const { grid: next } = step(grid, ages, 9, 9);

      expect(next[4 * 9 + 4]).toBe(0);
    });

    it('live cell with more than 3 neighbors dies (overpopulation)', () => {
      // Centre surrounded by 4 live cells in a plus pattern (7x7 grid, centered)
      const { grid, ages } = makeBuffers(7, 7);
      grid[3 * 7 + 2] = 1; // left
      grid[2 * 7 + 3] = 1; // top
      grid[3 * 7 + 3] = 1; // centre
      grid[3 * 7 + 4] = 1; // right
      grid[4 * 7 + 3] = 1; // bottom

      const { grid: next } = step(grid, ages, 7, 7);

      // Centre has 4 neighbors → dies
      expect(next[3 * 7 + 3]).toBe(0);
    });

    it('newly born cell gets age 1', () => {
      const { grid, ages } = makeBuffers(5, 5);
      grid[2 * 5 + 1] = 1;
      grid[2 * 5 + 2] = 1;
      grid[2 * 5 + 3] = 1;

      const { ages: nextAges } = step(grid, ages, 5, 5);

      expect(nextAges[1 * 5 + 2]).toBe(1);
    });

    it('dead cells reset age to 0', () => {
      const { grid, ages } = makeBuffers(9, 9);
      // Isolated cell will die
      grid[4 * 9 + 4] = 1;
      ages[4 * 9 + 4] = 10;

      const { ages: nextAges } = step(grid, ages, 9, 9);

      expect(nextAges[4 * 9 + 4]).toBe(0);
    });
  });

  describe('boundary conditions', () => {
    it('cells at grid edges wrap to the opposite side (toroidal)', () => {
      // On a 5x5 toroidal grid, a cell at col 0 sees col 4 as its left neighbor.
      // Place 3 cells in a horizontal blinker at row 2, cols 3-0-1 (wrapping across col boundary).
      // col 3, col 4, col 0 — horizontal across the wrap.
      const { grid, ages } = makeBuffers(5, 5);
      grid[2 * 5 + 3] = 1; // (row 2, col 3)
      grid[2 * 5 + 4] = 1; // (row 2, col 4)
      grid[2 * 5 + 0] = 1; // (row 2, col 0)

      const { grid: next } = step(grid, ages, 5, 5);

      // col 4 neighbors: col 3 (alive) + col 0 (alive via wrap) → 2 neighbors → survives.
      // col 0 neighbors: only col 4 (alive via wrap) → 1 neighbor → dies.
      // Cells above/below col 4 (rows 1 and 3) see all 3 blinker cells as neighbors → born.
      expect(next[2 * 5 + 4]).toBe(1); // survives (2 neighbors)
      expect(next[2 * 5 + 0]).toBe(0); // dies (1 neighbor)
      expect(next[1 * 5 + 4]).toBe(1); // born (3 neighbors via wrap)
      expect(next[3 * 5 + 4]).toBe(1); // born (3 neighbors via wrap)
    });
  });

  describe('HighLife rule', () => {
    it('dead cell with 6 neighbors is born under HighLife (not Classic)', () => {
      // 7x7 grid: 6 live cells surrounding centre at (3,3)
      const { grid, ages } = makeBuffers(7, 7);
      // Neighbours of (3,3): (2,2),(2,3),(2,4),(3,2),(3,4),(4,2),(4,3),(4,4)
      // Set 6 of them alive
      grid[2 * 7 + 2] = 1;
      grid[2 * 7 + 3] = 1;
      grid[2 * 7 + 4] = 1;
      grid[3 * 7 + 2] = 1;
      grid[3 * 7 + 4] = 1;
      grid[4 * 7 + 2] = 1;

      const { grid: nextClassic } = step(grid, ages, 7, 7, RULE_CONWAY_CLASSIC);
      const { grid: nextHighLife } = step(grid, ages, 7, 7, RULE_HIGH_LIFE);

      // Classic: 6 neighbors → not born
      expect(nextClassic[3 * 7 + 3]).toBe(0);
      // HighLife: born at 3 or 6 → born
      expect(nextHighLife[3 * 7 + 3]).toBe(1);
    });
  });
});
