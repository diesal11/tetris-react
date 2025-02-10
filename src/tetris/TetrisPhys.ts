import { TetroMatrix, rotateTetroMatrix } from "../types/TetroMatrix";
import {
  TetrominoType,
  TetrominoPosition,
  getTetrominoMatrix,
} from "../types/Tetromino";
import { handleLineClearScore } from "./LevelScore";
import { TetrisGameState } from "./TetrisGameState";

export function canPlaceTetromino(
  type: TetrominoType,
  newPosition: TetrominoPosition,
  gameBoardMatrix: TetroMatrix,
): boolean {
  const tetroMatrix = rotateTetroMatrix(
    getTetrominoMatrix(type),
    newPosition.rotation,
    "right",
  );

  const doesCellCollide = tetroMatrix.cells.some((cell, index) => {
    if (cell === "clear") {
      return false;
    }

    const x = index % tetroMatrix.width;
    const y = Math.floor(index / tetroMatrix.width);
    const boardX = newPosition.x + x;
    const boardY = newPosition.y + y;
    const gameBoardCell =
      gameBoardMatrix.cells[boardY * gameBoardMatrix.width + boardX];

    if (boardX < 0) {
      return true;
    }

    if (boardY < 0) {
      return true;
    }

    if (boardX >= gameBoardMatrix.width) {
      return true;
    }

    if (boardY >= gameBoardMatrix.height) {
      return true;
    }

    if (gameBoardCell !== "clear") {
      return true;
    }
  });

  return !doesCellCollide;
}

export function applyGhostY(state: TetrisGameState) {
  if (!state.currentTetromino) {
    return;
  }

  let estimatedDropY = state.currentTetromino.y + 1;
  while (
    canPlaceTetromino(
      state.currentTetromino.type,
      {
        ...state.currentTetromino,
        y: estimatedDropY,
      },
      state.gameBoardMatrix,
    )
  ) {
    estimatedDropY++;
  }

  state.currentTetromino.ghostY = estimatedDropY - 1;
}

export function checkForFullLines(state: TetrisGameState) {
  if (state.fullLinesState !== undefined) {
    return;
  }

  const fullLines: number[] = [];

  for (let y = 0; y < state.gameBoardMatrix.height; y++) {
    const isFullLine = state.gameBoardMatrix.cells
      .slice(
        y * state.gameBoardMatrix.width,
        (y + 1) * state.gameBoardMatrix.width,
      )
      .every((cell) => cell !== "clear");

    if (isFullLine) {
      fullLines.push(y);
    }
  }

  if (fullLines.length > 0) {
    state.gameStatus = "suspended";
    state.fullLinesState = {
      lines: fullLines,
      timestamp: Date.now(),
    };
  }
}

export function clearFullLines(state: TetrisGameState) {
  const numLines = state.fullLinesState!.lines.length;

  const cellIndexesToRemove = state.fullLinesState!.lines.flatMap((line) => {
    return Array.from(
      { length: state.gameBoardMatrix.width },
      (_, i) => line * state.gameBoardMatrix.width + i,
    );
  });

  const newCells = Array.from(
    { length: cellIndexesToRemove.length },
    () => "clear" as const,
  );

  state.gameBoardMatrix.cells = [
    ...newCells,
    ...state.gameBoardMatrix.cells.filter(
      (_, i) => !cellIndexesToRemove.includes(i),
    ),
  ];

  handleLineClearScore(state, numLines);

  state.fullLinesState = undefined;
  state.gameStatus = "playing";
  state.score.totalLinesCleared += numLines;
}
