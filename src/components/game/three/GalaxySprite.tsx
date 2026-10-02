import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { GALAXIES, photoImage, photoOf, warmupPhotos, type DeepSkyObject } from "@/game/cosmos";
import { clearHoveredTarget, setHoveredTarget, toggleLockedTarget } from "./targetFocus";

interface GalaxySpriteProps {
  galaxy: DeepSkyObject;
  distance?: number;
  reduced?: boolean;
}

/** Single galaxy/nebula as a billboard sprite with radial gradient. */
function GalaxySprite({ galaxy, distance = 400, reduced = false }: GalaxySpriteProps) {
  const ref = useRef<THREE.Sprite>(null);
  const [hovered, setHovered] = useState(false);
  const [photo, setPhoto] = useState<HTMLImageElement | null>(() => galaxy.id === "andromeda" ? photoOf("andromeda") : null);

  useEffect(() => {
    if (galaxy.id !== "andromeda") return;
    warmupPhotos();
    const image = photoImage("andromeda");
    if (!image) return;
    const loaded = () => setPhoto(photoOf("andromeda"));
    const failed = () => setPhoto(null);
    if (image.complete) loaded();
    else {
      image.addEventListener("load", loaded);
      image.addEventListener("error", failed);
    }
    return () => {
      image.removeEventListener("load", loaded);
      image.removeEventListener("error", failed);
    };
  }, [galaxy.id]);

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
    if (photo) {
      // Photos are rectangular. Composite them into a soft alpha mask before
      // mapping onto the billboard so image edges never read as moving cards.
      const size = 256;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      const fit = Math.min(size / photo.width, size / photo.height);
      const width = photo.width * fit;
      const height = photo.height * fit;
      ctx.drawImage(photo, (size - width) / 2, (size - height) / 2, width, height);
      ctx.globalCompositeOperation = "destination-in";
      const mask = ctx.createRadialGradient(size / 2, size / 2, size * 0.08, size / 2, size / 2, size * 0.5);
      mask.addColorStop(0, "rgba(255,255,255,1)");
      mask.addColorStop(0.6, "rgba(255,255,255,0.88)");
      mask.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = mask;
      ctx.fillRect(0, 0, size, size);
      const tex = new THREE.CanvasTexture(canvas);
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
  }, [galaxy, photo]);

  const material = useMemo(
    () =>
      new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        toneMapped: false,
        blending: THREE.AdditiveBlending,
      }),
    [texture],
  );

  const scale = useMemo(() => {
    // Render catalog angular size against the deep-sky shell distance.
    const angularRad = ((galaxy.angularSize ?? 0.5) * Math.PI) / 180;
    return Math.min(180, Math.max(8, angularRad * distance));
  }, [galaxy, distance]);

  useFrame(({ clock }) => {
    if (ref.current && !reduced) {
      // Subtle rotation
      ref.current.rotation.z = clock.elapsedTime * 0.02;
    }
  });

  return (
    <sprite
      ref={ref}
      position={position}
      scale={[scale, scale * (galaxy.ry / galaxy.rx), 1]}
      onPointerOver={(event) => { event.stopPropagation(); setHovered(true); setHoveredTarget(galaxy.id); document.body.style.cursor = "help"; }}
      onPointerOut={() => { setHovered(false); clearHoveredTarget(galaxy.id); document.body.style.cursor = "auto"; }}
      onClick={(event) => { event.stopPropagation(); toggleLockedTarget(galaxy.id); }}
    >
      <primitive object={material} attach="material" />
      {hovered && (
        <Html center position={[0, scale * 0.65, 0]} distanceFactor={24} style={{ pointerEvents: "none" }}>
          <div className="w-60 rounded-lg border border-cyan-200/30 bg-slate-950/95 p-3 text-slate-100 shadow-xl backdrop-blur">
            <div className="font-semibold">{galaxy.name}</div>
            <div className="mt-1 font-mono text-[11px] text-cyan-200">{galaxy.type.replaceAll("-", " ")} · {galaxy.dist}</div>
            <div className="mt-2 text-xs text-slate-300">{galaxy.blurb}</div>
            <div className="mt-1 text-[11px] text-slate-400">{galaxy.fact}</div>
          </div>
        </Html>
      )}
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
