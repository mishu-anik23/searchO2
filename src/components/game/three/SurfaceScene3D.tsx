import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useGame } from "@/game/store";
import { MoonTerrain, SurfaceBoulders, SurfaceEquipment } from "./MoonTerrain";
import { SurfaceHotspot } from "./CelestialHover";
import { DESTINATIONS } from "@/game/data";

/** 3D surface scene for the ISRU plant view (replaces the flat SVG). */
export function SurfaceScene3D({ dest, step }: { dest: "moon" | "mars"; step: number }) {
  const reduced = useGame((s) => s.reducedMotion);
  const isMoon = dest === "moon";

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-bg" style={{ minHeight: 420 }}>
      <Canvas
        camera={{ position: [3, 2.5, 7], fov: 45 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false }}
        style={{ width: "100%", height: "100%", minHeight: 420 }}
        shadows={!reduced}
      >
        <color attach="background" args={[isMoon ? "#090C12" : "#1A1714"]} />
        <ambientLight intensity={isMoon ? 0.25 : 0.35} />
        <directionalLight
          position={[8, 6, 4]}
          intensity={isMoon ? 1.3 : 1.0}
          color={isMoon ? "#E8EDF4" : "#C9A86F"}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-4, 3, -5]} intensity={0.2} color={isMoon ? "#7EB8C9" : "#C4896A"} />

        <Suspense fallback={null}>
          {/* Terrain */}
          {isMoon ? (
            <MoonTerrain size={14} segments={96} />
          ) : (
            <MarsTerrain />
          )}

          {/* Boulders */}
          <SurfaceBoulders count={35} size={14} />

          {/* Equipment visible based on step */}
          {step >= 1 && (
            <SurfaceEquipment visible={true} />
          )}

          {/* Distant Earth (Moon only) */}
          {isMoon && (
            <mesh position={[-6, 4, -5]}>
              <sphereGeometry args={[0.5, 32, 32]} />
              <meshStandardMaterial color="#3d7ab0" emissive="#1a3a5a" emissiveIntensity={0.2} roughness={0.55} />
            </mesh>
          )}

          {/* Surface hotspots */}
          <SurfaceHotspotsForStep step={step} isMoon={isMoon} />
        </Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={4}
          maxDistance={16}
          maxPolarAngle={Math.PI * 0.68}
          target={[0, 0.5, 0]}
          enableDamping
          dampingFactor={0.08}
        />
      </Canvas>

      <div className="pointer-events-none absolute bottom-3 left-3 rounded-sm border border-border bg-bg/80 px-2 py-1 font-mono text-[10px] text-muted">
        Drag to orbit · hover markers for science
      </div>
    </div>
  );
}

/** Mars terrain — reddish, smoother than Moon. */
function MarsTerrain() {
  const ref = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(14, 14, 96, 96);
    geo.rotateX(-Math.PI / 2);

    const positions = geo.attributes.position as THREE.BufferAttribute;
    // Simple noise function
    const noise = (x: number, z: number) => {
      const a = Math.sin(x * 0.3) * Math.cos(z * 0.25) * 0.15;
      const b = Math.sin(x * 0.7 + 1.5) * Math.cos(z * 0.5) * 0.08;
      return a + b;
    };

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      const edgeDist = Math.max(Math.abs(x), Math.abs(z)) / 7;
      let h = noise(x, z);
      if (edgeDist > 0.8) {
        h *= 1 - (edgeDist - 0.8) * 5 * 0.2;
      }
      positions.setY(i, h);
    }
    positions.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh ref={ref} geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial color="#8A4E38" roughness={0.95} metalness={0.05} />
    </mesh>
  );
}

/** Step-specific surface hotspots for the ISRU plant view. */
function SurfaceHotspotsForStep({ step, isMoon }: { step: number; isMoon: boolean }) {
  const spots = useMemo(() => {
    const all: { pos: [number, number, number]; label: string; fact: string }[] = [
      { pos: [-2.5, 0.5, 1.5] as [number, number, number], label: "Electrolyzer", fact: isMoon ? "Splits polar ice into H₂ and O₂. The O₂ is tanked for rocket fuel and breathing." : "MOXIE-class CO₂ splitter: pulls O₂ from the thin Martian atmosphere. 95% CO₂ in, 99.6% O₂ out." },
      { pos: [-1.0, 0.7, 2.2] as [number, number, number], label: "O₂ tank", fact: "Liquid oxygen stored cryogenically. One full tank fuels a return trip or supplies a crew for weeks." },
      { pos: [1.5, 0.8, -1.8] as [number, number, number], label: "Solar array", fact: isMoon ? "Lunar daylight lasts 14 Earth days. Solar charges batteries for the 14-day night." : "Mars gets ~43% of Earth's sunlight. Dust storms can cut output by 80% for months." },
      { pos: [2.8, 0.3, 0.8] as [number, number, number], label: "Rover", fact: "Electric, unpressurized. Explores for ice deposits and science targets within battery range." },
      { pos: [0, 1.0, 0] as [number, number, number], label: "Plant control", fact: "Automated valves and sensors regulate the electrolysis. No humans needed for routine operation." },
    ];

    if (step >= 4) {
      all.push({
        pos: [0.3, 0.5, 1.2] as [number, number, number],
        label: "Cryo storage",
        fact: "Oxygen liquefied at -183°C. Insulation matters more in vacuum — no convection, only radiation loss.",
      });
    }

    if (isMoon) {
      all.push({
        pos: [-6, 4, -5] as [number, number, number],
        label: "Earth",
        fact: "From the lunar surface, Earth hangs in a black sky — 2° across, four times larger than the Moon from Earth.",
      });
    }

    return all;
  }, [step, isMoon]);

  return (
    <group>
      {spots.map((s, i) => (
        <SurfaceHotspot key={i} position={s.pos} label={s.label} fact={s.fact} />
      ))}
    </group>
  );
}
