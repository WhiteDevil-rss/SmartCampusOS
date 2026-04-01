import { Router } from 'express';
import { triggerCareerAudit, getReadinessIndex, getAuditHistory, getReadinessBreakdown } from '../controllers/career.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/**
 * Career & Industry Readiness Routes
 * Student & Administrative intelligence endpoints.
 */

router.post('/audit', authenticate, triggerCareerAudit);
router.get('/:studentId/readiness', authenticate, getReadinessIndex);
router.get('/:studentId/readiness-breakdown', authenticate, getReadinessBreakdown);
router.get('/:studentId/audit-history', authenticate, getAuditHistory);

export default router;
