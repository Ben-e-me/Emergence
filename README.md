/**
 * @file README.md
 * @description Top-level project overview for Emergence, intended for GitHub.
 * @architecture
 * - Summarizes purpose, stack, and developer workflows.
 */

# Emergence

Emergence is a browser-based, canvas-driven experience that visualizes Conway&apos;s Game of Life to explore the principle of emergence.

The project balances:

- A **guided narrative** that frames the simulation as a living meditation.
- An **exploration tool** for playing with rules, seeds, and patterns.

## Stack

- [Vite](https://vitejs.dev/) + [React](https://react.dev/)
- HTML Canvas for simulation rendering
- Vitest for unit tests
- ESLint + Prettier for linting and formatting

## Scripts

- `npm run dev` – start the local development server.
- `npm run build` – build the production bundle.
- `npm run preview` – preview the production build locally.
- `npm test` – run unit tests with Vitest.
- `npm run lint` – run ESLint over the `src` tree.
- `npm run format` – format source, tests, and docs with Prettier.
- `npm run format:check` – check formatting without writing changes.

## Documentation

See the `docs/` directory for:

- `index.md` – project overview and documentation map.
- `architecture.md` – system and data structure design.
- `CHANGELOG.md` – version history (Keep a Changelog).
- `DECISIONS.md` – design, technical, and feature decisions.

