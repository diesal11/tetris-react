import {
  FontData,
  PerspectiveCamera,
  Text3D,
  useFont,
  View,
} from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Suspense, useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";
import helvetikerBoldJson from "../../assets/fonts/helvetiker_bold.typeface.json";

const CAMERA_FOV = 30;
const CAMERA_DISTANCE = 10;
const VISIBLE_HEIGHT =
  2 * CAMERA_DISTANCE * Math.tan(((CAMERA_FOV / 2) * Math.PI) / 180);

// Same red-500 → violet-500 gradient as the old CSS title.
const GRADIENT_START = new THREE.Color("#ef4444");
const GRADIENT_END = new THREE.Color("#8b5cf6");

// Vendored from the three.js examples (licence alongside the font file). The
// inferred JSON type is far more specific than drei's FontData.
const titleFont = helvetikerBoldJson as unknown as FontData;

// Text3D suspends while the font is parsed; start that before first render.
useFont.preload(titleFont);

/**
 * The page title as extruded 3D text that slowly sways. Like Board3D it is a
 * drei <View> drawn by the shared <SceneCanvas>; a visually hidden <h1> keeps
 * the title available to screen readers.
 */
export default function Title3D(props: {
  text: string;
  widthPx?: number;
  heightPx?: number;
}) {
  const { text, widthPx = 720, heightPx = 96 } = props;

  return (
    <>
      <h1 className="sr-only">{text}</h1>
      <View
        className="self-center"
        style={{ width: widthPx, height: heightPx }}
      >
        <TitleScene text={text} aspect={widthPx / heightPx} />
      </View>
    </>
  );
}

function TitleScene(props: { text: string; aspect: number }) {
  const { text, aspect } = props;
  const groupRef = useRef<THREE.Group>(null);
  const [reduceMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useFrame((state) => {
    const group = groupRef.current;
    if (!group || reduceMotion) {
      return;
    }

    const t = state.clock.elapsedTime;
    group.rotation.y = Math.sin(t * 0.5) * 0.25;
    group.rotation.x = Math.sin(t * 0.35) * 0.08;
    state.invalidate();
  });

  return (
    <>
      <PerspectiveCamera
        makeDefault
        manual
        fov={CAMERA_FOV}
        aspect={aspect}
        near={0.1}
        far={CAMERA_DISTANCE * 4}
        position={[0, 0, CAMERA_DISTANCE]}
      />

      <ambientLight intensity={0.8} />
      <directionalLight position={[-4, 6, 10]} intensity={2.4} />

      <group ref={groupRef}>
        <Suspense fallback={null}>
          <TitleText text={text} aspect={aspect} />
        </Suspense>
      </group>
    </>
  );
}

function TitleText(props: { text: string; aspect: number }) {
  const { text, aspect } = props;
  const invalidate = useThree((state) => state.invalidate);
  const meshRef = useRef<THREE.Mesh>(null);

  // Text3D rebuilds its geometry when the text changes: centre it, paint the
  // gradient into vertex colours and scale it to fit the view.
  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) {
      return;
    }

    const geometry = mesh.geometry;
    geometry.center();
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    const textWidth = box.max.x - box.min.x;
    const textHeight = box.max.y - box.min.y;

    const positions = geometry.getAttribute("position");
    const colors = new Float32Array(positions.count * 3);
    const color = new THREE.Color();
    for (let i = 0; i < positions.count; i++) {
      const t = (positions.getX(i) - box.min.x) / textWidth;
      color.lerpColors(GRADIENT_START, GRADIENT_END, t);
      color.toArray(colors, i * 3);
    }
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Leave headroom so the swaying text never clips the edges of the view.
    const visibleWidth = VISIBLE_HEIGHT * aspect;
    mesh.scale.setScalar(
      Math.min(
        (visibleWidth * 0.7) / textWidth,
        (VISIBLE_HEIGHT * 0.6) / textHeight,
      ),
    );
    invalidate();
  }, [text, aspect, invalidate]);

  return (
    <Text3D
      ref={meshRef}
      font={titleFont}
      size={1}
      height={0.25}
      curveSegments={8}
      bevelEnabled
      bevelThickness={0.04}
      bevelSize={0.03}
      bevelSegments={3}
    >
      {text}
      <meshStandardMaterial vertexColors roughness={0.3} metalness={0.2} />
    </Text3D>
  );
}
