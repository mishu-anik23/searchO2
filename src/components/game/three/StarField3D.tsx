import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { FIELD, MILKY, NAMED_STARS, CONSTELLATIONS } from "@/game/cosmos";
import { clearHoveredTarget, setHoveredTarget, toggleLockedTarget } from "./targetFocus";

interface StarField3DProps {
  radius?: number;
  reduced?: boolean;
}

/** R3F star field using the FIELD (3600) + MILKY (1800) arrays from cosmos.ts.
 *  Each star has spectral color and brightness from the data. */
export function StarField3D({ radius = 300, reduced = false }: StarField3DProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const raycaster = useThree((state) => state.raycaster);
  const [hoveredStar, setHoveredStar] = useState<{ index: number; position: [number, number, number] } | null>(null);
  const [selectedStar, setSelectedStar] = useState<{ index: number; position: [number, number, number] } | null>(null);

  useEffect(() => {
    const previousThreshold = raycaster.params.Points.threshold;
    // Shader points render larger than Three's default points; widen their hit area at distance.
    raycaster.params.Points.threshold = 3.5;
    return () => { raycaster.params.Points.threshold = previousThreshold; };
  }, [raycaster]);

  const { positions, colors, sizes } = useMemo(() => {
    const catalog = [...FIELD, ...MILKY];
    const total = catalog.length;
    const posArr = new Float32Array(total * 3);
    const colArr = new Float32Array(total * 3);
    const sizeArr = new Float32Array(total);

    let idx = 0;
    for (const st of catalog) {
      // Stars are at direction * radius
      const len = Math.hypot(st.x, st.y, st.z) || 1;
      posArr[idx * 3] = (st.x / len) * radius;
      posArr[idx * 3 + 1] = (st.y / len) * radius;
      posArr[idx * 3 + 2] = (st.z / len) * radius;
      const visibility = 0.62 + Math.sqrt(st.b) * 0.55;
      colArr[idx * 3] = (st.cr / 255) * visibility;
      colArr[idx * 3 + 1] = (st.cg / 255) * visibility;
      colArr[idx * 3 + 2] = (st.cb / 255) * visibility;
      sizeArr[idx] = st.s * (reduced ? 0.7 : 1);
      idx++;
    }
    return { positions: posArr, colors: colArr, sizes: sizeArr };
  }, [radius, reduced]);

  // Use the per-star size attribute. The former PointsMaterial ignored it,
  // leaving the 5,400-star sky as barely visible sub-pixel points.
  const material = useMemo(
    () => new THREE.ShaderMaterial({
      uniforms: { uOpacity: { value: 0.92 } },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = clamp(size * 4.0, 2.2, 13.0);
        }
      `,
      fragmentShader: `
        uniform float uOpacity;
        varying vec3 vColor;
        void main() {
          float r = length(gl_PointCoord - vec2(0.5));
          float halo = exp(-r * 8.5) * 0.52;
          float core = 1.0 - smoothstep(0.04, 0.2, r);
          float alpha = max(halo, core);
          vec3 color = mix(vColor * 0.78, min(vColor * 1.35 + vec3(0.12), vec3(1.0)), core);
          gl_FragColor = vec4(color, alpha * uOpacity);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending,
    }),
    [],
  );

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, [positions, colors, sizes]);

  useFrame(({ clock }) => {
    if (pointsRef.current && !reduced) {
      // Subtle twinkle — modulate overall opacity slightly
      const mat = pointsRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.uOpacity.value = 0.84 + Math.sin(clock.elapsedTime * 0.5) * 0.08;
    }
  });

  const onPointMove = (event: { index?: number; point: THREE.Vector3; stopPropagation: () => void }) => {
    const index = event.index;
    if (index == null) return;
    event.stopPropagation();
    const source = index < FIELD.length ? FIELD[index] : MILKY[index - FIELD.length];
    if (!source) return;
    setHoveredTarget(index < FIELD.length ? `catalog-star:${index}` : `milky-star:${index - FIELD.length}`);
    const len = Math.hypot(source.x, source.y, source.z) || 1;
    setHoveredStar((previous) => previous?.index === index ? previous : {
      index,
      position: [(source.x / len) * radius, (source.y / len) * radius, (source.z / len) * radius],
    });
  };
  const onPointClick = (event: { index?: number; point: THREE.Vector3; stopPropagation: () => void }) => {
    onPointMove(event);
    const index = event.index;
    if (index == null) return;
    const source = index < FIELD.length ? FIELD[index] : MILKY[index - FIELD.length];
    if (!source) return;
    toggleLockedTarget(index < FIELD.length ? `catalog-star:${index}` : `milky-star:${index - FIELD.length}`);
    const len = Math.hypot(source.x, source.y, source.z) || 1;
    setSelectedStar((previous) => previous?.index === index ? null : {
      index,
      position: [(source.x / len) * radius, (source.y / len) * radius, (source.z / len) * radius],
    });
  };
  const activeStar = hoveredStar ?? selectedStar;

  return (
    <>
      <points
        ref={pointsRef}
        geometry={geometry}
        material={material}
        frustumCulled={false}
        onPointerMove={onPointMove}
        onPointerOut={(event) => {
          setHoveredStar(null);
          if (event.index != null) clearHoveredTarget(event.index < FIELD.length ? `catalog-star:${event.index}` : `milky-star:${event.index - FIELD.length}`);
          document.body.style.cursor = "auto";
        }}
        onClick={onPointClick}
      />
      {activeStar && (() => {
        const source = activeStar.index < FIELD.length
          ? FIELD[activeStar.index]
          : MILKY[activeStar.index - FIELD.length];
        if (!source) return null;
        return (
          <Html center position={activeStar.position} distanceFactor={24} zIndexRange={[100, 0]} style={{ pointerEvents: "none" }}>
            <div className="w-52 rounded-lg border border-cyan-200/50 bg-slate-950/95 p-2.5 text-slate-100 shadow-[0_0_24px_rgba(90,190,255,0.22)] backdrop-blur">
              <div className="font-semibold">{activeStar.index < FIELD.length ? "Catalog star" : "Milky Way star"} · {activeStar.index + 1}</div>
              <div className="mt-1 font-mono text-[10px] text-cyan-200">Procedural sky object · visual class {source.spectral ?? "G"}</div>
              <div className="mt-1 text-[11px] text-slate-300">Move the reticle away to continue exploring; named stars show detailed information.</div>
            </div>
          </Html>
        );
      })()}
    </>
  );
}

