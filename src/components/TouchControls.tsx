import { useEffect, useRef } from "react";
import { TetrisGameAction } from "../tetris/TetrisGameState";

/** Delay before a held move button starts repeating, then the repeat rate. */
const REPEAT_DELAY_MS = 170;
const REPEAT_INTERVAL_MS = 60;

/**
 * On-screen buttons for touch devices. Movement repeats while held, like a
 * held arrow key; everything else fires once per press.
 */
export default function TouchControls(props: {
  dispatch: (action: TetrisGameAction) => void;
}) {
  const { dispatch } = props;

  return (
    <div className="grid w-full max-w-sm select-none grid-cols-4 gap-2">
      <ControlButton
        label="Hold"
        ariaLabel="Hold piece"
        onPress={() => dispatch({ type: "HOLD_TETROMINO" })}
      />
      <ControlButton
        label="⟲"
        ariaLabel="Rotate left"
        onPress={() => dispatch({ type: "ROTATE", direction: "left" })}
      />
      <ControlButton
        label="⟳"
        ariaLabel="Rotate right"
        onPress={() => dispatch({ type: "ROTATE", direction: "right" })}
      />
      <ControlButton
        label="❚❚"
        ariaLabel="Pause or resume"
        onPress={() => dispatch({ type: "PAUSE_RESUME" })}
      />
      <ControlButton
        label="◀"
        ariaLabel="Move left"
        repeat
        onPress={() =>
          dispatch({ type: "MOVE", direction: "left", system: false })
        }
      />
      <ControlButton
        label="▼"
        ariaLabel="Soft drop"
        repeat
        onPress={() =>
          dispatch({ type: "MOVE", direction: "down", system: false })
        }
      />
      <ControlButton
        label="▶"
        ariaLabel="Move right"
        repeat
        onPress={() =>
          dispatch({ type: "MOVE", direction: "right", system: false })
        }
      />
      <ControlButton
        label="⤓"
        ariaLabel="Hard drop"
        onPress={() => dispatch({ type: "DROP" })}
      />
    </div>
  );
}

function ControlButton(props: {
  label: string;
  ariaLabel: string;
  onPress: () => void;
  repeat?: boolean;
}) {
  const { label, ariaLabel, onPress, repeat = false } = props;
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function stopRepeat() {
    clearTimeout(timerRef.current);
    timerRef.current = undefined;
  }

  function scheduleRepeat(delay: number) {
    timerRef.current = setTimeout(() => {
      onPress();
      scheduleRepeat(REPEAT_INTERVAL_MS);
    }, delay);
  }

  // Never leave a repeat running after the button goes away.
  useEffect(() => stopRepeat, []);

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className="h-14 touch-manipulation rounded-xl bg-slate-300 text-xl font-bold text-slate-800 shadow active:bg-slate-400"
      onPointerDown={(event) => {
        // Keep focus/selection and the synthetic click out of the way, and
        // keep receiving pointer events if the finger slides off the button.
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        stopRepeat();
        onPress();
        if (repeat) {
          scheduleRepeat(REPEAT_DELAY_MS);
        }
      }}
      onPointerUp={stopRepeat}
      onPointerCancel={stopRepeat}
      onLostPointerCapture={stopRepeat}
      onContextMenu={(event) => event.preventDefault()}
    >
      {label}
    </button>
  );
}
