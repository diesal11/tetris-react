import { TetroMatrix } from "./TetroMatrix";

export type TetrominoType = "I" | "J" | "L" | "O" | "S" | "T" | "Z";
export type TetrominoRotation = 0 | 1 | 2 | 3;

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
  color: TetrominoColor;
};

export type TetrominoPosition = {
  x: number;
  y: number;
  rotation: TetrominoRotation;
};

export type TetrominoTypeAndPosition = TetrominoPosition & {
  type: TetrominoType;
};

export const TetrominoDefinitions: Record<TetrominoType, TetrominoDefinition> =
  {
    I: {
      color: "cyan",
      matrix: {
        width: 1,
        height: 4,
        cells: ["cyan", "cyan", "cyan", "cyan"],
      },
    },
    J: {
      color: "blue",
      matrix: {
        width: 2,
        height: 3,
        cells: ["clear", "blue", "clear", "blue", "blue", "blue"],
      },
    },
    L: {
      color: "orange",
      matrix: {
        width: 2,
        height: 3,
        cells: ["orange", "clear", "orange", "clear", "orange", "orange"],
      },
    },
    O: {
      color: "yellow",
      matrix: {
        width: 2,
        height: 2,
        cells: ["yellow", "yellow", "yellow", "yellow"],
      },
    },
    S: {
      color: "green",
      matrix: {
        width: 3,
        height: 2,
        cells: ["clear", "green", "green", "green", "green", "clear"],
      },
    },
    T: {
      color: "purple",
      matrix: {
        width: 3,
        height: 2,
        cells: ["purple", "purple", "purple", "clear", "purple", "clear"],
      },
    },
    Z: {
      color: "red",
      matrix: {
        width: 3,
        height: 2,
        cells: ["red", "red", "clear", "clear", "red", "red"],
      },
    },
  };

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
