import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Info } from "lucide-react";
import { CHECKLIST, DESTINATIONS, ROCKETS, type ChecklistItem } from "@/game/data";
import { useGame } from "@/game/store";
import { goChime, radioChirp, rumble, tickCountdown, tickZero, unlockAudio } from "@/game/audio";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LaunchScene, type LaunchPhase } from "./LaunchScene";
import { createLaunchSim, LAUNCH_EDUCATION, type LaunchTelemetry, toGamePhase } from "@/game/launch/launchPhysics";
import { cn } from "@/lib/utils";

export function LaunchPad() {
  const screen = useGame((s) => s.screen);
  if (screen === "launch") return <LaunchRun />;
  return <PadChecklist />;
}

function PadChecklist() {
  const mission = useGame((s) => s.mission);
  const abortFromPad = useGame((s) => s.abortFromPad);
  const checklist = useGame((s) => s.checklist);
  const allGo = CHECKLIST.every((c) => checklist[c.id]);
  const beginLaunch = useGame((s) => s.beginLaunch);
  const openLibrary = useGame((s) => s.openLibrary);
  if (!mission) return null;
  const rocket = ROCKETS[mission.rocket];
  const dest = DESTINATIONS[mission.destination];

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)] lg:py-6">
      <div className="min-h-[22rem]">
        <LaunchScene
          rocket={mission.rocket}
          phase="idle"
          tMinus={10}
          altitude={0}
          gantryOpen={false}
          reduced
        />
      </div>
      <div className="flex min-h-0 flex-col">
        <Button variant="ghost" size="sm" className="w-fit" onClick={abortFromPad}>
          <ArrowLeft className="size-4" /> Abort to HQ
        </Button>
        <h1 className="mt-3 font-display text-2xl font-semibold">
          {rocket.name} · {dest.name}
        </h1>
        <p className="mt-1 text-sm text-muted">
          Every line is a real launch idea, simplified. Turn each one GO before countdown.
        </p>
        <ol className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          {CHECKLIST.map((item, i) => (
            <CheckRow key={item.id} item={item} index={i} />
          ))}
        </ol>
        <div className="sticky bottom-0 z-20 -mx-1 mt-4 flex flex-wrap items-center gap-2 border-t border-border bg-bg/95 px-1 py-3 backdrop-blur-sm">
          <Button
            size="lg"
            className="min-h-12 flex-1 sm:flex-none"
            disabled={!allGo}
            onClick={() => {
              unlockAudio();
              beginLaunch();
              requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
            }}
          >
            Start countdown
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openLibrary("oxidizer")}>
            <Info className="size-4" /> Why these checks?
          </Button>
        </div>
      </div>
    </div>
  );
}

function CheckRow({ item, index }: { item: ChecklistItem; index: number }) {
  const done = useGame((s) => s.checklist[item.id]);
  const setCheck = useGame((s) => s.setCheck);
  const openLibrary = useGame((s) => s.openLibrary);
  const mission = useGame((s) => s.mission);
  const [open, setOpen] = useState(false);

  return (
    <li className="rounded-md border border-border bg-surface">
      <button
        type="button"
        className="flex w-full items-center gap-3 px-3 py-3 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-mono text-xs text-muted">{String(index + 1).padStart(2, "0")}</span>
        <span className="flex-1 text-sm font-medium">{item.title}</span>
        <Badge tone={done ? "go" : "nogo"}>{done ? "GO" : "NO-GO"}</Badge>
      </button>
      {open && (
        <div className="space-y-3 border-t border-border px-3 py-3">
          <p className="text-sm text-muted">{item.why}</p>
          {item.libraryId && (
            <button
              type="button"
              className="text-xs text-accent underline-offset-2 hover:underline"
              onClick={() => openLibrary(item.libraryId)}
            >
              Library note
            </button>
          )}
          <CheckAction
            item={item}
            done={done}
            crew={mission?.rocket === "crewmark"}
            onGo={() => {
              setCheck(item.id, true);
              goChime();
            }}
          />
        </div>
      )}
    </li>
  );
}

