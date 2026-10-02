import { useState } from "react";
import { ArrowLeft, Rocket } from "lucide-react";
import {
  DESTINATIONS,
  ROCKETS,
  launchPrice,
  type DestinationId,
  type RocketId,
} from "@/game/data";
import { useGame } from "@/game/store";
import { cn, formatUsd } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Planner() {
  const go = useGame((s) => s.go);
  const selectMission = useGame((s) => s.selectMission);
  const credits = useGame((s) => s.credits);
  const openLibrary = useGame((s) => s.openLibrary);
  const planDest = useGame((s) => s.planDest);
  const [dest, setDest] = useState<DestinationId>(planDest);
  const [rocket, setRocket] = useState<RocketId>("hauler");
  const [err, setErr] = useState("");

  const price = launchPrice(rocket, dest);
  const d = DESTINATIONS[dest];
  const r = ROCKETS[rocket];
  const canPay = credits >= price;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-10">
      <Button variant="ghost" size="sm" onClick={() => go("hq")}>
        <ArrowLeft className="size-4" /> HQ
      </Button>
      <h1 className="mt-4 font-display text-3xl font-semibold">Plan the stack</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Two choices. Where you go sets distance and time. What you fly sets mass. Together they set the bill.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <fieldset>
          <legend className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">Destination</legend>
          <div className="grid gap-3">
            {(Object.keys(DESTINATIONS) as DestinationId[]).map((id) => {
              const item = DESTINATIONS[id];
              const active = dest === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setDest(id)}
                  className={cn(
                    "rounded-lg border p-4 text-left transition-colors",
                    active ? "border-accent bg-raised" : "border-border bg-surface hover:border-muted",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-lg font-semibold">{item.name}</span>
                    <Badge tone={id === "moon" ? "accent" : "warn"}>{item.travelLabel}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted">{item.whyHarder}</p>
                  <p className="mt-2 font-mono text-xs text-muted">
                    {item.distanceKm} km · g {item.gravity} · {item.air}
                  </p>
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">Rocket</legend>
          <div className="grid gap-3">
            {(Object.keys(ROCKETS) as RocketId[]).map((id) => {
              const item = ROCKETS[id];
              const active = rocket === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setRocket(id)}
                  className={cn(
                    "rounded-lg border p-4 text-left transition-colors",
                    active ? "border-accent bg-raised" : "border-border bg-surface hover:border-muted",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-lg font-semibold">{item.name}</span>
                    <Badge tone={id === "hauler" ? "mute" : "accent"}>{item.role}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted">{item.blurb}</p>
                  <p className="mt-2 font-mono text-xs text-muted">
                    Payload {item.payloadKg.toLocaleString()} kg · crew {item.crew} · dry mass {item.dryMassT} t
                  </p>
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      <aside className="mt-6 rounded-xl border border-border bg-surface p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Launch bill</p>
            <p className="mt-1 font-mono text-3xl tabular-nums">{formatUsd(price)}</p>
            <p className="mt-2 max-w-lg text-sm text-muted">
              {r.name} to the {d.name}. {d.travelLabel} on the clock. Crew hardware and extra months both add mass,
              and mass adds fuel.
            </p>
            <button
              type="button"
              className="mt-2 text-sm text-accent underline-offset-2 hover:underline"
              onClick={() => openLibrary(dest === "mars" ? "distance" : "equation")}
            >
              Why this costs more →
            </button>
          </div>
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            {!canPay && (
              <p className="text-sm text-nogo">Need {formatUsd(price - credits)} more. Fly a cheaper stack first.</p>
            )}
            {err && <p className="text-sm text-nogo">{err}</p>}
            <Button
              size="lg"
              disabled={!canPay}
              onClick={() => {
                const ok = selectMission(rocket, dest);
                if (!ok) setErr("Not enough funds for this stack.");
              }}
            >
              Pay and roll to the pad <Rocket className="size-4" />
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}
