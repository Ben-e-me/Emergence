---
title: Architecture
---

<!--
  @file docs/architecture.md
  @description System design notes for Emergence, covering simulation, hooks, and rendering.
  @architecture
  - Documents contracts for custom hooks and pure simulation utilities.
  - Intended to stay in sync with implementation as sessions evolve.
-->

# Architecture

## High-Level Shape

- **Simulation core (`src/simulation/`)**: Pure functions operating on typed arrays.
- **Custom hooks (`src/hooks/`)**: Orchestrate simulation state and translate it into UI-friendly data.
- **UI components (`src/components/`)**: Canvas and narrative surfaces, all styled with CSS Modules.
- **Utilities (`src/utils/`)**: Standalone helpers with unit tests in `tests/utils`.

## Core Hooks

### `useGameOfLife`

**Inputs**

- `width: number` – number of columns in the grid.
- `height: number` – number of rows in the grid.
- `rule: RulePreset` – rule in B/S notation (`{ born: number[]; survive: number[] }`).
- `isRunning: boolean` – whether the simulation loop should advance.
- `speed: number` – generations per second target.

**Outputs**

- `grid: Uint8Array` – `0` for dead, `1` for alive.
- `ages: Uint16Array` – survival age for each cell, by index.
- `step(): void` – manually advance one generation.
- `reset(seed?: SeedDefinition): void` – reset the universe to an initial pattern.

### `usePatternDetection`

Wraps detection utilities from `src/simulation` to identify still lifes, oscillators, and spaceships in the current grid.

### `useAccentColor`

Manages the user-configurable accent color, persisting preference to `localStorage` while falling back to the design system default.
