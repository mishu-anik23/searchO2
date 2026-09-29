import { useRef, useEffect, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGame } from "@/game/store";
import {
  ASTEROIDS,
  AU,
  BODIES,
  FIELD,
  GALAXIES,
  LESSONS,
  MILKY,
  NAMED_STARS,
  angOf,
  azElFromCam,
  bodyTexture,
  formatRange,
  hohmannEllipse,
  orbitSpeedHint,
  photoOf,
  pickLesson,
  posOf,
  startPose,
  transferPath,
  warmupPhotos,
  type LessonId,
  type SkyBody,
  type V,
} from "@/game/cosmos";
import {
  FPV_RATE_PER_SEC,
  TRANSFER,
  navFromProgress,
  type DestinationId,
} from "@/game/data";
import { formatEta, formatKm, formatUsd } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { CockpitDashboard, type HudSnap, type TargetInfo } from "./CockpitGauges";
import { StarField3D } from "./StarField3D";
import { CelestialBody, OrbitPaths } from "./CelestialBody";
import { GalaxySprites } from "./GalaxySprite";

/* ---------- Quaternion math (preserved from FPVView) ---------- */
type Q = { x: number; y: number; z: number; w: number };

function qMul(a: Q, b: Q): Q {
  return {
    x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
    y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
    z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
    w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
  };
}
function qNorm(q: Q) {
  const n = Math.hypot(q.x, q.y, q.z, q.w) || 1;
  q.x /= n; q.y /= n; q.z /= n; q.w /= n;
}
function qEulerYXZ(x: number, y: number, z: number): Q {
  const c1 = Math.cos(x / 2), s1 = Math.sin(x / 2);
  const c2 = Math.cos(y / 2), s2 = Math.sin(y / 2);
  const c3 = Math.cos(z / 2), s3 = Math.sin(z / 2);
  return {
    x: s1 * c2 * c3 + c1 * s2 * s3,
    y: c1 * s2 * c3 - s1 * c2 * s3,
    z: c1 * c2 * s3 - s1 * s2 * c3,
    w: c1 * c2 * c3 + s1 * s2 * s3,
  };
}
function yawFromQuat(q: Q) {
  const sinp = 2 * (q.w * q.x - q.y * q.z);
  if (Math.abs(sinp) < 0.9999999) {
    return Math.atan2(2 * (q.w * q.y + q.z * q.x), 1 - 2 * (q.x * q.x + q.y * q.y));
  }
  return Math.atan2(2 * (q.y * q.w - q.x * q.z), 1 - 2 * (q.y * q.y + q.z * q.z));
}
function rotate(q: Q, v: V): V {
  const tx = 2 * (q.y * v.z - q.z * v.y);
  const ty = 2 * (q.z * v.x - q.x * v.z);
  const tz = 2 * (q.x * v.y - q.y * v.x);
  return {
    x: v.x + q.w * tx + (q.y * tz - q.z * ty),
    y: v.y + q.w * ty + (q.z * tx - q.x * tz),
    z: v.z + q.w * tz + (q.x * ty - q.y * tx),
  };
}
function qConj(q: Q): Q {
  return { x: -q.x, y: -q.y, z: -q.z, w: q.w };
}

/* ---------- Input handling (preserved from FPVView) ---------- */
const held = new Set<string>();
let injected: string[] | null = null;
let steerOverride: number | null = null;
const look = { dx: 0, dy: 0 };
const pointer = { x: 0.5, y: 0.5, active: false };

function codesHas(code: string) {
  if (injected) return injected.includes(code);
  return held.has(code);
}

/* ---------- HUD types (preserved from FPVView) ---------- */

const hudListeners = new Set<(h: HudSnap) => void>();
function publishHud(h: HudSnap) {
  for (const fn of hudListeners) fn(h);
}

/* ---------- Ship state (module-level for physics loop) ---------- */
interface ShipState {
  pos: V; vel: V; quat: Q; yaw: number; travelled: number; prevPos: V;
}

