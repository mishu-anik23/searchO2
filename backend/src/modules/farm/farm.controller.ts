import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { farmService } from './farm.service';
import { authenticate, requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { economyLimiter } from '../../middleware/rateLimiter';

const router = Router();
router.use(authenticate, requireAuth);

const plotParamSchema = z.object({
  plotIndex: z.string().transform((val) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 0 || num > 11) throw new Error('Invalid plot index');
    return num;
  }),
});

const plantSchema = z.object({
  treeType: z.string().min(1),
});

const hireWorkerSchema = z.object({
  workerType: z.enum(['laborer', 'farmer', 'botanist', 'engineer']),
});

const assignWorkerSchema = z.object({
  plotIndex: z.number().min(0).max(11).nullable(),
});

const buildingKeySchema = z.object({
  key: z.enum(['garden', 'pond', 'coffee_shop', 'juice_bar']),
});

const flowerSchema = z.object({
  flowerType: z.enum(['tulips', 'roses', 'sunflowers', 'daisies']),
});

const pondSpecSchema = z.object({
  specialization: z.enum(['fish', 'duck']),
});

const loanSchema = z.object({
  loanKey: z.enum(['small', 'medium', 'mortgage']),
});

// GET /api/farm
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const state = await farmService.getFarmWithSimulation(req.user!.userId);
    res.json(state);
  } catch (err) {
    next(err);
  }
});

// POST /api/farm/plots/:plotIndex/prep
router.post('/plots/:plotIndex/prep', validate({ params: plotParamSchema }), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await farmService.startPrep(req.user!.userId, (req.params as any).plotIndex);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/farm/plots/:plotIndex/clear
router.post('/plots/:plotIndex/clear', validate({ params: plotParamSchema }), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await farmService.startClear(req.user!.userId, (req.params as any).plotIndex);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/farm/plots/:plotIndex/remove-tree
router.post('/plots/:plotIndex/remove-tree', validate({ params: plotParamSchema }), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await farmService.startRemoveTree(req.user!.userId, (req.params as any).plotIndex);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/farm/plots/:plotIndex/plant
router.post('/plots/:plotIndex/plant', validate({ params: plotParamSchema, body: plantSchema }), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await farmService.plantTree(req.user!.userId, (req.params as any).plotIndex, req.body.treeType);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/farm/plots/:plotIndex/water
router.post('/plots/:plotIndex/water', validate({ params: plotParamSchema }), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await farmService.waterPlot(req.user!.userId, (req.params as any).plotIndex);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/farm/plots/:plotIndex/prune
router.post('/plots/:plotIndex/prune', validate({ params: plotParamSchema }), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await farmService.prunePlot(req.user!.userId, (req.params as any).plotIndex);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/farm/plots/:plotIndex/harvest
router.post('/plots/:plotIndex/harvest', economyLimiter, validate({ params: plotParamSchema }), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await farmService.harvestPlot(req.user!.userId, (req.params as any).plotIndex);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/farm/convert-o2
router.post('/convert-o2', economyLimiter, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await farmService.convertOxygen(req.user!.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/farm/storage/build
router.post('/storage/build', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await farmService.buildStorage(req.user!.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/farm/storage/expand
router.post('/storage/expand', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await farmService.expandStorage(req.user!.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/farm/buildings/:key/build
router.post('/buildings/:key/build', validate({ params: buildingKeySchema }), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await farmService.buildBuilding(req.user!.userId, req.params.key);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/farm/buildings/garden/flower
router.post('/buildings/garden/flower', validate({ body: flowerSchema }), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await farmService.setGardenFlower(req.user!.userId, req.body.flowerType);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/farm/buildings/garden/tend
router.post('/buildings/garden/tend', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await farmService.tendGarden(req.user!.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/farm/buildings/pond/specialization
router.post('/buildings/pond/specialization', validate({ body: pondSpecSchema }), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await farmService.setPondSpecialization(req.user!.userId, req.body.specialization);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/farm/buildings/pond/feed
router.post('/buildings/pond/feed', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await farmService.feedPond(req.user!.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/farm/workers/hire
router.post('/workers/hire', validate({ body: hireWorkerSchema }), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await farmService.hireWorker(req.user!.userId, req.body.workerType);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/farm/workers/:workerId/assign
router.post('/workers/:workerId/assign', validate({ body: assignWorkerSchema }), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const workerId = parseInt(req.params.workerId, 10);
    const result = await farmService.assignWorker(req.user!.userId, workerId, req.body.plotIndex);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/farm/workers/:workerId/fire
router.post('/workers/:workerId/fire', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const workerId = parseInt(req.params.workerId, 10);
    const result = await farmService.fireWorker(req.user!.userId, workerId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/farm/bank/loan
router.post('/bank/loan', economyLimiter, validate({ body: loanSchema }), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await farmService.takeLoan(req.user!.userId, req.body.loanKey);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/farm/bank/repay
router.post('/bank/repay', economyLimiter, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await farmService.repayLoanEarly(req.user!.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export const farmRouter = router;
