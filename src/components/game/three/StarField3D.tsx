import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { FIELD, MILKY, NAMED_STARS, CONSTELLATIONS, raDecToDir } from "@/game/cosmos";
import { clearHoveredTarget, setHoveredTarget, toggleLockedTarget } from "./targetFocus";
import {
  CONSTELLATIONS_88,
  getConstellationById,
  getConstellationByName,
  getFamily,
  getFamilyMembers,
  type ConstellationEntry,
} from "@/game/constellations";
import {
  getConstellationFocusState,
  setRoamHighlight,
  setSelectedConstellation,
  subscribeConstellationFocus,
  type ConstellationFocusState,
} from "./constellationFocus";
import { globalFamilyRevealController } from "@/game/familyReveal/FamilyRevealController";

interface StarField3DProps {
  radius?: number;
  reduced?: boolean;
}

/** R3F star field using the FIELD (3600) + MILKY (1800) arrays from cosmos.ts. */
export function StarField3D({ radius = 300, reduced = false }: StarField3DProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const raycaster = useThree((state) => state.raycaster);
  const [hoveredStar, setHoveredStar] = useState<{ index: number; position: [number, number, number] } | null>(null);
  const [selectedStar, setSelectedStar] = useState<{ index: number; position: [number, number, number] } | null>(null);

  useEffect(() => {
    const previousThreshold = raycaster.params.Points.threshold;
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
        onPointerOut={() => {
          setHoveredStar(null);
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
            </div>
          </Html>
        );
      })()}
    </>
  );
}

/** Named bright stars — clickable targets that trigger Menzel constellation family animations. */
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
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
        setHoveredTarget(star.id);
        document.body.style.cursor = "help";
        const c = getConstellationByName(star.constellation);
        globalFamilyRevealController.setHoveredInfo({
          id: star.id,
          name: star.name,
          dist: star.dist,
          constellation: star.constellation ?? "Star",
          family: c ? c.familyName : "Milky Way",
        });
      }}
      onPointerOut={() => {
        setHovered(false);
        clearHoveredTarget(star.id);
        document.body.style.cursor = "auto";
        globalFamilyRevealController.setHoveredInfo(null);
      }}
    >
      <mesh>
        <sphereGeometry args={[2.2 + star.mag * 0.18, 16, 16]} />
        <meshBasicMaterial color={star.color} toneMapped={false} />
      </mesh>
      <mesh
        onPointerOver={(event) => { event.stopPropagation(); setHovered(true); document.body.style.cursor = "help"; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = "auto"; }}
        onClick={(event) => {
          event.stopPropagation();
          setSelected((value) => !value);
          toggleLockedTarget(star.id);
          // Find constellation and trigger sequential family grouping animation
          const c = getConstellationByName(star.constellation);
          if (c) {
            setSelectedConstellation(c.id);
            globalFamilyRevealController.selectConstellation(c.id);
          }
        }}
      >
        <sphereGeometry args={[Math.max(5, 3.2 + star.mag * 0.45), 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
      {(hovered || selected) && (
        <Html center position={[0, 4.5, 0]} distanceFactor={22} zIndexRange={[100, 0]} style={{ pointerEvents: "none" }}>
          <div className="w-60 rounded-lg border border-cyan-400/50 bg-slate-950/95 p-3 text-slate-100 shadow-[0_0_24px_rgba(0,229,255,0.3)] backdrop-blur">
            <div className="font-semibold text-white">{star.name}</div>
            <div className="mt-1 font-mono text-[11px] text-cyan-300">
              {star.constellation ?? "Star"} · {star.dist}
            </div>
            <div className="mt-1 text-xs text-slate-300">{star.blurb}</div>
            <div className="mt-1 text-[10px] text-cyan-200/80">Click star to illuminate {star.constellation} family myth ↗</div>
          </div>
        </Html>
      )}
    </group>
  );
}

function SimpleLine({
  geometry,
  color,
  opacity,
  linewidth = 1,
}: {
  geometry: THREE.BufferGeometry;
  color: string;
  opacity: number;
  linewidth?: number;
}) {
  const lineObj = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity, linewidth });
    return new THREE.Line(geometry, mat);
  }, [geometry, color, opacity, linewidth]);
  return <primitive object={lineObj} />;
}

