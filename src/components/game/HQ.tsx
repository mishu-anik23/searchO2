import type { ReactNode } from "react";
import { ArrowRight, BookOpen, Home, Rocket, Wind, Moon, Users, Check, Sparkles } from "lucide-react";
import { STARTING_CREDITS } from "@/game/data";
import { CREW_ROSTER, CREW_SEAT_LIMIT, roleLabel, type CrewMember } from "@/game/crew";
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
  const crewHired = useGame((s) => s.crewHired);
  const crewSeats = useGame((s) => s.crewSeats);
  const hireCrew = useGame((s) => s.hireCrew);
  const toggleCrewSeat = useGame((s) => s.toggleCrewSeat);

  const seated = crewSeats
    .map((id) => CREW_ROSTER.find((c) => c.id === id))
    .filter(Boolean) as CrewMember[];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-10">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">Flight director · HQ</p>
      <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Welcome back, {commander}.</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Pick a world, pick a rocket, assign flight crew for Crewmark seats, run the pad checklist, then build an oxygen
        plant. Crew flights also raise a home.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Stat label="Program funds" value={formatUsd(credits)} icon={<Wind className="size-4" />} />
        <Stat label="Oxygen stored" value={formatKg(oxygenKg)} icon={<Wind className="size-4" />} />
        <Stat label="Habitats / flights" value={`${habitats} / ${missionsDone}`} icon={<Home className="size-4" />} />
      </div>


      <section className="mt-6 rounded-xl border border-cyan-200/20 bg-gradient-to-br from-slate-950 to-slate-900/80 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge tone="accent">Sky lab</Badge>
            <h2 className="mt-2 font-display text-xl font-semibold">Tropical zodiac & natal workspace</h2>
            <p className="mt-2 max-w-xl text-sm text-muted">
              12 equal 30° ecliptic sectors, on-demand birth chart math, and an honest prediction sandbox.
              Geometry and symbolic tradition stay visually separated.
            </p>
          </div>
          <Button onClick={() => go("zodiac-lab")}>
            <Sparkles className="size-4" /> Open sky lab
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted">
          Same design language as FPV sky: cyan labels, hover pointers. Engineer depth + children summary inside the lab.
        </p>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-surface p-5">
        <Badge tone="accent">Why · sequential missions</Badge>
        <h2 className="mt-2 font-display text-xl font-semibold">Moon, then Mars</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Interest path: look → ask why → fly → land → make O₂. Reuses the live 3D pad, FPV deep sky (constellations + named stars), and surface scenes already in this build.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-raised p-4">
            <p className="text-xs uppercase tracking-wide text-accent">1 · Moon</p>
            <h3 className="mt-1 font-display text-lg font-semibold">Lunar oxygen path</h3>
            <p className="mt-2 text-sm text-muted">~3-day transfer class story. Polar ice / ilmenite → O₂. Plan → pad → launch → FPV cruise → 3D landing → plant.</p>
            <Button className="mt-3 w-full" onClick={() => go("plan")}><Moon className="size-4" /> Plan Moon</Button>
            <Button variant="secondary" className="mt-2 w-full" onClick={() => go("explore")}>Lunar explorer</Button>
          </div>
          <div className="rounded-lg border border-border bg-raised p-4">
            <p className="text-xs uppercase tracking-wide text-accent">2 · Mars</p>
            <h3 className="mt-1 font-display text-lg font-semibold">Mars civ field trip</h3>
            <p className="mt-2 text-sm text-muted">~26-month window story. EDL → MOXIE plant → ten-layer town (why cards, library ticket, field task, RXP).</p>
            <Button className="mt-3 w-full" onClick={() => go("plan")}><Rocket className="size-4" /> Plan Mars</Button>
            <Button variant="secondary" className="mt-2 w-full" onClick={() => go("explore-mars")}>Mars explorer</Button>
          </div>
        </div>
      </section>

      {/* Flight crew avatars */}
      <section className="mt-8 rounded-xl border border-border bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge tone="accent">Flight crew</Badge>
            <h2 className="mt-3 font-display text-xl font-semibold">Mission roster</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Hire specialists once, then seat up to {CREW_SEAT_LIMIT} for the next Crewmark flight. Cargo Hauler-9 does
              not need seats. Hover a card for the science note.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-raised px-3 py-2 text-right">
            <p className="text-[10px] uppercase tracking-wide text-muted">Seats filled</p>
            <p className="font-mono text-lg tabular-nums text-accent">
              {crewSeats.length} / {CREW_SEAT_LIMIT}
            </p>
          </div>
        </div>

        {/* Active seats strip */}
        <div className="mt-5 flex flex-wrap gap-3">
          {Array.from({ length: CREW_SEAT_LIMIT }).map((_, i) => {
            const m = seated[i];
            return (
              <div
                key={i}
                className="flex min-w-[9.5rem] items-center gap-2 rounded-lg border border-border bg-raised px-2.5 py-2"
              >
                {m ? (
                  <>
                    <CrewAvatar member={m} size={36} displayName={m.id === "cmd-self" ? commander : m.name} />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-fg">
                        {m.id === "cmd-self" ? commander || "You" : m.name}
                      </p>
                      <p className="truncate font-mono text-[10px] text-muted">{roleLabel(m.role)}</p>
                    </div>
                  </>
                ) : (
                  <p className="px-1 font-mono text-[10px] text-muted">Empty seat</p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CREW_ROSTER.map((m) => {
            const hired = crewHired.includes(m.id);
            const seatedHere = crewSeats.includes(m.id);
            const locked = missionsDone < m.unlockAfterMissions;
            const canAfford = m.hireCost === 0 || credits >= m.hireCost;
            const label = m.id === "cmd-self" ? commander || "You" : m.name;

            return (
              <article
                key={m.id}
                className={`group relative rounded-xl border p-4 transition-colors ${
                  seatedHere
                    ? "border-accent/50 bg-accent/5"
                    : locked
                      ? "border-border/60 bg-raised/40 opacity-70"
                      : "border-border bg-raised hover:border-accent/35"
                }`}
                title={m.fact}
              >
                <div className="flex gap-3">
                  <CrewAvatar member={m} size={56} displayName={label} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="font-display text-sm font-semibold text-fg">{label}</h3>
                      {seatedHere && (
                        <span className="inline-flex items-center gap-0.5 rounded-sm bg-accent/20 px-1.5 py-0.5 font-mono text-[9px] text-accent">
                          <Check className="size-2.5" /> SEATED
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-[10px] uppercase tracking-wide text-muted">
                      {roleLabel(m.role)} · {m.title}
                    </p>
                    <p className="mt-1.5 text-xs leading-snug text-muted">{m.blurb}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {m.skills.map((sk) => (
                        <span
                          key={sk}
                          className="rounded-sm border border-border bg-surface px-1.5 py-0.5 font-mono text-[9px] text-fg/80"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hover fact */}
                <p className="mt-3 hidden border-t border-border pt-2 text-[11px] leading-snug text-accent group-hover:block">
                  {m.fact}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {locked ? (
                    <p className="font-mono text-[10px] text-muted">Unlock after {m.unlockAfterMissions} mission(s)</p>
                  ) : !hired ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={!canAfford}
                      onClick={() => hireCrew(m.id)}
                    >
                      Hire · {m.hireCost === 0 ? "free" : formatUsd(m.hireCost)}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant={seatedHere ? "secondary" : "primary"}
                      onClick={() => toggleCrewSeat(m.id)}
                    >
                      {seatedHere ? "Remove seat" : "Assign seat"}
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted">
          <Users className="size-3.5" />
          Seated crew applies when you plan a <span className="text-fg">Crewmark-3</span> flight. Hauler-9 is machines
          only.
        </p>
      </section>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-accent/30 bg-gradient-to-br from-accent/10 to-surface p-5 sm:p-6">
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
        <section className="rounded-xl border border-orange-400/25 bg-gradient-to-br from-orange-500/10 to-surface p-5 sm:p-6">
          <Badge tone="accent">Perseverance · Jezero</Badge>
          <h2 className="mt-3 font-display text-xl font-semibold">Explore Mars</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            3D globe with Jezero Crater, Octavia E. Butler Landing, the western delta, MOXIE oxygen demo, Ingenuity,
            Olympus Mons, and Valles Marineris — classroom hover cards and guided tour.
          </p>
          <Button className="mt-5" onClick={() => go("explore-mars")}>
            Open Mars explorer <Rocket className="size-4" />
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

/** Procedural SVG flight-suit avatar — no external art required. */
function CrewAvatar({
  member,
  size = 48,
  displayName,
}: {
  member: CrewMember;
  size?: number;
  displayName: string;
}) {
  const initial = (displayName || member.name || "?").trim().charAt(0).toUpperCase();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className="shrink-0 rounded-full"
      role="img"
      aria-label={displayName}
    >
      <circle cx="32" cy="32" r="32" fill={member.suit} />
      <circle cx="32" cy="32" r="30" fill="none" stroke={member.accent} strokeWidth="2" opacity="0.7" />
      {/* shoulders / suit collar */}
      <ellipse cx="32" cy="54" rx="22" ry="12" fill={member.suit} />
      <ellipse cx="32" cy="52" rx="18" ry="8" fill={member.accent} opacity="0.35" />
      {/* head */}
      <circle cx="32" cy="28" r="14" fill={member.skin} />
      {/* visor hint */}
      <rect x="22" y="24" width="20" height="8" rx="3" fill={member.accent} opacity="0.45" />
      {/* initial badge */}
      <circle cx="48" cy="48" r="9" fill={member.accent} />
      <text
        x="48"
        y="51.5"
        textAnchor="middle"
        fontSize="10"
        fontFamily="ui-monospace, monospace"
        fontWeight="700"
        fill="#090C12"
      >
        {initial}
      </text>
    </svg>
  );
}
