import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CHECKLIST,
  CONTRACT_PAY,
  FPV_RATE_PER_SEC,
  HABITAT_STEPS,
  LAUNCH_PRICE,
  OXYGEN_PRICE_PER_KG,
  SAVE_KEY,
  SAVE_VERSION,
  STARTING_CREDITS,
  plantOxygenTotal,
  plantSteps,
  landingSteps,
  type DestinationId,
  type RocketId,
  type Screen,
} from "./data";

export interface Mission {
  rocket: RocketId;
  destination: DestinationId;
  paid: number;
}

type ChecklistState = Record<string, boolean>;

function emptyChecklist(): ChecklistState {
  return Object.fromEntries(CHECKLIST.map((c) => [c.id, false]));
}

export interface GameState {
  version: number;
  commander: string;
  credits: number;
  oxygenKg: number;
  habitats: number;
  missionsDone: number;
  unlockedTopics: string[];
  reducedMotion: boolean;
  hasLaunchedOnce: boolean;
  screen: Screen;
  mission: Mission | null;
  checklist: ChecklistState;
  fuelLox: number;
  fuelCh4: number;
  gyro: number;
  windKnots: number;
  plantStep: number;
  habitatStep: number;
  landingStep: number;
  fpvOpen: boolean;
  fpvSpent: number;
  libraryOpen: boolean;
  libraryId: string | null;
  debrief: { pay: number; oxygen: number; spentFpv: number } | null;
  hydrated: boolean;
  orbitalSpeed: number;
  cameraDepth: "surface" | "orbital" | "deep";
  cameraZoom: number;
  cockpitToggles: Record<string, boolean>;

  setHydrated: () => void;
  setCommander: (name: string) => void;
  setReducedMotion: (v: boolean) => void;
  go: (screen: Screen) => void;
  openLibrary: (id?: string) => void;
  closeLibrary: () => void;
  markTopic: (id: string) => void;
  selectMission: (rocket: RocketId, destination: DestinationId) => boolean;
  setCheck: (id: string, value: boolean) => void;
  setFuel: (lox: number, ch4: number) => void;
  setGyro: (n: number) => void;
  pollWeather: () => void;
  allGo: () => boolean;
  beginLaunch: () => void;
  finishLaunch: () => void;
  openFpv: () => boolean;
  closeFpv: () => void;
  billFpv: (dt: number) => void;
  beginLanding: () => void;
  advanceLanding: () => void;
  advancePlant: () => void;
  advanceHabitat: () => void;
  completeMission: () => void;
  resetPad: () => void;
  abortFromPad: () => void;
  resetProgress: () => void;
  setOrbitalSpeed: (v: number) => void;
  setCameraZoom: (v: number) => void;
  toggleCockpit: (id: string) => void;
}

