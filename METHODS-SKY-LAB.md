# METHODS — Sky Lab / tropical chart engine

## Tags
- **[GEOMETRY]** — definitions and coordinate transforms (equinox, 30° sectors, ASC/MC formulas).
- **[EPHEMERIS]** — numerical positions in time (educational formulas here).
- **[SYMBOLIC]** — cultural/astrological language, not physics.
- **[EMPIRICAL]** — statistical tests against chance.

## Time
Julian Day from Gregorian UTC; GMST (IAU 1982 polynomial); LST = GMST + lon.

## Obliquity
Laskar-style mean obliquity polynomial.

## Tropical zodiac
Sector i: λ ∈ [30i, 30(i+1)) from vernal equinox. Independent of constellation boundaries.

## Positions (this build)
Sun: low-order equation of center. Moon: truncated periodic terms. Planets: Keplerian mean elements + simple inferior-planet elongation fold. **Not** full VSOP87D / ELP2000-82B / JPL Horizons.

## Houses
Whole-sign and equal from ASC; Placidus uses ASC/MC anchors with equal fill (full iterative Placidus deferred).

## Aspects
|Δλ| to 0/60/90/120/180 with configurable orbs; strength = 1 − |Δλ−target|/orb.

## Caching
LRU by 1 s JD bucket + 0.01° lat/lon — on-demand only, no chart-space precompute.
