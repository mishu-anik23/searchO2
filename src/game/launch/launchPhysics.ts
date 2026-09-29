/**
 * Simplified 1-D + pitch launch simulation for searchO₂ educational launch.
 *
 * Units (physics space):
 *   altitude  meters
 *   velocity  m/s
 *   mass      kg
 *   thrust    N
 *   density   kg/m³
 *   pressure  Pa (dynamic pressure q = ½ ρ v²)
 *
 * Simplifications (documented, not NASA-grade):
 * - Point-mass vehicle with fixed Cd and reference area
 * - Exponential atmosphere (scale height model)
 * - Constant gravity (no J2, no Earth rotation)
 * - Gravity-turn pitch program by altitude schedule
 * - Two-stage burn with instantaneous stage mass drop
 * - Throttle schedule: full → Max-Q dip → full → MECO → upper stage
 *
 * Render space uses separate conversion helpers (meters → scene units).
 */

import type { RocketId } from "@/game/data";

export interface LaunchTelemetry {
  missionTime: number;
  altitudeM: number;
  verticalVelocityMps: number;
  horizontalVelocityMps: number;
  totalVelocityMps: number;
  accelerationMps2: number;
  throttle: number;
  atmosphericDensity: number;
  dynamicPressurePa: number;
  downrangeKm: number;
  pitchDeg: number;
  stage: number;
  /** Normalized 0–1 for sky/camera (maps ~0–120 km). */
  altitudeNorm: number;
  massKg: number;
  thrustN: number;
  qNorm: number;
  /** Engine ignition fraction 0–1 during start. */
  ignitionProgress: number;
  holdDownLocked: boolean;
  plumeExpansion: number;
  atmosphericFraction: number;
}

export type LaunchSimPhase =
  | "prelaunch"
  | "countdown"
  | "engine_start"
  | "thrust_buildup"
  | "hold_down_release"
  | "liftoff"
  | "tower_clear"
  | "pitch_program"
  | "max_q"
  | "throttle_up"
  | "meco"
  | "stage_separation"
  | "upper_stage_ignition"
  | "atmospheric_exit"
  | "space";

/** Map detailed sim phase → existing game LaunchPhase. */
export function toGamePhase(p: LaunchSimPhase): "idle" | "countdown" | "ignition" | "liftoff" | "maxq" | "sep" | "space" {
  switch (p) {
    case "prelaunch":
      return "idle";
    case "countdown":
      return "countdown";
    case "engine_start":
    case "thrust_buildup":
    case "hold_down_release":
      return "ignition";
    case "liftoff":
    case "tower_clear":
    case "pitch_program":
    case "throttle_up":
      return "liftoff";
    case "max_q":
      return "maxq";
    case "meco":
    case "stage_separation":
    case "upper_stage_ignition":
      return "sep";
    case "atmospheric_exit":
    case "space":
      return "space";
  }
}

const G0 = 9.80665;
const RHO0 = 1.225;
const SCALE_H = 8500; // m, approximate scale height
const SEA_LEVEL_PRESSURE = 101325;

export interface VehicleSpec {
  dryMass1: number;
  propMass1: number;
  dryMass2: number;
  propMass2: number;
  thrust1: number;
  thrust2: number;
  isp1: number;
  isp2: number;
  cd: number;
  area: number;
  /** Max-Q throttle floor (0–1). */
  maxQThrottle: number;
}

const VEHICLES: Record<RocketId, VehicleSpec> = {
  hauler: {
    dryMass1: 18000,
    propMass1: 320000,
    dryMass2: 4500,
    propMass2: 28000,
    thrust1: 5.2e6,
    thrust2: 9.5e5,
    isp1: 310,
    isp2: 340,
    cd: 0.35,
    area: 12,
    maxQThrottle: 0.72,
  },
  crewmark: {
    dryMass1: 22000,
    propMass1: 300000,
    dryMass2: 6200,
    propMass2: 24000,
    thrust1: 4.8e6,
    thrust2: 8.5e5,
    isp1: 305,
    isp2: 345,
    cd: 0.38,
    area: 11,
    maxQThrottle: 0.7,
  },
};

