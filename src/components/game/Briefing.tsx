import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { STARTING_CREDITS } from "@/game/data";
import { useGame } from "@/game/store";
import { unlockAudio } from "@/game/audio";
import { formatUsd } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Briefing() {
  const setCommander = useGame((s) => s.setCommander);
  const [name, setName] = useState("");

  function start() {
    unlockAudio();
    setCommander(name);
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-bg">
      <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden>
        <svg className="h-full w-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <rect width="1200" height="800" fill="#090C12" />
          {Array.from({ length: 80 }).map((_, i) => (
            <circle
              key={i}
              cx={(i * 97) % 1200}
              cy={(i * 53) % 800}
              r={i % 7 === 0 ? 1.4 : 0.7}
              fill="#E8EDF4"
              opacity={0.25 + (i % 5) * 0.1}
            />
          ))}
          <circle cx="980" cy="160" r="54" fill="#C5D4E3" />
          <circle cx="1008" cy="148" r="8" fill="#090C12" opacity="0.25" />
          <circle cx="960" cy="172" r="12" fill="#090C12" opacity="0.18" />
          <circle cx="220" cy="620" r="160" fill="#C4896A" />
          <ellipse cx="180" cy="580" rx="40" ry="18" fill="#090C12" opacity="0.2" />
        </svg>
      </div>
      <div className="relative mx-auto flex min-h-dvh max-w-3xl flex-col justify-end px-5 pb-12 pt-24 sm:justify-center sm:pb-0">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Mission school</p>
        <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">OxyForge</h1>
        <p className="mt-4 max-w-xl text-base text-muted sm:text-lg">
          Learn how a rocket leaves Earth, then how we make oxygen on the Moon and Mars so people can stay.
          You have a budget. Spend it like a flight director.
        </p>
        <ul className="mt-6 space-y-2 text-sm text-fg/90">
          <li>Start with {formatUsd(STARTING_CREDITS)} in the program account.</li>
          <li>Cargo rockets cost less. Crew rockets cost more because they carry people.</li>
          <li>The Moon is a short hop. Mars is a long, expensive one.</li>
        </ul>
        <form
          className="mt-8 flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            start();
          }}
        >
          <label className="sr-only" htmlFor="cmdr">
            Commander name
          </label>
          <input
            id="cmdr"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Commander name"
            maxLength={24}
            className="h-12 flex-1 rounded-md border border-border bg-raised px-4 text-base text-fg placeholder:text-muted"
          />
          <Button type="submit" size="lg">
            Begin <ArrowRight className="size-4" />
          </Button>
        </form>
      </div>
    </main>
  );
}
