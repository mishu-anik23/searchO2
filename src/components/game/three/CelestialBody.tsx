import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BODIES, posOf, bodyTexture, photoOf, AU, type SkyBody, type V, CONSTELLATIONS, NAMED_STARS } from "@/game/cosmos";

/** Convert a canvas-baked body texture to a THREE.CanvasTexture. */
export function canvasToTexture(id: string): THREE.CanvasTexture {
  const canvas = bodyTexture(id);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** Load a .webp photo as a THREE texture. */
function usePhotoTexture(id: string): THREE.Texture | null {
  return useMemo(() => {
    const photo = photoOf(id);
    if (!photo) return null;
    const tex = new THREE.Texture(photo);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, [id]);
}

interface CelestialBodyProps {
  body: SkyBody;
  simTime: number;
  reduced?: boolean;
  showHover?: boolean;
  hoverData?: { blurb: string; fact: string; dist: string; kind: string };
}

/** Renders a single planet/sun/moon as a 3D textured sphere with rotation. */
export function CelestialBody({ body, simTime, reduced = false, showHover = false, hoverData }: CelestialBodyProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const photoTex = usePhotoTexture(body.id);

  const texture = useMemo(() => {
    if (photoTex) return photoTex;
    return canvasToTexture(body.id);
  }, [photoTex, body.id]);

  const material = useMemo(() => {
    if (body.kind === "sun") {
      return new THREE.MeshBasicMaterial({
        color: body.color,
        map: texture,
      });
    }
    return new THREE.MeshStandardMaterial({
      color: body.color,
      map: texture,
      roughness: body.id === "jupiter" || body.id === "saturn" ? 0.6 : 0.85,
      metalness: 0.05,
    });
  }, [body, texture]);

  // Orbital position
  const cache = useMemo(() => new Map<string, V>(), []);
  const position = useMemo(() => {
    const p = posOf(body.id, simTime, cache);
    return [p.x, p.y, p.z] as [number, number, number];
  }, [body.id, simTime, cache]);

  // Rotation speed — faster for gas giants, slower for rocky planets
  const rotSpeed = useMemo(() => {
    if (body.kind === "sun") return 0.02;
    if (body.id === "jupiter") return 0.8;
    if (body.id === "saturn") return 0.7;
    if (body.id === "venus") return 0.05; // Venus rotates very slowly
    if (body.id === "mercury") return 0.08;
    return 0.3;
  }, [body.id, body.kind]);

  useFrame((_, dt) => {
    if (meshRef.current && !reduced) {
      meshRef.current.rotation.y += rotSpeed * dt;
    }
    // Sun corona pulsation
    if (glowRef.current && body.kind === "sun" && !reduced) {
      const s = 1 + Math.sin(simTime * 0.5) * 0.03;
      glowRef.current.scale.setScalar(s);
    }
  });

  return (
    <group position={position}>
      {/* Sun glow / corona */}
      {body.kind === "sun" && (
        <mesh ref={glowRef}>
          <sphereGeometry args={[body.r * 1.35, 32, 32]} />
          <meshBasicMaterial
            color="#fff4d0"
            transparent
            opacity={0.15}
            depthWrite={false}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Main body */}
      <mesh ref={meshRef} material={material}>
        <sphereGeometry args={[body.r, 48, 48]} />
      </mesh>

      {/* Earth atmosphere shell */}
      {body.id === "earth" && (
        <mesh>
          <sphereGeometry args={[body.r * 1.04, 32, 32]} />
          <meshBasicMaterial
            color="#6eb4ff"
            transparent
            opacity={0.25}
            depthWrite={false}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Saturn rings */}
      {body.id === "saturn" && <SaturnRings radius={body.r} />}

      {/* Sun light source */}
      {body.kind === "sun" && (
        <pointLight
          position={[0, 0, 0]}
          intensity={3}
          distance={500}
          color="#fff4d0"
        />
      )}
    </group>
  );
}

/** Saturn ring system with Cassini Division. */
function SaturnRings({ radius }: { radius: number }) {
  const innerR = radius * 1.3;
  const outerR = radius * 2.3;

  const ringTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 4;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createLinearGradient(0, 0, 256, 0);
    grad.addColorStop(0, "rgba(210,190,150,0)");
    grad.addColorStop(0.05, "rgba(210,190,150,0.7)");
    grad.addColorStop(0.3, "rgba(232,214,170,0.85)");
    grad.addColorStop(0.45, "rgba(180,160,120,0.4)");
    grad.addColorStop(0.5, "rgba(120,100,80,0.2)");
    grad.addColorStop(0.55, "rgba(200,180,140,0.75)");
    grad.addColorStop(0.8, "rgba(210,190,150,0.6)");
    grad.addColorStop(1, "rgba(210,190,150,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 4);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  return (
    <mesh rotation={[Math.PI / 2 + 0.4, 0, 0]}>
      <ringGeometry args={[innerR, outerR, 96]} />
      <meshBasicMaterial
        map={ringTexture}
        transparent
        opacity={0.85}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/** Render all planets from BODIES array with auto orbital motion. */
export function PlanetSystem({ simTime, reduced = false }: { simTime: number; reduced?: boolean }) {
  const planets = BODIES.filter((b) => b.kind !== "sun");
  return (
    <group>
      {/* Sun */}
      <CelestialBody body={BODIES[0]} simTime={simTime} reduced={reduced} />

      {/* Planets + Moon */}
      {planets.map((body) => (
        <CelestialBody key={body.id} body={body} simTime={simTime} reduced={reduced} />
      ))}
    </group>
  );
}

/** Faint dashed orbital path rings. */
export function OrbitPaths({ visible = true }: { visible?: boolean }) {
  if (!visible) return null;
  return (
    <group>
      {BODIES.filter((b) => b.orbit && !b.parent).map((b) => (
        <OrbitRing key={b.id} radius={b.orbit!} />
      ))}
    </group>
  );
}

function OrbitRing({ radius }: { radius: number }) {
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segs = 96;
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [radius]);

  const material = useMemo(
    () =>
      new THREE.LineDashedMaterial({
        color: "#7EB8C9",
        transparent: true,
        opacity: 0.15,
        dashSize: 1.5,
        gapSize: 3,
      }),
    [],
  );

  const lineRef = useRef<THREE.Line>(null);
  const line = useMemo(() => {
    const l = new THREE.Line(geometry, material);
    l.computeLineDistances();
    return l;
  }, [geometry, material]);

  // Update material opacity based on distance
  useMemo(() => {
    if (lineRef.current) {
      lineRef.current.computeLineDistances();
    }
  }, []);

  return <primitive ref={lineRef} object={line} />;
}
