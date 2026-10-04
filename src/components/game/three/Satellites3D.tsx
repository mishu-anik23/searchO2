
import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { posOf } from "@/game/cosmos";
import {
  AGENCY_STYLE,
  PUBLIC_SATELLITES,
  REGIME_STYLE,
  satWorldPos,
  type SatelliteEntry,
} from "@/game/satellites";
import { useGame } from "@/game/store";

/** 3D public satellites around Earth / Mars for cockpit deep view. */
export function Satellites3D({ simT = 0 }: { simT?: number }) {
  const cache = useMemo(() => new Map<string, { x: number; y: number; z: number }>(), []);
  const earth = posOf("earth", simT, cache as Map<string, { x: number; y: number; z: number }>);
  const mars = posOf("mars", simT, cache as Map<string, { x: number; y: number; z: number }>);

  return (
    <group>
      {PUBLIC_SATELLITES.map((sat) => {
        const parent = sat.parent === "mars" ? mars : earth;
        const parentR = sat.parent === "mars" ? 4.6 : 6.4;
        const p = satWorldPos(sat, parent, parentR, simT);
        return <SatelliteMesh key={sat.id} sat={sat} position={[p.x, p.y, p.z]} />;
      })}
    </group>
  );
}

function SatelliteMesh({
  sat,
  position,
}: {
  sat: SatelliteEntry;
  position: [number, number, number];
}) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const openLibrary = useGame((s) => s.openLibrary);
  const ag = AGENCY_STYLE[sat.agency];
  const rg = REGIME_STYLE[sat.regime];

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.4;
  });

  return (
    <group position={position}>
      <group
        ref={ref}
        scale={sat.craftType === "station" ? 0.55 : 0.35}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "help";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (sat.libraryId) openLibrary(sat.libraryId);
        }}
      >
        {/* solar arrays */}
        {sat.hasSolarArrays && (
          <>
            <mesh position={[-1.4, 0, 0]}>
              <boxGeometry args={[1.6, 0.06, 0.7]} />
              <meshStandardMaterial color={sat.arrayColor} metalness={0.4} roughness={0.35} emissive={sat.arrayColor} emissiveIntensity={0.15} />
            </mesh>
            <mesh position={[1.4, 0, 0]}>
              <boxGeometry args={[1.6, 0.06, 0.7]} />
              <meshStandardMaterial color={sat.arrayColor} metalness={0.4} roughness={0.35} emissive={sat.arrayColor} emissiveIntensity={0.15} />
            </mesh>
          </>
        )}
        {/* bus */}
        <mesh>
          <boxGeometry args={sat.craftType === "station" ? [1.2, 0.5, 0.5] : [0.7, 0.55, 0.55]} />
          <meshStandardMaterial color={sat.bodyColor} metalness={0.55} roughness={0.35} />
        </mesh>
        {sat.craftType === "telescope" && (
          <mesh position={[0.35, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.22, 0.28, 0.5, 12]} />
            <meshStandardMaterial color="#7eb8c9" metalness={0.3} roughness={0.4} />
          </mesh>
        )}
        {/* regime glow */}
        <mesh scale={1.8}>
          <sphereGeometry args={[0.35, 12, 12]} />
          <meshBasicMaterial color={rg.color} transparent opacity={hovered ? 0.25 : 0.08} depthWrite={false} />
        </mesh>
      </group>
      {hovered && (
        <Html distanceFactor={18} position={[0, 1.2, 0]} center style={{ pointerEvents: "auto" }}>
          <div className="w-56 rounded-lg border border-cyan-200/40 bg-slate-950/95 p-2.5 text-slate-100 shadow-xl">
            <p className="text-sm font-semibold">
              {sat.flag} {sat.name}
            </p>
            <p className="mt-0.5 font-mono text-[10px] text-cyan-200">
              {sat.agency} · {sat.regime} · ~{sat.altitudeKm.toLocaleString()} km
            </p>
            <p className="mt-1 text-[10px] text-slate-400">{sat.operatorCountry}</p>
            <p className="mt-1 text-xs text-slate-300">{sat.blurb}</p>
            <p className="mt-1 text-[11px] leading-snug text-muted">{sat.missionDetail}</p>
            <button
              type="button"
              className="mt-2 font-mono text-[10px] text-accent underline"
              onClick={() => openLibrary(sat.libraryId)}
            >
              Read more in library →
            </button>
          </div>
        </Html>
      )}
      {/* agency color tick always visible */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.15, 0.08, 0.08]} />
        <meshBasicMaterial color={ag.color} />
      </mesh>
    </group>
  );
}
