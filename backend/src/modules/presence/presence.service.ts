/**
 * In-memory presence for currently active players.
 * Heartbeats expire after TTL; admin dashboard polls getLive().
 * Optional coarse region only (no precise GPS) — GDPR minimisation.
 */

export type PresenceEntry = {
  sessionId: string;
  userId?: string | null;
  displayName: string;
  role: string;
  regionCode: string;
  countryCode?: string;
  lat?: number;
  lon?: number;
  path?: string;
  deviceType?: string;
  lastSeen: number;
};

const TTL_MS = 3 * 60 * 1000; // 3 minutes without heartbeat → offline
const store = new Map<string, PresenceEntry>();

/** Approximate map pins for known SearchO2 regions (coarse). */
export const REGION_COORDS: Record<string, { lat: number; lon: number; label: string; countryCode: string }> = {
  germany: { lat: 51.16, lon: 10.45, label: 'Germany · Central Farm', countryCode: 'DE' },
  bavaria: { lat: 47.95, lon: 11.35, label: 'Bavaria · Alpenhof', countryCode: 'DE' },
  saint_martin: { lat: 20.627, lon: 92.323, label: 'St. Martin · Blue Lab', countryCode: 'BD' },
  sweden: { lat: 60.12, lon: 18.64, label: 'Sweden', countryCode: 'SE' },
  brazil: { lat: -3.46, lon: -62.22, label: 'Brazil', countryCode: 'BR' },
  spain: { lat: 40.46, lon: -3.75, label: 'Spain', countryCode: 'ES' },
};

function purge() {
  const now = Date.now();
  for (const [k, v] of store) {
    if (now - v.lastSeen > TTL_MS) store.delete(k);
  }
}

export const presenceService = {
  heartbeat(input: {
    sessionId: string;
    userId?: string | null;
    displayName?: string;
    role?: string;
    regionCode?: string;
    path?: string;
    deviceType?: string;
  }): PresenceEntry {
    purge();
    const regionCode = (input.regionCode || 'germany').toLowerCase();
    const coords = REGION_COORDS[regionCode] || REGION_COORDS.germany;
    const entry: PresenceEntry = {
      sessionId: String(input.sessionId).slice(0, 64),
      userId: input.userId || null,
      displayName: (input.displayName || 'Player').slice(0, 80),
      role: (input.role || 'guest').slice(0, 32),
      regionCode,
      countryCode: coords.countryCode,
      lat: coords.lat,
      lon: coords.lon,
      path: (input.path || '/').slice(0, 128),
      deviceType: (input.deviceType || 'Desktop').slice(0, 32),
      lastSeen: Date.now(),
    };
    store.set(entry.sessionId, entry);
    return entry;
  },

  leave(sessionId: string) {
    store.delete(sessionId);
  },

  getLive(): {
    count: number;
    players: PresenceEntry[];
    byRegion: Record<string, number>;
    updatedAt: string;
  } {
    purge();
    const players = Array.from(store.values()).sort((a, b) => b.lastSeen - a.lastSeen);
    const byRegion: Record<string, number> = {};
    for (const p of players) {
      byRegion[p.regionCode] = (byRegion[p.regionCode] || 0) + 1;
    }
    return {
      count: players.length,
      players,
      byRegion,
      updatedAt: new Date().toISOString(),
    };
  },

  regions() {
    return REGION_COORDS;
  },
};
