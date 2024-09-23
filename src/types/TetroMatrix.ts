import assertNever from "../utils/assertNever";
import {
  randomTetrominoColor,
  TetrominoColor,
  TetrominoDefinitions,
  TetrominoRotation,
  TetrominoType,
} from "./Tetromino";

export type TetroMatrix = {
  width: number;
  height: number;
  cells: (TetrominoColor | "clear")[];
};

export function rotateTetroMatrixClockwise(
  matrix: TetroMatrix,
  rotations: TetrominoRotation,
): TetroMatrix {
  if (rotations === 0) {
    return matrix;
  }

  const newMatrix =
    rotations % 2 === 0
      ? initTetroMatrix(matrix.width, matrix.height)
      : initTetroMatrix(matrix.height, matrix.width);

  matrix.cells.forEach((cell, index) => {
    const x = index % matrix.width;
    const y = Math.floor(index / matrix.width);

    let newX: number;
    let newY: number;
    if (rotations === 1) {
      newX = matrix.height - y - 1;
      newY = x;
    } else if (rotations === 2) {
      newX = matrix.width - x - 1;
      newY = matrix.height - y - 1;
    } else if (rotations === 3) {
      newX = y;
      newY = matrix.width - x - 1;
    } else {
      assertNever(rotations);
    }

    newMatrix.cells[newY * newMatrix.width + newX] = cell;
  });
  return newMatrix;
}

export function initTetroMatrix(width: number, height: number): TetroMatrix {
  const cells = Array.from<unknown, "clear">(
    { length: width * height },
    () => "clear",
  );

  return {
    width,
    height,
    cells,
  };
}

export function initPreviewTetroMatrix(type?: TetrominoType): TetroMatrix {
  if (!type) {
    return initTetroMatrix(3, 4);
  }

  const matrix = TetrominoDefinitions[type].matrix;
  return mergeTetroMatrices(initTetroMatrix(3, 4), matrix, {
    x: 0,
    y: 0,
  });
}

export function mergeTetroMatrices(
  a: TetroMatrix,
  b: TetroMatrix,
  bOffset: { x: number; y: number },
): TetroMatrix {
  const mergedMatrix = initTetroMatrix(a.width, a.height);

  a.cells.forEach((cell, index) => {
    const x = index % a.width;
    const y = Math.floor(index / a.width);

    mergedMatrix.cells[y * a.width + x] = cell;
  });

  b.cells.forEach((cell, index) => {
    if (cell === "clear") {
      return;
    }

    const x = index % b.width;
    const y = Math.floor(index / b.width);

    mergedMatrix.cells[(y + bOffset.y) * a.width + (x + bOffset.x)] = cell;
  });

  return mergedMatrix;
}

export function fillMatrixRandomly(matrix: TetroMatrix): TetroMatrix {
  const newCells = matrix.cells.map(() =>
    Math.random() > 0.25 ? randomTetrominoColor() : "clear",
  );

  return {
    ...matrix,
    cells: newCells,
  };
}
