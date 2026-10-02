import { cn } from "@/lib/utils";
import type { RocketId } from "@/game/data";

export type LaunchPhase = "idle" | "countdown" | "ignition" | "liftoff" | "maxq" | "sep" | "space";

interface LaunchSceneProps {
  rocket: RocketId;
  phase: LaunchPhase;
  tMinus: number;
  altitude: number;
  gantryOpen: boolean;
  reduced: boolean;
}

export function LaunchScene({ rocket, phase, tMinus, altitude, gantryOpen, reduced }: LaunchSceneProps) {
  const y = altitude * 420;
  const sky = skyColor(altitude, phase);
  const flame = phase === "ignition" || phase === "liftoff" || phase === "maxq" || phase === "sep";
  const shake =
    !reduced && (phase === "ignition" || phase === "liftoff")
      ? "origin-bottom animate-[padshake_0.12s_linear_infinite]"
      : "";

  return (
    <div className={cn("relative h-full min-h-[22rem] overflow-hidden rounded-xl border border-border", shake)}>
      <svg viewBox="0 0 420 560" className="h-full w-full" role="img" aria-label="Launch pad and rocket">
        <defs>
          <linearGradient id="sky" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={sky.bottom} />
            <stop offset="100%" stopColor={sky.top} />
          </linearGradient>
          <linearGradient id="flame" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8EDF4" />
            <stop offset="40%" stopColor="#7EB8C9" />
            <stop offset="100%" stopColor="#7EB8C9" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="steel" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2A3344" />
            <stop offset="50%" stopColor="#8B97A8" />
            <stop offset="100%" stopColor="#1A222E" />
          </linearGradient>
        </defs>
        <rect width="420" height="560" fill="url(#sky)" />
        {stars(altitude)}
        <ellipse cx="210" cy="520" rx="200" ry="28" fill="#1A222E" />
        <rect x="70" y="500" width="280" height="18" fill="#2A3344" />
        <rect x="150" y="492" width="120" height="10" fill="#8B97A8" />
        <rect x="190" y="478" width="40" height="14" fill="#131820" />
        <g opacity={Math.max(0, 1 - altitude * 1.4)}>
          <Lightning x={48} />
          <Lightning x={360} />
          <Gantry open={gantryOpen} />
        </g>
        <g transform={`translate(0 ${-y})`}>
          <RocketBody kind={rocket} />
          {flame && <Exhaust phase={phase} />}
        </g>
        {phase === "sep" && <FairingBits altitude={altitude} />}
        <rect x="0" y="518" width="420" height="42" fill="#090C12" />
        <rect x="0" y="518" width="420" height="2" fill="#2A3344" />
      </svg>
      <div className="pointer-events-none absolute left-3 top-3 rounded-sm border border-border bg-bg/70 px-2 py-1 font-mono text-xs tabular-nums text-accent">
        {phase === "countdown" || phase === "idle"
          ? `T-${Math.max(0, Math.ceil(tMinus)).toString().padStart(2, "0")}`
          : phaseLabel(phase, altitude)}
      </div>
    </div>
  );
}

function phaseLabel(phase: LaunchPhase, altitude: number) {
  if (phase === "ignition") return "IGNITION";
  if (phase === "maxq") return "MAX-Q";
  if (phase === "sep") return "STAGE SEP";
  if (phase === "space") return "VACUUM";
  return `ALT ${Math.round(altitude * 120)} km`;
}

function skyColor(alt: number, phase: LaunchPhase) {
  if (phase === "space" || alt > 0.85) return { top: "#090C12", bottom: "#090C12" };
  const t = Math.min(1, alt * 1.2);
  return {
    top: lerpHex("#3A5A7A", "#090C12", t),
    bottom: lerpHex("#7EB8C9", "#131820", t),
  };
}

