import { useMemo, useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Stars, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { ArrowDownToLine, BookOpen, Info } from "lucide-react";
import { DESTINATIONS, landingSteps, type DestinationId, type LandingStep } from "@/game/data";
import { useGame } from "@/game/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CosmosScene } from "./three/CosmosScene";

/* ── Learning facts for hover hotspots (Moon) ───────────────────────── */
const MOON_HOTSPOTS: Record<
  number,
  { id: string; label: string; fact: string; position: [number, number, number] }[]
> = {
  0: [
    {
      id: "loi-burn",
      label: "Capture burn",
      fact: "Firing retrograde (opposite to velocity) lowers orbital energy so the Moon can hold you. Miss it and you fly past into solar orbit.",
      position: [0, 0.6, 0],
    },
    {
      id: "gravity",
      label: "Weak gravity",
      fact: "Lunar surface gravity is only 1.62 m/s² — about 1/6 of Earth. Escape velocity is just 2.4 km/s.",
      position: [1.8, 0.2, 0.5],
    },
  ],
  1: [
    {
      id: "orbit",
      label: "Low lunar orbit",
      fact: "A circular orbit is continuous free-fall that keeps missing the surface. No continuous thrust is needed to stay up.",
      position: [0, 0.8, 0],
    },
    {
      id: "earthrise",
      label: "Earthrise",
      fact: "From low lunar orbit Earth appears about 2° across — four times larger than the Moon looks from Earth — and hangs in a black sky.",
      position: [-2.2, 1.2, -0.8],
    },
  ],
  2: [
    {
      id: "doi",
      label: "Descent orbit insertion",
      fact: "A small burn drops periapsis (the low point) to ~15 km. Same idea as a Hohmann transfer, just tiny — it saves fuel for the big burn later.",
      position: [0, 0.5, 0],
    },
  ],
  3: [
    {
      id: "pdi",
      label: "Powered descent",
      fact: "You must cancel ~1.6 km/s of horizontal speed with the engine alone. There is no air to make drag or lift. Most of the propellant is spent here.",
      position: [0, -0.4, 0],
    },
    {
      id: "pitch",
      label: "Pitch program",
      fact: "The lander pitches from nearly horizontal (killing orbital speed) to vertical (for soft touchdown). Timing is everything.",
      position: [0.8, 0.3, 0.4],
    },
  ],
  4: [
    {
      id: "radar",
      label: "Landing radar",
      fact: "Radar measures range and velocity to the surface. The computer picks a flat patch and steers the last few hundred metres.",
      position: [0, 0.3, 0.6],
    },
    {
      id: "hover",
      label: "1/6 g hover",
      fact: "In low gravity the lander falls slowly. That gives the pilot (or autopilot) time to translate sideways and avoid boulders.",
      position: [0, -0.2, 0],
    },
  ],
  5: [
    {
      id: "contact",
      label: "CONTACT",
      fact: "Probes under the footpads sense the ground a few centimetres early and cut the engine so the legs compress gently. Dust settles in a perfect vacuum — no breeze.",
      position: [0, -0.5, 0],
    },
    {
      id: "dust",
      label: "Lunar dust",
      fact: "Regolith is fine, sharp, and electrostatically sticky. There is no wind, so the plume creates a temporary sheet that falls straight back down.",
      position: [1.2, -0.8, 0.6],
    },
  ],
};

export function Landing() {
  const mission = useGame((s) => s.mission);
  const landingStep = useGame((s) => s.landingStep);
  const advanceLanding = useGame((s) => s.advanceLanding);
  const openLibrary = useGame((s) => s.openLibrary);
  const reduced = useGame((s) => s.reducedMotion);
  if (!mission) return null;
  const dest = DESTINATIONS[mission.destination];
  const steps = landingSteps(mission.destination);
  const last = landingStep >= steps.length - 1;
  const step = steps[Math.min(landingStep, steps.length - 1)];
  const pct = ((landingStep + (last ? 1 : 0)) / steps.length) * 100;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)]">
        <LandingScene
          dest={mission.destination}
          step={landingStep}
          crew={mission.rocket === "crewmark"}
          reduced={reduced}
        />
        <aside className="rounded-xl border border-border bg-surface p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">{step.callsign}</Badge>
            <Badge>{dest.name} landing</Badge>
          </div>
          <h1 className="mt-3 font-display text-2xl font-semibold">{step.title}</h1>
          <p className="mt-2 text-sm text-muted">{step.body}</p>
          <p className="mt-3 rounded-md border border-border bg-raised p-3 text-sm text-fg">{step.why}</p>
          <dl className="mt-4 grid grid-cols-2 gap-2 font-mono text-xs tabular-nums">
            <div className="rounded-md border border-border bg-raised px-3 py-2">
              <dt className="text-muted">Altitude</dt>
              <dd className="mt-0.5 text-accent">{step.alt}</dd>
            </div>
            <div className="rounded-md border border-border bg-raised px-3 py-2">
              <dt className="text-muted">Speed</dt>
              <dd className="mt-0.5 text-accent">{step.speed}</dd>
            </div>
          </dl>
          {step.libraryId && (
            <button
              type="button"
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-accent underline-offset-2 hover:underline"
              onClick={() => openLibrary(step.libraryId)}
            >
              <BookOpen className="size-3.5" /> Open the science note
            </button>
          )}
          <div className="mt-5">
            <div className="mb-1 flex justify-between text-xs text-muted">
              <span>
                Step {Math.min(landingStep + 1, steps.length)} / {steps.length}
              </span>
              <span className="font-mono text-[10px] text-accent">
                {landingStep <= 2 ? "ORBITAL + COSMOS" : landingStep <= 4 ? "DESCENT" : "SURFACE SKY"} ·{" "}
                {Math.round(pct)}%
              </span>
            </div>
            <Progress value={pct} />
            <p className="mt-2 text-[11px] leading-snug text-muted">
              {landingStep <= 2
                ? "3D view: lunar orbit, Earth, starfield & galaxies — hover objects for science."
                : landingStep <= 4
                  ? "Probe pitches and burns toward the surface with a live engine plume."
                  : "Soft touchdown done — drag the 3D view to look around the black lunar sky."}
            </p>
          </div>
          <ol className="mt-4 space-y-1.5 text-xs">
            {steps.map((s, i) => (
              <li
                key={s.id}
                className={
                  i === landingStep
                    ? "rounded-md border border-accent/30 bg-accent/5 px-2 py-1.5 text-fg"
                    : i < landingStep
                      ? "px-2 text-go"
                      : "px-2 text-muted"
                }
              >
                <span className="font-mono text-[10px] uppercase tracking-wide text-accent">
                  {s.callsign}
                </span>
                {" · "}
                {i < landingStep ? "Done · " : i === landingStep ? "Now · " : ""}
                {s.title}
              </li>
            ))}
          </ol>
          <Button className="mt-5 w-full" onClick={advanceLanding}>
            <ArrowDownToLine className="size-4" />
            {last
              ? `Walk to the ${dest.plantName}`
              : `Run ${steps[Math.min(landingStep + 1, steps.length - 1)]?.callsign ?? "next"}`}
          </Button>
          <p className="mt-3 text-xs text-muted">
            {mission.destination === "moon"
              ? "Advance each callsign to watch orbit → descent → soft touchdown. After CONTACT, drag to explore the cosmic sky."
              : "Hover markers for science. Every metre of leftover orbital speed is propellant."}
          </p>
        </aside>
      </div>
    </TooltipProvider>
  );
}

