import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { getBackups, createSeedBackup, runFactoryReset, restoreAndSync, downloadBackup } from '../controllers/seed-management.controller';

const router = Router();

// All routes require authentication (SUPERADMIN check is enforced inside each controller)
router.get('/backups', authenticate, getBackups);
router.post('/backups', authenticate, createSeedBackup);
router.post('/factory-reset', authenticate, runFactoryReset);
router.post('/restore', authenticate, restoreAndSync);
router.get('/backups/:filename/download', authenticate, downloadBackup);

export default router;
