/** Shared target focus for 3D hover cards and the cockpit target-lock HUD. */
let hoveredTargetId: string | null = null;
let lockedTargetId: string | null = null;

export function resetTargetFocus(missionTarget: string) {
  hoveredTargetId = null;
  lockedTargetId = missionTarget;
}

export function setHoveredTarget(id: string | null) {
  hoveredTargetId = id;
}

export function clearHoveredTarget(id: string) {
  if (hoveredTargetId === id) hoveredTargetId = null;
}

export function toggleLockedTarget(id: string) {
  lockedTargetId = lockedTargetId === id ? null : id;
}

export function getTargetFocus(fallback: string) {
  return {
    id: hoveredTargetId ?? lockedTargetId ?? fallback,
    lockedId: lockedTargetId,
  };
}