function LandingScene({
  dest,
  step,
  crew,
  reduced,
}: {
  dest: DestinationId;
  step: number;
  crew: boolean;
  reduced: boolean;
}) {
  if (dest === "moon") {
    return (
      <div className="relative overflow-hidden rounded-xl border border-border bg-bg" style={{ minHeight: 460 }}>
        <CosmosScene step={step} crew={crew} />
        <Readout dest={dest} step={step} />
      </div>
    );
  }
  // Mars keeps the polished SVG for now
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-bg">
      <MarsScene step={step} crew={crew} reduced={reduced} />
      <Readout dest={dest} step={step} />
    </div>
  );
}

function Readout({ dest, step }: { dest: DestinationId; step: number }) {
  const steps = landingSteps(dest);
  const s: LandingStep = steps[Math.min(step, steps.length - 1)];
  return (
    <div className="pointer-events-none absolute left-3 top-3 space-y-1">
      <p className="rounded-sm border border-border bg-bg/80 px-2 py-1 font-mono text-xs tabular-nums text-accent">
        {s.callsign} · ALT {s.alt}
      </p>
      <p className="rounded-sm border border-border bg-bg/80 px-2 py-1 font-mono text-xs tabular-nums text-muted">
        {s.speed}
      </p>
    </div>
  );
}

