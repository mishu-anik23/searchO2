import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Simple 3D noise function (value noise with bilinear interpolation). */
function noise3D(x: number, y: number, z: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fy = y - iy;
  const fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const uz = fz * fz * (3 - 2 * fz);

  const hash = (a: number, b: number, c: number) => {
    let h = (a * 374761393 + b * 668265263 + c * 1442695040) >>> 0;
    h = (h ^ (h >>> 13)) * 1274126177;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const c000 = hash(ix, iy, iz);
  const c100 = hash(ix + 1, iy, iz);
  const c010 = hash(ix, iy + 1, iz);
  const c110 = hash(ix + 1, iy + 1, iz);
  const c001 = hash(ix, iy, iz + 1);
  const c101 = hash(ix + 1, iy, iz + 1);
  const c011 = hash(ix, iy + 1, iz + 1);
  const c111 = hash(ix + 1, iy + 1, iz + 1);

  return lerp(
    lerp(lerp(c000, c100, ux), lerp(c010, c110, ux), uy),
    lerp(lerp(c001, c101, ux), lerp(c011, c111, ux), uy),
    uz,
  );
}

/** Fractal Brownian Motion — layered noise for natural terrain. */
function fbm(x: number, y: number, octaves = 4): number {
  let val = 0;
  let amp = 1;
  let freq = 1;
  let max = 0;
  for (let i = 0; i < octaves; i++) {
    val += noise3D(x * freq, y * freq, 0) * amp;
    max += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return val / max;
}

interface CraterDef {
  x: number;
  z: number;
  r: number;
  depth: number;
}

interface MoonTerrainProps {
  size?: number;
  segments?: number;
  visible?: boolean;
}

/** 3D displaced terrain mesh with procedural craters and regolith mounds.
 *  Replaces the flat circleGeometry disc with real geometry. */
export function MoonTerrain({ size = 12, segments = 128, visible = true }: MoonTerrainProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const { geometry, craters } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    // Generate craters
    const craterCount = 12;
    const craterList: CraterDef[] = [];
    const rng = (s: number) => {
      let v = s >>> 0;
      return () => {
        v = (v * 1664525 + 1013904223) >>> 0;
        return v / 4294967296;
      };
    };
    const rand = rng(42);
    for (let i = 0; i < craterCount; i++) {
      const angle = rand() * Math.PI * 2;
      const dist = rand() * size * 0.38;
      craterList.push({
        x: Math.cos(angle) * dist,
        z: Math.sin(angle) * dist,
        r: 0.3 + rand() * 1.0,
        depth: 0.15 + rand() * 0.25,
      });
    }

    // Displace vertices
    const positions = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);

      // Base terrain: gentle rolling regolith
      let h = fbm(x * 0.15, z * 0.15, 4) * 0.35 - 0.1;

      // Add craters as depressions with raised rims
      for (const c of craterList) {
        const dx = x - c.x;
        const dz = z - c.z;
        const d = Math.sqrt(dx * dx + dz * dz);
        if (d < c.r * 1.8) {
          const norm = d / c.r;
          if (norm < 1) {
            // Crater interior — concave bowl
            h -= c.depth * (1 - norm * norm);
          } else if (norm < 1.8) {
            // Raised rim
            const rimT = (norm - 1) / 0.8;
            h += c.depth * 0.3 * (1 - rimT);
          }
        }
      }

      // Edge falloff so terrain doesn't end abruptly
      const edgeDist = Math.max(Math.abs(x), Math.abs(z)) / (size / 2);
      if (edgeDist > 0.75) {
        const t = (edgeDist - 0.75) / 0.25;
        h *= 1 - t * t;
      }

      positions.setY(i, h);
    }
    positions.needsUpdate = true;
    geo.computeVertexNormals();

    return { geometry: geo, craters: craterList };
  }, [size, segments]);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#c5d4e3",
        roughness: 0.95,
        metalness: 0.05,
        flatShading: false,
      }),
    [],
  );

  if (!visible) return null;

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} receiveShadow castShadow />
  );
}

