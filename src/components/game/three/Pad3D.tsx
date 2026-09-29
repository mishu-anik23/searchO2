import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import type { RocketId } from "@/game/data";
import type { LaunchTelemetry } from "@/game/launch/launchPhysics";
import { altitudeToSceneY } from "@/game/launch/launchPhysics";
import type { LaunchPhase } from "../LaunchScene";
import { RocketModel } from "./RocketModel";
import { EnginePlume } from "./EnginePlume";
import { PadEnvironment } from "./PadEnvironment";
import { CloudLayer } from "./CloudLayer";

interface Pad3DProps {
  rocket: RocketId;
  phase: LaunchPhase;
  telemetry: LaunchTelemetry;
  gantryOpen: boolean;
  reduced: boolean;
  windKnots: number;
  cloudDensity: number;
}

function skyColors(altNorm: number, phase: LaunchPhase): { top: string; mid: string; bot: string; starOp: number } {
  if (phase === "space" || altNorm > 0.9) {
    return { top: "#05060a", mid: "#090c12", bot: "#0a1018", starOp: 1 };
  }
  const t = Math.min(1, altNorm * 1.15);
  // lerp simple hex via three Color
  const c = (a: string, b: string, u: number) => {
    const ca = new THREE.Color(a);
    const cb = new THREE.Color(b);
    return `#${ca.lerp(cb, u).getHexString()}`;
  };
  return {
    top: c("#5a8ab0", "#090c12", t),
    mid: c("#7eb8c9", "#131820", t),
    bot: c("#a8c8d8", "#1a222e", Math.min(1, t * 1.2)),
    starOp: Math.max(0, (altNorm - 0.35) / 0.5),
  };
}

