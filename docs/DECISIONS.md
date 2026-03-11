<!--
  @file docs/DECISIONS.md
  @description Decision log for Emergence, separated into Design, Technical, and Feature categories.
  @architecture
  - Captures the "why" behind structural and experiential choices.
  - Intended as a living document as the project evolves.
-->

# Decisions

## Design

- **Cosmic, material-inspired shell** – The initial layout uses a glassy, panel-based shell to foreground the simulation as a living object rather than a raw grid of pixels.

## Technical

- **Typed arrays for the universe** – The simulation uses `Uint8Array` for the grid and `Uint16Array` for ages, keeping the core engine predictable and performant.
- **Manual Vite configuration** – Vite and React are configured directly rather than using a starter template, to keep full control over structure and tooling.

## Feature

- **Session-based evolution** – The experience will grow in sessions, starting with a core visualization and layering narrative, presets, and pattern exploration over time.

