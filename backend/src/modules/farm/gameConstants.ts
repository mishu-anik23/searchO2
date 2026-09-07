// Authoritative port of searchO2 Game Design Blueprint v2 & Prototype v4 Game Constants

export const REAL_MS_PER_GAME_HOUR_SPEC = 15 * 60 * 1000; // 15 min real = 1 game hour (1:4 ratio)
export const SEASON_LEN_GAME_HOURS = 96;

export const SEASONS = [
  { name: 'Spring', emoji: '🌱', growth: 1.20, income: 1.00 },
  { name: 'Summer', emoji: '☀️', growth: 1.00, income: 1.25 },
  { name: 'Autumn', emoji: '🍂', growth: 1.00, income: 1.20 },
  { name: 'Winter', emoji: '❄️', growth: 0.85, income: 1.00 },
];

export const O2_RATE = 0.03; // €0.03 per O2 unit
export const PREP_DURATION_HOURS = 3;
export const CLEAR_DURATION_HOURS = 2;
export const CLEAR_COST = 35;
export const OVERGROWN_THRESHOLD = 130; // game hours of neglect before plot is overgrown
export const LABOR_COST = 25; // Dig Land cost

export const STORAGE_COST = 550;
export const STORAGE_BUILD_HOURS = 10;
export const STORAGE_BASE_CAPACITY = 200;
export const STORAGE_EXPAND_CAPACITY = 150;
export const STORAGE_EXPAND_BASE_COST = 500;
export const STORAGE_EXPAND_HOURS = 6;

export const LOAN_OPTIONS: Record<string, { label: string; principal: number; rate: number; termDays: number }> = {
  small: { label: 'Small Loan', principal: 2000, rate: 0.05, termDays: 10 },
  medium: { label: 'Medium Loan', principal: 5000, rate: 0.08, termDays: 20 },
  mortgage: { label: 'Farm Mortgage', principal: 12000, rate: 0.12, termDays: 40 },
};
export const BANKRUPTCY_TRIGGER = -50;
export const LOAN_PENALTY_RATE = 0.05;

export const BUILDING_TYPES: Record<string, { label: string; cost: number; buildHours: number; category: string; reputationBonus: number; upkeep?: number; processRate?: number; conversionRate?: number }> = {
  garden: { label: 'Garden', cost: 300, buildHours: 4, category: 'decorative', reputationBonus: 8 },
  pond: { label: 'Pond', cost: 400, buildHours: 5, category: 'decorative', reputationBonus: 10 },
  coffee_shop: { label: 'Coffee Shop', cost: 800, buildHours: 8, category: 'revenue', reputationBonus: 5, upkeep: 15, processRate: 6, conversionRate: 1.8 },
  juice_bar: { label: 'Juice Bar', cost: 700, buildHours: 7, category: 'revenue', reputationBonus: 5, upkeep: 12, processRate: 5, conversionRate: 1.6 },
};

export const FLOWER_TYPES = {
  tulips: { label: 'Tulips', cost: 40, reputation: 2 },
  roses: { label: 'Roses', cost: 60, reputation: 4 },
  sunflowers: { label: 'Sunflowers', cost: 75, reputation: 5 },
  daisies: { label: 'Daisies', cost: 35, reputation: 2 },
};

export const POND_SPECIALIZATIONS: Record<string, { label: string; productRate: number; feedCost: number }> = {
  fish: { label: 'Fish Farm', productRate: 5, feedCost: 8 },
  duck: { label: 'Duck Farm', productRate: 4.5, feedCost: 10 },
};

export const GARDEN_FRESHNESS_DECAY = 0.8; // % decay per game hour
export const POND_FRESHNESS_DECAY = 0.7;   // % decay per game hour
export const TEND_GARDEN_COST = 20;
export const TEND_GARDEN_RESTORE = 40;
export const POND_FEED_RESTORE = 45;

export const TREE_DRY_THRESHOLD_HOURS = 20; // Zero health for 20 hours triggers tree death

export const REMOVE_CONFIG: Record<string, { cost: number; hours: number; tool: string; vehicle: boolean; salvagePct: number }> = {
  'Oxygen Tree': { cost: 60, hours: 5, tool: 'chainsaw', vehicle: true, salvagePct: 0.30 },
  'Timber Tree': { cost: 90, hours: 7, tool: 'chainsaw', vehicle: true, salvagePct: 0.50 },
  'Fruit Tree': { cost: 40, hours: 3, tool: 'saw', vehicle: true, salvagePct: 0.15 },
  'Biodiversity Tree': { cost: 35, hours: 3, tool: 'saw', vehicle: false, salvagePct: 0.10 },
  'Vegetable': { cost: 10, hours: 1, tool: 'hand', vehicle: false, salvagePct: 0.00 },
};

