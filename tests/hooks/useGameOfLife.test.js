/**
 * @file useGameOfLife.test.js
 * @description Unit tests for the useGameOfLife hook, validating rules and basic timing behavior.
 * @architecture
 * - Uses Vitest and React Testing Library utilities where helpful.
 * - Keeps tests focused on contract: grid shape, rule correctness, and stepping.
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameOfLife } from '../../src/hooks/useGameOfLife.js';
import { RULE_CONWAY_CLASSIC } from '../../src/constants/simulationConstants.js';

describe('useGameOfLife', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(global, 'requestAnimationFrame').mockImplementation((cb) =>
      setTimeout(() => cb(performance.now()), 16),
    );
    vi.spyOn(global, 'cancelAnimationFrame').mockImplementation((id) => clearTimeout(id));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('initializes a zeroed grid with the expected size', () => {
    const { result } = renderHook(() =>
      useGameOfLife({
        width: 4,
        height: 3,
        rule: RULE_CONWAY_CLASSIC,
        autoStart: false,
      }),
    );

    expect(result.current.grid).toBeInstanceOf(Uint8Array);
    expect(result.current.ages).toBeInstanceOf(Uint16Array);
    expect(result.current.grid.length).toBe(12);
    expect(Array.from(result.current.grid)).toEqual(Array(12).fill(0));
  });

  it('applies Conway classic rules for a simple blinker oscillator', () => {
    const { result } = renderHook(() =>
      useGameOfLife({
        width: 3,
        height: 3,
        rule: RULE_CONWAY_CLASSIC,
        autoStart: false,
      }),
    );

    const { grid, step } = result.current;
    grid[1 * 3 + 0] = 1;
    grid[1 * 3 + 1] = 1;
    grid[1 * 3 + 2] = 1;

    act(() => {
      step();
    });

    const next = result.current.grid;
    expect(next[0 * 3 + 1]).toBe(1);
    expect(next[1 * 3 + 1]).toBe(1);
    expect(next[2 * 3 + 1]).toBe(1);
  });
});
