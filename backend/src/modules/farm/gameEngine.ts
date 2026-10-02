import {
  O2_RATE,
  PREP_DURATION_HOURS,
  CLEAR_DURATION_HOURS,
  OVERGROWN_THRESHOLD,
  STORAGE_BASE_CAPACITY,
  STORAGE_EXPAND_CAPACITY,
  STORAGE_EXPAND_HOURS,
  BUILDING_TYPES,
  GARDEN_FRESHNESS_DECAY,
  POND_FRESHNESS_DECAY,
  POND_SPECIALIZATIONS,
  TREE_DRY_THRESHOLD_HOURS,
  REMOVE_CONFIG,
  TREE_TYPES,
  WORKER_TYPES,
  HEALTH_DECAY,
  SEASONS,
  SEASON_LEN_GAME_HOURS,
  REAL_MS_PER_GAME_HOUR_SPEC,
  LOAN_PENALTY_RATE,
} from './gameConstants';

export interface FarmRecord {
  id: string;
  user_id: string;
  name: string;
  money: number;
  total_o2: number;
  total_o2_all_time: number;
  trees_planted: number;
  trees_removed: number;
  game_hour: number;
  last_tick_timestamp: Date;
  speed_factor: number;
  farm_reputation: number;
  demerits: number;
  pest_handled: number;
  harvest_count: number;
  last_paid_day: number;
  next_tree_id: number;
  storage_state: {
    built: boolean;
    building: boolean;
    buildHours: number;
    capacity: number;
    stored: number;
    level: number;
    expanding: boolean;
    expandHours: number;
    warnedFull: boolean;
  };
  buildings_state: Record<string, any>;
  loan_state: any;
}

export interface PlotRecord {
  id: string;
  farm_id: string;
  plot_index: number;
  status: 'barren' | 'preparing' | 'ready' | 'growing' | 'overgrown' | 'clearing' | 'dead' | 'removing';
  tree_type: string | null;
  tree_id: number | null;
  health: number;
  grow_hours: number;
  task_hours: number;
  weed_hours: number;
  zero_health_streak_hours: number;
  pending_harvest: number;
  assigned_worker_id: number | null;
  accessories: { irrigation: boolean; fertilizer: boolean };
  animal: any;
}

export interface WorkerRecord {
  id: number;
  farm_id: string;
  worker_type: 'laborer' | 'farmer' | 'botanist' | 'engineer';
  assigned_plot_index: number | null;
  daily_wage: number;
}

export interface SimulationResult {
  farm: FarmRecord;
  plots: PlotRecord[];
  ledgerEntries: Array<{
    type: string;
    amount: number;
    currency: string;
    balanceAfter: number;
    description: string;
    metadata?: any;
  }>;
  newAchievements: string[];
  newReports: Array<{ icon: string; message: string }>;
}

export class GameEngine {
  calculateElapsedHours(lastTick: Date, current: Date, speedFactor: number): number {
    const elapsedMs = Math.max(0, current.getTime() - lastTick.getTime());
    // 15 min real = 1 game hour at 1x speed
    const baseHours = elapsedMs / REAL_MS_PER_GAME_HOUR_SPEC;
    return baseHours * (speedFactor || 1);
  }

  getCurrentSeason(gameHour: number) {
    const idx = Math.floor(gameHour / SEASON_LEN_GAME_HOURS) % SEASONS.length;
    return SEASONS[idx];
  }

  calculateReputation(farm: FarmRecord, plots: PlotRecord[]): number {
    let rep = 0;
    const bState = farm.buildings_state || {};

    for (const key of Object.keys(BUILDING_TYPES)) {
      const b = bState[key];
      if (b && b.built) {
        let bonus = BUILDING_TYPES[key].reputationBonus;
        if ((key === 'garden' || key === 'pond') && b.freshness !== undefined) {
          bonus *= 0.4 + 0.6 * (b.freshness / 100);
        }
        rep += bonus;
      }
    }

    if (farm.storage_state && farm.storage_state.built) rep += 4;

    plots.forEach((p) => {
      if (p.status === 'growing') {
        if (p.health >= 80) rep += 2;
        else if (p.health >= 50) rep += 1;
        if (p.accessories && p.accessories.irrigation) rep += 1;
      }
    });

    const uniqueSpecies = new Set(
      plots.filter((p) => p.status === 'growing' && p.tree_type).map((p) => p.tree_type)
    );
    rep += uniqueSpecies.size * 3;

    // Visitor Magnet Combo: Garden + Pond + (Coffee Shop OR Juice Bar)
    const hasGarden = bState.garden?.built;
    const hasPond = bState.pond?.built;
    const hasCommercial = bState.coffee_shop?.built || bState.juice_bar?.built;
    if (hasGarden && hasPond && hasCommercial) {
      rep += 10;
    }

    rep -= (farm.demerits || 0) * 2;
    return Math.max(0, Math.round(rep));
  }

