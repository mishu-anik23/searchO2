import { useEffect, useRef } from "react";
import { DESTINATIONS, TRANSFER, type DestinationId } from "@/game/data";
import {
  AU,
  BODIES,
  FIELD,
  angOf,
  hohmannEllipse,
  photoOf,
  posOf,
  transferPath,
  warmupPhotos,
  type V,
} from "@/game/cosmos";
import { useGame } from "@/game/store";
import { cn, formatEta, formatKm } from "@/lib/utils";

type Q = { x: number; y: number; z: number; w: number };
type Mode = "cinematic" | "cockpit";

function nrm(v: V): V {
  const n = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / n, y: v.y / n, z: v.z / n };
}
function cross(a: V, b: V): V {
  return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x };
}
function lerp(a: V, b: V, t: number): V {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t };
}
function along(path: V[], u: number): V {
  const t = Math.min(1, Math.max(0, u)) * (path.length - 1);
  const i = Math.floor(t);
  const f = t - i;
  const a = path[i];
  const b = path[Math.min(path.length - 1, i + 1)];
  return lerp(a, b, f);
}
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
function qConj(q: Q): Q {
  return { x: -q.x, y: -q.y, z: -q.z, w: q.w };
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
function quatFromBasis(x: V, y: V, z: V): Q {
  const m00 = x.x;
  const m01 = y.x;
  const m02 = z.x;
  const m10 = x.y;
  const m11 = y.y;
  const m12 = z.y;
  const m20 = x.z;
  const m21 = y.z;
  const m22 = z.z;
  const tr = m00 + m11 + m22;
  let q: Q;
  if (tr > 0) {
    const s = Math.sqrt(tr + 1) * 2;
    q = { w: 0.25 * s, x: (m21 - m12) / s, y: (m02 - m20) / s, z: (m10 - m01) / s };
  } else if (m00 > m11 && m00 > m22) {
    const s = Math.sqrt(1 + m00 - m11 - m22) * 2;
    q = { w: (m21 - m12) / s, x: 0.25 * s, y: (m01 + m10) / s, z: (m02 + m20) / s };
  } else if (m11 > m22) {
    const s = Math.sqrt(1 + m11 - m00 - m22) * 2;
    q = { w: (m02 - m20) / s, x: (m01 + m10) / s, y: 0.25 * s, z: (m12 + m21) / s };
  } else {
    const s = Math.sqrt(1 + m22 - m00 - m11) * 2;
    q = { w: (m10 - m01) / s, x: (m02 + m20) / s, y: (m12 + m21) / s, z: 0.25 * s };
  }
  qNorm(q);
  return q;
}
function lookAtQuat(from: V, to: V): Q {
  const fwd = nrm({ x: to.x - from.x, y: to.y - from.y, z: to.z - from.z });
  const z = { x: -fwd.x, y: -fwd.y, z: -fwd.z };
  const worldUp = Math.abs(fwd.y) > 0.92 ? { x: 0, y: 0, z: 1 } : { x: 0, y: 1, z: 0 };
  let x = cross(worldUp, z);
  if (Math.hypot(x.x, x.y, x.z) < 1e-5) x = { x: 1, y: 0, z: 0 };
  x = nrm(x);
  const y = nrm(cross(z, x));
  x = nrm(cross(y, z));
  return quatFromBasis(x, y, z);
}

const SHOW = new Set(["sun", "mercury", "venus", "earth", "moon", "mars", "jupiter"]);

export function JourneyCanvas({
  dest,
  mode = "cinematic",
  interactive = true,
  className,
}: {
  dest: DestinationId;
  mode?: Mode;
  interactive?: boolean;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const destRef = useRef(dest);
  destRef.current = dest;
  const reduced = useGame((s) => s.reducedMotion);
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  useEffect(() => {
    warmupPhotos();
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    if (!ctx) return;

    const look = { yaw: 0, pitch: mode === "cockpit" ? 0.04 : 0.12 };
    let dragging = false;
    let lastPtr = { x: 0, y: 0 };
    let simT = 0.35;
    let raf = 0;
    let last = performance.now();

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
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
      if (!interactive) return;
      dragging = true;
      lastPtr = { x: e.clientX, y: e.clientY };
      wrap.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastPtr.x;
      const dy = e.clientY - lastPtr.y;
      lastPtr = { x: e.clientX, y: e.clientY };
      look.yaw += dx * 0.005;
      look.pitch = Math.max(-0.85, Math.min(0.85, look.pitch + dy * 0.004));
    };
    const onUp = () => {
      dragging = false;
    };
    wrap.addEventListener("pointerdown", onDown);
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerup", onUp);
    wrap.addEventListener("pointercancel", onUp);

    const paint = () => {
      const w = canvas.width;
      const h = canvas.height;
      const destId = destRef.current;
      const cache = new Map<string, V>();
      const earth = posOf("earth", 0, cache);
      const target = posOf(destId, 0, cache);
      const path = transferPath(destId, 0, destId === "moon" ? 56 : 72);
      const cycle = destId === "moon" ? 22 : 36;
      const u = ((simT / cycle) % 1 + 1) % 1;
      const ship = along(path, u);

      let cam: V;
      let quat: Q;
      if (mode === "cockpit") {
        const uLook = destId === "moon" ? 0.18 + (u % 1) * 0.62 : 0.1 + (u % 1) * 0.72;
        cam = along(path, uLook);
        const aim =
          destId === "moon"
            ? lerp(earth, target, 0.55 + Math.sin(simT * 0.4) * 0.12)
            : along(path, Math.min(0.99, uLook + 0.1));
        quat = lookAtQuat(cam, aim);
        quat = qMul(quat, qEulerYXZ(-look.pitch, look.yaw, 0));
        qNorm(quat);
      } else if (destId === "moon") {
        const ang = simT * 0.16 + look.yaw;
        const dist = 21;
        cam = {
          x: earth.x + Math.cos(ang) * dist,
          y: earth.y + 7.5 + look.pitch * 7,
          z: earth.z + Math.sin(ang) * dist,
        };
        const aim = {
          x: earth.x * 0.68 + target.x * 0.32,
          y: earth.y + 0.8,
          z: earth.z * 0.68 + target.z * 0.32,
        };
        quat = lookAtQuat(cam, aim);
      } else {
        const mid = lerp(earth, target, 0.42);
        const ang = simT * 0.05 + look.yaw;
        cam = {
          x: mid.x + Math.cos(ang) * 28,
          y: 62 + look.pitch * 16,
          z: mid.z + Math.sin(ang) * 28,
        };
        quat = lookAtQuat(cam, mid);
      }

      const inv = qConj(quat);
      const fov = mode === "cockpit" ? 68 : 56;
      const fl = (0.5 * h) / Math.tan((fov * Math.PI) / 180 / 2);

      type P = { x: number; y: number; z: number; s: number };
      const project = (p: V): P | null => {
        const r = rotate(inv, { x: p.x - cam.x, y: p.y - cam.y, z: p.z - cam.z });
        if (r.z >= -0.12) return null;
        const s = fl / -r.z;
        return { x: w / 2 + r.x * s, y: h / 2 - r.y * s, z: r.z, s };
      };
      const projectDir = (d: V): P | null => {
        const r = rotate(inv, nrm(d));
        if (r.z >= -0.02) return null;
        const s = fl / -r.z;
        return { x: w / 2 + r.x * s, y: h / 2 - r.y * s, z: r.z, s };
      };

      ctx.fillStyle = "#05070c";
      ctx.fillRect(0, 0, w, h);

      const starN = mode === "cockpit" ? FIELD.length : Math.min(FIELD.length, 520);
      for (let i = 0; i < starN; i++) {
        const st = FIELD[i];
        const p = projectDir(st);
        if (!p) continue;
        if (p.x < -6 || p.y < -6 || p.x > w + 6 || p.y > h + 6) continue;
        const sz = Math.max(0.5, st.s * (w / 1400));
        ctx.fillStyle = `rgba(${st.cr | 0},${st.cg | 0},${st.cb | 0},${st.b * 0.9})`;
        ctx.fillRect(p.x, p.y, sz, sz);
      }

      const drawOrbit = (id: string, radius: number, color: string) => {
        const b = BODIES.find((x) => x.id === id);
        if (!b?.orbit) return;
        ctx.beginPath();
        let started = false;
        const n = 64;
        for (let i = 0; i <= n; i++) {
          const a = (i / n) * Math.PI * 2;
          const p = project({
            x: Math.cos(a) * radius,
            y: 0,
            z: Math.sin(a) * radius,
          });
          if (!p) {
            started = false;
            continue;
          }
          if (!started) {
            ctx.moveTo(p.x, p.y);
            started = true;
          } else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(1, w / 1400);
        ctx.stroke();
      };
      drawOrbit("earth", AU, "rgba(126,184,201,0.22)");
      if (destId === "mars") drawOrbit("mars", BODIES.find((b) => b.id === "mars")!.orbit!, "rgba(196,137,106,0.28)");

      const moonOrbit = BODIES.find((b) => b.id === "moon")?.orbit ?? 16;
      ctx.beginPath();
      let mStart = false;
      for (let i = 0; i <= 48; i++) {
        const a = (i / 48) * Math.PI * 2;
        const p = project({
          x: earth.x + Math.cos(a) * moonOrbit,
          y: earth.y,
          z: earth.z + Math.sin(a) * moonOrbit,
        });
        if (!p) {
          mStart = false;
          continue;
        }
        if (!mStart) {
          ctx.moveTo(p.x, p.y);
          mStart = true;
        } else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = "rgba(197,212,227,0.28)";
      ctx.lineWidth = Math.max(1, w / 1600);
      ctx.stroke();

      if (destId === "mars") {
        const fromAng = angOf("earth", 0);
        const rMars = BODIES.find((b) => b.id === "mars")?.orbit ?? AU * 1.52;
        const oval = hohmannEllipse(AU, rMars, fromAng, 80);
        ctx.beginPath();
        let oStart = false;
        for (const pt of oval) {
          const p = project(pt);
          if (!p) {
            oStart = false;
            continue;
          }
          if (!oStart) {
            ctx.moveTo(p.x, p.y);
            oStart = true;
          } else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = "rgba(201,168,111,0.55)";
        ctx.setLineDash([6, 8]);
        ctx.lineWidth = Math.max(1.2, w / 1100);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.beginPath();
      let pStart = false;
      for (const pt of path) {
        const p = project(pt);
        if (!p) {
          pStart = false;
          continue;
        }
        if (!pStart) {
          ctx.moveTo(p.x, p.y);
          pStart = true;
        } else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = destId === "moon" ? "rgba(126,184,201,0.7)" : "rgba(196,137,106,0.7)";
      ctx.lineWidth = Math.max(1.4, w / 900);
      ctx.stroke();

      type Drawn = { id: string; name: string; p: P; r: number; color: string; kind: string };
      const drawn: Drawn[] = [];
      for (const b of BODIES) {
        if (!SHOW.has(b.id)) continue;
        if (destId === "moon" && (b.id === "jupiter" || b.id === "mars")) continue;
        const pos = posOf(b.id, 0, cache);
        const p = project(pos);
        if (!p) continue;
        const minR = b.id === "earth" || b.id === "moon" || b.id === "mars" ? 7 : b.kind === "sun" ? 8 : 2.4;
        const rad = Math.max(minR, b.r * p.s);
        drawn.push({ id: b.id, name: b.name, p, r: rad, color: b.color, kind: b.kind });
      }
      drawn.sort((a, b) => a.p.z - b.p.z);

      for (const d of drawn) {
        if (d.kind === "sun") {
          const g = ctx.createRadialGradient(d.p.x, d.p.y, 0, d.p.x, d.p.y, d.r * 3.4);
          g.addColorStop(0, "rgba(255,244,208,0.95)");
          g.addColorStop(0.35, "rgba(255,210,140,0.45)");
          g.addColorStop(1, "rgba(5,7,12,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(d.p.x, d.p.y, d.r * 3.4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.save();
        ctx.beginPath();
        ctx.arc(d.p.x, d.p.y, d.r, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        const photo = photoOf(d.id);
        if (photo) {
          ctx.drawImage(photo, d.p.x - d.r, d.p.y - d.r, d.r * 2, d.r * 2);
        } else {
          ctx.fillStyle = d.color;
          ctx.fill();
        }
        ctx.restore();
        if (d.id === "earth" || d.id === "mars") {
          ctx.beginPath();
          ctx.arc(d.p.x, d.p.y, d.r * 1.08, 0, Math.PI * 2);
          ctx.strokeStyle = d.id === "earth" ? "rgba(126,184,201,0.45)" : "rgba(196,137,106,0.4)";
          ctx.lineWidth = Math.max(1, d.r * 0.06);
          ctx.stroke();
        }
      }

      const sp = project(ship);
      if (sp) {
        const burning = u < 0.08 || u > 0.88;
        if (burning) {
          const g = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, 18);
          g.addColorStop(0, "rgba(232,237,244,0.85)");
          g.addColorStop(0.4, "rgba(126,184,201,0.4)");
          g.addColorStop(1, "rgba(5,7,12,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, 18, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = "#e8edf4";
        ctx.beginPath();
        ctx.moveTo(sp.x, sp.y - 7);
        ctx.lineTo(sp.x + 5, sp.y + 6);
        ctx.lineTo(sp.x - 5, sp.y + 6);
        ctx.closePath();
        ctx.fill();
      }

      if (mode !== "cockpit") {
        ctx.font = `${Math.max(11, Math.round(w / 92))}px "IBM Plex Mono", ui-monospace, monospace`;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        for (const d of drawn) {
          if (d.r < 4 && d.id !== "moon") continue;
          if (d.id === "mercury" || d.id === "venus") continue;
          ctx.fillStyle = "rgba(232,237,244,0.82)";
          ctx.fillText(d.name, d.p.x + d.r + 6, d.p.y);
        }
        if (sp) {
          ctx.fillStyle = "rgba(126,184,201,0.9)";
          ctx.fillText("craft", sp.x + 10, sp.y - 8);
        }
      }

      wrap.dataset.progress = u.toFixed(3);
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!document.hidden && !reducedRef.current) simT += dt;
      paint();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      wrap.removeEventListener("pointerdown", onDown);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerup", onUp);
      wrap.removeEventListener("pointercancel", onUp);
    };
  }, [interactive, mode]);

  const spec = TRANSFER[dest];
  const world = DESTINATIONS[dest];

  return (
    <div
      ref={wrapRef}
      className={cn("relative overflow-hidden bg-bg touch-none select-none", className)}
      role="img"
      aria-label={`Animated ${world.name} transfer from Earth`}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-bg/90 to-transparent px-3 py-3 sm:px-4">
        <div>
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-accent">
            {mode === "cockpit" ? "Flight camera preview" : "Transfer path"}
          </p>
          <p className="font-display text-sm font-semibold sm:text-base">
            Earth → {world.name}
          </p>
        </div>
        <p className="font-mono text-[0.7rem] tabular-nums text-muted sm:text-xs">
          {formatKm(spec.km)} · {formatEta(spec.hours)}
        </p>
      </div>
    </div>
  );
}
