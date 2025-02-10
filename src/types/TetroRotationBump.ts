/**
 * When a tetro is rotated, it may bump into the wall or other tetro.
 * This enum represents the possible bumping directions that are attempted
 * to resolve the bump.
 *
 * All tetros except the I tetro have 4 possible bumping directions.
 * The I tetro has only 2 possible bumping directions.
 */

import { TetrominoRotation } from "./Tetromino";

export type Bump = [x: number, y: number];

export type RotationBumpList = {
  [rot in TetrominoRotation]: Bump[];
};

export type TetroBumpCollection = {
  left: RotationBumpList;
  right: RotationBumpList;
};

const StandardBumpsLeft: RotationBumpList = [
  [
    [0, 0],
    [1, 0],
    [1, -1],
    [0, 2],
    [1, 2],
  ],
  [
    [0, 0],
    [-1, 0],
    [-1, 1],
    [0, -2],
    [-1, -2],
  ],
  [
    [0, 0],
    [-1, 0],
    [-1, -1],
    [0, 2],
    [-1, 2],
  ],
  [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, -2],
    [1, -2],
  ],
];

const StandardBumpsRight: RotationBumpList = [
  [
    [0, 0],
    [-1, 0],
    [-1, -1],
    [0, 2],
    [-1, 2],
  ],
  [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, -2],
    [1, -2],
  ],
  [
    [0, 0],
    [1, 0],
    [1, -1],
    [0, 2],
    [1, 2],
  ],
  [
    [0, 0],
    [-1, 0],
    [-1, 1],
    [0, -2],
    [-1, -2],
  ],
];

const ITetroBumpsLeft: RotationBumpList = [
  [
    [0, 0],
    [-1, 0],
    [2, 0],
    [-1, -2],
    [2, 1],
  ],
  [
    [0, 0],
    [-2, 0],
    [1, 0],
    [-2, 1],
    [1, -2],
  ],
  [
    [0, 0],
    [1, 0],
    [-2, 0],
    [1, 2],
    [-2, -1],
  ],
  [
    [0, 0],
    [2, 0],
    [-1, 0],
    [2, -1],
    [-1, 2],
  ],
];

const ITetroBumpsRight: RotationBumpList = [
  [
    [0, 0],
    [-2, 0],
    [1, 0],
    [-2, 1],
    [1, -2],
  ],
  [
    [0, 0],
    [-1, 0],
    [2, 0],
    [-1, -2],
    [2, 1],
  ],
  [
    [0, 0],
    [2, 0],
    [-1, 0],
    [2, -1],
    [-1, 2],
  ],
  [
    [0, 0],
    [1, 0],
    [-2, 0],
    [1, 2],
    [-2, -1],
  ],
];

const OTetroBumps: RotationBumpList = [[[0, 0]], [[0, 0]], [[0, 0]], [[0, 0]]];

export const StandardBumpCollection: TetroBumpCollection = {
  left: StandardBumpsLeft,
  right: StandardBumpsRight,
};

export const ITetroBumpCollection: TetroBumpCollection = {
  left: ITetroBumpsLeft,
  right: ITetroBumpsRight,
};

export const OTetroBumpCollection: TetroBumpCollection = {
  left: OTetroBumps,
  right: OTetroBumps,
};