/**
 * Enhanced 88-Constellation Engine:
 * - Roam / Drag Auto-Visualization: Automatically visualizes constellations entering the camera forward gaze.
 * - Sequential Group Family Myth Visual Animation: When a star or constellation is clicked,
 *   illuminates all sibling constellations in its Menzel family sequentially one after another!
 */
export function ConstellationLines3D({ radius = 280, visible = true }: { radius?: number; visible?: boolean }) {
  const [focusState, setFocusState] = useState<ConstellationFocusState>(getConstellationFocusState());
  const cameraDir = useRef(new THREE.Vector3());
  const lastRoamCheck = useRef(0);

  useEffect(() => {
    return subscribeConstellationFocus((s) => setFocusState(s));
  }, []);

  // Pre-calculate 3D center positions for all 88 constellations
  const constellationCenters = useMemo(() => {
    return CONSTELLATIONS_88.map((c) => {
      const dir = raDecToDir(c.centerRa, c.centerDec);
      const len = Math.hypot(dir.x, dir.y, dir.z) || 1;
      return {
        id: c.id,
        name: c.name,
        familyName: c.familyName,
        familyId: c.familyId,
        vec: new THREE.Vector3(dir.x / len, dir.y / len, dir.z / len),
        pos: new THREE.Vector3((dir.x / len) * radius, (dir.y / len) * radius, (dir.z / len) * radius),
      };
    });
  }, [radius]);

  // Frame loop: Detect when camera is pointing toward a constellation during drag / roam
  useFrame(({ camera, clock }) => {
    const now = clock.elapsedTime;
    if (now - lastRoamCheck.current < 0.1) return;
    lastRoamCheck.current = now;

    // If the user already locked a specific constellation, preserve it
    if (focusState.selectedId) return;

    camera.getWorldDirection(cameraDir.current);

    let bestId: string | null = null;
    let maxDot = 0.925; // ~22 degrees forward cone

    for (const c of constellationCenters) {
      const dot = cameraDir.current.dot(c.vec);
      if (dot > maxDot) {
        maxDot = dot;
        bestId = c.id;
      }
    }

    if (bestId !== focusState.roamHighlightedId) {
      setRoamHighlight(bestId);
    }
  });

  if (!visible) return null;

  const activeId = focusState.selectedId || focusState.roamHighlightedId;
  const activeConstellation = activeId ? getConstellationById(activeId) : null;
  const revealedIds = focusState.revealedConstellations;

  return (
    <group>
      {/* 1. Base Major Sky Asterisms (Orion Belt, Summer Triangle, etc.) */}
      {CONSTELLATIONS.map((c, i) => {
        const pts: THREE.Vector3[] = [];
        for (const id of c.ids) {
          const star = NAMED_STARS.find((s) => s.id === id);
          if (!star) continue;
          const len = Math.hypot(star.dir.x, star.dir.y, star.dir.z) || 1;
          pts.push(new THREE.Vector3((star.dir.x / len) * radius, (star.dir.y / len) * radius, (star.dir.z / len) * radius));
        }
        if (pts.length < 2) return null;
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        return (
          <SimpleLine key={`base-${i}`} geometry={geo} color="#38bdf8" opacity={0.18} />
        );
      })}

      {/* 2. Roam-Highlighted Constellation (Gaze Detection while dragging) */}
      {!focusState.selectedId && activeConstellation && (
        <ConstellationFigure3D
          constellation={activeConstellation}
          radius={radius}
          color="#00E5FF"
          opacity={0.65}
          showBadge={true}
        />
      )}

      {/* 3. Sequential Group Family Myth Visual Animation */}
      {focusState.activeFamilyId && revealedIds.map((cid, seqIdx) => {
        const c = getConstellationById(cid);
        if (!c) return null;
        const isAnchor = cid === focusState.selectedId;
        return (
          <ConstellationFigure3D
            key={`seq-${cid}-${seqIdx}`}
            constellation={c}
            radius={radius}
            color={isAnchor ? "#00E5FF" : "#38BDF8"}
            opacity={isAnchor ? 0.95 : 0.75}
            showBadge={isAnchor}
            pulse={true}
          />
        );
      })}

      {/* 4. Family Celestial Bridge Lines: Connecting Key Stars of Revealed Siblings */}
      {focusState.activeFamilyId && revealedIds.length > 1 && (
        <FamilyMythBonds3D
          revealedIds={revealedIds}
          radius={radius}
        />
      )}
    </group>
  );
}

