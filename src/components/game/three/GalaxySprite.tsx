import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GALAXIES, photoOf, type DeepSkyObject } from "@/game/cosmos";

interface GalaxySpriteProps {
  galaxy: DeepSkyObject;
  distance?: number;
  reduced?: boolean;
}

/** Single galaxy/nebula as a billboard sprite with radial gradient. */
function GalaxySprite({ galaxy, distance = 400, reduced = false }: GalaxySpriteProps) {
  const ref = useRef<THREE.Mesh>(null);

  // Position from direction vector
  const position = useMemo(() => {
    const len = Math.hypot(galaxy.dir.x, galaxy.dir.y, galaxy.dir.z) || 1;
    return [
      (galaxy.dir.x / len) * distance,
      (galaxy.dir.y / len) * distance,
      (galaxy.dir.z / len) * distance,
    ] as [number, number, number];
  }, [galaxy.dir, distance]);

  // Texture: use photo if available (Andromeda), else procedural canvas
  const texture = useMemo(() => {
    const photo = galaxy.id === "andromeda" ? photoOf("andromeda") : null;
    if (photo) {
      const tex = new THREE.Texture(photo);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      return tex;
    }

    // Procedural spiral/glow
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    // Parse galaxy color
    const c = new THREE.Color(galaxy.color);
    const r = Math.round(c.r * 255);
    const g = Math.round(c.g * 255);
    const b = Math.round(c.b * 255);

    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, `rgba(255,236,210,0.7)`);
    grad.addColorStop(0.15, `rgba(${r},${g},${b},0.5)`);
    grad.addColorStop(0.4, `rgba(${r},${g},${b},0.2)`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Add some spiral arm dots for galaxies
    if (galaxy.type === "galaxy") {
      ctx.fillStyle = `rgba(255,220,180,0.4)`;
      for (let i = 0; i < 40; i++) {
        const a = i * 2.4;
        const rad = (i / 40) * (size / 2) * 0.7;
        const px = size / 2 + Math.cos(a) * rad;
        const py = size / 2 + Math.sin(a) * rad * (galaxy.ry / galaxy.rx);
        ctx.fillRect(px, py, 1.5, 1.5);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [galaxy]);

  const material = useMemo(
    () =>
      new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
      }),
    [texture],
  );

  const scale = useMemo(() => {
    const base = galaxy.type === "galaxy" ? 30 : 18;
    return Math.max(8, base * galaxy.rx);
  }, [galaxy]);

  useFrame(({ clock }) => {
    if (ref.current && !reduced) {
      // Subtle rotation
      ref.current.rotation.z = clock.elapsedTime * 0.02;
    }
  });

  return (
    <sprite ref={ref} position={position} scale={[scale, scale * (galaxy.ry / galaxy.rx), 1]}>
      <primitive object={material} attach="material" />
    </sprite>
  );
}

/** All galaxies/nebulae from the GALAXIES array as billboard sprites. */
export function GalaxySprites({ distance = 400, reduced = false, visible = true }: { distance?: number; reduced?: boolean; visible?: boolean }) {
  if (!visible) return null;
  return (
    <group>
      {GALAXIES.map((g) => (
        <GalaxySprite key={g.id} galaxy={g} distance={distance} reduced={reduced} />
      ))}
    </group>
  );
}
