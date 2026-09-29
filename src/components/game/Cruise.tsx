import { Camera, LogOut, Rocket } from "lucide-react";
import { DESTINATIONS, FPV_RATE_PER_SEC, ROCKETS } from "@/game/data";
import { useGame } from "@/game/store";
import { formatUsd } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Cruise() {
  const mission = useGame((s) => s.mission);
  const credits = useGame((s) => s.credits);
  const openFpv = useGame((s) => s.openFpv);
  const beginLanding = useGame((s) => s.beginLanding);
  const go = useGame((s) => s.go);
  const fpvSpent = useGame((s) => s.fpvSpent);
  const openLibrary = useGame((s) => s.openLibrary);
  if (!mission) return null;
  const dest = DESTINATIONS[mission.destination];
  const rocket = ROCKETS[mission.rocket];
  const canCam = credits >= FPV_RATE_PER_SEC;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <Badge tone="accent">Transfer cruise</Badge>
      <h1 className="mt-3 font-display text-3xl font-semibold">Atmosphere is behind you.</h1>
      <p className="mt-2 max-w-2xl text-muted">
        {rocket.name} is on the {dest.travelDays}-day path to the {dest.name} ({dest.distanceKm} km). No air, no lift — only
        burns change your speed.
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-surface">
        <TransferMap dest={mission.destination} />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <section className="rounded-lg border border-border bg-surface p-5">
          <h2 className="font-display text-lg font-semibold">Flight camera</h2>
          <p className="mt-2 text-sm text-muted">
            A cockpit over a compressed solar system. Earth, the Moon, Mars, Jupiter and Saturn render as real disks — point the reticle and a telescope zooms them. The path under you is a Hohmann coast: two burns and a long fall. It costs {formatUsd(FPV_RATE_PER_SEC)} each second. Leave, and the meter stops at once.
          </p>
          {fpvSpent > 0 && (
            <p className="mt-2 font-mono text-xs text-warn">Spent on cam so far {formatUsd(fpvSpent)}</p>
          )}
          <Button className="mt-4" disabled={!canCam} onClick={() => openFpv()}>
            <Camera className="size-4" /> Enter flight camera
          </Button>
          {!canCam && <p className="mt-2 text-xs text-nogo">Need at least {formatUsd(FPV_RATE_PER_SEC)} for one second.</p>}
        </section>
        <section className="rounded-lg border border-border bg-surface p-5">
          <h2 className="font-display text-lg font-semibold">Begin landing</h2>
          <p className="mt-2 text-sm text-muted">
            Time-skip the remaining coast and fly the {dest.name} landing steps — capture burn, descent, then touchdown.
          </p>
          <Button variant="secondary" className="mt-4" onClick={() => beginLanding()}>
            <Rocket className="size-4" /> Start {dest.name} landing
          </Button>
          <button
            type="button"
            className="mt-3 block text-sm text-accent underline-offset-2 hover:underline"
            onClick={() => openLibrary("distance")}
          >
            How far is far?
          </button>
        </section>
      </div>
      <Button variant="ghost" className="mt-4" onClick={() => go("hq")}>
        <LogOut className="size-4" /> Abort mission to HQ
      </Button>
    </div>
  );
}

function TransferMap({ dest }: { dest: "moon" | "mars" }) {
  const far = dest === "mars";
  return (
    <svg viewBox="0 0 720 220" className="w-full" role="img" aria-label="Transfer path">
      <rect width="720" height="220" fill="#090C12" />
      {Array.from({ length: 50 }).map((_, i) => (
        <circle key={i} cx={(i * 67) % 720} cy={(i * 41) % 220} r="0.7" fill="#E8EDF4" opacity="0.5" />
      ))}
      <circle cx="90" cy="110" r="28" fill="#7EB8C9" />
      <circle cx="90" cy="110" r="10" fill="#6FBF9A" />
      <text x="90" y="160" textAnchor="middle" fill="#8B97A8" fontSize="11" fontFamily="Outfit">
        Earth
      </text>
      <path
        d={far ? "M130 110 C 280 40, 480 180, 630 110" : "M130 110 C 250 40, 360 40, 480 110"}
        fill="none"
        stroke="#7EB8C9"
        strokeDasharray="6 6"
        strokeWidth="2"
      />
      <circle cx={far ? 630 : 480} cy="110" r={far ? 16 : 14} fill={far ? "#C4896A" : "#C5D4E3"} />
      <text
        x={far ? 630 : 480}
        y="160"
        textAnchor="middle"
        fill="#8B97A8"
        fontSize="11"
        fontFamily="Outfit"
      >
        {far ? "Mars" : "Moon"}
      </text>
      <rect x={far ? 300 : 240} y="78" width="18" height="28" rx="3" fill="#E8EDF4" />
    </svg>
  );
}