function lerpHex(a: string, b: string, t: number) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (shift: number) => {
    const ca = (pa >> shift) & 255;
    const cb = (pb >> shift) & 255;
    return Math.round(ca + (cb - ca) * t);
  };
  const r = ch(16)
    .toString(16)
    .padStart(2, "0");
  const g = ch(8)
    .toString(16)
    .padStart(2, "0");
  const bl = ch(0)
    .toString(16)
    .padStart(2, "0");
  return `#${r}${g}${bl}`;
}

function stars(alt: number) {
  const op = Math.max(0, alt - 0.35);
  if (op <= 0) return null;
  return (
    <g opacity={op}>
      {Array.from({ length: 36 }).map((_, i) => (
        <circle key={i} cx={(i * 47) % 420} cy={(i * 31) % 400} r={i % 5 === 0 ? 1.2 : 0.6} fill="#E8EDF4" />
      ))}
    </g>
  );
}

function Lightning({ x }: { x: number }) {
  return (
    <g>
      <rect x={x} y="220" width="6" height="280" fill="#2A3344" />
      <rect x={x - 8} y="220" width="22" height="8" fill="#8B97A8" />
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={i}
          x1={x + 3}
          y1={250 + i * 48}
          x2={x + (i % 2 === 0 ? 16 : -10)}
          y2={250 + i * 48}
          stroke="#7EB8C9"
          strokeWidth="1"
          opacity="0.5"
        />
      ))}
    </g>
  );
}

function Gantry({ open }: { open: boolean }) {
  const rot = open ? -28 : 0;
  return (
    <g transform={`translate(250 300) rotate(${rot})`}>
      <rect x="0" y="0" width="14" height="190" fill="#2A3344" />
      <rect x="14" y="20" width="70" height="8" fill="#8B97A8" />
      <rect x="14" y="70" width="62" height="6" fill="#8B97A8" />
      <rect x="14" y="120" width="54" height="6" fill="#8B97A8" />
      <rect x="70" y="0" width="10" height="200" fill="#1A222E" />
    </g>
  );
}

function RocketBody({ kind }: { kind: RocketId }) {
  const crew = kind === "crewmark";
  return (
    <g transform="translate(198 210)">
      {crew && <polygon points="12,-78 18,-98 24,-78" fill="#C97A6A" />}
      {crew ? (
        <>
          <rect x="6" y="-78" width="24" height="28" rx="10" fill="#E8EDF4" />
          <rect x="10" y="-68" width="6" height="8" rx="1" fill="#090C12" />
          <rect x="20" y="-68" width="6" height="8" rx="1" fill="#090C12" />
        </>
      ) : (
        <polygon points="6,-78 18,-108 30,-78" fill="#E8EDF4" />
      )}
      <rect x="7" y="-50" width="22" height="200" rx="4" fill="url(#steel)" />
      <rect x="7" y="40" width="22" height="10" fill="#7EB8C9" opacity="0.7" />
      <rect x="7" y="90" width="22" height="4" fill="#090C12" opacity="0.35" />
      <polygon points="0,150 7,120 7,150" fill="#2A3344" />
      <polygon points="36,150 29,120 29,150" fill="#2A3344" />
      <rect x="10" y="150" width="16" height="18" fill="#1A222E" />
    </g>
  );
}

function Exhaust({ phase }: { phase: LaunchPhase }) {
  const tall = phase === "liftoff" || phase === "maxq" ? 90 : 40;
  return (
    <g transform="translate(210 380)">
      <ellipse cx="0" cy="10" rx="10" ry={tall} fill="url(#flame)" />
      <ellipse cx="-8" cy="16" rx="6" ry={tall * 0.6} fill="url(#flame)" opacity="0.7" />
      <ellipse cx="8" cy="16" rx="6" ry={tall * 0.6} fill="url(#flame)" opacity="0.7" />
    </g>
  );
}

function FairingBits({ altitude }: { altitude: number }) {
  const d = (altitude - 0.55) * 80;
  return (
    <g opacity="0.9">
      <polygon points={`${160 - d},120 ${150 - d},90 ${170 - d},100`} fill="#8B97A8" />
      <polygon points={`${260 + d},110 ${270 + d},80 ${250 + d},95`} fill="#8B97A8" />
    </g>
  );
}
