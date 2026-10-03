import { useMemo, useState } from "react";
import {
  CONSTELLATION_FAMILIES,
  CONSTELLATIONS_88,
  getConstellationByName,
  listFamiliesOrdered,
  searchConstellations,
  type ConstellationEntry,
  type MenzelFamilyId,
} from "@/game/constellations";
import { NAMED_STARS } from "@/game/cosmos";
import { setSelectedConstellation } from "./three/constellationFocus";
import { Search, Stars, ChevronDown, ChevronRight, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type StarHit = {
  id: string;
  name: string;
  constellation?: string;
  dist?: string;
  spectral?: string;
  blurb?: string;
};

/**
 * Interactive browser for all 88 IAU constellations (Menzel families)
 * plus search across named catalog stars.
 */
export function ConstellationMenu({
  open,
  onClose,
  compact = false,
}: {
  open: boolean;
  onClose: () => void;
  compact?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [familyFilter, setFamilyFilter] = useState<MenzelFamilyId | "all">("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ zodiac: true, orion: true });

  const constellationHits = useMemo(() => {
    let list = searchConstellations(query);
    if (familyFilter !== "all") list = list.filter((c) => c.familyId === familyFilter);
    return list;
  }, [query, familyFilter]);

  const starHits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as StarHit[];
    return NAMED_STARS.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.constellation && s.constellation.toLowerCase().includes(q)) ||
        (s.catalogNames && s.catalogNames.some((n) => n.toLowerCase().includes(q))),
    )
      .slice(0, 12)
      .map((s) => ({
        id: s.id,
        name: s.name,
        constellation: s.constellation,
        dist: s.dist,
        spectral: s.spectral,
        blurb: s.blurb,
      }));
  }, [query]);

  const grouped = useMemo(() => {
    const order = listFamiliesOrdered();
    const map = new Map<MenzelFamilyId, ConstellationEntry[]>();
    for (const id of order) map.set(id, []);
    for (const c of constellationHits) {
      const arr = map.get(c.familyId) ?? [];
      arr.push(c);
      map.set(c.familyId, arr);
    }
    return order
      .map((id) => ({ id, family: CONSTELLATION_FAMILIES[id], items: map.get(id) ?? [] }))
      .filter((g) => g.items.length > 0);
  }, [constellationHits]);

  if (!open) return null;

  const selectConstellation = (entry: ConstellationEntry) => {
    setSelectedConstellation(entry.id);
  };

  const selectStar = (hit: StarHit) => {
    if (hit.constellation) {
      const c = getConstellationByName(hit.constellation);
      if (c) setSelectedConstellation(c.id);
    }
  };

  return (
    <div
      className={`pointer-events-auto absolute z-40 flex flex-col overflow-hidden rounded-xl border border-cyan-200/25 bg-slate-950/95 shadow-2xl backdrop-blur-md ${
        compact
          ? "left-3 top-12 w-[min(100%,18rem)] max-h-[min(70dvh,28rem)]"
          : "left-3 top-12 w-[min(100%,22rem)] max-h-[min(78dvh,36rem)]"
      }`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Stars className="size-4 text-cyan-200" />
          <div>
            <p className="font-display text-sm font-semibold text-fg">Sky atlas</p>
            <p className="font-mono text-[10px] text-muted">88 constellations · named stars</p>
          </div>
        </div>
        <button type="button" aria-label="Close sky atlas" className="rounded p-1 text-slate-400 hover:text-white" onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      <div className="border-b border-white/10 px-3 py-2">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Orion, Sirius, Vega…"
            className="w-full rounded-md border border-white/10 bg-black/40 py-2 pl-8 pr-3 text-xs text-fg outline-none ring-cyan-400/30 placeholder:text-slate-500 focus:ring-1"
          />
        </label>
        <div className="mt-2 flex flex-wrap gap-1">
          <FilterChip active={familyFilter === "all"} onClick={() => setFamilyFilter("all")} label="All" />
          {listFamiliesOrdered().map((id) => (
            <FilterChip
              key={id}
              active={familyFilter === id}
              onClick={() => setFamilyFilter(id)}
              label={CONSTELLATION_FAMILIES[id].name.replace(" Family", "")}
            />
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {starHits.length > 0 && (
          <div className="mb-3">
            <p className="px-1.5 font-mono text-[10px] uppercase tracking-wider text-cyan-200/80">Stars</p>
            <ul className="mt-1 space-y-1">
              {starHits.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => selectStar(s)}
                    className="flex w-full flex-col rounded-lg border border-transparent px-2.5 py-1.5 text-left hover:border-cyan-200/20 hover:bg-cyan-400/10"
                  >
                    <span className="text-xs font-medium text-fg">{s.name}</span>
                    <span className="font-mono text-[10px] text-muted">
                      {s.constellation ?? "—"} · {s.dist ?? "—"}
                      {s.spectral ? ` · ${s.spectral}` : ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {grouped.length === 0 && (
          <p className="px-2 py-6 text-center text-xs text-muted">No constellations match “{query}”.</p>
        )}

        {grouped.map(({ id, family, items }) => {
          const isOpen = expanded[id] ?? false;
          return (
            <div key={id} className="mb-1.5">
              <button
                type="button"
                className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left hover:bg-white/5"
                onClick={() => setExpanded((e) => ({ ...e, [id]: !isOpen }))}
              >
                {isOpen ? <ChevronDown className="size-3.5 text-slate-400" /> : <ChevronRight className="size-3.5 text-slate-400" />}
                <span className="flex-1 text-xs font-semibold text-fg">{family.name}</span>
                <Badge className="font-mono text-[9px]">{items.length}</Badge>
              </button>
              {isOpen && (
                <ul className="ml-2 space-y-0.5 border-l border-white/10 pl-2">
                  {items.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => selectConstellation(c)}
                        className="flex w-full flex-col rounded-md px-2 py-1.5 text-left hover:bg-cyan-400/10"
                      >
                        <span className="flex items-center gap-1.5 text-xs text-fg">
                          {c.name}
                          {c.familyId === "zodiac" && (
                            <span className="rounded bg-accent/15 px-1 font-mono text-[9px] text-accent">zodiac</span>
                          )}
                        </span>
                        <span className="font-mono text-[10px] text-muted">
                          {c.keyStar.name} · {c.keyStar.distanceLy} ly
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <div className="border-t border-white/10 px-3 py-2 font-mono text-[10px] text-muted">
        {CONSTELLATIONS_88.length} IAU figures · click to open details
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-2 py-0.5 text-[10px] ${
        active ? "border-cyan-300/40 bg-cyan-400/15 text-cyan-100" : "border-white/10 text-slate-400 hover:text-fg"
      }`}
    >
      {label}
    </button>
  );
}

/** Toggle button for sky scenes */
export function ConstellationMenuToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <Button
      type="button"
      size="sm"
      variant={open ? "primary" : "secondary"}
      className="pointer-events-auto absolute right-3 top-3 z-30 gap-1.5 font-mono text-[11px]"
      onClick={onToggle}
    >
      <Stars className="size-3.5" />
      {open ? "Hide atlas" : "88 constellations"}
    </Button>
  );
}
