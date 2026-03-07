import { Router } from 'express';
import { publishResultToChain, verifyPublicResult } from '../controllers/verification.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Public verification portal
router.get('/v2/public/verify', verifyPublicResult);

// Admin action to publish result to immutable ledger
router.post('/v2/verification/publish/:resultId', authenticate, requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN']), publishResultToChain);

export default router;