export const TREE_TYPES: Record<string, {
  label: string;
  category: string;
  cost: number;
  stages: Array<{ n: string; h: number }>;
  o2AtStage: number[];
  lateBonus?: number;
}> = {
  // Oxygen Trees
  oak: { label: 'Oak', category: 'Oxygen Tree', cost: 160, stages: [{ n: 'Seed', h: 1 }, { n: 'Sprout', h: 2 }, { n: 'Young Plant', h: 4 }, { n: 'Mature Tree', h: 99999 }], o2AtStage: [0, 0, 2, 6] },
  pine: { label: 'Pine', category: 'Oxygen Tree', cost: 190, stages: [{ n: 'Seed', h: 1 }, { n: 'Sprout', h: 2 }, { n: 'Young Plant', h: 5 }, { n: 'Mature Tree', h: 99999 }], o2AtStage: [0, 0, 1.8, 5.5] },
  maple: { label: 'Maple', category: 'Oxygen Tree', cost: 150, stages: [{ n: 'Seed', h: 1 }, { n: 'Sprout', h: 2 }, { n: 'Young Plant', h: 4 }, { n: 'Mature Tree', h: 99999 }], o2AtStage: [0, 0, 2, 5.5] },
  poplar: { label: 'Poplar', category: 'Oxygen Tree', cost: 135, stages: [{ n: 'Seed', h: 0.8 }, { n: 'Sprout', h: 1.5 }, { n: 'Young Plant', h: 3 }, { n: 'Mature Tree', h: 99999 }], o2AtStage: [0, 0, 1.6, 5] },

  // Fruit Trees
  apple: { label: 'Apple', category: 'Fruit Tree', cost: 120, stages: [{ n: 'Seed', h: 1 }, { n: 'Sprout', h: 1.5 }, { n: 'Young Plant', h: 2.5 }, { n: 'Flowering', h: 2 }, { n: 'Fruiting', h: 99999 }], o2AtStage: [0, 0, 1.5, 2, 3.5], lateBonus: 0.9 },
  orange: { label: 'Orange', category: 'Fruit Tree', cost: 130, stages: [{ n: 'Seed', h: 1 }, { n: 'Sprout', h: 1.5 }, { n: 'Young Plant', h: 2.7 }, { n: 'Flowering', h: 2.2 }, { n: 'Fruiting', h: 99999 }], o2AtStage: [0, 0, 1.4, 2, 3.3], lateBonus: 0.95 },
  mango: { label: 'Mango', category: 'Fruit Tree', cost: 140, stages: [{ n: 'Seed', h: 1.2 }, { n: 'Sprout', h: 1.8 }, { n: 'Young Plant', h: 3 }, { n: 'Flowering', h: 2.5 }, { n: 'Fruiting', h: 99999 }], o2AtStage: [0, 0, 1.6, 2.2, 3.6], lateBonus: 1.0 },
  lemon: { label: 'Lemon', category: 'Fruit Tree', cost: 115, stages: [{ n: 'Seed', h: 0.9 }, { n: 'Sprout', h: 1.4 }, { n: 'Young Plant', h: 2.3 }, { n: 'Flowering', h: 1.8 }, { n: 'Fruiting', h: 99999 }], o2AtStage: [0, 0, 1.3, 1.8, 3.1], lateBonus: 0.85 },

  // Vegetables
  tomato: { label: 'Tomato', category: 'Vegetable', cost: 45, stages: [{ n: 'Seed', h: 0.5 }, { n: 'Sprout', h: 0.5 }, { n: 'Young Plant', h: 1 }, { n: 'Harvest Ready', h: 99999 }], o2AtStage: [0, 0, 0.5, 1], lateBonus: 0.6 },
  potato: { label: 'Potato', category: 'Vegetable', cost: 40, stages: [{ n: 'Seed', h: 0.5 }, { n: 'Sprout', h: 0.6 }, { n: 'Young Plant', h: 1.1 }, { n: 'Harvest Ready', h: 99999 }], o2AtStage: [0, 0, 0.4, 0.9], lateBonus: 0.55 },
  carrot: { label: 'Carrot', category: 'Vegetable', cost: 38, stages: [{ n: 'Seed', h: 0.4 }, { n: 'Sprout', h: 0.5 }, { n: 'Young Plant', h: 0.9 }, { n: 'Harvest Ready', h: 99999 }], o2AtStage: [0, 0, 0.35, 0.8], lateBonus: 0.5 },
  onion: { label: 'Onion', category: 'Vegetable', cost: 35, stages: [{ n: 'Seed', h: 0.4 }, { n: 'Sprout', h: 0.5 }, { n: 'Young Plant', h: 0.8 }, { n: 'Harvest Ready', h: 99999 }], o2AtStage: [0, 0, 0.3, 0.7], lateBonus: 0.45 },

  // Timber Trees
  teak: { label: 'Teak', category: 'Timber Tree', cost: 300, stages: [{ n: 'Seed', h: 2 }, { n: 'Sprout', h: 3 }, { n: 'Young Plant', h: 6 }, { n: 'Mature Tree', h: 99999 }], o2AtStage: [0, 0, 1.5, 3.5], lateBonus: 1.6 },
  cedar: { label: 'Cedar', category: 'Timber Tree', cost: 320, stages: [{ n: 'Seed', h: 2.2 }, { n: 'Sprout', h: 3.2 }, { n: 'Young Plant', h: 6.5 }, { n: 'Mature Tree', h: 99999 }], o2AtStage: [0, 0, 1.6, 3.8], lateBonus: 1.75 },
  eucalyptus: { label: 'Eucalyptus', category: 'Timber Tree', cost: 270, stages: [{ n: 'Seed', h: 1.8 }, { n: 'Sprout', h: 2.6 }, { n: 'Young Plant', h: 5 }, { n: 'Mature Tree', h: 99999 }], o2AtStage: [0, 0, 1.7, 3.6], lateBonus: 1.5 },

  // Biodiversity Trees
  cherryblossom: { label: 'Cherry Blossom', category: 'Biodiversity Tree', cost: 100, stages: [{ n: 'Seed', h: 1 }, { n: 'Sprout', h: 1.6 }, { n: 'Young Plant', h: 2.8 }, { n: 'Mature Tree', h: 99999 }], o2AtStage: [0, 0, 1.2, 2.4] },
  acacia: { label: 'Acacia', category: 'Biodiversity Tree', cost: 95, stages: [{ n: 'Seed', h: 1 }, { n: 'Sprout', h: 1.6 }, { n: 'Young Plant', h: 2.6 }, { n: 'Mature Tree', h: 99999 }], o2AtStage: [0, 0, 1.1, 2.3] },
  birch: { label: 'Birch', category: 'Biodiversity Tree', cost: 90, stages: [{ n: 'Seed', h: 0.9 }, { n: 'Sprout', h: 1.4 }, { n: 'Young Plant', h: 2.4 }, { n: 'Mature Tree', h: 99999 }], o2AtStage: [0, 0, 1.0, 2.2] },
};

