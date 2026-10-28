const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('bavaria/alpenhof.html');
const publicFile = path.resolve('public/bavaria/alpenhof.html');

let content = fs.readFileSync(targetFile, 'utf8');
const isCrlf = content.includes('\r\n');
const nl = isCrlf ? '\r\n' : '\n';
function norm(str) {
  return str.replace(/\r?\n/g, nl);
}

// 1. CSS Updates: Replace .task-capsule and remove .align-bottom-left / .bottom-left
const oldCssBlock = `/* Task Capsule Bottom-Left Sticky HUD */
.task-capsule{
  position:absolute;bottom:20px;left:20px;transform:none;
  width:min(440px,calc(100vw - 40px));background:var(--card);border:1.5px solid var(--border);
  border-radius:18px;padding:10px 16px;z-index:22;backdrop-filter:blur(10px);box-shadow:0 8px 24px rgba(0,0,0,0.55);
}
@media (max-width: 768px){
  .task-capsule{bottom:12px;left:12px;width:min(400px,calc(100vw - 24px));padding:8px 12px}
}
.task-capsule h4{font-family:'Baloo 2',sans-serif;font-size:0.95rem;color:var(--gold);margin-bottom:3px;display:flex;align-items:center;gap:6px}
.task-capsule p{font-size:0.78rem;color:#C8E6C9;line-height:1.35}
.task-capsule .recall-tag{font-size:0.68rem;background:rgba(255,213,79,0.15);color:var(--gold);padding:2px 8px;border-radius:8px;font-weight:800;border:1px solid rgba(255,213,79,0.35);margin-left:auto}
.prog-bar{height:6px;background:rgba(255,255,255,0.12);border-radius:4px;margin-top:8px;overflow:hidden}
.prog-fill{height:100%;background:linear-gradient(90deg,var(--meadow),var(--teal));width:12%;border-radius:4px;transition:width 0.3s}

/* Modals */
.modal-overlay{position:fixed;inset:0;background:rgba(0,8,4,0.78);display:none;align-items:center;justify-content:center;z-index:100;padding:16px;backdrop-filter:blur(6px)}
.modal-overlay.open{display:flex}
.modal-overlay.align-bottom-left{align-items:flex-end;justify-content:flex-start;padding:24px 28px}
.modal-card{background:linear-gradient(160deg,#14241a,#09140e);border:1.5px solid var(--border);border-radius:20px;padding:20px;max-width:min(580px,96vw);max-height:88vh;overflow:auto;box-shadow:0 24px 60px rgba(0,0,0,0.7)}
.modal-card.wide{max-width:min(780px,96vw)}
.modal-card.bottom-left{margin:0;max-width:min(560px,92vw);max-height:min(78vh,620px);animation:slideInBottomLeft .22s cubic-bezier(0.16,1,0.3,1);box-shadow:0 16px 50px rgba(0,0,0,0.8),0 0 0 1px rgba(165,214,167,0.25)}
@keyframes slideInBottomLeft{from{opacity:0;transform:translate(-24px,20px) scale(0.96)}to{opacity:1;transform:translate(0,0) scale(1)}}
@media (max-width: 768px){
  .modal-overlay.align-bottom-left{align-items:flex-end;justify-content:center;padding:12px}
  .modal-card.bottom-left{max-width:96vw;max-height:82vh}
}`;

const newCssBlock = `/* Chapter Tracker Header Pill (Sleek Topbar Progression Header, non-sticky) */
.task-capsule{
  position:absolute;top:16px;left:50%;transform:translateX(-50%);
  width:min(540px,calc(100vw - 340px));background:rgba(10,22,14,0.92);border:1.5px solid var(--border);
  border-radius:16px;padding:8px 16px;z-index:22;backdrop-filter:blur(10px);box-shadow:0 8px 24px rgba(0,0,0,0.45);
  cursor:pointer;transition:all 0.2s cubic-bezier(0.16,1,0.3,1);
}
.task-capsule:hover{
  border-color:var(--gold);transform:translateX(-50%) translateY(-1px);
  box-shadow:0 12px 30px rgba(0,0,0,0.65);background:rgba(14,30,20,0.96);
}
.task-capsule h4{font-family:'Baloo 2',sans-serif;font-size:0.92rem;color:var(--gold);margin-bottom:2px;display:flex;align-items:center;gap:6px}
.task-capsule p{font-size:0.75rem;color:#C8E6C9;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.task-capsule .recall-tag{font-size:0.65rem;background:rgba(255,213,79,0.15);color:var(--gold);padding:2px 8px;border-radius:8px;font-weight:800;border:1px solid rgba(255,213,79,0.35);margin-left:auto}
.prog-bar{height:5px;background:rgba(255,255,255,0.12);border-radius:4px;margin-top:6px;overflow:hidden}
.prog-fill{height:100%;background:linear-gradient(90deg,var(--meadow),var(--teal));width:12%;border-radius:4px;transition:width 0.3s}

/* Modals */
.modal-overlay{position:fixed;inset:0;background:rgba(0,8,4,0.82);display:none;align-items:center;justify-content:center;z-index:100;padding:16px;backdrop-filter:blur(8px)}
.modal-overlay.open{display:flex}
.modal-card{background:linear-gradient(160deg,#14241a,#09140e);border:1.5px solid var(--border);border-radius:20px;padding:22px;max-width:min(660px,96vw);max-height:88vh;overflow:auto;box-shadow:0 24px 60px rgba(0,0,0,0.8)}
.modal-card.wide{max-width:min(880px,96vw)}`;

if (!content.includes(norm(oldCssBlock))) {
  console.error('ERROR: oldCssBlock not found!');
  process.exit(1);
}
content = content.replace(norm(oldCssBlock), norm(newCssBlock));

// Replace mobile media query for task-capsule
const oldMobileMedia = `.task-capsule{bottom:8px;left:8px;right:8px;transform:none;width:auto;padding:8px 12px}`;
const newMobileMedia = `.task-capsule{top:64px;bottom:auto;left:8px;right:8px;transform:none;width:auto;padding:8px 12px}.task-capsule:hover{transform:none}`;
if (!content.includes(norm(oldMobileMedia))) {
  console.error('ERROR: oldMobileMedia not found!');
  process.exit(1);
}
content = content.replace(norm(oldMobileMedia), norm(newMobileMedia));

// 2. HTML: taskCapsule onclick and tooltip
const oldHtmlCapsule = `    <!-- Bottom Task Capsule with Chapter Progression & Basic Farm Recall -->
    <div class="task-capsule" id="taskCapsule">
      <h4>
        <span id="taskIcon">🌿</span>
        <span id="taskTitle">Chapter 1 · Survey the Alpenhof Estate</span>
        <span class="recall-tag" id="taskRecall">Recalling Solo Founder Ch. 1</span>
      </h4>
      <p id="taskDesc">Walk the 6 Streuobst orchard dirt plots, living waters pond, Simmental cattle fence and alpine pads. Acknowledge Why Cards to unlock tools.</p>
      <div class="prog-bar"><div class="prog-fill" id="taskBar" style="width:12%"></div></div>
    </div>`;

const newHtmlCapsule = `    <!-- Chapter Tracker Header Pill (Click opens redesigned Chapter Exploration & Mastery Journey) -->
    <div class="task-capsule" id="taskCapsule" onclick="openMaster()" title="Click to open 6-Chapter Exploration & Mastery Journey">
      <h4>
        <span id="taskIcon">🌿</span>
        <span id="taskTitle">Chapter 1 · Survey the Alpenhof Estate</span>
        <span class="recall-tag" id="taskRecall">Recalling Solo Founder Ch. 1</span>
      </h4>
      <p id="taskDesc">Walk the 6 Streuobst orchard dirt plots, living waters pond, Simmental cattle fence and alpine pads. Acknowledge Why Cards to unlock tools.</p>
      <div class="prog-bar"><div class="prog-fill" id="taskBar" style="width:12%"></div></div>
    </div>`;

if (!content.includes(norm(oldHtmlCapsule))) {
  console.error('ERROR: oldHtmlCapsule not found!');
  process.exit(1);
}
content = content.replace(norm(oldHtmlCapsule), norm(newHtmlCapsule));

// 3. Road Network Constants, Specs, Helpers and drawRoadNetwork
const oldRoadsBlockStart = `/* ================= ORGANIC COUNTRY MUD ROAD & BYPASS HIGHWAY NETWORK ================= */`;
const oldRoadsBlockEnd = `/* ================= CLASSICAL BAVARIAN VOLUMETRIC VR ASSETS ================= */`;

const startIdx = content.indexOf(oldRoadsBlockStart);
const endIdx = content.indexOf(oldRoadsBlockEnd);
if (startIdx === -1 || endIdx === -1) {
  console.error('ERROR: old roads block bounds not found!');
  process.exit(1);
}

