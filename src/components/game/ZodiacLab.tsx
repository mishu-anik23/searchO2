import { useMemo, useState } from "react";
import { ArrowLeft, FlaskConical, Info } from "lucide-react";
import { useGame } from "@/game/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ZodiacScene } from "./zodiac/ZodiacScene";
import { SignModal } from "./zodiac/SignModal";
import type { ZodiacSign } from "@/game/astro-core/zodiacSigns";
import { computeChart, signName, type Chart } from "@/game/astro-core/chart";
import { runDemoRuleTest, runNullSanityCheck, type PredictionResult } from "@/game/astro-core/predictionLab";

export function ZodiacLab() {
  const go = useGame((s) => s.go);
  const [sign, setSign] = useState<ZodiacSign | null>(null);
  const [chart, setChart] = useState<Chart | null>(null);
  const [pred, setPred] = useState<PredictionResult | null>(null);
  const [form, setForm] = useState({
    date: "2000-01-01",
    time: "12:00",
    lat: "40.7",
    lon: "-74.0",
    house: "equal" as "equal" | "whole" | "placidus",
  });

  const compute = () => {
    const utc = new Date(`${form.date}T${form.time}:00Z`);
    const c = computeChart({
      utc,
      latDeg: parseFloat(form.lat) || 0,
      lonEastDeg: parseFloat(form.lon) || 0,
      houseSystem: form.house,
    });
    setChart(c);
  };

  const sunSign = useMemo(() => (chart ? signName(chart.positions.find((p) => p.id === "sun")!.lambda) : null), [chart]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">Sky lab · Mission control</p>
          <h1 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">Tropical zodiac & natal workspace</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Classroom tool: tropical 30° sectors on the ecliptic, on-demand chart math, and an honest empirical sandbox.
            Tags: <Badge className="mx-0.5">GEOMETRY</Badge>
            <Badge className="mx-0.5">EPHEMERIS</Badge>
            <Badge className="mx-0.5">SYMBOLIC</Badge>
            <Badge className="mx-0.5">EMPIRICAL</Badge>
          </p>
        </div>
        <Button variant="secondary" onClick={() => go("hq")}>
          <ArrowLeft className="size-4" /> HQ
        </Button>
      </div>

      <div className="relative mt-5">
        <ZodiacScene onSelectSign={setSign} selectedIndex={sign?.index ?? null} chart={chart} />
        {sign && <SignModal sign={sign} onClose={() => setSign(null)} />}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface p-4">
          <h2 className="font-display text-lg font-semibold">Birth parameters</h2>
          <p className="mt-1 text-xs text-muted">
            [EPHEMERIS] Positions use educational low-precision formulas (not JPL Horizons). See LIMITS.md.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <label className="flex flex-col gap-1">
              <span className="font-mono text-[10px] text-muted">Date (UTC)</span>
              <input
                type="date"
                className="rounded border border-border bg-bg px-2 py-1.5"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-mono text-[10px] text-muted">Time (UTC)</span>
              <input
                type="time"
                className="rounded border border-border bg-bg px-2 py-1.5"
                value={form.time}
                onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-mono text-[10px] text-muted">Latitude °</span>
              <input
                className="rounded border border-border bg-bg px-2 py-1.5 font-mono"
                value={form.lat}
                onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-mono text-[10px] text-muted">Longitude °E</span>
              <input
                className="rounded border border-border bg-bg px-2 py-1.5 font-mono"
                value={form.lon}
                onChange={(e) => setForm((f) => ({ ...f, lon: e.target.value }))}
              />
            </label>
            <label className="col-span-2 flex flex-col gap-1">
              <span className="font-mono text-[10px] text-muted">House system</span>
              <select
                className="rounded border border-border bg-bg px-2 py-1.5"
                value={form.house}
                onChange={(e) => setForm((f) => ({ ...f, house: e.target.value as typeof form.house }))}
              >
                <option value="equal">Equal (from ASC)</option>
                <option value="whole">Whole sign</option>
                <option value="placidus">Placidus (simplified)</option>
              </select>
            </label>
          </div>
          <Button className="mt-3" onClick={compute}>
            Compute chart on demand
          </Button>
          {chart && (
            <div className="mt-3 space-y-2 font-mono text-[11px] text-slate-300">
              <p>
                [GEOMETRY] ASC {chart.ascendant.toFixed(2)}° · MC {chart.midheaven.toFixed(2)}° · ε{" "}
                {chart.obliquity.toFixed(4)}°
              </p>
              <p>
                [GEOMETRY] Precession offset (signs vs constellations) ~{chart.precessionOffsetDeg.toFixed(1)}°
              </p>
              <p>
                [EPHEMERIS] Sun in <strong>{sunSign}</strong> · {chart.meta.computeMs.toFixed(1)} ms
                {chart.meta.cacheHit ? " · cache hit" : ""}
              </p>
              <ul className="max-h-36 overflow-y-auto rounded border border-border bg-bg/50 p-2">
                {chart.positions.map((b) => (
                  <li key={b.id}>
                    {b.name}: λ {b.lambda.toFixed(2)}° · {signName(b.lambda)}
                    {b.retrograde ? " · R" : ""}
                  </li>
                ))}
              </ul>
              <p className="text-muted">Major aspects (top):</p>
              <ul className="max-h-28 overflow-y-auto text-[10px]">
                {chart.aspects.slice(0, 8).map((a, i) => (
                  <li key={i}>
                    {a.a}–{a.b} {a.type} orb {a.orb.toFixed(1)}° str {a.strength.toFixed(2)}
                    {a.applying ? " applying" : " separating"}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-border bg-surface p-4">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <FlaskConical className="size-5 text-accent" /> Prediction lab
          </h2>
          <p className="mt-1 text-xs text-muted">
            [EMPIRICAL] Tests whether a rule beats chance. Null and negative results are reported with equal weight. No
            language of “proves astrology.”
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setPred(runNullSanityCheck(240))}
            >
              Null sanity check
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setPred(runDemoRuleTest(240))}>
              Demo rule vs chance
            </Button>
          </div>
          {pred && (
            <div className="mt-3 space-y-1 rounded-lg border border-border bg-bg/60 p-3 font-mono text-[11px]">
              {pred.warning && <p className="text-orange-200">{pred.warning}</p>}
              <p>
                n={pred.n} hits={pred.hits} rate={(pred.hitRate * 100).toFixed(1)}% chance=
                {(pred.chanceRate * 100).toFixed(1)}%
              </p>
              <p>
                χ²={pred.chiSquare.toFixed(3)} p≈{pred.pValue.toFixed(3)} Cohen h={pred.cohensH.toFixed(3)}
              </p>
              <p className="text-slate-300">{pred.interpretation}</p>
            </div>
          )}
          <div className="mt-4 flex gap-2 rounded-lg border border-white/10 bg-black/30 p-3 text-xs text-muted">
            <Info className="size-4 shrink-0 text-accent" />
            <p>
              Full VSOP87D / ELP2000 tables, WebXR Quest native, and CSV-blinded cohorts are specified for a later phase.
              This build prioritizes clear geometry/symbolic separation and on-demand charts inside Mission Control.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
