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
import type { HudSnap, TargetInfo } from "./CockpitGauges";
import { NamedStars3D, StarField3D } from "./StarField3D";
import { FamilyShapeOverlay } from "./FamilyShapeOverlay";
import { FamilyRevealHud } from "../FamilyRevealHud";
import { globalFamilyRevealController } from "@/game/familyReveal/FamilyRevealController";
import { ConstellationPanel } from "../ConstellationPanel";
import { CelestialBody, OrbitPaths } from "./CelestialBody";
import { GalaxySprites } from "./GalaxySprite";
import { getTargetFocus, resetTargetFocus } from "./targetFocus";

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
/** True while primary button is held for drag-look (no pointer-lock required). */
let dragLooking = false;
/** Observe mode: soft station-keeping near the Sun / transfer (Key V toggles). */
let observeMode = true;

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

  // Setup keyboard/mouse — drag-to-look works WITHOUT pointer lock so the
  // OS cursor stays visible for planet hover + click-to-lock.
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      held.add(e.code);
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
      // V = toggle observe / free-fly
      if (e.code === "KeyV" && !e.repeat) observeMode = !observeMode;
    };
    const up = (e: KeyboardEvent) => held.delete(e.code);
    const blur = () => {
      held.clear();
      dragLooking = false;
    };
    const move = (e: MouseEvent) => {
      // Pointer-lock FPS look (optional, from middle-click)
      if (document.pointerLockElement) {
        look.dx += e.movementX;
        look.dy += e.movementY;
        return;
      }
      // Drag look with left/right button held — cursor still visible
      if (dragLooking) {
        look.dx += e.movementX;
        look.dy += e.movementY;
      }
    };
    const upMouse = () => {
      dragLooking = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", upMouse);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", upMouse);
      held.clear();
      injected = null;
      dragLooking = false;
      try { if (document.pointerLockElement) document.exitPointerLock(); } catch { /* */ }
    };
  }, []);

  useFrame((state) => {
    // Keep one clock source. Mixing performance.now() for the initial value
    // with Three's elapsed clock made the first delta hugely negative and
    // flung the ship/camera out of the solar system before the first render.
    const now = performance.now();
    const dt = Math.min(Math.max((now - lastTime.current) / 1000, 0), 0.1);
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

    // Damping (X = brake) — hold to stop and observe the solar system
    if (codesHas("KeyX")) {
      const k = 1 - Math.exp(-2.8 * dt);
      s.vel.x *= 1 - k; s.vel.y *= 1 - k; s.vel.z *= 1 - k;
    }

    // Observe mode (default ON, toggle with V): soft station-keeping so you
    // don't coast out into empty deep sky while studying planets.
    if (observeMode && thrust === 0 && !codesHas("Space") && !codesHas("KeyC") && !codesHas("ControlLeft")) {
      const k = 1 - Math.exp(-1.1 * dt);
      s.vel.x *= 1 - k;
      s.vel.y *= 1 - k;
      s.vel.z *= 1 - k;
      // Cancel most solar gravity so you can "park" on the transfer path
      s.vel.x -= (sunDir.x / sunDist) * gSun * dt * 0.85;
      s.vel.y -= (sunDir.y / sunDist) * gSun * dt * 0.85;
      s.vel.z -= (sunDir.z / sunDist) * gSun * dt * 0.85;
    }

    // Integrate position
    s.prevPos = { ...s.pos };
    s.pos.x += s.vel.x * dt; s.pos.y += s.vel.y * dt; s.pos.z += s.vel.z * dt;

    // Soft leash: if you drift too far from the Sun, pull gently back into the planetary zone
    const rSun = Math.hypot(s.pos.x, s.pos.y, s.pos.z) || 1;
    const maxR = AU * 6.5; // beyond ~Saturn zone in this compressed scale
    if (rSun > maxR) {
      const pull = (rSun - maxR) * 0.35 * dt;
      s.pos.x -= (s.pos.x / rSun) * pull;
      s.pos.y -= (s.pos.y / rSun) * pull;
      s.pos.z -= (s.pos.z / rSun) * pull;
      s.vel.x *= 0.92;
      s.vel.y *= 0.92;
      s.vel.z *= 0.92;
    }

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

    // Lock the mission destination by default; hover changes the info card, while
    // clicking a body/star/galaxy locks it until the next click.
    const focus = getTargetFocus(destination);
    const body = BODIES.find((item) => item.id === focus.id);
    let target: TargetInfo | null = null;
    if (body) {
      const p = posOf(body.id, simT, cache);
      const range = Math.hypot(p.x - s.pos.x, p.y - s.pos.y, p.z - s.pos.z);
      target = {
        id: body.id, name: body.name, kind: body.kind, blurb: body.blurb, fact: body.fact,
        dist: body.dist, range: formatRange(range, destination), locked: focus.lockedId === body.id,
      };
    } else {
      const star = NAMED_STARS.find((item) => item.id === focus.id);
      const galaxy = GALAXIES.find((item) => item.id === focus.id);
      if (star) {
        target = {
          id: star.id, name: star.name, kind: "star", blurb: star.blurb, fact: star.fact,
          dist: star.dist, range: star.dist, catalog: star.catalogNames?.join(" · "),
          constellation: star.constellation, spectral: star.spectral, appMag: star.appMag,
          locked: focus.lockedId === star.id,
        };
      } else if (galaxy) {
        target = {
          id: galaxy.id, name: galaxy.name, kind: galaxy.type, blurb: galaxy.blurb, fact: galaxy.fact,
          dist: galaxy.dist, range: galaxy.dist, catalog: galaxy.catalogNames?.join(" · "),
          constellation: galaxy.constellation, locked: focus.lockedId === galaxy.id,
        };
      } else {
        const fieldMatch = /^(catalog-star|milky-star):(\d+)$/.exec(focus.id);
        if (fieldMatch) {
          const index = Number(fieldMatch[2]);
          const catalogStar = fieldMatch[1] === "catalog-star" ? FIELD[index] : MILKY[index];
          if (catalogStar) target = {
            id: focus.id,
            name: fieldMatch[1] === "catalog-star" ? `Catalog star ${index + 1}` : `Milky Way field star ${index + 1}`,
            kind: "star", blurb: "Procedural sky object shown for orientation and sky-density exploration.",
            fact: `Visual spectral class ${catalogStar.spectral ?? "G"}. This background field is a directional visualization and is not to scale.`,
            dist: "Background field · not to scale", range: "Deep-sky background", spectral: catalogStar.spectral,
            appMag: catalogStar.mag, locked: focus.lockedId === focus.id,
          };
        }
      }
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
      <color attach="background" args={["#03050a"]} />
      {/* Space is dark, but standard-material planets still need a usable key
          light at this compressed AU scale. The ambient fill keeps the far side
          legible while the central light gives day/night shape. */}
      <ambientLight intensity={0.55} color="#9aacc4" />
      <pointLight position={[0, 0, 0]} color="#fff1cf" intensity={20000} distance={1800} decay={2} />

      {/* Star field — reuse existing StarField3D */}
      <StarField3D radius={2500} />
      {/* Named stars have larger pick targets and hover information in FPV. */}
      <NamedStars3D radius={2350} />
      {/* 88 Constellations & Menzel Family Shape Overlay with LineBatch & Fresnel Hull */}
      <FamilyShapeOverlay radius={2340} />

      {/* Planets — reuse existing CelestialBody */}
      {BODIES.filter(b => b.orbit && !b.parent).map(body => (
        <CelestialBody key={body.id} body={body} simTime={simTRef.current} />
      ))}

      {/* Moon (child of Earth) */}
      <CelestialBody body={BODIES.find(b => b.id === "moon")!} simTime={simTRef.current} />

      {/* Orbit rings */}
      <OrbitPaths />

      {/* Galaxies */}
      <GalaxySprites distance={2200} />

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
  const lastMarked = useRef({ target: "", lesson: "" });
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
    if (hud.target && hud.target.id !== lastMarked.current.target) {
      const map: Record<string, string> = {
        mars: "distance", moon: "distance", earth: "why-oxygen",
        sun: "orbits", andromeda: "orbits", jupiter: "orbits", saturn: "orbits",
      };
      const id = map[hud.target.id];
      if (id) useGame.getState().markTopic(id);
      lastMarked.current.target = hud.target.id;
    }
    const lessonTopic = LESSONS[hud.lesson].libraryId;
    if (lessonTopic !== lastMarked.current.lesson) {
      useGame.getState().markTopic(lessonTopic);
      lastMarked.current.lesson = lessonTopic;
    }
  }, [hud.target?.id, hud.lesson]);

  const near = hud.remainKm / TRANSFER[destination].km < 0.12;

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="rounded-md border border-border/60 bg-bg/55 px-3 py-2 backdrop-blur-sm">
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
      <TransferMap hud={hud} destination={destination} />
      <MissionTargetCue hud={hud} destination={destination} />
      <div className="absolute inset-0 grid place-items-center" aria-hidden="true">
        <svg className="size-8 opacity-60" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="4" stroke="#7eb8c9" strokeWidth=".6" />
          <path d="M16 1v8M16 23v8M1 16h8M23 16h8" stroke="#7eb8c9" strokeWidth=".6" />
        </svg>
      </div>
      <div className="pointer-events-none absolute bottom-3 left-3 flex max-w-[min(24rem,calc(100vw-1.5rem))] flex-col gap-2 sm:bottom-5 sm:left-5">
        <div className="rounded-md border border-border/50 bg-bg/40 px-3 py-2 backdrop-blur-sm">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted">Velocity</p>
          <p className="font-mono text-lg tabular-nums text-fg">{hud.speed.toFixed(1)} <span className="text-xs text-muted">u/s</span></p>
          <div className="mt-1 h-0.5 w-32 overflow-hidden bg-white/10">
            <div className="h-full bg-accent" style={{ width: `${Math.max(2, Math.min(100, hud.speed / 30 * 100))}%` }} />
          </div>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-accent">
            {hud.boost ? "Boost" : hud.thrust !== 0 ? "Burn" : "Coasting"}{hud.drifted ? " · Off course" : ""}
          </p>
        </div>
        <p className="font-mono text-[10px] leading-relaxed text-white/70">
          <span className="text-accent">Drag</span> roam sky & constellations ·{" "}
          <span className="text-amber-300">Click star</span> family myth animation ·{" "}
          <span className="text-accent">X</span> brake ·{" "}
          <span className="text-accent">V</span> observe on/off · W/S thrust · A/D yaw
        </p>
        <p className="font-mono text-[9px] text-cyan-200/60">
          88 IAU Constellations · 8 Menzel Sky Path Families · Drag to scan horizon · Click any star to animate family bonds
        </p>
      </div>
      {hud.target && (
        <div className="pointer-events-none absolute bottom-3 right-3 max-w-[min(14rem,calc(100vw-1.5rem))] rounded-md border border-border/50 bg-slate-950/85 px-3 py-2 backdrop-blur-sm sm:bottom-5 sm:right-5 sm:max-w-60">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-accent">
            {hud.target.locked ? "Target locked · click again to unlock" : "Hover / click object to lock"}
          </p>
          <p className="font-display text-sm text-fg">{hud.target.name}</p>
          <p className="font-mono text-[10px] text-muted">{hud.target.kind} · {hud.target.range}</p>
          {hud.target.spectral && <p className="font-mono text-[9px] text-muted">{hud.target.spectral}{hud.target.constellation ? ` · ${hud.target.constellation}` : ""}</p>}
          {hud.target.blurb && <p className="mt-1 text-[10px] leading-snug text-white/75">{hud.target.blurb}</p>}
          {hud.target.fact && <p className="mt-1 text-[10px] leading-snug text-white/50">{hud.target.fact}</p>}
        </div>
      )}
    </div>
  );
}