const newRoadsBlock = `/* ================= ALPENHOF CIVIL ROAD NETWORK & ENGINEERING SUITE ================= */
const ALPENHOF_ROAD_NETWORK = [
  {
    id: "main_arterial_primary",
    road_type: "type_a_main_arterial",
    role: "Alps Main Gate to West Orchard Hub (Primary Spine)",
    width_px: 32,
    closed_loop: false,
    endpoints: { start: [1770, 930], end: [175, 600] },
    waypoints: [
      [1770, 930], [1650, 775], [1480, 715], [1310, 645], [1120, 605],
      [910, 600], [720, 605], [620, 605], [440, 605], [315, 595], [175, 600]
    ]
  },
  {
    id: "main_arterial_west_ingress",
    road_type: "type_a_main_arterial",
    role: "Connection from Main Spine to Hof-Mosterei & Juice Bar",
    width_px: 24,
    closed_loop: false,
    endpoints: { start: [315, 595], end: [145, 710] },
    waypoints: [
      [315, 595], [215, 680], [145, 710]
    ]
  },
  {
    id: "sub_road_north_loop",
    road_type: "type_b_sub_road",
    role: "North Loop serving Energy Storage, Solar Arrays, and Farm Shed",
    width_px: 16,
    closed_loop: false,
    endpoints: { start: [315, 595], end: [1310, 645] },
    waypoints: [
      [315, 595], [290, 480], [280, 290], [275, 175], [425, 205],
      [540, 245], [605, 335], [745, 335], [890, 410], [980, 310],
      [1135, 295], [1310, 645]
    ]
  },
  {
    id: "sub_road_east_slope",
    road_type: "type_b_sub_road",
    role: "Upper Hillside Service Trail to Grape Vineyard, Cattle Pasture, and Wind Turbine",
    width_px: 16,
    closed_loop: false,
    endpoints: { start: [1120, 605], end: [1820, 165] },
    waypoints: [
      [1120, 605], [1160, 470], [1310, 395], [1520, 305], [1745, 235], [1820, 165]
    ]
  },
  {
    id: "sub_road_right_hub_link",
    road_type: "type_b_sub_road",
    role: "Courtyard Loop connecting Gasthof Stuben, Fountain, and Village Gate",
    width_px: 16,
    closed_loop: true,
    endpoints: { start: [1480, 715], end: [1650, 775] },
    waypoints: [
      [1480, 715], [1410, 810], [1420, 930], [1485, 960], [1650, 775]
    ]
  },
  {
    id: "bypass_road_southern_pond",
    road_type: "type_d_bypass_road",
    role: "Bottom Perimeter Bypass linking Dairy Factory directly around South Pond to Western Hub",
    width_px: 16,
    closed_loop: false,
    endpoints: { start: [1150, 480], end: [145, 710] },
    waypoints: [
      [1150, 480], [1100, 580], [1150, 700], [1215, 805], [1285, 920],
      [1185, 980], [1030, 980], [860, 960], [670, 930], [520, 875],
      [380, 810], [240, 735], [175, 725], [145, 710]
    ]
  },
  {
    id: "garden_path_orchard_horiz_1",
    road_type: "type_c_garden_path",
    role: "2x3 Orchard Interior Horizontal Corridor (Top)",
    width_px: 7,
    closed_loop: false,
    endpoints: { start: [35, 345], end: [285, 345] },
    waypoints: [ [35, 345], [285, 345] ]
  },
  {
    id: "garden_path_orchard_horiz_2",
    road_type: "type_c_garden_path",
    role: "2x3 Orchard Interior Horizontal Corridor (Bottom)",
    width_px: 7,
    closed_loop: false,
    endpoints: { start: [35, 500], end: [285, 500] },
    waypoints: [ [35, 500], [285, 500] ]
  },
  {
    id: "garden_path_orchard_vert",
    road_type: "type_c_garden_path",
    role: "2x3 Orchard Interior Central Divider (Vertical)",
    width_px: 7,
    closed_loop: false,
    endpoints: { start: [160, 210], end: [160, 600] },
    waypoints: [ [160, 210], [160, 600] ]
  },
  {
    id: "garden_path_veg_garden_vert",
    road_type: "type_c_garden_path",
    role: "Vegetable Garden Central Vertical Division",
    width_px: 7,
    closed_loop: false,
    endpoints: { start: [485, 280], end: [485, 395] },
    waypoints: [ [485, 280], [485, 395] ]
  },
  {
    id: "garden_path_veg_garden_horiz",
    road_type: "type_c_garden_path",
    role: "Vegetable Garden Central Horizontal Division",
    width_px: 7,
    closed_loop: false,
    endpoints: { start: [345, 340], end: [625, 340] },
    waypoints: [ [345, 340], [625, 340] ]
  },
  {
    id: "garden_path_crop_field_vert",
    road_type: "type_c_garden_path",
    role: "2x2 Central Crop Field Vertical Divider",
    width_px: 8,
    closed_loop: false,
    endpoints: { start: [495, 400], end: [495, 640] },
    waypoints: [ [495, 400], [495, 640] ]
  },
  {
    id: "garden_path_crop_field_horiz",
    road_type: "type_c_garden_path",
    role: "2x2 Central Crop Field Horizontal Divider",
    width_px: 8,
    closed_loop: false,
    endpoints: { start: [350, 515], end: [610, 515] },
    waypoints: [ [350, 515], [610, 515] ]
  },
  {
    id: "garden_path_flower_upper",
    road_type: "type_c_garden_path",
    role: "Walkway connecting Central Road to Pollination Flower Beds",
    width_px: 6,
    closed_loop: false,
    endpoints: { start: [650, 610], end: [490, 770] },
    waypoints: [ [650, 610], [620, 695], [575, 775], [490, 770] ]
  },
  {
    id: "garden_path_pond_edge",
    road_type: "type_c_garden_path",
    role: "Scenic Trail between Lower Pond Bank and Western Orchard Corner",
    width_px: 6,
    closed_loop: false,
    endpoints: { start: [430, 720], end: [235, 770] },
    waypoints: [ [430, 720], [395, 825], [250, 810], [235, 770] ]
  }
];

const ROAD_TYPE_SPECS = {
  type_a_main_arterial: {
    id: "type_a_main_arterial",
    name: "Main Road (Primary Arterial)",
    desc: "Heavy packed-clay thoroughfare connecting main entrance gate, central commercial hubs, and western processing facilities.",
    materialName: "Heavy Packed Bavarian Loam & Crushed Limestone Ballast",
    defaultWidth: 32,
    traversable: "Heavy Machinery, Tractors, Milk Tankers, Delivery Trucks, Visitors, Livestock",
    color: "#8D6E63",
    steps: [
      { step: 1, name: "Subgrade Loam Excavation & Drainage Trenching", cost: 90, xp: 15, o2: 8 },
      { step: 2, name: "Packed Clay Compaction & Granite Kerb Edging", cost: 110, xp: 20, o2: 12 }
    ],
    totalCost: 200,
    benefits: "Reduces heavy tractor rolling resistance by 40%, enables automated transport between Alps Gate and Western Facilities."
  },
  type_b_sub_road: {
    id: "type_b_sub_road",
    name: "Sub-Road (Service Route)",
    desc: "Medium-width dirt trails connecting working farm zones, pastures, energy assets, and secondary hubs.",
    materialName: "Compact Dirt & River Gravel Ballast",
    defaultWidth: 18,
    traversable: "Utility Vehicles, Tractors, Farm Crew, Livestock Herds",
    color: "#A1887F",
    steps: [
      { step: 1, name: "Hillside Terrace Grading & Drainage Trenching", cost: 60, xp: 10, o2: 6 },
      { step: 2, name: "Crushed Stone Ballast & Loam Compaction", cost: 70, xp: 15, o2: 9 }
    ],
    totalCost: 130,
    benefits: "All-weather erosion resistance during alpine snowmelt, gives direct tractor service access to Pasture, Vineyard, and Solar microgrids."
  },
  type_c_garden_path: {
    id: "type_c_garden_path",
    name: "Garden Path (Pedestrian / Plot Access)",
    desc: "Narrow access trails and interior dividers for orchards, vegetable beds, and flower pollinator gardens.",
    materialName: "Trodden Meadow Turf & Permeable River Pea Gravel",
    defaultWidth: 8,
    traversable: "Pedestrians, Garden Handcarts, Pollinator Workers, Gardeners",
    color: "#BCAAA4",
    steps: [
      { step: 1, name: "Turf Demarcation & Larch Border Staking", cost: 30, xp: 8, o2: 5 },
      { step: 2, name: "Permeable Pea Gravel Laying & Tamp", cost: 35, xp: 7, o2: 5 }
    ],
    totalCost: 65,
    benefits: "100% rainwater infiltration with 0% runoff erosion. Preserves fragile mycorrhizal root zones in Streuobst orchards and vegetable beds."
  },
  type_d_bypass_road: {
    id: "type_d_bypass_road",
    name: "Bypass Road (Southern Pond Loop / Manhattan Bypass)",
    desc: "Dedicated secondary route sweeping along the southern perimeter beneath the pond to link the dairy facility with the west hub.",
    materialName: "Beveled Granite Cobblestone & Crushed Aggregate Sub-base",
    defaultWidth: 16,
    traversable: "Utility Vehicles, Dairy Transports, Milk Tankers, Farm Crew",
    color: "#6D4C41",
    steps: [
      { step: 1, name: "Southern Meadow Causeway Earthworks & Ballast Base", cost: 40, xp: 12, o2: 6 },
      { step: 2, name: "Beveled Cobblestone Paving & Timber Revetments", cost: 50, xp: 18, o2: 9 }
    ],
    totalCost: 90,
    benefits: "Manhattan shortest-path logistics: saves 670m per milk transport run (~30% reduction), bypassing village tourist pedestrian zones."
  }
};

const ROAD_BYPASS_PTS = ALPENHOF_ROAD_NETWORK.find(r => r.id === 'bypass_road_southern_pond').waypoints;

function isRoadBuilt(segId) {
  if (!state.built) state.built = {};
  if (!state.built.roads) state.built.roads = {};
  if (state.built.roads[segId]) return true;
  if (segId === 'bypass_road_southern_pond' && state.built['road_dairy_bypass']) return true;
  return false;
}

function getBypassPolylinePoint(pts, progress) {
  let totalLen = 0;
  const segLens = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const d = Math.hypot(pts[i+1][0] - pts[i][0], pts[i+1][1] - pts[i][1]);
    segLens.push(d);
    totalLen += d;
  }
  let target = progress * totalLen;
  for (let i = 0; i < segLens.length; i++) {
    if (target <= segLens[i] || i === segLens.length - 1) {
      const segT = segLens[i] > 0 ? target / segLens[i] : 0;
      const x = pts[i][0] + (pts[i+1][0] - pts[i][0]) * segT;
      const y = pts[i][1] + (pts[i+1][1] - pts[i][1]) * segT;
      const angle = Math.atan2(pts[i+1][1] - pts[i][1], pts[i+1][0] - pts[i][0]);
      return {x, y, angle};
    }
    target -= segLens[i];
  }
  return {x: pts[0][0], y: pts[0][1], angle: 0};
}

function isNearBypassRoad(cx, cy) {
  const pts = ROAD_BYPASS_PTS;
  for (let i = 0; i < pts.length - 1; i++) {
    const p1 = pts[i];
    const p2 = pts[i+1];
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) continue;
    let t = ((cx - p1[0]) * dx + (cy - p1[1]) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const projX = p1[0] + t * dx;
    const projY = p1[1] + t * dy;
    if (Math.hypot(cx - projX, cy - projY) < 32) return true;
  }
  return false;
}

function findRoadAtPoint(cx, cy) {
  for (const seg of ALPENHOF_ROAD_NETWORK) {
    const pts = seg.waypoints;
    const threshold = Math.max(16, (seg.width_px || 16) * 0.75 + 5);
    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const dx = p2[0] - p1[0];
      const dy = p2[1] - p1[1];
      const lenSq = dx * dx + dy * dy;
      if (lenSq === 0) continue;
      let t = ((cx - p1[0]) * dx + (cy - p1[1]) * dy) / lenSq;
      t = Math.max(0, Math.min(1, t));
      const projX = p1[0] + t * dx;
      const projY = p1[1] + t * dy;
      if (Math.hypot(cx - projX, cy - projY) <= threshold) {
        return seg;
      }
    }
  }
  return null;
}

function drawMilkTransportTruck(ctx, time) {
  const tNorm = ((time * 0.05) % 2.0);
  const forward = tNorm < 1.0;
  const t = forward ? tNorm : (2.0 - tNorm);
  const {x, y, angle} = getBypassPolylinePoint(ROAD_BYPASS_PTS, t);

  ctx.save();
  ctx.translate(x, y);

  // Ground drop shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 5, 24, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  if (!forward) ctx.scale(-1, 1);

  // Wheels
  ctx.fillStyle = '#212121';
  [-13, -5, 9].forEach(wx => {
    ctx.fillRect(wx - 3, 3, 6, 5);
    ctx.fillStyle = '#CFD8DC'; ctx.fillRect(wx - 1, 4.5, 2, 2);
    ctx.fillStyle = '#212121';
  });

  // Cylindrical Stainless Steel Milk Tanker Trailer
  isoBox(ctx, -7, -2, 24, 12, 10, '#ECEFF1', '#CFD8DC', '#B0BEC5', '#78909C');
  // Tank bands & top inspection dome
  ctx.strokeStyle = '#90A4AE'; ctx.lineWidth = 1;
  ctx.strokeRect(-16, -11, 4, 8);
  ctx.strokeRect(-2, -11, 4, 8);
  ctx.fillStyle = '#78909C';
  ctx.beginPath(); ctx.ellipse(-7, -12, 3.5, 1.8, 0, 0, Math.PI * 2); ctx.fill();
  // "ALPEN-MILCH" Blue livery band
  ctx.fillStyle = '#0288D1';
  ctx.fillRect(-17, -7, 20, 3.2);

  // Bavarian Alpine White & Blue Cab
  isoBox(ctx, 11, 0, 10, 11, 11, '#E1F5FE', '#0288D1', '#01579B', '#0277BD');
  // Windscreen & Headlights
  ctx.fillStyle = '#00E5FF'; ctx.fillRect(11, -9, 4, 5);
  ctx.fillStyle = '#FFF59D'; ctx.fillRect(15, -3, 2, 2);
  // Chrome Front Grille
  ctx.fillStyle = '#B0BEC5'; ctx.fillRect(15, -1, 1.5, 3.2);
  // Amber Flashing Roof Beacon
  const flash = Math.sin(time * 10) > 0;
  ctx.fillStyle = flash ? '#FFB300' : '#FF6F00';
  ctx.beginPath(); ctx.arc(10, -12, 1.8, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
}

function drawRoadNetwork(ctx){
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const animTime = (window.AlpenMap && window.AlpenMap.time) || 0;

  ALPENHOF_ROAD_NETWORK.forEach(seg => {
    const pts = seg.waypoints;
    if (!pts || pts.length < 2) return;
    const built = isRoadBuilt(seg.id);
    const width = seg.width_px || 16;
    const rType = seg.road_type;

    if (!built) {
      // UNBUILT: Civil Engineering Blueprint Survey Corridor
      // 1. Soft excavation / ground clearance shadow
      ctx.strokeStyle = 'rgba(25, 45, 25, 0.35)';
      ctx.lineWidth = width + 4;
      ctx.beginPath();
      pts.forEach((p, i) => i === 0 ? ctx.moveTo(p[0], p[1] + 1) : ctx.lineTo(p[0], p[1] + 1));
      ctx.stroke();

      // 2. Blueprint excavation dashed lines (Cyan / Gold survey ribbon)
      ctx.strokeStyle = (rType === 'type_a_main_arterial') ? '#00E5FF' : (rType === 'type_d_bypass_road') ? '#00E5FF' : '#FFD54F';
      ctx.lineWidth = Math.max(2.2, width * 0.18);
      ctx.setLineDash([7, 6]);
      ctx.beginPath();
      pts.forEach((p, i) => i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]));
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Wooden surveyor stakes at key turns
      if (rType !== 'type_c_garden_path' || pts.length <= 3) {
        pts.forEach((p, idx) => {
          if (idx === 0 || idx === pts.length - 1 || idx % 2 === 1) {
            ctx.fillStyle = '#8D6E63'; ctx.fillRect(p[0] - 1.5, p[1] - 8, 3, 9);
            ctx.fillStyle = (idx % 2 === 0) ? '#FF3D00' : '#FFB300';
            ctx.fillRect(p[0] + 1.5, p[1] - 8, 4, 3);
          }
        });
      }
    } else {
      // BUILT: Volumetric Multi-Layer Engineered Paving
      if (rType === 'type_a_main_arterial') {
        // Heavy Packed Clay & Ballast Highway
        ctx.strokeStyle = 'rgba(62, 39, 35, 0.75)';
        ctx.lineWidth = width + 6;
        ctx.beginPath();
        pts.forEach((p, i) => i === 0 ? ctx.moveTo(p[0], p[1] + 2) : ctx.lineTo(p[0], p[1] + 2));
        ctx.stroke();

        ctx.strokeStyle = '#8D6E63';
        ctx.lineWidth = width;
        ctx.beginPath();
        pts.forEach((p, i) => i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]));
        ctx.stroke();

        ctx.strokeStyle = '#6D4C41';
        ctx.lineWidth = width * 0.45;
        ctx.beginPath();
        pts.forEach((p, i) => i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]));
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 235, 200, 0.35)';
        ctx.lineWidth = 1.6;
        ctx.setLineDash([10, 8]);
        ctx.beginPath();
        pts.forEach((p, i) => i === 0 ? ctx.moveTo(p[0], p[1] - 3) : ctx.lineTo(p[0], p[1] - 3));
        ctx.stroke();
        ctx.beginPath();
        pts.forEach((p, i) => i === 0 ? ctx.moveTo(p[0], p[1] + 3) : ctx.lineTo(p[0], p[1] + 3));
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (rType === 'type_b_sub_road') {
        // Compact Dirt & Gravel Trail
        ctx.strokeStyle = 'rgba(70, 50, 30, 0.55)';
        ctx.lineWidth = width + 4;
        ctx.beginPath();
        pts.forEach((p, i) => i === 0 ? ctx.moveTo(p[0], p[1] + 1.5) : ctx.lineTo(p[0], p[1] + 1.5));
        ctx.stroke();

        ctx.strokeStyle = '#A1887F';
        ctx.lineWidth = width;
        ctx.beginPath();
        pts.forEach((p, i) => i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]));
        ctx.stroke();

        ctx.strokeStyle = '#5D4037';
        ctx.lineWidth = width * 0.35;
        ctx.beginPath();
        pts.forEach((p, i) => i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]));
        ctx.stroke();
      } else if (rType === 'type_c_garden_path') {
        // Trodden Meadow Turf & Permeable Pea Gravel
        ctx.strokeStyle = 'rgba(60, 45, 25, 0.40)';
        ctx.lineWidth = width + 2;
        ctx.beginPath();
        pts.forEach((p, i) => i === 0 ? ctx.moveTo(p[0], p[1] + 0.5) : ctx.lineTo(p[0], p[1] + 0.5));
        ctx.stroke();

        ctx.strokeStyle = '#D7CCC8';
        ctx.lineWidth = width;
        ctx.beginPath();
        pts.forEach((p, i) => i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]));
        ctx.stroke();

        ctx.strokeStyle = '#8D6E63';
        ctx.lineWidth = 1.0;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        pts.forEach((p, i) => i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]));
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (rType === 'type_d_bypass_road') {
        // Granite Cobblestone Paved Highway
        ctx.strokeStyle = '#3E2723';
        ctx.lineWidth = width + 4;
        ctx.beginPath();
        pts.forEach((p, i) => i === 0 ? ctx.moveTo(p[0], p[1] + 2) : ctx.lineTo(p[0], p[1] + 2));
        ctx.stroke();

        ctx.strokeStyle = '#5D4037';
        ctx.lineWidth = width;
        ctx.beginPath();
        pts.forEach((p, i) => i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]));
        ctx.stroke();

        ctx.strokeStyle = '#8D6E63';
        ctx.lineWidth = width - 4;
        ctx.beginPath();
        pts.forEach((p, i) => i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]));
        ctx.stroke();

        ctx.strokeStyle = '#BCAAA4';
        ctx.lineWidth = 1.0;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        pts.forEach((p, i) => i === 0 ? ctx.moveTo(p[0], p[1] - 1.5) : ctx.lineTo(p[0], p[1] - 1.5));
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  });

  // Bypass road dynamic overlay: Blueprint badge vs Animated Milk Transport Truck
  const isBypassBuilt = isRoadBuilt('bypass_road_southern_pond');
  if (!isBypassBuilt) {
    ctx.save();
    ctx.fillStyle = 'rgba(5, 16, 9, 0.92)';
    ctx.beginPath();
    ctx.roundRect(970, 794, 220, 26, 6);
    ctx.fill();
    ctx.strokeStyle = '#00E5FF'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = '#00E5FF'; ctx.font = 'bold 10px JetBrains Mono'; ctx.textAlign = 'center';
    ctx.fillText('🛣️ Manhattan Bypass Blueprint (Click)', 1080, 811);
    ctx.restore();
  } else {
    drawMilkTransportTruck(ctx, animTime);
  }

  ctx.restore();
}

`;

