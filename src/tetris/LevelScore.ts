import { TetrisGameState } from "./TetrisGameState";
import { millisecondsPerLine } from "./TetrisHelpers";

export type TetirsScoreState = {
  score: number;
  level: number;
  totalLinesCleared: number;
};

export function initialiseTetrisScoreState(): TetirsScoreState {
  return {
    score: 0,
    level: 1,
    totalLinesCleared: 0,
  };
}

export function checkLevel(state: TetrisGameState) {
  if (
    state.score.level < 15 &&
    state.score.totalLinesCleared >= state.score.level * 10
  ) {
    state.score.level++;
    state.dropTimeDelta = millisecondsPerLine(state.score.level);
  }
}

export function handleSoftDropScore(state: TetrisGameState) {
  state.score.score += state.score.level;
}

export function handleHardDropScore(state: TetrisGameState, numLines: number) {
  state.score.score += 2 * numLines * state.score.level;
}

export function handleLineClearScore(state: TetrisGameState, numLines: number) {
  switch (numLines) {
    case 1:
      state.score.score += 100 * state.score.level;
      break;
    case 2:
      state.score.score += 300 * state.score.level;
      break;
    case 3:
      state.score.score += 500 * state.score.level;
      break;
    case 4:
      state.score.score += 800 * state.score.level;
      break;
  }
}
