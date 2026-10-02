import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { cryptoService, BASE_AFC_CONFIG } from './crypto.service';
import { authenticate, requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validation';

const router = Router();

// GET /api/crypto/config (Public chain and token metadata)
router.get('/config', (req: Request, res: Response): void => {
  res.json({
    chain: BASE_AFC_CONFIG,
    accountAbstraction: {
      standard: 'ERC-4337 v0.6',
      supportedWallets: ['Privy Embedded MPC', 'Biconomy Smart Account', 'MetaMask'],
      gaslessSponsored: true,
    },
  });
});

router.use(authenticate, requireAuth);

// GET /api/crypto/wallet
router.get('/wallet', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const wallet = await cryptoService.getUserWallet(req.user!.userId);
    res.json(wallet);
  } catch (err) {
    next(err);
  }
});

// POST /api/crypto/wallet/bind
const bindWalletSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Must be a valid 40-character EVM address'),
});

router.post(
  '/wallet/bind',
  validate({ body: bindWalletSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await cryptoService.bindUserWallet(req.user!.userId, req.body.address);
      res.json({ message: 'EVM wallet address bound successfully.', wallet: result });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/crypto/sponsor-userop
router.post(
  '/sponsor-userop',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userOp = req.body.userOp;
      if (!userOp || !userOp.sender) {
        res.status(400).json({ error: 'Valid UserOperation object is required.' });
        return;
      }
      const sponsorResult = await cryptoService.sponsorGaslessUserOp(req.user!.userId, userOp);
      res.json(sponsorResult);
    } catch (err) {
      next(err);
    }
  }
);

export const cryptoRouter = router;
