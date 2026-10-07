import { useEffect, useMemo, useState } from "react";
import { DESTINATIONS, plantSteps, type PlantStep } from "@/game/data";
import { useGame } from "@/game/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { formatKg } from "@/lib/utils";
import { SurfaceScene3D } from "./three/SurfaceScene3D";
import { MarsCiv } from "./MarsCiv";
import { FieldTask } from "./FieldTask";
import { habitatSteps, civLedger, MARS_CIV_STEPS } from "@/game/data";
import { layerV2ForStep, whyCardsFor, type WhyCard } from "@/game/civ-v2";
import { siteById, civHint, type MarsSiteId } from "@/game/mars";
import { cn } from "@/lib/utils";
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

export function Habitat() {
  const mission = useGame((s) => s.mission);
  const habitatStep = useGame((s) => s.habitatStep);
  const advanceHabitat = useGame((s) => s.advanceHabitat);
  const openLibrary = useGame((s) => s.openLibrary);
  const landingSite = useGame((s) => (s as { landingSite?: MarsSiteId | null }).landingSite ?? "utopia");
  const reduced = useGame((s) => s.reducedMotion);
  const layerProgress = useGame((s) => s.layerProgress);
  const answerWhy = useGame((s) => s.answerWhy);
  const completeFieldTask = useGame((s) => s.completeFieldTask);
  const buildLayer = useGame((s) => s.buildLayer);
  const researchXp = useGame((s) => s.researchXp);

  const [holdOn, setHoldOn] = useState<string | null>(null);
  const [pickedWhy, setPickedWhy] = useState<string | null>(null);

  if (!mission) return null;
  const mars = mission.destination === "mars";
  const steps = habitatSteps(mission.destination);
  const step = steps[Math.min(habitatStep, steps.length - 1)];
  const done = habitatStep >= steps.length;
  const pct = (habitatStep / steps.length) * 100;
  const site = mars ? siteById(landingSite) : null;
  const ledger = civLedger(steps, habitatStep);
  const hint = mars && site ? civHint(step.id, site) : null;
  const v2 = mars && step ? layerV2ForStep(step.id) : undefined;
  const whyCards: WhyCard[] = v2 ? whyCardsFor(v2, landingSite) : [];
  const phase = layerProgress?.phase ?? "why";

  const onWhyPick = (card: WhyCard) => {
    setPickedWhy(card.id);
    if (!card.correct) {
      setHoldOn(card.holdOn ?? "Hold on… try another reason.");
      answerWhy(false);
      return;
    }
    setHoldOn(null);
    answerWhy(true);
  };

  const openGateLibrary = () => {
    useGame.setState({ libraryGateActive: true });
    openLibrary(step.libraryId);
  };

  // Non-Mars: keep simple one-button build
  if (!mars) {
    return (
      <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        <HabitatArt step={habitatStep} dest={mission.destination} />
        <aside className="rounded-xl border border-border bg-surface p-5">
          <Badge>Crew habitat</Badge>
          <h1 className="mt-3 font-display text-2xl font-semibold">
            {done ? "A place to stay" : step.title}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {done
              ? "Pressure, shielding, plants, and a closed water loop. That is a home, not a picnic."
              : step.body}
          </p>
          {step.why && !done && <p className="mt-3 text-sm text-muted">{step.why}</p>}
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
          <Button className="mt-5 w-full" onClick={advanceHabitat} disabled={done}>
            {done ? "Complete" : "Build this layer"}
          </Button>
        </aside>
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
      <div className="relative">
        <MarsCiv
          siteId={site?.id ?? "utopia"}
          step={Math.min(habitatStep + 1, steps.length)}
          reduced={reduced}
          className="min-h-80 sm:min-h-[28rem]"
        />
        {v2 && !done && (
          <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1">
            <span className="rounded-md bg-black/55 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
              {v2.label}
            </span>
            <span className="rounded-md bg-black/45 px-2 py-1 text-[10px] text-white/90 backdrop-blur-sm">
              {v2.gloss}
            </span>
          </div>
        )}
      </div>
      <aside className="rounded-xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Mars civilization</Badge>
          {site && <Badge tone="accent">{site.name}</Badge>}
          <Badge tone="mute">{researchXp ?? 0} RXP</Badge>
        </div>
        <h1 className="mt-3 font-display text-2xl font-semibold">
          {done ? "A town, not a picnic" : step.title}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {done
            ? "Power, ice, air, a buried hall, salad, a closed water loop, local bricks, and methane for the ride home. That is a civilization."
            : step.body}
        </p>
        {hint && !done && (
          <p className="mt-3 rounded-md border border-border bg-raised p-3 text-sm text-fg">{hint}</p>
        )}

        {!done && v2 && (
          <div className="mt-4">
            {/* Phase chips */}
            <ol className="mb-3 flex flex-wrap gap-1 text-[10px] uppercase tracking-wide">
              {(
                [
                  ["why", "Why?"],
                  ["library", "Library"],
                  ["field", "Field"],
                  ["ready", "Build"],
                ] as const
              ).map(([id, label]) => {
                const order = ["why", "library", "field", "ready"];
                const active = phase === id || (phase === "done" && id === "ready");
                const past = order.indexOf(phase) > order.indexOf(id);
                return (
                  <li
                    key={id}
                    className={cn(
                      "rounded-full border px-2 py-0.5",
                      active && "border-accent text-accent",
                      past && "border-go/50 text-go",
                      !active && !past && "border-border text-muted",
                    )}
                  >
                    {label}
                  </li>
                );
              })}
            </ol>

            {phase === "why" && (
              <div>
                <p className="text-xs uppercase tracking-wide text-accent">Why should we do this step?</p>
                <p className="mt-1 text-sm text-muted">Pick the real reason. Wrong answers cost a moment, not the mission.</p>
                <div className="mt-3 space-y-2">
                  {whyCards.map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => onWhyPick(card)}
                      className={cn(
                        "block w-full rounded-md border px-3 py-3 text-left text-sm transition",
                        pickedWhy === card.id
                          ? card.correct
                            ? "border-go bg-go/15 text-fg"
                            : "border-warn bg-warn/10 text-fg"
                          : "border-border bg-raised text-fg hover:border-accent/50",
                      )}
                    >
                      {card.text}
                    </button>
                  ))}
                </div>
                {holdOn && (
                  <div className="mt-3 rounded-md border border-warn/40 bg-warn/10 p-3 text-sm text-fg">
                    <p className="font-medium">Hold on…</p>
                    <p className="mt-1 text-muted">{holdOn}</p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        setHoldOn(null);
                        setPickedWhy(null);
                      }}
                    >
                      Try again
                    </Button>
                  </div>
                )}
              </div>
            )}

            {phase === "library" && (
              <div className="rounded-md border border-accent/40 bg-raised p-4">
                <p className="text-xs uppercase tracking-wide text-accent">Library gate</p>
                <p className="mt-1 text-sm text-muted">
                  Open the science note, read it, and pass the 2-question exit ticket. Build stays locked until you stamp it.
                </p>
                {step.math && (
                  <p className="mt-3 rounded-md border border-border bg-surface p-3 font-mono text-xs text-accent">
                    {step.math}
                  </p>
                )}
                <Button className="mt-4 w-full" onClick={openGateLibrary}>
                  Open required note & exit ticket
                </Button>
              </div>
            )}

            {phase === "field" && v2 && (
              <FieldTask
                def={v2.field}
                siteId={landingSite}
                onComplete={() => completeFieldTask()}
              />
            )}

            {phase === "ready" && (
              <div className="rounded-md border border-go/40 bg-go/10 p-4">
                <p className="text-sm text-fg">
                  You looked, asked why, read the note, and did the field task. Raise the layer — the town grows and you earn Research XP.
                </p>
                <Button className="mt-4 w-full" onClick={() => buildLayer()}>
                  Build this layer · earn RXP
                </Button>
              </div>
            )}
          </div>
        )}

        {!done && !v2 && (
          <Button className="mt-5 w-full" onClick={advanceHabitat}>
            Build this layer
          </Button>
        )}

        <dl className="mt-4 grid grid-cols-2 gap-2 font-mono text-xs tabular-nums sm:grid-cols-4">
          <LedgerCell label="Power" value={`${ledger.powerKw} kW`} />
          <LedgerCell label="Water" value={`${ledger.waterKgDay} kg/d`} />
          <LedgerCell label="O₂" value={`${ledger.o2KgDay.toFixed(1)} kg/d`} />
          <LedgerCell label="CH₄" value={`${ledger.ch4Kg} kg`} />
        </dl>
        <div className="mt-5">
          <div className="mb-1 flex justify-between text-xs text-muted">
            <span>
              Layer {Math.min(habitatStep + 1, steps.length)} / {steps.length}
            </span>
            <span className="font-mono tabular-nums">{Math.round(pct)}%</span>
          </div>
          <Progress value={pct} />
        </div>
        <ol className="mt-4 max-h-48 space-y-1 overflow-auto text-xs text-muted">
          {steps.map((s, i) => (
            <li key={s.id} className={i === habitatStep && !done ? "text-fg" : i < habitatStep ? "text-go" : ""}>
              {i < habitatStep ? "Done · " : i === habitatStep && !done ? "Now · " : ""}
              {s.title}
            </li>
          ))}
        </ol>
        {done && (
          <Button className="mt-5 w-full" disabled>
            Town complete
          </Button>
        )}
      </aside>
    </div>
  );
}

function LedgerCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-raised px-2 py-2">
      <dt className="text-muted">{label}</dt>
      <dd className="mt-0.5 text-accent">{value}</dd>
    </div>
  );
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
        {step >= 1 && <ellipse cx="320" cy="240" rx="70" ry="28" fill="#7EB8C9" opacity="0.12" />}
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

