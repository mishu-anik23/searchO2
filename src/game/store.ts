import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CHECKLIST,
  CONTRACT_PAY,
  FPV_RATE_PER_SEC,
  LAUNCH_PRICE,
  OXYGEN_PRICE_PER_KG,
  SAVE_KEY,
  SAVE_VERSION,
  STARTING_CREDITS,
  habitatSteps,
  plantOxygenTotal,
  plantSteps,
  landingSteps,
  type DestinationId,
  type RocketId,
  type Screen,
} from "./data";
import { CREW_ROSTER, CREW_SEAT_LIMIT } from "./crew";
import { layerV2ForStep, type CivPhase } from "./civ-v2";
import type { MarsSiteId } from "./mars";

export interface Mission {
  rocket: RocketId;
  destination: DestinationId;
  paid: number;
}

type ChecklistState = Record<string, boolean>;

export type TopicStamp = "unread" | "opened" | "stamped";

export interface LayerProgress {
  phase: CivPhase;
  whyCorrectFirst: boolean;
  whyAttempts: number;
  libraryDone: boolean;
  fieldDone: boolean;
  rxpEarned: number;
}

function freshLayer(): LayerProgress {
  return {
    phase: "why",
    whyCorrectFirst: false,
    whyAttempts: 0,
    libraryDone: false,
    fieldDone: false,
    rxpEarned: 0,
  };
}

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
  topicStamps: Record<string, TopicStamp>;
  researchXp: number;
  layerProgress: LayerProgress;
  libraryGateActive: boolean;
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
  landingSite: MarsSiteId | null;
  fpvOpen: boolean;
  fpvSpent: number;
  libraryOpen: boolean;
  libraryId: string | null;
  debrief: { pay: number; oxygen: number; spentFpv: number; researchXp?: number; stamps?: { id: string; status: TopicStamp }[] } | null;
  hydrated: boolean;
  orbitalSpeed: number;
  cameraDepth: "surface" | "orbital" | "deep";
  cameraZoom: number;
  cockpitToggles: Record<string, boolean>;
  /** Crew ids already hired (paid once). Commander always included. */
  crewHired: string[];
  /** Up to 3 seats for the next Crewmark flight (ordered). */
  crewSeats: string[];

  setHydrated: () => void;
  setCommander: (name: string) => void;
  setReducedMotion: (v: boolean) => void;
  go: (screen: Screen) => void;
  openLibrary: (id?: string) => void;
  closeLibrary: () => void;
  markTopic: (id: string) => void;
  stampTopic: (id: string) => void;
  answerWhy: (correct: boolean) => void;
  completeLibraryGate: () => void;
  completeFieldTask: () => void;
  buildLayer: () => void;
  hireCrew: (id: string) => boolean;
  toggleCrewSeat: (id: string) => void;
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
  selectLandingSite: (id: MarsSiteId) => void;
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
  "crewHired",
  "crewSeats",
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
      topicStamps: {},
      researchXp: 0,
      layerProgress: freshLayer(),
      libraryGateActive: false,
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
      landingSite: null,
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
      crewHired: ["cmd-self"],
      crewSeats: ["cmd-self"],

      setHydrated: () => {
        const s = get();
        set({
          hydrated: true,
          fpvOpen: false,
          screen: s.commander ? (s.screen === "briefing" ? "hq" : s.screen) : "briefing",
          crewHired: s.crewHired?.length ? s.crewHired : ["cmd-self"],
          crewSeats: s.crewSeats?.length ? s.crewSeats : ["cmd-self"],
        });
      },
      setCommander: (name) =>
        set({ commander: name.trim() || "Cadet", screen: "hq" }),
      setReducedMotion: (v) => set({ reducedMotion: v }),
      go: (screen) => set({ screen, fpvOpen: false, libraryOpen: false }),
      hireCrew: (id) => {
        const member = CREW_ROSTER.find((c) => c.id === id);
        if (!member) return false;
        const s = get();
        if (s.crewHired.includes(id)) return true;
        if (s.missionsDone < member.unlockAfterMissions) return false;
        if (member.hireCost > 0 && s.credits < member.hireCost) return false;
        set({
          credits: s.credits - member.hireCost,
          crewHired: [...s.crewHired, id],
        });
        return true;
      },
      toggleCrewSeat: (id) => {
        const s = get();
        if (!s.crewHired.includes(id) && id !== "cmd-self") return;
        if (s.crewSeats.includes(id)) {
          const next = s.crewSeats.filter((x) => x !== id);
          set({ crewSeats: next.length ? next : ["cmd-self"] });
          return;
        }
        if (s.crewSeats.length >= CREW_SEAT_LIMIT) return;
        set({ crewSeats: [...s.crewSeats, id] });
      },
      openLibrary: (id) => {
        if (id) get().markTopic(id);
        set({ libraryOpen: true, libraryId: id ?? get().libraryId ?? "why-oxygen" });
      },
      closeLibrary: () => set({ libraryOpen: false }),
      markTopic: (id) => {
        const have = get().unlockedTopics;
        const stamps = { ...get().topicStamps };
        if (!have.includes(id)) {
          stamps[id] = stamps[id] ?? "opened";
          set({ unlockedTopics: [...have, id], topicStamps: stamps });
        } else if (!stamps[id] || stamps[id] === "unread") {
          stamps[id] = "opened";
          set({ topicStamps: stamps });
        }
      },
      stampTopic: (id) => {
        const have = get().unlockedTopics;
        const stamps = { ...get().topicStamps, [id]: "stamped" as TopicStamp };
        const unlocked = have.includes(id) ? have : [...have, id];
        set({ topicStamps: stamps, unlockedTopics: unlocked });
      },
      answerWhy: (correct) => {
        const lp = get().layerProgress ?? freshLayer();
        const attempts = lp.whyAttempts + 1;
        if (!correct) {
          set({ layerProgress: { ...lp, whyAttempts: attempts, whyCorrectFirst: false } });
          return;
        }
        set({
          layerProgress: {
            ...lp,
            whyAttempts: attempts,
            whyCorrectFirst: attempts === 1,
            phase: "library",
          },
        });
      },
      completeLibraryGate: () => {
        const m = get().mission;
        const steps = habitatSteps(m?.destination ?? "moon");
        const step = steps[get().habitatStep];
        if (step?.libraryId) get().stampTopic(step.libraryId);
        const lp = get().layerProgress ?? freshLayer();
        set({
          layerProgress: { ...lp, libraryDone: true, phase: "field" },
          libraryOpen: false,
          libraryGateActive: false,
        });
      },
      completeFieldTask: () => {
        const lp = get().layerProgress ?? freshLayer();
        set({ layerProgress: { ...lp, fieldDone: true, phase: "ready" } });
      },
      buildLayer: () => {
        const m = get().mission;
        if (!m) return;
        const steps = habitatSteps(m.destination);
        const idx = get().habitatStep;
        const step = steps[idx];
        const lp = get().layerProgress ?? freshLayer();
        const v2 = step ? layerV2ForStep(step.id) : undefined;
        let gained = 0;
        if (v2) {
          if (lp.whyCorrectFirst) gained += v2.rxp.whyFirstTry;
          if (lp.libraryDone) gained += v2.rxp.library;
          if (lp.fieldDone) gained += v2.rxp.field;
          if (v2.rxp.siteBonus) gained += v2.rxp.siteBonus;
        } else {
          gained = 20;
        }
        if (step?.libraryId) get().markTopic(step.libraryId);
        const next = Math.min(steps.length, idx + 1);
        set({
          habitatStep: next,
          researchXp: (get().researchXp ?? 0) + gained,
          layerProgress: next >= steps.length ? { ...freshLayer(), phase: "done" } : freshLayer(),
        });
        if (next >= steps.length) get().completeMission();
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
          layerProgress: freshLayer(),
          libraryGateActive: false,
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
      beginLanding: () => set({ fpvOpen: false, screen: "landing", landingStep: 0, landingSite: null }),
      selectLandingSite: (id) => set({ landingSite: id }),
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
        const m = get().mission;
        const steps = habitatSteps(m?.destination ?? "moon");
        const next = Math.min(steps.length, get().habitatStep + 1);
        const step = steps[get().habitatStep];
        if (step?.libraryId) get().markTopic(step.libraryId);
        set({ habitatStep: next, layerProgress: freshLayer() });
        if (next >= steps.length) get().completeMission();
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
          debrief: {
            pay,
            oxygen,
            spentFpv: Math.round(get().fpvSpent),
            researchXp: get().researchXp ?? 0,
            stamps: Object.entries(get().topicStamps ?? {}).map(([id, status]) => ({ id, status })),
          },
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
          layerProgress: freshLayer(),
          libraryGateActive: false,
          fpvOpen: false,
          fpvSpent: 0,
          debrief: null,
          crewHired: ["cmd-self"],
          crewSeats: ["cmd-self"],
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
