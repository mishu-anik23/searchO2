import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { useGame } from "@/game/store";
import { MoonTerrain, SurfaceBoulders, SurfaceEquipment } from "./MoonTerrain";
import { CelestialBody, OrbitPaths, PlanetSystem } from "./CelestialBody";
import { StarField3D, NamedStars3D, ConstellationLines3D } from "./StarField3D";
import { GalaxySprites } from "./GalaxySprite";
import { OrbitSystem, TimeSpeedControl, DepthZoneControl } from "./OrbitSystem";
import { DepthCamera, type CameraZone } from "./DepthCamera";
import { CelestialHover, SurfaceHotspot } from "./CelestialHover";

/** Unified 3D scene that combines Moon surface, orbital system, and deep sky.
 *  Camera depth controls which layers are visible. */
export function CosmosScene({ step, crew }: { step: number; crew: boolean }) {
  const reduced = useGame((s) => s.reducedMotion);
  const cameraZoom = useGame((s) => s.cameraZoom);
  const cameraDepth = useGame((s) => s.cameraDepth);
  const orbitalSpeed = useGame((s) => s.orbitalSpeed);
  const setCameraZoom = useGame((s) => s.setCameraZoom);
  const setOrbitalSpeed = useGame((s) => s.setOrbitalSpeed);

  const [simTime, setSimTime] = useState(0);

  // Advance simulation time
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setSimTime((t) => t + dt * orbitalSpeed);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [orbitalSpeed]);

  const zoom = cameraZoom;
  const isSurface = zoom < 0.35;
  const isOrbital = zoom >= 0.35 && zoom < 0.7;
  const isDeep = zoom >= 0.7;

  // Surface detail visibility — fade out as we zoom to orbital
  const surfaceOpacity = useMemo(() => {
    if (zoom < 0.25) return 1;
    if (zoom < 0.4) return 1 - (zoom - 0.25) / 0.15;
    return 0;
  }, [zoom]);

  // Deep space visibility
  const deepOpacity = useMemo(() => {
    if (zoom < 0.5) return 0;
    if (zoom < 0.7) return (zoom - 0.5) / 0.2;
    return 1;
  }, [zoom]);

  const handleZoneJump = (zone: CameraZone) => {
    const targets = { surface: 0, orbital: 0.5, deep: 0.9 };
    setCameraZoom(targets[zone]);
  };

  // Scroll wheel zoom
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.0008;
      setCameraZoom(useGame.getState().cameraZoom + delta);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [setCameraZoom]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-border bg-bg" style={{ minHeight: 460 }}>
      <Canvas
        camera={{ position: [0, 1.8, 6.5], fov: 42, near: 0.1, far: 2000 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        style={{ width: "100%", height: "100%" }}
      >
        <color attach="background" args={["#05060a"]} />

        {/* Lighting */}
        <ambientLight intensity={isSurface ? 0.3 : 0.15} />
        <directionalLight
          position={[8, 3, 5]}
          intensity={isSurface ? 1.2 : 0.5}
          color="#E8EDF4"
          castShadow={isSurface}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-5, 2, -4]} intensity={0.15} color="#7EB8C9" />

        <Suspense fallback={null}>
          {/* Always-visible Moon body — scales with zoom */}
          <MoonBodyScaled zoom={zoom} step={step} crew={crew} reduced={reduced} />

          {/* Surface detail — terrain, boulders, equipment, lander */}
          {surfaceOpacity > 0.01 && (
            <group visible={surfaceOpacity > 0.05}>
              <MoonTerrain visible={isSurface} />
              <SurfaceBoulders count={40} />
              <SurfaceEquipment visible={isSurface} />
              <LanderGroup step={step} crew={crew} reduced={reduced} />
              {/* Surface hotspots */}
              {isSurface && <SurfaceHotspots step={step} />}
            </group>
          )}

          {/* Orbital system — planets, orbits, asteroids */}
          {zoom > 0.3 && (
            <group>
              <OrbitSystem
                simTime={simTime}
                reduced={reduced}
                showPaths={isDeep || isOrbital}
                showPlanets={isDeep || isOrbital}
              />
            </group>
          )}

          {/* Star field — always present but denser at depth */}
          <StarField3D radius={500} reduced={reduced} />

          {/* Named stars + constellations — deep space only */}
          <NamedStars3D radius={450} visible={isDeep} />
          <ConstellationLines3D radius={450} visible={isDeep} />

          {/* Galaxies — deep space only */}
          <GalaxySprites distance={600} reduced={reduced} visible={isDeep} />

          {/* Distant Earth at surface/orbital level */}
          {zoom < 0.6 && (
            <DistantEarth zoom={zoom} simTime={simTime} />
          )}

          {/* Camera depth controller */}
          <DepthCamera zoom={zoom} reduced={reduced} />
        </Suspense>

        {/* Drei OrbitControls — only for surface/orbital, disabled at deep space */}
        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={isDeep ? 300 : 50}
          maxPolarAngle={Math.PI * 0.72}
          target={[0, 0, 0]}
          enableDamping
          dampingFactor={0.08}
          enabled={zoom < 0.85}
        />
      </Canvas>

      {/* UI overlays */}
      <DepthZoneControl depth={cameraDepth} onJump={handleZoneJump} />
      <TimeSpeedControl speed={orbitalSpeed} onChange={setOrbitalSpeed} reduced={reduced} />

      <div className="pointer-events-none absolute bottom-3 left-3 rounded-sm border border-border bg-bg/80 px-2 py-1 font-mono text-[10px] text-muted">
        Scroll to zoom · {cameraDepth} view · drag to orbit
      </div>
    </div>
  );
}