  tick(
    farm: FarmRecord,
    plots: PlotRecord[],
    workers: WorkerRecord[],
    currentTimestamp: Date = new Date(),
    manualDh?: number
  ): SimulationResult {
    const dh = manualDh !== undefined
      ? manualDh
      : this.calculateElapsedHours(new Date(farm.last_tick_timestamp), currentTimestamp, farm.speed_factor);

    const ledgerEntries: SimulationResult['ledgerEntries'] = [];
    const newAchievements: string[] = [];
    const newReports: SimulationResult['newReports'] = [];

    if (dh <= 0) {
      return { farm, plots, ledgerEntries, newAchievements, newReports };
    }

    farm.game_hour = parseFloat((Number(farm.game_hour) + dh).toFixed(2));
    farm.last_tick_timestamp = currentTimestamp;
    const season = this.getCurrentSeason(farm.game_hour);

    const workersByPlot = new Map<number, WorkerRecord>();
    workers.forEach((w) => {
      if (w.assigned_plot_index !== null && w.assigned_plot_index !== undefined) {
        workersByPlot.set(w.assigned_plot_index, w);
      }
    });

    const hasEngineer = workers.some((w) => w.worker_type === 'engineer');

    // 1. Storage Construction & Expansion
    const storage = farm.storage_state;
    if (storage.building) {
      storage.buildHours += dh;
      if (storage.buildHours >= 10) {
        storage.building = false;
        storage.built = true;
        storage.capacity = STORAGE_BASE_CAPACITY;
        newReports.push({ icon: '🏚', message: 'Storage Room construction completed! Harvested goods are now safe from spoilage.' });
      }
    }
    if (storage.expanding) {
      storage.expandHours += dh;
      if (storage.expandHours >= STORAGE_EXPAND_HOURS) {
        storage.expanding = false;
        storage.level += 1;
        storage.capacity += STORAGE_EXPAND_CAPACITY;
        newReports.push({ icon: '📦', message: `Storage Room expanded to Level ${storage.level}! New capacity: €${storage.capacity}.` });
      }
    }

    // 2. Buildings Progress
    const buildings = farm.buildings_state;
    for (const key of Object.keys(BUILDING_TYPES)) {
      const b = buildings[key];
      const def = BUILDING_TYPES[key];
      if (b && b.building) {
        b.buildHours += dh;
        if (b.buildHours >= def.buildHours) {
          b.building = false;
          b.built = true;
          newReports.push({ icon: '🏘️', message: `${def.label} construction completed! Reputation boosted.` });
        }
      }
    }

    // 3. Garden Freshness Decay
    const garden = buildings.garden;
    if (garden && garden.built && garden.flowerType) {
      garden.freshness = Math.max(0, garden.freshness - dh * GARDEN_FRESHNESS_DECAY);
    }

    // 4. Pond Freshness Decay & Continuous Production into Storage
    const pond = buildings.pond;
    if (pond && pond.built && pond.specialization) {
      pond.freshness = Math.max(0, pond.freshness - dh * POND_FRESHNESS_DECAY);
      if (storage.built && pond.freshness > 0) {
        const spec = POND_SPECIALIZATIONS[pond.specialization];
        if (spec) {
          const freshMult = pond.freshness / 100;
          const produced = spec.productRate * dh * freshMult;
          const room = Math.max(0, storage.capacity - storage.stored);
          storage.stored += Math.min(produced, room);
        }
      }
    }

    // 5. Commercial Buildings Processing (Coffee Shop / Juice Bar)
    if (storage.built && storage.stored > 0) {
      for (const key of ['coffee_shop', 'juice_bar']) {
        const b = buildings[key];
        const def = BUILDING_TYPES[key];
        if (b && b.built && def.processRate && def.conversionRate) {
          const canProcess = Math.min(storage.stored, def.processRate * dh);
          if (canProcess > 0) {
            storage.stored -= canProcess;
            const revenue = parseFloat((canProcess * def.conversionRate).toFixed(2));
            farm.money = parseFloat((Number(farm.money) + revenue).toFixed(2));
            ledgerEntries.push({
              type: 'commercial_sale',
              amount: revenue,
              currency: 'EUR',
              balanceAfter: farm.money,
              description: `Sales from ${def.label} (${canProcess.toFixed(1)} goods converted)`,
            });
          }
        }
      }
    }

    // 6. Plots Simulation
    let totalO2ProducedThisTick = 0;

    plots.forEach((p) => {
      const assignedWorker = workersByPlot.get(p.plot_index);

      if (p.status === 'barren' || p.status === 'ready') {
        p.weed_hours = Number(p.weed_hours) + dh;
        if (p.weed_hours >= OVERGROWN_THRESHOLD) {
          p.status = 'overgrown';
        }
      } else if (p.status === 'preparing') {
        const speed = assignedWorker && assignedWorker.worker_type === 'laborer' ? WORKER_TYPES.laborer.mult : 1;
        p.task_hours = Number(p.task_hours) + dh * speed;
        if (p.task_hours >= PREP_DURATION_HOURS) {
          p.status = 'ready';
          p.weed_hours = 0;
          p.task_hours = 0;
        }
      } else if (p.status === 'clearing') {
        const speed = assignedWorker && assignedWorker.worker_type === 'laborer' ? WORKER_TYPES.laborer.mult : 1;
        p.task_hours = Number(p.task_hours) + dh * speed;
        if (p.task_hours >= CLEAR_DURATION_HOURS) {
          p.status = 'ready';
          p.weed_hours = 0;
          p.task_hours = 0;
        }
      } else if (p.status === 'removing') {
        if (p.tree_type && TREE_TYPES[p.tree_type]) {
          const def = TREE_TYPES[p.tree_type];
          const remCfg = REMOVE_CONFIG[def.category];
          const speed = assignedWorker && assignedWorker.worker_type === 'laborer' ? WORKER_TYPES.laborer.mult : 1;
          p.task_hours = Number(p.task_hours) + dh * speed;

          if (p.task_hours >= remCfg.hours) {
            const salvage = parseFloat((def.cost * remCfg.salvagePct).toFixed(2));
            farm.money = parseFloat((Number(farm.money) + salvage).toFixed(2));
            farm.trees_removed = (farm.trees_removed || 0) + 1;

            if (salvage > 0) {
              ledgerEntries.push({
                type: 'wood_salvage',
                amount: salvage,
                currency: 'EUR',
                balanceAfter: farm.money,
                description: `Salvaged timber from dead ${def.label} on Plot ${p.plot_index + 1}`,
              });
            }

            p.status = 'barren';
            p.tree_type = null;
            p.tree_id = null;
            p.grow_hours = 0;
            p.task_hours = 0;
            p.weed_hours = 0;
            p.health = 100;
            p.zero_health_streak_hours = 0;
            p.pending_harvest = 0;
          }
        }
      } else if (p.status === 'growing') {
        if (p.tree_type && TREE_TYPES[p.tree_type]) {
          const def = TREE_TYPES[p.tree_type];

          // Biological Health Decay
          const decayRate = HEALTH_DECAY[def.category] || 0.6;
          p.health = Math.max(0, parseFloat((Number(p.health) - dh * decayRate).toFixed(2)));

          // Tree Death Check (zeroHealthStreak >= 20 game-hours)
          if (p.health <= 0) {
            p.zero_health_streak_hours = Number(p.zero_health_streak_hours) + dh;
            if (p.zero_health_streak_hours >= TREE_DRY_THRESHOLD_HOURS) {
              p.status = 'dead';
              newReports.push({
                icon: '💀',
                message: `Tree on Plot ${p.plot_index + 1} (${def.label}) died from extended drought and neglect. It must be cut down.`,
              });
            }
          } else {
            p.zero_health_streak_hours = 0;
          }

          if (p.status === 'growing') {
            // Growth multiplier
            let growMult = season.growth;
            if (p.accessories && p.accessories.irrigation) growMult *= 1.15;
            if (assignedWorker) {
              if (assignedWorker.worker_type === 'farmer') growMult *= WORKER_TYPES.farmer.mult;
              if (assignedWorker.worker_type === 'botanist') growMult *= WORKER_TYPES.botanist.mult;
            }
            const healthMult = 0.5 + 0.5 * (p.health / 100);
            p.grow_hours = Number(p.grow_hours) + dh * growMult * healthMult;

            // Determine current stage & O2 generation
            let accHours = 0;
            let currentStageIdx = 0;
            for (let s = 0; s < def.stages.length; s++) {
              accHours += def.stages[s].h;
              if (p.grow_hours < accHours) {
                currentStageIdx = s;
                break;
              }
              currentStageIdx = s;
            }

            const baseO2 = def.o2AtStage[currentStageIdx] || 0;
            let fertMult = (p.accessories && p.accessories.fertilizer) ? 1.2 : 1.0;
            const o2Produced = baseO2 * dh * fertMult * healthMult;
            totalO2ProducedThisTick += o2Produced;

            // Fruit/vegetable pending harvest yield
            if (def.lateBonus && currentStageIdx >= def.stages.length - 2) {
              p.pending_harvest = parseFloat((Number(p.pending_harvest) + def.lateBonus * dh * healthMult).toFixed(2));
            }
          }
        }
      }
    });

    // Update global Oxygen totals
    if (totalO2ProducedThisTick > 0) {
      farm.total_o2 = parseFloat((Number(farm.total_o2) + totalO2ProducedThisTick).toFixed(2));
      farm.total_o2_all_time = parseFloat((Number(farm.total_o2_all_time) + totalO2ProducedThisTick).toFixed(2));
    }

    // 7. Daily Payroll (every 24 game-hours)
    const currentDay = Math.floor(farm.game_hour / 24);
    if (currentDay > (farm.last_paid_day || 0) && workers.length > 0) {
      const daysPassed = currentDay - (farm.last_paid_day || 0);
      let totalWages = 0;
      workers.forEach((w) => {
        totalWages += Number(w.daily_wage) * daysPassed;
      });

      if (totalWages > 0) {
        farm.money = parseFloat((Number(farm.money) - totalWages).toFixed(2));
        farm.last_paid_day = currentDay;
        ledgerEntries.push({
          type: 'worker_wage',
          amount: -totalWages,
          currency: 'EUR',
          balanceAfter: farm.money,
          description: `Daily payroll for ${workers.length} worker(s) (${daysPassed} day(s))`,
        });
      }
    }

    // 8. Daily Loan Installment Deductions
    if (farm.loan_state && farm.loan_state.balance > 0) {
      const loan = farm.loan_state;
      const daysElapsed = Math.floor(farm.game_hour / 24) - (loan.lastPaidDay || 0);
      if (daysElapsed > 0) {
        loan.lastPaidDay = Math.floor(farm.game_hour / 24);
        const dailyPayment = loan.dailyInstallment * daysElapsed;
        if (Number(farm.money) >= dailyPayment) {
          farm.money = parseFloat((Number(farm.money) - dailyPayment).toFixed(2));
          loan.balance = Math.max(0, parseFloat((loan.balance - dailyPayment).toFixed(2)));
          loan.daysRemaining = Math.max(0, loan.daysRemaining - daysElapsed);
          ledgerEntries.push({
            type: 'loan_installment',
            amount: -dailyPayment,
            currency: 'EUR',
            balanceAfter: farm.money,
            description: `Automatic daily loan installment payment`,
          });
        } else {
          // Missed payment penalty
          const penalty = parseFloat((loan.balance * LOAN_PENALTY_RATE).toFixed(2));
          loan.balance = parseFloat((loan.balance + penalty).toFixed(2));
          newReports.push({
            icon: '🏦',
            message: `Missed loan installment! Penalty of €${penalty} accrued to balance.`,
          });
        }
      }
    }

    // Update farm reputation
    farm.farm_reputation = this.calculateReputation(farm, plots);

    return { farm, plots, ledgerEntries, newAchievements, newReports };
  }
}

export const gameEngine = new GameEngine();
