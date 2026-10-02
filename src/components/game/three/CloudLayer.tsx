import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CloudLayerProps {
  density: number;
  wind: number;
  rocketAltM: number;
}

/** Lightweight instanced billboard-ish cloud puffs below the vehicle. */
export function CloudLayer({ density, wind, rocketAltM }: CloudLayerProps) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const count = Math.min(48, Math.max(8, Math.floor(density * 40)));
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#e8edf4",
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
      }),
    [],
  );

  const seeds = useMemo(() => {
    const out: { x: number; z: number; y: number; s: number; phase: number }[] = [];
    for (let i = 0; i < 48; i++) {
      const a = (i * 2.399) % (Math.PI * 2);
      const r = 20 + (i % 12) * 8;
      out.push({
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        y: 18 + (i % 5) * 3,
        s: 4 + (i % 4) * 2,
        phase: i * 0.7,
      });
    }
    return out;
  }, []);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.elapsedTime;
    // Fade clouds when rocket is well above cloud deck (~2–4 km visual)
    const above = Math.max(0, Math.min(1, (rocketAltM - 1500) / 8000));
    mat.opacity = 0.35 * (1 - above) * density;
    mesh.current.visible = above < 0.95 && density > 0.05;
    for (let i = 0; i < count; i++) {
      const s = seeds[i];
      dummy.position.set(s.x + Math.sin(t * 0.05 + s.phase) * wind * 0.3, s.y, s.z + t * wind * 0.15);
      dummy.scale.setScalar(s.s);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, 48]} material={mat} frustumCulled={false}>
      <sphereGeometry args={[1, 6, 4]} />
    </instancedMesh>
  );
}
