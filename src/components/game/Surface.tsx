import { DESTINATIONS, HABITAT_STEPS, ROCKETS, plantSteps } from "@/game/data";
import { useGame } from "@/game/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatKg } from "@/lib/utils";
import { SurfaceScene3D } from "./three/SurfaceScene3D";

export function Surface() {
  const mission = useGame((s) => s.mission);
  const plantStep = useGame((s) => s.plantStep);
  const advancePlant = useGame((s) => s.advancePlant);
  const openLibrary = useGame((s) => s.openLibrary);
  const oxygenKg = useGame((s) => s.oxygenKg);
  if (!mission) return null;
  const dest = DESTINATIONS[mission.destination];
  const steps = plantSteps(mission.destination);
  const step = steps[Math.min(plantStep, steps.length - 1)];
  const done = plantStep >= steps.length;
  const pct = (plantStep / steps.length) * 100;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
      <SurfaceArt3D dest={mission.destination} step={plantStep} />
      <aside className="rounded-xl border border-border bg-surface p-5">
        <Badge tone="accent">{dest.plantName}</Badge>
        <h1 className="mt-3 font-display text-2xl font-semibold">
          {done ? "Plant online" : step.title}
        </h1>
        <p className="mt-2 text-sm text-muted">{done ? "Oxygen is tanked. The contract can close." : step.body}</p>
        {step.math && !done && (
          <p className="mt-3 rounded-md border border-border bg-raised p-3 font-mono text-xs text-accent">{step.math}</p>
        )}
        {step.libraryId && !done && (
          <button
            type="button"
            className="mt-3 text-sm text-accent underline-offset-2 hover:underline"
            onClick={() => openLibrary(step.libraryId)}
          >
            Open the science note
          </button>
        )}
        <div className="mt-5">
          <div className="mb-1 flex justify-between text-xs text-muted">
            <span>
              Step {Math.min(plantStep + 1, steps.length)} / {steps.length}
            </span>
            <span className="font-mono tabular-nums">{formatKg(oxygenKg)} stored</span>
          </div>
          <Progress value={pct} />
        </div>
        <ol className="mt-4 space-y-1 text-xs text-muted">
          {steps.map((s, i) => (
            <li key={s.id} className={i === plantStep && !done ? "text-fg" : i < plantStep ? "text-go" : ""}>
              {i < plantStep ? "Done · " : i === plantStep && !done ? "Now · " : ""}
              {s.title}
            </li>
          ))}
        </ol>
        <Button className="mt-5 w-full" onClick={advancePlant} disabled={done}>
          {done ? "Complete" : step.oxygenKg ? `Run step · +${step.oxygenKg} kg O₂` : "Run this step"}
        </Button>
        <p className="mt-3 text-xs text-muted">
          {ROCKETS[mission.rocket].name} on {dest.name}. {dest.air}
        </p>
      </aside>
    </div>
  );
}

export function Habitat() {
  const mission = useGame((s) => s.mission);
  const habitatStep = useGame((s) => s.habitatStep);
  const advanceHabitat = useGame((s) => s.advanceHabitat);
  const openLibrary = useGame((s) => s.openLibrary);
  if (!mission) return null;
  const step = HABITAT_STEPS[Math.min(habitatStep, HABITAT_STEPS.length - 1)];
  const done = habitatStep >= HABITAT_STEPS.length;
  const pct = (habitatStep / HABITAT_STEPS.length) * 100;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
      <HabitatArt3D step={habitatStep} dest={mission.destination} />
      <aside className="rounded-xl border border-border bg-surface p-5">
        <Badge>Crew habitat</Badge>
        <h1 className="mt-3 font-display text-2xl font-semibold">{done ? "A place to stay" : step.title}</h1>
        <p className="mt-2 text-sm text-muted">
          {done
            ? "Pressure, shielding, plants, and a closed water loop. That is a home, not a picnic."
            : step.body}
        </p>
        {step.libraryId && !done && (
          <button
            type="button"
            className="mt-3 text-sm text-accent underline-offset-2 hover:underline"
            onClick={() => openLibrary(step.libraryId)}
          >
            Why this matters
          </button>
        )}
        <div className="mt-5">
          <Progress value={pct} />
        </div>
        <ol className="mt-4 space-y-1 text-xs text-muted">
          {HABITAT_STEPS.map((s, i) => (
            <li key={s.id} className={i === habitatStep && !done ? "text-fg" : i < habitatStep ? "text-go" : ""}>
              {s.title}
            </li>
          ))}
        </ol>
        <Button className="mt-5 w-full" onClick={advanceHabitat} disabled={done}>
          {done ? "Complete" : "Build this layer"}
        </Button>
      </aside>
    </div>
  );
}

function SurfaceArt3D({ dest, step }: { dest: "moon" | "mars"; step: number }) {
  return <SurfaceScene3D dest={dest} step={step} />;
}

