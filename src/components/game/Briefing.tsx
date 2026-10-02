import { useState } from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import { COMMANDERS, MOTIVATION, STARTING_CREDITS, type CommanderId, type DestinationId } from "@/game/data";
import { useGame } from "@/game/store";
import { unlockAudio } from "@/game/audio";
import { cn, formatUsd } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { JourneyCanvas } from "./JourneyCanvas";
import { AvatarCard } from "./AvatarCard";

export function Briefing() {
  const setCommander = useGame((s) => s.setCommander);
  const openLibrary = useGame((s) => s.openLibrary);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<CommanderId | "">("");
  const [dest, setDest] = useState<DestinationId>("moon");
  const [err, setErr] = useState("");
  const picked = COMMANDERS.find((c) => c.id === avatar);

  function start() {
    if (!avatar) {
      setErr("Pick a commander portrait first.");
      return;
    }
    unlockAudio();
    setCommander(name, avatar);
  }

  return (
    <main className="min-h-dvh bg-bg text-fg">
      <div className="relative h-72 sm:h-96">
        <JourneyCanvas dest={dest} className="absolute inset-0" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-bg/80 to-transparent" />
        <div className="absolute inset-x-0 top-0 flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Mission school</p>
            <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">OxyForge</h1>
          </div>
          <div className="flex flex-wrap gap-1">
            <DestChip id="moon" active={dest === "moon"} onClick={() => setDest("moon")} />
            <DestChip id="mars" active={dest === "mars"} onClick={() => setDest("mars")} />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-8">
        <p className="max-w-2xl text-base text-muted sm:text-lg">
          Learn how a rocket leaves Earth, then how we make oxygen on the Moon and Mars so people can stay.
          You fly the budget. The sky on this page is the same 3D solar system you will fly in the cockpit.
        </p>

        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {MOTIVATION.map((beat) => (
            <li key={beat.title} className="rounded-lg border border-border bg-surface p-4">
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-accent">{beat.kicker}</p>
              <h2 className="mt-1 font-display text-lg font-semibold">{beat.title}</h2>
              <p className="mt-2 text-sm text-muted">{beat.body}</p>
              <button
                type="button"
                className="mt-3 inline-flex items-center gap-1 text-xs text-accent underline-offset-2 hover:underline"
                onClick={() => openLibrary(beat.libraryId)}
              >
                <BookOpen className="size-3" /> Read this note
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Choose your commander</p>
          <h2 className="mt-1 font-display text-2xl font-semibold">Who flies the program?</h2>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Six flight leads — men and women, cadet to veteran. The portrait rides with you in mission control.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {COMMANDERS.map((c) => (
              <AvatarCard
                key={c.id}
                profile={c}
                selected={avatar === c.id}
                onSelect={() => {
                  setAvatar(c.id);
                  setErr("");
                  if (!name) setName(c.name);
                }}
              />
            ))}
          </div>
        </div>

        <form
          className="mt-8 rounded-xl border border-border bg-surface p-4 sm:p-5"
          onSubmit={(e) => {
            e.preventDefault();
            start();
          }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex-1 text-sm">
              <span className="mb-1.5 block text-xs uppercase tracking-wide text-muted">Callsign on the roster</span>
              <input
                id="cmdr"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={picked ? picked.name : "Your name or keep theirs"}
                maxLength={24}
                className="h-12 w-full rounded-md border border-border bg-raised px-4 text-base text-fg placeholder:text-muted"
              />
            </label>
            <Button type="submit" size="lg" disabled={!avatar}>
              Let’s go <ArrowRight className="size-4" />
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted">
            New program starts at {formatUsd(STARTING_CREDITS)}. Cargo is cheaper. Crew is the exam.
          </p>
          {err && <p className="mt-2 text-sm text-nogo">{err}</p>}
        </form>
      </div>
    </main>
  );
}

function DestChip({ id, active, onClick }: { id: DestinationId; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border px-3 py-2 text-xs font-medium backdrop-blur-sm",
        active ? "border-accent bg-bg/80 text-fg" : "border-border bg-bg/50 text-muted hover:text-fg",
      )}
    >
      Earth → {id === "moon" ? "Moon" : "Mars"}
    </button>
  );
}