content = content.substring(0, startIdx) + norm(newRoadsBlock) + content.substring(endIdx);

// 4. Update onClick in Map Controller (around line 4845)
const oldOnClick = `  onClick(e){
    const {cx, cy} = this.worldFromEvent(e);

    // Direct click on Southern Meadow Manhattan Bypass corridor
    const isGate = Math.hypot(cx - 1750, cy - 890) < 50;
    const isDairy = Math.hypot(cx - 200, cy - 770) < 60;
    const isLakeCenter = Math.hypot(cx - 630, cy - 870) < 130 || Math.hypot(cx - 1150, cy - 930) < 160;

    if (!isGate && !isDairy && !isLakeCenter && isNearBypassRoad(cx, cy)) {
      openWhyManhattanRoadModal();
      return;
    }

    // Direct click on 2-Basin Lake System (West Pond or East Big Pond)
    if (Math.hypot(cx - 630, cy - 870) < 160 || Math.hypot(cx - 1150, cy - 930) < 220) {
      openLakeModal();
      return;
    }

    // Direct click on any of the 9 Vineyard Beds
    for(let bi = 0; bi < VINEYARD_BEDS.length; bi++){
      const vb = VINEYARD_BEDS[bi];
      if (Math.abs(cx - vb.cx) < vb.w / 2 + 6 && Math.abs(cy - vb.cy) < vb.h / 2 + 6){
        openVineyardModal(bi);
        return;
      }
    }

    // Direct click on Cattle Pasture area
    if (Math.hypot(cx - 1360, cy - 285) < 160) {
      const catSite = SITES.find(s => s.id === 'cattle');
      if (catSite) { this.handle(catSite); return; }
    }

    for(const s of SITES){
      const mx = (s.markerX !== undefined) ? s.markerX : s.x;
      const my = (s.markerY !== undefined) ? s.markerY : (s.y - 58);
      const radius = s.action === 'pond' ? 120 : s.action === 'vine' ? 90 : 58;
      if (Math.hypot(cx - s.x, cy - s.y) < radius || Math.hypot(cx - mx, cy - my) < 22){
        this.handle(s);
        return;
      }
    }
  },`;

