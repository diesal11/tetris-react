import { useReducer } from "react";
import { produce } from "immer";
import {
  initTetroMatrix,
  mergeTetroMatrices,
  rotateTetroMatrixClockwise,
  TetroMatrix,
} from "../types/TetroMatrix";
import {
  randomTetrominoType,
  TetrominoDefinitions,
  TetrominoPosition,
  TetrominoRotation,
  TetrominoType,
  TetrominoTypeAndPosition,
} from "../types/Tetromino";
import useInterval from "./useInterval";
import useKeyPress from "./useKeyPress";

type GameStatus =
  /// The game is currently being played.
  | "playing"
  /// The game is currently suspended by the system, usually while an animation is playing or level is being changed.
  | "suspended"
  /// The game is currently paused by the user.
  | "paused"
  /// The game is over.
  | "game-over";

type GameState = {
  gameStatus: GameStatus;
  gameBoardMatrix: TetroMatrix;

  currentTetromino?: TetrominoTypeAndPosition & {
    estimatedDropY: number;
  };
  savedTetromino?: TetrominoType;
  upcomingTetrominos: TetrominoType[];

  fullLinesState?: {
    lines: number[];
    timestamp: number;
  };
};

type Action<T extends string, P = never> = {
  type: T;
  payload?: P;
};

type GameAction =
  | Action<"TICK">
  | Action<"MOVE_DOWN">
  | Action<"MOVE_LEFT">
  | Action<"MOVE_RIGHT">
  | Action<"DROP">
  | Action<"ROTATE">
  | Action<"SAVE_TETROMINO">
  | Action<"PAUSE_RESUME">;

function applyEstimatedDropY(state: GameState) {
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

  state.currentTetromino.estimatedDropY = estimatedDropY - 1;
}

function popTetromino(state: GameState) {
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
    estimatedDropY: 0,
  };

  applyEstimatedDropY(state);
  state.upcomingTetrominos.push(randomTetrominoType());
}

function placeTetromino(state: GameState) {
  if (!state.currentTetromino) {
    return;
  }

  const tetroDef = TetrominoDefinitions[state.currentTetromino.type];
  const tetroMatrix = rotateTetroMatrixClockwise(
    tetroDef.matrix,
    state.currentTetromino.rotation,
  );

  state.gameBoardMatrix = mergeTetroMatrices(
    state.gameBoardMatrix,
    tetroMatrix,
    {
      x: state.currentTetromino.x,
      y: state.currentTetromino.y,
    },
  );

  state.currentTetromino = undefined;
}

