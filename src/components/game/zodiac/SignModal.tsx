import type { ZodiacSign } from "@/game/astro-core/zodiacSigns";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function SignModal({ sign, onClose }: { sign: ZodiacSign; onClose: () => void }) {
  const [tab, setTab] = useState<"geometry" | "symbolic">("geometry");
  return (
    <div className="pointer-events-auto absolute inset-x-3 bottom-3 z-20 mx-auto max-w-lg rounded-xl border border-cyan-200/30 bg-slate-950/95 p-4 shadow-2xl backdrop-blur">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-cyan-200">Tropical sign</p>
          <h3 className="font-display text-xl font-semibold text-fg">
            {sign.symbol} {sign.name}
          </h3>
          <p className="mt-0.5 font-mono text-[11px] text-muted">
            λ ∈ [{sign.startDeg}°, {sign.endDeg}°) · {sign.element} · {sign.modality}
          </p>
        </div>
        <button type="button" aria-label="Close" className="text-slate-400 hover:text-white" onClick={onClose}>
          <X size={16} />
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" variant={tab === "geometry" ? "primary" : "secondary"} onClick={() => setTab("geometry")}>
          [GEOMETRY]
        </Button>
        <Button size="sm" variant={tab === "symbolic" ? "primary" : "secondary"} onClick={() => setTab("symbolic")}>
          [SYMBOLIC]
        </Button>
      </div>
      {tab === "geometry" ? (
        <div className="mt-3 space-y-2 text-sm leading-relaxed text-slate-300">
          <p className="rounded border border-cyan-500/30 bg-cyan-500/10 p-2 text-xs">
            <span className="font-mono text-[10px] text-cyan-200">[GEOMETRY] </span>
            {sign.geometryNote}
          </p>
          <p className="text-xs text-muted">
            Tropical signs are equal 30° sectors locked to the equinox, not to the star patterns of the same name. Precession has shifted the constellations by ~24° since classical catalogs.
          </p>
        </div>
      ) : (
        <div className="mt-3 space-y-2 text-sm leading-relaxed text-slate-300">
          <p className="rounded border border-orange-400/30 bg-orange-400/10 p-2 text-xs">
            <span className="font-mono text-[10px] text-orange-200">[SYMBOLIC] </span>
            Keywords: {sign.symbolic.keywords.join(" · ")}
          </p>
          <p className="text-xs">{sign.symbolic.mythology}</p>
          <p className="text-[10px] text-muted">Sources (tradition, not physics): {sign.symbolic.sourceRefs.join("; ")}</p>
          <p className="text-[10px] italic text-muted">
            Symbolic language does not imply predictive power. See Prediction Lab for empirical tests.
          </p>
        </div>
      )}
    </div>
  );
}