/** Procedurally scattered boulders using instanced meshes. */
export function SurfaceBoulders({ count = 40, size = 12 }: { count?: number; size?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const seeds = useMemo(() => {
    const rng = (s: number) => {
      let v = s >>> 0;
      return () => {
        v = (v * 1664525 + 1013904223) >>> 0;
        return v / 4294967296;
      };
    };
    const rand = rng(99);
    return Array.from({ length: count }, () => ({
      x: (rand() - 0.5) * size * 0.8,
      z: (rand() - 0.5) * size * 0.8,
      y: 0.05 + rand() * 0.15,
      s: 0.08 + rand() * 0.2,
      rx: rand() * Math.PI,
      ry: rand() * Math.PI,
      rz: rand() * Math.PI,
    }));
  }, [count, size]);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#8b95a1",
        roughness: 1,
        metalness: 0.05,
        flatShading: true,
      }),
    [],
  );

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      material={material}
      castShadow
      frustumCulled={false}
    >
      <dodecahedronGeometry args={[1, 0]} />
      {seeds.map((s, i) => {
        if (meshRef.current) {
          dummy.position.set(s.x, s.y, s.z);
          dummy.rotation.set(s.rx, s.ry, s.rz);
          dummy.scale.setScalar(s.s);
          dummy.updateMatrix();
          meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        return null;
      })}
    </instancedMesh>
  );
}

/** 3D surface equipment: electrolyzer, O2 tank, solar panels, rover. */
export function SurfaceEquipment({ visible = true }: { visible?: boolean }) {
  if (!visible) return null;
  return (
    <group>
      {/* Electrolyzer unit */}
      <group position={[-2.5, 0, 1.5]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[0.8, 0.8, 0.6]} />
          <meshStandardMaterial color="#8B97A8" metalness={0.4} roughness={0.45} />
        </mesh>
        <mesh position={[0.35, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.6, 8]} />
          <meshStandardMaterial color="#2A3344" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[-0.35, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.6, 8]} />
          <meshStandardMaterial color="#2A3344" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.75, 0.31]} castShadow>
          <boxGeometry args={[0.5, 0.15, 0.02]} />
          <meshStandardMaterial color="#7EB8C9" emissive="#7EB8C9" emissiveIntensity={0.2} />
        </mesh>
      </group>

      {/* O2 tank */}
      <group position={[-1.0, 0, 2.2]}>
        <mesh position={[0, 0.55, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 1.0, 16]} />
          <meshStandardMaterial color="#6FBF9A" metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.1, 0]} castShadow>
          <sphereGeometry args={[0.35, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#6FBF9A" metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.05, 0]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.1, 16]} />
          <meshStandardMaterial color="#2A3344" metalness={0.5} roughness={0.4} />
        </mesh>
      </group>

      {/* Solar panel array */}
      <group position={[1.5, 0, -1.8]}>
        {[0, 1].map((i) => (
          <group key={i} position={[i * 0.9, 0, 0]}>
            <mesh position={[0, 0.6, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.04, 1.2, 6]} />
              <meshStandardMaterial color="#2A3344" metalness={0.6} roughness={0.3} />
            </mesh>
            <mesh position={[0, 1.1, 0]} rotation={[0.3, 0, 0]} castShadow>
              <boxGeometry args={[0.7, 0.02, 0.5]} />
              <meshStandardMaterial
                color="#1a3a5a"
                metalness={0.8}
                roughness={0.2}
                emissive="#0a1a2a"
                emissiveIntensity={0.1}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Rover */}
      <group position={[2.8, 0, 0.8]}>
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[0.5, 0.3, 0.35]} />
          <meshStandardMaterial color="#8B97A8" metalness={0.4} roughness={0.45} />
        </mesh>
        {[
          [-0.22, 0.1, 0.2],
          [0.22, 0.1, 0.2],
          [-0.22, 0.1, -0.2],
          [0.22, 0.1, -0.2],
        ].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.08, 8]} />
            <meshStandardMaterial color="#2A3344" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, 0.45, 0.15]} castShadow>
          <boxGeometry args={[0.15, 0.12, 0.02]} />
          <meshStandardMaterial color="#7EB8C9" emissive="#7EB8C9" emissiveIntensity={0.3} />
        </mesh>
      </group>
    </group>
  );
}
