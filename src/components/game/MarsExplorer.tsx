import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, Stars, useTexture } from "@react-three/drei";
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Compass,
  Crosshair,
  Glasses,
  MapPin,
  Play,
  Search,
  X,
  ZoomIn,
} from "lucide-react";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useGame } from "@/game/store";
import {
  MARS_FEATURES,
  MARS_GEOGRAPHY_BASICS,
  MARS_TOUR_IDS,
  formatMarsLatLon,
  marsTypeLabel,
  type MarsFeature,
} from "@/game/mars-data";

const kinds = [
  "landing",
  "crater",
  "delta",
  "mountain",
  "canyon",
  "pole",
  "basin",
  "rover",
  "isru",
  "science",
] as const;
type LayerKey = (typeof kinds)[number];

const colors: Record<LayerKey, string> = {
  landing: "#f0c674",
  crater: "#d4a574",
  delta: "#7eb8c9",
  mountain: "#e8a070",
  canyon: "#c4896a",
  pole: "#c8d8e8",
  basin: "#b8956a",
  rover: "#80c29b",
  isru: "#9fd0d4",
  science: "#ced9e5",
};

function pointOnMars(lat: number, lon: number, r: number): THREE.Vector3 {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

export function MarsExplorer() {
  const go = useGame((s) => s.go);
  const openLibrary = useGame((s) => s.openLibrary);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>(() =>
    Object.fromEntries(kinds.map((k) => [k, true])) as Record<LayerKey, boolean>,
  );
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);
  const [tourIndex, setTourIndex] = useState(-1);
  const [closeZoom, setCloseZoom] = useState(false);
  const [roam, setRoam] = useState(false);
  const [mobilePanel, setMobilePanel] = useState(false);

  const selected = MARS_FEATURES.find((f) => f.id === selectedId) ?? null;
  const filtered = useMemo(
    () =>
      MARS_FEATURES.filter((f) =>
        `${f.name} ${f.type} ${f.mission ?? ""}`.toLowerCase().includes(query.toLowerCase()),
      ).slice(0, 8),
    [query],
  );
  const tourStops = useMemo(
    () => MARS_TOUR_IDS.map((id) => MARS_FEATURES.find((f) => f.id === id)).filter(Boolean) as MarsFeature[],
    [],
  );
  const jezero = MARS_FEATURES.find((f) => f.id === "jezero")!;

  const visit = (f: MarsFeature, openLearn = true) => {
    setSelectedId(f.id);
    setMobilePanel(true);
    setSearchOpen(false);
    if (openLearn) setLearnOpen(true);
  };

  const startTour = () => {
    setTourIndex(0);
    setRoam(false);
    if (tourStops[0]) visit(tourStops[0], true);
  };

  const tourNext = (dir: 1 | -1) => {
    if (tourIndex < 0) return;
    const next = Math.min(tourStops.length - 1, Math.max(0, tourIndex + dir));
    setTourIndex(next);
    if (tourStops[next]) visit(tourStops[next], true);
  };

  const enterVr = async () => {
    try {
      const xr = (
        navigator as Navigator & {
          xr?: {
            isSessionSupported: (m: string) => Promise<boolean>;
          };
        }
      ).xr;
      if (!xr) {
        alert("WebXR is not available in this browser. Use mouse, trackpad, or touch for the 3D tour.");
        return;
      }
      const ok = await xr.isSessionSupported("immersive-vr");
      if (!ok) {
        alert("Immersive VR is not supported on this device. The Mars globe still works in 3D on screen.");
        return;
      }
      setRoam(true);
      alert("VR-ready: open this page in a WebXR headset browser for immersive view.");
    } catch {
      alert("Could not check VR. Continue with drag, zoom, and click on flat displays.");
    }
  };

  return (
    <main className="relative flex min-h-[calc(100dvh-61px)] flex-col overflow-hidden bg-[#120a08] text-fg">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,rgba(120,60,30,.28),transparent_55%)]" />
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
                <span className="text-[10px] font-semibold tracking-[.22em] text-orange-200/90">
                  OXYFORGE / EXPLORER
                </span>
                <Badge tone="accent">MARS SURVEY</Badge>
              </div>
              <h1 className="mt-0.5 text-lg font-semibold tracking-tight">Mars, mapped for oxygen & exploration</h1>
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
                }}
                placeholder="Search Jezero, MOXIE…"
                className="w-full rounded-md border border-white/10 bg-black/40 py-2 pl-9 pr-3 text-sm text-fg outline-none placeholder:text-slate-500 focus:border-orange-200/40 sm:w-52"
              />
              {searchOpen && query && filtered.length > 0 && (
                <ul className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-md border border-white/10 bg-slate-950 shadow-xl">
                  {filtered.map((f) => (
                    <li key={f.id}>
                      <button
                        type="button"
                        className="flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-white/5"
                        onClick={() => visit(f)}
                      >
                        <span className="font-medium">{f.name}</span>
                        <span className="text-[10px] text-muted">
                          {marsTypeLabel(f.type)}
                          {f.mission ? ` · ${f.mission}` : ""}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Button size="sm" variant="secondary" onClick={() => openLibrary("moxie")}>
              <BookOpen className="size-3.5" /> MOXIE notes
            </Button>
          </div>
        </header>
      )}

      <div className={`relative flex flex-1 ${roam ? "min-h-[calc(100dvh-61px)]" : ""}`}>
        <section className={`relative ${roam ? "w-full" : "min-h-[420px] flex-1 lg:min-h-0"}`}>
          <Canvas
            className="h-full min-h-[420px] w-full touch-none"
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: false }}
            onCreated={({ scene }) => {
              scene.background = new THREE.Color("#120a08");
            }}
          >
            <color attach="background" args={["#120a08"]} />
            <ambientLight intensity={0.75} />
            <directionalLight position={[-4, 3, 6]} intensity={1.85} color="#ffe8d0" />
            <directionalLight position={[5, -2, -3]} intensity={0.25} color="#8a6040" />
            <Stars radius={70} depth={34} count={1000} factor={2.1} saturation={0} fade speed={0.1} />
            <Suspense fallback={null}>
              <MarsBody />
            </Suspense>
            {MARS_FEATURES.filter((f) => layers[f.type as LayerKey]).map((f) => (
              <FeatureMarker key={f.id} feature={f} selected={selectedId === f.id} onSelect={() => visit(f)} />
            ))}
            <CameraFlight feature={selected} closeZoom={closeZoom || tourIndex >= 0} />
            <ZoomWatcher onCloseZoom={setCloseZoom} />
            <OrbitControls
              makeDefault
              enableDamping
              dampingFactor={0.07}
              enablePan
              screenSpacePanning
              minDistance={2.18}
              maxDistance={12}
              rotateSpeed={closeZoom ? 0.35 : 0.55}
              zoomSpeed={1.05}
              panSpeed={closeZoom ? 0.85 : 0.45}
              maxPolarAngle={Math.PI}
              minPolarAngle={0}
            />
          </Canvas>

          {!roam && (
            <div className="absolute left-4 top-4 flex flex-col gap-2 sm:left-6 sm:top-6">
              <div className="rounded-full border border-white/10 bg-black/40 px-3 py-1.5 font-mono text-[10px] tracking-widest text-slate-300 backdrop-blur">
                {closeZoom ? "CLOSE-UP REGION" : "GLOBAL MARS VIEW"}{" "}
                <span className="text-orange-200/90">·</span>{" "}
                {selected ? `${selected.latitude.toFixed(1)}° / ${selected.longitude.toFixed(1)}°` : "GLOBE"}
              </div>
              <div className="max-w-[270px] rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-xs leading-relaxed text-slate-400 backdrop-blur">
                <span className="text-orange-100/90">Drag</span> rotate ·{" "}
                <span className="text-orange-100/90">scroll / pinch</span> zoom ·{" "}
                <span className="text-orange-100/90">hover</span> labels ·{" "}
                <span className="text-orange-100/90">click</span> classroom card
                {closeZoom && (
                  <span className="mt-1 block text-accent">Zoomed in — drag to pan across the region</span>
                )}
              </div>
            </div>
          )}

          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 sm:bottom-6 sm:left-6">
            <Button size="sm" variant="secondary" onClick={() => visit(jezero)}>
              <Crosshair className="size-3.5" /> Jezero / Perseverance
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                visit(jezero, false);
                setCloseZoom(true);
              }}
            >
              <ZoomIn className="size-3.5" /> Zoom Jezero
            </Button>
            <Button size="sm" variant="secondary" onClick={startTour}>
              <Play className="size-3.5" /> Guided tour
            </Button>
            <Button size="sm" variant="secondary" onClick={() => void enterVr()}>
              <Glasses className="size-3.5" /> VR-ready
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
                <Compass className="size-3.5" /> Roam
              </Button>
            )}
            {!roam && (
              <Button size="sm" variant="secondary" className="md:hidden" onClick={() => setMobilePanel(true)}>
                <BookOpen className="size-3.5" /> Learn
              </Button>
            )}
          </div>

          {tourIndex >= 0 && (
            <div className="absolute bottom-20 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-black/70 px-2 py-1.5 backdrop-blur">
              <Button size="sm" variant="ghost" onClick={() => tourNext(-1)} disabled={tourIndex <= 0}>
                <ChevronLeft className="size-3.5" />
              </Button>
              <span className="px-2 font-mono text-[10px] text-slate-200">
                Tour {tourIndex + 1}/{tourStops.length}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => tourNext(1)}
                disabled={tourIndex >= tourStops.length - 1}
              >
                <ChevronRight className="size-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setTourIndex(-1);
                  setLearnOpen(false);
                }}
              >
                <X className="size-3.5" />
              </Button>
            </div>
          )}

          {roam && (
            <Button size="sm" variant="secondary" className="absolute right-4 top-4" onClick={() => setRoam(false)}>
              <X className="size-3.5" /> Exit roam
            </Button>
          )}

          <FeatureLearnModal feature={selected} open={learnOpen && !!selected} onOpenChange={setLearnOpen} />
        </section>

        {!roam && (
          <aside
            className={`z-10 flex w-full flex-col border-t border-white/10 bg-[#140c0a]/95 backdrop-blur lg:w-[22rem] lg:border-l lg:border-t-0 ${
              mobilePanel ? "fixed inset-x-0 bottom-0 max-h-[70dvh] overflow-y-auto lg:static lg:max-h-none" : "hidden lg:flex"
            }`}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <p className="text-[10px] font-semibold tracking-[.18em] text-orange-200/80">LAYERS & BRIEF</p>
              <button
                type="button"
                className="rounded p-1 text-slate-500 hover:text-white lg:hidden"
                onClick={() => setMobilePanel(false)}
              >
                <X size={15} />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 px-4 py-3">
              {kinds.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setLayers((L) => ({ ...L, [k]: !L[k] }))}
                  className={`rounded-full border px-2 py-0.5 text-[10px] ${
                    layers[k]
                      ? "border-orange-200/40 bg-orange-200/10 text-orange-100"
                      : "border-white/10 text-slate-500"
                  }`}
                >
                  {marsTypeLabel(k)}
                </button>
              ))}
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-6">
              {selected ? (
                <FeatureCard feature={selected} onClose={() => setSelectedId(null)} onLearn={() => setLearnOpen(true)} />
              ) : (
                <div className="rounded-xl border border-white/10 bg-white/[.03] p-4 text-sm text-slate-400">
                  <p className="font-medium text-slate-200">Perseverance at Jezero</p>
                  <p className="mt-2 text-xs leading-relaxed">
                    Select a marker to open a classroom card. The globe uses NASA-style basemap imagery (
                    <code className="text-[10px]">mars.webp</code>) with teaching pins for rover sites, MOXIE, and
                    major landforms.
                  </p>
                  <Button size="sm" className="mt-4" onClick={() => visit(jezero)}>
                    <MapPin className="size-3.5" /> Go to Jezero
                  </Button>
                </div>
              )}
              <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-[11px] leading-relaxed text-slate-500">
                Teaching locators based on public NASA mission geography — not a navigation chart. MOXIE demonstrated
                oxygen from CO₂ at demonstration scale only.
              </div>
            </div>
          </aside>
        )}
      </div>
    </main>
  );
}

