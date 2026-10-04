/**
 * Honest empirical harness — reports chance baselines without spin. [EMPIRICAL]
 */
export type PredictionResult = {
  n: number;
  hits: number;
  hitRate: number;
  chanceRate: number;
  chiSquare: number;
  pValue: number;
  cohensH: number;
  warning?: string;
  interpretation: string;
};

function chiSquare2x2(hits: number, n: number, p0: number): { chi: number; p: number } {
  const expected = n * p0;
  const expMiss = n * (1 - p0);
  const miss = n - hits;
  const chi =
    (hits - expected) ** 2 / Math.max(1e-9, expected) +
    (miss - expMiss) ** 2 / Math.max(1e-9, expMiss);
  // rough p from chi1
  const p = Math.exp(-0.5 * chi);
  return { chi, p: Math.min(1, p) };
}

function cohensH(p: number, p0: number): number {
  return 2 * Math.asin(Math.sqrt(p)) - 2 * Math.asin(Math.sqrt(p0));
}

/**
 * Simulate a blinded null test: random labels → hit rate should ≈ chanceRate.
 * Real user CSV import can replace sampler later.
 */
export function runNullSanityCheck(n = 200, chanceRate = 1 / 12): PredictionResult {
  let hits = 0;
  for (let i = 0; i < n; i++) {
    if (Math.random() < chanceRate) hits++;
  }
  const hitRate = hits / n;
  const { chi, p } = chiSquare2x2(hits, n, chanceRate);
  const h = cohensH(hitRate, chanceRate);
  const warning =
    n < 200
      ? "Sample size below 200 — treat p-values as exploratory only."
      : undefined;
  return {
    n,
    hits,
    hitRate,
    chanceRate,
    chiSquare: chi,
    pValue: p,
    cohensH: h,
    warning,
    interpretation:
      "Under random labeling, results stay near chance. This is a sanity check that the harness does not invent effects. [EMPIRICAL]",
  };
}

/**
 * Apply a simple symbolic rule to random charts (demo only).
 * Rule: "Sun in Aries" vs random outcome coin-flip — expected null.
 */
export function runDemoRuleTest(n = 240): PredictionResult {
  let hits = 0;
  // chance of Sun in Aries ≈ 1/12; outcome random 50% — independent → chance match 0.5
  const chanceRate = 0.5;
  for (let i = 0; i < n; i++) {
    const sunInAries = Math.random() < 1 / 12;
    const outcome = Math.random() < 0.5;
    // "prediction" claims sunInAries → outcome true
    const predicted = sunInAries;
    if (predicted === outcome) hits++;
    else if (!sunInAries && !outcome) hits++; // count agreement both ways for balanced demo
  }
  // Re-run cleaner: agreement rate with independent bits
  hits = 0;
  for (let i = 0; i < n; i++) {
    const pred = Math.random() < 1 / 12;
    const out = Math.random() < 0.5;
    if (pred === out) hits++;
  }
  const hitRate = hits / n;
  const { chi, p } = chiSquare2x2(hits, n, chanceRate);
  return {
    n,
    hits,
    hitRate,
    chanceRate,
    chiSquare: chi,
    pValue: p,
    cohensH: cohensH(hitRate, chanceRate),
    interpretation:
      "Demo rule (random chart feature vs random outcome) stays near 50% agreement — at chance. No predictive effect is claimed. [EMPIRICAL]",
  };
}
