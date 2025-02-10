import Tetracube from "./Tetracube";
import {
  mergeTetroMatrices,
  rotateTetroMatrix,
  TetroMatrix,
} from "../types/TetroMatrix";
import {
  getTetrominoMatrix,
  TetrominoTypeAndPosition,
} from "../types/Tetromino";

export default function GameBoard(props: {
  matrix: TetroMatrix;
  currentTetro?: TetrominoTypeAndPosition;
  ghostTetro?: TetrominoTypeAndPosition;
  fullLines?: number[];
  hideGrid?: boolean;
}) {
  let currentTetroMatrix: TetroMatrix | undefined = undefined;
  let ghostTetroMatrix: TetroMatrix | undefined = undefined;
  let mergedMatrix: TetroMatrix;
  const previewCellIndexes: number[] = [];

  if (props.currentTetro) {
    currentTetroMatrix = rotateTetroMatrix(
      getTetrominoMatrix(props.currentTetro.type),
      props.currentTetro.rotation,
      "right",
    );

    mergedMatrix = mergeTetroMatrices(
      props.matrix,
      currentTetroMatrix,
      props.currentTetro,
    );
  } else {
    mergedMatrix = props.matrix;
  }

  if (props.ghostTetro) {
    ghostTetroMatrix = rotateTetroMatrix(
      getTetrominoMatrix(props.ghostTetro.type),
      props.ghostTetro.rotation,
      "right",
    );

    for (const [i, color] of ghostTetroMatrix.cells.entries()) {
      if (color === "clear") {
        continue;
      }

      const boardX: number = props.ghostTetro.x + (i % ghostTetroMatrix.width);
      const boardY: number =
        props.ghostTetro.y + Math.floor(i / ghostTetroMatrix.width);

      const boardIndex: number = boardY * mergedMatrix.width + boardX;

      if (mergedMatrix.cells[boardIndex] === "clear") {
        previewCellIndexes.push(boardIndex);
      }
    }

    mergedMatrix = mergeTetroMatrices(
      mergedMatrix,
      ghostTetroMatrix,
      props.ghostTetro,
    );
  }

  // Split the matrix into rows and cells
  const rows = Array.from({ length: mergedMatrix.height }, (_, rowIndex) =>
    mergedMatrix.cells.slice(
      rowIndex * mergedMatrix.width,
      (rowIndex + 1) * mergedMatrix.width,
    ),
  );

  const gridColor = props.hideGrid ? "bg-white" : "bg-black";

  return (
    <div className={`${gridColor} p-1`}>
      <div className="flex flex-col gap-1 border-black">
        {rows.map((color, rowIdx) => {
          const isFullLine = props.fullLines?.includes(rowIdx) ?? false;
          return (
            <div
              key={rowIdx}
              className={`flex flex-row gap-1 ${isFullLine ? "opacity-50" : ""}`}
            >
              {color.map((color, colIdx) => (
                <Tetracube
                  key={colIdx}
                  color={color}
                  ghost={previewCellIndexes.includes(
                    rowIdx * mergedMatrix.width + colIdx,
                  )}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
