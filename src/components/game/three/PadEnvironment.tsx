import { useMemo } from "react";
import * as THREE from "three";

interface PadEnvironmentProps {
  gantryOpen: boolean;
  delugeActive: boolean;
  windKnots?: number;
}

/** Launch complex: mount, trench, tower, tanks, deluge, roads. Procedural geometry. */
export function PadEnvironment({ gantryOpen, delugeActive, windKnots = 8 }: PadEnvironmentProps) {
  const concrete = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#4a5568", roughness: 0.85, metalness: 0.05 }),
    [],
  );
  const steel = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#6b7a8d", metalness: 0.6, roughness: 0.4 }),
    [],
  );
  const dark = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#1a222e", metalness: 0.3, roughness: 0.6 }),
    [],
  );
  const tankMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#c5d0dc", metalness: 0.5, roughness: 0.3 }),
    [],
  );
  const soil = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#3d4a3a", roughness: 1 }),
    [],
  );
  const road = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#2a3038", roughness: 0.9 }),
    [],
  );

  const gantryAngle = gantryOpen ? -0.55 : 0;

  return (
    <group>
      {/* Distant terrain disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} material={soil} receiveShadow>
        <circleGeometry args={[180, 48]} />
      </mesh>
      {/* Pad apron */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} material={concrete} receiveShadow>
        <circleGeometry args={[18, 32]} />
      </mesh>
      {/* Flame trench */}
      <mesh position={[0, -0.8, 4]} material={dark}>
        <boxGeometry args={[6, 1.6, 14]} />
      </mesh>
      <mesh position={[0, -0.4, 10]} rotation={[0.35, 0, 0]} material={steel}>
        <boxGeometry args={[5.5, 0.3, 8]} />
      </mesh>
      {/* Launch mount */}
      <mesh position={[0, 0.4, 0]} material={steel}>
        <cylinderGeometry args={[1.4, 1.6, 0.8, 12]} />
      </mesh>
      <mesh position={[0, 0.85, 0]} material={dark}>
        <cylinderGeometry args={[0.9, 0.9, 0.25, 10]} />
      </mesh>
      {/* Hold-down posts */}
      {[-0.9, 0.9].map((x) =>
        [-0.9, 0.9].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.5, z]} material={steel}>
            <boxGeometry args={[0.2, 1.0, 0.2]} />
          </mesh>
        )),
      )}
      {/* Service tower */}
      <group position={[4.5, 0, 0]}>
        <mesh position={[0, 7, 0]} material={steel} castShadow>
          <boxGeometry args={[1.2, 14, 1.2]} />
        </mesh>
        {[2, 4, 6, 8, 10, 12].map((y) => (
          <mesh key={y} position={[0, y, 0]} material={dark}>
            <boxGeometry args={[1.5, 0.12, 1.5]} />
          </mesh>
        ))}
        {/* Crew access arm */}
        <group position={[0, 10, 0]} rotation={[0, 0, gantryAngle]}>
          <mesh position={[-2.2, 0, 0]} material={steel}>
            <boxGeometry args={[4.5, 0.25, 0.6]} />
          </mesh>
          <mesh position={[-4.4, -0.3, 0]} material={dark}>
            <boxGeometry args={[0.5, 0.8, 0.7]} />
          </mesh>
        </group>
      </group>
      {/* Lightning towers */}
      {[-14, 14].map((x) => (
        <group key={x} position={[x, 0, -6]}>
          <mesh position={[0, 12, 0]} material={steel}>
            <cylinderGeometry args={[0.12, 0.18, 24, 6]} />
          </mesh>
          <mesh position={[0, 24, 0]} material={dark}>
            <boxGeometry args={[1.2, 0.15, 0.15]} />
          </mesh>
        </group>
      ))}
      {/* LOX / CH4 tanks */}
      <mesh position={[-12, 3, 8]} material={tankMat} castShadow>
        <cylinderGeometry args={[2.2, 2.2, 6, 16]} />
      </mesh>
      <mesh position={[-12, 6.2, 8]} material={steel}>
        <sphereGeometry args={[2.2, 12, 8]} />
      </mesh>
      <mesh position={[-18, 2.5, 6]} material={tankMat} castShadow>
        <cylinderGeometry args={[1.8, 1.8, 5, 14]} />
      </mesh>
      {/* Cryo pipes */}
      <mesh position={[-6, 0.4, 4]} rotation={[0, 0, Math.PI / 2]} material={steel}>
        <cylinderGeometry args={[0.12, 0.12, 10, 6]} />
      </mesh>
      {/* Water deluge nozzles (visual) */}
      {delugeActive &&
        [-2, 0, 2].map((x) => (
          <mesh key={x} position={[x, 0.3, 2.5]} material={new THREE.MeshBasicMaterial({ color: "#a8c8e0", transparent: true, opacity: 0.35 })}>
            <coneGeometry args={[0.8, 2.5, 6]} />
          </mesh>
        ))}
      {/* Service road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[25, 0.03, 0]} material={road}>
        <planeGeometry args={[12, 80]} />
      </mesh>
      {/* Tech building */}
      <mesh position={[22, 2, -12]} material={concrete} castShadow>
        <boxGeometry args={[8, 4, 6]} />
      </mesh>
      {/* Windsock direction hint */}
      <mesh position={[8, 4, -8]} rotation={[0, (windKnots / 40) * 0.5, 0.3]} material={new THREE.MeshStandardMaterial({ color: "#c9a86f" })}>
        <coneGeometry args={[0.25, 1.2, 6]} />
      </mesh>
      {/* Floodlights */}
      {[
        [-10, 6, -10],
        [10, 6, -10],
        [-10, 6, 10],
      ].map(([x, y, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, y / 2, 0]} material={steel}>
            <cylinderGeometry args={[0.08, 0.1, y, 5]} />
          </mesh>
          <spotLight position={[0, y, 0]} angle={0.5} penumbra={0.4} intensity={1.2} distance={40} color="#e8edf4" castShadow={i === 0} />
        </group>
      ))}
    </group>
  );
}
