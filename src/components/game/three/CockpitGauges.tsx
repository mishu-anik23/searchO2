import { useRef, useMemo, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useGame } from "@/game/store";
import {
  BODIES,
  transferPath,
  posOf,
  AU,
  type V,
} from "@/game/cosmos";
import { formatEta, formatKm } from "@/lib/utils";
import { TRANSFER, type DestinationId } from "@/game/data";
import { LESSONS, type LessonId } from "@/game/cosmos";

/* ---------- Shared types ---------- */

export type TargetInfo = {
  id: string; name: string; kind: string; blurb: string; fact: string;
  dist: string; range: string; catalog?: string; constellation?: string;
  spectral?: string; appMag?: number; az?: number; el?: number; locked?: boolean;
};

type HudSnap = {
  speed: number;
  yaw: number;
  thrust: number;
  boost: boolean;
  target: TargetInfo | null;
  lesson: LessonId;
  drifted: boolean;
  pathPct: number;
  au: number;
  travelledKm: number;
  remainKm: number;
  etaHours: number;
  vKms: number;
  targetAz: number;
  targetEl: number;
  distEarth: number;
  distTarget: number;
  metHours: number;
  phase: string;
};

const ACCENT = "#7eb8c9";
const GO = "#6fbf9a";
const NOGO = "#c97a6a";
const WARN = "#c9a86f";
const MOON_C = "#c5d4e3";
const MARS_C = "#c4896a";

/* ---------- Smooth value hook ---------- */
function useSmoothValue(value: number, speed = 5) {
  const ref = useRef(value);
  useFrame((_, dt) => {
    ref.current += (value - ref.current) * Math.min(1, speed * dt);
  });
  return ref;
}

/* ---------- 1. RadialGauge ---------- */
export function RadialGauge({
  value, min, max, label, unit, zones, position,
}: {
  value: number; min: number; max: number; label: string; unit: string;
  zones?: { from: number; to: number; color: string }[];
  position?: [number, number, number];
}) {
  const groupRef = useRef<THREE.Group>(null);
  const needleRef = useRef<THREE.Mesh>(null);
  const clamped = Math.min(max, Math.max(min, value));
  const pct = (clamped - min) / (max - min || 1);
  const targetAngle = (pct - 0.5) * Math.PI * 1.5; // -135° to +135°
  const smoothAngle = useRef(0);

  useFrame((_, dt) => {
    smoothAngle.current += (targetAngle - smoothAngle.current) * Math.min(1, 6 * dt);
    if (needleRef.current) {
      needleRef.current.rotation.z = smoothAngle.current;
    }
  });

  const ticks = useMemo(() => {
    const arr: { angle: number; len: number }[] = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      const a = (t - 0.5) * Math.PI * 1.5;
      arr.push({ angle: a, len: i % 3 === 0 ? 0.022 : 0.014 });
    }
    return arr;
  }, []);

  return (
    <group ref={groupRef} position={position}>
      {/* Background disc */}
      <mesh>
        <circleGeometry args={[0.11, 48]} />
        <meshStandardMaterial color="#131820" roughness={0.5} metalness={0.6} />
      </mesh>
      {/* Outer ring */}
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[0.105, 0.006, 8, 48]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.3} />
      </mesh>
      {/* Color zones */}
      {zones?.map((z, i) => {
        const zFrom = Math.max(0, (z.from - min) / (max - min || 1));
        const zTo = Math.min(1, (z.to - min) / (max - min || 1));
        const startAngle = (zFrom - 0.5) * Math.PI * 1.5;
        const endAngle = (zTo - 0.5) * Math.PI * 1.5;
        const segLen = endAngle - startAngle;
        const midAngle = (startAngle + endAngle) / 2;
        return (
          <mesh key={i} rotation={[0, 0, midAngle]}>
            <torusGeometry args={[0.092, 0.004, 6, Math.max(4, Math.floor(segLen * 30))]} />
            <meshBasicMaterial color={z.color} transparent opacity={0.7} />
          </mesh>
        );
      })}
      {/* Tick marks */}
      {ticks.map((t, i) => (
        <mesh key={i} rotation={[0, 0, t.angle]} position={[0, 0, 0.001]}>
          <boxGeometry args={[0.003, t.len, 0.002]} />
          <meshStandardMaterial color="#8b97a8" />
        </mesh>
      ))}
      {/* Needle */}
      <mesh ref={needleRef} position={[0, 0, 0.003]}>
        <boxGeometry args={[0.003, 0.085, 0.002]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.5} />
      </mesh>
      {/* Center cap */}
      <mesh position={[0, 0, 0.005]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.008, 16]} />
        <meshStandardMaterial color="#1a222e" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Digital readout + label */}
      <Html position={[0, -0.16, 0.01]} center distanceFactor={2}>
        <div style={{ textAlign: "center", fontFamily: "IBM Plex Mono, monospace" }}>
          <div style={{ color: "#e8edf4", fontSize: "13px", fontWeight: 600, lineHeight: 1 }}>
            {clamped.toFixed(1)}{unit}
          </div>
          <div style={{ color: "#8b97a8", fontSize: "8px", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "2px" }}>
            {label}
          </div>
        </div>
      </Html>
    </group>
  );
}

