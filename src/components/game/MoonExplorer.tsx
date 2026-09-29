import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, Stars, useTexture } from "@react-three/drei";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Compass,
  Crosshair,
  Layers3,
  MapPin,
  Play,
  RotateCcw,
  Search,
  Waves,
  X,
} from "lucide-react";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGame } from "@/game/store";
import { LUNAR_FEATURES, OXYGEN_STEPS, WATER_STEPS, TECHNOLOGIES, type LunarFeature } from "@/game/lunar-data";

const kinds = ["crater", "basin", "pole", "psr", "mountain", "ridge", "centralPeak", "resource", "science"] as const;
type LayerKey = (typeof kinds)[number];
const colors: Record<LayerKey, string> = {
  crater: "#d5b47a",
  basin: "#c18a63",
  pole: "#84c5d1",
  psr: "#817ee2",
  mountain: "#d5a873",
  ridge: "#e6c76e",
  centralPeak: "#d6bf9d",
  resource: "#80c29b",
  science: "#ced9e5",
};

function pointOnMoon(lat: number, lon: number, r: number): THREE.Vector3 {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

export function MoonExplorer() {
  const go = useGame((s) => s.go);
  const openLibrary = useGame((s) => s.openLibrary);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    crater: true,
    basin: true,
    pole: true,
    psr: true,
    mountain: true,
    ridge: true,
    centralPeak: true,
    resource: true,
    science: false,
  });
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [roam, setRoam] = useState(false);
  const [facility, setFacility] = useState(false);
  const [process, setProcess] = useState(-1);
  const [waterMode, setWaterMode] = useState(false);
  const [technology, setTechnology] = useState("mre");
  const [mobilePanel, setMobilePanel] = useState(false);
  const selected = LUNAR_FEATURES.find((f) => f.id === selectedId) ?? null;
  const filtered = useMemo(
    () => LUNAR_FEATURES.filter((f) => `${f.name} ${f.type}`.toLowerCase().includes(query.toLowerCase())).slice(0, 6),
    [query],
  );

  useEffect(() => {
    if (process < 0) return;
    if (process >= (waterMode ? WATER_STEPS.length : OXYGEN_STEPS.length)) {
      const timer = window.setTimeout(() => setProcess(-1), 2200);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setProcess((n) => n + 1), 1700);
    return () => window.clearTimeout(timer);
  }, [process, waterMode]);

  const visit = (f: LunarFeature) => {
    setSelectedId(f.id);
    setFacility(false);
    setMobilePanel(true);
    setSearchOpen(false);
  };
  const southPole = LUNAR_FEATURES.find((f) => f.id === "south-pole")!;
  const activeTechnology = TECHNOLOGIES.find((t) => t.id === technology)!;
  const steps = waterMode ? WATER_STEPS : OXYGEN_STEPS;
  const currentStep = process >= 0 && process < steps.length ? steps[process] : null;

  return (
    <main
      className={`relative flex min-h-[calc(100dvh-61px)] flex-col overflow-hidden bg-[#080b10] text-fg ${roam ? "!min-h-[calc(100dvh-61px)]" : ""}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_65%_46%,rgba(35,55,72,.33),transparent_54%)]" />
      {!roam && (
        <header className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <button
              aria-label="Back to mission control"
              onClick={() => go("hq")}
              className="rounded-md p-2 text-slate-400 hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft size={17} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold tracking-[.22em] text-cyan-200">OXYFORGE / EXPLORER</span>
                <Badge tone="accent">LUNAR SURVEY</Badge>
              </div>
              <h1 className="mt-0.5 text-lg font-semibold tracking-tight">The Moon, mapped for oxygen</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative min-w-[150px] flex-1 sm:flex-none">
              <Search className="absolute left-3 top-2.5 size-3.5 text-slate-500" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filtered[0]) visit(filtered[0]);
                  if (e.key === "Escape") setSearchOpen(false);
                }}
                placeholder="Search the Moon"
                className="h-9 w-full rounded-md border border-white/10 bg-white/[.04] pl-9 pr-3 text-xs text-white placeholder:text-slate-500 focus:border-cyan-300/50 focus:outline-none sm:w-48"
                aria-label="Search lunar features"
              />
              {searchOpen && query && (
                <div className="absolute right-0 top-11 z-30 w-64 overflow-hidden rounded-lg border border-white/10 bg-[#111820] p-1 shadow-xl">
                  {filtered.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        visit(f);
                        setSearchOpen(false);
                      }}
                      className="block w-full rounded px-3 py-2 text-left text-xs hover:bg-white/5"
                    >
                      <span>{f.name}</span>
                      <span className="float-right text-slate-500">{f.type}</span>
                    </button>
                  ))}
                  {filtered.length === 0 && <p className="p-3 text-xs text-slate-500">No matching feature</p>}
                </div>
              )}
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setSelectedId(null);
                setFacility(false);
                setSearchOpen(false);
              }}
            >
              <RotateCcw className="size-3.5" /> Global view
            </Button>
          </div>
        </header>
      )}

      <div className={`relative z-[1] grid flex-1 ${roam ? "grid-cols-1" : "lg:grid-cols-[minmax(0,1fr)_350px]"}`}>
        <section
          className={`relative min-h-[54vh] bg-[#080b10] ${roam ? "h-[calc(100dvh-61px)]" : "lg:min-h-[650px]"}`}
          aria-label="Interactive three dimensional Moon"
        >
          <Canvas
            camera={{ position: [0, 1.1, 7.1], fov: 38 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: false }}
            onCreated={({ scene }) => {
              scene.background = new THREE.Color("#080b10");
            }}
          >
            <color attach="background" args={["#080b10"]} />
            <ambientLight intensity={0.82} />
            <directionalLight position={[-5, 4, 7]} intensity={2.05} color="#edf3f5" />
            <directionalLight position={[4, -3, -4]} intensity={0.15} color="#6384ac" />
            <Stars radius={70} depth={34} count={1100} factor={2.2} saturation={0} fade speed={0.12} />
            <Suspense fallback={null}>
              <MoonBody />
            </Suspense>
            {LUNAR_FEATURES.filter((f) => layers[f.type as LayerKey]).map((f) => (
              <FeatureMarker key={f.id} feature={f} selected={selectedId === f.id} onSelect={() => visit(f)} />
            ))}
            {layers.psr && <PSROverlay />}
            {facility && <ConceptFacility />}
            <CameraFlight feature={selected} facility={facility} />
            <OrbitControls
              makeDefault
              enableDamping
              dampingFactor={0.08}
              enablePan={!facility}
              minDistance={facility ? 0.5 : 2.8}
              maxDistance={10}
              rotateSpeed={0.55}
              zoomSpeed={0.75}
              panSpeed={0.5}
            />
          </Canvas>
          {!roam && (
            <div className="absolute left-4 top-4 flex flex-col gap-2 sm:left-6 sm:top-6">
              <div className="rounded-full border border-white/10 bg-black/35 px-3 py-1.5 font-mono text-[10px] tracking-widest text-slate-300 backdrop-blur">
                GLOBAL LUNAR VIEW <span className="text-cyan-200">·</span>{" "}
                {selected ? `${selected.latitude.toFixed(1)}° / ${selected.longitude.toFixed(1)}°` : "GLOBE"}
              </div>
              <div className="max-w-[235px] rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs leading-relaxed text-slate-400 backdrop-blur">
                Drag to rotate · scroll or pinch to zoom · select a marker to investigate
              </div>
            </div>
          )}
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 sm:bottom-6 sm:left-6">
            <Button size="sm" variant="secondary" onClick={() => visit(southPole)}>
              <Crosshair className="size-3.5" /> Explore South Pole
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setFacility((v) => !v);
                setSelectedId(southPole.id);
                setSearchOpen(false);
                setMobilePanel(false);
              }}
            >
              <Compass className="size-3.5" />
              {facility ? "Exit surface mode" : "Surface site"}
            </Button>
            {!roam && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setRoam(true);
                  setSelectedId(null);
                  setSearchOpen(false);
                  setMobilePanel(false);
                }}
              >
                <Waves className="size-3.5" /> Roam
              </Button>
            )}
            {!roam && (
              <Button size="sm" variant="secondary" className="md:hidden" onClick={() => setMobilePanel(true)}>
                <BookOpen className="size-3.5" /> Learn
              </Button>
            )}
          </div>
          {roam && (
            <>
              <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/40 px-3 py-2 font-mono text-[10px] tracking-widest text-cyan-100">
                <Compass className="mr-2 inline size-3.5" />
                LUNAR SURFACE <span className="ml-2 text-slate-400">89.9°S · POLAR REGION</span>
              </div>
              <Button size="sm" variant="secondary" className="absolute right-4 top-4" onClick={() => setRoam(false)}>
                <X className="size-3.5" /> Exit roam
              </Button>
            </>
          )}
          {facility && (
            <div className="absolute right-4 top-4 rounded-md border border-amber-200/20 bg-black/55 px-3 py-2 text-[10px] leading-relaxed text-amber-100 sm:right-6 sm:top-6">
              <span className="block font-semibold tracking-widest">CONCEPT SITE</span>
              Proposed layout · illustrative equipment
            </div>
          )}
          <div className="absolute bottom-4 right-4 hidden items-center gap-2 text-[10px] text-slate-500 sm:flex">
            <span className="size-2 rounded-full bg-cyan-300" /> OBSERVED{" "}
            <span className="ml-2 size-2 rounded-full bg-amber-300" /> STUDIED{" "}
            <span className="ml-2 size-2 rounded-full bg-violet-300" /> FUTURE
          </div>
        </section>

        {!roam && (
          <aside
            className={`${mobilePanel ? "fixed inset-x-0 bottom-0 z-20 max-h-[75dvh] overflow-y-auto rounded-t-2xl shadow-2xl lg:static lg:max-h-none lg:rounded-none lg:shadow-none" : "hidden lg:block"} border-l border-white/10 bg-[#0d1219]/95 backdrop-blur-xl`}
          >
            <div className="space-y-4 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-[11px] font-semibold tracking-[.17em] text-slate-300">
                  <Layers3 size={14} className="text-cyan-200" /> MAP LAYERS
                </h2>
                <button
                  onClick={() => setMobilePanel(false)}
                  className="rounded p-1 text-slate-500 hover:text-white lg:hidden"
                  aria-label="Close information panel"
                >
                  <X size={17} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                {kinds.map((k) => (
                  <label
                    key={k}
                    className="flex cursor-pointer items-center gap-2 text-[11px] capitalize text-slate-400"
                  >
                    <input
                      type="checkbox"
                      checked={layers[k]}
                      onChange={(e) => setLayers((v) => ({ ...v, [k]: e.target.checked }))}
                      className="accent-cyan-300"
                    />
                    <span className="size-2 rounded-full" style={{ backgroundColor: colors[k] }} />
                    {k === "psr"
                      ? "Shadowed areas"
                      : k === "mountain"
                        ? "Mountains"
                        : k === "ridge"
                          ? "Ridges / high ground"
                          : k === "centralPeak"
                            ? "Central peaks"
                            : k === "resource"
                              ? "Resources"
                              : k === "science"
                                ? "Science sites"
                                : `${k}s`}
                  </label>
                ))}
              </div>
              <div className="h-px bg-white/10" />
              {selected ? (
                <FeatureCard feature={selected} onClose={() => setSelectedId(null)} />
              ) : (
                <div className="rounded-xl border border-white/10 bg-white/[.025] p-4">
                  <p className="text-[9px] font-semibold tracking-[.2em] text-cyan-200">MISSION OVERVIEW</p>
                  <h2 className="mt-2 text-xl font-semibold leading-tight">Resources are a story of place.</h2>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    Explore oxygen-bearing minerals across the Moon, then compare them with polar water-ice research.
                    The site layers are teaching locators, not a survey-grade resource map.
                  </p>
                  <button
                    onClick={() => visit(LUNAR_FEATURES.find((f) => f.id === "regolith")!)}
                    className="mt-3 inline-flex items-center gap-1 text-xs text-cyan-200 hover:text-white"
                  >
                    Start with regolith <ChevronRight size={14} />
                  </button>
                </div>
              )}
              <section className="rounded-xl border border-white/10 bg-white/[.025] p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-semibold tracking-[.16em] text-slate-300">
                    {waterMode ? "FOLLOW THE WATER" : "FOLLOW THE OXYGEN"}
                  </h3>
                  <button
                    onClick={() => {
                      setWaterMode((v) => !v);
                      setProcess(-1);
                    }}
                    className="text-[9px] text-cyan-200 underline underline-offset-2"
                  >
                    Switch to {waterMode ? "oxygen" : "water"} route
                  </button>
                </div>
                <p className="mt-1 text-[9px] text-amber-200">CONCEPTUAL WORKFLOW</p>
                <div className="mt-3 space-y-2">
                  {steps.map((step, i) => (
                    <div
                      key={step.label}
                      className={`flex items-center gap-2 text-[10px] ${process === i ? "text-cyan-100" : process > i ? "text-emerald-200" : "text-slate-500"}`}
                    >
                      <span
                        className={`grid size-5 place-items-center rounded-full border font-mono ${process === i ? "border-cyan-200 bg-cyan-200/10" : "border-white/10"}`}
                      >
                        {process > i ? "✓" : String(i + 1).padStart(2, "0")}
                      </span>
                      <span>{step.title}</span>
                      {i < steps.length - 1 && <span className="ml-auto text-slate-700">↓</span>}
                    </div>
                  ))}
                </div>
                {currentStep && (
                  <div className="mt-3 rounded-md border border-cyan-300/20 bg-cyan-200/[.06] p-3">
                    <p className="text-[10px] font-semibold text-cyan-100">
                      {currentStep.label} · {currentStep.title}
                    </p>
                    <p className="mt-1 text-[10px] leading-relaxed text-slate-400">{currentStep.detail}</p>
                  </div>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-3 w-full"
                  onClick={() => setProcess(process < 0 ? 0 : -1)}
                >
                  <Play className="size-3.5" />
                  {process < 0
                    ? waterMode
                      ? "Start water-to-oxygen route"
                      : "Start oxygen production"
                    : "Stop workflow"}
                </Button>
              </section>
              <section className="rounded-xl border border-white/10 bg-white/[.025] p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-semibold tracking-[.16em] text-slate-300">TECHNOLOGY</h3>
                  <span className="text-[9px] text-slate-500">COMPARE ROUTES</span>
                </div>
                <select
                  value={technology}
                  onChange={(e) => setTechnology(e.target.value)}
                  className="mt-3 h-9 w-full rounded-md border border-white/10 bg-[#101820] px-2 text-xs text-slate-200"
                  aria-label="Choose oxygen production technology"
                >
                  {TECHNOLOGIES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-[9px] font-semibold tracking-wider text-amber-200">{activeTechnology.status}</p>
                <p className="mt-1 text-[10px] leading-relaxed text-slate-400">{activeTechnology.summary}</p>
                <a
                  href={activeTechnology.source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-[10px] text-cyan-200 hover:underline"
                >
                  {activeTechnology.source.organization}: {activeTechnology.source.title}
                  <ChevronRight size={12} />
                </a>
              </section>
              <section className="rounded-xl border border-white/10 bg-white/[.025] p-4">
                <h3 className="text-[10px] font-semibold tracking-[.16em] text-slate-300">MATERIALS & POWER</h3>
                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[9px] font-mono">
                  <span className="rounded border border-white/10 px-2 py-1">REGOLITH · OXIDES</span>
                  <ChevronRight size={12} className="text-slate-600" />
                  <span className="rounded border border-amber-200/20 px-2 py-1 text-amber-100">HEAT + CURRENT</span>
                  <ChevronRight size={12} className="text-slate-600" />
                  <span className="rounded border border-emerald-200/20 px-2 py-1 text-emerald-100">O₂ + METALS</span>
                </div>
                <div className="mt-3 rounded-md border border-white/[.07] bg-black/20 p-2">
                  <p className="font-mono text-[10px] text-slate-200">metal oxide → metal + oxygen</p>
                  <p className="mt-1 font-mono text-[9px] text-slate-400">
                    FeO → Fe + O <span className="mx-1 text-slate-600">·</span> SiO₂ → Si + O₂
                  </p>
                  <p className="mt-1 text-[9px] leading-relaxed text-slate-500">
                    Simplified teaching examples: lunar minerals and real process chemistry are more complex.
                  </p>
                </div>
                <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
                  Potential by-products include iron, silicon, aluminum, titanium, calcium, and magnesium. Exact
                  products depend on the feed and process. Heating and electrolysis require substantial energy; solar
                  plus storage is a proposed architecture.
                </p>
              </section>
              <div className="flex items-center gap-2 px-1 text-[10px] text-slate-500">
                <BookOpen size={12} />
                <button
                  className="underline underline-offset-2 hover:text-cyan-100"
                  onClick={() => openLibrary("moon-ice")}
                >
                  Open science library
                </button>
                <span>·</span>
                <span>Sources link to NASA / NTRS</span>
              </div>
            </div>
          </aside>
        )}
      </div>
      <div className="relative z-[1] flex items-center justify-between border-t border-white/10 bg-black/20 px-4 py-2 font-mono text-[9px] text-slate-500 sm:px-6">
        <span>ISRU · IN-SITU RESOURCE UTILIZATION · USING MATERIALS FOUND LOCALLY ON THE MOON</span>
        <span className="hidden sm:inline">EDUCATIONAL SIMULATION · NO OPERATING LUNAR OXYGEN PLANT</span>
      </div>
    </main>
  );
}

function MoonBody() {
  const source = useTexture("/cosmos/moon.webp");
  const texture = useMemo(() => {
    const image = source.image as HTMLImageElement;
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    const context = canvas.getContext("2d");
    if (!context) return source;
    context.fillStyle = "#55585b";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const opaqueTexture = new THREE.CanvasTexture(canvas);
    opaqueTexture.colorSpace = THREE.SRGBColorSpace;
    return opaqueTexture;
  }, [source]);
  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
  }, [texture]);
  return (
    <mesh>
      <sphereGeometry args={[2, 96, 96]} />
      <meshStandardMaterial map={texture} color="#d2d4d5" roughness={1} metalness={0} />
    </mesh>
  );
}

