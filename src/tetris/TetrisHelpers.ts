import { mergeTetroMatrices, rotateTetroMatrix } from "../types/TetroMatrix";
import { getTetrominoMatrix, randomTetrominoType } from "../types/Tetromino";
import { TetrisGameState } from "./TetrisGameState";
import { canPlaceTetromino } from "./TetrisPhys";

export function millisecondsPerLine(level: number) {
  return Math.pow(0.8 - (level - 1) * 0.007, level - 1) * 1000;
}

export function lineCountToLevel(lineCount: number) {
  return Math.min(15, Math.floor(lineCount / 10) + 1);
}

export function popUpcomingTetromino(state: TetrisGameState) {
  const upcomingTetro = state.upcomingTetrominos[0];
  if (
    !canPlaceTetromino(
      upcomingTetro,
      { x: 4, y: 0, rotation: 0 },
      state.gameBoardMatrix,
    )
  ) {
    state.gameStatus = "game-over";
    return;
  }

  state.currentTetromino = {
    type: state.upcomingTetrominos.shift()!,
    x: 4,
    y: 0,
    rotation: 0,
    ghostY: 0,
  };

  state.upcomingTetrominos.push(randomTetrominoType());
}

export function placeCurrentTetromino(state: TetrisGameState) {
  if (!state.currentTetromino) {
    return;
  }

  const tetroMatrix = rotateTetroMatrix(
    getTetrominoMatrix(state.currentTetromino.type),
    state.currentTetromino.rotation,
    "right",
  );

  state.gameBoardMatrix = mergeTetroMatrices(
    state.gameBoardMatrix,
    tetroMatrix,
    {
      x: state.currentTetromino.x,
      y: state.currentTetromino.y,
    },
  );

  state.numOfMovesOnGround = 0;
}
