import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BODIES, ASTEROIDS, posOf, type V } from "@/game/cosmos";
import { PlanetSystem, OrbitPaths } from "./CelestialBody";

interface OrbitSystemProps {
  simTime: number;
  reduced?: boolean;
  showPaths?: boolean;
  showPlanets?: boolean;
}

/** Full orbital system: Sun, planets, orbital path rings, asteroid belt. */
export function OrbitSystem({
  simTime,
  reduced = false,
  showPaths = true,
  showPlanets = true,
}: OrbitSystemProps) {
  const asteroidRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Asteroid belt positions
  const asteroidData = useMemo(() => {
    return ASTEROIDS.map((rock) => {
      const cache = new Map<string, V>();
      return { ...rock, angle: Math.atan2(rock.z, rock.x) };
    });
  }, []);

  useFrame(({ clock }) => {
    if (asteroidRef.current && !reduced) {
      const t = simTime + clock.elapsedTime * 0.01;
      for (let i = 0; i < asteroidData.length; i++) {
        const rock = asteroidData[i];
        const a = rock.angle + t * 0.05;
        dummy.position.set(
          Math.cos(a) * Math.hypot(rock.x, rock.z),
          rock.y,
          Math.sin(a) * Math.hypot(rock.x, rock.z),
        );
        dummy.scale.setScalar(rock.r);
        dummy.updateMatrix();
        asteroidRef.current.setMatrixAt(i, dummy.matrix);
      }
      asteroidRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  const asteroidMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#b4aa9b",
        roughness: 1,
        metalness: 0.05,
      }),
    [],
  );

  return (
    <group>
      {showPlanets && <PlanetSystem simTime={simTime} reduced={reduced} />}
      {showPaths && <OrbitPaths visible={showPaths} />}

      {/* Asteroid belt */}
      <instancedMesh
        ref={asteroidRef}
        args={[undefined, undefined, ASTEROIDS.length]}
        material={asteroidMat}
        frustumCulled={false}
      >
        <dodecahedronGeometry args={[1, 0]} />
      </instancedMesh>
    </group>
  );
}

/** Time speed control UI overlay (HTML, not 3D). */
export function TimeSpeedControl({
  speed,
  onChange,
  reduced = false,
}: {
  speed: number;
  onChange: (v: number) => void;
  reduced?: boolean;
}) {
  if (reduced) return null;
  const speeds = [0.5, 1, 10, 100];
  return (
    <div className="pointer-events-auto absolute bottom-3 right-3 flex items-center gap-2 rounded-md border border-border bg-bg/80 px-3 py-2">
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted">Orbit</span>
      <div className="flex gap-1">
        {speeds.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={`rounded-sm px-2 py-1 font-mono text-[11px] tabular-nums transition-colors ${
              speed === s
                ? "bg-accent text-accent-fg"
                : "bg-raised text-muted hover:text-fg"
            }`}
          >
            {s}×
          </button>
        ))}
      </div>
    </div>
  );
}

/** Camera depth zone UI — quick jump buttons. */
export function DepthZoneControl({
  depth,
  onJump,
}: {
  depth: "surface" | "orbital" | "deep";
  onJump: (zone: "surface" | "orbital" | "deep") => void;
}) {
  const zones: { id: "surface" | "orbital" | "deep"; label: string }[] = [
    { id: "surface", label: "Surface" },
    { id: "orbital", label: "Orbit" },
    { id: "deep", label: "Deep Space" },
  ];
  return (
    <div className="pointer-events-auto absolute top-3 right-3 flex gap-1 rounded-md border border-border bg-bg/80 p-1">
      {zones.map((z) => (
        <button
          key={z.id}
          type="button"
          onClick={() => onJump(z.id)}
          className={`rounded-sm px-3 py-1.5 font-mono text-[11px] transition-colors ${
            depth === z.id
              ? "bg-accent text-accent-fg"
              : "text-muted hover:text-fg"
          }`}
        >
          {z.label}
        </button>
      ))}
    </div>
  );
}
