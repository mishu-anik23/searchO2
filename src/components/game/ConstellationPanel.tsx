import { useEffect, useState } from "react";
import {
  BIRTH_CHART_PATTERNS,
  CONSTELLATIONS_88,
  getBirthConstellation,
  getConstellationById,
  getFamily,
  getFamilyMembers,
  type ConstellationEntry,
  type MenzelFamilyId,
} from "@/game/constellations";
import {
  getConstellationFocusState,
  getRoamHighlightedConstellation,
  setSelectedConstellation,
  subscribeConstellationFocus,
  type ConstellationFocusState,
} from "./three/constellationFocus";
import {
  X,
  Sparkles,
  MapPin,
  Users,
  BookOpen,
  Calendar,
  Compass,
  Layers,
  ChevronRight,
  Eye,
  Minimize2,
  Maximize2,
} from "lucide-react";

/**
 * FPV In-Flight Celestial Scanner & Menzel Family Myth Visualizer.
 * Provides deep astronomical metrics, Menzel star-hops, astrological lore,
 * sequential family grouping animations, and Date of Birth pattern analysis.
 */
export function ConstellationPanel() {
  const [focusState, setFocusState] = useState<ConstellationFocusState>(getConstellationFocusState());
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<"myth" | "locate" | "birth" | "family">("myth");

  // Date of birth interactive calculator state
  const [birthMonth, setBirthMonth] = useState<number>(3);
  const [birthDay, setBirthDay] = useState<number>(21);

  useEffect(() => {
    return subscribeConstellationFocus((s) => setFocusState(s));
  }, []);

  const activeId = focusState.selectedId || focusState.roamHighlightedId;
  if (!activeId) return null;

  const entry: ConstellationEntry | undefined = getConstellationById(activeId);
  if (!entry) return null;

  const family = getFamily(entry.familyId);
  const members = getFamilyMembers(entry.familyId);
  const isRoamOnly = !focusState.selectedId && !!focusState.roamHighlightedId;
  const isAnimating = !!focusState.animatingFamilyId;

  // Calculate birth constellation details
  const birthData = getBirthConstellation(birthMonth, birthDay);

  return (
    <aside
      aria-label="Constellation Inspector"
      className="pointer-events-auto absolute bottom-4 right-4 z-40 w-[min(100vw-2rem,25rem)] overflow-hidden rounded-xl border border-cyan-400/30 bg-slate-950/90 shadow-[0_0_35px_rgba(0,229,255,0.18)] backdrop-blur-xl transition-all duration-300"
    >
      {/* Top Header Bar */}
      <div className="relative border-b border-white/10 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-purple-950/40 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-cyan-300">
              {isRoamOnly ? (
                <>
                  <Eye className="size-3 animate-pulse text-cyan-400" />
                  <span>Scanner Lock · Roaming Horizon</span>
                </>
              ) : (
                <>
                  <Compass className="size-3 text-cyan-400" />
                  <span>Celestial Target · {entry.keyStar.distanceLy} ly</span>
                </>
              )}
            </div>
            <h2 className="font-display text-xl font-bold tracking-tight text-white drop-shadow-sm">
              {entry.name}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/15 px-2 py-0.5 font-mono text-[10px] font-medium text-cyan-200">
                {family.name}
              </span>
              {entry.birthChart.isZodiac && (
                <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] font-medium text-amber-200">
                  Zodiac Sign · {entry.birthChart.element}
                </span>
              )}
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-slate-300">
                RA {entry.centerRa.toFixed(1)}h · Dec {entry.centerDec > 0 ? "+" : ""}{entry.centerDec.toFixed(0)}°
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
              title={collapsed ? "Expand Inspector" : "Collapse Inspector"}
            >
              {collapsed ? <Maximize2 size={15} /> : <Minimize2 size={15} />}
            </button>
            <button
              type="button"
              onClick={() => setSelectedConstellation(null)}
              className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
              title="Close Panel"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Sequential Group Family Animation Progress Banner */}
        {isAnimating && (
          <div className="mt-2.5 rounded-lg border border-cyan-400/40 bg-cyan-950/60 p-2 shadow-inner">
            <div className="flex items-center justify-between text-[10px] font-mono text-cyan-200">
              <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-cyan-300">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex size-2 rounded-full bg-cyan-500"></span>
                </span>
                Mythic Family Assembling
              </span>
              <span>
                {focusState.revealedConstellations.length} / {members.length} figures
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-300 to-amber-300 transition-all duration-300"
                style={{
                  width: `${(focusState.revealedConstellations.length / members.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="max-h-[min(65vh,28rem)] overflow-y-auto p-4 text-xs leading-relaxed text-slate-200">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-2.5 font-mono text-[11px]">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400">Anchor Star</span>
              <p className="font-semibold text-cyan-200">
                {entry.keyStar.name} {entry.keyStar.bayer ? `(${entry.keyStar.bayer})` : ""}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400">Distance from Earth</span>
              <p className="font-semibold text-white">
                {entry.keyStar.distanceLy.toLocaleString()} light-years
              </p>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="mt-3 flex border-b border-white/10 text-[11px] font-medium">
            <button
              type="button"
              onClick={() => setActiveTab("myth")}
              className={`flex flex-1 items-center justify-center gap-1.5 pb-2 border-b-2 transition-colors ${
                activeTab === "myth"
                  ? "border-cyan-400 text-cyan-300 font-semibold"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <BookOpen size={13} /> Myth & Lore
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("locate")}
              className={`flex flex-1 items-center justify-center gap-1.5 pb-2 border-b-2 transition-colors ${
                activeTab === "locate"
                  ? "border-cyan-400 text-cyan-300 font-semibold"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <MapPin size={13} /> Menzel Guide
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("birth")}
              className={`flex flex-1 items-center justify-center gap-1.5 pb-2 border-b-2 transition-colors ${
                activeTab === "birth"
                  ? "border-cyan-400 text-cyan-300 font-semibold"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles size={13} /> Birth Chart
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("family")}
              className={`flex flex-1 items-center justify-center gap-1.5 pb-2 border-b-2 transition-colors ${
                activeTab === "family"
                  ? "border-cyan-400 text-cyan-300 font-semibold"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Users size={13} /> Family ({members.length})
            </button>
          </div>

          {/* TAB 1: Myth & Astrological Lore */}
          {activeTab === "myth" && (
            <div className="mt-3 space-y-3">
              <div className="rounded-lg border border-amber-500/20 bg-amber-950/15 p-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-amber-300">
                  Classical Myth & Cosmic Origin
                </p>
                <p className="mt-1.5 text-slate-200 leading-relaxed">{entry.mythology}</p>
              </div>

              <div className="rounded-lg border border-white/10 bg-slate-900/60 p-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-cyan-300">
                  {family.name} Connected Storyline
                </p>
                <p className="mt-1.5 text-slate-300 text-[11px] leading-relaxed">
                  {family.mythologicalTheme}
                </p>
                <p className="mt-2 text-[10px] italic text-slate-400">
                  Clicking any star in this group sequentially illuminates all {members.length} sibling constellations across the cockpit sky path.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Menzel Sky Path Locating Guide */}
          {activeTab === "locate" && (
            <div className="mt-3 space-y-3">
              <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/15 p-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-cyan-300">
                  Menzel Field Guide Star-Hop Directions
                </p>
                <p className="mt-1.5 text-slate-200 leading-relaxed">{entry.locatingDirections}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-[10px] text-slate-300">
                <div className="rounded border border-white/10 bg-white/5 p-2">
                  <span className="text-slate-400">Culmination Season</span>
                  <p className="font-semibold text-white">{entry.birthChart.siderealDates}</p>
                </div>
                <div className="rounded border border-white/10 bg-white/5 p-2">
                  <span className="text-slate-400">Modality</span>
                  <p className="font-semibold text-white">{entry.birthChart.modality}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Date of Birth & Natal Sky Patterns */}
          {activeTab === "birth" && (
            <div className="mt-3 space-y-3">
              <div className="rounded-lg border border-purple-500/25 bg-purple-950/20 p-3">
                <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-purple-300">
                  <Calendar size={12} />
                  <span>Pilot Birth Date Alignment Calculator</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-300">
                  Enter your date of birth to reveal which constellation commands your celestial origin and active natal aspect geometries:
                </p>

                {/* Date Inputs */}
                <div className="mt-2.5 flex items-center gap-2">
                  <div className="flex-1">
                    <label className="block text-[9px] uppercase font-mono text-slate-400">Month</label>
                    <select
                      value={birthMonth}
                      onChange={(e) => setBirthMonth(parseInt(e.target.value, 10))}
                      className="mt-0.5 w-full rounded border border-white/20 bg-slate-900 px-2 py-1 font-mono text-xs text-white"
                    >
                      {[
                        "January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"
                      ].map((m, idx) => (
                        <option key={m} value={idx + 1}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-20">
                    <label className="block text-[9px] uppercase font-mono text-slate-400">Day</label>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={birthDay}
                      onChange={(e) => setBirthDay(Math.max(1, Math.min(31, parseInt(e.target.value, 10) || 1)))}
                      className="mt-0.5 w-full rounded border border-white/20 bg-slate-900 px-2 py-1 font-mono text-xs text-white text-center"
                    />
                  </div>
                </div>

                {/* Result Card */}
                <div className="mt-3 rounded border border-purple-400/40 bg-purple-900/40 p-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-purple-200">Sun Sign Constellation</span>
                      <p className="font-display text-sm font-bold text-white">
                        {birthData.constellation.name} ({birthData.element} Element)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedConstellation(birthData.constellation.id)}
                      className="rounded-full border border-purple-300/40 bg-purple-400/20 px-2.5 py-1 text-[10px] font-mono text-purple-100 hover:bg-purple-400/30"
                    >
                      Focus in Sky ↗
                    </button>
                  </div>
                  <p className="mt-1 text-[10px] text-purple-200/80">
                    Tropical Dates: {birthData.dates}
                  </p>
                </div>
              </div>

              {/* Active Aspect Geometries */}
              <div className="rounded-lg border border-white/10 bg-slate-900/60 p-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-cyan-300">
                  Harmonic Natal Aspect Patterns
                </p>
                <div className="mt-2 space-y-2">
                  {BIRTH_CHART_PATTERNS.slice(0, 3).map((pat) => (
                    <div key={pat.name} className="rounded border border-white/5 bg-white/[0.02] p-2">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-white">
                        <span>{pat.name}</span>
                        <span className="font-mono text-[9px] text-cyan-300">{pat.element}</span>
                      </div>
                      <p className="mt-1 text-[10px] text-slate-300 leading-snug">{pat.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Menzel Family Group Members */}
          {activeTab === "family" && (
            <div className="mt-3 space-y-3">
              <p className="text-[11px] text-slate-300">{family.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {members.map((m) => {
                  const isRevealed = focusState.revealedConstellations.includes(m.id);
                  const isCurrent = m.id === entry.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedConstellation(m.id)}
                      className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] transition-all ${
                        isCurrent
                          ? "border-cyan-300 bg-cyan-500/25 font-semibold text-cyan-100 shadow-[0_0_10px_rgba(0,229,255,0.4)]"
                          : isRevealed
                          ? "border-teal-400/40 bg-teal-500/15 text-teal-200"
                          : "border-white/10 bg-white/5 text-slate-400 hover:border-white/30 hover:text-white"
                      }`}
                    >
                      {isRevealed && <span className="size-1.5 rounded-full bg-cyan-400"></span>}
                      <span>{m.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