/* ---------- 2. BarGauge ---------- */
export function BarGauge({
  value, min, max, label, unit, orientation = "vertical", position,
}: {
  value: number; min: number; max: number; label: string; unit: string;
  orientation?: "vertical" | "horizontal"; position?: [number, number, number];
}) {
  const fillRef = useRef<THREE.Mesh>(null);
  const clamped = Math.min(max, Math.max(min, value));
  const pct = (clamped - min) / (max - min || 1);
  const color = pct > 0.5 ? GO : pct > 0.25 ? WARN : NOGO;
  const smoothPct = useRef(0);

  useFrame((_, dt) => {
    smoothPct.current += (pct - smoothPct.current) * Math.min(1, 5 * dt);
    if (fillRef.current) {
      if (orientation === "vertical") {
        fillRef.current.scale.y = Math.max(0.001, smoothPct.current);
        fillRef.current.position.y = -0.075 + smoothPct.current * 0.075;
      } else {
        fillRef.current.scale.x = Math.max(0.001, smoothPct.current);
        fillRef.current.position.x = -0.04 + smoothPct.current * 0.04;
      }
    }
  });

  const isV = orientation === "vertical";
  const w = isV ? 0.025 : 0.16;
  const h = isV ? 0.16 : 0.025;

  return (
    <group position={position}>
      {/* Track */}
      <mesh>
        <boxGeometry args={[w, h, 0.008]} />
        <meshStandardMaterial color="#131820" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Fill */}
      <mesh ref={fillRef} position={[isV ? 0 : -0.04, isV ? -0.075 : 0, 0.005]}>
        <boxGeometry args={[w * 0.85, h * 0.85, 0.006]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>
      {/* Tick marks */}
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
        <mesh key={i} position={isV ? [w / 2 + 0.006, -0.08 + t * 0.16, 0.004] : [-0.08 + t * 0.16, h / 2 + 0.006, 0.004]}>
          <boxGeometry args={isV ? [0.008, 0.002, 0.003] : [0.002, 0.008, 0.003]} />
          <meshStandardMaterial color="#8b97a8" />
        </mesh>
      ))}
      <Html position={[0, isV ? -0.13 : -0.04, 0.01]} center distanceFactor={2}>
        <div style={{ textAlign: "center", fontFamily: "IBM Plex Mono, monospace" }}>
          <div style={{ color: "#e8edf4", fontSize: "11px", fontWeight: 600 }}>
            {clamped.toFixed(1)}{unit}
          </div>
          <div style={{ color: "#8b97a8", fontSize: "7px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {label}
          </div>
        </div>
      </Html>
    </group>
  );
}

/* ---------- 3. AttitudeIndicator ---------- */
export function AttitudeIndicator({
  pitch, roll, position,
}: {
  pitch: number; roll: number; position?: [number, number, number];
}) {
  const sphereRef = useRef<THREE.Group>(null);
  const bankRef = useRef<THREE.Mesh>(null);
  const smoothPitch = useRef(0);
  const smoothRoll = useRef(0);

  useFrame((_, dt) => {
    smoothPitch.current += (pitch - smoothPitch.current) * Math.min(1, 5 * dt);
    smoothRoll.current += (roll - smoothRoll.current) * Math.min(1, 5 * dt);
    if (sphereRef.current) {
      sphereRef.current.rotation.x = smoothPitch.current;
      sphereRef.current.rotation.z = smoothRoll.current;
    }
    if (bankRef.current) {
      bankRef.current.rotation.z = smoothRoll.current;
    }
  });

  const pitchLines = useMemo(() => {
    const lines: number[] = [-30, -20, -10, 10, 20, 30];
    return lines;
  }, []);

  return (
    <group position={position}>
      {/* Outer ring */}
      <mesh>
        <torusGeometry args={[0.13, 0.007, 8, 48]} />
        <meshStandardMaterial color="#1a222e" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh>
        <torusGeometry args={[0.125, 0.003, 6, 48]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.2} />
      </mesh>
      {/* Sky + ground hemisphere */}
      <group ref={sphereRef}>
        <mesh>
          <sphereGeometry args={[0.12, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#1a3a5c" roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.12, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          <meshStandardMaterial color="#5c3a1a" roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
        {/* Horizon line */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.12, 0.002, 4, 48]} />
          <meshBasicMaterial color="#e8edf4" />
        </mesh>
        {/* Pitch ladder */}
        {pitchLines.map((deg, i) => {
          const a = (deg * Math.PI) / 180;
          const y = Math.sin(a) * 0.12;
          const r = Math.cos(a) * 0.12;
          const len = deg % 10 === 0 ? 0.06 : 0.04;
          return (
            <mesh key={i} position={[0, y, 0.001]} rotation={[0, 0, 0]}>
              <boxGeometry args={[len, 0.002, 0.001]} />
              <meshBasicMaterial color={deg > 0 ? "#8bb8d4" : "#c4a48a"} />
            </mesh>
          );
        })}
      </group>
      {/* Bank indicator (triangle at top) */}
      <mesh ref={bankRef} position={[0, 0.135, 0.002]}>
        <coneGeometry args={[0.012, 0.02, 3]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.4} />
      </mesh>
      {/* Center reticle */}
      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[0.04, 0.003, 0.001]} />
        <meshBasicMaterial color={ACCENT} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[0.003, 0.04, 0.001]} />
        <meshBasicMaterial color={ACCENT} />
      </mesh>
      <Html position={[0, -0.17, 0.01]} center distanceFactor={2}>
        <div style={{ color: "#8b97a8", fontSize: "7px", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "IBM Plex Mono, monospace" }}>
          ATTITUDE
        </div>
      </Html>
    </group>
  );
}