const persistedKeys = [
  "version",
  "commander",
  "credits",
  "oxygenKg",
  "habitats",
  "missionsDone",
  "unlockedTopics",
  "reducedMotion",
  "hasLaunchedOnce",
  "screen",
  "mission",
  "checklist",
  "fuelLox",
  "fuelCh4",
  "gyro",
  "windKnots",
  "plantStep",
  "habitatStep",
  "landingStep",
  "fpvSpent",
  "debrief",
] as const;

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      version: SAVE_VERSION,
      commander: "",
      credits: STARTING_CREDITS,
      oxygenKg: 0,
      habitats: 0,
      missionsDone: 0,
      unlockedTopics: [],
      reducedMotion: false,
      hasLaunchedOnce: false,
      screen: "briefing",
      mission: null,
      checklist: emptyChecklist(),
      fuelLox: 0,
      fuelCh4: 0,
      gyro: 0,
      windKnots: 42,
      plantStep: 0,
      habitatStep: 0,
      landingStep: 0,
      fpvOpen: false,
      fpvSpent: 0,
      libraryOpen: false,
      libraryId: null,
      debrief: null,
      hydrated: false,
      orbitalSpeed: 1,
      cameraDepth: "surface",
      cameraZoom: 0,
      cockpitToggles: {
        orbitMap: true,
        countdown: true,
        distance: true,
        phase: true,
        attitude: true,
        mfd: true,
        target: true,
        lesson: true,
      },

      setHydrated: () => {
        const s = get();
        set({
          hydrated: true,
          fpvOpen: false,
          screen: s.commander ? (s.screen === "briefing" ? "hq" : s.screen) : "briefing",
        });
      },
      setCommander: (name) =>
        set({ commander: name.trim() || "Cadet", screen: "hq" }),
      setReducedMotion: (v) => set({ reducedMotion: v }),
      go: (screen) => set({ screen, fpvOpen: false, libraryOpen: false }),
      openLibrary: (id) => {
        if (id) get().markTopic(id);
        set({ libraryOpen: true, libraryId: id ?? get().libraryId ?? "why-oxygen" });
      },
      closeLibrary: () => set({ libraryOpen: false }),
      markTopic: (id) => {
        const have = get().unlockedTopics;
        if (!have.includes(id)) set({ unlockedTopics: [...have, id] });
      },
      selectMission: (rocket, destination) => {
        const price = LAUNCH_PRICE[rocket][destination];
        if (get().credits < price) return false;
        set({
          credits: get().credits - price,
          mission: { rocket, destination, paid: price },
          checklist: emptyChecklist(),
          fuelLox: 0,
          fuelCh4: 0,
          gyro: 0,
          windKnots: 38 + Math.round(Math.random() * 16),
          plantStep: 0,
          habitatStep: 0,
          landingStep: 0,
          fpvSpent: 0,
          debrief: null,
          screen: "pad",
        });
        return true;
      },
      setCheck: (id, value) =>
        set({ checklist: { ...get().checklist, [id]: value } }),
      setFuel: (lox, ch4) => {
        const fuelLox = Math.min(100, Math.max(0, lox));
        const fuelCh4 = Math.min(100, Math.max(0, ch4));
        set({
          fuelLox,
          fuelCh4,
          checklist: {
            ...get().checklist,
            fuel: fuelLox >= 100 && fuelCh4 >= 100,
          },
        });
      },
      setGyro: (n) => {
        const gyro = Math.min(100, Math.max(0, n));
        set({
          gyro,
          checklist: { ...get().checklist, guidance: gyro >= 100 },
        });
      },
      pollWeather: () => {
        const next = Math.max(8, get().windKnots - (8 + Math.random() * 10));
        set({
          windKnots: next,
          checklist: { ...get().checklist, weather: next < 20 },
        });
      },
      allGo: () => CHECKLIST.every((c) => get().checklist[c.id]),
      beginLaunch: () => {
        if (!get().allGo()) return;
        set({ screen: "launch", hasLaunchedOnce: true });
      },
      finishLaunch: () => set({ screen: "cruise", fpvOpen: false }),
      openFpv: () => {
        if (get().credits < FPV_RATE_PER_SEC) return false;
        set({ fpvOpen: true });
        return true;
      },
      closeFpv: () => set({ fpvOpen: false }),
      billFpv: (dt) => {
        if (!get().fpvOpen) return;
        if (typeof document !== "undefined" && document.hidden) return;
        const cost = FPV_RATE_PER_SEC * dt;
        const credits = get().credits - cost;
        if (credits <= 0) {
          set({
            credits: 0,
            fpvOpen: false,
            fpvSpent: get().fpvSpent + get().credits,
          });
          return;
        }
        set({ credits, fpvSpent: get().fpvSpent + cost });
      },
      beginLanding: () => set({ fpvOpen: false, screen: "landing", landingStep: 0 }),
      advanceLanding: () => {
        const m = get().mission;
        if (!m) return;
        const steps = landingSteps(m.destination);
        const cur = get().landingStep;
        const step = steps[cur];
        if (step?.libraryId) get().markTopic(step.libraryId);
        const next = cur + 1;
        if (next >= steps.length) set({ landingStep: next, screen: "surface", fpvOpen: false });
        else set({ landingStep: next });
      },
      advancePlant: () => {
        const m = get().mission;
        if (!m) return;
        const steps = plantSteps(m.destination);
        const next = Math.min(steps.length, get().plantStep + 1);
        const step = steps[get().plantStep];
        if (step?.libraryId) get().markTopic(step.libraryId);
        set({
          plantStep: next,
          oxygenKg: get().oxygenKg + (step?.oxygenKg ?? 0),
        });
        if (next >= steps.length) {
          if (m.rocket === "crewmark") set({ screen: "habitat" });
          else get().completeMission();
        }
      },
      advanceHabitat: () => {
        const next = Math.min(HABITAT_STEPS.length, get().habitatStep + 1);
        const step = HABITAT_STEPS[get().habitatStep];
        if (step?.libraryId) get().markTopic(step.libraryId);
        set({ habitatStep: next });
        if (next >= HABITAT_STEPS.length) get().completeMission();
      },
      completeMission: () => {
        const m = get().mission;
        if (!m) return;
        const oxygen = plantOxygenTotal(m.destination);
        const pay =
          CONTRACT_PAY[m.rocket][m.destination] + oxygen * OXYGEN_PRICE_PER_KG;
        const habitats = get().habitats + (m.rocket === "crewmark" ? 1 : 0);
        set({
          credits: get().credits + pay,
          habitats,
          missionsDone: get().missionsDone + 1,
          debrief: { pay, oxygen, spentFpv: Math.round(get().fpvSpent) },
          screen: "debrief",
          fpvOpen: false,
          mission: m,
        });
      },
      resetPad: () =>
        set({
          checklist: emptyChecklist(),
          fuelLox: 0,
          fuelCh4: 0,
          gyro: 0,
          windKnots: 40,
        }),
      abortFromPad: () => {
        const m = get().mission;
        const refund = m && get().screen === "pad" ? m.paid : 0;
        set({
          credits: get().credits + refund,
          mission: null,
          checklist: emptyChecklist(),
          screen: "hq",
          fpvOpen: false,
        });
      },
      setOrbitalSpeed: (v) => set({ orbitalSpeed: Math.max(0, v) }),
      setCameraZoom: (v) => {
        const zoom = Math.max(0, Math.min(1, v));
        const depth: "surface" | "orbital" | "deep" =
          zoom < 0.35 ? "surface" : zoom < 0.7 ? "orbital" : "deep";
        set({ cameraZoom: zoom, cameraDepth: depth });
      },
      toggleCockpit: (id) => {
        const cur = get().cockpitToggles;
        set({ cockpitToggles: { ...cur, [id]: !cur[id] } });
      },
      resetProgress: () =>
        set({
          commander: get().commander,
          credits: STARTING_CREDITS,
          oxygenKg: 0,
          habitats: 0,
          missionsDone: 0,
          unlockedTopics: [],
          hasLaunchedOnce: false,
          screen: "hq",
          mission: null,
          checklist: emptyChecklist(),
          plantStep: 0,
          habitatStep: 0,
          landingStep: 0,
          fpvOpen: false,
          fpvSpent: 0,
          debrief: null,
        }),
    }),
    {
      name: SAVE_KEY,
      version: SAVE_VERSION,
      skipHydration: true,
      partialize: (s) => {
        const out: Record<string, unknown> = {};
        for (const k of persistedKeys) out[k] = s[k];
        return out as never;
      },
    },
  ),
);