export function createLaunchSim(rocket: RocketId, reduced: boolean) {
  const spec = VEHICLES[rocket];
  const speed = reduced ? 2.4 : 1;

  let t = 0; // mission time after T-0, negative during countdown
  let countdownT = 10; // T-minus remaining
  let alt = 0;
  let vVert = 0;
  let vHoriz = 0;
  let prop1 = spec.propMass1;
  let prop2 = spec.propMass2;
  let stage = 1;
  let throttle = 0;
  let ignitionProgress = 0;
  let holdDown = true;
  let peakQ = 0;
  let pastMaxQ = false;
  let phase: LaunchSimPhase = "countdown";
  let done = false;
  let firedUpper = false;
  let sepTimer = 0;

  function density(h: number): number {
    return RHO0 * Math.exp(-Math.max(0, h) / SCALE_H);
  }

  function mass(): number {
    if (stage === 1) return spec.dryMass1 + prop1 + spec.dryMass2 + prop2;
    return spec.dryMass2 + prop2;
  }

  function pitchProgram(h: number): number {
    // Gravity turn: near vertical at pad, pitch over after tower clear
    if (h < 150) return 90;
    if (h < 2000) return 90 - ((h - 150) / 1850) * 8;
    if (h < 12000) return 82 - ((h - 2000) / 10000) * 22;
    if (h < 40000) return 60 - ((h - 12000) / 28000) * 25;
    if (h < 90000) return 35 - ((h - 40000) / 50000) * 15;
    return 18;
  }

  function step(dtRaw: number): LaunchTelemetry {
    const dt = dtRaw * speed;
    if (done) return snapshot();

    // --- Countdown ---
    if (countdownT > 0) {
      countdownT = Math.max(0, countdownT - dt);
      phase = "countdown";
      t = -countdownT;
      if (countdownT <= 0) {
        phase = "engine_start";
        t = 0;
      }
      return snapshot();
    }

    t += dt;

    // --- Engine start / thrust buildup ---
    if (phase === "engine_start" || phase === "thrust_buildup") {
      ignitionProgress = Math.min(1, ignitionProgress + dt / 1.4);
      throttle = ignitionProgress * 0.95;
      phase = ignitionProgress < 1 ? "thrust_buildup" : "hold_down_release";
      // No motion while held
      return snapshot();
    }

    if (phase === "hold_down_release") {
      const thrust = stageThrust() * throttle;
      const weight = mass() * G0;
      if (thrust > weight * 1.05) {
        holdDown = false;
        phase = "liftoff";
      } else {
        throttle = Math.min(1, throttle + dt * 0.3);
      }
      return snapshot();
    }

    // --- Powered flight ---
    const pitchRad = (pitchProgram(alt) * Math.PI) / 180;
    const rho = density(alt);
    const v = Math.hypot(vVert, vHoriz);
    const q = 0.5 * rho * v * v;

    if (q > peakQ) peakQ = q;
    if (!pastMaxQ && peakQ > 2e4 && q < peakQ * 0.92 && alt > 8000) {
      pastMaxQ = true;
    }

    // Throttle schedule
    if (stage === 1) {
      if (prop1 <= 0) {
        throttle = 0;
        if (phase !== "meco" && phase !== "stage_separation" && phase !== "upper_stage_ignition") {
          phase = "meco";
          sepTimer = 0;
        }
      } else if (q > 2.5e4 && !pastMaxQ && alt > 5000 && alt < 20000) {
        throttle = spec.maxQThrottle;
        phase = "max_q";
      } else if (pastMaxQ && alt < 45000) {
        throttle = 1;
        phase = "throttle_up";
      } else if (alt < 150) {
        throttle = 1;
        phase = "liftoff";
      } else if (alt < 1500) {
        throttle = 1;
        phase = "tower_clear";
      } else if (alt < 50000) {
        throttle = pastMaxQ ? 1 : throttle;
        if (phase !== "max_q") phase = "pitch_program";
      }
    }

    // Staging sequence
    if (phase === "meco") {
      sepTimer += dt;
      if (sepTimer > 0.6) {
        phase = "stage_separation";
        stage = 2;
        prop1 = 0;
        sepTimer = 0;
      }
    } else if (phase === "stage_separation") {
      sepTimer += dt;
      if (sepTimer > 0.8) {
        phase = "upper_stage_ignition";
        firedUpper = true;
        throttle = 1;
      }
    } else if (phase === "upper_stage_ignition" || (stage === 2 && firedUpper)) {
      if (prop2 <= 0) throttle = 0;
      else throttle = 1;
      if (alt > 95000 || rho < 0.001) phase = "atmospheric_exit";
      if (alt > 110000) {
        phase = "space";
        done = true;
      }
    }

    const thrust = stageThrust() * throttle;
    const m = mass();
    // Drag opposite velocity
    const drag = 0.5 * rho * v * v * spec.cd * spec.area;
    const dragAx = v > 1 ? (drag * vHoriz) / v : 0;
    const dragAy = v > 1 ? (drag * vVert) / v : 0;

    const tHoriz = thrust * Math.cos(pitchRad);
    const tVert = thrust * Math.sin(pitchRad);

    const aHoriz = (tHoriz - dragAx) / m;
    const aVert = (tVert - dragAy) / m - G0;

    vHoriz += aHoriz * dt;
    vVert += aVert * dt;
    alt = Math.max(0, alt + vVert * dt);
    const downrange = (vHoriz * t) / 1000; // crude

    // Burn propellant
    if (throttle > 0.01) {
      const isp = stage === 1 ? spec.isp1 : spec.isp2;
      const mdot = thrust / (isp * G0);
      if (stage === 1) prop1 = Math.max(0, prop1 - mdot * dt);
      else prop2 = Math.max(0, prop2 - mdot * dt);
    }

    if (alt > 110000) {
      phase = "space";
      done = true;
    }

    return snapshot();

    function stageThrust(): number {
      return stage === 1 ? spec.thrust1 : spec.thrust2;
    }

    function snapshot(): LaunchTelemetry {
      const rho = density(alt);
      const v = Math.hypot(vVert, vHoriz);
      const q = 0.5 * rho * v * v;
      const pitch = pitchProgram(alt);
      const thrustN = stageThrust() * throttle;
      const m = mass();
      const a = thrustN > 0 && m > 0 ? thrustN / m - G0 * Math.sin((pitch * Math.PI) / 180) : -G0;
      // Plume expands as ambient pressure drops
      const pAmb = SEA_LEVEL_PRESSURE * Math.exp(-alt / SCALE_H);
      const plumeExpansion = Math.min(3.5, 1 + (SEA_LEVEL_PRESSURE - pAmb) / SEA_LEVEL_PRESSURE * 2.5);
      const atmFrac = Math.min(1, rho / RHO0);

      return {
        missionTime: t,
        altitudeM: alt,
        verticalVelocityMps: vVert,
        horizontalVelocityMps: vHoriz,
        totalVelocityMps: v,
        accelerationMps2: a,
        throttle,
        atmosphericDensity: rho,
        dynamicPressurePa: q,
        downrangeKm: Math.max(0, (vHoriz * Math.max(0, t)) / 1000),
        pitchDeg: pitch,
        stage,
        altitudeNorm: Math.min(1, alt / 120000),
        massKg: m,
        thrustN,
        qNorm: Math.min(1, q / 4e4),
        ignitionProgress,
        holdDownLocked: holdDown,
        plumeExpansion,
        atmosphericFraction: atmFrac,
      };
    }
  }

  function getPhase(): LaunchSimPhase {
    return phase;
  }

  function isDone(): boolean {
    return done;
  }

  function getCountdown(): number {
    return countdownT;
  }

  return { step, getPhase, isDone, getCountdown, toGamePhase };
}

