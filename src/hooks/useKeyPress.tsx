import { useEffect, useRef } from "react";

const useKeyPress = (
  keys: string[],
  handler: (event: KeyboardEvent) => void,
  repeatDelay = 0,
) => {
  const eventListenerRef = useRef<(ev: KeyboardEvent) => void>();
  const repeatTimeoutRef = useRef<{ timestamp: number; key: string }>();

  useEffect(() => {
    eventListenerRef.current = (event) => {
      if (keys.includes(event.key)) {
        if (repeatDelay) {
          if (repeatTimeoutRef.current?.key === event.key) {
            if (
              event.timeStamp - repeatTimeoutRef.current.timestamp <
              repeatDelay
            ) {
              return;
            }
          }
          repeatTimeoutRef.current = {
            timestamp: event.timeStamp,
            key: event.key,
          };
        }

        handler?.(event);
      }
    };
  }, [keys, handler, repeatDelay]);

  useEffect(() => {
    const eventListener = (event: KeyboardEvent) => {
      eventListenerRef.current?.(event);
    };

    window.addEventListener("keydown", eventListener);
    return () => {
      window.removeEventListener("keydown", eventListener);
    };
  }, [repeatDelay]);
};

export default useKeyPress;