function FeatureMarker({
  feature,
  selected,
  onSelect,
}: {
  feature: LunarFeature;
  selected: boolean;
  onSelect: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const lastZoomed = useRef(false);
  const [zoomed, setZoomed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const position = useMemo(() => pointOnMoon(feature.latitude, feature.longitude, 2.025), [feature]);
  const { camera } = useThree();
  useFrame(() => {
    if (group.current)
      group.current.visible = position.clone().normalize().dot(camera.position.clone().normalize()) > -0.02;
    const near = camera.position.length() < 5.4;
    if (near !== lastZoomed.current) {
      lastZoomed.current = near;
      setZoomed(near);
    }
  });
  const kind = feature.type as LayerKey;
  return (
    <group ref={group} position={position.toArray()}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[selected ? 0.07 : 0.045, 16, 16]} />
        <meshBasicMaterial color={colors[kind]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.07, 0.082, 28]} />
        <meshBasicMaterial color={colors[kind]} transparent opacity={0.72} side={THREE.DoubleSide} />
      </mesh>
      {(feature.latitude > -80 || zoomed || selected || hovered) && (
        <Html position={[0, 0.1, 0]} center distanceFactor={8} zIndexRange={[15, 0]} style={{ pointerEvents: "none" }}>
          {hovered ? (
            <div className="w-44 rounded-md border border-cyan-200/30 bg-slate-950/95 p-2 shadow-xl">
              <p className="text-[9px] font-semibold tracking-wider text-cyan-100">
                {feature.status} · {feature.type.toUpperCase()}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-white">{feature.name}</p>
              <p className="mt-1 line-clamp-3 text-[9px] leading-relaxed text-slate-300">{feature.summary}</p>
              <p className="mt-1 text-[8px] text-slate-500">Click to learn more</p>
            </div>
          ) : (
            <button
              aria-label={`Learn about ${feature.name}`}
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className={`whitespace-nowrap rounded border px-2 py-1 text-[9px] shadow-lg backdrop-blur ${selected ? "border-cyan-100/70 bg-slate-950/90 text-white" : "border-white/15 bg-slate-950/75 text-slate-200 hover:border-cyan-200/60 hover:text-white"}`}
            >
              {feature.name}
            </button>
          )}
        </Html>
      )}
    </group>
  );
}

