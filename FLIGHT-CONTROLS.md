# Flight camera controls (3D cockpit)

## Why the blue crosshair and cursor felt “stuck”

The **cyan crosshair is fixed in the center** of the screen (aim reticle).  
Previously, **every click requested pointer-lock**, which:

1. **Hid the system cursor** so it looked like nothing moved  
2. Made **hover / click-to-lock on planets** almost impossible  
3. Only rotated the view via invisible mouse motion  

**Fix in this build:** left-drag looks around **without** locking the cursor.  
Middle-click is optional FPS mouse-lock.

---

## How to stay in the solar / planetary zone

| Action | Key |
|--------|-----|
| **Observe mode** (default ON) | **V** toggles — soft brakes + reduces solar pull so you can park and watch orbits |
| **Hard brake** | Hold **X** until speed ~0 |
| **Level the craft** | Hold **Z** |
| Thrust (leaves observe coast) | **W** / **S** |
| Boost | **Shift + W** |

You start almost stopped. A soft “leash” also pulls you back if you drift past the outer planets.

---

## Target lock + distance

1. Move the **visible cursor** over a planet/moon (cursor = crosshair style)  
2. **Hover** → target card / data updates  
3. **Click** the body → **Target locked** (click again to unlock)  
4. Distance appears on the lock card (`range` + catalog distance)

Locked target stays in the HUD even if you look away briefly.

---

## Look / move

| Action | Control |
|--------|---------|
| Look around | **Left-drag** (or right-drag) |
| Optional FPS lock | **Middle-click** (Esc to exit) |
| Yaw | **A / D** or ← → |
| Pitch | **R / F** or ↑ ↓ |
| Roll | **Q / E** |
| Up / down | **Space** / **C** |

---

## Why you always ended up in “deep sky”

Continuous **solar gravity + starting velocity** pushed the craft outward until only stars remained.  
Observe mode + lower start speed + distance leash keep you near the transfer / planetary region unless you intentionally burn outward (**W**).
