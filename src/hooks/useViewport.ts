import { useSyncExternalStore } from "react";

function subscribeResize(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

// Snapshots must be primitives (or stable objects) for useSyncExternalStore,
// so width and height are read separately.
const getWidth = () => window.innerWidth;
const getHeight = () => window.innerHeight;

/** The window's inner size in CSS pixels, updated on resize. */
export function useWindowSize() {
  const width = useSyncExternalStore(subscribeResize, getWidth);
  const height = useSyncExternalStore(subscribeResize, getHeight);
  return { width, height };
}

/**
 * Phones, small windows and touch-first devices get the compact layout with
 * on-screen controls instead of the keyboard-driven desktop layout.
 */
export function useIsCompactLayout() {
  const narrow = useMediaQuery("(max-width: 767px)");
  const touch = useMediaQuery("(pointer: coarse)");
  return narrow || touch;
}

/** Whether a CSS media query currently matches, updated live. */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
  );
}
