/**
 * @file universe.test.js
 * @description Unit tests for the stepUniverse pure function.
 * @architecture
 * - Tests use canonical Game of Life patterns (still lifes, oscillators) whose outcomes are known.
 * - Each test allocates its own buffers and calls stepUniverse directly — no React, no timers.
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
      // 4x4 grid, block at (1,1)–(2,2)
      // . . . .
      // . X X .
      // . X X .
      // . . . .
      const { grid, ages } = makeBuffers(4, 4);
      grid[1 * 4 + 1] = 1;
      grid[1 * 4 + 2] = 1;
      grid[2 * 4 + 1] = 1;
      grid[2 * 4 + 2] = 1;
      ages[1 * 4 + 1] = 3;
      ages[1 * 4 + 2] = 3;
      ages[2 * 4 + 1] = 3;
      ages[2 * 4 + 2] = 3;

      const { grid: next, ages: nextAges } = step(grid, ages, 4, 4);

      expect(next[1 * 4 + 1]).toBe(1);
      expect(next[1 * 4 + 2]).toBe(1);
      expect(next[2 * 4 + 1]).toBe(1);
      expect(next[2 * 4 + 2]).toBe(1);
      // All other cells dead
      const aliveCount = Array.from(next).filter((v) => v === 1).length;
      expect(aliveCount).toBe(4);
    });

    it('block ages increment for surviving cells', () => {
      const { grid, ages } = makeBuffers(4, 4);
      grid[1 * 4 + 1] = 1;
      grid[1 * 4 + 2] = 1;
      grid[2 * 4 + 1] = 1;
      grid[2 * 4 + 2] = 1;
      ages[1 * 4 + 1] = 5;
      ages[1 * 4 + 2] = 5;
      ages[2 * 4 + 1] = 5;
      ages[2 * 4 + 2] = 5;

      const { ages: nextAges } = step(grid, ages, 4, 4);

      expect(nextAges[1 * 4 + 1]).toBe(6);
      expect(nextAges[1 * 4 + 2]).toBe(6);
      expect(nextAges[2 * 4 + 1]).toBe(6);
      expect(nextAges[2 * 4 + 2]).toBe(6);
    });
  });

  describe('oscillators', () => {
    it('blinker (horizontal) rotates to vertical after one step', () => {
      // 3x3 grid
      // . . .
      // X X X  (row 1, cols 0-2)
      // . . .
      const { grid, ages } = makeBuffers(3, 3);
      grid[1 * 3 + 0] = 1;
      grid[1 * 3 + 1] = 1;
      grid[1 * 3 + 2] = 1;

      const { grid: next } = step(grid, ages, 3, 3);

      // Vertical blinker: col 1, rows 0-2
      expect(next[0 * 3 + 1]).toBe(1);
      expect(next[1 * 3 + 1]).toBe(1);
      expect(next[2 * 3 + 1]).toBe(1);
      // Horizontal cells at ends die
      expect(next[1 * 3 + 0]).toBe(0);
      expect(next[1 * 3 + 2]).toBe(0);
    });

    it('blinker returns to original orientation after two steps', () => {
      const { grid, ages } = makeBuffers(3, 3);
      grid[1 * 3 + 0] = 1;
      grid[1 * 3 + 1] = 1;
      grid[1 * 3 + 2] = 1;

      const { grid: step1, ages: ages1 } = step(grid, ages, 3, 3);
      const { grid: step2 } = step(step1, ages1, 3, 3);

      expect(step2[1 * 3 + 0]).toBe(1);
      expect(step2[1 * 3 + 1]).toBe(1);
      expect(step2[1 * 3 + 2]).toBe(1);
      expect(step2[0 * 3 + 1]).toBe(0);
      expect(step2[2 * 3 + 1]).toBe(0);
    });
  });

  describe('birth and death rules', () => {
    it('dead cell with exactly 3 neighbors is born', () => {
      // 3x3 grid: three live cells around centre of top row
      // X X X
      // . . .
      // . . .
      const { grid, ages } = makeBuffers(3, 3);
      grid[0] = 1; // (0,0)
      grid[1] = 1; // (0,1)
      grid[2] = 1; // (0,2)

      const { grid: next } = step(grid, ages, 3, 3);

      // Centre cell (1,1) has 3 live neighbors → born
      expect(next[1 * 3 + 1]).toBe(1);
      // New age is 1
    });

    it('live cell with fewer than 2 neighbors dies (underpopulation)', () => {
      // Single isolated cell
      const { grid, ages } = makeBuffers(5, 5);
      grid[2 * 5 + 2] = 1;

      const { grid: next } = step(grid, ages, 5, 5);

      expect(next[2 * 5 + 2]).toBe(0);
    });

    it('live cell with more than 3 neighbors dies (overpopulation)', () => {
      // Centre surrounded by 4 live cells in cardinal directions
      // . X .
      // X X X
      // . X .
      const { grid, ages } = makeBuffers(3, 3);
      grid[0 * 3 + 1] = 1;
      grid[1 * 3 + 0] = 1;
      grid[1 * 3 + 1] = 1; // centre
      grid[1 * 3 + 2] = 1;
      grid[2 * 3 + 1] = 1;

      const { grid: next } = step(grid, ages, 3, 3);

      // Centre has 4 neighbors → dies
      expect(next[1 * 3 + 1]).toBe(0);
    });

    it('newly born cell gets age 1', () => {
      const { grid, ages } = makeBuffers(3, 3);
      grid[0] = 1;
      grid[1] = 1;
      grid[2] = 1;

      const { ages: nextAges } = step(grid, ages, 3, 3);

      expect(nextAges[1 * 3 + 1]).toBe(1);
    });

    it('dead cells reset age to 0', () => {
      const { grid, ages } = makeBuffers(5, 5);
      // Isolated cell will die
      grid[2 * 5 + 2] = 1;
      ages[2 * 5 + 2] = 10;

      const { ages: nextAges } = step(grid, ages, 5, 5);

      expect(nextAges[2 * 5 + 2]).toBe(0);
    });
  });

  describe('boundary conditions', () => {
    it('cells at grid edges do not wrap and count only in-bounds neighbors', () => {
      // Corner cell at (0,0) with one neighbor at (0,1) — should die (1 neighbor < 2)
      const { grid, ages } = makeBuffers(3, 3);
      grid[0] = 1;
      grid[1] = 1;

      const { grid: next } = step(grid, ages, 3, 3);

      expect(next[0]).toBe(0);
    });
  });

  describe('HighLife rule', () => {
    it('dead cell with 6 neighbors is born under HighLife (not Classic)', () => {
      // 5x5 grid: 6 live cells surrounding centre
      // . X X .  .
      // X . X .  .  (centre at (2,2))
      // . X X .  .
      // We'll construct a pattern where (2,2) has exactly 6 live neighbors
      const { grid, ages } = makeBuffers(5, 5);
      // Neighbours of (2,2): (1,1),(1,2),(1,3),(2,1),(2,3),(3,1),(3,2),(3,3)
      // Set 6 of them alive
      grid[1 * 5 + 1] = 1;
      grid[1 * 5 + 2] = 1;
      grid[1 * 5 + 3] = 1;
      grid[2 * 5 + 1] = 1;
      grid[2 * 5 + 3] = 1;
      grid[3 * 5 + 1] = 1;

      const { grid: nextClassic } = step(grid, ages, 5, 5, RULE_CONWAY_CLASSIC);
      const { grid: nextHighLife } = step(grid, ages, 5, 5, RULE_HIGH_LIFE);

      // Classic: 6 neighbors → not born (born only at 3)
      expect(nextClassic[2 * 5 + 2]).toBe(0);
      // HighLife: born at 3 or 6 → born
      expect(nextHighLife[2 * 5 + 2]).toBe(1);
    });
  });
});
