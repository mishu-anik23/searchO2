import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SUCCESS_SLIDES, type SuccessSlide } from "@/game/data";
import { useGame } from "@/game/store";
import { cn, formatKg } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function SuccessCarousel() {
  const reduced = useGame((s) => s.reducedMotion);
  const missionsDone = useGame((s) => s.missionsDone);
  const oxygenKg = useGame((s) => s.oxygenKg);
  const habitats = useGame((s) => s.habitats);
  const mission = useGame((s) => s.mission);
  const openLibrary = useGame((s) => s.openLibrary);

  const you: SuccessSlide | null =
    missionsDone > 0
      ? {
          id: "you",
          title: habitats ? "Habitat on the books" : "Oxygen in the tanks",
          kicker: `Your program · ${missionsDone} flight${missionsDone === 1 ? "" : "s"}`,
          body: habitats
            ? `A home is standing. ${formatKg(oxygenKg)} of local oxygen is stored. Crew no longer lives only on what left Earth.`
            : `The plant ran. ${formatKg(oxygenKg)} of oxygen is now a local resource, not a package from Earth.`,
          fact: mission
            ? `Last contract: ${mission.destination === "moon" ? "Moon" : "Mars"} on ${mission.rocket === "hauler" ? "Hauler-9" : "Crewmark-3"}.`
            : "Each closed contract pays in cash and in air.",
          src: mission?.destination === "mars" ? "/missions/mars-plant.webp" : "/missions/moon-landing.webp",
          libraryId: mission?.destination === "mars" ? "moxie" : "electrolysis",
        }
      : null;

  const slides: SuccessSlide[] = you ? [you, ...SUCCESS_SLIDES] : SUCCESS_SLIDES;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = slides[i % slides.length];

  useEffect(() => {
    if (reduced || paused) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % slides.length), 6500);
    return () => window.clearInterval(id);
  }, [reduced, paused, slides.length]);

  return (
    <section
      className="overflow-hidden rounded-xl border border-border bg-surface"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Mission successes"
    >
      <div className="relative aspect-[16/9] max-h-80 w-full overflow-hidden bg-raised sm:max-h-none sm:aspect-[2.2/1]">
        {slides.map((s, idx) => (
          <img
            key={s.id}
            src={s.src}
            alt=""
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
              idx === i % slides.length ? "opacity-100" : "opacity-0",
            )}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/35 to-transparent" />
        <div className="absolute left-3 right-3 top-3 flex items-center justify-between gap-2">
          <Badge tone="go">Success record</Badge>
          <span className="font-mono text-[0.65rem] tabular-nums text-fg/80">
            {String((i % slides.length) + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-accent">{slide.kicker}</p>
          <h2 className="mt-1 font-display text-xl font-semibold sm:text-2xl">{slide.title}</h2>
          <p className="mt-2 max-w-xl text-sm text-fg/85">{slide.body}</p>
          <p className="mt-2 max-w-xl font-mono text-xs text-muted">{slide.fact}</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2">
        <div className="flex items-center" role="tablist" aria-label="Slides">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={idx === i % slides.length}
              className="flex h-11 w-8 items-center justify-center"
              onClick={() => setI(idx)}
            >
              <span
                className={cn(
                  "h-2 rounded-full transition-[width,background-color] duration-200",
                  idx === i % slides.length ? "w-6 bg-accent" : "w-2 bg-border",
                )}
              />
              <span className="sr-only">{s.title}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-11"
            aria-label="Previous success"
            onClick={() => setI((n) => (n - 1 + slides.length) % slides.length)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-11"
            aria-label="Next success"
            onClick={() => setI((n) => (n + 1) % slides.length)}
          >
            <ChevronRight className="size-4" />
          </Button>
          <button
            type="button"
            className="hidden px-2 text-xs text-accent underline-offset-2 hover:underline sm:inline"
            onClick={() => openLibrary(slide.libraryId)}
          >
            Read the science
          </button>
        </div>
      </div>
    </section>
  );
}
