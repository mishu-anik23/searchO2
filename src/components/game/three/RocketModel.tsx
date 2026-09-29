import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { RocketId } from "@/game/data";
import type { LaunchTelemetry } from "@/game/launch/launchPhysics";

interface RocketModelProps {
  rocket: RocketId;
  telemetry: LaunchTelemetry;
  stageSeparated: boolean;
  reduced: boolean;
}

export function RocketModel({ rocket, telemetry, stageSeparated, reduced }: RocketModelProps) {
  const group = useRef<THREE.Group>(null);
  const booster = useRef<THREE.Group>(null);
  const crew = rocket === "crewmark";

  const bodyMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#c5ced9",
        metalness: 0.55,
        roughness: 0.35,
      }),
    [],
  );
  const darkMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#2a3344", metalness: 0.4, roughness: 0.5 }),
    [],
  );
  const accentMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#7eb8c9", metalness: 0.3, roughness: 0.4 }),
    [],
  );
  const whiteMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#e8edf4", metalness: 0.2, roughness: 0.45 }),
    [],
  );

  useFrame(() => {
    if (!group.current) return;
    const pitch = ((90 - telemetry.pitchDeg) * Math.PI) / 180;
    group.current.rotation.z = -pitch * 0.85;
  });

  const sepOffset = stageSeparated ? telemetry.missionTime * 0.15 : 0;

  return (
    <group ref={group}>
      {/* Stage 2 / upper */}
      <group position={[0, stageSeparated ? 0 : 0, 0]}>
        {crew ? (
          <>
            {/* Capsule */}
            <mesh position={[0, 11.2, 0]} material={whiteMat}>
              <cylinderGeometry args={[0.5, 0.55, 1.6, 12]} />
            </mesh>
            <mesh position={[0, 12.1, 0]} material={whiteMat}>
              <sphereGeometry args={[0.5, 10, 8]} />
            </mesh>
            {/* Windows */}
            <mesh position={[0.35, 11.4, 0.4]} material={darkMat}>
              <boxGeometry args={[0.18, 0.22, 0.08]} />
            </mesh>
            <mesh position={[-0.35, 11.4, 0.4]} material={darkMat}>
              <boxGeometry args={[0.18, 0.22, 0.08]} />
            </mesh>
            {/* Abort tower */}
            <mesh position={[0, 12.8, 0]} material={new THREE.MeshStandardMaterial({ color: "#c97a6a" })}>
              <cylinderGeometry args={[0.08, 0.12, 1.4, 6]} />
            </mesh>
            <mesh position={[0, 13.55, 0]} material={new THREE.MeshStandardMaterial({ color: "#c97a6a" })}>
              <coneGeometry args={[0.22, 0.45, 6]} />
            </mesh>
          </>
        ) : (
          <>
            {/* Fairing */}
            <mesh position={[0, 11.5, 0]} material={whiteMat}>
              <coneGeometry args={[0.7, 2.2, 10]} />
            </mesh>
            <mesh position={[0, 10.2, 0]} material={whiteMat}>
              <cylinderGeometry args={[0.7, 0.7, 1.2, 12]} />
            </mesh>
          </>
        )}
        {/* Upper stage body */}
        <mesh position={[0, 8.2, 0]} material={bodyMat}>
          <cylinderGeometry args={[0.68, 0.72, 3.2, 14]} />
        </mesh>
        <mesh position={[0, 6.6, 0]} material={accentMat}>
          <cylinderGeometry args={[0.72, 0.72, 0.15, 14]} />
        </mesh>
        {/* Upper engine */}
        <mesh position={[0, 6.35, 0]} material={darkMat}>
          <cylinderGeometry args={[0.2, 0.28, 0.45, 8]} />
        </mesh>
      </group>

      {/* Stage 1 booster */}
      <group
        ref={booster}
        position={stageSeparated ? [0.4 + sepOffset * 0.3, -sepOffset * 0.5, 0] : [0, 0, 0]}
        visible={!stageSeparated || telemetry.altitudeM < 80000}
      >
        <mesh position={[0, 3.2, 0]} material={bodyMat}>
          <cylinderGeometry args={[0.72, 0.78, 6.2, 14]} />
        </mesh>
        {/* Interstage ring */}
        <mesh position={[0, 6.35, 0]} material={darkMat}>
          <cylinderGeometry args={[0.78, 0.78, 0.2, 14]} />
        </mesh>
        {/* LOX frost band */}
        <mesh position={[0, 4.5, 0]} material={new THREE.MeshStandardMaterial({ color: "#d8e4f0", roughness: 0.8 })}>
          <cylinderGeometry args={[0.735, 0.735, 1.4, 14]} />
        </mesh>
        {/* Markings */}
        <mesh position={[0, 2.0, 0]} material={accentMat}>
          <cylinderGeometry args={[0.79, 0.79, 0.12, 14]} />
        </mesh>
        {/* Fins */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.85, 0.4, 0]} rotation={[0, 0, s * 0.15]} material={darkMat}>
            <boxGeometry args={[0.5, 1.2, 0.06]} />
          </mesh>
        ))}
        {/* Engine section */}
        <mesh position={[0, 0.15, 0]} material={darkMat}>
          <cylinderGeometry args={[0.78, 0.7, 0.5, 12]} />
        </mesh>
        {/* Nozzles */}
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2;
          const r = i === 0 ? 0 : 0.28;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * r, -0.35, Math.sin(a) * r]}
              material={darkMat}
            >
              <cylinderGeometry args={[0.12, 0.18, 0.55, 8]} />
            </mesh>
          );
        })}
      </group>

      {/* Nav lights */}
      {!reduced && telemetry.altitudeM < 5000 && (
        <>
          <pointLight position={[0.8, 5, 0]} color="#ff4444" intensity={0.4} distance={4} />
          <pointLight position={[-0.8, 5, 0]} color="#44ff66" intensity={0.35} distance={4} />
        </>
      )}
    </group>
  );
}
