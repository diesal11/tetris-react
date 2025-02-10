import { initTetroMatrix, TetroMatrix } from "../types/TetroMatrix";
import {
  TetrominoTypeAndPosition,
  TetrominoType,
  TetrominoRotationDirection,
  randomTetrominoType,
  TetrominoMovementDirection,
} from "../types/Tetromino";
import { initialiseTetrisScoreState, TetirsScoreState } from "./LevelScore";
import { millisecondsPerLine } from "./TetrisHelpers";
import { applyGhostY } from "./TetrisPhys";

type TetrisGameStatus =
  /// The game is currently being played.
  | "playing"
  /// The game is currently suspended by the system, usually while an animation is playing or level is being changed.
  | "suspended"
  /// The game is currently paused by the user.
  | "paused"
  /// The game is over.
  | "game-over";

export type TetrisGameState = {
  score: TetirsScoreState;

  gameStatus: TetrisGameStatus;
  gameBoardMatrix: TetroMatrix;
  dropTimeDelta: number;

  startTimeOnGround?: number;
  numOfMovesOnGround: number;

  currentTetromino?: TetrominoTypeAndPosition & {
    ghostY: number;
  };
  savedTetromino?: TetrominoType;
  upcomingTetrominos: TetrominoType[];

  fullLinesState?: {
    lines: number[];
    timestamp: number;
  };
};

type Action<T extends string, P = void> = P extends void
  ? { type: T }
  : { type: T } & P;

export type TetrisGameAction =
  | Action<"TICK">
  | Action<"MOVE", { direction: TetrominoMovementDirection; system: boolean }>
  | Action<"DROP">
  | Action<"ROTATE", { direction: TetrominoRotationDirection }>
  | Action<"HOLD_TETROMINO">
  | Action<"PAUSE_RESUME">;

export function initializeTetrisGameState(): TetrisGameState {
  const state: TetrisGameState = {
    score: initialiseTetrisScoreState(),

    dropTimeDelta: millisecondsPerLine(1),
    numOfMovesOnGround: 0,

    gameStatus: "playing",
    gameBoardMatrix: initTetroMatrix(10, 20),
    currentTetromino: {
      type: randomTetrominoType(),
      x: 4,
      y: 0,
      rotation: 0,
      ghostY: 0,
    },
    upcomingTetrominos: [
      randomTetrominoType(),
      randomTetrominoType(),
      randomTetrominoType(),
      randomTetrominoType(),
    ],
  };

  applyGhostY(state);

  return state;
}
