import { TetroMatrix } from "./TetroMatrix";
import {
  Bump,
  ITetroBumpCollection,
  OTetroBumpCollection,
  StandardBumpCollection,
  TetroBumpCollection,
} from "./TetroRotationBump";

export type TetrominoType = "I" | "J" | "L" | "O" | "S" | "T" | "Z";

export type TetrominoRotation = 0 | 1 | 2 | 3;
export type TetrominoMovementDirection = "left" | "right" | "down";
export type TetrominoRotationDirection = "left" | "right";

export type TetrominoColor =
  | "cyan"
  | "blue"
  | "orange"
  | "yellow"
  | "green"
  | "purple"
  | "red";

type TetrominoDefinition = {
  matrix: TetroMatrix;
  bumps: TetroBumpCollection;
};

export type TetrominoPosition = {
  x: number;
  y: number;
  rotation: TetrominoRotation;
};

export type TetrominoTypeAndPosition = TetrominoPosition & {
  type: TetrominoType;
};

/***
 * Tetrominos as defined by the Super Rotation System (SRS) standard
 */
// prettier-ignore
const TetrominoDefinitions: Record<TetrominoType, TetrominoDefinition> = {
  I: {
    matrix: {
      width: 4,
      height: 4,
      cells: [
        "clear", "clear", "clear", "clear",
        "cyan", "cyan", "cyan", "cyan",
        "clear", "clear", "clear", "clear",
        "clear", "clear", "clear", "clear"
      ],
    },
    bumps: ITetroBumpCollection,
  },
  J: {
    matrix: {
      width: 3,
      height: 3,
      cells: [
        "blue", "clear", "clear",
        "blue", "blue", "blue",
        "clear", "clear", "clear",
      ],
    },
    bumps: StandardBumpCollection,
  },
  L: {
    matrix: {
      width: 3,
      height: 3,
      cells: [
        "clear", "clear", "orange", 
        "orange", "orange", "orange",
        "clear", "clear", "clear",
      ],
    },
    bumps: StandardBumpCollection,
  },
  O: {
    matrix: {
      width: 2,
      height: 2,
      cells: ["yellow", "yellow", "yellow", "yellow"],
    },
    bumps: OTetroBumpCollection,
  },
  S: {
    matrix: {
      width: 3,
      height: 3,
      cells: [
        "clear", "green", "green",
        "green", "green", "clear",
        "clear", "clear", "clear",
      ],
    },
    bumps: StandardBumpCollection,
  },
  T: {
    matrix: {
      width: 3,
      height: 3,
      cells: [
        "purple", "purple", "purple",
        "clear", "purple", "clear",
        "clear", "clear", "clear",
      ],
    },
    bumps: StandardBumpCollection,
  },
  Z: {
    matrix: {
      width: 3,
      height: 3,
      cells: [
        "red", "red", "clear",
        "clear", "red", "red",
        "clear", "clear", "clear"
      ],
    },
    bumps: StandardBumpCollection,
  },
};

export function getTetrominoMatrix(type: TetrominoType): TetroMatrix {
  return TetrominoDefinitions[type].matrix;
}

export function getTetrominoBumps(
  type: TetrominoType,
  currentRotations: TetrominoRotation,
  direction: TetrominoRotationDirection,
): Bump[] {
  console.log(
    "type",
    type,
    "currentRotations",
    currentRotations,
    "direction",
    direction,
  );
  return TetrominoDefinitions[type].bumps[direction][currentRotations];
}

export function randomTetrominoType(): TetrominoType {
  return ["I", "J", "L", "O", "S", "T", "Z"][
    Math.floor(Math.random() * 7)
  ] as TetrominoType;
}

export function randomTetrominoColor(): TetrominoColor {
  return ["cyan", "blue", "orange", "yellow", "green", "purple", "red"][
    Math.floor(Math.random() * 7)
  ] as TetrominoColor;
}