function MarsBody() {
  const source = useTexture("/cosmos/mars.webp");
  const texture = useMemo(() => {
    const image = source.image as HTMLImageElement;
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || image.width || 512;
    canvas.height = image.naturalHeight || image.height || 512;
    const context = canvas.getContext("2d");
    if (!context) return source;
    context.fillStyle = "#8a4a2a";
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
      <meshStandardMaterial map={texture} color="#e8b090" roughness={0.95} metalness={0.02} />
    </mesh>
  );
}

function ZoomWatcher({ onCloseZoom }: { onCloseZoom: (v: boolean) => void }) {
  const { camera } = useThree();
  const last = useRef(false);
  useFrame(() => {
    const near = camera.position.length() < 4.2;
    if (near !== last.current) {
      last.current = near;
      onCloseZoom(near);
    }
  });
  return null;
}

function FeatureMarker({
  feature,
  selected,
  onSelect,
}: {
  feature: MarsFeature;
  selected: boolean;
  onSelect: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const lastZoomed = useRef(false);
  const [zoomed, setZoomed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const position = useMemo(() => pointOnMars(feature.latitude, feature.longitude, 2.025), [feature]);
  const { camera } = useThree();
  const coords = formatMarsLatLon(feature.latitude, feature.longitude);
  useFrame(() => {
    if (group.current)
      group.current.visible = position.clone().normalize().dot(camera.position.clone().normalize()) > -0.05;
    const near = camera.position.length() < 5.0;
    if (near !== lastZoomed.current) {
      lastZoomed.current = near;
      setZoomed(near);
    }
  });
  const kind = feature.type as LayerKey;
  const pin = selected ? 0.055 : hovered ? 0.05 : zoomed ? 0.038 : 0.032;
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
        <sphereGeometry args={[pin, 20, 20]} />
        <meshBasicMaterial color={colors[kind]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[pin * 1.35, pin * 1.55, 32]} />
        <meshBasicMaterial
          color={colors[kind]}
          transparent
          opacity={selected || hovered ? 0.9 : 0.55}
          side={THREE.DoubleSide}
        />
      </mesh>
      {(zoomed || selected || hovered) && (
        <Html
          position={[0, pin * 2.2, 0]}
          center
          distanceFactor={zoomed ? 5.5 : 8}
          zIndexRange={[20, 0]}
          style={{ pointerEvents: hovered ? "none" : "auto" }}
        >
          {hovered || selected ? (
            <div className="w-52 rounded-lg border border-orange-200/35 bg-slate-950/96 p-2.5 shadow-2xl">
              <p className="text-[9px] font-semibold tracking-wider text-orange-100">
                {feature.status} · {marsTypeLabel(feature.type)}
              </p>
              <p className="mt-1 text-sm font-semibold text-white">{feature.name}</p>
              <p className="mt-0.5 font-mono text-[10px] text-slate-400">
                {coords.lat} · {coords.lon}
                {feature.diameterKm != null ? ` · Ø ${feature.diameterKm} km` : ""}
              </p>
              <p className="mt-1.5 line-clamp-3 text-[11px] leading-snug text-slate-300">{feature.kidFriendly}</p>
              <p className="mt-1.5 text-[10px] font-medium text-orange-200/90">Click for classroom popup</p>
            </div>
          ) : (
            <button
              type="button"
              aria-label={`Learn about ${feature.name}`}
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className="whitespace-nowrap rounded-md border border-white/20 bg-slate-950/85 px-2 py-1 text-[10px] font-medium text-slate-100 shadow-lg backdrop-blur hover:border-orange-200/60"
            >
              {feature.name}
            </button>
          )}
        </Html>
      )}
    </group>
  );
}

function CameraFlight({
  feature,
  closeZoom,
}: {
  feature: MarsFeature | null;
  closeZoom?: boolean;
}) {
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  const destination = useMemo(() => new THREE.Vector3(), []);
  const remaining = useMemo(() => ({ value: 0 }), []);
  useEffect(() => {
    if (feature) {
      const surface = pointOnMars(feature.latitude, feature.longitude, 2.01);
      target.copy(surface);
      const altitude = closeZoom ? 2.85 : 3.55;
      const eye = pointOnMars(feature.latitude, feature.longitude, altitude);
      const tangent = new THREE.Vector3(0, 1, 0).cross(eye.clone().normalize()).normalize();
      destination.copy(eye).add(tangent.multiplyScalar(0.35));
      remaining.value = 1;
    } else {
      target.set(0, 0, 0);
      destination.set(0, 1.0, 7.0);
      remaining.value = 1;
    }
  }, [feature, closeZoom, target, destination, remaining]);
  useFrame(({ controls }) => {
    if (remaining.value <= 0) return;
    const ease = Math.min(0.1, remaining.value * 0.11 + 0.008);
    camera.position.lerp(destination, ease);
    camera.up.lerp(new THREE.Vector3(0, 1, 0), ease).normalize();
    const c = controls as { target?: THREE.Vector3; update?: () => void } | undefined;
    if (c?.target) c.target.lerp(target, ease);
    c?.update?.();
    if (camera.position.distanceTo(destination) < 0.02 && (!c?.target || c.target.distanceTo(target) < 0.02))
      remaining.value = 0;
  });
  return null;
}

function FeatureCard({
  feature,
  onClose,
  onLearn,
}: {
  feature: MarsFeature;
  onClose: () => void;
  onLearn: () => void;
}) {
  const coords = formatMarsLatLon(feature.latitude, feature.longitude);
  return (
    <article className="rounded-xl border border-white/10 bg-white/[.025] p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[9px] font-semibold tracking-[.2em]" style={{ color: colors[feature.type] }}>
            {marsTypeLabel(feature.type).toUpperCase()} · {feature.status}
          </p>
          <h2 className="mt-1 text-lg font-semibold">{feature.name}</h2>
          {feature.mission && <p className="mt-0.5 font-mono text-[10px] text-orange-200/80">{feature.mission}</p>}
        </div>
        <button aria-label="Close" onClick={onClose} className="rounded p-1 text-slate-500 hover:text-white">
          <X size={15} />
        </button>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-slate-300">{feature.summary}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-md border border-white/10 bg-black/20 px-2 py-1.5">
          <p className="text-[9px] text-slate-500">LAT</p>
          <p className="font-mono text-xs">{coords.lat}</p>
        </div>
        <div className="rounded-md border border-white/10 bg-black/20 px-2 py-1.5">
          <p className="text-[9px] text-slate-500">LON</p>
          <p className="font-mono text-xs">{coords.lon}</p>
        </div>
      </div>
      <Button size="sm" className="mt-3 w-full" onClick={onLearn}>
        Classroom popup
      </Button>
    </article>
  );
}

function FeatureLearnModal({
  feature,
  open,
  onOpenChange,
}: {
  feature: MarsFeature | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  if (!feature) return null;
  const coords = formatMarsLatLon(feature.latitude, feature.longitude);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90dvh,40rem)] overflow-y-auto border-orange-200/20 bg-slate-950 text-fg sm:max-w-lg">
        <DialogTitle className="pr-8">{feature.name}</DialogTitle>
        <p className="mt-1 font-mono text-xs text-accent">
          {marsTypeLabel(feature.type)} · {feature.status}
          {feature.region ? ` · ${feature.region}` : ""}
        </p>
        {feature.mission && <p className="mt-1 text-xs text-orange-200/80">{feature.mission}</p>}
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg border border-border bg-raised px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-muted">Latitude</p>
            <p className="font-mono tabular-nums">{coords.lat}</p>
          </div>
          <div className="rounded-lg border border-border bg-raised px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-muted">Longitude</p>
            <p className="font-mono tabular-nums">{coords.lon}</p>
          </div>
          {feature.diameterKm != null && (
            <div className="rounded-lg border border-border bg-raised px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-muted">Diameter</p>
              <p className="font-mono tabular-nums">{feature.diameterKm} km</p>
            </div>
          )}
          {feature.elevationKm != null && (
            <div className="rounded-lg border border-border bg-raised px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-muted">Elevation</p>
              <p className="font-mono tabular-nums">~{feature.elevationKm} km</p>
            </div>
          )}
        </div>
        <section className="mt-4 rounded-lg border border-accent/25 bg-accent/5 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-accent">For students</p>
          <p className="mt-1.5 text-sm leading-relaxed text-fg">{feature.kidFriendly}</p>
        </section>
        <section className="mt-3 space-y-2 rounded-lg border border-border bg-raised/50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{MARS_GEOGRAPHY_BASICS.title}</p>
          <p className="text-xs leading-relaxed text-slate-300">
            <span className="font-medium text-fg">Atmosphere: </span>
            {MARS_GEOGRAPHY_BASICS.atmosphere}
          </p>
          <p className="text-xs leading-relaxed text-slate-300">
            <span className="font-medium text-fg">Surface: </span>
            {MARS_GEOGRAPHY_BASICS.surface}
          </p>
          <p className="text-xs leading-relaxed text-slate-300">
            <span className="font-medium text-fg">Water story: </span>
            {MARS_GEOGRAPHY_BASICS.water}
          </p>
        </section>
        <section className="mt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Why explorers care</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-200">{feature.why}</p>
        </section>
        <section className="mt-3 rounded-md border border-amber-200/15 bg-amber-200/[.04] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-100/90">Evidence note</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            {feature.summary} {feature.limitation}
          </p>
        </section>
        {feature.sources[0] && (
          <p className="mt-3 text-[11px] text-muted">
            Learn more: {feature.sources[0].organization} — {feature.sources[0].title}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
