import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface CelestialHoverProps {
  position?: [number, number, number];
  children: React.ReactNode;
  name: string;
  blurb: string;
  fact: string;
  dist: string;
  kind: string;
  metadata?: { label: string; value: string }[];
  distanceFactor?: number;
}

/** Reusable hover tooltip wrapper for any 3D object.
 *  Shows a floating info panel on pointer enter, with a highlight ring. */
export function CelestialHover({
  position = [0, 0, 0],
  children,
  name,
  blurb,
  fact,
  dist,
  kind,
  metadata = [],
  distanceFactor = 10,
}: CelestialHoverProps) {
  const [hovered, setHovered] = useState(false);
  const ring = useRef<THREE.Mesh>(null);
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (ring.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 2.5) * 0.1;
      ring.current.scale.setScalar(s);
    }
  });

  return (
    <group
      ref={group}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "help";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      {children}

      {/* Pulsing highlight ring */}
      {hovered && (
        <mesh ref={ring}>
          <sphereGeometry args={[1.0, 16, 16]} />
          <meshBasicMaterial
            color="#7EB8C9"
            transparent
            opacity={0.12}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Info tooltip */}
      {hovered && (
        <Html
          distanceFactor={distanceFactor}
          position={[0, 0.8, 0]}
          center
          style={{ pointerEvents: "none" }}
        >
          <div
            className="w-60 rounded-lg border border-border bg-surface/95 px-4 py-3 shadow-xl backdrop-blur-md"
            style={{ borderColor: "rgba(126,184,201,0.4)" }}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-display text-sm font-semibold text-fg">{name}</p>
              <span className="rounded-sm bg-raised px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-accent">
                {kind}
              </span>
            </div>
            <p className="mt-1 font-mono text-[11px] text-accent">{dist}</p>
            <p className="mt-1.5 text-xs leading-snug text-fg/90">{blurb}</p>
            <p className="mt-2 text-[11px] leading-relaxed text-muted">{fact}</p>
            {metadata.length > 0 && (
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 border-t border-border pt-2 font-mono text-[10px]">
                {metadata.map((m) => (
                  <div key={m.label} className="contents">
                    <dt className="text-muted">{m.label}</dt>
                    <dd className="text-right text-fg">{m.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

/** Simpler hotspot marker for surface objects — a pulsing sphere + ring. */
export function SurfaceHotspot({
  position,
  label,
  fact,
  color = "#7EB8C9",
}: {
  position: [number, number, number];
  label: string;
  fact: string;
  color?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const ring = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ring.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 3) * 0.12;
      ring.current.scale.setScalar(s);
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={ring}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "help";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial
          color={hovered ? "#E8EDF4" : color}
          transparent
          opacity={0.9}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.16, 0.2, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.45}
          side={THREE.DoubleSide}
        />
      </mesh>
      {hovered && (
        <Html distanceFactor={8} position={[0, 0.35, 0]} center style={{ pointerEvents: "none" }}>
          <div className="w-56 rounded-md border border-border bg-surface/95 px-3 py-2 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-1.5 text-xs font-medium text-accent">
              {label}
            </div>
            <p className="mt-1 text-[11px] leading-snug text-fg">{fact}</p>
          </div>
        </Html>
      )}
    </group>
  );
}