/** Convert physics altitude (m) to scene Y offset for rocket (visual scale). */
export function altitudeToSceneY(altM: number): number {
  // Nonlinear: pad scale near ground, compressed at high altitude
  if (altM < 200) return altM * 0.08;
  if (altM < 5000) return 16 + (altM - 200) * 0.012;
  if (altM < 40000) return 16 + 57.6 + (altM - 5000) * 0.004;
  return 16 + 57.6 + 140 + (altM - 40000) * 0.0015;
}

export const LAUNCH_EDUCATION: {
  id: string;
  title: string;
  shortText: string;
  libraryId?: string;
  trigger: "countdown" | "ignition" | "liftoff" | "maxq" | "sep" | "space" | "altitude";
  altMin?: number;
}[] = [
  {
    id: "weather",
    title: "Why weather matters",
    shortText: "A tall rocket feels strong side forces in dense air. High winds can push it off the planned path.",
    libraryId: "windows",
    trigger: "countdown",
  },
  {
    id: "deluge",
    title: "Water deluge system",
    shortText: "Engines make extreme heat and sound. Flooding the pad with water protects the structure and dampens acoustic energy.",
    trigger: "ignition",
  },
  {
    id: "holddown",
    title: "Why doesn't it move immediately?",
    shortText: "Engines start first. Hold-down clamps wait until thrust is higher than weight, then release.",
    trigger: "ignition",
  },
  {
    id: "liftoff",
    title: "Liftoff",
    shortText: "Clamps open. The stack rises slowly at first — most of the early mass is propellant.",
    trigger: "liftoff",
  },
  {
    id: "maxq",
    title: "Max-Q",
    shortText: "Dynamic pressure q = ½ ρ v² peaks when speed is high while air is still thick. Engines may throttle down.",
    libraryId: "maxq",
    trigger: "maxq",
  },
  {
    id: "gravity-turn",
    title: "Gravity turn",
    shortText: "Orbit is not straight up. The rocket builds sideways speed so it keeps falling around Earth.",
    libraryId: "orbits",
    trigger: "altitude",
    altMin: 3000,
  },
  {
    id: "plume",
    title: "Why the flame gets wider",
    shortText: "Outside air pressure falls with altitude, so exhaust gases expand farther from the nozzle.",
    trigger: "altitude",
    altMin: 25000,
  },
  {
    id: "staging",
    title: "Staging",
    shortText: "Empty tanks still have mass. Dropping them lets the rest of the vehicle accelerate more efficiently.",
    libraryId: "hohmann",
    trigger: "sep",
  },
  {
    id: "sky",
    title: "Why the sky goes black",
    shortText: "Blue sky is sunlight scattered by air. Higher up there is less air to scatter light, so the sky darkens.",
    trigger: "altitude",
    altMin: 60000,
  },
  {
    id: "space",
    title: "Spacecraft",
    shortText: "Air is gone. No more Max-Q. From here the vehicle is a spacecraft on a long coast or burn to the target.",
    libraryId: "orbits",
    trigger: "space",
  },
];
