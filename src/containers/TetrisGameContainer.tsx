import Board3D from "../components/three/Board3D";
import SceneCanvas from "../components/three/SceneCanvas";
import Title3D from "../components/three/Title3D";
import { computeBoardView } from "../tetris/boardView";
import useTetrisGameState from "../hooks/useTetrisGameState";
import { initPreviewTetroMatrix } from "../types/TetroMatrix";
import { TetrominoTypeAndPosition } from "../types/Tetromino";

/** Fits every trimmed piece (the I piece is 4 wide, the rest ≤ 2 tall). */
const PREVIEW_FRAME = { width: 4, height: 2 };

export default function TetrisGameContainer() {
  const [state] = useTetrisGameState();

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