/** Moon body that scales based on zoom — small at surface, visible sphere at orbital. */
function MoonBodyScaled({ zoom, step, crew, reduced }: { zoom: number; step: number; crew: boolean; reduced: boolean }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    if (ref.current && !reduced) {
      ref.current.rotation.y += dt * 0.04;
    }
  });

  // At surface: tiny (hidden behind terrain). At orbital: full sphere. At deep: small again.
  const scale = useMemo(() => {
    if (zoom < 0.2) return 0.001;
    if (zoom < 0.35) return 0.001 + (zoom - 0.2) * 0.01; // still tiny
    if (zoom < 0.7) return 1.5 + (zoom - 0.35) * 2; // grow to visible sphere
    return 3.5 - (zoom - 0.7) * 5; // shrink as we go deep
  }, [zoom]);

  if (scale < 0.01) return null;

  return (
    <mesh ref={ref} scale={scale} position={[0, 0, 0]}>
      <sphereGeometry args={[1.55, 48, 48]} />
      <meshStandardMaterial color="#C5D4E3" roughness={0.92} metalness={0.05} />
    </mesh>
  );
}

/** Distant Earth visible from the Moon. */
function DistantEarth({ zoom, simTime }: { zoom: number; simTime: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * 0.1;
    }
  });

  // Position Earth in the sky, scale based on zoom
  const pos: [number, number, number] = useMemo(() => {
    if (zoom < 0.35) return [-4.8, 2.6, -3.2]; // surface view position
    return [-8, 4, -6]; // orbital view position
  }, [zoom]);

  const scale = useMemo(() => {
    if (zoom < 0.35) return 0.42;
    if (zoom < 0.7) return 0.6 + (zoom - 0.35) * 1.5;
    return 1.5;
  }, [zoom]);

  return (
    <group position={pos}>
      <mesh ref={ref} scale={scale}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#3d7ab0" emissive="#1a3a5a" emissiveIntensity={0.2} roughness={0.55} />
      </mesh>
      {/* Atmosphere */}
      <mesh scale={scale * 1.05}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#6eb4ff" transparent opacity={0.3} depthWrite={false} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

/** Lander group — reuses the existing LanderMesh pattern but simplified for the unified scene. */
function LanderGroup({ step, crew, reduced }: { step: number; crew: boolean; reduced: boolean }) {
  const plumeOn = step === 0 || step === 2 || step === 3 || step === 4;
  const landed = step >= 5;

  const pose = useMemo(() => {
    if (step === 0) return { pos: [2.4, 0.9, 0.4] as [number, number, number], rot: [0.15, -0.6, 0.1] as [number, number, number], scale: 0.28 };
    if (step === 1) return { pos: [2.1, 0.55, 0.9] as [number, number, number], rot: [0.05, -1.1, 0] as [number, number, number], scale: 0.26 };
    if (step === 2) return { pos: [1.85, 0.15, 0.55] as [number, number, number], rot: [0.35, -0.9, 0.05] as [number, number, number], scale: 0.24 };
    if (step === 3) return { pos: [0.35, 1.35, 0.2] as [number, number, number], rot: [0.85, 0.15, 0] as [number, number, number], scale: 0.32 };
    if (step === 4) return { pos: [0.08, 0.55, 0.05] as [number, number, number], rot: [0.12, 0.05, 0] as [number, number, number], scale: 0.34 };
    return { pos: [0, 0.18, 0] as [number, number, number], rot: [0, 0.1, 0] as [number, number, number], scale: 0.36 };
  }, [step]);

  return (
    <group position={pose.pos} rotation={pose.rot} scale={pose.scale}>
      {/* Descent stage */}
      <mesh position={[0, -0.15, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.62, 0.45, 8]} />
        <meshStandardMaterial color="#8B97A8" metalness={0.4} roughness={0.45} />
      </mesh>
      {/* Crew cabin or cargo */}
      {crew ? (
        <mesh position={[0, 0.35, 0]} castShadow>
          <sphereGeometry args={[0.42, 16, 12]} />
          <meshStandardMaterial color="#E8EDF4" metalness={0.25} roughness={0.35} />
        </mesh>
      ) : (
        <mesh position={[0, 0.28, 0]} castShadow>
          <boxGeometry args={[0.7, 0.5, 0.7]} />
          <meshStandardMaterial color="#C5D4E3" metalness={0.3} roughness={0.4} />
        </mesh>
      )}
      {/* Legs */}
      {[
        [-0.45, -0.55, 0.45],
        [0.45, -0.55, 0.45],
        [-0.45, -0.55, -0.45],
        [0.45, -0.55, -0.45],
      ].map((p, i) => (
        <group key={i}>
          <mesh position={p as [number, number, number]}>
            <cylinderGeometry args={[0.04, 0.04, 0.55, 6]} />
            <meshStandardMaterial color="#8B97A8" />
          </mesh>
          <mesh position={[p[0] * 1.15, p[1] - 0.28, p[2] * 1.15]}>
            <boxGeometry args={[0.22, 0.06, 0.22]} />
            <meshStandardMaterial color="#C5D4E3" />
          </mesh>
        </group>
      ))}
      {/* Engine plume */}
      {plumeOn && !landed && !reduced && (
        <mesh position={[0, -0.7, 0]}>
          <coneGeometry args={[0.22, 0.85, 12, 1, true]} />
          <meshBasicMaterial color="#7EB8C9" transparent opacity={0.55} side={THREE.DoubleSide} />
        </mesh>
      )}
      {landed && (
        <mesh position={[0, 0.55, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#6FBF9A" />
        </mesh>
      )}
    </group>
  );
}

/** Surface hotspots — science info markers around the landing site. */
function SurfaceHotspots({ step }: { step: number }) {
  const hotspots = useMemo(() => {
    const base = [
      { pos: [0, 0.6, 0] as [number, number, number], label: "Landing site", fact: "The lander touches down on a flat regolith plain. No atmosphere means no dust blow — particles fall straight back." },
      { pos: [-1.8, 0.3, -1.2] as [number, number, number], label: "Impact crater", fact: "Formed by meteorite strikes over billions of years. No erosion on the Moon — craters stay sharp forever." },
      { pos: [1.5, 0.2, 1.8] as [number, number, number], label: "Boulder field", fact: "Ejecta from nearby impacts. These rocks are ancient — some over 4 billion years old." },
      { pos: [-2.5, 0.5, 1.5] as [number, number, number], label: "Electrolyzer unit", fact: "Splits water ice from polar craters into hydrogen and oxygen. The oxygen is tanked for fuel and breathing." },
      { pos: [-1.0, 0.6, 2.2] as [number, number, number], label: "O₂ tank", fact: "Liquid oxygen stored at -183°C. One tank can supply a crew of three for weeks." },
      { pos: [1.5, 0.7, -1.8] as [number, number, number], label: "Solar array", fact: "Lunar days last 14 Earth days. Solar panels power the plant during the long daylight, then batteries take over for the night." },
      { pos: [2.8, 0.3, 0.8] as [number, number, number], label: "Rover", fact: "Electric, unpressurized. Range is limited by battery, not fuel — there is no air resistance on the Moon." },
      { pos: [-4.8, 3.0, -3.2] as [number, number, number], label: "Earth", fact: "From the Moon, Earth appears about 2° across — four times larger than the Moon looks from Earth. It hangs in a black sky." },
    ];

    if (step >= 5) {
      base.push({
        pos: [0.5, 0.1, 0.8] as [number, number, number],
        label: "Lunar dust",
        fact: "Regolith is fine, sharp, and electrostatically sticky. There is no wind, so the plume creates a temporary sheet that falls straight back down.",
      });
    }

    return base;
  }, [step]);

  return (
    <group>
      {hotspots.map((h, i) => (
        <SurfaceHotspot
          key={i}
          position={h.pos}
          label={h.label}
          fact={h.fact}
          color={h.label === "Earth" ? "#7EB8C9" : "#7EB8C9"}
        />
      ))}
    </group>
  );
}