function canPlaceTetromino(
  type: TetrominoType,
  newPosition: TetrominoPosition,
  gameBoardMatrix: TetroMatrix,
): boolean {
  const tetroDef = TetrominoDefinitions[type];
  const tetroMatrix = rotateTetroMatrixClockwise(
    tetroDef.matrix,
    newPosition.rotation,
  );

  if (
    newPosition.x < 0 ||
    newPosition.x + tetroMatrix.width > gameBoardMatrix.width ||
    newPosition.y < 0 ||
    newPosition.y + tetroMatrix.height > gameBoardMatrix.height
  ) {
    return false;
  }

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

function checkForFullLines(state: GameState) {
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

function clearFullLines(state: GameState) {
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

  state.fullLinesState = undefined;
  state.gameStatus = "playing";
  popTetromino(state);
}

function reducer(state: GameState, action: GameAction): GameState {
  if (action.type === "PAUSE_RESUME") {
    if (state.gameStatus !== "paused" && state.gameStatus !== "playing") {
      return state;
    }

    state.gameStatus = state.gameStatus === "playing" ? "paused" : "playing";
    return state;
  }

  if (state.gameStatus === "suspended") {
    const now = Date.now();
    if (now - state.fullLinesState!.timestamp > 500) {
      clearFullLines(state);
    }
  }

  if (state.gameStatus !== "playing") {
    return state;
  }

  if (!state.currentTetromino) {
    return state;
  }

  switch (action.type) {
    case "SAVE_TETROMINO":
      if (!state.savedTetromino) {
        state.savedTetromino = state.currentTetromino.type;
        popTetromino(state);
      } else {
        const temp = state.currentTetromino.type;

        if (
          canPlaceTetromino(
            state.savedTetromino,
            state.currentTetromino,
            state.gameBoardMatrix,
          )
        ) {
          state.currentTetromino.type = state.savedTetromino;
          state.savedTetromino = temp;
        }
      }
      break;

    case "DROP": {
      let deltaY = 1;

      while (
        canPlaceTetromino(
          state.currentTetromino.type,
          {
            ...state.currentTetromino,
            y: state.currentTetromino.y + deltaY,
          },
          state.gameBoardMatrix,
        )
      ) {
        deltaY++;
      }

      state.currentTetromino.y += deltaY - 1;
      placeTetromino(state);

      break;
    }

    case "MOVE_DOWN":
    case "MOVE_LEFT":
    case "MOVE_RIGHT":
    case "ROTATE": {
      const delta: TetrominoPosition = { x: 0, y: 0, rotation: 0 };

      if (action.type === "MOVE_LEFT") {
        delta.x = -1;
      } else if (action.type === "MOVE_RIGHT") {
        delta.x = 1;
      } else if (action.type === "MOVE_DOWN") {
        delta.y = 1;
      } else if (action.type === "ROTATE") {
        // delta.rotation = ((state.currentTetromino.rotation + 1) %
        //   4) as TetrominoRotation;
        delta.rotation = 1;
      }

      const newRotation = ((state.currentTetromino.rotation + delta.rotation) %
        4) as TetrominoRotation;

      const isValidMove = canPlaceTetromino(
        state.currentTetromino.type,
        {
          ...state.currentTetromino,
          x: state.currentTetromino.x + delta.x,
          y: state.currentTetromino.y + delta.y,
          rotation: newRotation,
        },
        state.gameBoardMatrix,
      );

      if (isValidMove) {
        state.currentTetromino = {
          ...state.currentTetromino,
          x: state.currentTetromino.x + delta.x,
          y: state.currentTetromino.y + delta.y,
          rotation: newRotation,
        };
      } else {
        if (action.type === "MOVE_DOWN") {
          placeTetromino(state);
        }
      }

      break;
    }
  }

  if (!state.fullLinesState) {
    checkForFullLines(state);
  }

  // Check again for full lines state, as it might have been set in checkForFullLines
  if (!state.currentTetromino && !state.fullLinesState) {
    popTetromino(state);
  }

  applyEstimatedDropY(state);

  return state;
}

function initializeGameState(): GameState {
  const state: GameState = {
    gameStatus: "playing",
    gameBoardMatrix: initTetroMatrix(10, 20),
    currentTetromino: {
      type: randomTetrominoType(),
      x: 4,
      y: 0,
      rotation: 0,
      estimatedDropY: 0,
    },
    upcomingTetrominos: [
      randomTetrominoType(),
      randomTetrominoType(),
      randomTetrominoType(),
      randomTetrominoType(),
    ],
  };

  applyEstimatedDropY(state);

  return state;
}

export default function useTetrisGameState() {
  const [state, dispatch] = useReducer(produce(reducer), initializeGameState());

  useKeyPress(
    ["ArrowLeft", "ArrowRight", "ArrowUp", " ", "s", "p"],
    (event) => {
      switch (event.key) {
        case "ArrowLeft":
          dispatch({ type: "MOVE_LEFT" });
          break;
        case "ArrowRight":
          dispatch({ type: "MOVE_RIGHT" });
          break;
        case "ArrowUp":
          dispatch({ type: "ROTATE" });
          break;
        case "s":
          dispatch({ type: "SAVE_TETROMINO" });
          break;
        case "p":
          dispatch({ type: "PAUSE_RESUME" });
          break;
        case " ": // Space
          dispatch({ type: "DROP" });
          break;
      }
    },
    100,
  );

  useKeyPress(
    ["ArrowDown"],
    () => {
      dispatch({ type: "MOVE_DOWN" });
    },
    50,
  );

  useInterval(
    () => {
      dispatch({ type: "MOVE_DOWN" });
    },
    state.gameStatus === "playing" ? 1000 : undefined,
  );

  useInterval(
    () => {
      dispatch({ type: "TICK" });
    },
    state.gameStatus === "suspended" ? 500 : undefined,
  );

  return [state, dispatch] as const;
}