const newOnClick = `  onClick(e){
    const {cx, cy} = this.worldFromEvent(e);

    // Direct click on 2-Basin Lake System (West Pond or East Big Pond)
    if (Math.hypot(cx - 630, cy - 870) < 140 || Math.hypot(cx - 1150, cy - 930) < 180) {
      openLakeModal();
      return;
    }

    // Direct click on any of the 9 Vineyard Beds
    for(let bi = 0; bi < VINEYARD_BEDS.length; bi++){
      const vb = VINEYARD_BEDS[bi];
      if (Math.abs(cx - vb.cx) < vb.w / 2 + 6 && Math.abs(cy - vb.cy) < vb.h / 2 + 6){
        openVineyardModal(bi);
        return;
      }
    }

    // Direct click on Cattle Pasture area
    if (Math.hypot(cx - 1360, cy - 285) < 150) {
      const catSite = SITES.find(s => s.id === 'cattle');
      if (catSite) { this.handle(catSite); return; }
    }

    // Direct click on calibrated Sites
    for(const s of SITES){
      const mx = (s.markerX !== undefined) ? s.markerX : s.x;
      const my = (s.markerY !== undefined) ? s.markerY : (s.y - 58);
      const radius = s.action === 'pond' ? 120 : s.action === 'vine' ? 90 : 52;
      if (Math.hypot(cx - s.x, cy - s.y) < radius || Math.hypot(cx - mx, cy - my) < 22){
        this.handle(s);
        return;
      }
    }

    // Direct click on Alpenhof Civil Road Network
    const roadSeg = findRoadAtPoint(cx, cy);
    if (roadSeg) {
      if (roadSeg.id === 'bypass_road_southern_pond') {
        openWhyManhattanRoadModal();
      } else {
        openRoadNetworkModal(roadSeg.id);
      }
      return;
    }
  },`;

if (!content.includes(norm(oldOnClick))) {
  console.error('ERROR: oldOnClick not found!');
  process.exit(1);
}
content = content.replace(norm(oldOnClick), norm(newOnClick));

// 5. Redesigned Chapter Exploration Modal & Road Network Modal & Object Mappings
const oldMaster = `function openMaster(){
  let h = '<div class="modal-hdr"><h3>📋 6-Chapter Alpine Mastery Journey</h3><button class="btn-close" onclick="closeModal()">✕</button></div>';
  CHAPTERS.forEach(c => {
    const isCur = state.chapter === c.id;
    h += '<div class="card-box" style="margin-bottom:10px;border-color:' + (isCur ? 'var(--gold)' : 'var(--border)') + '">' +
         '<div style="display:flex;justify-content:space-between;align-items:center">' +
           '<b>Ch. ' + c.id + ': ' + c.title + '</b>' +
           '<span class="recall-tag">' + c.recall + '</span>' +
         '</div>' +
         '<p style="font-size:0.78rem;color:#A5D6A7;margin-top:4px">' + c.desc + '</p>' +
         '</div>';
  });
  openModal(h, true);
}`;