/* ---------- 3D Scene Content ---------- */

function SceneContent({
  ship, simTRef, destination,
}: {
  ship: React.MutableRefObject<ShipState>;
  simTRef: React.MutableRefObject<number>;
  destination: DestinationId;
}) {
  const { camera } = useThree();
  const trailRef = useRef<THREE.Line>(null);
  const corridorRef = useRef<THREE.Line>(null);
  const trailPoints = useRef<V[]>([]);
  const trailAcc = useRef(0);
  const hudAt = useRef(0);
  const billAcc = useRef(0);
  const lastTime = useRef(performance.now());

  // Setup keyboard/mouse/pointer input
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      held.add(e.code);
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
    };
    const up = (e: KeyboardEvent) => held.delete(e.code);
    const blur = () => held.clear();
    const move = (e: MouseEvent) => {
      if (document.pointerLockElement) {
        look.dx += e.movementX;
        look.dy += e.movementY;
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    document.addEventListener("mousemove", move);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
      document.removeEventListener("mousemove", move);
      held.clear();
      injected = null;
      try { if (document.pointerLockElement) document.exitPointerLock(); } catch { /* */ }
    };
  }, []);

  // Pointer lock on canvas click
  const onPointerDown = (e: React.PointerEvent) => {
    pointer.active = true;
    try { (e.target as HTMLElement).requestPointerLock?.(); } catch { /* */ }
  };

  useFrame((state) => {
    const now = state.clock.elapsedTime * 1000;
    const dt = Math.min((now - lastTime.current) / 1000, 0.1);
    lastTime.current = now;

    if (document.hidden) return;

    const s = ship.current;
    simTRef.current += dt;
    const simT = simTRef.current;

    // Billing
    billAcc.current += dt;
    if (billAcc.current >= 0.25) {
      useGame.getState().billFpv(billAcc.current);
      billAcc.current = 0;
    }

    // --- Input processing (preserved from FPVView) ---
    let yawCmd = 0;
    if (codesHas("KeyA") || codesHas("ArrowLeft")) yawCmd += 1;
    if (codesHas("KeyD") || codesHas("ArrowRight")) yawCmd -= 1;
    if (steerOverride != null) yawCmd = steerOverride;

    let pitchCmd = 0;
    if (codesHas("KeyR") || codesHas("ArrowUp")) pitchCmd += 1;
    if (codesHas("KeyF") || codesHas("ArrowDown")) pitchCmd -= 1;
    let rollCmd = 0;
    if (codesHas("KeyQ")) rollCmd += 1;
    if (codesHas("KeyE")) rollCmd -= 1;

    const yawMouse = -look.dx * 0.0018;
    const pitchMouse = -look.dy * 0.0018;
    look.dx = 0; look.dy = 0;

    const turn = 1.15;
    s.quat = qMul(s.quat, qEulerYXZ(pitchCmd * turn * dt + pitchMouse, yawCmd * turn * dt + yawMouse, rollCmd * turn * dt));
    qNorm(s.quat);

    if (codesHas("KeyZ")) {
      const k = 1 - Math.exp(-3.2 * dt);
      s.quat.x += (0 - s.quat.x) * k;
      s.quat.y += (0 - s.quat.y) * k;
      s.quat.z += (0 - s.quat.z) * k;
      s.quat.w += (1 - s.quat.w) * k;
      qNorm(s.quat);
    }

    const f = rotate(s.quat, { x: 0, y: 0, z: -1 });
    const u = rotate(s.quat, { x: 0, y: 1, z: 0 });
    let thrust = 0;
    if (codesHas("KeyW")) thrust += 1;
    if (codesHas("KeyS")) thrust -= 1;
    const boost = codesHas("ShiftLeft") || codesHas("ShiftRight") ? 2.4 : 1;
    const acc = thrust * 18 * boost * dt;
    s.vel.x += f.x * acc; s.vel.y += f.y * acc; s.vel.z += f.z * acc;

    if (codesHas("Space")) {
      s.vel.x += u.x * 14 * dt; s.vel.y += u.y * 14 * dt; s.vel.z += u.z * 14 * dt;
    }
    if (codesHas("KeyC") || codesHas("ControlLeft")) {
      s.vel.x -= u.x * 14 * dt; s.vel.y -= u.y * 14 * dt; s.vel.z -= u.z * 14 * dt;
    }

    // Gravity from Sun (and Earth for Moon runs)
    const sunP = { x: 0, y: 0, z: 0 };
    const sunDir = { x: sunP.x - s.pos.x, y: sunP.y - s.pos.y, z: sunP.z - s.pos.z };
    const sunDist = Math.hypot(sunDir.x, sunDir.y, sunDir.z) || 1;
    const gSun = 2200 / (sunDist * sunDist);
    s.vel.x += (sunDir.x / sunDist) * gSun * dt;
    s.vel.y += (sunDir.y / sunDist) * gSun * dt;
    s.vel.z += (sunDir.z / sunDist) * gSun * dt;

    if (destination === "moon") {
      const earthP = posOf("earth", simT, new Map());
      const ed = { x: earthP.x - s.pos.x, y: earthP.y - s.pos.y, z: earthP.z - s.pos.z };
      const edist = Math.hypot(ed.x, ed.y, ed.z) || 1;
      if (edist < 45) {
        const gE = 580 / (edist * edist);
        s.vel.x += (ed.x / edist) * gE * dt;
        s.vel.y += (ed.y / edist) * gE * dt;
        s.vel.z += (ed.z / edist) * gE * dt;
      }
    }

    // Damping (X = brake)
    if (codesHas("KeyX")) {
      const k = 1 - Math.exp(-2.5 * dt);
      s.vel.x *= 1 - k; s.vel.y *= 1 - k; s.vel.z *= 1 - k;
    }

    // Integrate position
    s.prevPos = { ...s.pos };
    s.pos.x += s.vel.x * dt; s.pos.y += s.vel.y * dt; s.pos.z += s.vel.z * dt;
    s.travelled += Math.hypot(s.vel.x, s.vel.y, s.vel.z) * dt;
    s.yaw = yawFromQuat(s.quat);

    // Trail
    trailAcc.current += dt;
    if (trailAcc.current > 0.08) {
      trailAcc.current = 0;
      trailPoints.current.push({ ...s.pos });
      if (trailPoints.current.length > 200) trailPoints.current.shift();
      if (trailRef.current) {
        const geo = trailRef.current.geometry as THREE.BufferGeometry;
        const positions = new Float32Array(trailPoints.current.length * 3);
        for (let i = 0; i < trailPoints.current.length; i++) {
          positions[i * 3] = trailPoints.current[i].x;
          positions[i * 3 + 1] = trailPoints.current[i].y;
          positions[i * 3 + 2] = trailPoints.current[i].z;
        }
        geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geo.attributes.position.needsUpdate = true;
        geo.setDrawRange(0, trailPoints.current.length);
      }
    }

    // Update camera to follow ship orientation
    camera.position.set(s.pos.x, s.pos.y, s.pos.z);
    camera.quaternion.set(s.quat.x, s.quat.y, s.quat.z, s.quat.w);

    // --- HUD computation (preserved from FPVView) ---
    hudAt.current += dt;
    if (hudAt.current < 0.06) return;
    hudAt.current = 0;

    const cache = new Map<string, V>();
    const corridor = transferPath(destination, simT, 48);
    let minPath = 1e9;
    let pathPct = 0;
    for (let i = 0; i < corridor.length; i++) {
      const d = Math.hypot(corridor[i].x - s.pos.x, corridor[i].y - s.pos.y, corridor[i].z - s.pos.z);
      if (d < minPath) { minPath = d; pathPct = i / Math.max(1, corridor.length - 1); }
    }
    const drifted = minPath > 28;

    const earth = posOf("earth", simT, cache);
    const destP = posOf(destination, simT, cache);
    const sunP2 = { x: 0, y: 0, z: 0 };
    const au = Math.hypot(s.pos.x - sunP2.x, s.pos.y - sunP2.y, s.pos.z - sunP2.z) / AU;
    const nav = navFromProgress(destination, pathPct);

    const earthDistU = Math.hypot(s.pos.x - earth.x, s.pos.y - earth.y, s.pos.z - earth.z);
    const destDistU = Math.hypot(s.pos.x - destP.x, s.pos.y - destP.y, s.pos.z - destP.z);
    const scaleKm = destination === "moon" ? 384400 / 16 : 1.496e8 / AU;
    const travelledKmSim = s.travelled * scaleKm;
    const travelledKm = pathPct > 0.02 ? nav.travelledKm * 0.65 + travelledKmSim * 0.35 : travelledKmSim;
    const remainKm = Math.max(0, nav.totalKm - travelledKm);

    const destCam = rotate(qConj(s.quat), { x: destP.x - s.pos.x, y: destP.y - s.pos.y, z: destP.z - s.pos.z });
    const destAzEl = azElFromCam(destCam);

    const metHours = nav.totalHours * pathPct;
    const phase = destination === "mars"
      ? pathPct < 0.08 ? "Departure burn" : pathPct > 0.92 ? "Approach / capture" : "Heliocentric transfer"
      : pathPct < 0.1 ? "TLI burn" : pathPct > 0.9 ? "LOI approach" : "Translunar coast";

    const lesson = pickLesson({ dest: destination, thrusting: thrust !== 0, drifted, looking: null });

    // Find nearest target
    const inv = qConj(s.quat);
    const fl = 1; // not used for 3D but kept for computation
    const drawn: { body: SkyBody; dist: number }[] = [];
    for (const body of BODIES) {
      const p = posOf(body.id, simT, cache);
      const dist = Math.hypot(p.x - s.pos.x, p.y - s.pos.y, p.z - s.pos.z);
      drawn.push({ body, dist });
    }
    drawn.sort((a, b) => a.dist - b.dist);

    // Simple target: nearest body
    let target: TargetInfo | null = null;
    if (drawn.length > 0) {
      const nearest = drawn[0];
      target = {
        id: nearest.body.id, name: nearest.body.name, kind: nearest.body.kind,
        blurb: nearest.body.blurb, fact: nearest.body.fact, dist: nearest.body.dist,
        range: formatRange(nearest.dist, destination),
      };
    }

    publishHud({
      speed: Math.hypot(s.vel.x, s.vel.y, s.vel.z),
      yaw: s.yaw,
      thrust,
      boost: boost > 1,
      target,
      lesson,
      drifted,
      pathPct,
      au,
      travelledKm,
      remainKm,
      etaHours: Math.max(0, nav.totalHours * (1 - pathPct)),
      vKms: nav.vKms,
      targetAz: destAzEl.az,
      targetEl: destAzEl.el,
      distEarth: earthDistU * scaleKm,
      distTarget: destDistU * scaleKm,
      metHours,
      phase,
    });
  });

  // Build corridor geometry
  const corridorGeo = useMemo(() => {
    const corridor = transferPath(destination, 0, 48);
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(corridor.length * 3);
    for (let i = 0; i < corridor.length; i++) {
      positions[i * 3] = corridor[i].x;
      positions[i * 3 + 1] = corridor[i].y;
      positions[i * 3 + 2] = corridor[i].z;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [destination]);

  // Trail geometry
  const trailGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(200 * 3), 3));
    geo.setDrawRange(0, 0);
    return geo;
  }, []);

  return (
    <>
      {/* Star field — reuse existing StarField3D */}
      <StarField3D />

      {/* Planets — reuse existing CelestialBody */}
      {BODIES.filter(b => b.orbit && !b.parent).map(body => (
        <CelestialBody key={body.id} body={body} simTime={simTRef.current} />
      ))}

      {/* Moon (child of Earth) */}
      <CelestialBody body={BODIES.find(b => b.id === "moon")!} simTime={simTRef.current} />

      {/* Orbit rings */}
      <OrbitPaths />

      {/* Galaxies */}
      <GalaxySprites />

      {/* Transfer corridor */}
      <primitive object={new THREE.Line(corridorGeo, new THREE.LineDashedMaterial({ color: 0x7eb8c9, dashSize: 1.5, gapSize: 1, transparent: true, opacity: 0.7 }))} />

      {/* Ship trail */}
      <primitive ref={trailRef} object={new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ color: 0xe8edf4, transparent: true, opacity: 0.35 }))} />

      {/* Burn markers */}
      <BurnMarker destination={destination} simT={simTRef.current} />

      {/* Asteroid belt */}
      <AsteroidBelt3D />
    </>
  );
}

