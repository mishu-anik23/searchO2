import { useMemo, useState } from "react";
import type { FieldTaskDef, FieldTaskKind } from "@/game/civ-v2";
import type { MarsSiteId } from "@/game/mars";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  def: FieldTaskDef;
  siteId: MarsSiteId | null;
  onComplete: () => void;
};

export function FieldTask({ def, siteId, onComplete }: Props) {
  return (
    <div className="mt-4 rounded-xl border border-border bg-raised p-4">
      <p className="text-xs uppercase tracking-wide text-accent">Field task</p>
      <h3 className="mt-1 font-display text-lg font-semibold">{def.title}</h3>
      <p className="mt-1 text-sm text-muted">{def.hint}</p>
      <div className="mt-4">
        <TaskToy kind={def.kind} siteId={siteId} success={def.success} onComplete={onComplete} />
      </div>
    </div>
  );
}

function TaskToy({
  kind,
  siteId,
  success,
  onComplete,
}: {
  kind: FieldTaskKind;
  siteId: MarsSiteId | null;
  success: string;
  onComplete: () => void;
}) {
  const [done, setDone] = useState(false);
  const finish = () => {
    setDone(true);
    onComplete();
  };

  if (done) {
    return (
      <div className="rounded-md border border-go/40 bg-go/10 p-3 text-sm text-fg">
        {success}
      </div>
    );
  }

  switch (kind) {
    case "survey":
      return <SurveyToy onDone={finish} />;
    case "power":
      return <PowerToy siteId={siteId} onDone={finish} />;
    case "ice":
      return <IceToy siteId={siteId} onDone={finish} />;
    case "air":
      return <AirToy onDone={finish} />;
    case "hall":
      return <HallToy onDone={finish} />;
    case "shield":
      return <ShieldToy onDone={finish} />;
    case "green":
      return <GreenToy onDone={finish} />;
    case "loop":
      return <LoopToy onDone={finish} />;
    case "brick":
      return <BrickToy onDone={finish} />;
    case "fuel":
      return <FuelToy onDone={finish} />;
    default:
      return (
        <Button className="w-full" onClick={finish}>
          Complete task
        </Button>
      );
  }
}

function SurveyToy({ onDone }: { onDone: () => void }) {
  const cells = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        slope: i === 4 || i === 7 ? 8 : i % 3 === 0 ? 22 : 12 + (i % 5),
      })),
    [],
  );
  const [picked, setPicked] = useState<number | null>(null);
  const ok = picked !== null && cells[picked].slope <= 15;

  return (
    <div>
      <div className="grid grid-cols-4 gap-2">
        {cells.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setPicked(c.id)}
            className={cn(
              "rounded-md border px-2 py-3 text-xs font-mono tabular-nums",
              c.slope > 15 ? "border-warn/50 text-warn" : "border-go/40 text-go",
              picked === c.id && "ring-2 ring-accent",
            )}
          >
            {c.slope}°
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted">Green tiles are ≲15°. Red is too steep.</p>
      <Button className="mt-3 w-full" disabled={!ok} onClick={onDone}>
        Stamp safe pad
      </Button>
    </div>
  );
}

function PowerToy({ siteId, onDone }: { siteId: MarsSiteId | null; onDone: () => void }) {
  const pole = siteId === "boreum";
  const [panels, setPanels] = useState(0);
  const [reactor, setReactor] = useState(false);
  const [dust, setDust] = useState(0.2);
  const need = pole ? reactor : panels >= 4;
  const watts = pole ? (reactor ? 40 : 0) : Math.round(4 * panels * (1 - dust) * 12);

  return (
    <div>
      {pole ? (
        <Button
          variant={reactor ? "primary" : "secondary"}
          className="w-full"
          onClick={() => setReactor(true)}
        >
          {reactor ? "Reactor online" : "Drop small reactor (polar night)"}
        </Button>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPanels((p) => Math.max(p, n))}
                className={cn(
                  "size-12 rounded-md border text-xs",
                  panels >= n ? "border-accent bg-accent/20 text-fg" : "border-border text-muted",
                )}
              >
                PV {n}
              </button>
            ))}
          </div>
          <label className="mt-3 flex items-center gap-2 text-xs text-muted">
            Dust
            <input
              type="range"
              min={0}
              max={0.7}
              step={0.05}
              value={dust}
              onChange={(e) => setDust(Number(e.target.value))}
              className="flex-1"
            />
            <span className="font-mono tabular-nums">{Math.round(dust * 100)}%</span>
          </label>
          <p className="mt-1 font-mono text-xs text-accent">~{watts} W noon estimate</p>
        </>
      )}
      <Button className="mt-3 w-full" disabled={!need} onClick={onDone}>
        Energize grid
      </Button>
    </div>
  );
}

