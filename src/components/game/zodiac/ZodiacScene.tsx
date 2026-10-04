import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Html } from "@react-three/drei";
import * as THREE from "three";
import { ZODIAC_SIGNS, type ZodiacSign } from "@/game/astro-core/zodiacSigns";
import type { Chart } from "@/game/astro-core/chart";
import { degToRad } from "@/game/astro-core/time";

const R = 28;

function lambdaToPos(lambdaDeg: number, radius = R): THREE.Vector3 {
  // ecliptic plane: λ from +X toward +Z (simple heliocentric classroom mapping)
  const λ = degToRad(lambdaDeg);
  return new THREE.Vector3(Math.cos(λ) * radius, 0, Math.sin(λ) * radius);
}

function ZodiacBand({
  onSelect,
  selected,
  precessionDeg,
}: {
  onSelect: (s: ZodiacSign) => void;
  selected: number | null;
  precessionDeg: number;
}) {
  return (
    <group>
      {ZODIAC_SIGNS.map((sign) => {
        const mid = (sign.startDeg + sign.endDeg) / 2;
        const p0 = lambdaToPos(sign.startDeg);
        const p1 = lambdaToPos(sign.endDeg);
        const midP = lambdaToPos(mid);
        const hot = selected === sign.index;
        const pts: THREE.Vector3[] = [];
        for (let i = 0; i <= 16; i++) {
          const λ = sign.startDeg + (i / 16) * 30;
          pts.push(lambdaToPos(λ));
        }
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        return (
          <group key={sign.index}>
            <primitive
              object={
                new THREE.Line(
                  geo,
                  new THREE.LineBasicMaterial({
                    color: hot ? 0xf0d78c : new THREE.Color(sign.color).getHex(),
                    transparent: true,
                    opacity: hot ? 0.95 : 0.45,
                  }),
                )
              }
            />
            {/* clickable sector marker */}
            <mesh
              position={midP}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(sign);
              }}
              onPointerOver={() => {
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                document.body.style.cursor = "auto";
              }}
            >
              <sphereGeometry args={[hot ? 1.1 : 0.75, 12, 12]} />
              <meshBasicMaterial color={sign.color} transparent opacity={hot ? 1 : 0.75} />
            </mesh>
            <Html position={[midP.x * 1.08, 1.2, midP.z * 1.08]} center distanceFactor={40}>
              <button
                type="button"
                className={`whitespace-nowrap rounded border px-1.5 py-0.5 font-mono text-[9px] ${
                  hot ? "border-amber-300/50 bg-slate-950/90 text-amber-100" : "border-white/20 bg-slate-950/70 text-slate-200"
                }`}
                onClick={() => onSelect(sign)}
              >
                {sign.symbol} {sign.name}
              </button>
            </Html>
                      </group>
        );
      })}
      {/* constellation drift marker */}
      <mesh position={lambdaToPos(precessionDeg)}>
        <boxGeometry args={[0.4, 2.2, 0.4]} />
        <meshBasicMaterial color="#7eb8c9" />
      </mesh>
      <Html position={lambdaToPos(precessionDeg).add(new THREE.Vector3(0, 2.5, 0)).toArray()} center distanceFactor={48}>
        <span className="rounded bg-slate-950/80 px-1.5 py-0.5 font-mono text-[8px] text-cyan-200">
          [GEOMETRY] constellation drift ~{precessionDeg.toFixed(1)}°
        </span>
      </Html>
    </group>
  );
}

function PlanetMarkers({ chart }: { chart: Chart | null }) {
  if (!chart) return null;
  return (
    <group>
      {chart.positions.map((b) => {
        const p = lambdaToPos(b.lambda, R * 0.82);
        return (
          <group key={b.id} position={p}>
            <mesh>
              <sphereGeometry args={[b.id === "sun" ? 1.2 : b.id === "moon" ? 0.7 : 0.45, 12, 12]} />
              <meshStandardMaterial
                color={b.id === "sun" ? "#fff4d0" : b.id === "moon" ? "#c5d0dc" : "#7eb8c9"}
                emissive={b.id === "sun" ? "#e8c070" : "#000000"}
                emissiveIntensity={b.id === "sun" ? 0.6 : 0}
              />
            </mesh>
            <Html distanceFactor={36} position={[0, 1.1, 0]} center>
              <span className="rounded bg-black/70 px-1 font-mono text-[8px] text-slate-100">
                {b.name} {b.lambda.toFixed(1)}°
              </span>
            </Html>
          </group>
        );
      })}
      {/* ASC marker */}
      <mesh position={lambdaToPos(chart.ascendant, R * 0.7)}>
        <coneGeometry args={[0.5, 1.2, 8]} />
        <meshBasicMaterial color="#e8c070" />
      </mesh>
    </group>
  );
}

function AspectWeb({ chart }: { chart: Chart | null }) {
  if (!chart) return null;
  const byName = new Map(chart.positions.map((p) => [p.name, p]));
  return (
    <group>
      {chart.aspects.slice(0, 12).map((a, i) => {
        const A = byName.get(a.a);
        const B = byName.get(a.b);
        if (!A || !B) return null;
        const p0 = lambdaToPos(A.lambda, R * 0.82);
        const p1 = lambdaToPos(B.lambda, R * 0.82);
        const geo = new THREE.BufferGeometry().setFromPoints([p0, p1]);
        const color =
          a.type === "trine" || a.type === "sextile"
            ? 0x6fbf9a
            : a.type === "square" || a.type === "opposition"
              ? 0xe85d4c
              : 0x7eb8c9;
        return (
          <primitive
            key={i}
            object={
              new THREE.Line(
                geo,
                new THREE.LineBasicMaterial({
                  color,
                  transparent: true,
                  opacity: 0.25 + a.strength * 0.5,
                }),
              )
            }
          />
        );
      })}
    </group>
  );
}

function SceneInner({
  onSelect,
  selected,
  chart,
}: {
  onSelect: (s: ZodiacSign) => void;
  selected: number | null;
  chart: Chart | null;
}) {
  const precession = chart?.precessionOffsetDeg ?? 24.5;
  return (
    <>
      <color attach="background" args={["#05070c"]} />
      <ambientLight intensity={0.35} />
      <pointLight position={[0, 8, 0]} intensity={1.2} color="#fff4d0" />
      <Stars radius={120} depth={50} count={4000} factor={3} saturation={0} fade speed={0.4} />
      {/* ecliptic plane hint */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[R - 0.15, R + 0.15, 64]} />
        <meshBasicMaterial color="#7eb8c9" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.4, 24, 24]} />
        <meshStandardMaterial color="#fff4d0" emissive="#e8c070" emissiveIntensity={0.8} />
      </mesh>
      <ZodiacBand onSelect={onSelect} selected={selected} precessionDeg={precession} />
      <PlanetMarkers chart={chart} />
      <AspectWeb chart={chart} />
      <OrbitControls enablePan maxDistance={90} minDistance={12} />
    </>
  );
}

export function ZodiacScene({
  onSelectSign,
  selectedIndex,
  chart,
}: {
  onSelectSign: (s: ZodiacSign) => void;
  selectedIndex: number | null;
  chart: Chart | null;
}) {
  return (
    <div className="h-[min(58dvh,420px)] w-full overflow-hidden rounded-xl border border-border bg-black">
      <Canvas camera={{ position: [0, 22, 42], fov: 42 }}>
        <SceneInner onSelect={onSelectSign} selected={selectedIndex} chart={chart} />
      </Canvas>
    </div>
  );
}
