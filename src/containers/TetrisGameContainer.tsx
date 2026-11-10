import Board3D from "../components/three/Board3D";
import SceneCanvas from "../components/three/SceneCanvas";
import Title3D from "../components/three/Title3D";
import { computeBoardView } from "../tetris/boardView";
import TouchControls from "../components/TouchControls";
import useTetrisGameState from "../hooks/useTetrisGameState";
import { useIsCompactLayout, useWindowSize } from "../hooks/useViewport";
import { initPreviewTetroMatrix } from "../types/TetroMatrix";
import { TetrominoTypeAndPosition } from "../types/Tetromino";

/** Fits every trimmed piece (the I piece is 4 wide, the rest ≤ 2 tall). */
const PREVIEW_FRAME = { width: 4, height: 2 };

/** Cell size for the hold/next boxes in the compact (mobile) layout. */
const COMPACT_SIDE_CELL_PX = 11;
/**
 * Vertical space the compact layout needs besides the playfield: padding,
 * title, gaps, the playfield panel's padding and the two rows of controls.
 */
const COMPACT_RESERVED_HEIGHT_PX = 24 + 40 + 12 + 16 + 12 + 120 + 8;

export default function TetrisGameContainer() {
  const [state, dispatch] = useTetrisGameState();
  const isCompact = useIsCompactLayout();
  const windowSize = useWindowSize();

  const savedTetroView = computeBoardView({
    matrix: initPreviewTetroMatrix(state.savedTetromino),
  });
  const previewViews = state.upcomingTetrominos.map((type) =>
    computeBoardView({ matrix: initPreviewTetroMatrix(type) }),
  );

  let fallGhostTetromino: TetrominoTypeAndPosition | undefined = undefined;
  if (state.currentTetromino) {
    fallGhostTetromino = {
      type: state.currentTetromino.type,
      x: state.currentTetromino.x,
      y: state.currentTetromino.ghostY,
      rotation: state.currentTetromino.rotation,
    };
  }

  const boardView = computeBoardView({
    matrix: state.gameBoardMatrix,
    currentTetro: state.currentTetromino,
    ghostTetro: fallGhostTetromino,
    fullLines: state.fullLinesState?.lines,
  });
  const isFlashing =
    state.gameStatus === "suspended" && state.fullLinesState !== undefined;

  const isPaused = state.gameStatus === "paused";
  const opacity = isPaused ? "opacity-50" : "opacity-100";
  let titleText = "Tetris React";

  if (state.gameStatus === "paused") {
    titleText += " - Paused";
  } else if (state.gameStatus === "game-over") {
    titleText += " - Game Over";
  }

  if (isCompact) {
    // Side column: 4.8 cells wide (4 + margin) plus p-2 padding.
    const sideColumnPx =
      (PREVIEW_FRAME.width + 0.8) * COMPACT_SIDE_CELL_PX + 16;
    const playfieldCellPx = Math.floor(
      Math.min(
        (windowSize.height - COMPACT_RESERVED_HEIGHT_PX) / 20.8,
        (windowSize.width - 32 - sideColumnPx - 8 - 16) / 10.8,
      ),
    );

    return (
      <>
        <SceneCanvas dimmed={isPaused} />
        <div className="flex flex-col items-center gap-3 px-4 py-3">
          <Title3D
            text={titleText}
            widthPx={Math.min(windowSize.width - 32, 720)}
            heightPx={40}
          />
          <div className={`flex items-start gap-2 ${opacity}`}>
            <div className="rounded-xl bg-slate-300 p-2">
              <Board3D
                view={boardView}
                flashing={isFlashing}
                cellPx={Math.max(12, Math.min(32, playfieldCellPx))}
              />
            </div>

            <div className="flex flex-col gap-2 text-center text-xs font-bold">
              <div className="flex flex-col items-center gap-1 rounded-xl bg-slate-300 p-2">
                <h2>Hold</h2>
                <Board3D
                  view={savedTetroView}
                  frame={PREVIEW_FRAME}
                  cellPx={COMPACT_SIDE_CELL_PX}
                  showBackplate={false}
                />
              </div>
              <div className="flex flex-col items-center gap-1 rounded-xl bg-slate-300 p-2">
                <h2>Next</h2>
                {previewViews.map((view, index) => (
                  <Board3D
                    key={index}
                    view={view}
                    frame={PREVIEW_FRAME}
                    cellPx={COMPACT_SIDE_CELL_PX}
                    showBackplate={false}
                  />
                ))}
              </div>
              <div className="rounded-xl bg-slate-300 p-2">
                <p>Level</p>
                <p>{state.score.level}</p>
                <p className="pt-1">Score</p>
                <p>{state.score.score}</p>
                <p className="pt-1">Lines</p>
                <p>{state.score.totalLinesCleared}</p>
              </div>
            </div>
          </div>
          <TouchControls dispatch={dispatch} />
        </div>
      </>
    );
  }

  return (
    <>
      <SceneCanvas dimmed={isPaused} />
      <div className="flex flex-col gap-5">
        <Title3D text={titleText} />
        <div className={`flex items-start gap-5 ${opacity}`}>
          <div className="flex flex-col justify-between gap-5">
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-slate-300 p-6">
              <h1 className="text-center font-bold">Held Tetro</h1>
              <Board3D
                view={savedTetroView}
                frame={PREVIEW_FRAME}
                showBackplate={false}
              />
            </div>

            <div className="rounded-2xl bg-slate-300 p-6">
              <h1 className="text-center font-bold">
                Level: {state.score.level}
              </h1>
              <h1 className="text-center font-bold">
                Score: {state.score.score}
              </h1>
              <h1 className="text-center font-bold">
                Lines Cleared: {state.score.totalLinesCleared}
              </h1>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-300 p-6">
            <Board3D view={boardView} flashing={isFlashing} />
          </div>

          <div className="flex flex-col items-center gap-6 rounded-2xl bg-slate-300 p-6">
            <h1 className="text-center font-bold">Upcoming Tetros</h1>
            {previewViews.map((view, index) => (
              <Board3D
                key={index}
                view={view}
                frame={PREVIEW_FRAME}
                showBackplate={false}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
