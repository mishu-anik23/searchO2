Here is a complete, production-ready starting background plot implemented as a modular HTML5 Canvas / SVG responsive parent layout designed to plug directly into index.html of the searchO2 architecture.This serves as the master parent stage containing calibrated coordinate zones for Decagon 1 (dec1), Decagon 2 (dec2), the Central Freshwater Lake, the Onshore Processing Plant & Microgrid, and the Offshore Dive / Aquaculture Trench.Master Parent Stage Layout 0,0 ───────────────────────────────────────────────────────────── 1920,0
 │  [TOP HUD & SEA HEALTH GAUGES: DO 84% | Water Clarity 92%]           │
 │                                                                      │
 │     ~~~~~~~~~~~~~ SUB-SURFACE TRENCH & REEF ~~~~~~~~~~~~~            │
 │     • Underwater Dive Hotspot       • Seaweed Raft Farm              │
 │     • Pelagic Fish Cage             • Coral Nursery Shelf            │
 │                                                                      │
 │  ┌───────────────────────┐            ┌───────────────────────┐      │
 │  │      DECAGON 1        │  ~~~~~~~~  │      DECAGON 2        │      │
 │  │    (dec1 - Wet/West)  │ (  Lake  ) │    (dec2 - Dune/East) │      │
 │  │ dec1.plot1 dec1.plot2 │  ~~~~~~~~  │ dec2.plot1 dec2.plot2 │      │
 │  │      dec1.plot3       │            │      dec2.plot3       │      │
 │  └───────────────────────┘            └───────────────────────┘      │
 │                                                                      │
 │  ┌─────────────────────────────────────────────────────────────────┐ │
 │  │           ONSHORE PROCESSING FACILITY & MICROGRID               │ │
 │  │  • Solar Rooftop Plant   • Wind Turbines & BESS  • Big Algae Jar│ │
 │  │  • Crab/Prawn RAS Hatchery                       • German Trade │ │
 │  └─────────────────────────────────────────────────────────────────┘ │
 │                                                                      │
 │ [🌐 Globe Navigation]                   [⚙️ Dev Toolbar & Overlays]   │
 0,1080 ───────────────────────────────────────────────────────── 1920,1080
1. IslandStageLayout.js (Parent Stage & Coordinate Grid System)Save this file as src/features/zones/saint_martin/components/IslandStageLayout.js. It defines the normalized world coordinate system ($1920 \times 1080$ virtual space) and provides click hit-testing, layer separation, and dynamic scaling.JavaScript/**
 * Master Island Canvas Parent Stage
 * Virtual Resolution: 1920 x 1080
 */
export const STAGE_CONFIG = {
  width: 1920,
  height: 1080,
  zones: {
    // Top Marine Trench (Offshore sub-surface)
    marineTrench: {
      id: 'marine_trench',
      bounds: { x: 0, y: 0, w: 1920, h: 360 },
      hotspots: {
        divePoint: { x: 500, y: 180, radius: 60, label: 'Dive Point' },
        seaweedRafts: { x: 960, y: 220, w: 280, h: 100, label: 'Seaweed Farm' },
        fishCages: { x: 1400, y: 170, radius: 55, label: 'Offshore Fish Cage' },
        coralReefShelf: { x: 220, y: 200, w: 200, h: 90, label: 'Coral Sanctuary' }
      }
    },

    // Decagonal Orchard 1 (West / Wet Coast)
    decagon1: {
      id: 'dec1',
      center: { x: 440, y: 550 },
      radius: 190,
      stretchY: 0.65, // Isometric squash ratio
      plots: {
        'dec1.plot1': { anchor: { x: 440, y: 460 }, label: 'dec1.plot1 (Mangrove)' },
        'dec1.plot2': { anchor: { x: 360, y: 590 }, label: 'dec1.plot2 (Keya Windbreak)' },
        'dec1.plot3': { anchor: { x: 520, y: 590 }, label: 'dec1.plot3 (Silt Lake Buffer)' }
      }
    },

    // Central Dividing Lake (Freshwater - Brackish)
    centralLake: {
      id: 'central_lake',
      center: { x: 960, y: 560 },
      radiusX: 130,
      radiusY: 75,
      label: 'Natural Freshwater Corridor'
    },

    // Decagonal Orchard 2 (East / Dune Canopy)
    decagon2: {
      id: 'dec2',
      center: { x: 1480, y: 550 },
      radius: 190,
      stretchY: 0.65,
      plots: {
        'dec2.plot1': { anchor: { x: 1480, y: 460 }, label: 'dec2.plot1 (Coconut Shield)' },
        'dec2.plot2': { anchor: { x: 1400, y: 590 }, label: 'dec2.plot2 (Palmyra & Casuarina)' },
        'dec2.plot3': { anchor: { x: 1560, y: 590 }, label: 'dec2.plot3 (Canopy Agro-Plot)' }
      }
    },

    // Onshore Eco-Campus & Energy Grid
    onshoreCampus: {
      id: 'onshore_campus',
      bounds: { x: 180, y: 780, w: 1560, h: 250 },
      modules: {
        rasTanks: { x: 260, y: 840, w: 260, h: 140, label: 'Crab & Prawn RAS Tanks' },
        processingPlant: { x: 620, y: 810, w: 380, h: 180, label: 'Solar Processing Facility' },
        algaeScrubberJars: { x: 1040, y: 840, w: 180, h: 130, label: 'Big Jar Algae Scrubbers' },
        microgridBess: { x: 1260, y: 820, w: 240, h: 160, label: 'Wind Turbines & BESS Station' }
      }
    }
  }
};
2. MasterIslandCanvas.js (Vector Render Engine)This file draws the complete multi-layer terrain (ocean gradients, sandy dunes, lake corridor, 10-sided orchards, infrastructure pads, and interactive debug wireframes).JavaScriptimport { STAGE_CONFIG } from './IslandStageLayout.js';

