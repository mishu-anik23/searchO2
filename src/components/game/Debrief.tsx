import { ArrowRight } from "lucide-react";
import { DESTINATIONS, ROCKETS } from "@/game/data";
import { useGame } from "@/game/store";
import { formatKg, formatUsd } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Debrief() {
  const mission = useGame((s) => s.mission);
  const debrief = useGame((s) => s.debrief);
  const go = useGame((s) => s.go);
  const openLibrary = useGame((s) => s.openLibrary);
  if (!mission || !debrief) return null;
  const dest = DESTINATIONS[mission.destination];
  const rocket = ROCKETS[mission.rocket];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <Badge tone="go">Contract closed</Badge>
      <h1 className="mt-3 font-display text-3xl font-semibold">Oxygen on {dest.name}.</h1>
      <p className="mt-3 text-muted">
        {rocket.name} delivered. The plant made {formatKg(debrief.oxygen)} of oxygen. That air is now a local resource,
        not a package from Earth.
      </p>
      <dl className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-4">
          <dt className="text-xs uppercase tracking-wide text-muted">Payout</dt>
          <dd className="mt-1 font-mono text-xl tabular-nums text-go">{formatUsd(debrief.pay)}</dd>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <dt className="text-xs uppercase tracking-wide text-muted">Oxygen</dt>
          <dd className="mt-1 font-mono text-xl tabular-nums">{formatKg(debrief.oxygen)}</dd>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <dt className="text-xs uppercase tracking-wide text-muted">Flight cam</dt>
          <dd className="mt-1 font-mono text-xl tabular-nums">{formatUsd(debrief.spentFpv)}</dd>
        </div>
      </dl>
      {(debrief.researchXp ?? 0) > 0 && (
        <div className="mt-6 rounded-xl border border-accent/30 bg-surface p-5">
          <p className="text-xs uppercase tracking-wide text-accent">Science report card</p>
          <p className="mt-2 font-display text-2xl font-semibold">{debrief.researchXp} RXP</p>
          <p className="mt-1 text-sm text-muted">From why-cards, library tickets, and field tasks on the Mars civ path.</p>
        </div>
      )}

      <p className="mt-6 text-sm text-muted">
        Takeaway: {dest.id === "moon"
          ? "Ice is mostly oxygen by mass. Electricity is the key that unlocks it."
          : "Mars already has carbon dioxide. Heat and ceramic cells turn the wrong air into the right gas."}
      </p>
      <div className="mt-8 flex flex-wrap gap-2">
        <Button onClick={() => go("hq")}>
          PLACEHOLDER_RXP
          Return to HQ <ArrowRight className="size-4" />
        </Button>
        <Button variant="secondary" onClick={() => openLibrary(dest.id === "moon" ? "electrolysis" : "moxie")}>
          Read the chemistry
        </Button>
      </div>
    </div>
  );
}
