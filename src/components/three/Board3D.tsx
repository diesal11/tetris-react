import { PerspectiveCamera, View } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { BoardCell, BoardView } from "../../tetris/boardView";
import {
  backplateMaterial,
  cubeGeometry,
  flashMaterial,
  ghostMaterial,
  gridMaterial,
  solidMaterial,
  tetrominoColors,
} from "./materials";

/** Extra space around the board, in cells, so the bevels and tilt fit. */
const BOARD_MARGIN = 0.8;
const CAMERA_FOV = 30;

type Board3DProps = {
  view: BoardView;
  /** On-screen size of one cell in CSS pixels. */
  cellPx?: number;
  /** Pulse the cells on completed lines. */
  flashing?: boolean;
  /**
   * Fixed size in cells for the view, camera and instance capacity. Defaults
   * to the view's own size; set it when the view's size varies (e.g. trimmed
   * preview pieces) so the box stays put and the cells are centred in it.
   */
  frame?: { width: number; height: number };
  /** Draw the dark backplate and grid behind the cells. */
  showBackplate?: boolean;
};

/**
 * A board drawn as lit 3D cubes. Renders a DOM placeholder that the shared
 * <SceneCanvas> draws into, so it can sit in normal Tailwind layout.
 */
export default function Board3D({
  view,
  cellPx = 28,
  flashing = false,
  frame = view,
  showBackplate = true,
}: Board3DProps) {
  const widthPx = (frame.width + BOARD_MARGIN) * cellPx;
  const heightPx = (frame.height + BOARD_MARGIN) * cellPx;

  return (
    <View style={{ width: widthPx, height: heightPx }}>
      <BoardScene
        view={view}
        frame={frame}
        aspect={widthPx / heightPx}
        flashing={flashing}
        showBackplate={showBackplate}
      />
    </View>
  );
}

function BoardScene(props: {
  view: BoardView;
  frame: { width: number; height: number };
  aspect: number;
  flashing: boolean;
  showBackplate: boolean;
}) {
  const { view, frame, aspect, flashing, showBackplate } = props;
  // Cells are centred using the view's own size; the frame sets the camera
  // and capacity, so a smaller view sits in the middle of the frame.
  const { width, height } = view;
  const capacity = frame.width * frame.height;

  const invalidate = useThree((state) => state.invalidate);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const solidRef = useRef<THREE.InstancedMesh>(null);
  const ghostRef = useRef<THREE.InstancedMesh>(null);
  const flashRef = useRef<THREE.InstancedMesh>(null);

  // Frame the whole board, looking up at it slightly from below.
  const halfHeight = (frame.height + BOARD_MARGIN) / 2;
  const distance =
    (halfHeight * 1.04) / Math.tan(((CAMERA_FOV / 2) * Math.PI) / 180);
  const cameraY = -frame.height * 0.12;

  useLayoutEffect(() => {
    const camera = cameraRef.current;
    if (!camera) {
      return;
    }
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    invalidate();
  }, [aspect, distance, cameraY, invalidate]);

  useLayoutEffect(() => {
    const solid: BoardCell[] = [];
    const ghost: BoardCell[] = [];
    const flash: BoardCell[] = [];
    for (const cell of view.cells) {
      if (cell.ghost) {
        ghost.push(cell);
      } else if (cell.fullLine) {
        flash.push(cell);
      } else {
        solid.push(cell);
      }
    }

    fillInstances(solidRef.current, solid, width, height);
    fillInstances(ghostRef.current, ghost, width, height);
    fillInstances(flashRef.current, flash, width, height);
    invalidate();
  }, [view, width, height, invalidate]);

  // Start the render loop when a flash begins; useFrame keeps it going.
  useEffect(() => {
    if (flashing) {
      invalidate();
    }
  }, [flashing, invalidate]);

  useFrame((state) => {
    if (!flashing) {
      return;
    }
    flashMaterial.emissiveIntensity =
      0.3 + 0.7 * Math.abs(Math.sin(state.clock.elapsedTime * 20));
    state.invalidate();
  });

  return (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        manual
        fov={CAMERA_FOV}
        aspect={aspect}
        near={0.1}
        far={distance * 4}
        position={[0, cameraY, distance]}
      />

      <ambientLight intensity={0.9} />
      <directionalLight position={[-4, 6, 10]} intensity={2.2} />

      {showBackplate && (
        <>
          <mesh
            position={[0, 0, -0.55]}
            material={backplateMaterial}
            dispose={null}
          >
            <planeGeometry args={[width + 0.2, height + 0.2]} />
          </mesh>
          <lineSegments
            position={[0, 0, -0.5]}
            geometry={getGridGeometry(width, height)}
            material={gridMaterial}
            dispose={null}
          />
        </>
      )}

      <instancedMesh
        ref={solidRef}
        args={[cubeGeometry, solidMaterial, capacity]}
        dispose={null}
      />
      <instancedMesh
        ref={flashRef}
        args={[cubeGeometry, flashMaterial, capacity]}
        dispose={null}
      />
      <instancedMesh
        ref={ghostRef}
        args={[cubeGeometry, ghostMaterial, capacity]}
        renderOrder={1}
        dispose={null}
      />
    </>
  );
}

const dummy = new THREE.Object3D();

/** Board cell (y = 0 at the top) → world position centred on the origin. */
function fillInstances(
  mesh: THREE.InstancedMesh | null,
  cells: BoardCell[],
  width: number,
  height: number,
) {
  if (!mesh) {
    return;
  }

  cells.forEach((cell, i) => {
    dummy.position.set(cell.x - (width - 1) / 2, (height - 1) / 2 - cell.y, 0);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    mesh.setColorAt(i, tetrominoColors[cell.color]);
  });

  // setColorAt creates the instance colour buffer lazily; make sure it exists
  // even for an empty board so the shader program doesn't change later.
  if (!mesh.instanceColor) {
    mesh.setColorAt(0, tetrominoColors.cyan);
  }

  mesh.count = cells.length;
  mesh.instanceMatrix.needsUpdate = true;
  mesh.instanceColor!.needsUpdate = true;
}

// Only a couple of board sizes exist, so grid geometry is cached per size for
// the lifetime of the app and shared between boards.
const gridGeometryCache = new Map<string, THREE.BufferGeometry>();

/** Faint lines between cells, drawn just in front of the backplate. */
function getGridGeometry(width: number, height: number) {
  const key = `${width}x${height}`;
  const cached = gridGeometryCache.get(key);
  if (cached) {
    return cached;
  }

  const points: number[] = [];
  const left = -width / 2;
  const top = height / 2;

  for (let x = 0; x <= width; x++) {
    points.push(left + x, top, 0, left + x, -top, 0);
  }
  for (let y = 0; y <= height; y++) {
    points.push(left, top - y, 0, -left, top - y, 0);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(points, 3),
  );
  gridGeometryCache.set(key, geometry);
  return geometry;
}