/* ---------- 4. NavMFD ---------- */
export function NavMFD({
  hud, destination, position,
}: {
  hud: HudSnap; destination: DestinationId; position?: [number, number, number];
}) {
  const screenGlowRef = useRef<THREE.PointLight>(null);
  const destLabel = destination === "mars" ? "Mars" : "Moon";

  useFrame((state) => {
    if (screenGlowRef.current) {
      const t = state.clock.elapsedTime;
      screenGlowRef.current.intensity = 0.15 + Math.sin(t * 2) * 0.03;
    }
  });

  return (
    <group position={position}>
      {/* Frame */}
      <mesh>
        <boxGeometry args={[0.35, 0.28, 0.02]} />
        <meshStandardMaterial color="#0d1118" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Screen */}
      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[0.32, 0.25]} />
        <meshStandardMaterial color="#0a1520" emissive="#0a1520" emissiveIntensity={0.4} />
      </mesh>
      <pointLight ref={screenGlowRef} position={[0, 0, 0.1]} color="#7eb8c9" intensity={0.15} distance={0.5} />
      {/* Content */}
      <Html position={[0, 0, 0.015]} center distanceFactor={1.5} transform>
        <div style={{
          width: "200px", padding: "8px 10px",
          background: "linear-gradient(180deg, rgba(10,21,32,0.95), rgba(10,15,25,0.95))",
          borderRadius: "4px",
          fontFamily: "IBM Plex Mono, monospace",
          color: "#e8edf4",
          fontSize: "9px",
          lineHeight: 1.5,
          backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 3px)",
        }}>
          <div style={{ color: "#7eb8c9", fontSize: "8px", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "4px" }}>
            {destination === "mars" ? "MARS TRANSFER" : "MOON TRANSFER"} · {hud.phase}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "1px 8px" }}>
            <span style={{ color: "#8b97a8" }}>MET</span>
            <span style={{ textAlign: "right" }}>{formatEta(hud.metHours)}</span>
            <span style={{ color: "#8b97a8" }}>Travelled</span>
            <span style={{ textAlign: "right" }}>{formatKm(hud.travelledKm)}</span>
            <span style={{ color: "#8b97a8" }}>Remaining</span>
            <span style={{ textAlign: "right" }}>{formatKm(hud.remainKm)}</span>
            <span style={{ color: "#8b97a8" }}>ETA</span>
            <span style={{ textAlign: "right", color: "#7eb8c9" }}>{formatEta(hud.etaHours)}</span>
            <span style={{ color: "#8b97a8" }}>Velocity</span>
            <span style={{ textAlign: "right" }}>{hud.vKms.toFixed(2)} km/s</span>
            <span style={{ color: "#8b97a8" }}>Dist Earth</span>
            <span style={{ textAlign: "right" }}>{formatKm(hud.distEarth)}</span>
            <span style={{ color: "#8b97a8" }}>Dist {destLabel}</span>
            <span style={{ textAlign: "right" }}>{formatKm(hud.distTarget)}</span>
            <span style={{ color: "#8b97a8" }}>Target AZ</span>
            <span style={{ textAlign: "right" }}>{hud.targetAz.toFixed(1)}°</span>
            <span style={{ color: "#8b97a8" }}>Target EL</span>
            <span style={{ textAlign: "right" }}>{hud.targetEl >= 0 ? "+" : ""}{hud.targetEl.toFixed(1)}°</span>
          </div>
          <div style={{ marginTop: "6px", height: "3px", background: "#1a222e", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{ height: "100%", background: "#7eb8c9", width: `${Math.round(hud.pathPct * 100)}%`, transition: "width 0.3s" }} />
          </div>
          <div style={{ color: "#8b97a8", fontSize: "7px", marginTop: "2px" }}>
            Progress {Math.round(hud.pathPct * 100)}% · {hud.au.toFixed(2)} AU from Sun
          </div>
        </div>
      </Html>
    </group>
  );
}

/* ---------- 5. TargetInfoPanel ---------- */
export function TargetInfoPanel({
  target, position,
}: {
  target: TargetInfo | null; position?: [number, number, number];
}) {
  const ringRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ringRef.current && target) {
      const t = state.clock.elapsedTime;
      const s = 1 + Math.sin(t * 3) * 0.05;
      ringRef.current.scale.setScalar(s);
    }
  });

  return (
    <group position={position}>
      {/* Frame */}
      <mesh>
        <boxGeometry args={[0.22, 0.30, 0.02]} />
        <meshStandardMaterial color="#0d1118" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Lock indicator ring */}
      {target && (
        <mesh ref={ringRef} position={[0, 0, 0.015]}>
          <torusGeometry args={[0.16, 0.003, 6, 32]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={0.4} />
        </mesh>
      )}
      {/* Content */}
      <Html position={[0, 0, 0.015]} center distanceFactor={1.5} transform>
        {target ? (
          <div style={{
            width: "130px", padding: "8px",
            background: "rgba(10,15,25,0.92)",
            borderRadius: "4px",
            fontFamily: "IBM Plex Mono, monospace",
            color: "#e8edf4",
            fontSize: "8px",
            lineHeight: 1.5,
          }}>
            <div style={{ fontFamily: "Outfit, sans-serif", fontSize: "12px", fontWeight: 600, color: "#e8edf4" }}>
              {target.name}
            </div>
            {target.catalog && (
              <div style={{ color: "#7eb8c9", fontSize: "8px" }}>{target.catalog}</div>
            )}
            <div style={{ color: "#8b97a8", fontSize: "8px" }}>
              {target.kind}
              {target.constellation ? ` · ${target.constellation}` : ""}
              {target.spectral ? ` · ${target.spectral}` : ""}
              {target.appMag != null ? ` · mag ${target.appMag.toFixed(2)}` : ""}
            </div>
            <div style={{ color: "#7eb8c9", fontSize: "8px", marginTop: "2px" }}>
              {target.range} · {target.dist}
            </div>
            {target.az != null && (
              <div style={{ color: "#8b97a8", fontSize: "8px" }}>
                AZ {target.az.toFixed(1)}° · EL {target.el != null && target.el >= 0 ? "+" : ""}{target.el?.toFixed(1)}°
              </div>
            )}
            <div style={{ color: "#e8edf4", fontSize: "8px", marginTop: "3px" }}>{target.blurb}</div>
            <div style={{ color: "#8b97a8", fontSize: "7px", marginTop: "3px", lineHeight: 1.4 }}>{target.fact}</div>
          </div>
        ) : (
          <div style={{
            width: "130px", padding: "12px 8px",
            background: "rgba(10,15,25,0.85)",
            borderRadius: "4px",
            textAlign: "center",
            fontFamily: "IBM Plex Mono, monospace",
          }}>
            <div style={{ color: "#8b97a8", fontSize: "9px" }}>SCANNING<span className="animate-pulse">...</span></div>
          </div>
        )}
      </Html>
    </group>
  );
}