function CheckAction({
  item,
  done,
  crew,
  onGo,
}: {
  item: ChecklistItem;
  done: boolean;
  crew: boolean;
  onGo: () => void;
}) {
  const fuelLox = useGame((s) => s.fuelLox);
  const fuelCh4 = useGame((s) => s.fuelCh4);
  const setFuel = useGame((s) => s.setFuel);
  const gyro = useGame((s) => s.gyro);
  const setGyro = useGame((s) => s.setGyro);
  const wind = useGame((s) => s.windKnots);
  const pollWeather = useGame((s) => s.pollWeather);
  const holdRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (holdRef.current) window.clearInterval(holdRef.current);
    },
    [],
  );

  if (done) return <p className="text-sm text-go">Set. Next item.</p>;

  if (item.kind === "fuel") {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span>LOX {Math.round(fuelLox)}%</span>
          <span>CH₄ {Math.round(fuelCh4)}%</span>
        </div>
        <Progress value={fuelLox} />
        <Progress value={fuelCh4} barClassName="bg-moon" />
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setFuel(fuelLox + 20, fuelCh4 + 20)}
        >
          Pump propellant
        </Button>
      </div>
    );
  }

  if (item.kind === "gyro") {
    return (
      <div className="space-y-2">
        <Progress value={gyro} />
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setGyro(useGame.getState().gyro + 22)}
          onPointerDown={() => {
            holdRef.current = window.setInterval(() => {
              const g = useGame.getState().gyro;
              setGyro(g + 8);
            }, 80);
          }}
          onPointerUp={() => {
            if (holdRef.current) window.clearInterval(holdRef.current);
          }}
          onPointerLeave={() => {
            if (holdRef.current) window.clearInterval(holdRef.current);
          }}
        >
          Hold to align gyros ({Math.round(gyro)}%)
        </Button>
      </div>
    );
  }

  if (item.kind === "weather") {
    return (
      <div className="space-y-2">
        <p className="font-mono text-sm tabular-nums">Winds {wind.toFixed(0)} kn (need under 20)</p>
        <Button size="sm" variant="secondary" onClick={pollWeather}>
          Poll weather
        </Button>
      </div>
    );
  }

  if (item.kind === "radio") {
    return (
      <Button
        size="sm"
        variant="secondary"
        onClick={() => {
          radioChirp();
          onGo();
        }}
      >
        {item.action}
      </Button>
    );
  }

  if (item.kind === "secure") {
    return (
      <Button size="sm" variant="secondary" onClick={onGo}>
        {crew ? "Crew strapped, abort armed" : "Cargo nets locked"}
      </Button>
    );
  }

  return (
    <Button size="sm" variant="secondary" onClick={onGo}>
      {item.action}
    </Button>
  );
}