/** Named bright stars — visible glow cores with forgiving hover/click targets. */
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
        return <NamedStarMarker key={star.id} star={star} position={pos} />;
      })}
    </group>
  );
}

function NamedStarMarker({ star, position }: { star: (typeof NAMED_STARS)[number]; position: [number, number, number] }) {
  const [hovered, setHovered] = useState(false);
  const [selected, setSelected] = useState(false);
  return (
    <group
      position={position}
      onPointerOver={(event) => { event.stopPropagation(); setHovered(true); setHoveredTarget(star.id); document.body.style.cursor = "help"; }}
      onPointerOut={() => { setHovered(false); clearHoveredTarget(star.id); document.body.style.cursor = "auto"; }}
    >
      <mesh>
        <sphereGeometry args={[2.2 + star.mag * 0.18, 16, 16]} />
        <meshBasicMaterial color={star.color} toneMapped={false} />
      </mesh>
      <mesh
        onPointerOver={(event) => { event.stopPropagation(); setHovered(true); document.body.style.cursor = "help"; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = "auto"; }}
        onClick={(event) => { event.stopPropagation(); setSelected((value) => !value); toggleLockedTarget(star.id); }}
      >
        <sphereGeometry args={[Math.max(5, 3.2 + star.mag * 0.45), 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
      {(hovered || selected) && (
        <Html center position={[0, 4.5, 0]} distanceFactor={22} zIndexRange={[100, 0]} style={{ pointerEvents: "none" }}>
          <div className="w-60 rounded-lg border border-cyan-200/50 bg-slate-950/95 p-3 text-slate-100 shadow-[0_0_24px_rgba(90,190,255,0.22)] backdrop-blur">
            <div className="font-semibold">{star.name}</div>
            <div className="mt-1 font-mono text-[11px] text-cyan-200">{star.constellation ?? "Star"} · {star.dist}</div>
            <div className="mt-2 text-xs text-slate-300">{star.blurb}</div>
            <div className="mt-1 text-[11px] text-slate-400">{star.fact}</div>
          </div>
        </Html>
      )}
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
