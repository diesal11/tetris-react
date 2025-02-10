import {
  getTetrominoMatrix,
  randomTetrominoColor,
  TetrominoColor,
  TetrominoRotation,
  TetrominoRotationDirection,
  TetrominoType,
} from "./Tetromino";

export type TetroMatrix = {
  width: number;
  height: number;
  cells: (TetrominoColor | "clear")[];
};

export function rotateTetroMatrix(
  matrix: TetroMatrix,
  rotations: TetrominoRotation,
  direction: TetrominoRotationDirection,
): TetroMatrix {
  if (rotations === 0) {
    return matrix;
  }

  const newMatrix =
    rotations % 2 === 0
      ? initTetroMatrix(matrix.width, matrix.height)
      : initTetroMatrix(matrix.height, matrix.width);

  switch (direction) {
    case "right": {
      for (let y = 0; y < matrix.height; y++) {
        for (let x = 0; x < matrix.width; x++) {
          const newX = matrix.height - 1 - y;
          const newY = x;
          newMatrix.cells[newY * newMatrix.width + newX] =
            matrix.cells[y * matrix.width + x];
        }
      }
      break;
    }
    case "left": {
      for (let y = 0; y < matrix.height; y++) {
        for (let x = 0; x < matrix.width; x++) {
          const newX = y;
          const newY = matrix.width - 1 - x;
          newMatrix.cells[newY * newMatrix.width + newX] =
            matrix.cells[y * matrix.width + x];
        }
      }
      break;
    }
  }

  if (rotations > 1) {
    return rotateTetroMatrix(
      newMatrix,
      (rotations - 1) as TetrominoRotation,
      direction,
    );
  }

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

  const matrix = getTetrominoMatrix(type);
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