/* ── 3D Moon landing scene ──────────────────────────────────────────── */

function MoonLanding3D({
  step,
  crew,
  reduced,
}: {
  step: number;
  crew: boolean;
  reduced: boolean;
}) {
  const orbital = step <= 2;
  const landed = step >= 5;
  const hotspots = MOON_HOTSPOTS[Math.min(step, 5)] ?? [];

  // Lander pose by step
  const landerPose = useMemo(() => {
    if (step === 0) return { pos: [2.4, 0.9, 0.4] as [number, number, number], rot: [0.15, -0.6, 0.1] as [number, number, number], scale: 0.28 };
    if (step === 1) return { pos: [2.1, 0.55, 0.9] as [number, number, number], rot: [0.05, -1.1, 0] as [number, number, number], scale: 0.26 };
    if (step === 2) return { pos: [1.85, 0.15, 0.55] as [number, number, number], rot: [0.35, -0.9, 0.05] as [number, number, number], scale: 0.24 };
    if (step === 3) return { pos: [0.35, 1.35, 0.2] as [number, number, number], rot: [0.85, 0.15, 0] as [number, number, number], scale: 0.32 };
    if (step === 4) return { pos: [0.08, 0.55, 0.05] as [number, number, number], rot: [0.12, 0.05, 0] as [number, number, number], scale: 0.34 };
    return { pos: [0, 0.18, 0] as [number, number, number], rot: [0, 0.1, 0] as [number, number, number], scale: 0.36 };
  }, [step]);

  return (
    <group>
      {/* Distant Earth */}
      <mesh position={[-4.8, 2.6, -3.2]}>
        <sphereGeometry args={[0.42, 32, 32]} />
        <meshStandardMaterial color="#7EB8C9" emissive="#3a6a78" emissiveIntensity={0.25} roughness={0.55} />
      </mesh>
      <mesh position={[-4.95, 2.68, -3.15]}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial color="#6FBF9A" transparent opacity={0.85} />
      </mesh>

      {/* Moon body */}
      <MoonBody orbital={orbital} />

      {/* Orbital path hint */}
      {orbital && (
        <mesh rotation={[Math.PI / 2.4, 0.2, 0]}>
          <torusGeometry args={[2.35 + step * 0.08, 0.008, 8, 96]} />
          <meshBasicMaterial color="#7EB8C9" transparent opacity={0.35} />
        </mesh>
      )}

      {/* Surface terrain when close */}
      {!orbital && <LunarSurface landed={landed} />}

      {/* Lander + plume */}
      <group position={landerPose.pos} rotation={landerPose.rot} scale={landerPose.scale}>
        <LanderMesh crew={crew} landed={landed} />
        {(step === 0 || step === 2 || step === 3 || step === 4) && !landed && !reduced && (
          <EnginePlume long={step === 3} />
        )}
        {landed && (
          <mesh position={[0, -0.55, 0]}>
            <cylinderGeometry args={[0.55, 0.7, 0.04, 16]} />
            <meshBasicMaterial color="#C5D4E3" transparent opacity={0.18} />
          </mesh>
        )}
      </group>

      {/* Learning hotspots */}
      {hotspots.map((h) => (
        <InfoHotspot key={h.id} position={h.position} label={h.label} fact={h.fact} />
      ))}
    </group>
  );
}

