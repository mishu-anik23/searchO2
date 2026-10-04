import { useEffect, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { FIELD, MILKY, NAMED_STARS, CONSTELLATIONS, type ConstellationFigure } from "@/game/cosmos";
import { clearHoveredTarget, setHoveredTarget, toggleLockedTarget } from "./targetFocus";
import {
  setSelectedConstellation,
  subscribeFamilyAnimation,
  subscribeConstellation,
  stopFamilyAnimation,
  type FamilyAnimState,
} from "./constellationFocus";
import {
  getConstellationByName,
  getConstellationById,
  getFamily,
  getFamilyMembers,
} from "@/game/constellations";

function dirToPos(dir: { x: number; y: number; z: number }, radius: number): [number, number, number] {
  const len = Math.hypot(dir.x, dir.y, dir.z) || 1;
  return [(dir.x / len) * radius, (dir.y / len) * radius, (dir.z / len) * radius];
}

/** Dense background catalog stars. */
export function StarField3D({ radius = 500, reduced = false }: { radius?: number; reduced?: boolean }) {
  const [hoveredStar, setHoveredStar] = useState<{ index: number; position: [number, number, number] } | null>(null);

  const geometry = useMemo(() => {
    const stars = reduced ? FIELD.slice(0, Math.min(1200, FIELD.length)) : FIELD;
    const positions = new Float32Array(stars.length * 3);
    const colors = new Float32Array(stars.length * 3);
    const sizes = new Float32Array(stars.length);
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const len = Math.hypot(s.x, s.y, s.z) || 1;
      const r = radius * (0.85 + ((s.mag ?? 3) % 1) * 0.2);
      positions[i * 3] = (s.x / len) * r;
      positions[i * 3 + 1] = (s.y / len) * r;
      positions[i * 3 + 2] = (s.z / len) * r;
      colors[i * 3] = (s.cr ?? 230) / 255;
      colors[i * 3 + 1] = (s.cg ?? 220) / 255;
      colors[i * 3 + 2] = (s.cb ?? 200) / 255;
      sizes[i] = 1.2 + (s.mag ?? 3) * 0.35;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, [radius, reduced]);

  const milkyGeo = useMemo(() => {
    if (reduced) return null;
    const positions = new Float32Array(MILKY.length * 3);
    for (let i = 0; i < MILKY.length; i++) {
      const s = MILKY[i];
      const len = Math.hypot(s.x, s.y, s.z) || 1;
      const r = radius * 0.92;
      positions[i * 3] = (s.x / len) * r;
      positions[i * 3 + 1] = (s.y / len) * r;
      positions[i * 3 + 2] = (s.z / len) * r;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [radius, reduced]);

  return (
    <group>
      <points geometry={geometry}>
        <pointsMaterial
          size={2.2}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.9}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      {milkyGeo && (
        <points geometry={milkyGeo}>
          <pointsMaterial
            size={1.4}
            sizeAttenuation
            color="#c8d0e8"
            transparent
            opacity={0.35}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
    </group>
  );
}

/** Named bright stars — visible glow cores with forgiving hover/click targets. */
export function NamedStars3D({ radius = 450, visible = true }: { radius?: number; visible?: boolean }) {
  if (!visible) return null;
  return (
    <group>
      {NAMED_STARS.map((star) => {
        const position = dirToPos(star.dir, radius);
        return <NamedStarMarker key={star.id} star={star} position={position} />;
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
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
        setHoveredTarget(star.id);
        document.body.style.cursor = "help";
      }}
      onPointerOut={() => {
        setHovered(false);
        clearHoveredTarget(star.id);
        document.body.style.cursor = "auto";
      }}
    >
      <mesh>
        <sphereGeometry args={[2.0 + star.mag * 0.15, 12, 12]} />
        <meshBasicMaterial color={star.color} toneMapped={false} />
      </mesh>
      <mesh
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "help";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
        onClick={(event) => {
          event.stopPropagation();
          setSelected((value) => !value);
          toggleLockedTarget(star.id);
          const c = getConstellationByName(star.constellation);
          if (c) setSelectedConstellation(c.id);
        }}
      >
        <sphereGeometry args={[Math.max(4.5, 2.8 + star.mag * 0.4), 10, 10]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
      {(hovered || selected) && (
        <Html center position={[0, 4.2, 0]} distanceFactor={24} zIndexRange={[100, 0]} style={{ pointerEvents: "none" }}>
          <div className="w-56 rounded-lg border border-cyan-200/50 bg-slate-950/95 p-2.5 text-slate-100 shadow-[0_0_20px_rgba(90,190,255,0.2)] backdrop-blur">
            <div className="font-semibold text-sm">{star.name}</div>
            <div className="mt-0.5 font-mono text-[10px] text-cyan-200">
              {star.constellation ?? "Star"} · {star.dist}
            </div>
            <div className="mt-1 text-[11px] text-slate-300">{star.blurb}</div>
            <div className="mt-1 text-[10px] text-slate-400">{star.fact}</div>
          </div>
        </Html>
      )}
    </group>
  );
}


/**
 * Constellation figures on the deep sky.
 * Default: quiet (no clutter of empty edges).
 * Family select: progressive glow links between member centroids, then each stick figure draws in.
 * Only one family animation at a time.
 */
export function ConstellationLines3D({ radius = 280, visible = true }: { radius?: number; visible?: boolean }) {
  const [familyAnim, setFamilyAnim] = useState<FamilyAnimState | null>(null);
  const [tick, setTick] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const [solo, setSolo] = useState<string | null>(null);

  useEffect(() => subscribeFamilyAnimation(setFamilyAnim), []);
  useEffect(
    () =>
      subscribeConstellation((id) => {
        if (!id) {
          setSolo(null);
          return;
        }
        const byId = getConstellationById(id);
        if (byId) {
          setSolo(byId.name);
          return;
        }
        const byName = getConstellationByName(id);
        setSolo(byName ? byName.name : id);
      }),
    [],
  );

  // Drive progressive animation
  useFrame(() => {
    if (familyAnim?.holding) setTick((t) => t + 1);
  });

  const figures = useMemo(() => {
    if (!visible) return [] as FigBuilt[];
    const built: FigBuilt[] = [];
    for (const fig of CONSTELLATIONS) {
      const points: THREE.Vector3[] = [];
      for (const id of fig.ids) {
        const star = NAMED_STARS.find((s) => s.id === id);
        if (!star) continue;
        const [x, y, z] = dirToPos(star.dir, radius);
        points.push(new THREE.Vector3(x, y, z));
      }
      if (points.length === 0) continue;
      const centroid = points
        .reduce((a, p) => a.add(p.clone()), new THREE.Vector3())
        .multiplyScalar(1 / points.length);
      built.push({ fig, points, centroid });
    }
    return built;
  }, [radius, visible]);

  // Unique constellation -> primary figure (prefer multi-star)
  const byName = useMemo(() => {
    const map = new Map<string, FigBuilt>();
    for (const f of figures) {
      const prev = map.get(f.fig.constellation);
      if (!prev || f.points.length > prev.points.length) map.set(f.fig.constellation, f);
    }
    return map;
  }, [figures]);

  if (!visible) return null;

  const elapsed = familyAnim ? (performance.now() - familyAnim.startedAt) / 1000 : 0;

  // Family member order
  const familyMembers: string[] = familyAnim
    ? getFamilyMembers(familyAnim.familyId).map((m) => m.name)
    : [];

  // Phase 1: connect member centroids (0.35s each)
  const linkDuration = 0.4;
  const linksDone = familyAnim ? Math.min(familyMembers.length, Math.floor(elapsed / linkDuration) + 1) : 0;
  const linkPhaseDone = familyAnim ? elapsed >= familyMembers.length * linkDuration : false;

  // Phase 2: reveal stick figures one by one
  const figDuration = 0.55;
  const figStart = familyMembers.length * linkDuration;
  const figsRevealed = familyAnim && linkPhaseDone
    ? Math.min(familyMembers.length, Math.floor((elapsed - figStart) / figDuration) + 1)
    : 0;

  const openFig = (constellationName: string) => {
    setSolo(constellationName);
    const c = getConstellationByName(constellationName);
    if (c) setSelectedConstellation(c.id);
  };

  // Build family link polylines among centroids in order
  const linkPts: THREE.Vector3[] = [];
  if (familyAnim && linksDone > 0) {
    for (let i = 0; i < linksDone; i++) {
      const f = byName.get(familyMembers[i]);
      if (f) linkPts.push(f.centroid.clone());
    }
  }

  const showFigure = (name: string) => {
    if (solo === name) return true;
    if (!familyAnim) return false;
    const idx = familyMembers.indexOf(name);
    if (idx < 0) return false;
    return figsRevealed > idx;
  };

  const familyTitle = familyAnim ? getFamily(familyAnim.familyId).name : null;

  return (
    <group>
      {/* Family tour HUD chip */}
      {familyAnim && familyTitle && linkPts[0] && (
        <Html position={linkPts[0].toArray()} center distanceFactor={60} style={{ pointerEvents: "auto" }}>
          <div className="flex items-center gap-2 rounded-lg border border-amber-300/40 bg-slate-950/90 px-2.5 py-1.5 shadow-lg">
            <span className="font-mono text-[10px] uppercase tracking-wide text-amber-100">{familyTitle}</span>
            <span className="font-mono text-[9px] text-slate-400">
              {Math.min(figsRevealed, familyMembers.length)}/{familyMembers.length}
            </span>
            <button
              type="button"
              className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[9px] text-slate-200 hover:bg-white/20"
              onClick={() => stopFamilyAnimation()}
            >
              Close
            </button>
          </div>
        </Html>
      )}

      {/* Progressive family connector (glowed) */}
      {linkPts.length >= 2 && (
        <FamilyLinkLine points={linkPts} pulse={tick} />
      )}
      {linkPts.map((p, i) => (
        <mesh key={`link-node-${i}`} position={p}>
          <sphereGeometry args={[3.8, 12, 12]} />
          <meshBasicMaterial color="#e8c070" transparent opacity={0.95} />
        </mesh>
      ))}

      {/* Stick figures — only active solo or revealed family members */}
      {figures.map(({ fig, points, centroid }) => {
        if (!showFigure(fig.constellation)) return null;
        const isHot = hovered === fig.constellation || solo === fig.constellation;
        const lineObj = points.length >= 2 ? makeLine(points, isHot) : null;
        return (
          <group key={`${fig.name}-${fig.ids.join("-")}`}>
            {lineObj && <primitive object={lineObj} />}
            {points.map((p, i) => (
              <mesh
                key={i}
                position={p}
                onClick={(e) => {
                  e.stopPropagation();
                  openFig(fig.constellation);
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  setHovered(fig.constellation);
                  document.body.style.cursor = "pointer";
                }}
                onPointerOut={() => {
                  setHovered(null);
                  document.body.style.cursor = "auto";
                }}
              >
                <sphereGeometry args={[isHot ? 3.6 : 2.6, 8, 8]} />
                <meshBasicMaterial
                  color={isHot ? "#f0e6c0" : "#9fd0e8"}
                  transparent
                  opacity={isHot ? 1 : 0.75}
                />
              </mesh>
            ))}
            <Html position={centroid.toArray()} center distanceFactor={52} style={{ pointerEvents: "auto" }}>
              <button
                type="button"
                onClick={() => openFig(fig.constellation)}
                onMouseEnter={() => setHovered(fig.constellation)}
                onMouseLeave={() => setHovered(null)}
                className={`whitespace-nowrap rounded border px-1.5 py-0.5 font-mono text-[9px] tracking-wide ${
                  isHot
                    ? "border-amber-300/60 bg-slate-950/95 text-amber-50"
                    : "border-cyan-200/30 bg-slate-950/80 text-cyan-50"
                }`}
              >
                {fig.constellation}
              </button>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

type FigBuilt = {
  fig: ConstellationFigure;
  points: THREE.Vector3[];
  centroid: THREE.Vector3;
};

function makeLine(points: THREE.Vector3[], hot: boolean) {
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineBasicMaterial({
    color: hot ? 0xf0d78c : 0x9fd0e8,
    transparent: true,
    opacity: hot ? 0.95 : 0.7,
  });
  return new THREE.Line(geo, mat);
}

function FamilyLinkLine({ points, pulse }: { points: THREE.Vector3[]; pulse: number }) {
  const line = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: 0xe8c070,
      transparent: true,
      opacity: 0.85,
    });
    return new THREE.Line(geo, mat);
  }, [points.map((p) => `${p.x},${p.y},${p.z}`).join("|")]);

  useFrame(() => {
    const mat = line.material as THREE.LineBasicMaterial;
    mat.opacity = 0.55 + Math.sin(pulse * 0.15) * 0.25;
  });

  return <primitive object={line} />;
}
