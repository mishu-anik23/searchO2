import type { ReactNode } from "react";
import { ArrowRight, BookOpen, Home, Rocket, Wind, Moon } from "lucide-react";
import { STARTING_CREDITS } from "@/game/data";
import { useGame } from "@/game/store";
import { formatKg, formatUsd } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HQ() {
  const go = useGame((s) => s.go);
  const openLibrary = useGame((s) => s.openLibrary);
  const credits = useGame((s) => s.credits);
  const oxygenKg = useGame((s) => s.oxygenKg);
  const habitats = useGame((s) => s.habitats);
  const missionsDone = useGame((s) => s.missionsDone);
  const commander = useGame((s) => s.commander);
  const resetProgress = useGame((s) => s.resetProgress);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-10">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">Flight director</p>
      <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Welcome back, {commander}.</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Pick a world, pick a rocket, run the pad checklist, then build an oxygen plant. Crew flights also raise a home.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Stat label="Program funds" value={formatUsd(credits)} icon={<Wind className="size-4" />} />
        <Stat label="Oxygen stored" value={formatKg(oxygenKg)} icon={<Wind className="size-4" />} />
        <Stat label="Habitats / flights" value={`${habitats} / ${missionsDone}`} icon={<Home className="size-4" />} />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-accent/30 bg-gradient-to-br from-accent/10 to-surface p-5 sm:p-6 md:col-span-2">
          <Badge tone="accent">Interactive lunar explorer</Badge>
          <h2 className="mt-3 font-display text-xl font-semibold">Explore the Moon</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Rotate the lunar globe, visit the South Pole and Shackleton Crater, and follow a scientifically grounded
            path from regolith to oxygen.
          </p>
          <Button className="mt-5" onClick={() => go("explore")}>
            Open Moon explorer <Moon className="size-4" />
          </Button>
        </section>
        <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <Badge tone="accent">Next flight</Badge>
          <h2 className="mt-3 font-display text-xl font-semibold">Plan a mission</h2>
          <p className="mt-2 text-sm text-muted">
            Moon cargo is the gentle start. Mars crew is the long, expensive exam. Prices change with distance and with
            whether people are on board.
          </p>
          <Button className="mt-5" onClick={() => go("plan")}>
            Open planner <Rocket className="size-4" />
          </Button>
        </section>
        <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <Badge>Classroom</Badge>
          <h2 className="mt-3 font-display text-xl font-semibold">Science library</h2>
          <p className="mt-2 text-sm text-muted">
            Electrolysis, MOXIE, launch windows, Max-Q, and why a kilogram of ice is mostly oxygen. Written for school
            science, not textbooks.
          </p>
          <Button variant="secondary" className="mt-5" onClick={() => openLibrary("why-oxygen")}>
            Browse notes <BookOpen className="size-4" />
          </Button>
        </section>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-muted">
        <span>New program starts at {formatUsd(STARTING_CREDITS)}.</span>
        <button type="button" className="underline-offset-2 hover:text-fg hover:underline" onClick={resetProgress}>
          Reset funds and progress
        </button>
        <span className="inline-flex items-center gap-1">
          Continue <ArrowRight className="size-3" />
        </span>
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
