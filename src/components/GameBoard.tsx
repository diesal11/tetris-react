import Tetracube from "./Tetracube";
import {
  mergeTetroMatrices,
  rotateTetroMatrixClockwise,
  TetroMatrix,
} from "../types/TetroMatrix";
import {
  TetrominoDefinitions,
  TetrominoTypeAndPosition,
} from "../types/Tetromino";

export default function GameBoard(props: {
  matrix: TetroMatrix;
  currentTetro?: TetrominoTypeAndPosition;
  previewTetro?: TetrominoTypeAndPosition;
  fullLines?: number[];
  hideGrid?: boolean;
}) {
  let currentTetroMatrix: TetroMatrix | undefined = undefined;
  let previewTetroMatrix: TetroMatrix | undefined = undefined;
  let mergedMatrix: TetroMatrix;
  const previewCellIndexes: number[] = [];

  if (props.currentTetro) {
    currentTetroMatrix = rotateTetroMatrixClockwise(
      TetrominoDefinitions[props.currentTetro.type].matrix,
      props.currentTetro.rotation,
    );

    mergedMatrix = mergeTetroMatrices(
      props.matrix,
      currentTetroMatrix,
      props.currentTetro,
    );
  } else {
    mergedMatrix = props.matrix;
  }

  if (props.previewTetro) {
    previewTetroMatrix = rotateTetroMatrixClockwise(
      TetrominoDefinitions[props.previewTetro.type].matrix,
      props.previewTetro.rotation,
    );

    for (const [i, color] of previewTetroMatrix.cells.entries()) {
      if (color === "clear") {
        continue;
      }

      const boardX: number =
        props.previewTetro.x + (i % previewTetroMatrix.width);
      const boardY: number =
        props.previewTetro.y + Math.floor(i / previewTetroMatrix.width);

      const boardIndex: number = boardY * mergedMatrix.width + boardX;

      if (mergedMatrix.cells[boardIndex] === "clear") {
        previewCellIndexes.push(boardIndex);
      }
    }

    mergedMatrix = mergeTetroMatrices(
      mergedMatrix,
      previewTetroMatrix,
      props.previewTetro,
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
                  faded={previewCellIndexes.includes(
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
