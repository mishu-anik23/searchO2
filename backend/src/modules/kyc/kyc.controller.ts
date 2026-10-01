import { Router, Request, Response, NextFunction } from 'express';
import { kycService } from './kyc.service';
import { authenticate, requireAuth } from '../../middleware/auth';

const router = Router();

// POST /api/kyc/webhooks/sumsub (Public webhook endpoint with signature verification)
router.post('/webhooks/sumsub', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const digest = req.headers['x-payload-digest'] as string || '';
    const result = await kycService.handleSumsubWebhook(digest, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.use(authenticate, requireAuth);

// GET /api/kyc/status
router.get('/status', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const status = await kycService.getKycStatus(req.user!.userId);
    res.json({ kyc: status });
  } catch (err) {
    next(err);
  }
});

// POST /api/kyc/initiate (Generate Sumsub WebSDK access token)
router.post('/initiate', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tokenData = await kycService.getOrCreateApplicantToken(req.user!.userId);
    res.json({
      message: 'KYC session initiated. Launch Sumsub WebSDK with applicant token.',
      ...tokenData,
    });
  } catch (err) {
    next(err);
  }
});

export const kycRouter = router;
