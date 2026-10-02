import { useEffect, useMemo, useState } from "react";
import { DESTINATIONS, plantSteps, type PlantStep } from "@/game/data";
import { useGame } from "@/game/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { formatKg } from "@/lib/utils";
import { SurfaceScene3D } from "./three/SurfaceScene3D";
import { Sparkles, Trophy, Zap, BookOpen, ChevronRight } from "lucide-react";

export function Surface() {
  const mission = useGame((s) => s.mission);
  const plantStep = useGame((s) => s.plantStep);
  const advancePlant = useGame((s) => s.advancePlant);
  const openLibrary = useGame((s) => s.openLibrary);
  const oxygenKg = useGame((s) => s.oxygenKg);
  const [popupOpen, setPopupOpen] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [xpFlash, setXpFlash] = useState<number | null>(null);

  if (!mission) return null;
  const dest = DESTINATIONS[mission.destination];
  const steps = plantSteps(mission.destination);
  const step = steps[Math.min(plantStep, steps.length - 1)];
  const done = plantStep >= steps.length;
  const pct = (plantStep / steps.length) * 100;
  const totalXp = useMemo(
    () => steps.slice(0, plantStep).reduce((sum, s) => sum + (s.xp ?? 50), 0),
    [steps, plantStep],
  );
  const totalO2 = useMemo(
    () => steps.slice(0, plantStep).reduce((sum, s) => sum + s.oxygenKg, 0),
    [steps, plantStep],
  );

  useEffect(() => {
    if (!done) setPopupOpen(true);
  }, [plantStep, done]);

  const onAdvance = () => {
    const awarded = step.xp ?? 50;
    setXpFlash(awarded);
    setCelebrate(true);
    window.setTimeout(() => setCelebrate(false), 900);
    window.setTimeout(() => setXpFlash(null), 1400);
    advancePlant();
  };

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
      <div className="relative overflow-hidden rounded-xl border border-border bg-bg" style={{ minHeight: 440 }}>
        <SurfaceScene3D dest={mission.destination} step={Math.min(plantStep, steps.length - 1)} done={done} />
        <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-md border border-accent/30 bg-slate-950/80 px-2.5 py-1 font-mono text-[10px] text-accent">
            <Zap className="mr-1 inline size-3" />
            {totalXp} XP
          </span>
          <span className="rounded-md border border-emerald-400/30 bg-slate-950/80 px-2.5 py-1 font-mono text-[10px] text-emerald-200">
            O₂ session {formatKg(totalO2)}
          </span>
          <span className="rounded-md border border-white/15 bg-slate-950/80 px-2.5 py-1 font-mono text-[10px] text-slate-300">
            {done ? "PLANT ONLINE" : `STEP ${plantStep + 1}/${steps.length}`}
          </span>
        </div>
        {xpFlash != null && (
          <div className="pointer-events-none absolute right-4 top-4 animate-bounce rounded-full border border-accent/40 bg-accent/20 px-3 py-1.5 font-mono text-sm font-semibold text-accent">
            +{xpFlash} XP
          </div>
        )}
        {celebrate && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="rounded-xl border border-accent/40 bg-slate-950/70 px-4 py-2 text-sm text-accent backdrop-blur">
              <Sparkles className="mr-2 inline size-4" />
              Step clear!
            </div>
          </div>
        )}
      </div>

      <aside className="rounded-xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="accent">{dest.plantName}</Badge>
          {!done && step.badge && (
            <Badge>
              <Trophy className="mr-1 size-3" />
              {step.badge}
            </Badge>
          )}
        </div>
        <h1 className="mt-3 font-display text-2xl font-semibold">
          {done ? "Plant online — oxygen flowing!" : step.title}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {done
            ? "Your ISRU factory is producing and storing oxygen. The mission contract can close."
            : step.kidFriendly || step.body}
        </p>
        {!done && step.math && (
          <p className="mt-2 rounded-md border border-border bg-raised px-3 py-2 font-mono text-[11px] text-accent">
            {step.math}
          </p>
        )}

        <div className="mt-5">
          <div className="mb-1 flex justify-between text-xs text-muted">
            <span>Mission progress</span>
            <span className="font-mono tabular-nums">{Math.round(pct)}%</span>
          </div>
          <Progress value={pct} />
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-raised">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: `linear-gradient(90deg, #7EB8C9, ${step.color || "#6FBF9A"})`,
              }}
            />
          </div>
        </div>

        <ol className="mt-4 max-h-52 space-y-1.5 overflow-y-auto text-xs">
          {steps.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                className={`flex w-full items-start gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors ${
                  i === plantStep && !done
                    ? "border-accent/40 bg-accent/10 text-fg"
                    : i < plantStep
                      ? "border-transparent bg-go/5 text-go"
                      : "border-transparent text-muted"
                }`}
                onClick={() => {
                  if (i === plantStep && !done) setPopupOpen(true);
                }}
              >
                <span
                  className="mt-0.5 size-2.5 shrink-0 rounded-full"
                  style={{ background: i <= plantStep ? s.color || "#7EB8C9" : "#334" }}
                />
                <span className="min-w-0 flex-1">
                  <span className="font-medium">
                    {i < plantStep ? "✓ " : i === plantStep && !done ? "▶ " : ""}
                    {s.title}
                  </span>
                  {s.badge && (
                    <span className="mt-0.5 block font-mono text-[10px] opacity-80">
                      {s.badge} · +{s.xp ?? 50} XP
                      {s.oxygenKg > 0 ? ` · +${s.oxygenKg} kg O₂` : ""}
                    </span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ol>

        <div className="mt-5 flex flex-col gap-2">
          {!done && (
            <Button className="w-full" onClick={() => setPopupOpen(true)} variant="secondary">
              <Sparkles className="size-4" />
              Open activity card
            </Button>
          )}
          <Button className="w-full" onClick={onAdvance} disabled={done}>
            {done ? (
              <>Plant complete</>
            ) : (
              <>
                Complete step <ChevronRight className="size-4" />
                {step.xp ? ` (+${step.xp} XP)` : ""}
              </>
            )}
          </Button>
          {done && mission.rocket === "crewmark" && (
            <Button className="w-full" onClick={() => useGame.getState().go("habitat")}>
              Build habitat
            </Button>
          )}
          {done && mission.rocket !== "crewmark" && (
            <Button className="w-full" onClick={() => useGame.getState().completeMission()}>
              Close mission
            </Button>
          )}
          {step.libraryId && !done && (
            <button
              type="button"
              className="inline-flex items-center justify-center gap-1.5 text-sm text-accent underline-offset-2 hover:underline"
              onClick={() => openLibrary(step.libraryId)}
            >
              <BookOpen className="size-3.5" /> Science note
            </button>
          )}
        </div>

        <p className="mt-4 text-[11px] leading-relaxed text-muted">
          Hover glowing markers in the 3D view. Stored program oxygen: {formatKg(oxygenKg)}. On the{" "}
          {dest.name}, every kilogram made here does not have to fly from Earth.
        </p>
      </aside>

      <StepActivityModal
        open={popupOpen && !done}
        onOpenChange={setPopupOpen}
        step={step}
        index={plantStep}
        total={steps.length}
        destName={dest.name}
        onComplete={onAdvance}
      />
    </div>
  );
}

function StepActivityModal({
  open,
  onOpenChange,
  step,
  index,
  total,
  destName,
  onComplete,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  step: PlantStep;
  index: number;
  total: number;
  destName: string;
  onComplete: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90dvh,36rem)] overflow-y-auto border-accent/25 bg-slate-950 sm:max-w-md">
        <div className="flex items-center gap-2">
          <span
            className="flex size-10 items-center justify-center rounded-full text-sm font-bold text-slate-950"
            style={{ background: step.color || "#7EB8C9" }}
          >
            {index + 1}
          </span>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-accent">
              Activity {index + 1} / {total} · {destName}
            </p>
            <DialogTitle className="text-lg">{step.title}</DialogTitle>
          </div>
        </div>
        {step.badge && (
          <p className="mt-2 inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 font-mono text-[11px] text-accent">
            <Trophy className="size-3" /> {step.badge} · +{step.xp ?? 50} XP
            {step.oxygenKg > 0 ? ` · +${step.oxygenKg} kg O₂` : ""}
          </p>
        )}
        <section className="mt-4 rounded-lg border border-accent/20 bg-accent/5 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-accent">For students</p>
          <p className="mt-1.5 text-sm leading-relaxed text-fg">{step.kidFriendly || step.body}</p>
        </section>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">{step.body}</p>
        {step.math && (
          <p className="mt-3 rounded-md border border-border bg-raised px-3 py-2 font-mono text-[11px] text-accent">
            {step.math}
          </p>
        )}
        <div className="mt-5 flex gap-2">
          <Button className="flex-1" onClick={onComplete}>
            Complete & earn XP
          </Button>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Keep exploring
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
