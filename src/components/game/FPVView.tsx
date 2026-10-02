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
  NEBULAE,
  STAR_BY_ID,
  angOf,
  bodyTexture,
  distToSeg,
  formatRange,
  hohmannEllipse,
  orbitSpeedHint,
  photoOf,
  pickLesson,
  posOf,
  startPose,
  transferPath,
  warmupPhotos,
  type Constel,
  type LessonId,
  type SkyBody,
  type V,
} from "@/game/cosmos";
import { useGame } from "@/game/store";
import { formatEta, formatKm, formatUsd } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const held = new Set<string>();
let injected: string[] | null = null;
let steerOverride: number | null = null;
const look = { dx: 0, dy: 0 };
const pointer = { x: 0.5, y: 0.5, active: false };

let activeZoom = 1.0;
let activeLockId: string | null = null;
let lastTargetRef: TargetInfo | null = null;

export function setFpvZoom(z: number) {
  activeZoom = z;
}

export function toggleFpvTargetLock(id?: string) {
  if (id) {
    activeLockId = activeLockId === id ? null : id;
  } else if (lastTargetRef) {
    activeLockId = activeLockId === lastTargetRef.id ? null : lastTargetRef.id;
  } else {
    activeLockId = null;
  }
}

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
        <SpaceCanvas destination={destination} />
        <CockpitOverlay />
        <Hud destination={destination} />
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
      if (e.code === "Digit1") activeZoom = 1.0;
      if (e.code === "Digit2") activeZoom = 2.5;
      if (e.code === "Digit3") activeZoom = 5.0;
      if (e.code === "Digit4") activeZoom = 10.0;
      if (e.code === "Escape") activeLockId = null;
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
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        if (activeZoom === 1.0) activeZoom = 2.5;
        else if (activeZoom === 2.5) activeZoom = 5.0;
        else if (activeZoom === 5.0) activeZoom = 10.0;
      } else {
        if (activeZoom === 10.0) activeZoom = 5.0;
        else if (activeZoom === 5.0) activeZoom = 2.5;
        else if (activeZoom === 2.5) activeZoom = 1.0;
      }
    };
    const onClick = () => {
      if (lastTargetRef) {
        activeLockId = activeLockId === lastTargetRef.id ? null : lastTargetRef.id;
      }
    };
    wrap.addEventListener("pointerdown", onDown);
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerup", onUp);
    wrap.addEventListener("pointercancel", onUp);
    wrap.addEventListener("wheel", onWheel, { passive: false });
    wrap.addEventListener("click", onClick);

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
        ship.pos.x += ship.vel.x * dt;
        ship.pos.y += ship.vel.y * dt;
        ship.pos.z += ship.vel.z * dt;
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
            zoom: activeZoom,
            isLocked: !!activeLockId && frame.target?.id === activeLockId,
            lesson: frame.lesson,
            drifted: frame.drifted,
            pathPct: frame.pathPct,
            au: frame.au,
            travelledKm: frame.travelledKm,
            remainKm: frame.remainKm,
            etaHours: frame.etaHours,
            vKms: frame.vKms,
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
      wrap.removeEventListener("wheel", onWheel);
      wrap.removeEventListener("click", onClick);
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

type TargetInfo = {
  id: string;
  name: string;
  kind: string;
  blurb: string;
  fact: string;
  dist: string;
  range: string;
  spec?: string;
  meaning?: string;
  isLocked?: boolean;
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
};

type Proj = { x: number; y: number; z: number; s: number; cam?: V };