function IceToy({ siteId, onDone }: { siteId: MarsSiteId | null; onDone: () => void }) {
  const clay = siteId === "jezero" || siteId === "oxia";
  const [depth, setDepth] = useState(0);
  const [heat, setHeat] = useState(0);
  const target = clay ? heat >= 80 : depth >= (siteId === "boreum" ? 1 : 3);

  return (
    <div>
      {clay ? (
        <>
          <p className="text-xs text-muted">Heat clay to free mineral water.</p>
          <input
            type="range"
            min={0}
            max={100}
            value={heat}
            onChange={(e) => setHeat(Number(e.target.value))}
            className="mt-2 w-full"
          />
          <p className="mt-1 font-mono text-xs text-accent">{heat}% bake</p>
        </>
      ) : (
        <>
          <p className="text-xs text-muted">Drill to ice depth ({siteId === "boreum" ? "scoop cap" : "few metres"}).</p>
          <input
            type="range"
            min={0}
            max={8}
            step={0.5}
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
            className="mt-2 w-full"
          />
          <p className="mt-1 font-mono text-xs text-accent">{depth.toFixed(1)} m</p>
        </>
      )}
      <Button className="mt-3 w-full" disabled={!target} onClick={onDone}>
        {clay ? "Bank clay water" : "Open ice mine"}
      </Button>
    </div>
  );
}

function AirToy({ onDone }: { onDone: () => void }) {
  const [spin, setSpin] = useState(0);
  const [temp, setTemp] = useState(20);
  const ok = spin >= 70 && temp >= 750;

  return (
    <div>
      <label className="flex items-center gap-2 text-xs text-muted">
        Compressor
        <input type="range" min={0} max={100} value={spin} onChange={(e) => setSpin(Number(e.target.value))} className="flex-1" />
      </label>
      <label className="mt-2 flex items-center gap-2 text-xs text-muted">
        Cell °C
        <input type="range" min={20} max={900} step={10} value={temp} onChange={(e) => setTemp(Number(e.target.value))} className="flex-1" />
        <span className="font-mono tabular-nums w-12">{temp}</span>
      </label>
      <div className="mt-2 h-2 overflow-hidden rounded bg-border">
        <div className="h-full bg-accent transition-all" style={{ width: `${ok ? 100 : Math.min(90, (spin + temp / 9) / 2)}%` }} />
      </div>
      <p className="mt-1 text-xs text-muted">Target ~800 °C + solid compressor flow. 2 CO₂ → 2 CO + O₂</p>
      <Button className="mt-3 w-full" disabled={!ok} onClick={onDone}>
        Tank O₂
      </Button>
    </div>
  );
}

function HallToy({ onDone }: { onDone: () => void }) {
  const [o2, setO2] = useState(40);
  const fire = o2 > 70;
  const low = o2 < 25;
  const ok = !fire && !low;

  return (
    <div>
      <label className="flex items-center gap-2 text-xs text-muted">
        O₂ fraction %
        <input type="range" min={10} max={100} value={o2} onChange={(e) => setO2(Number(e.target.value))} className="flex-1" />
        <span className="font-mono w-8 tabular-nums">{o2}</span>
      </label>
      <p className={cn("mt-2 text-xs", fire ? "text-warn" : low ? "text-warn" : "text-go")}>
        {fire ? "Fire risk screaming — dilute with N₂/Ar" : low ? "Too thin to breathe" : "Safe mixed air"}
      </p>
      <Button className="mt-3 w-full" disabled={!ok} onClick={onDone}>
        Seal hall
      </Button>
    </div>
  );
}

