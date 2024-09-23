import GameBoard from "../components/GameBoard";
import useTetrisGameState from "../hooks/useTetrisGameState";
import { initPreviewTetroMatrix } from "../types/TetroMatrix";
import { TetrominoTypeAndPosition } from "../types/Tetromino";

export default function TetrisGameContainer() {
  const [state] = useTetrisGameState();

  const savedTetroMatrix = initPreviewTetroMatrix(state.savedTetromino);
  const previewMatrixes = state.upcomingTetrominos.map(initPreviewTetroMatrix);

  let fallPreviewTetromino: TetrominoTypeAndPosition | undefined = undefined;
  if (state.currentTetromino) {
    fallPreviewTetromino = {
      type: state.currentTetromino.type,
      x: state.currentTetromino.x,
      y: state.currentTetromino.estimatedDropY,
      rotation: state.currentTetromino.rotation,
    };
  }

  const opacity = state.gameStatus === "paused" ? "opacity-50" : "opacity-100";
  let titleText = "Tetris React";

  if (state.gameStatus === "paused") {
    titleText += " - Paused";
  } else if (state.gameStatus === "game-over") {
    titleText += " - Game Over";
  }

  return (
    <>
      <div className="flex flex-col gap-5">
        <h1 className="bg-gradient-to-r from-red-500 to-violet-500 bg-clip-text text-center text-4xl font-bold text-transparent">
          {titleText}
        </h1>
        <div className={`flex items-start gap-5 ${opacity}`}>
          <div className="flex flex-col justify-between gap-5">
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-slate-300 p-6">
              <h1 className="text-center font-bold">Held Tetro</h1>
              <GameBoard matrix={savedTetroMatrix} />
            </div>

            {/* <div className="rounded-2xl bg-slate-300 p-6">
              <h1 className="text-center font-bold">Score: 1000</h1>
            </div> */}
          </div>

          <div className="rounded-2xl bg-slate-300 p-6">
            <GameBoard
              matrix={state.gameBoardMatrix}
              currentTetro={state.currentTetromino}
              previewTetro={fallPreviewTetromino}
              fullLines={state.fullLinesState?.lines}
            />
          </div>

          <div className="flex flex-col items-center gap-6 rounded-2xl bg-slate-300 p-6">
            <h1 className="text-center font-bold">Upcoming Tetros</h1>
            {previewMatrixes.map((matrix, index) => (
              <GameBoard key={index} matrix={matrix} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
