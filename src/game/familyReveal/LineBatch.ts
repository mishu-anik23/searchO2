/**
 * LineBatch: Single LineSegments batched renderer for ghost asterisms,
 * active asterisms, and inter-constellation family bonds.
 * Zero per-frame allocations (FR3, FR5 & Performance).
 */

import * as THREE from "three";
import { type ConstellationGraphNode } from "./FamilyGraph";
import { DEFAULT_FAMILY_CONFIG, type FamilyRevealConfig } from "./config";

export interface LineBatchVertexData {
  positions: Float32Array;
  colors: Float32Array;
  progresses: Float32Array;
}

export class LineBatch {
  public geometry: THREE.BufferGeometry;
  public material: THREE.ShaderMaterial;
  public lineMesh: THREE.LineSegments;
  private config: FamilyRevealConfig;

  constructor(config: FamilyRevealConfig = DEFAULT_FAMILY_CONFIG) {
    this.config = config;
    this.geometry = new THREE.BufferGeometry();

    // Custom shader material with draw-on progress and additive glow
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uGlobalProgress: { value: 1.0 },
        uFamilyColor: { value: new THREE.Color(0x00e5ff) },
        uGhostAlpha: { value: 0.18 },
        uActiveAlpha: { value: 0.95 },
      },
      vertexShader: `
        attribute vec3 aColor;
        attribute float aProgress;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float uGlobalProgress;
        uniform float uGhostAlpha;
        uniform float uActiveAlpha;

        void main() {
          vColor = aColor;
          // Animate draw-on effect
          float visible = step(0.01, aProgress);
          vAlpha = mix(uGhostAlpha, uActiveAlpha, aProgress);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          if (vAlpha <= 0.01) discard;
          gl_FragColor = vec4(vColor, vAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.lineMesh = new THREE.LineSegments(this.geometry, this.material);
    this.lineMesh.frustumCulled = false;
  }

  /**
   * Updates buffer geometry with all family lines in a single allocation-free call.
   */
  public rebuildGeometry(
    nodes: ConstellationGraphNode[],
    activeSet: Set<string>,
    interEdges: [string, string][],
    nodeMap: Map<string, ConstellationGraphNode>,
    familyColorHex: number,
    radius: number
  ): void {
    const familyColor = new THREE.Color(familyColorHex);
    const ghostColor = new THREE.Color(familyColorHex).multiplyScalar(0.4);
    const bondColor = new THREE.Color(0xffffff);

    // Count total segments
    let segmentCount = 0;
    for (const node of nodes) {
      segmentCount += node.asterismEdges.length;
    }
    segmentCount += interEdges.length;

    const totalVerts = segmentCount * 2;
    const posArr = new Float32Array(totalVerts * 3);
    const colArr = new Float32Array(totalVerts * 3);
    const progArr = new Float32Array(totalVerts);

    let vIdx = 0;

    // 1. Constellation Asterisms (Ghost or Active)
    for (const node of nodes) {
      const isActive = activeSet.has(node.id);
      const c = isActive ? familyColor : ghostColor;
      const prog = isActive ? 1.0 : 0.0;

      for (const edge of node.asterismEdges) {
        const stA = node.starPositions[edge[0]];
        const stB = node.starPositions[edge[1]];
        if (!stA || !stB) continue;

        // Vertex 1
        posArr[vIdx * 3] = stA.x * radius;
        posArr[vIdx * 3 + 1] = stA.y * radius;
        posArr[vIdx * 3 + 2] = stA.z * radius;
        colArr[vIdx * 3] = c.r; colArr[vIdx * 3 + 1] = c.g; colArr[vIdx * 3 + 2] = c.b;
        progArr[vIdx] = prog;
        vIdx++;

        // Vertex 2
        posArr[vIdx * 3] = stB.x * radius;
        posArr[vIdx * 3 + 1] = stB.y * radius;
        posArr[vIdx * 3 + 2] = stB.z * radius;
        colArr[vIdx * 3] = c.r; colArr[vIdx * 3 + 1] = c.g; colArr[vIdx * 3 + 2] = c.b;
        progArr[vIdx] = prog;
        vIdx++;
      }
    }

    // 2. Inter-Constellation Family Bonds (Active to Active)
    for (const [idA, idB] of interEdges) {
      const nA = nodeMap.get(idA);
      const nB = nodeMap.get(idB);
      if (!nA || !nB) continue;

      // Vertex 1 (Centroid A)
      posArr[vIdx * 3] = nA.centroid.x * radius;
      posArr[vIdx * 3 + 1] = nA.centroid.y * radius;
      posArr[vIdx * 3 + 2] = nA.centroid.z * radius;
      colArr[vIdx * 3] = bondColor.r; colArr[vIdx * 3 + 1] = bondColor.g; colArr[vIdx * 3 + 2] = bondColor.b;
      progArr[vIdx] = 1.0;
      vIdx++;

      // Vertex 2 (Centroid B)
      posArr[vIdx * 3] = nB.centroid.x * radius;
      posArr[vIdx * 3 + 1] = nB.centroid.y * radius;
      posArr[vIdx * 3 + 2] = nB.centroid.z * radius;
      colArr[vIdx * 3] = bondColor.r; colArr[vIdx * 3 + 1] = bondColor.g; colArr[vIdx * 3 + 2] = bondColor.b;
      progArr[vIdx] = 1.0;
      vIdx++;
    }

    // Upload to GPU buffer
    this.geometry.setAttribute("position", new THREE.BufferAttribute(posArr.subarray(0, vIdx * 3), 3));
    this.geometry.setAttribute("aColor", new THREE.BufferAttribute(colArr.subarray(0, vIdx * 3), 3));
    this.geometry.setAttribute("aProgress", new THREE.BufferAttribute(progArr.subarray(0, vIdx), 1));
    this.geometry.computeBoundingSphere();
  }

  public updateTime(time: number): void {
    this.material.uniforms.uTime.value = time;
  }

  public dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}
