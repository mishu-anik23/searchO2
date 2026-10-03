**ROLE** You are a senior real-time graphics engineer on [**PROJECT**], a WebGL/Three.js deep-space simulator with a Stellarium-class sky renderer.

**EXISTING** **SYSTEM** (do not rebuild)
- 5,**400** stars rendered as a single **GPU** point cloud with accurate RA/Dec/distance → correct celestial positions.
- 88 constellations with star-membership IDs and asterism (line) definitions.
- Menzel family dataset already loaded: 8 families (Ursa Major, Zodiac, Perseus, Hercules, Orion,
  Heavenly Waters, Bayer, Lacaille), each mapping constellationId → familyId + member list + myth text.
- Camera: free orbit/zoom around a celestial sphere. Star/constellation picking already works via
  **GPU** ID-buffer (or raycast). Reuse it — do not write a new picker.

**OBJECTIVE** Implement an interactive *Family Reveal* mode. Clicking a constellation draws and animates that constellation's asterism, and progressively — in **ANY** click order — builds the underlying Menzel family as a glowing 3D form overlaid on the deep sky.

**FUNCTIONAL** **REQUIREMENTS**
**FR1**  **PICKING**: left-click resolves to a constellationId via the existing picker. Click on empty sky
     = deselect. Hover = tooltip (star name, distance in ly, constellation, family).
**FR2**  **FAMILY** **RESOLUTION**: look up familyId. Maintain an unordered Set<constellationId> per family.
     The Set, not the click order, is the source of truth.
**FR3**  **PROGRESSIVE** **BUILD** (order-independent):
    - First click on family F → activate F, render all F member asterisms as dim *ghost* guides,
    highlight the clicked one.
    - Each later click on a member of F → that constellation lights up and its edges to
    already-lit neighbours animate in with a draw-on (trim-path) effect.
    - Clicking a constellation of a different family G → default behaviour (a): cross-fade to G.
    Behaviour (b) multi-family simultaneous with distinct palettes must be a config flag.
**FR4**  **FAMILY** **SHAPE**: once ≥ threshold members are active (default 3), compute and reveal the family's
    enclosing form — a translucent curved mesh patch on the celestial sphere (spherical convex hull
    of member constellation centroids + key stars), fresnel rim glow, animated vertex reveal.
**FR5**  **SEQUENCE** **INDEPENDENCE** (hard requirement): the final edge set and hull must be byte-identical
     regardless of click order. Derive both deterministically from the activation Set only.
**FR6**  **FEEDBACK**: **HUD** shows family name, myth theme, *n/N members revealed*, and per-family colour.
**FR7**  **RESET**: **ESC** / empty-sky click / toggle button clears state with a fade-out animation.

**DATA** **MODEL** (precompute once at load; flat typed arrays for **GPU**)
- constellationId → { familyId, starIds[], asterismEdges: int32[][2], centroid: Vec3 }
- familyId → { name, myth, color: 0xRRGGBB, memberIds[], adjacency: int32[][2], hullCache }
- adjacency = k-NN over constellation centroids (k=3) **UNION** Menzel spatial proximity edges.
- Hull geometry is **STATIC** (celestial sphere never moves) → build once, cache, never rebuild per click.

**RENDERING**
- All overlays parented to the celestial-sphere group so they stay sky-fixed under camera motion.
- Lines: one LineSegments / Line2 (fat lines) batch. Per-vertex attributes: familyColor, edgeIndex,
    progress. Animate with uniform time + per-edge delay to get the draw-on effect. Additive blending,
    depthWrite = false, depthTest against stars only.
- Family shape mesh: BufferGeometry on normalized sphere radius, custom ShaderMaterial with
  fresnel rim + soft additive glow. Reveal via a per-vertex *revealTime* attribute.
- Highlighted member stars get a halo sprite/ring; base star brightness must never be altered.
- Render order: star point cloud → asterism lines → family hull mesh → halos → **HUD**.

**PERFORMANCE**
- 60 **FPS** target. Draw calls O(activeFamilies + 1).
- Zero per-frame allocations; reuse buffers; pool halo sprites.
- Never iterate 5,**400** stars per frame for picking — use the existing ID-buffer.

**ACCEPTANCE** **CRITERIA** ## Click 5 Hercules-family constellations in random order → identical final line set + hull as any other order. ## Switching family cross-fades in < 400 ms with no frame drop below 55 FPS. ## Reset returns to pristine sky with no leaked geometries/materials. ## Works at all zoom levels and from the southern hemisphere viewpoint. ## Unit test: shuffle the click sequence 100×, assert deep-equal final state.

**DELIVERABLES**
- Modular files: FamilyRevealController, FamilyGraph, HullBuilder, LineBatch, HudOverlay, config.ts.
- A single config object exposing: kNeighbors, revealThreshold, multiFamilyMode, colors, animDurations.
- Unit tests for **FR5** order-independence and hull caching.
- Short **README** with integration points (where to hook the existing picker + celestial group).

**BEFORE** **CODING**, **ASK** ME ## Is picking done via GPU ID-buffer or CPU raycast? ## Should multi-family mode (FR3b) be on or off by default? ## Any existing line/mesh overlay system I must reuse instead of writing new shaders?

**CONSTRAINTS**
- Do not modify the existing star point-cloud shader.
- Do not re-derive celestial coordinates; consume the existing star position buffers.
- Prefer data-driven design: adding a 9th family must require zero new rendering code.
Recommended: default to skeleton, offer hull when activeSet.size / memberCount > 0.6.

Two data caveats in your **JSON** to fix before wiring this up

Hydrus is currently listed under both heavenly_waters and bayer in the families block — normalise to one family id or the reveal logic will double-count it.

Triangulum Australe and Volans also appear in two families. Enforce a single familyId per constellation at load time, and keep the extra memberships as a separate secondaryFamilies[] array for UI only.