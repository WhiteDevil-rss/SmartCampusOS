import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { runSync, dryRunSync } from '../controllers/firebase-sync.controller';

const router = Router();

// Both endpoints are SUPERADMIN-only
router.use(authenticate, requireRole(['SUPERADMIN']));

/**
 * POST /v1/firebase-sync/run
 * body: SyncOptions (see firebase-sync.service.ts)
 */
router.post('/run', runSync);

/**
 * POST /v1/firebase-sync/dry-run
 * Same as /run but dryRun is forced to true — no writes are performed
 */
router.post('/dry-run', dryRunSync);

export default router;
