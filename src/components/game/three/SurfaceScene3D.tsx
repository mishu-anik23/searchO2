import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { SurfaceHotspot } from "./CelestialHover";
import { StarField3D, NamedStars3D, ConstellationLines3D } from "./StarField3D";
import { GalaxySprites } from "./GalaxySprite";

/** 3D ISRU surface scene — gamified plant stages + rich cosmic sky (~5.4k star field). */
export function SurfaceScene3D({
  dest,
  step,
  done = false,
}: {
  dest: "moon" | "mars";
  step: number;
  done?: boolean;
}) {
  const isMoon = dest === "moon";
  return (
    <div className="h-full min-h-[440px] w-full">
      <Canvas
        camera={{ position: [4.2, 3.2, 6.5], fov: 48, near: 0.1, far: 2500 }}
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: false }}
        style={{ width: "100%", height: "100%" }}
      >
        <color attach="background" args={[isMoon ? "#03040a" : "#120a08"]} />
        <fog attach="fog" args={[isMoon ? "#03040a" : "#120a08", 22, 55]} />
        <ambientLight intensity={0.28} />
        <directionalLight position={[6, 8, 4]} intensity={1.25} color={isMoon ? "#F2F6FA" : "#FFD8B0"} castShadow />
        <directionalLight position={[-4, 2, -3]} intensity={0.2} color="#7EB8C9" />
        <hemisphereLight args={[isMoon ? "#1a2038" : "#3a2010", "#05060a", 0.35]} />

        <Suspense fallback={null}>
          {/* Dense starfield ≈ 1800 (drei) + 3600 catalog field + milky layer ≈ 5.4k points */}
          <Stars radius={280} depth={80} count={1800} factor={2.6} saturation={0.2} fade speed={0.12} />
          <StarField3D radius={480} reduced={false} />
          <NamedStars3D radius={420} visible />
          <ConstellationLines3D radius={420} visible />
          <GalaxySprites distance={520} reduced={false} visible />

          {isMoon ? <LunarGround /> : <MarsGround />}
          {isMoon && <DistantEarthSky />}

          <PlantEquipment isMoon={isMoon} step={step} done={done} />
          <SurfaceHotspotsForStep step={step} isMoon={isMoon} done={done} />
        </Suspense>

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={2.5}
          maxDistance={22}
          maxPolarAngle={Math.PI * 0.48}
          target={[0, 0.4, 0]}
        />
      </Canvas>
      <div className="pointer-events-none absolute bottom-2 left-2 rounded border border-white/10 bg-black/50 px-2 py-1 font-mono text-[9px] text-slate-400">
        Drag to look · scroll zoom · hover glowing gear
      </div>
    </div>
  );
}

function LunarGround() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(28, 28, 64, 64);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      let h = Math.sin(x * 0.35) * 0.08 + Math.cos(y * 0.28) * 0.06;
      const r = Math.hypot(x, y);
      if (r < 1.2) h *= 0.2;
      pos.setZ(i, h);
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow geometry={geo}>
      <meshStandardMaterial color="#2A3344" roughness={0.95} metalness={0.04} />
    </mesh>
  );
}

function MarsGround() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(28, 28, 48, 48);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      pos.setZ(i, Math.sin(x * 0.2) * 0.12 + Math.cos(y * 0.25) * 0.1);
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow geometry={geo}>
      <meshStandardMaterial color="#8A4E38" roughness={0.95} metalness={0.05} />
    </mesh>
  );
}

function DistantEarthSky() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.05;
  });
  return (
    <group position={[-7, 4.2, -6]}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.55, 28, 28]} />
        <meshStandardMaterial color="#3d7ab0" emissive="#1a4060" emissiveIntensity={0.3} roughness={0.5} />
      </mesh>
      <mesh scale={1.08}>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshBasicMaterial color="#6eb4ff" transparent opacity={0.28} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

