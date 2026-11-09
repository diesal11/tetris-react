import { View } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

/**
 * The single WebGL canvas shared by every <Board3D>. It covers the viewport
 * behind the UI and each board's <View> draws into its own screen rectangle.
 */
export default function SceneCanvas(props: { dimmed?: boolean }) {
  return (
    <div
      className={`pointer-events-none fixed inset-0 ${props.dimmed ? "opacity-50" : ""}`}
    >
      <Canvas
        // Fiber sets pointer-events: auto on its own container, which would
        // swallow taps on the UI (e.g. the touch controls) under this overlay.
        style={{ pointerEvents: "none" }}
        frameloop="demand"
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <View.Port />
      </Canvas>
    </div>
  );
}