/** A small, readable flight-plan view answers where the ship is while the
 *  first-person camera stays in the spacecraft. */
function TransferMap({ hud, destination }: { hud: HudSnap; destination: DestinationId }) {
  const progress = Math.max(0, Math.min(1, hud.pathPct));
  const isMars = destination === "mars";
  const easedProgress = 3 * progress * progress - 2 * progress * progress * progress;
  const shipX = isMars ? 61 + 76 * easedProgress : 90 + 31 * progress;
  const shipY = isMars ? 55 - 150 * progress * (1 - progress) : 55 - 66 * progress * (1 - progress);
  const scienceNote = isMars
    ? progress < 0.08 ? "Departure burn raises the far side of the orbit (apoapsis)."
      : progress > 0.92 ? "Arrival burn removes relative speed for Mars capture."
        : "Coast on the transfer ellipse: solar gravity bends the path; engines stay off."
    : progress < 0.1 ? "Trans-lunar injection raises apogee toward the Moon."
      : progress > 0.9 ? "Lunar orbit insertion slows the craft into lunar capture."
        : "Earth–Moon coast: gravity curves the path while the craft falls around Earth.";

  return (
      <div className="pointer-events-none absolute left-3 top-[8rem] w-44 rounded-lg border border-white/15 bg-slate-950/75 p-2.5 shadow-lg backdrop-blur-sm sm:left-4 sm:top-24 sm:w-52">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-cyan-200">{isMars ? "Hohmann map" : "Lunar transfer"}</p>
        <p className="font-mono text-[9px] text-white/55">{Math.round(progress * 100)}%</p>
      </div>
      <svg viewBox="0 0 180 92" className="mt-1 h-[4.6rem] w-full" role="img" aria-label={`${isMars ? "Earth to Mars Hohmann transfer" : "Earth to Moon transfer"}; spacecraft ${Math.round(progress * 100)} percent along route`}>
        {isMars ? (
          <>
            <circle cx="90" cy="55" r="29" fill="none" stroke="rgba(126,184,201,.22)" strokeDasharray="2 3" />
            <circle cx="90" cy="55" r="47" fill="none" stroke="rgba(196,137,106,.2)" strokeDasharray="2 3" />
            <path d="M61 55 C61 5 137 5 137 55" fill="none" stroke="#7eb8c9" strokeOpacity=".65" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="90" cy="55" r="4" fill="#ffd98a" />
            <circle cx="61" cy="55" r="4" fill="#4a90d9" />
            <circle cx="137" cy="55" r="4" fill="#c4896a" />
            <text x="45" y="76" fill="rgba(232,237,244,.68)" fontSize="7">EARTH</text>
            <text x="126" y="76" fill="rgba(232,237,244,.68)" fontSize="7">MARS</text>
          </>
        ) : (
          <>
            <circle cx="90" cy="55" r="31" fill="none" stroke="rgba(197,212,227,.25)" strokeDasharray="2 3" />
            <path d="M90 55 Q105 22 121 55" fill="none" stroke="rgba(126,184,201,.25)" strokeWidth="3" />
            <path d={`M90 55 Q105 22 ${shipX} ${shipY}`} fill="none" stroke="#7eb8c9" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="90" cy="55" r="7" fill="#4a90d9" />
            <circle cx="121" cy="55" r="3.5" fill="#d9e0e8" />
            <text x="78" y="76" fill="rgba(232,237,244,.68)" fontSize="7">EARTH</text>
            <text x="116" y="76" fill="rgba(232,237,244,.68)" fontSize="7">MOON</text>
          </>
        )}
        <path d={`M${shipX - 4} ${shipY + 3} L${shipX} ${shipY - 5} L${shipX + 4} ${shipY + 3} Z`} fill="#e8edf4" stroke="#071018" strokeWidth=".8" />
      </svg>
      <p className="truncate font-mono text-[9px] text-white/85">{hud.phase}</p>
      <p className="mt-1 text-[9px] leading-snug text-cyan-100/80">{scienceNote}</p>
      <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-cyan-300 transition-[width]" style={{ width: `${progress * 100}%` }} />
      </div>
      <p className="mt-1 font-mono text-[8px] text-white/55">White marker = ship · cyan arc = route</p>
    </div>
  );
}