function SceneContent({
  rocket,
  phase,
  telemetry,
  gantryOpen,
  reduced,
  windKnots,
  cloudDensity,
}: Pad3DProps) {
  const rocketGroup = useRef<THREE.Group>(null);
  const cam = useRef<THREE.PerspectiveCamera>(null);
  const starsRef = useRef<THREE.Points>(null);
  const earthRim = useRef<THREE.Mesh>(null);

  const starPositions = useMemo(() => {
    const n = 400;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const b = Math.acos(2 * Math.random() - 1);
      const r = 120 + Math.random() * 40;
      arr[i * 3] = r * Math.sin(b) * Math.cos(a);
      arr[i * 3 + 1] = r * Math.cos(b);
      arr[i * 3 + 2] = r * Math.sin(b) * Math.sin(a);
    }
    return arr;
  }, []);

  const deluge =
    phase === "ignition" || (phase === "liftoff" && telemetry.altitudeM < 80);

  useFrame(({ clock }) => {
    const y = altitudeToSceneY(telemetry.altitudeM);
    if (rocketGroup.current) {
      rocketGroup.current.position.y = 1.1 + y;
      // Downrange drift in scene units
      rocketGroup.current.position.z = -telemetry.downrangeKm * 0.15;
    }

    // Camera director
    if (cam.current) {
      const t = telemetry.missionTime;
      let cx = 8;
      let cy = 4 + y * 0.35;
      let cz = 14;
      if (phase === "countdown" || phase === "idle") {
        const a = clock.elapsedTime * 0.12;
        cx = Math.cos(a) * 12;
        cz = Math.sin(a) * 12;
        cy = 5;
      } else if (phase === "ignition") {
        cx = 6;
        cy = 2.5;
        cz = 10;
      } else if (phase === "liftoff" || phase === "maxq") {
        cx = 10 + y * 0.2;
        cy = 3 + y * 0.5;
        cz = 12 + y * 0.15;
      } else {
        cx = 14;
        cy = 8 + y * 0.4;
        cz = 16;
      }
      // Subtle shake
      if (!reduced && (phase === "ignition" || (phase === "liftoff" && telemetry.altitudeM < 200))) {
        const sh = phase === "ignition" ? 0.08 : 0.04;
        cx += (Math.random() - 0.5) * sh;
        cy += (Math.random() - 0.5) * sh;
      }
      cam.current.position.lerp(new THREE.Vector3(cx, cy, cz), 0.04);
      const lookY = 1.1 + y * 0.9;
      cam.current.lookAt(0, lookY, rocketGroup.current?.position.z ?? 0);
    }

    if (starsRef.current) {
      const mat = starsRef.current.material as THREE.PointsMaterial;
      mat.opacity = skyColors(telemetry.altitudeNorm, phase).starOp;
      starsRef.current.visible = mat.opacity > 0.02;
    }
    if (earthRim.current) {
      const show = telemetry.altitudeNorm > 0.55;
      earthRim.current.visible = show;
      if (show) {
        earthRim.current.position.y = -40 - telemetry.altitudeNorm * 20;
        const s = 80 + telemetry.altitudeNorm * 40;
        earthRim.current.scale.setScalar(s / 80);
      }
    }
  });

  const sky = skyColors(telemetry.altitudeNorm, phase);
  const plumeOn =
    telemetry.throttle > 0.02 &&
    (phase === "ignition" || phase === "liftoff" || phase === "maxq" || phase === "sep" || phase === "space");

  return (
    <>
      <color attach="background" args={[sky.mid]} />
      <fog attach="fog" args={[sky.bot, 40, telemetry.altitudeNorm > 0.6 ? 200 : 90]} />
      <ambientLight intensity={0.35 + telemetry.altitudeNorm * 0.15} />
      <hemisphereLight args={["#b8d4e8", "#3d4a3a", 0.5]} />
      <directionalLight
        position={[40, 60, 20]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <PerspectiveCamera ref={cam} makeDefault fov={50} position={[10, 5, 14]} near={0.1} far={400} />

      <PadEnvironment gantryOpen={gantryOpen} delugeActive={deluge} windKnots={windKnots} />
      <CloudLayer density={cloudDensity} wind={windKnots * 0.15} rocketAltM={telemetry.altitudeM} />

      <group ref={rocketGroup} position={[0, 1.1, 0]}>
        <RocketModel
          rocket={rocket}
          telemetry={telemetry}
          stageSeparated={telemetry.stage >= 2 && phase !== "ignition" && phase !== "countdown"}
          reduced={reduced}
        />
        <group position={[0, 0, 0]}>
          <EnginePlume telemetry={telemetry} stage={telemetry.stage} active={plumeOn} />
        </group>
      </group>

      {/* Cryo vapor (pre-launch) */}
      {(phase === "idle" || phase === "countdown") && (
        <mesh position={[0, 3.5, 0]}>
          <sphereGeometry args={[0.6, 6, 4]} />
          <meshBasicMaterial color="#d0e0f0" transparent opacity={0.15} depthWrite={false} />
        </mesh>
      )}

      {/* Stars */}
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={starPositions.length / 3}
            array={starPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.35} color="#e8edf4" transparent opacity={0} depthWrite={false} sizeAttenuation />
      </points>

      {/* Earth limb at high altitude */}
      <mesh ref={earthRim} position={[0, -60, -40]} rotation={[0.2, 0, 0]} visible={false}>
        <sphereGeometry args={[80, 32, 24]} />
        <meshStandardMaterial color="#2a5080" roughness={0.9} metalness={0.1} />
      </mesh>
    </>
  );
}

const ZERO_TEL: LaunchTelemetry = {
  missionTime: 0,
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
  massKg: 1,
  thrustN: 0,
  qNorm: 0,
  ignitionProgress: 0,
  holdDownLocked: true,
  plumeExpansion: 1,
  atmosphericFraction: 1,
};

export function Pad3D(props: Pad3DProps) {
  const tel = props.telemetry ?? ZERO_TEL;
  return (
    <div className="relative h-full min-h-[22rem] w-full overflow-hidden rounded-xl border border-border bg-[#0a1018]">
      <Canvas
        dpr={props.reduced ? [1, 1] : [1, 1.5]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        shadows={!props.reduced}
      >
        <Suspense fallback={null}>
          <SceneContent {...props} telemetry={tel} />
        </Suspense>
      </Canvas>
    </div>
  );
}