function MoonBody({ orbital }: { orbital: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current && orbital) ref.current.rotation.y += dt * 0.04;
  });
  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <sphereGeometry args={[orbital ? 1.55 : 0.01, 48, 48]} />
      <meshStandardMaterial
        color="#C5D4E3"
        roughness={0.92}
        metalness={0.05}
        flatShading={false}
      />
      {/* Simple crater dots via extra meshes */}
      {orbital &&
        [
          [0.6, 0.7, 1.1],
          [-0.8, 0.4, 1.15],
          [0.2, -0.9, 1.05],
          [-0.4, -0.5, 1.25],
          [1.0, -0.2, 0.9],
        ].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]}>
            <sphereGeometry args={[0.18 + (i % 3) * 0.06, 12, 12]} />
            <meshStandardMaterial color="#8B97A8" roughness={1} />
          </mesh>
        ))}
    </mesh>
  );
}

function LunarSurface({ landed }: { landed: boolean }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[6, 64]} />
        <meshStandardMaterial color="#2A3344" roughness={0.95} />
      </mesh>
      {/* Craters */}
      {[
        [-1.6, 0.01, -1.2, 0.55],
        [1.9, 0.01, 0.8, 0.7],
        [-0.4, 0.01, 2.1, 0.4],
        [2.4, 0.01, -1.6, 0.35],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r * 0.55, r, 24]} />
          <meshStandardMaterial color="#1A222E" roughness={1} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Subtle hills */}
      <mesh position={[-2.8, 0.15, -2]} rotation={[0.1, 0.4, 0]}>
        <sphereGeometry args={[0.9, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#1A222E" roughness={1} />
      </mesh>
      <mesh position={[3.2, 0.12, 1.5]} rotation={[0.05, -0.3, 0]}>
        <sphereGeometry args={[0.7, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#1A222E" roughness={1} />
      </mesh>
      {landed && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.9, 24]} />
          <meshBasicMaterial color="#C5D4E3" transparent opacity={0.12} />
        </mesh>
      )}
    </group>
  );
}