function SurfaceArt({ dest, step }: { dest: "moon" | "mars"; step: number }) {
  const moon = dest === "moon";
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <svg viewBox="0 0 640 420" className="h-full w-full" role="img" aria-label={`${dest} surface plant`}>
        <rect width="640" height="420" fill={moon ? "#090C12" : "#1A1714"} />
        {moon ? (
          <>
            <circle cx="540" cy="70" r="36" fill="#C5D4E3" />
            <circle cx="80" cy="58" r="18" fill="#7EB8C9" opacity="0.9" />
          </>
        ) : (
          <>
            <rect width="640" height="180" fill="#3A2A22" />
            <circle cx="520" cy="64" r="28" fill="#C9A86F" />
          </>
        )}
        {Array.from({ length: 40 }).map((_, i) => (
          <circle key={i} cx={(i * 73) % 640} cy={(i * 19) % 150} r={0.7} fill="#E8EDF4" opacity={moon ? 0.7 : 0.25} />
        ))}
        <path
          d={moon ? "M0 260 L80 220 L160 250 L260 200 L360 240 L480 190 L640 230 L640 420 L0 420 Z" : "M0 250 L120 230 L220 255 L340 210 L460 248 L640 220 L640 420 L0 420 Z"}
          fill={moon ? "#2A3344" : "#6A3E2E"}
        />
        <path d="M0 310 L640 290 L640 420 L0 420 Z" fill={moon ? "#1A222E" : "#4A2A22"} />
        {step >= 1 && (
          <g>
            <rect x="70" y="168" width="8" height="90" fill="#8B97A8" />
            <rect x="52" y="160" width="90" height="8" fill="#7EB8C9" />
            <rect x="52" y="148" width="90" height="8" fill="#7EB8C9" />
          </g>
        )}
        <g transform="translate(240 210)">
          <rect x="0" y="40" width="70" height="40" rx="4" fill="#131820" stroke="#8B97A8" />
          <circle cx="20" cy="60" r="8" fill="#090C12" stroke="#7EB8C9" />
          <rect x="80" y="20" width="36" height="60" rx="6" fill="#1A222E" stroke="#7EB8C9" />
          {step >= 4 && <rect x="86" y="28" width="24" height="20" fill="#7EB8C9" opacity="0.5" />}
          {step >= 5 && (
            <>
              <rect x="130" y="48" width="50" height="32" rx="4" fill="#131820" stroke="#6FBF9A" />
              <text x="138" y="68" fill="#6FBF9A" fontSize="10" fontFamily="IBM Plex Mono">
                O₂
              </text>
            </>
          )}
        </g>
        {step >= 2 && (
          <g transform="translate(420 250)">
            <rect x="0" y="0" width="54" height="28" fill="#8B97A8" />
            <circle cx="12" cy="32" r="8" fill="#2A3344" />
            <circle cx="40" cy="32" r="8" fill="#2A3344" />
          </g>
        )}
        {step >= 3 && moon && <ellipse cx="500" cy="300" rx="36" ry="10" fill="#C5D4E3" opacity="0.35" />}
        {!moon && step >= 1 && (
          <g>
            <rect x="160" y="200" width="16" height="50" fill="#8B97A8" />
            <ellipse cx="168" cy="190" rx="18" ry="8" fill="#7EB8C9" opacity="0.4" />
          </g>
        )}
        <text x="24" y="400" fill="#8B97A8" fontSize="11" fontFamily="Outfit">
          {moon ? "Lunar south pole · vacuum" : "Martian plains · thin CO₂"}
        </text>
      </svg>
    </div>
  );
}

function HabitatArt3D({ step, dest }: { step: number; dest: "moon" | "mars" }) {
  // Reuse the surface scene as the backdrop for habitat construction
  return <SurfaceScene3D dest={dest} step={Math.max(step, 1)} />;
}

function HabitatArt({ step, dest }: { step: number; dest: "moon" | "mars" }) {
  const moon = dest === "moon";
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <svg viewBox="0 0 640 420" className="h-full w-full" role="img" aria-label="Habitat construction">
        <rect width="640" height="420" fill={moon ? "#090C12" : "#1A1714"} />
        <path d="M0 280 L640 250 L640 420 L0 420 Z" fill={moon ? "#1A222E" : "#4A2A22"} />
        <ellipse
          cx="320"
          cy="240"
          rx={90 + step * 4}
          ry={40 + step * 2}
          fill="#131820"
          stroke="#7EB8C9"
          strokeWidth="3"
        />
        {step >= 1 && (
          <ellipse cx="320" cy="240" rx="70" ry="28" fill="#7EB8C9" opacity="0.12" />
        )}
        {step >= 2 && (
          <path d="M230 240 Q320 160 410 240" fill={moon ? "#2A3344" : "#6A3E2E"} opacity="0.85" />
        )}
        {step >= 3 && (
          <g>
            <rect x="300" y="200" width="40" height="30" fill="#6FBF9A" opacity="0.5" />
            <rect x="348" y="208" width="24" height="22" fill="#6FBF9A" opacity="0.4" />
          </g>
        )}
        {step >= 4 && <circle cx="260" cy="250" r="10" fill="#7EB8C9" opacity="0.6" />}
        <rect x="430" y="220" width="50" height="36" rx="4" fill="#1A222E" stroke="#8B97A8" />
      </svg>
    </div>
  );
}
