# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **Bun** (pinned via `packageManager` in `package.json`; lockfile is `bun.lock`). Bun is only the package manager/script runner — the app is still built and served by Vite.

- `bun install` — install dependencies
- `bun run dev` — Vite dev server
- `bun run build` — type-check (`tsc -b`) then production build to `dist/`
- `bun run lint` — ESLint (flat config in `eslint.config.js`)
- `bun run preview` — serve the production build
- `bunx prettier --write .` — format (uses `prettier-plugin-tailwindcss` to sort class names)

There is no test suite or test runner configured.

### Deployment (`cdk/`)

`cdk/` is a separate Bun package with its own `bun.lock`. It defines two stacks in `cdk/lib/cdk-stack.ts`: `TetrisReactCertificateStack` (ACM cert, must be `us-east-1` for CloudFront) and `TetrisReactStack` (private S3 bucket + CloudFront with OAC + Route53 A/AAAA records for `tetris-react.dlundy.au`, in `ap-southeast-2`), linked via `crossRegionReferences`. The stack does not upload the site — `dist/` must be synced to the bucket separately. Run CDK commands from `cdk/` (e.g. `bun run cdk diff`, `bun run cdk deploy`).

## Stack notes

- React 19 RC with the **React Compiler** (`babel-plugin-react-compiler`, wired in `vite.config.ts`). Don't add `useMemo`/`useCallback` for memoization — avoiding them is an explicit goal of the project.
- TailwindCSS for all styling/animation; no CSS modules.

## Architecture

The game logic is a pure, framework-free state machine in `src/tetris/`, driven by a thin React layer.

**State + reducer.** `TetrisGameState.ts` defines the whole game state (board matrix, current/held/upcoming tetrominos, score, timers, `gameStatus`) and the `TetrisGameAction` union (`TICK`, `MOVE`, `DROP`, `ROTATE`, `HOLD_TETROMINO`, `PAUSE_RESUME`). `TetrisReducer.ts` is wrapped in Immer's `produce`, so the reducer and every helper it calls (`TetrisPhys.ts`, `TetrisHelpers.ts`, `LevelScore.ts`) **mutate the draft `state` in place** rather than returning new objects. Keep new logic in that style.

**Reducer pipeline.** After handling the specific action, every reducer call runs the same post-steps: `applyGhostY` → `handleOnGround` (lock delay: 400 ms on the ground or 15 moves, then place + spawn) → `checkForFullLines` → `checkLevel` → `applyGhostY`. Anything that changes piece position should rely on this pipeline rather than duplicating it.

**Game status.** `playing` | `paused` | `suspended` | `game-over`. When full lines are found, `checkForFullLines` sets `suspended` and records `fullLinesState` with a timestamp; while suspended the reducer ignores input and, on `TICK`s, clears the lines and spawns the next piece after ~300 ms (giving the UI time to animate). Game over is detected in `popUpcomingTetromino` when the next piece can't spawn at (4, 0).

**Timing/input (React layer).** `hooks/useTetrisGameState.tsx` owns `useReducer` and maps keys → actions (arrows move, `z`/`x` rotate, space hard-drops, `s` holds, `p` pauses) via `useKeyEvents` (custom key-repeat handling). Two `useInterval`s drive time: gravity dispatches `MOVE down` with `system: true` (so it isn't scored as a soft drop) at `dropTimeDelta`, and a 100 ms `TICK` runs only while `suspended`. Passing `undefined` as the delay disables an interval.

**Matrices.** `types/TetroMatrix.ts` uses a flat row-major `cells` array (`cells[y * width + x]`) of colors or `"clear"`; the board is 10×20. Pieces are stored as a type + `{x, y, rotation}` and their rotated matrix is computed on demand (`rotateTetroMatrix`), then collision-tested with `canPlaceTetromino`.

**Rotation (SRS).** `types/Tetromino.ts` holds SRS piece definitions; `types/TetroRotationBump.ts` holds the wall/floor-kick offset tables (separate tables for I, O, and the standard JLSTZ). `handleRotate` tries each kick offset in order and applies the first one that fits.

**Rendering.** `containers/TetrisGameContainer.tsx` derives the view (ghost piece, held/preview matrices, title) from state; `components/GameBoard.tsx` renders any `TetroMatrix` with optional overlaid current/ghost pieces and full-line highlighting, and is reused for the main board, hold box and previews.