/* ---------- 6. PhaseBar ---------- */
export function PhaseBar({
  pathPct, phase, lesson, destination, position,
}: {
  pathPct: number; phase: string; lesson: LessonId; destination: DestinationId; position?: [number, number, number];
}) {
  const fillRef = useRef<THREE.Mesh>(null);
  const lessonData = LESSONS[lesson as keyof typeof LESSONS];
  const smoothPct = useRef(0);

  useFrame((_, dt) => {
    smoothPct.current += (pathPct - smoothPct.current) * Math.min(1, 3 * dt);
    if (fillRef.current) {
      fillRef.current.scale.x = Math.max(0.001, smoothPct.current);
      fillRef.current.position.x = -0.2 + smoothPct.current * 0.2;
    }
  });

  const phaseBounds = destination === "mars"
    ? [{ s: 0, e: 0.08, label: "Departure" }, { s: 0.08, e: 0.92, label: "Transfer" }, { s: 0.92, e: 1, label: "Capture" }]
    : [{ s: 0, e: 0.1, label: "TLI" }, { s: 0.1, e: 0.9, label: "Coast" }, { s: 0.9, e: 1, label: "LOI" }];

  return (
    <group position={position}>
      {/* Track */}
      <mesh>
        <boxGeometry args={[0.40, 0.015, 0.005]} />
        <meshStandardMaterial color="#131820" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Fill */}
      <mesh ref={fillRef} position={[-0.2, 0, 0.003]}>
        <boxGeometry args={[0.40, 0.012, 0.004]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.4} />
      </mesh>
      {/* Phase markers */}
      {phaseBounds.map((p, i) => (
        <mesh key={i} position={[-0.2 + p.e * 0.4, 0, 0.005]}>
          <sphereGeometry args={[0.008, 8, 8]} />
          <meshStandardMaterial color={pathPct >= p.e ? GO : "#3a4252"} emissive={pathPct >= p.s && pathPct < p.e ? ACCENT : "#000"} emissiveIntensity={0.3} />
        </mesh>
      ))}
      <Html position={[0, -0.04, 0.01]} center distanceFactor={2}>
        <div style={{ textAlign: "center", fontFamily: "IBM Plex Mono, monospace", width: "180px" }}>
          <div style={{ color: "#7eb8c9", fontSize: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>{phase}</div>
          <div style={{ color: "#e8edf4", fontSize: "9px", fontWeight: 600, fontFamily: "Outfit, sans-serif", marginTop: "2px" }}>{lessonData.title}</div>
          <div style={{ color: "#8b97a8", fontSize: "7px", marginTop: "1px", lineHeight: 1.3 }}>{lessonData.body}</div>
          <div style={{ color: "#7eb8c9", fontSize: "7px", marginTop: "1px" }}>{lessonData.formula}</div>
        </div>
      </Html>
    </group>
  );
}

/* ---------- 7. ThrottleIndicator ---------- */
export function ThrottleIndicator({
  thrust, boost, position,
}: {
  thrust: number; boost: boolean; position?: [number, number, number];
}) {
  const fillRef = useRef<THREE.Mesh>(null);
  const absThrust = Math.abs(thrust);
  const color = thrust > 0 ? (boost ? NOGO : GO) : WARN;
  const smoothT = useRef(0);

  useFrame((_, dt) => {
    smoothT.current += (absThrust - smoothT.current) * Math.min(1, 8 * dt);
    if (fillRef.current) {
      fillRef.current.scale.y = Math.max(0.001, smoothT.current);
      fillRef.current.position.y = -0.1 + smoothT.current * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* Track */}
      <mesh>
        <boxGeometry args={[0.025, 0.20, 0.008]} />
        <meshStandardMaterial color="#131820" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Fill */}
      <mesh ref={fillRef} position={[0, -0.1, 0.005]}>
        <boxGeometry args={[0.02, 0.20, 0.006]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>
      {/* Boost marker */}
      {boost && (
        <mesh position={[0.018, 0.1, 0.005]}>
          <boxGeometry args={[0.006, 0.04, 0.004]} />
          <meshStandardMaterial color={NOGO} emissive={NOGO} emissiveIntensity={0.6} />
        </mesh>
      )}
      <Html position={[0, -0.14, 0.01]} center distanceFactor={2}>
        <div style={{ textAlign: "center", fontFamily: "IBM Plex Mono, monospace" }}>
          <div style={{ color: thrust !== 0 ? (boost ? NOGO : GO) : "#8b97a8", fontSize: "9px", fontWeight: 600 }}>
            {thrust > 0 ? (boost ? "BOOST" : "BURN") : thrust < 0 ? "REVERSE" : "COAST"}
          </div>
          <div style={{ color: "#8b97a8", fontSize: "7px" }}>THROTTLE</div>
        </div>
      </Html>
    </group>
  );
}

/* ---------- 8. CockpitFrame ---------- */
export function CockpitFrame() {
  const accentStripRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (accentStripRef.current) {
      const t = state.clock.elapsedTime;
      const mat = accentStripRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.2 + Math.sin(t * 1.5) * 0.1;
    }
  });

  return (
    <group>
      {/* Keep the view clear; the dashboard is framed by slim edge details. */}
      {/* Top canopy accent strip */}
      <mesh ref={accentStripRef} position={[0, 0.05, -0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.015, 6, 48, Math.PI]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.2} />
      </mesh>
      {/* Bottom console lip */}
      <mesh position={[0, -0.75, -0.45]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[3.0, 0.15, 0.3]} />
        <meshStandardMaterial color="#131820" roughness={0.5} metalness={0.6} />
      </mesh>
      {/* Left console side panel */}
      <mesh position={[-1.2, -0.35, -0.35]} rotation={[0, 0.5, 0]}>
        <boxGeometry args={[0.6, 0.8, 0.05]} />
        <meshStandardMaterial color="#161c26" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* Right console side panel */}
      <mesh position={[1.2, -0.35, -0.35]} rotation={[0, -0.5, 0]}>
        <boxGeometry args={[0.6, 0.8, 0.05]} />
        <meshStandardMaterial color="#161c26" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* Top canopy frame */}
      <mesh position={[0, 0.35, -0.4]} rotation={[0.3, 0, 0]}>
        <torusGeometry args={[1.8, 0.02, 6, 32, Math.PI]} />
        <meshStandardMaterial color="#1a222e" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* ---------- 9. OrbitMap3D ---------- */
