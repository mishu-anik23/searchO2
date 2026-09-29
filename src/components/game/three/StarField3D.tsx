import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { FIELD, MILKY, NAMED_STARS, CONSTELLATIONS, spectralColor } from "@/game/cosmos";

interface StarField3DProps {
  radius?: number;
  reduced?: boolean;
}

/** R3F star field using the FIELD (3600) + MILKY (1800) arrays from cosmos.ts.
 *  Each star has spectral color and brightness from the data. */
export function StarField3D({ radius = 300, reduced = false }: StarField3DProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors, sizes } = useMemo(() => {
    const total = FIELD.length + MILKY.length;
    const posArr = new Float32Array(total * 3);
    const colArr = new Float32Array(total * 3);
    const sizeArr = new Float32Array(total);

    let idx = 0;
    for (const st of [...FIELD, ...MILKY]) {
      // Stars are at direction * radius
      const len = Math.hypot(st.x, st.y, st.z) || 1;
      posArr[idx * 3] = (st.x / len) * radius;
      posArr[idx * 3 + 1] = (st.y / len) * radius;
      posArr[idx * 3 + 2] = (st.z / len) * radius;
      colArr[idx * 3] = st.cr / 255;
      colArr[idx * 3 + 1] = st.cg / 255;
      colArr[idx * 3 + 2] = st.cb / 255;
      sizeArr[idx] = st.s * (reduced ? 0.7 : 1);
      idx++;
    }
    return { positions: posArr, colors: colArr, sizes: sizeArr };
  }, [radius, reduced]);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 1.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        sizeAttenuation: true,
      }),
    [],
  );

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);

  useFrame(({ clock }) => {
    if (pointsRef.current && !reduced) {
      // Subtle twinkle — modulate overall opacity slightly
      const mat = pointsRef.current.material as THREE.PointsMaterial;
      mat.opacity = 0.75 + Math.sin(clock.elapsedTime * 0.5) * 0.15;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} />
  );
}

/** Named bright stars — larger, with labels. */
export function NamedStars3D({ radius = 280, visible = true }: { radius?: number; visible?: boolean }) {
  if (!visible) return null;

  return (
    <group>
      {NAMED_STARS.map((star) => {
        const len = Math.hypot(star.dir.x, star.dir.y, star.dir.z) || 1;
        const pos: [number, number, number] = [
          (star.dir.x / len) * radius,
          (star.dir.y / len) * radius,
          (star.dir.z / len) * radius,
        ];
        return (
          <group key={star.id} position={pos}>
            <mesh>
              <sphereGeometry args={[0.8 + star.mag * 0.3, 8, 8]} />
              <meshBasicMaterial color={star.color} />
            </mesh>
            <pointLight color={star.color} intensity={0.3} distance={8} />
          </group>
        );
      })}
    </group>
  );
}

/** Constellation lines connecting named stars in 3D. */
export function ConstellationLines3D({ radius = 280, visible = true }: { radius?: number; visible?: boolean }) {
  const lines = useMemo(() => {
    if (!visible) return [];
    return CONSTELLATIONS.map((c: { name: string; ids: string[] }) => {
      const pts: THREE.Vector3[] = [];
      for (const id of c.ids) {
        const star = NAMED_STARS.find((s) => s.id === id);
        if (!star) continue;
        const len = Math.hypot(star.dir.x, star.dir.y, star.dir.z) || 1;
        pts.push(
          new THREE.Vector3(
            (star.dir.x / len) * radius,
            (star.dir.y / len) * radius,
            (star.dir.z / len) * radius,
          ),
        );
      }
      if (pts.length < 2) return null;
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({
        color: 0x7eb8c9,
        transparent: true,
        opacity: 0.2,
      });
      const line = new THREE.Line(geo, mat);
      return { name: c.name, object: line };
    }).filter(Boolean);
  }, [radius, visible]);

  if (!visible) return null;

  return (
    <group>
      {lines.map((l: { name: string; object: THREE.Line } | null, i: number) =>
        l ? <primitive key={i} object={l.object} /> : null,
      )}
    </group>
  );
}
