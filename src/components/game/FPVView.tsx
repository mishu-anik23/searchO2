import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { Gauge, RotateCcw, Square, X, Zap } from "lucide-react";
import { FPV_RATE_PER_SEC, navFromProgress, TRANSFER, type DestinationId } from "@/game/data";
import {
  ASTEROIDS,
  AU,
  BODIES,
  CONSTELLATIONS,
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
import { useGame } from "@/game/store";
import { formatEta, formatKm, formatUsd } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CockpitScene } from "./three/CockpitScene";

const held = new Set<string>();
let injected: string[] | null = null;
let steerOverride: number | null = null;
const look = { dx: 0, dy: 0 };
const pointer = { x: 0.5, y: 0.5, active: false };

function codesHas(code: string) {
  if (injected) return injected.includes(code);
  return held.has(code);
}

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
  q.x /= n;
  q.y /= n;
  q.z /= n;
  q.w /= n;
}
function qEulerYXZ(x: number, y: number, z: number): Q {
  const c1 = Math.cos(x / 2);
  const s1 = Math.sin(x / 2);
  const c2 = Math.cos(y / 2);
  const s2 = Math.sin(y / 2);
  const c3 = Math.cos(z / 2);
  const s3 = Math.sin(z / 2);
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

class FpvErrorBoundary extends Component<{ children: ReactNode; onClose: () => void }, { err: string | null }> {
  state: { err: string | null } = { err: null };
  static getDerivedStateFromError(e: Error) {
    return { err: e.message || "Unknown error" };
  }
  render() {
    if (this.state.err) {
      return (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-3 bg-bg p-6 text-center">
          <p className="font-display text-lg text-fg">Flight camera hit a snag.</p>
          <p className="max-w-md text-sm text-muted">{this.state.err}</p>
          <Button onClick={this.props.onClose}>Back to cruise</Button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function FPVView({ destination }: { destination: DestinationId }) {
  const closeFpv = useGame((s) => s.closeFpv);
  return (
    <FpvErrorBoundary onClose={closeFpv}>
      <div className="fixed inset-0 z-40 bg-bg" style={{ touchAction: "none" }}>
        <CockpitScene destination={destination} />
        <TouchPad />
      </div>
    </FpvErrorBoundary>
  );
}

function SpaceCanvas({ destination }: { destination: DestinationId }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

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
      try {
        if (document.pointerLockElement) document.exitPointerLock();
      } catch {
        /* iframe */
      }
    };
  }, []);

  useEffect(() => {
    warmupPhotos();
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    if (!ctx) return;

    const pose = startPose(destination);
    const ship = {
      pos: { ...pose.pos },
      vel: { ...pose.vel },
      quat: qEulerYXZ(pose.pitch, 0, 0),
      yaw: 0,
      travelled: 0,
      prevPos: { ...pose.pos },
    };
    qNorm(ship.quat);
    const trail: V[] = [];

    window.__controlsTest = {
      getYaw: () => ship.yaw,
      getSpeed: () => Math.hypot(ship.vel.x, ship.vel.y, ship.vel.z),
      setKeys: (codes: string[]) => {
        injected = codes;
      },
      setSteer: (v: number) => {
        steerOverride = v;
      },
    };

    let raf = 0;
    let last = performance.now();
    let billAcc = 0;
    let hudAt = 0;
    let dragging = false;
    let simT = 0;
    let trailAcc = 0;

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const width = Math.max(1, wrap.clientWidth);
      const height = Math.max(1, wrap.clientHeight);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);

    const onDown = (e: PointerEvent) => {
      dragging = true;
      wrap.setPointerCapture(e.pointerId);
      pointer.active = true;
      try {
        wrap.requestPointerLock?.();
      } catch {
        /* ignore */
      }
    };
    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      pointer.x = (e.clientX - rect.left) / Math.max(1, rect.width);
      pointer.y = (e.clientY - rect.top) / Math.max(1, rect.height);
      pointer.active = true;
      if (document.pointerLockElement) return;
      if (!dragging) return;
      look.dx += e.movementX;
      look.dy += e.movementY;
    };
    const onUp = () => {
      dragging = false;
    };
    wrap.addEventListener("pointerdown", onDown);
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerup", onUp);
    wrap.addEventListener("pointercancel", onUp);

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (!document.hidden) {
        simT += dt;
        billAcc += dt;
        if (billAcc >= 0.25) {
          useGame.getState().billFpv(billAcc);
          billAcc = 0;
        }

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
        look.dx = 0;
        look.dy = 0;

        const turn = 1.15;
        ship.quat = qMul(
          ship.quat,
          qEulerYXZ(pitchCmd * turn * dt + pitchMouse, yawCmd * turn * dt + yawMouse, rollCmd * turn * dt),
        );
        qNorm(ship.quat);
        if (codesHas("KeyZ")) {
          const k = 1 - Math.exp(-3.2 * dt);
          ship.quat.x += (0 - ship.quat.x) * k;
          ship.quat.y += (0 - ship.quat.y) * k;
          ship.quat.z += (0 - ship.quat.z) * k;
          ship.quat.w += (1 - ship.quat.w) * k;
          qNorm(ship.quat);
        }

        const f = rotate(ship.quat, { x: 0, y: 0, z: -1 });
        const u = rotate(ship.quat, { x: 0, y: 1, z: 0 });
        let thrust = 0;
        if (codesHas("KeyW")) thrust += 1;
        if (codesHas("KeyS")) thrust -= 1;
        const boost = codesHas("ShiftLeft") || codesHas("ShiftRight") ? 2.4 : 1;
        const acc = thrust * 18 * boost * dt;
        ship.vel.x += f.x * acc;
        ship.vel.y += f.y * acc;
        ship.vel.z += f.z * acc;
        if (codesHas("Space")) {
          ship.vel.x += u.x * 10 * dt;
          ship.vel.y += u.y * 10 * dt;
          ship.vel.z += u.z * 10 * dt;
        }
        if (codesHas("ControlLeft") || codesHas("ControlRight") || codesHas("KeyC")) {
          ship.vel.x -= u.x * 10 * dt;
          ship.vel.y -= u.y * 10 * dt;
          ship.vel.z -= u.z * 10 * dt;
        }
        if (codesHas("KeyX")) {
          const damp = Math.exp(-2.2 * dt);
          ship.vel.x *= damp;
          ship.vel.y *= damp;
          ship.vel.z *= damp;
        }

        // Soft gravitational influence from Sun (and Earth for Moon runs) — simplified μ/r².
        // Units are compressed; this is a gentle steering bias, not high-fidelity ephemeris.
        {
          const cacheG = new Map<string, V>();
          const sunP = posOf("sun", simT, cacheG);
          const dx = sunP.x - ship.pos.x;
          const dy = sunP.y - ship.pos.y;
          const dz = sunP.z - ship.pos.z;
          const r2 = dx * dx + dy * dy + dz * dz;
          const r = Math.sqrt(r2) || 1;
          const muSun = 2.8; // tuned for gentle curve in compressed units
          const aSun = muSun / r2;
          ship.vel.x += (dx / r) * aSun * dt;
          ship.vel.y += (dy / r) * aSun * dt;
          ship.vel.z += (dz / r) * aSun * dt;
          if (destination === "moon") {
            const earthP = posOf("earth", simT, cacheG);
            const ex = earthP.x - ship.pos.x;
            const ey = earthP.y - ship.pos.y;
            const ez = earthP.z - ship.pos.z;
            const er2 = ex * ex + ey * ey + ez * ez;
            const er = Math.sqrt(er2) || 1;
            const muEarth = 0.45;
            const aE = muEarth / er2;
            ship.vel.x += (ex / er) * aE * dt;
            ship.vel.y += (ey / er) * aE * dt;
            ship.vel.z += (ez / er) * aE * dt;
          }
        }

        ship.pos.x += ship.vel.x * dt;
        ship.pos.y += ship.vel.y * dt;
        ship.pos.z += ship.vel.z * dt;
        // Cumulative path length (not chord distance)
        ship.travelled += Math.hypot(
          ship.pos.x - ship.prevPos.x,
          ship.pos.y - ship.prevPos.y,
          ship.pos.z - ship.prevPos.z,
        );
        ship.prevPos.x = ship.pos.x;
        ship.prevPos.y = ship.pos.y;
        ship.prevPos.z = ship.pos.z;
        ship.yaw = yawFromQuat(ship.quat);

        trailAcc += dt;
        if (trailAcc > 0.08) {
          trailAcc = 0;
          trail.push({ ...ship.pos });
          if (trail.length > 90) trail.shift();
        }

        const frame = paint(ctx, canvas, ship, destination, simT, thrust, trail);
        hudAt += dt;
        if (hudAt > 0.1) {
          hudAt = 0;
          publishHud({
            speed: Math.hypot(ship.vel.x, ship.vel.y, ship.vel.z),
            yaw: ship.yaw,
            thrust,
            boost: boost > 1,
            target: frame.target,
            lesson: frame.lesson,
            drifted: frame.drifted,
            pathPct: frame.pathPct,
            au: frame.au,
            travelledKm: frame.travelledKm,
            remainKm: frame.remainKm,
            etaHours: frame.etaHours,
            vKms: frame.vKms,
            targetAz: frame.targetAz,
            targetEl: frame.targetEl,
            distEarth: frame.distEarth,
            distTarget: frame.distTarget,
            metHours: frame.metHours,
            phase: frame.phase,
          });
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      wrap.removeEventListener("pointerdown", onDown);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerup", onUp);
      wrap.removeEventListener("pointercancel", onUp);
      delete window.__controlsTest;
      injected = null;
      steerOverride = null;
    };
  }, [destination]);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}

export type TargetInfo = {
  id: string;
  name: string;
  kind: string;
  blurb: string;
  fact: string;
  dist: string;
  range: string;
  catalog?: string;
  constellation?: string;
  spectral?: string;
  appMag?: number;
  az?: number;
  el?: number;
};

type FrameInfo = {
  target: TargetInfo | null;
  lesson: LessonId;
  drifted: boolean;
  pathPct: number;
  au: number;
  travelledKm: number;
  remainKm: number;
  etaHours: number;
  vKms: number;
  targetAz: number;
  targetEl: number;
  distEarth: number;
  distTarget: number;
  metHours: number;
  phase: string;
};

type Proj = { x: number; y: number; z: number; s: number; cam?: V };

function paint(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  ship: { pos: V; vel: V; quat: Q; travelled: number },
  destination: DestinationId,
  simT: number,
  thrust: number,
  trail: V[],
): FrameInfo {
  const w = canvas.width;
  const h = canvas.height;
  ctx.fillStyle = "#05060a";
  ctx.fillRect(0, 0, w, h);

  const fl = (0.5 * h) / Math.tan((62 * Math.PI) / 180 / 2);
  const inv = qConj(ship.quat);
  const cache = new Map<string, V>();

  const projectDir = (d: V): Proj | null => {
    const l = Math.hypot(d.x, d.y, d.z) || 1;
    const r = rotate(inv, { x: d.x / l, y: d.y / l, z: d.z / l });
    if (r.z >= -0.02) return null;
    const s = fl / -r.z;
    return { x: w / 2 + r.x * s, y: h / 2 - r.y * s, z: r.z, s };
  };
  const project = (p: V): (Proj & { cam: V }) | null => {
    const r = rotate(inv, { x: p.x - ship.pos.x, y: p.y - ship.pos.y, z: p.z - ship.pos.z });
    if (r.z >= -0.08) return null;
    const s = fl / -r.z;
    return { x: w / 2 + r.x * s, y: h / 2 - r.y * s, z: r.z, s, cam: r };
  };

  // Subtle galactic plane glow (not atmospheric fog)
  const milky = projectDir({ x: 0.15, y: 0.02, z: 1 });
  if (milky) {
    const g = ctx.createRadialGradient(milky.x, milky.y, 0, milky.x, milky.y, h * 0.9);
    g.addColorStop(0, "rgba(110,88,64,0.2)");
    g.addColorStop(0.4, "rgba(70,60,90,0.07)");
    g.addColorStop(1, "rgba(5,6,10,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  // Dense star field — magnitude-scaled, spectral-colored (GPU-friendly points via canvas)
  const drawStar = (st: { x: number; y: number; z: number; b: number; s: number; cr: number; cg: number; cb: number }) => {
    const p = projectDir(st);
    if (!p) return;
    if (p.x < -6 || p.y < -6 || p.x > w + 6 || p.y > h + 6) return;
    const sz = st.s * Math.min(2.0, w / 1000);
    if (sz < 0.4 && st.b < 0.25) return; // skip dimmest for performance
    ctx.fillStyle = `rgba(${st.cr | 0},${st.cg | 0},${st.cb | 0},${Math.min(1, st.b)})`;
    if (sz >= 1.6 && st.b > 0.55) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, sz * 0.55, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(p.x, p.y, Math.max(0.6, sz), Math.max(0.6, sz));
    }
  };
  for (const st of MILKY) drawStar(st);
  for (const st of FIELD) drawStar(st);

  // Constellation lines
  ctx.lineWidth = Math.max(1, w / 1600);
  ctx.strokeStyle = "rgba(126,184,201,0.26)";
  for (const c of CONSTELLATIONS) {
    ctx.beginPath();
    let started = false;
    for (const id of c.ids) {
      const star = NAMED_STARS.find((s) => s.id === id);
      if (!star) {
        started = false;
        continue;
      }
      const p = projectDir(star.dir);
      if (!p) {
        started = false;
        continue;
      }
      if (!started) {
        ctx.moveTo(p.x, p.y);
        started = true;
      } else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }

  // Deep-sky layer (galaxies, nebulae, clusters) — declutter: only brighter / larger near center
  const cx = w / 2;
  const cy = h / 2;
  for (const gxy of GALAXIES) {
    const p = projectDir(gxy.dir);
    if (!p) continue;
    const off = Math.hypot(p.x - cx, p.y - cy);
    const mag = gxy.magnitude ?? 8;
    // Show all bright ones; fainter only near reticle or large angular size
    if (mag > 6.5 && off > h * 0.28 && (gxy.angularSize ?? 0) < 0.4) continue;
    drawGalaxy(ctx, p.x, p.y, h, gxy);
  }

  // Named bright stars — crosshair + label (declutter by magnitude)
  for (const star of NAMED_STARS) {
    const p = projectDir(star.dir);
    if (!p) continue;
    const m = 4 + star.mag * 2.8;
    ctx.strokeStyle = star.color;
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(p.x - m, p.y);
    ctx.lineTo(p.x + m, p.y);
    ctx.moveTo(p.x, p.y - m);
    ctx.lineTo(p.x, p.y + m);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = star.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.5 + star.mag * 0.4, 0, Math.PI * 2);
    ctx.fill();
    // Labels only for brighter stars or those near center
    const off = Math.hypot(p.x - cx, p.y - cy);
    if (star.appMag < 1.3 || off < h * 0.22) {
      ctx.font = `500 ${Math.max(10, w / 115)}px Outfit, sans-serif`;
      ctx.fillStyle = "rgba(232,237,244,0.75)";
      ctx.fillText(star.name, p.x + 8, p.y - 6);
    }
  }

  const destId = destination;
  const earth = posOf("earth", simT, cache);
  const destP = posOf(destId, simT, cache);
  const sunP = posOf("sun", simT, cache);

  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(1, w / 1400);
  for (const b of BODIES) {
    if (!b.orbit || b.parent) continue;
    ctx.strokeStyle = "rgba(126,184,201,0.2)";
    ctx.setLineDash([4, 8]);
    strokeWorldLoop(ctx, project, b.orbit);
    ctx.setLineDash([]);
    const hint = orbitSpeedHint(b.orbit);
    const ang = angOf(b.id, simT);
    const tip: V = {
      x: Math.cos(ang + 0.18) * b.orbit,
      y: 0,
      z: Math.sin(ang + 0.18) * b.orbit,
    };
    const from: V = {
      x: Math.cos(ang) * b.orbit,
      y: 0,
      z: Math.sin(ang) * b.orbit,
    };
    const a = project(from);
    const c = project(tip);
    if (a && c && b.orbit <= 180) {
      ctx.strokeStyle = `rgba(126,184,201,${0.25 + hint * 0.35})`;
      ctx.lineWidth = 1 + hint * 2;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(c.x, c.y);
      ctx.stroke();
    }
  }

  for (const rock of ASTEROIDS) {
    const pr = project(rock);
    if (!pr) continue;
    const rad = Math.max(0.6, rock.r * pr.s);
    if (rad < 0.5) continue;
    ctx.fillStyle = "rgba(180,170,155,0.7)";
    ctx.fillRect(pr.x, pr.y, rad, rad);
  }

  const corridor = transferPath(destId, simT, 48);
  ctx.strokeStyle = "rgba(126,184,201,0.7)";
  ctx.lineWidth = Math.max(1.6, w / 850);
  ctx.setLineDash([10, 6]);
  strokeWorldPolyline(ctx, project, corridor);
  ctx.setLineDash([]);

  if (destId === "mars") {
    const oval = hohmannEllipse(AU, 102, angOf("earth", simT), 64);
    ctx.strokeStyle = "rgba(201,168,111,0.55)";
    ctx.lineWidth = Math.max(1.4, w / 1000);
    strokeWorldPolyline(ctx, project, oval);
  }

  let minPath = 1e9;
  let pathPct = 0;
  for (let i = 0; i < corridor.length; i++) {
    const p = corridor[i];
    const d = Math.hypot(p.x - ship.pos.x, p.y - ship.pos.y, p.z - ship.pos.z);
    if (d < minPath) {
      minPath = d;
      pathPct = i / Math.max(1, corridor.length - 1);
    }
  }
  const drifted = minPath > 28;

  const ghost = corridor[Math.min(corridor.length - 1, Math.round(pathPct * (corridor.length - 1)))];
  const ghostPr = project(ghost);
  if (ghostPr) {
    ctx.fillStyle = "#7eb8c9";
    ctx.beginPath();
    ctx.arc(ghostPr.x, ghostPr.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Burn markers
  const b1 = project(earth);
  const b2 = project(destP);
  if (b1) labelWorld(ctx, b1.x, b1.y + 16, destId === "mars" ? "Δv₁ burn" : "TLI burn", w);
  if (b2) labelWorld(ctx, b2.x, b2.y + 16, destId === "mars" ? "Δv₂ capture" : "LOI", w);

  if (trail.length > 1) {
    ctx.strokeStyle = "rgba(232,237,244,0.35)";
    ctx.lineWidth = 1.2;
    strokeWorldPolyline(ctx, project, trail);
  }

  const sunCam = rotate(inv, { x: sunP.x - ship.pos.x, y: sunP.y - ship.pos.y, z: sunP.z - ship.pos.z });

  type Drawn = { body: SkyBody; pr: NonNullable<ReturnType<typeof project>>; rad: number; dist: number };
  const drawn: Drawn[] = [];
  for (const body of BODIES) {
    const p = posOf(body.id, simT, cache);
    const pr = project(p);
    if (!pr) continue;
    const dist = Math.hypot(p.x - ship.pos.x, p.y - ship.pos.y, p.z - ship.pos.z);
    const minPx = body.kind === "sun" ? 16 : body.kind === "moon" ? 7 : body.orbit && body.orbit > 140 ? 12 : 9;
    const rad = Math.max(minPx, body.r * pr.s);
    drawn.push({ body, pr, rad, dist });
  }
  drawn.sort((a, b) => a.pr.z - b.pr.z);

  for (const d of drawn) {
    drawWorldBody(ctx, d.pr.x, d.pr.y, d.rad, d.body, sunCam, d.pr.cam);
  }

  const aimX = pointer.active && !document.pointerLockElement ? pointer.x * w : w / 2;
  const aimY = pointer.active && !document.pointerLockElement ? pointer.y * h : h / 2;

  type Cand = TargetInfo & { score: number; x: number; y: number; rad: number };
  const cands: Cand[] = [];
  for (const d of drawn) {
    const distPx = Math.hypot(d.pr.x - aimX, d.pr.y - aimY);
    const score = distPx - d.rad * 0.8;
    cands.push({
      id: d.body.id,
      name: d.body.name,
      kind: d.body.kind,
      blurb: d.body.blurb,
      fact: d.body.fact,
      dist: d.body.dist,
      range: formatRange(d.dist, destination),
      score,
      x: d.pr.x,
      y: d.pr.y,
      rad: d.rad,
    });
    if (d.rad > 3 || distPx < 110) {
      ctx.font = `600 ${Math.max(12, Math.min(18, d.rad * 0.16 + w / 85))}px Outfit, sans-serif`;
      ctx.fillStyle = "rgba(232,237,244,0.92)";
      ctx.fillText(d.body.name, d.pr.x + d.rad + 10, d.pr.y - 4);
      ctx.font = `400 ${Math.max(10, w / 130)}px Atkinson Hyperlegible, sans-serif`;
      ctx.fillStyle = "rgba(139,151,168,0.95)";
      ctx.fillText(`${d.body.dist} · ${formatRange(d.dist, destination)}`, d.pr.x + d.rad + 10, d.pr.y + 14);
    }
  }
  for (const star of NAMED_STARS) {
    const p = projectDir(star.dir);
    if (!p) continue;
    const distPx = Math.hypot(p.x - aimX, p.y - aimY);
    if (distPx < 56) {
      const dirCam = rotate(inv, star.dir);
      const azel = azElFromCam(dirCam);
      cands.push({
        id: star.id,
        name: star.name,
        kind: "star",
        blurb: star.blurb,
        fact: star.fact,
        dist: star.dist,
        range: star.dist,
        catalog: star.catalogNames?.join(" · "),
        constellation: star.constellation,
        spectral: star.spectral,
        appMag: star.appMag,
        az: azel.az,
        el: azel.el,
        score: distPx,
        x: p.x,
        y: p.y,
        rad: 10,
      });
    }
  }
  for (const gxy of GALAXIES) {
    const p = projectDir(gxy.dir);
    if (!p) continue;
    const distPx = Math.hypot(p.x - aimX, p.y - aimY);
    if (distPx < 100) {
      const dirCam = rotate(inv, gxy.dir);
      const azel = azElFromCam(dirCam);
      cands.push({
        id: gxy.id,
        name: gxy.name,
        kind: gxy.type,
        blurb: gxy.blurb,
        fact: gxy.fact,
        dist: gxy.dist,
        range: gxy.dist,
        catalog: gxy.catalogNames?.join(" · "),
        constellation: gxy.constellation,
        appMag: gxy.magnitude,
        az: azel.az,
        el: azel.el,
        score: distPx - 15,
        x: p.x,
        y: p.y,
        rad: 28,
      });
    }
  }
  cands.sort((a, b) => a.score - b.score);

  let target: Cand | null = cands[0] && cands[0].score < 46 ? cands[0] : null;
  if (!target) {
    const destCand = cands.find((c) => c.id === destId);
    if (destCand) target = destCand;
    else if (cands[0] && cands[0].score < 90) target = cands[0];
    else {
      const onRoad = drawn
        .filter((d) => d.body.id === destId || d.body.id === "earth" || d.body.id === "moon" || d.body.id === "sun")
        .sort((a, b) => a.dist - b.dist)[0];
      if (onRoad) {
        target = {
          id: onRoad.body.id,
          name: onRoad.body.name,
          kind: onRoad.body.kind,
          blurb: onRoad.body.blurb,
          fact: onRoad.body.fact,
          dist: onRoad.body.dist,
          range: formatRange(onRoad.dist, destination),
          score: 0,
          x: onRoad.pr.x,
          y: onRoad.pr.y,
          rad: onRoad.rad,
        };
      }
    }
  }

  if (target) {
    const m = Math.max(16, target.rad + 10);
    ctx.strokeStyle = "#7eb8c9";
    ctx.lineWidth = 1.5;
    const { x, y } = target;
    ctx.beginPath();
    ctx.moveTo(x - m, y - m + 10);
    ctx.lineTo(x - m, y - m);
    ctx.lineTo(x - m + 10, y - m);
    ctx.moveTo(x + m - 10, y - m);
    ctx.lineTo(x + m, y - m);
    ctx.lineTo(x + m, y - m + 10);
    ctx.moveTo(x + m, y + m - 10);
    ctx.lineTo(x + m, y + m);
    ctx.lineTo(x + m - 10, y + m);
    ctx.moveTo(x - m + 10, y + m);
    ctx.lineTo(x - m, y + m);
    ctx.lineTo(x - m, y + m - 10);
    ctx.stroke();
    const body = BODIES.find((b) => b.id === target.id);
    if (body) drawPip(ctx, w, h, body, sunCam, target.range);
    else if (
      target.kind === "galaxy" ||
      target.kind === "nebula" ||
      target.kind === "open-cluster" ||
      target.kind === "globular-cluster" ||
      target.kind === "supernova-remnant"
    ) {
      drawGalaxyPip(ctx, w, h, target.id, target.name);
    }
  }

  // Velocity / prograde arrow from screen center
  const vCam = rotate(inv, ship.vel);
  if (vCam.z < -0.05 && Math.hypot(ship.vel.x, ship.vel.y, ship.vel.z) > 0.4) {
    const s = fl / -vCam.z;
    const vx = w / 2 + vCam.x * s * 0.02;
    const vy = h / 2 - vCam.y * s * 0.02;
    ctx.strokeStyle = thrust !== 0 ? "#7eb8c9" : "rgba(201,168,111,0.8)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(w / 2, h / 2);
    ctx.lineTo(vx, vy);
    ctx.stroke();
    ctx.font = `500 ${Math.max(10, w / 140)}px Outfit, sans-serif`;
    ctx.fillStyle = "rgba(201,168,111,0.85)";
    ctx.fillText(thrust !== 0 ? "prograde burn" : "velocity", vx + 6, vy);
  }

  if (thrust !== 0) {
    const glow = ctx.createRadialGradient(w / 2, h * 0.8, 4, w / 2, h, h * 0.35);
    glow.addColorStop(0, thrust > 0 ? "rgba(126,184,201,0.22)" : "rgba(201,168,111,0.2)");
    glow.addColorStop(1, "rgba(5,7,12,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, h * 0.58, w, h * 0.42);
  }

  const lesson = pickLesson({
    dest: destination,
    thrusting: thrust !== 0,
    drifted,
    looking: target?.id ?? null,
  });

  const au = Math.hypot(ship.pos.x - sunP.x, ship.pos.y - sunP.y, ship.pos.z - sunP.z) / AU;
  const nav = navFromProgress(destination, pathPct);

  // Distances in world units → km via destination scale
  const earthDistU = Math.hypot(ship.pos.x - earth.x, ship.pos.y - earth.y, ship.pos.z - earth.z);
  const destDistU = Math.hypot(ship.pos.x - destP.x, ship.pos.y - destP.y, ship.pos.z - destP.z);
  const scaleKm = destination === "moon" ? 384400 / 16 : 1.496e8 / AU;
  const travelledKmSim = ship.travelled * scaleKm;
  // Blend sim path length with nominal progress for stable HUD
  const travelledKm = pathPct > 0.02 ? nav.travelledKm * 0.65 + travelledKmSim * 0.35 : travelledKmSim;
  const remainKm = Math.max(0, nav.totalKm - travelledKm);

  // Target azimuth/elevation of destination
  const destCam = rotate(inv, { x: destP.x - ship.pos.x, y: destP.y - ship.pos.y, z: destP.z - ship.pos.z });
  const destAzEl = azElFromCam(destCam);

  // Mission elapsed time (compressed sim → hours using nominal transfer duration)
  const metHours = nav.totalHours * pathPct;

  const phase =
    destination === "mars"
      ? pathPct < 0.08
        ? "Departure burn"
        : pathPct > 0.92
          ? "Approach / capture"
          : "Heliocentric transfer"
      : pathPct < 0.1
        ? "TLI burn"
        : pathPct > 0.9
          ? "LOI approach"
          : "Translunar coast";

  return {
    target: target
      ? {
          id: target.id,
          name: target.name,
          kind: target.kind,
          blurb: target.blurb,
          fact: target.fact,
          dist: target.dist,
          range: target.range,
          catalog: target.catalog,
          constellation: target.constellation,
          spectral: target.spectral,
          appMag: target.appMag,
          az: target.az,
          el: target.el,
        }
      : null,
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
  };
}

function strokeWorldLoop(ctx: CanvasRenderingContext2D, project: (p: V) => Proj | null, radius: number) {
  ctx.beginPath();
  let started = false;
  for (let i = 0; i <= 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    const pr = project({ x: Math.cos(a) * radius, y: 0, z: Math.sin(a) * radius });
    if (!pr) {
      started = false;
      continue;
    }
    if (!started) {
      ctx.moveTo(pr.x, pr.y);
      started = true;
    } else ctx.lineTo(pr.x, pr.y);
  }
  ctx.stroke();
}

function strokeWorldPolyline(ctx: CanvasRenderingContext2D, project: (p: V) => Proj | null, pts: V[]) {
  ctx.beginPath();
  let started = false;
  for (const p of pts) {
    const pr = project(p);
    if (!pr) {
      started = false;
      continue;
    }
    if (!started) {
      ctx.moveTo(pr.x, pr.y);
      started = true;
    } else ctx.lineTo(pr.x, pr.y);
  }
  ctx.stroke();
}

function labelWorld(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, w: number) {
  ctx.font = `600 ${Math.max(10, w / 120)}px Outfit, sans-serif`;
  ctx.fillStyle = "rgba(201,168,111,0.9)";
  ctx.fillText(text, x + 6, y);
}

function drawGalaxy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  h: number,
  gxy: (typeof GALAXIES)[number],
) {
  const photo = gxy.id === "andromeda" ? photoOf("andromeda") : null;
  if (photo) {
    const scale = Math.min(h * 0.42, 320 * gxy.rx);
    const iw = photo.naturalWidth;
    const ih = photo.naturalHeight;
    ctx.drawImage(photo, x - scale / 2, y - (scale * ih) / iw / 2, scale, (scale * ih) / iw);
    ctx.font = `600 ${Math.max(11, h / 70)}px Outfit, sans-serif`;
    ctx.fillStyle = "rgba(232,237,244,0.7)";
    ctx.fillText(gxy.name, x + scale * 0.18, y - 12);
    return;
  }
  const scale = Math.min(h * 0.2, 100 * gxy.rx);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(0.45);
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, scale);
  glow.addColorStop(0, "rgba(255,236,210,0.6)");
  glow.addColorStop(0.22, "rgba(180,160,210,0.28)");
  glow.addColorStop(1, "rgba(5,6,10,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(0, 0, scale, scale * (gxy.ry / gxy.rx), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,210,180,0.5)";
  for (let i = 0; i < 70; i++) {
    const a = i * 1.618;
    ctx.fillRect(Math.cos(a) * scale * 0.62 * ((i % 7) / 7), Math.sin(a) * scale * 0.3 * ((i % 5) / 5), 1.3, 1.3);
  }
  ctx.restore();
  ctx.font = `600 ${Math.max(10, h / 72)}px Outfit, sans-serif`;
  ctx.fillStyle = "rgba(232,237,244,0.6)";
  ctx.fillText(gxy.name, x + 10, y - 8);
}

function drawWorldBody(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  body: SkyBody,
  sunCam: V,
  cam: V,
) {
  if (body.id === "saturn" && photoOf("saturn")) {
    drawSaturnPhoto(ctx, x, y, r);
    return;
  }
  if (body.kind === "sun") {
    drawSun(ctx, x, y, r);
    return;
  }
  drawGlobe(ctx, x, y, r, body, sunCam, cam);
}

function drawSun(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  const glow = Math.max(r * 4.2, 48);
  const g = ctx.createRadialGradient(x, y, 0, x, y, glow);
  g.addColorStop(0, "rgba(255,248,220,1)");
  g.addColorStop(0.1, "rgba(255,210,120,0.95)");
  g.addColorStop(0.35, "rgba(255,160,60,0.28)");
  g.addColorStop(1, "rgba(255,160,60,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, glow, 0, Math.PI * 2);
  ctx.fill();
  const photo = photoOf("sun");
  if (photo) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();
    const side = Math.min(photo.naturalWidth, photo.naturalHeight);
    const sx = (photo.naturalWidth - side) / 2;
    const sy = (photo.naturalHeight - side) / 2;
    ctx.drawImage(photo, sx, sy, side, side, x - r, y - r, r * 2, r * 2);
    ctx.restore();
    return;
  }
  ctx.fillStyle = "#fff6d0";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawSaturnPhoto(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  const img = photoOf("saturn")!;
  const k = (r * 2) / Math.max(8, img.naturalHeight * 0.92);
  ctx.drawImage(img, x - (img.naturalWidth * k) / 2, y - (img.naturalHeight * k) / 2, img.naturalWidth * k, img.naturalHeight * k);
}

function drawGlobe(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  body: SkyBody,
  sunCam: V,
  cam: V,
) {
  const lx = sunCam.x - cam.x;
  const ly = sunCam.y - cam.y;
  const len = Math.hypot(lx, ly, sunCam.z - cam.z) || 1;
  const ox = (lx / len) * r * 0.42;
  const oy = (-ly / len) * r * 0.42;
  const photo = photoOf(body.id);
  const tex = photo ?? bodyTexture(body.id);

  const atmo =
    body.id === "earth"
      ? "rgba(110,180,255,0.38)"
      : body.id === "mars"
        ? "rgba(196,137,106,0.2)"
        : body.id === "venus"
          ? "rgba(232,214,170,0.28)"
          : body.id === "neptune" || body.id === "uranus"
            ? "rgba(130,180,220,0.2)"
            : "rgba(200,210,220,0.1)";
  ctx.beginPath();
  ctx.arc(x, y, r * 1.08, 0, Math.PI * 2);
  ctx.fillStyle = atmo;
  ctx.fill();

  if (body.id === "saturn" && !photo) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, 0.28);
    ctx.strokeStyle = "rgba(210,190,150,0.45)";
    ctx.lineWidth = r * 0.55;
    ctx.beginPath();
    ctx.arc(0, 0, r * 2.05, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();
  if (photo) {
    const side = Math.min(photo.naturalWidth, photo.naturalHeight);
    const sx = (photo.naturalWidth - side) / 2;
    const sy = (photo.naturalHeight - side) / 2;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(photo, sx, sy, side, side, x - r, y - r, r * 2, r * 2);
  } else {
    ctx.drawImage(tex, x - r, y - r, r * 2, r * 2);
    const shade = ctx.createLinearGradient(x - ox * 2, y - oy * 2, x + ox * 2, y + oy * 2);
    shade.addColorStop(0, "rgba(0,0,0,0.55)");
    shade.addColorStop(0.46, "rgba(0,0,0,0.0)");
    shade.addColorStop(1, "rgba(255,255,255,0.1)");
    ctx.fillStyle = shade;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    const limb = ctx.createRadialGradient(x, y, r * 0.45, x, y, r);
    limb.addColorStop(0, "rgba(0,0,0,0)");
    limb.addColorStop(1, "rgba(0,0,0,0.32)");
    ctx.fillStyle = limb;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ctx.restore();

  if (body.id === "earth") {
    ctx.beginPath();
    ctx.arc(x, y, r * 1.045, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(120,190,255,0.45)";
    ctx.lineWidth = Math.max(1.2, r * 0.045);
    ctx.stroke();
  }

  if (body.id === "saturn" && !photo) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, 0.28);
    ctx.strokeStyle = "rgba(232,214,170,0.7)";
    ctx.lineWidth = r * 0.55;
    ctx.beginPath();
    ctx.arc(0, 0, r * 2.05, 0, Math.PI);
    ctx.stroke();
    ctx.restore();
  }
}

function drawPip(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  body: SkyBody,
  sunCam: V,
  range: string,
) {
  const size = Math.min(188, Math.max(120, w * 0.16));
  const x = w - 28 * (w / 1280) - size / 2;
  const y = h * 0.34;
  ctx.fillStyle = "rgba(9,12,18,0.78)";
  ctx.strokeStyle = "rgba(126,184,201,0.55)";
  ctx.lineWidth = 1.6;
  roundRect(ctx, x - size / 2 - 10, y - size / 2 - 14, size + 20, size + 48, 10);
  ctx.fill();
  ctx.stroke();
  if (body.kind === "sun") drawSun(ctx, x, y, size * 0.32);
  else if (body.id === "saturn") drawWorldBody(ctx, x, y, size * 0.22, body, sunCam, { x: -0.4, y: 0.1, z: -1 });
  else drawGlobe(ctx, x, y, size * 0.4, body, sunCam, { x: -0.35, y: 0.12, z: -1 });
  ctx.textAlign = "center";
  ctx.font = `600 ${Math.max(11, w / 120)}px Outfit, sans-serif`;
  ctx.fillStyle = "#7eb8c9";
  ctx.fillText("Telescope zoom", x, y + size / 2 + 8);
  ctx.font = `400 ${Math.max(10, w / 140)}px Atkinson Hyperlegible, sans-serif`;
  ctx.fillStyle = "#8b97a8";
  ctx.fillText(`${body.name} · ${range}`, x, y + size / 2 + 24);
  ctx.textAlign = "left";
}

function drawGalaxyPip(ctx: CanvasRenderingContext2D, w: number, h: number, id: string, name: string) {
  const size = Math.min(200, Math.max(130, w * 0.18));
  const x = w - 28 * (w / 1280) - size / 2;
  const y = h * 0.34;
  ctx.fillStyle = "rgba(9,12,18,0.78)";
  ctx.strokeStyle = "rgba(126,184,201,0.55)";
  ctx.lineWidth = 1.6;
  roundRect(ctx, x - size / 2 - 10, y - size / 2 - 14, size + 20, size + 48, 10);
  ctx.fill();
  ctx.stroke();
  const gxy = GALAXIES.find((g) => g.id === id);
  if (gxy) drawGalaxy(ctx, x, y, size * 2.2, gxy);
  ctx.textAlign = "center";
  ctx.font = `600 ${Math.max(11, w / 120)}px Outfit, sans-serif`;
  ctx.fillStyle = "#7eb8c9";
  ctx.fillText("Deep-sky zoom", x, y + size / 2 + 8);
  ctx.font = `400 ${Math.max(10, w / 140)}px Atkinson Hyperlegible, sans-serif`;
  ctx.fillStyle = "#8b97a8";
  ctx.fillText(name, x, y + size / 2 + 24);
  ctx.textAlign = "left";
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

type HudSnap = {
  speed: number;
  yaw: number;
  thrust: number;
  boost: boolean;
  target: TargetInfo | null;
  lesson: LessonId;
  drifted: boolean;
  pathPct: number;
  au: number;
  travelledKm: number;
  remainKm: number;
  etaHours: number;
  vKms: number;
  targetAz: number;
  targetEl: number;
  distEarth: number;
  distTarget: number;
  metHours: number;
  phase: string;
};

const hudListeners = new Set<(h: HudSnap) => void>();
function publishHud(h: HudSnap) {
  for (const fn of hudListeners) fn(h);
}

function Hud({ destination }: { destination: DestinationId }) {
  const closeFpv = useGame((s) => s.closeFpv);
  const beginLanding = useGame((s) => s.beginLanding);
  const credits = useGame((s) => s.credits);
  const openLibrary = useGame((s) => s.openLibrary);
  const destLabel = destination === "mars" ? "Mars" : "Moon";
  const [hud, setHud] = useState<HudSnap>({
    speed: 8,
    yaw: 0,
    thrust: 0,
    boost: false,
    target: null,
    lesson: destination === "mars" ? "hohmann" : "visviva",
    drifted: false,
    pathPct: 0,
    au: 1,
    travelledKm: 0,
    remainKm: TRANSFER[destination].km,
    etaHours: TRANSFER[destination].hours,
    vKms: TRANSFER[destination].vKms,
    targetAz: 0,
    targetEl: 0,
    distEarth: 0,
    distTarget: TRANSFER[destination].km,
    metHours: 0,
    phase: destination === "mars" ? "Heliocentric transfer" : "Translunar coast",
  });

  useEffect(() => {
    hudListeners.add(setHud);
    return () => {
      hudListeners.delete(setHud);
    };
  }, []);

  useEffect(() => {
    if (hud.target) {
      const map: Record<string, string> = {
        mars: "distance",
        moon: "distance",
        earth: "why-oxygen",
        sun: "orbits",
        andromeda: "orbits",
        jupiter: "orbits",
        saturn: "orbits",
      };
      const id = map[hud.target.id];
      if (id) useGame.getState().markTopic(id);
    }
    useGame.getState().markTopic(LESSONS[hud.lesson].libraryId);
  }, [hud.target, hud.lesson]);

  const lesson = LESSONS[hud.lesson];
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
              {hud.yaw >= 0 ? "+" : ""}
              {((hud.yaw * 180) / Math.PI).toFixed(0)}°
              {hud.thrust !== 0 ? (hud.boost ? " · BOOST" : " · BURN") : " · COAST"}
              {hud.drifted ? " · off corridor" : ""}
            </p>
          </div>
          <div className="min-w-[17.5rem] rounded-md border border-accent/35 bg-bg/85 px-3 py-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-accent">
              {destination === "mars" ? "MARS TRANSFER" : "MOON TRANSFER"} · {hud.phase}
            </p>
            <dl className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 font-mono text-xs tabular-nums">
              <dt className="text-muted">MET</dt>
              <dd className="text-right text-fg">{formatEta(hud.metHours)}</dd>
              <dt className="text-muted">Travelled</dt>
              <dd className="text-right text-fg">{formatKm(hud.travelledKm)}</dd>
              <dt className="text-muted">Remaining</dt>
              <dd className="text-right text-fg">{formatKm(hud.remainKm)}</dd>
              <dt className="text-muted">ETA</dt>
              <dd className="text-right text-accent">{formatEta(hud.etaHours)}</dd>
              <dt className="text-muted">Velocity</dt>
              <dd className="text-right text-fg">{hud.vKms.toFixed(2)} km/s</dd>
              <dt className="text-muted">Dist Earth</dt>
              <dd className="text-right text-fg">{formatKm(hud.distEarth)}</dd>
              <dt className="text-muted">Dist {destLabel}</dt>
              <dd className="text-right text-fg">{formatKm(hud.distTarget)}</dd>
              <dt className="text-muted">Target AZ</dt>
              <dd className="text-right text-fg">{hud.targetAz.toFixed(1)}°</dd>
              <dt className="text-muted">Target EL</dt>
              <dd className="text-right text-fg">
                {hud.targetEl >= 0 ? "+" : ""}
                {hud.targetEl.toFixed(1)}°
              </dd>
            </dl>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-raised">
              <div className="h-full bg-accent" style={{ width: `${Math.round(hud.pathPct * 100)}%` }} />
            </div>
            <p className="mt-1 font-mono text-[10px] text-muted">Progress {Math.round(hud.pathPct * 100)}%</p>
          </div>
          {hud.target && (
            <article className="max-w-sm rounded-md border border-accent/40 bg-bg/85 p-3">
              <p className="font-display text-sm font-semibold text-fg">{hud.target.name}</p>
              {hud.target.catalog && (
                <p className="mt-0.5 font-mono text-[11px] text-accent">{hud.target.catalog}</p>
              )}
              <p className="mt-0.5 font-mono text-[11px] text-muted">
                {hud.target.kind}
                {hud.target.constellation ? ` · ${hud.target.constellation}` : ""}
                {hud.target.spectral ? ` · ${hud.target.spectral}` : ""}
                {hud.target.appMag != null ? ` · mag ${hud.target.appMag.toFixed(2)}` : ""}
              </p>
              <p className="mt-0.5 font-mono text-[11px] text-accent">
                {hud.target.range} · {hud.target.dist}
              </p>
              {hud.target.az != null && (
                <p className="mt-0.5 font-mono text-[11px] text-muted">
                  AZ {hud.target.az.toFixed(1)}° · EL {hud.target.el != null && hud.target.el >= 0 ? "+" : ""}
                  {hud.target.el?.toFixed(1)}°
                </p>
              )}
              <p className="mt-1 text-xs text-fg/90">{hud.target.blurb}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted">{hud.target.fact}</p>
            </article>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button
            className="pointer-events-auto"
            variant="secondary"
            onClick={() => {
              try {
                if (document.pointerLockElement) document.exitPointerLock();
              } catch {
                /* ignore */
              }
              closeFpv();
            }}
          >
            <X className="size-4" /> Exit camera
          </Button>
          <Button
            className="pointer-events-auto"
            variant={near ? "primary" : "secondary"}
            onClick={() => {
              try {
                if (document.pointerLockElement) document.exitPointerLock();
              } catch {
                /* ignore */
              }
              beginLanding();
            }}
          >
            {near ? "Begin landing" : "Skip to landing"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl rounded-md border border-border bg-bg/80 p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="font-display text-sm font-semibold text-fg">{lesson.title}</p>
            <p className="font-mono text-[11px] tabular-nums text-accent">Path {Math.round(hud.pathPct * 100)}%</p>
          </div>
          <OrbitGlyph lesson={hud.lesson} dest={destination} pct={hud.pathPct} />
          <p className="mt-2 text-xs leading-relaxed text-muted">{lesson.body}</p>
          <p className="mt-1 font-mono text-[11px] text-accent/90">{lesson.formula}</p>
          <button
            type="button"
            className="pointer-events-auto mt-2 text-xs text-accent underline-offset-2 hover:underline"
            onClick={() => openLibrary(lesson.libraryId)}
          >
            Open the science note
          </button>
        </div>
        <p className="hidden max-w-xs text-[11px] text-muted sm:block">
          Reticle auto-locks worlds on the path. W/S thrust · A/D yaw (A left) · drag to look · Z damp · X brake
        </p>
      </div>
    </div>
  );
}

function OrbitGlyph({ lesson, dest, pct }: { lesson: LessonId; dest: DestinationId; pct: number }) {
  const mars = dest === "mars";
  const shipX = 50 + pct * (mars ? 118 : 86);
  return (
    <svg viewBox="0 0 240 64" className="mt-2 h-14 w-full max-w-md text-accent" aria-hidden>
      <circle cx="28" cy="32" r="6" fill="#c9a86f" opacity="0.95" />
      <text x="28" y="58" textAnchor="middle" fill="currentColor" fontSize="7" opacity="0.7">
        Sun
      </text>
      <circle cx="28" cy="32" r="22" fill="none" stroke="currentColor" strokeOpacity="0.4" />
      <circle cx="28" cy="32" r={mars ? 40 : 30} fill="none" stroke="currentColor" strokeOpacity="0.28" />
      {(lesson === "hohmann" || lesson === "window" || lesson === "coast") && (
        <ellipse cx="28" cy="32" rx={mars ? 31 : 26} ry={mars ? 22 : 18} fill="none" stroke="#c9a86f" strokeDasharray="4 3" />
      )}
      {lesson === "visviva" && (
        <>
          <path d="M50 32 C 78 8, 130 8, 168 32" fill="none" stroke="currentColor" />
          <path d="M68 16 l 8 -2 l -2 6" fill="currentColor" />
          <text x="92" y="12" fill="currentColor" fontSize="7">
            faster near Sun
          </text>
          <text x="150" y="14" fill="currentColor" fontSize="7" opacity="0.7">
            slower far
          </text>
        </>
      )}
      {lesson === "burn" && <path d="M96 32 L 138 32 L 130 26 M138 32 L 130 38" fill="none" stroke="currentColor" />}
      {lesson === "gravity" && <path d="M54 12 C 96 12, 118 48, 186 50" fill="none" stroke="currentColor" />}
      <circle cx={mars ? 148 : 118} cy="32" r="5" fill="none" stroke="currentColor" />
      <text x={mars ? 148 : 118} y="58" textAnchor="middle" fill="currentColor" fontSize="7" opacity="0.7">
        {mars ? "Mars" : "Moon"}
      </text>
      <circle cx="72" cy="32" r="4" fill="#7eb8c9" />
      <text x="72" y="22" textAnchor="middle" fill="currentColor" fontSize="7">
        Earth
      </text>
      <circle cx={shipX} cy="20" r="2.6" fill="currentColor" />
      {lesson === "window" && (
        <circle cx={mars ? 168 : 130} cy="32" r="3" fill="none" stroke="#c9a86f" strokeDasharray="2 2" />
      )}
    </svg>
  );
}

function CockpitOverlay() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <path d="M0 0 L0 8 Q50 14 100 8 L100 0 Z" fill="#090C12" opacity="0.72" />
      <path d="M0 100 L0 90 Q50 84 100 90 L100 100 Z" fill="#090C12" opacity="0.78" />
      <path d="M0 0 L7 0 L0 12 Z" fill="#131820" />
      <path d="M100 0 L93 0 L100 12 Z" fill="#131820" />
      <circle cx="50" cy="50" r="1.15" fill="none" stroke="#7EB8C9" strokeWidth="0.12" opacity="0.75" />
      <line x1="50" y1="46.5" x2="50" y2="48.5" stroke="#7EB8C9" strokeWidth="0.1" />
      <line x1="50" y1="51.5" x2="50" y2="53.5" stroke="#7EB8C9" strokeWidth="0.1" />
      <line x1="46.5" y1="50" x2="48.5" y2="50" stroke="#7EB8C9" strokeWidth="0.1" />
      <line x1="51.5" y1="50" x2="53.5" y2="50" stroke="#7EB8C9" strokeWidth="0.1" />
    </svg>
  );
}

function TouchPad() {
  const origin = useRef<{ x: number; y: number } | null>(null);
  const pulse = (codes: string[]) => {
    injected = codes;
  };
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-28 flex items-end justify-between px-4 sm:hidden">
      <div
        className="pointer-events-auto size-28 rounded-full border border-border bg-raised/70"
        onPointerDown={(e) => {
          origin.current = { x: e.clientX, y: e.clientY };
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!origin.current) return;
          const dx = e.clientX - origin.current.x;
          const dy = e.clientY - origin.current.y;
          const next: string[] = [];
          if (dx < -12) next.push("KeyA");
          if (dx > 12) next.push("KeyD");
          if (dy < -12) next.push("KeyW");
          if (dy > 12) next.push("KeyS");
          injected = next;
        }}
        onPointerUp={() => {
          origin.current = null;
          injected = [];
        }}
      />
      <div className="pointer-events-auto mb-1 grid grid-cols-2 gap-2">
        <Button size="sm" variant="secondary" onPointerDown={() => pulse(["KeyW"])} onPointerUp={() => pulse([])}>
          <Zap className="size-4" /> Thrust
        </Button>
        <Button size="sm" variant="secondary" onPointerDown={() => pulse(["KeyZ"])} onPointerUp={() => pulse([])}>
          <RotateCcw className="size-4" /> Damp spin
        </Button>
        <Button size="sm" variant="secondary" onPointerDown={() => pulse(["KeyX"])} onPointerUp={() => pulse([])}>
          <Square className="size-4" /> Brake
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onPointerDown={() => pulse(["ShiftLeft", "KeyW"])}
          onPointerUp={() => pulse([])}
        >
          <Gauge className="size-4" /> Boost
        </Button>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getSpeed: () => number;
      setKeys?: (codes: string[]) => void;
      setSteer?: (v: number) => void;
    };
  }
}
