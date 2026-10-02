import { ArrowDownToLine, BookOpen } from "lucide-react";
import { DESTINATIONS, landingSteps, type DestinationId, type LandingStep } from "@/game/data";
import { useGame } from "@/game/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

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
    <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
      <LandingScene dest={mission.destination} step={landingStep} crew={mission.rocket === "crewmark"} reduced={reduced} />
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
            <span className="font-mono tabular-nums">{Math.round(pct)}%</span>
          </div>
          <Progress value={pct} />
        </div>
        <ol className="mt-4 space-y-1.5 text-xs">
          {steps.map((s, i) => (
            <li
              key={s.id}
              className={
                i === landingStep
                  ? "text-fg"
                  : i < landingStep
                    ? "text-go"
                    : "text-muted"
              }
            >
              <span className="font-mono text-[10px] uppercase tracking-wide text-accent">{s.callsign}</span>
              {" · "}
              {i < landingStep ? "Done · " : i === landingStep ? "Now · " : ""}
              {s.title}
            </li>
          ))}
        </ol>
        <Button className="mt-5 w-full" onClick={advanceLanding}>
          <ArrowDownToLine className="size-4" />
          {last ? `Walk to the ${dest.plantName}` : `Run ${steps[Math.min(landingStep + 1, steps.length - 1)]?.callsign ?? "next"}`}
        </Button>
        <p className="mt-3 text-xs text-muted">
          No air on the {dest.name === "Moon" ? "Moon" : "way down until Mars entry"}. Every metre of leftover orbital speed is propellant.
        </p>
      </aside>
    </div>
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
  const moon = dest === "moon";
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-bg">
      {moon ? <MoonScene step={step} crew={crew} reduced={reduced} /> : <MarsScene step={step} crew={crew} reduced={reduced} />}
      <Readout dest={dest} step={step} />
    </div>
  );
}

function Readout({ dest, step }: { dest: DestinationId; step: number }) {
  const steps = landingSteps(dest);
  const s: LandingStep = steps[Math.min(step, steps.length - 1)];
  return (
    <div className="pointer-events-none absolute left-3 top-3 space-y-1">
      <p className="rounded-sm border border-border bg-bg/75 px-2 py-1 font-mono text-xs tabular-nums text-accent">
        {s.callsign} · ALT {s.alt}
      </p>
      <p className="rounded-sm border border-border bg-bg/75 px-2 py-1 font-mono text-xs tabular-nums text-muted">
        {s.speed}
      </p>
    </div>
  );
}

