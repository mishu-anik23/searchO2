import { useState, type ReactNode } from "react";
import { ArrowRight, BookOpen, Camera, Home, Rocket, Wind } from "lucide-react";
import {
  COMMANDERS,
  MISSION_SHOTS,
  MOTIVATION,
  STARTING_CREDITS,
  commanderById,
  type CommanderId,
  type DestinationId,
} from "@/game/data";
import { useGame } from "@/game/store";
import { formatKg, formatUsd } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JourneyCanvas } from "./JourneyCanvas";
import { SuccessCarousel } from "./SuccessCarousel";
import { AvatarCard } from "./AvatarCard";

export function HQ() {
  const goPlan = useGame((s) => s.goPlan);
  const openLibrary = useGame((s) => s.openLibrary);
  const credits = useGame((s) => s.credits);
  const oxygenKg = useGame((s) => s.oxygenKg);
  const habitats = useGame((s) => s.habitats);
  const missionsDone = useGame((s) => s.missionsDone);
  const commander = useGame((s) => s.commander);
  const commanderId = useGame((s) => s.commanderId);
  const setCommander = useGame((s) => s.setCommander);
  const resetProgress = useGame((s) => s.resetProgress);
  const profile = commanderById(commanderId);
  const [dest, setDest] = useState<DestinationId>("moon");
  const [fpvMode, setFpvMode] = useState(false);
  const [pick, setPick] = useState(false);

  return (
    <div className="pb-10">
      <div className="relative h-72 sm:h-96">
        <JourneyCanvas
          dest={dest}
          mode={fpvMode ? "cockpit" : "cinematic"}
          className="absolute inset-0"
        />
        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1 sm:left-4 sm:top-4">
          <Chip active={dest === "moon"} onClick={() => setDest("moon")}>
            Earth → Moon
          </Chip>
          <Chip active={dest === "mars"} onClick={() => setDest("mars")}>
            Earth → Mars
          </Chip>
          <Chip active={fpvMode} onClick={() => setFpvMode((v) => !v)}>
            <Camera className="size-3" /> {fpvMode ? "Cinematic" : "FPV look"}
          </Chip>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-3">
            <img
              src={profile.src}
              alt=""
              width={96}
              height={144}
              className="hidden h-20 w-14 rounded-md object-cover object-top sm:block"
            />
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">Flight director</p>
              <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">
                Welcome back, {commander}.
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted">
                {profile.callsign} · {profile.role}. {profile.bio} Drag the sky above — cinematic orbit, or FPV from the
                craft. Same 3D solar system as the paid flight camera.
              </p>
              <button
                type="button"
                className="mt-2 text-xs text-accent underline-offset-2 hover:underline"
                onClick={() => setPick((v) => !v)}
              >
                {pick ? "Close portraits" : "Change commander"}
              </button>
            </div>
          </div>
        </div>

        {pick && (
          <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {COMMANDERS.map((c) => (
              <AvatarCard
                key={c.id}
                profile={c}
                compact
                selected={commanderId === c.id}
                onSelect={() => {
                  setCommander(commander, c.id as CommanderId);
                  setPick(false);
                }}
              />
            ))}
          </div>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Stat label="Program funds" value={formatUsd(credits)} icon={<Wind className="size-4" />} />
          <Stat label="Oxygen stored" value={formatKg(oxygenKg)} icon={<Wind className="size-4" />} />
          <Stat
            label="Habitats / flights"
            value={`${habitats} / ${missionsDone}`}
            icon={<Home className="size-4" />}
          />
        </div>

        <div className="mt-8">
          <SuccessCarousel />
        </div>

        <div className="mt-8">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Next world</p>
          <h2 className="mt-1 font-display text-2xl font-semibold">Pick a mission picture, then fly it</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {MISSION_SHOTS.map((shot) => (
              <article key={shot.id} className="overflow-hidden rounded-xl border border-border bg-surface">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img src={shot.src} alt="" className="h-full w-full object-cover" />
                  <Badge className="absolute left-3 top-3" tone={shot.id === "moon" ? "accent" : "warn"}>
                    {shot.kicker}
                  </Badge>
                </div>
                <div className="p-4 sm:p-5">
                  <h3 className="font-display text-xl font-semibold">{shot.title}</h3>
                  <dl className="mt-3 grid grid-cols-2 gap-2">
                    {shot.facts.map((f) => (
                      <div key={f.label} className="rounded-md border border-border bg-raised px-3 py-2">
                        <dt className="text-[0.65rem] uppercase tracking-wide text-muted">{f.label}</dt>
                        <dd className="font-mono text-sm tabular-nums">{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-3 text-sm text-muted">{shot.science}</p>
                  <Button className="mt-4" onClick={() => goPlan(shot.id)}>
                    Plan {shot.id === "moon" ? "Moon" : "Mars"} flight <Rocket className="size-4" />
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border border-border bg-surface">
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <Badge>Gaming FPV</Badge>
              <h2 className="mt-2 font-display text-xl font-semibold">Cockpit over a real sky</h2>
              <p className="mt-2 max-w-xl text-sm text-muted">
                Drag to look. Earth, Moon and Mars are the same photo-mapped globes as the mission camera. During cruise
                that view costs program funds; this preview is free so you can learn the path first.
              </p>
            </div>
            <Button variant={fpvMode ? "primary" : "secondary"} onClick={() => setFpvMode(true)}>
              <Camera className="size-4" /> {fpvMode ? "Looking FPV" : "Switch sky to FPV"}
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {MOTIVATION.slice(0, 2).map((beat) => (
            <section key={beat.title} className="rounded-lg border border-border bg-surface p-4 sm:p-5">
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-accent">{beat.kicker}</p>
              <h2 className="mt-1 font-display text-lg font-semibold">{beat.title}</h2>
              <p className="mt-2 text-sm text-muted">{beat.body}</p>
              <button
                type="button"
                className="mt-3 inline-flex items-center gap-1 text-xs text-accent underline-offset-2 hover:underline"
                onClick={() => openLibrary(beat.libraryId)}
              >
                <BookOpen className="size-3" /> Classroom note
              </button>
            </section>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button size="lg" onClick={() => goPlan(dest)}>
            Let’s go — open planner <ArrowRight className="size-4" />
          </Button>
          <Button variant="secondary" onClick={() => openLibrary("why-oxygen")}>
            Browse notes <BookOpen className="size-4" />
          </Button>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-muted">
          <span>New program starts at {formatUsd(STARTING_CREDITS)}.</span>
          <button type="button" className="underline-offset-2 hover:text-fg hover:underline" onClick={resetProgress}>
            Reset funds and progress
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-4 py-4">
      <div className="flex items-center gap-2 text-muted">
        {icon}
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 font-mono text-xl tabular-nums text-fg">{value}</p>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "inline-flex items-center gap-1 rounded-md border border-accent bg-bg/80 px-3 py-2 text-xs font-medium text-fg backdrop-blur-sm"
          : "inline-flex items-center gap-1 rounded-md border border-border bg-bg/50 px-3 py-2 text-xs font-medium text-muted backdrop-blur-sm hover:text-fg"
      }
    >
      {children}
    </button>
  );
}