/* ---------- Burn markers ---------- */
function BurnMarker({ destination, simT }: { destination: DestinationId; simT: number }) {
  const corridor = useMemo(() => transferPath(destination, simT, 48), [destination, simT]);
  if (!corridor.length) return null;
  const start = corridor[0];
  const end = corridor[corridor.length - 1];
  return (
    <>
      <mesh position={[start.x, start.y, start.z]}>
        <octahedronGeometry args={[0.8]} />
        <meshBasicMaterial color="#c9a86f" />
      </mesh>
      <mesh position={[end.x, end.y, end.z]}>
        <octahedronGeometry args={[0.8]} />
        <meshBasicMaterial color="#c9a86f" />
      </mesh>
    </>
  );
}

/* ---------- Asteroid belt (simplified for cockpit) ---------- */
function AsteroidBelt3D() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = ASTEROIDS.length;
  const geo = useMemo(() => new THREE.DodecahedronGeometry(0.3, 0), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#b4aa9b", roughness: 0.8 }), []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const rock = ASTEROIDS[i];
      // Rotate around sun based on position
      const baseAng = Math.atan2(rock.z, rock.x);
      const ang = baseAng + t * 0.01;
      const rad = Math.hypot(rock.x, rock.z);
      dummy.position.set(Math.cos(ang) * rad, rock.y, Math.sin(ang) * rad);
      dummy.rotation.set(0, ang, 0);
      dummy.scale.setScalar(rock.r * 2);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={ref} args={[geo, mat, count]} />;
}

