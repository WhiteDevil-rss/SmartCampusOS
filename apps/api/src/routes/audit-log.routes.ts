import { Router } from 'express';
import { getAuditLogs, exportAuditLogs } from '../controllers/audit-log.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Only Super Admins can see system-wide logs
// In development, allow anonymous access for easier debugging
if (process.env.NODE_ENV !== 'development') {
    router.use(authenticate);
    // Remove strict SUPERADMIN requirement to allow hierarchical access as per PRD
    // Controller handles the level-based visibility
}

router.get('/', getAuditLogs);
router.get('/export', exportAuditLogs);

export default router;