const newMaster = `/* =========================================================================
   REDESIGNED CHAPTER EXPLORATION & OBJECT ADDITIONS MODAL
   ========================================================================= */
const CHAPTER_OBJECTS = {
  1: {
    sites: [
      { id: 'gate', name: 'Alps Main Entrance Gate', icon: '🚪', cat: 'infra', getStatus: () => '✓ Surveyed & Active' },
      { id: 'orchard_p1', name: 'Streuobst Orchard Plot 1', icon: '🌳', cat: 'orchard', getStatus: () => (state.orchards['orchard_p1']?.aerated > 0) ? '✓ ' + state.orchards['orchard_p1'].aerated + '/9 Aerated' : '🔍 Unsurveyed Loam Crust' },
      { id: 'orchard_p2', name: 'Streuobst Orchard Plot 2', icon: '🌳', cat: 'orchard', getStatus: () => (state.orchards['orchard_p2']?.aerated > 0) ? '✓ ' + state.orchards['orchard_p2'].aerated + '/9 Aerated' : '🔍 Unsurveyed Loam Crust' },
      { id: 'orchard_p3', name: 'Streuobst Orchard Plot 3', icon: '🌳', cat: 'orchard', getStatus: () => (state.orchards['orchard_p3']?.aerated > 0) ? '✓ ' + state.orchards['orchard_p3'].aerated + '/9 Aerated' : '🔍 Unsurveyed Loam Crust' },
      { id: 'orchard_p4', name: 'Streuobst Orchard Plot 4', icon: '🌳', cat: 'orchard', getStatus: () => (state.orchards['orchard_p4']?.aerated > 0) ? '✓ ' + state.orchards['orchard_p4'].aerated + '/9 Aerated' : '🔍 Unsurveyed Loam Crust' },
      { id: 'orchard_p5', name: 'Streuobst Orchard Plot 5', icon: '🌳', cat: 'orchard', getStatus: () => (state.orchards['orchard_p5']?.aerated > 0) ? '✓ ' + state.orchards['orchard_p5'].aerated + '/9 Aerated' : '🔍 Unsurveyed Loam Crust' },
      { id: 'orchard_p6', name: 'Streuobst Orchard Plot 6', icon: '🌳', cat: 'orchard', getStatus: () => (state.orchards['orchard_p6']?.aerated > 0) ? '✓ ' + state.orchards['orchard_p6'].aerated + '/9 Aerated' : '🔍 Unsurveyed Loam Crust' },
      { id: 'bridge', name: 'Alpine Wooden Overbridge Site', icon: '🌉', cat: 'infra', getStatus: () => state.built['bridge'] ? '✓ Built' : '🔨 Needs Construction' }
    ],
    roads: ['main_arterial_primary', 'main_arterial_west_ingress']
  },
  2: {
    sites: [
      { id: 'farm_shed', name: 'Farm Shed & Workshop (Fendt Tractor)', icon: '🏚️', cat: 'infra', getStatus: () => state.built['farm_shed'] ? '✓ Built' : '🔨 Needs Construction' },
      { id: 'crew', name: 'Crew Shed & Labour HQ', icon: '🧑‍🌾', cat: 'labour', getStatus: () => state.built['crew'] ? '✓ Built (' + state.hired.length + ' Specialists Hired)' : '🔨 Needs Construction' }
    ],
    roads: ['sub_road_north_loop', 'garden_path_orchard_horiz_1', 'garden_path_orchard_horiz_2', 'garden_path_orchard_vert']
  },
  3: {
    sites: [
      { id: 'veg', name: '48-Plot Hexagonal Vegetable Garden', icon: '🥦', cat: 'veg', getStatus: () => (state.vegetables?.harvestedTotal || 0) > 0 ? '✓ Harvesting (' + state.vegetables.harvestedTotal + ' total)' : '✓ Operational Beds' },
      { id: 'flower_oval', name: 'Triangular 3-Oval Alpine Flower Garden', icon: '🌸', cat: 'flower', getStatus: () => (state.flowers?.harvestedHoney || 0) > 0 ? '✓ Active (' + state.flowers.harvestedHoney + ' kg Honey)' : '✓ Blooming Terraces' },
      { id: 'vineyard', name: 'Bavarian Heritage Vineyard (108 Vines)', icon: '🍇', cat: 'fruit', getStatus: () => state.built['vineyard'] ? '✓ Active (' + (state.vineyard?.harvested || 0) + ' Vintage Harvested)' : '🔨 Needs Commissioning' }
    ],
    roads: ['sub_road_east_slope', 'garden_path_veg_garden_vert', 'garden_path_veg_garden_horiz', 'garden_path_crop_field_vert', 'garden_path_crop_field_horiz', 'garden_path_flower_upper']
  },
  4: {
    sites: [
      { id: 'pond', name: 'Living Waters Alpine Lake System', icon: '💧', cat: 'water', getStatus: () => state.lake?.stage >= 3 ? '✓ Fully Excavated & Stocked' : (state.lake?.stage > 0 ? '🚧 In Excavation (Stage ' + state.lake.stage + ')' : '🔨 Needs Excavation') },
      { id: 'cattle', name: 'Hillside Cattle Pasture Enclosure', icon: '🐄', cat: 'livestock', getStatus: () => state.built['cattle'] ? '✓ Active Pasture (' + (state.cattle?.animals?.length || 0) + ' Animals)' : '🔨 Needs Construction' },
      { id: 'dairy_plant', name: 'Bavarian Heritage Dairy Processing Plant', icon: '🏭', cat: 'trade', getStatus: () => state.built['dairy_plant'] ? '✓ Active Käserei' : '🔨 Needs Construction' }
    ],
    roads: ['bypass_road_southern_pond', 'garden_path_pond_edge']
  },
  5: {
    sites: [
      { id: 'solar', name: '4×4 Agrivoltaic Solar Farm', icon: '☀️', cat: 'energy', getStatus: () => state.solar?.stage >= 4 ? '✓ 16/16 Modules Active' : (state.solar?.stage > 0 ? '🚧 Stage ' + state.solar.stage + '/4' : '🔨 Needs Construction') },
      { id: 'bess', name: 'Energy Storage Farm (BESS)', icon: '⚡', cat: 'energy', getStatus: () => state.built['bess'] ? '✓ Intertie Active' : '🔨 Needs Construction' },
      { id: 'wind_w', name: 'Wind Turbine West (High Ridge)', icon: '🌬️', cat: 'energy', getStatus: () => state.built['wind_w'] ? '✓ Spinning' : '🔨 Needs Construction' },
      { id: 'wind_e', name: 'Wind Turbine East (Alpine Hilltop)', icon: '🌬️', cat: 'energy', getStatus: () => state.built['wind_e'] ? '✓ Spinning' : '🔨 Needs Construction' }
    ],
    roads: []
  },
  6: {
    sites: [
      { id: 'restaurant', name: 'Alpenhof Gasthof & Village Restaurant', icon: '🍽️', cat: 'trade', getStatus: () => state.built['restaurant'] ? '✓ Open & Dispensing' : '🔨 Needs Construction' },
      { id: 'juice', name: 'Hof-Mosterei & Artisan Juice Bar', icon: '🧃', cat: 'trade', getStatus: () => state.built['juice'] ? '✓ Cold Press Active' : '🔨 Needs Construction' },
      { id: 'dairy_market', name: 'Alpenhof Farm Marketplace & Molkerei', icon: '🧀', cat: 'trade', getStatus: () => state.built['dairy_market'] ? '✓ Sales Stand Active' : '🔨 Needs Commissioning' },
      { id: 'bbq', name: 'Hilltop Tourist BBQ & Food Stand', icon: '🍖', cat: 'trade', getStatus: () => state.bbq?.stage >= 3 ? '✓ 4 Fire Pits Active' : (state.bbq?.stage > 0 ? '🚧 Stage ' + state.bbq.stage + '/3' : '🔨 Needs Construction') }
    ],
    roads: ['sub_road_right_hub_link']
  }
};

window.openSiteById = function(id){
  const s = SITES.find(x => x.id === id);
  if (s) {
    openSiteModal(s);
  } else {
    toast('Site ' + id + ' located on map');
  }
};

function renderMasterRoadsTab(){
  let h = '<div class="card-box" style="margin-bottom:14px;border-color:var(--cyan);background:rgba(8,24,32,0.92)">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">' +
            '<div>' +
              '<h4 style="font-size:1.0rem;color:var(--cyan);margin:0">🛣️ Alpenhof Civil Road Network Suite</h4>' +
              '<div style="font-size:0.75rem;color:#B2EBF2;margin-top:2px">15 Segments · 4 Calibrated Road Standards · High-Load Transport Infrastructure</div>' +
            '</div>' +
            '<button class="btn btn-g" style="font-size:0.75rem;padding:6px 12px" onclick="buildEntireRoadNetwork()">🔨 Pave Entire Network (25% Off · +180 XP)</button>' +
          '</div>' +
          '</div>';

  // 4 Road Type Groups
  Object.values(ROAD_TYPE_SPECS).forEach(spec => {
    const segs = ALPENHOF_ROAD_NETWORK.filter(r => r.road_type === spec.id);
    const builtCount = segs.filter(r => isRoadBuilt(r.id)).length;
    const allBuilt = builtCount === segs.length;

    h += '<div class="card-box" style="margin-bottom:12px;border-color:' + (allBuilt ? 'var(--teal)' : 'var(--border)') + ';background:rgba(12,20,16,0.9)">' +
         '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:6px">' +
           '<div>' +
             '<b style="font-size:0.88rem;color:' + spec.color + '">' + spec.name + '</b> ' +
             '<span style="font-size:0.72rem;color:#A5D6A7">(' + builtCount + '/' + segs.length + ' Paved)</span>' +
           '</div>' +
           (!allBuilt ? '<button class="btn btn-a" style="font-size:0.70rem;padding:4px 8px" onclick="buildRoadTypeGroup(&apos;' + spec.id + '&apos;)">Pave Group (' + (segs.length - builtCount) + ' segments)</button>' : '<span style="font-size:0.72rem;color:var(--teal)">✓ Completed</span>') +
         '</div>' +
         '<div style="font-size:0.73rem;color:#ECEFF1;margin-bottom:6px">' +
           '<b>Material:</b> ' + spec.materialName + '<br/>' +
           '<b>Width:</b> ' + spec.defaultWidth + 'px · <b>Traversable:</b> ' + spec.traversable + '<br/>' +
           '<b>Civil Benefit:</b> ' + spec.benefits +
         '</div>' +
         '<div class="grid-2" style="gap:6px">';

    segs.forEach(s => {
      const b = isRoadBuilt(s.id);
      h += '<div style="background:rgba(20,32,24,0.7);border:1px solid ' + (b ? 'rgba(0,230,118,0.3)' : 'rgba(255,255,255,0.12)') + ';border-radius:8px;padding:6px 8px;display:flex;justify-content:space-between;align-items:center">' +
             '<div style="overflow:hidden">' +
               '<div style="font-size:0.74rem;font-weight:700;color:#E8F5E9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + s.role + '</div>' +
               '<div style="font-size:0.67rem;color:' + (b ? '#A5D6A7' : '#FFE082') + '">' + (b ? '✓ Paved (' + s.width_px + 'px)' : '🚧 Unbuilt (' + s.width_px + 'px)') + '</div>' +
             '</div>' +
             '<button class="btn ' + (b ? 'btn-c' : 'btn-a') + '" style="font-size:0.66rem;padding:3px 7px;margin-left:6px" onclick="openRoadNetworkModal(&apos;' + s.id + '&apos;)">' + (b ? 'Inspect' : 'Pave') + '</button>' +
           '</div>';
    });

    h += '</div></div>';
  });

  return h;
}

function openMaster(tabId){
  const activeTab = tabId || 'all';
  let h = '<div class="modal-hdr"><h3>📋 6-Chapter Alpine Mastery Journey</h3><button class="btn-close" onclick="closeModal()">✕</button></div>';

  // Navigation Tabs: All Chapters, Ch 1..6, and Road Network
  h += '<div class="why-tabs" style="margin-bottom:14px;display:flex;flex-wrap:wrap;gap:5px">';
  h += '<button class="why-tab ' + (activeTab === 'all' ? 'active' : '') + '" onclick="openMaster(&apos;all&apos;)">📋 All Chapters</button>';
  for (let c = 1; c <= 6; c++) {
    h += '<button class="why-tab ' + (activeTab === ('ch' + c) ? 'active' : '') + '" onclick="openMaster(&apos;ch' + c + '&apos;)">Ch. ' + c + '</button>';
  }
  h += '<button class="why-tab ' + (activeTab === 'roads' ? 'active' : '') + '" onclick="openMaster(&apos;roads&apos;)">🛣️ Road Network (' + ALPENHOF_ROAD_NETWORK.length + ')</button>';
  h += '</div>';

  if (activeTab === 'roads') {
    // Road Network Exploration View
    h += renderMasterRoadsTab();
  } else {
    // Chapters View (either all chapters or single chapter)
    const listToRender = (activeTab === 'all') ? CHAPTERS : CHAPTERS.filter(c => ('ch' + c.id) === activeTab);
    listToRender.forEach(c => {
      const isCur = state.chapter === c.id;
      const isDone = state.chapter > c.id;
      h += '<div class="card-box" style="margin-bottom:14px;border-color:' + (isCur ? 'var(--gold)' : isDone ? 'var(--teal)' : 'var(--border)') + ';background:rgba(12,24,16,0.92)">' +
           '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">' +
             '<div style="display:flex;align-items:center;gap:8px">' +
               '<span style="font-size:1.1rem">' + (isDone ? '✓' : isCur ? '⚡' : '🔒') + '</span>' +
               '<b style="font-size:0.95rem;color:' + (isCur ? 'var(--gold)' : isDone ? 'var(--teal)' : '#CFD8DC') + '">Ch. ' + c.id + ': ' + c.title + '</b>' +
             '</div>' +
             '<span class="recall-tag">' + c.recall + '</span>' +
           '</div>' +
           '<p style="font-size:0.78rem;color:#A5D6A7;margin:8px 0">' + c.desc + '</p>';

      // Chapter Associated Objects & Facilities Grid
      const chapObj = CHAPTER_OBJECTS[c.id];
      if (chapObj && chapObj.sites && chapObj.sites.length > 0) {
        h += '<div style="margin-top:10px">' +
             '<div style="font-size:0.72rem;font-weight:800;color:var(--gold);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">🏛️ Associated Facilities & Plots (' + chapObj.sites.length + ' Objects):</div>' +
             '<div class="grid-2" style="gap:8px">';
        chapObj.sites.forEach(s => {
          const statusText = s.getStatus();
          const isBuilt = statusText.startsWith('✓');
          h += '<div style="background:rgba(20,35,25,0.7);border:1px solid ' + (isBuilt ? 'rgba(0,230,118,0.3)' : 'rgba(255,255,255,0.12)') + ';border-radius:10px;padding:8px;display:flex;justify-content:space-between;align-items:center">' +
                 '<div>' +
                   '<div style="font-size:0.80rem;font-weight:700;color:#E8F5E9">' + s.icon + ' ' + s.name + '</div>' +
                   '<div style="font-size:0.70rem;color:' + (isBuilt ? '#A5D6A7' : '#FFE082') + '">' + statusText + '</div>' +
                 '</div>' +
                 '<button class="btn ' + (isBuilt ? 'btn-c' : 'btn-g') + '" style="font-size:0.68rem;padding:4px 8px;margin-left:6px" onclick="openSiteById(&apos;' + s.id + '&apos;)">' + (isBuilt ? 'Inspect' : 'Explore') + '</button>' +
               '</div>';
        });
        h += '</div></div>';
      }

      // Chapter Associated Roads
      if (chapObj && chapObj.roads && chapObj.roads.length > 0) {
        h += '<div style="margin-top:10px">' +
             '<div style="font-size:0.72rem;font-weight:800;color:var(--cyan);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">🛣️ Associated Road Logistics (' + chapObj.roads.length + ' Segments):</div>' +
             '<div class="grid-2" style="gap:8px">';
        chapObj.roads.forEach(rid => {
          const rSeg = ALPENHOF_ROAD_NETWORK.find(r => r.id === rid);
          if (rSeg) {
            const rBuilt = isRoadBuilt(rSeg.id);
            const rSpec = ROAD_TYPE_SPECS[rSeg.road_type];
            h += '<div style="background:rgba(18,28,34,0.75);border:1px solid ' + (rBuilt ? 'rgba(0,229,255,0.35)' : 'rgba(255,255,255,0.12)') + ';border-radius:10px;padding:8px;display:flex;justify-content:space-between;align-items:center">' +
                   '<div>' +
                     '<div style="font-size:0.78rem;font-weight:700;color:#E0F7FA">🛣️ ' + rSeg.role + '</div>' +
                     '<div style="font-size:0.69rem;color:' + (rBuilt ? '#80DEEA' : '#FFD54F') + '">' + (rBuilt ? '✓ Paved (' + rSeg.width_px + 'px ' + rSpec.materialName.split(' ')[0] + ')' : '🚧 Unpaved Blueprint') + '</div>' +
                   '</div>' +
                   '<button class="btn ' + (rBuilt ? 'btn-c' : 'btn-a') + '" style="font-size:0.68rem;padding:4px 8px;margin-left:6px" onclick="openRoadNetworkModal(&apos;' + rSeg.id + '&apos;)">' + (rBuilt ? 'Inspect' : 'Pave') + '</button>' +
                 '</div>';
          }
        });
        h += '</div></div>';
      }

      h += '</div>';
    });
  }

  openModal(h, true);
}
window.openMaster = openMaster;`;

