import { useEffect, useMemo, useRef } from "react";
import { MAP_D, MAP_W, buildHeight, civHint, elevColor, siteById, type MarsSiteId } from "@/game/mars";
import { MARS_CIV_STEPS, civLedger } from "@/game/data";
import { cn } from "@/lib/utils";

type Pt = { x: number; y: number; s: number };

export function MarsCiv({
  siteId,
  step,
  reduced,
  className,
}: {
  siteId: MarsSiteId;
  step: number;
  reduced: boolean;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const height = useMemo(() => buildHeight(siteId), [siteId]);
  const site = siteById(siteId);
  const built = Math.min(Math.max(step, 0), MARS_CIV_STEPS.length);
  const layer = MARS_CIV_STEPS[Math.min(Math.max(0, built - 1), MARS_CIV_STEPS.length - 1)];
  const hint = civHint(layer.id, site);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    if (!ctx) return;

    const look = { yaw: 0.72, pitch: 0.42 };
    let dragging = false;
    let last = { x: 0, y: 0 };
    let t = 0;
    let raf = 0;
    let prev = performance.now();
    const ice = siteId === "boreum" || siteId === "arcadia";

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      const w = Math.max(1, wrap.clientWidth);
      const h = Math.max(1, wrap.clientHeight);
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);

    const onDown = (e: PointerEvent) => {
      dragging = true;
      last = { x: e.clientX, y: e.clientY };
      wrap.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      look.yaw += (e.clientX - last.x) * 0.005;
      look.pitch = Math.max(0.18, Math.min(0.95, look.pitch + (e.clientY - last.y) * 0.004));
      last = { x: e.clientX, y: e.clientY };
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
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "#2a1c16");
      sky.addColorStop(0.55, "#c4896a");
      sky.addColorStop(1, "#8a4e38");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      const fl = h * 0.95;
      const camDist = 92;
      const camH = 22 + look.pitch * 26;
      const cy = Math.cos(look.yaw);
      const sy = Math.sin(look.yaw);
      const cam = { x: sy * camDist, y: camH, z: -cy * camDist };

      const project = (x: number, y: number, z: number): Pt | null => {
        const rx = x - cam.x;
        const ry = y - cam.y;
        const rz = z - cam.z;
        const x2 = rx * cy - rz * sy;
        const z2 = rx * sy + rz * cy;
        if (z2 > -4) return null;
        const s = fl / -z2;
        return { x: w * 0.5 + x2 * s, y: h * 0.46 - ry * s, s };
      };

      const cell = 3.2;
      const ox = -((MAP_W - 1) * cell) / 2;
      const oz = -((MAP_D - 1) * cell) / 2;
      const amp = 14;
      const groundY = (i: number, j: number) => height[j * MAP_W + i] * amp;

      for (let j = MAP_D - 2; j >= 0; j--) {
        for (let i = 0; i < MAP_W - 1; i++) {
          const h00 = height[j * MAP_W + i];
          const h10 = height[j * MAP_W + i + 1];
          const h01 = height[(j + 1) * MAP_W + i];
          const a = project(ox + i * cell, h00 * amp, oz + j * cell);
          const b = project(ox + (i + 1) * cell, h10 * amp, oz + j * cell);
          const c = project(ox + i * cell, h01 * amp, oz + (j + 1) * cell);
          if (!a || !b || !c) continue;
          const [cr, cg, cb] = elevColor(siteId, (h00 + h10) * 0.5, ice);
          const shade = 0.7 + h00 * 0.3;
          ctx.fillStyle = `rgb(${(cr * shade) | 0},${(cg * shade) | 0},${(cb * shade) | 0})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.lineTo(c.x, c.y);
          ctx.closePath();
          ctx.fill();
        }
      }

      const gy = groundY((MAP_W / 2) | 0, (MAP_D / 2) | 0);

      if (built >= 1) {
        flags(ctx, project, -18, gy, 10);
        rover(ctx, project, -8, gy, 6);
      }
      if (built >= 2) {
        if (siteId === "boreum") reactor(ctx, project, 28, gy, -18);
        else solar(ctx, project, 26, gy, -16, t, reduced);
      }
      if (built >= 3) mine(ctx, project, -26, gy, -8, ice);
      if (built >= 4) moxie(ctx, project, 8, gy, 10, t, reduced);
      if (built >= 5) hall(ctx, project, 0, gy, -2, built >= 6);
      if (built >= 7) greenhouse(ctx, project, 16, gy, 18, t, reduced);
      if (built >= 8) tanks(ctx, project, -14, gy, 16, "#7eb8c9", "H2O");
      if (built >= 9) kiln(ctx, project, 32, gy, 8);
      if (built >= 10) {
        tanks(ctx, project, -30, gy, 18, "#c9a86f", "CH4");
        sabatier(ctx, project, -22, gy, 6, t, reduced);
      }

      const ledger = civLedger(MARS_CIV_STEPS, built);
      ctx.fillStyle = "rgba(9,12,18,0.72)";
      ctx.fillRect(12, h - 58, w - 24, 46);
      ctx.strokeStyle = "rgba(42,51,68,0.9)";
      ctx.strokeRect(12, h - 58, w - 24, 46);
      ctx.font = `500 ${Math.max(11, w / 92)}px "IBM Plex Mono", ui-monospace, monospace`;
      ctx.fillStyle = "#7eb8c9";
      ctx.fillText(
        `${ledger.powerKw} kW  ·  H₂O ${ledger.waterKgDay} kg/d  ·  O₂ ${ledger.o2KgDay.toFixed(1)} kg/d  ·  CH₄ ${ledger.ch4Kg} kg`,
        22,
        h - 30,
      );
      ctx.font = `400 ${Math.max(10, w / 110)}px "Atkinson Hyperlegible", sans-serif`;
      ctx.fillStyle = "#8b97a8";
      ctx.fillText("g = 3.71 m/s²  ·  drag to look  ·  kW → ice → O₂ → hall → dirt → food → bricks → CH₄", 22, h - 14);
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      if (!reduced && !document.hidden) t += dt;
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
  }, [height, reduced, siteId, built]);

  return (
    <div
      ref={wrapRef}
      className={cn("relative min-h-72 overflow-hidden rounded-xl border border-border bg-bg touch-none", className)}
      role="img"
      aria-label={`${site.name} civilization, layer ${built}`}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
      <div className="pointer-events-none absolute left-3 top-3 max-w-[85%] space-y-1">
        <p className="rounded-sm border border-border bg-bg/75 px-2 py-1 font-mono text-xs text-accent">
          {site.name} · CIV {Math.min(built, MARS_CIV_STEPS.length)}/{MARS_CIV_STEPS.length} · {layer.title}
        </p>
        <p className="rounded-sm border border-border bg-bg/75 px-2 py-1 text-xs text-muted">{hint}</p>
      </div>
    </div>
  );
}

type Project = (x: number, y: number, z: number) => Pt | null;

function box(
  ctx: CanvasRenderingContext2D,
  project: Project,
  x: number,
  y: number,
  z: number,
  sx: number,
  sy: number,
  sz: number,
  fill: string,
) {
  const corners = [
    [x - sx, y, z - sz],
    [x + sx, y, z - sz],
    [x + sx, y, z + sz],
    [x - sx, y, z + sz],
    [x - sx, y + sy, z - sz],
    [x + sx, y + sy, z - sz],
    [x + sx, y + sy, z + sz],
    [x - sx, y + sy, z + sz],
  ]
    .map((c) => project(c[0], c[1], c[2]))
    .filter((p): p is Pt => !!p);
  if (corners.length < 4) return;
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(corners[4]?.x ?? corners[0].x, corners[4]?.y ?? corners[0].y);
  for (let i = 5; i < Math.min(8, corners.length); i++) ctx.lineTo(corners[i].x, corners[i].y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(9,12,18,0.35)";
  ctx.stroke();
  const a = project(x - sx, y, z - sz);
  const b = project(x + sx, y, z - sz);
  const c = project(x + sx, y + sy, z - sz);
  const d = project(x - sx, y + sy, z - sz);
  if (a && b && c && d) {
    ctx.fillStyle = shade(fill, 0.82);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(c.x, c.y);
    ctx.lineTo(d.x, d.y);
    ctx.closePath();
    ctx.fill();
  }
}

function shade(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) * k;
  const g = ((n >> 8) & 255) * k;
  const b = (n & 255) * k;
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

function label(ctx: CanvasRenderingContext2D, p: Pt | null, text: string, color = "#e8edf4") {
  if (!p) return;
  ctx.font = "600 10px Outfit, sans-serif";
  ctx.fillStyle = color;
  ctx.fillText(text, p.x + 8, p.y - 8);
}

function flags(ctx: CanvasRenderingContext2D, project: Project, x: number, y: number, z: number) {
  for (const [dx, dz] of [
    [0, 0],
    [8, 4],
    [-6, 7],
  ] as const) {
    const base = project(x + dx, y, z + dz);
    const top = project(x + dx, y + 8, z + dz);
    if (!base || !top) continue;
    ctx.strokeStyle = "#c5d4e3";
    ctx.beginPath();
    ctx.moveTo(base.x, base.y);
    ctx.lineTo(top.x, top.y);
    ctx.stroke();
    ctx.fillStyle = "#7eb8c9";
    ctx.fillRect(top.x, top.y, 7, 4);
  }
  label(ctx, project(x, y + 9, z), "SURVEY");
}

function rover(ctx: CanvasRenderingContext2D, project: Project, x: number, y: number, z: number) {
  box(ctx, project, x, y, z, 4, 2.2, 2.4, "#c5d4e3");
  const mast = project(x + 2, y + 5, z);
  const body = project(x, y + 2, z);
  if (mast && body) {
    ctx.strokeStyle = "#8b97a8";
    ctx.beginPath();
    ctx.moveTo(body.x, body.y);
    ctx.lineTo(mast.x, mast.y);
    ctx.stroke();
  }
}

function solar(
  ctx: CanvasRenderingContext2D,
  project: Project,
  x: number,
  y: number,
  z: number,
  t: number,
  reduced: boolean,
) {
  const glint = reduced ? 0.55 : 0.45 + Math.sin(t * 1.4) * 0.12;
  for (let i = 0; i < 4; i++) {
    box(ctx, project, x + (i % 2) * 10, y, z + Math.floor(i / 2) * 8, 4.5, 0.4, 3.2, "#1a222e");
    const p = project(x + (i % 2) * 10, y + 0.6, z + Math.floor(i / 2) * 8);
    if (p) {
      ctx.fillStyle = `rgba(126,184,201,${glint})`;
      ctx.fillRect(p.x - 10, p.y - 4, 20, 8);
    }
  }
  label(ctx, project(x, y + 4, z), "ARRAY", "#7eb8c9");
}

function reactor(ctx: CanvasRenderingContext2D, project: Project, x: number, y: number, z: number) {
  box(ctx, project, x, y, z, 4, 6, 4, "#8b97a8");
  box(ctx, project, x, y + 6, z, 2.2, 3, 2.2, "#c9a86f");
  label(ctx, project(x, y + 10, z), "REACTOR", "#c9a86f");
}

function mine(ctx: CanvasRenderingContext2D, project: Project, x: number, y: number, z: number, ice: boolean) {
  const ring = [
    project(x - 7, y - 2, z - 7),
    project(x + 7, y - 2, z - 7),
    project(x + 7, y - 2, z + 7),
    project(x - 7, y - 2, z + 7),
  ];
  if (ring.every(Boolean)) {
    ctx.fillStyle = ice ? "rgba(226,214,204,0.55)" : "rgba(42,26,20,0.7)";
    ctx.beginPath();
    ctx.moveTo(ring[0]!.x, ring[0]!.y);
    for (const p of ring) ctx.lineTo(p!.x, p!.y);
    ctx.closePath();
    ctx.fill();
  }
  box(ctx, project, x + 9, y, z, 2, 3, 2, "#8b97a8");
  label(ctx, project(x, y + 4, z), ice ? "ICE MINE" : "CLAY PIT", ice ? "#e8edf4" : "#c9a86f");
}

function moxie(
  ctx: CanvasRenderingContext2D,
  project: Project,
  x: number,
  y: number,
  z: number,
  t: number,
  reduced: boolean,
) {
  box(ctx, project, x, y, z, 4, 5, 3, "#1a222e");
  const stack = project(x, y + 8, z);
  if (stack) {
    ctx.fillStyle = reduced ? "rgba(126,184,201,0.4)" : `rgba(126,184,201,${0.35 + Math.sin(t * 3) * 0.2})`;
    ctx.beginPath();
    ctx.ellipse(stack.x, stack.y - 8, 6, 10, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  label(ctx, project(x, y + 7, z), "MOXIE", "#7eb8c9");
}

function hall(ctx: CanvasRenderingContext2D, project: Project, x: number, y: number, z: number, buried: boolean) {
  box(ctx, project, x, y, z, 10, buried ? 4 : 6, 6, buried ? "#6a3e2e" : "#131820");
  if (!buried) {
    const p = project(x, y + 6, z);
    if (p) {
      ctx.strokeStyle = "#7eb8c9";
      ctx.strokeRect(p.x - 16, p.y - 6, 32, 12);
    }
  }
  label(ctx, project(x, y + (buried ? 6 : 8), z), buried ? "BURIED HALL" : "HALL", "#7eb8c9");
}

function greenhouse(
  ctx: CanvasRenderingContext2D,
  project: Project,
  x: number,
  y: number,
  z: number,
  t: number,
  reduced: boolean,
) {
  box(ctx, project, x, y, z, 7, 4, 4, "#13241c");
  const p = project(x, y + 4.2, z);
  if (p) {
    ctx.fillStyle = reduced ? "rgba(111,191,154,0.35)" : `rgba(111,191,154,${0.3 + Math.sin(t * 2) * 0.1})`;
    ctx.fillRect(p.x - 14, p.y - 6, 28, 12);
  }
  label(ctx, project(x, y + 6, z), "GREEN", "#6fbf9a");
}

function tanks(
  ctx: CanvasRenderingContext2D,
  project: Project,
  x: number,
  y: number,
  z: number,
  color: string,
  tag: string,
) {
  box(ctx, project, x, y, z, 2.4, 5, 2.4, color);
  box(ctx, project, x + 6, y, z, 2.4, 5, 2.4, color);
  label(ctx, project(x, y + 6, z), tag, color);
}

function kiln(ctx: CanvasRenderingContext2D, project: Project, x: number, y: number, z: number) {
  box(ctx, project, x, y, z, 5, 4, 4, "#6a3e2e");
  box(ctx, project, x + 10, y, z, 6, 5, 4, "#8a4e38");
  label(ctx, project(x + 4, y + 6, z), "BRICKS", "#c4896a");
}

function sabatier(
  ctx: CanvasRenderingContext2D,
  project: Project,
  x: number,
  y: number,
  z: number,
  t: number,
  reduced: boolean,
) {
  box(ctx, project, x, y, z, 3.5, 4, 3, "#1a222e");
  const p = project(x, y + 6, z);
  if (p) {
    ctx.fillStyle = reduced ? "rgba(201,168,111,0.4)" : `rgba(201,168,111,${0.35 + Math.sin(t * 2.4) * 0.15})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y - 6, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  label(ctx, project(x, y + 7, z), "SABATIER", "#c9a86f");
}