function LaunchRun() {
  const mission = useGame((s) => s.mission);
  const finishLaunch = useGame((s) => s.finishLaunch);
  const reduced = useGame((s) => s.reducedMotion);
  const openLibrary = useGame((s) => s.openLibrary);
  const windKnots = useGame((s) => s.windKnots);
  const [phase, setPhase] = useState<LaunchPhase>("countdown");
  const [tMinus, setTMinus] = useState(10);
  const [altitude, setAltitude] = useState(0);
  const [gantry, setGantry] = useState(false);
  const [tel, setTel] = useState<LaunchTelemetry | null>(null);
  const [eduId, setEduId] = useState<string | null>(null);
  const [callout, setCallout] = useState("");
  const sim = useRef<ReturnType<typeof createLaunchSim> | null>(null);
  const last = useRef(0);
  const lastBeep = useRef(10);
  const fired = useRef({ rumble: false, zero: false });
  const seenEdu = useRef(new Set<string>());

  useEffect(() => {
    if (!mission) return;
    sim.current = createLaunchSim(mission.rocket, reduced);
    last.current = performance.now();
    let id = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last.current) / 1000);
      last.current = now;
      const s = sim.current;
      if (!s) return;
      const snap = s.step(dt);
      const sp = s.getPhase();
      const gp = toGamePhase(sp);
      setPhase(gp);
      setTel(snap);
      setTMinus(s.getCountdown());
      setAltitude(snap.altitudeNorm);
      setGantry(s.getCountdown() < 7 || snap.missionTime > 0);

      // Audio
      if (gp === "countdown") {
        const whole = Math.ceil(s.getCountdown());
        if (whole < lastBeep.current && whole >= 0) {
          lastBeep.current = whole;
          tickCountdown();
        }
      }
      if (gp === "ignition" && !fired.current.rumble) {
        fired.current.rumble = true;
        rumble(1.4);
        setCallout("Engine ignition sequence start.");
      }
      if (gp === "liftoff" && !fired.current.zero) {
        fired.current.zero = true;
        tickZero();
        setCallout("Liftoff.");
      }
      if (gp === "maxq") setCallout("Maximum dynamic pressure.");
      if (gp === "sep") setCallout("Stage separation.");
      if (gp === "space") setCallout("Vehicle has cleared the sensible atmosphere.");

      // Education events (non-blocking)
      for (const ev of LAUNCH_EDUCATION) {
        if (seenEdu.current.has(ev.id)) continue;
        let hit = false;
        if (ev.trigger === gp) hit = true;
        if (ev.trigger === "altitude" && ev.altMin != null && snap.altitudeM >= ev.altMin) hit = true;
        if (hit) {
          seenEdu.current.add(ev.id);
          setEduId(ev.id);
          break;
        }
      }

      if (s.isDone()) {
        finishLaunch();
        return;
      }
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [mission, reduced, finishLaunch]);

  if (!mission) return null;
  const dest = DESTINATIONS[mission.destination];
  const rocket = ROCKETS[mission.rocket];
  const edu = LAUNCH_EDUCATION.find((e) => e.id === eduId);
  const cloudDensity = Math.max(0.2, Math.min(1, 1 - windKnots / 40));

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1.2fr)_22rem]">
      <LaunchScene
        rocket={mission.rocket}
        phase={phase}
        tMinus={tMinus}
        altitude={altitude}
        gantryOpen={gantry}
        reduced={reduced}
        telemetry={tel ?? undefined}
        windKnots={windKnots}
        cloudDensity={cloudDensity}
      />
      <aside className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="accent">{phase.toUpperCase()}</Badge>
          <span className="font-mono text-[10px] text-muted">
            {dest.name.toUpperCase()} · {rocket.name}
          </span>
        </div>
        <h2 className="font-display text-xl font-semibold">{caption(phase)}</h2>
        <p className="text-sm text-muted">{explain(phase)}</p>
        {callout && (
          <p className="rounded border border-accent/30 bg-bg/60 px-2 py-1 font-mono text-[11px] text-accent">
            MCC: {callout}
          </p>
        )}
        {tel && phase !== "countdown" && phase !== "idle" && (
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 font-mono text-[11px] tabular-nums">
            <dt className="text-muted">Altitude</dt>
            <dd className="text-right text-fg">
              {tel.altitudeM < 1000
                ? `${Math.round(tel.altitudeM)} m`
                : `${(tel.altitudeM / 1000).toFixed(1)} km`}
            </dd>
            <dt className="text-muted">Velocity</dt>
            <dd className="text-right text-fg">{Math.round(tel.totalVelocityMps)} m/s</dd>
            <dt className="text-muted">Accel</dt>
            <dd className="text-right text-fg">{(tel.accelerationMps2 / 9.81).toFixed(1)} g</dd>
            <dt className="text-muted">Throttle</dt>
            <dd className="text-right text-fg">{Math.round(tel.throttle * 100)}%</dd>
            <dt className="text-muted">Dyn. Q</dt>
            <dd className="text-right text-fg">{(tel.dynamicPressurePa / 1000).toFixed(1)} kPa</dd>
            <dt className="text-muted">Pitch</dt>
            <dd className="text-right text-fg">{tel.pitchDeg.toFixed(0)}°</dd>
            <dt className="text-muted">Atmosphere</dt>
            <dd className="text-right text-fg">{Math.round(tel.atmosphericFraction * 100)}%</dd>
            <dt className="text-muted">Downrange</dt>
            <dd className="text-right text-fg">{tel.downrangeKm.toFixed(1)} km</dd>
            <dt className="text-muted">MET</dt>
            <dd className="text-right text-fg">
              T+{Math.max(0, tel.missionTime).toFixed(1)}s
            </dd>
          </dl>
        )}
        {edu && (
          <article className="rounded-md border border-accent/35 bg-bg/80 p-3">
            <p className="font-display text-sm font-semibold text-fg">{edu.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">{edu.shortText}</p>
            {edu.libraryId && (
              <button
                type="button"
                className="mt-2 text-xs text-accent underline-offset-2 hover:underline"
                onClick={() => openLibrary(edu.libraryId!)}
              >
                Learn more
              </button>
            )}
            <button
              type="button"
              className="mt-1 block text-[10px] text-muted hover:text-fg"
              onClick={() => setEduId(null)}
            >
              Dismiss
            </button>
          </article>
        )}
        <ol className="mt-auto space-y-1 font-mono text-xs text-muted">
          {["countdown", "ignition", "liftoff", "maxq", "sep", "space"].map((p) => (
            <li key={p} className={cn(p === phase && "text-accent")}>
              {p}
            </li>
          ))}
        </ol>
        <Button variant="secondary" className="w-full" onClick={finishLaunch}>
          Skip to cruise
        </Button>
      </aside>
    </div>
  );
}


function caption(phase: LaunchPhase) {
  switch (phase) {
    case "countdown":
      return "Clock is running";
    case "ignition":
      return "Engines at full power";
    case "liftoff":
      return "Clamps released";
    case "maxq":
      return "Thickest punch of air";
    case "sep":
      return "Staging";
    default:
      return "Out of the atmosphere";
  }
}

function explain(phase: LaunchPhase) {
  switch (phase) {
    case "countdown":
      return "The gantry pulls away. Computers count. People watch winds, engines, and the abort path.";
    case "ignition":
      return "Hold-down clamps keep the rocket on the pad until thrust is higher than weight. Then we let go.";
    case "liftoff":
      return "The stack rises slowly at first. Most of what you see is propellant leaving the nozzles.";
    case "maxq":
      return "Speed is up, air is still thick. Dynamic pressure peaks. Engines may throttle down to ease the load.";
    case "sep":
      return "Empty tanks are dead weight. We drop a stage and light the next. That is how we keep the rocket equation kind.";
    default:
      return "Air is gone. No more wind, no more Max-Q. From here the ship is a spacecraft.";
  }
}
