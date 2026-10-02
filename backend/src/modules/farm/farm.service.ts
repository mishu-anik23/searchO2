import { query, transaction } from '../../config/database';
import { gameEngine, FarmRecord, PlotRecord, WorkerRecord } from './gameEngine';
import {
  LABOR_COST,
  CLEAR_COST,
  TREE_TYPES,
  REMOVE_CONFIG,
  CARE_COST,
  ACCESSORIES,
  WORKER_TYPES,
  STORAGE_COST,
  STORAGE_EXPAND_BASE_COST,
  BUILDING_TYPES,
  FLOWER_TYPES,
  POND_SPECIALIZATIONS,
  TEND_GARDEN_COST,
  LOAN_OPTIONS,
  O2_RATE,
  SCARE_COST,
} from './gameConstants';

export class FarmService {
  async getFarmWithSimulation(userId: string): Promise<{
    farm: FarmRecord;
    plots: PlotRecord[];
    workers: WorkerRecord[];
    reports: any[];
    achievements: string[];
  }> {
    return transaction(async (client) => {
      // 1. Fetch Farm
      const farmRes = await client.query(
        `SELECT * FROM farms WHERE user_id = $1 LIMIT 1 FOR UPDATE`,
        [userId]
      );
      if (!farmRes.rowCount || farmRes.rowCount === 0) {
        throw { statusCode: 404, message: 'Farm not found for this user.' };
      }
      const farm: FarmRecord = farmRes.rows[0];

      // 2. Fetch Plots
      const plotsRes = await client.query(
        `SELECT * FROM plots WHERE farm_id = $1 ORDER BY plot_index ASC FOR UPDATE`,
        [farm.id]
      );
      const plots: PlotRecord[] = plotsRes.rows;

      // 3. Fetch Workers
      const workersRes = await client.query(
        `SELECT * FROM workers WHERE farm_id = $1 ORDER BY id ASC`,
        [farm.id]
      );
      const workers: WorkerRecord[] = workersRes.rows;

      // 4. Run authoritative game simulation tick
      const sim = gameEngine.tick(farm, plots, workers, new Date());

      // 5. Persist simulation updates
      await client.query(
        `UPDATE farms
         SET money = $1, total_o2 = $2, total_o2_all_time = $3, trees_planted = $4, trees_removed = $5,
             game_hour = $6, last_tick_timestamp = $7, farm_reputation = $8, last_paid_day = $9,
             storage_state = $10, buildings_state = $11, loan_state = $12, harvest_count = $13, updated_at = NOW()
         WHERE id = $14`,
        [
          sim.farm.money,
          sim.farm.total_o2,
          sim.farm.total_o2_all_time,
          sim.farm.trees_planted,
          sim.farm.trees_removed,
          sim.farm.game_hour,
          sim.farm.last_tick_timestamp,
          sim.farm.farm_reputation,
          sim.farm.last_paid_day,
          JSON.stringify(sim.farm.storage_state),
          JSON.stringify(sim.farm.buildings_state),
          sim.farm.loan_state ? JSON.stringify(sim.farm.loan_state) : null,
          sim.farm.harvest_count,
          sim.farm.id,
        ]
      );

      for (const p of sim.plots) {
        await client.query(
          `UPDATE plots
           SET status = $1, tree_type = $2, tree_id = $3, health = $4, grow_hours = $5, task_hours = $6,
               weed_hours = $7, zero_health_streak_hours = $8, pending_harvest = $9, assigned_worker_id = $10,
               accessories = $11, animal = $12, updated_at = NOW()
           WHERE id = $13`,
          [
            p.status,
            p.tree_type,
            p.tree_id,
            p.health,
            p.grow_hours,
            p.task_hours,
            p.weed_hours,
            p.zero_health_streak_hours,
            p.pending_harvest,
            p.assigned_worker_id,
            JSON.stringify(p.accessories),
            p.animal ? JSON.stringify(p.animal) : null,
            p.id,
          ]
        );
      }

      // Record any generated ledger entries
      for (const entry of sim.ledgerEntries) {
        await client.query(
          `INSERT INTO economy_transactions (farm_id, transaction_type, amount, currency, balance_after, description)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [sim.farm.id, entry.type, entry.amount, entry.currency, entry.balanceAfter, entry.description]
        );
      }

      // Record any reports
      for (const rep of sim.newReports) {
        await client.query(
          `INSERT INTO reports (farm_id, icon, message) VALUES ($1, $2, $3)`,
          [sim.farm.id, rep.icon, rep.message]
        );
      }

      // Fetch active reports and achievements
      const repRes = await client.query(
        `SELECT icon, message, created_at FROM reports WHERE farm_id = $1 ORDER BY created_at DESC LIMIT 20`,
        [sim.farm.id]
      );
      const achRes = await client.query(
        `SELECT achievement_code FROM achievements WHERE farm_id = $1`,
        [sim.farm.id]
      );

      return {
        farm: sim.farm,
        plots: sim.plots,
        workers,
        reports: repRes.rows,
        achievements: achRes.rows.map((r) => r.achievement_code),
      };
    });
  }

  async startPrep(userId: string, plotIndex: number) {
    return transaction(async (client) => {
      const { farm, plots } = await this.getFarmWithSimulation(userId);
      const plot = plots.find((p) => p.plot_index === plotIndex);
      if (!plot) throw { statusCode: 404, message: 'Plot not found' };
      if (plot.status !== 'barren') throw { statusCode: 400, message: 'Plot must be barren to dig' };
      if (Number(farm.money) < LABOR_COST) throw { statusCode: 400, message: 'Insufficient funds for soil preparation' };

      const newBalance = parseFloat((Number(farm.money) - LABOR_COST).toFixed(2));
      await client.query(`UPDATE farms SET money = $1 WHERE id = $2`, [newBalance, farm.id]);
      await client.query(`UPDATE plots SET status = 'preparing', task_hours = 0 WHERE id = $1`, [plot.id]);
      await client.query(
        `INSERT INTO economy_transactions (farm_id, transaction_type, amount, currency, balance_after, description)
         VALUES ($1, 'prep_cost', $2, 'EUR', $3, $4)`,
        [farm.id, -LABOR_COST, newBalance, `Started digging soil on Plot ${plotIndex + 1}`]
      );
      return { success: true, newBalance };
    });
  }

  async startClear(userId: string, plotIndex: number) {
    return transaction(async (client) => {
      const { farm, plots } = await this.getFarmWithSimulation(userId);
      const plot = plots.find((p) => p.plot_index === plotIndex);
      if (!plot) throw { statusCode: 404, message: 'Plot not found' };
      if (plot.status !== 'overgrown') throw { statusCode: 400, message: 'Plot must be overgrown to clear weeds' };
      if (Number(farm.money) < CLEAR_COST) throw { statusCode: 400, message: 'Insufficient funds for weeding' };

      const newBalance = parseFloat((Number(farm.money) - CLEAR_COST).toFixed(2));
      await client.query(`UPDATE farms SET money = $1 WHERE id = $2`, [newBalance, farm.id]);
      await client.query(`UPDATE plots SET status = 'clearing', task_hours = 0 WHERE id = $1`, [plot.id]);
      await client.query(
        `INSERT INTO economy_transactions (farm_id, transaction_type, amount, currency, balance_after, description)
         VALUES ($1, 'clear_cost', $2, 'EUR', $3, $4)`,
        [farm.id, -CLEAR_COST, newBalance, `Clearing overgrown weeds on Plot ${plotIndex + 1}`]
      );
      return { success: true, newBalance };
    });
  }

  async startRemoveTree(userId: string, plotIndex: number) {
    return transaction(async (client) => {
      const { farm, plots } = await this.getFarmWithSimulation(userId);
      const plot = plots.find((p) => p.plot_index === plotIndex);
      if (!plot) throw { statusCode: 404, message: 'Plot not found' };
      if (plot.status !== 'dead') throw { statusCode: 400, message: 'Only dead trees can be removed' };
      if (!plot.tree_type || !TREE_TYPES[plot.tree_type]) throw { statusCode: 400, message: 'Invalid tree type' };

      const def = TREE_TYPES[plot.tree_type];
      const remCfg = REMOVE_CONFIG[def.category];
      if (Number(farm.money) < remCfg.cost) throw { statusCode: 400, message: `Insufficient funds (€${remCfg.cost} required to remove tree)` };

      const newBalance = parseFloat((Number(farm.money) - remCfg.cost).toFixed(2));
      await client.query(`UPDATE farms SET money = $1 WHERE id = $2`, [newBalance, farm.id]);
      await client.query(`UPDATE plots SET status = 'removing', task_hours = 0 WHERE id = $1`, [plot.id]);
      await client.query(
        `INSERT INTO economy_transactions (farm_id, transaction_type, amount, currency, balance_after, description)
         VALUES ($1, 'tree_removal_cost', $2, 'EUR', $3, $4)`,
        [farm.id, -remCfg.cost, newBalance, `Initiated removal of dead ${def.label} on Plot ${plotIndex + 1}`]
      );
      return { success: true, newBalance, removeDurationHours: remCfg.hours };
    });
  }

  async plantTree(userId: string, plotIndex: number, treeType: string) {
    return transaction(async (client) => {
      const { farm, plots } = await this.getFarmWithSimulation(userId);
      const plot = plots.find((p) => p.plot_index === plotIndex);
      if (!plot) throw { statusCode: 404, message: 'Plot not found' };
      if (plot.status !== 'ready') throw { statusCode: 400, message: 'Plot must be prepared and ready before planting' };

      const def = TREE_TYPES[treeType];
      if (!def) throw { statusCode: 400, message: 'Unknown tree species' };
      if (Number(farm.money) < def.cost) throw { statusCode: 400, message: `Insufficient funds (€${def.cost} required to plant ${def.label})` };

      const newBalance = parseFloat((Number(farm.money) - def.cost).toFixed(2));
      const treeId = farm.next_tree_id;

      await client.query(
        `UPDATE farms
         SET money = $1, next_tree_id = next_tree_id + 1, trees_planted = trees_planted + 1
         WHERE id = $2`,
        [newBalance, farm.id]
      );

      await client.query(
        `UPDATE plots
         SET status = 'growing', tree_type = $1, tree_id = $2, grow_hours = 0, health = 100,
             task_hours = 0, weed_hours = 0, zero_health_streak_hours = 0, pending_harvest = 0
         WHERE id = $3`,
        [treeType, treeId, plot.id]
      );

      await client.query(
        `INSERT INTO economy_transactions (farm_id, transaction_type, amount, currency, balance_after, description)
         VALUES ($1, 'tree_purchase', $2, 'EUR', $3, $4)`,
        [farm.id, -def.cost, newBalance, `Planted ${def.label} (#${treeId}) on Plot ${plotIndex + 1}`]
      );

      // Check first_tree achievement
      await client.query(
        `INSERT INTO achievements (user_id, farm_id, achievement_code)
         VALUES ($1, $2, 'first_tree')
         ON CONFLICT DO NOTHING`,
        [userId, farm.id]
      );

      return { success: true, treeId, newBalance };
    });
  }

  async waterPlot(userId: string, plotIndex: number) {
    return transaction(async (client) => {
      const { farm, plots } = await this.getFarmWithSimulation(userId);
      const plot = plots.find((p) => p.plot_index === plotIndex);
      if (!plot || plot.status !== 'growing' || !plot.tree_type) throw { statusCode: 400, message: 'No growing tree on plot' };

      const def = TREE_TYPES[plot.tree_type];
      const cost = CARE_COST.water[def.category] || 8;
      if (Number(farm.money) < cost) throw { statusCode: 400, message: 'Insufficient funds for watering' };

      const newBalance = parseFloat((Number(farm.money) - cost).toFixed(2));
      const newHealth = Math.min(100, Number(plot.health) + 25);

      await client.query(`UPDATE farms SET money = $1 WHERE id = $2`, [newBalance, farm.id]);
      await client.query(`UPDATE plots SET health = $1, zero_health_streak_hours = 0 WHERE id = $2`, [newHealth, plot.id]);
      await client.query(
        `INSERT INTO economy_transactions (farm_id, transaction_type, amount, currency, balance_after, description)
         VALUES ($1, 'care_water', $2, 'EUR', $3, $4)`,
        [farm.id, -cost, newBalance, `Watered ${def.label} on Plot ${plotIndex + 1}`]
      );

      return { success: true, newBalance, health: newHealth };
    });
  }

  async prunePlot(userId: string, plotIndex: number) {
    return transaction(async (client) => {
      const { farm, plots } = await this.getFarmWithSimulation(userId);
      const plot = plots.find((p) => p.plot_index === plotIndex);
      if (!plot || plot.status !== 'growing' || !plot.tree_type) throw { statusCode: 400, message: 'No growing tree on plot' };

      const def = TREE_TYPES[plot.tree_type];
      const cost = CARE_COST.prune[def.category] || 15;
      if (Number(farm.money) < cost) throw { statusCode: 400, message: 'Insufficient funds for pruning' };

      const newBalance = parseFloat((Number(farm.money) - cost).toFixed(2));
      const newHealth = Math.min(100, Number(plot.health) + 35);

      await client.query(`UPDATE farms SET money = $1 WHERE id = $2`, [newBalance, farm.id]);
      await client.query(`UPDATE plots SET health = $1, zero_health_streak_hours = 0 WHERE id = $2`, [newHealth, plot.id]);
      await client.query(
        `INSERT INTO economy_transactions (farm_id, transaction_type, amount, currency, balance_after, description)
         VALUES ($1, 'care_prune', $2, 'EUR', $3, $4)`,
        [farm.id, -cost, newBalance, `Pruned ${def.label} on Plot ${plotIndex + 1}`]
      );

      return { success: true, newBalance, health: newHealth };
    });
  }

  async harvestPlot(userId: string, plotIndex: number) {
    return transaction(async (client) => {
      const { farm, plots } = await this.getFarmWithSimulation(userId);
      const plot = plots.find((p) => p.plot_index === plotIndex);
      if (!plot) throw { statusCode: 404, message: 'Plot not found' };
      const pending = Number(plot.pending_harvest) || 0;
      if (pending <= 0) throw { statusCode: 400, message: 'No yield ready for harvest' };

      const storage = farm.storage_state;
      let storedAmount = 0;
      let spoiledAmount = 0;

      if (storage && storage.built) {
        const availableRoom = Math.max(0, storage.capacity - storage.stored);
        storedAmount = Math.min(pending, availableRoom);
        spoiledAmount = Math.max(0, pending - availableRoom);
        storage.stored = parseFloat((storage.stored + storedAmount).toFixed(2));
      } else {
        // 50% spoilage without storage room
        spoiledAmount = pending * 0.5;
        const netCash = parseFloat((pending * 0.5).toFixed(2));
        farm.money = parseFloat((Number(farm.money) + netCash).toFixed(2));
        await client.query(
          `INSERT INTO economy_transactions (farm_id, transaction_type, amount, currency, balance_after, description)
           VALUES ($1, 'harvest_direct_sale', $2, 'EUR', $3, 'Direct harvest sale (50% spoiled without Storage Room)')`,
          [farm.id, netCash, farm.money]
        );
      }

      await client.query(
        `UPDATE farms SET storage_state = $1, harvest_count = harvest_count + 1, money = $2 WHERE id = $3`,
        [JSON.stringify(storage), farm.money, farm.id]
      );
      await client.query(`UPDATE plots SET pending_harvest = 0 WHERE id = $1`, [plot.id]);

      // Check first_harvest achievement
      await client.query(
        `INSERT INTO achievements (user_id, farm_id, achievement_code)
         VALUES ($1, $2, 'first_harvest')
         ON CONFLICT DO NOTHING`,
        [userId, farm.id]
      );

      return { success: true, storedAmount, spoiledAmount, currentStorage: storage.stored };
    });
  }

  async convertOxygen(userId: string) {
    return transaction(async (client) => {
      const { farm } = await this.getFarmWithSimulation(userId);
      const o2Balance = Number(farm.total_o2) || 0;
      if (o2Balance <= 0) throw { statusCode: 400, message: 'No oxygen available to convert' };

      const euroAmount = parseFloat((o2Balance * O2_RATE).toFixed(2));
      const newMoney = parseFloat((Number(farm.money) + euroAmount).toFixed(2));

      await client.query(
        `UPDATE farms SET total_o2 = 0, money = $1 WHERE id = $2`,
        [newMoney, farm.id]
      );

      await client.query(
        `INSERT INTO economy_transactions (farm_id, transaction_type, amount, currency, balance_after, description)
         VALUES ($1, 'oxygen_conversion', $2, 'EUR', $3, $4)`,
        [farm.id, euroAmount, newMoney, `Converted ${o2Balance.toFixed(1)} O2 units to €${euroAmount.toFixed(2)}`]
      );

      return { success: true, euroAmount, newMoney };
    });
  }

  async buildStorage(userId: string) {
    return transaction(async (client) => {
      const { farm } = await this.getFarmWithSimulation(userId);
      const storage = farm.storage_state;
      if (storage.built || storage.building) throw { statusCode: 400, message: 'Storage Room already exists or is under construction' };
      if (Number(farm.money) < STORAGE_COST) throw { statusCode: 400, message: 'Insufficient funds to build Storage Room' };

      const newBalance = parseFloat((Number(farm.money) - STORAGE_COST).toFixed(2));
      storage.building = true;
      storage.buildHours = 0;

      await client.query(`UPDATE farms SET money = $1, storage_state = $2 WHERE id = $3`, [newBalance, JSON.stringify(storage), farm.id]);
      await client.query(
        `INSERT INTO economy_transactions (farm_id, transaction_type, amount, currency, balance_after, description)
         VALUES ($1, 'build_storage', $2, 'EUR', $3, 'Commissioned Storage Room construction')`,
        [farm.id, -STORAGE_COST, newBalance]
      );

      return { success: true, newBalance };
    });
  }

  async expandStorage(userId: string) {
    return transaction(async (client) => {
      const { farm } = await this.getFarmWithSimulation(userId);
      const storage = farm.storage_state;
      if (!storage.built) throw { statusCode: 400, message: 'Storage Room must be built first' };
      if (storage.expanding) throw { statusCode: 400, message: 'Storage Room expansion already in progress' };

      const cost = STORAGE_EXPAND_BASE_COST + (storage.level || 0) * 200;
      if (Number(farm.money) < cost) throw { statusCode: 400, message: 'Insufficient funds for storage expansion' };

      const newBalance = parseFloat((Number(farm.money) - cost).toFixed(2));
      storage.expanding = true;
      storage.expandHours = 0;

      await client.query(`UPDATE farms SET money = $1, storage_state = $2 WHERE id = $3`, [newBalance, JSON.stringify(storage), farm.id]);
      await client.query(
        `INSERT INTO economy_transactions (farm_id, transaction_type, amount, currency, balance_after, description)
         VALUES ($1, 'expand_storage', $2, 'EUR', $3, 'Initiated Storage Room capacity expansion')`,
        [farm.id, -cost, newBalance]
      );

      return { success: true, newBalance };
    });
  }

  async buildBuilding(userId: string, key: string) {
    return transaction(async (client) => {
      const def = BUILDING_TYPES[key];
      if (!def) throw { statusCode: 400, message: 'Invalid building type' };

      const { farm } = await this.getFarmWithSimulation(userId);
      const buildings = farm.buildings_state;
      if (buildings[key]?.built || buildings[key]?.building) throw { statusCode: 400, message: `${def.label} already built or building` };
      if (Number(farm.money) < def.cost) throw { statusCode: 400, message: `Insufficient funds to construct ${def.label}` };

      const newBalance = parseFloat((Number(farm.money) - def.cost).toFixed(2));
      buildings[key] = { built: false, building: true, buildHours: 0 };
      if (key === 'garden') {
        buildings[key].flowerType = null;
        buildings[key].freshness = 100;
        buildings[key].warnedLow = false;
      } else if (key === 'pond') {
        buildings[key].specialization = null;
        buildings[key].freshness = 100;
        buildings[key].warnedLow = false;
      }

      await client.query(`UPDATE farms SET money = $1, buildings_state = $2 WHERE id = $3`, [newBalance, JSON.stringify(buildings), farm.id]);
      await client.query(
        `INSERT INTO economy_transactions (farm_id, transaction_type, amount, currency, balance_after, description)
         VALUES ($1, 'building_construction', $2, 'EUR', $3, $4)`,
        [farm.id, -def.cost, newBalance, `Commissioned ${def.label} construction`]
      );

      return { success: true, newBalance };
    });
  }

  async setGardenFlower(userId: string, flowerType: string) {
    return transaction(async (client) => {
      const flower = (FLOWER_TYPES as any)[flowerType];
      if (!flower) throw { statusCode: 400, message: 'Invalid flower choice' };

      const { farm } = await this.getFarmWithSimulation(userId);
      const garden = farm.buildings_state.garden;
      if (!garden || !garden.built) throw { statusCode: 400, message: 'Garden must be built first' };
      if (Number(farm.money) < flower.cost) throw { statusCode: 400, message: 'Insufficient funds to plant flower bed' };

      const newBalance = parseFloat((Number(farm.money) - flower.cost).toFixed(2));
      garden.flowerType = flowerType;
      garden.freshness = 100;

      await client.query(`UPDATE farms SET money = $1, buildings_state = $2 WHERE id = $3`, [newBalance, JSON.stringify(farm.buildings_state), farm.id]);
      await client.query(
        `INSERT INTO economy_transactions (farm_id, transaction_type, amount, currency, balance_after, description)
         VALUES ($1, 'garden_planting', $2, 'EUR', $3, $4)`,
        [farm.id, -flower.cost, newBalance, `Planted ${flower.label} in the Garden`]
      );

      return { success: true, newBalance, flowerType };
    });
  }

  async tendGarden(userId: string) {
    return transaction(async (client) => {
      const { farm } = await this.getFarmWithSimulation(userId);
      const garden = farm.buildings_state.garden;
      if (!garden || !garden.built || !garden.flowerType) throw { statusCode: 400, message: 'No planted flowers to tend in the Garden' };
      if (Number(farm.money) < TEND_GARDEN_COST) throw { statusCode: 400, message: 'Insufficient funds to tend garden' };

      const newBalance = parseFloat((Number(farm.money) - TEND_GARDEN_COST).toFixed(2));
      garden.freshness = Math.min(100, garden.freshness + 40);

      await client.query(`UPDATE farms SET money = $1, buildings_state = $2 WHERE id = $3`, [newBalance, JSON.stringify(farm.buildings_state), farm.id]);
      await client.query(
        `INSERT INTO economy_transactions (farm_id, transaction_type, amount, currency, balance_after, description)
         VALUES ($1, 'tend_garden', $2, 'EUR', $3, 'Tended and watered the Garden flowers')`,
        [farm.id, -TEND_GARDEN_COST, newBalance]
      );

      return { success: true, newBalance, freshness: garden.freshness };
    });
  }

  async setPondSpecialization(userId: string, specialization: string) {
    return transaction(async (client) => {
      const spec = POND_SPECIALIZATIONS[specialization];
      if (!spec) throw { statusCode: 400, message: 'Invalid pond specialization' };

      const { farm } = await this.getFarmWithSimulation(userId);
      const pond = farm.buildings_state.pond;
      if (!pond || !pond.built) throw { statusCode: 400, message: 'Pond must be built first' };

      pond.specialization = specialization;
      pond.freshness = 100;

      await client.query(`UPDATE farms SET buildings_state = $1 WHERE id = $2`, [JSON.stringify(farm.buildings_state), farm.id]);

      return { success: true, specialization };
    });
  }

  async feedPond(userId: string) {
    return transaction(async (client) => {
      const { farm } = await this.getFarmWithSimulation(userId);
      const pond = farm.buildings_state.pond;
      if (!pond || !pond.built || !pond.specialization) throw { statusCode: 400, message: 'Pond must be built and stocked first' };

      const spec = POND_SPECIALIZATIONS[pond.specialization];
      if (Number(farm.money) < spec.feedCost) throw { statusCode: 400, message: 'Insufficient funds for pond feed' };

      const newBalance = parseFloat((Number(farm.money) - spec.feedCost).toFixed(2));
      pond.freshness = Math.min(100, pond.freshness + 45);

      await client.query(`UPDATE farms SET money = $1, buildings_state = $2 WHERE id = $3`, [newBalance, JSON.stringify(farm.buildings_state), farm.id]);
      await client.query(
        `INSERT INTO economy_transactions (farm_id, transaction_type, amount, currency, balance_after, description)
         VALUES ($1, 'feed_pond', $2, 'EUR', $3, $4)`,
        [farm.id, -spec.feedCost, newBalance, `Fed animals in the ${spec.label}`]
      );

      return { success: true, newBalance, freshness: pond.freshness };
    });
  }

  async hireWorker(userId: string, workerType: string) {
    return transaction(async (client) => {
      const def = (WORKER_TYPES as any)[workerType];
      if (!def) throw { statusCode: 400, message: 'Unknown worker type' };

      const { farm } = await this.getFarmWithSimulation(userId);
      const insertRes = await client.query(
        `INSERT INTO workers (farm_id, worker_type, daily_wage)
         VALUES ($1, $2, $3)
         RETURNING id, worker_type, daily_wage`,
        [farm.id, workerType, def.wage]
      );

      await client.query(
        `INSERT INTO achievements (user_id, farm_id, achievement_code)
         VALUES ($1, $2, 'first_hire')
         ON CONFLICT DO NOTHING`,
        [userId, farm.id]
      );

      return { success: true, worker: insertRes.rows[0] };
    });
  }

  async assignWorker(userId: string, workerId: number, plotIndex: number | null) {
    return transaction(async (client) => {
      const { farm, plots } = await this.getFarmWithSimulation(userId);
      const workerRes = await client.query(`SELECT id FROM workers WHERE id = $1 AND farm_id = $2`, [workerId, farm.id]);
      if (!workerRes.rowCount || workerRes.rowCount === 0) throw { statusCode: 404, message: 'Worker not found' };

      // If plotIndex specified, ensure no other worker is currently on that plot
      if (plotIndex !== null) {
        await client.query(`UPDATE workers SET assigned_plot_index = NULL WHERE farm_id = $1 AND assigned_plot_index = $2`, [farm.id, plotIndex]);
        await client.query(`UPDATE plots SET assigned_worker_id = NULL WHERE farm_id = $1 AND assigned_worker_id = $2`, [farm.id, workerId]);

        await client.query(`UPDATE workers SET assigned_plot_index = $1 WHERE id = $2`, [plotIndex, workerId]);
        await client.query(`UPDATE plots SET assigned_worker_id = $1 WHERE farm_id = $2 AND plot_index = $3`, [workerId, farm.id, plotIndex]);
      } else {
        await client.query(`UPDATE workers SET assigned_plot_index = NULL WHERE id = $1`, [workerId]);
        await client.query(`UPDATE plots SET assigned_worker_id = NULL WHERE farm_id = $1 AND assigned_worker_id = $2`, [farm.id, workerId]);
      }

      return { success: true };
    });
  }

  async fireWorker(userId: string, workerId: number) {
    return transaction(async (client) => {
      const { farm } = await this.getFarmWithSimulation(userId);
      await client.query(`UPDATE plots SET assigned_worker_id = NULL WHERE farm_id = $1 AND assigned_worker_id = $2`, [farm.id, workerId]);
      await client.query(`DELETE FROM workers WHERE id = $1 AND farm_id = $2`, [workerId, farm.id]);
      return { success: true };
    });
  }

  async takeLoan(userId: string, loanKey: string) {
    return transaction(async (client) => {
      const opt = LOAN_OPTIONS[loanKey];
      if (!opt) throw { statusCode: 400, message: 'Invalid loan package' };

      const { farm } = await this.getFarmWithSimulation(userId);
      if (farm.loan_state && farm.loan_state.balance > 0) throw { statusCode: 400, message: 'You already have an active loan. Repay it before taking another.' };

      const totalRepay = opt.principal * (1 + opt.rate);
      const dailyInstallment = parseFloat((totalRepay / opt.termDays).toFixed(2));
      const loanState = {
        key: loanKey,
        principal: opt.principal,
        totalRepay,
        balance: totalRepay,
        dailyInstallment,
        termDays: opt.termDays,
        daysRemaining: opt.termDays,
        lastPaidDay: Math.floor(farm.game_hour / 24),
      };

      const newBalance = parseFloat((Number(farm.money) + opt.principal).toFixed(2));
      await client.query(`UPDATE farms SET money = $1, loan_state = $2 WHERE id = $3`, [newBalance, JSON.stringify(loanState), farm.id]);
      await client.query(
        `INSERT INTO economy_transactions (farm_id, transaction_type, amount, currency, balance_after, description)
         VALUES ($1, 'loan_disbursement', $2, 'EUR', $3, $4)`,
        [farm.id, opt.principal, newBalance, `Received ${opt.label} principal of €${opt.principal}`]
      );

      return { success: true, newBalance, loan: loanState };
    });
  }

  async repayLoanEarly(userId: string) {
    return transaction(async (client) => {
      const { farm } = await this.getFarmWithSimulation(userId);
      if (!farm.loan_state || farm.loan_state.balance <= 0) throw { statusCode: 400, message: 'No active loan to repay' };

      const balance = Number(farm.loan_state.balance);
      if (Number(farm.money) < balance) throw { statusCode: 400, message: `Insufficient funds to repay loan balance (€${balance})` };

      const newBalance = parseFloat((Number(farm.money) - balance).toFixed(2));
      await client.query(`UPDATE farms SET money = $1, loan_state = NULL WHERE id = $2`, [newBalance, farm.id]);
      await client.query(
        `INSERT INTO economy_transactions (farm_id, transaction_type, amount, currency, balance_after, description)
         VALUES ($1, 'loan_full_repay', $2, 'EUR', $3, 'Early loan repayment in full')`,
        [farm.id, -balance, newBalance]
      );

      return { success: true, newBalance };
    });
  }
}

export const farmService = new FarmService();