function PSROverlay() {
  return (
    <group position={pointOnMoon(-89.55, 16, 2.012).toArray()}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.11, 40]} />
        <meshBasicMaterial color="#5d58bf" transparent opacity={0.52} depthWrite={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.115, 0.13, 40]} />
        <meshBasicMaterial color="#9691f5" transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function CameraFlight({ feature, facility }: { feature: LunarFeature | null; facility: boolean }) {
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  const destination = useMemo(() => new THREE.Vector3(), []);
  const remaining = useMemo(() => ({ value: 0 }), []);
  useEffect(() => {
    if (facility) {
      target.copy(pointOnMoon(-89.6, 10, 2.02));
      destination.copy(pointOnMoon(-89.6, 10, 2.45)).add(new THREE.Vector3(0.35, 0.18, 0.4));
      remaining.value = 1;
    } else if (feature) {
      target.copy(pointOnMoon(feature.latitude, feature.longitude, 2.01));
      destination.copy(pointOnMoon(feature.latitude, feature.longitude, 4.2)).add(new THREE.Vector3(0.8, 0.4, 1.0));
      remaining.value = 1;
    } else {
      target.set(0, 0, 0);
      destination.set(0, 1.1, 7.1);
      remaining.value = 1;
    }
  }, [feature, facility, target, destination, remaining]);
  useFrame(({ controls }) => {
    if (remaining.value <= 0) return;
    const ease = Math.min(0.11, remaining.value * 0.12 + 0.006);
    camera.position.lerp(destination, ease);
    camera.up.lerp(new THREE.Vector3(0, 1, 0), ease).normalize();
    const c = controls as { target?: THREE.Vector3; update?: () => void } | undefined;
    if (c?.target) c.target.lerp(target, ease);
    c?.update?.();
    if (camera.position.distanceTo(destination) < 0.018 && (!c?.target || c.target.distanceTo(target) < 0.018))
      remaining.value = 0;
  });
  return null;
}

