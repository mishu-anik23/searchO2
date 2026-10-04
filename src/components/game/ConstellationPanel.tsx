import { useEffect, useState } from "react";
import {
  BIRTH_CHART_GUIDE,
  getConstellationById,
  getConstellationByName,
  getFamily,
  getFamilyMembers,
} from "@/game/constellations";
import { CONSTELLATIONS, NAMED_STARS } from "@/game/cosmos";
import {
  getSelectedConstellation,
  setSelectedConstellation,
  subscribeConstellation,
  stopFamilyAnimation,
} from "./three/constellationFocus";
import { useGame } from "@/game/store";
import { X, Sparkles, MapPin, Users, BookOpen, Star, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/** Library topic routing for constellation classroom cards */
function libraryTopicsFor(entry: {
  isZodiac?: boolean;
  birthChart?: { isZodiac?: boolean };
  familyId: string;
  name: string;
}): { id: string; label: string }[] {
  const isZodiac = entry.isZodiac ?? entry.birthChart?.isZodiac ?? entry.familyId === "zodiac";
  const topics: { id: string; label: string }[] = [
    { id: "orbits", label: "How orbits work" },
    { id: "distance", label: "Distance & light-time" },
  ];
  if (isZodiac) {
    topics.unshift({ id: "windows", label: "Ecliptic & seasons (windows)" });
  }
  if (entry.familyId === "orion" || entry.name === "Orion") {
    topics.push({ id: "hohmann", label: "Sky paths & aiming" });
  }
  return topics;
}

/** Overlay panel: constellation metadata + Menzel family + library deep-links. */
export function ConstellationPanel() {
  const [id, setId] = useState<string | null>(getSelectedConstellation());
  const openLibrary = useGame((s) => s.openLibrary);
  useEffect(() => subscribeConstellation(setId), []);

  if (!id) return null;
  const entry: any = getConstellationById(id) || getConstellationByName(id);
  if (!entry) return null;
  const family = getFamily(entry.familyId);
  const members = getFamilyMembers(entry.familyId);

  // Stars mapped in this constellation from deep-sky catalog
  const mappedStars = NAMED_STARS.filter(
    (s) => s.constellation?.toLowerCase() === entry.name.toLowerCase(),
  );
  const figureCount = CONSTELLATIONS.filter((c) => c.constellation === entry.name).length;
  const topics = libraryTopicsFor(entry);
  const isZodiac = entry.isZodiac ?? entry.birthChart?.isZodiac ?? entry.familyId === "zodiac";
  const birthChartNote =
    entry.birthChartNote ??
    (entry.birthChart
      ? `${entry.name} (${entry.birthChart.tropicalDates || "Ecliptic passage"}) · Element: ${entry.birthChart.element || "Sky"} · Ruler: ${entry.birthChart.rulingPlanet || "Sun"}`
      : "Part of the classical celestial sphere.");

  return (
    <div className="pointer-events-auto absolute bottom-3 right-3 z-30 max-h-[min(72dvh,34rem)] w-[min(100%,24rem)] overflow-y-auto rounded-xl border border-cyan-200/25 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-md">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-cyan-200/90">Constellation</p>
          <h2 className="font-display text-lg font-semibold text-fg">{entry.name}</h2>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <Badge tone="accent">{entry.familyName}</Badge>
            {isZodiac && <Badge>Zodiac / ecliptic</Badge>}
            <Badge className="font-mono text-[9px]">{mappedStars.length} mapped stars</Badge>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close constellation panel"
          className="rounded p-1 text-slate-400 hover:text-white"
          onClick={() => {
            stopFamilyAnimation();
            setSelectedConstellation(null);
          }}
        >
          <X size={16} />
        </button>
      </div>

      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-t border-white/10 pt-3 font-mono text-[11px]">
        <dt className="text-muted">Key star</dt>
        <dd className="text-fg">
          {entry.keyStar.name} · {entry.keyStar.distanceLy} ly
        </dd>
        <dt className="text-muted">Sky figure</dt>
        <dd className="text-fg">{figureCount} polyline segment{figureCount === 1 ? "" : "s"} in atlas</dd>
        <dt className="text-muted">Family size</dt>
        <dd className="text-fg">{members.length} Menzel members</dd>
      </dl>

      {mappedStars.length > 0 && (
        <section className="mt-3">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
            <Star className="size-3" /> Catalog stars in view
          </p>
          <ul className="mt-1.5 max-h-24 space-y-0.5 overflow-y-auto font-mono text-[10px] text-slate-300">
            {mappedStars.slice(0, 8).map((s) => (
              <li key={s.id}>
                {s.name} · {s.dist}
                {s.spectral ? ` · ${s.spectral}` : ""}
              </li>
            ))}
            {mappedStars.length > 8 && (
              <li className="text-muted">+{mappedStars.length - 8} more in field…</li>
            )}
          </ul>
        </section>
      )}

      <section className="mt-3">
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
          <MapPin className="size-3" /> Finding it from Earth
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-300">{entry.locatingDirections}</p>
      </section>

      <section className="mt-3 rounded-lg border border-white/10 bg-white/[.03] p-2.5">
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-orange-200/90">
          <BookOpen className="size-3" /> Cultural story (myth)
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-300">{entry.mythology}</p>
        <p className="mt-1 text-[10px] text-muted">Myths are human stories mapped onto star patterns — not physical causes.</p>
      </section>

      <section className="mt-3">
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
          <Users className="size-3" /> Menzel family grouping
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-300">{family.description}</p>
        <p className="mt-1 text-[11px] italic text-slate-400">{family.mythologicalTheme}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {members.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedConstellation(m.id)}
              className={`rounded-full border px-2 py-0.5 text-[10px] ${
                m.id === entry.id
                  ? "border-cyan-300/50 bg-cyan-400/15 text-cyan-100"
                  : "border-white/10 text-slate-400 hover:border-white/25 hover:text-fg"
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-lg border border-accent/20 bg-accent/5 p-2.5">
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
          <Sparkles className="size-3" /> Birth-chart literacy
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-300">{birthChartNote}</p>
        <p className="mt-2 text-[10px] leading-relaxed text-muted">{BIRTH_CHART_GUIDE.classroomNote}</p>
      </section>

      <section className="mt-3 border-t border-white/10 pt-3">
        <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-muted">Read more in library</p>
        <div className="flex flex-col gap-1">
          {topics.map((topic) => (
            <button
              key={topic.id}
              type="button"
              className="flex items-center gap-1.5 rounded-md border border-white/10 bg-black/30 px-2.5 py-1.5 text-left text-xs text-accent hover:border-accent/40 hover:bg-accent/10"
              onClick={() => openLibrary(topic.id)}
            >
              <ExternalLink className="size-3 shrink-0" />
              {topic.label}
            </button>
          ))}
        </div>
      </section>

      <Button
        size="sm"
        variant="secondary"
        className="mt-3 w-full"
        onClick={() => {
          stopFamilyAnimation();
          setSelectedConstellation(null);
        }}
      >
        Close
      </Button>
    </div>
  );
}

export function openConstellationByName(name: string) {
  const c = getConstellationByName(name);
  if (c) setSelectedConstellation(c.id);
}
