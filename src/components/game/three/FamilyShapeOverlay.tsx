import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  globalFamilyRevealController,
  type FamilyRevealState,
} from "@/game/familyReveal/FamilyRevealController";
import { LineBatch } from "@/game/familyReveal/LineBatch";

interface FamilyShapeOverlayProps {
  radius?: number;
}

export function FamilyShapeOverlay({ radius = 2340 }: FamilyShapeOverlayProps) {
  const [state, setState] = useState<FamilyRevealState>(
    globalFamilyRevealController.getState()
  );

  const lineBatchRef = useRef<LineBatch | null>(null);
  const linesGroupRef = useRef<THREE.Group>(null);
  const hullMeshRef = useRef<THREE.Mesh>(null);
  const haloInstancedRef = useRef<THREE.InstancedMesh>(null);

  // Initialize LineBatch
  useEffect(() => {
    const lb = new LineBatch();
    lineBatchRef.current = lb;
    if (linesGroupRef.current) {
      linesGroupRef.current.add(lb.lineMesh);
    }

    // Subscribe to state updates
    const unsub = globalFamilyRevealController.subscribe((newState) => {
      setState(newState);
    });

    return () => {
      unsub();
      if (linesGroupRef.current && lb.lineMesh) {
        linesGroupRef.current.remove(lb.lineMesh);
      }
      lb.dispose();
    };
  }, []);

  // Update LineBatch geometry when active family or active member set changes
  useEffect(() => {
    const lb = lineBatchRef.current;
    if (!lb || !state.activeFamilyId) {
      if (lb) {
        lb.geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(0), 3));
      }
      return;
    }

    const fam = globalFamilyRevealController.graph.families.get(state.activeFamilyId);
    if (!fam) return;

    const memberNodes = fam.memberIds
      .map((id) => globalFamilyRevealController.graph.nodes.get(id))
      .filter(Boolean) as any[];

    lb.rebuildGeometry(
      memberNodes,
      state.activeMemberSet,
      state.activeEdges,
      globalFamilyRevealController.graph.nodes,
      state.familyColorHex,
      radius
    );
  }, [state.activeFamilyId, state.activeMemberSet, state.activeEdges, state.familyColorHex, radius]);

  // Spherical Hull Mesh Geometry and Shader Material
  const hullGeometry = useMemo(() => {
    if (!state.hullReady || !state.hullData) {
      return new THREE.BufferGeometry();
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(state.hullData.positions, 3));
    geom.setAttribute("normal", new THREE.BufferAttribute(state.hullData.normals, 3));
    geom.setAttribute("aRevealTime", new THREE.BufferAttribute(state.hullData.revealTimes, 1));
    geom.setIndex(new THREE.BufferAttribute(state.hullData.indices, 1));
    geom.computeBoundingSphere();
    return geom;
  }, [state.hullReady, state.hullData]);

  const hullMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(state.familyColorHex) },
        uTime: { value: 0 },
        uProgress: { value: 1.0 },
      },
      vertexShader: `
        attribute float aRevealTime;
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        varying float vReveal;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vReveal = aRevealTime;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uTime;
        uniform float uProgress;
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        varying float vReveal;

        void main() {
          vec3 viewDir = normalize(cameraPosition - vWorldPos);
          // Fresnel rim effect
          float fresnel = 1.0 - abs(dot(vNormal, viewDir));
          fresnel = pow(fresnel, 2.2);

          // Subtle animated shimmer
          float shimmer = 0.5 + 0.5 * sin(uTime * 2.0 + vReveal * 6.28);
          float alpha = (fresnel * 0.45 + 0.12 * shimmer) * uProgress;

          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, [state.familyColorHex]);

  // Active Star Halos (Pooled Sprite Instances)
  useEffect(() => {
    const mesh = haloInstancedRef.current;
    if (!mesh) return;

    if (!state.activeFamilyId || state.activeMemberSet.size === 0) {
      mesh.count = 0;
      return;
    }

    // Collect all active star positions
    const activeStars: THREE.Vector3[] = [];
    const dummy = new THREE.Object3D();

    for (const memId of state.activeMemberSet) {
      const node = globalFamilyRevealController.graph.nodes.get(memId);
      if (!node) continue;
      for (const st of node.starPositions) {
        activeStars.push(new THREE.Vector3(st.x * radius, st.y * radius, st.z * radius));
      }
    }

    mesh.count = Math.min(activeStars.length, 300);
    for (let i = 0; i < mesh.count; i++) {
      dummy.position.copy(activeStars[i]);
      const s = 12.0;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [state.activeFamilyId, state.activeMemberSet, radius]);

  // Frame Loop for Zero-Allocation Uniform Time Updates
  useFrame((_, delta) => {
    if (lineBatchRef.current) {
      lineBatchRef.current.updateTime(performance.now() * 0.001);
    }
    if (hullMeshRef.current && hullMaterial) {
      hullMaterial.uniforms.uTime.value += delta;
    }
  });

  return (
    <group>
      {/* Batched Line Segments Group */}
      <group ref={linesGroupRef} />

      {/* Spherical Family Hull Mesh Patch */}
      {state.hullReady && state.hullData && (
        <mesh ref={hullMeshRef} geometry={hullGeometry} material={hullMaterial} />
      )}

      {/* Highlighted Member Star Halos (InstancedMesh) */}
      <instancedMesh
        ref={haloInstancedRef}
        args={[undefined, undefined, 300]}
        frustumCulled={false}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          color={state.familyColorHex}
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </instancedMesh>
    </group>
  );
}
