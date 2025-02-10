import { useReducer } from "react";
import useInterval from "./useInterval";
import useKeyEvents from "./useKeyEvents";
import { initializeTetrisGameState } from "../tetris/TetrisGameState";
import tetrisReducer from "../tetris/TetrisReducer";

export default function useTetrisGameState() {
  const [state, dispatch] = useReducer(
    tetrisReducer,
    initializeTetrisGameState(),
  );

  useKeyEvents(
    ["ArrowLeft", "ArrowRight", "ArrowDown", " ", "s", "p", "z", "x"],
    (event) => {
      switch (event.key) {
        case "ArrowLeft":
          dispatch({ type: "MOVE", direction: "left", system: false });
          break;
        case "ArrowRight":
          dispatch({ type: "MOVE", direction: "right", system: false });
          break;
        case "ArrowDown":
          dispatch({ type: "MOVE", direction: "down", system: false });
          break;
        case "z":
          dispatch({ type: "ROTATE", direction: "left" });
          break;
        case "x":
          dispatch({ type: "ROTATE", direction: "right" });
          break;
        case "s":
          dispatch({ type: "HOLD_TETROMINO" });
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

  useInterval(
    () => {
      dispatch({ type: "MOVE", direction: "down", system: true });
    },
    state.gameStatus === "playing" ? state.dropTimeDelta : undefined,
  );

  useInterval(
    () => {
      dispatch({ type: "TICK" });
    },
    state.gameStatus === "suspended" ? 100 : undefined,
  );

  return [state, dispatch] as const;
}