function ShieldToy({ onDone }: { onDone: () => void }) {
  const [dirt, setDirt] = useState(0);
  const ok = dirt >= 2;

  return (
    <div>
      <label className="flex items-center gap-2 text-xs text-muted">
        Dirt cover (m)
        <input type="range" min={0} max={3} step={0.1} value={dirt} onChange={(e) => setDirt(Number(e.target.value))} className="flex-1" />
        <span className="font-mono w-8 tabular-nums">{dirt.toFixed(1)}</span>
      </label>
      <div className="mt-2 h-3 overflow-hidden rounded bg-border">
        <div
          className={cn("h-full transition-all", dirt >= 2 ? "bg-go" : "bg-warn")}
          style={{ width: `${Math.min(100, (dirt / 2) * 100)}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-muted">Radiation bar leaves red near 2 m of regolith.</p>
      <Button className="mt-3 w-full" disabled={!ok} onClick={onDone}>
        Bury hall
      </Button>
    </div>
  );
}

function GreenToy({ onDone }: { onDone: () => void }) {
  const [lamp, setLamp] = useState(0);
  const ok = lamp >= 60;

  return (
    <div>
      <label className="flex items-center gap-2 text-xs text-muted">
        Sun lamp
        <input type="range" min={0} max={100} value={lamp} onChange={(e) => setLamp(Number(e.target.value))} className="flex-1" />
      </label>
      <p className="mt-2 text-sm">{lamp >= 60 ? "🌱 leaf + O₂ bubble" : "Waiting for light…"}</p>
      <Button className="mt-3 w-full" disabled={!ok} onClick={onDone}>
        Grow first leaves
      </Button>
    </div>
  );
}

function LoopToy({ onDone }: { onDone: () => void }) {
  const [pipes, setPipes] = useState<Record<string, boolean>>({ cabin: false, wash: false, waste: false });
  const [leakFixed, setLeakFixed] = useState(false);
  const ok = pipes.cabin && pipes.wash && pipes.waste && leakFixed;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(["cabin", "wash", "waste"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPipes((s) => ({ ...s, [p]: true }))}
            className={cn(
              "rounded-md border px-3 py-2 text-xs capitalize",
              pipes[p] ? "border-go bg-go/15 text-fg" : "border-border text-muted",
            )}
          >
            {p} pipe
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setLeakFixed(true)}
        className={cn(
          "mt-2 w-full rounded-md border px-3 py-2 text-xs",
          leakFixed ? "border-go bg-go/15" : "border-warn/50 text-warn",
        )}
      >
        {leakFixed ? "Leak sealed" : "Fix leaky joint"}
      </button>
      <Button className="mt-3 w-full" disabled={!ok} onClick={onDone}>
        Close loop
      </Button>
    </div>
  );
}

function BrickToy({ onDone }: { onDone: () => void }) {
  const [heat, setHeat] = useState(0);
  const [holding, setHolding] = useState(false);

  return (
    <div>
      <button
        type="button"
        className="w-full rounded-md border border-border bg-surface py-6 text-sm text-muted active:bg-accent/20"
        onPointerDown={() => {
          setHolding(true);
          const id = window.setInterval(() => {
            setHeat((h) => {
              const n = Math.min(100, h + 4);
              if (n >= 100) window.clearInterval(id);
              return n;
            });
          }, 80);
          (window as unknown as { __brick: number }).__brick = id;
        }}
        onPointerUp={() => {
          setHolding(false);
          window.clearInterval((window as unknown as { __brick: number }).__brick);
        }}
        onPointerLeave={() => {
          setHolding(false);
          window.clearInterval((window as unknown as { __brick: number }).__brick);
        }}
      >
        {holding ? "Sintering…" : "Hold to heat dirt pile"} · {heat}%
      </button>
      <Button className="mt-3 w-full" disabled={heat < 100} onClick={onDone}>
        Raise local hall
      </Button>
    </div>
  );
}

function FuelToy({ onDone }: { onDone: () => void }) {
  const [h2, setH2] = useState(false);
  const [co2, setCo2] = useState(false);
  const [temp, setTemp] = useState(20);
  const ok = h2 && co2 && temp >= 380;

  return (
    <div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setH2(true)}
          className={cn("flex-1 rounded-md border px-2 py-2 text-xs", h2 ? "border-go bg-go/15" : "border-border")}
        >
          H₂ from ice
        </button>
        <button
          type="button"
          onClick={() => setCo2(true)}
          className={cn("flex-1 rounded-md border px-2 py-2 text-xs", co2 ? "border-go bg-go/15" : "border-border")}
        >
          CO₂ from air
        </button>
      </div>
      <label className="mt-2 flex items-center gap-2 text-xs text-muted">
        Pot °C
        <input type="range" min={20} max={450} value={temp} onChange={(e) => setTemp(Number(e.target.value))} className="flex-1" />
        <span className="font-mono w-10 tabular-nums">{temp}</span>
      </label>
      <p className="mt-1 text-xs text-muted">CO₂ + 4 H₂ → CH₄ + 2 H₂O · ~400 °C</p>
      <Button className="mt-3 w-full" disabled={!ok} onClick={onDone}>
        Tank methane
      </Button>
    </div>
  );
}