function paint(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  ship: { pos: V; vel: V; quat: Q },
  destination: DestinationId,
  simT: number,
  thrust: number,
  trail: V[],
): FrameInfo {
  const w = canvas.width;
  const h = canvas.height;
  ctx.fillStyle = "#05060a";
  ctx.fillRect(0, 0, w, h);

  const fl = ((0.5 * h) / Math.tan((62 * Math.PI) / 180 / 2)) * activeZoom;
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

  const milky = projectDir({ x: 0.2, y: 0.05, z: 1 });
  if (milky) {
    const g = ctx.createRadialGradient(milky.x, milky.y, 0, milky.x, milky.y, h * 0.85);
    g.addColorStop(0, "rgba(110,88,64,0.22)");
    g.addColorStop(0.45, "rgba(70,60,90,0.08)");
    g.addColorStop(1, "rgba(5,6,10,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  const drawStar = (st: { x: number; y: number; z: number; b: number; s: number; cr: number; cg: number; cb: number }) => {
    const p = projectDir(st);
    if (!p) return;
    if (p.x < -8 || p.y < -8 || p.x > w + 8 || p.y > h + 8) return;
    const scale = Math.min(2.4, w / 900);
    const sz = st.s * scale;
    if (st.b > 0.62 && sz > 1.15) {
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, sz * 3.2);
      glow.addColorStop(0, `rgba(${st.cr | 0},${st.cg | 0},${st.cb | 0},${Math.min(0.85, st.b)})`);
      glow.addColorStop(0.35, `rgba(${st.cr | 0},${st.cg | 0},${st.cb | 0},${st.b * 0.28})`);
      glow.addColorStop(1, "rgba(5,6,10,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, sz * 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = `rgba(${st.cr | 0},${st.cg | 0},${st.cb | 0},${st.b})`;
    const core = Math.max(0.6, sz);
    ctx.fillRect(p.x - core * 0.4, p.y - core * 0.4, core, core);
  };
  for (const st of MILKY) drawStar(st);
  for (const st of FIELD) drawStar(st);

  for (const neb of NEBULAE) {
    const p = projectDir(neb.dir);
    if (!p) continue;
    const rx = Math.min(h * 0.08, 70 * neb.rx);
    const ry = rx * (neb.ry / neb.rx);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(-0.35);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, `rgba(${neb.color},0.38)`);
    g.addColorStop(0.45, `rgba(${neb.color},0.12)`);
    g.addColorStop(1, "rgba(5,6,10,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const starProj = new Map<string, Proj>();
  for (const star of NAMED_STARS) {
    const p = projectDir(star.dir);
    if (p) starProj.set(star.id, p);
  }

  const aimX = pointer.active && !document.pointerLockElement ? pointer.x * w : w / 2;
  const aimY = pointer.active && !document.pointerLockElement ? pointer.y * h : h / 2;

  let hoverConst: Constel | null = null;
  let hoverConstScore = 18;
  for (const c of CONSTELLATIONS) {
    for (const [a, b] of c.segs) {
      const pa = starProj.get(a);
      const pb = starProj.get(b);
      if (!pa || !pb) continue;
      const d = distToSeg(aimX, aimY, pa.x, pa.y, pb.x, pb.y);
      if (d < hoverConstScore) {
        hoverConstScore = d;
        hoverConst = c;
      }
    }
  }
  if (hoverConstScore > 16) hoverConst = null;

  for (const c of CONSTELLATIONS) {
    const hot = hoverConst?.id === c.id;
    ctx.lineWidth = hot ? Math.max(1.6, w / 1100) : Math.max(1, w / 1700);
    ctx.strokeStyle = hot ? "rgba(201,168,111,0.85)" : "rgba(126,184,201,0.22)";
    ctx.beginPath();
    let started = false;
    for (const [a, b] of c.segs) {
      const pa = starProj.get(a);
      const pb = starProj.get(b);
      if (!pa || !pb) {
        started = false;
        continue;
      }
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      started = true;
    }
    if (started) ctx.stroke();
    if (hot) {
      const pts = c.segs.flatMap(([a, b]) => [starProj.get(a), starProj.get(b)]).filter(Boolean) as Proj[];
      if (pts.length) {
        const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
        const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
        ctx.font = `600 ${Math.max(13, w / 95)}px Outfit, sans-serif`;
        ctx.fillStyle = "rgba(201,168,111,0.95)";
        ctx.fillText(c.name, cx + 12, cy - 10);
        ctx.font = `400 ${Math.max(10, w / 140)}px Atkinson Hyperlegible, sans-serif`;
        ctx.fillStyle = "rgba(232,237,244,0.75)";
        ctx.fillText(c.meaning, cx + 12, cy + 8);
      }
    }
  }

  for (const gxy of GALAXIES) {
    const p = projectDir(gxy.dir);
    if (!p) continue;
    drawGalaxy(ctx, p.x, p.y, h, gxy, false);
  }

  for (const star of NAMED_STARS) {
    const p = starProj.get(star.id);
    if (!p) continue;
    const inFig = hoverConst?.segs.some(([a, b]) => a === star.id || b === star.id) ?? false;
    drawNamedStar(ctx, p.x, p.y, star, inFig, w);
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

  type Cand = TargetInfo & { score: number; x: number; y: number; rad: number };
  const cands: Cand[] = [];
  for (const d of drawn) {
    const distPx = Math.hypot(d.pr.x - aimX, d.pr.y - aimY);
    const hitPad = d.rad + 18;
    if (distPx > hitPad) continue;
    cands.push({
      id: d.body.id,
      name: d.body.name,
      kind: d.body.kind,
      blurb: d.body.blurb,
      fact: d.body.fact,
      dist: d.body.dist,
      range: formatRange(d.dist, destination),
      score: distPx - Math.min(d.rad, 36) * 0.35,
      x: d.pr.x,
      y: d.pr.y,
      rad: d.rad,
    });
  }
  for (const star of NAMED_STARS) {
    const p = starProj.get(star.id);
    if (!p) continue;
    const distPx = Math.hypot(p.x - aimX, p.y - aimY);
    if (distPx > 28) continue;
    cands.push({
      id: star.id,
      name: star.name,
      kind: "star",
      blurb: star.blurb,
      fact: star.fact,
      dist: star.dist,
      range: star.dist,
      spec: star.spec,
      score: distPx - 4,
      x: p.x,
      y: p.y,
      rad: 8 + star.mag,
    });
  }
  for (const gxy of GALAXIES) {
    const p = projectDir(gxy.dir);
    if (!p) continue;
    const distPx = Math.hypot(p.x - aimX, p.y - aimY);
    if (distPx > 72) continue;
    cands.push({
      id: gxy.id,
      name: gxy.name,
      kind: "galaxy",
      blurb: gxy.blurb,
      fact: gxy.fact,
      dist: gxy.dist,
      range: gxy.dist,
      score: distPx - 12,
      x: p.x,
      y: p.y,
      rad: 28,
    });
  }
  for (const neb of NEBULAE) {
    const p = projectDir(neb.dir);
    if (!p) continue;
    const distPx = Math.hypot(p.x - aimX, p.y - aimY);
    if (distPx > 48) continue;
    cands.push({
      id: neb.id,
      name: neb.name,
      kind: "nebula",
      blurb: neb.blurb,
      fact: neb.fact,
      dist: neb.dist,
      range: neb.dist,
      score: distPx,
      x: p.x,
      y: p.y,
      rad: 22,
    });
  }
  if (hoverConst) {
    const pts = hoverConst.segs.flatMap(([a, b]) => [starProj.get(a), starProj.get(b)]).filter(Boolean) as Proj[];
    const cx = pts.length ? pts.reduce((s, p) => s + p.x, 0) / pts.length : aimX;
    const cy = pts.length ? pts.reduce((s, p) => s + p.y, 0) / pts.length : aimY;
    cands.push({
      id: hoverConst.id,
      name: hoverConst.name,
      kind: "constellation",
      blurb: hoverConst.blurb,
      fact: hoverConst.fact,
      dist: hoverConst.dist,
      range: hoverConst.dist,
      meaning: hoverConst.meaning,
      score: hoverConstScore - 6,
      x: cx,
      y: cy,
      rad: 36,
    });
  }
  cands.sort((a, b) => a.score - b.score);

  let target: Cand | null = null;
  if (activeLockId) {
    const locked = cands.find((c) => c.id === activeLockId);
    if (locked) target = locked;
  }
  if (!target) {
    target = cands[0] && cands[0].score < 40 ? cands[0] : null;
  }
  if (!target) {
    const destCand = cands.find((c) => c.id === destId);
    if (destCand && destCand.score < 28) target = destCand;
  }
  lastTargetRef = target ? { ...target, isLocked: target.id === activeLockId } : null;

  if (target) {
    const isTargetLocked = target.id === activeLockId;
    const m = Math.max(16, Math.min(target.rad + 10, 90));
    ctx.strokeStyle = isTargetLocked ? "#FFB300" : (target.kind === "constellation" ? "#c9a86f" : "#7eb8c9");
    ctx.lineWidth = isTargetLocked ? 2.0 : 1.5;
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

    if (isTargetLocked) {
      ctx.font = `700 ${Math.max(10, w / 130)}px Outfit, sans-serif`;
      ctx.fillStyle = "#FFB300";
      ctx.fillText("TARGET LOCKED · 100% TRK", x - m, y - m - 6);
    }
    const side = x < w * 0.55 ? 1 : -1;
    const lx = x + side * (Math.min(target.rad, 80) + 14);
    ctx.textAlign = side > 0 ? "left" : "right";
    ctx.font = `600 ${Math.max(12, w / 100)}px Outfit, sans-serif`;
    ctx.fillStyle = "rgba(232,237,244,0.95)";
    ctx.fillText(target.name, lx, y - 4);
    ctx.font = `400 ${Math.max(10, w / 140)}px Atkinson Hyperlegible, sans-serif`;
    ctx.fillStyle = "rgba(139,151,168,0.95)";
    ctx.fillText(target.spec ? `${target.spec} · ${target.dist}` : `${target.dist} · ${target.range}`, lx, y + 14);
    ctx.textAlign = "left";
    const body = BODIES.find((b) => b.id === target.id);
    if (body) drawPip(ctx, w, h, body, sunCam, target.range);
    else if (target.kind === "galaxy") drawGalaxyPip(ctx, w, h, target.id, target.name);
    else if (target.kind === "star") drawStarPip(ctx, w, h, target);
    else if (target.kind === "constellation" && hoverConst) drawConstelPip(ctx, w, h, hoverConst);
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

  ctx.strokeStyle = "rgba(232,237,244,0.35)";
  ctx.lineWidth = 1;
  const rsz = Math.max(10, w / 160);
  ctx.beginPath();
  ctx.moveTo(aimX - rsz, aimY);
  ctx.lineTo(aimX - 4, aimY);
  ctx.moveTo(aimX + 4, aimY);
  ctx.lineTo(aimX + rsz, aimY);
  ctx.moveTo(aimX, aimY - rsz);
  ctx.lineTo(aimX, aimY - 4);
  ctx.moveTo(aimX, aimY + 4);
  ctx.lineTo(aimX, aimY + rsz);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(aimX, aimY, 3, 0, Math.PI * 2);
  ctx.stroke();

  const lesson = pickLesson({
    dest: destination,
    thrusting: thrust !== 0,
    drifted,
    looking: target?.id ?? null,
  });

  const au = Math.hypot(ship.pos.x - sunP.x, ship.pos.y - sunP.y, ship.pos.z - sunP.z) / AU;
  const nav = navFromProgress(destination, pathPct);

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
          spec: target.spec,
          meaning: target.meaning,
        }
      : null,
    lesson,
    drifted,
    pathPct,
    au,
    travelledKm: nav.travelledKm,
    remainKm: nav.remainKm,
    etaHours: nav.etaHours,
    vKms: nav.vKms,
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
  labeled: boolean,
) {
  const photo = photoOf(gxy.id);
  if (photo) {
    const scale = Math.min(h * 0.42, 320 * gxy.rx);
    const iw = photo.naturalWidth;
    const ih = photo.naturalHeight;
    ctx.drawImage(photo, x - scale / 2, y - (scale * ih) / iw / 2, scale, (scale * ih) / iw);
    if (labeled) {
      ctx.font = `600 ${Math.max(11, h / 70)}px Outfit, sans-serif`;
      ctx.fillStyle = "rgba(232,237,244,0.7)";
      ctx.fillText(gxy.name, x + scale * 0.18, y - 12);
    }
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
  if (labeled) {
    ctx.font = `600 ${Math.max(10, h / 72)}px Outfit, sans-serif`;
    ctx.fillStyle = "rgba(232,237,244,0.6)";
    ctx.fillText(gxy.name, x + 10, y - 8);
  }
}

function hexRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16) || 220,
    g: parseInt(h.slice(2, 4), 16) || 220,
    b: parseInt(h.slice(4, 6), 16) || 255,
  };
}

function drawNamedStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  star: { color: string; mag: number; name: string },
  named: boolean,
  w: number,
) {
  const { r, g, b } = hexRgb(star.color);
  const core = 1.3 + star.mag * 0.7;
  const halo = core * 5.5;
  const glow = ctx.createRadialGradient(x, y, 0, x, y, halo);
  glow.addColorStop(0, `rgba(${r},${g},${b},0.95)`);
  glow.addColorStop(0.18, `rgba(${r},${g},${b},0.55)`);
  glow.addColorStop(0.55, `rgba(${r},${g},${b},0.12)`);
  glow.addColorStop(1, "rgba(5,6,10,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, halo, 0, Math.PI * 2);
  ctx.fill();
  if (star.mag > 1.2) {
    ctx.strokeStyle = `rgba(${r},${g},${b},0.35)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - halo * 0.85, y);
    ctx.lineTo(x + halo * 0.85, y);
    ctx.moveTo(x, y - halo * 0.55);
    ctx.lineTo(x, y + halo * 0.55);
    ctx.stroke();
  }
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.beginPath();
  ctx.arc(x, y, core, 0, Math.PI * 2);
  ctx.fill();
  if (named) {
    ctx.font = `500 ${Math.max(11, w / 120)}px Outfit, sans-serif`;
    ctx.fillStyle = "rgba(232,237,244,0.88)";
    ctx.fillText(star.name, x + 10, y - 6);
  }
}

function drawStarPip(ctx: CanvasRenderingContext2D, w: number, h: number, t: TargetInfo) {
  const size = Math.min(168, Math.max(110, w * 0.14));
  const x = w - 28 * (w / 1280) - size / 2;
  const y = h * 0.34;
  ctx.fillStyle = "rgba(9,12,18,0.78)";
  ctx.strokeStyle = "rgba(126,184,201,0.55)";
  ctx.lineWidth = 1.6;
  roundRect(ctx, x - size / 2 - 10, y - size / 2 - 14, size + 20, size + 48, 10);
  ctx.fill();
  ctx.stroke();
  const star = NAMED_STARS.find((s) => s.id === t.id);
  if (star) drawNamedStar(ctx, x, y, star, false, w);
  ctx.textAlign = "center";
  ctx.font = `600 ${Math.max(11, w / 120)}px Outfit, sans-serif`;
  ctx.fillStyle = "#7eb8c9";
  ctx.fillText("Star zoom", x, y + size / 2 + 8);
  ctx.font = `400 ${Math.max(10, w / 140)}px Atkinson Hyperlegible, sans-serif`;
  ctx.fillStyle = "#8b97a8";
  ctx.fillText(`${t.name} · ${t.spec ?? ""}`, x, y + size / 2 + 24);
  ctx.textAlign = "left";
}

function drawConstelPip(ctx: CanvasRenderingContext2D, w: number, h: number, c: Constel) {
  const size = Math.min(188, Math.max(120, w * 0.16));
  const x = w - 28 * (w / 1280) - size / 2;
  const y = h * 0.34;
  ctx.fillStyle = "rgba(9,12,18,0.78)";
  ctx.strokeStyle = "rgba(201,168,111,0.55)";
  ctx.lineWidth = 1.6;
  roundRect(ctx, x - size / 2 - 10, y - size / 2 - 14, size + 20, size + 52, 10);
  ctx.fill();
  ctx.stroke();
  const ids = [...new Set(c.segs.flat())];
  const pts = ids.map((id) => STAR_BY_ID.get(id)).filter(Boolean) as typeof NAMED_STARS;
  let minX = 1e9,
    maxX = -1e9,
    minY = 1e9,
    maxY = -1e9;
  const raw = pts.map((s) => {
    const px = s.dir.x;
    const py = -s.dir.y;
    minX = Math.min(minX, px);
    maxX = Math.max(maxX, px);
    minY = Math.min(minY, py);
    maxY = Math.max(maxY, py);
    return { s, px, py };
  });
  const span = Math.max(maxX - minX, maxY - minY, 0.08);
  const map = (px: number, py: number) => ({
    x: x + ((px - (minX + maxX) / 2) / span) * size * 0.62,
    y: y + ((py - (minY + maxY) / 2) / span) * size * 0.62,
  });
  ctx.strokeStyle = "rgba(201,168,111,0.85)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  for (const [a, b] of c.segs) {
    const sa = STAR_BY_ID.get(a);
    const sb = STAR_BY_ID.get(b);
    if (!sa || !sb) continue;
    const pa = map(sa.dir.x, -sa.dir.y);
    const pb = map(sb.dir.x, -sb.dir.y);
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
  }
  ctx.stroke();
  for (const r of raw) {
    const p = map(r.px, r.py);
    ctx.fillStyle = r.s.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.textAlign = "center";
  ctx.font = `600 ${Math.max(11, w / 120)}px Outfit, sans-serif`;
  ctx.fillStyle = "#c9a86f";
  ctx.fillText("Constellation", x, y + size / 2 + 10);
  ctx.font = `400 ${Math.max(10, w / 140)}px Atkinson Hyperlegible, sans-serif`;
  ctx.fillStyle = "#8b97a8";
  ctx.fillText(c.name, x, y + size / 2 + 26);
  ctx.textAlign = "left";
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
  if (gxy) drawGalaxy(ctx, x, y, size * 2.2, gxy, false);
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
  zoom: number;
  isLocked: boolean;
  lesson: LessonId;
  drifted: boolean;
  pathPct: number;
  au: number;
  travelledKm: number;
  remainKm: number;
  etaHours: number;
  vKms: number;
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
    zoom: 1.0,
    isLocked: false,
    lesson: destination === "mars" ? "hohmann" : "visviva",
    drifted: false,
    pathPct: 0,
    au: 1,
    travelledKm: 0,
    remainKm: TRANSFER[destination].km,
    etaHours: TRANSFER[destination].hours,
    vKms: TRANSFER[destination].vKms,
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
          <div className="min-w-[16.5rem] rounded-md border border-accent/35 bg-bg/85 px-3 py-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-accent">Nav computer · {destLabel}</p>
            <dl className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 font-mono text-xs tabular-nums">
              <dt className="text-muted">Travelled</dt>
              <dd className="text-right text-fg">{formatKm(hud.travelledKm)}</dd>
              <dt className="text-muted">Remaining</dt>
              <dd className="text-right text-fg">{formatKm(hud.remainKm)}</dd>
              <dt className="text-muted">Time to {destLabel}</dt>
              <dd className="text-right text-accent">{formatEta(hud.etaHours)}</dd>
              <dt className="text-muted">Range rate</dt>
              <dd className="text-right text-fg">−{hud.vKms.toFixed(2)} km/s</dd>
            </dl>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-raised">
              <div className="h-full bg-accent" style={{ width: `${Math.round(hud.pathPct * 100)}%` }} />
            </div>
          </div>
          {hud.target && (
            <article className="max-w-sm rounded-md border border-accent/40 bg-bg/85 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-sm font-semibold text-fg">{hud.target.name}</p>
                <button
                  type="button"
                  className={cn(
                    "pointer-events-auto rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase transition-colors",
                    hud.isLocked
                      ? "border border-amber-500/50 bg-amber-500/20 text-amber-400"
                      : "border border-border bg-surface text-muted hover:text-fg"
                  )}
                  onClick={() => toggleFpvTargetLock(hud.target?.id)}
                >
                  {hud.isLocked ? "🔒 Locked" : "🔓 Click to Lock"}
                </button>
              </div>
              <p className="mt-0.5 font-mono text-[11px] text-accent">
                {hud.target.kind === "constellation" ? "Constellation" : hud.target.kind}
                {hud.target.spec ? ` · ${hud.target.spec}` : ""} · {hud.target.dist}
              </p>
              {hud.target.meaning && <p className="mt-1 text-xs text-fg/90">{hud.target.meaning}</p>}
              <p className="mt-1 text-xs text-fg/90">{hud.target.blurb}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted">{hud.target.fact}</p>
            </article>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="pointer-events-auto flex items-center gap-1 rounded-md border border-border bg-bg/85 p-1 shadow-md">
            <span className="px-1 font-mono text-[10px] text-muted">OPTIC</span>
            {[1, 2.5, 5, 10].map((z) => (
              <button
                key={z}
                type="button"
                className={cn(
                  "rounded px-2 py-0.5 font-mono text-xs transition-colors",
                  hud.zoom === z ? "bg-accent text-bg font-bold shadow-sm" : "text-muted hover:text-fg hover:bg-surface"
                )}
                onClick={() => setFpvZoom(z)}
              >
                {z}x
              </button>
            ))}
            <span className="pl-1 pr-1.5 font-mono text-[10px] text-accent">FOV {(62 / hud.zoom).toFixed(1)}°</span>
          </div>
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
          Reticle locks what you point at — planets, stars, or constellation lines. W/S thrust · A/D yaw (A left) · drag to look · Z damp · X brake
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