export class MasterIslandCanvas {
  constructor(canvasElement, onPlotClickCallback) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.onPlotClick = onPlotClickCallback;
    this.debugGrid = true; // Toggle for wireframe inspect

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.attachPointerEvents();
  }

  resize() {
    // Preserve virtual 1920x1080 aspect ratio
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.scaleX = this.canvas.width / STAGE_CONFIG.width;
    this.scaleY = this.canvas.height / STAGE_CONFIG.height;
    this.render();
  }

  render() {
    const { ctx } = this;
    ctx.save();
    ctx.scale(this.scaleX, this.scaleY);

    // 1. Base Sea & Horizon Gradient
    this.drawOceanBackground();

    // 2. Island Sandy Landmass & Central Lake
    this.drawIslandLandmass();
    this.drawCentralLake();

    // 3. Render Twin Decagonal Orchard Layouts
    this.drawDecagon(STAGE_CONFIG.zones.decagon1, '#2E8B57', 'dec1');
    this.drawDecagon(STAGE_CONFIG.zones.decagon2, '#D2691E', 'dec2');

    // 4. Render Marine Trench & Underwater Hotspots
    this.drawMarineTrench();

    // 5. Render Onshore Processing & Energy Platforms
    this.drawOnshoreCampus();

    ctx.restore();
  }

  drawOceanBackground() {
    const { ctx } = this;
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1080);
    oceanGrad.addColorStop(0, '#003366');   // Deep Bay of Bengal
    oceanGrad.addColorStop(0.35, '#007799'); // Coral Trench
    oceanGrad.addColorStop(0.75, '#20B2AA'); // Shallow Turquoise Lagoon
    oceanGrad.addColorStop(1, '#004F54');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, 1920, 1080);
  }

  drawIslandLandmass() {
    const { ctx } = this;
    ctx.save();
    ctx.beginPath();
    // Organic curved beach profile
    ctx.moveTo(120, 480);
    ctx.bezierCurveTo(240, 340, 780, 360, 960, 410);
    ctx.bezierCurveTo(1180, 360, 1680, 340, 1800, 490);
    ctx.bezierCurveTo(1880, 680, 1820, 950, 1600, 1020);
    ctx.bezierCurveTo(1200, 1060, 680, 1060, 300, 1020);
    ctx.bezierCurveTo(80, 940, 60, 640, 120, 480);
    ctx.closePath();

    // Sandy Shoreline Gradient
    const sandGrad = ctx.createRadialGradient(960, 700, 100, 960, 700, 800);
    sandGrad.addColorStop(0, '#E6D7B8'); // Interior dune loam
    sandGrad.addColorStop(0.85, '#D8C39D'); // Wet beach sand
    sandGrad.addColorStop(1, '#81B29A'); // Vegetation fringe
    ctx.fillStyle = sandGrad;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 30;
    ctx.fill();
    ctx.restore();
  }

  drawCentralLake() {
    const { ctx } = this;
    const lake = STAGE_CONFIG.zones.centralLake;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(lake.center.x, lake.center.y, lake.radiusX, lake.radiusY, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#1D7874'; // Brackish-freshwater emerald tint
    ctx.strokeStyle = '#9FD3C7';
    ctx.lineWidth = 4;
    ctx.fill();
    ctx.stroke();

    // Lake Label
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText(lake.label, lake.center.x, lake.center.y + 5);
    ctx.restore();
  }

  drawDecagon(decData, strokeColor, labelPrefix) {
    const { ctx } = this;
    const { center, radius, stretchY, plots } = decData;
    const vertices = [];

    // Calculate 10-sided vertices
    for (let i = 0; i < 10; i++) {
      const angle = (i * 2 * Math.PI) / 10 - Math.PI / 2;
      vertices.push({
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle) * stretchY
      });
    }

    ctx.save();
    // 1. Draw outer 10-sided decagonal frame
    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);
    for (let i = 1; i < 10; i++) {
      ctx.lineTo(vertices[i].x, vertices[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(240, 230, 205, 0.7)';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = strokeColor;
    ctx.stroke();

    // 2. Sub-Plot Divider Lines (Center to vertices 0, 3, 7)
    [0, 3, 7].forEach((vIdx) => {
      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      ctx.lineTo(vertices[vIdx].x, vertices[vIdx].y);
      ctx.strokeStyle = 'rgba(60, 60, 60, 0.35)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // 3. Render Interactive Plot Labels & Hit Target Bases
    Object.entries(plots).forEach(([plotKey, plotObj]) => {
      ctx.fillStyle = '#1A2F2B';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(plotKey, plotObj.anchor.x, plotObj.anchor.y);

      // Plot Center Target Ring
      ctx.beginPath();
      ctx.arc(plotObj.anchor.x, plotObj.anchor.y + 12, 6, 0, Math.PI * 2);
      ctx.fillStyle = strokeColor;
      ctx.fill();
    });

    ctx.restore();
  }

  drawMarineTrench() {
    const { ctx } = this;
    const trench = STAGE_CONFIG.zones.marineTrench;

    // Seaweed Farm Lines
    ctx.save();
    ctx.strokeStyle = '#2D6A4F';
    ctx.lineWidth = 3;
    const sw = trench.hotspots.seaweedRafts;
    ctx.strokeRect(sw.x - sw.w / 2, sw.y - sw.h / 2, sw.w, sw.h);
    ctx.fillStyle = 'rgba(45, 106, 79, 0.3)';
    ctx.fillRect(sw.x - sw.w / 2, sw.y - sw.h / 2, sw.w, sw.h);
    ctx.fillStyle = '#D8F3DC';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(sw.label, sw.x, sw.y + 5);

    // Offshore Fish Cage Ring
    const cage = trench.hotspots.fishCages;
    ctx.beginPath();
    ctx.ellipse(cage.x, cage.y, cage.radius, cage.radius * 0.6, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#E0A96D';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(cage.label, cage.x, cage.y + 4);

    // Dive Point Marker
    const dive = trench.hotspots.divePoint;
    ctx.beginPath();
    ctx.arc(dive.x, dive.y, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#00B4D8';
    ctx.fill();
    ctx.fillText('🤿 ' + dive.label, dive.x, dive.y + 42);
    ctx.restore();
  }

  drawOnshoreCampus() {
    const { ctx } = this;
    const campus = STAGE_CONFIG.zones.onshoreCampus;

    ctx.save();
    // Infrastructure Base Platform
    ctx.fillStyle = 'rgba(215, 205, 180, 0.85)';
    ctx.strokeStyle = '#8D7B68';
    ctx.lineWidth = 2;
    ctx.fillRect(campus.bounds.x, campus.bounds.y, campus.bounds.w, campus.bounds.h);
    ctx.strokeRect(campus.bounds.x, campus.bounds.y, campus.bounds.w, campus.bounds.h);

    // Draw Internal Pads
    Object.values(campus.modules).forEach((mod) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.fillRect(mod.x, mod.y, mod.w, mod.h);
      ctx.strokeStyle = '#4A4A4A';
      ctx.strokeRect(mod.x, mod.y, mod.w, mod.h);

      ctx.fillStyle = '#222222';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(mod.label, mod.x + mod.w / 2, mod.y + mod.h / 2 + 5);
    });

    ctx.restore();
  }

  attachPointerEvents() {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = (e.clientX - rect.left) / this.scaleX;
      const clickY = (e.clientY - rect.top) / this.scaleY;

      // Check Decagon 1 Plots
      this.checkPlotHit(STAGE_CONFIG.zones.decagon1.plots, clickX, clickY);
      // Check Decagon 2 Plots
      this.checkPlotHit(STAGE_CONFIG.zones.decagon2.plots, clickX, clickY);
    });
  }

  checkPlotHit(plots, x, y) {
    for (const [key, plot] of Object.entries(plots)) {
      const dx = x - plot.anchor.x;
      const dy = y - plot.anchor.y;
      if (Math.sqrt(dx * dx + dy * dy) < 45) {
        if (this.onPlotClick) this.onPlotClick(key);
        break;
      }
    }
  }
}
3. Direct Mounting into index.htmlInsert this container structure into index.html to integrate the canvas, developer controls, and UI overlays:HTML<!-- Saint Martin Island Parent Viewport Container -->
<div id="saint-martin-zone" style="position: absolute; inset: 0; width: 100vw; height: 100vh; overflow: hidden; display: none;">
  
  <!-- Master Background Canvas -->
  <canvas id="island-master-canvas" style="display: block; width: 100%; height: 100%;"></canvas>

  <!-- HTML Component Overlay Layer for HUD and Modals -->
  <div id="island-hud-layer" style="position: absolute; inset: 0; pointer-events: none;">
    
    <!-- Top Metrics Bar -->
    <header style="pointer-events: auto; display: flex; justify-content: space-between; padding: 16px 24px; background: rgba(0, 30, 45, 0.7); backdrop-filter: blur(8px); color: #FFF; font-family: sans-serif;">
      <div>
        <h2 style="margin: 0; font-size: 1.1rem; color: #64DFDF;">Saint Martin's Blue Lab</h2>
        <span style="font-size: 0.85rem; color: #BEE3DB;">Zone 2: Coastal & Coral Biosphere</span>
      </div>
      <div style="display: flex; gap: 20px; font-weight: bold;">
        <span>Sea Health: <strong id="shi-val" style="color: #70E000;">88%</strong></span>
        <span>Dissolved O₂: <strong id="do-val" style="color: #48CAE4;">84%</strong></span>
        <span>Global O₂: <strong id="global-o2-val" style="color: #A9DEF9;">5,230 pts</strong></span>
      </div>
    </header>

    <!-- Bottom Left Globe Anchor -->
    <div id="globe-container" style="position: absolute; bottom: 20px; left: 20px; width: 130px; height: 130px; pointer-events: auto;">
      <canvas id="globe-canvas" style="width: 100%; height: 100%; border-radius: 50%; border: 2px solid #00B4D8;"></canvas>
    </div>

    <!-- Dev Quick Toggle Bar -->
    <div id="dev-toolbar" style="position: absolute; bottom: 20px; left: 170px; display: flex; gap: 8px; pointer-events: auto;">
      <button id="dev-btn-toggle" style="background: #2D6A4F; color: #FFF; border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer;">
        ⚡ Dev: Force Unlock
      </button>
      <button id="dev-btn-dive" style="background: #0077B6; color: #FFF; border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer;">
        🤿 Open 3D Dive View
      </button>
      <button id="dev-btn-algae" style="background: #1B4965; color: #FFF; border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer;">
        🧪 Install Big Jar Scrubber
      </button>
    </div>
  </div>
</div>
4. Initialization Script (main.js or Module Bootstrapper)JavaScriptimport { MasterIslandCanvas } from './components/MasterIslandCanvas.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvasEl = document.getElementById('island-master-canvas');
  
  // Initialize Master Canvas with plot click routing
  const islandCanvas = new MasterIslandCanvas(canvasEl, (clickedPlotId) => {
    console.log(`Plot selected: ${clickedPlotId}`);
    // Opens Planting / Tree Progression Modal for coconut, palmyra, keya, or mangrove
    window.dispatchEvent(new CustomEvent('open-tree-inspector', { detail: { plotId: clickedPlotId } }));
  });

  // Dev Toggle Action
  document.getElementById('dev-btn-toggle').addEventListener('click', () => {
    document.getElementById('saint-martin-zone').style.display = 'block';
    islandCanvas.resize();
  });
});