function ConceptFacility() {
  const site = pointOnMoon(-89.6, 10, 2.02);
  const normal = site.clone().normalize();
  const tangent = new THREE.Vector3(0, 1, 0).cross(normal).normalize();
  const localZ = new THREE.Vector3().crossVectors(normal, tangent).normalize();
  const orientation = new THREE.Matrix4().makeBasis(tangent, normal, localZ);
  const rotation = new THREE.Quaternion().setFromRotationMatrix(orientation);
  return (
    <group position={site.toArray()} quaternion={rotation}>
      <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.25, 40]} />
        <meshBasicMaterial color="#171b20" transparent opacity={0.9} />
      </mesh>
      <mesh position={[-0.12, 0.1, 0]}>
        <boxGeometry args={[0.11, 0.11, 0.1]} />
        <meshStandardMaterial color="#c28c57" metalness={0.4} />
      </mesh>
      <mesh position={[0.05, 0.12, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.16, 18]} />
        <meshStandardMaterial color="#84c5d1" metalness={0.55} roughness={0.3} />
      </mesh>
      <mesh position={[0.18, 0.08, 0.08]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.15, 0.012, 0.09]} />
        <meshStandardMaterial color="#426c90" metalness={0.55} />
      </mesh>
      <mesh position={[-0.02, 0.1, 0.16]}>
        <cylinderGeometry args={[0.055, 0.055, 0.08, 18]} />
        <meshStandardMaterial color="#9e714c" metalness={0.45} />
      </mesh>
      <mesh position={[0.2, 0.055, -0.1]}>
        <sphereGeometry args={[0.04, 14, 10]} />
        <meshStandardMaterial color="#aab3ba" />
      </mesh>
      <pointLight position={[0, 0.25, 0]} color="#7eb8c9" intensity={0.7} distance={0.5} />
    </group>
  );
}

