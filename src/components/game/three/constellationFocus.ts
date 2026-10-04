import { getConstellationById, getFamilyMembers, type MenzelFamilyId } from "@/game/constellations";

/**
 * Reactive focus & sequential animation manager for Menzel Constellation Families in FPV Cockpit.
 */
export interface ConstellationFocusState {
  selectedId: string | null;
  activeFamilyId: MenzelFamilyId | null;
  roamHighlightedId: string | null;
  animatingFamilyId: MenzelFamilyId | null;
  animStep: number;
  revealedConstellations: string[];
}

type FocusListener = (state: ConstellationFocusState) => void;

let state: ConstellationFocusState = {
  selectedId: null,
  activeFamilyId: null,
  roamHighlightedId: null,
  animatingFamilyId: null,
  animStep: 0,
  revealedConstellations: [],
};

const listeners = new Set<FocusListener>();
let animTimer: any = null;

function notify() {
  const snap = { ...state, revealedConstellations: [...state.revealedConstellations] };
  listeners.forEach((l) => l(snap));
}

export function getConstellationFocusState(): ConstellationFocusState {
  return state;
}

export function getSelectedConstellation(): string | null {
  return state.selectedId;
}

export function getRoamHighlightedConstellation(): string | null {
  return state.roamHighlightedId;
}

export function setRoamHighlight(id: string | null) {
  if (state.roamHighlightedId === id) return;
  state.roamHighlightedId = id;
  notify();
}

/**
 * Selects a constellation and automatically triggers the sequential group family myth visual animation.
 */
export function setSelectedConstellation(id: string | null) {
  if (animTimer) {
    clearInterval(animTimer);
    animTimer = null;
  }

  if (!id) {
    state.selectedId = null;
    state.activeFamilyId = null;
    state.animatingFamilyId = null;
    state.animStep = 0;
    state.revealedConstellations = [];
    notify();
    return;
  }

  const c = getConstellationById(id);
  if (!c) {
    state.selectedId = id;
    notify();
    return;
  }

  const familyId = c.familyId;
  const members = getFamilyMembers(familyId);
  const memberIds = members.map((m) => m.id);

  // Put the clicked constellation first in the reveal sequence
  const orderedIds = [c.id, ...memberIds.filter((mid) => mid !== c.id)];

  state.selectedId = c.id;
  state.activeFamilyId = familyId;
  state.animatingFamilyId = familyId;
  state.animStep = 1;
  state.revealedConstellations = [c.id];
  notify();

  // Sequential line & constellation connection timer (cascade every 380ms)
  let step = 1;
  animTimer = setInterval(() => {
    step++;
    if (step <= orderedIds.length) {
      state.animStep = step;
      state.revealedConstellations = orderedIds.slice(0, step);
      notify();
    } else {
      clearInterval(animTimer);
      animTimer = null;
      state.animatingFamilyId = null;
      notify();
    }
  }, 380);
}

export function subscribeConstellationFocus(listener: FocusListener): () => void {
  listeners.add(listener);
  listener({ ...state, revealedConstellations: [...state.revealedConstellations] });
  return () => {
    listeners.delete(listener);
  };
}

// Backward compatibility alias
export function subscribeConstellation(listener: (id: string | null) => void): () => void {
  const handler: FocusListener = (s) => listener(s.selectedId);
  listeners.add(handler);
  return () => {
    listeners.delete(handler);
  };
}

export type FamilyAnimState = {
  familyId: MenzelFamilyId;
  /** Wall-clock start for progressive draw */
  startedAt: number;
  /** When true, animation stays visible until closed */
  holding: boolean;
};

type FamilyListener = (state: FamilyAnimState | null) => void;

let familyAnim: FamilyAnimState | null = null;
const familyListeners = new Set<FamilyListener>();

export function getFamilyAnimation(): FamilyAnimState | null {
  return familyAnim;
}

/** Start family tour animation — cancels any previous family anim. */
export function playFamilyAnimation(familyId: MenzelFamilyId) {
  familyAnim = { familyId, startedAt: performance.now(), holding: true };
  familyListeners.forEach((l) => l(familyAnim));
}

export function stopFamilyAnimation() {
  familyAnim = null;
  familyListeners.forEach((l) => l(null));
}

export function subscribeFamilyAnimation(listener: FamilyListener): () => void {
  familyListeners.add(listener);
  listener(familyAnim);
  return () => {
    familyListeners.delete(listener);
  };
}