function MoonScene({ step, crew, reduced }: { step: number; crew: boolean; reduced: boolean }) {
  const orbital = step <= 2;
  const plume = step === 0 || step === 2 || step === 3 || step === 4;
  const dust = step >= 4;
  const landed = step >= 5;
  const legs = step >= 4;
  const moonR = orbital ? 118 + step * 14 : 0;
  const craftOrbit = 118 + step * 14 + 36;

  return (
    <svg viewBox="0 0 720 460" className="h-full w-full" role="img" aria-label="Moon landing sequence">
      <rect width="720" height="460" fill="#090C12" />
      {Array.from({ length: 55 }).map((_, i) => (
        <circle key={i} cx={(i * 89) % 720} cy={(i * 37) % 300} r={i % 9 === 0 ? 1.1 : 0.6} fill="#E8EDF4" opacity="0.55" />
      ))}
      <circle cx="86" cy="72" r="22" fill="#7EB8C9" />
      <circle cx="78" cy="68" r="7" fill="#6FBF9A" opacity="0.85" />
      <text x="86" y="108" textAnchor="middle" fill="#8B97A8" fontSize="10" fontFamily="Outfit">
        Earth
      </text>

      {orbital && (
        <>
          <ellipse
            cx="430"
            cy="250"
            rx={craftOrbit + 8}
            ry={(craftOrbit + 8) * (step === 2 ? 0.62 : 0.92)}
            fill="none"
            stroke="#7EB8C9"
            strokeOpacity="0.45"
            strokeDasharray={step === 2 ? "6 5" : "0"}
          />
          <circle cx="430" cy="250" r={moonR} fill="#C5D4E3" />
          <circle cx="400" cy="220" r="28" fill="#8B97A8" opacity="0.35" />
          <circle cx="470" cy="270" r="18" fill="#8B97A8" opacity="0.28" />
          <circle cx="448" cy="200" r="10" fill="#2A3344" opacity="0.35" />
          <ellipse cx="390" cy="255" rx="36" ry="16" fill="#A8B4C2" opacity="0.4" />
          <g transform={`translate(${430 + Math.cos(-0.9 + step * 0.55) * craftOrbit} ${250 + Math.sin(-0.9 + step * 0.55) * craftOrbit * (step === 2 ? 0.62 : 0.92)})`}>
            <Lander crew={crew} landed={false} />
            {plume && !reduced && <Plume />}
          </g>
        </>
      )}

      {!orbital && (
        <>
          <path d="M0 210 C 80 190, 160 230, 250 200 C 340 172, 430 230, 520 188 C 600 160, 680 200, 720 184 L 720 460 L 0 460 Z" fill="#2A3344" />
          <path d="M0 268 C 120 248, 240 290, 360 250 C 480 214, 600 270, 720 246 L 720 460 L 0 460 Z" fill="#1A222E" />
          <ellipse cx="160" cy="250" rx="48" ry="14" fill="#131820" opacity="0.5" />
          <ellipse cx="520" cy="236" rx="64" ry="18" fill="#131820" opacity="0.45" />
          <circle cx="640" cy="70" r="26" fill="#C5D4E3" />
          {dust && (
            <g opacity={landed ? 0.35 : 0.7}>
              {Array.from({ length: 18 }).map((_, i) => (
                <ellipse
                  key={i}
                  cx={360 + (i - 9) * 14}
                  cy={300 + (i % 4) * 6}
                  rx={18 + (i % 5) * 4}
                  ry={4}
                  fill="#C5D4E3"
                  opacity={0.12 + (i % 3) * 0.06}
                />
              ))}
            </g>
          )}
          <g transform={`translate(360 ${landed ? 278 : step === 3 ? 168 : 230})`}>
            <Lander crew={crew} landed={landed} />
            {plume && !landed && !reduced && <Plume long={step === 3} />}
            {legs && (
              <g stroke="#8B97A8" strokeWidth="2" fill="none">
                <path d="M-10 8 L-28 28" />
                <path d="M10 8 L28 28" />
                <path d="M-6 10 L-8 28" />
                <path d="M6 10 L8 28" />
                <rect x="-32" y="26" width="10" height="3" fill="#C5D4E3" stroke="none" />
                <rect x="22" y="26" width="10" height="3" fill="#C5D4E3" stroke="none" />
              </g>
            )}
            {landed && (
              <text x="40" y="-18" fill="#6FBF9A" fontSize="11" fontFamily="Outfit">
                CONTACT
              </text>
            )}
          </g>
        </>
      )}
    </svg>
  );
}

function MarsScene({ step, crew, reduced }: { step: number; crew: boolean; reduced: boolean }) {
  const space = step <= 1;
  const chute = step === 2;
  const descent = step >= 3;
  const landed = step >= 5;
  const plasma = step === 1;

  return (
    <svg viewBox="0 0 720 460" className="h-full w-full" role="img" aria-label="Mars landing sequence">
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
            <Lander crew={crew} landed={false} />
            {step === 0 && !reduced && <Plume />}
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
            <Lander crew={crew} landed={false} />
          </g>
        </>
      )}
      {descent && (
        <>
          <path d="M0 240 C 140 220, 280 270, 420 230 C 560 192, 660 240, 720 220 L 720 460 L 0 460 Z" fill="#8A4E38" />
          <path d="M0 310 L720 280 L720 460 L 0 460 Z" fill="#6A3E2E" />
          <g transform={`translate(360 ${landed ? 286 : step === 3 ? 170 : 240})`}>
            <Lander crew={crew} landed={landed} />
            {!landed && !reduced && <Plume long={step === 3} />}
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

function Lander({ crew, landed }: { crew: boolean; landed: boolean }) {
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

function Plume({ long = false }: { long?: boolean }) {
  const h = long ? 46 : 26;
  return (
    <g>
      <ellipse cx="0" cy={14 + h * 0.35} rx="7" ry={h * 0.5} fill="#7EB8C9" opacity="0.55" />
      <ellipse cx="0" cy={12 + h * 0.2} rx="3.5" ry={h * 0.35} fill="#E8EDF4" opacity="0.8" />
    </g>
  );
}