if (!content.includes(norm(oldMaster))) {
  console.error('ERROR: oldMaster not found!');
  process.exit(1);
}
content = content.replace(norm(oldMaster), norm(newMaster));

// 6. Road Network Engineering Modal & openWhyManhattanRoadModal integration
const oldManhattanBlockStart = `/* ================= SOUTHERN MEADOW MANHATTAN BYPASS MAIN ROAD MODAL & ACTIONS ================= */`;
const oldManhattanBlockEnd = `function openWhy(){`;

const mStartIdx = content.indexOf(oldManhattanBlockStart);
const mEndIdx = content.indexOf(oldManhattanBlockEnd);
if (mStartIdx === -1 || mEndIdx === -1) {
  console.error('ERROR: oldManhattanBlock bounds not found!');
  process.exit(1);
}

const newRoadModalBlock = `/* ================= ROAD NETWORK ENGINEERING & LOGISTICS MODAL ================= */
window.openRoadNetworkModal = function(segId){
  const seg = ALPENHOF_ROAD_NETWORK.find(r => r.id === segId) || ALPENHOF_ROAD_NETWORK[0];
  const spec = ROAD_TYPE_SPECS[seg.road_type];
  const built = isRoadBuilt(seg.id);
  const currentStep = (state.built && state.built.road_steps && state.built.road_steps[seg.id]) || (built ? 2 : 0);

  let h = '<div class="modal-hdr"><h3>🛣️ ' + seg.role + '</h3><button class="btn-close" onclick="closeModal()">✕</button></div>';
  h += '<p style="font-size:0.80rem;color:#A5D6A7;margin-bottom:12px">' + spec.name + ' · Width: ' + seg.width_px + 'px (' + spec.defaultWidth + 'm equivalent) · Waypoints: ' + seg.waypoints.length + '</p>';

  if (!built) {
    h += '<div class="card-box" style="margin-bottom:12px;border-color:var(--gold);background:rgba(25,20,10,0.85)">' +
         '<div style="display:flex;justify-content:space-between;align-items:center">' +
           '<b>🚧 Civil Construction Blueprint Required:</b>' +
           '<span style="font-size:0.75rem;color:var(--gold)">Stage ' + currentStep + '/2</span>' +
         '</div>' +
         '<p style="font-size:0.76rem;color:#FFE082;margin:6px 0">' + spec.desc + '</p>' +
         '<div style="font-size:0.73rem;color:#CFD8DC;margin-bottom:10px">' +
           '• <b>Step 1:</b> ' + spec.steps[0].name + ' (€' + spec.steps[0].cost + ' · +' + spec.steps[0].xp + ' XP)<br/>' +
           '• <b>Step 2:</b> ' + spec.steps[1].name + ' (€' + spec.steps[1].cost + ' · +' + spec.steps[1].xp + ' XP)' +
         '</div>' +
         '<div class="grid-2" style="gap:8px">' +
           (currentStep === 0 ?
             '<button class="btn btn-g" onclick="buildRoadSegment(&apos;' + seg.id + '&apos;, 1)">1. Excavate Subgrade (€' + spec.steps[0].cost + ')</button>' :
             '<button class="btn btn-c" disabled>✓ Subgrade Excavated</button>') +
           (currentStep >= 1 ?
             '<button class="btn btn-g" onclick="buildRoadSegment(&apos;' + seg.id + '&apos;, 2)">2. Pave & Kerb (€' + spec.steps[1].cost + ')</button>' :
             '<button class="btn btn-a" onclick="buildRoadSegment(&apos;' + seg.id + '&apos;, 0)">Instant Pave (€' + spec.totalCost + ' · +' + (spec.steps[0].xp + spec.steps[1].xp) + ' XP)</button>') +
         '</div>' +
         '</div>';
  } else {
    h += '<div class="card-box" style="margin-bottom:12px;border-color:var(--teal);background:rgba(8,24,14,0.85);display:flex;justify-content:space-between;align-items:center">' +
         '<div><b style="color:var(--teal)">✓ Fully Engineered & Operational</b>' +
         '<div style="font-size:0.75rem;color:#C8E6C9">' + spec.materialName + ' · 0% soil compaction · Active transport</div></div>' +
         '<div style="font-size:0.85rem">🚚 <b>Active Track</b></div>' +
         '</div>';
  }

  // 4 Core Technical Analysis Sections
  h += '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px">';
  h += '<div class="card-box" style="padding:10px;background:rgba(12,24,16,0.9)">' +
       '<h4 style="font-size:0.80rem;color:var(--gold);margin-bottom:4px">1. 🚜 Road Materials & Soil Mechanics</h4>' +
       '<p style="font-size:0.74rem;color:#CFD8DC">' +
       '• <b>Material Composition:</b> ' + spec.materialName + '.<br/>' +
       '• <b>Traversable by:</b> ' + spec.traversable + '.<br/>' +
       '• <b>Ecological Impact:</b> Engineered sub-base prevents deep tyre rutting, eliminates heavy clay compaction, and stabilizes water runoff away from sensitive planting zones.' +
       '</p>' +
       '</div>';

  h += '<div class="card-box" style="padding:10px;background:rgba(12,24,16,0.9)">' +
       '<h4 style="font-size:0.80rem;color:var(--cyan);margin-bottom:4px">2. 📐 Transport Logistics & Route Optimization</h4>' +
       '<p style="font-size:0.74rem;color:#CFD8DC">' +
       '• <b>Logistics Role:</b> ' + spec.benefits + '<br/>' +
       '• <b>Civil Integration:</b> Connected seamlessly to Alps Gate (1750, 890), Central Valley Crossroads (1120, 605), and Western Facilities (175, 600).' +
       '</p>' +
       '</div>';

  h += '<div class="why-card" style="margin-top:2px">' +
       '<b>🇩🇪 German Farm Recall Link: Transportation Infrastructure & Civil Logistics</b>' +
       '<div class="recall-box">Echoing German Farm Ch. 2 (Infrastructure & Tilth) and Ch. 6 (Eco-Village Logistics), arterial farm roads must balance shortest-path vehicle logistics against soil compaction and ecological tranquility. By utilizing permeable pea gravel, compact loam, and beveled cobblestone, Alpenhof preserves topsoil health while sustaining industrial throughput.</div>' +
       '</div>';

  h += '</div>';

  h += '<div style="display:flex;justify-content:space-between;gap:8px">' +
       '<button class="btn btn-c" style="flex:1" onclick="openMaster(&apos;roads&apos;)">⬅️ View All Roads (15 Segments)</button>' +
       (!built ? '<button class="btn btn-g" style="flex:1" onclick="buildRoadSegment(&apos;' + seg.id + '&apos;, 0)">🔨 Construct Road (€' + (currentStep === 1 ? spec.steps[1].cost : spec.totalCost) + ')</button>' : '') +
       '</div>';

  openModal(h, true);
};

window.openWhyManhattanRoadModal = function(){
  const built = isRoadBuilt('bypass_road_southern_pond');
  let h = '<div class="modal-hdr"><h3>🛣️ Southern Meadow Manhattan Bypass Main Road</h3><button class="btn-close" onclick="closeModal()">✕</button></div>';
  h += '<p style="font-size:0.80rem;color:#A5D6A7;margin-bottom:10px">Direct Agricultural Arterial Highway · Connecting Main Gate (1750, 890) to Dairy Processing Plant (200, 770) past Living Lake</p>';

  if (!built) {
    h += '<div class="card-box" style="margin-bottom:12px;border-color:var(--gold);background:rgba(25,20,10,0.85)">' +
         '<b>🚧 Unbuilt Logistics Blueprint Corridor:</b><br/>' +
         '<span style="font-size:0.78rem;color:#FFE082">Construct 1,580m direct logistics highway across the southern meadow margin, bypassing eastern village congestion and saving 670m per milk transport haul.</span><br/>' +
         '<div class="grid-2" style="margin-top:10px;gap:8px">' +
           '<button class="btn btn-g" onclick="buildRoadSegment(&apos;bypass_road_southern_pond&apos;, 1)">1. Shoreline Earthworks (€40)</button>' +
           '<button class="btn btn-a" onclick="buildDairyRoad()">Direct Pave (€90 · +30 XP · +15 O₂)</button>' +
         '</div>' +
         '</div>';
  } else {
    h += '<div class="card-box" style="margin-bottom:12px;border-color:var(--teal);background:rgba(8,24,14,0.85);display:flex;justify-content:space-between;align-items:center">' +
         '<div><b style="color:var(--teal)">✓ Active Manhattan Logistics Arterial Highway</b>' +
         '<div style="font-size:0.75rem;color:#C8E6C9">Cobblestone highway operational · Animated milk transport truck active</div></div>' +
         '<div style="font-size:0.85rem">🚚 <b>Saving 670m / Run</b></div>' +
         '</div>';
  }

  // 4 Core Analysis Sections: Bottlenecks, Shortest Path Manhattan Routing, Fuel Economics, Civil Redundancy
  h += '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px">';
  h += '<div class="card-box" style="padding:10px;background:rgba(12,24,16,0.9)">' +
       '<h4 style="font-size:0.80rem;color:var(--gold);margin-bottom:4px">1. 🚜 Agricultural Logistics Bottleneck Mitigation</h4>' +
       '<p style="font-size:0.74rem;color:#CFD8DC">Prior to this bypass, heavy raw milk tankers, silage trailers, and cold-chain haulers entered via Main Gate (1750, 890) and were forced through the pedestrian Eastern Village Plaza and Gasthof terrace (1620, 530), causing severe noise, tourist conflict, and tight turning hazards at the central crossroads.</p>' +
       '</div>';

  h += '<div class="card-box" style="padding:10px;background:rgba(12,24,16,0.9)">' +
       '<h4 style="font-size:0.80rem;color:var(--cyan);margin-bottom:4px">2. 📐 Shortest-Path Manhattan Grid Routing (~30% Route Reduction)</h4>' +
       '<p style="font-size:0.74rem;color:#CFD8DC">' +
       '• <b>Existing Detour:</b> Gate ➔ Village Plaza ➔ Central Crossroads ➔ West Branch ➔ Dairy = <b>~2,250 meters</b>.<br/>' +
       '• <b>Manhattan Direct Bypass:</b> Gate (1750, 890) ➔ Southern Meadow Causeway ➔ Dairy (200, 770) = <b>~1,580 meters</b>.<br/>' +
       '• <b>Efficiency Gain:</b> <b>670 meters saved per trip (~30% route reduction)</b>, closely approximating the optimal <i>L₁</i> Manhattan distance (|Δx| + |Δy| = 1,670m).' +
       '</p>' +
       '</div>';

  h += '<div class="card-box" style="padding:10px;background:rgba(12,24,16,0.9)">' +
       '<h4 style="font-size:0.80rem;color:var(--amber);margin-bottom:4px">3. ⛽ Transporter Fuel Economics & Cold-Chain Preservation</h4>' +
       '<p style="font-size:0.74rem;color:#CFD8DC">' +
       '• <b>Fuel & Carbon:</b> Saves <b>~4.2 Liters of diesel</b> and prevents <b>11.2 kg CO₂ emissions</b> per round trip.<br/>' +
       '• <b>Transit Time:</b> Cuts transit duration from 18 minutes down to <b>6 minutes</b>, preventing warm milk churn vibration, minimizing lactic acid spikes, and preserving top-tier butterfat quality for the Alpen-Käserei.' +
       '</p>' +
       '</div>';

  h += '<div class="card-box" style="padding:10px;background:rgba(12,24,16,0.9)">' +
       '<h4 style="font-size:0.80rem;color:#81C784;margin-bottom:4px">4. 🛡️ Civil Engineering Redundancy & Pedestrian Safety</h4>' +
       '<p style="font-size:0.74rem;color:#CFD8DC">Segregates industrial heavy freight from the serene natural shoreline of the Living Waters Lake and Flower Gardens. Provides life-saving civil redundancy if winter snowdrifts or springtime mud torrents block the northern crossroad passes.</p>' +
       '</div>';

  h += '<div class="why-card" style="margin-top:2px">' +
       '<b>🇩🇪 German Farm Recall Link: Transportation Infrastructure & Logistics</b>' +
       '<div class="recall-box">Echoing German Farm Ch. 2 (Infrastructure & Tilth), arterial farm roads must balance shortest-path vehicle logistics against soil compaction and ecological tranquility. By hugging the meadow revetment, the bypass preserves the farm inner core while ensuring rapid industrial transport.</div>' +
       '</div>';

  h += '</div>';

  h += '<div style="display:flex;justify-content:space-between;gap:8px">' +
       '<button class="btn btn-c" style="flex:1" onclick="openRoadNetworkModal(&apos;bypass_road_southern_pond&apos;)">🛣️ Road Engineering Specs</button>' +
       (!built ? '<button class="btn btn-g" style="flex:1" onclick="buildDairyRoad()">🔨 Construct Southern Bypass Road (€90)</button>' : '') +
       '</div>';

  openModal(h, true);
};

window.buildDairyRoad = function(){
  if (state.money < 90) { toast('Need €90 to construct the bypass road'); return; }
  state.money -= 90;
  if (!state.built) state.built = {};
  if (!state.built.roads) state.built.roads = {};
  if (!state.built.road_steps) state.built.road_steps = {};
  state.built['road_dairy_bypass'] = true;
  state.built.roads['bypass_road_southern_pond'] = true;
  state.built.road_steps['bypass_road_southern_pond'] = 2;
  grantXP({oxygen: 15, biodiversity: 15});
  toast('🛣️ Southern Meadow Manhattan Bypass Constructed! Milk tankers dispatched');
  renderScoreboard();
  openWhyManhattanRoadModal();
};

window.buildRoadSegment = function(segId, step){
  const seg = ALPENHOF_ROAD_NETWORK.find(r => r.id === segId);
  if (!seg) return;
  const spec = ROAD_TYPE_SPECS[seg.road_type];
  if (!state.built) state.built = {};
  if (!state.built.roads) state.built.roads = {};
  if (!state.built.road_steps) state.built.road_steps = {};

  const currentStep = state.built.road_steps[segId] || 0;

  if (step === 1) {
    const s1 = spec.steps[0];
    if (state.money < s1.cost) { toast('Need €' + s1.cost + ' for ' + s1.name); return; }
    state.money -= s1.cost;
    state.xp += s1.xp;
    grantXP({ oxygen: s1.o2 });
    state.built.road_steps[segId] = 1;
    toast('🔨 Completed Step 1: ' + s1.name + ' (+€' + s1.cost + ' spent · +' + s1.xp + ' XP)');
  } else if (step === 2) {
    const s2 = spec.steps[1];
    if (state.money < s2.cost) { toast('Need €' + s2.cost + ' for ' + s2.name); return; }
    state.money -= s2.cost;
    state.xp += s2.xp;
    grantXP({ oxygen: s2.o2 });
    state.built.road_steps[segId] = 2;
    state.built.roads[segId] = true;
    if (segId === 'bypass_road_southern_pond') state.built['road_dairy_bypass'] = true;
    toast('🎉 Paved & Operational: ' + seg.role + ' (+€' + s2.cost + ' spent · +' + s2.xp + ' XP)');
  } else {
    // Instant full build
    const remainingCost = (currentStep === 1) ? spec.steps[1].cost : spec.totalCost;
    if (state.money < remainingCost) { toast('Need €' + remainingCost + ' to complete this road'); return; }
    state.money -= remainingCost;
    const totalXP = (currentStep === 1) ? spec.steps[1].xp : (spec.steps[0].xp + spec.steps[1].xp);
    const totalO2 = (currentStep === 1) ? spec.steps[1].o2 : (spec.steps[0].o2 + spec.steps[1].o2);
    state.xp += totalXP;
    grantXP({ oxygen: totalO2 });
    state.built.road_steps[segId] = 2;
    state.built.roads[segId] = true;
    if (segId === 'bypass_road_southern_pond') state.built['road_dairy_bypass'] = true;
    toast('🛣️ ' + seg.role + ' fully constructed & paved!');
  }
  if (typeof renderScoreboard === 'function') renderScoreboard();
  openRoadNetworkModal(segId);
};

window.buildRoadTypeGroup = function(typeKey){
  const spec = ROAD_TYPE_SPECS[typeKey];
  if (!state.built) state.built = {};
  if (!state.built.roads) state.built.roads = {};
  if (!state.built.road_steps) state.built.road_steps = {};
  const segments = ALPENHOF_ROAD_NETWORK.filter(r => r.road_type === typeKey && !isRoadBuilt(r.id));
  if (segments.length === 0) { toast('All ' + spec.name + ' segments are already built!'); return; }
  let totalCost = 0;
  segments.forEach(s => totalCost += spec.totalCost);
  const discountedCost = Math.round(totalCost * 0.85);
  if (state.money < discountedCost) { toast('Need €' + discountedCost + ' to commission all ' + segments.length + ' segments'); return; }
  state.money -= discountedCost;
  const xpReward = segments.length * 25;
  state.xp += xpReward;
  grantXP({ oxygen: segments.length * 12 });
  segments.forEach(s => {
    state.built.roads[s.id] = true;
    state.built.road_steps[s.id] = 2;
    if (s.id === 'bypass_road_southern_pond') state.built['road_dairy_bypass'] = true;
  });
  toast('🎉 Commissioned ' + segments.length + ' segments of ' + spec.name + '! (+€' + discountedCost + ' · +' + xpReward + ' XP)');
  if (typeof renderScoreboard === 'function') renderScoreboard();
  openRoadNetworkModal(segments[0].id);
};

window.buildEntireRoadNetwork = function(){
  if (!state.built) state.built = {};
  if (!state.built.roads) state.built.roads = {};
  if (!state.built.road_steps) state.built.road_steps = {};
  const unbuilt = ALPENHOF_ROAD_NETWORK.filter(r => !isRoadBuilt(r.id));
  if (unbuilt.length === 0) { toast('The entire Alpenhof Road Network is already paved!'); return; }
  let rawCost = 0;
  unbuilt.forEach(s => rawCost += (ROAD_TYPE_SPECS[s.road_type] ? ROAD_TYPE_SPECS[s.road_type].totalCost : 100));
  const packageCost = Math.round(rawCost * 0.75);
  if (state.money < packageCost) { toast('Need €' + packageCost + ' for master network package'); return; }
  state.money -= packageCost;
  state.xp += 180;
  grantXP({ oxygen: 90, biodiversity: 40 });
  unbuilt.forEach(s => {
    state.built.roads[s.id] = true;
    state.built.road_steps[s.id] = 2;
    if (s.id === 'bypass_road_southern_pond') state.built['road_dairy_bypass'] = true;
  });
  toast('🏆 Full Alpenhof Civil Road Network Commissioned! 15 segments paved');
  if (typeof renderScoreboard === 'function') renderScoreboard();
  openRoadNetworkModal(unbuilt[0].id);
};

`;

content = content.substring(0, mStartIdx) + norm(newRoadModalBlock) + content.substring(mEndIdx);

// Validate script syntax before writing
const scriptMatch = content.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/i);
if (!scriptMatch) {
  console.error('FATAL: No <script> found in content!');
  process.exit(1);
}
try {
  new Function(scriptMatch[1]);
  console.log('✓ In-memory JavaScript syntax validation PASSED!');
} catch (err) {
  console.error('FATAL: JavaScript syntax validation FAILED:', err.message);
  process.exit(1);
}

// Write to bavaria/alpenhof.html
fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully updated bavaria/alpenhof.html, new length:', content.length);

// Copy byte-for-byte to public/bavaria/alpenhof.html
fs.copyFileSync(targetFile, publicFile);
console.log('Successfully copied byte-for-byte to public/bavaria/alpenhof.html');

// Verify 100% byte parity
const b1 = fs.readFileSync(targetFile);
const b2 = fs.readFileSync(publicFile);
if (b1.equals(b2)) {
  console.log('✓ 100% BYTE PARITY VERIFIED (' + b1.length + ' bytes)');
} else {
  console.error('ERROR: Byte parity failed!');
  process.exit(1);
}