function MissionTargetCue({ hud, destination }: { hud: HudSnap; destination: DestinationId }) {
  const signedAz = ((hud.targetAz + 180) % 360) - 180;
  const azLabel = Math.abs(signedAz) < 3 ? "ahead" : `${Math.abs(Math.round(signedAz))}° ${signedAz > 0 ? "right" : "left"}`;
  const elLabel = Math.abs(hud.targetEl) < 3 ? "level" : `${Math.abs(Math.round(hud.targetEl))}° ${hud.targetEl > 0 ? "up" : "down"}`;
  const aligned = Math.abs(signedAz) < 14 && Math.abs(hud.targetEl) < 12;
  const name = destination === "mars" ? "Mars" : "Moon";

  return (
    <div className="pointer-events-none absolute left-1/2 top-[4.6rem] -translate-x-1/2 rounded-md border border-cyan-200/30 bg-slate-950/65 px-3 py-1.5 text-center shadow-lg backdrop-blur-sm">
      <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-cyan-200">Mission target · {name} · locked</p>
      <p className="font-mono text-[10px] text-white/80">{aligned ? "In forward view · center reticle to align" : `Turn ${azLabel} · ${elLabel} · drag or use A/D and R/F`}</p>
    </div>
  );
}

/* ---------- Main CockpitScene component ---------- */
export function CockpitScene({ destination }: { destination: DestinationId }) {
  useEffect(() => { resetTargetFocus(destination); }, [destination]);
  const start = startPose(destination);
  const target = posOf(destination, 0, new Map());
  const dx = target.x - start.pos.x;
  const dy = target.y - start.pos.y;
  const dz = target.z - start.pos.z;
  const startYaw = Math.atan2(-dx, -dz);
  const startPitch = Math.atan2(dy, Math.hypot(dx, dz));
  const startQuat = qEulerYXZ(startPitch, startYaw, 0);
  // Start almost stopped so Observe mode can hold you in the planetary zone
  const shipRef = useRef<ShipState>({
    pos: { ...start.pos },
    vel: {
      x: start.vel.x * 0.15,
      y: start.vel.y * 0.15,
      z: start.vel.z * 0.15,
    },
    quat: startQuat,
    yaw: startYaw,
    travelled: 0,
    prevPos: { ...start.pos },
  });
  qNorm(shipRef.current.quat);
  observeMode = true;
  const simTRef = useRef(0);
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
    <div
      className="fixed inset-0 z-40 bg-bg"
      style={{ touchAction: "none", cursor: "crosshair" }}
      onPointerDown={(e) => {
        pointer.active = true;
        if (e.button === 1) {
          try {
            (e.currentTarget as HTMLElement).requestPointerLock?.();
          } catch {
            /* */
          }
          return;
        }
        // Left/right drag looks around; cursor stays visible for planet hover/lock
        if (e.button === 0 || e.button === 2) {
          dragLooking = true;
        }
      }}
      onPointerUp={() => {
        dragLooking = false;
      }}
      onPointerLeave={() => {
        dragLooking = false;
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Canvas
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ fov: 62, near: 0.01, far: 10000, position: [0, 0, 0] }}
        onPointerMissed={() => {
          globalFamilyRevealController.reset();
        }}
      >
        <SceneContent ship={shipRef} simTRef={simTRef} destination={destination} />
      </Canvas>
      <CockpitHudOverlay destination={destination} />
      <FamilyRevealHud />
      <ConstellationPanel />
    </div>
  );
}

/* ---------- Re-export for FPVView compatibility ---------- */
export { CockpitHudOverlay as Hud };