/* ---------- Cockpit HUD overlay (flat fallback buttons) ---------- */
function CockpitHudOverlay({ destination }: { destination: DestinationId }) {
  const closeFpv = useGame((s) => s.closeFpv);
  const beginLanding = useGame((s) => s.beginLanding);
  const credits = useGame((s) => s.credits);
  const [hud, setHud] = useState<HudSnap>({
    speed: 8, yaw: 0, thrust: 0, boost: false, target: null,
    lesson: destination === "mars" ? "hohmann" : "visviva",
    drifted: false, pathPct: 0, au: 1, travelledKm: 0,
    remainKm: TRANSFER[destination].km, etaHours: TRANSFER[destination].hours,
    vKms: TRANSFER[destination].vKms, targetAz: 0, targetEl: 0,
    distEarth: 0, distTarget: TRANSFER[destination].km, metHours: 0,
    phase: destination === "mars" ? "Heliocentric transfer" : "Translunar coast",
  });

  useEffect(() => {
    hudListeners.add(setHud);
    return () => { hudListeners.delete(setHud); };
  }, []);

  useEffect(() => {
    if (hud.target) {
      const map: Record<string, string> = {
        mars: "distance", moon: "distance", earth: "why-oxygen",
        sun: "orbits", andromeda: "orbits", jupiter: "orbits", saturn: "orbits",
      };
      const id = map[hud.target.id];
      if (id) useGame.getState().markTopic(id);
    }
    useGame.getState().markTopic(LESSONS[hud.lesson].libraryId);
  }, [hud.target, hud.lesson]);

  const near = hud.remainKm / TRANSFER[destination].km < 0.12;

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="rounded-md border border-border bg-bg/80 px-3 py-2">
            <p className="font-mono text-xs tabular-nums text-accent">
              {formatUsd(credits)} · {formatUsd(FPV_RATE_PER_SEC)}/s
            </p>
            <p className="font-mono text-xs text-muted">
              {hud.speed.toFixed(1)} u/s · {hud.au.toFixed(2)} AU from Sun · yaw{" "}
              {hud.yaw >= 0 ? "+" : ""}{((hud.yaw * 180) / Math.PI).toFixed(0)}°
              {hud.thrust !== 0 ? (hud.boost ? " · BOOST" : " · BURN") : " · COAST"}
              {hud.drifted ? " · off corridor" : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button
            className="pointer-events-auto"
            variant="secondary"
            onClick={() => {
              try { if (document.pointerLockElement) document.exitPointerLock(); } catch { /* */ }
              closeFpv();
            }}
          >
            <X className="size-4" /> Exit camera
          </Button>
          <Button
            className="pointer-events-auto"
            variant={near ? "primary" : "secondary"}
            onClick={() => {
              try { if (document.pointerLockElement) document.exitPointerLock(); } catch { /* */ }
              beginLanding();
            }}
          >
            {near ? "Begin landing" : "Skip to landing"}
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <p className="hidden max-w-xs text-[11px] text-muted sm:block">
          Reticle auto-locks worlds on the path. W/S thrust · A/D yaw (A left) · drag to look · Z damp · X brake
        </p>
      </div>
    </div>
  );
}

