import type { RocketId } from "@/game/data";
import type { LaunchTelemetry } from "@/game/launch/launchPhysics";
import { Pad3D } from "./three/Pad3D";

export type LaunchPhase = "idle" | "countdown" | "ignition" | "liftoff" | "maxq" | "sep" | "space";

interface LaunchSceneProps {
  rocket: RocketId;
  phase: LaunchPhase;
  tMinus: number;
  altitude: number;
  gantryOpen: boolean;
  reduced: boolean;
  /** Simulation-derived telemetry; when omitted, idle pad view is shown. */
  telemetry?: LaunchTelemetry;
  windKnots?: number;
  cloudDensity?: number;
}

const IDLE_TEL: LaunchTelemetry = {
  missionTime: -10,
  altitudeM: 0,
  verticalVelocityMps: 0,
  horizontalVelocityMps: 0,
  totalVelocityMps: 0,
  accelerationMps2: 0,
  throttle: 0,
  atmosphericDensity: 1.225,
  dynamicPressurePa: 0,
  downrangeKm: 0,
  pitchDeg: 90,
  stage: 1,
  altitudeNorm: 0,
  massKg: 350000,
  thrustN: 0,
  qNorm: 0,
  ignitionProgress: 0,
  holdDownLocked: true,
  plumeExpansion: 1,
  atmosphericFraction: 1,
};

export function LaunchScene({
  rocket,
  phase,
  tMinus,
  altitude,
  gantryOpen,
  reduced,
  telemetry,
  windKnots = 8,
  cloudDensity = 0.6,
}: LaunchSceneProps) {
  const tel =
    telemetry ??
    ({
      ...IDLE_TEL,
      altitudeNorm: altitude,
      altitudeM: altitude * 120000,
      missionTime: phase === "countdown" || phase === "idle" ? -tMinus : altitude * 120,
    } satisfies LaunchTelemetry);

  return (
    <div className="relative h-full min-h-[22rem]">
      <Pad3D
        rocket={rocket}
        phase={phase}
        telemetry={tel}
        gantryOpen={gantryOpen}
        reduced={reduced}
        windKnots={windKnots}
        cloudDensity={cloudDensity}
      />
      <div className="pointer-events-none absolute left-3 top-3 rounded-sm border border-border bg-bg/75 px-2 py-1 font-mono text-xs tabular-nums text-accent">
        {phase === "countdown" || phase === "idle"
          ? `T−${Math.max(0, Math.ceil(tMinus)).toString().padStart(2, "0")}`
          : phaseLabel(phase, tel)}
      </div>
    </div>
  );
}

function phaseLabel(phase: LaunchPhase, tel: LaunchTelemetry) {
  if (phase === "ignition") return "IGNITION";
  if (phase === "maxq") return `MAX-Q · ${(tel.dynamicPressurePa / 1000).toFixed(1)} kPa`;
  if (phase === "sep") return "STAGE SEP";
  if (phase === "space") return "VACUUM";
  const km = tel.altitudeM / 1000;
  return `ALT ${km < 10 ? km.toFixed(1) : Math.round(km)} km`;
}
