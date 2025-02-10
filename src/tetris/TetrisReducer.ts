import { produce } from "immer";
import {
  getTetrominoBumps,
  TetrominoMovementDirection,
  TetrominoPosition,
  TetrominoRotation,
  TetrominoRotationDirection,
} from "../types/Tetromino";
import { checkLevel, handleSoftDropScore } from "./LevelScore";
import { TetrisGameAction, TetrisGameState } from "./TetrisGameState";
import { placeCurrentTetromino, popUpcomingTetromino } from "./TetrisHelpers";
import {
  applyGhostY,
  canPlaceTetromino,
  checkForFullLines as handleFullLines,
  clearFullLines,
} from "./TetrisPhys";

function tetrisReducer(state: TetrisGameState, action: TetrisGameAction) {
  if (action.type === "PAUSE_RESUME") {
    handlePauseResume(state);
    return state;
  }

  if (state.gameStatus === "suspended") {
    handleSuspended(state);
    return state;
  }

  if (state.gameStatus !== "playing") {
    return state;
  }

  if (action.type === "HOLD_TETROMINO") {
    handleHoldTetromino(state);
  } else if (action.type === "DROP") {
    handleHardDrop(state);
  } else if (action.type === "ROTATE") {
    handleRotate(state, action.direction);
  } else if (action.type === "MOVE") {
    handleMove(state, action.direction, action.system);
  }

  applyGhostY(state);

  handleOnGround(state);
  handleFullLines(state);
  checkLevel(state);

  applyGhostY(state);
}

function handlePauseResume(state: TetrisGameState) {
  if (state.gameStatus !== "paused" && state.gameStatus !== "playing") {
    return;
  }

  state.gameStatus = state.gameStatus === "playing" ? "paused" : "playing";
}

function handleSuspended(state: TetrisGameState) {
  const now = Date.now();
  if (now - state.fullLinesState!.timestamp > 300) {
    clearFullLines(state);
    popUpcomingTetromino(state);
  }
}

function handleHoldTetromino(state: TetrisGameState) {
  if (!state.currentTetromino) {
    return;
  }

  if (!state.savedTetromino) {
    state.savedTetromino = state.currentTetromino.type;
    popUpcomingTetromino(state);
    return;
  }

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

function handleHardDrop(state: TetrisGameState) {
  if (!state.currentTetromino) {
    return;
  }

  state.currentTetromino.y = state.currentTetromino.ghostY;
  placeCurrentTetromino(state);
  popUpcomingTetromino(state);
}

function handleRotate(
  state: TetrisGameState,
  direction: TetrominoRotationDirection,
) {
  if (!state.currentTetromino) {
    return;
  }

  const rotationDelta = direction === "left" ? -1 : 1;

  for (const [xDelta, yDelta] of getTetrominoBumps(
    state.currentTetromino.type,
    state.currentTetromino.rotation,
    direction,
  )) {
    if (
      canPlaceTetromino(
        state.currentTetromino.type,
        {
          ...state.currentTetromino,
          x: state.currentTetromino.x + xDelta,
          y: state.currentTetromino.y + yDelta,
          rotation: ((state.currentTetromino.rotation + rotationDelta) %
            4) as TetrominoRotation,
        },
        state.gameBoardMatrix,
      )
    ) {
      state.currentTetromino.rotation = ((state.currentTetromino.rotation +
        rotationDelta +
        4) %
        4) as TetrominoRotation;
      state.currentTetromino.x += xDelta;
      state.currentTetromino.y += yDelta;
      break;
    }
  }
}

function handleMove(
  state: TetrisGameState,
  direction: TetrominoMovementDirection,
  system: boolean,
) {
  if (!state.currentTetromino) {
    return;
  }

  const delta: TetrominoPosition = { x: 0, y: 0, rotation: 0 };

  if (direction === "left") {
    delta.x = -1;
  } else if (direction === "right") {
    delta.x = 1;
  } else if (direction === "down") {
    delta.y = 1;
  }

  const isValidMove = canPlaceTetromino(
    state.currentTetromino.type,
    {
      ...state.currentTetromino,
      x: state.currentTetromino.x + delta.x,
      y: state.currentTetromino.y + delta.y,
    },
    state.gameBoardMatrix,
  );

  if (isValidMove) {
    state.currentTetromino = {
      ...state.currentTetromino,
      x: state.currentTetromino.x + delta.x,
      y: state.currentTetromino.y + delta.y,
    };

    if (state.startTimeOnGround) {
      state.startTimeOnGround = Date.now();
      state.numOfMovesOnGround += 1;
    }

    if (direction === "down" && !system) {
      handleSoftDropScore(state);
    }
  }
}

function handleOnGround(state: TetrisGameState) {
  if (!state.currentTetromino) {
    return;
  }

  const isOnGround = state.currentTetromino.y === state.currentTetromino.ghostY;
  if (!isOnGround) {
    state.startTimeOnGround = undefined;
    state.numOfMovesOnGround = 0;
    return;
  }

  if (state.numOfMovesOnGround === 15) {
    placeCurrentTetromino(state);
    popUpcomingTetromino(state);
    return;
  }

  if (state.startTimeOnGround === undefined) {
    state.startTimeOnGround = Date.now();
  }

  if (Date.now() - state.startTimeOnGround > 400) {
    placeCurrentTetromino(state);
    popUpcomingTetromino(state);
  }
}

export default produce(tetrisReducer);