/** Draws the 3D stick-figure line segments and star nodes of a specific constellation. */
function ConstellationFigure3D({
  constellation,
  radius,
  color,
  opacity,
  showBadge,
  pulse = false,
}: {
  constellation: ConstellationEntry;
  radius: number;
  color: string;
  opacity: number;
  showBadge?: boolean;
  pulse?: boolean;
}) {
  const { linesGeos, starPositions, centerPos } = useMemo(() => {
    const starPosList: THREE.Vector3[] = [];
    for (const st of constellation.stars) {
      const dir = raDecToDir(st.ra, st.dec);
      const len = Math.hypot(dir.x, dir.y, dir.z) || 1;
      starPosList.push(new THREE.Vector3((dir.x / len) * radius, (dir.y / len) * radius, (dir.z / len) * radius));
    }

    const cDir = raDecToDir(constellation.centerRa, constellation.centerDec);
    const cLen = Math.hypot(cDir.x, cDir.y, cDir.z) || 1;
    const center = new THREE.Vector3((cDir.x / cLen) * radius, (cDir.y / cLen) * radius, (cDir.z / cLen) * radius);

    const segments: THREE.BufferGeometry[] = [];
    for (const [i1, i2] of constellation.lines) {
      if (starPosList[i1] && starPosList[i2]) {
        const geo = new THREE.BufferGeometry().setFromPoints([starPosList[i1], starPosList[i2]]);
        segments.push(geo);
      }
    }

    return { linesGeos: segments, starPositions: starPosList, centerPos: center };
  }, [constellation, radius]);

  return (
    <group>
      {/* Stick-figure Line Segments */}
      {linesGeos.map((geo, idx) => (
        <SimpleLine key={`fig-line-${idx}`} geometry={geo} color={color} opacity={opacity} linewidth={2} />
      ))}

      {/* Glowing Star Vertex Nodes */}
      {starPositions.map((pos, sidx) => (
        <mesh key={`node-${sidx}`} position={pos}>
          <sphereGeometry args={[pulse ? 1.6 : 1.2, 8, 8]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      ))}

      {/* In-Space 3D Hover/Gaze Badge */}
      {showBadge && (
        <Html center position={centerPos} distanceFactor={28} zIndexRange={[90, 0]} style={{ pointerEvents: "none" }}>
          <div className="rounded-full border border-cyan-400/60 bg-slate-950/90 px-3 py-1 text-center font-mono text-[10px] font-semibold text-cyan-200 shadow-[0_0_20px_rgba(0,229,255,0.4)] backdrop-blur">
            ⟡ {constellation.name.toUpperCase()} · {constellation.familyName}
          </div>
        </Html>
      )}
    </group>
  );
}

/** Draws glowing inter-constellation mythic bond lines between sibling key stars in the active family. */
function FamilyMythBonds3D({ revealedIds, radius }: { revealedIds: string[]; radius: number }) {
  const bondGeos = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (const id of revealedIds) {
      const c = getConstellationById(id);
      if (!c) continue;
      const dir = raDecToDir(c.centerRa, c.centerDec);
      const len = Math.hypot(dir.x, dir.y, dir.z) || 1;
      pts.push(new THREE.Vector3((dir.x / len) * radius, (dir.y / len) * radius, (dir.z / len) * radius));
    }
    if (pts.length < 2) return null;
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [revealedIds, radius]);

  if (!bondGeos) return null;

  return (
    <SimpleLine geometry={bondGeos} color="#f59e0b" opacity={0.45} linewidth={1.5} />
  );
}