export const WORKER_TYPES: Record<string, { label: string; wage: number; role: string; mult: number }> = {
  laborer: { label: 'Laborer', wage: 30, role: 'prep', mult: 1.5 },
  farmer: { label: 'Farmer', wage: 70, role: 'grow', mult: 1.4 },
  botanist: { label: 'Botanist', wage: 130, role: 'grow', mult: 1.6 },
  engineer: { label: 'Engineer', wage: 180, role: 'global', mult: 0 },
};

export const ACCESSORIES: Record<string, { label: string; cost: number }> = {
  irrigation: { label: 'Irrigation', cost: 110 },
  fertilizer: { label: 'Fertilizer', cost: 85 },
};

export const CARE_COST: Record<string, Record<string, number>> = {
  water: { 'Oxygen Tree': 6, 'Fruit Tree': 11, 'Vegetable': 7, 'Timber Tree': 6, 'Biodiversity Tree': 7 },
  prune: { 'Oxygen Tree': 16, 'Fruit Tree': 19, 'Timber Tree': 24, 'Biodiversity Tree': 14 },
};

export const HEALTH_DECAY: Record<string, number> = {
  'Oxygen Tree': 0.5,
  'Fruit Tree': 0.8,
  'Vegetable': 1.2,
  'Timber Tree': 0.4,
  'Biodiversity Tree': 0.6,
};

export const SCARE_COST = 12;
export const ANIMAL_PENALTY = 20;

export const ACHIEVEMENTS_LIST = [
  { id: 'first_tree', label: 'First Tree' },
  { id: 'first_hire', label: 'First Hire' },
  { id: 'green_starter', label: 'Green Starter (100 O2)' },
  { id: 'eco_farmer', label: 'Eco Farmer (1,000 O2)' },
  { id: 'forest_maker', label: 'Forest Maker (all plots planted)' },
  { id: 'oxygen_hero', label: 'Oxygen Hero (10,000 O2)' },
  { id: 'pest_control', label: 'Pest Control' },
  { id: 'well_kept', label: 'Well-Kept Farm' },
  { id: 'first_harvest', label: 'First Harvest' },
  { id: 'storekeeper', label: 'Storekeeper' },
  { id: 'first_building', label: 'First Building' },
  { id: 'visitor_magnet', label: 'Visitor Magnet' },
  { id: 'lumberjack', label: 'First Removal' },
];