function PlantEquipment({ isMoon, step, done }: { isMoon: boolean; step: number; done: boolean }) {
  const pulse = useRef(0);
  useFrame((_, dt) => {
    pulse.current += dt;
  });

  const active = (min: number) => step >= min || done;
  const highlight = (exact: number) => step === exact && !done;

  return (
    <group>
      {/* Core plant pad */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.6, 32]} />
        <meshStandardMaterial color={isMoon ? "#1A222E" : "#5A3020"} roughness={0.9} />
      </mesh>

      {/* Solar arrays — step >= 1 moon / always useful on mars after deploy */}
      {(active(1) || !isMoon) && (
        <group position={[1.6, 0.9, -1.6]}>
          <mesh rotation={[0.2, 0.4, 0]}>
            <boxGeometry args={[2.2, 0.04, 1.0]} />
            <meshStandardMaterial
              color="#1a3048"
              emissive={highlight(1) ? "#E8C070" : "#3a6a90"}
              emissiveIntensity={highlight(1) ? 0.55 : 0.15}
              metalness={0.4}
            />
          </mesh>
          <mesh position={[0, -0.5, 0]}>
            <cylinderGeometry args={[0.06, 0.08, 1.0, 8]} />
            <meshStandardMaterial color="#8B97A8" />
          </mesh>
        </group>
      )}

      {/* Rover / miner */}
      {active(isMoon ? 2 : 5) && (
        <group position={[2.6, 0.25, 0.9]}>
          <mesh>
            <boxGeometry args={[0.7, 0.35, 0.5]} />
            <meshStandardMaterial
              color="#C5D4E3"
              emissive={highlight(isMoon ? 2 : 5) ? "#C9A86F" : "#000"}
              emissiveIntensity={highlight(isMoon ? 2 : 5) ? 0.35 : 0}
            />
          </mesh>
          {([-0.25, 0.25] as number[]).map((x) =>
            ([-0.2, 0.2] as number[]).map((z) => (
              <mesh key={`${x}-${z}`} position={[x, -0.22, z]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.1, 0.1, 0.08, 10]} />
                <meshStandardMaterial color="#2A3344" />
              </mesh>
            )),
          )}
        </group>
      )}

      {/* Heat drum / cell stack */}
      {active(isMoon ? 3 : 2) && (
        <mesh position={[-0.8, 0.45, 0.3]}>
          <cylinderGeometry args={[0.35, 0.35, 0.7, 14]} />
          <meshStandardMaterial
            color="#8B97A8"
            metalness={0.5}
            emissive={highlight(isMoon ? 3 : 2) || highlight(isMoon ? 4 : 3) ? "#E8C070" : "#000"}
            emissiveIntensity={highlight(isMoon ? 3 : 2) || highlight(isMoon ? 4 : 3) ? 0.45 : 0}
          />
        </mesh>
      )}

      {/* Electrolyzer / MOXIE box */}
      {active(isMoon ? 4 : 3) && (
        <group position={[-2.2, 0.45, 1.3]}>
          <mesh>
            <boxGeometry args={[0.9, 0.7, 0.7]} />
            <meshStandardMaterial
              color="#4a6070"
              metalness={0.45}
              emissive={highlight(isMoon ? 4 : 3) ? "#6FBF9A" : "#7EB8C9"}
              emissiveIntensity={highlight(isMoon ? 4 : 3) ? 0.5 : 0.12}
            />
          </mesh>
          <pointLight
            position={[0, 0.5, 0]}
            color="#9fd0e8"
            intensity={highlight(isMoon ? 4 : 3) || done ? 1.2 : 0.3}
            distance={4}
          />
        </group>
      )}

      {/* O2 tanks */}
      {active(isMoon ? 5 : 4) && (
        <group position={[-1.0, 0.55, 2.0]}>
          {[0, 0.55].map((x) => (
            <mesh key={x} position={[x, 0, 0]}>
              <cylinderGeometry args={[0.22, 0.22, 1.0, 12]} />
              <meshStandardMaterial
                color="#C5D4E3"
                metalness={0.55}
                emissive={highlight(isMoon ? 5 : 4) || done ? "#80C29B" : "#000"}
                emissiveIntensity={highlight(isMoon ? 5 : 4) || done ? 0.35 : 0}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Status beacon when plant online */}
      {done && (
        <mesh position={[0, 1.4, 0]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshBasicMaterial color="#6FBF9A" />
        </mesh>
      )}
    </group>
  );
}

function SurfaceHotspotsForStep({
  step,
  isMoon,
  done,
}: {
  step: number;
  isMoon: boolean;
  done: boolean;
}) {
  const spots = useMemo(() => {
    const all: { pos: [number, number, number]; label: string; fact: string }[] = [];
    if (isMoon) {
      all.push(
        {
          pos: [0, 0.5, 0],
          label: "Plant pad",
          fact: "Polar ISRU pad — solar on the ridge, ice mining nearby, oxygen tanks on site.",
        },
        {
          pos: [1.6, 1.2, -1.6],
          label: "Solar arrays",
          fact: "Lunar daylight can last ~14 Earth days at the poles. Panels power electrolysis and heaters.",
        },
        {
          pos: [2.6, 0.5, 0.9],
          label: "Mining rover",
          fact: "Scoops icy regolith and ilmenite-rich dust for the plant.",
        },
        {
          pos: [-2.2, 0.8, 1.3],
          label: "Electrolyzer",
          fact: "Splits water: 2 H₂O → 2 H₂ + O₂. About 89% of water’s mass is oxygen!",
        },
        {
          pos: [-1.0, 1.0, 2.0],
          label: "O₂ tanks",
          fact: "Liquid oxygen stored cold. Used for breathing and rocket propellant.",
        },
        {
          pos: [-7, 4, -6],
          label: "Earth",
          fact: "From the Moon, Earth is ~2° across in a black sky — no blue air to scatter light.",
        },
      );
      if (step >= 6 || done) {
        all.push({
          pos: [-0.8, 0.9, 0.3],
          label: "Ilmenite reactor",
          fact: "Hot hydrogen pulls extra oxygen from FeTiO₃ rock — the Moon’s dirt is an oxygen bank.",
        });
      }
    } else {
      all.push(
        {
          pos: [0, 0.5, 0],
          label: "MOXIE plant",
          fact: "Inhales Martian CO₂ and splits out oxygen — the same idea NASA demonstrated on Perseverance.",
        },
        {
          pos: [-2.2, 0.8, 1.3],
          label: "Cell stack",
          fact: "Hot ceramic cells let oxygen ions leave CO₂. 2 CO₂ → 2 CO + O₂.",
        },
        {
          pos: [-1.0, 1.0, 2.0],
          label: "O₂ tanks",
          fact: "Cold liquid oxygen for life support and future ascent fuel.",
        },
        {
          pos: [1.6, 1.2, -1.6],
          label: "Solar arrays",
          fact: "Mars gets about 43% of Earth’s sunlight. Dust storms can dim the panels.",
        },
        {
          pos: [2.6, 0.5, 0.9],
          label: "Ice scout rover",
          fact: "Looks for subsurface ice — a second path to water and oxygen.",
        },
      );
    }
    // Always show a deep-sky tip
    all.push({
      pos: [3.5, 2.5, -4],
      label: "Deep sky",
      fact: "Hover stars & galaxies above the horizon. No thick air means a crystal-clear cosmic view!",
    });
    return all;
  }, [step, isMoon, done]);

  return (
    <group>
      {spots.map((s) => (
        <SurfaceHotspot key={s.label} position={s.pos} label={s.label} fact={s.fact} />
      ))}
    </group>
  );
}
