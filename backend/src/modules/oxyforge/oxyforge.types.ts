export type Destination = 'moon' | 'mars';
export type RocketType = 'hauler9' | 'crewmark3';
export type MissionStage = 'planned' | 'checklist' | 'launch' | 'cruise' | 'landing' | 'surface' | 'completed' | 'aborted' | 'failed';

export interface ChecklistState {
  launch_window: boolean;
  propellant: boolean;
  mass_balance: boolean;
  guidance: boolean;
  range_safety: boolean;
  weather: boolean;
  cargo_secure: boolean;
  comms: boolean;
}

export interface OxyforgeMissionRecord {
  id: string;
  userId: string;
  destination: Destination;
  rocket: RocketType;
  status: MissionStage;
  priceGc: number;
  checklistState: ChecklistState;
  oxygenProducedKg: number;
  payoutGc: number;
  createdAt: string;
  updatedAt: string;
}

export interface FpvSessionRecord {
  id: string;
  missionId: string;
  rateGcPerSecond: number;
  secondsBilled: number;
  totalCostGc: number;
  status: 'active' | 'completed' | 'timeout' | 'insufficient_funds';
  lastHeartbeat: string;
}
