import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { TetrominoColor } from "../../types/Tetromino";

// Shared, module-level GPU resources. Every board instances the same geometry
// and materials, so meshes must use `dispose={null}` to keep them alive.

export const cubeGeometry = new RoundedBoxGeometry(0.92, 0.92, 0.92, 3, 0.1);

/** Tailwind -500 shades, matching the original DOM renderer. */
export const tetrominoColors: Record<TetrominoColor, THREE.Color> = {
  cyan: new THREE.Color("#06b6d4"),
  blue: new THREE.Color("#3b82f6"),
  orange: new THREE.Color("#f97316"),
  yellow: new THREE.Color("#eab308"),
  green: new THREE.Color("#22c55e"),
  purple: new THREE.Color("#a855f7"),
  red: new THREE.Color("#ef4444"),
};

// Instance colours multiply the white base colour.
export const solidMaterial = new THREE.MeshStandardMaterial({
  color: "white",
  roughness: 0.35,
  metalness: 0.1,
});

export const ghostMaterial = new THREE.MeshStandardMaterial({
  color: "white",
  roughness: 0.35,
  metalness: 0.1,
  transparent: true,
  opacity: 0.3,
  depthWrite: false,
});

/** Used for cells on a completed line; emissiveIntensity is animated. */
export const flashMaterial = new THREE.MeshStandardMaterial({
  color: "white",
  roughness: 0.35,
  metalness: 0.1,
  emissive: "white",
  emissiveIntensity: 0.5,
});

export const backplateMaterial = new THREE.MeshStandardMaterial({
  color: "#0f172a",
  roughness: 0.9,
});

export const gridMaterial = new THREE.LineBasicMaterial({
  color: "#334155",
  transparent: true,
  opacity: 0.6,
});
