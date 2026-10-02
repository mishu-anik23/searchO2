import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { LaunchTelemetry } from "@/game/launch/launchPhysics";

interface EnginePlumeProps {
  telemetry: LaunchTelemetry;
  stage: number;
  active: boolean;
}

/**
 * Staged ignition + altitude-dependent expansion.
 * Sea level: tighter plume. High altitude: wider expansion (lower ambient pressure).
 */
export function EnginePlume({ telemetry, stage, active }: EnginePlumeProps) {
  const core = useRef<THREE.Mesh>(null);
  const outer = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.PointLight>(null);

  const coreMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#e8f4ff",
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
      }),
    [],
  );
  const outerMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#7eb8c9",
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
      }),
    [],
  );

  useFrame(({ clock }) => {
    if (!active || telemetry.throttle < 0.02) {
      if (core.current) core.current.visible = false;
      if (outer.current) outer.current.visible = false;
      if (glow.current) glow.current.intensity = 0;
      return;
    }
    const t = clock.elapsedTime;
    const thr = telemetry.throttle * (0.85 + telemetry.ignitionProgress * 0.15);
    const exp = telemetry.plumeExpansion;
    const flicker = 0.92 + Math.sin(t * 28) * 0.08;

    if (core.current) {
      core.current.visible = true;
      const h = (stage === 1 ? 2.8 : 1.6) * thr * flicker;
      const r = 0.14 * thr;
      core.current.scale.set(r * 8, h, r * 8);
      core.current.position.y = -h * 0.5 - 0.4;
      (core.current.material as THREE.MeshBasicMaterial).opacity = 0.7 + thr * 0.25;
    }
    if (outer.current) {
      outer.current.visible = true;
      const h = (stage === 1 ? 3.6 : 2.2) * thr * flicker * (0.7 + exp * 0.2);
      const r = 0.22 * thr * exp;
      outer.current.scale.set(r * 8, h, r * 8);
      outer.current.position.y = -h * 0.45 - 0.5;
      (outer.current.material as THREE.MeshBasicMaterial).opacity = 0.25 + thr * 0.3;
    }
    if (glow.current) {
      glow.current.intensity = thr * 4 * (1.2 - telemetry.atmosphericFraction * 0.4);
      glow.current.distance = 12 + thr * 8;
    }
  });

  return (
    <group>
      <mesh ref={core} material={coreMat}>
        <coneGeometry args={[0.15, 1, 8]} />
      </mesh>
      <mesh ref={outer} material={outerMat}>
        <coneGeometry args={[0.25, 1, 8]} />
      </mesh>
      <pointLight ref={glow} color="#a8d4e8" intensity={0} distance={10} position={[0, -1.2, 0]} />
    </group>
  );
}
