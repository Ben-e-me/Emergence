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