function LanderMesh({ crew, landed }: { crew: boolean; landed: boolean }) {
  return (
    <group>
      {/* Descent stage */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.55, 0.62, 0.45, 8]} />
        <meshStandardMaterial color="#8B97A8" metalness={0.4} roughness={0.45} />
      </mesh>
      {/* Ascent / crew cabin */}
      {crew ? (
        <mesh position={[0, 0.35, 0]}>
          <sphereGeometry args={[0.42, 16, 12]} />
          <meshStandardMaterial color="#E8EDF4" metalness={0.25} roughness={0.35} />
        </mesh>
      ) : (
        <mesh position={[0, 0.28, 0]}>
          <boxGeometry args={[0.7, 0.5, 0.7]} />
          <meshStandardMaterial color="#C5D4E3" metalness={0.3} roughness={0.4} />
        </mesh>
      )}
      {/* Windows */}
      {crew && (
        <>
          <mesh position={[0.22, 0.4, 0.28]}>
            <boxGeometry args={[0.18, 0.12, 0.04]} />
            <meshStandardMaterial color="#7EB8C9" emissive="#7EB8C9" emissiveIntensity={0.35} />
          </mesh>
          <mesh position={[-0.22, 0.4, 0.28]}>
            <boxGeometry args={[0.18, 0.12, 0.04]} />
            <meshStandardMaterial color="#7EB8C9" emissive="#7EB8C9" emissiveIntensity={0.35} />
          </mesh>
        </>
      )}
      {/* Legs */}
      {(
        [
          [-0.45, -0.55, 0.45],
          [0.45, -0.55, 0.45],
          [-0.45, -0.55, -0.45],
          [0.45, -0.55, -0.45],
        ] as [number, number, number][]
      ).map((p, i) => (
        <group key={i}>
          <mesh position={p}>
            <cylinderGeometry args={[0.04, 0.04, 0.55, 6]} />
            <meshStandardMaterial color="#8B97A8" />
          </mesh>
          <mesh position={[p[0] * 1.15, p[1] - 0.28, p[2] * 1.15]}>
            <boxGeometry args={[0.22, 0.06, 0.22]} />
            <meshStandardMaterial color="#C5D4E3" />
          </mesh>
        </group>
      ))}
      {/* Engine bell */}
      <mesh position={[0, -0.48, 0]} rotation={[Math.PI, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.28, 0.28, 10]} />
        <meshStandardMaterial color="#2A3344" metalness={0.6} roughness={0.3} />
      </mesh>
      {landed && (
        <mesh position={[0, 0.55, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#6FBF9A" />
        </mesh>
      )}
    </group>
  );
}

function EnginePlume({ long }: { long?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.scale.y = 1 + Math.sin(t * 18) * 0.12;
    ref.current.scale.x = 1 + Math.sin(t * 22) * 0.08;
  });
  const h = long ? 1.4 : 0.85;
  return (
    <group ref={ref} position={[0, -0.7, 0]}>
      <mesh>
        <coneGeometry args={[0.22, h, 12, 1, true]} />
        <meshBasicMaterial color="#7EB8C9" transparent opacity={0.55} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.15, 0]}>
        <coneGeometry args={[0.1, h * 0.7, 10, 1, true]} />
        <meshBasicMaterial color="#E8EDF4" transparent opacity={0.75} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function InfoHotspot({
  position,
  label,
  fact,
}: {
  position: [number, number, number];
  label: string;
  fact: string;
}) {
  const [hovered, setHovered] = useState(false);
  const ring = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ring.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 3) * 0.12;
      ring.current.scale.setScalar(s);
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={ring}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "help";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color={hovered ? "#E8EDF4" : "#7EB8C9"} transparent opacity={0.9} />
      </mesh>
      <mesh>
        <ringGeometry args={[0.16, 0.2, 24]} />
        <meshBasicMaterial color="#7EB8C9" transparent opacity={0.45} side={THREE.DoubleSide} />
      </mesh>
      {hovered && (
        <Html distanceFactor={8} position={[0, 0.35, 0]} style={{ pointerEvents: "none" }} center>
          <div className="w-56 rounded-md border border-border bg-surface/95 px-3 py-2 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-1.5 text-xs font-medium text-accent">
              <Info className="size-3.5" />
              {label}
            </div>
            <p className="mt-1 text-[11px] leading-snug text-fg">{fact}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

/* ── Mars SVG (kept polished) ───────────────────────────────────────── */

function MarsScene({ step, crew, reduced }: { step: number; crew: boolean; reduced: boolean }) {
  const space = step <= 1;
  const chute = step === 2;
  const descent = step >= 3;
  const landed = step >= 5;
  const plasma = step === 1;

  return (
    <svg viewBox="0 0 720 460" className="h-full w-full" role="img" aria-label="Mars landing sequence" style={{ minHeight: 420 }}>
      <defs>
        <linearGradient id="mars-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={space ? "#090C12" : "#2A1C16"} />
          <stop offset="100%" stopColor={space ? "#090C12" : "#C4896A"} />
        </linearGradient>
      </defs>
      <rect width="720" height="460" fill="url(#mars-sky)" />
      {Array.from({ length: 40 }).map((_, i) => (
        <circle key={i} cx={(i * 97) % 720} cy={(i * 29) % 180} r={0.7} fill="#E8EDF4" opacity={space ? 0.6 : 0.2} />
      ))}
      {space && (
        <>
          <circle cx="470" cy="250" r={90 + step * 20} fill="#C4896A" />
          <ellipse cx="500" cy="230" rx="28" ry="12" fill="#6A3E2E" opacity="0.5" />
          <circle cx="430" cy="270" r="16" fill="#E8EDF4" opacity="0.35" />
          <g transform={`translate(${470 + Math.cos(-1.1) * (90 + step * 20 + 40)} ${250 + Math.sin(-1.1) * (90 + step * 20 + 40)})`}>
            <LanderSvg crew={crew} landed={false} />
            {step === 0 && !reduced && <PlumeSvg />}
            {plasma && (
              <g>
                <ellipse cx="0" cy="22" rx="18" ry="28" fill="#C97A6A" opacity="0.55" />
                <ellipse cx="0" cy="30" rx="10" ry="18" fill="#E8EDF4" opacity="0.4" />
              </g>
            )}
          </g>
        </>
      )}
      {chute && (
        <>
          <path d="M0 300 L720 270 L720 460 L0 460 Z" fill="#8A4E38" />
          <path d="M280 70 Q360 20 440 70 L360 130 Z" fill="#E8EDF4" opacity="0.85" />
          <line x1="300" y1="70" x2="352" y2="150" stroke="#8B97A8" />
          <line x1="420" y1="70" x2="368" y2="150" stroke="#8B97A8" />
          <g transform="translate(360 168)">
            <LanderSvg crew={crew} landed={false} />
          </g>
        </>
      )}
      {descent && (
        <>
          <path d="M0 240 C 140 220, 280 270, 420 230 C 560 192, 660 240, 720 220 L 720 460 L 0 460 Z" fill="#8A4E38" />
          <path d="M0 310 L720 280 L720 460 L 0 460 Z" fill="#6A3E2E" />
          <g transform={`translate(360 ${landed ? 286 : step === 3 ? 170 : 240})`}>
            <LanderSvg crew={crew} landed={landed} />
            {!landed && !reduced && <PlumeSvg long={step === 3} />}
            {step >= 4 && (
              <g stroke="#8B97A8" strokeWidth="2" fill="none">
                <path d="M-10 8 L-28 28" />
                <path d="M10 8 L28 28" />
                <rect x="-32" y="26" width="10" height="3" fill="#C5D4E3" stroke="none" />
                <rect x="22" y="26" width="10" height="3" fill="#C5D4E3" stroke="none" />
              </g>
            )}
          </g>
        </>
      )}
    </svg>
  );
}

function LanderSvg({ crew, landed }: { crew: boolean; landed: boolean }) {
  return (
    <g>
      {crew ? (
        <>
          <rect x="-11" y="-18" width="22" height="20" rx="6" fill="#E8EDF4" />
          <rect x="-7" y="-14" width="6" height="5" fill="#7EB8C9" />
          <rect x="1" y="-14" width="6" height="5" fill="#7EB8C9" />
        </>
      ) : (
        <rect x="-12" y="-16" width="24" height="18" rx="3" fill="#C5D4E3" />
      )}
      <rect x="-8" y="0" width="16" height="10" fill="#8B97A8" />
      {landed && <circle cx="0" cy="4" r="2" fill="#6FBF9A" />}
    </g>
  );
}

function PlumeSvg({ long = false }: { long?: boolean }) {
  const h = long ? 46 : 26;
  return (
    <g>
      <ellipse cx="0" cy={14 + h * 0.35} rx="7" ry={h * 0.5} fill="#7EB8C9" opacity="0.55" />
      <ellipse cx="0" cy={12 + h * 0.2} rx="3.5" ry={h * 0.35} fill="#E8EDF4" opacity="0.8" />
    </g>
  );
}
