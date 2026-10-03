import { useEffect, useState } from "react";
import {
  globalFamilyRevealController,
  type FamilyRevealState,
} from "@/game/familyReveal/FamilyRevealController";
import { ChevronLeft, ChevronRight, Sparkles, RotateCcw, Compass, BookOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FamilyRevealHud() {
  const [state, setState] = useState<FamilyRevealState>(
    globalFamilyRevealController.getState()
  );
  const [showLore, setShowLore] = useState(false);

  useEffect(() => {
    const unsub = globalFamilyRevealController.subscribe((newState) => {
      setState(newState);
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        globalFamilyRevealController.reset();
      } else if (e.key === "ArrowRight") {
        globalFamilyRevealController.nextMember();
      } else if (e.key === "ArrowLeft") {
        globalFamilyRevealController.prevMember();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      unsub();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (!state.activeFamilyId) {
    return null;
  }

  const pct = Math.round(state.revealRatio * 100);

  return (
    <div className="pointer-events-none fixed inset-0 z-30 flex flex-col justify-between p-4 sm:p-6">
      {/* Top Banner: Family Status & Progress */}
      <div className="pointer-events-auto mx-auto w-full max-w-2xl rounded-xl border border-cyan-400/40 bg-slate-950/85 p-3 sm:p-4 text-white shadow-[0_0_30px_rgba(0,229,255,0.2)] backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span
              className="inline-block h-3.5 w-3.5 rounded-full shadow-[0_0_10px_currentColor]"
              style={{ backgroundColor: state.familyColorStr, color: state.familyColorStr }}
            />
            <span className="font-display text-base font-bold tracking-wide sm:text-lg">
              {state.familyName}
            </span>
            <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-xs text-cyan-300">
              {state.revealedCount} / {state.totalMembers} Revealed ({pct}%)
            </span>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              className="h-7 border-cyan-400/30 bg-slate-900/80 px-2 text-xs text-cyan-200 hover:border-cyan-300 hover:text-white"
              onClick={() => globalFamilyRevealController.prevMember()}
              title="Previous Constellation (Left Arrow)"
            >
              <ChevronLeft className="mr-0.5 h-3.5 w-3.5" /> Prev
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 border-cyan-400/30 bg-slate-900/80 px-2 text-xs text-cyan-200 hover:border-cyan-300 hover:text-white"
              onClick={() => globalFamilyRevealController.nextMember()}
              title="Next Constellation (Right Arrow)"
            >
              Next <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs text-amber-300 hover:bg-amber-400/20"
              onClick={() => globalFamilyRevealController.revealAllInFamily()}
              title="Reveal All Sibling Constellations"
            >
              <Sparkles className="mr-1 h-3 w-3" /> Reveal All
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-1.5 text-xs text-white/60 hover:text-white"
              onClick={() => setShowLore(!showLore)}
              title="Toggle Mythological Lore"
            >
              <BookOpen className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-1.5 text-xs text-red-300 hover:bg-red-500/20 hover:text-white"
              onClick={() => globalFamilyRevealController.reset()}
              title="Reset / Dismiss (ESC)"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full transition-all duration-300 ease-out"
            style={{
              width: `${pct}%`,
              backgroundColor: state.familyColorStr,
              boxShadow: `0 0 10px ${state.familyColorStr}`,
            }}
          />
        </div>

        {/* Sibling Constellation Pill Dock */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {state.allMembers.map((m) => {
            const isSelected = m.id === state.selectedConstellationId;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => globalFamilyRevealController.selectConstellation(m.id)}
                className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium transition-all ${
                  isSelected
                    ? "border border-cyan-300 bg-cyan-500/30 text-white shadow-[0_0_12px_rgba(0,229,255,0.4)]"
                    : m.isRevealed
                    ? "border border-white/20 bg-white/10 text-slate-200 hover:border-cyan-400/50 hover:bg-white/15"
                    : "border border-dashed border-white/10 bg-transparent text-slate-400 hover:border-white/30"
                }`}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor: m.isRevealed ? state.familyColorStr : "#64748B",
                  }}
                />
                {m.name}
              </button>
            );
          })}
        </div>

        {/* Expandable Myth & Lore Card */}
        {showLore && (
          <div className="mt-3 rounded-lg border border-white/10 bg-black/40 p-3 text-xs leading-relaxed text-slate-200">
            <div className="font-semibold text-cyan-200">Mythological Theme:</div>
            <p className="mt-1">{state.mythTheme}</p>
            {state.hullReady && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-300">
                <Sparkles className="h-3 w-3" />
                <span>Enclosing 3D celestial family hull unlocked on deep sky dome.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Help Tooltip / Instructions */}
      <div className="pointer-events-auto mx-auto mb-2 flex items-center gap-3 rounded-full border border-white/10 bg-slate-950/80 px-4 py-1.5 text-center font-mono text-[11px] text-white/70 backdrop-blur-sm">
        <span>Click constellations or stars in any sequence</span>
        <span className="text-white/30">·</span>
        <span>Left/Right Arrow: Navigate members</span>
        <span className="text-white/30">·</span>
        <span className="text-amber-300">ESC: Reset</span>
      </div>
    </div>
  );
}
