<!--
  @file docs/CHANGELOG.md
  @description Versioned change history for Emergence, following Keep a Changelog.
  @architecture
  - Mirrors semantic versioning from package.json.
  - Updated at the end of every working session.
-->

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-03-13

### Added

- `src/simulation/universe.js` — `stepUniverse` extracted from the hook into a pure, independently testable module.
- `tests/simulation/universe.test.js` — 11 tests covering still lifes, oscillators, birth/death rules, boundary conditions, and HighLife.
- `tests/simulation/seeds.test.js` — 7 tests covering density accuracy, edge cases (0%/100%), and type guarantees.
- `src/hooks/useAccentColor.js` — localStorage-backed accent color hook; applies choice to `--emergence-color-accent` globally.
- Color swatch picker in the hero panel (6 presets: Violet, Cyan, Coral, Gold, Sky, Pink); selection persists across sessions.

### Changed

- `useGameOfLife` now imports `stepUniverse` from `src/simulation/universe.js` instead of defining it internally.

## [0.2.0] - 2026-03-13

### Added

- Random seed initializer (`src/simulation/seeds.js`) — fills the grid at a configurable density on mount and reset.
- Play/Pause, Step, and Reset controls in the hero panel; Step is disabled while the simulation is running.
- Simulation state lifted to `App` so controls and canvas share a single source of truth.

### Changed

- `LifeCanvas` simplified to a pure renderer — accepts `grid`, `ages`, `width`, `height`, and `cellSizeCss` as props instead of calling hooks internally.

## [0.1.0] - 2026-03-11

### Added

- Initial Vite + React scaffold for the Emergence experience.
- Project structure for hooks, components, simulation, constants, utils, styles, tests, and docs.
- Global design tokens (colors, typography, motion) aligned with the visual direction.
- Documentation skeleton, including architecture and decision log.