/* ---------- Main CockpitScene component ---------- */
export function CockpitScene({ destination }: { destination: DestinationId }) {
  const shipRef = useRef<ShipState>({
    pos: { ...startPose(destination).pos },
    vel: { ...startPose(destination).vel },
    quat: qEulerYXZ(startPose(destination).pitch, 0, 0),
    yaw: 0,
    travelled: 0,
    prevPos: { ...startPose(destination).pos },
  });
  qNorm(shipRef.current.quat);
  const simTRef = useRef(0);
  const [hud, setHud] = useState<HudSnap>({
    speed: 8, yaw: 0, thrust: 0, boost: false, target: null,
    lesson: destination === "mars" ? "hohmann" : "visviva",
    drifted: false, pathPct: 0, au: 1, travelledKm: 0,
    remainKm: TRANSFER[destination].km, etaHours: TRANSFER[destination].hours,
    vKms: TRANSFER[destination].vKms, targetAz: 0, targetEl: 0,
    distEarth: 0, distTarget: TRANSFER[destination].km, metHours: 0,
    phase: destination === "mars" ? "Heliocentric transfer" : "Translunar coast",
  });

  useEffect(() => {
    hudListeners.add(setHud);
    return () => { hudListeners.delete(setHud); };
  }, []);

  useEffect(() => {
    warmupPhotos();
    window.__controlsTest = {
      getYaw: () => shipRef.current.yaw,
      getSpeed: () => Math.hypot(shipRef.current.vel.x, shipRef.current.vel.y, shipRef.current.vel.z),
      setKeys: (codes: string[]) => { injected = codes; },
      setSteer: (v: number) => { steerOverride = v; },
    };
    return () => { delete window.__controlsTest; };
  }, []);

  return (
    <div className="fixed inset-0 z-40 bg-bg" style={{ touchAction: "none" }}>
      <Canvas
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ fov: 62, near: 0.01, far: 10000, position: [0, 0, 0] }}
      >
        <SceneContent ship={shipRef} simTRef={simTRef} destination={destination} />
        <CockpitDashboard
          hud={hud}
          destination={destination}
          simT={simTRef.current}
          shipQuat={shipRef.current.quat}
        />
      </Canvas>
      <CockpitHudOverlay destination={destination} />
    </div>
  );
}

/* ---------- Re-export for FPVView compatibility ---------- */
export { CockpitHudOverlay as Hud };
