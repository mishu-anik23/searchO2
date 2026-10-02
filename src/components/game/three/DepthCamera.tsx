import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GALAXIES } from "@/game/cosmos";

export type CameraZone = "surface" | "orbital" | "deep";

// Start deep-space viewing on the most recognizable deep-sky target. Keeping
// this aligned to the catalog direction makes the first pull-back rewarding.
const andromeda = GALAXIES.find((object) => object.id === "andromeda")?.dir ?? { x: 0, y: 0, z: -1 };
const DEEP_SPACE_POSITION = new THREE.Vector3(andromeda.x * 850, andromeda.y * 850, andromeda.z * 850);

interface DepthCameraProps {
  zoom: number; // 0 = surface, 1 = deep space
  reduced?: boolean;
  enabled?: boolean;
}

/** Camera controller that smoothly transitions between surface, orbital, and deep-space zones.
 *  Zoom is driven by scroll wheel input (captured via event listener). */
export function DepthCamera({ zoom, reduced = false, enabled = true }: DepthCameraProps) {
  const camRef = useRef<THREE.PerspectiveCamera>(null);
  const targetZoom = useRef(zoom);
  const currentZoom = useRef(zoom);

  // Smooth interpolation target
  targetZoom.current = zoom;

  useFrame((state, dt) => {
    if (!enabled) return;
    const cam = camRef.current || (state.camera as THREE.PerspectiveCamera);
    if (!cam) return;

    // Smooth lerp toward target zoom
    const lerpSpeed = reduced ? 1 : 3;
    currentZoom.current += (targetZoom.current - currentZoom.current) * Math.min(1, dt * lerpSpeed);

    const z = currentZoom.current;

    // Zone boundaries: 0–0.35 surface, 0.35–0.7 orbital, 0.7–1 deep
    // Camera position interpolated through keyframes
    const surfacePos = new THREE.Vector3(0, 1.8, 6.5);
    // Keep the Sun (radius 20 scene units) comfortably framed in the orbital view.
    const orbitalPos = new THREE.Vector3(0, 40, 160);
    const deepPos = DEEP_SPACE_POSITION;

    let targetPos: THREE.Vector3;
    if (z < 0.35) {
      // Surface → Orbital
      const t = z / 0.35;
      targetPos = surfacePos.clone().lerp(orbitalPos, t * t);
    } else if (z < 0.7) {
      // Orbital → Deep
      const t = (z - 0.35) / 0.35;
      targetPos = orbitalPos.clone().lerp(deepPos, t * t);
    } else {
      // Deep space — keep pulling back slightly
      const t = (z - 0.7) / 0.3;
      targetPos = deepPos.clone().multiplyScalar(1 + t * 0.15);
    }

    cam.position.lerp(targetPos, reduced ? 1 : 0.04);

    // Look at origin (Moon/scene center) at all times
    const lookY = z < 0.35 ? 0 : z < 0.7 ? 0 : 0;
    cam.lookAt(0, lookY, 0);

    // Adjust FOV for depth perception
    const targetFov = z < 0.35 ? 42 : z < 0.7 ? 50 : 65;
    if (cam.fov !== targetFov) {
      cam.fov += (targetFov - cam.fov) * 0.05;
      cam.updateProjectionMatrix();
    }
  });

  return null;
}

/** Scroll-to-zoom hook for the Canvas container. */
export function useScrollZoom(
  onZoom: (delta: number) => void,
  enabled: boolean,
) {
  const handler = useMemo(() => {
    return (e: WheelEvent) => {
      if (!enabled) return;
      e.preventDefault();
      const delta = -e.deltaY * 0.0008;
      onZoom(delta);
    };
  }, [onZoom, enabled]);

  // Attach to window — the component using this should ensure pointer events
  useMemo(() => {
    if (typeof window === "undefined") return;
    window.addEventListener("wheel", handler, { passive: false });
    return () => window.removeEventListener("wheel", handler);
  }, [handler]);
}
