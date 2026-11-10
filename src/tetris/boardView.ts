import {
  mergeTetroMatrices,
  rotateTetroMatrix,
  TetroMatrix,
} from "../types/TetroMatrix";
import {
  getTetrominoMatrix,
  TetrominoColor,
  TetrominoTypeAndPosition,
} from "../types/Tetromino";

export type BoardCell = {
  x: number;
  y: number;
  color: TetrominoColor;
  ghost: boolean;
  fullLine: boolean;
};

export type BoardView = {
  width: number;
  height: number;
  /** Only the non-clear cells; y = 0 is the top row. */
  cells: BoardCell[];
};

/**
 * Flattens a board matrix plus the falling piece and its ghost into the list
 * of filled cells a renderer needs to draw.
 */
export function computeBoardView(args: {
  matrix: TetroMatrix;
  currentTetro?: TetrominoTypeAndPosition;
  ghostTetro?: TetrominoTypeAndPosition;
  fullLines?: number[];
}): BoardView {
  const { matrix, currentTetro, ghostTetro, fullLines } = args;

  let merged = matrix;
  if (currentTetro) {
    merged = mergeTetroMatrices(
      merged,
      rotateTetroMatrix(
        getTetrominoMatrix(currentTetro.type),
        currentTetro.rotation,
        "right",
      ),
      currentTetro,
    );
  }

  const ghostIndexes = new Set<number>();
  if (ghostTetro) {
    const ghostMatrix = rotateTetroMatrix(
      getTetrominoMatrix(ghostTetro.type),
      ghostTetro.rotation,
      "right",
    );

    const ghostOnly = { ...merged, cells: [...merged.cells] };
    for (const [i, color] of ghostMatrix.cells.entries()) {
      if (color === "clear") {
        continue;
      }

      const x = ghostTetro.x + (i % ghostMatrix.width);
      const y = ghostTetro.y + Math.floor(i / ghostMatrix.width);
      if (x < 0 || x >= merged.width || y < 0 || y >= merged.height) {
        continue;
      }

      const index = y * merged.width + x;
      // The current piece (or a placed cell) wins any overlap with the ghost.
      if (merged.cells[index] === "clear") {
        ghostIndexes.add(index);
        ghostOnly.cells[index] = color;
      }
    }
    merged = ghostOnly;
  }

  const fullLineSet = new Set(fullLines ?? []);
  const cells: BoardCell[] = [];
  for (const [index, color] of merged.cells.entries()) {
    if (color === "clear") {
      continue;
    }

    const y = Math.floor(index / merged.width);
    cells.push({
      x: index % merged.width,
      y,
      color,
      ghost: ghostIndexes.has(index),
      fullLine: fullLineSet.has(y),
    });
  }

  return { width: merged.width, height: merged.height, cells };
}
