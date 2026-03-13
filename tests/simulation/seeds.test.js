/**
 * @file seeds.test.js
 * @description Unit tests for seed initializer functions.
 */
import { describe, expect, it } from 'vitest';
import { randomSeed } from '../../src/simulation/seeds.js';

describe('randomSeed', () => {
  it('returns a function', () => {
    expect(typeof randomSeed()).toBe('function');
  });

  it('fills a Uint8Array with only 0s and 1s', () => {
    const grid = new Uint8Array(1000);
    randomSeed()(grid);
    for (const cell of grid) {
      expect(cell === 0 || cell === 1).toBe(true);
    }
  });

  it('produces approximately the requested density', () => {
    const grid = new Uint8Array(10000);
    randomSeed(0.4)(grid);
    const alive = Array.from(grid).filter((v) => v === 1).length;
    const actual = alive / grid.length;
    // Allow ±5% tolerance around target density
    expect(actual).toBeGreaterThan(0.35);
    expect(actual).toBeLessThan(0.45);
  });

  it('default density is approximately 35%', () => {
    const grid = new Uint8Array(10000);
    randomSeed()(grid);
    const alive = Array.from(grid).filter((v) => v === 1).length;
    const actual = alive / grid.length;
    expect(actual).toBeGreaterThan(0.3);
    expect(actual).toBeLessThan(0.4);
  });

  it('density 0 produces an empty grid', () => {
    const grid = new Uint8Array(100);
    randomSeed(0)(grid);
    expect(Array.from(grid).every((v) => v === 0)).toBe(true);
  });

  it('density 1 fills the entire grid', () => {
    const grid = new Uint8Array(100);
    randomSeed(1)(grid);
    expect(Array.from(grid).every((v) => v === 1)).toBe(true);
  });

  it('two calls produce different patterns', () => {
    const a = new Uint8Array(200);
    const b = new Uint8Array(200);
    randomSeed()(a);
    randomSeed()(b);
    // Probability of identical 200-cell random grids is astronomically low
    expect(Array.from(a)).not.toEqual(Array.from(b));
  });
});