function FeatureCard({ feature, onClose }: { feature: LunarFeature; onClose: () => void }) {
  return (
    <article className="rounded-xl border border-white/10 bg-white/[.025] p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[9px] font-semibold tracking-[.2em]" style={{ color: colors[feature.type] }}>
            {feature.type.toUpperCase()} · {feature.status}
          </p>
          <h2 className="mt-1 text-lg font-semibold">{feature.name}</h2>
        </div>
        <button
          aria-label="Close selected feature"
          onClick={onClose}
          className="rounded p-1 text-slate-500 hover:text-white"
        >
          <X size={15} />
        </button>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-slate-300">{feature.summary}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Fact label="LATITUDE" value={`${Math.abs(feature.latitude).toFixed(1)}°${feature.latitude < 0 ? "S" : "N"}`} />
        <Fact
          label="LONGITUDE"
          value={`${Math.abs(feature.longitude).toFixed(1)}°${feature.longitude < 0 ? "W" : "E"}`}
        />
      </div>
      <div className="mt-3 rounded-md border border-white/10 bg-black/15 p-3">
        <p className="text-[9px] font-semibold tracking-widest text-slate-500">WHY IT MATTERS</p>
        <p className="mt-1 text-[10px] leading-relaxed text-slate-300">{feature.why}</p>
      </div>
      <div className="mt-2 rounded-md border border-amber-200/10 bg-amber-200/[.035] p-3">
        <p className="text-[9px] font-semibold tracking-widest text-amber-100">EVIDENCE · {feature.evidence}</p>
        <p className="mt-1 text-[10px] leading-relaxed text-slate-400">{feature.limitation}</p>
      </div>
      <p className="mt-3 text-[9px] font-semibold uppercase tracking-widest text-slate-500">Sources</p>
      <div className="mt-1 space-y-1">
        {feature.sources.map((s) => (
          <a
            key={s.url}
            href={s.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-[10px] text-cyan-200 hover:underline"
          >
            <MapPin size={10} />
            {s.organization}: {s.title}
            <ChevronRight size={11} />
          </a>
        ))}
      </div>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-white/[.07] px-2 py-1.5">
      <p className="text-[8px] tracking-widest text-slate-500">{label}</p>
      <p className="mt-0.5 font-mono text-[10px] text-slate-200">{value}</p>
    </div>
  );
}
