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

- React 19 with the **React Compiler** (`babel-plugin-react-compiler`, wired in `vite.config.ts`). Don't add `useMemo`/`useCallback` for memoization — avoiding them is an explicit goal of the project.
- TailwindCSS for UI styling; no CSS modules. Boards are drawn with WebGL via React Three Fiber (`three`, `@react-three/fiber`, `@react-three/drei`). Fiber 9 caps React below 19.4, so check its peer range before bumping React.

## Architecture

The game logic is a pure, framework-free state machine in `src/tetris/`, driven by a thin React layer.

**State + reducer.** `TetrisGameState.ts` defines the whole game state (board matrix, current/held/upcoming tetrominos, score, timers, `gameStatus`) and the `TetrisGameAction` union (`TICK`, `MOVE`, `DROP`, `ROTATE`, `HOLD_TETROMINO`, `PAUSE_RESUME`). `TetrisReducer.ts` is wrapped in Immer's `produce`, so the reducer and every helper it calls (`TetrisPhys.ts`, `TetrisHelpers.ts`, `LevelScore.ts`) **mutate the draft `state` in place** rather than returning new objects. Keep new logic in that style.

**Reducer pipeline.** After handling the specific action, every reducer call runs the same post-steps: `applyGhostY` → `handleOnGround` (lock delay: 400 ms on the ground or 15 moves, then place + spawn) → `checkForFullLines` → `checkLevel` → `applyGhostY`. Anything that changes piece position should rely on this pipeline rather than duplicating it.

**Game status.** `playing` | `paused` | `suspended` | `game-over`. When full lines are found, `checkForFullLines` sets `suspended` and records `fullLinesState` with a timestamp; while suspended the reducer ignores input and, on `TICK`s, clears the lines and spawns the next piece after ~300 ms (giving the UI time to animate). Game over is detected in `popUpcomingTetromino` when the next piece can't spawn at (4, 0).

**Timing/input (React layer).** `hooks/useTetrisGameState.tsx` owns `useReducer` and maps keys → actions (arrows move, `z`/`x` rotate, space hard-drops, `s` holds, `p` pauses) via `useKeyEvents` (custom key-repeat handling). Two `useInterval`s drive time: gravity dispatches `MOVE down` with `system: true` (so it isn't scored as a soft drop) at `dropTimeDelta`, and a 100 ms `TICK` runs only while `suspended`. Passing `undefined` as the delay disables an interval.

**Mobile.** `hooks/useViewport.ts` `useIsCompactLayout()` (width < 768px or `pointer: coarse`) switches `TetrisGameContainer` to a compact layout: the playfield `cellPx` is computed from the window size (`COMPACT_RESERVED_HEIGHT_PX` is the vertical space everything else needs, so update it if the compact layout changes), with hold/next/score in a narrow side column and `components/TouchControls.tsx` below. Touch buttons dispatch the same actions as the keyboard; the move buttons auto-repeat while held. `App` hides the keyboard help panel in this layout. The WebGL overlay canvas must keep `pointer-events: none` (set on fiber's `<Canvas style>`) or it swallows taps on the UI.

**Matrices.** `types/TetroMatrix.ts` uses a flat row-major `cells` array (`cells[y * width + x]`) of colors or `"clear"`; the board is 10×20. Pieces are stored as a type + `{x, y, rotation}` and their rotated matrix is computed on demand (`rotateTetroMatrix`), then collision-tested with `canPlaceTetromino`.

**Rotation (SRS).** `types/Tetromino.ts` holds SRS piece definitions; `types/TetroRotationBump.ts` holds the wall/floor-kick offset tables (separate tables for I, O, and the standard JLSTZ). `handleRotate` tries each kick offset in order and applies the first one that fits.

**Rendering.** `containers/TetrisGameContainer.tsx` turns state into `BoardView`s with `tetris/boardView.ts` (`computeBoardView`): a flat list of filled cells, each tagged `ghost`/`fullLine`, with the current piece and ghost merged in. Each board (playfield, hold box, previews) is a `components/three/Board3D.tsx`, which renders a drei `<View>` placeholder div in the normal Tailwind layout. A single transparent, fixed, full-viewport `<Canvas>` (`components/three/SceneCanvas.tsx`, `View.Port`) draws every view into its div's screen rectangle, so there is one WebGL context.
- The hold and preview boxes pass `initPreviewTetroMatrix` (the piece trimmed to its filled cells, e.g. I = 4×1) with a fixed `frame` of 4×2 and `showBackplate={false}`, so pieces float centred in a constant-size box.
- Cells are drawn with three `InstancedMesh`es per board (solid / ghost / line-clear flash), updated imperatively in a `useLayoutEffect`. Board (x, y-down) maps to world `(x - (w-1)/2, (h-1)/2 - y, 0)`.
- The canvas uses `frameloop="demand"`, so imperative scene changes must call `invalidate()`. The line-clear pulse keeps calling `invalidate()` from `useFrame` while `flashing`.
- The page title is `components/three/Title3D.tsx`: drei `Text3D` using the font vendored in `src/assets/fonts/` (a three.js example font, licence alongside), so nothing is fetched at runtime. The gradient is painted into vertex colours and the sway runs from `useFrame`, which keeps the canvas rendering continuously; it is skipped under `prefers-reduced-motion`. A visually hidden `<h1>` keeps the title accessible.
- Geometry and materials are module-level singletons in `components/three/materials.ts`, shared by every board, so meshes use `dispose={null}`.
