import { useEffect } from "react";
import { useGame } from "@/game/store";
import { Chrome } from "./Chrome";
import { LibraryPanel } from "./LibraryPanel";
import { Briefing } from "./Briefing";
import { HQ } from "./HQ";
import { Planner } from "./Planner";
import { LaunchPad } from "./LaunchPad";
import { Cruise } from "./Cruise";
import { Landing } from "./Landing";
import { Surface, Habitat } from "./Surface";
import { Debrief } from "./Debrief";
import { FPVView } from "./FPVView";
import { warmupPhotos } from "@/game/cosmos";

export function GameApp() {
  const setHydrated = useGame((s) => s.setHydrated);
  const screen = useGame((s) => s.screen);
  const fpvOpen = useGame((s) => s.fpvOpen);
  const mission = useGame((s) => s.mission);
  const openLibrary = useGame((s) => s.openLibrary);
  const setReducedMotion = useGame((s) => s.setReducedMotion);
  const hydrated = useGame((s) => s.hydrated);

  useEffect(() => {
    warmupPhotos();
    let alive = true;
    void Promise.resolve(useGame.persist.rehydrate()).finally(() => {
      if (alive) setHydrated();
    });
    if (import.meta.env.DEV) {
      window.__game = useGame;
    }
    return () => {
      alive = false;
      delete window.__game;
    };
  }, [setHydrated]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [setReducedMotion]);

  useEffect(() => {
    const save = () => {
      useGame.setState((s) => ({ credits: s.credits }));
    };
    const vis = () => {
      if (document.hidden) save();
    };
    document.addEventListener("visibilitychange", vis);
    window.addEventListener("pagehide", save);
    return () => {
      document.removeEventListener("visibilitychange", vis);
      window.removeEventListener("pagehide", save);
    };
  }, []);

  if (!hydrated) {
    return <div className="min-h-dvh bg-bg" />;
  }

  if (screen === "briefing") {
    return (
      <>
        <Briefing />
        <LibraryPanel />
      </>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <Chrome onLibrary={() => openLibrary()} />
      <div className="flex-1">
        {screen === "hq" && <HQ />}
        {screen === "plan" && <Planner />}
        {(screen === "pad" || screen === "launch") && <LaunchPad />}
        {screen === "cruise" && <Cruise />}
        {screen === "landing" && <Landing />}
        {screen === "surface" && <Surface />}
        {screen === "habitat" && <Habitat />}
        {screen === "debrief" && <Debrief />}
      </div>
      <LibraryPanel />
      {fpvOpen && mission && <FPVView destination={mission.destination} />}
    </div>
  );
}

declare global {
  interface Window {
    __game?: typeof useGame;
  }
}