export function OrbitMap3D({
  pathPct, destination, simT, drifted, position,
}: {
  pathPct: number; destination: DestinationId; simT: number; drifted: boolean; position?: [number, number, number];
}) {
  const groupRef = useRef<THREE.Group>(null);
  const shipMarkerRef = useRef<THREE.Mesh>(null);
  const [topDown, setTopDown] = useState(false);

  const corridor = useMemo(
    () => transferPath(destination, simT, 48),
    [destination, simT]
  );

  const earthOrbitR = AU;
  const destOrbitR = destination === "mars" ? 102 : 16;

  // Scale down for mini-map
  const scale = 0.12 / Math.max(earthOrbitR, destOrbitR);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime;
      groupRef.current.rotation.y = topDown ? 0 : t * 0.08;
      if (topDown) groupRef.current.rotation.x = -Math.PI / 2;
      else groupRef.current.rotation.x = -0.3;
    }
    if (shipMarkerRef.current) {
      const t = state.clock.elapsedTime;
      const s = 1 + Math.sin(t * 3) * 0.15;
      shipMarkerRef.current.scale.setScalar(s);
    }
  });

  // Ship position along corridor
  const shipIdx = Math.min(corridor.length - 1, Math.max(0, Math.round(pathPct * (corridor.length - 1))));
  const shipPos = corridor[shipIdx] || corridor[0];

  // Vertex colors for corridor: green behind, amber ahead
  const corridorGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(corridor.length * 3);
    const colors = new Float32Array(corridor.length * 3);
    for (let i = 0; i < corridor.length; i++) {
      positions[i * 3] = corridor[i].x * scale;
      positions[i * 3 + 1] = corridor[i].y * scale;
      positions[i * 3 + 2] = corridor[i].z * scale;
      const pct = i / (corridor.length - 1);
      const behind = pct <= pathPct;
      colors[i * 3] = behind ? 0.43 : 0.79;     // r
      colors[i * 3 + 1] = behind ? 0.75 : 0.66; // g
      colors[i * 3 + 2] = behind ? 0.60 : 0.43; // b
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [corridor, scale, pathPct]);

  const ringGeo = useMemo(() => {
    const segs = 64;
    const positions = new Float32Array(segs * 3);
    for (let i = 0; i < segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      positions[i * 3] = Math.cos(a) * earthOrbitR * scale;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = Math.sin(a) * earthOrbitR * scale;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [earthOrbitR, scale]);

  const destRingGeo = useMemo(() => {
    const segs = 64;
    const positions = new Float32Array(segs * 3);
    for (let i = 0; i < segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      positions[i * 3] = Math.cos(a) * destOrbitR * scale;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = Math.sin(a) * destOrbitR * scale;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [destOrbitR, scale]);

  // Earth and dest current positions
  const cache = useMemo(() => new Map<string, V>(), []);
  const earthPos = posOf("earth", simT, cache);
  const destPos = posOf(destination, simT, cache);

  return (
    <group position={position}>
      {/* Transparent container sphere */}
      <mesh>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshBasicMaterial color="#0d1118" transparent opacity={0.3} side={THREE.BackSide} />
      </mesh>
      <group ref={groupRef}>
        {/* Sun */}
        <mesh>
          <sphereGeometry args={[0.012, 12, 12]} />
          <meshBasicMaterial color="#fff6d0" />
        </mesh>
        <pointLight position={[0, 0, 0]} color="#fff6d0" intensity={0.1} distance={0.3} />
        {/* Earth orbit ring */}
        <primitive object={new THREE.Line(ringGeo, new THREE.LineDashedMaterial({ color: 0x7eb8c9, dashSize: 0.01, gapSize: 0.006, transparent: true, opacity: 0.4 }))} />
        {/* Destination orbit ring */}
        <primitive object={new THREE.Line(destRingGeo, new THREE.LineDashedMaterial({ color: destination === "mars" ? 0xc4896a : 0xc5d4e3, dashSize: 0.01, gapSize: 0.006, transparent: true, opacity: 0.4 }))} />
        {/* Transfer corridor */}
        <primitive object={new THREE.Line(corridorGeo, new THREE.LineBasicMaterial({ vertexColors: true, linewidth: 2 }))} />
        {/* Earth marker */}
        <mesh position={[earthPos.x * scale, earthPos.y * scale, earthPos.z * scale]}>
          <sphereGeometry args={[0.008, 12, 12]} />
          <meshBasicMaterial color="#4a90d9" />
        </mesh>
        {/* Destination marker */}
        <mesh position={[destPos.x * scale, destPos.y * scale, destPos.z * scale]}>
          <sphereGeometry args={[0.008, 12, 12]} />
          <meshBasicMaterial color={destination === "mars" ? MARS_C : MOON_C} />
        </mesh>
        {/* Burn markers */}
        <mesh position={[corridor[0].x * scale, corridor[0].y * scale, corridor[0].z * scale]}>
          <octahedronGeometry args={[0.006]} />
          <meshBasicMaterial color={WARN} />
        </mesh>
        <mesh position={[corridor[corridor.length - 1].x * scale, corridor[corridor.length - 1].y * scale, corridor[corridor.length - 1].z * scale]}>
          <octahedronGeometry args={[0.006]} />
          <meshBasicMaterial color={WARN} />
        </mesh>
        {/* Ship position marker */}
        <mesh ref={shipMarkerRef} position={[shipPos.x * scale, shipPos.y * scale, shipPos.z * scale]}>
          <sphereGeometry args={[0.01, 12, 12]} />
          <meshBasicMaterial color={drifted ? NOGO : ACCENT} />
        </mesh>
        {/* Ship reticle ring */}
        <mesh position={[shipPos.x * scale, shipPos.y * scale, shipPos.z * scale]}>
          <torusGeometry args={[0.018, 0.001, 4, 16]} />
          <meshBasicMaterial color={drifted ? NOGO : ACCENT} transparent opacity={0.6} />
        </mesh>
      </group>
      {/* Click to toggle view */}
      <mesh onClick={() => setTopDown(!topDown)}>
        <sphereGeometry args={[0.17, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <Html position={[0, -0.22, 0.01]} center distanceFactor={2}>
        <div style={{ textAlign: "center", fontFamily: "IBM Plex Mono, monospace" }}>
          <div style={{ color: "#7eb8c9", fontSize: "7px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            ORBIT MAP · {topDown ? "TOP" : "3D"}
          </div>
        </div>
      </Html>
    </group>
  );
}

/* ---------- 10. CountdownDisplay ---------- */
export function CountdownDisplay({
  etaHours, metHours, totalHours, position,
}: {
  etaHours: number; metHours: number; totalHours: number; position?: [number, number, number];
}) {
  const pct = totalHours > 0 ? etaHours / totalHours : 0;
  const color = pct > 0.5 ? GO : pct > 0.25 ? WARN : NOGO;
  const nearArrival = pct < 0.12;
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (glowRef.current && nearArrival) {
      const t = state.clock.elapsedTime;
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.3 + Math.sin(t * 4) * 0.2;
    }
  });

  const days = Math.floor(etaHours / 24);
  const hours = Math.floor(etaHours % 24);
  const mins = Math.floor((etaHours % 1) * 60);
  const secs = Math.floor(((etaHours % 1) * 60 % 1) * 60);

  const metDays = Math.floor(metHours / 24);
  const metHoursRem = Math.floor(metHours % 24);
  const metMins = Math.floor((metHours % 1) * 60);

  return (
    <group position={position}>
      {/* Glow background */}
      <mesh ref={glowRef} position={[0, 0, -0.01]}>
        <planeGeometry args={[0.35, 0.12]} />
        <meshBasicMaterial color={color} transparent opacity={nearArrival ? 0.3 : 0.1} />
      </mesh>
      <Html position={[0, 0, 0.01]} center distanceFactor={1.2} transform>
        <div style={{
          textAlign: "center",
          fontFamily: "IBM Plex Mono, monospace",
          padding: "4px 12px",
        }}>
          <div style={{
            color: color,
            fontSize: "18px",
            fontWeight: 700,
            letterSpacing: "0.05em",
            textShadow: `0 0 8px ${color}88`,
            lineHeight: 1,
          }}>
            ETA {days}d {String(hours).padStart(2, "0")}:{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </div>
          <div style={{
            color: "#8b97a8",
            fontSize: "9px",
            marginTop: "3px",
            lineHeight: 1,
          }}>
            MET {metDays}d {String(metHoursRem).padStart(2, "0")}:{String(metMins).padStart(2, "0")}
          </div>
        </div>
      </Html>
    </group>
  );
}

/* ---------- 11. DistanceTracker ---------- */
export function DistanceTracker({
  travelledKm, remainKm, totalKm, vKms, distEarth, distTarget, destination, pathPct, position,
}: {
  travelledKm: number; remainKm: number; totalKm: number; vKms: number;
  distEarth: number; distTarget: number; destination: DestinationId; pathPct: number;
  position?: [number, number, number];
}) {
  const shipIconRef = useRef<THREE.Mesh>(null);
  const smoothPct = useRef(0);

  useFrame((_, dt) => {
    smoothPct.current += (pathPct - smoothPct.current) * Math.min(1, 3 * dt);
    if (shipIconRef.current) {
      shipIconRef.current.position.x = -0.08 + smoothPct.current * 0.16;
    }
  });

  const destColor = destination === "mars" ? MARS_C : MOON_C;

  return (
    <group position={position}>
      {/* Frame */}
      <mesh>
        <boxGeometry args={[0.20, 0.12, 0.01]} />
        <meshStandardMaterial color="#0d1118" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Track line */}
      <mesh position={[0, 0.02, 0.005]}>
        <boxGeometry args={[0.16, 0.006, 0.003]} />
        <meshStandardMaterial color="#1a222e" />
      </mesh>
      {/* Travelled portion (green) */}
      <mesh position={[-0.08 + pathPct * 0.08, 0.02, 0.006]}>
        <boxGeometry args={[Math.max(0.001, pathPct * 0.16), 0.005, 0.003]} />
        <meshStandardMaterial color={GO} emissive={GO} emissiveIntensity={0.3} />
      </mesh>
      {/* Ship icon */}
      <mesh ref={shipIconRef} position={[0, 0.02, 0.008]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.006, 0.014, 4]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.4} />
      </mesh>
      {/* Earth icon */}
      <mesh position={[-0.08, 0.02, 0.008]}>
        <sphereGeometry args={[0.007, 8, 8]} />
        <meshBasicMaterial color="#4a90d9" />
      </mesh>
      {/* Dest icon */}
      <mesh position={[0.08, 0.02, 0.008]}>
        <sphereGeometry args={[0.007, 8, 8]} />
        <meshBasicMaterial color={destColor} />
      </mesh>
      <Html position={[0, -0.02, 0.01]} center distanceFactor={1.8} transform>
        <div style={{
          width: "120px",
          textAlign: "center",
          fontFamily: "IBM Plex Mono, monospace",
          fontSize: "7px",
          lineHeight: 1.5,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: GO }}>{formatKm(travelledKm)}</span>
            <span style={{ color: WARN }}>{formatKm(remainKm)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#8b97a8" }}>
            <span>travelled</span>
            <span>remaining</span>
          </div>
          <div style={{ color: ACCENT, marginTop: "2px" }}>{vKms.toFixed(2)} km/s</div>
          <div style={{ color: "#4a90d9", marginTop: "1px" }}>Earth: {formatKm(distEarth)}</div>
          <div style={{ color: destColor }}>{destination === "mars" ? "Mars" : "Moon"}: {formatKm(distTarget)}</div>
        </div>
      </Html>
    </group>
  );
}

/* ---------- 12. OrbitalPhaseIndicator ---------- */
export function OrbitalPhaseIndicator({
  pathPct, destination, phase, position,
}: {
  pathPct: number; destination: DestinationId; phase: string; position?: [number, number, number];
}) {
  const segments = destination === "mars"
    ? [{ s: 0, e: 0.08, label: "Departure" }, { s: 0.08, e: 0.92, label: "Transfer" }, { s: 0.92, e: 1, label: "Capture" }]
    : [{ s: 0, e: 0.1, label: "TLI" }, { s: 0.1, e: 0.9, label: "Coast" }, { s: 0.9, e: 1, label: "LOI" }];

  return (
    <group position={position}>
      {segments.map((seg, i) => {
        const isActive = pathPct >= seg.s && pathPct < seg.e;
        const isDone = pathPct >= seg.e;
        const color = isActive ? ACCENT : isDone ? GO : "#2a3242";
        const startA = (seg.s - 0.5) * Math.PI * 1.5 + Math.PI / 2;
        const endA = (seg.e - 0.5) * Math.PI * 1.5 + Math.PI / 2;
        const midA = (startA + endA) / 2;
        const segLen = endA - startA;
        return (
          <mesh key={i} rotation={[0, 0, midA - Math.PI / 2]}>
            <torusGeometry args={[0.06, 0.008, 6, Math.max(4, Math.floor(segLen * 20))]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isActive ? 0.5 : 0.1} />
          </mesh>
        );
      })}
      <Html position={[0, -0.1, 0.01]} center distanceFactor={2}>
        <div style={{ textAlign: "center", fontFamily: "IBM Plex Mono, monospace" }}>
          <div style={{ color: ACCENT, fontSize: "7px", textTransform: "uppercase", letterSpacing: "0.1em" }}>{phase}</div>
          <div style={{ color: "#8b97a8", fontSize: "6px" }}>{Math.round(pathPct * 100)}%</div>
        </div>
      </Html>
    </group>
  );
}

/* ---------- 13. CockpitTogglePanel ---------- */
export function CockpitTogglePanel({
  position,
}: {
  position?: [number, number, number];
}) {
  const toggles = useGame((s) => s.cockpitToggles);
  const toggleCockpit = useGame((s) => s.toggleCockpit);

  const items: { id: string; label: string }[] = [
    { id: "orbitMap", label: "ORBIT" },
    { id: "countdown", label: "ETA" },
    { id: "distance", label: "DIST" },
    { id: "phase", label: "PHASE" },
    { id: "attitude", label: "ATT" },
    { id: "mfd", label: "MFD" },
    { id: "target", label: "TGT" },
    { id: "lesson", label: "LESSON" },
  ];

  return (
    <group position={position}>
      {/* Panel background */}
      <mesh>
        <boxGeometry args={[0.08, 0.32, 0.01]} />
        <meshStandardMaterial color="#0d1118" roughness={0.3} metalness={0.7} />
      </mesh>
      {items.map((item, i) => {
        const isOn = toggles[item.id] !== false;
        const y = 0.14 - i * 0.04;
        return (
          <group key={item.id} position={[0, y, 0.008]}>
            {/* Switch base */}
            <mesh>
              <boxGeometry args={[0.04, 0.025, 0.008]} />
              <meshStandardMaterial color="#131820" />
            </mesh>
            {/* Lever */}
            <mesh
              position={[isOn ? 0.008 : -0.008, 0, 0.006]}
              onClick={(e) => { e.stopPropagation(); toggleCockpit(item.id); }}
              onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }}
              onPointerOut={() => { document.body.style.cursor = "default"; }}
            >
              <boxGeometry args={[0.012, 0.02, 0.008]} />
              <meshStandardMaterial
                color={isOn ? GO : "#3a4252"}
                emissive={isOn ? GO : "#000"}
                emissiveIntensity={isOn ? 0.3 : 0}
              />
            </mesh>
            <Html position={[0.035, 0, 0.005]} distanceFactor={2}>
              <div style={{
                color: isOn ? ACCENT : "#8b97a8",
                fontSize: "6px",
                fontFamily: "IBM Plex Mono, monospace",
                whiteSpace: "nowrap",
              }}>
                {item.label}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

/* ---------- 14. CockpitDashboard (assembles everything) ---------- */
export function CockpitDashboard({
  hud, destination, simT, shipQuat,
}: {
  hud: HudSnap; destination: DestinationId; simT: number; shipQuat: { x: number; y: number; z: number; w: number };
}) {
  const cockpitRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const toggles = useGame((s) => s.cockpitToggles);
  const totalHours = TRANSFER[destination].hours;

  // Extract pitch and roll from quaternion for attitude indicator
  const euler = useMemo(() => {
    const q = shipQuat;
    const sinr_cosp = 2 * (q.w * q.x + q.y * q.z);
    const cosr_cosp = 1 - 2 * (q.x * q.x + q.y * q.y);
    const roll = Math.atan2(sinr_cosp, cosr_cosp);
    const sinp = 2 * (q.w * q.y - q.z * q.x);
    const pitch = Math.abs(sinp) >= 1 ? (sinp > 0 ? Math.PI / 2 : -Math.PI / 2) : Math.asin(sinp);
    return { pitch, roll };
  }, [shipQuat]);

  useFrame(() => {
    if (cockpitRef.current) {
      cockpitRef.current.position.copy(camera.position);
      cockpitRef.current.quaternion.copy(camera.quaternion);
    }
  });

  return (
    <group ref={cockpitRef}>
      <CockpitFrame />

      {/* Cockpit interior lights */}
      <ambientLight intensity={0.15} color="#3a3020" />
      <pointLight position={[0, 0.2, -0.3]} intensity={0.3} color="#3a3020" distance={2.0} />
      <pointLight position={[0, -0.1, -0.4]} intensity={0.2} color="#7eb8c9" distance={1.5} />

      {/* Warning light when off-corridor */}
      {hud.drifted && (
        <pointLight position={[0, 0.15, -0.3]} intensity={0.5} color={NOGO} distance={1.5} />
      )}

      {/* Instruments — only render if toggled on */}
      {toggles.countdown !== false && (
        <CountdownDisplay
          etaHours={hud.etaHours}
          metHours={hud.metHours}
          totalHours={totalHours}
          position={[0, 0.15, -0.5]}
        />
      )}

      {toggles.orbitMap !== false && (
        <OrbitMap3D
          pathPct={hud.pathPct}
          destination={destination}
          simT={simT}
          drifted={hud.drifted}
          position={[0, -0.05, -0.5]}
        />
      )}

      {toggles.distance !== false && (
        <DistanceTracker
          travelledKm={hud.travelledKm}
          remainKm={hud.remainKm}
          totalKm={TRANSFER[destination].km}
          vKms={hud.vKms}
          distEarth={hud.distEarth}
          distTarget={hud.distTarget}
          destination={destination}
          pathPct={hud.pathPct}
          position={[0, -0.28, -0.48]}
        />
      )}

      {toggles.phase !== false && (
        <OrbitalPhaseIndicator
          pathPct={hud.pathPct}
          destination={destination}
          phase={hud.phase}
          position={[0.12, -0.28, -0.48]}
        />
      )}

      {/* Left side instruments */}
      {toggles.attitude !== false && (
        <AttitudeIndicator
          pitch={euler.pitch}
          roll={euler.roll}
          position={[-0.4, -0.05, -0.5]}
        />
      )}

      <RadialGauge
        value={hud.speed}
        min={0}
        max={30}
        label="VEL"
        unit=" u/s"
        zones={[{ from: 0, to: 20, color: GO }, { from: 20, to: 25, color: WARN }, { from: 25, to: 30, color: NOGO }]}
        position={[-0.4, -0.25, -0.5]}
      />

      {/* Right side instruments */}
      {toggles.mfd !== false && (
        <NavMFD
          hud={hud}
          destination={destination}
          position={[0.4, -0.05, -0.5]}
        />
      )}

      {toggles.target !== false && (
        <TargetInfoPanel
          target={hud.target}
          position={[0.4, -0.28, -0.5]}
        />
      )}

      {/* Throttle (bottom left) */}
      <ThrottleIndicator
        thrust={hud.thrust}
        boost={hud.boost}
        position={[-0.25, -0.35, -0.45]}
      />

      {/* Phase bar (bottom right) */}
      {toggles.lesson !== false && (
        <PhaseBar
          pathPct={hud.pathPct}
          phase={hud.phase}
          lesson={hud.lesson}
          destination={destination}
          position={[0.15, -0.35, -0.45]}
        />
      )}

      {/* Toggle panel (left edge) */}
      <CockpitTogglePanel position={[-0.6, -0.1, -0.4]} />
    </group>
  );
}

/* ---------- Export types for use by CockpitScene ---------- */
export type { HudSnap };
